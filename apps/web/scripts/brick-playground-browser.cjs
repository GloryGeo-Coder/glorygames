// Run against a local production WebGameArena server. All edits use the public touch controls.
// Babylon is read only here: projection tells a touchscreen exactly which visible stud to tap.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const origin = process.env.GAME_ORIGIN || 'http://127.0.0.1:3000';
async function run() {
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
    const ctx = await browser.newContext({
      viewport: { width: 393, height: 820 },
      isMobile: true,
      hasTouch: true
    });
    const listing = await ctx.newPage();
    await listing.goto(origin + '/games/brick-playground-3d/');
    await listing.getByText('Game Chat', { exact: true }).first().waitFor();
    const launch = listing.getByRole('link', { name: /Play Game/ }).first();
    assert.equal(await launch.getAttribute('href'), '/play/brick-playground-3d');
    const [p] = await Promise.all([ctx.waitForEvent('page'), launch.click()]);
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.locator('#tray button').first().waitFor();
    const touch = await ctx.newCDPSession(p);
    const tap = (id) => p.locator('#' + id).tap();
    const save = (kind) =>
      p.evaluate((k) => JSON.parse(localStorage.getItem('wga.brick-playground.v1.' + k)), kind);
    async function point(x, z, y = 0) {
      return p.evaluate(
        ([x, y, z]) => {
          const B = BABYLON,
            s = B.EngineStore.LastCreatedScene,
            e = s.getEngine();
          const q = B.Vector3.Project(
            new B.Vector3(x, y, z),
            B.Matrix.Identity(),
            s.getTransformMatrix(),
            s.activeCamera.viewport.toGlobal(e.getRenderWidth(), e.getRenderHeight())
          );
          const c = document.querySelector('canvas');
          return {
            x: (q.x * c.clientWidth) / e.getRenderWidth(),
            y: (q.y * c.clientHeight) / e.getRenderHeight()
          };
        },
        [x, y, z]
      );
    }
    async function aim(x, z, y = 0) {
      const q = await point(x + 0.46, z + 0.46, y);
      await p.touchscreen.tap(q.x, q.y);
    }
    async function build(type, x, z, rotate = false) {
      await p.locator('[data-type="' + type + '"]').tap();
      if (rotate) await tap('rotate');
      await aim(x, z);
      assert.match(
        await p.locator('#readout').innerText(),
        new RegExp('\\(' + x + ', ' + z + '\\)')
      );
      await tap('place');
    }
    async function lookDown() {
      await tap('view');
      await p.waitForTimeout(250);
    }
    async function dispatch(type, points) {
      await touch.send('Input.dispatchTouchEvent', { type, touchPoints: points });
    }
    async function world(id) {
      await tap('worlds');
      await tap(id);
    }
    await tap('worlds');
    await p.locator('#name').fill('Corner house');
    await p.locator('button[value=close]').tap();
    await lookDown();
    await build('floor', -2, -2);
    await build('door', -1, -3);
    await build('wall', -3, -2, true);
    await build('wall', 2, -2, true);
    await build('wall', -2, 2);
    // Set the roof on the western wall, leaving a cutaway for the explorer.
    await build('floor', -3, -1);
    let house = await save('free');
    assert.equal(house.pieces.length, 6);
    assert.equal(house.pieces.at(-1).y, 3);
    assert.equal(house.name, 'Corner house');
    const before = JSON.stringify(house);
    await dispatch('touchStart', [{ x: 138, y: 365 }]);
    await dispatch('touchMove', [{ x: 195, y: 380 }]);
    await dispatch('touchEnd', []);
    assert.equal(JSON.stringify(await save('free')), before, 'orbit is read-only');
    await tap('play');
    const pos = () =>
      p.evaluate(() => {
        const n = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder');
        return { x: n.position.x, z: n.position.z, y: n.position.y };
      });
    const stick = await p.locator('#stick').boundingBox(),
      x = stick.x + stick.width / 2,
      y = stick.y + stick.height / 2;
    await dispatch('touchStart', [{ x, y: y - 31 }]);
    await p.waitForFunction(
      () =>
        BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.z > -0.9,
      null,
      { timeout: 45000 }
    );
    await dispatch('touchEnd', []);
    const inside = await pos();
    assert.ok(inside.y > 0.3 && inside.z < 1.95, 'character entered house onto floor');
    await tap('build');
    await tap('select');
    const west = house.pieces.find((b) => b.type === 'wall' && b.x === -3);
    const pick = await point(-2.5, -1.65, 3);
    await p.touchscreen.tap(pick.x, pick.y);
    assert.equal(await p.locator('#readout').innerText(), 'Wall');
    await tap('move');
    await aim(-4, -2);
    await tap('place');
    house = await save('free');
    assert.equal(house.pieces.find((b) => b.id === west.id).x, -4);
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.deepEqual(await save('free'), house);
    assert.equal(await p.locator('#worldName').innerText(), 'Corner house');
    const loadedMeshes = await p.evaluate(() => BABYLON.EngineStore.LastCreatedScene.meshes
      .filter(mesh => mesh.metadata?.id).map(mesh => ({id: mesh.metadata.id, x: mesh.position.x})));
    assert.equal(loadedMeshes.length, house.pieces.length);
    assert.equal(loadedMeshes.find(mesh => mesh.id === west.id).x, -3.5);
    await world('bridgeWorld');
    await lookDown();
    await build('deck', -3, -1);
    await tap('test');
    await p.waitForFunction(
      () => document.querySelector('#result').textContent.includes('lost the deck'),
      null,
      { timeout: 60000 }
    );
    const gap = await save('bridge');
    assert.equal(gap.pieces.length, 1);
    const failedX = await p.evaluate(
      () => BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Delivery buggy').position.x
    );
    assert.ok(failedX > -1 && failedX < 0, 'buggy reached the missing middle section');
    await tap('test');
    assert.deepEqual(await save('bridge'), gap);
    await build('deck', 0, -1);
    await tap('test');
    await p.waitForFunction(
      () => document.querySelector('#result').textContent.includes('Delivered!'),
      null,
      { timeout: 60000 }
    );
    assert.equal((await save('bridge')).complete, true);
    await world('freeWorld');
    assert.deepEqual(await save('free'), house);
    await world('bridgeWorld');
    assert.equal((await save('bridge')).pieces.length, 2);
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.match(await p.locator('#result').innerText(), /complete/);
    await p.setViewportSize({ width: 820, height: 393 });
    assert.ok(await p.locator('#worlds').isVisible());
    const bench = await p.locator('#bench').boundingBox();
    assert.ok(
      bench.y > 190 && bench.y + bench.height <= 394,
      'landscape tray leaves the middle of the plot visible'
    );
    const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    desktop.on('pageerror', (e) => errors.push(e.message));
    await desktop.goto(origin + '/play/brick-playground-3d');
    await desktop.locator('[data-type="pair"]').click();
    await desktop.locator('#plot').focus();
    await desktop.keyboard.press('ArrowRight');
    await desktop.keyboard.press('r');
    await desktop.keyboard.press('Enter');
    const stored = () =>
      desktop.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.free')));
    assert.deepEqual(
      (await stored()).pieces.map(({ x, r, color }) => [x, r, color]),
      [[1, 1, 'Coral']]
    );
    await desktop.locator('#view').click();
    await desktop.waitForTimeout(250);
    await desktop.locator('#select').click();
    const q = await desktop.evaluate(() => {
      const B = BABYLON,
        s = B.EngineStore.LastCreatedScene,
        e = s.getEngine(),
        c = document.querySelector('canvas');
      const q = B.Vector3.Project(
        new B.Vector3(1.5, 1, 1),
        B.Matrix.Identity(),
        s.getTransformMatrix(),
        s.activeCamera.viewport.toGlobal(e.getRenderWidth(), e.getRenderHeight())
      );
      return [
        (q.x * c.clientWidth) / e.getRenderWidth(),
        (q.y * c.clientHeight) / e.getRenderHeight()
      ];
    });
    await desktop.mouse.click(...q);
    await desktop.getByRole('button', { name: 'Sky', exact: true }).click();
    await desktop.locator('#paint').click();
    assert.equal((await stored()).pieces[0].color, 'Sky');
    await desktop.locator('#duplicate').click();
    await desktop.locator('#place').click();
    assert.equal((await stored()).pieces.length, 2);
    await desktop.locator('#undo').click();
    assert.equal((await stored()).pieces.length, 1);
    await desktop.locator('#select').click();
    await desktop.mouse.click(...q);
    await desktop.locator('#remove').click();
    assert.equal((await stored()).pieces.length, 0);
    await desktop.locator('#undo').click();
    assert.equal((await stored()).pieces[0].color, 'Sky');
    assert.deepEqual(errors, []);
    console.log(
      'Passed: new-tab launch and chat, touch house, walk through doorway, move wall, save and reload, missed deck, retry, delivery and independent worlds.'
    );
  } finally {
    await browser.close();
  }
}
run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
