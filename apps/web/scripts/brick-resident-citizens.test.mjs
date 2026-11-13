import test from 'node:test';
import assert from 'node:assert/strict';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import { citySave, moveIn, householdsFor, MOVE_IN_SLOTS, BLOCKS, endHousehold, restoreTrip } from '../public/games/brick-playground-3d/settlement.mjs';
import { newTrip, isEntrance, advanceTrip, tripRuntime } from '../public/games/brick-playground-3d/resident-trip.mjs';
import { planStreets } from '../public/games/brick-playground-3d/street-planner.mjs';
import { setRoutine } from '../public/games/brick-playground-3d/resident-routines.mjs';
import { openMarket, callShoppers, shoppers } from '../public/games/brick-playground-3d/market-day.mjs';
import { updateCompanionPath, companionTrail, restoreCompanionPath } from '../public/games/brick-playground-3d/citizen-appearance.mjs';
import { journeySummary } from '../public/games/brick-playground-3d/citizen-journey.mjs';

function fixture(options = { family: true, childName: 'Mpho' }) {
  const city = world('city');
  const home = city.pieces.find(isEntrance);
  const bench = city.pieces.find((p) => p.type === 'bench');
  const trip = newTrip(home, bench, city);
  const profile = moveIn(city, 'Thandi', 'park', trip, undefined, options);
  return { city, home, bench, trip, profile };
}
const reopen = (city) => loadWorld('city', {
  getItem: (key) => key === saveKey('city') ? citySave(city) : null
});
function walkUntil(city, key, runtime, done) {
  for (let n = 0; n < 20000; n++) {
    advanceTrip(city, city[key], runtime, 1 / 60);
    if (done()) return;
  }
  assert.fail('Journey did not finish: ' + JSON.stringify([city[key], runtime.issue]));
}

test('an accompanied park outing keeps one real trip through blockage, reload and return home', () => {
  const { city, trip, profile } = fixture();
  assert.equal(profile.family, true);
  assert.equal(profile.childName, 'Mpho');
  assert.equal(householdsFor(city).filter((p) => city[p.key]).length, 1);
  assert.equal(city.members.length, 1);
  const runtime = tripRuntime();
  walkUntil(city, profile.key, runtime, () => !!runtime.issue);
  assert.match(runtime.issue, /street/i);
  const stopped = structuredClone(trip);
  advanceTrip(city, trip, runtime, 1 / 60);
  assert.deepEqual(trip, stopped);
  const restored = reopen(city);
  assert.deepEqual(restored[profile.key], stopped);
  assert.deepEqual(restored.members, city.members);
  const plan = planStreets(restored, restored[profile.key]);
  restored.streets = [...restored.streets, ...plan.missing];
  const freshRuntime = tripRuntime();
  walkUntil(restored, profile.key, freshRuntime, () => restored[profile.key].phase === 'shopping');
  assert.equal(restored[profile.key].returning, false);
  const seated = reopen(restored);
  assert.equal(seated.members[0].childName, 'Mpho');
  setRoutine(seated[profile.key], 14);
  walkUntil(seated, profile.key, tripRuntime(), () => seated[profile.key].phase === 'done');
  assert.equal(seated[profile.key].returning, true);
  assert.equal(seated[profile.key].routine.visits, 1, 'companions do not double-count visits');
  assert.equal(seated.members.length, 1);
});

test('family metadata is park-only and old adult saves retain their exact member records', () => {
  const old = fixture({});
  assert.equal(old.profile.family, undefined);
  assert.equal(old.profile.childName, undefined);
  assert.deepEqual(reopen(old.city).members, [{ key: 'family1', name: 'Thandi', visit: 'park' }]);
  const city = world('city');
  const home = city.pieces.find(isEntrance);
  const shop = { ...home, id: 'test-shop', x: home.x + 24 };
  city.pieces = [...city.pieces, shop];
  const p = moveIn(city, 'Ayanda', 'spaza', newTrip(home, shop), undefined, {
    family: true, childName: 'Should not appear'
  });
  assert.equal(p.family, undefined);
  assert.equal(p.childName, undefined);
  assert.deepEqual(reopen(city).members, [{ key: 'family1', name: 'Ayanda', visit: 'spaza' }]);
});

