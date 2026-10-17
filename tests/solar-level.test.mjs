import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d';
const w = await import(`${base}/solar/world-logic.mjs`);
const b = await import(`${base}/solar/guardian-logic.mjs`);
const h = await import(`${base}/solar/solar-hazards.mjs`);
const storm = fs.readFileSync(new URL(`${base}/storm/game.js`,import.meta.url),'utf8');
const stormIndex=fs.readFileSync(new URL(`${base}/storm/index.html`,import.meta.url),'utf8');
const solar=fs.readFileSync(new URL(`${base}/solar/game.js`,import.meta.url),'utf8');
const solarIndex=fs.readFileSync(new URL(`${base}/solar/index.html`,import.meta.url),'utf8');
const effects=await import(`${base}/solar/solar-effects.mjs`);
function tickBoss(state,duration,range=4){let events=[];for(let i=0;i<Math.ceil(duration/.05);i++)events.push(...b.stepGuardian(state,.05,range));return events;}

test('Solar Sanctuary offers its own fourth-world island progression',()=>{
 assert.deepEqual(w.islands.slice(0,4).map(i=>i.id),['arrival','sun-terrace','temple-court','solar-crown']);
 assert.equal(w.islands.length,6);
 assert.equal(w.bridges.length,5);
 assert.ok(w.bridges.every(bridge=>bridge.width>=3));
 assert.deepEqual(w.islands.slice(0,4).map(i=>i.h),[.45,1.75,3.15,4.05]);
});
test('All bridge segments connect authored walkable collision without floor gaps',()=>{
 for (const bridge of w.bridges){
  for(let i=0;i<=50;i++){
   const t=i/50,[ax,ay,ah]=bridge.from,[bx,by,bh]=bridge.to;
   const x=ax+(bx-ax)*t,y=ay+(by-ay)*t, height=ah+(bh-ah)*t;
   const floor=w.floorAt(x,y,height,.6);
   assert.ok(floor,`bridge ${bridge.id} disconnected at ${t.toFixed(2)}`);
   assert.ok(Math.abs(floor.height-height)<.66,`bridge ${bridge.id} height mismatch at ${t.toFixed(2)}`);
  }
 }
});
test('All five solar relics, checkpoints and the crown gateway sit on traversable surfaces',()=>{
 assert.equal(w.relics.length,5);
 for(const site of [...w.relics,...w.checkpoints,w.goal]) assert.ok(w.floorAt(site.x,site.y),site.id);
 assert.equal(w.floorAt(w.goal.x,w.goal.y).id,'solar-crown');
 assert.equal(w.goal.targetWorld,'Campaign Complete');
});
test('Checkpoints advance in one direction and do not rewind',()=>{
 const a=w.checkpoints[0], c=w.checkpoints[1], d=w.checkpoints[2];
 assert.equal(w.nextCheckpoint(a,c.x,c.y)?.id,'sun-terrace');
 assert.equal(w.nextCheckpoint(c,d.x,d.y)?.id,'temple-court');
 assert.equal(w.nextCheckpoint(d,c.x,c.y)?.id,'temple-court');
});
test('Solar prism positions have valid floor and player-safe warning time',()=>{
 assert.equal(h.SOLAR_HAZARDS.length,3);
 assert.ok(h.HAZARD_WARNING_SECONDS>=1.5);
 for(const site of h.createHazardStates()){
  assert.ok(w.floorAt(site.x,site.y),`hazard ${site.id} off platform`);
  assert.ok(site.radius<1.6);
 }
});
test('Solar prisms warn before pulsing, with cooldown between strikes',()=>{
 const hazard=h.createHazardStates()[0];const player={x:hazard.x,y:hazard.y,h:hazard.h,grounded:true};
 const events=[];
 for(let i=0;i<100;i++)events.push(...h.stepHazard(hazard,.05,player));
 assert.equal(events[0]?.type,'warn');
 assert.equal(events[1]?.type,'strike');
 assert.equal(events.filter(e=>e.type==='strike').length,1);
});
test('Solar prism damage is avoidable by moving or jumping',()=>{
 const h0=h.createHazardStates()[1];
 assert.equal(h.solarPulseHits({x:h0.x,y:h0.y,h:h0.h,grounded:true},h0),true);
 assert.equal(h.solarPulseHits({x:h0.x,y:h0.y,h:h0.h+1.5,grounded:false},h0),false);
 assert.equal(h.solarPulseHits({x:h0.x+h0.radius+1,y:h0.y,h:h0.h,grounded:true},h0),false);
});
test('Solar hazards are disabled during boss fight and cannot spawn unexpected strikes',()=>{
 const site=h.createHazardStates()[0];
 const p={x:site.x,y:site.y,h:site.h,grounded:true};
 assert.deepEqual(h.stepHazard(site,10,p,false),[]);
 assert.equal(site.mode,'idle');
});
test('Relic Master has 24 HP and three escalating phases',()=>{
 const boss=b.createGuardianState();assert.equal(b.GUARDIAN_MAX_HP,24);
 assert.equal(b.awakenGuardian(boss),true);
 for(let i=0;i<8;i++) b.damageGuardian(boss);
 assert.equal(boss.phase,2);
 for(let i=0;i<8;i++) b.damageGuardian(boss);
 assert.equal(boss.phase,3);
 for(let i=0;i<8;i++) b.damageGuardian(boss);
 assert.equal(boss.phase,0);
 assert.equal(boss.defeated,true);
 assert.equal(b.damageGuardian(boss).hit,false);
});
test('Relic Master attack state machine always announces before casting',()=>{
 const boss=b.createGuardianState();b.awakenGuardian(boss);
 const events=tickBoss(boss,5);
 assert.ok(events.some(e=>e.type==='warn'));
 assert.ok(events.some(e=>e.type==='cast'));
 const firstCast=events.findIndex(e=>e.type==='cast');
 assert.ok(firstCast>events.findIndex(e=>e.type==='warn'));
});
test('Sigil and shockwave have escape options',()=>{
 const p={x:2,y:0,h:3.15,grounded:true};
 assert.equal(b.sigilHits(p,{x:2,y:0}),true);
 assert.equal(b.sigilHits({...p,grounded:false},{x:2,y:0}),false);
 assert.equal(b.waveHits(p,{x:0,y:0},1.75,2.25,3.15),true);
 assert.equal(b.waveHits({...p,h:4.2,grounded:false},{x:0,y:0},1.75,2.25,3.15),false);
});
test('Crown Gateway opens only after three relics and Relic Master victory',()=>{
 const boss=b.createGuardianState();
 assert.equal(b.portalAvailable(3,3,boss),false);
 b.awakenGuardian(boss);
 for(let i=0;i<24;i++)b.damageGuardian(boss);
 assert.equal(b.portalAvailable(3,3,boss),true);
 assert.equal(b.portalAvailable(2,3,boss),false);
});
test('Victory transitions from Storm Citadel to Solar Sanctuary and retains previous replays',()=>{
 assert.ok(storm.includes('ui.nextWorldBtn.textContent = "Enter Solar Sanctuary";'));
 assert.ok(storm.includes('if (currentMode === "won") location.href = "../solar/";'));
 assert.ok(stormIndex.includes('./game.js?v=0.13'));
 assert.ok(solarIndex.includes('href="../storm/"'));
 assert.ok(solar.includes('wga_skytemple_solar_complete'));
 assert.ok(solar.includes('location.href = "../";'));
 assert.ok(solar.includes('CAMPAIGN COMPLETE'));
});
test('Solar Sanctuary retains mobile joystick and hero animation with strict asset reuse',()=>{
 for(const text of ['createHeroAnimator','joystickPad','glideBtn','jumpBtn','blastBtn','syncTouchControls','loadOrnateGuardianSkin("RelicMaster_Ornate_Mobile.glb")'])assert.ok(solar.includes(text),text);
 assert.ok(solar.includes('hero = { x: -18, y: -12, h: .45'));
 assert.ok(solar.includes('SolarSanctuary_Enhanced_Yup_Mobile.glb'));
 assert.ok(solarIndex.includes('../style.css'));
});
test('Solar VFX budgets remain small and respect reduced-motion setting',()=>{
 assert.ok(effects.SOLAR_VFX_BUDGET.mobile.motes<=10);
 assert.ok(effects.SOLAR_VFX_BUDGET.mobile.sparks<=4);
 assert.equal(effects.relicMasterPose({reducedMotion:true}).bob,0);
});
