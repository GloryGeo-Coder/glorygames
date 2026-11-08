import { PLOT, TYPES, PALETTE, size, validPiece, snapHeight } from './model.mjs';
import { LOTS } from './district.mjs';

export const PLAN_PREFIX = 'wga.brick.blueprint.v1.';
export const plansAllowed = (kind) => kind === 'free' || kind === 'district';

export function bounds(items) {
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity,
    maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;
  for (const p of items) {
    const a = size(p);
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    minZ = Math.min(minZ, p.z);
    maxX = Math.max(maxX, p.x + a.w);
    maxY = Math.max(maxY, p.y + a.h);
    maxZ = Math.max(maxZ, p.z + a.d);
  }
  return { x: minX, y: minY, z: minZ, w: maxX - minX, h: maxY - minY, d: maxZ - minZ };
}
function faceNeighbours(a, b) {
  const A = size(a),
    B = size(b);
  const dx = Math.min(a.x + A.w, b.x + B.w) - Math.max(a.x, b.x);
  const dy = Math.min(a.y + A.h, b.y + B.h) - Math.max(a.y, b.y);
  const dz = Math.min(a.z + A.d, b.z + B.d) - Math.max(a.z, b.z);
  return dx >= 0 && dy >= -0.001 && dz >= 0 && [dx, dy, dz].filter((v) => v > 0.001).length === 2;
}
export function capturePieces(items, seed, lot) {
  if (seed) {
    const seen = new Set([seed]),
      group = [seed];
    for (const piece of group)
      for (const p of items) {
        if (!seen.has(p) && faceNeighbours(piece, p)) {
          seen.add(p);
          group.push(p);
        }
      }
    return group;
  }
  if (!lot) return items;
  return items.filter((p) => p.x >= lot.x - 6 && p.x + size(p).w <= lot.x + 6);
}
export function makePlan(name, items) {
  const origin = bounds(items);
  return {
    name: name.trim(),
    pieces: items.map(({ x, y, z, type, color, r }) => ({
      type,
      color,
      r,
      x: x - origin.x,
      y: y - origin.y,
      z: z - origin.z
    }))
  };
}
// Stored plans use relative coordinates and contain no world IDs or mission settings.
export function readPlan(raw) {
  const v = JSON.parse(raw);
  if (
    !v ||
    typeof v.name !== 'string' ||
    !v.name.trim() ||
    v.name.length > 40 ||
    !Array.isArray(v.pieces) ||
    !v.pieces.length
  )
    throw Error('Invalid blueprint');
  const checked = [];
  for (const p of v.pieces) {
    if (
      !p ||
      !Number.isInteger(p.x) ||
      !Number.isInteger(p.z) ||
      !Object.hasOwn(TYPES, p.type) ||
      TYPES[p.type].garageOnly ||
      !Object.hasOwn(PALETTE, p.color) ||
      !validPiece({ ...p, x: p.x - PLOT, z: p.z - PLOT }, checked)
    )
      throw Error('Invalid blueprint brick');
    checked.push({ type: p.type, x: p.x - PLOT, z: p.z - PLOT, r: p.r, y: p.y });
  }
  return makePlan(v.name, v.pieces);
}
export function placement(plan, anchor, turns, stack, items, kind) {
  let pieces = plan.pieces;
  for (let i = 0; i < turns; i++) {
    const depth = bounds(pieces).d;
    pieces = pieces.map((p) => ({ ...p, x: depth - p.z - size(p).d, z: p.x, r: (p.r + 1) % 4 }));
  }
  pieces = pieces.map((p) => ({ ...p, x: p.x + anchor.x, z: p.z + anchor.z }));
  let base = 0;
  if (stack) for (const p of pieces) base = Math.max(base, snapHeight(p, items) - p.y);
  pieces = pieces.map((p) => ({ ...p, y: p.y + base }));
  const b = bounds(pieces);
  const sameLot = kind !== 'district' || LOTS.some((l) => b.x >= l.x - 6 && b.x + b.w <= l.x + 6);
  const ok = plansAllowed(kind) && sameLot && pieces.every((p) => validPiece(p, items, null, kind));
  return { pieces, ok, base };
}
export const KIOSK = makePlan('Spaza kiosk', [
  { type: 'floor', color: 'Chalk', x: 0, y: 0, z: 0, r: 0 },
  { type: 'door', color: 'Lagoon', x: 0, y: 1 / 3, z: 0, r: 0 },
  { type: 'wall', color: 'Coral', x: 3, y: 1 / 3, z: 0, r: 1 },
  { type: 'window', color: 'Lagoon', x: 0, y: 1 / 3, z: 3, r: 0 },
  { type: 'pair', color: 'Sun', x: 0, y: 1 / 3, z: 1, r: 1 }
]);
