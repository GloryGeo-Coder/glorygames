(function(root){
  'use strict';
  // Original canvas-native crystal ruins. The established atlas still supplies
  // Nova, pickups and gates; all chapter scenery and adversaries are local art.
  const inherited=root.SpacePilotArt;
  const phaseAt=(time,phase,cycle)=>((time+phase)%cycle+cycle)%cycle;
  const palettes=[['#080f29','#294266','#74e4ee'],['#131032','#423768','#e5b5ff'],['#071f31','#235761','#9ef4d9'],['#171030','#363d76','#9bafff'],['#170d2d','#633e70','#ffbde9']];
  function line(c,x,y,xx,yy,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
  function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
  function circle(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
  function ring(c,x,y,r,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();}
  function crystal(c,x,y,w,h,color){poly(c,[[x,y-h],[x+w*.48,y-h*.3],[x+w*.3,y],[x-w*.35,y],[x-w*.5,y-h*.32]],color,'#bceafa88');poly(c,[[x,y-h],[x+w*.48,y-h*.3],[x,y-h*.18]],'#ecffff55');line(c,x,y-h,x,y-3,'#e4ffff77',1);}
  function visible(a,x,y,m=120){return x>-m&&x<a.view.width+m&&y>-m&&y<a.view.height+m;}
  function background(a,t){
    const {ctx:c,view:v,state}=a,index=state.world?.spec.bg||0,[sky,mist,accent]=palettes[index%5];
    const g=c.createLinearGradient(0,0,0,v.height);g.addColorStop(0,sky);g.addColorStop(.65,mist);g.addColorStop(1,'#09172f');c.fillStyle=g;c.fillRect(0,0,v.width,v.height);
    // A broken halo and subdued aurora anchor the skyline without obscuring play.
    const moonX=v.width*.73,moonY=v.height*.2;circle(c,moonX,moonY,65,accent+'13');ring(c,moonX,moonY,70,accent+'55',3);line(c,moonX-20,moonY-75,moonX+5,moonY-43,sky,12);
    for(let band=0;band<3;band++){c.beginPath();for(let x=0;x<=v.width+20;x+=20){const y=v.height*.17+band*21+Math.sin(x*.006+t*.15+band+index)*23;x?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle=accent+'18';c.lineWidth=11-band*3;c.stroke();}
    const shift=(state.cameraX||0)*.1;
    for(let layer=0;layer<2;layer++)for(let i=-1;i<Math.ceil(v.width/145)+2;i++){
      const x=i*145-(shift*(layer+1)%145),base=v.height*(.72+layer*.12),h=95+Math.sin(i*1.8+index)*45;
      crystal(c,x,base,75,h,layer?'#193951':'#30435f');
      if(i%2===0){c.fillStyle=layer?'#142e46':'#293c55';c.fillRect(x+45,base-h*.7,25,h*.7);poly(c,[[x+40,base-h*.7],[x+77,base-h*.7],[x+72,base-h*.7-14],[x+47,base-h*.7-14]],'#4b6077');line(c,x+56,base-h*.7+12,x+56,base-15,accent+'33',2);}
    }
    // Each mission has a unique landmark: archive, mirror gallery, sanctuary,
    // split-dimensional bridge and the Guardian's luminous prism cathedral.
    c.save();c.translate(v.width*.48,v.height*.46);
    if(index===0){for(let i=-2;i<=2;i++){c.fillStyle='#233a54';c.fillRect(i*58-15,-72+Math.abs(i)*18,30,155);line(c,i*58,-60+Math.abs(i)*18,i*58,58,accent+'44',3);}poly(c,[[-146,-37],[0,-125],[146,-37]],'#304c68','#7594ad');circle(c,0,-56,14,accent+'66');}
    else if(index===1){for(let i=-1;i<=1;i++){c.save();c.translate(i*130,Math.abs(i)*18);c.rotate(Math.PI/4+Math.sin(t*.2+i)*.04);c.fillStyle='#7769a133';c.fillRect(-47,-47,94,94);c.strokeStyle='#d0baf088';c.lineWidth=3;c.strokeRect(-47,-47,94,94);c.restore();}line(c,-165,-50,0,35,accent+'44',3);line(c,0,35,165,-50,accent+'44',3);}
    else if(index===2){c.strokeStyle='#619796';c.lineWidth=17;c.beginPath();c.arc(0,40,100,Math.PI,Math.PI*2);c.stroke();for(const side of [-1,1]){c.fillStyle='#2b515d';c.fillRect(side*100-8,40,16,70);}crystal(c,0,70,55,105,accent+'55');ring(c,0,0,38,accent+'55');}
    else if(index===3){for(let i=-2;i<=2;i++){const y=Math.sin(t*.4+i)*9+i*18;poly(c,[[i*67-28,y],[i*67+32,y],[i*67+21,y+17],[i*67-21,y+17]],'#505682',accent+'77');line(c,i*67,y-55,i*67,y-25,accent+'55',2);}ring(c,0,-45,76,accent+'33',2);}
    else {for(let i=-2;i<=2;i++)crystal(c,i*60,105,75,180-Math.abs(i)*37,'#73568c55');ring(c,0,-15,102,accent+'66',3);for(let i=0;i<6;i++){const r=i*Math.PI/3+t*.08;crystal(c,Math.cos(r)*102,Math.sin(r)*102-15,13,25,accent+'77');}}
    c.restore();
    const fog=c.createLinearGradient(0,v.height*.72,0,v.height);fog.addColorStop(0,'#06102500');fog.addColorStop(1,'#061025bb');c.fillStyle=fog;c.fillRect(0,v.height*.72,v.width,v.height*.28);
    for(let i=0;i<24;i++){const x=(i*149+Math.sin(t*.2+i)*16)%(v.width+20),y=(i*83+t*(2+i%3))%v.height;circle(c,x,y,i%4===0?2:1,accent+'55');}return true;
  }
  function draw(name,a,arg){
    const {ctx:c,state,screen,settings}=a,t=settings.reducedMotion?0:state.time;
    if(name==='background')return background(a,t);
    if(name==='platform'){
      const p=arg,s=screen(p.x,p.y);if(!visible(a,s.x+p.w/2,s.y,p.w+60))return true;const phase=p.type==='phase',off=phase&&p.active===false,accent=phase?(p.warning?'#ffdf91':'#92e6ff'):'#97e8e9';
      c.save();c.globalAlpha=off?.27:1;poly(c,[[s.x,s.y],[s.x+p.w,s.y],[s.x+p.w-12,s.y+p.h],[s.x+12,s.y+p.h]],phase?'#494367':'#233f56','#6e9bab');line(c,s.x+4,s.y+2,s.x+p.w-4,s.y+2,accent,3);
      for(let x=20;x<p.w-10;x+=48){line(c,s.x+x,s.y+11,s.x+x+9,s.y+20,accent+'66',1);line(c,s.x+x+9,s.y+20,s.x+x+18,s.y+11,accent+'66',1);}
      if(phase){c.setLineDash([5,5]);line(c,s.x,s.y-5,s.x+p.w,s.y-5,accent,2);c.setLineDash([]);}c.restore();
      if(phase){c.fillStyle=p.warning?'#ffdf91':'#c7d9ff';c.font='bold 9px system-ui';c.textAlign='center';c.fillText(off?'REFORMING':p.warning?'FADING':'PHASE',s.x+p.w/2,s.y+19);}return true;
    }
    if(name==='enemy'){
      const e=arg;if(!e.alive)return true;const s=screen(e.x,e.y);if(!visible(a,s.x,s.y,200))return true;const boss=e.type==='boss',crawler=e.type==='crawler',warning=e.shoot<.45;
      c.save();c.translate(s.x,s.y);if(e.hitFlash>0)c.globalAlpha=.65;
      if(boss){
        c.translate(0,Math.sin(t*2.7)*4);ring(c,0,0,72,'#c8a3f388',3);
        for(let i=0;i<6;i++){const angle=i*Math.PI/3+t*.23;c.save();c.translate(Math.cos(angle)*74,Math.sin(angle)*60);c.rotate(angle+Math.PI/2);crystal(c,0,18,32,50,i%2?'#907ac7':'#62bbcd');c.restore();}
        poly(c,[[0,-68],[44,-27],[55,26],[0,62],[-55,26],[-44,-27]],'#605b9c','#e6d3ff');poly(c,[[0,-68],[0,62],[-44,-27]],'#82c3df77');poly(c,[[-35,-13],[0,-27],[35,-13],[0,9]],'#e0feff','#a5ffff');circle(c,0,-9,7,'#514b8c');crystal(c,0,45,27,40,'#dd97e3');
      }else if(crawler){
        for(let i=-1;i<=1;i++)for(const side of [-1,1]){const lift=Math.sin(t*9+i*2)*4;line(c,i*18,0,i*22+side*7,16+lift,'#82abbf',4);}
        poly(c,[[-30,3],[-19,-19],[8,-26],[31,-6],[23,12],[-17,15]],'#4a708b','#b8f3ef');for(let i=-1;i<=1;i++)crystal(c,i*14,-7,14,20+6*(i===0),'#a7d7ed');line(c,-15,5,15,5,'#ffd8fa',4);
      }else{
        c.rotate(Math.sin(t*3+e.phase)*.08);for(const side of [-1,1])crystal(c,side*26,12,19,34,'#8c87bf');poly(c,[[0,-28],[22,-3],[0,25],[-22,-3]],'#688cae','#d8faff');poly(c,[[-14,-3],[0,-12],[14,-3],[0,4]],'#faf0ff');circle(c,0,-3,4,'#8551a7');if(e.type==='turret')line(c,0,9,e.vx<0?-32:32,9,'#e4ceff',6);
      }
      if(boss&&e.shielded){
        c.fillStyle='#8ceaff18';c.beginPath();c.ellipse(0,0,107,88,0,0,Math.PI*2);c.fill();c.strokeStyle='#9eeaff';c.lineWidth=3;c.stroke();
        for(let i=0;i<6;i++){const r=i*Math.PI/3;line(c,Math.cos(r)*97,Math.sin(r)*79,Math.cos(r+.16)*97,Math.sin(r+.16)*79,'#edfcff',4);}
        c.fillStyle='#d8f9ff';c.font='bold 10px system-ui';c.textAlign='center';c.fillText('SHIELDED · GROUND 3 ANCHORS',0,107);
      }
      if(warning){c.strokeStyle='#ffdc9a';c.lineWidth=boss?4:2;c.beginPath();c.arc(0,0,boss?91:38,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-Math.max(0,e.shoot)/.45));c.stroke();}
      if(boss||e.hp<e.maxHp){const width=boss?180:52,y=boss?-104:-42;c.fillStyle='#0b1530';c.fillRect(-width/2,y,width,6);c.fillStyle='#e5b4f9';c.fillRect(-width/2,y,width*Math.max(0,e.hp/e.maxHp),6);}
      if(boss){c.fillStyle='#f3e5ff';c.textAlign='center';c.font='bold 12px system-ui';c.fillText(e.name,0,-116);}c.restore();return true;
    }
    if(name==='hazard'){
      const h=arg,s=screen(h.x,h.y);if(!visible(a,s.x,s.y))return true;const cycle=h.cycle||4,phase=((state.time+h.phase)%cycle+cycle)%cycle,disabled=h.control!==undefined&&state.world.objectives[h.control]?.done,active=!disabled&&phase>=2.6,warning=!disabled&&phase>=1.9&&!active,color=active?'#ff87cf':warning?'#ffdb89':'#89d9e3';
      c.save();c.translate(s.x,s.y);c.rotate(active?t*.7:0);crystal(c,0,h.h*.5,h.w,h.h,color);c.restore();ring(c,s.x,s.y,h.w*.7,color,active?3:1);
      if(active){line(c,s.x-h.w*.55,s.y,s.x+h.w*.55,s.y,'#fff1fc',4);line(c,s.x,s.y-h.h*.55,s.x,s.y+h.h*.55,'#fff1fc',3);}
      c.fillStyle=disabled?'#b8e7d4':'#f5eaff';c.font='bold 9px system-ui';c.textAlign='center';c.fillText(disabled?'LINKED':active?'ACTIVE':warning?'CAUTION':'CHARGING',s.x,s.y-h.h*.5-12);return true;
    }
    if(name==='objectives'){
      for(const n of state.world.objectives){const s=screen(n.x,n.y);if(!visible(a,s.x,s.y,240))continue;c.save();c.translate(s.x,s.y);const mirrorPhase=phaseAt(state.time,n.phase||0,4),bridgePhase=phaseAt(state.time,state.world.objectives.indexOf(n),5);
        const blocked=!n.done&&(n.kind==='mirror'?mirrorPhase>=1.9:n.kind==='phase'?bridgePhase>=2.8:false);
        const warning=blocked&&(n.kind==='mirror'?mirrorPhase<2.6:bridgePhase<3.5);
        const accent=n.done?'#9bf6cf':blocked?(warning?'#ffdc8d':'#f59cde'):'#92e6ff';
        poly(c,[[-28,28],[-19,15],[19,15],[28,28]],'#3a526d','#98adce');
        if(n.kind==='mirror'){
          // The reflected ray is a completed, safe optical link, not a laser.
          if(n.done){line(c,-58,-1,0,-1,'#7af3e499',3);line(c,0,-1,140,-110,'#7af3e4',3);circle(c,140,-110,12,'#173b58');ring(c,140,-110,12,'#b5fff4',3);circle(c,140,-110,5,'#e7fff9');}else{ring(c,140,-110,12,'#9c8bb388',2);line(c,129,-110,151,-110,'#bca5ce66',1);}
          c.save();c.rotate(n.done?Math.PI/4:-Math.PI/6);c.fillStyle=accent;c.fillRect(-5,-26,10,52);line(c,5,-24,5,24,'#f2feff',3);c.restore();
        }else if(n.kind==='rescue'){
          poly(c,[[0,-34],[24,-17],[24,20],[-24,20],[-24,-17]],'#315471',accent);circle(c,0,-10,8,accent);poly(c,[[-12,13],[0,0],[12,13]],accent);if(!n.done){line(c,-9,-25,-9,20,'#a7d7ef77',2);line(c,9,-25,9,20,'#a7d7ef77',2);}
        }else if(n.kind==='phase'){
          for(const side of [-1,1])crystal(c,side*20,15,17,44,accent+'99');ring(c,0,-8,16,accent,3);line(c,-10,-8,10,-8,'#f4ecff',3);
        }else if(n.kind==='anchor'){
          for(let i=0;i<3;i++){const r=i*Math.PI*2/3+(n.done?0:t*.3);line(c,0,-4,Math.cos(r)*25,Math.sin(r)*25-4,accent,3);}crystal(c,0,13,24,39,n.done?'#73bca6':'#c891ea');
        }else{poly(c,[[-22,-28],[22,-28],[22,15],[-22,15]],'#344c70',accent);for(let i=0;i<3;i++){line(c,-13,-17+i*10,12-i*3,-17+i*10,accent,2);}crystal(c,0,-30,13,20,accent+'88');}
        if(!n.done&&(n.kind==='mirror'||n.kind==='phase')){
          // Timing is gameplay information, so it remains live in reduced motion.
          circle(c,-36,0,5,accent);ring(c,-36,0,9,accent+'88');
          c.fillStyle=accent;c.font='bold 10px system-ui';c.textAlign='center';
          c.fillText(blocked?(warning?'CAUTION · WAIT':n.kind==='mirror'?'PULSE · WAIT':'REFORMING · WAIT'):'BLUE · HOLD FIRE',0,-70);
        }
        if(!n.done){c.strokeStyle='#b8ffef';c.lineWidth=3;c.beginPath();c.arc(0,0,37,-Math.PI/2,-Math.PI/2+Math.PI*2*n.charge/.8);c.stroke();}
        c.fillStyle=n.done?'#b2ffda':'#f6f4ff';c.font='bold 10px system-ui';c.textAlign='center';c.fillText(n.done?'SECURED':n.label,0,-53);c.restore();
      }return true;
    }
    return inherited.draw(name,a,arg);
  }
  root.SpacePilotArt={...inherited,draw,palettes};
})(typeof globalThis!=='undefined'?globalThis:this);
