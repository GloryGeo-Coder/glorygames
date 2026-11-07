// Exercise the actual workshop, district controls and device saves. Scene reads observe the rig.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');

async function testRound(browser, mobile) {
  const context = await browser.newContext({
    isMobile: mobile,
    hasTouch: mobile,
    viewport: mobile ? { width: 393, height: 820 } : { width: 1280, height: 800 }
  });
  try {
    const page = await context.newPage(),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const tap = (id) => (mobile ? page.locator('#' + id).tap() : page.locator('#' + id).click());
    const save = (world) =>
      page.evaluate((w) => JSON.parse(localStorage.getItem('wga.brick-playground.v1.' + w)), world);
    const touch = mobile && (await context.newCDPSession(page));
    const press = async (id) => {
      const r = await page.locator('#' + id).boundingBox();
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [
          {
            x: r.x + r.width / 2,
            y: r.y + r.height / 2 - (id === 'stick' ? 30 : 0)
          }
        ]
      });
    };
    const release = () =>
      touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const photo = async (name) => {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'freight-' + name + (mobile ? '-phone' : '-desktop') + '.png'
        )
      });
    };
    async function park(x) {
      if (mobile) await press('stick');
      else await page.keyboard.down('w');
      await page.waitForFunction(
        (target) =>
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Workshop chassis').position
            .x >= target,
        x - 1.1,
        { timeout: 90000 }
      );
      assert.ok(await page.locator('#handover').isDisabled(), 'a moving truck cannot unload');
      if (mobile) {
        await release();
        await press('brake');
      } else {
        await page.keyboard.up('w');
        await page.keyboard.down('Space');
      }
      try {
        await page.waitForFunction(() => !document.getElementById('handover').disabled, null, {
          timeout: 12000
        });
      } finally {
        if (mobile) await release();
        else await page.keyboard.up('Space');
      }
    }
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    await tap('worlds');
    await tap('districtWorld');
    await tap('handover');
    await tap('build');
    assert.equal((await save('district')).stage, 1);
    await tap('freightStart');
    await tap('starterBuggy');
    await page.locator('#tyres').selectOption('grip');
    await tap('view');
    await tap('select');
    const xy = await page.evaluate(() => {
      const B = BABYLON,
        s = B.EngineStore.LastCreatedScene,
        e = s.getEngine(),
        canvas = e.getRenderingCanvas();
      const p = B.Vector3.Project(
        new B.Vector3(0.5, 2.96, 0.5),
        B.Matrix.Identity(),
        s.getTransformMatrix(),
        s.activeCamera.viewport.toGlobal(e.getRenderWidth(), e.getRenderHeight())
      );
      return [
        (p.x * canvas.clientWidth) / e.getRenderWidth(),
        (p.y * canvas.clientHeight) / e.getRenderHeight()
      ];
    });
    if (mobile) await page.touchscreen.tap(...xy);
    else await page.mouse.click(...xy);
    await page.locator('[aria-label="Plum"]').click();
    await tap('paint');
    const garage = await save('garage');
    assert.equal(garage.pieces.find((p) => p.type === 'cab').color, 'Plum');
    await tap('toMarket');
    assert.equal((await save('district')).freightStop, 1);
    await page.waitForFunction(
      () =>
        BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').parent?.name ===
        'Workshop chassis'
    );
    assert.ok(await page.locator('#brake').isVisible());
    assert.equal(
      await page.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.getMeshByName('Freight freight-cab')
          .sourceMesh.material.diffuseColor.toHexString()
          .toLowerCase()
      ),
      '#935a99'
    );
    await tap('handover');
    assert.equal((await save('district')).freightStop, 2);
    const crates = () =>
      page.evaluate(
        () =>
          [1, 2].filter((i) =>
            BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName(
              'Freight crate ' + i
            ).isEnabled()
          ).length
      );
    assert.equal(await crates(), 2);
    await photo('loaded');
    await park(0);
    await tap('handover');
    assert.equal((await save('district')).freightStop, 3);
    assert.equal(await crates(), 1);
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.equal(await page.locator('#freightStart').innerText(), 'Resume freight');
    await tap('freightStart');
    await page.waitForFunction(
      () =>
        Math.abs(
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Workshop chassis').position.x
        ) < 0.01
    );
    assert.equal(await crates(), 1);
    assert.ok(await page.locator('#handover').isDisabled(), 'must travel on to the spaza');
    await park(16);
    await tap('handover');
    assert.ok((await save('district')).freightComplete);
    assert.equal(await crates(), 0);
    assert.equal((await save('district')).stage, 1);
    await photo('delivered');
    await tap('handover');
    assert.ok(await page.locator('#bench').isVisible());
    assert.deepEqual(await save('garage'), garage);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop keyboard') +
        ': dispatched a custom-painted hauler, delivered two crates, resumed at Market Hall and preserved workshop and foot progress.'
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
    for (const mobile of [true, false]) await testRound(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
