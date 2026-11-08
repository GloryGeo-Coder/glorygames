// Test the playable town through the same map, blueprint and movement controls as a player.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function town(browser, mobile) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1280, height: 800 },
    isMobile: mobile,
    hasTouch: mobile
  });
  try {
    const page = await ctx.newPage(),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const tap = (id) => (mobile ? page.locator('#' + id).tap() : page.locator('#' + id).click());
    const save = (kind) =>
      page.evaluate((k) => JSON.parse(localStorage.getItem('wga.brick-playground.v1.' + k)), kind);
    const touch = mobile && (await ctx.newCDPSession(page));
    const photo = async (name) => {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'settlement-' + name + (mobile ? '-phone' : '-desktop') + '.png'
        )
      });
    };
    async function map(block) {
      await tap('cityMapButton');
      await page.locator('#mapBlock').selectOption(String(block));
    }
    async function stamp(name) {
      await tap('blueprints');
      await page.locator('#planList').selectOption({ label: name });
      await tap('usePlan');
      assert.ok(
        await page.locator('#place').isEnabled(),
        await page.locator('#readout').innerText()
      );
      await tap('place');
    }
    async function walk(key, axis, target) {
      const sign = ['w', 'd'].includes(key) ? 1 : -1;
      if (mobile) {
        const r = await page.locator('#stick').boundingBox();
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [
            {
              x: r.x + r.width / 2 + (axis === 'x' ? sign * 30 : 0),
              y: r.y + r.height / 2 - (axis === 'z' ? sign * 30 : 0)
            }
          ]
        });
      } else await page.keyboard.down(key);
      try {
        await page.waitForFunction(
          ({ axis, target, sign }) =>
            (BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position[axis] -
              target) *
              sign >=
            0,
          { axis, target, sign },
          { timeout: 90000 }
        );
      } finally {
        if (mobile)
          await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        else await page.keyboard.up(key);
      }
    }
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    await tap('place');
    const free = await save('free');
    await tap('worlds');
    await tap('cityWorld');
    await tap('worlds');
    await page.locator('#name').fill('Mzansi Heights');
    await page.getByRole('button', { name: 'Close menu' }).click();
    const initial = await save('city');
    await map(0);
    await page.locator('#blockName').fill('Civic Square');
    await page.locator('#mapZone').selectOption('civic');
    await tap('road-east');
    await tap('mapBuild');
    await stamp('Community hall');
    const first = await save('city');
    assert.ok(first.pieces.length > initial.pieces.length);
    await map(1);
    assert.ok(await page.locator('#road-west').isChecked(), 'shared street appears on both blocks');
    await page.locator('#blockName').fill('Market Row');
    await page.locator('#mapZone').selectOption('shops');
    await tap('mapBuild');
    // The active blueprint stays ready while switching blocks.
    await tap('place');
    const second = await save('city');
    assert.equal(
      second.pieces.length - first.pieces.length,
      first.pieces.length - initial.pieces.length
    );
    await map(0);
    await tap('mapWalk');
    await walk('w', 'z', 84); // enter the front doorway of A1's hall
    const y = await page.evaluate(
      () => BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.y
    );
    assert.ok(y > 0.3, 'walked onto the built floor');
    await walk('s', 'z', 73.5);
    await walk('d', 'x', -70);
    assert.match(await page.locator('#cityMapButton').innerText(), /B1/);
    await map(63);
    await tap('mapBuild');
    await stamp('Three-storey offices');
    const far = await save('city');
    assert.equal(far.focus, 63);
    assert.ok(
      await page.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.meshes.some(
          (m) => m.name.startsWith('Distant city') && m.isEnabled() && m.thinInstanceCount > 0
        )
      )
    );
    await photo('tower');
    await map(1);
    await tap('road-west');
    await tap('mapBuild');
    assert.ok(!(await save('city')).streets.includes('v-1-0'));
    await tap('undo');
    assert.ok((await save('city')).streets.includes('v-1-0'));
    await map(63);
    await photo('map');
    await tap('mapBuild');
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    const reopened = await save('city');
    assert.equal(await page.locator('#worldName').innerText(), 'Mzansi Heights');
    assert.equal(reopened.focus, 63);
    assert.deepEqual(reopened.pieces, far.pieces);
    assert.equal(reopened.blocks[0].name, 'Civic Square');
    assert.deepEqual(await save('free'), free);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone joystick' : 'Desktop keyboard') +
        ': built two halls and a distant tower, crossed a shared street, walked inside, undid a road edit and reopened the town.'
    );
  } finally {
    await ctx.close();
  }
}
// Open a pre-existing fully occupied town through the normal save loader on a phone viewport.
async function largeTown(browser) {
  const { BLOCKS, cityWorld, citySave, streetKeys } =
    await import('../public/games/brick-playground-3d/settlement.mjs');
  const { CITY_PLANS } = await import('../public/games/brick-playground-3d/city-plans.mjs');
  const city = cityWorld();
  city.name = 'Full town';
  city.pieces = [];
  city.streets = [];
  for (const b of BLOCKS) {
    city.streets.push(...Object.values(streetKeys(b)));
    for (const [site, [x, z]] of [
      [-9, -9],
      [1, -9],
      [-9, 1],
      [1, 1]
    ].entries()) {
      const plan = CITY_PLANS[site === 3 ? 2 : 0];
      city.pieces.push(
        ...plan.pieces.map((p, i) => ({
          ...p,
          id: b.code + '-' + site + '-' + i,
          x: b.x + x + p.x,
          z: b.z + z + p.z
        }))
      );
    }
  }
  city.streets = [...new Set(city.streets)];
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 820 },
    isMobile: true,
    hasTouch: true
  });
  try {
    await ctx.addInitScript((json) => {
      localStorage.setItem('wga.brick.active', 'city');
      localStorage.setItem('wga.brick-playground.v1.city', json);
    }, citySave(city));
    const page = await ctx.newPage(),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    assert.equal(await page.locator('#worldName').innerText(), city.name);
    await page.locator('#cityMapButton').tap();
    assert.match(await page.locator('#mapStats').innerText(), /^64 \/ 64 built blocks/);
    await page.locator('#mapOverview').tap();
    await page.waitForFunction(
      () => BABYLON.EngineStore.LastCreatedScene.activeCamera.position.y > 200
    );
    const counts = await page.evaluate(() => {
      const scene = BABYLON.EngineStore.LastCreatedScene;
      return {
        detail: scene.meshes.filter((m) => m.metadata?.id).length,
        far: scene.meshes
          .filter((m) => m.name.startsWith('Distant city') && m.isEnabled())
          .reduce((n, m) => n + m.thinInstanceCount, 0)
      };
    });
    assert.equal(counts.detail + counts.far, city.pieces.length);
    assert.ok(counts.detail < city.pieces.length / 5);
    if (process.env.BRICK_SCREENSHOTS)
      await page.screenshot({
        path: path.join(process.env.BRICK_SCREENSHOTS, 'settlement-full-town.png')
      });
    const point = await page.evaluate(() => {
      const B = BABYLON,
        s = B.EngineStore.LastCreatedScene,
        e = s.getEngine(),
        c = e.getRenderingCanvas();
      const v = B.Vector3.Project(
        new B.Vector3(12, 0, 12),
        B.Matrix.Identity(),
        s.getTransformMatrix(),
        s.activeCamera.viewport.toGlobal(e.getRenderWidth(), e.getRenderHeight())
      );
      return [
        (v.x * c.clientWidth) / e.getRenderWidth(),
        (v.y * c.clientHeight) / e.getRenderHeight()
      ];
    });
    await page.touchscreen.tap(...point);
    await page.locator('#bench').waitFor();
    assert.match(await page.locator('#cityMapButton').innerText(), /E4/);
    assert.deepEqual(errors, []);
    console.log(
      'Opened 256 buildings across all 64 blocks (' +
        city.pieces.length +
        ' bricks); verified distant instances and tapped into a block from City view.'
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
    for (const mobile of [true, false]) await town(browser, mobile);
    await largeTown(browser);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
