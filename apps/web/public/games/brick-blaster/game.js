(() => {
  "use strict";

  const GAME_SLUG = "brick-blaster";
  const $ = (id) => document.getElementById(id);

  const canvas = $("c");
  const ctx = canvas?.getContext("2d", { alpha: true });
  if (!canvas || !ctx) return;

  const elScore = $("score");
  const elLives = $("lives");
  const elLevel = $("level");
  const elTitle = $("ggTitle");
  const elSub = $("ggSub");
  const panel = $("panel");
  const panelTitle = $("panelTitle");
  const panelText = $("panelText");
  const btnStart = $("btnStart");
  const btnOverlay = $("btnOverlay");
  const btnPause = $("btnPause");
  const btnLaunch = $("btnLaunch");
  const btnSubmit = $("btnSubmit");
  const btnRestart = $("btnRestart");
  const btnChat = $("btnChat");

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
  const rand = (a, b) => a + Math.random() * (b - a);
  const now = () => performance.now();

  // ----------------------------
  // Platform bridge
  // ----------------------------
  let GG_PAUSED = false;
  let GG_MUTED = false;
  let lastBridgeScoreAt = 0;

  function targetOrigin() {
    try { return window.location.origin || "*"; } catch (_) { return "*"; }
  }

  function getPlayerName() {
    try {
      return localStorage.getItem("gg_player_name") || localStorage.getItem("webgamearena_player_name") || "Player";
    } catch (_) {
      return "Player";
    }
  }

  function postScore(mode = "live", extra = {}) {
    const cleanScore = Math.max(0, Math.floor(score));
    const payload = {
      gameSlug: GAME_SLUG,
      score: cleanScore,
      mode,
      level,
      lives,
      combo: comboCount,
      maxCombo,
      balls: balls.length,
      playerName: getPlayerName(),
      ...extra,
    };

    try {
      window.parent?.postMessage({ type: "GG_SCORE", ...payload, payload }, targetOrigin());
      window.parent?.postMessage({ type: "gg:score", ...payload, payload }, targetOrigin());
      window.parent?.postMessage({ source: "glorygames", gameSlug: GAME_SLUG, type: "score_live", payload }, targetOrigin());
    } catch (_) {}

    try {
      if (mode !== "live" && window.GG?.endRound) window.GG.endRound(payload);
      else if (mode !== "live" && window.GG?.submitScore) window.GG.submitScore(payload);
    } catch (_) {}
  }

  function submitScore() {
    postScore("final", { reason: "manual_submit" });
  }

  window.addEventListener("message", (ev) => {
    if (ev.origin !== window.location.origin) return;
    const data = ev.data;
    if (!data || typeof data !== "object") return;
    const { type, payload } = data;
    if (type === "GG_PAUSE") {
      GG_PAUSED = !!payload?.paused;
      lastTick = now();
    }
    if (type === "GG_MUTE") {
      GG_MUTED = !!payload?.muted;
      applyMute();
    }
    if (type === "GG_RESTART") {
      resetGame();
      startGame();
    }
    if (type === "GG_CONTEXT") window.GG_USER = payload?.user ?? null;
  });

  document.addEventListener("visibilitychange", () => {
    GG_PAUSED = document.hidden;
    lastTick = now();
  });

  // ----------------------------
  // Audio: generated SFX, no external files
  // ----------------------------
  let audioCtx = null;
  let masterGain = null;

  function ensureAudio() {
    if (GG_MUTED) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) {
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.11;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  function applyMute() {
    if (masterGain) masterGain.gain.value = GG_MUTED ? 0 : 0.11;
  }

  function tone(freq = 440, dur = 0.05, type = "sine", vol = 0.6, delay = 0) {
    const ac = ensureAudio();
    if (!ac || GG_MUTED) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.12 * vol), t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(masterGain || ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function sfx(name) {
    if (name === "launch") { tone(240, .035, "triangle", .7); tone(520, .045, "square", .7, .035); return; }
    if (name === "paddle") return tone(240, .03, "square", .55);
    if (name === "brick") return tone(540, .032, "square", .45);
    if (name === "break") { tone(660, .035, "square", .65); tone(980, .04, "triangle", .55, .03); return; }
    if (name === "power") { tone(760, .045, "triangle", .55); tone(1040, .05, "sine", .55, .035); return; }
    if (name === "life") { tone(180, .08, "sawtooth", .5); tone(120, .12, "sine", .45, .07); return; }
    if (name === "level") { tone(440, .05, "triangle", .55); tone(660, .05, "triangle", .55, .05); tone(880, .06, "triangle", .55, .1); return; }
    if (name === "gameover") { tone(220, .09, "sawtooth", .5); tone(150, .12, "sine", .45, .08); return; }
  }

  // ----------------------------
  // Meta
  // ----------------------------
  let META = { title: "Brick Blaster", description: "Drag to move the paddle, tap to launch, and smash bricks for high scores." };
  async function loadMeta() {
    try {
      const res = await fetch("./game.json", { cache: "no-store" });
      const meta = await res.json();
      META = meta || META;
      const title = META.title || "Brick Blaster";
      document.title = title;
      if (elTitle) elTitle.textContent = title;
      if (panelTitle) panelTitle.textContent = title;
      if (panelText) panelText.textContent = META.description || panelText.textContent;
      if (elSub) elSub.textContent = "Drag • Launch • Combo • Multi-ball";
      try { window.GG?.setSlug?.(GAME_SLUG); window.GG?.setTitle?.(title); window.GG?.init?.({ title }); } catch (_) {}
    } catch (_) {}
  }

  // ----------------------------
  // Canvas sizing
  // ----------------------------
  let DPR = 1;
  let viewW = 360;
  let viewH = 640;
  let resizeQueued = false;

  function resize() {
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const r = canvas.getBoundingClientRect();
    viewW = Math.max(1, Math.floor(r.width || window.innerWidth || 360));
    viewH = Math.max(1, Math.floor(r.height || window.innerHeight || 640));
    canvas.width = Math.floor(viewW * DPR);
    canvas.height = Math.floor(viewH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    layoutObjects();
  }

  function queueResize() {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => { resizeQueued = false; resize(); });
  }
  window.addEventListener("resize", queueResize, { passive: true });
  window.addEventListener("orientationchange", queueResize, { passive: true });

  document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

  // ----------------------------
  // Game state
  // ----------------------------
  const keys = new Set();
  let running = false;
  let paused = false;
  let gameOver = false;
  let score = 0;
  let lives = 3;
  let level = 1;
  let comboCount = 0;
  let maxCombo = 0;
  let comboTimer = 0;
  let shake = 0;
  let fireballUntil = 0;
  let stickyUntil = 0;

  const paddle = { x: 0, y: 0, w: 112, h: 16, baseW: 112, targetX: 0, widenUntil: 0 };
  const pointer = { id: null, down: false, x: 0, y: 0, startX: 0, startY: 0, tDown: 0, dragging: false };

  let balls = [];
  let bricks = [];
  let drops = [];
  let particles = [];
  let toasts = [];
  let stars = [];
  let lastTick = now();

  function cw() { return viewW; }
  function ch() { return viewH; }

  function baseBallSpeed() {
    return Math.min(650, 390 + level * 22);
  }

  function makeBall(stuck = true, x = paddle.x, y = paddle.y - 22) {
    return { x, y, r: Math.max(6.5, Math.min(9.5, cw() * 0.018)), vx: 0, vy: 0, speed: baseBallSpeed(), stuck, fire: false, trail: [] };
  }

  function layoutObjects() {
    paddle.baseW = clamp(cw() * 0.27, 94, 152);
    if (!paddle.widenUntil) paddle.w = paddle.baseW;
    paddle.h = clamp(ch() * 0.024, 14, 20);
    paddle.y = ch() - clamp(ch() * 0.105, 48, 78);
    paddle.x = clamp(paddle.x || cw() / 2, paddle.w / 2 + 8, cw() - paddle.w / 2 - 8);
    paddle.targetX = paddle.x;
    for (const b of balls) if (b.stuck) attachBallToPaddle(b);
  }

  function updateHud() {
    if (elScore) elScore.textContent = String(score | 0);
    if (elLives) elLives.textContent = String(lives | 0);
    if (elLevel) elLevel.textContent = String(level | 0);
  }

  function showPanel(title, text, buttonText = "Start") {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (btnStart) btnStart.textContent = buttonText;
    if (panel) panel.style.display = "flex";
  }
  function hidePanel() { if (panel) panel.style.display = "none"; }
  function toast(msg) { toasts.push({ msg, t: 1.55, life: 1.55 }); }

  function attachBallToPaddle(ball) {
    ball.stuck = true;
    ball.vx = 0;
    ball.vy = 0;
    ball.x = paddle.x;
    ball.y = paddle.y - paddle.h / 2 - ball.r - 3;
  }

  function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    comboCount = 0;
    maxCombo = 0;
    comboTimer = 0;
    fireballUntil = 0;
    stickyUntil = 0;
    shake = 0;
    running = false;
    paused = false;
    gameOver = false;
    paddle.widenUntil = 0;
    layoutObjects();
    balls = [makeBall(true)];
    drops = [];
    particles = [];
    toasts = [];
    buildLevel(level);
    updateHud();
    showPanel(META.title || "Brick Blaster", META.description || "Drag to move the paddle. Tap to launch. Break bricks and grab power-ups.", "Start");
  }

  function startGame() {
    ensureAudio();
    running = true;
    paused = false;
    gameOver = false;
    hidePanel();
    lastTick = now();
  }

  function togglePause() {
    if (!running || gameOver) return;
    paused = !paused;
    if (paused) showPanel("Paused", "Take a breath. Tap Start to continue blasting.", "Resume");
    else hidePanel();
  }

  function endGame() {
    gameOver = true;
    running = false;
    paused = false;
    sfx("gameover");
    postScore("game_over", { reason: "lives_empty" });
    showPanel("Game Over", `Final score: ${score | 0}\nBest combo: x${maxCombo}\n\nTip: Keep the ball moving fast, catch multi-ball, and aim for explosive bricks.`, "Try Again");
  }

  // ----------------------------
  // Level generation
  // ----------------------------
  function buildLevel(n) {
    const w = cw();
    const top = clamp(ch() * 0.05, 18, 42);
    const marginX = clamp(w * 0.035, 12, 28);
    const cols = clamp(Math.floor(w / 56), 6, 12);
    const rows = clamp(4 + Math.floor(n * 0.62), 4, 9);
    const gap = clamp(w * 0.014, 6, 10);
    const usableW = w - marginX * 2;
    const brickW = Math.floor((usableW - gap * (cols - 1)) / cols);
    const brickH = clamp(ch() * 0.033, 17, 25);

    const palettes = [
      ["#38bdf8", "#60a5fa", "#818cf8", "#a78bfa"],
      ["#22c55e", "#14b8a6", "#38bdf8", "#facc15"],
      ["#fb7185", "#f97316", "#facc15", "#a78bfa"],
      ["#e879f9", "#a78bfa", "#38bdf8", "#34d399"],
    ];
    const pal = palettes[(n - 1) % palettes.length];

    bricks = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const holeChance = Math.min(0.14, 0.025 + n * 0.006);
        if (Math.random() < holeChance && r > 0 && r < rows - 1) continue;
        const x = marginX + c * (brickW + gap);
        const y = top + r * (brickH + gap);
        let type = "normal";
        let hp = 1;
        if (n >= 3 && Math.random() < 0.14) { type = "heavy"; hp = 2; }
        if (n >= 5 && Math.random() < 0.075) { type = "steel"; hp = 3; }
        if (Math.random() < 0.07 + Math.min(0.04, n * 0.006)) { type = "bonus"; hp = 1; }
        if (n >= 2 && Math.random() < 0.06) { type = "explode"; hp = 1; }
        if (n % 5 === 0 && r === 0 && c >= Math.floor(cols / 2) - 1 && c <= Math.floor(cols / 2) + 1) { type = "boss"; hp = 4 + Math.floor(n / 5); }
        bricks.push({ x, y, w: brickW, h: brickH, hp, maxHp: hp, type, color: pal[(r + c + n) % pal.length], pulse: Math.random() * 10 });
      }
    }

    paddle.x = cw() * 0.5;
    paddle.targetX = paddle.x;
    layoutObjects();
    balls = [makeBall(true)];
    drops = [];
    comboCount = 0;
    comboTimer = 0;
    toast(`Level ${n}`);
    updateHud();
  }

  function nextLevel() {
    level += 1;
    lives = Math.min(6, lives + 1);
    score += 200 + level * 35;
    sfx("level");
    postScore("level_complete", { completedLevel: level - 1 });
    buildLevel(level);
    running = false;
    showPanel(`Level ${level}`, "Great clear! You earned a bonus life. Tap Start to continue.", "Continue");
  }

  // ----------------------------
  // Input
  // ----------------------------
  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function launchBall() {
    if (!running || paused || gameOver) return;
    let launched = false;
    for (const ball of balls) {
      if (!ball.stuck) continue;
      const aim = clamp((pointer.down ? pointer.x : paddle.x) - paddle.x, -paddle.w / 2, paddle.w / 2) / (paddle.w / 2 || 1);
      const sp = baseBallSpeed();
      const angle = aim * (Math.PI * 0.28) + rand(-0.12, 0.12);
      ball.vx = Math.sin(angle) * sp;
      ball.vy = -Math.cos(angle) * sp;
      ball.stuck = false;
      launched = true;
    }
    if (launched) { toast("Blast!"); sfx("launch"); }
  }

  canvas.addEventListener("pointerdown", (e) => {
    ensureAudio();
    canvas.setPointerCapture?.(e.pointerId);
    const p = canvasPoint(e);
    pointer.id = e.pointerId;
    pointer.down = true;
    pointer.startX = p.x;
    pointer.startY = p.y;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.tDown = now();
    pointer.dragging = true;
    paddle.targetX = p.x;
    if (!running && !gameOver) startGame();
    if (gameOver) { resetGame(); startGame(); }
  }, { passive: true });

  canvas.addEventListener("pointermove", (e) => {
    if (!pointer.down || pointer.id !== e.pointerId) return;
    const p = canvasPoint(e);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.dragging = true;
    paddle.targetX = p.x;
  }, { passive: true });

  canvas.addEventListener("pointerup", (e) => {
    if (!pointer.down || pointer.id !== e.pointerId) return;
    const p = canvasPoint(e);
    const dt = now() - pointer.tDown;
    const dx = p.x - pointer.startX;
    const dy = p.y - pointer.startY;
    const dist2 = dx * dx + dy * dy;
    if (dt < 240 && dist2 < 18 * 18) launchBall();
    pointer.down = false;
    pointer.dragging = false;
    pointer.id = null;
  }, { passive: true });

  window.addEventListener("keydown", (e) => {
    keys.add(e.key);
    if (["ArrowLeft", "ArrowRight", " ", "Enter"].includes(e.key)) e.preventDefault();
    if (e.key === "p" || e.key === "P") togglePause();
    if (e.key === " " || e.key === "Enter") launchBall();
    if (e.key === "r" || e.key === "R") { resetGame(); startGame(); }
  });
  window.addEventListener("keyup", (e) => keys.delete(e.key));

  btnStart?.addEventListener("click", () => {
    if (gameOver) resetGame();
    if (!running) startGame();
    else if (paused) togglePause();
    else startGame();
  });
  btnOverlay?.addEventListener("click", () => window.GG?.openOverlay?.());
  btnChat?.addEventListener("click", () => window.GG?.openOverlay?.());
  btnPause?.addEventListener("click", () => togglePause());
  btnLaunch?.addEventListener("click", () => { ensureAudio(); launchBall(); });
  btnRestart?.addEventListener("click", () => { resetGame(); startGame(); });
  btnSubmit?.addEventListener("click", () => { submitScore(); window.GG?.openOverlay?.(); });

  // ----------------------------
  // Power-ups
  // ----------------------------
  const POWER_LABELS = { W: "WIDE", S: "SLOW", L: "+1", M: "MULTI", F: "FIRE", K: "STICKY" };
  function maybeDropPowerUp(x, y, force = false) {
    if (!force && Math.random() > 0.18) return;
    const bag = ["W", "S", "M", "F", "K", "L"];
    const type = bag[Math.floor(Math.random() * bag.length)];
    drops.push({ x, y, r: clamp(cw() * 0.025, 11, 15), vy: clamp(ch() * 0.22, 135, 205), type, spin: rand(0, Math.PI * 2) });
  }

  function applyPowerUp(type) {
    if (type === "W") {
      paddle.widenUntil = now() + 10500;
      paddle.w = paddle.baseW * 1.48;
      toast("Wide paddle");
    } else if (type === "S") {
      for (const b of balls) { b.vx *= 0.72; b.vy *= 0.72; }
      toast("Slow ball");
    } else if (type === "L") {
      lives = Math.min(6, lives + 1);
      toast("+1 Life");
    } else if (type === "M") {
      spawnMultiBall();
      toast("Multi-ball");
    } else if (type === "F") {
      fireballUntil = now() + 8500;
      for (const b of balls) b.fire = true;
      toast("Fire ball");
    } else if (type === "K") {
      stickyUntil = now() + 8000;
      toast("Sticky paddle");
    }
    score += 75;
    sfx("power");
    updateHud();
  }

  function spawnMultiBall() {
    const active = balls.find((b) => !b.stuck) || balls[0] || makeBall(true);
    while (balls.length < 3) {
      const nb = makeBall(false, active.x, active.y);
      const sp = Math.max(360, Math.hypot(active.vx, active.vy) || baseBallSpeed());
      const angle = rand(-0.95, -0.25) * Math.PI;
      nb.vx = Math.cos(angle) * sp;
      nb.vy = Math.sin(angle) * sp;
      balls.push(nb);
    }
  }

  // ----------------------------
  // Physics helpers
  // ----------------------------
  function circleRectHit(cx, cy, cr, rx, ry, rw, rh) {
    const px = clamp(cx, rx, rx + rw);
    const py = clamp(cy, ry, ry + rh);
    const dx = cx - px;
    const dy = cy - py;
    return dx * dx + dy * dy <= cr * cr;
  }

  function reflectBall(ball, prevX, prevY, rect) {
    const wasLeft = prevX < rect.x;
    const wasRight = prevX > rect.x + rect.w;
    const wasAbove = prevY < rect.y;
    const wasBelow = prevY > rect.y + rect.h;
    if ((wasLeft && ball.vx > 0) || (wasRight && ball.vx < 0)) { ball.vx *= -1; ball.x += ball.vx > 0 ? 1 : -1; return; }
    if ((wasAbove && ball.vy > 0) || (wasBelow && ball.vy < 0)) { ball.vy *= -1; ball.y += ball.vy > 0 ? 1 : -1; return; }
    if (Math.abs(ball.vx) > Math.abs(ball.vy)) ball.vx *= -1;
    else ball.vy *= -1;
  }

  function normalizeBallSpeed(ball) {
    if (ball.stuck) return;
    const minSp = 310;
    const maxSp = Math.min(760, baseBallSpeed() + 150);
    const len = Math.hypot(ball.vx, ball.vy) || 1;
    const sp = clamp(len, minSp, maxSp);
    ball.vx = (ball.vx / len) * sp;
    ball.vy = (ball.vy / len) * sp;
  }

  function addParticles(x, y, color, count = 8, power = 130) {
    for (let i = 0; i < count; i++) {
      particles.push({ x, y, vx: rand(-power, power), vy: rand(-power * .9, power * .55), r: rand(1.5, 4), t: rand(.35, .75), color });
    }
  }

  function addScore(points, x, y, label = null) {
    comboCount = comboTimer > 0 ? comboCount + 1 : 1;
    comboTimer = 2.9;
    maxCombo = Math.max(maxCombo, comboCount);
    const mult = 1 + Math.min(2.2, (comboCount - 1) * 0.12);
    const award = Math.floor(points * mult);
    score += award;
    if (label) toasts.push({ msg: comboCount > 1 ? `${label} x${comboCount}` : label, t: 1.1, life: 1.1 });
    floatingScore(x, y, `+${award}`);
  }

  function floatingScore(x, y, text) {
    particles.push({ x, y, vx: 0, vy: -36, r: 0, t: .85, text, color: "rgba(255,255,255,.95)" });
  }

  function breakBrick(index, ball) {
    const b = bricks[index];
    const centerX = b.x + b.w / 2;
    const centerY = b.y + b.h / 2;
    addParticles(centerX, centerY, b.color, b.type === "explode" ? 22 : 10, b.type === "explode" ? 230 : 145);
    maybeDropPowerUp(centerX, centerY, b.type === "bonus");
    addScore(b.type === "boss" ? 260 : b.type === "steel" ? 120 : b.type === "bonus" ? 110 : 60 + level * 7, centerX, centerY, b.type === "boss" ? "Boss brick" : b.type === "bonus" ? "Bonus" : "Break");
    bricks.splice(index, 1);
    sfx("break");
    shake = Math.max(shake, b.type === "explode" ? 9 : 3.5);

    if (b.type === "explode") {
      for (let j = bricks.length - 1; j >= 0; j--) {
        const nb = bricks[j];
        const dx = (nb.x + nb.w / 2) - centerX;
        const dy = (nb.y + nb.h / 2) - centerY;
        if (Math.hypot(dx, dy) < Math.max(b.w, b.h) * 2.25) {
          nb.hp -= 2;
          if (nb.hp <= 0) {
            addParticles(nb.x + nb.w / 2, nb.y + nb.h / 2, nb.color, 5, 110);
            addScore(35, nb.x + nb.w / 2, nb.y + nb.h / 2, "Chain");
            bricks.splice(j, 1);
          }
        }
      }
    }

    if (ball?.fire) {
      ball.vy = Math.min(ball.vy, -Math.abs(ball.vy) || -baseBallSpeed());
    }
  }

  // ----------------------------
  // Loop
  // ----------------------------
  function loop(t) {
    if (GG_PAUSED) {
      lastTick = t;
      draw(0);
      requestAnimationFrame(loop);
      return;
    }
    const dt = Math.min(0.033, (t - lastTick) / 1000 || 0);
    lastTick = t;
    step(dt);
    draw(dt);
    requestAnimationFrame(loop);
  }

  function step(dt) {
    if (shake > 0) shake = Math.max(0, shake - 34 * dt);
    if (comboTimer > 0) comboTimer = Math.max(0, comboTimer - dt);
    else comboCount = 0;

    if (paddle.widenUntil && now() > paddle.widenUntil) { paddle.widenUntil = 0; paddle.w = paddle.baseW; toast("Normal paddle"); }
    if (fireballUntil && now() > fireballUntil) { fireballUntil = 0; for (const b of balls) b.fire = false; toast("Fire ended"); }
    if (stickyUntil && now() > stickyUntil) stickyUntil = 0;

    movePaddle(dt);
    updateDrops(dt);
    updateParticles(dt);
    updateToasts(dt);

    if (!running || paused || gameOver) {
      for (const b of balls) if (b.stuck) attachBallToPaddle(b);
      updateHud();
      return;
    }

    for (let i = balls.length - 1; i >= 0; i--) updateBall(balls[i], i, dt);

    if (balls.length === 0) {
      lives -= 1;
      updateHud();
      sfx("life");
      if (lives <= 0) { endGame(); return; }
      toast("Life lost");
      balls = [makeBall(true)];
      comboCount = 0;
      comboTimer = 0;
    }

    if (bricks.length === 0) { nextLevel(); return; }
    if (now() - lastBridgeScoreAt > 450) { lastBridgeScoreAt = now(); postScore("live"); }
    updateHud();
  }

  function movePaddle(dt) {
    if (pointer.dragging) paddle.targetX = pointer.x;
    let ax = 0;
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) ax -= 1;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) ax += 1;
    if (ax) paddle.targetX = paddle.x + ax * 620 * dt;
    paddle.x += (paddle.targetX - paddle.x) * clamp(18 * dt, 0, 1);
    paddle.x = clamp(paddle.x, paddle.w / 2 + 8, cw() - paddle.w / 2 - 8);
    for (const b of balls) if (b.stuck) attachBallToPaddle(b);
  }

  function updateBall(ball, ballIndex, dt) {
    if (ball.stuck) return;
    ball.trail.push({ x: ball.x, y: ball.y, r: ball.r, t: .22 });
    if (ball.trail.length > 10) ball.trail.shift();

    const prevX = ball.x;
    const prevY = ball.y;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx *= -1; }
    if (ball.x + ball.r > cw()) { ball.x = cw() - ball.r; ball.vx *= -1; }
    if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }
    if (ball.y - ball.r > ch() + 20) { balls.splice(ballIndex, 1); return; }

    const pr = { x: paddle.x - paddle.w / 2, y: paddle.y - paddle.h / 2, w: paddle.w, h: paddle.h };
    if (circleRectHit(ball.x, ball.y, ball.r, pr.x, pr.y, pr.w, pr.h) && ball.vy > 0) {
      if (stickyUntil > now()) { attachBallToPaddle(ball); sfx("paddle"); return; }
      const hit = clamp((ball.x - paddle.x) / (paddle.w / 2), -1, 1);
      const sp = Math.max(330, Math.hypot(ball.vx, ball.vy));
      const angle = hit * (Math.PI * 0.39);
      ball.vx = Math.sin(angle) * sp;
      ball.vy = -Math.cos(angle) * sp;
      ball.y = pr.y - ball.r - 1;
      sfx("paddle");
    }

    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (!circleRectHit(ball.x, ball.y, ball.r, b.x, b.y, b.w, b.h)) continue;
      if (!ball.fire) reflectBall(ball, prevX, prevY, b);
      b.hp -= ball.fire ? 2 : 1;
      b.pulse = 0;
      if (b.hp <= 0) breakBrick(i, ball);
      else { addScore(14, b.x + b.w / 2, b.y + b.h / 2, "Hit"); addParticles(ball.x, ball.y, b.color, 4, 80); sfx("brick"); }
      break;
    }

    normalizeBallSpeed(ball);
  }

  function updateDrops(dt) {
    const pr = { x: paddle.x - paddle.w / 2, y: paddle.y - paddle.h / 2, w: paddle.w, h: paddle.h };
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.y += d.vy * dt;
      d.spin += dt * 4;
      if (circleRectHit(d.x, d.y, d.r, pr.x, pr.y, pr.w, pr.h)) { drops.splice(i, 1); applyPowerUp(d.type); continue; }
      if (d.y - d.r > ch() + 40) drops.splice(i, 1);
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 240 * dt;
      if (p.t <= 0) particles.splice(i, 1);
    }
    for (const b of balls) for (const tr of b.trail) tr.t -= dt;
  }

  function updateToasts(dt) {
    for (let i = toasts.length - 1; i >= 0; i--) {
      toasts[i].t -= dt;
      if (toasts[i].t <= 0) toasts.splice(i, 1);
    }
  }

  // ----------------------------
  // Drawing
  // ----------------------------
  function draw() {
    const w = cw();
    const h = ch();
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    if (shake > 0) ctx.translate(rand(-shake, shake), rand(-shake, shake));

    drawBackground(w, h);
    drawBricks();
    drawDrops();
    drawPaddle();
    drawBalls();
    drawParticles();
    drawCombo();
    drawToasts();
    drawStuckHint();
    ctx.restore();

    if (paused || GG_PAUSED) drawPauseVeil(w, h);
  }

  function drawBackground(w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#070b1d");
    g.addColorStop(.52, "#0d1736");
    g.addColorStop(1, "#050816");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const t = now() / 1000;
    ctx.save();
    ctx.globalAlpha = .28;
    for (let i = 0; i < 24; i++) {
      const x = (i * 137 + Math.sin(t * .2 + i) * 16) % (w + 120) - 60;
      const y = (i * 83) % Math.max(120, h * .58);
      const r = 1.2 + (i % 4) * .55;
      ctx.fillStyle = i % 3 ? "rgba(186,230,253,.85)" : "rgba(216,180,254,.85)";
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = .18;
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 1;
    const grid = 44;
    for (let x = -grid; x < w + grid; x += grid) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + h * .22, h); ctx.stroke(); }
    for (let y = 0; y < h; y += grid) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.restore();

    const glow = ctx.createRadialGradient(w * .5, h * .12, 0, w * .5, h * .12, Math.max(w, h) * .75);
    glow.addColorStop(0, "rgba(56,189,248,.16)");
    glow.addColorStop(.45, "rgba(167,139,250,.10)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }

  function brickGradient(b) {
    const g = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    if (b.type === "steel") { g.addColorStop(0, "#e5e7eb"); g.addColorStop(.55, "#64748b"); g.addColorStop(1, "#111827"); return g; }
    if (b.type === "explode") { g.addColorStop(0, "#fb7185"); g.addColorStop(.55, "#f97316"); g.addColorStop(1, "#7f1d1d"); return g; }
    if (b.type === "bonus") { g.addColorStop(0, "#fde68a"); g.addColorStop(.55, "#facc15"); g.addColorStop(1, "#a16207"); return g; }
    if (b.type === "boss") { g.addColorStop(0, "#f0abfc"); g.addColorStop(.55, "#a855f7"); g.addColorStop(1, "#4c1d95"); return g; }
    if (b.type === "heavy") { g.addColorStop(0, "#93c5fd"); g.addColorStop(.55, b.color); g.addColorStop(1, "#1e1b4b"); return g; }
    g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(.20, b.color); g.addColorStop(1, "#111827"); return g;
  }

  function drawBricks() {
    for (const b of bricks) {
      const r = Math.min(10, b.h / 2);
      ctx.save();
      ctx.shadowColor = b.color;
      ctx.shadowBlur = b.type === "boss" ? 20 : b.type === "bonus" ? 18 : 12;
      ctx.fillStyle = brickGradient(b);
      ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, r); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = .22;
      ctx.fillStyle = "rgba(255,255,255,.95)";
      ctx.beginPath(); ctx.roundRect(b.x + 3, b.y + 3, b.w - 6, Math.max(4, b.h * .35), r * .7); ctx.fill();
      ctx.globalAlpha = 1;
      if (b.hp > 1) {
        ctx.fillStyle = "rgba(0,0,0,.52)";
        ctx.beginPath(); ctx.roundRect(b.x + b.w - 22, b.y + 4, 16, 12, 6); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.9)";
        ctx.font = "900 10px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(b.hp), b.x + b.w - 14, b.y + 10.5);
      }
      if (b.type === "explode") {
        ctx.fillStyle = "rgba(255,255,255,.78)";
        ctx.font = "900 13px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✦", b.x + b.w / 2, b.y + b.h / 2 + 1);
      }
      if (b.type === "bonus") {
        ctx.fillStyle = "rgba(0,0,0,.55)";
        ctx.font = "900 12px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("★", b.x + b.w / 2, b.y + b.h / 2 + 1);
      }
      ctx.restore();
    }
  }

  function drawPaddle() {
    const x = paddle.x - paddle.w / 2;
    const y = paddle.y - paddle.h / 2;
    ctx.save();
    const g = ctx.createLinearGradient(x, y, x + paddle.w, y + paddle.h);
    g.addColorStop(0, "#38bdf8");
    g.addColorStop(.55, "#a78bfa");
    g.addColorStop(1, "#f0abfc");
    ctx.fillStyle = g;
    ctx.shadowColor = "rgba(56,189,248,.9)";
    ctx.shadowBlur = 18;
    ctx.beginPath(); ctx.roundRect(x, y, paddle.w, paddle.h, paddle.h / 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = .38;
    ctx.fillStyle = "rgba(255,255,255,.95)";
    ctx.beginPath(); ctx.roundRect(x + 5, y + 3, paddle.w - 10, Math.max(4, paddle.h * .3), 999); ctx.fill();
    if (stickyUntil > now()) {
      ctx.globalAlpha = .9;
      ctx.strokeStyle = "rgba(250,204,21,.95)";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x - 3, y - 3, paddle.w + 6, paddle.h + 6, 999); ctx.stroke();
    }
    ctx.restore();
  }

  function drawBalls() {
    for (const ball of balls) {
      for (const tr of ball.trail) {
        if (tr.t <= 0) continue;
        ctx.save();
        ctx.globalAlpha = clamp(tr.t / .22, 0, 1) * .38;
        ctx.fillStyle = ball.fire ? "rgba(251,113,133,.95)" : "rgba(167,139,250,.9)";
        ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.save();
      const col = ball.fire ? "rgba(251,113,133,.96)" : "rgba(167,139,250,.95)";
      const inner = ball.fire ? "rgba(254,240,138,.96)" : "rgba(224,242,254,.96)";
      ctx.shadowColor = col;
      ctx.shadowBlur = ball.fire ? 24 : 18;
      const g = ctx.createRadialGradient(ball.x - ball.r * .35, ball.y - ball.r * .45, 0, ball.x, ball.y, ball.r * 1.25);
      g.addColorStop(0, inner);
      g.addColorStop(.45, col);
      g.addColorStop(1, "rgba(30,41,59,.96)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawDrops() {
    for (const d of drops) {
      const c = d.type === "W" ? "#22c55e" : d.type === "S" ? "#38bdf8" : d.type === "L" ? "#facc15" : d.type === "M" ? "#a78bfa" : d.type === "F" ? "#fb7185" : "#fde68a";
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(Math.sin(d.spin) * .18);
      ctx.shadowColor = c;
      ctx.shadowBlur = 18;
      const g = ctx.createLinearGradient(-d.r, -d.r, d.r, d.r);
      g.addColorStop(0, "#fff");
      g.addColorStop(.38, c);
      g.addColorStop(1, "#111827");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.roundRect(-d.r * 1.25, -d.r, d.r * 2.5, d.r * 2, 9); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(0,0,0,.66)";
      ctx.font = `900 ${Math.max(9, d.r * .72)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(POWER_LABELS[d.type] || d.type, 0, 1);
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = clamp(p.t / .75, 0, 1);
      if (p.text) {
        ctx.fillStyle = p.color;
        ctx.font = "900 13px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawCombo() {
    if (comboCount <= 1) return;
    ctx.save();
    ctx.globalAlpha = .92;
    ctx.fillStyle = "rgba(0,0,0,.34)";
    ctx.beginPath(); ctx.roundRect(cw() / 2 - 58, 10, 116, 28, 14); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.96)";
    ctx.font = "1000 14px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`COMBO x${comboCount}`, cw() / 2, 24);
    ctx.restore();
  }

  function drawToasts() {
    if (!toasts.length) return;
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "900 14px system-ui";
    let y = 46;
    for (const t0 of toasts.slice(-4)) {
      const a = clamp(t0.t / t0.life, 0, 1);
      ctx.globalAlpha = .25 + a * .75;
      ctx.fillStyle = "rgba(255,255,255,.94)";
      ctx.fillText(t0.msg, cw() / 2, y);
      y += 19;
    }
    ctx.restore();
  }

  function drawStuckHint() {
    if (!balls.some((b) => b.stuck) || !running || paused || gameOver) return;
    ctx.save();
    ctx.globalAlpha = .76;
    ctx.fillStyle = "rgba(255,255,255,.9)";
    ctx.font = "900 13px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Tap to launch • Drag anywhere to move", cw() / 2, ch() * .64);
    ctx.restore();
  }

  function drawPauseVeil(w, h) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.20)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // ----------------------------
  // Boot
  // ----------------------------
  loadMeta();
  resize();
  resetGame();
  requestAnimationFrame(loop);
})();
