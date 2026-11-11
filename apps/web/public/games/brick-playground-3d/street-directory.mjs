import { HALF, PITCH, blockAt, blockInfo, streetSegment } from './settlement.mjs';
import { entrance, isEntrance } from './resident-trip.mjs';

const namedCache = new WeakMap();
export function namedSegments(city) {
  if (!city.streetNames) return [];
  let result = namedCache.get(city.streetNames);
  if (!result || result.streets !== city.streets) {
    result = {
      streets: city.streets,
      segments: city.streets
        .filter((key) => city.streetNames[key])
        .map((key) => ({ key, name: city.streetNames[key], ...streetSegment(key) }))
    };
    namedCache.set(city.streetNames, result);
  }
  return result.segments;
}
export function streetLocation(city, x, z) {
  const names = new Set();
  for (const s of namedSegments(city)) {
    if (Math.abs(x - s.x) <= s.w / 2 && Math.abs(z - s.z) <= s.d / 2) names.add(s.name);
  }
  return [...names].sort().join(' / ');
}
// Frontage changes with the placed brick, the road it faces and the block name.
const doorCache = new WeakMap();
export function namedDoors(city) {
  let cache = doorCache.get(city.pieces);
  if (
    cache &&
    cache.names === city.streetNames &&
    cache.streets === city.streets &&
    cache.blocks === city.blocks
  )
    return cache.doors;
  const roads = new Map(namedSegments(city).map((s) => [s.key, s.name])),
    doors = new Map();
  if (roads.size)
    for (const p of city.pieces) {
      if (!isEntrance(p)) continue;
      const front = { ...entrance(p), y: p.y },
        name = roads.get(front.street);
      if (!name) continue;
      const coordinates = '(' + p.x + ', ' + p.z + ')';
      const label = [
        front.block.code,
        blockInfo(city, front.block).name,
        p.type === 'arch' ? 'Arch' : 'Door',
        coordinates
      ]
        .filter(Boolean)
        .join(' · ');
      doors.set(p.id, {
        id: p.id,
        front,
        name,
        label,
        address: name + ' · ' + front.block.code + ' ' + coordinates
      });
    }
  doorCache.set(city.pieces, {
    names: city.streetNames,
    streets: city.streets,
    blocks: city.blocks,
    doors
  });
  return doors;
}
export function streetEntries(city, name) {
  const sections = namedSegments(city).filter((s) => s.name === name);
  if (!sections.length) return null;
  const doors = [...namedDoors(city).values()].filter((d) => d.name === name);
  doors.sort((a, b) => a.front.block.id - b.front.block.id || a.label.localeCompare(b.label));
  // Even a street with no entrances can be visited from the directory.
  const s = sections[0],
    clamp = (n) => Math.min(HALF - 0.5, Math.max(-HALF + 0.5, n)),
    curb = { x: clamp(s.x), z: clamp(s.z) },
    center = { x: curb.x + (s.axis === 'h' ? 1 : 0), z: curb.z + (s.axis === 'v' ? 1 : 0) };
  return { sections, doors, start: { curb, center, block: blockAt(curb.x, curb.z) } };
}
const $ = (id) => document.getElementById(id);
export function streetDirectoryMap({ city, paint, walk, guide }) {
  const list = $('directoryStreet'),
    destinations = $('directoryDoor'),
    board = $('streetDirectory');
  let entries, previousCity;
  function options() {
    const data = city(),
      chosen = list.value,
      door = destinations.value;
    const names = [...new Set(namedSegments(data).map((s) => s.name))].sort((a, b) =>
      a.localeCompare(b)
    );
    list.replaceChildren(...names.map((n) => new Option(n, n)));
    if (names.includes(chosen)) list.value = chosen;
    entries = streetEntries(data, list.value);
    destinations.replaceChildren(new Option('Street pavement', ''));
    const round = data.post;
    const total = namedDoors(data).size;
    $('postDirectoryTip').textContent =
      round && !round.complete
        ? 'Post round · ' +
          round.stops.filter((s) => s.delivered).length +
          '/' +
          round.stops.length +
          ' delivered. Use the destination list to find your stops.'
        : total < 2
          ? 'Place at least two entrances facing named streets to start a post round.'
          : 'Walk inside a listed entrance to collect a postbag. Deliver up to three letters and return here to finish.';
    for (const d of entries?.doors || []) {
      const stop = round && !round.complete && round.stops.find((s) => s.id === d.id);
      const role =
        round && !round.complete && d.id === round.office.id
          ? 'Post office'
          : stop
            ? stop.delivered
              ? 'Delivered'
              : 'Letter'
            : '';
      destinations.add(new Option(role ? role + ' · ' + d.label : d.label, d.id));
    }
    if (entries?.doors.some((d) => d.id === door)) destinations.value = door;
    const n = entries?.doors.length || 0;
    $('directoryHint').textContent = entries
      ? entries.sections.length +
        ' street section' +
        (entries.sections.length === 1 ? '' : 's') +
        ' · ' +
        n +
        ' ground-floor entrance' +
        (n === 1 ? '' : 's')
      : '';
    $('directoryDirections').disabled = !destinations.value;
    previousCity = data;
  }
  list.onchange = () => {
    options();
    paint();
  };
  destinations.onchange = () => {
    $('directoryDirections').disabled = !destinations.value;
    paint();
  };
  $('directoryDirections').onclick = () => {
    const door = namedDoors(city()).get(destinations.value);
    if (door) guide({ id: door.id, address: door.address });
  };
  $('directoryWalk').onclick = () => {
    const current = streetEntries(city(), list.value);
    if (current)
      walk(current.doors.find((d) => d.id === destinations.value)?.front || current.start);
  };
  function draw(ctx, px, py, line) {
    const data = city();
    board.hidden = !data.streetNames || !Object.keys(data.streetNames).length;
    if (board.hidden) {
      board.open = false;
      return;
    }
    if (!board.open) return;
    if (previousCity !== data) options();
    if (!entries) return;
    ctx.save();
    for (const s of entries.sections) {
      const dx = s.axis === 'h' ? PITCH / 2 : 0,
        dz = s.axis === 'v' ? PITCH / 2 : 0;
      line(
        [
          { x: s.x - dx, z: s.z - dz },
          { x: s.x + dx, z: s.z + dz }
        ],
        '#2468a0',
        6
      );
    }
    const target = entries.doors.find((d) => d.id === destinations.value)?.front;
    if (target) line([target.center, target.curb], '#a54f19', 3, [4, 3]);
    for (const d of entries.doors) {
      const selected = d.id === destinations.value;
      ctx.fillStyle = selected ? '#df7525' : '#fff4cb';
      ctx.strokeStyle = '#244665';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(px(d.front.center.x), py(d.front.center.z), selected ? 8 : 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
  function pick(x, z) {
    if (!board.open) return false;
    let door,
      closest = 5;
    for (const d of entries?.doors || []) {
      const distance = Math.hypot(x - d.front.center.x, z - d.front.center.z);
      if (distance < closest) {
        door = d;
        closest = distance;
      }
    }
    if (door) {
      destinations.value = door.id;
      $('directoryDirections').disabled = false;
      paint();
    }
    return true;
  }
  function atlasPoints() {
    if (!board.open || !entries) return [];
    const points = entries.doors.map((d) => d.front.center);
    for (const s of entries.sections) {
      const dx = s.axis === 'h' ? PITCH / 2 : 0,
        dz = s.axis === 'v' ? PITCH / 2 : 0;
      points.push({ x: s.x - dx, z: s.z - dz }, { x: s.x + dx, z: s.z + dz });
    }
    return points;
  }
  return { draw, pick, atlasPoints, open: options };
}
