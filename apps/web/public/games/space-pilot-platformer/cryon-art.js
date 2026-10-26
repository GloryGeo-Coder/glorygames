(function(root){
  'use strict';
  // Original canvas-native polar architecture and machinery. Nova, cores and
  // gates retain the established atlas; no remote assets or render dependencies.
  const inherited=root.SpacePilotArt;
  const palettes=[['#061322','#1c465c','#a7ecff'],['#090f21','#293849','#b4d9ef'],['#0a1a29','#24525b','#95f2e3'],['#071426','#243d65','#9fcbff'],['#0b1022','#323d55','#b2dcff']];
  const phaseAt=(time,phase,cycle)=>{const value=(time+phase)%cycle;return value<0?value+cycle:value;};
  const circle=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
  function line(c,x,y,xx,yy,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
  function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
  function ring(c,x,y,r,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();}
  function label(c,text,x,y,color='#d9f5ff',size=10){c.fillStyle=color;c.textAlign='center';c.font='bold '+size+'px system-ui';c.fillText(text,x,y);}
  function ice(c,x,y,width,height,color){poly(c,[[x-width/2,y],[x-width*.3,y-height*.63],[x+width*.05,y-height],[x+width*.5,y]],color,'#c9f6ff35');line(c,x+width*.05,y-height,x-width*.08,y-5,'#e8ffff44',1);}
  const visible=(a,x,y,m=120)=>x>-m&&x<a.view.width+m&&y>-m&&y<a.view.height+m;
  function hull(c,x,y,w,h,color='#304b61'){
    poly(c,[[x+12,y],[x+w-12,y],[x+w,y+12],[x+w,y+h-12],[x+w-12,y+h],[x+12,y+h],[x,y+h-12],[x,y+12]],color,'#839dab');
    line(c,x+12,y+5,x+w-12,y+5,'#dbf8ff66',2);
  }
  function background(a,t){
    const {ctx:c,view:v,state}=a,index=state.world?.spec.bg||0,[sky,mist,accent]=palettes[index%5];
    const gradient=c.createLinearGradient(0,0,0,v.height);gradient.addColorStop(0,sky);gradient.addColorStop(.7,mist);gradient.addColorStop(1,'#091925');c.fillStyle=gradient;c.fillRect(0,0,v.width,v.height);
    const drift=(state.cameraX||0)*.1;
    for(let i=0;i<40;i++)circle(c,(i*151-drift*.15+v.width*8)%(v.width+20),(i*97)%Math.max(1,v.height*.7),i%5===0?1.5:.7,'#e4fbff66');
    if(index===0){
      // Glacial cathedral: opaque rock ceiling, transparent hanging ice and
      // distant frozen lake give this exterior a different silhouette to stations.
      for(let i=-1;i<v.width/96+2;i++){const x=i*96-(drift%96),h=70+Math.sin(i*1.7)*45;poly(c,[[x-25,0],[x+120,0],[x+86,h],[x+47,h+80],[x+18,h*.65]],'#16394b','#436979');poly(c,[[x+33,h*.5],[x+47,h+80],[x+58,h*.65]],'#9ad9e544');}
      for(let row=0;row<2;row++)for(let i=-1;i<v.width/135+2;i++)ice(c,i*135-(drift*(row+1)%135),v.height*(.77+row*.14),120,110+Math.sin(i+row)*54,row?'#2c5c70':'#25475b');
      for(let b=0;b<3;b++){c.beginPath();for(let x=0;x<=v.width+20;x+=20){const y=v.height*.33+b*15+Math.sin(x*.009+t*.16+b)*18;x?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle=accent+'16';c.lineWidth=8;c.stroke();}
    }else{
      // Repeated structural ribs parallax slowly behind the playable platforms.
      for(let i=-1;i<v.width/185+2;i++){const x=i*185-(drift%185);c.fillStyle='#111e2c';c.fillRect(x,0,22,v.height);line(c,x+21,0,x+21,v.height,'#56748255',3);line(c,x+22,48,x+100,105,'#324b5a',12);}
      c.save();c.translate(v.width*.52,v.height*.38);
      if(index===1){
        hull(c,-170,-100,340,220,'#243b4b');c.fillStyle='#061222';c.fillRect(-143,-76,286,146);
        circle(c,67,-12,56,'#467383');circle(c,80,-24,49,'#142f45');c.strokeStyle='#92b7ca44';c.lineWidth=12;c.beginPath();c.ellipse(67,-12,92,17,-.4,0,Math.PI*2);c.stroke();
        line(c,-134,57,130,-62,'#96bed344',3);line(c,10,-70,29,4,'#9dc6d355',2);line(c,29,4,-8,36,'#9dc6d355',2);
        label(c,'STATION 04 · SIGNAL LOST',0,98,'#8da6b5',11);for(let i=-2;i<=2;i++){c.fillStyle=i===1?'#d7a16a':'#3b6c7a';c.fillRect(i*56-17,128,34,5);}
      }else if(index===2){
        for(let i=-2;i<=2;i++){const x=i*65;hull(c,x-25,-70,50,149,'#234652');c.fillStyle='#73cfc133';c.fillRect(x-17,-53,34,111);circle(c,x,-26,9,'#75b0bb66');poly(c,[[x-12,32],[x-8,-12],[x+8,-12],[x+12,32]],'#81c0c177');line(c,x-16,60,x+16,60,accent+'99',3);}
        line(c,-180,-90,180,-90,'#5c7b88',10);for(let i=-2;i<=2;i++){line(c,i*65,-90,i*65,-70,'#517883',4);circle(c,i*65,-90,3,accent);}
        label(c,'CRYOGENIC REFUGE',0,110,'#a1d3d5',12);
      }else if(index===3){
        circle(c,0,-10,105,'#9dcaff11');ring(c,0,-10,110,'#7b9ab055',7);
        for(let i=-2;i<=2;i++){const x=i*78;hull(c,x-23,-105,46,205,'#263c56');line(c,x,-87,x,81,'#64a9c144',12);for(let j=0;j<4;j++)line(c,x-12,-67+j*43,x+12,-67+j*43,'#91b6c5',4);const flow=phaseAt(t*18+i*30,0,150);line(c,x,-80+flow,x,-67+flow,'#a5dfff77',5);}
        for(let side of [-1,1])line(c,side*170,-95,side*218,-140,'#61879c',14);
        label(c,'ORBITAL COOLANT SPINE',0,127,'#aec3df',11);
      }else{
        // Dock cradles and a colossal distant hull establish the final hangar.
        for(const side of [-1,1]){line(c,side*155,-145,side*155,125,'#344a60',22);line(c,side*155,83,side*95,83,'#718697',8);}
        poly(c,[[-152,-40],[-100,-82],[-39,-99],[58,-94],[141,-45],[119,2],[53,39],[-58,39],[-130,9]],'#425b70','#8caabb55');
        for(let i=-2;i<=2;i++){c.fillStyle='#bedaff33';c.fillRect(i*42-11,-46,22,10);line(c,i*42,-14,i*42,16,'#7b9eb4',5);}
        c.strokeStyle='#63849944';c.setLineDash([8,10]);c.lineWidth=2;c.strokeRect(-183,-124,366,254);c.setLineDash([]);label(c,'FROST FLEET · DOCK 01',0,153,'#9eb6c9',11);
      }c.restore();
      for(let i=-1;i<v.width/130+2;i++)ice(c,i*130-(drift%130),v.height*.98,100,75+Math.sin(i)*27,'#274756');
    }
    const fog=c.createLinearGradient(0,v.height*.73,0,v.height);fog.addColorStop(0,'#07142200');fog.addColorStop(1,'#071422cc');c.fillStyle=fog;c.fillRect(0,v.height*.73,v.width,v.height*.27);
    for(let i=0;i<24;i++)circle(c,phaseAt(i*139+t*(5+i%4),0,v.width+20),phaseAt(i*73+t*(8+i%3),0,v.height),i%4===0?1.6:.8,accent+'55');return true;
  }
  function draw(name,a,arg){
    const {ctx:c,state,screen,settings}=a,t=settings.reducedMotion?0:state.time;
    if(name==='background')return background(a,t);
    if(name==='platform'){
      const p=arg,s=screen(p.x,p.y);if(!visible(a,s.x+p.w/2,s.y,p.w+60))return true;
      const frozen=p.icy===true,moving=p.type==='moving';hull(c,s.x,s.y,p.w,p.h,frozen?'#325971':'#34434e');
      line(c,s.x+4,s.y+2,s.x+p.w-4,s.y+2,frozen?'#e1fcff':moving?'#ffd394':'#c3bea0',4);
      if(frozen){for(let x=18;x<p.w-10;x+=43){poly(c,[[s.x+x,s.y+3],[s.x+x+14,s.y+17],[s.x+x+7,s.y+4]],'#b1edff77');line(c,s.x+x,s.y+9,s.x+x-7,s.y+23,'#89bdcd',1);}}
      else for(let x=15;x<p.w-8;x+=40)line(c,s.x+x,s.y+9,s.x+x+15,s.y+9,'#e8bc6c77',2);
      if(moving){for(const side of [-1,1]){const x=s.x+p.w/2+side*42;poly(c,[[x-8,s.y+p.h],[x+8,s.y+p.h],[x,s.y+p.h+12+Math.sin(t*15)*3]],'#a5eaff99');}label(c,'SHUTTLE',s.x+p.w/2,s.y+19,'#f8dbab',9);}return true;
    }
    if(name==='enemy'){
      const e=arg;if(!e.alive)return true;const s=screen(e.x,e.y);if(!visible(a,s.x,s.y,230))return true;const boss=e.type==='boss',crawler=e.type==='crawler',warning=e.shoot<.45;
      c.save();c.translate(s.x,s.y);if(e.hitFlash>0)c.globalAlpha=.65;
      if(boss){
        c.translate(0,Math.sin(t*2)*3);
        // Armoured carrier silhouette: broad wings, cockpit, engine pods and a
        // central shutter, rather than the preceding world's humanoid crystal.
        for(const side of [-1,1]){poly(c,[[side*29,-25],[side*78,-52],[side*113,-18],[side*100,35],[side*57,47],[side*30,18]],'#54728b','#c3e4ed');hull(c,side*79-13,12,26,41,'#26394e');poly(c,[[side*79-9,52],[side*79+9,52],[side*79,66+Math.sin(t*17)*5]],'#b7efffcc');line(c,side*57,-25,side*86,-13,'#8cd8f2',5);}
        hull(c,-48,-49,96,97,'#668297');poly(c,[[-32,-36],[0,-57],[32,-36],[25,-16],[-25,-16]],'#c9f0fc','#effcff');line(c,-25,-27,25,-27,'#193b59',8);
        const locked=e.shielded,closing=e.hullWarning,color=locked?'#9daec2':closing?'#ffdb8c':'#9ff8ff';
        hull(c,-25,-4,50,38,'#172e46');if(locked){for(let i=0;i<4;i++)line(c,-20,2+i*8,20,2+i*8,'#9bb3c5',5);}else{circle(c,0,15,14,color);ring(c,0,15,20,color+'88',2);line(c,-17,15,17,15,'#f4ffff',3);}
        if(locked){c.strokeStyle='#a7ddff88';c.lineWidth=3;c.beginPath();c.ellipse(0,0,126,76,0,0,Math.PI*2);c.stroke();}
        label(c,locked?'ARMOURED':closing?'HULL CLOSING':'HULL OPEN · FIRE',0,96,color,10);
      }else if(crawler){
        for(const side of [-1,1])for(let i=-1;i<=1;i++){const x=i*19,lift=Math.sin(t*10+i)*4;line(c,x,5,x+side*9,19+lift,'#9ab8c6',4);circle(c,x+side*9,19+lift,3,'#d4f8ff');}
        poly(c,[[-30,4],[-23,-16],[21,-16],[31,6],[17,15],[-20,15]],'#678b9d','#d2f5ff');hull(c,-16,-24,32,16,'#39546b');line(c,-15,-5,16,-5,'#ffb7a7',5);for(let i=-1;i<=1;i++)ice(c,i*16,-16,12,12,'#b2efff99');
      }else{
        if(e.type==='turret'){hull(c,-24,-18,48,38,'#546e83');line(c,0,-3,e.vx<0?-37:37,-3,'#b2d4e3',8);circle(c,0,-3,10,'#21384f');circle(c,0,-3,4,'#ffb5ad');line(c,-20,23,20,23,'#a8c9d6',5);}
        else{c.rotate(Math.sin(t*3+e.phase)*.08);for(const side of [-1,1]){hull(c,side*27-9,-9,18,28,'#53788f');poly(c,[[side*27-5,19],[side*27+5,19],[side*27,27+Math.sin(t*16)*4]],'#9ae5ff');}poly(c,[[0,-26],[23,-9],[20,15],[0,24],[-20,15],[-23,-9]],'#7295a9','#d8f6ff');line(c,-13,-5,13,-5,'#173b55',8);circle(c,0,-5,5,'#ffc9b7');}
      }
      if(warning){c.strokeStyle='#ffd094';c.lineWidth=boss?4:2;c.beginPath();c.arc(0,0,boss?118:37,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-Math.max(0,e.shoot)/.45));c.stroke();}
      if(boss||e.hp<e.maxHp){const width=boss?200:52,y=boss?-94:-42;c.fillStyle='#0a1d30';c.fillRect(-width/2,y,width,6);c.fillStyle='#bce9ff';c.fillRect(-width/2,y,width*Math.max(0,e.hp/e.maxHp),6);}if(boss)label(c,e.name,0,-108,'#e4f7ff',12);c.restore();return true;
    }
    if(name==='hazard'){
      const h=arg,s=screen(h.x,h.y);if(!visible(a,s.x,s.y))return true;const phase=phaseAt(state.time,h.phase||0,h.cycle||5),disabled=h.control!==undefined&&state.world.objectives[h.control]?.done,active=!disabled&&phase>=3.5,warning=!disabled&&phase>=2.8&&!active,color=disabled?'#83c5ae':active?'#f1fbff':warning?'#ffdc92':'#9ccfe8';
      c.save();c.translate(s.x,s.y);hull(c,-h.w/2,-h.h/2,h.w,h.h,'#2c455b');for(let i=-1;i<=1;i++)line(c,-h.w*.32,i*8,h.w*.32,i*8,color,3);
      if(active){for(let i=0;i<6;i++){const angle=i*Math.PI/3+t*.5;line(c,Math.cos(angle)*9,Math.sin(angle)*9,Math.cos(angle)*h.w*.66,Math.sin(angle)*h.h*.66,'#e5fbff',3);}ring(c,0,0,h.w*.69,'#8edcff88',3);}else if(warning)ring(c,0,0,h.w*.67,color,2);
      label(c,disabled?'ISOLATED':active?'FREEZE JET':warning?'CAUTION':'VENT IDLE',0,-h.h*.5-12,color,9);c.restore();return true;
    }
    if(name==='objectives'){
      for(const n of state.world.objectives){const s=screen(n.x,n.y);if(!visible(a,s.x,s.y,140))continue;const phase=phaseAt(state.time,n.phase||0,5),blocked=n.kind==='coolant'&&!n.done&&phase>=2.8,accent=n.done?'#9aefc6':blocked?(phase<3.5?'#ffdb8e':'#cad9f7'):'#a9eaff';c.save();c.translate(s.x,s.y);
        hull(c,-28,16,56,14,'#355369');
        if(n.kind==='heater'){hull(c,-20,-29,40,48,'#42576a');for(let i=-1;i<=1;i++)line(c,i*10,-19,i*10,9,n.done?'#ffb66f':'#6c99af',5);if(n.done){for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(i*13,-34);c.quadraticCurveTo(i*13+Math.sin(t*2+i)*6,-47,i*13,-56);c.strokeStyle='#f5ba6b77';c.lineWidth=2;c.stroke();}}}
        else if(n.kind==='airlock'){hull(c,-23,-33,46,53,'#405b70');line(c,0,-26,0,15,accent,3);line(c,-13,-5,13,-5,accent,3);circle(c,0,-5,7,'#162b40');label(c,String(state.world.objectives.indexOf(n)+1),0,-1,accent,11);}
        else if(n.kind==='rescue'){hull(c,-23,-36,46,58,'#355b6a');c.fillStyle=n.done?'#98e5c533':'#9ddfff33';c.fillRect(-16,-28,32,42);circle(c,0,-15,7,accent);poly(c,[[-11,12],[-8,-5],[8,-5],[11,12]],'#bed8e7');if(!n.done)for(let i=-1;i<=1;i++)line(c,i*11,-26,i*11,15,'#b3e7f455',2);}
        else if(n.kind==='coolant'){line(c,0,-32,0,25,'#5b7d94',15);ring(c,0,-5,22,accent,5);for(let i=0;i<4;i++){const angle=i*Math.PI/2+(n.done?Math.PI/4:0);line(c,0,-5,Math.cos(angle)*19,Math.sin(angle)*19-5,accent,3);}circle(c,0,-5,5,'#d8f5ff');label(c,n.done?'FLOW STOPPED':blocked?'PRESSURISED · WAIT':'BLUE · HOLD FIRE',0,-72,accent,9);}
        else{hull(c,-23,-29,46,49,'#536b7e');for(let i=-1;i<=1;i++)line(c,-15,-17+i*11,15,-17+i*11,n.done?'#78c8e0':'#d4e5f0',n.done?2:6);if(n.done)for(let i=-1;i<=1;i++)line(c,i*12,-34,i*12+Math.sin(t*2+i)*5,-49,'#c3efff77',2);}
        if(!n.done){c.strokeStyle='#c3f7ff';c.lineWidth=3;c.beginPath();c.arc(0,0,37,-Math.PI/2,-Math.PI/2+Math.PI*2*n.charge/.8);c.stroke();}label(c,n.done?'SECURED':n.label,0,-53,n.done?'#b8f5d2':'#e9faff',10);c.restore();
      }return true;
    }
    return inherited.draw(name,a,arg);
  }
  root.SpacePilotArt={...inherited,draw,palettes};
})(typeof globalThis!=='undefined'?globalThis:this);
