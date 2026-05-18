/* Kasi Quest — Rooftop Runner (Canvas 2D) — Mobile First
   - Reads levels from JSON: ./levels/level-01.json ... level-20.json
   - Uses separate PNGs if present, but NEVER fails if they 404
   - Uses index.html IDs exactly (so no null onclick crashes)
   - Emits score + best updates to GloryGames sidebar via postMessage
   - Enemies: JSON-driven patrol AI + collisions + stomp
*/

(() => {
  "use strict";

  // ----------------------------
  // Config
  // ----------------------------
  const GAME_SLUG = "kasi-quest";
  const MAX_LEVELS = 20;

  // Runner behavior (fixes "falling top to bottom instead of running left-right")
  const AUTO_RUN = true;          // auto-run right by default
  const AUTO_RUN_SPEED = 260;     // px/s baseline
  const AUTO_RUN_ACCEL = 2400;    // accelerates toward baseline

  function levelUrl(n) {
    const nn = String(n).padStart(2, "0");
    return `./levels/level-${nn}.json`;
  }

  // Option B: separate PNGs (safe fallback if missing)
  const ASSETS = {
    playerIdle: "./assets/sprites/player_idle.png",
    playerRun: "./assets/sprites/player_run.png",
    enemy: "./assets/sprites/enemy.png",
    coin: "./assets/items/coin_spin.png",
    power: "./assets/items/power_dash.png",
    tileset: "./assets/tiles/tileset.png",
    ui: "./assets/ui/ui.png",
    bgForLevel: (n) => `./assets/backgrounds/level-${String(n).padStart(2, "0")}.png`,
  };

  // ----------------------------
  // DOM (IDs must exist)
  // ----------------------------
  const $ = (id) => document.getElementById(id);

  const canvas = $("c");
  const ctx = canvas?.getContext("2d", { alpha: true });

  const panel = $("panel");
  const btnStart = $("btnStart");
  const btnPause = $("btnPause");
  const btnMute = $("btnMute");

  const elScore = $("score");
  const elBest = $("best");
  const elCoins = $("coins");
  const elTime = $("time");

  const elLevelNum = $("levelNum");
  const elLevelLabel = $("levelLabel");
  const elLevelGrid = $("levelGrid");

  const btnLeft = $("btnLeft");
  const btnRight = $("btnRight");
  const btnJump = $("btnJump");
  const btnAction = $("btnAction");

  if (!canvas || !ctx) {
    console.error(`[${GAME_SLUG}] Missing canvas#c or 2D context`);
    return;
  }
  if (!panel || !btnStart || !btnPause || !btnMute || !elLevelGrid) {
    console.error(`[${GAME_SLUG}] Missing required UI elements. Check index.html IDs.`);
    return;
  }

  // ----------------------------
  // GloryGames sidebar bridge
  // ----------------------------
  function emitSidebar(type, payload = {}) {
    try {
      // Original GloryGames event (kept for compatibility)
      window.parent?.postMessage(
        { source: "glorygames", gameSlug: GAME_SLUG, type, payload },
        window.location.origin
      );

      // New standardized score event consumed by the play page bridge.
      // play-client.tsx listens for GG_SCORE / gg:score and updates the sidebar.
      if (type === "score_live" && typeof payload.score === "number") {
        window.parent?.postMessage(
          {
            type: "GG_SCORE",
            gameSlug: GAME_SLUG,
            score: Math.floor(payload.score),
            mode: "live",
            payload,
          },
          window.location.origin
        );
      }
    } catch (_) {}
  }

  function getPlayerName() {
    try {
      return (
        localStorage.getItem("gg_player_name") ||
        localStorage.getItem("glorygames_player_name") ||
        "Player"
      );
    } catch (_) {
      return "Player";
    }
  }

  async function submitFinalScore(finalScore, mode = "final") {
    const cleanScore = Math.max(0, Math.floor(Number(finalScore) || 0));
    const playerName = getPlayerName();

    try {
      // Parent bridge first. This updates the live sidebar and lets the platform persist.
      window.parent?.postMessage(
        {
          type: "GG_SCORE",
          gameSlug: GAME_SLUG,
          score: cleanScore,
          mode,
          payload: {
            score: cleanScore,
            best,
            level: currentLevel,
            coins: coinCount,
            time: elapsed,
            playerName,
          },
        },
        window.location.origin
      );
    } catch (_) {}

    try {
      // If the parent injected a platform bridge, use it too.
      if (window.GG?.endRound) {
        window.GG.endRound({ gameSlug: GAME_SLUG, score: cleanScore, mode, playerName });
      } else if (window.GG?.submitScore) {
        window.GG.submitScore({ gameSlug: GAME_SLUG, score: cleanScore, mode, playerName });
      }
    } catch (_) {}

    try {
      // Direct fallback for direct game URL testing.
      await fetch(`/api/games/${GAME_SLUG}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: cleanScore, playerName, mode }),
      });
    } catch (_) {}

    return cleanScore;
  }

  // ----------------------------
  // Helpers
  // ----------------------------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // prevent page scroll while playing (mobile)
  document.addEventListener(
    "touchmove",
    (e) => {
      if (panel.style.display !== "none") return;
      e.preventDefault();
    },
    { passive: false }
  );

  // ----------------------------
  // Canvas sizing
  // ----------------------------
  let viewW = 1;
  let viewH = 1;
  let dpr = 1;

  function fitCanvas() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const r = canvas.getBoundingClientRect();
    viewW = Math.max(1, Math.floor(r.width));
    viewH = Math.max(1, Math.floor(r.height));
    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", fitCanvas);
  fitCanvas();

  // ----------------------------
  // Audio (no external files)
  // ----------------------------
  let muted = false;
  let audioCtx = null;

  function ensureAudio() {
    if (muted) return null;
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function beep(freq = 440, dur = 0.06, type = "sine", gain = 0.05) {
    const ac = ensureAudio();
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + dur);
  }

  // ----------------------------
  // Safe asset loading (never crash on 404)
  // ----------------------------
  const imageCache = new Map();

  function loadImageSafe(url) {
    if (!url) return Promise.resolve(null);
    if (imageCache.has(url)) return Promise.resolve(imageCache.get(url));

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        imageCache.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        imageCache.set(url, null);
        resolve(null);
      };
      img.src = url;
    });
  }

  async function loadJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
    return res.json();
  }

  // ----------------------------
  // Level format (robust parsing)
  // Supports:
  //  A) tiles: number[][] (0 empty, 1 solid, 2 coin, 3 spike, 4 exit)
  //  B) solids: [{x,y,w,h}], coins: [{x,y}], spikes: [{x,y,w,h}], exit:{x,y,w,h}, spawn:{x,y}
  //  C) enemies: [{x,y,type,minX,maxX,speed}]
  // ----------------------------
  let level = null;
  let currentLevel = 1;

  const TILE = 32;
  let tileSize = TILE;

  function normalizeLevel(raw) {
    const meta = raw.meta || {};

    // Support all level schemas used so far:
    // - { w, h, tileSize, tiles:[flat numbers] }
    // - { width, height, tileSize, tiles:[[numbers]] }
    // - object-based levels with solids/coins/hazards/enemies/platforms
    tileSize =
      Number(raw.tileSize) > 0
        ? Number(raw.tileSize)
        : Number(meta.tileSize) > 0
          ? Number(meta.tileSize)
          : TILE;

    const width = Number(raw.width || raw.w || meta.width || meta.w || 0);
    const height = Number(raw.height || raw.h || meta.height || meta.h || 0);

    const out = {
      meta,
      width,
      height,
      spawn: raw.spawn || { x: 2, y: 2 },
      solids: Array.isArray(raw.solids) ? [...raw.solids] : [],
      coins: Array.isArray(raw.coins) ? [...raw.coins] : [],
      spikes: Array.isArray(raw.spikes) ? [...raw.spikes] : [],
      enemies: Array.isArray(raw.enemies) ? [...raw.enemies] : [],
      platforms: Array.isArray(raw.platforms) ? [...raw.platforms] : [],
      powerups: Array.isArray(raw.powerups) ? [...raw.powerups] : [],
      exit: raw.exit || null,
      tiles: null,
    };

    // Your current JSON files use "hazards"; the engine expects "spikes".
    if (Array.isArray(raw.hazards)) {
      out.spikes.push(...raw.hazards);
    }

    // Treat platforms as solids for now, so Level 3 works immediately.
    // We can upgrade these to true moving platforms next.
    if (out.platforms.length) {
      for (const p of out.platforms) {
        out.solids.push({
          x: Number(p.x) || 0,
          y: Number(p.y) || 0,
          w: Number(p.w || p.width || 3) || 3,
          h: Number(p.h || p.height || 1) || 1,
          platform: true,
        });
      }
    }

    // Normalize tile arrays.
    if (Array.isArray(raw.tiles)) {
      let grid = [];

      if (Array.isArray(raw.tiles[0])) {
        // 2D array
        grid = raw.tiles.map((row) => Array.isArray(row) ? row.map((v) => Number(v) || 0) : []);
        out.height = out.height || grid.length;
        out.width = out.width || (grid[0]?.length || 0);
      } else {
        // Flat array
        const W = out.width || Number(raw.w) || 60;
        const H = out.height || Math.ceil(raw.tiles.length / Math.max(1, W));
        const total = W * H;
        const flat = raw.tiles.map((v) => Number(v) || 0).slice(0, total);

        while (flat.length < total) flat.push(0);

        grid = [];
        for (let y = 0; y < H; y++) {
          grid.push(flat.slice(y * W, (y + 1) * W));
        }

        out.width = W;
        out.height = H;
      }

      out.tiles = grid;

      for (let y = 0; y < grid.length; y++) {
        const row = grid[y] || [];
        for (let x = 0; x < row.length; x++) {
          const t = Number(row[x]) || 0;
          if (t === 1) out.solids.push({ x, y, w: 1, h: 1, tile: 1 });
          else if (t === 2) out.coins.push({ x, y });
          else if (t === 3) out.spikes.push({ x, y, w: 1, h: 1 });
          else if (t === 4) out.exit = { x, y, w: 1, h: 2 };
        }
      }
    }

    // Safety fallback: never let a level boot with no ground.
    if (!out.solids.length) {
      out.width = out.width || 60;
      out.height = out.height || 18;
      const y = Math.max(1, out.height - 1);
      for (let x = 0; x < out.width; x++) out.solids.push({ x, y, w: 1, h: 1, tile: 1 });
    }

    // Keep spawn inside the world.
    out.spawn.x = clamp(Number(out.spawn.x) || 2, 1, Math.max(1, (out.width || 60) - 2));
    out.spawn.y = clamp(Number(out.spawn.y) || 2, 1, Math.max(1, (out.height || 18) - 2));

    return out;
  }

  // ----------------------------
  // Enemy system
  // ----------------------------
  /** @type {Array<{id:string,type:string,x:number,y:number,w:number,h:number,vx:number,dir:number,minX:number,maxX:number,speed:number,alive:boolean}>} */
  let enemies = [];

  function buildEnemiesFromLevel() {
    enemies = [];
    if (!level?.enemies?.length) return;

    let idx = 0;
    for (const e of level.enemies) {
      const type = (e.type || "patrol").toLowerCase();
      const ex = (e.x ?? 0) * tileSize;
      const ey = (e.y ?? 0) * tileSize;

      const w = Math.max(18, Math.floor(tileSize * 0.85));
      const h = Math.max(22, Math.floor(tileSize * 0.95));
      const speed = Number(e.speed) > 0 ? Number(e.speed) : 90;

      // patrol bounds in pixels (tile coords in JSON)
      const minX = (Number.isFinite(e.minX) ? e.minX : e.x - 4) * tileSize;
      const maxX = (Number.isFinite(e.maxX) ? e.maxX : e.x + 4) * tileSize;

      enemies.push({
        id: `E${currentLevel}-${idx++}`,
        type,
        x: ex + tileSize * 0.1,
        y: ey + tileSize * 0.05,
        w,
        h,
        vx: speed,
        dir: 1,
        minX: Math.min(minX, maxX),
        maxX: Math.max(minX, maxX),
        speed,
        alive: true,
      });
    }
  }

  function updateEnemies(dt) {
    if (!enemies.length) return;

    for (const en of enemies) {
      if (!en.alive) continue;

      if (en.type === "patrol") {
        en.vx = en.dir * en.speed;
        en.x += en.vx * dt;

        // bounce at bounds
        if (en.x < en.minX) {
          en.x = en.minX;
          en.dir = 1;
        } else if (en.x + en.w > en.maxX + tileSize) {
          en.x = en.maxX + tileSize - en.w;
          en.dir = -1;
        }

        // gravity so enemies stick to platforms/ground
        // (simple: treat like player but only vertical resolution)
        en.y += 1800 * dt;

        const er = { x: en.x, y: en.y, w: en.w, h: en.h };
        let grounded = false;

        iterSolidRects((s) => {
          if (rectsOverlap(er, s)) {
            // only resolve downward collisions (enemy "falls" onto solids)
            if (er.y + er.h > s.y && er.y < s.y && er.x + er.w > s.x && er.x < s.x + s.w) {
              en.y = s.y - en.h;
              grounded = true;
              er.y = en.y;
            }
          }
        });

        if (!grounded) {
          // allow falling; if far below world, kill enemy quietly
          const worldH = (level.height || 25) * tileSize;
          if (en.y > worldH + 800) en.alive = false;
        }
      }
    }
  }

  function drawEnemies(camX, camY) {
    if (!enemies.length) return;

    for (const en of enemies) {
      if (!en.alive) continue;

      const p = worldToScreen(en.x, en.y, camX, camY);
      if (p.x + en.w < -60 || p.x > viewW + 60 || p.y + en.h < -60 || p.y > viewH + 60) continue;

      if (imgEnemy) {
        ctx.save();
        if (en.dir < 0) {
          ctx.translate(p.x + en.w, p.y);
          ctx.scale(-1, 1);
          ctx.drawImage(imgEnemy, 0, 0, en.w, en.h);
        } else {
          ctx.drawImage(imgEnemy, p.x, p.y, en.w, en.h);
        }
        ctx.restore();
      } else {
        // fallback: neon enemy capsule
        ctx.fillStyle = "rgba(255,80,120,0.18)";
        ctx.strokeStyle = "rgba(255,80,120,0.75)";
        ctx.lineWidth = 2;
        ctx.fillRect(p.x, p.y, en.w, en.h);
        ctx.strokeRect(p.x + 0.5, p.y + 0.5, en.w - 1, en.h - 1);
      }
    }
  }

  function enemyRects() {
    return enemies
      .filter((e) => e.alive)
      .map((e) => ({ ref: e, x: e.x, y: e.y, w: e.w, h: e.h }));
  }

  function stompEnemy(en) {
    en.alive = false;
    score += 150;
    beep(240, 0.05, "square", 0.05);
    beep(180, 0.06, "square", 0.04);
  }

  // ----------------------------
  // Load level
  // ----------------------------
  let bgImg = null;

  async function loadLevel(n) {
    const raw = await loadJson(levelUrl(n));
    level = normalizeLevel(raw);

    if (elLevelNum) elLevelNum.textContent = String(n);
    if (elLevelLabel) elLevelLabel.textContent = String(n);

    bgImg = await loadImageSafe(ASSETS.bgForLevel(n));

    // Build enemies from JSON for this level
    buildEnemiesFromLevel();
  }

  // ----------------------------
  // Game state
  // ----------------------------
  let running = false;
  let paused = false;

  let score = 0;
  let best = 0;
  let coinCount = 0;
  let elapsed = 0;

  // Distance score support
  let distanceScoreAcc = 0;
  let lastPlayerX = 0;

  // physics tuning
  const GRAVITY = 2400;
  const MOVE_ACC = 4200;
  const MAX_SPEED = 520;
  const FRICTION = 4200;

  const JUMP_V0 = 900;           // slightly higher jump
  const JUMP_HOLD_MAX = 0.18;
  const JUMP_HOLD_BOOST = 1600;

  // player
  const player = {
    x: 80,
    y: 80,
    w: 28,
    h: 40,
    vx: 0,
    vy: 0,
    face: 1,
    onGround: false,
    jumpHeld: false,
    jumpHoldT: 0,
  };

  function resetPlayer() {
    const s = level?.spawn || { x: 2, y: 2 };
    player.x = s.x * tileSize + tileSize * 0.2;
    player.y = s.y * tileSize + tileSize * 0.2;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.jumpHeld = false;
    player.jumpHoldT = 0;

    // If spawn is in the air, snap down to the nearest platform under it
    snapPlayerToGroundAtSpawn();
  }

  function snapPlayerToGroundAtSpawn() {
    if (!level) return;

    // Drop a thin probe downward from player's current x-range to find first solid below
    const probeX = player.x + player.w * 0.5;
    const startY = player.y;
    const worldH = (level.height || 25) * tileSize;

    let bestY = null;

    iterSolidRects((s) => {
      // Only solids below startY and horizontally overlapping player
      const horizOverlap =
        probeX >= s.x - 2 && probeX <= s.x + s.w + 2; // tolerant overlap
      if (!horizOverlap) return;

      if (s.y >= startY && s.y < worldH) {
        // candidate ground top
        if (bestY === null || s.y < bestY) bestY = s.y;
      }
    });

    if (bestY !== null) {
      player.y = bestY - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  // ----------------------------
  // Input (keyboard + touch)
  // ----------------------------
  const input = { left: false, right: false, jump: false, action: false };

  function setKey(e, down) {
    const k = e.key.toLowerCase();
    if (k === "arrowleft" || k === "a") input.left = down;
    if (k === "arrowright" || k === "d") input.right = down;
    if (k === "arrowup" || k === "w" || k === " ") input.jump = down;
    if (k === "e" || k === "enter") input.action = down;
  }
  window.addEventListener("keydown", (e) => setKey(e, true));
  window.addEventListener("keyup", (e) => setKey(e, false));

  function bindPad(el, name) {
    if (!el) return;
    el.style.userSelect = "none";
    el.style.webkitUserSelect = "none";
    el.style.touchAction = "none";

    const onDown = (e) => {
      e.preventDefault();
      input[name] = true;
      ensureAudio();
    };
    const onUp = (e) => {
      e.preventDefault();
      input[name] = false;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onUp);
  }

  bindPad(btnLeft, "left");
  bindPad(btnRight, "right");
  bindPad(btnJump, "jump");
  bindPad(btnAction, "action");

  // ----------------------------
  // Collision helpers
  // ----------------------------
  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function iterSolidRects(cb) {
    if (!level) return;
    for (const s of level.solids) {
      const rx = s.x * tileSize;
      const ry = s.y * tileSize;
      const rw = (s.w || 1) * tileSize;
      const rh = (s.h || 1) * tileSize;
      cb({ x: rx, y: ry, w: rw, h: rh });
    }
  }

  function iterSpikeRects(cb) {
    if (!level) return;
    for (const sp of level.spikes) {
      const rx = sp.x * tileSize;
      const ry = sp.y * tileSize;
      const rw = (sp.w || 1) * tileSize;
      const rh = (sp.h || 1) * tileSize;
      cb({ x: rx, y: ry, w: rw, h: rh });
    }
  }

  function exitRect() {
    if (!level?.exit) return null;
    const e = level.exit;
    return {
      x: e.x * tileSize,
      y: e.y * tileSize,
      w: (e.w || 1) * tileSize,
      h: (e.h || 2) * tileSize,
    };
  }

  // ----------------------------
  // HUD + persistence for best
  // ----------------------------
  const BEST_KEY = "gg_kasiquest_best_v1";
  function loadBest() {
    const v = Number(localStorage.getItem(BEST_KEY));
    return Number.isFinite(v) ? v : 0;
  }
  function saveBest(v) {
    localStorage.setItem(BEST_KEY, String(v | 0));
  }

  function setHUD() {
    if (elScore) elScore.textContent = String(Math.floor(score));
    if (elBest) elBest.textContent = String(best | 0);
    if (elCoins) elCoins.textContent = String(coinCount | 0);
    if (elTime) elTime.textContent = elapsed.toFixed(1);
  }

  // ----------------------------
  // Assets (optional)
  // ----------------------------
  let imgPlayerIdle = null;
  let imgPlayerRun = null;
  let imgEnemy = null;
  let imgCoin = null;

  async function loadAssetsOptional() {
    imgPlayerIdle = await loadImageSafe(ASSETS.playerIdle);
    imgPlayerRun = await loadImageSafe(ASSETS.playerRun);
    imgEnemy = await loadImageSafe(ASSETS.enemy);
    imgCoin = await loadImageSafe(ASSETS.coin);
  }

  // ----------------------------
  // Gameplay update
  // ----------------------------
  function killPlayer() {
    beep(120, 0.09, "sawtooth", 0.05);
    score = Math.max(0, score - 25);
    resetPlayer();
  }

  function collectCoin(i) {
    beep(840, 0.045, "triangle", 0.04);
    coinCount += 1;
    score += 50;
    level.coins.splice(i, 1);
  }

  function completeLevel() {
    beep(660, 0.07, "triangle", 0.05);
    beep(880, 0.07, "triangle", 0.05);

    score += Math.max(0, Math.floor(600 - elapsed * 15));

    if (score > best) {
      best = Math.floor(score);
      saveBest(best);
      emitSidebar("best_update", { best });
    }

    // Submit the completed level score before moving/resetting.
    void submitFinalScore(score, "final");

    if (currentLevel < MAX_LEVELS) {
      currentLevel += 1;
      loadLevel(currentLevel)
        .then(() => {
          resetPlayer();
          elapsed = 0;
          coinCount = 0;
          score = 0;
          distanceScoreAcc = 0;
          lastPlayerX = player.x;
          setHUD();
          emitSidebar("level_change", { level: currentLevel });
        })
        .catch(() => {
          paused = true;
          panel.style.display = "flex";
        });
    } else {
      paused = true;
      panel.style.display = "flex";
    }
  }

  function applyAutoRun(dt) {
    if (!AUTO_RUN) return;

    // If user is holding left/right, don't force auto-run
    if (input.left || input.right) return;

    // Accelerate vx toward AUTO_RUN_SPEED
    const target = AUTO_RUN_SPEED;
    const diff = target - player.vx;
    const step = Math.sign(diff) * Math.min(Math.abs(diff), AUTO_RUN_ACCEL * dt);
    player.vx += step;

    // Face right by default in runner
    player.face = 1;
  }

  function updatePlayer(dt) {
    if (!level) return;

    // runner baseline
    applyAutoRun(dt);

    // manual horizontal move (overrides runner)
    const target = (input.right ? 1 : 0) - (input.left ? 1 : 0);

    if (target !== 0) {
      player.vx += target * MOVE_ACC * dt;
      player.face = target;
    } else if (!AUTO_RUN) {
      // friction only when not auto-run mode
      const sign = Math.sign(player.vx);
      const mag = Math.abs(player.vx);
      const dec = FRICTION * dt;
      player.vx = sign * Math.max(0, mag - dec);
    }

    player.vx = clamp(player.vx, -MAX_SPEED, MAX_SPEED);

    // jump start
    if (input.jump && player.onGround) {
      player.vy = -JUMP_V0;
      player.onGround = false;
      player.jumpHeld = true;
      player.jumpHoldT = 0;
      beep(520, 0.05, "triangle", 0.04);
    }

    // jump hold boost
    if (player.jumpHeld) {
      if (input.jump && player.jumpHoldT < JUMP_HOLD_MAX) {
        player.vy -= JUMP_HOLD_BOOST * dt;
        player.jumpHoldT += dt;
      } else {
        player.jumpHeld = false;
      }
    }

    // gravity
    player.vy += GRAVITY * dt;
    player.vy = clamp(player.vy, -1800, 2200);

    // integrate X
    player.x += player.vx * dt;

    // collide X
    const px = { x: player.x, y: player.y, w: player.w, h: player.h };
    iterSolidRects((s) => {
      if (rectsOverlap(px, s)) {
        if (player.vx > 0) player.x = s.x - player.w;
        else if (player.vx < 0) player.x = s.x + s.w;
        player.vx = AUTO_RUN ? Math.max(0, player.vx * 0.25) : 0;
        px.x = player.x;
      }
    });

    // integrate Y
    player.y += player.vy * dt;
    player.onGround = false;

    const py = { x: player.x, y: player.y, w: player.w, h: player.h };
    iterSolidRects((s) => {
      if (rectsOverlap(py, s)) {
        if (player.vy > 0) {
          player.y = s.y - player.h;
          player.vy = 0;
          player.onGround = true;
          player.jumpHeld = false;
        } else if (player.vy < 0) {
          player.y = s.y + s.h;
          player.vy = 0;
          player.jumpHeld = false;
        }
        py.y = player.y;
      }
    });

    // bounds (avoid disappearing)
    const worldW = (level.width || 60) * tileSize;
    const worldH = (level.height || 25) * tileSize;

    if (player.y > worldH + 600) {
      killPlayer();
    }

    // Runner: keep within world; if you hit far right, clamp
    player.x = clamp(player.x, -200, worldW + 200);

    // coins
    for (let i = level.coins.length - 1; i >= 0; i--) {
      const c = level.coins[i];
      const cx = c.x * tileSize + tileSize * 0.2;
      const cy = c.y * tileSize + tileSize * 0.2;
      const cr = { x: cx, y: cy, w: tileSize * 0.6, h: tileSize * 0.6 };
      if (rectsOverlap(py, cr)) collectCoin(i);
    }

    // spikes
    let hitSpike = false;
    iterSpikeRects((sp) => {
      if (!hitSpike && rectsOverlap(py, sp)) hitSpike = true;
    });
    if (hitSpike) killPlayer();

    // exit
    const ex = exitRect();
    if (ex && rectsOverlap(py, ex)) completeLevel();
  }

  function handleEnemyCollisions() {
    if (!enemies.length) return;

    const pr = { x: player.x, y: player.y, w: player.w, h: player.h };
    const prevVy = player.vy;

    for (const er of enemyRects()) {
      if (!rectsOverlap(pr, er)) continue;

      // stomp rule: player falling, and player's bottom is above enemy midline
      const playerBottom = player.y + player.h;
      const enemyMid = er.y + er.h * 0.55;

      if (prevVy > 120 && playerBottom <= enemyMid) {
        stompEnemy(er.ref);
        // bounce up a bit
        player.vy = -Math.max(420, JUMP_V0 * 0.55);
        player.onGround = false;
      } else {
        // side hit
        killPlayer();
      }
      break;
    }
  }

  function updateGameplay(dt) {
    elapsed += dt;

    updatePlayer(dt);
    updateEnemies(dt);

    // Enemy collisions after movement
    handleEnemyCollisions();

    // Distance score (only when moving right)
    const dx = Math.max(0, player.x - lastPlayerX);
    lastPlayerX = player.x;

    distanceScoreAcc += dx;
    if (distanceScoreAcc >= tileSize) {
      const steps = Math.floor(distanceScoreAcc / tileSize);
      score += steps * 5;
      distanceScoreAcc -= steps * tileSize;
    }

    if (score > best) {
      best = Math.floor(score);
      saveBest(best);
      emitSidebar("best_update", { best });
    }

    setHUD();

    emitSidebar("score_live", {
      level: currentLevel,
      score: Math.floor(score),
      best,
      coins: coinCount,
      time: elapsed,
    });
  }

  // ----------------------------
  // Render
  // ----------------------------
  function drawBackground(camX = 0, camY = 0) {
    ctx.clearRect(0, 0, viewW, viewH);

    const par = 0.35;

    if (bgImg) {
      const iw = bgImg.width;
      const ih = bgImg.height;

      const s = Math.max(viewW / iw, viewH / ih);
      const dw = iw * s;
      const dh = ih * s;

      const px = -(camX * par) % dw;
      const py = -(camY * par) % dh;

      for (let y = py - dh; y < viewH + dh; y += dh) {
        for (let x = px - dw; x < viewW + dw; x += dw) {
          ctx.drawImage(bgImg, x, y, dw, dh);
        }
      }
      return;
    }

    const g = ctx.createLinearGradient(0, 0, 0, viewH);
    g.addColorStop(0, "#070a12");
    g.addColorStop(1, "#0b1022");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, viewW, viewH);
  }

  function worldToScreen(x, y, camX, camY) {
    return { x: x - camX, y: y - camY };
  }

  function computeCamera() {
    if (!level) return { camX: 0, camY: 0 };
    const worldW = (level.width || 60) * tileSize;
    const worldH = (level.height || 25) * tileSize;

    let camX = player.x + player.w * 0.5 - viewW * 0.5;
    let camY = player.y + player.h * 0.5 - viewH * 0.55;

    camX = clamp(camX, 0, Math.max(0, worldW - viewW));
    camY = clamp(camY, 0, Math.max(0, worldH - viewH));

    return { camX, camY };
  }

  function drawWorld(camX, camY) {
    if (!level) return;

    // solids
    ctx.fillStyle = "rgba(10, 16, 28, 0.78)";
    ctx.strokeStyle = "rgba(124, 92, 255, 0.65)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(124, 92, 255, 0.35)";
    ctx.shadowBlur = 8;

    iterSolidRects((s) => {
      const p = worldToScreen(s.x, s.y, camX, camY);
      if (p.x + s.w < -50 || p.x > viewW + 50 || p.y + s.h < -50 || p.y > viewH + 50) return;
      ctx.fillRect(p.x, p.y, s.w, s.h);
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, s.w - 1, s.h - 1);
    });

    ctx.shadowBlur = 0;

    // spikes
    ctx.fillStyle = "rgba(255,80,80,0.55)";
    iterSpikeRects((sp) => {
      const p = worldToScreen(sp.x, sp.y, camX, camY);
      if (p.x + sp.w < -50 || p.x > viewW + 50 || p.y + sp.h < -50 || p.y > viewH + 50) return;
      ctx.fillRect(p.x, p.y + sp.h * 0.35, sp.w, sp.h * 0.65);
      ctx.fillStyle = "rgba(255,120,120,0.85)";
      const n = Math.max(1, Math.floor(sp.w / 16));
      for (let i = 0; i < n; i++) {
        const tx = p.x + i * (sp.w / n);
        ctx.beginPath();
        ctx.moveTo(tx, p.y + sp.h);
        ctx.lineTo(tx + (sp.w / n) * 0.5, p.y + sp.h * 0.35);
        ctx.lineTo(tx + sp.w / n, p.y + sp.h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255,80,80,0.55)";
    });

    // coins
    for (const c of level.coins) {
      const x = c.x * tileSize + tileSize * 0.5;
      const y = c.y * tileSize + tileSize * 0.5;
      const p = worldToScreen(x, y, camX, camY);
      if (p.x < -50 || p.x > viewW + 50 || p.y < -50 || p.y > viewH + 50) continue;

      if (imgCoin) {
        const s = tileSize * 0.9;
        ctx.drawImage(imgCoin, p.x - s / 2, p.y - s / 2, s, s);
      } else {
        ctx.fillStyle = "rgba(255,176,32,0.9)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, tileSize * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.stroke();
      }
    }

    // exit
    const ex = exitRect();
    if (ex) {
      const p = worldToScreen(ex.x, ex.y, camX, camY);
      ctx.fillStyle = "rgba(35,194,255,0.14)";
      ctx.strokeStyle = "rgba(35,194,255,0.55)";
      ctx.lineWidth = 3;
      ctx.fillRect(p.x, p.y, ex.w, ex.h);
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, ex.w - 1, ex.h - 1);
    }
  }

  function drawPlayer(camX, camY) {
    const p = worldToScreen(player.x, player.y, camX, camY);

    const useRun = (Math.abs(player.vx) > 40 || AUTO_RUN) && imgPlayerRun;
    const img = useRun ? imgPlayerRun : imgPlayerIdle;

    if (img) {
      ctx.save();
      if (player.face < 0) {
        ctx.translate(p.x + player.w, p.y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, player.w, player.h);
      } else {
        ctx.drawImage(img, p.x, p.y, player.w, player.h);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = "rgba(234,240,255,0.14)";
      ctx.strokeStyle = "rgba(73,214,255,0.55)";
      ctx.lineWidth = 2;
      ctx.fillRect(p.x, p.y, player.w, player.h);
      ctx.strokeRect(p.x + 0.5, p.y + 0.5, player.w - 1, player.h - 1);
      ctx.fillStyle = "rgba(234,240,255,0.9)";
      const ex = player.face > 0 ? p.x + player.w * 0.65 : p.x + player.w * 0.25;
      ctx.fillRect(ex, p.y + player.h * 0.25, player.w * 0.10, player.h * 0.08);
    }
  }

  function render() {
    // IMPORTANT: don't resize every frame — handled by resize listener
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    if (!level) {
      drawBackground(0, 0);
      return;
    }

    const { camX, camY } = computeCamera();
    drawBackground(camX, camY);
    drawWorld(camX, camY);
    drawEnemies(camX, camY);
    drawPlayer(camX, camY);
  }

  // ----------------------------
  // Loop
  // ----------------------------
  let tPrev = performance.now();
  function loop() {
    const t = performance.now();
    let dt = (t - tPrev) / 1000;
    tPrev = t;
    dt = clamp(dt, 0, 0.033);

    if (running && !paused) updateGameplay(dt);
    render();

    requestAnimationFrame(loop);
  }

  // ----------------------------
  // UI controls
  // ----------------------------
  function setPaused(v) {
    paused = v;
    btnPause.textContent = paused ? "Resume" : "Pause";
    emitSidebar("paused", { paused });
  }

  async function startOrRestart() {
    try {
      if (!level) await loadLevel(currentLevel);
      resetPlayer();

      running = true;
      paused = false;
      setPaused(false);

      score = 0;
      coinCount = 0;
      elapsed = 0;
      distanceScoreAcc = 0;
      lastPlayerX = player.x;

      panel.style.display = "none";

      ensureAudio();
      beep(520, 0.06, "triangle", 0.05);

      setHUD();
      emitSidebar("ready", { level: currentLevel, best });
    } catch (err) {
      console.warn(err);
      panel.style.display = "flex";
      alert(
        `Could not load Level ${currentLevel}.\nExpected: ${levelUrl(currentLevel).replace("./", "")}`
      );
    }
  }

  btnStart.addEventListener("click", async () => {
    await startOrRestart();
  });

  btnPause.addEventListener("click", () => {
    if (!running) return;
    setPaused(!paused);
  });

  btnMute.addEventListener("click", () => {
    muted = !muted;
    btnMute.textContent = muted ? "Unmute" : "Mute";
    if (!muted) ensureAudio();
  });

  // ----------------------------
  // Level grid
  // ----------------------------
  async function buildLevelGrid() {
    elLevelGrid.innerHTML = "";
    for (let i = 1; i <= MAX_LEVELS; i++) {
      const b = document.createElement("button");
      b.className = "lvlBtn" + (i === currentLevel ? " active" : "");
      b.textContent = String(i);
      b.addEventListener("click", async () => {
        currentLevel = i;
        [...elLevelGrid.children].forEach((x) => x.classList.remove("active"));
        b.classList.add("active");

        try {
          await loadLevel(currentLevel);
          resetPlayer();
          panel.style.display = "flex";
          if (elLevelNum) elLevelNum.textContent = String(currentLevel);
          if (elLevelLabel) elLevelLabel.textContent = String(currentLevel);
          emitSidebar("level_change", { level: currentLevel });
        } catch (e) {
          console.warn(e);
          alert(`Level ${currentLevel} JSON not found at ${levelUrl(currentLevel)}`);
        }
      });
      elLevelGrid.appendChild(b);
    }
  }

  // ----------------------------
  // Boot
  // ----------------------------
  async function boot() {
    best = loadBest();
    setHUD();

    await buildLevelGrid();

    loadAssetsOptional().catch(() => {});

    try {
      await loadLevel(currentLevel);
      resetPlayer();
    } catch (e) {
      console.warn(`[${GAME_SLUG}] Level load failed`, e);
    }

    panel.style.display = "flex";

    tPrev = performance.now();
    requestAnimationFrame(loop);

    emitSidebar("boot", { best });
  }

  boot().catch((e) => {
    console.error(`[${GAME_SLUG}] Boot failed`, e);
    alert("Kasi Quest failed to boot. Check console for details.");
  });
})();
