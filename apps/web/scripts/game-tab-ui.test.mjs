import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bindGameFullscreen, mountGameTab, GAME_START_BUTTONS } from '../public/games/_shared/game-tab.mjs';

function target() {
  const events = new Map(); return { events, attrs: {}, children: [], textContent: '',
    addEventListener(k, fn) { events.set(k, fn); }, removeEventListener(k) { events.delete(k); },
    setAttribute(k, v) { this.attrs[k] = v; }, append(...children) { this.children.push(...children); }, remove() {} };
}
test('fullscreen is user activated, exits correctly and gives a harmless rejection message', async () => {
  const host = target(), win = target(); let enters = 0, exits = 0;
  const doc = { ...target(), documentElement: { async requestFullscreen() { enters++; doc.fullscreenElement = {}; } },
    async exitFullscreen() { exits++; doc.fullscreenElement = null; }, createElement: () => target() };
  const controls = bindGameFullscreen({ document: doc, window: win, host });
  assert.equal(enters, 0); const [button, status] = host.children;
  const click = { preventDefault() {}, stopPropagation() {} };
  button.events.get('click')(click); await new Promise(resolve => setImmediate(resolve));
  assert.equal(enters, 1); assert.equal(button.textContent, 'Exit Fullscreen');
  button.events.get('click')(click); await new Promise(resolve => setImmediate(resolve));
  assert.equal(exits, 1); assert.equal(button.textContent, 'Enter Fullscreen');
  doc.documentElement.requestFullscreen = async () => { throw Error('denied'); };
  // The captured request is the original function: test denial on a fresh binding.
  controls.dispose(); host.children = []; bindGameFullscreen({ document: doc, window: win, host });
  host.children[0].events.get('click')(click); await new Promise(resolve => setImmediate(resolve));
  assert.match(host.children[1].textContent, /fills this tab/); assert.equal(status.textContent, '');
});
test('unsupported fullscreen adds no dead control', () => {
  const host = target(); bindGameFullscreen({ document: { documentElement: {} }, window: target(), host }); assert.equal(host.children.length, 0);
});
test('all 21 entries opt in once, expose their runtime and menu host; Sky Temple opts out', () => {
  assert.equal(Object.keys(GAME_START_BUTTONS).length, 21);
  for (const [slug, id] of Object.entries(GAME_START_BUTTONS)) {
    const html = readFileSync(new URL(`../public/games/${slug}/index.html`, import.meta.url), 'utf8');
    assert.equal((html.match(/game-tab\.mjs\?v=1/g) || []).length, 1, slug);
    assert.equal((html.match(/game-tab\.css\?v=1/g) || []).length, 1, slug);
    assert.ok(html.includes(`id="${id}"`), `${slug}: ${id}`);
    if (slug === 'physics-force-lab') {
      assert.match(html, /src="\.\/adventure\.js"/);
      const original = readFileSync(new URL('../public/games/physics-force-lab/original-labs.html', import.meta.url), 'utf8');
      assert.match(original, /src="\.\/game\.js"/);
      assert.match(original, /id="startBtn"/);
    } else assert.match(html, /(?:\.\/)?game\.js/);
  }
  assert.ok(!GAME_START_BUTTONS['sky-temple-3d-rise-of-the-relic-master']);
  const sky = readFileSync(new URL('../public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/index.html', import.meta.url), 'utf8');
  assert.ok(!sky.includes('game-tab.mjs'));
});

test('the preserved Physics labs mount the same score and fullscreen bridge at their explicit entry', () => {
  const host = target(), doc = { ...target(), documentElement: { dataset: {} }, getElementById: () => ({ parentElement: host }) };
  const win = { ...target(), document: doc, location: { pathname: '/games/physics-force-lab/original-labs.html', origin: 'https://example.test', search: '?scores=0' }, dispatchEvent() {}, Event: class {} };
  win.self = win; win.top = win; mountGameTab(win);
  assert.equal(doc.documentElement.dataset.wgaTab, 'physics-force-lab');
  win.GG.setScore(25); assert.equal(win.__wgaGameTab.scoreBridge.state().latest, 25);
  win.__wgaGameTab.scoreBridge.dispose();
});

