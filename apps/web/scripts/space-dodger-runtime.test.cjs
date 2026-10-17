const test=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('./helpers/starfall-runtime.cjs');
const wait=()=>new Promise(r=>setTimeout(r,150));
async function close(r){await wait();r.scene?.dispose();r.engine?.dispose();}
test('the shipped Babylon engine imports actual solid spacecraft, enemies and fortress models',async()=>{
 const r=boot();await wait();assert.equal(r.LEVELS.length,18);assert.ok(r.playerRoot.metadata.starfallGLB);assert.equal(r.playerRoot.metadata.starfallGLB,'player');
 assert.ok(r.playerRoot.getChildMeshes().some(m=>m.name.includes('StarfallGLB')&&m.getTotalVertices()>0));r.startGame();
 const nose=r.playerRoot.getChildMeshes().find(m=>m.name.includes('Nose'));nose.computeWorldMatrix(true);assert.ok(nose.getBoundingInfo().boundingBox.centerWorld.z>1,'the nose faces the +Z flight direction');
 assert.ok(r.playerRoot.getChildMeshes().some(m=>m.name.includes('StarfallGLB')&&m.isEnabled()&&m.isVisible));
 for(const type of ['scout','darter','turret','heavy','shield'])r.spawnEnemy(type);r.state.levelIndex=17;r.spawnBoss();await wait();
 assert.ok(r.state.boss.mesh.metadata.starfallGLB);assert.ok(r.pools.objects.filter(o=>o.kind==='enemy').every(o=>o.mesh.metadata.starfallGLB));r.scene.render();await close(r);
});
test('lasers sweep their travelled path, combat effects are defined and fading effects do not fade shared ship materials',async()=>{
 const r=boot();await wait();r.startGame();r.clearWorld();r.spawnEnemy('scout');const target=r.pools.objects.at(-1);target.mesh.position.set(0,0,5);target.hp=1;
 const alpha=r.mats.cyanGlow.alpha;r.firePlayerLaser();r.updateLasers(.12);assert.equal(r.state.kills,1);assert.ok(r.state.score>0);assert.ok(r.pools.particles.length>0);
 r.updateParticles(1);assert.equal(r.mats.cyanGlow.alpha,alpha);assert.equal(r.pools.particles.length,0);await close(r);
});
test('pickups, manual plasma, damage protection, reboots and retry remain usable',async()=>{
 const r=boot();await wait();r.startGame();
 for(const type of ['core','shield','repair','double','magnet','slow','plasma']){r.spawnPowerup(type);r.collectPickup(r.pools.objects.at(-1));}
 assert.equal(r.state.cores,1);assert.ok(r.state.doubleLaser>0&&r.state.magnet>0&&r.state.slowMo>0);assert.equal(r.state.plasma,1);r.launchPlasma();assert.equal(r.state.plasma,0);assert.ok(r.pools.lasers.some(l=>l.plasma&&l.damage===9));
 r.state.shield=0;r.damagePlayer(90);const hull=r.state.hull;r.damagePlayer(90);assert.equal(r.state.hull,hull,'one overlap cannot drain the hull every frame');
 r.state.invulnerable=0;r.damagePlayer(90);assert.equal(r.state.lives,2);assert.equal(r.state.hull,100);assert.equal(r.state.status,'playing');
 r.state.lives=1;r.state.invulnerable=0;r.state.shield=0;r.damagePlayer(120);assert.equal(r.state.status,'ended');r.retryMission();assert.equal(r.state.lives,3);assert.equal(r.state.status,'playing');await close(r);
});
test('pause freezes flight and pending sector jumps; checkpoints resume with legacy best score intact',async()=>{
 const saved=new Map([['wga_space_dodger_starfall_odyssey_v3',JSON.stringify({bestScore:9876})]]);const r=boot({saved});await wait();r.startGame();assert.equal(r.state.bestScore,9876);
 r.state.cores=8;r.state.kills=4;r.state.elapsed=65;r.checkLevelComplete();assert.equal(r.state.status,'transition');assert.equal(r.campaign.data.unlocked,2);
 r.elements.get('pauseBtn').click();r.step(4);assert.equal(r.state.status,'paused');assert.equal(r.state.levelIndex,0);
 r.elements.get('resumeBtn').click();r.step(2.3);assert.equal(r.state.levelIndex,1);assert.equal(r.state.status,'playing');
 r.elements.get('pauseBtn').click();const elapsed=r.state.elapsed;r.step(5);assert.equal(r.state.elapsed,elapsed);
 r.elements.get('pauseHangarBtn').click();assert.equal(r.state.status,'menu');assert.ok(saved.has('wga_starfall_campaign_v4'));await close(r);
 const restored=boot({saved});await wait();restored.elements.get('sectorSelect').value='continue';restored.startGame();assert.equal(restored.state.levelIndex,1);assert.equal(restored.state.bestScore,9876);await close(restored);
});
test('new rescue, relay, gate and escort objectives are backed by actual encounters',async()=>{
 const r=boot();await wait();r.beginLevel(12);r.spawnPowerup('rescue');const pod=r.pools.objects.at(-1);pod.mesh.position.copyFrom(r.playerRoot.position);r.updateObjects(0);assert.equal(r.state.rescues,1);
 r.beginLevel(14);r.spawnRelay();const relay=r.pools.objects.at(-1);relay.mesh.position.set(0,0,5);r.state.plasma=1;r.launchPlasma();r.updateLasers(.1);assert.equal(r.state.relays,1);
 r.beginLevel(16);r.spawnGate();r.pools.objects.at(-1).mesh.position.copyFrom(r.playerRoot.position);r.updateObjects(0);assert.equal(r.state.gates,1);
 r.beginLevel(15);assert.equal(r.state.escortHull,100);r.state.escortHull=0;r.updateEncounters(.02);assert.equal(r.state.status,'ended');r.retryMission();assert.equal(r.state.escortHull,100);
 r.beginLevel(13);r.state.elapsed=1.8;r.playerRoot.position.x=-r.PLAYER_LIMIT.x*.68;r.updateEncounters(.02);assert.ok(r.state.hull<100||r.state.shield<25);assert.match(r.elements.get('sectorAlert').textContent,/DISCHARGE/);await close(r);
});
test('boss shield windows block ordinary fire, plasma breaks through and a defeated boss cannot respawn',async()=>{
 const r=boot();await wait();r.beginLevel(3);r.spawnBoss();const boss=r.state.boss;boss.mesh.position.set(0,0,10);boss.shielded=true;boss.hp=8;
 r.firePlayerLaser();r.updateLasers(.2);assert.equal(boss.hp,8);r.state.plasma=1;r.launchPlasma();r.updateLasers(.2);
 assert.equal(r.state.boss,null);assert.equal(r.state.bossDefeated,true);assert.equal(r.state.status,'transition');r.step(2.3);assert.equal(r.state.levelIndex,4);await close(r);
});
test('every original and added sector can advance through the real game state machine',async()=>{
 const r=boot();await wait();
 for(let i=0;i<18;i++){
  r.beginLevel(i);const lv=r.LEVELS[i];Object.assign(r.state,{hull:100,cores:lv.cores,kills:lv.kills,elapsed:lv.duration,rescues:lv.rescues||0,relays:lv.relays||0,gates:lv.gates||0});
  if(lv.boss){r.spawnBoss();r.state.boss.hp=1;r.state.boss.shielded=false;r.state.boss.mesh.position.set(0,0,10);r.firePlayerLaser();r.updateLasers(.2);}else r.checkLevelComplete();
  assert.ok(r.campaign.data.best[i],lv.name);assert.equal(r.state.status,i===17?'ended':'transition',lv.name);
  if(i<17){r.step(2.3);assert.equal(r.state.levelIndex,i+1);}
 }
 assert.equal(r.campaign.data.unlocked,18);assert.match(r.elements.get('endTitle').textContent,/Restored/);await close(r);
});
test('portrait flight bounds keep the ship within the actual camera viewport; failed models keep solid geometry playable',async()=>{
 const r=boot({width:390,height:844});await wait();r.startGame();assert.ok(r.PLAYER_LIMIT.x<5);r.playerRoot.position.x=r.PLAYER_LIMIT.x;r.scene.render();
 const {B}=require('./helpers/starfall-runtime.cjs');const projected=B.Vector3.Project(r.playerRoot.position,B.Matrix.Identity(),r.scene.getTransformMatrix(),r.camera.viewport.toGlobal(390,844));assert.ok(projected.x>0&&projected.x<390);
 r.win.innerWidth=844;r.win.innerHeight=390;r.resizeFlight();assert.ok(r.PLAYER_LIMIT.x>5);await close(r);
 const failed=boot({failAssets:true});await wait();failed.startGame();failed.step(.016);assert.equal(failed.state.status,'playing');assert.ok(failed.playerRoot.getChildMeshes().some(m=>m.name==='playerBody'&&m.isEnabled()));await close(failed);
});
test('compatibility renderer collects the same new objectives, pauses and records completed sectors',()=>{
 const r=boot({webgl:false,width:844,height:390});r.startGameFallback(true);assert.equal(r.fb.h,390);r.state.levelIndex=12;
 r.spawnObject('rescue');const rescue=r.fb.objects.at(-1);rescue.x=r.ship.x;rescue.y=r.ship.y;r.updateFallback(0);assert.equal(r.state.rescues,1);
 r.state.levelIndex=16;r.spawnObject('gate');const gate=r.fb.objects.at(-1);gate.x=r.ship.x;gate.y=r.ship.y;r.updateFallback(0);assert.equal(r.state.gates,1);
 r.elements.get('pauseBtn').click();const elapsed=r.state.elapsed;r.updateFallback(3);assert.equal(r.state.elapsed,elapsed);r.elements.get('resumeBtn').click();
 r.state.levelIndex=0;Object.assign(r.state,{cores:8,kills:4,elapsed:65});r.updateFallback(0);assert.equal(r.state.status,'transition');r.updateFallback(2.3);assert.equal(r.state.levelIndex,1);
 r.endFallback(false);assert.ok(r.win.messages.some(m=>m.final===true&&m.game==='space-dodger-starfall-odyssey'));
});
test('compatibility mode starts and preserves all eighteen campaign sectors',()=>{
 const r=boot({webgl:false});assert.equal(r.LEVELS.length,18);r.startGameFallback(true);r.updateFallback(1/30);r.drawFallback();assert.equal(r.state.status,'playing');assert.ok(r.fb.objects.length>0);
});
test('simultaneous mobile controls and keyboard input release cleanly on cancel and backgrounding',async()=>{
 const r=boot();await wait();r.startGame();r.elements.get('autoFire').checked=false;
 r.elements.get('right').emit('pointerdown',{pointerId:1});r.elements.get('fireBtn').emit('pointerdown',{pointerId:2});assert.equal(r.state.input.x,1);assert.equal(r.state.input.fire,true);
 r.elements.get('fireBtn').emit('pointercancel',{pointerId:2});assert.equal(r.state.input.fire,false);assert.equal(r.state.input.x,1);
 r.elements.get('right').emit('pointerup',{pointerId:1});assert.equal(r.state.input.x,0);
 r.win.emit('keydown',{code:'KeyW'});r.win.emit('keydown',{code:'ShiftLeft'});assert.equal(r.state.input.y,1);assert.equal(r.state.input.boost,true);
 r.doc.hidden=true;r.doc.emit('visibilitychange');assert.equal(r.state.status,'paused');assert.deepEqual(r.state.input,{x:0,y:0,fire:false,boost:false});await close(r);
});
test('restarts dispose transient models/effects, retain stable scene resources and reliably supply mission cores',async()=>{
 const r=boot();await wait();r.startGame();r.updateSpawns(.01);assert.ok(r.pools.objects.some(o=>o.kind==='pickup'&&o.type==='core'));
 await wait();const baseline=r.scene.materials.length;
 for(let i=0;i<12;i++){r.spawnEnemy('scout');r.createExplosionSprite(r.playerRoot.position);r.makeRingEffect(r.playerRoot.position);r.clearWorld();}
 await wait();assert.equal(r.pools.objects.length,0);assert.equal(r.pools.particles.length,0);assert.ok(r.presentation.roots.size<25);assert.ok(r.scene.materials.length<=baseline+3);
 r.beginLevel(0);assert.equal(r.state.cores,0);assert.equal(r.state.bossDefeated,false);r.updateSpawns(.01);assert.ok(r.pools.objects.some(o=>o.type==='core'));await close(r);
});
test('saved mute can be lifted after launch; music/effects volumes and audio pause apply in both renderers',async()=>{
 class Node{constructor(){this.gain={value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}};this.frequency={value:0,setValueAtTime(){}};}connect(n){return n;}start(){}stop(){}}
 class Audio{constructor(){this.state='running';this.currentTime=0;this.sampleRate=1000;this.destination={};Audio.last=this;}createGain(){return new Node();}createOscillator(){return new Node();}createBufferSource(){return new Node();}createBiquadFilter(){return new Node();}createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)};}resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}}
 for(const webgl of [true,false]){
  const saved=new Map([['wga_starfall_audio_v4',JSON.stringify({muted:true,music:.2,effects:.4})]]);const r=boot({webgl,AudioContext:Audio,saved});if(webgl)await wait();
  r.elements.get('startBtn').click();r.elements.get('muteBtn').click();assert.equal(Audio.last.state,'running');
  r.elements.get('musicVolume').value='77';r.elements.get('musicVolume').emit('input');assert.equal(JSON.parse(saved.get('wga_starfall_audio_v4')).music,.77);
  if(webgl)assert.equal(r.audio.musicGain.gain.value,.77);
  r.elements.get('pauseBtn').click();assert.equal(Audio.last.state,'suspended');r.elements.get('resumeBtn').click();assert.equal(Audio.last.state,'running');if(webgl)await close(r);
 }
});
