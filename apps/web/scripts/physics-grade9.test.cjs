const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=path.join(__dirname,'../public/games/physics-force-lab'),A=require(path.join(root,'adventure-data.js')),visuals=require(path.join(root,'adventure-power-ui.js'));
const values=e=>e.options?e.options.map(o=>o[0]):Array.from({length:(e.max-e.min)/e.step+1},(_,n)=>e.min+n*e.step);
test('Grade 9 adds five sequential missions and preserves all twenty released mission definitions',()=>{
  assert.equal(require('node:crypto').createHash('sha256').update(JSON.stringify(A.missions.slice(0,20))).digest('hex'),'a9a6d637623918fbea25415d6d69683aabe6357baaeed04f1cc54211f5d30aaa');assert.ok(A.missions.length>=25);
  for(let mi=20;mi<25;mi++)for(let si=0;si<3;si++){const e=A.experiment(mi,si);assert.equal(e.grade,9);assert.equal(e.needsComparison,true);assert.equal(e.predictions.length,3);assert.equal(e.answers.length,3);assert.ok(e.explanation&&A.hint(A.missions[mi],si,2));assert.ok(values(e).some(v=>A.simulate(mi,si,v).success));assert.ok(values(e).some(v=>!A.simulate(mi,si,v).success));}
});
test('horizontal resultant adds signed forces without confusing force with current motion',()=>{
  for(let si=0;si<3;si++)for(const right of [0,20,40,60,80]){const r=A.simulate(20,si,right);assert.equal(r.output,right-40);assert.equal(r.left,40);assert.equal(r.right,right);}
  assert.equal(A.simulate(20,0,40).state,'balanced');assert.equal(A.simulate(20,1,60).state,'right');const braking=A.simulate(20,2,20);assert.equal(braking.motion,'right');assert.equal(braking.state,'left');assert.match(braking.detail,/initially slows/);assert.match(A.experiment(20,0).explanation,/not an action–reaction pair/);
});
test('changing location preserves mass while changing gravitational force',()=>{
  const readings=['earth','moon','mars'].map(v=>A.simulate(21,0,v));assert.deepEqual(readings.map(r=>r.mass),[10,10,10]);assert.deepEqual(readings.map(r=>r.output),[98,16,37]);for(const r of readings)assert.equal(r.output,r.mass*r.field);
  for(let m=1;m<10;m++){const a=A.simulate(21,1,m),b=A.simulate(21,1,m+1);assert.equal(a.field,b.field);assert.ok(b.output>a.output);}assert.equal(A.simulate(21,1,5).output,49);
});
test('magnetic poles have distinct non-contact attraction and repulsion outcomes',()=>{
  assert.equal(A.simulate(21,2,'S').state,'attract');assert.equal(A.simulate(21,2,'N').state,'repel');assert.match(A.experiment(21,2).explanation,/not positive and negative electric charges/);
});
test('length, area, temperature and material comparisons preserve source voltage and resistance trends',()=>{
  for(const [si,a,b]of [[0,1,2],[1,1,2],[2,20,120]]){
    const x=A.simulate(22,si,a),y=A.simulate(22,si,b);assert.equal(x.voltage,3);assert.equal(y.voltage,3);
    if(si===1){assert.ok(y.resistance<x.resistance);assert.ok(y.output>x.output);}else{assert.ok(y.resistance>x.resistance);assert.ok(y.output<x.output);}
  }
  const material=['copper','steel','nichrome'].map(v=>A.simulate(24,0,v));assert.deepEqual(material.map(r=>r.resistance),[2,8,40]);assert.deepEqual(material.map(r=>r.output),[1500,375,75]);
  assert.equal(A.setting(A.experiment(24,0),{value:'copper'},0),'Copper');
  assert.equal(A.simulate(22,0,2).output,150);assert.equal(A.simulate(22,1,2).output,600);assert.equal(A.simulate(22,2,120).output,200);
});
test('aligned series cells add voltage while a matched parallel pair retains one-cell voltage',()=>{
  for(const n of [1,2,3]){const r=A.simulate(23,0,n);assert.equal(r.output,n*1.5);assert.equal(r.current,n*50);assert.equal(r.drops[0],r.output);}
  const series=A.simulate(23,1,'series'),parallel=A.simulate(23,1,'parallel');assert.equal(series.output,3);assert.equal(parallel.output,1.5);assert.equal(series.current,100);assert.equal(parallel.current,50);
});
test('series voltage drops conserve source potential difference and share the same current',()=>{
  for(const v of ['equal','low-high','high-low']){const r=A.simulate(23,2,v);assert.equal(r.drops.reduce((a,b)=>a+b,0),3);assert.equal(r.current,100);for(let i=0;i<2;i++)assert.equal(r.drops[i]/r.resistors[i],.1);}
  assert.deepEqual(A.simulate(23,2,'low-high').drops,[1,2]);assert.equal(A.simulate(23,2,'high-low').success,false);
});
test('all six supply permutations are valid save settings and only the connected route completes the task',()=>{
  const e=A.experiment(24,1),perms=['012','021','102','120','201','210'];
  for(const v of perms){const r=A.simulate(24,1,v);assert.equal(r.success,v==='012');assert.equal(A.cleanLab(e,{value:v}).value,v);assert.ok(r.output>=0&&r.output<=3);}
  assert.equal(A.cleanLab(e,{value:'000'}).value,'210');assert.equal(A.comparisonReady(e,A.cleanLab(e,{trials:[{value:'210'},{value:'012'}]})),true);assert.equal(A.comparisonReady(e,A.cleanLab(e,{trials:[{value:'012'},{value:'012'}]})),false);
  assert.equal(A.setting(e,{value:'012'},0),'Generator → Transmission → Local supply');
});
test('lighting energy uses kW times hours and cost uses energy, while switching off fails useful service',()=>{
  for(const v of ['filament','halogen','led','off']){const r=A.simulate(24,2,v);assert.ok(Math.abs(r.output-r.watts/1000*r.hours)<1e-10);assert.equal(r.cost,Math.round(r.output*3*1000)/1000);}
  const led=A.simulate(24,2,'led');assert.equal(led.output,.05);assert.equal(led.cost,.15);assert.equal(led.success,true);assert.equal(A.simulate(24,2,'off').success,false);assert.equal(A.simulate(24,2,'filament').success,false);assert.match(A.experiment(24,2).explanation,/not a current electricity tariff/);
});
test('completed Grade 8 saves advance into Grade 9 without losing earlier evidence or rewards',()=>{
  const p=A.blank();for(const m of A.missions.slice(0,20)){p.completed[m.id]=true;p.checkpoints[m.id]={x:A.route(m).end,solved:[0,1,2],cells:[3],labs:{}};}p.current=19;p.records.cargo=12;p.settings={music:.2,effects:.6,reduced:true};
  const q=A.sanitize(p);assert.equal(q.current,20);assert.equal(A.notebook(q).length,60);assert.equal(q.records.cargo,12);assert.deepEqual(q.settings,p.settings);assert.equal(A.isUnlocked(q,20),true);assert.equal(A.isUnlocked(q,21),false);
  p.checkpoints['signal-relay'].solved=[0];assert.equal(A.sanitize(p).current,19);
});
test('route order, comparison trials and hints survive refresh and notebook discoveries survive a retry',()=>{
  const p=A.blank();for(const m of A.missions.slice(0,24))p.completed[m.id]=true;p.current=24;const m=A.missions[24],e=A.experiment(m,1);
  p.checkpoints[m.id]={x:2100,solved:[1],cells:[2],labs:{1:{value:'012',prediction:0,trials:[{value:'210'},{value:'012'}],hint:true,hintLevel:2}}};A.recordRepair(p,m,1);
  const q=A.sanitize(JSON.parse(JSON.stringify(p))),lab=q.checkpoints[m.id].labs[1];assert.equal(lab.value,'012');assert.equal(lab.hintLevel,2);assert.equal(A.comparisonReady(e,lab),true);delete q.checkpoints[m.id];assert.ok(A.notebook(A.sanitize(q)).some(n=>n.station==='Supply-system route'&&n.observations.some(t=>t.includes('3/3'))));
});
test('new diagrams render finite coordinates and optional Grade 9 data does not break cached Grade 8 entries',()=>{
  for(let mi=20;mi<25;mi++)for(let si=0;si<3;si++){const e=A.experiment(mi,si);for(const v of values(e)){const r=A.simulate(mi,si,v),svg=visuals.render(e,A.missions[mi].stations[si],v,r);assert.match(svg,/viewBox="0 0 500 260"/);assert.doesNotMatch(svg,/NaN|undefined|Infinity/);for(const [,name,n]of svg.matchAll(/(x|y|cx|cy|width|height)="([\d.-]+)"/g))assert.ok(Number(n)>=0&&Number(n)<=(['y','cy','height'].includes(name)?260:500),`${mi}:${si}:${name}=${n}`);}}
  const box={PhysicsRecoveryDistrict:require(path.join(root,'adventure-chapter2.js')),PhysicsHeatChapter:require(path.join(root,'adventure-grade7.js')),PhysicsSignalChapter:require(path.join(root,'adventure-grade8.js'))};vm.runInNewContext(fs.readFileSync(path.join(root,'adventure-data.js'),'utf8'),box);assert.equal(box.PhysicsAdventure.missions.length,20);assert.equal(box.PhysicsAdventure.simulate(19,2,'wide').success,true);
});
