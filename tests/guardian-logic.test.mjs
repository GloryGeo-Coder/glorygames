import test from 'node:test';
import assert from 'node:assert/strict';
import { floorAt, relics, goal } from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/world-logic.mjs';
import {
  GUARDIAN_MAX_HP, GUARDIAN_RANGE, GUARDIAN_POSITION,
  createGuardianState, awakenGuardian, damageGuardian, guardianPhase,
  guardianTitle, portalAvailable, nextGuardianAttack,
  stepGuardian, sigilHits, waveHits,
} from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/guardian-logic.mjs';

const step=(state,t,d=5)=>{let r=[];for(let i=0;i<t/0.05;i++)r.push(...stepGuardian(state,.05,d));return r;};

test('guardian spawns on walkable citadel, leaving bridge/portal geometry unchanged',()=>{
  const f=floorAt(GUARDIAN_POSITION.x,GUARDIAN_POSITION.y);
  assert.equal(f?.id,'citadel');
  assert.equal(floorAt(goal.x,goal.y)?.id,'exit');
  assert.equal(relics.length,5);
});
test('boss is dormant at start and can only awaken once',()=>{
  const g=createGuardianState();
  assert.equal(g.active,false);
  assert.equal(g.hp,GUARDIAN_MAX_HP);
  assert.equal(awakenGuardian(g),true);
  assert.equal(awakenGuardian(g),false);
  assert.equal(g.timer,2.5);
});
test('portal requires both relics and guardian victory',()=>{
  const g=createGuardianState();
  assert.equal(portalAvailable(0,3,g),false);
  assert.equal(portalAvailable(3,3,g),false);
  awakenGuardian(g);
  assert.equal(portalAvailable(3,3,g),false);
  for(let i=0;i<GUARDIAN_MAX_HP;i++) damageGuardian(g);
  assert.equal(g.defeated,true);
  assert.equal(portalAvailable(3,3,g),true);
  assert.equal(portalAvailable(2,3,g),false);
  assert.equal(portalAvailable(3,3,null),true,'safe fallback if guardian cannot render');
});
test('guard transitions through three readable health phases',()=>{
  assert.equal(guardianPhase(12),1);
  assert.equal(guardianPhase(9),1);
  assert.equal(guardianPhase(8),2);
  assert.equal(guardianPhase(4),3);
  assert.equal(guardianPhase(0),0);
  assert.ok(guardianTitle(3).includes('Relic Fury'));
  const g=createGuardianState();awakenGuardian(g);
  for(let i=0;i<4;i++) damageGuardian(g);
  assert.equal(g.phase,2);
  for(let i=0;i<4;i++) damageGuardian(g);
  assert.equal(g.phase,3);
});
test('first attack warns before it casts and has recovery time',()=>{
  const g=createGuardianState();awakenGuardian(g);
  assert.deepEqual(step(g,2.0),[]);
  const events=step(g,.8);
  assert.deepEqual(events.map(e=>e.type),['warn']);
  assert.equal(events[0].attack,'bolt');
  assert.equal(g.mode,'windup');
  assert.deepEqual(step(g,.4),[]);
  const fire=step(g,.6);
  assert.deepEqual(fire.map(e=>e.type),['cast']);
  assert.equal(fire[0].attack,'bolt');
  assert.equal(g.mode,'recovery');
});
test('guardian will not hunt player across map while idle',()=>{
  const g=createGuardianState();awakenGuardian(g);
  const initial=g.timer;
  assert.deepEqual(stepGuardian(g,.04,GUARDIAN_RANGE+4),[]);
  assert.equal(g.timer,initial);
});
test('phase attack cycles include distinct dodgeable sigil and shockwave',()=>{
  assert.deepEqual([0,1,2,3].map(i=>nextGuardianAttack(1,i)),['bolt','sigil','bolt','sigil']);
  assert.deepEqual([0,1,2].map(i=>nextGuardianAttack(3,i)),['wave','sigil','bolt']);
});
test('ground sigil can be dodged by moving or jumping',()=>{
  const mark={x:7,y:15};
  assert.equal(sigilHits({x:7.2,y:15.3,grounded:true},mark),true);
  assert.equal(sigilHits({x:9.5,y:15.3,grounded:true},mark),false);
  assert.equal(sigilHits({x:7.2,y:15.3,grounded:false},mark),false);
});
test('rising shockwave hits grounded player near front edge but misses airborne player',()=>{
  const center={x:0,y:0};
  assert.equal(waveHits({x:2.8,y:0,h:3.58,grounded:true},center,2.4,3,3.58),true);
  assert.equal(waveHits({x:2.8,y:0,h:5,grounded:false},center,2.4,3,3.58),false);
  assert.equal(waveHits({x:6,y:0,h:3.58,grounded:true},center,2.4,3,3.58),false);
});
test('no boss attacks or damage once defeated',()=>{
  const g=createGuardianState();awakenGuardian(g);
  for(let i=0;i<GUARDIAN_MAX_HP;i++)damageGuardian(g);
  assert.equal(damageGuardian(g).hit,false);
  assert.deepEqual(step(g,8),[]);
});
