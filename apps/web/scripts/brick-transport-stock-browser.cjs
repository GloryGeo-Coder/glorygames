// Real browser controls drive a stocked spaza, unload cargo, walk inside and serve real shoppers.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function delivery(browser, mobile) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1280, height: 800 },
    isMobile: mobile,
    hasTouch: mobile
  });
  const p = await ctx.newPage(),
    errors = [];
  p.on('pageerror', (error) => errors.push(error.message));
  const tap = (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
  const ready = () => p.locator('#tray button').first().waitFor();
  const shot = async (name) => {
    if (!process.env.BRICK_SCREENSHOTS) return;
    fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
    await p.screenshot({
      path: path.join(
        process.env.BRICK_SCREENSHOTS,
        'transport-stock-' + name + '-' + (mobile ? 'phone' : 'desktop') + '.png'
      )
    });
  };
  try {
    async function closingDialog(id, action) {
      // The native dialog close event clears held inputs asynchronously. Let it finish before
      // pressing a new key, rather than racing that intentional safety reset.
      // Register before clicking, but start the close timeout only after Playwright completes
      // its own actionability/click wait. Slow software-rendered frames can delay the click.
      await p.evaluate((id) => {
        window.__transportDialogClosed ??= {};
        window.__transportDialogClosed[id] = false;
        document.getElementById(id).addEventListener(
          'close',
          () => {
            window.__transportDialogClosed[id] = true;
          },
          { once: true }
        );
      }, id);
      await action();
      await p.waitForFunction((id) => window.__transportDialogClosed[id] === true, id, {
        timeout: 10000,
        polling: 50
      });
    }
    const closingTransport = (action) => closingDialog('transportSetup', action);
    const cancelTransport = () =>
      closingTransport(() => p.locator('[aria-label="Close transport settings"]').click());
    const save = () =>
      p.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const touch = mobile && (await ctx.newCDPSession(p));
    async function press(id, direction = 1) {
      const r = await p.locator('#' + id).boundingBox();
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [
          {
            x: r.x + r.width / 2,
            y: r.y + r.height / 2 - (id === 'stick' ? 30 * direction : 0)
          }
        ]
      });
    }
    const release = () =>
      touch.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: []
      });
    const x = () =>
      p.evaluate(
        () =>
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Workshop chassis')
            .position.x
      );
    // Public actions update the run immediately; the scene copies its pose on the next frame.
    const atPickup = () =>
      p.waitForFunction(
        () =>
          Math.abs(
            BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Workshop chassis')
              .position.x + 12
          ) < 0.1,
        null,
        { timeout: 10000 }
      );
    async function goTo(target, direction = 1) {
      const key = direction > 0 ? 'w' : 's';
      if (mobile) await press('stick', direction);
      else {
        await p.locator('#plot').focus();
        await p.keyboard.down(key);
      }
      await p.waitForFunction(
        ({ target, direction }) => {
          const x =
            BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Workshop chassis')
              .position.x;
          return direction > 0 ? x >= target : x <= target;
        },
        { target, direction },
        { timeout: 60000 }
      );
      if (mobile) {
        await release();
        await press('brake');
      } else {
        await p.keyboard.up(key);
        await p.keyboard.down('Space');
      }
      try {
        // Wait for a stopped rendered pose, not wall-clock time: slow frames clamp simulation dt.
        await p.waitForFunction(
          async () => {
            const rig =
              BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Workshop chassis');
            const before = rig.position.x;
            await new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve))
            );
            return rig.position.x === before;
          },
          null,
          { timeout: 10000 }
        );
      } finally {
        if (mobile) await release();
        else await p.keyboard.up('Space');
      }
    }

    async function park(target) {
      const direction = Math.sign(target - (await x()));
      await goTo(target - direction * 2.2, direction);
      for (let attempt = 0; attempt < 12; attempt++) {
        if (await p.locator('#transportAction').isEnabled()) return;
        const current = await x(),
          correction = Math.sign(target - current);
        assert.notEqual(correction, 0);
        await goTo(
          current + correction * Math.min(0.5, Math.abs(target - current) / 2),
          correction
        );
      }
      assert.ok(await p.locator('#transportAction').isEnabled(), 'park using driving controls');
    }
    async function crates(expected) {
      await p.waitForFunction((expected) => {
        const scene = BABYLON.EngineStore.LastCreatedScene;
        return (
          scene.transformNodes.filter(
            (n) => /^Freight crate [12]$/.test(n.name) && n.isEnabled()
          ).length === expected
        );
      }, expected);
    }
    async function at(target) {
      await p.waitForFunction(
        (target) =>
          Math.abs(
            BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Workshop chassis')
              .position.x - target
          ) < 0.1,
        target
      );
    }
    async function board() {
      await tap('resSettings');
      if (!(await p.locator('#marketBoard').evaluate((e) => e.open))) {
        if (mobile) await p.locator('#marketBoard summary').tap();
        else await p.locator('#marketBoard summary').click();
      }
    }
    async function walkToTill(prefix) {
      await board();
      await closingDialog('residentSetup', () => tap('marketWork'));
      if (mobile) await press('stick');
      else {
        await p.locator('#plot').focus();
        await p.keyboard.down('w');
      }
      try {
        await p.waitForFunction(
          (prefix) => document.getElementById('marketTill').textContent.startsWith(prefix),
          prefix,
          { timeout: 60000 }
        );
      } finally {
        if (mobile) await release();
        else await p.keyboard.up('w');
      }
    }
    async function stockSign(units) {
      await p.waitForFunction((units) => {
        const sign = BABYLON.EngineStore.LastCreatedScene.getMeshByName('Shop stock sign');
        return sign?.isEnabled() && sign.metadata.stock === units;
      }, units);
    }
    const origin = process.env.GAME_ORIGIN || 'http://127.0.0.1:3000';
    await p.goto(origin + '/play/brick-playground-3d');
    await ready();
    await p.evaluate(async () => {
      const base = '/games/brick-playground-3d/';
      const { world, saveKey } = await import(base + 'model.mjs');
      const { citySave, moveIn } = await import(base + 'settlement.mjs');
      const { newTrip } = await import(base + 'resident-trip.mjs');
      const { starterBuggy } = await import(base + 'freight.mjs');
      const { newTransport } = await import(base + 'transport.mjs');
      const town = world('city');
      const [home, shop, home2] = [-13, 11, 35].map((x, i) => ({
        id: 'stock-door-' + i,
        type: 'door',
        color: 'Lagoon',
        x,
        y: 0,
        z: 4,
        r: 0
      }));
      town.pieces = [
        home,
        shop,
        home2,
        { id: 'shop-left', type: 'wall', color: 'Sun', x: 7, y: 0, z: 4, r: 0 },
        { id: 'shop-right', type: 'wall', color: 'Sun', x: 14, y: 0, z: 4, r: 0 },
        { id: 'shop-back', type: 'wall', color: 'Lagoon', x: 11, y: 0, z: 9, r: 0 }
      ];
      town.streets = ['h-3-4', 'h-4-4', 'h-5-4'];
      town.streetNames = {
        'h-3-4': 'Depot Lane',
        'h-4-4': 'Spaza Street',
        'h-5-4': 'Park Road'
      };
      town.resident = newTrip(home, shop);
      moveIn(town, 'Ayanda', 'spaza', newTrip(home2, shop));
      town.resident.phase = town.family1.phase = 'done';
      town.transport = { ...newTransport('h-3-4', 'h-5-4'), stage: 2 };
      localStorage.setItem(saveKey('city'), citySave(town));
      const garage = world('garage');
      garage.pieces = starterBuggy();
      localStorage.setItem(saveKey('garage'), JSON.stringify(garage));
      localStorage.setItem('wga.brick.active', 'city');
    });
    await p.reload();
    await ready();
    const initial = await save();
    await board();
    await p.locator('#marketDoor').selectOption('stock-door-1');
    await p.locator('#marketSupplied').check();
    await tap('marketOpen');
    assert.equal((await save()).market.supplied, true);
    await closingDialog('residentSetup', () => tap('marketCall'));
    await p.waitForFunction(
      () => {
        const city = JSON.parse(localStorage.getItem('wga.brick-playground.v1.city'));
        return city.resident.phase === 'shopping' && city.family1.phase === 'queue';
      },
      null,
      { timeout: 150000 }
    );
    await walkToTill('Out of stock');
    await stockSign(0);
    await shot('empty');
    await tap('marketTill');
    assert.equal((await save()).market.receipts.length, 0);
    await closingDialog('residentSetup', () => tap('marketRestock'));
    assert.equal(await p.locator('#transportDropoff').inputValue(), 'h-4-4');
    assert.match(await p.locator('#transportStockHint').innerText(), /Spaza Street/);
    assert.deepEqual(
      (await save()).transport,
      initial.transport,
      'planning cannot replace carried cargo'
    );
    await cancelTransport();
    await board();
    await closingDialog('residentSetup', () => tap('marketRestock'));
    await p.locator('#transportSecond').selectOption('h-5-4');
    await tap('transportNew');
    await closingTransport(() => tap('transportDispatch'));
    await at(-12);
    await tap('transportAction');
    await crates(2);
    await park(12);
    assert.equal((await save()).shopStock, undefined, 'parking alone does not grant supplies');
    await tap('transportAction');
    await crates(1);
    await stockSign(2);
    let data = await save();
    assert.deepEqual(data.shopStock, [{ shop: 'stock-door-1', units: 2 }]);
    const cargo = data.transport;
    assert.equal(cargo.stage, 2);
    await tap('play');
    await walkToTill('Serve Lebo');
    await shot('stocked');
    await tap('marketTill');
    await stockSign(1);
    data = await save();
    assert.equal(data.shopStock[0].units, 1);
    assert.equal(data.market.receipts.length, 1);
    assert.deepEqual(data.transport, cargo);
    await p.reload();
    await ready();
    assert.equal((await save()).shopStock[0].units, 1);
    assert.deepEqual((await save()).transport, cargo);
    await walkToTill('Serve Ayanda');
    await tap('marketTill');
    await stockSign(0);
    data = await save();
    assert.equal(data.shopStock[0].units, 0);
    assert.equal(data.market.receipts.length, 2);
    assert.deepEqual(data.transport, cargo);
    await shot('served');
    await tap('transportButton');
    await closingTransport(() => tap('transportDispatch'));
    await at(12);
    await crates(1);
    await park(36);
    await tap('transportAction');
    await crates(0);
    assert.equal((await save()).transport.stage, 3);
    assert.equal(
      (await save()).shopStock[0].units,
      0,
      'another street does not stock the shop'
    );
    await tap('play');
    await board();
    await tap('marketEnd');
    assert.equal((await save()).shopStock[0].units, 0);
    assert.deepEqual((await save()).pieces, initial.pieces);
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    );
    assert.deepEqual(errors, []);
    console.log(
      'Stocked spaza passed: ' +
        (mobile ? 'phone touch' : 'desktop') +
        ': real arrivals wait without stock, planned route preserves existing cargo, delivery supplies two purchases, one purchase reloads with remaining cargo, unrelated delivery cannot restock.'
    );
  } catch (error) {
    await shot('failed').catch(() => {});
    throw error;
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
    for (const mobile of [true, false]) await delivery(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
