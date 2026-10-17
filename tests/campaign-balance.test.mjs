import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORLD_BALANCE, worldBalance, canChargeDrone, droneWarningTime,
  createJumpAssist, nextForwardCheckpoint, nextRelicHint, questDirection,
} from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/campaign-balance.mjs';
import {relics as gardenRelics, checkpoints as gardenCheckpoints} from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/world-logic.mjs';
import {relics as crystalRelics, checkpoints as crystalCheckpoints} from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/crystal/world-logic.mjs';
import {relics as stormRelics, checkpoints as stormCheckpoints} from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/storm/world-logic.mjs';
import {relics as solarRelics, checkpoints as solarCheckpoints} from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/solar/world-logic.mjs';

const worlds = [
  ['garden',gardenRelics,gardenCheckpoints],['crystal',crystalRelics,crystalCheckpoints],
  ['storm',stormRelics,stormCheckpoints],['solar',solarRelics,solarCheckpoints],
];

for(const [key,relics,checkpoints] of worlds){
  test(`${key}: balance profile is complete and within reasonable combat bounds`,()=>{
    const profile = worldBalance(key);
    assert.ok(profile.label.length>0);
    assert.ok(profile.droneCooldownScale>=1 && profile.droneCooldownScale<=1.5);
    assert.ok(profile.warningBonus>=.08);
    assert.ok(profile.guardianClock>=.85 && profile.guardianClock<=1.05);
    assert.ok(profile.maxSimultaneousWindups<=2);
    assert.ok(profile.maxFlyingDroneShots<=2);
    assert.ok(profile.droneProjectileSpeed<=4.6);
    assert.equal(profile.checkpointHeal,1);
  });
  test(`${key}: five-relic campaign and authored checkpoints unchanged`,()=>{
    assert.equal(relics.length,5);
    assert.equal(checkpoints.length,3);
    assert.ok(questDirection(checkpoints[0],relics,new Set(),.3));
    assert.equal(nextRelicHint(checkpoints[0],relics,new Set(relics.map(r=>r.id))),null);
  });
  test(`${key}: checkpoint never rewinds and advances only on reached pad`,()=>{
    assert.equal(nextForwardCheckpoint(checkpoints,checkpoints[0],checkpoints[1]).id,checkpoints[1].id);
    assert.equal(nextForwardCheckpoint(checkpoints,checkpoints[1],checkpoints[0]).id,checkpoints[1].id);
    assert.equal(nextForwardCheckpoint(checkpoints,checkpoints[1],checkpoints[2]).id,checkpoints[2].id);
    assert.equal(nextForwardCheckpoint(checkpoints,checkpoints[2],checkpoints[1]).id,checkpoints[2].id);
    assert.equal(nextForwardCheckpoint(checkpoints,checkpoints[0],{x:200,y:300}).id,checkpoints[0].id);
  });
  test(`${key}: attack warnings are long enough to react to on phones`,()=>{
    const p=worldBalance(key);
    assert.ok(droneWarningTime(p,'skimmer')>=.8);
    assert.ok(droneWarningTime(p,'bulwark')>=1.0);
    assert.ok(droneWarningTime(p,'bulwark')>droneWarningTime(p,'skimmer'));
  });
  test(`${key}: drone attack cap and combat grace prevent overlaps`,()=>{
    const p=worldBalance(key);
    assert.equal(canChargeDrone(p,{}),true);
    assert.equal(canChargeDrone(p,{charging:p.maxSimultaneousWindups}),false);
    assert.equal(canChargeDrone(p,{flying:p.maxFlyingDroneShots}),false);
    assert.equal(canChargeDrone(p,{playerGrace:true}),false);
    assert.equal(canChargeDrone(p,{bossActive:true}),false);
  });
}

test('landing is required to claim a new checkpoint',()=>{
  const cps=[{id:'entrance',x:0,y:0},{id:'temple',x:10,y:8}];
  assert.equal(nextForwardCheckpoint(cps,cps[0],{x:10,y:8,grounded:false}).id,'entrance');
  assert.equal(nextForwardCheckpoint(cps,cps[0],{x:10,y:8,grounded:true}).id,'temple');
});

