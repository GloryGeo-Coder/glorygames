const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {boot,root}=require('./helpers/kasi-runtime.cjs');
const {build}=require('../../../tools/build-kasi-campaign.cjs');
const savedCampaign=n=>new Map([['wga_kasi_quest_v3_campaign',JSON.stringify({unlocked:n})]]);
const flush=()=>new Promise(r=>setImmediate(r));

test('fresh campaign is collapsed and only its first stage is playable, including direct load requests',async()=>{
 const r=await boot(); const buttons=r.elements.get('levelGrid').children;
 assert.equal(buttons.length,20);assert.equal(buttons[0].disabled,false);assert.ok(buttons.slice(1).every(b=>b.disabled));
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(html,/<details class="campaignPicker">/);assert.doesNotMatch(html,/<details[^>]*\bopen\b/);
 for(const n of [0,2,20,21,NaN,'2',1.5])await assert.rejects(r.loadLevel(n),/unlock/);
 buttons[19].emit('click');await flush();assert.equal(r.state.currentLevel,1);
 await r.startOrRestart();assert.ok(buttons.slice(1).every(b=>b.disabled));
 await r.completeLevel();assert.equal(r.state.unlockedLevel,1);assert.equal(r.saved.has('wga_kasi_quest_v3_campaign'),false);
});

test('legacy completions migrate to the next stage and retain every economy field',async()=>{
 const saved=new Map([['wga_kasi_quest_v3_stars','{"1":3,"8":2}'],['wga_kasi_quest_v3_wallet','83'],['wga_kasi_quest_v3_best','21000'],['wga_kasi_quest_v3_upgrades','{"shield":2,"doubleJump":1}']]);
 const r=await boot({saved});assert.equal(r.state.unlockedLevel,9);assert.equal(r.state.currentLevel,9);
 assert.equal(r.state.wallet,83);assert.equal(r.state.upgrades.shield,2);assert.equal(r.state.stars[8],2);
 assert.equal(r.elements.get('levelGrid').children[8].disabled,false);assert.equal(r.elements.get('levelGrid').children[9].disabled,true);
 assert.equal(saved.get('wga_kasi_quest_v3_best'),'21000');
});

for(const bad of ['null','[]','{"unlocked":"20"}','{"unlocked":-10}','{"unlocked":1.5}']) test(`invalid progression ${bad} cannot bypass stage one`,async()=>{
 const r=await boot({saved:new Map([['wga_kasi_quest_v3_campaign',bad],['wga_kasi_quest_v3_stars','{"20":99,"8":-3}']])});
 assert.equal(r.state.unlockedLevel,1);assert.equal(r.state.currentLevel,1);
});

test('cleared gate unlocks exactly the next stage, persists across reload, and permits replays',async()=>{
 const r=await boot();await r.startOrRestart();
 while(r.state.level.coins.length)r.collectCoin(0);
 r.state.level.collectibles.forEach((_,i)=>r.collectCollectible(i));r.state.enemies.forEach(e=>r.defeatEnemy(e,e.x,e.y,true));
 r.state.bosses.forEach(b=>r.hitBoss(b,100));
 // The actual exit collision triggers completion, rather than the menu or a timer.
 Object.assign(r.player,{x:r.state.level.exit.x*32,y:430,onGround:true});r.updatePlayer(1/60);await flush();
 assert.equal(r.state.currentLevel,2);assert.equal(r.state.unlockedLevel,2);
 assert.equal(r.elements.get('levelGrid').children[2].disabled,true);
 const reloaded=await boot({saved:r.saved});assert.equal(reloaded.state.unlockedLevel,2);assert.equal(reloaded.state.currentLevel,2);
 await reloaded.loadLevel(1);assert.equal(reloaded.state.currentLevel,1);await assert.rejects(reloaded.loadLevel(3));
});

test('daily completion never advances campaign progression',async()=>{
 const r=await boot();await r.startDaily();
 while(r.state.level.coins.length)r.collectCoin(0);r.state.level.collectibles.forEach((_,i)=>r.collectCollectible(i));
 r.state.enemies.forEach(e=>r.defeatEnemy(e,e.x,e.y));r.state.bosses.forEach(b=>r.hitBoss(b,100));r.state.switches.forEach(s=>r.pressSwitch(s));
 await r.completeLevel();assert.equal(r.state.unlockedLevel,1);assert.equal(JSON.parse(r.saved.get('wga_kasi_quest_v3_campaign')).unlocked,1);
});

