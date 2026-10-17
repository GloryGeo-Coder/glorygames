import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url), world = process.argv[2] || 'garden';
process.on('uncaughtException', error => { console.error(error.stack); process.exitCode = 1; });
process.on('unhandledRejection', error => { console.error(error?.stack || String(error)); process.exitCode = 1; });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d');
const B = require(path.join(root, 'vendor/babylon-9.31.0.js'));
vm.runInNewContext(fs.readFileSync(path.join(root, 'vendor/babylon-loaders-9.31.0.min.js'), 'utf8'), {
  BABYLON: B, module: { exports: {} }, exports: {}, require: () => B,
  console, TextDecoder, TextEncoder, URL, Blob, ArrayBuffer, Uint8Array, setTimeout, clearTimeout,
});
const events = new Map(), elements = new Map(), imported = [];
class Element {
  constructor() { this.hidden = false; this.disabled = false; this.textContent = ''; this.style = {}; this.dataset = {}; this.attrs = {}; this.events = {};
    const s = new Set(); this.classList = { toggle(k, v) { if (v) s.add(k); else s.delete(k); }, add: k => s.add(k), remove: k => s.delete(k), contains: k => s.has(k) }; }
  setAttribute(k, v) { this.attrs[k] = v; } getAttribute(k) { return this.attrs[k]; }
  addEventListener(k, fn) { (this.events[k] ??= []).push(fn); }
  removeEventListener(k, fn) { this.events[k] = (this.events[k] || []).filter(f => f !== fn); }
  dispatch(k) { for (const fn of this.events[k] || []) fn({ target: this, preventDefault() {}, pointerId: 1 }); }
  focus() {} setPointerCapture() {} getBoundingClientRect() { return { left: 0, top: 0, width: 120, height: 120 }; }
}
const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
globalThis.window = globalThis;
globalThis.document = { hidden: false, getElementById: get,
  addEventListener(k, fn) { if (!events.has(k)) events.set(k, []); events.get(k).push(fn); },
  removeEventListener(k, fn) { events.set(k, (events.get(k) || []).filter(f => f !== fn)); } };
globalThis.addEventListener = document.addEventListener;
globalThis.removeEventListener = document.removeEventListener;
globalThis.matchMedia = () => ({ matches: false }); globalThis.location = { search: '', origin: 'http://localhost:8080' };
globalThis.parent = { postMessage() { throw Error('A candidate must not post leaderboard scores'); } };
globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
globalThis.devicePixelRatio = 1; globalThis.innerWidth = 1280; globalThis.innerHeight = 720;
const OriginalImport = B.SceneLoader.ImportMeshAsync.bind(B.SceneLoader);
globalThis.BABYLON = { ...B, Engine: class extends B.NullEngine {
  constructor() { super({ renderWidth: 1280, renderHeight: 720 }); }
}, SceneLoader: { async ImportMeshAsync(names, _root, file, scene, progress) {
  imported.push(file);
  return OriginalImport(names, '', new Uint8Array(fs.readFileSync(path.join(root, 'assets', file))), scene, progress, '.glb');
} } };
await import(pathToFileURL(path.join(root, world === 'garden' ? '' : world, 'game.js')));
try {
  for (let i = 0; i < 80 && get('primaryBtn').disabled; i++) await new Promise(r => setTimeout(r, 25));
  assert.equal(get('primaryBtn').disabled, false, `${get('loadingText').textContent} ${get('overlayDescription').textContent}`);
  assert.ok(imported.includes('RelicHero_Rigged_Refined_Mobile.glb'));
  assert.equal(imported.length, 3, imported.join(','));
  get('primaryBtn').dispatch('click');
  await new Promise(r => setTimeout(r, 40));
  get('jumpBtn').dispatch('pointerdown'); get('blastBtn').dispatch('pointerdown');
  await new Promise(r => setTimeout(r, 70));
  get('pauseBtn').dispatch('click'); assert.equal(get('overlaySubtitle').textContent, 'Adventure paused');
  assert.equal(get('relicCount').textContent, '0 / 5');
  console.log(`PASS real runtime ${world} · ${B.Engine.Version} · ${imported.length} actual GLBs`);
} finally { for (const callback of events.get('pagehide') || []) callback(); }
