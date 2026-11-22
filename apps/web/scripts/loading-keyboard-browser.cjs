const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const path = require('node:path');
const base = 'http://127.0.0.1:3027';
let server, browser;
(async () => {
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '-p', '3027'], {
    cwd: path.resolve(__dirname, '..'), env: { ...process.env, DATABASE_URL: '' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Local server readiness timeout')), 20000);
    server.on('error', () => { clearTimeout(timer); reject(Error('Local server start failed')); });
    server.on('exit', () => { clearTimeout(timer); reject(Error('Local server exited')); });
    server.stdout.on('data', data => { if (data.toString().includes('Ready')) { clearTimeout(timer); resolve(); } });
    server.stderr.resume();
  });
  browser = await chromium.launch({ headless: true, channel: 'chrome', chromiumSandbox: true });
  for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
    const context = await browser.newContext({ viewport: { width, height } });
    await context.route('**/*', route => {
      const u = new URL(route.request().url());
      if (u.origin !== base) return route.abort();
      if (u.pathname.startsWith('/api/')) return route.fulfill({status: 401, contentType: 'application/json', body: '{"user":null}'});
      return route.continue();
    });
    const page = await context.newPage(), badThumbs = [];
    page.on('response', response => { if (/\/thumb\./.test(response.url()) && response.status() >= 400) badThumbs.push(response.status()); });
    assert.equal((await page.goto(base + '/games')).status(), 200);
    const previews = page.locator('img[src*="/thumb."]');
    assert.equal(await previews.count(), 24);
    for (const img of await previews.all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el => el.decode());
      assert.equal(await img.evaluate(el => el.complete && el.naturalWidth > 0), true);
    }
    assert.deepEqual(badThumbs, [], 'First-choice thumbnails must not require failed requests');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Library fits viewport');
    await page.goto(base + '/play/recycle-rush');
    const header = page.locator('.wgaHeader'), brand = page.locator('.wgaBrand');
    await page.waitForTimeout(1900);
    await brand.focus();
    await page.waitForTimeout(250);
    assert.ok(await brand.evaluate(el => el.getBoundingClientRect().top >= 0), 'Focused header link stays visible');
    if (width < 861) {
      const panel = page.locator('#wga-mobile-navigation'), toggle = page.getByRole('button', { name: 'Open menu', exact: true });
      assert.equal(await panel.isVisible(), false);
      await panel.locator('a').first().evaluate(el => el.focus());
      assert.equal(await panel.evaluate(el => el.contains(document.activeElement)), false, 'Closed menu excludes links from focus');
      await toggle.focus(); await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('#wga-mobile-navigation').hidden === false);
      assert.equal(await panel.isVisible(), true);
      await panel.locator('a').first().focus();
      await page.keyboard.press('Escape');
      assert.equal(await panel.isVisible(), false);
      assert.equal(await page.getByRole('button', {name: 'Open menu', exact: true}).evaluate(el => el === document.activeElement), true);
    }
    console.log(`PASS ${width}x${height}: 24 decoded thumbnails without failed probes, viewport fit and visible keyboard navigation`);
    await context.close();
  }
})().catch(error => { console.error('FAIL loading/keyboard acceptance: ' + error.message); process.exitCode = 1; })
.finally(async () => { await browser?.close(); server?.kill(); });
