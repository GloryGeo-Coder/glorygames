(function(r,f){const api=f();if(typeof module==='object'&&module.exports)module.exports=api;else r.SpacePilotProgress=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const KEY='wga_space_pilot_campaign_v1';
  const number=(v,min,max,fallback)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):fallback;
  const integer=(v,min,max,fallback)=>Math.floor(number(v,min,max,fallback));
  function settings(raw){return {music:number(raw?.music,0,1,.16),effects:number(raw?.effects,0,1,.75),buttonScale:number(raw?.buttonScale,1,1.25,1),leftHanded:raw?.leftHanded===true,reducedMotion:raw?.reducedMotion===true,aimAssist:raw?.aimAssist===true};}
  function clean(raw,count=8){
    const valid=raw&&raw.version===1;raw=valid?raw:{};
    const completed=Array.from({length:count},(_,i)=>raw.completed?.[i]===true);let prefix=0;while(completed[prefix])prefix++;
    for(let i=prefix;i<count;i++)completed[i]=false;
    const unlocked=Math.min(prefix,count-1),current=integer(raw.current,0,unlocked,0);
    return {version:1,current,unlocked,completed,best:integer(raw.best,0,1e9,0),score:integer(raw.score,0,1e9,integer(raw.run?.score,0,1e9,0)),settings:settings(raw.settings),run:valid&&raw.run&&raw.run.level===current?raw.run:null};
  }
  function load(storage,count){try{const text=storage.getItem(KEY);if(!text||text.length>80000)return clean(null,count);return clean(JSON.parse(text),count);}catch{return clean(null,count);}}
  function save(storage,profile){try{storage.setItem(KEY,JSON.stringify(profile));return true;}catch{return false;}}
  function checkpoint(world,index,offset){
    const p=world.platforms[integer(index,0,world.platforms.length-1,0)];
    if(!p||p.type==='moving'||p.type==='phase'||!Number.isFinite(p.x)||!Number.isFinite(p.y))return null;
    return {platform:world.platforms.indexOf(p),offset:number(offset,24,Math.max(24,p.w-24),Math.min(80,p.w/2)),x:p.x+number(offset,24,Math.max(24,p.w-24),Math.min(80,p.w/2)),y:p.y-29};
  }
  function snapshot(state,point){
    const w=state.world;
    return {level:state.level,score:state.score,health:state.health,shield:state.shield,lives:state.lives,time:state.time,failed:state.status==='ended'&&state.health<=0,point:{platform:point.platform,offset:point.offset},cores:w.cores.map(c=>!!c.taken),pickups:w.pickups.map(p=>!!p.taken),enemies:w.enemies.map(e=>Math.max(0,e.hp)),...(w.objectives?{objectives:w.objectives.map(n=>n.done===true)}:{})};
  }
  function restore(raw,world,level){
    if(!raw||raw.level!==level||!raw.point||!Number.isInteger(raw.point.platform)||raw.point.platform<0||raw.point.platform>=world.platforms.length)return null;
    const point=checkpoint(world,raw.point.platform,raw.point.offset);if(!point)return null;
    const score=integer(raw.score,0,1e9,0),time=number(raw.time,0,86400,0),failed=raw.failed===true;
    const health=number(raw.health,failed?0:1,100,100),shield=number(raw.shield,0,100,0),lives=integer(raw.lives,failed?0:1,3,3);
    world.cores.forEach((c,i)=>{c.taken=raw.cores?.[i]===true;});world.pickups.forEach((p,i)=>{p.taken=raw.pickups?.[i]===true;});
    world.enemies.forEach((e,i)=>{e.hp=number(raw.enemies?.[i],0,e.maxHp,e.maxHp);e.alive=e.hp>0;});
    const cores=world.cores.filter(c=>c.taken).length,enemiesDefeated=world.enemies.filter(e=>!e.alive).length;
    if(world.objectives)world.objectives.forEach((n,i)=>{n.done=raw.objectives?.[i]===true;n.charge=0;});
    world.portal.open=(!world.objectives||world.objectives.every(n=>n.done))&&cores>=world.spec.cores&&world.enemies.every(e=>e.type!=='boss'||!e.alive);
    return {score,time,health,shield,lives,cores,enemiesDefeated,point,failed};
  }
  function scope(key){return {KEY:key,clean,settings,checkpoint,snapshot,restore,load:(storage,count)=>load({getItem:()=>storage.getItem(key)},count),save:(storage,profile)=>save({setItem:(_,value)=>storage.setItem(key,value)},profile)};}
  return {KEY,clean,settings,load,save,checkpoint,snapshot,restore,scope};
});
