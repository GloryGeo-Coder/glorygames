(function(root){
  'use strict';
  // Canvas-native Verdantis artwork extends the established chapter renderer.
  // Nova, collectibles and portals keep their existing transparent atlases.
  const inherited=root.SpacePilotArt;
  const palettes=[['#031e26','#174b46','#83f8c5'],['#10132e','#28505b','#b2cfff'],['#052721','#3f6852','#ffd79b'],['#061e32','#265b66','#92ecdc'],['#150d29','#453452','#eb9cdb']];
  const phaseAt=(time,phase=0,cycle=6)=>((time+phase)%cycle+cycle)%cycle;
  const dot=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
  const line=(c,x,y,xx,yy,color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
  function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
  const ring=(c,x,y,r,color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();};
  function label(c,text,x,y,color='#e5fff4',size=10){c.fillStyle=color;c.textAlign='center';c.font='bold '+size+'px system-ui';c.fillText(text,x,y);}
  function leaf(c,x,y,length,angle,color,vein='#92e9bc33'){
    c.save();c.translate(x,y);c.rotate(angle);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(length*.3,-length*.43,length*.78,-length*.24,length,0);c.bezierCurveTo(length*.65,length*.24,length*.32,length*.35,0,0);c.fillStyle=color;c.fill();line(c,0,0,length*.88,0,vein,1);c.restore();
  }
  function tree(c,x,ground,height,width,color,phase,t){
    const sway=Math.sin(t*.25+phase)*8;
    c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x,ground);c.bezierCurveTo(x-width,ground-height*.3,x+sway+width,ground-height*.7,x+sway,ground-height);c.stroke();
    for(let j=0;j<6;j++){
      const y=ground-height*(.3+j*.12),side=j%2?1:-1,end=x+side*(70+j*13)+sway;
      c.lineWidth=width*(.38-j*.035);c.beginPath();c.moveTo(x,y+35);c.quadraticCurveTo(end,y+15,end+side*22,y-25);c.stroke();
      for(let k=0;k<3;k++)leaf(c,end+side*k*12,y-k*14,55+j*4,side>0?-.55:-2.6,color);
    }
    line(c,x+width*.15,ground-5,x+sway+width*.13,ground-height*.9,'#8cb19c22',2);
  }
  const visible=(a,x,y,m=130)=>x>-m&&x<a.view.width+m&&y>-m&&y<a.view.height+m;
  function background(a,t){
    const {ctx:c,view:v,state}=a,index=state.world?.spec.bg||0,[sky,mist,accent]=palettes[index];c.shadowBlur=0;
    const skyFill=c.createLinearGradient(0,0,0,v.height);skyFill.addColorStop(0,sky);skyFill.addColorStop(.7,mist);skyFill.addColorStop(1,'#04171d');c.fillStyle=skyFill;c.fillRect(0,0,v.width,v.height);
    const moonX=v.width*.74,moonY=v.height*.17,r=Math.min(v.width*.14,75);dot(c,moonX,moonY,r,'#bfe0da22');dot(c,moonX+12,moonY-8,r*.9,sky+'cc');
    const drift=state.cameraX*.09;
    for(let depth=0;depth<3;depth++){
      const spacing=180-depth*24,ground=v.height*(.81+depth*.075),tone=['#1b494b','#173c3c','#10302f'][depth];
      for(let i=-1;i<v.width/spacing+2;i++)tree(c,i*spacing-(drift*(.35+depth*.4)%spacing),ground,v.height*(.58+depth*.12)+Math.sin(i*1.7)*45,12+depth*7,tone,i+depth,t);
    }
    c.save();c.translate(v.width*.53,v.height*.53);
    if(index===0){
      for(let i=-2;i<=2;i++){const x=i*62;line(c,x,85,x*.75,-30,'#235e50',11);leaf(c,x*.75,-30,70,-1.4+i*.45,'#3d866899');dot(c,x*.75,-25,6,'#9bf7ba66');}
      c.strokeStyle='#9bf7ba22';c.lineWidth=2;c.beginPath();c.ellipse(0,92,175,28,0,0,Math.PI*2);c.stroke();
    }else if(index===1){
      for(let i=-2;i<=2;i++){const x=i*80,y=Math.sin(i)*22;line(c,x,130,x,y,'#304c63',9);for(let j=0;j<6;j++)leaf(c,x,y,46,j*Math.PI/3+t*.035,'#6a89ae66');dot(c,x,y,12,'#c5ddff77');for(let j=1;j<=3;j++)ring(c,x,y,15+j*9,'#8ba1d522',1);}
    }else if(index===2){
      for(let i=-2;i<=2;i++){const x=i*64;poly(c,[[x-24,85],[x-20,10],[x,0],[x+20,10],[x+24,85]],'#294b45','#618d7355');leaf(c,x-28,15,62,-.3,'#496c4f');leaf(c,x+28,15,62,-2.8,'#496c4f');dot(c,x,37,7,'#f2c87555');}
      for(let side of [-1,1])line(c,side*173,110,side*93,-98,'#3c5d49',23);
    }else if(index===3){
      for(let side of [-1,1])poly(c,[[side*125,-25],[side*240,-70],[side*290,165],[side*150,130]],'#1d3b4a','#61978e33');
      for(let i=-1;i<=1;i++){c.strokeStyle='#57958a55';c.lineWidth=6;c.beginPath();c.moveTo(-190,20+i*18);c.bezierCurveTo(-90,135+i*18,90,135+i*18,190,20+i*18);c.stroke();}
      for(let i=-3;i<=3;i++)leaf(c,i*40,90+Math.sin(i)*15,42,-.9+i*.3,'#458c6c77');
    }else{
      for(let i=0;i<10;i++){const angle=i*Math.PI/5;line(c,Math.cos(angle)*36,Math.sin(angle)*55,Math.cos(angle)*145,Math.sin(angle)*165,'#6d425c66',13);}
      const glow=c.createRadialGradient(0,0,10,0,0,100);glow.addColorStop(0,'#e85cba33');glow.addColorStop(1,'#e85cba00');c.fillStyle=glow;c.fillRect(-110,-150,220,290);
      poly(c,[[-70,70],[-85,-35],[-40,-95],[42,-95],[82,-35],[68,70]],'#372d4855','#ba77a055');ring(c,0,-2,48,'#da77b933',5);
    }c.restore();
    const fog=c.createLinearGradient(0,v.height*.68,0,v.height);fog.addColorStop(0,'#04171b00');fog.addColorStop(1,'#04171bcc');c.fillStyle=fog;c.fillRect(0,v.height*.68,v.width,v.height*.32);
    for(let i=0;i<35;i++)dot(c,phaseAt(i*137+t*(2+i%3),0,v.width+25),phaseAt(i*83+Math.sin(t*.3+i)*9,0,v.height),i%4===0?1.8:.8,accent+'77');
    return true;
  }
  function draw(name,a,arg){
    const {ctx:c,state,screen,settings}=a,t=settings.reducedMotion?0:state.time;
    if(name==='background')return background(a,t);
    if(name==='platform'){
      const p=arg,s=screen(p.x,p.y);if(!visible(a,s.x+p.w/2,s.y,p.w+70))return true;
      if(p.type==='phase'&&!p.active){c.save();c.setLineDash([5,9]);line(c,s.x,s.y,s.x+p.w,s.y,'#92d3bf55',2);c.setLineDash([]);label(c,'PLANT SEED TO GROW',s.x+p.w/2,s.y+18,'#b1e0ce88',8);c.restore();return true;}
      poly(c,[[s.x,s.y],[s.x+p.w,s.y],[s.x+p.w-9,s.y+p.h],[s.x+20,s.y+p.h+9],[s.x+4,s.y+p.h]],p.type==='phase'?'#355d3c':'#254337','#5a8b6c');
      line(c,s.x+3,s.y+1,s.x+p.w-3,s.y+1,p.type==='moving'?'#ffd68c':'#a4f0b6',4);
      for(let x=15;x<p.w-10;x+=33){leaf(c,s.x+x,s.y+4,23,-.2+(x%3)*.3,'#437553');line(c,s.x+x,s.y+13,s.x+x+15,s.y+p.h-1,'#88b18a44',1);}
      if(p.type==='moving')label(c,'VINE LIFT',s.x+p.w/2,s.y+22,'#ffdda7',9);return true;
    }
    if(name==='enemy'){
      const e=arg;if(!e.alive)return true;const s=screen(e.x,e.y);if(!visible(a,s.x,s.y,250))return true;const boss=e.type==='boss',warning=e.shoot<.45;
      c.save();c.translate(s.x,s.y);if(e.hitFlash>0)c.globalAlpha=.6;
      if(boss){
        const rage=e.hp<e.maxHp*.5,sway=Math.sin(t*(rage?3.5:2))*.1;
        for(const side of [-1,1]){
          for(let i=0;i<3;i++){const x=side*(45+i*17),lift=Math.sin(t*5+i)*6;line(c,side*32,20,x,50+lift,'#648162',12);line(c,x,50+lift,side*(95+i*12),61-i*12,'#415a46',8);dot(c,x,50+lift,5,'#a4cea1');}
          c.save();c.rotate(side*sway);line(c,side*40,-31,side*89,-12,'#527959',19);line(c,side*89,-12,side*111,25,'#37533f',13);leaf(c,side*78,-24,65,side>0?-.9:-2.2,'#78915f');poly(c,[[side*103,10],[side*131,18],[side*114,45]],'#d8d2a0','#808f6d');c.restore();
        }
        poly(c,[[-49,-51],[-25,-75],[24,-75],[51,-49],[43,39],[15,60],[-19,55],[-45,26]],'#415a45','#92b584');
        for(let i=-2;i<=2;i++)leaf(c,i*17,-53,49,-Math.PI/2+i*.24,'#698b58');
        line(c,-27,-40,27,-40,'#152b30',12);dot(c,-15,-40,5,'#f8a5de');dot(c,15,-40,5,'#f8a5de');
        const color=e.shielded?'#b9a0c1':e.heartWarning?'#ffda8b':'#9ff2b1';dot(c,0,2,24,'#172c30');
        if(e.shielded){leaf(c,-27,-10,48,.5,'#7a7783');leaf(c,27,-10,48,2.65,'#7a7783');ring(c,0,0,83,'#c58ab77a',3);}else{dot(c,0,2,18,color);ring(c,0,2,26,color+'88',3);line(c,0,-13,0,17,'#f4fff4',3);}
        label(c,e.shielded?'HEART ARMOURED':e.heartWarning?'BRACING · MOVE':'HEART OPEN · FIRE',0,92,color,10);
      }else if(e.type==='crawler'){
        for(let side of [-1,1])for(let i=-1;i<=1;i++){const x=i*18,step=Math.sin(t*11+i)*5;line(c,x,3,x+side*11,20+step,'#76987a',4);line(c,x+side*11,20+step,x+side*18,22,'#b3c894',2);}
        poly(c,[[-31,5],[-23,-18],[20,-18],[33,5],[12,17],[-16,17]],'#3d6750','#91b894');for(let i=-1;i<=1;i++)leaf(c,i*13,-12,25,-1.7+i*.22,'#7ca068');line(c,-16,-2,18,-2,'#17302f',8);dot(c,10,-2,4,'#f7a0db');
      }else if(e.type==='turret'){
        for(let i=0;i<6;i++)leaf(c,0,0,33,i*Math.PI/3+Math.sin(t*2)*.08,'#827189');line(c,0,18,0,31,'#476953',7);dot(c,0,0,15,'#314742');dot(c,0,0,7,warning?'#ffe5a4':'#f9a2dc');
      }else{
        for(const side of [-1,1]){leaf(c,side*7,-6,39,side>0?-.5-Math.sin(t*16)*.2:-2.65+Math.sin(t*16)*.2,'#74b0a3aa');leaf(c,side*7,5,27,side>0?.5:2.65,'#537f8999');line(c,side*7,-15,side*16,-30,'#a3c5ae',2);}
        poly(c,[[0,-22],[14,-8],[13,13],[0,25],[-13,13],[-14,-8]],'#426c65','#a5e3c5');dot(c,0,-5,7,'#eea5e4');
      }
      if(warning)ring(c,0,0,boss?126:38,'#ffda91',boss?4:2);
      if(boss||e.hp<e.maxHp){const width=boss?200:52,y=boss?-103:-43;c.fillStyle='#102f31';c.fillRect(-width/2,y,width,6);c.fillStyle='#a6ebaf';c.fillRect(-width/2,y,width*Math.max(0,e.hp/e.maxHp),6);}if(boss)label(c,e.name,0,-115,'#e9ffe6',12);c.restore();return true;
    }
    if(name==='hazard'){
      const h=arg,s=screen(h.x,h.y);if(!visible(a,s.x,s.y))return true;const phase=phaseAt(state.time,h.phase,6),off=state.world.objectives[h.control]?.done,active=!off&&phase>=4,warning=!off&&phase>=3.2&&!active,color=off?'#8ed9b4':active?'#ff9be3':warning?'#ffdb92':'#9ae5e2';
      for(let i=0;i<5;i++)leaf(c,s.x,s.y,23,i*Math.PI*2/5+t*.12,'#406b50');dot(c,s.x,s.y,12,'#203d38');dot(c,s.x,s.y,6,color);
      if(active){ring(c,s.x,s.y,27,color+'aa',3);for(let i=0;i<6;i++)dot(c,s.x+Math.cos(i+t)*21,s.y+Math.sin(i+t)*19,4,color+'99');}else if(warning)ring(c,s.x,s.y,25,color,2);
      label(c,off?'CALMED':active?'SPORES ACTIVE':warning?'SPORES RISING':'VENT RESTING',s.x,s.y-35,color,9);return true;
    }
    if(name==='objectives'){
      for(const n of state.world.objectives){const s=screen(n.x,n.y);if(!visible(a,s.x,s.y,145))continue;const listen=n.kind!=='echo'||phaseAt(state.time,n.phase,6)<3,color=n.done?'#aff6bc':listen?'#a4efff':'#ffda91';c.save();c.translate(s.x,s.y);
        line(c,-26,27,26,27,'#668f68',7);
        if(n.kind==='rescue'){
          for(let side of [-1,1])leaf(c,side*23,23,68,side>0?-1.95:-1.2,'#4b7953');poly(c,[[-17,-25],[17,-25],[23,22],[-23,22]],'#294e45','#9dc9a2');dot(c,0,-10,7,'#b0d6ae');line(c,0,-2,0,16,'#87b68a',11);if(!n.done)for(let i=-1;i<=1;i++)line(c,i*11,-29,i*11,23,'#8cc48e',3);
        }else if(n.kind==='seed'){
          if(n.role==='source'){line(c,0,24,0,-13,'#729f74',5);for(let side of [-1,1])leaf(c,0,-3,28,side>0?-.5:-2.7,'#79b989');dot(c,0,-23,12,n.done?'#4c7560':'#b0f1c1');}else{c.strokeStyle='#8db294';c.lineWidth=4;c.beginPath();c.ellipse(0,17,25,10,0,0,Math.PI*2);c.stroke();poly(c,[[-24,18],[24,18],[18,29],[-18,29]],'#405b47');if(n.done)for(let i=-1;i<=1;i++)leaf(c,0,17,51,-Math.PI/2+i*.55,'#93d69c');}label(c,String(n.group+1),0,7,'#f1ffda',12);
        }else if(n.kind==='echo'){
          for(let i=0;i<5;i++)leaf(c,0,-6,35,i*Math.PI*2/5+t*.05,'#618ea1');dot(c,0,-6,14,'#193e4a');dot(c,0,-6,7,color);ring(c,0,-6,23,color+'88',2);label(c,n.done?'ANSWERED':listen?'BLUE · HOLD FIRE':'CALL CHANGING · WAIT',0,-76,color,8);
        }else{
          for(let i=-1;i<=1;i++)line(c,i*7,16,i*18,29,'#6e9772',5);poly(c,[[-20,17],[-24,-18],[0,-40],[24,-18],[20,17]],n.kind==='pod'?'#4c3c58':'#3f6d53',n.kind==='pod'?'#c191c3':'#97c7a1');dot(c,0,-8,12,n.done?'#c9ffc4':n.kind==='pod'?'#eea2de':'#94e8e9');
        }
        if(!n.done){c.strokeStyle='#b8f6db';c.lineWidth=3;c.beginPath();c.arc(0,0,38,-Math.PI/2,-Math.PI/2+Math.PI*2*n.charge/.8);c.stroke();}label(c,n.done?'SECURED':n.label,0,-53,n.done?'#aaf2bf':'#ecfff1',10);c.restore();
      }
      for(const ally of state.world.allies||[]){const s=screen(ally.x+40,ally.y);if(!visible(a,s.x,s.y))continue;dot(c,s.x,s.y-15,8,'#b9e2b7');line(c,s.x,s.y-5,s.x,s.y+15,'#649c78',9);for(const side of [-1,1]){line(c,s.x,s.y+12,s.x+side*8,s.y+28,'#abcbb1',3);leaf(c,s.x,s.y-8,20,side>0?-.9:-2.25,'#8fc99b');}label(c,'ALLY',s.x,s.y-32,'#c0ffd6',8);}
      if(state.world.carriedSeed!==null&&state.world.carriedSeed!==undefined){const s=screen(a.player.x-25,a.player.y-34);dot(c,s.x,s.y,7,'#b7fcae');ring(c,s.x,s.y,11,'#b7fcae77');label(c,'SEED '+(state.world.carriedSeed+1),s.x,s.y-18,'#d5ffd0',8);}
      return true;
    }
    return inherited.draw(name,a,arg);
  }
  root.SpacePilotArt={...inherited,draw,palettes};
})(typeof globalThis!=='undefined'?globalThis:this);
