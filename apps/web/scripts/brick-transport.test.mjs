import { transportParkingHint } from '../public/games/brick-playground-3d/transport-ui.mjs';
import {
  walkingRoute,
  directionTracker
} from '../public/games/brick-playground-3d/walking-directions.mjs';
import { directionControls } from '../public/games/brick-playground-3d/directions-ui.mjs';
import { namedDoors } from '../public/games/brick-playground-3d/street-directory.mjs';
import { postVisit, handlePost } from '../public/games/brick-playground-3d/neighbourhood-post.mjs';
import { transportStreetLabel } from '../public/games/brick-playground-3d/transport-ui.mjs';
import { previewStreet } from '../public/games/brick-playground-3d/street-builder.mjs';
import {
  boundaryChange,
  neighbourhoodNames
} from '../public/games/brick-playground-3d/neighbourhoods.mjs';
import test from 'node:test';
import {
  gardenVisit,
  tendGarden,
  GROW_MS
} from '../public/games/brick-playground-3d/community-garden.mjs';
import assert from 'node:assert/strict';
import { starterBuggy } from '../public/games/brick-playground-3d/freight.mjs';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import {
  citySave,
  cityWorld,
  HALF,
  BLOCKS,
  MOVE_IN_SLOTS,
  householdsFor,
  moveIn,
  endHousehold
} from '../public/games/brick-playground-3d/settlement.mjs';
import {
  prepareTrail,
  trailEntrance,
  stampTrail,
  startingPavement
} from '../public/games/brick-playground-3d/town-trail.mjs';
import {
  newTrip,
  tripRuntime,
  visitFront,
  restingSeat,
  advanceTrip
} from '../public/games/brick-playground-3d/resident-trip.mjs';
import {
  openMarket,
  marketCounter,
  stepHousehold,
  nextCustomer,
  serveCustomer
} from '../public/games/brick-playground-3d/market-day.mjs';
import { planStreets } from '../public/games/brick-playground-3d/street-planner.mjs';
import {
  previewBlockRow,
  stageBlockRow
} from '../public/games/brick-playground-3d/block-expansion.mjs';
import {
  setRoutine,
  tickRoutines
} from '../public/games/brick-playground-3d/resident-routines.mjs';
import {
  newTransport,
  transportParking,
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

test('routine departures and clock survive cargo collection, reload and delivery together', () => {
  const town = city();
  const doors = [30, 36].map((x, i) => ({
    id: 'routine-door-' + i,
    type: 'door',
    color: 'Lagoon',
    x,
    z: 30,
    y: 0,
    r: 0
  }));
  town.pieces.push(...doors);
  town.resident = newTrip(...doors);
  town.resident.phase = 'done';
  setRoutine(town.resident, 8);
  town.resident.routine.visits = 3;
  town.clockMinutes = 479;
  town.transport = route();
  const run = transportRun(buggy, town.transport, [], town);
  assert.ok(serviceTransport(run, town.transport, town, []));
  assert.ok(tickRoutines(town, 0.1), 'a household can depart during a delivery');
  assert.equal(town.resident.phase, 'leave');
  const restored = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(restored, town, 'both optional features round trip in one save');
  const resident = structuredClone(restored.resident);
  const resumed = transportRun(buggy, restored.transport, [], restored);
  Object.assign(resumed, transportPoint(dropoff));
  assert.ok(serviceTransport(resumed, restored.transport, restored, []));
  assert.equal(restored.transport.stage, 3);
  assert.equal(restored.clockMinutes, 480.5);
  assert.deepEqual(
    restored.resident,
    resident,
    'cargo handover preserves the household schedule and trip'
  );
});

test('street repair preserves loaded cargo, household schedules and clock through reload', () => {
  const town = city();
  const doors = [18, 20].map((id, i) => ({
    id: 'planner-door-' + i,
    type: 'door',
    color: 'Chalk',
    x: BLOCKS[id].x,
    y: 0,
    z: BLOCKS[id].z,
    r: 0
  }));
  town.pieces.push(...doors);
  town.streets.push('h-2-3', 'h-4-3');
  town.resident = newTrip(...doors);
  setRoutine(town.resident, 14);
  town.clockMinutes = 750;
  town.transport = { ...route(), stage: 2 };
  const before = structuredClone(town);
  const plan = planStreets(town, town.resident);
  assert.deepEqual(plan.missing, ['h-3-3']);
  assert.deepEqual(town, before, 'preview does not mutate the saved delivery');
  const repaired = { ...town, streets: [...town.streets, ...plan.missing] };
  const restored = loadWorld('city', { getItem: () => citySave(repaired) });
  assert.deepEqual(restored, repaired);
  assert.deepEqual(restored.transport, before.transport);
  assert.deepEqual(restored.resident, before.resident);
  assert.equal(restored.clockMinutes, before.clockMinutes);
  assert.deepEqual(planStreets(restored, restored.resident).missing, []);
  const resumed = transportRun(buggy, restored.transport, [], restored);
  Object.assign(resumed, transportPoint(dropoff));
  assert.ok(serviceTransport(resumed, restored.transport, restored, []));
  assert.equal(restored.transport.stage, 3);
  assert.deepEqual(restored.resident, before.resident);
});

test('block expansion keeps the original delivery and household saves without duplicating them', () => {
  const town = city();
  const doors = [30, 36].map((x, i) => ({
    id: 'expansion-door-' + i,
    type: 'door',
    color: 'Chalk',
    x,
    y: 0,
    z: 30,
    r: 0
  }));
  town.pieces.push(...doors);
  town.resident = newTrip(...doors);
  setRoutine(town.resident, 18);
  town.resident.routine.visits = 4;
  town.neighbour = newTrip(...doors.toReversed());
  setRoutine(town.neighbour, 8);
  town.clockMinutes = 1020;
  town.transport = { ...route(), stage: 2 };
  const before = structuredClone(town);
  const spec = { source: BLOCKS[27], first: BLOCKS[0], count: 2, direction: 'east', turns: 1 };
  assert.equal(previewBlockRow(town, spec).issue, '');
  assert.deepEqual(town, before, 'preview leaves cargo and households untouched');
  const expanded = stageBlockRow(town, spec);
  assert.ok(expanded.pieces.length > town.pieces.length);
  assert.deepEqual(town, before, 'staging keeps the undo snapshot intact');
  const restored = loadWorld('city', { getItem: () => citySave(expanded) });
  assert.deepEqual(restored, expanded);
  for (const key of ['transport', 'resident', 'neighbour', 'clockMinutes'])
    assert.deepEqual(restored[key], before[key], key + ' is preserved once');
  assert.strictEqual(stageBlockRow(expanded, spec), expanded, 'occupied rows reject atomically');
  assert.deepEqual(loadWorld('city', { getItem: () => citySave(before) }), before);
  const resumed = transportRun(buggy, restored.transport, [], restored);
  Object.assign(resumed, transportPoint(dropoff));
  assert.ok(serviceTransport(resumed, restored.transport, restored, []));
  assert.equal(restored.transport.stage, 3);
  assert.deepEqual(restored.resident, before.resident);
  assert.deepEqual(restored.neighbour, before.neighbour);
});

test('all eight household schedules and cargo survive delivery reload and move-in slot reuse', () => {
  const town = city();
  const doors = Array.from({ length: 10 }, (_, i) => ({
    id: 'full-roster-door-' + i,
    type: 'door',
    color: 'Lagoon',
    x: BLOCKS[i].x,
    z: BLOCKS[i].z,
    y: 0,
    r: 0
  }));
  town.pieces.push(...doors);
  town.resident = newTrip(doors[0], doors[8]);
  town.neighbour = newTrip(doors[1], doors[9]);
  for (let i = 0; i < 6; i++) {
    assert.equal(
      moveIn(
        town,
        'Household ' + i,
        i % 2 ? 'hall' : 'spaza',
        newTrip(doors[i + 2], doors[8 + (i % 2)])
      ).key,
      MOVE_IN_SLOTS[i]
    );
  }
  const profiles = householdsFor(town);
  assert.equal(profiles.length, 8);
  profiles.forEach(({ key }, i) => {
    town[key].phase = 'done';
    setRoutine(town[key], 8);
    town[key].routine.visits = i;
  });
  town.family6.paused = true;
  town.clockMinutes = 479;
  town.transport = route();
  const run = transportRun(buggy, town.transport, [], town);
  assert.ok(serviceTransport(run, town.transport, town, []));
  assert.ok(tickRoutines(town, 0.1));
  for (const { key } of profiles)
    assert.equal(town[key].phase, key === 'family6' ? 'done' : 'leave');
  const restored = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(restored, town, 'the entire roster and loaded delivery round trip together');
  const occupants = profiles.map(({ key }) => structuredClone(restored[key]));
  const resumed = transportRun(buggy, restored.transport, [], restored);
  Object.assign(resumed, transportPoint(dropoff));
  assert.ok(serviceTransport(resumed, restored.transport, restored, []));
  assert.equal(restored.transport.stage, 3);
  assert.equal(restored.clockMinutes, 480.5);
  profiles.forEach(({ key }, i) => assert.deepEqual(restored[key], occupants[i]));
  const released = restored.family3.home;
  endHousehold(restored, 'family3');
  assert.equal(moveIn(restored, 'Replacement', 'hall', newTrip(doors[4], doors[9])).key, 'family3');
  assert.equal(restored.family3.home, released);
  assert.equal(restored.transport.stage, 3);
  for (const { key } of profiles.filter(({ key }) => key !== 'family3'))
    assert.deepEqual(restored[key], town[key]);
  const malformed = {
    ...restored,
    members: [...restored.members, { key: '__proto__', name: 'Bad', visit: 'hall' }]
  };
  const cleaned = loadWorld('city', { getItem: () => citySave(malformed) });
  assert.deepEqual(
    cleaned,
    restored,
    'a malformed member cannot discard cargo or valid households'
  );
});

test('half-served market queues and receipts survive cargo driving, recovery and reload', () => {
  const town = city();
  const doors = [0, 1, 2].map((id) => ({
    id: 'market-door-' + id,
    type: 'door',
    color: 'Lagoon',
    x: BLOCKS[id].x,
    z: BLOCKS[id].z,
    y: 0,
    r: 0
  }));
  town.pieces.push(...doors);
  town.resident = newTrip(doors[0], doors[2]);
  moveIn(town, 'Ayanda', 'spaza', newTrip(doors[1], doors[2]));
  openMarket(town, doors[2].id);
  const till = { ...marketCounter(town).inside, y: 0 };
  for (const key of ['resident', 'family1'])
    Object.assign(town[key], till, { phase: 'shopping', wait: 1 });
  assert.equal(serveCustomer(town, till, true).name, 'Lebo');
  const market = structuredClone(town.market),
    waiting = structuredClone(town.family1),
    profile = householdsFor(town).find((p) => p.key === 'family1'),
    runtime = tripRuntime();
  town.transport = route();
  let run = transportRun(buggy, town.transport, [], town);
  assert.ok(serviceTransport(run, town.transport, town, []));
  for (let i = 0; i < 60; i++) {
    advanceTransport(run, 'road', 1, 0, false, 1 / 60, []);
    stepHousehold(town, profile, town.family1, runtime, 1 / 60);
  }
  assert.ok(run.x > transportPoint(pickup).x);
  assert.deepEqual(town.market, market);
  assert.deepEqual(town.family1, waiting, 'the waiting shopper stays at the till during driving');
  run = transportRun(buggy, town.transport, [], town);
  assert.equal(run.x, transportPoint(pickup).x, 'recovery returns the loaded buggy to pickup');
  const restored = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(restored, town);
  assert.equal(nextCustomer(restored).name, 'Ayanda');
  assert.equal(serveCustomer(restored, till, false), null, 'driving cannot serve the market');
  const resumed = transportRun(buggy, restored.transport, [], restored);
  Object.assign(resumed, transportPoint(dropoff));
  assert.ok(serviceTransport(resumed, restored.transport, restored, []));
  assert.deepEqual(restored.market, market);
  assert.deepEqual(restored.family1, waiting);
  assert.equal(
    serveCustomer(restored, till, true).name,
    'Ayanda',
    'walking service resumes after delivery'
  );
  assert.equal(restored.market.receipts.length, 2);
  delete restored.market;
  assert.equal(restored.transport.stage, 3, 'closing the market preserves completed transport');
});

test('streetlamp collision and lighting previews preserve loaded cargo, schedules and receipts', () => {
  const town = city();
  const lamps = [-20, -10, 10, 20].map((x, i) => ({
    id: 'lamp-' + i,
    type: 'streetlamp',
    color: 'Sun',
    x,
    y: 0,
    z: 4,
    r: 0
  }));
  const doors = [0, 1].map((i) => ({
    id: 'lamp-home-' + i,
    type: 'door',
    color: 'Lagoon',
    x: BLOCKS[i].x,
    z: BLOCKS[i].z,
    y: 0,
    r: 0
  }));
  town.pieces.push(...lamps, ...doors);
  town.transport = { ...route(), stage: 2 };
  town.resident = { ...newTrip(...doors), paused: true, routine: { hour: 18, visits: 3 } };
  town.market = { shop: doors[1].id, receipts: [{ name: 'Lebo', home: doors[0].id, block: 'A1' }] };
  town.clockMinutes = 1080;
  const progress = (w) => ({
    transport: w.transport,
    resident: w.resident,
    market: w.market,
    clockMinutes: w.clockMinutes
  });
  const before = structuredClone(progress(town));
  const obstacles = transportObstacles(town.pieces, buggy);
  const run = transportRun(buggy, town.transport, obstacles, town);
  assert.ok(run, 'set-back lamps leave the full buggy width clear');
  for (let i = 0; i < 180; i++) tick(run, obstacles);
  assert.ok(run.x > transportPoint(pickup).x + 10 && !run.blocked);
  const post = transportObstacles([lamps[0]], buggy);
  assert.ok(
    !transportClear({ x: lamps[0].x + 0.5, z: lamps[0].z + 0.5, yaw: Math.PI / 2 }, post),
    'lamps remain real collision obstacles'
  );
  for (const lighting of ['night', 'day', 'clock', 'invalid']) {
    const restored = loadWorld('city', { getItem: () => citySave({ ...town, lighting }) });
    assert.deepEqual(progress(restored), before);
    assert.deepEqual(restored.pieces, town.pieces);
    assert.equal(restored.lighting, ['night', 'day'].includes(lighting) ? lighting : undefined);
    const recovered = transportRun(buggy, restored.transport, obstacles, restored);
    assert.equal(recovered.x, transportPoint(pickup).x);
    assert.equal(recovered.load, run.load);
  }
});

test('walking passports survive cargo recovery and reload without granting driving stamps', () => {
  const town = city();
  const doors = [0, 1].map((i) => ({
    id: 'trail-door-' + i,
    type: 'door',
    color: 'Lagoon',
    x: BLOCKS[i].x,
    z: BLOCKS[i].z,
    y: 0,
    r: 0
  }));
  town.pieces.push(...doors);
  town.trail = prepareTrail(
    town,
    'Landmarks',
    doors.map((p, i) => ({ door: p.id, label: 'Stop ' + i }))
  );
  const at = (i) => ({ ...trailEntrance(town, doors[i].id).inside, y: 0 });
  assert.equal(stampTrail(town, at(0), true).label, 'Stop 0');
  town.transport = route();
  let run = transportRun(buggy, town.transport, [], town);
  assert.ok(serviceTransport(run, town.transport, town, []));
  const passport = structuredClone(town.trail);
  for (let i = 0; i < 90; i++) tick(run, []);
  assert.equal(stampTrail(town, at(1), false), null, 'driving cannot stamp even at a landmark');
  run = transportRun(buggy, town.transport, [], town);
  assert.equal(run.x, transportPoint(pickup).x);
  const restored = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(restored.trail, passport);
  assert.deepEqual(restored.transport, town.transport);
  assert.deepEqual(startingPavement(restored).curb, trailEntrance(town, doors[0].id).curb);
  restored.trail = prepareTrail(
    restored,
    'Renamed walk',
    passport.stops.map((s) => ({ ...s, label: s.label + ' renamed' }))
  );
  assert.equal(restored.trail.stamps, 1, 'renaming landmarks keeps prior stamps');
  const resumed = transportRun(buggy, restored.transport, [], restored);
  Object.assign(resumed, transportPoint(dropoff));
  assert.ok(serviceTransport(resumed, restored.transport, restored, []));
  assert.equal(restored.trail.stamps, 1, 'delivery cannot stamp a landmark');
  assert.ok(stampTrail(restored, at(1), true));
  assert.equal(restored.trail.stamps, 2);
  assert.equal(restored.transport.stage, 3, 'walking stamps preserve completed delivery');
  const corrupt = { ...restored, trail: { name: 'Bad', stops: [{}, {}], stamps: 2 } };
  const cleaned = loadWorld('city', { getItem: () => citySave(corrupt) });
  assert.equal(cleaned.trail, undefined);
  assert.deepEqual(cleaned.transport, restored.transport, 'invalid trail cannot erase delivery');
});

test('neighbourhood boundaries round trip with cargo, households, market and walking passport', () => {
  const town = city();
  const doors = [0, 1].map((i) => ({
    id: 'area-home-' + i,
    type: 'door',
    color: 'Lagoon',
    x: BLOCKS[i].x,
    z: BLOCKS[i].z,
    y: 0,
    r: 0
  }));
  town.pieces.push(...doors);
  town.transport = { ...route(), stage: 2 };
  town.resident = { ...newTrip(...doors), paused: true, routine: { hour: 18, visits: 2 } };
  town.market = { shop: doors[1].id, receipts: [{ name: 'Lebo', home: doors[0].id, block: 'A1' }] };
  town.trail = prepareTrail(
    town,
    'Home walk',
    doors.map((p, i) => ({ door: p.id, label: 'Stop ' + i }))
  );
  town.trail.stamps = 1;
  town.clockMinutes = 1080;
  town.lighting = 'night';
  const savedProgress = (w) => ({
    transport: w.transport,
    resident: w.resident,
    market: w.market,
    trail: w.trail,
    clockMinutes: w.clockMinutes,
    lighting: w.lighting
  });
  const progress = structuredClone(savedProgress(town));
  for (const [action, area, id, name] of [
    ['create', '', 35, 'Depot Quarter'],
    ['add', 'Depot Quarter', 36],
    ['rename', 'Depot Quarter', 35, 'Delivery District']
  ]) {
    const result = boundaryChange(town, action, area, BLOCKS[id], name);
    assert.ok(result.blocks);
    town.blocks = result.blocks;
    const reopened = loadWorld('city', { getItem: () => citySave(town) });
    assert.deepEqual(reopened.blocks, town.blocks);
    assert.deepEqual(savedProgress(reopened), progress);
  }
  assert.deepEqual(neighbourhoodNames(town), ['Delivery District']);
  const boundaries = town.blocks;
  town.blocks = boundaryChange(town, 'dissolve', 'Delivery District', BLOCKS[35]).blocks;
  const run = transportRun(buggy, town.transport, [], town);
  Object.assign(run, transportPoint(dropoff));
  assert.ok(serviceTransport(run, town.transport, town, []));
  town.blocks = boundaries;
  const restored = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(neighbourhoodNames(restored), ['Delivery District']);
  assert.equal(
    restored.transport.stage,
    3,
    'restoring boundary metadata cannot undo a later delivery'
  );
  assert.deepEqual(savedProgress(restored), {
    ...progress,
    transport: { ...progress.transport, stage: 3 }
  });
});

test('gardening and delivery preserve each other across growth, recovery, reload and fixture edits', () => {
  let town = city();
  const pot = { id: 'garden-pot', type: 'pot', color: 'Leaf', r: 0, x: 12, y: 0, z: 5 };
  const bench = { id: 'garden-seat', type: 'bench', color: 'Sun', r: 0, x: 12, y: 0, z: -6 };
  town.pieces = [pot, bench];
  town.blocks = {
    28: { name: 'Flower court', zone: 'park', neighbourhood: 'Garden Quarter' },
    36: { name: 'Rest court', zone: 'park', neighbourhood: 'Garden Quarter' }
  };
  town.transport = { ...route(), stage: 2 };
  const hand = { x: pot.x + 1, y: 0, z: pot.z - 0.4 };
  const garden = (now, playing = true) => gardenVisit(town, hand, playing, now);
  const fire = (now, playing = true) => tendGarden(town, hand, playing, garden(now), 'daisy', now);
  assert.ok(fire(100));
  assert.ok(fire(200));
  assert.equal(town.transport.stage, 2);
  const wet = structuredClone(town.garden);
  let run = transportRun(buggy, town.transport, transportObstacles(town.pieces, buggy), town);
  assert.ok(run);
  for (let i = 0; i < 90; i++) tick(run, []);
  assert.equal(fire(200 + GROW_MS, false), false, 'driving cannot pick flowers');
  town = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(town.garden, wet);
  assert.equal(garden(200 + GROW_MS).action, 'pick', 'growth survives driving and reload');
  run = transportRun(buggy, town.transport, [], town);
  assert.equal(run.x, transportPoint(pickup).x);
  assert.ok(fire(200 + GROW_MS));
  assert.equal(town.garden.bouquet, 'daisy');
  Object.assign(run, transportPoint(dropoff));
  assert.ok(serviceTransport(run, town.transport, town, []));
  assert.equal(town.garden.bouquet, 'daisy', 'delivery cannot consume a bouquet');
  Object.assign(hand, { x: bench.x + 1, z: bench.z - 0.4 });
  assert.equal(garden(30000).action, 'display');
  assert.ok(fire(30000));
  assert.equal(town.transport.stage, 3, 'placing flowers cannot reset delivery');
  const pieces = town.pieces;
  town.pieces = town.pieces.filter((p) => p.id !== bench.id);
  assert.equal(loadWorld('city', { getItem: () => citySave(town) }).garden, undefined);
  town.pieces = pieces;
  const restored = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(restored.garden.displays, [{ id: bench.id, flower: 'daisy' }]);
  assert.equal(restored.transport.stage, 3, 'restoring a fixture cannot undo delivery');
  assert.deepEqual(restored.blocks, town.blocks);
});

test('seated and queued park visits retain rest time and routines through cargo recovery and delivery', () => {
  const town = world('city');
  const home = town.pieces.find((p) => p.type === 'door');
  const secondHome = { ...home, id: 'park-transport-home', x: BLOCKS[0].x, z: BLOCKS[0].z };
  const bench = town.pieces.find((p) => p.type === 'bench');
  town.pieces.push(secondHome);
  const front = visitFront(town, bench, true);
  const first = newTrip(home, bench, town),
    second = newTrip(secondHome, bench, town);
  Object.assign(first, front.inside, {
    phase: 'shopping',
    wait: 4.5,
    y: 0,
    paused: true,
    routine: { hour: 14, visits: 2 }
  });
  Object.assign(second, front.inside, {
    phase: 'enter',
    y: 0,
    paused: true,
    routine: { hour: 18, visits: 1 }
  });
  moveIn(town, 'Park first', 'park', first);
  moveIn(town, 'Park next', 'park', second);
  town.transport = { ...route(), stage: 2 };
  town.streets = [...new Set([...town.streets, pickup, dropoff])];
  town.garden = { plants: [], bouquet: 'daisy', displays: [{ id: bench.id, flower: 'marigold' }] };
  const garden = structuredClone(town.garden);
  let run = transportRun(buggy, town.transport, [], town);
  for (let i = 0; i < 120; i++) tick(run, []);
  run = transportRun(buggy, town.transport, [], town);
  assert.equal(run.x, transportPoint(pickup).x);
  const restored = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(restored.family1, first);
  assert.deepEqual(restored.family2, second);
  assert.deepEqual(restingSeat(restored, restored.family1), front.seat);
  assert.equal(restored.family1.wait, 4.5);
  assert.equal(householdsFor(restored).find((p) => p.key === 'family2').destination, 'Park bench');
  run = transportRun(buggy, restored.transport, [], restored);
  Object.assign(run, transportPoint(dropoff));
  assert.ok(serviceTransport(run, restored.transport, restored, []));
  assert.deepEqual(restored.family1, first, 'unloading does not advance a paused park rest');
  assert.deepEqual(restored.family2, second, 'unloading does not discard the bench queue');
  restored.family1.paused = restored.family2.paused = false;
  const a = tripRuntime(),
    b = tripRuntime();
  advanceTrip(restored, restored.family2, b, 0.02);
  assert.equal(b.waitingForSeat, true);
  for (let i = 0; i < 226; i++) advanceTrip(restored, restored.family1, a, 0.02);
  advanceTrip(restored, restored.family2, b, 0.02);
  assert.equal(restored.family2.phase, 'shopping', 'queue resumes after the saved rest finishes');
  assert.equal(restored.family1.returning, true);
  assert.deepEqual(restingSeat(restored, restored.family2), front.seat);
  const reopened = loadWorld('city', { getItem: () => citySave(restored) });
  assert.equal(reopened.transport.stage, 3);
  assert.deepEqual(reopened.garden, garden);
  assert.deepEqual(reopened.family1.routine, first.routine);
  assert.deepEqual(reopened.family2.routine, second.routine);
  assert.equal(reopened.family2.wait, 6, 'a newly seated park visitor retains the full rest');
});

test('Street Builder destination edits preserve cargo and block unloading until the street is restored', () => {
  const town = world('city');
  town.transport = { ...route(), stage: 2 };
  const initial = citySave(town);
  const sketch = previewStreet(town, 4 * 9 + 4, 4 * 9 + 5, 'horizontal', 'lay');
  assert.equal(
    citySave(town),
    initial,
    'preview and cancellation do not change saved cargo or roads'
  );
  town.streets = sketch.streets;
  const restored = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(restored.transport, town.transport);
  const run = transportRun(buggy, restored.transport, [], restored);
  const loaded = run.load;
  Object.assign(run, transportPoint(dropoff));
  assert.ok(canServiceTransport(run, restored.transport, restored, []));
  restored.streets = previewStreet(restored, 4 * 9 + 4, 4 * 9 + 5, 'horizontal', 'remove').streets;
  assert.equal(serviceTransport(run, restored.transport, restored, []), false);
  assert.equal(run.load, loaded);
  const missing = loadWorld('city', { getItem: () => citySave(restored) });
  assert.deepEqual(missing.transport, town.transport);
  missing.streets = previewStreet(missing, 4 * 9 + 4, 4 * 9 + 5, 'horizontal', 'lay').streets;
  assert.ok(serviceTransport(run, missing.transport, missing, []));
  assert.equal(missing.transport.stage, 3);
  assert.equal(run.load, loaded - 5);
  assert.deepEqual(missing.pieces, town.pieces);
  assert.deepEqual(missing.blocks, town.blocks);
  const completed = loadWorld('city', { getItem: () => citySave(missing) });
  assert.equal(completed.transport.stage, 3);
  completed.streets = previewStreet(
    completed,
    4 * 9 + 4,
    4 * 9 + 5,
    'horizontal',
    'remove'
  ).streets;
  assert.equal(transportRun(buggy, completed.transport, [], completed), null);
  assert.equal(completed.transport.stage, 3, 'later road removal cannot replay a delivery');
});
test('Street Builder pickup removal and reinstatement preserve the loaded recovery checkpoint', () => {
  const town = world('city');
  town.transport = { ...route(), stage: 2 };
  const before = transportRun(buggy, town.transport, [], town);
  town.streets = previewStreet(town, 4 * 9 + 3, 4 * 9 + 4, 'horizontal', 'remove').streets;
  const missing = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(missing.transport, town.transport);
  assert.equal(transportRun(buggy, missing.transport, [], missing), null);
  missing.streets = previewStreet(missing, 4 * 9 + 3, 4 * 9 + 4, 'horizontal', 'lay').streets;
  const restored = loadWorld('city', { getItem: () => citySave(missing) });
  const after = transportRun(buggy, restored.transport, [], restored);
  assert.ok(after);
  assert.equal(after.load, before.load);
  assert.equal(after.x, before.x);
  assert.equal(after.z, before.z);
  assert.deepEqual(restored.transport, town.transport);
});

test('named roads survive cargo recovery and delivery, while road Undo restores names without replaying cargo', () => {
  const town = world('city');
  town.streets = [pickup, dropoff];
  town.streetNames = { [pickup]: 'Cargo Lane', [dropoff]: 'Market Road' };
  town.transport = { ...route(), stage: 2 };
  const baseline = { streets: town.streets, streetNames: town.streetNames };
  const apply = (preview) =>
    Object.assign(town, { streets: preview.streets, streetNames: preview.streetNames });
  const rename = previewStreet(town, 4 * 9 + 3, 4 * 9 + 4, 'horizontal', 'name', 'Depot Lane');
  assert.equal(
    town.streetNames[pickup],
    'Cargo Lane',
    'preview does not change the active delivery'
  );
  apply(rename);
  const saved = loadWorld('city', { getItem: () => citySave(town) });
  assert.equal(saved.streetNames[pickup], 'Depot Lane');
  assert.deepEqual(saved.transport, town.transport);
  const run = transportRun(buggy, saved.transport, [], saved);
  assert.ok(run);
  const loaded = run.load;
  apply(previewStreet(town, 4 * 9 + 4, 4 * 9 + 5, 'horizontal', 'remove'));
  assert.equal(town.streetNames[dropoff], undefined);
  Object.assign(run, transportPoint(dropoff));
  assert.equal(serviceTransport(run, town.transport, town, []), false);
  assert.equal(run.load, loaded);
  Object.assign(town, baseline);
  assert.ok(serviceTransport(run, town.transport, town, []));
  assert.equal(town.transport.stage, 3);
  const completed = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(completed.streetNames, baseline.streetNames);
  assert.equal(completed.transport.stage, 3);
  apply(previewStreet(town, 4 * 9 + 3, 4 * 9 + 4, 'horizontal', 'unname'));
  assert.equal(town.streetNames[pickup], undefined);
  Object.assign(town, baseline);
  assert.equal(town.transport.stage, 3, 'construction Undo cannot restore already delivered cargo');
  assert.deepEqual(town.streetNames, baseline.streetNames);
});

test('transport stop labels use current street names while retaining the grid fallback', () => {
  const town = city();
  const grid = transportStreetLabel(pickup);
  town.streetNames = { [pickup]: 'Cargo Lane' };
  assert.equal(transportStreetLabel(pickup, town), 'Cargo Lane · ' + grid);
  town.streetNames = { [pickup]: 'Depot Road' };
  assert.equal(transportStreetLabel(pickup, town), 'Depot Road · ' + grid);
  town.streetNames = undefined;
  assert.equal(transportStreetLabel(pickup, town), grid);
  assert.equal(transportStreetLabel('missing', town), 'Unavailable street');
});

test('letters and cargo progress independently through driving, recovery, reload and construction Undo', () => {
  let town = city();
  town.streetNames = { [pickup]: 'Delivery Road' };
  town.pieces = [-21, -15, -9].map((x, i) => ({
    id: 'postal-door-' + i,
    type: 'door',
    color: 'Coral',
    x,
    y: 0,
    z: 5,
    r: 0
  }));
  town.transport = route();
  const at = (i) => ({ ...namedDoors(town).get('postal-door-' + i).front.inside, y: 0 });
  const act = (i, action) => {
    const point = at(i),
      request = postVisit(town, point, true);
    assert.equal(request.action, action);
    assert.ok(handlePost(town, point, true, request));
  };
  act(0, 'collect');
  const collected = structuredClone(town.post),
    originalPieces = town.pieces;
  let obstacles = transportObstacles(town.pieces, buggy);
  let run = transportRun(buggy, town.transport, obstacles, town);
  assert.ok(serviceTransport(run, town.transport, town, obstacles));
  assert.equal(town.transport.stage, 2);
  assert.deepEqual(town.post, collected);
  const point = at(2),
    request = postVisit(town, point, true);
  assert.equal(
    handlePost(town, point, false, request),
    false,
    'stale walking action is rejected while driving'
  );
  for (let i = 0; i < 60; i++) tick(run, obstacles);
  run = transportRun(buggy, town.transport, obstacles, town);
  assert.equal(run.x, transportPoint(pickup).x);
  town = loadWorld('city', { getItem: () => citySave(town) });
  assert.deepEqual(town.post, collected);
  assert.equal(town.transport.stage, 2);
  act(2, 'deliver');
  const partial = structuredClone(town.post);
  town.pieces = town.pieces.filter((p) => p.id !== 'postal-door-1');
  assert.match(postVisit(town, point, true).hint, /Restore the named street or entrance/);
  assert.deepEqual(town.post, partial);
  town.pieces = originalPieces; // Layout-only Undo, as used by the construction editor.
  assert.deepEqual(town.post, partial);
  assert.equal(town.transport.stage, 2);
  act(1, 'deliver');
  act(0, 'finish');
  const completed = structuredClone(town.post);
  town = loadWorld('city', { getItem: () => citySave(town) });
  obstacles = transportObstacles(town.pieces, buggy);
  run = transportRun(buggy, town.transport, obstacles, town);
  Object.assign(run, transportPoint(dropoff));
  assert.ok(serviceTransport(run, town.transport, town, obstacles));
  assert.equal(town.transport.stage, 3);
  assert.deepEqual(town.post, completed);
});

test('malformed postal saves do not erase cargo and malformed cargo does not erase a valid postbag', () => {
  const town = city();
  town.transport = { ...route(), stage: 2 };
  town.post = {
    office: { id: 'office', address: 'Delivery Road office' },
    stops: [{ id: 'house', address: 'Delivery Road house', delivered: true }],
    complete: true
  };
  const raw = JSON.parse(citySave(town));
  raw.post.stops = [raw.post.office];
  let restored = loadWorld('city', { getItem: () => JSON.stringify(raw) });
  assert.equal(restored.post, undefined);
  assert.deepEqual(restored.transport, town.transport);
  raw.post = town.post;
  raw.transport.stage = 99;
  restored = loadWorld('city', { getItem: () => JSON.stringify(raw) });
  assert.equal(restored.transport, undefined);
  assert.deepEqual(restored.post, town.post);
});

test('walking destinations follow edited entrances without changing cargo or postal saves', () => {
  let town = city();
  town.streetNames = { [pickup]: 'Delivery Road' };
  town.pieces = [-21, -15, -9].map((x, i) => ({
    id: 'guide-door-' + i,
    type: 'door',
    color: 'Coral',
    x,
    y: 0,
    z: 5,
    r: 0
  }));
  const office = { ...namedDoors(town).get('guide-door-0').front.inside, y: 0 };
  handlePost(town, office, true, postVisit(town, office, true));
  const destination = namedDoors(town).get('guide-door-1');
  town.directions = { id: destination.id, address: destination.address };
  town.transport = { ...route(), stage: 2 };
  const post = structuredClone(town.post),
    cargo = structuredClone(town.transport);
  const at = { x: -20, y: 0, z: 0 },
    before = { ...at },
    track = directionTracker();
  assert.equal(track(town, at).state, 'walking');
  const pieces = town.pieces;
  town.pieces = pieces.map((p) => (p.id === destination.id ? { ...p, x: -5 } : p));
  const moved = track(town, at);
  assert.ok(moved.points.at(-1).x > -5);
  town.streetNames = { [pickup]: 'Renamed Road' };
  assert.match(track(town, at).address, /Renamed Road/);
  town.pieces = town.pieces.filter((p) => p.id !== destination.id);
  assert.equal(track(town, at).state, 'missing');
  town.pieces = pieces; // Construction Undo keeps saved guidance and both delivery states.
  town = loadWorld('city', { getItem: () => citySave(town) });
  assert.equal(walkingRoute(town, at).state, 'walking');
  assert.deepEqual(at, before);
  assert.deepEqual(town.post, post);
  assert.deepEqual(town.transport, cargo);
  assert.equal(town.directions.id, destination.id);
});

test('guidance UI pauses while driving and cancellation preserves cargo and letters', () => {
  const town = city();
  town.streetNames = { [pickup]: 'Delivery Road' };
  town.pieces = [{ id: 'guide', type: 'door', color: 'Coral', x: -15, y: 0, z: 5, r: 0 }];
  town.directions = { id: 'guide', address: namedDoors(town).get('guide').address };
  town.transport = { ...route(), stage: 2 };
  town.post = {
    office: { id: 'office', address: 'Office' },
    stops: [{ id: 'guide', address: 'House', delivered: false }],
    complete: false
  };
  const original = structuredClone(town),
    elements = new Map();
  const previousDocument = globalThis.document;
  globalThis.document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, { hidden: false, textContent: '', dataset: {} });
      return elements.get(id);
    }
  };
  let playing = false,
    shown,
    saved = 0;
  try {
    const update = directionControls({
      city: () => town,
      player: () => ({ x: -20, y: 0, z: 0 }),
      playing: () => playing,
      save: () => saved++,
      show: (r) => (shown = r)
    });
    update();
    assert.equal(elements.get('directionsHud').dataset.state, 'paused');
    assert.equal(shown, null);
    assert.deepEqual(town, original);
    playing = true;
    update();
    assert.equal(shown.state, 'walking');
    playing = false;
    update();
    assert.equal(shown, null);
    elements.get('directionsStop').onclick();
    assert.equal(town.directions, undefined);
    assert.equal(saved, 1);
    assert.deepEqual(town.transport, original.transport);
    assert.deepEqual(town.post, original.post);
  } finally {
    globalThis.document = previousDocument;
  }
});


