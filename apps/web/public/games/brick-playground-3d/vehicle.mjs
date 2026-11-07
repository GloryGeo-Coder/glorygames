// The same four-stud chassis is the coordinate system for editing and driving.
import { size, parts, TYPES, PLOT } from './model.mjs';

export const CHASSIS_TOP = 0.96;
export const TYRES = {
  road: {
    label: 'Road',
    note: 'Balanced handling',
    speed: 5.4,
    turn: 0.42,
    acceleration: 4.6,
    color: '#ecc15a'
  },
  grip: {
    label: 'Grip',
    note: 'Tighter turns',
    speed: 4.7,
    turn: 0.58,
    acceleration: 5.3,
    color: '#39bfa3'
  },
  sprint: {
    label: 'Sprint',
    note: 'Higher top speed',
    speed: 6.8,
    turn: 0.34,
    acceleration: 5.8,
    color: '#ef7855'
  }
};
// Normal points in the direction the driver must cross each gate.
export const GATES = [
  { name: 'Park', x: -5, z: 2.5, nx: 0, nz: 1 },
  { name: 'Market', x: 2.5, z: 5, nx: 1, nz: 0 },
  { name: 'Depot', x: 5, z: -2.5, nx: 0, nz: -1 }
];
export const GATE_HALF_WIDTH = 3;
export function bodyLoad(pieces) {
  return pieces.reduce(
    (load, p) =>
      load +
      parts(p.type).reduce(
        (volume, s) => volume + s.w * s.d * s.h * (s.detail === 'ramp' ? 0.5 : 1),
        0
      ),
    0
  );
}
export const newRun = (load = 0) => ({
  load,
  x: -5,
  z: -5,
  yaw: 0,
  speed: 0,
  distance: 0,
  steer: 0,
  gate: 0
});
export function fitsChassis(p) {
  const { w, d, h } = size(p);
  return p.x >= -2 && p.x + w <= 2 && p.z >= -2 && p.z + d <= 2 && p.y + h <= 5 + 0.001;
}
function footprint(piece, face) {
  const { w, d } = TYPES[piece.type];
  let { x, z } = face;
  if (piece.r === 1) {
    x = d - face.z - face.d;
    z = face.x;
  }
  if (piece.r === 2) {
    x = w - face.x - face.w;
    z = d - face.z - face.d;
  }
  if (piece.r === 3) {
    x = face.z;
    z = w - face.x - face.w;
  }
  return {
    x: x + piece.x,
    z: z + piece.z,
    w: piece.r % 2 ? face.d : face.w,
    d: piece.r % 2 ? face.w : face.d
  };
}
function above(lower, upper) {
  // Chassis parts can be hollow. Test actual contact faces, including rotated seat backs.
  for (const face of parts(lower.type)) {
    if (face.detail === 'ramp' || Math.abs(lower.y + face.y + face.h - upper.y) > 0.002) continue;
    const a = footprint(lower, face);
    for (const bottom of parts(upper.type)) {
      if (bottom.y !== 0) continue;
      const b = footprint(upper, bottom);
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.z < b.z + b.d && b.z < a.z + a.d) return true;
    }
  }
  return false;
}
export function buildProblem(pieces) {
  if (!pieces.length) return 'Add a brick to the chassis to drive.';
  if (pieces.some((p) => !fitsChassis(p)))
    return 'Keep the body within the four-by-four chassis and five bricks high.';
  const mounted = [];
  for (const p of [...pieces].sort((a, b) => a.y - b.y)) {
    if (p.y < 0.002 || mounted.some((lower) => above(lower, p))) mounted.push(p);
    else return 'A brick is unsupported. Move it down or add a support before driving.';
  }
  return '';
}
function crosses(from, to, g, yaw) {
  const side = (p) => (p.x - g.x) * g.nx + (p.z - g.z) * g.nz;
  const start = side(from),
    end = side(to);
  if (start >= 0 || end < 0) return false;
  const t = -start / (end - start);
  const x = from.x + (to.x - from.x) * t - g.x,
    z = from.z + (to.z - from.z) * t - g.z;
  const sideways = Math.sin(yaw) * g.nz - Math.cos(yaw) * g.nx;
  const along = Math.cos(yaw) * g.nz + Math.sin(yaw) * g.nx;
  return (
    Math.abs(x * g.nz - z * g.nx) + 2.34 * Math.abs(along) + 2 * Math.abs(sideways) <=
    GATE_HALF_WIDTH
  );
}
export function advanceVehicle(v, tyres, gas, steer, brake, dt) {
  const kit = TYRES[tyres];
  if (!kit || v.gate === GATES.length) return;
  const target = brake ? 0 : gas * (gas < 0 ? kit.speed * 0.56 : kit.speed);
  const loadFactor = 1 / (1 + v.load / 45);
  const rate = brake ? 14 * loadFactor : Math.abs(gas) < 0.02 ? 3 : kit.acceleration * loadFactor;
  const change = Math.max(-rate * dt, Math.min(rate * dt, target - v.speed));
  v.speed += change;
  v.steer = steer;
  const yaw = v.yaw + steer * kit.turn * v.speed * dt;
  const next = { x: v.x + Math.sin(yaw) * v.speed * dt, z: v.z + Math.cos(yaw) * v.speed * dt };
  const sin = Math.abs(Math.sin(yaw)),
    cos = Math.abs(Math.cos(yaw));
  if (
    Math.abs(next.x) + 2.34 * cos + 2 * sin > PLOT ||
    Math.abs(next.z) + 2 * cos + 2.34 * sin > PLOT
  ) {
    v.speed = 0;
    return;
  }
  if (crosses(v, next, GATES[v.gate], yaw)) v.gate++;
  v.distance += v.speed * dt;
  Object.assign(v, next, { yaw });
  if (v.gate === GATES.length) v.speed = 0;
}
