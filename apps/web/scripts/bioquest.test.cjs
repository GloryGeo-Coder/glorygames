'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const dir = path.join(__dirname, '../public/games/bioquest-guardians-of-life');
const missionsSource = fs.readFileSync(path.join(dir, 'missions.js'), 'utf8');
const gameSource = fs.readFileSync(path.join(dir, 'game.js'), 'utf8');
const grade5Source = fs.readFileSync(path.join(dir, 'grade5.js'), 'utf8');
const grade6Source = fs.readFileSync(path.join(dir, 'grade6.js'), 'utf8');
const grade7Source = fs.readFileSync(path.join(dir, 'grade7.js'), 'utf8');
const grade10Source = fs.readFileSync(path.join(dir, 'grade10.js'), 'utf8');
const grade9Source = fs.readFileSync(path.join(dir, 'grade9.js'), 'utf8');
const grade8Source = fs.readFileSync(path.join(dir, 'grade8.js'), 'utf8');
function boot(store = {}, blocked = '') {
  const elements = new Map(), allChoices = [];
  class Element {
    constructor(id = '') { this.id=id; this.children=[]; this.firstChild={textContent:''}; this.disabled=false; this.hidden=false; }
    set innerHTML(value) { this.html=value; this.children=[]; if (this.id === 'choices') allChoices.length=0; for (const match of value.matchAll(/id="([\w-]+)"/g)) { if (match[1] === "choices") allChoices.length=0; elements.set(match[1],new Element(match[1])); } }
    get innerHTML() { return this.html || ''; }
    append(node) { if (node && node.ids) node.ids.forEach(id=>elements.set(id,new Element(id))); else {this.children.push(node); if(this.id === 'choices') allChoices.push(node);} }
    addEventListener(name, fn) { this['on'+name]=fn; }
    setAttribute() {} focus() {}
    click() { if (!this.disabled && this.onclick) this.onclick(); }
  }
  for(const id of ['app','sound','fullscreen','home-template']) elements.set(id,new Element(id));
  elements.get('home-template').content={cloneNode:()=>({ids:['continue','progress','missions','grade-title','grade4','grade5','grade6','grade7','grade8','grade9','grade10','hero-scene','kit-studies','notes-count','field-notes','grade-dispatch','dispatch-title','dispatch-brief']})};
  const document={getElementById:id=>elements.get(id),createElement:()=>new Element(),querySelectorAll:sel=>sel==='#choices button'?allChoices:[],addEventListener(){},fullscreenEnabled:false,documentElement:{},hidden:false};
  const localStorage={getItem:k=>{if(blocked==='read') throw Error('blocked'); return store[k]||null;},setItem:(k,v)=>{if(blocked) throw Error('quota'); store[k]=v;}};
  const context=vm.createContext({window:{},document,localStorage,setTimeout:()=>0,setInterval:()=>0,clearInterval(){},console});
  vm.runInContext(missionsSource,context); vm.runInContext(grade5Source,context); vm.runInContext(grade6Source,context); vm.runInContext(grade7Source,context); vm.runInContext(grade8Source,context); vm.runInContext(grade9Source,context); vm.runInContext(grade10Source,context); vm.runInContext(fs.readFileSync(path.join(dir,'fieldwork.js'),'utf8'),context); vm.runInContext(gameSource,context);
  return {elements,store,missions:context.window.BIOQUEST_MISSIONS, grade5:context.window.BIOQUEST_GRADE5, grade6:context.window.BIOQUEST_GRADE6, grade7:context.window.BIOQUEST_GRADE7, grade8:context.window.BIOQUEST_GRADE8, grade9:context.window.BIOQUEST_GRADE9, grade10:context.window.BIOQUEST_GRADE10, click:id=>{assert.ok(elements.get(id),`missing ${id}`);elements.get(id).click();}, choices:()=>allChoices};
}
test('all missions are consistent and the full campaign unlocks, saves, resumes and completes',()=>{
  let app=boot(); const missions=app.missions; assert.equal(missions.length,5);
  assert.equal(app.elements.get('missions').children.length,5);
  assert.equal(app.elements.get('missions').children[1].disabled,true);
  app.click('continue'); app.click('start');
  // A wrong response provides feedback and the saved investigation survives a reload.
  app.choices().find(b=>b.textContent==='Non-living').click();
  assert.match(app.elements.get('feedback').textContent,/Not quite/);
  app=boot(app.store); app.click('continue');
  assert.match(app.elements.get('app').html,/INVESTIGATION 1/);
  for(let mi=0;mi<missions.length;mi++) {
    for(const task of missions[mi].tasks) {
      assert.ok(task.hint && task.explain);
      if(task.kind==='sort') {
        for(let n=0;n<task.items.length;n++) {
          const answer=task.items[n].group;
          assert.ok(task.groups.includes(answer));
          const button=app.choices().find(b=>b.textContent===answer); assert.ok(button); button.click(); app.click('next');
        }
      } else {
        assert.ok(task.options[task.answer]);
        app.choices()[task.answer].click(); app.click('next');
      }
    }
    if(mi<missions.length-1){assert.ok(app.elements.get('next-mission'), app.elements.get('app').html);app.click('next-mission');app.click('start');}
  }
  assert.match(app.elements.get('app').html,/centre is coming to life/);
  const saved=JSON.parse(Object.values(app.store)[0]); assert.equal(saved.completed.length,5); assert.equal(saved.checkpoints[4],undefined);
  app=boot(app.store); assert.equal(app.elements.get('progress').textContent,'5 / 5 restored');
  assert.equal(app.elements.get('missions').children.every(b=>!b.disabled),true);
});
test('grade 4 game ships local, valid references and accessible viewport controls',()=>{
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 for(const ref of ['missions.js','grade5.js','grade6.js','grade7.js','grade8.js','grade9.js','grade10.js','game.js','style.css']) {assert.ok(html.includes(ref));assert.ok(fs.existsSync(path.join(dir,ref)));}
 assert.match(html,/name="viewport"/); assert.match(html,/lang="en"/);
 assert.ok(fs.existsSync(path.join(dir,'thumb.webp')));
 const css=fs.readFileSync(path.join(dir,'style.css'),'utf8'); assert.match(css,/max-width:560px/); assert.match(css,/prefers-reduced-motion/);
});

