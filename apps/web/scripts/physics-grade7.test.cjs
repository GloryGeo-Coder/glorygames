const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),vm=require('node:vm');
const root=path.join(__dirname,'../public/games/physics-force-lab'),A=require(path.join(root,'adventure-data.js')),visuals=require(path.join(root,'adventure-heat-ui.js'));

test('Grade 7 adds five missions and fifteen comparison investigations without changing earlier mission data',()=>{
  const hash=require('node:crypto').createHash('sha256').update(JSON.stringify(A.missions.slice(0,10))).digest('hex');assert.equal(hash,'ba5e351a398436e7e31f5af774b154ec89413911cf18125a8830f3e8ad7ca7a3');
  assert.ok(A.missions.length>=15);
  for(let mi=10;mi<15;mi++)for(let si=0;si<3;si++){const e=A.experiment(mi,si);assert.equal(e.grade,7);assert.equal(e.needsComparison,true);assert.ok(e.topic&&e.explanation&&e.hint);assert.equal(e.answers.length,3);}
  assert.deepEqual(A.route(5).stations,[800,1900,3000]);assert.equal(A.route(5).length,4000);assert.equal(A.route(10).length,4400);
});
test('the ramp accounts for every input unit including energy transferred to surroundings',()=>{
  for(let si=0;si<3;si++)for(const position of [0,25,50,75,100]){
    const r=A.simulate(10,si,position),{potential,kinetic,surroundings}=r.energy;
    assert.equal(potential+kinetic+surroundings,100);assert.ok(potential>=0&&kinetic>=0&&surroundings>=0);assert.equal(potential,100-position);
    if(si<2)assert.equal(surroundings,0);else assert.equal(surroundings,position/5);
  }
  assert.equal(A.simulate(10,2,100).energy.kinetic,80);assert.equal(A.simulate(10,2,100).success,true);
});
test('conduction readings remain between the fixed hot source and initial cooler sensor',()=>{
  const readings=['copper','steel','wood'].map(v=>A.simulate(11,0,v).output);assert.deepEqual(readings,[62,44,24.8]);for(const n of readings)assert.ok(n>20&&n<80);
  assert.equal(A.simulate(11,0,'copper').success,true);assert.equal(A.simulate(11,1,'wood').success,true);assert.equal(A.simulate(11,2,'steel').success,true);
  assert.equal(A.experiment(11,1).initial,'copper');assert.match(A.experiment(11,1).explanation,/hotter to cooler/);
});
test('convection distinguishes full circulation from stable upper-layer heating',()=>{
  assert.equal(A.simulate(12,0,'bottom').state,'circulating');assert.equal(A.simulate(12,0,'bottom').success,true);assert.equal(A.simulate(12,0,'top').success,false);
  assert.equal(A.simulate(12,1,'top').state,'layered');assert.equal(A.simulate(12,1,'top').success,true);assert.equal(A.simulate(12,1,'bottom').success,false);
  assert.match(A.experiment(12,0).explanation,/less dense/);
});
test('radiation data use identical observation times and distinguish absorber and reflective-shield goals',()=>{
  const results=['black','white','shiny'].map(v=>A.simulate(12,2,v));
  for(const r of results){assert.deepEqual(r.series.map(p=>p.time),[0,2,4,6,8,10]);assert.equal(r.series[0].temperature,20);assert.equal(r.output,r.series.at(-1).temperature);}
  for(let i=1;i<6;i++)assert.ok(results[0].series[i].temperature>results[1].series[i].temperature&&results[1].series[i].temperature>results[2].series[i].temperature);
  assert.equal(A.simulate(12,2,'black').success,true);assert.equal(A.simulate(14,1,'shiny').success,true);assert.equal(A.simulate(14,1,'black').success,false);
});
test('insulation slows both heating and cooling without creating energy or overshooting the surroundings',()=>{
  for(let si=0;si<3;si++){
    const s=A.missions[13].stations[si],results=['bare','paper','wool'].map(v=>A.simulate(13,si,v));
    for(let i=0;i<6;i++)for(const r of results){const n=r.series[i].temperature;assert.ok(n>=Math.min(s.start,s.ambient)&&n<=Math.max(s.start,s.ambient));}
    for(let i=1;i<6;i++)assert.ok(Math.abs(results[2].series[i].temperature-s.start)<Math.abs(results[1].series[i].temperature-s.start)&&Math.abs(results[1].series[i].temperature-s.start)<Math.abs(results[0].series[i].temperature-s.start));
    assert.equal(results[2].success,true);assert.equal(results[0].success,false);
  }
  assert.deepEqual([0,1,2].map(i=>A.simulate(13,i,'wool').output),[66.7,10.5,23.5]);
});
test('completed v4.1 saves unlock Grade 7 while preserving earlier notebook entries and collection records',()=>{
  const p=A.blank();for(const m of A.missions.slice(0,10)){p.completed[m.id]=true;p.checkpoints[m.id]={x:80,solved:[0,1,2],cells:[1,2],labs:{}};}p.current=9;p.records.cargo=11;p.settings={music:.25,effects:.5,reduced:true};
  p.journal.cargo={0:A.cleanLab(A.experiment(0,0),{value:3,prediction:0,trials:[{value:3,closed:true}],hint:true})};
  const restored=A.sanitize(p);assert.equal(restored.current,10);assert.equal(Object.keys(restored.completed).length,10);assert.equal(restored.records.cargo,11);assert.deepEqual(restored.journal.cargo[0],p.journal.cargo[0]);assert.deepEqual(restored.settings,p.settings);assert.equal(A.notebook(restored).length,30);
  assert.equal(A.isUnlocked(restored,10),true);assert.equal(A.isUnlocked(restored,11),false);
});
test('Grade 7 settings, comparisons and notebook measurements survive refresh and checkpoint retries',()=>{
  const p=A.blank(),m=A.missions[13];for(const earlier of A.missions.slice(0,13))p.completed[earlier.id]=true;p.current=13;
  p.checkpoints[m.id]={x:3500,solved:[1],cells:[3],labs:{1:A.cleanLab(A.experiment(m,1),{value:'wool',prediction:0,trials:[{value:'bare',closed:true},{value:'wool',closed:true}],hint:true,hintLevel:2})}};
  A.recordRepair(p,m,1);const restored=A.sanitize(JSON.parse(JSON.stringify(p)));assert.equal(restored.current,13);assert.equal(restored.checkpoints[m.id].labs[1].value,'wool');assert.equal(restored.checkpoints[m.id].labs[1].hintLevel,2);assert.equal(A.comparisonReady(A.experiment(m,1),restored.checkpoints[m.id].labs[1]),true);
  delete restored.checkpoints[m.id];const notes=A.notebook(A.sanitize(restored));assert.ok(notes.some(n=>n.station==='Cold instrument box'&&n.observations.some(s=>s.includes('10.5 °C'))));
});
test('every Grade 7 diagram has finite, bounded coordinates and temperature plots have matching comparison samples',()=>{
  for(let mi=10;mi<15;mi++)for(let si=0;si<3;si++){
    const m=A.missions[mi],e=A.experiment(m,si),values=e.options?e.options.map(o=>o[0]):[0,25,50,75,100];
    for(const value of values){const r=A.simulate(m,si,value),compare=A.simulate(m,si,e.initial),svg=visuals.render(e,m.stations[si],value,r,compare);assert.ok(svg);assert.doesNotMatch(svg,/NaN|undefined|Infinity/);assert.ok(Number.isFinite(r.output));for(const [,coord]of svg.matchAll(/(?:x|y|cx|cy|width|height)="([\d.-]+)"/g))assert.ok(Number(coord)>=0&&Number(coord)<=500);if(r.series)assert.equal(r.series.length,compare.series.length);}
  }
  assert.equal(visuals.render(A.experiment(0,0),A.missions[0].stations[0],3,A.simulate(0,0,3)),null);
});
test('cached two-chapter entry pages keep running when the new optional content module is not loaded',()=>{
  const box={PhysicsRecoveryDistrict:require(path.join(root,'adventure-chapter2.js'))};vm.runInNewContext(fs.readFileSync(path.join(root,'adventure-data.js'),'utf8'),box);assert.equal(box.PhysicsAdventure.missions.length,10);assert.equal(box.PhysicsAdventure.simulate(0,0,3).success,true);assert.equal(box.PhysicsAdventure.simulate(9,1,'120301003').success,true);
});
