const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path'), zlib=require('node:zlib'), crypto=require('node:crypto');
const A=require('../public/games/kasi-quest/kasi-animation.js');
const {boot,root}=require('./helpers/kasi-runtime.cjs');
const data=A.data;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);

// Decode these RGBA8 PNGs with built-in Node APIs so CI verifies real transparency and pose pixels.
function rgba(file){
 const png=fs.readFileSync(file),w=png.readUInt32BE(16),h=png.readUInt32BE(20),chunks=[];
 assert.equal(png[24],8);assert.equal(png[25],6);
 for(let p=8;p<png.length;){const n=png.readUInt32BE(p),type=png.toString('ascii',p+4,p+8);if(type==='IDAT')chunks.push(png.subarray(p+8,p+8+n));p+=12+n;}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),out=Buffer.alloc(w*h*4),stride=w*4;
 let p=0;
 for(let y=0;y<h;y++) {const filter=raw[p++];assert.ok(filter<=4);for(let x=0;x<stride;x++) {
  const i=y*stride+x,l=x>=4?out[i-4]:0,u=y?out[i-stride]:0,ul=y&&x>=4?out[i-stride-4]:0;
  let predict=0;
  if(filter===1)predict=l;else if(filter===2)predict=u;else if(filter===3)predict=Math.floor((l+u)/2);
  else if(filter===4){const v=l+u-ul,dl=Math.abs(v-l),du=Math.abs(v-u),dul=Math.abs(v-ul);predict=dl<=du&&dl<=dul?l:du<=dul?u:ul;}
  out[i]=(raw[p++]+predict)&255;
 }}
 return {w,h,out};
}

test('76 isolated poses have genuine alpha, valid crop bounds and distinct running frames',()=>{
 let total=0,decoded=0;
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/animation/manifest.json')));
 for(const[kind,info]of Object.entries(data.atlases)){
  const file=path.join(root,info.url),image=rgba(file);near(image.w,info.width);near(image.h,info.height);
  let transparent=0;for(let i=3;i<image.out.length;i+=4)if(image.out[i]===0)transparent++;
  assert.ok(transparent/(image.w*image.h)>.35,kind+' alpha coverage');assert.equal(image.out[3],0);
  const hashes=new Set();
  for(const frame of info.frames){const[x,y,w,h]=frame.crop;assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=image.w&&y+h<=image.h);
   const hash=crypto.createHash('sha256');for(let row=y;row<y+h;row++)hash.update(image.out.subarray((row*image.w+x)*4,(row*image.w+x+w)*4));hashes.add(hash.digest('hex'));
  }
  assert.equal(hashes.size,info.frames.length);total+=info.frames.length;decoded+=image.out.length;
  const entry=manifest.assets.find(a=>a.kind===kind);assert.equal(entry.sha256,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
  for(const spec of Object.values(info.clips))assert.ok(spec.start>=0&&spec.start+spec.count<=info.frames.length&&spec.fps>0);
 }
 assert.equal(total,76);assert.ok(decoded<20*1024*1024);
});

test('pose animation advances by elapsed time consistently at 30, 60 and 120 updates per second',()=>{
 const results=[];
 for(const fps of [30,60,120]){const a=A.create(),p={vx:360,vy:0,onGround:true,face:1,lives:3};for(let i=0;i<fps;i++)a.update(p,'player',1/fps);results.push(a.snapshot(p,'player'));}
 assert.ok(results.every(s=>s.clip==='run'&&s.frame===results[0].frame));near(results[0].time,results[2].time);
});

test('neighbour-exclusion masks are bounded and use disjoint rectangles',()=>{
 const masked=Object.values(data.atlases).flatMap(a=>a.frames).filter(f=>f.exclude?.length);assert.equal(masked.length,6);
 for(const frame of masked){const pixels=new Set();for(const[x,y,w,h]of frame.exclude){assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=frame.crop[2]&&y+h<=frame.crop[3]);
  for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const key=yy*frame.crop[2]+xx;assert.ok(!pixels.has(key));pixels.add(key);}
 }}
});

test('all running poses are visited and gait cadence responds to movement speed',()=>{
 const a=A.create(),p={vx:360,vy:0,onGround:true,face:1,lives:3},seen=new Set();
 for(let i=0;i<80;i++){a.update(p,'player',1/120);seen.add(a.snapshot(p,'player').frame);}
 assert.equal(seen.size,8);a.reset(p);p.vx=100;a.update(p,'player',.2);const slow=a.snapshot(p,'player').time;
 a.reset(p);p.vx=455;a.update(p,'player',.2);assert.ok(a.snapshot(p,'player').time>slow);
});

test('jump, fall and landing use distinct poses without changing the physics body',()=>{
 const a=A.create(),p={x:10,y:20,w:33,h:50,vx:100,vy:-500,onGround:false,face:1,lives:3};
 const before={...p};a.update(p,'player',.1);assert.equal(a.snapshot(p,'player').clip,'jump');assert.deepEqual(p,before);
 p.vy=300;a.update(p,'player',.1);assert.equal(a.snapshot(p,'player').clip,'fall');
 a.play(p,'player','land');p.onGround=true;a.update(p,'player',.05);assert.equal(a.snapshot(p,'player').clip,'land');
 a.cancel(p,'land');p.onGround=false;p.vy=-500;a.update(p,'player',.02);assert.equal(a.snapshot(p,'player').clip,'jump');
});

