// Exercise the actual controls. Scene coordinates are read only to release input at a waypoint.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function round(browser, mobile) {
  const context = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1280, height: 800 },
    isMobile: mobile,
    hasTouch: mobile
  });
  try {
    const p = await context.newPage(),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const touch = mobile && (await context.newCDPSession(p));
    const tap = (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
    const save = (k) =>
      p.evaluate((k) => JSON.parse(localStorage.getItem('wga.brick-playground.v1.' + k)), k);
    const pose = () =>
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
          'upstairs-' + name + (mobile ? '-phone' : '-desktop') + '.png'
        )
      });
    };
    async function walk(key, axis, value, hold = false) {
      const sign = key === 'w' || key === 'd' ? 1 : -1;
      if (mobile) {
        const r = await p.locator('#stick').boundingBox();
        const deflection = value === 1.95 || value === -2.2 ? 18 : 30;
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [
            {
              x: r.x + r.width / 2 + (axis === 'x' ? deflection * sign : 0),
              y: r.y + r.height / 2 - (axis === 'z' ? deflection * sign : 0)
            }
          ]
        });
      } else await p.keyboard.down(key);
      try {
        await p.waitForFunction(
          ({ axis, value, sign }) =>
            (BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position[axis] -
              value) *
              sign >=
            0,
          { axis, value, sign },
          { timeout: 90000 }
        );
        if (hold) await p.waitForTimeout(600);
      } catch (e) {
        throw Error(
          'Failed to walk ' +
            key +
            ' to ' +
            value +
            '; reached ' +
            JSON.stringify(await pose()) +
            ' · ' +
            e.message
        );
      } finally {
        if (mobile)
          await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        else await p.keyboard.up(key);
      }
    }
    async function approach() {
      await walk('s', 'z', -9);
      await walk('d', 'x', 3.8);
    }
    await p.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await p.locator('#tray button').first().waitFor();
    await tap('place');
    const free = await save('free');
    await tap('worlds');
    await tap('shopWorld');
    await tap('worlds');
    await p.locator('#name').fill('Kopano Corner');
    await p.getByRole('button', { name: 'Close menu' }).click();
    const starter = (await save('upstairs')).pieces;
    if (mobile) {
      await p.setViewportSize({ width: 820, height: 393 });
      const hud = await p.locator('#shopPanel').boundingBox(),
        bench = await p.locator('#bench').boundingBox();
      assert.ok(hud.y + hud.height < bench.y || hud.x + hud.width <= bench.x);
      await p.setViewportSize({ width: 393, height: 820 });
    }
    await shot('shop');
    await tap('shopAction');
    assert.equal((await save('upstairs')).stage, 1);
    assert.ok(await p.locator('#shopAction').isDisabled());
    await walk('w', 'z', 2.65);
    await tap('shopAction');
    assert.equal((await save('upstairs')).stage, 2);
    assert.equal(await p.locator('#jump').isVisible(), false);
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.equal(await p.locator('#worldName').innerText(), 'Kopano Corner');
    await tap('play');
    await p.waitForFunction(() =>
      BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName(
        'Flat delivery parcel'
      ).isEnabled()
    );
    await approach();
    await walk('w', 'z', -2.4, true);
    const blocked = await pose();
    assert.ok(blocked.z < -2 && blocked.y === 1);
    assert.ok(await p.locator('#shopAction').isDisabled());
    await walk('s', 'z', -6.3);
    await tap('build');
    await tap('aimStairs');
    assert.ok(await p.locator('#place').isEnabled());
    await tap('place');
    assert.equal((await save('upstairs')).pieces.at(-1).y, 1);
    await tap('play');
    await walk('w', 'z', 1.95);
    assert.ok(Math.abs((await pose()).y - 3) < 0.01);
    await walk('a', 'x', 1.65);
    await p.waitForFunction(
      () => BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.y < 1,
      null,
      { timeout: 9000 }
    );
    assert.ok(
      await p.locator('#shopAction').isDisabled(),
      'falling below the flat does not deliver'
    );
    await tap('build');
    await tap('aimLink');
    await tap('place');
    const repaired = await save('upstairs');
    assert.equal(repaired.pieces.length, starter.length + 2);
    await tap('undo');
    assert.equal((await save('upstairs')).pieces.length, starter.length + 1);
    await tap('aimLink');
    await tap('place');
    await tap('play');
    await tap('home');
    await approach();
    await walk('w', 'z', 1.95);
    await walk('a', 'x', -2.2);
    const destination = await pose();
    assert.ok(
      Math.abs(destination.y - 3) < 0.03 && !(await p.locator('#shopAction').isDisabled()),
      'Final handover at ' + JSON.stringify(destination)
    );
    await tap('shopAction');
    assert.equal((await save('upstairs')).stage, 3);
    assert.ok((await save('upstairs')).complete);
    assert.ok(await p.locator('#jump').isVisible());
    await shot('delivered');
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.equal(await p.locator('#shopProgress').innerText(), 'Parcel delivered');
    assert.equal((await save('upstairs')).pieces.length, starter.length + 2);
    await tap('shopAction');
    assert.equal((await save('upstairs')).stage, 1);
    assert.deepEqual(await save('free'), free);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone joystick' : 'Desktop keyboard') +
        ': picked up, reloaded, stalled, repaired stairs, fell through an open balcony, completed and reopened the flat.'
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
    for (const mobile of [true, false]) await round(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
