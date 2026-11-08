// Create adjoining neighbourhoods, then cross their shared street on foot.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function visit(browser, mobile) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
    isMobile: mobile,
    hasTouch: mobile
  });
  try {
    const page = await ctx.newPage(),
      errors = [];
    const touch = mobile && (await ctx.newCDPSession(page));
    page.on('pageerror', (e) => errors.push(e.message));
    const click = (el) => (mobile ? el.tap() : el.click());
    const tap = (id) => click(page.locator('#' + id));
    const block = (id) => page.locator('#mapBlock').selectOption(String(id));
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const board = async () => {
      await tap('cityMapButton');
      await click(page.locator('#areaBoard > summary'));
    };
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    await tap('worlds');
    await tap('cityWorld');
    await tap('worlds');
    await page.locator('#name').fill('Sisonke');
    await click(page.getByRole('button', { name: 'Close menu' }));
    const before = await saved();
    async function shape() {
      await board();
      await page.locator('#areaName').fill('Market Quarter');
      assert.equal(
        await page.locator('#areaMembership').isDisabled(),
        false,
        (await page.locator('#areaHint').innerText()) + ' ' + errors.join(', ')
      );
      await tap('areaMembership');
      const atlas = page.locator('#cityAtlas');
      await atlas.scrollIntoViewIfNeeded();
      const r = await atlas.boundingBox();
      const x = r.x + (r.width * 4.5) / 8,
        y = r.y + (r.height * 3.5) / 8;
      if (mobile) await page.touchscreen.tap(x, y);
      else await page.mouse.click(x, y);
      assert.equal(await page.locator('#mapBlock').inputValue(), '28');
      await tap('areaMembership');
      assert.match(await page.locator('#areaStats').innerText(), /2 blocks · 2 built/);
      await block(47);
      assert.ok(await page.locator('#areaMembership').isDisabled());
      await block(35);
      await page.locator('#areaList').selectOption('');
      await page.locator('#areaName').fill('Station Side');
      await tap('areaMembership');
      await block(27);
    }
    await shape();
    await click(page.getByRole('button', { name: 'Close settlement map' }));
    assert.deepEqual((await saved()).blocks, before.blocks);
    await shape();
    await tap('mapBuild');
    assert.equal((await saved()).blocks[35].neighbourhood, 'Station Side');
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.equal(await page.locator('#areaLocation').innerText(), 'Market Quarter');
    const signs = () =>
      page.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.meshes
          .filter((m) => m.name === 'Market Quarter' || m.name === 'Station Side')
          .map((m) => m.name)
          .sort()
      );
    assert.deepEqual(await signs(), ['Market Quarter', 'Station Side']);
    await board();
    await page.locator('#areaName').fill('Market Square');
    await tap('areaRename');
    await tap('mapBuild');
    assert.equal((await saved()).blocks[28].neighbourhood, 'Market Square');
    await tap('undo');
    assert.equal((await saved()).blocks[27].neighbourhood, 'Market Quarter');
    await board();
    if (process.env.BRICK_SCREENSHOTS) {
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'neighbourhood-map-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    await tap('mapWalk');
    if (mobile) {
      const r = await page.locator('#stick').boundingBox();
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: r.x + r.width / 2, y: r.y + r.height / 2 + 29 }]
      });
    } else await page.keyboard.down('s');
    try {
      await page.waitForFunction(
        () => document.querySelector('#areaLocation').textContent === 'Station Side',
        null,
        { timeout: 60000 }
      );
    } finally {
      if (mobile)
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      else await page.keyboard.up('s');
    }
    await board();
    assert.ok(await page.locator('#areaEdit').isHidden());
    assert.equal(await page.locator('#areaList').inputValue(), 'Station Side');
    await click(page.getByRole('button', { name: 'Close settlement map' }));
    await tap('build');
    await board();
    await tap('areaDissolve');
    await tap('mapBuild');
    assert.equal((await saved()).blocks[35]?.neighbourhood, undefined);
    assert.ok(!(await signs()).includes('Station Side'));
    await tap('undo');
    assert.equal((await saved()).blocks[35].neighbourhood, 'Station Side');
    assert.deepEqual((await saved()).pieces, before.pieces);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Touch' : 'Desktop') +
        ' created, cancelled, saved, renamed and restored adjoining neighbourhoods; crossed their shared street and saw the location change.'
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
