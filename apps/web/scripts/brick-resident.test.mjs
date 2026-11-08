import test from 'node:test';
import assert from 'node:assert/strict';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import { stageBlockRow } from '../public/games/brick-playground-3d/block-expansion.mjs';
import {
  BLOCKS,
  blockIndex,
  streetKeys,
  householdsFor,
  moveIn,
  endHousehold,
  MOVE_IN_SLOTS,
  citySave,
  restoreTrip
} from '../public/games/brick-playground-3d/settlement.mjs';
import {
  practiceSpaza,
  practiceHallTrip,
  isEntrance,
  newTrip,
  advanceTrip,
  tripRuntime,
  entrance,
  streetPath
} from '../public/games/brick-playground-3d/resident-trip.mjs';
import {
  tickRoutines,
  skipToDeparture,
  setRoutine,
  nextDeparture,
  START_TIME,
  DAY,
  clockLabel
} from '../public/games/brick-playground-3d/resident-routines.mjs';
function fixture() {
  const city = world('city'),
    shop = practiceSpaza(city).map((p, i) => ({ ...p, id: 'practice-' + i }));
  city.pieces = [...city.pieces, ...shop];
  const home = city.pieces.find((p) => p.type === 'door'),
    door = shop.find((p) => p.type === 'door');
  city.resident = newTrip(home, door);
  return { city, home, door, barrier: shop.at(-1) };
}
function until(city, rt, done, n = 9000) {
  for (let i = 0; i < n; i++) {
    advanceTrip(city, city.resident, rt, 1 / 60);
    if (done()) return;
  }
  assert.fail('Trip stopped at ' + JSON.stringify([city.resident, rt.issue]));
}
test('Lebo stops at a brick, reopens there and completes the same trip after a one-stud edit', () => {
  const { city, home, barrier } = fixture(),
    rt = tripRuntime();
  until(city, rt, () => rt.blocker === barrier.id);
  const stopped = { ...city.resident };
  for (let i = 0; i < 60; i++) advanceTrip(city, city.resident, rt, 1 / 60);
  assert.deepEqual(city.resident, stopped);
  const reopened = loadWorld('city', {
    getItem: (k) => (k === saveKey('city') ? citySave(city) : null)
  });
  assert.deepEqual(reopened.resident, stopped);
  const fresh = tripRuntime();
  reopened.pieces = reopened.pieces.map((p) => (p.id === barrier.id ? { ...p, z: p.z + 1 } : p));
  until(reopened, fresh, () => reopened.resident.phase === 'shopping');
  assert.ok(!reopened.resident.returning);
  until(reopened, fresh, () => reopened.resident.phase === 'done');
  assert.ok(
    reopened.resident.returning &&
      Math.hypot(
        reopened.resident.x - entrance(home).inside.x,
        reopened.resident.z - entrance(home).inside.z
      ) < 0.02
  );
});
test('streets can break and reconnect mid-walk; a removed doorway waits for undo', () => {
  const { city, door, barrier } = fixture(),
    rt = tripRuntime();
  city.pieces = city.pieces.filter((p) => p !== barrier);
  until(city, rt, () => city.resident.phase === 'street' && city.resident.x > -5);
  const roads = city.streets;
  city.streets = roads.filter((k) => k !== entrance(door).street);
  until(city, rt, () => rt.issue.includes('street'));
  const stopped = [city.resident.x, city.resident.z];
  until(city, rt, () => true);
  assert.deepEqual([city.resident.x, city.resident.z], stopped);
  city.streets = roads;
  const pieces = city.pieces;
  city.pieces = pieces.filter((p) => p.id !== door.id);
  until(city, rt, () => rt.issue.includes('entrance missing'));
  city.pieces = pieces;
  city.resident.paused = true;
  const paused = { ...city.resident };
  advanceTrip(city, city.resident, rt, 0.1);
  assert.deepEqual(city.resident, paused);
  city.resident.paused = false;
  until(city, rt, () => city.resident.phase === 'done');
});
test('routes use connected street segments, including partial edges and a detour', () => {
  const start = { x: -6, z: 0 },
    end = { x: 6, z: 0 };
  const detour = ['h-3-4', 'v-4-3', 'h-4-3', 'v-5-3', 'h-4-4'];
  assert.deepEqual(streetPath(detour, start, end), [{ x: 0, z: 0 }, end]);
  assert.equal(streetPath(['h-3-4', 'h-5-4'], start, end), null);
  assert.deepEqual(streetPath(['v-3-3', 'h-3-3', 'v-4-3'], { x: -24, z: 5 }, { x: 0, z: 5 }), [
    { x: -24, z: 24 },
    { x: 0, z: 24 },
    { x: 0, z: 5 }
  ]);
  assert.deepEqual(streetPath(['h-0-0', 'v-1-0'], { x: -87, z: 95.5 }, { x: -72, z: 90 }), [
    { x: -72, z: 95.5 },
    { x: -72, z: 90 }
  ]);
  assert.equal(restoreTrip({ phase: 'street', x: Infinity }), null);
});

