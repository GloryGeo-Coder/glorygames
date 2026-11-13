import test from 'node:test';
import assert from 'node:assert/strict';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import { citySave, moveIn, householdsFor } from '../public/games/brick-playground-3d/settlement.mjs';
import { newTrip, tripRuntime, entrance } from '../public/games/brick-playground-3d/resident-trip.mjs';
import { queuePosition, queueCanEnter } from '../public/games/brick-playground-3d/entrance-queue.mjs';
import { pedestrianPath, pavementCurb, PAVEMENT_OFFSET } from '../public/games/brick-playground-3d/pedestrian-route.mjs';
import { openMarket, marketCounter, stepHousehold, waitingAtTill, nextCustomer, serveCustomer } from '../public/games/brick-playground-3d/market-day.mjs';

function fixture() {
  const city = world('city');
  const [home, shop, home2] = [-13, 11, 35].map((x, i) => ({
    id: 'queue-door-' + i, type: 'door', color: 'Lagoon', x, y: 0, z: 4, r: 0
  }));
  city.pieces = [home, shop, home2];
  city.streets = ['h-3-4', 'h-4-4', 'h-5-4'];
  city.resident = newTrip(home, shop);
  moveIn(city, 'Ayanda', 'spaza', newTrip(home2, shop));
  openMarket(city, shop.id);
  return { city, home, home2, shop };
}
const reopen = (city) => loadWorld('city', {
  getItem: (key) => key === saveKey('city') ? citySave(city) : null
});
function simulation(city) {
  const runtimes = new Map();
  let maximumStep = 0;
  return {
    runtimes,
    get maximumStep() { return maximumStep; },
    tick(n = 1) {
      for (let i = 0; i < n; i++) {
        for (const profile of householdsFor(city)) {
          const trip = city[profile.key];
          if (!trip) continue;
          if (!runtimes.has(profile.key)) runtimes.set(profile.key, tripRuntime());
          const old = { x: trip.x, z: trip.z };
          stepHousehold(city, profile, trip, runtimes.get(profile.key), 1 / 60);
          maximumStep = Math.max(maximumStep, Math.hypot(trip.x - old.x, trip.z - old.z));
        }
      }
    }
  };
}

test('two real shoppers wait at distinct positions and only one can occupy the till', () => {
  const { city, shop } = fixture();
  const sim = simulation(city);
  sim.tick(14000);
  const visitors = householdsFor(city).filter((p) => city[p.key]);
  const atTill = visitors.filter((p) => waitingAtTill(city, p, city[p.key]));
  assert.equal(atTill.length, 1, 'one physical service position, not overlapping shoppers');
  assert.ok(Math.hypot(city.resident.x - city.family1.x, city.resident.z - city.family1.z) >= 0.65,
    'waiting positions keep citizens apart');
  const queued = visitors.find((p) => p !== atTill[0]);
  const front = entrance(shop);
  assert.ok(Math.hypot(city[queued.key].x - front.center.x, city[queued.key].z - front.center.z) >= 0.65,
    'waiting shopper stands clear of the doorway');
  assert.ok(sim.maximumStep < 0.1, 'all arrival and queue movement is continuous');
  assert.equal(city.market.receipts.length, 0, 'arrival alone never records a purchase');
});

test('queue order and positions survive pause and reload, then advance after real service', () => {
  const { city } = fixture();
  simulation(city).tick(14000);
  const first = nextCustomer(city);
  assert.ok(first);
  const expected = structuredClone([city.resident, city.family1]);
  city.resident.paused = city.family1.paused = true;
  simulation(city).tick(300);
  assert.deepEqual([city.resident, city.family1].map((t) => ({ ...t, paused: false })), expected);
  city.resident.paused = city.family1.paused = false;
  const restored = reopen(city);
  assert.equal(nextCustomer(restored)?.key, first.key);
  assert.deepEqual([restored.resident, restored.family1], expected);
  const pos = { ...marketCounter(restored).inside, y: 0 };
  assert.equal(serveCustomer(restored, pos, true)?.key, first.key);
  assert.equal(serveCustomer(restored, pos, true), null, 'next customer must physically walk to the till');
  const sim = simulation(restored);
  sim.tick(14000);
  const second = nextCustomer(restored);
  assert.ok(second && second.key !== first.key);
  assert.equal(serveCustomer(restored, pos, true)?.key, second.key);
  assert.equal(serveCustomer(restored, pos, true), null);
  sim.tick(14000);
  assert.equal(restored.resident.phase, 'done');
  assert.equal(restored.family1.phase, 'done');
  assert.equal(restored.market.receipts.length, 2);
  assert.ok(sim.maximumStep < 0.1);
});

