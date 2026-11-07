// Hinge origins are on the two banks. Both the renderer and traffic tests use these pivots.
import { parts, size, supports, partFootprint, TYPES } from './model.mjs';

export const PIVOTS = { west: -3, east: 3 };
export const OPEN_ANGLE = (80 * Math.PI) / 180;
export const mountOf = (p) => (Object.hasOwn(PIVOTS, p.mount) ? p.mount : 'fixed');
export const hingeAngle = (side, angle) => (side === 'west' ? angle : side === 'east' ? -angle : 0);
export const canalState = () => ({ angle: 0, target: 0, traffic: 'ready', boatZ: -8, reason: '' });
export const canEditCanal = (s) =>
  s.angle === 0 && s.target === 0 && (s.traffic === 'ready' || s.traffic === 'done');

export function fitsLeaf(p) {
  const side = mountOf(p);
  if (side === 'fixed') return true;
  const { w, d, h } = size(p),
    start = side === 'west' ? -3 : 0;
  return p.x >= start && p.x + w <= start + 3 && p.z >= -2 && p.z + d <= 2 && p.y + h <= 4.001;
}
function onBearing(p) {
  const side = mountOf(p),
    x = side === 'west' ? -3 : 2;
  if (p.y > 0.002 || side === 'fixed') return false;
  return parts(p.type).some((part) => {
    if (part.y !== 0) return false;
    const r = partFootprint(p, part);
    return r.x < x + 1 && r.x + r.w > x && r.z < 1 && r.z + r.d > -1;
  });
}
export function attachmentIssue(items) {
  if (!items.some((p) => mountOf(p) !== 'fixed'))
    return 'Mount a deck on either coloured bearing first.';
  for (const side of ['west', 'east']) {
    const leaf = items.filter((p) => mountOf(p) === side);
    if (leaf.some((p) => !fitsLeaf(p))) return 'Keep each leaf on its half of the channel.';
    const attached = new Set(leaf.filter(onBearing));
    // A joining plate can connect two lower pieces from above.
    for (const p of attached)
      for (const other of leaf) {
        if (!attached.has(other) && (supports(p, other) || supports(other, p))) attached.add(other);
      }
    if (attached.size !== leaf.length)
      return 'Connect every ' + side + ' leaf brick to its bearing with overlapping studs.';
  }
  return '';
}
// The ferry is made from these same solids on screen: the cabin and beacon need headroom.
export const FERRY = [
  { name: 'Hull', x: -0.72, y: -1.76, z: -1.45, w: 1.44, h: 0.52, d: 2.9, color: '#238e92' },
  { name: 'Deck', x: -0.78, y: -1.24, z: -1.46, w: 1.56, h: 0.14, d: 2.92, color: '#f1d89a' },
  { name: 'Wheelhouse', x: -0.52, y: -1.1, z: -0.75, w: 1.04, h: 0.84, d: 1.15, color: '#d96c44' },
  { name: 'Canopy', x: -0.59, y: -0.26, z: -0.81, w: 1.18, h: 0.13, d: 1.27, color: '#fff2bc' },
  { name: 'Mast', x: -0.065, y: -0.13, z: -0.25, w: 0.13, h: 1.08, d: 0.13, color: '#385953' },
  { name: 'Beacon', x: -0.13, y: 0.95, z: -0.32, w: 0.26, h: 0.2, d: 0.26, color: '#ffbb38' }
];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => a.map((v, i) => v - b[i]);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
function solid(vertices) {
  const edges = [
    [0, 1],
    [0, 4],
    [1, 3],
    [2, 3]
  ].map(([a, b]) => sub(vertices[b], vertices[a]));
  const normals = [
    cross(edges[0], edges[1]),
    cross(edges[1], edges[2]),
    cross(edges[0], edges[2]),
    cross(edges[1], edges[3])
  ];
  return {
    vertices,
    edges,
    normals,
    min: [0, 1, 2].map((i) => Math.min(...vertices.map((v) => v[i]))),
    max: [0, 1, 2].map((i) => Math.max(...vertices.map((v) => v[i])))
  };
}
function corners(part, transform) {
  const vertices = [];
  for (const z of [0, 1])
    for (const y of [0, 1])
      for (const x of [0, 1]) {
        const high = part.detail === 'ramp' ? part.h * x : part.h;
        vertices.push(transform(part.x + part.w * x, part.y + high * y, part.z + part.d * z));
      }
  return solid(vertices);
}
function pieceSolids(p, angle) {
  const side = mountOf(p),
    pivot = PIVOTS[side] ?? 0;
  const theta = hingeAngle(side, angle),
    cos = Math.cos(theta),
    sin = Math.sin(theta);
  const { w, d } = TYPES[p.type];
  function transform(u, y, v) {
    const x = p.x + [u, d - v, w - u, v][p.r] - pivot;
    const z = p.z + [v, u, d - v, w - u][p.r];
    y += p.y;
    return [pivot + x * cos - y * sin, x * sin + y * cos, z];
  }
  return parts(p.type).map((part) => corners(part, transform));
}
function intersects(a, b) {
  if (a.min.some((v, i) => v >= b.max[i] - 0.00001 || b.min[i] >= a.max[i] - 0.00001)) return false;
  // Separating-axis test for the convex box/wedge parts: face normals and crossed edge directions.
  const axes = [...a.normals, ...b.normals];
  for (const ea of a.edges) for (const eb of b.edges) axes.push(cross(ea, eb));
  for (const axis of axes) {
    if (dot(axis, axis) < 1e-12) continue;
    const aa = a.vertices.map((v) => dot(v, axis)),
      bb = b.vertices.map((v) => dot(v, axis));
    if (Math.max(...aa) <= Math.min(...bb) + 1e-7 || Math.max(...bb) <= Math.min(...aa) + 1e-7)
      return false;
  }
  return true;
}
function ferrySolids(z) {
  return FERRY.map((part) => corners(part, (x, y, localZ) => [x, y, localZ + z]));
}
// The editor replaces the piece array on every edit, so cached solids stay valid for an entire test.
const poseCache = new WeakMap();
function bridgePose(items, angle) {
  let pose = poseCache.get(items);
  if (!pose) {
    pose = { fixed: [], leaves: [], moving: [], angle: null };
    for (const p of items) {
      if (mountOf(p) === 'fixed') pose.fixed.push({ p, solids: pieceSolids(p, 0) });
      else pose.leaves.push(p);
    }
    poseCache.set(items, pose);
  }
  if (pose.angle !== angle) {
    pose.moving = pose.leaves.map((p) => ({ p, solids: pieceSolids(p, angle) }));
    pose.angle = angle;
  }
  return pose;
}
export function boatObstruction(items, angle, z) {
  const boat = ferrySolids(z),
    pose = bridgePose(items, angle);
  for (const group of [pose.fixed, pose.moving])
    for (const { p, solids } of group) {
      const { d } = size(p);
      if (p.z > z + 1.46 || p.z + d < z - 1.46) continue;
      if (solids.some((s) => boat.some((b) => intersects(s, b)))) return p;
    }
  return null;
}
export function advanceMotor(s, items, dt) {
  if (s.angle === s.target) return;
  const dir = Math.sign(s.target - s.angle);
  const angle = s.angle + dir * Math.min(Math.abs(s.target - s.angle), dt * 0.84);
  const pose = bridgePose(items, angle);
  for (const { p, solids } of pose.moving) {
    if (pose.fixed.some((f) => f.solids.some((b) => solids.some((a) => intersects(a, b))))) {
      s.target = s.angle;
      s.reason =
        'A fixed brick is blocking the ' +
        mountOf(p) +
        (s.angle === 0
          ? ' hinge. Move the obstruction before raising it.'
          : ' leaf. Lower the bridge and move the obstruction.');
      return;
    }
  }
  s.angle = angle;
}
export function sendBoat(s) {
  s.traffic = 'boat';
  s.boatZ = -8;
  s.reason = '';
}
export function advanceBoat(s, items, dt) {
  if (s.traffic !== 'boat') return;
  const next = Math.min(8, s.boatZ + dt * 2.9);
  const hit = boatObstruction(items, s.angle, next);
  if (hit) {
    s.traffic = 'boatStopped';
    s.reason =
      mountOf(hit) === 'fixed'
        ? 'A fixed brick blocks the boat. Retry and edit the crossing.'
        : 'The boat touched the ' + mountOf(hit) + ' leaf. Retry and try a higher lift.';
  } else {
    s.boatZ = next;
    if (next === 8) s.traffic = 'boatPassed';
  }
}
