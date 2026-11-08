// A settlement day takes 96 seconds of active simulation time.
export const DAY = 1440;
export const START_TIME = 450;
export const DEPARTURES = [8, 14, 18];
export const HOUSEHOLDS = [
  { key: 'resident', name: 'Lebo', destination: 'Spaza', activity: 'Shopping' },
  { key: 'neighbour', name: 'Naledi', destination: 'Community hall', activity: 'Visiting the hall' }
];
export function restoreRoutine(value) {
  if (!DEPARTURES.includes(value?.hour)) return null;
  return {
    hour: value.hour,
    visits: Number.isSafeInteger(value.visits) && value.visits >= 0 ? value.visits : 0
  };
}
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
  return HOUSEHOLDS.some(({ key }) => city[key]?.routine);
}
function advanceTo(city, time) {
  const previous = city.clockMinutes ?? START_TIME;
  city.clockMinutes = time;
  let departed = false;
  for (const { key } of HOUSEHOLDS) {
    const trip = city[key];
    if (
      !trip?.routine ||
      trip.paused ||
      trip.phase !== 'done' ||
      nextDeparture(previous, trip.routine.hour) > time
    )
      continue;
    // Leave from the saved position, even if the player moved an entrance while the resident rested.
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
  let next = Infinity;
  for (const { key } of HOUSEHOLDS) {
    const trip = city[key];
    if (!trip) continue;
    if (trip.phase !== 'done') return null;
    if (trip.routine && !trip.paused)
      next = Math.min(next, nextDeparture(city.clockMinutes ?? START_TIME, trip.routine.hour));
  }
  return Number.isFinite(next) ? next : null;
}
export function skipToDeparture(city) {
  const next = nextIdleDeparture(city);
  return next !== null && advanceTo(city, next);
}
