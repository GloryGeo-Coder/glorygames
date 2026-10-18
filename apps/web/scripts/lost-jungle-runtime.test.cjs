const {test}=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('./helpers/jungle-runtime.cjs');
const {levels,build}=require('../public/games/lost-jungle-3d-temple-of-the-sun/jungle-campaign.js');
const saveKey='wga_lost_jungle_2d_save_v1';
const savedAt=(n,unlockedLevel=25)=>new Map([[saveKey,JSON.stringify({levelIndex:n,unlockedLevel})]]);
async function play(options={}){const r=await boot(options);r.startGame();await r.ready();r.continueCutscene();return r;}

for(const [width,height] of [[320,568],[390,844],[430,932],[568,320],[844,390],[1366,768]])test(`viewport ${width}x${height}: readable actor, bounded pixels and usable camera region`,async()=>{
 const r=await play({width,height});r.update(1/120);assert.ok(r.player.h*r.scale>=43);assert.ok(r.elements.get('gameCanvas').width*r.elements.get('gameCanvas').height<=3005000);
 let pos=r.worldToScreen(r.player.x,r.player.y);assert.ok(pos.y*r.scale>=(height<500?90:145));assert.ok((pos.y+r.player.h)*r.scale<height-70);assert.ok((width-pos.x*r.scale)>width*.6);
 r.jump();for(let i=0;i<60;i++)r.update(1/120);pos=r.worldToScreen(r.player.x,r.player.y);assert.ok(pos.y*r.scale>85);r.resize(height,width);assert.equal(r.win.visualViewport.height,width);
});

test('three fingers can move and fire while jumping; releasing one cannot cancel another',async()=>{
 const r=await play(),el=id=>r.elements.get(id);el('rightBtn').emit('pointerdown',{pointerId:1});el('shootBtn').emit('pointerdown',{pointerId:2});el('jumpBtn').emit('pointerdown',{pointerId:3});
 for(let i=0;i<40;i++)r.update(1/120);const x=r.player.x,ammo=r.player.ammo;assert.ok(x>150);assert.ok(ammo<14);el('jumpBtn').emit('pointerup',{pointerId:3});for(let i=0;i<40;i++)r.update(1/120);assert.ok(r.player.x>x);assert.ok(r.player.ammo<ammo);
 el('shootBtn').emit('pointercancel',{pointerId:2});const remaining=r.player.ammo;for(let i=0;i<40;i++)r.update(1/120);assert.equal(r.player.ammo,remaining);el('rightBtn').emit('lostpointercapture',{pointerId:1});assert.equal(r.touch.right,false);
});

test('opposing movement touches cancel and lifting one restores the other',async()=>{
 const r=await play();r.elements.get('leftBtn').emit('pointerdown',{pointerId:1});r.elements.get('rightBtn').emit('pointerdown',{pointerId:2});for(let i=0;i<30;i++)r.update(1/120);assert.equal(r.player.x,120);r.elements.get('rightBtn').emit('pointerup',{pointerId:2});for(let i=0;i<30;i++)r.update(1/120);assert.ok(r.player.x<120);
});

for(const event of ['blur','pagehide','visibilitychange'])test(`${event} pauses and clears held movement/fire`,async()=>{
 const r=await play();r.elements.get('rightBtn').emit('pointerdown',{pointerId:1});r.elements.get('shootBtn').emit('pointerdown',{pointerId:2});if(event==='visibilitychange'){r.doc.hidden=true;r.doc.emit(event);}else r.win.emit(event);assert.equal(r.state.paused,true);assert.equal(r.touch.right,false);assert.equal(r.intervals.size,0);const x=r.player.x;r.update(.1);assert.equal(r.player.x,x);r.doc.hidden=false;r.setPaused(false);assert.equal(r.touch.right,false);
});

test('fresh map locks 24 stages and stale stage buttons cannot bypass earned unlocks',async()=>{
 const r=await play();const nodes=r.elements.get('mapGrid').children;assert.equal(nodes.length,25);assert.ok(nodes.slice(1).every(x=>x.disabled));nodes[24].disabled=false;nodes[24].click();assert.equal(r.state.levelIndex,0);
});

