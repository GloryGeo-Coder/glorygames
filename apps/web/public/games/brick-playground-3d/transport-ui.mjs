import { BLOCKS, streetKeys } from './settlement.mjs';
import { transportPoint, transportCargo, transportStops } from './transport.mjs';

const PARKING_HINTS = {
  recover: 'Use Last stop to return the buggy to its checkpoint.',
  missing: 'The stop street is missing. Restore it in City map to continue.',
  blocked: 'The stop needs more clearance. Use Build to move nearby bricks.',
  approach: 'Follow the marker and brake beside the stop.',
  brake: 'Hold Brake until the buggy stops.',
  align: 'Line up with the street. Use a little forward or reverse and steer, then brake.',
  ready: 'Parked at the stop.',
  complete: 'Use Build or Play to leave the buggy.'
};
export function transportParkingHint(state, blocked = false) {
  return state === 'approach' && blocked
    ? 'Path blocked. Reverse, or use Build to clear space.'
    : PARKING_HINTS[state] || PARKING_HINTS.approach;
}
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
  chooseStop,
  clearInputs = () => {}
}) {
  let latest = {},
    manifestKey = '';
  function options() {
    const data = city();
    if (!data) return;
    const trip = data.transport;
    for (const [id, key, fallback] of [
      ['transportPickup', trip?.pickup, 0],
      ['transportDropoff', trip?.stops?.[0].street || trip?.dropoff, 1],
      ['transportSecond', trip?.stops?.[1].street, -1]
    ]) {
      $(id).replaceChildren();
      if (id === 'transportSecond') $(id).append(new Option('None — one delivery', ''));
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
      $('transportPickup').value === $('transportDropoff').value ||
      (!!$('transportSecond').value &&
        [$('transportPickup').value, $('transportDropoff').value].includes(
          $('transportSecond').value
        ));
    $('transportDispatch').disabled = driving() || !trip || trip.stage === 3;
    $('transportPickup').disabled =
      $('transportDropoff').disabled =
      $('transportSecond').disabled =
        driving();
    text(
      'transportDispatch',
      trip?.stage === 2
        ? trip.stops
          ? 'Resume delivery round'
          : 'Resume with crate'
        : 'Drive workshop buggy'
    );
    text(
      'transportSaved',
      trip
        ? (trip.stage === 3 ? 'Completed: ' : 'Saved delivery: ') +
            transportStreetLabel(trip.pickup, city()) +
            ' → ' +
            transportStops(trip)
              .map(
                (stop) =>
                  transportStreetLabel(stop.street, city()) +
                  (stop.delivered ? ' (delivered)' : '')
              )
              .join(' / ')
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
  $('transportPickup').onchange =
    $('transportDropoff').onchange =
    $('transportSecond').onchange =
      setupState;
  $('transportNew').onclick = () => {
    if ($('transportNew').disabled) return;
    const result = saveRoute(
      $('transportPickup').value,
      $('transportDropoff').value,
      $('transportSecond').value
    );
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
      trip.stops
        ? complete
          ? 'Delivery round complete'
          : trip.stage === 1
            ? 'Collect two crates'
            : transportCargo(trip) +
              (transportCargo(trip) === 1 ? ' crate on board' : ' crates on board')
        : complete
          ? 'Delivery complete'
          : trip.stage === 1
            ? 'Collect one crate'
            : 'Deliver one crate'
    );
    text(
      'transportTarget',
      transportStreetLabel(key, data) + (complete ? '' : ' · ' + distance + ' studs')
    );
    text(
      'transportHint',
      state.issue ||
        transportParkingHint(
          state.parking || (complete ? 'complete' : state.canService ? 'ready' : 'approach'),
          run.blocked
        )
    );
    $('transportAction').hidden = complete;
    $('transportAction').disabled = !state.canService;
    text(
      'transportAction',
      trip.stage === 1 ? (trip.stops ? 'Collect two crates' : 'Collect crate') : 'Deliver crate'
    );
    $('transportManifest').hidden = !trip.stops;
    const nextKey = JSON.stringify([trip, data.streetNames]);
    if (trip.stops && manifestKey !== nextKey) {
      manifestKey = nextKey;
      text(
        'transportManifestSummary',
        'Delivery round · ' +
          trip.stops.filter((stop) => stop.delivered).length +
          '/2 delivered'
      );
      $('transportStops').replaceChildren();
      for (const stop of trip.stops) {
        const button = document.createElement('button');
        const selected = stop.street === trip.dropoff && !stop.delivered;
        button.textContent =
          (stop.delivered ? 'Delivered: ' : selected ? 'Next: ' : 'Go next: ') +
          transportStreetLabel(stop.street, data);
        button.disabled = stop.delivered;
        button.setAttribute('aria-pressed', String(selected));
        button.dataset.street = stop.street;
        button.onclick = () => {
          if (driving()) chooseStop(stop.street);
        };
        $('transportStops').append(button);
      }
    }
  }
  function reset() {
    latest = {};
    manifestKey = '';
    $('transportManifest').open = false;
    if ($('transportSetup').open) $('transportSetup').close();
    document.body.classList.remove('town-driving');
    $('transportPanel').hidden = true;
  }
  return { refresh, reset };
}
