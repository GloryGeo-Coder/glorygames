import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FakeAudioContext, memoryStorage, nextTurn } from './audio-test-context.mjs';

const world = process.argv[2] || 'garden';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d');
const events = new Map(), elements = new Map();
class Element {
  constructor(id) {
    this.id = id; this.events = new Map(); this.dataset = {}; this.attrs = {}; this.style = {};
    this.textContent = ''; this.value = ''; this.hidden = false; this.disabled = false;
    const classes = new Set();
    this.classList = { add: k => classes.add(k), remove: k => classes.delete(k), contains: k => classes.has(k),
      toggle(k, enabled) { if (enabled) classes.add(k); else classes.delete(k); } };
  }
  setAttribute(k, v) { this.attrs[k] = v; }
  getAttribute(k) { return this.attrs[k]; }
  addEventListener(k, fn) { if (!this.events.has(k)) this.events.set(k, []); this.events.get(k).push(fn); }
  removeEventListener(k, fn) { this.events.set(k, (this.events.get(k) || []).filter(x => x !== fn)); }
  dispatch(k, extra = {}) { for (const fn of this.events.get(k) || []) fn({ target: this, preventDefault() {}, stopPropagation() {}, pointerId: 1, ...extra }); }
  focus() {} setPointerCapture() {}
  getBoundingClientRect() { return { left: 0, top: 0, width: 120, height: 120 }; }
}
const get = id => { if (!elements.has(id)) elements.set(id, new Element(id)); return elements.get(id); };
get('overlaySubtitle').textContent = ({ garden: 'Relic Awakening', crystal: 'Resonance Trial', storm: 'Tempest Trial', solar: 'Final Radiance' })[world];
globalThis.window = globalThis;
globalThis.document = { getElementById: get, hidden: false,
  addEventListener(k, fn) { if (!events.has(k)) events.set(k, []); events.get(k).push(fn); } };
globalThis.addEventListener = document.addEventListener;
globalThis.localStorage = memoryStorage();
globalThis.matchMedia = () => ({ matches: false });
globalThis.location = { search: '', origin: 'http://localhost:8080' };
globalThis.parent = { postMessage() {} }; globalThis.innerWidth = 390; globalThis.innerHeight = 844; globalThis.devicePixelRatio = 2;
Object.defineProperty(globalThis, 'navigator', { value: { maxTouchPoints: 5 }, configurable: true });
const contexts = [], requests = [];
globalThis.AudioContext = class extends FakeAudioContext { constructor() { super(); contexts.push(this); } };
globalThis.fetch = async url => { requests.push(String(url)); return { ok: true, arrayBuffer: async () => new ArrayBuffer(10) }; };
vm.runInThisContext(fs.readFileSync(new URL('../babylon-test-shim.js', import.meta.url), 'utf8'));
await import(pathToFileURL(resolve(root, world === 'garden' ? '' : world, 'game.js')));
await new Promise(r => setTimeout(r, 80));
assert.equal(contexts.length, 0); assert.equal(requests.length, 0);
assert.equal(get('primaryBtn').disabled, false);
assert.equal(get('soundBtn').events.get('click').length, 1);
get('primaryBtn').dispatch('click'); await nextTurn(); await nextTurn();
assert.equal(contexts.length, 1); assert.equal(get('overlay').attrs['aria-hidden'], 'true');
assert.equal(get('touchControls').hidden, false);
assert.ok(requests.some(url => url.endsWith(`${world}-exploration.mp3`)));
assert.equal(get('app').dataset.mode, 'playing');
get('jumpBtn').dispatch('pointerdown'); await new Promise(r => setTimeout(r, 45));
assert.ok(contexts[0].sources.some(s => !s.loop && s.starts.length));
get('pauseBtn').dispatch('click'); assert.equal(contexts[0].state, 'suspended');
assert.equal(get('app').dataset.mode, 'paused');
get('musicVolume').value = '23'; get('musicVolume').dispatch('input');
get('effectsVolume').value = '61'; get('effectsVolume').dispatch('input'); await nextTurn();
assert.equal(get('musicVolumeValue').textContent, '23%'); assert.equal(get('effectsVolumeValue').textContent, '61%');
const prefs = JSON.parse(localStorage.getItem('wga_skytemple_audio_v1'));
assert.equal(prefs.music, .23); assert.equal(prefs.effects, .61);
get('soundBtn').dispatch('click'); assert.equal(get('soundBtn').attrs['aria-pressed'], 'true');
get('soundBtn').dispatch('click'); await nextTurn();
get('primaryBtn').dispatch('click'); await nextTurn(); await nextTurn();
assert.equal(contexts[0].state, 'running');
assert.equal(contexts[0].sources.filter(s => s.loop && s.starts.length && !s.stops.length).length, 1);
document.hidden = true; for (const fn of events.get('visibilitychange')) fn();
assert.equal(get('overlaySubtitle').textContent, 'Adventure paused'); assert.equal(contexts[0].state, 'suspended');
assert.equal(contexts[0].sources.filter(s => s.starts.length && !s.stops.length).length, 0);
for (const fn of events.get('pagehide')) fn();
assert.equal(contexts[0].state, 'closed');
console.log(`PASS audio runtime ${world}`);
