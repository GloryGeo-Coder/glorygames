/* The world atlas keeps the canonical URL and score slug map-master-africa. */
(function(root){
 'use strict';
 function create(win,doc){
  const $=id=>doc.getElementById(id),C=win.AcademyContent,G=win.AtlasGeometry,V=win.AtlasView,D=win.MapAtlasData;
  if(!C||!G||!V||!D||!win.AcademyEngine){$('loadStatus').textContent='The atlas could not load. Reload this page to try again.';return null;}
  let storage=null;try{storage=win.localStorage;}catch{}
  const engine=win.AcademyEngine.create(C.missions,storage),audio=win.AcademyAudio.create(win),svg=$('atlas'),view=V.create(svg,G,D,C),app=doc.querySelector('.app-shell');
  const panels=['menu','brief','summary','keyPanel','searchPanel'],handlers=[],pointers=new Map();
  let paused=true,exploring=false,platformMuted=false,frameId=0,lastQuestion='',selection=null,disposed=false,viewport={w:win.innerWidth,h:win.innerHeight};
  const on=(el,type,fn,options)=>{el.addEventListener(type,fn,options);handlers.push(()=>el.removeEventListener(type,fn,options));};
  const modal=()=>panels.find(id=>!$(id).hidden),active=()=>!paused&&!modal()&&!disposed,announce=text=>{$('liveStatus').textContent=text;};
  function clearPointers(){const ids=[...pointers.keys()];pointers.clear();for(const id of ids)try{if(svg.hasPointerCapture?.(id))svg.releasePointerCapture(id);}catch{}}
  function configureAudio(){const muted=engine.prefs.muted||platformMuted;audio.configure({...engine.prefs,muted});if(active()&&!muted){audio.play(exploring?4:engine.state.mission);schedule();}}
  function frame(){frameId=0;if(active()){audio.tick();schedule();}}
  function schedule(){if(!frameId&&win.requestAnimationFrame&&!engine.prefs.muted&&!platformMuted&&engine.prefs.musicVolume>0)frameId=win.requestAnimationFrame(frame);}
  function stop(){paused=true;audio.pause();clearPointers();if(frameId){win.cancelAnimationFrame?.(frameId);frameId=0;}}
  function showPanel(id,focusId){stop();for(const p of panels)$(p).hidden=p!==id;app.inert=true;if(focusId)$(focusId).focus({preventScroll:true});}
  function closePanels(){for(const p of panels)$(p).hidden=true;app.inert=false;paused=false;configureAudio();schedule();}
  function postScore(final=false){const score=engine.score(),payload={type:'GG_SCORE',gameSlug:'map-master-africa',slug:'map-master-africa',score,best:engine.legacyBest,level:engine.state.mission+1};
   try{win.GG=win.GG||{};win.GG.slug='map-master-africa';win.GG.setScore?.(score);win.postMessage(payload,win.location.origin);if(win.parent!==win)win.parent.postMessage(payload,win.location.origin);if(final)win.GG.submitScore?.({score,gameSlug:'map-master-africa'});}catch{}
  }
  function refreshMenu(){
   const p=engine.progress,complete=p.best.filter(m=>m.scores.every(n=>n>0)).length,stars=p.best.reduce((n,m)=>n+m.stars,0);
   $('scoreValue').textContent=engine.score();$('starsValue').textContent=stars+' / 15';
   $('startBtn').textContent=engine.state.phase==='home'?(complete===5?'Revisit Map Academy':'Continue expedition '+(p.resume.mission+1)):'Resume expedition';
   if(complete===0&&engine.score()===0&&engine.state.phase==='home')$('startBtn').textContent='Start expedition';
   $('missionList').replaceChildren();
   C.missions.forEach((m,i)=>{const b=doc.createElement('button');b.className='mission-card';b.disabled=i>=p.unlocked;b.setAttribute('aria-label',(i+1)+'. '+m.title+'. '+(b.disabled?'Complete the previous expedition to unlock':p.best[i].stars+' stars'));
    b.innerHTML='<span class="mission-number">'+(i+1)+'</span><span><strong>'+V.esc(m.title)+'</strong><small>'+V.esc(m.skill)+'</small></span><span class="mission-stars">'+(b.disabled?'Locked':'★'.repeat(p.best[i].stars)+'☆'.repeat(3-p.best[i].stars))+'</span>';
    b.addEventListener('click',()=>startMission(i,p.best[i].scores.every(n=>n>0)));$('missionList').appendChild(b);
   });
   $('journalSummary').textContent=complete+' of 5 expeditions completed · '+engine.score()+' Atlas XP · '+stars+' stars';
   $('journalList').replaceChildren();C.missions.forEach((m,i)=>{const row=doc.createElement('div');row.className='journal-row';const a=doc.createElement('span'),b=doc.createElement('b');a.textContent=m.badge;b.textContent=p.best[i].scores.filter(n=>n===100).length+' / 6 independent';row.append(a,b);$('journalList').appendChild(row);});
   $('storageStatus').textContent=engine.persistent?'Progress saves on this browser.':'Browser storage is unavailable. You can play, but progress may not survive closing this tab.';
   $('bestText').textContent='Best score: '+engine.legacyBest+'. Previous Explorer Missions best scores are retained.';
   $('musicVolume').value=String(engine.prefs.musicVolume);$('effectsVolume').value=String(engine.prefs.effectsVolume);$('muteBtn').textContent=engine.prefs.muted?'Sound off':'Sound on';
  }
  function render(reset=false){
   refreshMenu();const m=engine.mission(),q=engine.question(),s=engine.state;
   $('exploreTools').hidden=!exploring;$('feedback').hidden=exploring||s.phase!=='feedback';$('choiceList').hidden=exploring||s.phase!=='question'||q.type!=='choice';$('hintText').hidden=true;
   $('hintBtn').disabled=exploring||s.phase!=='question';$('findBtn').disabled=!exploring&&m.context!=='world';
   if(exploring){
    view.context('world');if(reset)view.reset();$('missionLabel').textContent='WORLD EXPLORER';$('taskSkill').textContent='Explore at your own pace';$('taskNumber').textContent='242 mapped places';$('taskProgress').style.width='100%';$('questionText').textContent='Where will you go next?';$('taskInstruction').textContent='Choose a country or territory to begin an atlas discovery.';$('mapCaption').textContent='World atlas';$('mapCredit').textContent='Natural Earth · geographic overview';return;
   }
   view.context(m.context);
   if(reset||lastQuestion!==q.id){if(m.context==='world')view.region(q.region||'World');else view.reset();selection=q.focus||null;lastQuestion=q.id;}
   $('missionLabel').textContent=(s.mission+1)+' / 5 · '+m.title;$('taskSkill').textContent=m.skill;$('taskNumber').textContent=(s.index+1)+' / '+m.questions.length;
   $('taskProgress').style.width=((s.index+(s.phase==='feedback'&&s.feedback.correct?1:0))/m.questions.length*100)+'%';
   $('questionText').textContent=q.prompt;$('taskInstruction').textContent=q.type==='choice'?'Study the map, then choose an answer.':q.type==='country'?'Tap the country outline. Find opens a close-up and uses a hint.':q.type==='route'?'Tap each square in order. Dragging moves the map; it does not answer.':'Tap a grid square. Use Map key for the symbols.';
   $('mapCaption').textContent=m.context==='town'?'Community practice map':q.region||'World atlas';$('mapCredit').textContent=m.context==='town'?'Fictional town · 100 m per neighbouring-centre move':'Natural Earth · geographic overview';
   $('choiceList').replaceChildren();
   if(q.type==='choice')for(const option of q.options){const b=doc.createElement('button');b.textContent=option.label;b.dataset.answer=option.id;b.addEventListener('click',()=>submit(option.id));$('choiceList').appendChild(b);}
   let marker=selection;if(s.hinted&&s.phase==='question')marker=q.type==='route'?q.answer[s.route.length]:q.answer;
   view.mark(marker,{route:s.route,from:q.highlight,to:q.destination,hint:s.hinted,hideNames:m.id==='symbols'});
   if(s.phase==='feedback'){$('feedback').classList.toggle('retry',!s.feedback.correct);$('feedbackTitle').textContent=s.feedback.correct?'Discovery recorded · '+s.feedback.earned+' XP':'A clue for your next attempt';$('feedbackText').textContent=s.feedback.explanation;$('continueBtn').textContent=s.feedback.correct?'Continue':'Try again';}
   else if(s.hinted){$('hintText').hidden=false;$('hintText').textContent=q.hint;}
  }
  function startMission(index,replay=false){if(!engine.start(index,{replay}))return;exploring=false;lastQuestion='';selection=null;render(true);const m=engine.mission();$('briefTag').textContent='EXPEDITION '+(index+1)+' · '+m.skill.toUpperCase();$('briefTitle').textContent=m.title;$('briefStory').textContent=m.brief;$('briefLesson').textContent=m.lesson;showPanel('brief','beginBtn');}
  function openMenu(journal=false,message=''){refreshMenu();showPanel('menu','startBtn');$('loadStatus').textContent=message||'Five expeditions · unlimited world exploration';if(journal){$('journalDetails').open=true;$('journalDetails').querySelector('summary').focus({preventScroll:true});}}
  function resume(){
   if(engine.state.phase==='home'){const all=engine.progress.best.every(m=>m.scores.every(n=>n>0));startMission(all?0:engine.progress.resume.mission,all);return;}
   exploring=false;lastQuestion='';render(true);
   if(engine.state.phase==='brief'){const m=engine.mission();$('briefTitle').textContent=m.title;$('briefStory').textContent=m.brief;$('briefLesson').textContent=m.lesson;showPanel('brief','beginBtn');}
   else if(engine.state.phase==='summary')showSummary();else{closePanels();svg.focus({preventScroll:true});}
  }
  function beginExplore(){exploring=true;selection=null;lastQuestion='';render(true);$('countryName').textContent='Choose a country or territory';$('countryDetail').textContent='Tap an outline, or use Find to open a close-up.';closePanels();svg.focus({preventScroll:true});}
  function submit(value){if(!active()||exploring)return;clearPointers();const result=engine.answer(value);if(!result)return;if(!result.partial){audio.effect(result.correct?'correct':'retry');postScore();}render();if(!result.partial)$('continueBtn').focus({preventScroll:true});else announce(engine.state.route.length+' route squares recorded.');}
  function showSummary(){const s=engine.state,m=engine.mission(),record=engine.progress.best[s.mission];$('badgeTitle').textContent=m.badge.toUpperCase();$('summaryTitle').textContent='Expedition recorded';$('summaryText').textContent='Your best result is '+record.stars+' star'+(record.stars===1?'':'s')+' for this expedition. '+(s.mission<4?'Your next expedition is unlocked.':'Your Map Academy atlas is complete. Explore the world or revisit any skill to improve your results.');$('nextMissionBtn').hidden=s.mission===4;showPanel('summary',s.mission===4?'exploreAfterBtn':'nextMissionBtn');audio.effect('complete');}
  function hint(){if(!active()||exploring)return;const text=engine.hint();if(!text)return;audio.effect('hint');if(engine.question().type==='country')view.focus(engine.question().answer);render();announce(text);}
  function selectedCountry(id,{focus=false}={}){const c=D.countries.find(c=>c.id===id);if(!c)return;selection=id;if(focus)view.focus(id);else view.mark(id);$('countryName').textContent=c.name;$('countryDetail').textContent='Geographic region: '+c.region+'. Atlas marker: '+Math.abs(c.label[1]).toFixed(1)+'° '+(c.label[1]<0?'S':'N')+', '+Math.abs(c.label[0]).toFixed(1)+'° '+(c.label[0]<0?'W':'E')+'.';announce(c.name+', '+c.region);}
  function selectMap(point){if(!active())return;if(exploring){if(point.country)selectedCountry(point.country.id);return;}const q=engine.question();if(q.type==='country'&&point.country){selection=point.country.id;submit(point.country.id);}else if((q.type==='cell'||q.type==='route')&&point.cell){selection=point.cell;submit(point.cell);}}
  function showKey(){const world=view.mode==='world';$('keyTitle').textContent=world?'World atlas key':'Community map key';$('keyItems').replaceChildren();if(world){for(const [region,colour]of Object.entries(V.palette)){const el=doc.createElement('div');el.className='key-item';const swatch=doc.createElement('span');swatch.className='legend-swatch';swatch.style.backgroundColor=colour;swatch.setAttribute('aria-hidden','true');const label=doc.createElement('span');label.textContent=region==='Seven seas (open ocean)'?'Oceanic territories':region;el.append(swatch,label);$('keyItems').appendChild(el);}}else for(const p of C.places){const el=doc.createElement('div');el.className='key-item';el.innerHTML=V.icon(p.symbol)+'<span>'+V.esc(p.name)+'</span>';$('keyItems').appendChild(el);}$('keyNote').textContent=world?'Outlines show countries and territories. A gold outline marks a selection; the dashed line is the Equator. Grid lines are spaced 30 degrees apart. North is up. Colours group geographic regions.':'Read a column letter before a row number. Each symbol matches the same symbol on the fictional town plan. The north arrow keeps directions clear.';showPanel('keyPanel','closeKeyBtn');}
  function closeUtility(id){$(id).hidden=true;app.inert=false;paused=false;configureAudio();schedule();svg.focus({preventScroll:true});}
  const searchable=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),sorted=[...D.countries].sort((a,b)=>a.name.localeCompare(b.name));
  function results(){const term=searchable($('countrySearch').value.trim());$('searchResults').replaceChildren();for(const c of sorted.filter(c=>!term||searchable(c.name).includes(term)).slice(0,12)){const b=doc.createElement('button');b.textContent=c.name;b.dataset.country=c.id;b.addEventListener('click',()=>{$('countrySelect').value=c.id;chooseFound(false);});$('searchResults').appendChild(b);}if(!$('searchResults').children.length){const p=doc.createElement('p');p.textContent='No matching place. Try another spelling or use the full atlas list.';$('searchResults').appendChild(p);}}
  function openSearch(){if(!active()||view.mode!=='world')return;if(!exploring&&engine.state.phase==='question'){engine.hint();render();}$('searchNote').textContent=exploring?'Choose any country or territory to open its close-up.':'Find is a guided hint. Open a close-up, then tap its outline or select the country from this list.';$('selectCountryBtn').hidden=exploring||engine.state.phase!=='question'||engine.question().type!=='country';$('countrySearch').value='';results();showPanel('searchPanel','countrySearch');}
  function chooseFound(answer){const id=$('countrySelect').value,c=D.countries.find(c=>c.id===id);if(!c)return;closeUtility('searchPanel');selectedCountry(id,{focus:true});if(answer&&!exploring)submit(id);}
  function zoom(factor){if(active())view.zoom(factor);}
  function endPointer(e,cancelled=false){const p=pointers.get(e.pointerId);if(!p)return;pointers.delete(e.pointerId);try{if(svg.hasPointerCapture?.(e.pointerId))svg.releasePointerCapture(e.pointerId);}catch{}if(!cancelled&&!p.moved&&active())selectMap(view.locate(e));}
  on(svg,'pointerdown',e=>{if(!active()||e.button>0)return;e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false});try{svg.setPointerCapture(e.pointerId);}catch{}if(pointers.size>1)for(const p of pointers.values())p.moved=true;});
  on(svg,'pointermove',e=>{const p=pointers.get(e.pointerId);if(!p||!active())return;e.preventDefault();const old=[...pointers.values()].map(p=>({...p})),dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;const rect=svg.getBoundingClientRect();
   if(pointers.size===1){if(Math.hypot(p.x-p.startX,p.y-p.startY)>8)p.moved=true;if(p.moved){const f=G.fit(rect.width,rect.height,view.view);view.pan(-dx/f.scale,-dy/f.scale);}}
   else if(pointers.size===2){const curr=[...pointers.values()],dist=a=>Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y),a={x:(old[0].x+old[1].x)/2-rect.left,y:(old[0].y+old[1].y)/2-rect.top},b={x:(curr[0].x+curr[1].x)/2-rect.left,y:(curr[0].y+curr[1].y)/2-rect.top},anchor=G.unscreen(a,rect.width,rect.height,view.view);if(dist(old)>1)view.zoom(dist(curr)/dist(old),anchor);const f=G.fit(rect.width,rect.height,view.view);view.pan((a.x-b.x)/f.scale,(a.y-b.y)/f.scale);}
  });
  on(svg,'pointerup',e=>endPointer(e));on(svg,'pointercancel',e=>endPointer(e,true));on(svg,'lostpointercapture',e=>endPointer(e,true));
  on(svg,'wheel',e=>{if(!active()||e.ctrlKey)return;e.preventDefault();view.zoom(Math.exp(-e.deltaY*.001),view.locate(e).point);},{passive:false});
  on(svg,'keydown',e=>{if(!active())return;const cell=e.target.closest?.('[data-cell]')?.getAttribute('data-cell'),country=e.target.closest?.('[data-country]')?.getAttribute('data-country');
   if(e.key==='Enter'||e.key===' '){e.preventDefault();if(cell)selectMap({cell});else if(country)selectMap({country:D.countries.find(c=>c.id===country)});else{const r=svg.getBoundingClientRect();selectMap(view.locate({clientX:r.left+r.width/2,clientY:r.top+r.height/2}));}return;}
   const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
   if(arrows[e.key]){e.preventDefault();const[x,y]=arrows[e.key];if(cell){const p=G.cell(cell),next=G.cellAt({x:G.clamp(p.x+x,0,4.9),y:G.clamp(p.y+y,0,4.9)});svg.querySelector('[data-cell="'+next+'"]').focus({preventScroll:true});}else view.pan(view.view.w*.08*x,view.view.h*.08*y);}
   else if(e.key==='+'||e.key==='='){e.preventDefault();view.zoom(1.4);}else if(e.key==='-'){e.preventDefault();view.zoom(1/1.4);}else if(e.key==='Home'){e.preventDefault();view.reset();}
  });
  on(doc,'keydown',e=>{const panel=modal();if(e.key==='Escape'){e.preventDefault();if(panel==='keyPanel'||panel==='searchPanel')closeUtility(panel);else if(panel==='menu'&&engine.state.phase!=='home')resume();else if(!panel)openMenu();return;}
   if(e.key==='Tab'&&panel){const nodes=[...$(panel).querySelectorAll('button:not(:disabled),input,select,summary,[tabindex="0"]')].filter(n=>!n.closest('[hidden]')&&(n.tagName==='SUMMARY'||!n.closest('details:not([open])')));if(!nodes.length)return;const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&(doc.activeElement===first||!$(panel).contains(doc.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(doc.activeElement===last||!$(panel).contains(doc.activeElement))){e.preventDefault();first.focus();}}
  });
  on($('startBtn'),'click',resume);on($('beginBtn'),'click',()=>{if(engine.begin()){render();closePanels();svg.focus({preventScroll:true});}});
  on($('continueBtn'),'click',()=>{if(!active()||exploring)return;clearPointers();if(!engine.next())return;if(engine.state.phase==='summary')showSummary();else{render();(engine.question().type==='choice'?$('choiceList').querySelector('button'):svg)?.focus({preventScroll:true});}});
  on($('menuBtn'),'click',()=>openMenu());on($('briefMenuBtn'),'click',()=>openMenu());on($('homeBtn'),'click',()=>openMenu(true));on($('journalBtn'),'click',()=>openMenu(true));
  on($('exploreBtn'),'click',beginExplore);on($('exploreAfterBtn'),'click',beginExplore);on($('nextMissionBtn'),'click',()=>startMission(engine.state.mission+1));
  on($('replayBtn'),'click',()=>startMission(engine.state.mission,true));on($('restartBtn'),'click',()=>startMission(engine.state.mission,true));
  on($('hintBtn'),'click',hint);on($('keyBtn'),'click',showKey);on($('closeKeyBtn'),'click',()=>closeUtility('keyPanel'));
  on($('findBtn'),'click',openSearch);on($('countrySearch'),'input',results);on($('locateBtn'),'click',()=>chooseFound(false));on($('selectCountryBtn'),'click',()=>chooseFound(true));on($('closeSearchBtn'),'click',()=>closeUtility('searchPanel'));
  on($('zoomInBtn'),'click',()=>zoom(1.4));on($('zoomOutBtn'),'click',()=>zoom(1/1.4));on($('resetViewBtn'),'click',()=>{if(active())view.reset();});
  on($('regionSelect'),'change',()=>{if(active()&&exploring)view.region($('regionSelect').value);});
  on($('muteBtn'),'click',()=>{engine.configure({muted:!engine.prefs.muted});configureAudio();refreshMenu();});
  for(const id of ['musicVolume','effectsVolume'])on($(id),'input',()=>{engine.configure({[id]:Number($(id).value)});configureAudio();});
  on($('submitBtn'),'click',()=>{postScore(true);announce('Your current Atlas XP was submitted.');});on($('chatBtn'),'click',()=>{stop();try{win.GG?.openOverlay?.();}catch{}});
  on(win,'blur',()=>{if(active())openMenu(false,'Expedition paused. Your progress is safe.');else clearPointers();});
  on(doc,'visibilitychange',()=>{if(doc.hidden){if(active())openMenu(false,'Expedition paused. Choose Resume when you return.');else stop();}});
  on(win,'pagehide',stop);
  function resized(){const next={w:win.innerWidth,h:win.innerHeight};if(next.w!==viewport.w||next.h!==viewport.h){viewport=next;clearPointers();if(active())openMenu(false,'The view changed. Resume when you are ready.');}}
  on(win,'resize',resized);on(win,'orientationchange',()=>{clearPointers();if(active())openMenu(false,'Resume in your new view when you are ready.');});
  on(win,'message',e=>{if(e.origin!==win.location.origin||(e.source!==win&&e.source!==win.parent))return;const d=e.data||{};if(d.type==='GG_PAUSE'&&(d.payload?.paused??d.paused))openMenu();if(d.type==='GG_RESTART')startMission(engine.state.mission,true);if(d.type==='GG_MUTE'){platformMuted=!!(d.payload?.muted??d.muted);configureAudio();}});
  for(const name of Object.keys(G.regions)){const o=doc.createElement('option');o.value=name;o.textContent=name;$('regionSelect').appendChild(o);}
  for(const c of sorted){const o=doc.createElement('option');o.value=c.id;o.textContent=c.name;$('countrySelect').appendChild(o);}
  configureAudio();view.context('town');render();$('startBtn').disabled=false;$('exploreBtn').disabled=false;$('loadStatus').textContent='Five expeditions · unlimited world exploration';app.inert=true;
  return {engine,view,audio,startMission,beginExplore,openMenu,render,postScore,get paused(){return paused;},get exploring(){return exploring;},get pointers(){return pointers.size;},dispose(){stop();disposed=true;for(const remove of handlers)remove();audio.dispose();}};
 }
 const api={create};if(typeof module==='object'&&module.exports)module.exports=api;else if(root.document)create(root,root.document);
})(typeof window!=='undefined'?window:globalThis);