test('malformed companion data stays bounded and never adds independent household entries', () => {
  for (const invalid of [null, {}, [], 42, 'x'.repeat(500)]) {
    const { city } = fixture({ family: true, childName: invalid });
    const restored = reopen(city);
    const member = restored.members[0];
    assert.equal(member.family, true);
    assert.equal(typeof member.childName, 'string');
    assert.ok(member.childName.trim().length > 0 && member.childName.length <= 28);
    assert.equal(restored.members.length, 1);
  }
  const { city } = fixture({ family: 'true', childName: 'Mpho' });
  assert.equal(reopen(city).members[0].family, undefined, 'only a boolean opts into the companion');
});

test('six family slots stay six trips and neither adult park visitors nor children become shoppers', () => {
  const { city, home, bench } = fixture();
  for (let i = 1; i < MOVE_IN_SLOTS.length; i++) {
    const nextHome = { ...home, id: 'family-home-' + i, x: BLOCKS[i].x, z: BLOCKS[i].z };
    city.pieces = [...city.pieces, nextHome];
    assert.ok(moveIn(city, 'Adult ' + i, 'park', newTrip(nextHome, bench, city), undefined, {
      family: true, childName: 'Child ' + i
    }));
  }
  assert.equal(city.members.length, 6);
  assert.equal(householdsFor(city).length, 8);
  assert.equal(moveIn(city, 'Overflow', 'park', { ...city.family1, home: 'overflow' }, undefined, {
    family: true, childName: 'Extra'
  }), null);
  assert.ok(openMarket(city, home.id));
  for (const key of MOVE_IN_SLOTS) city[key].phase = 'done';
  assert.equal(callShoppers(city), 0);
  assert.deepEqual(shoppers(city), []);
  assert.deepEqual(city.market.receipts, []);
  assert.equal(reopen(city).members.filter((m) => m.family).length, 6);
  endHousehold(city, 'family1');
  assert.equal(city.family1, undefined);
  assert.equal(city.members.length, 5, 'moving out removes the single accompanied household');
});

test('journey summaries distinguish purpose, stopped routes, pause, homeward journeys and completion', () => {
  const { city, profile, trip } = fixture();
  const runtime = tripRuntime();
  const summary = () => journeySummary(city, profile, trip, runtime);
  assert.match(summary(), /family park visit/i);
  assert.match(summary(), /Mpho/);
  assert.match(summary(), /park|bench/i);
  runtime.issue = 'Missing south street at E4. Add it on the map.';
  assert.ok(summary().includes(runtime.issue));
  runtime.issue = '';
  trip.paused = true;
  assert.match(summary(), /paused/i);
  trip.paused = false;
  trip.returning = true;
  assert.match(summary(), /home/i);
  trip.phase = 'done';
  assert.match(summary(), /home|complete/i);
  assert.equal(typeof journeySummary(city, profile, null, runtime), 'string');
  assert.match(journeySummary(city, { name: 'Lebo', destination: 'Spaza' }, trip, runtime), /adult resident/i);
});


const pathPoint = (x, z = 0) => ({ x, y: 0, z, heading: 0 });
test('companion trail stays bounded and uses actual traversed corner points, never a diagonal shortcut', () => {
  const trip = { ...pathPoint(0), park: true };
  const traversed = new Set();
  const outputs = [];
  for (let i = 0; i <= 300; i++) {
    const point = i <= 150 ? pathPoint(i / 100, 0) : pathPoint(1.5, (i - 150) / 100);
    traversed.add(JSON.stringify(point));
    Object.assign(trip, point);
    const behind = updateCompanionPath(trip);
    assert.ok(trip.companionPath.length <= 48);
    if (behind) {
      assert.ok(traversed.has(JSON.stringify(behind)), 'companion reuses a real adult position');
      assert.ok(behind.z === 0 || behind.x === 1.5, 'right-angle path does not cut across the corner');
      assert.ok(Math.hypot(trip.x - behind.x, trip.z - behind.z) < 0.75);
      outputs.push(behind);
    }
  }
  assert.ok(outputs.some((p) => p.x === 1.5 && p.z > 0));
  assert.equal(trip.companionPath.at(-1).x, trip.x);
});

