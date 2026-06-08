(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const canvas = $('gameCanvas');
  const ctx = canvas.getContext('2d');

  const overlay = $('overlay');
  const overlayTitle = $('overlayTitle');
  const overlayText = $('overlayText');
  const startBtn = $('startBtn');
  const helpBtn = $('helpBtn');

  const pauseBtn = $('pauseBtn');
  const resetShotBtn = $('resetShotBtn');
  const hintBtn = $('hintBtn');
  const submitBtn = $('submitBtn');
  const restartBtn = $('restartBtn');
  const muteBtn = $('muteBtn');

  const angleDownBtn = $('angleDownBtn');
  const angleUpBtn = $('angleUpBtn');
  const powerDownBtn = $('powerDownBtn');
  const powerUpBtn = $('powerUpBtn');
  const launchBtn = $('launchBtn');

  const scoreValue = $('scoreValue');
  const attemptValue = $('attemptValue');
  const energyValue = $('energyValue');
  const bestValue = $('bestValue');
  const levelPill = $('levelPill');
  const missionText = $('missionText');
  const missionPct = $('missionPct');
  const missionFill = $('missionFill');
  const conceptType = $('conceptType');
  const conceptText = $('conceptText');
  const learningTip = $('learningTip');

  const GAME_SLUG = 'physics-force-lab';
  const BEST_KEY = 'gg_physics_force_lab_best_v1';

  const ASSETS = {
    ball: './assets/sprites/force-ball.png',
    target: './assets/sprites/target.png',
    launcher: './assets/sprites/launcher.png',
    gravity: './assets/ui/icon-gravity.png',
    force: './assets/ui/icon-force.png',
    energy: './assets/ui/icon-energy.png',
  };

  const LEVELS = [
    {
      name: 'Gravity Lab',
      concept: 'Gravity',
      background: './assets/backgrounds/bg-gravity-lab.png',
      target: { x: 0.78, y: 0.62, r: 35 },
      gravity: 520, drag: 0.001, wind: 0, bounce: 0.42,
      tip: 'Gravity pulls objects downward. A higher launch angle helps the ball stay in the air longer.',
      mission: 'Hit the target by balancing upward force and gravity.'
    },
    {
      name: 'Playground Slide Lab',
      concept: 'Inclined Planes',
      background: './assets/backgrounds/bg-playground-slide.png',
      target: { x: 0.79, y: 0.48, r: 34 },
      gravity: 540, drag: 0.001, wind: 0, bounce: 0.46,
      ramp: { x1: 0.40, y1: 0.78, x2: 0.60, y2: 0.58 },
      tip: 'A slide is an inclined plane. It changes vertical height into motion along a slope.',
      mission: 'Use the slide ramp to redirect the ball into the target.'
    },
    {
      name: 'Safety Brake Zone',
      concept: 'Friction & Braking',
      background: './assets/backgrounds/bg-safety-brake-zone.png',
      target: { x: 0.73, y: 0.72, r: 36 },
      gravity: 560, drag: 0.004, wind: 0, bounce: 0.30,
      obstacle: { x: 0.42, y: 0.73, w: 0.28, h: 0.05, type: 'rough' },
      tip: 'Braking depends on friction. More friction slows motion faster, which helps vehicles stop safely.',
      mission: 'Cross the high-friction brake zone and stop close enough to the safety target.'
    },
    {
      name: 'Windy Drone Delivery',
      concept: 'Air Resistance & Wind',
      background: './assets/backgrounds/bg-windy-drone-delivery.png',
      target: { x: 0.80, y: 0.50, r: 34, move: { ampY: 0.05, speed: 1.4 } },
      gravity: 500, drag: 0.0015, wind: 38, bounce: 0.38,
      fanZone: { x: 0.42, y: 0.26, w: 0.22, h: 0.26, forceX: 110, forceY: -15 },
      tip: 'Drones must compensate for wind. Air movement changes the path of objects in flight.',
      mission: 'Deliver the package by adjusting for wind and the moving drop target.'
    },
    {
      name: 'Sports Throw Stadium',
      concept: 'Projectile Motion',
      background: './assets/backgrounds/bg-stadium-throw.png',
      target: { x: 0.82, y: 0.39, r: 32 },
      gravity: 620, drag: 0.0009, wind: -25, bounce: 0.34,
      tip: 'A good sports throw uses launch angle and speed to control range and height.',
      mission: 'Throw the force ball in a smooth arc into the stadium target.'
    },
    {
      name: 'Bridge Clearance',
      concept: 'Trajectory Planning',
      background: './assets/backgrounds/bg-bridge-clearance.png',
      target: { x: 0.84, y: 0.42, r: 30 },
      gravity: 610, drag: 0.001, wind: 0, bounce: 0.33,
      obstacle: { x: 0.52, y: 0.58, w: 0.11, h: 0.22, type: 'wall' },
      tip: 'Engineers plan paths and clearances. A projectile must pass above obstacles before landing.',
      mission: 'Clear the bridge support and land in the target.'
    },
    {
      name: 'Magnetic Recycling Sorter',
      concept: 'Magnetism',
      background: './assets/backgrounds/bg-magnetic-recycling.png',
      target: { x: 0.80, y: 0.58, r: 34 },
      gravity: 480, drag: 0.001, wind: 0, bounce: 0.36,
      magnet: { x: 0.58, y: 0.42, strength: 52000 },
      tip: 'Magnetic separators use attraction to pull metals out of mixed material streams.',
      mission: 'Use magnetic attraction to curve the ball toward the recycling target.'
    },
    {
      name: 'Electric Motor Boost',
      concept: 'Electric Energy',
      background: './assets/backgrounds/bg-circuit-room.png',
      target: { x: 0.80, y: 0.62, r: 32 },
      gravity: 500, drag: 0.002, wind: 20, bounce: 0.38,
      chargeZone: { x: 0.50, y: 0.48, r: 58, boost: 1.25 },
      tip: 'Electric motors convert electrical energy into motion. Boost zones add energy to the system.',
      mission: 'Pass through the charge zone to gain enough velocity for the target.'
    },
    {
      name: 'Water Rescue Tank',
      concept: 'Buoyancy & Water Drag',
      background: './assets/backgrounds/bg-water-rescue.png',
      target: { x: 0.78, y: 0.56, r: 35, move: { ampX: 0.04, speed: 1.1 } },
      gravity: 500, drag: 0.001, wind: 0, bounce: 0.24,
      waterZone: { y: 0.68, drag: 0.045, buoyancy: 360 },
      tip: 'Water creates drag and buoyant force. Objects slow down in water and may be pushed upward.',
      mission: 'Send the rescue ball through water drag and reach the floating target.'
    },
    {
      name: 'Springboard Energy',
      concept: 'Elastic Potential Energy',
      background: './assets/backgrounds/bg-springboard-energy.png',
      target: { x: 0.80, y: 0.35, r: 32 },
      gravity: 590, drag: 0.0012, wind: 0, bounce: 0.34,
      springPad: { x: 0.46, y: 0.77, w: 0.17, h: 0.035, boost: 1.28 },
      tip: 'A spring stores elastic potential energy and releases it as kinetic energy.',
      mission: 'Bounce off the spring pad to reach the high target.'
    },
    {
      name: 'Crane Drop Precision',
      concept: 'Precision & Gravity',
      background: './assets/backgrounds/bg-crane-yard.png',
      target: { x: 0.82, y: 0.67, r: 30, move: { ampX: 0.035, speed: 1.2 } },
      gravity: 650, drag: 0.001, wind: 0, bounce: 0.28,
      tip: 'Cranes require precise control. Gravity accelerates objects downward during a drop.',
      mission: 'Control the launch so the ball lands on a moving construction target.'
    },
    {
      name: 'Cargo Ramp Loading',
      concept: 'Work, Force & Ramps',
      background: './assets/backgrounds/bg-cargo-ramp.png',
      target: { x: 0.80, y: 0.46, r: 34 },
      gravity: 560, drag: 0.003, wind: 0, bounce: 0.45,
      ramp: { x1: 0.38, y1: 0.78, x2: 0.63, y2: 0.55 },
      obstacle: { x: 0.42, y: 0.74, w: 0.17, h: 0.04, type: 'rough' },
      tip: 'Ramps reduce the force needed to raise cargo, but friction still resists motion.',
      mission: 'Use the ramp while overcoming friction to load the cargo target.'
    },
    {
      name: 'Bicycle Momentum Track',
      concept: 'Momentum',
      background: './assets/backgrounds/bg-bicycle-momentum.png',
      target: { x: 0.82, y: 0.56, r: 32 },
      gravity: 520, drag: 0.0008, wind: 0, bounce: 0.50,
      springPad: { x: 0.48, y: 0.78, w: 0.16, h: 0.035, boost: 1.12 },
      tip: 'Momentum depends on mass and velocity. More velocity helps carry motion forward.',
      mission: 'Build enough momentum to roll across the track and hit the target.'
    },
    {
      name: 'Solar Boost Station',
      concept: 'Energy Transfer',
      background: './assets/backgrounds/bg-solar-boost.png',
      target: { x: 0.82, y: 0.44, r: 32, move: { ampY: 0.04, speed: 1.3 } },
      gravity: 540, drag: 0.0015, wind: 15, bounce: 0.38,
      chargeZone: { x: 0.53, y: 0.45, r: 62, boost: 1.30 },
      tip: 'Solar energy can be converted into electrical energy, then into motion.',
      mission: 'Use the solar boost zone to reach the moving energy target.'
    },
    {
      name: 'Storm Rescue Mission',
      concept: 'Forces in Weather',
      background: './assets/backgrounds/bg-storm-rescue.png',
      target: { x: 0.82, y: 0.39, r: 30 },
      gravity: 610, drag: 0.0025, wind: -70, bounce: 0.30,
      fanZone: { x: 0.36, y: 0.26, w: 0.30, h: 0.30, forceX: -140, forceY: 20 },
      obstacle: { x: 0.56, y: 0.62, w: 0.10, h: 0.19, type: 'wall' },
      tip: 'Storms add strong external forces. Wind, drag, and barriers must all be considered.',
      mission: 'Rescue the target through storm wind and a blocked path.'
    },
    {
      name: 'Mars Low Gravity Test',
      concept: 'Low Gravity',
      background: './assets/backgrounds/bg-mars-test.png',
      target: { x: 0.82, y: 0.35, r: 32 },
      gravity: 210, drag: 0.0008, wind: 0, bounce: 0.48,
      tip: 'Gravity is weaker on Mars than on Earth, so objects travel farther and stay airborne longer.',
      mission: 'Adjust for low gravity and land the ball in the Mars test target.'
    },
    {
      name: 'Satellite Orbit Ops',
      concept: 'Orbital Motion',
      background: './assets/backgrounds/bg-orbit-space.png',
      target: { x: 0.83, y: 0.52, r: 30, move: { ampY: 0.05, speed: 1.15 } },
      gravity: 120, drag: 0.0002, wind: 0, bounce: 0.20,
      planet: { x: 0.55, y: 0.48, strength: 69000, r: 45 },
      tip: 'Orbit happens when forward motion and inward gravitational pull work together.',
      mission: 'Use the planet’s pull to curve the ball into the moving orbital target.'
    },
    {
      name: 'Physics Boss: Real-World Challenge',
      concept: 'Combined Forces',
      background: './assets/backgrounds/bg-physics-boss.png',
      target: { x: 0.84, y: 0.40, r: 30, move: { ampX: 0.035, ampY: 0.035, speed: 1.35 } },
      gravity: 620, drag: 0.002, wind: -45, bounce: 0.33,
      magnet: { x: 0.58, y: 0.38, strength: 42000 },
      chargeZone: { x: 0.43, y: 0.48, r: 48, boost: 1.18 },
      obstacle: { x: 0.54, y: 0.64, w: 0.10, h: 0.19, type: 'wall' },
      springPad: { x: 0.66, y: 0.79, w: 0.13, h: 0.035, boost: 1.18 },
      tip: 'Real-world motion often combines gravity, drag, wind, magnetism, energy transfer, and collisions.',
      mission: 'Use all physics skills to complete the final real-world challenge.'
    }
  ];

  const images = {};
  function loadImages() {
    const paths = [...new Set([...Object.values(ASSETS), ...LEVELS.map(l => l.background)])];
    return Promise.all(paths.map((src) => new Promise((resolve) => {
      const img = new Image();
      images[src] = img;
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    })));
  }

  const state = {
    running: false,
    paused: false,
    gameOver: false,
    levelClear: false,
    victory: false,
    levelIndex: 0,
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    attempts: 0,
    energy: 100,
    angle: 45,
    power: 68,
    ball: null,
    trail: [],
    particles: [],
    floatTexts: [],
    shake: 0,
    time: 0,
    hintUsed: false,
    launched: false,
    resolving: false
  };

  const currentLevel = () => LEVELS[state.levelIndex];
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const rand = (a,b) => a + Math.random() * (b-a);

  // Audio
  let AC = null, master = null, muted = false, musicHandle = null, musicStep = 0;
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
  function tone(freq, dur = 0.08, type = 'sine', gain = 0.04, delay = 0) {
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
  function noise(dur = 0.09, gain = 0.04) {
    const ac = ensureAudio(); if (!ac || muted) return;
    const b = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = b.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1) * (1 - i/data.length);
    const src = ac.createBufferSource(); const g = ac.createGain();
    src.buffer = b; g.gain.value = gain; src.connect(g); g.connect(master || ac.destination);
    src.start(); src.stop(ac.currentTime + dur);
  }
  function sfx(type) {
    if (type === 'launch') { tone(240,.05,'sawtooth',.035); tone(520,.10,'triangle',.04,.04); return; }
    if (type === 'hit') { tone(680,.05,'triangle',.05); tone(960,.08,'sine',.04,.05); tone(1300,.08,'sine',.03,.10); return; }
    if (type === 'bounce') { noise(.05,.025); tone(180,.04,'sine',.025); return; }
    if (type === 'miss') { tone(180,.12,'sawtooth',.04); return; }
    if (type === 'level') { tone(390,.06,'triangle',.05); tone(650,.08,'triangle',.04,.06); tone(980,.11,'sine',.03,.13); return; }
    if (type === 'power') { tone(480,.05,'triangle',.04); tone(780,.07,'sine',.035,.05); return; }
  }
  function musicTick() {
    if (!state.running || state.paused || muted) return;
    const notes = [147,196,247,294,247,196,220,294];
    const n = notes[musicStep++ % notes.length];
    tone(n,.09,'triangle',.008);
    if (musicStep % 2 === 0) tone(n/2,.12,'sine',.006);
  }
  function startMusic() { if (!musicHandle && !muted) musicHandle = setInterval(musicTick, 260); }
  function stopMusic() { if (musicHandle) clearInterval(musicHandle); musicHandle = null; }

  // Score bridge
  let lastLiveScore = -1, lastLiveAt = 0;
  function postScore(mode = 'live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now - lastLiveAt < 120) return;
    lastLiveScore = clean; lastLiveAt = now;
    const payload = { gameSlug: GAME_SLUG, slug: GAME_SLUG, score: clean, best: state.best, level: state.levelIndex + 1, attempts: state.attempts, mode };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type:'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type:'gg:score', ...payload, payload }, '*'); } catch {}
  }

  function updateBest() {
    if (state.score > state.best) {
      state.best = Math.floor(state.score);
      localStorage.setItem(BEST_KEY, String(state.best));
    }
  }

  function getMetrics() {
    const r = canvas.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }

  function launcherPos() {
    const {w,h} = getMetrics();
    return { x: w * 0.16, y: h * 0.72 };
  }

  function targetScreen() {
    const {w,h} = getMetrics();
    const t = currentLevel().target;
    let tx = t.x;
    let ty = t.y;
    if (t.move) {
      const speed = t.move.speed || 1;
      tx += Math.sin(state.time * speed) * (t.move.ampX || 0);
      ty += Math.cos(state.time * speed * 0.9) * (t.move.ampY || 0);
    }
    return { x: w*tx, y: h*ty, r: t.r };
  }

  function screenPoint(obj) {
    const {w,h} = getMetrics();
    return { x: w*obj.x, y: h*obj.y };
  }

  function resetBall() {
    const pos = launcherPos();
    state.ball = { x: pos.x, y: pos.y, vx: 0, vy: 0, r: 18, moving: false, boosted: false, age: 0 };
    state.trail = [];
    state.launched = false;
    state.resolving = false;
  }

  function progress() {
    return clamp((state.levelIndex + (state.levelClear ? 1 : 0)) / LEVELS.length, 0, 1);
  }

  function updateHUD() {
    scoreValue.textContent = Math.floor(state.score);
    attemptValue.textContent = state.attempts;
    energyValue.textContent = state.energy;
    bestValue.textContent = state.best;
    levelPill.textContent = `Level ${state.levelIndex + 1} • ${currentLevel().name}`;
    missionText.textContent = currentLevel().mission;
    conceptType.textContent = currentLevel().concept;
    conceptText.textContent = `Angle: ${state.angle}° • Power: ${state.power}`;
    learningTip.textContent = currentLevel().tip;
    const pct = Math.round(progress()*100);
    missionPct.textContent = `${pct}%`;
    missionFill.style.width = `${pct}%`;
    const busy = !state.running || state.paused || state.ball?.moving || state.resolving;
    launchBtn.disabled = busy;
    angleUpBtn.disabled = busy;
    angleDownBtn.disabled = busy;
    powerUpBtn.disabled = busy;
    powerDownBtn.disabled = busy;
    postScore('live');
  }

  function showOverlay(title, text, label = 'Start') {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    startBtn.textContent = label;
    overlay.classList.remove('hidden');
  }
  function hideOverlay() { overlay.classList.add('hidden'); }

  function resetLevel() {
    state.running = false;
    state.paused = false;
    state.gameOver = false;
    state.levelClear = false;
    state.victory = false;
    state.attempts = 0;
    state.energy = 100;
    state.angle = 45;
    state.power = 68;
    state.hintUsed = false;
    state.particles = [];
    state.floatTexts = [];
    state.shake = 0;
    resetBall();
    updateHUD();
  }

  function resetGame() {
    state.levelIndex = 0;
    state.score = 0;
    resetLevel();
    showOverlay('Physics Force Lab', 'Launch the force ball into the target.\\n\\nAdjust angle and power, then press Launch. Each level teaches a physics concept such as gravity, friction, projectile motion, magnetism, energy, circuits, and orbit motion.', 'Start');
  }

  function begin() {
    state.running = true;
    state.paused = false;
    state.gameOver = false;
    ensureAudio();
    startMusic();
    hideOverlay();
    updateHUD();
  }

  function nextLevel() {
    if (state.levelIndex >= LEVELS.length - 1) {
      state.running = false;
      state.victory = true;
      stopMusic();
      updateBest();
      postScore('victory');
      showOverlay('Physics Champion!', `You completed all ${LEVELS.length} physics missions.\\n\\nFinal score: ${Math.floor(state.score)}\\nBest score: ${state.best}\\nTap Start to play again.`, 'Play again');
      return;
    }
    state.levelIndex += 1;
    resetLevel();
    showOverlay(`Level ${state.levelIndex + 1}: ${currentLevel().name}`, `${currentLevel().mission}\\n\\n${currentLevel().tip}`, 'Start level');
  }

  function completeLevel() {
    if (state.levelClear || state.victory) return;
    state.levelClear = true;
    state.running = false;
    state.resolving = true;
    stopMusic();
    sfx('level');

    const accuracyBonus = Math.max(0, 450 - state.attempts * 70);
    const energyBonus = state.energy * 4;
    const levelBonus = (state.levelIndex + 1) * 120;
    const gained = accuracyBonus + energyBonus + levelBonus;

    state.score += gained;
    updateBest();
    postScore('level_clear');
    showOverlay('Mission Complete!', `${currentLevel().name} cleared.\\n\\nBonus: +${gained}\\nAttempts: ${state.attempts}\\nEnergy left: ${state.energy}\\nTap Start for the next physics lab.`, 'Next level');
    updateHUD();
  }

  function failRun() {
    state.running = false;
    state.gameOver = true;
    stopMusic();
    updateBest();
    postScore('game_over');
    showOverlay('Lab Run Over', `You ran out of energy.\\n\\nScore: ${Math.floor(state.score)}\\nBest: ${state.best}\\nTap Start to try again.`, 'Restart');
  }

  function launchBall() {
    if (!state.running || state.paused || state.ball?.moving || state.resolving) return;
    state.attempts += 1;
    state.energy = Math.max(0, state.energy - 8);
    const rad = state.angle * Math.PI / 180;
    const speed = state.power * 8.0;
    state.ball.vx = Math.cos(rad) * speed;
    state.ball.vy = -Math.sin(rad) * speed;
    state.ball.moving = true;
    state.ball.age = 0;
    state.ball.boosted = false;
    state.launched = true;
    state.trail = [];
    sfx('launch');
    updateHUD();
  }

  function resetShot() {
    if (state.ball?.moving || state.resolving) return;
    resetBall();
    updateHUD();
  }

  function missShot() {
    if (state.resolving || state.levelClear || state.victory) return;
    state.resolving = true;
    state.ball.moving = false;
    state.shake = 8;
    sfx('miss');
    addFloatText(state.ball.x, state.ball.y - 20, 'Try again', '#ffdfad');
    if (state.energy <= 0) {
      setTimeout(() => failRun(), 650);
    } else {
      setTimeout(() => {
        resetBall();
        updateHUD();
      }, 700);
    }
  }

  function hitTarget() {
    if (state.resolving || state.levelClear || state.victory) return;
    state.resolving = true;
    state.ball.moving = false;
    sfx('hit');
    const t = targetScreen();
    addParticles(t.x, t.y, '#47e78d', 36);
    addFloatText(t.x, t.y - 28, 'Target hit!', '#dfffea');
    setTimeout(() => completeLevel(), 520);
  }

  function addParticles(x,y,color,count=18) {
    for (let i=0;i<count;i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(50, 210);
      state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.45,.85),ttl:.85,size:rand(3,8),color});
    }
  }

  function addFloatText(x,y,text,color) {
    state.floatTexts.push({x,y,text,color,life:1.0,ttl:1.0});
  }

  function applyEnvironment(dt) {
    const level = currentLevel();
    const b = state.ball;
    const {w,h} = getMetrics();

    b.vy += level.gravity * dt;
    b.vx += (level.wind || 0) * dt;

    if (level.fanZone) {
      const fz = rectFromNorm(level.fanZone);
      if (b.x > fz.x && b.x < fz.x + fz.w && b.y > fz.y && b.y < fz.y + fz.h) {
        b.vx += (level.fanZone.forceX || 0) * dt;
        b.vy += (level.fanZone.forceY || 0) * dt;
      }
    }

    if (level.waterZone) {
      const waterY = h * level.waterZone.y;
      if (b.y + b.r > waterY) {
        b.vy -= (level.waterZone.buoyancy || 260) * dt;
        const waterDecay = Math.max(0.72, 1 - (level.waterZone.drag || 0.035) * dt * 60);
        b.vx *= waterDecay;
        b.vy *= waterDecay;
      }
    }

    if (level.magnet) {
      const m = screenPoint(level.magnet);
      const dx = m.x - b.x, dy = m.y - b.y;
      const d2 = Math.max(2400, dx*dx + dy*dy);
      const f = level.magnet.strength / d2;
      b.vx += dx * f * dt;
      b.vy += dy * f * dt;
    }

    if (level.planet) {
      const p = screenPoint(level.planet);
      const dx = p.x - b.x, dy = p.y - b.y;
      const d2 = Math.max(2600, dx*dx + dy*dy);
      const f = level.planet.strength / d2;
      b.vx += dx * f * dt;
      b.vy += dy * f * dt;
    }

    if (level.chargeZone && !b.boosted) {
      const c = screenPoint(level.chargeZone);
      const dx = c.x - b.x, dy = c.y - b.y;
      if (Math.hypot(dx, dy) <= level.chargeZone.r + b.r) {
        b.vx *= level.chargeZone.boost;
        b.vy *= level.chargeZone.boost;
        b.boosted = true;
        sfx('power');
        addParticles(b.x, b.y, '#ffca55', 18);
        addFloatText(b.x, b.y - 18, 'Boost!', '#ffe48a');
      }
    }

    let drag = level.drag || 0;
    if (level.obstacle && level.obstacle.type === 'rough') {
      const r = rectFromNorm(level.obstacle);
      if (b.x > r.x && b.x < r.x+r.w && b.y+b.r > r.y && b.y-b.r < r.y+r.h) {
        drag += 0.018;
      }
    }
    const decay = Math.max(0.88, 1 - drag * dt * 60);
    b.vx *= decay;
    b.vy *= decay;

    if (level.springPad) {
      const sp = rectFromNorm(level.springPad);
      if (b.x + b.r > sp.x && b.x - b.r < sp.x + sp.w && b.y + b.r > sp.y && b.y - b.r < sp.y + sp.h && b.vy > 0) {
        b.y = sp.y - b.r - 2;
        b.vy = -Math.abs(b.vy) * (level.springPad.boost || 1.15) - 250;
        b.vx *= 1.05;
        sfx('power');
        addParticles(b.x, b.y, '#ffca55', 16);
      }
    }

    // Ramp bounce
    if (level.ramp) {
      const a = screenPoint({x: level.ramp.x1, y: level.ramp.y1});
      const c = screenPoint({x: level.ramp.x2, y: level.ramp.y2});
      const dist = distToSegment(b.x, b.y, a.x, a.y, c.x, c.y);
      if (dist < b.r + 4 && b.vy > 0) {
        const dx = c.x - a.x, dy = c.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len, ny = dx / len;
        const dot = b.vx * nx + b.vy * ny;
        b.vx -= 2 * dot * nx;
        b.vy -= 2 * dot * ny;
        b.vx *= 0.88;
        b.vy *= 0.88;
        b.x += nx * 6;
        b.y += ny * 6;
        sfx('bounce');
      }
    }

    // Wall collision
    if (level.obstacle && level.obstacle.type === 'wall') {
      const r = rectFromNorm(level.obstacle);
      const nearestX = clamp(b.x, r.x, r.x + r.w);
      const nearestY = clamp(b.y, r.y, r.y + r.h);
      if (Math.hypot(b.x - nearestX, b.y - nearestY) < b.r) {
        b.vx *= -0.55;
        b.vy *= 0.78;
        b.x += b.vx > 0 ? 8 : -8;
        state.shake = 5;
        sfx('bounce');
      }
    }

    // Ground and walls
    const floor = h * 0.84;
    if (b.y + b.r > floor) {
      b.y = floor - b.r;
      if (Math.abs(b.vy) > 120) sfx('bounce');
      b.vy *= -(level.bounce || 0.35);
      b.vx *= 0.78;
      if (Math.abs(b.vx) + Math.abs(b.vy) < 120) missShot();
    }
    if (b.x - b.r < 0) {
      b.x = b.r;
      b.vx *= -0.48;
      sfx('bounce');
    }
    if (b.x - b.r > w || b.y - b.r > h || b.y + b.r < -150 || b.age > 9) missShot();
  }

  function rectFromNorm(o) {
    const {w,h} = getMetrics();
    return { x: w*o.x, y: h*o.y, w: w*o.w, h: h*o.h };
  }

  function distToSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A*C + B*D;
    const lenSq = C*C + D*D;
    let t = lenSq ? dot / lenSq : 0;
    t = clamp(t, 0, 1);
    const cx = x1 + t*C, cy = y1 + t*D;
    return Math.hypot(px - cx, py - cy);
  }

  function updatePhysics(dt) {
    const b = state.ball;
    if (!b || !b.moving || state.paused || state.resolving) return;
    b.age += dt;
    applyEnvironment(dt);
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    state.trail.push({x:b.x, y:b.y, life:0.75});
    if (state.trail.length > 55) state.trail.shift();

    const t = targetScreen();
    if (Math.hypot(b.x - t.x, b.y - t.y) < b.r + t.r) hitTarget();
  }

  function update(dt) {
    state.time += dt;
    updatePhysics(dt);
    state.trail.forEach(p => p.life -= dt);
    state.trail = state.trail.filter(p => p.life > 0);
    state.shake *= 0.88;
    updateHUD();
  }

  function drawBackground() {
    const {w,h}=getMetrics();
    const bg=images[currentLevel().background];
    if (bg && bg.width) {
      const ratio=Math.max(w/bg.width,h/bg.height);
      const dw=bg.width*ratio, dh=bg.height*ratio;
      ctx.drawImage(bg,(w-dw)/2,(h-dh)/2,dw,dh);
    } else {
      ctx.fillStyle='#07111f';
      ctx.fillRect(0,0,w,h);
    }
    const vignette=ctx.createRadialGradient(w*.5,h*.35,40,w*.5,h*.45,h*.82);
    vignette.addColorStop(0,'rgba(255,255,255,.03)');
    vignette.addColorStop(1,'rgba(0,0,0,.42)');
    ctx.fillStyle=vignette;
    ctx.fillRect(0,0,w,h);
  }

  function roundedRectPath(x,y,w,h,r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
  }

  function drawPanel() {
    const {w} = getMetrics();
    ctx.save();
    roundedRectPath(18, 18, w-36, 74, 18);
    ctx.fillStyle = 'rgba(5,10,18,.48)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.12)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.96)';
    ctx.textAlign = 'center';
    ctx.font = '900 22px Inter, system-ui, sans-serif';
    ctx.fillText(currentLevel().concept, w/2, 45);
    ctx.font = '700 13px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,.72)';
    ctx.fillText(`Angle ${state.angle}°  •  Power ${state.power}  •  ${currentLevel().mission}`, w/2, 70);
    ctx.restore();
  }

  function drawEnvironment() {
    const level = currentLevel();
    const {w,h} = getMetrics();

    if (level.obstacle) {
      const r = rectFromNorm(level.obstacle);
      ctx.save();
      ctx.fillStyle = level.obstacle.type === 'rough' ? 'rgba(255,120,80,.35)' : 'rgba(255,96,117,.38)';
      ctx.strokeStyle = 'rgba(255,255,255,.24)';
      ctx.lineWidth = 3;
      roundedRectPath(r.x, r.y, r.w, r.h, 10);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.80)';
      ctx.font = '900 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(level.obstacle.type === 'rough' ? 'FRICTION' : 'BARRIER', r.x+r.w/2, r.y+r.h/2+4);
      ctx.restore();
    }

    if (level.ramp) {
      const a = screenPoint({x: level.ramp.x1, y: level.ramp.y1});
      const b = screenPoint({x: level.ramp.x2, y: level.ramp.y2});
      ctx.save();
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,205,80,.78)';
      ctx.shadowColor = '#ffca55';
      ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      ctx.restore();
    }

    if (level.magnet) {
      const m = screenPoint(level.magnet);
      ctx.save();
      ctx.beginPath();
      ctx.arc(m.x, m.y, 46 + Math.sin(state.time*4)*4, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,80,130,.20)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.font = '900 28px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N/S', m.x, m.y+9);
      ctx.restore();
    }

    if (level.planet) {
      const p = screenPoint(level.planet);
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, level.planet.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(90,140,255,.72)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = 4; ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, level.planet.r + 30 + Math.sin(state.time*2)*4, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    }

    if (level.chargeZone) {
      const c = screenPoint(level.chargeZone);
      ctx.save();
      ctx.beginPath();
      ctx.arc(c.x, c.y, level.chargeZone.r + Math.sin(state.time*6)*5, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,205,80,.16)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,205,80,.75)';
      ctx.lineWidth = 4; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.font = '900 20px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BOOST', c.x, c.y+7);
      ctx.restore();
    }

    if (level.fanZone) {
      const fz = rectFromNorm(level.fanZone);
      ctx.save();
      roundedRectPath(fz.x, fz.y, fz.w, fz.h, 20);
      ctx.fillStyle = 'rgba(80,220,255,.16)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(80,220,255,.65)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.font = '900 13px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FAN / WIND ZONE', fz.x + fz.w/2, fz.y + fz.h/2 + 5);
      ctx.restore();
    }

    if (level.waterZone) {
      const waterY = h * level.waterZone.y;
      ctx.save();
      ctx.fillStyle = 'rgba(40,190,255,.20)';
      ctx.fillRect(0, waterY, w, h - waterY);
      ctx.strokeStyle = 'rgba(160,235,255,.65)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, waterY);
      ctx.lineTo(w, waterY);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.75)';
      ctx.font = '900 13px Inter, system-ui, sans-serif';
      ctx.fillText('WATER DRAG + BUOYANCY', 28, waterY + 28);
      ctx.restore();
    }

    if (level.springPad) {
      const sp = rectFromNorm(level.springPad);
      ctx.save();
      roundedRectPath(sp.x, sp.y, sp.w, sp.h, 12);
      ctx.fillStyle = 'rgba(255,205,80,.50)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.55)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.86)';
      ctx.font = '900 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPRING PAD', sp.x + sp.w/2, sp.y - 8);
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = 'rgba(5,10,18,.34)';
    ctx.fillRect(0, h*0.84, w, h*0.16);
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0,h*0.84);
    ctx.lineTo(w,h*0.84);
    ctx.stroke();
    ctx.restore();
  }

  function drawLauncher() {
    const pos = launcherPos();
    const launcher = images[ASSETS.launcher];
    ctx.save();
    ctx.translate(pos.x, pos.y);
    if (launcher && launcher.width) ctx.drawImage(launcher, -55, -68, 110, 110);
    else {
      ctx.fillStyle = '#36d6ff';
      ctx.fillRect(-35,-35,70,70);
    }

    const rad = -state.angle * Math.PI/180;
    const len = 65 + state.power*0.55;
    ctx.rotate(rad);
    ctx.strokeStyle = 'rgba(255,205,80,.92)';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#ffca55';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(len,0);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.beginPath();
    ctx.moveTo(len+12,0);
    ctx.lineTo(len-8,-10);
    ctx.lineTo(len-8,10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawTarget() {
    const t = targetScreen();
    const img = images[ASSETS.target];
    ctx.save();
    ctx.translate(t.x, t.y);
    const size = t.r*2.6 + Math.sin(state.time*5)*3;
    ctx.shadowColor = '#47e78d';
    ctx.shadowBlur = 18;
    if (img && img.width) ctx.drawImage(img, -size/2, -size/2, size, size);
    else {
      ctx.fillStyle = '#47e78d';
      ctx.beginPath(); ctx.arc(0,0,t.r,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawBall() {
    const b = state.ball;
    const img = images[ASSETS.ball];
    if (!b) return;

    state.trail.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / 0.75) * 0.45;
      ctx.fillStyle = '#36d6ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 7, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    });

    ctx.save();
    ctx.translate(b.x, b.y);
    const size = b.r*3.0;
    ctx.shadowColor = '#36d6ff';
    ctx.shadowBlur = 18;
    if (img && img.width) ctx.drawImage(img, -size/2, -size/2, size, size);
    else {
      ctx.fillStyle = '#36d6ff';
      ctx.beginPath(); ctx.arc(0,0,b.r,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawParticles(dt) {
    for (let i=state.particles.length-1;i>=0;i--) {
      const p=state.particles[i];
      p.life -= dt;
      if (p.life <= 0) { state.particles.splice(i,1); continue; }
      p.x += p.vx*dt; p.y += p.vy*dt;
      p.vx *= .985; p.vy *= .985;
      const a = p.life / p.ttl;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.size*a,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFloatTexts(dt) {
    for (let i=state.floatTexts.length-1;i>=0;i--) {
      const f=state.floatTexts[i];
      f.life -= dt;
      if (f.life <= 0) { state.floatTexts.splice(i,1); continue; }
      f.y -= 42*dt;
      ctx.save();
      ctx.globalAlpha = f.life / f.ttl;
      ctx.fillStyle = f.color;
      ctx.font = '900 24px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  function render(dt) {
    const {w,h}=getMetrics();
    ctx.clearRect(0,0,w,h);
    ctx.save();
    if (state.shake > 0) ctx.translate(rand(-state.shake,state.shake), rand(-state.shake,state.shake));
    drawBackground();
    drawEnvironment();
    drawPanel();
    drawLauncher();
    drawTarget();
    drawBall();
    drawParticles(dt);
    drawFloatTexts(dt);
    ctx.restore();
  }

  function adjustAngle(delta) {
    if (state.ball?.moving || state.resolving) return;
    state.angle = clamp(state.angle + delta, 15, 78);
    updateHUD();
  }
  function adjustPower(delta) {
    if (state.ball?.moving || state.resolving) return;
    state.power = clamp(state.power + delta, 25, 100);
    updateHUD();
  }

  function showHint() {
    const level = currentLevel();
    if (state.hintUsed) return;
    state.hintUsed = true;
    let msg = 'Try changing both angle and power.';
    if (level.wind > 0) msg = 'Wind pushes right. Aim a little lower or reduce over-arc.';
    if (level.wind < 0) msg = 'Wind pushes left. Use more power or a higher angle.';
    if (level.obstacle?.type === 'wall') msg = 'Use a higher arc to clear the barrier.';
    if (level.obstacle?.type === 'rough') msg = 'Friction slows the ball. Use more power.';
    if (level.magnet) msg = 'Aim near the magnet so its pull bends the path.';
    if (level.ramp) msg = 'Hit the ramp to turn speed into height.';
    if (level.planet) msg = 'Launch with enough sideways velocity so gravity curves the path.';
    if (level.fanZone) msg = 'The fan zone adds extra force. Aim against the push or use the wind to your advantage.';
    if (level.waterZone) msg = 'Water slows the ball and pushes upward. Use more power and expect drag.';
    if (level.springPad) msg = 'Aim for the spring pad. It converts impact into upward bounce.';
    if (level.target?.move) msg = 'The target moves. Time your launch and aim for where it will be.';
    addFloatText(getMetrics().w*0.5, getMetrics().h*0.22, msg, '#ffe48a');
    state.score = Math.max(0, state.score - 25);
    updateHUD();
  }

  function togglePause() {
    if (!state.running && !state.paused) return;
    state.paused = !state.paused;
    if (state.paused) {
      stopMusic();
      showOverlay('Paused', 'Physics Force Lab is paused. Tap Start or Pause to continue.', 'Resume');
    } else {
      hideOverlay();
      startMusic();
    }
  }

  startBtn.addEventListener('click', () => {
    ensureAudio();
    if (state.victory || state.gameOver) { resetGame(); begin(); return; }
    if (state.levelClear) { nextLevel(); return; }
    if (!state.running) begin();
    else if (state.paused) { state.paused = false; hideOverlay(); startMusic(); }
  });
  helpBtn.addEventListener('click', () => {
    state.paused = true;
    stopMusic();
    showOverlay('How to Play', 'Adjust angle and power, then press Launch.\\n\\nThe ball obeys the level’s physics: gravity, wind, friction, magnetic pull, energy boost zones, ramps, and orbital pull.\\n\\nHit the glowing target to clear the level. Fewer attempts and more remaining energy give a higher score.', 'Resume');
  });

  pauseBtn.addEventListener('click', togglePause);
  resetShotBtn.addEventListener('click', resetShot);
  hintBtn.addEventListener('click', showHint);
  submitBtn.addEventListener('click', () => postScore('manual_submit'));
  restartBtn.addEventListener('click', () => { resetGame(); begin(); });
  muteBtn.addEventListener('click', () => {
    muted = !muted;
    muteBtn.textContent = muted ? 'Muted' : 'Sound';
    if (muted) stopMusic(); else if (state.running && !state.paused) startMusic();
  });

  angleDownBtn.addEventListener('click', () => adjustAngle(-3));
  angleUpBtn.addEventListener('click', () => adjustAngle(3));
  powerDownBtn.addEventListener('click', () => adjustPower(-4));
  powerUpBtn.addEventListener('click', () => adjustPower(4));
  launchBtn.addEventListener('click', launchBall);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') adjustAngle(-3);
    if (e.key === 'ArrowRight') adjustAngle(3);
    if (e.key === 'ArrowDown') adjustPower(-4);
    if (e.key === 'ArrowUp') adjustPower(4);
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); launchBall(); }
    if (e.key.toLowerCase() === 'p') togglePause();
    if (e.key.toLowerCase() === 'r') { resetGame(); begin(); }
    if (e.key.toLowerCase() === 'h') showHint();
  });

  window.addEventListener('message', (ev) => {
    const data = ev.data || {};
    const type = data.type || data.event;
    if (type === 'GG_PAUSE') {
      state.paused = !!(data.payload?.paused ?? data.paused);
      if (state.paused) stopMusic(); else if (state.running) startMusic();
    }
    if (type === 'GG_RESTART') { resetGame(); begin(); }
    if (type === 'GG_MUTE') {
      muted = !!(data.payload?.muted ?? data.muted);
      if (muted) stopMusic(); else if (state.running && !state.paused) startMusic();
      muteBtn.textContent = muted ? 'Muted' : 'Sound';
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.running) {
      state.paused = true;
      stopMusic();
      showOverlay('Paused', 'Physics Force Lab is paused. Tap Start or Pause to continue.', 'Resume');
    }
  });

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!state.ball || !state.ball.moving) resetBall();
  }
  window.addEventListener('resize', resizeCanvas);

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    update(dt);
    render(dt);
    requestAnimationFrame(loop);
  }

  loadImages().then(() => {
    resizeCanvas();
    resetGame();
    requestAnimationFrame(loop);
  });
})();