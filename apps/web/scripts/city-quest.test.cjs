const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {boot,root}=require('./helpers/city-runtime.cjs');
const saveKey='gg_city_quest_guardian_save_v2',bestKey='gg_city_quest_guardian_best_v2';
const savedAt=n=>new Map([[saveKey,JSON.stringify({unlockedLevels:10,levelIndex:n})]]);
const wait=()=>new Promise(r=>setImmediate(r));

for(const [width,height] of [[320,568],[390,844],[430,932],[568,320],[844,390],[1366,768]])test(`viewport ${width}x${height}: character remains readable, pixel budget and vertical safe region hold`,async()=>{
 const r=await boot({width,height});r.startGame();r.frame();
 assert.ok(r.player.h*r.scale>=43);assert.ok(r.elements.get('gameCanvas').width*r.elements.get('gameCanvas').height<=3005000);
 r.player.y=320;r.computeCamera();assert.ok((r.player.y-r.cameraY)*r.scale>=100);
 r.resize(height,width);assert.equal(r.win.visualViewport.height,width);
});

test('multi-touch movement survives unrelated release, held fire repeats, and cancel releases only its owner',async()=>{
 const r=await boot();r.startGame();const el=id=>r.elements.get(id);
 el('leftBtn').emit('pointerdown',{pointerId:1});el('shootBtn').emit('pointerdown',{pointerId:2});el('jumpBtn').emit('pointerdown',{pointerId:3});
 const x=r.player.x;for(let i=0;i<15;i++)r.update(1/120);assert.ok(r.player.x<x);
 el('jumpBtn').emit('pointerup',{pointerId:3});const still=r.player.x;for(let i=0;i<80;i++)r.update(1/120);
 assert.ok(r.player.x<still);assert.ok(r.game.projectiles.length>=2);
 el('shootBtn').emit('pointercancel',{pointerId:2});el('leftBtn').emit('lostpointercapture',{pointerId:1});r.update(1/120);assert.equal(r.player.vx,0);
});

test('opposing fingers cancel, lifting either restores the remaining direction',async()=>{
 const r=await boot();r.startGame();r.elements.get('leftBtn').emit('pointerdown',{pointerId:1});r.elements.get('rightBtn').emit('pointerdown',{pointerId:2});r.update(1/120);assert.equal(r.player.vx,0);
 r.elements.get('rightBtn').emit('pointerup',{pointerId:2});r.update(1/120);assert.ok(r.player.vx<0);
});

for(const event of ['blur','pagehide','visibilitychange'])test(`${event}: pauses safely and clears movement and fire`,async()=>{
 const r=await boot();r.startGame();r.win.emit('keydown',{code:'ArrowRight'});r.elements.get('shootBtn').emit('pointerdown',{pointerId:4});
 if(event==='visibilitychange'){r.doc.hidden=true;r.doc.emit(event);}else r.win.emit(event);
 assert.equal(r.state.paused,true);assert.equal(Object.keys(r.keys).length,0);const x=r.player.x;r.update(.1);assert.equal(r.player.x,x);
 r.setPaused(false);r.update(1/120);assert.equal(r.player.vx,0);
});

test('jump buffer and coyote time support forgiving jumps without repeat jumping in air',async()=>{
 const r=await boot();r.startGame();r.game.enemies=[];r.player.y=505;r.player.onGround=false;r.player.vy=100;r.jump();r.update(.03);assert.ok(r.player.vy<0);
 const v=r.player.vy;r.jump();assert.equal(r.player.vy,v);
 r.loadLevel(0);r.game.enemies=[];r.update(1/120);r.player.x=623;r.player.onGround=false;r.update(1/120);r.jump();assert.ok(r.player.vy<0);
});

