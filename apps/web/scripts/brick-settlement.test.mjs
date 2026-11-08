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
import {
  streetLamps,
  suggestLamp,
  surveyLighting,
  darkness
} from '../public/games/brick-playground-3d/street-lighting.mjs';
import { planStreets } from '../public/games/brick-playground-3d/street-planner.mjs';
import { entrance, streetPath } from '../public/games/brick-playground-3d/resident-trip.mjs';
import {
  previewBlockRow,
  stageBlockRow
} from '../public/games/brick-playground-3d/block-expansion.mjs';
import {
  prepareTrail,
  canStamp,
  stampTrail,
  startingPavement,
  trailLegs,
  currentStop
} from '../public/games/brick-playground-3d/town-trail.mjs';
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

test('street lighting clips and merges illuminated spans along turns without double counting overlap', () => {
  const points = [
    { x: 0, z: 0 },
    { x: 20, z: 0 },
    { x: 20, z: 10 }
  ];
  const survey = surveyLighting(points, [
    { x: 4, z: 0, radius: 5 },
    { x: 8, z: 0, radius: 4 },
    { x: 20, z: 5, radius: 3 }
  ]);
  assert.equal(survey.total, 30);
  assert.equal(survey.lit, 18);
  assert.deepEqual(
    survey.spans.map((s) => s.lit),
    [true, false, false, true, false]
  );
  assert.equal(surveyLighting(points.slice().reverse(), [{ x: 4, z: 0, radius: 5 }]).lit, 9);
  assert.equal(surveyLighting([points[0], points[0]], []).total, 0);
  assert.equal(
    surveyLighting(points, [{ x: 10, z: -4, radius: 4 }]).lit,
    0,
    'a tangent adds no lit distance'
  );
});
test('a copied or elevated streetlamp uses its real height and placement after reloading', () => {
  const city = world('city'),
    p = { id: 'town-lamp', type: 'streetlamp', color: 'Sun', x: -12, y: 0, z: 2, r: 1 };
  city.pieces = [...city.pieces, p];
  city.lighting = 'night';
  assert.ok(validPiece(p, city.pieces, p.id, 'city'));
  const copy = stageBlockRow(city, {
    source: BLOCKS[27],
    first: BLOCKS[0],
    count: 1,
    direction: 'east',
    turns: 1
  });
  const restored = loadWorld('city', { getItem: () => citySave(copy) });
  assert.equal(restored.lighting, 'night');
  assert.equal(streetLamps(restored.pieces).length, 2);
  const raised = streetLamps([{ ...p, y: 12 }])[0];
  assert.equal(raised.radius, 0);
  assert.equal(
    surveyLighting(
      [
        { x: -20, z: 0 },
        { x: -5, z: 0 }
      ],
      streetLamps(city.pieces)
    ).lit,
    15
  );
  assert.equal(
    surveyLighting(
      [
        { x: -20, z: 0 },
        { x: -5, z: 0 }
      ],
      [raised]
    ).lit,
    0
  );
  city.lighting = 'bad';
  assert.equal(loadWorld('city', { getItem: () => citySave(city) }).lighting, undefined);
});
test('settlement twilight follows the saved clock, with independent day and night previews', () => {
  assert.equal(darkness('clock', 450), 0);
  assert.equal(darkness('clock', 1080) > 0, true);
  assert.equal(darkness('clock', 1140), 1);
  assert.equal(darkness('clock', 360) > 0, true);
  assert.equal(darkness('clock', 1440 + 450), 0);
  assert.equal(darkness('day', 0), 0);
  assert.equal(darkness('night', 800), 1);
});

test('aiming at a dark gap chooses an unoccupied plot stud, even when the nearest edge is built up', () => {
  const pieces = [{ id: 'wall', type: 'wall', color: 'Plum', x: -14, y: 0, z: 2, r: 0 }];
  const points = [
    { x: -18, z: 0 },
    { x: -8, z: 0 }
  ];
  const dark = surveyLighting(points, []);
  const lamp = suggestLamp(pieces, dark, BLOCKS[27]);
  assert.ok(lamp && validPiece(lamp, pieces, null, 'city'));
  const lit = surveyLighting(points, streetLamps([...pieces, lamp]));
  assert.equal(lit.lit, lit.total);
  assert.equal(suggestLamp(pieces, lit), null);
  assert.equal(
    suggestLamp(
      [],
      surveyLighting(
        [
          { x: 200, z: 210 },
          { x: 208, z: 210 }
        ],
        []
      )
    ),
    null
  );
});

test('a passport requires ordered visits on foot and restores the exact next doorway after a reload', () => {
  const city = plannerCity();
  const stops = city.pieces.map((p, i) => ({ door: p.id, label: ['Spaza', 'Reading room'][i] }));
  city.trail = prepareTrail(city, 'High Street', stops);
  const [a, b] = city.pieces.map(entrance);
  const at = (p) => ({ ...p.inside, y: 0 });
  assert.equal(startingPavement(city).block.code, a.block.code);
  assert.equal(stampTrail(city, at(b), true), null);
  assert.equal(stampTrail(city, at(a), false), null);
  assert.equal(stampTrail(city, { ...a.center, y: 0 }, true), null);
  assert.equal(stampTrail(city, { ...a.inside, y: 3 }, true), null);
  assert.equal(stampTrail(city, at(a), true).label, 'Spaza');
  assert.equal(stampTrail(city, at(a), true), null);
  const reopened = loadWorld('city', { getItem: () => citySave({ ...world('city'), ...city }) });
  assert.equal(currentStop(reopened).label, 'Reading room');
  assert.deepEqual(startingPavement(reopened).curb, a.curb);
  assert.ok(trailLegs(reopened)[0].missing.length);
  reopened.streets = [...reopened.streets, ...trailLegs(reopened)[0].missing];
  assert.equal(trailLegs(reopened)[0].missing.length, 0);
  assert.equal(stampTrail(reopened, at(b), true).label, 'Reading room');
  assert.equal(startingPavement(reopened), null);
  assert.equal(stampTrail(reopened, at(b), true), null);
});
test('missing or moved stops cannot be stamped at stale coordinates; editing preserves only an unchanged visited prefix', () => {
  const city = plannerCity(),
    original = city.pieces,
    stops = original.map((p, i) => ({ door: p.id, label: 'Stop ' + i }));
  assert.equal(prepareTrail(city, ' ', stops), null);
  assert.equal(prepareTrail(city, 'Town', [stops[0], stops[0]]), null);
  city.trail = prepareTrail(city, 'Town', stops);
  city.trail.stamps = 1;
  city.pieces = [original[0]];
  assert.equal(startingPavement(city), null);
  const old = { ...entrance(original[1]).inside, y: 0 };
  assert.equal(stampTrail(city, old, true), null);
  const moved = { ...original[1], r: 1, x: original[1].x + 6 };
  city.pieces = [original[0], moved];
  assert.equal(canStamp(city, old, true), false);
  assert.equal(prepareTrail(city, 'Renamed', stops).stamps, 1);
  assert.equal(prepareTrail(city, 'Reversed', [...stops].reverse()).stamps, 0);
  assert.ok(stampTrail(city, { ...entrance(moved).inside, y: 0 }, true));
  assert.equal(prepareTrail(city, 'Same doors', stops).stamps, 2);
  const bad = { ...world('city'), trail: { name: 'Broken', stops: [{}, {}], stamps: 1 } };
  const loaded = loadWorld('city', { getItem: () => citySave(bad) });
  assert.equal(loaded.trail, undefined);
  assert.deepEqual(loaded.pieces, bad.pieces);
});
