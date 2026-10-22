/* Packs generated RGBA cells; preserves original artwork and existing assets. */
const sharp=require('sharp'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const output=path.resolve(__dirname,'../public/games/recycle-rush/assets/arcade');
const sources=[['bosses-a',process.argv[2],4,4],['bosses-b',process.argv[3],4,4],['icons',process.argv[4],4,2]];
const sha=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
(async()=>{
 if(sources.some(row=>!row[1]))throw Error('Usage: node recycle-arcade-pack.cjs bosses-a.png bosses-b.png icons.png');
 fs.mkdirSync(output,{recursive:true});const manifest={version:1,generator:'built-in image_gen',promptRecord:'docs/art/recycle-rush-v3.5-prompts.md',packing:'Equal-cell extraction; alpha bounds above 32; constant scale per character row and shared 244px ground baseline; icons fit 112px within 128px cells. No art is redrawn.',sources:{},assets:{}};
 const write=(name,buffer,meta)=>{fs.writeFileSync(path.join(output,name),buffer);manifest.assets[name]={...meta,bytes:buffer.length,sha256:sha(buffer)};};
 for(const[name,file,cols,rows]of sources){
  const data=fs.readFileSync(file),meta=await sharp(data).metadata(),cells=[];manifest.sources[name]={sha256:sha(data),columns:cols,rows};
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const left=Math.round(col*meta.width/cols),top=Math.round(row*meta.height/rows),width=Math.round((col+1)*meta.width/cols)-left,height=Math.round((row+1)*meta.height/rows)-top;
   const frame=await sharp(data).extract({left,top,width,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});let x0=width,y0=height,x1=-1,y1=-1;
   for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(frame.data[(y*width+x)*4+3]>32){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
   if(x1<x0||y1<y0)throw Error('Empty cell '+name+' '+row+','+col);cells.push({...frame,box:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1},row,col});
  }
  const layers=[];
  for(const cell of cells){
   const size=name==='icons'?128:256,group=cells.filter(frame=>frame.row===cell.row),scale=name==='icons'?Math.min(112/cell.box.width,112/cell.box.height):Math.min(232/Math.max(...group.map(frame=>frame.box.width)),232/Math.max(...group.map(frame=>frame.box.height)));
   const width=Math.max(1,Math.round(cell.box.width*scale)),height=Math.max(1,Math.round(cell.box.height*scale)),cropped=await sharp(cell.data,{raw:cell.info}).extract(cell.box).resize(width,height).png().toBuffer();
   const frame=await sharp({create:{width:size,height:size,channels:4,background:'#00000000'}}).composite([{input:cropped,left:Math.round((size-width)/2),top:name==='icons'?Math.round((size-height)/2):244-height}]).webp({quality:84,alphaQuality:100}).toBuffer();
   if(name==='icons'){const ids=['magnet','slow','shield','double','life','star','combo','medal'];write(ids[cell.row*4+cell.col]+'.webp',frame,{width:size,height:size});}
   else layers.push({input:frame,left:cell.col*256,top:cell.row*256});
  }
  if(name!=='icons'){const buffer=await sharp({create:{width:1024,height:1024,channels:4,background:'#00000000'}}).composite(layers).webp({quality:84,alphaQuality:100}).toBuffer();write(name+'.webp',buffer,{width:1024,height:1024,columns:4,rows:4,cellSize:256,frames:16});}
 }
 fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({files:Object.keys(manifest.assets).length,bytes:Object.values(manifest.assets).reduce((sum,entry)=>sum+entry.bytes,0)}));
})().catch(error=>{console.error(error);process.exitCode=1;});
