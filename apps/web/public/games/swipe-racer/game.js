(() => {
  'use strict';

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!canvas || !ctx) return;

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

  const GAME_SLUG = 'swipe-racer';
  const BEST_KEY = 'wga_swipe_racer_best_v2';
  let META = { title: 'Swipe Racer', description: '' };
  let best = Number(localStorage.getItem(BEST_KEY) || '0') || 0;

  async function loadMeta() {
    try {
      const res = await fetch('./game.json', { cache: 'no-store' });
      META = await res.json();
      document.title = META.title || 'Swipe Racer';
      if (elTitle) elTitle.textContent = META.title || 'Swipe Racer';
      if (panelTitle) panelTitle.textContent = META.title || 'Swipe Racer';
      if (META.description && panelText) panelText.textContent = META.description;
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
  }
  requestAnimationFrame(() => {
    resize();
    window.addEventListener('resize', resize, { passive: true });
  });

  const images = {};
  const assetPaths = {
    bgCity: './assets/backgrounds/bg-city-day.png',
    bgMountain: './assets/backgrounds/bg-mountain-pass.png',
    bgCoast: './assets/backgrounds/bg-coast-sunset.png',
    bgNeon: './assets/backgrounds/bg-neon-night.png',
    player: './assets/sprites/player-car-blue.png',
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
    { name: 'Metro Rush', bg: 'bgCity', lanes: 3, baseSpeed: 250, spawnEvery: 1.00, targetDistance: 900, targetNear: 2, targetBoosts: 1, targetScore: 0, scenery: 'city' },
    { name: 'Summit Run', bg: 'bgMountain', lanes: 3, baseSpeed: 275, spawnEvery: 0.88, targetDistance: 1100, targetNear: 1, targetBoosts: 2, targetScore: 0, scenery: 'mountain' },
    { name: 'Coast Cruise', bg: 'bgCoast', lanes: 4, baseSpeed: 295, spawnEvery: 0.82, targetDistance: 1300, targetNear: 3, targetBoosts: 2, targetScore: 1600, scenery: 'coast' },
    { name: 'Neon Highway', bg: 'bgNeon', lanes: 4, baseSpeed: 320, spawnEvery: 0.76, targetDistance: 1600, targetNear: 4, targetBoosts: 2, targetScore: 2600, scenery: 'neon' }
  ];

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
    const lvl = currentLevel();
    const values = [];
    if (lvl.targetDistance > 0) values.push(state.distance / lvl.targetDistance);
    if (lvl.targetNear > 0) values.push(state.near / lvl.targetNear);
    if (lvl.targetBoosts > 0) values.push(state.boostsCollected / lvl.targetBoosts);
    if (lvl.targetScore > 0) values.push(state.totalScore / lvl.targetScore);
    return clamp(Math.min(...values), 0, 1);
  }
  function missionText() {
    const lvl = currentLevel();
    const parts = [];
    if (lvl.targetDistance > 0) parts.push(`Distance ${Math.floor(state.distance)} / ${lvl.targetDistance}m`);
    if (lvl.targetNear > 0) parts.push(`Near misses ${state.near} / ${lvl.targetNear}`);
    if (lvl.targetBoosts > 0) parts.push(`Boost pickups ${state.boostsCollected} / ${lvl.targetBoosts}`);
    if (lvl.targetScore > 0) parts.push(`Score ${Math.floor(state.totalScore)} / ${lvl.targetScore}`);
    return parts.join(' • ');
  }
  function missionSummaryTitle() {
    return `Level ${state.levelIndex + 1} • ${currentLevel().name}`;
  }
  function levelIntroText() {
    const lvl = currentLevel();
    return `${missionSummaryTitle()}\n\nMission:\n${missionText()}\n\nSwipe to steer around traffic. Tap for a nitro burst when you have charge.`;
  }
  function showPanel(title, text, startLabel = 'Start') {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (btnStart) btnStart.textContent = startLabel;
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
    state.distance = 0; state.near = 0; state.boostsCollected = 0; state.lives = 3;
    state.boostEnergy = 1; state.boosting = 0; state.invuln = 0; state.traffic = []; state.pickups = [];
    state.particles = []; state.floaters = []; state.spawnT = 0.8; state.pickupT = 2.0; state.time = 0; state.roadScroll = 0; state.shake = 0;
    setPlayerBase();
  }
  function resetRun() {
    state.running = false; state.paused = false; state.gameOver = false; state.levelClear = false; state.victory = false;
    state.levelIndex = 0; state.totalScore = 0;
    resetLevelState(); updateHUD(); showPanel(META.title || 'Swipe Racer', META.description || 'Swipe to steer and complete missions.', 'Start');
  }
  function loadLevel(index) {
    state.levelIndex = index; state.running = false; state.paused = false; state.gameOver = false; state.levelClear = false;
    state.victory = false; resetLevelState(); updateHUD(); showPanel(missionSummaryTitle(), levelIntroText(), index === 0 ? 'Start level' : 'Start next level');
  }
  function startLevel() {
    state.running = true; state.paused = false; state.gameOver = false; state.levelClear = false; state.victory = false;
    hidePanel(); ensureAudio(); sfx('start'); startMusic();
  }
  function completeLevel() {
    state.running = false; state.levelClear = true; stopMusic(); sfx('level');
    if (state.totalScore > best) { best = Math.floor(state.totalScore); localStorage.setItem(BEST_KEY, String(best)); }
    if (state.levelIndex >= LEVELS.length - 1) {
      state.victory = true; postScore('victory');
      showPanel('Champion Run!', `You completed all ${LEVELS.length} levels.\n\nFinal score: ${Math.floor(state.totalScore)}\nBest: ${best}\n\nTap Start to play again.`, 'Play again');
    } else {
      showPanel('Level Complete!', `${missionSummaryTitle()} cleared.\n\nScore: ${Math.floor(state.totalScore)}\nNext: Level ${state.levelIndex + 2} • ${LEVELS[state.levelIndex + 1].name}`, 'Next level');
    }
    updateHUD();
  }
  function endGame(reason) {
    state.running = false; state.gameOver = true; state.paused = false; stopMusic(); sfx('gameover');
    if (state.totalScore > best) { best = Math.floor(state.totalScore); localStorage.setItem(BEST_KEY, String(best)); }
    updateHUD(); postScore('game_over');
    showPanel('Race Over', `${reason}\n\nReached: Level ${state.levelIndex + 1} • ${currentLevel().name}\nScore: ${Math.floor(state.totalScore)}\nBest: ${best}\n\nTap Start to retry from level 1.`, 'Restart run');
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
    const recent = new Set(state.traffic.filter(t => t.t < 0.22).map(t => t.lane));
    const options = [...Array(lanes).keys()].filter(i => !recent.has(i));
    const lane = options.length ? options[Math.floor(Math.random() * options.length)] : Math.floor(Math.random() * lanes);
    const type = Math.random() < 0.18 + state.levelIndex * 0.05 ? 'truck' : 'car';
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
    const baseW = ent.type === 'truck' ? 84 : 62;
    const baseH = ent.type === 'truck' ? 142 : 118;
    const scale = 0.36 + ease * 1.08;
    return { x: laneX, y, w: baseW * scale, h: baseH * scale };
  }

  function levelDone() {
    const lvl = currentLevel();
    return state.distance >= lvl.targetDistance && state.near >= lvl.targetNear && state.boostsCollected >= lvl.targetBoosts && state.totalScore >= lvl.targetScore;
  }

  function canvasPoint(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  canvas.addEventListener('pointerdown', (e) => {
    ensureAudio(); canvas.setPointerCapture?.(e.pointerId); const p = canvasPoint(e);
    pointer.down = true; pointer.id = e.pointerId; pointer.x = p.x; pointer.y = p.y; pointer.startX = p.x; pointer.startY = p.y; pointer.tDown = performance.now();
    if (!state.running && !state.gameOver && !state.levelClear && !state.victory) startLevel();
    else if (state.gameOver || state.victory) { resetRun(); startLevel(); }
    else if (state.levelClear) { loadLevel(state.levelIndex + 1); startLevel(); }
    else if (state.paused) { state.paused = false; hidePanel(); startMusic(); }
  }, { passive: true });
  canvas.addEventListener('pointermove', (e) => {
    if (!pointer.down || pointer.id !== e.pointerId) return;
    const p = canvasPoint(e); pointer.x = p.x; pointer.y = p.y;
    const rw = roadWidthAt(player.y); const minX = roadCenter() - rw * 0.5 + player.w * 0.33; const maxX = roadCenter() + rw * 0.5 - player.w * 0.33;
    player.targetX = clamp(p.x, minX, maxX);
  }, { passive: true });
  function onPointerUp(e) {
    if (!pointer.down || (e && pointer.id !== e.pointerId)) return;
    const p = e ? canvasPoint(e) : { x: pointer.x, y: pointer.y };
    const dt = performance.now() - pointer.tDown; const dx = p.x - pointer.startX; const dy = p.y - pointer.startY;
    if (dt < 220 && dx * dx + dy * dy < 18 * 18) useBoost();
    pointer.down = false; pointer.id = null;
  }
  canvas.addEventListener('pointerup', onPointerUp, { passive: true });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); useBoost(); }
    if (e.key.toLowerCase() === 'p') togglePause();
    if (e.key.toLowerCase() === 'r') { resetRun(); startLevel(); }
    if (e.key === 'ArrowLeft') player.targetX -= roadWidthAt(player.y) / currentLevel().lanes;
    if (e.key === 'ArrowRight') player.targetX += roadWidthAt(player.y) / currentLevel().lanes;
  });

  function togglePause() {
    if (!state.running || state.gameOver || state.levelClear || state.victory) return;
    state.paused = !state.paused;
    if (state.paused) { stopMusic(); showPanel('Paused', 'Tap Start or Pause to continue.', 'Resume'); }
    else { hidePanel(); startMusic(); }
  }

  btnStart.onclick = () => {
    ensureAudio();
    if (state.gameOver || state.victory) { resetRun(); startLevel(); return; }
    if (state.levelClear) { loadLevel(state.levelIndex + 1); startLevel(); return; }
    if (!state.running) startLevel();
    else if (state.paused) { state.paused = false; hidePanel(); startMusic(); }
  };
  btnInfo.onclick = () => {
    if (state.running && !state.paused) { state.paused = true; stopMusic(); }
    showPanel('How to play', 'Swipe or drag to steer your car across the road.\n\n• Quick tap or Boost button = nitro burst\n• Pick up yellow nitro charges\n• Pick up green repair kits when damaged\n• Complete each level mission to unlock the next route\n• Multiple traffic types and faster roads appear later');
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
  document.addEventListener('visibilitychange', () => { if (document.hidden) { state.paused = true; stopMusic(); } });

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000)); last = now;
    step(dt); draw(now); requestAnimationFrame(loop);
  }

  function step(dt) {
    state.time += dt; state.shake = Math.max(0, state.shake - dt * 16);
    if (state.boosting > 0) state.boosting = Math.max(0, state.boosting - dt);
    if (state.invuln > 0) state.invuln = Math.max(0, state.invuln - dt);

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

    const lvl = currentLevel();
    const effectiveSpeed = lvl.baseSpeed + Math.min(240, state.distance * 0.07) + (state.boosting > 0 ? 220 : 0);
    state.distance += dt * effectiveSpeed * 0.20;
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
        state.traffic.splice(i, 1); state.lives -= 1; state.invuln = 1.05; state.shake = 9; state.totalScore = Math.max(0, state.totalScore - 120);
        popParticles(player.x, player.y, 26, 'rgba(244,63,94,.95)'); addFloater(player.x, player.y - 34, '-1 Life', '#ff8aa0'); sfx('hit');
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
      const size = 24 + Math.pow(pu.t, 1.15) * 40;
      pu._p = { x, y, size };
      if ((player.x - x) ** 2 + (player.y - y) ** 2 < (size * 0.42 + 30) ** 2) {
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
    list.sort((a, b) => a.y - b.y);
    for (const item of list) {
      if (item.type === 'pickup') drawPickup(item.obj);
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
    const img = images[currentLevel().bg];
    if (img) drawCover(img, 1);
    const grad = ctx.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, 'rgba(0,0,0,.05)'); grad.addColorStop(1, 'rgba(0,0,0,.22)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, CW, CH);
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
    // center glow
    ctx.fillStyle = 'rgba(255,255,255,.04)'; ctx.fillRect(roadCenter() - 2, hy, 4, py - hy);
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
    ctx.translate(p.x, p.y);
    const img = images[tr.key];
    if (img) ctx.drawImage(img, -p.w * 0.5, -p.h * 0.5, p.w, p.h);
    else { ctx.fillStyle = '#f43f5e'; ctx.fillRect(-p.w * 0.5, -p.h * 0.5, p.w, p.h); }
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
    ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.tilt);
    if (state.boosting > 0) {
      ctx.save(); ctx.shadowColor = 'rgba(250,204,21,.95)'; ctx.shadowBlur = 24; ctx.fillStyle = 'rgba(250,204,21,.85)';
      ctx.beginPath(); ctx.moveTo(-18, 52); ctx.lineTo(-8, 86 + Math.random() * 12); ctx.lineTo(2, 52); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(18, 52); ctx.lineTo(8, 86 + Math.random() * 12); ctx.lineTo(-2, 52); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    if (state.invuln > 0) {
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.shadowColor = 'rgba(59,130,246,.9)'; ctx.shadowBlur = 16; ctx.beginPath(); ctx.ellipse(0, 0, player.w * 0.55, player.h * 0.42, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    const img = images.player;
    if (img) ctx.drawImage(img, -player.w * 0.5, -player.h * 0.5, player.w, player.h);
    else { ctx.fillStyle = '#3b82f6'; ctx.fillRect(-player.w * 0.5, -player.h * 0.5, player.w, player.h); }
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
