import test from 'node:test';
import assert from 'node:assert/strict';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import { citySave, moveIn, householdsFor, SERVICE_SECONDS } from '../public/games/brick-playground-3d/settlement.mjs';
import { newTrip, tripRuntime, entrance, isServiceEntrance } from '../public/games/brick-playground-3d/resident-trip.mjs';
import { openMarket, stepHousehold, nextCustomer } from '../public/games/brick-playground-3d/market-day.mjs';
import { setWorkShift } from '../public/games/brick-playground-3d/work-shift.mjs';
import { setRoutine, skipToDeparture } from '../public/games/brick-playground-3d/resident-routines.mjs';
const reopen=city=>loadWorld('city',{getItem:key=>key===saveKey('city')?citySave(city):null});
function fixture(two=false){
 const city=world('city');
 const [home,door,home2,shop]=[-13,11,35,59].map((x,i)=>({id:'service-door-'+i,type:'door',color:'Lagoon',x,y:0,z:4,r:0}));
 city.pieces=[home,door,home2,shop];city.blocks[28]={name:'Neighbourhood Service',zone:'civic'};
 city.streets=['h-3-4','h-4-4','h-5-4','h-6-4'];assert.ok(isServiceEntrance(city,door));
 const trip=newTrip(home,door,city);trip.service={visits:0};assert.ok(moveIn(city,'Thandi','service',trip));
 if(two){const second=newTrip(home2,door,city);second.service={visits:0};assert.ok(moveIn(city,'Ayanda','service',second));}
 openMarket(city,shop.id);city.transport={pickup:'h-3-4',dropoff:'h-4-4',stage:2};city.shopStock=[{shop:shop.id,units:4}];
 return {city,home,door,shop};
}
function simulation(city){const runtimes=new Map();let maximumStep=0;return {runtimes,get maximumStep(){return maximumStep;},tick(n=1){for(let i=0;i<n;i++)for(const p of householdsFor(city)){const t=city[p.key];if(!t)continue;if(!runtimes.has(p.key))runtimes.set(p.key,tripRuntime());const old={x:t.x,z:t.z};stepHousehold(city,p,t,runtimes.get(p.key),1/60);maximumStep=Math.max(maximumStep,Math.hypot(t.x-old.x,t.z-old.z));}},until(predicate,limit=20000){for(let i=0;i<limit;i++){if(predicate())return;this.tick();}assert.ok(predicate(),'simulation reached target');}};}

test('adult physically reaches service, completes eight seconds once, and returns home',()=>{
 const {city,home,door}=fixture(),t=city.family1,sim=simulation(city);assert.equal(SERVICE_SECONDS,8);
 sim.until(()=>t.phase==='shopping');assert.equal(t.service.visits,0);assert.equal(t.wait,8);
 assert.ok(Math.hypot(t.x-entrance(door).inside.x,t.z-entrance(door).inside.z)<.025);
 sim.tick(420);assert.equal(t.service.visits,0);assert.ok(t.wait>0&&t.wait<1.1);
 sim.until(()=>t.returning);assert.equal(t.service.visits,1);sim.until(()=>t.phase==='done');sim.tick(300);
 assert.equal(t.service.visits,1);assert.ok(Math.hypot(t.x-entrance(home).inside.x,t.z-entrance(home).inside.z)<.025);assert.ok(sim.maximumStep<.1);
 const p=householdsFor(city).find(p=>p.key==='family1');assert.notEqual(p.family,true);assert.equal(t.school,undefined);assert.equal(t.work,undefined);
});

test('paused service dwell reloads exactly and cannot award a duplicate service visit on return reload',()=>{
 const {city}=fixture(),sim=simulation(city);sim.until(()=>city.family1.phase==='shopping');sim.tick(120);city.family1.paused=true;
 const saved=structuredClone(city.family1);sim.tick(600);assert.deepEqual(city.family1,saved);
 const restored=reopen(city),after=simulation(restored);assert.deepEqual(restored.family1,saved);after.tick(60);assert.deepEqual(restored.family1,saved);
 restored.family1.paused=false;after.until(()=>restored.family1.returning);assert.equal(restored.family1.service.visits,1);
 const returning=reopen(restored),last=simulation(returning);last.until(()=>returning.family1.phase==='done');last.tick(300);assert.equal(returning.family1.service.visits,1);
});

