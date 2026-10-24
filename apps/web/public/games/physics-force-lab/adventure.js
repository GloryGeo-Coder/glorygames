(() => {
  'use strict';
  const A=window.PhysicsAdventure,$=id=>document.getElementById(id),canvas=$('adventureCanvas'),ctx=canvas.getContext('2d');
  let storage;try{storage=window.localStorage;}catch{}
  let profile=A.load(storage),m=A.missions[profile.current],cp=null,running=false,activeLab=-1,ending=false,tested=false,explained=false,storageWarned=false,saveAvailable=true,lesson=null;
  const audio=new window.PhysicsAdventureAudio(profile.settings),keys={left:new Set(),right:new Set()};
  const player={x:80,y:420,vx:0,vy:0,ground:true,facing:1,animation:0,flash:0};
  let width=960,height=540,scale=1,camera=0,time=0,last=performance.now(),saveElapsed=0,nearest=null,images={};
  let terrain=A.route(m),stationX=terrain.stations,endX=terrain.end,length=terrain.length;
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
    checkpoint();closeAll();profile.current=i;m=A.missions[i];terrain=A.route(m);stationX=terrain.stations;endX=terrain.end;length=terrain.length;
    if(retry)delete profile.checkpoints[m.id];
    cp=profile.checkpoints[m.id]||{x:80,solved:[],cells:[],labs:{}};
    profile.checkpoints[m.id]=cp;Object.assign(player,{x:cp.x,y:420,vx:0,vy:0,ground:true,flash:0});
    activeLab=-1;ending=false;running=true;nearest=null;camera=A.clamp(player.x-width*.36,0,Math.max(0,length-width));$('prompt').textContent='';$('interactAdventure').disabled=true;checkpoint();hud();
    $('storyGrade').textContent=`MISSION ${i+1} • GRADE ${m.grade} • ${m.topic}`;
    $('storyTitle').textContent=m.title;$('storyCopy').textContent=m.story;
    $('storyGoal').textContent=`Repair three stations. ${m.concept}`;
    $('storyContinue').textContent=cp.solved.length?'Return to your checkpoint':'Explore the district';
    open('storyDialog');
  }
  function missionMap(){
    $('missionList').replaceChildren();
    A.missions.forEach((mission,i)=>{if(i===0||i===5){const h=document.createElement('h3');h.textContent=i===0?'Chapter one • Academy district':'Chapter two • Recovery district';$('missionList').append(h);}const b=document.createElement('button');b.disabled=!A.isUnlocked(profile,i);const title=document.createElement('strong'),sub=document.createElement('span');title.textContent=`${i+1}. ${mission.title}`;sub.textContent=`Grade ${mission.grade} • ${mission.topic} • ${b.disabled?'Locked':profile.completed[mission.id]?'Restored — replay':'Explore'}`;b.append(title,sub);b.onclick=()=>launch(i,!!profile.completed[mission.id]);$('missionList').append(b);});
    open('mapDialog');
  }
  function showNotebook(){
    const entries=A.notebook(profile);$('notebookProgress').textContent=entries.length?`${entries.length}/${A.missions.length*3} repairs recorded. Your observations stay here when you retry a mission.`:'Complete a repair to add its concept and observations. You can revisit your discoveries here at any time.';
    $('notebookEntries').replaceChildren();
    for(const entry of entries){
      const details=document.createElement('details'),summary=document.createElement('summary'),concept=document.createElement('p'),explanation=document.createElement('p'),trials=document.createElement('ul');
      summary.textContent=`${entry.station} • Grade ${entry.grade}`;concept.textContent=`${entry.mission}: ${entry.concept}`;explanation.textContent=entry.explanation;
      for(const text of entry.observations){const li=document.createElement('li');li.textContent=text;trials.append(li);}
      if(!entry.observations.length){const li=document.createElement('li');li.textContent='This earlier repair is saved. Detailed trial measurements were not recorded.';trials.append(li);}
      details.append(summary,concept,trials,explanation);$('notebookEntries').append(details);
    }
    open('notebookDialog');
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
  function renderHint(){const l=labState();$('labHint').textContent=l.hint?A.hint(m,activeLab,l.hintLevel||1):'';$('hintBtn').textContent=!l.hint?'Need a hint?':l.hintLevel<2?'Another hint':'Review hint';}
  function openLab(index){
    if(cp.solved.includes(index)){notice('Station restored. Retry the mission from Pause to repeat every investigation.');return;}
    activeLab=index;lesson=A.experiment(m,index);cp.labs[index]||=A.cleanLab(lesson);
    tested=false;explained=false;const l=labState(),s=m.stations[index];
    $('labGrade').textContent=`GRADE ${lesson.grade} • ${lesson.topic}`;$('labTitle').textContent=s.name;$('labGoal').textContent=s.goal;
    $('fairTest').textContent=A.simulate(m,index,l.value,l.closed).detail;
    $('predictionQuestion').textContent=lesson.prediction;$('predictionAnswers').replaceChildren();
    A.shuffled(lesson.predictions,lesson.correctPrediction).forEach(answer=>{const b=document.createElement('button');b.textContent=answer.text;const actual=lesson.predictions.indexOf(answer.text);b.setAttribute('aria-pressed',String(l.prediction===actual));b.onclick=()=>{l.prediction=actual;[...$('predictionAnswers').children].forEach(c=>c.setAttribute('aria-pressed',String(c===b)));$('runTest').disabled=false;checkpoint();};$('predictionAnswers').append(b);});
    $('runTest').disabled=l.prediction===null;renderHint();
    $('testResult').textContent=lesson.needsComparison?'Choose a prediction. Compare two different equipment settings, then meet the target and explain your evidence.':'Choose a prediction, adjust the equipment and test your idea.';$('testResult').className='';
    $('reflectStep').hidden=true;$('finishLab').hidden=true;$('reflectionFeedback').textContent='';
    renderEquipment();history();visual();open('labDialog');
  }
  function resetTest(){tested=false;explained=false;$('reflectStep').hidden=true;$('finishLab').hidden=true;$('testResult').textContent='Equipment changed. Run a new experiment to collect evidence.';$('testResult').className='';visual();checkpoint();}
  function renderEquipment(){
    const l=labState(),box=$('equipment');box.replaceChildren();box.className='equipment';
    if(lesson.type==='grid'){renderWireBoard(box);return;}
    const label=document.createElement('label'),name=document.createElement('span');name.textContent=lesson.variable;label.append(name);
    if(lesson.options){const select=document.createElement('select');select.setAttribute('aria-label',lesson.variable);lesson.options.forEach(([value,text])=>select.add(new Option(text,value)));select.value=l.value;select.onchange=()=>{l.value=select.value;resetTest();};label.append(select);}
    else {const input=document.createElement('input'),out=document.createElement('output');input.type='range';input.min=lesson.min;input.max=lesson.max;input.step=lesson.step;input.value=l.value;input.setAttribute('aria-label',lesson.variable);out.textContent=`${l.value} ${lesson.unit}`;input.oninput=()=>{l.value=Number(input.value);out.textContent=`${l.value} ${lesson.unit}`;resetTest();};label.append(input,out);}
    box.append(label);
    if(lesson.type==='circuit'){const switchLabel=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=l.closed;check.onchange=()=>{l.closed=check.checked;resetTest();};switchLabel.append(check,' Close the switch');box.append(switchLabel);}
  }
  function renderWireBoard(box){
    const legend=document.createElement('p');legend.className='wire-legend';legend.textContent='Cell on the left; lamp on the right of the middle row. Tap a wire to rotate it clockwise. The return wire is fixed.';box.append(legend);
    const board=document.createElement('div');board.className='wire-board';board.setAttribute('role','group');board.setAttribute('aria-label','Repair wire board, three rows and three columns');
    const station=m.stations[activeLab];
    for(let i=0;i<9;i++){
      const b=document.createElement('button');b.className='wire-tile';b.type='button';b.disabled=station.board.tiles[i]==='blank';b.dataset.wire=String(i);
      const refresh=()=>{const ports=A.wirePorts(station.board.tiles[i],labState().value[i]),ends={N:[25,0],E:[50,25],S:[25,50],W:[0,25]};b.dataset.rotation=labState().value[i];
        b.innerHTML=`<svg viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="3" fill="#8ce6cb"/>${ports.map(d=>`<path d="M25 25L${ends[d][0]} ${ends[d][1]}" fill="none" stroke="#8ce6cb" stroke-width="5" stroke-linecap="round"/>`).join('')}</svg>`;
        const names={N:'up',E:'right',S:'down',W:'left'};b.setAttribute('aria-label',`Wire row ${Math.floor(i/3)+1}, column ${i%3+1}: ${ports.length?ports.map(p=>names[p]).join(' and ')+'. Rotate clockwise.':'empty space'}`);
      };
      b.onclick=()=>{const l=labState(),digits=l.value.split('');digits[i]=String((Number(digits[i])+1)%4);l.value=digits.join('');refresh();resetTest();};refresh();board.append(b);
    }
    box.append(board);
  }
  function history(){
    $('trialHistory').replaceChildren();labState().trials.forEach((t,i)=>{const r=A.simulate(m,activeLab,t.value,t.closed),li=document.createElement('li');li.textContent=`Trial ${i+1}: ${A.setting(lesson,t,i)} → ${A.observation(lesson,r)}`;$('trialHistory').append(li);});
  }
  function runTest(){
    const l=labState();if(l.prediction===null)return;
    const r=A.simulate(m,activeLab,l.value,l.closed);l.trials.push({value:l.value,closed:l.closed});l.trials=l.trials.slice(-6);tested=r.success&&A.comparisonReady(lesson,l);explained=false;
    $('finishLab').hidden=true;$('reflectionFeedback').textContent='';
    $('testResult').textContent=`Observed: ${A.observation(lesson,r)}. ${r.detail} ${tested?'Target reached. Explain the evidence below.':r.success?'Target reached. Compare another equipment setting before explaining your evidence.':'Target not reached yet. Adjust one factor and test again.'}`;
    $('testResult').className=r.success?'success':'';history();visual(true);checkpoint();
    if(lesson.type==='amplitude')audio.amplitude(l.value);else audio.effect(lesson.type==='sound'?'signal':'test',r.output);
    $('reflectStep').hidden=!tested;
    if(tested){$('reflectionQuestion').textContent=lesson.question;$('reflectionAnswers').replaceChildren();A.shuffled(lesson.answers,lesson.correct).forEach(answer=>{const b=document.createElement('button');b.textContent=answer.text;b.onclick=()=>{explained=answer.correct;$('reflectionFeedback').textContent=answer.correct?lesson.explanation:`Look again at your evidence. ${lesson.hint}`;$('reflectionFeedback').className=answer.correct?'success':'';$('finishLab').hidden=!answer.correct;};$('reflectionAnswers').append(b);});}
  }
  function applyRepair(){
    if(!tested||!explained)return;cp.solved.push(activeLab);A.recordRepair(profile,m,activeLab);checkpoint();close('labDialog');audio.effect('repair');hud();notice(`Repair ${cp.solved.length}/3 complete. ${cp.solved.length===3?'The district relay is ready ahead.':'Follow the route to the next station.'}`);
  }
  function visual(animate=false){
    const l=labState(),r=A.simulate(m,activeLab,l.value,l.closed),v=$('labVisual'),color=lesson.color;
    const line=(x1,y1,x2,y2,c=color)=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${c}" stroke-width="5" fill="none"/>`;
    let content='';
    if(lesson.type==='sound'||lesson.type==='amplitude') {let d='';const amplitude=lesson.type==='amplitude'?r.output*3:24,frequency=lesson.type==='amplitude'?.08:r.output/1400;for(let x=15;x<480;x+=3)d+=`${x===15?'M':'L'}${x},${74+Math.sin(x*frequency)*amplitude}`;content=`<path class="wave-line" d="${d}" fill="none" stroke="${color}" stroke-width="3"/><text x="20" y="26">${lesson.type==='amplitude'?`Vibration height: ${r.output} mm • pitch unchanged`:`Visible vibrations • ${r.output} Hz`}</text>`;}
    else if(lesson.type==='water'){
      const y=94-Number(l.value)*8;content=`<text x="20" y="20">Raised water → falling water → turning wheel</text><rect x="35" y="${y}" width="75" height="22" rx="3" fill="#70cfff"/><path d="M110 ${y+12}H200V90H350" fill="none" stroke="#589bbb" stroke-width="7"/><g class="water-wheel" style="--turns:${Math.min(3,r.output)};transform-origin:380px 85px"><circle cx="380" cy="85" r="31" fill="none" stroke="${color}" stroke-width="5"/>${Array.from({length:8},(_,i)=>`<path d="M380 85L${380+Math.cos(i*Math.PI/4)*29} ${85+Math.sin(i*Math.PI/4)*29}" stroke="${color}" stroke-width="4"/>`).join('')}</g><text x="20" y="135">Release height ${l.value} m • wheel: ${r.output} rotations</text>`;
    }else if(lesson.type==='grid'){
      const trace=A.traceWires(m.stations[activeLab].board,l.value);content=`<path d="M70 60V114H430V60" fill="none" stroke="#57798c" stroke-width="5"/><path d="M70 60H150M350 60H430" fill="none" stroke="${color}" stroke-width="5"/><rect x="56" y="45" width="28" height="30" fill="#183849"/><path d="M59 55H81M64 65H76" stroke="white" stroke-width="4"/><rect x="150" y="36" width="200" height="48" rx="7" fill="#1b4257" stroke="${trace.connected?'#69f2c4':'#88a4b4'}"/><text x="173" y="66">${trace.connected?'Route complete':'Repair the wires'}</text><circle cx="430" cy="60" r="19" fill="${trace.connected?'#ffdd7d':'#34516b'}"/><text x="20" y="137">The fixed return lead closes the loop below.</text>`;
    }else if(lesson.type==='daylight'){
      const angle=Number(l.value)*Math.PI/180,x=230+Math.cos(angle)*43,y=76+Math.sin(angle)*43;
      content=`<text x="20" y="20">Sun stays fixed • Earth rotates • marked city moves</text><circle cx="230" cy="76" r="46" fill="#4894c7"/><path d="M230 30A46 46 0 0 0 230 122Z" fill="#142b4e"/><circle cx="${x}" cy="${y}" r="7" fill="#ffedb0" stroke="#101d2e" stroke-width="2"/><circle cx="410" cy="76" r="29" fill="#ffd877"/><path d="M368 58H305M368 76H305M368 94H305" stroke="#ffd877" stroke-width="2"/><text x="20" y="139">City marker: ${r.detail.replace('The marked city ','')}</text>`;
    }
    else if(lesson.type==='circuit'){content=line(75,40,75,105)+line(75,105,410,105)+line(410,105,410,40)+line(75,40,220,40)+line(270,40,410,40)+line(220,40,270,l.closed?40:18)+`<path d="M60 61H90M65 72H85" stroke="#fff" stroke-width="6"/><circle class="${r.output?'lit':''}" cx="410" cy="45" r="20" fill="${r.output?'#ffdf67':'#34516c'}" stroke="white" stroke-width="3"/><text x="95" y="133">Cell → ${l.value} bridge → lamp • switch ${l.closed?'closed':'open'}</text>`;}
    else {const end=60+Math.min(370,r.output*22),target=lesson.stations[activeLab].target;content=`<rect x="20" y="106" width="460" height="7" rx="3" fill="#557483"/>${lesson.type!=='wheels'?`<rect x="${60+target[0]*22}" y="82" width="${Math.max(14,(target[1]-target[0])*22)}" height="32" fill="#69f2c433" stroke="#69f2c4"/>`:''}<g class="test-object" style="--travel-start:${60-end}px"><rect x="${end-22}" y="72" width="44" height="26" rx="5" fill="${color}"/><circle cx="${end-12}" cy="103" r="7" fill="#d9e8f0"/><circle cx="${end+12}" cy="103" r="7" fill="#d9e8f0"/></g><text x="20" y="25">${lesson.type==='spring'?'Stored spring energy → movement':lesson.type==='wheels'?'Compare the same starting energy':'Energy transferred by a push'}</text><text x="20" y="135">Travel distance: ${r.output} m</text>${lesson.type==='spring'?'<path class="spring-coil" d="M20 85l7 -12 7 24 7 -24 7 24 7 -12" fill="none" stroke="#e0bfff" stroke-width="3"/>':''}`;}
    v.innerHTML=`<svg viewBox="0 0 500 145" aria-hidden="true" style="color:#e8f6ff;font:14px system-ui;fill:currentColor">${content}</svg>`;
    v.setAttribute('aria-label',`${lesson.type} experiment: ${r.detail} ${r.output} ${r.unit}`);v.classList.remove('testing');if(animate&&!profile.settings.reduced){void v.offsetWidth;v.classList.add('testing');}
  }
  function resize(){
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);scale=Math.max(.8,Math.min(1.4,rect.height/500));width=rect.width/scale;height=rect.height/scale;ctx.setTransform(dpr*scale,0,0,dpr*scale,0,0);camera=A.clamp(player.x-width*.36,0,Math.max(0,length-width));
  }
  function update(dt){
    if(!running||modal()||document.hidden)return;
    time+=dt;player.flash=Math.max(0,player.flash-dt);const move=Number(keys.right.size>0)-Number(keys.left.size>0),target=move*265;
    player.vx+=(target-player.vx)*Math.min(1,dt*13);if(move)player.facing=move;
    const barrier=cp.solved.length<3?stationX[[0,1,2].find(i=>!cp.solved.includes(i))]+100:length-55;
    player.x=A.clamp(player.x+player.vx*dt,45,barrier);const previousY=player.y;player.vy+=1250*dt;player.y+=player.vy*dt;
    const floor=A.landingFloor(terrain,player.x,previousY,player.y,player.vy);
    player.ground=player.y>=floor;if(player.ground){player.y=floor;player.vy=0;}
    player.animation+=Math.abs(player.vx)*dt*.04;
    // Malfunctioning maintenance drones patrol a predictable lane; contact costs momentum only.
    for(let i=0;i<(terrain.platforms.length?4:3);i++){const x=droneX(i);if(Math.abs(player.x-x)<35&&player.y>395&&player.flash===0){player.x=Math.max(45,player.x-28);player.vx=-80;player.flash=1.5;audio.effect('bump');notice('Drone contact slowed you down. Jump over its patrol lane.');}}
    for(let i=0;i<12;i++){const {x,y}=A.cell(m,i);if(!cp.cells.includes(i)&&Math.abs(player.x-x)<29&&Math.abs(player.y-35-y)<50){cp.cells.push(i);audio.effect('cell');hud();checkpoint();}}
    nearest=null;for(let i=0;i<3;i++)if(Math.abs(player.x-stationX[i])<95&&!cp.solved.includes(i))nearest={kind:'station',index:i};
    if(Math.abs(player.x-endX)<100)nearest={kind:'exit'};
    $('prompt').textContent=nearest?nearest.kind==='station'?`E / Interact • ${m.stations[nearest.index].name}`:cp.solved.length===3?'E / Interact • Restore district relay':'Three repairs needed':'';
    $('interactAdventure').disabled=!nearest;
    camera+=(A.clamp(player.x-width*.36,0,Math.max(0,length-width))-camera)*Math.min(1,dt*9);
    saveElapsed+=dt;if(saveElapsed>2){checkpoint();saveElapsed=0;}
  }
  function droneX(i){return 1030+i*(terrain.platforms.length?850:800)+Math.sin(time*.85+i)*110;}
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
    const f=profile.settings.reduced?0:Math.sin(time*4+x)*3,wave=profile.settings.reduced?0:Math.sin(time*4)*.2;ctx.save();ctx.translate(x,y+f);ellipse(0,26,21,4,'#03142466');rect(-21,-14,42,29,enemy?'#b15e63':'#f4d18b',10);rect(-16,-9,32,17,'#102d43',6);ellipse(-7,-1,3,4,enemy?'#ffb0ad':'#6af8d7');ellipse(7,-1,3,4,enemy?'#ffb0ad':'#6af8d7');limb(-22,0,wave,14,'#65949e',6);limb(22,0,-wave,14,'#65949e',6);rect(-4,-23,8,10,'#7e9fa6',2);ellipse(0,-25,4,4,enemy?'#ff7272':m.color);if(enemy){ctx.strokeStyle='#adc3ce';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-30,30,profile.settings.reduced?3:2+Math.abs(Math.cos(time*22))*4,0,0,7);ctx.stroke();}ctx.restore();
  }
  function apparatus(x,i){
    const repaired=cp?.solved.includes(i),pulse=profile.settings.reduced?0:Math.sin(time*4+i),type=A.experiment(m,i).type;
    ctx.save();ctx.translate(x-90,0);
    if(type==='sound'||type==='amplitude'){
      rect(-22,318,24,102,'#466a7b',3);rect(-32,306,44,34,repaired?m.color:'#6b8191',8);
      if(repaired){ctx.strokeStyle=m.color;ctx.lineWidth=2;for(let n=0;n<3;n++){ctx.globalAlpha=.65-n*.18;ctx.beginPath();ctx.arc(-10,322,28+n*13+pulse*3,-.7,.7);ctx.stroke();}ctx.globalAlpha=1;}
    }else if(type==='circuit'||type==='grid'){
      rect(-15,345,8,75,'#496b7d',2);ellipse(-11,337,18,22,repaired?'#ffdc84':'#34526a');rect(-28,361,34,8,'#8ba1a8',2);
      if(repaired){const glow=ctx.createRadialGradient(-11,337,8,-11,337,70);glow.addColorStop(0,'#ffe19766');glow.addColorStop(1,'#ffe19700');ctx.fillStyle=glow;ctx.fillRect(-81,267,140,140);}
    }else if(type==='water'){
      rect(-44,304,62,23,'#499fc0',4);rect(-40,309,54,13,'#89e2ff',2);rect(-20,327,7,93,'#315b6f',1);ellipse(18,382,30,30,'#214255');
      const rotation=repaired&&!profile.settings.reduced?time*2:0;ctx.save();ctx.translate(18,382);ctx.rotate(rotation);for(let n=0;n<8;n++){ctx.rotate(Math.PI/4);rect(-3,-28,6,56,repaired?m.color:'#7296aa',2);}ctx.restore();
    }else if(type==='daylight'){
      rect(-16,389,45,31,'#496579',3);limb(6,350,-.6,50,'#aac0c9',20);ellipse(10,337,23,14,repaired?m.color:'#486c86');
    }else{
      const roll=repaired&&!profile.settings.reduced?Math.sin(time*.8+i)*18:0;ctx.translate(roll,0);
      rect(-38,381,67,25,repaired?m.color:'#56717e',4);rect(-30,366,22,15,'#d6b38c',2);rect(-5,359,24,22,'#c49b72',2);
      for(const wx of [-22,15]){ellipse(wx,411,10,10,'#0d2436');ctx.save();ctx.translate(wx,411);ctx.rotate(repaired&&!profile.settings.reduced?time*2:0);ctx.strokeStyle='#a2c9cf';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.moveTo(0,-6);ctx.lineTo(0,6);ctx.stroke();ctx.restore();}
      if(type==='spring'){ctx.strokeStyle='#bcabec';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-84,397);for(let n=0;n<7;n++)ctx.lineTo(-84+n*7,397+(n%2?9:-9));ctx.stroke();}
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
    for(const p of terrain.platforms){rect(p.x,p.y,p.w,11,'#8bacb7',3);rect(p.x+10,p.y+11,8,420-p.y-11,'#3c6174',2);rect(p.x+p.w-18,p.y+11,8,420-p.y-11,'#3c6174',2);for(let j=0;j<6;j++)rect(p.x+18+j*25,p.y+3,12,4,m.color,1);}
    // Persistent, visible workshop restoration: photographs, plants and repaired equipment.
    rect(20,257,260,120,'#132e40',9);rect(33,270,234,93,'#275367',4);
    const done=Object.values(profile.completed).filter(Boolean).length;
    for(let i=0;i<A.missions.length;i++){const x=43+(i%5)*43,y=277+Math.floor(i/5)*42;rect(x,y,32,34,i<done?'#ddc9a0':'#1e4052',2);if(profile.completed[A.missions[i].id]){rect(x+4,y+4,24,22,A.missions[i].color,1);ellipse(x+16,y+15,6,7,'#275367');}}
    rect(30,379,240,10,'#b08762',3);rect(42,390,12,30,'#466171',2);rect(242,390,12,30,'#466171',2);if(profile.completed.cargo)scientist(200,420,'professor');
    for(let i=0;i<12;i++){if(cp?.cells.includes(i))continue;const {x,y}=A.cell(m,i);const bob=profile.settings.reduced?0:Math.sin(time*3+i)*4;ctx.save();ctx.translate(x,y+bob);ctx.rotate(Math.PI/4);rect(-7,-7,14,14,m.color,3);ctx.restore();}
    for(let i=0;i<3;i++){const x=stationX[i],solved=cp?.solved.includes(i);apparatus(x,i);rect(x-37,346,74,74,'#b1c4c6',8);rect(x-29,354,58,38,solved?'#3b947a':'#163e54',5);ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillStyle=solved?'#a5ffcf':m.color;ctx.fillText(solved?'✓':String(i+1),x,381);rect(x-18,401,36,7,solved?'#69f2c4':'#f2b575',3);
      if(!solved){rect(x+93,305,8,115,'#9b6670',3);for(let j=0;j<5;j++)rect(x+93,316+j*21,8,10,'#ffd58d',1);}
    }
    for(let i=0;i<(terrain.platforms.length?4:3);i++)robot(droneX(i),390,true);
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
  $('leaveLab').onclick=()=>{checkpoint();close('labDialog');};$('runTest').onclick=runTest;$('hintBtn').onclick=()=>{const l=labState();l.hint=true;l.hintLevel=Math.min(2,(l.hintLevel||0)+1);renderHint();checkpoint();};$('finishLab').onclick=applyRepair;
  $('settingsBtn').onclick=()=>open('settingsDialog');$('pauseNotebook').onclick=showNotebook;$('settingsNotebook').onclick=showNotebook;
  ['music','effects'].forEach(k=>{const input=$(k+'Volume');input.value=profile.settings[k]*100;$(k+'Output').textContent=input.value+'%';input.oninput=()=>{profile.settings[k]=Number(input.value)/100;$(k+'Output').textContent=input.value+'%';audio.unlock();audio.volumes();checkpoint();};});
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;profile.settings.reduced||=reduced;$('reduceMotion').checked=profile.settings.reduced;document.body.classList.toggle('reduce-motion',profile.settings.reduced);
  $('reduceMotion').onchange=()=>{profile.settings.reduced=$('reduceMotion').checked;document.body.classList.toggle('reduce-motion',profile.settings.reduced);checkpoint();};
  // Keep fullscreen reachable during play, within Settings, without crowding the mobile HUD.
  document.addEventListener('DOMContentLoaded',()=>{const host=document.querySelector('#settingsDialog article');document.querySelectorAll('#homeDialog .wga-tab-fullscreen, #homeDialog .wga-tab-status').forEach(control=>host.append(control));});
  A.missions.forEach(mission=>{const im=new Image();im.onload=()=>images[mission.bg]=im;im.src='./assets/backgrounds/'+mission.bg;});
  $('campaignCount').textContent=`${A.missions.length} adventure missions`;
  const completed=Object.values(profile.completed).filter(Boolean).length;$('homeProgress').textContent=completed?`${completed}/${A.missions.length} missions restored • Workshop reputation: ${A.score(profile)}`:'Your workshop is waiting. Meet Pip and begin the recovery.';$('startBtn').textContent=Object.keys(profile.checkpoints).length?'Continue adventure':'Begin adventure';
  resize();open('homeDialog');requestAnimationFrame(loop);
})();
