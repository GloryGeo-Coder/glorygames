(() => {
  'use strict';

  const GAME_SLUG = 'recycle-rush-2';
  const SAVE_KEY = 'wga_recycle_rush_2_save_v1';
  const BEST_KEY = 'wga_recycle_rush_2_best';
  const THUMBNAIL_SRC = 'thumb.png';
  const BRAND_TAGLINE = 'Sort • Build • Save Verdale';
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);

  const ui = {
    score: $('scoreValue'), level: $('levelValue'), lives: $('livesValue'), combo: $('comboValue'), stars: $('starsValue'),
    objective: $('objectiveText'), professor: $('professorBubble'), circuit: $('circuitAvatar'), bossPanel: $('bossPanel'),
    bossName: $('bossName'), bossFill: $('bossFill'), progressText: $('progressText'), progressFill: $('progressFill'), powerSlot: $('powerSlot'),
    overlay: $('screenOverlay'), mapScreen: $('mapScreen'), mapGrid: $('mapGrid'), comicScreen: $('comicScreen'), comicTitle: $('comicTitle'),
    comicPanels: $('comicPanels'), comicContinue: $('comicContinueBtn'), settingsScreen: $('settingsScreen'), badgesScreen: $('badgesScreen'), badgeGrid: $('badgeGrid'),
    startNext: $('startNextBtn'), loopBtn: $('loopBtn'), settingsBtn: $('settingsBtn'), badgesBtn: $('badgesBtn'),
    musicVolume: $('musicVolume'), sfxVolume: $('sfxVolume'), reducedMotion: $('reducedMotion'), colorblindMode: $('colorblindMode'),
    leftBtn: $('leftBtn'), rightBtn: $('rightBtn'), powerBtn: $('powerBtn'), pauseBtn: $('pauseBtn'), muteBtn: $('muteBtn'), restartBtn: $('restartBtn')
  };

  const safeStorage = {
    get(key, fallback) {
      try {
        const raw = window.localStorage && window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) { return fallback; }
    },
    set(key, value) {
      try {
        if (window.localStorage) window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {}
    },
    getNumber(key, fallback) {
      try { return Number(window.localStorage && window.localStorage.getItem(key)) || fallback; } catch (err) { return fallback; }
    },
    setNumber(key, value) {
      try { if (window.localStorage) window.localStorage.setItem(key, String(value)); } catch (err) {}
    }
  };

  const CATS = {
    paper:   { label:'Paper', color:'#7ad7ff', icon:'assets/sprites/item-newspaper.png', sound:'paper' },
    plastic: { label:'Plastic', color:'#62f6af', icon:'assets/sprites/item-plastic-bottle.png', sound:'plastic' },
    organic: { label:'Organic', color:'#9cff6b', icon:'assets/sprites/item-organic.png', sound:'organic' },
    glass:   { label:'Glass', color:'#bde7ff', icon:'assets/sprites/item-glass-bottle.png', sound:'glass' },
    metal:   { label:'Metal', color:'#ffd86b', icon:'assets/sprites/item-tin-can.png', sound:'metal' },
    ewaste:  { label:'E-Waste', color:'#a379ff', icon:'assets/sprites/item-ewaste.png', sound:'ewaste' },
    hazmat:  { label:'Hazmat', color:'#ff5f84', icon:'assets/sprites/item-hazmat.svg', sound:'hazmat' },
    textiles:{ label:'Textiles', color:'#ff9d52', icon:'assets/sprites/item-textiles.svg', sound:'textiles' }
  };

  const POWERS = {
    magnet: { label:'Magnet', color:'#ff5f9f', icon:'assets/sprites/power-magnet.svg' },
    slow: { label:'Slow-Mo', color:'#4bdcff', icon:'assets/sprites/power-slow.svg' },
    shield: { label:'Shield', color:'#53ffb3', icon:'assets/sprites/power-shield.svg' },
    double: { label:'Double Points', color:'#ffd86b', icon:'assets/sprites/power-double.svg' }
  };

  const CHAPTERS = [
    { name:'Greenwood Elementary', bg:'assets/backgrounds/bg-school-cleanup.png', theme:'school', boss:'Hallway Sludge', bossIcon:'assets/bosses/hallway-sludge.svg', start:0, end:2, color:'#4bdcff', intro:['Professor Loop activates Circuit in a bright classroom lab.','The Loop is weak. Mis-sorted items have created Hallway Sludge.','Sort the basics: paper, plastic and organic waste.'] },
    { name:'Maple Street Block Party', bg:'assets/backgrounds/bg-community-day.png', theme:'community', boss:'Curbside Crawler', bossIcon:'assets/bosses/curbside-crawler.svg', start:3, end:5, color:'#ff9d52', intro:['Verdale residents are ready to recycle, but the street bins are clogged.','Glass and metal join the mission.','Curbside Crawler splits grime hazards when hit.'] },
    { name:'Riverside Park', bg:'assets/backgrounds/bg-park-clean-sweep.png', theme:'park', boss:'The Bog', bossIcon:'assets/bosses/the-bog.svg', start:6, end:8, color:'#53ffb3', intro:['The park is losing its colour as Grime seeps into the riverbank.','Leaf gusts push falling items sideways.','Watch the wind before selecting a bin.'] },
    { name:'Downtown Buy-Back Centre', bg:'assets/backgrounds/bg-buyback-centre.png', theme:'buyback', boss:'Coin-Op Chaos', bossIcon:'assets/bosses/coin-op-chaos.svg', start:9, end:11, color:'#ffd86b', intro:['The buy-back centre rewards fast sorting and clean materials.','Power-ups are now active.','Coin-Op Chaos forces dual-chute reactions.'] },
    { name:'Material Recovery Facility', bg:'assets/backgrounds/bg-material-recovery-facility.png', theme:'mrf', boss:'The Sorter', bossIcon:'assets/bosses/the-sorter.svg', start:12, end:14, color:'#4bdcff', intro:['Inside the MRF, conveyors feed items from every direction.','E-waste becomes a core category.','The Sorter accelerates after every mistake.'] },
    { name:'Landfill Outskirts', bg:'assets/backgrounds/bg-landfill-diversion.png', theme:'landfill', boss:'Landfill Leviathan', bossIcon:'assets/bosses/landfill-leviathan.svg', start:15, end:16, color:'#ff5f84', intro:['The landfill edge is dangerous and dense with hazards.','Hazmat and batteries must be sorted carefully.','The Leviathan changes patterns through three phases.'] },
    { name:'E-Waste Drop-off Drive', bg:'assets/backgrounds/bg-ewaste-dropoff.png', theme:'ewaste', boss:'Circuit Storm', bossIcon:'assets/bosses/circuit-storm.svg', start:17, end:18, color:'#a379ff', intro:['The e-waste drive flickers with static.','Textiles are introduced with smaller precision targets.','Circuit Storm sends fast swarms across the screen.'] },
    { name:'The Core', bg:'assets/backgrounds/bg-circular-challenge.png', theme:'core', boss:'The Great Grime', bossIcon:'assets/bosses/great-grime.svg', start:19, end:19, color:'#ff2fb3', intro:['The source of Grime hides inside The Core.','Every category and mechanic returns.','Defeat The Great Grime and restore colour to Verdale.'] }
  ];

  const LEVELS = [
    { name:'School Sorting 101', chapter:0, kind:'standard', cats:['paper','plastic','organic'], target:16, speed:120, spawn:.95, wind:0, power:false, fact:'Start with the big three: paper, plastic and organic waste.' },
    { name:'Classroom Clean Sweep', chapter:0, kind:'standard', cats:['paper','plastic','organic'], target:20, speed:136, spawn:.85, wind:8, power:false, fact:'Clean material streams make recycling easier and more valuable.' },
    { name:'Boss: Hallway Sludge', chapter:0, kind:'boss', cats:['paper','plastic','organic'], target:18, bossHp:160, speed:145, spawn:.78, attack:'sludge', fact:'Tap Grime hazards during boss fights to weaken the sludge.' },
    { name:'Curbside Basics', chapter:1, kind:'standard', cats:['paper','plastic','organic','glass'], target:22, speed:145, spawn:.80, wind:8, fact:'Glass belongs in a separate stream because it can contaminate other recyclables.' },
    { name:'Metal & Glass Mix', chapter:1, kind:'standard', cats:['paper','plastic','glass','metal'], target:24, speed:153, spawn:.74, wind:10, fact:'Metal containers can be recycled many times if kept clean.' },
    { name:'Boss: Curbside Crawler', chapter:1, kind:'boss', cats:['paper','plastic','glass','metal'], target:22, bossHp:190, speed:156, spawn:.70, attack:'split', fact:'Some hazards split after a hit. Clear both pieces before they reach the bins.' },
    { name:'Windy Park Pickup', chapter:2, kind:'standard', cats:['paper','plastic','organic','glass'], target:25, speed:160, spawn:.70, wind:46, fact:'Wind gusts make item position matter. Watch the drifting leaves.' },
    { name:'Riverside Rescue', chapter:2, kind:'standard', cats:['paper','plastic','organic','glass','metal'], target:27, speed:166, spawn:.66, wind:58, fact:'Items can drift away from the correct bin. Hit-detection checks the real x-position.' },
    { name:'Boss: The Bog', chapter:2, kind:'boss', cats:['paper','plastic','organic','glass','metal'], target:24, bossHp:220, speed:160, spawn:.65, wind:60, attack:'bog', fact:'The Bog creates slow puddles. Use Slow-Mo only when it really matters.' },
    { name:'Power-Up Pickup', chapter:3, kind:'standard', cats:['paper','plastic','glass','metal'], target:27, speed:170, spawn:.63, wind:24, power:true, fact:'Power-ups are tools, not shortcuts. Save them for difficult waves.' },
    { name:'Dual Chute Trial', chapter:3, kind:'standard', cats:['paper','plastic','organic','glass','metal'], target:30, speed:178, spawn:.60, wind:28, power:true, dual:true, fact:'Combos stack extra musical layers and increase your score.' },
    { name:'Boss: Coin-Op Chaos', chapter:3, kind:'boss', cats:['paper','plastic','organic','glass','metal'], target:28, bossHp:245, speed:182, spawn:.58, wind:30, power:true, attack:'coin', fact:'Double Points is best used during a safe combo streak.' },
    { name:'Conveyor Crossfire', chapter:4, kind:'standard', cats:['paper','plastic','metal','ewaste'], target:30, speed:186, spawn:.56, wind:18, power:true, edge:true, fact:'Side conveyors mean items no longer only fall from the centre.' },
    { name:'E-Waste Routing', chapter:4, kind:'standard', cats:['paper','plastic','metal','ewaste','glass'], target:32, speed:194, spawn:.54, wind:22, power:true, edge:true, fact:'E-waste needs special handling because it can contain valuable and hazardous parts.' },
    { name:'Boss: The Sorter', chapter:4, kind:'boss', cats:['paper','plastic','metal','ewaste','glass'], target:30, bossHp:270, speed:202, spawn:.52, wind:26, power:true, edge:true, attack:'machine', fact:'The Sorter escalates speed. Use Shield before risky waves.' },
    { name:'Hazmat Warning', chapter:5, kind:'standard', cats:['paper','plastic','metal','ewaste','hazmat'], target:34, speed:206, spawn:.51, wind:24, power:true, edge:true, hazardDense:true, fact:'Batteries and hazardous items must never be mixed into normal recycling bins.' },
    { name:'Boss: Landfill Leviathan', chapter:5, kind:'boss', cats:['paper','plastic','metal','ewaste','hazmat','organic'], target:34, bossHp:330, speed:216, spawn:.48, wind:32, power:true, edge:true, hazardDense:true, attack:'phase', fact:'Phase bosses remix patterns. Stay calm and clear hazards early.' },
    { name:'Textile Precision', chapter:6, kind:'standard', cats:['paper','plastic','ewaste','hazmat','textiles'], target:36, speed:220, spawn:.47, wind:34, power:true, edge:true, precision:true, fact:'Textiles need dedicated recovery routes instead of going to landfill.' },
    { name:'Boss: Circuit Storm', chapter:6, kind:'boss', cats:['paper','plastic','ewaste','hazmat','textiles','metal'], target:35, bossHp:340, speed:230, spawn:.45, wind:42, power:true, edge:true, precision:true, attack:'storm', fact:'Static attacks reduce visibility briefly. Trust the bin colours and icons.' },
    { name:'Finale: The Great Grime', chapter:7, kind:'finale', cats:['paper','plastic','organic','glass','metal','ewaste','hazmat','textiles'], target:45, bossHp:520, speed:240, spawn:.42, wind:45, power:true, edge:true, hazardDense:true, precision:true, attack:'final', fact:'The Core uses every category. Clean streams keep The Loop alive.' }
  ];

  const FACTS = {
    paper:['Paper recycles best when kept dry and clean.','Flatten paper items to save space in bins.','Food-stained paper may contaminate clean paper streams.','Cardboard is valuable when it is separated from wet waste.'],
    plastic:['Plastic packaging should be emptied before sorting.','Different plastics have different recovery routes.','Clean plastic is easier to process into new products.','Caps and labels can affect sorting accuracy.'],
    organic:['Organic waste can become compost instead of landfill methane.','Food scraps do not belong in dry recycling streams.','Separating organics protects paper and packaging quality.','Garden waste can be recovered through composting.'],
    glass:['Glass can be recycled repeatedly when sorted correctly.','Broken glass can be dangerous in mixed waste.','Clear, green and brown glass may be managed separately.','Rinsed glass helps reduce odour and contamination.'],
    metal:['Metal cans are often highly recyclable.','Aluminium saves energy when recycled into new products.','Clean metal containers improve recovery value.','Steel cans can be separated using magnets.'],
    ewaste:['E-waste can contain valuable metals and risky components.','Phones, cables and small devices need special recovery points.','Do not mix batteries with normal recyclables.','Responsible e-waste handling protects people and the environment.'],
    hazmat:['Batteries can leak or spark if handled incorrectly.','Hazardous items need dedicated drop-off routes.','Never place chemicals into normal recycling bins.','Hazmat sorting protects workers and equipment.'],
    textiles:['Textiles can be reused, repaired, donated or recycled.','Dry, clean textiles are easier to recover.','Fabric recovery keeps bulky waste out of landfills.','Separate shoes and clothing where collection rules require it.']
  };

  const BADGES = [
    { id:'glass', name:'Glass Master', desc:'Sort 30 glass items.' },
    { id:'hazmat', name:'Hazmat Hero', desc:'Clear the Hazmat Warning mission.' },
    { id:'nohit', name:'No-Hit Hub', desc:'Clear any level without losing a life.' },
    { id:'boss', name:'Grime Breaker', desc:'Defeat three Grime bosses.' },
    { id:'loop', name:'Loop Restorer', desc:'Complete the campaign.' },
    { id:'combo15', name:'Combo Spark', desc:'Reach a 15-sort combo.' },
    { id:'allstars', name:'Star Recycler', desc:'Earn 30 total stars.' }
  ];

  const DEFAULT_SAVE = { unlockedLevel:0, stars:{}, badges:{}, categoryCounts:{}, bossKills:0, loopUnlocked:false, settings:{music:.45,sfx:.75,reducedMotion:false,colorblind:false} };
  const save = Object.assign({}, DEFAULT_SAVE, safeStorage.get(SAVE_KEY, DEFAULT_SAVE));
  save.settings = Object.assign({}, DEFAULT_SAVE.settings, save.settings || {});
  save.stars = save.stars || {}; save.badges = save.badges || {}; save.categoryCounts = save.categoryCounts || {};

  const state = {
    screen:'map', running:false, paused:false, loop:false, levelIndex:0, score:0, best:safeStorage.getNumber(BEST_KEY,0), totalStars:0,
    lives:3, startLives:3, combo:0, maxCombo:0, sorted:0, wrong:0, noHit:true, selectedBin:0, bins:[], items:[], particles:[], hazards:[], boss:null,
    spawnTimer:0, bossTimer:3, time:0, transitionLevel:null, power:null, powerTime:0, magnetCharges:0, shield:0, doubleTime:0, slowTime:0, intensity:0,
    audio:{ctx:null, master:null, music:null, sfx:null, musicTimer:null, step:0}, images:{}, keys:{}, W:1280, H:720, dpr:1
  };

  function persist(){ safeStorage.set(SAVE_KEY, save); }
  function unlockBadge(id){ if(!save.badges[id]){ save.badges[id]=true; persist(); professor('Eco-Badge unlocked: '+(BADGES.find(b=>b.id===id)?.name || id)+'!', 'happy'); } }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function rand(a,b){ return a + Math.random()*(b-a); }
  function choose(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function level(){ return LEVELS[state.levelIndex] || LEVELS[0]; }
  function chapter(){ return CHAPTERS[level().chapter] || CHAPTERS[0]; }

  async function loadImage(src){
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function loadAssets(){
    const paths = new Set([THUMBNAIL_SRC]);
    CHAPTERS.forEach(c => { paths.add(c.bg); paths.add(c.bossIcon); });
    Object.values(CATS).forEach(c => paths.add(c.icon));
    Object.values(POWERS).forEach(p => paths.add(p.icon));
    ['assets/sprites/circuit-neutral.svg','assets/sprites/circuit-happy.svg','assets/sprites/circuit-worried.svg','assets/sprites/professor-loop.svg','assets/sprites/grime-blob.svg'].forEach(p => paths.add(p));
    const list = Array.from(paths);
    const loaded = await Promise.all(list.map(loadImage));
    list.forEach((p,i) => state.images[p] = loaded[i]);
  }

  function img(src){ return state.images[src] || null; }

  function applySettings(){
    ui.musicVolume.value = save.settings.music;
    ui.sfxVolume.value = save.settings.sfx;
    ui.reducedMotion.checked = !!save.settings.reducedMotion;
    ui.colorblindMode.checked = !!save.settings.colorblind;
    document.body.classList.toggle('reduced', !!save.settings.reducedMotion);
    document.body.classList.toggle('colorblind', !!save.settings.colorblind);
    if(state.audio.music) state.audio.music.gain.value = save.settings.music * .22;
    if(state.audio.sfx) state.audio.sfx.gain.value = save.settings.sfx * .55;
  }

  function resize(){
    const r = canvas.getBoundingClientRect();
    state.dpr = Math.min(2, window.devicePixelRatio || 1);
    state.W = Math.max(1, Math.floor(r.width));
    state.H = Math.max(1, Math.floor(r.height));
    canvas.width = Math.floor(state.W * state.dpr);
    canvas.height = Math.floor(state.H * state.dpr);
    ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
    buildBins();
  }

  function ensureAudio(){
    if(!state.audio.ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      const ac = new AC();
      state.audio.ctx = ac;
      state.audio.master = ac.createGain();
      state.audio.music = ac.createGain();
      state.audio.sfx = ac.createGain();
      state.audio.music.gain.value = save.settings.music * .22;
      state.audio.sfx.gain.value = save.settings.sfx * .55;
      state.audio.music.connect(state.audio.master);
      state.audio.sfx.connect(state.audio.master);
      state.audio.master.gain.value = 0.33;
      state.audio.master.connect(ac.destination);
    }
    if(state.audio.ctx.state === 'suspended') state.audio.ctx.resume().catch(()=>{});
    return state.audio.ctx;
  }

  function tone(freq, dur=.08, type='sine', gain=.04, dest='sfx', delay=0){
    const ac = ensureAudio(); if(!ac || save.settings.sfx <= 0) return;
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t+.012);
    g.gain.exponentialRampToValueAtTime(.0001, t+dur);
    osc.connect(g); g.connect(dest === 'music' ? state.audio.music : state.audio.sfx);
    osc.start(t); osc.stop(t+dur+.04);
  }

  function noise(dur=.08, gain=.04, filter=900){
    const ac = ensureAudio(); if(!ac || save.settings.sfx <= 0) return;
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate*dur), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i] = (Math.random()*2-1) * (1-i/data.length);
    const src = ac.createBufferSource(); src.buffer = buffer;
    const bp = ac.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=filter;
    const g = ac.createGain(); g.gain.value = gain;
    src.connect(bp); bp.connect(g); g.connect(state.audio.sfx);
    src.start(); src.stop(ac.currentTime+dur);
  }

  function sfx(kind, cat){
    if(kind === 'catch'){
      const tier = state.combo >= 15 ? 4 : state.combo >= 10 ? 3 : state.combo >= 6 ? 2 : state.combo >= 3 ? 1 : 0;
      const sound = CATS[cat]?.sound || 'paper';
      if(sound === 'paper'){ noise(.09,.028,650); tone(420,.04,'triangle',.018); }
      if(sound === 'glass'){ tone(920,.12,'sine',.032); tone(1380,.09,'triangle',.014,.0,.03); }
      if(sound === 'metal'){ tone(250,.12,'square',.03); tone(760,.18,'triangle',.018,.0,.02); }
      if(sound === 'plastic'){ tone(560,.055,'triangle',.032); noise(.04,.018,1300); }
      if(sound === 'organic'){ noise(.10,.028,220); tone(180,.05,'sine',.014); }
      if(sound === 'ewaste'){ tone(740,.05,'square',.024); tone(1110,.04,'triangle',.012,.0,.035); }
      if(sound === 'textiles'){ noise(.11,.026,280); tone(230,.08,'triangle',.014); }
      if(sound === 'hazmat'){ tone(980,.06,'square',.032); tone(540,.08,'sawtooth',.018,.0,.06); }
      for(let i=0;i<tier;i++) tone(660+i*110,.05,'sine',.008,'sfx',.04+i*.025);
    }
    if(kind === 'wrong'){ noise(.16,.06,180); tone(120,.16,'sawtooth',.04); }
    if(kind === 'power'){ tone(420,.07,'triangle',.035); tone(840,.08,'sine',.02,'sfx',.06); }
    if(kind === 'bossHit'){ noise(.10,.05,120); tone(160,.12,'sawtooth',.04); }
    if(kind === 'bossDefeat'){ tone(330,.08); tone(495,.10,'triangle',.03,'sfx',.08); tone(660,.14,'sine',.024,'sfx',.18); }
    if(kind === 'level'){ tone(392,.08); tone(523,.09,'triangle',.03,'sfx',.07); tone(784,.14,'sine',.022,'sfx',.16); }
    if(kind === 'start'){ tone(220,.07); tone(330,.07,'triangle',.026,'sfx',.06); tone(550,.13,'sine',.018,'sfx',.14); }
  }

  function chapterMusic(){
    const c = chapter().theme;
    const profiles = {
      school:{bpm:112,bass:[110,147,165,196],lead:[440,494,587,659,587,494,440,392],wave:'triangle'},
      community:{bpm:118,bass:[98,147,196,220],lead:[392,440,523,587,523,440,392,330],wave:'square'},
      park:{bpm:104,bass:[87,130,174,196],lead:[349,392,440,523,440,392,349,294],wave:'triangle'},
      buyback:{bpm:122,bass:[123,165,196,247],lead:[494,587,659,740,659,587,494,440],wave:'square'},
      mrf:{bpm:128,bass:[82,123,165,196],lead:[330,415,494,622,494,415,330,247],wave:'sawtooth'},
      landfill:{bpm:96,bass:[73,98,110,147],lead:[294,349,392,466,392,349,294,220],wave:'sawtooth'},
      ewaste:{bpm:132,bass:[110,139,185,220],lead:[440,554,659,831,659,554,440,370],wave:'square'},
      core:{bpm:136,bass:[82,123,164,247],lead:[330,415,523,659,784,659,523,415],wave:'sawtooth'}
    };
    return profiles[c] || profiles.school;
  }

  function startMusic(){
    stopMusic();
    if(save.settings.music <= 0) return;
    ensureAudio();
    const p = chapterMusic();
    const interval = Math.max(90, Math.round(60000 / p.bpm / 2));
    state.audio.step = 0;
    state.audio.musicTimer = setInterval(() => {
      if(!state.running || state.paused || save.settings.music <= 0) return;
      const step = state.audio.step++;
      const beat = step % 16;
      const intensity = clamp(state.intensity + state.combo/20, 0, 2);
      if(beat % 4 === 0) tone(p.bass[(beat/4)%p.bass.length], .16, 'sawtooth', .012 + intensity*.004, 'music');
      if(beat % 2 === 1 && intensity > .35) noise(.025, .006*save.settings.music, 2200);
      const lead = p.lead[beat % p.lead.length];
      if(lead && (beat % 2 === 0 || intensity > .8)) tone(lead, .055, p.wave, .006 + intensity*.004, 'music', .02);
      if(intensity > 1.1 && beat % 4 === 2) tone(lead*1.5, .05, 'triangle', .004, 'music', .05);
    }, interval);
  }
  function stopMusic(){ if(state.audio.musicTimer) clearInterval(state.audio.musicTimer); state.audio.musicTimer = null; }

  function professor(text, mood='neutral'){
    ui.professor.textContent = text;
    ui.circuit.src = mood === 'happy' ? 'assets/sprites/circuit-happy.svg' : mood === 'worried' ? 'assets/sprites/circuit-worried.svg' : 'assets/sprites/circuit-neutral.svg';
  }

  function postScore(mode='live'){
    const score = Math.floor(state.score);
    state.best = Math.max(state.best, score);
    safeStorage.setNumber(BEST_KEY, state.best);
    const payload = { type:'GG_SCORE', gameSlug:GAME_SLUG, slug:GAME_SLUG, score, best:state.best, level:state.loop ? 'loop' : state.levelIndex+1, mode };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(score, {gameSlug:GAME_SLUG}); } catch {}
    if(mode !== 'live') { try { window.GG?.submitScore?.(score, {gameSlug:GAME_SLUG}); } catch {}; try { window.GG?.endRound?.(payload); } catch {}; }
    try { window.parent?.postMessage?.(payload, '*'); } catch {}
    try { window.parent?.postMessage?.({...payload, type:'gg:score'}, '*'); } catch {}
  }

  function showOnly(panel){
    ui.overlay.classList.add('active');
    [ui.mapScreen, ui.comicScreen, ui.settingsScreen, ui.badgesScreen].forEach(p => p.hidden = true);
    panel.hidden = false;
  }

  function renderMap(){
    state.running = false; state.paused = true; stopMusic();
    showOnly(ui.mapScreen);
    ui.mapGrid.innerHTML = '';
    const heroStatus = document.getElementById('heroStatusText');
    if(heroStatus) heroStatus.textContent = `Circuit has restored ${Object.keys(save.stars || {}).length}/20 missions. Defeat Grime, heal each hub and save Verdale.`;
    const totalStars = Object.values(save.stars || {}).reduce((a,b)=>a+(Number(b)||0),0);
    state.totalStars = totalStars;
    ui.stars.textContent = totalStars;
    CHAPTERS.forEach((ch, idx) => {
      const unlocked = save.unlockedLevel >= ch.start;
      const completeCount = LEVELS.slice(ch.start, ch.end+1).filter((_,i)=>save.stars[ch.start+i]).length;
      const starCount = LEVELS.slice(ch.start, ch.end+1).reduce((a,_,i)=>a+(Number(save.stars[ch.start+i])||0),0);
      const card = document.createElement('article');
      card.className = 'hub-card ' + (unlocked ? 'unlocked' : 'locked');
      card.style.setProperty('--thumb', `linear-gradient(160deg, rgba(0,0,0,.1), rgba(0,0,0,.74)), url(${ch.bg})`);
      card.innerHTML = `<small>Hub ${idx+1} • ${completeCount}/${ch.end-ch.start+1} missions</small><h3>${ch.name}</h3><div class="stars">${'★'.repeat(starCount).padEnd(9,'☆')}</div><small>Boss: ${ch.boss}</small>`;
      const btn = document.createElement('button');
      btn.textContent = unlocked ? (completeCount ? 'Replay Hub' : 'Start Hub') : 'Locked';
      btn.disabled = !unlocked;
      btn.addEventListener('click', () => startLevel(ch.start));
      card.appendChild(btn);
      ui.mapGrid.appendChild(card);
    });
    ui.loopBtn.textContent = save.loopUnlocked ? 'Loop Mode' : 'Loop Mode Locked';
    ui.loopBtn.disabled = !save.loopUnlocked;
    ui.score.textContent = Math.floor(state.score);
    ui.level.textContent = 'Map';
    ui.lives.textContent = '-';
    ui.combo.textContent = '-';
    ui.progressText.textContent = `Campaign stars: ${totalStars}`;
    ui.progressFill.style.width = `${Math.min(100, totalStars/60*100)}%`;
    professor('Choose an Eco-Hub. Every cleared mission recharges The Loop.', 'neutral');
  }

  function renderBadges(){
    showOnly(ui.badgesScreen);
    ui.badgeGrid.innerHTML = '';
    BADGES.forEach(b => {
      const div = document.createElement('div');
      div.className = 'badge ' + (save.badges[b.id] ? '' : 'locked');
      div.innerHTML = `<strong>${save.badges[b.id] ? '🏅 '+b.name : '🔒 '+b.name}</strong><span>${b.desc}</span>`;
      ui.badgeGrid.appendChild(div);
    });
  }

  function showComicFor(index, onDone){
    const lv = LEVELS[index];
    const ch = CHAPTERS[lv.chapter];
    showOnly(ui.comicScreen);
    ui.comicTitle.textContent = lv.kind === 'boss' || lv.kind === 'finale' ? ch.boss : lv.name;
    const panels = [
      { title:'Verdale Update', text: ch.intro[0] },
      { title:'Professor Loop', text: lv.fact || ch.intro[1] },
      { title: lv.kind === 'boss' || lv.kind === 'finale' ? 'Grime Taunt' : 'Circuit Mission', text: lv.kind === 'boss' || lv.kind === 'finale' ? `${ch.boss} blocks this hub. Sort clean items and tap Grime hazards to drain its health.` : `Target: ${lv.target} correct sorts. Real x-position matters, so line up the item with the selected bin.` }
    ];
    ui.comicPanels.innerHTML = panels.map(p => `<div class="comic-frame"><h3>${p.title}</h3><p>${p.text}</p></div>`).join('');
    ui.comicContinue.onclick = () => { ui.overlay.classList.remove('active'); onDone(); };
  }

  function startLevel(index){
    index = clamp(index,0,LEVELS.length-1);
    state.loop = false;
    state.levelIndex = index;
    state.score = state.score || 0;
    showComicFor(index, () => initLevel(index));
  }

  function startNext(){ startLevel(clamp(save.unlockedLevel, 0, LEVELS.length-1)); }

  function startLoop(){
    if(!save.loopUnlocked) return;
    state.loop = true;
    state.levelIndex = LEVELS.length-1;
    initLevel(state.levelIndex);
    professor('Loop Mode is endless. Difficulty scales until Circuit runs out of lives.', 'happy');
  }

  function checkpointLevel(){ return CHAPTERS[level().chapter].start; }

  function initLevel(index){
    state.running = true; state.paused = false; state.levelIndex = index; state.time = 0; state.lives = 3; state.startLives = 3;
    state.combo = 0; state.maxCombo = 0; state.sorted = 0; state.wrong = 0; state.noHit = true; state.items = []; state.hazards = []; state.particles = [];
    state.spawnTimer = .55; state.bossTimer = 2.4; state.selectedBin = 0; state.power = null; state.powerTime = 0; state.magnetCharges = 0; state.shield = 0;
    state.doubleTime = 0; state.slowTime = 0; state.intensity = 0;
    buildBins();
    const lv = level();
    if(lv.kind === 'boss' || lv.kind === 'finale') state.boss = { hp:lv.bossHp, max:lv.bossHp, phase:1, attack:lv.attack, hurt:0, x:state.W*.68, y:state.H*.22, size:Math.min(185,state.W*.2) };
    else state.boss = null;
    ui.overlay.classList.remove('active');
    ui.bossPanel.hidden = !state.boss;
    if(state.boss){ ui.bossName.textContent = chapter().boss; ui.bossFill.style.width = '100%'; }
    professor(lv.fact, 'neutral');
    startMusic();
    sfx('start');
    updateHUD();
  }

  function rebootCheckpoint(){
    const cp = checkpointLevel();
    state.score = Math.max(0, state.score - 300);
    professor('Circuit reboots at the current hub checkpoint. The campaign progress is safe.', 'worried');
    showComicFor(cp, () => initLevel(cp));
  }

  function bottomSafeZone(){
    // Keeps the player bins above the platform/footer controls and any mobile safe area.
    // The value scales with the canvas, so large desktop screens no longer draw bins
    // below the visible play area, while small screens still keep enough room to play.
    const W = state.W || 0;
    const H = state.H || 0;
    const desktopReserve = W >= 1000 ? 96 : W >= 760 ? 78 : 58;
    const heightReserve = H * (W >= 900 ? 0.115 : 0.10);
    return Math.round(clamp(Math.max(desktopReserve, heightReserve), 46, Math.max(50, H * 0.22)));
  }

  function playAreaBottom(){
    return Math.max(180, state.H - bottomSafeZone());
  }

  function buildBins(){
    if(!state.running && !state.loop) return;
    const cats = level().cats;
    const W = state.W, H = state.H;
    const margin = Math.max(10, W*.02);
    const gap = Math.max(5, Math.min(12, W*.012));
    const usable = W - margin*2 - gap*(cats.length-1);
    const bw = Math.max(54, usable / cats.length);
    const bh = Math.max(68, Math.min(105, H*.14));
    const bottomLimit = playAreaBottom();
    const y = clamp(bottomLimit - bh - 12, H*.56, H - bh - 12);
    state.bins = cats.map((cat,i) => ({ cat, x:margin+i*(bw+gap), y, w:bw, h:bh, fill:0, lid:0 }));
    state.selectedBin = clamp(state.selectedBin,0,state.bins.length-1);
  }

  function itemSize(){ return level().precision ? 42 : 50; }
  function catchLine(){
    if(state.bins && state.bins.length) return Math.max(90, state.bins[0].y - 12);
    return playAreaBottom() - Math.max(90, state.H*.16);
  }
  function effectiveTarget(){ return state.loop ? Infinity : level().target; }
  function progress(){
    const sortProgress = clamp(state.sorted / Math.max(1, level().target), 0, 1);
    if(state.boss) return (sortProgress + (1 - state.boss.hp/state.boss.max)) / 2;
    return sortProgress;
  }

  function binAtX(x){ return state.bins.findIndex(b => x >= b.x && x <= b.x+b.w); }
  function correctBinFor(cat){ return state.bins.findIndex(b => b.cat === cat); }

  function spawnItem(forcePower=false){
    const lv = level();
    const cats = lv.cats;
    const s = itemSize();
    const isPower = forcePower || (lv.power && Math.random() < .085 && !state.loop);
    const isGrime = !isPower && Math.random() < (lv.hazardDense ? .14 : lv.kind === 'boss' || lv.kind === 'finale' ? .12 : .075);
    const cat = isPower ? null : isGrime ? 'grime' : choose(cats);
    const binIndex = cat && cat !== 'grime' ? correctBinFor(cat) : Math.floor(rand(0,state.bins.length));
    const bin = state.bins[clamp(binIndex,0,state.bins.length-1)] || state.bins[0];
    let x = bin.x + bin.w*.5 - s*.5 + rand(-bin.w*.28, bin.w*.28);
    if(lv.edge && Math.random() < .36) x = Math.random() < .5 ? -s-20 : state.W + 20;
    const speedScale = state.loop ? 1 + Math.min(1.7, state.time/90) : 1;
    const baseV = (lv.speed + rand(-12,24)) * speedScale;
    let vx = rand(-22,22) + (lv.wind || 0) * rand(-1,1);
    if(lv.edge) vx += x < 0 ? rand(85,150) : rand(-150,-85);
    if(state.magnetCharges > 0 && cat && cat !== 'grime'){
      const cb = state.bins[correctBinFor(cat)];
      if(cb){ x = cb.x + cb.w*.5 - s*.5; state.selectedBin = correctBinFor(cat); }
      state.magnetCharges--;
    }
    if(isPower){
      const power = choose(Object.keys(POWERS));
      state.items.push({ kind:'power', power, x, y:-s-30, w:s, h:s, vx, vy:baseV*.84, spin:0, age:0 });
    } else if(isGrime){
      state.items.push({ kind:'grime', cat:'grime', x, y:-s-30, w:s*1.1, h:s*1.1, vx:vx*.7, vy:baseV*.9, spin:0, age:0, tapped:false });
    } else {
      state.items.push({ kind:'item', cat, x, y:-s-30, w:s, h:s, vx, vy:baseV, spin:0, age:0 });
    }
  }

  function spawnBossHazards(){
    const lv = level();
    const count = lv.attack === 'storm' ? 6 : lv.attack === 'final' ? 8 : lv.attack === 'phase' ? 7 : 4;
    for(let i=0;i<count;i++){
      const s = rand(42,62);
      state.hazards.push({ x:rand(30,state.W-s-30), y:rand(70,state.H*.52), w:s, h:s, life:5.5, vx:rand(-40,40), vy:rand(25,80), split:lv.attack === 'split', damage: lv.attack === 'final' ? 16 : 12, age:0 });
    }
    professor(level().attack === 'storm' ? 'Static wave! Tap the Grime swarm before it reaches the bins.' : 'Boss attack! Clear the Grime hazards to protect The Loop.', 'worried');
  }

  function nextBin(dir){
    if(!state.running || state.paused) return;
    state.selectedBin = (state.selectedBin + dir + state.bins.length) % state.bins.length;
    addParticles(state.bins[state.selectedBin].x+state.bins[state.selectedBin].w/2, state.bins[state.selectedBin].y, CATS[state.bins[state.selectedBin].cat].color, 8);
  }

  function usePower(){
    if(!state.running || state.paused || !state.power) return;
    const p = state.power;
    state.power = null;
    sfx('power');
    if(p === 'magnet'){ state.magnetCharges += 6; professor('Magnet active: I will pull the next items toward their correct bins.', 'happy'); }
    if(p === 'slow'){ state.slowTime = 8; professor('Slow-Mo active: use this window to rebuild your combo.', 'happy'); }
    if(p === 'shield'){ state.shield += 1; professor('Shield active: the next bad sort is absorbed.', 'happy'); }
    if(p === 'double'){ state.doubleTime = 8; professor('Double Points active: keep the combo alive!', 'happy'); }
    updateHUD();
  }

  function handleCatch(item){
    const cx = item.x + item.w/2;
    const physicalBin = binAtX(cx);
    const selected = state.bins[state.selectedBin];
    const selectedMatchesPosition = physicalBin === state.selectedBin;
    if(item.kind === 'power'){
      if(selectedMatchesPosition){ activatePower(item.power); removeItem(item); return; }
      badSort('Power-up missed the selected bin.'); removeItem(item); return;
    }
    if(item.kind === 'grime'){
      badSort('Grime reached the bins. Tap it earlier during rush waves.'); removeItem(item); return;
    }
    const correct = selectedMatchesPosition && selected && selected.cat === item.cat;
    if(correct){
      state.sorted++; state.combo++; state.maxCombo = Math.max(state.maxCombo, state.combo); state.intensity = clamp(state.intensity + .08,0,1.4);
      const mult = state.doubleTime > 0 ? 2 : 1;
      const comboBonus = Math.min(15, state.combo) * 8;
      state.score += (100 + comboBonus) * mult;
      save.categoryCounts[item.cat] = (save.categoryCounts[item.cat] || 0) + 1;
      if(save.categoryCounts.glass >= 30) unlockBadge('glass');
      if(state.maxCombo >= 15) unlockBadge('combo15');
      selected.lid = .22; selected.fill = clamp(state.sorted / Math.max(1, level().target), 0, 1);
      addParticles(cx, item.y, CATS[item.cat].color, 18 + Math.min(14,state.combo));
      sfx('catch', item.cat);
      if(state.combo === 3 || state.combo === 6 || state.combo === 10 || state.combo === 15) professor(`Combo tier ${state.combo}! The Loop is adding brighter harmony.`, 'happy');
      else if(state.sorted % 6 === 0) professor(choose(FACTS[item.cat] || [level().fact]), 'neutral');
      if(state.boss) damageBoss(6 + Math.floor(state.combo/5), cx, item.y);
    } else {
      const should = physicalBin >= 0 ? CATS[state.bins[physicalBin].cat].label : 'no bin';
      const got = selected ? CATS[selected.cat].label : 'none';
      badSort(`Real hit check failed: item landed over ${should}, but selected bin was ${got}.`);
    }
    removeItem(item);
    checkClear();
  }

  function activatePower(power){
    state.power = power;
    state.score += 75;
    professor(`${POWERS[power].label} collected. Press Space or Use Power when ready.`, 'happy');
    sfx('power');
  }

  function removeItem(item){
    const idx = state.items.indexOf(item);
    if(idx >= 0) state.items.splice(idx,1);
  }

  function badSort(msg){
    if(state.shield > 0){ state.shield--; professor('Shield absorbed the mistake. Keep sorting!', 'happy'); sfx('power'); return; }
    state.wrong++; state.noHit = false; state.combo = 0; state.intensity = Math.max(0,state.intensity-.35);
    state.lives--;
    addSludgePuddle();
    sfx('wrong');
    professor(msg, 'worried');
    if(state.lives <= 0){
      state.running = false; state.paused = true; stopMusic(); postScore('game_over');
      setTimeout(rebootCheckpoint, 650);
    }
  }

  function addSludgePuddle(){
    state.particles.push({ type:'puddle', x:rand(40,state.W-140), y:state.H-rand(130,190), r:80, age:0, life:1.4, color:'rgba(70,255,110,.35)' });
  }

  function damageBoss(amount,x,y){
    if(!state.boss) return;
    state.boss.hp = Math.max(0, state.boss.hp - amount);
    state.boss.hurt = .18;
    addParticles(x || state.boss.x, y || state.boss.y, chapter().color, 20);
    sfx('bossHit');
    if(state.boss.hp <= 0){
      state.score += 800;
      save.bossKills = (save.bossKills || 0) + 1;
      if(save.bossKills >= 3) unlockBadge('boss');
      professor(`${chapter().boss} is defeated. The hub is ready to heal!`, 'happy');
      sfx('bossDefeat');
      checkClear(true);
    }
  }

  function checkClear(force=false){
    if(state.loop) return;
    const lv = level();
    const enough = state.sorted >= lv.target;
    const bossOk = !state.boss || state.boss.hp <= 0;
    if(force || (enough && bossOk)) completeLevel();
  }

  function starRating(){
    let stars = 1;
    if(state.noHit || state.lives >= 3) stars++;
    if(state.maxCombo >= Math.min(15, Math.floor(level().target*.55)) || state.wrong === 0) stars++;
    return clamp(stars,1,3);
  }

  function completeLevel(){
    state.running = false; state.paused = true; stopMusic();
    const stars = starRating();
    save.stars[state.levelIndex] = Math.max(Number(save.stars[state.levelIndex]||0), stars);
    save.unlockedLevel = Math.max(save.unlockedLevel, state.levelIndex + 1);
    if(state.noHit) unlockBadge('nohit');
    if(level().chapter === 5 && level().name.includes('Hazmat')) unlockBadge('hazmat');
    const totalStars = Object.values(save.stars).reduce((a,b)=>a+Number(b||0),0);
    if(totalStars >= 30) unlockBadge('allstars');
    if(state.levelIndex >= LEVELS.length-1){ save.loopUnlocked = true; unlockBadge('loop'); }
    persist();
    state.score += stars * 250 + state.lives * 120;
    postScore(state.levelIndex >= LEVELS.length-1 ? 'game_won' : 'level_clear');
    sfx('level');
    const next = state.levelIndex + 1;
    if(next >= LEVELS.length){
      professor('Verdale is restored. Loop Mode is now unlocked!', 'happy');
      renderMap();
    } else {
      const nextChapter = LEVELS[next].chapter !== level().chapter;
      professor(`Mission clear: ${stars} star${stars>1?'s':''}. ${nextChapter ? 'A new Eco-Hub unlocked.' : 'The hub needs one more push.'}`, 'happy');
      showComicFor(next, () => initLevel(next));
    }
  }

  function update(dt){
    if(!state.running || state.paused) return;
    dt = Math.min(.05, dt);
    const lv = level();
    state.time += dt;
    state.doubleTime = Math.max(0, state.doubleTime - dt);
    state.slowTime = Math.max(0, state.slowTime - dt);
    const slowFactor = state.slowTime > 0 ? .48 : 1;
    state.spawnTimer -= dt / slowFactor;
    if(state.spawnTimer <= 0){
      spawnItem();
      const loopBoost = state.loop ? Math.min(.22, state.time/420) : 0;
      state.spawnTimer = Math.max(.24, lv.spawn - loopBoost + rand(-.08,.08));
    }
    if(lv.power && Math.random() < dt*.035 && !state.power) spawnItem(true);
    if(state.boss){
      state.bossTimer -= dt;
      if(state.bossTimer <= 0){ spawnBossHazards(); state.bossTimer = Math.max(1.7, 4.6 - level().chapter*.28 - (1-state.boss.hp/state.boss.max)*1.4); }
      state.boss.phase = state.boss.hp < state.boss.max*.33 ? 3 : state.boss.hp < state.boss.max*.66 ? 2 : 1;
      state.boss.hurt = Math.max(0, state.boss.hurt-dt);
    }
    for(let i=state.items.length-1;i>=0;i--){
      const it = state.items[i];
      it.age += dt; it.spin += dt;
      const wind = (lv.wind||0) * Math.sin(state.time*1.7 + it.age*.4);
      it.vx += wind * dt * .08;
      it.x += it.vx * dt * slowFactor;
      it.y += it.vy * dt * slowFactor;
      if(it.x < -120 || it.x > state.W+120) it.vx *= -.65;
      if(it.y + it.h >= catchLine()) handleCatch(it);
    }
    for(let i=state.hazards.length-1;i>=0;i--){
      const h = state.hazards[i];
      h.age += dt; h.life -= dt; h.x += h.vx*dt; h.y += h.vy*dt;
      if(h.y > catchLine()+20){ state.hazards.splice(i,1); badSort('A Grime hazard reached the sort line.'); continue; }
      if(h.life <= 0) state.hazards.splice(i,1);
    }
    for(let i=state.particles.length-1;i>=0;i--){
      const p = state.particles[i]; p.age += dt;
      if(p.type === 'spark'){ p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 150*dt; }
      if(p.age >= p.life) state.particles.splice(i,1);
    }
    if(state.loop){
      state.score += dt * (4 + state.combo*.6);
      if(state.sorted && state.sorted % 35 === 0 && state.sorted !== state.lastLoopMilestone){ state.lastLoopMilestone = state.sorted; state.lives++; professor('Loop Mode bonus life earned.', 'happy'); }
    }
    state.intensity = clamp(state.intensity - dt*.025,0,1.6);
    updateHUD();
  }

  function addParticles(x,y,color,count=16){
    if(save.settings.reducedMotion) count = Math.min(6,count);
    for(let i=0;i<count;i++){
      const a = rand(0,Math.PI*2), sp = rand(40,210);
      state.particles.push({ type:'spark', x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, r:rand(2,5), age:0, life:rand(.35,.85), color });
    }
  }

  function drawImage(src,x,y,w,h,alpha=1,rot=0){
    const im = img(src);
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x+w/2,y+h/2); ctx.rotate(rot);
    if(im) ctx.drawImage(im,-w/2,-h/2,w,h); else { ctx.fillStyle='#4bdcff'; ctx.fillRect(-w/2,-h/2,w,h); }
    ctx.restore();
  }

  function drawCover(src, grimeAlpha){
    const W = state.W, H = state.H; const im = img(src) || img(THUMBNAIL_SRC);
    ctx.save();
    const gray = Math.round(grimeAlpha*90);
    ctx.filter = `grayscale(${gray}%) brightness(${1 - grimeAlpha*.32}) saturate(${1.15 - grimeAlpha*.45})`;
    if(im){
      const r = Math.max(W/im.naturalWidth, H/im.naturalHeight);
      const dw = im.naturalWidth*r, dh = im.naturalHeight*r;
      ctx.drawImage(im,(W-dw)/2,(H-dh)/2,dw,dh);
    } else {
      const g = ctx.createLinearGradient(0,0,W,H); g.addColorStop(0,'#052235'); g.addColorStop(1,'#0b0f2a'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    }
    ctx.restore();
  }

  function drawParallax(){
    const W=state.W,H=state.H, lv=level(), ch=chapter();
    ctx.save();
    ctx.globalAlpha = .55;
    for(let i=0;i<18;i++){
      const x = (i*97 + state.time*(12+i%3*6)) % (W+140) - 70;
      const y = 40 + (i*43 % Math.floor(H*.55));
      if(ch.theme === 'park'){
        ctx.fillStyle = i%2 ? 'rgba(83,255,179,.42)' : 'rgba(255,216,107,.34)';
        ctx.beginPath(); ctx.ellipse(x,y,10,4,Math.sin(state.time+i)*2,0,Math.PI*2); ctx.fill();
      } else if(ch.theme === 'ewaste' || ch.theme === 'mrf'){
        ctx.strokeStyle = i%2 ? 'rgba(75,220,255,.34)' : 'rgba(255,95,159,.28)'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+35,y+Math.sin(state.time+i)*12); ctx.stroke();
      } else {
        ctx.fillStyle = ch.color + '55';
        ctx.beginPath(); ctx.arc(x,y,2+(i%4),0,Math.PI*2); ctx.fill();
      }
    }
    if(lv.wind){
      ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.lineWidth=2;
      for(let i=0;i<6;i++){ const y=120+i*52+Math.sin(state.time+i)*16; ctx.beginPath(); ctx.moveTo(40,y); ctx.bezierCurveTo(W*.3,y-30,W*.55,y+30,W-80,y); ctx.stroke(); }
    }
    ctx.restore();
  }


  function drawVerdaleEnergy(progressValue, grimeAlpha){
    const W = state.W, H = state.H;
    ctx.save();

    // Thumbnail-inspired sorting trails: Circuit sends items toward the bins
    // while Verdale heals from green/cyan light and Grime recedes.
    const centerX = W * 0.50;
    const centerY = H * 0.54;
    const trailCount = save.settings.reducedMotion ? 2 : 5;
    for(let i=0;i<trailCount;i++){
      const t = (state.time * (0.45 + i*.06) + i*.18) % 1;
      const x = W * (0.18 + t * 0.68);
      const y = centerY + Math.sin(t*Math.PI*2 + i) * H*.075;
      const hue = i % 3 === 0 ? '#53ffb3' : i % 3 === 1 ? '#4bdcff' : '#ffd86b';
      const g = ctx.createLinearGradient(centerX,centerY,x,y);
      g.addColorStop(0,'rgba(75,220,255,0)');
      g.addColorStop(.32,hue+'55');
      g.addColorStop(1,hue+'00');
      ctx.strokeStyle = g;
      ctx.lineWidth = 8 - i;
      ctx.beginPath();
      ctx.moveTo(centerX,centerY);
      ctx.quadraticCurveTo(W*.48, H*(.24+i*.055), x, y);
      ctx.stroke();

      ctx.globalAlpha = .55;
      ctx.fillStyle = hue;
      ctx.beginPath();
      ctx.arc(x,y,Math.max(2,7-i),0,Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Small recycle-loop badge in the playfield.
    const r = Math.min(W,H)*.055;
    const bx = 26 + r, by = 26 + r;
    ctx.strokeStyle = 'rgba(83,255,179,.55)';
    ctx.lineWidth = Math.max(3,r*.13);
    ctx.beginPath();
    ctx.arc(bx,by,r,Math.PI*.18,Math.PI*1.55);
    ctx.stroke();
    ctx.fillStyle = 'rgba(83,255,179,.7)';
    ctx.beginPath();
    ctx.moveTo(bx + r*.15, by - r*1.12);
    ctx.lineTo(bx + r*.92, by - r*.62);
    ctx.lineTo(bx + r*.25, by - r*.36);
    ctx.closePath();
    ctx.fill();

    // Progress-based healing glow.
    const heal = clamp(progressValue,0,1);
    const glow = ctx.createRadialGradient(W*.28,H*.75,0,W*.28,H*.75,Math.max(W,H)*.72);
    glow.addColorStop(0,`rgba(83,255,179,${0.08 + heal*.16})`);
    glow.addColorStop(.42,`rgba(75,220,255,${0.04 + heal*.10})`);
    glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0,0,W,H);

    // Grime side shadow pulled from the thumbnail's villain area.
    const grime = clamp(grimeAlpha,0,1);
    const sludge = ctx.createRadialGradient(W*.86,H*.28,0,W*.86,H*.28,W*.48);
    sludge.addColorStop(0,`rgba(20,7,24,${0.36*grime})`);
    sludge.addColorStop(.42,`rgba(62,30,78,${0.22*grime})`);
    sludge.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle = sludge;
    ctx.fillRect(0,0,W,H);

    ctx.restore();
  }

  function drawVerdaleWatermark(){
    const W = state.W, H = state.H;
    if(W < 620 || H < 390) return;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `900 ${Math.max(16, Math.min(30, W*.018))}px system-ui`;
    ctx.shadowColor = 'rgba(83,255,179,.65)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = 'rgba(235,255,240,.85)';
    ctx.fillText(BRAND_TAGLINE, W*.5, H - bottomSafeZone() - 22);
    ctx.restore();
  }

  function drawGrimeOverlay(alpha){
    if(alpha <= .02) return;
    const W=state.W,H=state.H;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle='rgba(7,11,15,.42)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(56,120,57,.44)';
    for(let i=0;i<9;i++){
      const x = (i%2?W-80:80) + Math.sin(state.time*.6+i)*50;
      const y = 70 + i*(H/8.5);
      ctx.beginPath(); ctx.ellipse(x,y,rand(35,90),rand(24,66),Math.sin(i),0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawBins(){
    const target = Math.max(1, level().target);
    for(let i=0;i<state.bins.length;i++){
      const b=state.bins[i], cat=CATS[b.cat];
      b.lid = Math.max(0,b.lid-.02);
      const selected = i === state.selectedBin;
      ctx.save();
      ctx.shadowColor = selected ? cat.color : 'transparent'; ctx.shadowBlur = selected ? 22 : 0;
      ctx.fillStyle='rgba(3,10,20,.86)'; ctx.strokeStyle=selected ? cat.color : 'rgba(255,255,255,.18)'; ctx.lineWidth=selected?4:2;
      roundRect(b.x,b.y,b.w,b.h,16,true,true);
      ctx.fillStyle=cat.color; ctx.globalAlpha=.18; ctx.fillRect(b.x+8,b.y+b.h-12-(b.h-24)*clamp(state.sorted/target,0,1),b.w-16,(b.h-24)*clamp(state.sorted/target,0,1)); ctx.globalAlpha=1;
      const lidLift = b.lid>0 ? -14 : 0;
      ctx.fillStyle=cat.color; roundRect(b.x+8,b.y-10+lidLift,b.w-16,14,7,true,false);
      drawImage(cat.icon,b.x+b.w/2-18,b.y+16,36,36,1);
      ctx.fillStyle='#f4ffff'; ctx.font='900 12px system-ui'; ctx.textAlign='center'; ctx.fillText(cat.label,b.x+b.w/2,b.y+b.h-18);
      if(selected){ ctx.fillStyle=cat.color; ctx.font='900 13px system-ui'; ctx.fillText('SELECTED', b.x+b.w/2, b.y-18); }
      ctx.restore();
    }
  }

  function drawItems(){
    for(const it of state.items){
      const bob = Math.sin(it.age*8)*2;
      if(it.kind === 'item') drawImage(CATS[it.cat].icon,it.x,it.y+bob,it.w,it.h,1,Math.sin(it.spin)*.08);
      if(it.kind === 'power') drawImage(POWERS[it.power].icon,it.x,it.y+bob,it.w,it.h,1,Math.sin(it.spin)*.12);
      if(it.kind === 'grime') drawImage('assets/sprites/grime-blob.svg',it.x,it.y+bob,it.w,it.h,1,Math.sin(it.spin)*.08);
    }
    for(const h of state.hazards) drawImage('assets/sprites/grime-blob.svg',h.x,h.y,h.w,h.h,.92 + Math.sin(h.age*8)*.08,Math.sin(h.age*2)*.12);
  }

  function drawBoss(){
    if(!state.boss) return;
    const b=state.boss, icon=chapter().bossIcon;
    const pulse = Math.sin(state.time*3)*6 + (b.hurt>0?14:0);
    drawImage(icon,b.x-b.size/2-pulse/2,b.y-pulse/2,b.size+pulse,b.size+pulse,1,Math.sin(state.time)*.04);
    ctx.save(); ctx.fillStyle='rgba(255,255,255,.9)'; ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillText(chapter().boss,b.x,b.y+b.size*.62); ctx.restore();
  }

  function drawParticles(){
    for(const p of state.particles){
      const a = 1 - p.age/p.life;
      ctx.save(); ctx.globalAlpha = Math.max(0,a);
      if(p.type === 'puddle'){
        ctx.fillStyle=p.color; ctx.beginPath(); ctx.ellipse(p.x,p.y,p.r,p.r*.28,0,0,Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawCatchLine(){
    const y = catchLine();
    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,.18)'; ctx.setLineDash([10,12]); ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(state.W,y); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle='rgba(255,255,255,.55)'; ctx.font='800 12px system-ui'; ctx.textAlign='right'; ctx.fillText('REAL X-POSITION SORT LINE',state.W-14,y-8);
    ctx.restore();
  }

  function roundRect(x,y,w,h,r,fill,stroke){
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
    if(fill) ctx.fill(); if(stroke) ctx.stroke();
  }

  function draw(){
    const lv = level();
    const prog = progress();
    const grime = state.running ? 1 - prog : .35;
    drawCover(chapter().bg, grime);
    drawVerdaleEnergy(prog, grime);
    drawParallax();
    drawGrimeOverlay(grime*.62);
    if(lv.attack === 'storm' && state.boss && state.boss.phase >= 2 && !save.settings.reducedMotion){
      ctx.save(); ctx.globalAlpha=.08 + Math.sin(state.time*40)*.04; ctx.fillStyle='#fff'; ctx.fillRect(0,0,state.W,state.H); ctx.restore();
    }
    drawCatchLine();
    drawBoss();
    drawItems();
    drawParticles();
    drawBins();
    drawVerdaleWatermark();
    if(!state.running && !ui.overlay.classList.contains('active')){
      ctx.save(); ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(0,0,state.W,state.H); ctx.restore();
    }
  }

  function updateHUD(){
    const lv=level();
    ui.score.textContent=Math.floor(state.score);
    ui.level.textContent=state.loop ? 'Loop' : `${state.levelIndex+1}/20`;
    ui.lives.textContent=state.lives;
    ui.combo.textContent=state.combo;
    ui.stars.textContent=Object.values(save.stars||{}).reduce((a,b)=>a+Number(b||0),0);
    ui.objective.textContent = state.loop ? `Loop Mode: endless sorting • ${state.sorted} clean sorts` : `${lv.name}: ${state.sorted}/${lv.target} clean sorts${state.boss ? ' • Defeat '+chapter().boss : ''}`;
    const p = progress();
    ui.progressFill.style.width = `${Math.round(p*100)}%`;
    ui.progressText.textContent = state.loop ? `Loop clean stream: ${state.sorted} sorts` : `Hub healing: ${Math.round(p*100)}% • ${lv.cats.map(c=>CATS[c].label).join(' / ')}`;
    ui.powerSlot.textContent = `Power: ${state.power ? POWERS[state.power].label : state.shield>0 ? 'Shield Ready' : state.slowTime>0 ? 'Slow-Mo Active' : state.doubleTime>0 ? 'Double Points Active' : state.magnetCharges>0 ? `Magnet ${state.magnetCharges}` : 'None'}`;
    if(state.boss){ ui.bossPanel.hidden = false; ui.bossFill.style.width = `${clamp(state.boss.hp/state.boss.max*100,0,100)}%`; }
    else ui.bossPanel.hidden = true;
    postScore('live');
  }

  function pointerPos(e){
    const rect = canvas.getBoundingClientRect();
    const p = e.touches && e.touches[0] ? e.touches[0] : e;
    return { x:(p.clientX-rect.left)*state.W/rect.width, y:(p.clientY-rect.top)*state.H/rect.height };
  }

  function hit(x,y,o){ return x>=o.x && x<=o.x+o.w && y>=o.y && y<=o.y+o.h; }

  function handlePointer(e){
    if(!state.running || state.paused) return;
    ensureAudio();
    const p = pointerPos(e);
    for(let i=state.hazards.length-1;i>=0;i--){
      const h=state.hazards[i];
      if(hit(p.x,p.y,h)){
        state.hazards.splice(i,1);
        state.score += 90;
        damageBoss(h.damage || 12, h.x+h.w/2,h.y+h.h/2);
        if(h.split){
          for(let k=0;k<2;k++) state.hazards.push({x:h.x+rand(-20,30),y:h.y+rand(-18,18),w:h.w*.58,h:h.h*.58,life:3.8,vx:rand(-50,50),vy:rand(35,85),split:false,damage:7,age:0});
        }
        return;
      }
    }
    for(let i=0;i<state.bins.length;i++) if(hit(p.x,p.y,state.bins[i])) { state.selectedBin=i; addParticles(p.x,p.y,CATS[state.bins[i].cat].color,7); return; }
  }

  function loop(ts){
    const now = ts || performance.now();
    const dt = Math.min(.05, (now - (loop.last || now))/1000); loop.last = now;
    update(dt); draw(); requestAnimationFrame(loop);
  }

  function initEvents(){
    window.addEventListener('resize', resize);
    document.addEventListener('keydown', e => {
      const k=e.key.toLowerCase();
      if(k==='arrowleft'||k==='a') nextBin(-1);
      if(k==='arrowright'||k==='d') nextBin(1);
      if(k===' '||k==='e') { e.preventDefault(); usePower(); }
      if(k==='p') togglePause();
      if(k>='1' && k<='8' && state.bins[Number(k)-1]) state.selectedBin = Number(k)-1;
    });
    ui.leftBtn.addEventListener('click',()=>{ensureAudio();nextBin(-1);});
    ui.rightBtn.addEventListener('click',()=>{ensureAudio();nextBin(1);});
    ui.powerBtn.addEventListener('click',()=>{ensureAudio();usePower();});
    ui.pauseBtn.addEventListener('click',togglePause);
    ui.restartBtn.addEventListener('click',renderMap);
    ui.muteBtn.addEventListener('click',()=>{ save.settings.music = save.settings.music > 0 ? 0 : .45; persist(); applySettings(); ui.muteBtn.textContent = save.settings.music>0?'Sound':'Muted'; if(save.settings.music>0 && state.running && !state.paused) startMusic(); else stopMusic(); });
    ui.startNext.addEventListener('click',startNext);
    ui.loopBtn.addEventListener('click',startLoop);
    ui.settingsBtn.addEventListener('click',()=>showOnly(ui.settingsScreen));
    ui.badgesBtn.addEventListener('click',renderBadges);
    const restartCampaignBtn = document.getElementById('restartCampaignBtn');
    if(restartCampaignBtn) restartCampaignBtn.addEventListener('click',()=>{
      if(confirm('Restart the Recycle Rush 2.0 campaign from Level 1? This keeps settings but clears stars and badges.')){
        save.unlockedLevel=0; save.stars={}; save.badges={}; save.categoryCounts={}; save.bossKills=0; save.loopUnlocked=false; persist(); state.score=0; renderMap();
      }
    });
    document.querySelectorAll('.backToMap').forEach(btn=>btn.addEventListener('click',renderMap));
    ui.musicVolume.addEventListener('input',()=>{ save.settings.music = Number(ui.musicVolume.value); persist(); applySettings(); if(save.settings.music>0 && state.running && !state.paused) startMusic(); else stopMusic(); });
    ui.sfxVolume.addEventListener('input',()=>{ save.settings.sfx = Number(ui.sfxVolume.value); persist(); applySettings(); });
    ui.reducedMotion.addEventListener('change',()=>{ save.settings.reducedMotion = ui.reducedMotion.checked; persist(); applySettings(); });
    ui.colorblindMode.addEventListener('change',()=>{ save.settings.colorblind = ui.colorblindMode.checked; persist(); applySettings(); });
    canvas.addEventListener('pointerdown',handlePointer,{passive:true});
  }

  function togglePause(){
    if(!state.running) return;
    state.paused = !state.paused;
    if(state.paused){ stopMusic(); professor('Paused. The Loop will wait for Circuit.', 'neutral'); }
    else { startMusic(); professor(level().fact, 'neutral'); }
  }

  loadAssets().then(() => {
    applySettings(); initEvents(); resize(); renderMap(); requestAnimationFrame(loop);
  });
})();
