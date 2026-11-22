const test = require('node:test'), assert = require('node:assert/strict'), vm = require('node:vm');
const {readGrimeTarget,readSortTarget} = require('./helpers/recycle-browser-snapshot.cjs');
function snapshot(paints, nodes = {scoreValue: {textContent: '108'}, bossFill: {style: {width: '86.5%'}}}) {
  // Match page.evaluate serialization, with native DOM textContent represented as a string property.
  return vm.runInNewContext('('+readGrimeTarget.toString()+')()', {window: {__arcadePaints: paints}, document: {getElementById: id => nodes[id]}});
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

const aimArgs={mapping:{'paper.webp':'paper','metal.webp':'metal','bottle.webp':'plastic'},binArt:{paper:'paper.webp',metal:'metal.webp',plastic:'bottle.webp'}};
function aim(paints){return vm.runInNewContext('('+readSortTarget.toString()+')(args)',{window:{__arcadePaints:paints},args:aimArgs});}
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
