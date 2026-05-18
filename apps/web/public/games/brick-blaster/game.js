(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });

  // HUD
  const elScore = document.getElementById("score");
  const elLives = document.getElementById("lives");
  const elLevel = document.getElementById("level");
  const elTitle = document.getElementById("ggTitle");
  const elSub = document.getElementById("ggSub");

  // Panel
  const panel = document.getElementById("panel");
  const panelTitle = document.getElementById("panelTitle");
  const panelText = document.getElementById("panelText");
  const btnStart = document.getElementById("btnStart");
  const btnOverlay = document.getElementById("btnOverlay");

  // Bottom actions
  const btnPause = document.getElementById("btnPause");
  const btnLaunch = document.getElementById("btnLaunch");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnRestart = document.getElementById("btnRestart");
  const btnChat = document.getElementById("btnChat");

  const GAME_SLUG = "brick-blaster";

  // ======================================================
// GloryGames Platform Bridge (Pause / Mute / Restart)
// Paste near the top of game.js (after canvas init)
// ======================================================

let GG_PAUSED = false;
let GG_MUTED = false;

// optional: if your game uses dt, we reset the timer when pausing/resuming
let GG_LAST_TICK_TS = performance.now();

// optional audio registry (only matters if your game uses Audio)
const GG_AUDIO = new Set();
function ggRegisterAudio(a) {
  if (!a) return a;
  GG_AUDIO.add(a);
  // apply current mute state immediately
  try {
    a.muted = GG_MUTED;
    if (GG_MUTED) a.volume = 0;
  } catch {}
  return a;
}
function ggApplyMute() {
  for (const a of GG_AUDIO) {
    try {
      a.muted = GG_MUTED;
      a.volume = GG_MUTED ? 0 : 1;
    } catch {}
  }
}

// ======================================================
// SFX (WebAudio tones - no external files)
// ======================================================
let GG_SFX_CTX = null;
let GG_SFX_MASTER = null;

function ggEnsureAudio() {
  if (GG_MUTED) return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;

  if (!GG_SFX_CTX) {
    GG_SFX_CTX = new AC();
    GG_SFX_MASTER = GG_SFX_CTX.createGain();
    GG_SFX_MASTER.gain.value = 0.12; // master volume
    GG_SFX_MASTER.connect(GG_SFX_CTX.destination);
  }

  if (GG_SFX_CTX.state === "suspended") {
    GG_SFX_CTX.resume().catch(() => {});
  }
  return GG_SFX_CTX;
}

function ggSetMuted(muted) {
  if (GG_SFX_MASTER) GG_SFX_MASTER.gain.value = muted ? 0 : 0.12;
}

function ggTone({ f = 440, d = 0.06, t = 0, type = "sine", v = 1 } = {}) {
  const ctx = ggEnsureAudio();
  if (!ctx || GG_MUTED || GG_PAUSED) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = f;

  const start = ctx.currentTime + t;
  const end = start + d;

  // envelope (avoid 0 for exponential ramps)
  const peak = 0.12 * v;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain);
  gain.connect(GG_SFX_MASTER || ctx.destination);

  osc.start(start);
  osc.stop(end + 0.02);
}

function ggSfx(name) {
  // Keep these short/snappy
  if (name === "launch") {
    ggTone({ f: 260, d: 0.035, type: "triangle", v: 0.7 });
    ggTone({ f: 520, d: 0.040, t: 0.03, type: "square", v: 0.8 });
    ggTone({ f: 780, d: 0.045, t: 0.07, type: "square", v: 0.7 });
    return;
  }
  if (name === "paddle") return ggTone({ f: 220, d: 0.028, type: "square", v: 0.65 });
  if (name === "brickHit") return ggTone({ f: 520, d: 0.030, type: "square", v: 0.55 });
  if (name === "brickBreak") {
    ggTone({ f: 680, d: 0.030, type: "square", v: 0.7 });
    ggTone({ f: 920, d: 0.035, t: 0.03, type: "triangle", v: 0.65 });
    return;
  }
  if (name === "power") {
    ggTone({ f: 740, d: 0.035, type: "triangle", v: 0.6 });
    ggTone({ f: 980, d: 0.040, t: 0.03, type: "sine", v: 0.65 });
    return;
  }
  if (name === "lifeLost") {
    ggTone({ f: 180, d: 0.08, type: "sawtooth", v: 0.55 });
    ggTone({ f: 120, d: 0.12, t: 0.07, type: "sine", v: 0.55 });
    return;
  }
  if (name === "levelUp") {
    ggTone({ f: 440, d: 0.05, type: "triangle", v: 0.55 });
    ggTone({ f: 660, d: 0.05, t: 0.05, type: "triangle", v: 0.55 });
    ggTone({ f: 880, d: 0.06, t: 0.10, type: "triangle", v: 0.6 });
    return;
  }
  if (name === "gameOver") {
    ggTone({ f: 220, d: 0.09, type: "sawtooth", v: 0.55 });
    ggTone({ f: 160, d: 0.12, t: 0.08, type: "sine", v: 0.55 });
    ggTone({ f: 110, d: 0.16, t: 0.18, type: "sine", v: 0.5 });
    return;
  }
}


