const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=path.join(__dirname,'../public/games/physics-force-lab'),A=require(path.join(root,'adventure-data.js')),visuals=require(path.join(root,'adventure-signal-ui.js'));
const values=e=>e.options?e.options.map(o=>o[0]):Array.from({length:(e.max-e.min)/e.step+1},(_,i)=>e.min+i*e.step);
test('Grade 8 adds five missions while preserving the fifteen released mission definitions',()=>{
  assert.equal(require('node:crypto').createHash('sha256').update(JSON.stringify(A.missions.slice(0,15))).digest('hex'),'56cbfd28cef4b106b1a896edca2f804feab91164ad3f14c98a0613b61e6d6686');
  assert.equal(A.missions.length,20);assert.equal(new Set(A.missions.map(m=>m.id)).size,20);
  for(let mi=15;mi<20;mi++)for(let si=0;si<3;si++){const e=A.experiment(mi,si);assert.equal(e.grade,8);assert.ok(e.needsComparison&&e.hint&&e.explanation&&A.hint(A.missions[mi],si,2));assert.ok(values(e).some(v=>A.simulate(mi,si,v).success));assert.ok(values(e).some(v=>!A.simulate(mi,si,v).success));}
});
test('electron transfer conserves charge and particle counts, fixes protons and gives reciprocal force rules',()=>{
  for(let si=0;si<3;si++)for(const v of ['gain','lose']){
    const r=A.simulate(15,si,v);assert.equal(r.rodCharge+r.clothCharge,0);assert.equal(r.rodElectrons+r.clothElectrons,8);
    assert.equal(4-r.rodElectrons,r.rodCharge);assert.equal(4-r.clothElectrons,r.clothCharge);
    assert.equal(r.state,r.rodCharge===r.probe?'repel':'attract');
    assert.match(r.detail,/Only electrons transfer/);
  }
  assert.equal(A.simulate(15,0,'gain').success,true);assert.equal(A.simulate(15,1,'gain').success,true);assert.equal(A.simulate(15,2,'lose').success,true);
});
test('series current is equal at both meters and decreases with each added identical resistor',()=>{
  const readings=[1,2,3].map(v=>A.simulate(16,0,v));assert.deepEqual(readings.map(r=>r.output),[200,100,66.7]);
  for(const r of readings){assert.equal(r.output,r.meterB);assert.equal(r.output,r.branchCurrent);assert.equal(r.state,'series');assert.equal(r.unit,'mA');}
});
test('parallel source current is the sum of unchanged branch currents',()=>{
  for(const n of [1,2,3]){const r=A.simulate(16,2,n);assert.equal(r.output,n*200);assert.equal(r.branchCurrent,200);assert.equal(r.output,r.count*r.branchCurrent);}
});
test('reflection presets obey equal angles and refraction moves towards the normal in denser media',()=>{
  assert.deepEqual(['near','middle','wide'].map(v=>A.simulate(17,0,v).angle),[15,30,60]);
  const refracted=['air','water','glass'].map(v=>A.simulate(17,2,v).angle);assert.deepEqual(refracted,[30,22.1,19.5]);assert.ok(refracted[2]<refracted[1]&&refracted[1]<refracted[0]);
  assert.equal(A.simulate(17,0,'middle').success,true);assert.equal(A.simulate(19,2,'wide').success,true);
  assert.equal(A.simulate(17,1,'rough').output,0);assert.equal(A.simulate(17,1,'smooth').output,1);
});
test('window, dispersion and recombination keep light-source and material roles distinct',()=>{
  assert.equal(A.simulate(18,0,'glass').output,90);assert.equal(A.simulate(18,0,'card').output,0);
  assert.equal(A.simulate(18,1,'gap').state,'white');assert.equal(A.simulate(18,1,'prism').state,'spectrum');assert.equal(A.simulate(18,1,'card').state,'blocked');
  assert.equal(A.simulate(18,2,'spread').state,'separate');assert.equal(A.simulate(18,2,'overlap').state,'white');
  assert.match(A.experiment(18,2).explanation,/not mixing paints/);
});
test('magnetic lift and branch faults have recoverable, distinct outcomes',()=>{
  for(let v=1;v<5;v++)assert.equal(A.simulate(19,0,v).state,'waiting');assert.equal(A.simulate(19,0,5).state,'lifted');
  assert.deepEqual(A.simulate(19,1,'series-break').lamps,[false,false]);assert.deepEqual(A.simulate(19,1,'parallel-break').lamps,[false,true]);assert.deepEqual(A.simulate(19,1,'parallel-intact').lamps,[true,true]);
  assert.equal(A.simulate(19,1,'parallel-intact').success,false);assert.equal(A.simulate(19,1,'parallel-break').success,true);
});
test('completed Grade 7 saves advance into Grade 8 with notebook and reward records intact',()=>{
  const p=A.blank();for(const m of A.missions.slice(0,15)){p.completed[m.id]=true;p.checkpoints[m.id]={x:A.route(m).end,solved:[0,1,2],cells:[1],labs:{}};}p.current=14;p.records.cargo=10;p.settings={music:.1,effects:.3,reduced:true};
  const restored=A.sanitize(p);assert.equal(restored.current,15);assert.equal(A.notebook(restored).length,45);assert.equal(restored.records.cargo,10);assert.deepEqual(restored.settings,p.settings);assert.equal(A.isUnlocked(restored,15),true);assert.equal(A.isUnlocked(restored,16),false);
  p.checkpoints['cooling-core'].solved=[];assert.equal(A.sanitize(p).current,14);
});
test('Grade 8 choices, distinct evidence and hints persist, and retry cannot erase findings or farm scores',()=>{
  const p=A.blank();for(const m of A.missions.slice(0,15))p.completed[m.id]=true;p.current=15;
  const m=A.missions[15],e=A.experiment(m,0);p.checkpoints[m.id]={x:900,solved:[0],cells:[1,2],labs:{0:{value:'gain',prediction:0,trials:[{value:'lose'},{value:'gain'}],hint:true,hintLevel:2}}};
  A.recordRepair(p,m,0);const q=A.sanitize(JSON.parse(JSON.stringify(p))),l=q.checkpoints[m.id].labs[0];assert.equal(l.value,'gain');assert.equal(l.hintLevel,2);assert.equal(A.comparisonReady(e,l),true);
  assert.equal(A.comparisonReady(e,A.cleanLab(e,{trials:[{value:'gain'},{value:'gain'}]})),false);
  assert.equal(A.comparisonReady(e,A.cleanLab(e,{trials:[{value:'gain',closed:true},{value:'gain',closed:false}]})),false);
  assert.ok(A.notebook(q).some(n=>n.station==='Attraction gate'&&n.observations.some(t=>t.includes('negative'))));
  delete q.checkpoints[m.id];assert.equal(A.notebook(A.sanitize(q)).length,1);
  q.completed[m.id]=true;const score=A.score(q);q.checkpoints[m.id]={solved:[],cells:[]};assert.equal(A.score(q),score);
});
test('every new diagram renders finite bounded coordinates and legacy pages work without optional Grade 8 modules',()=>{
  for(let mi=15;mi<20;mi++)for(let si=0;si<3;si++){
    const e=A.experiment(mi,si);for(const value of values(e)){
      const r=A.simulate(mi,si,value),svg=visuals.render(e,A.missions[mi].stations[si],value,r);assert.match(svg,/viewBox="0 0 500 260"/);assert.doesNotMatch(svg,/NaN|undefined|Infinity/);assert.ok(Number.isFinite(r.output));
      for(const [,n]of svg.matchAll(/(?:x|y|cx|cy|width|height)="([\d.-]+)"/g))assert.ok(Number(n)>=0&&Number(n)<=500,`${mi}:${si}: ${n}`);
    }
  }
  const box={PhysicsRecoveryDistrict:require(path.join(root,'adventure-chapter2.js')),PhysicsHeatChapter:require(path.join(root,'adventure-grade7.js'))};vm.runInNewContext(fs.readFileSync(path.join(root,'adventure-data.js'),'utf8'),box);assert.equal(box.PhysicsAdventure.missions.length,15);assert.equal(box.PhysicsAdventure.simulate(14,2,'wool').success,true);
  assert.equal(visuals.render(A.experiment(0,0),{},3,A.simulate(0,0,3)),null);
});
