import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';

const [world = 'garden', scenario = 'restore'] = process.argv.slice(2);
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d');
const folder=world==='garden'?root:resolve(root,world);
const storeMod=await import(pathToFileURL(resolve(root,'campaign-save.mjs')));
const { relics, checkpoints }=await import(pathToFileURL(resolve(folder,'world-logic.mjs')));
const { GUARDIAN_MAX_HP }=await import(pathToFileURL(resolve(folder,'guardian-logic.mjs')));
const { CAMPAIGN_DEPTH }=await import(pathToFileURL(resolve(root,'campaign-depth.mjs')));
const source=fs.readFileSync(resolve(folder,'game.js'),'utf8');
const enemyNames=[...source.matchAll(/makeDrone\("([^\"]+)"/g)].map(m=>m[1]).slice(0,2);
const enemyIds=[...enemyNames,...CAMPAIGN_DEPTH[world].enemies.map(x=>x.name)];
assert.equal(relics.length,5);assert.equal(enemyIds.length,5);
const data=new Map();
const storage={getItem:key=>data.get(key)||null,setItem:(key,val)=>data.set(key,String(val)),removeItem:key=>data.delete(key)};
globalThis.localStorage=storage;
const cfg={world, relicIds:relics.map(x=>x.id),checkpointIds:checkpoints.map(x=>x.id),enemyIds,guardianMaxHp:GUARDIAN_MAX_HP,storage};
const save=storeMod.createCampaignSave(cfg);
const baseSnapshot={checkpointId:checkpoints[1].id,relicIds:relics.slice(0,2).map(r=>r.id),
  defeatedEnemyIds:[enemyIds[0]],guardianHp:GUARDIAN_MAX_HP,guardianDefeated:false,health:2,score:540};
if(scenario==='restore'||scenario==='newrun') save.write(baseSnapshot);
if(scenario==='boss'||scenario==='defeated')save.write({...baseSnapshot,
  relicIds:relics.map(x=>x.id),guardianHp:scenario==='defeated'?0:Math.max(1,Math.floor(GUARDIAN_MAX_HP/2)),
  guardianDefeated:scenario==='defeated'});
if(scenario==='campaign')storeMod.createCampaignSave({...cfg,world:'storm'}).write({...baseSnapshot,checkpointId:checkpoints[0].id});

const listeners = new Map(), elements = new Map();
class FakeElement {
  constructor(id) {
    this.id=id;this.hidden=false;this.disabled=false;this.textContent='';this.dataset={};this.style={};this.attrs={};this.events={};
    this.classList={classes:new Set(),toggle:(k,v)=>{if(v)this.classList.classes.add(k);else this.classList.classes.delete(k);},add:(k)=>this.classList.classes.add(k),remove:(k)=>this.classList.classes.delete(k),contains:(k)=>this.classList.classes.has(k)};
  }
  setAttribute(k,v){this.attrs[k]=v;}
  getAttribute(k){return this.attrs[k];}
  addEventListener(k,cb){(this.events[k]??=[]).push(cb);}
  dispatch(k,data={}){for(const cb of this.events[k]||[])cb({preventDefault(){},pointerId:1,clientX:0,clientY:0,target:this,key:'',...data});}
  focus(){}
  getBoundingClientRect(){return {left:0,top:0,width:120,height:120};}
  setPointerCapture(){}
}
const getEl=id=>{if(!elements.has(id))elements.set(id,new FakeElement(id));return elements.get(id)};
const initialTitles={garden:'Relic Awakening',crystal:'Resonance Trial',storm:'Tempest Trial',solar:'Final Radiance'};
getEl('overlaySubtitle').textContent=initialTitles[world];
globalThis.window=globalThis;
globalThis.document={getElementById:getEl,addEventListener:(key,fn)=>(listeners.get(key)||listeners.set(key,[]).get(key)).push(fn),hidden:false};
globalThis.addEventListener=(key,fn)=>(listeners.get(key)||listeners.set(key,[]).get(key)).push(fn);
globalThis.matchMedia=()=>({matches:false});
globalThis.location={search:'',origin:'https://webgamearena.com',href:'https://webgamearena.com/preview3d/'};
globalThis.parent={postMessage(){}};
globalThis.devicePixelRatio=1;
globalThis.innerHeight=720;globalThis.innerWidth=1280;
let confirmResult=false;
globalThis.confirm=()=>confirmResult;
vm.runInThisContext(fs.readFileSync(resolve(dirname(fileURLToPath(import.meta.url)),'../babylon-test-shim.js'),'utf8'));
await import(pathToFileURL(resolve(folder,'game.js')));
await new Promise(resolve=>setTimeout(resolve,90));
assert.equal(getEl('primaryBtn').disabled,false);

switch(scenario){
  case 'restore': {
    assert.equal(getEl('primaryBtn').textContent,'Resume Adventure');
    assert.equal(getEl('newRunBtn').hidden,false);
    getEl('primaryBtn').dispatch('click');
    assert.equal(getEl('relicCount').textContent,'2 / 5');
    assert.equal(getEl('healthCount').textContent,'♥ ♥');
    assert.equal(getEl('scoreCount').textContent,'540');
    assert.equal(getEl('overlay').attrs['aria-hidden'],'true');
    getEl('pauseBtn').dispatch('click');
    const restored=save.load();
    assert.deepEqual(restored.relicIds,baseSnapshot.relicIds);
    assert.deepEqual(restored.defeatedEnemyIds,baseSnapshot.defeatedEnemyIds);
    assert.equal(restored.checkpointId,checkpoints[1].id);
    assert.equal(restored.score,540);
    break;
  }
  case 'boss': case 'defeated': {
    getEl('primaryBtn').dispatch('click');
    assert.equal(getEl('relicCount').textContent,'5 / 5');
    getEl('pauseBtn').dispatch('click');
    const restored=save.load();
    assert.equal(restored.guardianDefeated,scenario==='defeated');
    assert.equal(restored.guardianHp,scenario==='defeated'?0:Math.max(1,Math.floor(GUARDIAN_MAX_HP/2)));
    break;
  }
  case 'newrun': {
    assert.equal(getEl('newRunBtn').hidden,false);
    getEl('newRunBtn').dispatch('click'); // reject the confirmation first
    assert.equal(save.load().score,540);
    confirmResult=true;
    getEl('newRunBtn').dispatch('click');
    assert.equal(getEl('relicCount').textContent,'0 / 5');
    assert.equal(save.load().score,0);
    assert.deepEqual(save.load().relicIds,[]);
    break;
  }
  case 'fresh': {
    assert.equal(getEl('primaryBtn').textContent!=='Resume Adventure',true);
    assert.equal(getEl('newRunBtn').hidden,true);
    getEl('primaryBtn').dispatch('click');
    assert.equal(getEl('relicCount').textContent,'0 / 5');
    assert.ok(save.load());
    break;
  }
  case 'campaign': {
    assert.equal(world,'garden');
    assert.equal(getEl('continueCampaignBtn').hidden,false);
    assert.match(getEl('continueCampaignBtn').textContent,/Storm Citadel/);
    getEl('continueCampaignBtn').dispatch('click');
    assert.equal(location.href,'./storm/');
    break;
  }
  default: throw Error('Unexpected scenario: '+scenario);
}
// Existing scene disposal signal stops the synthetic render loop.
for(const listener of listeners.get('pagehide')||[])listener();
console.log(`PASS runtime ${world} ${scenario}`);
