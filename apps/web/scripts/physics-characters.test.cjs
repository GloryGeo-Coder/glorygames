const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.join(__dirname,'../public/games/physics-force-lab'),data=require(path.join(root,'character-sprite-data')),S=require(path.join(root,'character-sprites')),png=require('./helpers/kasi-png.cjs');
const decoded=new Map();
function atlas(id){if(!decoded.has(id))decoded.set(id,png.rgba(path.join(root,data.characters[id].src)));return decoded.get(id);}
function tile(image,index){const x=index%data.columns*data.frameWidth,y=Math.floor(index/data.columns)*data.frameHeight,out=Buffer.alloc(data.frameWidth*data.frameHeight*4);for(let row=0;row<data.frameHeight;row++)image.out.copy(out,row*data.frameWidth*4,((y+row)*image.w+x)*4,((y+row)*image.w+x+data.frameWidth)*4);return out;}
test('eight newly drawn atlases contain 227 frames across forty valid animation clips',()=>{
  assert.deepEqual(Object.keys(data.characters),['player','professor','helper','glitch','drone','magnetBot','boss','maintenance']);let frames=0,clips=0,bytes=0,decodedBytes=0;
  for(const [id,c]of Object.entries(data.characters)){
    const a=atlas(id);assert.equal(a.w,c.width);assert.equal(a.h,c.height);bytes+=fs.statSync(path.join(root,c.src)).size;decodedBytes+=a.w*a.h*4;
    for(const clip of Object.values(c.clips)){assert.ok(clip.fps>0&&clip.length>=3);assert.ok(clip.start+clip.length<=a.w/data.frameWidth*a.h/data.frameHeight);frames+=clip.length;clips++;}
    assert.ok(c.body[0]>0&&c.body[1]>0);
    assert.equal(c.sourceHash,crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../../..',c.source))).digest('hex'),'Repack after editing a source pose sheet');
  }
  assert.equal(frames,227);assert.equal(clips,40);assert.ok(bytes<4*1024*1024,`download budget: ${bytes}`);assert.ok(decodedBytes<32*1024*1024,`decoded budget: ${decodedBytes}`);
  for(const [key,file]of [['art','physics-character-art.cjs'],['builder','build-physics-characters.cjs'],['poses','physics-illustrated-poses.cjs']])assert.equal(data.sourceHashes[key],crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../../../tools',file))).digest('hex'),'Rebuild the atlases after changing their source');
});
test('every used frame is transparent, contains artwork and has clear padded edges without atlas bleed',()=>{
  for(const [id,c]of Object.entries(data.characters))for(const clip of Object.values(c.clips))for(let f=0;f<clip.length;f++){
    const pixels=tile(atlas(id),clip.start+f);let visible=0,clear=0;
    for(let y=0;y<data.frameHeight;y++)for(let x=0;x<data.frameWidth;x++){const alpha=pixels[(y*data.frameWidth+x)*4+3];if(alpha>10)visible++;if(alpha===0)clear++;if(x===0||y===0||x===data.frameWidth-1||y===data.frameHeight-1)assert.equal(alpha,0,`${id}:${clip.start+f} edge clipped`);}
    assert.ok(visible>500&&clear>pixels.length/16,`${id}:${clip.start+f} empty or opaque`);
  }
});
test('each animation contains genuinely different pose pixels and every character has a distinct design',()=>{
  const designs=new Set();for(const [id,c]of Object.entries(data.characters)){const a=atlas(id);designs.add(crypto.createHash('sha256').update(tile(a,0)).digest('hex'));
    for(const [name,clip]of Object.entries(c.clips)){const hashes=new Set();for(let i=0;i<clip.length;i++)hashes.add(crypto.createHash('sha256').update(tile(a,clip.start+i)).digest('hex'));assert.ok(hashes.size>=2,`${id}:${name} is static`);}
  }assert.equal(designs.size,8);
});
test('frame selection loops idle clips, holds one-shot endings and keeps reduced motion stable',()=>{
  for(const [id,c]of Object.entries(data.characters))for(const [name,clip]of Object.entries(c.clips)){
    const first=S.frame(id,name,0),end=S.frame(id,name,clip.length/clip.fps+1e-7);
    assert.equal(first.index,clip.start);assert.equal(end.index,clip.loop?clip.start:clip.start+clip.length-1);
    assert.deepEqual(S.frame(id,name,0,true),S.frame(id,name,4,true));
    for(const t of [-9,NaN,Infinity,1e8]){const f=S.frame(id,name,t);assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=c.width&&f.y+f.height<=c.height);}
  }
  assert.equal(S.frame('unknown','idle'),null);
});
test('animation clocks reset on state changes and freeze when no elapsed time is supplied',()=>{
  const a=new S.Animator('player');a.step(.09);assert.ok(a.time>0);a.set('run');assert.equal(a.time,0);a.step(.05);a.set('run');assert.equal(a.time,.05);a.set('cast',true);for(let i=0;i<8;i++)a.step(.1);assert.equal(a.finished,true);const before=a.time;a.step(0);assert.equal(a.time,before);a.set('run');assert.equal(a.finished,false);
});
function runtime(fail){let requests=[];class Image{set src(src){requests.push(src);const c=Object.values(data.characters).find(c=>'./'+c.src===src);this.naturalWidth=c.width;this.naturalHeight=c.height;queueMicrotask(()=>src.includes(fail||'__none__')?this.onerror():this.onload());}}
  const box={Image,queueMicrotask,module:{exports:{}},require:()=>data};vm.runInNewContext(fs.readFileSync(path.join(root,'character-sprites.js'),'utf8'),box);return {api:box.module.exports,requests};}
test('mode-specific loading is cached, validates image dimensions and draw failures leave the canvas untouched',async()=>{
  const {api,requests}=runtime();await Promise.all([api.load(['player','helper']),api.load(['player','professor','maintenance'])]);assert.equal(requests.length,4);assert.equal(api.status().ready.length,4);
  const calls=[],scales=[],ctx={globalAlpha:1,save(){calls.push('save');},translate(){},scale(...args){scales.push(args);},drawImage(...args){calls.push(args);},restore(){}};
  assert.equal(api.draw(ctx,'boss',{x:0,y:0,w:170,h:170}),false);assert.equal(calls.length,0);assert.equal(api.draw(ctx,'player',{x:20,y:40,w:58,h:92,state:'run',time:.2,facing:-1}),true);assert.equal(calls.length,2);assert.ok(scales[0][0]<0&&scales[0][1]>0);assert.deepEqual(calls[1].slice(-4),[-data.anchor[0],-data.anchor[1],data.frameWidth,data.frameHeight]);
  const denied=runtime('player.png');assert.equal(await denied.api.load(['player']),false);assert.equal(denied.api.draw(ctx,'player',{x:0,y:0,w:58,h:92}),false);assert.equal(denied.api.status().failed[0],'player');
});
test('both entries load the same cast before their runtime and existing campaigns retain their counts',()=>{
  for(const [file,runtime]of [['index.html','adventure.js'],['original-labs.html','game.js']]){const html=fs.readFileSync(path.join(root,file),'utf8');assert.ok(html.indexOf('character-sprite-data.js')<html.indexOf('character-sprites.js'));assert.ok(html.indexOf('character-sprites.js')<html.indexOf(`src="./${runtime}"`));}
  assert.equal(require(path.join(root,'adventure-data')).missions.length,30);
});
