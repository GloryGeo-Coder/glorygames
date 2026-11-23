const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm');
const {readGrimeTarget,readSortTarget,readPromptProof,readSortProgress,assertSortProgress,waitForSortTarget} = require('./helpers/recycle-browser-snapshot.cjs');
const aimArgs={mapping:{'paper.webp':'paper','metal.webp':'metal','bottle.webp':'plastic'},binArt:{paper:'paper.webp',metal:'metal.webp',plastic:'bottle.webp'}};
function snapshot(paints, nodes = {scoreValue: {textContent: '108'}, bossFill: {style: {width: '86.5%'}}}) {
  // Match page.evaluate serialization, with native DOM textContent represented as a string property.
  return vm.runInNewContext('('+readGrimeTarget.toString()+')()', scene(paints,nodes));
}
test('serialized browser snapshot reads HUD properties and the current visible Grime target', () => {
  const painted = {src: 'assets/animated/grime-atlas.webp', x: 120, y: 75, w: 48, h: 48};
  const result = snapshot([{src: 'assets/items/paper.webp', y: 50, w: 50}, painted]);
  assert.equal(result.score, 108); assert.equal(result.bossWidth, 86.5); assert.equal(result.hazard, painted);
});
test('an absent target is explicit and unavailable HUD values cannot pass as zero', () => {
  assert.equal(snapshot([]).hazard, null);
  assert.throws(() => snapshot([], {}), /HUD values are unavailable/);
});

function scene(paints,nodes={},options={}){
 const rect={left:0,top:0,width:320,height:400,...options.rect};
 const canvas={getBoundingClientRect:()=>rect};
 return {window:{__arcadePaints:paints,innerWidth:320,innerHeight:500},document:{getElementById:id=>id==='gameCanvas'?canvas:nodes[id],elementFromPoint:()=>options.blocked?{}:canvas},args:aimArgs};
}
function aim(paints,options={}){return vm.runInNewContext('('+readSortTarget.toString()+')(args)',scene(paints,{},options));}
const picture=(name,x,y,w=50)=>({src:'assets/'+name,x,y,w,h:w});
test('aiming rejects the recorded overlapping Grime case and chooses an uncovered material',()=>{
 const clear=picture('bottle.webp',85,90),covered=picture('metal.webp',201,41),grime=picture('grime-atlas.webp',201.3998,40.8353,56.65);
 const result=aim([clear,covered,picture('bottle.webp',250,230,28),picture('metal.webp',150,230,28),grime]);
 assert.equal(result.item,clear);assert.equal(result.bin.x,250);
});
test('aiming never clicks an item or bin covered by Grime',()=>{
 const item=picture('paper.webp',100,80),bin=picture('paper.webp',100,230,28);
 assert.equal(aim([item,bin,picture('grime-atlas.webp',100,80,55)]),null);
 assert.equal(aim([item,bin,picture('grime-atlas.webp',100,230,55)]),null);
});
test('a later power sprite also blocks a material target while a clear scene remains selectable',()=>{
 const item=picture('paper.webp',100,80),bin=picture('paper.webp',100,230,28);
 assert.equal(aim([item,bin,picture('magnet.webp',100,80)]),null);
 assert.equal(aim([item,bin]).item,item);
});

function proof(pixels){
 let sample;
 const result=vm.runInNewContext('('+readPromptProof.toString()+')()',{
  window:{__sortPrompt:{x:150,y:80,maxWidth:200,fill:'#f0fff7',frame:12}},
  document:{getElementById:()=>({width:640,height:400,getBoundingClientRect:()=>({width:320}),getContext:()=>({getImageData:(...args)=>{sample=args;return{data:pixels};}})})}
 });return {result,sample};
}
test('contrast proof samples the correct physical pixel on a scaled canvas',()=>{
 const {result,sample}=proof([7,28,35,255]);assert.deepEqual(sample,[96,152,1,1]);
 assert.deepEqual(Array.from(result.rgba),[7,28,35,255]);assert.equal(result.frame,12);
});
test('a cleared canvas is reported as transparent rather than passing the contrast proof',()=>{
 assert.deepEqual(Array.from(proof([0,0,0,0]).result.rgba),[0,0,0,0]);
});

