'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../public/games/space-pilot-platformer');
const V=require(path.join(root,'vulcanis')),A=require(path.join(root,'asterion')),P=require(path.join(root,'pilot-progress'));
const memory=()=>{const values=new Map();return {values,getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};};
function snapshot(world,level=4){return P.snapshot({world,level,score:2450,time:29.5,health:62,shield:13,lives:2,status:'playing'},P.checkpoint(world,0,80));}

test('Vulcanis adds exactly five ordered missions with a distinct final Rogue Captain encounter',()=>{
  assert.equal(V.levels.length,5);assert.equal(V.saveKey,'wga_space_pilot_vulcanis_v1');
  assert.equal(new Set(V.levels.map(l=>l.bg)).size,5);
  assert.equal(new Set(V.levels.map(l=>l.kind)).size,5);
  V.levels.forEach((spec,i)=>{const w=V.createLevel(i);
    assert.equal(w.spec,spec);assert.ok(spec.briefing.length>=2);assert.ok(spec.report.length>30);
    assert.ok(spec.width>=4400);assert.ok(spec.enemies>=8);assert.ok(spec.cores>0);
    if(i){assert.ok(spec.width>V.levels[i-1].width);assert.ok(spec.enemies>V.levels[i-1].enemies);}
    assert.equal(w.objectives.length,spec.count);assert.ok(w.cores.length>spec.cores);
    assert.equal(w.enemies.filter(e=>e.type==='boss').length,i===4?1:0);
    if(i===4){const boss=w.enemies.find(e=>e.type==='boss');assert.equal(boss.name,'Rogue Captain');assert.ok(boss.hp>0);assert.equal(boss.maxHp,boss.hp);}
  });
  for(const index of [-1,5,NaN])assert.throws(()=>V.createLevel(index),RangeError);
});

test('every required core and objective has a stable lower platform, with reachable gaps and an exit floor',()=>{
  for(let i=0;i<5;i++){const w=V.createLevel(i),route=w.platforms.filter(p=>p.type==='ground');
    assert.equal(route[0].x,0);
    for(let j=1;j<route.length;j++){assert.ok(route[j].x-route[j-1].x-route[j-1].w<=65);assert.ok(Math.abs(route[j].y-route[j-1].y)<65);}
    for(const n of w.objectives){assert.ok(route.some(p=>n.x>p.x+25&&n.x<p.x+p.w-25&&Math.abs(n.y-(p.y-29))<40));assert.equal(n.done,false);assert.equal(n.charge,0);}
    for(const c of w.cores.slice(0,w.spec.cores))assert.ok(route.some(p=>c.x>=p.x&&c.x<=p.x+p.w&&Math.abs(c.y-(p.y-29))<42));
    assert.ok(route.some(p=>w.portal.x>p.x&&w.portal.x<p.x+p.w));
    assert.equal(w.portal.open,false);assert.equal(V.ready(w),false);
    for(const e of w.enemies)assert.ok([e.x,e.y,e.hp,e.maxHp,e.homeX,e.homeY].every(Number.isFinite));
  }
});

test('interactions require sustained nearby input, cancel on release or distance, and cannot award twice',()=>{
  for(let i=0;i<5;i++){const w=V.createLevel(i),n=w.objectives[0],p={x:n.x,y:n.y};
    V.interact(w,p,true,.3);assert.equal(n.done,false);assert.ok(n.charge>0);
    V.interact(w,p,false,.1);assert.equal(n.charge,0);
    V.interact(w,p,true,.3);V.interact(w,{x:n.x+500,y:n.y},true,1);assert.equal(n.charge,0);assert.equal(n.done,false);
    assert.equal(V.interact(w,p,true,.8).completed,n);assert.equal(n.done,true);
    assert.equal(V.interact(w,p,true,1).completed,null);
    w.objectives.forEach(n=>n.done=true);assert.equal(V.ready(w),true);
  }
});

test('machine hazards cycle between safe and dangerous phases reproducibly, away from objective surfaces',()=>{
  assert.equal(typeof V.hazardActive,'function');let machines=0;
  for(let i=0;i<5;i++){const w=V.createLevel(i);
    for(const h of w.hazards.filter(h=>h.type==='crusher')){machines++;
      const phases=Array.from({length:240},(_,n)=>V.hazardActive(h,n/20));
      assert.ok(phases.some(Boolean),'machinery must eventually activate');assert.ok(phases.some(v=>!v),'machinery must offer a safe window');
      assert.deepEqual(phases,Array.from({length:240},(_,n)=>V.hazardActive(h,n/20)));
      assert.ok(w.objectives.every(n=>Math.abs(n.x-h.x)>85||Math.abs(n.y-h.y)>85));
    }
  }
  assert.ok(machines>0,'foundry machinery must be present');
});

test('crusher warning interval is harmless and activation ends at the next cycle',()=>{
  const h={phase:0,cycle:3.6};
  for(const time of [0,1.59,1.6,1.9,2.19])assert.equal(V.hazardActive(h,time),false);
  for(const time of [2.21,2.8,3.59])assert.equal(V.hazardActive(h,time),true);
  assert.equal(V.hazardActive(h,3.6),false);
  for(const time of [0,1,2.21,3.59])assert.equal(V.hazardActive({phase:1,cycle:3.6},time),V.hazardActive(h,time+1));
});

