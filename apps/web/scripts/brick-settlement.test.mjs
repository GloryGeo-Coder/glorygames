import {
  streetEntries,
  streetLocation
} from '../public/games/brick-playground-3d/street-directory.mjs';
import { SIDE } from '../public/games/brick-playground-3d/settlement.mjs';
import {
  previewStreet,
  streetEffects,
  JUNCTIONS
} from '../public/games/brick-playground-3d/street-builder.mjs';
import {
  GROW_MS,
  gardenVisit,
  tendGarden,
  parkSummary
} from '../public/games/brick-playground-3d/community-garden.mjs';
import {
  boundaryChange,
  neighbourhoodStats,
  neighbourhoodNames
} from '../public/games/brick-playground-3d/neighbourhoods.mjs';
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

test('neighbourhoods grow edge to edge, keep other claims and cannot split at a joining block', () => {
  const city = world('city'),
    initial = city.blocks;
  const edit = (action, name, id, input) => {
    const result = boundaryChange(city, action, name, BLOCKS[id], input);
    if (result.blocks) city.blocks = result.blocks;
    return result.issue || '';
  };
  assert.equal(edit('create', '', 27, ' Market Quarter '), '');
  assert.equal(edit('add', 'Market Quarter', 28), '');
  assert.equal(edit('add', 'Market Quarter', 29), '');
  assert.match(edit('add', 'Market Quarter', 38), /shares an edge/);
  assert.match(edit('remove', 'Market Quarter', 28), /split/);
  assert.equal(edit('create', '', 35, 'Station Side'), '');
  assert.match(edit('add', 'Market Quarter', 35), /Station Side/);
  assert.match(edit('rename', 'Market Quarter', 27, 'station side'), /already in use/);
  assert.equal(edit('rename', 'Market Quarter', 27, 'Market Gardens'), '');
  assert.equal(edit('remove', 'Market Gardens', 29), '');
  assert.equal(edit('dissolve', 'Station Side', 35), '');
  assert.deepEqual(neighbourhoodNames(city), ['Market Gardens']);
  assert.equal(city.blocks[27].name, initial[27].name);
  assert.equal(initial[27].neighbourhood, undefined);
  const edge = world('city');
  edge.blocks = boundaryChange(edge, 'create', '', BLOCKS[7], 'Border').blocks;
  assert.ok(boundaryChange(edge, 'add', 'Border', BLOCKS[8]).issue);
});
test('neighbourhood counts follow actual buildings and home doors and survive map edits and reloading', () => {
  const city = world('city');
  const home = city.pieces.find((p) => p.type === 'door');
  city.blocks = boundaryChange(city, 'create', '', BLOCKS[27], 'Market Quarter').blocks;
  city.blocks = boundaryChange(city, 'add', 'Market Quarter', BLOCKS[28]).blocks;
  city.resident = { home: home.id };
  assert.deepEqual(neighbourhoodStats(city, 'Market Quarter'), {
    blocks: 2,
    built: 2,
    households: 1
  });
  city.pieces = city.pieces.filter((p) => p.id !== home.id);
  assert.equal(neighbourhoodStats(city, 'Market Quarter').households, 0);
  Object.assign(city, layoutEdit(city, BLOCKS[27], 'Square', 'shops', ['south']));
  const reopened = loadWorld('city', { getItem: () => citySave(city) });
  assert.deepEqual(reopened.blocks[27], {
    name: 'Square',
    zone: 'shops',
    neighbourhood: 'Market Quarter'
  });
  assert.equal(neighbourhoodStats(reopened, 'Market Quarter').built, 2);
  assert.deepEqual(neighbourhoodNames(world('city')), []);
  const vacant = BLOCKS[3];
  city.blocks = boundaryChange(city, 'create', '', vacant, 'North End').blocks;
  const saved = loadWorld('city', { getItem: () => citySave(city) });
  const row = stageBlockRow(saved, {
    source: BLOCKS[27],
    first: vacant,
    count: 1,
    direction: 'east',
    turns: 0
  });
  assert.deepEqual(row.blocks[vacant.id], { neighbourhood: 'North End', name: '', zone: 'shops' });
  const dissolved = boundaryChange(saved, 'dissolve', 'North End', vacant);
  assert.equal(dissolved.blocks[vacant.id], undefined);
});

