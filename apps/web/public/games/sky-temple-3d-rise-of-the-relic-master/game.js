(() => {
  'use strict';

  const GAME_SLUG = 'sky-temple-3d-rise-of-the-relic-master';
  const SAVE_KEY = 'gg_sky_temple_3d_relic_master_save_v2';
  const BEST_KEY = 'gg_sky_temple_3d_relic_master_best_v2';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const ui = {
    scoreValue: document.getElementById('scoreValue'),
    coinsValue: document.getElementById('coinsValue'),
    relicValue: document.getElementById('relicValue'),
    livesValue: document.getElementById('livesValue'),
    worldValue: document.getElementById('worldValue'),
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
    shopOverlay: document.getElementById('shopOverlay'),
    shopGrid: document.getElementById('shopGrid'),
    shopCoinsText: document.getElementById('shopCoinsText'),
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

  const SKINS = [
    {id:'sky', name:'Sky Guardian', cost:0, body:'#66e7ff', dark:'#174766', gem:'#ffd66f'},
    {id:'solar', name:'Solar Relic', cost:220, body:'#ffd66f', dark:'#7b4d13', gem:'#ff8ac8'},
    {id:'violet', name:'Violet Master', cost:360, body:'#a98bff', dark:'#3a286e', gem:'#66e7ff'},
    {id:'emerald', name:'Emerald Wind', cost:520, body:'#75efb0', dark:'#174b35', gem:'#ffd66f'},
    {id:'shadow', name:'Shadow Relic', cost:760, body:'#35304f', dark:'#11131f', gem:'#ff8ac8'}
  ];

  const ASSETS = {
    backgrounds: {
      1: './assets/backgrounds/world-01-sky-garden.png',
      2: './assets/backgrounds/world-02-crystal-caverns.png',
      3: './assets/backgrounds/world-03-storm-citadel.png',
      4: './assets/backgrounds/world-04-solar-sanctuary.png',
      5: './assets/backgrounds/world-05-moonlit-archives.png',
      6: './assets/backgrounds/world-06-neon-aether.png',
      7: './assets/backgrounds/world-07-emerald-vault.png',
      8: './assets/backgrounds/world-08-frost-cloud-court.png',
      9: './assets/backgrounds/world-09-inferno-relic-core.png',
      10: './assets/backgrounds/world-10-celestial-throne.png'
    },
    players: {
      sky: './assets/sprites/player-sky.png',
      solar: './assets/sprites/player-solar.png',
      violet: './assets/sprites/player-violet.png',
      emerald: './assets/sprites/player-emerald.png',
      shadow: './assets/sprites/player-shadow.png'
    },
    enemies: {
      drone: './assets/sprites/enemy-drone.png',
      hunter: './assets/sprites/enemy-hunter.png',
      turret: './assets/sprites/enemy-turret.png'
    },
    bosses: {
      'Garden Sentinel': './assets/sprites/boss-garden-sentinel.png',
      'Crystal Warden': './assets/sprites/boss-crystal-warden.png',
      'Thunder Golem': './assets/sprites/boss-thunder-golem.png',
      'Relic Master': './assets/sprites/boss-relic-master.png',

      // New worlds reuse the strongest available boss art until dedicated sprites are added.
      'Moonlit Archivist': './assets/sprites/boss-crystal-warden.png',
      'Neon Aether Lord': './assets/sprites/boss-relic-master.png',
      'Emerald Gatekeeper': './assets/sprites/boss-garden-sentinel.png',
      'Frost Cloud Monarch': './assets/sprites/boss-crystal-warden.png',
      'Inferno Relic Titan': './assets/sprites/boss-thunder-golem.png',
      'Celestial Relic Master': './assets/sprites/boss-relic-master.png'
    },
    items: {
      relic: './assets/items/relic.png',
      coin: './assets/items/coin.png',
      shield: './assets/items/power-shield.png',
      fly: './assets/items/power-fly.png',
      energy: './assets/items/power-energy.png',
      heart: './assets/items/power-heart.png',
      speed: './assets/items/power-speed.png'
    },
    textures: {
      1: './assets/textures/platform-sky-garden.png',
      2: './assets/textures/platform-crystal.png',
      3: './assets/textures/platform-storm.png',
      4: './assets/textures/platform-solar.png',
      5: './assets/textures/platform-moonlit-archives.png',
      6: './assets/textures/platform-neon-aether.png',
      7: './assets/textures/platform-emerald-vault.png',
      8: './assets/textures/platform-frost-cloud-court.png',
      9: './assets/textures/platform-inferno-relic-core.png',
      10: './assets/textures/platform-celestial-throne.png'
    },
    effects: {
      portal: './assets/effects/portal.png'
    }
  };

  const assetImages = {};
  const assetSources = [
    ...Object.values(ASSETS.backgrounds),
    ...Object.values(ASSETS.players),
    ...Object.values(ASSETS.enemies),
    ...Object.values(ASSETS.bosses),
    ...Object.values(ASSETS.items),
    ...Object.values(ASSETS.textures),
    ...Object.values(ASSETS.effects)
  ];

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

  function drawCoverImage(img, x, y, w, h, parallaxX=0, parallaxY=0) {
    if (!img || !img.naturalWidth) return false;
    const ratio = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * ratio;
    const dh = img.naturalHeight * ratio;
    const ox = x + (w - dw) / 2 + parallaxX;
    const oy = y + (h - dh) / 2 + parallaxY;
    ctx.drawImage(img, ox, oy, dw, dh);
    return true;
  }

  function drawAssetAt(src, x, y, w, h, alpha=1) {
    const img = assetImages[src];
    if (!hasAsset(src)) return false;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
    return true;
  }

  function drawAssetBillboard(src, obj, worldW=120, worldH=150, label='') {
    if (!hasAsset(src)) return false;
    const p = project(obj.x, obj.y, obj.z);
    const w = Math.max(10, worldW * p.s);
    const h = Math.max(10, worldH * p.s);
    ctx.save();
    ctx.shadowColor = currentWorld().accent;
    ctx.shadowBlur = 12 * p.s;
    ctx.drawImage(assetImages[src], p.x - w / 2, p.y - h, w, h);
    ctx.shadowBlur = 0;
    if (label) {
      ctx.fillStyle = '#fff';
      ctx.font = `900 ${Math.max(10,14*p.s)}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText(label, p.x, p.y - h - 12 * p.s);
    }
    ctx.restore();
    return true;
  }

  function drawAssetCentered(src, obj, worldSize=64) {
    if (!hasAsset(src)) return false;
    const bobY = obj.y + Math.sin(performance.now() * 0.003 + (obj.id || 0)) * 8;
    const p = project(obj.x, bobY, obj.z);
    const size = Math.max(8, worldSize * p.s);
    ctx.save();
    ctx.shadowColor = currentWorld().accent;
    ctx.shadowBlur = 14 * p.s;
    ctx.drawImage(assetImages[src], p.x - size / 2, p.y - size / 2, size, size);
    ctx.restore();
    return true;
  }

  const WORLDS = [
    {id:1,name:'Sky Garden', short:'Garden', skyTop:'#19235a', skyMid:'#425ec6', skyBottom:'#8ae9ff', platform:'#6d61b8', accent:'#75efb0', story:'A floating garden wakes above the clouds. The first relics respond to your arrival.'},
    {id:2,name:'Crystal Caverns', short:'Cavern', skyTop:'#120d3c', skyMid:'#3c287c', skyBottom:'#a98bff', platform:'#5a4ca8', accent:'#66e7ff', story:'Ancient crystals lift the temple into a glowing cavern sky.'},
    {id:3,name:'Storm Citadel', short:'Storm', skyTop:'#17172d', skyMid:'#38486f', skyBottom:'#89a6ff', platform:'#555b7f', accent:'#ff8ac8', story:'Storm engines protect the high citadel. Enemies now predict your movement.'},
    {id:4,name:'Solar Sanctuary', short:'Solar', skyTop:'#351a46', skyMid:'#ae586f', skyBottom:'#ffd66f', platform:'#a887e8', accent:'#ffd66f', story:'The final sanctuary burns with relic light. The Relic Master trial begins.'},

    // New 6 worlds / levels
    {id:5,name:'Moonlit Archives', short:'Archive', skyTop:'#1b144c', skyMid:'#5d43ad', skyBottom:'#c9b8ff', platform:'#8f6fe0', accent:'#d8c7ff', story:'Hidden scroll platforms drift through moonlight. Ancient records reveal the next relic path.'},
    {id:6,name:'Neon Aether', short:'Aether', skyTop:'#03143d', skyMid:'#0067a8', skyBottom:'#04d9ff', platform:'#0876a8', accent:'#66e7ff', story:'The aether lanes glow with blue energy. Fast enemies patrol the neon sky routes.'},
    {id:7,name:'Emerald Vault', short:'Vault', skyTop:'#102a3d', skyMid:'#2a6f5a', skyBottom:'#75efb0', platform:'#0b7f50', accent:'#75efb0', story:'The Emerald Vault opens with living platforms and guardian vines of relic energy.'},
    {id:8,name:'Frost Cloud Court', short:'Frost', skyTop:'#edf7ff', skyMid:'#9ec7ff', skyBottom:'#d8e5ff', platform:'#dfeaff', accent:'#aeefff', story:'Ice-white cloud platforms float above a frozen sky court. Momentum and flight matter here.'},
    {id:9,name:'Inferno Relic Core', short:'Inferno', skyTop:'#3a0d24', skyMid:'#b72f18', skyBottom:'#ff8b16', platform:'#e44d19', accent:'#ffb347', story:'The relic core burns with orange light. Survive heat waves, dense enemies, and aggressive shots.'},
    {id:10,name:'Celestial Throne', short:'Throne', skyTop:'#1a1360', skyMid:'#4534c4', skyBottom:'#f5f8ff', platform:'#ffffff', accent:'#ffd66f', story:'The final celestial throne stands above all worlds. Only the true Relic Master can pass.'}
  ];

  const LEVELS = [
    {id:1, world:1, title:'Garden Gate', relicTarget:4, length:3000, boss:false, enemyTier:1, cut:'The Sky Garden opens. Recover the first relics and reach the light bridge.'},
    {id:2, world:1, title:'Canopy Trial', relicTarget:5, length:3400, boss:'Garden Sentinel', enemyTier:1, cut:'A guardian sentinel guards the canopy gate. Defeat it to unlock World 2.'},
    {id:3, world:2, title:'Crystal Steps', relicTarget:5, length:3700, boss:false, enemyTier:2, cut:'Crystal platforms shift through the air. The fly power appears for the first time.'},
    {id:4, world:2, title:'Cavern Crown', relicTarget:6, length:4100, boss:'Crystal Warden', enemyTier:2, cut:'The Crystal Warden protects the crown relic. Expect stronger shots and tighter jumps.'},
    {id:5, world:3, title:'Storm Runway', relicTarget:6, length:4400, boss:false, enemyTier:3, cut:'The Storm Citadel is alive with patrol drones that chase and fire ahead of you.'},
    {id:6, world:3, title:'Thunder Boss Bridge', relicTarget:7, length:4700, boss:'Thunder Golem', enemyTier:3, cut:'The bridge trembles. The Thunder Golem waits beyond the storm field.'},
    {id:7, world:4, title:'Solar Ascent', relicTarget:7, length:5000, boss:false, enemyTier:4, cut:'Solar platforms rise and fall. Use flight wisely to cross the final ascent.'},
    {id:8, world:4, title:'Relic Master Trial', relicTarget:8, length:5600, boss:'Relic Master', enemyTier:5, cut:'All relic paths converge. Defeat the Relic Master and claim the sky temple.'},

    // New 6 levels / worlds
    {id:9, world:5, title:'Moonlit Archive Run', relicTarget:8, length:5900, boss:'Moonlit Archivist', enemyTier:5, cut:'The Moonlit Archives reveal floating scroll platforms. Recover the archive relics and defeat the Moonlit Archivist.'},
    {id:10, world:6, title:'Neon Aether Dash', relicTarget:9, length:6200, boss:'Neon Aether Lord', enemyTier:6, cut:'The Neon Aether lanes are faster and brighter. Use flight and speed boosts to survive the glowing route.'},
    {id:11, world:7, title:'Emerald Vault Trial', relicTarget:9, length:6500, boss:'Emerald Gatekeeper', enemyTier:6, cut:'The Emerald Vault is protected by living guardians. Collect the vault relics and open the green gate.'},
    {id:12, world:8, title:'Frost Cloud Court', relicTarget:10, length:6800, boss:'Frost Cloud Monarch', enemyTier:7, cut:'The Frost Cloud Court tests air control. Platforms feel wider, but enemies strike from longer range.'},
    {id:13, world:9, title:'Inferno Relic Core', relicTarget:10, length:7200, boss:'Inferno Relic Titan', enemyTier:8, cut:'The Inferno Relic Core is unstable. Expect stronger bosses, more enemies, and faster projectile patterns.'},
    {id:14, world:10, title:'Celestial Throne Finale', relicTarget:12, length:7800, boss:'Celestial Relic Master', enemyTier:9, cut:'The Celestial Throne is the final test. Master all powers and defeat the ultimate relic guardian.'}
  ];

  const stateDefaults = () => ({
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY) || '0') || 0,
    bankCoins: 0,
    runCoins: 0,
    lives: 3,
    levelIndex: 0,
    unlockedLevel: 1,
    skin: 'sky',
    unlockedSkins: ['sky'],
    started: false,
    paused: false,
    muted: false,
    completed: false,
    gameOver: false
  });

  let state = loadState();
  let last = performance.now();
  let lastLiveScore = -1;
  let lastLiveAt = 0;
  const keys = {};
  const touch = {left:false,right:false,forward:false,back:false,fly:false};

  const camera = {x:0,z:-520,y:260};
  const player = {
    x:0,z:-90,y:70,
    vx:0,vz:0,vy:0,
    w:52,d:52,h:90,
    speed:300,jump:510,onGround:false,dir:1,
    invuln:0,shootTimer:0,
    shield:0,energyTimer:0,speedTimer:0,flyTimer:0,flyFuel:0
  };

  const game = {
    platforms: [], relics: [], coins: [], powers: [], enemies: [], bosses: [],
    shots: [], enemyShots: [], particles: [], rings: [],
    speech: '', speechTimer: 0, levelComplete: false, cutscenePending: false,
    shake: 0, flash: 0, zone: 1
  };

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      return raw ? {...stateDefaults(), ...raw, started:false, paused:false, completed:false, gameOver:false} : stateDefaults();
    } catch {
      return stateDefaults();
    }
  }

  function saveState() {
    state.best = Math.max(state.best, state.score);
    localStorage.setItem(SAVE_KEY, JSON.stringify({...state, started:false, paused:false}));
    localStorage.setItem(BEST_KEY, String(Math.floor(state.best)));
  }

  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function currentLevel(){ return LEVELS[state.levelIndex]; }
  function currentWorld(){ return WORLDS.find(w => w.id === currentLevel().world) || WORLDS[0]; }
  function currentSkin(){ return SKINS.find(s => s.id === state.skin) || SKINS[0]; }
  function getW(){ return canvas.getBoundingClientRect().width || 960; }
  function getH(){ return canvas.getBoundingClientRect().height || 540; }
  function dist(a,b){ return Math.hypot(a.x-b.x, a.z-b.z); }

  function fitCanvasToViewport() {
    const shell = canvas.closest('.canvas-shell');
    const topbar = document.querySelector('.topbar');
    const controls = document.querySelector('.controls');
    if (!shell) return;

    const vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 960);
    const vh = Math.max(360, window.innerHeight || document.documentElement.clientHeight || 720);
    const topH = topbar ? topbar.getBoundingClientRect().height : 0;
    const controlsH = controls ? controls.getBoundingClientRect().height : 0;
    const reserved = topH + controlsH + 34;
    const available = Math.max(300, vh - reserved);

    if (vw <= 980) {
      shell.style.height = `${Math.max(300, Math.min(available, Math.round(vh * 0.68)))}px`;
      canvas.style.touchAction = 'none';
    } else {
      shell.style.height = '';
      canvas.style.touchAction = 'none';
    }
  }

  function resizeCanvas() {
    fitCanvasToViewport();
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  function project(x,y,z) {
    const w = getW(), h = getH();
    const mobile = w <= 760 || h <= 520;
    const dz = z - camera.z;
    const focal = mobile ? 620 : 760;
    const scale = focal / (dz + focal);
    const horizon = mobile ? h * 0.72 : h * 0.76;
    const depthTilt = mobile ? 0.18 : 0.22;
    const shakeX = game.shake ? (Math.random()-0.5)*game.shake : 0;
    const shakeY = game.shake ? (Math.random()-0.5)*game.shake : 0;
    return {
      x: w/2 + (x - camera.x) * scale + shakeX,
      y: horizon - dz * depthTilt - y * scale + shakeY,
      s: scale,
      dz
    };
  }

  function shade(hex, amount) {
    const n = parseInt(hex.slice(1),16);
    let r = (n >> 16) + amount, g = ((n >> 8) & 255) + amount, b = (n & 255) + amount;
    return `rgb(${clamp(r,0,255)},${clamp(g,0,255)},${clamp(b,0,255)})`;
  }

  function tone(freq, dur=0.08, type='sine', gain=0.04, delay=0) {
    if (state.muted) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!tone.ac) {
      tone.ac = new Ctx();
      tone.master = tone.ac.createGain();
      tone.master.gain.value = 0.12;
      tone.master.connect(tone.ac.destination);
    }
    const ac = tone.ac;
    if (ac.state === 'suspended') ac.resume().catch(()=>{});
    const t = ac.currentTime + delay;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o.connect(g); g.connect(tone.master); o.start(t); o.stop(t+dur+0.03);
  }
  tone.ac = null; tone.master = null;
  let musicInt = null, musicStep = 0;

  function sfx(kind) {
    if (kind === 'jump') tone(440,.05,'triangle',.045);
    if (kind === 'fly') tone(620,.05,'sine',.03);
    if (kind === 'coin') { tone(760,.05,'triangle',.045); tone(1040,.06,'sine',.03,.04); }
    if (kind === 'relic') { tone(520,.07,'triangle',.05); tone(820,.08,'sine',.04,.06); tone(1200,.1,'sine',.025,.13); }
    if (kind === 'shoot') tone(760,.05,'triangle',.035);
    if (kind === 'enemy') tone(260,.05,'square',.025);
    if (kind === 'hit') tone(160,.14,'sawtooth',.05);
    if (kind === 'power') { tone(520,.06,'triangle',.05); tone(820,.08,'sine',.035,.05); }
    if (kind === 'boss') { tone(150,.12,'sawtooth',.055); tone(220,.12,'square',.035,.08); }
    if (kind === 'win') { tone(392,.08,'triangle',.05); tone(554,.1,'triangle',.04,.08); tone(784,.12,'sine',.03,.18); }
    if (kind === 'buy') { tone(660,.08,'triangle',.04); tone(990,.09,'sine',.035,.08); }
  }

  function musicTick() {
    if (!state.started || state.paused || state.completed || state.gameOver || state.muted) return;
    const w = currentWorld().id;
    const themes = {
      1: [196,247,294,370,392,370,294,247],
      2: [185,233,277,349,415,349,277,233],
      3: [165,220,247,330,370,330,247,220],
      4: [220,277,330,415,494,415,330,277],
      5: [207,261,311,392,466,392,311,261],
      6: [247,311,370,494,622,494,370,311],
      7: [174,220,261,349,392,349,261,220],
      8: [233,294,349,440,523,440,349,294],
      9: [147,196,247,294,392,294,247,196],
      10: [262,330,392,523,659,523,392,330]
    };
    const notes = themes[w] || themes[1];
    const n = notes[musicStep++ % notes.length];
    tone(n,.09,'triangle',.008);
    if (musicStep % 2 === 0) tone(n/2,.12,'sine',.006);
  }
  function startMusic(){ if (!musicInt && !state.muted) musicInt = setInterval(musicTick, 270); }
  function stopMusic(){ if (musicInt) clearInterval(musicInt); musicInt = null; }

  function postScore(mode='live') {
    const clean = Math.max(0, Math.floor(state.score));
    const now = performance.now();
    if (mode === 'live' && clean === lastLiveScore && now - lastLiveAt < 150) return;
    lastLiveScore = clean; lastLiveAt = now;
    const payload = {gameSlug:GAME_SLUG, slug:GAME_SLUG, score:clean, best:Math.max(state.best, clean), level:currentLevel().id, world:currentLevel().world, mode};
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    try { window.GG?.setScore?.(clean, {gameSlug:GAME_SLUG}); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(clean, {gameSlug:GAME_SLUG}); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({type:'GG_SCORE', ...payload, payload}, '*'); } catch {}
    try { window.parent?.postMessage?.({type:'gg:score', ...payload, payload}, '*'); } catch {}
  }

  function placePlayerOnStartPlatform() {
    const start = game.platforms[0];
    const top = start ? start.y + start.h : 70;
    player.x = 0;
    player.z = -90;
    player.y = top;
    player.vx = 0;
    player.vz = 0;
    player.vy = 0;
    player.onGround = true;
  }

  function buildLevel() {
    const lv = currentLevel();
    const world = currentWorld();
    const len = lv.length;

    game.platforms = [];
    game.relics = [];
    game.coins = [];
    game.powers = [];
    game.enemies = [];
    game.bosses = [];
    game.shots = [];
    game.enemyShots = [];
    game.particles = [];
    game.rings = [];
    game.speech = world.story;
    game.speechTimer = 4;
    game.levelComplete = false;
    game.shake = 0;
    game.flash = 0;

    const baseColor = world.platform;
    const accent = world.accent;
    const addP = (id,x,z,y,w,d,h,color=baseColor,move=null) => {
      game.platforms.push({id,x,z,y,w,d,h,color,baseX:x,baseZ:z,baseY:y,prevX:x,prevZ:z,prevY:y,dir:1,move});
    };

    addP('start', 0, 0, 0, 500, 540, 46, baseColor);
    const count = 7 + Math.floor(lv.id/2);
    for (let i=1;i<=count;i++) {
      const z = i * (len/(count+1));
      const x = Math.sin(i*1.35 + lv.id) * (190 + 18*lv.world);
      const y = 40 + i*22 + Math.sin(i*.7)*35 + lv.world*10;
      const w = 280 + (i%3)*70;
      const d = 300 + (i%2)*120;
      const moving = i%3===0 ? {axis:i%2?'x':'z', min:(i%2?x-220:z-190), max:(i%2?x+220:z+190), speed:80+lv.enemyTier*10} : null;
      addP(`p${i}`, x, z, y, w, d, 40, i%4===0?accent:baseColor, moving);
    }
    addP('arena', 0, len-160, 170+lv.world*26, 650, 650, 56, lv.boss?shade(accent,8):accent);

    const platformAt = idx => game.platforms[Math.min(idx, game.platforms.length-1)];
    for (let i=0;i<lv.relicTarget;i++) {
      const p = platformAt(1 + Math.floor(i*(game.platforms.length-2)/Math.max(1,lv.relicTarget-1)));
      game.relics.push({id:i,x:p.x + (i%2?55:-55), z:p.z, y:p.y+p.h+58, taken:false, size:38});
    }

    let coinId = 0;
    for (const p of game.platforms) {
      if (p.id === 'arena') continue;
      const n = p.id === 'start' ? 3 : 2;
      for (let i=0;i<n;i++) {
        game.coins.push({id:coinId++, x:p.x - 70 + i*70, z:p.z - 50 + i*70, y:p.y+p.h+42, taken:false, size:24});
      }
    }

    const powerTypes = lv.id >= 3 ? ['shield','fly','energy','heart','speed'] : ['shield','energy','heart','speed'];
    for (let i=0;i<Math.min(4,powerTypes.length);i++) {
      const p = platformAt(2 + i*2);
      if (!p) continue;
      game.powers.push({id:i,type:powerTypes[(i+lv.id)%powerTypes.length],x:p.x+90,z:p.z-70,y:p.y+p.h+48,taken:false,size:34});
    }

    const enemyCount = 3 + lv.enemyTier;
    for (let i=0;i<enemyCount;i++) {
      const p = platformAt(1 + (i % Math.max(1,game.platforms.length-2)));
      const type = i%3===0 ? 'drone' : i%3===1 ? 'hunter' : 'turret';
      game.enemies.push({
        id:i,type,
        x:p.x+(i%2?90:-90), z:p.z+(i%2?60:-60), y:p.y+p.h+(type==='drone'?120:70),
        baseX:p.x+(i%2?90:-90), baseZ:p.z+(i%2?60:-60),
        hp:type==='drone'?2+Math.floor(lv.enemyTier/3):type==='hunter'?2+Math.floor(lv.enemyTier/2):1+Math.floor(lv.enemyTier/2),
        maxHp:type==='turret'?2:3,
        speed:60+lv.enemyTier*18,
        range:160+lv.enemyTier*24,
        shootTimer:1.4 - Math.min(.45,lv.enemyTier*.08),
        shootCooldown:1.35 - Math.min(.42,lv.enemyTier*.06),
        alert: 680 + lv.enemyTier*90,
        dead:false,
        angle:Math.random()*Math.PI*2,
        state:'patrol'
      });
    }

    if (lv.boss) {
      const p = game.platforms[game.platforms.length-1];
      game.bosses.push({
        id:'boss', name:lv.boss, type:'boss',
        x:p.x+120, z:p.z, y:p.y+p.h+72,
        hp:8+lv.enemyTier*3, maxHp:8+lv.enemyTier*3,
        speed:86+lv.enemyTier*10, range:230, angle:0,
        shootTimer:.9, shootCooldown:Math.max(.55,1.05-lv.enemyTier*.06),
        alive:true
      });
    }

    placePlayerOnStartPlatform();
    player.invuln = 0; player.shootTimer = 0;
    player.shield = 0; player.energyTimer = 0; player.speedTimer = 0; player.flyTimer = 0; player.flyFuel = 0;

    state.runCoins = 0;
    state.lives = Math.max(3,state.lives || 3);
    syncUI();
    renderMap();
  }

  function startGame() {
    state = loadState();
    state.started = true;
    state.paused = false;
    state.completed = false;
    state.gameOver = false;
    state.score = 0;
    state.lives = 3;
    state.runCoins = 0;
    ui.startOverlay.classList.remove('active');
    ui.completeOverlay.classList.remove('active');
    ui.gameOverOverlay.classList.remove('active');
    state.levelIndex = clamp(state.levelIndex || 0, 0, LEVELS.length-1);
    buildLevel();
    showCutsceneForLevel();
    startMusic();
    saveState();
  }

  function showCutsceneForLevel() {
    const lv = currentLevel(), world = currentWorld();
    state.paused = true;
    ui.cutsceneLabel.textContent = `WORLD ${world.id}: ${world.name}`;
    ui.cutsceneTitle.textContent = `${lv.id}. ${lv.title}`;
    ui.cutsceneText.textContent = lv.cut;
    ui.cutsceneOverlay.classList.add('active');
    stopMusic();
  }

  function continueCutscene() {
    ui.cutsceneOverlay.classList.remove('active');
    state.paused = false;
    startMusic();
  }

  function jumpOrFly() {
    if (!state.started || state.paused || state.completed || state.gameOver) return;
    if (player.onGround) {
      player.vy = player.jump;
      player.onGround = false;
      sfx('jump');
      return;
    }
    if (player.flyTimer > 0) {
      touch.fly = true;
      player.vy = Math.min(player.vy + 160, 250);
      addParticles(player.x, player.y+20, player.z, currentSkin().gem, 3);
      sfx('fly');
    }
  }

  function shoot() {
    if (!state.started || state.paused || state.completed || state.gameOver) return;
    if (player.shootTimer > 0) return;
    const boosted = player.energyTimer > 0;
    player.shootTimer = boosted ? 0.14 : 0.32;
    game.shots.push({
      x:player.x, y:player.y+56, z:player.z+34,
      vx:0, vy:0, vz:boosted ? 880 : 670,
      life:1.35, power:boosted?2:1, color:boosted?currentSkin().gem:currentSkin().body
    });
    sfx('shoot');
  }

  function updatePlatforms(dt) {
    for (const p of game.platforms) {
      p.prevX=p.x; p.prevZ=p.z; p.prevY=p.y;
      if (!p.move) continue;
      if (p.move.axis === 'x') {
        p.x += p.move.speed*p.dir*dt;
        if (p.x<p.move.min || p.x>p.move.max) {p.dir*=-1; p.x=clamp(p.x,p.move.min,p.move.max);}
      } else if (p.move.axis === 'z') {
        p.z += p.move.speed*p.dir*dt;
        if (p.z<p.move.min || p.z>p.move.max) {p.dir*=-1; p.z=clamp(p.z,p.move.min,p.move.max);}
      } else if (p.move.axis === 'y') {
        p.y += p.move.speed*p.dir*dt;
        if (p.y<p.move.min || p.y>p.move.max) {p.dir*=-1; p.y=clamp(p.y,p.move.min,p.move.max);}
      }
    }
  }

  function updatePlayer(dt) {
    const forward = (keys['KeyW'] || keys['ArrowUp'] || touch.forward ? 1 : 0) - (keys['KeyS'] || keys['ArrowDown'] || touch.back ? 1 : 0);
    const side = (keys['KeyD'] || keys['ArrowRight'] || touch.right ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft'] || touch.left ? 1 : 0);
    const boost = player.speedTimer > 0 ? 1.45 : 1;
    player.vx = side * player.speed * boost;
    player.vz = forward * player.speed * boost;
    player.x += player.vx * dt;
    player.z += player.vz * dt;
    if (side !== 0) player.dir = Math.sign(side);

    const flying = player.flyTimer > 0 && (keys['Space'] || keys['KeyF'] || touch.fly || keys['ArrowUp']);
    if (flying) {
      player.vy += 650 * dt;
      player.flyTimer = Math.max(0, player.flyTimer - dt*1.15);
      addParticles(player.x, player.y+10, player.z, currentSkin().gem, 2);
    }

    const gravity = player.flyTimer > 0 ? 510 : 980;
    player.vy -= gravity * dt;
    player.y += player.vy * dt;
    player.onGround = false;

    for (const p of game.platforms) {
      const top = p.y+p.h;
      const withinX = player.x > p.x-p.w/2+22 && player.x < p.x+p.w/2-22;
      const withinZ = player.z > p.z-p.d/2+22 && player.z < p.z+p.d/2-22;
      const wasAbove = player.y - player.vy*dt >= top;
      if (withinX && withinZ && player.y <= top && wasAbove && player.vy <= 0) {
        player.y = top;
        player.vy = 0;
        player.onGround = true;
        touch.fly = false;
        if (p.move) {
          player.x += p.x-p.prevX; player.z += p.z-p.prevZ; player.y += p.y-p.prevY;
        }
      }
    }

    if (player.y < -300) loseLife('You fell into the clouds!');
    if (player.x < -540) player.x = -540;
    if (player.x > 540) player.x = 540;
    if (player.z < -260) player.z = -260;
    if (player.z > currentLevel().length + 360) player.z = currentLevel().length + 360;

    player.shootTimer = Math.max(0, player.shootTimer-dt);
    player.invuln = Math.max(0, player.invuln-dt);
    player.energyTimer = Math.max(0, player.energyTimer-dt);
    player.speedTimer = Math.max(0, player.speedTimer-dt);
    if (!flying && player.flyTimer > 0) player.flyTimer = Math.max(0, player.flyTimer-dt*.28);

    const compactView = getW() <= 760 || getH() <= 520;
    const cameraBack = compactView ? 430 : 560;
    const cameraLift = compactView ? 170 : 220;
    camera.x += (player.x-camera.x)*Math.min(1,dt*5);
    camera.z += (player.z-cameraBack-camera.z)*Math.min(1,dt*5);
    camera.y += (player.y+cameraLift-camera.y)*Math.min(1,dt*3);
    game.zone = clamp(Math.floor(player.z/900)+1,1,10);
  }

  function collectItems() {
    const near = (a,r) => Math.hypot(player.x-a.x, player.z-a.z) < r && Math.abs(player.y-a.y) < 105;
    for (const r of game.relics) if (!r.taken && near(r,58)) {
      r.taken = true; state.score += 350; addParticles(r.x,r.y,r.z,currentWorld().accent,28);
      game.speech = `Relic ${relicCount()}/${currentLevel().relicTarget} recovered.`; game.speechTimer = 2; sfx('relic'); postScore('live');
    }
    for (const c of game.coins) if (!c.taken && near(c,44)) {
      c.taken = true; state.score += 60; state.bankCoins++; state.runCoins++; addParticles(c.x,c.y,c.z,'#ffd66f',14); sfx('coin'); postScore('live');
    }
    for (const p of game.powers) if (!p.taken && near(p,52)) {
      p.taken = true; state.score += 120;
      if (p.type === 'shield') { player.shield = 1; game.speech = 'Shield active. It blocks one hit.'; }
      if (p.type === 'energy') { player.energyTimer = 9; game.speech = 'Energy blast upgraded.'; }
      if (p.type === 'heart') { state.lives = Math.min(5,state.lives+1); game.speech = 'Extra life restored.'; }
      if (p.type === 'speed') { player.speedTimer = 8; game.speech = 'Speed boost active.'; }
      if (p.type === 'fly') { player.flyTimer = 9; game.speech = 'Fly power active. Hold Jump/Fly in the air.'; }
      game.speechTimer = 2.5; addParticles(p.x,p.y,p.z,currentSkin().gem,24); sfx('power'); postScore('live');
    }
  }

  function relicCount() { return game.relics.filter(r=>r.taken).length; }
  function enemiesAlive() { return game.enemies.filter(e=>!e.dead).length; }
  function bossesAlive() { return game.bosses.filter(b=>b.alive).length; }

  function loseLife(message) {
    if (player.invuln > 0 || state.gameOver || state.completed || game.levelComplete) return;
    if (player.shield > 0) {
      player.shield = 0; player.invuln = .9; game.speech = 'Shield blocked the hit.'; game.speechTimer = 1.6; sfx('power'); syncUI(); return;
    }
    state.lives--; state.score = Math.max(0,state.score-120);
    player.invuln=1.4; player.x=0; player.z=Math.max(-90,player.z-420); player.y=140; player.vy=0;
    game.shake = 12; game.flash = .28; game.speech = message; game.speechTimer = 2.2; sfx('hit');
    if (state.lives <= 0) triggerGameOver(false);
    syncUI(); postScore('live');
  }

  function enemyFire(e, speed=420, predictive=false) {
    let tx=player.x, ty=player.y+45, tz=player.z;
    if (predictive) {
      tx += player.vx*.35; tz += player.vz*.35;
    }
    const dx=tx-e.x, dy=ty-(e.y+30), dz=tz-e.z;
    const len=Math.max(1,Math.hypot(dx,dy,dz));
    game.enemyShots.push({x:e.x,y:e.y+42,z:e.z,vx:dx/len*speed,vy:dy/len*speed,vz:dz/len*speed,life:2.25,color:currentWorld().accent,w:24});
    sfx('enemy');
  }

  function updateEnemyAI(dt) {
    const lv=currentLevel();
    for (const e of game.enemies) {
      if (e.dead) continue;
      const distance = Math.hypot(player.x-e.x, player.z-e.z);
      e.state = distance < e.alert ? 'engage' : 'patrol';
      e.angle += dt;

      if (e.type === 'hunter' && e.state === 'engage') {
        const dx=player.x-e.x, dz=player.z-e.z, len=Math.max(1,Math.hypot(dx,dz));
        e.x += dx/len * e.speed * dt;
        e.z += dz/len * e.speed * dt;
      } else if (e.type === 'drone') {
        e.x = e.baseX + Math.sin(e.angle*.9+e.id)*e.range;
        e.z = e.baseZ + Math.cos(e.angle*.6+e.id)*e.range*.45;
        e.y += Math.sin(e.angle*2.1)*18*dt;
      } else if (e.type === 'turret') {
        e.x = e.baseX + Math.sin(e.angle*.35+e.id)*40;
      } else {
        e.x = e.baseX + Math.sin(e.angle*.8+e.id)*e.range;
      }

      e.shootTimer -= dt;
      if (e.shootTimer <= 0 && distance < e.alert+160) {
        e.shootTimer = e.shootCooldown;
        enemyFire(e, e.type==='drone'?470:e.type==='hunter'?430:380, lv.enemyTier >= 3);
      }
      if (distance < 58 && Math.abs(player.y-e.y) < 105) loseLife('Guardian collision!');
    }

    for (const b of game.bosses) {
      if (!b.alive) continue;
      b.angle += dt;
      b.x = Math.sin(b.angle*.75)*b.range;
      b.z = currentLevel().length - 160 + Math.cos(b.angle*.55)*120;
      b.shootTimer -= dt;
      if (b.shootTimer <= 0) {
        b.shootTimer = b.shootCooldown;
        enemyFire(b, 490 + currentLevel().enemyTier*20, true);
        if (currentLevel().enemyTier >= 4) {
          game.enemyShots.push({x:b.x-70,y:b.y+42,z:b.z,vx:-90,vy:20,vz:-360,life:1.8,color:'#ff8ac8',w:24});
          game.enemyShots.push({x:b.x+70,y:b.y+42,z:b.z,vx:90,vy:20,vz:-360,life:1.8,color:'#ff8ac8',w:24});
        }
      }
      if (Math.hypot(player.x-b.x, player.z-b.z) < 92 && Math.abs(player.y-b.y) < 130) loseLife(`${b.name} slammed you!`);
    }
  }

  function updateShots(dt) {
    for (const s of game.shots) {
      s.x += s.vx*dt; s.y += s.vy*dt; s.z += s.vz*dt; s.life -= dt;
      for (const e of game.enemies) {
        if (!e.dead && Math.hypot(s.x-e.x,s.z-e.z)<70 && Math.abs(s.y-e.y)<125) {
          e.hp -= s.power; s.life = 0; addParticles(e.x,e.y+40,e.z,'#ff8ac8',20); game.shake = 5;
          if (e.hp <= 0) { e.dead=true; state.score += e.type==='drone'?240:e.type==='hunter'?220:180; sfx('hit'); }
          break;
        }
      }
      for (const b of game.bosses) {
        if (b.alive && Math.hypot(s.x-b.x,s.z-b.z)<108 && Math.abs(s.y-b.y)<155) {
          b.hp -= s.power; s.life = 0; state.score += 90; addParticles(b.x,b.y+50,b.z,'#ff8ac8',24); game.shake = 7;
          if (b.hp <= 0) { b.alive=false; state.score += 1500; game.speech = `${b.name} defeated. Enter the portal!`; game.speechTimer = 4; sfx('win'); }
          else sfx('hit');
        }
      }
    }
    game.shots = game.shots.filter(s=>s.life>0);

    for (const s of game.enemyShots) {
      s.x += s.vx*dt; s.y += s.vy*dt; s.z += s.vz*dt; s.life -= dt;
      if (Math.hypot(s.x-player.x,s.z-player.z)<52 && Math.abs(s.y-(player.y+45))<70) {
        s.life=0; loseLife('Energy bolt hit!');
      }
    }
    game.enemyShots = game.enemyShots.filter(s=>s.life>0);
  }

  function updateEffects(dt) {
    game.shake = Math.max(0, game.shake - dt*30);
    game.flash = Math.max(0, game.flash - dt);
    for (const p of game.particles) {
      p.life -= dt; p.x += p.vx*dt; p.y += p.vy*dt; p.z += p.vz*dt; p.vy -= 120*dt;
    }
    game.particles = game.particles.filter(p=>p.life>0);
    for (const r of game.rings) {
      r.life -= dt; r.radius += r.speed*dt;
    }
    game.rings = game.rings.filter(r=>r.life>0);
  }

  function addParticles(x,y,z,color,n=16) {
    for (let i=0;i<n;i++) {
      const a=Math.random()*Math.PI*2, sp=40+Math.random()*150;
      game.particles.push({x,y,z,vx:Math.cos(a)*sp,vz:Math.sin(a)*sp,vy:40+Math.random()*120,color,size:4+Math.random()*7,life:.75,ttl:.75});
    }
  }

  function checkLevelComplete() {
    const lv=currentLevel();
    const allRelics = relicCount() >= lv.relicTarget;
    const bossDone = bossesAlive() === 0;
    const atPortal = player.z > lv.length + 120;
    if (allRelics && bossDone && atPortal && !game.levelComplete) completeLevel();
  }

  function completeLevel() {
    game.levelComplete = true;
    stopMusic();
    const stars = state.lives >= 3 ? 3 : state.lives === 2 ? 2 : 1;
    const bonus = 900 + stars*280 + relicCount()*100 + enemiesAlive()*0;
    state.score += bonus;
    state.best = Math.max(state.best,state.score);
    state.unlockedLevel = Math.max(state.unlockedLevel, currentLevel().id + 1);
    ui.completeTitle.textContent = currentLevel().id === LEVELS.length ? 'Relic Master Rises!' : `${currentLevel().title} Complete`;
    ui.completeSummary.textContent = currentLevel().id === LEVELS.length
      ? 'You mastered all worlds and claimed the Sky Temple.'
      : `World ${currentWorld().id} path cleared. The next gate is open.`;
    ui.rewardText.textContent = `Bonus +${bonus} • Bank Coins ${state.bankCoins}`;
    ui.starRow.textContent = '★ '.repeat(stars).trim();
    ui.completeOverlay.classList.add('active');
    sfx('win'); saveState(); syncUI();
    postScore(currentLevel().id === LEVELS.length ? 'game_won' : 'level_complete');
  }

  function nextLevel() {
    ui.completeOverlay.classList.remove('active');
    if (state.levelIndex >= LEVELS.length-1) {
      state.completed = true;
      triggerGameOver(true);
      return;
    }
    state.levelIndex++;
    state.lives = Math.max(3,state.lives);
    buildLevel();
    showCutsceneForLevel();
    startMusic();
    saveState();
  }

  function triggerGameOver(win=false) {
    state.gameOver = !win;
    state.completed = win;
    stopMusic(); saveState();
    ui.gameOverTitle.textContent = win ? 'Sky Temple Complete' : 'Quest Failed';
    ui.gameOverSummary.textContent = win
      ? `Final score: ${Math.floor(state.score)}. You became the Relic Master.`
      : `Final score: ${Math.floor(state.score)}. Try again and master the sky worlds.`;
    ui.gameOverOverlay.classList.add('active');
    postScore(win ? 'game_won' : 'game_over');
  }

  function resetRun() {
    state.levelIndex = 0; state.score = 0; state.lives = 3; state.runCoins = 0;
    state.started = true; state.gameOver = false; state.completed = false; state.paused = false;
    ui.gameOverOverlay.classList.remove('active');
    buildLevel(); showCutsceneForLevel(); saveState();
  }

  function update(dt) {
    if (!state.started || state.paused || state.completed || state.gameOver || game.levelComplete) return;
    if (game.speechTimer > 0) {
      game.speechTimer -= dt;
      if (game.speechTimer <= 0) game.speech = '';
    }
    updatePlatforms(dt);
    updatePlayer(dt);
    collectItems();
    updateEnemyAI(dt);
    updateShots(dt);
    updateEffects(dt);
    checkLevelComplete();
    syncUI();
  }

  function drawSky() {
    const w=getW(), h=getH(), world=currentWorld();
    const bgSrc = ASSETS.backgrounds[world.id];
    const bgImg = assetImages[bgSrc];
    if (hasAsset(bgSrc)) {
      drawCoverImage(bgImg, 0, 0, w, h, -camera.x * 0.015, -camera.z * 0.006);
      const wash = ctx.createLinearGradient(0,0,0,h);
      wash.addColorStop(0, 'rgba(7,10,28,.14)');
      wash.addColorStop(.55, 'rgba(20,28,80,.06)');
      wash.addColorStop(1, 'rgba(255,255,255,.12)');
      ctx.fillStyle = wash;
      ctx.fillRect(0,0,w,h);
    } else {
      const g=ctx.createLinearGradient(0,0,0,h);
      g.addColorStop(0, world.skyTop); g.addColorStop(.55, world.skyMid); g.addColorStop(1, world.skyBottom);
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    }

    const sunX = w*(.8 + Math.sin(performance.now()*0.0001)*.05), sunY=h*.16;
    const sun=ctx.createRadialGradient(sunX,sunY,10,sunX,sunY,220);
    sun.addColorStop(0,'rgba(255,245,190,.95)'); sun.addColorStop(.45,'rgba(255,214,111,.25)'); sun.addColorStop(1,'rgba(255,214,111,0)');
    ctx.fillStyle=sun; ctx.fillRect(0,0,w,h);

    ctx.save(); ctx.globalAlpha=.52;
    for (let i=0;i<12;i++) {
      const x=((i*230-camera.z*.08)%(w+320))-150;
      const y=80+(i%5)*50+Math.sin(i*2.1+performance.now()*0.0004)*8;
      drawCloud(x,y,1+(i%3)*.14);
    }
    ctx.restore();

    // atmospheric depth/fog
    const fog=ctx.createLinearGradient(0,h*.4,0,h);
    fog.addColorStop(0,'rgba(255,255,255,0)');
    fog.addColorStop(1,'rgba(255,255,255,.18)');
    ctx.fillStyle=fog; ctx.fillRect(0,0,w,h);
  }

  function drawCloud(x,y,s) {
    ctx.fillStyle='rgba(255,255,255,.23)';
    ctx.beginPath();
    ctx.ellipse(x,y,58*s,22*s,0,0,Math.PI*2);
    ctx.ellipse(x+42*s,y-8*s,62*s,28*s,0,0,Math.PI*2);
    ctx.ellipse(x+92*s,y+2*s,54*s,22*s,0,0,Math.PI*2);
    ctx.fill();
  }

  function poly(points, fill, stroke='rgba(255,255,255,.16)', width=1) {
    ctx.beginPath(); ctx.moveTo(points[0].x,points[0].y);
    for (let i=1;i<points.length;i++) ctx.lineTo(points[i].x,points[i].y);
    ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); ctx.strokeStyle=stroke; ctx.lineWidth=width; ctx.stroke();
  }

  function drawTexturedPlatformTop(points, fallbackColor) {
    const texSrc = ASSETS.textures[currentWorld().id];
    const tex = assetImages[texSrc];
    if (!hasAsset(texSrc)) {
      poly(points, fallbackColor, 'rgba(255,255,255,.28)', 2);
      return;
    }

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i=1;i<points.length;i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.clip();

    const pattern = ctx.createPattern(tex, 'repeat');
    ctx.fillStyle = pattern || fallbackColor;
    ctx.fillRect(minX, minY, maxX-minX, maxY-minY);

    const overlay = ctx.createLinearGradient(0,minY,0,maxY);
    overlay.addColorStop(0, 'rgba(255,255,255,.18)');
    overlay.addColorStop(1, 'rgba(0,0,0,.16)');
    ctx.fillStyle = overlay;
    ctx.fillRect(minX, minY, maxX-minX, maxY-minY);
    ctx.restore();

    ctx.strokeStyle = 'rgba(255,255,255,.30)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i=1;i<points.length;i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.stroke();
  }

  function drawPlatform(p) {
    const top=p.y+p.h;
    const topPts=[
      project(p.x-p.w/2,top,p.z-p.d/2), project(p.x+p.w/2,top,p.z-p.d/2),
      project(p.x+p.w/2,top,p.z+p.d/2), project(p.x-p.w/2,top,p.z+p.d/2)
    ];
    const sideA=[topPts[2],topPts[1],project(p.x+p.w/2,p.y,p.z-p.d/2),project(p.x+p.w/2,p.y,p.z+p.d/2)];
    const sideB=[topPts[3],topPts[2],project(p.x+p.w/2,p.y,p.z+p.d/2),project(p.x-p.w/2,p.y,p.z+p.d/2)];
    poly(sideB,shade(p.color,-28),'rgba(255,255,255,.10)',1);
    poly(sideA,shade(p.color,-42),'rgba(255,255,255,.10)',1);
    drawTexturedPlatformTop(topPts, p.color);
    const c=project(p.x,top+2,p.z);
    ctx.save(); ctx.globalAlpha=.25; ctx.strokeStyle='#fff7ca'; ctx.lineWidth=Math.max(1,c.s*2);
    ctx.beginPath(); ctx.ellipse(c.x,c.y,Math.max(8,p.w*c.s*.13),Math.max(4,p.d*c.s*.06),0,0,Math.PI*2); ctx.stroke(); ctx.restore();
  }

  function roundRect(x,y,w,h,r) {
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
  }

  function drawBillboard(obj,size,color,type='orb') {
    const src = type === 'relic' ? ASSETS.items.relic
      : type === 'coin' ? ASSETS.items.coin
      : type === 'power' ? ASSETS.items[obj.type]
      : null;
    if (src && drawAssetCentered(src, obj, type === 'power' ? 64 : type === 'relic' ? 74 : 52)) return;

    const p=project(obj.x,obj.y + Math.sin(performance.now()*.003 + obj.id)*8,obj.z);
    const s=Math.max(3,size*p.s);
    ctx.save(); ctx.translate(p.x,p.y);
    if (type==='relic') {
      const grad=ctx.createRadialGradient(0,0,2,0,0,s*2);
      grad.addColorStop(0,'#fff'); grad.addColorStop(.3,color); grad.addColorStop(1,'rgba(169,139,255,0)');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(0,0,s*2,0,Math.PI*2); ctx.fill();
      ctx.rotate(performance.now()*.002);
      ctx.fillStyle=color; ctx.beginPath(); ctx.moveTo(0,-s*.9); ctx.lineTo(s*.6,0); ctx.lineTo(0,s*.9); ctx.lineTo(-s*.6,0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.86)'; ctx.lineWidth=2; ctx.stroke();
    } else if (type==='coin') {
      ctx.fillStyle='#ffd66f'; ctx.beginPath(); ctx.ellipse(0,0,s*.65,s,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#fff2b0'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='#7b4d13'; ctx.font=`900 ${Math.max(9,s)}px system-ui`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('C',0,1);
    } else if (type==='power') {
      ctx.shadowColor=color; ctx.shadowBlur=18;
      ctx.fillStyle=color; ctx.beginPath(); ctx.arc(0,0,s,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke(); ctx.shadowBlur=0;
      ctx.fillStyle='#102'; ctx.font=`900 ${Math.max(10,s*.85)}px system-ui`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(obj.type==='shield'?'S':obj.type==='heart'?'+':obj.type==='speed'?'>':obj.type==='fly'?'F':'E',0,1);
    }
    ctx.restore();
  }

  function drawCharacter(obj,skin,scale=1,label='',enemy=false) {
    if (!enemy) {
      const playerSrc = ASSETS.players[state.skin] || ASSETS.players.sky;
      if (drawAssetBillboard(playerSrc, obj, 135 * scale, 185 * scale, label)) return;
    }

    const p=project(obj.x,obj.y,obj.z), h=Math.max(12,88*p.s*scale), w=Math.max(8,42*p.s*scale);
    ctx.save(); ctx.translate(p.x,p.y);
    ctx.fillStyle='rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(0,3,w*.9,w*.28,0,0,Math.PI*2); ctx.fill();
    ctx.shadowColor=skin.gem || skin.body; ctx.shadowBlur=enemy?10:18;
    ctx.fillStyle=skin.dark; roundRect(-w/2,-h,w,h*.74,10*p.s); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.lineWidth=Math.max(1,2*p.s); ctx.stroke();
    ctx.fillStyle=skin.body; roundRect(-w*.38,-h*.82,w*.76,h*.42,12*p.s); ctx.fill();
    ctx.fillStyle=skin.gem || '#fff'; ctx.beginPath(); ctx.arc(0,-h*.58,w*.18,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=enemy?'#1a1022':'#ffe1b4'; ctx.beginPath(); ctx.arc(0,-h*.94,w*.42,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=enemy?'#fff':'#17223c'; ctx.beginPath(); ctx.arc(-w*.14,-h*.98,w*.06,0,Math.PI*2); ctx.arc(w*.14,-h*.98,w*.06,0,Math.PI*2); ctx.fill();
    if (!enemy && player.flyTimer>0) {
      ctx.strokeStyle=skin.gem; ctx.globalAlpha=.75; ctx.lineWidth=Math.max(2,4*p.s);
      ctx.beginPath(); ctx.moveTo(-w*.48,-h*.48); ctx.quadraticCurveTo(-w*1.5,-h*.95,-w*1.1,-h*.15); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w*.48,-h*.48); ctx.quadraticCurveTo(w*1.5,-h*.95,w*1.1,-h*.15); ctx.stroke();
      ctx.globalAlpha=1;
    }
    if (label) {
      ctx.shadowBlur=0; ctx.fillStyle='#fff'; ctx.font=`900 ${Math.max(10,14*p.s)}px system-ui`; ctx.textAlign='center'; ctx.fillText(label,0,-h-18*p.s);
    }
    ctx.restore();
  }

  function drawEnemy(e) {
    const enemySrc = ASSETS.enemies[e.type] || ASSETS.enemies.hunter;
    const label = e.state === 'engage' ? '!' : '';
    const size = e.type === 'drone' ? [145,105] : e.type === 'turret' ? [135,120] : [120,165];
    if (drawAssetBillboard(enemySrc, e, size[0], size[1], label)) return;

    const skin = e.type==='drone'
      ? {body:'#ff8ac8',dark:'#642a55',gem:currentWorld().accent}
      : e.type==='hunter'
      ? {body:'#ff6f7f',dark:'#7a2638',gem:'#ffd66f'}
      : {body:'#b9bed5',dark:'#34384f',gem:'#ff8ac8'};
    if (e.type==='drone') {
      const p=project(e.x,e.y,e.z), s=Math.max(8,36*p.s);
      ctx.save(); ctx.translate(p.x,p.y); ctx.shadowColor=skin.body; ctx.shadowBlur=16;
      ctx.fillStyle=skin.dark; ctx.beginPath(); ctx.ellipse(0,0,s*1.45,s*.68,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=skin.body; ctx.beginPath(); ctx.arc(0,0,s*.45,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
    } else {
      drawCharacter(e,skin,.88,label,true);
    }
  }

  function drawBoss(b) {
    if (!b.alive) return;
    const bossSrc = ASSETS.bosses[b.name] || ASSETS.bosses['Relic Master'];
    const drewAsset = drawAssetBillboard(bossSrc, b, 230, 285, b.name);
    if (!drewAsset) {
      drawCharacter(b,{body:'#ff8ac8',dark:'#642a55',gem:currentWorld().accent},1.55,b.name,true);
    }

    const p=project(b.x,b.y+120,b.z), w=Math.max(60,170*p.s);
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,.45)';
    roundRect(p.x-w/2,p.y-26,w,12,6);
    ctx.fill();
    ctx.fillStyle='#ff6f7f';
    roundRect(p.x-w/2,p.y-26,w*(b.hp/b.maxHp),12,6);
    ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.35)';
    ctx.stroke();
    ctx.restore();
  }

  function drawShot(s,enemy=false) {
    const p=project(s.x,s.y,s.z), r=Math.max(3,12*p.s);
    ctx.save(); ctx.shadowColor=enemy?s.color:s.color; ctx.shadowBlur=16; ctx.fillStyle=enemy?s.color:s.color;
    ctx.beginPath(); ctx.ellipse(p.x,p.y,r*1.7,r,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  }

  function drawPortal() {
    if (relicCount() < currentLevel().relicTarget || bossesAlive()>0) return;
    const portalObj = {x:0, y:game.platforms[game.platforms.length-1].y+game.platforms[game.platforms.length-1].h+130, z:currentLevel().length+210};
    if (drawAssetBillboard(ASSETS.effects.portal, portalObj, 190, 220, 'PORTAL')) return;

    const p=project(0, game.platforms[game.platforms.length-1].y+game.platforms[game.platforms.length-1].h+130, currentLevel().length+210);
    const r=Math.max(36,92*p.s);
    ctx.save(); ctx.translate(p.x,p.y); ctx.shadowColor=currentWorld().accent; ctx.shadowBlur=34;
    ctx.strokeStyle=currentWorld().accent; ctx.lineWidth=Math.max(4,9*p.s);
    ctx.beginPath(); ctx.ellipse(0,0,r*.7,r,0,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='#ffd66f'; ctx.lineWidth=Math.max(2,4*p.s); ctx.rotate(performance.now()*.001);
    ctx.beginPath(); ctx.ellipse(0,0,r*.42,r*.68,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
  }

  function drawParticles() {
    for (const part of game.particles) {
      const p=project(part.x,part.y,part.z), a=part.life/part.ttl;
      ctx.save(); ctx.globalAlpha=a; ctx.fillStyle=part.color; ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(1,part.size*p.s*a),0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  function draw() {
    drawSky();
    const drawables=[];
    for (const p of game.platforms) drawables.push({z:p.z,fn:()=>drawPlatform(p)});
    for (const c of game.coins) if(!c.taken) drawables.push({z:c.z,fn:()=>drawBillboard(c,c.size,'#ffd66f','coin')});
    for (const r of game.relics) if(!r.taken) drawables.push({z:r.z,fn:()=>drawBillboard(r,r.size,currentWorld().accent,'relic')});
    for (const p of game.powers) if(!p.taken) {
      const col=p.type==='heart'?'#ff6f7f':p.type==='shield'?'#75efb0':p.type==='speed'?'#ffd66f':p.type==='fly'?'#a98bff':'#66e7ff';
      drawables.push({z:p.z,fn:()=>drawBillboard(p,p.size,col,'power')});
    }
    for (const e of game.enemies) if(!e.dead) drawables.push({z:e.z,fn:()=>drawEnemy(e)});
    for (const b of game.bosses) if(b.alive) drawables.push({z:b.z,fn:()=>drawBoss(b)});
    for (const s of game.shots) drawables.push({z:s.z,fn:()=>drawShot(s,false)});
    for (const s of game.enemyShots) drawables.push({z:s.z,fn:()=>drawShot(s,true)});
    drawables.push({z:player.z,fn:()=>drawCharacter(player,currentSkin(),1,player.shield?'SHIELD':'',false)});
    // Draw far objects first and nearby objects last so the player stays visibly above the platform.
    drawables.sort((a,b)=>b.z-a.z);
    for (const d of drawables) d.fn();
    drawPortal(); drawParticles(); drawMiniHud();
    if (game.flash>0) { ctx.fillStyle=`rgba(255,255,255,${game.flash*.7})`; ctx.fillRect(0,0,getW(),getH()); }
  }

  function drawMiniHud() {
    const w=getW();
    ctx.save(); ctx.fillStyle='rgba(8,12,28,.44)'; roundRect(16,16,w-32,50,15); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.stroke();
    ctx.fillStyle='#fff8de'; ctx.font='900 18px system-ui'; ctx.textAlign='left';
    ctx.fillText(`${currentWorld().name}: ${currentLevel().title}`,30,47);
    ctx.textAlign='right'; ctx.fillStyle='#ffd66f'; ctx.fillText(`Best ${Math.floor(Math.max(state.best,state.score))}`,w-30,47);
    ctx.restore();
  }

  function syncUI() {
    ui.scoreValue.textContent = Math.floor(state.score);
    ui.coinsValue.textContent = state.bankCoins;
    ui.relicValue.textContent = `${relicCount()}/${currentLevel().relicTarget}`;
    ui.livesValue.textContent = state.lives;
    ui.worldValue.textContent = currentLevel().world;
    ui.levelValue.textContent = currentLevel().id;
    ui.progressBar.style.width = `${Math.min(100,relicCount()/currentLevel().relicTarget*100)}%`;
    let power='Power: None';
    if (player.shield>0) power='Power: Shield';
    if (player.energyTimer>0) power=`Power: Energy ${Math.ceil(player.energyTimer)}s`;
    if (player.speedTimer>0) power=`Power: Speed ${Math.ceil(player.speedTimer)}s`;
    if (player.flyTimer>0) power=`Power: Fly ${Math.ceil(player.flyTimer)}s`;
    ui.powerText.textContent = power;
    const bossText = bossesAlive()>0 ? ` Defeat ${game.bosses[0]?.name || 'the boss'}.` : '';
    ui.missionText.textContent = relicCount() >= currentLevel().relicTarget
      ? `Relics gathered.${bossText || ' Enter the glowing portal.'}`
      : `Collect all relics, use powers, and survive smarter enemies.`;
    ui.storyText.textContent = game.speech || currentWorld().story;
    ui.muteBtn.textContent = state.muted ? 'Sound Off' : 'Sound On';
    ui.pauseBtn.textContent = state.paused ? 'Resume' : 'Pause';
  }

  function renderMap() {
    ui.mapGrid.innerHTML='';
    for (const lv of LEVELS) {
      const btn=document.createElement('button');
      const world=WORLDS.find(w=>w.id===lv.world);
      const unlocked=lv.id <= state.unlockedLevel;
      btn.className='map-node '+(unlocked?'unlocked':'locked');
      btn.disabled=!unlocked;
      btn.innerHTML=`<strong>${lv.id}. ${lv.title}</strong><small>${world.name}<br>${lv.boss?`Boss: ${lv.boss}`:'Relic route'} • ${lv.relicTarget} relics</small>`;
      btn.addEventListener('click',()=>{state.levelIndex=lv.id-1; ui.mapOverlay.classList.remove('active'); state.paused=false; buildLevel(); showCutsceneForLevel(); saveState();});
      ui.mapGrid.appendChild(btn);
    }
  }

  function openMap() { state.paused=true; stopMusic(); renderMap(); ui.mapOverlay.classList.add('active'); }
  function closeMap() { ui.mapOverlay.classList.remove('active'); state.paused=false; startMusic(); }

  function renderShop() {
    ui.shopGrid.innerHTML='';
    ui.shopCoinsText.textContent=`Coins: ${state.bankCoins}`;
    for (const skin of SKINS) {
      const owned=state.unlockedSkins.includes(skin.id), equipped=state.skin===skin.id;
      const btn=document.createElement('button');
      btn.className='shop-card-item '+(owned?'unlocked':'locked')+(equipped?' equipped':'');
      btn.innerHTML=`<span class="shop-swatch" style="background:${skin.body}"></span><strong>${skin.name}</strong><small>${owned?(equipped?'Equipped':'Owned - tap to equip'):`Cost ${skin.cost} coins`}<br>Gem: ${skin.gem}</small>`;
      btn.addEventListener('click',()=>{
        if (owned) { state.skin=skin.id; sfx('buy'); }
        else if (state.bankCoins >= skin.cost) { state.bankCoins -= skin.cost; state.unlockedSkins.push(skin.id); state.skin=skin.id; sfx('buy'); }
        else { game.speech='Not enough coins for this skin.'; game.speechTimer=2; sfx('hit'); }
        saveState(); renderShop(); syncUI();
      });
      ui.shopGrid.appendChild(btn);
    }
  }

  function openShop() { state.paused=true; stopMusic(); renderShop(); ui.shopOverlay.classList.add('active'); }
  function closeShop() { ui.shopOverlay.classList.remove('active'); state.paused=false; if(state.started && !game.levelComplete && !state.gameOver) startMusic(); }

  function bindButtonHold(id,prop) {
    const el=document.getElementById(id);
    const on=e=>{e.preventDefault(); touch[prop]=true; if(prop==='fly') jumpOrFly();};
    const off=e=>{e.preventDefault(); touch[prop]=false;};
    el.addEventListener('pointerdown',on); el.addEventListener('pointerup',off); el.addEventListener('pointerleave',off); el.addEventListener('pointercancel',off);
  }

  function bindEvents() {
    document.getElementById('playBtn').addEventListener('click',startGame);
    document.getElementById('howBtn').addEventListener('click',()=>ui.helpOverlay.classList.add('active'));
    document.getElementById('closeHelpBtn').addEventListener('click',()=>ui.helpOverlay.classList.remove('active'));
    document.getElementById('continueCutsceneBtn').addEventListener('click',continueCutscene);
    document.getElementById('submitScoreBtn').addEventListener('click',()=>postScore('manual_submit'));
    document.getElementById('shopBtn').addEventListener('click',openShop);
    document.getElementById('openShopStartBtn').addEventListener('click',openShop);
    document.getElementById('shopAfterBtn').addEventListener('click',openShop);
    document.getElementById('closeShopBtn').addEventListener('click',closeShop);
    document.getElementById('mapBtn').addEventListener('click',openMap);
    document.getElementById('mapAfterBtn').addEventListener('click',openMap);
    document.getElementById('closeMapBtn').addEventListener('click',closeMap);
    document.getElementById('nextLevelBtn').addEventListener('click',nextLevel);
    document.getElementById('retryBtn').addEventListener('click',()=>{ui.gameOverOverlay.classList.remove('active'); state.gameOver=false; state.completed=false; state.lives=3; buildLevel(); showCutsceneForLevel();});
    document.getElementById('resetRunBtn').addEventListener('click',resetRun);
    ui.muteBtn.addEventListener('click',()=>{state.muted=!state.muted; if(state.muted)stopMusic(); else startMusic(); saveState(); syncUI();});
    ui.pauseBtn.addEventListener('click',()=>{state.paused=!state.paused; if(state.paused)stopMusic(); else startMusic(); syncUI();});

    bindButtonHold('leftBtn','left'); bindButtonHold('rightBtn','right'); bindButtonHold('forwardBtn','forward'); bindButtonHold('backBtn','back');
    document.getElementById('jumpBtn').addEventListener('pointerdown',e=>{e.preventDefault(); touch.fly=true; jumpOrFly();});
    document.getElementById('jumpBtn').addEventListener('pointerup',e=>{e.preventDefault(); touch.fly=false;});
    document.getElementById('jumpBtn').addEventListener('pointercancel',e=>{e.preventDefault(); touch.fly=false;});
    document.getElementById('shootBtn').addEventListener('click',shoot);

    window.addEventListener('keydown',e=>{
      keys[e.code]=true;
      if (e.code==='Space' || e.code==='KeyF') { e.preventDefault(); touch.fly=true; jumpOrFly(); }
      if (e.code==='KeyJ' || e.code==='ControlLeft' || e.code==='ControlRight') shoot();
      if (e.code==='KeyM') openMap();
      if (e.code==='KeyP') openShop();
    });
    window.addEventListener('keyup',e=>{keys[e.code]=false; if(e.code==='Space'||e.code==='KeyF') touch.fly=false;});
    window.addEventListener('resize',resizeCanvas);
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 120));
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => resizeCanvas());
      ro.observe(document.body);
      const shell = canvas.closest('.canvas-shell');
      if (shell) ro.observe(shell);
    }
    window.addEventListener('message',ev=>{
      const data=ev.data||{}, type=data.type||data.event;
      if(type==='GG_PAUSE'){state.paused=!!(data.payload?.paused??data.paused); if(state.paused)stopMusic(); else startMusic(); syncUI();}
      if(type==='GG_RESTART') resetRun();
      if(type==='GG_MUTE'){state.muted=!!(data.payload?.muted??data.muted); if(state.muted)stopMusic(); else startMusic(); syncUI();}
    });
  }

  function loop(now) {
    const dt=Math.min(.05,Math.max(.001,(now-last)/1000)); last=now;
    update(dt); draw(); requestAnimationFrame(loop);
  }

  bindEvents();
  resizeCanvas();
  buildLevel();
  renderShop();
  renderMap();
  syncUI();
  loadAssets().then(() => {
    resizeCanvas();
    requestAnimationFrame(loop);
  });
})();