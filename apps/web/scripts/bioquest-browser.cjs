'use strict';
// Real-browser regressions. Run with an isolated Playwright install via PLAYWRIGHT_PATH.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../public');
const key = 'bioquest.guardians.grade4.v1';
const errors = [];
let browser;
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
  try {
    res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : file.endsWith('.css') ? 'text/css' : /\.m?js$/.test(file) ? 'text/javascript' : 'application/octet-stream');
    res.end(fs.readFileSync(file));
  } catch { res.writeHead(404).end(); }
});
async function fit(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'horizontal overflow');
  for (const el of await page.locator('button:visible').all()) {
    const box = await el.boundingBox();
    assert.ok(box.x >= -1 && box.x + box.width <= (await page.evaluate(() => innerWidth)) + 1, 'button clipped horizontally');
    assert.ok(box.height >= 43, 'touch target shorter than 44px');
  }
}
async function screenshot(page, name) {
  if (!process.env.BIOQUEST_SCREENSHOTS) return;
  fs.mkdirSync(process.env.BIOQUEST_SCREENSHOTS, { recursive: true });
  await page.screenshot({ path: path.join(process.env.BIOQUEST_SCREENSHOTS, name + '.png'), fullPage: true });
}
async function saved(page) { return page.evaluate(k => JSON.parse(localStorage.getItem(k)), key); }
async function answer(page, label) {
  await page.getByRole('button', { name: label, exact: true }).click();
  assert.equal(await page.locator('#choices button:enabled').count(), 0);
  assert.equal(await page.locator('#feedback.success').count(), 1);
  await page.locator('#next').click();
}
async function campaign(page, grade) {
  await page.locator('#grade' + grade).click();
  const missions = await page.evaluate(g => g === 4 ? window.BIOQUEST_MISSIONS : window['BIOQUEST_GRADE' + g], grade);
  await page.locator('#continue').click(); await page.locator('#start').click();
  for (let mi = 0; mi < missions.length; mi++) {
    for (const t of missions[mi].tasks) {
      await fit(page);
      if (grade === 9) await screenshot(page, `grade9-mission${mi+1}-task${missions[mi].tasks.indexOf(t)+1}-${page.viewportSize().width}x${page.viewportSize().height}`);
      await page.locator('#hint').click();
      assert.equal(await page.locator('#hint-text').isVisible(), true);
      const labels = t.kind === 'sort' ? t.items.map(i => i.group) : t.kind === 'sequence' ? t.order : [t.options[t.answer]];
      for (const label of labels) await answer(page, label);
    }
    assert.equal(await page.locator('.complete').count(), 1);
    if (grade === 9 && mi === missions.length - 1) await screenshot(page, `finale-${page.viewportSize().width}x${page.viewportSize().height}`);
    if (mi < missions.length - 1) { await page.locator('#next-mission').click(); await page.locator('#start').click(); }
  }
  const s = await saved(page);
  assert.equal(missions.every(m => s.completed.includes(m.id)), true);
  assert.equal(s.checkpoints[grade], undefined);
  await page.locator('#journal').click();
  assert.equal(await page.locator('#progress').textContent(), '5 / 5 restored');
  // Replay starts at the beginning and cannot delete the completion record.
  await page.locator('.mission-card').first().click(); await page.locator('#start').click();
  assert.match(await page.locator('.question-top').textContent(), /INVESTIGATION 1/);
  await page.locator('#back').click();
  assert.equal(await page.locator('#progress').textContent(), '5 / 5 restored');
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_BIN, args: ['--no-sandbox'] });
  const url = `http://127.0.0.1:${server.address().port}/games/bioquest-guardians-of-life/index.html`;
  for (const [width, height] of [[320, 568], [390, 844], [844, 390], [1440, 900]]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 1000, isMobile: width < 1000 });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto(url); await fit(page); await page.locator('#grade9').click();
    assert.equal(await page.locator('#grade9').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.mission-card:disabled').count(), 4);
    if (width <= 560) {
      const art = await page.locator('.hero-art').boundingBox();
      const copy = await page.locator('.hero-content').boundingBox();
      assert.ok(art.y + art.height <= copy.y + 1, 'phone hero art overlaps reading area');
    }
    await screenshot(page, `home-${width}x${height}`);
    await page.locator('#continue').click(); await fit(page); await screenshot(page, `intro-${width}x${height}`); await page.locator('#back').click();
    // Cancelling an introduction must not create a checkpoint.
    assert.equal((await saved(page)).checkpoints[9], undefined);
    await page.locator('#continue').click(); await page.locator('#start').click(); await fit(page);
    const firstTask = await page.evaluate(() => window.BIOQUEST_GRADE9[0].tasks[0]);
    const firstLabels = firstTask.kind === 'sort' ? firstTask.items.map(i => i.group) : firstTask.kind === 'sequence' ? firstTask.order : [firstTask.options[firstTask.answer]];
    const choices = firstTask.kind === 'sort' ? firstTask.groups : firstTask.options;
    await page.getByRole('button', { name: choices.find(x => x !== firstLabels[0]), exact: true }).click();
    assert.match(await page.locator('#feedback').textContent(), /Not quite/);
    await page.locator('#hint').click(); await screenshot(page, `task-${width}x${height}`);
    // Repeated correct events must advance only one specimen.
    await page.getByRole('button', { name: firstLabels[0], exact: true }).evaluate(b => { b.click(); b.click(); });
    assert.equal((await saved(page)).checkpoints[9].item, 1);
    assert.equal((await saved(page)).checkpoints[9].mistakes, 1);
    await page.setViewportSize({width:height,height:width}); await fit(page);
    await page.setViewportSize({width,height}); await fit(page);
    await page.reload(); await page.locator('#continue').click();
    assert.equal((await saved(page)).checkpoints[9].item, 1);
    await page.locator('#back').click(); await page.locator('#grade4').click();
    await page.locator('#continue').click(); await page.locator('#start').click();
    await page.locator('#back').click(); await page.locator('#grade5').click();
    await page.locator('#continue').click(); await page.locator('#start').click();
    await page.locator('#back').click(); await page.locator('#grade6').click();
    await page.locator('#continue').click(); await page.locator('#start').click();
    for (const grade of [7, 8]) { await page.locator('#back').click(); await page.locator('#grade'+grade).click(); await page.locator('#continue').click(); await page.locator('#start').click(); }
    await page.locator('#back').click(); await page.locator('#grade9').click();
    await page.locator('#continue').click(); assert.equal((await saved(page)).checkpoints[9].item, 1);
    assert.deepEqual(Object.keys((await saved(page)).checkpoints).sort(), ['4', '5', '6', '7', '8', '9']);
    await page.locator('#back').click();
    await page.locator('#sound').click();
    assert.equal(await page.locator('#sound').getAttribute('aria-label'), 'Turn sound off');
    await page.waitForTimeout(500); await page.locator('#sound').click();
    assert.equal((await saved(page)).sound, false);
    if (await page.locator('#fullscreen').isVisible()) {
      await page.locator('#fullscreen').click(); await page.waitForFunction(() => !!document.fullscreenElement);
      await fit(page); await page.locator('#fullscreen').click(); await page.waitForFunction(() => !document.fullscreenElement);
    }
    // A fresh save permits a complete campaign without using unlock shortcuts.
    await page.evaluate(k => localStorage.removeItem(k), key); await page.reload();
    await campaign(page, 7);
    await campaign(page, 8);
    await campaign(page, 9);
    if (width === 1440) { await campaign(page, 4); await campaign(page, 5); await campaign(page, 6); }
    await screenshot(page, `completed-${width}x${height}`);
    console.log(`${width}x${height}: Grades 7, 8 and 9 campaigns, hints, retry, repeated answer, reload, grade saves, replay, fullscreen and audio controls passed`);
    await context.close();
  }
  for (const mode of ['read-denied', 'write-denied', 'malformed']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.addInitScript(({ mode, key }) => {
      if (mode === 'malformed') localStorage.setItem(key, '{invalid');
      else Object.defineProperty(window, 'localStorage', { value: {
        getItem() { if (mode === 'read-denied') throw new Error('blocked'); return null; },
        setItem() { throw new Error('quota'); }
      } });
    }, { mode, key });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    await page.goto(url); await page.locator('#grade9').click(); await page.locator('#continue').click(); await page.locator('#start').click();
    const label = await page.evaluate(() => { const t=window.BIOQUEST_GRADE9[0].tasks[0]; return t.kind==='sort'?t.items[0].group:t.kind==='sequence'?t.order[0]:t.options[t.answer]; });
    await answer(page, label); assert.match(await page.locator('.question-top').textContent(), /(?:DISCOVERY|STEP) 2/);
    await page.locator('#back').click(); await page.locator('#grade5').click(); await page.locator('#grade9').click(); await page.locator('#continue').click();
    assert.match(await page.locator('.question-top').textContent(), /(?:DISCOVERY|STEP) 2/);
    console.log(`${mode}: playable, in-memory checkpoint retained across grade switches`); await context.close();
  }
  assert.deepEqual(errors, []); console.log('No uncaught browser errors. Grade 4/5/6 full desktop campaigns passed. Physical devices and audio listening are not covered.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); server.close(); });
