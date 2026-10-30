const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {root,boot}=require('./helpers/jungle-runtime.cjs');
const {levels,build}=require('../public/games/lost-jungle-3d-temple-of-the-sun/jungle-campaign.js');
const data=require('../public/games/lost-jungle-3d-temple-of-the-sun/jungle-animation-data.js');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

test('25 long routes are deterministic, with increasing encounter density and a guardian on every route',()=>{
 assert.equal(levels.length,25);let count=0;
 for(const l of levels){const a=build(l),b=build(l);assert.deepEqual(a,b);assert.ok(l.length>=9600);assert.ok(a.enemies.length>=count-1);count=a.enemies.length;assert.ok(a.items.filter(i=>i.type==='relic').length>=l.relicTarget);assert.equal(a.items.filter(i=>i.type==='key').length,l.keyTarget);}
 assert.ok(build(levels[24]).enemies.length>build(levels[0]).enemies.length*3);assert.equal(levels.filter(l=>l.boss).length,25);assert.deepEqual(levels.filter(l=>l.originalBoss).map(l=>l.id),[5,8,10,15,20,25]);assert.equal(new Set(levels.map(l=>l.bossTitle)).size,22);assert.equal(new Set(levels.map(l=>l.chapter)).size,5);assert.equal(new Set(levels.map(l=>l.story)).size,25);assert.equal(new Set(levels.map(l=>l.bg)).size,25);
});

test('all recovery points, required items and patrol bounds have safe stable footing',()=>{
 for(const l of levels){const w=build(l),floors=w.platforms.filter(p=>p.type==='ground');
  for(const c of w.checkpoints){assert.ok(floors.some(p=>c.x>=p.x&&c.x+54<=p.x+p.w&&c.y+86===p.y));assert.ok(!w.hazards.some(h=>h.type==='spikes'&&c.x<h.x+h.w&&c.x+54>h.x));}
  for(const i of w.items.filter(i=>['key','relic','plate'].includes(i.type)))assert.ok(floors.some(p=>i.x>=p.x&&i.x+i.w<=p.x+p.w&&i.y+i.h<=p.y+(i.type==='plate'?3:0)&&p.y-i.y<100));
  for(const e of w.enemies){assert.ok(e.x>=e.minX&&e.x<=e.maxX);assert.ok(floors.some(p=>e.minX>=p.x&&e.maxX+e.w<=p.x+p.w));}
 }
});

test('original backgrounds, textures, sprites, items and effects remain byte-identical',()=>{
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'release-v24-baseline.json')));assert.equal(Object.keys(baseline.unchanged).length,53);
 for(const [file,sha] of Object.entries(baseline.unchanged))assert.equal(hash(path.join(root,file)),sha,file);
 for(let i=0;i<10;i++)assert.ok(levels[i].length>baseline.previous_lengths[i]*1.5);
});

test('all new artwork matches its creation manifest, image dimensions and distinct background pixel data',()=>{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/art-manifest.json')));assert.equal(manifest.assets.length,21);const scenes=new Set();
 for(const a of manifest.assets){const p=path.join(root,a.file),bytes=fs.readFileSync(p);assert.equal(hash(p),a.sha256);assert.equal(bytes.length,a.bytes);assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(bytes.readUInt32BE(16),a.width);assert.equal(bytes.readUInt32BE(20),a.height);assert.equal(a.mode,'built-in');assert.ok(a.prompt.length>100);
  if(a.id.startsWith('bg')){assert.ok(a.width/a.height>1.7&&a.width/a.height<1.9);const parts=[];for(let i=8;i<bytes.length;){const n=bytes.readUInt32BE(i),type=bytes.toString('ascii',i+4,i+8);if(type==='IDAT')parts.push(bytes.subarray(i+8,i+8+n));i+=n+12;}scenes.add(crypto.createHash('sha256').update(Buffer.concat(parts)).digest('hex'));}
 }assert.equal(scenes.size,15);assert.ok(manifest.assets.some(a=>a.file==='thumb.png'));
});

test('all 60 animation poses contain distinct real pixels with transparent atlas gutters',()=>{
 const {rgba}=require('./helpers/kasi-png.cjs'),cache=new Map();let frames=0;assert.equal(Object.keys(data.atlases).length,13);
 for(const a of Object.values(data.atlases)){if(!cache.has(a.url))cache.set(a.url,rgba(path.join(root,a.url)));const im=cache.get(a.url),hashes=new Set();
  for(const f of a.frames){const [x,y,w,h]=f.crop;assert.ok(x>=0&&y>=0&&x+w<=a.width&&y+h<=a.height);const rows=[];for(let yy=y;yy<y+h;yy++)rows.push(im.out.subarray((yy*im.w+x)*4,(yy*im.w+x+w)*4));hashes.add(crypto.createHash('sha256').update(Buffer.concat(rows)).digest('hex'));frames++;}
  assert.equal(hashes.size,a.frames.length);for(const clip of Object.values(a.clips))assert.ok(clip.start>=0&&clip.start+clip.count<=a.frames.length);
 }assert.equal(frames,60);for(const im of cache.values()){let clear=0;for(let i=3;i<im.out.length;i+=4)if(im.out[i]<10)clear++;assert.ok(clear>im.w*im.h*.55);}
});

test('startup requests one background, releases old scenery and caches props at bounded resolutions',async()=>{
 const r=await boot();assert.equal(r.requests.filter(p=>p.includes('/backgrounds/')).length,1);assert.ok(r.requests.length<30);
 let pixels=r.canvases.reduce((n,c)=>n+c.width*c.height,0);assert.ok(pixels*4<24*1024*1024,pixels*4);
 r.state.unlockedLevel=25;r.state.levelIndex=24;r.buildLevel();await r.ready();assert.equal(Object.keys(r.assetImages).filter(p=>p.includes('/backgrounds/')).length,1);assert.ok(r.assetImages[levels[24].bg]);assert.ok(!r.assetImages[levels[0].bg]);
});

test('HTML assets, IDs, mobile controls, story and zoom access are valid',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const m of html.matchAll(/(?:src|href)="(\.\/[^"?]+)(?:\?[^"]*)?"/g))assert.ok(fs.existsSync(path.join(root,m[1])));
 assert.doesNotMatch(html,/maximum-scale|user-scalable=no|10 Levels|3D/);for(const id of ['shootBtn','jumpBtn','dashBtn','leftBtn','rightBtn','pauseOverlay','resumeBtn'])assert.ok(ids.includes(id));assert.match(html,/25 Story Levels/);assert.ok(html.indexOf('jungle-animation.js')<html.indexOf('src=".\/game.js'));
 const json=JSON.parse(fs.readFileSync(path.join(root,'game.json')));assert.equal(json.slug,'lost-jungle-3d-temple-of-the-sun');assert.equal(json.features.levels,25);assert.equal(json.orientation,'any');
});
