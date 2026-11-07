// Read the rendered chassis pose to aim the joystick. All mutations go through the game's public controls.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const url = (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d';
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
        hasTouch: mobile,
        isMobile: mobile,
        viewport: mobile ? { width: 393, height: 820 } : { width: 1280, height: 800 }
      });
      const p = await c.newPage(),
        errors = [];
      p.on('pageerror', (e) => errors.push(e.message));
      const activate = async (id) =>
        mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click();
      const saved = () =>
        p.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.garage')));
      const pose = () =>
        p.evaluate(() => {
          const s = BABYLON.EngineStore.LastCreatedScene,
            v = s.getTransformNodeByName('Workshop chassis');
          return {
            x: v.position.x,
            z: v.position.z,
            a: v.rotation.y,
            attached: v.getChildMeshes().filter((m) => m.metadata?.id).length
          };
        });
      const shot = async (name) => {
        if (!process.env.BRICK_SCREENSHOTS) return;
        fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
        await p.screenshot({
          path: path.join(
            process.env.BRICK_SCREENSHOTS,
            name + '-' + (mobile ? 'mobile' : 'desktop') + '.png'
          )
        });
      };
      await p.goto(url);
      await p.locator('#tray button').first().waitFor();
      assert.ok(await p.locator('[data-type="cab"]').isHidden());
      await activate('place');
      const original = await p.evaluate(() => localStorage.getItem('wga.brick-playground.v1.free'));
      await activate('worlds');
      await activate('garageWorld');
      assert.ok(await p.locator('#play').isDisabled());
      await p.locator('#tyres').selectOption('grip');
      await activate('worlds');
      await p.locator('#name').fill('Sunbird');
      await p.locator('button[value=close]').click();
      await p.locator('[data-type="floor"]').click();
      // Aim with arrow keys or by tapping the chassis corner on a phone.
      await activate('view');
      await p.waitForTimeout(220);
      async function stud(x, z, y) {
        const q = await p.evaluate(
          ([x, z, y]) => {
            const B = BABYLON,
              s = B.EngineStore.LastCreatedScene,
              e = s.getEngine(),
              canvas = document.querySelector('#plot');
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
        if (mobile) await p.touchscreen.tap(...q);
        else await p.mouse.click(...q);
      }
      await stud(-1.5, -1.5, 0.96);
      await activate('place');
      await p.locator('[data-type="cab"]').click();
      await p.locator('[aria-label="Sky"]').click();
      await stud(-0.5, 0.5, 1.3);
      await activate('place');
      await p.locator('[data-type="cargo"]').click();
      await p.locator('[aria-label="Sun"]').click();
      await stud(-0.5, -1.5, 1.3);
      await activate('place');
      await p.locator('[data-type="seat"]').click();
      await stud(-0.5, 0.5, 3.3);
      await activate('place');
      assert.equal((await saved()).pieces.length, 4);
      assert.equal((await saved()).pieces.at(-1).y, (await saved()).pieces[1].y);
      assert.deepEqual(
        (await saved()).pieces.map((p) => p.type),
        ['floor', 'cab', 'cargo', 'seat']
      );
      await activate('select');
      await stud(-0.5, 0.5, 3.3);
      await stud(-0.5, 0.5, 3.3);
      assert.equal(await p.locator('#readout').textContent(), 'Seat');
      await p.locator('[aria-label="Chalk"]').click();
      await activate('paint');
      assert.equal((await saved()).pieces.at(-1).color, 'Chalk');
      await stud(-1.5, -1.5, 1.3);
      await activate('remove');
      assert.ok(await p.locator('#play').isDisabled());
      await activate('undo');
      assert.ok(await p.locator('#play').isEnabled());
      await p.reload();
      await p.locator('#tray button').first().waitFor();
      const before = await saved();
      assert.equal(before.tyres, 'grip');
      assert.equal(before.name, 'Sunbird');
      assert.equal(await p.locator('#worldName').textContent(), 'Sunbird');
      assert.equal((await pose()).attached, 4);
      await activate('select'); // Hide the placement ghost while viewing the saved design.
      await shot('workshop');
      await activate('play');
      assert.ok(await p.locator('#routeMap').isVisible());
      await p.waitForFunction(
        () =>
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').parent?.name ===
          'Workshop chassis'
      );
      await shot('starting-grid');
      if (mobile) {
        await p.setViewportSize({ width: 820, height: 393 });
        const status = await p.locator('#garagePanel').boundingBox(),
          map = await p.locator('#routeMap').boundingBox();
        assert.ok(status.x + status.width < map.x);
        await p.setViewportSize({ width: 393, height: 820 });
      }
      // Drive using real touch events or desktop keys, steering toward the lit gate shown in the HUD.
      const touch = await c.newCDPSession(p),
        bounds = await p.locator('#stick').boundingBox();
      const cx = bounds.x + bounds.width / 2,
        cy = bounds.y + bounds.height / 2;
      if (mobile)
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: cx, y: cy - 28 }]
        });
      else await p.keyboard.down('w');
      const gates = [
          [-5, 3.2],
          [3.2, 5],
          [5, -3.2]
        ],
        deadline = Date.now() + 140000;
      let held = null;
      while (Date.now() < deadline) {
        const status = await p.locator('#garageStatus').innerText();
        if (status.includes('lap complete')) break;
        const gate = gates[Number(status.match(/Gate (\d)/)[1]) - 1],
          v = await pose();
        const heading = Math.atan2(gate[0] - v.x, gate[1] - v.z) - v.a;
        const error = Math.atan2(Math.sin(heading), Math.cos(heading));
        if (mobile) {
          const steer = Math.max(-1, Math.min(1, error * 1.6));
          await touch.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: cx + 32 * steer, y: cy - 24 }]
          });
        } else {
          const wanted = error > 0.08 ? 'd' : error < -0.08 ? 'a' : null;
          if (wanted !== held) {
            if (held) await p.keyboard.up(held);
            if (wanted) await p.keyboard.down(wanted);
            held = wanted;
          }
        }
        await p.waitForTimeout(60);
      }
      if (mobile)
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      else {
        await p.keyboard.up('w');
        if (held) await p.keyboard.up(held);
      }
      assert.match(await p.locator('#garageStatus').innerText(), /lap complete/);
      assert.equal((await saved()).complete, true);
      assert.deepEqual((await saved()).pieces, before.pieces);
      await activate('home');
      assert.match(await p.locator('#garageStatus').innerText(), /Gate 1/);
      await activate('build');
      await p.waitForTimeout(120);
      assert.equal((await pose()).x, 0);
      await activate('worlds');
      await activate('freeWorld');
      assert.equal(
        await p.evaluate(() => localStorage.getItem('wga.brick-playground.v1.free')),
        original
      );
      await activate('worlds');
      await activate('garageWorld');
      assert.deepEqual((await saved()).pieces, before.pieces);
      assert.match(await p.locator('#garageStatus').innerText(), /Course cleared/);
      assert.deepEqual(errors, []);
      await c.close();
      console.log(
        (mobile ? 'Phone touch' : 'Desktop keyboard') +
          ': assembled and edited vehicle, prevented unsupported drive, completed ordered lap, restarted and restored independent saves.'
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