test('impact feedback takes precedence over shooting; defeat takes precedence over every action',()=>{
 const a=A.create(),p={face:1,onGround:true,vx:300,lives:3};
 a.play(p,'player','hurt');assert.equal(a.play(p,'player','shoot'),false);a.update(p,'player',.05);assert.equal(a.snapshot(p,'player').clip,'hurt');
 a.play(p,'player','defeat');assert.equal(a.play(p,'player','hurt'),false);a.update(p,'player',2);assert.equal(a.finished(p,'player'),true);
});

test('all poses preserve source aspect and foot alignment; collapsed bodies stay naturally shorter',()=>{
 const a=A.create(),p={face:1,vx:0,vy:0,onGround:true,lives:3,alive:true},body={x:100,y:200,w:33,h:50};
 for(const[kind,info]of Object.entries(data.atlases))for(const[name,spec]of Object.entries(info.clips)){
  a.reset(p);a.play(p,kind,name);a.update(p,kind,(spec.count-1)/spec.fps+.001);
  const rect=a.rect(p,kind,body),frame=info.frames[rect.pose.frame],scale=body.h/info.referenceHeight;
  near(rect.w/rect.h,rect.crop[2]/rect.crop[3]);near(rect.y+(frame.content[1]-frame.crop[1]+frame.content[3])*scale,body.y+body.h);
  if(name==='defeat')assert.ok(rect.contentHeight<body.h*.7,kind+' collapse height');
 }
});

test('opponent loop phases differ deterministically and reduced motion holds breathing still',()=>{
 const a=A.create(),e={id:'L1-E0',speed:100,vx:100,dir:1,alive:true},f={...e,id:'L1-E3'};
 a.update(e,'enemy',.1);a.update(f,'enemy',.1);assert.notEqual(a.snapshot(e,'enemy').time,a.snapshot(f,'enemy').time);
 const p={vx:0,onGround:true,face:1,lives:3};a.reduceMotion(true);a.update(p,'player',1);assert.equal(a.snapshot(p,'player').frame,0);
 p.vx=360;a.update(p,'player',.2);assert.notEqual(a.snapshot(p,'player').frame,data.atlases.player.clips.run.start);
});

test('shooting, hurt and airborne player poses are driven by the shipped gameplay events',async()=>{
 const r=await boot();await r.startOrRestart();r.shoot();assert.equal(r.animation.snapshot(r.player,'player').clip,'shoot');assert.equal(r.state.projectiles.length,1);
 r.player.invuln=0;r.damagePlayer();assert.equal(r.animation.snapshot(r.player,'player').clip,'hurt');
 r.animation.reset(r.player);r.input.jump=true;r.frame();assert.equal(r.animation.snapshot(r.player,'player').clip,'jump');
 r.player.vy=200;r.player.onGround=false;r.input.jump=false;r.frame();assert.equal(r.animation.snapshot(r.player,'player').clip,'fall');
});

test('pause and orientation freeze actor animation while keeping v3.1 controls and sizing',async()=>{
 const r=await boot({width:390,height:844});await r.startOrRestart();r.input.right=true;r.frame();r.setPaused(true);
 const pose=r.animation.snapshot(r.player,'player'),body={x:r.player.x,y:r.player.y,w:r.player.w,h:r.player.h};
 for(let i=0;i<20;i++)r.frame();near(r.animation.snapshot(r.player,'player').time,pose.time);
 r.resize(844,390);r.win.emit('orientationchange');assert.equal(r.state.paused,true);near(r.player.x,body.x);near(r.player.w,body.w);near(r.player.h,body.h);
});

test('shooter animation faces its actual projectile direction without changing patrol intent',async()=>{
 const r=await boot();await r.startOrRestart();const e=r.state.enemies.find(e=>e.type==='shooter');
 e.x=200;e.y=430;e.shootT=0;e.dir=1;r.player.x=100;r.updateEnemies(1/60);r.updateActorAnimations(1/60);
 assert.equal(r.animation.snapshot(e,'enemy').clip,'shoot');assert.equal(r.animation.snapshot(e,'enemy').face,-1);
 assert.ok(r.state.enemyProjectiles.some(p=>p.vx<0));assert.equal(e.dir,1);
});

test('boss windup, attack, phase and defeat retain damage/reward behavior',async()=>{
 const r=await boot();await r.startOrRestart();const b=r.state.bosses[0];r.player.x=b.x-200;b.vy=0;b.shootT=.2;r.updateActorAnimations(.03);
 assert.equal(r.animation.snapshot(b,'boss').clip,'windup');b.shootT=0;r.updateBosses(1/60);r.updateActorAnimations(1/60);
 assert.equal(r.animation.snapshot(b,'boss').clip,'shoot');assert.ok(r.state.enemyProjectiles.length>0);
 r.hitBoss(b,Math.ceil(b.maxHp/2));assert.equal(b.phase,2);assert.equal(r.animation.snapshot(b,'boss').clip,'hurt');
 r.hitBoss(b,100);assert.equal(b.alive,false);assert.equal(r.animation.snapshot(b,'boss').clip,'defeat');
 const score=r.state.score;r.hitBoss(b,100);assert.equal(r.state.score,score);
});

