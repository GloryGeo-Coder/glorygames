import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

/** A minimal DOM and 3D-engine shim checks boot, controls and overlays.
 * This does not validate graphics, real GLB imports or mobile GPU performance.
 */
const listeners = new Map();
const elements = new Map();
class FakeElement {
  constructor(id) {
    this.id=id;this.hidden=false;this.disabled=false;this.textContent='';this.dataset={};this.style={};this.attrs={};this.events={};
    this.classList={ classes:new Set(),toggle:(k,v)=>{if(v)this.classList.classes.add(k);else this.classList.classes.delete(k);},add:(k)=>this.classList.classes.add(k),remove:(k)=>this.classList.classes.delete(k),contains:(k)=>this.classList.classes.has(k)};
  }
  setAttribute(k,v){this.attrs[k]=v;}
  getAttribute(k){return this.attrs[k];}
  addEventListener(k,cb){(this.events[k]??=[]).push(cb);}
  dispatch(k,data={}){for(const cb of this.events[k]||[])cb({ preventDefault(){},pointerId:1,clientX:0,clientY:0,target:this,key:'',...data});}
  focus(){}
  getBoundingClientRect(){return {left:0,top:0,width:120,height:120};}
  setPointerCapture(){}
}
const getEl=id=>{if(!elements.has(id))elements.set(id,new FakeElement(id));return elements.get(id)};
getEl("overlaySubtitle").textContent="Relic Awakening"; // HTML initial text before JS runs
globalThis.window=globalThis;
globalThis.document={getElementById:getEl,addEventListener:(key,handler)=>(listeners.get(key)||listeners.set(key,[]).get(key)).push(handler),hidden:false};
globalThis.addEventListener=(key,handler)=>(listeners.get(key)||listeners.set(key,[]).get(key)).push(handler);
globalThis.matchMedia=()=>({matches:false});
globalThis.location={search:'',origin:'https://webgamearena.com'};
globalThis.parent={postMessage(){}};
globalThis.devicePixelRatio=1;
globalThis.innerHeight=720;globalThis.innerWidth=1280;
globalThis.localStorage={getItem(){return null},setItem(){}};
const bab=fs.readFileSync(new URL('./babylon-test-shim.js',import.meta.url),'utf8');
vm.runInThisContext(bab);
await import('../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/game.js');

await test('the entire game runtime boots and exposes the start menu',async()=>{
  await new Promise(resolve=>setTimeout(resolve,50));
  assert.equal(getEl('primaryBtn').disabled,false);
  assert.equal(getEl('overlaySubtitle').textContent,'Relic Awakening');
  assert.equal(getEl('relicCount').textContent,'0 / 5');
});
await test('start/pause/resume/restart controls do not throw',async()=>{
  getEl('primaryBtn').dispatch('click');
  assert.equal(getEl('overlay').attrs['aria-hidden'],'true');
  await new Promise(resolve=>setTimeout(resolve,120));
  getEl('jumpBtn').dispatch('pointerdown');
  getEl('blastBtn').dispatch('pointerdown');
  await new Promise(resolve=>setTimeout(resolve,150));
  getEl('pauseBtn').dispatch('click');
  assert.equal(getEl('overlaySubtitle').textContent,'Adventure paused');
  getEl('primaryBtn').dispatch('click');
  assert.equal(getEl('overlay').attrs['aria-hidden'],'true');
});
await test('touch actions still work after rig and combat foundation',async()=>{
  getEl('controlsBtn').dispatch('click');
  assert.equal(getEl('controlsBtn').attrs['aria-label'],'Hide touch controls');
  getEl('blastBtn').dispatch('pointerdown');
  await new Promise(resolve=>setTimeout(resolve,80));
  assert.equal(getEl('relicCount').textContent,'0 / 5');
  assert.notEqual(getEl('primaryBtn').disabled,true);
});
await test('skinned hero is loaded and idle/run/attack clips are triggered',async()=>{
  assert.ok(globalThis.__skyAnimationTest.files.some(file => file === 'RelicHero_Rigged_Refined_Mobile.glb' || file === 'RelicHero_Rigged_Mobile.glb'));
  assert.ok(globalThis.__skyAnimationTest.starts.includes('Idle'));
  assert.ok(globalThis.__skyAnimationTest.starts.includes('Blast'));
});
// Shut down the test renderer to keep Node's test process finite.
for(const listener of listeners.get('pagehide')||[])listener();
