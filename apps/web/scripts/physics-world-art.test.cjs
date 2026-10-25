const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../public/games/physics-force-lab'),W=require(path.join(root,'world-art')),A=require(path.join(root,'adventure-data'));
test('every Adventure and original background resolves to one of twelve complete optimized environments',()=>{
  assert.equal(W.locations.length,12);let bytes=0;
  const sources=new Set([...A.missions.map(m=>m.bg),...fs.readFileSync(path.join(root,'game.js'),'utf8').matchAll(/\.\/assets\/backgrounds\/([^"']+)/g)].map(m=>typeof m==='string'?m:m[1]));
  for(const name of sources){assert.ok(W.aliases[name],name);assert.ok(W.locations.includes(W.location(name)));}
  for(const name of W.locations){const file=path.join(root,W.source(name+'.webp')),b=fs.readFileSync(file);assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');bytes+=b.length;}
  assert.ok(bytes<2*1024*1024,`Background download budget ${bytes}`);
});
test('cover framing fills narrow portrait, short landscape, tablet and desktop without stretching or blank edges',()=>{
  for(const [w,h]of [[320,568],[390,844],[568,280],[844,390],[768,1024],[1440,900],[1920,1080]]){
    const b=W.cover(1024,576,w,h);assert.ok(b.x<=0&&b.y<=0&&b.x+b.w>=w-1e-8&&b.y+b.h>=h-1e-8);assert.ok(Math.abs(b.w/b.h-16/9)<1e-8);
  }
});
function runtime({failNew=false,failOld=false}={}){
  const requests=[];class Image{set src(src){requests.push(src);this.naturalWidth=1024;this.naturalHeight=576;queueMicrotask(()=>((failNew&&src.includes('/worlds/'))||(failOld&&src.includes('/backgrounds/')))?this.onerror():this.onload());}}
  const box={Image,queueMicrotask,module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(root,'world-art.js'),'utf8'),box);return {W:box.module.exports,requests};
}
test('background aliases share one request and the least-recently-used cache retains at most three images',async()=>{
  const {W,requests}=runtime();await Promise.all([W.load('bg-energy-park.png'),W.load('level-05-energy-reactor.png')]);assert.equal(requests.length,1);
  for(const name of W.locations)await W.load(name+'.webp');assert.equal(W.status().entries.length,3);assert.deepEqual(Array.from(W.status().entries,e=>e.key),['pressure','space','core']);
  const before=requests.length;await W.load('space.webp');assert.equal(requests.length,before);await W.load('workshop.webp');assert.equal(W.status().entries.length,3);assert.equal(W.status().entries.at(-1).key,'workshop');
});
test('failed new artwork falls back to the matching original image and dual failure resolves safely',async()=>{
  const a=runtime({failNew:true});assert.equal(await a.W.load('level-12-quantum-core.png'),true);assert.equal(a.requests.length,2);assert.equal(a.requests[1],'./assets/backgrounds/level-12-quantum-core.png');assert.equal(a.W.status().entries[0].fallback,true);
  const b=runtime({failNew:true,failOld:true});assert.equal(await b.W.load('bg-gravity-lab.png'),false);await b.W.load('bg-gravity-lab.png');assert.equal(b.requests.length,2);assert.equal(b.W.status().entries[0].ready,false);
});
test('reduced motion suppresses atmosphere and every loaded background covers the canvas',async()=>{
  const {W}=runtime();await W.load('workshop.webp');let specks=0,draw;
  const gradient={addColorStop(){}},ctx={save(){},restore(){},createLinearGradient(){return gradient;},drawImage(...args){draw=args;},fillRect(){},beginPath(){},arc(){specks++;},fill(){}};
  W.background(ctx,'workshop.webp',390,600,1,true);assert.equal(specks,0);assert.ok(draw[1]<=0&&draw[2]<=0&&draw[1]+draw[3]>=390&&draw[2]+draw[4]>=600);
  W.background(ctx,'workshop.webp',390,600,2,false);assert.equal(specks,7);
});
test('both modes load world art before their runtime and avoid eagerly loading all illustrated backgrounds',()=>{
  for(const [entry,script]of [['index.html','adventure.js'],['original-labs.html','game.js']]){const html=fs.readFileSync(path.join(root,entry),'utf8');assert.ok(html.indexOf('world-art.js')<html.indexOf(`src="./${script}"`));}
  const js=fs.readFileSync(path.join(root,'game.js'),'utf8');assert.ok(js.includes('...(worldArt?[]:ASSETS.backgrounds)'));assert.ok(fs.readFileSync(path.join(root,'adventure.js'),'utf8').includes('if(worldArt)worldArt.load(m.bg)'));
});
