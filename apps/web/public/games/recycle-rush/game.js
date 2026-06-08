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
  const restartBtn = $('restartBtn');
  const submitBtn = $('submitBtn');
  const muteBtn = $('muteBtn');
  const scoreValue = $('scoreValue');
  const livesValue = $('livesValue');
  const comboValue = $('comboValue');
  const bestValue = $('bestValue');
  const levelPill = $('levelPill');
  const missionText = $('missionText');
  const missionPct = $('missionPct');
  const missionFill = $('missionFill');
  const legendGrid = $('legendGrid');

  const GAME_SLUG = 'recycle-rush';
  const BEST_KEY = 'gg_recycle_rush_best_v2';

  const CATEGORIES = {
    paper:   { label: 'Paper', short: 'Paper', color: '#4da8ff', facts: ['Paper can become new boxes, notebooks, or tissue products.', 'Flattening cardboard saves space during collection and transport.'] },
    plastic: { label: 'Plastic', short: 'Plastic', color: '#39da74', facts: ['Plastic bottles should be emptied before recycling.', 'Sorting clean plastic reduces contamination and improves recovery.'] },
    glass:   { label: 'Glass', short: 'Glass', color: '#70df9e', facts: ['Glass can be recycled many times without losing quality.', 'Keeping glass separate reduces breakage and improves recycling efficiency.'] },
    metal:   { label: 'Metal', short: 'Metal', color: '#bfd3ea', facts: ['Metal recycling saves energy compared with mining new material.', 'Aluminium and steel cans are highly recyclable when kept clean.'] },
    organic: { label: 'Organic', short: 'Organic', color: '#f2ca57', facts: ['Food scraps can become compost instead of going to landfill.', 'Composting organic waste helps reduce methane emissions.'] },
    ewaste:  { label: 'E-Waste', short: 'E-Waste', color: '#b66bff', facts: ['Electronic waste should be collected separately for safe recovery.', 'E-waste contains useful materials but also needs careful handling.'] },
    contamination: { label: 'Mixed Waste', short: 'Hazard', color: '#ff7d57', facts: ['Mixed waste contaminates recycling streams and lowers value.', 'Tap hazards before they land to keep the stream clean.'] },
    bonus:   { label: 'Bonus', short: 'Bonus', color: '#ffd055', facts: ['Bonus recycle tokens reward excellent sorting streaks.', 'High combos show strong attention and fast classification skills.'] },
  };

  const ITEM_LIBRARY = [
    { id: 'cardboard', category: 'paper', sprite: './assets/sprites/item-cardboard.png' },
    { id: 'newspaper', category: 'paper', sprite: './assets/sprites/item-newspaper.png' },
    { id: 'plasticBottle', category: 'plastic', sprite: './assets/sprites/item-plastic-bottle.png' },
    { id: 'glassBottle', category: 'glass', sprite: './assets/sprites/item-glass-bottle.png' },
    { id: 'tinCan', category: 'metal', sprite: './assets/sprites/item-tin-can.png' },
    { id: 'organicCore', category: 'organic', sprite: './assets/sprites/item-organic.png' },
    { id: 'ewasteKit', category: 'ewaste', sprite: './assets/sprites/item-ewaste.png' },
    { id: 'contamination', category: 'contamination', sprite: './assets/sprites/item-contamination.png' },
    { id: 'bonusRecycle', category: 'bonus', sprite: './assets/sprites/item-bonus-recycle.png' },
  ];

  const LEVELS = [
    {
      name: 'School Clean-up',
      background: './assets/backgrounds/bg-school-cleanup.png',
      categories: ['paper', 'plastic', 'organic'],
      targetSorted: 14, targetScore: 550, lives: 3,
      fallSpeed: 205, spawnEvery: 1.18, hazardChance: 0.06, bonusChance: 0.05, drift: 8, spawnMax: 3,
      description: 'Clear the school grounds by sorting paper, plastic, and organic waste correctly.'
    },
    {
      name: 'Community Recycling Day',
      background: './assets/backgrounds/bg-community-day.png',
      categories: ['paper', 'plastic', 'glass', 'metal', 'organic'],
      targetSorted: 18, targetScore: 1080, lives: 3,
      fallSpeed: 232, spawnEvery: 1.03, hazardChance: 0.09, bonusChance: 0.06, drift: 16, spawnMax: 3,
      description: 'The drop-off day is busy — identify more materials and keep the collection stream clean.'
    },
    {
      name: 'Park Clean Sweep',
      background: './assets/backgrounds/bg-park-clean-sweep.png',
      categories: ['paper', 'plastic', 'glass', 'metal', 'organic'],
      targetSorted: 21, targetScore: 1450, lives: 3,
      fallSpeed: 250, spawnEvery: 0.97, hazardChance: 0.11, bonusChance: 0.07, drift: 24, spawnMax: 3,
      description: 'Visitors left a mess in the park. Sort quickly and protect public green spaces.'
    },
    {
      name: 'Buy-back Centre Rush',
      background: './assets/backgrounds/bg-buyback-centre.png',
      categories: ['paper', 'plastic', 'glass', 'metal', 'organic'],
      targetSorted: 25, targetScore: 1880, lives: 3,
      fallSpeed: 275, spawnEvery: 0.89, hazardChance: 0.13, bonusChance: 0.08, drift: 28, spawnMax: 4,
      description: 'Materials are arriving fast. Keep the sorting line moving and preserve material value.'
    },
    {
      name: 'Material Recovery Facility',
      background: './assets/backgrounds/bg-material-recovery-facility.png',
      categories: ['paper', 'plastic', 'glass', 'metal', 'organic', 'ewaste'],
      targetSorted: 29, targetScore: 2380, lives: 3,
      fallSpeed: 305, spawnEvery: 0.82, hazardChance: 0.16, bonusChance: 0.09, drift: 34, spawnMax: 4,
      description: 'The MRF is processing more streams. Add e-waste awareness while maintaining accuracy.'
    },
    {
      name: 'Landfill Diversion Mission',
      background: './assets/backgrounds/bg-landfill-diversion.png',
      categories: ['paper', 'plastic', 'glass', 'metal', 'organic', 'ewaste'],
      targetSorted: 33, targetScore: 2950, lives: 3,
      fallSpeed: 335, spawnEvery: 0.75, hazardChance: 0.20, bonusChance: 0.10, drift: 42, spawnMax: 4,
      description: 'Recover as many materials as possible before they are lost to landfill.'
    },
    {
      name: 'E-Waste Drop-off Drive',
      background: './assets/backgrounds/bg-ewaste-dropoff.png',
      categories: ['paper', 'plastic', 'glass', 'metal', 'organic', 'ewaste'],
      targetSorted: 37, targetScore: 3600, lives: 3,
      fallSpeed: 368, spawnEvery: 0.68, hazardChance: 0.23, bonusChance: 0.11, drift: 50, spawnMax: 5,
      description: 'Electronic items are joining the stream. Watch carefully as speed and complexity increase.'
    },
    {
      name: 'Circular Economy Challenge',
      background: './assets/backgrounds/bg-circular-challenge.png',
      categories: ['paper', 'plastic', 'glass', 'metal', 'organic', 'ewaste'],
      targetSorted: 42, targetScore: 4400, lives: 3,
      fallSpeed: 398, spawnEvery: 0.60, hazardChance: 0.27, bonusChance: 0.12, drift: 58, spawnMax: 5,
      description: 'Final challenge: master all streams, chain combos, and prove you understand circular systems.'
    }
  ];

  const images = {};
  function loadImages() {
    const promises = [];
    const paths = [...new Set([...LEVELS.map(l => l.background), ...ITEM_LIBRARY.map(i => i.sprite)])];
    paths.forEach((src) => {
      const img = new Image();
      images[src] = img;
      promises.push(new Promise((resolve) => {
        img.onload = resolve; img.onerror = resolve; img.src = src;
      }));
    });
    return Promise.all(promises);
  }

  const state = {
    running: false, paused: false, gameOver: false, levelCleared: false, victory: false,
    levelIndex: 0, score: 0, best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    lives: 3, combo: 0, bestCombo: 0, sorted: 0, hazardsCleared: 0, bonusCaught: 0,
    selectedIndex: 0, spawnTimer: 0, activeItems: [], particles: [], floatTexts: [],
    shake: 0, time: 0, fact: '', factTimer: 0, swipeStartX: null, lastTick: 0,
  };

  function currentLevel() { return LEVELS[state.levelIndex]; }
  function categoryList() { return currentLevel().categories; }
  function activeCategory() { return categoryList()[state.selectedIndex] || categoryList()[0]; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  function levelProgress() {
    const level = currentLevel();
    const p1 = state.sorted / level.targetSorted;
    const p2 = state.score / level.targetScore;
    return clamp(Math.min(p1, p2), 0, 1);
  }
  function missionDone() {
    const level = currentLevel();
    return state.sorted >= level.targetSorted && state.score >= level.targetScore;
  }

  function updateLegend() {
    legendGrid.innerHTML = '';
    categoryList().forEach((key) => {
      const meta = CATEGORIES[key];
      const item = document.createElement('div');
      item.className = 'legend-item';
      item.innerHTML = `<div class="legend-dot" style="background:${meta.color}"></div><div class="legend-text"><b>${meta.label}</b><span>${meta.facts[0]}</span></div>`;
      legendGrid.appendChild(item);
    });
    const hz = document.createElement('div');
    hz.className = 'legend-item';
    hz.innerHTML = `<div class="legend-dot" style="background:${CATEGORIES.contamination.color}"></div><div class="legend-text"><b>${CATEGORIES.contamination.label}</b><span>Tap hazards before they land.</span></div>`;
    legendGrid.appendChild(hz);
  }

  function updateHUD() {
    scoreValue.textContent = Math.floor(state.score);
    livesValue.textContent = state.lives;
    comboValue.textContent = state.combo;
    bestValue.textContent = state.best;
    levelPill.textContent = `Level ${state.levelIndex + 1} • ${currentLevel().name}`;
    missionText.textContent = `${currentLevel().description}  Sorted ${state.sorted}/${currentLevel().targetSorted} • Score ${Math.floor(state.score)}/${currentLevel().targetScore}`;
    const pct = Math.round(levelProgress() * 100);
    missionPct.textContent = `${pct}%`;
    missionFill.style.width = `${pct}%`;
    postScore('live');
  }

  function showOverlay(title, text, buttonLabel = 'Start') {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    startBtn.textContent = buttonLabel;
    overlay.classList.remove('hidden');
  }
  function hideOverlay() { overlay.classList.add('hidden'); }

  function resetLevel() {
    const level = currentLevel();
    state.running = false; state.paused = false; state.gameOver = false; state.levelCleared = false; state.victory = false;
    state.lives = level.lives; state.combo = 0; state.bestCombo = 0; state.sorted = 0; state.hazardsCleared = 0; state.bonusCaught = 0;
    state.activeItems.length = 0; state.particles.length = 0; state.floatTexts.length = 0; state.spawnTimer = 0; state.selectedIndex = 0;
    state.shake = 0; state.time = 0; state.fact = CATEGORIES[categoryList()[0]].facts[0]; state.factTimer = 4;
    updateLegend(); updateHUD();
  }

  function resetGame() {
    state.levelIndex = 0; state.score = 0; resetLevel();
    showOverlay('Recycle Rush', 'Sort each falling item into the correct recycling stream.\n\nSwipe left or right to move the active bin. Tap a visible bin to jump directly to it. Tap orange mixed-waste hazards before they land.\n\nNew levels add more materials, faster drops, more hazards, and trickier movement.', 'Start');
  }

  function beginLevel() {
    state.running = true; state.paused = false; state.gameOver = false;
    ensureAudio(); startMusic(); hideOverlay(); sfx('start');
  }

  function nextLevel() {
    if (state.levelIndex >= LEVELS.length - 1) {
      state.running = false; state.victory = true; stopMusic();
      if (state.score > state.best) { state.best = Math.floor(state.score); localStorage.setItem(BEST_KEY, String(state.best)); }
      updateHUD(); postScore('victory');
      showOverlay('Circular Champion!', `You completed all ${LEVELS.length} levels!\n\nFinal score: ${Math.floor(state.score)}\nBest combo: ${state.bestCombo}\nHazards cleared: ${state.hazardsCleared}\nBonus tokens caught: ${state.bonusCaught}\n\nTap Start to play again.`, 'Play again');
      return;
    }
    state.levelIndex += 1; resetLevel();
    showOverlay(`Level ${state.levelIndex + 1}: ${currentLevel().name}`, `${currentLevel().description}\n\nGoal: ${currentLevel().targetSorted} correct sorts and ${currentLevel().targetScore} points.`, 'Start level');
  }

  // ---------- score bridge ----------
  let lastLiveScore = -1, lastLiveAt = 0;
  function postScore(mode = 'live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now - lastLiveAt < 120) return;
    lastLiveScore = clean; lastLiveAt = now;
    const payload = { gameSlug: GAME_SLUG, slug: GAME_SLUG, score: clean, best: state.best, level: state.levelIndex + 1, combo: state.combo, sorted: state.sorted, mode };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type: 'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type: 'gg:score', ...payload, payload }, '*'); } catch {}
  }

  // ---------- audio ----------
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
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master || ac.destination); osc.start(t0); osc.stop(t0 + dur + 0.03);
  }
  function noise(dur = 0.08, gain = 0.05) {
    const ac = ensureAudio(); if (!ac || muted) return;
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource(); const g = ac.createGain();
    src.buffer = buffer; g.gain.value = gain; src.connect(g); g.connect(master || ac.destination); src.start(); src.stop(ac.currentTime + dur);
  }
  function sfx(kind) {
    if (kind === 'start') { tone(410,.05,'triangle',.05); tone(640,.07,'triangle',.04,.04); return; }
    if (kind === 'sort') { tone(650,.04,'triangle',.045); tone(910,.05,'triangle',.03,.04); return; }
    if (kind === 'combo') { tone(690,.04,'triangle',.05); tone(980,.05,'triangle',.042,.04); tone(1280,.07,'sine',.032,.08); return; }
    if (kind === 'bonus') { tone(880,.06,'triangle',.05); tone(1320,.08,'sine',.045,.05); tone(1760,.08,'sine',.03,.1); return; }
    if (kind === 'hazard') { tone(520,.05,'square',.045); tone(700,.04,'triangle',.03,.03); return; }
    if (kind === 'wrong') { noise(.11,.045); tone(170,.12,'sawtooth',.05); return; }
    if (kind === 'level') { tone(380,.06,'triangle',.05); tone(620,.08,'triangle',.04,.06); tone(980,.11,'sine',.03,.13); return; }
    if (kind === 'gameover') { tone(180,.12,'sawtooth',.06); tone(120,.18,'sine',.05,.1); return; }
  }
  function musicTick() {
    if (!state.running || state.paused || muted) return;
    const lead = [196, 247, 294, 330, 294, 247, 220, 262];
    const bass = [98, 123, 147, 165, 147, 123, 110, 131];
    tone(lead[musicStep % lead.length], .08, 'triangle', .010);
    if (musicStep % 2 === 0) tone(bass[musicStep % bass.length], .12, 'sine', .008);
    if (musicStep % 4 === 3) tone(lead[(musicStep + 2) % lead.length] * 2, .05, 'sine', .006);
    musicStep++;
  }
  function startMusic() { if (!musicHandle && !muted) musicHandle = setInterval(musicTick, 240); }
  function stopMusic() { if (musicHandle) clearInterval(musicHandle); musicHandle = null; }

  // ---------- sizing ----------
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);

  function spriteForCategory(category) {
    const items = ITEM_LIBRARY.filter(i => i.category === category);
    return pick(items);
  }

  function spawnItem() {
    const level = currentLevel();
    let category = pick(level.categories);
    const r = Math.random();
    if (r < level.hazardChance) category = 'contamination';
    else if (r < level.hazardChance + level.bonusChance) category = 'bonus';
    const meta = category === 'contamination' ? ITEM_LIBRARY.find(i => i.category === 'contamination') : category === 'bonus' ? ITEM_LIBRARY.find(i => i.category === 'bonus') : spriteForCategory(category);
    const { w } = getMetrics();
    const startX = w * 0.5 + rand(-24, 24);
    state.activeItems.push({
      id: `${meta.id}-${Math.random().toString(36).slice(2)}`,
      category,
      sprite: images[meta.sprite],
      x: startX, y: -76,
      baseX: startX,
      sway: rand(0, Math.PI * 2),
      swaySpeed: rand(1.4, 2.6),
      swayAmount: level.drift,
      vy: level.fallSpeed * rand(0.92, 1.1),
      rot: rand(-0.22, 0.22), vr: rand(-1, 1) * 0.65,
      scale: category === 'bonus' ? rand(0.85, 1) : rand(0.88, 1.08),
    });
  }

  function addParticles(x, y, color, count = 16) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2; const speed = rand(60, 180);
      state.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: rand(.45,.84), ttl: rand(.45,.84), size: rand(3,8), color });
    }
  }
  function addFloatText(x, y, text, color) { state.floatTexts.push({ x, y, text, color, life: 0.95, ttl: 0.95 }); }

  function updateBest() {
    if (state.score > state.best) {
      state.best = Math.floor(state.score);
      localStorage.setItem(BEST_KEY, String(state.best));
    }
  }

  function successSort(item) {
    state.combo += 1; state.bestCombo = Math.max(state.bestCombo, state.combo); state.sorted += 1;
    const mult = state.combo >= 15 ? 2.9 : state.combo >= 10 ? 2.2 : state.combo >= 6 ? 1.7 : state.combo >= 3 ? 1.35 : 1;
    const difficultyBonus = Math.max(0, currentLevel().categories.length - 3) * 10 + state.levelIndex * 4;
    const gained = Math.round(58 * mult + difficultyBonus);
    state.score += gained;
    if (state.combo >= 3) sfx('combo'); else sfx('sort');
    addParticles(item.x, item.y, CATEGORIES[item.category].color, 18);
    addFloatText(item.x, item.y - 12, `+${gained}`, '#ffffff');
    state.fact = pick(CATEGORIES[item.category].facts); state.factTimer = 3.2;
    state.activeItems = state.activeItems.filter(a => a !== item);
    updateBest();
    if (missionDone()) {
      state.levelCleared = true; state.running = false; stopMusic(); sfx('level'); postScore('level_clear');
      showOverlay('Level Clear!', `You completed ${currentLevel().name}.\n\nScore: ${Math.floor(state.score)}\nBest combo this run: ${state.bestCombo}\nTap Start for the next level.`, 'Next level');
    }
  }

  function catchBonus(item) {
    state.combo += 1; state.bestCombo = Math.max(state.bestCombo, state.combo); state.bonusCaught += 1;
    state.score += 140 + state.levelIndex * 12;
    sfx('bonus');
    addParticles(item.x, item.y, '#ffd055', 24);
    addFloatText(item.x, item.y - 10, '+BONUS', '#ffe48a');
    state.fact = pick(CATEGORIES.bonus.facts); state.factTimer = 3;
    state.activeItems = state.activeItems.filter(a => a !== item);
    updateBest();
  }

  function failSort(item) {
    state.combo = 0; state.lives -= 1; state.shake = 16; sfx('wrong');
    addParticles(item.x, item.y, '#ff6075', 18); addFloatText(item.x, item.y - 10, '-1 life', '#ffb9c2');
    const label = CATEGORIES[item.category]?.label || 'That item';
    state.fact = `Wrong bin. ${label} belongs in the ${label} collection stream.`; state.factTimer = 3.2;
    state.activeItems = state.activeItems.filter(a => a !== item);
    if (state.lives <= 0) {
      state.running = false; state.gameOver = true; stopMusic(); sfx('gameover'); postScore('game_over');
      showOverlay('Sorting Line Stopped', `You ran out of lives in ${currentLevel().name}.\n\nScore: ${Math.floor(state.score)}\nSorted items: ${state.sorted}\nTap Start to try again.`, 'Restart');
    }
  }

  function clearHazard(item) {
    state.score += 42; state.hazardsCleared += 1; state.combo += 1; state.bestCombo = Math.max(state.bestCombo, state.combo);
    sfx('hazard'); addParticles(item.x, item.y, '#ffbd6c', 20); addFloatText(item.x, item.y - 12, '+42', '#ffdfad');
    state.fact = pick(CATEGORIES.contamination.facts); state.factTimer = 3;
    state.activeItems = state.activeItems.filter(a => a !== item);
    updateBest();
  }

  function selectDelta(delta) {
    const cats = categoryList();
    state.selectedIndex = (state.selectedIndex + delta + cats.length) % cats.length;
  }

  function handleCanvasTap(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left; const y = clientY - rect.top;
    for (let i = state.activeItems.length - 1; i >= 0; i--) {
      const item = state.activeItems[i];
      if (item.category !== 'contamination') continue;
      const r = 46 * item.scale;
      if (Math.hypot(x - item.x, y - item.y) <= r) { clearHazard(item); return; }
    }
    const bins = getBinLayout();
    for (const bin of bins) {
      if (x >= bin.x && x <= bin.x + bin.w && y >= bin.y && y <= bin.y + bin.h) {
        state.selectedIndex = bin.index; return;
      }
    }
  }

  // ---------- input ----------
  canvas.addEventListener('pointerdown', (e) => { state.swipeStartX = e.clientX; handleCanvasTap(e.clientX, e.clientY); });
  canvas.addEventListener('pointerup', (e) => {
    if (state.swipeStartX == null) return;
    const dx = e.clientX - state.swipeStartX;
    if (Math.abs(dx) > 28) selectDelta(dx < 0 ? 1 : -1);
    state.swipeStartX = null;
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); selectDelta(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); selectDelta(1); }
    if (e.key.toLowerCase() === 'p') togglePause();
    if (e.key.toLowerCase() === 'r') { resetGame(); beginLevel(); }
  });
  window.addEventListener('message', (ev) => {
    const data = ev.data || {}; const type = data.type || data.event;
    if (type === 'GG_PAUSE') {
      state.paused = !!(data.payload?.paused ?? data.paused);
      if (state.paused) stopMusic(); else if (state.running) startMusic();
    }
    if (type === 'GG_RESTART') { resetGame(); beginLevel(); }
    if (type === 'GG_MUTE') {
      muted = !!(data.payload?.muted ?? data.muted);
      if (muted) stopMusic(); else if (state.running && !state.paused) startMusic();
      muteBtn.textContent = muted ? 'Muted' : 'Sound';
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.running) {
      state.paused = true; stopMusic();
      showOverlay('Paused', 'The game is paused. Tap Start or Pause to continue.', 'Resume');
    }
  });

  // ---------- buttons ----------
  startBtn.addEventListener('click', () => {
    ensureAudio();
    if (state.victory || state.gameOver) { resetGame(); beginLevel(); return; }
    if (state.levelCleared) { nextLevel(); return; }
    if (!state.running) beginLevel();
    else if (state.paused) { state.paused = false; hideOverlay(); startMusic(); }
  });
  helpBtn.addEventListener('click', () => {
    state.paused = true; stopMusic();
    showOverlay('How to Play', 'Move the recycling carousel left or right to bring the correct bin under the drop chute.\n\n• Swipe left / right anywhere on the game area\n• Tap a bin to jump directly to it\n• Tap orange mixed-waste hazards to remove them\n• Catch bonus recycle tokens for extra points\n• Reach both the sorting target and the score target to clear each level', 'Resume');
  });
  function togglePause() {
    if (!state.running && !state.paused) return;
    state.paused = !state.paused;
    if (state.paused) { stopMusic(); showOverlay('Paused', 'The sorting line is paused. Tap Start or Pause to continue.', 'Resume'); }
    else { hideOverlay(); startMusic(); }
  }
  pauseBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', () => { resetGame(); beginLevel(); });
  submitBtn.addEventListener('click', () => postScore('manual_submit'));
  muteBtn.addEventListener('click', () => { muted = !muted; muteBtn.textContent = muted ? 'Muted' : 'Sound'; if (muted) stopMusic(); else if (state.running && !state.paused) startMusic(); });

  // ---------- drawing ----------
  function getMetrics() {
    const w = canvas.getBoundingClientRect().width; const h = canvas.getBoundingClientRect().height;
    return { w, h, centerX: w * 0.5, centerY: h * 0.5 };
  }

  function getBinLayout() {
    const { w, h, centerX } = getMetrics();
    const cats = categoryList();
    const binW = w < 620 ? 96 : 122;
    const binH = w < 620 ? 116 : 142;
    const spacing = w < 620 ? 114 : 146;
    const y = h - (w < 620 ? 138 : 168);
    return cats.map((cat, index) => {
      const offset = index - state.selectedIndex;
      const x = centerX + offset * spacing - binW / 2;
      return { index, cat, x, y, w: binW, h: binH, selected: index === state.selectedIndex };
    });
  }

  function roundedRectPath(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function drawBackground() {
    const level = currentLevel(); const img = images[level.background]; const { w, h } = getMetrics();
    if (img && img.width) {
      const ratio = Math.max(w / img.width, h / img.height); const dw = img.width * ratio; const dh = img.height * ratio;
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#143763'); g.addColorStop(1, '#07111f'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.34, 50, w * 0.5, h * 0.34, h * 0.82);
    vignette.addColorStop(0, 'rgba(255,255,255,.02)'); vignette.addColorStop(1, 'rgba(0,0,0,.38)');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);
    const floor = ctx.createLinearGradient(0, h * 0.72, 0, h);
    floor.addColorStop(0, 'rgba(0,0,0,0)'); floor.addColorStop(1, 'rgba(2,4,8,.28)');
    ctx.fillStyle = floor; ctx.fillRect(0, h * 0.72, w, h * 0.28);
  }

  function drawTopInfo() {
    const { w } = getMetrics();
    ctx.save();
    ctx.fillStyle = 'rgba(5,10,18,.34)'; roundedRectPath(14, 14, w - 28, 60, 18); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.94)'; ctx.font = '900 18px Inter, system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`Active Bin: ${CATEGORIES[activeCategory()].label}`, 28, 38);
    ctx.font = '700 13px Inter, system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.74)';
    const fact = state.fact || 'Sort materials into the correct bin to score points and progress.';
    ctx.fillText(fact, 28, 58);
    ctx.restore();
  }

  function drawDropZone() {
    const { centerX, h } = getMetrics(); const yTop = 92; const yBot = h - 206;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.setLineDash([10, 12]); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(centerX, yTop); ctx.lineTo(centerX, yBot); ctx.stroke(); ctx.setLineDash([]);
    const chuteGlow = ctx.createLinearGradient(0, yTop, 0, yTop + 32); chuteGlow.addColorStop(0, 'rgba(54,214,255,.48)'); chuteGlow.addColorStop(1, 'rgba(54,214,255,.12)');
    ctx.fillStyle = chuteGlow; roundedRectPath(centerX - 16, yTop - 6, 32, 36, 10); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '900 14px Inter, system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('DROP CHUTE', centerX, yTop + 54); ctx.restore();
  }

  function drawSorterPlatform() {
    const bins = getBinLayout();
    const { w, h } = getMetrics();
    const minX = Math.min(...bins.map(b => b.x)); const maxX = Math.max(...bins.map(b => b.x + b.w));
    const platX = minX - 30; const platY = h - 74; const platW = maxX - minX + 60; const platH = 28;
    ctx.save();
    const grad = ctx.createLinearGradient(0, platY, 0, platY + platH); grad.addColorStop(0, 'rgba(16,26,42,.95)'); grad.addColorStop(1, 'rgba(6,10,18,.98)');
    roundedRectPath(platX, platY, platW, platH, 16); ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  function drawBins() {
    const bins = getBinLayout(); const { centerX } = getMetrics();
    ctx.save();
    const selected = bins.find(b => b.selected);
    const beam = ctx.createLinearGradient(0, 0, 0, 1); beam.addColorStop(0, 'rgba(54,214,255,0)'); beam.addColorStop(1, 'rgba(54,214,255,.24)');
    ctx.fillStyle = beam; ctx.fillRect(centerX - 60, 110, 120, selected.y - 120);
    drawSorterPlatform();

    bins.forEach((bin) => {
      const meta = CATEGORIES[bin.cat];
      const pulse = bin.selected ? (1 + Math.sin(state.time * 5) * 0.018) : 1;
      const scale = (bin.selected ? 1.10 : 0.92) * pulse;
      const w = bin.w * scale; const h = bin.h * scale;
      const x = bin.x + (bin.w - w) / 2; const y = bin.y + (bin.h - h);
      ctx.save();
      ctx.shadowColor = meta.color; ctx.shadowBlur = bin.selected ? 20 : 8;
      roundedRectPath(x, y, w, h, 18); ctx.fillStyle = meta.color; ctx.globalAlpha = 0.95; ctx.fill(); ctx.globalAlpha = 1;
      roundedRectPath(x, y + 24, w, h - 24, 18); ctx.fillStyle = 'rgba(0,0,0,.26)'; ctx.fill();
      roundedRectPath(x, y, w, 30, 18); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill();
      ctx.strokeStyle = bin.selected ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.24)'; ctx.lineWidth = bin.selected ? 4 : 2;
      roundedRectPath(x, y, w, h, 18); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `900 ${bin.selected ? 16 : 14}px Inter, system-ui, sans-serif`;
      wrapText(meta.short.toUpperCase(), x + w / 2, y + h * 0.52, w - 12, 18);
      if (bin.selected) {
        ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.moveTo(centerX, y - 12); ctx.lineTo(centerX - 12, y - 32); ctx.lineTo(centerX + 12, y - 32); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    });
    ctx.restore();
  }

  function wrapText(text, x, y, maxWidth, lineHeight) {
    const words = text.split(/\s+/); let line = ''; let yy = y;
    words.forEach((word, idx) => {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, yy); line = word; yy += lineHeight; }
      else line = test;
      if (idx === words.length - 1) ctx.fillText(line, x, yy);
    });
  }

  function drawItems() {
    state.activeItems.forEach((item) => {
      const s = (item.category === 'bonus' ? 72 : 82) * item.scale;
      ctx.save(); ctx.translate(item.x, item.y); ctx.rotate(item.rot);
      ctx.shadowColor = item.category === 'contamination' ? '#ff7b54' : item.category === 'bonus' ? '#ffd055' : 'rgba(0,0,0,.28)';
      ctx.shadowBlur = item.category === 'bonus' ? 20 : item.category === 'contamination' ? 18 : 10;
      if (item.sprite && item.sprite.complete) ctx.drawImage(item.sprite, -s / 2, -s / 2, s, s);
      else { ctx.fillStyle = CATEGORIES[item.category].color; ctx.beginPath(); ctx.arc(0, 0, s * 0.34, 0, Math.PI * 2); ctx.fill(); }
      if (item.category === 'contamination') {
        ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = '900 14px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TAP!', 0, -s * 0.68);
      }
      if (item.category === 'bonus') {
        ctx.fillStyle = 'rgba(255,249,220,.96)'; ctx.font = '900 14px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('BONUS', 0, -s * 0.72);
      }
      ctx.restore();
    });
  }

  function drawParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i]; p.life -= dt;
      if (p.life <= 0) { state.particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.985; p.vy *= 0.985;
      const alpha = p.life / p.ttl;
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  function drawFloatTexts(dt) {
    for (let i = state.floatTexts.length - 1; i >= 0; i--) {
      const f = state.floatTexts[i]; f.life -= dt;
      if (f.life <= 0) { state.floatTexts.splice(i, 1); continue; }
      f.y -= 40 * dt;
      ctx.save(); ctx.globalAlpha = f.life / f.ttl; ctx.fillStyle = f.color; ctx.font = '900 22px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.text, f.x, f.y); ctx.restore();
    }
  }

  function drawFooterInfo() {
    const { w, h } = getMetrics();
    ctx.save();
    ctx.fillStyle = 'rgba(5,10,18,.42)'; roundedRectPath(18, h - 70, w - 36, 50, 18); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.10)'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '900 14px Inter, system-ui, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(`Target: ${currentLevel().targetSorted} sorts • ${currentLevel().targetScore} score`, 34, h - 40);
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.72)';
    ctx.fillText(`Hazards: ${state.hazardsCleared} • Bonus: ${state.bonusCaught}`, w - 34, h - 40);
    ctx.restore();
  }

  // ---------- update/render ----------
  function update(dt) {
    if (!state.running || state.paused || state.levelCleared || state.gameOver || state.victory) return;
    state.time += dt; state.spawnTimer += dt;
    const level = currentLevel();
    if (state.spawnTimer >= level.spawnEvery && state.activeItems.length < level.spawnMax) { state.spawnTimer = 0; spawnItem(); }

    const bins = getBinLayout(); const selected = bins.find(b => b.selected); const catchY = selected.y + 16;
    const { w } = getMetrics();

    for (let i = state.activeItems.length - 1; i >= 0; i--) {
      const item = state.activeItems[i];
      item.y += item.vy * dt; item.rot += item.vr * dt; item.sway += item.swaySpeed * dt;
      item.x = item.baseX + Math.sin(item.sway) * item.swayAmount;
      item.x = clamp(item.x, 56, w - 56);

      if (item.y >= catchY) {
        if (item.category === 'contamination') { failSort(item); continue; }
        if (item.category === 'bonus') { catchBonus(item); continue; }
        if (item.category === activeCategory()) successSort(item); else failSort(item);
      }
    }

    state.factTimer -= dt; if (state.factTimer <= 0) state.fact = '';
    state.shake *= 0.88; updateHUD();
  }

  function render(dt) {
    const { w, h } = getMetrics(); ctx.clearRect(0, 0, w, h);
    ctx.save(); if (state.shake > 0) ctx.translate(rand(-state.shake, state.shake), rand(-state.shake, state.shake));
    drawBackground(); drawDropZone(); drawTopInfo(); drawBins(); drawItems(); drawParticles(dt); drawFloatTexts(dt); drawFooterInfo(); ctx.restore();
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    update(dt); render(dt); requestAnimationFrame(loop);
  }

  loadImages().then(() => {
    resizeCanvas();
    const tags = document.querySelector('.overlay-tags');
    if (tags) tags.innerHTML = '<span>8 levels</span><span>polished art</span><span>touch controls</span><span>sounds</span>';
    resetGame(); requestAnimationFrame(loop);
  });
})();
