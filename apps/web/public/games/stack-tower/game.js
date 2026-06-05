(() => {
  'use strict';

  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!canvas || !ctx) return;

  const $ = (id) => document.getElementById(id);
  const elHeight = $('height');
  const elScore = $('score');
  const elCombo = $('combo');
  const elBest = $('best');
  const elFocusFill = $('focusFill');
  const elFocusLabel = $('focusLabel');
  const elPrecisionFill = $('precisionFill');
  const elPrecisionLabel = $('precisionLabel');
  const elTitle = $('ggTitle');
  const elSub = $('ggSub');

  const panel = $('panel');
  const panelTitle = $('panelTitle');
  const panelText = $('panelText');
  const btnStart = $('btnStart');
  const btnOverlay = $('btnOverlay');
  const btnPause = $('btnPause');
  const btnDrop = $('btnDrop');
  const btnSubmit = $('btnSubmit');
  const btnRestart = $('btnRestart');
  const btnMute = $('btnMute');

  const GAME_SLUG = 'stack-tower';
  const BEST_KEY = 'wga_stack_tower_best_v2';

  let META = { title: 'Stack Tower', description: '' };
  async function loadMeta() {
    try {
      const res = await fetch('./game.json', { cache: 'no-store' });
      META = (await res.json()) || META;
      const title = META.title || 'Stack Tower';
      document.title = title;
      if (elTitle) elTitle.textContent = title;
      if (panelTitle) panelTitle.textContent = title;
      if (META.description && panelText) panelText.textContent = META.description;
      if (elSub) elSub.textContent = 'Tap to drop • Perfect stacks charge Focus Mode';
      try { window.GG?.init?.({ title }); } catch {}
      try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    } catch {}
  }
  loadMeta();

  let CW = 360, CH = 640, DPR = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    CW = Math.max(1, Math.floor(rect.width || window.innerWidth));
    CH = Math.max(1, Math.floor(rect.height || window.innerHeight));
    canvas.width = Math.floor(CW * DPR);
    canvas.height = Math.floor(CH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!state.running) {
      positionBase();
      updateCamera(true);
    }
  }
  requestAnimationFrame(() => {
    resize();
    window.addEventListener('resize', resize, { passive: true });
  });

  const images = {};
  const assetPaths = {
    bg1: './assets/backgrounds/bg-tower-city.png',
    bg2: './assets/backgrounds/bg-tower-city-alt.png',
    emerald: './assets/blocks/block-emerald.png',
    blue: './assets/blocks/block-blue.png',
    purple: './assets/blocks/block-purple.png',
    gold: './assets/blocks/block-gold.png',
    red: './assets/blocks/block-red.png',
    perfect: './assets/ui/perfect-badge.png',
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
    const ac = ensureAudio();
    if (!ac || muted) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master || ac.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }
  function noise(dur = 0.12, gain = 0.04) {
    const ac = ensureAudio();
    if (!ac || muted) return;
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource();
    const g = ac.createGain();
    src.buffer = buf;
    g.gain.value = gain;
    src.connect(g); g.connect(master || ac.destination);
    src.start(); src.stop(ac.currentTime + dur);
  }
  function sfx(name) {
    if (name === 'start') { tone(330,.05,'triangle',.05); tone(520,.06,'triangle',.04,.05); return; }
    if (name === 'drop') { tone(320,.045,'triangle',.042); return; }
    if (name === 'land') { tone(180,.055,'triangle',.042); tone(260,.05,'sine',.03,.02); return; }
    if (name === 'perfect') { tone(620,.05,'triangle',.055); tone(930,.06,'triangle',.045,.04); tone(1240,.08,'sine',.035,.08); return; }
    if (name === 'focus') { tone(280,.07,'sawtooth',.045); tone(740,.12,'triangle',.05,.05); return; }
    if (name === 'miss') { noise(.18,.07); tone(110,.18,'sawtooth',.055); return; }
    if (name === 'gameover') { tone(220,.12,'sawtooth',.055); tone(155,.16,'sine',.045,.10); tone(105,.20,'sine',.038,.24); return; }
  }
  function musicTick() {
    if (!state.running || state.paused || muted) return;
    const notes = [147, 196, 247, 294, 247, 196, 220, 294];
    const n = notes[musicStep++ % notes.length];
    tone(n, .11, 'triangle', .010);
    if (musicStep % 2 === 0) tone(n * 2, .06, 'sine', .007, .03);
  }
  function startMusic() { if (!musicTimer && !muted) musicTimer = setInterval(musicTick, 250); }
  function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; }

  // GG score bridge
  let lastLiveScore = -1, lastLiveAt = 0;
  function postScore(mode = 'live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now - lastLiveAt < 140) return;
    if (mode === 'live' && now - lastLiveAt < 90) return;
    lastLiveScore = clean;
    lastLiveAt = now;
    const payload = {
      gameSlug: GAME_SLUG,
      slug: GAME_SLUG,
      score: clean,
      best: state.best,
      height: state.height,
      combo: state.combo,
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

  const TEXTURES = ['emerald', 'blue', 'purple', 'gold', 'red'];
  const FACE_COLORS = [
    ['#22c55e', '#12843e', '#0a5e2b'],
    ['#3b82f6', '#1e4ed8', '#17359b'],
    ['#a855f7', '#6d28d9', '#4c1d95'],
    ['#facc15', '#b77905', '#7a4b00'],
    ['#f43f5e', '#be123c', '#7f1d1d'],
  ];
  const BLOCK_H = 30;
  const BLOCK_D = 20;
  const GAP = 0;
  const MIN_W = 34;

  const state = {
    running: false,
    paused: false,
    gameOver: false,
    height: 0,
    combo: 0,
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    camY: 0,
    targetCamY: 0,
    stack: [],
    current: null,
    falling: [],
    particles: [],
    floaters: [],
    focus: 0,
    focusTimer: 0,
    precision: 0,
    shake: 0,
    bgShift: 0,
  };

  function cw() { return CW || 360; }
  function ch() { return CH || 640; }

  function positionBase() {
    const baseY = ch() * 0.80;
    const baseW = Math.min(280, Math.max(190, cw() * 0.56));
    state.stack = [{
      x: cw() * 0.5,
      y: baseY,
      w: baseW,
      h: BLOCK_H + 6,
      d: BLOCK_D + 4,
      colorIdx: 1,
      texture: 'blue',
      base: true,
    }];
  }

  function updateHUD() {
    if (elHeight) elHeight.textContent = String(state.height | 0);
    if (elScore) elScore.textContent = String(Math.floor(state.score));
    if (elCombo) elCombo.textContent = String(state.combo | 0);
    if (elBest) elBest.textContent = String(state.best | 0);
    if (elFocusFill) elFocusFill.style.width = `${Math.round((state.focusTimer > 0 ? 1 : state.focus) * 100)}%`;
    if (elFocusLabel) elFocusLabel.textContent = state.focusTimer > 0 ? 'ACTIVE' : `${Math.round(state.focus * 100)}%`;
    if (elPrecisionFill) elPrecisionFill.style.width = `${Math.round(state.precision * 100)}%`;
    if (elPrecisionLabel) elPrecisionLabel.textContent = state.precision >= 0.92 ? 'Perfect!' : state.precision >= 0.72 ? 'Close' : 'Ready';
    postScore('live');
  }

  function showPanel(title, text) {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (panel) panel.style.display = 'flex';
  }
  function hidePanel() {
    if (panel) panel.style.display = 'none';
  }

  function resetGame() {
    state.running = false;
    state.paused = false;
    state.gameOver = false;
    state.height = 0;
    state.combo = 0;
    state.score = 0;
    state.camY = 0;
    state.targetCamY = 0;
    state.falling = [];
    state.particles = [];
    state.floaters = [];
    state.focus = 0;
    state.focusTimer = 0;
    state.precision = 0;
    state.shake = 0;
    lastLiveScore = -1;
    positionBase();
    spawnNextBlock();
    updateCamera(true);
    updateHUD();
    showPanel(META.title || 'Stack Tower', META.description || 'Tap to drop blocks. Perfect stacks build combo points.');
  }

  function startGame() {
    state.running = true;
    state.paused = false;
    state.gameOver = false;
    hidePanel();
    ensureAudio();
    sfx('start');
    startMusic();
  }

  function togglePause() {
    if (!state.running || state.gameOver) return;
    state.paused = !state.paused;
    if (state.paused) {
      stopMusic();
      showPanel('Paused', 'Tap Start or Pause to continue.');
    } else {
      hidePanel();
      startMusic();
    }
  }

  function endGame(reason) {
    if (state.gameOver) return;
    state.gameOver = true;
    state.running = false;
    state.paused = false;
    stopMusic();
    if (state.height > state.best) {
      state.best = state.height;
      localStorage.setItem(BEST_KEY, String(state.best));
    }
    updateHUD();
    postScore('game_over');
    sfx('gameover');
    showPanel('Game Over', `${reason}\n\nHeight: ${state.height} • Score: ${Math.floor(state.score)} • Best: ${state.best}\nTap Start to try again.`);
  }

  function updateCamera(immediate = false) {
    const cur = state.current || state.stack[state.stack.length - 1];
    if (!cur) return;
    state.targetCamY = ch() * 0.42 - cur.y;
    if (immediate) state.camY = state.targetCamY;
  }

  function spawnNextBlock() {
    const top = state.stack[state.stack.length - 1];
    const w = Math.max(MIN_W, top.w);
    const y = top.y - (BLOCK_H + GAP);
    const fromLeft = state.height % 2 === 0;
    const speedBase = 175 + Math.min(260, state.height * 10) + Math.min(110, state.combo * 7);
    const speed = speedBase * (state.focusTimer > 0 ? 0.62 : 1);
    const x = fromLeft ? -w * 0.65 : cw() + w * 0.65;
    const colorIdx = (state.height + state.combo) % TEXTURES.length;
    state.current = {
      x, y, w, h: BLOCK_H, d: BLOCK_D,
      vx: fromLeft ? speed : -speed,
      colorIdx,
      texture: TEXTURES[colorIdx],
      phase: Math.random() * Math.PI * 2,
    };
    updateCamera();
  }

  function dropBlock() {
    if (!state.running || state.paused || state.gameOver || !state.current) return;
    ensureAudio();
    const cur = state.current;
    const top = state.stack[state.stack.length - 1];

    const curL = cur.x - cur.w / 2;
    const curR = cur.x + cur.w / 2;
    const topL = top.x - top.w / 2;
    const topR = top.x + top.w / 2;
    const overlapL = Math.max(curL, topL);
    const overlapR = Math.min(curR, topR);
    const overlap = overlapR - overlapL;

    sfx('drop');

    if (overlap <= 4) {
      createFalling(cur.x, cur.y, cur.w, cur.h, cur.d, cur.colorIdx, cur.texture, cur.vx * 0.25);
      state.current = null;
      state.shake = 10;
      endGame('The block missed the tower!');
      return;
    }

    const offset = cur.x - top.x;
    const perfectThreshold = Math.max(6, Math.min(15, 10 + state.combo * 0.25));
    const perfect = Math.abs(offset) <= perfectThreshold;
    let newW = overlap;
    let newX = (overlapL + overlapR) / 2;

    if (perfect) {
      newW = Math.min(top.w + 2, Math.min(300, cw() * 0.62));
      newX = top.x;
      state.combo += 1;
      state.focus = Math.min(1, state.focus + 0.16);
      state.precision = 1;
      state.score += 100 + state.combo * 35;
      state.shake = 4;
      createBurst(newX, cur.y - 8, 'rgba(250,204,21,.95)', 30);
      addFloater(newX, cur.y - 36, `PERFECT x${state.combo}`, '#ffe08a', 24);
      sfx('perfect');
      if (state.focus >= 1 && state.focusTimer <= 0) {
        state.focusTimer = 6.5;
        state.focus = 0;
        addFloater(cw() * 0.5, cur.y - 70, 'FOCUS MODE', '#9cfffb', 28);
        sfx('focus');
      }
    } else {
      state.combo = 0;
      state.precision = Math.max(0, 1 - Math.abs(offset) / Math.max(1, top.w * 0.5));
      state.score += 70 + Math.round(state.precision * 45);
      sfx('land');

      // falling cut piece
      if (curR > topR) {
        const cutW = curR - topR;
        if (cutW > 2) createFalling(topR + cutW / 2, cur.y, cutW, cur.h, cur.d, cur.colorIdx, cur.texture, 60);
      } else if (curL < topL) {
        const cutW = topL - curL;
        if (cutW > 2) createFalling(topL - cutW / 2, cur.y, cutW, cur.h, cur.d, cur.colorIdx, cur.texture, -60);
      }
    }

    const settled = {
      x: newX,
      y: cur.y,
      w: newW,
      h: cur.h,
      d: cur.d,
      colorIdx: cur.colorIdx,
      texture: cur.texture,
      just: 0.16,
    };
    state.stack.push(settled);
    state.height += 1;
    state.score += 15 * state.height;
    createBurst(newX, cur.y + 8, perfect ? 'rgba(250,204,21,.72)' : 'rgba(255,255,255,.35)', perfect ? 14 : 8);
    state.current = null;

    if (newW < MIN_W) {
      endGame('The tower became too narrow!');
      return;
    }

    spawnNextBlock();
    updateHUD();
  }

  function createFalling(x, y, w, h, d, colorIdx, texture, vx) {
    state.falling.push({
      x, y, w, h, d, colorIdx, texture,
      vx: vx + (Math.random() - 0.5) * 80,
      vy: -80 - Math.random() * 90,
      rot: 0,
      vr: (Math.random() - 0.5) * 4,
      life: 2.2,
      age: 0,
    });
  }

  function createBurst(x, y, color, count = 16) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 60 + Math.random() * 220;
      state.particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80,
        r: 1.8 + Math.random() * 4.5, age: 0, life: 0.45 + Math.random() * 0.55, color,
      });
    }
  }

  function addFloater(x, y, text, color = '#fff', size = 18) {
    state.floaters.push({ x, y, text, color, size, age: 0, life: 1.0, vy: -38 - Math.random() * 16 });
  }

  // Input
  function handleDropInteraction(e) {
    e?.preventDefault?.();
    ensureAudio();
    if (!state.running && !state.gameOver) { startGame(); return; }
    if (state.gameOver) { resetGame(); startGame(); return; }
    if (state.paused) { state.paused = false; hidePanel(); startMusic(); return; }
    dropBlock();
  }
  canvas.addEventListener('pointerdown', handleDropInteraction, { passive: false });
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      handleDropInteraction(e);
    }
    if (e.key.toLowerCase() === 'p') togglePause();
    if (e.key.toLowerCase() === 'r') { resetGame(); startGame(); }
  });

  btnStart.onclick = () => {
    ensureAudio();
    if (state.gameOver) resetGame();
    if (!state.running) startGame();
    else if (state.paused) { state.paused = false; hidePanel(); startMusic(); }
    else startGame();
  };
  btnOverlay.onclick = () => {
    state.paused = state.running && !state.gameOver ? true : state.paused;
    stopMusic();
    showPanel('How to play', 'Tap when the moving block lines up with the tower.\n\n• Perfect drops build combo\n• Mistakes cut away the overhang\n• Perfect chains charge Focus Mode\n• Focus Mode slows the next blocks\n• Keep the tower wide and climb higher');
  };
  btnPause.onclick = togglePause;
  btnDrop.onclick = (e) => handleDropInteraction(e);
  btnRestart.onclick = () => { resetGame(); startGame(); };
  btnSubmit.onclick = () => postScore('manual_submit');
  btnMute.onclick = () => { muted = !muted; btnMute.textContent = muted ? 'Muted' : 'Sound'; if (muted) stopMusic(); else if (state.running && !state.paused) startMusic(); };

  window.addEventListener('message', (ev) => {
    const data = ev.data || {};
    const type = data.type || data.event;
    if (type === 'GG_PAUSE') {
      state.paused = !!(data.payload?.paused ?? data.paused);
      if (state.paused) stopMusic(); else if (state.running) startMusic();
    }
    if (type === 'GG_MUTE') {
      muted = !!(data.payload?.muted ?? data.muted);
      btnMute.textContent = muted ? 'Muted' : 'Sound';
      if (muted) stopMusic();
    }
    if (type === 'GG_RESTART') { resetGame(); startGame(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { state.paused = true; stopMusic(); } });

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
    last = now;
    step(dt);
    draw(now);
    requestAnimationFrame(loop);
  }

  function step(dt) {
    if (state.focusTimer > 0) state.focusTimer = Math.max(0, state.focusTimer - dt);
    state.shake = Math.max(0, state.shake - dt * 28);
    state.bgShift += dt * 6;

    if (state.running && !state.paused && !state.gameOver) {
      const cur = state.current;
      if (cur) {
        const slow = state.focusTimer > 0 ? 0.63 : 1;
        cur.x += cur.vx * dt * slow;
        cur.phase += dt * 3;
        const margin = cur.w * 0.55;
        if (cur.x > cw() + margin && cur.vx > 0) cur.vx *= -1;
        if (cur.x < -margin && cur.vx < 0) cur.vx *= -1;
      }
      updateCamera(false);
    }

    state.camY += (state.targetCamY - state.camY) * Math.min(1, dt * 5);

    for (let i = state.falling.length - 1; i >= 0; i--) {
      const f = state.falling[i];
      f.age += dt;
      f.vy += 720 * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.rot += f.vr * dt;
      if (f.age > f.life || f.y + state.camY > ch() + 180) state.falling.splice(i, 1);
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.age += dt;
      if (p.age >= p.life) { state.particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 240 * dt;
    }

    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const f = state.floaters[i];
      f.age += dt;
      if (f.age >= f.life) { state.floaters.splice(i, 1); continue; }
      f.y += f.vy * dt;
    }

    for (const b of state.stack) {
      if (b.just) b.just = Math.max(0, b.just - dt);
    }

    updateHUD();
  }

  function draw(now) {
    const shakeX = state.shake > 0 ? (Math.random() * 2 - 1) * state.shake : 0;
    const shakeY = state.shake > 0 ? (Math.random() * 2 - 1) * state.shake : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    drawBackground();
    drawTowerGuide();

    const blocks = [...state.stack];
    blocks.sort((a, b) => a.y - b.y);
    for (const b of blocks) drawBlock(b, state.camY, 1, 0);

    if (state.current) {
      const bob = Math.sin(state.current.phase) * 2.2;
      drawGhostLanding();
      drawBlock(state.current, state.camY + bob, 1, 0);
      drawDropLaser(state.current);
    }

    for (const f of state.falling) drawBlock(f, state.camY, Math.max(0, 1 - f.age / f.life), f.rot);

    drawParticlesAndFloaters();

    if (state.focusTimer > 0) {
      ctx.fillStyle = `rgba(34,197,94,${0.03 + Math.sin(now * 0.02) * 0.015})`;
      ctx.fillRect(0, 0, cw(), ch());
    }

    ctx.restore();

    if (state.paused && state.running) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      ctx.fillRect(0, 0, cw(), ch());
      ctx.fillStyle = 'rgba(255,255,255,.94)';
      ctx.font = '1000 28px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Paused', cw() * 0.5, ch() * 0.45);
      ctx.font = '800 14px system-ui';
      ctx.fillText('Tap Start or Pause to continue', cw() * 0.5, ch() * 0.50);
      ctx.restore();
    }
  }

  function drawBackground() {
    ctx.fillStyle = '#050814';
    ctx.fillRect(0, 0, cw(), ch());
    if (images.bg1) drawCover(images.bg1, 0, state.camY * 0.08 + state.bgShift * 0.15, 0.66);
    if (images.bg2) drawCover(images.bg2, state.bgShift * 0.05, state.camY * 0.16 + state.bgShift * 0.3, 0.38);

    const grad = ctx.createRadialGradient(cw() * 0.5, ch() * 0.45, 40, cw() * 0.5, ch() * 0.5, Math.max(cw(), ch()) * 0.7);
    grad.addColorStop(0, 'rgba(255,255,255,.04)');
    grad.addColorStop(1, 'rgba(0,0,0,.28)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw(), ch());
  }

  function drawCover(img, ox = 0, oy = 0, alpha = 1) {
    const iw = img.width, ih = img.height;
    const scale = Math.max(cw() / iw, ch() / ih) * 1.05;
    const dw = iw * scale, dh = ih * scale;
    const x = (cw() - dw) / 2 + (ox % 60);
    const y = (ch() - dh) / 2 + ((oy % 80) - 40);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x, y, dw, dh);
    ctx.restore();
  }

  function drawTowerGuide() {
    const top = state.stack[state.stack.length - 1];
    if (!top) return;
    const y = top.y + state.camY - 4;
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.setLineDash([8, 10]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(top.x - top.w / 2, y);
    ctx.lineTo(top.x + top.w / 2, y);
    ctx.stroke();
    ctx.restore();
  }

  function drawGhostLanding() {
    const top = state.stack[state.stack.length - 1];
    const cur = state.current;
    if (!top || !cur) return;
    const curL = cur.x - cur.w / 2, curR = cur.x + cur.w / 2;
    const topL = top.x - top.w / 2, topR = top.x + top.w / 2;
    const overlap = Math.max(0, Math.min(curR, topR) - Math.max(curL, topL));
    state.precision = Math.min(1, overlap / Math.max(1, top.w));

    ctx.save();
    ctx.globalAlpha = 0.22 + state.precision * 0.18;
    ctx.strokeStyle = state.precision > 0.92 ? 'rgba(250,204,21,.95)' : 'rgba(255,255,255,.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const y = top.y + state.camY - BLOCK_H - 4;
    ctx.rect(top.x - overlap / 2, y, overlap, BLOCK_H);
    ctx.stroke();
    ctx.restore();
  }

  function drawDropLaser(cur) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = 'rgba(255,255,255,.8)';
    ctx.setLineDash([5, 8]);
    ctx.beginPath();
    ctx.moveTo(cur.x, 0);
    ctx.lineTo(cur.x, ch());
    ctx.stroke();
    ctx.restore();
  }

  function drawBlock(b, camOffset, alpha = 1, rot = 0) {
    const x = b.x;
    const y = b.y + camOffset;
    const w = b.w;
    const h = b.h;
    const d = b.d;
    if (y > ch() + 120 || y < -200) return;

    const colors = FACE_COLORS[b.colorIdx % FACE_COLORS.length];
    const topCol = colors[0];
    const frontCol = colors[1];
    const sideCol = colors[2];

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot || 0);

    const x0 = -w / 2;
    const x1 = w / 2;

    // Top face
    const topPts = [[x0, 0], [x1, 0], [x1 + d, -d * 0.6], [x0 + d, -d * 0.6]];
    drawPoly(topPts, topCol);
    const tex = images[b.texture];
    if (tex) {
      ctx.save();
      pathPoly(topPts);
      ctx.clip();
      ctx.globalAlpha *= 0.38;
      ctx.drawImage(tex, x0, -d * 0.8, w + d, h + d * 1.1);
      ctx.restore();
    }

    // Front
    drawPoly([[x0, 0], [x1, 0], [x1, h], [x0, h]], frontCol);
    if (tex) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, 0, w, h);
      ctx.clip();
      ctx.globalAlpha *= 0.18;
      ctx.drawImage(tex, x0, 0, w, h);
      ctx.restore();
    }

    // Side
    drawPoly([[x1, 0], [x1 + d, -d * 0.6], [x1 + d, h - d * 0.6], [x1, h]], sideCol);

    // bevel/highlight
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 1.5;
    pathPoly(topPts); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath(); ctx.moveTo(x0, h); ctx.lineTo(x1, h); ctx.stroke();

    if (b.just) {
      ctx.globalAlpha = alpha * (b.just / 0.16) * 0.7;
      ctx.strokeStyle = 'rgba(255,255,255,.95)';
      ctx.lineWidth = 4;
      ctx.strokeRect(x0 - 2, -2, w + 4, h + 4);
    }
    ctx.restore();
  }

  function pathPoly(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }
  function drawPoly(pts, color) {
    pathPoly(pts);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawParticlesAndFloaters() {
    for (const p of state.particles) {
      const a = 1 - p.age / p.life;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y + state.camY, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const f of state.floaters) {
      const a = 1 - f.age / f.life;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = `1000 ${f.size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,.45)';
      ctx.strokeText(f.text, f.x, f.y + state.camY);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y + state.camY);
      ctx.restore();
    }
  }

  resetGame();
  requestAnimationFrame(loop);
})();