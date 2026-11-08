import { blockAt } from './settlement.mjs';
import {
  advanceTrip,
  entrance,
  isEntrance,
  newTrip,
  practiceSpaza,
  tripRuntime
} from './resident-trip.mjs';
const $ = (id) => document.getElementById(id);
export function residentControls({ city, editing, save, add, focus }) {
  let runtime = tripRuntime(),
    watching = false,
    clock = 0;
  function reset() {
    runtime = tripRuntime();
    watching = false;
    clock = 0;
  }
  function refresh() {
    const data = city(),
      t = data?.resident;
    if ($('residentPanel').hidden !== !data) $('residentPanel').hidden = !data;
    if (!data) return;
    if ($('resTools').hidden !== !t) $('resTools').hidden = !t;
    const title = !t
      ? ''
      : t.paused
        ? 'Lebo · Paused'
        : runtime.issue
          ? 'Lebo · Stopped'
          : t.phase === 'done'
            ? 'Lebo · Home again'
            : t.phase === 'shopping'
              ? 'Lebo · Shopping'
              : t.returning
                ? 'Lebo · Walking home'
                : 'Lebo · Walking to the spaza';
    const hint = t
      ? runtime.issue ||
        (t.phase === 'done' ? 'The round trip is complete.' : 'Block ' + blockAt(t.x, t.z).code)
      : '';
    if ($('resState').textContent !== title) $('resState').textContent = title;
    if ($('resHint').textContent !== hint) $('resHint').textContent = hint;
    const follow = watching ? 'Stop following' : 'Follow Lebo';
    if ($('resFollow').textContent !== follow) $('resFollow').textContent = follow;
  }
  function step(dt) {
    const data = city(),
      t = data?.resident;
    if (!t || t.paused || t.phase === 'done') return;
    const phase = t.phase,
      issue = runtime.issue;
    advanceTrip(data, t, runtime, dt);
    if (runtime.moving) clock += dt;
    if (t.phase !== phase || runtime.issue !== issue || clock >= 10) {
      clock = 0;
      save();
    }
  }
  function watch() {
    watching = true;
    focus(city().resident, null, true);
    refresh();
  }
  function options(shopId, homeId) {
    const data = city(),
      doors = data.pieces.filter(isEntrance),
      t = data.resident;
    for (const id of ['resHome', 'resShop']) {
      $(id).replaceChildren();
      for (const p of doors)
        $(id).add(
          new Option(
            blockAt(p.x, p.z).code + ' · (' + p.x + ', ' + p.z + ') · ' + entrance(p).direction,
            p.id
          )
        );
    }
    const home = doors.find((p) => p.id === (homeId || t?.home)) || doors[0];
    const shop = doors.find((p) => p.id === (shopId || t?.shop)) || doors.find((p) => p !== home);
    $('resHome').value = home?.id || '';
    $('resShop').value = shop?.id || '';
    $('resPractice').hidden = !editing() || !practiceSpaza(data);
    $('resSetupHint').textContent =
      doors.length < 2
        ? $('resPractice').hidden
          ? 'Build two ground-floor doorways, then choose a home and a spaza.'
          : 'Place two ground-floor doorways, or add the practice spaza with a blocked entrance.'
        : 'The front of each doorway should face a street along that block. Rotating a doorway changes its front.';
    $('resStart').textContent = t ? 'Start new trip' : 'Start trip';
    $('resEnd').hidden = $('resPause').hidden = !t;
    $('resPause').textContent = t?.paused ? 'Resume' : 'Pause';
    $('resPause').disabled = t?.phase === 'done';
    canStart();
  }
  function canStart() {
    $('resStart').disabled =
      !$('resHome').value || !$('resShop').value || $('resHome').value === $('resShop').value;
  }
  $('resHome').onchange = $('resShop').onchange = canStart;
  $('resSettings').onclick = () => {
    options();
    $('residentSetup').showModal();
  };
  $('resPractice').onclick = () => {
    const group = practiceSpaza(city());
    if (!group || !editing()) return;
    const pieces = group.map((p) => ({
      ...p,
      id: crypto.getRandomValues(new Uint32Array(4)).join('-')
    }));
    add(pieces);
    options(pieces.find(isEntrance).id, $('resHome').value);
    $('resSetupHint').textContent =
      'Practice spaza added in E4. The plum brick blocks its doorway.';
  };
  $('resStart').onclick = () => {
    const data = city(),
      home = data.pieces.find((p) => p.id === $('resHome').value),
      shop = data.pieces.find((p) => p.id === $('resShop').value);
    if (!isEntrance(home) || !isEntrance(shop) || home === shop) return;
    data.resident = newTrip(home, shop);
    reset();
    $('residentSetup').close();
    save();
    watch();
  };
  $('resEnd').onclick = () => {
    delete city().resident;
    reset();
    save();
    $('residentSetup').close();
    refresh();
  };
  $('resPause').onclick = () => {
    const t = city().resident;
    t.paused = !t.paused;
    save();
    $('residentSetup').close();
    refresh();
  };
  $('resFollow').onclick = () => {
    if (!watching) watch();
    else {
      watching = false;
      refresh();
    }
  };
  $('resEdit').onclick = () => {
    watching = false;
    focus(city().resident, runtime.blocker, false);
    refresh();
  };
  return {
    reset,
    refresh,
    step,
    stopFollowing() {
      watching = false;
    },
    get watching() {
      return watching;
    },
    get moving() {
      return runtime.moving;
    }
  };
}