test('park gardening needs reachable fixtures, grows across a reload, and only hands out one bouquet', () => {
  const city = world('city'),
    p = city.pieces.find((p) => p.type === 'pot'),
    b = blockAt(p.x, p.z);
  const hand = { x: p.x + 1, z: p.z - 0.4, y: 0 };
  const get = (now, play = true) => gardenVisit(city, hand, play, now);
  const fire = (request, time, flower = 'daisy') =>
    tendGarden(city, hand, true, request, flower, time);
  const ready = get(10);
  assert.equal(ready.action, 'sow');
  assert.equal(get(10, false), null);
  assert.equal(tendGarden(city, hand, false, ready, 'daisy', 10), false);
  assert.equal(fire(ready, 10, 'bogus'), false);
  city.pieces = [
    ...city.pieces,
    { id: 'wall', type: 'wall', color: 'Chalk', r: 0, x: p.x, y: 0, z: p.z - 1 }
  ];
  assert.equal(fire(ready, 10), false);
  city.pieces = city.pieces.filter((brick) => brick.id !== 'wall');
  assert.equal(fire(ready, 10), true);
  assert.equal(fire(ready, 10), false);
  assert.equal(get(10000).action, 'water');
  assert.equal(fire(get(10000), 10000), true);
  const saved = loadWorld('city', { getItem: () => citySave(city) });
  assert.equal(gardenVisit(saved, hand, true, 10001).action, undefined);
  assert.equal(gardenVisit(saved, hand, true, 10000 + GROW_MS).action, 'pick');
  hand.y = 3;
  assert.equal(get(30000).action, undefined);
  hand.y = 0;
  const pick = get(30000);
  assert.equal(fire(pick, 30000), true);
  assert.equal(fire(pick, 30000), false);
  const bench = city.pieces.find((p) => p.type === 'bench'),
    second = BLOCKS[b.id + 8];
  city.pieces = city.pieces.map((p) =>
    p.id === bench.id ? { ...p, x: second.x, z: second.z } : p
  );
  Object.assign(hand, { x: second.x + 1, z: second.z - 0.4 });
  assert.equal(get(30000).action, undefined);
  city.blocks = { ...city.blocks, [second.id]: { name: 'Garden court', zone: 'park' } };
  assert.equal(fire(get(30000), 30000), true);
  const restored = loadWorld('city', { getItem: () => citySave(city) });
  assert.equal(restored.garden.bouquet, null);
  assert.deepEqual(restored.garden.displays, [{ id: bench.id, flower: 'daisy' }]);
  restored.pieces = restored.pieces.filter((p) => p.id !== bench.id);
  assert.equal(loadWorld('city', { getItem: () => citySave(restored) }).garden, undefined);
});
test('garden decorations follow placed IDs and corrupt garden data leaves the settlement usable', () => {
  const city = world('city'),
    pot = city.pieces.find((p) => p.type === 'pot');
  city.garden = {
    plants: [{ id: pot.id, flower: 'marigold', watered: 100 }],
    displays: [],
    bouquet: null
  };
  const moved = { ...pot, x: pot.x + 2 },
    original = { x: pot.x + 0.1, z: pot.z - 0.4, y: 0 };
  city.pieces = city.pieces.map((p) => (p.id === pot.id ? moved : p));
  assert.notEqual(gardenVisit(city, original, true, 99999)?.action, 'pick');
  assert.equal(gardenVisit(city, { ...original, x: moved.x + 1 }, true, 99999)?.action, 'pick');
  assert.match(parkSummary(city, blockAt(moved.x, moved.z), 99999), /In bloom 1/);
  const raw = JSON.parse(citySave(city));
  raw.garden = {
    plants: [
      null,
      { id: pot.id, flower: 'constructor', watered: 0 },
      { id: pot.id, flower: 'daisy', watered: 'yesterday' }
    ],
    bouquet: 'bad'
  };
  const old = loadWorld('city', { getItem: () => JSON.stringify(raw) });
  assert.equal(old.garden, undefined);
  assert.deepEqual(old.pieces, city.pieces);
});

