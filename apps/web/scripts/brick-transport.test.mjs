import test from 'node:test';
import assert from 'node:assert/strict';
import { starterBuggy } from '../public/games/brick-playground-3d/freight.mjs';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import { citySave, cityWorld, HALF } from '../public/games/brick-playground-3d/settlement.mjs';
import {
  newTransport,
  restoreTransport,
  transportPoint,
  transportObstacles,
  transportClear,
  transportRun,
  canServiceTransport,
  serviceTransport,
  advanceTransport
} from '../public/games/brick-playground-3d/transport.mjs';

const buggy = starterBuggy();
const pickup = 'h-3-4',
  dropoff = 'h-4-4';
const route = () => newTransport(pickup, dropoff);
const city = () => ({ ...cityWorld(), streets: [pickup, dropoff] });
const tick = (run, obstacles, gas = 1, steer = 0) =>
  advanceTransport(run, 'road', gas, steer, false, 1 / 60, obstacles);

test('old saves need no transport; malformed routes never become trips', () => {
  for (const value of [
    undefined,
    null,
    {},
    { ...route(), stage: 0 },
    { ...route(), stage: 4 },
    { ...route(), pickup: dropoff },
    { ...route(), pickup: 'h-8-4' },
    { ...route(), dropoff: 'v-4-8' },
    { ...route(), pickup: 'h-03-4' },
    { ...route(), pickup: 7 }
  ])
    assert.equal(restoreTransport(value), null);
  assert.deepEqual(restoreTransport({ ...route(), speed: Infinity }), route());
  assert.equal(transportPoint('nonsense'), null);
});
test('saved workshop geometry is untouched and a real starter town street is drivable', () => {
  const town = cityWorld(),
    original = JSON.stringify(buggy),
    obstacles = transportObstacles(town.pieces, buggy);
  const trip = newTransport(town.streets[0], town.streets[1]);
  const run = transportRun(buggy, trip, obstacles, town);
  assert.ok(run);
  const start = run.x;
  for (let i = 0; i < 60; i++) tick(run, obstacles);
  assert.ok(run.x > start && !run.blocked);
  assert.equal(JSON.stringify(buggy), original);
});
test('deliveries require player-selected laid streets, stopped alignment and ordered handovers', () => {
  const trip = route(),
    town = city(),
    run = transportRun(buggy, trip, [], town);
  assert.ok(canServiceTransport(run, trip, town, []));
  for (const change of [{ speed: 1 }, { yaw: 0 }, { x: run.x + 2 }, transportPoint(dropoff)])
    assert.ok(!canServiceTransport({ ...run, ...change }, trip, town, []));
  assert.ok(!canServiceTransport(run, trip, { streets: [dropoff] }, []));
  const empty = run.load;
  assert.ok(serviceTransport(run, trip, town, []));
  assert.equal(trip.stage, 2);
  assert.equal(run.load, empty + 5);
  assert.ok(!serviceTransport(run, trip, town, []));
  Object.assign(run, transportPoint(dropoff));
  assert.ok(serviceTransport(run, trip, town, []));
  assert.equal(trip.stage, 3);
  assert.equal(run.load, empty);
  assert.ok(!serviceTransport(run, trip, town, []));
});
test('reload and recovery preserve cargo, stop at last serviced point and fail safely after edits', () => {
  const town = city(),
    trip = route(),
    run = transportRun(buggy, trip, [], town);
  serviceTransport(run, trip, town, []);
  const loaded = restoreTransport(JSON.parse(JSON.stringify(trip)));
  const restored = transportRun(buggy, loaded, [], town);
  assert.equal(restored.speed, 0);
  assert.equal(restored.load, run.load);
  assert.equal(restored.x, transportPoint(pickup).x);
  assert.equal(transportRun(buggy, loaded, [], { streets: [dropoff] }), null);
  const obstruction = [{ ...transportPoint(pickup), w: 1, d: 1 }];
  assert.equal(transportRun(buggy, loaded, obstruction, town), null);
  assert.deepEqual(loaded, trip);
  assert.ok(transportRun(buggy, loaded, [], town));
  Object.assign(restored, transportPoint(dropoff));
  serviceTransport(restored, loaded, town, []);
  assert.equal(transportRun(buggy, loaded, [], town).x, transportPoint(dropoff).x);
});
test('actual wall collision blocks the loaded buggy; reversing and a repaired entrance work', () => {
  const trip = route(),
    town = city(),
    run = transportRun(buggy, trip, [], town);
  serviceTransport(run, trip, town, []);
  const wall = [{ id: 'wall', type: 'wall', x: -6, y: 0, z: -1, r: 1, color: 'Sun' }];
  const obstacles = transportObstacles(wall, buggy);
  for (let i = 0; i < 240; i++) tick(run, obstacles);
  assert.ok(run.blocked);
  assert.ok(run.x < -6);
  const x = run.x;
  for (let i = 0; i < 60; i++) tick(run, obstacles, -1);
  assert.ok(run.x < x && !run.blocked);
  for (let i = 0; i < 360; i++) tick(run, []);
  assert.ok(run.x > -6 && !run.blocked);
});
test('tight corridors respect tyres, overhead clearance and full orientation', () => {
  const run = { x: 0, z: 0, yaw: 0 };
  const walls = [
    { x: -2.5, z: 0, w: 1, d: 10 },
    { x: 2.5, z: 0, w: 1, d: 10 }
  ];
  assert.ok(!transportClear(run, walls));
  assert.ok(
    transportClear(
      run,
      walls.map((w) => ({ ...w, x: w.x * 1.4 }))
    )
  );
  const overhead = [{ id: 'roof', type: 'square', x: -1, z: -1, y: 8, r: 0, color: 'Sun' }];
  assert.equal(transportObstacles(overhead, buggy).length, 0);
  assert.ok(
    transportObstacles(
      overhead.map((p) => ({ ...p, y: 1 })),
      buggy
    ).length > 0
  );
});
test('outer-street stops keep the entire buggy inside the city and bounds stop sustained driving', () => {
  for (const key of ['h-0-0', 'h-7-8', 'v-0-0', 'v-8-7'])
    assert.ok(transportClear(transportPoint(key), []));
  const run = { ...transportRun(buggy, route(), [], city()), x: HALF - 2.09 };
  for (let i = 0; i < 120; i++) tick(run, []);
  assert.ok(run.blocked && run.x <= HALF - 2.08);
  const x = run.x;
  advanceTransport(run, 'road', 1, 0, false, 100, [{ x: x + 3, z: 0, w: 1, d: 5 }]);
  assert.ok(run.x <= HALF - 2.08);
});
test('removed destination and blocked target cannot be serviced until repaired', () => {
  const trip = { ...route(), stage: 2 },
    town = city();
  const run = {
    ...transportRun(buggy, trip, [], town),
    ...transportPoint(dropoff)
  };
  assert.ok(!canServiceTransport(run, trip, { streets: [pickup] }, []));
  const obstacles = [{ ...transportPoint(dropoff), w: 1, d: 1 }];
  assert.ok(!canServiceTransport(run, trip, town, obstacles));
  assert.ok(canServiceTransport(run, trip, town, []));
});

