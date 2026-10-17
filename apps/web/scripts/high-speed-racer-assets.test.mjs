import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
const root=fileURLToPath(new URL('../public/games/high-spead-racer/',import.meta.url));
const assets=JSON.parse(readFileSync(path.join(root,'assets/models/neon/assets.json')));
for(const entry of assets.assets) test(`${entry.file}: valid self-contained PBR GLB within geometry budget`,()=>{
  const b=readFileSync(path.join(root,'assets/models/neon',entry.file));
  assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);
  const size=b.readUInt32LE(12), doc=JSON.parse(b.subarray(20,20+size));
  assert.equal(doc.asset.version,'2.0');assert.ok(!doc.images?.length);assert.ok(!doc.buffers[0].uri);
  assert.ok(entry.triangles<3000);assert.ok(entry.draw_primitives<=14);assert.ok(b.length<200000);
  const bin=28+size;
  for(const a of doc.accessors){
    const view=doc.bufferViews[a.bufferView];assert.equal(a.componentType,5126);
    assert.ok(view.byteOffset+view.byteLength<=doc.buffers[0].byteLength);
    for(let i=0;i<view.byteLength;i+=4)assert.ok(Number.isFinite(b.readFloatLE(bin+view.byteOffset+i)));
  }
  if(entry.file.includes('highway')) {
    const positions=doc.meshes.flatMap(m=>m.primitives.map(p=>doc.accessors[p.attributes.POSITION]));
    assert.equal(Math.min(...positions.map(a=>a.min[2])),-128);assert.equal(Math.max(...positions.map(a=>a.max[2])),0);
    assert.equal(entry.draw_primitives,5);
  } else if(!entry.file.includes('skyline')) {
    assert.equal(doc.nodes.filter(n=>n.name.startsWith('Wheel_')).length,4);
    assert.ok(doc.materials.some(m=>m.extensions?.KHR_materials_clearcoat));
    assert.ok(doc.materials.some(m=>m.name==='Rear LED'));
  }
});
test('local scripts, styles, models, audio and sprite references all resolve; dedicated-tab opt-in remains',()=>{
  const html=readFileSync(path.join(root,'index.html'),'utf8');
  for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const url=m[1].split('?')[0]; if(url.startsWith('/'))continue;
    assert.ok(existsSync(path.resolve(root,url)),url);
  }
  const source=readFileSync(path.join(root,'game.js'),'utf8')+readFileSync(path.join(root,'racer-3d.js'),'utf8');
  for(const m of source.matchAll(/["'](assets\/[^"'`]+\.(?:glb|wav|png))["']/g))assert.ok(existsSync(path.join(root,m[1])),m[1]);
  assert.ok(html.includes('/games/_shared/game-tab.mjs?v=1'));assert.ok(!html.includes('https://code.playcanvas.com'));
  assert.ok(html.includes('id="helpBtn"'));assert.ok(html.includes('id="menuAudioBtn"'));
  assert.ok(html.includes('viewport-fit=cover'));
});
test('quality presets cap phone resolution and respect reduced motion',()=>{
  const context={window:{}};vm.runInNewContext(readFileSync(path.join(root,'racer-3d.js'),'utf8'),context);
  const phone=context.window.Racer3D.qualityFor({innerWidth:390,matchMedia:q=>({matches:q.includes('coarse')||q.includes('reduced-motion')})});
  const desktop=context.window.Racer3D.qualityFor({innerWidth:1440,matchMedia:()=>({matches:false})});
  assert.equal(phone.compact,true);assert.equal(phone.pixelRatio,1.25);assert.equal(phone.reducedMotion,true);
  assert.ok(phone.skylineCount<desktop.skylineCount);assert.ok(phone.sceneryCount<desktop.sceneryCount);
  assert.equal(desktop.reducedMotion,false);assert.equal(desktop.pixelRatio,1.75);
});
