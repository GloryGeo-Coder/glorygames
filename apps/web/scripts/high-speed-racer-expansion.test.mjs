import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=new URL('../public/games/high-spead-racer/',import.meta.url);
const context={window:{}};vm.runInNewContext(readFileSync(new URL('racer-routes.js',root),'utf8'),context);
const routes=context.window.RacerRoutes;
test('twelve streets retain the original six routes and add six distinct landmark environments',()=>{
 assert.equal(routes.length,12);assert.equal(new Set(routes.map(r=>r.title)).size,12);
 assert.deepEqual(Array.from(routes.slice(0,6),r=>r.title),['Coastal Sprint','Desert Boostway','Metro Night Run','Alpine Hyperpass','Jungle Storm Route','Final Velocity']);
 assert.deepEqual(Array.from(routes.slice(0,6),r=>r.targetDistance),[1200,1500,1800,2100,2400,2800]);
 for(const route of routes){assert.ok(route.baseSpeed<route.maxSpeed);assert.ok(route.spawnBase>=.6);assert.ok(route.targetDistance>=1200);assert.ok(route.music);}
 assert.equal(new Set(routes.slice(6).map(r=>r.env)).size,6);
});
const landmarks=JSON.parse(readFileSync(new URL('assets/models/streets/assets.json',root))).assets;
for(const entry of landmarks)test(`${entry.file}: landmark is a compact self-contained GLB`,()=>{
 const b=readFileSync(new URL('assets/models/streets/'+entry.file,root));assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);
 const d=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));assert.ok(!d.buffers[0].uri);assert.ok(!d.images?.length);assert.ok(entry.draw_primitives<=5);assert.ok(entry.triangles<800);assert.ok(b.length<60000);
 assert.ok(routes.some(r=>r.env+'.glb'===entry.file));
 const positions=d.meshes.flatMap(m=>m.primitives.map(p=>d.accessors[p.attributes.POSITION]));
 if(entry.file==='tunnel.glb'){
   // A clear 16 m central corridor and a roof above the chase camera.
   assert.ok(positions.every(a=>a.min[1]>=0));
   assert.ok(Math.max(...positions.map(a=>a.max[1]))>7);
 }
});
const audio=JSON.parse(readFileSync(new URL('assets/audio/racing/audio.json',root)));
for(const entry of audio.tracks)test(`${entry.file}: original audio bytes, duration and mix headroom are valid`,()=>{
 const b=readFileSync(new URL('assets/audio/racing/'+entry.file,root));assert.equal(createHash('sha256').update(b).digest('hex'),entry.sha256);
 assert.ok(entry.peak<.9);assert.ok(entry.rms>.03);assert.ok(entry.seconds>0);assert.ok(b.length<600000);
 if(entry.file.endsWith('.wav')){
  assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt16LE(22),2);assert.equal(b.readUInt32LE(24),44100);
  if(['engine_low.wav','engine_high.wav','road_air.wav','nitro_air.wav'].includes(entry.file)){
    const first=b.readInt16LE(44),last=b.readInt16LE(b.length-4);assert.ok(Math.abs(first-last)/32768<.25,'loop seam is bounded');
  }
 }else assert.ok(entry.seconds>28&&entry.seconds<34);
});
test('every route resolves to a bundled soundtrack and menu retains accessible controls',()=>{
 const files=new Set(audio.tracks.map(t=>t.file));vm.runInNewContext(readFileSync(new URL('racer-audio.js',root),'utf8'),context);
 for(const route of routes){assert.ok(files.has(context.window.RacerAudio.FILES[route.music]));assert.ok(existsSync(new URL('assets/audio/racing/'+context.window.RacerAudio.FILES[route.music],root)));}
 const html=readFileSync(new URL('index.html',root),'utf8');for(const id of ['routeSelect','musicVolume','engineVolume','effectsVolume','changeStreetBtn'])assert.ok(html.includes(`id="${id}"`));
 assert.equal((html.match(/class="map-dot(?: active)?"/g)||[]).length,12);
});
