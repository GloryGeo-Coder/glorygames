import { pedestrianPath, pavementCurb } from './pedestrian-route.mjs';
import { queuePosition, queueCanEnter } from './entrance-queue.mjs';
import { advanceAvatar, blockingBrick, intervals, size, validPiece } from './model.mjs';
import {
  BLOCKS,
  CENTRE,
  HALF,
  PITCH,
  blockAt,
  blockIndex,
  blockInfo,
  householdsFor,
  PARK_REST_SECONDS,
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
export function isParkBench(city, p) {
  return p?.type === 'bench' && p.y <= 0.365 && blockInfo(city, blockAt(p.x, p.z)).zone === 'park';
}
const benchFronts = new WeakMap();
function benchFront(p) {
  if (benchFronts.has(p)) return benchFronts.get(p);
  const front = entrance(p),
    [nx, nz] = NORMALS[p.r];
  // Leave the centre of the bench free for a bouquet.
  const x = front.center.x - nz * 0.72,
    z = front.center.z + nx * 0.72;
  const result = {
    ...front,
    groundY: p.y,
    curb: { x: front.curb.x - nz * 0.72, z: front.curb.z + nx * 0.72 },
    center: { x: x + nx * 1.7, z: z + nz * 1.7 },
    inside: { x: x + nx * 0.89, z: z + nz * 0.89 },
    seat: {
      x: x + nx * 0.23,
      y: p.y + size(p).h - 0.55,
      z: z + nz * 0.23,
      heading: Math.atan2(nx, nz)
    }
  };
  benchFronts.set(p, result);
  return result;
}
const fixtureCache = new WeakMap();
function fixtures(city) {
  let map = fixtureCache.get(city.pieces);
  if (!map) {
    map = new Map(
      city.pieces.filter((p) => isEntrance(p) || p.type === 'bench').map((p) => [p.id, p])
    );
    fixtureCache.set(city.pieces, map);
  }
  return map;
}
export function visitFront(city, p, park = false) {
  if (park) return isParkBench(city, p) ? benchFront(p) : null;
  return isEntrance(p) ? entrance(p) : null;
}
const seatClearance = new WeakMap();
function seatBlocker(city, front) {
  let cache = seatClearance.get(city.pieces);
  if (!cache) {
    cache = new Map();
    seatClearance.set(city.pieces, cache);
  }
  if (!cache.has(front)) {
    const { x, y, z } = front.seat;
    const brick = blockIndex(city.pieces)[front.block.id].find((p) =>
      [
        [0, 0],
        [0.19, 0],
        [-0.19, 0],
        [0, 0.19],
        [0, -0.19]
      ].some(([dx, dz]) =>
        intervals(p, x + dx, z + dz).some(([lo, hi]) => lo < y + 1.55 && hi > y + 0.56)
      )
    );
    cache.set(front, brick?.id || null);
  }
  return cache.get(front);
}
export function restingSeat(city, trip) {
  if (!trip?.park || trip.phase !== 'shopping') return null;
  const front = visitFront(city, fixtures(city).get(trip.shop), true);
  return front &&
    separation(trip, front.inside) <= 0.025 &&
    Math.abs(trip.y - front.groundY) <= 0.65 &&
    !seatBlocker(city, front)
    ? front.seat
    : null;
}
export function newTrip(home, shop, city) {
  const park = !!city && isParkBench(city, shop);
  if (!isEntrance(home) || (!park && !isEntrance(shop)) || home.id === shop.id)
    throw Error('Choose a home entrance and a different valid destination.');
  return {
    ...(park ? { park: true } : {}),
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
  return traceStreets(streets, start, destination)?.points ?? null;
}
// The planner can also search unbuilt sections. A new section costs more than an entire city route.
export function traceStreets(streets, start, destination, existing = null) {
  const penalty = (streets.length + 1) * PITCH;
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
        on[i].edges.push({ to: on[i - 1], key });
        on[i - 1].edges.push({ to: on[i], key });
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
      const points = [],
        sections = [];
      for (let n = end; n !== at;) {
        points.unshift({ x: n.x, z: n.z });
        const edge = previous.get(n);
        sections.unshift(edge.key);
        n = edge.from;
      }
      return { points, sections };
    }
    pending.delete(best);
    for (const { to: next, key } of best.edges) {
      const length =
        distance.get(best) +
        separation(best, next) +
        (existing && !existing.has(key) ? penalty : 0);
      if (length < (distance.get(next) ?? Infinity)) {
        distance.set(next, length);
        previous.set(next, { from: best, key });
        pending.add(next);
      }
    }
  }
  return null;
}
export function tripRuntime() {
  return {
    items: null,
    observedBlocks: null,
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
  rt.waitingForSeat = false;
  rt.waitingForQueue = false;
  rt.waitingForCrossing = false;
  if (t.paused || t.phase === 'done') return;
  const edited =
    rt.items !== city.pieces ||
    rt.observedStreets !== city.streets ||
    (t.park && rt.observedBlocks !== city.blocks);
  if (rt.issue && !edited) return;
  if (edited) {
    rt.issue = '';
    rt.blocker = null;
    rt.stalled = 0;
    rt.routeKey = '';
    rt.items = city.pieces;
    rt.observedStreets = city.streets;
    rt.observedBlocks = city.blocks;
  }
  const stops = fixtures(city);
  let home = visitFront(city, stops.get(t.home)),
    destination = visitFront(city, stops.get(t.shop), t.park);
  if (home) home = { ...home, curb: pavementCurb(home) };
  if (destination) destination = { ...destination, curb: pavementCurb(destination) };
  if (!home || !destination) {
    rt.issue =
      home && t.park
        ? 'Park bench unavailable. Restore the ground-floor bench and Park land use, or choose another bench.'
        : (!home ? 'Home' : 'Destination') +
          ' entrance missing. Restore the doorway or choose a new trip.';
    rt.blocker = null;
    return;
  }
  const from = t.returning ? destination : home,
    to = t.returning ? home : destination;
  if (
    t.park &&
    !t.returning &&
    (t.phase === 'shopping' || (t.phase === 'enter' && separation(t, to.inside) <= 0.012))
  ) {
    const blocker = seatBlocker(city, destination);
    if (
      blocker ||
      (Math.abs(t.y - destination.groundY) > 0.65 && separation(t, to.inside) < 0.025)
    ) {
      rt.blocker = blocker;
      rt.issue = blocker
        ? 'The park seat is blocked. Move the brick above the bench.'
        : 'The bench needs a level approach. Clear the ground beside it.';
      return;
    }
  }
  if (t.phase === 'shopping') {
    if (t.park && separation(t, destination.inside) > 0.025) {
      t.phase = 'door';
      return;
    }
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
      rt.path = city.streets.includes(to.street) ? pedestrianPath(city.streets, t, to.curb) : null;
    }
    if (!rt.path) {
      rt.issue = city.streets.includes(to.street)
        ? 'No street connection to ' + to.block.code + '. Connect the entrance streets on the map.'
        : 'Missing ' + to.direction + ' street at ' + to.block.code + '. Add it on the map.';
      rt.blocker = null;
      return;
    }
    if (!rt.path.length) {
      t.phase = !t.returning && !t.park ? 'queue' : 'door';
      rt.issue = '';
      rt.routeKey = '';
      return;
    }
    target = rt.path[0];
  } else if (t.phase === 'queue') {
    target = queuePosition(city, t, to);
    rt.waitingForQueue = true;
  } else if (t.phase === 'queue-return') target = to.curb;
  else if (t.phase === 'leave') target = from.center;
  else if (t.phase === 'approach') target = from.curb;
  else if (t.phase === 'door') target = to.center;
  else target = to.inside;
  if (target.crossing) {
    const crossingKey = `${target.x},${target.z}`;
    if (rt.crossingKey !== crossingKey) { rt.crossingKey = crossingKey; rt.crossingWait = 0.4; }
    if (rt.crossingWait > 0) {
      rt.crossingWait = Math.max(0, rt.crossingWait - dt);
      rt.waitingForCrossing = true;
      return;
    }
  } else rt.crossingKey = '';
  const d = separation(t, target);
  if (d <= 0.012) {
    // The move to the next waypoint always goes through the same collision step as the player.
    rt.issue = '';
    rt.blocker = null;
    rt.stalled = 0;
    if (t.phase === 'queue') {
      if (queueCanEnter(city, t, to)) { t.phase = 'queue-return'; rt.waitingForQueue = false; }
    } else if (t.phase === 'queue-return') t.phase = 'door';
    else if (t.phase === 'leave') t.phase = 'approach';
    else if (t.phase === 'approach') {
      if (!city.streets.includes(from.street)) {
        rt.issue =
          'Missing ' + from.direction + ' street at ' + from.block.code + '. Add it on the map.';
        return;
      }
      t.phase = 'street';
      rt.routeKey = '';
    } else if (t.phase === 'street') rt.path.shift();
    else if (t.phase === 'door') t.phase = 'enter';
    else if (t.phase === 'enter') {
      // A second visitor waits at the approach until the first one stands up.
      if (
        t.park &&
        !t.returning &&
        householdsFor(city).some(({ key }) => {
          const other = city[key];
          return other !== t && other?.park && other.shop === t.shop && restingSeat(city, other);
        })
      ) {
        rt.waitingForSeat = true;
        return;
      }
      t.phase = t.returning ? 'done' : 'shopping';
      if (t.returning && t.routine) t.routine.visits++;
      t.wait = t.returning ? 0 : t.park ? PARK_REST_SECONDS : 1.5;
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
