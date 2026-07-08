(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const canvas = $("gameCanvas") || document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    startOverlay: $("startOverlay"),
    gameOverOverlay: $("gameOverOverlay"),
    startBtn: $("startBtn"),
    howBtn: $("howBtn"),
    help: $("controlsHelp"),
    retryBtn: $("retryBtn"),
    restartBtn: $("restartBtn"),
    scoreText: $("scoreText"),
    levelText: $("levelText"),
    healthText: $("healthText"),
    shieldText: $("shieldText"),
    missionTitle: $("missionTitle"),
    missionText: $("missionText"),
    missionMeter: $("missionMeter"),
    mentorText: $("mentorText"),
    toast: $("toast"),
    jumpBtn: $("jumpBtn"),
    shootBtn: $("shootBtn"),
    dashBtn: $("dashBtn")
  };

  const ASSETS = {
    backgrounds: [
      "assets/backgrounds/bg-blue-nebula.png",
      "assets/backgrounds/bg-lava-asteroid-field.png",
      "assets/backgrounds/bg-nebula-citadel.png",
      "assets/backgrounds/bg-orbital-station-ring.png",
      "assets/backgrounds/bg-crystal-comet-field.png",
      "assets/backgrounds/bg-asteroid-battlefield.png"
    ],
    enemy: "assets/sprites/enemy_ship_sheet.png",
    boss: "assets/sprites/boss_mothership_sheet.png",
    bosses: [
      "assets/sprites/boss_01_asteroid_warden_sheet.png",
      "assets/sprites/boss_02_belt_crusher_sheet.png",
      "assets/sprites/boss_03_rogue_captain_sheet.png",
      "assets/sprites/boss_04_crystal_sentinel_sheet.png",
      "assets/sprites/boss_05_orbital_enforcer_sheet.png",
      "assets/sprites/boss_06_frost_mothership_sheet.png",
      "assets/sprites/boss_07_gate_commander_sheet.png",
      "assets/sprites/boss_08_nova_x_commander_sheet.png"
    ],
    asteroid: "assets/sprites/asteroid_sheet.png",
    core: "assets/sprites/star_crystal.png",
    shield: "assets/sprites/shield_pickup.png",
    time: "assets/sprites/time_pickup.png",
    player: "assets/sprites/pilot_nova_sheet.png"
  };

  const LEVELS = [
    {
      name: "Crash Landing",
      zone: "Lunar Debris Field",
      mission: "Collect 12 star cores, survive the longer asteroid route, defeat the Asteroid Warden, and reach the rescue portal.",
      tip: "Pilot Nova: Pace your jumps. The first boss waits near the portal, so collect shields before the final stretch.",
      bg: 0,
      width: 5200,
      cores: 12,
      enemies: 8,
      boss: true,
      bossName: "Asteroid Warden",
      bossHp: 18,
      bossSprite: 0,
      bossColor: "#ff8a2a",
      hazard: "meteor"
    },
    {
      name: "Asteroid Platforms",
      zone: "Broken Belt",
      mission: "Cross extended moving platforms, collect 14 star cores, and defeat the Belt Crusher.",
      tip: "Moving platforms carry you. Wait for the right rhythm, then dash across the wider gaps.",
      bg: 1,
      width: 6100,
      cores: 14,
      enemies: 11,
      boss: true,
      bossName: "Belt Crusher",
      bossHp: 22,
      bossSprite: 1,
      bossColor: "#ff6b1a",
      hazard: "laser"
    },
    {
      name: "Pirate Outpost",
      zone: "Outer Relay",
      mission: "Fight through pirate patrols, collect 16 star cores, and destroy the Rogue Captain drone.",
      tip: "Shoot drones before jumping into their patrol path. Boss lasers are easier to dodge from mid-range.",
      bg: 2,
      width: 7000,
      cores: 16,
      enemies: 14,
      boss: true,
      bossName: "Rogue Captain",
      bossHp: 26,
      bossSprite: 2,
      bossColor: "#ff2fd6",
      hazard: "mine"
    },
    {
      name: "Crystal Nebula Ruins",
      zone: "Violet Cloud",
      mission: "Activate the crystal path, collect 18 cores, survive plasma traps, and defeat the Crystal Sentinel.",
      tip: "Shield dash gives a short burst and reduces incoming damage. Save it for the boss arena.",
      bg: 4,
      width: 7900,
      cores: 18,
      enemies: 16,
      boss: true,
      bossName: "Crystal Sentinel",
      bossHp: 30,
      bossSprite: 3,
      bossColor: "#a855ff",
      hazard: "plasma"
    },
    {
      name: "Space Station Wreckage",
      zone: "Orbit Ring",
      mission: "Recover 20 station cores, clear drone fire, and defeat the Orbital Enforcer.",
      tip: "Watch for floating drone fire. Jump, shoot, then keep moving through the station debris.",
      bg: 3,
      width: 8600,
      cores: 20,
      enemies: 18,
      boss: true,
      bossName: "Orbital Enforcer",
      bossHp: 34,
      bossSprite: 4,
      bossColor: "#45c7ff",
      hazard: "laser"
    },
    {
      name: "Comet Foundry",
      zone: "Ice Tail",
      mission: "Cross the long icy foundry, collect 21 cryo-cores, and defeat the Frost Mothership.",
      tip: "Ice platforms are slippery. Release movement earlier than normal and use double jump to correct mistakes.",
      bg: 4,
      width: 9200,
      cores: 21,
      enemies: 20,
      boss: true,
      bossName: "Frost Mothership",
      bossHp: 38,
      bossSprite: 5,
      bossColor: "#7ee7ff",
      hazard: "meteor"
    },
    {
      name: "NOVA-X Fortress",
      zone: "Enemy Capital",
      mission: "Break through fortress platforms, collect 23 cores, and defeat the Gate Commander.",
      tip: "The fortress has the hardest jumps. Use double jump only after your first jump reaches peak height.",
      bg: 5,
      width: 9700,
      cores: 23,
      enemies: 22,
      boss: true,
      bossName: "Gate Commander",
      bossHp: 42,
      bossSprite: 6,
      bossColor: "#ff3030",
      hazard: "mine"
    },
    {
      name: "Final Gate",
      zone: "Starfall Core",
      mission: "Collect 24 final cores, defeat the NOVA-X Commander, and escape through the portal.",
      tip: "Final mission. Keep distance, shoot the boss core, and collect shield pickups when they appear.",
      bg: 0,
      width: 10400,
      cores: 24,
      enemies: 24,
      boss: true,
      bossName: "NOVA-X Commander",
      bossHp: 50,
      bossSprite: 7,
      bossColor: "#ff2fd6",
      hazard: "plasma"
    }
  ];

  const WORLD_H = 820;
  const PLAYER = {
    x: 80,
    y: 420,
    w: 34,
    h: 58,
    vx: 0,
    vy: 0,
    dir: 1,
    onGround: false,
    jumps: 0,
    maxJumps: 2,
    shootCd: 0,
    dashCd: 0,
    invuln: 0,
    checkpointX: 80,
    checkpointY: 420
  };

  const state = {
    status: "menu",
    level: 0,
    score: 0,
    health: 100,
    shield: 0,
    lives: 3,
    cores: 0,
    enemiesDefeated: 0,
    time: 0,
    cameraX: 0,
    cameraY: 0,
    shake: 0,
    lastScorePost: 0,
    world: null,
    keys: Object.create(null),
    touch: { left: false, right: false, jump: false, shoot: false, dash: false }
  };

  const images = {};
  const CACHE_BUSTER = "sp-bosses-v1-3-2";
  const GAME_ROOT = "/games/space-pilot-platformer/";
  const audio = {
    ctx: null,
    muted: false,
    sfxGain: null,
    musicGain: null,
    music: null,
    currentMusicLevel: -1,
    ensure() {
      if (this.muted) return;
      try {
        if (!this.ctx) {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
          this.sfxGain = this.ctx.createGain();
          this.musicGain = this.ctx.createGain();
          this.sfxGain.gain.value = 0.75;
          this.musicGain.gain.value = 0.16;
          this.sfxGain.connect(this.ctx.destination);
          this.musicGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === "suspended") this.ctx.resume?.();
      } catch {
        this.muted = true;
      }
    },
    tone(freq = 440, dur = 0.08, type = "sine", gain = 0.035, dest = null) {
      if (!this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      amp.gain.setValueAtTime(gain, now);
      amp.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(amp).connect(dest || this.sfxGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    },
    beep(freq = 440, dur = 0.08, type = "sine", gain = 0.035) {
      this.tone(freq, dur, type, gain, this.sfxGain);
    },
    startMusic(levelIndex = 0) {
      if (this.muted) return;
      this.ensure();
      if (!this.ctx || this.muted) return;
      if (this.currentMusicLevel === levelIndex && this.music) return;
      this.stopMusic();

      const scale = [130.81, 146.83, 164.81, 196.00, 220.00, 246.94, 261.63, 293.66];
      const root = scale[levelIndex % scale.length];
      const now = this.ctx.currentTime;
      const padFilter = this.ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.setValueAtTime(900 + levelIndex * 85, now);
      padFilter.Q.value = 0.75;

      const padGain = this.ctx.createGain();
      padGain.gain.setValueAtTime(0.0001, now);
      padGain.gain.exponentialRampToValueAtTime(0.52, now + 1.2);
      padFilter.connect(padGain).connect(this.musicGain || this.ctx.destination);

      const delay = this.ctx.createDelay(1.2);
      const feedback = this.ctx.createGain();
      delay.delayTime.value = 0.34;
      feedback.gain.value = 0.26;
      delay.connect(feedback).connect(delay);
      delay.connect(this.musicGain || this.ctx.destination);

      const nodes = [padFilter, padGain, delay, feedback];
      const chord = [root, root * 1.5, root * 2, root * 2.5];
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = i % 2 ? "triangle" : "sawtooth";
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.value = (i - 1.5) * 4;
        g.gain.value = 0.055 / (i + 1);
        osc.connect(g).connect(padFilter);
        osc.start(now);
        nodes.push(osc, g);
      });

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.value = 0.055 + levelIndex * 0.005;
      lfoGain.gain.value = 260;
      lfo.connect(lfoGain).connect(padFilter.frequency);
      lfo.start(now);
      nodes.push(lfo, lfoGain);

      let step = 0;
      const pattern = [0, 2, 4, 7, 5, 3, 6, 4, 1, 4, 6, 9];
      const timer = setInterval(() => {
        if (!this.ctx || this.muted || !this.music) return;
        const note = root * Math.pow(2, (pattern[step % pattern.length] + (levelIndex % 3)) / 12);
        const bass = root / 2;
        this.tone(note, 0.18, "triangle", 0.014, delay);
        if (step % 4 === 0) this.tone(bass, 0.28, "sine", 0.018, this.musicGain);
        if (step % 8 === 6) this.tone(root * 3, 0.08, "sine", 0.009, delay);
        step += 1;
      }, 360);

      this.music = { nodes, timer, padGain };
      this.currentMusicLevel = levelIndex;
    },
    stopMusic() {
      if (!this.music) return;
      const m = this.music;
      if (m.timer) clearInterval(m.timer);
      try {
        if (this.ctx && m.padGain) {
          const now = this.ctx.currentTime;
          m.padGain.gain.cancelScheduledValues(now);
          m.padGain.gain.setValueAtTime(Math.max(0.0001, m.padGain.gain.value || 0.0001), now);
          m.padGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        }
        setTimeout(() => {
          for (const n of m.nodes || []) {
            try { n.stop?.(); } catch {}
            try { n.disconnect?.(); } catch {}
          }
        }, 420);
      } catch {}
      this.music = null;
      this.currentMusicLevel = -1;
    },
    jump() { this.beep(520, 0.08, "triangle", 0.025); },
    collect() { this.beep(880, 0.07, "sine", 0.03); },
    shoot() { this.beep(720, 0.05, "square", 0.018); },
    hurt() { this.beep(100, 0.14, "sawtooth", 0.04); },
    boom() { this.beep(82, 0.2, "sawtooth", 0.05); },
    boss() { this.beep(55, 0.35, "sawtooth", 0.055); },
    power() { this.beep(980, 0.1, "triangle", 0.04); }
  };

  function loadImage(key, src, options = {}) {
    const img = new Image();
    img.decoding = "async";
    img.spriteCols = options.cols || 0;
    img.spriteRows = options.rows || 0;
    img.assetKey = key;
    img.assetSrc = src;

    const absoluteOrSpecial = /^(https?:|data:|blob:|\/)/i.test(src);
    const candidates = absoluteOrSpecial
      ? [src]
      : Array.from(new Set([
          src,
          `./${src}`,
          `${GAME_ROOT}${src}`
        ]));

    let attempt = 0;
    const withVersion = (url) => {
      if (/^(data:|blob:)/i.test(url)) return url;
      const joiner = url.includes("?") ? "&" : "?";
      return `${url}${joiner}v=${CACHE_BUSTER}`;
    };
    const tryCandidate = () => {
      img.failed = false;
      img.src = withVersion(candidates[attempt]);
    };

    img.onload = () => {
      img.failed = false;
      img.loadedSrc = img.src;
    };
    img.onerror = () => {
      attempt += 1;
      if (attempt < candidates.length) {
        tryCandidate();
        return;
      }
      img.failed = true;
      console.warn(`[Space Pilot Platformer] Missing asset for ${key}:`, src, candidates);
    };

    images[key] = img;
    tryCandidate();
    return img;
  }

  ASSETS.backgrounds.forEach((src, i) => loadImage(`bg${i}`, src));
  loadImage("enemy", ASSETS.enemy);
  loadImage("boss", ASSETS.boss, { cols: 2, rows: 2 });
  ASSETS.bosses.forEach((src, i) => loadImage(`boss${i}`, src, { cols: 2, rows: 2 }));
  loadImage("asteroid", ASSETS.asteroid);
  loadImage("core", ASSETS.core);
  loadImage("shield", ASSETS.shield);
  loadImage("time", ASSETS.time);
  loadImage("player", ASSETS.player);

  const PILOT_SPRITE = { cols: 6, rows: 4, idle: 0, run: 1, jump: 2, shoot: 3 };
  const BOSS_SPRITE = { cols: 2, rows: 2, idle: 0, shield: 1, attack: 2, damaged: 3 };

  function ready(img) {
    return !!(img && img.complete && img.naturalWidth > 0);
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function rand(seed) {
    let x = Math.sin(seed * 999.91) * 10000;
    return x - Math.floor(x);
  }

  function postScore(final = false) {
    const score = Math.max(0, Math.floor(state.score));
    if (!final && Math.abs(score - state.lastScorePost) < 150) return;
    state.lastScorePost = score;
    try {
      window.parent?.postMessage({ type: "GG_SCORE", game: "space-pilot-platformer", score, final }, "*");
      window.parent?.postMessage({ type: "gg:score", slug: "space-pilot-platformer", score, final }, "*");
    } catch {}
  }

  function toast(text) {
    ui.toast.textContent = text;
    ui.toast.classList.remove("hidden");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => ui.toast.classList.add("hidden"), 1500);
  }

  function resize() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = Math.max(320, window.innerWidth);
    const h = Math.max(420, window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }

  function makeLevel(index) {
    const spec = LEVELS[index];
    const platforms = [];
    const enemies = [];
    const cores = [];
    const hazards = [];
    const pickups = [];
    const projectiles = [];
    const enemyShots = [];
    const particles = [];
    const planets = [];
    const stars = [];

    // Ground and asteroid base chunks: longer routes with wider gaps on later levels.
    let x = 0;
    while (x < spec.width) {
      const difficulty = 1 + index * 0.11;
      const gapChance = 0.68 - index * 0.018;
      const gap = x > 420 && rand(x + index * 19) > gapChance ? 130 + rand(x) * (135 + index * 16) : 0;
      if (gap) x += gap;
      const y = 650 + Math.sin(x * 0.005 + index) * 42 + Math.sin(x * 0.011 + index) * 16;
      const w = 230 + rand(x + 3) * (245 / difficulty);
      platforms.push({ x, y, w, h: 46, type: "ground", color: "#53607c" });
      x += w;
    }

    // Floating platforms.
    const count = 25 + index * 5;
    for (let i = 0; i < count; i += 1) {
      const px = 340 + i * (spec.width - 840) / count + rand(i + index * 8) * 120;
      const py = 330 + rand(i * 13 + index) * 250;
      const moving = i % 5 === 2 || (index > 1 && i % 6 === 0) || (index > 4 && i % 8 === 1);
      platforms.push({
        x: px,
        y: py,
        ox: px,
        oy: py,
        w: 135 + rand(i + 20) * 95,
        h: 26,
        type: moving ? "moving" : (index === 5 && i % 4 === 0 ? "ice" : "float"),
        phase: rand(i + 40) * 6.28,
        range: moving ? 100 + rand(i + 50) * (85 + index * 10) : 0,
        speed: moving ? 0.75 + rand(i + 70) * (0.75 + index * 0.04) : 0
      });
    }

    // Boss arena and stairs near final portal.
    const arenaX = spec.width - 980;
    platforms.push({ x: arenaX, y: 620, w: 560, h: 34, type: index >= 5 ? "ice" : "float" });
    platforms.push({ x: arenaX + 80, y: 455, w: 170, h: 24, type: "moving", ox: arenaX + 80, oy: 455, phase: index * 0.7, range: 95, speed: 0.95 + index * 0.04 });
    platforms.push({ x: arenaX + 360, y: 430, w: 190, h: 24, type: "moving", ox: arenaX + 360, oy: 430, phase: index * 1.1, range: 100, speed: 0.9 + index * 0.04 });
    for (let i = 0; i < 5; i += 1) {
      platforms.push({ x: spec.width - 800 + i * 150, y: 570 - i * 52, w: 150, h: 24, type: "float" });
    }

    // Star cores. Extra cores are placed so players have route choices.
    for (let i = 0; i < spec.cores + 8; i += 1) {
      const p = platforms[2 + Math.floor(rand(i + index * 77) * (platforms.length - 4))];
      cores.push({
        x: p.x + 35 + rand(i + 17) * Math.max(20, p.w - 70),
        y: p.y - 44 - rand(i + 29) * 50,
        r: 17,
        taken: false,
        phase: rand(i + 99) * 6.28
      });
    }

    // Enemies.
    for (let i = 0; i < spec.enemies; i += 1) {
      const p = platforms[2 + Math.floor(rand(i + index * 133) * (platforms.length - 5))];
      const enemyHp = 2 + Math.floor(index / 3) + (i % 5 === 0 ? 1 : 0);
      const speed = 58 + index * 7 + rand(i + 9) * 20;
      enemies.push({
        x: p.x + 40 + rand(i + 5) * Math.max(30, p.w - 80),
        y: p.y - 42,
        vx: rand(i + 9) > 0.5 ? speed : -speed,
        w: 48,
        h: 34,
        hp: enemyHp,
        maxHp: enemyHp,
        homeX: p.x + p.w / 2,
        range: 135 + rand(i + 13) * (130 + index * 8),
        shoot: 0.8 + rand(i + 18) * Math.max(0.65, 1.8 - index * 0.08),
        type: i % 4 === 0 && index > 1 ? "turret" : "drone",
        alive: true,
        frame: Math.floor(rand(i + 32) * 4)
      });
    }

    // Hazards.
    const hazardCount = 14 + index * 4;
    for (let i = 0; i < hazardCount; i += 1) {
      hazards.push({
        x: 480 + i * (spec.width - 900) / hazardCount + rand(i + 222) * 110,
        y: 610 - rand(i + 19) * 150,
        w: 46,
        h: 46,
        type: spec.hazard,
        phase: rand(i + 3) * 6.28
      });
    }

    // Pickups.
    for (let i = 0; i < 7 + Math.floor(index / 2); i += 1) {
      const p = platforms[2 + Math.floor(rand(i + index * 55) * (platforms.length - 5))];
      pickups.push({
        x: p.x + p.w * 0.5,
        y: p.y - 86,
        r: 20,
        type: i % 2 === 0 ? "shield" : "time",
        taken: false,
        phase: rand(i + 12) * 6.28
      });
    }

    if (spec.boss) {
      const hp = spec.bossHp || (22 + index * 4);
      enemies.push({
        x: spec.width - 560,
        y: 360,
        vx: 0,
        w: 220,
        h: 140,
        hp,
        maxHp: hp,
        homeX: spec.width - 560,
        homeY: 350,
        range: 210 + index * 18,
        shoot: 0.55 + Math.max(0, 0.2 - index * 0.02),
        type: "boss",
        name: spec.bossName || "Void Guardian",
        bossSprite: typeof spec.bossSprite === "number" ? spec.bossSprite : index,
        bossColor: spec.bossColor || "#ff2fd6",
        alive: true,
        frame: 0,
        attackAnim: 0,
        hitFlash: 0,
        phase: index * 0.9
      });
    }

    for (let i = 0; i < 160; i += 1) {
      stars.push({
        x: rand(i + index * 401) * spec.width,
        y: rand(i + index * 607) * WORLD_H,
        r: 0.7 + rand(i + index * 709) * 2.2,
        layer: 0.15 + rand(i + index * 811) * 0.55
      });
    }

    for (let i = 0; i < 5; i += 1) {
      planets.push({
        x: 300 + rand(i + index * 91) * (spec.width - 600),
        y: 80 + rand(i + index * 92) * 250,
        r: 35 + rand(i + index * 93) * 85,
        hue: ["#36dfff", "#ff784a", "#b46aff", "#ffd44a", "#64ffb8"][i % 5],
        layer: 0.06 + i * 0.035
      });
    }

    return {
      spec,
      platforms,
      enemies,
      cores,
      hazards,
      pickups,
      projectiles,
      enemyShots,
      particles,
      planets,
      stars,
      portal: { x: spec.width - 140, y: 360, w: 70, h: 120, open: false },
      width: spec.width
    };
  }

  function resetPlayer(full = false) {
    PLAYER.x = 80;
    PLAYER.y = 420;
    PLAYER.vx = 0;
    PLAYER.vy = 0;
    PLAYER.dir = 1;
    PLAYER.jumps = 0;
    PLAYER.onGround = false;
    PLAYER.checkpointX = 80;
    PLAYER.checkpointY = 420;
    PLAYER.invuln = 1.5;
    if (full) {
      state.health = 100;
      state.shield = 0;
      state.lives = 3;
    }
  }

  function startGame(fresh = true) {
    audio.ensure();
    if (fresh) {
      state.level = 0;
      state.score = 0;
      state.lives = 3;
    }
    audio.startMusic(state.level);
    state.status = "playing";
    state.health = 100;
    state.shield = 0;
    state.cores = 0;
    state.enemiesDefeated = 0;
    state.time = 0;
    state.shake = 0;
    state.world = makeLevel(state.level);
    resetPlayer(false);
    ui.startOverlay.classList.add("hidden");
    ui.gameOverOverlay.classList.add("hidden");
    toast(`Mission ${state.level + 1}: ${LEVELS[state.level].name}`);
    updateUI();
  }

  function retryLevel() {
    state.score = Math.max(0, state.score - 300);
    startGame(false);
  }

  function nextLevel() {
    postScore(false);
    state.score += 1200 + state.level * 260 + state.lives * 150;
    if (state.level >= LEVELS.length - 1) {
      endGame(true);
      return;
    }
    state.level += 1;
    startGame(false);
  }

  function endGame(win) {
    state.status = "ended";
    audio.stopMusic();
    postScore(true);
    ui.gameOverOverlay.classList.remove("hidden");
    $("endKicker").textContent = win ? "Odyssey Report" : "Mission Failed";
    $("endTitle").textContent = win ? "Portal Route Restored" : "Pilot Down";
    $("endText").textContent = win
      ? `Final score: ${Math.floor(state.score)}. Space Pilot Platformer is complete.`
      : `Score: ${Math.floor(state.score)}. Retry the level or restart the campaign.`;
  }

  function updateUI() {
    const w = state.world;
    if (!w) return;
    const progress = clamp(PLAYER.x / Math.max(1, w.width), 0, 1);
    ui.scoreText.textContent = String(Math.floor(state.score));
    ui.levelText.textContent = `${state.level + 1}/${LEVELS.length}`;
    ui.healthText.textContent = `${Math.max(0, Math.round(state.health))}%`;
    ui.shieldText.textContent = `${Math.max(0, Math.round(state.shield))}%`;
    ui.missionTitle.textContent = `${w.spec.name} — ${w.spec.zone}`;
    const defeatedDrones = w.enemies.filter((e) => e.type !== "boss" && !e.alive).length;
    const boss = w.enemies.find((e) => e.type === "boss");
    const bossText = boss ? (boss.alive ? `${boss.name || "Boss"} HP ${Math.max(0, Math.ceil(boss.hp))}/${boss.maxHp}` : `${boss.name || "Boss"} defeated`) : "portal route";
    ui.missionText.textContent =
      `${state.cores}/${w.spec.cores} cores • ${defeatedDrones}/${w.spec.enemies} drones • ${bossText}`;
    ui.missionMeter.style.width = `${Math.round(progress * 100)}%`;
    ui.mentorText.textContent = w.spec.tip;
  }

  function damage(amount) {
    if (PLAYER.invuln > 0 || state.status !== "playing") return;
    if (state.shield > 0) {
      const blocked = Math.min(state.shield, amount * 1.3);
      state.shield -= blocked;
      amount = Math.max(0, amount - blocked * 0.65);
    }
    state.health -= amount;
    PLAYER.invuln = 0.75;
    state.shake = 0.28;
    audio.hurt();
    if (state.health <= 0) {
      state.lives -= 1;
      if (state.lives <= 0) {
        endGame(false);
      } else {
        state.health = 100;
        state.shield = 20;
        PLAYER.x = PLAYER.checkpointX;
        PLAYER.y = PLAYER.checkpointY;
        PLAYER.vx = 0;
        PLAYER.vy = 0;
        toast(`Suit rebooted. Lives left: ${state.lives}`);
      }
    }
  }

  function addParticle(x, y, color, count = 10) {
    const w = state.world;
    for (let i = 0; i < count; i += 1) {
      w.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 260,
        vy: (Math.random() - 0.5) * 220,
        life: 0.35 + Math.random() * 0.45,
        color,
        r: 2 + Math.random() * 4
      });
    }
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function playerRect() {
    return { x: PLAYER.x - PLAYER.w / 2, y: PLAYER.y - PLAYER.h / 2, w: PLAYER.w, h: PLAYER.h };
  }

  function shoot() {
    if (PLAYER.shootCd > 0 || state.status !== "playing") return;
    const w = state.world;
    w.projectiles.push({
      x: PLAYER.x + PLAYER.dir * 24,
      y: PLAYER.y - 7,
      vx: PLAYER.dir * 680,
      vy: -20,
      r: 5,
      life: 1.2,
      power: 1
    });
    PLAYER.shootCd = 0.18;
    audio.shoot();
  }

  function jump() {
    if (state.status !== "playing") return;
    if (PLAYER.onGround || PLAYER.jumps < PLAYER.maxJumps) {
      PLAYER.vy = PLAYER.jumps === 0 ? -640 : -560;
      PLAYER.onGround = false;
      PLAYER.jumps += 1;
      addParticle(PLAYER.x, PLAYER.y + 28, "#36dfff", 7);
      audio.jump();
    }
  }

  function dash() {
    if (PLAYER.dashCd > 0 || state.status !== "playing") return;
    PLAYER.vx += PLAYER.dir * 520;
    PLAYER.dashCd = 1.25;
    PLAYER.invuln = Math.max(PLAYER.invuln, 0.25);
    state.shield = Math.min(100, state.shield + 5);
    addParticle(PLAYER.x - PLAYER.dir * 18, PLAYER.y, "#ffd44a", 12);
    audio.power();
  }

  function update(dt) {
    if (state.status !== "playing" || !state.world) return;
    const w = state.world;
    const index = state.level;
    state.time += dt;
    PLAYER.shootCd = Math.max(0, PLAYER.shootCd - dt);
    PLAYER.dashCd = Math.max(0, PLAYER.dashCd - dt);
    PLAYER.invuln = Math.max(0, PLAYER.invuln - dt);
    state.shake = Math.max(0, state.shake - dt);

    const left = state.keys.ArrowLeft || state.keys.KeyA || state.touch.left;
    const right = state.keys.ArrowRight || state.keys.KeyD || state.touch.right;
    const shootHeld = state.keys.KeyJ || state.touch.shoot;
    const dashHeld = state.keys.KeyK || state.keys.ShiftLeft || state.keys.ShiftRight || state.touch.dash;

    const accel = PLAYER.onGround ? 2200 : 1450;
    const maxSpeed = 360;
    if (left) {
      PLAYER.vx -= accel * dt;
      PLAYER.dir = -1;
    }
    if (right) {
      PLAYER.vx += accel * dt;
      PLAYER.dir = 1;
    }
    if (!left && !right) {
      PLAYER.vx *= Math.pow(0.0009, dt);
    }

    if (shootHeld) shoot();
    if (dashHeld) dash();

    PLAYER.vx = clamp(PLAYER.vx, -maxSpeed, maxSpeed);
    PLAYER.vy += 1480 * dt;
    PLAYER.vy = Math.min(950, PLAYER.vy);

    // Moving platforms.
    w.platforms.forEach((p) => {
      p.prevX = p.x;
      p.prevY = p.y;
      if (p.type === "moving") {
        p.x = p.ox + Math.sin(state.time * p.speed + p.phase) * p.range;
        p.y = p.oy + Math.sin(state.time * p.speed * 0.7 + p.phase) * 32;
      }
    });

    PLAYER.x += PLAYER.vx * dt;
    PLAYER.x = clamp(PLAYER.x, 20, w.width - 40);
    let pr = playerRect();

    // Horizontal platform collision.
    for (const p of w.platforms) {
      if (!rectsOverlap(pr, p)) continue;
      if (PLAYER.vx > 0) PLAYER.x = p.x - PLAYER.w / 2 - 0.1;
      if (PLAYER.vx < 0) PLAYER.x = p.x + p.w + PLAYER.w / 2 + 0.1;
      PLAYER.vx = 0;
      pr = playerRect();
    }

    PLAYER.y += PLAYER.vy * dt;
    PLAYER.onGround = false;
    pr = playerRect();

    for (const p of w.platforms) {
      if (!rectsOverlap(pr, p)) continue;
      const wasAbove = pr.y + pr.h - PLAYER.vy * dt <= p.y + 8;
      const wasBelow = pr.y - PLAYER.vy * dt >= p.y + p.h - 8;
      if (PLAYER.vy >= 0 && wasAbove) {
        PLAYER.y = p.y - PLAYER.h / 2;
        PLAYER.vy = 0;
        PLAYER.onGround = true;
        PLAYER.jumps = 0;
        if (p.type === "moving") PLAYER.x += (p.x - (p.prevX || p.x));
        if (p.type === "ice") PLAYER.vx *= 1.01;
        pr = playerRect();
      } else if (PLAYER.vy < 0 && wasBelow) {
        PLAYER.y = p.y + p.h + PLAYER.h / 2;
        PLAYER.vy = 20;
        pr = playerRect();
      }
    }

    if (PLAYER.y > WORLD_H + 180) {
      damage(35);
      PLAYER.x = PLAYER.checkpointX;
      PLAYER.y = PLAYER.checkpointY;
      PLAYER.vx = 0;
      PLAYER.vy = 0;
    }

    // Checkpoints.
    if (PLAYER.x > PLAYER.checkpointX + 520) {
      PLAYER.checkpointX = PLAYER.x;
      PLAYER.checkpointY = Math.min(PLAYER.y, 520);
    }

    // Enemies.
    for (const e of w.enemies) {
      if (!e.alive) continue;
      if (e.type === "boss") {
        const enraged = e.hp < e.maxHp * 0.5;
        const speedBoost = enraged ? 1.35 : 1;
        e.x = e.homeX + Math.sin(state.time * (0.75 + index * 0.03) * speedBoost + e.phase) * e.range;
        e.y = e.homeY + Math.sin(state.time * (1.05 + index * 0.04) * speedBoost + e.phase) * (54 + index * 2);
        e.attackAnim = Math.max(0, (e.attackAnim || 0) - dt);
        e.hitFlash = Math.max(0, (e.hitFlash || 0) - dt);
      } else if (e.type !== "turret") {
        e.x += e.vx * dt;
        if (Math.abs(e.x - e.homeX) > e.range) e.vx *= -1;
      }
      e.frame = (e.frame + dt * 7) % 4;
      e.shoot -= dt;
      const near = Math.abs(e.x - PLAYER.x) < (e.type === "boss" ? 900 : 520) && Math.abs(e.y - PLAYER.y) < 260;
      if (near && e.shoot <= 0) {
        const dx = PLAYER.x - e.x;
        const dy = PLAYER.y - e.y;
        const len = Math.hypot(dx, dy) || 1;
        if (e.type === "boss") {
          const enraged = e.hp < e.maxHp * 0.5;
          const shots = enraged ? 5 : 3;
          const spread = enraged ? 0.44 : 0.28;
          const baseAngle = Math.atan2(dy, dx);
          for (let i = 0; i < shots; i += 1) {
            const offset = (i - (shots - 1) / 2) * spread;
            const angle = baseAngle + offset;
            w.enemyShots.push({
              x: e.x + Math.cos(angle) * 34,
              y: e.y + Math.sin(angle) * 20,
              vx: Math.cos(angle) * (430 + index * 18),
              vy: Math.sin(angle) * (430 + index * 18),
              r: enraged ? 9 : 8,
              life: 3.2,
              color: enraged ? "#ff315a" : "#ff2fd6"
            });
          }
          e.attackAnim = enraged ? 0.42 : 0.32;
          if (Math.random() < 0.32 + index * 0.035) {
            w.hazards.push({
              x: clamp(PLAYER.x + (Math.random() - 0.5) * 260, 420, w.width - 260),
              y: clamp(PLAYER.y - 70, 230, 610),
              w: 42,
              h: 42,
              type: w.spec.hazard,
              phase: Math.random() * 6.28,
              temporary: 4.5
            });
          }
          e.shoot = enraged ? Math.max(0.36, 0.58 - index * 0.025) : Math.max(0.48, 0.72 - index * 0.02);
        } else {
          w.enemyShots.push({
            x: e.x,
            y: e.y,
            vx: dx / len * 320,
            vy: dy / len * 320,
            r: 6,
            life: 3,
            color: "#ff784a"
          });
          e.shoot = Math.max(0.75, 1.1 - index * 0.05) + Math.random() * 1.05;
        }
      }
      if (rectsOverlap(playerRect(), { x: e.x - e.w / 2, y: e.y - e.h / 2, w: e.w, h: e.h })) {
        damage(e.type === "boss" ? 26 + index * 2 : 16);
      }
    }

    // Hazards.
    for (const h of w.hazards) {
      if (h.temporary) h.temporary -= dt;
      const pulse = Math.sin(state.time * 3 + h.phase);
      if (rectsOverlap(playerRect(), { x: h.x - h.w / 2, y: h.y - h.h / 2, w: h.w, h: h.h })) {
        damage(pulse > -0.45 ? 16 : 8);
      }
    }

    w.hazards = w.hazards.filter((h) => !h.temporary || h.temporary > 0);

    // Projectiles.
    for (const s of w.projectiles) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      for (const e of w.enemies) {
        if (!e.alive || s.dead) continue;
        const er = { x: e.x - e.w / 2, y: e.y - e.h / 2, w: e.w, h: e.h };
        if (rectsOverlap({ x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 }, er)) {
          s.dead = true;
          e.hp -= s.power;
          if (e.type === "boss") e.hitFlash = 0.22;
          addParticle(s.x, s.y, e.type === "boss" ? (e.bossColor || "#ff2fd6") : "#ff784a", 8);
          if (e.hp <= 0) {
            e.alive = false;
            state.enemiesDefeated += 1;
            state.score += e.type === "boss" ? 3000 + index * 550 : 240;
            addParticle(e.x, e.y, e.type === "boss" ? (e.bossColor || "#ff2fd6") : "#ff784a", e.type === "boss" ? 38 : 18);
            if (e.type === "boss") {
              toast(`${e.name || "Boss"} defeated — portal unlocking`);
              audio.boss();
            } else {
              audio.boom();
            }
          }
        }
      }
    }

    for (const s of w.enemyShots) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (!s.dead && rectsOverlap({ x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 }, playerRect())) {
        s.dead = true;
        damage(12);
      }
    }

    w.projectiles = w.projectiles.filter((s) => !s.dead && s.life > 0 && s.x > -100 && s.x < w.width + 100);
    w.enemyShots = w.enemyShots.filter((s) => !s.dead && s.life > 0);

    // Collectibles.
    for (const c of w.cores) {
      if (c.taken) continue;
      const dx = PLAYER.x - c.x;
      const dy = PLAYER.y - c.y;
      if (dx * dx + dy * dy < 42 * 42) {
        c.taken = true;
        state.cores += 1;
        state.score += 120;
        addParticle(c.x, c.y, "#ffd44a", 12);
        audio.collect();
      }
    }

    for (const p of w.pickups) {
      if (p.taken) continue;
      const dx = PLAYER.x - p.x;
      const dy = PLAYER.y - p.y;
      if (dx * dx + dy * dy < 46 * 46) {
        p.taken = true;
        if (p.type === "shield") {
          state.shield = Math.min(100, state.shield + 45);
          toast("Shield restored");
        } else {
          PLAYER.dashCd = 0;
          PLAYER.shootCd = 0;
          toast("Time charge ready");
        }
        state.score += 160;
        addParticle(p.x, p.y, p.type === "shield" ? "#64ffb8" : "#36dfff", 14);
        audio.power();
      }
    }

    // Portal.
    w.portal.open = state.cores >= w.spec.cores && (!w.spec.boss || w.enemies.every((e) => e.type !== "boss" || !e.alive));
    if (rectsOverlap(playerRect(), { x: w.portal.x, y: w.portal.y, w: w.portal.w, h: w.portal.h })) {
      if (w.portal.open) {
        nextLevel();
        return;
      }
      const boss = w.enemies.find((e) => e.type === "boss" && e.alive);
      if (state.cores < w.spec.cores) {
        toast(`Need ${Math.max(0, w.spec.cores - state.cores)} more core(s)`);
      } else if (boss) {
        toast(`Defeat ${boss.name || "the boss"} to open the portal`);
      } else {
        toast("Portal is charging");
      }
      PLAYER.vx = -120;
    }

    // Particles.
    for (const p of w.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 220 * dt;
      p.life -= dt;
    }
    w.particles = w.particles.filter((p) => p.life > 0);

    // Camera.
    const sw = canvas.clientWidth || window.innerWidth;
    const sh = canvas.clientHeight || window.innerHeight;
    const targetX = clamp(PLAYER.x - sw * 0.38, 0, Math.max(0, w.width - sw));
    const targetY = clamp(PLAYER.y - sh * 0.56, 0, Math.max(0, WORLD_H - sh));
    state.cameraX += (targetX - state.cameraX) * Math.min(1, dt * 4.8);
    state.cameraY += (targetY - state.cameraY) * Math.min(1, dt * 4.8);

    updateUI();
    postScore(false);
  }

  function drawImageCover(img, x, y, w, h) {
    const iw = img.naturalWidth || img.width || 1;
    const ih = img.naturalHeight || img.height || 1;
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }

  function drawSpriteSheet(img, frame, x, y, w, h, rot = 0, flip = 1, cols = null, rows = null) {
    if (!ready(img)) return false;
    const spriteCols = Math.max(1, cols || img.spriteCols || (img.naturalWidth > 700 || img.naturalHeight > 700 ? 2 : 1));
    const spriteRows = Math.max(1, rows || img.spriteRows || spriteCols);
    const total = spriteCols * spriteRows;
    const f = Math.floor(frame || 0) % total;
    const sw = img.naturalWidth / spriteCols;
    const sh = img.naturalHeight / spriteRows;
    const sx = (f % spriteCols) * sw;
    const sy = Math.floor(f / spriteCols) * sh;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(flip, 1);
    ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  function drawSpriteFrame(img, frame, cols, rows, x, y, w, h, rot = 0, flip = 1) {
    if (!ready(img)) return false;
    const total = cols * rows;
    const f = Math.floor(frame || 0) % total;
    const sw = img.naturalWidth / cols;
    const sh = img.naturalHeight / rows;
    const sx = (f % cols) * sw;
    const sy = Math.floor(f / cols) * sh;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(flip, 1);
    ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
  }

  function getBossImage(e) {
    const rawIndex = typeof e.bossSprite === "number" ? e.bossSprite : state.level;
    const bossIndex = clamp(Math.floor(rawIndex), 0, ASSETS.bosses.length - 1);
    const preferredKeys = Array.from(new Set([`boss${bossIndex}`, `boss${state.level}`]));

    for (const key of preferredKeys) {
      if (ready(images[key])) return images[key];
    }
    return null;
  }

  function drawBossAssetMissing(e, color) {
    // This only appears if the level-specific PNG is missing or still loading.
    // The old mothership fallback is intentionally not used here, so incorrect boss art cannot appear.
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(state.time * 8) * 0.12;
    ctx.strokeStyle = color;
    ctx.fillStyle = "rgba(7,16,37,.78)";
    ctx.lineWidth = 3;
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    roundRect(-100, -52, 200, 104, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.font = "700 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("BOSS SPRITE LOADING", 0, 68);
    ctx.restore();
  }

  function drawBackground() {
    const sw = canvas.clientWidth || window.innerWidth;
    const sh = canvas.clientHeight || window.innerHeight;
    const w = state.world;
    const bg = w ? images[`bg${w.spec.bg}`] : images.bg0;

    if (ready(bg)) {
      drawImageCover(bg, 0, 0, sw, sh);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, sh);
      g.addColorStop(0, "#020510");
      g.addColorStop(0.5, "#0c1641");
      g.addColorStop(1, "#2a0a40");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, sw, sh);
    }

    if (!w) return;

    ctx.save();
    ctx.globalAlpha = 0.95;
    for (const planet of w.planets) {
      const px = planet.x - state.cameraX * planet.layer;
      const py = planet.y - state.cameraY * planet.layer * 0.4 + Math.sin(state.time * 0.2 + planet.x) * 10;
      if (px < -200 || px > sw + 200) continue;
      const grad = ctx.createRadialGradient(px - planet.r * 0.25, py - planet.r * 0.25, planet.r * 0.1, px, py, planet.r);
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(0.2, planet.hue);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, planet.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    for (const s of w.stars) {
      const px = (s.x - state.cameraX * s.layer) % (sw + 120);
      const py = (s.y - state.cameraY * s.layer * 0.6 + state.time * (20 + s.layer * 40)) % (sh + 80);
      ctx.globalAlpha = 0.38 + s.layer * 0.7;
      ctx.fillStyle = s.layer > 0.45 ? "#ffffff" : "#8feaff";
      ctx.beginPath();
      ctx.arc(px < -20 ? px + sw + 120 : px, py < -20 ? py + sh + 80 : py, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Soft forward-motion streaks.
    ctx.save();
    ctx.strokeStyle = "rgba(120,220,255,.20)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 26; i += 1) {
      const y = (i * 73 + state.time * 180) % (sh + 120) - 60;
      const x = (i * 137 + state.cameraX * 0.11) % (sw + 160) - 80;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 36, y + 20);
      ctx.stroke();
    }
    ctx.restore();
  }

  function worldToScreen(x, y) {
    const shakeX = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 16 : 0;
    const shakeY = state.shake > 0 ? (Math.random() - 0.5) * state.shake * 12 : 0;
    return { x: x - state.cameraX + shakeX, y: y - state.cameraY + shakeY };
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawPlatform(p) {
    const s = worldToScreen(p.x, p.y);
    if (s.x > canvas.clientWidth + 200 || s.x + p.w < -200 || s.y > canvas.clientHeight + 120 || s.y + p.h < -120) return;

    const top = p.type === "ice" ? "#8feaff" : p.type === "moving" ? "#ffd44a" : "#6f7fa2";
    ctx.save();
    ctx.shadowColor = top;
    ctx.shadowBlur = p.type === "moving" ? 18 : 10;
    ctx.fillStyle = "rgba(7,16,37,.92)";
    ctx.strokeStyle = top;
    ctx.lineWidth = 2;
    roundRect(s.x, s.y, p.w, p.h, 12);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = top;
    for (let i = 0; i < p.w; i += 34) {
      ctx.fillRect(s.x + i + 8, s.y + 7, 18, 3);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawPilot() {
    const s = worldToScreen(PLAYER.x, PLAYER.y);
    const moving = PLAYER.onGround && Math.abs(PLAYER.vx) > 35;
    const blink = PLAYER.invuln > 0 && Math.floor(state.time * 18) % 2 === 0;
    if (blink) return;

    let animRow = PILOT_SPRITE.idle;
    let animSpeed = 5;
    if (PLAYER.shootCd > 0.04 || state.touch.shoot || state.keys.KeyJ) {
      animRow = PILOT_SPRITE.shoot;
      animSpeed = 12;
    } else if (!PLAYER.onGround) {
      animRow = PILOT_SPRITE.jump;
      animSpeed = 8;
    } else if (moving) {
      animRow = PILOT_SPRITE.run;
      animSpeed = 14;
    }

    const frame = animRow * PILOT_SPRITE.cols + Math.floor(state.time * animSpeed) % PILOT_SPRITE.cols;
    const bob = animRow === PILOT_SPRITE.idle ? Math.sin(state.time * 4) * 2 : 0;
    const drawW = moving ? 86 : 82;
    const drawH = 96;

    // Thumbnail-inspired jet flame and neon landing dust.
    if (!PLAYER.onGround || PLAYER.dashCd > 0.98) {
      ctx.save();
      const fx = s.x - PLAYER.dir * 30;
      const fy = s.y + 12 + bob;
      const flame = 24 + Math.sin(state.time * 40) * 5;
      ctx.translate(fx, fy);
      ctx.scale(PLAYER.dir, 1);
      ctx.shadowColor = "#36dfff";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "rgba(54,223,255,.55)";
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-flame, 1);
      ctx.lineTo(0, 10);
      ctx.closePath();
      ctx.fill();
      ctx.shadowColor = "#ffd44a";
      ctx.fillStyle = "rgba(255,212,74,.85)";
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(-flame * 0.62, 2);
      ctx.lineTo(0, 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.shadowColor = "#36dfff";
    ctx.shadowBlur = 12;
    const usedSprite = drawSpriteFrame(
      images.player,
      frame,
      PILOT_SPRITE.cols,
      PILOT_SPRITE.rows,
      s.x,
      s.y + bob,
      drawW,
      drawH,
      0,
      PLAYER.dir
    );
    ctx.restore();

    if (!usedSprite) {
      drawProceduralPilot(s, moving, bob);
    }

    if (state.shield > 0) {
      ctx.save();
      ctx.globalAlpha = 0.36 + Math.sin(state.time * 8) * 0.08;
      ctx.strokeStyle = "#64ffb8";
      ctx.shadowColor = "#64ffb8";
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, 36, 48, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawProceduralPilot(s, moving, bob) {
    const walk = Math.sin(state.time * 16) * (moving ? 1 : 0);
    ctx.save();
    ctx.translate(s.x, s.y + bob);
    ctx.scale(PLAYER.dir, 1);
    ctx.shadowColor = "#36dfff";
    ctx.shadowBlur = 14;

    // Legs
    ctx.strokeStyle = "#eaf7ff";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, 18);
    ctx.lineTo(-10 - walk * 7, 32);
    ctx.moveTo(8, 18);
    ctx.lineTo(10 + walk * 7, 32);
    ctx.stroke();

    // Body
    ctx.fillStyle = "#eaf7ff";
    roundRect(-15, -8, 30, 32, 10);
    ctx.fill();

    // Jetpack
    ctx.fillStyle = "#16223d";
    roundRect(-24, -4, 11, 28, 5);
    ctx.fill();

    // Helmet
    ctx.fillStyle = "#f5fbff";
    ctx.beginPath();
    ctx.arc(0, -24, 18, 0, Math.PI * 2);
    ctx.fill();

    // Visor
    const visor = ctx.createLinearGradient(-12, -30, 14, -17);
    visor.addColorStop(0, "#071025");
    visor.addColorStop(0.55, "#36dfff");
    visor.addColorStop(1, "#b46aff");
    ctx.fillStyle = visor;
    roundRect(-13, -31, 26, 14, 7);
    ctx.fill();

    // Arm blaster
    ctx.strokeStyle = "#ffd44a";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(12, -2);
    ctx.lineTo(26, -6 + walk * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawEnemy(e) {
    if (!e.alive) return;
    const s = worldToScreen(e.x, e.y);
    if (s.x < -220 || s.x > canvas.clientWidth + 220 || s.y < -160 || s.y > canvas.clientHeight + 160) return;

    ctx.save();
    ctx.translate(s.x, s.y);
    const bossGlow = e.bossColor || "#ff2fd6";
    ctx.shadowColor = e.type === "boss" ? bossGlow : "#ff784a";
    ctx.shadowBlur = e.type === "boss" ? 26 : 16;

    if (e.type === "boss") {
      const bossImg = getBossImage(e);
      const enraged = e.hp < e.maxHp * 0.42;
      const bossFrame = (e.hitFlash || enraged)
        ? BOSS_SPRITE.damaged
        : (e.attackAnim > 0 ? BOSS_SPRITE.attack : (Math.sin(state.time * 2.6 + e.phase) > 0.72 ? BOSS_SPRITE.shield : BOSS_SPRITE.idle));
      const pulse = 1 + Math.sin(state.time * 5 + e.phase) * 0.025;

      if (bossImg) {
        drawSpriteSheet(
          bossImg,
          bossFrame,
          0,
          0,
          286 * pulse,
          190 * pulse,
          0,
          1,
          BOSS_SPRITE.cols,
          BOSS_SPRITE.rows
        );
      } else {
        drawBossAssetMissing(e, bossGlow);
      }
      ctx.fillStyle = "rgba(255,255,255,.88)";
      ctx.font = "700 12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(e.name || "Boss", 0, -96);
      ctx.fillStyle = "rgba(255,255,255,.18)";
      roundRect(-98, -84, 196, 10, 999);
      ctx.fill();
      ctx.fillStyle = bossGlow;
      roundRect(-98, -84, 196 * (e.hp / e.maxHp), 10, 999);
      ctx.fill();
    } else {
      if (!drawSpriteSheet(images.enemy, e.frame, 0, 0, 72, 54, 0, e.vx < 0 ? -1 : 1)) {
        ctx.fillStyle = "#11182c";
        ctx.strokeStyle = "#ff784a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(34, 12);
        ctx.lineTo(0, 22);
        ctx.lineTo(-34, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawCore(c) {
    if (c.taken) return;
    const s = worldToScreen(c.x, c.y + Math.sin(state.time * 3 + c.phase) * 8);
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(state.time * 1.8 + c.phase);
    ctx.shadowColor = "#ffd44a";
    ctx.shadowBlur = 22;
    if (!drawSpriteSheet(images.core, 0, 0, 0, 38, 38)) {
      ctx.fillStyle = "#ffd44a";
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(16, 0);
      ctx.lineTo(0, 18);
      ctx.lineTo(-16, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPickup(p) {
    if (p.taken) return;
    const s = worldToScreen(p.x, p.y + Math.sin(state.time * 3 + p.phase) * 8);
    ctx.save();
    ctx.shadowColor = p.type === "shield" ? "#64ffb8" : "#36dfff";
    ctx.shadowBlur = 20;
    drawSpriteSheet(p.type === "shield" ? images.shield : images.time, 0, s.x, s.y, 44, 44);
    ctx.restore();
  }

  function drawHazard(h) {
    const s = worldToScreen(h.x, h.y);
    const pulse = 0.75 + Math.sin(state.time * 4 + h.phase) * 0.25;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.globalAlpha = (0.78 + pulse * 0.22) * (h.temporary ? clamp(h.temporary / 1.2, 0.25, 1) : 1);
    if (h.type === "laser" || h.type === "plasma") {
      ctx.strokeStyle = h.type === "laser" ? "#ff315a" : "#ff2fd6";
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 18;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-22, -28);
      ctx.lineTo(22, 28);
      ctx.moveTo(22, -28);
      ctx.lineTo(-22, 28);
      ctx.stroke();
    } else {
      ctx.rotate(state.time * 2 + h.phase);
      drawSpriteSheet(images.asteroid, h.phase * 3, 0, 0, h.w * pulse, h.h * pulse);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawPortal() {
    const w = state.world;
    const p = w.portal;
    const s = worldToScreen(p.x + p.w / 2, p.y + p.h / 2);
    ctx.save();
    ctx.translate(s.x, s.y);
    const color = p.open ? "#64ffb8" : "#8a7dff";
    ctx.shadowColor = color;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    for (let i = 0; i < 3; i += 1) {
      ctx.save();
      ctx.rotate(state.time * (0.8 + i * 0.25));
      ctx.beginPath();
      ctx.ellipse(0, 0, 36 + i * 9, 58 + i * 7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = p.open ? "rgba(100,255,184,.16)" : "rgba(138,125,255,.12)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 34, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawProjectile(s, enemy = false) {
    const p = worldToScreen(s.x, s.y);
    ctx.save();
    ctx.shadowColor = enemy ? s.color || "#ff784a" : "#36dfff";
    ctx.shadowBlur = 16;
    ctx.fillStyle = enemy ? s.color || "#ff784a" : "#36dfff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    const sw = canvas.clientWidth || window.innerWidth;
    const sh = canvas.clientHeight || window.innerHeight;
    ctx.clearRect(0, 0, sw, sh);
    drawBackground();

    const w = state.world;
    if (w) {
      w.platforms.forEach(drawPlatform);
      w.hazards.forEach(drawHazard);
      w.cores.forEach(drawCore);
      w.pickups.forEach(drawPickup);
      drawPortal();
      w.enemies.forEach(drawEnemy);
      w.projectiles.forEach((p) => drawProjectile(p, false));
      w.enemyShots.forEach((p) => drawProjectile(p, true));
      for (const p of w.particles) {
        const s = worldToScreen(p.x, p.y);
        ctx.globalAlpha = clamp(p.life * 1.8, 0, 1);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(s.x, s.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      drawPilot();

      if (state.status === "menu") {
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = "#ffffff";
        ctx.font = `900 ${Math.max(42, sw * 0.065)}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText("SPACE PILOT", sw / 2, sh * 0.45);
        ctx.restore();
      }
    }
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function bindButton(btn, onDown, onUp) {
    if (!btn) return;
    const down = (e) => {
      e.preventDefault();
      audio.ensure();
      onDown();
    };
    const up = (e) => {
      if (e) e.preventDefault();
      onUp();
    };
    btn.addEventListener("pointerdown", down);
    btn.addEventListener("pointerup", up);
    btn.addEventListener("pointercancel", up);
    btn.addEventListener("pointerleave", up);
  }

  document.addEventListener("keydown", (e) => {
    state.keys[e.code] = true;
    audio.ensure();
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "KeyA", "KeyD", "KeyW", "KeyJ", "KeyK", "ShiftLeft", "ShiftRight"].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === "Space" || e.code === "KeyW" || e.code === "ArrowUp") {
      if (!e.repeat) jump();
    }
  });

  document.addEventListener("keyup", (e) => {
    state.keys[e.code] = false;
  });

  document.querySelectorAll("[data-dir]").forEach((btn) => {
    const dir = btn.dataset.dir;
    bindButton(
      btn,
      () => { state.touch[dir] = true; },
      () => { state.touch[dir] = false; }
    );
  });

  bindButton(ui.jumpBtn, () => { state.touch.jump = true; jump(); }, () => { state.touch.jump = false; });
  bindButton(ui.shootBtn, () => { state.touch.shoot = true; }, () => { state.touch.shoot = false; });
  bindButton(ui.dashBtn, () => { state.touch.dash = true; dash(); }, () => { state.touch.dash = false; });

  ui.startBtn.addEventListener("click", () => startGame(true));
  ui.retryBtn.addEventListener("click", retryLevel);
  ui.restartBtn.addEventListener("click", () => startGame(true));
  ui.howBtn.addEventListener("click", () => ui.help.classList.toggle("visible"));

  window.addEventListener("resize", resize);
  resize();
  state.world = makeLevel(0);
  updateUI();
  requestAnimationFrame(loop);
})();
