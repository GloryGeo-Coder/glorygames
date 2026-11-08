// Build via the real editor. Read-only scene projections aim touch and mouse at the same stud.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function testCopy(browser, mobile) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1280, height: 800 },
    hasTouch: mobile,
    isMobile: mobile
  });
  try {
    const p = await ctx.newPage(),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const click = (locator) => (mobile ? locator.tap() : locator.click());
    const tap = (id) => click(p.locator('#' + id));
    const save = (kind) =>
      p.evaluate((k) => JSON.parse(localStorage.getItem('wga.brick-playground.v1.' + k)), kind);
    async function aim(x, z, y = 0) {
      const q = await p.evaluate(
        ([x, z, y]) => {
          const B = BABYLON,
            s = B.EngineStore.LastCreatedScene,
            e = s.getEngine(),
            c = e.getRenderingCanvas();
          const v = B.Vector3.Project(
            new B.Vector3(x + 0.45, y, z + 0.45),
            B.Matrix.Identity(),
            s.getTransformMatrix(),
            s.activeCamera.viewport.toGlobal(e.getRenderWidth(), e.getRenderHeight())
          );
          return [
            (v.x * c.clientWidth) / e.getRenderWidth(),
            (v.y * c.clientHeight) / e.getRenderHeight()
          ];
        },
        [x, z, y]
      );
      if (mobile) await p.touchscreen.tap(...q);
      else await p.mouse.click(...q);
    }
    const shot = async (name) => {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await p.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'blueprint-' + name + (mobile ? '-phone' : '-desktop') + '.png'
        )
      });
    };
    const waitGame = () => p.locator('#tray button').first().waitFor();
    const piece = (id) => click(p.locator('[data-type="' + id + '"]'));
    await p.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await waitGame();
    await tap('view');
    await p.waitForTimeout(200);
    await piece('floor');
    await aim(0, 0);
    await tap('place');
    await piece('door');
    await click(p.locator('[aria-label="Lagoon"]'));
    for (let i = 0; i < 3; i++) await tap('rotate');
    await aim(0, 0, 1 / 3);
    await tap('place');
    await piece('single');
    await aim(-5, -3);
    await tap('place');
    const source = await save('free');
    assert.equal(source.pieces.length, 3);
    await tap('select');
    await aim(2, 1, 1 / 3);
    assert.equal(await p.locator('#readout').innerText(), 'Floor');
    await tap('blueprints');
    assert.equal(await p.locator('#captureCount').innerText(), '2 bricks');
    await p.locator('#planSource').selectOption('plot');
    assert.equal(await p.locator('#captureCount').innerText(), '3 bricks');
    await p.locator('#planSource').selectOption('group');
    await p.locator('#planName').fill('Corner doorway');
    await tap('savePlan');
    await shot('book');
    const key = await p.locator('#planList').inputValue();
    assert.ok(key.startsWith('wga.brick.blueprint.v1.'));
    await p.reload();
    await waitGame();
    await tap('worlds');
    await tap('districtWorld');
    await p.locator('#lot').selectOption('0');
    await tap('view');
    await p.waitForTimeout(200);
    async function aimCopy(x, z) {
      if (mobile) {
        await aim(x, z);
        return;
      }
      // Exercise precise desktop placement even when the bench covers a distant stud.
      await p.locator('#plot').focus();
      const readout = await p.locator('#readout').innerText();
      const [, ax, az] = readout.match(/\((-?\d+), (-?\d+)\)/);
      for (let i = 0; i < Math.abs(x - ax); i++)
        await p.keyboard.press(x < ax ? 'ArrowLeft' : 'ArrowRight');
      for (let i = 0; i < Math.abs(z - az); i++)
        await p.keyboard.press(z < az ? 'ArrowDown' : 'ArrowUp');
    }
    async function preview() {
      await tap('blueprints');
      await p.locator('#planList').selectOption(key);
      await tap('usePlan');
      if (mobile) await tap('rotate');
      else {
        await p.locator('#plot').focus();
        await p.keyboard.press('r');
      }
    }
    await preview();
    await aimCopy(-17, -3);
    assert.ok(await p.locator('#place').isDisabled(), 'blocked at the occupied depot deck');
    await aimCopy(-18, -7);
    assert.ok(await p.locator('#place').isEnabled(), await p.locator('#readout').innerText());
    assert.equal(
      await p.evaluate(
        () =>
          BABYLON.EngineStore.LastCreatedScene.meshes.filter(
            (m) => m.name === 'Blueprint preview' && m.isEnabled()
          ).length
      ),
      2
    );
    await shot('preview');
    await tap('place');
    const placed = await save('district');
    assert.equal(placed.pieces.length, 3);
    const door = placed.pieces.find((v) => v.type === 'door');
    assert.deepEqual([door.x, door.z, door.r, door.color, door.y], [-17, -7, 0, 'Lagoon', 1 / 3]);
    assert.ok(placed.pieces.slice(1).every((v) => !source.pieces.some((s) => s.id === v.id)));
    assert.ok(await p.locator('#place').isDisabled());
    await p.locator('#copyBase').selectOption('stack');
    assert.ok(await p.locator('#place').isEnabled());
    await tap('place');
    const stacked = await save('district');
    assert.equal(stacked.pieces.length, 5);
    assert.ok(stacked.pieces.slice(3).every((p) => p.y >= door.y + 3));
    await tap('undo');
    assert.deepEqual(await save('district'), placed);
    await tap('undo');
    assert.equal((await save('district')).pieces.length, 1);
    await preview();
    await aimCopy(-18, -7);
    await tap('place');
    await tap('play');
    const touch = mobile && (await ctx.newCDPSession(p));
    if (mobile) {
      const r = await p.locator('#stick').boundingBox();
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: r.x + r.width / 2, y: r.y + r.height / 2 - 30 }]
      });
    } else await p.keyboard.down('w');
    await p.waitForFunction(
      () =>
        BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.z > -5.8,
      null,
      { timeout: 45000 }
    );
    if (mobile) await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    else await p.keyboard.up('w');
    assert.ok(
      await p.evaluate(
        () =>
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.y > 0.3
      )
    );
    await tap('build');
    await p.reload();
    await waitGame();
    assert.equal((await save('district')).pieces.length, 3);
    await tap('blueprints');
    await p.locator('#planList').selectOption(key);
    await tap('deletePlan');
    await tap('deletePlan');
    assert.equal(await p.locator('#planList option').count(), 1);
    assert.deepEqual(await save('free'), source);
    assert.equal((await save('district')).pieces.length, 3);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop keyboard/mouse') +
        ': saved a connected doorway, blocked an overlapping copy, placed and undid a rotated copy, walked through it and reopened it.'
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
    for (const mobile of [true, false]) await testCopy(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
