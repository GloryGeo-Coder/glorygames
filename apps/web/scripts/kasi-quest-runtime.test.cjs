const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const { boot, root } = require('./helpers/kasi-runtime.cjs');
const presentation = require('../public/games/kasi-quest/kasi-presentation.js');
const settle = () => new Promise(resolve => setImmediate(resolve));
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-8, `${a} != ${b}`);

test('boot preserves campaign, economy, upgrade and star saves without new namespaces', async () => {
  const saved = new Map([['wga_kasi_quest_v3_wallet','48'],['wga_kasi_quest_v3_best','2500'],
    ['wga_kasi_quest_v3_upgrades',JSON.stringify({ shield:1, doubleJump:1, fireRate:2, extraLife:1 })],['wga_kasi_quest_v3_stars','{"1":3,"8":2}']]);
  const r = await boot({ saved });
  assert.equal(r.state.wallet,48); assert.equal(r.state.upgrades.fireRate,2); assert.equal(r.state.stars['8'],2);
  assert.equal(r.elements.get('levelGrid').children.length,8); assert.equal(r.player.lives,4);
  assert.equal(r.elements.get('panel').hidden,false); assert.equal(r.elements.get('touch').hidden,true);
});

test('multi-touch can run, jump and shoot together and survives leaving a button', async () => {
  const r = await boot(); await r.startOrRestart();
  const right=r.elements.get('btnRight'), jump=r.elements.get('btnJump'), fire=r.elements.get('btnAction');
  right.emit('pointerdown',{pointerId:11}); jump.emit('pointerdown',{pointerId:12}); fire.emit('pointerdown',{pointerId:13});
  right.emit('pointerleave',{pointerId:11});
  assert.ok(r.input.right && r.input.jump && r.input.action); assert.equal(r.captures.size,3);
  r.frame(); assert.ok(r.player.vx>0 && r.player.vy<0); assert.equal(r.state.projectiles.length,1);
  jump.emit('pointerup',{pointerId:12}); assert.equal(r.input.jump,false); assert.equal(r.input.right,true);
  fire.emit('pointercancel',{pointerId:13}); assert.equal(r.input.action,false);
  right.emit('lostpointercapture',{pointerId:11}); assert.equal(r.input.right,false);
});

test('two fingers on the same action and mixed keyboard input release independently', async () => {
  const r = await boot(); await r.startOrRestart(); const right=r.elements.get('btnRight');
  right.emit('pointerdown',{pointerId:1}); right.emit('pointerdown',{pointerId:2});
  right.emit('pointerup',{pointerId:1}); assert.equal(r.input.right,true);
  r.win.emit('keydown',{key:'d'}); right.emit('pointerup',{pointerId:2}); assert.equal(r.input.right,true);
  r.win.emit('keydown',{key:'ArrowRight'}); r.win.emit('keyup',{key:'d'}); assert.equal(r.input.right,true);
  r.win.emit('keyup',{key:'ArrowRight'}); assert.equal(r.input.right,false);
});

test('short taps between frames still trigger jump and shooting once', async () => {
  const r=await boot(); await r.startOrRestart();
  for(const id of ['btnJump','btnAction']) { const button=r.elements.get(id); button.emit('pointerdown'); button.emit('pointerup'); }
  assert.equal(r.input.jump,false); r.frame(); assert.ok(r.player.vy<0); assert.equal(r.state.projectiles.length,1);
  r.frame(); assert.equal(r.state.projectiles.length,1);
});

for (const event of ['blur','pagehide','visibilitychange','orientationchange']) test(`${event} clears controls and pauses without advancing time`, async () => {
  const r = await boot(); await r.startOrRestart(); r.elements.get('btnRight').emit('pointerdown'); r.frame();
  const time=r.state.levelTime;
  if(event==='visibilitychange') { r.doc.hidden=true; r.doc.emit(event); } else r.win.emit(event);
  assert.equal(r.state.paused,true); assert.equal(r.input.right,false); assert.equal(r.captures.size,0);
  r.frame(); near(r.state.levelTime,time); assert.equal(r.elements.get('panel').hidden,false);
  r.doc.hidden=false; r.elements.get('btnPause').click(); r.frame(); assert.equal(r.state.paused,false); assert.ok(r.state.levelTime>time);
});

