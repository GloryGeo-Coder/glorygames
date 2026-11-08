import test from 'node:test';
import assert from 'node:assert/strict';
import {
  world,
  validPiece,
  size,
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
import { planStreets } from '../public/games/brick-playground-3d/street-planner.mjs';
import { entrance, streetPath } from '../public/games/brick-playground-3d/resident-trip.mjs';
import {
  previewBlockRow,
  stageBlockRow
} from '../public/games/brick-playground-3d/block-expansion.mjs';
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

function plannerCity() {
  const pieces = [18, 20].map((i, n) => ({
    id: String(n),
    type: 'door',
    x: BLOCKS[i].x,
    y: 0,
    z: BLOCKS[i].z,
    r: 0,
    color: 'Chalk'
  }));
  return { pieces, streets: ['h-2-3', 'h-4-3'], resident: { home: '0', shop: '1' } };
}
test('planner stages the fewest missing streets and matches the resident’s route', () => {
  const city = plannerCity(),
    before = structuredClone(city);
  const plan = planStreets(city, city.resident);
  assert.deepEqual(plan.missing, ['h-3-3']);
  assert.deepEqual(city, before);
  const connected = planStreets(
    { ...city, streets: [...city.streets, ...plan.missing] },
    city.resident
  );
  assert.deepEqual(connected.missing, []);
  assert.deepEqual(plan.points, connected.points);
  assert.equal(plan.distance, 48);
  const detour = { ...city, streets: [...city.streets, 'v-3-2', 'h-3-2', 'v-4-2'] };
  const longer = planStreets(detour, city.resident);
  assert.deepEqual(longer.missing, []);
  assert.equal(longer.distance, 96);
  assert.deepEqual(
    longer.points.slice(1),
    streetPath(detour.streets, longer.home.curb, longer.destination.curb)
  );
});
test('planner identifies removed entrances and mandatory shared streets even at coincident curbs', () => {
  const city = plannerCity();
  city.pieces[1] = { ...city.pieces[1], x: city.pieces[0].x, z: BLOCKS[26].z, r: 2 };
  city.streets = [];
  const p = planStreets(city, city.resident);
  assert.deepEqual(p.missing, [entrance(city.pieces[0]).street]);
  assert.equal(p.distance, 0);
  city.pieces.pop();
  const missing = planStreets(city, city.resident);
  assert.equal(missing.destination, null);
  assert.equal(missing.distance, null);
  assert.deepEqual(missing.missing, []);
});
test('planner restores a cross-city route using valid sections at the map boundary', () => {
  const city = plannerCity();
  Object.assign(city.pieces[0], { x: BLOCKS[0].x, z: BLOCKS[0].z, r: 2 });
  Object.assign(city.pieces[1], { x: BLOCKS[63].x, z: BLOCKS[63].z, r: 0 });
  city.streets = [];
  const p = planStreets(city, city.resident);
  assert.ok(p.missing.includes('h-0-0') && p.missing.includes('h-7-8'));
  const restored = planStreets({ ...city, streets: p.missing }, city.resident);
  assert.equal(restored.distance, p.distance);
  assert.deepEqual(restored.missing, []);
  for (const edge of p.missing) {
    const without = planStreets(
      { ...city, streets: p.missing.filter((k) => k !== edge) },
      city.resident
    );
    assert.ok(without.missing.length, 'no superfluous streets in the repair');
  }
});

test('repeated blocks rotate around the lot centre and keep independent brick IDs, roads and land uses', () => {
  const city = world('city'),
    source = BLOCKS[27],
    first = BLOCKS[8],
    second = BLOCKS[9];
  city.blocks[source.id].zone = 'homes';
  city.blocks[second.id] = { name: 'Market Row', zone: 'shops' };
  city.streets = [streetKeys(source).south, streetKeys(source).west, streetKeys(second).north];
  const original = structuredClone(city),
    items = blockIndex(city.pieces)[source.id];
  const spec = { source, first, count: 2, direction: 'east', turns: 1 };
  const preview = previewBlockRow(city, spec);
  assert.equal(preview.issue, '');
  assert.deepEqual(city, original);
  assert.equal(preview.pieces.length, items.length * 2);
  const staged = stageBlockRow(city, spec);
  assert.deepEqual(city, original);
  assert.equal(staged.pieces.length, city.pieces.length + items.length * 2);
  for (const b of [first, second]) {
    const row = blockIndex(staged.pieces)[b.id];
    assert.equal(row.length, items.length);
    for (const [i, p] of row.entries()) {
      const old = items[i];
      assert.deepEqual(
        [p.x, p.z, p.r, p.y, p.color, p.type],
        [
          b.x - (old.z - source.z) - size(old).d,
          b.z + (old.x - source.x),
          (old.r + 1) % 4,
          old.y,
          old.color,
          old.type
        ]
      );
      assert.ok(validPiece(p, row, p.id, 'city'));
    }
    assert.ok(
      staged.streets.includes(streetKeys(b).east) && staged.streets.includes(streetKeys(b).south)
    );
  }
  assert.deepEqual(staged.blocks[first.id], { name: '', zone: 'homes' });
  assert.deepEqual(staged.blocks[second.id], city.blocks[second.id]);
  assert.ok(staged.streets.includes(streetKeys(second).north));
  assert.equal(new Set(staged.streets).size, staged.streets.length);
  assert.equal(new Set(staged.pieces.map((p) => p.id)).size, staged.pieces.length);
  assert.deepEqual(loadWorld('city', { getItem: () => citySave(staged) }).pieces, staged.pieces);
});
test('an occupied block or map edge rejects the entire row and a staged row cannot be applied twice', () => {
  const city = world('city'),
    source = BLOCKS[27],
    spec = { source, first: BLOCKS[25], count: 4, direction: 'east', turns: 2 };
  assert.match(previewBlockRow(city, spec).issue, /D4/);
  assert.strictEqual(stageBlockRow(city, spec), city);
  for (const [first, direction] of [
    [7, 'east'],
    [0, 'north'],
    [0, 'west'],
    [63, 'south']
  ]) {
    const off = { ...spec, first: BLOCKS[first], direction, count: 2 };
    assert.match(previewBlockRow(city, off).issue, /boundary/);
    assert.strictEqual(stageBlockRow(city, off), city);
  }
  for (const turns of [0, 1, 2, 3]) {
    const ok = { ...spec, first: BLOCKS[8], count: 8, turns };
    const stamped = stageBlockRow(city, ok);
    assert.equal(blockIndex(stamped.pieces)[15].length, blockIndex(city.pieces)[27].length);
    assert.strictEqual(stageBlockRow(stamped, ok), stamped);
    for (const b of stamped.pieces) assert.ok(validPiece(b, [], null, 'city'));
  }
});
