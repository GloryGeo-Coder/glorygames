/* Observes the field and uses actual captured drag/power pointers. No state mutation. */
function drive(r,{seconds=4000,stopAfter=25,maxRetries=10}={}){
 const result=[],retries=[];let dragging=false;const tap=id=>{r.event(id,'pointerdown',{pointerId:2});r.event(id,'pointerup',{pointerId:2});};r.elements.get('playBtn').click();
 for(let frame=0;frame<seconds*60;frame++){
  const s=r.probe.state,e=r.probe.engine,p=s.player,centre=p.x+p.w/2;
  if(s.failed){retries.push(s.index+1);if(retries.length>maxRetries)return {result,retries,failed:s.index+1,goal:e.goalText()};r.elements.get('playBtn').click();dragging=false;continue;}
  if(s.complete){result.push({id:s.index+1,lives:s.lives,hits:s.hits,score:s.score,seconds:s.time,collected:s.collected,spawned:s.stats.spawned});if(result.length>=stopAfter||s.won)break;r.elements.get('playBtn').click();dragging=false;continue;}
  const factor=s.freezeTimer>0?.46:1,eta=it=>(p.y+p.h*.5-it.y-it.h*.5)/(it.vy*factor)+it.warning;
  const hazards=s.items.filter(it=>!it.good&&eta(it)>-.8&&eta(it)<1.8);
  const risk=(x,t)=>hazards.some(it=>Math.abs(it.x+it.w/2-x)<p.w*.34+it.w*.45&&Math.abs(eta(it)-t)<(p.h*.36+it.h*.35)/(it.vy*factor)+.16);
  const goods=s.items.filter(it=>it.good&&eta(it)>-.2&&it.y<e.H&&(Math.abs(it.x+it.w/2-centre)/Math.max(e.W*.72,240))<eta(it)+.12&&!risk(it.x+it.w/2,eta(it))).sort((a,b)=>eta(a)-eta(b));
  let x=goods[0]?goods[0].x+goods[0].w/2:centre;
  const blockedPath=hazards.some(it=>{const hx=it.x+it.w/2,cross=Math.abs(hx-centre)/Math.max(e.W*.72,240);return hx>Math.min(centre,x)&&hx<Math.max(centre,x)&&Math.abs(eta(it)-cross)<(p.h*.36+it.h*.35)/(it.vy*factor)+.1;});
  if(risk(x,.25)||!goods.length||blockedPath){const safe=Array.from({length:e.lanes()},(_,i)=>(i+.5)*e.W/e.lanes()).filter(v=>!risk(v,.4));if(safe.length)x=safe.sort((a,b)=>Math.abs(a-centre)-Math.abs(b-centre))[0];}
  if(!dragging){r.event('gameCanvas','pointerdown',{pointerId:1,clientX:centre,clientY:100});dragging=true;}
  r.event('gameCanvas','pointermove',{pointerId:1,clientX:x,clientY:100});
  const imminent=risk(centre,.2);if(imminent&&s.shield>0&&!s.shieldTimer)tap('shieldBtn');if(imminent&&s.freeze>0&&!s.freezeTimer&&s.shieldTimer<.5)tap('freezeBtn');if(s.magnet>0&&!s.magnetTimer&&s.items.some(it=>it.good&&!it.power&&it.y>e.H*.6))tap('magnetBtn');
  r.frame(1000/60);
 }
 return {result,retries,failed:r.probe.state.failed,goal:r.probe.engine.goalText()};
}
module.exports={drive};
