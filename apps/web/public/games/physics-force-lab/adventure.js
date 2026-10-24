(() => {
  'use strict';
  const A=window.PhysicsAdventure,$=id=>document.getElementById(id),canvas=$('adventureCanvas'),ctx=canvas.getContext('2d');
  let storage;try{storage=window.localStorage;}catch{}
  let profile=A.load(storage),m=A.missions[profile.current],cp=null,running=false,activeLab=-1,ending=false,tested=false,explained=false,storageWarned=false,saveAvailable=true;
  const audio=new window.PhysicsAdventureAudio(profile.settings),keys={left:new Set(),right:new Set()};
  const player={x:80,y:420,vx:0,vy:0,ground:true,facing:1,animation:0,flash:0};
  let width=960,height=540,scale=1,camera=0,time=0,last=performance.now(),saveElapsed=0,nearest=null,images={};
  const stationX=[660,1460,2260],endX=3020,length=3200;
  const dialogs=[...document.querySelectorAll('dialog')];
  const modal=()=>dialogs.some(d=>d.open);
  const clearInput=()=>{keys.left.clear();keys.right.clear();player.vx=0;};
  function checkpoint(){if(cp){cp.x=player.x;profile.checkpoints[m.id]=cp;if(cp.cells.length)profile.records[m.id]=Math.max(profile.records[m.id]||0,cp.cells.length);}saveAvailable=A.save(storage,profile);if(!saveAvailable&&!storageWarned){storageWarned=true;notice('Saving is unavailable in this browser. Keep this tab open to retain progress.');}}
  function notice(text){$('notice').textContent=text;clearTimeout(notice.timer);notice.timer=setTimeout(()=>$('notice').textContent='',3800);}
  function open(id){checkpoint();if(id==='pauseDialog')document.querySelector('#pauseDialog .eyebrow').textContent=saveAvailable?'CHECKPOINT SAVED':'PAUSED • SAVING UNAVAILABLE';clearInput();audio.stop();$(id).showModal();$(id).scrollTop=0;}
  function close(id){$(id).close();clearInput();last=performance.now();if(running&&!modal()&&!document.hidden)audio.play(profile.current);}
  function closeAll(){dialogs.forEach(d=>d.close());}
  function hud(){
    $('missionTitle').textContent=`${profile.current+1}. ${m.title}`;
    $('missionConcept').textContent=`Grade ${m.grade} • ${m.topic}`;
    $('missionStats').textContent=`${cp?.solved.length||0}/3 repairs · ${cp?.cells.length||0}/12 cells`;
  }
  function launch(i,retry=false){
    if(!A.isUnlocked(profile,i))return;
    checkpoint();closeAll();profile.current=i;m=A.missions[i];
    if(retry)delete profile.checkpoints[m.id];
    cp=profile.checkpoints[m.id]||{x:80,solved:[],cells:[],labs:{}};
    profile.checkpoints[m.id]=cp;Object.assign(player,{x:cp.x,y:420,vx:0,vy:0,ground:true,flash:0});
    activeLab=-1;ending=false;running=true;checkpoint();hud();
    $('storyGrade').textContent=`MISSION ${i+1} • GRADE ${m.grade} • ${m.topic}`;
    $('storyTitle').textContent=m.title;$('storyCopy').textContent=m.story;
    $('storyGoal').textContent=`Repair three stations. ${m.concept}`;
    $('storyContinue').textContent=cp.solved.length?'Return to your checkpoint':'Explore the district';
    open('storyDialog');
  }
  function missionMap(){
    $('missionList').replaceChildren();
    A.missions.forEach((mission,i)=>{const b=document.createElement('button');b.disabled=!A.isUnlocked(profile,i);const title=document.createElement('strong'),sub=document.createElement('span');title.textContent=`${i+1}. ${mission.title}`;sub.textContent=`Grade ${mission.grade} • ${mission.topic} • ${b.disabled?'Locked':profile.completed[mission.id]?'Restored — replay':'Explore'}`;b.append(title,sub);b.onclick=()=>launch(i,!!profile.completed[mission.id]);$('missionList').append(b);});
    open('mapDialog');
  }
  function jump(){if(!running||modal()||!player.ground)return;player.vy=-480;player.ground=false;audio.effect('jump');}
  function pause(){if(!running||modal())return;open('pauseDialog');}
  function interact(){
    if(!running||modal()||!nearest)return;
    if(nearest.kind==='station')openLab(nearest.index);
    else if(cp.solved.length===3)finishMission();else notice('Repair all three stations before opening the district relay.');
  }
  function finishMission(){
    profile.completed[m.id]=true;ending=true;checkpoint();audio.effect('repair');
    $('storyGrade').textContent='DISTRICT RESTORED';$('storyTitle').textContent=m.title;
    $('storyCopy').textContent=m.ending;$('storyGoal').textContent=`Evidence collected: ${cp.solved.length} repairs and ${cp.cells.length} optional data cells. ${m.concept}`;
    $('storyContinue').textContent=profile.current<A.missions.length-1?'Next mission':'Return to mission map';open('storyDialog');postScore();
  }
  function postScore(){
    const score=A.score(profile),payload={type:'GG_SCORE',slug:'physics-force-lab',gameSlug:'physics-force-lab',score,best:score,level:profile.current+1,mode:'complete'};
    try{window.GG?.setSlug?.(payload.slug);window.GG?.setScore?.(score,{gameSlug:payload.slug});window.GG?.submitScore?.(score,{gameSlug:payload.slug});}catch{}
    try{window.parent.postMessage(payload,'*');window.parent.postMessage({...payload,type:'gg:score'},'*');}catch{}
  }
  function labState(){return cp.labs[activeLab];}
  function openLab(index){
    if(cp.solved.includes(index)){notice('Station restored. Retry the mission from Pause to repeat every investigation.');return;}
    activeLab=index;cp.labs[index]||={value:m.initial,closed:true,prediction:null,trials:[],hint:false};
    tested=false;explained=false;const l=labState(),s=m.stations[index];
    $('labGrade').textContent=`GRADE ${m.grade} • ${m.topic}`;$('labTitle').textContent=s.name;$('labGoal').textContent=s.goal;
    $('fairTest').textContent=A.simulate(m,index,l.value,l.closed).detail;
    $('predictionQuestion').textContent=m.prediction;$('predictionAnswers').replaceChildren();
    A.shuffled(m.predictions,m.correctPrediction).forEach(answer=>{const b=document.createElement('button');b.textContent=answer.text;const actual=m.predictions.indexOf(answer.text);b.setAttribute('aria-pressed',String(l.prediction===actual));b.onclick=()=>{l.prediction=actual;[...$('predictionAnswers').children].forEach(c=>c.setAttribute('aria-pressed',String(c===b)));$('runTest').disabled=false;checkpoint();};$('predictionAnswers').append(b);});
    $('runTest').disabled=l.prediction===null;$('labHint').textContent=l.hint?m.hint:'';
    $('testResult').textContent='Choose a prediction, adjust the equipment and test your idea.';$('testResult').className='';
    $('reflectStep').hidden=true;$('finishLab').hidden=true;$('reflectionFeedback').textContent='';
    renderEquipment();history();visual();open('labDialog');
  }
  function resetTest(){tested=false;explained=false;$('reflectStep').hidden=true;$('finishLab').hidden=true;$('testResult').textContent='Equipment changed. Run a new experiment to collect evidence.';$('testResult').className='';visual();checkpoint();}
  function renderEquipment(){
    const l=labState(),box=$('equipment');box.replaceChildren();box.className='equipment';
    const label=document.createElement('label'),name=document.createElement('span');name.textContent=m.variable;label.append(name);
    if(m.options){const select=document.createElement('select');select.setAttribute('aria-label',m.variable);m.options.forEach(([value,text])=>select.add(new Option(text,value)));select.value=l.value;select.onchange=()=>{l.value=select.value;resetTest();};label.append(select);}
    else {const input=document.createElement('input'),out=document.createElement('output');input.type='range';input.min=m.min;input.max=m.max;input.step=m.step;input.value=l.value;input.setAttribute('aria-label',m.variable);out.textContent=`${l.value} ${m.unit}`;input.oninput=()=>{l.value=Number(input.value);out.textContent=`${l.value} ${m.unit}`;resetTest();};label.append(input,out);}
    box.append(label);
    if(m.type==='circuit'){const switchLabel=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=l.closed;check.onchange=()=>{l.closed=check.checked;resetTest();};switchLabel.append(check,' Close the switch');box.append(switchLabel);}
  }
  function history(){
    $('trialHistory').replaceChildren();labState().trials.forEach((t,i)=>{const r=A.simulate(m,activeLab,t.value,t.closed),li=document.createElement('li');li.textContent=`Trial ${i+1}: ${t.value}${m.type==='circuit'?(t.closed?', switch closed':', switch open'):m.unit?' '+m.unit:''} → ${m.type==='circuit'?(r.output?'lamp on':'lamp off'):r.output+' '+r.unit}`;$('trialHistory').append(li);});
  }
  function runTest(){
    const l=labState();if(l.prediction===null)return;
    const r=A.simulate(m,activeLab,l.value,l.closed);l.trials.push({value:l.value,closed:l.closed});l.trials=l.trials.slice(-6);tested=r.success;explained=false;
    $('finishLab').hidden=true;$('reflectionFeedback').textContent='';
    $('testResult').textContent=`Observed: ${m.type==='circuit'?(r.output?'lamp on':'lamp off'):r.output+' '+r.unit}. ${r.detail} ${r.success?'Target reached. Explain the evidence below.':'Target not reached yet. Adjust one factor and test again.'}`;
    $('testResult').className=r.success?'success':'';history();visual(true);checkpoint();
    audio.effect(m.type==='sound'?'signal':'test',r.output);
    $('reflectStep').hidden=!r.success;
    if(r.success){$('reflectionQuestion').textContent=m.question;$('reflectionAnswers').replaceChildren();A.shuffled(m.answers,m.correct).forEach(answer=>{const b=document.createElement('button');b.textContent=answer.text;b.onclick=()=>{explained=answer.correct;$('reflectionFeedback').textContent=answer.correct?m.explanation:`Look again at your evidence. ${m.hint}`;$('reflectionFeedback').className=answer.correct?'success':'';$('finishLab').hidden=!answer.correct;};$('reflectionAnswers').append(b);});}
  }
  function applyRepair(){
    if(!tested||!explained)return;cp.solved.push(activeLab);checkpoint();close('labDialog');audio.effect('repair');hud();notice(`Repair ${cp.solved.length}/3 complete. ${cp.solved.length===3?'The district relay is ready ahead.':'Follow the route to the next station.'}`);
  }
  function visual(animate=false){
    const l=labState(),r=A.simulate(m,activeLab,l.value,l.closed),v=$('labVisual'),color=m.color;
    const line=(x1,y1,x2,y2,c=color)=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${c}" stroke-width="5" fill="none"/>`;
    let content='';
    if(m.type==='sound') {let d='';for(let x=15;x<480;x+=3)d+=`${x===15?'M':'L'}${x},${74+Math.sin(x*(r.output/1400))*24}`;content=`<path class="wave-line" d="${d}" fill="none" stroke="${color}" stroke-width="3"/><text x="20" y="26">Visible vibrations • ${r.output} Hz</text>`;}
    else if(m.type==='circuit'){content=line(75,40,75,105)+line(75,105,410,105)+line(410,105,410,40)+line(75,40,220,40)+line(270,40,410,40)+line(220,40,270,l.closed?40:18)+`<path d="M60 61H90M65 72H85" stroke="#fff" stroke-width="6"/><circle class="${r.output?'lit':''}" cx="410" cy="45" r="20" fill="${r.output?'#ffdf67':'#34516c'}" stroke="white" stroke-width="3"/><text x="95" y="133">Cell → ${l.value} bridge → lamp • switch ${l.closed?'closed':'open'}</text>`;}
    else {const end=60+Math.min(370,r.output*22),target=m.stations[activeLab].target;content=`<rect x="20" y="106" width="460" height="7" rx="3" fill="#557483"/>${m.type!=='wheels'?`<rect x="${60+target[0]*22}" y="82" width="${Math.max(14,(target[1]-target[0])*22)}" height="32" fill="#69f2c433" stroke="#69f2c4"/>`:''}<g class="test-object" style="--travel-start:${60-end}px"><rect x="${end-22}" y="72" width="44" height="26" rx="5" fill="${color}"/><circle cx="${end-12}" cy="103" r="7" fill="#d9e8f0"/><circle cx="${end+12}" cy="103" r="7" fill="#d9e8f0"/></g><text x="20" y="25">${m.type==='spring'?'Stored spring energy → movement':m.type==='wheels'?'Compare the same starting energy':'Energy transferred by a push'}</text><text x="20" y="135">Travel distance: ${r.output} m</text>${m.type==='spring'?'<path class="spring-coil" d="M20 85l7 -12 7 24 7 -24 7 24 7 -12" fill="none" stroke="#e0bfff" stroke-width="3"/>':''}`;}
    v.innerHTML=`<svg viewBox="0 0 500 145" aria-hidden="true" style="color:#e8f6ff;font:14px system-ui;fill:currentColor">${content}</svg>`;
    v.setAttribute('aria-label',`${m.type} experiment: ${r.detail} ${r.output} ${r.unit}`);v.classList.remove('testing');if(animate&&!profile.settings.reduced){void v.offsetWidth;v.classList.add('testing');}
  }
  function resize(){
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);scale=Math.max(.8,Math.min(1.4,rect.height/500));width=rect.width/scale;height=rect.height/scale;ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0);camera=A.clamp(player.x-width*.36,0,Math.max(0,length-width));
  }
  function update(dt){
    if(!running||modal()||document.hidden)return;
    time+=dt;player.flash=Math.max(0,player.flash-dt);const move=Number(keys.right.size>0)-Number(keys.left.size>0),target=move*265;
    player.vx+=(target-player.vx)*Math.min(1,dt*13);if(move)player.facing=move;
    const barrier=cp.solved.length<3?stationX[[0,1,2].find(i=>!cp.solved.includes(i))]+100:length-55;
    player.x=A.clamp(player.x+player.vx*dt,45,barrier);player.vy+=1250*dt;player.y+=player.vy*dt;
    player.ground=player.y>=420;if(player.ground){player.y=420;player.vy=0;}
    player.animation+=Math.abs(player.vx)*dt*.04;
    // Malfunctioning maintenance drones patrol a predictable lane; contact costs momentum only.
    for(let i=0;i<3;i++){const x=1030+i*800+Math.sin(time*.85+i)*110;if(Math.abs(player.x-x)<35&&player.y>395&&player.flash===0){player.x=Math.max(45,player.x-28);player.vx=-80;player.flash=1.5;audio.effect('bump');notice('Drone contact slowed you down. Jump over its patrol lane.');}}
    for(let i=0;i<12;i++){const x=220+i*235,y=i%3===1?335:390;if(!cp.cells.includes(i)&&Math.abs(player.x-x)<29&&Math.abs(player.y-35-y)<50){cp.cells.push(i);audio.effect('cell');hud();checkpoint();}}
    nearest=null;for(let i=0;i<3;i++)if(Math.abs(player.x-stationX[i])<95&&!cp.solved.includes(i))nearest={kind:'station',index:i};
    if(Math.abs(player.x-endX)<100)nearest={kind:'exit'};
    $('prompt').textContent=nearest?nearest.kind==='station'?`E / Interact • ${m.stations[nearest.index].name}`:cp.solved.length===3?'E / Interact • Restore district relay':'Three repairs needed':'';
    $('interactAdventure').disabled=!nearest;
    camera+=(A.clamp(player.x-width*.36,0,Math.max(0,length-width))-camera)*Math.min(1,dt*9);
    saveElapsed+=dt;if(saveElapsed>2){checkpoint();saveElapsed=0;}
  }
  function rect(x,y,w,h,color,r=5){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
  function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
  function limb(x,y,angle,len,color,w){ctx.save();ctx.translate(x,y);ctx.rotate(angle);rect(-w/2,0,w,len,color,w/2);ctx.restore();}
  // Articulated sprites: independent legs, arms, torso, face and equipment, with action-specific poses.
  function scientist(x,y,mode='player'){
    const isProf=mode==='professor',walk=!isProf&&Math.abs(player.vx)>15&&player.ground,phase=profile.settings.reduced?0:player.animation,air=!isProf&&!player.ground,tool=!isProf&&nearest?.kind==='station';
    ctx.save();ctx.translate(x,y);ctx.scale(isProf?1:player.facing,1);const stride=walk?Math.sin(phase)*.65:0,bob=walk?Math.abs(Math.cos(phase))*2:0;
    ctx.globalAlpha=!isProf&&player.flash>0?.65:1;ellipse(0,2,20,4,'#05141d66');ctx.translate(0,-bob);
    limb(-8,-25,air?-.45:stride,25,'#20364c',10);limb(8,-25,air?.7:-stride,25,'#30485e',10);
    rect(-17,-4,16,7,'#0a192a');rect(3,-4,17,7,'#0a192a');rect(-19,-54,12,24,'#1d5365');
    rect(-15,-53,30,34,isProf?'#f5ede0':'#dcebe9',7);rect(-3,-52,6,28,'#32b6b2',1);rect(-13,-29,26,6,'#b77944',2);
    limb(-15,-49,air?-.8:-stride*.65,27,isProf?'#f5ede0':'#b7dadc',9);limb(15,-49,tool?-.9:air?.8:stride*.65,27,'#c7e2df',9);
    ellipse(0,-64,13,15,isProf?'#bd8864':'#a56c46');ellipse(0,-74,14,7,isProf?'#dddde1':'#242330');rect(-13,-69,27,9,'#264c62',4);rect(-10,-67,8,4,'#8bf8e8',2);rect(3,-67,8,4,'#8bf8e8',2);
    if(isProf){ellipse(-13,-68,5,10,'#dddde1');ellipse(13,-68,5,10,'#dddde1');}else{rect(-16,-56,6,10,m.color,2);}
    ctx.restore();
  }
  function robot(x,y,enemy=false){
    const f=profile.settings.reduced?0:Math.sin(time*4+x)*3;ctx.save();ctx.translate(x,y+f);ellipse(0,26,21,4,'#03142466');rect(-21,-14,42,29,enemy?'#b15e63':'#f4d18b',10);rect(-16,-9,32,17,'#102d43',6);ellipse(-7,-1,3,4,enemy?'#ffb0ad':'#6af8d7');ellipse(7,-1,3,4,enemy?'#ffb0ad':'#6af8d7');limb(-22,0,Math.sin(time*4)*.2,14,'#65949e',6);limb(22,0,-Math.sin(time*4)*.2,14,'#65949e',6);rect(-4,-23,8,10,'#7e9fa6',2);ellipse(0,-25,4,4,enemy?'#ff7272':m.color);if(enemy){ctx.strokeStyle='#adc3ce';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-30,30,profile.settings.reduced?3:2+Math.abs(Math.cos(time*22))*4,0,0,7);ctx.stroke();}ctx.restore();
  }
  function apparatus(x,i){
    const repaired=cp?.solved.includes(i),pulse=profile.settings.reduced?0:Math.sin(time*4+i);
    ctx.save();ctx.translate(x-90,0);
    if(m.type==='sound'){
      rect(-22,318,24,102,'#466a7b',3);rect(-32,306,44,34,repaired?m.color:'#6b8191',8);
      if(repaired){ctx.strokeStyle=m.color;ctx.lineWidth=2;for(let n=0;n<3;n++){ctx.globalAlpha=.65-n*.18;ctx.beginPath();ctx.arc(-10,322,28+n*13+pulse*3,-.7,.7);ctx.stroke();}ctx.globalAlpha=1;}
    }else if(m.type==='circuit'){
      rect(-15,345,8,75,'#496b7d',2);ellipse(-11,337,18,22,repaired?'#ffdc84':'#34526a');rect(-28,361,34,8,'#8ba1a8',2);
      if(repaired){const glow=ctx.createRadialGradient(-11,337,8,-11,337,70);glow.addColorStop(0,'#ffe19766');glow.addColorStop(1,'#ffe19700');ctx.fillStyle=glow;ctx.fillRect(-81,267,140,140);}
    }else{
      const roll=repaired&&!profile.settings.reduced?Math.sin(time*.8+i)*18:0;ctx.translate(roll,0);
      rect(-38,381,67,25,repaired?m.color:'#56717e',4);rect(-30,366,22,15,'#d6b38c',2);rect(-5,359,24,22,'#c49b72',2);
      for(const wx of [-22,15]){ellipse(wx,411,10,10,'#0d2436');ctx.save();ctx.translate(wx,411);ctx.rotate(repaired?time*2:0);ctx.strokeStyle='#a2c9cf';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.moveTo(0,-6);ctx.lineTo(0,6);ctx.stroke();ctx.restore();}
      if(m.type==='spring'){ctx.strokeStyle='#bcabec';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-84,397);for(let n=0;n<7;n++)ctx.lineTo(-84+n*7,397+(n%2?9:-9));ctx.stroke();}
    }
    ctx.restore();
  }
  function draw(){
    ctx.clearRect(0,0,width,height);const bg=images[m.bg];
    if(bg){const factor=Math.max(width/bg.width,height/bg.height),bw=bg.width*factor,bh=bg.height*factor;ctx.drawImage(bg,(width-bw)/2,(height-bh)/2,bw,bh);}else{const g=ctx.createLinearGradient(0,0,0,height);g.addColorStop(0,'#21475b');g.addColorStop(1,'#122739');ctx.fillStyle=g;ctx.fillRect(0,0,width,height);}
    ctx.fillStyle='#071a2a77';ctx.fillRect(0,0,width,height);
    ctx.save();ctx.translate(-camera,height-460);
    // Foreground architecture gives the painted background a coherent, traversable scale.
    for(let x=0;x<length;x+=160){rect(x,420,156,42,'#28495a',2);rect(x,420,156,5,'#82b7b2',1);rect(x+14,437,128,7,'#1c3546',2);}
    for(let x=350;x<length;x+=800){rect(x,250,9,170,'#29485b',2);rect(x-15,245,48,12,'#557e8c',4);ellipse(x+8,255,16,7,m.color);}
    // Persistent, visible workshop restoration: photographs, plants and repaired equipment.
    rect(20,257,260,120,'#132e40',9);rect(33,270,234,93,'#275367',4);
    const done=Object.values(profile.completed).filter(Boolean).length;
    for(let i=0;i<5;i++){rect(43+i*43,282,32,39,i<done?'#ddc9a0':'#1e4052',2);if(i<done){rect(47+i*43,287,24,23,A.missions[i].color,1);ellipse(59+i*43,299,6,7,'#275367');}}
    rect(30,379,240,10,'#b08762',3);rect(42,390,12,30,'#466171',2);rect(242,390,12,30,'#466171',2);if(profile.completed.cargo)scientist(200,420,'professor');
    for(let i=0;i<12;i++){if(cp?.cells.includes(i))continue;const x=220+i*235,y=i%3===1?335:390;const bob=profile.settings.reduced?0:Math.sin(time*3+i)*4;ctx.save();ctx.translate(x,y+bob);ctx.rotate(Math.PI/4);rect(-7,-7,14,14,m.color,3);ctx.restore();}
    for(let i=0;i<3;i++){const x=stationX[i],solved=cp?.solved.includes(i);apparatus(x,i);rect(x-37,346,74,74,'#b1c4c6',8);rect(x-29,354,58,38,solved?'#3b947a':'#163e54',5);ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillStyle=solved?'#a5ffcf':m.color;ctx.fillText(solved?'✓':String(i+1),x,381);rect(x-18,401,36,7,solved?'#69f2c4':'#f2b575',3);
      if(!solved){rect(x+93,305,8,115,'#9b6670',3);for(let j=0;j<5;j++)rect(x+93,316+j*21,8,10,'#ffd58d',1);}
    }
    for(let i=0;i<3;i++)robot(1030+i*800+Math.sin(time*.85+i)*110,390,true);
    rect(endX-28,300,56,120,'#254459',8);ellipse(endX,327,20,20,cp?.solved.length===3?m.color:'#476572');
    ctx.textAlign='center';ctx.font='bold 13px system-ui';ctx.fillStyle='#e9f7ff';ctx.fillText('DISTRICT RELAY',endX,286);
    scientist(player.x,player.y);robot(player.x-55*player.facing,player.y-55);
    ctx.restore();
  }
  function loop(now){const dt=Math.min(.035,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop);}
  function hold(id,key){const b=$(id);b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(!modal()){keys[key].add(e.pointerId);audio.unlock();}};const off=e=>keys[key].delete(e.pointerId);b.onpointerup=off;b.onpointercancel=off;b.onlostpointercapture=off;}
  hold('moveLeft','left');hold('moveRight','right');$('jumpAdventure').onpointerdown=e=>{e.preventDefault();jump();};$('interactAdventure').onclick=interact;
  window.addEventListener('keydown',e=>{if(modal())return;const k=e.key.toLowerCase();if(['a','d','arrowleft','arrowright',' ','arrowup','w','e','p'].includes(k))e.preventDefault();if(['a','arrowleft'].includes(k))keys.left.add('keyboard');if(['d','arrowright'].includes(k))keys.right.add('keyboard');if(!e.repeat){if([' ','arrowup','w'].includes(k))jump();if(k==='e')interact();if(k==='p')pause();}});
  window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(['a','arrowleft'].includes(k))keys.left.delete('keyboard');if(['d','arrowright'].includes(k))keys.right.delete('keyboard');});
  window.addEventListener('blur',()=>{clearInput();if(running&&!modal())pause();});
  document.addEventListener('visibilitychange',()=>{clearInput();checkpoint();if(document.hidden){audio.stop();if(running&&!modal())pause();}});
  window.addEventListener('pagehide',()=>{clearInput();checkpoint();audio.stop();});
  window.addEventListener('resize',()=>{resize();checkpoint();});new ResizeObserver(resize).observe(canvas);
  dialogs.forEach(d=>d.addEventListener('cancel',e=>{e.preventDefault();if(d.id==='homeDialog'&&!running)return;close(d.id);if(!running&&!modal())open('homeDialog');}));
  document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>close(b.dataset.close));
  $('startBtn').onclick=()=>launch(profile.current);$('chooseMission').onclick=missionMap;$('missionsBtn').onclick=missionMap;
  $('storyContinue').onclick=()=>{close('storyDialog');if(ending){ending=false;if(profile.current<A.missions.length-1)launch(profile.current+1);else missionMap();}};
  $('pauseAdventure').onclick=pause;$('resumeAdventure').onclick=()=>close('pauseDialog');$('retryMission').onclick=()=>launch(profile.current,true);$('pauseMap').onclick=()=>{close('pauseDialog');missionMap();};
  $('leaveLab').onclick=()=>{checkpoint();close('labDialog');};$('runTest').onclick=runTest;$('hintBtn').onclick=()=>{labState().hint=true;$('labHint').textContent=m.hint;checkpoint();};$('finishLab').onclick=applyRepair;
  $('settingsBtn').onclick=()=>open('settingsDialog');
  ['music','effects'].forEach(k=>{const input=$(k+'Volume');input.value=profile.settings[k]*100;$(k+'Output').textContent=input.value+'%';input.oninput=()=>{profile.settings[k]=Number(input.value)/100;$(k+'Output').textContent=input.value+'%';audio.unlock();audio.volumes();checkpoint();};});
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;profile.settings.reduced||=reduced;$('reduceMotion').checked=profile.settings.reduced;document.body.classList.toggle('reduce-motion',profile.settings.reduced);
  $('reduceMotion').onchange=()=>{profile.settings.reduced=$('reduceMotion').checked;document.body.classList.toggle('reduce-motion',profile.settings.reduced);checkpoint();};
  // Keep fullscreen reachable during play, within Settings, without crowding the mobile HUD.
  document.addEventListener('DOMContentLoaded',()=>{const host=document.querySelector('#settingsDialog article');document.querySelectorAll('#homeDialog .wga-tab-fullscreen, #homeDialog .wga-tab-status').forEach(control=>host.append(control));});
  A.missions.forEach(mission=>{const im=new Image();im.onload=()=>images[mission.bg]=im;im.src='./assets/backgrounds/'+mission.bg;});
  const completed=Object.values(profile.completed).filter(Boolean).length;$('homeProgress').textContent=completed?`${completed}/5 missions restored • Workshop reputation: ${A.score(profile)}`:'Your workshop is waiting. Meet Pip and begin the recovery.';$('startBtn').textContent=Object.keys(profile.checkpoints).length?'Continue adventure':'Begin adventure';
  resize();open('homeDialog');requestAnimationFrame(loop);
})();
