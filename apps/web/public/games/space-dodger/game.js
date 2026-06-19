(() => {
  "use strict";

  const BABYLON_AVAILABLE = typeof window !== "undefined" && !!window.BABYLON;

  const $ = (id) => document.getElementById(id);

  function getGameCanvas() {
    let canvas =
      $("renderCanvas") ||
      $("c") ||
      $("gameCanvas") ||
      document.querySelector("canvas");

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "renderCanvas";
      canvas.setAttribute("aria-label", "Space Dodger game canvas");
      const mount = document.body || document.documentElement;
      mount.prepend(canvas);
    }

    canvas.tabIndex = 0;
    return canvas;
  }

  const ui = {
    canvas: getGameCanvas(),
    startOverlay: $("startOverlay"),
    gameOverOverlay: $("gameOverOverlay"),
    startBtn: $("startBtn"),
    howBtn: $("howBtn"),
    help: $("controlsHelp"),
    retryBtn: $("retryBtn"),
    restartBtn: $("restartBtn"),
    scoreText: $("scoreText"),
    levelText: $("levelText"),
    hullText: $("hullText"),
    shieldText: $("shieldText"),
    missionTitle: $("missionTitle"),
    missionText: $("missionText"),
    missionMeter: $("missionMeter"),
    mentorText: $("mentorText"),
    bossPanel: $("bossPanel"),
    bossName: $("bossName"),
    bossBar: $("bossBar"),
    toast: $("toast"),
    fireBtn: $("fireBtn"),
    boostBtn: $("boostBtn")
  };

  const LEVELS = [
    {
      name: "Launch Corridor",
      zone: "Earth Orbit",
      mission: "Collect 8 star cores and clear the first asteroid lane.",
      tip: "Commander Nova: Small steering changes keep your ship alive. Learn the lanes before the drones arrive.",
      duration: 65,
      cores: 8,
      kills: 4,
      asteroidRate: 1.15,
      enemyRate: 2.4,
      speed: 24,
      hue: "#36dfff",
      enemyTypes: ["scout"],
      boss: null,
      music: [196, 247, 294, 392]
    },
    {
      name: "Meteor Scar",
      zone: "Asteroid Belt",
      mission: "Survive heavy rocks and disable 8 AI scouts.",
      tip: "Asteroids rotate and drift. Watch the glowing edges and boost only when your path is clear.",
      duration: 72,
      cores: 10,
      kills: 8,
      asteroidRate: 0.92,
      enemyRate: 2.1,
      speed: 27,
      hue: "#ffd44a",
      enemyTypes: ["scout", "darter"],
      boss: null,
      music: [220, 277, 330, 440]
    },
    {
      name: "Nebula Gate",
      zone: "Violet Cloud",
      mission: "Pass through plasma gates and collect 12 cores.",
      tip: "Blue gates give bonus points. Pink mines are unstable, shoot them before they cross your line.",
      duration: 78,
      cores: 12,
      kills: 10,
      asteroidRate: 1.0,
      enemyRate: 1.9,
      speed: 30,
      hue: "#b46aff",
      enemyTypes: ["scout", "mine"],
      boss: null,
      music: [185, 233, 277, 370]
    },
    {
      name: "Drone Forge",
      zone: "AI Factory Ring",
      mission: "Defeat the Forge Warden and recover the navigation crystal.",
      tip: "Boss shields flicker before attacks. Fire during openings and keep moving vertically.",
      duration: 95,
      cores: 8,
      kills: 12,
      asteroidRate: 1.05,
      enemyRate: 1.75,
      speed: 31,
      hue: "#ff2fd6",
      enemyTypes: ["scout", "darter", "shield"],
      boss: { name: "Forge Warden", hp: 160, at: 38, color: "#ff2fd6" },
      music: [164, 196, 246, 329]
    },
    {
      name: "Comet Rapids",
      zone: "Ice Tail",
      mission: "Navigate comet shards and collect 14 cryo-cores.",
      tip: "Slow-motion power-ups are ideal when the screen is full of shards and lasers.",
      duration: 82,
      cores: 14,
      kills: 14,
      asteroidRate: 0.82,
      enemyRate: 1.65,
      speed: 34,
      hue: "#69f1ff",
      enemyTypes: ["scout", "darter", "turret"],
      boss: null,
      music: [207, 261, 311, 415]
    },
    {
      name: "Pirate Signal",
      zone: "Outer Relay",
      mission: "Stop raider ships from transmitting your coordinates.",
      tip: "Shield ships protect nearby enemies. Remove shields first to open the formation.",
      duration: 88,
      cores: 12,
      kills: 18,
      asteroidRate: 0.95,
      enemyRate: 1.45,
      speed: 36,
      hue: "#ff784a",
      enemyTypes: ["darter", "turret", "shield"],
      boss: null,
      music: [174, 220, 261, 349]
    },
    {
      name: "Crystal Rift",
      zone: "Gravity Split",
      mission: "Collect rift crystals while gravity lanes shift.",
      tip: "The field bends movement here. Use short taps on mobile and avoid over-correcting.",
      duration: 95,
      cores: 16,
      kills: 18,
      asteroidRate: 0.78,
      enemyRate: 1.38,
      speed: 37,
      hue: "#64ffb8",
      enemyTypes: ["scout", "mine", "shield"],
      boss: null,
      music: [196, 294, 330, 493]
    },
    {
      name: "Mothership Shadow",
      zone: "Dark Armada",
      mission: "Break the Carrier Tyrant before it launches a swarm.",
      tip: "When the boss opens its red core, unload double lasers. Save plasma burst for the final phase.",
      duration: 110,
      cores: 10,
      kills: 20,
      asteroidRate: 0.85,
      enemyRate: 1.28,
      speed: 39,
      hue: "#ff315a",
      enemyTypes: ["darter", "turret", "mine", "shield"],
      boss: { name: "Carrier Tyrant", hp: 240, at: 42, color: "#ff315a" },
      music: [146, 174, 220, 293]
    },
    {
      name: "Solar Furnace",
      zone: "Star Edge",
      mission: "Survive solar flares and gather 18 reactor cores.",
      tip: "Solar flares sweep across lanes. Watch for the glow before they fire.",
      duration: 96,
      cores: 18,
      kills: 22,
      asteroidRate: 0.72,
      enemyRate: 1.2,
      speed: 42,
      hue: "#ffd44a",
      enemyTypes: ["scout", "darter", "turret"],
      boss: null,
      music: [220, 330, 440, 554]
    },
    {
      name: "Black Star Run",
      zone: "Void Current",
      mission: "Fly through gravity debris and shut down 24 drones.",
      tip: "Collect magnets to pull nearby cores. They do not protect you from enemy fire.",
      duration: 104,
      cores: 18,
      kills: 24,
      asteroidRate: 0.68,
      enemyRate: 1.05,
      speed: 44,
      hue: "#8a7dff",
      enemyTypes: ["darter", "mine", "turret", "heavy"],
      boss: null,
      music: [123, 185, 247, 370]
    },
    {
      name: "Starfall Siege",
      zone: "Enemy Capital",
      mission: "Destroy the Siege Engine and recover the command key.",
      tip: "Heavy fighters shoot in bursts. Move diagonally and use repair packs wisely.",
      duration: 118,
      cores: 16,
      kills: 28,
      asteroidRate: 0.7,
      enemyRate: 0.95,
      speed: 45,
      hue: "#ff2fd6",
      enemyTypes: ["turret", "shield", "heavy", "mine"],
      boss: { name: "Siege Engine", hp: 310, at: 48, color: "#ff2fd6" },
      music: [130, 164, 220, 261]
    },
    {
      name: "Odyssey Finale",
      zone: "Starfall Core",
      mission: "Defeat the Starfall Mothership and restore the route home.",
      tip: "Final mission. Every mechanic returns: rocks, drones, mines, shields, boss lasers and plasma gates.",
      duration: 140,
      cores: 20,
      kills: 32,
      asteroidRate: 0.62,
      enemyRate: 0.82,
      speed: 48,
      hue: "#36dfff",
      enemyTypes: ["scout", "darter", "turret", "shield", "heavy", "mine"],
      boss: { name: "Starfall Mothership", hp: 460, at: 52, color: "#36dfff" },
      music: [196, 247, 294, 392, 587]
    }
  ];

  const PLAYER_LIMIT = { x: 9.6, yMin: -3.2, yMax: 4.6 };
  const SAFE_LOCAL_KEY = "wga_space_dodger_starfall_odyssey_v3";

  const ASSET_PATHS = {
    backgrounds: [
      "assets/backgrounds/bg-blue-nebula.png",
      "assets/backgrounds/bg-lava-asteroid-field.png",
      "assets/backgrounds/bg-nebula-citadel.png",
      "assets/backgrounds/bg-orbital-station-ring.png",
      "assets/backgrounds/bg-crystal-comet-field.png",
      "assets/backgrounds/bg-asteroid-battlefield.png"
    ],
    player: "assets/sprites/player_ship_sheet.png",
    enemy: "assets/sprites/enemy_ship_sheet.png",
    boss: "assets/sprites/boss_mothership_sheet.png",
    asteroid: "assets/sprites/asteroid_sheet.png",
    core: "assets/sprites/star_crystal.png",
    shield: "assets/sprites/shield_pickup.png",
    time: "assets/sprites/time_pickup.png"
  };

  function levelBackgroundPath(index) {
    return ASSET_PATHS.backgrounds[index % ASSET_PATHS.backgrounds.length];
  }

  const state = {
    status: "menu",
    levelIndex: 0,
    score: 0,
    bestScore: 0,
    hull: 100,
    shield: 0,
    cores: 0,
    kills: 0,
    elapsed: 0,
    combo: 0,
    lives: 3,
    fireCooldown: 0,
    boostEnergy: 100,
    doubleLaser: 0,
    slowMo: 0,
    magnet: 0,
    plasma: 0,
    boss: null,
    levelStarted: false,
    levelCompletePending: false,
    lastScorePost: 0,
    input: { x: 0, y: 0, fire: false, boost: false },
    motion: { x: 0, y: 0 }
  };

  function canUseBabylonEngine() {
    try {
      const lib = window.BABYLON;
      if (!BABYLON_AVAILABLE || !lib || !lib.Engine) return false;
      if (typeof lib.Engine.isSupported === "function" && !lib.Engine.isSupported()) return false;

      const test = document.createElement("canvas");
      return !!(
        test.getContext("webgl2") ||
        test.getContext("webgl") ||
        test.getContext("experimental-webgl")
      );
    } catch (err) {
      return false;
    }
  }

  function startCanvasFallback() {
    const canvas = ui.canvas;
    const ctx = canvas && canvas.getContext ? canvas.getContext("2d", { alpha: false }) : null;

    if (!ctx) {
      document.body.innerHTML =
        "<div style='display:grid;place-items:center;height:100vh;background:#020510;color:white;font-family:system-ui,sans-serif;text-align:center;padding:20px'>Space Dodger cannot start because this browser does not expose WebGL or Canvas rendering.</div>";
      return;
    }

    const fb = {
      dpr: 1,
      w: 0,
      h: 0,
      last: performance.now(),
      stars: [],
      objects: [],
      shots: [],
      enemyShots: [],
      particles: [],
      keys: new Set(),
      spawnTimer: 0,
      enemyTimer: 0,
      bossTimer: 0,
      musicTimer: 0,
      musicStep: 0,
      bossActive: false,
      bossHp: 0,
      bossMax: 0,
      levelTime: 0,
      coreCount: 0,
      killCount: 0,
      gameOverShown: false
    };

    const ship = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      fire: 0,
      burst: 0
    };


    const fallbackBgImages = ASSET_PATHS.backgrounds.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });

    function loadFallbackSprite(src) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      return img;
    }

    const fallbackSprites = {
      player: loadFallbackSprite(ASSET_PATHS.player),
      enemy: loadFallbackSprite(ASSET_PATHS.enemy),
      boss: loadFallbackSprite(ASSET_PATHS.boss),
      asteroid: loadFallbackSprite(ASSET_PATHS.asteroid),
      core: loadFallbackSprite(ASSET_PATHS.core),
      shield: loadFallbackSprite(ASSET_PATHS.shield),
      time: loadFallbackSprite(ASSET_PATHS.time)
    };

    function fallbackAssetReady(image) {
      return !!(image && image.complete && image.naturalWidth && image.naturalHeight);
    }

    function drawImageCover(image, x, y, w, h) {
      const iw = image.naturalWidth || image.width || 1;
      const ih = image.naturalHeight || image.height || 1;
      const scale = Math.max(w / iw, h / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    }

    function drawFallbackSprite(image, frame, x, y, w, h, rotation = 0, glowColor = null, glow = 18) {
      if (!fallbackAssetReady(image)) return false;
      const grid = image.naturalWidth > 700 || image.naturalHeight > 700 ? 2 : 1;
      const frameCount = grid * grid;
      const safeFrame = Math.max(0, Math.floor(frame || 0)) % frameCount;
      const col = safeFrame % grid;
      const row = Math.floor(safeFrame / grid);
      const sw = image.naturalWidth / grid;
      const sh = image.naturalHeight / grid;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      if (glowColor) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glow;
      }
      ctx.drawImage(image, col * sw, row * sh, sw, sh, -w / 2, -h / 2, w, h);
      ctx.restore();
      return true;
    }

    function postFallbackScore() {
      const payloads = [
        { type: "GG_SCORE", score: Math.max(0, Math.floor(state.score)), game: "space-dodger-starfall-odyssey" },
        { type: "gg:score", score: Math.max(0, Math.floor(state.score)), slug: "space-dodger-starfall-odyssey" }
      ];
      try {
        payloads.forEach((payload) => window.parent && window.parent.postMessage(payload, "*"));
      } catch (err) {}
    }

    const fallbackAudio = {
      ctx: null,
      muted: false,
      ensure() {
        if (this.ctx || this.muted) return;
        try {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (err) {
          this.muted = true;
        }
      },
      beep(freq = 440, duration = 0.08, type = "sine", gain = 0.035) {
        if (!this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const amp = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        amp.gain.setValueAtTime(gain, now);
        amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
        osc.connect(amp).connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      },
      boom() {
        this.beep(82, 0.18, "sawtooth", 0.05);
        setTimeout(() => this.beep(48, 0.2, "triangle", 0.035), 35);
      },
      music(dt) {
        if (!this.ctx || state.status !== "playing") return;
        fb.musicTimer -= dt;
        if (fb.musicTimer > 0) return;
        const lvl = LEVELS[state.levelIndex];
        const notes = lvl.music || [196, 247, 294, 392];
        const note = notes[fb.musicStep % notes.length];
        this.beep(note * 0.5, 0.16, "triangle", 0.012);
        if (state.combo >= 6) this.beep(note, 0.08, "sine", 0.01);
        fb.musicStep += 1;
        fb.musicTimer = state.combo >= 10 ? 0.22 : 0.32;
      }
    };

    function resizeFallback() {
      fb.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const rect = canvas.getBoundingClientRect();
      fb.w = Math.max(320, rect.width || window.innerWidth);
      fb.h = Math.max(420, rect.height || window.innerHeight);
      canvas.width = Math.floor(fb.w * fb.dpr);
      canvas.height = Math.floor(fb.h * fb.dpr);
      ctx.setTransform(fb.dpr, 0, 0, fb.dpr, 0, 0);
      ship.x = fb.w * 0.5;
      ship.y = fb.h * 0.78;
      buildStars();
    }

    function buildStars() {
      fb.stars = [];
      for (let i = 0; i < 150; i += 1) {
        fb.stars.push({
          x: Math.random() * fb.w,
          y: Math.random() * fb.h,
          z: Math.random() * 1 + 0.2,
          r: Math.random() * 1.7 + 0.3
        });
      }
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function currentLevel() {
      return LEVELS[state.levelIndex] || LEVELS[0];
    }

    function resetRunStats() {
      state.hull = 100;
      state.shield = 0;
      state.cores = 0;
      state.kills = 0;
      state.elapsed = 0;
      state.combo = 0;
      state.boostEnergy = 100;
      state.doubleLaser = 0;
      state.slowMo = 0;
      state.magnet = 0;
      state.plasma = 0;
      fb.coreCount = 0;
      fb.killCount = 0;
      fb.levelTime = 0;
      fb.spawnTimer = 0.2;
      fb.enemyTimer = 1.2;
      fb.bossTimer = 0;
      fb.bossActive = false;
      fb.bossHp = 0;
      fb.bossMax = 0;
      fb.objects = [];
      fb.shots = [];
      fb.enemyShots = [];
      fb.particles = [];
      ship.x = fb.w * 0.5;
      ship.y = fb.h * 0.78;
      ship.vx = 0;
      ship.vy = 0;
      ship.fire = 0;
    }

    function updateUIFallback() {
      const lvl = currentLevel();
      const progress = Math.min(1, state.elapsed / Math.max(1, lvl.duration));
      ui.scoreText.textContent = String(Math.max(0, Math.floor(state.score)));
      ui.levelText.textContent = `${state.levelIndex + 1}/${LEVELS.length}`;
      ui.hullText.textContent = `${Math.max(0, Math.round(state.hull))}%`;
      ui.shieldText.textContent = `${Math.max(0, Math.round(state.shield))}%`;
      ui.missionTitle.textContent = `${lvl.name} — ${lvl.zone}`;
      ui.missionText.textContent =
        `Fallback 2D mode: ${fb.coreCount}/${lvl.cores} cores • ${fb.killCount}/${lvl.kills} enemies • ${Math.round(progress * 100)}% route`;
      ui.missionMeter.style.width = `${Math.round(progress * 100)}%`;
      ui.mentorText.textContent = lvl.tip;
      if (fb.bossActive) {
        ui.bossPanel.classList.remove("hidden");
        ui.bossName.textContent = lvl.boss ? lvl.boss.name : "Boss";
        ui.bossBar.style.width = `${Math.max(0, Math.round((fb.bossHp / Math.max(1, fb.bossMax)) * 100))}%`;
      } else {
        ui.bossPanel.classList.add("hidden");
      }
    }

    function showToastFallback(text) {
      ui.toast.textContent = text;
      ui.toast.classList.remove("hidden");
      clearTimeout(ui.toast._fallbackTimer);
      ui.toast._fallbackTimer = setTimeout(() => ui.toast.classList.add("hidden"), 1700);
    }

    function startGameFallback(fresh = false) {
      fallbackAudio.ensure();
      if (fresh) {
        state.levelIndex = 0;
        state.score = 0;
        state.lives = 3;
      }
      state.status = "playing";
      state.levelCompletePending = false;
      ui.startOverlay.classList.add("hidden");
      ui.gameOverOverlay.classList.add("hidden");
      resetRunStats();
      const lvl = currentLevel();
      showToastFallback(`Fallback mode active — ${lvl.name}`);
      updateUIFallback();
    }

    function retryFallback() {
      fallbackAudio.ensure();
      state.status = "playing";
      ui.gameOverOverlay.classList.add("hidden");
      resetRunStats();
      updateUIFallback();
    }

    function endFallback(win) {
      state.status = "ended";
      postFallbackScore();
      ui.gameOverOverlay.classList.remove("hidden");
      $("endKicker").textContent = win ? "Odyssey Report" : "Mission Failed";
      $("endTitle").textContent = win ? "Starfall Route Restored" : "Ship Reboot Required";
      $("endText").textContent = win
        ? `Final score: ${Math.floor(state.score)}. Your score was sent to WebGameArena.`
        : `Score: ${Math.floor(state.score)}. Retry this mission or restart the Odyssey.`;
    }

    function nextLevelFallback() {
      fallbackAudio.beep(784, 0.16, "triangle", 0.045);
      postFallbackScore();
      state.score += 900 + state.levelIndex * 120;
      if (state.levelIndex >= LEVELS.length - 1) {
        endFallback(true);
        return;
      }
      state.levelIndex += 1;
      resetRunStats();
      showToastFallback(`Mission ${state.levelIndex + 1}: ${currentLevel().name}`);
      updateUIFallback();
    }

    function damageFallback(amount) {
      if (state.shield > 0) {
        state.shield = Math.max(0, state.shield - amount * 1.25);
        fallbackAudio.beep(220, 0.08, "triangle", 0.03);
        return;
      }
      state.hull -= amount;
      state.combo = 0;
      fallbackAudio.beep(92, 0.12, "sawtooth", 0.04);
      if (state.hull <= 0) {
        state.lives -= 1;
        if (state.lives <= 0) {
          endFallback(false);
        } else {
          state.hull = 100;
          state.shield = 30;
          showToastFallback(`Circuit rebooted. Lives left: ${state.lives}`);
        }
      }
    }

    function addParticles(x, y, color, count = 12) {
      for (let i = 0; i < count; i += 1) {
        fb.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 280,
          vy: (Math.random() - 0.5) * 260,
          life: 0.45 + Math.random() * 0.35,
          color,
          r: 2 + Math.random() * 4
        });
      }
    }

    function spawnObject(kind) {
      const lvl = currentLevel();
      const lane = Math.floor(Math.random() * 5) - 2;
      const x = fb.w * 0.5 + lane * Math.min(120, fb.w * 0.16) + (Math.random() - 0.5) * 70;
      const base = {
        kind,
        x,
        y: -60,
        vx: (Math.random() - 0.5) * 60,
        vy: (lvl.speed * 4.8) + Math.random() * 100,
        r: 22,
        hp: 1,
        fire: 1.0 + Math.random() * 1.2,
        color: lvl.hue,
        frame: Math.floor(Math.random() * 4),
        spin: (Math.random() - 0.5) * 1.15
      };

      if (kind === "core") Object.assign(base, { r: 18, color: "#ffd44a", frame: 0 });
      if (kind === "power") {
        const powerType = ["shield", "double", "slow", "magnet", "plasma"][Math.floor(Math.random() * 5)];
        const powerColor = powerType === "shield" ? "#64ffb8" : powerType === "slow" ? "#36dfff" : powerType === "plasma" ? "#ff2fd6" : "#ffd44a";
        Object.assign(base, { r: 19, color: powerColor, powerType, frame: powerType === "slow" ? 0 : powerType === "shield" ? 0 : 0 });
      }
      if (kind === "mine") Object.assign(base, { r: 22, hp: 1, color: "#ff315a", frame: 3 });
      if (kind === "asteroid") Object.assign(base, { r: 24 + Math.random() * 22, hp: 2, color: "#8a7dff", frame: Math.floor(Math.random() * 4) });
      if (kind === "enemy") Object.assign(base, { r: 26, hp: 2 + Math.floor(state.levelIndex / 3), color: "#ff784a", frame: Math.floor(Math.random() * 4) });
      if (kind === "heavy") Object.assign(base, { r: 34, hp: 5 + Math.floor(state.levelIndex / 2), color: "#ff315a", frame: 3 });

      fb.objects.push(base);
    }

    function spawnBossFallback() {
      const lvl = currentLevel();
      if (!lvl.boss || fb.bossActive) return;
      fb.bossActive = true;
      fb.bossMax = lvl.boss.hp;
      fb.bossHp = lvl.boss.hp;
      fb.objects.push({
        kind: "boss",
        x: fb.w * 0.5,
        y: 120,
        vx: 120,
        vy: 0,
        r: 74,
        hp: lvl.boss.hp,
        fire: 0.65,
        color: lvl.boss.color || lvl.hue
      });
      showToastFallback(`${lvl.boss.name} detected`);
      fallbackAudio.boom();
    }

    function fireFallback() {
      if (ship.fire > 0 || state.status !== "playing") return;
      const spread = state.doubleLaser > 0 ? [-14, 14] : [0];
      spread.forEach((offset) => {
        fb.shots.push({ x: ship.x + offset, y: ship.y - 36, vy: -780, r: 6, color: "#36dfff", damage: state.plasma > 0 ? 3 : 1 });
      });
      ship.fire = state.doubleLaser > 0 ? 0.12 : 0.18;
      fallbackAudio.beep(680, 0.055, "square", 0.02);
    }

    function updateFallback(dt) {
      if (state.status !== "playing") return;

      const lvl = currentLevel();
      state.elapsed += dt * (state.slowMo > 0 ? 0.65 : 1);
      fb.levelTime += dt;
      state.doubleLaser = Math.max(0, state.doubleLaser - dt);
      state.slowMo = Math.max(0, state.slowMo - dt);
      state.magnet = Math.max(0, state.magnet - dt);
      state.plasma = Math.max(0, state.plasma - dt);
      ship.fire = Math.max(0, ship.fire - dt);

      const boost = (state.input.boost && state.boostEnergy > 4) ? 1.55 : 1;
      if (boost > 1) state.boostEnergy = Math.max(0, state.boostEnergy - dt * 30);
      else state.boostEnergy = Math.min(100, state.boostEnergy + dt * 12);

      const moveX = state.input.x || 0;
      const moveY = state.input.y || 0;
      ship.vx += moveX * 1700 * dt;
      ship.vy += -moveY * 1300 * dt;
      ship.vx *= Math.pow(0.0009, dt);
      ship.vy *= Math.pow(0.0015, dt);
      ship.x = clamp(ship.x + ship.vx * dt * boost, 52, fb.w - 52);
      ship.y = clamp(ship.y + ship.vy * dt * boost, fb.h * 0.22, fb.h - 84);

      if (state.input.fire) fireFallback();

      fb.spawnTimer -= dt;
      if (fb.spawnTimer <= 0) {
        const roll = Math.random();
        if (roll < 0.25) spawnObject("core");
        else if (roll < 0.36) spawnObject("power");
        else if (roll < 0.66) spawnObject("asteroid");
        else if (roll < 0.84) spawnObject("mine");
        else spawnObject("enemy");
        fb.spawnTimer = Math.max(0.24, (lvl.asteroidRate || 1) * (0.72 - state.levelIndex * 0.025));
      }

      fb.enemyTimer -= dt;
      if (fb.enemyTimer <= 0) {
        spawnObject(state.levelIndex > 8 && Math.random() > 0.55 ? "heavy" : "enemy");
        fb.enemyTimer = Math.max(0.55, (lvl.enemyRate || 2) * (0.82 - state.levelIndex * 0.025));
      }

      if (lvl.boss && !fb.bossActive && state.elapsed >= (lvl.boss.at || lvl.duration * 0.5)) spawnBossFallback();

      fb.shots.forEach((s) => { s.y += s.vy * dt; });
      fb.enemyShots.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; });

      fb.objects.forEach((o) => {
        if (o.kind === "boss") {
          o.x += o.vx * dt;
          if (o.x < 120 || o.x > fb.w - 120) o.vx *= -1;
          o.fire -= dt;
          if (o.fire <= 0) {
            for (let i = -1; i <= 1; i += 1) {
              fb.enemyShots.push({ x: o.x + i * 34, y: o.y + 50, vx: i * 65, vy: 280 + state.levelIndex * 18, r: 7, color: o.color });
            }
            o.fire = Math.max(0.32, 0.82 - state.levelIndex * 0.035);
            fallbackAudio.beep(160, 0.08, "sawtooth", 0.018);
          }
        } else {
          o.x += o.vx * dt;
          o.y += o.vy * dt * (state.slowMo > 0 ? 0.62 : 1);
          if ((o.kind === "enemy" || o.kind === "heavy") && o.y > 60) {
            o.fire -= dt;
            if (o.fire <= 0) {
              fb.enemyShots.push({ x: o.x, y: o.y + o.r, vx: (ship.x - o.x) * 0.18, vy: 300 + state.levelIndex * 14, r: 6, color: "#ff784a" });
              o.fire = Math.max(0.48, 1.1 - state.levelIndex * 0.035);
            }
          }
          if (state.magnet > 0 && o.kind === "core") {
            o.x += (ship.x - o.x) * dt * 2.4;
            o.y += (ship.y - o.y) * dt * 1.4;
          }
        }
      });

      // Shot collisions
      fb.shots.forEach((shot) => {
        fb.objects.forEach((o) => {
          if (o._dead || shot._dead) return;
          if (!["asteroid", "mine", "enemy", "heavy", "boss"].includes(o.kind)) return;
          const dx = shot.x - o.x;
          const dy = shot.y - o.y;
          if (dx * dx + dy * dy < (shot.r + o.r) * (shot.r + o.r)) {
            shot._dead = true;
            o.hp -= shot.damage;
            addParticles(shot.x, shot.y, o.color, 6);
            if (o.kind === "boss") fb.bossHp = Math.max(0, fb.bossHp - shot.damage * 7);
            if (o.hp <= 0 || (o.kind === "boss" && fb.bossHp <= 0)) {
              o._dead = true;
              state.score += o.kind === "boss" ? 3000 : 160 + state.combo * 5;
              state.combo += 1;
              if (o.kind !== "asteroid" && o.kind !== "mine") {
                fb.killCount += 1;
                state.kills = fb.killCount;
              }
              if (o.kind === "boss") {
                fb.bossActive = false;
                fallbackAudio.boom();
                showToastFallback("Boss defeated");
              } else {
                fallbackAudio.beep(520 + state.combo * 10, 0.07, "triangle", 0.025);
              }
              addParticles(o.x, o.y, o.color, o.kind === "boss" ? 35 : 16);
            }
          }
        });
      });

      // Player collisions
      fb.objects.forEach((o) => {
        if (o._dead) return;
        if (o.kind === "boss") return;
        const dx = ship.x - o.x;
        const dy = ship.y - o.y;
        if (dx * dx + dy * dy < (o.r + 26) * (o.r + 26)) {
          o._dead = true;
          if (o.kind === "core") {
            fb.coreCount += 1;
            state.cores = fb.coreCount;
            state.score += 120 + state.combo * 6;
            state.combo += 1;
            fallbackAudio.beep(780 + state.combo * 8, 0.07, "sine", 0.03);
            addParticles(o.x, o.y, "#ffd44a", 12);
          } else if (o.kind === "power") {
            const p = o.powerType || "shield";
            if (p === "shield") state.shield = Math.min(100, state.shield + 45);
            if (p === "double") state.doubleLaser = 10;
            if (p === "slow") state.slowMo = 8;
            if (p === "magnet") state.magnet = 10;
            if (p === "plasma") state.plasma = 8;
            state.score += 180;
            fallbackAudio.beep(920, 0.11, "triangle", 0.035);
            showToastFallback(`${p.toUpperCase()} power-up`);
          } else {
            damageFallback(o.kind === "mine" ? 28 : o.kind === "heavy" ? 30 : 18);
            addParticles(o.x, o.y, o.color, 18);
          }
        }
      });

      fb.enemyShots.forEach((s) => {
        if (s._dead) return;
        const dx = ship.x - s.x;
        const dy = ship.y - s.y;
        if (dx * dx + dy * dy < (s.r + 22) * (s.r + 22)) {
          s._dead = true;
          damageFallback(12);
          addParticles(s.x, s.y, s.color, 10);
        }
      });

      fb.particles.forEach((p) => {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= Math.pow(0.08, dt);
        p.vy *= Math.pow(0.08, dt);
      });

      fb.objects = fb.objects.filter((o) => !o._dead && o.y < fb.h + 120);
      fb.shots = fb.shots.filter((s) => !s._dead && s.y > -60);
      fb.enemyShots = fb.enemyShots.filter((s) => !s._dead && s.y < fb.h + 80);
      fb.particles = fb.particles.filter((p) => p.life > 0);

      const routeComplete = state.elapsed >= lvl.duration;
      const goalsComplete = fb.coreCount >= lvl.cores && fb.killCount >= lvl.kills;
      if (routeComplete && goalsComplete && !fb.bossActive && !fb.objects.some((o) => o.kind === "boss")) {
        nextLevelFallback();
      }

      updateUIFallback();
      fallbackAudio.music(dt);
    }

    function drawFallback() {
      const lvl = currentLevel();
      ctx.clearRect(0, 0, fb.w, fb.h);

      const image = fallbackBgImages[state.levelIndex % fallbackBgImages.length];
      if (image && image.complete && image.naturalWidth) {
        drawImageCover(image, 0, 0, fb.w, fb.h);
        const shade = ctx.createLinearGradient(0, 0, 0, fb.h);
        shade.addColorStop(0, "rgba(2,5,16,0.22)");
        shade.addColorStop(0.48, "rgba(5,8,24,0.18)");
        shade.addColorStop(1, "rgba(2,5,16,0.68)");
        ctx.fillStyle = shade;
        ctx.fillRect(0, 0, fb.w, fb.h);
      } else {
        const bg = ctx.createLinearGradient(0, 0, fb.w, fb.h);
        bg.addColorStop(0, "#020510");
        bg.addColorStop(0.45, "#0b1640");
        bg.addColorStop(1, "#180626");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, fb.w, fb.h);
      }

      fb.stars.forEach((s) => {
        s.y += (0.25 + s.z) * (state.status === "playing" ? 0.8 : 0.2);
        if (s.y > fb.h) { s.y = -4; s.x = Math.random() * fb.w; }
        ctx.globalAlpha = 0.45 + s.z * 0.4;
        ctx.fillStyle = s.z > 0.8 ? "#ffffff" : lvl.hue;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Cinematic fallback: no grid lines, only moving stars and background art.
      const cx = fb.w * 0.5;
      const horizon = fb.h * 0.34;
      ctx.save();
      ctx.globalAlpha = 0.28;
      for (let i = 0; i < 18; i += 1) {
        const a = (i / 18) * Math.PI * 2 + performance.now() * 0.00015;
        const len = fb.w * (0.08 + (i % 5) * 0.018);
        const x = cx + Math.cos(a) * fb.w * 0.34;
        const y = horizon + Math.sin(a) * fb.h * 0.18;
        ctx.strokeStyle = lvl.hue;
        ctx.lineWidth = 1 + (i % 3);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len * 0.35);
        ctx.stroke();
      }
      ctx.restore();

      fb.objects.forEach(drawObjectFallback);
      fb.shots.forEach((s) => drawGlowCircle(s.x, s.y, s.r, s.color, 14));
      fb.enemyShots.forEach((s) => drawGlowCircle(s.x, s.y, s.r, s.color, 12));
      drawShipFallback();

      fb.particles.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life);
        drawGlowCircle(p.x, p.y, p.r, p.color, 10);
      });
      ctx.globalAlpha = 1;

      if (state.status !== "playing") {
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = lvl.hue;
        ctx.font = `900 ${Math.max(40, fb.w * 0.07)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("STARFALL ODYSSEY", fb.w * 0.5, fb.h * 0.52);
        ctx.restore();
      }
    }

    function drawGlowCircle(x, y, r, color, blur = 16) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawObjectFallback(o) {
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.shadowColor = o.color;
      ctx.shadowBlur = 16;

      const t = performance.now() * 0.001;
      const angle = (o.spin || 0) * t;
      if (o.kind === "core" && drawFallbackSprite(fallbackSprites.core, 0, 0, 0, o.r * 3.15, o.r * 3.15, angle, "#ffd44a", 22)) {
        ctx.restore();
        return;
      }
      if (o.kind === "power") {
        const img = o.powerType === "slow" ? fallbackSprites.time : o.powerType === "shield" ? fallbackSprites.shield : fallbackSprites.core;
        if (drawFallbackSprite(img, 0, 0, 0, o.r * 3.25, o.r * 3.25, angle, o.color, 22)) {
          ctx.restore();
          return;
        }
      }
      if ((o.kind === "asteroid" || o.kind === "mine") && drawFallbackSprite(fallbackSprites.asteroid, o.frame || 0, 0, 0, o.r * 2.9, o.r * 2.45, angle, o.color, 20)) {
        ctx.restore();
        return;
      }
      if ((o.kind === "enemy" || o.kind === "heavy") && drawFallbackSprite(fallbackSprites.enemy, o.frame || 0, 0, 0, o.r * 3.25, o.r * 2.6, Math.PI, o.color, 22)) {
        ctx.restore();
        return;
      }
      if (o.kind === "boss" && drawFallbackSprite(fallbackSprites.boss, Math.min(3, state.levelIndex % 4), 0, 0, Math.min(260, o.r * 4.1), Math.min(190, o.r * 2.8), Math.PI, o.color, 30)) {
        ctx.restore();
        return;
      }

      if (o.kind === "core") {
        ctx.fillStyle = "#ffd44a";
        ctx.beginPath();
        ctx.arc(0, 0, o.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffffcc";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (o.kind === "power") {
        ctx.fillStyle = o.color;
        ctx.beginPath();
        ctx.moveTo(0, -o.r);
        ctx.lineTo(o.r, 0);
        ctx.lineTo(0, o.r);
        ctx.lineTo(-o.r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 14px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("+", 0, 5);
      } else if (o.kind === "boss") {
        ctx.fillStyle = "#071025";
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 4;
        roundRect(ctx, -90, -45, 180, 90, 18);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = o.color;
        ctx.beginPath();
        ctx.arc(-40, 0, 13, 0, Math.PI * 2);
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.arc(40, 0, 13, 0, Math.PI * 2);
        ctx.fill();
      } else if (o.kind === "enemy" || o.kind === "heavy") {
        ctx.fillStyle = "#071025";
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -o.r);
        ctx.lineTo(o.r * 1.2, o.r * 0.9);
        ctx.lineTo(0, o.r * 0.45);
        ctx.lineTo(-o.r * 1.2, o.r * 0.9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        drawGlowCircle(0, 2, o.r * 0.23, o.color, 12);
      } else if (o.kind === "mine") {
        ctx.strokeStyle = "#ff315a";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, o.r, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 8; i += 1) {
          const a = i * Math.PI / 4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * o.r, Math.sin(a) * o.r);
          ctx.lineTo(Math.cos(a) * (o.r + 12), Math.sin(a) * (o.r + 12));
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = "#5a5f7f";
        ctx.strokeStyle = "#b46aff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 9; i += 1) {
          const a = i * Math.PI * 2 / 9;
          const rr = o.r * (0.75 + (i % 2) * 0.3);
          const px = Math.cos(a) * rr;
          const py = Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawShipFallback() {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      const lean = clamp(ship.vx / 850, -0.28, 0.28);
      ctx.rotate(lean);
      const frame = Math.abs(lean) > 0.16 ? (lean > 0 ? 1 : 2) : (state.input.boost ? 3 : 0);
      if (drawFallbackSprite(fallbackSprites.player, frame, 0, 0, 116, 116, Math.PI, "#36dfff", 26)) {
        // ctx.fillStyle = state.input.boost ? "#ffd44a" : "#36dfff";
        // ctx.shadowColor = ctx.fillStyle;
        // ctx.shadowBlur = 18;
        // ctx.beginPath();
        // ctx.moveTo(-14, 42);
        // ctx.lineTo(0, 72 + Math.sin(performance.now() * 0.02) * 12);
        // ctx.lineTo(14, 42);
        // ctx.closePath();
        // ctx.fill();
        ctx.restore();
        return;
      }
      ctx.shadowColor = "#36dfff";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#eaf7ff";
      ctx.strokeStyle = "#36dfff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(36, 38);
      ctx.lineTo(0, 22);
      ctx.lineTo(-36, 38);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#071025";
      roundRect(ctx, -18, -12, 36, 24, 8);
      ctx.fill();
      // ctx.fillStyle = "#ffd44a";
      // ctx.beginPath();
      // ctx.moveTo(-14, 34);
      // ctx.lineTo(0, 62 + Math.sin(performance.now() * 0.02) * 10);
      // ctx.lineTo(14, 34);
      // ctx.closePath();
      // ctx.fill();
      ctx.restore();
    }

    function roundRect(context, x, y, w, h, r) {
      context.beginPath();
      context.moveTo(x + r, y);
      context.lineTo(x + w - r, y);
      context.quadraticCurveTo(x + w, y, x + w, y + r);
      context.lineTo(x + w, y + h - r);
      context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      context.lineTo(x + r, y + h);
      context.quadraticCurveTo(x, y + h, x, y + h - r);
      context.lineTo(x, y + r);
      context.quadraticCurveTo(x, y, x + r, y);
      context.closePath();
    }

    function loopFallback(now) {
      const dt = Math.min(0.033, (now - fb.last) / 1000 || 0);
      fb.last = now;
      updateFallback(dt);
      drawFallback();
      requestAnimationFrame(loopFallback);
    }

    function setInputFromKey(key, on) {
      if (key === "ArrowLeft" || key.toLowerCase() === "a") state.input.x = on ? -1 : (state.input.x < 0 ? 0 : state.input.x);
      if (key === "ArrowRight" || key.toLowerCase() === "d") state.input.x = on ? 1 : (state.input.x > 0 ? 0 : state.input.x);
      if (key === "ArrowUp" || key.toLowerCase() === "w") state.input.y = on ? 1 : (state.input.y > 0 ? 0 : state.input.y);
      if (key === "ArrowDown" || key.toLowerCase() === "s") state.input.y = on ? -1 : (state.input.y < 0 ? 0 : state.input.y);
      if (key === " " || key === "Spacebar") state.input.fire = on;
      if (key === "Shift") state.input.boost = on;
    }

    document.addEventListener("keydown", (e) => {
      fallbackAudio.ensure();
      setInputFromKey(e.key, true);
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Spacebar", "Shift"].includes(e.key)) e.preventDefault();
    });
    document.addEventListener("keyup", (e) => setInputFromKey(e.key, false));

    document.querySelectorAll("[data-dir]").forEach((btn) => {
      const dir = btn.dataset.dir;
      const set = (on) => {
        if (dir === "left") state.input.x = on ? -1 : (state.input.x < 0 ? 0 : state.input.x);
        if (dir === "right") state.input.x = on ? 1 : (state.input.x > 0 ? 0 : state.input.x);
        if (dir === "up") state.input.y = on ? 1 : (state.input.y > 0 ? 0 : state.input.y);
        if (dir === "down") state.input.y = on ? -1 : (state.input.y < 0 ? 0 : state.input.y);
      };
      btn.addEventListener("pointerdown", (e) => { e.preventDefault(); fallbackAudio.ensure(); set(true); });
      btn.addEventListener("pointerup", () => set(false));
      btn.addEventListener("pointercancel", () => set(false));
      btn.addEventListener("pointerleave", () => set(false));
    });

    ui.fireBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); fallbackAudio.ensure(); state.input.fire = true; });
    ui.fireBtn.addEventListener("pointerup", () => { state.input.fire = false; });
    ui.fireBtn.addEventListener("pointercancel", () => { state.input.fire = false; });
    ui.fireBtn.addEventListener("pointerleave", () => { state.input.fire = false; });

    ui.boostBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); fallbackAudio.ensure(); state.input.boost = true; });
    ui.boostBtn.addEventListener("pointerup", () => { state.input.boost = false; });
    ui.boostBtn.addEventListener("pointercancel", () => { state.input.boost = false; });
    ui.boostBtn.addEventListener("pointerleave", () => { state.input.boost = false; });

    ui.startBtn.addEventListener("click", () => startGameFallback(true));
    ui.retryBtn.addEventListener("click", () => retryFallback());
    ui.restartBtn.addEventListener("click", () => startGameFallback(true));
    ui.howBtn.addEventListener("click", () => ui.help.classList.toggle("visible"));

    ui.mentorText.textContent = "WebGL is not available on this device/browser, so Space Dodger loaded the 2D fallback mode automatically.";
    ui.missionTitle.textContent = "Fallback Flight Mode";
    ui.missionText.textContent = "The game will still run, with the same levels, enemies, shooting, bosses and score bridge.";
    ui.missionMeter.style.width = "0%";

    resizeFallback();
    window.addEventListener("resize", resizeFallback);
    requestAnimationFrame(loopFallback);
  }

  if (!canUseBabylonEngine()) {
    startCanvasFallback();
    return;
  }

  const engine = new BABYLON.Engine(ui.canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    antialias: true,
    adaptToDeviceRatio: true
  });
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.005, 0.01, 0.035, 1);
  scene.collisionsEnabled = false;

  const camera = new BABYLON.UniversalCamera("pilotCamera", new BABYLON.Vector3(0, 2.15, -13.5), scene);
  // True 3D chase view: the player sits near the camera while hazards arrive from deep space.
  camera.setTarget(new BABYLON.Vector3(0, 0.75, 64));
  camera.fov = 0.92;
  camera.minZ = 0.05;
  camera.maxZ = 520;

  const light = new BABYLON.HemisphericLight("softSpaceLight", new BABYLON.Vector3(0.2, 1, -0.4), scene);
  light.intensity = 0.78;

  const pointLight = new BABYLON.PointLight("engineGlowLight", new BABYLON.Vector3(0, 0, -4), scene);
  pointLight.diffuse = BABYLON.Color3.FromHexString("#36dfff");
  pointLight.intensity = 0.8;

  const mats = {};
  function makeMat(name, hex, emissive = 0.35, alpha = 1) {
    const mat = new BABYLON.StandardMaterial(name, scene);
    const color = BABYLON.Color3.FromHexString(hex);
    mat.diffuseColor = color.scale(0.8);
    mat.specularColor = BABYLON.Color3.White().scale(0.22);
    mat.emissiveColor = color.scale(emissive);
    mat.alpha = alpha;
    mats[name] = mat;
    return mat;
  }

  makeMat("shipWhite", "#eaf3ff", 0.12);
  makeMat("shipDark", "#10192f", 0.1);
  makeMat("shipRed", "#ff315a", 0.55);
  makeMat("cyanGlow", "#36dfff", 0.8);
  makeMat("pinkGlow", "#ff2fd6", 0.9);
  makeMat("goldGlow", "#ffd44a", 0.85);
  makeMat("greenGlow", "#64ffb8", 0.75);
  makeMat("enemyDark", "#11182c", 0.18);
  makeMat("enemyRed", "#ff315a", 0.8);
  makeMat("asteroid", "#5d5365", 0.08);
  makeMat("asteroidHot", "#ff784a", 0.55);
  makeMat("transparentCyan", "#36dfff", 0.9, 0.26);
  makeMat("transparentPink", "#ff2fd6", 0.9, 0.26);
  makeMat("planetBlue", "#3c8dff", 0.42);
  makeMat("planetRed", "#ff5a34", 0.52);
  makeMat("planetViolet", "#8a7dff", 0.48);
  makeMat("planetIce", "#69f1ff", 0.5);
  makeMat("deepShadow", "#050812", 0.02);
  makeMat("warpStreak", "#36dfff", 0.92, 0.55);

  const pools = {
    objects: [],
    lasers: [],
    enemyLasers: [],
    particles: [],
    stars: []
  };

  let playerRoot;
  let engineTrail;
  let starParent;
  let tunnelParent;
  let backgroundRoot;
  let backgroundLayers = [];
  let planetParent;
  let planetMeshes = [];
  let warpStreaks = [];
  let playerSprite = null;
  const spriteManagers = {};
  let rngSeed = 42;

  function rand() {
    rngSeed = (rngSeed * 1664525 + 1013904223) >>> 0;
    return rngSeed / 4294967296;
  }

  function randRange(min, max) {
    return min + rand() * (max - min);
  }

  function choose(arr) {
    return arr[Math.floor(rand() * arr.length)];
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function vecDistance2D(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function safeLoad() {
    try {
      const raw = localStorage.getItem(SAFE_LOCAL_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (Number.isFinite(data.bestScore)) state.bestScore = data.bestScore;
    } catch {
      state.bestScore = 0;
    }
  }

  function safeSave() {
    try {
      localStorage.setItem(SAFE_LOCAL_KEY, JSON.stringify({ bestScore: state.bestScore }));
    } catch {
      // Embedded browsers may block storage; gameplay should continue.
    }
  }

  function postScore(final = false) {
    const score = Math.max(0, Math.floor(state.score));
    if (!final && Math.abs(score - state.lastScorePost) < 200) return;
    state.lastScorePost = score;
    try {
      window.parent?.postMessage({ type: "GG_SCORE", score, final, game: "space-dodger-starfall-odyssey" }, "*");
      window.parent?.postMessage({ type: "gg:score", score, final, slug: "space-dodger-starfall-odyssey" }, "*");
    } catch {
      // Ignore cross-frame restrictions.
    }
  }

  function showToast(text) {
    ui.toast.textContent = text;
    ui.toast.classList.remove("hidden");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => ui.toast.classList.add("hidden"), 1300);
  }

  function createPlayer() {
    ensureSpriteManagers();
    const root = new BABYLON.TransformNode("playerRoot", scene);

    const body = BABYLON.MeshBuilder.CreateBox("playerBody", { width: 1.35, height: 0.36, depth: 2.45 }, scene);
    body.material = mats.shipWhite;
    body.parent = root;
    body.position.z = 0.05;

    const cockpit = BABYLON.MeshBuilder.CreateSphere("playerCockpit", { diameterX: 0.72, diameterY: 0.28, diameterZ: 0.86, segments: 24 }, scene);
    cockpit.material = mats.shipDark;
    cockpit.parent = root;
    cockpit.position.set(0, 0.23, -0.2);

    const nose = BABYLON.MeshBuilder.CreateCylinder("playerNose", { height: 1.15, diameterTop: 0, diameterBottom: 0.78, tessellation: 4 }, scene);
    nose.rotation.x = Math.PI / 2;
    nose.rotation.y = Math.PI / 4;
    nose.material = mats.shipWhite;
    nose.parent = root;
    nose.position.z = 1.55;

    const leftWing = BABYLON.MeshBuilder.CreateBox("leftWing", { width: 1.5, height: 0.12, depth: 1.2 }, scene);
    leftWing.material = mats.shipRed;
    leftWing.parent = root;
    leftWing.position.set(-1.0, -0.05, -0.1);
    leftWing.rotation.z = -0.18;

    const rightWing = leftWing.clone("rightWing");
    rightWing.parent = root;
    rightWing.position.x = 1.0;
    rightWing.rotation.z = 0.18;

    const engineL = BABYLON.MeshBuilder.CreateCylinder("engineL", { height: 0.55, diameter: 0.34, tessellation: 18 }, scene);
    engineL.rotation.x = Math.PI / 2;
    engineL.material = mats.cyanGlow;
    engineL.parent = root;
    engineL.position.set(-0.42, 0, -1.32);

    const engineR = engineL.clone("engineR");
    engineR.parent = root;
    engineR.position.x = 0.42;

    const shieldRing = BABYLON.MeshBuilder.CreateTorus("playerShieldRing", { majorRadius: 1.35, minorRadius: 0.025, tessellation: 48 }, scene);
    shieldRing.material = mats.transparentCyan;
    shieldRing.parent = root;
    shieldRing.rotation.x = Math.PI / 2;
    shieldRing.isVisible = false;
    root.shieldRing = shieldRing;

    const trail = new BABYLON.ParticleSystem("engineTrail", 650, scene);
    const tex = new BABYLON.DynamicTexture("sparkTexture", { width: 64, height: 64 }, scene, false);
    const ctx = tex.getContext();
    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(54,223,255,0.9)");
    grad.addColorStop(1, "rgba(54,223,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    tex.update();
    trail.particleTexture = tex;
    trail.emitter = new BABYLON.Vector3(0, -0.04, -1.8);
    trail.minEmitBox = new BABYLON.Vector3(-0.55, -0.02, 0);
    trail.maxEmitBox = new BABYLON.Vector3(0.55, 0.02, 0);
    trail.color1 = new BABYLON.Color4(0.1, 0.9, 1, 0.9);
    trail.color2 = new BABYLON.Color4(0.5, 0.2, 1, 0.5);
    trail.colorDead = new BABYLON.Color4(0, 0, 0.15, 0);
    trail.minSize = 0.08;
    trail.maxSize = 0.4;
    trail.minLifeTime = 0.15;
    trail.maxLifeTime = 0.38;
    trail.emitRate = 140;
    trail.direction1 = new BABYLON.Vector3(-0.2, -0.1, -1);
    trail.direction2 = new BABYLON.Vector3(0.2, 0.1, -1.8);
    trail.minEmitPower = 3;
    trail.maxEmitPower = 8;
    trail.updateSpeed = 0.02;
    trail.start();

    playerRoot = root;
    engineTrail = trail;
    root.position.set(0, 0, 0);
    playerSprite = createAssetSprite("player", "playerShipSprite", root.position, 3.9);
    if (playerSprite) {
      playerSprite.position.z = root.position.z + 0.35;
      playerSprite.angle = Math.PI;
      root.getChildMeshes().forEach((m) => { if (m.name !== "playerShieldRing") m.visibility = 0.12; });
    }
    return root;
  }

  function createStarfield() {
    starParent = new BABYLON.TransformNode("starParent", scene);
    const starMat = makeMat("starMat", "#dff8ff", 0.9);
    for (let i = 0; i < 260; i++) {
      const star = BABYLON.MeshBuilder.CreateSphere("star", { diameter: randRange(0.035, 0.11), segments: 6 }, scene);
      star.material = starMat;
      star.position.set(randRange(-45, 45), randRange(-18, 23), randRange(10, 150));
      star.parent = starParent;
      pools.stars.push(star);
    }
  }


  function createPlanetField() {
    planetParent = new BABYLON.TransformNode("planetField", scene);
    planetMeshes = [];
    warpStreaks = [];

    const planetConfigs = [
      { name: "bluePlanet", mat: "planetBlue", x: -24, y: 9.5, z: 118, r: 7.5, ring: true },
      { name: "redPlanet", mat: "planetRed", x: 28, y: 6.5, z: 150, r: 10.5, ring: true },
      { name: "iceMoon", mat: "planetIce", x: -34, y: -2.5, z: 92, r: 3.8, ring: false },
      { name: "violetMoon", mat: "planetViolet", x: 18, y: 15, z: 190, r: 4.6, ring: false }
    ];

    for (const cfg of planetConfigs) {
      const sphere = BABYLON.MeshBuilder.CreateSphere(cfg.name, { diameter: cfg.r * 2, segments: 48 }, scene);
      sphere.material = mats[cfg.mat];
      sphere.position.set(cfg.x, cfg.y, cfg.z);
      sphere.parent = planetParent;
      sphere.isPickable = false;
      planetMeshes.push({ mesh: sphere, base: sphere.position.clone(), spin: randRange(0.025, 0.075), drift: randRange(0.05, 0.12), mat: cfg.mat });

      if (cfg.ring) {
        const ring = BABYLON.MeshBuilder.CreateTorus(`${cfg.name}_ring`, { majorRadius: cfg.r * 1.45, minorRadius: 0.035, tessellation: 96 }, scene);
        ring.material = mats.transparentCyan;
        ring.position.copyFrom(sphere.position);
        ring.rotation.x = Math.PI * 0.63;
        ring.rotation.z = Math.PI * 0.08;
        ring.parent = planetParent;
        ring.isPickable = false;
        planetMeshes.push({ mesh: ring, base: ring.position.clone(), spin: -randRange(0.015, 0.035), drift: randRange(0.035, 0.08), ring: true });
      }
    }

    for (let i = 0; i < 34; i++) {
      const streak = BABYLON.MeshBuilder.CreateBox("warpStreak", { width: 0.035, height: 0.035, depth: randRange(5.0, 13.0) }, scene);
      streak.material = mats.warpStreak;
      streak.position.set(randRange(-26, 26), randRange(-10, 16), randRange(25, 170));
      streak.rotation.y = randRange(-0.03, 0.03);
      streak.parent = planetParent;
      streak.isPickable = false;
      warpStreaks.push(streak);
    }
  }

  function createTunnelGrid() {
    // Grid removed: the game now uses a clean cinematic 3D starfield with planets,
    // background nebula layers and forward motion instead of floor/tunnel lines.
    tunnelParent = null;
  }


  function ensureSpriteManagers() {
    if (spriteManagers.ready || spriteManagers.disabled) return;
    try {
      spriteManagers.player = new BABYLON.SpriteManager("shipSpriteManager", ASSET_PATHS.player, 12, 512, scene);
      spriteManagers.enemy = new BABYLON.SpriteManager("enemyShipSpriteManager", ASSET_PATHS.enemy, 80, 512, scene);
      spriteManagers.boss = new BABYLON.SpriteManager("bossShipSpriteManager", ASSET_PATHS.boss, 12, 512, scene);
      spriteManagers.asteroid = new BABYLON.SpriteManager("asteroidSpriteManager", ASSET_PATHS.asteroid, 80, 512, scene);
      spriteManagers.core = new BABYLON.SpriteManager("coreSpriteManager", ASSET_PATHS.core, 80, 512, scene);
      spriteManagers.shield = new BABYLON.SpriteManager("shieldSpriteManager", ASSET_PATHS.shield, 45, 512, scene);
      spriteManagers.time = new BABYLON.SpriteManager("timeSpriteManager", ASSET_PATHS.time, 45, 512, scene);
      Object.values(spriteManagers).forEach((manager) => {
        if (manager && manager.texture) {
          manager.texture.hasAlpha = true;
          manager.texture.uScale = 1;
          manager.texture.vScale = 1;
        }
      });
      spriteManagers.ready = true;
    } catch (err) {
      console.warn("Space Dodger asset sprites could not be initialized; using procedural meshes only.", err);
      spriteManagers.disabled = true;
    }
  }

  const spriteTextureMeta = {
    player: { src: ASSET_PATHS.player, grid: 2 },
    enemy: { src: ASSET_PATHS.enemy, grid: 2 },
    boss: { src: ASSET_PATHS.boss, grid: 2 },
    asteroid: { src: ASSET_PATHS.asteroid, grid: 2 },
    core: { src: ASSET_PATHS.core, grid: 1 },
    shield: { src: ASSET_PATHS.shield, grid: 1 },
    time: { src: ASSET_PATHS.time, grid: 1 }
  };

  function createAssetPlaneMaterial(managerName, cellIndex = 0) {
    const meta = spriteTextureMeta[managerName];
    if (!meta) return null;
    const mat = new BABYLON.StandardMaterial(`assetSpriteMat_${managerName}_${Math.random().toString(36).slice(2)}`, scene);
    const tex = new BABYLON.Texture(meta.src, scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
    tex.hasAlpha = true;
    tex.uScale = 1 / meta.grid;
    tex.vScale = 1 / meta.grid;
    const applyFrame = (frame) => {
      const safeFrame = Math.max(0, Math.floor(frame || 0)) % (meta.grid * meta.grid);
      const col = safeFrame % meta.grid;
      const row = Math.floor(safeFrame / meta.grid);
      tex.uOffset = col / meta.grid;
      tex.vOffset = meta.grid === 1 ? 0 : (meta.grid - 1 - row) / meta.grid;
    };
    applyFrame(cellIndex);
    mat.diffuseTexture = tex;
    mat.opacityTexture = tex;
    mat.emissiveTexture = tex;
    mat.diffuseColor = BABYLON.Color3.White();
    mat.emissiveColor = BABYLON.Color3.White().scale(0.92);
    mat.specularColor = BABYLON.Color3.Black();
    mat.useAlphaFromDiffuseTexture = true;
    mat.backFaceCulling = false;
    mat.alpha = 0.98;
    if (BABYLON.Material && BABYLON.Material.MATERIAL_ALPHABLEND !== undefined) {
      mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    }
    mat._applyFrame = applyFrame;
    return mat;
  }

  function createAssetSprite(managerName, spriteName, position, size, cellIndex = 0) {
    try {
      const mat = createAssetPlaneMaterial(managerName, cellIndex);
      if (!mat) return null;
      const plane = BABYLON.MeshBuilder.CreatePlane(`${spriteName}_assetPlane`, { width: 1, height: 1 }, scene);
      plane.material = mat;
      plane.position.copyFrom(position);
      plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      plane.renderingGroupId = 2;
      plane.isPickable = false;
      const sprite = {
        __assetPlane: true,
        plane,
        material: mat,
        texture: mat.diffuseTexture,
        position: plane.position,
        _angle: 0,
        _size: 1,
        _cellIndex: cellIndex,
        color: { a: 0.98 },
        get angle() { return this._angle; },
        set angle(v) { this._angle = v || 0; this.plane.rotation.z = this._angle; },
        get size() { return this._size; },
        set size(v) { this._size = Math.max(0.01, v || 1); this.plane.scaling.set(this._size, this._size, 1); },
        get cellIndex() { return this._cellIndex; },
        set cellIndex(v) { this._cellIndex = v || 0; if (this.material && this.material._applyFrame) this.material._applyFrame(this._cellIndex); },
        get isDisposed() { return this.plane.isDisposed(); },
        dispose() {
          if (this.plane && !this.plane.isDisposed()) this.plane.dispose();
          if (this.material && (!this.material.isDisposed || !this.material.isDisposed())) this.material.dispose();
          if (this.texture && (!this.texture.isDisposed || !this.texture.isDisposed())) this.texture.dispose();
        }
      };
      sprite.size = size;
      sprite.cellIndex = cellIndex;
      return sprite;
    } catch (planeErr) {
      console.warn("Space Dodger textured asset plane could not be created; trying Babylon SpriteManager.", planeErr);
      try {
        ensureSpriteManagers();
        const manager = spriteManagers[managerName];
        if (!manager || spriteManagers.disabled) return null;
        const sprite = new BABYLON.Sprite(spriteName, manager);
        sprite.position.copyFrom(position);
        sprite.size = size;
        sprite.cellIndex = cellIndex;
        sprite.isPickable = false;
        sprite.color = new BABYLON.Color4(1, 1, 1, 0.98);
        return sprite;
      } catch {
        return null;
      }
    }
  }

  function syncObjectSprite(obj, dt = 0) {
    if (!obj.sprite || !obj.mesh) return;
    obj.sprite.position.copyFrom(obj.mesh.position);
    obj.sprite.angle += (obj.spriteSpin || 0) * dt;
    if (obj.spriteFrames && obj.spriteFrames > 1) {
      const t = Math.floor(performance.now() * (obj.spriteFrameSpeed || 0.004) + (obj.frameOffset || 0));
      obj.sprite.cellIndex = (obj.spriteStart || 0) + (t % obj.spriteFrames);
    }
    if (obj.spritePulse) {
      obj.sprite.size = obj.baseSpriteSize * (1 + Math.sin(performance.now() * obj.spritePulse) * 0.045);
    }
  }

  function disposeGameObject(obj) {
    if (!obj) return;
    if (obj.sprite && !obj.sprite.isDisposed) obj.sprite.dispose();
    const mesh = obj.mesh || obj.root;
    if (mesh && !mesh.isDisposed?.()) mesh.dispose();
  }

  function makeBackgroundMaterial(name, imagePath, alpha = 0.72) {
    const mat = new BABYLON.StandardMaterial(name, scene);
    const texture = new BABYLON.Texture(imagePath, scene, true, false);
    texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    mat.diffuseTexture = texture;
    mat.emissiveTexture = texture;
    mat.diffuseColor = BABYLON.Color3.White();
    mat.emissiveColor = BABYLON.Color3.White().scale(0.76);
    mat.specularColor = BABYLON.Color3.Black();
    mat.alpha = alpha;
    mat.backFaceCulling = false;
    mat.disableLighting = true;
    return mat;
  }

  function createBackgroundLayers() {
    backgroundRoot = new BABYLON.TransformNode("backgroundRoot", scene);
    backgroundLayers = [];

    const layerConfigs = [
      { z: 150, y: 9.5, width: 150, height: 84, alpha: 0.93, speed: 0.0016, drift: 0.12 },
      { z: 205, y: 14.0, width: 210, height: 118, alpha: 0.40, speed: -0.0009, drift: -0.08 },
      { z: 92, y: -3.8, width: 110, height: 62, alpha: 0.24, speed: 0.0027, drift: 0.18 }
    ];

    for (let i = 0; i < layerConfigs.length; i++) {
      const cfg = layerConfigs[i];
      const mat = makeBackgroundMaterial(`spaceBackgroundMat_${i}`, levelBackgroundPath(i), cfg.alpha);
      const plane = BABYLON.MeshBuilder.CreatePlane(`spaceBackgroundLayer_${i}`, { width: cfg.width, height: cfg.height }, scene);
      plane.material = mat;
      plane.position.set(0, cfg.y, cfg.z);
      plane.renderingGroupId = 0;
      plane.isPickable = false;
      plane.parent = backgroundRoot;
      backgroundLayers.push({ plane, mat, speed: cfg.speed, alpha: cfg.alpha, drift: cfg.drift, baseY: cfg.y, baseX: 0 });
    }
  }

  function applyLevelBackground(index) {
    const hue = LEVELS[index]?.hue || "#36dfff";
    scene.clearColor = BABYLON.Color4.FromHexString(hue + "ff").scale(0.012);
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.0028;
    scene.fogColor = BABYLON.Color3.FromHexString(hue).scale(0.12);

    for (let i = 0; i < backgroundLayers.length; i++) {
      const layer = backgroundLayers[i];
      const path = levelBackgroundPath(index + i);
      const oldTexture = layer.mat.diffuseTexture;
      const texture = new BABYLON.Texture(path, scene, true, false);
      texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
      texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
      texture.uScale = i === 0 ? 1 : 1.08 + i * 0.06;
      texture.vScale = i === 0 ? 1 : 1.08 + i * 0.06;
      layer.mat.diffuseTexture = texture;
      layer.mat.emissiveTexture = texture;
      layer.mat.emissiveColor = BABYLON.Color3.White().scale(i === 0 ? 0.92 : 0.48);
      layer.mat.alpha = layer.alpha;
      if (oldTexture && !oldTexture.isDisposed) oldTexture.dispose();
    }

    const color = BABYLON.Color3.FromHexString(hue);
    if (mats.warpStreak) {
      mats.warpStreak.diffuseColor = color.scale(0.8);
      mats.warpStreak.emissiveColor = color.scale(1.2);
    }
    if (mats.transparentCyan) {
      mats.transparentCyan.diffuseColor = color.scale(0.75);
      mats.transparentCyan.emissiveColor = color.scale(0.95);
    }
  }

  function updateBackgroundLayers(dt) {
    const t = performance.now() * 0.001;
    for (const layer of backgroundLayers) {
      const texture = layer.mat && layer.mat.diffuseTexture;
      if (!texture) continue;
      const boost = state.input.boost ? 2.2 : 1;
      texture.uOffset += layer.speed * dt * 60 * boost;
      texture.vOffset += layer.speed * 0.22 * dt * 60;
      layer.plane.position.x = layer.baseX + Math.sin(t * 0.07 + layer.drift * 10) * layer.drift * 8;
      layer.plane.position.y = layer.baseY + Math.cos(t * 0.05 + layer.drift * 5) * Math.abs(layer.drift) * 3;
    }
  }

  function makeExplosionSprite(position, color = "#36dfff", scale = 1) {
    const root = new BABYLON.TransformNode("explosion", scene);
    root.position.copyFrom(position);

    for (let i = 0; i < 10; i++) {
      const shard = BABYLON.MeshBuilder.CreatePlane("sparkShard", { size: randRange(0.22, 0.42) * scale }, scene);
      shard.material = choose([mats.cyanGlow, mats.pinkGlow, mats.goldGlow, mats.greenGlow]);
      shard.position.set(randRange(-0.2, 0.2), randRange(-0.2, 0.2), randRange(-0.2, 0.2));
      shard.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      shard.parent = root;
      shard.metadata = {
        vx: randRange(-5, 5),
        vy: randRange(-5, 5),
        vz: randRange(-4, 4),
        life: randRange(0.35, 0.75)
      };
    }

    pools.particles.push({ root, life: 0.7, maxLife: 0.7, type: "explosion" });
    sfx.explosion(color);
  }

  function makeRingEffect(position, matName = "transparentCyan", scale = 1) {
    const ring = BABYLON.MeshBuilder.CreateTorus("energyRing", { majorRadius: 0.7 * scale, minorRadius: 0.025 * scale, tessellation: 48 }, scene);
    ring.material = mats[matName];
    ring.position.copyFrom(position);
    ring.rotation.x = Math.PI / 2;
    pools.particles.push({ root: ring, life: 0.55, maxLife: 0.55, type: "ring" });
  }

  function spawnAsteroid() {
    const lv = LEVELS[state.levelIndex];
    const hot = rand() > 0.72;
    const mesh = BABYLON.MeshBuilder.CreateIcoSphere("asteroid", { radius: randRange(0.55, 1.35), subdivisions: 2 }, scene);
    mesh.material = hot ? mats.asteroidHot : mats.asteroid;
    mesh.position.set(randRange(-PLAYER_LIMIT.x, PLAYER_LIMIT.x), randRange(PLAYER_LIMIT.yMin, PLAYER_LIMIT.yMax + 0.7), randRange(96, 136));
    mesh.scaling.set(randRange(0.75, 1.35), randRange(0.65, 1.25), randRange(0.75, 1.55));
    mesh.rotation.set(rand(), rand(), rand());

    const frame = Math.floor(rand() * 4);
    const spriteSize = Math.max(2.0, mesh.scaling.length() * 1.35 + 1.05);
    const sprite = createAssetSprite("asteroid", "asteroidSprite", mesh.position, spriteSize, frame);
    if (sprite) {
      mesh.visibility = 0.03;
      sprite.angle = randRange(-0.4, 0.4);
    }

    pools.objects.push({
      mesh,
      sprite,
      baseSpriteSize: spriteSize,
      spriteStart: frame,
      spriteFrames: 1,
      spriteSpin: randRange(-1.25, 1.25),
      kind: "asteroid",
      hp: hot ? 2 : 1,
      radius: mesh.scaling.length() * 0.42 + 0.7,
      speed: lv.speed * randRange(0.82, 1.18),
      spin: new BABYLON.Vector3(randRange(-2.1, 2.1), randRange(-2.1, 2.1), randRange(-2.1, 2.1))
    });
  }

  function createEnemyMesh(type) {
    const root = new BABYLON.TransformNode(`enemy_${type}`, scene);
    const bodyColor = type === "shield" ? "greenGlow" : type === "heavy" ? "goldGlow" : "enemyRed";

    const body = BABYLON.MeshBuilder.CreateBox("enemyBody", { width: type === "heavy" ? 1.8 : 1.2, height: 0.42, depth: type === "heavy" ? 1.55 : 1.05 }, scene);
    body.material = mats.enemyDark;
    body.parent = root;

    const core = BABYLON.MeshBuilder.CreateSphere("enemyCore", { diameter: type === "heavy" ? 0.48 : 0.34, segments: 16 }, scene);
    core.material = mats[bodyColor];
    core.parent = root;
    core.position.z = -0.12;

    const wingL = BABYLON.MeshBuilder.CreateBox("enemyWingL", { width: 0.85, height: 0.1, depth: 0.45 }, scene);
    wingL.material = mats[bodyColor];
    wingL.parent = root;
    wingL.position.x = -0.78;
    wingL.rotation.z = 0.24;

    const wingR = wingL.clone("enemyWingR");
    wingR.parent = root;
    wingR.position.x = 0.78;
    wingR.rotation.z = -0.24;

    if (type === "shield") {
      const ring = BABYLON.MeshBuilder.CreateTorus("shieldEnemyRing", { majorRadius: 0.9, minorRadius: 0.025, tessellation: 42 }, scene);
      ring.material = mats.transparentCyan;
      ring.parent = root;
      ring.rotation.x = Math.PI / 2;
    }

    if (type === "mine") {
      root.getChildMeshes().forEach((m) => m.dispose());
      const mine = BABYLON.MeshBuilder.CreateSphere("mineCore", { diameter: 0.96, segments: 18 }, scene);
      mine.material = mats.pinkGlow;
      mine.parent = root;
      for (let i = 0; i < 6; i++) {
        const spike = BABYLON.MeshBuilder.CreateCylinder("mineSpike", { diameterTop: 0, diameterBottom: 0.18, height: 0.55, tessellation: 8 }, scene);
        spike.material = mats.enemyRed;
        spike.parent = root;
        spike.position.x = Math.cos(i * Math.PI / 3) * 0.62;
        spike.position.y = Math.sin(i * Math.PI / 3) * 0.62;
        spike.rotation.z = i * Math.PI / 3 - Math.PI / 2;
      }
    }

    return root;
  }

  function spawnEnemy(forcedType) {
    const lv = LEVELS[state.levelIndex];
    const type = forcedType || choose(lv.enemyTypes);
    const mesh = createEnemyMesh(type);
    mesh.position.set(randRange(-PLAYER_LIMIT.x, PLAYER_LIMIT.x), randRange(PLAYER_LIMIT.yMin + 0.2, PLAYER_LIMIT.yMax), randRange(102, 142));
    mesh.rotation.y = Math.PI;

    const hp = type === "heavy" ? 5 : type === "shield" ? 4 : type === "turret" ? 3 : type === "mine" ? 1 : 2;
    const frameByType = { scout: 0, darter: 1, turret: 2, shield: 2, heavy: 3, mine: 3 };
    const frame = frameByType[type] ?? 0;
    const spriteSize = type === "heavy" ? 3.15 : type === "shield" ? 2.55 : type === "mine" ? 2.25 : 2.45;
    const sprite = createAssetSprite("enemy", `enemySprite_${type}`, mesh.position, spriteSize, frame);
    if (sprite) {
      mesh.getChildMeshes().forEach((m) => { m.visibility = 0.04; });
      sprite.angle = Math.PI;
    }

    pools.objects.push({
      mesh,
      sprite,
      baseSpriteSize: spriteSize,
      spriteStart: frame,
      spriteFrames: 1,
      spritePulse: type === "shield" ? 0.006 : 0,
      kind: "enemy",
      type,
      hp,
      maxHp: hp,
      radius: type === "heavy" ? 1.38 : 1.02,
      speed: type === "turret" ? lv.speed * 0.72 : type === "mine" ? lv.speed * 0.95 : lv.speed * randRange(0.78, 1.05),
      fireTimer: randRange(0.45, 1.6),
      movePhase: randRange(0, 6.28),
      baseX: mesh.position.x
    });
  }

  function spawnPowerup() {
    const types = ["shield", "repair", "double", "magnet", "slow", "plasma", "core"];
    const type = choose(types);
    const root = new BABYLON.TransformNode(`pickup_${type}`, scene);
    const matName = type === "repair" ? "greenGlow" : type === "plasma" ? "pinkGlow" : type === "shield" ? "cyanGlow" : "goldGlow";

    const sphere = BABYLON.MeshBuilder.CreateSphere("pickupOrb", { diameter: type === "core" ? 0.52 : 0.72, segments: 18 }, scene);
    sphere.material = mats[matName];
    sphere.parent = root;

    const ring = BABYLON.MeshBuilder.CreateTorus("pickupRing", { majorRadius: 0.48, minorRadius: 0.025, tessellation: 36 }, scene);
    ring.material = mats[matName];
    ring.parent = root;
    ring.rotation.x = Math.PI / 2;

    root.position.set(randRange(-PLAYER_LIMIT.x * 0.88, PLAYER_LIMIT.x * 0.88), randRange(PLAYER_LIMIT.yMin + 0.3, PLAYER_LIMIT.yMax), randRange(94, 134));

    const spriteKey = type === "shield" || type === "repair" ? "shield" : type === "slow" ? "time" : "core";
    const spriteSize = type === "core" ? 1.25 : 1.42;
    const sprite = createAssetSprite(spriteKey, `pickupSprite_${type}`, root.position, spriteSize);
    if (sprite) {
      root.getChildMeshes().forEach((m) => { m.visibility = 0.15; });
    }

    pools.objects.push({
      mesh: root,
      sprite,
      baseSpriteSize: spriteSize,
      spritePulse: 0.0065,
      spriteSpin: type === "slow" ? 0.7 : 0.25,
      kind: "pickup",
      type,
      hp: 1,
      radius: 0.72,
      speed: LEVELS[state.levelIndex].speed * 0.86,
      spin: new BABYLON.Vector3(0, 3.2, 1.7)
    });
  }

  function spawnGate() {
    const root = new BABYLON.TransformNode("plasmaGate", scene);
    const matName = rand() > 0.5 ? "transparentCyan" : "transparentPink";
    for (let i = 0; i < 3; i++) {
      const ring = BABYLON.MeshBuilder.CreateTorus("gateRing", { majorRadius: 1.4 + i * 0.28, minorRadius: 0.025, tessellation: 72 }, scene);
      ring.material = mats[matName];
      ring.parent = root;
      ring.rotation.x = Math.PI / 2;
    }
    root.position.set(randRange(-6, 6), randRange(-2.2, 3.8), randRange(108, 148));
    pools.objects.push({
      mesh: root,
      kind: "gate",
      hp: 1,
      radius: 1.45,
      speed: LEVELS[state.levelIndex].speed * 1.05,
      spin: new BABYLON.Vector3(0, 0, 2.2)
    });
  }

  function createBossMesh(color) {
    const root = new BABYLON.TransformNode("bossRoot", scene);

    const base = BABYLON.MeshBuilder.CreateBox("bossHull", { width: 7.3, height: 1.25, depth: 3.2 }, scene);
    base.material = mats.enemyDark;
    base.parent = root;

    const tower = BABYLON.MeshBuilder.CreateBox("bossTower", { width: 2.1, height: 1.65, depth: 1.4 }, scene);
    tower.material = mats.enemyDark;
    tower.parent = root;
    tower.position.y = 1.08;

    const core = BABYLON.MeshBuilder.CreateSphere("bossCore", { diameter: 0.95, segments: 32 }, scene);
    core.material = color === "#36dfff" ? mats.cyanGlow : color === "#ff315a" ? mats.enemyRed : mats.pinkGlow;
    core.parent = root;
    core.position.set(0, 0.05, -1.65);

    for (let i = -1; i <= 1; i++) {
      const cannon = BABYLON.MeshBuilder.CreateCylinder("bossCannon", { height: 1.4, diameter: 0.22, tessellation: 18 }, scene);
      cannon.rotation.x = Math.PI / 2;
      cannon.material = mats.enemyRed;
      cannon.parent = root;
      cannon.position.set(i * 2.2, -0.05, -2.25);
    }

    for (let i = -2; i <= 2; i++) {
      const glow = BABYLON.MeshBuilder.CreateBox("bossLight", { width: 0.42, height: 0.16, depth: 0.06 }, scene);
      glow.material = mats.pinkGlow;
      glow.parent = root;
      glow.position.set(i * 1.15, 0.72, -1.65);
    }

    root.rotation.y = Math.PI;
    root.position.set(0, 2.2, 124);
    return root;
  }

  function spawnBoss() {
    const lv = LEVELS[state.levelIndex];
    if (!lv.boss || state.boss) return;
    const mesh = createBossMesh(lv.boss.color);

    const bossFrame =
      state.levelIndex >= 11 ? 3 :
      state.levelIndex >= 10 ? 2 :
      state.levelIndex >= 7 ? 1 : 0;
    const bossSprite = createAssetSprite("boss", "bossMothershipSprite", mesh.position, 8.9, bossFrame);
    if (bossSprite) {
      mesh.getChildMeshes().forEach((m) => { m.visibility = 0.045; });
      bossSprite.angle = Math.PI;
    }

    state.boss = {
      mesh,
      sprite: bossSprite,
      baseSpriteSize: 8.9,
      spriteStart: bossFrame,
      name: lv.boss.name,
      hp: lv.boss.hp,
      maxHp: lv.boss.hp,
      fireTimer: 1.1,
      waveTimer: 3.2,
      phase: 1,
      radius: 4.8
    };
    ui.bossName.textContent = lv.boss.name;
    ui.bossPanel.classList.remove("hidden");
    sfx.bossIntro();
    setMentor(`Boss detected: ${lv.boss.name}. Target the glowing core and avoid the cannon bursts.`);
  }

  function clearWorld(keepPlayer = true) {
    for (const list of [pools.objects, pools.lasers, pools.enemyLasers, pools.particles]) {
      for (const obj of list) {
        if (obj.sprite && !obj.sprite.isDisposed) obj.sprite.dispose();
        const mesh = obj.mesh || obj.root;
        if (mesh && !mesh.isDisposed?.()) mesh.dispose();
      }
      list.length = 0;
    }
    if (state.boss?.sprite && !state.boss.sprite.isDisposed) state.boss.sprite.dispose();
    if (state.boss?.mesh && !state.boss.mesh.isDisposed()) state.boss.mesh.dispose();
    state.boss = null;
    ui.bossPanel.classList.add("hidden");
    if (!keepPlayer && playerRoot) {
      if (playerSprite && !playerSprite.isDisposed) playerSprite.dispose();
      playerSprite = null;
      playerRoot.dispose();
    }
  }

  function beginLevel(index) {
    state.levelIndex = clamp(index, 0, LEVELS.length - 1);
    state.elapsed = 0;
    state.cores = 0;
    state.kills = 0;
    state.levelStarted = true;
    state.levelCompletePending = false;
    state.boss = null;
    state.slowMo = 0;
    state.magnet = 0;
    clearWorld(true);
    rngSeed = 1000 + index * 773;

    const lv = LEVELS[state.levelIndex];
    setMentor(lv.tip);
    showToast(`Level ${state.levelIndex + 1}: ${lv.name}`);
    ui.missionTitle.textContent = `${lv.name} — ${lv.zone}`;
    ui.missionText.textContent = lv.mission;
    applyLevelBackground(state.levelIndex);
    updateUI();

    sfx.levelStart();
    music.setLevel(lv.music, lv.hue);
  }

  function startGame(reset = true) {
    if (reset) {
      state.score = 0;
      state.hull = 100;
      state.shield = 0;
      state.levelIndex = 0;
      state.combo = 0;
      state.lives = 3;
      state.boostEnergy = 100;
      state.doubleLaser = 0;
      state.plasma = 0;
    }
    state.status = "playing";
    ui.startOverlay.classList.add("hidden");
    ui.gameOverOverlay.classList.add("hidden");
    ui.canvas.focus();
    audio.ensure();
    beginLevel(state.levelIndex);
  }

  function completeLevel() {
    if (state.levelCompletePending) return;
    state.levelCompletePending = true;
    state.score += 800 + state.hull * 4 + state.combo * 25;
    sfx.levelClear();
    postScore(false);

    if (state.levelIndex >= LEVELS.length - 1) {
      endGame(true);
      return;
    }

    setMentor(`Route cleared. Jumping to the next sector: ${LEVELS[state.levelIndex + 1].name}.`);
    setTimeout(() => beginLevel(state.levelIndex + 1), 1800);
  }

  function endGame(won) {
    state.status = "ended";
    clearWorld(true);
    music.stop();
    state.bestScore = Math.max(state.bestScore, Math.floor(state.score));
    safeSave();
    postScore(true);

    $("endKicker").textContent = won ? "Odyssey Complete" : "Mission Failed";
    $("endTitle").textContent = won ? "Starfall Route Restored" : "Ship Offline";
    $("endText").textContent = won
      ? `Final score: ${Math.floor(state.score)}. Best: ${state.bestScore}.`
      : `Final score: ${Math.floor(state.score)}. Best: ${state.bestScore}. Retry from this sector or restart the Odyssey.`;
    ui.gameOverOverlay.classList.remove("hidden");
    won ? sfx.victory() : sfx.gameOver();
  }

  function retryMission() {
    state.hull = 100;
    state.shield = 25;
    state.combo = 0;
    state.status = "playing";
    ui.gameOverOverlay.classList.add("hidden");
    beginLevel(state.levelIndex);
  }

  function setMentor(text) {
    ui.mentorText.textContent = text;
  }

  function damagePlayer(amount, source = "impact") {
    if (state.status !== "playing") return;
    if (state.shield > 0) {
      state.shield = Math.max(0, state.shield - amount * 1.25);
      sfx.shield();
      makeRingEffect(playerRoot.position, "transparentCyan", 1.6);
      return;
    }
    state.hull = Math.max(0, state.hull - amount);
    state.combo = 0;
    sfx.hit();
    makeRingEffect(playerRoot.position, "transparentPink", 1.35);
    if (source === "laser") setMentor("Enemy laser hit! Keep moving diagonally to break their aim.");
    if (state.hull <= 0) endGame(false);
  }

  function collectPickup(obj) {
    const type = obj.type;
    if (type === "core") {
      state.cores++;
      state.score += 120 + state.combo * 4;
      state.combo++;
      sfx.collect();
      makeRingEffect(obj.mesh.position, "transparentCyan", 0.8);
      return;
    }

    if (type === "shield") {
      state.shield = Math.min(100, state.shield + 42);
      setMentor("Shield cells absorbed. You can survive one or two heavy impacts.");
    } else if (type === "repair") {
      state.hull = Math.min(100, state.hull + 32);
      setMentor("Repair nanites restored hull integrity.");
    } else if (type === "double") {
      state.doubleLaser = 11;
      setMentor("Double laser armed. Hold fire to clear enemy formations.");
    } else if (type === "magnet") {
      state.magnet = 8.5;
      setMentor("Magnet field active. Nearby cores will drift toward your ship.");
    } else if (type === "slow") {
      state.slowMo = 7.2;
      setMentor("Slow-motion field active. Use the window to escape tight patterns.");
    } else if (type === "plasma") {
      state.plasma = Math.min(3, state.plasma + 1);
      setMentor("Plasma burst charged. Your next heavy shot tears through bosses.");
    }

    state.score += 220;
    state.combo++;
    sfx.power();
    makeRingEffect(obj.mesh.position, "transparentCyan", 1.1);
  }

  function firePlayerLaser(plasma = false) {
    const nowCooldown = plasma ? 0.55 : state.doubleLaser > 0 ? 0.16 : 0.22;
    if (state.fireCooldown > 0 && !plasma) return;

    const offsets = state.doubleLaser > 0 ? [-0.45, 0.45] : [0];
    for (const ox of offsets) {
      const mesh = BABYLON.MeshBuilder.CreateCylinder("playerLaser", {
        height: plasma ? 2.2 : 1.25,
        diameter: plasma ? 0.16 : 0.08,
        tessellation: 12
      }, scene);
      mesh.rotation.x = Math.PI / 2;
      mesh.material = plasma ? mats.goldGlow : mats.cyanGlow;
      mesh.position.set(playerRoot.position.x + ox, playerRoot.position.y + 0.02, playerRoot.position.z + 1.45);
      pools.lasers.push({
        mesh,
        damage: plasma ? 9 : 1,
        speed: plasma ? 92 : 76,
        radius: plasma ? 0.6 : 0.26,
        life: 1.45,
        plasma
      });
    }

    state.fireCooldown = nowCooldown;
    sfx.shoot(plasma);
  }

  function enemyFire(obj, aimed = false) {
    const pos = obj.mesh.position.clone();
    const mesh = BABYLON.MeshBuilder.CreateCylinder("enemyLaser", { height: 1.05, diameter: 0.08, tessellation: 10 }, scene);
    mesh.rotation.x = Math.PI / 2;
    mesh.material = obj.type === "shield" ? mats.greenGlow : mats.enemyRed;
    mesh.position.set(pos.x, pos.y, pos.z - 1.25);

    let vx = 0;
    let vy = 0;
    if (aimed) {
      vx = (playerRoot.position.x - pos.x) * 0.42;
      vy = (playerRoot.position.y - pos.y) * 0.42;
    }

    pools.enemyLasers.push({
      mesh,
      speed: obj.type === "heavy" ? 36 : 44,
      radius: 0.38,
      vx,
      vy,
      life: 2.5
    });
    sfx.enemyShoot();
  }

  function bossFire() {
    if (!state.boss) return;
    const b = state.boss;
    const positions = [-2.4, 0, 2.4];
    for (const x of positions) {
      const mesh = BABYLON.MeshBuilder.CreateCylinder("bossLaser", { height: 1.8, diameter: 0.12, tessellation: 12 }, scene);
      mesh.rotation.x = Math.PI / 2;
      mesh.material = mats.enemyRed;
      mesh.position.set(b.mesh.position.x + x, b.mesh.position.y - 0.3, b.mesh.position.z - 2.2);
      pools.enemyLasers.push({
        mesh,
        speed: 46,
        radius: 0.54,
        vx: (playerRoot.position.x - (b.mesh.position.x + x)) * 0.24,
        vy: (playerRoot.position.y - (b.mesh.position.y - 0.3)) * 0.24,
        life: 2.8
      });
    }
    sfx.enemyShoot(true);
  }

  function updatePlayer(dt) {
    const boost = state.input.boost && state.boostEnergy > 2 ? 1.75 : 1;
    const accel = 18 * boost;
    state.motion.x += state.input.x * accel * dt;
    state.motion.y += state.input.y * accel * dt;
    state.motion.x *= Math.pow(0.08, dt);
    state.motion.y *= Math.pow(0.08, dt);

    playerRoot.position.x = clamp(playerRoot.position.x + state.motion.x * dt, -PLAYER_LIMIT.x, PLAYER_LIMIT.x);
    playerRoot.position.y = clamp(playerRoot.position.y + state.motion.y * dt, PLAYER_LIMIT.yMin, PLAYER_LIMIT.yMax);
    playerRoot.rotation.z = BABYLON.Scalar.Lerp(playerRoot.rotation.z, -state.motion.x * 0.08, 0.12);
    playerRoot.rotation.x = BABYLON.Scalar.Lerp(playerRoot.rotation.x, state.motion.y * 0.04, 0.12);

    pointLight.position.x = playerRoot.position.x;
    pointLight.position.y = playerRoot.position.y;
    pointLight.position.z = playerRoot.position.z - 2;

    if (engineTrail) {
      engineTrail.emitter = new BABYLON.Vector3(playerRoot.position.x, playerRoot.position.y - 0.04, playerRoot.position.z - 1.85);
      engineTrail.emitRate = state.input.boost ? 360 : 140;
    }

    if (state.input.boost && state.boostEnergy > 0) {
      state.boostEnergy = Math.max(0, state.boostEnergy - 24 * dt);
    } else {
      state.boostEnergy = Math.min(100, state.boostEnergy + 10 * dt);
    }

    if (playerRoot.shieldRing) {
      playerRoot.shieldRing.isVisible = state.shield > 0;
      playerRoot.shieldRing.rotation.z += dt * 1.6;
      playerRoot.shieldRing.scaling.setAll(1 + Math.sin(performance.now() * 0.006) * 0.035);
    }

    if (playerSprite) {
      playerSprite.position.copyFrom(playerRoot.position);
      playerSprite.position.z = playerRoot.position.z + 0.42;
      playerSprite.angle = Math.PI - playerRoot.rotation.z * 0.75;
      playerSprite.cellIndex = state.input.boost ? 3 : Math.abs(state.motion.x) > 4 ? 2 : Math.abs(state.motion.y) > 3 ? 1 : 0;
      playerSprite.size = state.input.boost ? 4.35 : 3.95;
      playerSprite.color.a = state.hull < 25 ? 0.72 + Math.sin(performance.now() * 0.025) * 0.2 : 0.98;
    }

    if (state.status === "playing") {
      camera.position.x = BABYLON.Scalar.Lerp(camera.position.x, playerRoot.position.x * 0.14, 0.055);
      camera.position.y = BABYLON.Scalar.Lerp(camera.position.y, 2.15 + playerRoot.position.y * 0.08, 0.055);
      camera.position.z = BABYLON.Scalar.Lerp(camera.position.z, -13.5 - (state.input.boost ? 1.2 : 0), 0.055);
      camera.setTarget(new BABYLON.Vector3(playerRoot.position.x * 0.18, 0.75 + playerRoot.position.y * 0.12, 64));
    }

    if (state.input.fire) firePlayerLaser(false);
    if (state.plasma > 0 && state.input.fire && state.fireCooldown < 0.02 && state.combo >= 8) {
      state.plasma--;
      firePlayerLaser(true);
    }
  }

  function updateSpawns(dt) {
    const lv = LEVELS[state.levelIndex];

    updateSpawns.asteroid = (updateSpawns.asteroid || 0) - dt;
    updateSpawns.enemy = (updateSpawns.enemy || 0) - dt;
    updateSpawns.pickup = (updateSpawns.pickup || 0) - dt;
    updateSpawns.gate = (updateSpawns.gate || 0) - dt;

    if (!state.boss && (!lv.boss || state.elapsed < lv.boss.at)) {
      if (updateSpawns.asteroid <= 0) {
        spawnAsteroid();
        updateSpawns.asteroid = lv.asteroidRate * randRange(0.62, 1.22);
      }

      if (updateSpawns.enemy <= 0) {
        spawnEnemy();
        updateSpawns.enemy = lv.enemyRate * randRange(0.72, 1.32);
      }

      if (updateSpawns.pickup <= 0) {
        spawnPowerup();
        updateSpawns.pickup = randRange(2.4, 4.9);
      }

      if (updateSpawns.gate <= 0 && state.levelIndex >= 2) {
        spawnGate();
        updateSpawns.gate = randRange(6.5, 12.5);
      }
    }

    if (lv.boss && state.elapsed >= lv.boss.at && !state.boss) {
      spawnBoss();
    }
  }

  function updateObjects(dt) {
    const slowFactor = state.slowMo > 0 ? 0.45 : 1;

    for (let i = pools.objects.length - 1; i >= 0; i--) {
      const obj = pools.objects[i];
      const mesh = obj.mesh;
      const pos = mesh.position;

      if (obj.spin) {
        mesh.rotation.x += obj.spin.x * dt;
        mesh.rotation.y += obj.spin.y * dt;
        mesh.rotation.z += obj.spin.z * dt;
      }

      if (obj.kind === "enemy") {
        obj.movePhase += dt;
        if (obj.type === "darter" || obj.type === "mine") {
          pos.x = obj.baseX + Math.sin(obj.movePhase * 2.3) * 1.2;
        }
        obj.fireTimer -= dt;
        if (obj.type !== "mine" && obj.fireTimer <= 0 && pos.z < 62) {
          enemyFire(obj, obj.type === "turret" || obj.type === "heavy");
          obj.fireTimer = obj.type === "heavy" ? randRange(0.55, 1.15) : randRange(1.0, 2.0);
        }
      }

      if (obj.kind === "pickup" && state.magnet > 0) {
        const dx = playerRoot.position.x - pos.x;
        const dy = playerRoot.position.y - pos.y;
        const d = Math.max(0.1, Math.sqrt(dx * dx + dy * dy));
        if (d < 5.2) {
          pos.x += (dx / d) * dt * 7.2;
          pos.y += (dy / d) * dt * 7.2;
        }
      }

      pos.z -= obj.speed * slowFactor * dt;
      syncObjectSprite(obj, dt);

      if (pos.z < 1.6 && pos.z > -1.8) {
        const dist = vecDistance2D(pos.x, pos.y, playerRoot.position.x, playerRoot.position.y);
        if (dist < obj.radius + 0.62) {
          if (obj.kind === "pickup") {
            collectPickup(obj);
          } else if (obj.kind === "gate") {
            state.score += 180;
            state.combo++;
            sfx.collect();
          } else {
            damagePlayer(obj.kind === "enemy" ? 19 : 14, "impact");
            createExplosionSprite(pos, "#ff315a", 0.8);
          }
          disposeGameObject(obj);
          pools.objects.splice(i, 1);
          continue;
        }
      }

      if (pos.z < -8) {
        if (obj.kind === "enemy" || obj.kind === "asteroid") {
          state.combo = 0;
        }
        disposeGameObject(obj);
        pools.objects.splice(i, 1);
      }
    }
  }

  function updateLasers(dt) {
    for (let i = pools.lasers.length - 1; i >= 0; i--) {
      const l = pools.lasers[i];
      l.mesh.position.z += l.speed * dt;
      l.life -= dt;

      let hit = false;
      for (let j = pools.objects.length - 1; j >= 0; j--) {
        const obj = pools.objects[j];
        if (obj.kind !== "enemy" && obj.kind !== "asteroid") continue;
        if (Math.abs(l.mesh.position.z - obj.mesh.position.z) > obj.radius + 0.8) continue;
        const dist = vecDistance2D(l.mesh.position.x, l.mesh.position.y, obj.mesh.position.x, obj.mesh.position.y);
        if (dist <= obj.radius + l.radius) {
          obj.hp -= l.damage;
          hit = true;
          makeRingEffect(l.mesh.position, l.plasma ? "transparentPink" : "transparentCyan", l.plasma ? 0.9 : 0.45);
          if (obj.hp <= 0) {
            state.score += obj.kind === "enemy" ? 150 + state.combo * 8 : 45;
            if (obj.kind === "enemy") {
              state.kills++;
              state.combo++;
            }
            createExplosionSprite(obj.mesh.position, obj.kind === "enemy" ? "#ff2fd6" : "#ffd44a", obj.kind === "enemy" ? 1 : 0.8);
            disposeGameObject(obj);
            pools.objects.splice(j, 1);
          }
          break;
        }
      }

      if (!hit && state.boss) {
        const b = state.boss;
        if (Math.abs(l.mesh.position.z - b.mesh.position.z) < 3.6) {
          const dist = vecDistance2D(l.mesh.position.x, l.mesh.position.y, b.mesh.position.x, b.mesh.position.y);
          if (dist < b.radius + l.radius) {
            b.hp = Math.max(0, b.hp - l.damage);
            state.score += 35 * l.damage;
            hit = true;
            makeRingEffect(l.mesh.position, l.plasma ? "transparentPink" : "transparentCyan", l.plasma ? 1.4 : 0.7);
            sfx.bossHit();
            if (b.hp <= 0) {
              state.kills += 6;
              state.combo += 5;
              state.score += 1800;
              createExplosionSprite(b.mesh.position, "#ffd44a", 3.2);
              if (b.sprite && !b.sprite.isDisposed) b.sprite.dispose();
              b.mesh.dispose();
              state.boss = null;
              ui.bossPanel.classList.add("hidden");
              completeLevel();
            }
          }
        }
      }

      if (hit || l.life <= 0 || l.mesh.position.z > 165) {
        l.mesh.dispose();
        pools.lasers.splice(i, 1);
      }
    }

    for (let i = pools.enemyLasers.length - 1; i >= 0; i--) {
      const l = pools.enemyLasers[i];
      l.mesh.position.z -= l.speed * dt;
      l.mesh.position.x += l.vx * dt;
      l.mesh.position.y += l.vy * dt;
      l.life -= dt;
      if (Math.abs(l.mesh.position.z - playerRoot.position.z) < 1.1) {
        const dist = vecDistance2D(l.mesh.position.x, l.mesh.position.y, playerRoot.position.x, playerRoot.position.y);
        if (dist < l.radius + 0.65) {
          damagePlayer(12, "laser");
          createExplosionSprite(l.mesh.position, "#ff315a", 0.6);
          l.mesh.dispose();
          pools.enemyLasers.splice(i, 1);
          continue;
        }
      }
      if (l.life <= 0 || l.mesh.position.z < -8) {
        l.mesh.dispose();
        pools.enemyLasers.splice(i, 1);
      }
    }
  }

  function updateBoss(dt) {
    if (!state.boss) return;
    const b = state.boss;
    const t = state.elapsed;
    b.mesh.position.z = BABYLON.Scalar.Lerp(b.mesh.position.z, 48, 0.016);
    b.mesh.position.x = Math.sin(t * 0.6) * 3.1;
    b.mesh.position.y = 1.8 + Math.sin(t * 0.9) * 0.65;
    b.mesh.rotation.z = Math.sin(t * 0.75) * 0.05;

    b.fireTimer -= dt;
    b.waveTimer -= dt;
    if (b.fireTimer <= 0 && b.mesh.position.z < 55) {
      bossFire();
      b.fireTimer = b.hp < b.maxHp * 0.45 ? 0.75 : 1.25;
    }

    if (b.waveTimer <= 0) {
      spawnEnemy(choose(["scout", "darter", "mine"]));
      spawnAsteroid();
      b.waveTimer = b.hp < b.maxHp * 0.45 ? 2.4 : 4.1;
    }

    if (b.sprite) {
      b.sprite.position.copyFrom(b.mesh.position);
      b.sprite.position.z = b.mesh.position.z - 0.25;
      b.sprite.angle = Math.PI + b.mesh.rotation.z * 0.6;
      b.sprite.size = b.baseSpriteSize * (1 + Math.sin(performance.now() * 0.004) * 0.035);
      const healthRatio = b.hp / Math.max(1, b.maxHp);
      b.sprite.cellIndex = healthRatio < 0.34 ? Math.min(3, b.spriteStart + 1) : b.spriteStart;
      b.sprite.color.a = healthRatio < 0.25 ? 0.82 + Math.sin(performance.now() * 0.025) * 0.16 : 0.98;
      if (b.sprite.__assetPlane && b.sprite.material) b.sprite.material.alpha = b.sprite.color.a;
    }

    ui.bossBar.style.width = `${clamp((b.hp / b.maxHp) * 100, 0, 100)}%`;
  }

  function updateParticles(dt) {
    for (let i = pools.particles.length - 1; i >= 0; i--) {
      const p = pools.particles[i];
      p.life -= dt;
      const k = p.life / p.maxLife;
      if (p.type === "explosion") {
        for (const mesh of p.root.getChildMeshes()) {
          const md = mesh.metadata || {};
          mesh.position.x += (md.vx || 0) * dt;
          mesh.position.y += (md.vy || 0) * dt;
          mesh.position.z += (md.vz || 0) * dt;
          mesh.scaling.setAll(Math.max(0.05, k));
          if (mesh.material) mesh.material.alpha = Math.max(0, k);
        }
      } else if (p.type === "ring") {
        p.root.scaling.setAll(1 + (1 - k) * 2.8);
        if (p.root.material) p.root.material.alpha = Math.max(0, k * 0.36);
      }
      if (p.life <= 0) {
        p.root.dispose();
        pools.particles.splice(i, 1);
      }
    }
  }

  function updateWorld(dt) {
    for (const star of pools.stars) {
      star.position.z -= ((state.input.boost ? 44 : 24) + state.levelIndex * 1.1) * dt;
      if (star.position.z < -8) {
        star.position.z = randRange(150, 240);
        star.position.x = randRange(-45, 45);
        star.position.y = randRange(-18, 23);
      }
    }

    if (planetParent) {
      planetParent.rotation.y = Math.sin(state.elapsed * 0.025) * 0.035;
      for (const planet of planetMeshes) {
        const mesh = planet.mesh;
        mesh.rotation.y += (planet.spin || 0.02) * dt;
        mesh.position.x = planet.base.x + Math.sin(state.elapsed * (planet.drift || 0.05)) * 1.6;
        mesh.position.y = planet.base.y + Math.cos(state.elapsed * (planet.drift || 0.05) * 0.8) * 0.55;
      }
      for (const streak of warpStreaks) {
        streak.position.z -= (state.input.boost ? 98 : 54) * dt;
        if (streak.position.z < -16) {
          streak.position.z = randRange(115, 210);
          streak.position.x = randRange(-28, 28);
          streak.position.y = randRange(-11, 17);
          streak.scaling.z = randRange(0.7, 1.5);
        }
      }
    }

    updateBackgroundLayers(dt);
  }

  function missionProgress() {
    const lv = LEVELS[state.levelIndex];
    const coreP = state.cores / Math.max(1, lv.cores);
    const killP = state.kills / Math.max(1, lv.kills);
    const timeP = state.elapsed / Math.max(1, lv.duration);
    if (lv.boss && state.boss) {
      return 0.82 + (1 - state.boss.hp / state.boss.maxHp) * 0.18;
    }
    return clamp((coreP + killP + timeP) / 3, 0, 1);
  }

  function checkLevelComplete() {
    const lv = LEVELS[state.levelIndex];
    if (state.boss) return;
    const objectivesMet = state.cores >= lv.cores && state.kills >= lv.kills && state.elapsed >= Math.min(lv.duration, 45);
    const timeMet = state.elapsed >= lv.duration && state.cores >= Math.ceil(lv.cores * 0.65) && state.kills >= Math.ceil(lv.kills * 0.65);
    if (!lv.boss && (objectivesMet || timeMet)) completeLevel();
  }

  function updateTimers(dt) {
    state.elapsed += dt;
    state.fireCooldown = Math.max(0, state.fireCooldown - dt);
    state.doubleLaser = Math.max(0, state.doubleLaser - dt);
    state.slowMo = Math.max(0, state.slowMo - dt);
    state.magnet = Math.max(0, state.magnet - dt);
    if (state.combo > 0) state.score += dt * (2 + Math.min(20, state.combo));
  }

  function updateUI() {
    const lv = LEVELS[state.levelIndex];
    ui.scoreText.textContent = Math.floor(state.score).toLocaleString();
    ui.levelText.textContent = `${state.levelIndex + 1}/${LEVELS.length}`;
    ui.hullText.textContent = `${Math.ceil(state.hull)}%`;
    ui.shieldText.textContent = `${Math.ceil(state.shield)}%`;
    ui.missionTitle.textContent = `${lv.name} — ${lv.zone}`;
    ui.missionText.textContent = `${state.cores}/${lv.cores} cores • ${state.kills}/${lv.kills} targets • ${Math.max(0, Math.ceil(lv.duration - state.elapsed))}s`;
    ui.missionMeter.style.width = `${Math.floor(missionProgress() * 100)}%`;
  }

  function tick() {
    const rawDt = Math.min(0.033, engine.getDeltaTime() / 1000);
    const dt = state.status === "playing" ? rawDt : rawDt * 0.3;

    if (state.status === "playing") {
      updateTimers(dt);
      updatePlayer(dt);
      updateSpawns(dt);
      updateObjects(dt);
      updateLasers(dt);
      updateBoss(dt);
      updateParticles(dt);
      updateWorld(dt);
      checkLevelComplete();
      updateUI();
      postScore(false);
    } else {
      updateParticles(dt);
      updateWorld(dt);
    }

    music.update(rawDt);
    scene.render();
  }

  const audio = {
    ctx: null,
    master: null,
    musicGain: null,
    sfxGain: null,
    ensure() {
      if (this.ctx) {
        if (this.ctx.state === "suspended") this.ctx.resume();
        return;
      }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.62;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.16;
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.46;
      this.musicGain.connect(this.master);
      this.sfxGain.connect(this.master);
    },
    beep(freq, dur = 0.12, type = "sine", gain = 0.18, dest = "sfxGain", delay = 0) {
      this.ensure();
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(this[dest]);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    },
    noise(dur = 0.18, gain = 0.18, delay = 0) {
      this.ensure();
      if (!this.ctx) return;
      const t = this.ctx.currentTime + delay;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      const src = this.ctx.createBufferSource();
      const g = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      g.gain.value = gain;
      src.buffer = buffer;
      src.connect(filter);
      filter.connect(g);
      g.connect(this.sfxGain);
      src.start(t);
    }
  };

  const sfx = {
    shoot(plasma = false) {
      audio.beep(plasma ? 220 : 660, plasma ? 0.22 : 0.08, "sawtooth", plasma ? 0.22 : 0.12);
      audio.beep(plasma ? 880 : 990, plasma ? 0.17 : 0.06, "triangle", 0.08, "sfxGain", 0.025);
    },
    enemyShoot(big = false) {
      audio.beep(big ? 138 : 180, big ? 0.2 : 0.12, "sawtooth", big ? 0.2 : 0.12);
    },
    collect() {
      audio.beep(740, 0.07, "triangle", 0.12);
      audio.beep(1110, 0.09, "sine", 0.08, "sfxGain", 0.06);
    },
    power() {
      audio.beep(360, 0.08, "sine", 0.13);
      audio.beep(540, 0.08, "sine", 0.13, "sfxGain", 0.06);
      audio.beep(720, 0.14, "sine", 0.13, "sfxGain", 0.12);
    },
    hit() {
      audio.noise(0.2, 0.28);
      audio.beep(90, 0.18, "sawtooth", 0.2);
    },
    shield() {
      audio.beep(250, 0.08, "sine", 0.15);
      audio.beep(480, 0.14, "triangle", 0.11, "sfxGain", 0.04);
    },
    explosion() {
      audio.noise(0.26, 0.32);
      audio.beep(130, 0.22, "sawtooth", 0.18);
    },
    bossIntro() {
      audio.noise(0.55, 0.22);
      audio.beep(80, 0.55, "sawtooth", 0.2);
    },
    bossHit() {
      audio.beep(150, 0.1, "square", 0.14);
      audio.beep(420, 0.08, "triangle", 0.08, "sfxGain", 0.04);
    },
    levelStart() {
      audio.beep(220, 0.1, "triangle", 0.12);
      audio.beep(330, 0.1, "triangle", 0.12, "sfxGain", 0.1);
      audio.beep(440, 0.15, "triangle", 0.12, "sfxGain", 0.2);
    },
    levelClear() {
      [392, 494, 587, 784].forEach((f, i) => audio.beep(f, 0.14, "triangle", 0.14, "sfxGain", i * 0.08));
    },
    gameOver() {
      [220, 175, 130, 98].forEach((f, i) => audio.beep(f, 0.18, "sawtooth", 0.12, "sfxGain", i * 0.11));
    },
    victory() {
      [392, 494, 659, 784, 988].forEach((f, i) => audio.beep(f, 0.18, "triangle", 0.13, "sfxGain", i * 0.08));
    }
  };

  const music = {
    notes: LEVELS[0].music,
    nextTime: 0,
    step: 0,
    active: false,
    hue: "#36dfff",
    setLevel(notes, hue) {
      audio.ensure();
      this.notes = notes;
      this.hue = hue;
      this.active = true;
      this.nextTime = audio.ctx ? audio.ctx.currentTime : 0;
      this.step = 0;
    },
    stop() {
      this.active = false;
    },
    update() {
      if (!this.active || !audio.ctx) return;
      const now = audio.ctx.currentTime;
      while (this.nextTime < now + 0.12) {
        const note = this.notes[this.step % this.notes.length];
        const bass = note / 2;
        const intensity = clamp((state.combo / 18) + missionProgress() * 0.6, 0.2, 1.2);
        audio.beep(bass, 0.14, "sine", 0.045 * intensity, "musicGain", this.nextTime - now);
        if (this.step % 2 === 0) {
          audio.beep(note, 0.1, "triangle", 0.03 * intensity, "musicGain", this.nextTime - now);
        }
        if (state.boss && this.step % 4 === 0) {
          audio.beep(note * 1.5, 0.08, "sawtooth", 0.02, "musicGain", this.nextTime - now);
        }
        this.nextTime += state.hull < 30 ? 0.38 : 0.29;
        this.step++;
      }
    }
  };

  function wireControls() {
    const keys = new Set();

    window.addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Shift", "KeyW", "KeyA", "KeyS", "KeyD"].includes(e.code)) {
        e.preventDefault();
      }
      keys.add(e.code);
      syncKeys();
    }, { passive: false });

    window.addEventListener("keyup", (e) => {
      keys.delete(e.code);
      syncKeys();
    });

    function syncKeys() {
      state.input.x = (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
      state.input.y = (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0) - (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0);
      state.input.fire = keys.has("Space");
      state.input.boost = keys.has("ShiftLeft") || keys.has("ShiftRight");
    }

    let pointerDown = false;
    ui.canvas.addEventListener("pointerdown", (e) => {
      pointerDown = true;
      ui.canvas.setPointerCapture?.(e.pointerId);
      state.input.fire = true;
      audio.ensure();
    });

    ui.canvas.addEventListener("pointermove", (e) => {
      if (!pointerDown || state.status !== "playing") return;
      const rect = ui.canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      playerRoot.position.x = BABYLON.Scalar.Lerp(playerRoot.position.x, nx * PLAYER_LIMIT.x, 0.18);
      playerRoot.position.y = BABYLON.Scalar.Lerp(playerRoot.position.y, clamp(ny * 5, PLAYER_LIMIT.yMin, PLAYER_LIMIT.yMax), 0.18);
    });

    window.addEventListener("pointerup", () => {
      pointerDown = false;
      state.input.fire = false;
    });

    document.querySelectorAll("#mobileControls [data-dir]").forEach((btn) => {
      const dir = btn.getAttribute("data-dir");
      const set = (on) => {
        if (dir === "left") state.input.x = on ? -1 : 0;
        if (dir === "right") state.input.x = on ? 1 : 0;
        if (dir === "up") state.input.y = on ? 1 : 0;
        if (dir === "down") state.input.y = on ? -1 : 0;
      };
      btn.addEventListener("pointerdown", (e) => { e.preventDefault(); set(true); audio.ensure(); });
      btn.addEventListener("pointerup", () => set(false));
      btn.addEventListener("pointercancel", () => set(false));
      btn.addEventListener("pointerleave", () => set(false));
    });

    const fireSet = (on) => { state.input.fire = on; };
    ui.fireBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); audio.ensure(); fireSet(true); });
    ui.fireBtn.addEventListener("pointerup", () => fireSet(false));
    ui.fireBtn.addEventListener("pointercancel", () => fireSet(false));
    ui.fireBtn.addEventListener("pointerleave", () => fireSet(false));

    const boostSet = (on) => { state.input.boost = on; };
    ui.boostBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); audio.ensure(); boostSet(true); });
    ui.boostBtn.addEventListener("pointerup", () => boostSet(false));
    ui.boostBtn.addEventListener("pointercancel", () => boostSet(false));
    ui.boostBtn.addEventListener("pointerleave", () => boostSet(false));

    ui.startBtn.addEventListener("click", () => startGame(true));
    ui.retryBtn.addEventListener("click", () => retryMission());
    ui.restartBtn.addEventListener("click", () => startGame(true));
    ui.howBtn.addEventListener("click", () => ui.help.classList.toggle("visible"));
  }

  function init() {
    safeLoad();
    createPlayer();
    createStarfield();
    createPlanetField();
    createTunnelGrid();
    createBackgroundLayers();
    applyLevelBackground(0);
    wireControls();
    updateUI();

    engine.runRenderLoop(tick);
    window.addEventListener("resize", () => engine.resize());

    // Decorative idle flight while on the launch screen.
    scene.onBeforeRenderObservable.add(() => {
      if (state.status !== "playing" && playerRoot) {
        const t = performance.now() * 0.001;
        playerRoot.position.x = Math.sin(t * 0.7) * 1.1;
        playerRoot.position.y = Math.sin(t * 0.9) * 0.35;
        playerRoot.rotation.z = Math.sin(t * 1.1) * 0.15;
        if (playerSprite) {
          playerSprite.position.copyFrom(playerRoot.position);
          playerSprite.position.z = playerRoot.position.z + 0.42;
          playerSprite.angle = Math.PI - playerRoot.rotation.z * 0.75;
          playerSprite.size = 3.85 + Math.sin(t * 2.1) * 0.08;
        }
      }
    });
  }

  init();
})();
