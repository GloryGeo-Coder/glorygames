// Exercise pavement arrivals and a physical entrance queue through touch and desktop controls.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function fixture() {
  const g = '../public/games/brick-playground-3d/';
  const { world } = await import(g + 'model.mjs'),
    { BLOCKS, blockIndex, citySave, moveIn } = await import(g + 'settlement.mjs');
  const { stageBlockRow } = await import(g + 'block-expansion.mjs'),
    { newTrip, practiceSpaza, isEntrance, entrance } = await import(g + 'resident-trip.mjs');
  const base = world('city'),
    home = base.pieces.find(isEntrance),
    shop = practiceSpaza(base).map((p, i) => ({ ...p, id: 'market-' + i }));
  base.pieces = [...base.pieces, ...shop];
  const data = stageBlockRow(base, {
    source: BLOCKS[27],
    first: BLOCKS[36],
    count: 1,
    direction: 'east',
    turns: 2
  });
  const door = shop.find(isEntrance);
  data.resident = newTrip(home, door);
  moveIn(data, 'Ayanda', 'spaza', newTrip(blockIndex(data.pieces)[36].find(isEntrance), door));
  for (const t of [data.resident, data.family1]) t.phase = 'done';
  data.transport = { pickup: 'h-3-4', dropoff: 'h-4-4', stage: 2 };
  const { queuePosition } = await import(g + 'entrance-queue.mjs');
  return { raw: citySave(data), shop: door.id, blocker: shop.at(-1).id,
    queue: queuePosition(data, data.family1, entrance(door)), doorway: entrance(door).center };
}
async function pavementQueue(browser, mobile) {
  const seed = await fixture(),
    ctx = await browser.newContext({
      viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
      isMobile: mobile,
      hasTouch: mobile
    });
  try {
    await ctx.addInitScript((raw) => {
      if (!localStorage.getItem('wga.brick-playground.v1.city')) {
        localStorage.setItem('wga.brick.active', 'city');
        localStorage.setItem('wga.brick-playground.v1.city', raw);
      }
    }, seed.raw);
    const p = await ctx.newPage(),
      errors = [],
      touch = mobile && (await ctx.newCDPSession(p));
    p.on('pageerror', (e) => errors.push(e.message));
    const tap = (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
    const saved = () =>
      p.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    async function openBoard() {
      await tap('resSettings');
      const summary = p.locator('#marketBoard summary');
      if (!(await p.locator('#marketBoard').evaluate((el) => el.open))) {
        if (mobile) await summary.tap();
        else await summary.click();
      }
    }
    async function walkToTill() {
      await openBoard();
      await tap('marketWork');
      assert.equal(await p.locator('#jump').isVisible(), true);
      assert.ok(
        !(await p.locator('#marketTill').innerText()).startsWith('Serve'),
        'cannot serve from the pavement'
      );
      if (mobile) {
        const r = await p.locator('#stick').boundingBox();
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: r.x + r.width / 2, y: r.y + r.height / 2 - 28 }]
        });
      } else await p.keyboard.down('w');
      try {
        await p.waitForFunction(
          () => {
            const hint = document.querySelector('#marketTill').textContent;
            return hint.startsWith('Serve ') || / · Till [A-H][1-8] · [01] studs/.test(hint);
          },
          null,
          { timeout: 75000 }
        );
      } finally {
        if (mobile)
          await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        else await p.keyboard.up('w');
      }
      // Wait at the till while the next customer physically leaves the queue.
      await p.waitForFunction(
        () => document.querySelector('#marketTill').textContent.startsWith('Serve '),
        null,
        { timeout: 150000 }
      );
    }
    await p.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await p.locator('#tray button').first().waitFor();
    await openBoard();
    await p.locator('#marketDoor').selectOption(seed.shop);
    await tap('marketOpen');
    await tap('marketCall');
    await p.waitForFunction(
      () => document.querySelector('#resState').textContent.includes('Stopped'),
      null,
      { timeout: 150000 }
    );
    assert.deepEqual((await saved()).market.receipts, []);
    await tap('resEdit');
    assert.equal(await p.locator('#readout').innerText(), 'Single');
    await tap('move');
    if (mobile) await p.getByRole('button', { name: 'Move north', exact: true }).tap();
    else {
      await p.locator('#plot').focus();
      await p.keyboard.press('ArrowUp');
    }
    await tap('place');
    const repaired = await saved();
    assert.equal(
      repaired.pieces.find((b) => b[0] === seed.blocker)[5],
      JSON.parse(seed.raw).pieces.find((b) => b[0] === seed.blocker)[5] + 1
    );
    await p.waitForFunction(
      () => {
        const w = JSON.parse(localStorage.getItem('wga.brick-playground.v1.city'));
        return w.resident.phase === 'shopping' && w.family1.phase === 'queue';
      },
      null,
      { timeout: 150000 }
    );
    await p.waitForFunction((spot) => {
      const c = JSON.parse(localStorage.getItem('wga.brick-playground.v1.city'));
      return Math.hypot(c.family1.x - spot.x, c.family1.z - spot.z) < 0.025;
    }, seed.queue, { timeout: 45000 });
    // Pause the waiting household using its actual controls, then reopen the save.
    const queued = await saved();
    assert.ok(Math.hypot(queued.resident.x - queued.family1.x, queued.resident.z - queued.family1.z) >= 0.65,
      'customers have distinct waiting positions');
    assert.ok(Math.hypot(queued.family1.x - seed.doorway.x, queued.family1.z - seed.doorway.z) >= 0.65,
      'the waiting position keeps the doorway clear');
    await tap('resOther');
    assert.match(await p.locator('#resState').innerText(), /Ayanda/);
    await tap('resSettings');
    await tap('resPause');
    const paused = await saved();
    assert.equal(paused.family1.paused, true);
    assert.equal(paused.family1.phase, 'queue');
    const queuePoint = { x: paused.family1.x, z: paused.family1.z };
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.deepEqual({ x: (await saved()).family1.x, z: (await saved()).family1.z }, queuePoint);
    assert.equal((await saved()).family1.paused, true);
    assert.deepEqual((await saved()).market.receipts, []);
    assert.deepEqual((await saved()).transport, paused.transport);
    await tap('resOther');
    assert.match(await p.locator('#resState').innerText(), /Ayanda/);
    await tap('resSettings');
    await tap('resPause');
    assert.equal((await saved()).family1.paused, false);
    const actual = await p.evaluate(() => {
      const scene = BABYLON.EngineStore.LastCreatedScene;
      const a = scene.getTransformNodeByName('Resident Lebo');
      const b = scene.getTransformNodeByName('Resident Ayanda');
      return a && b && a.isEnabled() && b.isEnabled()
        ? Math.hypot(a.position.x - b.position.x, a.position.z - b.position.z) : null;
    });
    // Residents can be culled when the builder is far away; save positions remain authoritative.
    if (actual !== null) assert.ok(actual >= 0.65);
    assert.ok(
      await p.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName(
          'Market day storefront'
        ).isEnabled()
      )
    );
    assert.equal(
      await p.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.getMeshByName('Shopping bag produce').isEnabled()
      ),
      false
    );
    await walkToTill();
    if (process.env.BRICK_SCREENSHOTS) {
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await p.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'pavement-queue-till-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    await tap('marketTill');
    const half = await saved();
    assert.notEqual(half.family1.phase, 'shopping', 'a receipt cannot teleport the next visitor to the till');
    const afterService = { x: half.family1.x, z: half.family1.z };
    await p.waitForFunction(() => {
      const c = JSON.parse(localStorage.getItem('wga.brick-playground.v1.city'));
      return c.family1.phase === 'shopping';
    }, null, { timeout: 150000 });
    const advanced = await saved();
    assert.ok(Math.hypot(advanced.family1.x - afterService.x, advanced.family1.z - afterService.z) > 0.65,
      'the second visitor walks from the waiting slot to the till');
    assert.equal(advanced.market.receipts.length, 1, 'walking to the till never makes an extra purchase');
    assert.equal(half.transport.stage, 2, 'serving the first household preserves loaded cargo');
    assert.deepEqual(
      half.market.receipts.map((r) => r.name),
      ['Lebo']
    );
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.deepEqual((await saved()).market.receipts, half.market.receipts);
    assert.deepEqual((await saved()).transport, half.transport, 'market reload preserves cargo');
    await walkToTill();
    assert.equal(await p.locator('#marketTill').innerText(), 'Serve Ayanda');
    await tap('marketTill');
    const finished = await saved();
    assert.deepEqual(
      finished.market.receipts.map((r) => r.name),
      ['Lebo', 'Ayanda']
    );
    assert.deepEqual(finished.pieces, repaired.pieces);
    assert.deepEqual(finished.transport, half.transport, 'completed market preserves cargo');
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.match(await p.locator('#marketTill').innerText(), /complete/);
    await tap('marketTill');
    assert.match(await p.locator('#marketReceipts').innerText(), /Ayanda/);
    await tap('marketEnd');
    assert.equal((await saved()).market, undefined);
    assert.deepEqual((await saved()).transport, half.transport, 'clearing the market keeps cargo');
    assert.deepEqual((await saved()).pieces, repaired.pieces);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop keyboard/mouse') +
        ' followed pavement arrivals, repaired the blocked doorway, kept a distinct entrance queue through pause/reload, then served two physical arrivals without duplicating purchases or cargo.'
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
    for (const mobile of [true, false]) await pavementQueue(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