test('Grade 5 can be chosen independently, preserves Grade 4 checkpoints and completes every activity',()=>{
 const key='bioquest.guardians.grade4.v1';
 let app=boot({[key]:JSON.stringify({completed:['living'],checkpoint:{mission:'plants',task:1,item:0,mistakes:2},sound:false})});
 assert.equal(app.elements.get('progress').textContent,'1 / 5 restored');
 app.click('grade5'); assert.equal(app.elements.get('grade-title').textContent,'Grade 5: The living reserve');
 assert.equal(app.elements.get('missions').children[0].disabled,false);
 assert.equal(app.elements.get('missions').children[1].disabled,true);
 app.click('continue'); app.click('start');
 let saved=JSON.parse(app.store[key]); assert.equal(saved.checkpoints[4].mission,'plants'); assert.equal(saved.checkpoints[5].mission,'g5-biodiversity');
 app.click('back'); app.click('grade4'); app.click('continue');
 assert.match(app.elements.get('app').html,/INVESTIGATION 2/);
 app.click('back'); app.click('grade5'); app=boot(app.store); app.click('continue');
 const missions=app.grade5;
 for (let i=0;i<missions.length;i++) {
   for (const task of missions[i].tasks) {
     assert.ok(task.hint && task.explain);
     if (task.kind==='sort') { for(const thing of task.items) { assert.ok(task.groups.includes(thing.group)); app.choices().find(b=>b.textContent===thing.group).click(); app.click('next'); } }
     else if (task.kind==='sequence') { for(const step of task.order) { assert.ok(task.options.includes(step)); app.choices().find(b=>b.textContent===step).click(); app.click('next'); } }
     else {app.choices()[task.answer].click(); app.click('next');}
   }
   if(i<missions.length-1){app.click('next-mission');app.click('start');}
 }
 assert.match(app.elements.get('app').html,/reserve is thriving/);
 saved=JSON.parse(app.store[key]); assert.equal(saved.completed.filter(id=>id.startsWith('g5-')).length,5); assert.equal(saved.checkpoints[4].mission,'plants'); assert.equal(saved.checkpoints[5],undefined);
 app=boot(app.store); assert.equal(app.elements.get('progress').textContent,'5 / 5 restored');
 app.click('grade4'); assert.equal(app.elements.get('progress').textContent,'1 / 5 restored');
});
test('an in-progress Grade 5 sequence resumes at the correct step',()=>{
 const key='bioquest.guardians.grade4.v1';
 const store={[key]:JSON.stringify({selectedGrade:5,completed:['g5-biodiversity','g5-skeletons'],checkpoints:{5:{mission:'g5-foodchains',task:0,item:2,mistakes:1}},sound:false})};
 const app=boot(store); app.click('continue');
 assert.match(app.elements.get('app').html,/Grass → Grasshopper/);
 assert.match(app.elements.get('app').html,/STEP 3 \/ 4/);
 app.choices().find(b=>b.textContent==='Frog').click(); app.click('next');
 assert.match(app.elements.get('app').html,/STEP 4 \/ 4/);
 app.choices().find(b=>b.textContent==='Snake').click();
 assert.match(app.elements.get('feedback').html,/Energy is transferred/);
});

