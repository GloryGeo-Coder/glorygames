import {
  HALF,
  BLOCKS,
  CENTRE,
  blockAt,
  blockIndex,
  fitsBlock,
  cityWorld,
  cityLayout,
  spawnAt,
  unpackBrick
} from './settlement.mjs';
import { shopWorld, clearForecourt, FORECOURT } from './upstairs.mjs';
import { DISTRICT, buildable, stationHeight, checkpoint } from './district.mjs';
// A stud is one world unit. Plates are one third of a brick high.
export const PLOT = 10;
export const PALETTE = {
  Coral: '#e55842',
  Sun: '#f4b934',
  Lagoon: '#148988',
  Sky: '#55a8ce',
  Plum: '#935a99',
  Leaf: '#77a64f',
  Chalk: '#f4e7c9',
  Ink: '#384851'
};
const specs = [
  ['single', 'Single', 1, 1, 1],
  ['pair', 'Pair', 2, 1, 1],
  ['beam', 'Long brick', 4, 1, 1],
  ['square', 'Square', 2, 2, 1],
  ['block', 'Block', 4, 2, 1],
  ['pillar', 'Pillar', 1, 1, 3],
  ['wall', 'Wall', 4, 1, 3],
  ['tile', 'Tile', 1, 1, 1 / 3],
  ['strip', 'Strip', 4, 1, 1 / 3],
  ['deck', 'Deck', 3, 2, 1 / 3],
  ['floor', 'Floor', 4, 4, 1 / 3],
  ['span', 'Long plate', 6, 2, 1 / 3],
  ['slope', 'Ramp', 3, 2, 1, 'ramp'],
  ['steep', 'Roof slope', 2, 2, 1.67, 'ramp'],
  ['door', 'Doorway', 3, 1, 3, 'door'],
  ['window', 'Window', 3, 1, 2, 'window'],
  ['arch', 'Wide arch', 4, 1, 3, 'door'],
  ['step', 'Steps', 3, 2, 1, 'step'],
  ['bench', 'Bench', 3, 1, 1, 'bench'],
  ['pot', 'Planter', 2, 2, 1, 'pot'],
  ['cab', 'Open cab', 2, 2, 2, 'cab', true],
  ['seat', 'Seat', 1, 2, 1, 'seat', true],
  ['cargo', 'Cargo bed', 2, 2, 1, 'cargo', true]
];
export const TYPES = Object.fromEntries(
  specs.map(([id, label, w, d, h, shape = 'solid', garageOnly = false]) => [
    id,
    { id, label, w, d, h, shape, garageOnly }
  ])
);
export function size(p) {
  const { w, d, h } = TYPES[p.type];
  return p.r % 2 ? { w: d, d: w, h } : { w, d, h };
}
// Local boxes are also the collision shapes. Frames have real open interiors.
function makeParts(type) {
  const { w, d, h, shape } = TYPES[type];
  const box = (x, z, y, a, b, c, detail) => ({ x, z, y, w: a, d: b, h: c, detail });
  if (['door', 'window', 'bench'].includes(shape)) {
    const t = shape === 'bench' ? 0.34 : 0.38;
    const frame = [
      box(0, 0, 0, t, d, h - t),
      box(w - t, 0, 0, t, d, h - t),
      box(0, 0, h - t, w, d, t)
    ];
    if (shape === 'window')
      frame.push(box(t, 0, 0, w - 2 * t, d, t), box(w / 2 - 0.08, 0, t, 0.16, d, h - 2 * t));
    return frame;
  }
  if (shape === 'cab') {
    const t = 0.24,
      frame = [box(0, 0, h - t, w, d, t)];
    for (const x of [0, w - t]) for (const z of [0, d - t]) frame.push(box(x, z, 0, t, t, h - t));
    return frame;
  }
  if (shape === 'seat')
    return [
      box(0.25, 0.25, 0, w - 0.5, d - 0.5, 0.36),
      box(0.25, 0.25, 0.36, w - 0.5, 0.32, h - 0.36)
    ];
  if (shape === 'cargo') {
    const t = 0.22;
    return [
      box(0, 0, 0, w, d, t),
      box(0, 0, t, w, t, h - t),
      box(0, d - t, t, w, t, h - t),
      box(0, t, t, t, d - 2 * t, h - t),
      box(w - t, t, t, t, d - 2 * t, h - t)
    ];
  }
  if (shape === 'step') return [0, 1, 2].map((i) => box(i, 0, 0, 1, d, (i + 1) / 3));
  if (shape === 'pot')
    return [box(0.16, 0.16, 0, w - 0.32, d - 0.32, 0.75), box(0, 0, 0.75, w, d, 0.25)];
  return [box(0, 0, 0, w, d, h, shape === 'ramp' ? 'ramp' : null)];
}
const shapes = Object.fromEntries(Object.keys(TYPES).map((type) => [type, makeParts(type)]));
export const parts = (type) => shapes[type];
export function partFootprint(piece, face) {
  const { w, d } = TYPES[piece.type];
  let { x, z } = face;
  if (piece.r === 1) {
    x = d - face.z - face.d;
    z = face.x;
  }
  if (piece.r === 2) {
    x = w - face.x - face.w;
    z = d - face.z - face.d;
  }
  if (piece.r === 3) {
    x = face.z;
    z = w - face.x - face.w;
  }
  return {
    x: x + piece.x,
    z: z + piece.z,
    w: piece.r % 2 ? face.d : face.w,
    d: piece.r % 2 ? face.w : face.d
  };
}
export function supports(lower, upper) {
  // Chassis parts can be hollow. Test actual contact faces, including rotated seat backs.
  for (const face of parts(lower.type)) {
    if (face.detail === 'ramp' || Math.abs(lower.y + face.y + face.h - upper.y) > 0.002) continue;
    const a = partFootprint(lower, face);
    for (const bottom of parts(upper.type)) {
      if (bottom.y !== 0) continue;
      const b = partFootprint(upper, bottom);
      if (a.x < b.x + b.w && b.x < a.x + a.w && a.z < b.z + b.d && b.z < a.z + a.d) return true;
    }
  }
  return false;
}

