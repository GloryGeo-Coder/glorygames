import {
  BLOCKS,
  HALF,
  PITCH,
  SIDE,
  ZONES,
  blockInfo,
  blockIndex,
  layoutEdit,
  streetKeys,
  streetSegment
} from './settlement.mjs';
import { PALETTE, size } from './model.mjs';
const $ = (id) => document.getElementById(id);
export function cityMap(commit) {
  const dialog = $('cityMap'),
    canvas = $('cityAtlas'),
    ctx = canvas.getContext('2d');
  const scale = canvas.width / (HALF * 2);
  let original, working, block;
  for (const b of BLOCKS) $('mapBlock').add(new Option(b.code, String(b.id)));
  for (const [key, z] of Object.entries(ZONES)) $('mapZone').add(new Option(z.name, key));
  function paint() {
    ctx.fillStyle = '#d4d0bb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const b of BLOCKS) {
      const info = blockInfo(working, b);
      ctx.fillStyle = ZONES[info.zone].color;
      ctx.fillRect((HALF + b.x - 10) * scale, (HALF - b.z - 10) * scale, 20 * scale, 20 * scale);
    }
    ctx.fillStyle = '#516468';
    for (const key of working.streets) {
      const s = streetSegment(key);
      ctx.fillRect(
        (HALF + s.x - s.w / 2) * scale,
        (HALF - s.z - s.d / 2) * scale,
        s.w * scale,
        s.d * scale
      );
    }
    for (const p of working.pieces) {
      const a = size(p);
      ctx.fillStyle = PALETTE[p.color];
      ctx.fillRect((HALF + p.x) * scale, (HALF - p.z - a.d) * scale, a.w * scale, a.d * scale);
    }
    ctx.font = 'bold 15px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#28453e';
    for (const b of BLOCKS)
      ctx.fillText(b.code, b.col * PITCH * scale + 6, b.row * PITCH * scale + 6);
    ctx.strokeStyle = '#094e48';
    ctx.lineWidth = 5;
    ctx.strokeRect(
      block.col * PITCH * scale + 3,
      block.row * PITCH * scale + 3,
      PITCH * scale - 6,
      PITCH * scale - 6
    );
  }
  function select(b) {
    block = b;
    $('mapBlock').value = String(b.id);
    const info = blockInfo(working, b);
    $('blockName').value = info.name;
    $('mapZone').value = info.zone;
    for (const [dir, key] of Object.entries(streetKeys(b)))
      $('road-' + dir).checked = working.streets.includes(key);
    const index = blockIndex(working.pieces);
    $('mapStats').textContent =
      index.filter((group) => group.length).length +
      ' / ' +
      BLOCKS.length +
      ' built blocks · ' +
      working.pieces.length +
      ' bricks';
    paint();
  }
  function edit() {
    const edges = Object.keys(streetKeys(block)).filter((dir) => $('road-' + dir).checked);
    working = {
      ...working,
      ...layoutEdit(working, block, $('blockName').value, $('mapZone').value, edges)
    };
    paint();
  }
  $('mapBlock').onchange = () => select(BLOCKS[Number($('mapBlock').value)]);
  $('blockName').oninput = $('mapZone').onchange = edit;
  for (const dir of ['north', 'south', 'east', 'west']) $('road-' + dir).onchange = edit;
  canvas.onclick = (e) => {
    const r = canvas.getBoundingClientRect(),
      col = Math.floor(((e.clientX - r.left) * SIDE) / r.width),
      row = Math.floor(((e.clientY - r.top) * SIDE) / r.height);
    if (col >= 0 && row >= 0 && col < SIDE && row < SIDE) select(BLOCKS[row * SIDE + col]);
  };
  function finish(action) {
    const changed = working !== original;
    dialog.close();
    commit(working, block, action, changed);
  }
  $('mapOverview').onclick = () => finish('overview');
  $('mapBuild').onclick = () => finish('build');
  $('mapWalk').onclick = () => finish('walk');
  return (city, active, editing) => {
    working = original = city;
    $('mapFields').hidden = !editing;
    select(active);
    dialog.showModal();
  };
}