test('a second household can share a street, finish its own visit and keep walking after the other pauses', () => {
  const { city, home, barrier } = fixture();
  const group = practiceHallTrip(city).map((p, i) => ({ ...p, id: 'hall-' + i }));
  const [front, hall] = group.filter(isEntrance);
  city.pieces = [...city.pieces, ...group];
  assert.equal(practiceHallTrip(city), null, 'existing buildings cannot be overwritten');
  city.neighbour = newTrip(front, hall);
  const first = tripRuntime(),
    second = tripRuntime();
  const onSharedStreet = new Set();
  for (let i = 0; i < 14000 && city.neighbour.phase !== 'done'; i++) {
    for (const [key, rt] of [
      ['resident', first],
      ['neighbour', second]
    ]) {
      const t = city[key];
      advanceTrip(city, t, rt, 1 / 60);
      if (t.phase === 'street' && Math.abs(t.z) < 0.035 && t.x >= -7.5 && t.x <= -6.5)
        onSharedStreet.add(key);
    }
  }
  assert.equal(onSharedStreet.size, 2);
  assert.equal(city.neighbour.phase, 'done');
  assert.equal(first.blocker, barrier.id);
  const reopened = loadWorld('city', { getItem: () => citySave(city) });
  assert.deepEqual(reopened.neighbour, city.neighbour);
  assert.deepEqual(reopened.resident, city.resident);
  reopened.pieces = reopened.pieces.filter((p) => p.id !== barrier.id);
  reopened.neighbour.paused = true;
  until(reopened, first, () => reopened.resident.phase === 'done');
  assert.equal(reopened.resident.home, home.id);
  assert.equal(reopened.neighbour.shop, hall.id);
});
test('old single-household saves and independent household removal preserve the city', () => {
  const { city } = fixture();
  const reload = () => loadWorld('city', { getItem: () => citySave(city) });
  assert.equal(reload().neighbour, undefined);
  const buildings = practiceHallTrip(city).map((p, i) => ({ ...p, id: 'practice-hall-' + i }));
  city.pieces = [...city.pieces, ...buildings];
  const [h, d] = buildings.filter(isEntrance);
  city.neighbour = newTrip(h, d);
  delete city.resident;
  assert.deepEqual(reload().neighbour, city.neighbour);
  city.neighbour.x = Infinity;
  assert.equal(reload().neighbour, undefined);
  assert.deepEqual(reload().pieces, city.pieces);
});

