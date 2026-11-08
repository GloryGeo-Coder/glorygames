import { quarterTurn } from './blueprint.mjs';
import { BLOCKS, LOT, SIDE, blockInfo, blockIndex, streetKeys } from './settlement.mjs';

const directions = ['south', 'east', 'north', 'west'];
const steps = { south: [0, 1], east: [1, 0], north: [0, -1], west: [-1, 0] };

export function previewBlockRow(city, { source, first, count, direction, turns }) {
  const result = { targets: [], pieces: [], streets: [], occupied: [], issue: '' };
  const index = blockIndex(city.pieces);
  if (!source || !first || !index[source.id]?.length) {
    result.issue = 'Choose a built source block.';
    return result;
  }
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > SIDE ||
    !Object.hasOwn(steps, direction) ||
    !Number.isInteger(turns) ||
    turns < 0 ||
    turns > 3
  ) {
    result.issue = 'Choose a valid row length, direction and rotation.';
    return result;
  }
  const [dx, dy] = steps[direction];
  for (let i = 0; i < count; i++) {
    const col = first.col + i * dx,
      row = first.row + i * dy;
    if (col < 0 || col >= SIDE || row < 0 || row >= SIDE) {
      result.issue = 'The row would extend beyond the city boundary.';
      break;
    }
    const target = BLOCKS[row * SIDE + col];
    result.targets.push(target);
    if (index[target.id].length) result.occupied.push(target);
  }
  if (result.occupied.length) {
    result.issue =
      'Already built: ' + result.occupied.map((b) => b.code).join(', ') + '. Choose empty blocks.';
  }
  if (result.issue) return result;

  let local = index[source.id].map(({ type, color, x, y, z, r }) => ({
    type,
    color,
    y,
    r,
    x: x - source.x + LOT / 2,
    z: z - source.z + LOT / 2
  }));
  for (let i = 0; i < turns; i++) local = local.map((p) => quarterTurn(p, LOT));
  const edges = streetKeys(source);
  const sides = directions.flatMap((side, i) =>
    city.streets.includes(edges[side]) ? [directions[(i + turns) % 4]] : []
  );
  const streets = new Set(city.streets);
  for (const b of result.targets) {
    for (const p of local)
      result.pieces.push({ ...p, x: p.x + b.x - LOT / 2, z: p.z + b.z - LOT / 2 });
    const keys = streetKeys(b);
    for (const side of sides) {
      const key = keys[side];
      if (!streets.has(key)) {
        streets.add(key);
        result.streets.push(key);
      }
    }
  }
  return result;
}
export function stageBlockRow(city, spec) {
  const row = previewBlockRow(city, spec);
  if (row.issue) return city;
  const blocks = { ...city.blocks };
  for (const b of row.targets) {
    if (!blocks[b.id]?.zone)
      blocks[b.id] = { ...blocks[b.id], name: '', zone: blockInfo(city, spec.source).zone };
  }
  const pieces = row.pieces.map((p) => ({
    ...p,
    id: crypto.getRandomValues(new Uint32Array(4)).join('-')
  }));
  return {
    ...city,
    blocks,
    pieces: [...city.pieces, ...pieces],
    streets: [...city.streets, ...row.streets]
  };
}
