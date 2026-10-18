/* Pointer-only campaign player. It observes shipping state and never changes HP, balls or scores. */
function driveCampaign(r,{seconds=900}={}){
 const w=r.probe.state.viewW,results=[];
 r.elements.get('controlMode').value='direct';r.elements.get('controlMode').emit('change');r.elements.get('btnCampaign').click();r.elements.get('btnStart').click();
 const reflect=(x,radius)=>{const span=w-2*radius,a=((x-radius)%(span*2)+span*2)%(span*2);return radius+(a<=span?a:2*span-a);};
 for(let frame=0;frame<seconds*60&&!r.probe.state.gameOver;frame++){
  const c=r.probe.campaign,pad=r.probe.paddle;
  if(r.probe.state.missionCleared){results.push({mission:r.probe.state.missionIndex+1,score:r.probe.state.score,lives:r.probe.state.lives,seconds:frame/60});if(results.length===5)break;r.elements.get('btnStart').click();continue;}
  let targets=c.bricks;
  if(r.probe.state.missionIndex===1)targets=c.relays<3?c.bricks.filter(b=>b.type==='relay'&&!b.active):c.bricks.filter(b=>b.type==='core');
  if(r.probe.state.missionIndex===2)targets=c.bricks.filter(b=>b.type==='pod');
  if(r.probe.state.missionIndex===3)targets=c.enemies.some(a=>a.hp>0)?c.enemies.filter(a=>a.hp>0):c.bricks.filter(b=>b.type==='core');
  if(r.probe.state.missionIndex===4)targets=c.shielded()?c.bricks.filter(b=>b.type==='generator'):c.enemies.filter(a=>a.hp>0);
  const down=r.probe.balls.filter(b=>!b.stuck&&b.vy>0).sort((a,b)=>(pad.y-a.y)/a.vy-(pad.y-b.y)/b.vy)[0],b=down||r.probe.balls[0];let x=pad.x;
  if(b){
   if(b.stuck){const t=targets[0];if(t){x=t.x+t.w/2;r.event('controlZone','pointermove',x);}r.elements.get('btnLaunch').click();}
   else if(down){const t=Math.max(0,(pad.y-pad.h/2-b.r-b.y)/b.vy),landing=reflect(b.x+b.vx*t,b.r),target=[...targets].sort((a,c)=>Math.abs(a.x+a.w/2-landing)-Math.abs(c.x+c.w/2-landing))[0];let aim=target?target.x+target.w/2:landing;
    if(target&&c.enemies.includes(target)){const speed=target.type==='warden'?.65+c.phase(target)*.15:.8,flight=(pad.y-target.y)/Math.max(100,Math.hypot(b.vx,b.vy));aim=w*(.5+Math.sin((c.elapsed+t+flight)*speed+target.phaseOffset)*.27);}
    const angle=target?Math.atan2(aim-landing,pad.y-target.y):0;x=landing-Math.max(-.9,Math.min(.9,angle/(Math.PI*.39)))*pad.w/2;
   }
  }
  if(r.probe.pointer.id===null)r.event('controlZone','pointerdown',x);r.event('controlZone','pointermove',x);r.frame(1000/60);
 }
 return {results,state:r.probe.state,goal:r.probe.campaign.status(),enemies:r.probe.campaign.enemies.map(a=>({type:a.type,hp:a.hp})),bricks:r.probe.bricks.map(b=>b.type)};
}
module.exports={driveCampaign};
