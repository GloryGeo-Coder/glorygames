import { blockAt, HOUSEHOLDS } from './settlement.mjs';
import {
  advanceTrip,
  entrance,
  isEntrance,
  newTrip,
  practiceHallTrip,
  practiceSpaza,
  tripRuntime
} from './resident-trip.mjs';

import {
  START_TIME,
  DEPARTURES,
  clockLabel,
  hasRoutines,
  nextDeparture,
  nextIdleDeparture,
  setRoutine,
  skipToDeparture,
  tickRoutines
} from './resident-routines.mjs';

const $ = (id) => document.getElementById(id);
function status(trip, runtime, profile) {
  if (!trip) return 'No trip';
  if (trip.paused) return 'Paused';
  if (runtime.issue) return 'Stopped';
  if (trip.phase === 'done') return trip.routine ? 'At home' : 'Home again';
  if (trip.phase === 'shopping') return profile.activity;
  return trip.returning ? 'Walking home' : 'Walking to the ' + profile.destination.toLowerCase();
}
function label(id, value) {
  if ($(id).textContent !== value) $(id).textContent = value;
}

export function residentControls({ city, editing, save, add, focus }) {
  const runtimes = new Map();
  let selected = null,
    watching = false,
    clock = 0;
  const active = () => selected || HOUSEHOLDS.find(({ key }) => city()?.[key]) || HOUSEHOLDS[0];
  const other = () => HOUSEHOLDS.find((p) => p !== active());
  function reset() {
    selected = null;
    watching = false;
    clock = 0;
    for (const { key } of HOUSEHOLDS) runtimes.set(key, tripRuntime());
  }
  reset();
  function refresh() {
    const data = city();
    if ($('residentPanel').hidden !== !data) $('residentPanel').hidden = !data;
    if (!data) return;
    const p = active(),
      trip = data[p.key],
      rt = runtimes.get(p.key),
      alternate = other(),
      second = data[alternate.key];
    const scheduled = hasRoutines(data),
      now = data.clockMinutes ?? START_TIME;
    label('resClock', scheduled ? 'Settlement time · ' + clockLabel(now) : '');
    const canSkip = scheduled && nextIdleDeparture(data) !== null;
    if ($('resSkip').hidden === canSkip) $('resSkip').hidden = !canSkip;
    if ($('resTools').hidden !== !trip) $('resTools').hidden = !trip;
    if ($('resOther').hidden !== !second) $('resOther').hidden = !second;
    if (second)
      label(
        'resOther',
        'View ' + alternate.name + ' · ' + status(second, runtimes.get(alternate.key), alternate)
      );
    label('resState', trip ? p.name + ' · ' + status(trip, rt, p) : '');
    label(
      'resHint',
      trip
        ? rt.issue ||
            (trip.phase === 'done' && !trip.routine
              ? 'The round trip is complete.'
              : 'Block ' + blockAt(trip.x, trip.z).code)
        : ''
    );
    const routine = trip?.routine;
    label(
      'resRoutineNote',
      routine
        ? (trip.phase === 'done' && !trip.paused
            ? 'Next departure · ' + clockLabel(nextDeparture(now, routine.hour))
            : 'Daily at ' + String(routine.hour).padStart(2, '0') + ':00') +
            ' · ' +
            routine.visits +
            ' round trip' +
            (routine.visits === 1 ? '' : 's')
        : ''
    );
    label('resFollow', watching ? 'Stop following' : 'Follow ' + p.name);
  }
  function step(dt) {
    const data = city();
    let changed = tickRoutines(data, dt),
      walking = false;
    for (const { key } of HOUSEHOLDS) {
      const trip = data[key];
      if (!trip || trip.paused || trip.phase === 'done') continue;
      const runtime = runtimes.get(key),
        phase = trip.phase,
        issue = runtime.issue;
      advanceTrip(data, trip, runtime, dt);
      walking ||= runtime.moving;
      changed ||= trip.phase !== phase || runtime.issue !== issue;
    }
    if (walking || hasRoutines(data)) clock += dt;
    if (changed || clock >= 10) {
      clock = 0;
      save();
    }
  }
  function watch() {
    watching = true;
    focus(city()[active().key], null, true);
    refresh();
  }
  function choose(profile) {
    selected = profile;
    watching = false;
    refresh();
  }
  const practice = (p, data) =>
    p.key === 'resident' ? practiceSpaza(data) : practiceHallTrip(data);
  function options(shopId, homeId) {
    const p = active(),
      data = city(),
      trip = data[p.key],
      doors = data.pieces.filter(isEntrance);
    const otherHome = data[other().key]?.home;
    const homes = doors.filter((d) => d.id !== otherHome);
    for (const [id, list] of [
      ['resHome', homes],
      ['resShop', doors]
    ]) {
      $(id).replaceChildren();
      for (const d of list)
        $(id).add(
          new Option(
            blockAt(d.x, d.z).code + ' · (' + d.x + ', ' + d.z + ') · ' + entrance(d).direction,
            d.id
          )
        );
    }
    const home = homes.find((d) => d.id === (homeId || trip?.home)) || homes[0];
    const shop =
      doors.find((d) => d.id === (shopId || trip?.shop)) ||
      doors.find((d) => d !== home && d.id !== otherHome) ||
      doors.find((d) => d !== home);
    $('resHousehold').value = p.key;
    $('resHome').value = home?.id || '';
    $('resShop').value = shop?.id || '';
    label('resDestination', p.destination);
    label(
      'resDescription',
      p.name +
        ' walks from home to the ' +
        p.destination.toLowerCase() +
        ' and back. Choose two street-facing entrances.'
    );
    $('resPractice').hidden = !editing() || !practice(p, data);
    label(
      'resPractice',
      p.key === 'resident'
        ? 'Add practice spaza with blocked door · E4'
        : 'Add practice home in C4 and hall in D5'
    );
    label(
      'resSetupHint',
      homes.length && doors.length >= 2
        ? 'Each household needs its own home. Face both entrances towards streets connected on the map.'
        : 'Build ground-floor entrances or use an available practice layout.'
    );
    $('resEnd').hidden = $('resPause').hidden = !trip;
    $('resPause').textContent = trip?.paused ? 'Resume' : 'Pause';
    $('resPause').disabled = trip?.phase === 'done' && !trip?.routine;
    $('resSchedule').value = String(trip?.routine?.hour ?? '');
    scheduleControls();
    canStart();
  }
  function scheduleControls() {
    const trip = city()[active().key];
    const hour = $('resSchedule').value;
    $('resApplySchedule').hidden = !trip || String(trip.routine?.hour ?? '') === hour;
    label(
      'resStart',
      hour ? (trip ? 'Restart routine' : 'Start routine') : trip ? 'Start new trip' : 'Start trip'
    );
  }
  for (const hour of DEPARTURES)
    $('resSchedule').add(
      new Option('Daily at ' + String(hour).padStart(2, '0') + ':00', String(hour))
    );
  $('resSchedule').onchange = scheduleControls;
  $('resApplySchedule').onclick = () => {
    const data = city(),
      trip = data[active().key];
    setRoutine(trip, Number($('resSchedule').value));
    if (trip.routine) data.clockMinutes ??= START_TIME;
    save();
    $('residentSetup').close();
    refresh();
  };
  $('resSkip').onclick = () => {
    if (skipToDeparture(city())) {
      save();
      refresh();
    }
  };
  function canStart() {
    $('resStart').disabled =
      !$('resHome').value || !$('resShop').value || $('resHome').value === $('resShop').value;
  }
  for (const p of HOUSEHOLDS)
    $('resHousehold').add(new Option(p.name + ' · ' + p.destination, p.key));
  $('resHousehold').onchange = () => {
    choose(HOUSEHOLDS.find((p) => p.key === $('resHousehold').value));
    options();
  };
  $('resOther').onclick = () => {
    const follow = watching;
    choose(other());
    if (follow) watch();
  };
  $('resHome').onchange = $('resShop').onchange = canStart;
  $('resSettings').onclick = () => {
    options();
    $('residentSetup').showModal();
  };
  $('resPractice').onclick = () => {
    const p = active(),
      group = practice(p, city());
    if (!editing() || !group) return;
    const pieces = group.map((d) => ({
      ...d,
      id: crypto.getRandomValues(new Uint32Array(4)).join('-')
    }));
    const doors = pieces.filter(isEntrance);
    add(pieces);
    if (p.key === 'resident') {
      options(doors[0].id, $('resHome').value);
      label('resSetupHint', 'Practice spaza added in E4. The plum brick blocks its doorway.');
    } else {
      options(doors[1].id, doors[0].id);
      label('resSetupHint', 'Naledi’s home in C4 and community hall in D5 are ready.');
    }
  };
  $('resStart').onclick = () => {
    const data = city(),
      p = active(),
      home = data.pieces.find((d) => d.id === $('resHome').value),
      shop = data.pieces.find((d) => d.id === $('resShop').value);
    if (
      !isEntrance(home) ||
      !isEntrance(shop) ||
      home === shop ||
      home.id === data[other().key]?.home
    )
      return;
    data[p.key] = newTrip(home, shop);
    if ($('resSchedule').value) {
      setRoutine(data[p.key], Number($('resSchedule').value));
      data[p.key].phase = 'done';
      data.clockMinutes ??= START_TIME;
    }
    selected = p;
    runtimes.set(p.key, tripRuntime());
    $('residentSetup').close();
    save();
    watch();
  };
  $('resEnd').onclick = () => {
    const key = active().key;
    delete city()[key];
    runtimes.set(key, tripRuntime());
    selected = null;
    watching = false;
    save();
    $('residentSetup').close();
    refresh();
  };
  $('resPause').onclick = () => {
    const t = city()[active().key];
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
    const { key } = active();
    focus(city()[key], runtimes.get(key).blocker, false);
    refresh();
  };
  return {
    reset,
    refresh,
    step,
    stopFollowing() {
      watching = false;
    },
    get selectedTrip() {
      return city()?.[active().key];
    },
    get watching() {
      return watching;
    },
    moving(key) {
      return runtimes.get(key).moving;
    }
  };
}
