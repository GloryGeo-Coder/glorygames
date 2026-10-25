/* Run from the repository root: node tools/build-physics-characters.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const art=require('./physics-character-art.cjs'),poses=require('./physics-illustrated-poses.cjs');
sharp.concurrency(1);sharp.cache({memory:16,files:0,items:20});
const root=path.resolve(__dirname,'../apps/web/public/games/physics-force-lab'),output=path.join(root,'assets/characters');
const source=path.join(__dirname,'physics-art-source/characters');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
// Crop and pack only: the selected illustrations are never repainted by this builder.
async function cells(file){
  const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true}),result=[],size=info.width*info.height,labels=new Int32Array(size),queue=new Int32Array(size),components=[];
  // Alpha-connected silhouettes may extend over a nominal grid boundary. Extract whole
  // silhouettes, rather than clipping a rotor or including the neighbouring pose's tip.
  let id=0;
  for(let at=0;at<size;at++){
    if(labels[at]||data[at*4+3]<8)continue;
    id++;let head=0,tail=1,x0=info.width,y0=info.height,x1=0,y1=0;queue[0]=at;labels[at]=id;
    while(head<tail){
      const n=queue[head++],x=n%info.width,y=Math.floor(n/info.width);x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        const nx=x+dx,ny=y+dy;if(nx<0||nx>=info.width||ny<0||ny>=info.height)continue;const next=ny*info.width+nx;
        if(!labels[next]&&data[next*4+3]>=8){labels[next]=id;queue[tail++]=next;}
      }
    }
    if(tail>1000)components.push({id,area:tail,x0,y0,x1,y1});
  }
  for(let n=0;n<12;n++){
    const found=components.filter(c=>Math.min(3,Math.floor((c.x0+c.x1)/2/info.width*4))===n%4&&Math.min(2,Math.floor((c.y0+c.y1)/2/info.height*3))===Math.floor(n/4)).sort((a,b)=>b.area-a.area)[0];
    if(!found)throw Error(`Empty source pose ${file}:${n}`);
    const {x0,y0,x1,y1}=found,box={left:x0,top:y0,width:x1-x0+1,height:y1-y0+1},pixels=Buffer.alloc(box.width*box.height*4);
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      const index=y*info.width+x;let own=labels[index]===found.id;
      if(!own&&data[index*4+3]<8)for(let dy=-1;dy<=1&&!own;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&nx<info.width&&ny>=0&&ny<info.height&&labels[ny*info.width+nx]===found.id)own=true;}
      if(own)data.copy(pixels,((y-y0)*box.width+x-x0)*4,index*4,index*4+4);
    }
    result.push({box,buffer:await sharp(pixels,{raw:{width:box.width,height:box.height,channels:4}}).png().toBuffer()});
  }return result;
}
(async()=>{
  fs.mkdirSync(output,{recursive:true});const data={version:2,frameWidth:160,frameHeight:192,columns:8,anchor:[80,164],characters:{},sourceHashes:{art:hash(path.join(__dirname,'physics-character-art.cjs')),builder:hash(__filename),poses:hash(path.join(__dirname,'physics-illustrated-poses.cjs'))}};
  let total=0;const outputs=[];
  for(const [kind,clips]of Object.entries(art.clips)){
    const file=path.join(source,kind+'.webp'),drawn=await cells(file),scale=Math.min(art.bounds[kind][1]/drawn[0].box.height,146/Math.max(...drawn.map(c=>c.box.width)),150/Math.max(...drawn.map(c=>c.box.height)));
    const normalized=[];for(const c of drawn){const w=Math.max(1,Math.round(c.box.width*scale)),h=Math.max(1,Math.round(c.box.height*scale));normalized.push({w,h,buffer:await sharp(c.buffer).resize(w,h).png().toBuffer()});}
    const frames=[],states={};let count=0;
    for(const [clip,[length,fps,loop]]of Object.entries(clips)){
      states[clip]={start:count,length,fps,loop};
      for(let i=0;i<length;i++){
        const p=poses.pose(kind,clip,i,length,loop),c=normalized[p.cell];
        const frame=await sharp({create:{width:160,height:192,channels:4,background:'#0000'}}).composite([{input:c.buffer,left:Math.round(80-c.w/2)+p.dx,top:164-c.h+p.dy}]).png().toBuffer();
        frames.push({input:frame,left:count%8*160,top:Math.floor(count/8)*192});count++;
      }
    }
    const rows=Math.ceil(count/8),atlas=await sharp({create:{width:1280,height:rows*192,channels:4,background:'#0000'}}).composite(frames).png({compressionLevel:9}).toBuffer();
    outputs.push([kind,atlas]);total+=atlas.length;data.characters[kind]={src:'assets/characters/'+kind+'.png',width:1280,height:rows*192,body:art.bounds[kind],clips:states,source:'tools/physics-art-source/characters/'+kind+'.webp',sourceHash:hash(file)};
    console.log(`${kind}: ${count} frames, ${Math.round(atlas.length/1024)} KiB`);
  }
  for(const [kind,buffer]of outputs)fs.writeFileSync(path.join(output,kind+'.png'),buffer);
  fs.writeFileSync(path.join(root,'character-sprite-data.js'),`/* Packed from the illustrated pose sources; see tools/physics-art-source/README.md. */\n(function(r){const d=${JSON.stringify(data)};if(typeof module==='object'&&module.exports)module.exports=d;else r.PhysicsCharacterData=d;})(typeof globalThis!=='undefined'?globalThis:this);\n`);
  const names=['Young physicist','Professor Newtonia','Pip','Glitch robot','Attack drone','Magnet robot','GlitchBot','Patrol drone'],parts=[];
  for(const [i,[kind,c]]of Object.entries(data.characters).entries()){
    const clip=c.clips.run||c.clips.talk||c.clips.scan||c.clips.walk||c.clips.hover||c.clips.idle,n=clip.start+Math.floor(clip.length/3);
    parts.push({input:await sharp(outputs.find(([id])=>id===kind)[1]).extract({left:n%8*160,top:Math.floor(n/8)*192,width:160,height:192}).resize(200,240).png().toBuffer(),left:50+i%4*300,top:110+Math.floor(i/4)*340});
  }
  const labels=names.map((name,i)=>`<text x="${150+i%4*300}" y="${390+Math.floor(i/4)*340}" text-anchor="middle" font-size="20" fill="#e7f7fb">${name}</text>`).join('');
  parts.unshift({input:Buffer.from(`<svg width="1200" height="780" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="780" fill="#102737"/><text x="50" y="52" font-family="sans-serif" font-size="29" font-weight="bold" fill="#80f3da">PHYSICS FORCE LAB · ILLUSTRATED CAST</text><text x="50" y="83" font-family="sans-serif" font-size="17" fill="#b7d5df">Cover-matched artwork · 227 animation frames · Both game modes</text><g font-family="sans-serif">${labels}</g></svg>`),left:0,top:0});
  await sharp({create:{width:1200,height:780,channels:4,background:'#102737'}}).composite(parts).png().toFile(path.resolve(__dirname,'../docs/releases/physics-force-lab-v5.0-cast.png'));
  console.log(`Total: ${Math.round(total/1024)} KiB`);
})().catch(e=>{console.error(e);process.exitCode=1;});
