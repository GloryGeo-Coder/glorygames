// Build and zone a community hall through actual controls, then complete an adult service visit.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function serviceVisit(browser, mobile) {
  const base = '../public/games/brick-playground-3d/';
  const { world, saveKey } = await import(base + 'model.mjs');
  const { citySave } = await import(base + 'settlement.mjs');
  const city = world('city');
  city.pieces = [{ id: 'home', type: 'door', color: 'Sun', x: -13, y: 0, z: 4, r: 0 }];
  city.streets = ['h-3-4', 'h-4-4'];
  city.transport = { pickup: 'h-3-4', dropoff: 'h-4-4', stage: 2 };
  const context = await browser.newContext({ viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 }, hasTouch: mobile, isMobile: mobile });
  const page = await context.newPage(), errors = [];
  const photo = async name => {
    if (!process.env.BRICK_SCREENSHOTS) return;
    fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
    await page.screenshot({ path: path.join(process.env.BRICK_SCREENSHOTS, `service-${name}-${mobile ? 'phone' : 'desktop'}.png`) });
  };
  try {
    await context.addInitScript(({ key, raw }) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem('wga.brick.active', 'city');
        localStorage.setItem(key, raw);
      }
    }, { key: saveKey('city'), raw: citySave(city) });
    page.on('pageerror', e => errors.push(e.message));
    const tap = id => mobile ? page.locator('#' + id).tap() : page.locator('#' + id).click();
    const ready = () => page.locator('#tray button').first().waitFor();
    const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey('city'));
    const state = text => page.waitForFunction(text => document.querySelector('#resState').textContent.includes(text), text, { timeout: 150000 });
    async function zone(value) {
      await tap('cityMapButton');
      await page.locator('#mapBlock').selectOption('28');
      await page.locator('#blockName').fill('Ubuntu Community Hall');
      await page.locator('#mapZone').selectOption(value);
      await tap('mapBuild');
    }
    const untouched = async () => {
      const data = await saved();
      assert.deepEqual(data.transport, city.transport, 'service visit and building edits preserve loaded cargo');
      assert.equal(data.shopStock, undefined, 'service cannot create shop stock');
      assert.equal(data.market, undefined, 'service cannot create market receipts');
    };
    await page.goto((process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d');
    await ready();
    await zone('civic');
    await tap('blueprints');
    await page.locator('#planList').selectOption({ label: 'Community hall' });
    await tap('usePlan');
    assert.ok(await page.locator('#place').isEnabled(), await page.locator('#readout').innerText());
    await tap('place');
    const built = await saved();
    assert.ok(built.pieces.length > 1, 'actual blueprint stamping creates the furnished service');
    const destination = await page.evaluate(async () => {
      const base = '/games/brick-playground-3d/';
      const { loadWorld } = await import(base + 'model.mjs');
      const { entrance } = await import(base + 'resident-trip.mjs');
      const data = loadWorld('city', localStorage);
      const door = data.pieces.find(p => p.type === 'door' && p.id !== 'home');
      return { id: door.id, inside: entrance(door).inside };
    });
    await untouched();
    await photo('built');
    await tap('resSettings');
    await page.locator('#resHousehold').selectOption('new');
    await page.locator('#resName').fill('Zola');
    await page.locator('#resVisit').selectOption('service');
    await page.locator('#resHome').selectOption('home');
    await page.locator('#resShop').selectOption(destination.id);
    await page.locator('#resSchedule').selectOption('');
    await tap('resStart');
    await tap('resFollow');
    await page.waitForFunction(() => {
      const data = JSON.parse(localStorage.getItem('wga.brick-playground.v1.city'));
      return data.family1?.phase === 'shopping';
    }, null, { timeout: 150000 });
    // Pause using the UI before the eight-second service visit finishes.
    await tap('resSettings');
    await tap('resPause');
    const paused = (await saved()).family1;
    assert.equal(paused.phase, 'shopping');
    assert.ok(paused.paused && paused.wait > 0 && paused.wait <= 8);
    assert.equal(paused.service.visits, 0);
    assert.ok(Math.hypot(paused.x - destination.inside.x, paused.z - destination.inside.z) < 0.05, 'adult physically arrives at the clear interior');
    await page.waitForFunction(() => BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Resident Zola')?.isEnabled());
    assert.equal(await page.evaluate(() => BABYLON.EngineStore.LastCreatedScene.transformNodes.some(n => / · child$/.test(n.name) && n.isEnabled())), false, 'service visitor is an adult without a spawned child');
    await photo('visit');
    await untouched();
    await page.reload();
    await ready();
    await state('Paused');
    assert.deepEqual((await saved()).family1, paused, 'reload preserves the paused service visit without granting completion');
    // Removing the service zoning is a visible, repairable interruption, not a free service visit.
    await zone('mixed');
    await tap('resSettings');
    await tap('resPause');
    await state('Stopped');
    assert.match(await page.locator('#resHint').innerText(), /service|land use|zone/i);
    const stopped = (await saved()).family1;
    assert.equal(stopped.service.visits, 0);
    assert.equal(stopped.wait, paused.wait, 'invalid service zoning cannot consume service visit time');
    await photo('zone-interrupted');
    await zone('civic');
    await state('Home again');
    const finished = await saved();
    assert.equal(finished.family1.service.visits, 1);
    assert.equal(finished.family1.phase, 'done');
    assert.deepEqual(finished.pieces, built.pieces, 'zoning repair leaves the built hall intact');
    await untouched();
    await photo('complete');
    await page.reload();
    await ready();
    assert.equal((await saved()).family1.service.visits, 1, 'reload does not duplicate a completed service visit');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    console.log(`${mobile ? 'Phone touch' : 'Desktop'} built and zoned a community hall, completed a physical adult service visit through pause/reload and zoning repair, then returned home exactly once without stock or cargo effects.`);
  } catch (error) { await photo('failed').catch(() => {}); throw error; }
  finally { await context.close(); }
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try { for (const mobile of [true, false]) await serviceVisit(browser, mobile); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
