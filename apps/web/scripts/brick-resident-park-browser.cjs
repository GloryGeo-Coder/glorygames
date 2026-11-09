// Assign a household to the starter park, repair its street and resume a seated outing.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function park(browser, mobile) {
  const { world } = await import('../public/games/brick-playground-3d/model.mjs');
  const { citySave } = await import('../public/games/brick-playground-3d/settlement.mjs');
  const { visitFront } = await import('../public/games/brick-playground-3d/resident-trip.mjs');
  const city = world('city'),
    bench = city.pieces.find((p) => p.type === 'bench'),
    spot = visitFront(city, bench, true).seat;
  city.pieces.push({ id: 'footpath-wall', type: 'wall', color: 'Plum', r: 0, x: 9, z: 9, y: 0 });
  city.garden = { plants: [], bouquet: null, displays: [{ id: bench.id, flower: 'marigold' }] };
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
    const tap = (id) => (mobile ? page.locator('#' + id).tap() : page.locator('#' + id).click());
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const status = (text) =>
      page.waitForFunction(
        (text) => document.querySelector('#resState').textContent.includes(text),
        text,
        { timeout: 150000 }
      );
    async function seated() {
      await page.waitForFunction(
        (pos) => {
          const root =
            BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Resident Thandi');
          return (
            root?.isEnabled() &&
            Math.hypot(root.position.x - pos.x, root.position.y - pos.y, root.position.z - pos.z) <
              0.01
          );
        },
        spot,
        { timeout: 45000 }
      );
    }
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    await tap('resSettings');
    await page.locator('#resHousehold').selectOption('new');
    await page.locator('#resName').fill('Thandi');
    await page.locator('#resVisit').selectOption('park');
    assert.equal(await page.locator('#resShop').inputValue(), bench.id);
    await page.locator('#resSchedule').selectOption('14');
    await tap('resStart');
    await status('Thandi · At home');
    await tap('resSkip');
    await status('Thandi · Stopped');
    assert.match(await page.locator('#resHint').innerText(), /street/);
    const initial = await saved();
    await tap('cityMapButton');
    await page.locator('#mapRoute').selectOption('family1');
    assert.match(
      await page.locator('#mapRouteSummary').innerText(),
      /Park bench in E4.*Disconnected/
    );
    await tap('mapConnect');
    await page.getByRole('button', { name: 'Close settlement map' }).click();
    assert.deepEqual((await saved()).streets, initial.streets);
    await tap('cityMapButton');
    await page.locator('#mapRoute').selectOption('family1');
    await tap('mapConnect');
    await page.locator('#townLighting').selectOption('day');
    await tap('mapBuild');
    await tap('resFollow');
    await page.waitForFunction(
      () => document.querySelector('#resHint').textContent.includes('Path blocked in E4'),
      null,
      { timeout: 150000 }
    );
    await tap('resEdit');
    assert.ok(await page.locator('#remove').isEnabled());
    await tap('remove');
    await tap('resFollow');
    await status('Thandi · Resting by marigolds');
    await seated();
    await tap('resSettings');
    await tap('resPause');
    const paused = (await saved()).family1;
    assert.ok(paused.paused && paused.park && paused.wait > 0 && paused.phase === 'shopping');
    if (process.env.BRICK_SCREENSHOTS) {
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'park-visitor-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    await status('Thandi · Paused');
    await seated();
    assert.deepEqual((await saved()).family1, paused);
    await tap('resSettings');
    await tap('resPause');
    await status('Walking home');
    await status('Thandi · At home');
    const done = await saved();
    assert.equal(done.family1.routine.visits, 1);
    assert.deepEqual(done.garden, initial.garden);
    assert.deepEqual(
      done.pieces,
      initial.pieces.filter((p) => p[0] !== 'footpath-wall')
    );
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Touch' : 'Desktop') +
        ' assigned the park bench, repaired a missing street and a blocked footpath, reopened the seated visitor and completed the scheduled walk home.'
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
    for (const mobile of [true, false]) await park(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
