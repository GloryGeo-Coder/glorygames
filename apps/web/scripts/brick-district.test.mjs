import test from 'node:test';
import assert from 'node:assert/strict';
import { LOTS, checkpoint, atStop } from '../public/games/brick-playground-3d/district.mjs';
import {
  avatar,
  advanceAvatar,
  validPiece,
  world,
  loadWorld,
  saveKey
} from '../public/games/brick-playground-3d/model.mjs';

const piece = (x, type = 'step') => ({
  id: 'approach-' + x,
  x: x - 1,
  z: -3,
  y: 0,
  r: 1,
  type,
  color: 'Sun'
});
const walk = (player, pieces, x, z, n) => {
  for (let i = 0; i < n; i++) advanceAvatar(player, 'district', pieces, x, z, false, 1 / 60);
};
test('Three plots admit complete footprints and leave space for the street and fixed counters', () => {
  for (const l of LOTS) assert.ok(validPiece(piece(l.x), [], null, 'district'));
  for (const [x, z] of [
    [-9, 0],
    [5, -5],
    [0, 0],
    [0, 4],
    [0, -8]
  ]) {
    assert.equal(validPiece({ ...piece(0), x, z }, [], null, 'district'), false);
  }
  assert.equal(validPiece(piece(16), []), false);
});
test('A crate can reach every stop by walking on built approaches; a bare deck blocks it', () => {
  const data = world('district');
  for (const [i, l] of LOTS.entries()) {
    const a = { ...avatar('district'), x: l.x + 0.5, z: -5 };
    if (i) {
      walk(a, data.pieces, 0, 1, 118);
      assert.ok(a.z < 0 && !atStop(i + 1, a), 'bare edge blocks carrier');
      Object.assign(a, { x: l.x + 0.5, z: -5, y: 0 });
      data.pieces.push(piece(l.x, i === 1 ? 'step' : 'slope'));
    }
    walk(a, data.pieces, 0, 1, 100);
    assert.ok(atStop(i + 1, a), 'on deck at ' + l.name);
    assert.equal(atStop(((i + 1) % 3) + 1, a), false);
    assert.equal(atStop(i + 1, { ...a, grounded: false }), false);
  }
});
test('Route checkpoints, global coordinates and completion survive separate device saves', () => {
  const data = {
    ...world('district'),
    name: 'Market Street',
    stage: 3,
    pieces: [piece(-16), piece(16)]
  };
  const saves = new Map([[saveKey('district'), JSON.stringify(data)]]);
  const storage = { getItem: (k) => saves.get(k) };
  assert.deepEqual(loadWorld('district', storage), data);
  assert.ok(atStop(2, { ...checkpoint(data.stage), grounded: true }));
  for (const k of ['bridge', 'free', 'canal', 'garage'])
    assert.deepEqual(loadWorld(k, storage), world(k));
  Object.assign(data, { complete: true, stage: 4 });
  saves.set(saveKey('district'), JSON.stringify(data));
  assert.deepEqual(loadWorld('district', storage), data);
});
