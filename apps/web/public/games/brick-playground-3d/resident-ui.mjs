import { setWorkShift } from './work-shift.mjs';
import { updateCompanionPath } from './citizen-appearance.mjs';
import { journeySummary } from './citizen-journey.mjs';
import {
  blockAt,
  HOUSEHOLDS,
  DEPARTURES,
  MOVE_IN_SLOTS,
  VISITS,
  householdsFor,
  entranceAvailable,
  homeClaimed,
  moveInProblem,
  moveIn,
  endHousehold
} from './settlement.mjs';
import {
  entrance,
  isEntrance,
  isParkBench,
  isSchoolEntrance,
  visitFront,
  newTrip,
  practiceHallTrip,
  practiceSpaza,
  tripRuntime
} from './resident-trip.mjs';

import {
  START_TIME,
  clockLabel,
  hasRoutines,
  nextDeparture,
  nextIdleDeparture,
  setRoutine,
  skipToDeparture,
  tickRoutines
} from './resident-routines.mjs';

import { stepHousehold, waitingAtTill } from './market-day.mjs';
const $ = (id) => document.getElementById(id);
function status(trip, runtime, profile, data) {
  if (!trip) return 'No trip';
  if (trip.paused) return 'Paused';
  if (runtime.issue) return 'Stopped';
  if (runtime.waitingForCrossing) return 'Looking before the crossing';
  if (trip.phase === 'queue') return 'Waiting in the entrance queue';
  if (runtime.waitingForSeat) return 'Waiting for the park bench';
  if (trip.phase === 'done') return trip.routine ? 'At home' : 'Home again';
  if (trip.park && trip.phase === 'shopping') {
    const flower = data.garden?.displays.find((p) => p.id === trip.shop)?.flower;
    if (flower) return flower === 'daisy' ? 'Resting by African daisies' : 'Resting by marigolds';
  }
  if (trip.work && trip.phase === 'shopping' && !trip.returning) return 'Working at workplace';
  if (waitingAtTill(data, profile, trip)) return 'At the till';
  if (trip.phase === 'shopping') return profile.activity;
  return trip.returning ? 'Walking home' : 'Walking to the ' + profile.destination.toLowerCase();
}
function label(id, value) {
  if ($(id).textContent !== value) $(id).textContent = value;
}