test('falling costs one life and returns to safe checkpoint without losing pickups or shield',async()=>{
 const r=await boot();r.startGame();r.game.enemies=[];
 const cp=r.levelDefs[0].checkpoints[1];Object.assign(r.player,{x:cp.x,y:cp.y,vy:0});r.applyPhysics(1/120);assert.equal(r.checkpoint.index,1);
 r.game.coins[0].taken=true;r.state.coins=12;r.game.objectiveCount=3;r.player.shield=1;r.player.invuln=1;r.player.y=1000;r.applyPhysics(1/120);
 assert.equal(r.state.lives,2);assert.equal(r.player.x,cp.x);assert.equal(r.player.y,cp.y);assert.equal(r.player.shield,1);assert.equal(r.game.coins[0].taken,true);assert.equal(r.game.objectiveCount,3);
 for(let i=0;i<300;i++)r.update(1/120);assert.equal(r.state.lives,2);
});

test('normal shield contact absorbs one hit and invulnerability prevents stacked damage',async()=>{
 const r=await boot();r.startGame();r.player.shield=1;r.loseLife();assert.equal(r.player.shield,0);assert.equal(r.state.lives,3);r.loseLife();assert.equal(r.state.lives,3);
 r.player.invuln=0;r.loseLife();r.loseLife();assert.equal(r.state.lives,2);
});

test('existing progress, currency, outfit and record survive reload; locked levels stay locked',async()=>{
 const saved=new Map([[saveKey,JSON.stringify({levelIndex:4,unlockedLevels:5,coins:86,score:1234,best:9000,skin:'hero_shadow'})],[bestKey,'12000']]);
 const r=await boot({saved});r.startGame();assert.equal(r.state.levelIndex,4);assert.equal(r.state.coins,86);assert.equal(r.state.skin,'hero_shadow');assert.equal(r.state.best,12000);
 r.loadLevel(9);assert.equal(r.state.levelIndex,4);assert.ok(r.elements.get('mapGrid').children.slice(5).every(el=>el.disabled));r.saveState();
 const again=await boot({saved});assert.equal(again.state.skin,'hero_shadow');assert.equal(again.state.coins,86);
});

for(const raw of ['null','[]','{broken','{"levelIndex":99,"unlockedLevels":-1,"score":-50,"coins":-6,"skin":"wrong"}'])test(`malformed save recovers: ${raw}`,async()=>{
 const r=await boot({saved:new Map([[saveKey,raw]])});r.startGame();assert.equal(r.state.levelIndex,0);assert.equal(r.state.unlockedLevels,1);assert.equal(r.state.skin,'hero_blue');assert.ok(r.state.score>=0&&r.state.coins>=0);
});

test('unavailable storage does not prevent play or pause',async()=>{
 const r=await boot({failLevels:true});r.startGame();r.saveState();r.setPaused(true);assert.equal(r.state.paused,true);
});

test('outfits retain coin requirements and selection is available in the pause menu',async()=>{
 const r=await boot();r.startGame();r.setSkin('hero_shadow');assert.equal(r.state.skin,'hero_blue');r.state.coins=60;r.setSkin('hero_shadow');assert.equal(r.state.skin,'hero_shadow');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(html.indexOf('id="pauseOverlay"')<html.indexOf('id="skinWindow"'));assert.match(html,/id="resumeBtn"/);
});

test('guide, collectible quota and living boss each independently gate completion',async()=>{
 const r=await boot({saved:savedAt(5)});r.startGame();const lv=r.levelDefs[5];Object.assign(r.player,lv.exit);r.game.objectiveCount=lv.target;
 assert.equal(r.canCompleteAtExit(),false);r.game.missionAccepted=true;assert.equal(r.canCompleteAtExit(),false);r.game.boss.alive=false;assert.equal(r.canCompleteAtExit(),true);
 r.game.objectiveCount=lv.target-1;assert.equal(r.canCompleteAtExit(),false);
});

test('completion unlocks only the next mission, and closing its map restores the completion card',async()=>{
 const r=await boot();r.startGame();r.completeLevel();assert.equal(r.state.unlockedLevels,2);const score=r.state.score;r.completeLevel();assert.equal(r.state.score,score);
 r.openMap();r.closeMap();assert.equal(r.elements.get('levelOverlay').classList.contains('active'),true);r.nextLevel();assert.equal(r.state.levelIndex,1);assert.equal(r.game.levelComplete,false);
});

