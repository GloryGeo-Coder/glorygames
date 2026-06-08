(() => {
  'use strict';

  const GAME_SLUG = 'climate-rescue-quest';
  const SAVE_KEY = 'gg_climate_rescue_quest_v2_save';
  const BEST_KEY = 'gg_climate_rescue_quest_v2_best';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const ui = {
    scoreValue: document.getElementById('scoreValue'),
    levelValue: document.getElementById('levelValue'),
    livesValue: document.getElementById('livesValue'),
    comboValue: document.getElementById('comboValue'),
    missionText: document.getElementById('missionText'),
    objectiveText: document.getElementById('objectiveText'),
    factText: document.getElementById('factText'),
    progressBar: document.getElementById('progressBar'),
    shieldState: document.getElementById('shieldState'),
    magnetState: document.getElementById('magnetState'),
    freezeState: document.getElementById('freezeState'),
    levelTitle: document.getElementById('levelTitle'),
    levelSummary: document.getElementById('levelSummary'),
    rewardText: document.getElementById('rewardText'),
    starRow: document.getElementById('starRow'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameOverSummary: document.getElementById('gameOverSummary'),
    startOverlay: document.getElementById('startOverlay'),
    helpOverlay: document.getElementById('helpOverlay'),
    levelOverlay: document.getElementById('levelOverlay'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    muteBtn: document.getElementById('muteBtn'),
    pauseBtn: document.getElementById('pauseBtn')
  };

  const spriteDefs = {
    player: ['./assets/sprites/player_01.png','./assets/sprites/player_02.png','./assets/sprites/player_03.png'],
    solar: ['./assets/sprites/solar_01.png','./assets/sprites/solar_02.png'],
    tree: ['./assets/sprites/tree_01.png','./assets/sprites/tree_02.png'],
    water: ['./assets/sprites/water_01.png','./assets/sprites/water_02.png'],
    battery: ['./assets/sprites/battery_01.png','./assets/sprites/battery_02.png'],
    recycle: ['./assets/sprites/recycle_01.png','./assets/sprites/recycle_02.png'],
    pollution_cloud: ['./assets/sprites/pollution_cloud_01.png','./assets/sprites/pollution_cloud_02.png'],
    factory: ['./assets/sprites/factory_01.png','./assets/sprites/factory_02.png'],
    wildfire: ['./assets/sprites/wildfire_01.png','./assets/sprites/wildfire_02.png'],
    wind_turbine: ['./assets/sprites/wind_turbine_01.png','./assets/sprites/wind_turbine_02.png']
  };

  const backgrounds = [
    './assets/backgrounds/level-01.png',
    './assets/backgrounds/level-02.png',
    './assets/backgrounds/level-03.png',
    './assets/backgrounds/level-04.png',
    './assets/backgrounds/level-05.png',
    './assets/backgrounds/level-06.png',
    './assets/backgrounds/level-07.png',
    './assets/backgrounds/level-08.png',
    './assets/backgrounds/level-09.png',
    './assets/backgrounds/level-10.png'
  ];

  const levels = [
    {
      id: 1,
      title: 'Urban Eco Start',
      mission: 'Collect recycle items, batteries, and saplings to clean up the city.',
      fact: 'Urban greening reduces heat, improves air quality, and makes cities more resilient.',
      target: 12,
      good: ['recycle','battery','tree'],
      hazard: ['pollution_cloud','factory'],
      speed: 168,
      bg: 0
    },
    {
      id: 2,
      title: 'Solar Valley',
      mission: 'Capture solar panels, turbines, and batteries to power a renewable future.',
      fact: 'Renewable energy helps reduce emissions and improves long-term energy security.',
      target: 14,
      good: ['solar','wind_turbine','battery'],
      hazard: ['pollution_cloud','factory'],
      speed: 182,
      bg: 1
    },
    {
      id: 3,
      title: 'River Renewal',
      mission: 'Protect freshwater by collecting water drops and recycling symbols.',
      fact: 'Healthy rivers support people, agriculture, wildlife, and local economies.',
      target: 15,
      good: ['water','recycle','tree'],
      hazard: ['factory','pollution_cloud'],
      speed: 190,
      bg: 2
    },
    {
      id: 4,
      title: 'Forest Guardian',
      mission: 'Reforest the land by collecting trees and water while avoiding fire.',
      fact: 'Forests absorb carbon, regulate rainfall, and protect biodiversity.',
      target: 16,
      good: ['tree','water','recycle'],
      hazard: ['wildfire','pollution_cloud'],
      speed: 200,
      bg: 3
    },
    {
      id: 5,
      title: 'Wetland Watch',
      mission: 'Restore wetlands with water drops, saplings, and clean-energy support.',
      fact: 'Wetlands filter water, reduce floods, and store large amounts of carbon.',
      target: 17,
      good: ['water','tree','battery'],
      hazard: ['factory','pollution_cloud'],
      speed: 206,
      bg: 4
    },
    {
      id: 6,
      title: 'Ocean Shield',
      mission: 'Protect oceans with clean-energy and eco-action items.',
      fact: 'Oceans regulate the climate and absorb significant amounts of heat and carbon dioxide.',
      target: 18,
      good: ['water','wind_turbine','recycle'],
      hazard: ['factory','pollution_cloud','wildfire'],
      speed: 214,
      bg: 5
    },
    {
      id: 7,
      title: 'Mountain Wind',
      mission: 'Harvest wind energy at high altitude while avoiding pollution threats.',
      fact: 'Mountain ecosystems store water and can host clean energy in the right locations.',
      target: 19,
      good: ['wind_turbine','battery','tree'],
      hazard: ['pollution_cloud','factory'],
      speed: 222,
      bg: 6
    },
    {
      id: 8,
      title: 'Community Recycling',
      mission: 'Boost community action by gathering recycle, battery, and solar resources.',
      fact: 'Community recycling and local action can significantly reduce landfill waste.',
      target: 20,
      good: ['recycle','battery','solar'],
      hazard: ['pollution_cloud','factory','wildfire'],
      speed: 232,
      bg: 7
    },
    {
      id: 9,
      title: 'Green Farm Run',
      mission: 'Support sustainable farming with water, wind, and tree-based restoration.',
      fact: 'Sustainable land management helps conserve soil, water, and long-term food production.',
      target: 21,
      good: ['water','wind_turbine','tree'],
      hazard: ['pollution_cloud','wildfire'],
      speed: 238,
      bg: 8
    },
    {
      id: 10,
      title: 'Carbon Boss',
      mission: 'Defeat the Carbon Boss by collecting clean-energy strike items while surviving the harshest hazards.',
      fact: 'Climate action works best when energy, ecosystems, water, and community effort come together.',
      target: 24,
      good: ['solar','wind_turbine','battery','recycle'],
      hazard: ['pollution_cloud','factory','wildfire'],
      speed: 252,
      bg: 9,
      boss: true
    }
  ];

  const defaultState = () => ({
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    levelIndex: 0,
    lives: 3,
    combo: 1,
    comboChain: 0,
    collected: 0,
    paused: false,
    muted: false,
    started: false,
    gameOver: false,
    levelComplete: false,
    shield: 1,
    magnet: 1,
    freeze: 1,
    shieldActive: false,
    shieldTimer: 0,
    magnetTimer: 0,
    freezeTimer: 0,
    items: [],
    particles: [],
    floats: [],
    stars: 3,
    time: 0
  });

  let state = loadState();
  let last = performance.now();
  const imgCache = {};
  let dragActive = false;
  let dragOffsetX = 0;
  let lastLiveScore = -1;
  let lastLiveAt = 0;

  const player = { x: 0, y: 0, w: 112, h: 112, bob: 0 };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      return saved ? { ...defaultState(), ...saved } : defaultState();
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    const copy = { ...state, items: [], particles: [], floats: [], paused: false, shieldActive: false, shieldTimer: 0, magnetTimer: 0, freezeTimer: 0 };
    localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
    if (state.score > state.best) {
      state.best = Math.floor(state.score);
      localStorage.setItem(BEST_KEY, String(state.best));
    }
  }

  function resetState(full = true) {
    const fresh = defaultState();
    if (!full) state = { ...fresh, score: state.score, best: state.best, muted: state.muted };
    else state = fresh;
    saveState();
    syncUI();
  }

  function allSpritePaths() {
    const all = [];
    Object.values(spriteDefs).forEach(v => Array.isArray(v) ? all.push(...v) : all.push(v));
    return all;
  }

  function loadImages() {
    const all = [...allSpritePaths(), ...backgrounds];
    return Promise.all(all.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
      imgCache[src] = img;
    })));
  }

  // Audio
  let AC = null, master = null, musicInt = null, musicStep = 0;
  function ensureAudio() {
    if (state.muted) return null;
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
    const ac = ensureAudio();
    if (!ac || state.muted) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }
  function sfx(kind) {
    if (kind === 'good') { tone(540,.05,'triangle',.05); tone(810,.08,'sine',.035,.05); }
    if (kind === 'bad') { tone(180,.12,'sawtooth',.045); }
    if (kind === 'level') { tone(392,.08,'triangle',.05); tone(554,.1,'triangle',.04,.06); tone(784,.12,'sine',.03,.14); }
    if (kind === 'power') { tone(480,.06,'triangle',.05); tone(760,.1,'sine',.04,.07); }
  }
  function musicTick() {
    if (!state.started || state.paused || state.levelComplete || state.gameOver || state.muted) return;
    const notes = [196,247,294,330,392,330,294,247];
    const n = notes[musicStep++ % notes.length];
    tone(n,.08,'triangle',.009);
    if (musicStep % 2 === 0) tone(n/2,.1,'sine',.006);
  }
  function startMusic() { if (!musicInt && !state.muted) musicInt = setInterval(musicTick, 260); }
  function stopMusic() { if (musicInt) clearInterval(musicInt); musicInt = null; }

  function currentLevel() { return levels[Math.min(state.levelIndex, levels.length - 1)]; }

  function syncUI() {
    const lv = currentLevel();
    ui.scoreValue.textContent = Math.floor(state.score);
    ui.levelValue.textContent = lv.id;
    ui.livesValue.textContent = state.lives;
    ui.comboValue.textContent = `x${state.combo}`;
    ui.missionText.textContent = lv.mission;
    ui.objectiveText.textContent = `${state.collected} / ${lv.target}`;
    ui.factText.textContent = lv.fact;
    ui.progressBar.style.width = `${Math.min(100, (state.collected / lv.target) * 100)}%`;
    ui.shieldState.textContent = `Shield: ${state.shield}${state.shieldActive ? ' (ON)' : ''}`;
    ui.magnetState.textContent = `Magnet: ${state.magnet}${state.magnetTimer > 0 ? ' (ON)' : ''}`;
    ui.freezeState.textContent = `Freeze: ${state.freeze}${state.freezeTimer > 0 ? ' (ON)' : ''}`;
    ui.muteBtn.textContent = state.muted ? 'Sound Off' : 'Sound On';
    ui.pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
  }

  function postScore(mode = 'live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now - lastLiveAt < 150) return;
    lastLiveScore = clean;
    lastLiveAt = now;
    const payload = {
      gameSlug: GAME_SLUG,
      slug: GAME_SLUG,
      score: clean,
      best: Math.max(state.best, clean),
      level: currentLevel().id,
      mode
    };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type:'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type:'gg:score', ...payload, payload }, '*'); } catch {}
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    player.x = (rect.width - player.w) / 2;
    player.y = rect.height - 152;
  }

  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function getW() { return canvas.getBoundingClientRect().width || 960; }
  function getH() { return canvas.getBoundingClientRect().height || 540; }

  function spriteFrame(kind, speed = 140) {
    const def = spriteDefs[kind];
    if (!def) return null;
    if (!Array.isArray(def)) return imgCache[def];
    const idx = Math.floor((performance.now() / speed) % def.length);
    return imgCache[def[idx]];
  }

  function startGame() {
    resetState(true);
    state.started = true;
    state.levelIndex = 0;
    loadLevel(0, true);
    ui.startOverlay.classList.remove('active');
    ui.levelOverlay.classList.remove('active');
    ui.gameOverOverlay.classList.remove('active');
    startMusic();
    saveState();
  }

  function loadLevel(index, freshRun = false) {
    state.levelIndex = clamp(index, 0, levels.length - 1);
    state.levelComplete = false;
    state.paused = false;
    state.items = [];
    state.particles = [];
    state.floats = [];
    state.combo = 1;
    state.comboChain = 0;
    state.collected = 0;
    state.shield = 1;
    state.magnet = 1;
    state.freeze = 1;
    state.shieldActive = false;
    state.shieldTimer = 0;
    state.magnetTimer = 0;
    state.freezeTimer = 0;
    if (freshRun) state.lives = 3;
    syncUI();
  }

  function spawnItem() {
    const lv = currentLevel();
    const hazardChance = lv.boss ? 0.38 : 0.26 + state.levelIndex * 0.008;
    const isHazard = Math.random() < hazardChance;
    const kind = isHazard ? pick(lv.hazard) : pick(lv.good);
    const size = rand(62, 88);
    state.items.push({
      kind,
      good: !isHazard,
      x: rand(40, getW() - 90),
      y: -90,
      w: size,
      h: size,
      vy: rand(lv.speed, lv.speed + 88) * (state.freezeTimer > 0 ? 0.45 : 1),
      drift: rand(-18, 18),
      rot: rand(-0.3, 0.3),
      vr: rand(-0.8, 0.8),
      pulse: rand(0, Math.PI * 2)
    });
  }

  function addParticles(x, y, color, n = 18) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(40, 160);
      state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.45, 0.9), ttl: 0.9, size: rand(3, 8), color });
    }
  }

  function addFloat(x, y, text, color = '#fff') {
    state.floats.push({ x, y, text, color, life: 1, ttl: 1 });
  }

  function movePlayer(delta) {
    player.x = clamp(player.x + delta, 16, getW() - player.w - 16);
  }

  function activateShield() {
    if (state.shield <= 0 || state.shieldActive || !state.started || state.paused || state.levelComplete || state.gameOver) return;
    state.shield--;
    state.shieldActive = true;
    state.shieldTimer = 7;
    sfx('power');
    addFloat(getW()/2, getH()*0.3, 'Shield Activated', '#ccffd9');
    syncUI();
  }
  function activateMagnet() {
    if (state.magnet <= 0 || state.magnetTimer > 0 || !state.started || state.paused || state.levelComplete || state.gameOver) return;
    state.magnet--;
    state.magnetTimer = 8;
    sfx('power');
    addFloat(getW()/2, getH()*0.3, 'Magnet Activated', '#d9f7ff');
    syncUI();
  }
  function activateFreeze() {
    if (state.freeze <= 0 || state.freezeTimer > 0 || !state.started || state.paused || state.levelComplete || state.gameOver) return;
    state.freeze--;
    state.freezeTimer = 5;
    sfx('power');
    addFloat(getW()/2, getH()*0.3, 'Freeze Activated', '#fff2b6');
    syncUI();
  }

  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function collectItem(item, index) {
    if (item.good) {
      state.collected++;
      state.comboChain++;
      state.combo = Math.min(10, 1 + Math.floor(state.comboChain / 3));
      const gain = 80 * state.combo;
      state.score += gain;
      addFloat(item.x, item.y - 12, `+${gain}`, '#d9ffef');
      addParticles(item.x + item.w/2, item.y + item.h/2, '#63d17f', 18);
      sfx('good');

      if (currentLevel().boss && state.collected % 6 === 0) {
        state.score += 150;
        addFloat(getW()/2, 90, 'Carbon Boss weakened!', '#ffe79d');
      }

      if (state.collected >= currentLevel().target) completeLevel();
    } else {
      state.comboChain = 0;
      state.combo = 1;
      if (state.shieldActive) {
        state.shieldActive = false;
        state.shieldTimer = 0;
        addFloat(item.x, item.y - 10, 'Shield blocked!', '#fff0af');
        addParticles(item.x + item.w/2, item.y + item.h/2, '#ffcf73', 18);
        sfx('power');
      } else {
        state.lives--;
        state.score = Math.max(0, state.score - 75);
        addFloat(item.x, item.y - 10, 'Hazard! -1 life', '#ffc0ca');
        addParticles(item.x + item.w/2, item.y + item.h/2, '#ff6a85', 20);
        sfx('bad');
        if (state.lives <= 0) triggerGameOver(false);
      }
    }
    state.items.splice(index, 1);
    syncUI();
    postScore('live');
  }

  function completeLevel() {
    if (state.levelComplete) return;
    state.levelComplete = true;
    stopMusic();
    const bonus = 300 + state.lives * 120 + state.combo * 50;
    state.score += bonus;
    state.best = Math.max(state.best, state.score);
    state.stars = state.lives === 3 ? 3 : state.lives === 2 ? 2 : 1;
    ui.levelTitle.textContent = `${currentLevel().title} Complete`;
    ui.levelSummary.textContent = currentLevel().boss
      ? 'You beat the Carbon Boss and completed the full climate mission!'
      : 'You restored this region and unlocked the next environmental challenge.';
    ui.rewardText.textContent = `Bonus +${bonus} • Best ${Math.floor(Math.max(state.best, state.score))}`;
    ui.starRow.textContent = '★ '.repeat(state.stars).trim();
    ui.levelOverlay.classList.add('active');
    sfx('level');
    saveState();
    postScore('level_complete');
  }

  function nextLevel() {
    ui.levelOverlay.classList.remove('active');
    if (state.levelIndex >= levels.length - 1) {
      triggerGameOver(true);
      return;
    }
    loadLevel(state.levelIndex + 1);
    startMusic();
  }

  function replayLevel() {
    ui.levelOverlay.classList.remove('active');
    loadLevel(state.levelIndex);
    startMusic();
  }

  function triggerGameOver(win) {
    state.gameOver = true;
    stopMusic();
    ui.gameOverTitle.textContent = win ? 'Planet Saved!' : 'Mission Failed';
    ui.gameOverSummary.textContent = win
      ? `Amazing work! Final score: ${Math.floor(state.score)}`
      : `Your final score: ${Math.floor(state.score)}. Try again and rescue the climate!`;
    ui.gameOverOverlay.classList.add('active');
    saveState();
    postScore(win ? 'game_won' : 'game_over');
  }

  function update(dt) {
    if (!state.started || state.paused || state.levelComplete || state.gameOver) return;
    const lv = currentLevel();
    state.time += dt;

    if (Math.random() < (lv.boss ? 0.038 : 0.028) + state.levelIndex * 0.003) spawnItem();

    if (state.shieldTimer > 0) {
      state.shieldTimer -= dt;
      if (state.shieldTimer <= 0) {
        state.shieldActive = false;
        state.shieldTimer = 0;
      }
    }
    if (state.magnetTimer > 0) state.magnetTimer = Math.max(0, state.magnetTimer - dt);
    if (state.freezeTimer > 0) state.freezeTimer = Math.max(0, state.freezeTimer - dt);

    player.bob += dt * 7;

    for (let i = state.items.length - 1; i >= 0; i--) {
      const item = state.items[i];
      const speedFactor = state.freezeTimer > 0 ? 0.46 : 1;
      item.y += item.vy * dt * speedFactor;
      item.x += Math.sin(item.y * 0.015 + item.pulse) * item.drift * dt;
      item.rot += item.vr * dt;

      if (state.magnetTimer > 0 && item.good) {
        const dx = (player.x + player.w/2) - (item.x + item.w/2);
        const dy = (player.y + player.h/2) - (item.y + item.h/2);
        const dist = Math.hypot(dx, dy);
        if (dist < 180) {
          item.x += dx * 0.035;
          item.y += dy * 0.035;
        }
      }

      if (intersects(item, player)) {
        collectItem(item, i);
        continue;
      }
      if (item.y > getH() + 120) state.items.splice(i, 1);
    }

    state.particles.forEach(p => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.985;
      p.vy *= 0.985;
    });
    state.particles = state.particles.filter(p => p.life > 0);

    state.floats.forEach(f => {
      f.life -= dt;
      f.y -= 44 * dt;
    });
    state.floats = state.floats.filter(f => f.life > 0);

    syncUI();
  }

  function drawBackground() {
    const w = getW(), h = getH();
    const bg = imgCache[backgrounds[currentLevel().bg]];
    if (bg && bg.width) {
      const ratio = Math.max(w / bg.width, h / bg.height);
      const dw = bg.width * ratio;
      const dh = bg.height * ratio;
      ctx.drawImage(bg, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = '#07110f';
      ctx.fillRect(0, 0, w, h);
    }

    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, 'rgba(255,255,255,0.02)');
    grd.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  }

  function drawPlayer() {
    const img = spriteFrame('player', 160);
    const bobY = Math.sin(player.bob) * 4;
    ctx.save();
    if (state.shieldActive) {
      ctx.beginPath();
      ctx.arc(player.x + player.w/2, player.y + player.h/2 + bobY, 70 + Math.sin(player.bob*1.5)*4, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(99,209,127,0.88)';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#63d17f';
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    if (img && img.width) ctx.drawImage(img, player.x, player.y + bobY, player.w, player.h);
    else {
      ctx.fillStyle = '#63d17f';
      ctx.beginPath();
      ctx.arc(player.x + player.w/2, player.y + player.h/2, 44, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawItems() {
    state.items.forEach(item => {
      const img = spriteFrame(item.kind, item.good ? 180 : 220);
      const pulse = 1 + Math.sin(item.pulse + performance.now() * 0.004) * 0.06;
      const w = item.w * pulse, h = item.h * pulse;
      ctx.save();
      ctx.translate(item.x + item.w/2, item.y + item.h/2);
      ctx.rotate(item.rot);
      ctx.shadowColor = item.good ? '#63d17f' : '#ff6a85';
      ctx.shadowBlur = item.good ? 18 : 20;
      if (img && img.width) ctx.drawImage(img, -w/2, -h/2, w, h);
      else {
        ctx.fillStyle = item.good ? '#63d17f' : '#ff6a85';
        ctx.beginPath();
        ctx.arc(0, 0, w/2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawParticlesAndFloats() {
    state.particles.forEach(p => {
      const a = p.life / p.ttl;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    state.floats.forEach(f => {
      ctx.save();
      ctx.globalAlpha = f.life / f.ttl;
      ctx.fillStyle = f.color;
      ctx.font = '900 22px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    });
  }

  function drawHUDInCanvas() {
    const w = getW();
    ctx.save();
    ctx.fillStyle = 'rgba(6,16,10,0.44)';
    ctx.strokeStyle = 'rgba(244,255,244,0.11)';
    roundRect(ctx, 16, 16, w - 32, 62, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f4fff5';
    ctx.font = '900 20px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(currentLevel().title, 32, 44);
    ctx.font = '700 14px Inter, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(224,244,228,0.82)';
    ctx.fillText(`Best ${Math.floor(Math.max(state.best, state.score))}`, 32, 64);

    const right = w - 28;
    ctx.textAlign = 'right';
    ctx.font = '900 18px Inter, system-ui, sans-serif';
    ctx.fillStyle = '#f5cf73';
    ctx.fillText(`Target ${state.collected}/${currentLevel().target}`, right, 44);
    ctx.fillStyle = '#dfffea';
    ctx.fillText(`Combo x${state.combo}`, right, 66);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
  }

  function draw() {
    const w = getW(), h = getH();
    ctx.clearRect(0, 0, w, h);
    drawBackground();
    drawItems();
    drawPlayer();
    drawParticlesAndFloats();
    drawHUDInCanvas();
  }

  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function bindEvents() {
    document.getElementById('playBtn').addEventListener('click', startGame);
    document.getElementById('howBtn').addEventListener('click', () => ui.helpOverlay.classList.add('active'));
    document.getElementById('closeHelpBtn').addEventListener('click', () => ui.helpOverlay.classList.remove('active'));
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);
    document.getElementById('replayBtn').addEventListener('click', replayLevel);
    document.getElementById('restartBtn').addEventListener('click', () => {
      ui.gameOverOverlay.classList.remove('active');
      startGame();
    });

    document.getElementById('leftBtn').addEventListener('click', () => movePlayer(-76));
    document.getElementById('rightBtn').addEventListener('click', () => movePlayer(76));
    document.getElementById('shieldBtn').addEventListener('click', activateShield);
    document.getElementById('magnetBtn').addEventListener('click', activateMagnet);
    document.getElementById('freezeBtn').addEventListener('click', activateFreeze);

    document.getElementById('submitScoreBtn').addEventListener('click', () => postScore('manual_submit'));
    ui.muteBtn.addEventListener('click', () => {
      state.muted = !state.muted;
      if (state.muted) stopMusic(); else startMusic();
      syncUI();
      saveState();
    });
    ui.pauseBtn.addEventListener('click', () => {
      state.paused = !state.paused;
      if (state.paused) stopMusic(); else startMusic();
      syncUI();
    });

    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') movePlayer(-58);
      if (e.key === 'ArrowRight') movePlayer(58);
      if (e.key.toLowerCase() === 's') activateShield();
      if (e.key.toLowerCase() === 'm') activateMagnet();
      if (e.key.toLowerCase() === 'f') activateFreeze();
    });

    canvas.addEventListener('pointerdown', e => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= player.x && x <= player.x + player.w && y >= player.y && y <= player.y + player.h) {
        dragActive = true;
        dragOffsetX = x - player.x;
      }
    });
    canvas.addEventListener('pointermove', e => {
      if (!dragActive) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      player.x = clamp(x - dragOffsetX, 16, getW() - player.w - 16);
    });
    canvas.addEventListener('pointerup', () => dragActive = false);
    canvas.addEventListener('pointercancel', () => dragActive = false);

    let swipeStartX = null;
    canvas.addEventListener('touchstart', e => {
      if (e.touches && e.touches[0]) swipeStartX = e.touches[0].clientX;
    }, {passive:true});
    canvas.addEventListener('touchend', e => {
      if (swipeStartX == null || !e.changedTouches || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - swipeStartX;
      if (Math.abs(dx) > 25) movePlayer(dx > 0 ? 76 : -76);
      swipeStartX = null;
    }, {passive:true});

    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('message', ev => {
      const data = ev.data || {};
      const type = data.type || data.event;
      if (type === 'GG_PAUSE') {
        state.paused = !!(data.payload?.paused ?? data.paused);
        if (state.paused) stopMusic(); else startMusic();
        syncUI();
      }
      if (type === 'GG_RESTART') startGame();
      if (type === 'GG_MUTE') {
        state.muted = !!(data.payload?.muted ?? data.muted);
        if (state.muted) stopMusic(); else startMusic();
        syncUI();
      }
    });
  }

  loadImages().then(() => {
    bindEvents();
    resizeCanvas();
    syncUI();
    requestAnimationFrame(loop);
  });
})();