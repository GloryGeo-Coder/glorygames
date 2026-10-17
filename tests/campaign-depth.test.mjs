import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGN_DEPTH, buildCampaignDepth, enemyMaxHp, enemyCooldown, droneOffset } from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/campaign-depth.mjs';
const root='../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d';
const worlds=['garden','crystal','storm','solar'];
const modules=Object.fromEntries(await Promise.all(worlds.map(async key=>{
 const path=key==='garden'?root+'/world-logic.mjs':`${root}/${key}/world-logic.mjs`;
 return [key,await import(path)];
})));

for (const world of worlds) {
  const level=modules[world];
  const extra=CAMPAIGN_DEPTH[world];
  test(`${world}: retains the original level and adds two visible collectible side routes`,()=>{
    assert.equal(extra.islands.length,2);
    assert.equal(extra.bridges.length,2);
    assert.equal(extra.relics.length,2);
    assert.equal(level.relics.length,5);
    assert.equal(level.islands.length,world==='garden'?7:6);
    assert.equal(level.bridges.length,5);
    assert.equal(extra.enemies.length,3);
    assert.equal(new Set(level.islands.map(i=>i.id)).size,level.islands.length);
    assert.equal(new Set(level.relics.map(i=>i.id)).size,level.relics.length);
  });
  test(`${world}: extra bridge samples have continuous, climbable collision floors`,()=>{
    for(const b of extra.bridges){
      assert.ok(b.width>=2.7);
      for(let i=0;i<=60;i++){
        const t=i/60,[ax,ay,ah]=b.from,[bx,by,bh]=b.to;
        const x=ax+(bx-ax)*t,y=ay+(by-ay)*t,h=ah+(bh-ah)*t;
        const floor=level.floorAt(x,y,h,.65);
        assert.ok(floor,`${world}:${b.id} t=${t} has no floor`);
        assert.ok(Math.abs(floor.height-h)<=.65,`${world}:${b.id}: unexpected step at ${t}`);
      }
    }
  });
  test(`${world}: each detour connects to the older route and the new relic sits on its own island`,()=>{
    const originals=level.islands.slice(0,-extra.islands.length);
    for (let i=0;i<extra.islands.length;i++){
      const island=extra.islands[i], bridge=extra.bridges[i],relic=extra.relics[i];
      const [ax,ay,ah]=bridge.from,[bx,by,bh]=bridge.to;
      assert.ok(originals.some(p=>Math.hypot(ax-p.x,ay-p.y)<=p.r+.05 && Math.abs(ah-p.h)<.01),`original route not joined: ${world}:${bridge.id}`);
      assert.ok(Math.hypot(bx-island.x,by-island.y)<=island.r+.05,`side island is disconnected: ${world}:${island.id}`);
      assert.ok(Math.abs(bh-island.h)<.01);
      assert.ok(Math.hypot(relic.x-island.x,relic.y-island.y)<=island.r-1,`relic near dangerous edge: ${world}:${relic.id}`);
      assert.equal(level.floorAt(relic.x,relic.y)?.id,island.id);
    }
    // These excursions meaningfully increase traversable distance instead of
    // silently adding collectibles along the old main path.
    const detourDistance=extra.islands.reduce((total,island,i)=>{
      const [ax,ay]=extra.bridges[i].from;
      const source=originals.find(p=>Math.hypot(p.x-ax,p.y-ay)<=p.r+.05);
      return total+Math.hypot(source.x-island.x,source.y-island.y);
    },0);
    assert.ok(detourDistance>18,`${world} detours not long enough: ${detourDistance}`);
  });
  test(`${world}: added drone encounters are on supported platforms with staggered timing`,()=>{
    const phases=extra.enemies.map(e=>e.phase);
    assert.deepEqual(phases,[4.1,6.4,9.1]);
    for(const enemy of extra.enemies){
      assert.ok(level.floorAt(enemy.x,enemy.y),`enemy ${enemy.name} off the level`);
      assert.ok(['skimmer','bulwark'].includes(enemy.role));
    }
  });
  test(`${world}: game and menu point to five relics but preserve touch controls`,()=>{
    const dir=world==='garden'?`${root}/`:`${root}/${world}/`;
    const html=readFileSync(new URL(dir+'index.html',import.meta.url),'utf8');
    const game=readFileSync(new URL(dir+'game.js',import.meta.url),'utf8');
    assert.match(html,/0 \/ 5<\/b>/);
    assert.match(html,/game\.js\?v=0\.13/);
    assert.match(game,/buildCampaignDepth\(B, scene/);
    assert.match(game,/CAMPAIGN_DEPTH\.(garden|crystal|storm|solar)\.enemies/);
    for(const name of ['joystickPad','jumpBtn','glideBtn','blastBtn','createHeroAnimator','resetGame'])assert.ok(game.includes(name),`${world}: missing ${name}`);
    for(const bad of [/\ball three relics\b/i,/\bfind the three relics\b/i])assert.doesNotMatch(game,bad);
  });
}

test('enemy variety is readable and balanced for phone combat',()=>{
  assert.equal(enemyMaxHp('skimmer'),2);
  assert.equal(enemyMaxHp('bulwark'),4);
  assert.equal(enemyMaxHp('scout'),3);
  assert.ok(enemyCooldown('bulwark')>enemyCooldown('skimmer'));
  assert.ok(enemyCooldown('skimmer')>=3.2);
  const a=droneOffset('skimmer',2,1,false),b=droneOffset('bulwark',2,1,false);
  assert.notDeepEqual(a,b);
  assert.equal(droneOffset('skimmer',2,1,true).h,0);
});

test('expedition islands generate only lightweight built-in meshes without new network dependencies',()=>{
  let meshCount=0, materialCount=0;
  class Mesh { constructor(name){ this.name=name;this.position={};this.rotation={};this.scaling={}; meshCount+=1; } dispose(){} }
  class Material { constructor(){ materialCount+=1;this.diffuseColor={};this.emissiveColor={}; } dispose(){} }
  const mesh={ CreateCylinder:name=>new Mesh(name),CreateBox:name=>new Mesh(name),CreateTorus:name=>new Mesh(name),CreatePolyhedron:name=>new Mesh(name) };
  const B={ MeshBuilder:mesh, StandardMaterial:Material, Color3:{FromHexString:c=>c},Vector3:class{constructor(x,y,z){this.x=x;this.y=y;this.z=z;}} };
  for(const key of worlds){
    const prior=meshCount;
    const graphics=buildCampaignDepth(B,{},key);
    assert.equal(graphics.meshCount,16);
    assert.equal(meshCount-prior,16);
    graphics.dispose();
  }
  assert.equal(materialCount,4*4);
});
