'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const dir = path.resolve(__dirname, '../public/games/bioquest-guardians-of-life');
const key = 'bioquest.guardians.grade4.v1';
const server = http.createServer((req, res) => {
  const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  const file = path.resolve(dir, name);
  if (!file.startsWith(dir + path.sep) || !fs.existsSync(file)) return res.writeHead(404).end();
  res.setHeader(
    'content-type',
    { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp' }[
      path.extname(file)
    ] || 'application/octet-stream'
  );
  res.end(fs.readFileSync(file));
});
async function checkSurvey(p, id, tap, keyboard = false) {
  const e = await p.evaluate((id) => BioFieldwork.entries[id], id);
  const stage = p.locator('#survey-stage');
  await stage.locator('.scan-base').evaluate((img) => img.decode());
  await stage.scrollIntoViewIfNeeded();
  const bounds = await stage.boundingBox();
  const point = async (x, y) => {
    const args = [bounds.x + (bounds.width * x) / 100, bounds.y + (bounds.height * y) / 100];
    if (tap) await p.touchscreen.tap(...args);
    else await p.mouse.click(...args);
  };
  await point(2, 2);
  await p.locator('#scan').click();
  assert.match(await p.locator('#scan-feedback').innerText(), /No match/);
  assert.equal(await p.locator('#survey-done').isVisible(), false);
  if (keyboard) {
    await p.locator('#guide').click();
    await stage.focus();
    await p.keyboard.press('ArrowLeft');
    await p.keyboard.press('Enter');
  } else {
    await point(e.x, e.y);
    await p.locator('#scan').click();
  }
  assert.match(await p.locator('#scan-feedback').innerText(), new RegExp(e.label));
  assert.equal(
    await p.evaluate(([k, id]) => JSON.parse(localStorage.getItem(k)).observations.includes(id), [key, id]),
    true
  );
  if (process.env.BIOQUEST_SCREENSHOTS && id === 'kit-pollinator') {
    await p
      .locator('.survey')
      .screenshot({
        path: path.join(process.env.BIOQUEST_SCREENSHOTS, 'lens-' + p.viewportSize().width + '.png')
      });
  }
  await p.locator('#survey-done').click();
}
(async () => {
  let b;
  try {
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
    b = await chromium.launch({
      headless: true,
      executablePath: process.env.CHROME_BIN,
      args: ['--no-sandbox']
    });
    for (const [width, height, touch] of [
      [390, 844, true],
      [1280, 800, false]
    ]) {
      const c = await b.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
      const p = await c.newPage(),
        errors = [];
      p.on('pageerror', (e) => errors.push(e.message));
      await p.goto('http://127.0.0.1:' + server.address().port);
      assert.equal(await p.locator('#hero-scene img').getAttribute('src'), 'thumb.webp');
      const img = await p.locator('#hero-scene img').evaluate(async (el) => {
        await el.decode();
        return el.naturalWidth;
      });
      assert.equal(img, 1200);
      if (process.env.BIOQUEST_SCREENSHOTS) {
        fs.mkdirSync(process.env.BIOQUEST_SCREENSHOTS, { recursive: true });
        await p.screenshot({
          path: path.join(process.env.BIOQUEST_SCREENSHOTS, 'field-journal-' + width + '.png')
        });
      }
      await p.locator('#continue').click();
      if (process.env.BIOQUEST_SCREENSHOTS) {
        await p.locator('.brief-art .scene-image').evaluate((img) => img.decode());
        await p
          .locator('.brief')
          .screenshot({ path: path.join(process.env.BIOQUEST_SCREENSHOTS, 'mission-' + width + '.png') });
      }
      await p.locator('#survey-site').click();
      await checkSurvey(p, 'living', touch, !touch);
      assert.equal(
        await p
          .locator('#specimen')
          .innerText()
          .then((s) => s.includes('Growing sunflower')),
        true
      );
      // Drag the actual sample, including a failed drop and a successful one.
      const sample = p.locator('#specimen');
      assert.ok(
        await sample.locator('img').evaluate(async (img) => {
          await img.decode();
          return img.naturalWidth >= 120;
        })
      );
      await sample.scrollIntoViewIfNeeded();
      const drag = async (label) => {
        const r = await sample.boundingBox(),
          d = await p.getByRole('button', { name: label, exact: true }).boundingBox();
        const a = { x: r.x + r.width / 2, y: r.y + r.height / 2 },
          z = { x: d.x + d.width / 2, y: d.y + d.height / 2 };
        if (!touch) {
          await p.mouse.move(a.x, a.y);
          await p.mouse.down();
          await p.mouse.move(z.x, z.y, { steps: 6 });
          await p.mouse.up();
          return;
        }
        const cd = await c.newCDPSession(p);
        for (const [type, points] of [
          ['touchStart', [a]],
          ['touchMove', [z]],
          ['touchEnd', []]
        ])
          await cd.send('Input.dispatchTouchEvent', { type, touchPoints: points });
        await cd.detach();
      };
      await drag('Non-living');
      assert.match(await p.locator('#feedback').innerText(), /Pip’s clue/);
      await drag('Living');
      assert.equal(await p.locator('#next').isVisible(), true);
      await p.reload();
      await p.locator('#continue').click();
      assert.match(await sample.innerText(), /Rock/);
      await p.locator('#task-survey').click();
      await p.locator('#exit-survey').click();
      assert.match(await sample.innerText(), /Rock/);
      await p.locator('#back').click();
      for (const id of ['kit-pollinator', 'kit-cells', 'kit-fossil']) {
        const label = await p.evaluate((id) => BioFieldwork.entries[id].label, id);
        await p.locator('.study-card').filter({ hasText: label }).click();
        await checkSurvey(p, id, touch, !touch);
      }
      await p.reload();
      assert.match(await p.locator('#notes-count').innerText(), /4 \/ 38/);
      assert.equal(await p.locator('#field-notes li').count(), 4);
      await p.locator('.study-card').first().click();
      await p.locator('#guide').click();
      await p.locator('#scan').click();
      await p.locator('#survey-done').click();
      assert.equal(await p.locator('#field-notes li').count(), 4, 'replay cannot duplicate a field note');
      assert.deepEqual(errors, []);
      await c.close();
      console.log(
        width +
          'px: cover, survey, miss, correct scan, sample drop, saved progress and three lens studies passed.'
      );
    }
  } finally {
    await b?.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
