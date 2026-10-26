(function(root){
  'use strict';
  // Rectangles measured against the generated atlases. Source pixels retain
  // their alpha; drawing crops frames without altering the artwork files.
  const pilotFrames=[[30,105,280,470],[289,120,330,454],[618,120,318,451],[938,122,310,456],[48,650,265,444],[322,652,301,513],[620,716,315,451],[939,721,309,447]];
  const objects={drone:[[55,25,300,315],[398,25,290,320]],crawler:[[732,20,340,315],[1080,25,365,325]],boss:[[5,365,360,350],[366,365,362,355]],ship:[[728,425,431,270]],pod:[[1170,425,275,270]],platform:[[15,821,580,200]],core:[[605,746,244,305]],shield:[[853,753,275,280]],portal:[[1129,705,315,375]]};
  const devices={asteroid:[[0,0,512,512],[512,0,512,512]],link:[[1024,0,512,512]],salvage:[[0,512,512,512]],relay:[[512,512,512,512]],anchor:[[1024,512,512,512]]};
  const loaded=i=>i?.complete&&i.naturalWidth>0;
  function sprite(ctx,img,rect,x,y,w,h,flip=1,rotation=0){
    if(!loaded(img))return false;ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(flip,1);ctx.drawImage(img,...rect,-w/2,-h/2,w,h);ctx.restore();return true;
  }
  function icon(a,name,x,y,w,h,frame=0,flip=1,rotation=0){return sprite(a.ctx,a.images.chapterObjects,objects[name][frame%objects[name].length],x,y,w,h,flip,rotation);}
  function circle(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  function visible(a,x,y,margin=100){return x>-margin&&x<a.view.width+margin&&y>-margin&&y<a.view.height+margin;}
  function draw(name,a,arg){
    const {ctx,images,state,player,view,settings,screen}=a,w=state.world,t=settings.reducedMotion?0:state.time;
    if(name==='background'){
      const img=images['chapterBg'+(w?.spec.bg||0)];
      if(!loaded(img))return false;
      const scale=Math.max(view.width/img.naturalWidth,view.height/img.naturalHeight),dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
      ctx.drawImage(img,(view.width-dw)/2,(view.height-dh)/2,dw,dh);
      const shade=ctx.createLinearGradient(0,0,0,view.height);shade.addColorStop(0,'#04091a22');shade.addColorStop(.6,'#02061333');shade.addColorStop(1,'#02051077');ctx.fillStyle=shade;ctx.fillRect(0,0,view.width,view.height);
      return true;
    }
    if(name==='pilot'){
      const s=screen(player.x,player.y),running=player.onGround&&Math.abs(player.vx)>35,firing=player.shootCd>.04||state.touch.shoot||state.keys.KeyJ;
      let frame=!player.onGround?(player.vy<0?4:5):firing?6+Math.floor(t*12)%2:running?1+Math.floor(t*13)%3:0;
      ctx.save();if(player.invuln>0)ctx.globalAlpha=.75;
      ctx.shadowColor='#3adfff';ctx.shadowBlur=5;
      const rect=pilotFrames[frame],height=82,width=height*rect[2]/rect[3];
      const rendered=sprite(ctx,images.chapterPilot,rect,s.x,s.y+29-height/2,width,height,player.dir);
      ctx.restore();if(!rendered)return false;
      if(!player.onGround){ctx.save();ctx.strokeStyle='#8bf5ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s.x-player.dir*14,s.y+3);ctx.lineTo(s.x-player.dir*(24+Math.sin(t*30)*5),s.y+20);ctx.stroke();ctx.restore();}
      if(state.shield>0){ctx.strokeStyle='#6af8ccaa';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s.x,s.y-8,32,45,0,0,Math.PI*2);ctx.stroke();}
      return true;
    }
    if(name==='platform'){
      const p=arg,s=screen(p.x,p.y);if(!visible(a,s.x+p.w/2,s.y,p.w+80))return true;
      if(!icon(a,'platform',s.x+p.w/2,s.y+24,p.w+8,64))return false;
      ctx.fillStyle=p.type==='moving'?'#ffd373':'#9cf4ff';ctx.fillRect(s.x+5,s.y,p.w-10,2);
      if(p.type==='moving'){ctx.fillStyle='#ffdf9b';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('↔',s.x+p.w/2,s.y+18);}
      return true;
    }
    if(name==='enemy'){
      const e=arg;if(!e.alive)return true;const s=screen(e.x,e.y);if(!visible(a,s.x,s.y,200))return true;
      ctx.save();const boss=e.type==='boss',warning=e.shoot<.45;
      const frame=boss?(e.attackAnim>0||warning?1:0):Math.floor(t*(e.type==='crawler'?9:4))%2;
      const drawn=icon(a,boss?'boss':e.type==='crawler'?'crawler':'drone',s.x,s.y+(boss?Math.sin(t*3)*4:0),boss?218:e.type==='crawler'?68:62,boss?172:e.type==='crawler'?48:62,frame,e.vx<0?-1:1,boss?Math.sin(t)*.025:e.type==='crawler'?0:Math.sin(t*4+e.phase)*.05);
      if(!drawn){ctx.restore();return false;}
      if(warning){ctx.strokeStyle='#ff83d8';ctx.lineWidth=boss?4:2;ctx.beginPath();ctx.arc(s.x,s.y,boss?85:33,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-e.shoot/.45));ctx.stroke();}
      if(boss||e.hp<e.maxHp){ctx.fillStyle='#111a36';ctx.fillRect(s.x-(boss?90:26),s.y-(boss?100:39),boss?180:52,5);ctx.fillStyle=boss?'#fb4bde':'#ffb98b';ctx.fillRect(s.x-(boss?90:26),s.y-(boss?100:39),(boss?180:52)*Math.max(0,e.hp/e.maxHp),5);}
      if(boss){ctx.fillStyle='#fff0fb';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText(e.name,s.x,s.y-111);}
      ctx.restore();return true;
    }
    if(name==='core'||name==='pickup'){
      const p=arg;if(p.taken)return true;const s=screen(p.x,p.y+Math.sin(t*3+p.phase)*4);if(!visible(a,s.x,s.y))return true;
      ctx.save();ctx.shadowColor=name==='core'?'#63e9ff':'#72ffcc';ctx.shadowBlur=9;
      if(!icon(a,name==='core'||p.type==='time'?'core':'shield',s.x,s.y,30,37,0,1,Math.sin(t*2+p.phase)*.1))circle(ctx,s.x,s.y,12,name==='core'?'#63e9ff':'#72ffcc');
      ctx.restore();return true;
    }
    if(name==='hazard'){
      const h=arg,s=screen(h.x,h.y);if(!visible(a,s.x,s.y))return true;
      if(!sprite(ctx,images.chapterDevices,devices.asteroid[Math.floor(t*.7+h.phase)%2],s.x,s.y,h.w*1.5,h.h*1.5,1,t*.35+h.phase))circle(ctx,s.x,s.y,h.w/2,'#aa755b');return true;
    }
    if(name==='portal'){
      const p=w.portal,s=screen(p.x+p.w/2,p.y+p.h/2);if(!visible(a,s.x,s.y,130))return true;
      ctx.save();ctx.globalAlpha=p.open?1:.48;const used=icon(a,'portal',s.x,s.y,112,145,0,1,Math.sin(t*2)*.015);ctx.restore();
      if(!used)return false;
      ctx.fillStyle=p.open?'#9effd9':'#e5d9ff';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText(p.open?'GATE STABLE':'GATE LOCKED',s.x,s.y+88);return true;
    }
    if(name==='projectile'){
      const s=arg,p=screen(s.x,s.y),length=Math.hypot(s.vx,s.vy)||1;ctx.save();ctx.strokeStyle=s.enemy?'#fc64cf':'#77f5ff';ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=10;ctx.lineWidth=s.enemy?4:3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x-s.vx/length*20,p.y-s.vy/length*20);ctx.lineTo(p.x,p.y);ctx.stroke();circle(ctx,p.x,p.y,2,'#f1ffff');ctx.restore();return true;
    }
    if(name==='objectives'){
      const first=w.platforms[0],ship=screen(160,first.y-52);if(visible(a,ship.x,ship.y,220))icon(a,'ship',ship.x,ship.y,185,110);
      for(const n of w.objectives){const s=screen(n.x,n.y);if(!visible(a,s.x,s.y))continue;
        ctx.save();ctx.globalAlpha=n.done?.5:1;
        if(n.kind==='rescue')icon(a,'pod',s.x,s.y,48,52);
        else {const rect=devices[n.kind][0];if(!sprite(ctx,images.chapterDevices,rect,s.x,s.y,68,74,1,n.kind==='relay'?Math.sin(t*.6)*.04:0))circle(ctx,s.x,s.y,16,n.done?'#6ef3bc':'#66e8ff');}
        ctx.fillStyle=n.done?'#90ffd2':'#f0faff';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(n.done?'SECURED':n.label,s.x,s.y-47);
        if(!n.done){ctx.strokeStyle='#92f9e1';ctx.lineWidth=4;ctx.beginPath();ctx.arc(s.x,s.y,32,-Math.PI/2,-Math.PI/2+Math.PI*2*n.charge/.8);ctx.stroke();}
        ctx.restore();
      }
      return true;
    }
    return false;
  }
  root.SpacePilotArt={draw,pilotFrames,objects};
})(typeof globalThis!=='undefined'?globalThis:this);
