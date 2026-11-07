import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceVehicle,
  bodyLoad,
  buildProblem,
  fitsChassis,
  canMount,
  mountHeight,
  drivingSeat,
  GATES,
  TYRES,
  newRun
} from '../public/games/brick-playground-3d/vehicle.mjs';
import { loadWorld, saveKey, world } from '../public/games/brick-playground-3d/model.mjs';
const brick = (type, x, z, y = 0, r = 0) => ({
  type,
  x,
  z,
  y,
  r,
  color: 'Sky',
  id: type + x + z + y
});

test('the unwheeled body mounts on the chassis and every layer must connect to it', () => {
  const base = brick('square', -2, -2),
    upper = brick('pair', -2, -2, 1);
  assert.ok(buildProblem([]));
  assert.equal(buildProblem([upper, base]), '');
  assert.ok(buildProblem([upper]));
  assert.ok(buildProblem([base, { ...upper, x: 0 }]));
  const seat = brick('seat', 0, 0);
  assert.ok(
    buildProblem([seat, brick('single', 0, 1, 1)]),
    'empty space above the seat is not support'
  );
  assert.equal(buildProblem([seat, brick('single', 0, 0, 1)]), '');
  assert.equal(buildProblem([brick('cab', -1, -1), brick('cargo', -1, -1, 2)]), '');
  assert.equal(fitsChassis(brick('beam', 1, -2, 0, 1)), true);
  assert.equal(fitsChassis(brick('pillar', 0, 0, 3)), false);
});
test('heavier builds gain speed more slowly, tyres have distinct handling and brakes stop a run', () => {
  const light = newRun(bodyLoad([brick('single', 0, 0)]));
  const heavy = newRun(bodyLoad([brick('floor', -2, -2), brick('block', -2, -2, 1 / 3)]));
  for (let i = 0; i < 12; i++) {
    advanceVehicle(light, 'road', 1, 0, false, 1 / 60);
    advanceVehicle(heavy, 'road', 1, 0, false, 1 / 60);
  }
  assert.ok(heavy.speed < light.speed);
  const tight = { ...light },
    fast = { ...light };
  advanceVehicle(tight, 'grip', 1, 1, false, 0.016);
  advanceVehicle(fast, 'sprint', 1, 1, false, 0.016);
  assert.ok(tight.yaw > fast.yaw);
  for (let i = 0; i < 100; i++) advanceVehicle(light, 'road', 1, 0, true, 1 / 60);
  assert.equal(light.speed, 0);
});
test('all three tyre sets can drive a complete ordered lap with a built body', () => {
  for (const kit of Object.keys(TYRES)) {
    const v = newRun(8);
    for (let i = 0; i < 1500 && v.gate < 3; i++) {
      const g = GATES[v.gate],
        aim = Math.atan2(g.x + 0.7 * g.nx - v.x, g.z + 0.7 * g.nz - v.z) - v.yaw;
      const steer = Math.max(-1, Math.min(1, 1.4 * Math.atan2(Math.sin(aim), Math.cos(aim))));
      advanceVehicle(v, kit, 0.7, steer, false, 1 / 60);
    }
    assert.equal(v.gate, 3, kit);
    assert.equal(v.speed, 0);
    assert.ok(v.distance > 20);
  }
});
test('missing a post, crossing in reverse direction or skipping the active gate does not count', () => {
  for (const [x, z, yaw] of [
    [-1.8, 2.49, 0],
    [-5, 2.51, Math.PI],
    [5, -2.49, Math.PI]
  ]) {
    const v = { ...newRun(), x, z, yaw, speed: 3 };
    advanceVehicle(v, 'road', 1, 0, false, 1 / 60);
    assert.equal(v.gate, 0);
  }
  const v = { ...newRun(), z: 7.99, speed: 3 };
  advanceVehicle(v, 'road', 1, 0, false, 1 / 60);
  assert.equal(v.z, 7.99);
  assert.equal(v.speed, 0);
  advanceVehicle(v, 'road', -1, 0, false, 1 / 60);
  assert.ok(v.z < 7.99);
});
test('vehicle geometry, tyres and completed lap are stored independently from existing worlds', () => {
  const garage = {
    ...world('garage'),
    name: 'Sunbird',
    tyres: 'grip',
    pieces: [brick('beam', 1, -2, 0, 1)],
    complete: true
  };
  const saves = new Map(['free', 'bridge'].map((k) => [saveKey(k), JSON.stringify(world(k))]));
  saves.set(saveKey('garage'), JSON.stringify(garage));
  const storage = { getItem: (k) => saves.get(k) };
  assert.deepEqual(loadWorld('garage', storage), garage);
  assert.deepEqual(loadWorld('free', storage), world('free'));
  assert.deepEqual(loadWorld('bridge', storage), world('bridge'));
});

test('a recessed seat fits inside an open cab, with headroom and independent chassis support', () => {
  const cab = brick('cab', -1, -1),
    seat = brick('seat', -1, -1);
  assert.equal(mountHeight(seat, [cab]), 0);
  assert.ok(canMount(seat, [cab]));
  assert.equal(mountHeight(cab, [seat]), 0);
  assert.ok(canMount(cab, [seat]));
  assert.equal(drivingSeat([cab, seat]), seat);
  assert.equal(canMount({ ...seat, x: -2 }, [cab]), true); // adjacent seat is also legal
  assert.equal(canMount({ ...seat, z: 0 }, [cab]), false); // partial overlap hits the cab footprint
  assert.equal(drivingSeat([seat, brick('square', -1, -1, 1)]), undefined);
});
