import {
  BLOCKS,
  HALF,
  HOUSEHOLDS,
  PITCH,
  SIDE,
  ZONES,
  blockInfo,
  blockIndex,
  layoutEdit,
  streetKeys,
  streetSegment
} from './settlement.mjs';
import { planStreets, sectionLabel } from './street-planner.mjs';
import { PALETTE, size } from './model.mjs';
const $ = (id) => document.getElementById(id);
export function cityMap(commit) {
  const dialog = $('cityMap'),
    canvas = $('cityAtlas'),
    ctx = canvas.getContext('2d');
  const scale = canvas.width / (HALF * 2);
  let original, working, block, editable, plan;
  let closeUp = false,
    viewX = 0,
    viewY = 0,
    zoom = 1;
  const px = (x) => (HALF + x) * scale,
    py = (z) => (HALF - z) * scale;
  function routeLine(points, color, width, dash = []) {
    if (points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(px(points[0].x), py(points[0].z));
    for (const p of points.slice(1)) ctx.lineTo(px(p.x), py(p.z));
    ctx.stroke();
  }
  function paintRoute() {
    if (!plan) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const key of plan.missing) {
      const s = streetSegment(key);
      const dx = s.axis === 'h' ? s.w / 2 : 0,
        dz = s.axis === 'v' ? s.d / 2 : 0;
      routeLine(
        [
          { x: s.x - dx, z: s.z - dz },
          { x: s.x + dx, z: s.z + dz }
        ],
        '#b64e19',
        8,
        [7, 6]
      );
    }
    routeLine(plan.points, '#fff7da', 5);
    routeLine(plan.points, '#174e78', 2.5, plan.missing.length ? [5, 4] : []);
    for (const [front, letter, color] of [
      [plan.home, 'H', '#163f74'],
      [plan.destination, 'D', '#7d365c']
    ]) {
      if (!front) continue;
      routeLine([front.center, front.curb], color, 2, [3, 4]);
      const x = px(front.center.x),
        y = py(front.center.z);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter, x, y);
    }
    ctx.restore();
  }
  function routePreview() {
    const profile = HOUSEHOLDS.find((p) => p.key === $('mapRoute').value);
    plan = profile && planStreets(working, working[profile.key]);
    $('mapConnect').hidden = !editable || !plan?.missing.length;
    const summary = $('mapRouteSummary');
    if (!plan) {
      summary.textContent = '';
      return;
    }
    if (!plan.home || !plan.destination) {
      const absent = [!plan.home && 'home', !plan.destination && 'destination']
        .filter(Boolean)
        .join(' and ');
      summary.textContent =
        profile.name +
        ' needs a ' +
        absent +
        ' entrance. Restore it or reassign the trip in Residents.';
      return;
    }
    const endpoints =
      'H · ' +
      plan.home.block.code +
      ' → D · ' +
      profile.destination +
      ' in ' +
      plan.destination.block.code +
      '. ';
    if (plan.distance === null) {
      summary.textContent = endpoints + 'The entrances do not meet the street grid.';
      return;
    }
    if (plan.missing.length) {
      summary.textContent =
        endpoints +
        'Disconnected. Dashed streets show ' +
        plan.missing.length +
        ' missing ' +
        (plan.missing.length === 1 ? 'section' : 'sections') +
        ' (' +
        plan.missing.slice(0, 3).map(sectionLabel).join(', ') +
        (plan.missing.length > 3 ? ', …' : '') +
        ').' +
        (editable ? '' : ' Switch to Build to preview a connection.');
      return;
    }
    const prior =
      working.streets !== original.streets ? planStreets(original, original[profile.key]) : plan;
    let detail = 'Connected · ' + Math.round(plan.distance) + ' studs between entrance streets.';
    if (prior.missing.length)
      detail += ' New connection in this preview. Build here saves it. Closing discards it.';
    else if (prior.distance !== null && Math.abs(prior.distance - plan.distance) >= 0.5)
      detail += ' Saved route: ' + Math.round(prior.distance) + ' studs.';
    summary.textContent = endpoints + detail;
  }
  for (const b of BLOCKS) $('mapBlock').add(new Option(b.code, String(b.id)));
  for (const [key, z] of Object.entries(ZONES)) $('mapZone').add(new Option(z.name, key));
  function fitRoute() {
    zoom = 1;
    viewX = viewY = 0;
    const canFit = plan?.home && plan?.destination;
    $('mapRouteZoom').hidden = !canFit;
    $('mapRouteZoom').textContent = closeUp ? 'Whole town' : 'Route close-up';
    if (!closeUp || !canFit) return;
    const points = [plan.home.center, plan.destination.center, ...plan.points];
    for (const key of plan.missing) {
      const edge = streetSegment(key),
        dx = edge.axis === 'h' ? PITCH / 2 : 0,
        dz = edge.axis === 'v' ? PITCH / 2 : 0;
      points.push({ x: edge.x - dx, z: edge.z - dz }, { x: edge.x + dx, z: edge.z + dz });
    }
    const xs = points.map((p) => px(p.x)),
      ys = points.map((p) => py(p.z));
    const left = Math.min(...xs),
      right = Math.max(...xs),
      top = Math.min(...ys),
      bottom = Math.max(...ys);
    const side = Math.min(
      canvas.width,
      Math.max(canvas.width / 2.5, Math.max(right - left, bottom - top) + PITCH * scale)
    );
    zoom = canvas.width / side;
    viewX = Math.max(0, Math.min(canvas.width - side, (left + right - side) / 2));
    viewY = Math.max(0, Math.min(canvas.height - side, (top + bottom - side) / 2));
  }
  function paint() {
    routePreview();
    fitRoute();
    ctx.save();
    ctx.setTransform(zoom, 0, 0, zoom, -viewX * zoom, -viewY * zoom);
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
    paintRoute();
    ctx.restore();
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
  $('mapRoute').onchange = () => {
    closeUp = !!$('mapRoute').value;
    paint();
  };
  $('mapRouteZoom').onclick = () => {
    closeUp = !closeUp;
    paint();
  };
  $('mapConnect').onclick = () => {
    if (!editable || !plan?.missing.length) return;
    working = { ...working, streets: [...working.streets, ...plan.missing] };
    select(block);
  };
  $('mapBlock').onchange = () => select(BLOCKS[Number($('mapBlock').value)]);
  $('blockName').oninput = $('mapZone').onchange = edit;
  for (const dir of ['north', 'south', 'east', 'west']) $('road-' + dir).onchange = edit;
  canvas.onclick = (e) => {
    const r = canvas.getBoundingClientRect(),
      col = Math.floor(
        (viewX + (((e.clientX - r.left) / r.width) * canvas.width) / zoom) / (PITCH * scale)
      ),
      row = Math.floor(
        (viewY + (((e.clientY - r.top) / r.height) * canvas.height) / zoom) / (PITCH * scale)
      );
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
    closeUp = false;
    editable = editing;
    working = original = city;
    const routes = HOUSEHOLDS.filter(({ key }) => city[key]);
    $('mapRouteTools').hidden = !routes.length;
    $('mapRoute').replaceChildren(new Option('Map only', ''));
    for (const profile of routes)
      $('mapRoute').add(new Option(profile.name + ' · ' + profile.destination, profile.key));
    $('mapFields').hidden = !editing;
    select(active);
    dialog.showModal();
  };
}