test('Grade 6 plays independently and preserves earlier grade checkpoints',()=>{
 const key='bioquest.guardians.grade4.v1';
 const store={[key]:JSON.stringify({selectedGrade:5,completed:['living','g5-biodiversity'],checkpoints:{4:{mission:'plants',task:1,item:0,mistakes:2},5:{mission:'g5-skeletons',task:1,item:0,mistakes:0}},sound:false})};
 let app=boot(store); app.click('grade6'); assert.equal(app.elements.get('grade-title').textContent,'Grade 6: The web of life');
 assert.equal(app.elements.get('missions').children[0].disabled,false); assert.equal(app.elements.get('missions').children[1].disabled,true);
 app.click('continue'); app.click('start'); app.choices().find(b=>b.textContent==='Produced').click();
 assert.match(app.elements.get('feedback').textContent,/Not quite/);
 app=boot(app.store); app.click('continue');
 const missions=app.grade6; assert.equal(missions.length,5);
 for(let i=0;i<missions.length;i++){
  assert.equal(missions[i].tasks.length,3);
  for(const task of missions[i].tasks){
   assert.ok(task.hint && task.explain);
   if(task.kind==='sort'){for(const entry of task.items){assert.ok(task.groups.includes(entry.group));app.choices().find(b=>b.textContent===entry.group).click();app.click('next');}}
   else {assert.ok(task.options[task.answer]);app.choices()[task.answer].click();app.click('next');}
  }
  if(i<missions.length-1){app.click('next-mission');app.click('start');}
 }
 assert.match(app.elements.get('app').html,/web of life is connected/);
 const saved=JSON.parse(app.store[key]); assert.equal(saved.completed.filter(id=>id.startsWith('g6-')).length,5); assert.equal(saved.checkpoints[6],undefined);
 assert.equal(saved.checkpoints[4].mission,'plants');assert.equal(saved.checkpoints[5].mission,'g5-skeletons');
 app=boot(app.store);assert.equal(app.elements.get('progress').textContent,'5 / 5 restored');
 app.click('grade4');app.click('continue');assert.match(app.elements.get('app').html,/INVESTIGATION 2/);
 app.click('back');app.click('grade5');app.click('continue');assert.match(app.elements.get('app').html,/INVESTIGATION 2/);
});

