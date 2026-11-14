const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

async function schoolVisit(browser, mobile) {
  const base = '../public/games/brick-playground-3d/';
  const { world, saveKey } = await import(base + 'model.mjs');
  const { citySave } = await import(base + 'settlement.mjs');
  const { CITY_PLANS } = await import(base + 'city-plans.mjs');
  const { placement } = await import(base + 'blueprint.mjs');
  const city = world('city');
  const plan = CITY_PLANS.find(p => p.name === 'Neighbourhood classroom');
  const classroom = placement(plan, { x: 10, z: 4 }, 0, false, [], 'city').pieces
    .map((piece, i) => ({ ...piece, id: 'room-' + i }));
  const school = classroom.find(p => p.type === 'door');
  city.pieces = [{ id: 'home', type: 'door', x: -13, z: 4, y: 0, r: 0, color: 'Sun' }, ...classroom];
  city.streets = ['h-3-4', 'h-4-4'];
  const context = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
    hasTouch: mobile, isMobile: mobile
  });
  try {
    await context.addInitScript(({ key, save }) => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem('wga.brick.active', 'city');
        localStorage.setItem(key, save);
      }
    }, { key: saveKey('city'), save: citySave(city) });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const tap = id => mobile ? page.locator('#' + id).tap() : page.locator('#' + id).click();
    const state = text => page.waitForFunction(text => document.querySelector('#resState').textContent.includes(text),
      text, { timeout: 150000 });
    const ready = () => page.locator('#tray button').first().waitFor();
    const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), saveKey('city'));
    await page.goto((process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d');
    await ready();
    await tap('cityMapButton');
    await page.locator('#mapBlock').selectOption('28');
    await page.locator('#blockName').fill('Khula Primary');
    await page.locator('#mapZone').selectOption('school');
    await tap('mapBuild');
    await tap('resSettings');
    await page.locator('#resHousehold').selectOption('new');
    await page.locator('#resName').fill('Thandi');
    await page.locator('#resVisit').selectOption('school');
    await page.locator('#resChildName').fill('Neo');
    await page.locator('#resHome').selectOption('home');
    await page.locator('#resShop').selectOption(school.id);
    await tap('resStart');
    await state('In class');
    await page.waitForFunction(() => {
      const scene = BABYLON.EngineStore.LastCreatedScene;
      const adult = scene.getTransformNodeByName('Resident Thandi');
      const child = scene.getTransformNodeByName('Resident Neo · child');
      return adult?.isEnabled() && child?.isEnabled() && Math.hypot(
        adult.position.x - child.position.x, adult.position.z - child.position.z) < 1;
    });
    if (process.env.BRICK_SCREENSHOTS) {
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({ path: path.join(process.env.BRICK_SCREENSHOTS,
        'school-lesson-' + (mobile ? 'phone' : 'desktop') + '.png') });
    }
    await tap('resSettings');
    await tap('resPause');
    const paused = (await saved()).family1;
    assert.equal(paused.phase, 'shopping');
    assert.ok(paused.paused && paused.wait > 0);
    await page.reload();
    await ready();
    await state('Paused');
    assert.deepEqual((await saved()).family1, paused);
    await tap('resSettings');
    await tap('resPause');
    await state('Home again');
    assert.match(await page.locator('#resRoutineNote').innerText(), /Neo · 1 completed lesson/);
    await page.reload();
    await ready();
    assert.equal((await saved()).family1.school.lessons, 1);
    assert.deepEqual(errors, []);
    console.log((mobile ? 'Phone' : 'Desktop') + ' school zoning, family lesson, pause/reload and return home passed.');
  } finally { await context.close(); }
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try { for (const mobile of [true, false]) await schoolVisit(browser, mobile); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
