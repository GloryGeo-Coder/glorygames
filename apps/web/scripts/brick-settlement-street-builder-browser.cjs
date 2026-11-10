// Draw real shared streets, inspect the household connection, and follow the resulting park visit.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function testTown(browser, mobile) {
  const dir = '../public/games/brick-playground-3d/';
  const { world } = await import(dir + 'model.mjs');
  const { citySave, moveIn, SIDE } = await import(dir + 'settlement.mjs');
  const { isEntrance, newTrip } = await import(dir + 'resident-trip.mjs');
  const city = world('city'),
    home = city.pieces.find(isEntrance),
    bench = city.pieces.find((p) => p.type === 'bench');
  const trip = newTrip(home, bench, city);
  trip.paused = true;
  moveIn(city, 'Thandi', 'park', trip);
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
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const tap = (el) => (mobile ? el.tap() : el.click()),
      press = (id) => tap(page.locator('#' + id));
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const junction = (col, row) => String(row * (SIDE + 1) + col);
    const panel = async () => {
      await press('cityMapButton');
      await tap(page.locator('#streetBuilder > summary'));
    };
    const close = () => tap(page.getByRole('button', { name: 'Close settlement map' }));
    const pick = async (col, row) => {
      const atlas = page.locator('#cityAtlas');
      await atlas.scrollIntoViewIfNeeded();
      const r = await atlas.boundingBox(),
        x = r.x + (r.width * col) / SIDE,
        y = r.y + (r.height * row) / SIDE;
      if (mobile) await page.touchscreen.tap(x, y);
      else await page.mouse.click(x, y);
    };
    async function stageRoad(useMap) {
      await panel();
      if (useMap) {
        await pick(3, 4);
        await pick(6, 5);
      } else {
        await page.locator('#streetStart').selectOption(junction(3, 4));
        await page.locator('#streetEnd').selectOption(junction(6, 5));
      }
      assert.match(await page.locator('#streetEffects').innerText(), /Thandi gains/);
      await page.locator('#streetBend').selectOption('vertical');
      assert.equal(await page.locator('#streetEffects').innerText(), '');
      await page.locator('#streetBend').selectOption('horizontal');
      assert.match(await page.locator('#streetHint').innerText(), /96 studs · 3 sections to lay/);
      if (useMap && process.env.BRICK_SCREENSHOTS) {
        fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
        await page.screenshot({
          path: path.join(
            process.env.BRICK_SCREENSHOTS,
            'street-builder-' + (mobile ? 'phone' : 'desktop') + '.png'
          )
        });
      }
      await press('stageStreet');
      assert.equal(await page.locator('#streetStart').inputValue(), junction(6, 5));
      await page.locator('#streetEnd').selectOption(junction(8, 5));
      await press('stageStreet');
    }
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    const initial = await saved();
    await stageRoad(true);
    assert.deepEqual((await saved()).streets, initial.streets);
    await close();
    await stageRoad(false);
    await press('mapBuild');
    const paved = [...initial.streets, 'h-4-4', 'h-5-4', 'v-6-4', 'h-6-5', 'h-7-5'];
    assert.deepEqual((await saved()).streets, paved);
    await press('undo');
    assert.deepEqual((await saved()).streets, initial.streets);
    await stageRoad(false);
    await press('mapBuild');
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.deepEqual((await saved()).streets, paved);
    await panel();
    await page.locator('#streetStart').selectOption(junction(4, 4));
    await page.locator('#streetEnd').selectOption(junction(5, 4));
    assert.ok(await page.locator('#stageStreet').isDisabled());
    await page.locator('#streetMode').selectOption('remove');
    assert.match(await page.locator('#streetEffects').innerText(), /Thandi loses/);
    await press('stageStreet');
    await press('mapBuild');
    assert.ok(!(await saved()).streets.includes('h-4-4'));
    await press('undo');
    assert.deepEqual((await saved()).streets, paved);
    await press('resSettings');
    await press('resPause');
    await page.waitForFunction(
      () => document.querySelector('#resState').textContent.includes('Resting in the park'),
      null,
      { timeout: 150000 }
    );
    await page.waitForFunction(
      () => document.querySelector('#resState').textContent.includes('Home again'),
      null,
      { timeout: 150000 }
    );
    await press('play');
    await press('cityMapButton');
    assert.ok(await page.locator('#streetBuilder').isHidden());
    await close();
    const done = await saved();
    assert.deepEqual(done.pieces, initial.pieces);
    assert.deepEqual(done.blocks, initial.blocks);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Touch' : 'Desktop') +
        ' drew both bends, extended a road, cancelled, saved, removed and undid roadworks, then watched Thandi reach her bench and return home.'
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
    for (const mobile of [true, false]) await testTown(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
