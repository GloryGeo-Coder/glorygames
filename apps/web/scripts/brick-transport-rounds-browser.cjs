// Real browser controls drive a two-stop round, reload partial cargo and finish in reverse order.
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
        'transport-round-' + name + '-' + (mobile ? 'phone' : 'desktop') + '.png'
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
    const origin = process.env.GAME_ORIGIN || 'http://127.0.0.1:3000';
    await p.goto(origin + '/play/brick-playground-3d');
    await ready();
    await p.evaluate(async () => {
      const { world, saveKey } = await import('/games/brick-playground-3d/model.mjs');
      const { citySave } = await import('/games/brick-playground-3d/settlement.mjs');
      const { starterBuggy } = await import('/games/brick-playground-3d/freight.mjs');
      const town = world('city');
      town.streets = ['h-3-4', 'h-4-4', 'h-5-4'];
      town.streetNames = {
        'h-3-4': 'Depot Lane',
        'h-4-4': 'Market Road',
        'h-5-4': 'Park Road'
      };
      // A clear straight route isolates any-order deliveries from the separate collision suites.
      town.pieces = town.pieces.filter((piece) => piece.z > 6 || piece.z < -10);
      localStorage.setItem(saveKey('city'), citySave(town));
      const garage = world('garage');
      garage.pieces = starterBuggy();
      localStorage.setItem(saveKey('garage'), JSON.stringify(garage));
      localStorage.setItem('wga.brick.active', 'city');
    });
    await p.reload();
    await ready();
    const initial = await save();
    await tap('transportButton');
    await p.locator('#transportPickup').selectOption('h-3-4');
    await p.locator('#transportDropoff').selectOption('h-4-4');
    await p.locator('#transportSecond').selectOption('h-4-4');
    assert.ok(await p.locator('#transportNew').isDisabled(), 'duplicate stops cannot be saved');
    await p.locator('#transportSecond').selectOption('h-5-4');
    await tap('transportNew');
    await shot('setup');
    await closingTransport(() => tap('transportDispatch'));
    await at(-12);
    await crates(0);
    await tap('transportAction');
    await crates(2);
    assert.equal((await save()).transport.stage, 2);
    await p.locator('#transportManifest summary').click();
    const chooseFar = p.locator('#transportStops [data-street="h-5-4"]');
    if (mobile) await chooseFar.tap();
    else await chooseFar.click();
    assert.equal((await save()).transport.dropoff, 'h-5-4');
    await at(-12);
    await crates(2);
    await shot('two-crates');
    await tap('transportButton');
    assert.ok(await p.locator('#transportSecond').isDisabled());
    await cancelTransport();
    await park(36);
    assert.equal(
      (await save()).transport.stops.filter((stop) => stop.delivered).length,
      0,
      'passing the first bay does not deliver automatically'
    );
    await tap('transportAction');
    await crates(1);
    let trip = (await save()).transport;
    assert.equal(trip.stage, 2);
    assert.equal(trip.checkpoint, 'h-5-4');
    assert.equal(trip.dropoff, 'h-4-4');
    assert.ok(await p.locator('#transportStops [data-street="h-5-4"]').isDisabled());
    await shot('one-delivered');
    await goTo(31, -1);
    await tap('home');
    await at(36);
    await crates(1);
    assert.deepEqual((await save()).transport, trip);
    await p.reload();
    await ready();
    assert.deepEqual((await save()).transport, trip);
    await tap('transportButton');
    assert.equal(await p.locator('#transportSecond').inputValue(), 'h-5-4');
    await closingTransport(() => tap('transportDispatch'));
    await at(36);
    await crates(1);
    await park(12);
    await tap('transportAction');
    await crates(0);
    assert.equal(await p.locator('#transportState').innerText(), 'Delivery round complete');
    trip = (await save()).transport;
    assert.equal(trip.stage, 3);
    assert.ok(trip.stops.every((stop) => stop.delivered));
    assert.equal(trip.checkpoint, 'h-4-4');
    if (!(await p.locator('#transportManifest').evaluate((element) => element.open)))
      await p.locator('#transportManifest summary').click();
    await shot('complete');
    assert.deepEqual((await save()).pieces, initial.pieces);
    assert.deepEqual((await save()).streetNames, initial.streetNames);
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    );
    await p.reload();
    await ready();
    assert.deepEqual((await save()).transport, trip);
    await tap('transportButton');
    assert.ok(await p.locator('#transportDispatch').isDisabled());
    assert.match(await p.locator('#transportSaved').innerText(), /Completed:.*delivered/);
    assert.deepEqual(errors, []);
    console.log('Delivery round passed: ' + (mobile ? 'phone touch' : 'desktop'));
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
