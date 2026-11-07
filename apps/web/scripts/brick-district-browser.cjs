// Drive the production controls, reading the rendered avatar only to release inputs at waypoints.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

async function play(browser, mobile) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1280, height: 800 },
    isMobile: mobile,
    hasTouch: mobile
  });
  try {
    const p = await context.newPage(),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const tap = (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
    const save = () =>
      p.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.district')));
    const client = mobile ? await context.newCDPSession(p) : null;
    const position = () =>
      p.evaluate(() => {
        const a = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position;
        return { x: a.x, y: a.y, z: a.z };
      });
    const shot = async (name) => {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await p.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          name + (mobile ? '-phone' : '-desktop') + '.png'
        )
      });
    };
    async function move(key, axis, value) {
      const sign = ['w', 'd'].includes(key) ? 1 : -1;
      const start = await position();
      if (mobile) {
        const r = await p.locator('#stick').boundingBox();
        await client.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [
            {
              x: r.x + r.width / 2 + (axis === 'x' ? sign * 30 : 0),
              y: r.y + r.height / 2 - (axis === 'z' ? sign * 30 : 0)
            }
          ]
        });
      } else await p.keyboard.down(key);
      try {
        await p.waitForFunction(
          ({ axis, sign, value }) => {
            const a =
              BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position;
            return (a[axis] - value) * sign >= 0;
          },
          { axis, sign, value },
          { timeout: 90000 }
        );
      } catch (e) {
        throw Error(
          'Failed to walk ' +
            key +
            ' to ' +
            value +
            ' from ' +
            JSON.stringify(start) +
            '; reached ' +
            JSON.stringify(await position()) +
            ' · ' +
            e.message
        );
      } finally {
        if (mobile)
          await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        else await p.keyboard.up(key);
      }
    }
    const origin = process.env.GAME_ORIGIN || 'http://127.0.0.1:3000';
    await p.goto(origin + '/play/brick-playground-3d');
    await p.locator('#tray button').first().waitFor();
    await tap('place');
    const free = await p.evaluate(() => localStorage.getItem('wga.brick-playground.v1.free'));
    await tap('worlds');
    await tap('districtWorld');
    await tap('worlds');
    await p.locator('#name').fill('Saturday Market');
    await p.locator('button[value=close]').click();
    if (mobile) {
      await p.setViewportSize({ width: 820, height: 393 });
      const hud = await p.locator('#districtPanel').boundingBox(),
        bench = await p.locator('#bench').boundingBox();
      assert.ok(
        hud.y + hud.height < bench.y || hud.x + hud.width <= bench.x,
        'landscape controls overlap'
      );
      await p.setViewportSize({ width: 393, height: 820 });
    }
    await p.locator('#lot').selectOption('-1');
    await p.waitForFunction(
      () => BABYLON.EngineStore.LastCreatedScene.activeCamera.position.y > 47
    );
    await shot('market-overview');
    await p.locator('#lot').selectOption('1');
    await p.waitForFunction(
      () => BABYLON.EngineStore.LastCreatedScene.activeCamera.position.y < 40
    );
    await shot('market-build');
    await tap('handover');
    assert.equal((await save()).stage, 1);
    assert.equal(await p.locator('#jump').isVisible(), false);
    await move('w', 'z', 1.1);
    await tap('handover');
    assert.equal((await save()).stage, 2);
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.equal(await p.locator('#worldName').innerText(), 'Saturday Market');
    await tap('play');
    assert.ok(Math.abs((await position()).x + 15.5) < 0.1, 'return to serviced depot');
    assert.equal(
      await p.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Market crate').isEnabled()
      ),
      true
    );
    for (const [i, x] of [0, 16].entries()) {
      await move('s', 'z', -4.2);
      await move('d', 'x', x - 0.25);
      await move('w', 'z', -0.35);
      await p.waitForTimeout(100);
      assert.ok((await position()).y < 0.05 && (await p.locator('#handover').isDisabled()));
      const before = await position();
      await tap('build');
      assert.match(await p.locator('#readout').innerText(), /↑0$/, 'approach rests on the new lot');
      // Focus a different lot, then return. This must only move the editor camera.
      await p.locator('#lot').selectOption('0');
      await p.locator('#lot').selectOption(String(i + 1));
      assert.ok(Math.abs((await position()).x - before.x) < 0.02);
      if (i === 1) {
        await p.locator('[data-type=slope]').click();
        await tap('rotate');
      }
      await tap('place');
      assert.ok((await save()).pieces.some((piece) => piece.x === x - 1 && piece.r === 1));
      await tap('play');
      // Back away to approach the bottom of the fitted stairs or ramp.
      await move('s', 'z', -4.2);
      await move('w', 'z', 1.1);
      if (i === 0) await shot('market-weigh');
      await tap('handover');
      assert.equal((await save()).stage, i + 3);
    }
    assert.ok((await save()).complete);
    await shot('market-delivered');
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.equal(
      await p.locator('#districtStatus').innerText(),
      'Delivery complete. All three stops served.'
    );
    assert.equal((await save()).pieces.length, 3);
    await tap('worlds');
    await tap('freeWorld');
    assert.equal(
      await p.evaluate(() => localStorage.getItem('wga.brick-playground.v1.free')),
      free
    );
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone joystick' : 'Desktop keyboard') +
        ' completed all three stops, repaired two approaches and reopened the saved district.'
    );
  } finally {
    await context.close();
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
    for (const mobile of [true, false]) await play(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
