import test from 'node:test';
import assert from 'node:assert/strict';
import { createCampaignPresentation } from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/campaign-presentation.mjs';
function fixture(reducedMotion = false) {
  const elements = new Map(), changes = [];
  const get = id => {
    if (!elements.has(id)) elements.set(id, { dataset: {}, attrs: {}, events: {}, textContent: '', value: '',
      classList: { states: {}, toggle(k, v) { this.states[k] = v; } },
      setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(k, f) { this.events[k] = f; },
      removeEventListener(k) { delete this.events[k]; }, focus() { this.focused = true; } });
    return elements.get(id);
  };
  let callback;
  const state = { music: .45, effects: .70, muted: false, title: 'World music', mode: 'menu', unlocked: false };
  const audio = { subscribe(fn) { callback = fn; fn(state); return () => {}; }, state: () => state,
    setPreferences(change) { changes.push(change); Object.assign(state, change); callback(state); }, unlock() { return Promise.resolve(true); } };
  const presentation = createCampaignPresentation({ world: 'crystal', audio, document: { getElementById: get }, reducedMotion });
  return { get, changes, state, presentation };
}
test('pause-menu sliders, mute and Escape remain accessible and save independent changes', () => {
  const { get, changes, presentation } = fixture();
  assert.equal(get('musicVolumeValue').textContent, '45%');
  get('musicVolume').events.input({ target: { value: '18' } });
  get('effectsVolume').events.input({ target: { value: '64' } });
  get('soundBtn').events.click();
  assert.deepEqual(changes, [{ music: .18 }, { effects: .64 }, { muted: true }]);
  assert.equal(get('soundBtn').attrs['aria-pressed'], 'true');
  get('audioSettings').events.keydown({ key: 'Escape', preventDefault() {}, stopPropagation() {} });
  assert.equal(get('audioSettings').open, false); assert.equal(get('primaryBtn').focused, true);
  presentation.dispose(); assert.equal(get('musicVolume').events.input, undefined);
});
test('world and reward styling changes only presentation and respects reduced motion', () => {
  const { get, presentation } = fixture();
  presentation.setMode('won'); presentation.emit('relic');
  assert.equal(get('app').dataset.world, 'crystal'); assert.equal(get('app').dataset.mode, 'won');
  assert.equal(get('relicCount').classList.states.rewardPulseA, true);
  const reduced = fixture(true); reduced.presentation.emit('relic');
  assert.deepEqual(reduced.get('relicCount').classList.states, {});
});
