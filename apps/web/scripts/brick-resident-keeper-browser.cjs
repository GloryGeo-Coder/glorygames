// Real browser controls drive a shopkeeper shift with real arrivals and delivered stock.
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
        'resident-keeper-' + name + '-' + (mobile ? 'phone' : 'desktop') + '.png'
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
      town.blocks[28] = { name: 'Neighbourhood Spaza', zone: 'shops' };
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
    assert.ok(await p.locator('#marketStaffed').isDisabled());
    await p.locator('#marketSupplied').check();
    await p.locator('#marketStaffed').check();
    await p.locator('#marketKeeperName').fill('Sipho');
    await tap('marketOpen');
    assert.equal((await save()).market.keeper.name, 'Sipho');
    await closingDialog('residentSetup', () => tap('marketCall'));
    await p.waitForFunction(
      () => {
        const city = JSON.parse(localStorage.getItem('wga.brick-playground.v1.city'));
        return city.resident.phase === 'shopping' && city.family1.phase === 'shopping';
      },
      null,
      { timeout: 150000 }
    );
    assert.equal(
      (await save()).market.receipts.length,
      0,
      'empty shop cannot serve its arrivals'
    );
    await board();
    assert.match(
      await p.locator('#marketKeeperReport').innerText(),
      /Waiting for a stock delivery/
    );
    await tap('marketKeeperPause');
    assert.equal((await save()).market.keeper.paused, true);
    await closingDialog('residentSetup', () => tap('marketRestock'));
    await p.locator('#transportSecond').selectOption('h-5-4');
    await tap('transportNew');
    await closingTransport(() => tap('transportDispatch'));
    await at(-12);
    await tap('transportAction');
    await crates(2);
    await park(12);
    await tap('transportAction');
    await crates(1);
    await stockSign(2);
    const loaded = await save();
    assert.equal(loaded.market.receipts.length, 0, 'paused shift cannot consume the delivery');
    assert.equal(loaded.shopStock[0].units, 2);
    const cargo = loaded.transport;
    await tap('build');
    await board();
    await closingDialog('residentSetup', () => tap('marketWork'));
    await p.waitForFunction(() => {
      const node = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Shopkeeper');
      return node?.isEnabled() && node.metadata.name === 'Sipho';
    });
    await shot('paused-frontage');
    await p.reload();
    await ready();
    assert.equal((await save()).market.keeper.paused, true);
    assert.equal((await save()).market.receipts.length, 0);
    assert.equal((await save()).shopStock[0].units, 2);
    assert.deepEqual((await save()).transport, cargo);
    await board();
    await tap('marketKeeperPause');
    // Native dialogs pause the shift even after Resume is selected.
    const modal = await save();
    await p.waitForTimeout(3500);
    assert.deepEqual((await save()).market, modal.market);
    await closingDialog('residentSetup', () =>
      p.getByRole('button', { name: 'Close resident settings', exact: true }).click()
    );
    await tap('transportButton');
    await closingTransport(() => tap('transportDispatch'));
    await at(12);
    await crates(1);
    assert.ok(
      await p.locator('#brake').isVisible(),
      'player leaves the shop to resume driving'
    );
    await p.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')).market.receipts
          .length === 2,
      null,
      { timeout: 60000 }
    );
    const served = await save();
    assert.deepEqual(
      served.market.receipts.map((r) => r.name),
      ['Lebo', 'Ayanda']
    );
    assert.equal(served.shopStock[0].units, 0);
    assert.equal(served.market.keeper.wait, 0);
    assert.deepEqual(
      served.transport,
      cargo,
      'staff purchases never consume the remaining cargo'
    );
    await shot('remote-service');
    await park(36);
    await tap('transportAction');
    await crates(0);
    assert.equal((await save()).transport.stage, 3);
    assert.equal((await save()).shopStock[0].units, 0);
    await tap('build');
    await board();
    assert.match(await p.locator('#marketKeeperReport').innerText(), /Shift complete/);
    await shot('completed-shift');
    await tap('marketEnd');
    assert.equal((await save()).market, undefined);
    await closingDialog('residentSetup', () =>
      p.getByRole('button', { name: 'Close resident settings', exact: true }).click()
    );
    await p.waitForFunction(
      () =>
        !BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Shopkeeper').isEnabled()
    );
    assert.deepEqual((await save()).pieces, initial.pieces);
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    );
    assert.deepEqual(errors, []);
    console.log(
      'Shopkeeper shift passed: ' +
        (mobile ? 'phone touch' : 'desktop') +
        ': actual arrivals waited for supplies, pause/reload/menu preserved the shift, staff served two households while the player resumed cargo driving, and ending the market removed the worker.'
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