test('legacy saves retain unlocks, coins, score, best and mute preference under the same keys',async()=>{
 const saved=new Map([[saveKey,JSON.stringify({levelIndex:9,unlockedLevel:11,score:32100,coins:83,best:42000,muted:true})]]),r=await play({saved});assert.equal(r.state.levelIndex,9);assert.equal(r.state.unlockedLevel,11);assert.equal(r.state.completedLevels,10);assert.equal(r.state.score,32100);assert.equal(r.state.coins,83);assert.equal(r.state.best,42000);assert.equal(r.state.muted,true);r.saveState();const again=await boot({saved});assert.equal(again.state.unlockedLevel,11);
});

for(const raw of ['{broken','[]','null','{"unlockedLevel":999,"levelIndex":-2,"score":-12,"coins":"x"}'])test(`malformed save recovers safely: ${raw}`,async()=>{
 const r=await play({saved:new Map([[saveKey,raw]])});assert.ok(r.state.levelIndex>=0&&r.state.levelIndex<25);assert.ok(r.state.unlockedLevel>=1&&r.state.unlockedLevel<=25);assert.ok(r.state.score>=0&&r.state.coins>=0);
});

test('unavailable storage and failed art never prevent start, input, pause or retry',async()=>{
 const r=await play({failStorage:true,failAssets:true});r.jump();r.shoot();r.setPaused(true);r.setPaused(false);r.saveState();assert.equal(r.state.started,true);assert.equal(r.elements.get('playBtn').disabled,false);
});

test('fall recovery ignores temporary invulnerability and preserves shield and collected progress',async()=>{
 const r=await play(),cp=r.game.checkpoints[1];Object.assign(r.player,{x:cp.x,y:cp.y});r.updatePlayer(1/120);assert.equal(r.game.checkpointIndex,1);r.game.items[0].taken=true;r.game.relics=3;r.game.keys=1;r.player.shield=1;r.player.invuln=10;r.player.y=1000;r.updatePlayer(1/120);assert.equal(r.state.lives,2);assert.equal(r.player.x,cp.x);assert.equal(r.player.y,cp.y);assert.equal(r.player.shield,1);assert.equal(r.game.relics,3);assert.equal(r.game.keys,1);assert.equal(r.game.items[0].taken,true);
});

test('shield contact absorbs one hit, and normal invulnerability prevents stacked damage',async()=>{
 const r=await play();r.player.shield=1;r.loseLife('contact');assert.equal(r.state.lives,3);assert.equal(r.player.shield,0);r.loseLife('contact');assert.equal(r.state.lives,3);r.player.invuln=0;r.loseLife('contact');r.loseLife('contact');assert.equal(r.state.lives,2);
});

test('relics, keys, pressure plate and living guardian each independently gate the exit',async()=>{
 const r=await play({saved:savedAt(9)}),lv=r.LEVELS[9];assert.equal(r.canOpenGate(),false);r.game.relics=lv.relicTarget;r.game.keys=lv.keyTarget;assert.equal(r.canOpenGate(),false);r.activatePlate(r.game.items.find(i=>i.type==='plate'));assert.equal(r.canOpenGate(),true);Object.assign(r.player,r.game.exit);r.checkGateAndExit();assert.equal(r.game.levelComplete,false);r.game.boss.alive=false;r.checkGateAndExit();assert.equal(r.game.levelComplete,true);
});

test('closing maps restores cutscenes, pause and completion; auto-advance waits while map is open',async()=>{
 const r=await play();r.showCutscene();r.openMap();r.closeMap();assert.equal(r.elements.get('cutsceneOverlay').classList.contains('active'),true);assert.equal(r.state.paused,true);r.continueCutscene();r.setPaused(true);r.openMap();r.closeMap();assert.equal(r.elements.get('pauseOverlay').classList.contains('active'),true);r.setPaused(false);r.completeLevel();r.openMap();for(let i=0;i<500;i++)r.update(1/120);assert.equal(r.state.levelIndex,0);r.closeMap();assert.equal(r.elements.get('completeOverlay').classList.contains('active'),true);for(let i=0;i<400;i++)r.update(1/120);assert.equal(r.state.levelIndex,1);assert.equal(r.game.storyOpen,true);
});

