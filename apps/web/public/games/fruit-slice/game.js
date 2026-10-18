/* Fruit Slice: full-viewport slicing, 25 sunset trials and the original Endless mode. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),canvas=$('c');if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:false}),Campaign=window.FruitCampaign,LEVELS=Campaign.levels;
 const GAME_SLUG='fruit-slice',BEST_KEY='gg_fruit_slice_best_v2',SAVE_KEY='gg_fruit_slice_progress_v1';
 const FRUITS=[{key:'apple',tint:'#ff5e62',base:14},{key:'orange',tint:'#ffb020',base:16},{key:'watermelon',tint:'#ff4d6d',base:18},{key:'kiwi',tint:'#6ee7b7',base:15},{key:'pineapple',tint:'#facc15',base:19}];
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),integer=(v,a,b,f=a)=>Number.isFinite(Number(v))?clamp(Math.floor(Number(v)),a,b):f;
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}};
 const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
 let best=integer(read(BEST_KEY,0),0,1e9),progress=loadProgress();
 function loadProgress(){
  const raw=read(SAVE_KEY,{}),s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  const unlocked=integer(s.unlocked,1,25,1),volume=(v,d)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,0,1):d;
  const p={unlocked,selected:integer(s.selected,0,unlocked-1,unlocked-1),mode:s.mode==='endless'?'endless':'campaign',muted:!!s.muted,musicVolume:volume(s.musicVolume,.55),effectsVolume:volume(s.effectsVolume,.8),stars:{},scores:{}};
  for(let id=1;id<=25;id++){p.stars[id]=integer(s.stars?.[id],0,3);p.scores[id]=integer(s.scores?.[id],0,1e9);}
  return p;
 }
 const game={running:false,paused:false,phase:'menu',panel:'start',backPanel:'start',mode:progress.mode,levelIndex:progress.selected,score:0,lives:5,combo:0,lastCut:-Infinity,elapsed:0,visualTime:0,countdown:0,nextWave:0,wave:0,frenzyMeter:0,frenzyTimer:0,finalSubmitted:false,loaded:false,seed:2101,uiTime:0,
  stats:{sliced:0,missed:0,golden:0,frenzies:0,bestCombo:0,byFruit:{}},objects:[],particles:[],halves:[],splashes:[],floaters:[],blades:new Map()};
 const renderer=window.FruitRender.create(window),audio=window.FruitAudio.create(window);
 let W=1280,H=720,scale=1,DPR=1,cssWidth=1280,cssHeight=720,lastTs=performance.now(),accumulator=0,ggLastLiveScore=-1;
 function currentLevel(){return LEVELS[game.levelIndex]||LEVELS[0];}
 function random(){game.seed=(Math.imul(game.seed,1664525)+1013904223)>>>0;return game.seed/4294967296;}
 function rand(a,b){return a+random()*(b-a);}
 function viewport(){return {W,H,scale,DPR,cssWidth,cssHeight,topSafe:Math.min(H*.36,(cssWidth<=600&&cssHeight>cssWidth?132:104)/scale),bottomSafe:48/scale};}
 function save(){progress.selected=clamp(progress.selected,0,progress.unlocked-1);write(SAVE_KEY,progress);write(BEST_KEY,best);}
 function configureAudio(){audio.configure(progress);}
 function musicStart(){configureAudio();if(game.running&&!game.paused&&!document.hidden)audio.playLevel(game.mode==='campaign'?currentLevel().id:1);}
 function sfx(kind){audio.effect(kind);}
 function ggPostLiveScore(value){
  try{window.GG?.setScore?.(value);}catch{}
  for(const type of ['GG_SCORE','gg:score'])try{window.parent?.postMessage?.({type,slug:GAME_SLUG,gameSlug:GAME_SLUG,score:value},'*');}catch{}
  try{window.dispatchEvent(new CustomEvent('gg:score',{detail:{slug:GAME_SLUG,score:value}}));}catch{}
 }
 function ggSubmitFinalScore(value){try{window.GG?.submitScore?.(value,{gameSlug:GAME_SLUG,board:'global'});}catch{}ggPostLiveScore(value);}
 function resetInput(){const ids=[...game.blades.keys()];game.blades.clear();for(const id of ids)try{if(canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);}catch{}}
 function radius(base=36){return clamp(base,Math.max(24,24/scale),70);}
 function resize(){
  const oldW=W,oldWidth=cssWidth,oldHeight=cssHeight;
  cssWidth=Math.max(1,window.innerWidth);cssHeight=Math.max(1,window.visualViewport?.height||window.innerHeight);
  document.documentElement.style.setProperty('--viewport-height',cssHeight+'px');scale=cssHeight/H;W=cssWidth/scale;
  DPR=Math.min(2,window.devicePixelRatio||1,Math.sqrt(3e6/(cssWidth*cssHeight)));
  canvas.width=Math.max(1,Math.floor(cssWidth*DPR));canvas.height=Math.max(1,Math.floor(cssHeight*DPR));ctx.setTransform(DPR*scale,0,0,DPR*scale,0,0);
  if(oldW>0)for(const o of game.objects){o.x*=W/oldW;o.vx*=W/oldW;o.r=radius(o.baseR);}
  game.halves.length=0;game.particles.length=0;game.splashes.length=0;game.floaters.length=0;resetInput();
  if(game.running&&!game.paused&&(Math.abs(cssWidth-oldWidth)>20||Math.abs(cssHeight-oldHeight)>oldHeight*.18))setPaused(true);
 }
 function clearRound(){for(const key of ['objects','particles','halves','splashes','floaters'])game[key].length=0;resetInput();}
 function startRound(index=progress.selected,mode=progress.mode){
  if(!game.loaded)return;
  game.levelIndex=clamp(integer(index,0,24),0,progress.unlocked-1);game.mode=mode==='endless'?'endless':'campaign';progress.mode=game.mode;progress.selected=game.levelIndex;
  Object.assign(game,{running:true,paused:false,phase:'countdown',panel:'play',score:0,lives:game.mode==='campaign'?currentLevel().lives:3,combo:0,lastCut:-Infinity,elapsed:0,countdown:2.4,nextWave:0,wave:0,frenzyMeter:0,frenzyTimer:0,finalSubmitted:false,seed:game.mode==='campaign'?2100+currentLevel().id:Math.floor(performance.now())+2159,uiTime:0,stats:{sliced:0,missed:0,golden:0,frenzies:0,bestCombo:0,byFruit:{}}});
  clearRound();accumulator=0;lastTs=performance.now();ggLastLiveScore=-1;audio.selectLevel(game.mode==='campaign'?currentLevel().id:1);configureAudio();audio.unlock();musicStart();sfx('start');$('panel').style.display='none';updateHUD();save();canvas.focus();
 }
 function goMenu(){
  best=Math.max(best,game.score);game.running=false;game.paused=false;game.phase='menu';audio.pause();clearRound();game.mode=progress.mode;game.levelIndex=progress.selected;renderPanel('start');updateHUD();save();
 }
 function setPaused(value){
  if(!game.running||!['play','countdown'].includes(game.phase))return;
  game.paused=!!value;resetInput();accumulator=0;lastTs=performance.now();
  if(game.paused){audio.pause();renderPanel('pause');$('btnStart').focus();}
  else{game.panel='play';$('panel').style.display='none';musicStart();canvas.focus();}updateHUD();
 }
 function renderPanel(mode){
  game.panel=mode;$('panel').style.display='flex';$('modeSelect').hidden=mode!=='start';$('levelMap').hidden=mode!=='map';$('audioSettings').hidden=!['pause','gameover','complete','win'].includes(mode);
  $('btnHow').hidden=['help','map'].includes(mode);$('btnLevels').hidden=['help','map'].includes(mode);$('btnRestart').hidden=!['pause','gameover','complete'].includes(mode);$('btnSubmit').hidden=!['pause','gameover','complete','win'].includes(mode);$('btnMenu').hidden=!['pause','gameover','complete','win'].includes(mode);$('tips').hidden=!['start','help'].includes(mode);$('roundSummary').hidden=!['gameover','complete','win'].includes(mode);
  const lv=currentLevel(),selected=LEVELS[progress.selected];let title,text,button;
  if(mode==='start'){title='Fruit Slice';text=progress.mode==='campaign'?`${selected.id}. ${selected.title}\n${selected.chapter} · ${selected.duration} seconds · ${selected.lives} lives\nReach every target before time runs out. Bombs end the round.`:'Endless Arcade\nThree lives, golden fruit, fast combos and seven-second frenzy. A bomb ends the run. Chase your best score.';button=progress.mode==='campaign'?'Play Level '+selected.id:'Play Endless';}
  if(mode==='pause'){title='Round Paused';text='Take a breath. Your fruit, timer and combo wait here.\nAdjust the soundtrack and effects before you resume.';button='Resume';}
  if(mode==='help'){title='How to Play';text='Hold and drag the mouse, or swipe a finger through fruit. Two fingers can make separate safe cuts.\n\nMissed fruit costs one life. A bomb ends the round, so use short swipes near hazards. Golden fruit carries a star and gives bonus points. Chain cuts within one second for combos; fill the meter to trigger seven seconds of frenzy.\n\nCampaign has 25 trials with score, fruit and special targets. Complete a trial to unlock the next. Endless keeps its original three-life rules.\n\nP or Escape pauses. Pause also contains music, effects, restart and score controls. Rotate or leave the game safely; resume when ready.';button='Back';}
  if(mode==='map'){title='Sunset Trials';text='Complete each trial to unlock the next. Replay unlocked stages to improve your stars.';button='Back';renderMap();}
  if(mode==='complete'||mode==='win'){title=mode==='win'?'Sunset Champion!':lv.title+' Complete';text=mode==='win'?'All 25 trials are complete. Your timing, control and calm have earned the sunset crown.':'The next sunset trial is unlocked. Keep your blade precise and your eyes on the fuse.';button=mode==='win'?'View Campaign':'Next Level';}
  if(mode==='gameover'){title=game.endReason||'Round Over';text=`Score ${game.score} · Best ${best}\n${game.mode==='campaign'?'Try the same trial again. Your unlocked levels stay saved.':'Every clean swipe builds your next great run.'}`;button='Try Again';}
  $('panelTitle').textContent=title||'Fruit Slice';$('panelText').textContent=text||'';$('btnStart').textContent=game.loaded?button:'Preparing dojo…';$('btnStart').disabled=!game.loaded;$('panelEyebrow').textContent=mode==='start'?(progress.mode==='campaign'?selected.chapter:'Endless Arcade'):game.mode==='campaign'?lv.chapter:'Endless Arcade';
  $('btnCampaign').setAttribute('aria-pressed',String(progress.mode==='campaign'));$('btnEndless').setAttribute('aria-pressed',String(progress.mode==='endless'));
  const accuracy=game.stats.sliced+game.stats.missed?Math.round(game.stats.sliced/(game.stats.sliced+game.stats.missed)*100):0;
  $('roundSummary').textContent=`${game.score} points · ${game.stats.sliced} fruit · ${accuracy}% accuracy · Best combo ${game.stats.bestCombo}`;
  updateAudioUI();
 }
 function openAux(mode){if(game.running&&!game.paused)setPaused(true);game.backPanel=game.panel;renderPanel(mode);}
 function renderMap(){
  const grid=$('levelMap');grid.innerHTML='';for(const lv of LEVELS){const button=document.createElement('button'),unlocked=lv.id<=progress.unlocked;button.type='button';button.className='mapNode'+(lv.id-1===progress.selected?' current':'');button.disabled=!unlocked;
   button.innerHTML=`<strong>${lv.id}. ${lv.title}</strong><small>${unlocked?lv.chapter:'Locked'} · ${lv.duration}s</small><span class="stars">${unlocked?'★'.repeat(progress.stars[lv.id])||'☆':'🔒'}</span>`;
   button.addEventListener('click',()=>{if(lv.id>progress.unlocked)return;progress.selected=lv.id-1;progress.mode='campaign';startRound(lv.id-1,'campaign');});grid.appendChild(button);
  }
 }
 function endRound(won=false,reason='No lives left'){
  if(!game.running)return;game.running=false;game.paused=false;game.phase=won?'complete':'over';game.endReason=reason;resetInput();audio.pause();best=Math.max(best,game.score);
  if(won&&game.mode==='campaign'){const lv=currentLevel(),accuracy=game.stats.sliced/Math.max(1,game.stats.sliced+game.stats.missed),stars=game.lives===lv.lives&&accuracy>=.98?3:game.lives>=2&&accuracy>=.85?2:1;
   progress.unlocked=Math.max(progress.unlocked,Math.min(25,lv.id+1));progress.stars[lv.id]=Math.max(progress.stars[lv.id],stars);progress.scores[lv.id]=Math.max(progress.scores[lv.id],game.score);progress.selected=Math.min(24,lv.id);
  }
  save();renderPanel(won?(currentLevel().id===25?'win':'complete'):'gameover');sfx(won?'level':reason==='Bomb hit'?'boom':'gameover');
  if(!game.finalSubmitted){game.finalSubmitted=true;ggSubmitFinalScore(game.score);}updateHUD();
 }
 function updateAudioUI(){
  $('musicTrack').textContent=window.FruitMusic[(game.running||game.panel!=='start'?game.mode:progress.mode)==='endless'?0:(game.panel==='start'?progress.selected:game.levelIndex)]?.title||'Sunset Sessions';
  for(const key of ['musicVolume','effectsVolume']){$(key).value=String(Math.round(progress[key]*100));$(key+'Value').textContent=Math.round(progress[key]*100)+'%';}
  $('btnMute').textContent=progress.muted?'Sound Off':'Sound On';$('btnMute').setAttribute('aria-pressed',String(progress.muted));
 }
 function updateHUD(){
  const lv=currentLevel();$('score').textContent=game.score;$('lives').textContent=game.lives;$('combo').textContent=game.combo;$('best').textContent=best;
  $('timeLeft').textContent=game.mode==='endless'?'∞':Math.ceil(Math.max(0,lv.duration-game.elapsed));$('stageLabel').textContent=game.mode==='endless'?'Endless Arcade':`${lv.id}/25 · ${lv.title}`;
  $('mission').textContent=game.mode==='endless'?'Slice fruit · Avoid bombs · Chase your best':Campaign.goals(lv,game.stats,game.score).map(g=>`${g.label} ${Math.min(g.value,g.target)}/${g.target}`).join(' · ');
  $('progressLabel').textContent=`· ${progress.unlocked} / 25 levels unlocked`;$('btnPause').disabled=!game.running;$('btnPause').textContent=game.paused?'Resume':'Pause';
  $('frenzyFill').style.width=Math.round(clamp(game.frenzyTimer>0?game.frenzyTimer/7:game.frenzyMeter,0,1)*100)+'%';$('frenzyLabel').textContent=game.frenzyTimer>0?'FRENZY '+Math.ceil(game.frenzyTimer)+'s':'Frenzy';
  if(ggLastLiveScore!==game.score){ggLastLiveScore=game.score;ggPostLiveScore(game.score);}updateAudioUI();
 }
 function boundedPush(list,value,max){list.push(value);if(list.length>max)list.splice(0,list.length-max);}
 function particles(x,y,color,count=18,speed=220){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=speed*(.3+Math.random()*.7);boundedPush(game.particles,{x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,r:2+Math.random()*3,age:0,life:.45+Math.random()*.35,color},320);}}
 function floater(x,y,text,color='#fff',size=20){boundedPush(game.floaters,{x,y,text,color,size,age:0,life:.8},32);}
 function pointLineDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(px-ax-dx*t,py-ay-dy*t);}
 function safeTrajectory(candidate){
  for(const o of game.objects){if(o.sliced||o.kind===candidate.kind)continue;const gap=o.r+candidate.r+14+6/scale;
   for(let step=0;step<=30;step++){const t=step*.06,ay=candidate.y+candidate.vy*t+.5*candidate.g*t*t,by=o.y+o.vy*t+.5*o.g*t*t;if(ay<-candidate.r||by<-o.r||ay>H+candidate.r||by>H+o.r)continue;const dx=candidate.x+candidate.vx*t-o.x-o.vx*t;if(dx*dx+(ay-by)*(ay-by)<gap*gap)return false;}
  }return true;
 }
 function spawnOne(isBomb=false,isGolden=false,x=W/2,vx=0,forcedKey=null){
  const lv=currentLevel(),key=isBomb?'bomb':forcedKey||(game.mode==='endless'?Campaign.keys:lv.fruitPool)[Math.floor(random()*(game.mode==='endless'?Campaign.keys:lv.fruitPool).length)],fruit=FRUITS.find(f=>f.key===key)||FRUITS[0],baseR=rand(isBomb?28:30,isBomb?32:40),r=radius(baseR),v=viewport(),y=H+r+20,g=1728,apex=clamp(H*.28+rand(0,110),v.topSafe+r*2,H-v.bottomSafe-r*2);
  const o={kind:isBomb?'bomb':'fruit',key,x,y,vx,vy:-Math.sqrt(2*g*(y-apex)),g,r,baseR,rot:rand(-.3,.3),vr:rand(-1.3,1.3)*(isBomb?.5:1),age:0,phase:rand(0,.5),sliced:false,golden:isGolden&&!isBomb,tint:fruit.tint,value:(isGolden?34:fruit.base)+Math.round(baseR*.15)};
  if(!safeTrajectory(o))return null;game.objects.push(o);return o;
 }
 function spawnWave(){
  if(game.objects.length>18)return;const lv=currentLevel(),R=radius(40),margin=R+26,span=Math.max(0,Math.min(W-margin*2,1100)),capacity=Math.max(1,Math.min(5,Math.floor(span/(R*2+14))+1)),positions=[];
  for(let i=0;i<capacity;i++)positions.push(capacity===1?W/2:W/2-span/2+i*span/(capacity-1));
  for(let i=positions.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[positions[i],positions[j]]=[positions[j],positions[i]];}
  const bomb=game.wave>1&&random()<(game.mode==='endless'?.22:lv.bombChance)&&capacity>1;
  let n=game.mode==='endless'?(random()<Math.min(.62,.24+game.score/2200)?4:2):lv.kind==='combo'?3:lv.pattern==='crossing'?3:lv.pattern==='cascade'?2+game.wave%2:lv.pattern==='flow'?2+(game.wave%3===0?1:0):2;
  if(game.frenzyTimer>0)n++;n=Math.min(n,capacity-(bomb?1:0));const drift=rand(-12,12);
  for(let i=0;i<n;i++){const gold=(game.mode==='campaign'&&lv.kind==='gold'&&game.wave%3===0&&i===0)||i===0&&random()<.12,key=game.mode==='campaign'&&lv.kind==='focus'&&i===0?lv.focus:null;const vx=drift+(game.mode==='campaign'&&!bomb&&lv.pattern==='crossing'?Math.sign(W/2-positions[i])*Math.min(80,span*.10):game.mode==='campaign'&&!bomb&&lv.pattern==='fan'?(positions[i]-W/2)*.025:0);spawnOne(false,gold,positions[i],vx,key);}
  if(bomb)spawnOne(true,false,positions[n],drift);game.wave++;
 }
 function triggerFrenzy(){game.frenzyTimer=7;game.frenzyMeter=1;game.stats.frenzies++;floater(W/2,H*.35,'FRENZY!','#ffd166',32);sfx('frenzy');}
 function sliceObject(o,ax,ay,bx,by){
  if(o.sliced||!game.running||game.paused||game.phase!=='play')return;o.sliced=true;
  if(o.kind==='bomb'){particles(o.x,o.y,'#ff735b',38,340);endRound(false,'Bomb hit');return;}
  const windowSeconds=game.mode==='endless'?.9:1;game.combo=game.elapsed-game.lastCut<=windowSeconds?game.combo+1:1;game.lastCut=game.elapsed;game.stats.bestCombo=Math.max(game.stats.bestCombo,game.combo);
  const angle=Math.atan2(by-ay,bx-ax);
  for(const side of [-1,1])boundedPush(game.halves,{key:o.key,x:o.x,y:o.y,r:o.r,side,vx:o.vx*.18+Math.cos(angle+Math.PI/2*side)*140,vy:o.vy*.12-80,rot:o.rot,vr:side*3,age:0,life:1.05},64);
  particles(o.x,o.y,o.golden?'#ffd166':o.tint,o.golden?24:16,260);boundedPush(game.splashes,{x:o.x,y:o.y,r:o.r,color:o.golden?'#ffd166':o.tint,age:0,life:.35},24);sfx(o.golden?'gold':game.combo>=3?'combo':'slice');
  let gained=o.value+(game.combo>=3?game.combo*2:0);if(game.frenzyTimer>0)gained=Math.round(gained*1.6);if(o.golden)gained+=24;game.score=Math.min(1e9,game.score+gained);
  game.stats.sliced++;game.stats.byFruit[o.key]=(game.stats.byFruit[o.key]||0)+1;if(o.golden)game.stats.golden++;game.frenzyMeter=clamp(game.frenzyMeter+(o.golden?.16:.055),0,1);if(game.frenzyMeter>=1&&game.frenzyTimer<=0)triggerFrenzy();floater(o.x,o.y,'+'+gained,o.golden?'#ffe6a0':'#fff');
  updateHUD();if(game.mode==='campaign'&&Campaign.complete(currentLevel(),game.stats,game.score))endRound(true);
 }
 function trySliceSegment(ax,ay,bx,by){
  if(!game.running||game.paused||game.phase!=='play')return;
  const hits=game.objects.filter(o=>!o.sliced&&o.y>=-o.r&&o.y<=H+o.r&&pointLineDist(o.x,o.y,ax,ay,bx,by)<=o.r+(o.kind==='bomb'?0:6/scale));
  const bomb=hits.find(o=>o.kind==='bomb');if(bomb){sliceObject(bomb,ax,ay,bx,by);return;}
  for(const o of hits){sliceObject(o,ax,ay,bx,by);if(!game.running)break;}
 }
 function missed(o){if(o.kind==='bomb'||o.sliced)return;game.lives=Math.max(0,game.lives-1);game.stats.missed++;game.combo=0;game.frenzyMeter=Math.max(0,game.frenzyMeter-.14);floater(clamp(o.x,30,W-30),H-70/scale,'MISS','#ffb1a7');sfx('miss');if(game.lives<=0)endRound(false,'No lives left');}
 function update(dt){
  game.visualTime+=dt;if(!game.running||game.paused)return;
  if(game.phase==='countdown'){const before=Math.ceil(game.countdown/.8);game.countdown=Math.max(0,game.countdown-dt);if(game.countdown<=0){game.phase='play';spawnWave();game.nextWave=currentLevel().interval;}else if(Math.ceil(game.countdown/.8)<before)sfx('count');return;}
  game.elapsed+=dt;game.nextWave-=dt;if(game.nextWave<=0){spawnWave();game.nextWave=game.mode==='endless'?Math.max(.35,.9-game.score*.0012-(game.frenzyTimer>0?.12:0)):Math.max(.45,currentLevel().interval-(game.frenzyTimer>0?.12:0));}
  if(game.frenzyTimer>0){game.frenzyTimer=Math.max(0,game.frenzyTimer-dt);if(game.frenzyTimer===0)game.frenzyMeter=0;}else game.frenzyMeter=Math.max(0,game.frenzyMeter-dt*.014);
  if(game.elapsed-game.lastCut>(game.mode==='endless'?.9:1))game.combo=0;
  for(let i=game.objects.length-1;i>=0;i--){const o=game.objects[i];if(o.sliced){game.objects.splice(i,1);continue;}o.vy+=o.g*dt;o.x+=o.vx*dt;o.y+=o.vy*dt;o.rot+=o.vr*dt;o.age+=dt;if(o.vy>0&&o.y-o.r>H+30){missed(o);game.objects.splice(i,1);if(!game.running)return;}}
  for(const key of ['halves','particles','splashes','floaters'])for(let i=game[key].length-1;i>=0;i--){const f=game[key][i];f.age+=dt;if(key==='halves'||key==='particles'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=(key==='halves'?950:480)*dt;if(key==='halves')f.rot+=f.vr*dt;}if(key==='floaters')f.y-=38/scale*dt;if(f.age>=f.life)game[key].splice(i,1);}
  for(const [id,blade] of game.blades){blade.trail=blade.trail.filter(p=>game.elapsed-p.t<.18);if(!blade.down&&!blade.trail.length)game.blades.delete(id);}
  if(game.mode==='campaign'&&game.elapsed>=currentLevel().duration){endRound(false,'Time is up');return;}game.uiTime+=dt;if(game.uiTime>=.08){game.uiTime=0;updateHUD();}
 }
 function posFromEvent(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
 function pointerStart(e){
  if(e.button!==0||!game.running||game.paused||game.phase!=='play'||game.blades.size>=4&&!game.blades.has(e.pointerId))return;e.preventDefault();musicStart();const p=posFromEvent(e);game.blades.set(e.pointerId,{down:true,last:p,trail:[{...p,t:game.elapsed}]});canvas.setPointerCapture(e.pointerId);
 }
 function pointerMove(e){
  const blade=game.blades.get(e.pointerId);if(!blade?.down||!game.running||game.paused||game.phase!=='play')return;e.preventDefault();const samples=e.getCoalescedEvents?.()||[];for(const sample of samples.length?samples:[e]){const p=posFromEvent(sample);if(Math.hypot(p.x-blade.last.x,p.y-blade.last.y)*scale<2)continue;trySliceSegment(blade.last.x,blade.last.y,p.x,p.y);if(!game.running||game.paused)break;blade.last=p;boundedPush(blade.trail,{...p,t:game.elapsed},24);}
 }
 function pointerEnd(e){const blade=game.blades.get(e.pointerId);if(!blade)return;const wasDown=blade.down;blade.down=false;if(e.type==='pointercancel'||e.type==='lostpointercapture'&&wasDown)game.blades.delete(e.pointerId);try{if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);}catch{}}
 function bindEvents(){
  canvas.addEventListener('pointerdown',pointerStart,{passive:false});canvas.addEventListener('pointermove',pointerMove,{passive:false});for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,pointerEnd);
  $('btnStart').addEventListener('click',()=>{
   if(game.panel==='pause'){setPaused(false);return;}if(['help','map'].includes(game.panel)){renderPanel(game.backPanel);return;}
   if(game.panel==='complete'){startRound(Math.min(24,game.levelIndex+1),'campaign');return;}if(game.panel==='win'){goMenu();openAux('map');return;}
   if(game.panel==='gameover'){startRound(game.levelIndex,game.mode);return;}startRound();
  });
  $('btnHow').addEventListener('click',()=>openAux('help'));$('btnLevels').addEventListener('click',()=>openAux('map'));
  for(const mode of ['campaign','endless'])$('btn'+(mode==='campaign'?'Campaign':'Endless')).addEventListener('click',()=>{progress.mode=mode;game.mode=mode;game.levelIndex=progress.selected;save();renderPanel('start');updateHUD();});
  $('btnPause').addEventListener('click',()=>{if(game.paused&&!['pause','play'].includes(game.panel))return;setPaused(!game.paused);});$('btnRestart').addEventListener('click',()=>startRound(game.levelIndex,game.mode));$('btnMenu').addEventListener('click',goMenu);$('btnSubmit').addEventListener('click',()=>ggSubmitFinalScore(game.score));$('btnLaunch').addEventListener('click',()=>startRound());
  $('btnMute').addEventListener('click',()=>{progress.muted=!progress.muted;configureAudio();if(!progress.muted)musicStart();save();updateAudioUI();});
  for(const key of ['musicVolume','effectsVolume'])$(key).addEventListener('input',e=>{progress[key]=clamp(Number(e.target.value)/100,0,1);configureAudio();if(game.running&&!game.paused)musicStart();save();updateAudioUI();});
  const interrupt=()=>{resetInput();audio.pause();if(game.running&&!game.paused)setPaused(true);lastTs=performance.now();accumulator=0;};
  window.addEventListener('blur',interrupt);document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();});window.addEventListener('pagehide',()=>{interrupt();save();});window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);
  window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','BUTTON'].includes(e.target?.tagName)||e.target?.isContentEditable)return;if(e.repeat)return;if(['KeyP','Escape'].includes(e.code)){e.preventDefault();if(['help','map'].includes(game.panel))renderPanel(game.backPanel);else if(game.panel==='pause'||!game.paused)setPaused(!game.paused);}});
  window.addEventListener('message',e=>{if(e.source!==window.parent||e.origin!==window.location.origin)return;const d=e.data||{},type=d.type||d.event;if(type==='GG_PAUSE')setPaused(!!(d.payload?.paused??d.paused));if(type==='GG_MUTE'){progress.muted=!!(d.payload?.muted??d.muted);configureAudio();if(!progress.muted)musicStart();save();updateAudioUI();}if(type==='GG_RESTART')startRound(game.levelIndex,game.mode);});
 }
 function draw(){renderer.draw(ctx,game,viewport());}
 function loop(ts){accumulator+=Math.min(.05,Math.max(0,(ts-lastTs)/1000));lastTs=ts;while(accumulator>=1/120){update(1/120);accumulator-=1/120;}draw();requestAnimationFrame(loop);}
 async function boot(){try{window.GG?.setSlug?.(GAME_SLUG);}catch{}configureAudio();bindEvents();resize();renderPanel('start');updateHUD();await renderer.load();game.loaded=true;renderPanel('start');lastTs=performance.now();requestAnimationFrame(loop);}
 boot();
})();
