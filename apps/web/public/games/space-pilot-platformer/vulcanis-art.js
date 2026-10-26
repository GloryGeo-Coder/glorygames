(function(root){
  'use strict';
  // Canvas-native foundry illustration: no image downloads or runtime assets.
  // Nova and collectible silhouettes retain the established chapter artwork.
  const inherited=root.SpacePilotArt;
  const palettes=[['#150e20','#953f39','#ffb65c'],['#101b28','#4b5266','#ff9854'],['#201525','#925c56','#ffc17a'],['#11192d','#5d3c65','#ff708b'],['#1c102c','#8b304e','#ffb665']];
  const circle=(c,x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
  function poly(c,points,fill,stroke){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
  function line(c,x,y,xx,yy,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
  function visible(a,x,y,m=110){return x>-m&&x<a.view.width+m&&y>-m&&y<a.view.height+m;}
  function gear(c,x,y,r,t,color){c.save();c.translate(x,y);c.rotate(t);for(let i=0;i<8;i++){c.rotate(Math.PI/4);c.fillStyle=color;c.fillRect(r-5,-5,12,10);}circle(c,0,0,r,color);circle(c,0,0,r*.55,'#13202b');circle(c,0,0,r*.19,'#8aa0ac');c.restore();}
  function background(a,t){
    const {ctx:c,view:v,state}=a,index=state.world?.spec.bg||0,[sky,smoke,heat]=palettes[index%5];
    const g=c.createLinearGradient(0,0,0,v.height);g.addColorStop(0,sky);g.addColorStop(.7,smoke);g.addColorStop(1,'#451b28');c.fillStyle=g;c.fillRect(0,0,v.width,v.height);
    // Bounded parallax strata. Towers never repeat at the player's world rate.
    const shift=(state.cameraX||0)*.13;
    circle(c,v.width*.76,v.height*.22,Math.min(90,v.width*.12),'#df8b5c33');
    for(let layer=0;layer<2;layer++)for(let i=-1;i<Math.ceil(v.width/180)+2;i++){
      const x=i*180-(shift*(layer+1)%180),top=v.height*(.4+layer*.15)+Math.sin(i*2.8+index)*45;
      c.fillStyle=layer?'#171b28':'#332637';c.fillRect(x,top,118,v.height-top);
      c.fillRect(x+20,top-30-(i%3)*15,28,60);c.fillRect(x+82,top-62,15,70);
      for(let n=0;n<4;n++){c.fillStyle=layer?'#e57d4b44':'#e99b7e33';c.fillRect(x+15+n*24,top+25,10,5);}
      line(c,x+7,top+62,x+112,top+62,'#73828b33',4);
    }
    // Different machine silhouette for each mission, behind the playable route.
    c.save();c.translate(v.width*.58,v.height*.39);
    if(index===0){poly(c,[[-190,60],[-80,-20],[70,50],[155,70]],'#292030','#7c4b55');line(c,-135,20,110,-48,'#6e6570',8);line(c,110,-48,110,75,'#a0817e',3);gear(c,110,75,22,t*.4,'#60505c');}
    else if(index===1){for(let i=-1;i<=1;i++){c.fillStyle='#31313d';c.fillRect(i*115-26,-80,52,190);line(c,i*115,-70,i*115,90,'#e37b4e',9);}gear(c,0,30,48,t*.25,'#7b6b6d');}
    else if(index===2){c.fillStyle='#243341';c.fillRect(-150,-50,300,150);for(let i=0;i<4;i++){c.fillStyle='#57bfc744';c.fillRect(-130+i*72,-30,48,76);}line(c,-155,105,155,105,'#77929d',8);}
    else if(index===3){for(let i=0;i<3;i++){line(c,-160+i*140,100,-100+i*140,-95,'#786c85',8);circle(c,-100+i*140,-95,25,'#8d536e');circle(c,-100+i*140,-95,12,'#f691ad');}line(c,-140,-58,170,-58,'#c3859b',3);}
    else {circle(c,0,0,112,'#49253c');c.strokeStyle='#d88778';c.lineWidth=12;c.beginPath();c.arc(0,0,98,0,Math.PI*2);c.stroke();for(let i=0;i<8;i++){const r=i*Math.PI/4+t*.08;line(c,Math.cos(r)*76,Math.sin(r)*76,Math.cos(r)*95,Math.sin(r)*95,'#ffbe81',6);}circle(c,0,0,57,'#ff947a33');}
    c.restore();
    const lavaY=v.height*.89;c.fillStyle='#f36a3e';c.fillRect(0,lavaY,v.width,v.height-lavaY);
    for(let i=0;i<14;i++){const x=(i*173+t*(7+i%3))%(v.width+150)-75,y=lavaY+7+(i%4)*13;line(c,x,y,x+42+(i%3)*22,y,heat,2);}
    // Low-count embers, decorative only and frozen by reduced motion.
    for(let i=0;i<22;i++){const x=(i*137+Math.sin(t*.3+i)*15)%(v.width+20),y=v.height-((t*(12+i%5)+i*61)%v.height);circle(c,x,y,1+i%2,heat+'66');}
    const veil=c.createLinearGradient(0,0,0,v.height);veil.addColorStop(0,'#070d1810');veil.addColorStop(1,'#070d1855');c.fillStyle=veil;c.fillRect(0,0,v.width,v.height);return true;
  }
  function draw(name,a,arg){
    const {ctx:c,state,screen,settings}=a,t=settings.reducedMotion?0:state.time;
    if(name==='background')return background(a,t);
    if(name==='platform'){
      const p=arg,s=screen(p.x,p.y);if(!visible(a,s.x+p.w/2,s.y,p.w+80))return true;
      const g=c.createLinearGradient(0,s.y,0,s.y+44);g.addColorStop(0,'#677683');g.addColorStop(.22,'#283d4c');g.addColorStop(1,'#132430');c.fillStyle=g;c.fillRect(s.x,s.y,p.w,38);
      line(c,s.x,s.y+1,s.x+p.w,s.y+1,'#c8dce2',3);line(c,s.x,s.y+9,s.x+p.w,s.y+9,'#0c1724',3);
      for(let x=12;x<p.w;x+=55){poly(c,[[s.x+x,s.y+15],[s.x+x+23,s.y+15],[s.x+x+40,s.y+32],[s.x+x+17,s.y+32]],'#d7994b');circle(c,s.x+x,s.y+5,2,'#eef7ef');}
      if(p.type==='moving'){line(c,s.x+20,s.y+42,s.x+p.w-20,s.y+42,'#73e8ef',3);c.fillStyle='#fff1cf';c.font='bold 12px system-ui';c.textAlign='center';c.fillText('↔',s.x+p.w/2,s.y+29);}
      return true;
    }
    if(name==='enemy'){
      const e=arg;if(!e.alive)return true;const s=screen(e.x,e.y);if(!visible(a,s.x,s.y,200))return true;const boss=e.type==='boss',crawler=e.type==='crawler',warning=e.shoot<.45;
      c.save();c.translate(s.x,s.y);if(e.hitFlash>0)c.globalAlpha=.7;
      if(boss){
        // Armoured pirate command rig: twin engines, scarred hull and visor.
        c.translate(0,Math.sin(t*3)*3);
        for(const side of [-1,1]){poly(c,[[side*52,-35],[side*102,-10],[side*90,48],[side*53,33]],'#354551','#9ea8a7');line(c,side*80,38,side*80,63+Math.sin(t*21)*7,'#ff9466',9);c.fillStyle='#171f2a';c.fillRect(side<0?-106:70,-5,36,17);line(c,side*85,1,side*115,1,'#fe7794',4);}
        poly(c,[[-58,-54],[37,-62],[66,-12],[44,48],[-39,51],[-68,0]],'#435264','#e2b99a');poly(c,[[-40,-32],[28,-43],[41,-17],[-27,-6]],'#ff9a74');line(c,-21,-30,23,-33,'#fff2cf',4);
        circle(c,0,20,19,'#1c2336');gear(c,0,20,14,-t,'#f0928f');line(c,-47,-51,37,40,'#ad7d73',3);
      }else if(crawler){
        for(let i=-1;i<=1;i++){const lift=Math.sin(t*11+i*2)*5;line(c,i*20,-1,i*23+7,18+lift,'#798d9a',5);line(c,i*23+7,18+lift,i*23-2,21,'#e0bb91',3);}
        poly(c,[[-29,-16],[18,-21],[32,-1],[23,11],[-31,8]],'#475767','#b7b3a5');line(c,-17,-12,10,-12,'#ffad74',5);gear(c,25,0,12,t*4,'#9e7b67');
      }else{
        for(const side of [-1,1]){poly(c,[[side*14,-9],[side*35,-17],[side*30,15],[side*14,12]],'#475a67','#b1c0be');line(c,side*26,13,side*26,21+Math.sin(t*19+e.phase)*4,'#ff926b',5);}
        poly(c,[[-18,-19],[12,-22],[24,0],[12,19],[-18,15],[-24,-2]],'#6d5660','#d9c3ad');line(c,-13,-5,14,-5,'#ffb291',6);circle(c,2,8,4,'#0e1a2c');if(e.type==='turret'){line(c,4,7,e.vx<0?-32:32,7,'#d3e3e2',7);}
      }
      if(warning){c.strokeStyle='#ffdd94';c.lineWidth=boss?4:2;c.beginPath();c.arc(0,0,boss?89:37,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-Math.max(0,e.shoot)/.45));c.stroke();}
      if(boss||e.hp<e.maxHp){const width=boss?180:52,y=boss?-85:-40;c.fillStyle='#0a1826';c.fillRect(-width/2,y,width,6);c.fillStyle='#ff9f88';c.fillRect(-width/2,y,width*Math.max(0,e.hp/e.maxHp),6);}
      if(boss){c.fillStyle='#ffe1c6';c.textAlign='center';c.font='bold 12px system-ui';c.fillText(e.name,0,-97);}c.restore();return true;
    }
    if(name==='hazard'){
      const h=arg,s=screen(h.x,h.y);if(!visible(a,s.x,s.y))return true;
      const r=h.w*.62,cycle=h.cycle||3.6,phase=((state.time+h.phase)%cycle+cycle)%cycle,disabled=h.control!==undefined&&state.world.objectives[h.control]?.done,active=!disabled&&phase>=2.2,warning=!disabled&&phase>=1.6&&!active;
      // Hazard timing remains visible even when decorative motion is reduced.
      line(c,s.x,s.y-r-24,s.x,s.y,'#7e8e99',5);
      gear(c,s.x,s.y,r,active?t*6+h.phase:0,active?'#ff8b64':warning?'#ffd68b':'#8196a0');
      circle(c,s.x,s.y,5,active?'#ffe9c2':'#8ef0d7');
      c.strokeStyle=active?'#ffb28d':warning?'#ffdc9d':'#8ef0d777';c.lineWidth=active?3:2;c.beginPath();c.arc(s.x,s.y,r+7,-Math.PI/2,-Math.PI/2+Math.PI*2*(active?1:phase/2.2));c.stroke();
      if(warning||active){c.fillStyle='#fff1dc';c.font='bold 9px system-ui';c.textAlign='center';c.fillText(active?'ACTIVE':'CAUTION',s.x,s.y-r-13);}return true;
    }
    if(name==='objectives'){
      for(const n of state.world.objectives){const s=screen(n.x,n.y);if(!visible(a,s.x,s.y))continue;c.save();c.translate(s.x,s.y);const accent=n.done?'#75eab3':'#8be8f1';
        c.fillStyle='#172b39';c.fillRect(-25,-27,50,56);c.strokeStyle='#a8b9bd';c.lineWidth=2;c.strokeRect(-25,-27,50,56);c.fillStyle=accent;c.fillRect(-17,-18,34,19);
        if(n.kind==='rescue'){circle(c,0,-9,6,'#182b3b');c.fillStyle='#182b3b';c.fillRect(-8,-2,16,4);}
        else if(n.kind==='relay'){line(c,0,-27,0,-46,'#bcd6d7',3);c.strokeStyle=accent;c.beginPath();c.arc(0,-46,13,0,Math.PI);c.stroke();}
        else if(n.kind==='anchor'){gear(c,0,16,14,n.done?0:t,'#b3b4a4');}
        else {line(c,-10,-9,10,-9,'#224552',3);for(let i=0;i<3;i++)circle(c,-12+i*12,14,3,n.done?'#75eab3':'#e4b076');}
        if(!n.done){c.strokeStyle='#a0f4f0';c.lineWidth=3;c.beginPath();c.arc(0,0,36,-Math.PI/2,-Math.PI/2+Math.PI*2*n.charge/.8);c.stroke();}
        c.fillStyle=n.done?'#a4ffd2':'#f5f7ec';c.font='bold 10px system-ui';c.textAlign='center';c.fillText(n.done?'SECURED':n.label,0,-55);c.restore();
      }return true;
    }
    return inherited.draw(name,a,arg);
  }
  root.SpacePilotArt={...inherited,draw,palettes};
})(typeof globalThis!=='undefined'?globalThis:this);
