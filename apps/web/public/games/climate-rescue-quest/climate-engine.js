/* All clocks and motion are active-time based; rendering never controls game rules. */
(function(root){'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),goodKinds=['solar','tree','water','battery','recycle','wind_turbine'],powerKinds=['shield','magnet','freeze','life'];
 function create(levels,{width=900,height=560,random=Math.random}={}){
  let W=width,H=height,events=[];const choose=a=>a[Math.floor(random()*a.length)],s={started:false,paused:false,complete:false,failed:false,won:false,index:0,score:0,startScore:0,time:0,phase:1,collected:0,counts:{},lives:3,hits:0,combo:1,chain:0,shield:1,magnet:1,freeze:1,shieldTimer:0,magnetTimer:0,freezeTimer:0,invuln:0,keys:{},target:null,goodClock:.4,hazardClock:2,powerClock:10,bossClock:5,sequence:0,items:[],particles:[],floats:[],boss:null,stats:{},player:{x:0,y:0,w:0,h:0,vx:0,facing:1}};
  const p=s.player,level=()=>levels[s.index],active=()=>s.started&&!s.paused&&!s.complete&&!s.failed&&!s.won;
  const emit=(kind,data={})=>events.push({kind,...data}),effect=name=>emit('sfx',{name});
  function note(text,x=W/2,y=H*.35,color='#edffb9'){if(s.floats.length>=12)s.floats.shift();s.floats.push({text,x,y,color,age:0,life:1});}
  function burst(x,y,color){for(let i=0;i<10;i++){if(s.particles.length>=120)s.particles.shift();s.particles.push({x,y,vx:(random()-.5)*120,vy:(random()-.5)*120,age:0,life:.5,color});}}
  function resize(w,h){const ow=W,oh=H;W=Math.max(1,w);H=Math.max(1,h);const size=clamp(Math.min(W*.17,H*.22),32,96),ratio=size/(p.w||size);p.x=clamp((p.x||ow*.45)*W/ow,4,W-size-4);p.w=p.h=size;p.y=H-size-12;p.vx*=W/ow;
   for(const list of[s.items,s.particles,s.floats])for(const o of list){o.x*=W/ow;o.y*=H/oh;if(o.w){o.w*=ratio;o.h*=ratio;o.x=clamp(o.x,0,W-o.w);}if(o.vy)o.vy*=H/oh;if(o.vx)o.vx*=W/ow;}
   s.target=null;if(s.boss){s.boss.x=W/2;s.boss.y=Math.min(H*.19,75);}
  }
  resize(W,H);
  function reset(index=0,{score=0}={}){if(!Number.isInteger(index)||!levels[index])throw new RangeError('Unknown climate mission');Object.assign(s,{index,score,startScore:score,started:false,paused:false,complete:false,failed:false,won:false,time:0,phase:1,collected:0,counts:{},lives:3,hits:0,combo:1,chain:0,shield:1,magnet:1,freeze:1,shieldTimer:0,magnetTimer:0,freezeTimer:0,invuln:1,keys:{},target:null,goodClock:.4,hazardClock:2,powerClock:10,bossClock:5,sequence:0,boss:null,stats:{spawned:0,missed:0,blocked:0,hits:0}});for(const a of[s.items,s.particles,s.floats])a.length=0;p.x=(W-p.w)/2;p.y=H-p.h-12;p.vx=0;p.facing=1;events=[];}
  function start(){if(!s.failed&&!s.complete&&!s.won){s.started=true;s.paused=false;}}
  function pause(value=true){s.paused=value;s.keys={};s.target=null;p.vx=0;}
  function aim(x){if(active())s.target=clamp(x,4+p.w/2,W-p.w/2-4);}
  function power(kind){if(!active()||!['shield','magnet','freeze'].includes(kind)||s[kind]<=0||s[kind+'Timer']>0)return false;s[kind]--;s[kind+'Timer']=kind==='shield'?7:kind==='magnet'?8:5;note(kind.toUpperCase()+' ACTIVE');effect(kind);return true;}
  const lanes=()=>W<600?5:7,laneX=lane=>(lane+.5)*W/lanes();
  function spawn(kind,good=true,lane=null,warning=0){if(s.items.length>=24)return null;const size=clamp(Math.min(W*.11,H*.105),24,58),x=laneX(lane??Math.floor(random()*lanes()))-size/2,flight=Math.max(2.1,3.2-s.index*.025),it={kind,good,power:powerKinds.includes(kind),x:clamp(x,2,W-size-2),y:-size,w:size,h:size,vy:(p.y+size)/flight*(good?1:.9),age:0,warning,drift:kind==='pollution_cloud'?Math.min(W*.035,18):0,phase:random()*Math.PI*2};s.items.push(it);s.stats.spawned++;return it;}
  function playerHit(it){if(s.invuln>0)return;if(s.shieldTimer>0){s.shieldTimer=0;s.invuln=.65;s.stats.blocked++;note('SHIELD BLOCK',it.x,it.y);effect('block');return;}s.lives--;s.hits++;s.stats.hits++;s.chain=0;s.combo=1;s.invuln=1.25;s.score=Math.max(0,s.score-75);note('-1 LIFE',it.x,it.y,'#ffd0cb');effect('hit');if(s.lives<=0){s.failed=true;s.started=false;s.keys={};s.target=null;emit('failed');}}
  function collect(it){if(it.power){if(it.kind==='life')s.lives=Math.min(3,s.lives+1);else s[it.kind]=Math.min(3,s[it.kind]+1);note(it.kind.toUpperCase(),it.x,it.y);effect('supply');return;}
   if(!it.good){playerHit(it);burst(it.x,it.y,'#ff8763');return;}
   s.collected++;s.counts[it.kind]=(s.counts[it.kind]||0)+1;s.chain++;s.combo=Math.min(10,1+Math.floor(s.chain/3));const points=80*s.combo;s.score+=points;note('+'+points,it.x,it.y,'#e1ffd3');burst(it.x+it.w/2,it.y+it.h/2,'#8ee6a3');effect(it.kind==='water'?'water':it.kind==='tree'?'tree':'pickup');
   if(s.boss&&s.boss.health>0){s.boss.health--;s.score+=25;effect('strike');if(!s.boss.health){note('SMOG FRONT CLEARED');s.score+=150;s.boss.defeated=true;effect('bossClear');}}
  }
  function intersects(it){const box={x:p.x+p.w*.25,y:p.y+p.h*.18,w:p.w*.5,h:p.h*.72},b={x:it.x+it.w*.15,y:it.y+it.h*.15,w:it.w*.7,h:it.h*.7};return box.x<b.x+b.w&&box.x+box.w>b.x&&box.y<b.y+b.h&&box.y+box.h>b.y;}
  function goals(){return s.time>=level().minDuration&&s.collected>=level().target&&Object.entries(level().quota).every(([k,n])=>(s.counts[k]||0)>=n)&&(!level().boss||s.boss?.defeated);}
  function goalText(){const l=level();return `${Math.min(l.target,s.collected)}/${l.target} eco-actions · ${Object.entries(l.quota).map(([k,n])=>`${k.replace('_',' ')} ${Math.min(n,s.counts[k]||0)}/${n}`).join(' · ')} · ${Math.min(l.minDuration,Math.floor(s.time))}/${l.minDuration}s${l.boss?' · '+(s.boss?s.boss.defeated?'Smog cleared':s.boss.health+' clean strikes left':'Smog front approaching'):''}`;}
  function step(dt){if(!active())return;s.time+=dt;s.phase=Math.min(3,1+Math.floor(s.time/(level().minDuration/3)));for(const k of['shieldTimer','magnetTimer','freezeTimer','invuln'])s[k]=Math.max(0,s[k]-dt);
   const dir=Number(!!s.keys.right)-Number(!!s.keys.left),speed=Math.max(W*.72,240);if(dir){s.target=null;p.vx=dir*speed;}else if(s.target!==null){const dx=s.target-(p.x+p.w/2);p.vx=clamp(dx/dt,-speed,speed);if(Math.abs(dx)<1)p.vx=0;}else p.vx=0;
   if(p.vx)p.facing=p.vx<0?-1:1;p.x=clamp(p.x+p.vx*dt,4,W-p.w-4);
   if((s.goodClock-=dt)<=0){const missing=Object.entries(level().quota).find(([k,n])=>(s.counts[k]||0)<n),kind=missing&&s.sequence%3===0?missing[0]:level().good[s.sequence%level().good.length];spawn(kind,true);s.sequence++;s.goodClock=Math.max(.52,.86-s.index*.009);}
   if((s.hazardClock-=dt)<=0){spawn(choose(level().hazard),false,null,.6);s.hazardClock=Math.max(1.05,2.45-s.index*.035-s.phase*.14)*(s.boss&&!s.boss.defeated?1.25:1);}
   if((s.powerClock-=dt)<=0){spawn(s.lives<3?'life':choose(['shield','magnet','freeze']),true);s.powerClock=12;}
   if(level().boss&&s.phase===3&&!s.boss){s.boss={x:W/2,y:Math.min(H*.19,75),health:level().bossStrikes,maxHealth:level().bossStrikes,age:0,defeated:false};note(level().boss+' APPROACHES');effect('boss');}
   if(s.boss&&!s.boss.defeated){s.boss.age+=dt;if((s.bossClock-=dt)<=0){const first=Math.floor(random()*lanes());spawn(choose(level().hazard),false,first,.95);if(s.index>=14)spawn(choose(level().hazard),false,(first+2)%lanes(),.95);s.bossClock=5.5;}}
   for(let i=s.items.length-1;i>=0;i--){const it=s.items[i];it.age+=dt;if(it.warning>0){it.warning=Math.max(0,it.warning-dt);continue;}it.y+=it.vy*dt*(s.freezeTimer>0?.46:1);it.x=clamp(it.x+Math.sin(it.age*2+it.phase)*it.drift*dt,2,W-it.w-2);
    if(s.magnetTimer>0&&it.good&&!it.power&&Math.hypot(it.x+it.w/2-p.x-p.w/2,it.y+it.h/2-p.y-p.h/2)<Math.max(W*.3,p.w*2)){const f=1-Math.exp(-5*dt);it.x+=(p.x+p.w/2-it.x-it.w/2)*f;it.y+=(p.y+p.h/2-it.y-it.h/2)*f;}
    if(intersects(it)){collect(it);s.items.splice(i,1);if(s.failed)return;}else if(it.y>H+it.h){s.items.splice(i,1);if(it.good&&!it.power){s.stats.missed++;s.chain=0;s.combo=1;}}
   }
   for(const list of[s.particles,s.floats])for(let i=list.length-1;i>=0;i--){const a=list[i];a.age+=dt;if(a.vx!==undefined){a.x+=a.vx*dt;a.y+=a.vy*dt;}else a.y-=20*dt;if(a.age>=a.life)list.splice(i,1);}
   if(goals()){s.complete=true;s.started=false;s.keys={};s.target=null;const bonus=300+s.lives*120+s.combo*50;s.score+=bonus;const stars=s.hits===0&&s.lives===3?3:s.lives>=2&&s.hits<=2?2:1;emit('complete',{stars,bonus});}
  }
  reset();return {state:s,player:p,level,start,reset,pause,aim,power,spawn,collect,playerHit,goals,goalText,step,resize,drain:()=>{const e=events;events=[];return e;},get W(){return W;},get H(){return H;},lanes};
 }
 const api={create,clamp,goodKinds,powerKinds};if(typeof module==='object'&&module.exports)module.exports=api;else root.ClimateEngine=api;
})(typeof window!=='undefined'?window:globalThis);