test('reopening the C4 street resumes only the household that needs it', () => {
  const { city, barrier } = fixture();
  const buildings = practiceHallTrip(city).map((p, i) => ({ ...p, id: 'civic-' + i }));
  const [h, d] = buildings.filter(isEntrance);
  city.pieces = [...city.pieces.filter((p) => p !== barrier), ...buildings];
  city.neighbour = newTrip(h, d);
  const road = entrance(h).street;
  city.streets = city.streets.filter((k) => k !== road);
  const first = tripRuntime(),
    second = tripRuntime();
  for (let i = 0; i < 15000 && city.resident.phase !== 'done'; i++) {
    advanceTrip(city, city.resident, first, 1 / 60);
    advanceTrip(city, city.neighbour, second, 1 / 60);
  }
  assert.equal(city.resident.phase, 'done');
  assert.match(second.issue, /Missing east street at C4/);
  const finished = { ...city.resident };
  city.streets = [...city.streets, road];
  for (let i = 0; i < 15000 && city.neighbour.phase !== 'done'; i++) {
    advanceTrip(city, city.resident, first, 1 / 60);
    advanceTrip(city, city.neighbour, second, 1 / 60);
  }
  assert.equal(city.neighbour.phase, 'done');
  assert.deepEqual(city.resident, finished);
});

test('daily households repeat independently while a missed visit waits for a street repair', () => {
  const { city, barrier } = fixture();
  const buildings = practiceHallTrip(city).map((p, i) => ({ ...p, id: 'daily-hall-' + i }));
  const [h, d] = buildings.filter(isEntrance);
  city.pieces = [...city.pieces, ...buildings];
  city.neighbour = newTrip(h, d);
  setRoutine(city.resident, 8);
  setRoutine(city.neighbour, 14);
  city.resident.phase = city.neighbour.phase = 'done';
  const runtimes = [tripRuntime(), tripRuntime()];
  const step = () => {
    tickRoutines(city, 1 / 60);
    advanceTrip(city, city.resident, runtimes[0], 1 / 60);
    advanceTrip(city, city.neighbour, runtimes[1], 1 / 60);
  };
  const runUntil = (check) => {
    for (let i = 0; i < 30000; i++) {
      if (check()) return;
      step();
    }
    assert.fail('Daily routine did not reach its destination');
  };
  assert.ok(skipToDeparture(city));
  assert.equal(city.clockMinutes, 480);
  assert.equal(city.neighbour.phase, 'done');
  runUntil(() => runtimes[0].blocker === barrier.id);
  const blocked = { ...city.resident };
  assert.equal(skipToDeparture(city), false);
  runUntil(() => city.neighbour.routine.visits === 2);
  assert.deepEqual(city.resident, blocked);
  assert.equal(city.resident.routine.visits, 0);
  const reopened = loadWorld('city', { getItem: () => citySave(city) });
  assert.deepEqual(reopened.resident, city.resident);
  assert.deepEqual(reopened.neighbour, city.neighbour);
  assert.equal(reopened.clockMinutes, city.clockMinutes);
  city.pieces = city.pieces.map((p) => (p.id === barrier.id ? { ...p, z: p.z + 1 } : p));
  runUntil(() => city.resident.phase === 'done');
  assert.equal(city.resident.routine.visits, 1);
  const due = nextDeparture(city.clockMinutes, 8);
  step();
  assert.equal(city.resident.phase, 'done', 'missed departures do not queue');
  runUntil(() => city.clockMinutes >= due);
  assert.equal(city.resident.phase, 'leave');
});
test('shared departures, pause, midnight and old one-off saves', () => {
  const { city } = fixture();
  city.resident.phase = 'done';
  tickRoutines(city, 1);
  assert.equal(city.clockMinutes, undefined);
  assert.equal(skipToDeparture(city), false);
  setRoutine(city.resident, 8);
  city.neighbour = structuredClone(city.resident);
  city.neighbour.paused = true;
  city.clockMinutes = START_TIME;
  tickRoutines(city, 2);
  assert.equal(city.resident.phase, 'leave');
  assert.equal(city.neighbour.phase, 'done');
  city.neighbour.paused = false;
  tickRoutines(city, 1);
  assert.equal(city.neighbour.phase, 'done', 'missed departures stay skipped');
  setRoutine(city.resident, 14);
  assert.equal(city.resident.phase, 'leave', 'editing a schedule leaves the active route intact');
  city.resident.phase = 'done';
  setRoutine(city.resident, 8);
  assert.ok(skipToDeparture(city));
  assert.equal(clockLabel(city.clockMinutes), 'Day 2 · 08:00');
  assert.equal(city.resident.phase, 'leave');
  assert.equal(city.neighbour.phase, 'leave');
  setRoutine(city.resident, 0);
  assert.equal(city.resident.routine, undefined);
  assert.equal(clockLabel(DAY), 'Day 2 · 00:00');
  city.neighbour.routine.hour = 99;
  const saved = loadWorld('city', { getItem: () => citySave(city) });
  assert.equal(saved.neighbour.routine, undefined);
  assert.equal(saved.resident.phase, 'leave');
});