test('changing Civic land use during service visit freezes countdown until repaired',()=>{
 const {city,door}=fixture(),sim=simulation(city);sim.until(()=>city.family1.phase==='shopping');sim.tick(60);
 const saved=city.blocks[28],remaining=city.family1.wait;city.blocks={...city.blocks,28:{...saved,zone:'homes'}};sim.tick(600);
 assert.equal(isServiceEntrance(city,door),false);assert.match(sim.runtimes.get('family1').issue,/service/i);assert.equal(city.family1.wait,remaining);assert.equal(city.family1.service.visits,0);
 city.blocks={...city.blocks,28:saved};sim.until(()=>city.family1.phase==='done');assert.equal(city.family1.service.visits,1);
});

test('a blocked doorway earns no service visit and resumes physical route after reload and repair',()=>{
 const {city}=fixture();city.pieces=[...city.pieces,{id:'obstruction',type:'single',color:'Plum',x:12,y:0,z:5,r:0}];
 const sim=simulation(city);sim.tick(12000);assert.equal(city.family1.service.visits,0);assert.ok(sim.runtimes.get('family1').issue);
 const restored=reopen(city);restored.pieces=restored.pieces.filter(p=>p.id!=='obstruction');const after=simulation(restored);after.until(()=>restored.family1.phase==='done');assert.equal(restored.family1.service.visits,1);assert.ok(after.maximumStep<.1);
});

test('two service adults queue separately and do not consume supplies, purchase or alter cargo',()=>{
 const {city}=fixture(true),sim=simulation(city),stock=structuredClone(city.shopStock),cargo=structuredClone(city.transport);
 sim.until(()=>city.family1.phase==='shopping'||city.family2.phase==='shopping');assert.notEqual(city.family1.phase,city.family2.phase);
 assert.ok(Math.hypot(city.family1.x-city.family2.x,city.family1.z-city.family2.z)>=.65);assert.equal(nextCustomer(city),undefined);
 sim.until(()=>city.family1.phase==='done'&&city.family2.phase==='done');assert.equal(city.family1.service.visits,1);assert.equal(city.family2.service.visits,1);
 assert.deepEqual(city.shopStock,stock);assert.deepEqual(city.transport,cargo);assert.equal(city.market.receipts.length,0);assert.ok(sim.maximumStep<.1);
});

test('dedicated ground-floor service entrance rejects other use and wrong land use',()=>{
 const {city,door,home}=fixture();assert.equal(isServiceEntrance(city,{...door,y:1}),false);
 assert.equal(openMarket({...city,market:undefined},door.id),false);
 const otherHome=city.pieces.find(p=>p.id==='service-door-2'),work=newTrip(otherHome,door,city);setWorkShift(work,8,17);assert.equal(moveIn(city,'Worker','work',work),null);
 const school=newTrip(otherHome,door,city);school.school={lessons:0};assert.equal(moveIn(city,'Learner','school',school),null);
 const wrong=newTrip(otherHome,home,city);wrong.service={visits:0};
 assert.equal(isServiceEntrance(city,home),false);
 // Low-level restoration retains a damaged assignment so land-use edits remain repairable.
 assert.ok(moveIn(city,'Wrong service','service',wrong));const sim=simulation(city);sim.tick(600);
 assert.match(sim.runtimes.get('family2').issue,/service/i);assert.equal(wrong.service.visits,0);
});

