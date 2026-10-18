const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {root,boot}=require('./helpers/fruit-runtime.cjs'),frames=require('../public/games/fruit-slice/fruit-animation-data.js'),tracks=require('../public/games/fruit-slice/fruit-music.js'),{levels}=require('../public/games/fruit-slice/fruit-levels.js');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

test('original background, thumbnail and six original fruit/bomb PNGs are byte-identical',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'release-v21-baseline.json')));assert.equal(Object.keys(m.unchanged).length,8);for(const [p,sha] of Object.entries(m.unchanged))assert.equal(hash(path.join(root,p)),sha,p);
});

test('three transparent animation atlases match the final prompts, dimensions and hashes',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'assets/animation/art-manifest.json')));assert.equal(m.assets.length,3);const {rgba}=require('./helpers/kasi-png.cjs');for(const a of m.assets){const p=path.join(root,a.file),im=rgba(p);assert.equal(hash(p),a.sha256);assert.equal(im.w,a.width);assert.equal(im.h,a.height);assert.equal(a.mode,'built-in');assert.ok(a.prompt.length>100);let clear=0;for(let i=3;i<im.out.length;i+=4)if(im.out[i]<10)clear++;assert.ok(clear/im.w/im.h>.4);}
});

test('24 distinct real animation poses and ten separate cut halves stay inside their alpha-derived bounds',()=>{
 const {rgba}=require('./helpers/kasi-png.cjs'),cache=new Map();let whole=0,halves=0;for(const a of Object.values(frames)){for(const [url,boxes,cut] of [[a.url,a.frames,false],...(a.cuts?[[a.cuts.url,a.cuts.frames,true]]:[])]){if(!cache.has(url))cache.set(url,rgba(path.join(root,url)));const im=cache.get(url),hashes=new Set();for(const [x,y,w,h] of boxes){assert.ok(x>=0&&y>=0&&x+w<=im.w&&y+h<=im.h);const rows=[];for(let yy=y;yy<y+h;yy++)rows.push(im.out.subarray((yy*im.w+x)*4,(yy*im.w+x+w)*4));hashes.add(crypto.createHash('sha256').update(Buffer.concat(rows)).digest('hex'));if(cut)halves++;else whole++;}assert.equal(hashes.size,boxes.length);}}assert.equal(whole,24);assert.equal(halves,10);
});

test('sprite decoding is sequential, caches are bounded and full atlas images are released',async()=>{
 const r=await boot();assert.equal(r.requests.length,4);assert.equal(r.released.length,3);assert.equal(Object.keys(r.renderer.frames).length,6);assert.equal(Object.keys(r.renderer.cuts).length,5);assert.ok(r.canvases.every(c=>c.width<=192&&c.height<=192));assert.ok(r.canvases.reduce((n,c)=>n+c.width*c.height*4,0)<5e6);
});

test('25 distinct full-length original songs match the catalogue, stage names and manifest',()=>{
 const m=JSON.parse(fs.readFileSync(path.join(root,'assets/music/manifest.json')));assert.equal(tracks.length,25);assert.equal(m.tracks.length,25);assert.equal(new Set(tracks.map(t=>t.url)).size,25);const hashes=new Set();for(let i=0;i<25;i++){const t=tracks[i],a=m.tracks[i],p=path.join(root,t.url),b=fs.readFileSync(p);assert.equal(t.id,i+1);assert.equal(t.title,levels[i].title);assert.equal(hash(p),a.sha256);assert.equal(b.length,a.bytes);assert.equal(b.subarray(0,3).toString(),'ID3');assert.ok(t.duration>=59&&t.duration<=73);assert.ok(b.length<1.1e6);hashes.add(a.sha256);}assert.equal(hashes.size,25);assert.match(m.provenance,/no third-party/);assert.equal(m.channels,2);
});

test('campaign has 25 progressive trials, varied targets, five chapters and fair initial bomb-free teaching',()=>{
 assert.equal(levels.length,25);assert.equal(new Set(levels.map(l=>l.title)).size,25);assert.equal(new Set(levels.map(l=>l.chapter)).size,5);assert.equal(new Set(levels.map(l=>l.kind)).size,5);assert.equal(levels[0].bombChance,0);assert.equal(levels[1].bombChance,0);assert.ok(levels[24].cutTarget>levels[0].cutTarget*2);assert.ok(levels[24].scoreTarget>levels[0].scoreTarget*3);assert.equal(levels[24].lives,3);
});

test('HTML asset references, IDs, zoom, labelled volume sliders and fullscreen start hook are retained',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);for(const m of html.matchAll(/(?:src|href)="(\.\/[^"?]+)(?:\?[^"]*)?"/g))assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);assert.doesNotMatch(html,/user-scalable=no|maximum-scale/);for(const id of ['btnStart','btnPause','btnRestart','btnMute','btnSubmit','btnLaunch','btnChat','btnLevels'])assert.ok(ids.includes(id));for(const id of ['musicVolume','effectsVolume'])assert.match(html,new RegExp('label for="'+id+'"'));const json=JSON.parse(fs.readFileSync(path.join(root,'game.json')));assert.equal(json.features.levels,25);assert.equal(json.features.musicTracks,25);assert.equal(json.orientation,'any');
});
