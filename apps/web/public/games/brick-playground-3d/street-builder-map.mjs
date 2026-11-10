import { SIDE, PITCH } from './settlement.mjs';
import { JUNCTIONS, previewStreet, streetEffects } from './street-builder.mjs';

const $ = (id) => document.getElementById(id);
export function streetBuilderMap({ city, stage, paint }) {
  const start = $('streetStart'),
    end = $('streetEnd'),
    bend = $('streetBend'),
    mode = $('streetMode'),
    board = $('streetBuilder');
  for (const select of [start, end]) {
    select.add(new Option('Choose junction', ''));
    for (const j of JUNCTIONS) select.add(new Option(j.label, String(j.id)));
  }
  let preview = null,
    notice = '';
  function reset() {
    start.value = end.value = '';
    bend.value = 'horizontal';
    mode.value = 'lay';
    notice = '';
    preview = null;
  }
  function refresh() {
    if (!board.open) return;
    const a = JUNCTIONS[start.value],
      b = JUNCTIONS[end.value],
      cityData = city();
    preview = previewStreet(cityData, a?.id, b?.id, bend.value, mode.value);
    $('streetBendField').hidden = !(a && b && a.col !== b.col && a.row !== b.row);
    const count = preview?.changed.length || 0;
    $('stageStreet').disabled = !count;
    $('clearStreet').disabled = !a && !b;
    const verb = mode.value === 'lay' ? 'lay' : 'remove';
    let text;
    if (!a) text = 'Tap a junction to start, or use the Start junction list.';
    else if (!b) text = 'Tap the end junction. Start: ' + a.label + '.';
    else if (a === b) text = 'Choose a different end junction.';
    else if (!count)
      text =
        mode.value === 'lay'
          ? 'All sections along this path are already built.'
          : 'There are no streets to remove along this path.';
    else
      text =
        preview.sections.length * PITCH +
        ' studs · ' +
        count +
        ' section' +
        (count === 1 ? '' : 's') +
        ' to ' +
        verb +
        '.';
    $('streetHint').textContent = [notice, text].filter(Boolean).join(' ');
    const effects = preview ? streetEffects(cityData, preview.streets) : [];
    $('streetEffects').replaceChildren(
      ...effects.map((effect) => {
        const li = document.createElement('li');
        li.textContent = effect;
        return li;
      })
    );
  }
  for (const select of [start, end, bend, mode])
    select.onchange = () => {
      notice = '';
      paint();
    };
  $('clearStreet').onclick = () => {
    start.value = end.value = '';
    notice = '';
    paint();
  };
  $('stageStreet').onclick = () => {
    if (!board.open || !preview?.changed.length) return;
    const n = preview.changed.length;
    notice = n + ' section' + (n === 1 ? '' : 's') + ' staged. Build here saves the map.';
    start.value = end.value;
    end.value = '';
    stage(preview.streets);
  };
  function pick(col, row) {
    if (!board.open) return false;
    const x = Math.max(0, Math.min(SIDE, Math.round(col))),
      y = Math.max(0, Math.min(SIDE, Math.round(row)));
    const select = start.value === '' ? start : end;
    select.value = String(y * (SIDE + 1) + x);
    notice = '';
    paint();
    return true;
  }
  function draw(ctx, cell) {
    if (!board.open) return;
    refresh();
    ctx.save();
    const inset = 5,
      pos = (n) => Math.max(inset, Math.min(cell * SIDE - inset, n * cell));
    ctx.fillStyle = '#3b5a65';
    for (const { col, row } of JUNCTIONS) {
      ctx.beginPath();
      ctx.arc(pos(col), pos(row), 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineCap = 'round';
    for (const s of preview?.sections || []) {
      ctx.strokeStyle = s.change ? (mode.value === 'lay' ? '#067057' : '#ac353c') : '#596972';
      ctx.lineWidth = s.change ? 7 : 4;
      ctx.setLineDash(s.change && mode.value === 'remove' ? [8, 5] : []);
      ctx.beginPath();
      ctx.moveTo(pos(s.col), pos(s.row));
      ctx.lineTo(pos(s.nextCol), pos(s.nextRow));
      ctx.stroke();
    }
    ctx.setLineDash([]);
    for (const [j, letter] of [
      [JUNCTIONS[start.value], 'S'],
      [JUNCTIONS[end.value], 'E']
    ]) {
      if (!j) continue;
      const x = Math.max(12, Math.min(cell * SIDE - 12, j.col * cell)),
        y = Math.max(12, Math.min(cell * SIDE - 12, j.row * cell));
      ctx.fillStyle = letter === 'S' ? '#254b64' : '#76365b';
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(letter, x, y);
    }
    ctx.restore();
  }
  return { reset, pick, draw };
}
