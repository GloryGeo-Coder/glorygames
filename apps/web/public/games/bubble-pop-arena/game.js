/* Bubble Pop Arena 2.1: continuous mobile arena, original score bridge retained. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id),canvas=$('c'),ctx=canvas.getContext('2d',{alpha:false});
  const {scenes,pacing,cover,distanceToSegment,clamp}=window.BubbleRules;
  const audio=window.BubbleAudio.create(window,window.BubbleMusic);
  const BEST_KEY='gg_bubble_pop_best_v2',SETTINGS_KEY='gg_bubble_pop_audio_v1',GAME_SLUG='bubble-pop-arena';
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const safeRead=k=>{try{return localStorage.getItem(k);}catch{return null;}};
  const safeWrite=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
  let settings={muted:false,musicVolume:.55,effectsVolume:.8};
  try{const s=JSON.parse(safeRead(SETTINGS_KEY));if(s&&typeof s==='object'){settings.muted=s.muted===true;for(const k of ['musicVolume','effectsVolume'])if(typeof s[k]==='number'&&Number.isFinite(s[k]))settings[k]=clamp(s[k],0,1);}}catch{}
  let best=Math.max(0,Math.floor(Number(safeRead(BEST_KEY))||0));if(!Number.isFinite(best))best=0;
  const images={bg:[],bubble:{}};
  let running=false,paused=false,gameOver=false,ready=false;
  let score=0,combo=0,timeLeft=45,comboWindow=0,freezeTimer=0,feverMeter=0,feverTimer=0;
  let pops=0,elapsed=0,wave=1,sceneIndex=0,previousScene=0,transition=1,toastTimer=0,visualTime=0;
  let bubbles=[],particles=[],floatingTexts=[],ambientBubbles=[],spawnT=0,hudT=0;
  let pointerId=null,pointerPoint=null,width=1,height=1,DPR=1;
  let lastT=performance.now(),accumulator=0,lastReportedScore=-1,lastReportAt=0,lastSubmittedScore=-1,warningSecond=-1;
  const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
  function cw(){return width;}function ch(){return height;}
  function resetInput(){const id=pointerId;pointerId=null;pointerPoint=null;if(id!==null)try{if(canvas.hasPointerCapture?.(id))canvas.releasePointerCapture(id);}catch{}}
  function viewport(){return {width,height,DPR};}
  function resize(){
    const r=canvas.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height),changed=Math.abs(w-width)>1||Math.abs(h-height)>1;
    if(changed&&running&&!paused)setPaused(true,'Screen changed. Continue when you are ready.');
    const sx=w/width,sy=h/height;width=w;height=h;
    const maxR=Math.max(26,Math.min(48,width*.12,height*.18));
    for(const b of bubbles){b.r=Math.min(b.r,maxR);b.x=clamp(b.x*sx,b.r+6,width-b.r-6);b.y*=sy;b.vy*=sy;b.ttl=Math.max(b.ttl,(b.y+b.r+40)/Math.max(1,-b.vy)+.5);}
    resetInput();DPR=Math.max(.5,Math.min(2,window.devicePixelRatio||1,Math.sqrt(3000000/(w*h))));
    canvas.width=Math.max(1,Math.floor(w*DPR));canvas.height=Math.max(1,Math.floor(h*DPR));ctx.setTransform(DPR,0,0,DPR,0,0);draw();
  }
  function loadImageSafe(src){return new Promise(resolve=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src;});}
  async function loadAssets(){
    images.bg[0]=await loadImageSafe('./assets/backgrounds/'+scenes[0].file);
    for(const type of ['normal','time','bomb','freeze','bonus'])images.bubble[type]=await loadImageSafe('./assets/bubbles/'+type+'.png');
  }
  async function preloadScenes(){for(let i=1;i<scenes.length;i++)images.bg[i]=await loadImageSafe('./assets/backgrounds/'+scenes[i].file);}
  function reportScoreLive(force=false){const now=performance.now();if(!force&&(score===lastReportedScore||now-lastReportAt<80))return;lastReportedScore=score;lastReportAt=now;
    try{window.GG?.setScore?.(score);}catch{}
    for(const type of ['GG_SCORE','gg:score'])try{window.parent?.postMessage?.({type,slug:GAME_SLUG,score},'*');}catch{}
    try{window.dispatchEvent(new CustomEvent('gg:score',{detail:{slug:GAME_SLUG,score}}));}catch{}
  }
  function updateHud(){for(const [id,value] of Object.entries({score,best,combo,time:Math.max(0,timeLeft).toFixed(1),freeze:Math.max(0,freezeTimer).toFixed(1)+'s',fever:feverTimer>0?'ACTIVE':Math.round(clamp(feverMeter,0,1)*100)+'%',wave:'Wave '+wave,scene:scenes[sceneIndex].title}))$(id).textContent=String(value);$('btnPause').textContent=paused?'Resume':'Pause';reportScoreLive();}
  function showPanel(title,text,button){$('panelTitle').textContent=title;$('panelText').textContent=text;$('btnStart').textContent=button;$('panel').hidden=false;$('roundSummary').textContent=running||gameOver?`${pops} pops · Wave ${wave} · Best ${best}`:'20 pops or 25 seconds bring the next wave.';}
  function syncAudioSettings(){audio.configure(settings);$('btnMute').textContent=settings.muted?'Sound Off':'Sound On';$('btnMute').setAttribute('aria-pressed',String(settings.muted));for(const k of ['musicVolume','effectsVolume']){$(k).value=String(Math.round(settings[k]*100));$(k+'Value').textContent=$(k).value+'%';}$('musicTrack').textContent=window.BubbleMusic[sceneIndex]?.title||scenes[sceneIndex].title;}
  function setPaused(value,message='Take a breath. Your timer and bubbles are paused.'){
    if(!running||gameOver)return;paused=value;resetInput();accumulator=0;lastT=performance.now();
    if(paused){audio.pause();showPanel('Paused',message,'Continue');}else{$('panel').hidden=true;audio.unlock();audio.playScene(sceneIndex+1);}updateHud();
  }
  function togglePause(){setPaused(!paused);}
  function rememberBest(){if(score>best){best=score;safeWrite(BEST_KEY,String(best));}}
  function startGame(){if(!ready)return;rememberBest();audio.pause();resetInput();
    running=true;paused=false;gameOver=false;score=0;combo=0;timeLeft=45;comboWindow=0;freezeTimer=0;feverMeter=0;feverTimer=0;
    pops=0;elapsed=0;wave=1;sceneIndex=0;previousScene=0;transition=1;toastTimer=0;spawnT=0;hudT=0;warningSecond=-1;
    bubbles=[];particles=[];floatingTexts=[];lastReportedScore=-1;lastReportAt=0;lastSubmittedScore=-1;accumulator=0;lastT=performance.now();
    $('panel').hidden=true;$('sceneToast').className='sceneToast';audio.selectScene(1);syncAudioSettings();audio.unlock();audio.playScene(1);audio.effect('start');
    for(let i=0;i<8;i++)spawnBubble(true);updateHud();
  }
  function submitScore(){if(score===lastSubmittedScore)return;lastSubmittedScore=score;reportScoreLive(true);try{window.GG?.submitScore?.(score);}catch{}}
  function endGame(){if(gameOver)return;gameOver=true;running=false;paused=false;resetInput();audio.pause();audio.effect('gameover');rememberBest();updateHud();showPanel('Round Over',`Time’s up!\nScore: ${score} · ${pops} pops\nKeep your next round going with gold time bubbles.`,'Play Again');submitScore();}
  function advanceWave(){const next=pacing(pops,elapsed,width,height);if(next.wave===wave)return;wave=next.wave;previousScene=sceneIndex;sceneIndex=next.scene;transition=reducedMotion?1:0;toastTimer=2.2;$('sceneToast').textContent=`Wave ${wave} · ${scenes[sceneIndex].title}`;$('sceneToast').className='sceneToast visible';audio.selectScene(sceneIndex+1);syncAudioSettings();if(running&&!paused)audio.playScene(sceneIndex+1);audio.effect('scene');updateHud();}
  function bubbleColor(type){return {bomb:'#ff567d',time:'#ffdb6b',freeze:'#8ef6ff',bonus:'#f29bff',normal:'#69caff'}[type]||'#69caff';}
  function spawnBubble(seedStart=false){
    const p=pacing(pops,elapsed,width,height);if(bubbles.length>=p.capacity)return null;
    const base=clamp(Math.min(width,height)*.065,26,38),r=rnd(base,base*1.3),x=rnd(r+8,width-r-8),y=seedStart?rnd(r+10,Math.max(r+11,height-r-10)):height+r+8;
    const speed=clamp(height/rnd(4.8,6.5),55,175)*p.speed,vy=-speed,vx=rnd(-16,16),roll=Math.random();
    let type=roll<.08?'bomb':roll<.18?'time':roll<.25?'freeze':roll<.33?'bonus':'normal';
    if(seedStart&&bubbles.length<3)type='normal';
    const b={x,y,r,vx,vy,type,ttl:(y+r+45)/speed+1,pulse:rnd(0,Math.PI*2),spin:rnd(-1,1)};
    // Space the opening targets; later waves can form readable clusters.
    if(seedStart)for(let attempt=0;attempt<12;attempt++){if(!bubbles.some(o=>Math.hypot(o.x-b.x,o.y-b.y)<o.r+b.r+6))break;b.x=rnd(r+8,width-r-8);b.y=rnd(r+10,Math.max(r+11,height-r-10));b.ttl=(b.y+r+45)/speed+1;}
    bubbles.push(b);return b;
  }
  function multiplierForCombo(c){return feverTimer>0?2.25:c>=12?1.9:c>=8?1.55:c>=4?1.25:1;}
  function addFloatingText(x,y,text,color='#fff',size=18){if(floatingTexts.length>=36)floatingTexts.shift();floatingTexts.push({x,y,text,color,size,t:.85,vy:-28});}
  function popParticles(x,y,color,count=14,radius=0){for(let i=0;i<(reducedMotion?Math.min(5,count):count);i++){const ang=rnd(0,Math.PI*2),sp=rnd(45,150)+radius*.5;particles.push({x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-40,t:rnd(.3,.65),r:rnd(2,4.5),color});}if(particles.length>240)particles.splice(0,particles.length-240);}
  function triggerFever(){feverTimer=5.5;feverMeter=1;addFloatingText(width*.5,height*.28,'FEVER!','#ffd5ff',28);audio.effect('fever');}
  function onPop(b){
    if(b.type==='bomb'){combo=0;comboWindow=0;feverMeter=Math.max(0,feverMeter-.35);score=Math.max(0,score-30);addFloatingText(b.x,b.y,'−30','#ff7b93',20);popParticles(b.x,b.y,bubbleColor('bomb'),24,b.r);audio.effect('bomb');return;}
    pops++;combo++;comboWindow=1.2;feverMeter=clamp(feverMeter+.08,0,1);if(feverMeter>=1&&feverTimer<=0)triggerFever();
    let base=Math.round(10+b.r*.48);if(b.type==='time')base+=6;if(b.type==='freeze')base+=8;if(b.type==='bonus')base+=18;
    const gained=Math.round(base*multiplierForCombo(combo));score+=gained;popParticles(b.x,b.y,bubbleColor(b.type),b.type==='bonus'?22:14,b.r);addFloatingText(b.x,b.y,`+${gained}`,bubbleColor(b.type));
    if(b.type==='time'){timeLeft+=2.4;addFloatingText(b.x,b.y-22,'+2.4s','#ffe486');}
    else if(b.type==='freeze'){freezeTimer=Math.min(8,freezeTimer+3.5);addFloatingText(b.x,b.y-22,'FREEZE','#9ff7ff');}
    else if(b.type==='bonus'){score+=20;addFloatingText(b.x,b.y-22,'BONUS!','#ffb0ff');}
    audio.effect(b.type==='normal'?'pop':b.type,combo);advanceWave();
  }
  function tryPopSegment(a,b){if(!running||paused||gameOver)return false;const hits=[];for(const bubble of bubbles){if(bubble.y<0||bubble.y>height)continue;const d=distanceToSegment(bubble.x,bubble.y,a.x,a.y,b.x,b.y);if(d.distance<=bubble.r+4)hits.push({bubble,t:d.t,distance:d.distance});}if(Math.hypot(b.x-a.x,b.y-a.y)<.5){hits.sort((x,y)=>x.distance-y.distance);hits.splice(1);}else hits.sort((x,y)=>x.t-y.t);for(const hit of hits){const i=bubbles.indexOf(hit.bubble);if(i<0)continue;bubbles.splice(i,1);onPop(hit.bubble);}if(hits.length)updateHud();return hits.length>0;}
  function point(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*width/Math.max(1,r.width),y:(e.clientY-r.top)*height/Math.max(1,r.height)};}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0||pointerId!==null||!running||paused||gameOver)return;e.preventDefault();audio.unlock();audio.playScene(sceneIndex+1);pointerId=e.pointerId;pointerPoint=point(e);try{canvas.setPointerCapture(pointerId);}catch{}tryPopSegment(pointerPoint,pointerPoint);},{passive:false});
  canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointerId||!pointerPoint)return;e.preventDefault();const samples=e.getCoalescedEvents?.()||[];for(const sample of [...samples,e]){const next=point(sample);if(Math.hypot(next.x-pointerPoint.x,next.y-pointerPoint.y)>=.5){tryPopSegment(pointerPoint,next);pointerPoint=next;}}},{passive:false});
  canvas.addEventListener('pointerup',e=>{if(e.pointerId!==pointerId)return;if(pointerPoint){const next=point(e);if(Math.hypot(next.x-pointerPoint.x,next.y-pointerPoint.y)>=.5)tryPopSegment(pointerPoint,next);}resetInput();});
  for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(e.pointerId===pointerId)resetInput();});
  $('btnStart').addEventListener('click',()=>running?setPaused(false):startGame());$('btnPause').addEventListener('click',togglePause);$('btnRestart').addEventListener('click',startGame);
  $('btnSubmit').addEventListener('click',()=>{if(!ready)return;if(running)setPaused(true);submitScore();});
  function openOverlay(chat=false){if(running)setPaused(true);try{window.GG?.openOverlay?.();if(chat)window.GG?.openChat?.();}catch{}}
  $('btnOverlay').addEventListener('click',()=>openOverlay());$('btnChat').addEventListener('click',()=>openOverlay(true));
  for(const k of ['musicVolume','effectsVolume'])$(k).addEventListener('input',()=>{settings[k]=clamp(Number($(k).value)/100,0,1);safeWrite(SETTINGS_KEY,JSON.stringify(settings));syncAudioSettings();if(running&&!paused)audio.playScene(sceneIndex+1);});
  $('btnMute').addEventListener('click',()=>{settings.muted=!settings.muted;safeWrite(SETTINGS_KEY,JSON.stringify(settings));syncAudioSettings();if(running&&!paused)audio.playScene(sceneIndex+1);});
  window.addEventListener('keydown',e=>{if(e.repeat||e.altKey||e.ctrlKey||e.metaKey||['INPUT','BUTTON','TEXTAREA','SELECT'].includes(e.target?.tagName))return;const key=e.key.toLowerCase();if([' ','enter','p','escape'].includes(key)){e.preventDefault();if(!running&&key!=='p'&&key!=='escape')startGame();else if(running){if(key==='escape')setPaused(true);else togglePause();}}});
  window.addEventListener('blur',()=>{resetInput();if(running)setPaused(true);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resetInput();if(running)setPaused(true);audio.pause();}});
  window.addEventListener('pagehide',()=>{if(running)setPaused(true);audio.pause();resetInput();});
  function update(dt){
    if(!running||paused||gameOver)return;elapsed+=dt;visualTime+=dt;timeLeft=Math.max(0,timeLeft-dt);if(timeLeft<=0){endGame();return;}
    comboWindow=Math.max(0,comboWindow-dt);if(comboWindow===0)combo=0;
    freezeTimer=Math.max(0,freezeTimer-dt);if(feverTimer>0){feverTimer=Math.max(0,feverTimer-dt);if(!feverTimer)feverMeter=.35;}
    advanceWave();transition=Math.min(1,transition+dt*.85);toastTimer=Math.max(0,toastTimer-dt);if(!toastTimer)$('sceneToast').className='sceneToast';
    const p=pacing(pops,elapsed,width,height),interval=p.interval*(feverTimer>0?.75:1);spawnT+=dt;
    while(spawnT>=interval){spawnT-=interval;for(let i=0;i<p.batch;i++)spawnBubble();}
    for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i],speed=freezeTimer>0?.48:1;b.x+=b.vx*dt*speed;b.y+=b.vy*dt*speed;b.ttl-=dt*speed;b.pulse+=dt*(1.8+b.spin*.2);
      if(b.x<b.r+6){b.x=b.r+6;b.vx=Math.abs(b.vx)*.85;}else if(b.x>width-b.r-6){b.x=width-b.r-6;b.vx=-Math.abs(b.vx)*.85;}
      if(b.ttl<=0||b.y+b.r<-30){if(b.type!=='bomb'){combo=0;comboWindow=0;}bubbles.splice(i,1);}
    }
    for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.t-=dt;if(p.t<=0){particles.splice(i,1);continue;}p.vy+=260*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;}
    for(let i=floatingTexts.length-1;i>=0;i--){const f=floatingTexts[i];f.t-=dt;if(f.t<=0)floatingTexts.splice(i,1);else f.y+=f.vy*dt;}
    const sec=Math.ceil(timeLeft);if(sec<=5&&sec!==warningSecond){warningSecond=sec;audio.effect('warning');}
    hudT+=dt;if(hudT>=.1){hudT=0;updateHud();}
  }
  function drawBackground(){
    const w=width,h=height;ctx.fillStyle='#12395b';ctx.fillRect(0,0,w,h);
    function paint(index,alpha){const im=images.bg[index]||images.bg[0];if(!im)return;const r=cover(im.width,im.height,w,h);ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(im,r.x,r.y,r.w,r.h);ctx.restore();}
    if(transition<1)paint(previousScene,1);paint(sceneIndex,transition);
    const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,'rgba(3,12,30,.14)');grad.addColorStop(1,'rgba(3,12,30,.32)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    if(!reducedMotion)for(const b of ambientBubbles){const x=b.x*w+Math.sin(visualTime*.6+b.phase)*6,y=h-((b.y*h+visualTime*b.speed)%(h+40));ctx.save();ctx.globalAlpha=.12;ctx.strokeStyle='#c5f7ff';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,b.size,0,Math.PI*2);ctx.stroke();ctx.restore();}
  }
  function fallbackBubble(b) {
    const col = bubbleColor(b.type);
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = 22;
    const g = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, 0, b.x, b.y, b.r * 1.1);
    g.addColorStop(0, 'rgba(255,255,255,0.75)');
    g.addColorStop(0.3, col);
    g.addColorStop(1, 'rgba(18,26,60,0.96)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.28, b.y - b.r * 0.28, b.r * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBubble(b) {
    const sprite = images.bubble[b.type];
    const bob = Math.sin(b.pulse) * b.r * 0.04;
    const rr = b.r * (1 + (b.type === 'bonus' ? 0.06 * Math.sin(b.pulse * 2.1) : 0));
    if (sprite) {
      ctx.save();
      const glowAlpha = b.type === 'bonus' ? 0.34 : b.type === 'freeze' ? 0.25 : 0.18;
      ctx.globalAlpha = glowAlpha;
      ctx.drawImage(sprite, b.x - rr * 1.22, b.y - rr * 1.22 + bob, rr * 2.44, rr * 2.44);
      ctx.restore();
      ctx.drawImage(sprite, b.x - rr, b.y - rr + bob, rr * 2, rr * 2);
    } else {
      fallbackBubble({ ...b, y: b.y + bob, r: rr });
    }

    if (b.type === 'bonus' && feverTimer > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.32)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, rr * 1.12 + Math.sin(b.pulse * 2) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const a = clamp(p.t * 1.4, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFloatingTexts() {
    for (const f of floatingTexts) {
      ctx.save();
      ctx.globalAlpha = clamp(f.t * 1.3, 0, 1);
      ctx.fillStyle = f.color;
      ctx.strokeStyle = 'rgba(8,10,30,.55)';
      ctx.lineWidth = 3;
      ctx.font = `1000 ${f.size}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  function drawComboBanner() {
    if (!running || combo < 3) return;
    const w = cw();
    const text = feverTimer > 0 ? `FEVER x${multiplierForCombo(combo).toFixed(2)}` : `COMBO x${multiplierForCombo(combo).toFixed(2)}`;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.font = '1000 20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = feverTimer > 0 ? '#ffd9ff' : '#dbf4ff';
    ctx.strokeStyle = 'rgba(10,16,36,.5)';
    ctx.lineWidth = 4;
    ctx.strokeText(text, w * 0.5, 36);
    ctx.fillText(text, w * 0.5, 36);
    ctx.restore();
  }


  function draw(){drawBackground();for(const b of bubbles)drawBubble(b);drawParticles();drawFloatingTexts();drawComboBanner();}
  function loop(t){const dt=Math.max(0,Math.min(.1,(t-lastT)/1000));lastT=t;if(running&&!paused){accumulator+=dt;while(accumulator>=1/120){update(1/120);accumulator-=1/120;if(!running)break;}}else accumulator=0;draw();requestAnimationFrame(loop);}
  async function boot(){
    syncAudioSettings();resize();for(let i=0;i<12;i++)ambientBubbles.push({x:Math.random(),y:Math.random(),size:rnd(3,9),speed:rnd(6,14),phase:rnd(0,6.28)});
    try{window.GG?.init?.({title:'Bubble Pop Arena'});}catch{}
    await loadAssets();ready=true;$('btnStart').disabled=false;showPanel('Bubble Pop Arena','Start with 45 seconds. Pop time bubbles to keep going, chain combos and chase your best across six beautiful arenas.','Play');updateHud();
    window.addEventListener('resize',resize,{passive:true});window.visualViewport?.addEventListener('resize',resize,{passive:true});
    if(typeof ResizeObserver!=='undefined')new ResizeObserver(resize).observe(canvas.parentElement);
    lastT=performance.now();requestAnimationFrame(loop);preloadScenes();
  }
  boot();
})();
