'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../public/games/space-pilot-platformer');
const V=require(path.join(root,'luminara')),Prior=require(path.join(root,'vulcanis')),A=require(path.join(root,'asterion')),P=require(path.join(root,'pilot-progress'));
const memory=()=>{const values=new Map();return {values,getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};};
function snapshot(world,level=4){return P.snapshot({world,level,score:2450,time:29.5,health:62,shield:13,lives:2,status:'playing'},P.checkpoint(world,0,80));}

test('Luminara adds exactly five ordered missions with a distinct final Prism Guardian encounter',()=>{
  assert.equal(V.levels.length,5);assert.equal(V.saveKey,'wga_space_pilot_luminara_v1');
  assert.equal(new Set(V.levels.map(l=>l.bg)).size,5);
  assert.equal(new Set(V.levels.map(l=>l.kind)).size,5);
  V.levels.forEach((spec,i)=>{const w=V.createLevel(i);
    assert.equal(w.spec,spec);assert.ok(spec.briefing.length>=2);assert.ok(spec.report.length>30);
    assert.ok(spec.width>=4400);assert.ok(spec.enemies>=8);assert.ok(spec.cores>0);
    if(i){assert.ok(spec.width>V.levels[i-1].width);assert.ok(spec.enemies>V.levels[i-1].enemies);}
    assert.equal(w.objectives.length,spec.count);assert.ok(w.cores.length>spec.cores);
    assert.equal(w.enemies.filter(e=>e.type==='boss').length,i===4?1:0);
    if(i===4){const boss=w.enemies.find(e=>e.type==='boss');assert.equal(boss.name,'Prism Guardian');assert.ok(boss.hp>0);assert.equal(boss.maxHp,boss.hp);}
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
  for(let i=0;i<5;i++){const w=V.createLevel(i),n=w.objectives[0],p={x:n.x,y:n.y};w.enemies=[];
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
    for(const h of w.hazards.filter(h=>h.type==='prism')){machines++;
      const phases=Array.from({length:240},(_,n)=>V.hazardActive(h,n/20));
      assert.ok(phases.some(Boolean),'machinery must eventually activate');assert.ok(phases.some(v=>!v),'machinery must offer a safe window');
      assert.deepEqual(phases,Array.from({length:240},(_,n)=>V.hazardActive(h,n/20)));
      assert.ok(w.objectives.every(n=>Math.abs(n.x-h.x)>85||Math.abs(n.y-h.y)>85));
    }
  }
  assert.ok(machines>0,'foundry machinery must be present');
});

test('prism warning interval is harmless and activation ends at the next cycle',()=>{
  const h={phase:0,cycle:4};
  for(const time of [0,1.59,1.9,2.59])assert.equal(V.hazardActive(h,time),false);
  for(const time of [2.61,2.8,3.99])assert.equal(V.hazardActive(h,time),true);
  assert.equal(V.hazardActive(h,4),false);
  for(const time of [0,1,2.61,3.99])assert.equal(V.hazardActive({phase:1,cycle:4},time),V.hazardActive(h,time+1));
});

test('checkpoint reload preserves completed objectives and Guardian damage, but resets partial holds',()=>{
  const w=V.createLevel(4),boss=w.enemies.find(e=>e.type==='boss');
  w.objectives[0].done=true;w.objectives[1].charge=.79;w.cores[0].taken=true;w.pickups[0].taken=true;boss.hp=7;
  const next=V.createLevel(4),r=P.restore(JSON.parse(JSON.stringify(snapshot(w))),next,4);
  assert.equal(r.score,2450);assert.equal(r.time,29.5);assert.equal(r.health,62);assert.equal(r.lives,2);assert.equal(r.cores,1);
  assert.equal(next.objectives[0].done,true);assert.equal(next.objectives[1].done,false);assert.equal(next.objectives[1].charge,0);
  assert.equal(next.enemies.find(e=>e.type==='boss').hp,7);assert.equal(next.pickups[0].taken,true);assert.equal(next.portal.open,false);
});

test('portal recovery independently requires all objectives, the core quota and Guardian defeat',()=>{
  for(const missing of ['objective','core','boss',null]){const w=V.createLevel(4);w.objectives.forEach(n=>n.done=true);w.cores.slice(0,w.spec.cores).forEach(c=>c.taken=true);w.enemies.forEach(e=>e.hp=0);
    if(missing==='objective')w.objectives[0].done=false;
    if(missing==='core')w.cores[0].taken=false;
    if(missing==='boss')w.enemies.find(e=>e.type==='boss').hp=1;
    const next=V.createLevel(4);P.restore(snapshot(w),next,4);assert.equal(next.portal.open,missing===null);
  }
});

test('new chapter progress cannot change Asterion or original-route saves and settings',()=>{
  const storage=memory(),asterion=P.scope(A.saveKey),luminara=P.scope(V.saveKey),legacy=P.clean(null,8),prior=asterion.clean(null,5);
  legacy.score=981;legacy.settings.music=0;prior.completed=Array(5).fill(true);prior.current=4;prior.score=5300;
  P.save(storage,legacy);asterion.save(storage,prior);const legacyBytes=storage.getItem(P.KEY),priorBytes=storage.getItem(A.saveKey);
  const chapter=luminara.clean(null,5);chapter.completed[0]=true;chapter.current=1;chapter.score=240;chapter.settings.leftHanded=true;
  assert.equal(luminara.save(storage,chapter),true);assert.equal(storage.values.size,3);
  assert.equal(storage.getItem(P.KEY),legacyBytes);assert.equal(storage.getItem(A.saveKey),priorBytes);
  assert.equal(luminara.load(storage,5).current,1);assert.equal(luminara.load(storage,5).settings.leftHanded,true);
  assert.equal(P.load(storage,8).score,981);assert.equal(asterion.load(storage,5).completed.filter(Boolean).length,5);
});

test('corrupt, blocked and out-of-order chapter progress cannot unlock later Luminara missions',()=>{
  const progress=P.scope(V.saveKey);
  for(const raw of ['{','null','x'.repeat(80001),JSON.stringify({version:2}),JSON.stringify({version:1,current:4,completed:[false,true,true,true,true]})]){
    const loaded=progress.load({getItem:()=>raw},5);assert.equal(loaded.current,0);assert.equal(loaded.unlocked,0);assert.equal(loaded.completed.some(Boolean),false);
  }
  assert.equal(progress.load({getItem(){throw Error('blocked');}},5).current,0);
  assert.equal(progress.save({setItem(){throw Error('blocked');}},progress.clean(null,5)),false);
  const w=V.createLevel(0);assert.equal(P.restore({level:4,point:{platform:0}},w,0),null);
});

test('Luminara entry references exist, retains accessible controls and links back to preserved routes',()=>{
  const html=fs.readFileSync(path.join(root,'luminara.html'),'utf8');
  for(const [,ref]of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g))assert.ok(fs.existsSync(path.join(root,ref)),ref);
  for(const id of ['menuDialog','resumeBtn','checkpointBtn','musicVolume','effectsVolume','buttonScale','aimAssist','missionList','storyDialog'])assert.ok(html.includes('id="'+id+'"'),id);
  assert.match(html,/original-route\.html/);assert.match(html,/index\.html/);assert.match(html,/Luminara/);
  assert.doesNotMatch(html,/user-scalable=no|maximum-scale|30 playable/i);
  assert.match(fs.readFileSync(path.join(root,'vulcanis.html'),'utf8'),/luminara\.html/);
});

test('archives require west-to-east order while mirror alignments require the safe blue interval',()=>{
 const archives=V.createLevel(0),later=archives.objectives[1],first=archives.objectives[0];
 assert.match(V.interact(archives,later,true,1).blocked,/earlier archive/);assert.equal(later.done,false);
 assert.equal(V.interact(archives,first,true,.8).completed,first);
 assert.equal(V.interact(archives,later,true,.8).completed,later);
 const mirrors=V.createLevel(1),mirror=mirrors.objectives[1],h=mirrors.hazards.find(h=>h.control===1);
 for(const phase of [1.9,2.59,2.6,3.99]){assert.match(V.interact(mirrors,mirror,true,1,phase-mirror.phase).blocked,/blue emitter/);assert.equal(mirror.done,false);}
 assert.equal(V.hazardActive(h,3-h.phase,mirrors),true);
 assert.equal(V.interact(mirrors,mirror,true,.8,.8-mirror.phase).completed,mirror);
 for(let t=0;t<12;t+=.1)assert.equal(V.hazardActive(h,t,mirrors),false);
});
test('refuges require nearby sentry clearance, not distant enemies',()=>{
 const w=V.createLevel(2),n=w.objectives[0];w.enemies=[{x:n.x+80,alive:true},{x:n.x+500,alive:true}];
 assert.match(V.interact(w,n,true,1).blocked,/nearby sentries/);assert.equal(n.done,false);w.enemies[0].alive=false;
 assert.equal(V.interact(w,n,true,.8).completed,n);
});
test('phase ledges warn, disappear, then return; matching anchors lock only their own group',()=>{
 const w=V.createLevel(3),n=w.objectives[0],ledges=w.platforms.filter(p=>p.type==='phase'),p=ledges.find(p=>p.control===0),other=ledges.find(p=>p.control!==0);
 assert.ok(p&&other);V.updateWorld(w,0);assert.equal(p.active,true);assert.equal(p.warning,false);
 V.updateWorld(w,2.9);assert.equal(p.active,true);assert.equal(p.warning,true);
 V.updateWorld(w,3.6);assert.equal(p.active,false);assert.equal(p.warning,false);
 assert.match(V.interact(w,n,true,1,3.6).blocked,/solid blue bridge/);assert.equal(n.done,false);
 assert.equal(V.interact(w,n,true,.8,.8).completed,n);
 V.updateWorld(w,3.6);assert.equal(p.active,true);assert.equal(p.warning,false);
 V.updateWorld(w,3.7-other.control);assert.equal(other.active,false);
 for(const ground of w.platforms.filter(p=>p.type==='ground'))assert.notEqual(ground.active,false);
 for(const phase of ledges)assert.equal(P.checkpoint(w,w.platforms.indexOf(phase),80),null);
});
test('Guardian shield blocks damage until all three anchors are grounded, without protecting normal sentries',()=>{
 const w=V.createLevel(4),boss=w.enemies.find(e=>e.type==='boss');V.updateWorld(w,0);
 assert.equal(boss.shielded,true);assert.equal(V.damageMultiplier(boss,w),0);assert.equal(V.damageMultiplier(w.enemies[0],w),1);
 w.objectives.slice(0,-1).forEach(n=>n.done=true);assert.equal(V.damageMultiplier(boss,w),0);
 w.objectives.at(-1).done=true;V.updateWorld(w,2);assert.equal(boss.shielded,false);assert.equal(V.damageMultiplier(boss,w),1);
});
test('Luminara does not mutate Vulcanis progress or its generated content',()=>{
 const store=memory(),prior=P.scope(Prior.saveKey),profile=prior.clean(null,5);profile.completed.fill(true);profile.current=4;prior.save(store,profile);
 const bytes=store.getItem(Prior.saveKey),world=JSON.stringify(Prior.createLevel(4));
 const current=P.scope(V.saveKey);current.save(store,current.clean(null,5));V.createLevel(4);
 assert.equal(store.getItem(Prior.saveKey),bytes);assert.equal(JSON.stringify(Prior.createLevel(4)),world);
});
test('restored mirror and phase objectives reapply permanent emitter and bridge changes',()=>{
 for(const level of [1,3]){
  const w=V.createLevel(level);w.objectives[0].done=true;w.objectives[1].charge=.6;
  const next=V.createLevel(level);P.restore(snapshot(w,level),next,level);V.updateWorld(next,3.8);
  assert.equal(next.objectives[0].done,true);assert.equal(next.objectives[1].charge,0);
  if(level===1)for(const h of next.hazards.filter(h=>h.control===0))assert.equal(V.hazardActive(h,2.8-h.phase,next),false);
  else for(const p of next.platforms.filter(p=>p.type==='phase'&&p.control===0)){assert.equal(p.active,true);assert.equal(p.warning,false);}
 }
});
