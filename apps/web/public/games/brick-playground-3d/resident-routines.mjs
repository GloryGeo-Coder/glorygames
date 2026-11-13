import { beginWorkShift, workSpaceBlocker } from './work-shift.mjs';
import { visitFront } from './resident-trip.mjs';
import { householdsFor, DEPARTURES } from './settlement.mjs';
// A settlement day takes 96 seconds of active simulation time.
export const DAY = 1440;
export const START_TIME = 450;
export function setRoutine(trip, hour) {
  if (DEPARTURES.includes(hour)) trip.routine = { hour, visits: trip.routine?.visits ?? 0 };
  else {
    delete trip.routine;
    if (trip.phase === 'done') trip.paused = false;
  }
}
export function nextDeparture(now, hour) {
  const today = Math.floor(now / DAY) * DAY + hour * 60;
  return today > now ? today : today + DAY;
}
export function clockLabel(now) {
  const minute = Math.floor(now) % DAY;
  const digits = (n) => String(n).padStart(2, '0');
  return (
    'Day ' +
    (1 + Math.floor(now / DAY)) +
    ' · ' +
    digits(Math.floor(minute / 60)) +
    ':' +
    digits(minute % 60)
  );
}
export function hasRoutines(city) {
  return (
    !!(city.market?.daily && !city.market.daily.paused) ||
    householdsFor(city).some(({ key }) => city[key]?.routine)
  );
}
function advanceTo(city, time) {
  const previous = city.clockMinutes ?? START_TIME;
  city.clockMinutes = time;
  let departed = false;
  for (const { key } of householdsFor(city)) {
    const trip = city[key];
    if (
      !trip?.routine ||
      trip.paused ||
      trip.phase !== 'done' ||
      nextDeparture(previous, trip.routine.hour) > time
    )
      continue;
    // Leave from the saved position, even if the player moved an entrance while the resident rested.
    if (trip.work) beginWorkShift(trip, nextDeparture(previous, trip.routine.hour));
    trip.phase = 'leave';
    trip.returning = false;
    trip.wait = 0;
    departed = true;
  }
  return departed;
}
export function tickRoutines(city, dt) {
  if (!hasRoutines(city)) return false;
  return advanceTo(city, (city.clockMinutes ?? START_TIME) + dt * 15);
}
export function nextIdleDeparture(city) {
  const daily = city.market?.daily,
    now = city.clockMinutes ?? START_TIME;
  let next =
    daily && !daily.paused && city.market.receipts.length === 2 && daily.next > now
      ? daily.next
      : Infinity;
  for (const { key } of householdsFor(city)) {
    const trip = city[key];
    if (!trip) continue;
    if (trip.work && trip.phase === 'shopping' && !trip.returning) {
      const door = city.pieces.find(p => p.id === trip.shop);
      const front = visitFront(city, door);
      if (trip.paused || !trip.work.worked || !front ||
          Math.hypot(trip.x - front.inside.x, trip.z - front.inside.z) > 0.025 ||
          Math.abs(trip.y - door.y) > 0.65 || workSpaceBlocker(city, front, trip.y)) return null;
      if (trip.work.endsAt > now) next = Math.min(next, trip.work.endsAt);
      else return null;
      continue;
    }
    if (trip.phase !== 'done') return null;
    if (trip.routine && !trip.paused)
      next = Math.min(next, nextDeparture(city.clockMinutes ?? START_TIME, trip.routine.hour));
  }
  return Number.isFinite(next) ? next : null;
}
export function skipToDeparture(city) {
  const next = nextIdleDeparture(city);
  if (next === null) return false;
  advanceTo(city, next);
  return true;
}
