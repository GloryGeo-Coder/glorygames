'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../public/games/space-pilot-platformer'),N=require(path.join(root,'novax')),P=require(path.join(root,'pilot-progress'));
const snapshot=(w,level=4)=>P.snapshot({world:w,level,score:6400,time:29.5,health:62,shield:13,lives:2,status:'playing'},P.checkpoint(w,0,80));
const memory=()=>{const values=new Map();return {values,getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};};
test('NOVA-X adds ordered missions 26–30 and the Commander, ending with the expedition aboard the Wayfarer home',()=>{
 assert.equal(N.offset,25);assert.equal(N.previousKey,'wga_space_pilot_verdantis_v1');assert.equal(N.saveKey,'wga_space_pilot_novax_v1');assert.equal(N.levels.length,5);assert.equal(new Set(N.levels.map(s=>s.kind)).size,5);
 for(let i=0;i<5;i++){const w=N.createLevel(i),s=w.spec;assert.equal(s,N.levels[i]);assert.ok(s.width>=5800);assert.ok(s.briefing.length===2&&s.report.length>40);assert.equal(w.objectives.length,s.count);assert.equal(w.enemies.filter(e=>e.type==='boss').length,i===4?1:0);if(i){assert.ok(s.width>N.levels[i-1].width);assert.ok(s.enemies>N.levels[i-1].enemies);}}
 assert.match(N.levels[4].report,/rescued expedition/);assert.match(N.levels[4].report,/home/);assert.equal(N.createLevel(4).enemies.at(-1).name,'NOVA-X Commander');for(const i of [-1,5,NaN])assert.throws(()=>N.createLevel(i),RangeError);
});
test('all mission objectives, required cores and the home portal have stable reachable lower floors',()=>{
 for(let i=0;i<5;i++){const w=N.createLevel(i),route=w.platforms.filter(p=>p.type==='ground');assert.equal(route[0].x,0);for(let j=1;j<route.length;j++){assert.ok(route[j].x-route[j-1].x-route[j-1].w<=50);assert.ok(Math.abs(route[j].y-route[j-1].y)<65);}for(const n of w.objectives)assert.ok(route.some(p=>n.x>p.x+25&&n.x<p.x+p.w-25&&Math.abs(n.y-(p.y-29))<40),n.label);for(const n of w.cores.slice(0,w.spec.cores))assert.ok(route.some(p=>n.x>=p.x&&n.x<=p.x+p.w&&Math.abs(n.y-(p.y-29))<42));assert.ok(route.some(p=>w.portal.x>p.x&&w.portal.x<p.x+p.w));for(const p of w.platforms.filter(p=>['moving','phase'].includes(p.type)))assert.equal(P.checkpoint(w,w.platforms.indexOf(p),80),null);}
});
test('all first interactions require a sustained nearby hold, reset on interruption and cannot award twice',()=>{
 for(let i=0;i<5;i++){const w=N.createLevel(i),n=w.objectives[0];w.enemies=[];N.interact(w,n,true,.3,0);assert.ok(n.charge>0&&!n.done);N.interact(w,n,false,.1,0);assert.equal(n.charge,0);N.interact(w,n,true,.3,0);N.interact(w,{x:n.x+500,y:n.y},true,1,0);assert.equal(n.charge,0);assert.equal(N.interact(w,n,true,.8,0).completed,n);assert.equal(N.interact(w,n,true,1,0).completed,null);}
});
test('access locks require west-to-east order; completed locks stabilise only their own phase ledges',()=>{
 const w=N.createLevel(0),n=w.objectives[1];assert.match(N.interact(w,n,true,.8).blocked,/earlier access/);N.updateWorld(w,4.8);const p=w.platforms.find(p=>p.type==='phase'&&p.control===0);assert.equal(p.active,false);w.objectives[0].done=true;N.updateWorld(w,4.8);assert.equal(p.active,true);assert.equal(w.platforms.find(p=>p.type==='phase'&&p.control===1).active,false);assert.equal(N.interact(w,n,true,.8).completed,n);
});
test('phase ledges warn before disappearing and preserve a stable lower route',()=>{
 const w=N.createLevel(0),p=w.platforms.find(p=>p.type==='phase');N.updateWorld(w,4-p.phase);assert.equal(p.active,true);assert.equal(p.warning,true);N.updateWorld(w,4.6-p.phase);assert.equal(p.active,false);N.updateWorld(w,6-p.phase);assert.equal(p.active,true);assert.ok(w.platforms.filter(p=>p.type==='ground').every(p=>p.active!==false));
});
test('evacuation waits for nearby sentries and reconstructs its boarding count once per shuttle',()=>{
 const w=N.createLevel(1),n=w.objectives[0];w.enemies=[{x:n.x+80,alive:true},{x:n.x+500,alive:true}];assert.match(N.interact(w,n,true,.8).blocked,/nearby sentries/);w.enemies[0].alive=false;assert.equal(N.interact(w,n,true,.8).completed,n);N.updateWorld(w,0);assert.equal(w.evacuated,1);N.updateWorld(w,1);assert.equal(w.evacuated,1);const next=N.createLevel(1);P.restore(snapshot(w,1),next,1);N.updateWorld(next,0);assert.equal(next.evacuated,1);
});
test('relay cargo permits one fuse and its matching socket, with a sustained blue cooling window',()=>{
 const w=N.createLevel(2),[source,socket,source2,socket2]=w.objectives;assert.match(N.interact(w,socket,true,.8).blocked,/Collect relay fuse 1/);assert.equal(N.interact(w,source,true,.8).completed,source);assert.equal(N.carriedFuse(w),0);assert.match(N.interact(w,source2,true,.8).blocked,/Install fuse 1/);assert.match(N.interact(w,socket2,true,.8).blocked,/Collect relay fuse 2/);assert.match(N.interact(w,socket,true,.8,3.2-socket.phase).blocked,/blue cooling/);assert.equal(N.interact(w,socket,true,.8,.5-socket.phase).completed,socket);assert.equal(N.carriedFuse(w),null);assert.equal(N.interact(w,source2,true,.8).completed,source2);assert.equal(N.carriedFuse(w),1);
});
test('relay cargo survives checkpoint reload without duplicating a source or an installation',()=>{
 const w=N.createLevel(2);w.objectives[0].done=true;w.objectives[1].done=true;w.objectives[2].done=true;w.objectives[3].charge=.7;w.enemies[0].hp=0;w.cores[0].taken=true;const next=N.createLevel(2),r=P.restore(snapshot(w,2),next,2);N.updateWorld(next,0);assert.equal(next.carriedFuse,1);assert.equal(next.objectives[3].charge,0);assert.equal(r.score,6400);assert.equal(next.enemies[0].alive,false);assert.equal(next.cores[0].taken,true);
});
test('world tethers require the five named worlds in order and safe signal timing',()=>{
 const w=N.createLevel(3),later=w.objectives[1],first=w.objectives[0];assert.equal(first.label,'Asterion tether');assert.match(N.interact(w,later,true,.8).blocked,/Asterion tether/);assert.match(N.interact(w,first,true,.8,3.2).blocked,/blue tether/);assert.equal(N.interact(w,first,true,.8,.5).completed,first);assert.equal(N.interact(w,later,true,.8,.5-later.phase).completed,later);
});
test('rift emitters have harmless warnings, harmful active windows and permanent objective suppression',()=>{
 for(let i=0;i<5;i++){const w=N.createLevel(i);for(const h of w.hazards){for(const t of [0,3,3.79,6])assert.equal(N.hazardActive(h,t-h.phase,w),false);for(const t of [3.8,5.99])assert.equal(N.hazardActive(h,t-h.phase,w),true);w.objectives[h.control].done=true;assert.equal(N.hazardActive(h,4-h.phase,w),false);w.objectives[h.control].done=false;}}
});
test('only the three Aegis feeds control boss protection; later escape seals cannot deadlock the fight',()=>{
 const w=N.createLevel(4),boss=w.enemies.at(-1);N.updateWorld(w,0);assert.equal(N.damageMultiplier(boss,w),0);w.objectives.slice(0,3).forEach(n=>n.done=true);N.updateWorld(w,0);assert.equal(N.ready(w),false);assert.equal(N.aegisDown(w),true);assert.equal(N.damageMultiplier(boss,w),1);assert.equal(N.damageMultiplier(w.enemies[0],w),1);
});
test('Commander core warning/window timing remains readable and accelerates below half health',()=>{
 const w=N.createLevel(4),b=w.enemies.at(-1);w.objectives.slice(0,3).forEach(n=>n.done=true);N.updateWorld(w,2.9);assert.equal(b.coreWarning,true);assert.equal(b.shielded,false);N.updateWorld(w,3.5);assert.equal(b.shielded,true);b.hp=38;N.updateWorld(w,2);assert.equal(b.coreWarning,true);N.updateWorld(w,2.6);assert.equal(b.shielded,true);N.updateWorld(w,5.6);assert.equal(b.shielded,false);
});
test('gate seals wait for Commander defeat, the beacon waits for all seals, and the portal waits for the entire sequence',()=>{
 const w=N.createLevel(4),b=w.enemies.at(-1),seal=w.objectives[3],launch=w.objectives[6];w.objectives.slice(0,3).forEach(n=>n.done=true);assert.match(N.interact(w,seal,true,.8).blocked,/Defeat the Commander/);b.hp=0;b.alive=false;assert.match(N.interact(w,launch,true,.8).blocked,/Seal all three/);for(const n of w.objectives.slice(3,6))assert.equal(N.interact(w,n,true,.8).completed,n);assert.equal(N.ready(w),false);assert.equal(N.interact(w,launch,true,.8).completed,launch);assert.equal(N.ready(w),true);w.cores.forEach(c=>c.taken=true);const next=N.createLevel(4);P.restore(snapshot(w),next,4);assert.equal(next.portal.open,true);
});
test('post-boss reload retains defeat and seal progress, and emitters stay safely isolated during escape',()=>{
 const w=N.createLevel(4),b=w.enemies.at(-1);w.objectives.slice(0,4).forEach(n=>n.done=true);b.hp=0;b.alive=false;const next=N.createLevel(4),r=P.restore(snapshot(w),next,4);N.updateWorld(next,4);assert.equal(r.score,6400);assert.equal(next.enemies.at(-1).alive,false);assert.equal(next.objectives[3].done,true);assert.equal(next.objectives[4].done,false);assert.equal(next.portal.open,false);for(const h of next.hazards)assert.equal(N.hazardActive(h,4-h.phase,next),false);assert.equal(N.interact(next,next.objectives[4],true,.8).completed,next.objectives[4]);
});
test('portal recovery independently retains objective, core and boss gates',()=>{
 const w=N.createLevel(4);w.objectives.forEach(n=>n.done=true);w.enemies.at(-1).hp=0;let raw=snapshot(w),next=N.createLevel(4);P.restore(raw,next,4);assert.equal(next.portal.open,false);w.cores.forEach(c=>c.taken=true);raw=snapshot(w);P.restore(raw,next,4);assert.equal(next.portal.open,true);raw.enemies[raw.enemies.length-1]=1;P.restore(raw,next,4);assert.equal(next.portal.open,false);
});
test('NOVA-X cannot mutate any earlier save namespace or chapter definition',()=>{
 const store=memory(),keys=[P.KEY,...['asterion','vulcanis','luminara','cryon','verdantis'].map(n=>'wga_space_pilot_'+n+'_v1')];for(const key of keys)store.setItem(key,JSON.stringify({version:1,score:123,completed:[true,true,true,true,true],current:4}));const before=new Map(store.values),scope=P.scope(N.saveKey);scope.save(store,scope.clean(null,5));for(const[key,value]of before)assert.equal(store.getItem(key),value);for(const name of ['asterion','vulcanis','luminara','cryon','verdantis']){const api=require(path.join(root,name)),before=JSON.stringify(api.createLevel(4));N.createLevel(4);assert.equal(JSON.stringify(api.createLevel(4)),before);}
});
test('blocked, malformed and discontinuous progress cannot invent later NOVA-X missions',()=>{
 const scope=P.scope(N.saveKey);for(const text of ['{','null','x'.repeat(80001),JSON.stringify({version:99}),JSON.stringify({version:1,current:4,completed:[false,true,true,true,true]})])assert.equal(scope.load({getItem:()=>text},5).unlocked,0);assert.equal(scope.save(null,scope.clean(null,5)),false);
});
test('entry, navigation and manifest include all six chapters while retaining original routes and accessible controls',()=>{
 const html=fs.readFileSync(path.join(root,'novax.html'),'utf8');for(const[,ref]of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g))assert.ok(fs.existsSync(path.join(root,ref)),ref);for(const id of ['menuDialog','musicVolume','effectsVolume','buttonScale','storyDialog','missionList','readStoryBtn'])assert.ok(html.includes('id="'+id+'"'));assert.match(fs.readFileSync(path.join(root,'verdantis.html'),'utf8'),/novaxLink/);assert.doesNotMatch(html,/user-scalable=no|maximum-scale|demo|prototype|coming soon/i);const m=JSON.parse(fs.readFileSync(path.join(root,'game.json')));assert.equal(m.version,'1.12.0');assert.equal(m.features.campaignLevels,30);assert.equal(m.features.campaignWorlds,6);assert.equal(m.features.novaxLevels,5);assert.equal(m.features.originalLevels,8);
});
test('all native scenes/actors render finite geometry on phone and desktop with decorative motion reduced',()=>{
 const box={SpacePilotArt:{draw:()=>false}};vm.runInNewContext(fs.readFileSync(path.join(root,'novax-art.js'),'utf8'),box);
 for(let i=0;i<5;i++)for(const[width,height]of [[390,650],[844,290],[1440,700]])for(const reducedMotion of [false,true]){let calls=0;const raw={shadowBlur:12,createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},ctx=new Proxy(raw,{get:(o,k)=>k in o?o[k]:(...args)=>{for(const n of args)if(typeof n==='number')assert.ok(Number.isFinite(n),String(k));calls++;}}),w=N.createLevel(i);N.updateWorld(w,4);const a={ctx,view:{width,height},state:{world:w,time:4,cameraX:100},settings:{reducedMotion},screen:()=>({x:width/2,y:height/2}),player:{x:100,y:400}};box.SpacePilotArt.draw('background',a);assert.equal(raw.shadowBlur,0);assert.ok(calls>100);for(const e of w.enemies)box.SpacePilotArt.draw('enemy',a,e);box.SpacePilotArt.draw('objectives',a);box.SpacePilotArt.draw('platform',a,w.platforms[0]);box.SpacePilotArt.draw('hazard',a,w.hazards[0]);}
});
test('reduced motion keeps active rift and post-victory safety labels accurate',()=>{
 const box={SpacePilotArt:{draw:()=>false}};vm.runInNewContext(fs.readFileSync(path.join(root,'novax-art.js'),'utf8'),box);const labels=[],raw={fillText:s=>labels.push(s),createLinearGradient:()=>({addColorStop(){}})},ctx=new Proxy(raw,{get:(o,k)=>k in o?o[k]:()=>{}}),w=N.createLevel(4),h=w.hazards[0],a={ctx,state:{world:w,time:3.3-h.phase},settings:{reducedMotion:true},view:{width:390,height:650},screen:()=>({x:100,y:200})};box.SpacePilotArt.draw('hazard',a,h);assert.ok(labels.includes('CAUTION'));labels.length=0;a.state.time=4.2-h.phase;box.SpacePilotArt.draw('hazard',a,h);assert.ok(labels.includes('RIFT PULSE'));labels.length=0;w.enemies.at(-1).alive=false;box.SpacePilotArt.draw('hazard',a,h);assert.ok(labels.includes('ISOLATED'));
});
