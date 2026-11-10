import { BLOCKS, SIDE, householdsFor, retainedStreetNames } from './settlement.mjs';
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

export function previewStreet(city, start, end, bend, operation, input = '') {
  if (!Number.isInteger(start) || !Number.isInteger(end)) return null;
  const a = JUNCTIONS[start],
    b = JUNCTIONS[end];
  if (
    !a ||
    !b ||
    a === b ||
    !['horizontal', 'vertical'].includes(bend) ||
    !['lay', 'remove', 'name', 'unname'].includes(operation)
  )
    return null;
  const corner = bend === 'horizontal' ? { col: b.col, row: a.row } : { col: a.col, row: b.row };
  const naming = operation === 'name' || operation === 'unname';
  const name = typeof input === 'string' ? input.trim() : '';
  let issue = '';
  if (operation === 'name' && (!name || name.length > 32))
    issue = 'Enter a street name of 1–32 characters.';
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
      const built = existing.has(key),
        old = city.streetNames?.[key];
      if (naming && !built) issue = 'Lay the missing sections before changing their names.';
      const change = naming
        ? built && (operation === 'name' ? !!name && old !== name : !!old)
        : operation === 'lay'
          ? !built
          : built;
      sections.push({ key, col, row, nextCol, nextRow, change });
      if (change) changed.push(key);
      col = nextCol;
      row = nextRow;
    }
  }
  let streets = city.streets,
    streetNames = city.streetNames;
  if (naming) {
    if (!issue && changed.length) {
      const names = { ...streetNames };
      for (const key of changed) {
        if (operation === 'name') names[key] = name;
        else delete names[key];
      }
      streetNames = Object.keys(names).length ? names : undefined;
    }
  } else if (changed.length) {
    if (operation === 'lay') streets = [...streets, ...changed];
    else {
      const removed = new Set(changed);
      streets = streets.filter((key) => !removed.has(key));
      streetNames = retainedStreetNames(streetNames, streets);
    }
  }
  return { sections, changed, streets, streetNames, issue };
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
