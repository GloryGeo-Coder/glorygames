'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../public/games/space-pilot-platformer'),V=require(path.join(root,'verdantis')),P=require(path.join(root,'pilot-progress'));
const snapshot=(w,level=3)=>P.snapshot({world:w,level,score:2450,time:29.5,health:62,shield:13,lives:2,status:'playing'},P.checkpoint(w,0,80));
const memory=()=>{const values=new Map();return {values,getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};};
test('Verdantis adds missions 21–25, five objectives and the Brood Titan with increasing route length/opposition',()=>{
 assert.equal(V.offset,20);assert.equal(V.previousKey,'wga_space_pilot_cryon_v1');assert.equal(V.levels.length,5);assert.equal(new Set(V.levels.map(l=>l.kind)).size,5);
 for(let i=0;i<5;i++){const w=V.createLevel(i),s=w.spec;assert.equal(s,V.levels[i]);assert.ok(s.width>=5600);assert.equal(w.objectives.length,s.count);assert.ok(s.briefing.length===2&&s.report.length>40);assert.equal(w.enemies.filter(e=>e.type==='boss').length,i===4?1:0);if(i){assert.ok(s.width>V.levels[i-1].width);assert.ok(s.enemies>V.levels[i-1].enemies);}}
 assert.equal(V.createLevel(4).enemies.at(-1).name,'Brood Titan');for(const i of [-1,5,NaN])assert.throws(()=>V.createLevel(i),RangeError);
});
test('all required cores and devices sit on reachable stable lower routes and optional bridges never become checkpoints',()=>{
 for(let i=0;i<5;i++){const w=V.createLevel(i),route=w.platforms.filter(p=>p.type==='ground');assert.equal(route[0].x,0);for(let j=1;j<route.length;j++){assert.ok(route[j].x-route[j-1].x-route[j-1].w<=50);assert.ok(Math.abs(route[j].y-route[j-1].y)<65);}for(const n of w.objectives)assert.ok(route.some(p=>n.x>p.x+25&&n.x<p.x+p.w-25&&Math.abs(n.y-(p.y-29))<40));for(const n of w.cores.slice(0,w.spec.cores))assert.ok(route.some(p=>n.x>=p.x&&n.x<=p.x+p.w&&Math.abs(n.y-(p.y-29))<42));assert.ok(route.some(p=>w.portal.x>p.x&&w.portal.x<p.x+p.w));for(const p of w.platforms.filter(p=>['moving','phase'].includes(p.type)))assert.equal(P.checkpoint(w,w.platforms.indexOf(p),80),null);}
});
test('nearby sustained Fire is required, interruption clears partial holds, and completed actions cannot award again',()=>{
 for(let i=0;i<5;i++){const w=V.createLevel(i),n=w.objectives[0];w.enemies=[];V.interact(w,n,true,.3,0);assert.ok(n.charge>0&&!n.done);V.interact(w,n,false,.1,0);assert.equal(n.charge,0);V.interact(w,n,true,.3,0);V.interact(w,{x:n.x+500,y:n.y},true,1,0);assert.equal(n.charge,0);assert.equal(V.interact(w,n,true,.8,0).completed,n);assert.equal(V.interact(w,n,true,1,0).completed,null);}
});
test('spore vents warn harmlessly, activate at four seconds and reset at six, with saved group suppression',()=>{
 for(let i=0;i<5;i++){const w=V.createLevel(i);for(const h of w.hazards){for(const t of [0,3.2,3.99,6])assert.equal(V.hazardActive(h,t-h.phase,w),false);for(const t of [4,5.99])assert.equal(V.hazardActive(h,t-h.phase,w),true);w.objectives[h.control].done=true;assert.equal(V.hazardActive(h,4-h.phase,w),false);w.objectives[h.control].done=false;assert.ok(w.objectives.every(n=>Math.abs(n.x-h.x)>85||Math.abs(n.y-h.y)>85));}}
});
test('resonator listening windows reject interrupted calls and use the objective phase',()=>{
 const w=V.createLevel(1),n=w.objectives[1];assert.match(V.interact(w,n,true,.8,3.2-n.phase).blocked,/blue listening/);assert.equal(n.done,false);V.interact(w,n,true,.4,2.8-n.phase);assert.equal(n.charge,.4);V.interact(w,n,true,.4,3.1-n.phase);assert.equal(n.charge,0);assert.equal(V.interact(w,n,true,.8,.8-n.phase).completed,n);
});
test('pathfinder shelters require nearby sentry clearance and restore exactly one ally per completed shelter',()=>{
 const w=V.createLevel(2),n=w.objectives[0];w.enemies=[{x:n.x+90,alive:true},{x:n.x+500,alive:true}];assert.match(V.interact(w,n,true,.8).blocked,/nearby sentries/);w.enemies[0].alive=false;assert.equal(V.interact(w,n,true,.8).completed,n);V.updateWorld(w);assert.equal(w.allies.length,1);V.updateWorld(w);assert.equal(w.allies.length,1);const next=V.createLevel(2);P.restore(snapshot(w,2),next,2);V.updateWorld(next);assert.equal(next.allies.length,1);
});
test('seed cargo allows one active pair, rejects wrong planters and permanently grows only its own bridge',()=>{
 const w=V.createLevel(3),[source,planter,nextSource,nextPlanter]=w.objectives;V.updateWorld(w);assert.equal(w.carriedSeed,null);assert.match(V.interact(w,planter,true,.8).blocked,/Collect seed 1/);assert.equal(V.interact(w,source,true,.8).completed,source);assert.equal(V.carriedSeed(w),0);assert.match(V.interact(w,nextSource,true,.8).blocked,/Plant seed 1/);assert.match(V.interact(w,nextPlanter,true,.8).blocked,/Collect seed 2/);assert.equal(V.interact(w,planter,true,.8).completed,planter);V.updateWorld(w);assert.equal(w.carriedSeed,null);assert.equal(w.platforms.find(p=>p.control===1).active,true);assert.equal(w.platforms.find(p=>p.control===3).active,false);assert.equal(V.interact(w,nextSource,true,.8).completed,nextSource);assert.equal(V.carriedSeed(w),1);
});
test('refresh preserves carried seed, completed bridges and combat state without duplicating cargo or rewards',()=>{
 const w=V.createLevel(3);w.objectives[0].done=true;w.objectives[1].done=true;w.objectives[2].done=true;w.objectives[3].charge=.7;w.enemies[0].hp=0;w.cores[0].taken=true;const raw=snapshot(w),next=V.createLevel(3),r=P.restore(raw,next,3);V.updateWorld(next);assert.equal(r.score,2450);assert.equal(r.health,62);assert.equal(r.lives,2);assert.equal(next.carriedSeed,1);assert.equal(next.objectives[3].charge,0);assert.equal(next.platforms.find(p=>p.control===1).active,true);assert.equal(next.platforms.find(p=>p.control===3).active,false);assert.equal(next.enemies[0].alive,false);assert.equal(next.cores[0].taken,true);
});
test('the Titan requires every extraction pod and braces during the final half-second before a volley',()=>{
 const w=V.createLevel(4),b=w.enemies.at(-1);b.shoot=1.4;V.updateWorld(w);assert.equal(V.damageMultiplier(b,w),0);w.objectives.forEach(n=>n.done=true);V.updateWorld(w);assert.equal(V.damageMultiplier(b,w),1);b.shoot=.7;V.updateWorld(w);assert.equal(b.heartWarning,true);assert.equal(V.damageMultiplier(b,w),1);b.shoot=.4;V.updateWorld(w);assert.equal(b.heartWarning,false);assert.equal(V.damageMultiplier(b,w),0);assert.equal(V.damageMultiplier(w.enemies[0],w),1);
});
test('portal recovery independently requires all objectives, the core quota and the Titan defeat',()=>{
 const w=V.createLevel(4);w.cores.forEach(c=>c.taken=true);w.enemies.forEach(e=>e.hp=0);let raw=snapshot(w,4),next=V.createLevel(4);P.restore(raw,next,4);assert.equal(next.portal.open,false);w.objectives.forEach(n=>n.done=true);raw=snapshot(w,4);next=V.createLevel(4);P.restore(raw,next,4);assert.equal(next.portal.open,true);raw.enemies[raw.enemies.length-1]=1;P.restore(raw,next,4);assert.equal(next.portal.open,false);
});
test('Verdantis writes only its own save and cannot mutate any earlier chapter data or namespace',()=>{
 const store=memory(),keys=[P.KEY,'wga_space_pilot_asterion_v1','wga_space_pilot_vulcanis_v1','wga_space_pilot_luminara_v1','wga_space_pilot_cryon_v1'];for(const key of keys)store.setItem(key,JSON.stringify({version:1,score:123,completed:[true,true,true,true,true],current:4}));const before=new Map(store.values),scope=P.scope(V.saveKey);scope.save(store,scope.clean(null,5));for(const[key,bytes]of before)assert.equal(store.getItem(key),bytes);for(const name of ['asterion','vulcanis','luminara','cryon']){const api=require(path.join(root,name)),old=JSON.stringify(api.createLevel(4));V.createLevel(4);assert.equal(JSON.stringify(api.createLevel(4)),old);}
});
test('blocked, corrupt and discontinuous saves cannot invent later Verdantis missions',()=>{
 const scope=P.scope(V.saveKey);for(const text of ['{','null','x'.repeat(80001),JSON.stringify({version:99}),JSON.stringify({version:1,current:4,completed:[false,true,true,true,true]})])assert.equal(scope.load({getItem:()=>text},5).unlocked,0);assert.equal(scope.save(null,scope.clean(null,5)),false);
});
test('entry, chapter navigation and manifest describe the five shipped chapters with accessible controls',()=>{
 const html=fs.readFileSync(path.join(root,'verdantis.html'),'utf8');for(const[,ref]of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g))assert.ok(fs.existsSync(path.join(root,ref)),ref);for(const id of ['menuDialog','musicVolume','effectsVolume','buttonScale','storyDialog','missionList','readStoryBtn'])assert.ok(html.includes('id="'+id+'"'));assert.doesNotMatch(html,/user-scalable=no|maximum-scale|demo|prototype|30 playable/i);assert.match(fs.readFileSync(path.join(root,'cryon.html'),'utf8'),/verdantisLink/);const m=JSON.parse(fs.readFileSync(path.join(root,'game.json')));assert.equal(m.version,'1.9.0');assert.equal(m.features.campaignLevels,25);assert.equal(m.features.campaignWorlds,5);assert.equal(m.features.originalLevels,8);
});
test('all native scenes and actors draw finite geometry on portrait/landscape/desktop without inherited particle glow',()=>{
 const sandbox={SpacePilotArt:{draw:()=>false}};vm.runInNewContext(fs.readFileSync(path.join(root,'verdantis-art.js'),'utf8'),sandbox);
 for(let i=0;i<5;i++)for(const [width,height]of [[390,650],[844,290],[1440,700]])for(const reducedMotion of [false,true]){
  let calls=0;const raw={shadowBlur:12,createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},ctx=new Proxy(raw,{get:(o,k)=>k in o?o[k]:(...args)=>{for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg),String(k));calls++;}}),w=V.createLevel(i);V.updateWorld(w);const a={ctx,view:{width,height},state:{world:w,time:4.4,cameraX:100},settings:{reducedMotion},screen:(x,y)=>({x:x-100,y}),player:{x:100,y:400}};
  sandbox.SpacePilotArt.draw('background',a);assert.equal(raw.shadowBlur,0);assert.ok(calls>100);for(const n of w.enemies)sandbox.SpacePilotArt.draw('enemy',{...a,screen:(x,y)=>({x:width/2,y:height/2})},n);sandbox.SpacePilotArt.draw('objectives',a);sandbox.SpacePilotArt.draw('platform',a,w.platforms[0]);sandbox.SpacePilotArt.draw('hazard',a,w.hazards[0]);
 }
});
test('reduced motion preserves live spore danger labels',()=>{
 const box={SpacePilotArt:{draw:()=>false}};vm.runInNewContext(fs.readFileSync(path.join(root,'verdantis-art.js'),'utf8'),box);const labels=[],raw={fillText:s=>labels.push(s)},ctx=new Proxy(raw,{get:(o,k)=>k in o?o[k]:()=>{}}),w=V.createLevel(0),h=w.hazards[0],a={ctx,state:{world:w,time:3.5-h.phase},settings:{reducedMotion:true},view:{width:390,height:650},screen:()=>({x:100,y:200})};box.SpacePilotArt.draw('hazard',a,h);assert.ok(labels.includes('SPORES RISING'));labels.length=0;a.state.time=4.2-h.phase;box.SpacePilotArt.draw('hazard',a,h);assert.ok(labels.includes('SPORES ACTIVE'));
});
