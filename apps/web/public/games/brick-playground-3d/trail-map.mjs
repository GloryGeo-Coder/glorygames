import { blockAt, MAX_TRAIL_STOPS } from './settlement.mjs';
import { isEntrance } from './resident-trip.mjs';
import { prepareTrail, startingPavement, trailEntrance, trailLegs } from './town-trail.mjs';

const $ = (id) => document.getElementById(id);
export function trailMap({ city, stage, launch, repaint }) {
  let sourcePieces;
  let stops = [],
    doors = [],
    editing = false;
  const draftName = () => $('trailName').value.trim();
  function dirty() {
    const trail = city().trail;
    return (
      draftName() !== (trail?.name || '') ||
      JSON.stringify(stops) !== JSON.stringify(trail?.stops || [])
    );
  }
  function controls() {
    const data = city(),
      trail = data.trail,
      changed = dirty();
    const valid = editing && prepareTrail(data, draftName(), stops);
    $('trailStage').disabled = !valid || !changed;
    $('trailAdd').disabled = stops.length >= MAX_TRAIL_STOPS || stops.length >= doors.length;
    $('trailRemove').hidden = !editing || !trail;
    $('trailRestart').hidden = !trail || trail.stamps !== trail.stops.length;
    $('trailWalk').disabled = !trail || changed || !startingPavement(data);
    $('trailWalk').textContent = trail?.stamps ? 'Resume walk' : 'Start walk';
    const next = trail?.stops[trail.stamps];
    $('trailWalk').hidden = !!trail && !next;
    $('trailHint').textContent = changed
      ? valid
        ? 'Stage the trail, then use Start walk or Build here to save it.'
        : 'Give the trail a name and add two to five named stops at different entrances.'
      : !trail
        ? editing
          ? doors.length < 2
            ? 'Build two ground-floor doors or arches to start a town trail.'
            : 'Name a trail and add two to five doorway stops.'
          : 'Build mode lets you create a trail.'
        : !next
          ? trail.name + ' · Passport complete.'
          : !trailEntrance(data, next.door)
            ? 'Restore or replace the missing entrance for ' + next.label + '.'
            : trail.name +
              ' · ' +
              trail.stamps +
              '/' +
              trail.stops.length +
              ' stamped. Next: ' +
              next.label +
              '.';
    $('trailPassport').replaceChildren(
      ...(trail?.stops || []).map((stop, i) => {
        const li = document.createElement('li'),
          front = trailEntrance(data, stop.door);
        li.classList.toggle('stamped', i < trail.stamps);
        li.textContent =
          stop.label +
          ' · ' +
          (front?.block.code || 'Missing entrance') +
          (i < trail.stamps ? ' · ✓ stamped' : '');
        return li;
      })
    );
  }
  function rows() {
    $('trailRows').replaceChildren();
    stops.forEach((stop, i) => {
      const row = document.createElement('div'),
        label = document.createElement('input'),
        select = document.createElement('select'),
        up = document.createElement('button'),
        remove = document.createElement('button');
      label.value = stop.label;
      label.maxLength = 28;
      label.placeholder = 'Stop ' + (i + 1);
      label.setAttribute('aria-label', 'Stop ' + (i + 1) + ' name');
      label.oninput = () => {
        stop.label = label.value;
        controls();
      };
      select.setAttribute('aria-label', 'Stop ' + (i + 1) + ' entrance');
      for (const p of doors)
        select.add(new Option(blockAt(p.x, p.z).code + ' · (' + p.x + ', ' + p.z + ')', p.id));
      if (!doors.some((p) => p.id === stop.door))
        select.add(new Option('Missing entrance', stop.door));
      select.value = stop.door;
      select.onchange = () => {
        stop.door = select.value;
        controls();
      };
      up.textContent = '↑';
      up.type = remove.type = 'button';
      up.disabled = !i;
      up.setAttribute('aria-label', 'Move stop ' + (i + 1) + ' earlier');
      up.onclick = () => {
        [stops[i - 1], stops[i]] = [stops[i], stops[i - 1]];
        rows();
      };
      remove.textContent = '×';
      remove.setAttribute('aria-label', 'Remove stop ' + (i + 1));
      remove.onclick = () => {
        stops.splice(i, 1);
        rows();
      };
      row.append(label, select, up, remove);
      $('trailRows').append(row);
    });
    controls();
  }
  function reset(editable) {
    editing = editable;
    sourcePieces = city().pieces;
    doors = sourcePieces.filter(isEntrance);
    stops = (city().trail?.stops || []).map((stop) => ({ ...stop }));
    $('trailFields').hidden = !editing;
    $('trailFields').open = editing && !city().trail;
    $('trailName').value = city().trail?.name || '';
    rows();
  }
  $('trailName').oninput = controls;
  $('trailAdd').onclick = () => {
    const front = doors.find((p) => !stops.some((s) => s.door === p.id));
    if (!editing || !front || stops.length >= MAX_TRAIL_STOPS) return;
    stops.push({ door: front.id, label: 'Stop ' + (stops.length + 1) });
    rows();
  };
  function replace(trail) {
    stage(trail);
    reset(editing);
    repaint();
  }
  $('trailStage').onclick = () => {
    const trail = prepareTrail(city(), draftName(), stops);
    if (editing && trail) replace(trail);
  };
  $('trailRemove').onclick = () => {
    if (editing) replace(undefined);
  };
  $('trailRestart').onclick = () => {
    const trail = city().trail;
    if (trail && trail.stamps === trail.stops.length) replace({ ...trail, stamps: 0 });
  };
  $('trailWalk').onclick = () => {
    const front = startingPavement(city());
    if (front && !dirty()) launch(front);
  };
  let routeCity, legs;
  function route() {
    if (routeCity !== city()) {
      routeCity = city();
      legs = trailLegs(routeCity);
    }
    return legs;
  }
  function atlasPoints() {
    if (!$('trailBoard').open || !city().trail) return [];
    return route().flatMap((leg) =>
      [leg.home?.center, ...leg.points, leg.destination?.center].filter(Boolean)
    );
  }
  function draw(ctx, px, py, line) {
    if (!$('trailBoard').open || !city().trail) {
      $('trailLegs').textContent = '';
      return;
    }
    const data = city(),
      trail = data.trail,
      legs = route();
    const connected = legs.filter((leg) => leg.distance !== null && !leg.missing.length);
    const distance = Math.round(connected.reduce((n, leg) => n + leg.distance, 0));
    $('trailLegs').textContent =
      connected.length === legs.length
        ? distance + ' street studs between stop entrances.'
        : connected.length +
          ' of ' +
          legs.length +
          ' street connections built. Dashed lines show proposed connections.';
    ctx.save();
    ctx.lineCap = 'round';
    for (const leg of legs) {
      line(leg.points, '#fff4ce', 6);
      line(leg.points, '#8e3d65', 3, leg.missing.length ? [5, 4] : []);
    }
    trail.stops.forEach((stop, i) => {
      const front = trailEntrance(data, stop.door);
      if (!front) return;
      line([front.curb, front.center], '#743457', 2, [3, 3]);
      const x = px(front.center.x),
        y = py(front.center.z);
      ctx.fillStyle = i < trail.stamps ? '#27694f' : '#743457';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i + 1), x, y);
    });
    ctx.restore();
  }
  function sync() {
    if (sourcePieces !== city().pieces) {
      sourcePieces = city().pieces;
      doors = sourcePieces.filter(isEntrance);
      rows();
    }
  }
  return { reset, draw, sync, atlasPoints };
}
