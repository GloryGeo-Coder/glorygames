import test from 'node:test';
import assert from 'node:assert/strict';
import { world, loadWorld, saveKey } from '../public/games/brick-playground-3d/model.mjs';
import { citySave, moveIn, householdsFor } from '../public/games/brick-playground-3d/settlement.mjs';
import { newTrip, tripRuntime } from '../public/games/brick-playground-3d/resident-trip.mjs';
import { setWorkShift, restoreWorkShift } from '../public/games/brick-playground-3d/work-shift.mjs';
import { tickRoutines, skipToDeparture } from '../public/games/brick-playground-3d/resident-routines.mjs';
import { openMarket, stepHousehold, nextCustomer, callShoppers } from '../public/games/brick-playground-3d/market-day.mjs';

const reopen = city => loadWorld('city', {getItem: key => key === saveKey('city') ? citySave(city) : null});
function fixture(two=false) {
  const city=world('city');
  const [home,shop,home2]=[-13,11,35].map((x,i)=>({id:'work-door-'+i,type:'door',color:'Lagoon',x,y:0,z:4,r:0}));
  city.pieces=[home,shop,home2];city.streets=['h-3-4','h-4-4','h-5-4'];
  openMarket(city,shop.id); // Legacy overlap fixture: assignment guards are tested separately.
  city.resident=newTrip(home,shop);setWorkShift(city.resident,8,17);
  if(two){moveIn(city,'Ayanda','spaza',newTrip(home2,shop));setWorkShift(city.family1,8,17);}
  city.clockMinutes=450;
  return {city,home,shop};
}
function simulation(city) {
  const runtimes=new Map();let maximumStep=0;
  return {runtimes,get maximumStep(){return maximumStep;},tick(n=1,clock=false){
    for(let i=0;i<n;i++){
      if(clock)tickRoutines(city,1/60);
      for(const p of householdsFor(city)){
        const t=city[p.key];if(!t)continue;
        if(!runtimes.has(p.key))runtimes.set(p.key,tripRuntime());
        const old={x:t.x,z:t.z};stepHousehold(city,p,t,runtimes.get(p.key),1/60);
        maximumStep=Math.max(maximumStep,Math.hypot(t.x-old.x,t.z-old.z));
      }
    }
  }};
}

test('real home-work-home walk holds until shift end and counts only after returning',()=>{
  const {city}=fixture();const sim=simulation(city), start={x:city.resident.x,z:city.resident.z};
  assert.equal(city.resident.phase,'done');assert.equal(city.resident.work.completed,0);
  assert.equal(skipToDeparture(city),true);assert.equal(city.clockMinutes,480);
  assert.deepEqual({x:city.resident.x,z:city.resident.z},start,'starting a shift does not teleport');
  sim.tick(12000);assert.equal(city.resident.work.worked,true);assert.equal(city.resident.returning,false);
  const atWork={x:city.resident.x,z:city.resident.z};sim.tick(120);assert.deepEqual({x:city.resident.x,z:city.resident.z},atWork);
  assert.equal(city.resident.work.completed,0);assert.equal(nextCustomer(city),undefined);assert.equal(city.market.receipts.length,0);
  city.clockMinutes=1020;sim.tick(1);assert.equal(city.resident.work.completed,0);
  sim.tick(12000);assert.equal(city.resident.phase,'done');assert.equal(city.resident.work.completed,1);
  assert.ok(Math.hypot(city.resident.x-start.x,city.resident.z-start.z)<0.05);assert.ok(sim.maximumStep<0.1);
  assert.equal(city.market.receipts.length,0);
});

test('paused shift and save reload preserve worker state; overnight skip starts next shift only at home',()=>{
  const {city}=fixture();skipToDeparture(city);simulation(city).tick(12000);
  city.resident.paused=true;const before=structuredClone(city.resident);simulation(city).tick(300);
  assert.deepEqual(city.resident,before);const restored=reopen(city);assert.deepEqual(restored.resident,before);
  assert.equal(skipToDeparture(restored),false,'cannot skip time while a worker is away');
  restored.resident.paused=false;restored.clockMinutes=1020;simulation(restored).tick(12000);
  assert.equal(restored.resident.work.completed,1);assert.equal(skipToDeparture(restored),true);
  assert.equal(restored.clockMinutes,1920);assert.equal(restored.resident.phase,'leave');assert.equal(restored.resident.work.completed,1);
});

