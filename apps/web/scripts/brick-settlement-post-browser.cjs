// Carry a postbag between three actual doorways using the normal walking and editor controls.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function round(browser, mobile) {
  const g = '../public/games/brick-playground-3d/';
  const { world, validPiece } = await import(g + 'model.mjs'),
    { citySave } = await import(g + 'settlement.mjs'),
    { CITY_PLANS } = await import(g + 'city-plans.mjs'),
    { entrance } = await import(g + 'resident-trip.mjs');
  const city = world('city'),
    layout = CITY_PLANS[0].pieces,
    ref = layout.find((p) => p.type === 'door');
  city.streetNames = { 'h-3-4': 'Protea Road' };
  city.pieces = [-21, -15, -9].flatMap((x, n) =>
    layout.map((p, i) => ({
      ...p,
      id: p.type === 'door' ? 'address-' + n : 'house-' + n + '-' + i,
      x: x + p.x - ref.x,
      z: 5 + p.z - ref.z
    }))
  );
  const beam = { id: 'mail-barrier', type: 'beam', color: 'Plum', x: -15, z: 3, r: 0, y: 0 };
  assert.ok(validPiece(beam, city.pieces, null, 'city'));
  city.pieces.push(beam);
  const fronts = city.pieces.filter((p) => p.type === 'door').map(entrance);
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
      touch = mobile && (await ctx.newCDPSession(page)),
      errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const tap = (el) => (mobile ? el.tap() : el.click()),
      press = (id) => tap(page.locator('#' + id));
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    async function goToCurb(n) {
      await press('cityMapButton');
      await tap(page.locator('#streetDirectory > summary'));
      if (n === 1) {
        const labels = await page.locator('#directoryDoor option').allTextContents();
        assert.ok(labels.some((l) => l.startsWith('Post office ·')));
        assert.ok(labels.some((l) => l.startsWith('Delivered ·')));
        assert.ok(labels.some((l) => l.startsWith('Letter ·')));
      }
      await page.locator('#directoryDoor').selectOption('address-' + n);
      await press('directoryWalk');
      await page.waitForFunction((c) => {
        const a = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder');
        return a?.isEnabled() && Math.hypot(a.position.x - c.x, a.position.z - c.z) < 0.05;
      }, fronts[n].curb);
    }
    async function move(key, goal, hold = 0) {
      if (mobile) {
        const r = await page.locator('#stick').boundingBox();
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [
            {
              x: r.x + r.width / 2 + (key === 'a' ? -29 : key === 'd' ? 29 : 0),
              y: r.y + r.height / 2 + (key === 'w' ? -29 : key === 's' ? 29 : 0)
            }
          ]
        });
      } else await page.keyboard.down(key);
      try {
        await page.waitForFunction(
          ({ goal, key }) => {
            const p =
              BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position;
            return key === 's'
              ? p.z <= goal
              : key === 'a'
                ? p.x <= goal
                : key === 'd'
                  ? p.x >= goal
                  : p.z >= goal;
          },
          { goal, key },
          { timeout: 90000 }
        );
        if (hold)
          await page.evaluate(async (n) => {
            for (let i = 0; i < n; i++) await new Promise(requestAnimationFrame);
          }, hold);
      } finally {
        if (mobile)
          await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        else await page.keyboard.up(key);
      }
    }
    async function handover(n, label) {
      // Stop inside the doorway before pressing the button, independently of HUD refresh timing.
      await move('w', fronts[n].inside.z - 0.35);
      await page.waitForFunction((text) => {
        const b = document.querySelector('#postAction');
        return !b.hidden && !document.querySelector('#postHud').hidden && b.textContent === text;
      }, label);
      await press('postAction');
    }
    async function repair() {
      await press('build');
      await press('view');
      if (!mobile) for (let i = 0; i < 4; i++) await press('farther');
      await press('select');
      const point = await page.waitForFunction(() => {
        const B = BABYLON,
          s = B.EngineStore.LastCreatedScene,
          e = s.getEngine(),
          c = e.getRenderingCanvas(),
          r = c.getBoundingClientRect();
        for (const dx of [1.5, 0.5, 2.5, 3.5])
          for (const dz of [0.3, 0.65]) {
            const q = B.Vector3.Project(
              new B.Vector3(-15 + dx, 1.015, 3 + dz),
              B.Matrix.Identity(),
              s.getTransformMatrix(),
              s.activeCamera.viewport.toGlobal(e.getRenderWidth(), e.getRenderHeight())
            );
            const x = Math.round(r.left + (q.x * r.width) / e.getRenderWidth()),
              y = Math.round(r.top + (q.y * r.height) / e.getRenderHeight());
            if (document.elementFromPoint(x, y) !== c) continue;
            const hit = s.pick(
              x,
              y,
              (m) =>
                m.isEnabled() &&
                m.isVisible &&
                m.isPickable &&
                (m.metadata?.ground || m.metadata?.id)
            );
            if (hit?.pickedMesh?.metadata?.id === 'mail-barrier') return [x, y];
          }
      });
      const xy = await point.jsonValue();
      if (mobile) await page.touchscreen.tap(...xy);
      else await page.mouse.click(...xy);
      assert.equal(await page.locator('#readout').innerText(), 'Long brick');
      await press('remove');
      await press('play');
    }
    async function photo(name) {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'post-' + name + '-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    await goToCurb(0);
    await handover(0, 'Collect postbag');
    assert.equal((await saved()).post.office.id, 'address-0');
    await page.waitForFunction(() =>
      BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Post satchel')?.isEnabled()
    );
    await move('s', 1.2);
    await move('d', fronts[2].center.x - 0.3);
    await handover(2, 'Deliver letter');
    const partial = (await saved()).post;
    assert.deepEqual(
      partial.stops.filter((s) => s.delivered).map((s) => s.id),
      ['address-2']
    );
    await tap(page.locator('#postSheet > summary'));
    assert.match(await page.locator('#postManifest').innerText(), /✓.*Protea Road/);
    await photo('manifest');
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.deepEqual((await saved()).post, partial);
    await press('worlds');
    await press('freeWorld');
    assert.ok(await page.locator('#postHud').isHidden());
    assert.equal(
      await page.evaluate(
        () =>
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName(
            'Post satchel'
          )?.isEnabled() || false
      ),
      false
    );
    await press('worlds');
    await press('cityWorld');
    assert.deepEqual((await saved()).post, partial);
    await goToCurb(1);
    await move('w', 2.5, 26);
    assert.ok(await page.locator('#postAction').isHidden());
    assert.deepEqual((await saved()).post, partial);
    await repair();
    await handover(1, 'Deliver letter');
    assert.ok((await saved()).post.stops.every((s) => s.delivered));
    assert.equal((await saved()).post.complete, false);
    await move('s', 1.2);
    await move('a', fronts[0].center.x + 0.3);
    await handover(0, 'Finish round');
    assert.equal((await saved()).post.complete, true);
    await page.waitForFunction(
      () =>
        !BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Post satchel')?.isEnabled()
    );
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.equal((await saved()).post.complete, true);
    await tap(page.locator('#postSheet > summary'));
    await press('postEnd');
    assert.equal((await saved()).post, undefined);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop') +
        ' carried two letters, delivered the farther one first, reloaded the bag, removed a blocking beam, and signed off back at the post office.'
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
    for (const mobile of [true, false]) await round(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