// Use this if you want a toast from inside the game
function ggToast(text) {
  try {
    window.parent?.postMessage({ type: "GG_TOAST", text }, window.location.origin);
  } catch {}
}

// Restart strategy:
// 1) If you have a resetGame() function, it will call it.
// 2) Otherwise it reloads the iframe page.
function ggRestart() {
  if (typeof window.resetGame === "function") {
    window.resetGame();
    ggToast("Restarted");
    return;
  }
  location.reload();
}

// Handle messages from the platform
window.addEventListener("message", (ev) => {
  // only accept messages from same origin (your Next.js site)
  if (ev.origin !== window.location.origin) return;
  const data = ev.data;
  if (!data || typeof data !== "object") return;

  const { type, payload } = data;

  if (type === "GG_PAUSE") {
    GG_PAUSED = !!payload?.paused;
    // reset timing so dt doesn't jump when resuming
    GG_LAST_TICK_TS = performance.now();
  }

 if (type === "GG_MUTE") {
  GG_MUTED = !!payload?.muted;
  ggApplyMute();
  ggSetMuted(GG_MUTED); 
}




  if (type === "GG_RESTART") {
    ggRestart();
  }

  if (type === "GG_CONTEXT") {
    // if you ever want to show logged in name in-game later:
    // payload.user?.displayName
    window.GG_USER = payload?.user ?? null;
  }
});

