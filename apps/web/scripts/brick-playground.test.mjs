import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TYPES,
  world,
  validPiece,
  intervals,
  snapHeight,
  advanceAvatar,
  avatar,
  buggy,
  advanceBuggy,
  loadWorld,
  saveKey
} from '../public/games/brick-playground-3d/model.mjs';
const piece = (type, x, z, r = 0, y = 0) => ({
  id: type + x + ',' + z,
  type,
  color: 'Lagoon',
  x,
  z,
  r,
  y
});
test('21 reusable shapes, rotated footprints, stacking, collisions and plot boundaries', () => {
  assert.equal(Object.values(TYPES).filter(t=>!t.garageOnly).length,21);
  assert.ok(avatar('bridge').x < -3, 'the builder starts on the bank');
  const wall = piece('wall', 0, 0, 1),
    plate = piece('floor', 0, 0);
  assert.equal(validPiece(plate, [wall]), false);
  plate.y = snapHeight(plate, [wall]);
  assert.equal(plate.y, 3);
  assert.ok(validPiece(plate, [wall]));
  assert.equal(validPiece(piece('wall', 9, 0), []), false);
  assert.ok(validPiece({ ...wall, z: 1 }, [wall], wall.id));
});
test('open frames, rotated ramps, walkable stair treads and blocking walls', () => {
  const door = piece('door', -1, -3),
    ramp = piece('slope', 0, 0, 1);
  assert.ok(intervals(door, 0.5, -2.5).every(([bottom]) => bottom > 1.65));
  assert.ok(intervals(door, -0.9, -2.5).some(([bottom]) => bottom === 0));
  assert.equal(intervals(ramp, 1, 1.5)[0][1], 0.5);
  const a = { ...avatar(), x: -0.6, z: 0.5 },
    steps = piece('step', 0, 0),
    wall = piece('wall', 3, 0, 1);
  for (let i = 0; i < 100; i++) advanceAvatar(a, 'free', [steps, wall], 1, 0, false, 1 / 60);
  assert.ok(a.x < 2.75 && a.x > 2.6);
  assert.equal(a.y, 1);
  const roof = piece('floor', 0, 0, 0, 2.2),
    b = { ...avatar(), x: 1, z: 1 };
  for (let i = 0; i < 100; i++) {
    advanceAvatar(b, 'free', [roof], 0, 0, i === 0, 1 / 60);
    assert.ok(b.y + 1.65 <= 2.201);
  }
  assert.equal(b.y, 0);
});
test('four wheel tracks distinguish gaps, high steps, low decks and overhead arches', () => {
  function drive(items) {
    const b = buggy();
    b.state = 'running';
    for (let i = 0; i < 2000 && b.state === 'running'; i++) advanceBuggy(b, items, 1 / 120);
    return b;
  }
  assert.equal(drive([piece('deck', -3, -1)]).state, 'fell');
  assert.equal(drive([piece('span', -3, -1), piece('wall', -2, -1, 0, 1 / 3)]).state, 'stopped');
  assert.equal(drive([piece('span', -3, -1)]).state, 'won');
  assert.equal(drive([piece('deck', -3, -1), piece('deck', 0, -1)]).state, 'won');
  assert.equal(drive([piece('span', -3, 0)]).state, 'fell');
  assert.equal(drive([piece('span', -3, -1), piece('arch', 0, -2, 1, 1 / 3)]).state, 'won');
});
test('storage round-trips both slots, shape, position, colour, rotation and delivery completion', () => {
  const cache = new Map(),
    storage = { getItem: (key) => cache.get(key) };
  for (const kind of ['free', 'bridge']) {
    const w = world(kind);
    w.name = kind + ' plot';
    w.pieces = [piece('door', 1, -2, 3, 1 / 3)];
    w.complete = kind === 'bridge';
    cache.set(saveKey(kind), JSON.stringify(w));
    assert.deepEqual(loadWorld(kind, storage), w);
  }
  cache.set(saveKey('free'), '{}');
  assert.throws(() => loadWorld('free', storage));
  assert.equal(loadWorld('bridge', storage).complete, true);
});
