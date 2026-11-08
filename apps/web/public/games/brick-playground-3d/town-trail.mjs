import { restoreTrail } from './settlement.mjs';
import { isEntrance, entrance } from './resident-trip.mjs';
import { planStreets } from './street-planner.mjs';

const cached = new WeakMap();
export function trailEntrance(city, id) {
  let doors = cached.get(city.pieces);
  if (!doors) {
    doors = new Map(city.pieces.filter(isEntrance).map((p) => [p.id, { ...entrance(p), y: p.y }]));
    cached.set(city.pieces, doors);
  }
  return doors.get(id) || null;
}
export function prepareTrail(city, name, stops) {
  const trail = restoreTrail({ name, stops, stamps: 0 });
  if (!trail || trail.stops.some((s) => !trailEntrance(city, s.door))) return null;
  const prior = city.trail;
  while (
    trail.stamps < trail.stops.length &&
    trail.stamps < (prior?.stamps || 0) &&
    trail.stops[trail.stamps]?.door === prior.stops[trail.stamps].door
  )
    trail.stamps++;
  return trail;
}
export function currentStop(city) {
  const trail = city.trail;
  return trail?.stops[trail.stamps];
}
export function canStamp(city, person, playing) {
  const stop = currentStop(city);
  if (!playing || !stop) return false;
  const front = trailEntrance(city, stop.door);
  return (
    !!front &&
    Math.hypot(person.x - front.inside.x, person.z - front.inside.z) <= 0.95 &&
    Math.abs(person.y - front.y) < 0.55
  );
}
export function stampTrail(city, person, playing) {
  if (!canStamp(city, person, playing)) return null;
  const stop = currentStop(city);
  city.trail = { ...city.trail, stamps: city.trail.stamps + 1 };
  return stop;
}
export function startingPavement(city) {
  const trail = city.trail,
    next = currentStop(city);
  if (!next || !trailEntrance(city, next.door)) return null;
  for (let i = trail.stamps - 1; i >= 0; i--) {
    const previous = trailEntrance(city, trail.stops[i].door);
    if (previous) return previous;
  }
  return trailEntrance(city, next.door);
}
export function trailLegs(city) {
  const stops = city.trail?.stops || [];
  return stops.slice(1).map((s, i) => planStreets(city, { home: stops[i].door, shop: s.door }));
}
