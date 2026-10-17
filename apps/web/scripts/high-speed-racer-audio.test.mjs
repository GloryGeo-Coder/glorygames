import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../public/games/high-spead-racer/racer-audio.js',import.meta.url),'utf8');
class Param {constructor(value=0){this.value=value;}cancelScheduledValues(){}setTargetAtTime(v){this.value=v;}}
class Node {constructor(){this.gain=new Param();this.frequency=new Param();this.playbackRate=new Param(1);this.threshold=new Param();this.knee=new Param();this.ratio=new Param();this.attack=new Param();this.release=new Param();}connect(n){return n;}disconnect(){this.disconnected=true;}start(){this.started=true;}stop(){this.stopped=true;this.onended?.();}}
class Context {constructor(){this.currentTime=0;this.state='suspended';this.destination={};this.sources=[];Context.last=this;}createGain(){return new Node();}createDynamicsCompressor(){return new Node();}createOscillator(){return new Node();}createBufferSource(){const n=new Node();this.sources.push(n);return n;}async decodeAudioData(b){return {key:b.key,duration:31};}async resume(){this.state='running';}async suspend(){this.state='suspended';}async close(){this.state='closed';}}
const flush=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
function harness({fetcher,storage,car='mclaren'}={}){
 const requests=[],state={mode:'menu',roadSpeed:43,nitroHeld:false,nitro:100},route={music:'midnight'},saved=new Map();
 const win={AudioContext:Context};const context={window:win,AbortController,setTimeout,clearTimeout,console};
 vm.runInNewContext(code,context);
 const api=win.RacerAudio.create({window:win,getState:()=>state,getRoute:()=>route,getCar:()=>car,storage:storage||{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},fetcher:fetcher|| (async(url)=>{requests.push(url);return {ok:true,arrayBuffer:async()=>({key:url.split('/').at(-1)})};})});
 return {api,state,route,win,requests,saved};
}
test('audio is silent and makes no downloads until a user gesture unlocks it',async()=>{
 const h=harness();h.api.startMusic();await flush();assert.equal(h.requests.length,0);assert.equal(h.api.state().unlocked,false);h.api.dispose();
});
test('engine layers, gear shifts and route music start after unlock; pause/resume and mute work',async()=>{
 const h=harness();h.state.mode='running';h.api.ensure();h.api.startMusic();h.api.startEngine();await flush();
 assert.equal(h.api.state().loops,4);assert.equal(h.api.state().track,'midnight');
 h.api.updateEngine();const first=Context.last.sources.find(n=>n.buffer?.key==='engine_low.wav');const rate=first.playbackRate.value;
 h.state.roadSpeed=92;h.state.nitroHeld=true;Context.last.currentTime=2;h.api.updateEngine();
 assert.notEqual(first.playbackRate.value,rate);assert.ok(Context.last.sources.some(n=>n.buffer?.key==='gear_shift.wav'));
 h.api.pause();assert.equal(h.api.state().loops,0);assert.equal(Context.last.state,'suspended');
 h.api.resume();await flush();assert.equal(h.api.state().loops,4);assert.equal(Context.last.state,'running');
 h.api.toggleMute();assert.equal(h.api.muted,true);assert.equal(h.api.state().loops,0);
 h.api.toggleMute();await flush();assert.equal(h.api.muted,false);assert.equal(h.api.state().loops,4);h.api.dispose();assert.equal(Context.last.state,'closed');
});
test('music switches families without retaining more than two decoded tracks',async()=>{
 const h=harness();h.state.mode='running';h.api.ensure();h.api.startMusic();await flush();
 for(const music of ['sunset','voltage','skyline']){h.route.music=music;h.api.startMusic();await flush();assert.equal(h.api.state().track,music);assert.ok(h.api.state().musicBuffers<=2);}
 h.api.stopMusic();assert.equal(h.api.state().track,null);h.api.dispose();
});
test('late downloads cannot restart music after pause or disposal',async()=>{
 let finish;const h=harness({fetcher:url=>url.endsWith('.mp3')?new Promise(r=>{finish=()=>r({ok:true,arrayBuffer:async()=>({key:'late'})});}):Promise.resolve({ok:true,arrayBuffer:async()=>({key:'engine'})})});
 h.state.mode='running';h.api.ensure();h.api.startMusic();await flush();h.api.pause();finish();await flush();assert.equal(h.api.state().track,null);
 h.api.dispose();h.api.startEngine();assert.equal(h.api.state().loops,0);assert.equal(h.api.state().disposed,true);
});
test('settings survive storage, volumes clamp safely, and failed audio is nonfatal',async()=>{
 const h=harness();h.api.setVolume('music',2);h.api.setVolume('engine',-.5);h.api.setVolume('effects',NaN);h.api.toggleMute();
 assert.equal(h.api.settings().music,1);assert.equal(h.api.settings().engine,0);assert.equal(h.api.settings().effects,.65);
 assert.equal(JSON.parse(h.saved.get('high-spead-racer-audio-v1')).muted,true);h.api.dispose();
 const broken=harness({fetcher:()=>{throw Error('offline');},storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}}});
 broken.state.mode='running';broken.api.startEngine();broken.api.startMusic();await flush();assert.equal(broken.api.state().pending,0);assert.equal(broken.api.state().loops,0);broken.api.dispose();
});
test('unsupported audio contexts never prevent the game starting',()=>{
 const win={};vm.runInNewContext(code,{window:win,AbortController,setTimeout,clearTimeout});const api=win.RacerAudio.create({window:win});assert.equal(api.ensure(),false);api.startEngine();api.startMusic();api.dispose();
});

test('garage vehicle selection changes the engine character',async()=>{
 const a=harness({car:'mclaren'});a.state.mode='running';a.api.startEngine();await flush();a.api.updateEngine();const bright=Context.last.sources.find(n=>n.buffer?.key==='engine_low.wav').playbackRate.value;a.api.dispose();
 const b=harness({car:'challenger'});b.state.mode='running';b.api.startEngine();await flush();b.api.updateEngine();const muscle=Context.last.sources.find(n=>n.buffer?.key==='engine_low.wav').playbackRate.value;assert.ok(muscle<bright);b.api.dispose();
});
