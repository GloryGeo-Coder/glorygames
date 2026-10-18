const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {boot,root}=require('./helpers/kasi-runtime.cjs');const {rgba}=require('./helpers/kasi-png.cjs');
const A=require('../public/games/kasi-quest/kasi-animation.js');const R=require('../public/games/kasi-quest/kasi-enemies.js');
const {build}=require('../../../tools/build-kasi-campaign.cjs');const kinds=Object.keys(R.roles);
const saved=()=>new Map([['wga_kasi_quest_v3_campaign','{"unlocked":20}']]);
const tick=(r,count,dt=1/60)=>{for(let i=0;i<count;i++){r.updateEnemies(dt);r.updateActorAnimations(dt);}};
async function encounter(type,options={}){
 const r=await boot({saved:saved(),...options});await r.startOrRestart();const e=r.state.enemies.find(e=>e.type===type);assert.ok(e,type);
 r.state.enemies.splice(0,r.state.enemies.length,e);r.state.bosses.length=0;r.state.obstacles.length=0;r.state.doors.length=0;r.state.switches.length=0;
 r.state.level.solids=[{x:0,y:15,w:500,h:3}];r.state.level.hazards=[];
 Object.assign(e,{x:600,y:480-e.h,minX:320,maxX:1040,dir:-1,vx:0,vy:0});R.init(e);e.ai.cooldown=0;
 Object.assign(r.player,{x:500,y:430,vx:0,vy:0,invuln:0,onGround:true,shield:0});return {r,e};
}

test('four human roles enter progressively and later mixes retain bots, drones, route geometry and objective quotas',()=>{
 const first={sprinter:2,warden:5,thrower:8,ranger:12};
 // Golden v3.3 geometry, obstacle, boss and quota fingerprints; independent of current generator.
 const baselines=["fe375f26d6b5a8a14fbf8f22af5b5fbefc9298055ebc1f687bd73237d1a30e0a","fb2e34ecc3d963f46dd9234aaf9a2f24b171b71acee126f5a2092d987112e5e3","780d25d44091c15ac1310262e600a40c4ad61920ec10e29835267e030299a50c","e5b401266f7b3202303a4f2c209c69b8dba790b88e9cf9cda54f1fbcb5a91a57","713d659c03ea6e0b964e74e43d58ad3aeef0abf73d3c98ae8cf25cffd9a0b2e7","7592a8ee0957d9bc1eb0dc5764a78f05bca009591fa92ff6f5656625f805a5ee","13fe667d9845fcac06e723014c10dd154d17cb3fa52b0cb6eaf584d3d7e36858","71880efb74d746f5897a2e27e902decf4084baede59691be04781ddd5c277834","d82317bc55c4d5d95f3d77dde0b38018d41767a255c595562674704b4bf35434","a8e9f4a60bd6617c376029f137b0298d6dc10af50f22b5b6d7660102ad976294","5000c35e2a53121a2aac00721ddd71e28278b788c3f16bb5c68c80e9220a0864","7a30656ee264e403a2f78651b5ef8d50cb242eb45fa49747e54c934d652045ec","1001451954313ecc5b75dd9ca8cac48d3870bb5c1f1a5ade6bfcc9e9ab4642f0","073b5eb29f3dab2c3ee8718b11aaca019b50f0b56f3f493f303aa29d913cdf18","8472f6f5890793956f129dc5a25a46adc760a8b1f6f8563b8cdbb31aef7b1775","89e50538722f1a3910e3cabccce1866591485a07d64ec1ac4630b9e36de6afa1","c42c72c33e42c460077fd9158e12c2623c165f29c97267c8e17f61e6c473e995","7baf52229489ce7768e6a74ab4eabe1153cb9a8c88d3028c163b4f33d0f1d0e6","2b31c4747f3fe6466773ce86e42bf4d64f7a0bf51211ad9b66c15e7004380f8f","2f4a2646ef3f5363f3e17b8550d02832fd1627930d996ce40020459c01fe0c06"];
 for(let n=1;n<=20;n++){
  const d=build(n),shape={};
  for(const key of ["w","h","solids","hazards","coins","collectibles","obstacles","checkpoints","doors","switches","boss"])shape[key]=d[key];shape.enemyCount=d.enemies.length;shape.enemiesRequired=d.objective.enemiesRequired;
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(shape)).digest('hex'),baselines[n-1],'unchanged terrain and quotas '+n);
  assert.ok(d.enemies.some(e=>e.type==='drone'));assert.ok(d.enemies.some(e=>e.type==='shooter'));
  for(const kind of kinds){assert.equal(R.roles[kind].firstLevel,first[kind]);if(n<first[kind])assert.ok(!d.enemies.some(e=>e.type===kind));if(n>=first[kind])assert.ok(d.enemies.some(e=>e.type===kind),`${n}: ${kind}`);}
  if(n>=2)assert.ok(d.meta.encounterNote?.length>30);
 }
});