export function local(p, x, z) {
  const a = x - p.x,
    b = z - p.z,
    { w, d } = TYPES[p.type];
  switch (p.r) {
    case 1:
      return [b, d - a];
    case 2:
      return [w - a, d - b];
    case 3:
      return [w - b, a];
    default:
      return [a, b];
  }
}
export function intervals(p, x, z) {
  const { w, d } = size(p);
  if (x < p.x || x > p.x + w || z < p.z || z > p.z + d) return [];
  const [a, b] = local(p, x, z),
    result = [];
  for (const s of parts(p.type)) {
    if (a < s.x || a >= s.x + s.w || b < s.z || b >= s.z + s.d) continue;
    const h = s.detail === 'ramp' ? (s.h * (a - s.x)) / s.w : s.h;
    result.push([p.y + s.y, p.y + s.y + h]);
  }
  return result;
}
export const hasChannel = (kind) => kind === 'bridge' || kind === 'canal';
export const isChannel = (kind, x, z) => hasChannel(kind) && x >= -3 && x < 3 && Math.abs(z) <= 10;
export function floorAt(kind, x, z) {
  if (kind === 'city') return Math.abs(x) <= HALF && Math.abs(z) <= HALF ? 0 : -Infinity;
  if (kind === 'district')
    return Math.abs(x) <= DISTRICT.x && Math.abs(z) <= DISTRICT.z ? 0 : -Infinity;
  return Math.abs(x) <= PLOT && Math.abs(z) <= PLOT && !isChannel(kind, x, z) ? 0 : -Infinity;
}
export function validPiece(p, items, ignore = null, kind = 'free') {
  if (
    !Object.hasOwn(TYPES, p.type) ||
    !Object.hasOwn(PALETTE, p.color) ||
    !Number.isInteger(p.r) ||
    p.r < 0 ||
    p.r > 3 ||
    !Number.isInteger(p.x) ||
    !Number.isInteger(p.z) ||
    !Number.isFinite(p.y) ||
    p.y < 0 ||
    p.y > 64
  )
    return false;
  const a = size(p);
  if (kind === 'upstairs' && !clearForecourt(p, a)) return false;
  if (kind === 'city') {
    if (!fitsBlock(p.x, p.z, a.w, a.d)) return false;
    if (items.length) items = blockIndex(items)[blockAt(p.x, p.z).id];
  } else if (kind === 'district') {
    if (!buildable(p.x, p.z, a.w, a.d)) return false;
  } else if (p.x < -PLOT || p.z < -PLOT || p.x + a.w > PLOT || p.z + a.d > PLOT) return false;
  return !items.some((b) => {
    if (b.id === ignore) return false;
    const s = size(b);
    return (
      p.x < b.x + s.w &&
      p.x + a.w > b.x &&
      p.z < b.z + s.d &&
      p.z + a.d > b.z &&
      p.y < b.y + s.h - 0.001 &&
      p.y + a.h > b.y + 0.001
    );
  });
}
export function snapHeight(p, items, ignore = null) {
  const a = size(p);
  return items.reduce((y, b) => {
    if (b.id === ignore) return y;
    const s = size(b);
    return p.x < b.x + s.w && p.x + a.w > b.x && p.z < b.z + s.d && p.z + a.d > b.z
      ? Math.max(y, b.y + s.h)
      : y;
  }, 0);
}
export function world(kind) {
  if (kind === 'city') return cityWorld();
  if (kind === 'upstairs') return shopWorld();
  if (kind === 'district')
    return {
      version: 1,
      name: 'Market District',
      complete: false,
      stage: 0,
      freightStop: 0,
      freightComplete: false,
      pieces: [{ id: 'depot-steps', type: 'step', color: 'Lagoon', x: -17, z: -3, r: 1, y: 0 }]
    };
  if (kind === 'canal')
    return {
      version: 1,
      name: 'Canal Crossing',
      boatPassed: false,
      liftDegrees: 80,
      complete: false,
      pieces: [
        {
          id: 'starter-west',
          type: 'deck',
          color: 'Lagoon',
          x: -3,
          z: -1,
          y: 0,
          r: 0,
          mount: 'west'
        }
      ]
    };
  return {
    version: 1,
    name:
      kind === 'garage'
        ? 'My first buggy'
        : kind === 'bridge'
          ? 'Bridge the Gap'
          : 'My corner plot',
    ...(kind === 'garage' ? { tyres: 'road' } : {}),
    pieces: [],
    complete: false
  };
}
export const saveKey = (kind) => 'wga.brick-playground.v1.' + kind;
export function loadWorld(kind, storage) {
  const fresh = world(kind),
    raw = storage.getItem(saveKey(kind));
  if (!raw) return fresh;
  const v = JSON.parse(raw);
  if (v?.version !== 1 || !Array.isArray(v.pieces) || typeof v.name !== 'string')
    throw Error('Unrecognised world');
  if (kind === 'city') v.pieces = v.pieces.map(unpackBrick);
  const ids = new Set();
  for (const p of v.pieces) {
    if (!p || typeof p.id !== 'string' || ids.has(p.id) || !validPiece(p, [], null, kind))
      throw Error('Invalid saved brick');
    if (kind === 'canal' && p.mount !== undefined && !['west', 'east', 'fixed'].includes(p.mount))
      throw Error('Invalid hinge');
    ids.add(p.id);
  }
  return {
    ...fresh,
    name: v.name.slice(0, 40),
    pieces: v.pieces,
    ...(kind === 'city' ? cityLayout(v) : {}),
    ...(kind === 'upstairs'
      ? { stage: Number.isInteger(v.stage) && v.stage >= 0 && v.stage <= 3 ? v.stage : 0 }
      : {}),
    ...(kind === 'district'
      ? {
          stage: Number.isInteger(v.stage) && v.stage >= 0 && v.stage <= 4 ? v.stage : 0,
          freightStop:
            Number.isInteger(v.freightStop) && v.freightStop >= 0 && v.freightStop <= 4
              ? v.freightStop
              : 0,
          freightComplete: v.freightComplete === true || v.freightStop === 4
        }
      : {}),
    complete: v.complete === true || (kind === 'upstairs' && v.stage === 3),
    ...(kind === 'canal'
      ? {
          boatPassed: v.boatPassed === true || v.complete === true,
          liftDegrees: [10, 40, 80].includes(v.liftDegrees) ? v.liftDegrees : 80
        }
      : {}),
    ...(kind === 'garage' && typeof v.tyres === 'string' ? { tyres: v.tyres } : {})
  };
}
export const avatar = (kind = 'free') => ({
  x: hasChannel(kind) ? -7 : 0.5,
  z: -7,
  y: 0,
  vy: 0,
  grounded: true,
  heading: 0,
  ...(kind === 'district'
    ? checkpoint(0)
    : kind === 'upstairs'
      ? FORECOURT
      : kind === 'city'
        ? spawnAt(BLOCKS[CENTRE])
        : {})
});
const HEIGHT = 1.65,
  RADIUS = 0.27,
  STEP = 0.365;
