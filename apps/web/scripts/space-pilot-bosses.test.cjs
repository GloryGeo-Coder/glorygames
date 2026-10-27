const {test}=require('node:test');const assert=require('node:assert/strict');const path=require('node:path');
const base=path.join(__dirname,'../public/games/space-pilot-platformer');
const bosses=require(path.join(base,'campaign-bosses.js'));const progress=require(path.join(base,'pilot-progress.js'));
for(const file of ['asterion','vulcanis','luminara','cryon','verdantis','novax'])test(`${file}: every mission has a persistent end guardian`,()=>{
 const chapter=require(path.join(base,file+'.js')),levels=bosses.prepare(chapter),names=new Set();
 for(let i=0;i<5;i++){
  const original=chapter.createLevel(i),world=bosses.build(chapter,levels,i),boss=world.enemies.find(e=>e.type==='boss');
  assert.ok(boss&&boss.alive&&boss.hp>0);assert.ok(world.spec.boss);assert.ok(!names.has(boss.name));names.add(boss.name);
  assert.equal(world.enemies.length,original.enemies.length+(i<4?1:0));
  assert.equal(world.platforms.length,original.platforms.length);assert.equal(world.objectives.length,original.objectives.length);
  if(i<4){const legacy={level:i,point:{platform:0,offset:50},enemies:original.enemies.map(e=>e.hp),objectives:original.objectives.map(()=>true),cores:original.cores.map(()=>true)};const restored=progress.restore(legacy,world,i);assert.ok(restored);assert.equal(boss.hp,boss.maxHp);assert.equal(world.portal.open,false);boss.hp=0;boss.alive=false;legacy.enemies.push(0);progress.restore(legacy,world,i);assert.equal(world.portal.open,true);}
 }
});
