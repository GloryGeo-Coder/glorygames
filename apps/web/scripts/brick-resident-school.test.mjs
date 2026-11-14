import test from 'node:test';
import assert from 'node:assert/strict';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import { citySave, householdsFor, moveIn, LESSON_SECONDS } from '../public/games/brick-playground-3d/settlement.mjs';
import { newTrip, isSchoolEntrance, tripRuntime, entrance } from '../public/games/brick-playground-3d/resident-trip.mjs';
import { stepHousehold, openMarket } from '../public/games/brick-playground-3d/market-day.mjs';
import { updateCompanionPath } from '../public/games/brick-playground-3d/citizen-appearance.mjs';
import { setRoutine, skipToDeparture } from '../public/games/brick-playground-3d/resident-routines.mjs';
import { CITY_PLANS } from '../public/games/brick-playground-3d/city-plans.mjs';
import { placement } from '../public/games/brick-playground-3d/blueprint.mjs';

function fixture() {
  const city = world('city');
  const room = CITY_PLANS.find(p => p.name === 'Neighbourhood classroom');
  const bricks = placement(room, { x: 10, z: 4 }, 0, false, [], 'city').pieces
    .map((p, i) => ({ ...p, id: 'school-' + i }));
  const door = bricks.find(p => p.type === 'door');
  const home = { id: 'home', type: 'door', color: 'Sky', x: -13, y: 0, z: 4, r: 0 };
  city.pieces = [home, ...bricks];
  city.blocks[28] = { name: 'Khula Primary', zone: 'school' };
  city.streets = ['h-3-4', 'h-4-4'];
  assert.ok(isSchoolEntrance(city, door));
  const trip = newTrip(home, door, city);
  trip.school = { lessons: 0 };
  moveIn(city, 'Thandi', 'school', trip, undefined, { childName: 'Neo' });
  return { city, home, door };
}
function runner(city) {
  const profile = householdsFor(city).find(p => p.visit === 'school');
  const trip = city[profile.key], rt = tripRuntime();
  function step() {
    const before = { x: trip.x, z: trip.z };
    stepHousehold(city, profile, trip, rt, 1 / 60);
    updateCompanionPath(trip);
    assert.ok(Math.hypot(trip.x - before.x, trip.z - before.z) < .1);
  }
  function until(check) {
    for (let i = 0; i < 14000 && !check(); i++) step();
    assert.ok(check(), rt.issue || trip.phase);
  }
  return { trip, rt, step, until };
}
function reopen(city) {
  return loadWorld('city', { getItem: k => k === saveKey('city') ? citySave(city) : null });
}
test('a learner attends the furnished classroom, resumes the lesson and returns with the adult', () => {
  const { city, home, door } = fixture();
  const run = runner(city);
  setRoutine(run.trip, 8);
  run.trip.phase = 'done';
  assert.ok(skipToDeparture(city));
  run.until(() => run.trip.phase === 'shopping');
  assert.ok(Math.hypot(run.trip.x - entrance(door).inside.x, run.trip.z - entrance(door).inside.z) < .02);
  for (let i = 0; i < 60; i++) run.step();
  assert.ok(run.trip.wait > 1.5 && run.trip.wait < LESSON_SECONDS);
  run.trip.paused = true;
  const restored = reopen(city), resumed = runner(restored);
  assert.deepEqual(resumed.trip, run.trip);
  resumed.step();
  assert.equal(resumed.trip.wait, run.trip.wait);
  assert.equal(resumed.trip.school.lessons, 0);
  resumed.trip.paused = false;
  resumed.until(() => resumed.trip.phase === 'done');
  assert.equal(resumed.trip.school.lessons, 1);
  assert.equal(resumed.trip.routine.visits, 1);
  assert.ok(Math.hypot(resumed.trip.x - entrance(home).inside.x, resumed.trip.z - entrance(home).inside.z) < .02);
  assert.ok(skipToDeparture(restored));
  resumed.until(() => resumed.trip.phase === 'done');
  assert.equal(resumed.trip.school.lessons, 2);
});
test('changing school land use during class freezes attendance until the player restores it', () => {
  const { city, door } = fixture();
  const run = runner(city);
  run.until(() => run.trip.phase === 'shopping');
  const saved = city.blocks[28];
  city.blocks = { ...city.blocks, 28: { ...saved, zone: 'homes' } };
  run.step();
  assert.match(run.rt.issue, /School land use/);
  assert.equal(isSchoolEntrance(city, door), false);
  assert.equal(run.trip.wait, LESSON_SECONDS);
  assert.equal(run.trip.school.lessons, 0);
  city.blocks = { ...city.blocks, 28: saved };
  assert.equal(openMarket(city, door.id), false);
  run.until(() => run.trip.phase === 'done');
  assert.equal(run.trip.school.lessons, 1);
});
