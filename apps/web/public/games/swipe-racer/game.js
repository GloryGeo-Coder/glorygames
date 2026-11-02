(() => {
  'use strict';

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!canvas || !ctx) return;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  const $ = (id) => document.getElementById(id);
  const elDistance = $('distance');
  const elScore = $('score');
  const elLives = $('lives');
  const elBest = $('best');
  const elBoostFill = $('boostFill');
  const elBoostLabel = $('boostLabel');
  const elLevelProgressFill = $('levelProgressFill');
  const elLevelProgressLabel = $('levelProgressLabel');
  const elMissionText = $('missionText');
  const elMissionProgress = $('missionProgress');
  const elTitle = $('ggTitle');
  const elSub = $('ggSub');
  const elLevelBadge = $('levelBadge');
  const panel = $('panel');
  const panelTitle = $('panelTitle');
  const panelText = $('panelText');
  const btnStart = $('btnStart');
  const btnInfo = $('btnInfo');
  const btnPause = $('btnPause');
  const btnBoost = $('btnBoost');
  const btnSubmit = $('btnSubmit');
  const btnRestart = $('btnRestart');
  const btnMute = $('btnMute');
  const eventPicker = $('eventPicker');
  const eventSelect = $('eventSelect');

  const GAME_SLUG = 'swipe-racer';
  const BEST_KEY = 'wga_swipe_racer_best_v2';
  let META = { title: 'Swipe Racer', description: '' };
  const PROGRESS_KEY = 'wga_swipe_racer_horizon_v1';
  let best = 0;
  try { best = Number(localStorage.getItem(BEST_KEY) || '0') || 0; } catch {}

  async function loadMeta() {
    try {
      const res = await fetch('./game.json', { cache: 'no-store' });
      META = await res.json();
      document.title = META.title || 'Swipe Racer';
      if (elTitle) elTitle.textContent = META.title || 'Swipe Racer';
      if (elSub) elSub.textContent = 'Swipe to steer • Tap or press Boost to use nitro';
      try { window.GG?.init?.({ title: META.title || 'Swipe Racer' }); } catch {}
      try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    } catch {}
  }
  loadMeta();

  let DPR = 1, CW = 360, CH = 640;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    CW = Math.max(1, Math.floor(rect.width || window.innerWidth));
    CH = Math.max(1, Math.floor(rect.height || window.innerHeight));
    canvas.width = Math.floor(CW * DPR);
    canvas.height = Math.floor(CH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const scale = Math.min(1, CW / 420, CH / 520);
    player.w = 76 * scale; player.h = 142 * scale;
    player.y = playerY();
    const limit = roadWidthAt(player.y) * 0.5 - player.w * 0.33;
    player.x = clamp(player.x || roadCenter(), roadCenter() - limit, roadCenter() + limit);
    player.targetX = clamp(player.targetX || player.x, roadCenter() - limit, roadCenter() + limit);
  }
  requestAnimationFrame(() => {
    resize();
    window.addEventListener('resize', resize, { passive: true });
  });

  const images = {};
  const assetPaths = {
    bgCity: './assets/backgrounds/bg-city-day.png',
    cityHorizon: './assets/backgrounds/city-horizon-v2.webp',
    bgMountain: './assets/backgrounds/bg-mountain-pass.png',
    bgCoast: './assets/backgrounds/bg-coast-sunset.png',
    bgNeon: './assets/backgrounds/bg-neon-night.png',
    bgHarbour: './assets/backgrounds/horizon-harbour.webp',
    bgDesert: './assets/backgrounds/horizon-desert.webp',
    bgSnow: './assets/backgrounds/horizon-snow.webp',
    player: './assets/sprites/player-car-blue.png',
    racerV2: './assets/sprites/racer-blue-v2.webp',
    truckV2: './assets/sprites/truck-city-v2.webp',
    red: './assets/sprites/traffic-red.png',
    yellow: './assets/sprites/traffic-yellow.png',
    green: './assets/sprites/traffic-green.png',
    truck: './assets/sprites/truck-orange.png',
    boost: './assets/sprites/pickup-boost.png',
    repair: './assets/sprites/pickup-repair.png'
  };
  function loadImage(key, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { images[key] = img; resolve(); };
      img.onerror = () => { images[key] = null; resolve(); };
      img.src = src;
    });
  }
  Promise.all(Object.entries(assetPaths).map(([k, v]) => loadImage(k, v)));

  // Audio
  let AC = null, master = null, musicTimer = null, musicStep = 0, muted = false;
  function ensureAudio() {
    if (muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC) {
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = 0.13;
      master.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume().catch(() => {});
    return AC;
  }
  function tone(freq, dur = 0.08, type = 'sine', gain = 0.05, delay = 0) {
    const ac = ensureAudio(); if (!ac || muted) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator(); const g = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master || ac.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }
  function noise(dur = 0.12, gain = 0.05) {
    const ac = ensureAudio(); if (!ac || muted) return;
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource(); const g = ac.createGain();
    src.buffer = buf; g.gain.value = gain; src.connect(g); g.connect(master || ac.destination); src.start(); src.stop(ac.currentTime + dur);
  }
  function sfx(name) {
    if (name === 'start') { tone(320,.05,'triangle',.05); tone(540,.06,'triangle',.04,.05); return; }
    if (name === 'boost') { tone(260,.04,'sawtooth',.05); tone(920,.08,'triangle',.04,.03); return; }
    if (name === 'pickup') { tone(760,.05,'triangle',.045); tone(1120,.06,'triangle',.038,.03); return; }
    if (name === 'near') { tone(980,.04,'triangle',.04); tone(1320,.04,'triangle',.03,.03); return; }
    if (name === 'hit') { noise(.16,.07); tone(120,.18,'sawtooth',.055); return; }
    if (name === 'level') { tone(420,.06,'triangle',.05); tone(620,.08,'triangle',.04,.05); tone(880,.10,'sine',.035,.11); return; }
    if (name === 'gameover') { tone(220,.12,'sawtooth',.06); tone(160,.16,'sine',.05,.1); tone(100,.18,'sine',.04,.22); return; }
  }
  function musicTick() {
    if (!state.running || state.paused || muted) return;
    const notes = [110, 147, 185, 220, 185, 147, 165, 220];
    const n = notes[musicStep++ % notes.length];
    tone(n, .10, 'triangle', .010);
    if (musicStep % 2 === 0) tone(n * 2, .05, 'sine', .007, .03);
  }
  function startMusic() { if (!musicTimer && !muted) musicTimer = setInterval(musicTick, 240); }
  function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; }

  // GG score bridge
  let lastLiveScore = -1, lastLiveAt = 0;
  function postScore(mode = 'live') {
    const clean = Math.max(0, Math.floor(state.totalScore));
    const t = performance.now();
    if (mode === 'live' && clean === lastLiveScore && t - lastLiveAt < 140) return;
    if (mode === 'live' && t - lastLiveAt < 90) return;
    lastLiveScore = clean; lastLiveAt = t;
    const payload = {
      gameSlug: GAME_SLUG,
      slug: GAME_SLUG,
      score: clean,
      best,
      level: state.levelIndex + 1,
      distance: Math.floor(state.distance),
      lives: state.lives,
      mode,
    };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type: 'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type: 'gg:score', ...payload, payload }, '*'); } catch {}
  }

  const LEVELS = [
    { name:'Metro Rush', bg:'bgCity', lanes:3, baseSpeed:250, spawnEvery:1, targetDistance:900, scenery:'city', type:'sprint', story:'Maya: Welcome to the Horizon Circuit. Show the crew what you can do on the city roads.' },
    { name:'City Clock', bg:'bgCity', lanes:3, baseSpeed:255, spawnEvery:.95, targetDistance:1000, scenery:'city', type:'time', timeLimit:32, story:'Maya: The crew has set a qualifying time. Find a clear line and keep your momentum.' },
    { name:'Summit Run', bg:'bgMountain', lanes:3, baseSpeed:275, spawnEvery:.88, targetDistance:1100, scenery:'mountain', type:'sprint', story:'Maya: The mountain route is open. Stay alert as the traffic gets faster.' },
    { name:'Summit Delivery', bg:'bgMountain', lanes:3, baseSpeed:270, spawnEvery:.94, targetDistance:1100, scenery:'mountain', type:'delivery', maxHits:1, story:'Maya: A customer needs a careful driver. Deliver the cargo with no more than one collision.' },
    { name:'Coast Cruise', bg:'bgCoast', lanes:4, baseSpeed:295, spawnEvery:.82, targetDistance:1300, scenery:'coast', type:'sprint', story:'Maya: The coast is yours. Read the traffic and make the most of the open road.' },
    { name:'Coastal Countdown', bg:'bgCoast', lanes:4, baseSpeed:295, spawnEvery:.85, targetDistance:1350, scenery:'coast', type:'time', timeLimit:38, story:'Maya: A fast run here will earn the crew a place on the night circuit.' },
    { name:'Neon Highway', bg:'bgNeon', lanes:4, baseSpeed:320, spawnEvery:.76, targetDistance:1500, scenery:'neon', type:'sprint', story:'Maya: The lights are on and the city is watching. Keep your focus through the traffic.' },
    { name:'Night Delivery', bg:'bgNeon', lanes:4, baseSpeed:315, spawnEvery:.80, targetDistance:1600, scenery:'neon', type:'delivery', maxHits:1, story:'Maya: Bring the cargo home safely and the Horizon crew will know your name.' },
    { name:'Harbour Run', bg:'bgHarbour', fallbackBg:'bgCoast', lanes:4, baseSpeed:300, spawnEvery:.84, targetDistance:1450, scenery:'harbour', type:'sprint', story:'Maya: The Horizon Circuit continues at the harbour. Watch for trucks between the cranes.' },
    { name:'Dockside Duel', bg:'bgHarbour', fallbackBg:'bgCoast', lanes:4, baseSpeed:320, spawnEvery:.90, targetDistance:1650, scenery:'harbour', type:'rival', rivalSpeed:62, rivalLead:70, story:'Maya: Kai has challenged you to the bridge. Beat their car to the finish.' },
    { name:'Desert Dash', bg:'bgDesert', fallbackBg:'bgCoast', lanes:3, baseSpeed:310, spawnEvery:.88, targetDistance:1550, scenery:'desert', type:'time', timeLimit:40, story:'Maya: Beyond the city, the desert road opens up. Reach the checkpoint before time runs out.' },
    { name:'Canyon Cargo', bg:'bgDesert', fallbackBg:'bgMountain', lanes:3, baseSpeed:305, spawnEvery:.95, targetDistance:1550, scenery:'desert', type:'delivery', maxHits:1, story:'Maya: The crew needs these parts across the canyon. Keep the cargo safe.' },
    { name:'Frostline Run', bg:'bgSnow', fallbackBg:'bgMountain', lanes:3, baseSpeed:315, spawnEvery:.88, targetDistance:1650, scenery:'snow', type:'sprint', story:'Maya: Snow covers the peaks, but the pass is open. Stay focused through the traffic.' },
    { name:'Alpine Countdown', bg:'bgSnow', fallbackBg:'bgMountain', lanes:3, baseSpeed:320, spawnEvery:.90, targetDistance:1700, scenery:'snow', type:'time', timeLimit:43, story:'Maya: Kai set a time on the mountain. Reach the finish before the clock expires.' },
    { name:'Harbour Showdown', bg:'bgHarbour', fallbackBg:'bgCoast', lanes:4, baseSpeed:335, spawnEvery:.82, targetDistance:1900, scenery:'harbour', type:'rival', rivalSpeed:66, rivalLead:90, story:'Maya: Back at the harbour, Kai is waiting. Race to the finish and show the crew how far you have come.' },
    { name:'Metro Return', bg:'bgCity', lanes:4, baseSpeed:325, spawnEvery:.82, targetDistance:1750, scenery:'city', type:'sprint', story:'Maya: The championship qualifiers begin where your journey started. Show the city how far you have come.' },
    { name:'Alpine Relief', bg:'bgSnow', fallbackBg:'bgMountain', lanes:3, baseSpeed:320, spawnEvery:.90, targetDistance:1800, scenery:'snow', type:'delivery', maxHits:1, story:'Maya: The mountain crew needs fresh parts. Deliver them safely through the pass.' },
    { name:'Canyon Clock', bg:'bgDesert', fallbackBg:'bgCoast', lanes:3, baseSpeed:330, spawnEvery:.85, targetDistance:1950, scenery:'desert', type:'time', timeLimit:43, story:'Maya: The canyon qualifier is against the clock. Keep your line clean and carry your speed.' },
    { name:'Coastal Rivalry', bg:'bgCoast', lanes:4, baseSpeed:330, spawnEvery:.83, targetDistance:2000, scenery:'coast', type:'rival', rivalSpeed:67, rivalLead:90, story:'Maya: Kai is waiting on the coast. Beat them to the finish to earn your place in the next round.' },
    { name:'Harbour Deadline', bg:'bgHarbour', fallbackBg:'bgCoast', lanes:4, baseSpeed:330, spawnEvery:.80, targetDistance:2050, scenery:'harbour', type:'time', timeLimit:45, story:'Maya: Cross the harbour before the qualifier closes. Watch for heavy traffic near the docks.' },
    { name:'Summit Ascent', bg:'bgMountain', lanes:3, baseSpeed:325, spawnEvery:.82, targetDistance:2050, scenery:'mountain', type:'sprint', story:'Maya: The summit route is crowded today. Find a safe path through the traffic.' },
    { name:'Frostline Freight', bg:'bgSnow', fallbackBg:'bgMountain', lanes:3, baseSpeed:325, spawnEvery:.86, targetDistance:2100, scenery:'snow', type:'delivery', maxHits:1, story:'Maya: One careful delivery will get the team ready for the championship. Protect the cargo.' },
    { name:'Neon Qualifier', bg:'bgNeon', lanes:4, baseSpeed:340, spawnEvery:.78, targetDistance:2150, scenery:'neon', type:'time', timeLimit:46, story:'Maya: The final qualifying place is open. Reach the line before the clock runs out.' },
    { name:'Desert Duel', bg:'bgDesert', fallbackBg:'bgCoast', lanes:4, baseSpeed:340, spawnEvery:.80, targetDistance:2200, scenery:'desert', type:'rival', rivalSpeed:69, rivalLead:100, story:'Maya: Kai wants a rematch in the desert. Win this duel and meet them at the championship.' },
    { name:'Horizon Championship', bg:'bgCity', lanes:4, baseSpeed:345, spawnEvery:.76, targetDistance:2400, scenery:'city', type:'rival', rivalSpeed:70, rivalLead:110, story:'Maya: The crew is cheering you on. Kai is on the grid ahead. One last race through the city—bring it home.' }
  ];
  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null');
      if (saved && saved.version === 1 && Number.isInteger(saved.unlocked) && Array.isArray(saved.stars)) {
        const stars = LEVELS.map((_, i) => Math.max(0, Math.min(3, Number.isInteger(saved.stars[i]) ? saved.stars[i] : 0)));
        // Completed former campaign finales unlock the next event on upgrade.
        const unlocked = Math.max(saved.unlocked, stars[7] > 0 ? 8 : 0, stars[14] > 0 ? 15 : 0);
        return { version:1, unlocked:Math.max(0, Math.min(LEVELS.length - 1, unlocked)), stars };
      }
    } catch {}
    return { version:1, unlocked:0, stars:LEVELS.map(() => 0) };
  }
  const progress = readProgress();
  function saveProgress() { try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch {} }
  function saveBest() { try { localStorage.setItem(BEST_KEY, String(best)); } catch {} }

  const state = {
    running: false,
    paused: false,
    gameOver: false,
    levelClear: false,
    victory: false,
    levelIndex: 0,
    totalScore: 0,
    distance: 0,
    near: 0,
    boostsCollected: 0,
    lives: 3,
    boostEnergy: 1,
    boosting: 0,
    invuln: 0,
    traffic: [],
    pickups: [],
    particles: [],
    floaters: [],
    spawnT: 0.6,
    pickupT: 2.4,
    time: 0,
    roadScroll: 0,
    shake: 0,
    collisionSlow: 0,
    levelStartScore: 0,
    raceElapsed: 0,
    hits: 0,
    rivalDistance: 0,
  };

  const pointer = { down: false, id: null, x: 0, y: 0, startX: 0, startY: 0, tDown: 0 };
  const player = { x: 0, y: 0, w: 76, h: 142, targetX: 0, tilt: 0 };

  function currentLevel() { return LEVELS[state.levelIndex]; }
  function horizonY() { return CH * 0.20; }
  function playerY() { return CH * 0.82; }
  function roadCenter() { return CW * 0.5; }
  function roadTopW() { return CW * 0.18; }
  function roadBottomW() { return CW * 0.78; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function roadWidthAt(y) {
    const t = clamp((y - horizonY()) / (playerY() - horizonY() + 120), 0, 1);
    return lerp(roadTopW(), roadBottomW(), Math.pow(t, 1.05));
  }
  function laneCenterAt(lane, y, lanes = currentLevel().lanes) {
    const rw = roadWidthAt(y); const lw = rw / lanes;
    return roadCenter() - rw * 0.5 + lw * (lane + 0.5);
  }
  function missionProgressValue() {
    return clamp(state.distance / currentLevel().targetDistance, 0, 1);
  }
  function missionText() {
    const lvl = currentLevel();
    const finish = `Finish ${Math.floor(state.distance)} / ${lvl.targetDistance}m`;
    if (lvl.type === 'time') return `${finish} • Time left ${Math.max(0, Math.ceil(lvl.timeLimit - state.raceElapsed))}s`;
    if (lvl.type === 'delivery') return `${finish} • Collisions ${state.hits} / ${lvl.maxHits} allowed`;
    if (lvl.type === 'rival') {
      const gap = Math.round(state.rivalDistance - state.distance);
      return `${finish} • Rival ${gap > 0 ? `${gap}m ahead` : `${Math.abs(gap)}m behind`}`;
    }
    return `${finish} • Near misses ${state.near} / 2 for a star`;
  }
  function missionSummaryTitle() { return `Event ${state.levelIndex + 1} • ${currentLevel().name}`; }
  function levelIntroText() {
    const lvl = currentLevel();
    const goal = lvl.type === 'time' ? `Finish ${lvl.targetDistance}m in ${lvl.timeLimit} seconds.` :
      lvl.type === 'delivery' ? `Finish ${lvl.targetDistance}m with at most ${lvl.maxHits} collision.` :
      lvl.type === 'rival' ? `Beat Kai to the finish over ${lvl.targetDistance}m.` : `Finish ${lvl.targetDistance}m.`;
    return `${lvl.story}\n\n${goal}\nStars: finish, finish without a collision, and make two near misses.`;
  }
  function refreshEventPicker() {
    if (!eventSelect) return;
    eventSelect.innerHTML = '';
    LEVELS.forEach((lvl, i) => {
      const option = document.createElement('option');
      option.value = String(i); option.disabled = i > progress.unlocked;
      option.textContent = `${i + 1}. ${lvl.name}${option.disabled ? ' • Locked' : ` • ${progress.stars[i]}/3 stars`}`;
      eventSelect.appendChild(option);
    });
    eventSelect.value = String(state.levelIndex);
  }
  function showPanel(title, text, startLabel = 'Start') {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (btnStart) btnStart.textContent = startLabel;
    if (eventPicker) eventPicker.hidden = state.running;
    if (!state.running) refreshEventPicker();
    if (panel) panel.style.display = 'flex';
  }
  function hidePanel() { if (panel) panel.style.display = 'none'; }

  function setPlayerBase() {
    player.x = roadCenter();
    player.targetX = player.x;
    player.y = playerY();
    player.tilt = 0;
  }

  function resetLevelState() {
    state.distance = 0; state.near = 0; state.boostsCollected = 0; state.lives = 3; state.hits = 0; state.raceElapsed = 0; state.rivalDistance = currentLevel().rivalLead || 0;
    state.boostEnergy = 1; state.boosting = 0; state.invuln = 0; state.traffic = []; state.pickups = [];
    state.particles = []; state.floaters = []; state.spawnT = 0.8; state.pickupT = 2.0; state.time = 0; state.roadScroll = 0; state.shake = 0; state.collisionSlow = 0;
    setPlayerBase();
  }
  function resetRun() {
    state.running = false; state.paused = false; state.gameOver = false; state.levelClear = false; state.victory = false;
    state.levelIndex = 0; state.totalScore = 0; state.levelStartScore = 0;
    resetLevelState(); updateHUD(); showPanel('Swipe Racer • Horizon Circuit', `A new driver joins Maya's crew to earn a place on the Horizon Circuit. Race through the city, mountains, coast and neon streets.\n\n${levelIntroText()}`, 'Start event');
  }
  function loadLevel(index) {
    state.levelStartScore = state.totalScore;
    state.levelIndex = index; state.running = false; state.paused = false; state.gameOver = false; state.levelClear = false;
    state.victory = false; resetLevelState(); updateHUD(); showPanel(missionSummaryTitle(), levelIntroText(), 'Start event');
  }
  function startLevel() {
    state.running = true; state.paused = false; state.gameOver = false; state.levelClear = false; state.victory = false;
    hidePanel(); ensureAudio(); sfx('start'); startMusic();
  }
  function completeLevel() {
    state.running = false; state.levelClear = true; stopMusic(); sfx('level');
    if (state.totalScore > best) { best = Math.floor(state.totalScore); saveBest(); }
    const stars = 1 + (state.hits === 0 ? 1 : 0) + (state.near >= 2 ? 1 : 0);
    progress.stars[state.levelIndex] = Math.max(progress.stars[state.levelIndex], stars);
    progress.unlocked = Math.max(progress.unlocked, Math.min(LEVELS.length - 1, state.levelIndex + 1));
    saveProgress();
    if (state.levelIndex >= LEVELS.length - 1) {
      state.victory = true; postScore('victory');
      showPanel('Horizon Champion!', `Maya: You did it! The crew is proud of you, champion.\n\nEvent stars: ${stars} / 3\nScore: ${Math.floor(state.totalScore)}\nBest: ${best}\n\nChoose an unlocked event to race again.`, 'Race again');
    } else {
      showPanel('Event Complete!', `${missionSummaryTitle()} cleared.\nStars: ${stars} / 3\n\nScore: ${Math.floor(state.totalScore)}\nNext: Event ${state.levelIndex + 2} • ${LEVELS[state.levelIndex + 1].name}`, 'Next event');
    }
    updateHUD();
  }
  function endGame(reason) {
    state.running = false; state.gameOver = true; state.paused = false; stopMusic(); sfx('gameover');
    if (state.totalScore > best) { best = Math.floor(state.totalScore); saveBest(); }
    updateHUD(); postScore('game_over');
    showPanel('Race Over', `${reason}\n\nReached: Level ${state.levelIndex + 1} • ${currentLevel().name}\nScore: ${Math.floor(state.totalScore)}\nBest: ${best}\n\nRetry this level with your score from its start.`, 'Retry level');
  }

  function updateHUD() {
    if (elDistance) elDistance.textContent = `${Math.floor(state.distance)}m`;
    if (elScore) elScore.textContent = String(Math.floor(state.totalScore));
    if (elLives) elLives.textContent = String(state.lives);
    if (elBest) elBest.textContent = String(best);
    if (elBoostFill) elBoostFill.style.width = `${(state.boostEnergy / 3) * 100}%`;
    if (elBoostLabel) elBoostLabel.textContent = `${state.boostEnergy} / 3`;
    const prog = missionProgressValue();
    if (elLevelProgressFill) elLevelProgressFill.style.width = `${Math.round(prog * 100)}%`;
    if (elLevelProgressLabel) elLevelProgressLabel.textContent = `${Math.round(prog * 100)}%`;
    if (elMissionText) elMissionText.textContent = missionText();
    if (elMissionProgress) elMissionProgress.textContent = `${Math.round(prog * 100)}%`;
    if (elLevelBadge) elLevelBadge.textContent = missionSummaryTitle();
    postScore('live');
  }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return Math.abs(ax - bx) * 2 < aw + bw && Math.abs(ay - by) * 2 < ah + bh;
  }
  function addFloater(x, y, text, color = '#fff', size = 18) {
    state.floaters.push({ x, y, text, color, size, age: 0, life: 0.95, vy: -34 - Math.random() * 14 });
  }
  function popParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2; const s = 60 + Math.random() * 220;
      state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, r: 1.8 + Math.random() * 3.8, age: 0, life: 0.35 + Math.random() * 0.45, color });
    }
  }

  function useBoost() {
    if (!state.running || state.paused || state.gameOver || state.levelClear || state.victory) return;
    if (state.boostEnergy <= 0 || state.boosting > 0) return;
    state.boostEnergy -= 1; state.boosting = 1.0; state.totalScore += 40; state.shake = 4;
    popParticles(player.x, player.y + 24, 16, 'rgba(250,204,21,.95)'); addFloater(player.x, player.y - 40, 'Nitro!', '#ffe08a'); sfx('boost'); updateHUD();
  }

  function spawnTraffic() {
    const lvl = currentLevel();
    const lanes = lvl.lanes;
    const recent = new Set(state.traffic.filter(t => t.t < 0.9).map(t => t.lane));
    // Keep a continuous clear lane while traffic is approaching the player.
    const options = [...Array(lanes).keys()].filter(i => !recent.has(i));
    if (options.length <= 1) return;
    const lane = options[Math.floor(Math.random() * options.length)];
    const type = Math.random() < Math.min(.48, 0.18 + state.levelIndex * 0.05) ? 'truck' : 'car';
    const key = type === 'truck' ? 'truck' : ['red', 'yellow', 'green'][Math.floor(Math.random() * 3)];
    state.traffic.push({ type, key, lane, t: 0.02, speedF: 0.92 + Math.random() * 0.28, nearGiven: false });
  }
  function spawnPickup() {
    const lvl = currentLevel();
    const lane = Math.floor(Math.random() * lvl.lanes);
    const kind = (state.lives < 3 && Math.random() < 0.25) ? 'repair' : 'boost';
    state.pickups.push({ kind, lane, t: 0.05, speedF: 0.84 + Math.random() * 0.14 });
  }

  function projectEntity(ent) {
    const t = clamp(ent.t, 0, 1.25);
    const ease = Math.pow(t, 1.10);
    const y = lerp(horizonY(), playerY() + 120, ease);
    const laneX = laneCenterAt(ent.lane, y, currentLevel().lanes);
    const size = player.w / 76;
    const baseW = (ent.type === 'truck' ? 84 : 62) * size;
    const baseH = (ent.type === 'truck' ? 142 : 118) * size;
    const scale = 0.36 + ease * 1.08;
    return { x: laneX, y, w: baseW * scale, h: baseH * scale };
  }

  function levelDone() {
    const lvl = currentLevel();
    return state.distance >= lvl.targetDistance;
  }

  function canvasPoint(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  canvas.addEventListener('pointerdown', (e) => {
    ensureAudio(); canvas.setPointerCapture?.(e.pointerId); const p = canvasPoint(e);
    pointer.down = true; pointer.id = e.pointerId; pointer.x = p.x; pointer.y = p.y; pointer.startX = p.x; pointer.startY = p.y; pointer.tDown = performance.now();
    if (!state.running && !state.gameOver && !state.levelClear && !state.victory) startLevel();
    else if (state.gameOver) { state.totalScore = state.levelStartScore; loadLevel(state.levelIndex); startLevel(); }
    else if (state.victory) { state.totalScore = 0; loadLevel(state.levelIndex); startLevel(); }
    else if (state.levelClear) { loadLevel(state.levelIndex + 1); startLevel(); }
    else if (state.paused) { state.paused = false; hidePanel(); startMusic(); }
  }, { passive: true });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointer.down || pointer.id !== e.pointerId) return;
    const p = canvasPoint(e); const dx = p.x - pointer.x; pointer.x = p.x; pointer.y = p.y;
    const rw = roadWidthAt(player.y); const minX = roadCenter() - rw * 0.5 + player.w * 0.33; const maxX = roadCenter() + rw * 0.5 - player.w * 0.33;
    player.targetX = clamp(player.targetX + dx, minX, maxX);
  }, { passive: true });
  function onPointerUp(e) {
    if (!pointer.down || (e && pointer.id !== e.pointerId)) return;
    const p = e ? canvasPoint(e) : { x: pointer.x, y: pointer.y };
    const dt = performance.now() - pointer.tDown; const dx = p.x - pointer.startX; const dy = p.y - pointer.startY;
    if (e?.type !== 'pointercancel' && dt < 220 && dx * dx + dy * dy < 18 * 18) useBoost();
    pointer.down = false; pointer.id = null;
  }
  canvas.addEventListener('pointerup', onPointerUp, { passive: true });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.target && /^(SELECT|BUTTON|INPUT)$/.test(e.target.tagName)) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); useBoost(); }
    if (e.key.toLowerCase() === 'p') togglePause();
    if (e.key.toLowerCase() === 'r') { resetRun(); startLevel(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
    if (e.key === 'ArrowLeft') player.targetX -= roadWidthAt(player.y) / currentLevel().lanes;
    if (e.key === 'ArrowRight') player.targetX += roadWidthAt(player.y) / currentLevel().lanes;
  });

  function togglePause() {
    if (!state.running || state.gameOver || state.levelClear || state.victory) return;
    state.paused = !state.paused;
    if (state.paused) { stopMusic(); showPanel('Paused', 'Tap Start or Pause to continue.', 'Resume'); }
    else { hidePanel(); startMusic(); }
  }

  eventSelect?.addEventListener('change', () => {
    const index = Number(eventSelect.value);
    if (!Number.isInteger(index) || index < 0 || index > progress.unlocked || index >= LEVELS.length) { refreshEventPicker(); return; }
    state.totalScore = 0; loadLevel(index);
  });

  btnStart.onclick = () => {
    ensureAudio();
    if (state.gameOver) { state.totalScore = state.levelStartScore; loadLevel(state.levelIndex); startLevel(); return; }
    if (state.victory) { state.totalScore = 0; loadLevel(state.levelIndex); startLevel(); return; }
    if (state.levelClear) { loadLevel(state.levelIndex + 1); startLevel(); return; }
    if (!state.running) startLevel();
    else if (state.paused) { state.paused = false; hidePanel(); startMusic(); }
  };
  btnInfo.onclick = () => {
    if (state.running && !state.paused) { state.paused = true; stopMusic(); }
    showPanel('How to play', 'Swipe or drag to steer your car across the road.\n\n• Quick tap or Boost button = nitro burst\n• Pick up yellow nitro charges\n• Pick up green repair kits when damaged\n• Finish each event to unlock the next\n• Time trials have a countdown; deliveries allow only one collision\n• In rival races, beat Kai to the finish\n• Earn stars for finishing, clean driving and two near misses');
  };
  btnPause.onclick = togglePause;
  btnBoost.onclick = useBoost;
  btnSubmit.onclick = () => postScore('manual_submit');
  btnRestart.onclick = () => { resetRun(); startLevel(); };
  btnMute.onclick = () => { muted = !muted; btnMute.textContent = muted ? 'Muted' : 'Sound'; if (muted) stopMusic(); else if (state.running && !state.paused) startMusic(); };

  window.addEventListener('message', (ev) => {
    const data = ev.data || {}; const type = data.type || data.event;
    if (type === 'GG_PAUSE') { state.paused = !!(data.payload?.paused ?? data.paused); if (state.paused) stopMusic(); else if (state.running) startMusic(); }
    if (type === 'GG_MUTE') { muted = !!(data.payload?.muted ?? data.muted); btnMute.textContent = muted ? 'Muted' : 'Sound'; if (muted) stopMusic(); }
    if (type === 'GG_RESTART') { resetRun(); startLevel(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && state.running && !state.paused) togglePause(); });

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000)); last = now;
    step(dt); draw(now); requestAnimationFrame(loop);
  }

  function step(dt) {
    state.time += dt; state.shake = Math.max(0, state.shake - dt * 16);


    // ambient updates even when paused
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i]; p.age += dt; if (p.age >= p.life) { state.particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt;
    }
    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const f = state.floaters[i]; f.age += dt; if (f.age >= f.life) { state.floaters.splice(i, 1); continue; }
      f.y += f.vy * dt;
    }

    if (!state.running || state.paused || state.gameOver || state.levelClear || state.victory) { updateHUD(); return; }

    if (state.boosting > 0) state.boosting = Math.max(0, state.boosting - dt);
    if (state.invuln > 0) state.invuln = Math.max(0, state.invuln - dt);
    state.collisionSlow = Math.max(0, state.collisionSlow - dt);
    state.raceElapsed += dt;
    const lvl = currentLevel();
    if (lvl.type === 'time' && state.raceElapsed > lvl.timeLimit) { endGame('Time ran out.'); return; }
    const effectiveSpeed = (lvl.baseSpeed + Math.min(240, state.distance * 0.07) + (state.boosting > 0 ? 220 : 0)) * (state.collisionSlow > 0 ? 0.65 + 0.35 * (1 - state.collisionSlow / 2) : 1);
    const previousDistance = state.distance;
    state.distance += dt * effectiveSpeed * 0.20;
    if (lvl.type === 'rival') {
      const previousRival = state.rivalDistance;
      state.rivalDistance += dt * lvl.rivalSpeed;
      if (state.rivalDistance >= lvl.targetDistance) {
        const rivalFraction = (lvl.targetDistance - previousRival) / (state.rivalDistance - previousRival);
        const playerFraction = state.distance >= lvl.targetDistance ? (lvl.targetDistance - previousDistance) / (state.distance - previousDistance) : Infinity;
        if (rivalFraction < playerFraction) { endGame('Kai reached the finish first.'); return; }
      }
    }
    state.totalScore += dt * effectiveSpeed * 0.08 + (state.boosting > 0 ? dt * 18 : dt * 6);
    state.roadScroll += dt * effectiveSpeed;

    // move player toward target
    const rw = roadWidthAt(player.y); const minX = roadCenter() - rw * 0.5 + player.w * 0.33; const maxX = roadCenter() + rw * 0.5 - player.w * 0.33;
    player.targetX = clamp(player.targetX, minX, maxX);
    const oldX = player.x;
    player.x += (player.targetX - player.x) * (1 - Math.pow(0.0025, dt * 18));
    player.tilt = clamp((player.x - oldX) * 1.8, -0.35, 0.35);

    // spawn traffic and pickups
    state.spawnT -= dt;
    if (state.spawnT <= 0) {
      spawnTraffic();
      if (lvl.lanes >= 4 && Math.random() < 0.28) spawnTraffic();
      state.spawnT = lvl.spawnEvery * (0.85 + Math.random() * 0.45);
    }
    state.pickupT -= dt;
    if (state.pickupT <= 0) {
      if (Math.random() < 0.8) spawnPickup();
      state.pickupT = 2.8 + Math.random() * 2.1;
    }

    for (let i = state.traffic.length - 1; i >= 0; i--) {
      const tr = state.traffic[i];
      tr.t += dt * (0.26 + tr.t * 1.85) * (effectiveSpeed / 360) * tr.speedF;
      const p = projectEntity(tr); tr._p = p;
      if (!tr.nearGiven && p.y > player.y - 20 && p.y < player.y + 60) {
        const closeX = Math.abs(player.x - p.x) < (player.w * 0.42 + p.w * 0.42 + 26);
        const closeY = Math.abs(player.y - p.y) < (player.h * 0.40 + p.h * 0.40 + 18);
        const hit = rectsOverlap(player.x, player.y, player.w * 0.60, player.h * 0.68, p.x, p.y, p.w * 0.62, p.h * 0.70);
        if (closeX && closeY && !hit) {
          tr.nearGiven = true; state.near += 1; state.totalScore += 90; popParticles(player.x, player.y - 18, 10, 'rgba(255,255,255,.85)'); addFloater(player.x, player.y - 54, 'Near miss!', '#ffffff'); sfx('near');
        }
      }
      if (state.invuln <= 0 && rectsOverlap(player.x, player.y, player.w * 0.58, player.h * 0.66, p.x, p.y, p.w * 0.60, p.h * 0.66)) {
        state.traffic.splice(i, 1); state.lives -= 1; state.hits += 1; state.invuln = 1.05; state.collisionSlow = 2; state.boosting = 0; state.shake = 9; state.totalScore = Math.max(0, state.totalScore - 120);
        popParticles(player.x, player.y, 26, 'rgba(244,63,94,.95)'); addFloater(player.x, player.y - 34, '-1 Life', '#ff8aa0'); sfx('hit');
        if (lvl.type === 'delivery' && state.hits > lvl.maxHits) { endGame('The delivery took too much damage.'); return; }
        if (state.lives <= 0) { endGame('You ran out of lives.'); return; }
        continue;
      }
      if (tr.t > 1.12) state.traffic.splice(i, 1);
    }

    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const pu = state.pickups[i];
      pu.t += dt * (0.24 + pu.t * 1.55) * (effectiveSpeed / 360) * pu.speedF;
      const y = lerp(horizonY(), playerY() + 100, Math.pow(clamp(pu.t, 0, 1.2), 1.10));
      const x = laneCenterAt(pu.lane, y, currentLevel().lanes);
      const size = (24 + Math.pow(pu.t, 1.15) * 40) * (player.w / 76);
      pu._p = { x, y, size };
      if ((player.x - x) ** 2 + (player.y - y) ** 2 < (size * 0.42 + player.w * 0.4) ** 2) {
        state.pickups.splice(i, 1);
        if (pu.kind === 'boost') { state.boostEnergy = Math.min(3, state.boostEnergy + 1); state.boostsCollected += 1; state.totalScore += 55; addFloater(x, y, '+Nitro', '#ffe08a'); }
        else { state.lives = Math.min(3, state.lives + 1); state.totalScore += 40; addFloater(x, y, '+Repair', '#9cffba'); }
        popParticles(x, y, 16, pu.kind === 'boost' ? 'rgba(250,204,21,.95)' : 'rgba(34,197,94,.95)'); sfx('pickup');
        continue;
      }
      if (pu.t > 1.1) state.pickups.splice(i, 1);
    }

    if (levelDone()) { completeLevel(); return; }
    updateHUD();
  }

  function draw(now) {
    const shakeX = state.shake > 0 ? (Math.random() * 2 - 1) * state.shake : 0;
    const shakeY = state.shake > 0 ? (Math.random() * 2 - 1) * state.shake : 0;
    ctx.save(); ctx.translate(shakeX, shakeY);

    drawBackground();
    drawRoad();
    drawRoadsideProps(now);

    // entities sorted by depth
    const list = [];
    for (const p of state.pickups) if (p._p) list.push({ y: p._p.y, type: 'pickup', obj: p });
    for (const t of state.traffic) if (t._p) list.push({ y: t._p.y, type: 'traffic', obj: t });
    if (currentLevel().type === 'rival') {
      const gap = state.rivalDistance - state.distance;
      if (gap > -35) {
        const rival = { type:'car', key:'rival', lane:Math.min(1, currentLevel().lanes - 1), t:clamp(.86 - gap / 300, .05, 1.08) };
        rival._p = projectEntity(rival);
        list.push({ y:rival._p.y, type:'rival', obj:rival });
      }
    }
    list.sort((a, b) => a.y - b.y);
    for (const item of list) {
      if (item.type === 'pickup') drawPickup(item.obj);
      else if (item.type === 'rival') drawRival(item.obj);
      else drawTraffic(item.obj);
    }

    drawPlayer();
    drawParticlesAndFloaters();

    if (state.boosting > 0) {
      ctx.save(); ctx.fillStyle = `rgba(250,204,21,${0.03 + Math.sin(now * 0.02) * 0.015})`; ctx.fillRect(0, 0, CW, CH); ctx.restore();
    }
    ctx.restore();
  }

  function drawBackground() {
    ctx.fillStyle = '#070b16'; ctx.fillRect(0, 0, CW, CH);
    const img = (currentLevel().scenery === 'city' && images.cityHorizon) || images[currentLevel().bg] || images[currentLevel().fallbackBg];
    if (img && (img === images.cityHorizon || img === images.bgHarbour || img === images.bgDesert || img === images.bgSnow)) drawCityBackdrop(img, img === images.cityHorizon ? .67 : .45);
    else if (img) drawCover(img, 1);
    const grad = ctx.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, 'rgba(0,0,0,.05)'); grad.addColorStop(1, 'rgba(0,0,0,.22)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, CW, CH);
  }
  function drawCityBackdrop(img, horizon = .67) {
    // Align the illustration's horizon with the projected road on every screen shape.
    const sourceW = Math.min(img.width, img.height * CW / CH * 1.2);
    const sourceX = (img.width - sourceW) / 2;
    const sourceHorizon = img.height * horizon;
    const hy = horizonY();
    ctx.drawImage(img, sourceX, 0, sourceW, sourceHorizon, 0, 0, CW, hy);
    ctx.drawImage(img, sourceX, sourceHorizon, sourceW, img.height - sourceHorizon, 0, hy, CW, CH - hy);
  }
  function drawCover(img, alpha = 1) {
    const iw = img.width, ih = img.height; const scale = Math.max(CW / iw, CH / ih) * 1.05;
    const dw = iw * scale, dh = ih * scale; const x = (CW - dw) / 2; const y = (CH - dh) / 2;
    ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(img, x, y, dw, dh); ctx.restore();
  }

  function drawRoad() {
    const hy = horizonY(); const py = playerY() + 170; const topW = roadTopW(); const botW = roadBottomW();
    const topL = roadCenter() - topW * 0.5, topR = roadCenter() + topW * 0.5, botL = roadCenter() - botW * 0.5, botR = roadCenter() + botW * 0.5;
    // shoulders
    ctx.fillStyle = 'rgba(0,0,0,.26)';
    ctx.beginPath(); ctx.moveTo(topL - 30, hy); ctx.lineTo(botL - 60, py); ctx.lineTo(botL, py); ctx.lineTo(topL, hy); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(topR, hy); ctx.lineTo(botR, py); ctx.lineTo(botR + 60, py); ctx.lineTo(topR + 30, hy); ctx.closePath(); ctx.fill();
    // road body
    const rg = ctx.createLinearGradient(0, hy, 0, py); rg.addColorStop(0, 'rgba(45,50,62,.92)'); rg.addColorStop(1, 'rgba(30,34,44,.98)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(topL, hy); ctx.lineTo(topR, hy); ctx.lineTo(botR, py); ctx.lineTo(botL, py); ctx.closePath(); ctx.fill();
    // edge lines
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(topL + 2, hy); ctx.lineTo(botL + 2, py); ctx.moveTo(topR - 2, hy); ctx.lineTo(botR - 2, py); ctx.stroke();
    // lane dashes with perspective
    const lanes = currentLevel().lanes;
    for (let lane = 1; lane < lanes; lane++) {
      for (let i = 0; i < 22; i++) {
        const t = ((i * 74 + state.roadScroll * 0.9) % 1600) / 1600;
        const t1 = clamp(t, 0, 1); const t2 = clamp(t + 0.035, 0, 1);
        const y1 = lerp(hy, py, Math.pow(t1, 1.15)); const y2 = lerp(hy, py, Math.pow(t2, 1.15));
        const x1 = laneCenterAt(lane - 0.5, y1, lanes); const x2 = laneCenterAt(lane - 0.5, y2, lanes);
        ctx.strokeStyle = 'rgba(255,255,255,.72)'; ctx.lineWidth = 1.2 + t1 * 3.8;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
    }
    // The moving reflections reinforce forward motion without obscuring the lane markings.
    if (currentLevel().scenery === 'city') {
      ctx.save(); ctx.strokeStyle = 'rgba(255,187,105,.14)';
      for (let i = 0; i < 8; i++) {
        const t = ((i * 0.14 + state.roadScroll * 0.00042) % 1);
        const y = lerp(hy, py, t * t); const width = roadWidthAt(y) * 0.42;
        ctx.lineWidth = 0.5 + t * 1.5; ctx.beginPath(); ctx.moveTo(roadCenter() - width, y); ctx.lineTo(roadCenter() + width, y); ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawRoadsideProps(now) {
    const hy = horizonY(); const py = playerY() + 175;
    for (let i = 0; i < 14; i++) {
      const t = ((i * 0.08) + ((state.roadScroll * 0.00055) % 1)) % 1;
      const y = lerp(hy, py, Math.pow(t, 1.18));
      const rw = roadWidthAt(y); const leftX = roadCenter() - rw * 0.5 - 34 - t * 48; const rightX = roadCenter() + rw * 0.5 + 34 + t * 48; const h = 12 + t * 90;
      const col = currentLevel().scenery === 'neon' ? 'rgba(168,85,247,.85)' : currentLevel().scenery === 'coast' ? 'rgba(40,120,90,.85)' : 'rgba(255,255,255,.35)';
      ctx.strokeStyle = col; ctx.lineWidth = 2 + t * 3;
      ctx.beginPath(); ctx.moveTo(leftX, y); ctx.lineTo(leftX, y - h); ctx.moveTo(rightX, y); ctx.lineTo(rightX, y - h); ctx.stroke();
      ctx.beginPath(); ctx.arc(leftX, y - h, 2 + t * 5, 0, Math.PI * 2); ctx.arc(rightX, y - h, 2 + t * 5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    }
    // route title watermark
    ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '1000 34px system-ui'; ctx.textAlign = 'center'; ctx.fillText(currentLevel().name.toUpperCase(), CW * 0.5, CH * 0.33); ctx.restore();
  }

  function drawTraffic(tr) {
    const p = tr._p; if (!p) return;
    ctx.save();
    const bob = state.running && !state.paused && !reducedMotion?.matches ? Math.sin(state.roadScroll * 0.025 + tr.lane * 2) * Math.min(1.3, p.h * 0.012) : 0;
    ctx.translate(p.x, p.y + bob);
    ctx.fillStyle = 'rgba(4,9,18,.35)'; ctx.beginPath(); ctx.ellipse(0, p.h * 0.04, p.w * 0.46, p.h * 0.44, 0, 0, Math.PI * 2); ctx.fill();
    const img = tr.type === 'truck' ? (images.truckV2 || images.truck) : (images.racerV2 || images[tr.key]);
    if (tr.type !== 'truck' && images.racerV2) {
      const tint = {red:'hue-rotate(145deg)', yellow:'hue-rotate(190deg) saturate(1.3)', green:'hue-rotate(260deg) saturate(1.2)'};
      ctx.filter = tint[tr.key] || 'none';
    }
    if (img) ctx.drawImage(img, -p.w * 0.5, -p.h * 0.5, p.w, p.h);
    else { ctx.fillStyle = '#f43f5e'; ctx.fillRect(-p.w * 0.5, -p.h * 0.5, p.w, p.h); }
    ctx.filter = 'none';
    // Tail lamps pulse gently, remaining tied to the sprite and never the hit box.
    ctx.fillStyle = 'rgba(255,82,55,.8)';
    const lampY = p.h * 0.38, lampW = Math.max(1, p.w * 0.08);
    ctx.fillRect(-p.w * 0.25, lampY, lampW, Math.max(1, p.h * 0.018));
    ctx.fillRect(p.w * 0.17, lampY, lampW, Math.max(1, p.h * 0.018));
    ctx.restore();
  }

  function drawRival(rival) {
    const p = rival._p;
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.fillStyle = 'rgba(4,9,18,.4)'; ctx.beginPath(); ctx.ellipse(0, p.h * .04, p.w * .46, p.h * .44, 0, 0, Math.PI * 2); ctx.fill();
    const img = images.racerV2 || images.player;
    if (img) { ctx.filter = 'hue-rotate(75deg)'; ctx.drawImage(img, -p.w * .5, -p.h * .5, p.w, p.h); ctx.filter = 'none'; }
    else { ctx.fillStyle = '#be4bff'; ctx.fillRect(-p.w * .5, -p.h * .5, p.w, p.h); }
    ctx.font = `bold ${Math.max(9, Math.min(16, p.w * .2))}px system-ui`; ctx.textAlign = 'center';
    ctx.lineWidth = 3; ctx.strokeStyle = '#111'; ctx.strokeText('KAI', 0, -p.h * .57); ctx.fillStyle = '#fff'; ctx.fillText('KAI', 0, -p.h * .57);
    ctx.restore();
  }

  function drawPickup(pu) {
    const p = pu._p; if (!p) return;
    const img = images[pu.kind === 'repair' ? 'repair' : 'boost'];
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(state.time * 1.8 + pu.t * 2);
    ctx.shadowColor = pu.kind === 'repair' ? 'rgba(34,197,94,.9)' : 'rgba(250,204,21,.9)'; ctx.shadowBlur = 16;
    if (img) ctx.drawImage(img, -p.size * 0.5, -p.size * 0.5, p.size, p.size);
    else { ctx.fillStyle = pu.kind === 'repair' ? '#22c55e' : '#facc15'; ctx.beginPath(); ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  function drawPlayer() {
    const bob = state.running && !state.paused && !reducedMotion?.matches ? Math.sin(state.roadScroll * 0.035) * 0.8 : 0;
    ctx.save(); ctx.translate(player.x, player.y + bob); ctx.rotate(player.tilt);
    ctx.scale(player.w / 76, player.h / 142);
    ctx.fillStyle = 'rgba(4,9,18,.38)'; ctx.beginPath(); ctx.ellipse(0, 6, 34, 61, 0, 0, Math.PI * 2); ctx.fill();
    if (state.boosting > 0) {
      ctx.save(); ctx.shadowColor = 'rgba(250,204,21,.95)'; ctx.shadowBlur = 24; ctx.fillStyle = 'rgba(250,204,21,.85)';
      ctx.beginPath(); ctx.moveTo(-18, 52); ctx.lineTo(-8, 86 + Math.random() * 12); ctx.lineTo(2, 52); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(18, 52); ctx.lineTo(8, 86 + Math.random() * 12); ctx.lineTo(-2, 52); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    if (state.invuln > 0) {
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(59,130,246,.9)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.ellipse(0, 0, 76 * 0.55, 142 * 0.42, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    const img = images.racerV2 || images.player;
    if (img) ctx.drawImage(img, -38, -71, 76, 142);
    else { ctx.fillStyle = '#3b82f6'; ctx.fillRect(-38, -71, 76, 142); }
    ctx.restore();
  }

  function drawParticlesAndFloaters() {
    for (const p of state.particles) {
      const a = 1 - p.age / p.life; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    for (const f of state.floaters) {
      const a = 1 - f.age / f.life; ctx.save(); ctx.globalAlpha = a; ctx.font = `1000 ${f.size}px system-ui`; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.strokeText(f.text, f.x, f.y); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y); ctx.restore();
    }
  }

  resetRun();
  requestAnimationFrame(loop);
})();