test('paused trail placement remains stable across rendering, reload and repeated hide/show resets', () => {
  const { city, trip } = fixture();
  for (let i = 0; i < 60; i++) {
    trip.x += 0.025;
    updateCompanionPath(trip);
  }
  trip.paused = true;
  const before = structuredClone(trip.companionPath);
  const expected = { ...updateCompanionPath(trip) };
  assert.ok(expected.x !== undefined);
  const renderer = companionTrail();
  for (let n = 0; n < 20; n++) {
    renderer.reset();
    assert.equal(renderer.follow(null), null);
    assert.deepEqual(renderer.follow(trip), expected);
  }
  assert.deepEqual(trip.companionPath, before);
  const restored = reopen(city);
  assert.deepEqual(restored.family1.companionPath, before);
  assert.deepEqual(companionTrail().follow(restored.family1), expected);
  assert.equal(restored.family1.paused, true);
});

test('malformed companion saves are ignored without losing a valid resident trip', () => {
  const { trip } = fixture();
  const here = { x: trip.x, y: trip.y, z: trip.z, heading: trip.heading };
  for (const invalid of [
    'not an array',
    [null],
    [{ ...here, x: NaN }],
    [{ ...here, y: Infinity }],
    [{ ...here, x: 10000 }],
    [{ ...here, z: -10000 }],
    [{ ...here, y: 201 }],
    Array.from({ length: 49 }, () => ({ ...here }))
  ]) {
    const restored = restoreTrip({ ...trip, companionPath: invalid });
    assert.equal(restored.home, trip.home);
    assert.equal(restored.companionPath, undefined);
  }
  assert.equal(restoreTrip({ ...trip, park: false, companionPath: [here] }).companionPath, undefined);
  const copied = restoreTrip({ ...trip, companionPath: [{ ...here, injected: 'discard' }] });
  assert.deepEqual(copied.companionPath, [here]);
});

test('a discontinuous saved trail cannot strand a child away from the accompanying adult', () => {
  const { trip } = fixture();
  const here = { x: trip.x, y: trip.y, z: trip.z, heading: trip.heading };
  const restored = restoreTrip({ ...trip, companionPath: [{ ...here, x: here.x - 40 }, here] });
  assert.ok(!restored.companionPath || updateCompanionPath(restored) === null,
    'untrusted disconnected history must not render a distant companion');
  trip.companionPath = [here];
  trip.x += 20;
  assert.equal(updateCompanionPath(trip), null, 'discontinuous live move restarts trail inside the home');
  assert.equal(trip.companionPath.length, 1);
});


test('trail validation rejects excessive path length, distant endpoints and vertical jumps', () => {
  const here = pathPoint(0);
  assert.equal(restoreCompanionPath([], here), null);
  assert.equal(restoreCompanionPath([pathPoint(-3)], here), null);
  assert.equal(restoreCompanionPath([pathPoint(-1.8), pathPoint(-0.9), pathPoint(0), pathPoint(-0.9)], pathPoint(-0.9)), null);
  assert.equal(restoreCompanionPath([{ ...here, y: 2 }, here], here), null);
  assert.equal(restoreCompanionPath([{ ...here, heading: 1e9 }], here), null);
  const points = Array.from({ length: 48 }, (_, i) => pathPoint(-0.94 + i * 0.02));
  const clean = restoreCompanionPath(points, here);
  assert.deepEqual(clean, points);
  assert.notEqual(clean, points, 'restoration returns an independent bounded trail');
  assert.notEqual(clean[0], points[0]);
});