const KEY = 'bioquest.guardians.grade4.v1';
const pathFor = (app, grade) => grade === 4 ? app.missions : app['grade' + grade];
const labelsFor = t => t.kind === 'sort' ? t.items.map(i => i.group) : t.kind === 'sequence' ? t.order : [t.options[t.answer]];
function solve(app, t, start = 0) {
 for (const label of labelsFor(t).slice(start)) {
  const b = app.choices().find(b => b.textContent === label); assert.ok(b, label); b.click();
  assert.ok(app.choices().every(b => b.disabled)); app.click('next');
 }
}
test('all thirty-five missions have valid distinct tasks and explanations', () => {
 const app = boot(), all = [4,5,6,7,8,9,10].flatMap(g => pathFor(app,g));
 assert.equal(new Set(all.map(m=>m.id)).size,35);
 for(const m of all) {
  assert.equal(m.tasks.length,3); assert.ok(m.intro && m.learn && m.theme);
  for(const t of m.tasks) {
   assert.ok(t.hint && t.explain && t.prompt);
   assert.ok(['sort','sequence','choice'].includes(t.kind));
   const choices = t.kind === 'sort' ? t.groups : t.options;
   assert.equal(new Set(choices).size,choices.length);
   for(const label of labelsFor(t)) assert.ok(choices.includes(label));
  }
 }
});
test('Grade 7 full campaign, independent checkpoints, hints, retry, reload and replay',()=>{
 let app=boot({[KEY]:JSON.stringify({selectedGrade:6,completed:['living','g5-biodiversity','g6-photosynthesis'],checkpoints:{4:{mission:'plants',task:1,item:0,mistakes:2},5:{mission:'g5-skeletons',task:1,item:0,mistakes:1},6:{mission:'g6-nutrients',task:1,item:0,mistakes:0}}})});
 app.click('grade7'); assert.equal(app.elements.get('grade-title').textContent,'Grade 7: The biodiversity expedition');
 assert.equal(app.elements.get('missions').children[1].disabled,true);
 app.click('continue'); app.click('start'); app.click('hint'); assert.equal(app.elements.get('hint-text').hidden,false);
 const t=app.grade7[0].tasks[0], correct=labelsFor(t)[0];
 app.choices().find(b=>b.textContent!==correct).click(); assert.match(app.elements.get('feedback').textContent,/Not quite/);
 app=boot(app.store); app.click('continue');
 for(let i=0;i<5;i++) {for(const t of app.grade7[i].tasks) solve(app,t); if(i<4){app.click('next-mission');app.click('start');}}
 assert.match(app.elements.get('app').html,/The biodiversity atlas is ready!/);
 let saved=JSON.parse(app.store[KEY]); assert.equal(saved.completed.length,8); assert.equal(saved.checkpoints[7],undefined);
 for(const g of [4,5,6]) {assert.equal(saved.checkpoints[g].task,1);}
 app.click('journal'); app.elements.get('missions').children[0].click(); app.click('start');
 for(const t of app.grade7[0].tasks) solve(app,t);
 assert.equal(JSON.parse(app.store[KEY]).completed.length,8);
 app.click('journal'); app=boot(app.store); assert.equal(app.elements.get('progress').textContent,'5 / 5 restored');
 for(const g of [4,5,6]) {app.click('grade'+g); app.click('continue'); assert.match(app.elements.get('app').html,/INVESTIGATION 2/); app.click('back');}
});
test('malformed, read-blocked and write-blocked storage remain playable in each grade',()=>{
 for(const raw of ['{broken','null','[]','42','"bad"',JSON.stringify({selectedGrade:'7',completed:'bad',checkpoints:[]})]) {
  const app=boot({[KEY]:raw}); app.click('grade7'); app.click('continue'); app.click('start'); solve(app,app.grade7[0].tasks[0]);
  assert.match(app.elements.get('app').html,/INVESTIGATION 2/);
 }
 for(const g of [4,5,6,7,8,9,10]) for(const mode of ['read','write']) {
  const app=boot({},mode); app.click('grade'+g); app.click('continue'); app.click('start'); solve(app,pathFor(app,g)[0].tasks[0]);
  app.click('back'); app.click('grade'+(g===4?5:4)); app.click('grade'+g); app.click('continue');
  assert.match(app.elements.get('app').html,/INVESTIGATION 2/); assert.deepEqual(app.store,{});
 }
});
test('Grade 7 checkpoint bounds reject locked missions and invalid task/item values',()=>{
 for(const cp of [null,[],true,'bad',{mission:'g7-reproduction',task:0},{mission:'g7-biosphere',task:-1},{mission:'g7-biosphere',task:0.5}]) {
  const app=boot({[KEY]:JSON.stringify({selectedGrade:7,checkpoints:{7:cp}})}); app.click('continue');
  assert.match(app.elements.get('app').html,/MISSION 1/); app.click('start'); assert.match(app.elements.get('app').html,/INVESTIGATION 1/);
 }
 for(const item of [-1,999,1.5,'2']) {
  const app=boot({[KEY]:JSON.stringify({selectedGrade:7,checkpoints:{7:{mission:'g7-biosphere',task:0,item,mistakes:-3}}})});
  app.click('continue'); assert.equal(JSON.parse(app.store[KEY]).checkpoints[7].item,0); assert.equal(JSON.parse(app.store[KEY]).checkpoints[7].mistakes,0);
 }
});
test('repeated and stale callbacks cannot advance twice or change a different grade',()=>{
 const app=boot(); app.click('grade6'); app.click('continue'); app.click('start');
 const first=app.choices().find(b=>b.textContent==='Used'); first.click(); first.onclick();
 assert.equal(JSON.parse(app.store[KEY]).checkpoints[6].item,1);
 app.click('next'); const staleAnswer=app.choices()[0].onclick;
 app.click('back'); app.click('grade7'); app.click('continue'); app.click('start');
 const before=app.store[KEY]; staleAnswer(); assert.equal(app.store[KEY],before);
 const t=app.grade7[0].tasks[0]; solve(app,t);
 const correct=app.choices().find(b=>b.textContent===labelsFor(app.grade7[0].tasks[1])[0]); correct.click();
 const next=app.elements.get('next').onclick; next(); const after=app.store[KEY]; next(); assert.equal(app.store[KEY],after);
});
test('Grade 7 sequence checkpoints resume between correct answers and next clicks',()=>{
 const initial=boot(), mi=initial.grade7.findIndex(m=>m.tasks.some(t=>t.kind==='sequence')); assert.ok(mi>=0);
 const ti=initial.grade7[mi].tasks.findIndex(t=>t.kind==='sequence'), mission=initial.grade7[mi];
 let app=boot({[KEY]:JSON.stringify({selectedGrade:7,completed:initial.grade7.slice(0,mi).map(m=>m.id),checkpoints:{7:{mission:mission.id,task:ti,item:0,mistakes:0}}})});
 app.click('continue'); app.choices().find(b=>b.textContent===mission.tasks[ti].order[0]).click();
 app=boot(app.store); app.click('continue'); assert.match(app.elements.get('app').html,/STEP 2/);
 solve(app,mission.tasks[ti],1);
 assert.match(app.elements.get('app').html,new RegExp(`INVESTIGATION ${ti+2}`));
});

