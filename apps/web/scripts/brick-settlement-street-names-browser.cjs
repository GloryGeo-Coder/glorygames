// Name the frontage of the starter house and visit its actual doorway through the directory.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function visit(browser, mobile) {
  const dir = '../public/games/brick-playground-3d/',
    { world } = await import(dir + 'model.mjs'),
    { entrance } = await import(dir + 'resident-trip.mjs');
  const house = world('city').pieces.find((p) => p.type === 'door'),
    front = entrance(house);
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
    isMobile: mobile,
    hasTouch: mobile
  });
  try {
    const page = await ctx.newPage(),
      errors = [],
      touch = mobile && (await ctx.newCDPSession(page));
    page.on('pageerror', (e) => errors.push(e.message));
    const tap = (el) => (mobile ? el.tap() : el.click()),
      press = (id) => tap(page.locator('#' + id));
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const directory = async () => {
      await press('cityMapButton');
      await tap(page.locator('#streetDirectory > summary'));
    };
    const stage = async (mode, name) => {
      await press('cityMapButton');
      await tap(page.locator('#streetBuilder > summary'));
      await page.locator('#streetMode').selectOption(mode);
      await page.locator('#streetStart').selectOption('39');
      await page.locator('#streetEnd').selectOption('40');
      if (name) await page.locator('#streetName').fill(name);
      await press('stageStreet');
    };
    async function sign(name, present = true) {
      await page.waitForFunction(
        ({ name, present }) =>
          !!BABYLON.EngineStore.LastCreatedScene.getMeshByName('Street sign · ' + name) === present,
        { name, present }
      );
    }
    async function photo(name) {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'named-street-' + name + '-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    await press('worlds');
    await press('cityWorld');
    await stage('name', 'Protea Road');
    await tap(page.getByRole('button', { name: 'Close settlement map' }));
    assert.equal((await saved())?.streetNames, undefined);
    await stage('name', 'Protea Road');
    await press('mapBuild');
    await sign('Protea Road');
    const original = await saved();
    assert.deepEqual(original.streetNames, { [front.street]: 'Protea Road' });
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    await sign('Protea Road');
    await stage('name', 'Station Lane');
    await press('mapBuild');
    await sign('Station Lane');
    await sign('Protea Road', false);
    await press('undo');
    await sign('Protea Road');
    await sign('Station Lane', false);
    await stage('remove');
    await press('mapBuild');
    await sign('Protea Road', false);
    assert.equal((await saved()).streetNames, undefined);
    await press('undo');
    await sign('Protea Road');
    assert.deepEqual((await saved()).streetNames, original.streetNames);
    await directory();
    assert.equal(await page.locator('#directoryStreet').inputValue(), 'Protea Road');
    assert.match(await page.locator('#directoryHint').innerText(), /1 ground-floor entrance/);
    await page.locator('#directoryDoor').selectOption(house.id);
    await press('directoryZoom');
    assert.equal(await page.locator('#directoryZoom').innerText(), 'Street close-up');
    await press('directoryZoom');
    await photo('directory');
    await press('directoryWalk');
    await page.waitForFunction((c) => {
      const a = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder');
      return a?.isEnabled() && Math.hypot(a.position.x - c.x, a.position.z - c.z) < 0.05;
    }, front.curb);
    assert.equal(await page.locator('#roadLocation').innerText(), 'Protea Road');
    await photo('pavement');
    if (mobile) {
      const r = await page.locator('#stick').boundingBox();
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: r.x + r.width / 2, y: r.y + r.height / 2 - 29 }]
      });
    } else await page.keyboard.down('w');
    try {
      await page.waitForFunction(
        (z) =>
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.z >= z,
        front.inside.z - 0.1,
        { timeout: 90000 }
      );
    } finally {
      if (mobile)
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      else await page.keyboard.up('w');
    }
    assert.ok(await page.locator('#roadLocation').isHidden());
    await directory();
    await press('directoryWalk');
    await press('build');
    await stage('unname');
    await press('mapBuild');
    await sign('Protea Road', false);
    const cleared = await saved();
    assert.deepEqual(cleared.streets, original.streets);
    assert.deepEqual(cleared.pieces, original.pieces);
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    await press('cityMapButton');
    assert.ok(await page.locator('#streetDirectory').isHidden());
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop') +
        ' named and renamed a road, removed and restored it, reopened the directory, walked from the named pavement into the listed house and cleared its sign.'
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
    for (const mobile of [true, false]) await visit(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