test('the preserved Science dash mounts its existing score bridge and menu fullscreen at its explicit entry', () => {
  const host = target(), doc = { ...target(), documentElement: { dataset: {} }, getElementById: () => ({ parentElement: host }) };
  const win = { ...target(), document: doc, location: { pathname: '/games/science-lab-dash/original-dash.html', origin: 'https://example.test', search: '?scores=0' }, dispatchEvent() {}, Event: class {} };
  win.top = win; win.self = win; mountGameTab(win);
  assert.equal(win.__wgaGameTab.slug, 'science-lab-dash');
  assert.equal(doc.documentElement.dataset.wgaTab, 'science-lab-dash');
  win.__wgaGameTab.fullscreen.dispose();
});

test('standalone bootstrap accepts only its own origin/window scores and supports SDK object calls in practice mode', () => {
  const host = target(), storage = new Map();
  const doc = { ...target(), documentElement: { dataset: {} }, getElementById: () => ({ parentElement: host }) };
  const win = { ...target(), document: doc, location: { pathname: '/games/brick-blaster/', origin: 'https://example.test', search: '?scores=0' },
    localStorage: { setItem: (k, v) => storage.set(k, v), getItem: k => storage.get(k) }, dispatchEvent() {}, Event: class {}, open() {} };
  win.self = win; win.top = win;
  mountGameTab(win); assert.equal(doc.documentElement.dataset.wgaTab, 'brick-blaster');
  const message = win.events.get('message');
  message({ origin: 'https://other.test', source: win, data: { type: 'GG_SCORE', score: 50 } });
  message({ origin: win.location.origin, source: {}, data: { type: 'GG_SCORE', score: 50 } });
  assert.equal(win.__wgaGameTab.scoreBridge.state().best, 0);
  win.GG.endRound({ score: 12, gameSlug: 'brick-blaster' });
  assert.equal(win.__wgaGameTab.scoreBridge.state().best, 12);
  win.GG.setScore(19); assert.equal(win.__wgaGameTab.scoreBridge.state().latest, 19);
  message({ origin: win.location.origin, source: win, data: { type: 'GG_SCORE', score: 21 } });
  assert.equal(win.__wgaGameTab.scoreBridge.state().latest, 21);
  win.__wgaGameTab.scoreBridge.dispose();
  const sky = { ...win, __wgaGameTab: undefined, location: { ...win.location, pathname: '/games/sky-temple-3d-rise-of-the-relic-master/' } };
  sky.self = sky; sky.top = sky; mountGameTab(sky); assert.equal(sky.__wgaGameTab, undefined);
});

test('the original Space Pilot route retains the same score bridge at its explicit entry', () => {
  const host=target(),doc={...target(),documentElement:{dataset:{}},getElementById:()=>({parentElement:host})};
  const win={...target(),document:doc,location:{pathname:'/games/space-pilot-platformer/original-route.html',origin:'https://example.test',search:'?scores=0'},dispatchEvent(){},Event:class{}};
  win.self=win;win.top=win;mountGameTab(win);
  assert.equal(win.__wgaGameTab.slug,'space-pilot-platformer');win.GG.setScore(125);
  assert.equal(win.__wgaGameTab.scoreBridge.state().latest,125);win.__wgaGameTab.scoreBridge.dispose();
});

test('Verdantis mounts the existing Space Pilot score bridge at its explicit chapter entry', () => {
  const host=target(),doc={...target(),documentElement:{dataset:{}},getElementById:()=>({parentElement:host})};
  const win={...target(),document:doc,location:{pathname:'/games/space-pilot-platformer/verdantis.html',origin:'https://example.test',search:'?scores=0'},dispatchEvent(){},Event:class{}};
  win.self=win;win.top=win;mountGameTab(win);assert.equal(win.__wgaGameTab.slug,'space-pilot-platformer');
  win.GG.setScore(400);assert.equal(win.__wgaGameTab.scoreBridge.state().latest,400);win.__wgaGameTab.scoreBridge.dispose();
});

test('NOVA-X mounts the existing Space Pilot score bridge at its final chapter entry', () => {
  const host=target(),doc={...target(),documentElement:{dataset:{}},getElementById:()=>({parentElement:host})};
  const win={...target(),document:doc,location:{pathname:'/games/space-pilot-platformer/novax.html',origin:'https://example.test',search:'?scores=0'},dispatchEvent(){},Event:class{}};
  win.self=win;win.top=win;mountGameTab(win);assert.equal(win.__wgaGameTab.slug,'space-pilot-platformer');
  win.GG.setScore(800);assert.equal(win.__wgaGameTab.scoreBridge.state().latest,800);win.__wgaGameTab.scoreBridge.dispose();
});