test('missing street blocks work without rewards and repair resumes actual walking',()=>{
  const {city}=fixture();city.streets=[];skipToDeparture(city);const sim=simulation(city);sim.tick(12000);
  assert.equal(city.resident.work.completed,0);assert.notEqual(city.resident.work.worked,true);assert.ok(sim.runtimes.get('resident').issue);
  const stopped={x:city.resident.x,z:city.resident.z};sim.tick(60);assert.deepEqual({x:city.resident.x,z:city.resident.z},stopped);
  city.streets=['h-3-4','h-4-4','h-5-4'];sim.tick(12000);assert.equal(city.resident.work.worked,true);
  city.clockMinutes=1020;sim.tick(12000);assert.equal(city.resident.work.completed,1);assert.ok(sim.maximumStep<0.1);
});

test('queued workers remain distinct, never become shoppers, and no cargo or receipt is awarded',()=>{
  const {city}=fixture(true);city.transport={pickup:'h-3-4',dropoff:'h-4-4',stage:2};city.shopStock=[{shop:'work-door-1',units:4}];const stock=structuredClone(city.shopStock),cargo=structuredClone(city.transport);skipToDeparture(city);const sim=simulation(city);sim.tick(12000);
  assert.ok(Math.hypot(city.resident.x-city.family1.x,city.resident.z-city.family1.z)>=0.65);
  assert.equal(nextCustomer(city),undefined);assert.equal(callShoppers(city),0);assert.equal(city.market.receipts.length,0);
  assert.deepEqual(city.transport,cargo);assert.equal(city.resident.work.completed+city.family1.work.completed,0);
  city.clockMinutes=1020;sim.tick(20000);assert.equal(city.resident.phase,'done');assert.equal(city.family1.phase,'done');assert.equal(city.resident.work.completed+city.family1.work.completed,1,'only the worker admitted before shift end earns completion');assert.deepEqual(city.shopStock,stock);
  assert.equal(city.market.receipts.length,0);assert.deepEqual(city.transport,cargo);assert.ok(sim.maximumStep<0.1);
});

test('work save validation rejects overnight and malformed schedules and safely bounds counters',()=>{
  for(const v of [null,{}, {startHour:17,endHour:8,completed:0},{startHour:8,endHour:8,completed:0},
    {startHour:-1,endHour:17,completed:0},{startHour:8,endHour:25,completed:0},{startHour:8.5,endHour:17,completed:0},
    {startHour:'8',endHour:17,completed:0}]) assert.equal(restoreWorkShift(v),null);
  const {city}=fixture();const restored=reopen(city);assert.deepEqual(restored.resident.work,city.resident.work);
  const raw=JSON.parse(citySave(city));raw.resident.work={startHour:18,endHour:8,completed:999};
  const bad=loadWorld('city',{getItem:key=>key===saveKey('city')?JSON.stringify(raw):null});assert.equal(bad.resident.work,undefined);
});

test('shift timing advances only through the settlement clock, with no wall-clock or reload catch-up',()=>{
  const {city}=fixture();const before=city.clockMinutes;simulation(city).tick(600);
  assert.equal(city.clockMinutes,before);assert.equal(city.resident.phase,'done');
  tickRoutines(city,1);assert.equal(city.clockMinutes,before+15);assert.equal(city.resident.phase,'done');
  tickRoutines(city,1);assert.equal(city.clockMinutes,480);assert.equal(city.resident.phase,'leave');
  const restored=reopen(city);assert.equal(restored.clockMinutes,480);assert.deepEqual(restored.resident.work,city.resident.work);
});

test('a worker arriving after closing returns without a completed shift',()=>{
  const {city}=fixture();city.streets=[];skipToDeparture(city);const sim=simulation(city);sim.tick(12000);
  city.clockMinutes=1021;city.streets=['h-3-4','h-4-4','h-5-4'];sim.tick(20000);
  assert.equal(city.resident.phase,'done');assert.equal(city.resident.work.completed,0);assert.equal(city.market.receipts.length,0);
});