test('stale hints cannot replace the active grade hint',()=>{
 const app=boot(); app.click('grade6'); app.click('continue'); app.click('start');
 const stale=app.elements.get('hint').onclick; app.click('back'); app.click('grade7'); app.click('continue'); app.click('start');
 app.click('hint'); const text=app.elements.get('hint-text').textContent; stale(); assert.equal(app.elements.get('hint-text').textContent,text);
});
test('Grade 8 campaign completes and preserves prior grade checkpoints',()=>{
 let app=boot({[KEY]:JSON.stringify({selectedGrade:7,completed:['living','g5-biodiversity','g6-photosynthesis','g7-biosphere'],checkpoints:{4:{mission:'plants',task:1,item:0,mistakes:2},5:{mission:'g5-skeletons',task:1,item:0,mistakes:1},6:{mission:'g6-nutrients',task:1,item:0,mistakes:0},7:{mission:'g7-classification',task:1,item:0,mistakes:0}}})});
 app.click('grade8');assert.equal(app.elements.get('grade-title').textContent,'Grade 8: Energy and ecosystems');assert.equal(app.elements.get('missions').children[1].disabled,true);
 app.click('continue');app.click('start');app.click('hint');assert.equal(app.elements.get('hint-text').hidden,false);
 const correct=labelsFor(app.grade8[0].tasks[0])[0];app.choices().find(b=>b.textContent!==correct).click();assert.match(app.elements.get('feedback').textContent,/Not quite/);app=boot(app.store);app.click('continue');
 for(let i=0;i<5;i++){for(const task of app.grade8[i].tasks)solve(app,task);if(i<4){app.click('next-mission');app.click('start');}}
 assert.match(app.elements.get('app').html,/The reserve has a brighter future/);const saved=JSON.parse(app.store[KEY]);assert.equal(saved.completed.filter(id=>id.startsWith('g8-')).length,5);for(const g of [4,5,6,7])assert.equal(saved.checkpoints[g].task,1);assert.equal(saved.checkpoints[8],undefined);
 app.click('journal');app=boot(app.store);assert.equal(app.elements.get('progress').textContent,'5 / 5 restored');
});

