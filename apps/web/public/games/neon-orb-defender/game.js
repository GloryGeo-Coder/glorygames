(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const $ = (id) => document.getElementById(id);

  const ui = {
    missionText: $("missionText"),
    score: $("scoreValue"),
    level: $("levelValue"),
    health: $("healthValue"),
    orb: $("orbValue"),
    weapon: $("weaponValue"),
    kills: $("killsValue"),
    missionFill: $("missionFill"),
    missionProgressText: $("missionProgressText"),
    shieldFill: $("shieldFill"),
    shieldText: $("shieldText"),
    empFill: $("empFill"),
    empText: $("empText"),
    overlay: $("overlay"),
    overlayTitle: $("overlayTitle"),
    overlayText: $("overlayText"),
    startBtn: $("startBtn"),
    howBtn: $("howBtn"),
    pauseBtn: $("pauseBtn"),
    muteBtn: $("muteBtn"),
    restartBtn: $("restartBtn"),
    leftBtn: $("leftBtn"),
    rightBtn: $("rightBtn"),
    jumpBtn: $("jumpBtn"),
    shootBtn: $("shootBtn"),
    dashBtn: $("dashBtn"),
    empBtn: $("empBtn"),
  };

  const GAME_SLUG = "neon-orb-base-defence";
  const BEST_KEY = "wga_neon_orb_base_defence_best_v1";

  const ASSETS = {
    backgrounds: [
      "./assets/backgrounds/level-01-perimeter.png",
      "./assets/backgrounds/level-02-hangar.png",
      "./assets/backgrounds/level-03-power-core.png",
      "./assets/backgrounds/level-04-command-tower.png",
      "./assets/backgrounds/level-05-robotics-lab.png",
      "./assets/backgrounds/level-06-weapons-vault.png",
      "./assets/backgrounds/level-07-missile-platform.png",
      "./assets/backgrounds/level-08-central-command.png",
      "./assets/backgrounds/level-09-omega-core.png",
    ],
    sprites: {
      playerIdle: "./assets/sprites/player/player-idle.png",
      playerRun: "./assets/sprites/player/player-run.png",
      playerJump: "./assets/sprites/player/player-jump.png",
      drone: "./assets/sprites/enemies/enemy-drone.png",
      scout: "./assets/sprites/enemies/enemy-scout-robot.png",
      shieldBot: "./assets/sprites/enemies/enemy-shield-bot.png",
      turret: "./assets/sprites/enemies/enemy-turret.png",
      repairDrone: "./assets/sprites/enemies/enemy-repair-drone.png",
      heavyMech: "./assets/sprites/enemies/enemy-heavy-mech.png",
      laserDrone: "./assets/sprites/enemies/enemy-laser-drone.png",
      boss: "./assets/sprites/enemies/boss-omega-core.png",
      friendly: "./assets/sprites/npcs/friendly-ai-bot.png",
    },
    items: {
      energy: "./assets/items/energy-cell.png",
      health: "./assets/items/health-pack.png",
      shield: "./assets/items/shield-battery.png",
      weapon: "./assets/items/weapon-crate.png",
      emp: "./assets/items/emp-core.png",
      key: "./assets/items/keycard.png",
      chip: "./assets/items/ai-chip.png",
      repair: "./assets/items/repair-kit.png",
    },
  };

  const LEVELS = [
    {
      name: "Base Perimeter Breach",
      mission: "Stop the first drone attack outside Fort Nova.",
      objective: "Defeat 14 rogue units and collect 5 energy cells.",
      bg: 0,
      targetKills: 14,
      targetCollect: { kind: "energy", count: 5 },
      enemies: ["drone", "scout"],
      spawnRate: 1.15,
      duration: 55,
      orb: false,
      unlockWeapon: "Blaster",
    },
    {
      name: "Training Hangar Lockdown",
      mission: "Clear the hangar and restore the weapon station.",
      objective: "Defeat 18 enemies and collect a weapon crate.",
      bg: 1,
      targetKills: 18,
      targetCollect: { kind: "weapon", count: 1 },
      enemies: ["drone", "scout", "shieldBot", "turret"],
      spawnRate: 1.0,
      duration: 60,
      orb: false,
      unlockWeapon: "Laser",
    },
    {
      name: "Power Core Defence",
      mission: "Protect the Neon Orb generator from enemy waves.",
      objective: "Survive 45 seconds while the Neon Orb stays online.",
      bg: 2,
      targetTime: 45,
      enemies: ["drone", "scout", "shieldBot", "repairDrone"],
      spawnRate: 0.9,
      duration: 60,
      orb: true,
      unlockWeapon: "Laser",
    },
    {
      name: "Drone Command Tower",
      mission: "Disable drone control signals in the tower sector.",
      objective: "Defeat 20 drones and collect 2 EMP cores.",
      bg: 3,
      targetKills: 20,
      targetCollect: { kind: "emp", count: 2 },
      enemies: ["drone", "laserDrone", "turret"],
      spawnRate: 0.85,
      duration: 65,
      orb: false,
      unlockWeapon: "Plasma",
    },
    {
      name: "AI Robotics Lab",
      mission: "Rescue friendly AI bots before they are reprogrammed.",
      objective: "Rescue 5 friendly AI units.",
      bg: 4,
      targetRescue: 5,
      enemies: ["scout", "shieldBot", "repairDrone", "heavyMech"],
      spawnRate: 0.9,
      duration: 65,
      orb: false,
      unlockWeapon: "Plasma",
    },
    {
      name: "Underground Weapons Vault",
      mission: "Recover advanced weapons from the locked vault.",
      objective: "Collect 3 keycards and 2 weapon crates.",
      bg: 5,
      targetCollect: { kind: "key", count: 3 },
      targetCollect2: { kind: "weapon", count: 2 },
      enemies: ["shieldBot", "turret", "heavyMech", "drone"],
      spawnRate: 0.78,
      duration: 70,
      orb: false,
      unlockWeapon: "Spread",
    },
    {
      name: "Missile Defence Platform",
      mission: "Stop the rogue AI from launching defence missiles.",
      objective: "Disable 5 control chips before the timer ends.",
      bg: 6,
      targetCollect: { kind: "chip", count: 5 },
      enemies: ["drone", "laserDrone", "turret", "heavyMech"],
      spawnRate: 0.72,
      duration: 75,
      orb: false,
      timed: true,
      unlockWeapon: "Pulse",
    },
    {
      name: "Central Command",
      mission: "Open the final AI core chamber.",
      objective: "Defeat 28 elite enemies and collect final armour supplies.",
      bg: 7,
      targetKills: 28,
      targetCollect: { kind: "shield", count: 2 },
      enemies: ["drone", "shieldBot", "repairDrone", "heavyMech", "turret", "laserDrone"],
      spawnRate: 0.65,
      duration: 75,
      orb: false,
      unlockWeapon: "Pulse",
    },
    {
      name: "Final Boss: Rogue AI Core",
      mission: "Defeat OMEGA-9 and restore Fort Nova.",
      objective: "Break the AI shields and destroy the exposed command core.",
      bg: 8,
      boss: true,
      enemies: ["drone", "shieldBot", "laserDrone"],
      spawnRate: 0.85,
      duration: 999,
      orb: true,
      unlockWeapon: "Pulse",
    },
  ];

  const LEVEL_MUSIC = [
    {
      name: "Perimeter Pulse",
      bpm: 124,
      bass: [55, 55, 82, 73],
      lead: [330, 392, 494, 392, 330, 247, 294, 330],
      arp: [660, 0, 784, 0, 988, 0, 784, 0],
      wave: "square"
    },
    {
      name: "Hangar Bassline",
      bpm: 128,
      bass: [49, 61, 73, 61],
      lead: [294, 370, 440, 554, 440, 370, 294, 247],
      arp: [587, 740, 880, 0, 740, 587, 0, 440],
      wave: "sawtooth"
    },
    {
      name: "Power Core Flow",
      bpm: 120,
      bass: [65, 65, 98, 87],
      lead: [392, 494, 587, 494, 392, 330, 392, 494],
      arp: [784, 988, 1175, 988, 0, 784, 659, 0],
      wave: "triangle"
    },
    {
      name: "Drone Tower Signal",
      bpm: 132,
      bass: [58, 58, 87, 104],
      lead: [349, 466, 523, 622, 523, 466, 392, 349],
      arp: [698, 932, 1046, 1244, 0, 1046, 932, 0],
      wave: "square"
    },
    {
      name: "Robotics Lab Groove",
      bpm: 126,
      bass: [52, 78, 52, 104],
      lead: [330, 415, 494, 554, 494, 415, 330, 277],
      arp: [659, 831, 988, 0, 1108, 988, 831, 0],
      wave: "triangle"
    },
    {
      name: "Vault Breakbeat",
      bpm: 134,
      bass: [46, 69, 92, 69],
      lead: [277, 349, 415, 554, 415, 349, 277, 233],
      arp: [554, 698, 831, 1108, 0, 831, 698, 0],
      wave: "sawtooth"
    },
    {
      name: "Missile Platform Rush",
      bpm: 140,
      bass: [62, 62, 93, 124],
      lead: [370, 494, 587, 740, 587, 494, 370, 311],
      arp: [740, 988, 1175, 1480, 1175, 988, 740, 0],
      wave: "square"
    },
    {
      name: "Central Command Drive",
      bpm: 130,
      bass: [55, 82, 110, 82],
      lead: [440, 554, 659, 554, 494, 392, 330, 392],
      arp: [880, 1108, 1318, 0, 1108, 880, 659, 0],
      wave: "triangle"
    },
    {
      name: "OMEGA-9 Overdrive",
      bpm: 144,
      bass: [41, 55, 62, 82],
      lead: [220, 277, 330, 415, 554, 415, 330, 277],
      arp: [440, 554, 659, 831, 1108, 831, 659, 0],
      wave: "sawtooth"
    },
  ];

  const state = {
    started: false,
    paused: false,
    muted: false,
    won: false,
    levelIndex: 0,
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY) || 0),
    time: 0,
    levelTime: 0,
    spawnClock: 0,
    itemClock: 0,
    rescueClock: 0,
    bossClock: 0,
    keys: {},
    touch: { left: false, right: false, jump: false, shoot: false, dash: false },
    player: {
      x: 140, y: 0, w: 64, h: 96,
      vx: 0, vy: 0,
      health: 100, maxHealth: 100,
      onGround: false, jumps: 0,
      fireCd: 0, dashCd: 0, dashT: 0,
      shield: 0, empCd: 0,
      weapon: "Blaster",
      facing: 1,
      invuln: 0,
      anim: 0,
    },
    orb: { health: 100, maxHealth: 100 },
    mission: { kills: 0, rescued: 0, collected: {}, complete: false },
    bullets: [],
    enemyBullets: [],
    enemies: [],
    items: [],
    npcs: [],
    particles: [],
    floaters: [],
    boss: null,
  };

  let W = 1280, H = 720, DPR = 1;
  let last = performance.now();
  let AC = null, master = null, musicTimer = null, musicStep = 0;
  const images = {};

  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const rand = (a,b) => a + Math.random() * (b-a);
  const choose = (arr) => arr[Math.floor(Math.random()*arr.length)];
  const groundY = () => H * 0.82;

  function level(){ return LEVELS[state.levelIndex] || LEVELS[0]; }

  function resize(){
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    state.player.y = Math.min(state.player.y || groundY()-state.player.h, groundY()-state.player.h);
  }

  function loadImage(src){
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function loadAssets(){
    const paths = [
      ...ASSETS.backgrounds,
      ...Object.values(ASSETS.sprites),
      ...Object.values(ASSETS.items),
    ];
    const loaded = await Promise.all(paths.map(loadImage));
    paths.forEach((p,i)=>{ images[p]=loaded[i]; });
  }

  function img(src){ return images[src] || null; }

  function showOverlay(title, text, button="Continue"){
    ui.overlayTitle.textContent = title;
    ui.overlayText.textContent = text;
    ui.startBtn.textContent = button;
    ui.overlay.classList.add("active");
  }

  function hideOverlay(){ ui.overlay.classList.remove("active"); }

  function resetMission(){
    state.mission = { kills: 0, rescued: 0, collected: {}, complete: false };
    state.enemies.length = 0;
    state.bullets.length = 0;
    state.enemyBullets.length = 0;
    state.items.length = 0;
    state.npcs.length = 0;
    state.floaters.length = 0;
    state.levelTime = 0;
    state.spawnClock = 0.6;
    state.itemClock = 2.5;
    state.rescueClock = 5.0;
    state.bossClock = 3;
    musicStep = 0;
    state.boss = null;
    state.player.x = Math.min(150, W * 0.18);
    state.player.y = groundY() - state.player.h;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.onGround = true;
    state.player.jumps = 0;
    state.player.invuln = 1.4;
    state.orb.health = state.orb.maxHealth;
    if (level().boss) spawnBoss();
    updateHUD();
  }

  function newGame(){
    state.started = true;
    state.paused = false;
    state.won = false;
    state.levelIndex = 0;
    state.score = 0;
    state.player.health = state.player.maxHealth;
    state.player.weapon = "Blaster";
    state.player.shield = 0;
    state.player.empCd = 0;
    musicStep = 0;
    resetMission();
    hideOverlay();
    ensureAudio();
    startMusic();
    sfx("start");
  }

  function continueGame(){
    state.paused = false;
    hideOverlay();
    ensureAudio();
    startMusic();
    last = performance.now();
  }

  function gameOver(message){
    state.started = false;
    state.paused = true;
    stopMusic();
    state.best = Math.max(state.best, Math.floor(state.score));
    localStorage.setItem(BEST_KEY, String(state.best));
    sfx("gameover");
    postScore("game_over");
    showOverlay("Mission Failed", `${message}\n\nScore: ${Math.floor(state.score)}\nBest: ${state.best}`, "Restart");
  }

  function victory(){
    state.started = false;
    state.paused = true;
    state.won = true;
    state.score += 1500;
    state.best = Math.max(state.best, Math.floor(state.score));
    localStorage.setItem(BEST_KEY, String(state.best));
    stopMusic();
    sfx("level");
    postScore("game_won");
    showOverlay("Fort Nova Restored!", `OMEGA-9 has been defeated. The Neon Orb is stable and friendly AI units are back online.\n\nFinal Score: ${Math.floor(state.score)}`, "Play Again");
  }

  function nextLevel(){
    const old = level();
    state.score += 600 + state.player.health * 3 + Math.max(0, Math.floor(state.orb.health))*2;
    const unlock = old.unlockWeapon;
    if (unlock) state.player.weapon = unlock;
    state.levelIndex++;
    if (state.levelIndex >= LEVELS.length) {
      victory();
      return;
    }
    resetMission();
    state.player.health = Math.min(state.player.maxHealth, state.player.health + 25);
    sfx("level");
    stopMusic();
    musicStep = 0;
    state.paused = true;
    showOverlay(level().name, `${level().mission}\n\nObjective: ${level().objective}\n\nWeapon available: ${state.player.weapon}`, "Start Level");
  }

  function ensureAudio(){
    if (state.muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC){
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = 0.12;
      master.connect(AC.destination);
    }
    if (AC.state === "suspended") AC.resume().catch(()=>{});
    return AC;
  }

  function tone(freq, dur=.08, type="triangle", gain=.04, delay=0){
    const ac = ensureAudio();
    if (!ac || state.muted) return;
    const t = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(gain,t+.014);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    osc.connect(g); g.connect(master);
    osc.start(t); osc.stop(t+dur+.05);
  }

  function noise(dur=.12, gain=.05){
    const ac = ensureAudio();
    if (!ac || state.muted) return;
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate*dur), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length);
    const src=ac.createBufferSource(); src.buffer=buffer;
    const g=ac.createGain(); g.gain.value=gain;
    src.connect(g); g.connect(master); src.start(); src.stop(ac.currentTime+dur);
  }

  function sfx(kind){
    if(kind==="start"){ tone(220,.08); tone(330,.08,"triangle",.035,.05); tone(550,.12,"sine",.025,.11); }
    if(kind==="shoot"){ tone(720,.045,"square",.018); }
    if(kind==="shootUp"){ tone(940,.045,"square",.018); tone(1320,.035,"triangle",.010,.018); }
    if(kind==="hit"){ noise(.10,.045); tone(150,.12,"sawtooth",.035); }
    if(kind==="pickup"){ tone(880,.06,"triangle",.035); tone(1320,.06,"sine",.02,.035); }
    if(kind==="shield"){ tone(620,.06,"sine",.020); tone(930,.05,"triangle",.012,.035); }
    if(kind==="jump"){ tone(430,.06,"sine",.035); tone(720,.06,"triangle",.02,.035); }
    if(kind==="dash"){ tone(260,.05,"sawtooth",.035); tone(520,.1,"triangle",.025,.04); }
    if(kind==="emp"){ tone(110,.18,"sawtooth",.055); tone(440,.12,"sine",.03,.05); }
    if(kind==="level"){ tone(330,.08); tone(440,.1,"triangle",.035,.06); tone(660,.16,"sine",.025,.14); }
    if(kind==="gameover"){ tone(220,.12,"sawtooth",.045); tone(140,.2,"sine",.03,.1); }
  }

  function musicProfile(){
    return LEVEL_MUSIC[state.levelIndex % LEVEL_MUSIC.length] || LEVEL_MUSIC[0];
  }

  function kickDrum(){
    tone(52, .055, "sine", .030);
    tone(36, .080, "sine", .018, .025);
  }

  function technoHat(){
    noise(.030, .010);
  }

  function musicTick(){
    if(!state.started || state.paused || state.muted) return;

    const profile = musicProfile();
    const step = musicStep++;
    const beat = step % 16;
    const bass = profile.bass[Math.floor(beat / 4) % profile.bass.length];
    const lead = profile.lead[beat % profile.lead.length];
    const arp = profile.arp[beat % profile.arp.length];

    // Kick + sub pulse
    if(beat % 4 === 0) kickDrum();

    // Hi-hat / glitch rhythm
    if(beat % 2 === 1 || beat === 6 || beat === 14) technoHat();

    // Bassline
    if(beat % 2 === 0) {
      tone(bass, .135, "sawtooth", .010);
      tone(bass * 2, .055, "triangle", .004, .035);
    }

    // Level-specific lead pattern
    if(lead) {
      tone(lead, .075, profile.wave || "square", .007, .020);
      if(beat % 4 === 2) tone(lead * 1.5, .040, "triangle", .004, .050);
    }

    // Sparkly arpeggio
    if(arp) tone(arp, .050, "triangle", .005, .060);

    // Boss / late-level extra intensity
    if(state.levelIndex >= 6 && beat % 4 === 3) {
      tone((profile.bass[0] || 55) * 4, .040, "square", .004, .070);
    }
  }

  function startMusic(){
    if(musicTimer || state.muted) return;
    const profile = musicProfile();
    const delay = Math.round(60000 / profile.bpm / 2);
    musicTimer = setInterval(musicTick, delay);
  }

  function stopMusic(){ if(musicTimer) clearInterval(musicTimer); musicTimer=null; }

  function postScore(mode="live"){
    const payload = {
      type: "GG_SCORE",
      gameSlug: GAME_SLUG,
      slug: GAME_SLUG,
      score: Math.floor(state.score),
      best: state.best,
      level: state.levelIndex + 1,
      mode
    };
    try{ window.GG?.setSlug?.(GAME_SLUG); }catch{}
    try{ window.GG?.setScore?.(payload.score,{gameSlug:GAME_SLUG}); }catch{}
    if(mode !== "live"){
      try{ window.GG?.submitScore?.(payload.score,{gameSlug:GAME_SLUG}); }catch{}
      try{ window.GG?.endRound?.(payload); }catch{}
    }
    try{ window.parent?.postMessage?.(payload,"*"); }catch{}
    try{ window.parent?.postMessage?.({...payload,type:"gg:score"},"*"); }catch{}
  }

  function controlDown(key){ state.keys[key]=true; }
  function controlUp(key){ state.keys[key]=false; }

  window.addEventListener("keydown", e=>{
    const k=e.key.toLowerCase();
    if(["arrowleft","a"].includes(k)) controlDown("left");
    if(["arrowright","d"].includes(k)) controlDown("right");
    if(["arrowup","w"," "].includes(k)){ e.preventDefault(); controlDown("up"); jump(); }
    if(k==="shift") dash();
    if(k==="e") emp();
    if(k==="p") togglePause();
    if(k==="f") shoot();
    if(k==="q" || k==="r") shoot(true);
  });
  window.addEventListener("keyup", e=>{
    const k=e.key.toLowerCase();
    if(["arrowleft","a"].includes(k)) controlUp("left");
    if(["arrowright","d"].includes(k)) controlUp("right");
    if(["arrowup","w"," "].includes(k)) controlUp("up");
  });

  function bindHold(btn, on, off){
    if(!btn) return;
    btn.addEventListener("pointerdown", e=>{ e.preventDefault(); on(); ensureAudio(); }, {passive:false});
    btn.addEventListener("pointerup", e=>{ e.preventDefault(); off?.(); }, {passive:false});
    btn.addEventListener("pointercancel", ()=>off?.());
    btn.addEventListener("pointerleave", ()=>off?.());
  }

  bindHold(ui.leftBtn, ()=>controlDown("left"), ()=>controlUp("left"));
  bindHold(ui.rightBtn, ()=>controlDown("right"), ()=>controlUp("right"));
  bindHold(ui.jumpBtn, ()=>{ controlDown("up"); jump(); }, ()=>controlUp("up"));
  bindHold(ui.shootBtn, ()=>controlDown("shoot"), ()=>controlUp("shoot"));
  bindHold(ui.dashBtn, ()=>dash(), ()=>{});
  bindHold(ui.empBtn, ()=>emp(), ()=>{});

  ui.startBtn.addEventListener("click", ()=>{
    ensureAudio();
    if(!state.started || state.won) newGame();
    else continueGame();
  });
  ui.howBtn.addEventListener("click", ()=>{
    showOverlay("How to Play", "Move with A/D or arrow keys. Jump with W, Up or Space. Shoot forward with F or the Shoot button. Hold W/Up/Jump while shooting to fire upward. You can also press Q or R for an instant upward shot. Dash with Shift. Use EMP with E to freeze drones and robots.\n\nCollect energy cells, health packs, shields, weapons, keycards, AI chips and repair kits. Each level has a different mission.", "Continue");
    if(state.started) state.paused = true;
  });
  ui.pauseBtn.addEventListener("click", togglePause);
  ui.restartBtn.addEventListener("click", newGame);
  ui.muteBtn.addEventListener("click", ()=>{
    state.muted=!state.muted;
    ui.muteBtn.textContent = state.muted ? "Muted" : "Sound";
    if(state.muted) stopMusic(); else if(state.started && !state.paused) startMusic();
  });
  window.addEventListener("resize", resize);

  function togglePause(){
    if(!state.started) return;
    state.paused = !state.paused;
    if(state.paused){ stopMusic(); showOverlay("Paused", "Fort Nova is waiting. Continue when ready.", "Continue"); }
    else { hideOverlay(); startMusic(); last=performance.now(); }
  }

  function jump(){
    if(!state.started || state.paused) return;
    const p = state.player;
    if(p.onGround || p.jumps < 2){
      p.vy = -720;
      p.onGround = false;
      p.jumps++;
      sfx("jump");
    }
  }

  function dash(){
    if(!state.started || state.paused) return;
    const p=state.player;
    if(p.dashCd<=0){
      p.dashT=.22;
      p.dashCd=1.25;
      p.vx += 680*p.facing;
      p.invuln = Math.max(p.invuln,.25);
      sfx("dash");
    }
  }

  function shoot(forceUp=false){
    if(!state.started || state.paused) return;
    const p=state.player;
    if(p.fireCd>0) return;

    const aimUp = forceUp || !!state.keys.up;
    const base = aimUp
      ? {x:p.x+p.w*0.55, y:p.y+p.h*0.18}
      : {x:p.x+p.w*0.72, y:p.y+p.h*0.42};

    const weapon = p.weapon;
    const speed = weapon==="Pulse" ? 850 : weapon==="Laser" ? 1050 : weapon==="Plasma" ? 760 : 880;
    const damage = weapon==="Plasma" ? 26 : weapon==="Pulse" ? 22 : weapon==="Laser" ? 16 : weapon==="Spread" ? 14 : 12;
    const color = weapon==="Plasma" ? "#ff4dbd" : weapon==="Pulse" ? "#74ffc1" : weapon==="Spread" ? "#ffd76d" : "#45dcff";
    const radius = weapon==="Plasma" ? 8 : weapon==="Pulse" ? 7 : 5;

    const pushBullet = (vx, vy, extraLife=1.2, extraRadius=radius) => {
      state.bullets.push({
        x: base.x,
        y: base.y,
        vx,
        vy,
        damage,
        life: extraLife,
        color,
        r: extraRadius,
        type: "player",
        upShot: aimUp
      });
    };

    if(weapon==="Spread"){
      if(aimUp){
        [-0.22, 0, 0.22].forEach(a => {
          pushBullet(Math.sin(a) * speed, -Math.cos(a) * speed, 1.15, 5);
        });
      }else{
        [-0.18, 0, 0.18].forEach(a => pushBullet(speed, a * speed, 1.1, 5));
      }
      p.fireCd=.24;
    }else{
      if(aimUp) pushBullet(0, -speed, 1.15, radius);
      else pushBullet(speed, 0, 1.2, radius);
      p.fireCd = weapon==="Laser" ? .13 : weapon==="Pulse" ? .20 : .18;
    }

    addParticles(base.x, base.y, aimUp ? "rgba(116,255,193,.75)" : "rgba(69,220,255,.75)", 5, 120);
    sfx(aimUp ? "shootUp" : "shoot");
  }

  function emp(){
    if(!state.started || state.paused) return;
    const p=state.player;
    if(p.empCd>0) return;
    p.empCd=8.0;
    sfx("emp");
    addFloater(W*.5,H*.45,"EMP BLAST","#74ffc1",30);
    addParticles(W*.5,H*.45,"rgba(116,255,193,.95)",70,420);
    state.enemies.forEach(e=>e.stun=2.2);
    if(state.boss) state.boss.stun=1.0;
  }

  function addFloater(x,y,text,color="#fff",size=18){
    state.floaters.push({x,y,text,color,size,age:0,life:1.0,vy:-45});
  }

  function addParticles(x,y,color,count=18,speed=240){
    for(let i=0;i<count;i++){
      const a=Math.random()*Math.PI*2, s=rand(speed*.25,speed);
      state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:rand(2,5),color,age:0,life:rand(.35,.9)});
    }
  }

  function spawnEnemy(){
    const lv=level();
    if(lv.boss && state.boss && state.boss.health>0 && state.enemies.length>7) return;
    const type=choose(lv.enemies);
    const ground = groundY();
    const defs = {
      drone: {w:62,h:62,hp:28,speed:rand(70,115),fly:true,shoot:.9,img:ASSETS.sprites.drone,score:80},
      scout: {w:62,h:84,hp:38,speed:rand(55,90),fly:false,shoot:1.5,img:ASSETS.sprites.scout,score:90},
      shieldBot: {w:74,h:88,hp:75,speed:rand(35,65),fly:false,shoot:1.7,img:ASSETS.sprites.shieldBot,score:150,shield:true},
      turret: {w:82,h:72,hp:55,speed:0,fly:false,shoot:.55,img:ASSETS.sprites.turret,score:130,static:true},
      repairDrone: {w:60,h:60,hp:38,speed:rand(48,80),fly:true,shoot:2.3,img:ASSETS.sprites.repairDrone,score:140,repair:true},
      heavyMech: {w:90,h:110,hp:120,speed:rand(25,45),fly:false,shoot:1.25,img:ASSETS.sprites.heavyMech,score:220},
      laserDrone: {w:70,h:70,hp:52,speed:rand(60,90),fly:true,shoot:.75,img:ASSETS.sprites.laserDrone,score:170,laser:true},
    };
    const d=defs[type] || defs.drone;
    const e={...d,type,x:W+80,y:0,fire:rand(.4,1.6),age:0,hit:false,stun:0};
    e.y = d.fly ? rand(H*.24,H*.58) : ground - e.h;
    if(d.static) e.x = W + rand(120,240);
    state.enemies.push(e);
  }

  function spawnItem(kind){
    const ground=groundY();
    const item = {kind, x:W+60, y:rand(H*.34, ground-90), w:44, h:44, vy:0, age:0, img:ASSETS.items[kind]};
    if(kind==="repair" || kind==="health" || kind==="weapon" || kind==="key" || kind==="chip") item.y = ground - rand(80,160);
    state.items.push(item);
  }

  function spawnNpc(){
    state.npcs.push({
      x: W + 80,
      y: groundY()-78,
      w:58,h:78,
      rescued:false,
      img:ASSETS.sprites.friendly,
      age:0
    });
  }

  function spawnBoss(){
    state.boss = {
      x: W-260, y: H*.26, w:190, h:180,
      health: 900, maxHealth: 900,
      phase: 1, fire: 1.2, pulse: 0, stun: 0,
      img: ASSETS.sprites.boss
    };
  }

  function collectItem(it){
    const lv=level();
    state.mission.collected[it.kind]=(state.mission.collected[it.kind]||0)+1;
    state.score += 90;
    if(it.kind==="health") state.player.health = Math.min(state.player.maxHealth, state.player.health+30);
    if(it.kind==="shield") state.player.shield = Math.min(8, state.player.shield+5.5);
    if(it.kind==="weapon"){
      const order=["Blaster","Laser","Plasma","Spread","Pulse"];
      const next=order[Math.min(order.indexOf(state.player.weapon)+1, order.length-1)];
      state.player.weapon=next;
      addFloater(it.x,it.y,`${next} UNLOCKED`,"#ffd76d",20);
    }
    if(it.kind==="emp") state.player.empCd = Math.max(0, state.player.empCd-4);
    if(it.kind==="repair") state.orb.health = Math.min(state.orb.maxHealth, state.orb.health+28);
    addFloater(it.x,it.y, it.kind.toUpperCase(), "#ffd76d", 18);
    addParticles(it.x,it.y,"rgba(255,215,109,.95)",16,220);
    sfx("pickup");
    checkMission();
  }

  function damagePlayer(amount, x, y){
    const p=state.player;
    if(p.invuln>0) return;
    if(p.shield>0){
      p.shield=Math.max(0,p.shield-amount*.07);
      addFloater(x,y,"SHIELD","#9ffcff",16);
      addParticles(x,y,"rgba(150,240,255,.9)",15,230);
      sfx("shield");
      return;
    }
    p.health -= amount;
    p.invuln=.65;
    addFloater(x,y,`-${amount}`,"#ff5b7c",18);
    addParticles(x,y,"rgba(255,91,124,.9)",24,260);
    sfx("hit");
    if(p.health<=0) gameOver("Your defender armour failed.");
  }

  function damageOrb(amount, x, y){
    if(!level().orb) return;
    state.orb.health -= amount;
    addFloater(x,y,"ORB HIT","#ff5b7c",18);
    if(state.orb.health<=0) gameOver("The Neon Orb was destabilised.");
  }

  function enemyDefeated(e){
    state.mission.kills++;
    state.score += e.score || 100;
    addFloater(e.x,e.y,`+${e.score||100}`,"#74ffc1",18);
    addParticles(e.x,e.y,"rgba(116,255,193,.95)",24,260);
    if(Math.random()<.45) spawnItem(choose(["energy","health","shield","emp"]));
    if(Math.random()<.15) spawnItem("weapon");
    checkMission();
  }

  function bossDefeated(){
    state.score += 2000;
    addFloater(state.boss.x,state.boss.y,"OMEGA-9 DOWN","#ffd76d",28);
    addParticles(state.boss.x,state.boss.y,"rgba(255,215,109,.95)",80,430);
    state.boss = null;
    victory();
  }

  function checkMission(){
    const lv=level();
    let done=true;
    if(lv.targetKills) done = done && state.mission.kills >= lv.targetKills;
    if(lv.targetRescue) done = done && state.mission.rescued >= lv.targetRescue;
    if(lv.targetTime) done = done && state.levelTime >= lv.targetTime;
    if(lv.targetCollect) done = done && (state.mission.collected[lv.targetCollect.kind]||0) >= lv.targetCollect.count;
    if(lv.targetCollect2) done = done && (state.mission.collected[lv.targetCollect2.kind]||0) >= lv.targetCollect2.count;
    if(lv.timed && state.levelTime > lv.duration && !done) gameOver("The missile timer expired.");
    if(done && !lv.boss && !state.mission.complete){
      state.mission.complete=true;
      addFloater(W*.5,H*.32,"MISSION COMPLETE","#ffd76d",28);
      sfx("level");
      setTimeout(()=>{ if(state.started && !state.paused) nextLevel(); }, 950);
    }
  }

  function missionRatio(){
    const lv=level();
    if(lv.boss && state.boss) return 1 - state.boss.health / state.boss.maxHealth;
    let parts=[];
    if(lv.targetKills) parts.push(state.mission.kills/lv.targetKills);
    if(lv.targetRescue) parts.push(state.mission.rescued/lv.targetRescue);
    if(lv.targetTime) parts.push(state.levelTime/lv.targetTime);
    if(lv.targetCollect) parts.push((state.mission.collected[lv.targetCollect.kind]||0)/lv.targetCollect.count);
    if(lv.targetCollect2) parts.push((state.mission.collected[lv.targetCollect2.kind]||0)/lv.targetCollect2.count);
    return clamp(parts.length ? parts.reduce((a,b)=>a+clamp(b,0,1),0)/parts.length : 0,0,1);
  }

  function updateHUD(){
    const lv=level();
    ui.missionText.textContent = `${lv.name}: ${lv.objective}`;
    ui.score.textContent = Math.floor(state.score);
    ui.level.textContent = `${state.levelIndex+1}/${LEVELS.length}`;
    ui.health.textContent = Math.max(0, Math.ceil(state.player.health));
    ui.orb.textContent = level().orb ? Math.max(0, Math.ceil(state.orb.health)) : "N/A";
    ui.weapon.textContent = state.player.weapon;
    ui.kills.textContent = state.mission.kills;
    const ratio=missionRatio();
    ui.missionFill.style.width = `${Math.round(ratio*100)}%`;
    ui.missionProgressText.textContent = `${Math.round(ratio*100)}%`;
    ui.shieldFill.style.width = `${Math.round(clamp(state.player.shield/8,0,1)*100)}%`;
    ui.shieldText.textContent = state.player.shield>0 ? `${state.player.shield.toFixed(1)}s` : "OFF";
    ui.empFill.style.width = `${Math.round((1-clamp(state.player.empCd/8,0,1))*100)}%`;
    ui.empText.textContent = state.player.empCd<=0 ? "READY" : `${state.player.empCd.toFixed(1)}s`;
    if(state.score > state.best) state.best = Math.floor(state.score);
    postScore("live");
  }

  function rect(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  function update(dt){
    if(!state.started || state.paused) return;
    state.time += dt;
    state.levelTime += dt;
    const p=state.player;

    p.fireCd=Math.max(0,p.fireCd-dt);
    p.dashCd=Math.max(0,p.dashCd-dt);
    p.dashT=Math.max(0,p.dashT-dt);
    p.shield=Math.max(0,p.shield-dt);
    p.empCd=Math.max(0,p.empCd-dt);
    p.invuln=Math.max(0,p.invuln-dt);
    p.anim += dt;

    let dir = 0;
    if(state.keys.left) dir--;
    if(state.keys.right) dir++;
    p.facing = dir !== 0 ? dir : p.facing;
    const speed = p.dashT > 0 ? 650 : 290;
    p.vx = dir * speed;
    if(state.keys.shoot) shoot();

    p.vy += 1600*dt;
    p.x += p.vx*dt;
    p.y += p.vy*dt;
    const gy=groundY();
    if(p.y+p.h >= gy){
      p.y = gy-p.h;
      p.vy=0; p.onGround=true; p.jumps=0;
    }else p.onGround=false;
    p.x=clamp(p.x, 20, W*.72);

    state.spawnClock -= dt;
    if(state.spawnClock<=0 && !state.mission.complete){
      spawnEnemy();
      state.spawnClock = level().spawnRate * rand(.65,1.25);
    }
    state.itemClock -= dt;
    if(state.itemClock<=0){
      const lv=level();
      let kinds=["energy","health","shield","emp"];
      if(lv.targetCollect) kinds.push(lv.targetCollect.kind);
      if(lv.targetCollect2) kinds.push(lv.targetCollect2.kind);
      if(lv.orb) kinds.push("repair");
      spawnItem(choose(kinds));
      state.itemClock = rand(3.0,5.5);
    }
    if(level().targetRescue){
      state.rescueClock -= dt;
      if(state.rescueClock<=0){
        spawnNpc();
        state.rescueClock=rand(6,9);
      }
    }

    // bullets
    for(let i=state.bullets.length-1;i>=0;i--){
      const b=state.bullets[i]; b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
      if(b.life<=0 || b.x>W+80 || b.y<-50 || b.y>H+50) state.bullets.splice(i,1);
    }
    for(let i=state.enemyBullets.length-1;i>=0;i--){
      const b=state.enemyBullets[i]; b.x+=b.vx*dt; b.y+=b.vy*dt; b.life-=dt;
      if(b.life<=0 || b.x<-80 || b.y<-50 || b.y>H+50){ state.enemyBullets.splice(i,1); continue; }
      if(rect({x:b.x-b.r,y:b.y-b.r,w:b.r*2,h:b.r*2},p)){ damagePlayer(b.damage,b.x,b.y); state.enemyBullets.splice(i,1); }
      else if(level().orb && b.x<W*.55 && b.x>W*.43 && b.y>H*.36 && b.y<H*.66){ damageOrb(b.damage*.7,b.x,b.y); state.enemyBullets.splice(i,1); }
    }

    // enemies
    for(let i=state.enemies.length-1;i>=0;i--){
      const e=state.enemies[i];
      e.age+=dt;
      e.stun=Math.max(0,(e.stun||0)-dt);
      if(e.stun<=0){
        if(!e.static) e.x -= e.speed*dt;
        else e.x -= 18*dt;
        if(e.fly) e.y += Math.sin(e.age*2.4)*18*dt;
        e.fire -= dt;
        if(e.fire<=0){
          const targetY = level().orb && Math.random()<.35 ? H*.52 : p.y+p.h*.45;
          const dy = targetY - (e.y+e.h*.5);
          const angle = Math.atan2(dy, p.x - e.x);
          const spd = e.laser ? 360 : 260;
          state.enemyBullets.push({x:e.x+e.w*.15,y:e.y+e.h*.45,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,r:e.laser?6:5,damage:e.laser?13:10,life:2.5,color:e.laser?"#b68cff":"#ff5b7c"});
          e.fire = e.shoot + rand(.1,.9);
        }
        if(e.repair && state.enemies.length>1){
          state.enemies.forEach(o=>{ if(o!==e && Math.abs(o.x-e.x)<170 && Math.abs(o.y-e.y)<130) o.hp=Math.min((o.maxHp||o.hp+30),o.hp+8*dt); });
        }
      }

      if(e.x < -130){ 
        if(level().orb) damageOrb(8, W*.48, H*.52);
        state.enemies.splice(i,1);
        continue;
      }

      if(rect(e,p)){
        damagePlayer(e.type==="heavyMech"?22:14,e.x,e.y);
        e.hp -= 18;
      }

      for(let j=state.bullets.length-1;j>=0;j--){
        const b=state.bullets[j];
        if(rect({x:b.x-b.r,y:b.y-b.r,w:b.r*2,h:b.r*2},e)){
          const dmg = e.shield ? b.damage*.55 : b.damage;
          e.hp -= dmg;
          addParticles(b.x,b.y,b.color,6,130);
          state.bullets.splice(j,1);
          if(e.hp<=0){ enemyDefeated(e); state.enemies.splice(i,1); }
          break;
        }
      }
    }

    // boss
    if(state.boss){
      const boss=state.boss;
      boss.pulse += dt;
      boss.stun=Math.max(0,boss.stun-dt);
      boss.y += Math.sin(boss.pulse*1.5)*12*dt;
      if(boss.stun<=0){
        boss.fire -= dt;
        if(boss.fire<=0){
          const phase = boss.health/boss.maxHealth < .33 ? 3 : boss.health/boss.maxHealth < .66 ? 2 : 1;
          boss.phase=phase;
          const shots=phase===1?2:phase===2?4:6;
          for(let k=0;k<shots;k++){
            const ang = Math.atan2((p.y+p.h*.4)-(boss.y+boss.h*.5), (p.x+p.w*.4)-(boss.x)) + (k-(shots-1)/2)*0.12;
            state.enemyBullets.push({x:boss.x,y:boss.y+boss.h*.45,vx:Math.cos(ang)*300,vy:Math.sin(ang)*300,r:6,damage:14,life:3,color:"#ff5b7c"});
          }
          boss.fire = phase===1?1.3:phase===2?1.0:.7;
          if(Math.random()<.45) spawnEnemy();
        }
      }
      for(let j=state.bullets.length-1;j>=0;j--){
        const b=state.bullets[j];
        if(rect({x:b.x-b.r,y:b.y-b.r,w:b.r*2,h:b.r*2},boss)){
          boss.health -= b.damage;
          addParticles(b.x,b.y,b.color,8,170);
          state.bullets.splice(j,1);
          if(boss.health<=0){ bossDefeated(); break; }
        }
      }
    }

    // items
    for(let i=state.items.length-1;i>=0;i--){
      const it=state.items[i];
      it.x -= 115*dt;
      it.age += dt;
      it.y += Math.sin(it.age*4)*10*dt;
      if(it.x < -80){ state.items.splice(i,1); continue; }
      if(rect(it,p)){ collectItem(it); state.items.splice(i,1); }
    }

    // NPC rescue
    for(let i=state.npcs.length-1;i>=0;i--){
      const n=state.npcs[i]; n.x -= 65*dt; n.age+=dt;
      if(n.x<-80){ state.npcs.splice(i,1); continue; }
      if(rect(n,p)){
        state.mission.rescued++;
        state.score += 250;
        addFloater(n.x,n.y,"AI RESCUED","#74ffc1",20);
        addParticles(n.x,n.y,"rgba(116,255,193,.95)",24,220);
        sfx("pickup");
        state.npcs.splice(i,1);
        checkMission();
      }
    }

    // particles / floaters
    for(let i=state.particles.length-1;i>=0;i--){
      const q=state.particles[i]; q.age+=dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.vy+=120*dt;
      if(q.age>q.life) state.particles.splice(i,1);
    }
    for(let i=state.floaters.length-1;i>=0;i--){
      const f=state.floaters[i]; f.age+=dt; f.y+=f.vy*dt;
      if(f.age>f.life) state.floaters.splice(i,1);
    }

    checkMission();
    updateHUD();
  }

  function drawCover(img){
    if(!img){ ctx.fillStyle="#050916"; ctx.fillRect(0,0,W,H); return; }
    const r=Math.max(W/img.naturalWidth,H/img.naturalHeight);
    const dw=img.naturalWidth*r, dh=img.naturalHeight*r;
    ctx.drawImage(img,(W-dw)/2,(H-dh)/2,dw,dh);
  }

  function draw(){
    const lv=level();
    drawCover(img(ASSETS.backgrounds[lv.bg]));
    ctx.fillStyle="rgba(2,6,15,.18)";
    ctx.fillRect(0,0,W,H);

    // Neon floor
    const gy=groundY();
    ctx.fillStyle="rgba(4,8,18,.82)";
    ctx.fillRect(0,gy,W,H-gy);
    ctx.strokeStyle="rgba(69,220,255,.35)";
    ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke();
    for(let i=0;i<16;i++){
      const y=gy+(H-gy)*(i/16)**1.4;
      ctx.strokeStyle=`rgba(69,220,255,${0.06+i*.012})`;
      ctx.lineWidth=1+i*.08;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }

    if(lv.orb) drawOrb();
    drawNpcs();
    drawItems();
    drawEnemies();
    drawBoss();
    drawBullets();
    drawPlayer();
    drawParticles();
    drawFloaters();

    if(state.paused && state.started){
      ctx.fillStyle="rgba(0,0,0,.22)";
      ctx.fillRect(0,0,W,H);
    }
  }

  function drawImg(src,x,y,w,h,alpha=1,rot=0){
    const im=img(src);
    ctx.save(); ctx.globalAlpha=alpha; ctx.translate(x+w/2,y+h/2); ctx.rotate(rot);
    if(im) ctx.drawImage(im,-w/2,-h/2,w,h);
    else { ctx.fillStyle="#45dcff"; ctx.fillRect(-w/2,-h/2,w,h); }
    ctx.restore();
  }

  function drawOrb(){
    const x=W*.48,y=H*.52,r=58+Math.sin(state.time*2)*4;
    ctx.save();
    ctx.shadowColor="#74ffc1"; ctx.shadowBlur=35;
    const g=ctx.createRadialGradient(x,y,8,x,y,r);
    g.addColorStop(0,"rgba(255,255,255,.95)");
    g.addColorStop(.35,"rgba(116,255,193,.82)");
    g.addColorStop(1,"rgba(69,220,255,.12)");
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.65)"; ctx.lineWidth=4; ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(){
    const p=state.player;
    const src = !p.onGround ? ASSETS.sprites.playerJump : Math.abs(p.vx)>5 ? ASSETS.sprites.playerRun : ASSETS.sprites.playerIdle;
    const flicker = p.invuln>0 && Math.sin(state.time*28)>0 ? .55 : 1;
    if(p.shield>0){
      ctx.save(); ctx.strokeStyle="rgba(120,240,255,.85)"; ctx.lineWidth=4; ctx.shadowColor="#45dcff"; ctx.shadowBlur=18;
      ctx.beginPath(); ctx.arc(p.x+p.w*.5,p.y+p.h*.48,Math.max(p.w,p.h)*.72,0,Math.PI*2); ctx.stroke(); ctx.restore();
    }
    drawImg(src,p.x-28,p.y-34,p.w+56,p.h+54,flicker);
  }

  function drawEnemies(){
    state.enemies.forEach(e=>{
      drawImg(e.img,e.x,e.y,e.w,e.h,e.stun>0?.55:1,Math.sin(e.age*2)*.04);
      const pct=clamp(e.hp/(e.maxHp||120),0,1);
      ctx.fillStyle="rgba(0,0,0,.45)"; ctx.fillRect(e.x,e.y-10,e.w,5);
      ctx.fillStyle=e.stun>0?"#74ffc1":"#ff5b7c"; ctx.fillRect(e.x,e.y-10,e.w*pct,5);
    });
  }

  function drawBoss(){
    const b=state.boss;
    if(!b) return;
    drawImg(b.img,b.x,b.y,b.w,b.h,b.stun>0?.65:1,Math.sin(b.pulse)*.03);
    const barW=Math.min(620,W*.72), x=(W-barW)/2, y=H*.13;
    ctx.fillStyle="rgba(0,0,0,.55)"; ctx.fillRect(x,y,barW,14);
    ctx.fillStyle="#ff5b7c"; ctx.fillRect(x,y,barW*clamp(b.health/b.maxHealth,0,1),14);
    ctx.strokeStyle="rgba(255,255,255,.35)"; ctx.strokeRect(x,y,barW,14);
    ctx.font="900 14px system-ui"; ctx.fillStyle="#fff"; ctx.textAlign="center"; ctx.fillText("OMEGA-9 COMMAND CORE",W/2,y-8);
  }

  function drawItems(){
    state.items.forEach(it=>{
      drawImg(it.img,it.x,it.y+Math.sin(it.age*5)*6,it.w,it.h,1,Math.sin(it.age)*.12);
    });
  }

  function drawNpcs(){
    state.npcs.forEach(n=> drawImg(n.img,n.x,n.y+Math.sin(n.age*4)*4,n.w,n.h));
  }

  function drawBullets(){
    function shot(b){
      ctx.save(); ctx.shadowColor=b.color; ctx.shadowBlur=16; ctx.fillStyle=b.color;
      ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    state.bullets.forEach(shot);
    state.enemyBullets.forEach(shot);
  }

  function drawParticles(){
    state.particles.forEach(p=>{
      const a=1-p.age/p.life;
      ctx.save(); ctx.globalAlpha=a; ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); ctx.restore();
    });
  }

  function drawFloaters(){
    state.floaters.forEach(f=>{
      const a=1-f.age/f.life;
      ctx.save(); ctx.globalAlpha=a; ctx.font=`1000 ${f.size}px system-ui`; ctx.textAlign="center"; ctx.lineWidth=4;
      ctx.strokeStyle="rgba(0,0,0,.55)"; ctx.strokeText(f.text,f.x,f.y);
      ctx.fillStyle=f.color; ctx.fillText(f.text,f.x,f.y); ctx.restore();
    });
  }

  function loop(t){
    const dt=Math.min(.034,Math.max(.001,(t-last)/1000));
    last=t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  async function boot(){
    resize();
    await loadAssets();
    updateHUD();
    try{ window.GG?.setSlug?.(GAME_SLUG); }catch{}
    requestAnimationFrame(loop);
  }

  boot();
})();