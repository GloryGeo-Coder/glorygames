import { HALF, PITCH, streetSegment } from './settlement.mjs';

export const PAVEMENT_OFFSET = 1.5;
const EPSILON = 0.035;
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const inside = (p) => Math.abs(p.x) <= HALF - 0.3 && Math.abs(p.z) <= HALF - 0.3;
// Choose the side of the road belonging to the entrance's own block.
export function pavementCurb(front) {
  const s = streetSegment(front.street), p = { ...front.curb };
  if (s.axis === 'h') p.z = s.z + Math.sign(front.block.z - s.z) * PAVEMENT_OFFSET;
  else p.x = s.x + Math.sign(front.block.x - s.x) * PAVEMENT_OFFSET;
  return p;
}

// This is separate from the road-centre graph used by deliveries and map planning.
// Every edge is orthogonal: pavement runs join at corners, and road crossings are
// restricted to those corners rather than cutting diagonally across junctions.
export function pedestrianPath(streets, start, destination) {
  const nodes = new Map(), edges = [], junctions = new Map(), o = PAVEMENT_OFFSET;
  const node = (x, z) => {
    const key = `${Math.round(x * 10000)},${Math.round(z * 10000)}`;
    if (!nodes.has(key)) nodes.set(key, { x, z, edges: [] });
    return nodes.get(key);
  };
  const edge = (a, b, crossing = false) => {
    if (!inside(a) || !inside(b) || distance(a, b) < 0.00001) return;
    edges.push({ a, b, crossing });
  };
  const junction = (x, z, arm) => {
    const key = `${x},${z}`;
    if (!junctions.has(key)) junctions.set(key, { x, z, arms: new Set() });
    junctions.get(key).arms.add(arm);
  };
  for (const key of new Set(streets)) {
    const s = streetSegment(key), h = s.axis === 'h';
    if (h) {
      const x0 = s.x - PITCH / 2, x1 = s.x + PITCH / 2;
      junction(x0, s.z, 'east'); junction(x1, s.z, 'west');
      for (const sign of [-1, 1]) edge(node(x0 + o, s.z + sign * o), node(x1 - o, s.z + sign * o));
    } else {
      const z0 = s.z - PITCH / 2, z1 = s.z + PITCH / 2;
      junction(s.x, z0, 'north'); junction(s.x, z1, 'south');
      for (const sign of [-1, 1]) edge(node(s.x + sign * o, z0 + o), node(s.x + sign * o, z1 - o));
    }
  }
  for (const { x, z, arms } of junctions.values()) {
    for (const sign of [-1, 1]) {
      edge(node(x - o, z + sign * o), node(x + o, z + sign * o), arms.has(sign > 0 ? 'north' : 'south'));
      edge(node(x + sign * o, z - o), node(x + sign * o, z + o), arms.has(sign > 0 ? 'east' : 'west'));
    }
  }
  const project = (p, e) => {
    const horizontal = Math.abs(e.a.z - e.b.z) < EPSILON;
    return horizontal
      ? { x: Math.max(Math.min(e.a.x, e.b.x), Math.min(Math.max(e.a.x, e.b.x), p.x)), z: e.a.z }
      : { x: e.a.x, z: Math.max(Math.min(e.a.z, e.b.z), Math.min(Math.max(e.a.z, e.b.z), p.z)) };
  };
  // New trips start on the pavement. Older saves can be on the former centreline:
  // add a short collision-stepped connector, never replace their saved position.
  const attach = (p, legacy = false) => {
    let best;
    for (const e of edges) {
      const q = project(p, e), d = distance(p, q);
      if ((!best || d < best.d - 0.00001) && d <= (legacy ? o + EPSILON : EPSILON) &&
          (Math.abs(p.x - q.x) < EPSILON || Math.abs(p.z - q.z) < EPSILON)) best = { e, q, d };
    }
    return best;
  };
  const a = attach(start, true), b = attach(destination);
  if (!a || !b) return null;
  const first = node(a.q.x, a.q.z), last = node(b.q.x, b.q.z);
  for (const e of edges) {
    const parts = [e.a, e.b];
    for (const p of [first, last]) if (distance(project(p, e), p) < 0.0001) parts.push(p);
    parts.sort((p, q) => Math.abs(e.a.x - e.b.x) > EPSILON ? p.x - q.x : p.z - q.z);
    for (let i = 1; i < parts.length; i++) {
      const u = parts[i - 1], v = parts[i];
      if (u === v) continue;
      u.edges.push({ to: v, crossing: e.crossing }); v.edges.push({ to: u, crossing: e.crossing });
    }
  }
  const pending = new Set([first]), lengths = new Map([[first, 0]]), previous = new Map();
  while (pending.size) {
    let at;
    for (const candidate of pending) if (!at || lengths.get(candidate) < lengths.get(at)) at = candidate;
    if (at === last) {
      const points = [];
      for (let n = last; n !== first;) {
        const hop = previous.get(n);
        points.unshift({ x: n.x, z: n.z, ...(hop.crossing ? { crossing: true } : {}) }); n = hop.from;
      }
      if (a.d > 0.0001) points.unshift({ x: first.x, z: first.z });
      return points;
    }
    pending.delete(at);
    for (const hop of at.edges) {
      const length = lengths.get(at) + distance(at, hop.to);
      if (length < (lengths.get(hop.to) ?? Infinity)) {
        lengths.set(hop.to, length); previous.set(hop.to, { from: at, crossing: hop.crossing }); pending.add(hop.to);
      }
    }
  }
  return null;
}