test('spike strips can be cleared with the shipped jump and ordinary speed',async()=>{
 const r=await boot();r.startGame();r.game.platforms=[{x:0,y:590,w:1000,h:130,prevX:0,prevY:590}];r.game.enemies=[];r.game.powers=[];r.game.obstacles=[{type:'spikes',x:400,y:548,w:96,h:42}];
 Object.assign(r.player,{x:300,y:508,vy:0,onGround:true});r.keys.ArrowRight=true;r.jump();for(let i=0;i<140;i++)r.update(1/120);
 assert.equal(r.state.lives,3);assert.ok(r.player.x>496);
});

test('vertical lifts carry the hero once per step and can be jumped through from below',async()=>{
 const r=await boot();r.startGame();r.game.enemies=[];r.game.obstacles=[];
 const lift={x:100,y:500,w:240,h:30,dir:1,prevX:100,prevY:500,move:{axis:'y',min:450,max:550,speed:50}};r.game.platforms=[lift];
 Object.assign(r.player,{x:160,y:417,vy:100,onGround:false});r.updateMovingPlatforms(1/120);r.applyPhysics(1/120);
 for(let i=0;i<40;i++){r.updateMovingPlatforms(1/120);r.applyPhysics(1/120);assert.ok(Math.abs(r.player.y+r.player.h-lift.y)<.01);}
 Object.assign(r.player,{x:160,y:570,vy:-540,onGround:false});r.updateMovingPlatforms(1/120);r.applyPhysics(1/120);assert.ok(r.player.vy<0);
});

test('taxi roofs are solid moving surfaces that preserve their rider',async()=>{
 const r=await boot();r.startGame();r.game.enemies=[];r.game.platforms=[];const taxi={type:'taxi',x:150,y:530,w:88,h:54,moving:true,minX:100,maxX:400,speed:70,dir:1};r.game.obstacles=[taxi];
 Object.assign(r.player,{x:160,y:448,vy:100,onGround:false});r.updateMovingPlatforms(1/120);r.applyPhysics(1/120);const offset=r.player.x-taxi.x;
 for(let i=0;i<40;i++){r.updateMovingPlatforms(1/120);r.applyPhysics(1/120);assert.ok(Math.abs(r.player.x-taxi.x-offset)<.01);}
 assert.equal(r.state.lives,3);
});

test('enemies telegraph attacks, respect cover, stay on patrol surfaces and expire after defeat',async()=>{
 const r=await boot();r.startGame();const e=r.game.enemies[0];Object.assign(r.player,{x:e.x-180,y:e.y});e.shootTimer=0;
 r.updateEnemies(1/120);assert.ok(e.windup>0);assert.equal(r.game.enemyProjectiles.length,0);
 for(let i=0;i<70;i++)r.updateEnemies(1/120);assert.ok(r.game.enemyProjectiles.length>0);
 r.game.enemyProjectiles=[];e.shootTimer=0;e.windup=0;r.game.platforms.push({x:e.x-80,y:0,w:30,h:700});for(let i=0;i<70;i++)r.updateEnemies(1/120);assert.equal(r.game.enemyProjectiles.length,0);
 r.damageEnemy(e,100,e.x,e.y);for(let i=0;i<70;i++)r.updateEnemies(1/120);assert.ok(!r.game.enemies.includes(e));
});

test('a projectile cannot hit a robot and boss in the same step, and walls stop incoming fire',async()=>{
 const r=await boot({saved:savedAt(5)});r.startGame();const b=r.game.boss,e=r.game.enemies[0];Object.assign(e,{x:b.x,y:b.y,w:64,h:74,hp:2,dead:false});
 const hp=b.hp;r.game.projectiles=[{x:b.x,y:b.y,w:34,h:16,vx:0,life:1,power:1}];r.updateProjectiles(1/120);assert.equal(b.hp,hp);
 r.game.enemyProjectiles=[{x:100,y:600,w:20,h:10,vx:0,vy:0,life:1}];r.updateProjectiles(1/120);assert.equal(r.game.enemyProjectiles.length,0);
});