test('HUD pause and keyboard resume are accessible; menu keys retain native button behavior', async () => {
  const r=await boot(); assert.equal(r.win.emit('keydown',{key:'Enter'}).prevented,undefined);
  await r.startOrRestart(); assert.equal(r.elements.get('btnHudPause').hidden,false);
  r.elements.get('btnHudPause').click(); assert.equal(r.state.paused,true); assert.equal(r.elements.get('btnHudPause').hidden,true);
  assert.equal(r.doc.activeElement.id,'btnPause'); assert.equal(r.win.emit('keydown',{key:' '}).prevented,undefined);
  r.win.emit('keydown',{key:'Escape'}); assert.equal(r.state.paused,false); assert.equal(r.doc.activeElement.id,'c');
  r.win.emit('keydown',{key:'p',repeat:true}); assert.equal(r.state.paused,false);
});

test('jump buffer fires on landing and coyote time cannot grant unlimited air jumps', async () => {
  const r=await boot(); await r.startOrRestart();
  Object.assign(r.player,{x:80,y:429,vy:50,onGround:false,coyoteT:0,airJumpsLeft:0});
  r.input.jump=true; r.updatePlayer(1/60); assert.equal(r.player.onGround,true);
  r.prevInput.jump=true; r.updatePlayer(1/60); assert.ok(r.player.vy<0); assert.equal(r.player.jumpBufferT,0);
  Object.assign(r.player,{x:80,y:350,vy:40,onGround:false,coyoteT:.05,airJumpsLeft:0}); r.prevInput.jump=false;
  r.updatePlayer(1/60); assert.ok(r.player.vy<0); assert.equal(r.player.coyoteT,0);
  r.prevInput.jump=false; r.player.vy=100; r.updatePlayer(1/60); assert.ok(r.player.vy>0);
});

test('mobile rotation and fullscreen resizing preserve world geometry and motion', async () => {
  const r=await boot({width:390,height:844}); await r.startOrRestart();
  const p={x:r.player.x,y:r.player.y,w:r.player.w,h:r.player.h};
  r.resize(844,390); near(r.player.x,p.x); near(r.player.y,p.y); near(r.player.w,p.w); near(r.player.h,p.h);
  assert.equal(r.state.display.width,844); r.doc.emit('fullscreenchange'); assert.equal(r.state.running,true);
  r.input.right=true; r.updatePlayer(1/60); assert.ok(r.player.vx>0);
});

for (const [width,height] of [[320,568],[360,640],[390,844],[430,932],[667,375],[844,390],[932,430],[1024,768],[1280,720],[1920,1080],[3840,2160]]) {
  test(`viewport ${width}x${height}: readable scale, forward visibility and HUD/control clearance`, () => {
    const v=presentation.viewport(width,height,3);
    assert.ok(v.worldWidth>=599); assert.ok(50*v.scale>=26 && 50*v.scale<=62.5);
    assert.ok(v.pixelWidth*v.pixelHeight<=3500000);
    const p={x:1600,y:430,w:33,h:50,face:1}, insets={top:104,bottom:92};
    const c=presentation.camera(p,6000,576,v,insets);
    const sx=(p.x-c.camX)*v.scale, sy=(p.y-c.camY)*v.scale;
    assert.ok(sx>0 && sx+33*v.scale<width); assert.ok(width/v.scale-(p.x+33-c.camX)>300);
    assert.ok(sy>insets.top-1 && sy+50*v.scale<height-insets.bottom+1);
    for (const name of ['playerIdle','playerRun','enemy','boss','taxi','coin']) {
      const body={x:10,y:20,w:33,h:50}, rect=presentation.spriteRect(name,body);
      near(rect.w/rect.h,rect.crop[2]/rect.crop[3]); near(rect.y+rect.h,body.y+body.h);
    }
  });
}

