import { householdsFor, HALF, MOVE_IN_SLOTS } from './settlement.mjs';
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
// Stable household slots leave the doorway and its straight approach clear.
export function queuePosition(city, trip, front) {
  const roster = householdsFor(city);
  const key = roster.find(p => city[p.key] === trip)?.key;
  const index = Math.max(0, ['resident', 'neighbour', ...MOVE_IN_SLOTS].indexOf(key));
  const dx = front.center.x - front.inside.x, dz = front.center.z - front.inside.z;
  const length = Math.hypot(dx, dz), nx = dx / length, nz = dz / length;
  const maximum = 1.25 + 7 * 0.85; // Reserve all eight household slots on the same side.
  const fits = (sign) => Math.abs(front.center.x + nx * 2 - nz * maximum * sign) <= HALF - 0.3 &&
    Math.abs(front.center.z + nz * 2 + nx * maximum * sign) <= HALF - 0.3;
  const sign = fits(1) ? 1 : -1;
  const side = (1.25 + index * 0.85) * sign;
  return { x: front.center.x + nx * 2 - nz * side, z: front.center.z + nz * 2 + nx * side };
}
export function queueCanEnter(city, trip, front) {
  const roster = householdsFor(city);
  // Admission is held until the previous visitor physically clears the approach.
  if (roster.some(p => {
    const other = city[p.key];
    return other && other !== trip && other.shop === trip.shop && !other.park &&
      ((!other.returning && ['queue-return', 'door', 'enter', 'shopping'].includes(other.phase)) ||
       (other.returning && ['leave', 'approach'].includes(other.phase) && distance(other, front.center) < 2.2));
  })) return false;
  return roster.find(p => {
    const other = city[p.key];
    return other && !other.paused && !other.returning && other.shop === trip.shop &&
      other.phase === 'queue' && distance(other, queuePosition(city, other, front)) <= 0.025;
  })?.key === roster.find(p => city[p.key] === trip)?.key;
}
