import { BLOCKS, SIDE, householdsFor } from './settlement.mjs';
import { planStreets } from './street-planner.mjs';

export const JUNCTIONS = Array.from({ length: (SIDE + 1) ** 2 }, (_, id) => {
  const col = id % (SIDE + 1),
    row = Math.floor(id / (SIDE + 1));
  const block = BLOCKS[Math.min(row, SIDE - 1) * SIDE + Math.min(col, SIDE - 1)];
  return {
    id,
    col,
    row,
    label: block.code + ' ' + (row === SIDE ? 'S' : 'N') + (col === SIDE ? 'E' : 'W')
  };
});

export function previewStreet(city, start, end, bend, operation) {
  if (!Number.isInteger(start) || !Number.isInteger(end)) return null;
  const a = JUNCTIONS[start],
    b = JUNCTIONS[end];
  if (
    !a ||
    !b ||
    a === b ||
    !['horizontal', 'vertical'].includes(bend) ||
    !['lay', 'remove'].includes(operation)
  )
    return null;
  const corner = bend === 'horizontal' ? { col: b.col, row: a.row } : { col: a.col, row: b.row };
  const existing = new Set(city.streets),
    sections = [],
    changed = [];
  for (const [from, to] of [
    [a, corner],
    [corner, b]
  ]) {
    const dx = Math.sign(to.col - from.col),
      dy = Math.sign(to.row - from.row);
    let { col, row } = from;
    while (col !== to.col || row !== to.row) {
      const nextCol = col + dx,
        nextRow = row + dy;
      const key = [dx ? 'h' : 'v', Math.min(col, nextCol), Math.min(row, nextRow)].join('-');
      const change = operation === 'lay' ? !existing.has(key) : existing.has(key);
      sections.push({ key, col, row, nextCol, nextRow, change });
      if (change) changed.push(key);
      col = nextCol;
      row = nextRow;
    }
  }
  let streets = city.streets;
  if (changed.length) {
    if (operation === 'lay') streets = [...streets, ...changed];
    else {
      const removed = new Set(changed);
      streets = streets.filter((key) => !removed.has(key));
    }
  }
  return { sections, changed, streets };
}

function connectedDistance(city, trip) {
  const plan = planStreets(city, trip);
  return plan.missing.length ? null : plan.distance;
}
export function streetEffects(city, streets) {
  if (streets === city.streets) return [];
  const proposed = { ...city, streets },
    effects = [];
  for (const { name, key } of householdsFor(city)) {
    const trip = city[key];
    if (!trip) continue;
    const before = connectedDistance(city, trip),
      after = connectedDistance(proposed, trip);
    if (before === null && after !== null) effects.push(name + ' gains a street connection.');
    else if (before !== null && after === null)
      effects.push(name + ' loses the street connection.');
    else if (before !== null && after !== null && Math.abs(before - after) >= 0.5)
      effects.push(
        name +
          '’s street route is ' +
          Math.round(Math.abs(after - before)) +
          ' studs ' +
          (after < before ? 'shorter.' : 'longer.')
      );
  }
  return effects;
}
