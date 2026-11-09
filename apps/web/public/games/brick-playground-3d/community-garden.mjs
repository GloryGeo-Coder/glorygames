import { blockAt, blockIndex, blockInfo } from './settlement.mjs';
import { intervals, size } from './model.mjs';

export const FLOWERS = {
  marigold: { name: 'Marigold', petal: '#ff9a23', centre: '#ad4313' },
  daisy: { name: 'African daisy', petal: '#f6d5ef', centre: '#61235e' }
};
export const GROW_MS = 12000;
export function flowerStage(item, now) {
  if (!item) return 'empty';
  if (item.watered === null) return 'seed';
  return now >= item.watered + GROW_MS ? 'bloom' : 'growing';
}
export function restoreGarden(raw, pieces) {
  if (!raw || typeof raw !== 'object') return undefined;
  const fixtures = new Map(
    pieces.filter((p) => p.type === 'pot' || p.type === 'bench').map((p) => [p.id, p.type])
  );
  const seen = new Set(),
    plants = [],
    displays = [];
  for (const [list, type, out] of [
    [raw.plants, 'pot', plants],
    [raw.displays, 'bench', displays]
  ]) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (
        !item ||
        fixtures.get(item.id) !== type ||
        seen.has(item.id) ||
        !Object.hasOwn(FLOWERS, item.flower)
      )
        continue;
      if (
        type === 'pot' &&
        item.watered !== null &&
        !(Number.isSafeInteger(item.watered) && item.watered >= 0)
      )
        continue;
      out.push(
        type === 'pot'
          ? { id: item.id, flower: item.flower, watered: item.watered }
          : { id: item.id, flower: item.flower }
      );
      seen.add(item.id);
    }
  }
  const bouquet = Object.hasOwn(FLOWERS, raw.bouquet) ? raw.bouquet : null;
  return plants.length || displays.length || bouquet ? { plants, displays, bouquet } : undefined;
}
const isPark = (city, b) => blockInfo(city, b).zone === 'park';
export function parkSummary(city, block, now) {
  if (!isPark(city, block)) return '';
  const items = blockIndex(city.pieces)[block.id],
    ids = new Set(items.map((p) => p.id));
  const count = (type) => items.filter((p) => p.type === type).length;
  const blooms =
    city.garden?.plants.filter((p) => ids.has(p.id) && flowerStage(p, now) === 'bloom').length || 0;
  return (
    'Community garden · Planters ' +
    count('pot') +
    ' · In bloom ' +
    blooms +
    ' · Benches ' +
    count('bench') +
    '. Walk here to tend flowers.'
  );
}
// Check the hand's path to the near edge using the same brick shapes as the walker.
function inReach(person, fixture, items, point, distance) {
  const targetY = fixture.y + size(fixture).h;
  if (distance > 1.15 || Math.abs(person.y + 1 - targetY) > 0.85) return false;
  for (let step = 0; step <= 8; step++) {
    const t = step / 8,
      x = person.x + (point.x - person.x) * t,
      z = person.z + (point.z - person.z) * t,
      y = person.y + 1 + (targetY - person.y - 1) * t;
    if (
      items.some(
        (p) =>
          p !== fixture && intervals(p, x, z).some(([lo, hi]) => lo < y + 0.02 && hi > y - 0.02)
      )
    )
      return false;
  }
  return true;
}
export function gardenVisit(city, person, playing, now) {
  if (!playing || !person) return null;
  const block = blockAt(person.x, person.z),
    garden = city.garden,
    bouquet = garden?.bouquet;
  if (!isPark(city, block))
    return bouquet ? { hint: 'Carrying ' + FLOWERS[bouquet].name + ' · Find a park bench.' } : null;
  const items = blockIndex(city.pieces)[block.id],
    type = bouquet ? 'bench' : 'pot';
  let nearest,
    nearestDistance = Infinity,
    reachable,
    reachDistance = Infinity;
  for (const p of items) {
    if (p.type !== type) continue;
    const { w, d, h } = size(p),
      point = {
        x: Math.max(p.x, Math.min(person.x, p.x + w)),
        z: Math.max(p.z, Math.min(person.z, p.z + d))
      };
    const distance = Math.hypot(person.x - point.x, person.z - point.z),
      range = Math.hypot(distance, person.y + 1 - p.y - h);
    if (range < nearestDistance) {
      nearest = p;
      nearestDistance = range;
    }
    if (range < reachDistance && inReach(person, p, items, point, distance)) {
      reachable = p;
      reachDistance = range;
    }
  }
  const what = bouquet ? 'park bench' : 'planter';
  if (!nearest)
    return {
      hint:
        (bouquet ? 'Carrying ' + FLOWERS[bouquet].name + '. ' : '') +
        'Add a ' +
        what +
        ' to this park in Build mode.'
    };
  if (!reachable)
    return {
      hint:
        nearestDistance <= 1.15
          ? 'Approach the ' + what + ' from an open side.'
          : 'Walk to a ' + what + ' · ' + Math.ceil(nearestDistance) + ' studs'
    };
  const id = reachable.id;
  if (bouquet) {
    const display = garden.displays.find((d) => d.id === id);
    return {
      id,
      action: 'display',
      label: display ? 'Replace bench bouquet' : 'Place bouquet',
      hint: 'Carrying ' + FLOWERS[bouquet].name
    };
  }
  const plant = garden?.plants.find((p) => p.id === id);
  switch (flowerStage(plant, now)) {
    case 'empty':
      return { id, action: 'sow', label: 'Plant seeds', hint: 'Empty planter' };
    case 'seed':
      return {
        id,
        action: 'water',
        label: 'Water planter',
        hint: FLOWERS[plant.flower].name + ' seeds'
      };
    case 'growing':
      return {
        id,
        hint:
          FLOWERS[plant.flower].name +
          ' · Blooms in ' +
          Math.ceil((plant.watered + GROW_MS - now) / 1000) +
          's'
      };
    case 'bloom':
      return {
        id,
        action: 'pick',
        label: 'Pick bouquet',
        hint: FLOWERS[plant.flower].name + ' in bloom'
      };
  }
}
export function tendGarden(city, person, playing, request, seed, now) {
  const visit = gardenVisit(city, person, playing, now);
  if (!visit?.action || visit.id !== request?.id || visit.action !== request.action) return false;
  const garden = city.garden || { plants: [], displays: [], bouquet: null },
    { id, action } = visit;
  const others = garden.plants.filter((p) => p.id !== id);
  if (action === 'sow') {
    if (!Object.hasOwn(FLOWERS, seed)) return false;
    city.garden = { ...garden, plants: [...others, { id, flower: seed, watered: null }] };
  } else if (action === 'water') {
    city.garden = {
      ...garden,
      plants: garden.plants.map((p) => (p.id === id ? { ...p, watered: now } : p))
    };
  } else if (action === 'pick') {
    city.garden = {
      ...garden,
      bouquet: garden.plants.find((p) => p.id === id).flower,
      plants: others
    };
  } else {
    city.garden = {
      ...garden,
      displays: [...garden.displays.filter((d) => d.id !== id), { id, flower: garden.bouquet }],
      bouquet: null
    };
  }
  return true;
}
