import { HALF, PITCH, streetSegment } from './settlement.mjs';

// Original, code-native pavement and crossing paint. Two material batches, irrespective
// of population; rebuild only when the set of player-built street segments changes.
export function pavementMarkings(keys) {
  const pavements = [], crossings = [], junctions = new Map(), seen = new Set();
  function rectangle(list, x, z, w, d) {
    // Outer boundary streets have only their inward pavement.
    const left = Math.max(-HALF, x - w / 2), right = Math.min(HALF, x + w / 2);
    const bottom = Math.max(-HALF, z - d / 2), top = Math.min(HALF, z + d / 2);
    if (right > left && top > bottom)
      list.push({ x: (left + right) / 2, z: (bottom + top) / 2, w: right - left, d: top - bottom });
  }
  for (const key of new Set(keys)) {
    const match = /^([hv])-([0-8])-([0-8])$/.exec(key);
    if (!match || (match[1] === 'h' ? +match[2] > 7 : +match[3] > 7)) continue;
    const { x, z, axis } = streetSegment(key), horizontal = axis === 'h';
    for (const side of [-1, 1])
      rectangle(pavements, x + (horizontal ? 0 : side * 1.5),
        z + (horizontal ? side * 1.5 : 0), horizontal ? PITCH - 3 : .9,
        horizontal ? .9 : PITCH - 3);
    for (const sign of [-1, 1]) {
      const ex = x + (horizontal ? sign * PITCH / 2 : 0),
        ez = z + (horizontal ? 0 : sign * PITCH / 2), id = ex + ',' + ez;
      if (!junctions.has(id)) junctions.set(id, { x: ex, z: ez, arms: [] });
      junctions.get(id).arms.push({ axis, inward: -sign });
    }
  }
  for (const { x, z, arms } of junctions.values()) {
    const horizontal = arms.some((a) => a.axis === 'h'),
      vertical = arms.some((a) => a.axis === 'v');
    if (!(horizontal && vertical)) {
      // Continue side pavements across a straight junction or around a dead end.
      for (const side of [-1, 1])
        rectangle(pavements, x + (horizontal ? 0 : side * 1.5),
          z + (horizontal ? side * 1.5 : 0), horizontal ? 3 : .9, horizontal ? .9 : 3);
    }
    for (const { axis, inward } of arms) {
      const h = axis === 'h';
      if (horizontal && vertical) for (const side of [-1, 1]) {
        const px = x + (h ? inward : side) * 1.5,
          pz = z + (h ? side : inward) * 1.5, id = px + ',' + pz;
        if (!seen.has(id)) { rectangle(pavements, px, pz, .9, .9); seen.add(id); }
      }
      // Each actual road arm has a marked crossing, including dead-end turnarounds.
      for (const stripe of [-.8, -.4, 0, .4, .8])
        rectangle(crossings, x + (h ? inward * 1.5 : stripe),
          z + (h ? stripe : inward * 1.5), h ? .8 : .22, h ? .22 : .8);
    }
  }
  return { pavements, crossings };
}
