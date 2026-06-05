(() => {
  'use strict';

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!canvas || !ctx) return;

  const $ = (id) => document.getElementById(id);
  const elScore = $('score');
  const elBest = $('best');
  const elLives = $('lives');
  const elDashFill = $('dashFill');
  const elDashLabel = $('dashLabel');
  const elComboFill = $('comboFill');
  const elComboLabel = $('comboLabel');
  const elTitle = $('ggTitle');
  const elSub = $('ggSub');
  const panel = $('panel');
  const panelTitle = $('panelTitle');
  const panelText = $('panelText');
  const btnStart = $('btnStart');
  const btnOverlay = $('btnOverlay');
  const btnPause = $('btnPause');
  const btnSubmit = $('btnSubmit');
  const btnRestart = $('btnRestart');
  const btnMute = $('btnMute');

  const GAME_SLUG = 'space-dodger';
  const BEST_KEY = 'wga_space_dodger_best_v2';
  let best = Number(localStorage.getItem(BEST_KEY) || '0') || 0;
  let meta = { title: 'Space Dodger', description: '' };

  async function loadMeta() {
    try {
      const res = await fetch('./game.json', { cache: 'no-store' });
      meta = await res.json();
      document.title = meta.title || 'Space Dodger';
      if (elTitle) elTitle.textContent = meta.title || 'Space Dodger';
      if (panelTitle) panelTitle.textContent = meta.title || 'Space Dodger';
      if (meta.description && panelText) panelText.textContent = meta.description;
      if (elSub) elSub.textContent = 'Drag to move • Tap to dash • Collect crystals • Dodge asteroids';
      try { window.GG?.init?.({ title: meta.title || 'Space Dodger' }); } catch {}
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
    ship: './assets/sprites/player_ship.png',
    asteroid: './assets/sprites/asteroid.png',
    crystal: './assets/sprites/star_crystal.png',
    shield: './assets/sprites/shield_pickup.png',
    time: './assets/sprites/time_pickup.png',
    bg1: './assets/backgrounds/bg-nebula-1.png',
    bg2: './assets/backgrounds/bg-nebula-2.png',
  };
  function loadImage(key, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { images[key] = img; resolve(); };
      img.onerror = () => { images[key] = null; resolve(); };
      img.src = src;
    });
  }
  Promise.all(Object.entries(assetPaths).map(([k, src]) => loadImage(k, src)));

  // Audio
  let AC = null, master = null, musicTimer = null, musicStep = 0, muted = false;
  function ensureAudio() {
    if (muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC) {
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = 0.12;
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
  function noise(dur = 0.12, gain = 0.04) {
    const ac = ensureAudio(); if (!ac || muted) return;
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource(); const g = ac.createGain();
    src.buffer = buf; g.gain.value = gain; src.connect(g); g.connect(master || ac.destination); src.start(); src.stop(ac.currentTime + dur);
  }
  function sfx(name) {
    if (name === 'start') { tone(360, .05, 'triangle', .05); tone(540, .07, 'triangle', .04, .04); return; }
    if (name === 'dash') { tone(280, .04, 'sawtooth', .05); tone(840, .08, 'triangle', .04, .03); return; }
    if (name === 'crystal') { tone(920, .04, 'triangle', .05); tone(1380, .06, 'triangle', .04, .02); return; }
    if (name === 'pickup') { tone(540, .06, 'sine', .05); tone(810, .08, 'triangle', .04, .04); return; }
    if (name === 'hit') { noise(.15, .06); tone(140, .16, 'sawtooth', .06); return; }
    if (name === 'near') { tone(700, .03, 'triangle', .03); return; }
    if (name === 'gameover') { tone(220, .12, 'sawtooth', .06); tone(160, .16, 'sine', .05, .1); tone(100, .18, 'sine', .04, .22); return; }
  }
  function musicTick() {
    if (!state.running || state.paused || muted) return;
    const notes = [147, 196, 247, 294, 247, 196, 220, 294];
    const n = notes[musicStep++ % notes.length];
    tone(n, .12, 'triangle', .012);
    if (musicStep % 2 === 0) tone(n * 2, .06, 'sine', .008, .03);
  }
  function startMusic() { if (!musicTimer && !muted) musicTimer = setInterval(musicTick, 240); }
  function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; }

  // GG score bridge
  let lastLiveScore = -1, lastLiveAt = 0;
  function postScore(mode = 'live') {
    const clean = Math.max(0, Math.floor(state.score));
    const t = performance.now();
    if (mode === 'live' && clean === lastLiveScore && t - lastLiveAt < 140) return;
    if (mode === 'live' && t - lastLiveAt < 90) return;
    lastLiveScore = clean; lastLiveAt = t;
    const payload = { gameSlug: GAME_SLUG, slug: GAME_SLUG, score: clean, best, mode, shields: state.lives, combo: state.combo };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type: 'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type: 'gg:score', ...payload, payload }, '*'); } catch {}
  }

  const state = {
    running: false,
    paused: false,
    gameOver: false,
    score: 0,
    lives: 3,
    combo: 1,
    comboTimer: 0,
    slowTimer: 0,
    distance: 0,
    shake: 0,
    bgScroll1: 0,
    bgScroll2: 0,
    asteroids: [],
    crystals: [],
    pickups: [],
    particles: [],
    floaters: [],
    stars: [],
    asteroidTimer: 0,
    crystalTimer: 0,
    pickupTimer: 7,
    nearMissMarks: new WeakSet(),
  };
  const keys = new Set();
  const pointer = { down: false, id: null, x: 0, y: 0, startX: 0, startY: 0, tDown: 0 };
  const player = { x: 0, y: 0, r: 24, vx: 0, vy: 0, dirX: 0, dirY: -1, dash: 1, invuln: 0, trail: [] };

  function resetStars() {
    state.stars = [];
    for (let i = 0; i < 80; i++) state.stars.push({ x: Math.random() * CW, y: Math.random() * CH, r: 0.8 + Math.random() * 2.2, s: 14 + Math.random() * 70, a: 0.2 + Math.random() * 0.7 });
  }
  function resetGame() {
    state.running = false; state.paused = false; state.gameOver = false;
    state.score = 0; state.lives = 3; state.combo = 1; state.comboTimer = 0; state.slowTimer = 0; state.distance = 0; state.shake = 0;
    state.asteroids = []; state.crystals = []; state.pickups = []; state.particles = []; state.floaters = [];
    state.asteroidTimer = 0.65; state.crystalTimer = 1.2; state.pickupTimer = 7.5; state.nearMissMarks = new WeakSet();
    player.x = CW * 0.5; player.y = CH * 0.78; player.vx = 0; player.vy = 0; player.dirX = 0; player.dirY = -1; player.dash = 1; player.invuln = 0; player.trail = [];
    if (!state.stars.length) resetStars();
    updateHUD();
    showPanel(meta.title || 'Space Dodger', meta.description || 'Guide your ship through a neon deep-space lane.');
  }
  function startGame() {
    state.running = true; state.paused = false; state.gameOver = false;
    hidePanel(); lastLiveScore = -1; sfx('start'); startMusic(); updateHUD();
  }
  function endGame(text) {
    state.gameOver = true; state.running = false; state.paused = false; stopMusic();
    if (state.score > best) { best = Math.floor(state.score); localStorage.setItem(BEST_KEY, String(best)); }
    updateHUD(); postScore('game_over'); sfx('gameover');
    showPanel('Game Over', `${text}\nScore: ${Math.floor(state.score)} • Best: ${best}\nTap Start to try again.`);
  }
  function togglePause() {
    if (!state.running || state.gameOver) return;
    state.paused = !state.paused;
    if (state.paused) { stopMusic(); showPanel('Paused', 'Tap Start or Pause to continue.\n\nDrag to steer and tap to dash.'); }
    else { hidePanel(); startMusic(); }
  }
  function showPanel(title, text) { if (panelTitle) panelTitle.textContent = title; if (panelText) panelText.textContent = text; if (panel) panel.style.display = 'flex'; }
  function hidePanel() { if (panel) panel.style.display = 'none'; }
  function updateHUD() {
    if (elScore) elScore.textContent = String(Math.floor(state.score));
    if (elBest) elBest.textContent = String(best);
    if (elLives) elLives.textContent = String(state.lives);
    if (elDashFill) elDashFill.style.width = `${Math.round(player.dash * 100)}%`;
    if (elDashLabel) elDashLabel.textContent = `${Math.round(player.dash * 100)}%`;
    const comboPct = Math.max(0, Math.min(100, (state.comboTimer / 4) * 100));
    if (elComboFill) elComboFill.style.width = `${comboPct}%`;
    if (elComboLabel) elComboLabel.textContent = `x${state.combo}`;
    postScore('live');
  }

  function addParticles(x, y, color, count = 12, speed = 180) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2; const s = speed * (0.3 + Math.random() * 0.9);
      state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1.8 + Math.random() * 3.5, age: 0, life: 0.35 + Math.random() * 0.45, color });
    }
  }
  function addFloater(x, y, text, color = '#fff') { state.floaters.push({ x, y, text, color, age: 0, life: 0.9, vy: -28 - Math.random() * 14 }); }

  function spawnAsteroid() {
    const edge = Math.random();
    const size = 22 + Math.random() * 34;
    const baseSpeed = 110 + Math.min(240, state.distance * 0.018);
    let x, y, vx, vy;
    if (edge < 0.55) {
      x = Math.random() * CW; y = -60; vx = (Math.random() - 0.5) * 90; vy = baseSpeed * (0.85 + Math.random() * 0.5);
    } else if (edge < 0.78) {
      x = -60; y = Math.random() * CH * 0.65; vx = baseSpeed * (0.55 + Math.random() * 0.45); vy = baseSpeed * (0.12 + Math.random() * 0.25);
    } else {
      x = CW + 60; y = Math.random() * CH * 0.65; vx = -baseSpeed * (0.55 + Math.random() * 0.45); vy = baseSpeed * (0.12 + Math.random() * 0.25);
    }
    state.asteroids.push({ x, y, vx, vy, r: size, rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 2.6, hp: 1 });
  }
  function spawnCrystal() {
    state.crystals.push({ x: 40 + Math.random() * (CW - 80), y: -30, vy: 100 + Math.random() * 100, r: 18 + Math.random() * 6, rot: Math.random() * Math.PI * 2, vr: 1.8 + Math.random() * 1.6 });
  }
  function spawnPickup() {
    const kind = Math.random() < 0.55 ? 'shield' : 'time';
    state.pickups.push({ kind, x: 40 + Math.random() * (CW - 80), y: -40, vy: 90 + Math.random() * 70, r: 20, rot: Math.random() * Math.PI * 2, vr: 1.5 + Math.random() });
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hitCircle(ax, ay, ar, bx, by, br) { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy <= (ar + br) * (ar + br); }

  function dashToward(tx, ty) {
    if (!state.running || state.paused || state.gameOver || player.dash < 0.35) return;
    const dx = tx - player.x, dy = ty - player.y; const len = Math.hypot(dx, dy) || 1;
    player.vx += dx / len * 540; player.vy += dy / len * 540; player.dirX = dx / len; player.dirY = dy / len;
    player.invuln = 0.28; player.dash = Math.max(0, player.dash - 0.38); state.shake = 6; sfx('dash');
    addParticles(player.x, player.y + 8, 'rgba(124,92,255,.9)', 16, 260);
  }

  function canvasPoint(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  canvas.addEventListener('pointerdown', (e) => {
    ensureAudio(); canvas.setPointerCapture?.(e.pointerId); const p = canvasPoint(e);
    pointer.down = true; pointer.id = e.pointerId; pointer.x = p.x; pointer.y = p.y; pointer.startX = p.x; pointer.startY = p.y; pointer.tDown = performance.now();
    if (!state.running && !state.gameOver) { startGame(); }
    else if (state.gameOver) { resetGame(); startGame(); }
    else if (state.paused) { state.paused = false; hidePanel(); startMusic(); }
  }, { passive: true });
  canvas.addEventListener('pointermove', (e) => { if (!pointer.down || pointer.id !== e.pointerId) return; const p = canvasPoint(e); pointer.x = p.x; pointer.y = p.y; }, { passive: true });
  function onPointerUp(e) {
    if (!pointer.down || (e && pointer.id !== e.pointerId)) return;
    const p = e ? canvasPoint(e) : { x: pointer.x, y: pointer.y };
    const dt = performance.now() - pointer.tDown, dx = p.x - pointer.startX, dy = p.y - pointer.startY;
    if (dt < 180 && dx * dx + dy * dy < 18 * 18) dashToward(p.x, p.y);
    pointer.down = false; pointer.id = null;
  }
  canvas.addEventListener('pointerup', onPointerUp, { passive: true });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: true });
  canvas.addEventListener('pointerleave', onPointerUp, { passive: true });
  window.addEventListener('keydown', (e) => {
    keys.add(e.key);
    if ((e.key === 'p' || e.key === 'P')) togglePause();
    if ((e.key === 'r' || e.key === 'R')) { resetGame(); startGame(); }
    if (e.key === ' ' && state.running && !state.paused) dashToward(player.x + player.dirX * 100, player.y + player.dirY * 100);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key));

  btnStart.onclick = () => { ensureAudio(); if (state.gameOver) resetGame(); if (!state.running || state.paused || state.gameOver) startGame(); };
  btnOverlay.onclick = () => { state.paused = true; stopMusic(); showPanel('How to play', 'Drag to move your ship across the arena.\nTap for a dash burst.\nCollect green crystals for score.\nCollect blue shield pickups for extra protection.\nCollect golden time pickups to slow the field.\nAvoid asteroids — each hit costs one shield.'); };
  btnPause.onclick = () => togglePause();
  btnRestart.onclick = () => { resetGame(); startGame(); };
  btnSubmit.onclick = () => postScore('manual_submit');
  btnMute.onclick = () => { muted = !muted; btnMute.textContent = muted ? 'Muted' : 'Sound'; if (muted) stopMusic(); else if (state.running && !state.paused) startMusic(); };

  window.addEventListener('message', (ev) => {
    const data = ev.data || {}; const type = data.type || data.event;
    if (type === 'GG_PAUSE') { state.paused = !!(data.payload?.paused ?? data.paused); if (state.paused) stopMusic(); else if (state.running) startMusic(); }
    if (type === 'GG_MUTE') { muted = !!(data.payload?.muted ?? data.muted); btnMute.textContent = muted ? 'Muted' : 'Sound'; if (muted) stopMusic(); }
    if (type === 'GG_RESTART') { resetGame(); startGame(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { state.paused = true; stopMusic(); } });

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000); last = now;
    step(dt); draw(); requestAnimationFrame(loop);
  }

  function step(dt) {
    // update ambient items even when paused a bit? not necessary
    if (!state.running || state.paused || state.gameOver) return;

    state.distance += dt * 100;
    state.score += dt * 10 + state.combo * 0.15;
    if (state.score > best) { best = Math.floor(state.score); localStorage.setItem(BEST_KEY, String(best)); }

    if (state.comboTimer > 0) state.comboTimer -= dt; else state.combo = 1;
    if (state.slowTimer > 0) state.slowTimer -= dt;
    player.invuln = Math.max(0, player.invuln - dt);
    player.dash = Math.min(1, player.dash + dt * 0.17);
    state.shake = Math.max(0, state.shake - dt * 20);

    const speedFactor = state.slowTimer > 0 ? 0.58 : 1;

    // movement
    let tx = player.x, ty = player.y;
    const ax = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
    const ay = (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
    if (pointer.down) { tx = pointer.x; ty = pointer.y; }
    else if (ax || ay) { tx = player.x + ax * 120; ty = player.y + ay * 120; }
    const dx = tx - player.x, dy = ty - player.y;
    player.vx += dx * 18 * dt; player.vy += dy * 18 * dt;
    player.vx *= Math.pow(0.0025, dt); player.vy *= Math.pow(0.0025, dt);
    player.x += player.vx * dt; player.y += player.vy * dt;
    const vlen = Math.hypot(player.vx, player.vy);
    if (vlen > 10) { player.dirX = player.vx / vlen; player.dirY = player.vy / vlen; }
    player.x = clamp(player.x, player.r + 8, CW - player.r - 8);
    player.y = clamp(player.y, player.r + 8, CH - player.r - 8);
    player.trail.push({ x: player.x, y: player.y, age: 0, life: 0.34, dash: player.invuln > 0 });
    for (let i = player.trail.length - 1; i >= 0; i--) { player.trail[i].age += dt; if (player.trail[i].age > player.trail[i].life) player.trail.splice(i, 1); }

    // spawns
    const asteroidEvery = Math.max(0.23, 0.78 - state.distance * 0.0009);
    state.asteroidTimer -= dt;
    if (state.asteroidTimer <= 0) {
      spawnAsteroid();
      if (state.distance > 900 && Math.random() < 0.24) spawnAsteroid();
      state.asteroidTimer = asteroidEvery;
    }
    state.crystalTimer -= dt;
    if (state.crystalTimer <= 0) { spawnCrystal(); if (Math.random() < 0.22) spawnCrystal(); state.crystalTimer = 0.9 + Math.random() * 0.8; }
    state.pickupTimer -= dt;
    if (state.pickupTimer <= 0) { spawnPickup(); state.pickupTimer = 7 + Math.random() * 5; }

    // background stars
    state.bgScroll1 += dt * 18; state.bgScroll2 += dt * 34;
    for (const s of state.stars) { s.y += s.s * dt * speedFactor; if (s.y > CH + 10) { s.y = -10; s.x = Math.random() * CW; } }

    // update asteroids
    for (let i = state.asteroids.length - 1; i >= 0; i--) {
      const a = state.asteroids[i];
      a.x += a.vx * dt * speedFactor; a.y += a.vy * dt * speedFactor; a.rot += a.vr * dt;
      const dist = Math.hypot(player.x - a.x, player.y - a.y);
      if (!state.nearMissMarks.has(a) && dist < a.r + player.r + 20 && dist > a.r + player.r + 5 && player.invuln <= 0) {
        state.nearMissMarks.add(a); state.score += 8 * state.combo; addFloater(a.x, a.y - a.r, 'Near Miss!', '#ffe08a'); sfx('near');
      }
      if (player.invuln <= 0 && hitCircle(player.x, player.y, player.r * 0.74, a.x, a.y, a.r * 0.75)) {
        state.lives -= 1; player.invuln = 0.9; player.dash = Math.min(1, player.dash + 0.25); state.combo = 1; state.comboTimer = 0; state.shake = 9;
        addParticles(a.x, a.y, 'rgba(255,110,70,.92)', 28, 260); addFloater(player.x, player.y - 24, '-1 Shield', '#ff7a9c'); sfx('hit');
        state.asteroids.splice(i, 1);
        if (state.lives <= 0) { endGame('Your ship was destroyed!'); return; }
        continue;
      }
      if (a.y > CH + 100 || a.x < -120 || a.x > CW + 120) state.asteroids.splice(i, 1);
    }

    // update crystals
    for (let i = state.crystals.length - 1; i >= 0; i--) {
      const c = state.crystals[i]; c.y += c.vy * dt * speedFactor; c.rot += c.vr * dt;
      if (hitCircle(player.x, player.y, player.r * 0.8, c.x, c.y, c.r * 0.65)) {
        state.crystals.splice(i, 1); state.combo = Math.min(12, state.combo + 1); state.comboTimer = 4; state.score += 35 * state.combo; player.dash = Math.min(1, player.dash + 0.08);
        addParticles(c.x, c.y, 'rgba(90,255,170,.95)', 18, 180); addFloater(c.x, c.y, `+${35 * state.combo}`, '#8dffcc'); sfx('crystal'); continue;
      }
      if (c.y > CH + 60) state.crystals.splice(i, 1);
    }

    // update pickups
    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const p = state.pickups[i]; p.y += p.vy * dt * speedFactor; p.rot += p.vr * dt;
      if (hitCircle(player.x, player.y, player.r * 0.8, p.x, p.y, p.r * 0.7)) {
        state.pickups.splice(i, 1);
        if (p.kind === 'shield') { state.lives = Math.min(5, state.lives + 1); addFloater(p.x, p.y, '+Shield', '#93c5fd'); }
        else { state.slowTimer = 5.5; addFloater(p.x, p.y, 'Slow Time', '#ffe08a'); }
        player.dash = Math.min(1, player.dash + 0.18); addParticles(p.x, p.y, p.kind === 'shield' ? 'rgba(120,190,255,.95)' : 'rgba(255,220,110,.95)', 22, 180); sfx('pickup'); continue;
      }
      if (p.y > CH + 80) state.pickups.splice(i, 1);
    }

    // particles and floaters
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i]; p.age += dt; if (p.age >= p.life) { state.particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt;
    }
    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const f = state.floaters[i]; f.age += dt; if (f.age >= f.life) { state.floaters.splice(i, 1); continue; } f.y += f.vy * dt; }

    updateHUD();
  }

  function draw() {
    const shakeX = state.shake > 0 ? (Math.random() * 2 - 1) * state.shake : 0;
    const shakeY = state.shake > 0 ? (Math.random() * 2 - 1) * state.shake : 0;
    ctx.save(); ctx.translate(shakeX, shakeY);

    // Background layer 1
    ctx.fillStyle = '#050814'; ctx.fillRect(0, 0, CW, CH);
    if (images.bg1) {
      drawCoverTiled(images.bg1, state.bgScroll1 * 0.2, state.bgScroll1 * 0.5, 0.54);
    }
    if (images.bg2) {
      drawCoverTiled(images.bg2, -state.bgScroll2 * 0.25, state.bgScroll2 * 0.9, 0.38);
    }

    // starfield
    for (const s of state.stars) {
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // lane light rays
    const g = ctx.createLinearGradient(CW * 0.5, 0, CW * 0.5, CH);
    g.addColorStop(0, 'rgba(35,194,255,.12)'); g.addColorStop(.4, 'rgba(124,92,255,.04)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(CW * 0.25, 0, CW * 0.5, CH);

    // items sorted by y for depth feel
    const drawList = [];
    for (const a of state.asteroids) drawList.push({ type: 'asteroid', y: a.y, obj: a });
    for (const c of state.crystals) drawList.push({ type: 'crystal', y: c.y, obj: c });
    for (const p of state.pickups) drawList.push({ type: 'pickup', y: p.y, obj: p });
    drawList.sort((A, B) => A.y - B.y);
    for (const item of drawList) {
      if (item.type === 'asteroid') drawAsteroid(item.obj);
      else if (item.type === 'crystal') drawCrystal(item.obj);
      else drawPickup(item.obj);
    }

    // player trail
    for (const t of player.trail) {
      const a = 1 - t.age / t.life; const r = player.r * (0.45 + a * 0.5);
      ctx.save(); ctx.globalAlpha = a * (t.dash ? 0.75 : 0.35); ctx.fillStyle = t.dash ? 'rgba(124,92,255,.9)' : 'rgba(35,194,255,.55)';
      ctx.beginPath(); ctx.ellipse(t.x, t.y + 8, r * 0.65, r, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    drawShip();

    // invuln bubble
    if (player.invuln > 0) {
      ctx.save(); ctx.strokeStyle = 'rgba(120,190,255,.8)'; ctx.lineWidth = 2.5; ctx.shadowColor = 'rgba(120,190,255,.8)'; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(player.x, player.y, player.r + 10 + Math.sin(performance.now() * 0.015) * 1.5, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }

    // slow time vignette
    if (state.slowTimer > 0) {
      ctx.fillStyle = `rgba(255,220,110,${0.04 + Math.sin(performance.now() * 0.01) * 0.02})`;
      ctx.fillRect(0, 0, CW, CH);
    }

    // particles
    for (const p of state.particles) {
      const a = 1 - p.age / p.life; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    // floaters
    for (const f of state.floaters) {
      const a = 1 - f.age / f.life; ctx.save(); ctx.globalAlpha = a; ctx.font = '900 16px system-ui'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.strokeText(f.text, f.x, f.y); ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y); ctx.restore();
    }

    ctx.restore();
  }

  function drawCoverTiled(img, ox, oy, alpha = 1) {
    const iw = img.width, ih = img.height; if (!iw || !ih) return;
    const scale = Math.max(CW / iw, CH / ih) * 1.12;
    const dw = iw * scale, dh = ih * scale;
    const startX = -((ox % dw) + dw) % dw - dw;
    const startY = -((oy % dh) + dh) % dh - dh;
    ctx.save(); ctx.globalAlpha = alpha;
    for (let x = startX; x < CW + dw; x += dw) {
      for (let y = startY; y < CH + dh; y += dh) ctx.drawImage(img, x, y, dw, dh);
    }
    ctx.restore();
  }

  function drawAsteroid(a) {
    const scale = 0.68 + (a.y / CH) * 0.72;
    const size = a.r * scale;
    ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
    ctx.shadowColor = 'rgba(255,110,70,.38)'; ctx.shadowBlur = 16 * scale;
    if (images.asteroid) ctx.drawImage(images.asteroid, -size, -size, size * 2, size * 2);
    else {
      ctx.fillStyle = '#7a6670'; ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  function drawCrystal(c) {
    const scale = 0.65 + (c.y / CH) * 0.55;
    const size = c.r * 2.2 * scale;
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
    ctx.shadowColor = 'rgba(100,255,170,.9)'; ctx.shadowBlur = 18;
    if (images.crystal) ctx.drawImage(images.crystal, -size / 2, -size / 2, size, size);
    else { ctx.fillStyle = '#63ffa8'; ctx.fillRect(-10, -10, 20, 20); }
    ctx.restore();
  }
  function drawPickup(p) {
    const scale = 0.72 + (p.y / CH) * 0.48; const size = p.r * 2.2 * scale;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.shadowColor = p.kind === 'shield' ? 'rgba(120,190,255,.9)' : 'rgba(255,220,110,.9)'; ctx.shadowBlur = 18;
    const img = p.kind === 'shield' ? images.shield : images.time;
    if (img) ctx.drawImage(img, -size / 2, -size / 2, size, size);
    else { ctx.fillStyle = p.kind === 'shield' ? '#93c5fd' : '#fde047'; ctx.beginPath(); ctx.arc(0, 0, size / 2, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  function drawShip() {
    const ang = Math.atan2(player.dirY, player.dirX) + Math.PI / 2;
    const bob = Math.sin(performance.now() * 0.01) * 2.5;
    ctx.save(); ctx.translate(player.x, player.y + bob); ctx.rotate(ang);
    if (Math.hypot(player.vx, player.vy) > 30) {
      ctx.save(); ctx.shadowColor = 'rgba(255,180,60,.85)'; ctx.shadowBlur = 18; ctx.fillStyle = 'rgba(255,180,60,.85)';
      ctx.beginPath(); ctx.moveTo(-10, 22); ctx.lineTo(0, 42 + Math.random() * 8); ctx.lineTo(10, 22); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-18, 16); ctx.lineTo(-9, 34 + Math.random() * 5); ctx.lineTo(-2, 15); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(18, 16); ctx.lineTo(9, 34 + Math.random() * 5); ctx.lineTo(2, 15); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.shadowColor = player.invuln > 0 ? 'rgba(124,92,255,.95)' : 'rgba(35,194,255,.95)'; ctx.shadowBlur = 24;
    if (images.ship) ctx.drawImage(images.ship, -player.r * 1.55, -player.r * 1.72, player.r * 3.1, player.r * 3.4);
    else {
      ctx.fillStyle = '#23c2ff'; ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(20, 28); ctx.lineTo(0, 14); ctx.lineTo(-20, 28); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  resetGame();
  requestAnimationFrame(loop);
})();
