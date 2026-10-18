/* Character roles decide intent; game.js remains responsible for physics, damage and rewards. */
(function(root,factory){
 "use strict";
 if(typeof module==='object'&&module.exports)module.exports=factory();else root.KasiEnemies=factory();
})(typeof window!=='undefined'?window:globalThis,function(){
 "use strict";
 const roles=Object.freeze({
  sprinter:{name:'Rooftop Runner',firstLevel:2,w:.78,h:1.28,color:'#fb923c',skin:'#a7653b',windup:.48,attack:.42,recover:.85,range:6,
   tip:'Jump over the dash, then counter during recovery.'},
  warden:{name:'Shield Warden',firstLevel:5,w:1.04,h:1.42,color:'#38bdf8',skin:'#a97a53',windup:.65,attack:.24,recover:1.1,range:4,
   tip:'Stomp or attack from behind. Two blocked shots stagger the shield.'},
  thrower:{name:'Spark Thrower',firstLevel:8,w:.8,h:1.3,color:'#c084fc',skin:'#d39c75',windup:.8,attack:.25,recover:1.3,range:10,
   tip:'Watch the amber charge. Keep clear when it bursts.'},
  ranger:{name:'Lookout Ranger',firstLevel:12,w:.8,h:1.38,color:'#4ade80',skin:'#805031',windup:.95,attack:.25,recover:1.5,range:12,
   tip:'Move after the aiming line appears; the shot cannot follow you.'},
 });
 const isRole=type=>Object.hasOwn(roles,type);
 function init(en){en.ai={phase:'patrol',timer:0,cooldown:.8,attackDir:en.dir,aimX:en.dir,aimY:0,blocks:0,flash:0};return en;}
 function recover(en,time=.85){if(!en.ai)return;Object.assign(en.ai,{phase:'recover',timer:time,blocks:0});}
 function hit(en,shot){
  if(!en.alive)return 'dead';
  if(en.type==='warden'&&en.ai && !['recover','stunned'].includes(en.ai.phase)){
   const frontal=(shot.vx||0)*en.dir<0;
   if(frontal){en.ai.blocks++;en.ai.flash=.2;if(en.ai.blocks>=2)recover(en,1.25);return 'blocked';}
  }
  return 'damage';
 }
 function tick(en,{dt,player,tileSize,viewW,fire,play}){
  const role=roles[en.type],a=en.ai; if(!role||!a)return en.dir*en.speed;
  a.flash=Math.max(0,a.flash-dt);a.cooldown=Math.max(0,a.cooldown-dt);
  const dx=player.x+player.w/2-en.x-en.w/2,dy=player.y+player.h/2-en.y-en.h*.4;
  const dir=dx<0?-1:1;
  if(a.phase==='windup'){
   en.dir=a.attackDir;a.timer-=dt;
   if(a.timer<=0){
    a.phase='attack';a.timer=role.attack;play(en,en.type,'shoot',a.attackDir);
    if(en.type==='ranger')fire({x:en.x+en.w/2,y:en.y+en.h*.4,w:15,h:6,vx:a.aimX*410,vy:a.aimY*410,life:2.3,role:'ranger'});
    if(en.type==='thrower')fire({x:en.x+en.w/2,y:en.y+en.h*.3,w:13,h:13,vx:a.aimX,vy:a.aimY,gravity:560,life:1.45,role:'spark',burst:false,hit:false});
   }
   return 0;
  }
  if(a.phase==='attack'){
   a.timer-=dt;
   if(a.timer<=0){recover(en,role.recover);return 0;}
   en.dir=a.attackDir;
   return en.dir*(en.type==='sprinter'?240:en.type==='warden'?110:0);
  }
  if(a.phase==='recover'){
   a.timer-=dt;if(a.timer<=0){a.phase='patrol';a.cooldown=.65;}return 0;
  }
  const range=Math.min(role.range*tileSize,viewW*.72);
  if(a.cooldown<=0&&Math.abs(dx)<range&&Math.abs(dy)<tileSize*3.5){
   a.phase='windup';a.timer=role.windup;a.attackDir=dir;en.dir=dir;
   const distance=Math.hypot(dx,dy)||1;a.aimX=dx/distance;a.aimY=dy/distance;
   if(en.type==='thrower'){
    // A locked ballistic trajectory. Gravity is applied by the projectile system.
    const flight=.95;a.aimX=Math.max(-280,Math.min(280,dx/flight));
    a.aimY=(player.y+player.h*.6-(en.y+en.h*.3)-.5*560*flight*flight)/flight;
   }
   return 0;
  }
  if(en.type==='ranger'&&Math.abs(dx)<tileSize*3)en.dir=-dir;
  return en.dir*en.speed;
 }
 function drawFallback(ctx,en,p,time,reduced){
  const role=roles[en.type];if(!role)return;
  ctx.save();ctx.translate(p.x+en.w/2,p.y);ctx.scale(en.dir,1);
  const step=reduced?0:Math.sin(time*9)*(Math.abs(en.vx)>3?3:0);
  ctx.strokeStyle='#172438';ctx.lineWidth=2;
  ctx.fillStyle='#25344c';ctx.fillRect(-en.w*.26,en.h*.65,10,en.h*.35+step);ctx.fillRect(en.w*.05,en.h*.65,10,en.h*.35-step);
  ctx.fillStyle=role.color;ctx.beginPath();ctx.roundRect(-en.w*.35,en.h*.27,en.w*.7,en.h*.43,5);ctx.fill();ctx.stroke();
  ctx.fillStyle=role.skin;ctx.beginPath();ctx.arc(0,en.h*.15,en.h*.13,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#182233';ctx.beginPath();ctx.ellipse(-1,en.h*.05,en.h*.14,en.h*.065,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f8fafc';ctx.fillRect(4,en.h*.12,3,3);
  if(en.type==='warden'){ctx.fillStyle='#075985';ctx.strokeStyle='#67e8f9';ctx.beginPath();ctx.ellipse(en.w*.4,en.h*.48,10,en.h*.26,0,0,Math.PI*2);ctx.fill();ctx.stroke();}
  if(en.type==='thrower'){ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(en.w*.42,en.h*.48,6,0,Math.PI*2);ctx.fill();}
  if(en.type==='ranger'){ctx.fillStyle='#94a3b8';ctx.fillRect(0,en.h*.42,en.w*.7,5);ctx.fillStyle='#22d3ee';ctx.fillRect(en.w*.5,en.h*.38,4,4);}
  ctx.restore();
 }
 function drawCue(ctx,en,p,reduced){
  const role=roles[en.type],a=en.ai;if(!role||!a||!en.alive)return;
  ctx.save();
  if(a.phase==='windup'){
   ctx.strokeStyle=role.color;ctx.lineWidth=2;ctx.fillStyle='#fef08a';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText('!',p.x+en.w/2,p.y-10);
   ctx.fillStyle='#0f172a';ctx.fillRect(p.x-2,p.y-6,en.w+4,4);ctx.fillStyle=role.color;
   ctx.fillRect(p.x-2,p.y-6,(en.w+4)*Math.max(0,1-a.timer/role.windup),4);
   if(en.type==='ranger'){
    ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(p.x+en.w/2,p.y+en.h*.4);
    ctx.lineTo(p.x+en.w/2+a.aimX*280,p.y+en.h*.4+a.aimY*280);ctx.stroke();
   }
  }
  if(en.type==='warden'){
   ctx.strokeStyle=a.phase==='recover'?'#fb923c':'#67e8f9';ctx.lineWidth=a.flash>0?4:2;
   const cx=p.x+en.w/2+en.dir*en.w*.4,cy=p.y+en.h*.5;
   ctx.beginPath();ctx.ellipse(cx,cy,7,en.h*.27,0,0,Math.PI*2);ctx.stroke();
   if(a.phase==='recover'){ctx.fillStyle='#fed7aa';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText('OPEN',p.x+en.w/2,p.y-8);}
  }
  if(en.type==='sprinter'&&a.phase==='attack'&&!reduced){
   ctx.strokeStyle='#fdba74';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<3;i++){ctx.moveTo(p.x-en.dir*(8+i*4),p.y+en.h*(.45+i*.2));ctx.lineTo(p.x-en.dir*(20+i*4),p.y+en.h*(.45+i*.2));}ctx.stroke();
  }
  if(en.hp<en.maxHp){ctx.fillStyle='#0f172a';ctx.fillRect(p.x,p.y-10,en.w,3);ctx.fillStyle=role.color;ctx.fillRect(p.x,p.y-10,en.w*en.hp/en.maxHp,3);}
  ctx.restore();
 }
 return Object.freeze({roles,isRole,init,tick,hit,recover,drawFallback,drawCue});
});
