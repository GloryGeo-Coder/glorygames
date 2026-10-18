/* Responsive combat simulation. All gameplay clocks advance only during active play. */
(function(root){
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const defs={bladeBot:{w:58,h:84,hp:52,speed:1.4,blade:true,score:140},siegeWalker:{w:88,h:98,hp:150,speed:.4,spread:3,score:260},rocketBot:{w:70,h:90,hp:80,speed:.65,mortar:true,score:190},phaseBot:{w:62,h:86,hp:70,speed:1.2,phase:true,score:200},swarmDrone:{w:48,h:42,hp:32,speed:1.5,fly:true,score:100},bomberDrone:{w:86,h:58,hp:88,speed:.55,fly:true,mortar:true,score:200},arcDrone:{w:66,h:64,hp:68,speed:.8,fly:true,spread:3,score:180},interceptor:{w:78,h:42,hp:52,speed:1.7,fly:true,strafe:true,score:160},drone:{w:62,h:56,hp:36,speed:1,fly:true,score:80},scout:{w:54,h:82,hp:46,speed:.8,score:90},shieldBot:{w:70,h:86,hp:70,speed:.6,shield:true,score:150},turret:{w:75,h:68,hp:55,speed:.25,static:true,score:130},repairDrone:{w:58,h:52,hp:46,speed:.7,fly:true,repair:true,score:140},heavyMech:{w:84,h:105,hp:145,speed:.45,score:220},laserDrone:{w:68,h:60,hp:52,speed:.9,fly:true,laser:true,score:170}};
 function rect(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
 function segmentRect(x,y,nx,ny,b,r=0){let lo=0,hi=1;for(const [p,d,min,max]of[[x,nx-x,b.x-r,b.x+b.w+r],[y,ny-y,b.y-r,b.y+b.h+r]]){if(Math.abs(d)<1e-9){if(p<min||p>max)return false;}else{const a=(min-p)/d,c=(max-p)/d;lo=Math.max(lo,Math.min(a,c));hi=Math.min(hi,Math.max(a,c));if(lo>hi)return false;}}return true;}
 function create(levels,{random=Math.random,width=900,height=560}={}){
  let W=width,H=height,U=1,events=[];
  const rand=(a,b)=>a+random()*(b-a),choose=a=>a[Math.floor(random()*a.length)];
  const state={started:false,paused:false,won:false,failed:false,levelIndex:0,score:0,time:0,levelTime:0,wave:1,spawnClock:.6,itemClock:2.5,rescueClock:5,supplyClock:14,goalClock:4,repairClock:4,bossDefeated:false,transition:0,levelStartScore:0,keys:{},autoFire:true,player:{x:0,y:0,w:0,h:0,vx:0,vy:0,health:100,maxHealth:100,reserves:0,armor:0,onGround:true,jumps:0,fireCd:0,dashCd:0,dashT:0,shield:0,empCd:0,weapon:'Blaster',facing:1,invuln:0,anim:0,muzzle:0},orb:{health:100,maxHealth:100,invuln:0,x:0,y:0,w:0,h:0},mission:{kills:0,rescued:0,collected:{},complete:false},enemies:[],bullets:[],enemyBullets:[],items:[],npcs:[],particles:[],floaters:[],effects:[],stats:{},attackClock:0,orbStrikeCd:0,formation:0,lifeDelivered:false,revives:0,boss:null};
  const p=state.player,level=()=>levels[state.levelIndex],groundY=()=>H*.85;
  function emit(kind,data={}){events.push({kind,...data});}
  function note(text,x=p.x,y=p.y,color='#74ffc1'){if(state.floaters.length>=18)state.floaters.shift();state.floaters.push({text,x,y,color,age:0,life:1.1});}
  function particles(x,y,color,count=12){for(let i=0;i<count;i++){if(state.particles.length>=200)state.particles.shift();state.particles.push({x,y,vx:rand(-120,120)*U,vy:rand(-140,70)*U,r:rand(1,3)*U,color,age:0,life:rand(.3,.7)});}}
  function effect(kind,x,y,size=60*U){if(state.effects.length>=24)state.effects.shift();state.effects.push({kind,x,y,size,age:0,life:kind==='emp'? .6:.4});}
  function resize(w,h){
   const ow=W,oh=H,oldU=U;W=Math.max(1,w);H=Math.max(1,h);U=clamp(Math.min(W/600,H/480),.35,1);
   for(const list of[state.enemies,state.items,state.npcs,state.bullets,state.enemyBullets,state.particles,state.floaters,state.effects])for(const o of list){o.x*=W/ow;o.y*=H/oh;if('vx'in o)o.vx*=W/ow;if('vy'in o)o.vy*=H/oh;if(o.w){o.w*=U/oldU;o.h*=U/oldU;}if(o.r)o.r*=U/oldU;if(o.size)o.size*=U/oldU;if(o.gravity)o.gravity*=H/oh;if(o.baseY!==undefined)o.baseY*=H/oh;if(o.aim){o.aim.x*=W/ow;o.aim.y*=H/oh;}if(o.ground)o.y=groundY()-o.h;}
   p.x=clamp((p.x||ow*.18)*W/ow,8,W-64*U-8);p.y*=H/oh;p.w=64*U;p.h=96*U;p.vx*=W/ow;p.vy*=H/oh;if(p.onGround)p.y=groundY()-p.h;else p.y=clamp(p.y,0,groundY()-p.h);
   Object.assign(state.orb,{x:W*.48-35*U,y:groundY()-75*U,w:70*U,h:70*U});
   if(state.boss){const b=state.boss;b.w=185*U;b.h=175*U;b.x=W-b.w-18*U;b.y=b.ground?groundY()-b.h:H*.35;b.baseY=b.y;if(b.aim){b.aim.x*=W/ow;b.aim.y*=H/oh;}}
  }
  resize(W,H);
  function reset(index=0,{score=0}={}){
   if(!Number.isInteger(index)||!levels[index])throw new RangeError('Unknown mission');
   Object.assign(state,{levelIndex:index,started:false,paused:false,won:false,failed:false,score,levelStartScore:score,levelTime:0,time:0,wave:1,spawnClock:.7,itemClock:4,rescueClock:5,supplyClock:14,goalClock:3,repairClock:4,attackClock:0,orbStrikeCd:0,formation:0,lifeDelivered:false,revives:0,stats:{spawned:0,peakEnemies:0,shotsTaken:0,damageTaken:0,types:{},bossShots:0},bossDefeated:false,transition:0,boss:null,mission:{kills:0,rescued:0,collected:{},complete:false},keys:{}});
   for(const a of[state.enemies,state.bullets,state.enemyBullets,state.items,state.npcs,state.particles,state.floaters,state.effects])a.length=0;
   Object.assign(p,{x:W*.16,y:groundY()-p.h,vx:0,vy:0,health:100,reserves:0,armor:0,onGround:true,jumps:0,fireCd:0,dashCd:0,dashT:0,shield:0,empCd:0,weapon:level().weapon,facing:1,invuln:1.5,anim:0,muzzle:0});state.orb.health=100;state.orb.invuln=0;events=[];
  }
  const active=()=>state.started&&!state.paused&&!state.failed&&!state.won&&!state.mission.complete;
  function start(){if(!state.failed&&!state.won&&!state.mission.complete){state.started=true;state.paused=false;}}
  function pause(value=true){state.paused=value;state.keys={};p.vx=0;}
  function jump(){if(!active())return;if(p.onGround||p.jumps<2){p.vy=-650*U;p.onGround=false;p.jumps++;emit('sfx',{name:'jump'});}}
  function dash(){if(!active()||p.dashCd>0)return;p.dashCd=1.5;p.dashT=.2;p.invuln=Math.max(p.invuln,.35);emit('sfx',{name:'dash'});}
  function emp(){if(!active()||p.empCd>0)return;p.empCd=8;for(const e of state.enemies)e.stun=2.2;if(state.boss){state.boss.stun=.9;state.boss.open=2.4;state.boss.warning=0;state.boss.fire=1.2;}state.enemyBullets.length=0;effect('emp',p.x+p.w/2,p.y+p.h/2,280*U);note('EMP BLAST',W*.5,H*.4);particles(W*.5,H*.4,'#74ffc1',36);emit('sfx',{name:'emp'});}
  function shoot(forceUp=false,assist=false){
   if(!active()||p.fireCd>0)return false;
   const up=forceUp||state.keys.up,weapon=p.weapon,spd=Math.max(W*.95,880*U),damage=weapon==='Plasma'?30:weapon==='Pulse'?26:weapon==='Laser'?20:weapon==='Spread'?17:16;
   let angle=up?-Math.PI/2:p.facing>0?0:Math.PI;
   if(assist&&!up){const targets=[...state.enemies.filter(e=>e.x+e.w>0&&e.x<W),...(state.boss?[state.boss]:[])];const t=targets.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(t){angle=Math.atan2(t.y+t.h*.5-(p.y+p.h*.4),t.x+t.w*.5-(p.x+p.w*.5));p.facing=Math.cos(angle)<0?-1:1;}}
   const color=weapon==='Plasma'?'#ff4dbd':weapon==='Pulse'?'#74ffc1':weapon==='Spread'?'#ffd76d':'#45dcff';
   for(const offset of weapon==='Spread'?[-.14,0,.14]:[0]){if(state.bullets.length>=80)state.bullets.shift();state.bullets.push({x:p.x+p.w*.5,y:p.y+p.h*.4,vx:Math.cos(angle+offset)*spd,vy:Math.sin(angle+offset)*spd,r:Math.max(2.5,5*U),damage:damage*(assist?.9:1),color,life:2.4});}
   p.fireCd=(weapon==='Laser'?.13:weapon==='Pulse'?.16:.2)*(assist?1.1:1);p.muzzle=.07;emit('sfx',{name:up?'shootUp':'shoot'});return true;
  }
  function spawnEnemy(type=choose(level().enemies),side=1){
   if(state.enemies.length>=Math.min(22,14+Math.floor(state.levelIndex/3)))return null;const d=defs[type]||defs.drone,hp=d.hp*(1+state.levelIndex*.012);
   const e={...d,type,w:d.w*U,h:d.h*U,hp,maxHp:hp,x:side>0?W+30*U:-d.w*U-30*U,side,entry:1.2,y:0,age:0,stun:0,fire:rand(.8,1.8),warning:0,ground:!d.fly,repairBudget:35,repairClock:1.5,orbAttack:1.5};e.y=d.fly?rand(H*.24,H*.57):groundY()-e.h;e.baseY=e.y;state.enemies.push(e);state.stats.spawned++;state.stats.types[type]=(state.stats.types[type]||0)+1;state.stats.peakEnemies=Math.max(state.stats.peakEnemies,state.enemies.length);return e;
  }
  function spawnItem(kind='energy',x=W+20*U){if(state.items.length>=14)return null;const item={kind,x,y:groundY()-42*U,w:32*U,h:32*U,age:0,ground:true};state.items.push(item);return item;}
  function spawnNpc(){if(state.npcs.length>=4)return null;const n={x:W+20*U,y:groundY()-68*U,w:45*U,h:68*U,age:0,ground:true};state.npcs.push(n);return n;}
  function spawnBoss(){
   if(!level().boss||state.boss||state.bossDefeated)return;
   const family=level().bossFamily||'core',ground=family==='goliath'||family==='weaver',hp=level().bossHealth||800;
   state.boss={x:W-203*U,y:ground?groundY()-175*U:H*.35,baseY:H*.35,w:185*U,h:175*U,health:hp,maxHealth:hp,phase:1,family,ground,fire:2,warning:0,stun:0,open:0,age:0};
   if(state.levelIndex===24){state.enemyBullets.length=0;p.health=Math.min(100,p.health+15);state.orb.health=Math.min(100,state.orb.health+10);}
   note(level().boss+' ONLINE',W*.5,H*.25,'#ff5b7c');emit('sfx',{name:'boss'});
  }
  function collectItem(it){
   state.mission.collected[it.kind]=(state.mission.collected[it.kind]||0)+1;state.score+=90;
   if(it.kind==='health')p.health=Math.min(100,p.health+20);if(it.kind==='shield')p.shield=Math.min(9,p.shield+3.5);
   if(it.kind==='energy'){p.health=Math.min(100,p.health+3);p.empCd=Math.max(0,p.empCd-.8);}
   if(it.kind==='life')p.reserves=Math.min(1,p.reserves+1);if(it.kind==='armor')p.armor=Math.min(35,p.armor+25);
   if(it.kind==='weapon'){const order=['Blaster','Laser','Plasma','Spread','Pulse'];p.weapon=order[Math.min(4,order.indexOf(p.weapon)+1)];}
   if(it.kind==='emp')p.empCd=Math.max(0,p.empCd-4);if(it.kind==='repair')state.orb.health=Math.min(100,state.orb.health+28);
   note(it.kind.toUpperCase(),it.x,it.y,'#ffd76d');particles(it.x,it.y,'#ffd76d');emit('sfx',{name:'pickup'});
  }
  function fail(reason){if(!active())return;state.failed=true;state.started=false;state.keys={};emit('failed',{reason});}
  function damagePlayer(amount){
   if(!active()||p.invuln>0)return;
   if(p.shield>0){p.shield=Math.max(0,p.shield-amount*.09);p.invuln=.2;emit('sfx',{name:'shield'});return;}
   const absorbed=Math.min(p.armor,amount*.6);p.armor-=absorbed;amount-=absorbed;
   p.health=Math.max(0,p.health-amount);state.stats.shotsTaken++;state.stats.damageTaken+=amount;p.invuln=1;note('-'+Math.ceil(amount),p.x,p.y,'#ff5b7c');emit('sfx',{name:'hit'});
   if(!p.health){if(p.reserves){p.reserves--;state.revives++;p.health=45;p.invuln=2.5;state.enemyBullets.length=0;effect('emp',p.x+p.w/2,p.y+p.h/2,180*U);note('RESERVE LIFE',p.x,p.y);emit('sfx',{name:'shield'});}else fail('Your defender armour failed.');}
  }
  function damageOrb(amount){if(!active()||!level().orb||state.orb.invuln>0)return;state.orb.invuln=.35;state.orb.health=Math.max(0,state.orb.health-amount);emit('sfx',{name:'shield'});if(!state.orb.health)fail('The Neon Orb was destabilised.');}
  function enemyDefeated(e){const i=state.enemies.indexOf(e);if(i<0)return;state.enemies.splice(i,1);state.mission.kills++;state.score+=e.score;particles(e.x+e.w/2,e.y+e.h/2,'#ff6ba6',10);effect('boom',e.x+e.w/2,e.y+e.h/2,Math.max(e.w,e.h)*1.4);if(random()<.15)spawnItem(choose(['energy','health','shield','emp','armor']),e.x);emit('sfx',{name:'boom'});}
  function fireEnemy(e,boss=false){
   const x=e.x+e.w*.5,y=boss&&e.family==='goliath'?groundY()-18*U:e.y+e.h*.5,angle=boss&&e.family==='goliath'?(e.aim.x<x?Math.PI:0):Math.atan2(e.aim.y-y,e.aim.x-x),speed=Math.max(W*.27,255*U);
   const mortar=e.mortar||boss&&e.family==='weaver',count=mortar?1:boss?(e.family==='goliath'?2+e.phase:2+e.phase*1):(e.spread||1);
   for(let k=0;k<count;k++){
    if(state.enemyBullets.length>=128)state.enemyBullets.shift();
    const a=angle+(k-(count-1)/2)*(boss?.19:.2),damage=boss?8+e.phase:6+Math.floor(state.levelIndex/12),gravity=mortar?500*U:0;
    // Mortars use a fixed, visible landing snapshot. They never follow the player.
    const flight=1.2,vx=mortar?(e.aim.x-x)/flight:Math.cos(a)*speed,vy=mortar?(e.aim.y-y-.5*gravity*flight*flight)/flight:Math.sin(a)*speed;
    state.enemyBullets.push({x,y,vx,vy,gravity,mortar,r:Math.max(2.5,(mortar?8:4)*U),damage,life:mortar?2.2:5,color:e.laser?'#b68cff':'#ff5b7c'});
    if(boss)state.stats.bossShots++;
   }
   if(boss&&e.family==='goliath')e.charge=.45;
   if(e.blade||e.phase)e.rush=.65;
  }
  function attack(e,dt,boss=false){
   if(e.stun>0||e.entry>0)return;
   if(e.warning>0){e.warning-=dt;if(e.warning<=0){fireEnemy(e,boss);e.fire=boss?Math.max(1.25,2.4-e.phase*.3):e.static?2.4:2.2+rand(0,.9);}}
   else if((e.fire-=dt)<=0&&e.x<W-e.w*.2&&e.x+e.w>e.w*.2&&(boss||state.attackClock<=0&&state.enemies.filter(a=>a.warning>0).length<(state.levelIndex<8?2:3))){if(!boss)state.attackClock=state.levelIndex<8?.4:.32;const target=level().orb&&random()<.12?state.orb:p;e.aim={x:target.x+target.w*.5,y:target.y+target.h*.5};e.warning=boss?.9:e.mortar?.95:.65;}
  }
  function completeGoals(){const l=level(),m=state.mission;return state.levelTime>=l.minDuration&&(!l.kills||m.kills>=l.kills)&&(!l.rescue||m.rescued>=l.rescue)&&Object.entries(l.collect||{}).every(([k,n])=>(m.collected[k]||0)>=n)&&(!l.boss||state.bossDefeated);}
  function goalText(){const l=level(),m=state.mission,parts=[`Wave ${state.wave}/3`,`${Math.min(l.minDuration,Math.floor(state.levelTime))}/${l.minDuration}s`];if(l.kills)parts.push(`Kills ${m.kills}/${l.kills}`);if(l.rescue)parts.push(`Rescues ${m.rescued}/${l.rescue}`);for(const[k,n]of Object.entries(l.collect||{}))parts.push(`${k} ${m.collected[k]||0}/${n}`);if(l.boss)parts.push(state.boss?`${l.boss} ${Math.ceil(state.boss.health/state.boss.maxHealth*100)}%`:state.bossDefeated?'Boss defeated':'Boss arrives in wave 3');return parts.join(' · ');}
  function step(dt){
   if(!state.started||state.paused||state.failed||state.won)return;
   if(state.mission.complete){state.transition=Math.max(0,state.transition-dt);if(!state.transition&&state.started){state.started=false;emit('complete',{stars:state.revives?1:p.health>=80&&(!level().orb||state.orb.health>=80)?3:p.health>=50&&(!level().orb||state.orb.health>=50)?2:1});}return;}
   state.time+=dt;state.levelTime+=dt;state.attackClock=Math.max(0,state.attackClock-dt);state.orbStrikeCd=Math.max(0,state.orbStrikeCd-dt);state.orb.invuln=Math.max(0,state.orb.invuln-dt);const wave=Math.min(3,1+Math.floor(state.levelTime/(level().minDuration/3)));if(wave!==state.wave){state.wave=wave;p.health=Math.min(100,p.health+6);state.orb.health=Math.min(100,state.orb.health+6);note(`WAVE ${wave}`,W*.5,H*.25);emit('sfx',{name:'level'});}
   for(const k of['fireCd','dashCd','dashT','shield','empCd','invuln','muzzle'])p[k]=Math.max(0,p[k]-dt);p.anim+=dt;
   const dir=Number(!!state.keys.right)-Number(!!state.keys.left);if(dir)p.facing=dir;
   p.vx=(p.dashT>0?(dir||p.facing)*2.3:dir)*Math.max(W*.34,290*U);
   if(state.keys.shoot||state.keys.upFire||state.autoFire)shoot(state.keys.upFire, state.autoFire&&!state.keys.shoot&&!state.keys.upFire);
   p.vy+=1500*U*dt;p.x=clamp(p.x+p.vx*dt,8,W-p.w-8);p.y+=p.vy*dt;if(p.y+p.h>=groundY()){p.y=groundY()-p.h;p.vy=0;p.onGround=true;p.jumps=0;}else p.onGround=false;
   if((state.spawnClock-=dt)<=0){
    const pool=level().enemies,air=pool.filter(t=>defs[t].fly),ground=pool.filter(t=>!defs[t].fly),f=state.formation++;
    // Alternating cohorts guarantee both kinds in every mission, including the opening wave.
    const group=f%2?air:ground,lead=group[Math.floor(f/2)%group.length];spawnEnemy(lead);
    if((f%3===2||state.wave>1)&&!(state.boss&&state.levelIndex===24)){const extra=pool[(f*3+state.wave)%pool.length];spawnEnemy(extra,state.levelIndex>=6&&f%4===3?-1:1);}
    if(state.levelIndex>=16&&state.wave===3&&f%4===0&&!(state.boss&&state.levelIndex===24))spawnEnemy(air[f%air.length]);
    state.spawnClock=level().spawnRate*(state.wave===1?1.1:state.wave===2?.95:.85)*(state.boss?(state.levelIndex===24?2.6:1.6):state.bossDefeated?1.35:1);
   }
   if((state.goalClock-=dt)<=0){const missing=Object.entries(level().collect||{}).filter(([k,n])=>(state.mission.collected[k]||0)<n);if(missing.length)spawnItem(missing[Math.floor(state.levelTime/6)%missing.length][0]);state.goalClock=6;}
   if((state.supplyClock-=dt)<=0){spawnItem(p.health<60?'health':choose(['energy','shield','weapon','emp','armor']));if(level().orb&&state.orb.health<80)spawnItem('repair',W*.82);state.supplyClock=14;}
   if(!state.lifeDelivered&&state.levelTime>=level().minDuration*.5){spawnItem('life');state.lifeDelivered=true;}
   if(level().rescue&&(state.rescueClock-=dt)<=0){spawnNpc();state.rescueClock=8;}
   if(level().boss&&state.wave===3&&!state.bossDefeated)spawnBoss();
   for(const e of [...state.enemies]){
    e.age+=dt;e.entry=Math.max(0,e.entry-dt);e.rush=Math.max(0,(e.rush||0)-dt);e.stun=Math.max(0,e.stun-dt);
    if(e.stun<=0){const ox=state.orb.x+state.orb.w;const atOrb=level().orb&&!e.fly&&e.x<=ox&&e.x>state.orb.x;if(atOrb){if((e.orbAttack-=dt)<=0){if(state.orbStrikeCd<=0){damageOrb(4);state.orbStrikeCd=1.25;}e.orbAttack=2.5;}}else e.x-=e.side*Math.max(W*.065,75*U)*e.speed*(e.rush>0?2.5:1)*dt;
     if(e.fly)e.y=clamp(e.baseY+Math.sin(e.age*(e.strafe?4:2.4))*(e.strafe?32:12)*U,H*.18,groundY()-e.h-8*U);attack(e,dt);
     if(e.repair&&e.repairBudget>0&&(e.repairClock-=dt)<=0){e.repairClock=1.5;const t=state.enemies.find(o=>o!==e&&o.hp<o.maxHp&&Math.abs(o.x-e.x)<180*U);if(t){const amount=Math.min(7,e.repairBudget,t.maxHp-t.hp);t.hp+=amount;e.repairBudget-=amount;}}
    }
    if(e.side>0?e.x<-e.w-40:e.x>W+e.w+40){state.enemies.splice(state.enemies.indexOf(e),1);continue;}
    if(e.entry<=0&&rect(e,p)){damagePlayer(e.type==='heavyMech'||e.type==='siegeWalker'?10:e.blade?10:7);e.hp-=12*dt;}
    if(e.hp<=0)enemyDefeated(e);if(!active())return;
   }
   const boss=state.boss;if(boss){boss.age+=dt;boss.open=Math.max(0,(boss.open||0)-dt);boss.charge=Math.max(0,(boss.charge||0)-dt);boss.stun=Math.max(0,boss.stun-dt);boss.phase=boss.health/boss.maxHealth<.33?3:boss.health/boss.maxHealth<.66?2:1;boss.y=boss.ground?groundY()-boss.h:clamp(boss.baseY+Math.sin(boss.age*(boss.family==='manta'?1.3:.8))*35*U,40*U,groundY()-boss.h);if(boss.charge>0){boss.x=clamp(boss.x-100*U*dt,p.w*2,W-boss.w);}else boss.x+=(W-boss.w-18*U-boss.x)*dt;attack(boss,dt,true);if(rect(boss,p))damagePlayer(13);}
   for(let i=state.bullets.length-1;i>=0;i--){const b=state.bullets[i],nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;b.life-=dt;const target=[...state.enemies,...(state.boss?[state.boss]:[])].filter(e=>segmentRect(b.x,b.y,nx,ny,e,b.r)).sort((a,c)=>Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(c.x-b.x,c.y-b.y))[0];
    if(target){const bossHit=target===state.boss,damage=b.damage*(target.shield?.6:1)*(bossHit&&target.family==='core'&&target.open<=0&&target.warning>0?.5:1);if(bossHit){target.health-=damage;particles(nx,ny,'#e879f9',4);if(target.health<=0){state.boss=null;state.bossDefeated=true;p.health=Math.min(100,p.health+20);state.orb.health=Math.min(100,state.orb.health+12);state.score+=2000;state.enemyBullets.length=0;note(level().boss+' DISABLED',W*.5,H*.35,'#ffd76d');emit('sfx',{name:'boom'});}}else{target.hp-=damage;if(target.hp<=0)enemyDefeated(target);}state.bullets.splice(i,1);}
    else{b.x=nx;b.y=ny;if(b.life<=0||b.x<-30||b.x>W+30||b.y<-30||b.y>H+30)state.bullets.splice(i,1);}
   }
   for(let i=state.enemyBullets.length-1;i>=0;i--){const b=state.enemyBullets[i];if(!b)continue;const nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;b.life-=dt;if(b.gravity)b.vy+=b.gravity*dt;if(segmentRect(b.x,b.y,nx,ny,p,b.r)){damagePlayer(b.damage);state.enemyBullets.splice(i,1);}else if(level().orb&&segmentRect(b.x,b.y,nx,ny,state.orb,b.r)){damageOrb(b.damage*.6);state.enemyBullets.splice(i,1);}else{b.x=nx;b.y=ny;if(b.life<=0||b.x<-40||b.x>W+40||b.y<-40||b.y>H+40)state.enemyBullets.splice(i,1);}if(!active())return;}
   for(let i=state.items.length-1;i>=0;i--){const it=state.items[i];it.x-=Math.max(W*.13,115*U)*dt;it.age+=dt;if(rect(it,p)){collectItem(it);state.items.splice(i,1);}else if(it.x<-it.w)state.items.splice(i,1);}
   for(let i=state.npcs.length-1;i>=0;i--){const n=state.npcs[i];n.x-=Math.max(W*.085,65*U)*dt;n.age+=dt;if(rect(n,p)){state.mission.rescued++;state.score+=250;note('AI RESCUED',n.x,n.y);emit('sfx',{name:'pickup'});state.npcs.splice(i,1);}else if(n.x<-n.w)state.npcs.splice(i,1);}
   for(const list of[state.particles,state.floaters,state.effects])for(let i=list.length-1;i>=0;i--){const o=list[i];o.age+=dt;if(o.vx!==undefined){o.x+=o.vx*dt;o.y+=o.vy*dt;}else if(!o.kind)o.y-=30*U*dt;if(o.age>=o.life)list.splice(i,1);}
   if(completeGoals()){state.mission.complete=true;state.transition=1;state.enemyBullets.length=0;state.keys={};state.score+=600+Math.floor(p.health*3)+(level().orb?Math.floor(state.orb.health*2):0);note('MISSION COMPLETE',W*.5,H*.35,'#ffd76d');emit('sfx',{name:'level'});}
   else if(level().timed&&state.levelTime>level().duration&&!Object.entries(level().collect||{}).every(([k,n])=>(state.mission.collected[k]||0)>=n))fail('The launch window expired. Recover all mission supplies on the next attempt.');
  }
  reset(0);
  return {state,level,start,reset,pause,jump,dash,emp,shoot,step,resize,spawnEnemy,spawnItem,spawnNpc,spawnBoss,collectItem,damagePlayer,damageOrb,enemyDefeated,completeGoals,goalText,drain:()=>{const e=events;events=[];return e;},get W(){return W;},get H(){return H;},get U(){return U;},groundY};
 }
 const api={create,defs,rect,segmentRect};if(typeof module==='object'&&module.exports)module.exports=api;else root.OrbEngine=api;
})(typeof window!=='undefined'?window:globalThis);
