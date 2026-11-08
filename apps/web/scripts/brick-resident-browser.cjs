// Drive both households through the public editor. The scene and saved city are read only for assertions.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
async function shopping(browser, mobile) {
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 393, height: 820 } : { width: 1100, height: 750 },
    isMobile: mobile,
    hasTouch: mobile
  });
  try {
    const p = await ctx.newPage(),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    const tap = (id) => (mobile ? p.locator('#' + id).tap() : p.locator('#' + id).click());
    const saved = () =>
      p.evaluate(() => JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')));
    const state = (s) =>
      p.waitForFunction(
        (label) => document.getElementById('resState').textContent.includes(label),
        s,
        { timeout: 150000 }
      );
    const shot = async (label) => {
      if (!process.env.BRICK_SCREENSHOTS) return;
      fs.mkdirSync(process.env.BRICK_SCREENSHOTS, { recursive: true });
      await p.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'living-' + label + (mobile ? '-phone' : '-desktop') + '.png'
        )
      });
    };
    await p.goto(
      (process.env.GAME_ORIGIN || 'http://127.0.0.1:3000') + '/play/brick-playground-3d'
    );
    await p.locator('#tray button').first().waitFor();
    await tap('worlds');
    await tap('cityWorld');
    await tap('resSettings');
    assert.ok(await p.locator('#resStart').isDisabled(), 'two real doors are needed');
    await tap('resPractice');
    const layout = (await saved()).pieces;
    const barrier = layout.at(-1);
    assert.equal(barrier[2], 'Plum');
    await tap('resStart');
    await state('Walking to');
    await p.waitForFunction(() =>
      BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Resident Lebo')?.isEnabled()
    );
    await tap('resSettings');
    await p.locator('#resHousehold').selectOption('neighbour');
    assert.ok(
      !(
        await p.locator('#resHome option').evaluateAll((opts) => opts.map((o) => o.value))
      ).includes((await saved()).resident.home),
      'each household has its own home'
    );
    await tap('resPractice');
    await tap('resStart');
    await state('Naledi · Walking to the community hall');
    await p.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem('wga.brick-playground.v1.city')).neighbour.phase ===
        'street',
      null,
      { timeout: 150000 }
    );
    await tap('resSettings');
    await tap('resPause');
    await state('Naledi · Paused');
    const paused = (await saved()).neighbour;
    await tap('resOther');
    await state('Stopped');
    const before = await saved();
    assert.equal(before.resident.phase, 'door');
    await shot('blocked');
    await p.reload();
    await p.locator('#tray button').first().waitFor();
    await state('Stopped');
    const restored = await saved();
    assert.equal(restored.resident.home, before.resident.home);
    assert.equal(restored.resident.shop, before.resident.shop);
    assert.ok(
      Math.hypot(restored.resident.x - before.resident.x, restored.resident.z - before.resident.z) <
        0.08
    );
    assert.deepEqual(restored.neighbour, paused, 'Naledi reopened at exactly the same position');
    await tap('resOther');
    await state('Naledi · Paused');
    await tap('resSettings');
    await tap('resPause');
    await tap('play');
    await state('Naledi · Walking home');
    assert.ok(
      await p.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.getMeshByName('Naledi library book').isEnabled()
      )
    );
    await shot('hall-return');
    await state('Naledi · Home again');
    const hallComplete = (await saved()).neighbour;
    assert.equal(hallComplete.phase, 'done');
    await tap('resOther');
    await state('Lebo · Stopped');
    assert.deepEqual(
      (await saved()).resident,
      restored.resident,
      'Lebo stays at the reopened obstruction throughout Naledi’s visit'
    );
    await tap('resSettings');
    await tap('resPause');
    await state('Paused');
    await tap('resSettings');
    await tap('resPause');
    await state('Stopped');
    await tap('resEdit');
    assert.equal(await p.locator('#readout').innerText(), 'Single');
    await tap('move');
    if (mobile) {
      await p.getByRole('button', { name: 'Move north', exact: true }).tap();
    } else {
      await p.locator('#plot').focus();
      await p.keyboard.press('ArrowUp');
    }
    await tap('place');
    const fixed = (await saved()).pieces.find((b) => b[0] === barrier[0]);
    assert.equal(fixed[5], barrier[5] + 1);
    assert.equal(fixed[3], barrier[3]);
    await tap('resFollow');
    await state('Shopping');
    assert.ok(
      await p.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.getMeshByName('Shopping bag produce').isEnabled()
      )
    );
    await state('Walking home');
    await shot('return');
    await state('Home again');
    const complete = await saved();
    assert.equal(complete.resident.phase, 'done');
    assert.equal(complete.resident.shop, before.resident.shop);
    await p.reload();
    await state('Home again');
    await tap('resSettings');
    await tap('resEnd');
    assert.equal((await saved()).resident, undefined);
    assert.deepEqual((await saved()).neighbour, hallComplete);
    await state('Naledi · Home again');
    await tap('resSettings');
    await tap('resEnd');
    assert.equal((await saved()).neighbour, undefined);
    assert.deepEqual((await saved()).pieces, complete.pieces);
    // Reuse the repaired, player-built entrances for two daily departures.
    for (const [key, trip, hour] of [
      ['resident', before.resident, '18'],
      ['neighbour', hallComplete, '14']
    ]) {
      await tap('resSettings');
      await p.locator('#resHousehold').selectOption(key);
      await p.locator('#resHome').selectOption(trip.home);
      await p.locator('#resShop').selectOption(trip.shop);
      await p.locator('#resSchedule').selectOption(hour);
      await tap('resStart');
      await state('At home');
    }
    await p.reload();
    await state('Lebo · At home');
    const routines = await saved();
    assert.equal(routines.resident.routine.hour, 18);
    assert.equal(routines.neighbour.routine.hour, 14);
    assert.deepEqual(routines.pieces, complete.pieces);
    await tap('resSkip');
    const firstDeparture = await saved();
    assert.equal(firstDeparture.resident.phase, 'done');
    assert.equal(Math.floor(firstDeparture.clockMinutes / 1440), 0);
    assert.ok(firstDeparture.clockMinutes >= 14 * 60);
    await tap('resOther');
    await state('Naledi · Walking to');
    assert.ok(await p.locator('#resSkip').isHidden());
    await state('Naledi · At home');
    await tap('resOther');
    await state('Lebo · At home');
    const dayOne = await saved();
    assert.equal(dayOne.resident.routine.visits, 1);
    assert.equal(dayOne.neighbour.routine.visits, 1);
    await shot('routine-returns');
    await tap('resSkip');
    await tap('resOther');
    await state('Naledi · Walking to');
    const dayTwo = await saved();
    assert.equal(Math.floor(dayTwo.clockMinutes / 1440), 1);
    assert.equal(dayTwo.neighbour.home, routines.neighbour.home);
    await tap('resSettings');
    await p.locator('#resSchedule').selectOption('');
    await tap('resApplySchedule');
    assert.equal((await saved()).neighbour.routine, undefined);
    await state('Naledi · Walking to');
    assert.equal((await saved()).resident.routine.hour, 18);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone touch' : 'Desktop keyboard/mouse') +
        ': two households saved and reopened, Naledi visited the hall and returned in Play while Lebo waited, a one-stud repair let Lebo shop and walk home, and both residents kept their daily departures across a reload and a second day.'
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
    for (const mobile of [true, false]) await shopping(browser, mobile);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