test('a saved queued visitor stays outside the doorway until the occupied till is vacated', () => {
  const { city } = fixture();
  const sim = simulation(city);
  sim.tick(14000);
  const profiles = householdsFor(city).filter((p) => city[p.key]);
  const queued = profiles.find((p) => city[p.key].phase === 'queue');
  assert.ok(queued, 'a real queued phase is used, not overlapping shopping actors');
  const restored = reopen(city);
  assert.equal(restored[queued.key].phase, 'queue');
  const before = { ...restored[queued.key] };
  const restoredSim = simulation(restored);
  restoredSim.tick(300);
  assert.deepEqual(restored[queued.key], before, 'occupied service position keeps queue stable');
  const first = nextCustomer(restored);
  const where = { ...marketCounter(restored).inside, y: 0 };
  serveCustomer(restored, where, true);
  restoredSim.tick(1);
  assert.equal(restored[queued.key].phase, 'queue', 'receipt alone does not clear the actual occupant');
  assert.notEqual(restored[first.key].phase, 'done');
});

test('breaking an entrance street stops arrivals without teleporting and repair resumes the queue', () => {
  const { city, shop } = fixture();
  const streets = city.streets;
  city.streets = streets.filter((s) => s !== entrance(shop).street);
  const sim = simulation(city);
  sim.tick(8000);
  assert.equal(nextCustomer(city), undefined);
  assert.ok([...sim.runtimes.values()].some((r) => /street|connect/i.test(r.issue)));
  assert.equal(city.market.receipts.length, 0);
  const stopped = [city.resident, city.family1].map((t) => ({ x: t.x, z: t.z }));
  sim.tick(300);
  assert.deepEqual([city.resident, city.family1].map((t) => ({ x: t.x, z: t.z })), stopped);
  city.streets = streets;
  sim.tick(14000);
  assert.ok(nextCustomer(city));
  assert.equal(householdsFor(city).filter((p) => waitingAtTill(city, p, city[p.key])).length, 1);
  assert.ok(sim.maximumStep < 0.1);
});


function assertOrthogonal(start, path) {
  assert.ok(Array.isArray(path) && path.length > 0);
  let prev = start;
  for (const point of path) {
    assert.ok(Number.isFinite(point.x) && Number.isFinite(point.z));
    assert.ok(Math.abs(point.x) <= 96 && Math.abs(point.z) <= 96);
    assert.ok(Math.abs(point.x - prev.x) < 1e-6 || Math.abs(point.z - prev.z) < 1e-6,
      'pedestrians must not cut a diagonal through the corner');
    prev = point;
  }
}
test('pedestrian routes use pavement strips and mark a crossing when changing road sides', () => {
  assert.equal(PAVEMENT_OFFSET, 1.5);
  const streets = ['h-3-4', 'h-4-4'];
  const start = { x: -12, z: 1.5 }, end = { x: 12, z: -1.5 };
  const path = pedestrianPath(streets, start, end);
  assertOrthogonal(start, path);
  assert.equal(path.at(-1).x, end.x);
  assert.equal(path.at(-1).z, end.z);
  assert.ok(path.some((p) => p.crossing), 'changing road sides uses a designated crossing');
  let previous = start;
  for (const p of path) {
    if (Math.abs(p.z - previous.z) < 1e-6) {
      assert.equal(Math.abs(p.z), 1.5, 'longitudinal travel stays on pavement, not road centre');
    }
    previous = p;
  }
});
test('right-angle routes remain orthogonal and disconnected streets cannot be crossed magically', () => {
  const start = { x: -12, z: 1.5 }, end = { x: -1.5, z: 12 };
  const path = pedestrianPath(['h-3-4', 'v-4-3'], start, end);
  assertOrthogonal(start, path);
  assert.equal(path.at(-1).x, end.x);
  assert.equal(path.at(-1).z, end.z);
  assert.equal(pedestrianPath(['h-3-4', 'h-5-4'], start, { x: 36, z: 1.5 }), null);
});
test('entrance pavements face their building and legacy centre-road saves gain a continuous connector', () => {
  const { home, shop } = fixture();
  for (const door of [home, shop]) {
    const front = entrance(door), curb = pavementCurb(front);
    assert.ok(Math.hypot(curb.x - front.curb.x, curb.z - front.curb.z) <= PAVEMENT_OFFSET + 1e-6);
    assert.equal(curb.z, 1.5, 'south-facing building stands north of its street');
  }
  const start = { x: -12, z: 0 }, end = { x: 12, z: 1.5 };
  const path = pedestrianPath(['h-3-4', 'h-4-4'], start, end);
  assertOrthogonal(start, path);
  assert.ok(Math.hypot(path[0].x - start.x, path[0].z - start.z) <= 1.5 + 1e-6);
  assert.equal(path.at(-1).x, end.x);
  assert.equal(path.at(-1).z, end.z);
});