test('parking guidance explains the exact unmet handover requirement in either direction', () => {
  const trip = route(), town = city(), run = transportRun(buggy, trip, [], town);
  const cases = [
    [{ ...run, x: run.x + 3 }, [], town, 'approach', /marker/],
    [{ ...run, speed: 1 }, [], town, 'brake', /Hold Brake/],
    [{ ...run, speed: -1 }, [], town, 'brake', /Hold Brake/],
    [{ ...run, x: NaN }, [], town, 'recover', /Last stop/],
    [{ ...run, speed: Infinity }, [], town, 'recover', /Last stop/],
    [{ ...run, yaw: run.yaw + 0.5 }, [], town, 'align', /Line up/],
    [run, [{ x: run.x, z: run.z, w: 1, d: 1 }], town, 'blocked', /clearance/],
    [run, [], { ...town, streets: [] }, 'missing', /street is missing/],
    [run, [], town, 'ready', /Parked/],
    [{ ...run, yaw: run.yaw + Math.PI }, [], town, 'ready', /Parked/]
  ];
  for (const [position, obstacles, layout, expected, message] of cases) {
    const state = transportParking(position, trip, layout, obstacles);
    assert.equal(state, expected);
    assert.equal(canServiceTransport(position, trip, layout, obstacles), state === 'ready');
    assert.match(transportParkingHint(state), message);
  }
  assert.match(transportParkingHint('approach', true), /Path blocked/);
  trip.stage = 3;
  assert.equal(transportParking(run, trip, town, []), 'complete');
  assert.equal(canServiceTransport(run, trip, town, []), false);
});