test('six new households share destinations, keep their own homes and finish independently', () => {
  const { city: base, barrier, door } = fixture();
  const buildings = practiceHallTrip(base).map((p, i) => ({ ...p, id: 'hall-' + i }));
  const [nalediHome, hall] = buildings.filter(isEntrance);
  base.pieces = [...base.pieces.filter((p) => p.id !== barrier.id), ...buildings];
  base.neighbour = newTrip(nalediHome, hall);
  const city = stageBlockRow(base, {
    source: BLOCKS[27],
    first: BLOCKS[8],
    count: 6,
    direction: 'east',
    turns: 2
  });
  city.streets = [...new Set(BLOCKS.flatMap((b) => Object.values(streetKeys(b))))];
  const index = blockIndex(city.pieces);
  for (let i = 0; i < 6; i++) {
    const trip = newTrip(index[8 + i].find(isEntrance), i % 2 ? hall : door);
    const p = moveIn(city, 'Resident ' + i, i % 2 ? 'hall' : 'spaza', trip);
    assert.equal(p.key, MOVE_IN_SLOTS[i]);
    assert.equal(moveIn(city, 'Other', 'hall', trip), null, 'occupied home');
  }
  assert.equal(moveIn(city, 'Ninth', 'spaza', newTrip(hall, door)), null);
  const reopened = loadWorld('city', { getItem: () => citySave(city) });
  assert.equal(householdsFor(reopened).length, 8);
  assert.deepEqual(reopened.members, city.members);
  const profiles = householdsFor(reopened),
    states = profiles.map(() => tripRuntime());
  for (let i = 0; i < 18000 && profiles.some((p) => reopened[p.key].phase !== 'done'); i++) {
    profiles.forEach((p, j) => advanceTrip(reopened, reopened[p.key], states[j], 1 / 60));
  }
  assert.ok(profiles.every((p) => reopened[p.key].phase === 'done'));
  const prev = reopened.family1;
  endHousehold(reopened, 'family1');
  assert.equal(householdsFor(reopened).length, 7);
  assert.equal(
    moveIn(reopened, 'New name', 'hall', newTrip(index[8].find(isEntrance), hall)).key,
    'family1'
  );
  assert.equal(reopened.family1.home, prev.home);
  assert.deepEqual(reopened.neighbour.shop, city.neighbour.shop);
});
test('malformed move-ins do not discard older trips or steal an occupied home', () => {
  const { city, home, door } = fixture();
  const custom = { ...city.resident, home: 'custom-front' };
  city.members = [
    { key: '__proto__', name: 'Invalid', visit: 'spaza' },
    { key: 'family1', name: ' Lebo ', visit: 'spaza' },
    { key: 'family2', name: 'Mpho', visit: 'hall' },
    { key: 'family3', name: 'Bad destination', visit: 'stadium' },
    { key: 'family4', name: 'Lerato', visit: 'spaza' }
  ];
  Object.assign(city, {
    family1: custom,
    family2: custom,
    family3: custom,
    family4: newTrip(home, door)
  });
  const reopened = loadWorld('city', { getItem: () => citySave(city) });
  assert.deepEqual(reopened.members, [{ key: 'family2', name: 'Mpho', visit: 'hall' }]);
  assert.deepEqual(reopened.resident, city.resident);
  setRoutine(reopened.family2, 14);
  reopened.family2.phase = 'done';
  reopened.resident.phase = 'done';
  assert.ok(skipToDeparture(reopened));
  assert.equal(reopened.family2.phase, 'leave');
  assert.equal(reopened.resident.phase, 'done');
});
