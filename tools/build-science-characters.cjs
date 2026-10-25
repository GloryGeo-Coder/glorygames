'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
sharp.concurrency(1);sharp.cache({memory:16,files:0,items:10});
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
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
 const root=path.resolve(__dirname,'../apps/web/public/games/science-lab-dash'),dir=path.join(__dirname,'science-character-source');
 const sources=['hero.webp','support.webp'],all=[];for(const file of sources)all.push(...await cells(path.join(dir,file)));
 const bounds={hero:[80,140],mentor:[80,140],helper:[115,90],patrol:[130,95]},groups=[['hero',0,12],['mentor',12,4],['helper',16,4],['patrol',20,4]],parts=[],data={version:1,src:'assets/chemistry/characters.png',frameWidth:160,frameHeight:192,columns:4,width:640,height:1152,anchor:[80,166],bounds,sourceHashes:{builder:hash(__filename),hero:hash(path.join(dir,sources[0])),support:hash(path.join(dir,sources[1]))}};
 for(const [kind,start,count]of groups){
  const group=all.slice(start,start+count),scale=Math.min(bounds[kind][1]/group[0].box.height,144/Math.max(...group.map(c=>c.box.width)),150/Math.max(...group.map(c=>c.box.height)));
  for(let i=0;i<count;i++){const c=group[i],w=Math.round(c.box.width*scale),h=Math.round(c.box.height*scale),n=start+i,buf=await sharp(c.buffer).resize(w,h).png().toBuffer();parts.push({input:buf,left:n%4*160+Math.round(80-w/2),top:Math.floor(n/4)*192+166-h});}
 }
 await sharp({create:{width:640,height:1152,channels:4,background:'#0000'}}).composite(parts).png({compressionLevel:9}).toFile(path.join(root,data.src));
 fs.writeFileSync(path.join(root,'chemistry-art-data.js'),"(function(r){const d="+JSON.stringify(data)+";if(typeof module==='object'&&module.exports)module.exports=d;else r.ScienceChemistryArtData=d;})(typeof globalThis!=='undefined'?globalThis:this);\n");
 console.log('Packed 24 drawn poses; '+fs.statSync(path.join(root,data.src)).size+' bytes.');
})().catch(e=>{console.error(e);process.exitCode=1;});
