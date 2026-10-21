/* Optional real-browser QA: PLAYWRIGHT_MODULE=/path/to/playwright-core CHROMIUM_EXECUTABLE=/path/to/chrome node apps/web/scripts/cyber-shield-browser.cjs */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const root = path.resolve(__dirname, '../public');
const output = process.env.CYBER_QA_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(), 'cyber-shield-qa-'));
fs.mkdirSync(output, { recursive: true });
const { campaign } = require('./helpers/cyber-runtime.cjs');
const newChapters = require('../public/games/cyber-shield-academy/cyber-campaign.js').chapters;
const server = http.createServer((req, res) => {
  const route = decodeURIComponent(req.url.split('?')[0]);
  const file = path.resolve(root, '.' + route, route.endsWith('/') ? 'index.html' : '');
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const data = fs.readFileSync(file);
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' })[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  } catch { res.writeHead(404).end(); }
});
(async () => {
  let browser;
  const results = [];
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    for (const [width, height, touch] of [[320, 568, true], [390, 844, true], [844, 390, true], [768, 1024, true], [1024, 768, true], [1160, 700, false], [1280, 600, false], [1440, 900, false]]) {
      console.log(`Checking ${width}x${height}`);
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('requestfailed', request => errors.push(`${request.url()} ${request.failure()?.errorText}`));
      page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      const activate = async selector => touch ? page.locator(selector).tap() : page.locator(selector).click();
      const command = async value => {
        await page.locator('#cmdInput').fill(value);
        await activate('#terminalForm button');
      };
      const bounds = async selector => {
        const box = await page.locator(selector).boundingBox();
        assert.ok(box && box.width > 0 && box.height > 0, `${width}x${height}: ${selector} visible`);
        assert.ok(box.x >= -1 && box.x + box.width <= width + 1 && box.y >= -1 && box.y + box.height <= page.viewportSize().height + 1, `${width}x${height}: ${selector} fits ${JSON.stringify(box)}`);
      };
      const noOverflow = async () => {
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight + 1), `${width}x${height}: page overflow`);
      };
      await page.goto(`http://127.0.0.1:${server.address().port}/games/cyber-shield-academy/?scores=0`);
      await page.waitForFunction(() => window.__wgaGameTab);
      await page.screenshot({ path: path.join(output, `${width}-${height}-welcome.png`) });
      await bounds('#overlayStartBtn'); await bounds('#overlayPracticeBtn');
      await activate('#overlayStartBtn');
      await noOverflow(); await bounds('#cmdInput'); await bounds('#terminalForm button');
      assert.equal(await page.locator('#cmdInput').evaluate(el => getComputedStyle(el).fontSize), '16px');
      const compact = width <= 1160;
      if (compact) {
        for (const name of ['mission', 'network', 'files', 'tools', 'terminal']) {
          await activate(`#tab-${name}`); await bounds(`#panel-${name}`); await noOverflow();
          assert.equal(await page.locator('[role="tabpanel"]:visible').count(), 1);
          if (width === 390 && ['mission', 'network'].includes(name)) await page.screenshot({ path: path.join(output, `${width}-${height}-${name}.png`) });
        }
        await page.locator('#tab-terminal').focus(); await page.keyboard.press('ArrowRight');
        assert.equal(await page.locator('#tab-mission').getAttribute('aria-selected'), 'true');
        await activate('#tab-files');
      }
      await activate('#fileTree button[aria-label="Read /home/cadet/briefing.txt: insert command"]');
      assert.equal(await page.locator('#cmdInput').inputValue(), 'cat /home/cadet/briefing.txt');
      await command('ls');
      await page.locator('#cmdInput').fill('cat bri'); await activate('#completeBtn');
      assert.equal(await page.locator('#cmdInput').inputValue(), 'cat briefing.txt ');
      await page.locator('#cmdInput').press('Shift+Tab');
      assert.equal(await page.locator('#cmdInput').evaluate(el => el === document.activeElement), false);
      await activate('#previousBtn'); assert.equal(await page.locator('#cmdInput').inputValue(), 'ls');
      await activate('#nextBtn'); assert.equal(await page.locator('#cmdInput').inputValue(), '');
      if (width === 390) {
        const strip = await page.locator('.command-help').boundingBox();
        const cdp = await context.newCDPSession(page);
        const y = strip.y + strip.height / 2;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 340, y }] });
        for (let x = 300; x >= 60; x -= 40) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForFunction(() => document.querySelector('.command-help').scrollLeft > 30);
        await cdp.detach();
        await page.waitForTimeout(200); // Let touch-scroll momentum finish before the next gesture.
        await page.locator('#completeBtn').scrollIntoViewIfNeeded();
      }
      await activate('#caseActions summary');
      await page.screenshot({ path: path.join(output, `${width}-${height}-controls.png`) });
      assert.equal(await page.locator('#caseActions').evaluate(el => el.open), true);
      if (await page.locator('.wga-tab-fullscreen').count()) {
        assert.equal(await page.locator('#caseMenu .wga-tab-fullscreen').count(), 1);
        await activate('#caseMenu .wga-tab-fullscreen');
        await page.waitForFunction(() => document.fullscreenElement);
        await activate('#caseMenu .wga-tab-fullscreen');
        await page.waitForFunction(() => !document.fullscreenElement);
      }
      await activate('#caseActions summary');
      // Exercise a reduced visible area as a keyboard-resize approximation, without changing state.
      if (width === 390) {
        await page.locator('#cmdInput').focus();
        await page.setViewportSize({ width, height: 360 });
        await page.waitForFunction(() => document.querySelector('.app').getBoundingClientRect().height <= 361);
        await bounds('#cmdInput'); await bounds('#terminalForm button'); await bounds('#completeBtn');
        await page.screenshot({ path: path.join(output, '390-keyboard-area.png') });
        await page.setViewportSize({ width, height });
        await page.waitForFunction(() => document.querySelector('.app').getBoundingClientRect().height >= 840);
      }
      const completeCase = width === 320 || width === 390 || width === 844 || width === 1440;
      if (completeCase) {
        for (const [index, commands] of campaign.entries()) {
          assert.equal(await page.locator('#levelValue').textContent(), String(index + 1));
          if (index === 6 && width === 390) {
            const baseline = await page.locator('#scoreValue').textContent();
            await command('connect orchid-relay'); await command('run LogAudit');
            const partial = await page.locator('#scoreValue').textContent();
            await page.reload(); await page.waitForFunction(() => window.__wgaGameTab);
            assert.equal(await page.locator('#overlayStartBtn').textContent(), 'Continue Investigation');
            await activate('#overlayStartBtn'); assert.equal(await page.locator('#scoreValue').textContent(), partial);
            await activate('#caseActions summary');
            page.once('dialog', dialog => dialog.accept()); await activate('#retryBtn');
            assert.equal(await page.locator('#scoreValue').textContent(), baseline);
            assert.equal(await page.locator('#levelValue').textContent(), '7');
            await activate('#caseActions summary'); await page.locator('#practiceSelect').selectOption('6');
            await activate('#startPracticeBtn'); assert.match(await page.locator('#sessionLabel').textContent(), /Untimed/);
            const bridgeBefore = await page.evaluate(() => window.__wgaGameTab.scoreBridge.state().best);
            for (const value of campaign[6]) await command(value);
            assert.equal(await page.locator('#levelValue').textContent(), '7');
            assert.equal(await page.locator('#traceValue').textContent(), 'Off');
            assert.equal(await page.evaluate(() => window.__wgaGameTab.scoreBridge.state().best), bridgeBefore);
            await page.reload(); await page.waitForFunction(() => window.__wgaGameTab); await activate('#overlayStartBtn');
            assert.match(await page.locator('#sessionLabel').textContent(), /Untimed/);
            await activate('#caseActions summary'); await activate('#returnCampaignBtn');
            assert.equal(await page.locator('#scoreValue').textContent(), baseline);
          }
          for (const value of commands) {
            if (value.startsWith('decide ')) {
              const chapter = newChapters.find(c => c.id === index + 1);
              const label = chapter.decision.choices.find(([id]) => id === value.slice(7))[1];
              if (compact) await activate('#tab-mission');
              const choice = page.getByRole('button', { name: label, exact: true });
              if (touch) await choice.tap(); else await choice.click();
              if (compact) await activate('#tab-terminal');
            } else await command(value);
          }
          if (index === 11 && width === 1440) {
            const score = await page.locator('#scoreValue').textContent();
            await page.reload(); await page.waitForFunction(() => window.__wgaGameTab); await activate('#overlayStartBtn');
            assert.equal(await page.locator('#scoreValue').textContent(), score);
            assert.equal(await page.locator('#levelValue').textContent(), '13');
          }
          if (index === 8 && width === 390) {
            await activate('#tab-mission'); await page.screenshot({ path: path.join(output, '390-beacon-mission.png') }); await activate('#tab-terminal');
          }
        }
        assert.match(await page.locator('#terminalOutput').textContent(), /ACADEMY COMPLETE/);
        const score = await page.locator('#scoreValue').textContent();
        await command('submit report'); assert.equal(await page.locator('#scoreValue').textContent(), score);
        assert.equal(await page.evaluate(() => window.__wgaGameTab.scoreBridge.state().best), Number(score));
        await activate('#caseActions summary');
        page.once('dialog', dialog => dialog.dismiss()); await activate('#resetBtn');
        assert.equal(await page.locator('#scoreValue').textContent(), score);
        page.once('dialog', dialog => dialog.accept()); await activate('#resetBtn');
        assert.equal(await page.locator('#levelValue').textContent(), '1');
        assert.equal(await page.locator('#scoreValue').textContent(), '0');
        await page.reload(); await page.waitForFunction(() => window.__wgaGameTab); await activate('#overlayStartBtn');
        assert.equal(await page.locator('#levelValue').textContent(), '1');
      }
      await noOverflow(); await page.screenshot({ path: path.join(output, `${width}-${height}-play.png`) });
      assert.deepEqual(errors, [], `${width}x${height}: browser errors`);
      results.push({ width, height, touch, completeCase, errors });
      await context.close();
    }
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify({ passed: results.length, completeCases: results.filter(r => r.completeCase).length, output, results }));
  } finally { await browser?.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
