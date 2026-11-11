// Author and walk a tour using only the same map and movement controls as a player.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function fixture() {
  const g = '../public/games/brick-playground-3d/',
    { world } = await import(g + 'model.mjs'),
    { citySave } = await import(g + 'settlement.mjs'),
    { placement } = await import(g + 'blueprint.mjs'),
    { CITY_PLANS } = await import(g + 'city-plans.mjs');
  const city = world('city');
  const house = (z, r, prefix) => {
    const pieces = placement(CITY_PLANS[0], { x: -15, z }, r, false, [], 'city').pieces;
    const dx = -13 - pieces.find((p) => p.type === 'door').x;
    return pieces.map((p, i) => ({
      ...p,
      x: p.x + dx,
      id: prefix + '-' + i,
      color: p.color === 'Coral' && r ? 'Lagoon' : p.color
    }));
  };
  const a = house(5, 0, 'spaza'),
    b = house(-10, 2, 'hall');
  city.pieces = [
    ...a,
    ...b,
    { id: 'blocking-beam', type: 'beam', color: 'Plum', x: -13, y: 0, z: 3, r: 0 }
  ];
  city.transport = { pickup: 'h-3-4', dropoff: 'h-4-4', stage: 2 };
  return {
    raw: citySave(city),
    first: a.find((p) => p.type === 'door').id,
    last: b.find((p) => p.type === 'door').id
  };
}
async function walk(browser, mobile) {
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
    const page = await ctx.newPage(),
      errors = [],
      touch = mobile && (await ctx.newCDPSession(page));
    page.on('pageerror', (e) => errors.push(e.message));
    const tap = async (id) => {
      const el = page.locator('#' + id);
      if (mobile) await el.tap();
      else await el.click();
    };
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const cargo = JSON.parse(seed.raw).transport;
    async function preserved() {
      assert.deepEqual((await saved()).transport, cargo, 'trail actions preserve loaded cargo');
    }
    async function board() {
      await tap('cityMapButton');
      const el = page.locator('#trailBoard > summary');
      if (mobile) await el.tap();
      else await el.click();
    }
    async function design() {
      await board();
      await page.locator('#trailName').fill('High Street walk');
      for (const [i, label, door] of [
        [1, 'Corner spaza', seed.first],
        [2, 'Reading room', seed.last]
      ]) {
        await tap('trailAdd');
        await page.getByLabel('Stop ' + i + ' entrance', { exact: true }).selectOption(door);
        await page.getByLabel('Stop ' + i + ' name', { exact: true }).fill(label);
      }
      await tap('trailStage');
      assert.match(await page.locator('#trailPassport').innerText(), /Corner spaza/);
    }
    async function move(key, until, holdFrames = 0) {
      if (mobile) {
        const r = await page.locator('#stick').boundingBox();
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: r.x + r.width / 2, y: r.y + r.height / 2 + (key === 'w' ? -25 : 25) }]
        });
      } else await page.keyboard.down(key);
      try {
        await page.waitForFunction(until, null, { timeout: 75000 });
        if (holdFrames)
          await page.evaluate(async (count) => {
            for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);
          }, holdFrames);
      } finally {
        if (mobile)
          await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        else await page.keyboard.up(key);
      }
    }
    await page.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await page.locator('#tray button').first().waitFor();
    await design();
    await page.getByRole('button', { name: 'Close settlement map' }).click();
    assert.equal((await saved()).trail, undefined);
    await preserved();
    await design();
    await tap('trailWalk');
    await move(
      'w',
      () =>
        BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.z >= 2.5,
      28
    );
    const stopped = await page.evaluate(
      () => BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.z
    );
    assert.ok(stopped < 3 && stopped >= 2.5, 'the beam stopped forward motion before the entrance');
    assert.ok(!(await page.locator('#trailHud').innerText()).startsWith('Stamp '));
    assert.equal((await saved()).trail.stamps, 0);
    await tap('build');
    await tap('view');
    // Keep the entrance in view above the desktop brick tray.
    if (!mobile) for (let i = 0; i < 4; i++) await tap('farther');
    await tap('select');
    const target = await page.waitForFunction(() => {
      const B = BABYLON,
        s = B.EngineStore.LastCreatedScene,
        e = s.getEngine(),
        c = e.getRenderingCanvas(),
        r = c.getBoundingClientRect();
      for (const dx of [1.5, 0.5, 2.5, 3.5]) {
        for (const dz of [0.3, 0.65]) {
          const q = B.Vector3.Project(
            new B.Vector3(-13 + dx, 1.015, 3 + dz),
            B.Matrix.Identity(),
            s.getTransformMatrix(),
            s.activeCamera.viewport.toGlobal(e.getRenderWidth(), e.getRenderHeight())
          );
          const x = Math.round(r.left + (q.x * r.width) / e.getRenderWidth()),
            y = Math.round(r.top + (q.y * r.height) / e.getRenderHeight());
          const hit = s.pick(
            x,
            y,
            (m) =>
              m.isEnabled() && m.isVisible && m.isPickable && (m.metadata?.ground || m.metadata?.id)
          );
          if (
            document.elementFromPoint(x, y) === c &&
            hit?.pickedMesh?.metadata?.id === 'blocking-beam'
          )
            return [x, y];
        }
      }
    });
    const point = await target.jsonValue();
    if (mobile) await page.touchscreen.tap(...point);
    else await page.mouse.click(...point);
    assert.equal(await page.locator('#readout').innerText(), 'Long brick');
    await tap('remove');
    await tap('play');
    await move('w', () => document.querySelector('#trailHud').textContent === 'Stamp Corner spaza');
    await tap('trailHud');
    assert.equal((await saved()).trail.stamps, 1);
    await preserved();
    await tap('build');
    await tap('undo');
    assert.ok((await saved()).pieces.some((p) => p[0] === 'blocking-beam'));
    assert.equal(
      (await saved()).trail.stamps,
      1,
      'undoing construction does not erase a later stamp'
    );
    await preserved();
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    await tap('trailHud');
    assert.match(await page.locator('#trailPassport').innerText(), /Corner spaza.*stamped/);
    if (process.env.BRICK_SCREENSHOTS) {
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await page.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'trail-passport-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    }
    assert.equal(await page.locator('#trailZoom').innerText(), 'Whole town');
    await tap('trailZoom');
    await tap('trailZoom');
    await tap('trailWalk');
    await page.waitForFunction(() => {
      const builder = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder');
      return builder.isEnabled() && Math.abs(builder.position.z) < 0.15;
    });
    await move('s', () => document.querySelector('#trailHud').textContent === 'Stamp Reading room');
    await tap('trailHud');
    assert.equal((await saved()).trail.stamps, 2);
    await preserved();
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.match(await page.locator('#trailHud').innerText(), /Complete/);
    await tap('trailHud');
    await tap('trailRestart');
    await page.getByRole('button', { name: 'Close settlement map' }).click();
    assert.equal((await saved()).trail.stamps, 2, 'cancelling a restart preserves the passport');
    await tap('trailHud');
    await tap('trailRemove');
    await tap('mapBuild');
    assert.equal((await saved()).trail, undefined);
    await preserved();
    await tap('undo');
    assert.equal((await saved()).trail.stamps, 2, 'undo restores the removed trail and passport');
    await preserved();
    await page.reload();
    await page.locator('#tray button').first().waitFor();
    assert.equal((await saved()).trail.stamps, 2);
    await preserved();
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop keyboard/mouse') +
        ' staged and cancelled a trail, repaired a blocked entrance, collected both stamps in order and reopened the completed passport while preserving loaded cargo through map edits, undo and reload.'
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
    for (const mobile of [true, false]) await walk(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
