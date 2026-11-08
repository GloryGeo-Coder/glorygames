import { BLOCKS, blockAt, blockIndex, blockInfo, householdsFor } from './settlement.mjs';

import { isEntrance } from './resident-trip.mjs';

export function members(city, name) {
  return name ? BLOCKS.filter((b) => blockInfo(city, b).neighbourhood === name) : [];
}
export function neighbourhoodNames(city) {
  return [
    ...new Set(
      Object.values(city.blocks)
        .map((b) => b.neighbourhood)
        .filter(Boolean)
    )
  ].sort();
}
const adjoining = (a, b) => Math.abs(a.col - b.col) + Math.abs(a.row - b.row) === 1;
function connected(blocks) {
  const reached = new Set([blocks[0]]);
  for (const here of reached) for (const b of blocks) if (adjoining(here, b)) reached.add(b);
  return reached.size === blocks.length;
}
export function boundaryChange(city, action, area, block, input = '') {
  const info = blockInfo(city, block),
    group = members(city, area),
    name = input.trim();
  if (action === 'create' || action === 'rename') {
    if (!name || name.length > 32) return { issue: 'Enter a name of 1–32 characters.' };
    if (neighbourhoodNames(city).some((n) => n !== area && n.toLowerCase() === name.toLowerCase()))
      return { issue: 'That neighbourhood name is already in use.' };
  }
  if (action !== 'create' && !group.length) return { issue: 'Choose an existing neighbourhood.' };
  let targets,
    next = area;
  switch (action) {
    case 'create':
    case 'add':
      if (info.neighbourhood)
        return { issue: block.code + ' already belongs to ' + info.neighbourhood + '.' };
      if (action === 'add' && !group.some((b) => adjoining(block, b)))
        return { issue: 'Choose a block that shares an edge with this neighbourhood.' };
      targets = [block];
      if (action === 'create') next = name;
      break;
    case 'remove':
      if (info.neighbourhood !== area) return { issue: 'Choose a block in this neighbourhood.' };
      if (group.length === 1)
        return {
          issue:
            'Select an adjoining block to extend the boundary, or Dissolve to remove this neighbourhood.'
        };
      if (!connected(group.filter((b) => b !== block)))
        return { issue: 'Removing this block would split the neighbourhood.' };
      targets = [block];
      next = '';
      break;
    case 'rename':
      if (name === area) return { issue: 'Enter a new name to rename this neighbourhood.' };
      targets = group;
      next = name;
      break;
    case 'dissolve':
      targets = group;
      next = '';
      break;
    default:
      return { issue: 'Unknown boundary edit.' };
  }
  const blocks = { ...city.blocks };
  for (const b of targets) {
    const info = { ...blocks[b.id] };
    if (next) info.neighbourhood = next;
    else delete info.neighbourhood;
    if (info.zone || info.neighbourhood) blocks[b.id] = info;
    else delete blocks[b.id];
  }
  return { blocks };
}
export function neighbourhoodStats(city, name) {
  const group = members(city, name),
    ids = new Set(group.map((b) => b.id)),
    index = blockIndex(city.pieces);
  const homes = new Map(city.pieces.filter(isEntrance).map((p) => [p.id, blockAt(p.x, p.z).id]));
  return {
    blocks: group.length,
    built: group.filter((b) => index[b.id].length).length,
    households: householdsFor(city).filter((p) => ids.has(homes.get(city[p.key]?.home))).length
  };
}
