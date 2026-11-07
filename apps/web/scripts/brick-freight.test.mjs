import test from 'node:test';
import assert from 'node:assert/strict';
import {
  starterBuggy,
  freightProblem,
  freightRun,
  roadObstacles,
  advanceFreight,
  canService,
  BAY_Z
} from '../public/games/brick-playground-3d/freight.mjs';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';

test('a dispatched vehicle needs a supported body, usable seat and overhead cargo clearance', () => {
  const parts = starterBuggy();
  assert.equal(freightProblem(parts), '');
  assert.match(freightProblem(parts.filter((p) => p.type !== 'seat')), /seat/i);
  assert.match(freightProblem(parts.filter((p) => p.type !== 'cargo')), /cargo bed/i);
  assert.match(
    freightProblem([...parts, { ...parts[2], id: 'lid', type: 'square', y: 1 }]),
    /room above/
  );
  assert.match(freightProblem(parts.map((p) => ({ ...p, y: 3 }))), /unsupported/);
});
test('motion, alignment, bay location and route order gate each handover', () => {
  const run = freightRun(starterBuggy(), 1);
  assert.ok(canService(run, 1));
  for (const change of [{ speed: 1 }, { x: 0 }, { z: BAY_Z + 0.8 }, { yaw: 0 }])
    assert.ok(!canService({ ...run, ...change }, 1));
  assert.ok(!canService(run, 2));
  for (const stop of [2, 3, 4]) assert.ok(canService(freightRun(starterBuggy(), stop), stop - 1));
});
test('a district wall stops the hauler; reversing backs it out and payload affects acceleration', () => {
  const parts = starterBuggy();
  const obstacles = roadObstacles(
    [{ id: 'wall', type: 'wall', r: 0, x: -18, z: -6, y: 0, color: 'Sun' }],
    parts
  );
  const run = { ...freightRun(parts, 1), yaw: 0 };
  const tick = (gas) => advanceFreight(run, 'road', gas, 0, false, 1 / 60, obstacles);
  for (let i = 0; i < 180; i++) tick(1);
  assert.ok(run.blocked && run.z + 2.08 <= -6 && run.speed === 0);
  const before = run.z;
  for (let i = 0; i < 30; i++) tick(-1);
  assert.ok(run.z < before && !run.blocked);
  const empty = freightRun(parts, 1),
    full = { ...empty, load: empty.load + 10 };
  for (const v of [full, empty])
    for (let i = 0; i < 30; i++) advanceFreight(v, 'road', 1, 0, false, 1 / 60, []);
  assert.ok(empty.speed > full.speed);
});
test('pre-freight districts and separately earned foot and road checkpoints reopen', () => {
  const district = world('district');
  const older = { ...district, stage: 2 };
  delete older.freightStop;
  delete older.freightComplete;
  const storage = {
    getItem: (key) => (key === saveKey('district') ? JSON.stringify(older) : null)
  };
  assert.deepEqual(loadWorld('district', storage), { ...district, stage: 2 });
  older.freightStop = 3;
  assert.equal(loadWorld('district', storage).stage, 2);
  assert.equal(loadWorld('district', storage).freightStop, 3);
  older.freightStop = 4;
  assert.ok(loadWorld('district', storage).freightComplete);
  assert.equal(loadWorld('district', storage).complete, false);
  assert.deepEqual(loadWorld('garage', storage), world('garage'));
});