test('repeating service routine requires another real visit and dwell',()=>{
 const {city}=fixture();setRoutine(city.family1,8);city.clockMinutes=450;const sim=simulation(city);sim.until(()=>city.family1.phase==='done');
 assert.equal(city.family1.service.visits,1);assert.ok(skipToDeparture(city));sim.until(()=>city.family1.phase==='shopping');assert.equal(city.family1.wait,8);assert.equal(city.family1.service.visits,1);
 sim.until(()=>city.family1.phase==='done');assert.equal(city.family1.service.visits,2);
});

test('service saves reject malformed service visit counters and preserve exact valid dwell',()=>{
 const {city}=fixture(),sim=simulation(city);sim.until(()=>city.family1.phase==='shopping');sim.tick(90);
 assert.equal(reopen(city).family1.wait,city.family1.wait);
 for(const visits of [-1,Infinity,Number.MAX_SAFE_INTEGER+1,'2']){
   const raw=JSON.parse(citySave(city));raw.family1.service={visits};
   const invalid=loadWorld('city',{getItem:key=>key===saveKey('city')?JSON.stringify(raw):null});
   assert.equal(invalid.family1,undefined,'invalid service household is not restored');
 }
});

test('missing street halts a service commute without awarding a service visit, then repairs continuously',()=>{
 const {city}=fixture();city.streets=[];const sim=simulation(city);sim.tick(12000);assert.equal(city.family1.service.visits,0);assert.ok(sim.runtimes.get('family1').issue);
 const position={x:city.family1.x,z:city.family1.z};sim.tick(120);assert.deepEqual({x:city.family1.x,z:city.family1.z},position);
 city.streets=['h-3-4','h-4-4','h-5-4','h-6-4'];sim.until(()=>city.family1.phase==='done');assert.equal(city.family1.service.visits,1);assert.ok(sim.maximumStep<.1);
});


test('blocked service interior freezes dwell through reload until the floor is cleared',()=>{
 const {city,door}=fixture(),sim=simulation(city);sim.until(()=>city.family1.phase==='shopping');sim.tick(90);
 const inside=entrance(door).inside, remaining=city.family1.wait;
 city.pieces=[...city.pieces,{id:'indoor-block',type:'single',color:'Plum',x:Math.floor(inside.x),y:0,z:Math.floor(inside.z),r:0}];
 sim.tick(600);assert.equal(city.family1.wait,remaining);assert.equal(city.family1.service.visits,0);assert.match(sim.runtimes.get('family1').issue,/space|blocked/i);
 const restored=reopen(city),after=simulation(restored);after.tick(60);assert.equal(restored.family1.wait,remaining);
 restored.pieces=restored.pieces.filter(p=>p.id!=='indoor-block');after.until(()=>restored.family1.phase==='done');assert.equal(restored.family1.service.visits,1);
});

test('shared service queue reloads with one visitor inside and completes each visit once',()=>{
 const {city}=fixture(true),sim=simulation(city);sim.until(()=>city.family1.phase==='shopping'||city.family2.phase==='shopping');
 const restored=reopen(city),after=simulation(restored);assert.deepEqual(restored.family1,city.family1);assert.deepEqual(restored.family2,city.family2);
 after.until(()=>restored.family1.phase==='done'&&restored.family2.phase==='done');
 assert.equal(restored.family1.service.visits,1);assert.equal(restored.family2.service.visits,1);assert.ok(after.maximumStep<.1);
});

test('community service has a distinct journey summary and invalid time cannot grant completion',async()=>{
 const {journeySummary}=await import('../public/games/brick-playground-3d/citizen-journey.mjs');
 const {city}=fixture(),sim=simulation(city);sim.until(()=>city.family1.phase==='shopping');
 const profile=householdsFor(city).find(p=>p.key==='family1'),t=city.family1,rt=sim.runtimes.get('family1');
 assert.match(journeySummary(city,profile,t),/At community service · 8 seconds remaining/);
 for(const dt of [NaN,Infinity,-10])stepHousehold(city,profile,t,rt,dt);
 assert.equal(t.wait,8);assert.equal(t.service.visits,0);
 stepHousehold(city,profile,t,rt,100);assert.equal(t.wait,7.9);assert.equal(t.service.visits,0);
});
