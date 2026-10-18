/* Animated transparent sheets and stationary cover scenes; no full-campaign image preload. */
(function(root){
 'use strict';
 const files={player:'defender-run-sheet.png',rogue:'rogue-walk-sheet.png',drone:'drone-flight-sheet.png',boss:'omega-core-sheet.png',robots:'../../reinforcements/robots-atlas.png',drones:'../../reinforcements/drones-atlas.png',bosses:'../../reinforcements/bosses-atlas.png',items:'../../reinforcements/items-atlas.png',effects:'../../reinforcements/effects-atlas.png',ally:'../../reinforcements/ally-atlas.png'};
 const atlasBounds={"robots":[[36,53,256,245],[355,42,257,258],[672,50,246,251],[982,50,241,251],[24,334,282,269],[337,333,283,272],[648,334,288,272],[959,326,278,279],[59,641,219,299],[371,636,239,304],[670,640,249,300],[994,640,225,300],[24,940,286,275],[338,940,282,277],[643,940,286,276],[949,940,285,276]],"drones":[[38,45,253,228],[331,54,271,220],[632,120,299,153],[953,126,269,149],[21,406,291,161],[336,395,289,176],[629,420,311,143],[943,425,289,142],[51,680,234,208],[352,675,241,217],[664,677,246,217],[960,686,284,198],[11,1011,303,154],[314,1006,313,160],[627,1008,313,153],[940,1011,297,151]],"bosses":[[14,28,300,286],[314,27,312,287],[633,31,307,283],[940,19,288,295],[10,314,304,296],[314,314,313,296],[627,314,313,290],[940,314,306,301],[11,647,303,293],[341,643,286,297],[627,644,313,296],[940,649,303,291],[22,940,292,285],[314,940,300,287],[652,940,288,295],[940,940,300,281]],"items":[[27,87,287,204],[314,67,302,234],[711,55,166,256],[1011,56,159,254],[30,375,284,222],[314,345,303,261],[657,362,270,245],[970,357,250,256],[44,651,260,259],[351,651,276,289],[627,650,305,264],[968,657,255,246],[26,964,288,220],[314,940,281,282],[632,997,294,137],[943,997,290,137]],"effects":[[91,123,191,118],[357,91,244,182],[667,58,251,232],[980,92,205,182],[67,361,210,217],[339,333,261,264],[648,341,257,263],[967,356,250,220],[62,671,208,195],[353,651,240,289],[650,642,255,298],[985,669,207,199],[83,991,177,168],[335,940,292,254],[627,940,292,274],[961,964,246,220]],"ally":[[93,60,252,417],[462,60,253,417],[824,60,261,416],[1212,60,251,416],[78,560,266,415],[450,560,263,414],[832,560,253,415],[1217,557,254,418]]};
 const itemCells={life:0,health:1,shield:2,energy:3,weapon:4,emp:5,key:6,chip:7,repair:8,armor:9,orb:10,score:11,dash:12,jump:13,bolt:14,enemyBolt:15};
 const enemyRows={bladeBot:['robots',0],siegeWalker:['robots',1],rocketBot:['robots',2],phaseBot:['robots',3],swarmDrone:['drones',0],bomberDrone:['drones',1],arcDrone:['drones',2],interceptor:['drones',3]};
 function frame(time,moving=true,reduced=false){return reduced?0:moving?Math.floor(time*12)%8:Math.floor(time*1.5)%2;}
 function cover(iw,ih,w,h,cropTop=0){const sy=ih*cropTop,sh=ih-sy,r=Math.max(w/iw,h/sh);return {sx:0,sy,sw:iw,sh,x:(w-iw*r)/2,y:(h-sh*r)/2,w:iw*r,h:sh*r};}
 function create(ctx,engine,{ImageClass=root.Image,reducedMotion=false}={}){
  const sheets={},requested=new Set(),backgrounds=new Map();let selected='';
  function picture(src,done){if(!ImageClass)return null;const image=new ImageClass();image.onload=()=>done(image.naturalWidth>0?image:null);image.onerror=()=>done(null);image.src=src;return image;}
  function loadSheet(name){if(requested.has(name))return;requested.add(name);picture('./assets/sprites/animated/'+files[name],image=>sheets[name]=image);}
  for(const name of['player','rogue','drone','robots','drones','items'])loadSheet(name);
  function select(level){if(level.rescue)loadSheet('ally');selected=level.background;if(backgrounds.has(selected))return;const key=selected,entry={image:null};backgrounds.set(key,entry);picture(key,image=>{if(backgrounds.get(key)===entry)entry.image=image;});while(backgrounds.size>2)backgrounds.delete(backgrounds.keys().next().value);}
  const round=(x,y,w,h,r)=>{ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h);};
  function sprite(name,o,t,flip=false,moving=true){const image=sheets[name];if(!image)return false;const f=frame(t,moving,reducedMotion),sw=image.naturalWidth/4,sh=image.naturalHeight/2,dh=o.h*1.2,dw=dh*.75;ctx.save();ctx.filter='brightness(1.25)';ctx.translate(o.x+o.w/2,o.y+o.h);if(flip)ctx.scale(-1,1);ctx.drawImage(image,(f%4)*sw,Math.floor(f/4)*sh,sw,sh,-dw/2,-dh*1.02,dw,dh);ctx.restore();return true;}
  function atlas(name,cell,x,y,w,h,flip=false,angle=0){
   const image=sheets[name],b=atlasBounds[name]?.[cell];if(!image||!b)return false;
   const scale=Math.min(w/b[2],h/b[3]),dw=b[2]*scale,dh=b[3]*scale;
   ctx.save();ctx.translate(x+w/2,y+h/2);if(angle)ctx.rotate(angle);if(flip)ctx.scale(-1,1);ctx.drawImage(image,...b,-dw/2,-dh/2,dw,dh);ctx.restore();return true;
  }
  function actor(name,row,o,t,flip=false){const f=reducedMotion?0:Math.floor(t*10)%4;return atlas(name,row*4+f,o.x-o.w*.08,o.y-o.h*.1,o.w*1.16,o.h*1.16,flip);}
  function icon(kind,o,angle=0){return atlas('items',itemCells[kind]??3,o.x,o.y,o.w,o.h,false,angle);}
  function robot(o,color,t,fly=false){const u=engine.U,cx=o.x+o.w/2,cy=o.y+o.h/2;ctx.fillStyle='#0d1d38';ctx.strokeStyle=color;ctx.lineWidth=1.5;round(o.x,o.y,o.w,o.h*.65,7*u);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.fillRect(o.x+o.w*.15,o.y+o.h*.2,o.w*.7,Math.max(2,o.h*.07));if(fly){for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(cx+s*o.w*.4,cy);ctx.lineTo(cx+s*o.w*.65,cy+(reducedMotion?0:Math.sin(t*9)*5*u));ctx.stroke();}}else{for(const s of[-1,1]){const swing=reducedMotion?0:Math.sin(t*10+s)*o.w*.12;ctx.fillStyle='#102c46';ctx.fillRect(cx+s*o.w*.25-4*u+ swing,o.y+o.h*.62,8*u,o.h*.35);}}}
  function meter(o,hp,max,color){ctx.fillStyle='#030917';ctx.fillRect(o.x,o.y-6,o.w,3);ctx.fillStyle=color;ctx.fillRect(o.x,o.y-6,o.w*Math.max(0,hp/max),3);}
  function warning(o){if(!(o.warning>0)||!o.aim)return;ctx.save();ctx.strokeStyle='#ffd76d';ctx.lineWidth=1;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(o.x+o.w/2,o.y+o.h/2);ctx.lineTo(o.aim.x,o.aim.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ffd76d';ctx.beginPath();ctx.arc(o.x+o.w/2,o.y+o.h/2,Math.max(3,5*engine.U),0,Math.PI*2);ctx.fill();atlas('effects',8+(reducedMotion?0:Math.floor(engine.state.time*8)%4),o.x+o.w/2-11,o.y-25,22,22);ctx.restore();}
  function draw(){
   const s=engine.state,l=engine.level(),w=engine.W,h=engine.H,u=engine.U,t=s.time,p=s.player;if(t>4)loadSheet('effects');if(t>10||s.boss)loadSheet(l.bossFamily==='core'?'boss':'bosses');
   ctx.clearRect(0,0,w,h);const bg=backgrounds.get(selected)?.image;
   if(bg){const r=cover(bg.naturalWidth,bg.naturalHeight,w,h,l.cropTop);ctx.drawImage(bg,r.sx,r.sy,r.sw,r.sh,r.x,r.y,r.w,r.h);}else{const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#142443');g.addColorStop(1,'#070d22');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.strokeStyle='#214768';for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(i*w/7,0);ctx.lineTo(i*w/7,h);ctx.stroke();}}
   ctx.fillStyle='rgba(2,7,21,.43)';ctx.fillRect(0,0,w,h);
   const gy=engine.groundY(),floor=ctx.createLinearGradient(0,gy,0,h);floor.addColorStop(0,'#09182be8');floor.addColorStop(1,'#030918');ctx.fillStyle=floor;ctx.fillRect(0,gy,w,h-gy);ctx.strokeStyle='#45dcff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke();ctx.strokeStyle='#17344b';for(let i=1;i<6;i++){ctx.beginPath();ctx.moveTo(0,gy+(h-gy)*i/6);ctx.lineTo(w,gy+(h-gy)*i/6);ctx.stroke();}
   if(l.orb){const o=s.orb;icon('orb',o);meter(o,o.health,o.maxHealth,'#74ffc1');}
   for(const n of s.npcs){if(!atlas('ally',frame(n.age,true,reducedMotion),n.x,n.y,n.w,n.h))robot(n,'#74ffc1',n.age);ctx.strokeStyle='#74ffc1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(n.x+n.w/2,n.y-6,4,0,Math.PI*2);ctx.stroke();}
   for(const it of s.items){const o={...it,y:it.y+(reducedMotion?0:Math.sin(it.age*4)*3*u)};if(!icon(it.kind,o)){ctx.fillStyle='#ffd76d';ctx.fillRect(o.x,o.y,o.w,o.h);}}
   for(const e of s.enemies){ctx.save();ctx.globalAlpha=e.stun>0?.55:1;const right=p.x>e.x;
    const design=enemyRows[e.type],drawn=design?actor(design[0],design[1],e,e.age,right):sprite(e.fly?'drone':'rogue',e,e.age,right,!e.static);if(!drawn)robot(e,e.repair?'#74ffc1':'#ff5b7c',e.age,e.fly);
    if(e.shield){ctx.strokeStyle='#54cbff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x+e.w/2,e.y+e.h/2,e.w*.55,e.h*.55,0,0,Math.PI*2);ctx.stroke();}
    if(e.repair){ctx.fillStyle='#74ffc1';ctx.fillRect(e.x+e.w/2-1,e.y+e.h/2-5,2,10);ctx.fillRect(e.x+e.w/2-5,e.y+e.h/2-1,10,2);}
    if(e.static){ctx.fillStyle='#335374';round(e.x-3*u,e.y+e.h*.8,e.w+6*u,e.h*.2,3);ctx.fill();}
    if(e.laser){ctx.strokeStyle='#bf8aff';ctx.strokeRect(e.x,e.y,e.w,e.h);}
    meter(e,e.hp,e.maxHp,e.stun>0?'#74ffc1':'#ff5b7c');warning(e);ctx.restore();
   }
   if(s.boss){const b=s.boss;const row={goliath:0,manta:1,weaver:2,crown:3}[b.family],drawn=row===undefined?sprite('boss',b,b.age,false,true):actor('bosses',row,b,b.age,false);if(!drawn)robot(b,'#ff4dbd',b.age,true);warning(b);ctx.save();ctx.strokeStyle=b.phase===3?'#ff5b7c':b.phase===2?'#ffd76d':'#c484ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x+b.w/2,b.y+b.h/2,b.w*.48,reducedMotion?0:t*.5,(reducedMotion?0:t*.5)+Math.PI*1.5);ctx.stroke();const bw=Math.min(w*.7,420),bx=(w-bw)/2;ctx.fillStyle='#071123';ctx.fillRect(bx,25,bw,6);ctx.fillStyle='#ff5b7c';ctx.fillRect(bx,25,bw*b.health/b.maxHealth,6);ctx.fillStyle='#ffe9f1';ctx.textAlign='center';ctx.font='800 11px system-ui';ctx.fillText(`${l.boss} · PHASE ${b.phase}`,w/2,17);ctx.restore();}
   for(const b of [...s.bullets,...s.enemyBullets]){const hostile=s.enemyBullets.includes(b),size=b.mortar?20*u:Math.max(12,22*u);if(icon(hostile?'enemyBolt':'bolt',{x:b.x-size/2,y:b.y-size/2,w:size,h:size},Math.atan2(b.vy,b.vx)))continue;ctx.save();ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.restore();}
   ctx.save();if(p.invuln>0&&!reducedMotion&&Math.sin(t*28)>0)ctx.globalAlpha=.55;
   if(!sprite('player',p,p.anim,p.facing<0,Math.abs(p.vx)>2||!p.onGround))robot(p,'#45dcff',p.anim);ctx.restore();
   if(p.shield>0){ctx.strokeStyle='#90f4ff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+p.h/2,p.w*.7,p.h*.6,0,0,Math.PI*2);ctx.stroke();}
   if(p.muzzle>0&&!atlas('effects',reducedMotion?0:Math.min(3,Math.floor((.07-p.muzzle)/.07*4)),p.x+p.w/2,p.y+p.h*.3,28*u,28*u,p.facing<0)){ctx.fillStyle='#f1ffb7';ctx.beginPath();ctx.arc(p.x+p.w*(p.facing>0?1:.05),p.y+p.h*.4,Math.max(3,8*u*p.muzzle/.07),0,Math.PI*2);ctx.fill();}
   for(const fx of s.effects){const row=fx.kind==='emp'?3:1,cell=row*4+(reducedMotion?0:Math.min(3,Math.floor(fx.age/fx.life*4)));atlas('effects',cell,fx.x-fx.size/2,fx.y-fx.size/2,fx.size,fx.size);}
   for(const q of s.particles){if(reducedMotion&&q.r<2*u)continue;ctx.save();ctx.globalAlpha=1-q.age/q.life;ctx.fillStyle=q.color;ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill();ctx.restore();}
   for(const f of s.floaters){ctx.save();ctx.globalAlpha=1-f.age/f.life;ctx.font=`900 ${Math.max(10,18*u)}px system-ui`;ctx.textAlign='center';ctx.strokeStyle='#030817';ctx.lineWidth=3;ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);ctx.restore();}
   if(s.paused){ctx.fillStyle='#03091955';ctx.fillRect(0,0,w,h);}
  }
  return {select,draw,get backgroundCacheSize(){return backgrounds.size;},get sheetCount(){return Object.values(sheets).filter(Boolean).length;}};
 }
 const api={create,cover,frame,files,atlasBounds,itemCells,enemyRows};if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbRenderer=api;
})(typeof window!=='undefined'?window:globalThis);
