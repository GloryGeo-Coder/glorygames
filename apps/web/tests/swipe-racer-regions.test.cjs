'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '../public/games/swipe-racer');
const key = 'wga_swipe_racer_horizon_v1';

function game(seed = {}, blocked = false) {
  const storage = { ...seed }, elements = {};
  const context2d = new Proxy({}, { get: (o, p) => o[p] || (() => {}), set: (o, p, v) => (o[p] = v, true) });
  function el(id) {
    return elements[id] ||= { style:{}, textContent:'', value:'', addEventListener(){}, appendChild(){}, getBoundingClientRect(){return {width:390,height:700,left:0,top:0}}, getContext(){return context2d}, setPointerCapture(){} };
  }
  const document = { getElementById:el, createElement:()=>({}), addEventListener(){}, hidden:false };
  const window = { innerWidth:390, innerHeight:700, devicePixelRatio:1, addEventListener(){}, parent:{postMessage(){}} };
  const localStorage = { getItem:k=>{if(blocked) throw Error('blocked');return storage[k]??null}, setItem:(k,v)=>{if(blocked) throw Error('blocked');storage[k]=v} };
  const sandbox = { document, window, localStorage, performance:{now:()=>1000}, requestAnimationFrame(){}, setInterval:()=>1, clearInterval(){}, Image:class {set src(v){this.onload?.()}}, fetch:()=>Promise.reject(Error('offline')), Promise, Math, console };
  sandbox.globalThis = sandbox;
  const source = fs.readFileSync(path.join(root, 'game.js'), 'utf8').replace('  resetRun();\n  requestAnimationFrame(loop);', '  globalThis.api = {state, progress, LEVELS, loadLevel, startLevel, step, togglePause, missionText};\n  resetRun();');
  assert(source.includes('globalThis.api ='), 'runtime test hook inserted');
  vm.runInNewContext(source, sandbox);
  return { api:sandbox.api, storage, elements };
}

test('migrates completed original campaign while preserving stars and unfinished saves', () => {
  const complete = {version:1, unlocked:7, stars:[3,2,1,1,1,1,1,2]};
  const migrated = game({[key]:JSON.stringify(complete)}).api.progress;
  assert.equal(migrated.unlocked,8); assert.equal(migrated.stars.length,15); assert.equal(migrated.stars[7],2);
  const unfinished = game({[key]:JSON.stringify({...complete, stars:[3,2,1,1,1,1,1,0]})}).api.progress;
  assert.equal(unfinished.unlocked,7);
  assert.equal(game({[key]:'not json'}).api.progress.unlocked,0);
  assert.equal(game({},true).api.progress.unlocked,0);
});

test('all 15 events finish naturally on a clean run and persist sequential progress', () => {
  const {api, storage} = game();
  assert.equal(api.LEVELS.length,15);
  for (let i=0; i<api.LEVELS.length; i++) {
    api.loadLevel(i); api.startLevel(); api.state.spawnT=Infinity; api.state.pickupT=Infinity;
    for (let n=0; n<10000 && api.state.running; n++) api.step(.033);
    assert.equal(api.state.gameOver,false, `event ${i+1} should be achievable without random pickups`);
    assert.equal(api.state.levelClear,true, `event ${i+1} completed`);
    assert.equal(api.progress.unlocked,Math.min(i+1,14));
  }
  const saved=JSON.parse(storage[key]); assert.equal(saved.unlocked,14); assert.equal(saved.stars.length,15);
  const reloaded=game(storage).api.progress; assert.equal(reloaded.unlocked,14); assert.equal(reloaded.stars[14],2);
});

test('rival advances, pauses, wins or loses consistently with the player', () => {
  const {api,elements}=game(); api.loadLevel(9); api.startLevel(); api.state.spawnT=Infinity; api.state.pickupT=Infinity;
  const start=api.state.rivalDistance; api.step(1); assert(api.state.rivalDistance>start); assert.match(api.missionText(),/Rival/);
  api.togglePause(); const paused=api.state.rivalDistance; api.step(2); assert.equal(api.state.rivalDistance,paused); api.togglePause();
  api.state.distance=100; api.state.rivalDistance=api.LEVELS[9].targetDistance-1; api.step(.1);
  assert.equal(api.state.gameOver,true); assert.match(elements.panelText.textContent,/Kai reached the finish first/); assert.equal(api.progress.unlocked,0);
  api.loadLevel(9); api.startLevel(); api.state.spawnT=Infinity; api.state.pickupT=Infinity;
  api.state.distance=api.LEVELS[9].targetDistance-1; api.state.rivalDistance=100; api.step(.1);
  assert.equal(api.state.levelClear,true); assert.equal(api.state.gameOver,false);
  api.loadLevel(9); api.startLevel(); api.state.spawnT=Infinity; api.state.pickupT=Infinity;
  api.state.distance=api.LEVELS[9].targetDistance-5; api.state.rivalDistance=api.LEVELS[9].targetDistance-1; api.step(.1);
  assert.equal(api.state.gameOver,true,'rival crosses first within the same frame');
  api.loadLevel(9); api.startLevel(); api.state.spawnT=Infinity; api.state.pickupT=Infinity;
  api.state.distance=api.LEVELS[9].targetDistance-1; api.state.rivalDistance=api.LEVELS[9].targetDistance-5; api.step(.1);
  assert.equal(api.state.levelClear,true,'player crosses first within the same frame');
});

test('all referenced local assets exist', () => {
  const source=fs.readFileSync(path.join(root,'game.js'),'utf8');
  const assets=[...source.matchAll(/'\.\/(assets\/[^']+)'/g)].map(match=>match[1]);
  assert(assets.length>=3); for(const asset of assets) assert(fs.existsSync(path.join(root,asset)),asset);
});
