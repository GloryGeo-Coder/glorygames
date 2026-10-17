import test from 'node:test';
import assert from 'node:assert/strict';
import {
  islands, bridges, relics, checkpoints, goal,
  floorAt, floorCandidates, horizontalToEngine, movementVector,
  canEnterPortal, distance2,
} from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/world-logic.mjs';

test('all seven island surfaces and five bridges exist', () => {
  assert.equal(islands.length, 7);
  assert.equal(bridges.length, 5);
  assert.equal(relics.length, 5);
  assert.equal(checkpoints.length, 3);
});
test('Blender Z-up becomes Y-up in the game', () => {
  assert.deepEqual(horizontalToEngine(4, -11, 2.5), { x: 4, y: 2.5, z: 11 });
});
test('the player has a safe arrival platform', () => {
  const floor = floorAt(-12, -17);
  assert.equal(floor.id, 'arrival');
  assert.equal(floor.height, .58);
});
test('the bridge walking surface has smooth, rising heights', () => {
  const first = bridges[0];
  for (const t of [0, .1, .25, .5, .75, .9, 1]) {
    const x = first.from[0] + (first.to[0] - first.from[0]) * t;
    const y = first.from[1] + (first.to[1] - first.from[1]) * t;
    const bridge = floorCandidates(x,y).find(f => f.id === first.id);
    assert.ok(bridge, `first bridge missing at ${t}`);
    assert.ok(Math.abs(bridge.height - (.58 + t)) < 0.000001);
  }
});
test('all main bridge endpoints overlap landable island surfaces', () => {
  const names = [['arrival','middle'], ['middle','citadel'], ['citadel','exit'], ['middle','moonlit-orchard'], ['citadel','high-relic-observatory']];
  for (let i=0;i<bridges.length;i++) {
    const b=bridges[i];
    for (let end=0; end<2; end++) {
      const p = end === 0 ? b.from : b.to;
      const overlap = floorCandidates(p[0],p[1]).filter(f=>f.kind==='island');
      assert.ok(overlap.some(f => f.id === names[i][end]), `${b.id} ${names[i][end]} not connected`);
    }
  }
});
test('all collectible relics and the portal lie on walkable ground', () => {
  for (const item of [...relics, goal]) assert.ok(floorAt(item.x, item.y), item.id);
});
test('player cannot snap directly from below an elevated surface', () => {
  assert.equal(floorAt(5, 14, .58, .7), null);
  assert.equal(floorAt(5,14,3.58,.7)?.id, 'citadel');
});
test('background void does not count as a platform', () => {
  assert.equal(floorAt(90,90), null);
});
test('camera-relative controls behave at several yaw angles', () => {
  const straight = movementVector(1,0,0);
  assert.equal(straight.x, 0); assert.ok(straight.y > 5);
  const side = movementVector(0,1,0);
  assert.ok(side.x > 5); assert.equal(side.y, 0);
  const rotated = movementVector(1,0,Math.PI/2);
  assert.ok(rotated.x > 5); assert.ok(Math.abs(rotated.y) < 1e-9);
  const diag = movementVector(1,1,0);
  assert.ok(Math.hypot(diag.x,diag.y) <= 5.6 + 1e-8);
});
test('portal requires all relics', () => {
  assert.equal(canEnterPortal(2), false);
  assert.equal(canEnterPortal(5), true);
  assert.equal(distance2({x:18,y:-4},goal),0);
});

test('the entire intended walking path stays connected without falling through gaps', () => {
  const route = [
    [-12,-17],[-9,-13],[-8,-5],[-6,-2],[-5,1],[1,9],
    [5,14],[10,9],[15,-2],[18,-4],
  ];
  let lastH=.58;
  for (let i=0;i<route.length-1;i++) {
    const a=route[i], b=route[i+1];
    const samples=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*40);
    for(let j=0;j<=samples;j++) {
      const t=j/samples, x=a[0]+(b[0]-a[0])*t, y=a[1]+(b[1]-a[1])*t;
      const floor=floorAt(x,y,lastH,.75);
      assert.ok(floor, `no floor on segment ${i} at (${x.toFixed(2)},${y.toFixed(2)})`);
      lastH=floor.height;
    }
  }
  assert.ok(lastH>3.5);
});
