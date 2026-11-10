import { namedDoors } from './street-directory.mjs';
import { handlePost, postVisit } from './neighbourhood-post.mjs';
const $ = (id) => document.getElementById(id);
const label = (id, text) => {
  if ($(id).textContent !== text) $(id).textContent = text;
};
export function postControls({ city, player, playing, save, sound, announce, show }) {
  let expected, lastRound, lastDoors;
  function update() {
    const data = city();
    const round = data?.post,
      doors = data && namedDoors(data);
    expected = data ? postVisit(data, player(), playing()) : null;
    $('postHud').hidden = !expected;
    show(round, doors, !!round && !round.complete && playing());
    if (!expected) {
      $('postSheet').open = false;
      lastRound = null;
      return;
    }
    label('postHint', expected.hint);
    $('postAction').hidden = !expected.action;
    if (expected.action) label('postAction', expected.label);
    $('postSheet').hidden = !round;
    if (round && (lastRound !== round || lastDoors !== doors)) {
      label(
        'postProgress',
        'Post round · ' + round.stops.filter((s) => s.delivered).length + '/' + round.stops.length
      );
      const address = (s) =>
        doors.get(s.id)?.address || s.address + ' · missing entrance or street';
      label('postOffice', 'Post office · ' + address(round.office));
      $('postManifest').replaceChildren(
        ...round.stops.map((s) => {
          const li = document.createElement('li');
          li.textContent = s.delivered ? '✓ ' + s.address : address(s);
          return li;
        })
      );
      label('postEnd', round.complete ? 'Close finished round' : 'Abandon round');
    }
    lastRound = round;
    lastDoors = doors;
  }
  $('postAction').onclick = () => {
    const data = city();
    if (data && handlePost(data, player(), playing(), expected)) {
      sound();
      save();
      announce(
        {
          collect: 'Postbag collected',
          deliver: 'Letter delivered',
          finish: 'Post round complete'
        }[expected.action]
      );
    }
    update();
  };
  $('postEnd').onclick = () => {
    const data = city();
    if (!data?.post) return;
    delete data.post;
    save();
    $('postSheet').open = false;
    update();
  };
  return update;
}
