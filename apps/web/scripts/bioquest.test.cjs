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
function boot(store = {}) {
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
  elements.get('home-template').content={cloneNode:()=>({ids:['continue','progress','missions','grade-title','grade4','grade5','grade6']})};
  const document={getElementById:id=>elements.get(id),createElement:()=>new Element(),querySelectorAll:sel=>sel==='#choices button'?allChoices:[],addEventListener(){},fullscreenEnabled:false,documentElement:{},hidden:false};
  const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;}};
  const context=vm.createContext({window:{},document,localStorage,setTimeout:()=>0,setInterval:()=>0,clearInterval(){},console});
  vm.runInContext(missionsSource,context); vm.runInContext(grade5Source,context); vm.runInContext(grade6Source,context); vm.runInContext(gameSource,context);
  return {elements,store,missions:context.window.BIOQUEST_MISSIONS, grade5:context.window.BIOQUEST_GRADE5, grade6:context.window.BIOQUEST_GRADE6, click:id=>{assert.ok(elements.get(id),`missing ${id}`);elements.get(id).click();}, choices:()=>allChoices};
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
 for(const ref of ['missions.js','grade5.js','grade6.js','game.js','style.css']) {assert.ok(html.includes(ref));assert.ok(fs.existsSync(path.join(dir,ref)));}
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