test('completion opens only the next route; duplicate Next cannot skip a level; only 25 ends the story',async()=>{
 const r=await play({saved:savedAt(23,24)});r.completeLevel();assert.equal(r.state.unlockedLevel,25);r.nextLevel();r.nextLevel();assert.equal(r.state.levelIndex,24);r.continueCutscene();r.completeLevel();r.nextLevel();assert.equal(r.state.completed,true);assert.equal(r.state.completedLevels,25);assert.equal(r.state.unlockedLevel,25);
});

test('moving ledges carry a standing player without double displacement',async()=>{
 const r=await play();const lift={x:100,y:500,w:240,h:28,type:'moving',baseX:100,baseY:500,prevX:100,prevY:500,moveAxis:'y',moveRange:30,moveSpeed:1,phase:0};r.game.platforms=[lift];r.game.enemies=[];r.game.hazards=[];Object.assign(r.player,{x:160,y:413,vy:100,onGround:false});
 for(let i=0;i<20&&!r.player.onGround;i++){r.game.time+=1/120;r.updateMovingPlatforms(1/120);r.updatePlayer(1/120);}assert.equal(r.player.onGround,true);
 for(let i=0;i<80;i++){r.game.time+=1/120;r.updateMovingPlatforms(1/120);r.updatePlayer(1/120);assert.ok(Math.abs(r.player.y+r.player.h-lift.y)<.1);}
});

test('buffered jump and coyote time are forgiving without unlimited aerial jumps',async()=>{
 const r=await play();r.game.enemies=[];r.game.hazards=[];Object.assign(r.player,{y:480,vy:80,onGround:false});r.jump();for(let i=0;i<10;i++)r.updatePlayer(1/120);assert.ok(r.player.vy<0);const v=r.player.vy;r.jump();assert.equal(r.player.vy,v);
});

for(const type of Object.keys(require('../public/games/lost-jungle-3d-temple-of-the-sun/jungle-campaign.js').enemySizes))test(`${type}: patrol stays bounded and attack preparation is visible before contact/fire`,async()=>{
 const index=levels.findIndex(l=>build(l).enemies.some(e=>e.type===type)),r=await play({saved:savedAt(index)});const e=r.game.enemies.find(e=>e.type===type);r.game.enemies=[e];r.game.hazards=[];r.game.boss=null;r.game.boulder=null;Object.assign(r.player,{x:e.x-250,y:e.y,invuln:10});e.shootTimer=0;
 r.updateWorld(1/120);if(!['frog','crawler'].includes(type)){assert.ok(e.windup>0);assert.equal(r.game.darts.length,0);}for(let i=0;i<120;i++)r.updateWorld(1/120);assert.ok(e.x>=e.minX&&e.x<=e.maxX);assert.ok(Number.isFinite(e.y));
});

test('dash damages enemies and guardians even while dash protection is active',async()=>{
 const r=await play({saved:savedAt(4)}),b=r.game.boss,e=r.game.enemies[0];r.game.hazards=[];Object.assign(e,{x:r.player.x,y:r.player.y,baseY:r.player.y,minX:r.player.x,maxX:r.player.x+100,hp:3,hurt:0});r.game.enemies=[e];r.dash();assert.ok(r.player.invuln>0);r.updateWorld(1/120);assert.equal(e.hp,1);
 Object.assign(r.player,{x:b.x,y:b.y,dashTimer:.2,invuln:.2});const hp=b.hp;r.updateWorld(1/120);assert.equal(b.hp,hp-2);r.updateWorld(1/120);assert.equal(b.hp,hp-2);
});

test('a projectile cannot damage an enemy and boss together; walls block shots and incoming fire',async()=>{
 const r=await play({saved:savedAt(4)}),b=r.game.boss,e=r.game.enemies[0];Object.assign(e,{x:b.x,y:b.y,w:72,h:80,hp:2});r.game.enemies=[e];r.game.bullets=[{x:b.x,y:b.y,w:20,h:12,vx:0,life:1,power:1,color:'#fff'}];const hp=b.hp;r.updateBullets(1/120);assert.equal(b.hp,hp);r.game.darts=[{x:100,y:600,w:20,h:12,vx:0,vy:0,life:1}];r.updateWorld(1/120);assert.equal(r.game.darts.length,0);
});

