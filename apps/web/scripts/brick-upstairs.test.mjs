import test from 'node:test';
import assert from 'node:assert/strict';
import {
  avatar,
  advanceAvatar,
  world,
  loadWorld,
  saveKey,
  validPiece,
  snapHeight
} from '../public/games/brick-playground-3d/model.mjs';
import { REPAIRS, FORECOURT, atHandover } from '../public/games/brick-playground-3d/upstairs.mjs';
import { placement, KIOSK } from '../public/games/brick-playground-3d/blueprint.mjs';
function walk(a, items, dx, dz, n) {
  for (let i = 0; i < n; i++) advanceAvatar(a, 'upstairs', items, dx, dz, false, 1 / 60);
}
function install(items, draft, id) {
  const p = { ...draft, id, y: snapHeight(draft, items) };
  assert.ok(validPiece(p, items, null, 'upstairs'));
  items.push(p);
}
test('shop shell is editable, legal and keeps a clear return point', () => {
  const { pieces } = world('upstairs');
  pieces.forEach((p, i) => assert.ok(validPiece(p, pieces.slice(0, i), null, 'upstairs'), p.id));
  assert.equal(snapHeight(REPAIRS.stairs, pieces), 1);
  assert.ok(Math.abs(snapHeight(REPAIRS.balcony, pieces) - 8 / 3) < 1e-8);
  const block = { ...REPAIRS.balcony, x: -3, z: -8, y: 0 };
  assert.ok(!validPiece(block, [], null, 'upstairs'));
  assert.ok(validPiece(block, [], null, 'free'));
  assert.ok(placement(KIOSK, { x: 6, z: -6 }, 0, false, pieces, 'upstairs').ok);
});
test('an unfinished stair stops the courier; the separate balcony gap lets them fall', () => {
  const { pieces } = world('upstairs'),
    a = { ...avatar('upstairs'), x: 4, z: -9 };
  walk(a, pieces, 0, 1, 170);
  assert.ok(a.z < -2 && a.y === 1 && !atHandover(2, a));
  walk(a, pieces, 0, -1, 60);
  install(pieces, REPAIRS.stairs, 'repair');
  walk(a, pieces, 0, 1, 135);
  assert.ok(a.z > 2 && a.y === 3);
  walk(a, pieces, -1, 0, 60);
  assert.ok(a.y < 1 && !atHandover(2, a));
});
test('stairs or a ramp can reach the upstairs delivery area over a player-built deck', () => {
  for (const type of ['step', 'slope']) {
    const { pieces } = world('upstairs'),
      a = avatar('upstairs');
    walk(a, pieces, 0, 1, 170);
    assert.ok(atHandover(1, a) && !atHandover(2, a));
    walk(a, pieces, 0, -1, 187);
    walk(a, pieces, 1, 0, 103);
    install(pieces, { ...REPAIRS.stairs, type }, 'flight');
    install(pieces, REPAIRS.balcony, 'link');
    walk(a, pieces, 0, 1, 182);
    walk(a, pieces, -1, 0, 101);
    assert.ok(atHandover(2, a), type);
    assert.ok(atHandover(2, { ...a, z: 3.3 }) && !atHandover(2, { ...a, x: 0.1 }));
    assert.ok(!atHandover(2, { ...a, y: 0 }) && !atHandover(2, { ...a, grounded: false }));
  }
});
test('a named shop reopens with its route edits, parcel stage and independent completion', () => {
  const shop = { ...world('upstairs'), name: 'Kopano Corner', stage: 2 };
  install(shop.pieces, REPAIRS.balcony, 'deck');
  const storage = { getItem: (k) => (k === saveKey('upstairs') ? JSON.stringify(shop) : null) };
  assert.deepEqual(loadWorld('upstairs', storage), shop);
  assert.deepEqual(loadWorld('district', storage), world('district'));
  Object.assign(shop, { complete: true, stage: 3 });
  assert.deepEqual(loadWorld('upstairs', storage), shop);
  assert.equal(avatar('upstairs').x, FORECOURT.x);
});
