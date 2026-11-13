// Appearance is derived from a stable slot, never a random value or a person's name.
const PALETTES = [
  ['#814f85', '#995b3a', '#d88037'],
  ['#227e82', '#6d402e', '#efce5a'],
  ['#c25e34', '#ba805b', '#f4d780'],
  ['#367e9b', '#70452f', '#e38852'],
  ['#956899', '#d6a178', '#d9c7a1'],
  ['#42825b', '#9d6548', '#f1b45a'],
  ['#a24a59', '#57382e', '#a4cece'],
  ['#6265a6', '#c18d66', '#d8cd72']
];
export function citizenAppearance(key, keeper = false) {
  const slot = /^family([1-6])$/.exec(key || '');
  const index = key === 'neighbour' ? 1 : slot ? Number(slot[1]) + 1 : 0;
  const [jacket, skin, cap] = PALETTES[index];
  return { jacket: keeper ? '#19695d' : jacket, skin, cap: keeper ? '#f1c65b' : cap,
    style: keeper ? 0 : index % 3 };
}

// A companion repeats actual traversed positions, never a sideways offset through walls.
// The trail is visual only: it does not create another household, route or purchase.
const distanceBetween = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
// Keep save data local to the accompanying adult, rather than accepting detached trails.
// The settlement is 192 studs wide; y has the same defensive bound as trip restoration.
export function restoreCompanionPath(value, trip) {
  const valid = (p) => p && ['x', 'y', 'z', 'heading'].every((k) => Number.isFinite(p[k])) &&
    Math.abs(p.x) <= 96 && Math.abs(p.z) <= 96 && Math.abs(p.y) <= 200 &&
    Math.abs(p.heading) <= Math.PI * 2;
  if (!Array.isArray(value) || !value.length || value.length > 48 || !valid(trip) ||
      !value.every(valid)) return null;
  let total = 0;
  for (let i = 1; i < value.length; i++) {
    const segment = Math.hypot(value[i].x - value[i - 1].x,
      value[i].y - value[i - 1].y, value[i].z - value[i - 1].z);
    if (segment > 1.5 || (total += segment) > 2) return null;
  }
  const end = value.at(-1);
  if (Math.hypot(end.x - trip.x, end.y - trip.y, end.z - trip.z) > 1.5) return null;
  return value.map(({ x, y, z, heading }) => ({ x, y, z, heading }));
}
export function updateCompanionPath(trip) {
  if (!trip) return null;
  const point = { x: trip.x, y: trip.y, z: trip.z, heading: trip.heading };
  let points = restoreCompanionPath(trip.companionPath, trip) || [];
  const last = points.at(-1);
  const moved = last ? distanceBetween(point, last) : 0;
  // A moved/replaced home or an edited route must not link distant locations.
  if (moved > 1.5) points = [];
  if (!points.length || moved > 0.02) points.push(point);
  let distance = 0;
  for (let i = 1; i < points.length; i++) distance += distanceBetween(points[i], points[i - 1]);
  while (points.length > 2) {
    const segment = distanceBetween(points[1], points[0]);
    if (distance - segment < 0.65 && points.length <= 48) break;
    distance -= segment;
    points.shift();
  }
  trip.companionPath = points;
  // Wait inside the home until there is space behind the accompanying adult.
  return distance >= 0.6 ? points[0] : null;
}
export function companionTrail() {
  // Trail state belongs to the trip, not the mesh: culling/reload cannot erase it.
  return { follow: updateCompanionPath, reset() {} };
}
