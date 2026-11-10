import { namedDoors } from './street-directory.mjs';
import { blockAt, blockIndex, MAX_LETTERS } from './settlement.mjs';
import { intervals } from './model.mjs';

const snapshot = (d) => ({ id: d.id, address: d.address });
const distance = (from, to) => Math.hypot(from.x - to.x, from.z - to.z);
function atDoor(city, person, door) {
  if (
    !door ||
    Math.abs(person.y - door.front.y) >= 0.55 ||
    distance(person, door.front.inside) > 1.15
  )
    return false;
  const items = blockIndex(city.pieces)[door.front.block.id],
    hand = person.y + 0.9;
  for (let step = 0; step <= 6; step++) {
    const t = step / 6,
      x = person.x + (door.front.inside.x - person.x) * t,
      z = person.z + (door.front.inside.z - person.z) * t;
    if (items.some((p) => intervals(p, x, z).some(([low, hi]) => low <= hand && hi >= hand)))
      return false;
  }
  return true;
}
export function postVisit(city, person, playing) {
  const post = city.post,
    doors = namedDoors(city);
  if (!post) {
    if (!playing || doors.size < 2) return null;
    const block = blockAt(person.x, person.z);
    for (const p of blockIndex(city.pieces)[block.id]) {
      const door = doors.get(p.id);
      if (door && atDoor(city, person, door))
        return {
          action: 'collect',
          id: door.id,
          label: 'Collect postbag',
          hint: 'Start a round from ' + door.address
        };
    }
    return null;
  }
  if (post.complete) return { hint: 'Round complete · ' + post.stops.length + ' delivered' };
  const pending = post.stops.filter((s) => !s.delivered);
  const returning = !pending.length;
  const candidates = returning ? [post.office] : pending;
  let nearest = null,
    range = Infinity;
  for (const ref of candidates) {
    const door = doors.get(ref.id);
    if (!door) continue;
    if (playing && atDoor(city, person, door))
      return {
        action: returning ? 'finish' : 'deliver',
        id: door.id,
        label: returning ? 'Finish round' : 'Deliver letter',
        hint: door.address
      };
    const d = distance(person, door.front.inside);
    if (d < range) {
      range = d;
      nearest = door;
    }
  }
  if (!nearest)
    return { hint: 'Restore the named street or entrance at ' + candidates[0].address + '.' };
  return {
    hint:
      (returning ? 'Return to ' : 'Next letter · ') +
      nearest.address +
      ' · ' +
      Math.ceil(range) +
      ' studs'
  };
}
export function handlePost(city, person, playing, request) {
  if (!request?.action) return false;
  const visit = postVisit(city, person, playing);
  if (visit?.action !== request.action || visit.id !== request.id) return false;
  const doors = namedDoors(city),
    post = city.post;
  if (visit.action === 'collect') {
    const office = doors.get(visit.id),
      from = office.front.inside;
    const others = [...doors.values()]
      .filter((d) => d !== office)
      .sort(
        (a, b) =>
          distance(from, a.front.inside) - distance(from, b.front.inside) ||
          a.id.localeCompare(b.id)
      );
    city.post = {
      office: snapshot(office),
      stops: others.slice(0, MAX_LETTERS).map((d) => ({ ...snapshot(d), delivered: false })),
      complete: false
    };
  } else if (visit.action === 'deliver') {
    city.post = {
      ...post,
      stops: post.stops.map((s) =>
        s.id === visit.id ? { ...s, address: doors.get(s.id).address, delivered: true } : s
      )
    };
  } else city.post = { ...post, complete: true };
  return true;
}