test('offscreen edge-spawned materials cannot be selected for native taps',()=>{
 const bin=picture('metal.webp',150,230,28);
 assert.equal(aim([picture('metal.webp',-37.2219,41.0282),bin]),null);
 assert.equal(aim([picture('metal.webp',340,80),bin]),null);
 assert.equal(aim([picture('metal.webp',100,420),bin]),null);
});
test('the recorded hazard beyond the canvas edge is skipped for a visible hazard',()=>{
 const outside=picture('grime-atlas.webp',379.0879,251.4872,55),inside=picture('grime-atlas.webp',145,138,49);
 assert.equal(snapshot([outside,inside]).hazard,inside);
 assert.equal(snapshot([outside]).hazard,null);
});
test('canvas targets covered by a DOM overlay are rejected',()=>{
 assert.equal(aim([picture('paper.webp',100,80),picture('paper.webp',100,230,28)],{blocked:true}),null);
});
test('a visible canvas can still have a bin below the browser viewport',()=>{
 assert.equal(aim([picture('paper.webp',100,80),picture('paper.webp',100,230,28)],{rect:{top:300}}),null);
});

function progress(score,objective){return vm.runInNewContext('('+readSortProgress.toString()+')()', {document:{getElementById:id=>({textContent:id==='scoreValue'?score:objective})}});}
test('native sort acceptance measures the first sort from its pre-input HUD',()=>{
 assertSortProgress(progress('0','Boss: The Bog: 0/24 clean sorts \u2022 Defeat The Bog'),progress('108','Boss: The Bog: 1/24 clean sorts \u2022 Defeat The Bog'));
});
test('the recorded second clean sort passes relative acceptance',()=>{
 assertSortProgress(progress('108','Boss: The Bog: 1/24 clean sorts \u2022 Defeat The Bog'),progress('216','Boss: The Bog: 2/24 clean sorts \u2022 Defeat The Bog'));
});
test('existing points or unrelated points cannot replace a new clean sort',()=>{
 const before={score:108,sorted:1,target:24};
 assert.throws(()=>assertSortProgress(before,before),/additional clean sort/);
 assert.throws(()=>assertSortProgress(before,{...before,score:216}),/additional clean sort/);
 assert.throws(()=>assertSortProgress(before,{...before,sorted:2}),/clean-sort points/);
 assert.throws(()=>assertSortProgress(before,{score:216,sorted:2,target:30}),/target stays/);
});
test('sort acceptance rejects missing or malformed HUD evidence',()=>{
 for(const [score,text]of [['','Boss: The Bog: 1/24 clean sorts'],['NaN','Boss: The Bog: 1/24 clean sorts'],['108',''],['108','Boss: The Bog: unknown/24 clean sorts']])assert.throws(()=>progress(score,text),/HUD is unavailable/);
});

test('sort HUD reader accepts the actual game objective template',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const source=fs.readFileSync(path.join(__dirname,'../public/games/recycle-rush/game.js'),'utf8');
 const expression=source.match(/ui\.objective\.textContent = ([^\n]+);/)[1];
 for(const sorted of [0,1,2]){
  const objective=vm.runInNewContext(expression,{state:{loop:false,sorted,boss:{}},lv:{name:'Boss: Hallway Sludge',target:18},chapter:()=>({boss:'Hallway Sludge'})});
  assert.equal(progress(String(sorted*108),objective).sorted,sorted);
 }
});

test('sort target waiting allows a later visible item without fabricating a target',async()=>{
 let frames=0;const target={item:picture('paper.webp',100,80),bin:picture('paper.webp',100,230,28)};
 const result=await waitForSortTarget({read:async()=>frames>=72?target:null,advance:async ms=>{assert.equal(ms,16);frames++;},isActive:async()=>true});
 assert.equal(result,target);assert.equal(frames,72);
});
test('sort target waiting has a finite simulation budget and never accepts absence',async()=>{
 let advances=0;
 await assert.rejects(waitForSortTarget({read:async()=>null,advance:async()=>advances++,isActive:async()=>true}),/within 4800ms/);
 assert.equal(advances,300);
});
test('sort target waiting stops on encounter loss instead of advancing through the end screen',async()=>{
 let advances=0;
 await assert.rejects(waitForSortTarget({read:async()=>null,advance:async()=>advances++,isActive:async()=>advances<2}),/Encounter stopped/);
 assert.equal(advances,2);
});
