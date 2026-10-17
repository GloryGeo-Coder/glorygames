const test=require('node:test'),assert=require('node:assert/strict');
const {boot,elements,document,win,saved}=require('./helpers/racer-runtime.cjs');
test('actual PlayCanvas parses the new GLBs and retains the full playable racer',async()=>{
  const r=boot({coins:5000,bestScore:1777,owned:{'red-viper':true,'blue-bolt':true},selectedCar:'blue-bolt',upgrades:{speed:2,handling:1,nitro:2}});
  await new Promise(resolve=>setTimeout(resolve,100));
  assert.equal(r.LEVELS.length,6);assert.equal(r.state.totalLaps,3);assert.equal(r.profile.selectedCar,'dodge-challenger');
  assert.equal(r.profile.coins,5000);assert.equal(r.profile.bestScore,1777);assert.equal(r.profile.upgrades.speed,2);
  assert.ok(r.playerCar.importedModel,'real GLB vehicle attached');assert.equal(r.playerCar.wheels.length,4);assert.ok(r.playerCar.glbWheels);
  assert.ok(r.CONTINUOUS_ROAD.loaded,'real GLB road attached');assert.equal(r.CONTINUOUS_ROAD.instances.length,5);
  assert.equal(elements.get('startBtn').disabled,false);
  r.startGame();r.togglePause(true);r.updateGame(1);assert.equal(r.state.countdown,3.4);r.togglePause(false);r.updateGame(3.5);assert.equal(r.state.mode,'running');
  assert.equal(r.rivalCars.length,7);r.moveLeft();r.updatePlayer(.1);assert.equal(r.state.targetLaneIndex,0);
  r.moveRight();r.updatePlayer(.1);assert.equal(r.state.targetLaneIndex,1);
  const oldNitro=r.state.nitro;r.setNitro(true);r.handleKeyboard();r.updatePlayer(.1);
  assert.ok(r.state.nitroHeld);assert.ok(r.state.nitro<oldNitro);assert.ok(r.state.boostFactor>1);
  r.setNitro(false);r.togglePause(true);const distance=r.state.distance;r.updateGame(.1);
  assert.equal(r.state.distance,distance);assert.equal(r.state.mode,'paused');r.togglePause(false);
  document.hidden=true;document.emit('visibilitychange');assert.equal(r.state.mode,'paused');document.hidden=false;r.togglePause(false);
  r.state.score=12345;r.postScore(true);assert.ok(win.messages.some(m=>m.type==='GG_SCORE'&&m.score===12345));
  r.endGame(false);assert.equal(r.state.mode,'ended');assert.ok(r.profile.bestScore>=12345);assert.ok(saved.has('high-spead-racer-profile-v1'));
  r.resetWorld();assert.equal(r.state.score,0);assert.equal(r.state.mode,'countdown');
  for(let i=0;i<5;i++)r.advanceLevel();assert.equal(r.state.level,5);r.advanceLevel();assert.equal(r.state.finishedCampaign,true);
  assert.equal(r.state.mode,'ended');
  for(let i=0;i<5;i++){r.resetWorld();for(let j=0;j<3;j++)r.spawnTrafficCar();}
  assert.equal(r.modelCars.traffic.size,r.rivalCars.length+r.trafficCars.length,'destroyed cars do not accumulate in model registry');
  r.resetWorld();r.state.mode='running';r.spawnTrafficCar();
  const car=r.trafficCars.at(-1);car.setLocalPosition(r.playerCar.getLocalPosition());r.updateTraffic(0);
  assert.equal(r.state.mode,'ended','actual collision ends the race');
  r.app.render();r.app.destroy();
});

test('failed visual downloads retain the playable fallback and unlock the start button',async()=>{
  const r=boot(null,{failAssets:true});await new Promise(resolve=>setTimeout(resolve,100));
  assert.equal(elements.get('startBtn').disabled,false);assert.equal(r.CONTINUOUS_ROAD.loaded,false);
  assert.equal(r.playerCar.fallbackMesh.enabled,true);assert.match(elements.get('loadingStatus').textContent,/still race/);
  r.startGame();r.updateGame(3.5);r.updatePlayer(.1);assert.equal(r.state.mode,'running');r.app.destroy();
});
