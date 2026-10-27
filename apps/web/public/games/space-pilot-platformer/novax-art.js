(function(root){
  'use strict';
  // The Citadel extends the existing native renderer while retaining Nova's
  // established atlas, collectible art and portal effect.
  const inherited=root.SpacePilotArt;
  const palettes=[['#030918','#172441','#8be9ff'],['#080e20','#243a53','#a5e5f5'],['#0d0a23','#34264b','#ec9de3'],['#090b26','#253e53','#9ceee7'],['#0d071f','#3a2348','#ee9fdf']];
  const worlds=['Asterion','Vulcanis','Luminara','Cryon','Verdantis'],colors=['#9ddff4','#ffc28e','#c5a8fa','#c1f3ff','#a8efbf'];
  const phaseAt=(time,phase=0,cycle=6)=>{const value=(time+phase)%cycle;return value<0?value+cycle:value;};
  const dot=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
  function line(c,x,y,xx,yy,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
  function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
  function ring(c,x,y,r,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();}
  function label(c,text,x,y,color='#e4f8ff',size=10){c.fillStyle=color;c.textAlign='center';c.font='bold '+size+'px system-ui';c.fillText(text,x,y);}
  function hull(c,x,y,w,h,tone='#3a4b67',edge='#91b7ca'){
    const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,tone);g.addColorStop(1,'#10182d');poly(c,[[x+8,y],[x+w-8,y],[x+w,y+8],[x+w,y+h-8],[x+w-8,y+h],[x+8,y+h],[x,y+h-8],[x,y+8]],g,edge);line(c,x+8,y+4,x+w-8,y+4,'#ecfaff66',1);
  }
  function shuttle(c,x,y,scale=1,active=false){
    c.save();c.translate(x,y);c.scale(scale,scale);poly(c,[[-50,10],[-24,-21],[0,-32],[24,-21],[50,10],[25,21],[-25,21]],'#a6bacb','#e6f3fc');poly(c,[[-24,-11],[0,-25],[24,-11],[17,0],[-17,0]],'#14506f','#91eaff');for(const side of [-1,1]){hull(c,side*25-8,10,16,18,'#38536b');if(active)poly(c,[[side*25-6,28],[side*25+6,28],[side*25,43]],'#9feeffaa');}line(c,-30,9,30,9,'#344f6b',3);c.restore();
  }
  function background(a,t){
    const {ctx:c,view:v,state}=a,index=state.world?.spec.bg||0,[sky,mist,accent]=palettes[index];c.shadowBlur=0;
    const g=c.createLinearGradient(0,0,0,v.height);g.addColorStop(0,sky);g.addColorStop(.64,mist);g.addColorStop(1,'#050b1b');c.fillStyle=g;c.fillRect(0,0,v.width,v.height);
    const drift=state.cameraX*.08;
    for(let i=0;i<70;i++)dot(c,phaseAt(i*137-drift*.2,0,v.width+20),(i*89)%Math.max(1,v.height*.84),i%9===0?1.8:.7,'#c9eafa66');
    // Dark distant towers frame the scene without competing with platforms.
    for(let i=-1;i<v.width/120+2;i++){const x=i*120-(drift%120),h=90+Math.sin(i*1.8)*55;c.fillStyle='#10192b';c.fillRect(x,v.height-h,75,h);line(c,x+7,v.height-h+9,x+7,v.height-8,'#5f729d33',2);for(let k=0;k<3;k++)line(c,x+22,v.height-h+26+k*18,x+54,v.height-h+26+k*18,'#b082cf22',2);}
    c.save();c.translate(v.width*.56,v.height*.4);const size=Math.min(v.width*.27,v.height*.29,170);
    if(index===0){
      for(let i=0;i<5;i++){const angle=i*Math.PI*2/5+t*.025,x=Math.cos(angle)*size*1.35,y=Math.sin(angle)*size*.7;poly(c,[[x-35,y],[x-22,y-30],[x+29,y-23],[x+46,y+15],[x+6,y+34]],'#23344a',colors[i]+'55');line(c,x-20,y+4,x+25,y-8,colors[i]+'88',3);dot(c,x,y-17,4,colors[i]+'99');}
      for(let i=0;i<3;i++)ring(c,0,0,size*(.58+i*.08),accent+(i===1?'66':'22'),i===1?4:2);c.rotate(-.3);line(c,-size,0,size,0,'#b5a0f633',2);
    }else if(index===1){
      for(const side of [-1,1]){hull(c,side*145-35,-size,70,size*2,'#273d58','#7295ad55');line(c,side*145,-size*.8,side*145,size*.8,'#8bdce355',4);}
      for(let i=-1;i<=1;i++)shuttle(c,i*80,Math.sin(i)*32,.6,false);
      c.strokeStyle='#82b4c544';c.setLineDash([7,9]);c.strokeRect(-190,-size,380,size*2);c.setLineDash([]);label(c,'WAYFARER · CONVOY DOCK',0,size+31,'#a6cadb88',11);
    }else if(index===2){
      const glow=c.createRadialGradient(0,0,5,0,0,size);glow.addColorStop(0,'#ed9ae755');glow.addColorStop(1,'#ed9ae700');c.fillStyle=glow;c.fillRect(-size,-size,size*2,size*2);
      for(let i=0;i<8;i++){const angle=i*Math.PI/4;line(c,Math.cos(angle)*size*.48,Math.sin(angle)*size*.48,Math.cos(angle)*size*1.1,Math.sin(angle)*size*1.1,'#58637b66',12);}
      ring(c,0,0,size*.64,'#7c799b88',12);ring(c,0,0,size*.49,'#a5f4ef66',3);poly(c,[[0,-size*.36],[size*.28,0],[0,size*.36],[-size*.28,0]],'#eab4e133','#f0b4e888');
      for(let i=-2;i<=2;i++){const x=i*75;line(c,x,size+20,x,size+95,'#455168',12);line(c,x,size+23,x,size+88,'#a6bee133',3);}
    }else if(index===3){
      for(let i=0;i<5;i++){const angle=-Math.PI/2+i*Math.PI*2/5,x=Math.cos(angle)*size,y=Math.sin(angle)*size;line(c,0,0,x,y,colors[i]+'44',5);ring(c,x,y,25,colors[i]+'77',3);dot(c,x,y,16,colors[i]+'22');label(c,worlds[i],x,y+42,colors[i]+'aa',9);}
      ring(c,0,0,37,'#9eece455',5);dot(c,0,0,12,'#c1fff066');
    }else{
      for(const side of [-1,1]){poly(c,[[side*45,-size],[side*118,-size*.65],[side*154,size*.7],[side*89,size*.95]],'#2a2343','#8e719955');line(c,side*100,-size*.4,side*123,size*.6,'#df95d544',5);}
      for(let i=0;i<3;i++){c.save();c.rotate(t*.045*(i%2?-1:1)+i*.5);c.strokeStyle=i===1?'#f6b2e766':'#aa95de44';c.lineWidth=5;c.beginPath();c.ellipse(0,0,size*(.63+i*.08),size*(.9-i*.04),0,0,Math.PI*2);c.stroke();c.restore();}
      dot(c,0,0,size*.34,'#c67bc622');line(c,-size*.2,-size*.4,size*.13,-size*.1,'#f2bbe955',3);line(c,size*.13,-size*.1,-size*.08,size*.4,'#f2bbe955',3);
    }c.restore();
    const fog=c.createLinearGradient(0,v.height*.72,0,v.height);fog.addColorStop(0,'#050b1b00');fog.addColorStop(1,'#050b1bdd');c.fillStyle=fog;c.fillRect(0,v.height*.72,v.width,v.height*.28);
    for(let i=0;i<15;i++)dot(c,phaseAt(i*173+t*(2+i%3),0,v.width+20),(i*113)%v.height,1,accent+'44');return true;
  }
  const visible=(a,x,y,m=130)=>x>-m&&x<a.view.width+m&&y>-m&&y<a.view.height+m;
  function draw(name,a,arg){
    const {ctx:c,state,screen,settings}=a,t=settings.reducedMotion?0:state.time;
    if(name==='background')return background(a,t);
    if(name==='platform'){
      const p=arg,s=screen(p.x,p.y);if(!visible(a,s.x+p.w/2,s.y,p.w+70))return true;
      if(p.type==='phase'&&p.active===false){c.save();c.setLineDash([6,8]);line(c,s.x,s.y,s.x+p.w,s.y,'#a6c4ee55',2);c.setLineDash([]);label(c,'PHASE RETURNING',s.x+p.w/2,s.y+17,'#c3d8f0aa',8);c.restore();return true;}
      const color=p.warning?'#ffdb92':p.type==='moving'?'#f4d398':colors[Math.floor(p.x/300)%5];hull(c,s.x,s.y,p.w,p.h,'#354961',color+'bb');line(c,s.x+4,s.y+1,s.x+p.w-4,s.y+1,color,4);
      for(let i=15;i<p.w-12;i+=42){c.fillStyle='#c5e1f344';c.fillRect(s.x+i,s.y+9,17,3);line(c,s.x+i,s.y+18,s.x+i+14,s.y+p.h-5,'#88a7c144',1);}if(p.type==='moving')label(c,'TRANSFER LIFT',s.x+p.w/2,s.y+23,color,8);return true;
    }
    if(name==='enemy'){
      const e=arg;if(!e.alive)return true;const s=screen(e.x,e.y);if(!visible(a,s.x,s.y,250))return true;const boss=e.type==='boss',warning=e.shoot<.45;
      c.save();c.translate(s.x,s.y);if(e.hitFlash>0)c.globalAlpha=.6;
      if(boss){
        const lean=Math.sin(t*2)*3;
        poly(c,[[-47,-43],[-87,-13],[-107,71],[-28,48],[27,48],[106,71],[84,-13],[47,-43]],'#252237','#88789e');
        for(const side of [-1,1]){
          line(c,side*18,31,side*29,68,'#56667c',17);hull(c,side*29-12,62,24,21,'#c5d0d9','#e7f5fc');
          c.save();c.rotate(side*Math.sin(t*2)*.05);line(c,side*35,-27,side*67,8+lean,'#8c9eb2',19);hull(c,side*70-13,0+lean,26,36,'#60758c','#c0d1de');dot(c,side*70,31+lean,7,warning?'#ffe5af':'#ef93d9');c.restore();
          hull(c,side*45-19,-47,38,25,'#c8d3df','#f1faff');line(c,side*46,-39,side*57,-37,'#91b5d3',3);
        }
        hull(c,-36,-48,72,88,'#6d8098','#c1d3e3');poly(c,[[-23,-32],[23,-32],[17,17],[-17,17]],'#152a43','#8accea');
        hull(c,-25,-91,50,44,'#d9e5ee','#f8fdff');poly(c,[[-20,-77],[20,-77],[17,-61],[-17,-61]],'#153f5d','#9bdfff');line(c,-13,-69,13,-69,'#9aeaff',4);line(c,0,-91,0,-103,'#bccdda',4);
        const color=e.shielded?'#c4a5da':e.coreWarning?'#ffdc91':'#a0f2ff';dot(c,0,-5,18,'#0b2038');dot(c,0,-5,11,color);ring(c,0,-5,22,color+'88',3);
        if(e.shielded){c.strokeStyle='#cba2df88';c.lineWidth=3;c.beginPath();c.ellipse(0,-5,111,103,0,0,Math.PI*2);c.stroke();}else for(let i=0;i<4;i++){const angle=i*Math.PI/2+t*.7;dot(c,Math.cos(angle)*36,Math.sin(angle)*35-5,3,'#c4faff');}
        label(c,e.shielded?'AEGIS ACTIVE':e.coreWarning?'CORE CLOSING · MOVE':'CORE OPEN · FIRE',0,108,color,10);
      }else if(e.type==='crawler'){
        for(const side of [-1,1])for(let i=-1;i<=1;i++){const x=i*18,lift=Math.sin(t*10+i)*4;line(c,x,4,x+side*9,21+lift,'#9bafc2',4);dot(c,x+side*9,21+lift,3,'#d6ecf8');}
        hull(c,-30,-14,60,31,'#687d93','#c0d4df');hull(c,-18,-28,36,18,'#b9cad8','#e6f6ff');line(c,-17,-1,17,-1,'#112941',7);dot(c,11,-1,5,'#f09cda');
      }else if(e.type==='turret'){
        hull(c,-23,-23,46,43,'#a4b7c8','#e7f6ff');hull(c,-16,-15,32,25,'#273e58','#849fb5');line(c,0,-3,e.vx<0?-37:37,-3,'#c4dce9',9);dot(c,0,-3,7,'#eda0e1');line(c,-25,26,25,26,'#8dabbf',6);
      }else{
        c.rotate(Math.sin(t*3+e.phase)*.07);for(const side of [-1,1]){poly(c,[[side*13,-14],[side*35,-22],[side*39,11],[side*16,16]],'#859bb0','#d4e9f5');poly(c,[[side*24,18],[side*34,18],[side*29,29+Math.sin(t*17)*4]],'#a0ebff');}hull(c,-19,-26,38,51,'#bacad7','#f1faff');dot(c,0,-5,12,'#15314d');dot(c,0,-5,6,'#eca0e1');
      }
      if(warning)ring(c,0,0,boss?127:38,'#ffdc94',boss?4:2);
      if(boss||e.hp<e.maxHp){const width=boss?206:52,y=boss?-124:-44;c.fillStyle='#0c1e35';c.fillRect(-width/2,y,width,6);c.fillStyle='#efb1e1';c.fillRect(-width/2,y,width*Math.max(0,e.hp/e.maxHp),6);}if(boss)label(c,e.name,0,-137,'#f3e8ff',12);c.restore();return true;
    }
    if(name==='hazard'){
      const h=arg,s=screen(h.x,h.y);if(!visible(a,s.x,s.y))return true;const deadCommander=state.world.spec.kind==='finale'&&!state.world.enemies.some(e=>e.type==='boss'&&e.alive),off=deadCommander||state.world.objectives[h.control]?.done,phase=phaseAt(state.time,h.phase,6),active=!off&&phase>=3.8,warning=!off&&phase>=3&&!active,color=off?'#9bdbbf':active?'#fba0e9':warning?'#ffda91':'#a1e7ff';
      hull(c,s.x-17,s.y-17,34,34,'#485b76',color);dot(c,s.x,s.y,8,color);if(active){line(c,s.x-23,s.y-23,s.x+23,s.y+23,color,4);line(c,s.x+23,s.y-23,s.x-23,s.y+23,color,4);}else if(warning)ring(c,s.x,s.y,26,color,2);label(c,off?'ISOLATED':active?'RIFT PULSE':warning?'CAUTION':'FIELD IDLE',s.x,s.y-34,color,9);return true;
    }
    if(name==='objectives'){
      for(const n of state.world.objectives){const s=screen(n.x,n.y);if(!visible(a,s.x,s.y,150))continue;const timed=n.kind==='network'||n.role==='socket',open=!timed||phaseAt(state.time,n.phase,6)<3,color=n.done?'#b6f3c8':open?'#a6edff':'#ffda91';c.save();c.translate(s.x,s.y);
        hull(c,-27,17,54,15,'#536a80','#a0b9c9');
        if(n.kind==='evac'){shuttle(c,0,-7,.65,n.done);label(c,n.done?'ABOARD WAYFARER':'CLEAR PIER · HOLD FIRE',0,-79,color,8);}
        else if(n.kind==='reactor'){
          if(n.role==='source'){hull(c,-18,-26,36,49,'#8fa8bb','#e4f3fb');dot(c,0,-8,11,n.done?'#46637b':'#d4ec9e');line(c,-11,10,11,10,'#294560',4);}else{ring(c,0,-6,24,color,5);for(let i=0;i<4;i++){const angle=i*Math.PI/2;line(c,Math.cos(angle)*16,Math.sin(angle)*16-6,Math.cos(angle)*25,Math.sin(angle)*25-6,'#c1d4e2',5);}dot(c,0,-6,10,n.done?'#caffc7':'#152a42');label(c,n.done?'RELAY ONLINE':open?'BLUE · INSTALL':'COOLING · WAIT',0,-76,color,8);}label(c,String(n.group+1),0,8,'#f4ffe3',11);
        }else if(n.kind==='network'){
          const i=state.world.objectives.indexOf(n);line(c,0,20,0,-22,'#688da4',7);ring(c,0,-14,22,colors[i],4);dot(c,0,-14,13,colors[i]+'55');label(c,n.done?'TETHER STABLE':open?'BLUE · HOLD FIRE':'SIGNAL RISING · WAIT',0,-76,color,8);
        }else if(n.role==='launch'){
          shuttle(c,0,-15,.65,n.done);line(c,-26,14,26,14,color,3);label(c,n.done?'CONVOY HOMEBOUND':'CALL THE WAYFARER',0,-79,color,8);
        }else{
          hull(c,-22,-32,44,55,n.role==='seal'?'#688a92':'#59708b',color);line(c,-12,-12,12,-12,color,4);line(c,0,-24,0,9,color,4);dot(c,0,-12,6,'#112b42');if(n.role==='breaker')for(let i=-1;i<=1;i++)line(c,i*11,3,i*11,13,n.done?'#72b7b7':'#ea9fd8',3);
        }
        if(!n.done){c.strokeStyle='#c0f2ef';c.lineWidth=3;c.beginPath();c.arc(0,0,38,-Math.PI/2,-Math.PI/2+Math.PI*2*n.charge/.8);c.stroke();}label(c,n.done?'SECURED':n.label,0,-53,n.done?'#c3f6d3':'#eff9ff',10);c.restore();
      }
      if(state.world.carriedFuse!==null&&state.world.carriedFuse!==undefined){const s=screen(a.player.x-25,a.player.y-34);hull(c,s.x-5,s.y-9,10,18,'#d8e9b0','#f0ffd3');label(c,'FUSE '+(state.world.carriedFuse+1),s.x,s.y-18,'#e9ffd2',8);}
      return true;
    }
    return inherited.draw(name,a,arg);
  }
  root.SpacePilotArt={...inherited,draw,palettes};
})(typeof globalThis!=='undefined'?globalThis:this);
