import test from 'node:test';
import assert from 'node:assert/strict';
import {
  world,
  loadWorld,
  saveKey,
  buggy,
  advanceBuggy,
  floorAt
} from '../public/games/brick-playground-3d/model.mjs';
import {
  attachmentIssue,
  advanceMotor,
  canalState,
  OPEN_ANGLE,
  advanceBoat,
  sendBoat,
  boatObstruction,
  canEditCanal,
  fitsLeaf
} from '../public/games/brick-playground-3d/canal.mjs';
const west = world('canal').pieces[0],
  east = { ...west, id: 'east', mount: 'east', x: 0 },
  pair = [west, east];
function raise(items, angle = OPEN_ANGLE) {
  const state = canalState();
  state.target = angle;
  for (let i = 0; i < 160; i++) advanceMotor(state, items, 1 / 60);
  return state;
}
function sail(state, items) {
  sendBoat(state);
  for (let i = 0; i < 900; i++) advanceBoat(state, items, 1 / 60);
  return state.traffic;
}
function drive(items) {
  const car = buggy();
  car.state = 'running';
  for (let i = 0; i < 900; i++) advanceBuggy(car, items, 1 / 60);
  return car;
}
test('both hinge zones accept directly mounted decks and interlocked extensions; floating sections cannot operate', () => {
  assert.equal(attachmentIssue(pair), '');
  const root = { ...west, type: 'single' },
    tip = { ...west, id: 'tip', type: 'single', x: -2 },
    join = { ...west, id: 'join', type: 'pair', y: 1 };
  assert.match(attachmentIssue([root, tip]), /west/);
  assert.equal(attachmentIssue([root, tip, join]), '');
  assert.match(attachmentIssue([{ ...root, y: 1 }]), /Connect/);
  assert.equal(fitsLeaf({ ...east, x: -1 }), false);
  assert.equal(fitsLeaf({ ...west, z: 2 }), false);
});
test('closed leaves block the ferry, raised leaves pass it, and a fixed obstruction still blocks an open crossing', () => {
  const closed = canalState();
  assert.equal(sail(closed, pair), 'boatStopped');
  assert.match(closed.reason, /leaf/);
  const open = raise(pair);
  assert.equal(open.angle, OPEN_ANGLE);
  assert.equal(sail(open, pair), 'boatPassed');
  const obstruction = { ...east, id: 'beam', mount: 'fixed', z: 3, y: 0.66, type: 'pair', x: -1 };
  assert.equal(sail(raise(pair), [...pair, obstruction]), 'boatStopped');
  assert.equal(boatObstruction([obstruction], OPEN_ANGLE, -7), null);
});
test('actual solids leave the space inside a raised arch clear', () => {
  const arch = { ...west, id: 'arch', mount: 'fixed', type: 'arch', x: -2, z: 3 };
  assert.equal(boatObstruction([arch], 0, 3.75), null);
  const lintel = { ...arch, type: 'wall' };
  assert.ok(boatObstruction([lintel], 0, 3.75));
});
test('a fixed overhang jams the sweep; the operator can lower, remove it and open fully', () => {
  const obstruction = { ...west, id: 'bar', type: 'beam', mount: 'fixed', x: -4, y: 1 };
  const state = raise([...pair, obstruction]);
  assert.ok(state.angle > 0 && state.angle < OPEN_ANGLE);
  assert.match(state.reason, /blocking/);
  state.target = 0;
  for (let i = 0; i < 120; i++) advanceMotor(state, [...pair, obstruction], 1 / 60);
  assert.equal(state.angle, 0);
  assert.ok(canEditCanal(state));
  assert.equal(raise(pair).angle, OPEN_ANGLE);
});
test('a ferry pass alone cannot support the buggy; complete and alternative decks span all four tyres', () => {
  assert.equal(drive([west]).state, 'fell');
  assert.equal(drive(pair).state, 'won');
  const short = { ...east, type: 'pair', id: 'tip', x: 0 },
    cap = { ...east, type: 'single', id: 'cap', x: 2 };
  const twin = [
    ...pair.slice(0, 1),
    ...[-1, 0].flatMap((z) => [
      { ...short, z, id: 'tip' + z },
      { ...cap, z, id: 'cap' + z }
    ])
  ];
  assert.equal(drive(twin).state, 'stopped'); // full-height bricks create a step a buggy cannot climb
  const strips = [
    west,
    ...[-1, 0].flatMap((z) =>
      [0, 1, 2].map((x) => ({ ...east, id: x + ',' + z, type: 'tile', x, z }))
    ),
    ...[-1, 0].map((z) => ({ ...east, id: 'join' + z, type: 'pair', x: 0, z, y: 1 / 3 }))
  ];
  assert.ok(attachmentIssue(strips)); // a joining plate must actually reach the bearing
  const stepped = [west, { ...east, r: 1, x: 1 }, { ...east, id: 'overlap', r: 1, y: 1 / 3 }];
  assert.equal(attachmentIssue(stepped), '');
  assert.equal(drive(stepped).state, 'won');
  const lifted = raise(stepped);
  assert.equal(sail(lifted, stepped), 'boatPassed');
  assert.equal(floorAt('canal', 0, 0), -Infinity);
  assert.equal(floorAt('free', 0, 0), 0);
});
test('paired half-width decks and separate design/certification survive a reload', () => {
  const replacement = [west, { ...east, type: 'deck', id: 'deck' }],
    state = {
      ...world('canal'),
      name: 'Wharf 4',
      pieces: replacement,
      boatPassed: true,
      complete: true
    };
  const storage = { getItem: (k) => (k === saveKey('canal') ? JSON.stringify(state) : null) };
  assert.deepEqual(loadWorld('canal', storage), state);
  for (const k of ['free', 'bridge', 'garage']) assert.deepEqual(loadWorld(k, storage), world(k));
});

test('lift settings change the outcome for the very same design and are saved with the world', () => {
  const ten = raise(pair, Math.PI / 18),
    forty = raise(pair, (40 * Math.PI) / 180);
  assert.equal(sail(ten, pair), 'boatStopped');
  assert.equal(sail(forty, pair), 'boatPassed');
  const saved = { ...world('canal'), liftDegrees: 40 };
  assert.equal(loadWorld('canal', { getItem: () => JSON.stringify(saved) }).liftDegrees, 40);
});
