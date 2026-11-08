// Optional deliveries in the player's settlement. The workshop remains the source of the buggy.
import { HALF, streetSegment } from './settlement.mjs';
import { parts, partFootprint, size } from './model.mjs';
import { CHASSIS_TOP, bodyLoad, drivingSeat, driveVehicle, newRun } from './vehicle.mjs';
import { openBed } from './freight.mjs';

const HALF_W = 2.34,
  HALF_D = 2.08;
function validStreet(key) {
  if (typeof key !== 'string' || !/^[hv]-[0-8]-[0-8]$/.test(key)) return false;
  const [axis, col, row] = key.split('-');
  return axis === 'h' ? Number(col) < 8 : Number(row) < 8;
}
export function restoreTransport(value) {
  if (
    !value ||
    !validStreet(value.pickup) ||
    !validStreet(value.dropoff) ||
    value.pickup === value.dropoff ||
    ![1, 2, 3].includes(value.stage)
  )
    return null;
  return { pickup: value.pickup, dropoff: value.dropoff, stage: value.stage };
}
export function newTransport(pickup, dropoff) {
  return restoreTransport({ pickup, dropoff, stage: 1 });
}
export function transportPoint(key) {
  if (!validStreet(key)) return null;
  const segment = streetSegment(key);
  // Outer roads straddle the town boundary. Stop on their inner shoulder.
  const clamp = (n) => Math.max(-HALF + 3, Math.min(HALF - 3, n));
  return {
    x: clamp(segment.x),
    z: clamp(segment.z),
    yaw: segment.axis === 'h' ? Math.PI / 2 : 0
  };
}
export function transportObstacles(pieces, buggy) {
  const top =
    CHASSIS_TOP +
    Math.max(
      0,
      ...buggy.map((p) => p.y + size(p).h),
      (drivingSeat(buggy)?.y ?? 0) + 1.5,
      (openBed(buggy)?.y ?? 0) + 1.45
    );
  return pieces.flatMap((piece) =>
    parts(piece.type)
      .filter((part) => piece.y + part.y < top)
      .map((part) => {
        const rect = partFootprint(piece, part);
        return {
          x: rect.x + rect.w / 2,
          z: rect.z + rect.d / 2,
          w: rect.w,
          d: rect.d
        };
      })
  );
}
export function transportClear(position, obstacles) {
  const c = Math.cos(position.yaw),
    s = Math.sin(position.yaw),
    ac = Math.abs(c),
    as = Math.abs(s);
  if (
    Math.abs(position.x) + HALF_W * ac + HALF_D * as > HALF ||
    Math.abs(position.z) + HALF_W * as + HALF_D * ac > HALF
  )
    return false;
  return !obstacles.some((rect) => {
    const dx = position.x - rect.x,
      dz = position.z - rect.z,
      hw = rect.w / 2,
      hd = rect.d / 2;
    return (
      Math.abs(dx) < hw + HALF_W * ac + HALF_D * as &&
      Math.abs(dz) < hd + HALF_W * as + HALF_D * ac &&
      Math.abs(dx * c - dz * s) < HALF_W + hw * ac + hd * as &&
      Math.abs(dx * s + dz * c) < HALF_D + hw * as + hd * ac
    );
  });
}
export function transportRun(buggy, trip, obstacles, city) {
  if (!restoreTransport(trip)) return null;
  const key = trip.stage === 3 ? trip.dropoff : trip.pickup;
  if (city && !city.streets.includes(key)) return null;
  const point = transportPoint(key);
  if (!transportClear(point, obstacles)) return null;
  return {
    ...newRun(bodyLoad(buggy) + (trip.stage === 2 ? 5 : 0)),
    ...point,
    blocked: false
  };
}
export function canServiceTransport(run, trip, city, obstacles) {
  if (!restoreTransport(trip) || trip.stage === 3) return false;
  const key = trip.stage === 1 ? trip.pickup : trip.dropoff;
  if (!city.streets.includes(key)) return false;
  const point = transportPoint(key);
  return (
    Math.abs(run.speed) <= 0.22 &&
    Math.hypot(run.x - point.x, run.z - point.z) <= 1.2 &&
    Math.abs(Math.sin(run.yaw - point.yaw)) <= 0.23 &&
    transportClear(run, obstacles) &&
    transportClear(point, obstacles)
  );
}
export function serviceTransport(run, trip, city, obstacles) {
  if (!canServiceTransport(run, trip, city, obstacles)) return false;
  trip.stage++;
  run.load += trip.stage === 2 ? 5 : -5;
  run.speed = 0;
  return true;
}
export function advanceTransport(run, tyres, gas, steer, brake, dt, obstacles) {
  // Bound each collision step even when a tab resumes after a long frame.
  const seconds = Math.max(0, Math.min(Number.isFinite(dt) ? dt : 0, 0.25));
  const steps = Math.max(1, Math.ceil(seconds / (1 / 60)));
  for (let i = 0; i < steps; i++)
    driveVehicle(run, tyres, gas, steer, brake, seconds / steps, (next, yaw) => {
      run.blocked = !transportClear({ ...next, yaw }, obstacles);
      return !run.blocked;
    });
}
