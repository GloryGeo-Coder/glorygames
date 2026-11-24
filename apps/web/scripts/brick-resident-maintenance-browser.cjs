// Exercise actual Residents and city-map controls on emulated touch and desktop.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

async function maintenanceShift(browser, mobile) {
  const base = '../public/games/brick-playground-3d/';
  const { world, saveKey } = await import(base + 'model.mjs');
  const { citySave } = await import(base + 'settlement.mjs');
  const { entrance } = await import(base + 'resident-trip.mjs');
  const city = world('city');
  city.pieces = [-13, 11, 16].map((x, i) => ({ id: ['home', 'staff', 'visitor'][i], type: 'door', color: 'Sun', x, y: 0, z: 4, r: 0 }));
  city.streets = ['h-3-4', 'h-4-4'];
  city.transport = { pickup: 'h-3-4', dropoff: 'h-4-4', stage: 2 };
  const key = saveKey('city');
  const context = await browser.newContext({ viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 }, hasTouch: mobile, isMobile: mobile });
  const page = await context.newPage(), errors = [];
  const photo = async name => {
    if (!process.env.BRICK_SCREENSHOTS) return;
    fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
    await page.screenshot({ path: path.join(process.env.BRICK_SCREENSHOTS, `maintenance-${name}-${mobile ? 'phone' : 'desktop'}.png`) });
  };
  try {
    await context.addInitScript(({ key, raw }) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem('wga.brick.active', 'city');
        localStorage.setItem(key, raw);
      }
    }, { key, raw: citySave(city) });
    page.on('pageerror', e => errors.push(e.message));
    const locate = id => page.locator('#' + id);
    const tap = id => mobile ? locate(id).tap() : locate(id).click();
    const ready = () => page.locator('#tray button').first().waitFor();
    const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
    const state = text => page.waitForFunction(text => document.querySelector('#resState').textContent.includes(text), text, { timeout: 150000 });
    async function zone(value) {
      await tap('cityMapButton');
      await locate('mapBlock').selectOption('28');
      await locate('blockName').fill('Community facility');
      await locate('mapZone').selectOption(value);
      await tap('mapBuild');
    }
    await page.goto((process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d');
    await ready();
    await zone('civic');
    await tap('resSettings');
    await locate('resHousehold').selectOption('new');
    await locate('resName').fill('Kea');
    await locate('resVisit').selectOption('maintenance');
    await locate('resHome').selectOption('home');
    await locate('resShop').selectOption('staff');
    await locate('resWorkEnd').selectOption('23');
    assert.equal(await locate('resSchedule').inputValue(), '8');
    await tap('resStart');
    await tap('resFollow');
    await state('On civic maintenance duty');
    await tap('resSettings');
    await tap('resPause');
    const paused = (await saved()).family1;
    assert.equal(paused.phase, 'shopping');
    assert.equal(paused.maintenance, true);
    assert.equal(paused.paused, true);
    assert.equal(paused.work.completed, 0);
    const interior = entrance(city.pieces[1]).inside;
    assert.ok(Math.hypot(paused.x - interior.x, paused.z - interior.z) < .05);
    await page.waitForFunction(() => BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Resident Kea')?.isEnabled());
    await photo('at-work');
    await page.reload();
    await ready();
    await state('Paused');
    assert.deepEqual((await saved()).family1, paused);
    await zone('mixed');
    await tap('resSettings');
    await tap('resPause');
    await state('Stopped');
    assert.match(await locate('resHint').innerText(), /Civic maintenance workplace unavailable/i);
    assert.equal(await locate('resSkip').isVisible(), false);
    await photo('zone-interrupted');
    await zone('civic');
    await state('On civic maintenance duty');
    await tap('resSkip');
    await state('At home');
    const done = await saved();
    assert.equal(done.family1.phase, 'done');
    assert.equal(done.family1.work.completed, 1);
    assert.deepEqual(done.transport, city.transport);
    assert.equal(done.shopStock, undefined);
    assert.equal(done.market, undefined);
    await photo('complete');
    await page.reload();
    await ready();
    assert.equal((await saved()).family1.work.completed, 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    console.log(`${mobile ? 'Phone touch' : 'Desktop'} assigned and completed one physical civic maintenance shift through pause, reload, zoning loss and repair.`);
  } catch (error) { await photo('failed').catch(() => {}); throw error; }
  finally { await context.close(); }
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try { for (const mobile of [true, false]) await maintenanceShift(browser, mobile); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
