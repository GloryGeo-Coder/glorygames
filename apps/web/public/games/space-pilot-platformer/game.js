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
    asteroid: "assets/sprites/asteroid_sheet.png",
    core: "assets/sprites/star_crystal.png",
    shield: "assets/sprites/shield_pickup.png",
    time: "assets/sprites/time_pickup.png"
  };

  const LEVELS = [
    {
      name: "Crash Landing",
      zone: "Lunar Debris Field",
      mission: "Collect 8 star cores and reach the rescue portal.",
      tip: "Pilot Nova: Use short jumps. The asteroid platforms are uneven but safe if you land near the centre.",
      bg: 0,
      width: 3300,
      cores: 8,
      enemies: 4,
      hazard: "meteor"
    },
    {
      name: "Asteroid Platforms",
      zone: "Broken Belt",
      mission: "Cross moving platforms and collect 10 star cores.",
      tip: "Moving platforms carry you. Wait for the right rhythm before jumping.",
      bg: 1,
      width: 3800,
      cores: 10,
      enemies: 6,
      hazard: "laser"
    },
    {
      name: "Pirate Outpost",
      zone: "Outer Relay",
      mission: "Disable pirate drones and unlock the portal.",
      tip: "Shoot drones before jumping into their patrol path.",
      bg: 2,
      width: 4200,
      cores: 11,
      enemies: 9,
      hazard: "mine"
    },
    {
      name: "Crystal Nebula Ruins",
      zone: "Violet Cloud",
      mission: "Activate the crystal bridge and survive plasma traps.",
      tip: "Shield dash gives a short burst and reduces incoming damage.",
      bg: 4,
      width: 4600,
      cores: 13,
      enemies: 10,
      hazard: "plasma"
    },
    {
      name: "Space Station Wreckage",
      zone: "Orbit Ring",
      mission: "Recover station cores from the destroyed ring.",
      tip: "Watch for floating drone fire. Jump, shoot, then keep moving.",
      bg: 3,
      width: 5100,
      cores: 14,
      enemies: 12,
      hazard: "laser"
    },
    {
      name: "Comet Foundry",
      zone: "Ice Tail",
      mission: "Cross icy platforms and collect 15 cryo-cores.",
      tip: "Ice platforms are slippery. Release movement earlier than normal.",
      bg: 4,
      width: 5400,
      cores: 15,
      enemies: 13,
      hazard: "meteor"
    },
    {
      name: "NOVA-X Fortress",
      zone: "Enemy Capital",
      mission: "Find the command key and reach the boss gate.",
      tip: "The fortress has the hardest jumps. Use double jump only after your first jump reaches peak height.",
      bg: 5,
      width: 5900,
      cores: 16,
      enemies: 15,
      hazard: "mine"
    },
    {
      name: "Final Gate",
      zone: "Starfall Core",
      mission: "Defeat the NOVA-X Commander and escape through the portal.",
      tip: "Final mission. Keep distance, shoot the boss core, and collect shield pickups when they appear.",
      bg: 0,
      width: 6400,
      cores: 12,
      enemies: 16,
      boss: true,
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
  const audio = {
    ctx: null,
    muted: false,
    ensure() {
      if (this.ctx || this.muted) return;
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        this.muted = true;
      }
    },
    beep(freq = 440, dur = 0.08, type = "sine", gain = 0.035) {
      if (!this.ctx || this.muted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const amp = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      amp.gain.setValueAtTime(gain, now);
      amp.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(amp).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur);
    },
    jump() { this.beep(520, 0.08, "triangle", 0.025); },
    collect() { this.beep(880, 0.07, "sine", 0.03); },
    shoot() { this.beep(720, 0.05, "square", 0.018); },
    hurt() { this.beep(100, 0.14, "sawtooth", 0.04); },
    boom() { this.beep(82, 0.2, "sawtooth", 0.05); },
    power() { this.beep(980, 0.1, "triangle", 0.04); }
  };

  function loadImage(key, src) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    images[key] = img;
  }

  ASSETS.backgrounds.forEach((src, i) => loadImage(`bg${i}`, src));
  loadImage("enemy", ASSETS.enemy);
  loadImage("boss", ASSETS.boss);
  loadImage("asteroid", ASSETS.asteroid);
  loadImage("core", ASSETS.core);
  loadImage("shield", ASSETS.shield);
  loadImage("time", ASSETS.time);

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

    // Ground and asteroid base chunks.
    let x = 0;
    while (x < spec.width) {
      const gap = x > 400 && rand(x + index * 19) > 0.72 ? 120 + rand(x) * 120 : 0;
      if (gap) x += gap;
      const y = 650 + Math.sin(x * 0.005 + index) * 42;
      const w = 260 + rand(x + 3) * 250;
      platforms.push({ x, y, w, h: 46, type: "ground", color: "#53607c" });
      x += w;
    }

    // Floating platforms.
    const count = 17 + index * 3;
    for (let i = 0; i < count; i += 1) {
      const px = 340 + i * (spec.width - 780) / count + rand(i + index * 8) * 90;
      const py = 360 + rand(i * 13 + index) * 200;
      const moving = i % 5 === 2 || (index > 2 && i % 7 === 0);
      platforms.push({
        x: px,
        y: py,
        ox: px,
        oy: py,
        w: 150 + rand(i + 20) * 90,
        h: 26,
        type: moving ? "moving" : (index === 5 && i % 4 === 0 ? "ice" : "float"),
        phase: rand(i + 40) * 6.28,
        range: moving ? 90 + rand(i + 50) * 80 : 0,
        speed: moving ? 0.7 + rand(i + 70) * 0.7 : 0
      });
    }

    // Stairs near final portal.
    for (let i = 0; i < 5; i += 1) {
      platforms.push({ x: spec.width - 800 + i * 150, y: 570 - i * 52, w: 150, h: 24, type: "float" });
    }

    // Star cores.
    for (let i = 0; i < spec.cores + 5; i += 1) {
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
      enemies.push({
        x: p.x + 40 + rand(i + 5) * Math.max(30, p.w - 80),
        y: p.y - 42,
        vx: rand(i + 9) > 0.5 ? 55 : -55,
        w: 48,
        h: 34,
        hp: index > 5 ? 3 : 2,
        maxHp: index > 5 ? 3 : 2,
        homeX: p.x + p.w / 2,
        range: 120 + rand(i + 13) * 120,
        shoot: 1 + rand(i + 18) * 2,
        type: i % 4 === 0 && index > 2 ? "turret" : "drone",
        alive: true,
        frame: Math.floor(rand(i + 32) * 4)
      });
    }

    // Hazards.
    for (let i = 0; i < 9 + index * 2; i += 1) {
      hazards.push({
        x: 480 + i * (spec.width - 900) / (9 + index * 2) + rand(i + 222) * 80,
        y: 610 - rand(i + 19) * 150,
        w: 46,
        h: 46,
        type: spec.hazard,
        phase: rand(i + 3) * 6.28
      });
    }

    // Pickups.
    for (let i = 0; i < 6; i += 1) {
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
      enemies.push({
        x: spec.width - 540,
        y: 365,
        vx: 0,
        w: 180,
        h: 110,
        hp: 34,
        maxHp: 34,
        homeX: spec.width - 540,
        range: 220,
        shoot: 0.8,
        type: "boss",
        alive: true,
        frame: 0
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
    state.score += 800 + state.level * 180 + state.lives * 120;
    if (state.level >= LEVELS.length - 1) {
      endGame(true);
      return;
    }
    state.level += 1;
    startGame(false);
  }

  function endGame(win) {
    state.status = "ended";
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
    ui.missionText.textContent =
      `${state.cores}/${w.spec.cores} cores • ${state.enemiesDefeated}/${w.spec.enemies} drones • reach the portal`;
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
        e.x = e.homeX + Math.sin(state.time * 0.9) * e.range;
        e.y = 320 + Math.sin(state.time * 1.2) * 54;
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
        w.enemyShots.push({
          x: e.x,
          y: e.y,
          vx: dx / len * (e.type === "boss" ? 420 : 310),
          vy: dy / len * (e.type === "boss" ? 420 : 310),
          r: e.type === "boss" ? 8 : 6,
          life: 3,
          color: e.type === "boss" ? "#ff2fd6" : "#ff784a"
        });
        e.shoot = e.type === "boss" ? 0.62 : 1.1 + Math.random() * 1.2;
      }
      if (rectsOverlap(playerRect(), { x: e.x - e.w / 2, y: e.y - e.h / 2, w: e.w, h: e.h })) {
        damage(e.type === "boss" ? 24 : 16);
      }
    }

    // Hazards.
    for (const h of w.hazards) {
      const pulse = Math.sin(state.time * 3 + h.phase);
      if (rectsOverlap(playerRect(), { x: h.x - h.w / 2, y: h.y - h.h / 2, w: h.w, h: h.h })) {
        damage(pulse > -0.45 ? 16 : 8);
      }
    }

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
          addParticle(s.x, s.y, e.type === "boss" ? "#ff2fd6" : "#ff784a", 8);
          if (e.hp <= 0) {
            e.alive = false;
            state.enemiesDefeated += 1;
            state.score += e.type === "boss" ? 3000 : 220;
            addParticle(e.x, e.y, e.type === "boss" ? "#ff2fd6" : "#ff784a", e.type === "boss" ? 38 : 18);
            audio.boom();
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
      toast(`Need ${Math.max(0, w.spec.cores - state.cores)} more core(s)`);
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

  function drawSpriteSheet(img, frame, x, y, w, h, rot = 0, flip = 1) {
    if (!ready(img)) return false;
    const grid = img.naturalWidth > 700 || img.naturalHeight > 700 ? 2 : 1;
    const f = Math.floor(frame || 0) % (grid * grid);
    const sx = (f % grid) * img.naturalWidth / grid;
    const sy = Math.floor(f / grid) * img.naturalHeight / grid;
    const sw = img.naturalWidth / grid;
    const sh = img.naturalHeight / grid;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(flip, 1);
    ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
    ctx.restore();
    return true;
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
    const walk = Math.sin(state.time * 16) * (PLAYER.onGround && Math.abs(PLAYER.vx) > 30 ? 1 : 0);
    const blink = PLAYER.invuln > 0 && Math.floor(state.time * 18) % 2 === 0;
    if (blink) return;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.scale(PLAYER.dir, 1);

    // Jetpack flame only while jumping/dashing; no large triangle trail.
    if (!PLAYER.onGround || PLAYER.dashCd > 0.98) {
      const flame = 12 + Math.sin(state.time * 42) * 4;
      ctx.fillStyle = "rgba(255,212,74,.85)";
      ctx.shadowColor = "#ffd44a";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.ellipse(-18, 8, 7, flame, 0, 0, Math.PI * 2);
      ctx.fill();
    }

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

    // Shield ring
    if (state.shield > 0) {
      ctx.globalAlpha = 0.38;
      ctx.strokeStyle = "#64ffb8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 31, 43, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawEnemy(e) {
    if (!e.alive) return;
    const s = worldToScreen(e.x, e.y);
    if (s.x < -220 || s.x > canvas.clientWidth + 220 || s.y < -160 || s.y > canvas.clientHeight + 160) return;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.shadowColor = e.type === "boss" ? "#ff2fd6" : "#ff784a";
    ctx.shadowBlur = e.type === "boss" ? 26 : 16;

    if (e.type === "boss") {
      if (!drawSpriteSheet(images.boss, e.frame, 0, 0, 220, 140, 0, e.x > PLAYER.x ? -1 : 1)) {
        ctx.fillStyle = "#11182c";
        ctx.strokeStyle = "#ff2fd6";
        ctx.lineWidth = 4;
        roundRect(-92, -42, 184, 84, 18);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ff2fd6";
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255,255,255,.18)";
      roundRect(-82, -70, 164, 10, 999);
      ctx.fill();
      ctx.fillStyle = "#ff2fd6";
      roundRect(-82, -70, 164 * (e.hp / e.maxHp), 10, 999);
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
    ctx.globalAlpha = 0.78 + pulse * 0.22;
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