test('80 new poses preserve genuine alpha, source hashes, isolated crops, animation clips and a 48 MiB total actor budget',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/animation/roster-manifest.json')));let decoded=Object.values(A.data.atlases).reduce((sum,a)=>sum+a.width*a.height*4,0),frames=0;
 for(const kind of kinds){const info=A.roster.atlases[kind],entry=manifest.assets.find(a=>a.kind===kind),png=fs.readFileSync(path.join(root,info.url)),image=rgba(path.join(root,info.url));
  assert.equal(crypto.createHash('sha256').update(png).digest('hex'),entry.sha256);assert.equal(image.w,info.width);assert.equal(image.h,info.height);assert.ok(image.out[3]<=2);
  let transparent=0;for(let i=3;i<image.out.length;i+=4)if(image.out[i]<=2)transparent++;assert.ok(transparent/(image.w*image.h)>.4);
  const covered=new Uint8Array(image.w*image.h);
  const hashes=new Set();for(const frame of info.frames){const [x,y,w,h]=frame.crop;assert.ok(x>=0&&y>=0&&x+w<=image.w&&y+h<=image.h);
   const mask=new Set();for(const [xx,yy,ww,hh]of frame.exclude||[])for(let my=yy;my<yy+hh;my++)for(let mx=xx;mx<xx+ww;mx++)mask.add(my*w+mx);
   const hash=crypto.createHash('sha256');for(let yy=y;yy<y+h;yy++){hash.update(image.out.subarray((yy*image.w+x)*4,(yy*image.w+x+w)*4));for(let xx=x;xx<x+w;xx++)if(!mask.has((yy-y)*w+xx-x))covered[yy*image.w+xx]=1;}hashes.add(hash.digest('hex'));
   for(const [xx,yy,ww,hh]of frame.exclude||[])assert.ok(xx>=0&&yy>=0&&xx+ww<=w&&yy+hh<=h);
  }
  let foreground=0,missing=0;for(let pixel=0;pixel<covered.length;pixel++)if(image.out[pixel*4+3]>180){foreground++;if(!covered[pixel])missing++;}
  assert.ok(missing/foreground<.005,kind+' retains disconnected heads/hair/accessories');
  assert.equal(hashes.size,20);frames+=info.frames.length;decoded+=image.w*image.h*4;
  for(const spec of Object.values(info.clips))assert.ok(spec.start+spec.count<=20&&spec.fps>0);
  assert.ok(info.frames[19].content[3]<info.referenceHeight*.7);
  assert.equal(entry.mode,'built-in image_gen');assert.ok(entry.prompt.includes('HUMAN')||entry.prompt.includes('human'));
 }
 assert.equal(frames,80);assert.ok(decoded<48*1024*1024);
});

test('role artwork loads only when used and is released on replay/daily; returning reloads released atlases',async()=>{
 const r=await boot({saved:saved()});assert.equal(r.animation.loadedKinds().length,7);const initial=r.requests.filter(u=>u.includes('/warden-')).length;
 await r.loadLevel(2);assert.deepEqual([...r.animation.loadedKinds()].sort(),['boss','enemy','player','sprinter']);
 await r.loadLevel(1);assert.deepEqual([...r.animation.loadedKinds()].sort(),['boss','enemy','player']);
 await r.loadLevel(20);assert.equal(r.requests.filter(u=>u.includes('/warden-')).length,initial+1);
 await r.startDaily();assert.deepEqual([...r.animation.loadedKinds()].sort(),['boss','enemy','player']);
 const fresh=await boot();assert.equal(fresh.requests.filter(u=>/\/(sprinter|warden|thrower|ranger)-/.test(u)).length,0);
});

test('every new clip preserves body geometry, foot placement, facing and reduced-motion behavior',()=>{
 const a=A.create();for(const kind of kinds){const e={id:'rival-'+kind,x:20,y:40,w:34,h:54,vx:100,dir:-1,alive:true};
  for(const name of ['idle','run','windup','shoot','hurt','defeat']){
   a.reset(e);a.play(e,kind,name,-1);a.update(e,kind,.1);const rect=a.rect(e,kind,e),frame=A.roster.atlases[kind].frames[rect.pose.frame];
   assert.equal(rect.pose.face,-1);assert.ok(Math.abs(rect.w/rect.h-rect.crop[2]/rect.crop[3])<1e-8);
   assert.ok(Math.abs(rect.y+(frame.content[1]-frame.crop[1]+frame.content[3])*rect.scale-e.y-e.h)<1e-8);
  }
  a.reset(e);e.vx=0;a.reduceMotion(true);a.update(e,kind,2);assert.equal(a.snapshot(e,kind).frame,0);
 }
});