// Auto-pause when tab/app is backgrounded (mobile friendly)
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    GG_PAUSED = true;
  } else {
    GG_PAUSED = false;
    GG_LAST_TICK_TS = performance.now();
  }
});



  // ---- Meta (game.json) ----
  let META = { title: "Brick Blaster", description: "" };

  async function loadMeta() {
    try {
      const res = await fetch("./game.json", { cache: "no-store" });
      const meta = await res.json();
      META = meta || META;

      const title = META.title || "Brick Blaster";
      document.title = title;

      // Tell the platform which game is running (used for Daily Challenge auto-submit)
window.GG?.setSlug?.(GAME_SLUG);
// Optional (if your GG SDK supports it)
window.GG?.setTitle?.(title);


      if (elTitle) elTitle.textContent = title;
      if (panelTitle) panelTitle.textContent = title;

      if (META.description && panelText) panelText.textContent = META.description;

      if (elSub) elSub.textContent = "Drag paddle • Tap/Launch ball • Break bricks • Grab power-ups";

      window.GG?.init?.({ title });
    } catch {
      // ignore
    }
  }
  loadMeta();

  // ---- Canvas resize (draw in CSS pixels) ----
  let DPR = 1;
  function resize() {
    const cssW = Math.max(1, canvas.clientWidth || window.innerWidth);
    const cssH = Math.max(1, canvas.clientHeight || window.innerHeight);
    DPR = Math.min(2, window.devicePixelRatio || 1);

    canvas.width = Math.floor(cssW * DPR);
    canvas.height = Math.floor(cssH * DPR);

    // Draw coordinates in CSS pixels
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  requestAnimationFrame(() => {
    resize();
    window.addEventListener("resize", resize, { passive: true });
  });

  // ---- Game state ----
  const keys = new Set();

  let running = false;
  let paused = false;
  let gameOver = false;

  let score = 0;
  let lives = 3;
  let level = 1;

  // Paddle & ball in CSS pixels
  const paddle = {
    x: 0,
    y: 0,
    w: 110,
    h: 14,
    baseW: 110,
    widenUntil: 0
  };

  const ball = {
    x: 0,
    y: 0,
    r: 7.5,
    vx: 0,
    vy: 0,
    speed: 420,
    stuck: true // stuck to paddle until launch
  };

  let bricks = [];
  let drops = []; // falling power-ups
  let toasts = []; // small messages

  // Pointer (mobile-first)
  const pointer = {
    id: null,
    down: false,
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    tDown: 0,
    dragging: false
  };

  function cw() { return canvas.clientWidth || 360; }
  function ch() { return canvas.clientHeight || 640; }

  function updateHud() {
    if (elScore) elScore.textContent = String(score | 0);
    if (elLives) elLives.textContent = String(lives | 0);
    if (elLevel) elLevel.textContent = String(level | 0);
  }

  function showPanel(title, text) {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (panel) panel.style.display = "flex";
  }

  function hidePanel() {
    if (panel) panel.style.display = "none";
  }

  function toast(msg) {
    toasts.push({ msg, t: 1.4 });
  }

  function resetBallStuck() {
    ball.stuck = true;
    ball.vx = 0;
    ball.vy = 0;
    ball.x = paddle.x;
    ball.y = paddle.y - paddle.h * 0.5 - ball.r - 2;
  }

  function resetGame() {
    score = 0;
    lives = 3;
    level = 1;

    running = false;
    paused = false;
    gameOver = false;

    // Place paddle
    paddle.w = paddle.baseW;
    paddle.x = cw() * 0.5;
    paddle.y = ch() - 54;
    paddle.widenUntil = 0;

    // Place ball
    resetBallStuck();

    bricks = [];
    drops = [];
    toasts = [];

    buildLevel(level);

    updateHud();
    showPanel(META.title || "Brick Blaster", META.description || "Drag to move the paddle. Tap to launch. Break bricks and grab power-ups.");
  }

  function startGame() {
    running = true;
    paused = false;
    gameOver = false;
    hidePanel();
  }

  function togglePause() {
    if (!running || gameOver) return;
    paused = !paused;
    if (paused) showPanel("Paused", "Tap Start to resume.");
    else hidePanel();
  }

  function endGame() {
    gameOver = true;
    running = false;
    paused = false;

    showPanel(
      "Game Over",
      `Score: ${score}\n\nTip: Drag the paddle anywhere on the screen.\nTap or press Launch to fire again.`
    );

    // auto-submit once (so leaderboard works even if they forget)
    submitScore();
  }

  function submitScore() {
  const s = score | 0;
  const gg = window.GG;
  if (!gg) return;

  // Prefer newer daily-aware API (if present)
  if (typeof gg.endRound === "function") {
    try { gg.endRound(s, { gameSlug: GAME_SLUG }); return; } catch {}
    try { gg.endRound({ gameSlug: GAME_SLUG, score: s }); return; } catch {}
    try { gg.endRound(s); return; } catch {}
  }

  // Fallbacks for older signatures
  if (typeof gg.submitScore === "function") {
    try { gg.submitScore({ gameSlug: GAME_SLUG, score: s }); return; } catch {}
    try { gg.submitScore(s, GAME_SLUG); return; } catch {}
    try { gg.submitScore(s); return; } catch {}
  }

  // Last-resort: postMessage to parent (same-origin iframe)
  try {
    window.parent?.postMessage?.(
      { type: "GG_SCORE", gameSlug: GAME_SLUG, score: s },
      window.location.origin
    );
  } catch {}
}


  // ---- Level generation ----
  function buildLevel(n) {
    const w = cw();
    const top = 22;
    const marginX = 14;
    const rows = Math.min(6, 3 + Math.floor((n - 1) * 0.6));
    const cols = Math.min(10, 7 + Math.floor((n - 1) * 0.5));

    const gap = 8;
    const usableW = w - marginX * 2;
    const brickW = Math.floor((usableW - gap * (cols - 1)) / cols);
    const brickH = 18;

    bricks = [];
    const palette = [
      "rgba(59,130,246,.95)",
      "rgba(168,85,247,.90)",
      "rgba(34,197,94,.92)",
      "rgba(14,165,233,.92)",
      "rgba(244,63,94,.88)",
      "rgba(250,204,21,.85)"
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Pattern holes (keeps it interesting)
        const holeChance = Math.min(0.18, 0.05 + n * 0.01);
        if (Math.random() < holeChance) continue;

        const x = marginX + c * (brickW + gap);
        const y = top + r * (brickH + gap);

        const hp = 1 + (n >= 4 && Math.random() < 0.18 ? 1 : 0); // some tougher bricks later
        const color = palette[(r + c + n) % palette.length];

        bricks.push({ x, y, w: brickW, h: brickH, hp, color });
      }
    }

    // reset ball/paddle positions per level
    paddle.x = w * 0.5;
    paddle.y = ch() - 54;

    resetBallStuck();
    toast(`Level ${n}`);
    updateHud();
  }

  function nextLevel() {
    level += 1;
    // small reward
    lives = Math.min(5, lives + 1);
    buildLevel(level);
    showPanel(`Level ${level}`, "Tap Start to continue.");
    running = false;
  }

  // ---- Input ----
  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function launchBall() {
    if (!running || paused || gameOver) return;
    if (!ball.stuck) return;

    // launch upward with mild angle based on where paddle is being held/dragged
    const dirX = (Math.random() * 2 - 1) * 0.35;
    const sp = ball.speed + Math.min(140, (level - 1) * 20);
    ball.vx = dirX * sp;
    ball.vy = -sp;
    ball.stuck = false;

    toast("GO!");
    ggSfx("launch");
  }

  canvas.addEventListener("pointerdown", (e) => {
    ggEnsureAudio();
    canvas.setPointerCapture?.(e.pointerId);
    const p = canvasPoint(e);

    pointer.id = e.pointerId;
    pointer.down = true;
    pointer.startX = p.x;
    pointer.startY = p.y;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.tDown = performance.now();
    pointer.dragging = true;

    // start game on interaction
    if (!running && !gameOver) startGame();
    if (gameOver) {
      resetGame();
      startGame();
    }
  }, { passive: true });

  canvas.addEventListener("pointermove", (e) => {
    if (!pointer.down || pointer.id !== e.pointerId) return;
    const p = canvasPoint(e);
    pointer.x = p.x;
    pointer.y = p.y;
  }, { passive: true });

  canvas.addEventListener("pointerup", (e) => {
    if (!pointer.down || pointer.id !== e.pointerId) return;

    const p = canvasPoint(e);
    const dt = performance.now() - pointer.tDown;
    const dx = p.x - pointer.startX;
    const dy = p.y - pointer.startY;
    const dist2 = dx * dx + dy * dy;

    // quick tap (no drag) launches when ball stuck
    if (dt < 200 && dist2 < 14 * 14 && ball.stuck && running && !paused) {
      launchBall();
    }

    pointer.down = false;
    pointer.dragging = false;
    pointer.id = null;
  }, { passive: true });

  window.addEventListener("keydown", (e) => {
    keys.add(e.key);
    if (e.key === "p" || e.key === "P") togglePause();
    if (e.key === " " || e.key === "Enter") launchBall();
    if (e.key === "r" || e.key === "R") { resetGame(); startGame(); }
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key));

  // Buttons
  btnStart.onclick = () => {
    if (gameOver) resetGame();
    if (!running) startGame();
    else if (paused) togglePause();
    else startGame();
  };
  btnOverlay.onclick = () => window.GG?.openOverlay?.();
  btnChat.onclick = () => window.GG?.openOverlay?.();

  btnPause.onclick = () => togglePause();
  btnLaunch.onclick = () => { ggEnsureAudio(); launchBall(); };

  btnRestart.onclick = () => {
    resetGame();
    startGame();
  };

  btnSubmit.onclick = () => {
    submitScore();
    window.GG?.openOverlay?.();
  };

  // ---- Power-ups ----
  // Types: W = widen paddle, S = slow ball, L = extra life
  function maybeDropPowerUp(x, y) {
    const roll = Math.random();
    const chance = 0.14; // 14% per brick
    if (roll > chance) return;

    const typeRoll = Math.random();
    const type = typeRoll < 0.45 ? "W" : typeRoll < 0.8 ? "S" : "L";
    drops.push({ x, y, r: 10, vy: 150, type });
  }

  function applyPowerUp(type) {
    if (type === "W") {
      paddle.widenUntil = performance.now() + 10000; // 10s
      paddle.w = paddle.baseW * 1.45;
      toast("Paddle +");
    } else if (type === "S") {
      // slow ball by reducing speed magnitude briefly
      const factor = 0.72;
      ball.vx *= factor;
      ball.vy *= factor;
      toast("Slow-mo");
    } else if (type === "L") {
      lives = Math.min(5, lives + 1);
      toast("+1 Life");
      updateHud();
    }
    ggSfx("power");
  }

  // ---- Physics helpers ----
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function circleRectHit(cx, cy, cr, rx, ry, rw, rh) {
    const px = clamp(cx, rx, rx + rw);
    const py = clamp(cy, ry, ry + rh);
    const dx = cx - px;
    const dy = cy - py;
    return (dx * dx + dy * dy) <= cr * cr;
  }

  function reflectBallOffRect(prevX, prevY, rect) {
    // Decide whether to flip vx or vy based on where the ball came from
    const rx = rect.x, ry = rect.y, rw = rect.w, rh = rect.h;

    const wasLeft = prevX < rx;
    const wasRight = prevX > rx + rw;
    const wasAbove = prevY < ry;
    const wasBelow = prevY > ry + rh;

    // Prefer axis that matches entry direction
    if ((wasLeft && ball.vx > 0) || (wasRight && ball.vx < 0)) {
      ball.vx *= -1;
      // push out slightly
      ball.x += ball.vx > 0 ? 1 : -1;
      return;
    }
    if ((wasAbove && ball.vy > 0) || (wasBelow && ball.vy < 0)) {
      ball.vy *= -1;
      ball.y += ball.vy > 0 ? 1 : -1;
      return;
    }

    // Fallback: flip the axis with larger penetration tendency
    if (Math.abs(ball.vx) > Math.abs(ball.vy)) ball.vx *= -1;
    else ball.vy *= -1;
  }

  // ---- Loop ----
 let last = performance.now();
