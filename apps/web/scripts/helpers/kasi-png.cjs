const fs=require('node:fs'),zlib=require('node:zlib'),assert=require('node:assert/strict');
// Decode these RGBA8 PNGs with built-in Node APIs so CI verifies real transparency and pose pixels.
function rgba(file){
 const png=fs.readFileSync(file),w=png.readUInt32BE(16),h=png.readUInt32BE(20),chunks=[];
 assert.equal(png[24],8);assert.equal(png[25],6);
 for(let p=8;p<png.length;){const n=png.readUInt32BE(p),type=png.toString('ascii',p+4,p+8);if(type==='IDAT')chunks.push(png.subarray(p+8,p+8+n));p+=12+n;}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),out=Buffer.alloc(w*h*4),stride=w*4;
 let p=0;
 for(let y=0;y<h;y++) {const filter=raw[p++];assert.ok(filter<=4);for(let x=0;x<stride;x++) {
  const i=y*stride+x,l=x>=4?out[i-4]:0,u=y?out[i-stride]:0,ul=y&&x>=4?out[i-stride-4]:0;
  let predict=0;
  if(filter===1)predict=l;else if(filter===2)predict=u;else if(filter===3)predict=Math.floor((l+u)/2);
  else if(filter===4){const v=l+u-ul,dl=Math.abs(v-l),du=Math.abs(v-u),dul=Math.abs(v-ul);predict=dl<=du&&dl<=dul?l:du<=dul?u:ul;}
  out[i]=(raw[p++]+predict)&255;
 }}
 return {w,h,out};
}


module.exports={rgba};
