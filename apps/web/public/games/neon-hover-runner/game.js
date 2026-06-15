(() => {
  "use strict";

  const canvas = document.getElementById("c");
  const ctx = canvas?.getContext("2d", { alpha: false });
  if (!canvas || !ctx) return;

  const $ = (id) => document.getElementById(id);
  const refs = {
    score: $("score"),
    best: $("best"),
    speed: $("speed"),
    lives: $("lives"),
    rewards: $("rewards"),
    combo: $("comboBadge"),
    zoneName: $("zoneName"),
    zoneNumber: $("zoneNumber"),
    missionText: $("missionText"),
    boostFill: $("boostFill"),
    boostLabel: $("boostLabel"),
    shieldFill: $("shieldFill"),
    shieldLabel: $("shieldLabel"),
    progressFill: $("progressFill"),
    progressLabel: $("progressLabel"),
    panel: $("panel"),
    panelTitle: $("panelTitle"),
    panelText: $("panelText"),
    btnStart: $("btnStart"),
    btnOverlay: $("btnOverlay"),
    uiPause: $("uiPause"),
    uiMute: $("uiMute"),
    uiRestart: $("uiRestart"),
  };

  const GAME_SLUG = "neon-hover-runner";
  const BEST_KEY = "gg_neon_hover_runner_best_v3";
  const LANES = [-0.8, -0.4, 0, 0.4, 0.8];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const choose = (arr) => arr[(Math.random() * arr.length) | 0];

  const IMAGE_SOURCES = {
    player: ["./assets/sprites/hovercraft-animated.png", "./assets/sprites/hovercraft.png"],
    playerBoost: ["./assets/sprites/hovercraft-boost.png", "./assets/sprites/hovercraft.png"],
    orb: ["./assets/sprites/data-orb.png", "./assets/sprites/energy-orb.png"],
    shard: ["./assets/sprites/data-shard.png", "./assets/sprites/energy-orb.png"],
    boost: ["./assets/sprites/boost-core.png", "./assets/sprites/boost.png"],
    shield: ["./assets/sprites/shield-core.png", "./assets/sprites/shield.png"],
    magnet: ["./assets/sprites/magnet-core.png", "./assets/sprites/magnet.png"],
    barrier: ["./assets/sprites/barrier-neon.png", "./assets/sprites/barrier.png"],
    mine: ["./assets/sprites/mine.png"],
    drone: ["./assets/sprites/drone.png"],
    bg1: ["./assets/backgrounds/level-01-skyline.png", "./assets/backgrounds/cyber-track.png"],
    bg2: ["./assets/backgrounds/level-02-metro.png", "./assets/backgrounds/cyber-track-alt.png"],
    bg3: ["./assets/backgrounds/level-03-data-tunnel.png", "./assets/backgrounds/cyber-track.png"],
    bg4: ["./assets/backgrounds/level-04-reactor-bridge.png", "./assets/backgrounds/cyber-track-alt.png"],
    bg5: ["./assets/backgrounds/level-05-apex-grid.png", "./assets/backgrounds/cyber-track.png"],
    surf1: ["./assets/surfaces/track-grid.png"],
    surf2: ["./assets/surfaces/track-energy.png"],
    surf3: ["./assets/surfaces/track-tunnel.png"],
    surf4: ["./assets/surfaces/track-reactor.png"],
    surf5: ["./assets/surfaces/track-apex.png"],
  };

  const LEVELS = [
    {
      name: "Skyline Warmup",
      objective: "Collect 12 energy orbs while learning the lanes.",
      missionType: "orbs",
      target: 12,
      goal: 1100,
      bg: "bg1",
      surface: "surf1",
      speedBonus: 0.00,
      lanes: 5,
      colors: { sky: "#071426", fog: "rgba(69,220,255,.12)", left: "rgba(69,220,255,.85)", right: "rgba(255,84,208,.75)", track: "#101d3d", accent: "#45dcff" },
      spawn: { obstacleMin: 0.85, obstacleMax: 1.18, pickupMin: 0.56, pickupMax: 0.82, doubleChance: 0.18 },
      music: [165, 220, 247, 330, 247, 220],
    },
    {
      name: "Metro Surge",
      objective: "Use boost 2 times and keep the delivery core moving.",
      missionType: "boosts",
      target: 2,
      goal: 1350,
      bg: "bg2",
      surface: "surf2",
      speedBonus: 0.12,
      lanes: 5,
      colors: { sky: "#120b24", fog: "rgba(255,84,208,.10)", left: "rgba(78,255,233,.86)", right: "rgba(255,124,210,.80)", track: "#19133b", accent: "#ff54d0" },
      spawn: { obstacleMin: 0.78, obstacleMax: 1.06, pickupMin: 0.52, pickupMax: 0.76, doubleChance: 0.26 },
      music: [185, 247, 294, 370, 294, 247],
    },
    {
      name: "Data Tunnel",
      objective: "Maintain a combo of 8 by chaining perfect pickups.",
      missionType: "combo",
      target: 8,
      goal: 1500,
      bg: "bg3",
      surface: "surf3",
      speedBonus: 0.22,
      lanes: 5,
      colors: { sky: "#05131f", fog: "rgba(120,255,215,.08)", left: "rgba(103,255,221,.88)", right: "rgba(117,170,255,.80)", track: "#0c2030", accent: "#77ffc8" },
      spawn: { obstacleMin: 0.72, obstacleMax: 0.98, pickupMin: 0.48, pickupMax: 0.70, doubleChance: 0.32 },
      music: [147, 220, 262, 294, 330, 294],
    },
    {
      name: "Reactor Bridge",
      objective: "Survive 18 seconds without losing a life.",
      missionType: "survive",
      target: 18,
      goal: 1750,
      bg: "bg4",
      surface: "surf4",
      speedBonus: 0.35,
      lanes: 5,
      colors: { sky: "#1b0d10", fog: "rgba(255,176,76,.10)", left: "rgba(255,214,99,.90)", right: "rgba(255,92,132,.76)", track: "#241725", accent: "#ffd76d" },
      spawn: { obstacleMin: 0.66, obstacleMax: 0.94, pickupMin: 0.45, pickupMax: 0.66, doubleChance: 0.38 },
      music: [110, 147, 165, 220, 196, 147],
    },
    {
      name: "Apex Night Run",
      objective: "Collect 6 data shards and reach the core uplink.",
      missionType: "shards",
      target: 6,
      goal: 2000,
      bg: "bg5",
      surface: "surf5",
      speedBonus: 0.50,
      lanes: 5,
      colors: { sky: "#050712", fog: "rgba(154,107,255,.11)", left: "rgba(69,220,255,.92)", right: "rgba(255,84,208,.84)", track: "#0e1230", accent: "#9a6bff" },
      spawn: { obstacleMin: 0.58, obstacleMax: 0.86, pickupMin: 0.42, pickupMax: 0.62, doubleChance: 0.46 },
      music: [196, 262, 330, 392, 330, 262],
    },
  ];

  let W = 1;
  let H = 1;
  let DPR = 1;
  let running = false;
  let paused = false;
  let dead = false;
  let muted = false;
  let storyComplete = false;

  let score = 0;
  let best = Number(localStorage.getItem(BEST_KEY) || 0) || 0;
  let lives = 3;
  let rewards = 0;
  let distance = 0;
  let totalDistance = 0;
  let speed = 1;
  let boostMeter = 0;
  let boostTimer = 0;
  let shieldTimer = 0;
  let magnetTimer = 0;
  let combo = 0;
  let comboTimer = 0;
  let screenShake = 0;
  let missionProgress = 0;
  let missionComplete = false;
  let zoneIndex = 0;
  let zoneDistance = 0;
  let zoneStartScore = 0;
  let zoneStartTime = 0;
  let boostUsesInZone = 0;
  let lastSafeLifeCount = 3;
  let lastT = performance.now();
  let lastLiveScore = -1;
  let lastLiveAt = 0;
  let spawnTimer = 0;
  let pickupTimer = 0;

  const state = {
    player: {
      laneIndex: 2,
      laneTarget: 2,
      x: 0,
      jump: 0,
      vy: 0,
      tilt: 0,
      bob: 0,
      invuln: 0,
    },
    objects: [],
    particles: [],
    floaters: [],
    trails: [],
    bgStars: [],
  };

  const images = {};

  let AC = null;
  let master = null;
  let musicTimer = null;
  let musicStep = 0;

  function currentLevel() {
    return LEVELS[Math.min(zoneIndex, LEVELS.length - 1)];
  }

  function zoneProgressRatio() {
    return clamp(zoneDistance / currentLevel().goal, 0, 1);
  }

  function horizonY() {
    return H * 0.30;
  }

  function centerX() {
    return W * 0.5;
  }

  function playerBaseY() {
    return H * 0.84;
  }

  function lanePixels(progress) {
    const p = Math.pow(progress, 1.3);
    return lerp(W * 0.10, W * 0.46, p);
  }

  function worldToScreen(laneNorm, progress) {
    const p = clamp(progress, 0, 1.18);
    const y = lerp(horizonY(), H * 0.92, Math.pow(p, 1.52));
    const x = centerX() + laneNorm * lanePixels(p);
    const scale = lerp(0.18, 1.48, Math.pow(p, 1.18));
    return { x, y, scale, p };
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function setPanel(title, text, show = true) {
    if (refs.panelTitle) refs.panelTitle.textContent = title;
    if (refs.panelText) refs.panelText.textContent = text;
    if (refs.panel) refs.panel.style.display = show ? "flex" : "none";
  }

  function hidePanel() {
    if (refs.panel) refs.panel.style.display = "none";
  }

  function resize() {
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(rect.width || window.innerWidth));
    H = Math.max(1, Math.floor(rect.height || window.innerHeight));
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function makeStars() {
    state.bgStars.length = 0;
    for (let i = 0; i < 90; i++) {
      state.bgStars.push({
        x: Math.random(),
        y: Math.random(),
        s: rand(1, 3.5),
        a: rand(0.08, 0.55),
        drift: rand(0.03, 0.16),
        hue: choose(["69,220,255", "255,84,208", "255,215,109", "119,255,200"]),
      });
    }
  }

  function loadImage(path) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = path;
    });
  }

  async function loadFirstImage(paths = []) {
    for (const path of paths) {
      const img = await loadImage(path);
      if (img) return img;
    }
    return null;
  }

  async function loadAssets() {
    const entries = Object.entries(IMAGE_SOURCES);
    const loaded = await Promise.all(entries.map(([, paths]) => loadFirstImage(paths)));
    entries.forEach(([key], index) => {
      images[key] = loaded[index];
    });
  }

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
    if (AC.state === "suspended") AC.resume().catch(() => {});
    return AC;
  }

  function tone(freq, dur = 0.08, type = "triangle", gain = 0.05, delay = 0) {
    const ac = ensureAudio();
    if (!ac || muted) return;
    const start = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g);
    g.connect(master || ac.destination);
    osc.start(start);
    osc.stop(start + dur + 0.04);
  }

  function noise(dur = 0.1, gain = 0.04) {
    const ac = ensureAudio();
    if (!ac || muted) return;
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource();
    const g = ac.createGain();
    src.buffer = buffer;
    g.gain.value = gain;
    src.connect(g);
    g.connect(master || ac.destination);
    src.start();
    src.stop(ac.currentTime + dur);
  }

  function sfx(name) {
    if (name === "start") { tone(220, 0.08, "triangle", 0.045); tone(330, 0.08, "triangle", 0.035, 0.05); tone(440, 0.10, "sine", 0.028, 0.1); return; }
    if (name === "jump") { tone(520, 0.06, "sine", 0.05); tone(820, 0.07, "triangle", 0.03, 0.03); return; }
    if (name === "lane") { tone(430, 0.04, "triangle", 0.03); return; }
    if (name === "pickup") { tone(1040, 0.05, "triangle", 0.04); tone(1560, 0.05, "sine", 0.024, 0.02); return; }
    if (name === "boost") { tone(320, 0.07, "sawtooth", 0.045); tone(640, 0.12, "triangle", 0.032, 0.04); return; }
    if (name === "shield") { tone(580, 0.08, "sine", 0.045); tone(410, 0.12, "triangle", 0.03, 0.06); return; }
    if (name === "hit") { noise(0.17, 0.07); tone(140, 0.18, "sawtooth", 0.05); return; }
    if (name === "zone") { tone(330, 0.10, "triangle", 0.05); tone(440, 0.12, "triangle", 0.04, 0.06); tone(660, 0.18, "sine", 0.03, 0.12); return; }
    if (name === "mission") { tone(494, 0.08, "triangle", 0.045); tone(659, 0.10, "triangle", 0.035, 0.05); return; }
    if (name === "gameover") { tone(220, 0.10, "sawtooth", 0.055); tone(165, 0.14, "sine", 0.04, 0.08); tone(110, 0.20, "sine", 0.03, 0.18); return; }
  }

  function musicTick() {
    if (!running || paused || muted) return;
    const notes = currentLevel().music;
    const n = notes[musicStep++ % notes.length];
    tone(n, 0.14, "triangle", 0.013);
    if (musicStep % 2 === 0) tone(n * 2, 0.06, "sine", 0.009, 0.03);
    if (musicStep % 4 === 0) tone(n / 2, 0.05, "sawtooth", 0.008, 0.02);
  }

  function startMusic() {
    if (musicTimer || muted) return;
    musicTimer = setInterval(musicTick, 230);
  }

  function stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  function ggScore(mode = "live") {
    const clean = Math.max(0, Math.floor(score));
    const now = performance.now();
    if (mode === "live" && clean === lastLiveScore && now - lastLiveAt < 150) return;
    if (mode === "live" && now - lastLiveAt < 90) return;
    lastLiveScore = clean;
    lastLiveAt = now;

    const payload = {
      type: "GG_SCORE",
      gameSlug: GAME_SLUG,
      slug: GAME_SLUG,
      score: clean,
      best,
      mode,
      speed: Number(speed.toFixed(2)),
      lives,
      rewards,
      level: zoneIndex + 1,
      distance: Math.floor(totalDistance),
    };
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== "live") {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.(payload, "*"); } catch {}
    try { window.parent?.postMessage?.({ ...payload, type: "gg:score" }, "*"); } catch {}
  }

  function updateMissionText() {
    const level = currentLevel();
    let progressText = "";
    if (level.missionType === "orbs") progressText = `${Math.floor(missionProgress)}/${level.target} orbs`;
    if (level.missionType === "boosts") progressText = `${Math.floor(missionProgress)}/${level.target} boosts`;
    if (level.missionType === "combo") progressText = `best combo ${Math.floor(missionProgress)}/${level.target}`;
    if (level.missionType === "survive") progressText = `${Math.floor(missionProgress)}/${level.target}s clean run`;
    if (level.missionType === "shards") progressText = `${Math.floor(missionProgress)}/${level.target} shards`;

    const suffix = missionComplete ? " • COMPLETE" : ` • ${progressText}`;
    if (refs.missionText) refs.missionText.textContent = `${level.objective}${suffix}`;
    if (refs.zoneName) refs.zoneName.textContent = level.name;
    if (refs.zoneNumber) refs.zoneNumber.textContent = `Zone ${Math.min(zoneIndex + 1, LEVELS.length)} / ${LEVELS.length}`;
  }

  function updateHUD() {
    if (refs.score) refs.score.textContent = String(Math.floor(score));
    if (refs.best) refs.best.textContent = String(Math.floor(best));
    if (refs.speed) refs.speed.textContent = `${speed.toFixed(1)}x`;
    if (refs.lives) refs.lives.textContent = String(lives);
    if (refs.rewards) refs.rewards.textContent = String(rewards);
    if (refs.combo) refs.combo.textContent = `x${Math.max(1, combo)}`;
    if (refs.boostFill) refs.boostFill.style.width = `${Math.round(boostMeter * 100)}%`;
    if (refs.boostLabel) refs.boostLabel.textContent = boostTimer > 0 ? "ACTIVE" : `${Math.round(boostMeter * 100)}%`;
    const shieldRatio = clamp(shieldTimer / 7, 0, 1);
    if (refs.shieldFill) refs.shieldFill.style.width = `${Math.round(shieldRatio * 100)}%`;
    if (refs.shieldLabel) refs.shieldLabel.textContent = shieldTimer > 0 ? `${shieldTimer.toFixed(1)}s` : "OFF";
    const ratio = zoneProgressRatio();
    if (refs.progressFill) refs.progressFill.style.width = `${Math.round(ratio * 100)}%`;
    if (refs.progressLabel) refs.progressLabel.textContent = `${Math.round(ratio * 100)}%`;
    updateMissionText();
    ggScore("live");
  }

  function resetMission() {
    missionProgress = 0;
    missionComplete = false;
    boostUsesInZone = 0;
    zoneStartTime = totalDistance / 100;
    zoneStartScore = score;
    lastSafeLifeCount = lives;
    updateMissionText();
  }

  function addFloater(x, y, text, color = "#fff", size = 18) {
    state.floaters.push({ x, y, text, color, size, age: 0, life: 0.95, vy: rand(-38, -22) });
  }

  function addParticles(x, y, color, count = 12, speedAmt = 180) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(speedAmt * 0.3, speedAmt);
      state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(1.5, 4.8), color, age: 0, life: rand(0.35, 0.85) });
    }
  }

  function laneNorm(index) {
    return LANES[clamp(index, 0, LANES.length - 1) | 0];
  }

  function spawnObject(type, kind, laneIndex, progress = -0.08) {
    state.objects.push({
      type,
      kind,
      laneIndex,
      lane: laneNorm(laneIndex),
      progress,
      rot: rand(0, Math.PI * 2),
      vr: rand(-2.4, 2.4),
      hit: false,
    });
  }

  function spawnObstaclePattern() {
    const level = currentLevel();
    const count = Math.random() < level.spawn.doubleChance ? 2 : 1;
    const used = new Set();
    for (let i = 0; i < count; i++) {
      let laneIndex = (Math.random() * level.lanes) | 0;
      while (used.has(laneIndex)) laneIndex = (Math.random() * level.lanes) | 0;
      used.add(laneIndex);
      const roll = Math.random();
      const kind = roll < 0.45 ? "barrier" : roll < 0.8 ? "mine" : "drone";
      spawnObject("obstacle", kind, laneIndex);
    }
  }

  function spawnPickupPattern() {
    const level = currentLevel();
    const laneIndex = (Math.random() * level.lanes) | 0;
    const roll = Math.random();
    let kind = "orb";
    if (zoneIndex === 0) kind = roll < 0.62 ? "orb" : roll < 0.80 ? "boost" : roll < 0.92 ? "shield" : "magnet";
    else if (zoneIndex < 4) kind = roll < 0.48 ? "orb" : roll < 0.65 ? "shard" : roll < 0.80 ? "boost" : roll < 0.92 ? "shield" : "magnet";
    else kind = roll < 0.42 ? "orb" : roll < 0.68 ? "shard" : roll < 0.82 ? "boost" : roll < 0.92 ? "shield" : "magnet";
    spawnObject("pickup", kind, laneIndex);
    if (Math.random() < 0.35) {
      const side = clamp(laneIndex + choose([-1, 1]), 0, level.lanes - 1);
      spawnObject("pickup", Math.random() < 0.75 ? "orb" : "shard", side, -0.14);
    }
  }

  function completeMission() {
    if (missionComplete) return;
    missionComplete = true;
    rewards += 1;
    score += 350;
    addFloater(W * 0.5, H * 0.3, "MISSION COMPLETE", "#ffd76d", 26);
    addParticles(W * 0.5, H * 0.3, "rgba(255,215,109,.95)", 28, 280);
    sfx("mission");
  }

  function checkMissionProgress() {
    const level = currentLevel();
    if (missionComplete) return;
    if (level.missionType === "orbs" && missionProgress >= level.target) completeMission();
    if (level.missionType === "boosts" && missionProgress >= level.target) completeMission();
    if (level.missionType === "combo" && missionProgress >= level.target) completeMission();
    if (level.missionType === "survive" && missionProgress >= level.target) completeMission();
    if (level.missionType === "shards" && missionProgress >= level.target) completeMission();
  }

  function collect(obj, x, y) {
    obj.hit = true;
    if (obj.kind === "orb") {
      combo += 1;
      comboTimer = 2.3;
      const gain = 30 + Math.min(140, combo * 8);
      score += gain;
      boostMeter = clamp(boostMeter + 0.035, 0, 1);
      missionProgress += 1;
      addFloater(x, y, `+${gain}`, "#ffd76d", 19);
      addParticles(x, y, "rgba(255,215,109,.95)", 14, 210);
      sfx("pickup");
    } else if (obj.kind === "shard") {
      combo += 1;
      comboTimer = 2.5;
      score += 85;
      boostMeter = clamp(boostMeter + 0.08, 0, 1);
      missionProgress += currentLevel().missionType === "shards" ? 1 : 0;
      addFloater(x, y, "DATA SHARD", "#45dcff", 20);
      addParticles(x, y, "rgba(69,220,255,.95)", 18, 230);
      sfx("pickup");
    } else if (obj.kind === "boost") {
      boostMeter = clamp(boostMeter + 0.32, 0, 1);
      score += 60;
      addFloater(x, y, "BOOST+", "#77ffc8", 20);
      addParticles(x, y, "rgba(119,255,200,.95)", 18, 220);
      sfx("boost");
    } else if (obj.kind === "shield") {
      shieldTimer = 7.0;
      score += 55;
      addFloater(x, y, "SHIELD", "#8edcff", 20);
      addParticles(x, y, "rgba(142,220,255,.95)", 18, 220);
      sfx("shield");
    } else if (obj.kind === "magnet") {
      magnetTimer = 7.0;
      score += 55;
      addFloater(x, y, "MAGNET", "#ff8de2", 20);
      addParticles(x, y, "rgba(255,141,226,.95)", 18, 220);
      sfx("pickup");
    }

    if (currentLevel().missionType === "combo") missionProgress = Math.max(missionProgress, combo);
    checkMissionProgress();
  }

  function hitObstacle(obj, x, y) {
    if (obj.hit) return;
    obj.hit = true;
    if (shieldTimer > 0 || state.player.invuln > 0) {
      shieldTimer = Math.max(0, shieldTimer - 2.0);
      score += 25;
      addFloater(x, y, "BLOCKED", "#a7f3ff", 19);
      addParticles(x, y, "rgba(167,243,255,.95)", 20, 260);
      screenShake = 8;
      sfx("shield");
      return;
    }
    lives -= 1;
    combo = 0;
    comboTimer = 0;
    state.player.invuln = 1.1;
    screenShake = 15;
    missionProgress = currentLevel().missionType === "survive" ? 0 : missionProgress;
    lastSafeLifeCount = lives;
    addFloater(x, y, "-1 LIFE", "#ff7e9c", 22);
    addParticles(x, y, "rgba(255,126,156,.95)", 28, 300);
    sfx("hit");
    if (lives <= 0) {
      gameOver("System crash! Run failed.");
    }
  }

  function advanceLevel() {
    if (zoneIndex < LEVELS.length - 1) {
      rewards += missionComplete ? 1 : 0;
      lives = clamp(lives + 1, 1, 5);
      zoneIndex += 1;
      zoneDistance = 0;
      spawnTimer = 0;
      pickupTimer = 0;
      resetMission();
      screenShake = 8;
      addFloater(W * 0.5, H * 0.28, `ZONE ${zoneIndex + 1}`, "#ffffff", 28);
      addParticles(W * 0.5, H * 0.28, "rgba(69,220,255,.9)", 26, 280);
      sfx("zone");
      setPanel(currentLevel().name, `Checkpoint reached!\n\n${currentLevel().objective}\n\nTap Start or the screen to continue.`, true);
      paused = true;
      stopMusic();
      updateHUD();
    } else if (!storyComplete) {
      storyComplete = true;
      rewards += missionComplete ? 1 : 0;
      score += 750;
      sfx("zone");
      gameOver("Core restored! You completed the Neon Hover Runner campaign.");
    }
  }

  function changeLane(dir) {
    const player = state.player;
    const next = clamp(player.laneTarget + dir, 0, LANES.length - 1);
    if (next !== player.laneTarget) {
      player.laneTarget = next;
      sfx("lane");
    }
  }

  function activateBoost() {
    if (!running || paused || dead || boostTimer > 0 || boostMeter < 0.34) return;
    ensureAudio();
    boostTimer = 2.5 + boostMeter * 1.8;
    boostMeter = 0;
    boostUsesInZone += 1;
    if (currentLevel().missionType === "boosts") missionProgress = boostUsesInZone;
    checkMissionProgress();
    screenShake = 5;
    addFloater(W * 0.5, H * 0.34, "BOOST!", "#77ffc8", 24);
    sfx("boost");
  }

  function jump() {
    if (!running || paused || dead) return;
    if (state.player.jump > 2) return;
    state.player.vy = 890;
    sfx("jump");
  }

  function resetGame() {
    running = true;
    paused = false;
    dead = false;
    storyComplete = false;
    score = 0;
    lives = 3;
    rewards = 0;
    distance = 0;
    totalDistance = 0;
    speed = 1;
    boostMeter = 0;
    boostTimer = 0;
    shieldTimer = 0;
    magnetTimer = 0;
    combo = 0;
    comboTimer = 0;
    screenShake = 0;
    missionProgress = 0;
    missionComplete = false;
    zoneIndex = 0;
    zoneDistance = 0;
    lastSafeLifeCount = lives;
    spawnTimer = 0;
    pickupTimer = 0;
    state.player.laneIndex = 2;
    state.player.laneTarget = 2;
    state.player.x = 0;
    state.player.jump = 0;
    state.player.vy = 0;
    state.player.tilt = 0;
    state.player.bob = 0;
    state.player.invuln = 1.1;
    state.objects.length = 0;
    state.particles.length = 0;
    state.floaters.length = 0;
    state.trails.length = 0;
    makeStars();
    resetMission();
    hidePanel();
    sfx("start");
    startMusic();
    updateHUD();
  }

  function gameOver(reason) {
    if (dead) return;
    running = false;
    dead = true;
    stopMusic();
    if (score > best) {
      best = Math.floor(score);
      localStorage.setItem(BEST_KEY, String(best));
    }
    sfx("gameover");
    ggScore("game_over");
    const text = `${reason}\n\nScore: ${Math.floor(score)}\nBest: ${Math.floor(best)}\nRewards earned: ${rewards}\nZone reached: ${Math.min(zoneIndex + 1, LEVELS.length)} / ${LEVELS.length}\n\nTap Start Run or Restart to go again.`;
    setPanel(dead && storyComplete ? "Campaign Complete" : "Run Over", text, true);
    updateHUD();
  }

  let pointerActive = false;
  let downX = 0;
  let downY = 0;
  let lastX = 0;
  let lastY = 0;
  let moved = false;

  function pointerPos(ev) {
    const r = canvas.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  }

  canvas.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    ensureAudio();
    if (!running || dead) {
      resetGame();
      return;
    }
    if (paused) {
      paused = false;
      hidePanel();
      startMusic();
      lastT = performance.now();
      return;
    }
    pointerActive = true;
    const p = pointerPos(ev);
    downX = lastX = p.x;
    downY = lastY = p.y;
    moved = false;
  }, { passive: false });

  canvas.addEventListener("pointermove", (ev) => {
    if (!pointerActive || !running || paused) return;
    const p = pointerPos(ev);
    const dx = p.x - lastX;
    const dy = p.y - lastY;
    if (Math.abs(p.x - downX) > 10 || Math.abs(p.y - downY) > 10) moved = true;
    if (Math.abs(dx) > 26 && Math.abs(dx) > Math.abs(dy)) {
      changeLane(dx > 0 ? 1 : -1);
      lastX = p.x;
      downX = p.x;
    } else {
      lastX = p.x;
    }
    if (dy < -34 && Math.abs(dy) > Math.abs(dx) * 1.1) {
      activateBoost();
      lastY = p.y;
      downY = p.y;
    } else {
      lastY = p.y;
    }
  }, { passive: true });

  function endPointer() {
    if (!pointerActive) return;
    pointerActive = false;
    const totalDx = lastX - downX;
    const totalDy = lastY - downY;
    if (totalDy < -40 && Math.abs(totalDy) > Math.abs(totalDx) * 1.1) activateBoost();
    else if (!moved || Math.hypot(totalDx, totalDy) < 20) jump();
  }
  canvas.addEventListener("pointerup", endPointer, { passive: true });
  canvas.addEventListener("pointercancel", endPointer, { passive: true });
  canvas.addEventListener("pointerleave", endPointer, { passive: true });

  window.addEventListener("keydown", (ev) => {
    const key = ev.key.toLowerCase();
    if (key === "arrowleft" || key === "a") changeLane(-1);
    if (key === "arrowright" || key === "d") changeLane(1);
    if (key === " " || key === "arrowup" || key === "w") jump();
    if (key === "shift" || key === "b") activateBoost();
    if (key === "p") togglePause();
  });

  function update(dt) {
    if (!running || paused || dead) return;
    const level = currentLevel();
    const player = state.player;

    speed = clamp(1 + totalDistance / 1800 + level.speedBonus + (boostTimer > 0 ? 0.82 : 0), 1, 4.2);
    const travel = dt * 0.23 * speed;
    distance += dt * 100 * speed;
    totalDistance += dt * 100 * speed;
    zoneDistance += dt * 100 * speed;
    score += dt * 16 * speed;
    if (score > best) best = Math.floor(score);

    if (boostTimer > 0) boostTimer = Math.max(0, boostTimer - dt);
    if (shieldTimer > 0) shieldTimer = Math.max(0, shieldTimer - dt);
    if (magnetTimer > 0) magnetTimer = Math.max(0, magnetTimer - dt);
    if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
    if (comboTimer > 0) comboTimer = Math.max(0, comboTimer - dt);
    else combo = 0;
    screenShake = Math.max(0, screenShake - dt * 36);

    player.laneIndex = lerp(player.laneIndex, player.laneTarget, 1 - Math.pow(0.001, dt));
    player.x = lerp(player.x, laneNorm(Math.round(player.laneTarget)), 1 - Math.pow(0.001, dt));
    player.tilt = lerp(player.tilt, (player.laneTarget - 2) * -0.08, 1 - Math.pow(0.01, dt));
    player.bob += dt * (boostTimer > 0 ? 14 : 9);

    player.vy -= 2350 * dt;
    player.jump += player.vy * dt;
    if (player.jump <= 0) {
      player.jump = 0;
      player.vy = 0;
    }

    spawnTimer -= dt * speed;
    pickupTimer -= dt * speed;
    if (spawnTimer <= 0) {
      spawnObstaclePattern();
      spawnTimer = rand(level.spawn.obstacleMin, level.spawn.obstacleMax) / Math.max(1, speed * 0.7);
    }
    if (pickupTimer <= 0) {
      spawnPickupPattern();
      pickupTimer = rand(level.spawn.pickupMin, level.spawn.pickupMax) / Math.max(1, speed * 0.7);
    }

    const playerX = centerX() + player.x * lanePixels(1);
    const playerY = playerBaseY() - player.jump + Math.sin(player.bob) * 4;
    const playerRect = { x: playerX - W * 0.06, y: playerY - H * 0.055, w: W * 0.12, h: H * 0.10 };

    for (let i = state.objects.length - 1; i >= 0; i--) {
      const obj = state.objects[i];
      if (magnetTimer > 0 && obj.type === "pickup") {
        const playerLane = laneNorm(Math.round(player.laneTarget));
        const pull = clamp((obj.progress - 0.32) * 1.6, 0, 1) * dt * 1.8;
        obj.lane = lerp(obj.lane, playerLane, pull);
      }
      obj.progress += travel;
      obj.rot += obj.vr * dt;
      const s = worldToScreen(obj.lane, obj.progress);
      if (obj.progress > 1.18) {
        state.objects.splice(i, 1);
        continue;
      }

      if (obj.progress > 0.74 && obj.progress < 1.05 && !obj.hit) {
        const size = obj.type === "obstacle" ? (obj.kind === "barrier" ? 0.18 : 0.15) : (obj.kind === "orb" ? 0.12 : 0.14);
        const rect = {
          x: s.x - W * size * s.scale * 0.5,
          y: s.y - W * size * s.scale * 0.5,
          w: W * size * s.scale,
          h: W * size * s.scale,
        };
        if (rectsOverlap(playerRect, rect)) {
          if (obj.type === "pickup") {
            collect(obj, s.x, s.y);
            state.objects.splice(i, 1);
          } else {
            const jumpClear = obj.kind === "barrier" && player.jump > H * 0.08;
            if (jumpClear) {
              obj.hit = true;
              score += 45;
              combo += 1;
              comboTimer = 1.6;
              if (currentLevel().missionType === "combo") missionProgress = Math.max(missionProgress, combo);
              addFloater(s.x, s.y, "CLEAR!", "#9cfffb", 18);
              addParticles(s.x, s.y, "rgba(156,255,251,.9)", 14, 200);
              checkMissionProgress();
            } else {
              hitObstacle(obj, s.x, s.y);
              if (lives > 0) state.objects.splice(i, 1);
            }
          }
        }
      }
    }

    if (currentLevel().missionType === "survive" && lives === lastSafeLifeCount) {
      missionProgress += dt;
      checkMissionProgress();
    }
    if (currentLevel().missionType === "combo") {
      missionProgress = Math.max(missionProgress, combo);
      checkMissionProgress();
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        state.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
    }

    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const f = state.floaters[i];
      f.age += dt;
      if (f.age >= f.life) {
        state.floaters.splice(i, 1);
        continue;
      }
      f.y += f.vy * dt;
    }

    state.trails.push({ x: playerX, y: playerY + H * 0.05, age: 0, life: 0.34, boost: boostTimer > 0 });
    for (let i = state.trails.length - 1; i >= 0; i--) {
      const tr = state.trails[i];
      tr.age += dt;
      if (tr.age > tr.life) state.trails.splice(i, 1);
    }

    if (zoneDistance >= level.goal) advanceLevel();
    updateHUD();
  }

  function drawFallbackBackground(level, t) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, level.colors.sky);
    sky.addColorStop(1, "#040814");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    for (let layer = 0; layer < 3; layer++) {
      const baseY = H * (0.42 + layer * 0.10);
      const amp = 18 + layer * 12;
      const speedMod = (layer + 1) * 0.0006;
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, baseY);
      for (let x = 0; x <= W + 40; x += 80) {
        const y = baseY + Math.sin(x * 0.014 + t * speedMod + layer) * amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = layer === 0 ? "rgba(69,220,255,.08)" : layer === 1 ? "rgba(255,84,208,.08)" : "rgba(154,107,255,.10)";
      ctx.fill();
    }
  }

  function drawBackground(t) {
    const level = currentLevel();
    const bg = images[level.bg];
    if (bg) {
      const sway = Math.sin(t * 0.00025) * 10;
      ctx.drawImage(bg, -8, sway - 14, W + 16, H + 28);
      ctx.fillStyle = "rgba(4,8,18,.24)";
      ctx.fillRect(0, 0, W, H);
    } else {
      drawFallbackBackground(level, t);
    }

    const vignette = ctx.createRadialGradient(W * 0.5, H * 0.45, H * 0.18, W * 0.5, H * 0.55, H * 0.9);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,.34)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);

    for (const s of state.bgStars) {
      const y = ((s.y * H + totalDistance * s.drift) % (H + 50)) - 25;
      const x = s.x * W + Math.sin(t * 0.001 + s.x * 10) * 11;
      ctx.fillStyle = `rgba(${s.hue},${s.a})`;
      ctx.beginPath();
      ctx.arc(x, y, s.s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTrack(t) {
    const level = currentLevel();
    const hy = horizonY();
    const bottom = H * 0.98;
    const leftH = W * 0.43;
    const rightH = W * 0.57;
    const leftB = W * 0.05;
    const rightB = W * 0.95;

    ctx.save();
    const trackG = ctx.createLinearGradient(0, hy, 0, bottom);
    trackG.addColorStop(0, level.colors.track);
    trackG.addColorStop(1, "rgba(7,11,23,.95)");
    ctx.fillStyle = trackG;
    ctx.beginPath();
    ctx.moveTo(leftH, hy);
    ctx.lineTo(rightH, hy);
    ctx.lineTo(rightB, bottom);
    ctx.lineTo(leftB, bottom);
    ctx.closePath();
    ctx.fill();

    // clipped surface texture / procedural grid
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(leftH, hy);
    ctx.lineTo(rightH, hy);
    ctx.lineTo(rightB, bottom);
    ctx.lineTo(leftB, bottom);
    ctx.closePath();
    ctx.clip();

    const surf = images[level.surface];
    if (surf) {
      for (let y = hy; y < bottom; y += 120) {
        ctx.globalAlpha = 0.16 + ((y - hy) / (bottom - hy)) * 0.18;
        ctx.drawImage(surf, 0, y + ((t * 0.02) % 120), W, 120);
      }
      ctx.globalAlpha = 1;
    }

    for (let i = 0; i < 20; i++) {
      const prog = (i / 20 + (distance * 0.0035) % 1) % 1;
      const y = lerp(hy, bottom, Math.pow(prog, 1.52));
      const left = centerX() - lanePixels(prog);
      const right = centerX() + lanePixels(prog);
      ctx.strokeStyle = `rgba(255,255,255,${0.04 + prog * 0.17})`;
      ctx.lineWidth = 1 + prog * 3;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
    }

    ctx.restore();

    ctx.lineWidth = 4;
    ctx.strokeStyle = level.colors.left;
    ctx.beginPath();
    ctx.moveTo(leftH, hy);
    ctx.lineTo(leftB, bottom);
    ctx.stroke();

    ctx.strokeStyle = level.colors.right;
    ctx.beginPath();
    ctx.moveTo(rightH, hy);
    ctx.lineTo(rightB, bottom);
    ctx.stroke();

    const laneMarks = [-0.8, -0.4, 0, 0.4, 0.8];
    for (let i = 0; i < laneMarks.length; i++) {
      const mark = laneMarks[i];
      ctx.strokeStyle = i === 2 ? "rgba(255,255,255,.18)" : "rgba(120,220,255,.16)";
      ctx.lineWidth = i === 2 ? 2 : 1.2;
      ctx.beginPath();
      for (let j = 0; j <= 22; j++) {
        const p = j / 22;
        const y = lerp(hy, bottom, Math.pow(p, 1.52));
        const x = centerX() + mark * lanePixels(p);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // decorative rings / gates
    for (let i = 0; i < 5; i++) {
      const prog = ((i / 5) + (distance * 0.0009)) % 1;
      const y = lerp(hy - 40, hy + 60, prog);
      const radius = lerp(24, 210, prog);
      ctx.strokeStyle = `rgba(69,220,255,${0.04 - prog * 0.02 + 0.03})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX(), y, radius, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawImageCentered(img, x, y, w, h, rot = 0, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (img) ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function drawPickupShape(obj, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(obj.rot);
    if (obj.kind === "orb") {
      const g = ctx.createRadialGradient(0, 0, size * 0.08, 0, 0, size * 0.5);
      g.addColorStop(0, "rgba(255,255,255,.95)");
      g.addColorStop(0.35, "rgba(255,215,109,.95)");
      g.addColorStop(1, "rgba(255,160,80,.12)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else if (obj.kind === "shard") {
      ctx.fillStyle = "rgba(69,220,255,.95)";
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5);
      ctx.lineTo(size * 0.26, 0);
      ctx.lineTo(0, size * 0.5);
      ctx.lineTo(-size * 0.26, 0);
      ctx.closePath();
      ctx.fill();
    } else if (obj.kind === "boost") {
      ctx.fillStyle = "rgba(119,255,200,.95)";
      ctx.fillRect(-size * 0.25, -size * 0.45, size * 0.5, size * 0.9);
      ctx.fillStyle = "rgba(255,255,255,.75)";
      ctx.fillRect(-size * 0.08, -size * 0.34, size * 0.16, size * 0.68);
    } else if (obj.kind === "shield") {
      ctx.fillStyle = "rgba(142,220,255,.9)";
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.48);
      ctx.lineTo(size * 0.42, -size * 0.18);
      ctx.lineTo(size * 0.28, size * 0.38);
      ctx.lineTo(0, size * 0.52);
      ctx.lineTo(-size * 0.28, size * 0.38);
      ctx.lineTo(-size * 0.42, -size * 0.18);
      ctx.closePath();
      ctx.fill();
    } else if (obj.kind === "magnet") {
      ctx.strokeStyle = "rgba(255,141,226,.95)";
      ctx.lineWidth = Math.max(3, size * 0.12);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.25, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawObstacleShape(obj, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(obj.rot);
    if (obj.kind === "barrier") {
      ctx.fillStyle = "rgba(255,84,208,.9)";
      ctx.fillRect(-size * 0.5, -size * 0.22, size, size * 0.44);
      ctx.strokeStyle = "rgba(255,255,255,.35)";
      ctx.lineWidth = Math.max(2, size * 0.03);
      ctx.beginPath();
      ctx.moveTo(-size * 0.44, 0);
      ctx.lineTo(size * 0.44, 0);
      ctx.stroke();
    } else if (obj.kind === "mine") {
      ctx.fillStyle = "rgba(255,91,136,.92)";
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 * i) / 6);
        ctx.fillRect(-size * 0.03, -size * 0.52, size * 0.06, size * 0.2);
        ctx.restore();
      }
    } else if (obj.kind === "drone") {
      ctx.fillStyle = "rgba(69,220,255,.9)";
      ctx.fillRect(-size * 0.38, -size * 0.10, size * 0.76, size * 0.2);
      ctx.fillStyle = "rgba(255,84,208,.9)";
      ctx.fillRect(-size * 0.16, -size * 0.32, size * 0.32, size * 0.18);
      ctx.fillRect(-size * 0.16, size * 0.14, size * 0.32, size * 0.18);
    }
    ctx.restore();
  }

  function drawObjects(t) {
    const sorted = [...state.objects].sort((a, b) => a.progress - b.progress);
    for (const obj of sorted) {
      const s = worldToScreen(obj.lane, obj.progress);
      const alpha = clamp((obj.progress + 0.12) * 2, 0, 1);
      if (obj.type === "pickup") {
        const img = obj.kind === "orb" ? images.orb : obj.kind === "shard" ? images.shard : obj.kind === "boost" ? images.boost : obj.kind === "shield" ? images.shield : images.magnet;
        const size = (obj.kind === "orb" ? 54 : 60) * s.scale * (1 + Math.sin(t * 0.008 + obj.progress * 8) * 0.06);
        ctx.save();
        ctx.shadowColor = obj.kind === "orb" ? "rgba(255,215,109,.95)" : obj.kind === "shard" ? "rgba(69,220,255,.95)" : "rgba(119,255,200,.9)";
        ctx.shadowBlur = 20 * s.scale;
        if (img) drawImageCentered(img, s.x, s.y, size, size, obj.rot, alpha);
        else drawPickupShape(obj, s.x, s.y, size);
        ctx.restore();
      } else {
        const img = obj.kind === "barrier" ? images.barrier : obj.kind === "mine" ? images.mine : images.drone;
        const size = (obj.kind === "barrier" ? 108 : 74) * s.scale;
        ctx.save();
        ctx.shadowColor = obj.kind === "drone" ? "rgba(69,220,255,.85)" : "rgba(255,91,136,.9)";
        ctx.shadowBlur = 18 * s.scale;
        if (img) drawImageCentered(img, s.x, s.y, size, size * (obj.kind === "barrier" ? 0.72 : 1), obj.rot, alpha);
        else drawObstacleShape(obj, s.x, s.y, size);
        ctx.restore();
      }
    }
  }

  function drawPlayer(t) {
    const player = state.player;
    const x = centerX() + player.x * lanePixels(1);
    const y = playerBaseY() - player.jump + Math.sin(player.bob) * 4;
    const scale = clamp(W / 900, 0.78, 1.28);
    const w = 128 * scale;
    const h = 128 * scale;

    ctx.save();
    ctx.globalAlpha = 0.26 * (1 - clamp(player.jump / (H * 0.28), 0, 0.7));
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(x, H * 0.87, w * 0.44, h * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    for (const tr of state.trails) {
      const a = 1 - tr.age / tr.life;
      ctx.save();
      ctx.globalAlpha = a * (tr.boost ? 0.7 : 0.35);
      ctx.fillStyle = tr.boost ? "rgba(119,255,200,.65)" : "rgba(69,220,255,.35)";
      ctx.beginPath();
      ctx.ellipse(tr.x, tr.y, w * 0.28 * a, h * 0.14 * a, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (shieldTimer > 0 || player.invuln > 0) {
      ctx.save();
      ctx.strokeStyle = shieldTimer > 0 ? "rgba(142,220,255,.9)" : "rgba(255,255,255,.4)";
      ctx.lineWidth = 4;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(x, y, w * 0.56 + Math.sin(t * 0.01) * 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.tilt + Math.sin(player.bob) * 0.03);
    if (boostTimer > 0) {
      const flame = ctx.createRadialGradient(0, h * 0.28, 4, 0, h * 0.56, h * 0.56);
      flame.addColorStop(0, "rgba(255,255,255,.98)");
      flame.addColorStop(0.28, "rgba(119,255,200,.88)");
      flame.addColorStop(1, "rgba(119,255,200,0)");
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.ellipse(0, h * 0.46, w * 0.28, h * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = player.invuln > 0 && Math.sin(t * 0.03) > 0 ? 0.52 : 1;
    const img = boostTimer > 0 ? (images.playerBoost || images.player) : images.player;
    if (img) {
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      ctx.fillStyle = "rgba(69,220,255,.95)";
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.38);
      ctx.lineTo(w * 0.36, h * 0.1);
      ctx.lineTo(0, h * 0.38);
      ctx.lineTo(-w * 0.36, h * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,84,208,.9)";
      ctx.fillRect(-w * 0.12, -h * 0.16, w * 0.24, h * 0.32);
    }
    ctx.restore();
  }

  function drawParticles() {
    for (const p of state.particles) {
      const a = 1 - p.age / p.life;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFloaters() {
    for (const f of state.floaters) {
      const a = 1 - f.age / f.life;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = `1000 ${f.size}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,.45)";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  function drawPaused() {
    if (!paused || !running) return;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.24)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.font = "1000 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Paused", W * 0.5, H * 0.46);
    ctx.font = "800 14px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,.8)";
    ctx.fillText("Tap the screen or press Start Run to continue", W * 0.5, H * 0.51);
    ctx.restore();
  }

  function draw(t) {
    const shake = screenShake > 0 ? { x: rand(-screenShake, screenShake), y: rand(-screenShake, screenShake) } : { x: 0, y: 0 };
    ctx.save();
    ctx.translate(shake.x, shake.y);
    drawBackground(t);
    drawTrack(t);
    drawObjects(t);
    drawParticles();
    drawPlayer(t);
    drawFloaters();
    if (boostTimer > 0) {
      ctx.fillStyle = `rgba(69,220,255,${0.03 + Math.sin(t * 0.025) * 0.02})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
    drawPaused();
  }

  function loop(t) {
    const dt = Math.min(0.033, Math.max(0.001, (t - lastT) / 1000));
    lastT = t;
    update(dt);
    draw(t);
    requestAnimationFrame(loop);
  }

  function togglePause() {
    if (!running || dead) return;
    paused = !paused;
    if (paused) {
      stopMusic();
      setPanel("Paused", "Tap Start Run, Pause again, or the game screen to continue.\n\nChange lanes quickly, jump over barriers, and use boost when your meter is ready.", true);
    } else {
      hidePanel();
      startMusic();
      lastT = performance.now();
    }
  }

  refs.btnStart?.addEventListener("click", () => {
    ensureAudio();
    if (!running || dead) resetGame();
    else {
      paused = false;
      hidePanel();
      startMusic();
      lastT = performance.now();
    }
  });

  refs.btnOverlay?.addEventListener("click", () => {
    paused = running && !dead ? true : paused;
    stopMusic();
    setPanel("How to Play", "Swipe left and right to shift lanes.\nTap to jump over barriers.\nSwipe up or press Shift to trigger boost.\nCollect orbs, shards, shields, magnets, and boosts.\nComplete each zone mission to earn extra rewards.", true);
  });

  refs.uiPause?.addEventListener("click", togglePause);
  refs.uiRestart?.addEventListener("click", () => {
    ensureAudio();
    resetGame();
  });
  refs.uiMute?.addEventListener("click", () => {
    muted = !muted;
    if (refs.uiMute) refs.uiMute.textContent = muted ? "Muted" : "Sound";
    if (muted) stopMusic();
    else if (running && !paused) startMusic();
  });

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("message", (ev) => {
    const data = ev.data || {};
    const type = data.type || data.event;
    if (type === "GG_PAUSE") {
      paused = !!data.payload?.paused;
      if (paused) stopMusic();
      else if (running) startMusic();
    }
    if (type === "GG_MUTE") {
      muted = !!data.payload?.muted;
      if (refs.uiMute) refs.uiMute.textContent = muted ? "Muted" : "Sound";
      if (muted) stopMusic();
      else if (running && !paused) startMusic();
    }
    if (type === "GG_RESTART") resetGame();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      paused = true;
      stopMusic();
    } else {
      lastT = performance.now();
    }
  });

  async function boot() {
    resize();
    makeStars();
    await loadAssets();
    setPanel("Neon Hover Runner", "The city grid is failing. Race through five neon districts, complete missions, and deliver the core signal before the blackout spreads.\n\nTap Start Run to begin.", true);
    updateHUD();
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    requestAnimationFrame(loop);
  }

  boot();
})();
