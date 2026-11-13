import { restoreCompanionPath } from './citizen-appearance.mjs';
import { restoreDailyMarket } from './daily-market-save.mjs';
import { restoreShopkeeper } from './shopkeeper-save.mjs';
import { restoreShopStock } from './shop-stock.mjs';
import { restoreTransport } from './transport.mjs';
import { CITY_PLANS } from './city-plans.mjs';
import { restoreGarden } from './community-garden.mjs';
// Each block has a 20-stud building area and a shared four-stud street corridor.
export const SIDE = 8,
  PITCH = 24,
  HALF = (SIDE * PITCH) / 2,
  LOT = 20;
export const ZONES = {
  mixed: { name: 'Mixed use', color: '#e4c995' },
  homes: { name: 'Residential', color: '#e7bfa3' },
  shops: { name: 'Commercial', color: '#e7cf88' },
  civic: { name: 'Civic', color: '#afd0cb' },
  park: { name: 'Park', color: '#a5c68c' }
};
export const BLOCKS = Array.from({ length: SIDE * SIDE }, (_, id) => {
  const col = id % SIDE,
    row = Math.floor(id / SIDE);
  return {
    id,
    col,
    row,
    code: String.fromCharCode(65 + col) + (row + 1),
    x: -HALF + (col + 0.5) * PITCH,
    z: HALF - (row + 0.5) * PITCH
  };
});
export const CENTRE = 27;
export function blockAt(x, z) {
  const clamp = (n) => Math.max(0, Math.min(SIDE - 1, Math.floor(n)));
  return BLOCKS[clamp((HALF - z) / PITCH) * SIDE + clamp((x + HALF) / PITCH)];
}
export function fitsBlock(x, z, w, d) {
  const b = blockAt(x, z);
  return (
    x >= b.x - LOT / 2 && z >= b.z - LOT / 2 && x + w <= b.x + LOT / 2 && z + d <= b.z + LOT / 2
  );
}
export function blockInfo(city, b) {
  const info = city.blocks[b.id];
  return info?.zone ? info : { name: '', zone: 'mixed', ...info };
}
export function streetKeys(b) {
  return {
    north: 'h-' + b.col + '-' + b.row,
    south: 'h-' + b.col + '-' + (b.row + 1),
    west: 'v-' + b.col + '-' + b.row,
    east: 'v-' + (b.col + 1) + '-' + b.row
  };
}
export function streetSegment(key) {
  const [axis, cs, rs] = key.split('-'),
    c = Number(cs),
    r = Number(rs);
  const x = -HALF + c * PITCH,
    z = HALF - r * PITCH;
  return axis === 'h'
    ? { x: x + PITCH / 2, z, w: PITCH, d: 4, axis }
    : { x, z: z - PITCH / 2, w: 4, d: PITCH, axis };
}
const streetSet = new Set(BLOCKS.flatMap((b) => Object.values(streetKeys(b))));
export function cityWorld() {
  const b = BLOCKS[CENTRE],
    pieces = CITY_PLANS[0].pieces.map((p, i) => ({
      ...p,
      id: 'town-house-' + i,
      x: p.x + b.x + 3,
      z: p.z + b.z + 1
    }));
  const garden = BLOCKS[CENTRE + 1];
  pieces.push(
    ...CITY_PLANS[3].pieces.map((p, i) => ({
      ...p,
      id: 'town-park-' + i,
      x: p.x + garden.x - 6,
      z: p.z + garden.z - 3
    }))
  );
  return {
    version: 1,
    name: 'My settlement',
    pieces,
    complete: false,
    focus: CENTRE,
    blocks: {
      [CENTRE]: { name: 'Town Centre', zone: 'mixed' },
      [garden.id]: { name: 'Pocket Gardens', zone: 'park' }
    },
    streets: Object.values(streetKeys(b))
  };
}
// Keep the original resident slot readable by settlements saved before the second household.
export const HOUSEHOLDS = [
  { key: 'resident', name: 'Lebo', destination: 'Spaza', activity: 'Shopping' },
  {
    key: 'neighbour',
    name: 'Naledi',
    destination: 'Community hall',
    activity: 'Visiting the hall'
  }
];
// Stable slots keep earlier saves readable and bound the number of simultaneous walkers on phones.
export const MOVE_IN_SLOTS = Array.from({ length: 6 }, (_, i) => 'family' + (i + 1));
export const VISITS = {
  spaza: { destination: 'Spaza', activity: 'Shopping' },
  hall: { destination: 'Community hall', activity: 'Visiting the hall' },
  park: { destination: 'Park bench', activity: 'Resting in the park' }
};
export const PARK_REST_SECONDS = 6;
const directoryCache = new WeakMap();
export function householdsFor(city) {
  if (!city?.members?.length) return HOUSEHOLDS;
  let roster = directoryCache.get(city.members);
  if (!roster) {
    roster = [
      ...HOUSEHOLDS,
      ...city.members.map((member) => ({
        ...member,
        ...VISITS[member.visit]
      }))
    ];
    directoryCache.set(city.members, roster);
  }
  return roster;
}
export function homeClaimed(city, home, except) {
  return householdsFor(city).some((p) => p.key !== except && city[p.key]?.home === home);
}
export function moveInProblem(city, name) {
  if (!MOVE_IN_SLOTS.some((key) => !city[key]))
    return 'All six additional households have moved in.';
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 28)
    return 'Enter a name of 1–28 characters.';
  if (householdsFor(city).some((p) => p.name.toLowerCase() === name.trim().toLowerCase()))
    return 'Choose a different resident name.';
  return '';
}
export function moveIn(city, name, visit, trip, key = MOVE_IN_SLOTS.find((k) => !city[k]), appearance = {}) {
  if (
    moveInProblem(city, name) ||
    !MOVE_IN_SLOTS.includes(key) ||
    city[key] ||
    !Object.hasOwn(VISITS, visit) ||
    (visit === 'park') !== (trip?.park === true) ||
    !trip?.home ||
    !trip.shop ||
    trip.home === trip.shop ||
    homeClaimed(city, trip.home, key)
  )
    return null;
  const family = visit === 'park' && appearance?.family === true;
  const childName = typeof appearance?.childName === 'string' && appearance.childName.trim().length > 0 && appearance.childName.trim().length <= 28
    ? appearance.childName.trim() : 'Mpho';
  city.members = [...(city.members || []), { key, name: name.trim(), visit,
    ...(family ? { family: true, childName } : {}) }];
  city[key] = trip;
  return householdsFor(city).find((p) => p.key === key);
}
export function endHousehold(city, key) {
  if (!householdsFor(city).some((p) => p.key === key)) return;
  delete city[key];
  if (MOVE_IN_SLOTS.includes(key)) {
    city.members = city.members.filter((m) => m.key !== key);
    if (!city.members.length) delete city.members;
  }
}
export function restoreTrip(v) {
  if (
    !v ||
    !['leave', 'approach', 'street', 'door', 'enter', 'shopping', 'done'].includes(v.phase) ||
    typeof v.home !== 'string' ||
    typeof v.shop !== 'string' ||
    v.home === v.shop ||
    ![v.x, v.y, v.z, v.heading, v.vy, v.wait].every(Number.isFinite) ||
    Math.abs(v.x) > HALF ||
    Math.abs(v.z) > HALF
  )
    return null;
  const { home, shop, phase, x, y, z, heading, vy } = v;
  const routine = restoreRoutine(v.routine);
  return {
    home,
    shop,
    phase,
    x,
    y,
    z,
    heading,
    vy,
    ...(v.park === true ? { park: true } : {}),
    ...(v.park === true && restoreCompanionPath(v.companionPath, v)
      ? { companionPath: restoreCompanionPath(v.companionPath, v) } : {}),
    wait: Math.max(0, Math.min(v.park === true ? PARK_REST_SECONDS : 1.5, v.wait)),
    ...(routine ? { routine } : {}),
    grounded: v.grounded === true,
    paused: v.paused === true,
    returning: v.returning === true
  };
}
export const DEPARTURES = [8, 14, 18];
export function restoreRoutine(value) {
  if (!DEPARTURES.includes(value?.hour)) return null;
  return {
    hour: value.hour,
    visits: Number.isSafeInteger(value.visits) && value.visits >= 0 ? value.visits : 0
  };
}
export const MAX_TRAIL_STOPS = 5;
export function restoreTrail(value) {
  if (
    typeof value?.name !== 'string' ||
    !value.name.trim() ||
    value.name.trim().length > 32 ||
    !Array.isArray(value.stops) ||
    value.stops.length < 2 ||
    value.stops.length > MAX_TRAIL_STOPS
  )
    return null;
  const stops = [];
  for (const stop of value.stops) {
    if (
      typeof stop?.door !== 'string' ||
      !stop.door ||
      typeof stop.label !== 'string' ||
      !stop.label.trim() ||
      stop.label.trim().length > 28 ||
      stops.some((s) => s.door === stop.door)
    )
      return null;
    stops.push({ door: stop.door, label: stop.label.trim() });
  }
  const stamps = Number.isInteger(value.stamps)
    ? Math.max(0, Math.min(value.stamps, stops.length))
    : 0;
  return { name: value.name.trim(), stops, stamps };
}
export function restoreMarket(value) {
  if (typeof value?.shop !== 'string' || !value.shop || !Array.isArray(value.receipts)) return null;
  const receipts = [];
  for (const row of value.receipts) {
    if (
      !row ||
      typeof row.name !== 'string' ||
      !row.name.trim() ||
      row.name.length > 28 ||
      typeof row.home !== 'string' ||
      !row.home
    )
      continue;
    if (
      receipts.some(
        (r) => r.home === row.home || r.name.toLowerCase() === row.name.trim().toLowerCase()
      )
    )
      continue;
    receipts.push({
      name: row.name.trim(),
      home: row.home,
      block: BLOCKS.some((b) => b.code === row.block) ? row.block : ''
    });
    if (receipts.length === 2) break;
  }
  const keeper = value.supplied === true && restoreShopkeeper(value.keeper);
  const daily = value.supplied === true && restoreDailyMarket(value.daily);
  if (daily) daily.served = Math.max(daily.served, receipts.length);
  return {
    shop: value.shop,
    receipts,
    ...(value.supplied === true ? { supplied: true } : {}),
    ...(keeper ? { keeper } : {}),
    ...(daily ? { daily } : {})
  };
}
export const MAX_LETTERS = 3;
function restoreAddress(value) {
  if (
    typeof value?.id !== 'string' ||
    !value.id ||
    typeof value.address !== 'string' ||
    !value.address.trim()
  )
    return null;
  return { id: value.id, address: value.address.slice(0, 96) };
}
export function restorePost(value) {
  const office = restoreAddress(value?.office);
  if (
    !office ||
    !Array.isArray(value.stops) ||
    !value.stops.length ||
    value.stops.length > MAX_LETTERS
  )
    return null;
  const ids = new Set([office.id]),
    stops = [];
  for (const row of value.stops) {
    const stop = restoreAddress(row);
    if (!stop || ids.has(stop.id)) return null;
    ids.add(stop.id);
    stops.push({ ...stop, delivered: row.delivered === true });
  }
  return { office, stops, complete: value.complete === true && stops.every((s) => s.delivered) };
}
export function retainedStreetNames(names, streets) {
  if (!names || typeof names !== 'object' || Array.isArray(names)) return undefined;
  const kept = {};
  for (const key of streets) {
    const name = Object.hasOwn(names, key) && names[key];
    if (typeof name === 'string' && name.trim() && name.trim().length <= 32)
      kept[key] = name.trim();
  }
  return Object.keys(kept).length ? kept : undefined;
}
export function cityLayout(v) {
  const blocks = {};
  for (const b of BLOCKS) {
    const info = v.blocks?.[b.id];
    if (!info) continue;
    const neighbourhood =
      typeof info.neighbourhood === 'string' && info.neighbourhood.trim().length <= 32
        ? info.neighbourhood.trim()
        : '';
    // A boundary can exist before the player gives the block a name or land use.
    if (neighbourhood && info.name === undefined && info.zone === undefined) {
      blocks[b.id] = { neighbourhood };
      continue;
    }
    if (typeof info.name !== 'string' || !Object.hasOwn(ZONES, info.zone))
      throw Error('Invalid city block');
    blocks[b.id] = { name: info.name.slice(0, 32), zone: info.zone };
    if (neighbourhood) blocks[b.id].neighbourhood = neighbourhood;
  }
  if (!Array.isArray(v.streets) || v.streets.some((k) => !streetSet.has(k)))
    throw Error('Invalid street');
  const households = {};
  for (const { key } of HOUSEHOLDS) {
    const trip = restoreTrip(v[key]);
    if (trip) households[key] = trip;
  }
  if (Array.isArray(v.members)) {
    for (const member of v.members) {
      if (!MOVE_IN_SLOTS.includes(member?.key)) continue;
      moveIn(households, member.name, member.visit, restoreTrip(v[member.key]), member.key, member);
    }
  }
  const streetNames = retainedStreetNames(v.streetNames, v.streets);
  const post = restorePost(v.post);
  const directions = restoreAddress(v.directions);
  const garden = restoreGarden(v.garden, v.pieces);
  const trail = restoreTrail(v.trail);
  const market = restoreMarket(v.market);
  const shopStock = restoreShopStock(v.shopStock);
  return {
    ...(streetNames ? { streetNames } : {}),
    ...(garden ? { garden } : {}),
    ...(post ? { post } : {}),
    ...(directions ? { directions } : {}),
    ...(trail ? { trail } : {}),
    ...(market ? { market } : {}),
    ...(shopStock ? { shopStock } : {}),
    ...(['night', 'day'].includes(v.lighting) ? { lighting: v.lighting } : {}),
    ...(Number.isFinite(v.clockMinutes) &&
    v.clockMinutes >= 0 &&
    v.clockMinutes < Number.MAX_SAFE_INTEGER / 2
      ? { clockMinutes: v.clockMinutes }
      : {}),
    blocks,
    ...households,
    ...(restoreTransport(v.transport) ? { transport: restoreTransport(v.transport) } : {}),
    focus: Number.isInteger(v.focus) && BLOCKS[v.focus] ? v.focus : CENTRE,
    streets: [...new Set(v.streets)]
  };
}
export function layoutEdit(city, b, name, zone, edges) {
  const info = { ...blockInfo(city, b), name: name.trim().slice(0, 32), zone };
  const blocks = { ...city.blocks, [b.id]: info };
  const streets = new Set(city.streets);
  for (const [dir, key] of Object.entries(streetKeys(b))) {
    if (edges.includes(dir)) streets.add(key);
    else streets.delete(key);
  }
  return {
    blocks,
    streets: [...streets],
    ...(city.streetNames ? { streetNames: retainedStreetNames(city.streetNames, streets) } : {}),
    focus: b.id
  };
}
export function spawnAt(b) {
  return { x: b.x + 0.5, y: 0, z: b.z - LOT / 2 - 1 };
}
const indexCache = new WeakMap();
export function blockIndex(items) {
  let index = indexCache.get(items);
  if (!index) {
    index = Array.from({ length: BLOCKS.length }, () => []);
    for (const p of items) index[blockAt(p.x, p.z).id].push(p);
    indexCache.set(items, index);
  }
  return index;
}
export const neighbouring = (a, b) => Math.abs(a.col - b.col) <= 1 && Math.abs(a.row - b.row) <= 1;
// A single storage write commits layout and bricks together; tuples avoid repeating field names across the city.
export function citySave(city) {
  return JSON.stringify({
    ...city,
    garden: restoreGarden(city.garden, city.pieces),
    pieces: city.pieces.map((p) => [p.id, p.type, p.color, p.x, p.y, p.z, p.r])
  });
}
export function unpackBrick(row) {
  if (!Array.isArray(row) || row.length !== 7) throw Error('Invalid city brick');
  const [id, type, color, x, y, z, r] = row;
  return { id, type, color, x, y, z, r };
}
