const test=require('node:test'),assert=require('node:assert/strict');
const {boot,elements,saved}=require('./helpers/racer-runtime.cjs');
const wait=()=>new Promise(resolve=>setTimeout(resolve,100));
async function close(r){await wait();r.audio.dispose();r.app.destroy();}
function selectJob(index){elements.get('careerJobs').emit('click',{target:{closest:()=>({dataset:{job:String(index)}})}});}
test('actual traffic and rival collisions slow the player, react and permit recovery without a game over',async()=>{
 saved.clear();elements.get('routeSelect').value='0';const r=boot();await wait();r.startGame();r.state.mode='running';
 r.spawnTrafficCar();const other=r.trafficCars.at(-1);const before=r.state.roadSpeed;other.setLocalPosition(r.playerCar.getLocalPosition());r.updateTraffic(0);
 assert.equal(r.state.mode,'running');assert.ok(r.state.roadSpeed<before);assert.equal(r.state.impacts,1);assert.ok(r.state.condition<100);assert.ok(other.getLocalPosition().z<8);
 other.setLocalPosition(r.playerCar.getLocalPosition());r.updateTraffic(0);assert.equal(r.state.impacts,1,'contact cooldown prevents repeated penalties');
 r.setNitro(true);r.updatePlayer(.1);assert.ok(r.state.impactFactor<1,'Nitro does not erase impact recovery');r.setNitro(false);
 for(let i=0;i<400;i++)r.updatePlayer(1/60);assert.equal(r.state.impactFactor,1);assert.ok(r.state.roadSpeed>=r.state.baseSpeed*.99);
 r.state.contactCooldown=0;const rival=r.rivalCars[0];rival.progress=r.state.levelDistance;rival.setLocalPosition(r.playerCar.getLocalPosition());
 assert.ok(r.resolveContact(rival,rival.rivalSpeed));assert.equal(r.state.mode,'running');assert.ok(rival.progress>r.state.levelDistance);assert.ok(rival.impactFactor<1);
 r.spawnHazard();const h=r.hazards.at(-1);h.setLocalPosition(r.playerCar.getLocalPosition());r.state.contactCooldown=0;r.updateHazards(0);assert.equal(r.hazards.length,0);assert.equal(r.state.mode,'running');
 r.resetWorld();assert.equal(r.state.condition,100);assert.equal(r.state.impactFactor,1);assert.equal(r.state.impacts,0);await close(r);
});
test('rival progress is not pinned, wheel motion uses each car speed and pause freezes recovery',async()=>{
 elements.get('routeSelect').value='0';const r=boot();await wait();r.resetWorld();r.state.mode='running';
 const car=r.rivalCars[0];car.progress=10000;const progress=car.progress,spin=car.wheelSpin;r.updateRivals(.1);
 assert.ok(car.progress>progress);assert.equal(car.enabled,false);assert.ok(Math.abs(car.wheelSpin-spin-car.rivalSpeed*.1*220)<1e-7);
 r.state.impactFactor=.5;r.state.contactCooldown=.5;r.togglePause(true);r.updateGame(.5);
 assert.equal(r.state.impactFactor,.5);assert.equal(r.state.contactCooldown,.5);assert.equal(r.state.raceTime,0);r.togglePause(false);
 elements.get('brakeBtn').emit('pointerdown');r.handleKeyboard();const speed=r.state.roadSpeed;r.updatePlayer(.2);assert.ok(r.state.brakeHeld);assert.ok(r.state.roadSpeed<speed);
 elements.get('brakeBtn').emit('pointercancel');r.handleKeyboard();assert.equal(r.state.brakeHeld,false);await close(r);
});
test('the actual career flow retains legacy purchases, starts the family coupe, evaluates jobs and restores the arcade car',async()=>{
 saved.clear();elements.get('routeSelect').value='campaign';const r=boot({coins:2222,bestScore:777,owned:{'mclaren-senna':true,'audi-r8':true},selectedCar:'audi-r8',upgrades:{speed:1,handling:1,nitro:1}});await wait();
 elements.get('driverName').value='Rae';elements.get('driverLook').value='ocean';elements.get('driverIdentity').value='precision';r.launchCareer();
 assert.equal(r.state.careerJob.id,'first-green');assert.equal(r.state.rivalsTotal,1);assert.equal(r.state.totalLaps,1);assert.equal(r.levelRaceDistance(),1100);assert.equal(r.profile.selectedCar,'audi-r8');
 assert.equal(r.career.data.driver.name,'Rae');assert.equal(r.state.level,9);assert.ok(document.body.classList.contains('rain-race'));
 let paint;r.playerCar.importedModel.forEach(node=>node.render?.meshInstances.forEach(mi=>{if(mi.material.name==='Ceramic metallic paint')paint=mi.material;}));
 assert.ok(paint);assert.ok(Math.abs(paint.diffuse.r-.08)<1e-6,'the family coupe uses the selected faded paint');
 r.state.mode='running';r.state.raceTime=30;r.rivalCars[0].progress=r.state.levelDistance-10;r.endGame(true);
 assert.equal(elements.get('gameOverTitle').textContent,'Job Complete!');assert.ok(r.career.data.completed['first-green']);assert.equal(r.profile.coins,2402);assert.equal(r.career.data.reputation,45);
 r.endGame(true);assert.equal(r.profile.coins,2402,'ending is idempotent');
 r.returnToMenu();assert.equal(r.state.careerJob,null);assert.equal(r.profile.selectedCar,'audi-r8');assert.equal(r.profile.upgrades.speed,1);
 selectJob(1);r.launchCareer();assert.equal(r.state.careerJob.loaner,true);r.state.mode='running';r.state.condition=54;r.state.raceTime=30;r.endGame(true);
 assert.equal(elements.get('gameOverTitle').textContent,'Try This Job Again');assert.equal(r.profile.coins,2402);assert.equal(r.career.unlocked(2),false);
 r.resetWorld();r.state.mode='running';r.state.condition=90;r.state.raceTime=31;r.endGame(true);assert.equal(r.career.unlocked(2),true);assert.ok(r.profile.coins>2402);
 assert.ok(saved.has('high-spead-racer-city-legends-v1'));assert.ok(saved.has('high-spead-racer-profile-v1'));await close(r);
});
test('all six story jobs complete through actual race progression; failed requirements do not unlock the next job',async()=>{
 saved.clear();elements.get('routeSelect').value='campaign';const r=boot();await wait();
 for(let i=0;i<r.career.JOBS.length;i++){
  selectJob(i);elements.get('driverName').value='Alex';r.launchCareer();assert.equal(r.state.careerJob.id,r.career.JOBS[i].id);
  r.state.mode='running';r.state.raceTime=25;r.state.boostSeconds=9;r.state.condition=95;
  r.rivalCars.forEach(car=>car.progress=r.state.levelDistance-20);
  r.advanceLevel();assert.ok(r.career.data.completed[r.career.JOBS[i].id]);assert.equal(r.state.mode,'ended');r.returnToMenu();
 }
 assert.equal(r.career.next(),-1);assert.match(elements.get('garageCareer').textContent,/Crew garage/);
 elements.get('routeSelect').value='campaign';r.startGame();assert.equal(r.state.rivalsTotal,7);assert.equal(r.state.totalLaps,3);assert.equal(r.state.careerJob,null);await close(r);
});
test('a deterministic driver can earn all six jobs through full driving, including a recoverable failed attempt',async()=>{
 saved.clear();elements.get('routeSelect').value='campaign';const r=boot();await wait();
 const originalRandom=Math.random;let seed=4107;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const attempts=[];
 try{
  for(let attempt=0;attempt<15&&r.career.next()>=0;attempt++){
   const index=r.career.next();selectJob(index);elements.get('driverName').value='Driver';r.launchCareer();
   assert.equal(r.state.careerJob.id,r.career.JOBS[index].id);
   for(let frame=0;frame<30*120&&r.state.mode!=='ended';frame++){
    const risk=[0,0,0];
    for(const obj of [...r.trafficCars,...r.rivalCars,...r.hazards]){
     const z=obj.getLocalPosition().z,speed=obj.rivalSpeed??obj.baseSpeed??0,future=z+(r.state.roadSpeed-speed)*1.2;
     if(z>-45&&z<22||future>-8&&future<15)risk[obj.laneIndex]+=Math.max(0,65-Math.abs(8-z))+(obj.isRival?5:0);
    }
    const lane=r.state.targetLaneIndex;let best=lane;for(let k=0;k<3;k++)if(risk[k]+Math.abs(k-lane)*3<risk[best])best=k;
    if(best<lane)r.moveLeft();if(best>lane)r.moveRight();r.setNitro(risk[r.state.targetLaneIndex]<20);r.updateGame(1/30);
    assert.ok(r.trafficCars.length<=16);assert.equal(r.hazards.length,0);
   }
   assert.equal(r.state.mode,'ended');attempts.push({job:index,time:r.state.raceTime,contacts:r.state.impacts,won:!!r.career.data.completed[r.state.careerJob.id]});
   r.returnToMenu();
  }
  assert.equal(r.career.next(),-1,JSON.stringify(attempts));assert.ok(attempts.some(x=>x.contacts>0&&x.won),'contacts cost time but races remain winnable');
  assert.ok(attempts.every(x=>x.time>15&&x.time<120));
 } finally {Math.random=originalRandom;await close(r);}
});
