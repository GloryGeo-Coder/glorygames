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
  const skipBtn = $('skipBtn');
  const submitBtn = $('submitBtn');
  const restartBtn = $('restartBtn');
  const muteBtn = $('muteBtn');

  const scoreValue = $('scoreValue');
  const livesValue = $('livesValue');
  const streakValue = $('streakValue');
  const bestValue = $('bestValue');
  const levelPill = $('levelPill');
  const missionText = $('missionText');
  const missionPct = $('missionPct');
  const missionFill = $('missionFill');
  const questionText = $('questionText');
  const questionType = $('questionType');
  const learningTip = $('learningTip');
  const choicesEl = $('choices');

  const GAME_SLUG = 'map-master-africa';
  const BEST_KEY = 'gg_map_master_africa_best_v2';

  const ASSETS = {
    world: './assets/backgrounds/bg-world-overview.png',
    continents: './assets/backgrounds/bg-continents-focus.png',
    africaPolitical: './assets/backgrounds/bg-africa-political.png',
    africaPhysical: './assets/backgrounds/bg-africa-physical.png',
    southAfrica: './assets/backgrounds/bg-sa-provinces.png',
    gis: './assets/backgrounds/bg-gis-coordinates.png',
    pin: './assets/ui/map-pin.png',
    compass: './assets/ui/compass.png',
    badge: './assets/ui/master-badge.png',
  };

  const HOTSPOTS = {
    world: {
      northAmerica: { label: 'North America', x: 0.31, y: 0.37 },
      southAmerica: { label: 'South America', x: 0.38, y: 0.60 },
      europe: { label: 'Europe', x: 0.48, y: 0.34 },
      africa: { label: 'Africa', x: 0.51, y: 0.53 },
      asia: { label: 'Asia', x: 0.68, y: 0.39 },
      australia: { label: 'Australia', x: 0.73, y: 0.66 },
      antarctica: { label: 'Antarctica', x: 0.56, y: 0.78 },
    },
    africa: {
      northAfrica: { label: 'North Africa', x: 0.50, y: 0.30 },
      westAfrica: { label: 'West Africa', x: 0.40, y: 0.47 },
      eastAfrica: { label: 'East Africa', x: 0.63, y: 0.48 },
      centralAfrica: { label: 'Central Africa', x: 0.50, y: 0.53 },
      southernAfrica: { label: 'Southern Africa', x: 0.52, y: 0.75 },
      morocco: { label: 'Morocco', x: 0.40, y: 0.24 },
      egypt: { label: 'Egypt', x: 0.58, y: 0.24 },
      nigeria: { label: 'Nigeria', x: 0.42, y: 0.45 },
      ghana: { label: 'Ghana', x: 0.38, y: 0.49 },
      ethiopia: { label: 'Ethiopia', x: 0.60, y: 0.38 },
      kenya: { label: 'Kenya', x: 0.61, y: 0.50 },
      tanzania: { label: 'Tanzania', x: 0.60, y: 0.58 },
      drc: { label: 'DRC', x: 0.50, y: 0.56 },
      southAfrica: { label: 'South Africa', x: 0.52, y: 0.80 },
      madagascar: { label: 'Madagascar', x: 0.69, y: 0.73 },
      nile: { label: 'Nile River', x: 0.58, y: 0.30 },
      nigerRiver: { label: 'Niger River', x: 0.39, y: 0.41 },
      congoRiver: { label: 'Congo River', x: 0.49, y: 0.57 },
      sahara: { label: 'Sahara Desert', x: 0.48, y: 0.30 },
      kalahari: { label: 'Kalahari Desert', x: 0.51, y: 0.70 },
      atlasMountains: { label: 'Atlas Mountains', x: 0.40, y: 0.22 },
      kilimanjaro: { label: 'Mount Kilimanjaro', x: 0.61, y: 0.58 },
      riftValley: { label: 'Great Rift Valley', x: 0.61, y: 0.44 },
      lakeVictoria: { label: 'Lake Victoria', x: 0.58, y: 0.53 },
    },
    southAfrica: {
      northernCape: { label: 'Northern Cape', x: 0.38, y: 0.53 },
      westernCape: { label: 'Western Cape', x: 0.33, y: 0.66 },
      easternCape: { label: 'Eastern Cape', x: 0.47, y: 0.67 },
      freeState: { label: 'Free State', x: 0.48, y: 0.53 },
      northWest: { label: 'North West', x: 0.44, y: 0.42 },
      gauteng: { label: 'Gauteng', x: 0.53, y: 0.42 },
      mpumalanga: { label: 'Mpumalanga', x: 0.59, y: 0.46 },
      limpopo: { label: 'Limpopo', x: 0.58, y: 0.34 },
      kwazuluNatal: { label: 'KwaZulu-Natal', x: 0.63, y: 0.61 },
      capeTown: { label: 'Cape Town', x: 0.31, y: 0.69 },
      durban: { label: 'Durban', x: 0.63, y: 0.66 },
      johannesburg: { label: 'Johannesburg', x: 0.53, y: 0.45 },
      pretoria: { label: 'Pretoria', x: 0.54, y: 0.41 },
    },
    gis: {
      equator: { label: 'Equator', x: 0.50, y: 0.51 },
      primeMeridian: { label: 'Prime Meridian', x: 0.39, y: 0.39 },
      northArrow: { label: 'North Arrow', x: 0.12, y: 0.15 },
      legend: { label: 'Legend', x: 0.85, y: 0.18 },
      scaleBar: { label: 'Scale Bar', x: 0.74, y: 0.78 },
      coordinatePoint: { label: 'Coordinate Point', x: 0.62, y: 0.58 },
    }
  };

  const tap = (question, correct, hotspotKeys, fact = '') => ({ mode: 'tap', question, correct, hotspotKeys, fact });
  const choice = (question, correct, options, fact = '') => ({ mode: 'choice', question, correct, options, fact });

  const LEVELS = [
    {
      name: 'World Overview',
      map: 'world',
      background: ASSETS.world,
      target: 8,
      lives: 3,
      tip: 'Start with the big picture: world maps show continents, oceans, and global spatial relationships.',
      rounds: [
        tap('Tap the continent of Africa on the world map.', 'africa', ['africa', 'europe', 'asia', 'southAmerica'], 'Africa lies south of Europe and is bordered by the Atlantic and Indian Oceans.'),
        tap('Tap Asia.', 'asia', ['asia', 'europe', 'australia', 'africa'], 'Asia is the largest continent by land area.'),
        tap('Tap Europe.', 'europe', ['europe', 'asia', 'africa', 'northAmerica'], 'Europe lies north of the Mediterranean Sea.'),
        tap('Tap Australia.', 'australia', ['australia', 'asia', 'southAmerica', 'antarctica'], 'Australia is both a country and a continent.'),
        choice('Which continent is directly north of Africa?', 'Europe', ['Asia', 'Europe', 'Australia', 'South America'], 'Europe lies across the Mediterranean Sea from North Africa.'),
        choice('Which ocean lies to the west of Africa?', 'Atlantic Ocean', ['Pacific Ocean', 'Indian Ocean', 'Atlantic Ocean', 'Arctic Ocean'], 'The Atlantic Ocean borders western Africa.'),
        tap('Tap South America.', 'southAmerica', ['southAmerica', 'northAmerica', 'africa', 'antarctica'], 'South America lies mostly in the western hemisphere.'),
        choice('Africa is part of which hemisphere(s)?', 'Both Northern and Southern Hemispheres', ['Only Northern Hemisphere', 'Only Southern Hemisphere', 'Both Northern and Southern Hemispheres', 'Only Eastern Hemisphere'], 'The Equator crosses Africa, so the continent spans both northern and southern hemispheres.')
      ]
    },
    {
      name: 'Continents & Africa Focus',
      map: 'world',
      background: ASSETS.continents,
      target: 8,
      lives: 3,
      tip: 'Move from the world view to the continent view. Relative position helps you understand geography faster.',
      rounds: [
        tap('Tap North America.', 'northAmerica', ['northAmerica', 'southAmerica', 'europe', 'africa'], 'North America lies northwest of South America.'),
        tap('Tap Antarctica.', 'antarctica', ['antarctica', 'africa', 'australia', 'southAmerica'], 'Antarctica surrounds the South Pole.'),
        choice('Which continent lies east of Africa?', 'Asia', ['Asia', 'South America', 'Europe', 'North America'], 'Asia lies to the east-northeast of Africa.'),
        choice('Which continent lies south of Europe?', 'Africa', ['Asia', 'Africa', 'Australia', 'North America'], 'Africa lies south of Europe across the Mediterranean Sea.'),
        tap('Tap Africa again to enter the main study area.', 'africa', ['africa', 'europe', 'asia', 'australia'], 'Africa is the focus continent in this game.'),
        choice('Which continent is smallest by land area?', 'Australia', ['Africa', 'Europe', 'Australia', 'South America'], 'Australia is the smallest continent.'),
        tap('Tap the continent that contains China and India.', 'asia', ['asia', 'africa', 'europe', 'northAmerica'], 'China and India are both in Asia.'),
        choice('Which two continents are entirely in the southern hemisphere or mostly so in common school geography?', 'Australia and Antarctica', ['Europe and Africa', 'Australia and Antarctica', 'North America and Asia', 'Africa and Europe'], 'Australia and Antarctica are the southernmost continents.')
      ]
    },
    {
      name: 'Africa Countries & Capitals',
      map: 'africa',
      background: ASSETS.africaPolitical,
      target: 10,
      lives: 3,
      tip: 'Political geography connects countries to capital cities and regional location.',
      rounds: [
        tap('Tap Morocco on the Africa map.', 'morocco', ['morocco', 'egypt', 'ghana', 'southAfrica'], 'Morocco lies in northwestern Africa.'),
        choice('Capital of Morocco?', 'Rabat', ['Cairo', 'Accra', 'Rabat', 'Dodoma'], 'Rabat is the capital of Morocco.'),
        tap('Tap Nigeria.', 'nigeria', ['nigeria', 'ghana', 'kenya', 'egypt'], 'Nigeria is in West Africa and has one of the continent’s largest populations.'),
        choice('Capital of Nigeria?', 'Abuja', ['Lagos', 'Abuja', 'Nairobi', 'Accra'], 'Abuja is the capital city of Nigeria.'),
        tap('Tap Kenya.', 'kenya', ['kenya', 'ethiopia', 'tanzania', 'southAfrica'], 'Kenya is in East Africa.'),
        choice('Capital of Kenya?', 'Nairobi', ['Pretoria', 'Dodoma', 'Nairobi', 'Cairo'], 'Nairobi is the capital of Kenya.'),
        tap('Tap Egypt.', 'egypt', ['egypt', 'morocco', 'ethiopia', 'ghana'], 'Egypt lies in northeastern Africa.'),
        choice('Capital of Egypt?', 'Cairo', ['Rabat', 'Cairo', 'Addis Ababa', 'Abuja'], 'Cairo is the capital of Egypt.'),
        tap('Tap South Africa.', 'southAfrica', ['southAfrica', 'madagascar', 'tanzania', 'drc'], 'South Africa lies at the southern tip of the continent.'),
        choice('South Africa’s executive capital is commonly taught as...', 'Pretoria', ['Pretoria', 'Durban', 'Johannesburg', 'Bloemfontein'], 'Pretoria is the administrative/executive capital of South Africa.')
      ]
    },
    {
      name: 'Rivers, Mountains & Regions',
      map: 'africa',
      background: ASSETS.africaPhysical,
      target: 10,
      lives: 3,
      tip: 'Physical geography explains landforms, climate zones, river systems, and human settlement patterns.',
      rounds: [
        tap('Tap the Sahara Desert region.', 'sahara', ['sahara', 'kalahari', 'nile', 'lakeVictoria'].filter(Boolean), 'The Sahara is the largest hot desert in the world.'),
        tap('Tap the Nile River area.', 'nile', ['nile', 'congoRiver', 'nigerRiver', 'lakeVictoria'], 'The Nile is one of the longest rivers in the world.'),
        choice('Which mountain is associated with Tanzania?', 'Mount Kilimanjaro', ['Atlas Mountains', 'Mount Kilimanjaro', 'Drakensberg only', 'Ruwenzori only'], 'Mount Kilimanjaro is in Tanzania.'),
        tap('Tap Mount Kilimanjaro.', 'kilimanjaro', ['kilimanjaro', 'atlasMountains', 'riftValley', 'lakeVictoria'], 'Kilimanjaro is the highest mountain in Africa.'),
        tap('Tap Lake Victoria.', 'lakeVictoria', ['lakeVictoria', 'nile', 'riftValley', 'congoRiver'], 'Lake Victoria is one of Africa’s Great Lakes.'),
        choice('Which side of Africa is most associated with the Great Rift Valley?', 'East Africa', ['West Africa', 'East Africa', 'North Africa', 'Southern Atlantic coast'], 'The Great Rift Valley runs through East Africa.'),
        tap('Tap the Great Rift Valley area.', 'riftValley', ['riftValley', 'congoRiver', 'sahara', 'atlasMountains'], 'The Great Rift Valley is a major tectonic feature.'),
        tap('Tap the Congo River area.', 'congoRiver', ['congoRiver', 'nigerRiver', 'nile', 'southAfrica'], 'The Congo River basin is one of the wettest regions in Africa.'),
        choice('The Atlas Mountains are in which part of Africa?', 'Northwest Africa', ['East Africa', 'Northwest Africa', 'Southern Africa', 'Central Africa'], 'The Atlas Mountains stretch across Morocco, Algeria, and Tunisia.'),
        tap('Tap the Atlas Mountains area.', 'atlasMountains', ['atlasMountains', 'morocco', 'egypt', 'sahara'], 'The Atlas Mountains help shape climate and settlement in northwestern Africa.')
      ]
    },
    {
      name: 'South Africa Provinces',
      map: 'southAfrica',
      background: ASSETS.southAfrica,
      target: 10,
      lives: 3,
      tip: 'Province knowledge helps with planning, travel, governance, and geospatial decision-making in South Africa.',
      rounds: [
        tap('Tap Gauteng.', 'gauteng', ['gauteng', 'northWest', 'freeState', 'mpumalanga'], 'Gauteng is South Africa’s smallest province by area but among the most urbanised.'),
        choice('Which city is in Gauteng?', 'Johannesburg', ['Durban', 'Cape Town', 'Johannesburg', 'Kimberley'], 'Johannesburg is in Gauteng.'),
        tap('Tap Western Cape.', 'westernCape', ['westernCape', 'easternCape', 'northernCape', 'kwazuluNatal'], 'The Western Cape includes Cape Town.'),
        choice('Which city is in KwaZulu-Natal?', 'Durban', ['Durban', 'Pretoria', 'Cape Town', 'Polokwane'], 'Durban is a major coastal city in KwaZulu-Natal.'),
        tap('Tap Limpopo.', 'limpopo', ['limpopo', 'mpumalanga', 'gauteng', 'freeState'], 'Limpopo lies in the north of South Africa.'),
        tap('Tap KwaZulu-Natal.', 'kwazuluNatal', ['kwazuluNatal', 'easternCape', 'westernCape', 'mpumalanga'], 'KwaZulu-Natal borders the Indian Ocean.'),
        choice('Which province is the largest by area?', 'Northern Cape', ['Gauteng', 'Free State', 'Northern Cape', 'North West'], 'The Northern Cape is the largest province by land area.'),
        tap('Tap Northern Cape.', 'northernCape', ['northernCape', 'westernCape', 'freeState', 'northWest'], 'The Northern Cape has large arid landscapes and a low population density.'),
        tap('Tap Cape Town.', 'capeTown', ['capeTown', 'durban', 'johannesburg', 'pretoria'], 'Cape Town is in the Western Cape and is South Africa’s legislative capital.'),
        tap('Tap Pretoria.', 'pretoria', ['pretoria', 'johannesburg', 'gauteng', 'northWest'], 'Pretoria lies in Gauteng and is part of the Tshwane metropolitan area.')
      ]
    },
    {
      name: 'GIS & Coordinates',
      map: 'gis',
      background: ASSETS.gis,
      target: 10,
      lives: 3,
      tip: 'GIS combines coordinates, symbols, layers, and analysis to answer spatial questions.',
      rounds: [
        tap('Tap the Equator.', 'equator', ['equator', 'primeMeridian', 'legend', 'coordinatePoint'], 'The Equator divides the Earth into the northern and southern hemispheres.'),
        choice('Latitude measures distance north or south of the...', 'Equator', ['Equator', 'Prime Meridian', 'South Pole only', 'Compass Rose'], 'Latitude is measured north or south from the Equator.'),
        tap('Tap the Prime Meridian.', 'primeMeridian', ['primeMeridian', 'equator', 'northArrow', 'scaleBar'], 'The Prime Meridian is the reference line for longitude.'),
        choice('Longitude measures distance east or west of the...', 'Prime Meridian', ['Equator', 'Prime Meridian', 'North Arrow', 'Legend'], 'Longitude is measured east or west from the Prime Meridian.'),
        choice('Which map element explains what symbols mean?', 'Legend', ['Legend', 'Scale Bar', 'Compass Only', 'Latitude Line'], 'A legend explains the meaning of symbols, colours, and categories.'),
        tap('Tap the Legend box.', 'legend', ['legend', 'northArrow', 'scaleBar', 'coordinatePoint'], 'Legends are essential for reading a map correctly.'),
        choice('Which map element shows direction?', 'North Arrow', ['Scale Bar', 'North Arrow', 'Legend', 'Title Only'], 'A north arrow helps orient the map.'),
        tap('Tap the North Arrow.', 'northArrow', ['northArrow', 'legend', 'scaleBar', 'equator'], 'North arrows help readers understand map orientation.'),
        choice('Which element helps estimate real-world distance?', 'Scale Bar', ['North Arrow', 'Latitude', 'Scale Bar', 'Title'], 'A scale bar converts map distance to real-world distance.'),
        tap('Tap the Scale Bar.', 'scaleBar', ['scaleBar', 'legend', 'equator', 'primeMeridian'], 'Scale bars are important in GIS and cartography for measurement.')
      ]
    }
  ];

  const images = {};
  function loadImages() {
    const paths = [...new Set(Object.values(ASSETS).concat(LEVELS.map(l => l.background)))];
    return Promise.all(paths.map(src => new Promise((resolve) => {
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
    roundIndex: 0,
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    lives: 3,
    streak: 0,
    correct: 0,
    activeRound: null,
    markers: [],
    particles: [],
    floatTexts: [],
    feedback: '',
    feedbackTimer: 0,
    learningFact: '',
    learningFactTimer: 0,
    shake: 0,
    time: 0,
  };

  const currentLevel = () => LEVELS[state.levelIndex];
  const currentRounds = () => currentLevel().rounds;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

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
  function noise(dur = 0.10, gain = 0.04) {
    const ac = ensureAudio(); if (!ac || muted) return;
    const b = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = b.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource(); const g = ac.createGain();
    src.buffer = b; g.gain.value = gain; src.connect(g); g.connect(master || ac.destination);
    src.start(); src.stop(ac.currentTime + dur);
  }
  function sfx(type) {
    if (type === 'start') { tone(360, .05, 'triangle', .05); tone(560, .07, 'triangle', .04, .05); return; }
    if (type === 'right') { tone(620, .05, 'triangle', .05); tone(940, .06, 'sine', .036, .05); return; }
    if (type === 'wrong') { noise(.13, .045); tone(160, .12, 'sawtooth', .045); return; }
    if (type === 'skip') { tone(240, .05, 'sine', .03); return; }
    if (type === 'level') { tone(390, .06, 'triangle', .05); tone(650, .08, 'triangle', .04, .06); tone(960, .11, 'sine', .03, .13); return; }
    if (type === 'gameover') { tone(200, .12, 'sawtooth', .055); tone(140, .16, 'sine', .04, .1); return; }
  }
  function musicTick() {
    if (!state.running || state.paused || muted) return;
    const notes = [147, 196, 247, 294, 247, 196, 220, 294];
    const n = notes[musicStep++ % notes.length];
    tone(n, .10, 'triangle', .009);
    if (musicStep % 2 === 0) tone(n * 2, .05, 'sine', .006, .03);
  }
  function startMusic() { if (!musicHandle && !muted) musicHandle = setInterval(musicTick, 250); }
  function stopMusic() { if (musicHandle) clearInterval(musicHandle); musicHandle = null; }

  // Score bridge
  let lastLiveScore = -1, lastLiveAt = 0;
  function postScore(mode = 'live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now - lastLiveAt < 120) return;
    lastLiveScore = clean; lastLiveAt = now;
    const payload = { gameSlug: GAME_SLUG, slug: GAME_SLUG, score: clean, best: state.best, level: state.levelIndex + 1, streak: state.streak, correct: state.correct, mode };
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type: 'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type: 'gg:score', ...payload, payload }, '*'); } catch {}
  }

  function updateBest() {
    if (state.score > state.best) {
      state.best = Math.floor(state.score);
      localStorage.setItem(BEST_KEY, String(state.best));
    }
  }

  function levelProgress() {
    return clamp(state.correct / currentLevel().target, 0, 1);
  }

  function updateHUD() {
    scoreValue.textContent = Math.floor(state.score);
    livesValue.textContent = state.lives;
    streakValue.textContent = state.streak;
    bestValue.textContent = state.best;
    levelPill.textContent = `Level ${state.levelIndex + 1} • ${currentLevel().name}`;
    missionText.textContent = `Answer ${currentLevel().target} items correctly to clear this level. Correct: ${state.correct}/${currentLevel().target}`;
    const pct = Math.round(levelProgress() * 100);
    missionPct.textContent = `${pct}%`;
    missionFill.style.width = `${pct}%`;
    questionText.textContent = state.activeRound?.question || 'Tap Start to begin.';
    questionType.textContent = state.activeRound?.mode === 'choice' ? 'Multiple Choice' : 'Map Tap';
    learningTip.textContent = state.learningFact || currentLevel().tip;
    postScore('live');
  }

  function showOverlay(title, text, label = 'Start') {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    startBtn.textContent = label;
    overlay.classList.remove('hidden');
  }
  function hideOverlay() { overlay.classList.add('hidden'); }

  function setLearningFact(text, seconds = 3.2) {
    state.learningFact = text || currentLevel().tip;
    state.learningFactTimer = seconds;
  }

  function resetLevel() {
    state.running = false;
    state.paused = false;
    state.gameOver = false;
    state.levelClear = false;
    state.victory = false;
    state.roundIndex = 0;
    state.lives = currentLevel().lives;
    state.streak = 0;
    state.correct = 0;
    state.activeRound = null;
    state.markers = [];
    state.particles = [];
    state.floatTexts = [];
    state.feedback = '';
    state.feedbackTimer = 0;
    state.shake = 0;
    state.time = 0;
    setLearningFact(currentLevel().tip, 3.8);
    setupRound();
    updateHUD();
  }

  function resetGame() {
    state.levelIndex = 0;
    state.score = 0;
    resetLevel();
    showOverlay('Map Master Africa', 'This upgraded version now starts with the whole world, then continents, and then dives deeply into Africa.\n\nYou will identify continents, African countries, capitals, rivers, mountains, South African provinces, and GIS map elements.\n\nTap glowing markers on the map or answer multiple-choice questions to score points.', 'Start');
  }

  function setupRound() {
    const rounds = currentRounds();
    if (state.roundIndex >= rounds.length) state.roundIndex = 0;
    state.activeRound = rounds[state.roundIndex];
    state.markers = [];
    if (state.activeRound.mode === 'tap') {
      const hotspotGroup = HOTSPOTS[currentLevel().map];
      state.markers = state.activeRound.hotspotKeys.map((key, idx) => ({
        key,
        ...(hotspotGroup[key] || { label: key, x: 0.5, y: 0.5 }),
        pulse: Math.random() * Math.PI * 2,
        state: 'normal',
        index: idx + 1,
      }));
      choicesEl.innerHTML = '';
      choicesEl.style.display = 'none';
    } else {
      choicesEl.style.display = 'grid';
      renderChoices();
    }
    updateHUD();
  }

  function renderChoices() {
    choicesEl.innerHTML = '';
    if (!state.activeRound || state.activeRound.mode !== 'choice') return;
    state.activeRound.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = 'choice';
      btn.textContent = opt;
      btn.addEventListener('click', () => answerChoice(opt, btn));
      choicesEl.appendChild(btn);
    });
  }

  function begin() {
    state.running = true;
    state.paused = false;
    state.gameOver = false;
    ensureAudio();
    startMusic();
    hideOverlay();
    sfx('start');
  }

  function nextLevel() {
    if (state.levelIndex >= LEVELS.length - 1) {
      state.running = false;
      state.victory = true;
      stopMusic();
      updateBest();
      postScore('victory');
      showOverlay('Map Master!', `You completed all ${LEVELS.length} levels.\n\nFinal score: ${Math.floor(state.score)}\nBest score: ${state.best}\nTap Start to play again.`, 'Play again');
      return;
    }
    state.levelIndex += 1;
    resetLevel();
    showOverlay(`Level ${state.levelIndex + 1}: ${currentLevel().name}`, `${currentLevel().tip}\n\nMission: answer ${currentLevel().target} questions correctly.`, 'Start level');
  }

  function completeLevel() {
    state.running = false;
    state.levelClear = true;
    stopMusic();
    sfx('level');
    updateBest();
    postScore('level_clear');
    showOverlay('Level Complete!', `${currentLevel().name} cleared.\n\nScore: ${Math.floor(state.score)}\nStreak: ${state.streak}\nTap Start for the next level.`, 'Next level');
  }

  function endGame(reason) {
    state.running = false;
    state.gameOver = true;
    stopMusic();
    sfx('gameover');
    updateBest();
    postScore('game_over');
    showOverlay('Mission Failed', `${reason}\n\nScore: ${Math.floor(state.score)}\nBest: ${state.best}\nTap Start to try again.`, 'Restart');
  }

  function addParticles(x, y, color, count = 18) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(50, 180);
      state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(.45, .9), ttl: rand(.45, .9), size: rand(3, 8), color });
    }
  }
  function addFloatText(x, y, text, color) {
    state.floatTexts.push({ x, y, text, color, life: 0.95, ttl: 0.95 });
  }

  function advanceRound() {
    state.roundIndex += 1;
    setupRound();
  }

  function correctAnswer(x, y) {
    state.streak += 1;
    state.correct += 1;
    const mult = state.streak >= 10 ? 2.2 : state.streak >= 6 ? 1.7 : state.streak >= 3 ? 1.35 : 1;
    const gained = Math.round(80 * mult + state.levelIndex * 18);
    state.score += gained;
    updateBest();
    state.feedback = `Correct! +${gained}`;
    state.feedbackTimer = 1.2;
    setLearningFact(state.activeRound?.fact || currentLevel().tip, 3.4);
    sfx('right');
    addParticles(x, y, '#47e78d', 22);
    addFloatText(x, y - 18, `+${gained}`, '#dfffea');
    updateHUD();
    if (state.correct >= currentLevel().target) {
      completeLevel();
      return;
    }
    setTimeout(() => {
      if (state.running && !state.gameOver && !state.levelClear) advanceRound();
    }, 460);
  }

  function wrongAnswer(x, y) {
    state.streak = 0;
    state.lives -= 1;
    state.feedback = 'Try again';
    state.feedbackTimer = 1.0;
    state.shake = 12;
    sfx('wrong');
    addParticles(x, y, '#ff6075', 18);
    addFloatText(x, y - 16, 'Wrong', '#ffb9c2');
    updateHUD();
    if (state.lives <= 0) {
      endGame('You ran out of lives.');
      return;
    }
    setTimeout(() => {
      if (state.running && !state.gameOver && !state.levelClear) advanceRound();
    }, 520);
  }

  function answerChoice(opt, btn) {
    if (!state.running || state.paused || !state.activeRound || state.activeRound.mode !== 'choice') return;
    const correct = opt === state.activeRound.correct;
    [...choicesEl.children].forEach((b) => {
      b.disabled = true;
      if (b.textContent === state.activeRound.correct) b.classList.add('correct');
      if (b === btn && !correct) b.classList.add('wrong');
    });
    const r = canvas.getBoundingClientRect();
    const x = r.width * 0.5;
    const y = r.height * 0.5;
    if (correct) correctAnswer(x, y); else wrongAnswer(x, y);
  }

  function markerScreen(marker) {
    const rect = canvas.getBoundingClientRect();
    return { x: rect.width * marker.x, y: rect.height * marker.y };
  }

  function canvasPoint(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (!state.running || state.paused || !state.activeRound || state.activeRound.mode !== 'tap') return;
    const p = canvasPoint(e);
    for (const m of state.markers) {
      const s = markerScreen(m);
      const radius = 32;
      if (Math.hypot(p.x - s.x, p.y - s.y) <= radius) {
        if (m.key === state.activeRound.correct) {
          m.state = 'correct';
          correctAnswer(s.x, s.y);
        } else {
          m.state = 'wrong';
          wrongAnswer(s.x, s.y);
        }
        return;
      }
    }
  });

  function togglePause() {
    if (!state.running && !state.paused) return;
    state.paused = !state.paused;
    if (state.paused) {
      stopMusic();
      showOverlay('Paused', 'Map mission paused. Tap Start or Pause to continue.', 'Resume');
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
    state.paused = true; stopMusic();
    showOverlay('How to Play', 'This version starts with the world map and then focuses on Africa.\n\n• Map Tap rounds: tap the correct glowing marker on the map\n• Multiple Choice rounds: choose the correct answer\n• Build streaks for bonus points\n• Use Skip if you are stuck (small score penalty)\n\nTopics include continents, African countries, capitals, rivers, mountains, South African provinces, and GIS basics.', 'Resume');
  });

  pauseBtn.addEventListener('click', togglePause);
  skipBtn.addEventListener('click', () => {
    if (!state.running || state.paused) return;
    state.score = Math.max(0, state.score - 30);
    state.streak = 0;
    state.feedback = 'Skipped';
    state.feedbackTimer = 0.8;
    sfx('skip');
    advanceRound();
    updateHUD();
  });
  submitBtn.addEventListener('click', () => postScore('manual_submit'));
  restartBtn.addEventListener('click', () => { resetGame(); begin(); });
  muteBtn.addEventListener('click', () => { muted = !muted; muteBtn.textContent = muted ? 'Muted' : 'Sound'; if (muted) stopMusic(); else if (state.running && !state.paused) startMusic(); });

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'p') togglePause();
    if (e.key.toLowerCase() === 'r') { resetGame(); begin(); }
    if (e.key.toLowerCase() === 's' && state.running) skipBtn.click();
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
      showOverlay('Paused', 'Map mission paused. Tap Start or Pause to continue.', 'Resume');
    }
  });

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);

  function roundedRectPath(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawBackground() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const bg = images[currentLevel().background] || images[ASSETS.world];
    if (bg && bg.width) {
      const ratio = Math.max(w / bg.width, h / bg.height);
      const dw = bg.width * ratio, dh = bg.height * ratio;
      ctx.drawImage(bg, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = '#07111f';
      ctx.fillRect(0, 0, w, h);
    }
    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.35, 40, w * 0.5, h * 0.45, h * 0.82);
    vignette.addColorStop(0, 'rgba(255,255,255,.03)');
    vignette.addColorStop(1, 'rgba(0,0,0,.40)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  function drawTopBanner() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    ctx.save();
    roundedRectPath(18, 18, w - 36, 60, 18);
    ctx.fillStyle = 'rgba(5,10,18,.46)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.10)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.96)';
    ctx.font = '900 18px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.activeRound?.question || 'Tap Start to begin.', w * 0.5, 45);
    ctx.fillStyle = 'rgba(255,255,255,.72)';
    ctx.font = '700 12px Inter, system-ui, sans-serif';
    ctx.fillText(state.feedback || 'Focus on the map, the continent, and the clues in the question.', w * 0.5, 65);
    ctx.restore();
  }

  function drawCornerIcons() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const compass = images[ASSETS.compass];
    const badge = images[ASSETS.badge];
    if (compass && compass.width) ctx.drawImage(compass, 24, 94, 74, 74);
    if (badge && badge.width) ctx.drawImage(badge, w - 98, 94, 74, 74);
  }

  function drawMapModeLabel() {
    const rect = canvas.getBoundingClientRect();
    const y = rect.height - 126;
    const labels = {
      world: 'World + Continents',
      africa: 'Africa Focus',
      southAfrica: 'South Africa Provinces',
      gis: 'GIS & Coordinates',
    };
    const text = labels[currentLevel().map] || 'Map Mode';
    ctx.save();
    roundedRectPath(18, y, 190, 36, 14);
    ctx.fillStyle = 'rgba(5,10,18,.50)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.10)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.90)';
    ctx.font = '900 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 113, y + 23);
    ctx.restore();
  }

  function drawMarkers() {
    if (!state.activeRound || state.activeRound.mode !== 'tap') return;
    const pin = images[ASSETS.pin];
    for (const m of state.markers) {
      const p = markerScreen(m);
      const pulse = 1 + Math.sin(state.time * 4 + m.pulse) * 0.06;
      const size = (m.state === 'correct' ? 68 : m.state === 'wrong' ? 60 : 56) * pulse;
      ctx.save();
      // ring
      ctx.beginPath();
      ctx.arc(p.x, p.y, 18 + Math.sin(state.time * 5 + m.pulse) * 2, 0, Math.PI * 2);
      ctx.fillStyle = m.state === 'wrong' ? 'rgba(255,96,117,.26)' : m.state === 'correct' ? 'rgba(71,231,141,.30)' : 'rgba(54,214,255,.24)';
      ctx.fill();
      // pin image
      ctx.translate(p.x, p.y);
      ctx.shadowColor = m.state === 'wrong' ? '#ff6075' : m.state === 'correct' ? '#47e78d' : '#36d6ff';
      ctx.shadowBlur = 18;
      if (pin && pin.width) ctx.drawImage(pin, -size / 2, -size * 0.88, size, size);
      else {
        ctx.fillStyle = '#ff6075';
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,.98)';
      ctx.font = '900 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(m.index), 0, -22);
      ctx.fillStyle = 'rgba(0,0,0,.52)';
      ctx.beginPath();
      ctx.ellipse(0, 18, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawMapHintList() {
    if (!state.activeRound || state.activeRound.mode !== 'tap') return;
    const rect = canvas.getBoundingClientRect();
    const x = rect.width - 250;
    const y = rect.height - 180;
    const h = Math.min(160, 22 + state.markers.length * 26);
    ctx.save();
    roundedRectPath(x, y, 224, h, 18);
    ctx.fillStyle = 'rgba(5,10,18,.48)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.10)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.90)';
    ctx.font = '900 13px Inter, system-ui, sans-serif';
    ctx.fillText('Tap one of these markers:', x + 14, y + 22);
    ctx.font = '700 12px Inter, system-ui, sans-serif';
    let yy = y + 44;
    state.markers.forEach((m) => {
      ctx.fillStyle = 'rgba(255,255,255,.80)';
      ctx.fillText(`${m.index}. ${m.label}`, x + 16, yy);
      yy += 24;
    });
    ctx.restore();
  }

  function drawParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life -= dt;
      if (p.life <= 0) { state.particles.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.985; p.vy *= 0.985;
      const alpha = p.life / p.ttl;
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }

  function drawFloatTexts(dt) {
    for (let i = state.floatTexts.length - 1; i >= 0; i--) {
      const f = state.floatTexts[i];
      f.life -= dt;
      if (f.life <= 0) { state.floatTexts.splice(i, 1); continue; }
      f.y -= 40 * dt;
      ctx.save(); ctx.globalAlpha = f.life / f.ttl; ctx.fillStyle = f.color; ctx.font = '900 24px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.text, f.x, f.y); ctx.restore();
    }
  }

  function update(dt) {
    state.time += dt;
    if (state.feedbackTimer > 0) {
      state.feedbackTimer -= dt;
      if (state.feedbackTimer <= 0) state.feedback = '';
    }
    if (state.learningFactTimer > 0) {
      state.learningFactTimer -= dt;
      if (state.learningFactTimer <= 0) state.learningFact = currentLevel().tip;
    }
    state.shake *= 0.88;
    updateHUD();
  }

  function render(dt) {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.save();
    if (state.shake > 0) ctx.translate(rand(-state.shake, state.shake), rand(-state.shake, state.shake));
    drawBackground();
    drawTopBanner();
    drawCornerIcons();
    drawMapModeLabel();
    drawMarkers();
    drawMapHintList();
    drawParticles(dt);
    drawFloatTexts(dt);
    ctx.restore();
  }

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
    const tags = document.querySelector('.overlay-tags');
    if (tags) tags.innerHTML = '<span>6 levels</span><span>world + africa</span><span>map tap</span><span>GIS basics</span>';
    resetGame();
    requestAnimationFrame(loop);
  });
})();