export function residentControls({ city, editing, save, add, focus, removeModel }) {
  const runtimes = new Map();
  let selected = null,
    watching = false,
    clock = 0;
  let joining = false;
  const roster = () => householdsFor(city());
  const active = () => selected || roster().find(({ key }) => city()?.[key]) || HOUSEHOLDS[0];
  function other() {
    const all = roster(),
      start = all.findIndex((p) => p.key === active().key);
    for (let i = 1; i < all.length; i++) {
      const candidate = all[(start + i) % all.length];
      if (city()[candidate.key]) return candidate;
    }
    return null;
  }
  function runtimeFor(key) {
    if (!runtimes.has(key)) runtimes.set(key, tripRuntime());
    return runtimes.get(key);
  }
  function configProfile() {
    if (!joining) return active();
    return {
      key: 'new',

      visit: $('resVisit').value,
      ...VISITS[$('resVisit').value]
    };
  }
  function reset() {
    selected = null;
    watching = false;
    clock = 0;
    joining = false;
    for (const key of MOVE_IN_SLOTS) removeModel(key);
    runtimes.clear();
  }
  reset();
  function refresh() {
    const data = city();
    if ($('residentPanel').hidden !== !data) $('residentPanel').hidden = !data;
    if (!data) return;
    const p = active(),
      trip = data[p.key],
      rt = runtimeFor(p.key),
      alternate = other(),
      second = alternate && data[alternate.key];
    const scheduled = hasRoutines(data),
      now = data.clockMinutes ?? START_TIME;
    label('resClock', scheduled ? 'Settlement time · ' + clockLabel(now) : '');
    const next = scheduled ? nextIdleDeparture(data) : null;
    const canSkip = next !== null;
    const shiftEnd = canSkip && roster().some(({ key }) => data[key]?.work?.endsAt === next && data[key].phase === 'shopping');
    if (canSkip) label('resSkip', (shiftEnd ? 'Skip to shift end · ' : next === data.market?.daily?.next ? 'Skip to next opening · ' : 'Skip to next departure · ') + clockLabel(next).split(' · ')[1]);
    if ($('resSkip').hidden === canSkip) $('resSkip').hidden = !canSkip;
    if ($('resTools').hidden !== !trip) $('resTools').hidden = !trip;
    if ($('resOther').hidden !== !second) $('resOther').hidden = !second;
    if (second)
      label(
        'resOther',
        'View ' +
          alternate.name +
          ' · ' +
          status(second, runtimeFor(alternate.key), alternate, data)
      );
    label('resState', trip ? p.name + ' · ' + status(trip, rt, p, data) : '');
    label(
      'resHint',
      trip
        ? rt.issue ||
            (trip.phase === 'done' && !trip.routine
              ? 'The round trip is complete.'
              : 'Block ' + blockAt(trip.x, trip.z).code)
        : ''
    );
    $('resJourney').hidden = !trip;
    label('resJourneyText', journeySummary(data, p, trip, rt));
    const routine = trip?.routine;
    const lessonNote = trip?.school && (p.childName + ' · ' + trip.school.lessons + ' completed lesson' +
      (trip.school.lessons === 1 ? '' : 's') + (routine ? ' · Daily at ' + String(routine.hour).padStart(2, '0') + ':00' : ''));
    label(
      'resRoutineNote',
      lessonNote || (trip?.work
        ? 'Shift ' + String(trip.work.startHour).padStart(2, '0') + ':00–' +
          String(trip.work.endHour).padStart(2, '0') + ':00 · ' + trip.work.completed +
          ' completed shift' + (trip.work.completed === 1 ? '' : 's')
        : routine
        ? (trip.phase === 'done' && !trip.paused
            ? 'Next departure · ' + clockLabel(nextDeparture(now, routine.hour))
            : 'Daily at ' + String(routine.hour).padStart(2, '0') + ':00') +
            ' · ' +
            routine.visits +
            ' round trip' +
            (routine.visits === 1 ? '' : 's')
        : '')
    );
    label('resFollow', watching ? 'Stop following' : 'Follow ' + p.name);
  }
  function step(dt) {
    const data = city();
    let changed = tickRoutines(data, dt),
      walking = false;
    for (const profile of householdsFor(data)) {
      const { key } = profile;
      const trip = data[key];
      if (!trip || trip.paused || trip.phase === 'done') continue;
      const runtime = runtimeFor(key),
        phase = trip.phase,
        issue = runtime.issue;
      stepHousehold(data, profile, trip, runtime, dt);
      if (profile.family) updateCompanionPath(trip);
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
    const p = configProfile(),
      data = city(),
      trip = data[p.key],
      doors = data.pieces.filter(isEntrance);
    const destinations =
      p.visit === 'park' ? data.pieces.filter((piece) => isParkBench(data, piece))
        : p.visit === 'school' ? doors.filter(d => isSchoolEntrance(data, d))
        : p.visit === 'work' ? doors.filter(d => entranceAvailable(data, d.id, 'work')) : doors;
    const homes = doors.filter((d) => !homeClaimed(data, d.id, p.key));
    for (const [id, list] of [
      ['resHome', homes],
      ['resShop', destinations]
    ]) {
      $(id).replaceChildren();
      for (const d of list)
        $(id).add(
          new Option(
            blockAt(d.x, d.z).code +
              ' · (' +
              d.x +
              ', ' +
              d.z +
              ') · ' +
              (d.type === 'bench' ? visitFront(data, d, true) : entrance(d)).direction,
            d.id
          )
        );
    }
    const home = homes.find((d) => d.id === (homeId || trip?.home)) || homes[0];
    const shop =
      destinations.find((d) => d.id === (shopId || trip?.shop)) ||
      destinations.find((d) => d !== home && !homeClaimed(data, d.id, p.key)) ||
      destinations.find((d) => d !== home);
    $('resHousehold').value = p.key;
    $('resHome').value = home?.id || '';
    $('resShop').value = shop?.id || '';
    label('resDestination', p.destination);
    label(
      'resDescription',
      p.visit === 'school'
        ? 'Mark the destination block as School on the settlement map. Choose a ground-floor entrance with clear space inside for a lesson.'
        : p.visit === 'work'
        ? 'Choose a home and a different workplace entrance. Use a dedicated entrance, not an active market counter. Keep the route, doorway and indoor standing space clear. The resident walks to work, stays until shift end and returns home.'
        : p.visit === 'park'
        ? 'Choose a home and a ground-floor bench on a park block. The bench faces its approach street.'
        : joining
          ? 'Choose a street-facing home and destination for the new household.'
          : p.name +
            ' walks from home to the ' +
            p.destination.toLowerCase() +
            ' and back. Choose two street-facing entrances.'
    );
    $('resMoveFields').hidden = !joining;
    $('resFamilyFields').hidden = !joining || !['school', 'park'].includes(p.visit);
    $('resParkFamilyOption').hidden = $('resParkFamilyHint').hidden = p.visit === 'school';
    $('resPractice').hidden =
      !HOUSEHOLDS.some((h) => h.key === p.key) || !editing() || !practice(p, data);
    label(
      'resPractice',
      p.key === 'resident'
        ? 'Add practice spaza with blocked door · E4'
        : 'Add practice home in C4 and hall in D5'
    );
    label(
      'resSetupHint',
      p.visit === 'park'
        ? 'Turn the bench towards a connected street and leave its front clear.'
        : homes.length && doors.length >= 2
          ? 'Each household needs its own home. Face both entrances towards streets connected on the map.'
          : 'Build ground-floor entrances or use an available practice layout.'
    );
    $('resEnd').hidden = $('resPause').hidden = !trip;
    label('resEnd', MOVE_IN_SLOTS.includes(p.key) ? 'Move out' : 'End trip');
    $('resPause').textContent = trip?.paused ? 'Resume' : 'Pause';
    $('resPause').disabled = trip?.phase === 'done' && !trip?.routine;
    $('resSchedule').value = String(trip?.routine?.hour ?? (p.visit === 'work' ? 8 : ''));
    $('resWorkEnd').value = String(trip?.work?.endHour ?? 17);
    scheduleControls();
    canStart();
  }
  function scheduleControls() {
    const p = configProfile(), trip = city()[p.key], work = p.visit === 'work';
    $('resWorkFields').hidden = !work;
    $('resSchedule').options[0].disabled = work;
    if (work && !$('resSchedule').value) $('resSchedule').value = '8';
    const hour = $('resSchedule').value;
    $('resApplySchedule').hidden = !trip || (String(trip.routine?.hour ?? '') === hour &&
      (!work || String(trip.work?.endHour) === $('resWorkEnd').value));
    label(
      'resStart',
      joining
        ? 'Move in'
        : hour
          ? trip
            ? 'Restart routine'
            : 'Start routine'
          : trip
            ? 'Start new trip'
            : 'Start trip'
    );
    canStart();
  }
  for (const hour of DEPARTURES)
    $('resSchedule').add(
      new Option('Daily at ' + String(hour).padStart(2, '0') + ':00', String(hour))
    );
  for (let hour = 9; hour <= 23; hour++) $('resWorkEnd').add(new Option(String(hour).padStart(2, '0') + ':00', String(hour)));
  $('resWorkEnd').value = '17';
  $('resWorkEnd').onchange = scheduleControls;
  $('resSchedule').onchange = scheduleControls;
  $('resApplySchedule').onclick = () => {
    const data = city(),
      trip = data[active().key];
    if (!trip || $('resApplySchedule').disabled) return;
    if (configProfile().visit === 'work') {
      if (trip.phase !== 'done' || workProblem()) { canStart(); return; }
      if (!setWorkShift(trip, Number($('resSchedule').value), Number($('resWorkEnd').value))) return;
    } else setRoutine(trip, Number($('resSchedule').value));
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
  function workProblem() {
    if (configProfile().visit !== 'work') return '';
    const start = Number($('resSchedule').value), end = Number($('resWorkEnd').value);
    return !DEPARTURES.includes(start) || !Number.isInteger(end) || end <= start || end > 23
      ? 'Choose a shift end after departure, no later than 23:00. Overnight shifts are not available.' : '';
  }
  function canStart() {
    const home = $('resHome').value,
      destination = $('resShop').value;
    const problem = workProblem() ||
      (configProfile().visit === 'work' && destination === city().market?.shop
        ? 'Choose a dedicated workplace entrance, not the active market counter.' : '') ||
      (joining ? moveInProblem(city(), $('resName').value) : '');
    const work = configProfile().visit === 'work', trip = city()[configProfile().key];
    $('resApplySchedule').disabled = work && (!!problem || trip?.phase !== 'done');
    if (work && !joining) label('resSetupHint', problem || (trip?.phase !== 'done'
      ? 'Apply schedule is available when this resident is home. Restart routine deliberately starts a new trip from the selected home.'
      : 'Apply schedule keeps this home, workplace and completed shifts.'));
    if (joining)
      label(
        'resSetupHint',
        problem ||
          (!home
            ? 'Build an unclaimed ground-floor home entrance.'
            : !destination || home === destination
              ? $('resVisit').value === 'park'
                ? 'Build a ground-floor bench in a block with Park land use.'
                : configProfile().visit === 'school'
                  ? 'Set a block’s land use to School and give it a ground-floor entrance.'
                  : 'Choose a different entrance for the destination.'
              : work ? 'This resident departs daily, works until the selected end time and walks home. No wages or off-screen shift completions are generated.'
              : 'This household will use its own home and can share a destination.')
      );
    $('resStart').disabled = !!problem || !home || !destination || home === destination;
  }
  function rosterOptions() {
    const occupied = roster().filter((p) => city()[p.key]).length;
    label(
      'resOccupied',
      occupied + ' of ' + (HOUSEHOLDS.length + MOVE_IN_SLOTS.length) + ' household slots in use'
    );
    $('resHousehold').replaceChildren(
      ...roster().map((p) => new Option(p.name + ' · ' + p.destination, p.key))
    );
    if (MOVE_IN_SLOTS.some((key) => !city()[key]))
      $('resHousehold').add(new Option('Move in a household…', 'new'));
  }
  $('resHousehold').onchange = () => {
    joining = $('resHousehold').value === 'new';
    if (joining) {
      $('resName').value = '';
      $('resFamily').checked = false;
      $('resChildName').value = 'Mpho';
      $('resVisit').value = 'spaza';
    } else choose(roster().find((p) => p.key === $('resHousehold').value));
    options();
  };
  $('resName').oninput = canStart;
  $('resVisit').onchange = () => {
    const schedule = $('resSchedule').value;
    options($('resShop').value, $('resHome').value);
    $('resSchedule').value = configProfile().visit === 'work' ? schedule || '8' : schedule;
    scheduleControls();
  };
  $('resOther').onclick = () => {
    const follow = watching;
    choose(other());
    if (follow) watch();
  };
  $('resHome').onchange = $('resShop').onchange = canStart;
  $('resSettings').onclick = () => {
    joining = false;
    rosterOptions();
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
      p = configProfile(),
      home = data.pieces.find((d) => d.id === $('resHome').value),
      shop = data.pieces.find((d) => d.id === $('resShop').value);
    if (
      !isEntrance(home) ||
      !(p.visit === 'park' ? isParkBench(data, shop) : isEntrance(shop)) ||
      home === shop ||
      homeClaimed(data, home.id, p.key)
    )
      return;
    if (workProblem() || (p.visit === 'work' && !entranceAvailable(data, shop.id, 'work'))) return;
    if (p.visit === 'school' && !isSchoolEntrance(data, shop)) return;
    const trip = newTrip(home, shop, data);
    if (p.visit === 'school') trip.school = { lessons: data[p.key]?.school?.lessons ?? 0 };
    if (p.visit === 'work' && data[p.key]?.work) trip.work = { ...data[p.key].work };
    if (p.visit === 'work' && !setWorkShift(trip, Number($('resSchedule').value), Number($('resWorkEnd').value))) return;
    const profile = joining ? moveIn(data, $('resName').value, $('resVisit').value, trip, undefined, {family: $('resFamily').checked, childName: $('resChildName').value}) : p;
    if (!profile) return;
    data[profile.key] = trip;
    if ($('resSchedule').value) {
      if (p.visit !== 'work') setRoutine(trip, Number($('resSchedule').value));
      trip.phase = 'done';
      data.clockMinutes ??= START_TIME;
    }
    joining = false;
    selected = profile;
    runtimes.set(profile.key, tripRuntime());
    $('residentSetup').close();
    save();
    watch();
  };
  $('resEnd').onclick = () => {
    const key = active().key;
    endHousehold(city(), key);
    runtimes.delete(key);
    removeModel(key);
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
    focus(city()[key], runtimeFor(key).blocker, false);
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
      return runtimeFor(key).moving;
    }
  };
}