test('only trusted parent messages can pause or restart the game; score bridge retains both events',async()=>{
 const r=await boot();r.startGame();r.win.emit('message',{origin:'https://evil.test',source:r.win,data:{type:'GG_PAUSE',paused:true}});assert.equal(r.state.paused,false);
 r.win.emit('message',{origin:'https://webgamearena.com',source:r.win,data:{type:'GG_PAUSE',paused:true}});assert.equal(r.state.paused,true);
 r.state.score=250;r.postScore('manual_submit');assert.ok(r.messages.some(x=>x.message.type==='GG_SCORE'));assert.ok(r.messages.some(x=>x.message.type==='gg:score'));
});

test('startup loads only one district background, shares two atlases, and failed art never stalls controls',async()=>{
 const r=await boot();assert.equal(r.requests.filter(p=>p.includes('/backgrounds/')).length,1);assert.equal(r.requests.filter(p=>p.includes('/animation/')).length,2);assert.ok(r.requests.length<=20);
 const failed=await boot({failAssets:true});failed.startGame();failed.frame();assert.equal(failed.state.started,true);assert.equal(failed.elements.get('playBtn').disabled,false);
});

for(let n=0;n<10;n++)test(`mission ${n+1}: entire terrain route, lifts, crates, checkpoints and collectible quota are reachable`,async()=>{
 const r=await boot({width:n%2?844:390,height:n%2?390:844,saved:savedAt(n)});r.startGame();
 // Combat and damage hazards are isolated here; separate encounter tests exercise those systems.
 r.game.enemies=[];r.game.boss=null;r.game.obstacles=r.game.obstacles.filter(o=>o.type==='crate');
 const lv=r.levelDefs[n];let airTarget=null,reached=false;
 for(let f=0;f<16000;f++){
  const p=r.player,right=p.x+p.w,feet=p.y+p.h;r.keys.ArrowRight=airTarget===null||p.x<airTarget-2;
  const floor=r.game.platforms.find(a=>p.x+p.w/2>=a.x&&p.x+p.w/2<=a.x+a.w&&Math.abs(feet-a.y)<2);
  const gap=floor&&!floor.ledge&&floor.x+floor.w-right<70&&floor.x+floor.w<lv.width-5;
  const wall=r.game.platforms.some(a=>!a.ledge&&a.x>=right-2&&a.x<right+80&&a.y<feet-3&&a.y>feet-130);
  const box=r.game.obstacles.find(o=>o.type==='crate'&&o.x+o.w>right&&o.x<right+75);
  if(p.onGround){airTarget=null;if(gap||wall||box){const next=r.game.platforms.filter(a=>!a.move&&a.x>p.x+50&&a.x<right+330&&a.y<feet+120).sort((a,b)=>a.x-b.x)[0];airTarget=box?box.x+8:next?Math.max(p.x+12,next.x-p.w+20):p.x+200;r.jump();}}
  if(!r.game.missionAccepted)r.tryAction();r.update(1/120);
  if(r.game.levelComplete){reached=true;break;}if(r.state.lives<3)break;
 }
 assert.ok(reached,`blocked at ${r.player.x},${r.player.y}; items ${r.game.objectiveCount}/${lv.target}`);
 assert.equal(r.checkpoint.index,3);assert.ok(r.game.objectiveCount>=lv.target);assert.ok(lv.width>=lv.originalWidth*1.6);
});

test('all patrols, powers, checkpoints, exit gates and quotas fit the authored geometry',async()=>{
 const r=await boot();for(const lv of r.levelDefs){
  const floors=lv.platforms.filter(p=>!p.move&&!p.ledge);
  for(const e of lv.enemies){assert.ok(e.minX<=e.x&&e.maxX>=e.x);assert.ok(floors.some(p=>e.x>=p.x&&e.x+64<=p.x+p.w&&e.homeY===p.y));}
  for(const cp of lv.checkpoints)assert.ok(floors.some(p=>cp.x>=p.x&&cp.x+62<=p.x+p.w&&Math.abs(cp.y+82-p.y)<.01));
  assert.ok(lv.target<lv.coins.length+lv.tokens.length+lv.badges.length);assert.ok(lv.enemies.length>=6);
  assert.ok(lv.platforms.some(p=>lv.exit.x>=p.x&&lv.exit.x+lv.exit.w<=p.x+p.w));
 }
});

