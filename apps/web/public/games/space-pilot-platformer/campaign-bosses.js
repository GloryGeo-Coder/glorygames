(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SpacePilotCampaignBosses=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const designs={
    Asterion:{file:'asterion',color:'#f76bdb',names:['Meteor Driller','Salvage Claw','Refuge Stalker','Relay Jammer']},
    Vulcanis:{file:'vulcanis',color:'#ff9854',names:['Ash Skimmer','Mining Breaker','Furnace Scorpion','Spire Destroyer']},
    Luminara:{file:'luminara',color:'#caa2ff',names:['Archive Sphinx','Mirror Manta','Sanctuary Weaver','Phase Sentinel']},
    Cryon:{file:'cryon',color:'#9edfff',names:['Aurora Drifter','Icebreaker','Cryopod Keeper','Coolant Turbine']},
    Verdantis:{file:'verdantis',color:'#93edb0',names:['Canopy Beetle','Echo Mantis','Sanctuary Serpent','Seed Harvester']},
    'NOVA-X':{file:'novax',color:'#f381e4',names:['Breach Breaker','Convoy Interceptor','Reactor Spider','Tether Leviathan']}
  };
  function prepare(chapter){
    const design=designs[chapter.name||'Asterion'];
    if(!design)throw Error('Unknown campaign world');
    return chapter.levels.map((spec,index)=>index===4?spec:{...spec,boss:true,bossName:design.names[index],bossColor:design.color,bossHp:16+Math.floor((chapter.offset||0)/5)*3+index*2,tip:spec.tip+' Defeat '+design.names[index]+' to open the portal.'});
  }
  function build(chapter,levels,index){
    const world=chapter.createLevel(index);
    if(index===4)return world;
    world.spec=levels[index];
    const route=world.platforms.filter(p=>p.type==='ground');
    const arena=route[route.length-3];
    arena.w=world.width-arena.x+80;
    route.slice(-2).forEach(p=>{p.y=arena.y;});
    const spec=world.spec;
    world.enemies.push({x:spec.width-600,y:arena.y-100,homeX:spec.width-600,homeY:arena.y-100,range:125,w:190,h:140,vx:0,hp:spec.bossHp,maxHp:spec.bossHp,type:'boss',name:spec.bossName,bossColor:spec.bossColor,alive:true,shoot:1.6,frame:0,attackAnim:0,hitFlash:0,phase:0,campaignGuardian:true,artIndex:index});
    return world;
  }
  function draw(ctx,img,boss,screen,time,reduced){
    if(!boss.campaignGuardian||!img?.complete||!img.naturalWidth)return false;
    const t=reduced?0:time,pulse=1+Math.sin(t*5)*.025, w=img.naturalWidth/2,h=img.naturalHeight/2;
    ctx.save();ctx.globalAlpha=boss.hitFlash>0?.7:1;ctx.translate(screen.x,screen.y+Math.sin(t*3)*3);
    ctx.drawImage(img,(boss.artIndex%2)*w,Math.floor(boss.artIndex/2)*h,w,h,-110*pulse,-85*pulse,220*pulse,170*pulse);
    if(boss.shoot<.45){ctx.strokeStyle='#ffce83';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,88,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-Math.max(0,boss.shoot)/.45));ctx.stroke();}
    ctx.fillStyle='#0b1530';ctx.fillRect(-90,-101,180,6);ctx.fillStyle=boss.bossColor;ctx.fillRect(-90,-101,180*Math.max(0,boss.hp/boss.maxHp),6);
    ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText(boss.name,0,-112);ctx.restore();return true;
  }
  return {designs,prepare,build,draw};
});