test('defeated enemies animate briefly, stop colliding immediately and award rewards once',async()=>{
 const r=await boot();await r.startOrRestart();const e=r.state.enemies[0];e.x=120;e.y=430;
 r.defeatEnemy(e,e.x,e.y,true);const score=r.state.score,lives=r.player.lives;r.defeatEnemy(e,e.x,e.y,true);assert.equal(r.state.score,score);
 Object.assign(r.player,{x:120,y:430,invuln:0,vy:0});r.handleEnemyPlayerCollisions();assert.equal(r.player.lives,lives);
 const x=e.x;r.updateEnemies(.1);near(e.x,x);r.updateActorAnimations(.2);assert.equal(r.animation.finished(e,'enemy'),false);
 r.calls.length=0;r.render();const crop=r.animation.rect(e,'enemy',e).crop;
 assert.ok(r.calls.some(c=>c[0]==='drawImage'&&c[1].url.includes('enemy-v3.2')&&c.slice(2,6).join()===crop.join()));
 r.updateActorAnimations(1);assert.equal(r.animation.finished(e,'enemy'),true);
 r.calls.length=0;r.render();assert.ok(!r.calls.some(c=>c[0]==='drawImage'&&c[1].url.includes('enemy-v3.2')&&c.slice(2,6).join()===r.animation.rect(e,'enemy',e).crop.join()));
});

test('fatal hit stops the mission clock immediately, shows defeat, then opens retry exactly once',async()=>{
 const r=await boot();await r.startOrRestart();r.player.lives=1;r.player.invuln=0;const time=r.state.levelTime;r.damagePlayer();
 assert.equal(r.state.running,false);assert.ok(r.state.defeatRemaining>0);assert.equal(r.elements.get('panel').hidden,true);
 assert.equal(r.input.right,false);assert.equal(r.elements.get('touch').hidden,true);
 const frames=new Set();for(let i=0;i<50;i++){r.frame();frames.add(r.animation.snapshot(r.player,'player').frame);}
 assert.equal(frames.size,4);near(r.state.levelTime,time);assert.equal(r.elements.get('panel').hidden,false);
 assert.equal(r.messages.filter(m=>m.message.type==='GG_SCORE'&&m.message.mode==='game_over').length,1);
 await r.startOrRestart();assert.equal(r.state.defeatRemaining,0);assert.equal(r.animation.snapshot(r.player,'player').clip,'idle');assert.equal(r.player.lives,3);
});

test('interruption or falling during defeat leaves the retry menu usable',async()=>{
 for(const reason of ['hit','fall']){
  const r=await boot();await r.startOrRestart();r.player.lives=1;r.player.invuln=0;r.damagePlayer(reason);
  if(reason==='hit')r.win.emit('blur');assert.equal(r.state.defeatRemaining,0);assert.equal(r.elements.get('panel').hidden,false);
 }
});

for(const kind of ['player','enemy','boss'])test(`${kind} atlas failure falls back independently while other actors stay animated`,async()=>{
 const r=await boot({failAtlases:[kind]});await r.startOrRestart();r.player.invuln=0;r.render();
 assert.equal(r.animation.has(kind),false);for(const other of ['player','enemy','boss'].filter(k=>k!==kind))assert.equal(r.animation.has(other),true);
 if(kind==='boss') { assert.ok(!r.requests.some(url=>url.endsWith('/sprites/boss.png'))); assert.ok(r.calls.some(c=>c[0]==='fillRect'));  }
 else { const old=kind==='player'?'player_idle.png':kind+'.png';assert.ok(r.calls.some(c=>c[0]==='drawImage'&&c[1].url.endsWith(old))); }
 assert.equal(r.state.running,true);
});

test('wrong-sized sheets are rejected and original art remains playable',async()=>{
 const r=await boot({wrongAtlasSize:true});await r.startOrRestart();for(const kind of ['player','enemy','boss'])assert.equal(r.animation.has(kind),false);
 r.player.invuln=0;r.render();assert.equal(r.state.running,true);
});

test('successful atlas loads avoid decoding duplicate legacy actors',async()=>{
 const r=await boot();assert.equal(r.requests.filter(url=>url.includes('/animation/')).length,3);
 assert.ok(!r.requests.some(url=>url.includes('/sprites/')));assert.ok(r.requests.some(url=>url.includes('/backgrounds/')));
});

test('animation-script failure preserves the original playable sprite path',async()=>{
 const r=await boot({noAnimation:true});await r.startOrRestart();r.player.invuln=0;r.input.right=true;r.frame();
 assert.equal(r.animation,undefined);assert.ok(r.player.vx>0);assert.ok(r.calls.some(c=>c[0]==='drawImage'&&c[1].url.endsWith('player_run.png')));
});
