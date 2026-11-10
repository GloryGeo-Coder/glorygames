import { BLOCKS, streetKeys } from './settlement.mjs';
import { transportPoint } from './transport.mjs';

const $ = (id) => document.getElementById(id);
const text = (id, value) => {
  if ($(id).textContent !== value) $(id).textContent = value;
};
export function transportStreetLabel(key, city = null) {
  const name = city?.streetNames?.[key];
  const prefix = typeof name === 'string' && name.trim() ? name.trim() + ' · ' : '';
  for (const b of BLOCKS) {
    for (const [edge, street] of Object.entries(streetKeys(b)))
      if (street === key) return prefix + b.code + ' · ' + edge + ' street';
  }
  return 'Unavailable street';
}

// Route changes are explicit. Closing settings never discards a carried crate.
export function transportControls({
  city,
  driving,
  saveRoute,
  dispatch,
  service,
  clearInputs = () => {}
}) {
  let latest = {};
  function options() {
    const data = city();
    if (!data) return;
    const trip = data.transport;
    for (const [id, key, fallback] of [
      ['transportPickup', trip?.pickup, 0],
      ['transportDropoff', trip?.dropoff, 1]
    ]) {
      $(id).replaceChildren();
      for (const street of data.streets) {
        const option = document.createElement('option');
        option.value = street;
        option.textContent = transportStreetLabel(street, data);
        $(id).append(option);
      }
      $(id).value = data.streets.includes(key) ? key : data.streets[fallback] || '';
    }
    text(
      'transportSetupHint',
      data.streets.length < 2
        ? 'Lay at least two streets with City map, then choose the two stops.'
        : 'Stops sit at the middle of each chosen street. Leave room to park and turn.'
    );
    setupState();
  }
  function setupState() {
    const trip = city()?.transport;
    $('transportNew').disabled =
      driving() ||
      !$('transportPickup').value ||
      !$('transportDropoff').value ||
      $('transportPickup').value === $('transportDropoff').value;
    $('transportDispatch').disabled = driving() || !trip || trip.stage === 3;
    $('transportPickup').disabled = $('transportDropoff').disabled = driving();
    text('transportDispatch', trip?.stage === 2 ? 'Resume with crate' : 'Drive workshop buggy');
    text(
      'transportSaved',
      trip
        ? (trip.stage === 3 ? 'Completed: ' : 'Saved delivery: ') +
            transportStreetLabel(trip.pickup, city()) +
            ' → ' +
            transportStreetLabel(trip.dropoff, city())
        : 'No delivery assigned.'
    );
  }
  $('transportButton').onclick = () => {
    if (!city()) return;
    clearInputs();
    options();
    $('transportSetup').showModal();
  };
  $('transportSetup').addEventListener('close', clearInputs);
  $('transportSetup').addEventListener('cancel', clearInputs);
  $('transportPickup').onchange = $('transportDropoff').onchange = setupState;
  $('transportNew').onclick = () => {
    if ($('transportNew').disabled) return;
    const result = saveRoute($('transportPickup').value, $('transportDropoff').value);
    if (result === false || typeof result === 'string') {
      text(
        'transportSetupHint',
        typeof result === 'string' ? result : 'Could not save this delivery.'
      );
      return;
    }
    setupState();
    text('transportSetupHint', 'New delivery saved. Drive when ready.');
  };
  $('transportDispatch').onclick = () => {
    if ($('transportDispatch').disabled) return;
    const result = dispatch();
    if (result === false || typeof result === 'string') {
      text(
        'transportSetupHint',
        typeof result === 'string' ? result : 'Check your workshop buggy and the pickup street.'
      );
      return;
    }
    $('transportSetup').close();
  };
  $('transportAction').onclick = () => {
    if (driving() && latest.canService) service();
  };
  function refresh(state = {}) {
    latest = state;
    const data = city(),
      active = !!data && driving();
    $('transportButton').hidden = !data;
    $('transportPanel').hidden = !active;
    document.body.classList.toggle('town-driving', active);
    if (!active) return;
    const trip = state.trip || data.transport,
      run = state.run;
    if (!trip || !run) return;
    const complete = trip.stage === 3;
    const key = trip.stage === 1 ? trip.pickup : trip.dropoff;
    const point = transportPoint(key);
    const distance = Math.round(Math.hypot(point.x - run.x, point.z - run.z));
    text(
      'transportState',
      complete ? 'Delivery complete' : trip.stage === 1 ? 'Collect one crate' : 'Deliver one crate'
    );
    text(
      'transportTarget',
      transportStreetLabel(key, data) + (complete ? '' : ' · ' + distance + ' studs')
    );
    text(
      'transportHint',
      state.issue ||
        (complete
          ? 'Use Build or Play to leave the buggy.'
          : run.blocked
            ? 'Path blocked. Reverse, or use Build to clear space.'
            : state.canService
              ? 'Parked at the stop.'
              : 'Follow the marker and brake beside the stop.')
    );
    $('transportAction').hidden = complete;
    $('transportAction').disabled = !state.canService;
    text('transportAction', trip.stage === 1 ? 'Collect crate' : 'Deliver crate');
  }
  function reset() {
    latest = {};
    if ($('transportSetup').open) $('transportSetup').close();
    document.body.classList.remove('town-driving');
    $('transportPanel').hidden = true;
  }
  return { refresh, reset };
}