test('Grade 9 full campaign, all older checkpoints, retries, reload and replay',()=>{
 const base=boot(), oldGrades=[4,5,6,7,8];
 const checkpoints=Object.fromEntries(oldGrades.map(g=>[g,{mission:pathFor(base,g)[1].id,task:1,item:0,mistakes:2}]));
 const completed=oldGrades.map(g=>pathFor(base,g)[0].id);
 let app=boot({[KEY]:JSON.stringify({selectedGrade:8,completed,checkpoints})});
 app.click('grade9'); assert.equal(app.elements.get('grade-title').textContent,'Grade 9: Cells and body systems');
 assert.equal(app.elements.get('missions').children[1].disabled,true);
 app.click('continue'); app.click('start'); app.click('hint'); assert.equal(app.elements.get('hint-text').hidden,false);
 const correct=labelsFor(app.grade9[0].tasks[0])[0]; app.choices().find(b=>b.textContent!==correct).click();
 assert.match(app.elements.get('feedback').textContent,/Not quite/);
 app=boot(app.store); app.click('continue');
 for(let i=0;i<5;i++){for(const task of app.grade9[i].tasks)solve(app,task);if(i<4){app.click('next-mission');app.click('start');}}
 assert.match(app.elements.get('app').html,/The living systems exhibit is ready!/);
 let saved=JSON.parse(app.store[KEY]); assert.equal(saved.completed.length,10); assert.equal(saved.checkpoints[9],undefined);
 assert.deepEqual(saved.checkpoints,checkpoints);
 app.click('journal'); app=boot(app.store); assert.equal(app.elements.get('progress').textContent,'5 / 5 restored');
 app.elements.get('missions').children[0].click();app.click('start');for(const t of app.grade9[0].tasks)solve(app,t);
 assert.equal(JSON.parse(app.store[KEY]).completed.length,10);app.click('journal');
 for(const g of oldGrades){app.click('grade'+g);app.click('continue');assert.match(app.elements.get('app').html,/INVESTIGATION 2/);app.click('back');}
});
test('Grade 9 sequences resume after a correct answer and reject invalid checkpoints',()=>{
 const base=boot(), mission=base.grade9[1],task=mission.tasks[0];
 let app=boot({[KEY]:JSON.stringify({selectedGrade:9,completed:['g9-cells'],checkpoints:{9:{mission:mission.id,task:0,item:0,mistakes:0}}})});
 app.click('continue');app.choices().find(b=>b.textContent===task.order[0]).click();
 app=boot(app.store);app.click('continue');assert.match(app.elements.get('app').html,/STEP 2/);solve(app,task,1);
 assert.match(app.elements.get('app').html,/INVESTIGATION 2/);
 for(const cp of [null,[],{mission:'g9-reproduction',task:0},{mission:'g9-cells',task:-1},{mission:'g9-cells',task:0.5}]){
  app=boot({[KEY]:JSON.stringify({selectedGrade:9,checkpoints:{9:cp}})});app.click('continue');assert.match(app.elements.get('app').html,/MISSION 1/);
 }
 for(const item of [-1,999,1.5,'2']){
  app=boot({[KEY]:JSON.stringify({selectedGrade:9,checkpoints:{9:{mission:'g9-cells',task:0,item,mistakes:-3}}})});app.click('continue');
  const cp=JSON.parse(app.store[KEY]).checkpoints[9];assert.equal(cp.item,0);assert.equal(cp.mistakes,0);
 }
});
test('Grade 9 stale callbacks cannot affect earlier paths and every theme has music',()=>{
 const app=boot();app.click('grade9');app.click('continue');app.click('start');const answer=app.choices()[0].onclick, hint=app.elements.get('hint').onclick;
 app.click('back');app.click('grade8');app.click('continue');app.click('start');app.click('hint');
 const before=app.store[KEY],text=app.elements.get('hint-text').textContent;answer();hint();assert.equal(app.store[KEY],before);assert.equal(app.elements.get('hint-text').textContent,text);
 const melodies=JSON.parse(gameSource.match(/const melodies = (\[.*?\]);/)[1]);assert.equal(melodies.length,35);
 const css=fs.readFileSync(path.join(dir,'style.css'),'utf8');for(const m of app.grade9)assert.ok(css.includes('.'+m.theme+'{'));
 const manifest=JSON.parse(fs.readFileSync(path.join(dir,'game.json'),'utf8'));assert.ok(manifest.tags.includes('grade-9'));assert.match(manifest.description,/35 Grade 4–10/);
});

