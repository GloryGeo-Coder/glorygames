import { advanceAvatar, blockingBrick, size, validPiece } from './model.mjs';
import {
  BLOCKS,
  CENTRE,
  HALF,
  blockAt,
  blockIndex,
  streetKeys,
  streetSegment
} from './settlement.mjs';
import { CITY_PLANS } from './city-plans.mjs';
import { placement, KIOSK } from './blueprint.mjs';

const DIRECTIONS = ['south', 'east', 'north', 'west'];
const NORMALS = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0]
];
export const isEntrance = (p) => p && ['door', 'arch'].includes(p.type) && p.y <= 0.365;
const separation = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
// Outer streets straddle the map boundary. Walk through the inner half of those corridors.
const laneCoord = (n) => Math.max(-HALF + 0.5, Math.min(HALF - 0.5, n));
export function entrance(p) {
  const b = blockAt(p.x, p.z),
    a = size(p),
    x = p.x + a.w / 2,
    z = p.z + a.d / 2,
    [nx, nz] = NORMALS[p.r];
  const street = streetKeys(b)[DIRECTIONS[p.r]],
    s = streetSegment(street);
  return {
    block: b,
    street,
    center: { x, z },
    inside: { x: x - nx * 1.5, z: z - nz * 1.5 },
    direction: DIRECTIONS[p.r],
    curb: { x: nx ? laneCoord(s.x) : x, z: nz ? laneCoord(s.z) : z }
  };
}
export function newTrip(home, shop) {
  if (!isEntrance(home) || !isEntrance(shop) || home.id === shop.id)
    throw Error('Choose two different ground-floor entrances.');
  return {
    home: home.id,
    shop: shop.id,
    phase: 'leave',
    returning: false,
    paused: false,
    wait: 0,
    ...entrance(home).inside,
    y: home.y,
    vy: 0,
    grounded: true,
    heading: 0
  };
}
// Split the painted segments at the walker's current position and the destination curb.
// Shortest distance is measured along those segments, including partial first and last edges.
export function streetPath(streets, start, destination) {
  const nodes = new Map();
  const node = (x, z) => {
    const key = Math.round(x * 10000) + ',' + Math.round(z * 10000);
    if (!nodes.has(key)) nodes.set(key, { x, z, edges: [] });
    return nodes.get(key);
  };
  const at = node(start.x, start.z),
    end = node(destination.x, destination.z);
  for (const key of streets) {
    const s = streetSegment(key),
      horizontal = s.axis === 'h';
    const half = (horizontal ? s.w : s.d) / 2;
    const first = node(
      laneCoord(s.x - (horizontal ? half : 0)),
      laneCoord(s.z - (horizontal ? 0 : half))
    );
    const last = node(
      laneCoord(s.x + (horizontal ? half : 0)),
      laneCoord(s.z + (horizontal ? 0 : half))
    );
    const on = [first, last];
    for (const v of [at, end]) {
      if (
        Math.abs((horizontal ? v.z : v.x) - laneCoord(horizontal ? s.z : s.x)) < 0.035 &&
        Math.abs((horizontal ? v.x : v.z) - (horizontal ? s.x : s.z)) <= half + 0.035
      )
        on.push(v);
    }
    on.sort((a, b) => (horizontal ? a.x - b.x : a.z - b.z));
    for (let i = 1; i < on.length; i++)
      if (on[i] !== on[i - 1]) {
        on[i].edges.push(on[i - 1]);
        on[i - 1].edges.push(on[i]);
      }
  }
  if (!at.edges.length || !end.edges.length) return null;
  const pending = new Set([at]),
    distance = new Map([[at, 0]]),
    previous = new Map();
  while (pending.size) {
    let best;
    for (const n of pending) if (!best || distance.get(n) < distance.get(best)) best = n;
    if (best === end) {
      const path = [];
      for (let n = end; n !== at; n = previous.get(n)) path.unshift({ x: n.x, z: n.z });
      return path;
    }
    pending.delete(best);
    for (const next of best.edges) {
      const length = distance.get(best) + separation(best, next);
      if (length < (distance.get(next) ?? Infinity)) {
        distance.set(next, length);
        previous.set(next, best);
        pending.add(next);
      }
    }
  }
  return null;
}
export function tripRuntime() {
  return {
    items: null,
    doors: new Map(),
    streets: null,
    path: null,
    routeKey: '',
    stalled: 0,
    issue: '',
    blocker: null,
    moving: false
  };
}
export function advanceTrip(city, t, rt, dt) {
  rt.moving = false;
  if (t.paused || t.phase === 'done') return;
  if (rt.issue && rt.items === city.pieces && rt.observedStreets === city.streets) return;
  if (rt.items !== city.pieces || rt.observedStreets !== city.streets) {
    rt.issue = '';
    rt.blocker = null;
    rt.stalled = 0;
  }
  rt.observedStreets = city.streets;
  if (rt.items !== city.pieces) {
    rt.doors = new Map(city.pieces.filter(isEntrance).map((p) => [p.id, p]));
    rt.items = city.pieces;
    rt.routeKey = '';
  }
  const home = rt.doors.get(t.home),
    shop = rt.doors.get(t.shop);
  if (!home || !shop) {
    rt.issue =
      (!home ? 'Home' : 'Destination') +
      ' entrance missing. Restore the doorway or choose a new trip.';
    rt.blocker = null;
    return;
  }
  const from = entrance(t.returning ? shop : home),
    to = entrance(t.returning ? home : shop);
  if (t.phase === 'shopping') {
    t.wait = Math.max(0, t.wait - dt);
    if (t.wait === 0) {
      t.returning = true;
      t.phase = 'leave';
    }
    return;
  }
  let target;
  if (t.phase === 'street') {
    const key = [to.street, to.curb.x, to.curb.z, t.returning].join('/');
    if (rt.routeKey !== key || rt.streets !== city.streets) {
      rt.routeKey = key;
      rt.streets = city.streets;
      rt.path = city.streets.includes(to.street) ? streetPath(city.streets, t, to.curb) : null;
    }
    if (!rt.path) {
      rt.issue = city.streets.includes(to.street)
        ? 'No street connection to ' + to.block.code + '. Connect the entrance streets on the map.'
        : 'Missing ' + to.direction + ' street at ' + to.block.code + '. Add it on the map.';
      rt.blocker = null;
      return;
    }
    if (!rt.path.length) {
      t.phase = 'door';
      rt.issue = '';
      rt.routeKey = '';
      return;
    }
    target = rt.path[0];
  } else if (t.phase === 'leave') target = from.center;
  else if (t.phase === 'approach') target = from.curb;
  else if (t.phase === 'door') target = to.center;
  else target = to.inside;
  const d = separation(t, target);
  if (d <= 0.012) {
    // The move to the next waypoint always goes through the same collision step as the player.
    rt.issue = '';
    rt.blocker = null;
    rt.stalled = 0;
    if (t.phase === 'leave') t.phase = 'approach';
    else if (t.phase === 'approach') {
      if (!city.streets.includes(from.street)) {
        rt.issue =
          'Missing ' +
          DIRECTIONS[(t.returning ? shop : home).r] +
          ' street at ' +
          from.block.code +
          '. Add it on the map.';
        return;
      }
      t.phase = 'street';
      rt.routeKey = '';
    } else if (t.phase === 'street') rt.path.shift();
    else if (t.phase === 'door') t.phase = 'enter';
    else if (t.phase === 'enter') {
      t.phase = t.returning ? 'done' : 'shopping';
      if (t.returning && t.routine) t.routine.visits++;
      t.wait = t.returning ? 0 : 1.5;
    }
    return;
  }
  const dx = (target.x - t.x) / d,
    dz = (target.z - t.z) / d,
    speed = Math.min(0.65, d / (3.8 * dt));
  const old = { x: t.x, z: t.z };
  advanceAvatar(t, 'city', city.pieces, dx * speed, dz * speed, false, dt);
  rt.moving = separation(t, old) > 0.0001;
  if (rt.moving) {
    rt.stalled = 0;
    rt.issue = '';
    rt.blocker = null;
  } else if ((rt.stalled += dt) > 0.25) {
    rt.issue =
      'Path blocked in ' + blockAt(t.x, t.z).code + '. Move the obstruction to reopen the walkway.';
    rt.blocker = blockingBrick(t, blockIndex(city.pieces)[blockAt(t.x, t.z).id], dx, dz);
  }
}
export function practiceSpaza(city) {
  const b = BLOCKS[CENTRE + 1];
  const group = placement(KIOSK, { x: b.x - 6, z: b.z + 4 }, 3, false, city.pieces, 'city');
  const barrier = { type: 'single', color: 'Plum', r: 0, x: b.x - 7, z: b.z + 6, y: 0 };
  if (!group.ok || !validPiece(barrier, city.pieces, null, 'city')) return null;
  return [...group.pieces, barrier];
}

export function practiceHallTrip(city) {
  const houseBlock = BLOCKS[CENTRE - 1],
    hallBlock = BLOCKS[CENTRE + 8];
  const house = placement(
    CITY_PLANS[0],
    { x: houseBlock.x + 1, z: houseBlock.z - 3 },
    1,
    false,
    city.pieces,
    'city'
  );
  const hall = placement(
    CITY_PLANS[1],
    { x: hallBlock.x - 2, z: hallBlock.z + 1 },
    2,
    false,
    city.pieces,
    'city'
  );
  if (!house.ok || !hall.ok) return null;
  return [...house.pieces, ...hall.pieces];
}
