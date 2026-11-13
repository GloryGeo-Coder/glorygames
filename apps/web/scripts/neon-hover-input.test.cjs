'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual production pointer handlers without requiring a browser.
const source = fs.readFileSync(path.join(__dirname, '../public/games/neon-hover-runner/game.js'), 'utf8');
const start = source.indexOf('  let pointerActive = false;');
const end = source.indexOf('  window.addEventListener("keydown"', start);
assert.ok(start >= 0 && end > start, 'production input handler boundaries exist');
function input() {
  const handlers = {}, actions = [];
  const context = {
    canvas: { addEventListener: (name, fn) => { handlers[name] = fn; }, getBoundingClientRect: () => ({ left: 0, top: 0 }) },
    running: true, paused: false, dead: false,
    ensureAudio() {}, changeLane: direction => actions.push(['lane', direction]),
    activateBoost: () => actions.push(['boost']), jump: () => actions.push(['jump'])
  };
  vm.runInNewContext(source.slice(start, end), context);
  return { actions, event: (name, x, y) => handlers[name]({ clientX: x, clientY: y, preventDefault() {} }) };
}
test('slow horizontal movement accumulates into a lane change', () => {
  const t = input(); t.event('pointerdown', 100, 100);
  [110, 120, 130].forEach(x => t.event('pointermove', x, 100));
  assert.deepEqual(t.actions, [['lane', 1]]);
});
test('downward then repeated horizontal movement stays responsive without lifting', () => {
  const t = input(); t.event('pointerdown', 100, 100);
  t.event('pointermove', 100, 200);
  assert.deepEqual(t.actions, [], 'downward movement has no gameplay action');
  t.event('pointermove', 130, 200); t.event('pointermove', 160, 200);
  t.event('pointermove', 130, 200); t.event('pointerup', 130, 200);
  assert.deepEqual(t.actions, [['lane', 1], ['lane', 1], ['lane', -1]]);
});
test('lane change resets vertical drift before the next swipe', () => {
  const t = input(); t.event('pointerdown', 100, 100);
  t.event('pointermove', 150, 130); t.event('pointermove', 180, 130);
  assert.deepEqual(t.actions, [['lane', 1], ['lane', 1]]);
});
test('boost resets horizontal drift before a following lane change', () => {
  const t = input(); t.event('pointerdown', 100, 100);
  t.event('pointermove', 120, 50); t.event('pointermove', 90, 50);
  assert.deepEqual(t.actions, [['boost'], ['lane', -1]]);
});
test('horizontal swipe then upward movement boosts independently', () => {
  const t = input(); t.event('pointerdown', 100, 100);
  t.event('pointermove', 180, 120); t.event('pointermove', 180, 80);
  assert.deepEqual(t.actions, [['lane', 1], ['boost']]);
});
test('tap still jumps and ending a gesture stops further movement', () => {
  const t = input(); t.event('pointerdown', 100, 100); t.event('pointerup', 100, 100);
  t.event('pointermove', 150, 100);
  assert.deepEqual(t.actions, [['jump']]);
});