test('public copy reports seven paths, thirty-five missions and 105 investigations',()=>{
 const editorial=fs.readFileSync(path.join(__dirname,'../src/content/gameEditorials.ts'),'utf8').split('"bioquest-guardians-of-life": {')[1].split('"brick-blaster": {')[0];
 assert.match(editorial,/35 untimed missions and 105 investigations/);assert.match(editorial,/Seven independent learning paths/);assert.match(editorial,/Grades 4–10/);
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');for(const g of [4,5,6,7,8,9,10])assert.ok(html.includes('id="grade'+g+'"'));
});

test('Grade 10 full campaign, all older checkpoints, retries, reload and replay',()=>{
 const base=boot(), oldGrades=[4,5,6,7,8,9];
 const checkpoints=Object.fromEntries(oldGrades.map(g=>[g,{mission:pathFor(base,g)[1].id,task:1,item:0,mistakes:2}]));
 const completed=oldGrades.map(g=>pathFor(base,g)[0].id);
 let app=boot({[KEY]:JSON.stringify({selectedGrade:8,completed,checkpoints})});
 app.click('grade10'); assert.equal(app.elements.get('grade-title').textContent,'Grade 10: The Living Archive');
 assert.equal(app.elements.get('missions').children[1].disabled,true);
 app.click('continue'); app.click('start'); app.click('hint'); assert.equal(app.elements.get('hint-text').hidden,false);
 const correct=labelsFor(app.grade10[0].tasks[0])[0]; app.choices().find(b=>b.textContent!==correct).click();
 assert.match(app.elements.get('feedback').textContent,/Not quite/);
 app=boot(app.store); app.click('continue');
 for(let i=0;i<5;i++){for(const task of app.grade10[i].tasks)solve(app,task);if(i<4){app.click('next-mission');app.click('start');}}
 assert.match(app.elements.get('app').html,/The Living Archive is complete!/);
 let saved=JSON.parse(app.store[KEY]); assert.equal(saved.completed.length,11); assert.equal(saved.checkpoints[10],undefined);
 assert.deepEqual(saved.checkpoints,checkpoints);
 app.click('journal'); app=boot(app.store); assert.equal(app.elements.get('progress').textContent,'5 / 5 restored');
 app.elements.get('missions').children[0].click();app.click('start');for(const t of app.grade10[0].tasks)solve(app,t);
 assert.equal(JSON.parse(app.store[KEY]).completed.length,11);app.click('journal');
 for(const g of oldGrades){app.click('grade'+g);app.click('continue');assert.match(app.elements.get('app').html,/INVESTIGATION 2/);app.click('back');}
});

test('Grade 10 sequences resume after a correct answer and reject invalid checkpoints',()=>{
 const base=boot(), mission=base.grade10[2],task=mission.tasks[0];
 let app=boot({[KEY]:JSON.stringify({selectedGrade:10,completed:['g10-molecules','g10-membranes'],checkpoints:{10:{mission:mission.id,task:0,item:0,mistakes:0}}})});
 app.click('continue');app.choices().find(b=>b.textContent===task.order[0]).click();
 app=boot(app.store);app.click('continue');assert.match(app.elements.get('app').html,/STEP 2/);solve(app,task,1);
 assert.match(app.elements.get('app').html,/INVESTIGATION 2/);
 for(const cp of [null,[],{mission:'g10-archive',task:0},{mission:'g10-molecules',task:-1},{mission:'g10-molecules',task:0.5}]){
  app=boot({[KEY]:JSON.stringify({selectedGrade:10,checkpoints:{10:cp}})});app.click('continue');assert.match(app.elements.get('app').html,/MISSION 1/);
 }
 for(const item of [-1,999,1.5,'2']){
  app=boot({[KEY]:JSON.stringify({selectedGrade:10,checkpoints:{10:{mission:'g10-molecules',task:0,item,mistakes:-3}}})});app.click('continue');
  const cp=JSON.parse(app.store[KEY]).checkpoints[10];assert.equal(cp.item,0);assert.equal(cp.mistakes,0);
 }
});

