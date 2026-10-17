const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../public/games/space-dodger');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/models/starfall/assets.json')));
for(const entry of manifest.assets)test(entry.file+': original compact self-contained GLB with finite geometry',()=>{
 const b=fs.readFileSync(path.join(root,'assets/models/starfall',entry.file));assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);const n=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+n));
 assert.equal(j.extras.forward,'+Z');assert.ok(entry.triangles<3500);assert.ok(entry.draw_primitives<=7);assert.ok(b.length<200000);assert.equal(j.buffers[0].uri,undefined);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),entry.sha256);
 for(const a of j.accessors){const v=j.bufferViews[a.bufferView];assert.ok(v.byteOffset+v.byteLength<=j.buffers[0].byteLength);for(let i=0;i<v.byteLength;i+=4)assert.ok(Number.isFinite(b.readFloatLE(28+n+v.byteOffset+i)));}
});
test('pinned engine files match their license manifest and all local HTML references resolve',()=>{
 const engine=JSON.parse(fs.readFileSync(path.join(root,'vendor/engine-manifest.json')));for(const f of engine.files){const b=fs.readFileSync(path.join(root,'vendor',f.file));assert.equal(b.length,f.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),f.sha256);}
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const url=m[1].split('?')[0];assert.ok(!url.startsWith('https://'));assert.ok(fs.existsSync(url.startsWith('/')?path.join(root,'../../',url):path.join(root,url)),url);}
 assert.ok(html.includes('/games/_shared/game-tab.mjs?v=1'));assert.ok(html.includes('viewport-fit=cover'));assert.equal(JSON.parse(fs.readFileSync(path.join(root,'game.json'))).version,'4.0.0');
});
test('campaign records reject corrupt saves and preserve progress and checkpoints',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'starfall-systems.js'),'utf8'),context);const S=context.window.StarfallSystems;const map=new Map();const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 map.set(S.KEY,'bad json');const c=S.createCampaign(storage,18);assert.equal(c.data.unlocked,1);c.complete(0,{score:1000,hull:90,elapsed:60});c.enter(1,{score:1000,hull:95,shield:30,lives:3});const restored=S.createCampaign(storage,18);assert.equal(restored.data.unlocked,2);assert.equal(restored.data.checkpoint.score,1000);assert.equal(restored.data.best[0].medal,3);
 const bad=S.createCampaign({getItem:()=>JSON.stringify({unlocked:999,last:999,checkpoint:{level:999},best:{0:{score:'bad'}}})},18);assert.equal(bad.data.unlocked,18);assert.equal(bad.data.checkpoint,null);assert.equal(bad.data.best[0],undefined);
 for(const job of S.levels){const run={cores:job.cores,kills:job.kills,elapsed:job.duration,rescues:job.rescues||0,relays:job.relays||0,gates:job.gates||0,escortHull:100};assert.ok(S.complete(job,run,true));for(const key of ['rescues','relays','gates'])if(job[key])assert.equal(S.complete(job,{...run,[key]:job[key]-1},true),false);if(job.escort)assert.equal(S.complete(job,{...run,escortHull:19},true),false);}
});
