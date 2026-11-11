import { restockShop } from './shop-stock.mjs';
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
  const trip = {
    pickup: value.pickup,
    dropoff: value.dropoff,
    stage: value.stage
  };
  // Legacy single-stop saves keep their original shape. Rounds carry explicit receipts.
  if (!Object.hasOwn(value, 'stops')) return trip;
  if (
    !Array.isArray(value.stops) ||
    value.stops.length !== 2 ||
    value.stops.some(
      (stop) =>
        !stop ||
        !validStreet(stop.street) ||
        stop.street === trip.pickup ||
        typeof stop.delivered !== 'boolean'
    ) ||
    value.stops[0].street === value.stops[1].street
  )
    return null;
  const stops = value.stops.map(({ street, delivered }) => ({
    street,
    delivered
  }));
  const delivered = stops.filter((stop) => stop.delivered);
  const selected = stops.find((stop) => stop.street === trip.dropoff);
  if (
    !selected ||
    (trip.stage === 1 && delivered.length !== 0) ||
    (trip.stage === 2 && (delivered.length === 2 || selected.delivered)) ||
    (trip.stage === 3 && delivered.length !== 2) ||
    (delivered.length === 0
      ? value.checkpoint !== trip.pickup
      : !delivered.some((stop) => stop.street === value.checkpoint)) ||
    (trip.stage === 3 && value.checkpoint !== trip.dropoff)
  )
    return null;
  return { ...trip, stops, checkpoint: value.checkpoint };
}
export function newTransport(pickup, dropoff, second = '') {
  return restoreTransport({
    pickup,
    dropoff,
    stage: 1,
    ...(second
      ? {
          stops: [dropoff, second].map((street) => ({
            street,
            delivered: false
          })),
          checkpoint: pickup
        }
      : {})
  });
}
export function transportStops(trip) {
  return trip.stops || [{ street: trip.dropoff, delivered: trip.stage === 3 }];
}
export function transportCargo(trip) {
  return trip?.stage === 2 ? transportStops(trip).filter((stop) => !stop.delivered).length : 0;
}
export function chooseTransportStop(trip, key) {
  if (
    !restoreTransport(trip) ||
    !trip.stops ||
    trip.stage === 3 ||
    !trip.stops.some((stop) => stop.street === key && !stop.delivered)
  )
    return false;
  trip.dropoff = key;
  return true;
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
  const key = trip.stops ? trip.checkpoint : trip.stage === 3 ? trip.dropoff : trip.pickup;
  if (city && !city.streets.includes(key)) return null;
  const point = transportPoint(key);
  if (!transportClear(point, obstacles)) return null;
  return {
    ...newRun(bodyLoad(buggy) + transportCargo(trip) * 5),
    ...point,
    blocked: false
  };
}
export function transportParking(run, trip, city, obstacles) {
  if (!restoreTransport(trip)) return 'missing';
  if (trip.stage === 3) return 'complete';
  if (![run?.x, run?.z, run?.yaw, run?.speed].every(Number.isFinite)) return 'recover';
  const key = trip.stage === 1 ? trip.pickup : trip.dropoff;
  if (!city.streets.includes(key)) return 'missing';
  const point = transportPoint(key);
  if (Math.hypot(run.x - point.x, run.z - point.z) > 1.2) return 'approach';
  if (Math.abs(run.speed) > 0.22) return 'brake';
  if (Math.abs(Math.sin(run.yaw - point.yaw)) > 0.23) return 'align';
  if (!transportClear(run, obstacles) || !transportClear(point, obstacles)) return 'blocked';
  return 'ready';
}
export function canServiceTransport(run, trip, city, obstacles) {
  return transportParking(run, trip, city, obstacles) === 'ready';
}
export function serviceTransport(run, trip, city, obstacles) {
  if (!canServiceTransport(run, trip, city, obstacles)) return false;
  const before = transportCargo(trip);
  if (trip.stage === 2) restockShop(city, trip.dropoff);
  if (trip.stage === 1) trip.stage = 2;
  else if (trip.stops) {
    trip.stops.find((stop) => stop.street === trip.dropoff).delivered = true;
    trip.checkpoint = trip.dropoff;
    const next = trip.stops.find((stop) => !stop.delivered);
    if (next) trip.dropoff = next.street;
    else trip.stage = 3;
  } else trip.stage = 3;
  run.load += (transportCargo(trip) - before) * 5;
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
