'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const sectors = [
    {name:'Amber Relay',goal:6,seconds:21, core:'BRAIN',words:['PLAN','MAP','CODE','GAME','DASH','WORD','TYPE','FAST','DATA','FOCUS','SMART','SCORE','LEVEL','SKILL','POWER','BRAIN']},
    {name:'Tideglass Belt',goal:8,seconds:19,core:'VECTOR',words:['GLORY','RACER','SWIPE','TOWER','BRICK','PIXEL','ARENA','QUEST','CRAFT','BOOST','SYSTEM','VECTOR','ROBOT','LASER','MOTION','SPRINT']},
    {name:'Violet Drift',goal:10,seconds:17,core:'GALAXY',words:['FUSION','ORBIT','VORTEX','SPARK','STORM','FLAME','FROST','BLADE','SHIELD','COMBO','BONUS','MATRIX','GALAXY','ROCKET','PLAYER','TARGET']},
    {name:'Last Light',goal:12,seconds:16,core:'HYPERDRIVE',words:['HYPERDRIVE','ASTEROID','NEBULA','KEYBOARD','VICTORY','CHAMPION','MISSION','LANGUAGE','VELOCITY','QUANTUM','STREAK','PERFECT','REACTOR','COMMAND','LEGEND']}
  ];
  const key='wga.word-dash.salvage.v1', bestKey='wga.word-dash.salvage.best';
  let storageOK=true;
  function read(k){try{return localStorage.getItem(k);}catch{storageOK=false;return null;}}
  function write(k,value){try{localStorage.setItem(k,value);}catch{storageOK=false;}}
  function load(){
    try{
      const s=JSON.parse(read(key)), spec=sectors[s?.sector];
      if(spec && Number.isInteger(s.sector) && Number.isInteger(s.done) && s.done>=0 && s.done<=spec.goal &&
         Number.isInteger(s.hull) && s.hull>=0 && s.hull<=3 && Number.isSafeInteger(s.score) &&
         Number.isSafeInteger(s.base) && s.base>=0 && s.score>=s.base)return s;
    }catch{}
    return null;
  }
  const newSector=(sector,base)=>({sector,base,score:base,done:0,hull:3});
  let flight=load(), best=Number(read(bestKey))||0;
  const classic=Number(read('gg_word_dash_best_v2'))||0;
  const art=flightArt($('space')), keyboard=new Map(), words=window.WordDashVocabulary;
  let mode='intro', targets=[],locked=null,sequence=0,lastWord='',pulseKey=null, sound=false, audio;
  function beep(high){
    if(!sound)return;
    try{audio ||= new AudioContext();void audio.resume().catch(()=>{});
      const osc=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
      osc.type='triangle';osc.frequency.setValueAtTime(high?680:340,now);
      osc.frequency.exponentialRampToValueAtTime(high?920:200,now+.09);
      gain.gain.setValueAtTime(.045,now);gain.gain.exponentialRampToValueAtTime(.001,now+.11);
      osc.connect(gain).connect(audio.destination);osc.start();osc.stop(now+.12);
    }catch{}
  }
  const spec=()=>sectors[flight?.sector??0];
  function status(message){$('signal').textContent=message;}
  function sync(){
    const s=flight||newSector(0,0);
    $('sector').textContent=(s.sector+1)+'/4 · '+spec().name;
    $('score').textContent=s.score;$('shield').textContent=s.hull+'/3';$('quota').textContent=s.done+' / '+spec().goal;
    $('pause').disabled=mode!=='play';
    for(const button of keyboard.values())button.disabled=mode!=='play';
    $('release').disabled=mode!=='play';
  }
  function save(){write(key,JSON.stringify(flight));if(flight.score>best){best=flight.score;write(bestKey,String(best));}}
  function overlay(next,title,brief,action){
    mode=next;$('panel').hidden=false;$('contacts').inert=true;
    $('eyebrow').textContent=next==='intro'?'WORD DASH':spec().name.toUpperCase();
    $('title').textContent=title;
    if(next==='intro'){$('title').replaceChildren('Letter',document.createElement('br'));const em=document.createElement('em');em.textContent='Salvage';$('title').append(em);}
    $('brief').textContent=brief;$('btnStart').textContent=action;
    $('info').hidden=next!=='intro';$('record').textContent=storageOK?'Flight best '+best+(classic?' · Classic best '+classic:''):'Device storage unavailable · session only';
    sync();if(next!=='intro')$('btnStart').focus({preventScroll:true});
  }
  function intro(){
    let brief='Pilot a salvage ship through four sectors. Shoot loose letters and spell word comets before they reach your shield.';
    if(flight && flight.hull && flight.done<spec().goal)brief='Checkpoint: '+spec().name+' · '+flight.done+'/'+spec().goal+' salvaged · '+flight.hull+' shield. Incoming targets return fresh.';
    overlay('intro','Letter Salvage',brief,flight?'Open flight log':'Launch flight');
    if(flight && flight.hull && flight.done<spec().goal)$('btnStart').textContent='Continue flight';
  }
  function erase(t){t.button.remove();targets=targets.filter(item=>item!==t);if(locked===t)locked=null;}
  function clearSky(){targets.forEach(t=>t.button.remove());targets=[];locked=null;}
  function label(t){
    const hit=document.createElement('span');hit.className='hit';hit.textContent=t.word.slice(0,t.index);
    t.button.replaceChildren(hit,t.word.slice(t.index));t.button.classList.toggle('locked',locked===t);
    t.button.setAttribute('aria-label',(t.core?'Beacon ':t.word.length===1?'Letter ':'Word ')+t.word+(t.index?' · next '+t.word[t.index]:''));
  }
  function spawn(lane,core=false){
    const single=!core && sequence%3===0, initials=new Set(targets.map(t=>t.word[0]));
    const pool=core?[spec().core]:single?[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']:spec().words;
    const options=pool.filter(w=>!initials.has(w[0])&&w!==lastWord);
    const word=options.length?options[Math.floor(Math.random()*options.length)]:pool[0];
    const button=document.createElement('button');
    button.className='contact'+(single?' single':'');button.type='button';
    const t={word,button,core,lane,index:0,x:core?.5:(lane===0?.26:.74),y:lane===0?.15:.10};
    sequence++;if(!single)lastWord=word;
    button.style.left=t.x*100+'%';button.style.top=t.y*100+'%';
    button.onclick=()=>{if(mode!=='play')return;if(locked && locked!==t){status('Finish '+locked.word+' or press Backspace to release.');return;}if(t.word.length===1){shoot(t.word,t);return;}locked=t;label(t);status('Locked · '+t.word+' · type '+t.word[t.index]);};
    label(t);targets.push(t);$('contacts').append(button);
  }
  function fillSky(){
    const left=spec().goal-flight.done;
    if(left===1){if(!targets.some(t=>t.core)){clearSky();spawn(0,true);status('Beacon core · spell '+spec().core+' to clear the sector.');}return;}
    for(const lane of [0,1])if(targets.length<Math.min(2,left-1)&&!targets.some(t=>t.lane===lane))spawn(lane);
  }
  function play(repopulate=true){
    mode='play';$('panel').hidden=true;$('contacts').inert=false;
    if(repopulate){clearSky();sequence=0;lastWord='';status('Fire the first letter of any target.');fillSky();}
    sync();
  }
  function result(){
    clearSky();
    if(!flight.hull)overlay('failed','Shield down','Retry '+spec().name+' with three shield points and your sector-entry score of '+flight.base+'.','Retry sector');
    else if(flight.sector===3)overlay('won','Signal restored','All four beacons are online. Final flight score: '+flight.score+'.','New flight');
    else overlay('clear','Beacon online',spec().name+' cleared. Next: '+sectors[flight.sector+1].name+' with a fresh shield.','Next sector');
  }
  function report(){window.GG?.endRound?.({gameSlug:'word-dash',score:flight.score});}
  function shoot(letter,explicit){
    if(mode!=='play')return;
    const t=explicit||locked||targets.find(item=>item.word[0]===letter);
    if(!t||t.word[t.index]!==letter){status(locked?'Lock: '+locked.word+' · next '+locked.word[locked.index]:'Find a target starting with '+letter+'.');return;}
    if(locked && locked!==t)return;
    locked=t;t.index++;const complete=t.index===t.word.length;
    art.fire(t.x,t.y,complete);beep(complete);
    pulseKey?.classList.remove('fired');pulseKey=keyboard.get(letter);pulseKey?.classList.add('fired');
    if(!complete){label(t);status('Locked · '+t.word+' · next '+t.word[t.index]);return;}
    flight.done++;const points=t.word.length*10+(t.core?100:0);flight.score+=points;
    status(t.word+' +'+points+(words[t.word]?' · '+words[t.word]:''));
    erase(t);save();sync();
    if(flight.done===spec().goal){report();result();}else fillSky();
  }
  function release(){
    if(!locked)return;
    locked.index=0;const t=locked;locked=null;label(t);status('Lock released. Pick a new first letter.');
  }
  function pause(){
    if(mode==='play')overlay('paused','Flight paused','Your targets are holding position. Closing the tab saves completed targets; unfinished words restart when you return.','Resume flight');
  }
  $('btnStart').onclick=()=>{
    if(mode==='help'){intro();return;}
    if(mode==='paused'){play(false);return;}
    if(mode==='intro' && flight && (!flight.hull||flight.done===spec().goal)){result();return;}
    if(mode==='won'||!flight)flight=newSector(0,0);
    else if(mode==='failed')flight=newSector(flight.sector,flight.base);
    else if(mode==='clear')flight=newSector(flight.sector+1,flight.score);
    save();play();
  };
  $('info').onclick=()=>overlay('help','How to fly','Type a target’s first letter or tap it on the on-screen keyboard. Each correct key fires a bolt; the last breaks the comet. Tap a comet to select it, or tap a loose letter to shoot it directly. Backspace releases a lock. Each escaped target costs one shield point. The last word in each sector is its beacon.','Back to flight');
  $('pause').onclick=pause;
  $('sound').onclick=()=>{sound=!sound;$('sound').setAttribute('aria-pressed',String(sound));$('sound').textContent=sound?'Sound on':'Sound off';beep(true);};
  for(const row of ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM']){
    const group=document.createElement('div');group.className='keyrow';
    for(const letter of row){const b=document.createElement('button');b.className='key';b.type='button';b.textContent=letter;b.onclick=()=>shoot(letter);keyboard.set(letter,b);group.append(b);}
    if(row==='ZXCVBNM'){const back=document.createElement('button');back.className='key';back.id='release';back.textContent='⌫';back.setAttribute('aria-label','Release lock');back.onclick=()=>{if(mode==='play')release();};group.append(back);}
    $('keys').append(group);
  }
  window.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.repeat)return;
    if(e.key==='Escape'){if(mode==='play')pause();else if(mode==='paused')play(false);return;}
    if(mode!=='play')return;
    if(e.key==='Backspace'){e.preventDefault();release();}
    else if(/^[A-Z]$/i.test(e.key)){e.preventDefault();shoot(e.key.toUpperCase());}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  let last=performance.now();
  function frame(now){
    const dt=Math.min(.1,Math.max(0,(now-last)/1000));last=now;
    if(mode==='play'){
      for(const t of [...targets]){
        if(mode!=='play')break;
        t.y+=dt*.68/(spec().seconds*(t.core?1.3:1));
        t.button.style.top=t.y*100+'%';
        if(t.y>=.82){erase(t);flight.hull--;status('Shield hit · '+flight.hull+' remaining.');save();sync();if(!flight.hull){report();result();}else fillSky();}
      }
    }
    art.draw(mode==='paused'?0:dt,flight?.sector??0,mode==='intro'||mode==='help',targets);
    requestAnimationFrame(frame);
  }
  intro();requestAnimationFrame(frame);
})();

