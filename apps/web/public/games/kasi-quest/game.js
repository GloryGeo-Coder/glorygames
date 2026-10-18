/* Kasi Quest — Character Rivals v3.4
   WebGameArena standalone game
   Features:
   - Manual movement, shooting, moving enemies
   - NPC missions + locked objective gates
   - Mini-boss at the end of every level and a final multi-phase boss
   - Kasi-themed collectibles + wallet upgrades
   - Star rating per level
   - Daily generated challenge mode with score events
   - Combo scoring
   - Environmental obstacles: taxis, falling crates, collapsing platforms, doors/switches, trampolines
   - Generated background music using Web Audio, no external audio files required
*/
(() => {
  "use strict";

  const GAME_SLUG = "kasi-quest";
  const LEVEL_COUNT = 20;
  const TILE_DEFAULT = 32;
  const STORE_PREFIX = "wga_kasi_quest_v3";
  const BEST_KEY = `${STORE_PREFIX}_best`;
  const WALLET_KEY = `${STORE_PREFIX}_wallet`;
  const UPGRADES_KEY = `${STORE_PREFIX}_upgrades`;
  const STARS_KEY = `${STORE_PREFIX}_stars`;
  const DAILY_KEY = `${STORE_PREFIX}_daily_best`;
  const PROGRESS_KEY = `${STORE_PREFIX}_campaign`;

  const $ = (id) => document.getElementById(id);
  const canvas = $("c");
  const ctx = canvas?.getContext("2d", { alpha: true });

  const panel = $("panel");
  const btnStart = $("btnStart");
  const btnDaily = $("btnDaily");
  const btnPause = $("btnPause");
  const btnMute = $("btnMute");
  const btnMusic = $("btnMusic");
  const elScore = $("score");
  const elBest = $("best");
  const elCoins = $("coins");
  const elWallet = $("wallet");
  const elWalletPanel = $("walletPanel");
  const elLives = $("lives");
  const elCombo = $("combo");
  const elTime = $("time");
  const elLevelNum = $("levelNum");
  const elLevelLabel = $("levelLabel");
  const elLevelGrid = $("levelGrid");
  const elMissionText = $("missionText");
  const elShopGrid = $("shopGrid");
  const elStarSummary = $("starSummary");
  const elDailyBest = $("dailyBest");
  const btnLeft = $("btnLeft");
  const btnRight = $("btnRight");
  const btnJump = $("btnJump");
  const btnAction = $("btnAction");
  const shell = $("wrap");
  const hud = $("hud");
  const touch = $("touch");
  const btnHudPause = $("btnHudPause");
  const pauseMessage = $("pauseMessage");
  const missionHud = $("missionHud");
  const missionProgress = $("missionProgress");
  const presentation = window.KasiPresentation;
  const animation = window.KasiAnimation?.create();
  const enemyRoster = window.KasiEnemies;
  const actorKind = en => enemyRoster?.isRole(en.type) ? en.type : "enemy";
  let enemyTips = new Set();
  let nextEnemyTipAt = 0;
  async function loadEnemyArt() {
    if (!animation) return;
    const kinds = [...new Set((level?.enemies || []).map(en => en.type).filter(type => enemyRoster?.isRole(type)))];
    animation.retain(["player", "enemy", "boss", ...kinds]);
    for (const [kind, info] of Object.entries(window.KasiEnemyData?.atlases || {})) if (!kinds.includes(kind)) imageCache.delete(info.url);
    await animation.load(url => loadImageSafe(url, 15000), kinds);
  }
  const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  animation?.reduceMotion(!!motionPreference?.matches);
  motionPreference?.addEventListener?.("change", event => animation?.reduceMotion(event.matches));

  if (!canvas || !ctx || !panel || !btnStart || !btnPause || !btnMute || !elLevelGrid || !presentation) {
    console.error(`[${GAME_SLUG}] Missing required DOM elements.`);
    return;
  }

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, w, h, r) {
      const rr = Math.min(Number(r) || 0, Math.abs(w) / 2, Math.abs(h) / 2);
      this.moveTo(x + rr, y);
      this.arcTo(x + w, y, x + w, y + h, rr);
      this.arcTo(x + w, y + h, x, y + h, rr);
      this.arcTo(x, y + h, x, y, rr);
      this.arcTo(x, y, x + w, y, rr);
      return this;
    };
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const now = () => performance.now();

  function safeGet(key, fallback = "") {
    try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (_) {}
  }
  function safeJsonGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  }
  function safeJsonSet(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }
  function levelUrl(n) { return `./levels/level-${String(n).padStart(2, "0")}.json`; }

  function getTargetOrigin() {
    try { return window.location.origin || "*"; } catch (_) { return "*"; }
  }
  function getPlayerName() {
    return safeGet("gg_player_name") || safeGet("webgamearena_player_name") || safeGet("glorygames_player_name") || "Player";
  }

  // ----------------------------
  // Canvas sizing
  // ----------------------------
  let viewW = 1, viewH = 1, dpr = 1;
  let display = presentation.viewport(1, 1);
  let cameraState = null;
  let cameraInsets = { top: 90, bottom: 88 };
  function fitCanvas() {
    const availableHeight = window.visualViewport?.height || window.innerHeight;
    if (availableHeight) document.documentElement.style.setProperty("--game-height", `${Math.floor(availableHeight)}px`);
    const r = canvas.getBoundingClientRect();
    display = presentation.viewport(r.width, r.height, window.devicePixelRatio || 1);
    dpr = display.dpr;
    viewW = display.worldWidth;
    viewH = display.worldHeight;
    canvas.width = display.pixelWidth;
    canvas.height = display.pixelHeight;
    cameraState = null;
    measureCameraInsets();
  }
  function measureCameraInsets() {
    const hudBottom = hud?.getBoundingClientRect().bottom || 54;
    if (missionHud) missionHud.style.top = `${Math.ceil(hudBottom + 8)}px`;
    const missionBottom = !missionHud?.hidden ? missionHud.getBoundingClientRect().bottom : hudBottom;
    const leftPad = btnLeft?.getBoundingClientRect();
    cameraInsets = { top: Math.max(60, missionBottom + 12),
      bottom: touch && !touch.hidden && leftPad?.height ? Math.max(20, display.height - leftPad.top + 12) : 20 };
  }
  window.addEventListener("resize", fitCanvas, { passive: true });
  window.visualViewport?.addEventListener("resize", fitCanvas, { passive: true });
  document.addEventListener("fullscreenchange", fitCanvas);
  window.addEventListener("orientationchange", () => { pauseForInterruption(); requestAnimationFrame(fitCanvas); });
  fitCanvas();

  // ----------------------------
  // Audio + generated music
  // ----------------------------
  let muted = false;
  let musicEnabled = false;
  let audioCtx = null;
  let musicTimer = null;
  let musicStep = 0;
  const melody = [392, 440, 523, 440, 349, 392, 330, 392, 523, 587, 523, 440, 392, 349, 330, 392];
  const bass = [98, 98, 131, 131, 87, 87, 110, 110];

  function ensureAudio() {
    if (muted) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }
  function tone(freq = 440, dur = 0.05, type = "sine", gain = 0.035, start = 0) {
    const ac = ensureAudio();
    if (!ac) return;
    const t0 = ac.currentTime + start;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function beep(freq, dur, type, gain) { tone(freq, dur, type, gain); }
  function musicTick() {
    if (!musicEnabled || muted || !running || paused) return;
    const step = musicStep++;
    tone(melody[step % melody.length], 0.12, "triangle", 0.018, 0);
    if (step % 2 === 0) tone(bass[Math.floor(step / 2) % bass.length], 0.16, "sine", 0.028, 0.01);
    if (step % 4 === 2) tone(196, 0.045, "square", 0.012, 0.03);
  }
  function startMusic() {
    if (muted) return;
    musicEnabled = true;
    ensureAudio();
    if (!musicTimer) musicTimer = window.setInterval(musicTick, 230);
    if (btnMusic) btnMusic.textContent = "Music On";
  }
  function stopMusic() {
    musicEnabled = false;
    if (btnMusic) btnMusic.textContent = "Music";
  }

  // ----------------------------
  // Assets, optional fallbacks
  // ----------------------------
  const imageCache = new Map();
  const ASSETS = {
    playerIdle: "./assets/sprites/player_idle.png",
    playerRun: "./assets/sprites/player_run.png",
    enemy: "./assets/sprites/enemy.png",
    taxi: "./assets/obstacles/taxi.png",
    coin: "./assets/items/coin_spin.png",
    bgForLevel: (n) => `./assets/backgrounds/level-${String(n).padStart(2, "0")}.png`,
  };
  function loadImageSafe(url, timeoutMs = 0) {
    if (!url) return Promise.resolve(null);
    if (imageCache.has(url)) return Promise.resolve(imageCache.get(url));
    return new Promise((resolve) => {
      const img = new Image();
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true; if (timer !== null) window.clearTimeout(timer);
        if (value) imageCache.set(url, value);
        else imageCache.delete(url);
        resolve(value);
      };
      const timer = timeoutMs > 0 ? window.setTimeout(() => finish(null), timeoutMs) : null;
      img.onload = () => finish(img);
      img.onerror = () => finish(null);
      img.src = url;
    });
  }
  async function loadJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
    return res.json();
  }
  let imgPlayerIdle = null,
  imgPlayerRun = null,
  imgEnemy = null,
  imgTaxi = null,
  imgCoin = null,
  bgImg = null;

  async function loadAssetsOptional() {
  if (animation) await animation.load(url => loadImageSafe(url, 15000));
  [imgPlayerIdle, imgPlayerRun, imgEnemy, imgTaxi, imgCoin] = await Promise.all([
    animation?.has("player") ? null : loadImageSafe(ASSETS.playerIdle),
    animation?.has("player") ? null : loadImageSafe(ASSETS.playerRun),
    animation?.has("enemy") ? null : loadImageSafe(ASSETS.enemy),
    loadImageSafe(ASSETS.taxi),
    loadImageSafe(ASSETS.coin),
  ]);
}

  // ----------------------------
  // Persistent economy/upgrades
  // ----------------------------
  let best = Number(safeGet(BEST_KEY, "0")) || 0;
  let wallet = Number(safeGet(WALLET_KEY, "0")) || 0;
  const savedStars = safeJsonGet(STARS_KEY, {});
  let stars = {};
  for (let n = 1; n <= LEVEL_COUNT; n++) {
    const value = savedStars?.[n];
    if (Number.isInteger(value) && value >= 1 && value <= 3) stars[n] = value;
  }
  // Migrate actual completions from the eight-stage campaign without touching its economy.
  const legacyUnlocked = Math.min(LEVEL_COUNT, Math.max(0, ...Object.keys(stars).map(Number)) + 1);
  const progress = safeJsonGet(PROGRESS_KEY, {});
  let unlockedLevel = Math.max(legacyUnlocked,
    Number.isInteger(progress?.unlocked) ? clamp(progress.unlocked, 1, LEVEL_COUNT) : 1);
  let checkpoint = null;
  let timeGrace = 0;
  let dailyBestStore = safeJsonGet(DAILY_KEY, {});
  let upgrades = Object.assign({ fireRate: 0, shield: 0, doubleJump: 0, extraLife: 0 }, safeJsonGet(UPGRADES_KEY, {}));
  const SHOP = [
    { key: "fireRate", title: "Faster Shots", desc: "Shoot quicker", max: 3, cost: [8, 14, 24] },
    { key: "shield", title: "Start Shield", desc: "Spawn protected", max: 2, cost: [10, 20] },
    { key: "doubleJump", title: "Air Control", desc: "Extra jump perk", max: 2, cost: [12, 22] },
    { key: "extraLife", title: "Extra Life", desc: "More mistakes allowed", max: 3, cost: [10, 18, 30] },
  ];
  function saveEconomy() {
    safeSet(WALLET_KEY, wallet);
    safeJsonSet(UPGRADES_KEY, upgrades);
    safeJsonSet(STARS_KEY, stars);
    safeJsonSet(PROGRESS_KEY, { unlocked: unlockedLevel });
    safeJsonSet(DAILY_KEY, dailyBestStore);
  }

  // ----------------------------
  // Game state
  // ----------------------------
  let tileSize = TILE_DEFAULT;
  let level = null;
  let currentLevel = 1;
  let mode = "campaign";
  let running = false;
  let paused = false;
  let loading = false;
  let interrupted = false;
  let defeatRemaining = 0;
  let score = 0;
  let coinsCollected = 0;
  let collectiblesCollected = 0;
  let enemiesDefeated = 0;
  let bossesDefeated = 0;
  let levelTime = 0;
  let totalRunTime = 0;
  let walletEarnedThisRun = 0;
  let noDamage = true;
  let maxCombo = 1;
  let comboCount = 0;
  let comboTimer = 0;
  let lastLiveScoreAt = 0;
  let lastShotAt = -99;
  let lastNpcTalkAt = 0;
  let levelStartedAt = 0;
  let dailyDateKey = "";

