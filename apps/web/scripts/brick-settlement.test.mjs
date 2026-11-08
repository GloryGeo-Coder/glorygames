import test from 'node:test';
import assert from 'node:assert/strict';
import {
  world,
  validPiece,
  loadWorld,
  saveKey,
  avatar,
  advanceAvatar
} from '../public/games/brick-playground-3d/model.mjs';
import {
  BLOCKS,
  blockAt,
  blockIndex,
  citySave,
  layoutEdit,
  streetKeys,
  spawnAt
} from '../public/games/brick-playground-3d/settlement.mjs';
import { CITY_PLANS } from '../public/games/brick-playground-3d/city-plans.mjs';
import { placement, readPlan } from '../public/games/brick-playground-3d/blueprint.mjs';
test('all 64 city blocks independently accept each editable starter building and isolate the corridors', () => {
  for (const plan of CITY_PLANS) {
    const checked = readPlan(JSON.stringify(plan));
    assert.deepEqual(checked, plan);
    for (const b of BLOCKS) {
      assert.ok(placement(plan, { x: b.x - 10, z: b.z - 10 }, 1, false, [], 'city').ok);
      assert.ok(!placement(plan, { x: b.x + 9, z: b.z }, 0, false, [], 'city').ok);
    }
  }
  const city = world('city');
  city.pieces.forEach((p, i) => assert.ok(validPiece(p, city.pieces.slice(0, i), null, 'city')));
});
test('edits on opposite sides of the same street operate on one shared segment', () => {
  const city = world('city'),
    a = BLOCKS[0],
    b = BLOCKS[1];
  Object.assign(city, layoutEdit(city, a, 'Protea Heights', 'homes', ['east']));
  assert.ok(city.streets.includes(streetKeys(b).west));
  Object.assign(city, layoutEdit(city, b, 'Civic Square', 'civic', []));
  assert.ok(!city.streets.includes(streetKeys(a).east));
  assert.equal(city.blocks[0].name, 'Protea Heights');
});
test('large city round trips atomically, with real collisions on distant blocks and independent saves', () => {
  const city = world('city');
  city.pieces = BLOCKS.flatMap((b) =>
    Array.from({ length: 64 }, (_, i) => ({
      id: b.id + '-' + i,
      type: 'single',
      color: 'Coral',
      r: 0,
      x: b.x - 8 + (i % 8),
      z: b.z - 8 + Math.floor(i / 8),
      y: 0
    }))
  );
  const data = citySave(city),
    storage = { getItem: (k) => (k === saveKey('city') ? data : null) };
  assert.ok(data.length < 400000);
  assert.deepEqual(loadWorld('city', storage), city);
  assert.ok(blockIndex(city.pieces).every((b) => b.length === 64));
  assert.deepEqual(loadWorld('free', storage), world('free'));
  const b = BLOCKS[63],
    a = { ...avatar('city'), ...spawnAt(b), x: b.x - 6.5 };
  for (let i = 0; i < 160; i++) advanceAvatar(a, 'city', city.pieces, 0, 1, false, 1 / 60);
  assert.ok(blockAt(a.x, a.z) === b && a.z < b.z - 8 && a.z > b.z - 9, 'local wall stops player');
});
