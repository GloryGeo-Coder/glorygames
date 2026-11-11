import { directionTracker } from './walking-directions.mjs';
const $ = (id) => document.getElementById(id);
export function directionControls({ city, player, playing, save, show }) {
  const track = directionTracker();
  function update() {
    const data = city();
    $('directionsHud').hidden = !data?.directions;
    if (!data?.directions) {
      show(null);
      return;
    }
    const route = playing() ? track(data, player()) : null;
    const text = route
      ? {
          arrived: 'Arrived',
          blocked: 'Blocked approach',
          missing: 'Destination missing',
          disconnected: 'No street route',
          start: 'Find pavement',
          walking: 'To'
        }[route.state] +
        ' · ' +
        (route.address || data.directions.address)
      : 'Destination saved · ' + data.directions.address;
    if ($('directionsAddress').textContent !== text) $('directionsAddress').textContent = text;
    const hint = route?.hint || 'Switch to Play to follow directions.';
    if ($('directionsHint').textContent !== hint) $('directionsHint').textContent = hint;
    $('directionsHud').dataset.state = route?.state || 'paused';
    show(route);
  }
  $('directionsStop').onclick = () => {
    const data = city();
    if (data) {
      delete data.directions;
      save();
    }
    update();
  };
  return update;
}
