'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const dir = path.join(__dirname, '../public/games/bioquest-guardians-of-life');
const missionsSource = fs.readFileSync(path.join(dir, 'missions.js'), 'utf8');
const gameSource = fs.readFileSync(path.join(dir, 'game.js'), 'utf8');
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
  elements.get('home-template').content={cloneNode:()=>({ids:['continue','progress','missions']})};
  const document={getElementById:id=>elements.get(id),createElement:()=>new Element(),querySelectorAll:sel=>sel==='#choices button'?allChoices:[],addEventListener(){},fullscreenEnabled:false,documentElement:{},hidden:false};
  const localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;}};
  const context=vm.createContext({window:{},document,localStorage,setTimeout:()=>0,setInterval:()=>0,clearInterval(){},console});
  vm.runInContext(missionsSource,context); vm.runInContext(gameSource,context);
  return {elements,store,missions:context.window.BIOQUEST_MISSIONS, click:id=>{assert.ok(elements.get(id),`missing ${id}`);elements.get(id).click();}, choices:()=>allChoices};
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
  const saved=JSON.parse(Object.values(app.store)[0]); assert.equal(saved.completed.length,5); assert.equal(saved.checkpoint,null);
  app=boot(app.store); assert.equal(app.elements.get('progress').textContent,'5 / 5 restored');
  assert.equal(app.elements.get('missions').children.every(b=>!b.disabled),true);
});
test('grade 4 game ships local, valid references and accessible viewport controls',()=>{
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
 for(const ref of ['missions.js','game.js','style.css']) {assert.ok(html.includes(ref));assert.ok(fs.existsSync(path.join(dir,ref)));}
 assert.match(html,/name="viewport"/); assert.match(html,/lang="en"/);
 assert.ok(fs.existsSync(path.join(dir,'thumb.webp')));
 const css=fs.readFileSync(path.join(dir,'style.css'),'utf8'); assert.match(css,/max-width:560px/); assert.match(css,/prefers-reduced-motion/);
});
