import test from 'node:test';
import assert from 'node:assert/strict';
import { selectAimTarget,vectorToTarget,projectileHits,needsDroneWarning,DRONE_HP } from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/combat-logic.mjs';

test('aim assist only selects visible targets ahead of the hero',()=>{
  const hero={x:0,y:0,h:1.0};
  const enemies=[{x:1,y:7,h:3,alive:true},{x:0,y:-2,h:3,alive:true},{x:1,y:4,alive:false}];
  assert.equal(selectAimTarget(hero,0,enemies),enemies[0]);
  assert.equal(selectAimTarget(hero,Math.PI,enemies),enemies[1]);
  assert.equal(selectAimTarget(hero,Math.PI/2,[enemies[1]]),null);
});
test('projectile velocity includes target height and has correct speed',()=>{
  const v=vectorToTarget({x:0,y:0,h:1},{x:4,y:3,h:4},19);
  assert.ok(Math.abs(Math.hypot(v.vx,v.vy,v.vh)-19)<1e-6);
  assert.ok(v.vh>0);
});
test('hit checks include vertical clearance and horizontal proximity',()=>{
  assert.equal(projectileHits({x:0,y:0,h:1},{x:0.5,y:.3,h:1.2}),true);
  assert.equal(projectileHits({x:0,y:0,h:1},{x:.5,y:.3,h:5}),false);
});
test('drone fires only if alive, in range, cooldown expired and game progressed',()=>{
  const drone={x:4,y:2,alive:true,cooldown:0};
  assert.equal(needsDroneWarning(drone,{x:0,y:0},8),true);
  assert.equal(needsDroneWarning({...drone,cooldown:2},{x:0,y:0},8),false);
  assert.equal(needsDroneWarning(drone,{x:0,y:0},2),false);
  assert.equal(needsDroneWarning(drone,{x:0,y:15},8),false);
  assert.equal(DRONE_HP,3);
});
