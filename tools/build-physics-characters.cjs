/* Run from the repository root: node tools/build-physics-characters.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp'),art=require('./physics-character-art.cjs');
sharp.concurrency(1);sharp.cache({memory:16,files:0,items:20});
const root=path.resolve(__dirname,'../apps/web/public/games/physics-force-lab'),output=path.join(root,'assets/characters');
(async()=>{
  fs.mkdirSync(output,{recursive:true});const data={version:1,frameWidth:160,frameHeight:192,columns:8,anchor:[80,164],characters:{},sourceHashes:{art:crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,'physics-character-art.cjs'))).digest('hex'),builder:crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex')}};let total=0;const outputs=[];
  for(const [kind,clips]of Object.entries(art.clips)){
    const frames=[],states={};let count=0;
    for(const [clip,[length,fps,loop]]of Object.entries(clips)){states[clip]={start:count,length,fps,loop};for(let i=0;i<length;i++)frames.push({svg:art.frame(kind,clip,loop?i/length:i/Math.max(1,length-1)),index:count++});}
    const buffers=[];for(const f of frames)buffers.push({input:await sharp(Buffer.from(f.svg)).png().toBuffer(),left:f.index%8*160,top:Math.floor(f.index/8)*192});
    const rows=Math.ceil(count/8),file=path.join(output,kind+'.png');const atlas=await sharp({create:{width:1280,height:rows*192,channels:4,background:'#0000'}}).composite(buffers).png({compressionLevel:9}).toBuffer();outputs.push([file,atlas]);
    const bytes=atlas.length;total+=bytes;data.characters[kind]={src:'assets/characters/'+kind+'.png',width:1280,height:rows*192,body:art.bounds[kind],clips:states};console.log(`${kind}: ${count} frames, ${Math.round(bytes/1024)} KiB`);
  }
  for(const [file,buffer]of outputs){fs.writeFileSync(file+'.tmp',buffer);fs.renameSync(file+'.tmp',file);}
  fs.writeFileSync(path.join(root,'character-sprite-data.js'),`/* Generated from tools/physics-character-art.cjs; original artwork. */\n(function(r){const d=${JSON.stringify(data)};if(typeof module==='object'&&module.exports)module.exports=d;else r.PhysicsCharacterData=d;})(typeof globalThis!=='undefined'?globalThis:this);\n`);
  const names=['Young physicist','Professor Newtonia','Pip','Glitch robot','Attack drone','Magnet robot','GlitchBot','Patrol drone'],parts=[];
  for(const [i,[kind,c]]of Object.entries(data.characters).entries()){
    const clip=c.clips.run||c.clips.talk||c.clips.scan||c.clips.walk||c.clips.hover||c.clips.idle,n=clip.start+Math.floor(clip.length/3),input=outputs.find(([file])=>file===path.join(output,kind+'.png'))[1];
    parts.push({input:await sharp(input).extract({left:n%8*160,top:Math.floor(n/8)*192,width:160,height:192}).resize(200,240).png().toBuffer(),left:50+i%4*300,top:110+Math.floor(i/4)*340});
  }
  const labels=names.map((name,i)=>`<text x="${150+i%4*300}" y="${390+Math.floor(i/4)*340}" text-anchor="middle" font-size="20" fill="#e7f7fb">${name}</text>`).join('');
  parts.unshift({input:Buffer.from(`<svg width="1200" height="780" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="780" fill="#102737"/><text x="50" y="52" font-family="sans-serif" font-size="29" font-weight="bold" fill="#80f3da">PHYSICS FORCE LAB · THE NEW CAST</text><text x="50" y="83" font-family="sans-serif" font-size="17" fill="#b7d5df">Eight original characters · 227 animation frames · Both game modes</text><g font-family="sans-serif">${labels}</g></svg>`),left:0,top:0});
  await sharp({create:{width:1200,height:780,channels:4,background:'#102737'}}).composite(parts).png().toFile(path.resolve(__dirname,'../docs/releases/physics-force-lab-v4.6-cast.png'));
  console.log(`Total: ${Math.round(total/1024)} KiB`);
})().catch(e=>{console.error(e);process.exitCode=1;});
