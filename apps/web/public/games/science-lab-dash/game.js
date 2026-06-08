(() => {
  'use strict';

  const GAME_SLUG = 'science-lab-dash';
  const SAVE_KEY = 'gg_science_lab_dash_v2_save';
  const BEST_KEY = 'gg_science_lab_dash_v2_best';

  const DATA = {"items": [{"id": "goggles", "name": "Safety Goggles", "category": "PPE", "description": "Protects eyes during lab investigations."}, {"id": "gloves", "name": "Lab Gloves", "category": "PPE", "description": "Protects hands and prevents contamination."}, {"id": "beaker", "name": "Beaker", "category": "Tool", "description": "Used for measuring and mixing safe virtual samples."}, {"id": "indicator", "name": "pH Indicator", "category": "Chemistry", "description": "Changes colour to suggest acidic, neutral, or basic conditions."}, {"id": "unknown_liquid", "name": "Unknown Liquid", "category": "Chemistry", "description": "A fictional classroom sample for virtual pH testing."}, {"id": "filter_paper", "name": "Filter Paper", "category": "Chemistry", "description": "Used to separate mixtures in a filtration test."}, {"id": "water_sample", "name": "Water Sample", "category": "Earth Science", "description": "A sample used in water cycle and filtration missions."}, {"id": "microscope", "name": "Microscope Lens", "category": "Biology", "description": "Used to observe cells more clearly."}, {"id": "slide", "name": "Microscope Slide", "category": "Biology", "description": "Holds a virtual sample for viewing."}, {"id": "plant_sample", "name": "Plant Sample", "category": "Biology", "description": "A safe virtual biological sample."}, {"id": "cell", "name": "Cell Card", "category": "Biology", "description": "Represents the basic unit of life."}, {"id": "dna", "name": "DNA Piece", "category": "Biology", "description": "Represents genetic information."}, {"id": "battery", "name": "Battery", "category": "Physics", "description": "Provides energy in circuit experiments."}, {"id": "wire", "name": "Wire", "category": "Physics", "description": "Connects circuit components."}, {"id": "bulb", "name": "Bulb", "category": "Physics", "description": "Lights up when the circuit is complete."}, {"id": "magnet", "name": "Magnet", "category": "Physics", "description": "Attracts certain metal materials."}, {"id": "soil", "name": "Soil Sample", "category": "Earth Science", "description": "Used in absorption and environmental science tests."}, {"id": "weather_card", "name": "Weather Data Card", "category": "Earth Science", "description": "Records temperature, rainfall, and climate clues."}, {"id": "energy", "name": "Energy Cell", "category": "Energy", "description": "Represents energy transfer in virtual experiments."}, {"id": "hazard", "name": "Hazard Symbol", "category": "Hazard", "description": "Unsafe item. Avoid it during dash missions."}], "missions": [{"id": "ppe_inspection", "title": "PPE Inspection", "module": "Lab Safety", "type": "safety", "goal": "Pass the lab safety check by selecting the correct PPE.", "required": ["goggles", "gloves"], "dashCollect": ["goggles", "gloves", "beaker"], "experiment": "safety_scan", "quiz": "lab_safety", "unlock": ["states_of_matter"], "xp": 80, "coins": 40}, {"id": "states_of_matter", "title": "States of Matter", "module": "Chemistry", "type": "dash_experiment", "goal": "Collect matter samples and identify solids, liquids, and gases.", "required": ["beaker"], "dashCollect": ["solid", "liquid", "gas", "beaker"], "experiment": "matter_sort", "quiz": "matter", "unlock": ["ph_mystery"], "xp": 110, "coins": 55}, {"id": "ph_mystery", "title": "pH Mystery Liquid", "module": "Chemistry", "type": "craft_experiment", "goal": "Craft a pH test and determine whether the unknown liquid is acidic, neutral, or basic.", "required": ["beaker", "indicator", "unknown_liquid"], "dashCollect": ["beaker", "indicator", "unknown_liquid", "goggles"], "craft": ["beaker", "indicator", "unknown_liquid"], "craftResult": "ph_test", "experiment": "ph_test", "quiz": "ph", "unlock": ["filtration_challenge", "microscope_focus"], "xp": 130, "coins": 65}, {"id": "filtration_challenge", "title": "Filtration Challenge", "module": "Chemistry", "type": "craft_experiment", "goal": "Collect filtration tools and separate a mixture using a safe virtual filter.", "required": ["beaker", "filter_paper", "water_sample"], "dashCollect": ["beaker", "filter_paper", "water_sample", "gloves"], "craft": ["beaker", "filter_paper", "water_sample"], "craftResult": "filtered_sample", "experiment": "filtration", "quiz": "filtration", "unlock": ["circuit_builder"], "xp": 140, "coins": 70}, {"id": "microscope_focus", "title": "Microscope Focus", "module": "Biology", "type": "tool_experiment", "goal": "Prepare a slide and focus the microscope to observe a plant cell.", "required": ["microscope", "slide", "plant_sample"], "dashCollect": ["microscope", "slide", "plant_sample", "cell"], "craft": ["microscope", "slide", "plant_sample"], "craftResult": "prepared_slide", "experiment": "microscope", "quiz": "cell_biology", "unlock": ["dna_builder", "ecosystem_web"], "xp": 150, "coins": 75}, {"id": "dna_builder", "title": "DNA Builder", "module": "Biology", "type": "puzzle", "goal": "Collect DNA pieces and complete a simple base-pair pattern.", "required": ["dna", "cell"], "dashCollect": ["dna", "cell", "method", "goggles"], "experiment": "dna_pattern", "quiz": "dna", "unlock": ["science_fair"], "xp": 160, "coins": 80}, {"id": "circuit_builder", "title": "Circuit Builder", "module": "Physics", "type": "tool_experiment", "goal": "Collect circuit components and build a complete circuit.", "required": ["battery", "wire", "bulb"], "dashCollect": ["battery", "wire", "bulb", "energy"], "craft": ["battery", "wire", "bulb"], "craftResult": "complete_circuit", "experiment": "circuit", "quiz": "circuits", "unlock": ["magnet_sorter"], "xp": 160, "coins": 85}, {"id": "magnet_sorter", "title": "Magnet Sorter", "module": "Physics", "type": "sorting", "goal": "Use a magnet to sort materials by magnetic attraction.", "required": ["magnet"], "dashCollect": ["magnet", "solid", "method", "energy"], "experiment": "magnet_sort", "quiz": "magnetism", "unlock": ["climate_lab"], "xp": 170, "coins": 90}, {"id": "ecosystem_web", "title": "Food Web Rescue", "module": "Earth & Life Science", "type": "logic", "goal": "Collect ecosystem evidence and connect energy flow in a food web.", "required": ["ecosystem", "energy", "cell"], "dashCollect": ["ecosystem", "energy", "cell", "climate"], "experiment": "food_web", "quiz": "ecosystems", "unlock": ["climate_lab"], "xp": 175, "coins": 95}, {"id": "climate_lab", "title": "Climate Data Lab", "module": "Earth Science", "type": "data", "goal": "Use weather cards and climate clues to interpret long-term patterns.", "required": ["weather_card", "climate", "water_sample"], "dashCollect": ["weather_card", "climate", "water_sample", "method"], "experiment": "climate_graph", "quiz": "climate", "unlock": ["science_fair"], "xp": 180, "coins": 100}, {"id": "science_fair", "title": "Science Fair Boss Challenge", "module": "Final Science Fair", "type": "boss", "goal": "Design a safe investigation, run an experiment, record results, and pass the final debrief.", "required": ["method", "beaker", "goggles", "gloves", "energy"], "dashCollect": ["method", "beaker", "goggles", "gloves", "energy", "cell", "climate", "dna"], "experiment": "science_fair", "quiz": "science_fair", "unlock": [], "xp": 250, "coins": 150}], "experiments": [{"id": "safety_scan", "title": "Safety Scan", "type": "safety", "instruction": "Select all unsafe hazards and confirm PPE before entering the lab."}, {"id": "matter_sort", "title": "Matter Sort", "type": "sort", "instruction": "Sort items into solid, liquid, and gas."}, {"id": "ph_test", "title": "pH Test", "type": "slider", "instruction": "Dip the pH strip and match the colour to the chart."}, {"id": "filtration", "title": "Filtration", "type": "sequence", "instruction": "Place the mixture, filter paper, and beaker in the correct order."}, {"id": "microscope", "title": "Microscope Focus", "type": "dial", "instruction": "Adjust focus until the cell image is sharp."}, {"id": "dna_pattern", "title": "DNA Pattern", "type": "pattern", "instruction": "Complete the base-pair pattern."}, {"id": "circuit", "title": "Circuit Builder", "type": "circuit", "instruction": "Connect battery, wire, switch, and bulb to complete the circuit."}, {"id": "magnet_sort", "title": "Magnet Sorter", "type": "sort", "instruction": "Move magnetic materials to the magnet side."}, {"id": "food_web", "title": "Food Web Rescue", "type": "logic", "instruction": "Connect Sun → producer → consumer → decomposer."}, {"id": "climate_graph", "title": "Climate Data Lab", "type": "graph", "instruction": "Read the data and identify the long-term climate pattern."}, {"id": "science_fair", "title": "Science Fair", "type": "boss", "instruction": "Use the notebook, run the final simulation, and answer the debrief."}], "quizzes": {"lab_safety": {"question": "Which item protects your eyes in the lab?", "options": ["Safety goggles", "Open beaker", "Loose paper", "Weather card"], "answer": "Safety goggles", "explanation": "Safety goggles protect your eyes from splashes and particles."}, "matter": {"question": "Which state of matter takes the shape of its container but keeps its volume?", "options": ["Solid", "Liquid", "Gas", "Plasma only"], "answer": "Liquid", "explanation": "A liquid flows to take the shape of its container but keeps its volume."}, "ph": {"question": "What does pH help us describe?", "options": ["Acidic, neutral, or basic", "Mass only", "Wind speed", "Genetic code"], "answer": "Acidic, neutral, or basic", "explanation": "pH describes how acidic or basic a solution is."}, "filtration": {"question": "What is filtration used for?", "options": ["Separating solids from liquids", "Making gravity disappear", "Creating DNA", "Changing climate"], "answer": "Separating solids from liquids", "explanation": "A filter can trap solid particles while liquid passes through."}, "cell_biology": {"question": "What is the basic unit of life?", "options": ["Cell", "Battery", "Cloud", "Magnet"], "answer": "Cell", "explanation": "Cells are the basic units of living organisms."}, "dna": {"question": "What does DNA carry?", "options": ["Genetic information", "Only heat", "Wind direction", "pH colour"], "answer": "Genetic information", "explanation": "DNA stores genetic information used by living organisms."}, "circuits": {"question": "What is needed for a bulb to light in a simple circuit?", "options": ["A complete path", "A broken wire", "No battery", "Only water"], "answer": "A complete path", "explanation": "A complete circuit allows electric current to flow."}, "magnetism": {"question": "Magnets can attract some materials made from...", "options": ["Iron", "Paper only", "Glass only", "Water only"], "answer": "Iron", "explanation": "Magnets attract ferromagnetic materials such as iron."}, "ecosystems": {"question": "What does a food web show?", "options": ["Energy flow between organisms", "Only the weather today", "Only lab PPE", "Only pH levels"], "answer": "Energy flow between organisms", "explanation": "Food webs show feeding relationships and energy transfer."}, "climate": {"question": "Climate describes...", "options": ["Long-term weather patterns", "One minute of weather", "Only the pH of water", "DNA sequence"], "answer": "Long-term weather patterns", "explanation": "Climate is based on long-term patterns over many years."}, "science_fair": {"question": "Why is a lab notebook useful?", "options": ["It records evidence and observations", "It replaces safety rules", "It hides mistakes", "It changes the result"], "answer": "It records evidence and observations", "explanation": "A notebook helps scientists track evidence, observations, and conclusions."}}, "upgrades": [{"id": "bigger_inventory", "name": "Bigger Inventory", "cost": 80, "effect": "inventorySlots", "value": 4, "description": "Carry more collected items between missions."}, {"id": "extra_shield", "name": "Extra Shield", "cost": 110, "effect": "shieldBonus", "value": 1, "description": "Start dash missions with one extra shield."}, {"id": "longer_slow", "name": "Longer Slow Time", "cost": 130, "effect": "slowBonus", "value": 2, "description": "Slow Time lasts longer during dash missions."}, {"id": "better_microscope", "name": "Better Microscope Lens", "cost": 160, "effect": "focusHelp", "value": 1, "description": "Microscope focus mini-games become easier."}, {"id": "advanced_notebook", "name": "Advanced Notebook", "cost": 200, "effect": "xpBonus", "value": 0.1, "description": "Earn bonus XP after debrief quizzes."}], "techTree": [{"id": "safety", "name": "Lab Safety", "unlocked": true, "children": ["chemistry"]}, {"id": "chemistry", "name": "Chemistry", "unlocked": false, "children": ["biology", "physics"]}, {"id": "biology", "name": "Biology", "unlocked": false, "children": ["environment"]}, {"id": "physics", "name": "Physics", "unlocked": false, "children": ["environment"]}, {"id": "environment", "name": "Earth & Environment", "unlocked": false, "children": ["science_fair"]}, {"id": "science_fair", "name": "Science Fair", "unlocked": false, "children": []}]};

  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const canvas = $('gameCanvas');
  const ctx = canvas.getContext('2d');

  const SPRITES = {
    player: './assets/sprites/scientist-runner.png',
    goggles: './assets/sprites/item-goggles.png',
    gloves: './assets/sprites/item-gloves.png',
    beaker: './assets/sprites/item-beaker.png',
    solid: './assets/sprites/item-solid.png',
    liquid: './assets/sprites/item-liquid.png',
    gas: './assets/sprites/item-gas.png',
    cell: './assets/sprites/item-cell.png',
    dna: './assets/sprites/item-dna.png',
    energy: './assets/sprites/item-energy.png',
    climate: './assets/sprites/item-climate.png',
    ecosystem: './assets/sprites/item-ecosystem.png',
    method: './assets/sprites/item-method.png',
    hazard: './assets/sprites/item-hazard.png'
  };

  const BACKGROUNDS = {
    ppe_inspection: './assets/backgrounds/bg-lab-safety.png',
    states_of_matter: './assets/backgrounds/bg-states-matter.png',
    ph_mystery: './assets/backgrounds/bg-states-matter.png',
    filtration_challenge: './assets/backgrounds/bg-scientific-method.png',
    microscope_focus: './assets/backgrounds/bg-cell-biology.png',
    dna_builder: './assets/backgrounds/bg-cell-biology.png',
    circuit_builder: './assets/backgrounds/bg-energy-lab.png',
    magnet_sorter: './assets/backgrounds/bg-energy-lab.png',
    ecosystem_web: './assets/backgrounds/bg-ecosystem-web.png',
    climate_lab: './assets/backgrounds/bg-earth-climate.png',
    science_fair: './assets/backgrounds/bg-science-boss.png'
  };

  const CATALOG = Object.fromEntries(DATA.items.map(i => [i.id, i]));
  const MISSION_BY_ID = Object.fromEntries(DATA.missions.map(m => [m.id, m]));
  const EXP_BY_ID = Object.fromEntries(DATA.experiments.map(e => [e.id, e]));

  const defaultState = () => ({
    screen: 'hub',
    score: 0,
    xp: 0,
    coins: 0,
    best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    unlocked: ['ppe_inspection'],
    completed: [],
    inventory: { goggles: 1, gloves: 1 },
    crafted: [],
    notebook: [{
      title: 'Welcome to Science Lab Dash v2',
      body: 'Your lab notebook records observations, results, mistakes, and theory cards as you complete missions.'
    }],
    purchased: [],
    activeMissionId: null,
    phase: 'hub',
    muted: false,
    quizTries: 0,
    experimentState: {},
    dash: {
      running: false,
      paused: false,
      lane: 1,
      items: [],
      particles: [],
      floatTexts: [],
      spawnTimer: 0,
      collected: 0,
      target: 8,
      lives: 3,
      streak: 0,
      shield: 1,
      shieldActive: false,
      slow: 1,
      slowTimer: 0,
      time: 0,
      shake: 0,
      finished: false
    }
  });

  let state = loadState();
  const images = {};

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (saved && typeof saved === 'object') {
        const fresh = defaultState();
        return { ...fresh, ...saved, dash: { ...fresh.dash, ...(saved.dash || {}) } };
      }
    } catch {}
    return defaultState();
  }

  function saveState() {
    const copy = { ...state, dash: { ...state.dash, running: false, paused: false, items: [], particles: [], floatTexts: [] } };
    localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
    if (state.score > state.best) {
      state.best = Math.floor(state.score);
      localStorage.setItem(BEST_KEY, String(state.best));
    }
  }

  function resetAll() {
    localStorage.removeItem(SAVE_KEY);
    state = defaultState();
    switchScreen('hub');
    renderAll();
  }

  function loadImages() {
    const paths = [...new Set([...Object.values(SPRITES), ...Object.values(BACKGROUNDS)])];
    return Promise.all(paths.map(src => new Promise(resolve => {
      const img = new Image();
      images[src] = img;
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    })));
  }

  // Audio
  let AC = null, master = null, musicHandle = null, musicStep = 0;
  function ensureAudio() {
    if (state.muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC) {
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = 0.11;
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
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master || ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }
  function sfx(type) {
    if (type === 'good') { tone(650,.04,'triangle',.05); tone(940,.06,'sine',.035,.05); }
    if (type === 'bad') { tone(160,.11,'sawtooth',.045); }
    if (type === 'move') { tone(520,.03,'sine',.025); }
    if (type === 'success') { tone(390,.06,'triangle',.05); tone(650,.08,'triangle',.04,.06); tone(980,.11,'sine',.03,.13); }
    if (type === 'power') { tone(480,.05,'triangle',.05); tone(780,.08,'sine',.04,.05); }
  }
  function musicTick() {
    if (!state.dash.running || state.dash.paused || state.muted) return;
    const notes = [196,247,294,330,294,247,220,262];
    const n = notes[musicStep++ % notes.length];
    tone(n,.08,'triangle',.008);
    if (musicStep % 2 === 0) tone(n/2,.12,'sine',.006);
  }
  function startMusic() { if (!musicHandle && !state.muted) musicHandle = setInterval(musicTick, 260); }
  function stopMusic() { if (musicHandle) clearInterval(musicHandle); musicHandle = null; }

  // Score bridge
  let lastLiveScore = -1, lastLiveAt = 0;
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
      best: state.best,
      xp: state.xp,
      coins: state.coins,
      completed: state.completed.length,
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

  function addInventory(id, n = 1) { state.inventory[id] = (state.inventory[id] || 0) + n; }
  function hasItems(ids = []) { return ids.every(id => (state.inventory[id] || 0) > 0); }
  function consumeItems(ids = []) { ids.forEach(id => state.inventory[id] = Math.max(0, (state.inventory[id] || 0) - 1)); }
  function addNotebook(title, body) { state.notebook.unshift({ title, body, time: new Date().toLocaleString() }); }
  function activeMission() { return MISSION_BY_ID[state.activeMissionId] || null; }
  function isUnlocked(m) { return state.unlocked.includes(m.id); }
  function isComplete(m) { return state.completed.includes(m.id); }

  function switchScreen(screen) {
    state.screen = screen;
    $$('.screen').forEach(s => s.classList.remove('active'));
    const el = $('screen-' + screen);
    if (el) el.classList.add('active');
    $$('.nav').forEach(n => n.classList.toggle('active', n.dataset.screen === screen));
    if (screen !== 'dash') stopMusic();
    if (screen === 'dash') setTimeout(resizeCanvas, 50);
    renderAll();
    saveState();
  }

  function renderAll() {
    renderStats();
    renderHub();
    renderMissionGrid();
    renderInventory();
    renderBench();
    renderNotebook();
    renderTechTree();
    renderUpgrades();
    renderActiveMission();
    postScore('live');
  }

  function renderStats() {
    $('scoreValue').textContent = Math.floor(state.score);
    $('xpValue').textContent = Math.floor(state.xp);
    $('coinValue').textContent = Math.floor(state.coins);
    $('bestValue').textContent = Math.max(state.best, state.score);
    $('muteBtn').textContent = state.muted ? 'Muted' : 'Sound';
  }

  function renderActiveMission() {
    const m = activeMission();
    $('activeMissionText').innerHTML = m ? `<b>${m.title}</b><br>${m.goal}` : 'No mission selected.';
  }

  function renderHub() {
    const total = DATA.missions.length;
    const done = state.completed.length;
    $('overallProgress').style.width = `${Math.round(done / total * 100)}%`;
    $('progressText').textContent = `${done} of ${total} missions completed.`;
    const next = DATA.missions.find(m => isUnlocked(m) && !isComplete(m));
    $('nextStep').textContent = next ? `Next mission: ${next.title}.` : 'All missions completed. Science Fair mastered.';
    const modules = unlockedModules().join(', ');
    $('labStatus').textContent = `Unlocked modules: ${modules || 'Lab Safety'}.`;
  }

  function renderMissionGrid() {
    const grid = $('missionGrid');
    grid.innerHTML = '';
    DATA.missions.forEach(m => {
      const locked = !isUnlocked(m);
      const done = isComplete(m);
      const card = document.createElement('div');
      card.className = `mission-card ${locked ? 'locked' : ''} ${done ? 'done' : ''}`;
      card.innerHTML = `
        <span class="tag">${m.module}</span>
        <h3>${m.title}</h3>
        <p>${m.goal}</p>
        <div class="mini"><b>Rewards:</b> ${m.xp} XP • ${m.coins} coins</div>
        <button class="${!locked ? 'primary' : ''}" ${locked ? 'disabled' : ''}>
          ${done ? 'Replay Mission' : locked ? 'Locked' : 'Start Mission'}
        </button>
      `;
      card.querySelector('button').addEventListener('click', () => startMission(m.id));
      grid.appendChild(card);
    });
  }

  function renderInventory() {
    const grid = $('inventoryGrid');
    grid.innerHTML = '';
    const entries = Object.entries(state.inventory).filter(([,count]) => count > 0);
    if (!entries.length) {
      grid.innerHTML = '<div class="card"><p>No inventory yet. Complete dash missions to collect resources.</p></div>';
      return;
    }
    entries.forEach(([id,count]) => {
      const item = CATALOG[id] || { name: id, category: 'Item', description: '' };
      const sprite = spriteFor(id);
      const div = document.createElement('div');
      div.className = 'inv-item';
      div.innerHTML = `
        <img src="${sprite}" alt="">
        <div>
          <b>${item.name} × ${count}</b>
          <span>${item.category}</span>
        </div>
      `;
      grid.appendChild(div);
    });
  }

  function renderBench() {
    const m = activeMission();
    if (!m || !m.craft) {
      $('recipeText').textContent = 'Select a mission with a crafting recipe. Some experiments can run without crafting.';
      $('craftBtn').disabled = true;
    } else {
      const names = m.craft.map(id => CATALOG[id]?.name || id).join(' + ');
      const has = hasItems(m.craft);
      const crafted = state.crafted.includes(m.craftResult);
      $('recipeText').textContent = crafted ? `${m.craftResult.replaceAll('_',' ')} is ready.` : `${names} → ${m.craftResult.replaceAll('_',' ')}`;
      $('craftBtn').disabled = !has || crafted;
    }
    const list = $('craftedList');
    list.innerHTML = '';
    if (!state.crafted.length) list.innerHTML = '<span class="pill">No crafted setups yet</span>';
    state.crafted.forEach(c => {
      const span = document.createElement('span');
      span.className = 'pill';
      span.textContent = c.replaceAll('_',' ');
      list.appendChild(span);
    });
  }

  function renderNotebook() {
    const box = $('notebookEntries');
    box.innerHTML = '';
    state.notebook.forEach(n => {
      const div = document.createElement('div');
      div.className = 'note';
      div.innerHTML = `<h3>${n.title}</h3><p>${n.body}</p>${n.time ? `<p class="mini">${n.time}</p>` : ''}`;
      box.appendChild(div);
    });
  }

  function unlockedModules() {
    const modules = new Set();
    DATA.missions.forEach(m => { if (isUnlocked(m) || isComplete(m)) modules.add(m.module); });
    return [...modules];
  }

  function renderTechTree() {
    const box = $('techTree');
    box.innerHTML = '';
    const completed = new Set(state.completed);
    const moduleUnlocked = {
      safety: true,
      chemistry: completed.has('ppe_inspection') || state.unlocked.includes('states_of_matter'),
      biology: completed.has('ph_mystery') || completed.has('microscope_focus') || state.unlocked.includes('microscope_focus'),
      physics: completed.has('filtration_challenge') || completed.has('circuit_builder') || state.unlocked.includes('circuit_builder'),
      environment: completed.has('ecosystem_web') || completed.has('climate_lab') || completed.has('magnet_sorter'),
      science_fair: completed.has('science_fair') || state.unlocked.includes('science_fair')
    };
    DATA.techTree.forEach(t => {
      const unlocked = !!moduleUnlocked[t.id];
      const div = document.createElement('div');
      div.className = `tech-node ${unlocked ? 'unlocked' : 'locked'}`;
      div.innerHTML = `<h3>${unlocked ? '✅' : '🔒'} ${t.name}</h3><p>${unlocked ? 'Unlocked through mission progress.' : 'Complete earlier missions to unlock this branch.'}</p>`;
      box.appendChild(div);
    });
  }

  function renderUpgrades() {
    const grid = $('upgradeGrid');
    grid.innerHTML = '';
    DATA.upgrades.forEach(u => {
      const bought = state.purchased.includes(u.id);
      const can = state.coins >= u.cost && !bought;
      const card = document.createElement('div');
      card.className = `mission-card ${bought ? 'done' : ''}`;
      card.innerHTML = `
        <span class="tag">Upgrade</span>
        <h3>${u.name}</h3>
        <p>${u.description}</p>
        <div class="mini"><b>Cost:</b> ${u.cost} coins</div>
        <button class="upgrade-btn ${can ? 'primary' : ''}" ${can ? '' : 'disabled'}>${bought ? 'Purchased' : 'Buy Upgrade'}</button>
      `;
      card.querySelector('button').addEventListener('click', () => buyUpgrade(u.id));
      grid.appendChild(card);
    });
  }

  function buyUpgrade(id) {
    const u = DATA.upgrades.find(x => x.id === id);
    if (!u || state.purchased.includes(id) || state.coins < u.cost) return;
    state.coins -= u.cost;
    state.purchased.push(id);
    addNotebook('Upgrade Purchased', `${u.name}: ${u.description}`);
    sfx('success');
    renderAll();
    saveState();
  }

  function startMission(id) {
    const m = MISSION_BY_ID[id];
    if (!m || !isUnlocked(m)) return;
    state.activeMissionId = id;
    state.levelIndex = DATA.missions.findIndex(x => x.id === id);
    state.phase = 'safety';
    renderSafety();
    switchScreen('safety');
  }

  function renderSafety() {
    const m = activeMission();
    $('safetyMissionTitle').textContent = m ? `${m.title} Safety Check` : 'Safety Check';
    $('safetyPrompt').textContent = 'Select goggles, gloves, the spill, and the unlabeled sample to pass inspection.';
    const options = [
      ['goggles','Safety goggles'],
      ['gloves','Lab gloves'],
      ['snacks','Snacks near bench'],
      ['spill','Liquid spill'],
      ['unlabeled','Unlabeled sample'],
      ['phone','Phone on silent']
    ];
    const required = new Set(['goggles','gloves','spill','unlabeled']);
    const selected = new Set();
    const box = $('safetyOptions');
    box.innerHTML = '';
    options.forEach(([id,label]) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        if (selected.has(id)) selected.delete(id); else selected.add(id);
        btn.classList.toggle('selected', selected.has(id));
      });
      box.appendChild(btn);
    });
    $('safetySubmitBtn').onclick = () => {
      const passed = [...required].every(id => selected.has(id));
      if (!passed) {
        sfx('bad');
        addNotebook('Safety Check Failed', 'The lab inspection was not passed. PPE and hazards must be identified before experiments.');
        $('safetyPrompt').textContent = 'Try again: PPE protects you, and hazards must be scanned.';
        renderNotebook();
        return;
      }
      sfx('success');
      addNotebook('Safety Check Passed', `PPE and hazards checked for ${m.title}.`);
      startDash();
    };
    $('safetyStage').innerHTML = `
      <div class="lab-visual">
        <div>
          <h2>Safety Inspection</h2>
          <p>Check PPE and scan the lab bench for unsafe conditions.</p>
          <p>✅ goggles + gloves<br>⚠️ spill + unlabeled sample</p>
        </div>
      </div>
    `;
  }

  function startDash() {
    const m = activeMission();
    if (!m) return;
    const shieldBonus = state.purchased.includes('extra_shield') ? 1 : 0;
    Object.assign(state.dash, {
      running: true,
      paused: false,
      lane: 1,
      items: [],
      particles: [],
      floatTexts: [],
      spawnTimer: 0,
      collected: 0,
      target: Math.max(6, Math.min(13, (m.dashCollect || []).length + 5)),
      lives: 3,
      streak: 0,
      shield: 1 + shieldBonus,
      shieldActive: false,
      slow: 1,
      slowTimer: 0,
      time: 0,
      shake: 0,
      finished: false
    });
    $('dashTitle').textContent = m.title;
    $('dashPrompt').textContent = `Collect resources: ${m.dashCollect.map(id => CATALOG[id]?.name || id).join(', ')}`;
    switchScreen('dash');
    startMusic();
  }

  function finishDash(success = true) {
    const m = activeMission();
    state.dash.running = false;
    stopMusic();
    if (!success) {
      addNotebook('Dash Failed', 'The dash run ended before enough resources were collected. Retry the mission.');
      switchScreen('missions');
      return;
    }
    addNotebook('Resources Collected', `Collected enough resources for ${m.title}. Inventory updated.`);
    if (m.craft && !state.crafted.includes(m.craftResult)) {
      switchScreen('bench');
      return;
    }
    startExperiment();
  }

  function startExperiment() {
    const m = activeMission();
    if (!m) return;
    if (m.craft && !state.crafted.includes(m.craftResult)) {
      switchScreen('bench');
      return;
    }
    state.phase = 'experiment';
    state.experimentState = defaultExperimentState(m.experiment);
    renderExperiment();
    switchScreen('experiment');
  }

  function defaultExperimentState(id) {
    if (id === 'ph_test') return { value: 7 };
    if (id === 'microscope') return { focus: 20 };
    if (id === 'circuit') return { battery:false, wire:false, bulb:false, switch:false };
    if (id === 'dna_pattern') return { answer:'' };
    if (id === 'climate_graph') return { answer:'' };
    return { choice:'' };
  }

  function renderExperiment() {
    const m = activeMission();
    const exp = EXP_BY_ID[m.experiment];
    $('experimentTitle').textContent = exp.title;
    $('experimentInstruction').textContent = exp.instruction;
    const controls = $('experimentControls');
    const stage = $('experimentStage');
    controls.innerHTML = '';
    stage.innerHTML = '';

    const visual = document.createElement('div');
    visual.className = 'lab-visual';

    const makeButton = (label, onClick) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.addEventListener('click', onClick);
      controls.appendChild(b);
      return b;
    };

    if (exp.id === 'ph_test') {
      controls.innerHTML = `<label>pH strip colour match: <input id="phSlider" type="range" min="0" max="14" value="${state.experimentState.value}"></label><p id="phValue">pH: ${state.experimentState.value}</p>`;
      controls.querySelector('#phSlider').addEventListener('input', e => {
        state.experimentState.value = Number(e.target.value);
        controls.querySelector('#phValue').textContent = `pH: ${state.experimentState.value}`;
        visual.innerHTML = `<h2>pH Strip</h2><p>Colour match reading: ${state.experimentState.value}</p>`;
      });
      visual.innerHTML = '<h2>pH Strip</h2><p>Move the slider to match the observed blue-green strip.</p>';
    } else if (exp.id === 'microscope') {
      controls.innerHTML = `<label>Focus dial: <input id="focusSlider" type="range" min="0" max="100" value="${state.experimentState.focus}"></label><p id="focusValue">Focus: ${state.experimentState.focus}</p>`;
      controls.querySelector('#focusSlider').addEventListener('input', e => {
        state.experimentState.focus = Number(e.target.value);
        controls.querySelector('#focusValue').textContent = `Focus: ${state.experimentState.focus}`;
        const sharp = Math.abs(state.experimentState.focus - 52);
        visual.innerHTML = `<h2>${sharp < 8 ? 'Sharp Cell Image' : 'Blurry Cell Image'}</h2><p>${sharp < 8 ? 'Nucleus and cell wall are visible.' : 'Adjust focus closer to the clear range.'}</p>`;
      });
      visual.innerHTML = '<h2>Microscope View</h2><p>Adjust focus until the cell is sharp.</p>';
    } else if (exp.id === 'circuit') {
      ['battery','wire','bulb','switch'].forEach(k => makeButton(`${state.experimentState[k] ? '✓ ' : ''}${k}`, () => {
        state.experimentState[k] = !state.experimentState[k];
        renderExperiment();
      }));
      visual.innerHTML = `<h2>Circuit Board</h2><p>${['battery','wire','bulb','switch'].filter(k => state.experimentState[k]).join(' + ') || 'No components connected yet.'}</p>`;
    } else if (exp.id === 'dna_pattern') {
      controls.innerHTML = '<p>Complete the base pair: A pairs with ?</p>';
      ['A','T','C','G'].forEach(opt => makeButton(opt, () => { state.experimentState.answer = opt; renderExperiment(); }));
      visual.innerHTML = `<h2>DNA Builder</h2><p>A pairs with: <b>${state.experimentState.answer || '...'}</b></p>`;
    } else if (exp.id === 'climate_graph') {
      controls.innerHTML = '<p>Data trend: 2019: 21°C, 2020: 21.3°C, 2021: 21.7°C, 2022: 22.1°C</p>';
      ['Cooling','Warming','No pattern'].forEach(opt => makeButton(opt, () => { state.experimentState.answer = opt; renderExperiment(); }));
      visual.innerHTML = `<h2>Climate Graph</h2><p>Selected trend: <b>${state.experimentState.answer || '...'}</b></p>`;
    } else {
      const buttons = {
        safety_scan:['PPE ready','Bench unsafe'],
        matter_sort:['Solid / Liquid / Gas sorted','All gases only'],
        filtration:['Mixture → filter → beaker','Beaker → dirt → no filter'],
        magnet_sort:['Iron to magnet side','Glass to magnet side'],
        food_web:['Sun → plant → animal → decomposer','Animal → Sun → plant'],
        science_fair:['Hypothesis → test → data → conclusion','Conclusion before test']
      }[exp.id] || ['Run correctly','Run incorrectly'];
      buttons.forEach(opt => makeButton(opt, () => { state.experimentState.choice = opt; renderExperiment(); }));
      visual.innerHTML = `<h2>${exp.title}</h2><p>Selected: <b>${state.experimentState.choice || '...'}</b></p>`;
    }

    stage.appendChild(visual);
  }

  function runExperiment() {
    const m = activeMission();
    const exp = EXP_BY_ID[m.experiment];
    let ok = false;
    let result = '';

    if (exp.id === 'ph_test') { ok = state.experimentState.value >= 7 && state.experimentState.value <= 10; result = `pH reading ${state.experimentState.value} recorded.`; }
    else if (exp.id === 'microscope') { ok = Math.abs(state.experimentState.focus - 52) <= (state.purchased.includes('better_microscope') ? 14 : 9); result = 'Microscope focus observation recorded.'; }
    else if (exp.id === 'circuit') { ok = ['battery','wire','bulb','switch'].every(k => state.experimentState[k]); result = ok ? 'The bulb lit up because the circuit was complete.' : 'The bulb did not light because the circuit path was incomplete.'; }
    else if (exp.id === 'dna_pattern') { ok = state.experimentState.answer === 'T'; result = 'DNA base-pair pattern recorded.'; }
    else if (exp.id === 'climate_graph') { ok = state.experimentState.answer === 'Warming'; result = 'Climate graph trend recorded.'; }
    else {
      const c = state.experimentState.choice || '';
      ok = !/unsafe|gases only|no filter|Glass|Animal → Sun|Conclusion before/i.test(c) && c.length > 0;
      result = ok ? 'Experiment completed using the correct method.' : 'Unexpected result. Review the method and try again.';
    }

    if (!ok) {
      sfx('bad');
      addNotebook('Experiment Mistake', `${exp.title}: ${result} This is a safe virtual failure. Check the method and try again.`);
      renderNotebook();
      return;
    }

    sfx('success');
    const xpGain = 30;
    state.xp += xpGain;
    state.score += 120 + Math.max(0, state.levelIndex) * 15;
    addNotebook(exp.title, `${result} Observation added to notebook. +${xpGain} XP.`);
    startQuiz();
  }

  function startQuiz() {
    state.quizTries = 0;
    renderQuiz();
    switchScreen('quiz');
  }

  function renderQuiz() {
    const m = activeMission();
    const q = DATA.quizzes[m.quiz];
    $('quizQuestion').textContent = q.question;
    $('quizFeedback').textContent = '';
    const box = $('quizOptions');
    box.innerHTML = '';
    q.options.forEach(opt => {
      const b = document.createElement('button');
      b.textContent = opt;
      b.addEventListener('click', () => answerQuiz(opt));
      box.appendChild(b);
    });
  }

  function answerQuiz(opt) {
    const m = activeMission();
    const q = DATA.quizzes[m.quiz];
    state.quizTries += 1;
    const correct = opt === q.answer;
    [...$('quizOptions').children].forEach(b => {
      b.disabled = true;
      if (b.textContent === q.answer) b.classList.add('correct');
      if (b.textContent === opt && !correct) b.classList.add('wrong');
    });

    if (!correct && state.quizTries < 2) {
      $('quizFeedback').textContent = `Not quite. ${q.explanation} Try again.`;
      setTimeout(renderQuiz, 1200);
      return;
    }

    const xpBonus = state.purchased.includes('advanced_notebook') ? 1.1 : 1;
    const xpGain = Math.round((correct ? m.xp : Math.floor(m.xp * 0.65)) * xpBonus);
    const coinGain = correct ? m.coins : Math.floor(m.coins * 0.65);
    state.xp += xpGain;
    state.coins += coinGain;
    state.score += xpGain + coinGain + (correct ? 100 : 40);
    unlockMissions(m.unlock || []);
    if (!state.completed.includes(m.id)) state.completed.push(m.id);
    addNotebook('Debrief Complete', `${m.title} completed. ${q.explanation} Rewards: +${xpGain} XP and +${coinGain} coins.`);
    saveState();
    postScore('mission_complete');
    $('quizFeedback').textContent = `Mission complete. ${q.explanation}`;
    setTimeout(() => switchScreen('hub'), 1500);
  }

  function unlockMissions(ids) {
    ids.forEach(id => {
      if (!state.unlocked.includes(id)) state.unlocked.push(id);
    });
  }

  function craftCurrent() {
    const m = activeMission();
    if (!m?.craft || state.crafted.includes(m.craftResult) || !hasItems(m.craft)) return;
    consumeItems(m.craft);
    state.crafted.push(m.craftResult);
    state.score += 60;
    addNotebook('Crafting Complete', `${m.craft.map(id => CATALOG[id]?.name || id).join(' + ')} created ${m.craftResult.replaceAll('_',' ')}.`);
    sfx('success');
    renderAll();
    saveState();
    setTimeout(startExperiment, 500);
  }

  // Dash gameplay
  function spriteFor(id) { return SPRITES[id] || SPRITES.beaker; }
  function itemName(id) { return CATALOG[id]?.name || id.replaceAll('_',' '); }
  function getMetrics() {
    const r = canvas.getBoundingClientRect();
    return { w: r.width || 900, h: r.height || 520 };
  }
  function laneCenter(lane) {
    const { w } = getMetrics();
    const pad = w * 0.18;
    const laneW = (w - pad * 2) / 3;
    return pad + laneW * lane + laneW / 2;
  }
  function playerY() { return getMetrics().h * 0.72; }

  function spawnDashItem() {
    const m = activeMission();
    const dash = state.dash;
    const isHazard = Math.random() < 0.22;
    const key = isHazard ? 'hazard' : pick(m.dashCollect || ['beaker']);
    const lane = Math.floor(Math.random() * 3);
    dash.items.push({
      key,
      lane,
      x: laneCenter(lane),
      y: -70,
      vy: rand(210, 295) + Math.min(90, state.completed.length * 6),
      scale: rand(0.86, 1.08),
      rot: rand(-0.25,0.25),
      vr: rand(-0.8,0.8),
      caught: false
    });
  }

  function pick(arr) { return arr[(Math.random()*arr.length)|0]; }
  function rand(a,b) { return a + Math.random() * (b-a); }
  function clamp(v,a,b) { return Math.max(a, Math.min(b, v)); }

  function moveLane(lane) {
    if (!state.dash.running || state.dash.paused) return;
    state.dash.lane = clamp(lane, 0, 2);
    sfx('move');
  }
  function moveDelta(delta) { moveLane(state.dash.lane + delta); }

  function useShield() {
    const d = state.dash;
    if (!d.running || d.paused || d.shield <= 0 || d.shieldActive) return;
    d.shield -= 1;
    d.shieldActive = true;
    addFloatText(getMetrics().w/2, getMetrics().h*.32, 'Shield active', '#baffcf');
    sfx('power');
  }
  function useSlow() {
    const d = state.dash;
    if (!d.running || d.paused || d.slow <= 0 || d.slowTimer > 0) return;
    d.slow -= 1;
    d.slowTimer = state.purchased.includes('longer_slow') ? 7 : 5;
    addFloatText(getMetrics().w/2, getMetrics().h*.32, 'Slow time', '#ffe48a');
    sfx('power');
  }

  function collectDashItem(item) {
    const d = state.dash;
    item.caught = true;
    if (item.key === 'hazard') {
      d.streak = 0;
      if (d.shieldActive) {
        d.shieldActive = false;
        addFloatText(item.x,item.y-20,'Shield saved you','#ffe48a');
        sfx('power');
      } else {
        d.lives -= 1;
        d.shake = 13;
        addFloatText(item.x,item.y-20,'Hazard! -1 life','#ffb9c2');
        sfx('bad');
      }
      addParticles(item.x,item.y,'#ff6075',18);
      if (d.lives <= 0) setTimeout(() => finishDash(false), 300);
      return;
    }

    addInventory(item.key, 1);
    d.collected += 1;
    d.streak += 1;
    const gained = Math.round(50 + d.streak * 8 + state.completed.length * 5);
    state.score += gained;
    updateBest();
    addFloatText(item.x,item.y-20,`+${gained} ${itemName(item.key)}`,'#dfffea');
    addParticles(item.x,item.y,'#47e78d',18);
    sfx('good');

    if (d.collected >= d.target) {
      setTimeout(() => finishDash(true), 400);
    }
  }

  function addParticles(x,y,color,count=18) {
    const d = state.dash;
    for (let i=0;i<count;i++) {
      const a = Math.random()*Math.PI*2;
      const s = rand(55,190);
      d.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rand(.45,.9),ttl:.9,size:rand(3,8),color});
    }
  }
  function addFloatText(x,y,text,color) {
    state.dash.floatTexts.push({x,y,text,color,life:1,ttl:1});
  }

  function updateDash(dt) {
    const d = state.dash;
    if (!d.running || d.paused || state.screen !== 'dash') return;
    d.time += dt;
    const slowFactor = d.slowTimer > 0 ? .55 : 1;
    if (d.slowTimer > 0) d.slowTimer = Math.max(0, d.slowTimer - dt);

    d.spawnTimer += dt;
    if (d.spawnTimer > Math.max(.45, 1.0 - state.completed.length * .03)) {
      d.spawnTimer = 0;
      spawnDashItem();
    }

    const catchY = playerY() - 30;
    for (let i=d.items.length-1;i>=0;i--) {
      const item = d.items[i];
      item.y += item.vy * slowFactor * dt;
      item.rot += item.vr * dt;
      item.x = laneCenter(item.lane);
      if (!item.caught && item.lane === d.lane && Math.abs(item.y - catchY) < 58) {
        collectDashItem(item);
        d.items.splice(i,1);
        continue;
      }
      if (item.y > getMetrics().h + 90) d.items.splice(i,1);
    }

    d.particles.forEach(p => {
      p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= .985; p.vy *= .985;
    });
    d.particles = d.particles.filter(p => p.life > 0);

    d.floatTexts.forEach(f => { f.life -= dt; f.y -= 42*dt; });
    d.floatTexts = d.floatTexts.filter(f => f.life > 0);
    d.shake *= .88;

    $('shieldBtn').textContent = d.shieldActive ? 'Shield ON' : `Shield ${d.shield}`;
    $('slowBtn').textContent = d.slowTimer > 0 ? 'Slow ON' : `Slow ${d.slow}`;
    $('dashPrompt').textContent = `Collected ${d.collected}/${d.target} • Lives ${d.lives} • Streak ${d.streak}`;
  }

  function drawDashBackground() {
    const {w,h} = getMetrics();
    const m = activeMission();
    const bgSrc = BACKGROUNDS[m?.id] || './assets/backgrounds/bg-lab-safety.png';
    const bg = images[bgSrc];
    if (bg && bg.width) {
      const ratio = Math.max(w/bg.width, h/bg.height);
      const dw = bg.width * ratio, dh = bg.height * ratio;
      ctx.drawImage(bg, (w-dw)/2, (h-dh)/2, dw, dh);
    } else {
      ctx.fillStyle = '#07111f';
      ctx.fillRect(0,0,w,h);
    }
    const g = ctx.createRadialGradient(w*.5,h*.35,40,w*.5,h*.45,h*.82);
    g.addColorStop(0,'rgba(255,255,255,.03)');
    g.addColorStop(1,'rgba(0,0,0,.42)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);
  }

  function roundedRectPath(x,y,w,h,r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
  }

  function drawLanes() {
    const {w,h} = getMetrics();
    const yTop = h*.20, yBot = h*.86;
    const laneW = (w*.64)/3;
    for (let i=0;i<3;i++) {
      const x = laneCenter(i);
      roundedRectPath(x-laneW*.42,yTop,laneW*.84,yBot-yTop,22);
      ctx.fillStyle = i === state.dash.lane ? 'rgba(54,214,255,.16)' : 'rgba(255,255,255,.04)';
      ctx.fill();
      ctx.strokeStyle = i === state.dash.lane ? 'rgba(54,214,255,.42)' : 'rgba(255,255,255,.12)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawDashItems() {
    const d = state.dash;
    d.items.forEach(item => {
      const src = spriteFor(item.key);
      const img = images[src];
      const size = 74*item.scale;
      ctx.save();
      ctx.translate(item.x,item.y);
      ctx.rotate(item.rot);
      ctx.shadowColor = item.key === 'hazard' ? '#ff6075' : '#36d6ff';
      ctx.shadowBlur = item.key === 'hazard' ? 16 : 10;
      if (img && img.width && SPRITES[item.key]) {
        ctx.drawImage(img,-size/2,-size/2,size,size);
      } else {
        roundedRectPath(-size/2,-size/2,size,size,18);
        ctx.fillStyle = item.key === 'hazard' ? '#ff6075' : '#36d6ff';
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '900 11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(itemName(item.key).slice(0,12),0,4);
      }
      ctx.restore();
    });
  }

  function drawPlayer() {
    const img = images[SPRITES.player];
    const x = laneCenter(state.dash.lane);
    const y = playerY();
    const size = 118;
    ctx.save();
    ctx.translate(x,y);
    if (state.dash.shieldActive) {
      ctx.beginPath();
      ctx.arc(0,0,76+Math.sin(state.dash.time*6)*4,0,Math.PI*2);
      ctx.strokeStyle = 'rgba(71,231,141,.85)';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#47e78d';
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    if (img && img.width) ctx.drawImage(img,-size/2,-size/2,size,size);
    else {
      ctx.fillStyle = '#36d6ff';
      ctx.beginPath(); ctx.arc(0,0,42,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawParticlesAndText() {
    const d = state.dash;
    d.particles.forEach(p => {
      const a = p.life / p.ttl;
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.size*a,0,Math.PI*2); ctx.fill(); ctx.restore();
    });
    d.floatTexts.forEach(f => {
      ctx.save(); ctx.globalAlpha = f.life/f.ttl; ctx.fillStyle = f.color; ctx.font = '900 22px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.text,f.x,f.y); ctx.restore();
    });
  }

  function renderDash() {
    if (!canvas) return;
    const {w,h} = getMetrics();
    ctx.clearRect(0,0,w,h);
    ctx.save();
    if (state.dash.shake > 0) ctx.translate(rand(-state.dash.shake,state.dash.shake), rand(-state.dash.shake,state.dash.shake));
    drawDashBackground();
    drawLanes();
    drawDashItems();
    drawPlayer();
    drawParticlesAndText();
    ctx.restore();
  }

  function updateBest() {
    if (state.score > state.best) {
      state.best = Math.floor(state.score);
      localStorage.setItem(BEST_KEY, String(state.best));
    }
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function bindEvents() {
    $$('.nav').forEach(n => n.addEventListener('click', () => switchScreen(n.dataset.screen)));
    $('goMissionsBtn').addEventListener('click', () => switchScreen('missions'));
    $('quickStartBtn').addEventListener('click', () => startMission(DATA.missions.find(m => isUnlocked(m) && !isComplete(m))?.id || 'ppe_inspection'));
    $('craftBtn').addEventListener('click', craftCurrent);
    $('runExperimentBtn').addEventListener('click', runExperiment);
    $('submitScoreBtn').addEventListener('click', () => postScore('manual_submit'));
    $('resetGameBtn').addEventListener('click', resetAll);
    $('muteBtn').addEventListener('click', () => { state.muted = !state.muted; if (state.muted) stopMusic(); renderStats(); saveState(); });

    $('leftBtn').addEventListener('click', () => moveLane(0));
    $('middleBtn').addEventListener('click', () => moveLane(1));
    $('rightBtn').addEventListener('click', () => moveLane(2));
    $('pauseBtn').addEventListener('click', () => { state.dash.paused = !state.dash.paused; if (state.dash.paused) stopMusic(); else startMusic(); });
    $('shieldBtn').addEventListener('click', useShield);
    $('slowBtn').addEventListener('click', useSlow);
    $('finishDashBtn').addEventListener('click', () => finishDash(state.dash.collected >= Math.max(3, Math.floor(state.dash.target*.55))));

    let sx = null;
    canvas.addEventListener('pointerdown', e => sx = e.clientX);
    canvas.addEventListener('pointerup', e => {
      if (sx == null) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 30) moveDelta(dx > 0 ? 1 : -1);
      else {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        if (x < r.width/3) moveLane(0);
        else if (x > r.width*2/3) moveLane(2);
        else moveLane(1);
      }
      sx = null;
    });

    window.addEventListener('keydown', e => {
      if (state.screen === 'dash') {
        if (e.key === 'ArrowLeft') moveDelta(-1);
        if (e.key === 'ArrowRight') moveDelta(1);
        if (e.key === '1') moveLane(0);
        if (e.key === '2') moveLane(1);
        if (e.key === '3') moveLane(2);
        if (e.key.toLowerCase() === 's') useShield();
        if (e.key.toLowerCase() === 't') useSlow();
      }
    });

    window.addEventListener('resize', resizeCanvas);
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, Math.max(0.001, (now-last)/1000));
    last = now;
    updateDash(dt);
    if (state.screen === 'dash') renderDash();
    renderStats();
    requestAnimationFrame(loop);
  }

  window.addEventListener('message', ev => {
    const data = ev.data || {};
    const type = data.type || data.event;
    if (type === 'GG_PAUSE') {
      state.dash.paused = !!(data.payload?.paused ?? data.paused);
      if (state.dash.paused) stopMusic(); else if (state.dash.running) startMusic();
    }
    if (type === 'GG_RESTART') resetAll();
    if (type === 'GG_MUTE') {
      state.muted = !!(data.payload?.muted ?? data.muted);
      if (state.muted) stopMusic();
      renderStats();
    }
  });

  loadImages().then(() => {
    bindEvents();
    resizeCanvas();
    renderAll();
    switchScreen(state.screen || 'hub');
    requestAnimationFrame(loop);
  });
})();