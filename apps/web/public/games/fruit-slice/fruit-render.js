/* Bounded sprite caches; original art stays available as a loading fallback. */
(function(root){
 'use strict';
 function create(env=root){
  const frames={},cuts={};let background=null;
  const anchors={apple:[.5,.61],orange:[.5,.58],watermelon:[.5,.53],kiwi:[.5,.5],pineapple:[.5,.66],bomb:[.45,.65]};
  function loadImage(src){return new Promise(resolve=>{const im=new env.Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src;});}
  function crop(im,box){const [x,y,w,h]=box,c=env.document.createElement('canvas'),ratio=Math.min(1,192/Math.max(w,h));c.width=Math.max(1,Math.round(w*ratio));c.height=Math.max(1,Math.round(h*ratio));c.getContext('2d').drawImage(im,x,y,w,h,0,0,c.width,c.height);return c;}
  async function load(){
   const data=env.FruitFrames,urls=[...new Set(Object.values(data).flatMap(a=>[a.url,...(a.cuts?[a.cuts.url]:[])]))];
   // Decode one atlas at a time, retain only small cropped frames, then release it.
   for(const url of urls){const im=await loadImage(url);if(!im)continue;
    for(const [key,a] of Object.entries(data)){if(a.url===url)frames[key]=a.frames.map(box=>crop(im,box));if(a.cuts?.url===url)cuts[key]=a.cuts.frames.map(box=>crop(im,box));}im.src='';
   }
   for(const key of Object.keys(data))if(!frames[key]){const im=await loadImage('./assets/fruits/'+key+'.png');if(im){frames[key]=[crop(im,[0,0,im.width,im.height])];im.src='';}}
   background=await loadImage('./assets/backgrounds/dojo-sunset.png');
  }
  function sprite(ctx,key,x,y,r,rot=0,age=0,side=null,alpha=1,reduced=false){
   const list=side===null?frames[key]:cuts[key],im=list?.[side===null?(reduced?0:Math.floor(age*8)%list.length):side<0?0:1];
   ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha=alpha;
   if(im){const h=r*(side!==null?2.1:key==='pineapple'?2.75:key==='bomb'?2.7:2.3),w=h*im.width/im.height,anchor=side===null?anchors[key]:[.5,.5];ctx.drawImage(im,-w*anchor[0],-h*anchor[1],w,h);}
   else{ctx.fillStyle={apple:'#f85c66',orange:'#ffa83f',watermelon:'#64b976',kiwi:'#abc968',pineapple:'#facc54',bomb:'#272b34'}[key]||'#fff';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();if(side!==null){ctx.fillStyle='#ffe0a0';ctx.beginPath();ctx.ellipse(0,0,r*.65,r*.85,0,0,Math.PI*2);ctx.fill();}if(key==='bomb'){ctx.strokeStyle='#ffba49';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r*.25,-r*1.35);ctx.stroke();}}
   ctx.restore();
  }
  function draw(ctx,s,v){
   const {W,H,scale}=v,reduced=env.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
   ctx.fillStyle='#24150d';ctx.fillRect(0,0,W,H);
   if(background){const k=Math.max(W/background.width,H/background.height),bw=background.width*k,bh=background.height*k;ctx.drawImage(background,(W-bw)/2,(H-bh)/2,bw,bh);}else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#a44b35');g.addColorStop(1,'#301b14');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
   ctx.fillStyle='#1b0d081a';ctx.fillRect(0,0,W,H);
   if(!reduced)for(let i=0;i<12;i++){const x=(i*.137%1)*W+Math.sin(s.visualTime*.3+i)*7,y=((i*.193%1)*H+s.visualTime*(4+i%3))%H;ctx.fillStyle=i%2?'#ffd27d35':'#ffe9c82b';ctx.beginPath();ctx.arc(x,y,2+i%2,0,Math.PI*2);ctx.fill();}
   for(const f of s.splashes){const t=f.age/f.life;ctx.save();ctx.globalAlpha=(1-t)*.6;ctx.fillStyle=f.color;ctx.beginPath();for(let i=0;i<7;i++){const a=i/7*Math.PI*2,rr=f.r*(.7+t)*(.75+(i%3)*.12);ctx.moveTo(f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr);ctx.arc(f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr,rr*.35,0,Math.PI*2);}ctx.fill();ctx.restore();}
   for(const h of s.halves)sprite(ctx,h.key,h.x,h.y,h.r,h.rot,h.age,h.side,Math.max(0,1-h.age/h.life),reduced);
   for(const o of s.objects){if(o.sliced)continue;
    if(o.golden){ctx.strokeStyle='#ffe399';ctx.lineWidth=3/scale;ctx.beginPath();ctx.arc(o.x,o.y,o.r*1.13,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffe9ac';ctx.font=`900 ${18/scale}px system-ui`;ctx.textAlign='center';ctx.fillText('★',o.x,o.y-o.r*1.3);}
    sprite(ctx,o.key,o.x,o.y,o.r,o.rot,o.age+o.phase,null,1,reduced);
    if(o.kind==='bomb'){ctx.strokeStyle='#ff8b6d';ctx.lineWidth=2/scale;ctx.setLineDash([5/scale,5/scale]);ctx.beginPath();ctx.arc(o.x,o.y,o.r*1.14,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fff4db';ctx.font=`900 ${15/scale}px system-ui`;ctx.textAlign='center';ctx.fillText('!',o.x,o.y+6/scale);}
   }
   for(const p of s.particles){ctx.globalAlpha=Math.max(0,1-p.age/p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
   for(const blade of s.blades.values()){const points=blade.trail;if(points.length<2)continue;ctx.save();ctx.lineCap='round';for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],alpha=i/points.length;ctx.strokeStyle=`rgba(255,245,216,${alpha*.75})`;ctx.lineWidth=(2+alpha*6)/scale;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.strokeStyle=`rgba(255,154,80,${alpha*.7})`;ctx.lineWidth=(1+alpha*2)/scale;ctx.stroke();}ctx.restore();}
   for(const f of s.floaters){ctx.save();ctx.globalAlpha=Math.max(0,1-f.age/f.life);ctx.font=`900 ${f.size/scale}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=4/scale;ctx.strokeStyle='#2a170c99';ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);ctx.restore();}
   if(s.frenzyTimer>0){ctx.strokeStyle='#ffcf6d';ctx.lineWidth=4/scale;ctx.strokeRect(2/scale,2/scale,W-4/scale,H-4/scale);}
   if(s.phase==='countdown'){ctx.save();ctx.fillStyle='#fff1cb';ctx.textAlign='center';ctx.font=`950 ${62/scale}px system-ui`;ctx.shadowColor='#291309';ctx.shadowBlur=15;ctx.fillText(Math.ceil(s.countdown/.8),W/2,H*.46);ctx.restore();}
  }
  return {load,draw,sprite,get frames(){return frames;},get cuts(){return cuts;}};
 }
 const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else root.FruitRender=api;
})(typeof window!=='undefined'?window:globalThis);
