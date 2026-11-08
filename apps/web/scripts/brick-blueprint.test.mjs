import test from 'node:test';
import assert from 'node:assert/strict';
import { LOTS } from '../public/games/brick-playground-3d/district.mjs';
import {
  placement,
  makePlan,
  capturePieces,
  readPlan,
  KIOSK,
  bounds
} from '../public/games/brick-playground-3d/blueprint.mjs';
const p = (x, z, type = 'single', r = 0, y = 0) => ({
  id: x + ':' + z + ':' + y,
  x,
  y,
  z,
  type,
  r,
  color: 'Sun'
});
test('capture follows face contacts, keeps elevations and excludes diagonal or distant pieces', () => {
  const items = [p(-3, 0, 'pair'), p(-1, 0), p(-1, 0, 'tile', 1, 1), p(0, 1), p(5, 2)];
  const group = capturePieces(items, items[2]);
  assert.deepEqual(new Set(group), new Set(items.slice(0, 3)));
  const plan = makePlan(' Stall ', group);
  assert.equal(plan.name, 'Stall');
  assert.deepEqual(readPlan(JSON.stringify(plan)), plan);
  assert.ok(plan.pieces.every((p) => !Object.hasOwn(p, 'id')));
  assert.deepEqual(capturePieces([p(-17, 2), p(0, 2), p(16, 2)], null, LOTS[2]), [p(16, 2)]);
});
test('four turns preserve asymmetric footprints, rotations and stair orientation', () => {
  const plan = makePlan('Corner', [p(4, 6, 'wall'), p(4, 7, 'slope', 1)]);
  const turned = placement(plan, { x: 0, z: 0 }, 1, false, [], 'free');
  assert.deepEqual(
    turned.pieces.map(({ x, z, r }) => [x, z, r]),
    [
      [3, 0, 1],
      [0, 0, 2]
    ]
  );
  assert.deepEqual(placement(plan, { x: 0, z: 0 }, 4, false, [], 'free').pieces, plan.pieces);
  assert.deepEqual(bounds(turned.pieces), { x: 0, y: 0, z: 0, w: 4, d: 4, h: 3 });
});
test('placement validates the entire group against the destination before saving', () => {
  const plan = readPlan(JSON.stringify(KIOSK)),
    anchor = { x: -4, z: -5 };
  assert.equal(placement(plan, anchor, 0, false, [], 'district').ok, true);
  assert.equal(placement(plan, { x: 0, z: 0 }, 0, false, [], 'district').ok, false);
  assert.equal(placement(plan, { x: 8, z: 7 }, 0, false, [], 'free').ok, false);
  const brick = p(-2, -3, 'tile');
  assert.equal(placement(plan, anchor, 0, false, [brick], 'district').ok, false);
  const stacked = placement(plan, anchor, 0, true, [brick], 'district');
  assert.ok(stacked.ok);
  assert.equal(stacked.base, 1 / 3);
  assert.deepEqual(
    stacked.pieces.map((p) => p.y),
    plan.pieces.map((p) => p.y + 1 / 3)
  );
  assert.equal(placement(plan, anchor, 0, false, [], 'canal').ok, false);
});
test('invalid records cannot introduce overlaps, foreign parts or coordinates outside a source plot', () => {
  for (const pieces of [
    [p(0, 0, 'seat')],
    [p(0, 0), p(0, 0)],
    [p(20, 0)],
    [p('0', 0)],
    [p(0, 0, 'unknown')],
    []
  ])
    assert.throws(() => readPlan(JSON.stringify({ name: 'Oops', pieces })));
});