test('street sketches trace both bends, reuse shared sections and stay on valid city edges', () => {
  const city = world('city'),
    saved = citySave(city),
    corner = (col, row) => row * (SIDE + 1) + col;
  const start = corner(3, 4),
    end = corner(6, 5);
  const run = previewStreet(city, start, end, 'horizontal', 'lay');
  assert.deepEqual(
    run.sections.map((s) => s.key),
    ['h-3-4', 'h-4-4', 'h-5-4', 'v-6-4']
  );
  assert.deepEqual(run.changed, ['h-4-4', 'h-5-4', 'v-6-4']);
  const other = previewStreet(city, start, end, 'vertical', 'lay');
  assert.deepEqual(other.changed, ['v-3-4', 'h-3-5', 'h-4-5', 'h-5-5']);
  const staged = { ...city, streets: run.streets };
  assert.equal(previewStreet(staged, end, start, 'vertical', 'lay').streets, staged.streets);
  assert.deepEqual(
    previewStreet(staged, end, corner(4, 4), 'vertical', 'remove').streets,
    city.streets
  );
  assert.equal(citySave(city), saved);
  const valid = new Set(BLOCKS.flatMap((b) => Object.values(streetKeys(b))));
  for (const a of JUNCTIONS)
    for (const b of JUNCTIONS)
      for (const bend of ['horizontal', 'vertical']) {
        const path = previewStreet(city, a.id, b.id, bend, 'lay');
        if (a === b) {
          assert.equal(path, null);
          continue;
        }
        assert.equal(path.sections.length, Math.abs(a.col - b.col) + Math.abs(a.row - b.row));
        assert.ok(path.sections.every((s) => valid.has(s.key)));
        assert.equal(new Set(path.sections.map((s) => s.key)).size, path.sections.length);
      }
  for (const invalid of [-1, 81, 'map', null, undefined])
    assert.equal(previewStreet(city, invalid, 0, 'horizontal', 'lay'), null);
});
test('street previews predict gaining, losing, and shortening a household connection against the staged layout', () => {
  const city = plannerCity();
  let route = previewStreet(city, 3 * 9 + 3, 3 * 9 + 4, 'horizontal', 'lay');
  assert.deepEqual(streetEffects(city, route.streets), ['Lebo gains a street connection.']);
  const direct = { ...city, streets: route.streets };
  route = previewStreet(direct, 3 * 9 + 4, 3 * 9 + 3, 'horizontal', 'remove');
  assert.deepEqual(streetEffects(direct, route.streets), ['Lebo loses the street connection.']);
  const detour = { ...city, streets: [...city.streets, 'v-3-2', 'h-3-2', 'v-4-2'] };
  route = previewStreet(detour, 3 * 9 + 3, 3 * 9 + 4, 'horizontal', 'lay');
  assert.deepEqual(streetEffects(detour, route.streets), [
    'Lebo’s street route is 48 studs shorter.'
  ]);
  const shorter = { ...detour, streets: route.streets };
  assert.deepEqual(streetEffects(shorter, detour.streets), [
    'Lebo’s street route is 48 studs longer.'
  ]);
  assert.deepEqual(streetEffects(shorter, shorter.streets), []);
});