for(const kind of kinds)test(`${kind}: failed artwork retains a playable human fallback while other characters stay animated`,async()=>{
 const {r,e}=await encounter(kind,{failAtlases:[kind]});assert.equal(r.animation.has(kind),false);assert.ok(kinds.filter(k=>k!==kind).every(k=>r.animation.has(k)));
 r.calls.length=0;r.render();assert.ok(r.calls.some(c=>c[0]==='arc'));assert.equal(r.state.running,true);
 assert.ok(!r.calls.some(c=>c[0]==='drawImage'&&c[1].url.endsWith('/sprites/enemy.png')));r.updateEnemies(1/60);assert.equal(e.ai.phase,'windup');
});

test('runner warns before dashing, commits to the chosen direction and exposes a recovery window',async()=>{
 const {r,e}=await encounter('sprinter');r.updateEnemies(1/60);const x=e.x;assert.equal(e.ai.phase,'windup');assert.equal(e.vx,0);
 tick(r,20);assert.equal(e.x,x);r.player.x=950;tick(r,12);assert.equal(e.ai.phase,'attack');assert.ok(e.x<x);assert.equal(e.dir,-1);
 tick(r,30);assert.equal(e.ai.phase,'recover');const stopped=e.x;tick(r,15);assert.equal(e.x,stopped);
});

test('warden blocks two frontal shots then staggers; rear shots and successive stomps are effective',async()=>{
 const {r,e}=await encounter('warden');e.ai.cooldown=999;const hp=e.hp;
 r.hitEnemy(e,{vx:760,damage:1});assert.equal(e.hp,hp);assert.equal(e.ai.blocks,1);
 r.hitEnemy(e,{vx:760,damage:1});assert.equal(e.hp,hp);assert.equal(e.ai.phase,'recover');
 r.hitEnemy(e,{vx:760,damage:1});assert.equal(e.hp,hp-1);assert.equal(r.animation.snapshot(e,'warden').clip,'hurt');
 r.hitEnemy(e,{vx:-760,damage:100});assert.equal(e.alive,false);
 const next=await encounter('warden');Object.assign(next.r.player,{x:next.e.x+4,y:next.e.y-44,vy:300});next.r.handleEnemyPlayerCollisions();
 assert.equal(next.e.hp,1);assert.equal(next.e.ai.phase,'recover');assert.ok(next.r.player.vy<0);
 Object.assign(next.r.player,{x:next.e.x+4,y:next.e.y-44,vy:300});next.r.handleEnemyPlayerCollisions();assert.equal(next.e.alive,false);
});

test('thrower charge follows gravity and bursts once, with a visible radius and bounded lifetime',async()=>{
 const {r,e}=await encounter('thrower');tick(r,50);const shot=r.state.enemyProjectiles.find(p=>p.role==='spark');assert.ok(shot);assert.ok(shot.vy<0);
 const y=shot.y;r.player.x=1200;for(let i=0;i<10;i++)r.updateProjectiles(1/60);assert.ok(shot.y<y);
 let burst=false;for(let i=0;i<100;i++){r.updateProjectiles(1/60);if(shot.burst){burst=true;break;}}
 assert.ok(burst);assert.equal(shot.w,96);assert.equal(shot.h,96);
 Object.assign(r.player,{x:shot.x+32,y:shot.y+32,invuln:0,shield:1});r.updateProjectiles(.01);assert.equal(r.player.shield,0);assert.equal(r.player.lives,3);
 r.player.invuln=0;r.updateProjectiles(.01);assert.equal(r.player.lives,3); // each burst applies damage once
 for(let i=0;i<20;i++)r.updateProjectiles(1/60);assert.ok(!r.state.enemyProjectiles.includes(shot));
});

test('ranger gives an aiming window, locks its trajectory and fires one non-homing shot',async()=>{
 const {r,e}=await encounter('ranger');r.updateEnemies(1/60);assert.equal(e.ai.phase,'windup');const aim={x:e.ai.aimX,y:e.ai.aimY};
 tick(r,45);assert.equal(r.state.enemyProjectiles.filter(p=>p.role==='ranger').length,0);
 r.player.y=220;r.player.x=950;tick(r,14);const shots=r.state.enemyProjectiles.filter(p=>p.role==='ranger');assert.equal(shots.length,1);
 assert.equal(shots[0].vx,aim.x*410);assert.equal(shots[0].vy,aim.y*410);const vx=shots[0].vx,vy=shots[0].vy;
 r.player.x=100;r.updateProjectiles(.01);assert.equal(shots[0].vx,vx);assert.equal(shots[0].vy,vy);
});

