// Coordinates are in studs. The forecourt is the guaranteed recovery point for this world.
export const FORECOURT = { x: -2.5, y: 0, z: -8 };
export const COUNTER = { x: -2.5, y: 1 / 3, z: 3 };
export const FLAT = { x: -2.4, y: 3, z: 2.5 };
export const REPAIRS = {
  stairs: { type: 'step', color: 'Sun', x: 3, z: -5, r: 1 },
  balcony: { type: 'deck', color: 'Lagoon', x: 0, z: 1, r: 0 }
};
export function clearForecourt(p, a) {
  return p.y >= 2 || p.x + a.w <= -4 || p.x >= -1 || p.z + a.d <= -9 || p.z >= -7;
}
export function atHandover(stage, a) {
  const target = stage === 1 ? COUNTER : stage === 2 ? FLAT : null;
  return (
    !!target &&
    a.grounded &&
    Math.abs(a.x - target.x) <= (stage === 2 ? 1 : 0.8) &&
    Math.abs(a.z - target.z) <= (stage === 2 ? 1.25 : 0.7) &&
    Math.abs(a.y - target.y) < 0.03
  );
}
export function routeHint(stage, editing, a) {
  if (stage === 0) return 'Collect a parcel downstairs and deliver it to the flat above.';
  if (stage === 3) return 'The parcel reached the flat. Change the route or deliver again.';
  if (stage === 1)
    return !editing && atHandover(stage, a)
      ? 'At the shop counter. Collect the parcel.'
      : editing
        ? 'Choose Play and walk through the teal doorway to the counter.'
        : 'Walk through the teal doorway to the counter.';
  if (editing)
    return 'Raise the middle flight and link the landing to the flat. Use the aim buttons to preview suggested pieces.';
  if (atHandover(stage, a)) return 'Inside the flat. Hand over the parcel.';
  if (a.y > 2.5)
    return 'Cross from the landing to the gold doorway. Add a balcony link in Build if there is a gap.';
  if (a.x > 2 && a.y > 0.5)
    return 'Walk up the stairs. If a rise is too high, return to Build and fit steps or a ramp.';
  return 'Carry the parcel out through the teal doorway, then round to the foot of the outside stairs. Jump is off while carrying.';
}
export function shopWorld() {
  const pieces = [];
  const add = (type, color, x, z, y = 0, r = 0, id = 'shop-' + pieces.length) =>
    pieces.push({ id, type, color, x, z, y, r });
  // The shop, flat and loading stairs are ordinary editable bricks.
  add('floor', 'Chalk', -4, 1);
  add('door', 'Lagoon', -4, 0);
  add('pillar', 'Coral', -1, 0);
  add('wall', 'Coral', -5, 1, 0, 1);
  add('wall', 'Lagoon', -4, 5);
  add('pillar', 'Coral', 0, 4);
  add('bench', 'Sun', -4, 4, 1 / 3);
  for (const [i, color] of ['Leaf', 'Sun', 'Coral'].entries()) add('tile', color, -4 + i, 4, 4 / 3);
  add('floor', 'Chalk', -4, 1, 8 / 3);
  add('door', 'Sun', -1, 1, 3, 1, 'flat-door');
  add('window', 'Sky', -4, 4, 3);
  add('wall', 'Plum', -5, 1, 3, 1);
  add('bench', 'Coral', -4, 1, 3, 1);
  for (const [i, color] of ['Chalk', 'Sky', 'Sky'].entries()) add('tile', color, -4, 1 + i, 4);
  add('strip', 'Chalk', -4, 4, 5);
  add('strip', 'Chalk', -4, -1, 3);
  add('strip', 'Sun', -4, -2, 3, 0, 'shop-awning');
  // Three flights climb towards the flat. The middle one lacks its treads.
  add('step', 'Lagoon', 3, -8, 0, 1);
  for (const [z, layers] of [
    [-5, 3],
    [-2, 6],
    [1, 8]
  ]) {
    for (let i = 0; i < layers; i++) add('deck', i % 2 ? 'Coral' : 'Chalk', 3, z, i / 3, 1);
  }
  add('step', 'Lagoon', 3, -2, 2, 1);
  add('deck', 'Lagoon', 3, 1, 8 / 3, 1);
  // A bracket beside the flat supports a three-stud link across the open span.
  for (let i = 0; i < 2; i++) add('single', 'Coral', 0, 1, i);
  for (let i = 0; i < 2; i++) add('tile', 'Sun', 0, 1, 2 + i / 3);
  return { version: 1, name: 'Flat Above the Shop', stage: 0, complete: false, pieces };
}
