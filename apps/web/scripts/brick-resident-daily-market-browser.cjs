// Production controls exercise repeat trading with actual NPC walks and saved stock.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function trading(browser, mobile) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1280, height: 800 },
    isMobile: mobile,
    hasTouch: mobile
  });
  const p = await ctx.newPage(),
    errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const tap = (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
  const save = () =>
    p.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
  const ready = () => p.locator('#tray button').first().waitFor();
  const shot = async (name) => {
    if (!process.env.BRICK_SCREENSHOTS) return;
    fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
    await p.screenshot({
      path: path.join(
        process.env.BRICK_SCREENSHOTS,
        'daily-market-' + name + '-' + (mobile ? 'phone' : 'desktop') + '.png'
      )
    });
  };
  async function board() {
    await tap('resSettings');
    if (!(await p.locator('#marketBoard').evaluate((e) => e.open))) {
      if (mobile) await p.locator('#marketBoard summary').tap();
      else await p.locator('#marketBoard summary').click();
    }
  }
  async function close() {
    // Await the actual closed state and a rendered frame before further input.
    const button = p.getByRole('button', { name: 'Close resident settings', exact: true });
    if (mobile) await button.tap();
    else await button.click();
    await p.waitForFunction(() => !document.getElementById('residentSetup').open);
    await p.evaluate(
      () =>
        new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    );
  }
  async function homeAfterRound(round) {
    await p.waitForFunction(
      (round) => {
        const c = JSON.parse(localStorage.getItem('wga.brick-playground.v1.city'));
        return (
          c.market.daily.round === round &&
          c.market.receipts.length === 2 &&
          c.resident.phase === 'done' &&
          c.family1.phase === 'done'
        );
      },
      round,
      { timeout: 180000 }
    );
  }
  try {
    const origin = process.env.GAME_ORIGIN || 'http://127.0.0.1:3000';
    await p.goto(origin + '/play/brick-playground-3d');
    await ready();
    await p.evaluate(async () => {
      const base = '/games/brick-playground-3d/';
      const { world, saveKey } = await import(base + 'model.mjs');
      const { citySave, moveIn } = await import(base + 'settlement.mjs');
      const { newTrip } = await import(base + 'resident-trip.mjs');
      const c = world('city');
      const [home, shop, home2] = [-13, 11, 35].map((x, i) => ({
        id: 'daily-door-' + i,
        type: 'door',
        color: 'Lagoon',
        x,
        y: 0,
        z: 4,
        r: 0
      }));
      c.pieces = [
        home,
        shop,
        home2,
        { id: 'shop-left', type: 'wall', color: 'Sun', x: 7, y: 0, z: 4, r: 0 },
        { id: 'shop-right', type: 'wall', color: 'Sun', x: 14, y: 0, z: 4, r: 0 },
        { id: 'shop-back', type: 'wall', color: 'Lagoon', x: 11, y: 0, z: 9, r: 0 }
      ];
      c.streets = ['h-3-4', 'h-4-4', 'h-5-4'];
      c.streetNames = { 'h-3-4': 'Depot Lane', 'h-4-4': 'Spaza Street', 'h-5-4': 'Park Road' };
      c.resident = newTrip(home, shop);
      moveIn(c, 'Ayanda', 'spaza', newTrip(home2, shop));
      c.resident.phase = c.family1.phase = 'done';
      c.clockMinutes = 450;
      // Delivered stock from the previous session; physical deliveries are exercised by transport-stock/keeper.
      c.shopStock = [{ shop: shop.id, units: 4 }];
      c.blocks[28] = { name: 'Neighbourhood Spaza', zone: 'shops' };
      localStorage.setItem(saveKey('city'), citySave(c));
      localStorage.setItem('wga.brick.active', 'city');
    });
    await p.reload();
    await ready();
    const initial = await save();
    await board();
    await p.locator('#marketDoor').selectOption('daily-door-1');
    assert.ok(await p.locator('#marketDaily').isDisabled());
    await p.locator('#marketSupplied').check();
    await p.locator('#marketStaffed').check();
    await p.locator('#marketKeeperName').fill('Naledi');
    await p.locator('#marketDaily').check();
    await p.locator('#marketOpening').selectOption('12');
    await tap('marketOpen');
    assert.equal((await save()).market.daily.next, 2160);
    await p.locator('#marketDailyReport').scrollIntoViewIfNeeded();
    await shot('opening-controls');
    await close();
    // No Call shoppers action: resting residents must be invited and walk there themselves.
    await homeAfterRound(1);
    assert.equal((await save()).shopStock[0].units, 2);
    await board();
    await tap('marketDailyPause');
    assert.match(await p.locator('#marketDailyReport').innerText(), /paused/);
    const paused = await save();
    await close();
    await p.waitForTimeout(3500);
    assert.deepEqual((await save()).market, paused.market);
    assert.ok(await p.locator('#resSkip').isHidden());
    await p.reload();
    await ready();
    assert.deepEqual((await save()).market, paused.market);
    await board();
    await tap('marketDailyPause');
    const menu = (await save()).market;
    await p.waitForTimeout(3500);
    assert.deepEqual((await save()).market, menu);
    await close();
    assert.match(await p.locator('#resSkip').innerText(), /next opening/);
    await tap('resSkip');
    await p.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')).market.daily.round ===
        2
    );
    await homeAfterRound(2);
    let c = await save();
    assert.equal(c.market.daily.served, 4);
    assert.equal(c.shopStock[0].units, 0);
    assert.equal(c.market.keeper.name, 'Naledi');
    assert.deepEqual(c.market.daily.recent, [{ round: 1, names: ['Lebo', 'Ayanda'] }]);
    await board();
    await p.locator('#marketDailyReport').scrollIntoViewIfNeeded();
    await shot('saved-history');
    const completed = (await save()).market;
    await p.reload();
    await ready();
    assert.deepEqual((await save()).market, completed);
    await tap('resSkip');
    await p.waitForFunction(
      () => {
        const c = JSON.parse(localStorage.getItem('wga.brick-playground.v1.city'));
        return (
          c.market.daily.round === 3 &&
          c.resident.phase === 'shopping' &&
          c.family1.phase === 'queue'
        );
      },
      null,
      { timeout: 180000 }
    );
    await p.waitForTimeout(3500);
    c = await save();
    assert.equal(c.market.receipts.length, 0);
    assert.equal(c.market.daily.served, 4);
    assert.equal(c.market.daily.recent.length, 2);
    await board();
    assert.match(
      await p.locator('#marketKeeperReport').innerText(),
      /Waiting for a stock delivery/
    );
    await p.locator('#marketDailyReport').scrollIntoViewIfNeeded();
    await shot('restock-needed');
    await tap('marketEnd');
    await close();
    assert.equal((await save()).market, undefined);
    assert.equal((await save()).shopStock[0].units, 0);
    assert.deepEqual((await save()).pieces, initial.pieces);
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    );
    assert.deepEqual(errors, []);
    console.log(
      'Daily market passed: ' +
        (mobile ? 'phone touch' : 'desktop') +
        ': automatic real arrivals, two completed rounds, opening-time skip, pause/menu/reload, staff and stock retention, bounded history and third-round stock shortage.'
    );
  } catch (e) {
    await shot('failed').catch(() => {});
    throw e;
  } finally {
    await ctx.close();
  }
}
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_EXECUTABLE_PATH || process.env.CHROMIUM_PATH || undefined,
    args: [
      '--no-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader'
    ]
  });
  try {
    for (const mobile of [true, false]) await trading(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