function loop(now) {
  if (GG_PAUSED) {
    last = now;                 // prevent dt spike on resume
    requestAnimationFrame(loop);
    return;
  }

  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  step(dt, now);
  draw(dt);

  requestAnimationFrame(loop);
}


  function step(dt, nowMs) {
    // Update paddle size expiry
    if (paddle.widenUntil && nowMs > paddle.widenUntil) {
      paddle.widenUntil = 0;
      paddle.w = paddle.baseW;
      toast("Normal");
    }

    if (!running || paused || gameOver) {
      // keep paddle responsive even when paused (nice UX)
      movePaddle(dt);
      if (ball.stuck) resetBallStuck();
      return;
    }

    movePaddle(dt);

    // keep ball on paddle if stuck
    if (ball.stuck) {
      resetBallStuck();
      updateDrops(dt);
      updateToasts(dt);
      updateHud();
      return;
    }

    // Ball movement
    const prevX = ball.x;
    const prevY = ball.y;

    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    const w = cw();
    const h = ch();

    // Walls
    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; }
    if (ball.x + ball.r > w) { ball.x = w - ball.r; ball.vx *= -1; }
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy *= -1; }

    // Bottom (lose life)
    if (ball.y - ball.r > h) {
      lives -= 1;
      updateHud();

      if (lives <= 0) {
        endGame();
        return;
      }

      toast("Life lost");
      resetBallStuck();
      return;
    }

    // Paddle collision
    const paddleRect = {
      x: paddle.x - paddle.w * 0.5,
      y: paddle.y - paddle.h * 0.5,
      w: paddle.w,
      h: paddle.h
    };

    if (circleRectHit(ball.x, ball.y, ball.r, paddleRect.x, paddleRect.y, paddleRect.w, paddleRect.h) && ball.vy > 0) {
      // Reflect upward with angle based on hit position
      const hitPos = (ball.x - paddle.x) / (paddle.w * 0.5); // -1..1
      const clamped = clamp(hitPos, -1, 1);

      const sp = Math.max(320, Math.hypot(ball.vx, ball.vy));
      const angle = clamped * (Math.PI * 0.38); // max ~68 degrees
      ball.vx = Math.sin(angle) * sp;
      ball.vy = -Math.cos(angle) * sp;

      ggSfx("paddle");

      // prevent sticking
      ball.y = paddleRect.y - ball.r - 1;
    }

    // Brick collisions
    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (!circleRectHit(ball.x, ball.y, ball.r, b.x, b.y, b.w, b.h)) continue;

      // reflect
      reflectBallOffRect(prevX, prevY, b);

      // damage brick
      b.hp -= 1;
      if (b.hp <= 0) {
        ggSfx("brickBreak");
        bricks.splice(i, 1);
        i--;

        score += 50 + Math.floor(level * 8);
        maybeDropPowerUp(b.x + b.w * 0.5, b.y + b.h * 0.5);

        // small speed ramp
        const target = 420 + Math.min(200, (level - 1) * 30);
        const cur = Math.hypot(ball.vx, ball.vy);
        const newSp = Math.min(target, cur + 8);
        const len = Math.hypot(ball.vx, ball.vy) || 1;
        ball.vx = (ball.vx / len) * newSp;
        ball.vy = (ball.vy / len) * newSp;
      } else {
         ggSfx("brickHit");
        // tougher brick gives smaller reward
        score += 12;
      }

      break; // one brick per frame is enough
    }

    // Level clear
    if (bricks.length === 0) {
      score += 250;
      updateHud();
      nextLevel();
      return;
    }

    updateDrops(dt);
    updateToasts(dt);
    updateHud();
  }

  function movePaddle(dt) {
    const w = cw();

    // pointer drag anywhere controls paddle
    if (pointer.dragging) {
      paddle.x = clamp(pointer.x, paddle.w * 0.5 + 6, w - paddle.w * 0.5 - 6);
      return;
    }

    // keyboard fallback
    let ax = 0;
    if (keys.has("ArrowLeft")) ax -= 1;
    if (keys.has("ArrowRight")) ax += 1;

    if (ax !== 0) {
      const speed = 520;
      paddle.x = clamp(paddle.x + ax * speed * dt, paddle.w * 0.5 + 6, w - paddle.w * 0.5 - 6);
    }
  }

  function updateDrops(dt) {
    if (!drops.length) return;

    const pr = {
      x: paddle.x - paddle.w * 0.5,
      y: paddle.y - paddle.h * 0.5,
      w: paddle.w,
      h: paddle.h
    };

    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.y += d.vy * dt;

      // catch
      if (circleRectHit(d.x, d.y, d.r, pr.x, pr.y, pr.w, pr.h)) {
        drops.splice(i, 1);
        applyPowerUp(d.type);
        continue;
      }

      // out
      if (d.y - d.r > ch() + 40) drops.splice(i, 1);
    }
  }

  function updateToasts(dt) {
    for (let i = toasts.length - 1; i >= 0; i--) {
      toasts[i].t -= dt;
      if (toasts[i].t <= 0) toasts.splice(i, 1);
    }
  }

  // ---- Drawing ----
  function draw(dt) {
    const w = cw();
    const h = ch();

    // background
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, w, h);

    // subtle grid
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "rgba(255,255,255,.10)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // bricks
    for (const b of bricks) {
      // body
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 14;
      roundRectFill(b.x, b.y, b.w, b.h, 8);

      // highlight
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = "rgba(255,255,255,.9)";
      roundRectFill(b.x + 2, b.y + 2, b.w - 4, Math.max(4, b.h * 0.35), 6);

      // hp hint
      if (b.hp > 1) {
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = "rgba(0,0,0,.6)";
        roundRectFill(b.x + b.w - 20, b.y + 4, 14, 10, 5);
      }
      ctx.restore();
    }

    // paddle
    ctx.save();
    ctx.fillStyle = "rgba(59,130,246,.95)";
    ctx.shadowColor = "rgba(59,130,246,.95)";
    ctx.shadowBlur = 16;
    roundRectFill(paddle.x - paddle.w * 0.5, paddle.y - paddle.h * 0.5, paddle.w, paddle.h, 10);
    ctx.restore();

    // ball
    ctx.save();
    const col = "rgba(168,85,247,.92)";
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // drops
    for (const d of drops) {
      const c = d.type === "W" ? "rgba(34,197,94,.92)" : d.type === "S" ? "rgba(14,165,233,.92)" : "rgba(250,204,21,.90)";
      ctx.save();
      ctx.fillStyle = c;
      ctx.shadowColor = c;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.font = "900 12px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(d.type, d.x, d.y + 0.5);
      ctx.restore();
    }

    // toasts
    if (toasts.length) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = "900 14px system-ui";
      let y = 14;
      for (const t0 of toasts.slice(-3)) {
        const a = clamp(t0.t / 1.4, 0, 1);
        ctx.globalAlpha = 0.35 + a * 0.65;
        ctx.fillStyle = "rgba(255,255,255,.92)";
        ctx.fillText(t0.msg, w * 0.5, y);
        y += 18;
      }
      ctx.restore();
    }

    // hint when ball stuck
    if (ball.stuck && running && !paused && !gameOver) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.font = "800 13px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Tap to launch • or press 🚀 Launch", w * 0.5, h * 0.62);
      ctx.restore();
    }
  }

  function roundRectFill(x, y, w, h, r) {
    const rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
    ctx.fill();
  }

  // ---- Start ----
  resetGame();
  requestAnimationFrame(loop);
})();
