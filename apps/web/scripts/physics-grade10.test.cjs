const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=path.join(__dirname,'../public/games/physics-force-lab'),A=require(path.join(root,'adventure-data')),visuals=require(path.join(root,'adventure-final-ui'));
const values=e=>e.options?e.options.map(o=>o[0]):Array.from({length:(e.max-e.min)/e.step+1},(_,n)=>e.min+n*e.step);
test('Grade 10 completes thirty missions without changing the previous twenty-five',()=>{
  assert.equal(require('crypto').createHash('sha256').update(JSON.stringify(A.missions.slice(0,25))).digest('hex'),'41cf6d8631751801e5a2b447538d934a2249db97e32acb4ef64dadd1f67a42de');assert.equal(A.missions.length,30);
  for(let mi=25;mi<30;mi++)for(let si=0;si<3;si++){const e=A.experiment(mi,si);assert.equal(e.grade,10);assert.ok(e.needsComparison&&e.explanation&&e.hint);assert.ok(values(e).some(v=>A.simulate(mi,si,v).success));assert.ok(values(e).some(v=>!A.simulate(mi,si,v).success));}
});
test('return journeys retain scalar distance while directed displacement cancels',()=>{
  for(const n of [0,2,4,6,8]){const r=A.simulate(25,0,n);assert.equal(r.distance,8+n);assert.equal(r.displacement,8-n);assert.ok(r.distance>=Math.abs(r.displacement));}assert.equal(A.simulate(25,0,8).displacement,0);
});
test('motion samples independently satisfy slopes, signed areas and horizontal motion equations',()=>{
  for(const [mi,si,settings]of [[25,1,[1,2,3,4]],[25,2,[0,1,2,3]],[29,0,[-4,-3,-2,-1,0]]])for(const value of settings){
    const r=A.simulate(mi,si,value),p=r.samples;let area=0;for(let i=1;i<p.length;i++){assert.equal(p[i].velocity-p[i-1].velocity,r.acceleration);area+=(p[i].velocity+p[i-1].velocity)/2;assert.equal(p[i].position-p[i-1].position,(p[i].velocity+p[i-1].velocity)/2);}assert.equal(area,r.displacement);
  }
  const stop=A.simulate(29,0,-2);assert.equal(stop.output,0);assert.equal(stop.displacement,16);assert.ok(stop.samples.every(p=>p.velocity>=0));assert.equal(A.simulate(29,0,-3).success,false);
});
test('mechanical energy is conserved and kinetic/potential units and speed relations are consistent',()=>{
  for(let h=0;h<=5;h+=.5){const r=A.simulate(26,0,h);assert.equal(r.potential+r.kinetic,98);assert.ok(r.potential>=0&&r.kinetic>=0);assert.ok(Math.abs(r.speed*r.speed-r.kinetic)<.02);}
  assert.equal(A.simulate(26,1,4).output,4*A.simulate(26,1,2).output);assert.equal(A.simulate(26,2,2).output,98);
});
test('pulse addition cancels signed displacement without claiming destruction',()=>{
  for(const n of [-2,-1,0,1,2])assert.equal(A.simulate(27,0,n).output,2+n);assert.match(A.simulate(27,0,-2).detail,/continue afterwards/);
});
test('wave and sound models keep medium speed fixed while frequency, wavelength and period agree',()=>{
  for(const [si,frequencies,speed]of [[1,[1,2,3,4],8],[2,[170,340,510,680],340]])for(const f of frequencies){const r=A.simulate(27,si,f);assert.equal(r.speed,speed);assert.ok(Math.abs(r.output*f-speed)<.4);assert.ok(Math.abs(r.period-1/f)<=.0000005);}
  assert.equal(A.simulate(27,1,4).output,2);assert.equal(A.simulate(27,2,680).output,.5);
});
test('identical conducting spheres share signed total charge without changing the total',()=>{
  for(let n=-6;n<=6;n+=2){const r=A.simulate(28,0,n);assert.equal(r.total,6+n);assert.equal(r.final[0],r.final[1]);assert.equal(r.final.reduce((a,b)=>a+b,0),r.total);}assert.equal(A.simulate(28,0,-2).output,2);
});
test('current, voltage and equivalent resistance have distinct dimensions and valid accounting',()=>{
  for(const t of [1,2,3,4])assert.equal(A.simulate(28,1,t).output,.5*t);
  for(const q of [1,2,3,4])assert.equal(A.simulate(29,1,q).output*q,12);
  const series=A.simulate(28,2,'series'),parallel=A.simulate(28,2,'parallel');assert.equal(series.output,12);assert.equal(parallel.output,3);assert.equal(series.output*series.current,6);assert.equal(parallel.output*parallel.current,6);assert.equal(parallel.current,2*parallel.branchCurrent);
});
test('electromagnetic links keep vacuum speed fixed and select the visible receiver band',()=>{
  for(const band of ['radio','visible','xray']){const r=A.simulate(29,2,band);assert.ok(Math.abs(r.output*r.frequency-3e8)<1e-5);assert.equal(r.success,band==='visible');}assert.equal(A.simulate(29,2,'visible').output,5e-7);
});
test('completed Grade 9 progress advances into Grade 10 and final replay cannot farm completion rewards',()=>{
  const p=A.blank();for(const m of A.missions.slice(0,25)){p.completed[m.id]=true;p.checkpoints[m.id]={x:A.route(m).end,solved:[0,1,2],cells:[],labs:{}};}p.current=24;assert.equal(A.sanitize(p).current,25);
  for(const m of A.missions.slice(25))p.completed[m.id]=true;p.current=29;p.checkpoints['quantum-restart']={x:4200,solved:[0,1,2],cells:[1,3],labs:{}};const q=A.sanitize(p);assert.equal(q.current,29);const before=A.score(q);q.checkpoints['quantum-restart'].solved=[];q.checkpoints['quantum-restart'].cells=[];assert.equal(A.score(q),before);
});
test('saved motion trials reproduce notebook evidence and comparison sample times after refresh',()=>{
  const p=A.blank(),m=A.missions[25];for(const old of A.missions.slice(0,25))p.completed[old.id]=true;p.current=25;p.checkpoints[m.id]={x:2100,solved:[1],cells:[],labs:{1:{value:3,prediction:0,trials:[{value:1},{value:3}],hint:true,hintLevel:2}}};A.recordRepair(p,m,1);const q=A.sanitize(JSON.parse(JSON.stringify(p)));assert.equal(q.checkpoints[m.id].labs[1].value,3);assert.ok(A.notebook(q).some(n=>n.observations.some(t=>t.includes('12 m'))));
});
test('every final-chapter diagram is finite, valid SVG and cached Grade 9 entries still run',()=>{
  for(let mi=25;mi<30;mi++)for(let si=0;si<3;si++){const e=A.experiment(mi,si);for(const v of values(e)){const r=A.simulate(mi,si,v),svg=visuals.render(e,A.missions[mi].stations[si],v,r,A.simulate(mi,si,e.initial));assert.match(svg,/viewBox="0 0 500 260"/);assert.doesNotMatch(svg,/NaN|undefined|Infinity/);}}
  const box={PhysicsRecoveryDistrict:require(path.join(root,'adventure-chapter2')),PhysicsHeatChapter:require(path.join(root,'adventure-grade7')),PhysicsSignalChapter:require(path.join(root,'adventure-grade8')),PhysicsPowerChapter:require(path.join(root,'adventure-grade9'))};vm.runInNewContext(fs.readFileSync(path.join(root,'adventure-data.js'),'utf8'),box);assert.equal(box.PhysicsAdventure.missions.length,25);
});