const BODY_SAMPLES = [
  [0, 0],
  [RADIUS, 0],
  [-RADIUS, 0],
  [0, RADIUS],
  [0, -RADIUS],
  [0.19, 0.19],
  [0.19, -0.19],
  [-0.19, 0.19],
  [-0.19, -0.19]
];
export function blockingBrick(a, items, dx, dz) {
  const x = a.x + dx * 0.11,
    z = a.z + dz * 0.11;
  for (const p of items)
    for (const [ox, oz] of BODY_SAMPLES) {
      if (
        intervals(p, x + ox, z + oz).some(
          ([low, high]) => low < a.y + HEIGHT - 0.001 && high > a.y + STEP
        )
      )
        return p.id;
    }
  return null;
}
function bodySurfaces(kind, items, x, z) {
  const solids = [];
  for (const [ox, oz] of BODY_SAMPLES) {
    const floor = floorAt(kind, x + ox, z + oz);
    if (Number.isFinite(floor)) solids.push([-100, floor]);
    if (kind === 'district') {
      const h = stationHeight(x + ox, z + oz);
      if (h) solids.push([0, h]);
    }
    for (const p of items) solids.push(...intervals(p, x + ox, z + oz));
  }
  return solids;
}
export function advanceAvatar(a, kind, items, dx, dz, jump, dt) {
  if (kind === 'city') items = blockIndex(items)[blockAt(a.x, a.z).id];
  if (jump && a.grounded) {
    a.vy = 6.3;
    a.grounded = false;
  }
  const len = Math.max(1, Math.hypot(dx, dz));
  for (const [mx, mz] of [
    [(dx / len) * dt * 3.8, 0],
    [0, (dz / len) * dt * 3.8]
  ]) {
    if (!mx && !mz) continue;
    const edgeX = kind === 'district' ? DISTRICT.x : kind === 'city' ? HALF : PLOT;
    const edgeZ = kind === 'district' ? DISTRICT.z : kind === 'city' ? HALF : PLOT;
    if (Math.abs(a.x + mx) > edgeX - RADIUS || Math.abs(a.z + mz) > edgeZ - RADIUS) continue;
    const solids = bodySurfaces(kind, items, a.x + mx, a.z + mz);
    let y = a.y;
    if (a.grounded) for (const [, top] of solids) if (top >= y && top <= a.y + STEP) y = top;
    if (solids.some(([low, high]) => low < y + HEIGHT - 0.001 && high > y + 0.001)) continue;
    a.x += mx;
    a.z += mz;
    a.y = y;
  }
  const old = a.y;
  a.vy -= 15 * dt;
  let y = a.y + a.vy * dt;
  const solids = bodySurfaces(kind, items, a.x, a.z);
  a.grounded = false;
  if (a.vy <= 0) {
    for (const [, top] of solids)
      if (top <= old + 0.005 && top >= y) {
        y = top;
        a.vy = 0;
        a.grounded = true;
      }
  } else {
    for (const [low] of solids)
      if (low >= old + HEIGHT - 0.005 && low < y + HEIGHT) {
        y = low - HEIGHT;
        a.vy = 0;
      }
  }
  a.y = y;
  if (Math.abs(dx) + Math.abs(dz) > 0.01) a.heading = Math.atan2(dx, dz);
}
// Four independent tyre tracks use the same solids as the explorer.
export const buggy = () => ({
  x: -8,
  z: 0.0,
  y: 0,
  pitch: 0,
  roll: 0,
  state: 'ready',
  reason: '',
  wheels: [0, 0, 0, 0]
});
export function advanceBuggy(car, items, dt) {
  if (car.state !== 'running') return;
  const next = car.x + dt * 2.6,
    heights = [];
  for (const [i, [ox, oz]] of [
    [0.56, -0.49],
    [0.56, 0.49],
    [-0.56, -0.49],
    [-0.56, 0.49]
  ].entries()) {
    const x = next + ox,
      z = car.z + oz,
      prev = car.wheels[i];
    let level = floorAt('bridge', x, z);
    for (const p of items) {
      for (const [low, top] of intervals(p, x, z)) {
        // A lintel above the buggy is traversable.
        if (low < prev + 1.05 && top > level) level = top;
      }
    }
    if (level < prev - 0.48 || level > prev + 0.38) {
      car.state = level < prev - 0.48 ? 'fell' : 'stopped';
      car.reason = car.state === 'fell' ? 'A wheel lost the deck' : 'The step is too high';
      return;
    }
    heights.push(level);
  }
  car.x = next;
  car.wheels = heights;
  car.y = heights.reduce((a, b) => a + b, 0) / 4;
  car.pitch = Math.atan2(heights[0] + heights[1] - heights[2] - heights[3], 2.24);
  car.roll = Math.atan2(heights[1] + heights[3] - heights[0] - heights[2], 1.96);
  if (car.x >= 9.3) car.state = 'won';
}