test('garden -> solar combat escalation is gradual, not a sudden jump',()=>{
  const x=worlds.map(([key])=>worldBalance(key));
  for(let i=1;i<x.length;i++){
    assert.ok(x[i].droneCooldownScale<=x[i-1].droneCooldownScale);
    assert.ok(x[i].droneProjectileSpeed>=x[i-1].droneProjectileSpeed);
    assert.ok(x[i].warningBonus<=x[i-1].warningBonus);
  }
  assert.equal(x[0].maxSimultaneousWindups,1);
  assert.equal(x[3].maxSimultaneousWindups,2);
});

test('unknown campaign keys do not silently use a wrong balance profile',()=>{
  assert.throws(()=>worldBalance('unknown-world'),/Unknown campaign world/);
});

test('jump buffer remembers a press shortly before landing',()=>{
  const grace=createJumpAssist();
  assert.equal(grace.step({dt:.016,pressed:true,grounded:false,verticalVelocity:-3}),false);
  assert.equal(grace.step({dt:.075,pressed:false,grounded:false,verticalVelocity:-3}),false);
  assert.equal(grace.step({dt:.016,pressed:false,grounded:true,verticalVelocity:0}),true);
  assert.equal(grace.step({dt:.016,pressed:false,grounded:false,verticalVelocity:8}),false);
});

test('coyote jump works just after stepping off a platform',()=>{
  const grace=createJumpAssist();
  grace.step({dt:.016,grounded:true});
  assert.equal(grace.step({dt:.05,pressed:true,grounded:false,verticalVelocity:0}),true);
});

test('there is no unlimited double-jump while the hero is rising',()=>{
  const grace=createJumpAssist();
  assert.equal(grace.step({dt:.016,pressed:true,grounded:true,verticalVelocity:0}),true);
  assert.equal(grace.step({dt:.016,pressed:true,grounded:false,verticalVelocity:7}),false);
  grace.step({dt:.10,pressed:false,grounded:false,verticalVelocity:6});
  assert.equal(grace.step({dt:.10,pressed:false,grounded:false,verticalVelocity:4}),false);
});

test('a forgotten buffer cannot turn into a jump after its deadline',()=>{
  const grace=createJumpAssist();
  grace.step({dt:.016,pressed:true,grounded:false,verticalVelocity:-3});
  grace.step({dt:.10,grounded:false,verticalVelocity:-3});
  grace.step({dt:.10,grounded:false,verticalVelocity:-3});
  assert.equal(grace.step({dt:.016,grounded:true,verticalVelocity:0}),false);
});

test('jump grace resets on pause, retry or device blur',()=>{
  const grace=createJumpAssist();
  grace.step({dt:.016,pressed:true,grounded:false,verticalVelocity:-2});
  grace.reset();
  assert.equal(grace.step({dt:.016,grounded:true,verticalVelocity:0}),false);
});

test('guidance uses the nearest remaining relic and never a collected one',()=>{
  const positions=[{id:'a',label:'Arrival',x:0,y:3},{id:'b',label:'Far summit',x:0,y:42}];
  const current={x:0,y:0};
  assert.equal(nextRelicHint(current,positions,new Set()).id,'a');
  assert.equal(nextRelicHint(current,positions,new Set(['a'])).id,'b');
  assert.equal(nextRelicHint(current,positions,new Set(['a','b'])),null);
});

test('guidance arrows rotate with the camera and show coarse distance',()=>{
  const target=[{id:'one',label:'Sunstone',x:10,y:0}];
  const front=nextRelicHint({x:0,y:0},target,new Set(),0);
  const turned=nextRelicHint({x:0,y:0},target,new Set(),Math.PI/2);
  assert.equal(front.arrow,'→');
  assert.equal(turned.arrow,'↑');
  assert.equal(front.meters,10);
});

test('player can tell where to search without mistaking arrow for a bridge route',()=>{
  const txt=questDirection({x:0,y:0},[{id:'r',label:'Crown Shard',x:0,y:14}],new Set(),0);
  assert.match(txt,/Crown Shard/);
  assert.match(txt,/use the bridges/);
  assert.equal(questDirection({x:0,y:0},[{id:'r',x:0,y:14}],new Set(['r'])),null);
});

test('malformed waypoints are safely ignored by the objective helper',()=>{
  assert.equal(nextRelicHint(null,[],new Set()),null);
  assert.equal(nextRelicHint({x:1,y:2},[{id:'broken',x:NaN,y:Infinity}],new Set()),null);
});
