import test from 'node:test';
import assert from 'node:assert/strict';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import { citySave, moveIn, householdsFor } from '../public/games/brick-playground-3d/settlement.mjs';
import { newTrip, tripRuntime, entrance, isMaintenanceEntrance, isServiceEntrance } from '../public/games/brick-playground-3d/resident-trip.mjs';
import { stepHousehold } from '../public/games/brick-playground-3d/market-day.mjs';
import { beginWorkShift, setWorkShift } from '../public/games/brick-playground-3d/work-shift.mjs';
import { skipToDeparture } from '../public/games/brick-playground-3d/resident-routines.mjs';
import { journeySummary } from '../public/games/brick-playground-3d/citizen-journey.mjs';

const reopen = city => loadWorld('city', { getItem: key => key === saveKey('city') ? citySave(city) : null });
function fixture() {
  const city = world('city');
  const [home, staff, visitor, secondHome] = [-13, 11, 16, 35].map((x, i) => ({ id: 'door-' + i, type: 'door', color: 'Sun', x, y: 0, z: 4, r: 0 }));
  city.pieces = [home, staff, visitor, secondHome];
  city.blocks[28] = { name: 'Ubuntu hall', zone: 'civic' };
  city.streets = ['h-3-4', 'h-4-4', 'h-5-4'];
  city.clockMinutes = 450;
  const worker = newTrip(home, staff, city);
  worker.maintenance = true;
  assert.ok(setWorkShift(worker, 8, 17));
  assert.ok(moveIn(city, 'Kea', 'maintenance', worker));
  return { city, home, staff, visitor, secondHome, worker };
}
function simulation(city) {
  const states = new Map();
  return {
    states,
    tick(n = 1) {
      for (let i = 0; i < n; i++) for (const p of householdsFor(city)) {
        if (!city[p.key]) continue;
        if (!states.has(p.key)) states.set(p.key, tripRuntime());
        stepHousehold(city, p, city[p.key], states.get(p.key), 1 / 60);
      }
    },
    until(expected) { for (let i = 0; i < 12000; i++) { if (expected()) return; this.tick(); } assert.ok(expected(), 'expected simulation state reached'); }
  };
}

test('specialist physically commutes and returns home, counting exactly one completed shift through reloads', () => {
  let { city, home, staff, worker } = fixture();
  assert.equal(worker.phase, 'done');
  assert.equal(worker.work.completed, 0);
  assert.ok(skipToDeparture(city));
  let sim = simulation(city);
  sim.until(() => worker.work.worked);
  const at = entrance(staff).inside;
  assert.ok(Math.hypot(at.x - worker.x, at.z - worker.z) < .025);
  assert.match(journeySummary(city, householdsFor(city).find(p => p.key === 'family1'), worker), /Civic maintenance worker.*On civic maintenance duty until 17:00/);
  worker.paused = true;
  city = reopen(city);
  worker = city.family1;
  assert.equal(worker.maintenance, true);
  assert.equal(worker.paused, true);
  assert.equal(worker.work.completed, 0);
  assert.equal(skipToDeparture(city), false);
  worker.paused = false;
  assert.ok(skipToDeparture(city));
  sim = simulation(city);
  sim.until(() => worker.returning);
  city = reopen(city);
  worker = city.family1;
  sim = simulation(city);
  sim.until(() => worker.phase === 'done');
  assert.equal(worker.work.completed, 1);
  assert.ok(Math.hypot(entrance(home).inside.x - worker.x, entrance(home).inside.z - worker.z) < .025);
  sim.tick(600);
  assert.equal(reopen(city).family1.work.completed, 1);
});

test('changing zoning on duty blocks skip and movement until repaired, including through reload', () => {
  let { city, worker } = fixture();
  assert.ok(skipToDeparture(city));
  let sim = simulation(city);
  sim.until(() => worker.work.worked);
  city.blocks = { ...city.blocks, 28: { name: 'Ubuntu hall', zone: 'homes' } };
  sim.tick();
  assert.match(sim.states.get('family1').issue, /Civic maintenance/);
  assert.equal(skipToDeparture(city), false);
  city = reopen(city);
  worker = city.family1;
  sim = simulation(city);
  sim.tick(100);
  assert.equal(worker.work.completed, 0);
  assert.match(sim.states.get('family1').issue, /Civic maintenance/);
  city.blocks = { ...city.blocks, 28: { name: 'Ubuntu hall', zone: 'civic' } };
  sim.tick();
  assert.equal(sim.states.get('family1').issue, '');
  assert.ok(skipToDeparture(city));
  sim.until(() => worker.phase === 'done');
  assert.equal(worker.work.completed, 1);
});

test('staff and visitor routes stay separate and work does not alter stock or service visits', () => {
  const { city, staff, visitor, secondHome, worker } = fixture();
  assert.equal(isServiceEntrance(city, staff), false);
  assert.equal(isMaintenanceEntrance(city, visitor), true);
  const guest = newTrip(secondHome, visitor, city);
  guest.service = { visits: 0 };
  assert.ok(moveIn(city, 'Visitor', 'service', guest));
  assert.equal(isMaintenanceEntrance(city, visitor), false);
  city.shopStock = [{ shop: 'some-shop', units: 4 }];
  // Departure can occur while an existing visitor also uses the same civic block.
  assert.ok(skipToDeparture(city) === false);
  beginWorkShift(worker, 480);
  city.clockMinutes = 480;
  worker.phase = 'leave';
  const sim = simulation(city);
  sim.until(() => worker.work.worked && guest.phase === 'done');
  assert.equal(guest.service.visits, 1);
  assert.equal(worker.work.completed, 0);
  assert.deepEqual(city.shopStock, [{ shop: 'some-shop', units: 4 }]);
  assert.equal(city.market, undefined);
});

test('old generic shifts and corrupt specialists cannot acquire maintenance privileges on load', () => {
  const { city } = fixture(), original = JSON.parse(citySave(city));
  original.members[0].visit = 'work';
  delete original.family1.maintenance;
  const load = raw => loadWorld('city', { getItem: () => JSON.stringify(raw) });
  const generic = load(original);
  assert.ok(generic.family1.work);
  assert.equal(generic.family1.maintenance, undefined);
  original.members[0].visit = 'maintenance';
  original.family1.maintenance = 'true';
  assert.equal(load(original).family1, undefined);
});

test('an inaccessible staff workplace cannot earn a shift after closing', () => {
  let { city, worker } = fixture();
  city.streets = [];
  assert.ok(skipToDeparture(city));
  let sim = simulation(city);
  sim.tick(600);
  assert.match(sim.states.get('family1').issue, /Missing.*street/);
  assert.equal(worker.work.worked, undefined);
  assert.equal(worker.work.completed, 0);
  city.clockMinutes = 1021;
  city = reopen(city);
  worker = city.family1;
  city.streets = ['h-3-4', 'h-4-4', 'h-5-4'];
  sim = simulation(city);
  sim.until(() => worker.phase === 'done');
  assert.equal(worker.work.completed, 0);
});

test('a maintenance doorway is not assigned as a visitor entrance or a different home', () => {
  const { city, staff, visitor, secondHome } = fixture();
  const visit = newTrip(secondHome, staff, city);
  assert.equal(moveIn(city, 'Hall visitor', 'hall', visit), null);
  const resident = newTrip(staff, visitor, city);
  assert.equal(moveIn(city, 'Other hall visitor', 'hall', resident), null);
  assert.equal(city.family2, undefined);
});
