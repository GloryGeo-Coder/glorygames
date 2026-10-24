const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../public/games/physics-force-lab'),A=require(path.join(root,'adventure-data.js'));
test('all 45 repair targets can be reached using allowed equipment settings',()=>{
  for(const m of A.missions)for(let i=0;i<3;i++){
    const e=A.experiment(m,i),values=e.type==='grid'?['000000000',m.stations[i].board.solution]:e.options?e.options.map(o=>o[0]):Array.from({length:(e.max-e.min)/e.step+1},(_,n)=>e.min+n*e.step);
    assert.ok(values.some(v=>A.simulate(m,i,v,true).success),`${m.id}:${i} is unreachable`);
    assert.ok(values.some(v=>!A.simulate(m,i,v,true).success),`${m.id}:${i} has no meaningful choice`);
  }
});
test('models preserve energy, vibration and resistance relationships',()=>{
  for(let n=1;n<6;n++)assert.ok(A.simulate(0,0,n+1).output>A.simulate(0,0,n).output);
  assert.ok(A.simulate(1,0,10).output>A.simulate(1,0,20).output);
  assert.ok(A.simulate(2,0,'free').output>A.simulate(2,0,'rubbing').output);
  assert.ok(A.simulate(2,0,'rubbing').output>A.simulate(2,0,'locked').output);
  for(let n=1;n<10;n++)assert.ok(A.simulate(3,0,n+1).output>A.simulate(3,0,n).output);
  assert.equal(A.simulate(4,0,'copper',true).output,1);
  assert.equal(A.simulate(4,0,'copper',false).output,0);
  for(const v of ['plastic','rubber','wood'])assert.equal(A.simulate(4,0,v,true).output,0);
});
test('mission locks require an unbroken sequence of completed missions',()=>{
  const p=A.blank();for(let i=0;i<A.missions.length;i++){assert.ok(A.isUnlocked(p,i));if(i<A.missions.length-1)assert.equal(A.isUnlocked(p,i+1),false);p.completed[A.missions[i].id]=true;}
  delete p.completed.cargo;assert.equal(A.isUnlocked(p,9),false);
});
test('checkpoints round trip equipment, trials, collected cells and repairs',()=>{
  const p=A.blank();p.records.cargo=2;p.checkpoints.cargo={x:700,solved:[0],cells:[1,3],labs:{1:{value:4,closed:true,prediction:1,trials:[{value:2,closed:true},{value:4,closed:true}],hint:true}}};
  const store=new Map(),storage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
  assert.ok(A.save(storage,p));const restored=A.load(storage);assert.equal(restored.checkpoints.cargo.x,700);assert.deepEqual(restored.checkpoints.cargo.labs[1].trials,p.checkpoints.cargo.labs[1].trials);assert.deepEqual(restored.checkpoints.cargo.cells,[1,3]);assert.deepEqual(restored.checkpoints.cargo.solved,[0]);assert.equal(restored.checkpoints.cargo.labs[1].hintLevel,1);assert.deepEqual(A.sanitize(restored),restored);
});
test('corrupt or blocked storage recovers safely without modifying original best score',()=>{
  const denied={getItem(){throw Error('denied');},setItem(){throw Error('quota');}};
  assert.deepEqual(A.load(denied),A.blank());assert.equal(A.save(denied,A.blank()),false);
  const p=A.sanitize({version:1,current:4,completed:{circuit:true},checkpoints:{cargo:{x:1e100,solved:[0,0,100],cells:[1,1,-5],labs:{}}},settings:{music:-1,effects:99}});
  assert.equal(p.current,0);assert.equal(p.checkpoints.cargo.x,3040);assert.deepEqual(p.checkpoints.cargo.solved,[0]);assert.deepEqual(p.checkpoints.cargo.cells,[1]);assert.equal(p.settings.music,0);assert.equal(p.settings.effects,1);
  assert.notEqual(A.SAVE_KEY,'wga_physics_force_lab_v3_best');
});
test('answer shuffling carries correctness with the text',()=>{
  const values=['one','two','three'];const answers=A.shuffled(values,0,()=>0);
  assert.notEqual(answers[0].text,'one');assert.equal(answers.find(a=>a.correct).text,'one');assert.deepEqual(values,['one','two','three']);
});
test('replaying cannot farm mission completion scores',()=>{
  const p=A.blank();p.completed.cargo=true;p.records.cargo=2;p.checkpoints.cargo={solved:[0,1,2],cells:[0,1]};assert.equal(A.score(p),1550);p.checkpoints.cargo={solved:[],cells:[]};assert.equal(A.score(p),1550);
});
test('adventure and original lab entry references resolve and retain shared score/fullscreen bridge',()=>{
  for(const name of ['index.html','original-labs.html']){const html=fs.readFileSync(path.join(root,name),'utf8');assert.match(html,/id="startBtn"/);assert.match(html,/game-tab.mjs/);for(const [,ref]of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)"/g))assert.ok(fs.existsSync(path.join(root,ref)),ref);}
  for(const m of A.missions)assert.ok(fs.existsSync(path.join(root,'assets/backgrounds',m.bg)),m.bg);
});
test('experiment lessons identify their selected grade topics and explain fair tests',()=>{
  assert.deepEqual(A.missions.map(m=>m.grade),[4,4,5,5,6,4,5,6,6,6,7,7,7,7,7]);for(const m of A.missions){assert.ok(m.topic&&m.concept);assert.equal(m.stations.length,3);for(let i=0;i<3;i++){const e=A.experiment(m,i);assert.ok(e.explanation&&e.hint);assert.equal(e.answers.length,3);assert.equal(e.predictions.length,3);}}
});
test('all fifteen original arrangements play distinct phrases and pause clears the music timer',()=>{
  const vm=require('node:vm'),notes=[],timers=new Set();
  const param={setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}};
  class AC{constructor(){this.state='running';this.currentTime=0;this.destination={};}createGain(){return {gain:param,connect(){},disconnect(){}};}createOscillator(){return {frequency:{setValueAtTime:f=>notes.push(f)},connect(){},disconnect(){},start(){},stop(){}};}}
  const sandbox={AudioContext:AC,setInterval:fn=>{timers.add(fn);return fn;},clearInterval:fn=>timers.delete(fn)};
  vm.runInNewContext(fs.readFileSync(path.join(root,'adventure-audio.js'),'utf8'),sandbox);
  const a=new sandbox.PhysicsAdventureAudio({music:.4,effects:.7}),phrases=[];
  for(let i=0;i<A.missions.length;i++){notes.length=0;a.play(i);for(let n=0;n<16;n++)a.tick();phrases.push(notes.join(','));a.stop();assert.equal(timers.size,0);}
  assert.equal(new Set(phrases).size,15);
  const unsupported={setInterval(){throw Error('should not start');},clearInterval(){}};vm.runInNewContext(fs.readFileSync(path.join(root,'adventure-audio.js'),'utf8'),unsupported);const silent=new unsupported.PhysicsAdventureAudio({music:0,effects:0});assert.doesNotThrow(()=>{silent.play(0);silent.effect('jump');silent.stop();});
});
test('the five previously released mission definitions remain byte-equivalent as data',()=>{
  const hash=require('node:crypto').createHash('sha256').update(JSON.stringify(A.missions.slice(0,5))).digest('hex');
  assert.equal(hash,'49d34c2311e43858aa5d7ce54507009bc8f046f1dcd16ddf0081ad34314bb0c7');
});
test('a completed v4.0 save opens mission six without losing earlier repairs, rewards or settings',()=>{
  const old={version:1,current:4,completed:{},records:{cargo:9},checkpoints:{circuit:{x:3020,solved:[0,1,2],cells:[2,3],labs:{0:{value:'copper',closed:true,prediction:0,trials:[{value:'copper',closed:true}],hint:true}}}},settings:{music:.2,effects:.4,reduced:true}};
  for(const m of A.missions.slice(0,5))old.completed[m.id]=true;
  const p=A.sanitize(old);assert.equal(p.current,5);assert.deepEqual(p.completed,old.completed);assert.equal(p.checkpoints.circuit.x,3020);assert.equal(p.records.cargo,9);assert.equal(A.score(p),7775);assert.deepEqual(p.settings,old.settings);assert.ok(p.journal.circuit[0]);assert.equal(p.journal.circuit[0].trials.length,1);
  old.checkpoints.circuit.solved=[];assert.equal(A.sanitize(old).current,4,'an unfinished replay must resume its own checkpoint');
});
test('new lessons require two distinct settings, not repeated clicks or unrelated flags',()=>{
  for(let mi=5;mi<10;mi++)for(let i=0;i<3;i++){
    const e=A.experiment(mi,i),l=A.cleanLab(e);l.trials=[{value:e.initial,closed:true},{value:e.initial,closed:false}];assert.equal(A.comparisonReady(e,l),false);
    l.trials.push({value:e.type==='grid'?'100000000':e.initial===e.min?e.min+e.step:e.min,closed:true});assert.equal(A.comparisonReady(e,l),true);
  }
  assert.equal(A.comparisonReady(A.experiment(0,0),{trials:[]}),true,'existing mission rules remain unchanged');
});
test('wire routing matches an independent geometry/union-find oracle for every active-tile rotation',()=>{
  const boards=require(path.join(root,'adventure-chapter2.js')).boards;
  function connected(board,value){
    const vectors=board.tiles.map((kind,i)=>(kind==='straight'?[[0,-1],[0,1]]:kind==='corner'?[[0,-1],[1,0]]:[]).map(([x,y])=>{for(let n=0;n<Number(value[i]);n++)[x,y]=[-y,x];return `${x},${y}`;}));
    const p=Array.from({length:9},(_,i)=>i),find=i=>p[i]===i?i:p[i]=find(p[i]);
    for(let i=0;i<9;i++)for(const [j,dx,dy]of [[i+1,1,0],[i+3,0,1]]){
      if(j>=9||(dx&&i%3===2))continue;
      if(vectors[i].includes(`${dx},${dy}`)&&vectors[j].includes(`${-dx},${-dy}`))p[find(i)]=find(j);
    }
    return vectors[3].includes('-1,0')&&vectors[5].includes('1,0')&&find(3)===find(5);
  }
  let tested=0;
  for(const board of boards){const active=board.tiles.map((t,i)=>t==='blank'?-1:i).filter(i=>i>=0);for(let n=0;n<4**active.length;n++){const digits=Array(9).fill('0');let bits=n;for(const i of active){digits[i]=String(bits%4);bits=Math.floor(bits/4);}const value=digits.join('');assert.equal(A.traceWires(board,value).connected,connected(board,value),value);tested++;}}
  assert.equal(tested,18432);
});
test('loudness changes wave height while the audio pitch remains fixed',()=>{
  for(let value=1;value<=5;value++)assert.equal(A.simulate(5,0,value).output,value*2);
  const vm=require('node:vm'),frequencies=[],peaks=[];
  class AC{constructor(){this.state='running';this.currentTime=0;this.destination={};}createGain(){return {gain:{setTargetAtTime(){},setValueAtTime(){},exponentialRampToValueAtTime(v){if(v>.001)peaks.push(v);}},connect(){}};}createOscillator(){return {frequency:{setValueAtTime:f=>frequencies.push(f)},connect(){},start(){},stop(){}};}}
  const box={AudioContext:AC};vm.runInNewContext(fs.readFileSync(path.join(root,'adventure-audio.js'),'utf8'),box);const a=new box.PhysicsAdventureAudio({music:0,effects:.5});a.amplitude(1);a.amplitude(5);assert.deepEqual(frequencies,[440,440]);assert.ok(peaks[1]>peaks[0]);
});
test('water and daylight models preserve the intended scientific relationships',()=>{
  for(let h=1;h<8;h++)assert.ok(A.simulate(6,0,h+1).output>A.simulate(6,0,h).output);
  assert.equal(A.simulate(8,0,0).success,true);assert.equal(A.simulate(8,0,180).success,false);
  assert.equal(A.simulate(8,1,180).success,true);assert.equal(A.simulate(8,1,0).success,false);
  assert.equal(A.simulate(8,2,90).success,true);assert.equal(A.simulate(8,2,270).success,true);assert.equal(A.simulate(8,2,0).success,false);
});
test('mixed rescue stations keep their own equipment, initial settings and learning topics',()=>{
  const p=A.blank();for(const m of A.missions.slice(0,9))p.completed[m.id]=true;p.current=9;
  p.checkpoints['recovery-relay']={x:3800,solved:[0],cells:[],labs:{0:{value:6},1:{value:'120301003',hint:true,hintLevel:2},2:{value:180}}};
  const restored=A.sanitize(p),labs=restored.checkpoints['recovery-relay'].labs;
  assert.equal(labs[0].value,6);assert.equal(labs[1].value,'120301003');assert.equal(labs[1].hintLevel,2);assert.equal(labs[2].value,180);
  assert.deepEqual([0,1,2].map(i=>A.experiment(9,i).type),['water','grid','daylight']);
  labs[1].value='bad';assert.equal(A.sanitize(restored).checkpoints['recovery-relay'].labs[1].value,'000000000');
});
test('field notebook evidence survives checkpoint deletion, reload and mission retries',()=>{
  const p=A.blank(),m=A.missions[5];p.checkpoints[m.id]={x:800,solved:[0],cells:[],labs:{0:{value:2,prediction:0,trials:[{value:1,closed:true},{value:2,closed:true}],hint:true,hintLevel:2}}};
  A.recordRepair(p,m,0);delete p.checkpoints[m.id];const restored=A.sanitize(p),notes=A.notebook(restored);
  assert.equal(notes.length,1);assert.equal(notes[0].station,'Garden call');assert.match(notes[0].observations[0],/2 mm/);assert.match(notes[0].observations[1],/4 mm/);assert.equal(notes[0].evidence.hintLevel,2);
});
test('one-way inspection platforms catch descending players and leave old routes unchanged',()=>{
  const r=A.route(5);assert.equal(r.length,4000);assert.deepEqual(A.route(0).stations,[660,1460,2260]);assert.equal(A.route(0).length,3200);
  assert.equal(A.landingFloor(r,1200,340,360,100),350);assert.equal(A.landingFloor(r,1200,350,340,-100),420);assert.equal(A.landingFloor(r,1000,340,360,100),420);assert.equal(A.landingFloor(A.route(0),1200,340,360,100),420);
  for(let mi=5;mi<10;mi++)for(let i=0;i<12;i++){const c=A.cell(mi,i);assert.ok(c.x>0&&c.x<A.route(mi).end);assert.ok(c.y>250&&c.y<420);}
});
test('progressive hints are bounded and chapter two has distinct concepts at each mixed station',()=>{
  const p=A.blank();p.checkpoints['sound-garden']={x:700,solved:[],cells:[],labs:{0:{value:2,hint:true,hintLevel:100}}};const clean=A.sanitize(p);assert.equal(clean.checkpoints['sound-garden'].labs[0].hintLevel,2);
  assert.notEqual(A.hint(A.missions[5],0,1),A.hint(A.missions[5],0,2));
  assert.equal(A.isUnlocked(p,100),false);assert.equal(A.isUnlocked(p,-1),false);
});
