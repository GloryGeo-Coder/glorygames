// Exercise the production game through the same touch and mouse controls as the player.
// Scene reads verify the actual meshes; the tests never set a bridge or traffic state directly.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
const origin = process.env.GAME_ORIGIN || 'http://127.0.0.1:3000';
async function run() {
  const b = await chromium.launch({
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
      const c = await b.newContext({
        viewport: mobile ? { width: 393, height: 820 } : { width: 1280, height: 800 },
        isMobile: mobile,
        hasTouch: mobile
      });
      const p = await c.newPage(),
        errors = [];
      p.on('pageerror', (e) => errors.push(e.message));
      const tap = async (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
      const saved = () =>
        p.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.canal')));
      const status = (prefix) =>
        p.waitForFunction(
          (text) => document.getElementById('canalStatus').textContent.includes(text),
          prefix,
          { timeout: 75000 }
        );
      const scene = () =>
        p.evaluate(() => {
          const s = BABYLON.EngineStore.LastCreatedScene;
          return {
            angle: s.getTransformNodeByName('west lifting leaf').rotation.z,
            westY: s.getMeshByName('starter-west').getAbsolutePosition().y,
            ferry: s.getTransformNodeByName('Canal ferry').position.z,
            buggy: s.getTransformNodeByName('Delivery buggy').position.x
          };
        });
      const shot = async (name) => {
        if (!process.env.BRICK_SCREENSHOTS) return;
        fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
        await p.screenshot({
          path: path.join(
            process.env.BRICK_SCREENSHOTS,
            name + '-' + (mobile ? 'phone' : 'desktop') + '.png'
          )
        });
      };
      await p.goto(origin + '/play/brick-playground-3d');
      await p.locator('#tray button').first().waitFor();
      await tap('place');
      const free = await p.evaluate(() => localStorage.getItem('wga.brick-playground.v1.free'));
      await tap('worlds');
      await tap('canalWorld');
      await tap('worlds');
      await p.locator('#name').fill('Sunbird Wharf');
      await p.locator('button[value=close]').click();
      const starter = await saved();
      assert.equal(starter.pieces.length, 1);
      assert.equal(starter.pieces[0].mount, 'west');
      if (mobile) {
        await p.setViewportSize({ width: 820, height: 393 });
        const hud = await p.locator('#canalPanel').boundingBox(),
          bench = await p.locator('#bench').boundingBox();
        assert.ok(
          hud.y + hud.height < bench.y || hud.x + hud.width <= bench.x,
          'operating controls overlap editor'
        );
        await p.setViewportSize({ width: 393, height: 820 });
      }
      async function aimAt(x, z, y = 0) {
        const xy = await p.evaluate(
          ([x, z, y]) => {
            const B = BABYLON,
              s = B.EngineStore.LastCreatedScene,
              e = s.getEngine(),
              canvas = document.getElementById('plot');
            const v = B.Vector3.Project(
              new B.Vector3(x, y, z),
              B.Matrix.Identity(),
              s.getTransformMatrix(),
              s.activeCamera.viewport.toGlobal(e.getRenderWidth(), e.getRenderHeight())
            );
            return [
              (v.x * canvas.clientWidth) / e.getRenderWidth(),
              (v.y * canvas.clientHeight) / e.getRenderHeight()
            ];
          },
          [x, z, y]
        );
        if (mobile) await p.touchscreen.tap(...xy);
        else await p.mouse.click(...xy);
      }
      if (mobile) {
        await p.locator('[data-type="single"]').tap();
        await tap('place');
        await tap('lever');
        await status('Connect every east leaf brick');
        await tap('undo');
      } else {
        await p.locator('#mount').selectOption('fixed');
        await p.locator('[data-type="single"]').click();
        await aimAt(-3.6, -0.55);
        await tap('place');
        await tap('lever');
        await status('fixed brick is blocking the west hinge');
        assert.equal((await scene()).angle, 0);
        await tap('undo');
      }
      await p.locator('#mount').selectOption('east');
      await p.locator('[data-type="deck"]').click();
      await tap('dispatch');
      await status('boat touched the west leaf');
      assert.ok((await scene()).ferry > -3 && (await scene()).ferry < 0);
      await tap('dispatch');
      assert.deepEqual((await saved()).pieces, starter.pieces);
      if (mobile) {
        await p.locator('#liftLimit').selectOption('10');
        await tap('lever');
        await status('raised leaves');
        assert.equal(await p.locator('#angleReadout').textContent(), '10°');
        await tap('dispatch');
        await status('boat touched the west leaf');
        await tap('dispatch');
        await tap('lever');
        await status('Build from the bearings');
        await p.locator('#liftLimit').selectOption('80');
      }
      await tap('lever');
      await status('raised leaves');
      assert.ok(await p.locator('#bench').isHidden());
      assert.ok(await p.locator('#play').isDisabled());
      let pose = await scene();
      assert.ok(pose.angle > 1.3 && pose.westY > 1, 'mesh must rise with its bearing');
      await tap('dispatch');
      await status('Ferry clear');
      assert.equal((await saved()).boatPassed, true);
      assert.ok(await p.locator('#dispatch').isDisabled());
      await tap('lever');
      await status('Send the buggy');
      await tap('dispatch');
      await status('A wheel lost the deck');
      assert.equal((await saved()).complete, false);
      const failed = await scene();
      assert.ok(failed.buggy > -1 && failed.buggy < 0);
      await tap('dispatch');
      assert.deepEqual((await saved()).pieces, starter.pieces);
      // The editor starts with an east deck preview snapped to the empty bearing.
      assert.equal(await p.locator('#mount').inputValue(), 'east');
      await aimAt(0.5, -0.5);
      await tap('place');
      let repaired = await saved();
      assert.equal(repaired.boatPassed, false);
      assert.deepEqual(
        [repaired.pieces[1].x, repaired.pieces[1].z, repaired.pieces[1].y],
        [0, -1, 0],
        'hidden chassis must not intercept canal placement'
      );
      assert.deepEqual(
        repaired.pieces.map((p) => p.mount),
        ['west', 'east']
      );
      await p.reload();
      await p.locator('#tray button').first().waitFor();
      assert.equal(await p.locator('#worldName').innerText(), 'Sunbird Wharf');
      assert.deepEqual((await saved()).pieces, repaired.pieces);
      await tap('select');
      await shot('canal-repaired');
      await tap('lever');
      await status('raised leaves');
      await shot('canal-opening');
      await tap('dispatch');
      if (process.env.BRICK_SCREENSHOTS) {
        await p.waitForFunction(
          () =>
            BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Canal ferry').position.z >
            -0.5,
          null,
          { timeout: 75000 }
        );
        await shot('canal-ferry-passing');
      }
      await status('Ferry clear');
      assert.equal((await saved()).boatPassed, true);
      await tap('lever');
      await status('Send the buggy');
      // Reopen a road-ready design after refresh; the ferry does not need another retest.
      await p.reload();
      await status('Send the buggy');
      await tap('dispatch');
      await status('Both deliveries complete');
      assert.equal((await saved()).complete, true);
      assert.ok((await scene()).buggy >= 9.3);
      await shot('canal-delivered');
      if (!mobile) {
        await tap('play');
        await p.keyboard.down('w');
        await p.waitForFunction(
          () =>
            BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.z >
            -0.25,
          null,
          { timeout: 60000 }
        );
        await p.keyboard.up('w');
        await p.keyboard.down('d');
        await p.waitForFunction(
          () => {
            const pos =
              BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position;
            return pos.x > -0.5 && pos.x < 2.5 && pos.y > 0.3;
          },
          null,
          { timeout: 60000 }
        );
        await p.waitForFunction(
          () =>
            BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.x > 3.6,
          null,
          { timeout: 60000 }
        );
        await p.keyboard.up('d');
        await tap('build');
      }
      await tap('worlds');
      await tap('freeWorld');
      assert.equal(
        await p.evaluate(() => localStorage.getItem('wga.brick-playground.v1.free')),
        free
      );
      await tap('worlds');
      await tap('canalWorld');
      await status('Both deliveries complete');
      assert.deepEqual((await saved()).pieces, repaired.pieces);
      assert.deepEqual(errors, []);
      await c.close();
      console.log(
        (mobile ? 'Phone touch' : 'Desktop') +
          ': closed-leaf collision, raised ferry transit, failed road test, repair, repeat passage, delivery and separate save passed.'
      );
    }
  } finally {
    await b.close();
  }
}
run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