test('delivery route round trips with city bricks, layout and both resident households', () => {
  const town = city();
  town.resident = {
    home: 'home-one',
    shop: 'shop-one',
    phase: 'street',
    x: 0,
    y: 0,
    z: 0,
    heading: 0,
    vy: 0,
    wait: 0,
    grounded: true,
    paused: false,
    returning: false
  };
  town.neighbour = {
    ...town.resident,
    home: 'home-two',
    shop: 'hall-two',
    paused: true
  };
  for (const stage of [1, 2, 3]) {
    town.transport = { ...route(), stage };
    const serialized = citySave(town);
    const restored = loadWorld('city', {
      getItem: (key) => (key === saveKey('city') ? serialized : null)
    });
    assert.deepEqual(restored, town);
    assert.equal(
      transportRun(buggy, restored.transport, [], restored).load,
      transportRun(buggy, town.transport, [], town).load
    );
  }
});
test('legacy cities and invalid optional routes load without losing the settlement', () => {
  const legacy = cityWorld();
  const load = (town) => loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(load(legacy), legacy);
  for (const invalid of [null, {}, { ...route(), stage: '2' }, { ...route(), pickup: dropoff }]) {
    assert.deepEqual(load({ ...legacy, transport: invalid }), legacy);
  }
  const repairedLater = { ...legacy, transport: route(), streets: [] };
  assert.deepEqual(
    load(repairedLater).transport,
    route(),
    'a removed street does not destroy delivery progress'
  );
  assert.equal(transportRun(buggy, load(repairedLater).transport, [], load(repairedLater)), null);
});
test('town delivery saves never leak into the workshop, Free Build or Market Freight', () => {
  const town = { ...cityWorld(), transport: { ...route(), stage: 2 } };
  const garage = {
    ...world('garage'),
    name: 'My grip buggy',
    tyres: 'grip',
    pieces: buggy
  };
  const free = {
    ...world('free'),
    name: 'Separate free build',
    pieces: [
      {
        id: 'free-only',
        type: 'single',
        color: 'Coral',
        x: 0,
        y: 0,
        z: 0,
        r: 0
      }
    ]
  };
  const district = {
    ...world('district'),
    stage: 2,
    freightStop: 3,
    freightComplete: false
  };
  const saves = new Map([
    [saveKey('city'), citySave(town)],
    [saveKey('garage'), JSON.stringify(garage)],
    [saveKey('free'), JSON.stringify(free)],
    [saveKey('district'), JSON.stringify(district)]
  ]);
  const storage = { getItem: (key) => saves.get(key) ?? null };
  assert.equal(new Set(['city', 'garage', 'free', 'district'].map(saveKey)).size, 4);
  assert.deepEqual(loadWorld('garage', storage), garage);
  assert.deepEqual(loadWorld('free', storage), free);
  assert.deepEqual(loadWorld('district', storage), district);
  assert.deepEqual(loadWorld('city', storage), town);
  for (const kind of ['garage', 'free', 'district']) {
    const external = JSON.parse(saves.get(saveKey(kind)));
    external.transport = route();
    saves.set(saveKey(kind), JSON.stringify(external));
    assert.ok(!Object.hasOwn(loadWorld(kind, storage), 'transport'));
  }
});
