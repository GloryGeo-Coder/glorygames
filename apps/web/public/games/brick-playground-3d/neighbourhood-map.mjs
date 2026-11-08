import { BLOCKS, SIDE, blockInfo } from './settlement.mjs';
import {
  boundaryChange,
  members,
  neighbourhoodNames,
  neighbourhoodStats
} from './neighbourhoods.mjs';

const $ = (id) => document.getElementById(id);
const colours = ['#265c84', '#803b63', '#306250', '#8a471c', '#645287'];
function mapColours(names) {
  const pens = new Map(),
    used = new Set();
  for (const name of names) {
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
    let i = hash % colours.length;
    while (used.size < colours.length && used.has(colours[i])) i = (i + 1) % colours.length;
    pens.set(name, colours[i]);
    used.add(colours[i]);
  }
  return pens;
}
export function neighbourhoodMap({ city, active, editable, stage, select, paint }) {
  let area = '';
  function choose(name) {
    area = name;
    const names = neighbourhoodNames(city());
    $('areaList').replaceChildren(
      new Option(editable() ? 'New neighbourhood' : 'Choose a neighbourhood', ''),
      ...names.map((n) => new Option(n, n))
    );
    $('areaList').value = area;
    $('areaName').value = area;
    $('areaEdit').hidden = !editable();
  }
  function membership() {
    return !area ? 'create' : blockInfo(city(), active()).neighbourhood === area ? 'remove' : 'add';
  }
  function controls() {
    if (!$('areaBoard').open) return;
    const b = active(),
      data = city(),
      action = membership(),
      owned = blockInfo(data, b).neighbourhood;
    const stats = neighbourhoodStats(data, area);
    $('areaStats').textContent = area
      ? stats.blocks +
        (stats.blocks === 1 ? ' block' : ' blocks') +
        ' · ' +
        stats.built +
        ' built · ' +
        stats.households +
        (stats.households === 1 ? ' household' : ' households')
      : '';
    $('areaMembership').textContent =
      { create: 'Create at ', add: 'Add ', remove: 'Remove ' }[action] + b.code;
    const name = $('areaName').value.trim();
    const problem = boundaryChange(data, action, area, b, name).issue;
    const renameIssue = boundaryChange(data, 'rename', area, b, name).issue;
    $('areaMembership').disabled = !!problem;
    $('areaRename').hidden = $('areaDissolve').hidden = !area;
    $('areaRename').disabled = !!renameIssue;
    $('areaHint').textContent = editable()
      ? (problem ||
          (area
            ? 'Select an adjoining block to extend the boundary.'
            : 'Create the neighbourhood on the selected block.')) +
        ' Build here or Walk here saves changes.'
      : (owned ? b.code + ' · ' + owned + '.' : b.code + ' is outside a named neighbourhood.') +
        ' Switch to Build to edit boundaries.';
    if (area && name !== area && renameIssue) $('areaHint').textContent = renameIssue;
  }
  function apply(action) {
    if (!editable()) return;
    const name = $('areaName').value.trim(),
      result = boundaryChange(city(), action, area, active(), name);
    if (!result.blocks) return;
    stage(result.blocks);
    choose(action === 'rename' || action === 'create' ? name : action === 'dissolve' ? '' : area);
    paint();
  }
  $('areaName').oninput = controls;
  $('areaMembership').onclick = () => apply(membership());
  $('areaRename').onclick = () => apply('rename');
  $('areaDissolve').onclick = () => apply('dissolve');
  $('areaList').onchange = () => {
    choose($('areaList').value);
    const first = members(city(), area)[0];
    if (first) select(first);
    else paint();
  };
  function open() {
    const here = blockInfo(city(), active()).neighbourhood;
    choose(here || (!editable() && neighbourhoodNames(city())[0]) || '');
  }
  function draw(ctx, cell) {
    if (!$('areaBoard').open) return;
    controls();
    const pens = mapColours(neighbourhoodNames(city()));
    $('areaStats').style.borderColor = pens.get(area) || 'transparent';
    ctx.save();
    for (const b of BLOCKS) {
      const name = blockInfo(city(), b).neighbourhood;
      if (!name) continue;
      const x = b.col * cell,
        y = b.row * cell,
        pen = pens.get(name);
      ctx.fillStyle = pen + (name === area ? '36' : '19');
      ctx.fillRect(x, y, cell, cell);
      ctx.lineWidth = name === area ? 5 : 2;
      ctx.strokeStyle = pen;
      const edges = [
        [0, -1, x, y, x + cell, y],
        [1, 0, x + cell, y, x + cell, y + cell],
        [0, 1, x, y + cell, x + cell, y + cell],
        [-1, 0, x, y, x, y + cell]
      ];
      for (const [dx, dy, x1, y1, x2, y2] of edges) {
        const next = BLOCKS[b.id + dy * SIDE + dx];
        if (
          next &&
          next.col === b.col + dx &&
          next.row === b.row + dy &&
          blockInfo(city(), next).neighbourhood === name
        )
          continue;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  return { open, draw };
}
