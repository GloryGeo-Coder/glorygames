import { advanceAvatar } from './model.mjs';
import { blockAt, HALF, streetSegment } from './settlement.mjs';
import { namedDoors } from './street-directory.mjs';
import { traceStreets } from './resident-trip.mjs';

const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const length = (points) => points.slice(1).reduce((n, p, i) => n + distance(points[i], p), 0);
function nearApproach(person, front) {
  const a = front.curb,
    b = front.center,
    dx = b.x - a.x,
    dz = b.z - a.z;
  const t = ((person.x - a.x) * dx + (person.z - a.z) * dz) / (dx * dx + dz * dz || 1);
  return t >= 0 && t <= 1 && distance(person, { x: a.x + dx * t, z: a.z + dz * t }) <= 1.2;
}
const ground = (p) => ({ ...p, y: p.y || 0 });
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// Probe only building approaches, using the same body, step height and collision as Play.
// Laid street corridors cannot contain placed bricks and already have level ground.
export function checkWalk(city, start, targets) {
  const probe = { ...ground(start), vy: 0, grounded: true, heading: 0 },
    points = [ground(start)];
  for (const target of targets) {
    let remaining = distance(probe, target),
      count = 0;
    while (remaining > 0.01 && count++ < 600) {
      const dx = (target.x - probe.x) / remaining,
        dz = (target.z - probe.z) / remaining,
        step = Math.min(0.19, remaining),
        x = probe.x + dx * step,
        z = probe.z + dz * step;
      advanceAvatar(probe, 'city', city.pieces, dx, dz, false, step / 3.8);
      if (Math.hypot(probe.x - x, probe.z - z) > 0.025 || probe.y < -0.1) {
        points.push({ x: probe.x, y: probe.y, z: probe.z });
        return { clear: false, points };
      }
      if (distance(points.at(-1), probe) >= 0.75)
        points.push({ x: probe.x, y: probe.y, z: probe.z });
      remaining = distance(probe, target);
    }
    points.push({ x: probe.x, y: probe.y, z: probe.z });
    if (remaining > 0.01) return { clear: false, points };
  }
  return { clear: true, points };
}
export function walkingRoute(city, person) {
  const target = city.directions && namedDoors(city).get(city.directions.id);
  if (!target)
    return {
      state: 'missing',
      points: [],
      hint: 'Restore the destination entrance and its named street.'
    };
  const address = target.address,
    front = target.front;
  if (!Number.isFinite(person.y) || person.y > 0.73 || person.y < -0.1)
    return {
      state: 'start',
      address,
      points: [],
      hint: 'Return to ground level to follow walking directions.'
    };
  const ownBlock = blockAt(person.x, person.z);
  if (ownBlock.id === front.block.id) {
    const direct = checkWalk(city, person, [front.inside]);
    if (direct.clear && Math.abs(direct.points.at(-1).y - front.y) < 0.55) {
      const arrived = distance(person, front.inside) <= 0.65 && Math.abs(person.y - front.y) < 0.55;
      return {
        state: arrived ? 'arrived' : 'walking',
        address,
        points: direct.points,
        hint: arrived ? 'You have arrived.' : 'Follow the teal markers to the entrance.'
      };
    }
  }
  const candidates = [];
  for (const key of city.streets) {
    const s = streetSegment(key),
      x = clamp(clamp(person.x, s.x - s.w / 2, s.x + s.w / 2), -HALF + 0.5, HALF - 0.5),
      z = clamp(clamp(person.z, s.z - s.d / 2, s.z + s.d / 2), -HALF + 0.5, HALF - 0.5),
      curb =
        s.axis === 'h'
          ? { x, z: clamp(s.z, -HALF + 0.5, HALF - 0.5) }
          : { x: clamp(s.x, -HALF + 0.5, HALF - 0.5), z };
    if (distance(person, curb) <= 2.3) candidates.push({ curb, approach: [curb] });
  }
  for (const door of namedDoors(city).values()) {
    const f = door.front;
    if (f.block.id !== ownBlock.id) continue;
    if (nearApproach(person, f)) candidates.push({ curb: f.curb, approach: [f.curb] });
    else if (distance(person, f.inside) <= 4)
      candidates.push({ curb: f.curb, approach: [f.inside, f.center, f.curb] });
  }
  const routes = [];
  for (const c of candidates) {
    const road = traceStreets(city.streets, c.curb, front.curb);
    if (!road) continue;
    const prefix = checkWalk(city, person, c.approach);
    if (!prefix.clear) continue;
    const points = [...prefix.points, ...road.points.map(ground)];
    routes.push({ points, cost: length(points) });
  }
  routes.sort((a, b) => a.cost - b.cost);
  if (!routes.length)
    return {
      state: candidates.length ? 'disconnected' : 'start',
      address,
      points: [],
      hint: candidates.length
        ? 'No clear street route. Check the street connection and your way out to the pavement.'
        : 'Walk onto a laid street or near a named doorway to start directions.'
    };
  const final = checkWalk(city, { ...front.curb, y: 0 }, [front.center, front.inside]),
    points = [...routes[0].points, ...final.points.slice(1)],
    clear = final.clear && Math.abs(final.points.at(-1).y - front.y) < 0.55;
  return {
    state: clear ? 'walking' : 'blocked',
    address,
    points,
    hint: clear
      ? 'Follow the teal markers to the entrance.'
      : 'Entrance approach blocked. Move the obstruction in Build, then continue.'
  };
}
// Routes are recalculated after a meaningful move or any construction edit, not each frame.
export function directionTracker() {
  let observed, anchor, result;
  return (city, person) => {
    const signature = [city.pieces, city.streets, city.streetNames, city.blocks, city.directions];
    if (
      !result ||
      signature.some((v, i) => v !== observed[i]) ||
      distance(anchor, person) >= 1 ||
      Math.abs(anchor.y - person.y) > 0.4 ||
      (result.state !== 'arrived' &&
        result.points.length &&
        distance(person, result.points.at(-1)) < 0.65)
    ) {
      observed = signature;
      anchor = { ...person };
      result = walkingRoute(city, person);
    }
    return result;
  };
}
