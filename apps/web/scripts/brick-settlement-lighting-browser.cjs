// Verify the preview and the route survey using the same editor controls as a player.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function fixture() {
  const g = '../public/games/brick-playground-3d/';
  const { world } = await import(g + 'model.mjs'),
    { citySave } = await import(g + 'settlement.mjs'),
    { CITY_PLANS } = await import(g + 'city-plans.mjs');
  const { newTrip, isEntrance } = await import(g + 'resident-trip.mjs');
  const city = world('city'),
    homes = [-21, -10].map((x, i) =>
      CITY_PLANS[0].pieces.map((p, j) => ({
        ...p,
        id: 'house-' + i + '-' + j,
        x: p.x + x,
        z: p.z + 5
      }))
    );
  city.pieces = homes.flat();
  city.resident = newTrip(homes[0].find(isEntrance), homes[1].find(isEntrance));
  city.resident.phase = 'done';
  city.clockMinutes = 800;
  city.transport = { pickup: 'h-3-4', dropoff: 'h-4-4', stage: 2 };
  city.market = {
    shop: city.resident.shop,
    receipts: [{ name: 'Lebo', home: city.resident.home, block: 'D4' }]
  };
  return citySave(city);
}
async function lighting(browser, mobile) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
    isMobile: mobile,
    hasTouch: mobile
  });
  try {
    await ctx.addInitScript(
      (raw) => {
        if (!localStorage.getItem('wga.brick-playground.v1.city')) {
          localStorage.setItem('wga.brick.active', 'city');
          localStorage.setItem('wga.brick-playground.v1.city', raw);
        }
      },
      await fixture()
    );
    const p = await ctx.newPage(),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const tap = (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
    const saved = () =>
      p.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const progress = (raw) => ({
      transport: raw.transport,
      resident: raw.resident,
      market: raw.market
    });
    const original = progress(JSON.parse(await fixture()));
    async function preserved() {
      assert.deepEqual(
        progress(await saved()),
        original,
        'lighting edits preserve cargo and market progress'
      );
    }
    const scene = () =>
      p.evaluate(() => {
        const s = BABYLON.EngineStore.LastCreatedScene;
        return {
          sky: s.getLightByName('Sky').intensity,
          lit: s.lights.filter((l) => l.name.startsWith('Nearby streetlamp') && l.isEnabled())
            .length
        };
      });
    async function survey() {
      await tap('cityMapButton');
      await p.locator('#mapRoute').selectOption('resident');
      await tap('routeLight');
      return p.locator('#routeLightSummary').innerText();
    }
    const close = () => p.getByRole('button', { name: 'Close settlement map' }).click();
    const shot = async (name) => {
      if (process.env.BRICK_SCREENSHOTS) {
        fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
        await p.screenshot({
          path: path.join(
            process.env.BRICK_SCREENSHOTS,
            name + '-' + (mobile ? 'phone' : 'desktop') + '.png'
          )
        });
      }
    };
    async function placeLamp() {
      const btn = p.locator('[data-type="streetlamp"]');
      if (mobile) await btn.tap();
      else await btn.click();
      const point = await p.evaluate(() => {
        const B = BABYLON,
          s = B.EngineStore.LastCreatedScene,
          e = s.getEngine(),
          c = e.getRenderingCanvas(),
          r = c.getBoundingClientRect();
        const q = B.Vector3.Project(
          new B.Vector3(-13.5, 0, 4.5),
          B.Matrix.Identity(),
          s.getTransformMatrix(),
          s.activeCamera.viewport.toGlobal(e.getRenderWidth(), e.getRenderHeight())
        );
        return [
          r.left + (q.x * r.width) / e.getRenderWidth(),
          r.top + (q.y * r.height) / e.getRenderHeight()
        ];
      });
      if (mobile) await p.touchscreen.tap(...point);
      else {
        const match = (await p.locator('#readout').innerText()).match(/\((-?\d+), (-?\d+)\)/);
        await p.locator('#plot').focus();
        for (const [delta, pos, neg] of [
          [-14 - Number(match[1]), 'ArrowRight', 'ArrowLeft'],
          [4 - Number(match[2]), 'ArrowUp', 'ArrowDown']
        ]) {
          for (let n = 0; n < Math.abs(delta); n++) await p.keyboard.press(delta > 0 ? pos : neg);
        }
      }
      assert.match(await p.locator('#readout').innerText(), /\(-14, 4\)/);
      await tap('place');
    }
    await p.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await p.locator('#tray button').first().waitFor();
    assert.match(await survey(), /^0% lit/);
    await p.locator('#townLighting').selectOption('night');
    await close();
    assert.equal((await saved()).lighting, undefined);
    await preserved();
    await tap('cityMapButton');
    await p.locator('#townLighting').selectOption('night');
    await tap('mapBuild');
    assert.equal((await saved()).clockMinutes, 800);
    await p.waitForFunction(
      () => BABYLON.EngineStore.LastCreatedScene.getLightByName('Sky').intensity < 0.45
    );
    await preserved();
    await tap('undo');
    assert.equal((await saved()).lighting, undefined, 'undo restores the clock lighting mode');
    await preserved();
    await tap('cityMapButton');
    await p.locator('#townLighting').selectOption('night');
    await tap('mapBuild');
    await p.waitForFunction(
      () => BABYLON.EngineStore.LastCreatedScene.getLightByName('Sky').intensity < 0.45
    );
    await tap('view');
    await p.waitForTimeout(250);
    await placeLamp();
    await p.waitForFunction(() =>
      BABYLON.EngineStore.LastCreatedScene.getLightByName('Nearby streetlamp 0')?.isEnabled()
    );
    assert.match(await survey(), /Fully lit/);
    await shot('lit-route');
    await close();
    await tap('undo');
    await preserved();
    assert.match(await survey(), /^0% lit/);
    await tap('mapAimLamp');
    await preserved();
    assert.equal(
      (await saved()).pieces.filter((row) => row[1] === 'streetlamp').length,
      0,
      'aiming keeps placement explicit'
    );
    await tap('place');
    const committed = await saved();
    assert.equal(committed.pieces.filter((r) => r[1] === 'streetlamp').length, 1);
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    assert.equal((await saved()).lighting, 'night');
    await preserved();
    await shot('night-town');
    assert.match(await survey(), /Fully lit/);
    await p.locator('#mapBlock').selectOption('27');
    await tap('mapWalk');
    const readPos = () =>
      p.evaluate(
        () => BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.x
      );
    const initialX = await readPos();
    const touch = mobile && (await ctx.newCDPSession(p));
    if (mobile) {
      const r = await p.locator('#stick').boundingBox();
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: r.x + r.width / 2 + 26, y: r.y + r.height / 2 }]
      });
    } else await p.keyboard.down('d');
    try {
      await p.waitForFunction(
        (x) =>
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder').position.x >
          x + 1.2,
        initialX,
        { timeout: 45000 }
      );
    } finally {
      if (mobile)
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      else await p.keyboard.up('d');
    }
    await shot('night-street');
    assert.equal((await scene()).lit, 1);
    await tap('cityMapButton');
    await p.locator('#townLighting').selectOption('clock');
    await tap('mapWalk');
    await p.waitForFunction(
      () => BABYLON.EngineStore.LastCreatedScene.getLightByName('Sky').intensity > 0.65
    );
    assert.equal((await scene()).lit, 0);
    assert.equal((await saved()).clockMinutes, 800);
    await tap('cityMapButton');
    await p.locator('#townLighting').selectOption('night');
    await tap('mapWalk');
    await tap('worlds');
    await tap('freeWorld');
    await p.waitForFunction(
      () => BABYLON.EngineStore.LastCreatedScene.getLightByName('Sky').intensity > 0.65
    );
    assert.equal((await scene()).lit, 0);
    await preserved();
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop mouse') +
        ' placed a working streetlamp, repaired and undid a dark route, reopened the saved night preview, walked under the light and restored daylight outside the city, preserving loaded cargo and market receipts throughout.'
    );
  } finally {
    await ctx.close();
  }
}
async function evening(browser) {
  const data = JSON.parse(await fixture());
  data.clockMinutes = 1049;
  data.resident.routine = { hour: 18, visits: 0 };
  data.pieces.push(['clock-lamp', 'streetlamp', 'Sun', -14, 0, 4, 0]);
  const ctx = await browser.newContext({
    viewport: { width: 393, height: 820 },
    isMobile: true,
    hasTouch: true
  });
  try {
    await ctx.addInitScript((raw) => {
      localStorage.setItem('wga.brick.active', 'city');
      localStorage.setItem('wga.brick-playground.v1.city', raw);
    }, JSON.stringify(data));
    const p = await ctx.newPage();
    await p.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await p.waitForFunction(
      () => {
        const w = JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')),
          s = window.BABYLON?.EngineStore.LastCreatedScene;
        return (
          w.clockMinutes >= 1080 &&
          w.resident.phase !== 'done' &&
          s?.getLightByName('Nearby streetlamp 0')?.isEnabled() &&
          s.getLightByName('Sky').intensity < 0.65
        );
      },
      null,
      { timeout: 90000 }
    );
    console.log(
      'The settlement clock lit the street and the resident left on the scheduled 18:00 visit.'
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
    for (const mobile of [true, false]) await lighting(browser, mobile);
    await evening(browser);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