test('queue admission uses physically ready roster order and skips paused waiting residents only', () => {
  const { city, shop } = fixture(), front = entrance(shop);
  for (const t of [city.resident, city.family1]) Object.assign(t, queuePosition(city, t, front), { phase: 'queue' });
  assert.equal(queueCanEnter(city, city.resident, front), true);
  assert.equal(queueCanEnter(city, city.family1, front), false);
  city.resident.paused = true;
  assert.equal(queueCanEnter(city, city.family1, front), true, 'paused outside does not reserve admission');
  city.resident.phase = 'shopping';
  assert.equal(queueCanEnter(city, city.family1, front), false, 'paused inside remains a real obstruction');
  city.resident.phase = 'queue';
  city.resident.paused = false;
  city.resident.x += 1;
  assert.equal(queueCanEnter(city, city.family1, front), true, 'earlier roster member must actually reach their slot');
});

test('a brick blocking a queue slot stops the visitor; removing it resumes without teleporting', () => {
  const { city, shop } = fixture(), front = entrance(shop);
  const pos = queuePosition(city, city.family1, front);
  const blocker = { id: 'queue-blocker', type: 'single', color: 'Plum', r: 0,
    x: Math.floor(pos.x), z: Math.floor(pos.z), y: 0 };
  city.pieces = [...city.pieces, blocker];
  const sim = simulation(city);
  sim.tick(14000);
  const rt = sim.runtimes.get('family1');
  assert.match(rt.issue, /blocked/i);
  assert.notEqual(nextCustomer(city)?.key, 'family1');
  const stopped = { x: city.family1.x, z: city.family1.z };
  sim.tick(300);
  assert.deepEqual({ x: city.family1.x, z: city.family1.z }, stopped);
  city.pieces = city.pieces.filter((p) => p.id !== blocker.id);
  const till = { ...marketCounter(city).inside, y: 0 };
  if (nextCustomer(city)) serveCustomer(city, till, true);
  sim.tick(14000);
  assert.equal(nextCustomer(city)?.key, 'family1');
  assert.ok(sim.maximumStep < 0.1);
});

test('queue slots remain distinct and inside the world beside an edge-block entrance', () => {
  const { city, home } = fixture();
  const shop = { id: 'edge-shop', type: 'door', color: 'Lagoon', x: 92, z: 80, y: 0, r: 0 };
  city.pieces = [...city.pieces, shop];
  city.resident = newTrip(home, shop);
  for (let i = 1; i < 6; i++) {
    const h = { ...home, id: 'edge-home-' + i, x: -84 + i * 24, z: 60 };
    city.pieces = [...city.pieces, h];
    moveIn(city, 'Queue ' + i, 'spaza', newTrip(h, shop));
  }
  city.family1.shop = shop.id;
  const front = entrance(shop);
  const points = householdsFor(city).filter((p) => city[p.key]).map((p) => queuePosition(city, city[p.key], front));
  for (const p of points) assert.ok(Math.abs(p.x) < 95.7 && Math.abs(p.z) < 95.7,
    'valid entrance must not allocate an unreachable queue position outside the world');
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    assert.ok(Math.hypot(points[i].x - points[j].x, points[i].z - points[j].z) >= 0.65);
  }
});
