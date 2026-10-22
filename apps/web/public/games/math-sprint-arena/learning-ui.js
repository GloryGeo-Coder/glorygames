(function(){
  'use strict';
  const L=window.MathLearning,$=id=>document.getElementById(id);
  let profile=L.normalize(null),storageAvailable=true,mode='adventure',session=null,pausedByVisibility=false;
  try{profile=L.normalize(JSON.parse(localStorage.getItem(L.KEY)||'null'));}catch{storageAvailable=false;}
  const audio=window.MathSound=window.MathArenaAudio.create(window,profile.settings);
  const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
  function status(){ $('saveStatus').textContent=storageAvailable?'Progress saves on this browser':'Saving unavailable · keep this tab open'; }
  function save(){try{localStorage.setItem(L.KEY,JSON.stringify(profile));storageAvailable=true;}catch{storageAvailable=false;}status();}
  function view(name){document.body.dataset.view=name;for(const [id,v]of [['learningHome','home'],['learningPlay','learn'],['learningSummary','summary']])$(id).hidden=name!==v;$('arenaMenu').open=false;}
  function home(){window.MathSprintLegacy?.leave();audio.pause();view('home');renderHome();}
  function renderHome(){
    const done=Object.keys(profile.results).length,practice=$('practiceBrowse').checked;
    $('chapterProgress').textContent=`${done} / ${L.missions.length}`;
    const checkpoint=profile.sessions.adventure;
    $('adventureStart').textContent=checkpoint&&checkpoint.index<5?'Continue Adventure':done===L.missions.length?'Replay Adventure':'Start Adventure';
    $('reviewStart').textContent=profile.sessions.revision&&profile.sessions.revision.index<5?'Continue Review':'Review with Pi-Bot';
    const supported=L.reviewPlan(profile).filter(r=>profile.review[L.taskAt(r).id]?.lastSupported).map(r=>L.missions[r.mission].skill);
    $('reviewFocus').textContent=supported.length?`Review focus: ${[...new Set(supported)].slice(0,3).join(', ')}.`:'Review mixes skills you have practised, with extra help whenever you need it.';
    $('missionList').replaceChildren();
    for(const [i,m]of L.missions.entries()){
      const b=el('button',undefined,'mission-choice');b.type='button';b.dataset.mission=i;b.disabled=!practice&&i>L.unlocked(profile);
      const n=el('span',String(i+1).padStart(2,'0'),'mission-number'),label=el('span',undefined,'mission-label');label.append(el('strong',m.title),el('small',m.skill));
      const r=profile.results[m.id];b.append(n,label,el('span',r?`${L.stars(r)} ★`:b.disabled?'Locked':practice?'Practise':'Play','mission-result'));
      b.addEventListener('click',()=>start(practice?'learn':'adventure',i));$('missionList').append(b);
    }
  }
  function start(nextMode,index,force=false,bankOverride){
    window.MathSprintLegacy?.leave();mode=nextMode;profile.activeMode=mode;
    const old=profile.sessions[mode];
    if(mode==='revision')session=!force&&old&&old.index<5?old:L.freshReview(profile);
    else{
      if(index===undefined)index=old&&old.index<5?old.mission:mode==='adventure'?L.unlocked(profile):0;
      if(mode==='adventure'&&index>L.unlocked(profile))return;
      if(!force&&old&&old.mission===index&&old.index<5)session=old;
      else{const id=L.missions[index].id,visits=profile.practiceVisits[id]||0,bank=mode==='learn'?(bankOverride===undefined?visits%2:bankOverride):0;session=L.fresh(mode,index,bank);if(mode==='learn')profile.practiceVisits[id]=Math.min(10000,visits+1);}
    }
    profile.sessions[mode]=session;view('learn');playMusic();save();renderTask();
  }
  function playMusic(){const index=L.music(session);audio.start(index);$('songTitle').textContent=`Music: ${audio.themes[index].title}`;}
  function feedback(){
    const t=L.current(session),p=session.steps[session.index];if(!t)return;
    $('learningHint').disabled=p.done||p.hints===3;
    $('learningHint').textContent=p.hints===3?'Worked example shown':p.hints?`Next hint (${p.hints}/3)`:'Show a hint';
    $('learningCheck').hidden=p.done;$('learningNext').hidden=!p.done;
    $('learningNext').textContent=session.index===4?mode==='revision'?'Finish review':'Finish mission':'Next activity';
    let message=window.MathLearningTools.essential(t)?'Read the display, then check your answer.':'Take your time. Build or enter your answer, then check it.';
    if(session.feedback==='hint')message=`Hint ${p.hints}/3: ${t.hints[p.hints-1]}`;
    if(session.feedback==='wrong')message=`Not quite yet. ${t.hints[Math.min(p.hints,1)]} Try again when you are ready.`;
    if(p.done)message=`${p.mistakes===0&&p.hints===0?'Solved independently!':'Solved with support. Good persistence!'} ${t.explanation}`;
    $('feedbackText').textContent=message;
    $('learningFeedback').dataset.result=p.done?'correct':session.feedback;
    $('coachSprite').src=`./assets/sprites/bot/bot-${p.done?'celebrate':session.feedback==='wrong'?'point':session.feedback==='hint'?'teach':'idle'}.png`;
    $('coachText').textContent=p.done?'Another part of the city is restored!':session.feedback==='wrong'?'Try a different strategy.':'Think, explore, then check.';
    $('problemGrid').classList.toggle('solved',p.done);
    $('responsePanel').querySelectorAll('button').forEach(b=>{b.disabled=p.done;});
  }
  function updateDraft(value){if(!session||session.index>=5||session.steps[session.index].done)return;session.draft=String(value).slice(0,24);const out=$('entryValue');if(out)out.textContent=session.draft||'…';save();}
  function numberKey(key){
    if(!session||document.body.dataset.view!=='learn'||session.index>=5)return;
    const t=L.current(session);if(['place','fraction','choice','mirror','tile','tally'].includes(t.kind)||session.steps[session.index].done)return;
    let value=session.draft;
    if(key==='delete')value=value.slice(0,-1);else if(/^\d$/.test(key)&&value.length<12)value+=key;else if(key==='.'&&!value.includes('.'))value=(value||'0')+'.';else return;
    updateDraft(value);audio.effect('tap');
  }
  function renderEntry(t){
    const panel=$('responsePanel');panel.className='response-panel';
    const label=el('span',t.kind==='money'?'Your answer in rands':'Your answer','entry-label');
    const out=el('output',session.draft||'…','entry-value');out.id='entryValue';out.setAttribute('aria-label','Your answer');
    const pad=el('div',undefined,'number-pad');
    for(const key of ['1','2','3','delete','4','5','6','.','7','8','9','0']){const b=el('button',key==='delete'?'⌫':key);b.type='button';b.dataset.key=key;b.setAttribute('aria-label',key==='delete'?'Delete last digit':key==='.'?'Decimal point':key);b.addEventListener('click',()=>numberKey(key));pad.append(b);}
    panel.append(label,out,pad);
  }
  function renderPlace(){
    const panel=$('responsePanel');panel.className='response-panel place-panel';
    const digits=String(Math.max(0,Math.min(9999,Number(session.draft)||0))).padStart(4,'0').split('').map(Number);
    const grid=el('div',undefined,'place-grid'),out=el('output',String(Number(digits.join(''))),'entry-value');out.id='entryValue';out.setAttribute('aria-label','Number built');
    ['Thousands','Hundreds','Tens','Ones'].forEach((name,i)=>{
      const col=el('div',undefined,'place-column'),value=el('strong',String(digits[i]));value.id=`placeDigit${i}`;
      const plus=el('button','+'),minus=el('button','−');plus.setAttribute('aria-label',`Increase ${name.toLowerCase()} digit`);minus.setAttribute('aria-label',`Decrease ${name.toLowerCase()} digit`);
      for(const [b,delta]of [[plus,1],[minus,-1]])b.addEventListener('click',()=>{digits[i]=(digits[i]+delta+10)%10;value.textContent=digits[i];updateDraft(Number(digits.join('')));audio.effect('move');});
      col.append(el('small',name),plus,value,minus);grid.append(col);
    });
    panel.append(el('span','Build the four place-value columns','entry-label'),grid,out);
  }
  function renderFraction(t){
    const panel=$('responsePanel');panel.className='response-panel fraction-panel';
    const count=session.draft.includes('/')?Math.max(0,Math.min(t.parts,Number(session.draft.split('/')[0])||0)):0;
    const selected=new Set(Array.from({length:count},(_,i)=>i));const bridge=el('div',undefined,'fraction-parts');bridge.style.setProperty('--parts',String(t.parts));
    const out=el('output',`${selected.size}/${t.parts}`,'entry-value');out.id='entryValue';out.setAttribute('aria-label','Fraction selected');
    for(let i=0;i<t.parts;i++){const b=el('button',String(i+1));b.type='button';b.setAttribute('aria-label',`Bridge part ${i+1}`);b.setAttribute('aria-pressed',String(selected.has(i)));b.addEventListener('click',()=>{selected.has(i)?selected.delete(i):selected.add(i);b.setAttribute('aria-pressed',String(selected.has(i)));updateDraft(`${selected.size}/${t.parts}`);audio.effect('move');});bridge.append(b);}
    panel.append(el('p',`Each button is one of ${t.parts} equal parts. Tap ${t.take} parts.`),bridge,out);
  }
  function drawVisual(t){
    const v=$('visualContent');v.replaceChildren();
    if(window.MathLearningTools.draw(t,v))return;
    if(t.kind==='place'){
      const value=t.value;const bands=el('div',undefined,'value-bands');
      for(const [name,n,unit]of [['Thousands',Math.floor(value/1000),1000],['Hundreds',Math.floor(value/100)%10,100],['Tens',Math.floor(value/10)%10,10],['Ones',value%10,1]]){const row=el('div');row.append(el('span',name),el('b',`${n} × ${unit}`));bands.append(row);}v.append(bands);
    } else if(t.kind==='line'){
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 440 120');svg.setAttribute('role','img');svg.setAttribute('aria-label',`Number line starting at ${t.a}, moving ${Math.abs(t.b)} ${t.b>0?'forward':'backward'}`);
      const x=t.b>0?60:380,end=t.b>0?380:60;
      svg.innerHTML=`<path d="M30 85H410 M${x} 75V95 M${end} 75V95" stroke="#81e9ff" stroke-width="4" fill="none"/><path d="M${x} 68 Q220 -10 ${end} 68" fill="none" stroke="#ffe38a" stroke-width="4"/><text x="${x}" y="115" text-anchor="middle" fill="white" font-size="22">${t.a}</text><text x="220" y="30" text-anchor="middle" fill="#ffe38a" font-size="22">${t.b>0?'+':'−'} ${Math.abs(t.b)}</text><text x="${end}" y="115" text-anchor="middle" fill="white" font-size="22">?</text>`;v.append(svg);
    } else if(t.kind==='array'){
      const a=el('div',undefined,'array-diagram');a.style.setProperty('--columns',Math.min(t.each,12));a.setAttribute('aria-label',`${t.groups} equal groups of ${t.each}`);
      if(t.each<=12)for(let i=0;i<t.groups*t.each;i++)a.append(el('i'));else for(let i=0;i<t.groups;i++)a.append(el('span',`${t.each} cells`));v.append(a,el('p',`${t.groups} equal groups × ${t.each} in each group`));
    } else if(t.kind==='share'){
      const groups=el('div',undefined,'generator-groups');for(let i=0;i<t.groups;i++)groups.append(el('span','?'));v.append(el('b',`${t.total} energy cells`),groups,el('p',`${t.groups} generators · equal shares`));
    } else if(t.kind==='pattern'){
      const track=el('div',undefined,'pattern-diagram');for(const n of [...t.values,'?'])track.append(el('span',String(n)));v.append(track);
    } else if(t.kind==='perimeter'){
      const rectangle=el('div',undefined,'rectangle-diagram');rectangle.append(el('span',`${t.length} m`),el('b',`${t.width} m`));v.append(rectangle,el('p','Find the distance around all four sides.'));
    } else if(t.kind==='fraction'){
      const f=el('div',undefined,'fraction-target');f.append(el('span',String(t.take)),el('span',String(t.parts)));v.append(f,el('p','Equal parts make one whole.'));
    } else if(t.kind==='money'){
      v.append(el('div','R','money-symbol'),el('p','100 cents = R1.00'));
    } else {
      const calculation=el('div',undefined,'column-calculation');calculation.append(el('span',String(t.a)),el('span',`${t.op} ${t.b}`),el('strong','?'));v.append(calculation);
    }
  }
  function renderTask(){
    if(session.index>=5){summary();return;}
    const m=L.origin(session),t=L.current(session);
    document.body.style.setProperty('--learning-backdrop',`url("./assets/backgrounds/bg-${m.background}.png")`);
    $('learningMode').textContent=`${mode==='revision'?'Review':mode==='learn'?'Learn':'Adventure'} · Untimed${mode==='learn'&&session.bank===1?' · Fresh set':''}`;$('learningTitle').textContent=m.title;$('taskCount').textContent=`${session.index+1} / 5`;$('taskProgress').value=session.steps.filter(p=>p.done).length;
    $('menuMissionStory').textContent=`${m.story} ${m.lesson}`;
    $('learningSkill').textContent=`Grade 4 · ${m.skill}`;$('learningPrompt').textContent=t.prompt;$('learningLesson').textContent=session.index===0?m.story:m.lesson;
    $('responsePanel').replaceChildren();drawVisual(t);
    const essential=window.MathLearningTools.essential(t);$('problemGrid').dataset.essential=String(essential);$('problemGrid').dataset.kind=t.kind;$('visualPanel').dataset.essential=String(essential);
    $('visualPanel').setAttribute('role',essential?'button':'group');$('visualPanel').tabIndex=essential?0:-1;$('visualPanel').setAttribute('aria-label',essential?'Enlarge the diagram for this activity':'Activity model');
    if(window.MathLearningTools.renderResponse(t,session,{panel:$('responsePanel'),onChange:updateDraft,effect:kind=>audio.effect(kind)})){}
    else if(t.kind==='place')renderPlace();else if(t.kind==='fraction')renderFraction(t);else renderEntry(t);
    feedback();$('learningPrompt').focus({preventScroll:true});
  }
  function summary(){
    view('summary');
    const independent=session.steps.filter(p=>p.mistakes===0&&p.hints===0).length;
    const last=session.mission===L.missions.length-1,review=mode==='revision',practice=mode==='learn';
    const title=L.missions[session.mission].title;
    $('summaryMode').textContent=review?'Review · Session complete':practice?'Learn · Practice complete':'Adventure · Mission complete';
    if(review){
      $('summaryTitle').textContent='Good work, maths explorer!';
      $('summaryMessage').textContent='Pi-Bot has recorded your practice. Revisit a strategy, try a fresh set, or return to your Adventure checkpoint.';
    }else if(practice){
      $('summaryTitle').textContent=`${title}: practice complete`;
      $('summaryMessage').textContent='Try a fresh set to practise with different questions, review familiar skills, or return to your saved Adventure.';
    }else{
      $('summaryTitle').textContent=last?'Number City exhibition ready!':`${title} restored!`;
      $('summaryMessage').textContent=last?'The city exhibition celebrates everything you have practised. Revisit a topic, try Review, or play the timed Sprint when you feel ready.':session.mission===9?'The first Number Gates are restored! The next district has shapes, measurements, timetables and surveys to explore.':'Your maths has brought another part of the city to life. Try a fresh practice set or continue your journey.';
    }
    $('summaryResult').textContent=`${independent} independent · ${5-independent} with support · 5 activities completed`;
    $('nextMission').hidden=!review&&last;
    $('nextMission').textContent=review?'Another review':practice?'Next practice topic':'Next mission';
    $('retryMission').textContent='Try a fresh practice set';
    $('summaryTitle').tabIndex=-1;$('summaryTitle').focus({preventScroll:true});
  }
  $('learningCheck').addEventListener('click',()=>{if(!session||session.index>=5)return;const t=L.current(session),value=session.draft||(['place','fraction','mirror','tile','tally'].includes(t.kind)?t.kind==='fraction'?`0/${t.parts}`:'0':'');const r=L.submit(session,value);if(r.ignored)return;if(r.empty){$('feedbackText').textContent=t.kind==='choice'?'Choose a shape, then check your answer.':'Enter a number using the keypad or your keyboard, then check it.';return;}audio.effect(r.ok?'correct':'wrong');save();feedback();if(r.ok){$('taskProgress').value=session.steps.filter(p=>p.done).length;$('learningNext').focus({preventScroll:true});}});
  $('learningHint').addEventListener('click',()=>{if(L.hint(session)){audio.effect('hint');save();feedback();}});
  $('learningNext').addEventListener('click',()=>{if(L.advance(profile,session)){save();if(session.index===5){audio.effect('complete');summary();}else renderTask();}});
  $('adventureStart').addEventListener('click',()=>start('adventure'));$('learnStart').addEventListener('click',()=>start('learn'));$('reviewStart').addEventListener('click',()=>start('revision'));
  $('practiceBrowse').addEventListener('change',renderHome);
  $('nextMission').addEventListener('click',()=>mode==='revision'?start('revision',undefined,true):start(mode,session.mission+1,true));$('retryMission').addEventListener('click',()=>start('learn',L.reference(session).mission,true,(L.reference(session).bank||0)===0?1:0));
  for(const id of ['arenaHome','returnHome','summaryHome'])$(id).addEventListener('click',home);
  $('sprintStart').addEventListener('click',()=>{audio.pause();view('sprint');window.MathSprintLegacy?.enter();});
  for(const [id,kind]of [['musicVolume','music'],['effectsVolume','sfx']]){$(id).value=profile.settings[kind]*100;$(id).addEventListener('input',()=>{profile.settings[kind]=Number($(id).value)/100;audio.volume(kind,profile.settings[kind]);save();});}
  document.addEventListener('keydown',e=>{
    if($('diagramDialog').open)return;
    if(document.body.dataset.view!=='learn'||e.altKey||e.ctrlKey||e.metaKey||$('arenaMenu').open||e.target?.tagName==='INPUT')return;
    if(/^\d$/.test(e.key)||['Backspace','Delete','.',','].includes(e.key)){playMusic();e.preventDefault();numberKey(['Backspace','Delete'].includes(e.key)?'delete':e.key===','?'.':e.key);}
    if(e.key==='Enter'&&e.target?.tagName!=='BUTTON'){e.preventDefault();if(!$('learningNext').hidden)$('learningNext').click();else $('learningCheck').click();}
  });
  $('arenaMenu').addEventListener('toggle',()=>{if($('arenaMenu').open)window.MathSprintLegacy?.pauseForVisibility();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pausedByVisibility=true;audio.pause();window.MathSprintLegacy?.pauseForVisibility();save();}else if(pausedByVisibility){pausedByVisibility=false;/* Audio resumes only after the next user interaction. */}});
  document.addEventListener('pointerdown',()=>{if(document.body.dataset.view==='learn'&&session)playMusic();},{passive:true});
  function enlargeDiagram(){
    if(document.body.dataset.view!=='learn'||!session||session.index>=5||!window.MathLearningTools.essential(L.current(session)))return;
    const copy=$('visualContent').cloneNode(true);copy.removeAttribute('id');$('diagramContent').replaceChildren(copy);$('diagramTitle').textContent=L.current(session).prompt;
    if(typeof $('diagramDialog').showModal==='function')$('diagramDialog').showModal();else $('diagramDialog').setAttribute('open','');
  }
  $('visualPanel').addEventListener('click',enlargeDiagram);
  $('visualPanel').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&$('visualPanel').dataset.essential==='true'){e.preventDefault();e.stopPropagation();enlargeDiagram();}});
  $('closeDiagram').addEventListener('click',()=>{if(typeof $('diagramDialog').close==='function')$('diagramDialog').close();else $('diagramDialog').removeAttribute('open');$('visualPanel').focus({preventScroll:true});});
  const sizePrompt=()=>{$('learningPlay').style.setProperty('--prompt-height',`${document.querySelector('.learning-question').getBoundingClientRect().height}px`);};
  if(window.ResizeObserver)new ResizeObserver(sizePrompt).observe(document.querySelector('.learning-question'));window.addEventListener('resize',sizePrompt);
  window.addEventListener('pagehide',()=>{save();audio.pause();});
  // Reuse the platform's single fullscreen button in the shared, always-reachable menu.
  const moveFullscreen=()=>{const button=document.querySelector('.wga-tab-fullscreen');if(!button)return false;const status=document.querySelector('.wga-tab-status');$('arenaMenuBody').append(button);if(status)$('arenaMenuBody').append(status);return true;};
  if(!moveFullscreen()){const observer=new MutationObserver(()=>{if(moveFullscreen())observer.disconnect();});observer.observe(document.body,{subtree:true,childList:true});}
  window.MathArenaApp={home,start,get profile(){return JSON.parse(JSON.stringify(profile));}};
  status();renderHome();
})();
