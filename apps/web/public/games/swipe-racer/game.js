'use strict';
const $ = selector => document.querySelector(selector);
const canvas = $('canvas'), ctx = canvas.getContext('2d');
const lanes = [-.61,0,.61];
const courses = {
  harbour: {
    name:'Harbour Duel', rival:'Kai', rivalSpeed:45, paint:'#ef4f3c', finish:1440,
    sectors:['Breakwater','Crane Row','Ferry Terminal'],
    briefing:'Beat Kai’s red coupe to the ferry terminal. Drive between the gold gate posts to charge another boost.',
    gates:[[125,0],[310,-1],[490,1],[685,0],[890,1],[1075,-1],[1220,0],[1340,1]],
    traffic:[[185,0],[370,-1],[545,1],[750,0],[955,1],[1140,-1],[1280,0]],ice:[],
    recordKey:'wga_harbour_duel_preview_best_1'
  },
  frostline: {
    name:'Frostline Pass', rival:'Mara', rivalSpeed:46, paint:'#934ad7', finish:1590,
    sectors:['Pine Hollow','Switchbacks','Summit Lodge'],
    briefing:'Chase Mara to Summit Lodge. Coast along a blue ice strip from end to end to earn Boost. Use it on dry road. Boosting on ice makes you skid.',
    gates:[[120,-1],[555,1],[1095,0]],
    traffic:[[172,-1],[404,1],[643,1],[851,-1],[1010,0],[1180,0],[1430,1]],
    ice:[[230,304,0],[465,525,-1],[704,790,0],[915,980,1],[1225,1310,-1],[1470,1530,0]],
    recordKey:'wga_frostline_pass_preview_best_1'
  }
};
const snowBackdrop=new Image(); snowBackdrop.src='./assets/backgrounds/horizon-snow.webp';
const backdrop = new Image(); backdrop.src = './assets/backgrounds/horizon-harbour.webp';
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
let width,height,horizon,mode='intro',race,drag,best=null,previousFrame=0,lastHud='';
let courseId,course,finish,gates,traffic;
function otherId(){return courseId==='harbour'?'frostline':'harbour';}
function showCourse(id){
  courseId=id;course=courses[id];({finish,gates,traffic}=course);
  best=null;
  try {
    const raw=Number(localStorage.getItem(course.recordKey));
    if(raw>0 && Number.isFinite(raw))best=raw;
    localStorage.setItem('wga_duel_last_course',id);
  } catch {}
  reset();setMode('intro');
  $('#eyebrow').textContent='Swipe Racer · '+(id==='harbour'?'01':'02')+' / 02';
  $('#title').textContent=course.name;$('#copy').textContent=course.briefing;
  $('#hint').textContent='Swipe or use ← → to steer. Tap Boost or press Space.'+(best===null?'':' Your best: '+best.toFixed(2)+' s.');
  $('#btnStart').textContent='Race '+course.rival+' →';$('#other').textContent=courses[otherId()].name+' →';
}
function reset(){
  race={time:0,dist:0,rival:7,rivalFinish:null,lane:0,x:0,speed:0,charges:1,boost:0,slow:0,gates:0,hits:0,message:'',until:0,count:2.4};
  race.iceIndex=0;race.cleanEntry=false;race.onIce=false;race.cleanStrips=0;race.skids=0;
  drag=null;lastHud='';
}
function resize(){
  const rect=canvas.getBoundingClientRect(),ratio=Math.min(2,devicePixelRatio||1);
  width=rect.width;height=rect.height;horizon=height*.36;
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
}
function setMode(value) {
  mode=value; drag=null;
  const driving=value==='race'||value==='count';
  $('.overlay').hidden=driving;$('.hud').hidden=!driving;$('.strip').hidden=!driving;$('.controls').hidden=!driving;
  $('#restart').hidden=value!=='pause';
  $('#raceScore').hidden=value!=='result';
  $('#other').hidden=value!=='intro'&&value!=='result';
  $('.flash').textContent='';
}
function begin(){reset();setMode('count');updateHud();}
function pause(){
  if(mode!=='race')return;
  setMode('pause');$('#eyebrow').textContent=course.name;$('#title').textContent='Paused';$('#copy').textContent='Your race is held here.';$('#hint').textContent='Resume when you’re ready.';$('#btnStart').textContent='Resume →';$('#btnStart').focus();
}
function steer(dir){if(mode==='race')race.lane=clamp(race.lane+dir,-1,1);}
function message(text,duration=1.3){race.message=text;race.until=race.time+duration;}
function boost(){
  if(mode!=='race'||race.charges===0||race.boost>0||race.slow>0)return;
  race.charges--;race.boost=2;message('BOOST',.65);
  if(race.onIce)skid();
}
function skid(){
  race.skids++;race.cleanEntry=false;race.slow=1.25;race.boost=0;message('SKID · Boost on dry road');
}
function crossIce(prior){
  const r=race, strip=course.ice[r.iceIndex];
  if(!strip)return;
  const [start,end,lane]=strip;
  if(r.dist<start)return;
  const inside=Math.abs(r.x-lanes[lane+1])<.28;
  if(prior<start)r.cleanEntry=inside;
  if(!inside)r.cleanEntry=false;
  r.onIce=inside;
  if(inside && r.boost>0)skid();
  if(r.dist>=end){
    if(r.cleanEntry){
      r.cleanStrips++;
      const full=r.charges===3;r.charges=Math.min(3,r.charges+1);
      message(full?'CLEAN ICE · Boost full':'CLEAN ICE +1 BOOST');
    }
    r.iceIndex++;r.cleanEntry=false;r.onIce=false;
  }
}
function done(){
  const won=race.rivalFinish===null||race.time<=race.rivalFinish;
  setMode('result');$('#eyebrow').textContent=course.sectors[2]+' · Finish';
  $('#title').textContent=won?'You won.':course.rival+' wins.';
  $('#copy').textContent='Your time '+race.time.toFixed(2)+' s · '+race.gates+'/'+gates.length+' gates · '+race.hits+(race.hits===1?' traffic hit.':' traffic hits.');
  const par=(finish-7)/course.rivalSpeed;
  const pace=Math.max(0,Math.round(1000*par/race.time));
  const score=pace+race.gates*20+race.cleanStrips*20+(won?100:0);
  $('#raceScore').textContent='Race score: '+score;
  window.GG?.endRound?.({gameSlug:'swipe-racer',score});
  const old=best;
  if(course.ice.length)$('#copy').textContent+=' '+race.cleanStrips+'/'+course.ice.length+' clean ice strips · '+race.skids+(race.skids===1?' skid.':' skids.');
  if(best===null||race.time<best){best=race.time;try{localStorage.setItem(course.recordKey,String(best));}catch{}}
  $('#hint').textContent=(old===null?'First finish':race.time<old?'New personal best':'Personal best')+' · '+best.toFixed(2)+' s';
  $('#btnStart').textContent='Race again →';$('#btnStart').focus();
}
function step(dt){
  if(mode==='count'){
    race.count-=dt;$('.flash').textContent=Math.max(1,Math.ceil(race.count));
    if(race.count<=0){setMode('race');message('GO',.65);} return;
  }
  if(mode!=='race')return;
  const r=race, prior=r.dist, priorRival=r.rival, priorTime=r.time;
  r.time+=dt;r.boost=Math.max(0,r.boost-dt);r.slow=Math.max(0,r.slow-dt);
  r.x+=(lanes[r.lane+1]-r.x)*(1-Math.exp(-dt*11));
  const target=r.slow>0?19:r.boost>0?66:43;
  r.speed+=(target-r.speed)*(1-Math.exp(-dt*(r.slow>0?6:3)));
  r.dist+=r.speed*dt;r.rival+=course.rivalSpeed*dt;
  if(priorRival<finish && r.rival>=finish)r.rivalFinish=priorTime+(finish-priorRival)/course.rivalSpeed;
  crossIce(prior);
  for(const [d,lane] of gates){
    if(prior<d&&r.dist>=d&&Math.abs(r.x-lanes[lane+1])<.28){
      r.gates++;r.charges=Math.min(3,r.charges+1);message('GATE +1 BOOST');
    }
  }
  for(const [d,lane] of traffic){
    if(prior<d&&r.dist>=d&&Math.abs(r.x-lanes[lane+1])<.27){
      r.hits++;r.slow=1.35;r.boost=0;message('TRAFFIC HIT');
    }
  }
  if(r.dist>=finish){r.time=priorTime+(finish-prior)/r.speed;done();return;}
  updateHud();
}
function updateHud(){
  const r=race,lead=r.dist-r.rival,sector=clamp(Math.floor(r.dist/(finish/3)),0,2);
  const clock=r.time.toFixed(1),label=lead>=0?'1st':'2nd',gap=Math.round(Math.abs(lead));
  const key=[clock,label,gap,r.charges,!!r.boost,!!r.slow,sector,r.message,r.time<r.until].join('|');
  if(key===lastHud)return;lastHud=key;
  $('#position').textContent=label+' · '+gap+' m';$('#sector').textContent='0'+(sector+1)+' / '+course.sectors[sector];
  $('#clock').textContent=clock+' s';$('#boost').textContent='Boost × '+r.charges;$('#boost').disabled=mode!=='race'||!r.charges||r.boost>0||r.slow>0;
  $('.strip i').style.width=(100*r.dist/finish)+'%';
  const notice=r.time<r.until?r.message:r.onIce?'ICE · COAST':'';
  if($('.flash').textContent!==notice)$('.flash').textContent=notice;
}
function poly(color,points){
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)ctx.lineTo(points[i],points[i+1]);ctx.closePath();ctx.fill();
}
function line(color,x1,y1,x2,y2,weight){ctx.strokeStyle=color;ctx.lineWidth=weight;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
// Project the road, gate posts and cars through the same bend so their positions agree.
function centreAt(d){return courseId==='frostline'?62*Math.sin(d/100)-25*Math.sin(d/52):54*Math.sin(d/125)+22*Math.sin(d/62);}
function project(ahead,lane){
  const p=38/(38+Math.max(-14,ahead)),nearWidth=Math.min(width*.55,height*.81);
  const curve=centreAt(race.dist+ahead)-centreAt(race.dist);
  const centre=width*.5+curve*p*nearWidth/50;
  return {x:centre+lane*nearWidth*p,y:horizon+(height*.82-horizon)*p,w:nearWidth*p};
}
function roadQuad(a,b,left,right,color){
  const near=project(a,0),far=project(b,0);
  poly(color,[near.x+near.w*left,near.y,near.x+near.w*right,near.y,far.x+far.w*right,far.y,far.x+far.w*left,far.y]);
}
function background(){
  let sky=ctx.createLinearGradient(0,0,0,horizon*1.6);sky.addColorStop(0,'#43838b');sky.addColorStop(.72,'#f5bc86');sky.addColorStop(1,'#f8d3a7');ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  const snow=courseId==='frostline',image=snow?snowBackdrop:backdrop;
  if(image.naturalWidth){
    const w=Math.max(width*1.1,horizon*2.2),h=w*image.height/image.width;
    const skyline=snow ? .46 : .424;
    ctx.drawImage(image,(width-w)/2-centreAt(race.dist)*.08,horizon-h*skyline,w,h);
  }
  if(snow){
    const bank=ctx.createLinearGradient(0,horizon,0,height);
    bank.addColorStop(0,'#b0c7e1');bank.addColorStop(.36,'#e8f1ff');bank.addColorStop(1,'#9fb7d4');
    ctx.fillStyle=bank;ctx.fillRect(0,horizon,width,height-horizon);return;
  }
  const sea=ctx.createLinearGradient(0,horizon,0,height);sea.addColorStop(0,'#e3ac7f');sea.addColorStop(.20,'#8d9f99');sea.addColorStop(1,'#355e60');
  ctx.fillStyle=sea;ctx.fillRect(0,horizon,width,height-horizon);
  for(let i=1;i<37;i++){
    const y=horizon+(height-horizon)*(i/38)**1.75;
    const x=width*.5+Math.sin(i*7.4+race.dist*.002)*width*.17;
    line('rgba(255,218,157,.28)',x-width*i*.0015,y,x+width*i*.0020,y,1+i*.022);
  }
}
function drawRoad(){
  for(let far=4000;far>420;){
    const near=Math.max(420,far*.90);
    roadQuad(near,far,-1,1,courseId==='frostline'?'#8290a5':'#77786e');far=near;
  }
  for(let d=420-(race.dist%6);d>-18;d-=6){
    const a=Math.max(-14,d-6),b=Math.max(-14,d),band=Math.floor((race.dist+d+.1)/6);
    roadQuad(a,b,-1.13,1.13,band%4<2?'#f1cf9a':'#bc6558');
    roadQuad(a,b,-1,1,band%2?'#34444b':'#35464c');
    for(const [start,end,lane] of course.ice){
      const from=Math.max(a,start-race.dist),to=Math.min(b,end-race.dist);
      if(from>=to)continue;
      const mid=lanes[lane+1];
      roadQuad(from,to,mid-.28,mid+.28,band%2?'#70bdd5':'#85d6e6');
      if(band%4===0)roadQuad(from,to,mid-.20,mid-.14,'#e9fcff');
    }
    for(const edge of [-.952,.952])roadQuad(a,b,edge-.009,edge+.009,'#eddfc2');
    if(band%4===0)for(const lane of [-.31,.31])roadQuad(a,b,lane-.012,lane+.012,'#e6d7b8');
  }
}
function car(x,y,w,body,rival=false){
  ctx.save();ctx.translate(x,y);ctx.scale(w/100,w/100);
  ctx.fillStyle='#16222566';ctx.beginPath();ctx.ellipse(0,0,52,9,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#172026';ctx.fillRect(-46,-14,13,17);ctx.fillRect(33,-14,13,17);
  poly(body,[-49,-9,-47,-25,-34,-29,-25,-44,22,-44,36,-30,47,-26,49,-9,37,-4,-37,-4]);
  poly('#172d37',[-30,-29,-21,-40,19,-40,29,-29]);
  poly('#a1c6c9',[-27,-30,-20,-39,12,-39,-10,-36]);
  poly('#ffffff40',[-44,-25,-32,-28,32,-28,43,-25,25,-23,-28,-23]);
  ctx.fillStyle='#152a30';ctx.fillRect(-44,-20,88,10);ctx.fillStyle='#ff7967';ctx.fillRect(-40,-18,28,4);ctx.fillRect(12,-18,28,4);
  ctx.fillStyle='#f7e8bb';ctx.fillRect(-8,-15,16,5);
  poly('#243039',[-49,-12,-42,-8,41,-8,49,-12,44,-4,32,-2,-33,-2,-44,-4]);
  for(const side of [-1,1]){
    ctx.fillStyle='#263238';ctx.fillRect(side*28-2,-30,4,5);
    ctx.fillStyle='#ffbe9a';ctx.fillRect(side*28-10,-18,20,1);
    poly('#ffffff60',[side*46,-26,side*47,-21,side*42,-21,side*38,-26]);
  }
  ctx.fillStyle='#18242c';ctx.fillRect(-43,-32,86,3);ctx.fillStyle='#839297';ctx.fillRect(-41,-32,82,1);
  if(!rival){ctx.fillStyle='#fff2d0';ctx.fillRect(-20,-25,5,4);ctx.fillRect(-13,-25,2,4);}
  if(!rival&&race.boost>0){for(const side of [-1,1])poly('#ffe878',[side*32-4,-4,side*32+5,-4,side*32,7+5*Math.sin(race.time*36)]);}
  ctx.restore();
}
function drawGate(d,lane){
  const p=project(d,lanes[lane+1]),h=p.w*.24;
  for(const s of [-1,1]){
    const x=p.x+s*p.w*.27;
    line('#253737',x,p.y,x,p.y-h,Math.max(1,p.w*.035));
    line('#ffdc53',x,p.y-h*.44,x,p.y-h,Math.max(2,p.w*.054));
  }
  poly('#ffe077',[p.x-p.w*.14,p.y-1,p.x,p.y-p.w*.064,p.x+p.w*.14,p.y-1,p.x,p.y-p.w*.025]);
}
function draw(){
  background();drawRoad();
  const objects=[];
  for(let marker=Math.ceil(race.dist/36)*36;marker<race.dist+410;marker+=36)objects.push({d:marker-race.dist,type:'beacon',l:0});
  if(courseId==='frostline'){
    for(let n=Math.ceil(race.dist/47);47*n<race.dist+410;n++){
      objects.push({d:47*n-race.dist,type:'spruce',l:(n%2?1:-1)*(1.47+.12*(n%3))});
    }
  }
  for(const [d,l] of gates)objects.push({d:d-race.dist,l,type:'gate'});
  for(const [d,l] of traffic)objects.push({d:d-race.dist,l,type:'traffic'});
  objects.push({d:race.rival-race.dist,l:0,type:'rival'},{d:finish-race.dist,l:0,type:'finish'});
  for(const o of objects.sort((a,b)=>b.d-a.d)){
    if(o.d<0||o.d>420)continue;
    if(o.type==='gate'){drawGate(o.d,o.l);continue;}
    if(o.type==='spruce'){
      const p=project(o.d,o.l),h=p.w*.79,x=p.x,y=p.y;
      ctx.fillStyle='#5e5956';ctx.fillRect(x-h*.035,y-h*.24,h*.07,h*.24);
      for(let tier=0;tier<3;tier++){
        const base=y-h*(.12+.22*tier),tip=base-h*(.54-.055*tier),half=h*(.28-.065*tier);
        poly('#365763',[x,tip,x+half,base,x,base-h*.045,x-half,base]);
        poly('#e5f0fb',[x,tip,x+half*.8,base-h*.12,x-half*.24,base-h*.185,x-half*.60,base-h*.13]);
      }
      continue;
    }
    if(o.type==='beacon'){
      for(const side of [-1,1]){
        const p=project(o.d,side*1.095),h=p.w*.12;
        line('#29383a',p.x,p.y,p.x,p.y-h,Math.max(1,p.w*.021));
        line('#f5c677',p.x,p.y-h*.65,p.x,p.y-h,Math.max(1,p.w*.027));
      }
      continue;
    }
    const rivalLane=.54*Math.sin(race.rival/115+.6);
    const p=project(o.d,o.type==='rival'?rivalLane:lanes[o.l+1]);
    if(o.type==='finish'){
      for(let i=0;i<12;i++)roadQuad(o.d,o.d+6,-1+i/6,-1+(i+1)/6,i%2?'#17282b':'#fff1cd');
    }else{
      car(p.x,p.y,p.w*.46,o.type==='rival'?course.paint:'#a0bac0',true);
      if(o.type==='rival'&&o.d<125){ctx.textAlign='center';ctx.font='bold 12px system-ui';ctx.fillStyle='#19292f';ctx.fillRect(p.x-21,p.y-p.w*.24-18,42,16);ctx.fillStyle='#fff6dc';ctx.fillText(course.rival.toUpperCase(),p.x,p.y-p.w*.24-6);}
    }
  }
  const player=project(0,race.x);car(player.x,player.y,player.w*.47,'#f2c344');
}
function frame(now){const dt=Math.min(.06,(now-previousFrame)/1000||0);previousFrame=now;step(dt);draw();requestAnimationFrame(frame);}
canvas.addEventListener('pointerdown',e=>{if(mode==='race'&&!drag){drag={id:e.pointerId,x:e.clientX};canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>Math.min(width*.12,52)){steer(Math.sign(dx));drag.x=e.clientX;}});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,e=>{if(drag?.id===e.pointerId)drag=null;});
$('#btnStart').onclick=()=>{if(mode==='pause'){setMode('race');updateHud();}else begin();};
$('#restart').onclick=begin;$('#pause').onclick=pause;$('#left').onclick=()=>steer(-1);$('#right').onclick=()=>steer(1);$('#boost').onclick=boost;
$('#other').onclick=()=>{showCourse(otherId());$('#btnStart').focus();};
window.addEventListener('keydown',e=>{
  if(mode==='race'&&['ArrowLeft','ArrowRight',' ','Escape','p'].includes(e.key)){
    e.preventDefault();if(e.repeat)return;
    if(e.key==='ArrowLeft')steer(-1);else if(e.key==='ArrowRight')steer(1);else if(e.key===' ')boost();else pause();
  }else if(mode==='pause'&&e.key==='Escape'){setMode('race');updateHud();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
let initialCourse='harbour';
try{if(localStorage.getItem('wga_duel_last_course')==='frostline')initialCourse='frostline';}catch{}
showCourse(initialCourse);resize();window.addEventListener('resize',resize);requestAnimationFrame(frame);
