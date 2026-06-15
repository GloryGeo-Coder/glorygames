(() => {
  'use strict';

  /*
    Lost Jungle 2D: Temple of the Sun
    Version 2.3 — reviewed folder package: fixed enemy spawning, integrated generated item images, validated assets, and cleaned 2D folder structure.
    Keeps the existing assets, textures, backgrounds, sprites, items, effects,
    mobile controls, sounds, levels, score bridge, cutscenes, and map system.
  */

  const GAME_SLUG = 'lost-jungle-2d-temple-of-the-sun';
  const SAVE_KEY = 'wga_lost_jungle_2d_save_v1';
  const BEST_KEY = 'wga_lost_jungle_2d_best_v1';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const AUTO_ADVANCE_SECONDS = 2.8;
  const SHOOT_COOLDOWN = 0.26;
  const MAX_AMMO = 35;
  const GRAVITY = 1550;
  const DESIGN_W = 1280;
  const DESIGN_H = 720;

  const ui = {
    scoreValue: document.getElementById('scoreValue'),
    coinsValue: document.getElementById('coinsValue'),
    relicValue: document.getElementById('relicValue'),
    keysValue: document.getElementById('keysValue'),
    livesValue: document.getElementById('livesValue'),
    levelValue: document.getElementById('levelValue'),
    missionText: document.getElementById('missionText'),
    storyText: document.getElementById('storyText'),
    progressBar: document.getElementById('progressBar'),
    powerText: document.getElementById('powerText'),
    startOverlay: document.getElementById('startOverlay'),
    helpOverlay: document.getElementById('helpOverlay'),
    cutsceneOverlay: document.getElementById('cutsceneOverlay'),
    cutsceneLabel: document.getElementById('cutsceneLabel'),
    cutsceneTitle: document.getElementById('cutsceneTitle'),
    cutsceneText: document.getElementById('cutsceneText'),
    mapOverlay: document.getElementById('mapOverlay'),
    mapGrid: document.getElementById('mapGrid'),
    completeOverlay: document.getElementById('completeOverlay'),
    completeTitle: document.getElementById('completeTitle'),
    completeSummary: document.getElementById('completeSummary'),
    rewardText: document.getElementById('rewardText'),
    starRow: document.getElementById('starRow'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    gameOverTitle: document.getElementById('gameOverTitle'),
    gameOverSummary: document.getElementById('gameOverSummary'),
    muteBtn: document.getElementById('muteBtn'),
    pauseBtn: document.getElementById('pauseBtn')
  };

  const ASSETS = {
    backgrounds: {
      1: './assets/backgrounds/level-01-jungle-entrance.png',
      2: './assets/backgrounds/level-02-river-crossing.png',
      3: './assets/backgrounds/level-03-waterfall-ruins.png',
      4: './assets/backgrounds/level-04-spider-cave.png',
      5: './assets/backgrounds/level-05-monkey-bridge.png',
      6: './assets/backgrounds/level-06-stone-puzzle-temple.png',
      7: './assets/backgrounds/level-07-crystal-cave.png',
      8: './assets/backgrounds/level-08-lost-village.png',
      9: './assets/backgrounds/level-09-volcano-path.png',
      10: './assets/backgrounds/level-10-sun-temple-boss.png'
    },
    textures: {
      1: './assets/textures/platform-jungle.png',
      2: './assets/textures/platform-river.png',
      3: './assets/textures/platform-ruins.png',
      4: './assets/textures/platform-cave.png',
      5: './assets/textures/platform-bridge.png',
      6: './assets/textures/platform-puzzle.png',
      7: './assets/textures/platform-crystal.png',
      8: './assets/textures/platform-village.png',
      9: './assets/textures/platform-volcano.png',
      10: './assets/textures/platform-sun-temple.png'
    },
    sprites: {
      player: './assets/sprites/player-explorer.png',
      snake: './assets/sprites/enemy-snake.png',
      spider: './assets/sprites/enemy-spider.png',
      bat: './assets/sprites/enemy-bat.png',
      monkey: './assets/sprites/enemy-monkey.png',
      frog: './assets/sprites/enemy-frog.png',
      boar: './assets/sprites/enemy-boar.png',
      crawler: './assets/sprites/enemy-crawler.png',
      'Monkey King': './assets/sprites/boss-monkey-king.png',
      'Spider Queen': './assets/sprites/boss-spider-queen.png',
      'Sun Guardian': './assets/sprites/boss-sun-guardian.png'
    },
    items: {
      relic: './assets/items/relic-sun.png',
      coin: './assets/items/coin.png',
      key: './assets/items/key.png',
      plate: './assets/items/pressure-plate.png',
      dash: './assets/items/power-dash.png',
      torch: './assets/items/power-torch.png',
      shield: './assets/items/power-shield.png',
      heart: './assets/items/heart.png',
      gold: './assets/items/item-gold-sun-coins.png',
      emerald: './assets/items/item-emerald-relic.png',
      blaster: './assets/items/item-weapon-temple-blaster.png',
      doubleJump: './assets/items/item-boots-jump.png',
      magnet: './assets/items/item-magnet-sun.png',
      ammo: './assets/items/item-ammo-crystal-bolts.png'
    },
    effects: {
      portal: './assets/effects/portal-sun.png',
      vine: './assets/effects/vine-swing.png'
    }
  };

  const LEVELS = [
    {id:1,title:'Jungle Entrance',length:3600,relicTarget:4,keyTarget:1,plateRequired:false,boss:null,theme:'#74f2a8',hazards:['spikes','spikePit','fallingRock'],enemies:['snake','bat','frog','boar'],story:'The explorer enters the jungle path. Collect relics, find the key, and reach the first temple gate.'},
    {id:2,title:'River Crossing',length:4100,relicTarget:5,keyTarget:1,plateRequired:false,boss:null,theme:'#57d9ff',hazards:['spikes','water','spikePit','fallingRock'],enemies:['snake','bat','frog','boar'],story:'The path crosses rivers and broken stones. Jump over water gaps and keep moving.'},
    {id:3,title:'Waterfall Ruins',length:4550,relicTarget:5,keyTarget:1,plateRequired:true,boss:null,theme:'#6ee6ff',hazards:['spikes','water','dart','spikePit','swingBlade','fallingRock'],enemies:['snake','spider','bat','frog','boar'],story:'Behind the waterfall, pressure plates unlock old ruins and dart traps guard the relics.'},
    {id:4,title:'Spider Cave',length:5050,relicTarget:6,keyTarget:2,plateRequired:true,boss:null,theme:'#be6eff',hazards:['spikes','dart','pit','spikePit','swingBlade','fallingRock'],enemies:['spider','bat','crawler','frog'],story:'The cave is dark. Torch power reveals the route and helps you fight cave creatures.'},
    {id:5,title:'Monkey Bridge',length:5600,relicTarget:6,keyTarget:1,plateRequired:false,boss:'Monkey King',theme:'#ffd66f',hazards:['spikes','pit','bridge','spikePit','swingBlade','rollingBoulder'],enemies:['monkey','bat','snake','boar','frog'],story:'A rope bridge cuts through the canopy. The Monkey King guards the next temple seal.'},
    {id:6,title:'Stone Puzzle Temple',length:6100,relicTarget:7,keyTarget:2,plateRequired:true,boss:null,theme:'#ffb347',hazards:['spikes','dart','pit','spikePit','swingBlade','fallingRock'],enemies:['monkey','spider','snake','crawler','boar'],story:'The old temple demands a key and pressure plate before the gate will open.'},
    {id:7,title:'Underground Crystal Cave',length:6600,relicTarget:7,keyTarget:2,plateRequired:true,boss:null,theme:'#66e7ff',hazards:['spikes','water','dart','pit','spikePit','swingBlade','fallingRock'],enemies:['bat','spider','snake','crawler','frog'],story:'Crystals glow below the jungle. Dash across gaps and avoid crystal darts.'},
    {id:8,title:'Lost Village',length:7200,relicTarget:8,keyTarget:2,plateRequired:true,boss:'Spider Queen',theme:'#ffb347',hazards:['spikes','dart','pit','bridge','spikePit','swingBlade','fallingRock'],enemies:['spider','monkey','bat','boar','crawler'],story:'A forgotten village lies under vines. Defeat the Spider Queen to awaken the exit portal.'},
    {id:9,title:'Volcano Path',length:7900,relicTarget:8,keyTarget:2,plateRequired:false,boss:null,theme:'#ff6f47',hazards:['spikes','lava','dart','pit','spikePit','swingBlade','fallingRock','rollingBoulder'],enemies:['bat','monkey','snake','boar','frog'],story:'The jungle turns into volcanic cliffs. Lava, rolling rocks, and fast enemies block the way.'},
    {id:10,title:'Sun Temple Boss Arena',length:8800,relicTarget:10,keyTarget:3,plateRequired:true,boss:'Sun Guardian',theme:'#ffd66f',hazards:['spikes','water','dart','lava','pit','spikePit','swingBlade','fallingRock','rollingBoulder'],enemies:['snake','spider','bat','monkey','boar','frog','crawler'],story:'The Sun Temple opens. Recover the final relics and defeat the Sun Guardian.'}
  ];

  const assetImages = {};
  const assetSources = [
    ...Object.values(ASSETS.backgrounds),
    ...Object.values(ASSETS.textures),
    ...Object.values(ASSETS.sprites),
    ...Object.values(ASSETS.items),
    ...Object.values(ASSETS.effects)
  ];

  const keys = {};
  const touch = { left:false, right:false, forward:false, back:false };

  const stateDefaults = () => ({
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    coins: 0,
    lives: 3,
    levelIndex: 0,
    unlockedLevel: 1,
    started: false,
    paused: false,
    muted: false,
    gameOver: false,
    completed: false
  });

  let state = loadState();
  let last = performance.now();
  let lastLiveScore = -1;
  let lastLiveAt = 0;

  const camera = { x:0, y:0, shake:0 };

  const player = {
    x:120, y:0, w:76, h:118,
    vx:0, vy:0,
    dir:1,
    speed:390,
    jump:1020,
    airJump:820,
    canDoubleJump:false,
    onGround:false,
    invuln:0,
    dashTimer:0,
    dashCooldown:0,
    torchTimer:0,
    shootTimer:0,
    shootPowerTimer:0,
    magnetTimer:0,
    shield:0,
    ammo:14,
    anim:0
  };

  const game = {
    platforms: [],
    hazards: [],
    items: [],
    enemies: [],
    darts: [],
    bullets: [],
    fallingRocks: [],
    particles: [],
    boss: null,
    exit: null,
    boulder: null,
    relics: 0,
    keys: 0,
    plateActive: false,
    gateOpen: false,
    gate: null,
    speech: '',
    speechTimer: 0,
    time: 0,
    levelComplete: false,
    levelCompleteTimer: 0,
    autoAdvanceQueued: false,
    challenge: null,
    challengeCooldown: 2,
    challengeHistory: []
  };

  function currentLevel(){ return LEVELS[state.levelIndex] || LEVELS[0]; }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function rand(a,b){ return a + Math.random() * (b-a); }
  function choose(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function rects(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function centerRect(x,y,w,h){ return {x:x-w/2,y:y-h/2,w,h}; }

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      return raw ? {...stateDefaults(), ...raw, started:false, paused:false, gameOver:false, completed:false} : stateDefaults();
    } catch { return stateDefaults(); }
  }

  function saveState() {
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(BEST_KEY, String(Math.floor(state.best)));
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      ...state, started:false, paused:false, gameOver:false, completed:false
    }));
  }

  function loadAssets() {
    return Promise.all(assetSources.map(src => new Promise(resolve => {
      const img = new Image();
      assetImages[src] = img;
      img.onload = resolve;
      img.onerror = resolve;
      img.src = src;
    })));
  }

  function hasAsset(src) {
    const img = assetImages[src];
    return !!(img && img.complete && img.naturalWidth);
  }

  function fitCanvasToViewport() {
    const shell = canvas.closest('.canvas-shell');
    const topbar = document.querySelector('.topbar');
    const controls = document.querySelector('.controls');
    if (!shell) return;
    const vw = Math.max(320, window.innerWidth || 960);
    const vh = Math.max(360, window.innerHeight || 720);
    const topH = topbar ? topbar.getBoundingClientRect().height : 0;
    const controlsH = controls ? controls.getBoundingClientRect().height : 0;
    const available = Math.max(310, vh - topH - controlsH - 34);
    if (vw <= 980) shell.style.height = `${Math.max(330, Math.min(available, Math.round(vh * 0.68)))}px`;
    else shell.style.height = '';
    canvas.style.touchAction = 'none';
  }

  function resizeCanvas() {
    fitCanvasToViewport();
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function getW(){ return canvas.getBoundingClientRect().width || 960; }
  function getH(){ return canvas.getBoundingClientRect().height || 540; }

  function worldToScreen(x,y) {
    const sx = x - camera.x + getW()*0.36 + (camera.shake ? rand(-camera.shake,camera.shake) : 0);
    const sy = y - camera.y + (camera.shake ? rand(-camera.shake,camera.shake) : 0);
    return {x:sx,y:sy};
  }

  function createPatternForLevel() {
    const lv = currentLevel();
    const src = ASSETS.textures[lv.id];
    const img = assetImages[src];
    if (!img || !img.naturalWidth) return null;
    try { return ctx.createPattern(img, 'repeat'); } catch { return null; }
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
    if (AC.state === 'suspended') AC.resume().catch(()=>{});
    return AC;
  }

  function tone(freq,dur=.08,type='sine',gain=.04,delay=0) {
    const ac = ensureAudio();
    if (!ac) return;
    const t = ac.currentTime + delay;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(gain,t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g);
    g.connect(master);
    o.start(t);
    o.stop(t+dur+.04);
  }

  function sfx(kind) {
    if (kind === 'jump') tone(420,.06,'triangle',.045);
    if (kind === 'dash') { tone(780,.05,'triangle',.04); tone(520,.08,'sine',.025,.05); }
    if (kind === 'coin') { tone(760,.05,'triangle',.045); tone(1040,.06,'sine',.03,.04); }
    if (kind === 'relic') { tone(520,.07,'triangle',.05); tone(820,.08,'sine',.04,.06); tone(1200,.1,'sine',.025,.13); }
    if (kind === 'key') { tone(660,.08,'triangle',.04); tone(990,.08,'triangle',.035,.06); }
    if (kind === 'plate') { tone(310,.08,'square',.035); tone(620,.12,'triangle',.025,.08); }
    if (kind === 'power') { tone(520,.06,'triangle',.04); tone(820,.08,'sine',.035,.05); }
    if (kind === 'hit') tone(150,.14,'sawtooth',.05);
    if (kind === 'boss') { tone(120,.12,'sawtooth',.055); tone(210,.1,'square',.03,.08); }
    if (kind === 'gate') { tone(260,.08,'triangle',.04); tone(420,.09,'triangle',.03,.08); }
    if (kind === 'win') { tone(392,.08,'triangle',.05); tone(554,.1,'triangle',.04,.08); tone(784,.12,'sine',.03,.18); }
  }

  function musicTick() {
    if (!state.started || state.paused || state.completed || state.gameOver || state.muted) return;
    const lv = currentLevel().id;
    const themes = {
      1:[196,247,294,370,392,370,294,247],
      2:[185,233,277,349,415,349,277,233],
      3:[220,277,330,415,494,415,330,277],
      4:[147,185,220,294,349,294,220,185],
      5:[174,220,261,349,392,349,261,220],
      6:[196,247,311,392,466,392,311,247],
      7:[233,294,349,440,523,440,349,294],
      8:[165,220,247,330,370,330,247,220],
      9:[147,196,247,294,392,294,247,196],
      10:[262,330,392,523,659,523,392,330]
    };
    const notes = themes[lv] || themes[1];
    const n = notes[musicStep++ % notes.length];
    tone(n,.09,'triangle',.008);
    if (musicStep % 2 === 0) tone(n/2,.12,'sine',.006);
  }

  function startMusic(){ if (!musicInt && !state.muted) musicInt = setInterval(musicTick,280); }
  function stopMusic(){ if (musicInt) clearInterval(musicInt); musicInt = null; }

  function postScore(mode='live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now-lastLiveAt < 150) return;
    lastLiveScore = clean;
    lastLiveAt = now;

    const payload = {gameSlug:GAME_SLUG, slug:GAME_SLUG, score:clean, best:Math.max(state.best,clean), level:currentLevel().id, mode};
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, {gameSlug:GAME_SLUG}); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, {gameSlug:GAME_SLUG}); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({type:'GG_SCORE', ...payload, payload}, '*'); } catch {}
    try { window.parent?.postMessage?.({type:'gg:score', ...payload, payload}, '*'); } catch {}
  }

  function startGame() {
    state = loadState();
    state.started = true;
    state.paused = false;
    state.completed = false;
    state.gameOver = false;
    state.score = 0;
    state.lives = 3;
    ui.startOverlay.classList.remove('active');
    ui.completeOverlay.classList.remove('active');
    ui.gameOverOverlay.classList.remove('active');
    state.levelIndex = clamp(state.levelIndex || 0, 0, LEVELS.length-1);
    buildLevel();
    showCutscene();
    startMusic();
    saveState();
  }

  function showCutscene() {
    const lv = currentLevel();
    state.paused = true;
    stopMusic();
    ui.cutsceneLabel.textContent = `LEVEL ${lv.id}`;
    ui.cutsceneTitle.textContent = lv.title;
    ui.cutsceneText.textContent = lv.story;
    ui.cutsceneOverlay.classList.add('active');
  }

  function continueCutscene() {
    ui.cutsceneOverlay.classList.remove('active');
    state.paused = false;
    startMusic();
  }

  function addPlatform(x,y,w,h,type='solid', props={}) {
    game.platforms.push({
      id: game.platforms.length,
      x, y, w, h, type,
      baseX: x,
      baseY: y,
      prevX: x,
      prevY: y,
      moveAxis: props.moveAxis || null,
      moveRange: props.moveRange || 0,
      moveSpeed: props.moveSpeed || 0,
      phase: props.phase || Math.random() * Math.PI * 2,
      ...props
    });
  }

  function addItem(type,x,y,props={}) {
    game.items.push({id:game.items.length,type,x,y,w:52,h:52,taken:false,...props});
  }

  function addHazard(type,x,y,w,h,props={}) {
    game.hazards.push({id:game.hazards.length,type,x,y,w,h,active:true,...props});
  }

  function addEnemy(type,x,y,props={}) {
    const baseHp = type === 'monkey' ? 3 : type === 'spider' ? 2 : type === 'boar' ? 3 : type === 'crawler' ? 2 : 1;
    const enemyW = type === 'bat' ? 86 : type === 'boar' ? 96 : type === 'frog' ? 74 : type === 'crawler' ? 84 : 72;
    const enemyH = type === 'bat' ? 62 : type === 'boar' ? 76 : type === 'frog' ? 58 : type === 'crawler' ? 54 : 76;
    game.enemies.push({
      id:game.enemies.length,type,x,y,w:enemyW,h:enemyH,
      vx:type === 'bat' ? 110 : type === 'boar' ? 135 : type === 'frog' ? 95 : type === 'crawler' ? 80 : 80,
      baseX:x,baseY:y,range:props.range || 150,
      hp:props.hp || baseHp,
      dead:false,
      dir:Math.random()>.5?1:-1,
      shootTimer:1.4 + Math.random(),
      bob:Math.random()*Math.PI*2,
      ...props
    });
  }

  function buildLevel() {
    const lv = currentLevel();
    game.platforms = [];
    game.hazards = [];
    game.items = [];
    game.enemies = [];
    game.darts = [];
    game.bullets = [];
    game.fallingRocks = [];
    game.particles = [];
    game.boss = null;
    game.exit = null;
    game.boulder = null;
    game.relics = 0;
    game.keys = 0;
    game.plateActive = !lv.plateRequired;
    game.gateOpen = false;
    game.gate = null;
    game.speech = lv.story;
    game.speechTimer = 4;
    game.time = 0;
    game.levelComplete = false;
    game.levelCompleteTimer = 0;
    game.autoAdvanceQueued = false;
    game.challenge = null;
    game.challengeCooldown = 2;

    player.x = 120;
    player.y = 420;
    player.vx = 0;
    player.vy = 0;
    player.dir = 1;
    player.onGround = false;
    player.invuln = 0;
    player.dashTimer = 0;
    player.dashCooldown = 0;
    player.torchTimer = 0;
    player.shootTimer = 0;
    player.shootPowerTimer = 0;
    player.magnetTimer = 0;
    player.shield = 0;
    player.ammo = 14;
    player.canDoubleJump = false;

    camera.x = 0;
    camera.y = 0;
    camera.shake = 0;

    const groundY = 565;
    const segment = 360;
    for (let x=0; x<lv.length+900; x+=segment) {
      const gap = x > 900 && x < lv.length-900 && ((x/segment + lv.id) % 7 === 0);
      if (!gap) addPlatform(x, groundY, segment+12, 190, 'ground');
      else {
        const pitType = lv.hazards.includes('lava') ? 'lava' : lv.hazards.includes('water') ? 'water' : 'pit';
        addHazard(pitType, x+40, groundY+18, segment-80, 170);
      }
    }

    // Elevated platforms / stepping stones
    for (let i=0; i<14 + lv.id; i++) {
      const x = 520 + i * 330 + (i%2)*70;
      if (x > lv.length - 540) break;
      const y = 410 - (i%3)*40 + Math.sin(i*.8)*18;
      const w = 170 + (i%3)*45;
      const moving = i%3===0 || (lv.id >= 4 && i%4===1);
      addPlatform(x, y, w, 42, moving ? 'moving' : 'stone', moving ? {
        moveAxis: i%2===0 ? 'x' : 'y',
        moveRange: 70 + lv.id * 8,
        moveSpeed: 1.0 + (i%4)*0.18 + lv.id*0.025,
        phase: i*.75
      } : {});
      if (i%3===0) addItem('coin', x+w*.25, y-58);
      if (i%4===0) addItem('gold', x+w*.50, y-72, {value:120,w:48,h:48});
      if (i%5===0) addItem('relic', x+w*.62, y-70);
      if (i%6===0) addItem('emerald', x+w*.78, y-84, {value:240,w:50,h:50});
      if (i%7===0 && game.items.filter(o=>o.type==='key').length < lv.keyTarget) addItem('key', x+w*.42, y-76);
    }

    // Required items are guaranteed.
    while (game.items.filter(o => o.type === 'relic').length < lv.relicTarget) {
      const x = rand(700, lv.length-760);
      addItem('relic', x, rand(300, 470));
    }
    while (game.items.filter(o => o.type === 'key').length < lv.keyTarget) {
      const x = rand(850, lv.length-900);
      addItem('key', x, rand(295, 455));
    }

    // Ground item trails, hazards and enemies.
    // IMPORTANT: this uses routeIndex instead of x / 260. The previous decimal modulo
    // checks almost never equalled 0, which prevented enemies from spawning in levels.
    for (let x=620, routeIndex=0; x<lv.length-760; x+=260, routeIndex++) {
      const roll = (routeIndex + lv.id) % 6;
      if (roll === 0) addHazard('spikes', x, groundY-35, 92, 40);
      if (roll === 1 && lv.hazards.includes('dart')) addHazard('dartTrap', x, groundY-145, 58, 58, {timer:rand(.5,1.5)});
      if (roll === 2) {
        if (lv.hazards.includes('spikePit')) addHazard('spikePit', x, groundY+18, 170, 170);
        else if (lv.hazards.includes('bridge')) addHazard('pit', x, groundY+18, 150, 170);
      }
      if (roll === 3 && lv.hazards.includes('lava')) addHazard('lava', x, groundY+18, 170, 170);
      if (roll === 4) addItem('power', x+30, groundY-95, {power:choose(lv.id>=4 ? ['dash','torch','shield','heart','blaster','doubleJump','magnet','ammo'] : ['dash','shield','heart','blaster','doubleJump','ammo'])});
      if (roll === 5) {
        addItem('coin', x+40, groundY-78);
        if (routeIndex % 2 === 0) addItem('emerald', x+105, groundY-118, {value:240,w:50,h:50});
      }

      if (lv.hazards.includes('swingBlade') && (routeIndex + lv.id) % 8 === 2) {
        addHazard('swingBlade', x+95, groundY-250, 70, 150, {phase: routeIndex*.9});
      }
      if (lv.hazards.includes('fallingRock') && (routeIndex + lv.id) % 9 === 3) {
        addHazard('fallingRock', x+120, groundY-330, 72, 72, {timer: rand(.3, 1.4), baseY: groundY-330});
      }
      if (lv.hazards.includes('rollingBoulder') && (routeIndex + lv.id) % 10 === 4) {
        addHazard('rollingBoulder', x+160, groundY-118, 98, 98, {vx: -150 - lv.id*12, baseX: x+160});
      }

      if (routeIndex < 2 || (routeIndex + lv.id) % 2 === 0) {
        const enemyType = choose(lv.enemies);
        const enemyY = enemyType === 'bat' ? groundY-220 :
          enemyType === 'frog' ? groundY-74 :
          enemyType === 'crawler' ? groundY-62 :
          enemyType === 'boar' ? groundY-92 :
          groundY-92;
        addEnemy(enemyType, x+80, enemyY, {range: 170 + lv.id * 8});
      }
    }

    // Extra guaranteed enemy cluster. This ensures every level has several enemies
    // even if the route layout changes later.
    while (game.enemies.length < Math.min(10, 5 + lv.id)) {
      const enemyType = choose(lv.enemies);
      const ex = rand(780, Math.max(980, lv.length - 900));
      const ey = enemyType === 'bat' ? groundY - rand(185, 250) :
        enemyType === 'frog' ? groundY - 74 :
        enemyType === 'crawler' ? groundY - 62 :
        groundY - 92;
      addEnemy(enemyType, ex, ey, {range: 190 + lv.id * 10});
    }

    // Extra treasure trails: gold and emeralds make the 2D version feel more rewarding.
    for (let x=760; x<lv.length-840; x+=430) {
      addItem('gold', x + 40, groundY - 118, {value:120,w:48,h:48});
      if ((x/430 + lv.id) % 2 === 0) addItem('emerald', x + 130, groundY - 155, {value:240,w:50,h:50});
      if ((x/430 + lv.id) % 5 === 0) addItem('power', x + 210, groundY - 145, {power: choose(['blaster','doubleJump','magnet','ammo','shield'])});
    }

    if (lv.plateRequired) {
      addItem('plate', lv.length-1120, groundY-56, {w:90,h:42});
    }

    game.gate = {x:lv.length-610,y:groundY-180,w:150,h:180,locked:true};
    if (lv.boss) {
      const bossHp = lv.boss === 'Sun Guardian' ? 26 : 18;
      game.boss = {name:lv.boss,x:lv.length-360,y:groundY-230,w:190,h:230,hp:bossHp,maxHp:bossHp,dir:-1,alive:true,shootTimer:1.2};
    }

    game.exit = {x:lv.length+120,y:groundY-190,w:140,h:190};

    if (lv.hazards.includes('lava') || lv.id === 10) {
      game.boulder = {x:-520,y:groundY-135,w:135,h:135,vx:145+lv.id*8,active:true};
    }

    if (typeof console !== 'undefined') {
      console.info(`[Lost Jungle] Level ${lv.id} enemy count:`, game.enemies.length);
    }

    syncUI();
    renderMap();
  }


  function updateMovingPlatforms(dt) {
    for (const p of game.platforms) {
      p.prevX = p.x;
      p.prevY = p.y;
      if (p.type !== 'moving') continue;
      const wave = Math.sin(game.time * p.moveSpeed + p.phase) * p.moveRange;
      if (p.moveAxis === 'x') p.x = p.baseX + wave;
      if (p.moveAxis === 'y') p.y = p.baseY + wave;
    }
  }

  function shoot() {
    if (!state.started || state.paused || state.gameOver || state.completed || game.levelComplete) return;
    if (player.shootTimer > 0) return;
    if (player.ammo <= 0 && player.shootPowerTimer <= 0) {
      game.speech = 'No relic shots. Collect ammo or blaster power.';
      game.speechTimer = 1.4;
      return;
    }

    player.shootTimer = SHOOT_COOLDOWN;
    if (player.shootPowerTimer <= 0) player.ammo = Math.max(0, player.ammo - 1);

    const speed = 760;
    const power = player.shootPowerTimer > 0 ? 2 : 1;
    game.bullets.push({
      x: player.x + player.w/2 + player.dir * 35,
      y: player.y + player.h * .42,
      w: player.shootPowerTimer > 0 ? 28 : 20,
      h: player.shootPowerTimer > 0 ? 16 : 12,
      vx: player.dir * speed,
      life: 1.25,
      power,
      color: player.shootPowerTimer > 0 ? '#ffd66f' : '#66e7ff'
    });
    addParticles(player.x + player.w/2 + player.dir * 38, player.y + player.h*.42, player.shootPowerTimer > 0 ? '#ffd66f' : '#66e7ff', 5);
    sfx('power');
  }

  function powerLabel(power) {
    if (power === 'dash') return 'Dash';
    if (power === 'torch') return 'Torch';
    if (power === 'shield') return 'Shield';
    if (power === 'heart') return 'Healing Fruit';
    if (power === 'blaster') return 'Relic Blaster';
    if (power === 'doubleJump') return 'Double Jump';
    if (power === 'magnet') return 'Treasure Magnet';
    if (power === 'ammo') return 'Relic Ammo';
    return 'Power';
  }


  function jump() {
    if (!state.started || state.paused || state.gameOver || state.completed || game.levelComplete) return;
    if (player.onGround) {
      player.vy = -player.jump;
      player.onGround = false;
      player.canDoubleJump = player.shootPowerTimer > 0 || player.magnetTimer > 0 || player.canDoubleJump;
      addChallengeProgress('jump',1);
      sfx('jump');
    } else if (player.canDoubleJump) {
      player.vy = -player.airJump;
      player.canDoubleJump = false;
      addParticles(player.x + player.w/2, player.y + player.h, '#74f2a8', 18);
      addChallengeProgress('jump',1);
      sfx('jump');
    }
  }

  function dash() {
    if (!state.started || state.paused || state.gameOver || state.completed || game.levelComplete) return;
    if (player.dashCooldown > 0) return;
    player.dashTimer = .22;
    player.dashCooldown = .8;
    player.invuln = Math.max(player.invuln, .24);
    player.vx = player.dir * 850;
    addParticles(player.x + player.w/2, player.y + 60, '#57d9ff', 16);
    sfx('dash');
  }

  function updatePlayer(dt) {
    const left = keys['ArrowLeft'] || keys['KeyA'] || touch.left || touch.back;
    const right = keys['ArrowRight'] || keys['KeyD'] || touch.right || touch.forward;

    const accel = player.onGround ? 3600 : 2200;
    const maxSpeed = player.speed * (player.dashTimer > 0 ? 1.55 : 1) * (player.torchTimer > 0 ? 1.06 : 1);
    if (left) {
      player.vx -= accel * dt;
      player.dir = -1;
    }
    if (right) {
      player.vx += accel * dt;
      player.dir = 1;
    }
    if (!left && !right && player.onGround) player.vx *= Math.pow(.08, dt);
    if (!left && !right && !player.onGround) player.vx *= Math.pow(.62, dt);

    player.vx = clamp(player.vx, -maxSpeed, maxSpeed);
    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.onGround = false;

    for (const p of game.platforms) {
      const playerBox = {x:player.x,y:player.y,w:player.w,h:player.h};
      if (!rects(playerBox,p)) continue;

      const prevBottom = player.y - player.vy*dt + player.h;
      const prevTop = player.y - player.vy*dt;
      const prevRight = player.x - player.vx*dt + player.w;
      const prevLeft = player.x - player.vx*dt;

      if (prevBottom <= p.y && player.vy >= 0) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.canDoubleJump = player.shootPowerTimer > 0 || player.magnetTimer > 0;
        if (p.type === 'moving') {
          player.x += p.x - p.prevX;
          player.y += p.y - p.prevY;
        }
      } else if (prevTop >= p.y + p.h && player.vy < 0) {
        player.y = p.y + p.h;
        player.vy = 0;
      } else if (prevRight <= p.x && player.vx > 0) {
        player.x = p.x - player.w;
        player.vx = 0;
      } else if (prevLeft >= p.x + p.w && player.vx < 0) {
        player.x = p.x + p.w;
        player.vx = 0;
      }
    }

    const lv = currentLevel();
    player.x = clamp(player.x, 0, lv.length + 260);
    if (player.y > 900) loseLife('You fell into the jungle depths.');

    if (player.invuln > 0) player.invuln -= dt;
    if (player.dashTimer > 0) player.dashTimer -= dt;
    if (player.dashCooldown > 0) player.dashCooldown -= dt;
    if (player.torchTimer > 0) player.torchTimer -= dt;
    if (player.shootTimer > 0) player.shootTimer -= dt;
    if (player.shootPowerTimer > 0) player.shootPowerTimer -= dt;
    if (player.magnetTimer > 0) player.magnetTimer -= dt;
    player.anim += dt * (Math.abs(player.vx) > 20 ? 9 : 3);

    const targetCamX = player.x - getW()*0.36;
    camera.x += (targetCamX - camera.x) * Math.min(1, dt*6);
    camera.x = clamp(camera.x, 0, lv.length - getW()*.62 + 520);
    camera.y += ((currentLevel().id >= 4 ? -8 : 0) - camera.y) * Math.min(1, dt*3);
    camera.shake = Math.max(0, camera.shake - dt*28);
  }

  function updateWorld(dt) {
    const lv = currentLevel();

    updateMovingPlatforms(dt);
    updateBullets(dt);
    updateMagnet(dt);

    for (const h of game.hazards) {
      if (!h.active) continue;
      if (h.type === 'dartTrap') {
        h.timer -= dt;
        if (h.timer <= 0) {
          h.timer = rand(1.1, 2.0);
          game.darts.push({x:h.x,y:h.y+14,w:46,h:14,vx:-520,life:2.2});
          sfx('boss');
        }
      }
      if (h.type === 'fallingRock') {
        h.timer -= dt;
        if (h.timer <= 0) {
          h.y += (260 + lv.id*12) * dt;
          if (h.y > 650) {
            h.y = h.baseY || 220;
            h.timer = rand(1.0, 2.2);
          }
        }
      }
      if (h.type === 'rollingBoulder') {
        h.x += h.vx * dt;
        if (Math.abs(h.x - h.baseX) > 460) h.vx *= -1;
      }
    }

    for (const d of game.darts) {
      d.x += d.vx * dt;
      d.life -= dt;
      if (rects(d, player) && player.invuln <= 0) {
        d.life = 0;
        loseLife('Temple dart hit you.');
      }
    }
    game.darts = game.darts.filter(d => d.life > 0);

    for (const e of game.enemies) {
      if (e.dead) continue;
      e.bob += dt;
      if (e.type === 'bat') {
        e.x += e.vx * e.dir * dt;
        e.y = e.baseY + Math.sin(e.bob*3) * 30;
        if (Math.abs(e.x - e.baseX) > e.range) e.dir *= -1;
      } else if (e.type === 'snake') {
        e.x += e.vx * e.dir * dt;
        if (Math.abs(e.x - e.baseX) > e.range) e.dir *= -1;
      } else if (e.type === 'spider') {
        const dx = (player.x - e.x);
        if (Math.abs(dx) < 460) e.x += Math.sign(dx) * (90 + lv.id*5) * dt;
        else {
          e.x += e.vx * e.dir * dt;
          if (Math.abs(e.x - e.baseX) > e.range) e.dir *= -1;
        }
      } else if (e.type === 'monkey') {
        const dx = player.x - e.x;
        if (Math.abs(dx) < 520) e.x += Math.sign(dx) * (100 + lv.id*6) * dt;
        else {
          e.x += e.vx * e.dir * dt;
          if (Math.abs(e.x - e.baseX) > e.range) e.dir *= -1;
        }
        e.shootTimer -= dt;
        if (e.shootTimer <= 0 && Math.abs(dx) < 720) {
          e.shootTimer = rand(1.3, 2.0);
          game.darts.push({x:e.x + (dx>0?e.w:-30), y:e.y+30, w:36, h:18, vx:Math.sign(dx)*430, life:2});
        }
      } else if (e.type === 'frog') {
        e.x += e.vx * e.dir * dt;
        e.y = e.baseY + Math.sin(e.bob * 4) * 22;
        if (Math.abs(e.x - e.baseX) > e.range) e.dir *= -1;
      } else if (e.type === 'boar') {
        const dx = player.x - e.x;
        if (Math.abs(dx) < 620) e.x += Math.sign(dx) * (155 + lv.id*7) * dt;
        else {
          e.x += e.vx * e.dir * dt;
          if (Math.abs(e.x - e.baseX) > e.range) e.dir *= -1;
        }
      } else if (e.type === 'crawler') {
        e.x += e.vx * e.dir * dt;
        if (Math.abs(e.x - e.baseX) > e.range) e.dir *= -1;
      }

      if (rects(player,e) && player.invuln <= 0) {
        if (player.dashTimer > 0 || player.torchTimer > 0) defeatEnemy(e);
        else loseLife(`${enemyLabel(e.type)} hit you.`);
      }
    }

    if (game.boss?.alive) {
      const b = game.boss;
      b.x += Math.sin(game.time*1.2) * 70 * dt;
      b.shootTimer -= dt;
      if (b.shootTimer <= 0) {
        b.shootTimer = Math.max(.75, 1.4 - lv.id*.05);
        const dir = player.x < b.x ? -1 : 1;
        game.darts.push({x:b.x + b.w/2, y:b.y + b.h*.44, w:56, h:20, vx:dir*(460+lv.id*10), life:2.2, boss:true});
        sfx('boss');
      }
      if (rects(player,b) && player.invuln <= 0) {
        if (player.dashTimer > 0 || player.torchTimer > 0) damageBoss();
        else loseLife(`${b.name} slammed you.`);
      }
    }

    if (game.boulder?.active) {
      const b = game.boulder;
      if (b.x < player.x - 760) b.x += b.vx * dt;
      else b.x += b.vx * .32 * dt;
      if (rects(player,b) && player.invuln <= 0) loseLife('Rolling boulder!');
    }

    for (const h of game.hazards) {
      if (!h.active || h.type === 'dartTrap') continue;
      if (rects(player,h) && player.invuln <= 0) {
        if (h.type === 'spikes') loseLife('Spike trap.');
        if (h.type === 'spikePit') loseLife('Spike pit.');
        if (h.type === 'swingBlade') loseLife('Swinging blade.');
        if (h.type === 'fallingRock') loseLife('Falling rock.');
        if (h.type === 'rollingBoulder') loseLife('Rolling boulder.');
        if (h.type === 'water') loseLife('River pit.');
        if (h.type === 'lava') loseLife('Lava pit.');
        if (h.type === 'pit') loseLife('Temple gap.');
      }
    }

    collectItems();
    checkGateAndExit();
  }


  function updateBullets(dt) {
    for (const b of game.bullets) {
      b.x += b.vx * dt;
      b.life -= dt;

      for (const e of game.enemies) {
        if (e.dead) continue;
        if (rects(b, e)) {
          e.hp -= b.power;
          b.life = 0;
          addChallengeProgress('shoot', 1);
          addParticles(e.x + e.w/2, e.y + e.h/2, b.color, 12);
          if (e.hp <= 0) {
            e.dead = true;
            state.score += e.type === 'monkey' ? 260 : e.type === 'spider' ? 220 : e.type === 'boar' ? 300 : e.type === 'crawler' ? 230 : 170;
            addChallengeProgress('dash',1);
            sfx('hit');
          } else {
            sfx('boss');
          }
          break;
        }
      }

      if (game.boss?.alive && rects(b, game.boss)) {
        game.boss.hp -= b.power;
        b.life = 0;
        addChallengeProgress('shoot', 1);
        addParticles(game.boss.x + game.boss.w/2, game.boss.y + game.boss.h/2, b.color, 16);
        if (game.boss.hp <= 0) {
          game.boss.alive = false;
          state.score += 1500;
          game.speech = `${game.boss.name} defeated. The exit portal awakens.`;
          game.speechTimer = 3.5;
          sfx('win');
        } else {
          sfx('boss');
        }
      }
    }
    game.bullets = game.bullets.filter(b => b.life > 0 && b.x > camera.x - 260 && b.x < camera.x + getW() + 520);
  }

  function updateMagnet(dt) {
    if (player.magnetTimer <= 0) return;
    const px = player.x + player.w/2;
    const py = player.y + player.h/2;
    for (const it of game.items) {
      if (it.taken || !['coin','gold','emerald','relic','key'].includes(it.type)) continue;
      const cx = it.x + (it.w || 52)/2;
      const cy = it.y + (it.h || 52)/2;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 280 && dist > 1) {
        it.x += dx / dist * 280 * dt;
        it.y += dy / dist * 280 * dt;
      }
    }
  }


  function collectItems() {
    for (const it of game.items) {
      if (it.taken) continue;
      const box = {x:it.x,y:it.y,w:it.w||52,h:it.h||52};
      const magneticHit = player.magnetTimer > 0 && ['coin','gold','emerald','relic','key'].includes(it.type) &&
        Math.hypot((player.x+player.w/2)-(it.x+(it.w||52)/2),(player.y+player.h/2)-(it.y+(it.h||52)/2)) < 92;
      if (!rects(player, box) && !magneticHit) continue;
      if (it.type === 'coin') collectCoin(it);
      if (it.type === 'gold') collectGold(it);
      if (it.type === 'emerald') collectEmerald(it);
      if (it.type === 'relic') collectRelic(it);
      if (it.type === 'key') collectKey(it);
      if (it.type === 'power') collectPower(it);
      if (it.type === 'plate') activatePlate(it);
    }
  }

  function collectCoin(it) {
    it.taken = true;
    state.coins++;
    state.score += 60;
    addChallengeProgress('coins',1);
    addParticles(it.x+25,it.y+25,'#ffd66f',10);
    sfx('coin');
    postScore('live');
  }

  function collectGold(it) {
    it.taken = true;
    state.coins += 2;
    state.score += it.value || 120;
    addChallengeProgress('coins',2);
    addParticles(it.x+25,it.y+25,'#ffd66f',14);
    sfx('coin');
    postScore('live');
  }

  function collectEmerald(it) {
    it.taken = true;
    state.coins += 3;
    state.score += it.value || 240;
    addChallengeProgress('coins',3);
    addParticles(it.x+25,it.y+25,'#74f2a8',18);
    sfx('relic');
    postScore('live');
  }

  function collectRelic(it) {
    it.taken = true;
    game.relics++;
    state.score += 350;
    addChallengeProgress('relics',1);
    game.speech = `Sun Relic ${game.relics}/${currentLevel().relicTarget} recovered.`;
    game.speechTimer = 2;
    addParticles(it.x+25,it.y+25,currentLevel().theme,22);
    sfx('relic');
    postScore('live');
  }

  function collectKey(it) {
    it.taken = true;
    game.keys++;
    state.score += 160;
    game.speech = `Temple Key ${game.keys}/${currentLevel().keyTarget} collected.`;
    game.speechTimer = 2;
    addParticles(it.x+25,it.y+25,'#ffd66f',18);
    sfx('key');
    postScore('live');
  }

  function collectPower(it) {
    it.taken = true;
    state.score += 120;
    if (it.power === 'dash') {
      player.dashCooldown = 0;
      game.speech = 'Dash power ready.';
    }
    if (it.power === 'torch') {
      player.torchTimer = 10;
      game.speech = 'Torch power active.';
    }
    if (it.power === 'shield') {
      player.shield = 1;
      game.speech = 'Jungle shield active.';
    }
    if (it.power === 'heart') {
      state.lives = Math.min(5, state.lives+1);
      game.speech = 'Healing fruit restored one life.';
    }
    if (it.power === 'blaster') {
      player.shootPowerTimer = 12;
      player.ammo = Math.min(MAX_AMMO, player.ammo + 10);
      game.speech = 'Relic blaster powered up. Press Shoot / K to fire.';
    }
    if (it.power === 'doubleJump') {
      player.canDoubleJump = true;
      player.shootPowerTimer = Math.max(player.shootPowerTimer, 5);
      game.speech = 'Double jump power active.';
    }
    if (it.power === 'magnet') {
      player.magnetTimer = 12;
      game.speech = 'Treasure magnet active. Collectibles move toward you.';
    }
    if (it.power === 'ammo') {
      player.ammo = Math.min(MAX_AMMO, player.ammo + 12);
      game.speech = 'Relic ammo collected.';
    }
    game.speechTimer = 2.2;
    addParticles(it.x+25,it.y+25,currentLevel().theme,18);
    sfx('power');
    postScore('live');
  }

  function activatePlate(it) {
    if (game.plateActive) return;
    it.taken = true;
    game.plateActive = true;
    state.score += 260;
    game.speech = 'Pressure plate activated. The stone gate mechanism unlocks.';
    game.speechTimer = 2.4;
    addParticles(it.x+40,it.y+20,'#ffb347',25);
    sfx('plate');
  }

  function defeatEnemy(e) {
    e.hp--;
    player.invuln = .18;
    addParticles(e.x+e.w/2,e.y+e.h/2,'#ffb347',14);
    if (e.hp <= 0) {
      e.dead = true;
      state.score += e.type === 'monkey' ? 260 : e.type === 'spider' ? 220 : 170;
      addChallengeProgress('dash',1);
      sfx('hit');
      postScore('live');
    }
  }

  function damageBoss() {
    if (!game.boss?.alive || player.invuln > 0) return;
    const b = game.boss;
    b.hp -= player.dashTimer > 0 ? 2 : 1;
    player.invuln = .25;
    camera.shake = 12;
    state.score += 90;
    addChallengeProgress('dash',1);
    addParticles(b.x+b.w/2,b.y+b.h/2,'#ffd66f',25);
    if (b.hp <= 0) {
      b.alive = false;
      state.score += 1500;
      game.speech = `${b.name} defeated. The exit portal awakens.`;
      game.speechTimer = 3.5;
      sfx('win');
      postScore('live');
    } else {
      sfx('boss');
    }
  }

  function enemyLabel(t) {
    if (t === 'snake') return 'Snake';
    if (t === 'spider') return 'Spider';
    if (t === 'bat') return 'Bat';
    if (t === 'monkey') return 'Monkey';
    if (t === 'frog') return 'Frog';
    if (t === 'boar') return 'Boar';
    if (t === 'crawler') return 'Crawler';
    return 'Enemy';
  }

  function canOpenGate() {
    const lv = currentLevel();
    return game.relics >= lv.relicTarget && game.keys >= lv.keyTarget && game.plateActive;
  }

  function gateMessage() {
    const lv = currentLevel();
    if (game.relics < lv.relicTarget) return `Find ${lv.relicTarget - game.relics} more Sun Relic(s).`;
    if (game.keys < lv.keyTarget) return `Find ${lv.keyTarget - game.keys} more Temple Key(s).`;
    if (!game.plateActive) return 'Step on the glowing pressure plate first.';
    return 'The gate is opening.';
  }

  function checkGateAndExit() {
    if (game.gate) {
      game.gate.locked = !canOpenGate();
      game.gateOpen = !game.gate.locked;
      if (game.gate.locked && rects(player, game.gate)) {
        player.x = game.gate.x - player.w - 4;
        player.vx = 0;
        game.speech = gateMessage();
        game.speechTimer = 1.7;
      }
      if (!game.gate.locked && Math.abs(player.x - game.gate.x) < 100) {
        game.speech = game.boss?.alive ? `Defeat ${game.boss.name}.` : 'Gate open. Reach the sun portal.';
        game.speechTimer = 1.1;
      }
    }

    if (game.exit && rects(player, game.exit) && canOpenGate() && !(game.boss?.alive)) {
      completeLevel();
    }
  }

  function loseLife(message) {
    if (player.invuln > 0 || state.gameOver || state.completed || game.levelComplete) return;
    if (player.shield > 0) {
      player.shield = 0;
      player.invuln = 1.0;
      game.speech = 'Shield blocked the danger.';
      game.speechTimer = 1.7;
      addParticles(player.x+player.w/2,player.y+player.h/2,'#74f2a8',18);
      sfx('power');
      return;
    }

    if (game.challenge && game.challenge.type === 'survive') {
      failChallenge('Survival challenge failed. You took damage.');
    }

    state.lives--;
    state.score = Math.max(0, state.score - 120);
    player.invuln = 1.3;
    player.vx = 0;
    player.vy = 0;
    player.x = Math.max(80, player.x - 230);
    player.y = 420;
    camera.shake = 15;
    game.speech = message;
    game.speechTimer = 2;
    sfx('hit');

    if (state.lives <= 0) triggerGameOver(false);
    syncUI();
    postScore('live');
  }

  function addParticles(x,y,color,n=16) {
    for (let i=0;i<n;i++) {
      game.particles.push({
        x,y,color,
        vx:rand(-140,140),
        vy:rand(-240,-40),
        size:rand(4,10),
        life:.85,
        ttl:.85
      });
    }
  }

  function updateParticles(dt) {
    for (const p of game.particles) {
      p.life -= dt;
      p.x += p.vx*dt;
      p.y += p.vy*dt;
      p.vy += 550*dt;
    }
    game.particles = game.particles.filter(p=>p.life>0);
  }

  // Continuous challenge system
  function ensureChallengeUI() {
    if (document.getElementById('challengeCard')) return;
    const shell = document.querySelector('.canvas-shell');
    if (!shell) return;
    const style = document.createElement('style');
    style.textContent = `
      .challenge-card-v2{position:absolute;right:14px;bottom:14px;z-index:7;width:min(360px,calc(100% - 28px));padding:12px;border-radius:18px;background:rgba(7,23,14,.64);border:1px solid rgba(255,214,111,.30);box-shadow:0 18px 48px rgba(0,0,0,.28),inset 0 0 20px rgba(255,214,111,.08);backdrop-filter:blur(12px);color:#fff8d8;pointer-events:none}
      .challenge-card-v2 strong{display:block;color:#ffd66f;font-size:12px;text-transform:uppercase;letter-spacing:.6px;margin-bottom:5px}
      .challenge-card-v2 p{margin:0 0 8px;color:rgba(235,255,231,.88);font-weight:800;line-height:1.3;font-size:12px}
      .challenge-card-v2 .bar{height:9px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,.13)}
      .challenge-card-v2 .bar span{display:block;height:100%;width:0%;background:linear-gradient(90deg,#74f2a8,#ffd66f,#ffb347);box-shadow:0 0 16px rgba(255,214,111,.35)}
      .challenge-card-v2 small{display:block;margin-top:6px;color:rgba(255,248,218,.76);font-weight:900}
      @media(max-width:980px){.challenge-card-v2{right:10px;bottom:156px;width:calc(100% - 20px)}}
    `;
    document.head.appendChild(style);
    const card = document.createElement('div');
    card.id = 'challengeCard';
    card.className = 'challenge-card-v2';
    card.innerHTML = `<strong>Continuous Challenge</strong><p id="challengeText">Complete jungle challenges while you run.</p><div class="bar"><span id="challengeBar"></span></div><small id="challengeMeta">Preparing challenge...</small>`;
    shell.appendChild(card);
  }

  function updateChallengeUI() {
    ensureChallengeUI();
    const card = document.getElementById('challengeCard');
    const text = document.getElementById('challengeText');
    const bar = document.getElementById('challengeBar');
    const meta = document.getElementById('challengeMeta');
    if (!card || !text || !bar || !meta) return;
    if (!state.started || state.gameOver || state.completed) {
      card.style.display = 'none';
      return;
    }
    card.style.display = 'block';
    if (!game.challenge) {
      text.textContent = 'Next jungle challenge incoming...';
      bar.style.width = '0%';
      meta.textContent = 'Stay ready';
      return;
    }
    const ch = game.challenge;
    const progress = ch.target ? clamp(ch.progress / ch.target, 0, 1) : 0;
    text.textContent = ch.label;
    bar.style.width = `${Math.round(progress*100)}%`;
    meta.textContent = `${ch.progress}/${ch.target} • ${Math.ceil(ch.timeLeft)}s left • Reward ${ch.reward}`;
  }

  function startNewChallenge() {
    const pool = [
      {type:'coins', label:'Collect 8 coins before the timer ends.', target:8, reward:420},
      {type:'relics', label:'Recover 2 Sun Relics during this route.', target:2, reward:520},
      {type:'distance', label:'Run 700 metres through the jungle.', target:700, reward:460},
      {type:'jump', label:'Jump 3 times to clear danger.', target:3, reward:430},
      {type:'dash', label:'Dash through or defeat 2 enemies.', target:2, reward:520},
      {type:'shoot', label:'Hit 3 enemies with relic shots.', target:3, reward:620},
      {type:'survive', label:'Survive without taking damage.', target:1, reward:560}
    ];
    let ch = choose(pool);
    if (game.challengeHistory.length && ch.type === game.challengeHistory[game.challengeHistory.length-1]) ch = choose(pool);
    game.challenge = {...ch, progress:0, timeLeft:ch.type==='survive'?26:38, startX:player.x};
    game.speech = `Challenge started: ${game.challenge.label}`;
    game.speechTimer = 2.2;
  }

  function addChallengeProgress(type,amount=1) {
    if (!game.challenge || game.challenge.type !== type) return;
    game.challenge.progress = Math.min(game.challenge.target, game.challenge.progress + amount);
    if (game.challenge.progress >= game.challenge.target) completeChallenge();
  }

  function completeChallenge() {
    const ch = game.challenge;
    if (!ch) return;
    state.score += ch.reward;
    state.coins += Math.max(1, Math.floor(ch.reward/140));
    game.challengeHistory.push(ch.type);
    if (game.challengeHistory.length > 5) game.challengeHistory.shift();
    game.challenge = null;
    game.challengeCooldown = 1.2;
    game.speech = `Challenge complete! Bonus +${ch.reward}`;
    game.speechTimer = 2.4;
    addParticles(player.x+player.w/2, player.y, '#ffd66f', 34);
    sfx('win');
    postScore('challenge_complete');
  }

  function failChallenge(reason) {
    if (!game.challenge) return;
    game.challengeHistory.push(game.challenge.type);
    if (game.challengeHistory.length > 5) game.challengeHistory.shift();
    game.challenge = null;
    game.challengeCooldown = 2.2;
    game.speech = reason;
    game.speechTimer = 2;
  }

  function updateChallenge(dt) {
    if (!state.started || state.paused || state.gameOver || state.completed || game.levelComplete) return;
    if (!game.challenge) {
      game.challengeCooldown -= dt;
      if (game.challengeCooldown <= 0) startNewChallenge();
      updateChallengeUI();
      return;
    }
    const ch = game.challenge;
    ch.timeLeft -= dt;
    if (ch.type === 'distance') {
      ch.progress = Math.min(ch.target, Math.max(0, Math.floor(player.x - ch.startX)));
      if (ch.progress >= ch.target) completeChallenge();
    }
    if (ch.type === 'survive') {
      ch.progress = ch.timeLeft <= 0 ? 1 : 0;
      if (ch.timeLeft <= 0) completeChallenge();
    }
    if (ch.timeLeft <= 0 && game.challenge) failChallenge('Challenge expired. A new one will appear soon.');
    updateChallengeUI();
  }

  function update(dt) {
    if (game.levelComplete && game.autoAdvanceQueued) updateAutoAdvance(dt);
    if (!state.started || state.paused || state.completed || state.gameOver || game.levelComplete) return;
    game.time += dt;
    if (game.speechTimer > 0) {
      game.speechTimer -= dt;
      if (game.speechTimer <= 0) game.speech = '';
    }
    updatePlayer(dt);
    updateWorld(dt);
    updateChallenge(dt);
    updateParticles(dt);
    syncUI();
  }

  function completeLevel() {
    if (game.levelComplete) return;
    game.levelComplete = true;
    stopMusic();
    const stars = state.lives >= 3 ? 3 : state.lives === 2 ? 2 : 1;
    const bonus = 900 + stars*280 + game.relics*100 + game.keys*120;
    state.score += bonus;
    state.best = Math.max(state.best, state.score);
    state.unlockedLevel = Math.max(state.unlockedLevel, currentLevel().id + 1);
    saveState();

    ui.completeTitle.textContent = currentLevel().id === LEVELS.length ? 'Temple of the Sun Cleared!' : `${currentLevel().title} Complete`;
    ui.completeSummary.textContent = currentLevel().id === LEVELS.length ? 'You recovered the Sun Relics and defeated the final guardian.' : 'The next jungle route is open.';
    ui.rewardText.textContent = `Bonus +${bonus} • Score ${Math.floor(state.score)}`;
    ui.starRow.textContent = '★ '.repeat(stars).trim();
    ui.completeOverlay.classList.add('active');

    const nextBtn = document.getElementById('nextLevelBtn');
    if (nextBtn) nextBtn.textContent = currentLevel().id === LEVELS.length ? 'Finish Expedition' : `Auto-advancing in ${AUTO_ADVANCE_SECONDS}s`;
    game.levelCompleteTimer = AUTO_ADVANCE_SECONDS;
    game.autoAdvanceQueued = true;

    sfx('win');
    postScore(currentLevel().id === LEVELS.length ? 'game_won' : 'level_complete');
  }

  function updateAutoAdvance(dt) {
    if (!game.levelComplete || !game.autoAdvanceQueued) return;
    game.levelCompleteTimer -= dt;
    const nextBtn = document.getElementById('nextLevelBtn');
    if (nextBtn) nextBtn.textContent = currentLevel().id >= LEVELS.length ? 'Finish Expedition' : `Auto-advancing in ${Math.max(1, Math.ceil(game.levelCompleteTimer))}s`;
    if (game.levelCompleteTimer <= 0) {
      game.autoAdvanceQueued = false;
      nextLevel();
    }
  }

  function nextLevel() {
    const nextBtn = document.getElementById('nextLevelBtn');
    if (nextBtn) nextBtn.textContent = 'Next Level';
    ui.completeOverlay.classList.remove('active');
    if (state.levelIndex >= LEVELS.length-1) {
      triggerGameOver(true);
      return;
    }
    state.levelIndex++;
    state.lives = Math.max(3, state.lives);
    buildLevel();
    showCutscene();
    saveState();
  }

  function triggerGameOver(win=false) {
    state.gameOver = !win;
    state.completed = win;
    stopMusic();
    saveState();
    ui.gameOverTitle.textContent = win ? 'Expedition Complete' : 'Expedition Failed';
    ui.gameOverSummary.textContent = win ? `Final score: ${Math.floor(state.score)}.` : `Final score: ${Math.floor(state.score)}. Try again and master the jungle route.`;
    ui.gameOverOverlay.classList.add('active');
    postScore(win ? 'game_won' : 'game_over');
  }

  function resetRun() {
    state.levelIndex = 0;
    state.score = 0;
    state.lives = 3;
    state.started = true;
    state.gameOver = false;
    state.completed = false;
    state.paused = false;
    ui.gameOverOverlay.classList.remove('active');
    buildLevel();
    showCutscene();
    saveState();
  }

  // Drawing
  function draw() {
    drawBackground();
    drawPlatforms();
    drawItems();
    drawHazards();
    drawEnemies();
    drawBoss();
    drawExitAndGate();
    drawPlayer();
    drawBullets();
    drawDarts();
    drawBoulder();
    drawParticles();
    drawForeground();
    drawHudStrip();
  }

  function drawBackground() {
    const w = getW(), h = getH(), lv = currentLevel();
    const src = ASSETS.backgrounds[lv.id];
    if (hasAsset(src)) {
      const img = assetImages[src];
      const ratio = Math.max(w/img.naturalWidth, h/img.naturalHeight);
      const dw = img.naturalWidth * ratio;
      const dh = img.naturalHeight * ratio;
      const px = -(camera.x*.18 % Math.max(1,dw-w));
      ctx.drawImage(img, px, (h-dh)/2, dw, dh);
      if (px > -8) ctx.drawImage(img, px+dw, (h-dh)/2, dw, dh);
    } else {
      const g = ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0,'#12351f');
      g.addColorStop(.55,'#2a783e');
      g.addColorStop(1,'#d6a653');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,w,h);
    }
    const sun = ctx.createRadialGradient(w*.78,h*.18,10,w*.78,h*.18,h*.55);
    sun.addColorStop(0,'rgba(255,214,111,.40)');
    sun.addColorStop(.55,'rgba(255,179,71,.12)');
    sun.addColorStop(1,'rgba(255,179,71,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0,0,w,h);
    if (lv.id === 4 || lv.id === 7) {
      ctx.fillStyle = player.torchTimer > 0 ? 'rgba(5,8,12,.22)' : 'rgba(5,8,12,.42)';
      ctx.fillRect(0,0,w,h);
    }
  }

  function drawPlatforms() {
    const pattern = createPatternForLevel();
    for (const p of game.platforms) {
      if (p.x+p.w < camera.x-120 || p.x > camera.x+getW()+420) continue;
      const s = worldToScreen(p.x,p.y);
      ctx.save();
      if (pattern) {
        ctx.translate(-camera.x*.42,0);
        ctx.fillStyle = pattern;
        ctx.fillRect(s.x + camera.x*.42, s.y, p.w, p.h);
      } else {
        ctx.fillStyle = currentLevel().id === 9 ? '#87351f' : '#5d7d3a';
        ctx.fillRect(s.x,s.y,p.w,p.h);
      }
      ctx.restore();
      const shade = ctx.createLinearGradient(0,s.y,0,s.y+p.h);
      shade.addColorStop(0,'rgba(255,255,255,.16)');
      shade.addColorStop(.55,'rgba(0,0,0,.02)');
      shade.addColorStop(1,'rgba(0,0,0,.35)');
      ctx.fillStyle = shade;
      ctx.fillRect(s.x,s.y,p.w,p.h);
      ctx.strokeStyle = 'rgba(255,214,111,.22)';
      ctx.lineWidth = 2;
      ctx.strokeRect(s.x,s.y,p.w,p.h);
    }
  }

  function drawItems() {
    for (const it of game.items) {
      if (it.taken || it.x < camera.x-160 || it.x > camera.x+getW()+220) continue;
      const src = it.type === 'coin' ? ASSETS.items.coin :
        it.type === 'gold' ? ASSETS.items.gold :
        it.type === 'emerald' ? ASSETS.items.emerald :
        it.type === 'relic' ? ASSETS.items.relic :
        it.type === 'key' ? ASSETS.items.key :
        it.type === 'plate' ? ASSETS.items.plate :
        ASSETS.items[it.power] || ASSETS.items.dash;
      drawImageOrOrb(src,it.x,it.y,it.w||54,it.h||54,currentLevel().theme,true);
    }
  }

  function drawHazards() {
    for (const h of game.hazards) {
      if (h.x+h.w < camera.x-160 || h.x > camera.x+getW()+220) continue;
      const s = worldToScreen(h.x,h.y);
      if (h.type === 'spikes' || h.type === 'spikePit') {
        ctx.fillStyle = h.type === 'spikePit' ? 'rgba(25,12,6,.78)' : 'rgba(235,235,220,.94)';
        if (h.type === 'spikePit') {
          roundRect(s.x, s.y, h.w, h.h, 16);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,248,218,.25)';
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(235,235,220,.94)';
        const spikeCount = h.type === 'spikePit' ? 8 : 5;
        for (let i=0;i<spikeCount;i++) {
          const x = s.x + i*(h.w/spikeCount);
          ctx.beginPath();
          ctx.moveTo(x,s.y+(h.type==='spikePit'?h.h*.45:h.h));
          ctx.lineTo(x+h.w/(spikeCount*2),s.y+(h.type==='spikePit'?h.h*.10:0));
          ctx.lineTo(x+h.w/spikeCount,s.y+(h.type==='spikePit'?h.h*.45:h.h));
          ctx.closePath();
          ctx.fill();
        }
      } else if (h.type === 'swingBlade') {
        const bladeX = s.x + Math.sin(game.time*2.4 + (h.phase||0)) * 80;
        ctx.strokeStyle = 'rgba(255,214,111,.65)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(s.x + h.w/2, s.y - 70);
        ctx.lineTo(bladeX + h.w/2, s.y + h.h*.45);
        ctx.stroke();
        ctx.fillStyle = 'rgba(230,230,230,.95)';
        ctx.beginPath();
        ctx.ellipse(bladeX + h.w/2, s.y + h.h*.45, 44, 16, 0, 0, Math.PI*2);
        ctx.fill();
      } else if (h.type === 'fallingRock' || h.type === 'rollingBoulder') {
        ctx.fillStyle = '#594d3d';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x+h.w/2, s.y+h.h/2, h.w/2, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,214,111,.35)';
        ctx.stroke();
      } else if (h.type === 'dartTrap') {
        ctx.fillStyle = 'rgba(95,63,28,.92)';
        roundRect(s.x,s.y,h.w,h.h,12);
        ctx.fill();
        ctx.strokeStyle = '#ffd66f';
        ctx.stroke();
      } else {
        ctx.fillStyle = h.type === 'lava' ? 'rgba(255,86,25,.70)' : h.type === 'water' ? 'rgba(87,217,255,.58)' : 'rgba(25,12,6,.70)';
        roundRect(s.x,s.y,h.w,h.h,16);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,248,218,.25)';
        ctx.stroke();
      }
    }
  }


  function enemySpriteFor(type) {
    const fallback = {
      frog: ASSETS.sprites.snake,
      boar: ASSETS.sprites.monkey,
      crawler: ASSETS.sprites.spider
    };

    const preferred = ASSETS.sprites[type];
    if (preferred && hasAsset(preferred)) return preferred;

    const fallbackSrc = fallback[type];
    if (fallbackSrc && hasAsset(fallbackSrc)) return fallbackSrc;

    if (ASSETS.sprites.snake && hasAsset(ASSETS.sprites.snake)) return ASSETS.sprites.snake;
    if (ASSETS.sprites.monkey && hasAsset(ASSETS.sprites.monkey)) return ASSETS.sprites.monkey;
    return preferred || fallbackSrc || null;
  }

  function enemyTint(type) {
    if (type === 'frog') return '#74f2a8';
    if (type === 'boar') return '#ffb347';
    if (type === 'crawler') return '#be6eff';
    if (type === 'bat') return '#66e7ff';
    if (type === 'spider') return '#be6eff';
    if (type === 'monkey') return '#ffd66f';
    return '#ffb347';
  }


  function drawEnemies() {
    for (const e of game.enemies) {
      if (e.dead || e.x+e.w < camera.x-180 || e.x > camera.x+getW()+260) continue;

      const src = enemySpriteFor(e.type);
      const tint = enemyTint(e.type);
      drawImageOrOrb(src, e.x, e.y, e.w, e.h, tint, false, e.dir);

      const s = worldToScreen(e.x, e.y);
      ctx.save();
      ctx.globalAlpha = .92;
      ctx.fillStyle = 'rgba(7,23,14,.72)';
      roundRect(s.x + e.w*.18, s.y - 16, e.w*.64, 16, 8);
      ctx.fill();
      ctx.fillStyle = '#fff8d8';
      ctx.font = '900 9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(enemyLabel(e.type).toUpperCase(), s.x + e.w/2, s.y - 5);
      ctx.restore();
    }
  }

  function drawBoss() {
    const b = game.boss;
    if (!b || !b.alive) return;
    const src = ASSETS.sprites[b.name] || ASSETS.sprites['Sun Guardian'];
    drawImageOrOrb(src,b.x,b.y,b.w,b.h,currentLevel().theme,false,b.dir);
    const s = worldToScreen(b.x,b.y-28);
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    roundRect(s.x,s.y,b.w,14,7);
    ctx.fill();
    ctx.fillStyle = '#ff6b6b';
    roundRect(s.x,s.y,b.w*(b.hp/b.maxHp),14,7);
    ctx.fill();
    ctx.fillStyle = '#fff8d8';
    ctx.font = '900 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(b.name, s.x+b.w/2, s.y-8);
  }

  function drawExitAndGate() {
    if (game.gate && game.gate.locked) {
      const s = worldToScreen(game.gate.x,game.gate.y);
      ctx.fillStyle = 'rgba(82,58,33,.94)';
      roundRect(s.x,s.y,game.gate.w,game.gate.h,18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,214,111,.75)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.fillStyle = '#ffd66f';
      ctx.font = '900 20px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('LOCKED', s.x+game.gate.w/2, s.y+game.gate.h/2);
    }
    if (game.exit && canOpenGate() && !(game.boss?.alive)) {
      const src = ASSETS.effects.portal;
      drawImageOrOrb(src,game.exit.x,game.exit.y,game.exit.w,game.exit.h,'#ffd66f',true);
      const s = worldToScreen(game.exit.x,game.exit.y-14);
      ctx.fillStyle = '#fff8d8';
      ctx.font = '900 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT',s.x+game.exit.w/2,s.y);
    }
  }

  function drawPlayer() {
    const flash = player.invuln > 0 && Math.floor(game.time*18)%2===0;
    const scaleX = player.dir < 0 ? -1 : 1;
    const s = worldToScreen(player.x,player.y);
    const src = ASSETS.sprites.player;
    ctx.save();
    if (flash) ctx.globalAlpha = .45;
    if (hasAsset(src)) {
      ctx.translate(s.x + player.w/2, s.y + player.h/2);
      ctx.scale(scaleX,1);
      ctx.shadowColor = player.torchTimer > 0 ? '#ffb347' : 'rgba(0,0,0,.35)';
      ctx.shadowBlur = player.torchTimer > 0 ? 22 : 8;
      ctx.drawImage(assetImages[src], -player.w*.58, -player.h*.66, player.w*1.16, player.h*1.32);
    } else {
      ctx.fillStyle = '#1f8b54';
      ctx.fillRect(s.x,s.y,player.w,player.h);
    }
    ctx.restore();

    if (player.shield > 0) {
      ctx.strokeStyle = 'rgba(116,242,168,.88)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(s.x+player.w/2,s.y+player.h/2,player.w*.72,player.h*.62,0,0,Math.PI*2);
      ctx.stroke();
    }
    if (player.torchTimer > 0) {
      const flame = ctx.createRadialGradient(s.x+player.w*.8,s.y+player.h*.35,5,s.x+player.w*.8,s.y+player.h*.35,95);
      flame.addColorStop(0,'rgba(255,235,160,.95)');
      flame.addColorStop(.45,'rgba(255,130,40,.38)');
      flame.addColorStop(1,'rgba(255,130,40,0)');
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.arc(s.x+player.w*.8,s.y+player.h*.35,95,0,Math.PI*2);
      ctx.fill();
    }
  }


  function drawBullets() {
    for (const b of game.bullets) {
      const s = worldToScreen(b.x,b.y);
      ctx.save();
      ctx.fillStyle = b.color || '#66e7ff';
      ctx.shadowColor = b.color || '#66e7ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.ellipse(s.x + b.w/2, s.y + b.h/2, b.w, b.h*.7, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }


  function drawDarts() {
    ctx.fillStyle = '#ffb347';
    ctx.shadowColor = '#ffb347';
    ctx.shadowBlur = 12;
    for (const d of game.darts) {
      const s = worldToScreen(d.x,d.y);
      ctx.beginPath();
      ctx.moveTo(s.x,s.y);
      ctx.lineTo(s.x+d.w,s.y+d.h/2);
      ctx.lineTo(s.x,s.y+d.h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function drawBoulder() {
    const b = game.boulder;
    if (!b?.active) return;
    const s = worldToScreen(b.x,b.y);
    ctx.fillStyle = '#594d3d';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(s.x+b.w/2,s.y+b.h/2,b.w/2,0,Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,214,111,.35)';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  function drawImageOrOrb(src,x,y,w,h,color='#ffd66f',glow=false,dir=1) {
    const s = worldToScreen(x,y);
    if (hasAsset(src)) {
      ctx.save();
      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
      }
      ctx.translate(s.x+w/2,s.y+h/2);
      ctx.scale(dir < 0 ? -1 : 1,1);
      ctx.drawImage(assetImages[src], -w/2, -h/2, w, h);
      ctx.restore();
    } else {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(s.x+w/2,s.y+h/2,Math.max(w,h)/2,0,Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,248,218,.70)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of game.particles) {
      const s = worldToScreen(p.x,p.y);
      const a = p.life/p.ttl;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(s.x,s.y,Math.max(1,p.size*a),0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawForeground() {
    const w = getW(), h = getH();
    ctx.save();
    for (let i=0;i<12;i++) {
      const x = ((i*190 - camera.x*.45) % (w+240)) - 120;
      const y = 30 + (i%5)*95 + Math.sin(game.time+i)*10;
      ctx.globalAlpha = .35;
      ctx.fillStyle = currentLevel().id === 9 ? '#3a221a' : '#0f4d2a';
      ctx.beginPath();
      ctx.ellipse(x,y,70,20,Math.sin(i),0,Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
    if (currentLevel().id === 4 || currentLevel().id === 7) {
      const s = worldToScreen(player.x+player.w/2, player.y+player.h/2);
      const radius = player.torchTimer > 0 ? 330 : 210;
      const vignette = ctx.createRadialGradient(s.x,s.y,radius*.25,s.x,s.y,radius);
      vignette.addColorStop(0,'rgba(0,0,0,0)');
      vignette.addColorStop(.55,'rgba(0,0,0,.25)');
      vignette.addColorStop(1,'rgba(0,0,0,.72)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0,0,w,h);
    }
  }

  function drawHudStrip() {
    const w = getW();
    ctx.save();
    ctx.fillStyle = 'rgba(7,23,14,.48)';
    roundRect(16,16,w-32,50,15);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.stroke();
    ctx.fillStyle = '#fff8d8';
    ctx.font = '900 18px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`${currentLevel().id}. ${currentLevel().title}`,30,47);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffd66f';
    ctx.fillText(`Best ${Math.floor(Math.max(state.best,state.score))}`,w-30,47);
    ctx.restore();
  }

  function roundRect(x,y,w,h,r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function syncUI() {
    const lv = currentLevel();
    ui.scoreValue.textContent = Math.floor(state.score);
    ui.coinsValue.textContent = state.coins;
    ui.relicValue.textContent = `${game.relics}/${lv.relicTarget}`;
    ui.keysValue.textContent = `${game.keys}/${lv.keyTarget}`;
    ui.livesValue.textContent = state.lives;
    ui.levelValue.textContent = lv.id;
    ui.progressBar.style.width = `${Math.min(100, game.relics/lv.relicTarget*100)}%`;

    let tools = [];
    if (player.dashCooldown <= 0) tools.push('Dash ready');
    if (player.torchTimer > 0) tools.push(`Torch ${Math.ceil(player.torchTimer)}s`);
    if (player.shootPowerTimer > 0) tools.push(`Blaster ${Math.ceil(player.shootPowerTimer)}s`);
    if (player.magnetTimer > 0) tools.push(`Magnet ${Math.ceil(player.magnetTimer)}s`);
    if (player.shield > 0) tools.push('Shield');
    tools.push(`Ammo ${player.ammo}`);
    ui.powerText.textContent = `Tool: ${tools.length ? tools.join(' • ') : 'None'}`;

    let mission;
    if (game.relics < lv.relicTarget) mission = `Collect ${lv.relicTarget - game.relics} more Sun Relic(s).`;
    else if (game.keys < lv.keyTarget) mission = `Find ${lv.keyTarget - game.keys} more Temple Key(s).`;
    else if (!game.plateActive) mission = 'Step on the glowing pressure plate.';
    else if (game.boss?.alive) mission = `Defeat ${game.boss.name}.`;
    else mission = 'Reach the glowing exit portal.';
    ui.missionText.textContent = mission;
    ui.storyText.textContent = game.speech || lv.story;
    ui.muteBtn.textContent = state.muted ? 'Sound Off' : 'Sound On';
    ui.pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
    updateChallengeUI();
  }

  function renderMap() {
    ui.mapGrid.innerHTML = '';
    for (const lv of LEVELS) {
      const unlocked = lv.id <= state.unlockedLevel;
      const btn = document.createElement('button');
      btn.className = `map-node ${unlocked ? 'unlocked' : 'locked'}`;
      btn.disabled = !unlocked;
      btn.innerHTML = `<strong>${lv.id}. ${lv.title}</strong><small>${lv.boss ? `Boss: ${lv.boss}` : 'Jungle route'}<br>${lv.relicTarget} relics • ${lv.keyTarget} key(s)</small>`;
      btn.addEventListener('click',()=>{
        state.levelIndex = lv.id - 1;
        ui.mapOverlay.classList.remove('active');
        state.paused = false;
        buildLevel();
        showCutscene();
        saveState();
      });
      ui.mapGrid.appendChild(btn);
    }
  }

  function openMap() {
    state.paused = true;
    stopMusic();
    renderMap();
    ui.mapOverlay.classList.add('active');
  }

  function closeMap() {
    ui.mapOverlay.classList.remove('active');
    state.paused = false;
    if (state.started && !game.levelComplete && !state.gameOver) startMusic();
  }

  function bindHold(id, prop) {
    const el = document.getElementById(id);
    if (!el) return;
    const on = e => { e.preventDefault(); touch[prop] = true; };
    const off = e => { e.preventDefault(); touch[prop] = false; };
    el.addEventListener('pointerdown',on);
    el.addEventListener('pointerup',off);
    el.addEventListener('pointerleave',off);
    el.addEventListener('pointercancel',off);
  }


  function ensureShootButton() {
    if (document.getElementById('shootBtn')) return;
    const controls = document.querySelector('.controls');
    if (!controls) return;
    const btn = document.createElement('button');
    btn.id = 'shootBtn';
    btn.textContent = 'Shoot';
    btn.title = 'Shoot relic power';
    btn.addEventListener('click', shoot);
    controls.appendChild(btn);
  }


  function bindEvents() {
    document.getElementById('playBtn').addEventListener('click',startGame);
    document.getElementById('howBtn').addEventListener('click',()=>ui.helpOverlay.classList.add('active'));
    document.getElementById('closeHelpBtn').addEventListener('click',()=>ui.helpOverlay.classList.remove('active'));
    document.getElementById('continueCutsceneBtn').addEventListener('click',continueCutscene);
    document.getElementById('submitScoreBtn').addEventListener('click',()=>postScore('manual_submit'));
    document.getElementById('mapBtn').addEventListener('click',openMap);
    document.getElementById('mapAfterBtn').addEventListener('click',openMap);
    document.getElementById('closeMapBtn').addEventListener('click',closeMap);
    document.getElementById('nextLevelBtn').addEventListener('click',()=>{game.autoAdvanceQueued=false;nextLevel();});
    document.getElementById('retryBtn').addEventListener('click',()=>{ui.gameOverOverlay.classList.remove('active');state.gameOver=false;state.completed=false;state.lives=3;buildLevel();showCutscene();});
    document.getElementById('resetRunBtn').addEventListener('click',resetRun);

    ui.muteBtn.addEventListener('click',()=>{
      state.muted = !state.muted;
      if (state.muted) stopMusic(); else startMusic();
      saveState();
      syncUI();
    });
    ui.pauseBtn.addEventListener('click',()=>{
      state.paused = !state.paused;
      if (state.paused) stopMusic(); else startMusic();
      syncUI();
    });

    bindHold('leftBtn','left');
    bindHold('rightBtn','right');
    bindHold('forwardBtn','forward');
    bindHold('backBtn','back');
    document.getElementById('jumpBtn').addEventListener('click',jump);
    document.getElementById('dashBtn').addEventListener('click',dash);
    ensureShootButton();

    window.addEventListener('keydown',e=>{
      keys[e.code] = true;
      if (e.code === 'Space') { e.preventDefault(); jump(); }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyJ') dash();
      if (e.code === 'KeyK' || e.code === 'KeyF') shoot();
      if (e.code === 'KeyM') openMap();
    });
    window.addEventListener('keyup',e=>{ keys[e.code] = false; });

    window.addEventListener('resize',resizeCanvas);
    window.addEventListener('orientationchange',()=>setTimeout(resizeCanvas,120));
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(()=>resizeCanvas());
      ro.observe(document.body);
      const shell = canvas.closest('.canvas-shell');
      if (shell) ro.observe(shell);
    }

    window.addEventListener('message',ev=>{
      const data = ev.data || {};
      const type = data.type || data.event;
      if (type === 'GG_PAUSE') {
        state.paused = !!(data.payload?.paused ?? data.paused);
        if (state.paused) stopMusic(); else startMusic();
        syncUI();
      }
      if (type === 'GG_RESTART') resetRun();
      if (type === 'GG_MUTE') {
        state.muted = !!(data.payload?.muted ?? data.muted);
        if (state.muted) stopMusic(); else startMusic();
        syncUI();
      }
    });
  }

  function loop(now) {
    const dt = Math.min(.05, Math.max(.001, (now-last)/1000));
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  bindEvents();
  ensureChallengeUI();
  resizeCanvas();
  buildLevel();
  renderMap();
  syncUI();
  loadAssets().then(()=>{
    resizeCanvas();
    requestAnimationFrame(loop);
  });
})();