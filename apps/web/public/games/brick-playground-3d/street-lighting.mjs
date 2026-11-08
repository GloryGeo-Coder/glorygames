import { blockAt } from './settlement.mjs';
import { validPiece } from './model.mjs';
const modes = ['clock', 'day', 'night'];
export function lightingMode(value) {
  return modes.includes(value) ? value : 'clock';
}
// Dusk lasts from 17:30 to 19:00. Dawn reverses the fade from 05:30 to 07:00.
export function darkness(mode, minutes = 450) {
  if (mode === 'night') return 1;
  if (mode === 'day') return 0;
  const m = ((minutes % 1440) + 1440) % 1440;
  const amount = m < 720 ? (420 - m) / 90 : (m - 1050) / 90;
  const t = Math.max(0, Math.min(1, amount));
  return t * t * (3 - 2 * t);
}
export const LIGHT_RANGE = 9.5,
  GLASS_HEIGHT = 2.55;
const cachedLamps = new WeakMap();
export function streetLamps(pieces) {
  let lamps = cachedLamps.get(pieces);
  if (!lamps) {
    lamps = pieces
      .filter((p) => p.type === 'streetlamp')
      .map((p) => {
        const y = p.y + GLASS_HEIGHT;
        return {
          x: p.x + 0.5,
          z: p.z + 0.5,
          y,
          radius: Math.sqrt(Math.max(0, LIGHT_RANGE ** 2 - y ** 2))
        };
      });
    cachedLamps.set(pieces, lamps);
  }
  return lamps;
}
// Intersect each street centreline with the circles of light on the ground. Merge overlaps once.
export function surveyLighting(points, lamps) {
  const spans = [];
  let total = 0,
    lit = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      dx = b.x - a.x,
      dz = b.z - a.z,
      len = Math.hypot(dx, dz);
    if (!len) continue;
    const ux = dx / len,
      uz = dz / len,
      intervals = [];
    for (const lamp of lamps) {
      const x = lamp.x - a.x,
        z = lamp.z - a.z,
        along = x * ux + z * uz,
        cross = x * uz - z * ux;
      const squared = lamp.radius ** 2 - cross ** 2;
      if (squared <= 0) continue;
      const half = Math.sqrt(squared),
        start = Math.max(0, along - half),
        end = Math.min(len, along + half);
      if (start < end) intervals.push([start, end]);
    }
    intervals.sort((u, v) => u[0] - v[0]);
    const merged = [];
    for (const [start, end] of intervals) {
      const last = merged.at(-1);
      if (last && start <= last[1] + 1e-8) last[1] = Math.max(last[1], end);
      else merged.push([start, end]);
    }
    const add = (start, end, on) => {
      if (end <= start) return;
      spans.push({
        a: { x: a.x + ux * start, z: a.z + uz * start },
        b: { x: a.x + ux * end, z: a.z + uz * end },
        lit: on
      });
      if (on) lit += end - start;
    };
    let cursor = 0;
    for (const [start, end] of merged) {
      add(cursor, start, false);
      add(start, end, true);
      cursor = end;
    }
    add(cursor, len, false);
    total += len;
  }
  return { total, lit, spans };
}

export function suggestLamp(pieces, survey, preferredBlock) {
  const gap = survey?.spans.find((span) => !span.lit);
  if (!gap) return null;
  const x = (gap.a.x + gap.b.x) / 2,
    z = (gap.a.z + gap.b.z) / 2,
    radiusSq = LIGHT_RANGE ** 2 - GLASS_HEIGHT ** 2;
  let best = null,
    nearest = radiusSq;
  for (let ix = Math.floor(x - LIGHT_RANGE); ix <= Math.floor(x + LIGHT_RANGE); ix++) {
    for (let iz = Math.floor(z - LIGHT_RANGE); iz <= Math.floor(z + LIGHT_RANGE); iz++) {
      const dist = (ix + 0.5 - x) ** 2 + (iz + 0.5 - z) ** 2;
      if (dist > nearest || dist >= radiusSq) continue;
      if (
        best &&
        dist === nearest &&
        (blockAt(ix, iz) !== preferredBlock || blockAt(best.x, best.z) === preferredBlock)
      )
        continue;
      const piece = { type: 'streetlamp', color: 'Sun', x: ix, y: 0, z: iz, r: 0 };
      if (validPiece(piece, pieces, null, 'city')) {
        best = piece;
        nearest = dist;
      }
    }
  }
  return best;
}