test('work save counters and active-shift markers reject nonfinite, oversized and orphan values',()=>{
  for(const completed of [-1,Infinity,NaN,Number.MAX_SAFE_INTEGER+1,'2'])
    assert.equal(restoreWorkShift({startHour:8,endHour:17,completed}).completed,0);
  for(const endsAt of [-1,Infinity,NaN,Number.MAX_SAFE_INTEGER+1,'1020',1021]){
    const work=restoreWorkShift({startHour:8,endHour:17,completed:2,endsAt,worked:true});
    assert.equal(work.endsAt,undefined);assert.equal(work.worked,undefined);
  }
  assert.deepEqual(restoreWorkShift({startHour:8,endHour:17,completed:2,endsAt:1020,worked:true}),
    {startHour:8,endHour:17,completed:2,endsAt:1020,worked:true});
});

test('skipping an idle work shift advances time but never teleports or credits return',()=>{
  const {city}=fixture();skipToDeparture(city);const sim=simulation(city);sim.tick(12000);
  const atWork={x:city.resident.x,z:city.resident.z};assert.equal(skipToDeparture(city),true);
  assert.equal(city.clockMinutes,1020);assert.deepEqual({x:city.resident.x,z:city.resident.z},atWork);
  assert.equal(city.resident.work.completed,0);assert.equal(skipToDeparture(city),false);
  sim.tick(12000);assert.equal(city.resident.work.completed,1);assert.equal(city.resident.phase,'done');
});

test('a blocked workplace entrance waits for repair instead of claiming work or walking through bricks',()=>{
  const {city}=fixture();const obstruction={id:'work-obstruction',type:'single',color:'Plum',x:12,y:0,z:5,r:0};
  city.pieces=[...city.pieces,obstruction];skipToDeparture(city);const sim=simulation(city);sim.tick(12000);
  assert.notEqual(city.resident.work.worked,true);assert.equal(city.resident.work.completed,0);
  assert.match(sim.runtimes.get('resident').issue,/blocked|obstruct/i);
  const stopped={x:city.resident.x,z:city.resident.z};sim.tick(120);assert.deepEqual({x:city.resident.x,z:city.resident.z},stopped);
  const restored=reopen(city);restored.pieces=restored.pieces.filter(p=>p.id!==obstruction.id);
  const after=simulation(restored);after.tick(12000);assert.equal(restored.resident.work.worked,true);
  restored.clockMinutes=1020;after.tick(12000);assert.equal(restored.resident.work.completed,1);
  assert.equal(restored.market.receipts.length,0);assert.ok(after.maximumStep<0.1);
});


test('a dedicated workplace cannot also be an active market in either assignment order',()=>{
  const {city,home,shop}=fixture();
  const candidate=newTrip(home,shop);setWorkShift(candidate,8,17);
  assert.equal(moveIn(city,'Work Applicant','work',candidate),null,'existing market rejects work assignment');
  assert.equal(city.members?.some(p=>p.name==='Work Applicant')??false,false);
  delete city.market;delete city.resident;
  assert.ok(moveIn(city,'Work Applicant','work',candidate),'a dedicated entrance accepts work');
  assert.equal(openMarket(city,shop.id),false,'existing work assignment rejects market');
  assert.equal(city.market,undefined);
});

test('a named work assignment survives reload and walks its full scheduled shift',()=>{
  const {city,home,shop}=fixture();delete city.market;delete city.resident;
  const trip=newTrip(home,shop);setWorkShift(trip,8,17);
  const key=moveIn(city,'Thandi','work',trip)?.key;assert.equal(key,'family1');
  const restored=reopen(city);assert.equal(householdsFor(restored).find(p=>p.key===key).destination,'Workplace');
  assert.deepEqual(restored[key].work,trip.work);assert.equal(skipToDeparture(restored),true);
  const sim=simulation(restored);sim.tick(12000);assert.equal(restored[key].work.worked,true);
  restored.clockMinutes=1020;sim.tick(12000);assert.equal(restored[key].work.completed,1);assert.equal(restored[key].phase,'done');
});