test('Grade 10 stale callbacks cannot affect earlier paths and every theme has music',()=>{
 const app=boot();app.click('grade10');app.click('continue');app.click('start');const answer=app.choices()[0].onclick, hint=app.elements.get('hint').onclick;
 app.click('back');app.click('grade8');app.click('continue');app.click('start');app.click('hint');
 const before=app.store[KEY],text=app.elements.get('hint-text').textContent;answer();hint();assert.equal(app.store[KEY],before);assert.equal(app.elements.get('hint-text').textContent,text);
 const melodies=JSON.parse(gameSource.match(/const melodies = (\[.*?\]);/)[1]);assert.equal(melodies.length,35);
 const css=fs.readFileSync(path.join(dir,'style.css'),'utf8');for(const m of app.grade10)assert.ok(css.includes('.'+m.theme+'{'));
 const manifest=JSON.parse(fs.readFileSync(path.join(dir,'game.json'),'utf8'));assert.ok(manifest.tags.includes('grade-10'));assert.match(manifest.description,/35 Grade 4–10/);
});


test('Grade 10 finale is bounded and original save compatibility remains explicit',()=>{
 assert.match(gameSource,/final planned chapter/);assert.ok(gameSource.includes(KEY));
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');assert.ok(!html.includes('id="grade11"'));
 const app=boot({[KEY]:JSON.stringify({completed:['living'],checkpoint:{mission:'plants',task:1,item:0,mistakes:1}})});
 app.click('grade10');app.click('continue');app.click('start');app.click('back');app.click('grade4');app.click('continue');assert.match(app.elements.get('app').html,/INVESTIGATION 2/);
});

test('every mission ships distinct optimized local artwork and both animated companions', () => {
 const crypto = require('node:crypto');
 const app = boot(), hashes = new Set();
 for (const grade of [4,5,6,7,8,9,10]) {
  app.click('grade'+grade);
  for (const m of pathFor(app,grade)) {
   const file = path.join(dir,'assets/backgrounds',m.id+'.webp');
   assert.ok(fs.existsSync(file), `missing background for ${m.id}`);
   const bytes = fs.readFileSync(file);
   assert.equal(bytes.toString('ascii',0,4),'RIFF');
   assert.equal(bytes.toString('ascii',8,12),'WEBP');
   assert.ok(bytes.length < 350000, `${m.id} is too large for the mobile asset budget`);
   hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
  }
  app.click('continue');
  assert.match(app.elements.get('app').html,new RegExp(`data-scene="${pathFor(app,grade)[0].id}"`));
  app.click('start');
  assert.match(app.elements.get('app').html,/class="sprite nala"/);
  assert.match(app.elements.get('app').html,/class="sprite pip"/);
  app.click('back');
 }
 assert.equal(hashes.size,35,'every mission must have its own image, not a duplicate file');
 for (const name of ['nala','pip']) {
  const data=fs.readFileSync(path.join(dir,'assets/sprites',name+'.webp'));
  assert.equal(data.toString('ascii',8,12),'WEBP');
  assert.ok(data.length < 350000);
 }
 const css = fs.readFileSync(path.join(dir,'style.css'),'utf8');
 assert.match(css,/@keyframes nala-frames/);assert.match(css,/@keyframes pip-frames/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(gameSource,/loading="lazy"/);
});

test('field notes migrate independently of legacy checkpoints and ignore invalid or repeated entries',()=>{
 const app=boot({[KEY]:JSON.stringify({completed:['living'],checkpoint:{mission:'plants',task:1,item:0,mistakes:2},
   observations:['living','kit-cells',null,'unknown','living',{}]})});
 const saved=JSON.parse(app.store[KEY]);
 assert.deepEqual(saved.observations,['living','kit-cells']);
 assert.deepEqual(saved.completed,['living']);
 assert.equal(saved.checkpoints[4].mission,'plants');
});
