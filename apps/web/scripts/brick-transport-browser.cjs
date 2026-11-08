// Production UI test. Storage fixtures set up towns and repair one obstruction;
// driving, cargo actions, modal cancellation and recovery use public controls.
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
  let p;
  const errors = [];
  try {
    p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(e.message));
    const tap = (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
    async function closingTransport(action) {
      // The native dialog close event clears held inputs asynchronously. Let it finish before
      // pressing a new key, rather than racing that intentional safety reset.
      const closed = p.evaluate(
        () =>
          new Promise((resolve, reject) => {
            const timer = setTimeout(
              () => reject(new Error('Transport dialog did not close')),
              10000
            );
            document.getElementById('transportSetup').addEventListener(
              'close',
              () => {
                clearTimeout(timer);
                resolve();
              },
              { once: true }
            );
          })
      );
      await Promise.all([closed, action()]);
    }
    const cancelTransport = () =>
      closingTransport(() => p.locator('[aria-label="Close transport settings"]').click());
    const save = () =>
      p.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const ready = () => p.locator('#tray button').first().waitFor();
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
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Workshop chassis').position.x
      );
    // Public actions update the run immediately; the scene copies its pose on the next frame.
    const atPickup = () =>
      p.waitForFunction(
        () =>
          Math.abs(
            BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Workshop chassis').position
              .x + 12
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
            BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Workshop chassis').position
              .x;
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
    async function parkAtDropoff() {
      // Brake early, then use short forward/reverse corrections from the observed pose.
      // Input delivery and rendering latency vary in CI; a single full-speed brake target is brittle.
      await goTo(9.8);
      for (let attempt = 0; attempt < 8; attempt++) {
        if (await p.locator('#transportAction').isEnabled()) return;
        const current = await x();
        const direction = Math.sign(12 - current);
        assert.notEqual(direction, 0, 'a stopped, aligned buggy at the drop-off can unload');
        await goTo(current + direction * Math.min(0.5, Math.abs(12 - current) / 2), direction);
      }
      assert.ok(
        await p.locator('#transportAction').isEnabled(),
        'public driving controls can park in the delivery bay'
      );
    }
    const origin = process.env.GAME_ORIGIN || 'http://127.0.0.1:3000';
    const gameUrl = origin + '/play/brick-playground-3d';
    await p.goto(gameUrl);
    await ready();
    const isolated = await p.evaluate(async () => {
      const { world, saveKey } = await import('/games/brick-playground-3d/model.mjs');
      const { citySave } = await import('/games/brick-playground-3d/settlement.mjs');
      const { starterBuggy } = await import('/games/brick-playground-3d/freight.mjs');
      const { newTrip } = await import('/games/brick-playground-3d/resident-trip.mjs');
      const town = world('city');
      town.streets = ['h-3-4', 'h-4-4'];
      const doors = [30, 36, 54, 60].map((x, i) => ({
        id: 'test-door-' + i,
        type: 'door',
        color: 'Lagoon',
        x,
        z: 30,
        y: 0,
        r: 0
      }));
      town.pieces.push(...doors, {
        id: 'blocked-bay',
        type: 'single',
        color: 'Plum',
        x: -12,
        z: 2,
        y: 0,
        r: 0
      });
      town.resident = { ...newTrip(doors[0], doors[1]), paused: true };
      town.neighbour = { ...newTrip(doors[2], doors[3]), paused: true };
      localStorage.setItem(saveKey('city'), citySave(town));
      const snapshot = {};
      for (const kind of ['garage', 'free', 'district']) {
        const w = world(kind);
        if (kind === 'garage') {
          w.pieces = starterBuggy();
          w.pieces[0].color = 'Plum';
          w.tyres = 'road';
        }
        snapshot[kind] = JSON.stringify(w);
        localStorage.setItem(saveKey(kind), snapshot[kind]);
      }
      localStorage.setItem('wga.brick.active', 'city');
      return snapshot;
    });
    await p.reload();
    await ready();
    const residents = await save();
    await tap('transportButton');
    await p.locator('#transportPickup').selectOption('h-3-4');
    await p.locator('#transportDropoff').selectOption('h-4-4');
    await tap('transportNew');
    await tap('transportDispatch');
    assert.match(await p.locator('#transportSetupHint').textContent(), /blocked/i);
    assert.equal(await p.locator('#transportSetup').evaluate((e) => e.open), true);
    await cancelTransport();
    // Leave the game before repairing storage: its pagehide autosave must finish first.
    // This same-origin fixture page has no game code that could overwrite the repair.
    // Editor repair through public controls is covered by the resident suite.
    const fixtureUrl = origin + '/__transport-fixture';
    await p.route(
      fixtureUrl,
      (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: '<!doctype html><title>Transport fixture</title>'
        }),
      { times: 1 }
    );
    await p.goto(fixtureUrl);
    await p.evaluate(() => {
      const key = 'wga.brick-playground.v1.city';
      const w = JSON.parse(localStorage.getItem(key));
      w.pieces = w.pieces.filter((p) => p[0] !== 'blocked-bay');
      localStorage.setItem(key, JSON.stringify(w));
    });
    await p.goto(gameUrl);
    await ready();
    assert.ok(!(await save()).pieces.some((piece) => piece[0] === 'blocked-bay'));
    await tap('transportButton');
    await closingTransport(() => tap('transportDispatch'));
    assert.equal(
      await p.locator('#transportSetup').evaluate((e) => e.open),
      false,
      await p.locator('#transportSetupHint').textContent()
    );
    assert.ok(await p.locator('#transportPanel').isVisible());
    await p.waitForFunction(() => !document.getElementById('transportAction').disabled);
    assert.ok(await p.locator('#brake').isVisible());
    await atPickup();
    assert.equal(await x(), -12);
    await tap('transportAction');
    assert.equal((await save()).transport.stage, 2);
    await tap('transportButton');
    assert.ok(await p.locator('#transportNew').isDisabled());
    await cancelTransport();
    assert.equal((await save()).transport.stage, 2, 'cancel preserves cargo');
    await goTo(-6);
    assert.ok((await x()) > -7, 'buggy drove on the player street');
    await tap('home');
    await atPickup();
    assert.ok(Math.abs((await x()) + 12) < 0.1, 'last stop recovers to pickup with cargo');
    assert.equal((await save()).transport.stage, 2, 'recovery preserves cargo');
    await goTo(-6);
    await p.reload();
    await ready();
    assert.equal((await save()).transport.stage, 2);
    await tap('transportButton');
    await closingTransport(() => tap('transportDispatch'));
    await atPickup();
    assert.ok(Math.abs((await x()) + 12) < 0.1, 'reload resumes cargo at checkpoint');
    await parkAtDropoff();
    await tap('transportAction');
    assert.equal((await save()).transport.stage, 3);
    if (process.env.BRICK_SCREENSHOTS) {
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await p.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'transport-complete-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    await tap('build');
    assert.ok(await p.locator('#bench').isVisible());
    assert.ok(await p.locator('#transportPanel').isHidden());
    const after = await save();
    assert.deepEqual(after.resident, residents.resident);
    assert.deepEqual(after.neighbour, residents.neighbour);
    for (const kind of Object.keys(isolated))
      assert.equal(
        await p.evaluate((kind) => localStorage.getItem('wga.brick-playground.v1.' + kind), kind),
        isolated[kind],
        kind + ' save isolation'
      );
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone-sized touch emulation' : 'Desktop keyboard/mouse') +
        ': blocked pickup refusal, fixture repair, saved custom buggy, driving, checkpoint recovery, cargo reload, modal cancel, delivery, residents and save isolation passed.'
    );
  } catch (error) {
    console.error('Transport failure:', mobile ? 'phone' : 'desktop', errors);
    if (p) {
      console.error(
        await p
          .evaluate(() => {
            const rig =
              window.BABYLON?.EngineStore.LastCreatedScene?.getTransformNodeByName(
                'Workshop chassis'
              );
            return {
              pose: rig && { x: rig.position.x, z: rig.position.z, yaw: rig.rotation.y },
              hint: document.getElementById('transportHint')?.textContent,
              setupHint: document.getElementById('transportSetupHint')?.textContent,
              actionDisabled: document.getElementById('transportAction')?.disabled,
              activeElement: document.activeElement?.id,
              setupOpen: document.getElementById('transportSetup')?.open
            };
          })
          .catch(() => null)
      );
      if (process.env.BRICK_SCREENSHOTS) {
        fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
        await p
          .screenshot({
            path: path.join(
              process.env.BRICK_SCREENSHOTS,
              'transport-failed-' + (mobile ? 'phone' : 'desktop') + '.png'
            )
          })
          .catch(() => {});
      }
    }
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
