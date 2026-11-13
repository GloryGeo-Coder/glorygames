// Assign a workplace through the game UI; the worker must travel, work, and return home.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function workShift(browser, mobile) {
  const base = '../public/games/brick-playground-3d/';
  const { world } = await import(base + 'model.mjs');
  const { citySave } = await import(base + 'settlement.mjs');
  const { entrance } = await import(base + 'resident-trip.mjs');
  const city = world('city');
  const home = { id: 'work-home', type: 'door', color: 'Lagoon', x: -13, y: 0, z: 4, r: 0 };
  const office = { id: 'work-office', type: 'door', color: 'Sun', x: 11, y: 0, z: 4, r: 0 };
  // A real collision obstacle across the doorway's approach, not a mocked stopped state.
  const obstruction = { id: 'work-obstruction', type: 'wall', color: 'Plum', x: 11, y: 0, z: 3, r: 0 };
  city.pieces = [home, office, obstruction];
  city.streets = ['h-3-4', 'h-4-4'];
  city.transport = { pickup: 'h-3-4', dropoff: 'h-4-4', stage: 2 };
  const target = entrance(office).inside;
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
    isMobile: mobile, hasTouch: mobile
  });
  try {
    await ctx.addInitScript(raw => {
      const key = 'wga.brick-playground.v1.city';
      if (!localStorage.getItem(key)) {
        localStorage.setItem('wga.brick.active', 'city');
        localStorage.setItem(key, raw);
      }
    }, citySave(city));
    const page = await ctx.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const tap = id => mobile ? page.locator('#' + id).tap() : page.locator('#' + id).click();
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const cargo = async () => assert.deepEqual((await saved()).transport, city.transport, 'work shifts preserve loaded cargo');
    const state = text => page.waitForFunction(text => document.querySelector('#resState').textContent.includes(text), text, { timeout: 150000 });
    const ready = () => page.locator('#tray button').first().waitFor();
    const photo = async name => {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({ path: path.join(process.env.BRICK_SCREENSHOTS, `work-${name}-${mobile ? 'phone' : 'desktop'}.png`) });
    };
    await page.goto((process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d');
    await ready();
    await tap('resSettings');
    await page.locator('#resHousehold').selectOption('new');
    await page.locator('#resName').fill('Zola');
    await page.locator('#resHome').selectOption(home.id);
    await page.locator('#resVisit').selectOption('work');
    await page.locator('#resShop').selectOption(office.id);
    await page.locator('#resSchedule').selectOption('8');
    await page.locator('#resWorkEnd').selectOption('17');
    await tap('resStart');
    await state('Zola · At home');
    let data = await saved();
    assert.equal(data.family1.work.startHour, 8);
    assert.equal(data.family1.work.endHour, 17);
    assert.equal(data.family1.work.completed, 0);
    await cargo();
    await tap('resSkip');
    await tap('resFollow');
    await state('Zola · Stopped');
    assert.match(await page.locator('#resHint').innerText(), /blocked|obstruction/i);
    assert.equal((await saved()).family1.work.completed, 0, 'blocked arrival is not a completed shift');
    await photo('blocked');
    await tap('resEdit');
    assert.ok(await page.locator('#remove').isEnabled());
    await tap('remove');
    await tap('resFollow');
    await state('Working at workplace');
    await page.waitForFunction(pos => {
      const actor = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Resident Zola');
      return actor?.isEnabled() && Math.hypot(actor.position.x - pos.x, actor.position.z - pos.z) < 0.05;
    }, target, { timeout: 45000 });
    data = await saved();
    assert.equal(data.family1.work.completed, 0, 'working begins only after physical arrival and is not yet complete');
    assert.ok(!data.market, 'work cannot create a market purchase');
    await cargo();
    await photo('working');
    await tap('resSettings');
    await tap('resPause');
    const paused = (await saved()).family1;
    assert.equal(paused.paused, true);
    await photo('paused-at-work');
    await page.reload();
    await ready();
    await state('Zola · Paused');
    assert.deepEqual((await saved()).family1, paused, 'reload preserves the paused shift and physical position');
    await cargo();
    await photo('working');
    await tap('resSettings');
    await tap('resPause');
    await state('Working at workplace');
    assert.match(await page.locator('#resSkip').innerText(), /shift end/i);
    await tap('resSkip');
    await state('Walking home');
    await state('Zola · At home');
    data = await saved();
    assert.equal(data.family1.work.completed, 1);
    assert.equal(data.family1.routine.visits, 1);
    assert.ok(Math.hypot(data.family1.x - entrance(home).inside.x, data.family1.z - entrance(home).inside.z) < 0.05);
    assert.deepEqual(data.pieces.map(p => p[0]).sort(), [home.id, office.id].sort());
    await cargo();
    await photo('home');
    await page.reload();
    await ready();
    assert.equal((await saved()).family1.work.completed, 1, 'reloading never duplicates a completed shift');
    assert.ok(!((await saved()).market));
    assert.deepEqual(errors, []);
    console.log(`${mobile ? 'Phone touch' : 'Desktop'} assigned a workplace shift, repaired a real obstruction, arrived and worked, preserved pause/reload, skipped to shift end and returned home with one completion and unchanged cargo.`);
  } finally { await ctx.close(); }
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try { for (const mobile of [true, false]) await workShift(browser, mobile); }
  finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
