import { intervals } from './model.mjs';

const validHour = (v) => Number.isInteger(v) && v >= 0 && v <= 23;
export function restoreWorkShift(value) {
  if (!value || ![8, 14, 18].includes(value.startHour) || !validHour(value.endHour) || value.endHour <= value.startHour)
    return null;
  const work = {
    startHour: value.startHour,
    endHour: value.endHour,
    completed: Number.isSafeInteger(value.completed) && value.completed >= 0 ? value.completed : 0
  };
  if (Number.isSafeInteger(value.endsAt) && value.endsAt >= 0 && value.endsAt % 1440 === value.endHour * 60) {
    work.endsAt = value.endsAt;
    if (value.worked === true) work.worked = true;
  }
  return work;
}
export function setWorkShift(trip, startHour, endHour) {
  const work = restoreWorkShift({ startHour, endHour, completed: trip.work?.completed ?? 0 });
  if (!work) return false;
  trip.work = work;
  trip.routine = { hour: startHour, visits: trip.routine?.visits ?? 0 };
  trip.phase = 'done';
  trip.returning = false;
  trip.wait = 0;
  return true;
}
export function beginWorkShift(trip, departureMinute) {
  if (!trip.work) return;
  trip.work.endsAt = Math.floor(departureMinute / 1440) * 1440 + trip.work.endHour * 60;
  delete trip.work.worked;
}
export function finishWorkShift(trip) {
  if (!trip.work) return;
  if (trip.work.worked) trip.work.completed = Math.min(Number.MAX_SAFE_INTEGER, trip.work.completed + 1);
  delete trip.work.endsAt;
  delete trip.work.worked;
}
// Check the actual standing volume, not just an entrance ID or a decorative label.
export function workSpaceBlocker(city, front, y) {
  const samples = [[0, 0], [.27, 0], [-.27, 0], [0, .27], [0, -.27], [.19, .19], [-.19, -.19], [.19, -.19], [-.19, .19]];
  return city.pieces.find(p => samples.some(([dx, dz]) => intervals(p, front.inside.x + dx, front.inside.z + dz)
    .some(([bottom, top]) => bottom < y + 1.65 - .001 && top > y + .001)))?.id ?? null;
}
