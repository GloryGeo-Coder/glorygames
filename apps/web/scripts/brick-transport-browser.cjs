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
    async function districtLocation(name) {
      await p.waitForFunction(
        (name) => document.getElementById('cityMapButton').title.startsWith(name + ' · '),
        name
      );
      assert.equal(await p.locator('#areaLocation').textContent(), name);
    }
    async function nightLights(expected) {
      await p.waitForFunction(
        (expected) => {
          const scene = BABYLON.EngineStore.LastCreatedScene;
          const xs = scene.lights
            .filter((l) => l.name.startsWith('Nearby streetlamp') && l.isEnabled())
            .map((l) => l.position.x)
            .sort((a, b) => a - b);
          return (
            scene.getLightByName('Sky').intensity < 0.4 &&
            JSON.stringify(xs) === JSON.stringify(expected)
          );
        },
        expected,
        { timeout: 10000 }
      );
      assert.equal((await save()).lighting, 'night');
      await postalState(false);
      assert.match(await p.locator('#transportTarget').innerText(), /^(Cargo Lane|Market Road) · /);
      assert.deepEqual((await save()).streetNames, {
        'h-3-4': 'Cargo Lane',
        'h-4-4': 'Market Road'
      });
      await p.waitForFunction(() => {
        const scene = BABYLON.EngineStore.LastCreatedScene;
        return (
          scene.getMeshByName('Street sign · Cargo Lane') &&
          scene.getMeshByName('Street sign · Market Road')
        );
      });
    }
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
      const { citySave, moveIn, BLOCKS } = await import(
        '/games/brick-playground-3d/settlement.mjs'
      );
      const { starterBuggy } = await import('/games/brick-playground-3d/freight.mjs');
      const { newTrip, visitFront } = await import('/games/brick-playground-3d/resident-trip.mjs');
      const { marketCounter } = await import('/games/brick-playground-3d/market-day.mjs');
      const { namedDoors } = await import('/games/brick-playground-3d/street-directory.mjs');
      const town = world('city');
      for (const [id, neighbourhood] of [
        [27, 'Western Delivery Neighbourhood'],
        [35, 'Western Delivery Neighbourhood'],
        [28, 'Eastern Market Neighbourhood'],
        [36, 'Eastern Market Neighbourhood']
      ])
        town.blocks[id] = { ...town.blocks[id], neighbourhood };
      town.streets = ['h-3-4', 'h-4-4'];
      town.streetNames = { 'h-3-4': 'Cargo Lane', 'h-4-4': 'Market Road' };
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
      town.resident.routine = { hour: 8, visits: 2 };
      town.neighbour.routine = { hour: 14, visits: 3 };
      const bench = town.pieces.find((p) => p.type === 'bench');
      for (let i = 0; i < 6; i++) {
        const door = { ...doors[0], id: 'extra-home-' + i, x: BLOCKS[8 + i].x, z: BLOCKS[8 + i].z };
        town.pieces.push(door);
        const park = i >= 4;
        const trip = { ...newTrip(door, park ? bench : doors[i % 2 ? 3 : 1], town), paused: true };
        if (park)
          Object.assign(trip, visitFront(town, bench, true).inside, {
            phase: i === 4 ? 'shopping' : 'enter',
            wait: i === 4 ? 4.5 : 0,
            y: 0
          });
        trip.routine = { hour: [8, 14, 18][i % 3], visits: i + 1 };
        moveIn(town, 'Household ' + i, park ? 'park' : i % 2 ? 'hall' : 'spaza', trip);
      }
      town.clockMinutes = 450;
      town.lighting = 'night';
      town.garden = {
        plants: [{ id: 'town-park-3', flower: 'daisy', watered: 0 }],
        displays: [{ id: 'town-park-2', flower: 'marigold' }],
        bouquet: 'daisy'
      };
      town.pieces.push(
        ...[-20, -10, 10, 20].map((x, i) => ({
          id: 'transport-lamp-' + i,
          type: 'streetlamp',
          color: 'Sun',
          x,
          y: 0,
          z: 4,
          r: 0
        }))
      );
      town.trail = {
        name: 'Town deliveries walk',
        stops: [
          { door: doors[0].id, label: 'Home' },
          { door: doors[1].id, label: 'Market' }
        ],
        stamps: 1
      };
      town.market = {
        shop: doors[1].id,
        receipts: [{ name: 'Lebo', home: doors[0].id, block: 'F3' }]
      };
      Object.assign(town.family1, marketCounter(town).inside, {
        phase: 'shopping',
        paused: false,
        wait: 1
      });
      const postOffice = town.pieces.find((piece) => piece.type === 'door');
      town.pieces.push(
        ...[-21, -15].map((x, i) => ({
          id: 'postal-door-' + i,
          type: 'door',
          color: 'Coral',
          x,
          y: 0,
          z: 5,
          r: 0
        }))
      );
      const postalDoors = namedDoors(town);
      const address = (id) => ({ id, address: postalDoors.get(id).address });
      town.directions = address('postal-door-1');
      town.post = {
        office: address(postOffice.id),
        stops: [-21, -15].map((_, i) => ({ ...address('postal-door-' + i), delivered: i === 0 })),
        complete: false
      };
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
    async function postalState(carrying) {
      assert.deepEqual(
        (await save()).directions,
        residents.directions,
        'buggy actions preserve the walking destination'
      );
      if (!carrying) {
        await p.waitForFunction(
          () => document.querySelector('#directionsHud').dataset.state === 'paused'
        );
        assert.equal(
          await p.evaluate(() =>
            BABYLON.EngineStore.LastCreatedScene.meshes.some(
              (m) => m.name === 'Walking direction marker' && m.isEnabled()
            )
          ),
          false
        );
      }
      assert.deepEqual(
        (await save()).post,
        residents.post,
        'buggy actions preserve the half-delivered postbag'
      );
      await p.waitForFunction(
        (carrying) =>
          !!BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName(
            'Post satchel'
          )?.isEnabled() === carrying,
        carrying
      );
      if (!carrying && (await p.locator('#transportPanel').isVisible()))
        assert.ok(await p.locator('#postHud').isHidden());
    }
    assert.equal(residents.members.length, 6, 'all six additional households loaded');
    assert.equal(residents.members.filter((p) => p.visit === 'park').length, 2);
    assert.equal(residents.family5.wait, 4.5, 'saved park rest is not clamped to a shop visit');
    async function seatedVisitor() {
      await p.waitForFunction(async () => {
        const { loadWorld } = await import('/games/brick-playground-3d/model.mjs');
        const { restingSeat } = await import('/games/brick-playground-3d/resident-trip.mjs');
        const town = loadWorld('city', localStorage);
        const seat = restingSeat(town, town.family5);
        const root =
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Resident Household 4');
        return (
          seat &&
          root?.isEnabled() &&
          Math.hypot(root.position.x - seat.x, root.position.y - seat.y, root.position.z - seat.z) <
            0.01
        );
      });
    }
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
    assert.ok(
      await p.locator('#residentPanel').isHidden(),
      'market and resident panel yields to driving'
    );
    assert.ok(await p.locator('#marketTill').isHidden());
    assert.ok(await p.locator('#gardenHud').isHidden(), 'gardening yields to driving');
    await p.waitForFunction(() => {
      const scene = BABYLON.EngineStore.LastCreatedScene;
      const visible = (name) => {
        const mesh = scene.getMeshByName(name);
        return mesh?.isEnabled() && mesh.isVisible;
      };
      return (
        !scene.getMeshByName('Carried garden bouquet') &&
        visible('Garden bloom town-park-3') &&
        visible('Garden display town-park-2')
      );
    });
    assert.ok(
      await p.locator('#trailHud').isHidden(),
      'walking stamps are not offered while driving'
    );
    await p.waitForFunction(() => !document.getElementById('transportAction').disabled);
    assert.ok(await p.locator('#brake').isVisible());
    await atPickup();
    assert.equal(await x(), -12);
    await nightLights([-19.5, -9.5]);
    await seatedVisitor();
    await districtLocation('Western Delivery Neighbourhood');
    const signs = await p.evaluate(() => {
      const scene = BABYLON.EngineStore.LastCreatedScene;
      return ['Western Delivery Neighbourhood', 'Eastern Market Neighbourhood'].map((name) => {
        const sign = scene.getMeshByName(name);
        const ctx = sign?.material.diffuseTexture.getContext();
        return { name, present: !!sign, width: ctx?.measureText(name).width };
      });
    });
    assert.ok(
      signs.every((s) => s.present && s.width <= 480),
      'neighbourhood signs render and fit their long names'
    );
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
    assert.deepEqual(
      (await save()).family5,
      residents.family5,
      'recovery preserves seated park visitor'
    );
    assert.deepEqual(
      (await save()).family6,
      residents.family6,
      'recovery preserves waiting park visitor'
    );
    assert.deepEqual(
      (await save()).garden,
      residents.garden,
      'recovery preserves the garden and held bouquet'
    );
    await nightLights([-19.5, -9.5]);
    assert.deepEqual((await save()).market, residents.market, 'recovery preserves receipts');
    assert.deepEqual(
      (await save()).blocks,
      residents.blocks,
      'recovery preserves neighbourhood boundaries'
    );
    assert.deepEqual(
      (await save()).trail,
      residents.trail,
      'driving and recovery preserve passport'
    );
    assert.deepEqual(
      (await save()).family1,
      residents.family1,
      'recovery preserves the market queue'
    );
    await tap('cityMapButton');
    if (!(await p.locator('#trailBoard').evaluate((e) => e.open)))
      await p.locator('#trailBoard > summary').click();
    await closingDialog('cityMap', () => tap('trailWalk'));
    await p.waitForFunction(() => {
      const person = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder');
      return (
        person.isEnabled() &&
        Math.abs(person.position.x - 31.5) < 0.1 &&
        Math.abs(person.position.z - 24) < 0.1
      );
    });
    assert.ok(await p.locator('#jump').isVisible());
    assert.ok(await p.locator('#brake').isHidden());
    assert.ok(await p.locator('#transportPanel').isHidden());
    assert.ok(await p.locator('#trailHud').isVisible());
    await p.waitForFunction(() => {
      const mesh = BABYLON.EngineStore.LastCreatedScene.getMeshByName('Carried garden bouquet');
      return mesh?.parent?.name === 'Builder' && mesh.isEnabled() && mesh.isVisible;
    });
    assert.ok(
      await p.locator('#gardenHud').isVisible(),
      'garden controls return when leaving the buggy'
    );
    assert.deepEqual(
      (await save()).trail,
      residents.trail,
      'resuming the walking trail preserves stamps'
    );
    assert.equal(
      (await save()).transport.stage,
      2,
      'leaving the buggy for a trail preserves cargo'
    );
    await postalState(true);
    await tap('transportButton');
    await closingTransport(() => tap('transportDispatch'));
    await atPickup();
    await tap('cityMapButton');
    await p.locator('#mapBlock').selectOption('0');
    await closingDialog('cityMap', () => tap('mapWalk'));
    await p.waitForFunction(() => {
      const person = BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName('Builder');
      return (
        person.isEnabled() &&
        Math.abs(person.position.x + 83.5) < 0.1 &&
        Math.abs(person.position.z - 73) < 0.1
      );
    });
    assert.equal(
      (await save()).focus,
      0,
      'map walking honors the selected block after leaving the buggy'
    );
    assert.equal((await save()).transport.stage, 2);
    await postalState(true);
    assert.deepEqual((await save()).streetNames, residents.streetNames);
    await p.waitForFunction(
      () => !BABYLON.EngineStore.LastCreatedScene.getMeshByName('Street sign · Cargo Lane')
    );
    assert.deepEqual((await save()).trail, residents.trail);
    assert.deepEqual((await save()).garden, residents.garden, 'map walking preserves garden state');
    await p.waitForFunction(
      () => !BABYLON.EngineStore.LastCreatedScene.getMeshByName('Garden display town-park-2')
    );
    await p.waitForFunction(
      () =>
        !BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName(
          'Resident Household 4'
        )?.isEnabled()
    );
    await tap('transportButton');
    await closingTransport(() => tap('transportDispatch'));
    await atPickup();
    await goTo(-6);
    await p.reload();
    await ready();
    assert.equal((await save()).transport.stage, 2);
    assert.deepEqual((await save()).market, residents.market, 'reload preserves receipts');
    assert.deepEqual((await save()).post, residents.post, 'cargo reload preserves postal progress');
    assert.deepEqual(
      (await save()).streetNames,
      residents.streetNames,
      'cargo reload preserves named roads'
    );
    assert.deepEqual(
      (await save()).family5,
      residents.family5,
      'cargo reload preserves the seated park rest'
    );
    assert.deepEqual(
      (await save()).family6,
      residents.family6,
      'cargo reload preserves the bench queue'
    );
    assert.deepEqual(
      (await save()).garden,
      residents.garden,
      'cargo reload preserves garden state'
    );
    assert.deepEqual((await save()).trail, residents.trail, 'reload preserves passport');
    assert.deepEqual(
      (await save()).blocks,
      residents.blocks,
      'reload preserves neighbourhood boundaries'
    );
    assert.deepEqual(
      (await save()).family1,
      residents.family1,
      'reload preserves the market queue'
    );
    await tap('transportButton');
    await closingTransport(() => tap('transportDispatch'));
    await atPickup();
    assert.ok(Math.abs((await x()) + 12) < 0.1, 'reload resumes cargo at checkpoint');
    await nightLights([-19.5, -9.5]);
    await parkAtDropoff();
    await seatedVisitor();
    await nightLights([10.5, 20.5]);
    await districtLocation('Eastern Market Neighbourhood');
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
    assert.ok(await p.locator('#residentPanel').isVisible());
    assert.ok(
      await p.locator('#marketTill').isVisible(),
      'market controls return after exiting the buggy'
    );
    await districtLocation('Eastern Market Neighbourhood');
    assert.ok(
      await p.locator('#areaLocation').isVisible(),
      'neighbourhood label returns after exiting the buggy'
    );
    const after = await save();
    assert.deepEqual(after.post, residents.post, 'crate delivery does not deliver any letters');
    assert.deepEqual(
      after.directions,
      residents.directions,
      'crate delivery does not clear walking guidance'
    );
    assert.deepEqual(after.blocks, residents.blocks, 'delivery preserves named neighbourhoods');
    assert.equal(after.lighting, 'night');
    assert.deepEqual(
      after.pieces.filter((p) => p[1] === 'streetlamp'),
      residents.pieces.filter((p) => p[1] === 'streetlamp')
    );
    assert.deepEqual(after.resident, residents.resident);
    assert.deepEqual(after.neighbour, residents.neighbour);
    assert.deepEqual(after.members, residents.members);
    assert.deepEqual(after.market, residents.market, 'delivery preserves the half-served market');
    assert.deepEqual(after.trail, residents.trail, 'delivery preserves the walking passport');
    assert.deepEqual(
      after.garden,
      residents.garden,
      'delivery preserves flowers and the held bouquet'
    );
    for (const { key } of residents.members)
      assert.deepEqual(
        after[key],
        residents[key],
        key + ' survives driving, cargo reload and delivery'
      );
    assert.ok(
      after.clockMinutes > residents.clockMinutes,
      'the settlement clock survives driving and reload'
    );
    for (const kind of Object.keys(isolated))
      assert.equal(
        await p.evaluate((kind) => localStorage.getItem('wga.brick-playground.v1.' + kind), kind),
        isolated[kind],
        kind + ' save isolation'
      );
    await tap('resSettings');
    const marketBoard = p.locator('#marketBoard');
    if (!(await marketBoard.evaluate((e) => e.open))) {
      if (mobile) await p.locator('#marketBoard summary').tap();
      else await p.locator('#marketBoard summary').click();
    }
    await closingDialog('residentSetup', () => tap('marketWork'));
    assert.ok(await p.locator('#jump').isVisible());
    assert.ok(await p.locator('#brake').isHidden());
    assert.ok(!(await p.locator('#marketTill').innerText()).startsWith('Serve'));
    if (mobile) await press('stick');
    else {
      await p.locator('#plot').focus();
      await p.keyboard.down('w');
    }
    try {
      await p.waitForFunction(
        () =>
          document.getElementById('marketTill').textContent === 'Serve Household 0' &&
          document.getElementById('trailHud').textContent === 'Stamp Market',
        null,
        { timeout: 60000 }
      );
    } finally {
      if (mobile) await release();
      else await p.keyboard.up('w');
    }
    await tap('trailHud');
    assert.equal((await save()).trail.stamps, 2, 'walking can stamp after delivery');
    assert.equal((await save()).transport.stage, 3, 'stamping keeps the completed delivery');
    await tap('marketTill');
    assert.deepEqual(
      (await save()).market.receipts.map((r) => r.name),
      ['Lebo', 'Household 0']
    );
    assert.equal(
      (await save()).transport.stage,
      3,
      'serving after delivery keeps cargo completion'
    );
    if (process.env.BRICK_SCREENSHOTS)
      await p.screenshot({
        path: path.join(
          process.env.BRICK_SCREENSHOTS,
          'transport-market-restored-' + (mobile ? 'phone' : 'desktop') + '.png'
        )
      });
    await tap('worlds');
    await tap('freeWorld');
    await p.waitForFunction(() => {
      const scene = BABYLON.EngineStore.LastCreatedScene;
      return (
        scene.getLightByName('Sky').intensity > 0.65 &&
        scene.lights
          .filter((l) => l.name.startsWith('Nearby streetlamp'))
          .every((l) => !l.isEnabled())
      );
    });
    assert.equal((await save()).lighting, 'night', 'leaving town keeps its saved lighting');
    assert.equal((await save()).transport.stage, 3);
    assert.equal((await save()).trail.stamps, 2, 'switching worlds keeps the passport');
    assert.deepEqual((await save()).garden, residents.garden, 'switching worlds keeps the garden');
    assert.deepEqual(
      (await save()).family5,
      residents.family5,
      'switching worlds keeps the seated visitor'
    );
    assert.deepEqual(
      (await save()).family6,
      residents.family6,
      'switching worlds keeps the bench queue'
    );
    assert.equal(
      await p.evaluate(
        () =>
          !!BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName(
            'Resident Household 4'
          )?.isEnabled()
      ),
      false
    );
    assert.ok(await p.locator('#gardenHud').isHidden());
    assert.deepEqual(
      await p.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.meshes
          .filter((m) => m.name.startsWith('Garden ') || m.name === 'Carried garden bouquet')
          .map((m) => m.name)
      ),
      [],
      'garden meshes are removed outside the city'
    );
    assert.ok(await p.locator('#areaLocation').isHidden());
    assert.ok(await p.locator('#postHud').isHidden());
    assert.equal(
      await p.evaluate(
        () =>
          BABYLON.EngineStore.LastCreatedScene.getTransformNodeByName(
            'Post satchel'
          )?.isEnabled() || false
      ),
      false
    );
    assert.deepEqual(
      await p.evaluate(() =>
        BABYLON.EngineStore.LastCreatedScene.meshes
          .filter((m) => m.name.endsWith('Neighbourhood'))
          .map((m) => m.name)
      ),
      [],
      'neighbourhood signs are removed outside the city'
    );
    await tap('worlds');
    await tap('cityWorld');
    await seatedVisitor();
    assert.equal((await save()).transport.stage, 3);
    assert.equal((await save()).trail.stamps, 2);
    assert.deepEqual((await save()).post, residents.post);
    assert.deepEqual((await save()).directions, residents.directions);
    assert.deepEqual((await save()).garden, residents.garden);
    assert.deepEqual((await save()).family5, residents.family5);
    assert.deepEqual((await save()).family6, residents.family6);
    assert.deepEqual(errors, []);
    console.log(
      (mobile ? 'Phone-sized touch emulation' : 'Desktop keyboard/mouse') +
        ': blocked pickup refusal, fixture repair, saved custom buggy, driving, checkpoint recovery, cargo reload, modal cancel, delivery, all eight household schedules including seated and queued park visits, market queue/receipts, night lights tracking the buggy, named neighbourhoods/streets/signs and location transitions, gardens and held bouquets, passport, postal and walking-direction recovery/reload, driving-to-trail transitions, restored walking stamps/service, world lighting/flower reset and save isolation passed.'
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