test('route files reproduce exactly, retain original backgrounds and offer spare mission targets',()=>{
 const names=new Set();
 for(let n=1;n<=20;n++){
  const d=JSON.parse(fs.readFileSync(path.join(root,`levels/level-${String(n).padStart(2,'0')}.json`)));
  assert.deepEqual(d,build(n));names.add(d.meta.name);assert.ok(d.w>=280 && d.w>196);
  assert.ok(d.meta.timeLimit>d.meta.parTime);assert.ok(d.coins.length>=d.objective.coinsRequired*1.5);
  assert.ok(d.collectibles.length>=d.objective.collectiblesRequired*1.5);assert.ok(d.enemies.length>d.objective.enemiesRequired);
  assert.ok(d.enemies.filter(e=>e.type==='shooter').length>=5);assert.ok(d.enemies.filter(e=>e.type==='drone').length>=3);
  assert.ok(d.checkpoints.length>=3);assert.ok(d.checkpoints.every(c=>c.x<d.boss.minX));
  assert.ok(fs.existsSync(path.join(root,`assets/backgrounds/level-${String(d.meta.background).padStart(2,'0')}.png`)));
 }
 assert.equal(names.size,20);
});

for(let n=1;n<=20;n++)test(`level ${n}: full terrain route, pickups and locks reachable without upgrades or damage`,async()=>{
 const r=await boot({width:n%2?390:844,height:n%2?844:390,saved:savedCampaign(20)});
 await r.loadLevel(n);await r.startOrRestart();const s=r.state;
 // Isolate terrain from combat. All authored solids, pits, hazards, doors and moving obstacles remain.
 s.enemies.length=0;s.bosses.length=0;
 let reached=false;
 for(let f=0;f<5000;f++){
  const p=r.player,x=p.x+p.w;
  const gap=s.level.solids.filter(a=>a.y===15).some(a=>{const end=(a.x+a.w)*32;return x<=end+2&&x>end-55&&end<s.level.width*32;});
  const hazard=s.level.hazards.some(h=>x<h.x*32+h.w*32&&x>h.x*32-35);
  const taxi=s.obstacles.some(o=>o.type==='taxi'&&o.active&&o.x>x-5&&o.x<x+140);
  r.input.right=true;const jump=p.onGround&&(gap||hazard||taxi);
  r.input.jump=jump||(r.input.jump&&p.jumpHoldT<.16&&p.jumpHeld);
  r.frame();r.calls.length=0;
  if(p.x>=s.level.exit.x*32-24){reached=true;break;}
  if(!r.state.running)break;
 }
 assert.ok(reached,`route blocked at ${r.player.x/32},${r.player.y/32}`);assert.ok(r.player.lives>=3);
 assert.ok(r.state.level.coins.length<=build(n).coins.length-s.level.objective.coinsRequired);
 assert.ok(r.state.level.collectibles.filter(c=>c.taken).length>=s.level.objective.collectiblesRequired);
 assert.ok(r.state.switches.every(sw=>sw.pressed));assert.ok(r.state.doors.every(d=>d.open));
 assert.ok(s.level.checkpoints.every(c=>c.reached));assert.equal(r.state.upgrades.doubleJump,0);
});

test('checkpoint respawn keeps pickups, kills, switches and lives while clearing nearby incoming shots',async()=>{
 const r=await boot({saved:savedCampaign(8)});await r.startOrRestart();
 const cp=r.state.level.checkpoints[0];Object.assign(r.player,{x:cp.x*32,y:430,vy:0,onGround:true});r.updatePlayer(1/60);
 assert.equal(r.state.checkpoint.x,cp.x);r.collectCoin(0);r.collectCollectible(0);const e=r.state.enemies[0];r.defeatEnemy(e,e.x,e.y);r.pressSwitch(r.state.switches[0]);
 const coins=r.state.level.coins.length,wallet=r.state.wallet;
 r.state.enemyProjectiles.push({x:cp.x*32,y:430,w:10,h:10,vx:0,life:2});
 Object.assign(r.player,{x:cp.x*32+900,y:950,invuln:0,shield:0});r.damagePlayer('fall');
 assert.ok(Math.abs(r.player.x-cp.x*32)<10);assert.equal(r.player.lives,2);assert.equal(r.player.onGround,true);
 assert.equal(r.state.level.coins.length,coins);assert.equal(r.state.wallet,wallet);assert.equal(e.alive,false);
 assert.equal(r.state.switches[0].pressed,true);assert.equal(r.state.enemyProjectiles.length,0);
 await r.startOrRestart();assert.equal(r.state.checkpoint,null);assert.ok(r.player.x<100);
});

