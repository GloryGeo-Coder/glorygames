// Follow saved directions on foot, repair the destination approach and arrive through its doorway.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function round(browser, mobile) {
  const g = '../public/games/brick-playground-3d/';
  const { world, validPiece } = await import(g + 'model.mjs'),
    { citySave } = await import(g + 'settlement.mjs'),
    { CITY_PLANS } = await import(g + 'city-plans.mjs'),
    { entrance } = await import(g + 'resident-trip.mjs');
  const city = world('city'),
    layout = CITY_PLANS[0].pieces,
    ref = layout.find((p) => p.type === 'door');
  city.streetNames = { 'h-3-4': 'Protea Road' };
  city.pieces = [-21, -15, -9].flatMap((x, n) =>
    layout.map((p, i) => ({
      ...p,
      id: p.type === 'door' ? 'address-' + n : 'house-' + n + '-' + i,
      x: x + p.x - ref.x,
      z: 5 + p.z - ref.z
    }))
  );
  const beam = {
    id: 'mail-barrier',
    type: 'beam',
    color: 'Plum',
    x: -15,
    z: 3,
    r: 0,
    y: 0
  };
  assert.ok(validPiece(beam, city.pieces, null, 'city'));
  city.pieces.push(beam);
  const fronts = city.pieces.filter((p) => p.type === 'door').map(entrance);
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
    isMobile: mobile,
    hasTouch: mobile
  });
  try {
    await ctx.addInitScript((raw) => {
      const key = 'wga.brick-playground.v1.city';
      if (!localStorage.getItem(key)) {
        localStorage.setItem('wga.brick.active', 'city');
        localStorage.setItem(key, raw);
      }
    }, citySave(city));
    const page = await ctx.newPage(),
      touch = mobile && (await ctx.newCDPSession(page)),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const tap = (el) => (mobile ? el.tap() : el.click()),
      press = (id) => tap(page.locator('#' + id));
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    async function goToCurb(n) {
      await press('cityMapButton');
      await tap(page.locator('#streetDirectory > summary'));
      await page.locator('#directoryDoor').selectOption('address-' + n);
      await press('directoryWalk');
      await page.waitForFunction((c) => {
        const a = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder');
        return a?.isEnabled() && Math.hypot(a.position.x - c.x, a.position.z - c.z) < 0.05;
      }, fronts[n].curb);
    }
    async function move(key, goal, hold = 0) {
      if (mobile) {
        const r = await page.locator('#stick').boundingBox();
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [
            {
              x: r.x + r.width / 2 + (key === 'a' ? -29 : key === 'd' ? 29 : 0),
              y: r.y + r.height / 2 + (key === 'w' ? -29 : key === 's' ? 29 : 0)
            }
          ]
        });
      } else await page.keyboard.down(key);
      try {
        await page.waitForFunction(
          ({ goal, key }) => {
            const p =
              BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position;
            return key === 's'
              ? p.z <= goal
              : key === 'a'
                ? p.x <= goal
                : key === 'd'
                  ? p.x >= goal
                  : p.z >= goal;
          },
          { goal, key },
          { timeout: 90000 }
        );
        if (hold)
          await page.evaluate(async (n) => {
            for (let i = 0; i < n; i++) await new Promise(requestAnimationFrame);
          }, hold);
      } finally {
        if (mobile)
          await touch.send('Input.dispatchTouchEvent', {
            type: 'touchEnd',
            touchPoints: []
          });
        else await page.keyboard.up(key);
      }
    }
    async function handover(n, label) {
      // Stop inside the doorway before pressing the button, independently of HUD refresh timing.
      await move('w', fronts[n].inside.z - 0.35);
      await page.waitForFunction((text) => {
        const b = document.querySelector('#postAction');
        return !b.hidden && !document.querySelector('#postHud').hidden && b.textContent === text;
      }, label);
      await press('postAction');
    }
    async function repair() {
      await press('build');
      await press('view');
      if (!mobile) for (let i = 0; i < 4; i++) await press('farther');
      await press('select');
      const point = await page.waitForFunction(() => {
        const B = BABYLON,
          s = B.EngineStore.LastCreatedScene,
          e = s.getEngine(),
          c = e.getRenderingCanvas(),
          r = c.getBoundingClientRect();
        for (const dx of [1.5, 0.5, 2.5, 3.5])
          for (const dz of [0.3, 0.65]) {
            const q = B.Vector3.Project(
              new B.Vector3(-15 + dx, 1.015, 3 + dz),
              B.Matrix.Identity(),
              s.getTransformMatrix(),
              s.activeCamera.viewport.toGlobal(e.getRenderWidth(), e.getRenderHeight())
            );
            const x = Math.round(r.left + (q.x * r.width) / e.getRenderWidth()),
              y = Math.round(r.top + (q.y * r.height) / e.getRenderHeight());
            if (document.elementFromPoint(x, y) !== c) continue;
            const hit = s.pick(
              x,
              y,
              (m) =>
                m.isEnabled() &&
                m.isVisible &&
                m.isPickable &&
                (m.metadata?.ground || m.metadata?.id)
            );
            if (hit?.pickedMesh?.metadata?.id === 'mail-barrier') return [x, y];
          }
      });
      const xy = await point.jsonValue();
      if (mobile) await page.touchscreen.tap(...xy);
      else await page.mouse.click(...xy);
      assert.equal(await page.locator('#readout').innerText(), 'Long brick');
      await press('remove');
      await press('play');
    }
    async function photo(name) {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          name + '-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    await goToCurb(0);
    await handover(0, 'Collect postbag');
    const bag = (await saved()).post;
    await move('s', 1.2);
    const position = () =>
      page.evaluate(() => {
        const p = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position;
        return { x: p.x, y: p.y, z: p.z };
      });
    const before = await position();
    await press('cityMapButton');
    if (!(await page.locator('#streetDirectory').evaluate((el) => el.open)))
      await tap(page.locator('#streetDirectory > summary'));
    await page.locator('#directoryDoor').selectOption('address-1');
    await press('directoryDirections');
    assert.deepEqual(await position(), before, 'directions preserve current position');
    await page.waitForFunction(
      () => document.querySelector('#directionsHud').dataset.state === 'blocked'
    );
    await tap(page.locator('#directionsHud > summary'));
    assert.match(await page.locator('#directionsHint').innerText(), /blocked/);
    assert.deepEqual((await saved()).post, bag);
    assert.equal((await saved()).directions.id, 'address-1');
    await page.waitForFunction(() =>
      BABYLON.EngineStore.LastCreatedScene.meshes.some(
        (m) => m.name === 'Walking direction marker' && m.isEnabled()
      )
    );
    await photo('directions-blocked');
    // Look along the street using the ordinary camera drag, so the ground markers are visible.
    if (mobile) {
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: 80, y: 450 }]
      });
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: 255, y: 450 }]
      });
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await page.mouse.move(400, 430);
      await page.mouse.down();
      await page.mouse.move(575, 430, { steps: 8 });
      await page.mouse.up();
    }
    await page.evaluate(async () => {
      for (let i = 0; i < 3; i++) await new Promise(requestAnimationFrame);
    });
    await photo('directions-street');
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.equal((await saved()).directions.id, 'address-1');
    assert.deepEqual((await saved()).post, bag);
    await press('worlds');
    await press('freeWorld');
    assert.ok(await page.locator('#directionsHud').isHidden());
    assert.equal(
      await page.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.meshes.some(
          (m) => m.name === 'Walking direction marker' && m.isEnabled()
        )
      ),
      false
    );
    await press('worlds');
    await press('cityWorld');
    // Starting from a directory curb must keep the already selected walking destination.
    await goToCurb(0);
    assert.equal((await saved()).directions.id, 'address-1');
    await move('d', fronts[1].center.x - 0.25);
    await move('w', 2.5, 26);
    assert.ok(await page.locator('#postAction').isHidden());
    assert.equal(await page.locator('#directionsHud').getAttribute('data-state'), 'blocked');
    await repair();
    await page.waitForFunction(
      () => document.querySelector('#directionsHud').dataset.state === 'walking'
    );
    await photo('directions-repaired');
    await move('w', fronts[1].inside.z - 0.2);
    await page.waitForFunction(
      () => document.querySelector('#directionsHud').dataset.state === 'arrived'
    );
    assert.match(await page.locator('#directionsAddress').innerText(), /Arrived.*Protea Road/);
    assert.deepEqual((await saved()).post, bag, 'arriving never hands over a letter automatically');
    if (!(await page.locator('#directionsHud').evaluate((el) => el.open)))
      await tap(page.locator('#directionsHud > summary'));
    await photo('directions-arrived');
    await press('directionsStop');
    assert.equal((await saved()).directions, undefined);
    await page.waitForFunction(
      () =>
        !BABYLON.EngineStore.LastCreatedScene.meshes.some(
          (m) => m.name === 'Walking direction marker' && m.isEnabled()
        )
    );
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.equal((await saved()).directions, undefined);
    assert.deepEqual((await saved()).post, bag);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop') +
        ' followed directions without teleporting, reloaded the destination, switched worlds, repaired a blocked approach, arrived on foot and cancelled the guide while preserving the postbag.'
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
    for (const mobile of [true, false]) await round(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
