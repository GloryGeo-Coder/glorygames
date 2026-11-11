// Start with two occupied homes and a copied house. Create and manage the new household via the game controls.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function town() {
  const g = '../public/games/brick-playground-3d/';
  const { world } = await import(g + 'model.mjs');
  const { BLOCKS, blockIndex, citySave } = await import(g + 'settlement.mjs');
  const { stageBlockRow } = await import(g + 'block-expansion.mjs');
  const { practiceHallTrip, practiceSpaza, newTrip, isEntrance } = await import(
    g + 'resident-trip.mjs'
  );
  const city = world('city');
  const shop = practiceSpaza(city).map((p, i) => ({ ...p, id: 'spaza-' + i }));
  const home = city.pieces.find(isEntrance);
  city.pieces = [...city.pieces, ...shop];
  const hall = practiceHallTrip(city).map((p, i) => ({ ...p, id: 'hall-' + i }));
  city.pieces = [...city.pieces, ...hall];
  const [front, dest] = hall.filter(isEntrance);
  city.resident = newTrip(home, shop.find(isEntrance));
  city.neighbour = newTrip(front, dest);
  for (const trip of [city.resident, city.neighbour]) {
    trip.phase = 'done';
    trip.paused = true;
  }
  const full = stageBlockRow(city, {
    source: BLOCKS[27],
    first: BLOCKS[36],
    count: 1,
    direction: 'east',
    turns: 2
  });
  const door = blockIndex(full.pieces)[36].find(isEntrance);
  full.transport = { pickup: 'h-3-4', dropoff: 'h-4-4', stage: 2 };
  return { save: citySave(full), door: door.id, dest: dest.id };
}
async function moveIn(browser, mobile) {
  const seed = await town(),
    ctx = await browser.newContext({
      viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
      isMobile: mobile,
      hasTouch: mobile
    });
  try {
    await ctx.addInitScript((raw) => {
      if (!localStorage.getItem('wga.brick-playground.v1.city')) {
        localStorage.setItem('wga.brick-playground.v1.city', raw);
        localStorage.setItem('wga.brick.active', 'city');
      }
    }, seed.save);
    const p = await ctx.newPage(),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const tap = (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
    const saved = () =>
      p.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const state = (s) =>
      p.waitForFunction(
        (value) => document.querySelector('#resState').textContent.includes(value),
        s,
        { timeout: 150000 }
      );
    const settings = async (key) => {
      await tap('resSettings');
      await p.locator('#resHousehold').selectOption(key);
    };
    const close = () => p.getByRole('button', { name: 'Close resident settings' }).click();
    await p.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await p.locator('#tray button').first().waitFor();
    const before = await saved();
    assert.equal(before.transport.stage, 2, 'fixture loaded with cargo already collected');
    await settings('new');
    const homes = await p
      .locator('#resHome option')
      .evaluateAll((opts) => opts.map((o) => o.value));
    assert.ok(
      homes.includes(seed.door) &&
        !homes.includes(before.resident.home) &&
        !homes.includes(before.neighbour.home)
    );
    await p.locator('#resHome').selectOption(seed.door);
    await p.locator('#resVisit').selectOption('hall');
    await p.locator('#resShop').selectOption(seed.dest);
    await p.locator('#resSchedule').selectOption('14');
    await p.locator('#resName').fill('Lebo');
    assert.ok(await p.locator('#resStart').isDisabled());
    await p.locator('#resName').fill('Ayanda');
    await tap('resStart');
    await state('Ayanda · At home');
    assert.equal((await saved()).family1.routine.hour, 14);
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    await settings('family1');
    await close();
    await state('Ayanda · At home');
    await tap('cityMapButton');
    await p.locator('#mapRoute').selectOption('family1');
    assert.match(await p.locator('#mapRouteSummary').innerText(), /E5.*D5.*Connected/);
    await p.getByRole('button', { name: 'Close settlement map' }).click();
    await tap('resSkip');
    await tap('resFollow');
    await p.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')).family1.phase === 'street',
      null,
      { timeout: 150000 }
    );
    await tap('resSettings');
    await tap('resPause');
    await state('Ayanda · Paused');
    const paused = (await saved()).family1;
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.deepEqual((await saved()).family1, paused);
    assert.deepEqual(
      (await saved()).transport,
      before.transport,
      'paused household reload preserves cargo'
    );
    await settings('family1');
    await tap('resPause');
    await tap('resFollow');
    await state('Ayanda · Walking home');
    assert.ok(
      await p.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.getMeshByName('Ayanda library book').isEnabled()
      )
    );
    await p.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')).family1.phase === 'street',
      null,
      { timeout: 150000 }
    );
    if (process.env.BRICK_SCREENSHOTS) {
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await p.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'move-in-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    await state('Ayanda · At home');
    const complete = await saved();
    assert.equal(complete.family1.routine.visits, 1);
    assert.deepEqual(complete.neighbour, before.neighbour);
    assert.deepEqual(complete.resident, before.resident);
    assert.deepEqual(complete.transport, before.transport, 'new household routine preserves cargo');
    await tap('resSettings');
    assert.equal(await p.locator('#resEnd').innerText(), 'Move out');
    await tap('resEnd');
    assert.equal((await saved()).family1, undefined);
    assert.deepEqual((await saved()).transport, before.transport, 'move out preserves cargo');
    assert.equal(
      await p.evaluate(
        () => !!BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Resident Ayanda')
      ),
      false
    );
    await settings('new');
    await p.locator('#resName').fill('Thabo');
    await p.locator('#resHome').selectOption(seed.door);
    await p.locator('#resShop').selectOption(before.resident.shop);
    await tap('resStart');
    await state('Thabo · Walking to the spaza');
    assert.deepEqual((await saved()).pieces, before.pieces);
    assert.deepEqual((await saved()).members, [{ key: 'family1', name: 'Thabo', visit: 'spaza' }]);
    assert.deepEqual((await saved()).transport, before.transport, 'slot reuse preserves cargo');
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop mouse') +
        ' moved Ayanda into a copied house, followed her saved hall routine, then moved Thabo into the released home; loaded cargo stayed intact throughout.'
    );
  } finally {
    await ctx.close();
  }
}
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: [
      '--no-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader'
    ]
  });
  try {
    for (const mobile of [true, false]) await moveIn(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
