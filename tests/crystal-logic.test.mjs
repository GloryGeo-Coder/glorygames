import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const base = '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d';
const level = await import(`${base}/crystal/world-logic.mjs`);
const boss = await import(`${base}/crystal/guardian-logic.mjs`);
const garden = await import(`${base}/world-logic.mjs`);
const gardenBoss = await import(`${base}/guardian-logic.mjs`);
const step=(state,t,d=4)=>{const ret=[];for(let i=0;i<t/.05;i++)ret.push(...boss.stepGuardian(state,.05,d));return ret;};

test('Crystal Caverns retains the original islands plus two connected expedition islands',()=>{
 assert.equal(level.islands.length,6); assert.equal(level.bridges.length,5);
 assert.ok(level.bridges.every(p=>p.width>=2.5));
 assert.equal(level.islands[0].id,'entrance');assert.equal(level.islands[3].id,'treasure');
});
test('all five crystal relics are on collision-supported islands',()=>{
 assert.equal(level.relics.length,5);
 for (const r of level.relics) {
  const p=level.floorAt(r.x,r.y);
  assert.ok(p,`no floor for ${r.id}`);
  assert.ok(Math.abs(p.height-level.islands.find(i=>i.id===p.id)?.h)<.01);
 }
});
test('checkpoints, Warden and portal remain on walkable islands',()=>{
 for (const cp of level.checkpoints) assert.ok(level.floorAt(cp.x,cp.y),cp.id);
 assert.equal(level.floorAt(boss.GUARDIAN_POSITION.x,boss.GUARDIAN_POSITION.y)?.id,'shrine');
 assert.equal(level.floorAt(level.goal.x,level.goal.y)?.id,'treasure');
});
test('bridges can be walked across to their corresponding platforms',()=>{
 for(const b of level.bridges){
  for(let i=0;i<=20;i++){
   const t=i/20;
   const [ax,ay,ah]=b.from,[bx,by,bh]=b.to;
   const p=level.floorAt(ax+(bx-ax)*t,ay+(by-ay)*t,ah+(bh-ah)*t,.75);
   assert.ok(p,`${b.id} ${t.toFixed(2)} had no floor`);
  }
 }
});
test('three crystals alone cannot unlock the Warden exit',()=>{
 const state=boss.createGuardianState();
 assert.equal(boss.portalAvailable(3,3,state),false);
 assert.equal(boss.awakenGuardian(state),true);
 for(let i=0;i<boss.GUARDIAN_MAX_HP;i++)boss.damageGuardian(state);
 assert.equal(state.defeated,true);
 assert.equal(boss.portalAvailable(3,3,state),true);
 assert.equal(boss.portalAvailable(2,3,state),false);
});
test('Crystal Warden has fifteen HP, three phases and no damage after defeat',()=>{
 assert.equal(boss.GUARDIAN_MAX_HP,15);
 const s=boss.createGuardianState();boss.awakenGuardian(s);
 for(let i=0;i<5;i++)boss.damageGuardian(s);
 assert.equal(s.phase,2);
 for(let i=0;i<5;i++)boss.damageGuardian(s);
 assert.equal(s.phase,3);
 for(let i=0;i<5;i++)boss.damageGuardian(s);
 assert.equal(s.phase,0);
 assert.equal(boss.damageGuardian(s).hit,false);
 assert.deepEqual(step(s,8),[]);
});
test('Warden attacks telegraph clearly before firing',()=>{
 const s=boss.createGuardianState();boss.awakenGuardian(s);
 assert.deepEqual(step(s,2.0),[]);
 const warnings=step(s,.8);assert.equal(warnings.length,1);
 assert.equal(warnings[0].type,'warn');
 assert.equal(warnings[0].attack,'bolt');
 assert.deepEqual(step(s,.45),[]);
 const fired=step(s,.85);assert.ok(fired.some(e=>e.type==='cast'));
});
test('Warden sigils and resonance waves are dodgeable',()=>{
 assert.equal(boss.sigilHits({x:0,y:0,grounded:true},{x:0,y:0}),true);
 assert.equal(boss.sigilHits({x:0,y:0,grounded:false},{x:0,y:0}),false);
 assert.equal(boss.sigilHits({x:4,y:0,grounded:true},{x:0,y:0}),false);
 assert.equal(boss.waveHits({x:2.5,y:0,h:2.4,grounded:true},{x:0,y:0},2.2,2.8,2.4),true);
 assert.equal(boss.waveHits({x:2.5,y:0,h:4.0,grounded:false},{x:0,y:0},2.2,2.8,2.4),false);
});
test('Sky Garden locations and Guardian HP remain unchanged',()=>{
 assert.equal(garden.islands[0].x,-12);
 assert.equal(garden.islands[0].y,-17);
 assert.equal(garden.relics.length,5);
 assert.equal(gardenBoss.GUARDIAN_MAX_HP,12);
 assert.equal(gardenBoss.GUARDIAN_POSITION.y,15.3);
});
