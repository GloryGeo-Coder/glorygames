/* Test player reads the field and operates real captured touch buttons only. */
function drive(r,{seconds=10000,stopAfter=25,maxRetries=20}={}){
 const result=[],keys=new Set(),retries=[];let jumpWait=0;
 const ids=['leftBtn','rightBtn','jumpBtn','empBtn','dashBtn','shootBtn','upFireBtn'];
 const press=(id,on)=>{if(on&&!keys.has(id)){r.event(id,'pointerdown',{pointerId:ids.indexOf(id)+1});keys.add(id);}else if(!on&&keys.has(id)){r.event(id,'pointerup',{pointerId:ids.indexOf(id)+1});keys.delete(id);}};
 r.elements.get('startBtn').click();
 for(let f=0;f<seconds*60;f++){
  const s=r.probe.state,e=r.probe.engine,p=s.player,l=e.level(),centre=p.x+p.w/2;
  if(s.failed){retries.push({mission:l.id,health:p.health,orb:s.orb.health});if(retries.length>maxRetries)return {result,retries,failed:l.id,goal:e.goalText()};keys.clear();jumpWait=0;r.elements.get('startBtn').click();continue;}
  if(!s.started&&s.mission.complete){result.push({mission:l.id,score:s.score,health:p.health,orb:s.orb.health,stats:{...s.stats},revives:s.revives,seconds:f/60});if(result.length>=stopAfter||s.won)break;keys.clear();r.elements.get('startBtn').click();continue;}
  if(s.paused){r.elements.get('startBtn').click();keys.clear();}
  const missing=Object.entries(l.collect||{}).filter(([k,n])=>(s.mission.collected[k]||0)<n).map(([k])=>k);
  const priority=o=>o.kind==='repair'&&s.orb.health<55||o.kind==='health'&&p.health<45?0:o.kind==='life'&&!p.reserves?1:missing.includes(o.kind)?2:3;
  const targets=[...s.items.filter(it=>missing.includes(it.kind)||it.kind==='health'&&p.health<80||it.kind==='repair'&&s.orb.health<90||it.kind==='life'&&!p.reserves||it.kind==='armor'&&p.armor<15||it.kind==='shield'&&p.shield<1),...(l.rescue&&s.mission.rescued<l.rescue?s.npcs:[])].filter(o=>o.x<e.W&&o.x+o.w>0).sort((a,b)=>priority(a)-priority(b)||Math.abs(a.x-centre)-Math.abs(b.x-centre));
  const target=targets[0],orbThreat=l.orb&&s.enemies.some(a=>!a.fly&&a.x<s.orb.x+s.orb.w+e.W*.12);
  let x=target?target.x+target.w*.5:s.boss?(s.boss.ground?s.boss.x-p.w*1.2:s.boss.x+s.boss.w*.5):l.orb?s.orb.x+s.orb.w+p.w*.9:e.W*.45;
  if(s.boss?.ground)x=Math.min(x,s.boss.x-p.w*.8);
  const body=s.enemies.find(a=>!a.fly&&Math.abs(a.x+a.w/2-centre)<p.w*1.4),danger=!!body||s.enemyBullets.some(b=>Math.abs(b.x-centre)<e.W*.12&&b.y>p.y-10&&b.y<p.y+p.h);
  // Reposition away from contact when supplies do not require approaching it.
  if(body&&!target)x=centre+(body.x+body.w/2>centre?-p.w*2:p.w*2);
  press('leftBtn',centre>x+6);press('rightBtn',centre<x-6);
  jumpWait-=1/60;press('jumpBtn',false);if(danger&&p.onGround&&jumpWait<=0){press('jumpBtn',true);jumpWait=.7;}
  const ahead=s.enemies.filter(a=>a.x>p.x+p.w&&a.y+a.h>p.y+p.h*.4&&a.y<p.y+p.h*.4).sort((a,b)=>a.x-b.x)[0],bossAhead=s.boss&&s.boss.ground&&s.boss.x>p.x+p.w&&p.y+p.h*.4>s.boss.y;
  press('shootBtn',p.onGround&&p.facing>0&&bossAhead&&!ahead);press('upFireBtn',!!s.boss&&!s.boss.ground&&centre>s.boss.x+5&&centre<s.boss.x+s.boss.w-5);
  press('empBtn',false);if(p.empCd<=0&&(s.enemies.length>=3||s.boss&&s.boss.warning>0))press('empBtn',true);
  press('dashBtn',false);if(danger&&p.dashCd<=0&&(target||!body))press('dashBtn',true);
  r.frame(1000/60);
 }
 return {result,retries,failed:r.probe.state.failed,goal:r.probe.engine.goalText()};
}
module.exports={drive};
