import { LOTS } from './district.mjs';
import { PALETTE, parts, partFootprint, size, intervals, TYPES } from './model.mjs';
import { PLAN_PREFIX, KIOSK, readPlan, makePlan, capturePieces, bounds } from './blueprint.mjs';

const $ = (id) => document.getElementById(id);
function drawPlan(plan) {
  const canvas = $('planMap'),
    ctx = canvas.getContext('2d'),
    b = bounds(plan.pieces);
  const k = Math.min((canvas.width - 24) / b.w, (canvas.height - 20) / b.d);
  const left = (canvas.width - b.w * k) / 2,
    top = (canvas.height - b.d * k) / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of [...plan.pieces].sort((a, b) => a.y - b.y)) {
    ctx.fillStyle = PALETTE[p.color];
    ctx.strokeStyle = '#264545';
    for (const face of parts(p.type)) {
      const f = partFootprint(p, face);
      const x = left + f.x * k,
        z = top + f.z * k;
      ctx.fillRect(x, z, f.w * k, f.d * k);
      ctx.strokeRect(x, z, f.w * k, f.d * k);
    }
    if (k > 5 && TYPES[p.type].shape !== 'ramp') {
      const a = size(p);
      ctx.strokeStyle = '#18393666';
      for (let x = p.x + 0.5; x < p.x + a.w; x++)
        for (let z = p.z + 0.5; z < p.z + a.d; z++) {
          if (!intervals(p, x, z).length) continue;
          ctx.beginPath();
          ctx.arc(left + x * k, top + z * k, 0.2 * k, 0, Math.PI * 2);
          ctx.stroke();
        }
    }
  }
}
export function planBook(use) {
  const dialog = $('planBook'),
    list = $('planList'),
    source = $('planSource'),
    msg = $('planMessage');
  const session = new Map();
  let designs = new Map(),
    context,
    selection = [],
    confirmDelete = false;
  function read() {
    designs = new Map([['kiosk', KIOSK]]);
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(PLAN_PREFIX)) continue;
        try {
          designs.set(key, readPlan(localStorage.getItem(key)));
        } catch {
          msg.textContent = 'One or more saved blueprints could not be read.';
        }
      }
    } catch {
      msg.textContent = 'Device storage is unavailable. New blueprints will last for this session.';
    }
    for (const [key, plan] of session) designs.set(key, plan);
  }
  function details() {
    const plan = designs.get(list.value),
      b = bounds(plan.pieces);
    $('planStats').textContent = plan.pieces.length + ' bricks · ' + b.w + ' × ' + b.d + ' studs';
    drawPlan(plan);
    confirmDelete = false;
    $('deletePlan').textContent = 'Delete';
    $('deletePlan').hidden = list.value === 'kiosk';
  }
  function populate(key) {
    list.replaceChildren();
    for (const [id, plan] of designs) list.add(new Option(plan.name, id));
    list.value = designs.has(key) ? key : 'kiosk';
    details();
  }
  function selectSource() {
    selection = capturePieces(
      context.items,
      source.value === 'group' ? context.seed : null,
      LOTS[Number(source.value)]
    );
    count();
  }
  function count() {
    const n = selection.length;
    $('captureCount').textContent = n + ' ' + (n === 1 ? 'brick' : 'bricks');
    $('savePlan').disabled = !n || !$('planName').value.trim();
  }
  source.onchange = selectSource;
  $('planName').oninput = count;
  list.onchange = () => {
    msg.textContent = '';
    details();
  };
  $('capturePlan').onsubmit = (e) => {
    e.preventDefault();
    const pieces = selection,
      name = $('planName').value.trim();
    if (!pieces.length || !name) return;
    const plan = makePlan(name, pieces);
    const key = PLAN_PREFIX + crypto.getRandomValues(new Uint32Array(4)).join('-');
    try {
      localStorage.setItem(key, JSON.stringify(plan));
      msg.textContent = 'Blueprint saved on this device.';
    } catch {
      session.set(key, plan);
      msg.textContent = 'Device storage unavailable. Blueprint kept for this session.';
    }
    designs.set(key, plan);
    populate(key);
    $('planName').value = '';
    count();
  };
  $('deletePlan').onclick = () => {
    if (list.value === 'kiosk') return;
    if (!confirmDelete) {
      confirmDelete = true;
      $('deletePlan').textContent = 'Confirm delete';
      return;
    }
    if (!session.has(list.value))
      try {
        localStorage.removeItem(list.value);
      } catch {
        msg.textContent = 'Could not delete this blueprint.';
        return;
      }
    session.delete(list.value);
    designs.delete(list.value);
    populate('kiosk');
    msg.textContent = 'Blueprint deleted.';
  };
  $('usePlan').onclick = () => {
    const plan = designs.get(list.value);
    dialog.close();
    use(plan);
  };
  return (items, seed, kind, lot) => {
    context = { items, seed };
    msg.textContent = '';
    read();
    populate(list.value);
    source.replaceChildren();
    if (seed) source.add(new Option('Structure around selected brick', 'group'));
    if (kind === 'district') LOTS.forEach((l, i) => source.add(new Option(l.name, String(i))));
    else source.add(new Option('Whole plot', 'plot'));
    source.value = seed ? 'group' : kind === 'district' ? String(lot < 0 ? 1 : lot) : 'plot';
    $('planName').value = '';
    selectSource();
    dialog.showModal();
  };
}
