/* Animated transparent sheets and stationary cover scenes; no full-campaign image preload. */
(function(root){
 'use strict';
 const files={player:'defender-run-sheet.png',rogue:'rogue-walk-sheet.png',drone:'drone-flight-sheet.png',boss:'omega-core-sheet.png'};
 function frame(time,moving=true,reduced=false){return reduced?0:moving?Math.floor(time*12)%8:Math.floor(time*1.5)%2;}
 function cover(iw,ih,w,h,cropTop=0){const sy=ih*cropTop,sh=ih-sy,r=Math.max(w/iw,h/sh);return {sx:0,sy,sw:iw,sh,x:(w-iw*r)/2,y:(h-sh*r)/2,w:iw*r,h:sh*r};}
 function create(ctx,engine,{ImageClass=root.Image,reducedMotion=false}={}){
  const sheets={},backgrounds=new Map();let selected='';
  function picture(src,done){if(!ImageClass)return null;const image=new ImageClass();image.onload=()=>done(image.naturalWidth>0?image:null);image.onerror=()=>done(null);image.src=src;return image;}
  for(const[k,file]of Object.entries(files))picture('./assets/sprites/animated/'+file,image=>sheets[k]=image);
  function select(level){selected=level.background;if(backgrounds.has(selected))return;const key=selected,entry={image:null};backgrounds.set(key,entry);picture(key,image=>{if(backgrounds.get(key)===entry)entry.image=image;});while(backgrounds.size>2)backgrounds.delete(backgrounds.keys().next().value);}
  const round=(x,y,w,h,r)=>{ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);};
  function sprite(name,o,t,flip=false,moving=true){const image=sheets[name];if(!image)return false;const f=frame(t,moving,reducedMotion),sw=image.naturalWidth/4,sh=image.naturalHeight/2,dh=o.h*1.2,dw=dh*.75;ctx.save();ctx.filter='brightness(1.25)';ctx.translate(o.x+o.w/2,o.y+o.h);if(flip)ctx.scale(-1,1);ctx.drawImage(image,(f%4)*sw,Math.floor(f/4)*sh,sw,sh,-dw/2,-dh*1.02,dw,dh);ctx.restore();return true;}
  function robot(o,color,t,fly=false){const u=engine.U,cx=o.x+o.w/2,cy=o.y+o.h/2;ctx.fillStyle='#0d1d38';ctx.strokeStyle=color;ctx.lineWidth=1.5;round(o.x,o.y,o.w,o.h*.65,7*u);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.fillRect(o.x+o.w*.15,o.y+o.h*.2,o.w*.7,Math.max(2,o.h*.07));if(fly){for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(cx+s*o.w*.4,cy);ctx.lineTo(cx+s*o.w*.65,cy+(reducedMotion?0:Math.sin(t*9)*5*u));ctx.stroke();}}else{for(const s of[-1,1]){const swing=reducedMotion?0:Math.sin(t*10+s)*o.w*.12;ctx.fillStyle='#102c46';ctx.fillRect(cx+s*o.w*.25-4*u+ swing,o.y+o.h*.62,8*u,o.h*.35);}}}
  function meter(o,hp,max,color){ctx.fillStyle='#030917';ctx.fillRect(o.x,o.y-6,o.w,3);ctx.fillStyle=color;ctx.fillRect(o.x,o.y-6,o.w*Math.max(0,hp/max),3);}
  function warning(o){if(!(o.warning>0)||!o.aim)return;ctx.save();ctx.strokeStyle='#ffd76d';ctx.lineWidth=1;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(o.x+o.w/2,o.y+o.h/2);ctx.lineTo(o.aim.x,o.aim.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ffd76d';ctx.beginPath();ctx.arc(o.x+o.w/2,o.y+o.h/2,Math.max(3,5*engine.U),0,Math.PI*2);ctx.fill();ctx.restore();}
  function draw(){
   const s=engine.state,l=engine.level(),w=engine.W,h=engine.H,u=engine.U,t=s.time,p=s.player;
   ctx.clearRect(0,0,w,h);const bg=backgrounds.get(selected)?.image;
   if(bg){const r=cover(bg.naturalWidth,bg.naturalHeight,w,h,l.cropTop);ctx.drawImage(bg,r.sx,r.sy,r.sw,r.sh,r.x,r.y,r.w,r.h);}else{const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#142443');g.addColorStop(1,'#070d22');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.strokeStyle='#214768';for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(i*w/7,0);ctx.lineTo(i*w/7,h);ctx.stroke();}}
   ctx.fillStyle='rgba(2,7,21,.43)';ctx.fillRect(0,0,w,h);
   const gy=engine.groundY(),floor=ctx.createLinearGradient(0,gy,0,h);floor.addColorStop(0,'#09182be8');floor.addColorStop(1,'#030918');ctx.fillStyle=floor;ctx.fillRect(0,gy,w,h-gy);ctx.strokeStyle='#45dcff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();ctx.strokeStyle='#17344b';for(let i=1;i<6;i++){ctx.beginPath();ctx.moveTo(0,gy+(h-gy)*i/6);ctx.lineTo(w,gy+(h-gy)*i/6);ctx.stroke();}
   if(l.orb){const o=s.orb,cx=o.x+o.w/2,cy=o.y+o.h/2;ctx.save();ctx.strokeStyle='#74ffc1';ctx.fillStyle='#10394c';ctx.lineWidth=2;round(o.x,o.y+o.h*.65,o.w,o.h*.35,4*u);ctx.fill();ctx.stroke();ctx.translate(cx,cy);ctx.rotate(reducedMotion?0:t*.6);ctx.beginPath();ctx.ellipse(0,0,o.w*.46,o.h*.4,0,0,Math.PI*2);ctx.stroke();ctx.rotate(Math.PI/2);ctx.beginPath();ctx.ellipse(0,0,o.w*.46,o.h*.23,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#bbffed';ctx.beginPath();ctx.arc(0,0,o.w*.18,0,Math.PI*2);ctx.fill();ctx.restore();meter(o,o.health,o.maxHealth,'#74ffc1');}
   for(const n of s.npcs){if(!sprite('player',n,n.age,false,true))robot(n,'#74ffc1',n.age);ctx.strokeStyle='#74ffc1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(n.x+n.w/2,n.y-6,4,0,Math.PI*2);ctx.stroke();}
   const labels={energy:'E',health:'+',shield:'S',weapon:'W',emp:'EMP',key:'K',chip:'AI',repair:'R'};
   for(const it of s.items){const cy=it.y+it.h/2+(reducedMotion?0:Math.sin(it.age*4)*2*u),cx=it.x+it.w/2;ctx.save();ctx.fillStyle=it.kind==='health'||it.kind==='repair'?'#11604c':'#142b51';ctx.strokeStyle='#ffd76d';ctx.lineWidth=1.5;round(it.x,cy-it.h/2,it.w,it.h,5*u);ctx.fill();ctx.stroke();ctx.fillStyle='#fff0bd';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`900 ${Math.max(8,it.h*.42)}px system-ui`;ctx.fillText(labels[it.kind]||'E',cx,cy);ctx.restore();}
   for(const e of s.enemies){ctx.save();ctx.globalAlpha=e.stun>0?.55:1;const right=p.x>e.x;
    if(!sprite(e.fly?'drone':'rogue',e,e.age,right,!e.static))robot(e,e.repair?'#74ffc1':'#ff5b7c',e.age,e.fly);
    if(e.shield){ctx.strokeStyle='#54cbff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x+e.w/2,e.y+e.h/2,e.w*.55,e.h*.55,0,0,Math.PI*2);ctx.stroke();}
    if(e.repair){ctx.fillStyle='#74ffc1';ctx.fillRect(e.x+e.w/2-1,e.y+e.h/2-5,2,10);ctx.fillRect(e.x+e.w/2-5,e.y+e.h/2-1,10,2);}
    if(e.static){ctx.fillStyle='#335374';round(e.x-3*u,e.y+e.h*.8,e.w+6*u,e.h*.2,3);ctx.fill();}
    if(e.laser){ctx.strokeStyle='#bf8aff';ctx.strokeRect(e.x,e.y,e.w,e.h);}
    meter(e,e.hp,e.maxHp,e.stun>0?'#74ffc1':'#ff5b7c');warning(e);ctx.restore();
   }
   if(s.boss){const b=s.boss;if(!sprite('boss',b,b.age,false,true))robot(b,'#ff4dbd',b.age,true);warning(b);ctx.save();ctx.strokeStyle=b.phase===3?'#ff5b7c':b.phase===2?'#ffd76d':'#c484ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x+b.w/2,b.y+b.h/2,b.w*.48,reducedMotion?0:t*.5,(reducedMotion?0:t*.5)+Math.PI*1.5);ctx.stroke();const bw=Math.min(w*.7,420),bx=(w-bw)/2;ctx.fillStyle='#071123';ctx.fillRect(bx,25,bw,6);ctx.fillStyle='#ff5b7c';ctx.fillRect(bx,25,bw*b.health/b.maxHealth,6);ctx.fillStyle='#ffe9f1';ctx.textAlign='center';ctx.font='800 11px system-ui';ctx.fillText(`${l.boss} · PHASE ${b.phase}`,w/2,17);ctx.restore();}
   for(const b of [...s.bullets,...s.enemyBullets]){ctx.save();ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.restore();}
   ctx.save();if(p.invuln>0&&!reducedMotion&&Math.sin(t*28)>0)ctx.globalAlpha=.55;
   if(!sprite('player',p,p.anim,p.facing<0,Math.abs(p.vx)>2||!p.onGround))robot(p,'#45dcff',p.anim);ctx.restore();
   if(p.shield>0){ctx.strokeStyle='#90f4ff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h/2,p.w*.7,p.h*.6,0,0,Math.PI*2);ctx.stroke();}
   if(p.muzzle>0){ctx.fillStyle='#f1ffb7';ctx.beginPath();ctx.arc(p.x+p.w*(p.facing>0?1:.05),p.y+p.h*.4,Math.max(3,8*u*p.muzzle/.07),0,Math.PI*2);ctx.fill();}
   for(const q of s.particles){if(reducedMotion&&q.r<2*u)continue;ctx.save();ctx.globalAlpha=1-q.age/q.life;ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill();ctx.restore();}
   for(const f of s.floaters){ctx.save();ctx.globalAlpha=1-f.age/f.life;ctx.font=`900 ${Math.max(10,18*u)}px system-ui`;ctx.textAlign='center';ctx.strokeStyle='#030817';ctx.lineWidth=3;ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);ctx.restore();}
   if(s.paused){ctx.fillStyle='#03091955';ctx.fillRect(0,0,w,h);}
  }
  return {select,draw,get backgroundCacheSize(){return backgrounds.size;},get sheetCount(){return Object.values(sheets).filter(Boolean).length;}};
 }
 const api={create,cover,frame,files};if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbRenderer=api;
})(typeof window!=='undefined'?window:globalThis);