test('ground enemies stay alive on their authored patrol surfaces over a long encounter',async()=>{
 const r=await boot({saved:savedCampaign(20)});await r.startOrRestart();
 for(const en of r.state.enemies.filter(e=>e.type!=='drone')){
  r.player.x=en.x-200;
  for(let f=0;f<900;f++)r.updateEnemies(1/60);
  assert.ok(en.alive && en.y<480,`${en.id} fell away`);assert.ok(en.x>=en.minX-1 && en.x+en.w<=en.maxX+33);
  r.state.enemyProjectiles.length=0;
 }
});

test('drones hover, warn, lock aim, fire diagonally and pause with the mission',async()=>{
 const r=await boot({width:390,height:844});await r.startOrRestart();const d=r.state.enemies.find(e=>e.type==='drone');
 Object.assign(r.player,{x:d.x-170,y:430});d.shootT=0;r.updateEnemies(1/60);
 assert.ok(d.windup>0);assert.equal(r.state.enemyProjectiles.filter(p=>p.drone).length,0);
 const aim={x:d.aimX,y:d.aimY};r.player.x-=80;r.updateEnemies(.2);assert.equal(d.aimX,aim.x);assert.equal(d.aimY,aim.y);
 r.updateEnemies(.21);const shot=r.state.enemyProjectiles.find(p=>p.drone);assert.ok(shot);assert.ok(shot.vy>0);assert.ok(shot.vx<0);
 assert.ok(Math.abs(Math.hypot(shot.vx,shot.vy)-280)<.01);assert.ok(Math.abs(d.y-d.hoverY)<=8);
 const before={x:d.x,y:d.y,shootT:d.shootT};r.setPaused(true);for(let i=0;i<60;i++)r.frame();assert.deepEqual({x:d.x,y:d.y,shootT:d.shootT},before);
});

test('drone shots damage the player and player shots defeat drones once',async()=>{
 const r=await boot();await r.startOrRestart();const d=r.state.enemies.find(e=>e.type==='drone');
 Object.assign(d,{x:250,y:430,w:40,h:26,hp:1});Object.assign(r.player,{x:120,y:430,face:1,invuln:0,shield:0});
 r.shoot();for(let i=0;i<15;i++)r.updateProjectiles(1/60);assert.equal(d.alive,false);
 const score=r.state.score;r.defeatEnemy(d,d.x,d.y);assert.equal(r.state.score,score);
 r.state.enemyProjectiles.push({x:r.player.x,y:r.player.y,w:10,h:10,vx:0,vy:0,life:2,drone:true});r.updateProjectiles(1/60);assert.equal(r.player.lives,2);
});

test('hold-to-fire repeats at the existing cooldown; distant actors do not flood projectiles',async()=>{
 const r=await boot();await r.startOrRestart();r.input.action=true;
 for(let i=0;i<90;i++){r.frame();r.calls.length=0;}
 assert.ok(r.state.projectiles.length>=2);assert.ok(r.state.projectiles.length<=4);assert.equal(r.state.bosses[0].shootT,.8);
 for(const e of r.state.enemies){e.shootT=0;r.player.x=e.x-100;r.updateEnemies(.5);}
 assert.ok(r.state.enemyProjectiles.length<=40);
});

test('out-of-time recovery has a readable thirty-second grace period instead of rapid repeated deaths',async()=>{
 const r=await boot();await r.startOrRestart();r.state.level.meta.timeLimit=.01;r.player.invuln=0;r.updateGameplay(.02);
 assert.equal(r.player.lives,2);assert.equal(r.state.timeGrace,30);
 for(let i=0;i<150;i++)r.frame();assert.equal(r.player.lives,2);
});

test('new boss atlas renders in combat and old opaque boss art is never requested, including fallback',async()=>{
 for(const failAtlases of [[],['boss']]){
  const r=await boot({failAtlases});await r.startOrRestart();const b=r.state.bosses[0];Object.assign(r.player,{x:b.x-160,y:430});r.calls.length=0;r.render();
  assert.ok(!r.requests.some(url=>url.endsWith('/sprites/boss.png')));
  if(!failAtlases.length)assert.ok(r.calls.some(c=>c[0]==='drawImage'&&c[1].url.includes('/animation/boss-')));
  else assert.ok(r.calls.some(c=>c[0]==='fillRect'&&c[2]===b.h*.1));
 }
});
