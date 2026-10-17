import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={window:{}};vm.createContext(context);
for(const f of ['racer-driving.js','racer-career.js'])vm.runInContext(readFileSync(new URL('../public/games/high-spead-racer/'+f,import.meta.url),'utf8'),context);
const D=context.window.RacerDriving,C=context.window.RacerCareer;
test('rivals have competitive independent pace and bounded acceleration at every street speed',()=>{
 for(const base of [36,48,74,115])for(let i=0;i<7;i++){
  for(const gap of [-2000,-80,0,80,2000]){const pace=D.rivalPace(base,i,gap,11,.5);assert.ok(pace>=base*.95&&pace<=base*1.3);}
  const next=D.approachSpeed(base,base*2,1/30);assert.ok(next>base&&next<=base+7/30+.0001);
 }
 assert.ok(D.rivalPace(60,3,-200,10)>D.rivalPace(60,3,200,10));
});
test('rendered relative movement matches world speeds without distance clamps',()=>{
 let p=0,r=22;const speed=60,rs=72,dt=1/60;let previous=D.visibleZ(r,p);
 for(let i=0;i<600;i++){p+=speed*dt*D.DISTANCE_SCALE;r+=rs*dt*D.DISTANCE_SCALE;const z=D.visibleZ(r,p);assert.ok(z<previous);previous=z;}
 assert.ok(Math.abs(previous-(8-22/D.DISTANCE_SCALE-120))<1e-8);
 assert.ok(D.visibleZ(10000,0)<-10000,'leaders retain their genuine distance');
});
test('minor scrapes cost less momentum than rear impacts; all contacts recover',()=>{
 const side=D.contact({dx:1.4,dz:0,playerSpeed:70,otherSpeed:68});
 const rear=D.contact({dx:0,dz:3,playerSpeed:100,otherSpeed:50});
 assert.ok(side.side);assert.ok(side.speedFactor>rear.speedFactor);assert.ok(rear.speedFactor>=.3);
 assert.ok(side.damage>0&&rear.damage>side.damage);assert.ok(D.contact({dx:-1.4,dz:0,playerSpeed:70,otherSpeed:68}).push<0);
 let factor=rear.speedFactor;for(let i=0;i<400;i++)factor=D.recover(factor,1/60);assert.equal(factor,1);
 assert.ok(D.followingSpeed(80,75,10,45)<50);assert.equal(D.followingSpeed(80,75,-5,45),80);
});
test('career safely loads malformed data, saves driver identity and keeps old garage storage untouched',()=>{
 const map=new Map([['high-spead-racer-profile-v1','legacy-garage'],[C.KEY,'{bad json']]);
 const storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};const c=C.create(storage);
 assert.equal(c.next(),0);assert.equal(c.unlocked(1),false);
 c.setDriver({name:'<Mara>\n Racer',look:'ocean',identity:'precision'});
 const restored=C.create(storage);assert.equal(restored.data.driver.name,'Mara Racer');assert.equal(restored.data.driver.look,'ocean');
 assert.equal(map.get('high-spead-racer-profile-v1'),'legacy-garage');
});
test('six jobs have real, different win conditions and rewards only on successful completion',()=>{
 const c=C.create();c.setDriver({name:'Rae'});
 for(const [i,job] of C.JOBS.entries()){
  assert.equal(c.unlocked(i),true);
  const fail={time:999,condition:0,boostSeconds:0,position:8};const result=c.result(job,fail);
  assert.equal(result.success,false);assert.equal(result.payment,0);assert.equal(c.data.completed[job.id],undefined);
  const success=c.result(job,{time:20,condition:90,boostSeconds:9,position:1});
  assert.ok(success.success&&success.first);assert.ok(success.payment>0);assert.equal(success.reputation,job.rep);
  const rep=c.data.reputation;const replay=c.result(job,{time:19,condition:100,boostSeconds:9,position:1});assert.equal(replay.reputation,0);assert.equal(c.data.reputation,rep);
 }
 assert.equal(c.next(),-1);assert.match(c.garage(),/Crew garage/);
});
test('delivery payment reflects damage, time limit is exact and fake completed jobs do not inflate reputation',()=>{
 const c=C.create();const job=C.JOBS[1];const clean=c.result(job,{condition:100,time:30});const scraped=c.result(job,{condition:55,time:33});
 assert.ok(clean.payment>scraped.payment);assert.equal(c.result(job,{condition:54.99,time:30}).success,false);
 assert.equal(c.result(C.JOBS[3],{time:44}).success,true);assert.equal(c.result(C.JOBS[3],{time:44.001}).success,false);
 const forged=C.create({getItem:()=>JSON.stringify({reputation:999999,completed:{'fake-job':true,'first-green':true}})});
 assert.equal(forged.data.reputation,C.JOBS[0].rep);assert.equal(Object.keys(forged.data.completed).length,1);
});