let enemies = [];
let projectiles = [];
let enemyProjectiles = [];
let bosses = [];
let obstacles = [];
let doors = [];
let switches = [];
let floatingTexts = [];

// ----------------------------
// Global object scaling
// ----------------------------
const SCALE = {
  enemy: 1.28,
  boss: 1.45,
  coin: 1.40,
  collectible: 1.30,
  powerup: 1.30,
  projectile: 1.18,
};

  const player = {
    x: 80, y: 80, w: presentation.sizes.playerWidth, h: presentation.sizes.playerHeight,
    vx: 0, vy: 0, face: 1,
    onGround: false,
    jumpHeld: false,
    jumpHoldT: 0,
    airJumpsLeft: 0,
    shield: 0,
    invuln: 0,
    lives: 3,
    coyoteT: 0,
    jumpBufferT: 0,
  };

  const GRAVITY = 2300;
  const MOVE_ACC = 3900;
  const FRICTION = 4200;
  const MAX_SPEED = 455;
  const JUMP_V0 = 860;
  const JUMP_HOLD_MAX = 0.16;
  const JUMP_HOLD_BOOST = 1350;

  const input = { left: false, right: false, jump: false, action: false };
  const prevInput = { jump: false, action: false };
  const pressedEdges = { jump: false, action: false };
  const keyboard = new Set();
  const padPointers = new Map();
  const padButtons = new Map([["left", btnLeft], ["right", btnRight], ["jump", btnJump], ["action", btnAction]]);
  const keyActions = { arrowleft: "left", a: "left", arrowright: "right", d: "right", arrowup: "jump", w: "jump", " ": "jump", e: "action", enter: "action", shift: "action" };
  function syncInput() {
    for (const name of Object.keys(input)) {
      const pressed = [...keyboard].some((key) => keyActions[key] === name) || [...padPointers.values()].includes(name);
      if (pressed && !input[name] && name in pressedEdges) pressedEdges[name] = true;
      input[name] = pressed;
      padButtons.get(name)?.classList.toggle("active", pressed);
    }
  }
  function resetInput() {
    keyboard.clear();
    for (const [pointerId, name] of padPointers) {
      const el = padButtons.get(name);
      try { if (el?.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId); } catch (_) {}
    }
    padPointers.clear();
    syncInput();
    prevInput.jump = false;
    prevInput.action = false;
    pressedEdges.jump = false;
    pressedEdges.action = false;
    player.jumpHeld = false;
    player.jumpBufferT = 0;
  }

  function setKey(e, down) {
    const k = e.key.toLowerCase();
    if (down && (e.altKey || e.ctrlKey || e.metaKey)) return;
    if ((k === "escape" || k === "p") && down && !e.repeat && running && !loading) {
      e.preventDefault();
      setPaused(!paused);
      return;
    }
    if (!keyActions[k]) return;
    // Leave Enter/Space and arrows available to the menu's focused controls.
    if (!running || paused || !panel.hidden) return;
    e.preventDefault();
    if (down) keyboard.add(k);
    else keyboard.delete(k);
    syncInput();
  }
  window.addEventListener("keydown", (e) => setKey(e, true));
  window.addEventListener("keyup", (e) => setKey(e, false));

  function bindPad(el, name) {
    if (!el) return;
    el.style.userSelect = "none";
    el.style.webkitUserSelect = "none";
    el.style.touchAction = "none";
    const down = (e) => {
      if (!running || paused || (e.pointerType === "mouse" && e.button !== 0)) return;
      e.preventDefault();
      padPointers.set(e.pointerId, name);
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      syncInput();
      ensureAudio();
    };
    const up = (e) => {
      if (padPointers.get(e.pointerId) !== name) return;
      e.preventDefault();
      padPointers.delete(e.pointerId);
      syncInput();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("lostpointercapture", up);
  }
  bindPad(btnLeft, "left");
  bindPad(btnRight, "right");
  bindPad(btnJump, "jump");
  bindPad(btnAction, "action");
  document.addEventListener("visibilitychange", () => { if (document.hidden) pauseForInterruption(); });
  window.addEventListener("blur", pauseForInterruption);
  window.addEventListener("pagehide", pauseForInterruption);
  function pauseForInterruption() {
    resetInput();
    if (defeatRemaining > 0) { defeatRemaining = 0; syncPlayUI(); }
    if (running || loading) interrupted = true;
    if (running && !paused) setPaused(true, "Game paused. Resume when you are ready.");
  }

  // ----------------------------
  // Level normalization
  // ----------------------------
  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function normalizeRectList(list, fallbackH = 1) {
    return (Array.isArray(list) ? list : []).map((r) => ({
      x: Number(r.x) || 0,
      y: Number(r.y) || 0,
      w: Number(r.w ?? r.width ?? 1) || 1,
      h: Number(r.h ?? r.height ?? fallbackH) || fallbackH,
      ...r,
    }));
  }
  function toWorldRect(r) {
    return {
      x: Number(r.x || 0) * tileSize,
      y: Number(r.y || 0) * tileSize,
      w: Number(r.w ?? r.width ?? 1) * tileSize,
      h: Number(r.h ?? r.height ?? 1) * tileSize,
      ref: r,
    };
  }
  function normalizeCollectibles(list) {
    const map = {
      airtime: { label: "Airtime", points: 90, wallet: 2, icon: "A" },
      taxi: { label: "Taxi Token", points: 120, wallet: 3, icon: "T" },
      lunch: { label: "Lunch Pack", points: 100, wallet: 2, icon: "L" },
      badge: { label: "Street Badge", points: 160, wallet: 4, icon: "B" },
      data: { label: "Data Bundle", points: 140, wallet: 3, icon: "D" },
    };
    return (Array.isArray(list) ? list : []).map((c) => ({
      x: Number(c.x) || 0,
      y: Number(c.y) || 0,
      type: String(c.type || "airtime"),
      taken: false,
      ...(map[String(c.type || "airtime")] || map.airtime),
    }));
  }
  function normalizeLevel(raw) {
    tileSize = Number(raw.tileSize) > 0 ? Number(raw.tileSize) : TILE_DEFAULT;
    const out = {
      meta: raw.meta || {},
      width: Number(raw.width || raw.w || 90) || 90,
      height: Number(raw.height || raw.h || 18) || 18,
      spawn: raw.spawn || { x: 2, y: 13 },
      exit: raw.exit || null,
      objective: raw.objective || {},
      solids: normalizeRectList(raw.solids),
      platforms: normalizeRectList(raw.platforms),
      hazards: normalizeRectList(raw.hazards || raw.spikes),
      coins: (Array.isArray(raw.coins) ? raw.coins : []).map((c) => ({ x: Number(c.x) || 0, y: Number(c.y) || 0 })),
      collectibles: normalizeCollectibles(raw.collectibles),
      powerups: (Array.isArray(raw.powerups) ? raw.powerups : []).map((p) => ({ x: Number(p.x) || 0, y: Number(p.y) || 0, type: String(p.type || "shield"), taken: false })),
      enemies: Array.isArray(raw.enemies) ? raw.enemies : [],
      bosses: [],
      npcs: Array.isArray(raw.npcs) ? raw.npcs : [],
      obstacles: Array.isArray(raw.obstacles) ? raw.obstacles : [],
      doors: Array.isArray(raw.doors) ? raw.doors : [],
      switches: Array.isArray(raw.switches) ? raw.switches : [],
      checkpoints: (Array.isArray(raw.checkpoints) ? raw.checkpoints : []).map(c => ({ ...c, reached: false })),
    };
    if (raw.boss) out.bosses.push(raw.boss);
    if (Array.isArray(raw.bosses)) out.bosses.push(...raw.bosses);
    if (out.platforms.length) out.solids.push(...out.platforms);

    if (Array.isArray(raw.tiles) && raw.tiles.length) {
      let grid = [];
      if (Array.isArray(raw.tiles[0])) grid = raw.tiles.map((row) => Array.isArray(row) ? row.map((v) => Number(v) || 0) : []);
      else {
        const total = out.width * out.height;
        const flat = raw.tiles.map((v) => Number(v) || 0).slice(0, total);
        while (flat.length < total) flat.push(0);
        for (let y = 0; y < out.height; y++) grid.push(flat.slice(y * out.width, (y + 1) * out.width));
      }
      for (let y = 0; y < grid.length; y++) {
        const row = grid[y] || [];
        for (let x = 0; x < row.length; x++) {
          const t = row[x];
          if (t === 1) out.solids.push({ x, y, w: 1, h: 1 });
          if (t === 2) out.coins.push({ x, y });
          if (t === 3) out.hazards.push({ x, y, w: 1, h: 1 });
          if (t === 4) out.exit = { x, y, w: 1, h: 2 };
        }
      }
    }

    if (!out.solids.length) out.solids.push({ x: 0, y: 15, w: out.width, h: 3 });
    if (!out.exit) out.exit = { x: out.width - 4, y: 13, w: 1, h: 2 };
    out.spawn = {
      x: clamp(Number(out.spawn.x) || 2, 1, Math.max(2, out.width - 2)),
      y: clamp(Number(out.spawn.y) || 13, 1, Math.max(2, out.height - 2)),
    };
    const obj = out.objective || {};
    out.objective = {
      coinsRequired: Number(obj.coinsRequired ?? obj.minCoins ?? 0) || 0,
      collectiblesRequired: Number(obj.collectiblesRequired ?? obj.minCollectibles ?? 0) || 0,
      enemiesRequired: Number(obj.enemiesRequired ?? obj.minEnemies ?? 0) || 0,
      bossRequired: obj.bossRequired !== false && out.bosses.length > 0,
      switchesRequired: Number(obj.switchesRequired ?? 0) || 0,
      message: obj.message || "Complete the NPC mission, defeat the boss, then reach the gate.",
    };
    out.totalItems = out.coins.length + out.collectibles.length;
    out.totalEnemies = out.enemies.length;
    return out;
  }

  function buildEnemiesFromLevel() {
    enemies = [];
    let i = 0;
    for (const raw of level.enemies || []) {
      const speedRaw = Number(raw.speed) || 80;
      const speed = speedRaw > 20 ? speedRaw : speedRaw * tileSize;
      const drone = raw.type === "drone";
      const role = enemyRoster?.roles[raw.type];
      const baseW = Math.max(18, Number(raw.w || raw.width || (drone ? 1.12 : role?.w || 0.85)) * tileSize);
const baseH = Math.max(20, Number(raw.h || raw.height || (drone ? 0.6 : role?.h || 0.95)) * tileSize);
const w = baseW * SCALE.enemy;
const h = baseH * SCALE.enemy;
const x = (Number(raw.x) || 0) * tileSize + tileSize * 0.08 - (w - baseW) / 2;
const y = (Number(raw.y) || 0) * tileSize - (h - baseH) - (role ? baseH - tileSize * .95 : 0);
      const minX = Number.isFinite(raw.minX) ? Number(raw.minX) : (Number(raw.x) || 0) - 4;
      const maxX = Number.isFinite(raw.maxX) ? Number(raw.maxX) : (Number(raw.x) || 0) + 4;
      enemies.push({
        id: `L${currentLevel}-E${i++}`,
        type: String(raw.type || "patrol").toLowerCase(),
         x,
         y,
         w,
         h,
        dir: raw.dir === -1 ? -1 : 1,
        vx: 0, vy: 0,
        minX: Math.min(minX, maxX) * tileSize,
        maxX: Math.max(minX, maxX) * tileSize,
        speed,
        hp: Number(raw.hp || 1) || 1,
        maxHp: Number(raw.hp || 1) || 1,
        alive: true,
        shootT: 0.65 + (i % 4) * 0.2,
        fireInterval: clamp(Number(raw.fireInterval) || 1.8, 1.2, 3),
        hoverY: y, hoverT: i * 1.7, windup: 0, aimX: 0, aimY: 0,
      });
      if (role) enemyRoster.init(enemies[enemies.length - 1]);
    }
  }

  function buildBossesFromLevel() {
    bosses = [];
    let i = 0;
    for (const raw of level.bosses || []) {
      const maxHp = Number(raw.hp || raw.health || 5) || 5;
      const baseX = (Number(raw.x) || level.width - 9) * tileSize;
const baseY = (Number(raw.y) || 12) * tileSize;
const baseW = Number(raw.w || 1.35) * tileSize;
const baseH = Number(raw.h || 1.7) * tileSize;

const w = baseW * SCALE.boss;
const h = baseH * SCALE.boss;
const x = baseX - (w - baseW) / 2;
const y = baseY - (h - baseH);
      const minX = (Number.isFinite(raw.minX) ? Number(raw.minX) : Number(raw.x || level.width - 13)) * tileSize;
      const maxX = (Number.isFinite(raw.maxX) ? Number(raw.maxX) : Number(raw.x || level.width - 6)) * tileSize;
      bosses.push({
        id: `L${currentLevel}-B${i++}`,
        name: raw.name || (currentLevel >= LEVEL_COUNT ? "Final Kasi Boss" : "Alley Boss"),
        type: String(raw.type || (currentLevel >= LEVEL_COUNT ? "final" : "mini")).toLowerCase(),
        x, y, w, h,
        spawnX: x, spawnY: y,
        minX: Math.min(minX, maxX),
        maxX: Math.max(minX, maxX),
        dir: raw.dir === -1 ? -1 : 1,
        speed: Number(raw.speed || 95),
        hp: maxHp,
        maxHp,
        vy: 0,
        phase: 1,
        shootT: 0.8,
        jumpT: 1.4,
        dashT: 2.2,
        alive: true,
      });
    }
  }

  function buildObstaclesFromLevel() {
    obstacles = [];
    let i = 0;
    for (const raw of level.obstacles || []) {
      const type = String(raw.type || "taxi").toLowerCase();
      const rawX = Number(raw.x || 0) * tileSize;
const rawY = Number(raw.y || 0) * tileSize;
const baseW = Number(raw.w || raw.width || 1) * tileSize;
const baseH = Number(raw.h || raw.height || 1) * tileSize;
const size = type === "taxi" ? presentation.taxiSize(baseW) : { w: baseW, h: baseH };
const { w, h } = size;
const x = rawX - (w - baseW) / 2;
const y = rawY - (h - baseH);
      const base = {
        id: `L${currentLevel}-O${i++}`,
        type,
        x,
        y,
        w,
        h,
        startX: x,
        startY: y,
        vx: 0, vy: 0, dx: 0, dy: 0,
        dir: raw.dir === -1 ? -1 : 1,
        speed: Number(raw.speed || 80),
        minX: (Number.isFinite(raw.minX) ? Number(raw.minX) : Number(raw.x || 0) - 4) * tileSize,
        maxX: (Number.isFinite(raw.maxX) ? Number(raw.maxX) : Number(raw.x || 0) + 4) * tileSize,
        minY: (Number.isFinite(raw.minY) ? Number(raw.minY) : Number(raw.y || 0) - 2) * tileSize,
        maxY: (Number.isFinite(raw.maxY) ? Number(raw.maxY) : Number(raw.y || 0) + 2) * tileSize,
        triggerRadius: Number(raw.triggerRadius || 5) * tileSize,
        state: raw.state || "idle",
        timer: 0,
        respawn: Number(raw.respawn || 3.5),
        delay: Number(raw.delay || 0.55),
        active: true,
        solid: raw.solid !== false,
      };
      if (type === "crate") base.state = "waiting";
      if (type === "collapse") base.state = "stable";
      obstacles.push(base);
    }
    doors = (level.doors || []).map((d, i) => ({
      id: String(d.id || `door${i}`),
      x: Number(d.x || 0) * tileSize,
      y: Number(d.y || 0) * tileSize,
      w: Number(d.w || 1) * tileSize,
      h: Number(d.h || 2) * tileSize,
      open: !!d.open,
    }));
    switches = (level.switches || []).map((s, i) => ({
      id: String(s.id || `door${i}`),
      x: Number(s.x || 0) * tileSize,
      y: Number(s.y || 0) * tileSize,
      w: Number(s.w || 0.8) * tileSize,
      h: Number(s.h || 0.35) * tileSize,
      pressed: false,
    }));
  }

  async function loadLevel(n) {
    if (!Number.isInteger(n) || n < 1 || n > unlockedLevel) throw new Error("Complete the previous level to unlock this stage.");
    mode = "campaign";
    const raw = await loadJson(levelUrl(n));
    level = normalizeLevel(raw);
    currentLevel = n;
    if (elLevelNum) elLevelNum.textContent = String(n);
    if (elLevelLabel) elLevelLabel.textContent = String(n);
    if (elMissionText) elMissionText.textContent = level.objective.message;
    if ($("enemyIntel")) $("enemyIntel").textContent = level.meta.encounterNote || "Watch each opponent’s attack and use the rooftops for space.";
    await loadEnemyArt();
    bgImg = await loadImageSafe(ASSETS.bgForLevel(clamp(Number(level.meta.background) || ((n - 1) % 8 + 1), 1, 8)));
    buildEnemiesFromLevel();
    buildBossesFromLevel();
    buildObstaclesFromLevel();
  }

  // ----------------------------
  // Daily challenge generation
  // ----------------------------
  function seededRand(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  function dateKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function generateDailyLevel() {
    dailyDateKey = dateKey();
    let seed = 0;
    for (const ch of dailyDateKey) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const rnd = seededRand(seed);
    const width = 135 + Math.floor(rnd() * 35);
    const solids = [];
    let x = 0;
    while (x < width) {
      const seg = 12 + Math.floor(rnd() * 14);
      const gap = 3 + Math.floor(rnd() * 4);
      solids.push({ x, y: 15, w: Math.min(seg, width - x), h: 3 });
      if (rnd() > 0.45) solids.push({ x: x + 4 + Math.floor(rnd() * Math.max(2, seg - 8)), y: 10 + Math.floor(rnd() * 4), w: 4 + Math.floor(rnd() * 4), h: 1 });
      x += seg + gap;
    }
    const coins = [];
    const collectibles = [];
    for (let i = 0; i < 26; i++) coins.push({ x: 5 + Math.floor(rnd() * (width - 12)), y: 8 + Math.floor(rnd() * 6) });
    const types = ["airtime", "taxi", "lunch", "badge", "data"];
    for (let i = 0; i < 10; i++) collectibles.push({ x: 8 + Math.floor(rnd() * (width - 18)), y: 8 + Math.floor(rnd() * 6), type: types[i % types.length] });
    const enemiesRaw = [];
    for (let i = 0; i < 9; i++) {
      const ex = 15 + Math.floor(rnd() * (width - 32));
      enemiesRaw.push({ type: rnd() > 0.65 ? "chaser" : "patrol", x: ex, y: 13, minX: ex - 4, maxX: ex + 4, speed: 80 + Math.floor(rnd() * 40) });
    }
    const obstaclesRaw = [
      { type: "taxi", x: 25, y: 14, w: 2.3, h: 0.9, minX: 22, maxX: 40, speed: 110 },
      { type: "trampoline", x: 48, y: 14.65, w: 1.3, h: 0.35 },
      { type: "collapse", x: 70, y: 11, w: 5, h: 0.5, respawn: 3.2 },
      { type: "crate", x: 95, y: 3, w: 1, h: 1, triggerRadius: 6 },
    ];
    return normalizeLevel({
      meta: { name: `Daily Challenge • ${dailyDateKey}`, timeLimit: 180, daily: true },
      tileSize: 32,
      w: width,
      h: 18,
      spawn: { x: 2, y: 13 },
      exit: { x: width - 5, y: 13, w: 1, h: 2 },
      solids,
      coins,
      collectibles,
      enemies: enemiesRaw,
      obstacles: obstaclesRaw,
      boss: { name: "Daily Boss", type: "final", x: width - 13, y: 12, minX: width - 18, maxX: width - 7, hp: 7, speed: 115 },
      npcs: [{ name: "Thabo", x: 4, y: 13, message: "Daily run! Collect items, clear bots, beat the boss, and set today’s best." }],
      objective: { coinsRequired: 12, collectiblesRequired: 5, enemiesRequired: 5, bossRequired: true, message: `Daily ${dailyDateKey}: collect 12 coins, 5 kasi items, defeat 5 bots, then beat the boss.` },
    });
  }
  async function loadDailyLevel() {
    mode = "daily";
    level = generateDailyLevel();
    currentLevel = "D";
    if (elLevelNum) elLevelNum.textContent = "D";
    if (elLevelLabel) elLevelLabel.textContent = "Daily";
    if (elMissionText) elMissionText.textContent = level.objective.message;
    if ($("enemyIntel")) $("enemyIntel").textContent = level.meta.encounterNote || "Watch each opponent’s attack and use the rooftops for space.";
    bgImg = null;
    await loadEnemyArt();
    if ($("enemyIntel")) $("enemyIntel").textContent = "Daily challenge: bots and the daily guardian.";
    buildEnemiesFromLevel();
    buildBossesFromLevel();
    buildObstaclesFromLevel();
  }

  // ----------------------------
  // Scoring, objectives, posts
  // ----------------------------
  function addText(text, x, y, life = 0.95) { floatingTexts.push({ text, x, y, t: 0, life }); }
  function addCombo(pointsBase, x, y, label) {
    if (comboTimer > 0) comboCount += 1;
    else comboCount = 1;
    comboTimer = 3.2;
    maxCombo = Math.max(maxCombo, comboCount);
    const multiplier = 1 + Math.min(2.5, (comboCount - 1) * 0.18);
    const points = Math.floor(pointsBase * multiplier);
    award(points, x, y, `${label || "+" + points}${comboCount > 1 ? ` x${comboCount}` : ""}`);
  }
  function award(points, x = player.x, y = player.y, label = null) {
    score = Math.max(0, score + points);
    if (score > best) {
      best = Math.floor(score);
      safeSet(BEST_KEY, best);
    }
    if (label) addText(label, x, y);
  }
  function countPressedSwitches() { return switches.filter((s) => s.pressed).length; }
  function objectiveComplete() {
    if (!level) return false;
    return coinsCollected >= level.objective.coinsRequired &&
      collectiblesCollected >= level.objective.collectiblesRequired &&
      enemiesDefeated >= level.objective.enemiesRequired &&
      (!level.objective.bossRequired || bossesDefeated >= bosses.length) &&
      countPressedSwitches() >= level.objective.switchesRequired;
  }
  function objectiveText() {
    if (!level) return "";
    const o = level.objective;
    const parts = [];
    if (o.coinsRequired > 0) parts.push(`Coins ${Math.min(coinsCollected, o.coinsRequired)}/${o.coinsRequired}`);
    if (o.collectiblesRequired > 0) parts.push(`Items ${Math.min(collectiblesCollected, o.collectiblesRequired)}/${o.collectiblesRequired}`);
    if (o.enemiesRequired > 0) parts.push(`Foes ${Math.min(enemiesDefeated, o.enemiesRequired)}/${o.enemiesRequired}`);
    if (o.bossRequired) parts.push(`Boss ${Math.min(bossesDefeated, bosses.length)}/${bosses.length}`);
    if (o.switchesRequired > 0) parts.push(`Switches ${Math.min(countPressedSwitches(), o.switchesRequired)}/${o.switchesRequired}`);
    return `${parts.join(" • ")} • Gate ${objectiveComplete() ? "open" : "locked"}`;
  }
  function calcStars() {
    if (!level) return 1;
    const par = Number(level.meta?.parTime || level.meta?.timeLimit || 120) * 0.78;
    const totalItems = Math.max(1, level.totalItems || (level.coins.length + level.collectibles.length + coinsCollected + collectiblesCollected));
    const itemScore = (coinsCollected + collectiblesCollected) / totalItems;
    let star = 1;
    if (itemScore >= 0.72 && enemiesDefeated >= level.objective.enemiesRequired && bossesDefeated >= (level.objective.bossRequired ? bosses.length : 0)) star += 1;
    if (levelTime <= par && noDamage && maxCombo >= 4) star += 1;
    return clamp(star, 1, 3);
  }
  function postScore(modeName = "live", extra = {}) {
    const cleanScore = Math.max(0, Math.floor(score));
    const payload = {
      gameSlug: GAME_SLUG,
      score: cleanScore,
      best,
      mode: modeName,
      gameMode: mode,
      level: currentLevel,
      coins: coinsCollected,
      collectibles: collectiblesCollected,
      enemiesDefeated,
      bossesDefeated,
      time: Number(levelTime.toFixed(2)),
      wallet,
      walletEarnedThisRun,
      comboMax: maxCombo,
      stars: extra.stars || 0,
      dailyKey: dailyDateKey || undefined,
      playerName: getPlayerName(),
      ...extra,
    };
    try {
      window.parent?.postMessage({ type: "GG_SCORE", ...payload, payload }, getTargetOrigin());
      window.parent?.postMessage({ type: "gg:score", ...payload, payload }, getTargetOrigin());
      window.parent?.postMessage({ source: "glorygames", gameSlug: GAME_SLUG, type: "score_live", payload }, getTargetOrigin());
    } catch (_) {}
    try {
      if (modeName !== "live" && window.GG?.submitScore) window.GG.submitScore(payload);
      if (modeName !== "live" && window.GG?.endRound) window.GG.endRound(payload);
    } catch (_) {}
  }

  // ----------------------------
  // Collision solids
  // ----------------------------
  function iterSolidRects(cb) {
    if (!level) return;
    for (const s of level.solids) cb(toWorldRect(s));
    for (const d of doors) if (!d.open) cb({ x: d.x, y: d.y, w: d.w, h: d.h, ref: d, door: true });
    for (const ob of obstacles) {
      if (!ob.active) continue;
      if (ob.type === "collapse" && ob.state === "gone") continue;
      if (["movingplatform", "platform", "collapse"].includes(ob.type) || (ob.type === "crate" && ob.state === "landed")) {
        cb({ x: ob.x, y: ob.y, w: ob.w, h: ob.h, ref: ob, obstacle: true });
      }
    }
  }
  function iterHazardRects(cb) {
    if (!level) return;
    for (const h of level.hazards) cb(toWorldRect(h));
    for (const ob of obstacles) {
      if (!ob.active) continue;
      if (["taxi", "crate"].includes(ob.type) && ob.state !== "landed") cb({ x: ob.x, y: ob.y, w: ob.w, h: ob.h, ref: ob, obstacle: true });
    }
  }
  function exitRect() { return level?.exit ? toWorldRect({ ...level.exit, w: level.exit.w || 1, h: level.exit.h || 2 }) : null; }

  // ----------------------------
  // Player state
  // ----------------------------
  function resetPlayer() {
    const s = level?.spawn || { x: 2, y: 13 };
    player.x = s.x * tileSize + tileSize * 0.15;
    player.y = s.y * tileSize;
    player.vx = 0;
    player.vy = 0;
    player.face = 1;
    player.onGround = false;
    player.jumpHeld = false;
    player.jumpHoldT = 0;
    player.coyoteT = 0;
    player.jumpBufferT = 0;
    player.airJumpsLeft = upgrades.doubleJump > 0 ? upgrades.doubleJump : 0;
    player.shield = upgrades.shield;
    player.invuln = 1.2;
    player.fireBoostUntil = 0;
    player.lives = 3 + upgrades.extraLife;
    snapPlayerToGroundAtSpawn();
  }
  function snapPlayerToGroundAtSpawn() {
    let bestY = null;
    const cx = player.x + player.w / 2;
    iterSolidRects((s) => {
      if (cx >= s.x - 4 && cx <= s.x + s.w + 4 && s.y >= player.y) {
        if (bestY === null || s.y < bestY) bestY = s.y;
      }
    });
    if (bestY !== null) {
      player.y = bestY - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }
  function resetLevelState({ resetScore = false } = {}) {
    resetInput();
    defeatRemaining = 0;
    animation?.reset();
    enemyTips.clear();
    nextEnemyTipAt = 0;
    cameraState = null;
    checkpoint = null;
    timeGrace = 0;
    for (const c of level?.checkpoints || []) c.reached = false;
    resetPlayer();
    coinsCollected = 0;
    collectiblesCollected = 0;
    enemiesDefeated = 0;
    bossesDefeated = 0;
    levelTime = 0;
    comboCount = 0;
    comboTimer = 0;
    maxCombo = 1;
    noDamage = true;
    projectiles = [];
    enemyProjectiles = [];
    lastShotAt = -99;
    floatingTexts = [];
    buildEnemiesFromLevel();
    buildBossesFromLevel();
    buildObstaclesFromLevel();
    if (level?.coins) level.coins = level.coins.map((c) => ({ ...c }));
    if (level?.collectibles) level.collectibles = level.collectibles.map((c) => ({ ...c, taken: false }));
    if (level?.powerups) level.powerups = level.powerups.map((p) => ({ ...p, taken: false }));
    if (resetScore) {
      score = 0;
      totalRunTime = 0;
      walletEarnedThisRun = 0;
    }
    levelStartedAt = now();
    lastNpcTalkAt = 0;
    setHUD();
  }

  function damagePlayer(reason = "hit") {
    if (player.invuln > 0) return;
    noDamage = false;
    comboCount = 0;
    comboTimer = 0;
    if (player.shield > 0) {
      player.shield -= 1;
      player.invuln = 1.0;
      player.vx = -player.face * 190;
      player.vy = -420;
      animation?.play(player, "player", "hurt");
      addText("Shield saved you", player.x, player.y, 1.2);
      beep(260, 0.05, "square", 0.04);
      return;
    }
    player.lives -= 1;
    award(-55, player.x, player.y, reason === "time" ? "Time penalty" : "-55");
    beep(120, 0.09, "sawtooth", 0.05);
    if (player.lives <= 0) {
      animation?.play(player, "player", "defeat");
      defeatRemaining = animation?.has("player") && reason !== "fall" ? animation.duration("player", "defeat") + 0.1 : 0;
      postScore(mode === "daily" ? "daily_game_over" : "game_over");
      running = false;
      paused = true;
      syncPlayUI();
      btnStart.textContent = "Try Again";
      addText("Quest failed", player.x, player.y);
      return;
    }
    const s = checkpoint || level?.spawn || { x: 2, y: 13 };
    player.x = s.x * tileSize + tileSize * 0.15;
    player.y = s.y * tileSize;
    player.vx = 0;
    player.vy = 0;
    player.invuln = 2.0;
    // Clear only shots near the recovery point; kills, pickups and switches stay completed.
    enemyProjectiles = enemyProjectiles.filter(p => Math.abs(p.x - player.x) > tileSize * 12);
    player.coyoteT = 0;
    player.jumpBufferT = 0;
    player.jumpHeld = false;
    cameraState = null;
    snapPlayerToGroundAtSpawn();
    animation?.play(player, "player", "hurt");
  }

  function setHUD() {
    if (elScore) elScore.textContent = String(Math.floor(score));
    if (elBest) elBest.textContent = String(Math.floor(best));
    if (elCoins) elCoins.textContent = String(coinsCollected + collectiblesCollected);
    if (elWallet) elWallet.textContent = String(wallet);
    if (elWalletPanel) elWalletPanel.textContent = String(wallet);
    if (elLives) elLives.textContent = String(player.lives);
    if (elCombo) elCombo.textContent = comboCount > 1 ? `x${comboCount}` : "x1";
    if (elTime) elTime.textContent = levelTime.toFixed(1);
    if (missionProgress) {
      const text = objectiveText();
      if (missionProgress.textContent !== text) missionProgress.textContent = text;
    }
    if (elDailyBest) elDailyBest.textContent = String(dailyBestStore[dateKey()] || 0);
    updateStarSummary();
    renderShop();
  }

  // ----------------------------
  // Collection and combat
  // ----------------------------
  function collectCoin(index) {
    const c = level.coins[index];
    level.coins.splice(index, 1);
    coinsCollected += 1;
    addCombo(50, c.x * tileSize, c.y * tileSize, "+50");
    beep(820, 0.045, "triangle", 0.035);
  }
  function collectCollectible(index) {
    const c = level.collectibles[index];
    c.taken = true;
    collectiblesCollected += 1;
    wallet += Number(c.wallet || 2);
    walletEarnedThisRun += Number(c.wallet || 2);
    saveEconomy();
    addCombo(Number(c.points || 100), c.x * tileSize, c.y * tileSize, `${c.label} +${c.points}`);
    beep(980, 0.05, "triangle", 0.04);
  }
  function collectPowerup(index) {
    const p = level.powerups[index];
    p.taken = true;
    if (p.type === "shield") {
      player.shield += 1;
      addText("Shield +1", p.x * tileSize, p.y * tileSize);
    } else if (p.type === "life") {
      player.lives += 1;
      addText("Life +1", p.x * tileSize, p.y * tileSize);
    } else if (p.type === "jump") {
      player.airJumpsLeft += 1;
      addText("Air jump +1", p.x * tileSize, p.y * tileSize);
    } else {
      addText("Rapid fire", p.x * tileSize, p.y * tileSize);
      player.fireBoostUntil = totalRunTime + 8;
    }
    award(80, p.x * tileSize, p.y * tileSize, "+80");
    beep(1040, 0.05, "triangle", 0.04);
  }
  function fireRate() {
    const base = player.fireBoostUntil > totalRunTime ? 0.14 : 0.34;
    return Math.max(0.12, base - upgrades.fireRate * 0.055);
  }
  function shoot() {
    const rate = fireRate();
    if (totalRunTime - lastShotAt < rate) return;
    lastShotAt = totalRunTime;
    animation?.play(player, "player", "shoot");
    const dir = player.face >= 0 ? 1 : -1;
    const bulletW = 15 * SCALE.projectile;
const bulletH = 7 * SCALE.projectile;

projectiles.push({
  type: "player",
  x: player.x + player.w / 2 + dir * (16 * SCALE.projectile),
  y: player.y + player.h * 0.42 - bulletH / 2,
  w: bulletW,
  h: bulletH,
  vx: dir * 760,
      vy: 0,
      life: 1.15,
      damage: 1,
    });
    beep(640, 0.035, "square", 0.026);
  }
  function defeatEnemy(en, x, y, byShot = false) {
    if (!en.alive) return;
    en.alive = false;
    animation?.play(en, actorKind(en), "defeat");
    enemiesDefeated += 1;
    addCombo(byShot ? 145 : 185, x, y, byShot ? "+145" : "+185");
    beep(byShot ? 300 : 220, 0.05, "square", 0.04);
  }
  function hitEnemy(en, shot, byShot = true) {
    if (!en.alive) return;
    if (byShot && enemyRoster?.hit(en, shot) === "blocked") {
      addText(en.ai?.phase === "recover" ? "Shield staggered" : "Blocked", en.x, en.y - 15);
      if (en.ai?.phase === "recover") animation?.play(en, actorKind(en), "hurt");
      beep(330, 0.035, "triangle", 0.02);
      return;
    }
    en.hp -= shot.damage || 1;
    if (en.hp <= 0) defeatEnemy(en, en.x, en.y, byShot);
    else {
      enemyRoster?.recover(en, en.type === "warden" && !byShot ? 1.25 : .8);
      animation?.play(en, actorKind(en), "hurt");
      addText("Hit", en.x, en.y);
    }
  }
  function hitBoss(boss, damage = 1, byStomp = false) {
    if (!boss.alive) return;
    boss.hp -= damage;
    animation?.play(boss, "boss", "hurt");
    boss.phase = boss.hp <= Math.ceil(boss.maxHp * 0.5) ? 2 : 1;
    addCombo(byStomp ? 90 : 70, boss.x, boss.y, byStomp ? "Boss stomp" : "Boss hit");
    beep(220, 0.045, "square", 0.035);
    if (boss.hp <= 0) {
      boss.alive = false;
      animation?.play(boss, "boss", "defeat");
      bossesDefeated += 1;
      addCombo(650 + boss.maxHp * 30, boss.x, boss.y, "Boss defeated");
      beep(700, 0.08, "triangle", 0.045);
      beep(920, 0.09, "triangle", 0.04);
    }
  }

  // ----------------------------
  // Updates
  // ----------------------------
  function updatePlayer(dt) {
    const wasGrounded = player.onGround;
    const target = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (target) {
      player.vx += target * MOVE_ACC * dt;
      player.face = target;
    } else {
      const sign = Math.sign(player.vx);
      player.vx = sign * Math.max(0, Math.abs(player.vx) - FRICTION * dt);
    }
    player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED);

    const jumpPressed = pressedEdges.jump || (input.jump && !prevInput.jump);
    pressedEdges.jump = false;
    player.coyoteT = player.onGround ? 0.1 : Math.max(0, player.coyoteT - dt);
    player.jumpBufferT = jumpPressed ? 0.12 : Math.max(0, player.jumpBufferT - dt);
    if (player.jumpBufferT > 0 && (player.onGround || player.coyoteT > 0 || player.airJumpsLeft > 0)) {
      if (!player.onGround && player.coyoteT <= 0) player.airJumpsLeft -= 1;
      player.coyoteT = 0;
      player.jumpBufferT = 0;
      player.vy = -JUMP_V0;
      animation?.cancel(player, "land");
      player.onGround = false;
      player.jumpHeld = true;
      player.jumpHoldT = 0;
      beep(510, 0.045, "triangle", 0.04);
    }
    if (player.jumpHeld) {
      if (input.jump && player.jumpHoldT < JUMP_HOLD_MAX) {
        player.vy -= JUMP_HOLD_BOOST * dt;
        player.jumpHoldT += dt;
      } else player.jumpHeld = false;
    }
    if (pressedEdges.action || input.action) shoot();
    pressedEdges.action = false;

    player.vy += GRAVITY * dt;
    player.vy = clamp(player.vy, -1700, 2200);

    player.x += player.vx * dt;
    const px = { x: player.x, y: player.y, w: player.w, h: player.h };
    iterSolidRects((s) => {
      if (rectsOverlap(px, s)) {
        if (player.vx > 0) player.x = s.x - player.w;
        if (player.vx < 0) player.x = s.x + s.w;
        player.vx = 0;
        px.x = player.x;
      }
    });

    player.y += player.vy * dt;
    player.onGround = false;
    const py = { x: player.x, y: player.y, w: player.w, h: player.h };
    iterSolidRects((s) => {
      if (!rectsOverlap(py, s)) return;
      if (player.vy > 0) {
        player.y = s.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.jumpHeld = false;
        player.airJumpsLeft = upgrades.doubleJump > 0 ? upgrades.doubleJump : 0;
        if (s.ref?.type === "movingplatform" || s.ref?.type === "platform") player.x += s.ref.dx || 0;
        if (s.ref?.type === "collapse" && s.ref.state === "stable") { s.ref.state = "shaking"; s.ref.timer = 0; }
      } else if (player.vy < 0) {
        player.y = s.y + s.h;
        player.vy = 0;
        player.jumpHeld = false;
      }
      py.y = player.y;
    });

    const worldW = level.width * tileSize;
    const worldH = level.height * tileSize;
    if (!wasGrounded && player.onGround) animation?.play(player, "player", "land");
    player.x = clamp(player.x, 0, Math.max(0, worldW - player.w));
    if (player.y > worldH + 360) damagePlayer("fall");
    if (player.invuln > 0) player.invuln -= dt;

  for (let i = level.coins.length - 1; i >= 0; i--) {
  const c = level.coins[i];
  const size = tileSize * 0.64 * SCALE.coin;
  const cx = c.x * tileSize + tileSize / 2;
  const cy = c.y * tileSize + tileSize / 2;
  const cr = { x: cx - size / 2, y: cy - size / 2, w: size, h: size };
  if (rectsOverlap(py, cr)) collectCoin(i);
}

for (let i = level.collectibles.length - 1; i >= 0; i--) {
  const c = level.collectibles[i];
  if (c.taken) continue;
  const size = (tileSize - 10) * SCALE.collectible;
  const cx = c.x * tileSize + tileSize / 2;
  const cy = c.y * tileSize + tileSize / 2;
  const cr = { x: cx - size / 2, y: cy - size / 2, w: size, h: size };
  if (rectsOverlap(py, cr)) collectCollectible(i);
}

for (let i = level.powerups.length - 1; i >= 0; i--) {
  const p = level.powerups[i];
  if (p.taken) continue;
  const size = (tileSize - 12) * SCALE.powerup;
  const cx = p.x * tileSize + tileSize / 2;
  const cy = p.y * tileSize + tileSize / 2;
  const pr = { x: cx - size / 2, y: cy - size / 2, w: size, h: size };
  if (rectsOverlap(py, pr)) collectPowerup(i);
}

    let hitHazard = false;
    iterHazardRects((h) => { if (rectsOverlap(py, h)) hitHazard = true; });
    if (hitHazard) damagePlayer("hazard");

    for (const ob of obstacles) {
      if (!ob.active || ob.type !== "trampoline") continue;
      const tr = { x: ob.x, y: ob.y, w: ob.w, h: ob.h };
      if (rectsOverlap(py, tr) && player.vy >= 0) {
        player.y = ob.y - player.h;
        player.vy = -1180;
        player.onGround = false;
        addText("Boing!", ob.x, ob.y);
        beep(760, 0.05, "triangle", 0.035);
      }
    }

    for (const sw of switches) {
      const sr = { x: sw.x, y: sw.y, w: sw.w, h: sw.h };
      if (!sw.pressed && rectsOverlap(py, sr)) pressSwitch(sw);
    }

    for (const c of level.checkpoints) {
      if (!c.reached && player.onGround && player.x >= (c.x - 1.5) * tileSize && player.x <= (c.x + 8) * tileSize && Math.abs(player.y - c.y * tileSize) < tileSize * 3) {
        c.reached = true;
        if (!checkpoint || c.x > checkpoint.x) {
          checkpoint = { x: c.x, y: c.y };
          addText("Checkpoint reached", player.x, player.y - 28, 2);
          beep(740, 0.07, "triangle", 0.03);
        }
      }
    }
    const ex = exitRect();
    if (ex && rectsOverlap(py, ex)) {
      if (objectiveComplete()) completeLevel();
      else addText("Gate locked", player.x, player.y - 20);
    }
  }

  function pressSwitch(sw) {
    sw.pressed = true;
    for (const d of doors) if (d.id === sw.id) d.open = true;
    addText("Door opened", sw.x, sw.y);
    beep(960, 0.06, "triangle", 0.04);
  }

  function updateEnemies(dt) {
    for (const en of enemies) {
      if (!en.alive) continue;
      const type = en.type === "runner" ? "patrol" : en.type;
      if (Math.abs(en.x - player.x) > tileSize * 26) continue;
      if (type === "drone") { updateDrone(en, dt); continue; }
      let intent = null;
      if (enemyRoster?.isRole(type)) {
        const role = enemyRoster.roles[type];
        if (!enemyTips.has(type) && Math.abs(en.x - player.x) < tileSize * 7 && levelTime >= nextEnemyTipAt) {
          enemyTips.add(type); nextEnemyTipAt = levelTime + 4;
          addText(`${role.name}: ${role.tip}`, en.x, en.y - 24, 3.8);
        }
        intent = enemyRoster.tick(en, { dt, player, tileSize, viewW,
          fire: shot => { if (enemyProjectiles.length >= 40) return false; enemyProjectiles.push(shot); return true; },
          play: (...args) => animation?.play(...args),
        });
      }
      if (type === "chaser") {
        const dist = Math.abs((player.x + player.w / 2) - (en.x + en.w / 2));
        if (dist < tileSize * 8) en.dir = player.x < en.x ? -1 : 1;
      }
      if (type === "shooter") {
        en.shootT -= dt;
        if (en.shootT <= 0 && Math.abs(player.x - en.x) < tileSize * 9 && enemyProjectiles.length < 40) {
          en.shootT = en.fireInterval;
          const dir = player.x < en.x ? -1 : 1;
          animation?.play(en, "enemy", "shoot", dir);
          enemyProjectiles.push({ x: en.x + en.w / 2, y: en.y + en.h * 0.4, w: 12, h: 7, vx: dir * 360, vy: 0, life: 2.2 });
        }
      }
      // Turn before a ledge so mission targets cannot fall out of the level.
      if (en.vy === 0) {
        const footX = en.dir > 0 ? en.x + en.w + 5 : en.x - 5;
        let supported = false;
        iterSolidRects(s => { if (footX >= s.x && footX <= s.x + s.w && Math.abs(s.y - en.y - en.h) < 8) supported = true; });
        if (!supported) { en.dir *= -1; if (intent !== null) { intent = 0; if (en.ai?.phase === "attack") enemyRoster.recover(en); } }
      }
      en.vx = intent ?? en.dir * en.speed;
      en.x += en.vx * dt;
      if (en.x < en.minX) { en.x = en.minX; en.dir = 1; }
      if (en.x + en.w > en.maxX + tileSize) { en.x = en.maxX + tileSize - en.w; en.dir = -1; }
      const ex = { x: en.x, y: en.y, w: en.w, h: en.h };
      iterSolidRects((s) => {
        if (rectsOverlap(ex, s)) {
          if (en.vx > 0) en.x = s.x - en.w;
          if (en.vx < 0) en.x = s.x + s.w;
          en.dir *= -1;
          ex.x = en.x;
        }
      });
      en.vy += GRAVITY * 0.78 * dt;
      en.y += en.vy * dt;
      const ey = { x: en.x, y: en.y, w: en.w, h: en.h };
      iterSolidRects((s) => {
        if (rectsOverlap(ey, s)) {
          if (en.vy > 0) { en.y = s.y - en.h; en.vy = 0; }
          else if (en.vy < 0) { en.y = s.y + s.h; en.vy = 0; }
          ey.y = en.y;
        }
      });
      if (en.y > level.height * tileSize + 500) en.alive = false;
    }
  }

  function updateDrone(en, dt) {
    en.hoverT += dt;
    en.x += en.dir * en.speed * dt;
    if (en.x < en.minX) { en.x = en.minX; en.dir = 1; }
    if (en.x + en.w > en.maxX + tileSize) { en.x = en.maxX + tileSize - en.w; en.dir = -1; }
    en.y = en.hoverY + Math.sin(en.hoverT * 2.1) * (motionPreference?.matches ? 2 : 8);
    const inRange = Math.abs(player.x - en.x) < Math.min(tileSize * 10, viewW * 0.75);
    if (!inRange) { en.windup = 0; en.shootT = Math.max(en.shootT, 0.6); return; }
    if (en.windup > 0) {
      en.windup -= dt;
      if (en.windup <= 0) {
        if (enemyProjectiles.length < 40) enemyProjectiles.push({
          x: en.x + en.w / 2, y: en.y + en.h / 2, w: 10, h: 10,
          vx: en.aimX * 280, vy: en.aimY * 280, life: 2.6, drone: true,
        });
        en.shootT = en.fireInterval;
      }
    } else {
      en.shootT -= dt;
      if (en.shootT <= 0) {
        const dx = player.x + player.w / 2 - en.x - en.w / 2;
        const dy = player.y + player.h / 2 - en.y - en.h / 2;
        const distance = Math.hypot(dx, dy) || 1;
        en.aimX = dx / distance; en.aimY = dy / distance;
        en.windup = 0.4; // Lock aim before firing, giving the player time to dodge.
      }
    }
  }

  function updateBosses(dt) {
    for (const b of bosses) {
      if (!b.alive || Math.abs(b.x - player.x) > tileSize * 24) continue;
      const dirToPlayer = player.x < b.x ? -1 : 1;
      b.shootT -= dt;
      b.jumpT -= dt;
      b.dashT -= dt;
      if (b.type === "final" && b.phase >= 2 && b.dashT <= 0) {
        b.dashT = 2.8;
        b.dir = dirToPlayer;
        b.speed = Math.min(210, b.speed + 18);
      } else if (Math.abs(player.x - b.x) < tileSize * 8) {
        b.dir = dirToPlayer;
      }
      b.x += b.dir * b.speed * dt * (b.phase >= 2 ? 1.15 : 1);
      if (b.x < b.minX) { b.x = b.minX; b.dir = 1; }
      if (b.x + b.w > b.maxX + tileSize) { b.x = b.maxX + tileSize - b.w; b.dir = -1; }
      if (b.jumpT <= 0) {
        b.jumpT = b.phase >= 2 ? 1.4 : 2.1;
        b.vy = -680;
      }
      if (b.shootT <= 0 && enemyProjectiles.length < 38) {
        b.shootT = b.phase >= 2 ? 1.15 : 1.75;
        const dir = player.x < b.x ? -1 : 1;
        animation?.play(b, "boss", "shoot", dir);
        enemyProjectiles.push({ x: b.x + b.w / 2, y: b.y + b.h * 0.35, w: 15, h: 9, vx: dir * (b.phase >= 2 ? 440 : 360), vy: 0, life: 2.4 });
        if (b.type === "final" && b.phase >= 2) {
          enemyProjectiles.push({ x: b.x + b.w / 2, y: b.y + b.h * 0.2, w: 12, h: 7, vx: dir * 380, vy: -140, life: 2.2 });
        }
      }
      b.vy += GRAVITY * 0.72 * dt;
      b.y += b.vy * dt;
      const br = { x: b.x, y: b.y, w: b.w, h: b.h };
      iterSolidRects((s) => {
        if (rectsOverlap(br, s)) {
          if (b.vy > 0) { b.y = s.y - b.h; b.vy = 0; }
          else if (b.vy < 0) { b.y = s.y + s.h; b.vy = 0; }
          br.y = b.y;
        }
      });
    }
  }

  function updateObstacles(dt) {
    for (const ob of obstacles) {
      ob.dx = 0; ob.dy = 0;
      if (!ob.active) continue;
      if (ob.type === "taxi" || ob.type === "movingplatform" || ob.type === "platform") {
        const oldX = ob.x, oldY = ob.y;
        ob.x += ob.dir * ob.speed * dt;
        if (ob.x < ob.minX) { ob.x = ob.minX; ob.dir = 1; }
        if (ob.x + ob.w > ob.maxX + ob.w) { ob.x = ob.maxX; ob.dir = -1; }
        if (ob.type === "movingplatform" && ob.maxY !== ob.minY) {
          ob.y += Math.sin(totalRunTime * 1.4) * 12 * dt;
          ob.y = clamp(ob.y, Math.min(ob.minY, ob.maxY), Math.max(ob.minY, ob.maxY));
        }
        ob.dx = ob.x - oldX; ob.dy = ob.y - oldY;
      }
      if (ob.type === "crate") {
        const dist = Math.hypot(player.x - ob.x, player.y - ob.y);
        if (ob.state === "waiting" && dist < ob.triggerRadius) ob.state = "falling";
        if (ob.state === "falling") {
          ob.vy += GRAVITY * dt;
          ob.y += ob.vy * dt;
          let landed = false;
          const cr = { x: ob.x, y: ob.y, w: ob.w, h: ob.h };
          for (const s of level.solids) {
            const sr = toWorldRect(s);
            if (rectsOverlap(cr, sr) && ob.vy > 0) { ob.y = sr.y - ob.h; ob.vy = 0; landed = true; break; }
          }
          if (landed) { ob.state = "landed"; ob.timer = 0; beep(110, 0.06, "sawtooth", 0.035); }
        } else if (ob.state === "landed") {
          ob.timer += dt;
          if (ob.timer > ob.respawn) { ob.x = ob.startX; ob.y = ob.startY; ob.vy = 0; ob.state = "waiting"; }
        }
      }
      if (ob.type === "collapse") {
        if (ob.state === "shaking") {
          ob.timer += dt;
          if (ob.timer > ob.delay) { ob.state = "gone"; ob.timer = 0; }
        } else if (ob.state === "gone") {
          ob.timer += dt;
          if (ob.timer > ob.respawn) { ob.state = "stable"; ob.timer = 0; }
        }
      }
    }
  }

  function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx * dt;
      p.y += (p.vy || 0) * dt;
      p.life -= dt;
      const pr = { x: p.x, y: p.y, w: p.w, h: p.h };
      let remove = p.life <= 0 || Math.abs(p.x - player.x) > viewW + tileSize * 8;
      iterSolidRects((s) => { if (!remove && rectsOverlap(pr, s)) remove = true; });
      for (const sw of switches) if (!sw.pressed && rectsOverlap(pr, { x: sw.x, y: sw.y, w: sw.w, h: sw.h })) { pressSwitch(sw); remove = true; }
      for (const en of enemies) {
        if (remove || !en.alive) continue;
        if (rectsOverlap(pr, { x: en.x, y: en.y, w: en.w, h: en.h })) {
          hitEnemy(en, p, true);
          remove = true;
        }
      }
      for (const b of bosses) {
        if (remove || !b.alive) continue;
        if (rectsOverlap(pr, { x: b.x, y: b.y, w: b.w, h: b.h })) { hitBoss(b, p.damage || 1, false); remove = true; }
      }
      if (remove) projectiles.splice(i, 1);
    }

    const playerRect = { x: player.x, y: player.y, w: player.w, h: player.h };
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
      const p = enemyProjectiles[i];
      if (!p.burst) {
        p.vy = (p.vy || 0) + (p.gravity || 0) * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
      p.life -= dt;
      const pr = { x: p.x, y: p.y, w: p.w, h: p.h };
      let solidHit = false;
      if (!p.burst) iterSolidRects(s => { if (rectsOverlap(pr, s)) solidHit = true; });
      const contact = rectsOverlap(pr, playerRect);
      if (p.role === "spark" && !p.burst && (p.life <= 0 || solidHit || contact)) {
        p.x += p.w / 2 - 48; p.y += p.h / 2 - 48;
        p.w = p.h = 96; p.life = .18; p.burst = true; p.vx = p.vy = 0;
        // Do not remove on impact: the short visible burst carries the area effect.
      } else if (p.role !== "spark" && (solidHit || contact)) {
        if (contact && !solidHit) damagePlayer("shot");
        enemyProjectiles.splice(i, 1); continue;
      }
      if (p.burst && !p.hit) {
        const cx = p.x + 48, cy = p.y + 48;
        const nx = clamp(cx, player.x, player.x + player.w), ny = clamp(cy, player.y, player.y + player.h);
        if (Math.hypot(cx - nx, cy - ny) < 48) { damagePlayer("shot"); p.hit = true; }
      }
      if (p.life <= 0 || Math.abs(p.x - player.x) > viewW + tileSize * 8) enemyProjectiles.splice(i, 1);
    }
  }

  function handleEnemyPlayerCollisions() {
    const pr = { x: player.x, y: player.y, w: player.w, h: player.h };
    for (const en of enemies) {
      if (!en.alive) continue;
      const er = { x: en.x, y: en.y, w: en.w, h: en.h };
      if (!rectsOverlap(pr, er)) continue;
      const falling = player.vy > 120;
      const playerBottom = player.y + player.h;
      const enemyMid = en.y + en.h * 0.58;
      if (falling && playerBottom <= enemyMid) {
        hitEnemy(en, { damage: en.type === "warden" ? 1 : en.hp }, false);
        player.vy = -JUMP_V0 * 0.55;
        player.onGround = false;
      } else damagePlayer("enemy");
      break;
    }
    for (const b of bosses) {
      if (!b.alive) continue;
      const br = { x: b.x, y: b.y, w: b.w, h: b.h };
      if (!rectsOverlap(pr, br)) continue;
      const falling = player.vy > 160;
      const playerBottom = player.y + player.h;
      const bossTopZone = b.y + b.h * 0.38;
      if (falling && playerBottom <= bossTopZone) {
        hitBoss(b, 1, true);
        player.vy = -JUMP_V0 * 0.72;
        player.onGround = false;
      } else damagePlayer("boss");
      break;
    }
  }

  function updateNpcs() {
    if (!level?.npcs?.length) return;
    if (now() - lastNpcTalkAt < 900) return;
    for (const n of level.npcs) {
      const nx = Number(n.x || 0) * tileSize;
      const ny = Number(n.y || 0) * tileSize;
      if (Math.abs(player.x - nx) < tileSize * 2 && Math.abs(player.y - ny) < tileSize * 2) {
        addText(objectiveComplete() ? (n.completeMessage || "Gate is open!") : (n.message || level.objective.message), nx, ny - 18, 1.1);
        lastNpcTalkAt = now();
        break;
      }
    }
  }

  function updateFloatingText(dt) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const f = floatingTexts[i];
      f.t += dt;
      f.y -= 38 * dt;
      if (f.t >= f.life) floatingTexts.splice(i, 1);
    }
  }

  function updateGameplay(dt) {
    levelTime += dt;
    totalRunTime += dt;
    if (comboTimer > 0) comboTimer = Math.max(0, comboTimer - dt);
    else comboCount = 0;

    updateObstacles(dt);
    updatePlayer(dt);
    updateEnemies(dt);
    updateBosses(dt);
    updateProjectiles(dt);
    handleEnemyPlayerCollisions();
    updateNpcs();
    updateFloatingText(dt);
    updateActorAnimations(dt);

    if (level?.meta?.timeLimit && levelTime > Number(level.meta.timeLimit) + timeGrace && player.invuln <= 0) {
      timeGrace += 30;
      damagePlayer("time");
    }
    if (now() - lastLiveScoreAt > 350) { lastLiveScoreAt = now(); postScore("live"); }

    prevInput.jump = input.jump;
    prevInput.action = input.action;
    setHUD();
  }

  function updateActorAnimations(dt) {
    if (!animation) return;
    animation.update(player, "player", dt);
    for (const enemy of enemies) if (enemy.type !== "drone") animation.update(enemy, actorKind(enemy), dt, {
      windup: enemy.ai?.phase === "windup" || (enemy.type === "shooter" && enemy.shootT > 0 && enemy.shootT < 0.28 && Math.abs(player.x - enemy.x) < tileSize * 9),
    });
    for (const boss of bosses) animation.update(boss, "boss", dt, {
      windup: boss.shootT > 0 && boss.shootT < 0.3,
    });
  }

  async function completeLevel() {
    if (paused || !running || !objectiveComplete()) return;
    paused = true;
    resetInput();
    const starCount = calcStars();
    const levelKey = mode === "daily" ? dailyDateKey : String(currentLevel);
    if (mode === "campaign") {
      stars[levelKey] = Math.max(Number(stars[levelKey] || 0), starCount);
      unlockedLevel = Math.max(unlockedLevel, Math.min(LEVEL_COUNT, currentLevel + 1));
    } else {
      dailyBestStore[dailyDateKey] = Math.max(Number(dailyBestStore[dailyDateKey] || 0), Math.floor(score));
    }
    saveEconomy();
    const timeBonus = Math.max(0, Math.floor((Number(level.meta.timeLimit || 120) - levelTime) * 10));
    const starBonus = starCount * 180;
    award(650 + timeBonus + starBonus, player.x, player.y, `${"★".repeat(starCount)} +${650 + timeBonus + starBonus}`);
    beep(660, 0.07, "triangle", 0.05);
    beep(880, 0.07, "triangle", 0.05);
    postScore(mode === "daily" ? "daily_complete" : (currentLevel >= LEVEL_COUNT ? "complete" : "level_complete"), { stars: starCount });

    if (mode === "daily") {
      running = false;
      syncPlayUI();
      btnStart.textContent = "Start";
      updateLevelButtons();
      return;
    }

    if (currentLevel < LEVEL_COUNT) {
      currentLevel += 1;
      setLoading(true);
      try {
        await loadLevel(currentLevel);
        resetLevelState({ resetScore: false });
        setPaused(!!document.hidden || interrupted);
        updateLevelButtons();
      } catch (e) {
        console.warn(e);
        running = false;
        setPaused(true, "The next level could not load. Select it again to retry.");
      } finally {
        setLoading(false);
      }
    } else {
      running = false;
      syncPlayUI();
      btnStart.textContent = "Play Again";
      addText("Quest complete!", player.x, player.y);
      updateLevelButtons();
    }
  }

  // ----------------------------
  // Render
  // ----------------------------
  function worldToScreen(x, y, camX, camY) { return { x: x - camX, y: y - camY }; }
  function computeCamera(dt = 1 / 60) {
    if (!level) return { camX: 0, camY: 0 };
    const target = presentation.camera(player, level.width * tileSize, level.height * tileSize, display, cameraInsets);
    if (!cameraState) cameraState = target;
    else {
      const factor = 1 - Math.exp(-12 * dt);
      cameraState.camX = lerp(cameraState.camX, target.camX, factor);
      cameraState.camY = lerp(cameraState.camY, target.camY, factor);
    }
    return cameraState;
  }
  function drawBackground(camX) {
    ctx.clearRect(0, 0, viewW, viewH);
    if (bgImg) {
      const scale = Math.max(viewW / bgImg.width, viewH / bgImg.height);
      const dw = bgImg.width * scale;
      const dh = bgImg.height * scale;
      const px = -(camX * 0.18) % dw;
      for (let x = px - dw; x < viewW + dw; x += dw) ctx.drawImage(bgImg, x, 0, dw, dh);
      return;
    }
    const g = ctx.createLinearGradient(0, 0, 0, viewH);
    g.addColorStop(0, "#071022");
    g.addColorStop(0.56, "#101a32");
    g.addColorStop(1, "#080b18");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.globalAlpha = 0.34;
    for (let i = 0; i < 12; i++) {
      const x = ((i * 210 - camX * (0.08 + (i % 3) * 0.02)) % (viewW + 260)) - 100;
      const h = 70 + (i % 5) * 38;
      ctx.fillStyle = i % 2 ? "#38bdf8" : "#a78bfa";
      ctx.fillRect(x, viewH - h - 36, 110, h);
    }
    ctx.globalAlpha = 1;
  }
  function drawWorld(camX, camY) {
    if (!level) return;
    ctx.save();
    ctx.fillStyle = "rgba(12,20,38,0.9)";
    ctx.strokeStyle = "rgba(56,189,248,0.45)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(56,189,248,0.18)";
    ctx.shadowBlur = 8;
    iterSolidRects((s) => {
      if (s.door) return;
      const p = worldToScreen(s.x, s.y, camX, camY);
      if (p.x + s.w < -90 || p.x > viewW + 90 || p.y + s.h < -90 || p.y > viewH + 90) return;
      if (s.ref?.type === "collapse" && s.ref.state === "shaking") ctx.globalAlpha = 0.55 + Math.sin(totalRunTime * 40) * 0.25;
      ctx.fillRect(p.x, p.y, s.w, s.h);
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, s.w - 1, s.h - 1);
      ctx.globalAlpha = 1;
    });
    ctx.restore();

    drawDoorsSwitches(camX, camY);
    drawHazards(camX, camY);
    drawItems(camX, camY);
    drawNpcs(camX, camY);
    drawCheckpoints(camX, camY);
    drawExit(camX, camY);
  }
  function drawHazards(camX, camY) {
    ctx.fillStyle = "rgba(251,113,133,0.72)";
    for (const h of level.hazards) {
      const r = toWorldRect(h);
      const p = worldToScreen(r.x, r.y, camX, camY);
      const count = Math.max(1, Math.floor(r.w / 16));
      for (let i = 0; i < count; i++) {
        const w = r.w / count;
        const x = p.x + i * w;
        ctx.beginPath();
        ctx.moveTo(x, p.y + r.h);
        ctx.lineTo(x + w / 2, p.y + r.h * 0.22);
        ctx.lineTo(x + w, p.y + r.h);
        ctx.closePath();
        ctx.fill();
      }
    }
    for (const ob of obstacles) {
      if (!ob.active) continue;
      const p = worldToScreen(ob.x, ob.y, camX, camY);
      if (ob.type === "taxi") {
        if (!presentation.drawSprite(ctx, imgTaxi, "taxi", { ...p, w: ob.w, h: ob.h }, ob.dir)) {
          ctx.fillStyle = "rgba(250,204,21,.9)";
          ctx.beginPath(); ctx.roundRect(p.x, p.y, ob.w, ob.h, 8); ctx.fill();
          ctx.fillStyle = "#101827"; ctx.font = "900 11px system-ui"; ctx.textAlign = "center";
          ctx.fillText("TAXI", p.x + ob.w / 2, p.y + ob.h * 0.62);
        }
      } else if (ob.type === "crate" && ob.state !== "landed") {
        ctx.fillStyle = "rgba(161,98,7,.92)";
        ctx.strokeStyle = "rgba(255,255,255,.25)";
        ctx.fillRect(p.x, p.y, ob.w, ob.h); ctx.strokeRect(p.x, p.y, ob.w, ob.h);
      } else if (ob.type === "trampoline") {
        ctx.fillStyle = "rgba(167,139,250,.9)";
        ctx.beginPath(); ctx.roundRect(p.x, p.y, ob.w, ob.h, 8); ctx.fill();
      }
    }
  }
  function drawDoorsSwitches(camX, camY) {
    for (const d of doors) {
      const p = worldToScreen(d.x, d.y, camX, camY);
      ctx.fillStyle = d.open ? "rgba(34,197,94,.18)" : "rgba(56,189,248,.2)";
      ctx.strokeStyle = d.open ? "rgba(34,197,94,.55)" : "rgba(56,189,248,.8)";
      ctx.lineWidth = 3;
      ctx.fillRect(p.x, p.y, d.w, d.h);
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, d.w - 1, d.h - 1);
    }
    for (const s of switches) {
      const p = worldToScreen(s.x, s.y, camX, camY);
      ctx.fillStyle = s.pressed ? "rgba(34,197,94,.95)" : "rgba(250,204,21,.9)";
      ctx.beginPath(); ctx.roundRect(p.x, p.y, s.w, s.h, 6); ctx.fill();
    }
  }
  function drawItems(camX, camY) {
  const coinDraw = presentation.sizes.coin;
  const collectibleDraw = presentation.sizes.collectible;
  const powerRadius = presentation.sizes.powerupRadius;

  for (const c of level.coins) {
    const x = c.x * tileSize + tileSize / 2;
    const y = c.y * tileSize + tileSize / 2;
    const p = worldToScreen(x, y, camX, camY);
    if (p.x < -60 || p.x > viewW + 60 || p.y < -60 || p.y > viewH + 60) continue;

    if (imgCoin) {
      presentation.drawSprite(ctx, imgCoin, "coin", { x: p.x - coinDraw / 2, y: p.y - coinDraw / 2, w: coinDraw, h: coinDraw }, 1, "contain");
    } else {
      ctx.fillStyle = "rgba(250,204,21,0.95)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, (8 + Math.sin(totalRunTime * 8) * 1.5) * SCALE.coin, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.55)";
      ctx.stroke();
    }
  }

  for (const c of level.collectibles) {
    if (c.taken) continue;
    const p = worldToScreen(c.x * tileSize + tileSize / 2, c.y * tileSize + tileSize / 2, camX, camY);
    ctx.fillStyle = c.type === "badge" ? "rgba(167,139,250,.95)" : c.type === "taxi" ? "rgba(250,204,21,.95)" : c.type === "lunch" ? "rgba(134,239,172,.95)" : "rgba(56,189,248,.95)";
    ctx.beginPath();
    ctx.roundRect(p.x - collectibleDraw / 2, p.y - collectibleDraw / 2, collectibleDraw, collectibleDraw, 8);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,.62)";
    ctx.font = `900 ${Math.round(13 * SCALE.collectible)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(c.icon || "K", p.x, p.y + 1);
  }

  for (const pwr of level.powerups) {
    if (pwr.taken) continue;
    const p = worldToScreen(pwr.x * tileSize + tileSize / 2, pwr.y * tileSize + tileSize / 2, camX, camY);
    ctx.fillStyle = "rgba(255,255,255,.93)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, powerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(5,8,22,.8)";
    ctx.font = `900 ${Math.round(12 * SCALE.powerup)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pwr.type === "shield" ? "S" : pwr.type === "life" ? "+" : pwr.type === "jump" ? "J" : "R", p.x, p.y);
  }
}
  function drawNpcs(camX, camY) {
    for (const n of level.npcs || []) {
      const x = Number(n.x || 0) * tileSize;
      const y = Number(n.y || 0) * tileSize;
      const p = worldToScreen(x, y, camX, camY);
      ctx.fillStyle = "rgba(134,239,172,.22)"; ctx.strokeStyle = "rgba(134,239,172,.8)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(p.x, p.y - 28, 26, 36, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.font = "900 10px system-ui"; ctx.textAlign = "center"; ctx.fillText(n.name || "NPC", p.x + 13, p.y - 36);
    }
  }
  function drawExit(camX, camY) {
    const ex = exitRect();
    if (!ex) return;
    const p = worldToScreen(ex.x, ex.y, camX, camY);
    const open = objectiveComplete();
    ctx.fillStyle = open ? "rgba(34,197,94,.2)" : "rgba(56,189,248,.10)";
    ctx.strokeStyle = open ? "rgba(34,197,94,.85)" : "rgba(56,189,248,.45)";
    ctx.lineWidth = 3;
    ctx.fillRect(p.x, p.y, ex.w, ex.h);
    ctx.strokeRect(p.x + 0.5, p.y + 0.5, ex.w - 1, ex.h - 1);
    ctx.fillStyle = open ? "rgba(134,239,172,.95)" : "rgba(186,230,253,.75)";
    ctx.font = "900 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(open ? "OPEN" : "LOCKED", p.x + ex.w / 2, p.y - 8);
  }
  function drawCheckpoints(camX, camY) {
    for (const c of level.checkpoints) {
      const p = worldToScreen(c.x * tileSize, 15 * tileSize, camX, camY);
      if (p.x < -80 || p.x > viewW + 80) continue;
      ctx.strokeStyle = c.reached ? "#86efac" : "#7dd3fc"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 64); ctx.stroke();
      ctx.fillStyle = c.reached ? "#166534" : "#075985";
      ctx.fillRect(p.x + 2, p.y - 63, 30, 22);
      ctx.fillStyle = "#e0f2fe"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "center";
      ctx.fillText(c.reached ? "✓" : "CP", p.x + 17, p.y - 48);
    }
  }
  function drawDrone(en, p) {
    const glow = en.windup > 0 ? "#fbbf24" : "#67e8f9";
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-3, 5); ctx.lineTo(en.w + 3, 5); ctx.stroke();
    for (const x of [0, en.w]) {
      ctx.fillStyle = "#263750"; ctx.beginPath(); ctx.ellipse(x, 4, 13, 4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = glow; ctx.lineWidth = 2;
      const sweep = motionPreference?.matches ? 10 : 7 + Math.abs(Math.sin(en.hoverT * 35)) * 7;
      ctx.beginPath(); ctx.moveTo(x - sweep, 0); ctx.lineTo(x + sweep, 0); ctx.stroke();
      ctx.fillStyle = "rgba(56,189,248,.45)";
      ctx.beginPath(); ctx.moveTo(x - 5, 8); ctx.lineTo(x, 18 + Math.sin(en.hoverT * 24) * 2); ctx.lineTo(x + 5, 8); ctx.fill();
    }
    ctx.fillStyle = "#172b46"; ctx.strokeStyle = "#a5b4fc"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(5, 3, en.w - 10, en.h - 3, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(en.w / 2, en.h * 0.52, 5, 0, Math.PI * 2); ctx.fill();
    if (en.windup > 0) {
      ctx.strokeStyle = "rgba(251,191,36,.65)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(en.w / 2, en.h / 2, 19 + en.windup * 12, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(en.w / 2, en.h / 2);
      ctx.lineTo(en.w / 2 + en.aimX * 100, en.h / 2 + en.aimY * 100); ctx.stroke();
    }
    ctx.restore();
  }
  function drawEnemies(camX, camY) {
    for (const en of enemies) {
      if (en.type === "drone" && !en.alive) continue;
      const kind = actorKind(en);
      if (!en.alive && (!animation?.has(kind) || animation.finished(en, kind))) continue;
      const p = worldToScreen(en.x, en.y, camX, camY);
      if (p.x + en.w < -70 || p.x > viewW + 70 || p.y + en.h < -70 || p.y > viewH + 70) continue;
      if (en.type === "drone") { drawDrone(en, p); continue; }
      if (enemyRoster?.isRole(en.type)) {
        if (!animation?.draw(ctx, en, kind, { ...p, w: en.w, h: en.h })) enemyRoster.drawFallback(ctx, en, p, totalRunTime, motionPreference?.matches);
        enemyRoster.drawCue(ctx, en, p, motionPreference?.matches);
        continue;
      }
      if (animation?.draw(ctx, en, "enemy", { ...p, w: en.w, h: en.h })) continue;
      if (imgEnemy) {
        presentation.drawSprite(ctx, imgEnemy, "enemy", { ...p, w: en.w, h: en.h }, en.dir);
      } else {
        ctx.fillStyle = en.type === "shooter" ? "rgba(167,139,250,.24)" : "rgba(251,113,133,.22)";
        ctx.strokeStyle = en.type === "chaser" ? "rgba(251,113,133,.95)" : "rgba(251,113,133,.78)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(p.x, p.y, en.w, en.h, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.9)";
        const eyeX = en.dir > 0 ? p.x + en.w * 0.64 : p.x + en.w * 0.26;
        ctx.fillRect(eyeX, p.y + en.h * 0.28, 4, 4);
      }
    }
  }
  function drawBosses(camX, camY) {
    for (const b of bosses) {
      if (!b.alive && (!animation?.has("boss") || animation.finished(b, "boss"))) continue;
      const p = worldToScreen(b.x, b.y, camX, camY);
      if (!animation?.draw(ctx, b, "boss", { ...p, w: b.w, h: b.h })) {
        ctx.save(); ctx.translate(p.x, p.y);
        const armor = b.phase >= 2 ? "#ef4444" : "#d97706";
        const stride = Math.sin(totalRunTime * 10) * 3;
        ctx.fillStyle = "#273449";
        ctx.fillRect(8, b.h * .68, 18, b.h * .32 + stride);
        ctx.fillRect(b.w - 26, b.h * .68, 18, b.h * .32 - stride);
        ctx.fillStyle = armor; ctx.strokeStyle = "#fcd34d"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(4, b.h * .24, b.w - 8, b.h * .48, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#475569"; ctx.fillRect(-6, b.h * .32, 17, 27); ctx.fillRect(b.w - 11, b.h * .32, 17, 27);
        ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.roundRect(b.w * .23, 0, b.w * .54, b.h * .3, 6); ctx.fill();
        ctx.fillStyle = "#fef08a"; ctx.fillRect(b.w * .3, b.h * .1, b.w * .4, 5);
        ctx.fillStyle = "#fef3c7"; ctx.beginPath(); ctx.arc(b.w / 2, b.h * .44, 6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      if (!b.alive) continue;
      ctx.fillStyle = "#fef3c7"; ctx.font = "bold 10px system-ui"; ctx.textAlign = "center";
      ctx.fillText(b.name, p.x + b.w / 2, p.y - 20);
      const barW = Math.max(42, b.w);
      ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(p.x, p.y - 12, barW, 6);
      ctx.fillStyle = "rgba(34,197,94,.9)"; ctx.fillRect(p.x, p.y - 12, barW * clamp(b.hp / b.maxHp, 0, 1), 6);
    }
  }
  function drawProjectiles(camX, camY) {
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(250,204,21,.65)";
    ctx.fillStyle = "rgba(250,204,21,.95)";
    for (const b of projectiles) { const p = worldToScreen(b.x, b.y, camX, camY); ctx.fillRect(p.x, p.y, b.w, b.h); }
    ctx.shadowColor = "rgba(251,113,133,.65)";
    ctx.fillStyle = "rgba(251,113,133,.95)";
    for (const b of enemyProjectiles) {
      const p = worldToScreen(b.x, b.y, camX, camY);
      if (b.role === "spark") {
        ctx.save(); ctx.fillStyle = b.burst ? "rgba(251,146,60,.3)" : "#fbbf24"; ctx.strokeStyle = "#fde68a"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x + b.w / 2, p.y + b.h / 2, b.burst ? 48 : 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
      } else { ctx.fillStyle = b.role === "ranger" ? "#86efac" : "rgba(251,113,133,.95)"; ctx.fillRect(p.x, p.y, b.w, b.h); }
    }
    ctx.shadowBlur = 0;
  }
  function drawPlayer(camX, camY) {
    const p = worldToScreen(player.x, player.y, camX, camY);
    const pose = animation?.snapshot(player, "player");
    if (player.lives > 0 && player.invuln > 0 && pose?.clip !== "hurt" && Math.floor(totalRunTime * 18) % 2 === 0) return;
    const animated = animation?.draw(ctx, player, "player", { ...p, w: player.w, h: player.h });
    const img = Math.abs(player.vx) > 45 && imgPlayerRun ? imgPlayerRun : imgPlayerIdle;
    if (!animated && img) {
      const name = img === imgPlayerRun ? "playerRun" : "playerIdle";
      presentation.drawSprite(ctx, img, name, { ...p, w: player.w, h: player.h }, player.face);
    } else if (!animated) {
      ctx.fillStyle = "rgba(234,240,255,.18)"; ctx.strokeStyle = "rgba(56,189,248,.86)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(p.x, p.y, player.w, player.h, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(234,240,255,.95)";
      const eye = player.face > 0 ? p.x + player.w * 0.66 : p.x + player.w * 0.24;
      ctx.fillRect(eye, p.y + player.h * 0.25, 4, 4);
    }
    if (player.shield > 0) {
      ctx.strokeStyle = "rgba(134,239,172,.85)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(p.x + player.w / 2, p.y + player.h / 2, 28, 0, Math.PI * 2); ctx.stroke();
    }
  }
  function drawOverlayText(camX, camY) {
    ctx.save();
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    if (comboCount > 1) {
      ctx.fillStyle = "rgba(250,204,21,.96)";
      ctx.font = `1000 ${18 / display.scale}px system-ui`;
      ctx.fillText(`Combo x${comboCount}`, 14 / display.scale, (cameraInsets.top + 8) / display.scale);
    }
    ctx.font = `900 ${14 / display.scale}px system-ui`; ctx.textAlign = "center";
    for (const f of floatingTexts) {
      const p = worldToScreen(f.x, f.y, camX, camY);
      ctx.globalAlpha = clamp(1 - f.t / f.life, 0, 1);
      ctx.fillStyle = "rgba(255,255,255,.95)";
      const maxWidth = Math.min(viewW - 32 / display.scale, 320 / display.scale);
      const lines = [];
      let line = "";
      for (const word of String(f.text).split(" ")) {
        const next = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(next).width > maxWidth) { lines.push(line); line = word; }
        else line = next;
      }
      if (line) lines.push(line);
      const x = clamp(p.x, maxWidth / 2 + 8 / display.scale, viewW - maxWidth / 2 - 8 / display.scale);
      const y = clamp(p.y, cameraInsets.top / display.scale, (display.height - cameraInsets.bottom - 64) / display.scale);
      lines.slice(0, 4).forEach((text, i) => {
        ctx.strokeStyle = "rgba(3,8,18,.9)"; ctx.lineWidth = 4 / display.scale;
        ctx.strokeText(text, x, y + i * 17 / display.scale);
        ctx.fillText(text, x, y + i * 17 / display.scale);
      });
    }
    ctx.restore();
  }
  function render(dt = 1 / 60) {
    ctx.setTransform(dpr * display.scale, 0, 0, dpr * display.scale, 0, 0);
    const { camX, camY } = computeCamera(dt);
    drawBackground(camX);
    if (level) {
      drawWorld(camX, camY);
      drawEnemies(camX, camY);
      drawBosses(camX, camY);
      drawProjectiles(camX, camY);
      drawPlayer(camX, camY);
      drawOverlayText(camX, camY);
    }
  }

  // ----------------------------
  // UI / Shop / Level grid
  // ----------------------------
  function updateStarSummary() {
    if (!elStarSummary) return;
    let total = 0;
    for (let i = 1; i <= LEVEL_COUNT; i++) total += Number(stars[String(i)] || 0);
    elStarSummary.textContent = `${total}/${LEVEL_COUNT * 3}`;
  }
  function renderShop() {
    if (!elShopGrid) return;
    const existing = elShopGrid.dataset.rendered;
    const signature = JSON.stringify({ wallet, upgrades });
    if (existing === signature) return;
    elShopGrid.dataset.rendered = signature;
    elShopGrid.innerHTML = "";
    for (const item of SHOP) {
      const levelNow = Number(upgrades[item.key] || 0);
      const maxed = levelNow >= item.max;
      const cost = maxed ? 0 : item.cost[levelNow];
      const b = document.createElement("button");
      b.type = "button";
      b.className = `shopBtn ${!maxed && wallet >= cost ? "canBuy" : ""} ${maxed ? "maxed" : ""}`;
      b.innerHTML = `<b>${item.title} ${levelNow}/${item.max}</b><span>${maxed ? "Maxed" : `${item.desc} • Cost ${cost}`}</span>`;
      b.addEventListener("click", () => {
        if (maxed || wallet < cost) { beep(180, 0.04, "square", 0.02); return; }
        wallet -= cost;
        upgrades[item.key] = levelNow + 1;
        saveEconomy();
        renderShop();
        setHUD();
        beep(920, 0.06, "triangle", 0.04);
      });
      elShopGrid.appendChild(b);
    }
  }
  function updateLevelButtons() {
    [...elLevelGrid.children].forEach((button, index) => {
      const levelNo = index + 1;
      button.classList.toggle("active", mode === "campaign" && levelNo === currentLevel);
      const locked = levelNo > unlockedLevel;
      button.disabled = loading || locked;
      button.classList.toggle("locked", locked);
      button.setAttribute("aria-label", `Level ${levelNo}${locked ? ", locked. Complete level " + (levelNo - 1) : ", unlocked"}`);
      const star = Number(stars[String(levelNo)] || 0);
      const s = button.querySelector(".stars");
      if (s) s.textContent = locked ? "Locked" : star > 0 ? "★".repeat(star) : "—";
    });
    const progressLabel = $("campaignProgress");
    if (progressLabel) progressLabel.textContent = `Campaign · ${unlockedLevel}/${LEVEL_COUNT} levels unlocked`;
    updateStarSummary();
  }
  function buildLevelGrid() {
    elLevelGrid.innerHTML = "";
    for (let i = 1; i <= LEVEL_COUNT; i++) {
      const b = document.createElement("button");
      b.className = "lvlBtn" + (i === currentLevel ? " active" : "");
      b.type = "button";
      b.innerHTML = `<span>${i}</span><span class="stars">${stars[String(i)] ? "★".repeat(stars[String(i)]) : "—"}</span>`;
      b.addEventListener("click", async () => {
        if (loading || i > unlockedLevel) return;
        setLoading(true);
        running = false;
        setPaused(false);
        currentLevel = i;
        mode = "campaign";
        updateLevelButtons();
        try {
          await loadLevel(i);
          resetLevelState({ resetScore: true });
          render();
        } catch (e) { console.warn(e); setPaused(true, "This level could not load. Please try again."); }
        finally { setLoading(false); }
      });
      elLevelGrid.appendChild(b);
    }
    updateLevelButtons();
  }
  function syncPlayUI() {
    const playing = running && !paused;
    const hidePanel = playing || defeatRemaining > 0;
    panel.hidden = hidePanel;
    // Retain this property for the shared game-tab fullscreen integration.
    panel.style.display = hidePanel ? "none" : "flex";
    if (touch) touch.hidden = !playing;
    if (missionHud) missionHud.hidden = !playing;
    if (btnHudPause) btnHudPause.hidden = !playing;
    btnPause.hidden = !running;
    shell?.classList.toggle("isPlaying", playing);
    if (!playing) resetInput();
    measureCameraInsets();
  }
  function setLoading(value) {
    loading = value;
    const buttons = [btnStart, btnDaily, btnPause, btnHudPause, ...elLevelGrid.children];
    for (const button of buttons) if (button) button.disabled = value;
    panel.setAttribute("aria-busy", String(value));
    updateLevelButtons();
  }
  function setPaused(v, message = "") {
    paused = !!v;
    if (!paused) interrupted = false;
    resetInput();
    btnPause.textContent = paused ? "Resume" : "Pause";
    if (pauseMessage) { pauseMessage.textContent = message; pauseMessage.hidden = !message; }
    syncPlayUI();
    if (running && !paused) canvas.focus({ preventScroll: true });
    else if (running && paused) btnPause.focus({ preventScroll: true });
  }
  async function startOrRestart() {
    if (loading) return;
    setLoading(true);
    resetInput();
    interrupted = false;
    try {
      if (animation && ["player", "enemy", "boss"].some(kind => !animation.has(kind))) await animation.load(url => loadImageSafe(url, 15000));
      if (mode !== "daily") await loadLevel(Number.isFinite(Number(currentLevel)) ? Number(currentLevel) : 1);
      else await loadDailyLevel();
      resetLevelState({ resetScore: true });
      running = true;
      setPaused(!!document.hidden || interrupted);
      btnStart.textContent = "Restart";
      ensureAudio();
      if (musicEnabled) startMusic();
      beep(520, 0.06, "triangle", 0.05);
      postScore(mode === "daily" ? "daily_start" : "start");
    } catch (e) {
      console.warn(e);
      running = false;
      setPaused(true, "The level could not load. Check your connection and try again.");
    } finally { setLoading(false); }
  }
  async function startDaily() {
    if (loading) return;
    setLoading(true);
    resetInput();
    interrupted = false;
    try {
      await loadDailyLevel();
      resetLevelState({ resetScore: true });
      running = true;
      mode = "daily";
      setPaused(!!document.hidden || interrupted);
      btnStart.textContent = "Restart";
      ensureAudio();
      if (musicEnabled) startMusic();
      postScore("daily_start");
    } catch (e) { console.warn(e); running = false; setPaused(true, "The daily challenge could not load. Please try again."); }
    finally { setLoading(false); }
  }

  btnStart.addEventListener("click", () => { void startOrRestart(); });
  if (btnDaily) btnDaily.addEventListener("click", () => { void startDaily(); });
  btnPause.addEventListener("click", () => {
    if (!running || loading) return;
    setPaused(!paused);
  });
  btnHudPause?.addEventListener("click", () => { if (running && !loading) setPaused(true); });
  btnMute.addEventListener("click", () => {
    muted = !muted;
    btnMute.textContent = muted ? "Unmute" : "Mute";
    if (muted) stopMusic();
    else ensureAudio();
  });
  if (btnMusic) btnMusic.addEventListener("click", () => {
    ensureAudio();
    if (musicEnabled) stopMusic();
    else startMusic();
  });

  let tPrev = performance.now();
  function loop() {
    const t = performance.now();
    const dt = clamp((t - tPrev) / 1000, 0, 0.033);
    tPrev = t;
    if (running && !paused) updateGameplay(dt);
    else if (!running && defeatRemaining > 0 && !document.hidden) {
      animation?.update(player, "player", dt, { defeated: true });
      defeatRemaining = Math.max(0, defeatRemaining - dt);
      if (defeatRemaining === 0) syncPlayUI();
    }
    render(dt);
    requestAnimationFrame(loop);
  }

  async function boot() {
    setLoading(true);
    best = Number(safeGet(BEST_KEY, "0")) || 0;
    wallet = Number(safeGet(WALLET_KEY, "0")) || 0;
    await loadAssetsOptional();
    try { await loadLevel(unlockedLevel); resetLevelState({ resetScore: true }); } catch (e) { console.warn(e); }
    buildLevelGrid();
    setLoading(false);
    syncPlayUI();
    renderShop();
    setHUD();
    loop();
  }

  void boot();
})();