test('checkpoint reload preserves completed objectives and Captain damage, but resets partial holds',()=>{
  const w=V.createLevel(4),boss=w.enemies.find(e=>e.type==='boss');
  w.objectives[0].done=true;w.objectives[1].charge=.79;w.cores[0].taken=true;w.pickups[0].taken=true;boss.hp=7;
  const next=V.createLevel(4),r=P.restore(JSON.parse(JSON.stringify(snapshot(w))),next,4);
  assert.equal(r.score,2450);assert.equal(r.time,29.5);assert.equal(r.health,62);assert.equal(r.lives,2);assert.equal(r.cores,1);
  assert.equal(next.objectives[0].done,true);assert.equal(next.objectives[1].done,false);assert.equal(next.objectives[1].charge,0);
  assert.equal(next.enemies.find(e=>e.type==='boss').hp,7);assert.equal(next.pickups[0].taken,true);assert.equal(next.portal.open,false);
});

test('portal recovery independently requires all objectives, the core quota and Captain defeat',()=>{
  for(const missing of ['objective','core','boss',null]){const w=V.createLevel(4);w.objectives.forEach(n=>n.done=true);w.cores.slice(0,w.spec.cores).forEach(c=>c.taken=true);w.enemies.forEach(e=>e.hp=0);
    if(missing==='objective')w.objectives[0].done=false;
    if(missing==='core')w.cores[0].taken=false;
    if(missing==='boss')w.enemies.find(e=>e.type==='boss').hp=1;
    const next=V.createLevel(4);P.restore(snapshot(w),next,4);assert.equal(next.portal.open,missing===null);
  }
});

test('new chapter progress cannot change Asterion or original-route saves and settings',()=>{
  const storage=memory(),asterion=P.scope(A.saveKey),vulcanis=P.scope(V.saveKey),legacy=P.clean(null,8),prior=asterion.clean(null,5);
  legacy.score=981;legacy.settings.music=0;prior.completed=Array(5).fill(true);prior.current=4;prior.score=5300;
  P.save(storage,legacy);asterion.save(storage,prior);const legacyBytes=storage.getItem(P.KEY),priorBytes=storage.getItem(A.saveKey);
  const chapter=vulcanis.clean(null,5);chapter.completed[0]=true;chapter.current=1;chapter.score=240;chapter.settings.leftHanded=true;
  assert.equal(vulcanis.save(storage,chapter),true);assert.equal(storage.values.size,3);
  assert.equal(storage.getItem(P.KEY),legacyBytes);assert.equal(storage.getItem(A.saveKey),priorBytes);
  assert.equal(vulcanis.load(storage,5).current,1);assert.equal(vulcanis.load(storage,5).settings.leftHanded,true);
  assert.equal(P.load(storage,8).score,981);assert.equal(asterion.load(storage,5).completed.filter(Boolean).length,5);
});

test('corrupt, blocked and out-of-order chapter progress cannot unlock later Vulcanis missions',()=>{
  const progress=P.scope(V.saveKey);
  for(const raw of ['{','null','x'.repeat(80001),JSON.stringify({version:2}),JSON.stringify({version:1,current:4,completed:[false,true,true,true,true]})]){
    const loaded=progress.load({getItem:()=>raw},5);assert.equal(loaded.current,0);assert.equal(loaded.unlocked,0);assert.equal(loaded.completed.some(Boolean),false);
  }
  assert.equal(progress.load({getItem(){throw Error('blocked');}},5).current,0);
  assert.equal(progress.save({setItem(){throw Error('blocked');}},progress.clean(null,5)),false);
  const w=V.createLevel(0);assert.equal(P.restore({level:4,point:{platform:0}},w,0),null);
});

test('Vulcanis entry references exist, retains accessible controls and links back to preserved routes',()=>{
  const html=fs.readFileSync(path.join(root,'vulcanis.html'),'utf8');
  for(const [,ref]of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g))assert.ok(fs.existsSync(path.join(root,ref)),ref);
  for(const id of ['menuDialog','resumeBtn','checkpointBtn','musicVolume','effectsVolume','buttonScale','aimAssist','missionList','storyDialog'])assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(html,/original-route\.html/);assert.match(html,/index\.html/);assert.match(html,/Vulcanis/);
  assert.doesNotMatch(html,/user-scalable=no|maximum-scale|30 playable/i);
  assert.match(fs.readFileSync(path.join(root,'index.html'),'utf8'),/vulcanis\.html/);
});

test('mining relays require route order and permanently silence their cutter groups',()=>{
 const w=V.createLevel(1),later=w.objectives[1],first=w.objectives[0];
 assert.ok(V.interact(w,{x:later.x,y:later.y},true,1).blocked);assert.equal(later.done,false);
 V.interact(w,{x:first.x,y:first.y},true,1);assert.equal(first.done,true);
 const h=w.hazards.find(h=>h.control===0);assert.equal(V.hazardActive(h,2.4-h.phase,w),false);
 assert.equal(V.interact(w,{x:later.x,y:later.y},true,1).completed,later);
});
test('shelters require nearby patrol clearance, not distant enemies',()=>{
 const w=V.createLevel(2),n=w.objectives[0],p={x:n.x,y:n.y};w.enemies=[{x:n.x+80,alive:true}];
 assert.ok(V.interact(w,p,true,1).blocked);assert.equal(n.done,false);w.enemies[0].alive=false;
 assert.equal(V.interact(w,p,true,1).completed,n);
});