test('street names follow built sections, can be split or cleared, and never return on a rebuilt road', () => {
  const city = world('city'),
    junction = (x, y) => y * (SIDE + 1) + x,
    start = junction(3, 4),
    end = junction(5, 4);
  const apply = (p) => Object.assign(city, { streets: p.streets, streetNames: p.streetNames });
  assert.match(
    previewStreet(city, start, end, 'horizontal', 'name', 'Protea Road').issue,
    /missing/
  );
  apply(previewStreet(city, start, end, 'horizontal', 'lay'));
  assert.ok(previewStreet(city, start, end, 'horizontal', 'name', '   ').issue);
  assert.ok(previewStreet(city, start, end, 'horizontal', 'name', 'x'.repeat(33)).issue);
  apply(previewStreet(city, start, end, 'horizontal', 'name', '  Protea Road  '));
  const before = city.streets;
  assert.deepEqual(city.streetNames, { 'h-3-4': 'Protea Road', 'h-4-4': 'Protea Road' });
  assert.equal(
    previewStreet(city, start, end, 'horizontal', 'name', 'Protea Road').changed.length,
    0
  );
  apply(previewStreet(city, junction(4, 4), end, 'horizontal', 'name', 'Garden Lane'));
  assert.equal(city.streets, before);
  assert.deepEqual(city.streetNames, { 'h-3-4': 'Protea Road', 'h-4-4': 'Garden Lane' });
  const reopened = loadWorld('city', { getItem: () => citySave(city) });
  assert.deepEqual(reopened.streetNames, city.streetNames);
  apply(previewStreet(city, start, junction(4, 4), 'horizontal', 'unname'));
  assert.deepEqual(city.streetNames, { 'h-4-4': 'Garden Lane' });
  apply(previewStreet(city, junction(4, 4), end, 'horizontal', 'remove'));
  assert.equal(city.streetNames, undefined);
  apply(previewStreet(city, junction(4, 4), end, 'horizontal', 'lay'));
  assert.equal(city.streetNames, undefined);
  const edited = layoutEdit(reopened, BLOCKS[27], 'New block', 'mixed', ['north', 'west', 'east']);
  assert.deepEqual(edited.streetNames, { 'h-4-4': 'Garden Lane' });
  const raw = JSON.parse(citySave(reopened));
  raw.streetNames = { 'h-3-4': '  Good  ', 'h-0-0': 'Ghost', 'h-4-4': 3, 'v-4-3': 'x'.repeat(33) };
  assert.deepEqual(loadWorld('city', { getItem: () => JSON.stringify(raw) }).streetNames, {
    'h-3-4': 'Good'
  });
});
test('directory lists actual facing doors and arches, updates after edits, and locates the player at junctions', () => {
  const city = world('city');
  city.streetNames = { 'h-3-4': 'Protea Road', 'v-3-3': 'Station Lane' };
  const door = city.pieces.find((p) => p.type === 'door'),
    arch = { ...door, id: 'arch', type: 'arch', x: door.x + 5 };
  city.pieces = [...city.pieces, arch, { ...arch, id: 'upper', y: 3 }];
  const before = streetEntries(city, 'Protea Road');
  assert.deepEqual(new Set(before.doors.map((d) => d.id)), new Set([door.id, 'arch']));
  assert.equal(streetLocation(city, -12, 0), 'Protea Road');
  assert.equal(streetLocation(city, -24, 0), 'Protea Road / Station Lane');
  assert.equal(streetLocation(city, 12, 12), '');
  city.pieces = city.pieces.map((p) => (p === door ? { ...p, r: 3 } : p));
  assert.deepEqual(
    streetEntries(city, 'Protea Road').doors.map((d) => d.id),
    ['arch']
  );
  assert.deepEqual(
    streetEntries(city, 'Station Lane').doors.map((d) => d.id),
    [door.id]
  );
  city.streetNames = { 'h-0-0': 'Outer Road' };
  city.streets = ['h-0-0'];
  const outer = streetEntries(city, 'Outer Road');
  assert.deepEqual(outer.doors, []);
  assert.equal(streetLocation(city, outer.start.curb.x, outer.start.curb.z), 'Outer Road');
  assert.equal(streetEntries(city, 'Protea Road'), null);
});
