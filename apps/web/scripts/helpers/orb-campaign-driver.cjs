/* Autonomous test player uses the same held buttons and actions as a touch player. */
function drive(r,{seconds=7000,stopAfter=25}={}){
 const result=[],keys=new Set();let jumpWait=0;
 const press=(id,on)=>{if(on&&!keys.has(id)){r.event(id,'pointerdown',{pointerId:['leftBtn','rightBtn','jumpBtn','empBtn','dashBtn'].indexOf(id)+1});keys.add(id);}else if(!on&&keys.has(id)){r.event(id,'pointerup',{pointerId:['leftBtn','rightBtn','jumpBtn','empBtn','dashBtn'].indexOf(id)+1});keys.delete(id);}};
 r.elements.get('startBtn').click();
 for(let f=0;f<seconds*60;f++){
  const s=r.probe.state,e=r.probe.engine,p=s.player,l=e.level();if(s.failed)return {result,failed:l.id,health:p.health,orb:s.orb.health,goal:e.goalText(),seconds:f/60};
  if(!s.started&&s.mission.complete){result.push({mission:l.id,score:s.score,health:p.health,orb:s.orb.health,seconds:f/60});if(result.length>=stopAfter||s.won)break;keys.clear();r.elements.get('startBtn').click();continue;}
  if(s.paused){r.elements.get('startBtn').click();keys.clear();}
  const missing=Object.entries(l.collect||{}).filter(([k,n])=>(s.mission.collected[k]||0)<n).map(([k])=>k),targets=[...s.items.filter(it=>missing.includes(it.kind)||it.kind==='health'&&p.health<80||it.kind==='repair'&&s.orb.health<80),...(l.rescue&&s.mission.rescued<l.rescue?s.npcs:[])].filter(o=>o.x<e.W&&o.x+o.w>0).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));
  const target=targets[0],x=target?target.x+target.w*.5:e.W*.27,centre=p.x+p.w/2;
  press('leftBtn',centre>x+6);press('rightBtn',centre<x-6);
  const danger=s.enemyBullets.some(b=>Math.abs(b.x-centre)<e.W*.15&&b.y>p.y-10&&b.y<p.y+p.h)||s.enemies.some(a=>!a.fly&&Math.abs(a.x-centre)<p.w*1.7);
  jumpWait-=1/60;press('jumpBtn',false);if(danger&&p.onGround&&jumpWait<=0&&!target){press('jumpBtn',true);jumpWait=.7;}
  press('empBtn',false);if(p.empCd<=0&&s.enemies.length>=3)press('empBtn',true);
  press('dashBtn',false);if(danger&&p.dashCd<=0)press('dashBtn',true);
  r.frame(1000/60);
 }
 return {result,failed:r.probe.state.failed,goal:r.probe.engine.goalText()};
}
module.exports={drive};
