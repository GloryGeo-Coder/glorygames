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
    const repeat = async () => {
      const summary = page.locator('#blockRepeat summary');
      if (mobile) await summary.tap();
      else await summary.click();
      await page.locator('#repeatSource').selectOption('0');
      await page.locator('#repeatCount').selectOption('3');
      await page.locator('#repeatTurns').selectOption('1');
    };
    const closeMap = () => page.getByRole('button', { name: 'Close settlement map' }).click();
    await map(2);
    await repeat();
    await page.locator('#repeatDir').selectOption('west');
    assert.match(await page.locator('#repeatPreview').innerText(), /Already built/);
    assert.ok(await page.locator('#repeatStage').isDisabled());
    await page.locator('#repeatDir').selectOption('east');
    await page.locator('#mapBlock').selectOption('15');
    assert.match(await page.locator('#repeatPreview').innerText(), /boundary/);
    await page.locator('#mapBlock').selectOption('11');
    assert.match(await page.locator('#repeatPreview').innerText(), /D2, E2, F2/);
    if (mobile) {
      const stage = await page.locator('#repeatStage').boundingBox();
      const footer = await page.locator('.map-actions').boundingBox();
      assert.ok(
        stage.y + stage.height <= footer.y,
        'the phone preview keeps Stage row visible above the map actions'
      );
    }
    await photo('row-preview');
    await tap('repeatStage');
    await closeMap();
    assert.deepEqual(await save('city'), reopened, 'cancel discards the staged row');
    const placeRow = async () => {
      await map(11);
      await repeat();
      await tap('repeatStage');
      await tap('mapBuild');
      return save('city');
    };
    const row = await placeRow();
    const hallSize = first.pieces.length - initial.pieces.length;
    assert.equal(row.pieces.length, reopened.pieces.length + 3 * hallSize);
    assert.equal(row.blocks[11].zone, 'civic');
    await tap('undo');
    const undone = await save('city');
    assert.deepEqual(
      [undone.pieces, undone.blocks, undone.streets],
      [reopened.pieces, reopened.blocks, reopened.streets]
    );
    const built = await placeRow();
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.deepEqual((await save('city')).pieces, built.pieces);
    await map(11);
    await tap('mapWalk');
    const door = built.pieces.slice(reopened.pieces.length).find((p) => p[1] === 'door');
    assert.equal(door[6], 1);
    await walk('d', 'x', -2);
    await walk('w', 'z', door[5] + 1.5);
    await walk('a', 'x', door[3] - 0.55);
    assert.ok(
      await page.evaluate(
        () =>
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.y > 0.3
      ),
      'walked inside the rotated copy'
    );
    console.log(
      (mobile ? 'Phone' : 'Desktop') +
        ': rejected an occupied row, cancelled and undid a three-block expansion, reopened the saved street and walked into its rotated hall.'
    );
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone joystick' : 'Desktop keyboard') +
        ': built two halls and a distant tower, crossed a shared street, walked inside, undid a road edit and reopened the town.'
    );
  } finally {
    await ctx.close();
  }
}
async function streetConnection(browser, mobile) {
  const { world } = await import('../public/games/brick-playground-3d/model.mjs');
  const { citySave } = await import('../public/games/brick-playground-3d/settlement.mjs');
  const { practiceHallTrip, practiceSpaza, isEntrance, newTrip } =
    await import('../public/games/brick-playground-3d/resident-trip.mjs');
  const city = world('city'),
    home = city.pieces.find(isEntrance);
  const shop = practiceSpaza(city).map((p, i) => ({ ...p, id: 'map-spaza-' + i }));
  city.pieces = [...city.pieces, ...shop];
  const hall = practiceHallTrip(city).map((p, i) => ({ ...p, id: 'map-hall-' + i }));
  city.pieces = [...city.pieces, ...hall];
  city.resident = newTrip(home, shop.find(isEntrance));
  city.resident.paused = true;
  city.neighbour = newTrip(...hall.filter(isEntrance));
  city.streets = city.streets.filter((k) => k !== 'v-3-3');
  const ctx = await browser.newContext({
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
    }, citySave(city));
    const page = await ctx.newPage(),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const tap = (id) => (mobile ? page.locator('#' + id).tap() : page.locator('#' + id).click());
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const summary = () => page.locator('#mapRouteSummary').innerText();
    const openRoute = async () => {
      await tap('cityMapButton');
      await page.locator('#mapRoute').selectOption('neighbour');
    };
    const close = () => page.getByRole('button', { name: 'Close settlement map' }).click();
    const state = (label) =>
      page.waitForFunction(
        (s) => document.getElementById('resState').textContent.includes(s),
        label,
        { timeout: 150000 }
      );
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    await tap('resOther');
    await state('Naledi · Stopped');
    await tap('play');
    await openRoute();
    assert.match(await summary(), /Disconnected.*1 missing section/);
    assert.ok(await page.locator('#mapConnect').isHidden(), 'Play offers inspection only');
    await page.locator('#mapRoute').selectOption('resident');
    assert.match(await summary(), /Connected/);
    await close();
    await tap('build');
    await openRoute();
    assert.equal(await page.locator('#mapRouteZoom').innerText(), 'Whole town');
    await tap('mapRouteZoom');
    await tap('mapRouteZoom');
    const point = await page.locator('#cityAtlas').evaluate((c) => {
      const pixels = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let x = 0,
        y = 0,
        count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        if (pixels[i] === 22 && pixels[i + 1] === 63 && pixels[i + 2] === 116) {
          x += (i / 4) % c.width;
          y += Math.floor(i / 4 / c.width);
          count++;
        }
      }
      if (!count) throw Error('Home marker was not painted');
      const r = c.getBoundingClientRect();
      return [
        r.left + ((x / count) * r.width) / c.width,
        r.top + ((y / count) * r.height) / c.height
      ];
    });
    if (mobile) await page.touchscreen.tap(...point);
    else await page.mouse.click(...point);
    assert.equal(
      await page.locator('#mapBlock').inputValue(),
      '26',
      'zoomed home marker selects C4'
    );
    if (process.env.BRICK_SCREENSHOTS) {
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'street-plan-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    const before = await saved();
    await tap('mapConnect');
    assert.match(await summary(), /New connection in this preview/);
    assert.ok(await page.locator('#road-east').isChecked());
    assert.deepEqual(await saved(), before, 'preview has not saved an edit');
    await close();
    await openRoute();
    assert.match(await summary(), /Disconnected/);
    await tap('mapConnect');
    await tap('mapBuild');
    assert.ok((await saved()).streets.includes('v-3-3'));
    await tap('undo');
    assert.deepEqual((await saved()).streets, before.streets);
    await openRoute();
    await tap('mapConnect');
    await tap('mapBuild');
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    await openRoute();
    assert.match(await summary(), /Connected/);
    assert.ok(await page.locator('#mapConnect').isHidden());
    await close();
    await tap('resOther');
    await tap('play');
    await state('Naledi · Home again');
    const finished = await saved();
    assert.deepEqual(finished.resident, before.resident);
    assert.deepEqual(finished.pieces, before.pieces);
    assert.equal(finished.neighbour.shop, before.neighbour.shop);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone' : 'Desktop') +
        ' street planner: inspected both routes, selected C4 in close-up, cancelled a repair, applied and undid it, then reopened the repaired town and watched Naledi finish.'
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
    for (const mobile of [true, false]) {
      await streetConnection(browser, mobile);
      await town(browser, mobile);
    }
    await largeTown(browser);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