test('an interrupted windup cannot fire after a hit; hostile projectiles remain capped',async()=>{
 for(const kind of ['thrower','ranger']){
  const {r,e}=await encounter(kind);r.updateEnemies(1/60);assert.equal(e.ai.phase,'windup');r.hitEnemy(e,{vx:-760,damage:1});tick(r,50);
  assert.equal(r.state.enemyProjectiles.length,0);assert.ok(['recover','patrol'].includes(e.ai.phase));
  e.ai.phase='windup';e.ai.timer=.001;r.state.enemyProjectiles.push(...Array.from({length:40},()=>({x:0,y:0,w:1,h:1,vx:0,life:1})));
  r.updateEnemies(1/60);assert.equal(r.state.enemyProjectiles.length,40);
 }
});

for(const kind of kinds)test(`${kind}: real player projectile damage, defeat pose and one-time reward remain consistent`,async()=>{
 const {r,e}=await encounter(kind);e.dir=1;e.hp=1;e.ai.cooldown=999;
 r.player.x=e.x-120;r.player.face=1;r.shoot();for(let i=0;i<15;i++)r.updateProjectiles(1/60);
 assert.equal(e.alive,false);assert.equal(r.animation.snapshot(e,kind).clip,'defeat');const score=r.state.score;
 r.hitEnemy(e,{damage:100,vx:760});r.defeatEnemy(e,e.x,e.y);assert.equal(r.state.score,score);
 Object.assign(r.player,{x:e.x,y:e.y,invuln:0});const lives=r.player.lives;r.handleEnemyPlayerCollisions();assert.equal(r.player.lives,lives);
 r.updateActorAnimations(.7);assert.equal(r.animation.finished(e,kind),true);
});

test('phone multi-touch remains responsive with mixed rivals; pause freezes all new attack timers',async()=>{
 const {r,e}=await encounter('ranger',{width:390,height:844});r.updateEnemies(1/60);const timer=e.ai.timer;
 r.setPaused(true);for(let i=0;i<30;i++)r.frame();assert.equal(e.ai.timer,timer);
 r.setPaused(false);r.elements.get('btnRight').emit('pointerdown',{pointerId:11});r.elements.get('btnJump').emit('pointerdown',{pointerId:12});r.elements.get('btnAction').emit('pointerdown',{pointerId:13});r.frame();
 assert.ok(r.player.vx>0&&r.player.vy<0&&r.state.projectiles.length>0);assert.equal(r.captures.size,3);
 r.win.emit('orientationchange');assert.equal(r.state.paused,true);assert.equal(r.captures.size,0);
});

test('legacy campaign saves, checkpoint recovery and daily mode remain independent of the roster',async()=>{
 const state=new Map([['wga_kasi_quest_v3_stars','{"8":2}'],['wga_kasi_quest_v3_wallet','41'],['wga_kasi_quest_v3_upgrades','{"fireRate":2,"shield":1}']]);
 const r=await boot({saved:state});assert.equal(r.state.currentLevel,9);assert.equal(r.state.unlockedLevel,9);assert.equal(r.state.wallet,41);
 await r.startOrRestart();const cp=r.state.level.checkpoints[0];Object.assign(r.player,{x:cp.x*32,y:430,onGround:true,vy:0});r.updatePlayer(1/60);
 r.player.shield=0;r.player.invuln=0;r.damagePlayer();assert.ok(Math.abs(r.player.x-cp.x*32)<10);assert.equal(r.state.upgrades.fireRate,2);
 await r.startDaily();assert.equal(r.state.unlockedLevel,9);assert.ok(r.animation.loadedKinds().every(k=>!kinds.includes(k)));
});

test('legacy runner bots keep their patrol animation and behavior',async()=>{
 const r=await boot();await r.startOrRestart();const e=r.state.enemies[0];e.type='runner';
 assert.equal(e.ai,undefined);const x=e.x;r.updateEnemies(1/60);r.updateActorAnimations(1/60);
 assert.equal(r.actorKind(e),'enemy');assert.equal(r.animation.has('enemy'),true);assert.ok(e.x!==x);
});

test('spark burst damage matches its drawn circle and never harms a player outside it',async()=>{
 const {r}=await encounter('thrower');const burst={x:500,y:350,w:96,h:96,vx:0,vy:0,life:.18,role:'spark',burst:true,hit:false};r.state.enemyProjectiles.push(burst);
 Object.assign(r.player,{x:590,y:440,invuln:0,shield:0});r.updateProjectiles(.01);assert.equal(r.player.lives,3);assert.equal(burst.hit,false);
 Object.assign(r.player,{x:540,y:390});r.updateProjectiles(.01);assert.equal(r.player.lives,2);assert.equal(burst.hit,true);
});
