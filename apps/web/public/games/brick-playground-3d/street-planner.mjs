import { BLOCKS, streetKeys } from './settlement.mjs';
import { isEntrance, entrance, traceStreets } from './resident-trip.mjs';

const labels = new Map();
for (const block of BLOCKS) {
  for (const [side, key] of Object.entries(streetKeys(block))) {
    if (!labels.has(key)) labels.set(key, block.code + ' ' + side);
  }
}
const allStreets = [...labels.keys()];
export const sectionLabel = (key) => labels.get(key);

export function planStreets(city, trip) {
  const front = (id) => {
    const brick = city.pieces.find((p) => p.id === id);
    return isEntrance(brick) ? entrance(brick) : null;
  };
  const home = front(trip.home),
    destination = front(trip.shop);
  if (!home || !destination) return { home, destination, points: [], missing: [], distance: null };
  const built = new Set(city.streets);
  const required = [home.street, destination.street];
  let route;
  if (required.every((key) => built.has(key))) {
    route = traceStreets(city.streets, home.curb, destination.curb);
  }
  let missing = [];
  if (!route) {
    // Both entrance streets are mandatory even when a curb lies on a junction.
    const available = new Set([...built, ...required]);
    route = traceStreets(allStreets, home.curb, destination.curb, available);
    if (!route) return { home, destination, points: [], missing: [], distance: null };
    missing = [...new Set([...required, ...route.sections])].filter((key) => !built.has(key));
    // Match the walker's route through the proposed layout, including equal-length alternatives.
    route = traceStreets([...built, ...missing], home.curb, destination.curb);
  }
  const points = [home.curb, ...route.points];
  let distance = 0;
  for (let i = 1; i < points.length; i++)
    distance += Math.hypot(points[i].x - points[i - 1].x, points[i].z - points[i - 1].z);
  return { home, destination, points, missing, distance };
}
