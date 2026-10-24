const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../public/games/physics-force-lab'),A=require(path.join(root,'adventure-data.js'));
test('all 15 repair targets can be reached using allowed equipment settings',()=>{
  for(const m of A.missions)for(let i=0;i<3;i++){
    const values=m.options?m.options.map(o=>o[0]):Array.from({length:(m.max-m.min)/m.step+1},(_,i)=>m.min+i*m.step);
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
  const p=A.blank();for(let i=0;i<5;i++){assert.ok(A.isUnlocked(p,i));if(i<4)assert.equal(A.isUnlocked(p,i+1),false);p.completed[A.missions[i].id]=true;}
  delete p.completed.cargo;assert.equal(A.isUnlocked(p,4),false);
});
test('checkpoints round trip equipment, trials, collected cells and repairs',()=>{
  const p=A.blank();p.records.cargo=2;p.checkpoints.cargo={x:700,solved:[0],cells:[1,3],labs:{1:{value:4,closed:true,prediction:1,trials:[{value:2,closed:true},{value:4,closed:true}],hint:true}}};
  const store=new Map(),storage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
  assert.ok(A.save(storage,p));assert.deepEqual(A.load(storage),p);
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
  assert.deepEqual(A.missions.map(m=>m.grade),[4,4,5,5,6]);for(const m of A.missions){assert.ok(m.topic&&m.concept&&m.explanation&&m.hint);assert.equal(m.stations.length,3);assert.equal(m.answers.length,3);}
});
test('all five original arrangements play distinct phrases and pause clears the music timer',()=>{
  const vm=require('node:vm'),notes=[],timers=new Set();
  const param={setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){}};
  class AC{constructor(){this.state='running';this.currentTime=0;this.destination={};}createGain(){return {gain:param,connect(){},disconnect(){}};}createOscillator(){return {frequency:{setValueAtTime:f=>notes.push(f)},connect(){},disconnect(){},start(){},stop(){}};}}
  const sandbox={AudioContext:AC,setInterval:fn=>{timers.add(fn);return fn;},clearInterval:fn=>timers.delete(fn)};
  vm.runInNewContext(fs.readFileSync(path.join(root,'adventure-audio.js'),'utf8'),sandbox);
  const a=new sandbox.PhysicsAdventureAudio({music:.4,effects:.7}),phrases=[];
  for(let i=0;i<5;i++){notes.length=0;a.play(i);for(let n=0;n<16;n++)a.tick();phrases.push(notes.join(','));a.stop();assert.equal(timers.size,0);}
  assert.equal(new Set(phrases).size,5);
  const unsupported={setInterval(){throw Error('should not start');},clearInterval(){}};vm.runInNewContext(fs.readFileSync(path.join(root,'adventure-audio.js'),'utf8'),unsupported);const silent=new unsupported.PhysicsAdventureAudio({music:0,effects:0});assert.doesNotThrow(()=>{silent.play(0);silent.effect('jump');silent.stop();});
});
