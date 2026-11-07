import { DISTRICT, LOTS, STATIONS } from './district.mjs';
import { parts, partFootprint, size } from './model.mjs';
import {
  bodyLoad,
  buildProblem,
  drivingSeat,
  driveVehicle,
  newRun,
  CHASSIS_TOP
} from './vehicle.mjs';

export const BAY_Z = -9.55;
export const BAY_WIDTH = 7.4,
  BAY_DEPTH = 4.76;
const HALF_W = 2.34,
  HALF_D = 2.08;
export const FREIGHT_ACTIONS = ['', 'Load two crates', 'Unload market crate', 'Unload spaza crate'];
export const cargoCount = (stop) => (stop === 2 ? 2 : stop === 3 ? 1 : 0);

export function starterBuggy() {
  return [
    { id: 'freight-cab', type: 'cab', color: 'Lagoon', x: -1, z: 0, r: 0, y: 0 },
    { id: 'freight-seat', type: 'seat', color: 'Ink', x: -1, z: 0, r: 0, y: 0 },
    { id: 'freight-bed', type: 'cargo', color: 'Sun', x: -1, z: -2, r: 0, y: 0 }
  ];
}
export function openBed(items) {
  return items.find((b) => {
    if (b.type !== 'cargo') return false;
    const bed = size(b);
    return !items.some((p) => {
      if (p === b) return false;
      const a = size(p);
      return (
        p.x < b.x + bed.w &&
        p.x + a.w > b.x &&
        p.z < b.z + bed.d &&
        p.z + a.d > b.z &&
        p.y < b.y + 1.45 &&
        p.y + a.h > b.y + 0.22
      );
    });
  });
}
export function freightProblem(items) {
  return (
    buildProblem(items) ||
    (!drivingSeat(items) && 'Fit a seat with room above the driver.') ||
    (!openBed(items) && 'Fit a cargo bed with room above it for two crates.') ||
    ''
  );
}
export function freightRun(items, stop) {
  const serviced = stop >= 4 ? 2 : Math.max(0, stop - 2);
  return {
    ...newRun(bodyLoad(items)),
    x: LOTS[serviced].x,
    z: BAY_Z,
    yaw: Math.PI / 2,
    blocked: false
  };
}
export function canService(run, stop) {
  const lot = LOTS[stop - 1];
  const sin = Math.abs(Math.sin(run.yaw)),
    cos = Math.abs(Math.cos(run.yaw));
  // Project all four wheel centres onto the painted bay.
  const wheelX = 2.08 * cos + 1.29 * sin,
    wheelZ = 2.08 * sin + 1.29 * cos;
  return (
    !!lot &&
    Math.abs(run.speed) <= 0.22 &&
    Math.abs(run.x - lot.x) + wheelX <= BAY_WIDTH / 2 &&
    Math.abs(run.z - BAY_Z) + wheelZ <= BAY_DEPTH / 2 &&
    cos <= 0.23
  );
}
// Test the oriented chassis against each solid on the four separating axes.
function intersects(x, z, c, s, rect) {
  const dx = x - rect.x,
    dz = z - rect.z,
    hw = rect.w / 2,
    hd = rect.d / 2;
  return (
    Math.abs(dx) < hw + HALF_W * Math.abs(c) + HALF_D * Math.abs(s) &&
    Math.abs(dz) < hd + HALF_W * Math.abs(s) + HALF_D * Math.abs(c) &&
    Math.abs(dx * c - dz * s) < HALF_W + hw * Math.abs(c) + hd * Math.abs(s) &&
    Math.abs(dx * s + dz * c) < HALF_D + hw * Math.abs(s) + hd * Math.abs(c)
  );
}
export function roadObstacles(pieces, buggy) {
  const top =
    CHASSIS_TOP +
    Math.max(
      ...buggy.map((p) => p.y + size(p).h),
      drivingSeat(buggy).y + 1.5,
      openBed(buggy).y + 1.45
    );
  const obstacles = [...STATIONS];
  for (const p of pieces)
    for (const part of parts(p.type)) {
      if (p.y + part.y >= top) continue;
      const a = partFootprint(p, part);
      obstacles.push({ x: a.x + a.w / 2, z: a.z + a.d / 2, w: a.w, d: a.d });
    }
  return obstacles;
}
export function advanceFreight(run, tyres, gas, steer, brake, dt, obstacles) {
  driveVehicle(run, tyres, gas, steer, brake, dt, (next, yaw) => {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    run.blocked =
      Math.abs(next.x) + HALF_W * Math.abs(c) + HALF_D * Math.abs(s) > DISTRICT.x ||
      Math.abs(next.z) + HALF_W * Math.abs(s) + HALF_D * Math.abs(c) > DISTRICT.z ||
      obstacles.some((r) => intersects(next.x, next.z, c, s, r));
    return !run.blocked;
  });
}
