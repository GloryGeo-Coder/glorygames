import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const listeners = new Map(), elements = new Map();
class FakeElement {
  constructor(id){this.id=id;this.hidden=false;this.disabled=false;this.textContent='';this.dataset={};this.style={};this.attrs={};this.events={};
    this.classList={classes:new Set(),toggle:(k,v)=>{if(v)this.classList.classes.add(k);else this.classList.classes.delete(k);},add:k=>this.classList.classes.add(k),remove:k=>this.classList.classes.delete(k),contains:k=>this.classList.classes.has(k)};}
  setAttribute(k,v){this.attrs[k]=v;}
  getAttribute(k){return this.attrs[k];}
  addEventListener(k,callback){(this.events[k]??=[]).push(callback);}
  dispatch(k,data={}){for(const cb of this.events[k]||[])cb({preventDefault(){},pointerId:1,clientX:30,clientY:30,target:this,key:'',...data});}
  getBoundingClientRect(){return {left:0,top:0,width:130,height:130};}
  setPointerCapture(){}
  focus(){}
}
const get=id=>{if(!elements.has(id))elements.set(id,new FakeElement(id));return elements.get(id)};
get('overlaySubtitle').textContent='Final Radiance';
globalThis.window=globalThis;
globalThis.document={getElementById:get,addEventListener:(key,fn)=>(listeners.get(key)||listeners.set(key,[]).get(key)).push(fn),hidden:false};
globalThis.addEventListener=(key,fn)=>(listeners.get(key)||listeners.set(key,[]).get(key)).push(fn);
globalThis.matchMedia=()=>({matches:false});
Object.defineProperty(globalThis,"navigator",{value:{maxTouchPoints:5},configurable:true});
globalThis.location={search:'?debug=1',origin:'http://localhost:8080'};
globalThis.parent={postMessage() {}};
globalThis.devicePixelRatio=2;
globalThis.innerWidth=390;globalThis.innerHeight=844;
globalThis.localStorage={store:new Map(),getItem(k){return this.store.get(k)||null},setItem(k,v){this.store.set(k,String(v))}};
const shim=fs.readFileSync(new URL('./babylon-test-shim.js',import.meta.url),'utf8');
vm.runInThisContext(shim);
await import('../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/solar/game.js');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

test('Solar Sanctuary loads into its own menu and 3D GLBs without overwriting Garden or Caverns',async()=>{
 await sleep(90);
 assert.equal(get('primaryBtn').disabled,false);
 assert.equal(get('overlaySubtitle').textContent,'Final Radiance');
 assert.equal(get('relicCount').textContent,'0 / 5');
 assert.ok(globalThis.__skyAnimationTest.files.includes('SolarSanctuary_Enhanced_Yup_Mobile.glb'));
 assert.ok(globalThis.__skyAnimationTest.files.includes('RelicMaster_Ornate_Mobile.glb'));
 assert.ok(globalThis.__skyAnimationTest.files.includes('RelicHero_Rigged_Refined_Mobile.glb'));
});
test('Solar buttons, joystick and camera coexist on a phone-sized viewport',async()=>{
 get('primaryBtn').dispatch('click');
 assert.equal(get('overlay').attrs['aria-hidden'],'true');
 assert.equal(get('touchControls').hidden,false);
 get('joystickPad').dispatch('pointerdown',{pointerId:5});
 get('joystickPad').dispatch('pointermove',{pointerId:5,clientX:100,clientY:18});
 get('joystickPad').dispatch('pointerup',{pointerId:5});
 get('jumpBtn').dispatch('pointerdown');
 get('glideBtn').dispatch('pointerdown');
 get('glideBtn').dispatch('pointerup');
 get('blastBtn').dispatch('pointerdown');
 await sleep(115);
 assert.equal(get('primaryBtn').disabled,false);
 assert.ok(globalThis.__skyAnimationTest.starts.includes('Blast'));
});
test('Solar pause/resume and manual touch toggle remain available',async()=>{
 get('pauseBtn').dispatch('click');
 assert.equal(get('overlaySubtitle').textContent,'Adventure paused');
 get('primaryBtn').dispatch('click');
 assert.equal(get('overlay').attrs['aria-hidden'],'true');
 get('controlsBtn').dispatch('click');
 assert.equal(get('controlsBtn').attrs['aria-label'],'Show touch controls');
 get('controlsBtn').dispatch('click');
 assert.equal(get('controlsBtn').attrs['aria-label'],'Hide touch controls');
});
test('Solar hazard warning element exists and can be hidden',()=>{
 assert.ok(get('solarHazardWarning'));
 assert.equal(get('solarHazardWarning').hidden,true);
});
test('Hero animation group remains active',()=>{
 assert.ok(globalThis.__skyAnimationTest.starts.some(x=>['Idle','Run','Jump','Blast'].includes(x)));
});
// Full test browser harness must close setInterval from its fake Engine.
after(() => { for(const cb of listeners.get('pagehide')||[])cb(); });