test('guardian opens with a warning and increases pattern density in its second phase',async()=>{
 const r=await play({saved:savedAt(24)}),b=r.game.boss;r.game.enemies=[];r.game.hazards=[];Object.assign(r.player,{x:b.x-450,y:484,invuln:10});b.shootTimer=0;r.updateWorld(1/120);assert.ok(b.windup>0);assert.equal(r.game.darts.length,0);for(let i=0;i<100;i++)r.updateWorld(1/120);assert.ok(r.game.darts.length>=1);r.game.darts=[];b.hp=1;b.shootTimer=0;b.windup=0;for(let i=0;i<100;i++)r.updateWorld(1/120);assert.equal(r.game.darts.length,3);
});

test('all existing power effects remain available, with finite ammo and recoverable double jumps',async()=>{
 const r=await play();for(const power of ['dash','torch','shield','heart','blaster','doubleJump','magnet','ammo'])r.collectPower({x:200,y:400,power});assert.ok(r.player.torchTimer>0);assert.equal(r.player.shield,1);assert.ok(r.state.lives>3);assert.ok(r.player.shootPowerTimer>0&&r.player.jumpBootsTimer>0&&r.player.magnetTimer>0);assert.ok(r.player.ammo<=35);r.jump();r.jump();assert.ok(r.player.vy<0);assert.equal(r.player.canDoubleJump,false);
});

test('continuous challenges reward once, and bridge messages require the same trusted parent origin',async()=>{
 const r=await play();r.startNewChallenge();const ch=r.game.challenge,score=r.state.score;r.addChallengeProgress(ch.type,ch.target);assert.equal(r.state.score,score+ch.reward);r.addChallengeProgress(ch.type,ch.target);assert.equal(r.state.score,score+ch.reward);
 r.win.emit('message',{origin:'https://evil.test',source:r.win,data:{type:'GG_RESTART'}});assert.equal(r.game.storyOpen,false);r.postScore('manual_submit');assert.ok(r.messages.some(m=>m.message.type==='GG_SCORE'&&m.message.slug==='lost-jungle-3d-temple-of-the-sun'));assert.ok(r.messages.some(m=>m.message.type==='gg:score'));
});

for(let n=0;n<25;n++)test(`route ${n+1}: normal movement reaches every mandatory objective, pressure plate, checkpoint and exit`,async()=>{
 const r=await play({width:n%2?844:390,height:n%2?390:844,saved:savedAt(n)});r.game.enemies=[];r.game.boss=null;r.game.hazards=[];r.game.boulder=null;r.game.items=r.game.items.filter(i=>['relic','key','plate','coin'].includes(i.type));r.game.challengeCooldown=1e9;r.keys.ArrowRight=true;
 // Combat, damaging hazards and powers are isolated here and exercised separately.
 for(let frame=0;frame<16000&&!r.game.levelComplete&&r.state.lives===3;frame++){
  const p=r.player,right=p.x+p.w,feet=p.y+p.h;
  const floor=r.game.platforms.filter(a=>Math.abs(feet-a.y)<2&&right>a.x&&p.x<a.x+a.w).sort((a,b)=>a.y-b.y)[0];
  const gap=floor&&floor.x+floor.w-right<70&&floor.x+floor.w<r.LEVELS[n].length;
  const wall=r.game.platforms.some(a=>a.type==='ground'&&a.x>=right-2&&a.x<right+70&&a.y<feet-3);
  if(p.onGround&&(gap||wall))r.jump();r.update(1/120);
 }
 assert.ok(r.game.levelComplete,`stopped at ${r.player.x}, ${r.player.y}; ${r.game.relics} relics, ${r.game.keys} keys`);assert.equal(r.state.lives,3);assert.ok(r.game.relics>=r.LEVELS[n].relicTarget);assert.equal(r.game.keys,r.LEVELS[n].keyTarget);assert.equal(r.game.checkpointIndex,r.game.checkpoints.length-1);
});
