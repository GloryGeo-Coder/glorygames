import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const target='../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d';
const w=await import(`${target}/storm/world-logic.mjs`);
const b=await import(`${target}/storm/guardian-logic.mjs`);
const h=await import(`${target}/storm/storm-hazards.mjs`);
const crystal=await import(`${target}/crystal/world-logic.mjs`);
const routes=fs.readFileSync(new URL(`${target}/crystal/game.js`,import.meta.url),'utf8');
function ticks(state, duration, dist=4){const events=[];for(let i=0;i<duration/.05;i++)events.push(...b.stepGuardian(state,.05,dist));return events;}

test('World 3 retains the original islands and adds expedition detours',()=>{
 assert.deepEqual(w.islands.slice(0,4).map(i=>i.id),['entrance','spire','arena','relay']);
 assert.equal(w.islands.length,6);
 assert.equal(w.bridges.length,5);
 assert.ok(w.bridges.every(bridge=>bridge.width>=2.5));
});
test('World 3 matches the authored island floor heights',()=>{
 assert.equal(w.floorAt(-14,-15).height,.2);
 assert.equal(w.floorAt(-5,-3).height,2.6);
 assert.equal(w.floorAt(7,13).height,4.2);
 assert.equal(w.floorAt(19,-3).height,3.6);
});
test('Every bridge has continuous floor support, including at its endpoints',()=>{
 for(const bridge of w.bridges){
  for(let i=0;i<=40;i++){
   const t=i/40,[ax,ay,ah]=bridge.from,[bx,by,bh]=bridge.to;
   const x=ax+(bx-ax)*t,y=ay+(by-ay)*t,height=ah+(bh-ah)*t;
   const floor=w.floorAt(x,y,height,.6);
   assert.ok(floor,`${bridge.id} no floor at ${t.toFixed(2)}`);
   assert.ok(Math.abs(floor.height-height)<.7,`${bridge.id} step too high at ${t.toFixed(2)}`);
  }
 }
});
test('Relics and checkpoints are walkable, portal is on relay',()=>{
 assert.equal(w.relics.length,5);
 for(const p of [...w.relics,...w.checkpoints,w.goal])assert.ok(w.floorAt(p.x,p.y),`missing floor ${p.id}`);
 assert.equal(w.floorAt(w.goal.x,w.goal.y).id,'relay');
});
test('Checkpoints can progress but cannot go backwards',()=>{
 const begin=w.checkpoints[0];
 assert.equal(w.nextCheckpoint(begin,-5,-3)?.id,'spire');
 assert.equal(w.nextCheckpoint(w.checkpoints[1],5.4,9)?.id,'arena');
 assert.equal(w.nextCheckpoint(w.checkpoints[2],-5,-3)?.id,'arena');
});
test('All storm hazard sites have collision floors',()=>{
 assert.equal(h.STORM_HAZARDS.length,3);
 for(const hazard of h.createHazardStates()){
  assert.ok(w.floorAt(hazard.x,hazard.y),hazard.id);
  assert.ok(hazard.radius>1);
 }
});
test('Lightning hazards warn before striking',()=>{
 const hazard=h.createHazardStates()[0];
 const hero={x:hazard.x,y:hazard.y,h:hazard.h,grounded:true};
 let ev=[];
 for(let i=0;i<30;i++)ev.push(...h.stepHazard(hazard,.05,hero));
 assert.deepEqual(ev.map(e=>e.type),['warn']);
 ev=[];
 for(let i=0;i<30;i++)ev.push(...h.stepHazard(hazard,.05,hero));
 assert.ok(ev.some(e=>e.type==='strike'));
});
test('Lightning is avoidable by jumping or moving out of the marked radius',()=>{
 const hazard=h.createHazardStates()[0];
 assert.equal(h.lightningHits({x:hazard.x,y:hazard.y,h:hazard.h,grounded:true},hazard),true);
 assert.equal(h.lightningHits({x:hazard.x,y:hazard.y,h:hazard.h+1.5,grounded:false},hazard),false);
 assert.equal(h.lightningHits({x:hazard.x+hazard.radius+1,y:hazard.y,h:hazard.h,grounded:true},hazard),false);
});
test('Hazards do not surprise a player who is out of trigger range',()=>{
 const hazard=h.createHazardStates()[2];
 const player={x:hazard.x+100,y:hazard.y,h:hazard.h,grounded:true};
 assert.deepEqual(h.stepHazard(hazard,5,player),[]);
 assert.equal(hazard.mode,'idle');
});
test('Storm hazard timers can be turned off after boss defeat',()=>{
 const hazard=h.createHazardStates()[0];
 const player={x:hazard.x,y:hazard.y,h:hazard.h,grounded:true};
 assert.deepEqual(h.stepHazard(hazard,10,player,false),[]);
});
test('Thunder Golem has 18 HP, three phases and cannot be damaged twice after defeat',()=>{
 const g=b.createGuardianState(); assert.equal(b.GUARDIAN_MAX_HP,18);
 assert.equal(b.awakenGuardian(g),true);
 for(let i=0;i<6;i++)b.damageGuardian(g);assert.equal(g.phase,2);
 for(let i=0;i<6;i++)b.damageGuardian(g);assert.equal(g.phase,3);
 for(let i=0;i<6;i++)b.damageGuardian(g);assert.equal(g.phase,0);
 assert.equal(b.damageGuardian(g).hit,false);
});
test('Thunder Golem gives attack warnings before casting',()=>{
 const g=b.createGuardianState();b.awakenGuardian(g);
 assert.deepEqual(ticks(g,2),[]);
 const first=ticks(g,1); assert.ok(first.some(e=>e.type==='warn'));
 const cast=ticks(g,1.2);assert.ok(cast.some(e=>e.type==='cast'));
});
test('Boss sigils and shockwaves are dodgeable',()=>{
 const p={x:0,y:0,h:4.2,grounded:true};
 assert.equal(b.sigilHits(p,{x:0,y:0}),true);
 assert.equal(b.sigilHits({...p,grounded:false},{x:0,y:0}),false);
 assert.equal(b.waveHits({...p,x:2.5},{x:0,y:0},2,2.8,4.2),true);
 assert.equal(b.waveHits({...p,x:2.5,h:5.5,grounded:false},{x:0,y:0},2,2.8,4.2),false);
});
test('Portal requires relics AND defeated Golem',()=>{
 const g=b.createGuardianState();
 assert.equal(b.portalAvailable(0,3,g),false);
 assert.equal(b.portalAvailable(3,3,g),false);
 b.awakenGuardian(g);
 for(let i=0;i<b.GUARDIAN_MAX_HP;i++)b.damageGuardian(g);
 assert.equal(b.portalAvailable(3,3,g),true);
 assert.equal(b.portalAvailable(2,3,g),false);
});
test('Crystal Caverns retains its layout and gains a Storm Citadel victory link',()=>{
 assert.equal(crystal.islands.length,6);
 assert.equal(crystal.relics.length,5);
 assert.ok(routes.includes('ui.nextWorldBtn.textContent = "Enter Storm Citadel";'));
 assert.ok(routes.includes('if (currentMode === "won") location.href = "../storm/";'));
});
test('World 4 now has a real Solar Sanctuary route after Storm Citadel is cleared',()=>{
 assert.equal(w.goal.targetWorld,'Solar Sanctuary');
 const next=fs.readFileSync(new URL(`${target}/storm/game.js`,import.meta.url),'utf8');
 const solar=fs.readFileSync(new URL(`${target}/solar/game.js`,import.meta.url),'utf8');
 assert.ok(next.includes('wga_skytemple_storm_complete'));
 assert.ok(next.includes('ui.nextWorldBtn.textContent = "Enter Solar Sanctuary";'));
 assert.ok(next.includes('if (currentMode === "won") location.href = "../solar/";'));
 assert.ok(solar.includes('wga_skytemple_solar_complete'));
});