test('all eight campaign missions can open their gates and transition with saved stars and scores', async () => {
  const r=await boot(); await r.startOrRestart();
  for(let n=1;n<=8;n++) {
    assert.equal(r.state.currentLevel,n); assert.equal(r.objectiveComplete(),false);
    const taxi=r.state.obstacles.find(o=>o.type==='taxi');
    near(taxi.w/taxi.h,988/866); assert.ok(taxi.h>r.player.h && taxi.h<100);
    const raw=JSON.parse(fs.readFileSync(path.join(root,`levels/level-0${n}.json`)));
    near(taxi.y+taxi.h,(raw.obstacles[0].y+raw.obstacles[0].h)*32);
    while(r.state.level.coins.length) r.collectCoin(0);
    r.state.level.collectibles.forEach((_,i)=>r.collectCollectible(i));
    r.state.enemies.forEach(e=>r.defeatEnemy(e,e.x,e.y,true));
    r.state.bosses.forEach(b=>{ while(b.alive) r.hitBoss(b); });
    r.state.switches.forEach(s=>r.pressSwitch(s)); assert.equal(r.objectiveComplete(),true);
    await r.completeLevel(); assert.ok(r.state.stars[n]>=1);
  }
  assert.equal(r.state.running,false); assert.equal(r.elements.get('panel').hidden,false);
  assert.ok(r.state.wallet>0); assert.ok(JSON.parse(r.saved.get('wga_kasi_quest_v3_stars'))['8']>=1);
  assert.ok(r.messages.some(m=>m.message.mode==='complete')); assert.ok(r.messages.every(m=>m.origin==='https://webgamearena.com'));
});

test('shooting damages enemies, boss phases and doors still react to projectiles', async () => {
  const r=await boot(); await r.startOrRestart();
  const enemy=r.state.enemies[0]; Object.assign(enemy,{x:140,y:r.player.y,w:35,h:39,hp:1});
  r.shoot(); for(let i=0;i<10;i++) r.updateProjectiles(1/60); assert.equal(enemy.alive,false);
  const b=r.state.bosses[0]; r.hitBoss(b,Math.ceil(b.maxHp/2)); assert.equal(b.phase,2);
  await r.loadLevel(8); r.resetLevelState(); const sw=r.state.switches[0]; r.pressSwitch(sw);
  assert.equal(r.state.doors.find(d=>d.id===sw.id).open,true);
});

test('daily challenge and damage/retry retain their existing save and score contracts', async () => {
  const r=await boot(); await r.startDaily(); assert.equal(r.state.currentLevel,'D');
  const lives=r.player.lives; r.player.invuln=0; r.damagePlayer(); assert.equal(r.player.lives,lives-1);
  r.player.invuln=0; r.player.lives=1; r.damagePlayer(); assert.equal(r.state.running,false);
  assert.ok(r.messages.some(m=>m.message.mode==='daily_game_over'));
  await r.startDaily(); assert.equal(r.player.lives,3); assert.equal(r.state.running,true);
});

test('restart resets shot cooldown and interruption during loading requires resume', async () => {
  const r=await boot(); await r.startOrRestart();
  for(let i=0;i<120;i++) r.frame(); r.shoot(); await r.startOrRestart(); r.shoot();
  assert.equal(r.state.projectiles.length,1);
  const starting=r.startOrRestart(); r.win.emit('blur'); await starting;
  assert.equal(r.state.paused,true); assert.equal(r.elements.get('panel').hidden,false);
  r.elements.get('btnPause').click(); assert.equal(r.state.paused,false);
});

test('missing artwork keeps the game playable using existing render fallbacks', async () => {
  const r=await boot({failAssets:true}); await r.startOrRestart(); r.render();
  assert.equal(r.state.running,true); assert.equal(r.calls.filter(c=>c[0]==='drawImage').length,0);
  assert.ok(r.calls.some(c=>c[0]==='fillRect'));
});

test('rapid start taps serialize level loads and asset failure gives a recoverable menu', async () => {
  const r=await boot(); const first=r.startOrRestart(); const second=r.startOrRestart();
  assert.equal(r.state.loading,true); await Promise.all([first,second]); assert.equal(r.state.running,true);
  const failed=await boot({failLevels:true}); await failed.startOrRestart();
  assert.equal(failed.state.loading,false); assert.equal(failed.state.running,false);
  assert.equal(failed.elements.get('panel').hidden,false); assert.equal(failed.elements.get('btnStart').disabled,false);
  assert.equal(failed.elements.get('pauseMessage').hidden,false); await settle();
});