test('new assets and scripts exist, HTML IDs are unique, backgrounds and legacy art remain unmodified',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const m of html.matchAll(/(?:src|href)="(\.\/[^"?]+)(?:\?[^"]*)?"/g))assert.ok(fs.existsSync(path.join(root,m[1])));
 assert.doesNotMatch(html,/maximum-scale|user-scalable=no/);assert.ok(html.includes('viewport-fit=cover'));
 const data=require('../public/games/city-quest-rise-of-the-guardian/city-animation-data.js');const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/animation/manifest.json')));
 assert.equal(manifest.assets.reduce((n,a)=>n+a.frames,0),60);
 for(const a of manifest.assets)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/animation',a.file))).digest('hex'),a.sha256);
 assert.equal(Object.keys(data.atlases).length,5);
 for(const atlas of Object.values(data.atlases)){assert.equal(atlas.frames.length,12);assert.equal(atlas.clips.run.count,6);for(const f of atlas.frames){const[x,y,w,h]=f.crop;assert.ok(x>=0&&y>=0&&x+w<=atlas.width&&y+h<=atlas.height);}}
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'release-v21-baseline.json')));
 for(const [file,hash] of Object.entries(baseline.unchanged))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),hash,file);
});

test('supported browsers crop and shrink retained prop textures while releasing old backgrounds',async()=>{
 const r=await boot({bitmapSupport:true,saved:savedAt(0)});r.startGame();let bytes=0;
 for(const img of Object.values(r.images)){if(img?.cityCropped){assert.ok(img.width<=192&&img.height<=192);bytes+=img.width*img.height*4;}}
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/animation/manifest.json')));bytes+=manifest.assets.reduce((n,a)=>n+a.decoded_bytes,0);
 const bg=r.images[r.levelDefs[0].bg];bytes+=bg.width*bg.height*4;assert.ok(bytes<32*1024*1024,bytes);
 r.loadLevel(1);await wait();assert.equal(Object.keys(r.images).filter(x=>x.includes('/backgrounds/')).length,1);
});

test('all sixty poses have distinct real pixels and transparent atlas gutters',()=>{
 const {rgba}=require('./helpers/kasi-png.cjs');const d=require('../public/games/city-quest-rise-of-the-guardian/city-animation-data.js');const cache=new Map();let total=0;
 for(const a of Object.values(d.atlases)){
  if(!cache.has(a.url))cache.set(a.url,rgba(path.join(root,a.url)));const im=cache.get(a.url),hashes=new Set();
  for(const f of a.frames){const[x,y,w,h]=f.crop;const rows=[];for(let yy=y;yy<y+h;yy++)rows.push(im.out.subarray((yy*im.w+x)*4,(yy*im.w+x+w)*4));hashes.add(crypto.createHash('sha256').update(Buffer.concat(rows)).digest('hex'));total++;}
  assert.equal(hashes.size,12);
 }
 for(const im of cache.values()){let clear=0;for(let i=3;i<im.out.length;i+=4)if(im.out[i]<=2)clear++;assert.ok(clear>im.w*im.h*.35);assert.ok(im.out[3]<=2);}
 assert.equal(total,60);
});

test('ordinary motion is consistent at thirty, sixty and one hundred twenty updates per second',async()=>{
 const positions=[];for(const rate of [30,60,120]){const r=await boot();r.startGame();r.game.enemies=[];r.keys.ArrowRight=true;for(let i=0;i<rate;i++)r.update(1/rate);positions.push(r.player.x);}
 assert.ok(Math.max(...positions)-Math.min(...positions)<.01);
});

test('boss can be defeated by shots without inflating the collectible mission quota',async()=>{
 const r=await boot({saved:savedAt(9)});r.startGame();r.game.enemies=[];const b=r.game.boss;
 r.game.projectiles=[{x:b.x+20,y:b.y+10,w:34,h:16,vx:0,life:1,power:100}];r.updateProjectiles(1/120);assert.equal(b.alive,false);assert.equal(r.game.objectiveCount,0);assert.ok(r.state.score>=1000);
});
