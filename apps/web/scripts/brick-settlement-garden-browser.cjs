// Walk from a planted bed to a bench across the street, using the normal studio controls.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function visit(browser, mobile) {
  const { world } = await import('../public/games/brick-playground-3d/model.mjs'),
    { citySave } = await import('../public/games/brick-playground-3d/settlement.mjs');
  const city = world('city');
  city.focus = 28;
  city.transport = { pickup: 'h-3-4', dropoff: 'h-4-4', stage: 2 };
  city.pieces = [
    { id: 'bed', type: 'pot', color: 'Coral', r: 0, x: 12, z: 5, y: 0 },
    { id: 'seat', type: 'bench', color: 'Sun', r: 0, x: 12, z: -6, y: 0 }
  ];
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
    isMobile: mobile,
    hasTouch: mobile
  });
  try {
    await ctx.addInitScript((raw) => {
      if (!localStorage.getItem('wga.brick-playground.v1.city')) {
        localStorage.setItem('wga.brick.active', 'city');
        localStorage.setItem('wga.brick-playground.v1.city', raw);
      }
    }, citySave(city));
    const page = await ctx.newPage(),
      touch = mobile && (await ctx.newCDPSession(page)),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const tap = (id) => (mobile ? page.locator('#' + id).tap() : page.locator('#' + id).click());
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const cargo = async () =>
      assert.deepEqual(
        (await saved()).transport,
        city.transport,
        'garden actions, map changes and reload preserve loaded cargo'
      );
    const action = (label) =>
      page.waitForFunction(
        (label) =>
          !document.querySelector('#gardenHud').hidden &&
          !document.querySelector('#gardenAction').hidden &&
          document.querySelector('#gardenAction').textContent === label,
        label,
        { timeout: 60000 }
      );
    async function move(key, label) {
      if (mobile) {
        const r = await page.locator('#stick').boundingBox();
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: r.x + r.width / 2, y: r.y + r.height / 2 + (key === 'w' ? -29 : 29) }]
        });
      } else await page.keyboard.down(key);
      try {
        await action(label);
      } finally {
        if (mobile)
          await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        else await page.keyboard.up(key);
      }
    }
    async function photo(stage) {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'garden-' + stage + '-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    await cargo();
    await tap('cityMapButton');
    await page.locator('#mapBlock').selectOption('36');
    await page.locator('#mapZone').selectOption('park');
    assert.match(await page.locator('#parkMapTip').innerText(), /Benches 1/);
    await page.locator('#mapBlock').selectOption('28');
    await tap('mapWalk');
    await cargo();
    await move('w', 'Plant seeds');
    const flower = mobile ? 'marigold' : 'daisy';
    await page.locator('#gardenSeed').selectOption(flower);
    await tap('gardenAction');
    await action('Water planter');
    await tap('gardenAction');
    const wet = (await saved()).garden.plants[0];
    assert.equal(wet.flower, flower);
    assert.ok(Number.isSafeInteger(wet.watered));
    await cargo();
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.deepEqual((await saved()).garden.plants[0], wet);
    await cargo();
    const parks = (await saved()).blocks;
    await tap('cityMapButton');
    await page.locator('#mapBlock').selectOption('28');
    await page.locator('#mapZone').selectOption('homes');
    await page.locator('[aria-label="Close settlement map"]').click();
    assert.deepEqual((await saved()).blocks, parks, 'cancelling zoning keeps the planted park');
    await tap('cityMapButton');
    await page.locator('#mapBlock').selectOption('28');
    await page.locator('#mapZone').selectOption('homes');
    await tap('mapBuild');
    assert.equal((await saved()).blocks[28].zone, 'homes');
    assert.deepEqual((await saved()).garden.plants[0], wet);
    await cargo();
    await tap('undo');
    assert.deepEqual((await saved()).blocks, parks, 'undo restores park zoning');
    assert.deepEqual((await saved()).garden.plants[0], wet, 'undo preserves growth time');
    await cargo();
    await page.waitForFunction(
      () => !!BABYLON.EngineStore.LastCreatedScene.getMeshByName('Garden bloom bed'),
      null,
      { timeout: 45000 }
    );
    await tap('play');
    await move('w', 'Pick bouquet');
    await photo('bloom');
    await tap('gardenAction');
    assert.equal((await saved()).garden.bouquet, flower);
    await cargo();
    await page.waitForFunction(
      () =>
        BABYLON.EngineStore.LastCreatedScene.getMeshByName('Carried garden bouquet')?.parent
          ?.name === 'Builder'
    );
    assert.match(await page.locator('#gardenHint').innerText(), /Bench in E5/);
    await photo('carrying');
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    await tap('play');
    await move('s', 'Place bouquet');
    await tap('gardenAction');
    const done = await saved();
    assert.equal(done.garden.bouquet, null);
    assert.deepEqual(done.garden.displays, [{ id: 'seat', flower }]);
    await cargo();
    await page.waitForFunction(
      () => !!BABYLON.EngineStore.LastCreatedScene.getMeshByName('Garden display seat')
    );
    assert.equal(
      await page.evaluate(
        () => !!BABYLON.EngineStore.LastCreatedScene.getMeshByName('Carried garden bouquet')
      ),
      false
    );
    await photo('bench');
    await tap('worlds');
    await tap('freeWorld');
    assert.equal(
      await page.evaluate(
        () => !!BABYLON.EngineStore.LastCreatedScene.getMeshByName('Garden display seat')
      ),
      false
    );
    await tap('worlds');
    await tap('cityWorld');
    await tap('cityMapButton');
    await page.locator('#mapBlock').selectOption('36');
    await tap('mapBuild');
    assert.deepEqual((await saved()).garden, done.garden);
    await cargo();
    await page.waitForFunction(
      () => !!BABYLON.EngineStore.LastCreatedScene.getMeshByName('Garden display seat')
    );
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Touch' : 'Desktop') +
        ' zoned a second park, grew a ' +
        flower +
        ', refreshed the watered planter and carried bouquet, and reopened the decorated bench, preserving loaded transport cargo throughout.'
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
    for (const mobile of [true, false]) await visit(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
