import { parkSummary } from './community-garden.mjs';
import {
  BLOCKS,
  HALF,
  householdsFor,
  PITCH,
  SIDE,
  ZONES,
  blockInfo,
  blockAt,
  blockIndex,
  layoutEdit,
  streetKeys,
  streetSegment
} from './settlement.mjs';
import { planStreets, sectionLabel } from './street-planner.mjs';
import { previewBlockRow, stageBlockRow } from './block-expansion.mjs';
import { lightingMode, streetLamps, surveyLighting, suggestLamp } from './street-lighting.mjs';
import { neighbourhoodMap } from './neighbourhood-map.mjs';
import { streetBuilderMap } from './street-builder-map.mjs';
import { streetDirectoryMap } from './street-directory.mjs';
import { trailMap } from './trail-map.mjs';
import { PALETTE, size } from './model.mjs';
const $ = (id) => document.getElementById(id);
export function cityMap(commit) {
  const dialog = $('cityMap'),
    canvas = $('cityAtlas'),
    ctx = canvas.getContext('2d');
  const scale = canvas.width / (HALF * 2);
  let original, working, block, editable, plan;
  let trailClose = true,
    closeUp = false,
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
  let survey = null,
    lampSite = null;
  function lightPreview() {
    const available = !!plan && !plan.missing.length && plan.distance !== null;
    $('routeLightLabel').hidden = !available;
    survey =
      available && $('routeLight').checked
        ? surveyLighting(plan.points, streetLamps(working.pieces))
        : null;
    lampSite = editable && survey ? suggestLamp(working.pieces, survey, plan.home.block) : null;
    $('mapAimLamp').hidden = !lampSite;
    const summary = $('routeLightSummary');
    if (!survey) {
      summary.textContent = '';
      return;
    }
    if (!survey.total) {
      summary.textContent = 'The entrances share a curb. There is no street segment to light.';
      return;
    }
    const gaps = survey.spans.filter((s) => !s.lit);
    if (!gaps.length) {
      summary.textContent = 'Fully lit · ' + Math.round(survey.total) + ' street studs covered.';
      return;
    }
    const gap = gaps[0],
      x = (gap.a.x + gap.b.x) / 2,
      z = (gap.a.z + gap.b.z) / 2;
    summary.textContent =
      Math.floor((100 * survey.lit) / survey.total) +
      '% lit · ' +
      Math.ceil(survey.total - survey.lit) +
      ' unlit studs. First gap near ' +
      blockAt(x, z).code +
      ' (' +
      Math.round(x) +
      ', ' +
      Math.round(z) +
      '). Place a streetlamp on a nearby plot.';
  }
  const builder = streetBuilderMap({
    city: () => working,
    paint,
    stage: (streets, streetNames) => {
      if (!editable) return;
      working = { ...working, streets, streetNames };
      select(block);
    }
  });
  // The original town-trail map action starts a walk at a specific curb.
  function walkFromCurb(front) {
    dialog.close();
    commit(working, front.block, { kind: 'trail', front }, working !== original);
  }
  let directoryClose = true;
  const directory = streetDirectoryMap({ city: () => working, paint, walk: walkFromCurb });
  $('directoryZoom').onclick = () => {
    directoryClose = !directoryClose;
    paint();
  };
  $('streetDirectory').querySelector('summary').onclick = () => {
    if (!$('streetDirectory').open) directory.open();
  };
  $('streetDirectory').ontoggle = () => {
    if (!dialog.open) return;
    if ($('streetDirectory').open) {
      directoryClose = true;
      $('streetBuilder').open =
        $('areaBoard').open =
        $('trailBoard').open =
        $('blockRepeat').open =
          false;
      $('mapRoute').value = '';
      closeUp = false;
    }
    paint();
  };
  $('streetBuilder').ontoggle = () => {
    if (!dialog.open) return;
    if ($('streetBuilder').open) {
      $('streetDirectory').open = false;
      $('areaBoard').open = $('trailBoard').open = $('blockRepeat').open = false;
      $('mapRoute').value = '';
      closeUp = false;
    }
    paint();
  };
  const areas = neighbourhoodMap({
    city: () => working,
    active: () => block,
    editable: () => editable,
    stage: (blocks) => {
      working = { ...working, blocks };
    },
    select,
    paint
  });
  $('areaBoard').querySelector('summary').onclick = () => {
    if (!$('areaBoard').open) areas.open();
  };
  $('areaBoard').ontoggle = () => {
    if (!dialog.open) return;
    if ($('areaBoard').open) {
      $('streetDirectory').open = false;
      $('streetBuilder').open = false;
      $('trailBoard').open = $('blockRepeat').open = false;
      $('mapRoute').value = '';
      closeUp = false;
    }
    paint();
  };
  const trails = trailMap({
    city: () => working,
    stage: (trail) => {
      working = { ...working, trail };
    },
    repaint: paint,
    launch: walkFromCurb
  });
  $('trailBoard').ontoggle = () => {
    if (!dialog.open) return;
    if ($('trailBoard').open) {
      $('streetDirectory').open = false;
      $('streetBuilder').open = false;
      $('areaBoard').open = false;
      trails.sync();
      trailClose = true;
      $('blockRepeat').open = false;
      $('mapRoute').value = '';
      closeUp = false;
    }
    paint();
  };
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
    if (survey) {
      for (const span of survey.spans)
        routeLine([span.a, span.b], span.lit ? '#af6c05' : '#403759', 4, span.lit ? [] : [4, 4]);
    } else routeLine(plan.points, '#174e78', 2.5, plan.missing.length ? [5, 4] : []);
    for (const [front, letter, color] of [
      [plan.home, 'H', '#163f74'],
      [
        plan.destination,
        plan.destination?.seat ? 'P' : 'D',
        plan.destination?.seat ? '#30654c' : '#7d365c'
      ]
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
  function rowSpec() {
    return {
      source: BLOCKS[Number($('repeatSource').value)],
      first: block,
      count: Number($('repeatCount').value),
      direction: $('repeatDir').value,
      turns: Number($('repeatTurns').value)
    };
  }
  function rowPreview() {
    if (!editable || !$('blockRepeat').open) return null;
    const row = previewBlockRow(working, rowSpec());
    $('repeatStage').disabled = !!row.issue;
    $('repeatPreview').textContent =
      row.issue ||
      row.targets.map((b) => b.code).join(', ') +
        ' · ' +
        row.pieces.length +
        ' bricks · ' +
        row.streets.length +
        ' new street sections';
    return row;
  }
  function paintRow(row) {
    if (!row) return;
    ctx.save();
    for (const b of row.targets) {
      const left = px(b.x - 10),
        top = py(b.z + 10),
        width = 20 * scale;
      const occupied = row.occupied.includes(b);
      ctx.fillStyle = occupied ? '#a52c3440' : '#27876838';
      ctx.fillRect(left, top, width, width);
      ctx.strokeStyle = occupied ? '#a52c34' : '#127157';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(left, top, width, width);
    }
    ctx.fillStyle = '#328869';
    for (const key of row.streets) {
      const s = streetSegment(key);
      ctx.fillRect(px(s.x - s.w / 2), py(s.z + s.d / 2), s.w * scale, s.d * scale);
    }
    ctx.globalAlpha = 0.72;
    for (const p of row.pieces) {
      const a = size(p);
      ctx.fillStyle = PALETTE[p.color];
      ctx.fillRect(px(p.x), py(p.z + a.d), a.w * scale, a.d * scale);
    }
    ctx.restore();
  }
  function sourceOptions(preferred) {
    const index = blockIndex(working.pieces);
    const built = BLOCKS.filter((b) => index[b.id].length);
    $('repeatSource').replaceChildren(
      ...built.map((b) => new Option(b.code + ' · ' + index[b.id].length + ' bricks', String(b.id)))
    );
    if (built.some((b) => b.id === preferred)) $('repeatSource').value = String(preferred);
    $('blockRepeat').hidden = !editable || !built.length;
  }
  for (let n = 1; n <= SIDE; n++) $('repeatCount').add(new Option(String(n), String(n)));
  for (const id of ['repeatSource', 'repeatCount', 'repeatDir', 'repeatTurns'])
    $(id).onchange = paint;
  $('blockRepeat').ontoggle = () => {
    if (!$('cityMap').open) return;
    if ($('blockRepeat').open) {
      $('streetDirectory').open = false;
      $('streetBuilder').open = false;
      $('areaBoard').open = false;
      $('trailBoard').open = false;
      $('mapRoute').value = '';
      closeUp = false;
    }
    paint();
  };
  $('repeatStage').onclick = () => {
    if (!editable || !$('blockRepeat').open) return;
    const spec = rowSpec(),
      updated = stageBlockRow(working, spec);
    if (updated === working) {
      paint();
      return;
    }
    working = updated;
    $('repeatNotice').textContent =
      'Staged ' +
      spec.count +
      ' ' +
      (spec.count === 1 ? 'block' : 'blocks') +
      ' from ' +
      spec.source.code +
      '. Build here saves the map. Close to discard.';
    $('blockRepeat').open = false;
    sourceOptions(spec.source.id);
    select(block);
  };
  function routePreview() {
    const profile = householdsFor(working).find((p) => p.key === $('mapRoute').value);
    plan = profile && planStreets(working, working[profile.key]);
    $('mapConnect').hidden = !editable || !plan?.missing.length;
    const summary = $('mapRouteSummary');
    if (!plan) {
      summary.textContent = '';
      return;
    }
    if (!plan.home || !plan.destination) {
      if (profile.visit === 'park' && !plan.destination) {
        summary.textContent =
          profile.name +
          ' needs ' +
          (!plan.home ? 'a home entrance and ' : '') +
          'a ground-floor bench in a park. Restore it or reassign the trip in Residents.';
        return;
      }
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
      (profile.visit === 'park' ? ' → P · ' : ' → D · ') +
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
    let detail =
      'Connected · ' +
      Math.round(plan.distance) +
      (profile.visit === 'park'
        ? ' studs between the home and park streets.'
        : ' studs between entrance streets.');
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
    const trailPoints = trails.atlasPoints();
    $('trailZoom').hidden = !trailPoints.length;
    $('trailZoom').textContent = trailClose ? 'Whole town' : 'Trail close-up';
    const directoryPoints = directory.atlasPoints();
    $('directoryZoom').textContent = directoryClose ? 'Whole town' : 'Street close-up';
    let points;
    if (directoryPoints.length && directoryClose) points = directoryPoints;
    else if (trailPoints.length && trailClose) points = trailPoints;
    else if (canFit && closeUp)
      points = [plan.home.center, plan.destination.center, ...plan.points];
    else return;
    for (const key of plan?.missing || []) {
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
    $('mapFields').hidden =
      !editable ||
      $('blockRepeat').open ||
      $('areaBoard').open ||
      $('streetBuilder').open ||
      $('streetDirectory').open;
    $('parkMapTip').textContent =
      $('mapFields').hidden && editable ? '' : parkSummary(working, block, Date.now());
    routePreview();
    lightPreview();
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
    areas.draw(ctx, PITCH * scale);
    paintRow(rowPreview());
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
    trails.draw(ctx, px, py, routeLine);
    builder.draw(ctx, PITCH * scale);
    directory.draw(ctx, px, py, routeLine);
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
  $('townLighting').onchange = () => {
    working = { ...working, lighting: lightingMode($('townLighting').value) };
    paint();
  };
  $('routeLight').onchange = paint;
  $('mapAimLamp').onclick = () => {
    if (!lampSite) return;
    dialog.close();
    commit(
      working,
      blockAt(lampSite.x, lampSite.z),
      { kind: 'build', lamp: lampSite },
      working !== original
    );
  };
  $('mapRoute').onchange = () => {
    if ($('mapRoute').value) {
      $('streetDirectory').open = false;
      $('streetBuilder').open = false;
      $('areaBoard').open = false;
      $('blockRepeat').open = false;
      $('trailBoard').open = false;
    }
    closeUp = !!$('mapRoute').value;
    paint();
  };
  $('trailZoom').onclick = () => {
    trailClose = !trailClose;
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
      x = (viewX + (((e.clientX - r.left) / r.width) * canvas.width) / zoom) / (PITCH * scale),
      y = (viewY + (((e.clientY - r.top) / r.height) * canvas.height) / zoom) / (PITCH * scale);
    if (directory.pick(x * PITCH - HALF, HALF - y * PITCH) || (editable && builder.pick(x, y)))
      return;
    const col = Math.floor(x),
      row = Math.floor(y);
    if (col >= 0 && row >= 0 && col < SIDE && row < SIDE) select(BLOCKS[row * SIDE + col]);
  };
  function finish(action) {
    const changed = working !== original;
    dialog.close();
    commit(working, block, { kind: action }, changed);
  }
  $('mapOverview').onclick = () => finish('overview');
  $('mapBuild').onclick = () => finish('build');
  $('mapWalk').onclick = () => finish('walk');
  return (city, active, editing) => {
    closeUp = false;
    editable = editing;
    working = original = city;
    $('streetDirectory').open = false;
    $('streetBuilder').open = false;
    $('streetBuilder').hidden = !editing;
    builder.reset();
    $('areaBoard').open = false;
    $('trailBoard').open = false;
    trails.reset(editing);
    $('townLighting').value = lightingMode(city.lighting);
    $('routeLight').checked = false;
    $('blockRepeat').open = false;
    $('repeatCount').value = '1';
    $('repeatDir').value = 'east';
    $('repeatTurns').value = '0';
    $('repeatNotice').textContent = '';
    sourceOptions(active.id);
    const routes = householdsFor(city).filter(({ key }) => city[key]);
    $('mapRouteTools').hidden = !routes.length;
    $('mapRoute').replaceChildren(new Option('Map only', ''));
    for (const profile of routes)
      $('mapRoute').add(new Option(profile.name + ' · ' + profile.destination, profile.key));
    $('mapFields').hidden = !editing;
    select(active);
    areas.open();
    dialog.showModal();
  };
}
