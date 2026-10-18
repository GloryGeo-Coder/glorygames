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
  const controlZone = $("controlZone"), controlMode = $("controlMode"), btnSound = $("btnSound");
  const { grid, cell, physicsScale } = window.BrickLayout;
  const PREFS_KEY = "gg_brick_blaster_controls_v1";
  const prefs = { controlMode: "relative", muted: false };
  try { const saved = JSON.parse(localStorage.getItem(PREFS_KEY)); if (saved && typeof saved === "object") { if (["relative", "direct"].includes(saved.controlMode)) prefs.controlMode = saved.controlMode; prefs.muted = saved.muted === true; } } catch (_) {}
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
  let playTime = 0;
  const playNow = () => playTime;
  function savePrefs() { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (_) {} }
  function syncSettings() {
    controlMode.value = prefs.controlMode;
    $("controlHelp").textContent = prefs.controlMode === "relative" ? "Touch anywhere on the strip, then slide. The paddle keeps its starting position." : "The paddle follows your finger position. Use the strip to keep the ball in view.";
    btnSound.textContent = (prefs.muted || GG_MUTED) ? "Sound Off" : "Sound On";
    btnSound.setAttribute("aria-pressed", String(prefs.muted || GG_MUTED));
    btnSound.disabled = GG_MUTED;
    applyMute();
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
      if (GG_PAUSED) setPaused(true, "The game is paused. Continue when you are ready.");
      resetInput(); accumulator = 0; lastTick = now();
    }
    if (type === "GG_MUTE") {
      GG_MUTED = !!payload?.muted;
      syncSettings();
    }
    if (type === "GG_RESTART") {
      resetGame();
      startGame();
    }
    if (type === "GG_CONTEXT") window.GG_USER = payload?.user ?? null;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { setPaused(true, "Welcome back. Continue when you are ready."); resetInput(); stopSounds(); }
    accumulator = 0; lastTick = now();
  });
  window.addEventListener("blur", () => { setPaused(true); resetInput(); stopSounds(); });
  window.addEventListener("pagehide", () => { setPaused(true); resetInput(); stopSounds(); });

  // ----------------------------
  // Audio: generated SFX, no external files
  // ----------------------------
  let audioCtx = null;
  let masterGain = null;

  const voices = new Set();
  function stopSounds() { for (const voice of [...voices]) voice.stop(); }
  function ensureAudio() {
    if (GG_MUTED || prefs.muted) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      if (!audioCtx) { audioCtx = new AC(); masterGain = audioCtx.createGain(); masterGain.gain.value = .11; masterGain.connect(audioCtx.destination); }
      if (audioCtx.state === "suspended" || audioCtx.state === "interrupted") audioCtx.resume()?.catch(() => {});
      return audioCtx;
    } catch (_) { return null; }
  }
  function applyMute() { if (masterGain) masterGain.gain.value = (GG_MUTED || prefs.muted) ? 0 : .11; if (GG_MUTED || prefs.muted) stopSounds(); }
  function tone(freq = 440, dur = .05, type = "sine", vol = .6, delay = 0) {
    const ac = ensureAudio(); if (!ac || GG_MUTED || prefs.muted || ac.state !== "running") return;
    try {
      const t0 = ac.currentTime + delay, osc = ac.createOscillator(), gain = ac.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(.0001, t0); gain.gain.exponentialRampToValueAtTime(Math.max(.0002, .12 * vol), t0 + .006); gain.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      osc.connect(gain); gain.connect(masterGain); let cleaned = false;
      const voice = { stop() { if (cleaned) return; cleaned = true; try { osc.stop(); } catch (_) {} osc.disconnect(); gain.disconnect(); voices.delete(voice); } };
      osc.onended = () => voice.stop(); voices.add(voice); while (voices.size > 24) voices.values().next().value.stop();
      osc.start(t0); osc.stop(t0 + dur + .02);
    } catch (_) { stopSounds(); }
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
      if (panelText && !running && !gameOver && level === 1) panelText.textContent = META.description || panelText.textContent;
      if (elSub) elSub.textContent = "Classic Arcade · Aim, ricochet and chain your hits";
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
    const r = canvas.getBoundingClientRect(), w = Math.max(1, Math.floor(r.width || window.innerWidth || 360)), h = Math.max(1, Math.floor(r.height || window.innerHeight || 640));
    const changed = w !== viewW || h !== viewH, oldW = viewW, oldH = viewH;
    if (changed && running) setPaused(true, "Screen changed. Your bricks and power-ups are safe. Continue when you are ready.");
    if (changed) resetInput();
    viewW = w; viewH = h;
    DPR = Math.max(.5, Math.min(2, window.devicePixelRatio || 1, Math.sqrt(3000000 / (w * h))));
    canvas.width = Math.max(1, Math.floor(w * DPR)); canvas.height = Math.max(1, Math.floor(h * DPR)); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (changed) {
      const speedRatio = physicsScale(h) / physicsScale(oldH);
      paddle.x *= w / oldW; paddle.targetX *= w / oldW;
      const g = grid(w, h, boardRows, boardCols);
      for (const b of bricks) Object.assign(b, cell(g, b.row, b.col));
      for (const b of balls) { b.x = clamp(b.x * w / oldW, ballRadius(), w - ballRadius()); b.y = clamp(b.y * h / oldH, ballRadius(), h + ballRadius()); b.r = ballRadius(); b.vx *= speedRatio; b.vy *= speedRatio; b.trail = []; b.touching.clear();
        if (!b.stuck && bricks.some(br => circleRectHit(b.x, b.y, b.r, br.x, br.y, br.w, br.h))) { b.y = g.bottom + b.r + 3; b.vy = Math.abs(b.vy); }
      }
      for (const d of drops) { d.x = clamp(d.x * w / oldW, d.r, w - d.r); d.y *= h / oldH; d.vy = clamp(h * .22, 65, 205); }
      particles = [];
    }
    layoutObjects(); accumulator = 0; lastTick = now();
  }
  function queueResize() { if (resizeQueued) return; resizeQueued = true; requestAnimationFrame(() => { resizeQueued = false; resize(); }); }
  window.addEventListener("resize", queueResize, { passive: true });
  window.addEventListener("orientationchange", queueResize, { passive: true });
  window.visualViewport?.addEventListener("resize", queueResize, { passive: true });

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
  let boardRows = 4, boardCols = 6, accumulator = 0;

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

  function baseBallSpeed() { return Math.min(650, 390 + level * 22) * physicsScale(ch()); }
  function ballRadius() { return clamp(Math.min(cw() * .018, ch() * .026), 5, 9.5); }
  function makeBall(stuck = true, x = paddle.x, y = paddle.y - 22) {
    return { x, y, r: ballRadius(), vx: 0, vy: 0, speed: baseBallSpeed(), stuck, fire: fireballUntil > playNow(), trail: [], touching: new Set() };
  }
  function layoutObjects() {
    paddle.baseW = clamp(cw() * .27, 84, 152); paddle.w = paddle.baseW * (paddle.widenUntil > playNow() ? 1.48 : 1);
    paddle.h = clamp(ch() * .024, 10, 20); paddle.y = ch() - clamp(ch() * .055, 14, 40);
    paddle.x = clamp(paddle.x || cw() / 2, paddle.w / 2 + 8, cw() - paddle.w / 2 - 8);
    paddle.targetX = clamp(paddle.targetX || paddle.x, paddle.w / 2 + 8, cw() - paddle.w / 2 - 8);
    for (const b of balls) if (b.stuck) attachBallToPaddle(b);
  }

  function updateHud() {
    const text = (el, value) => { if (el && el.textContent !== value) el.textContent = value; };
    text(elScore, String(Math.floor(score))); text(elLives, String(lives)); text(elLevel, String(level));
    text($("controlStatus"), toasts[toasts.length - 1]?.msg || (comboCount > 1 ? `Combo x${comboCount}` : "Drag here to steer ↔"));
    text(btnPause, paused ? "Paused / Menu" : "Pause / Menu");
    const disabled = !isPlaying() || !balls.some(b => b.stuck); if (btnLaunch.disabled !== disabled) btnLaunch.disabled = disabled;
  }

  function showPanel(title, text, buttonText = "Start") {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (btnStart) btnStart.textContent = buttonText;
    if (panel) panel.hidden = false;
    syncSettings(); btnRestart.hidden = !running && !gameOver; btnSubmit.hidden = score === 0;
    btnStart.focus?.({ preventScroll: true });
  }
  function hidePanel() { if (panel) panel.hidden = true; canvas.focus?.({ preventScroll: true }); }
  function toast(msg, life = 1.55) { if (toasts.length >= 24) toasts.shift(); toasts.push({ msg, t: life, life }); }

  function attachBallToPaddle(ball) {
    ball.stuck = true;
    ball.vx = 0;
    ball.vy = 0;
    ball.x = paddle.x;
    ball.y = paddle.y - paddle.h / 2 - ball.r - 3;
  }

  function resetGame() {
    resetInput(); stopSounds(); accumulator = 0; playTime = 0;
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

  function isPlaying() { return running && !paused && !gameOver && !GG_PAUSED && !document.hidden; }
  function startGame() {
    if (GG_PAUSED || document.hidden) return;
    ensureAudio(); resetInput(); running = true; paused = false; gameOver = false; hidePanel(); accumulator = 0; lastTick = now(); updateHud();
  }
  function setPaused(value, message = "Your round and power-ups are paused. Continue when you are ready.") {
    if (!running || gameOver) return;
    if (!value && (GG_PAUSED || document.hidden)) return;
    paused = value; resetInput(); accumulator = 0; lastTick = now();
    if (paused) { stopSounds(); showPanel("Paused", message, "Continue"); } else { hidePanel(); ensureAudio(); }
    updateHud();
  }
  function togglePause() { setPaused(!paused); }

  function endGame() {
    resetInput(); stopSounds();
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
    const cols = boardCols = clamp(Math.floor(w / 56), 6, 12);
    const rows = boardRows = clamp(4 + Math.floor(n * .62), 4, 9);
    const g = grid(w, ch(), rows, cols);

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
        const rect = cell(g, r, c);
        let type = "normal";
        let hp = 1;
        if (n >= 3 && Math.random() < 0.14) { type = "heavy"; hp = 2; }
        if (n >= 5 && Math.random() < 0.075) { type = "steel"; hp = 3; }
        if (Math.random() < 0.07 + Math.min(0.04, n * 0.006)) { type = "bonus"; hp = 1; }
        if (n >= 2 && Math.random() < 0.06) { type = "explode"; hp = 1; }
        if (n % 5 === 0 && r === 0 && c >= Math.floor(cols / 2) - 1 && c <= Math.floor(cols / 2) + 1) { type = "boss"; hp = 4 + Math.floor(n / 5); }
        bricks.push({ ...rect, row: r, col: c, hp, maxHp: hp, type, color: pal[(r + c + n) % pal.length], pulse: Math.random() * 10 });
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
    resetInput();
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
  function canvasPoint(e, target = canvas) {
    const r = target.getBoundingClientRect();
    return { x: (e.clientX - r.left) * cw() / Math.max(1, r.width), y: target === canvas ? (e.clientY - r.top) * ch() / Math.max(1, r.height) : 0 };
  }
  function resetInput(stopPaddle = true) {
    const id = pointer.id, target = pointer.target; pointer.id = null; pointer.down = false; pointer.dragging = false; pointer.target = null; keys.clear();
    if (id !== null) try { if (target?.hasPointerCapture?.(id)) target.releasePointerCapture(id); } catch (_) {}
    if (stopPaddle) paddle.targetX = paddle.x;
  }
  function launchBall() {
    if (!isPlaying()) return;
    let launched = false;
    for (const ball of balls) {
      if (!ball.stuck) continue;
      const aim = clamp((pointer.down ? pointer.x : paddle.x) - paddle.x, -paddle.w / 2, paddle.w / 2) / (paddle.w / 2 || 1), sp = baseBallSpeed(), angle = aim * (Math.PI * .28) + rand(-.12, .12);
      ball.vx = Math.sin(angle) * sp; ball.vy = -Math.cos(angle) * sp; ball.stuck = false; launched = true;
    }
    if (launched) { toast("Blast!"); sfx("launch"); updateHud(); }
  }
  for (const target of [canvas, controlZone]) {
    target.addEventListener("pointerdown", e => {
      if (!isPlaying() || pointer.id !== null || e.button !== 0) return;
      e.preventDefault(); ensureAudio(); const p = canvasPoint(e, target);
      pointer.id = e.pointerId; pointer.target = target; pointer.down = true; pointer.dragging = true; pointer.startX = p.x; pointer.startClientX = e.clientX; pointer.startClientY = e.clientY; pointer.tDown = now(); pointer.moved = false; pointer.startPaddle = paddle.x;
      pointer.relative = e.pointerType !== "mouse" && prefs.controlMode === "relative";
      pointer.x = pointer.relative ? paddle.x : p.x; pointer.y = p.y; paddle.targetX = pointer.x;
      try { target.setPointerCapture(e.pointerId); } catch (_) {}
    }, { passive: false });
    const move = e => {
      if (!pointer.down || e.pointerId !== pointer.id || pointer.target !== target || !isPlaying()) return;
      const p = canvasPoint(e, target); pointer.x = clamp(pointer.relative ? pointer.startPaddle + p.x - pointer.startX : p.x, paddle.w / 2 + 8, cw() - paddle.w / 2 - 8); pointer.y = p.y; paddle.targetX = pointer.x;
      if (Math.hypot(e.clientX - pointer.startClientX, e.clientY - pointer.startClientY) >= 12) pointer.moved = true;
    };
    target.addEventListener("pointermove", e => { if (pointer.id !== e.pointerId) return; e.preventDefault(); for (const sample of e.getCoalescedEvents?.() || []) move({ ...sample, pointerId: e.pointerId, clientX: sample.clientX, clientY: sample.clientY }); move(e); }, { passive: false });
    target.addEventListener("pointerup", e => { if (pointer.id !== e.pointerId || pointer.target !== target) return; move(e); const tap = !pointer.moved && now() - pointer.tDown < 240; if (tap) launchBall(); resetInput(false); });
    for (const name of ["pointercancel", "lostpointercapture"]) target.addEventListener(name, e => { if (pointer.id === e.pointerId && pointer.target === target) resetInput(); });
  }
  window.addEventListener("keydown", e => {
    if (e.altKey || e.ctrlKey || e.metaKey || ["INPUT", "SELECT", "TEXTAREA"].includes(e.target?.tagName) || e.target?.isContentEditable) return;
    const key = e.key.toLowerCase(); if (e.target?.tagName === "BUTTON" && [" ", "enter"].includes(key)) return; if (["arrowleft", "arrowright", "a", "d", " ", "enter", "p", "escape"].includes(key)) e.preventDefault();
    if (["arrowleft", "arrowright", "a", "d"].includes(key) && isPlaying()) keys.add(key);
    if (e.repeat) return;
    if (key === "p" || key === "escape") { if (key === "escape") setPaused(true); else togglePause(); }
    if (key === " " || key === "enter") { if (!running && !gameOver) startGame(); else if (!paused) launchBall(); }
    if (key === "r" && isPlaying()) { resetGame(); startGame(); }
  });
  window.addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
  btnStart?.addEventListener("click", () => { if (gameOver) resetGame(); if (!running) startGame(); else if (paused) setPaused(false); });
  function openOverlay() { if (running) setPaused(true); try { window.GG?.openOverlay?.(); } catch (_) {} }
  btnOverlay?.addEventListener("click", openOverlay); btnChat?.addEventListener("click", openOverlay);
  btnPause?.addEventListener("click", togglePause); btnLaunch?.addEventListener("click", launchBall);
  btnRestart?.addEventListener("click", () => { resetGame(); startGame(); });
  btnSubmit?.addEventListener("click", () => { if (running) setPaused(true); submitScore(); openOverlay(); });
  controlMode.addEventListener("change", () => { if (["relative", "direct"].includes(controlMode.value)) prefs.controlMode = controlMode.value; resetInput(); savePrefs(); syncSettings(); });
  btnSound.addEventListener("click", () => { prefs.muted = !prefs.muted; savePrefs(); syncSettings(); });

  // ----------------------------
  // Power-ups
  // ----------------------------
  const POWER_LABELS = { W: "WIDE", S: "SLOW", L: "+1", M: "MULTI", F: "FIRE", K: "STICKY" };
  function maybeDropPowerUp(x, y, force = false) {
    if (!force && Math.random() > 0.18) return;
    const bag = ["W", "S", "M", "F", "K", "L"];
    const type = bag[Math.floor(Math.random() * bag.length)];
    drops.push({ x, y, r: clamp(Math.min(cw() * .025, ch() * .045), 8, 15), vy: clamp(ch() * .22, 65, 205), type, spin: rand(0, Math.PI * 2) });
  }

  function applyPowerUp(type) {
    if (type === "W") {
      paddle.widenUntil = playNow() + 10500;
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
      fireballUntil = playNow() + 8500;
      for (const b of balls) b.fire = true;
      toast("Fire ball");
    } else if (type === "K") {
      stickyUntil = playNow() + 8000;
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
      const sp = Math.max(360 * physicsScale(ch()), Math.hypot(active.vx, active.vy) || baseBallSpeed());
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
    if (prevY + ball.r <= rect.y && ball.vy > 0) { ball.vy = -Math.abs(ball.vy); ball.y = rect.y - ball.r - .01; }
    else if (prevY - ball.r >= rect.y + rect.h && ball.vy < 0) { ball.vy = Math.abs(ball.vy); ball.y = rect.y + rect.h + ball.r + .01; }
    else if (prevX + ball.r <= rect.x && ball.vx > 0) { ball.vx = -Math.abs(ball.vx); ball.x = rect.x - ball.r - .01; }
    else if (prevX - ball.r >= rect.x + rect.w && ball.vx < 0) { ball.vx = Math.abs(ball.vx); ball.x = rect.x + rect.w + ball.r + .01; }
    else {
      const sides = [{d:Math.abs(ball.y + ball.r - rect.y),axis:'y',pos:rect.y - ball.r - .01,sign:-1},{d:Math.abs(rect.y + rect.h - ball.y + ball.r),axis:'y',pos:rect.y + rect.h + ball.r + .01,sign:1},{d:Math.abs(ball.x + ball.r - rect.x),axis:'x',pos:rect.x - ball.r - .01,sign:-1},{d:Math.abs(rect.x + rect.w - ball.x + ball.r),axis:'x',pos:rect.x + rect.w + ball.r + .01,sign:1}];
      sides.sort((a,b)=>a.d-b.d); const hit=sides[0]; ball[hit.axis]=hit.pos; ball['v'+hit.axis]=Math.abs(ball['v'+hit.axis])*hit.sign;
    }
  }

  function normalizeBallSpeed(ball) {
    if (ball.stuck) return;
    const minSp = 310 * physicsScale(ch());
    const maxSp = Math.min(760 * physicsScale(ch()), baseBallSpeed() + 150 * physicsScale(ch()));
    const len = Math.hypot(ball.vx, ball.vy) || 1;
    const sp = clamp(len, minSp, maxSp);
    ball.vx = (ball.vx / len) * sp;
    ball.vy = (ball.vy / len) * sp;
    if (Math.abs(ball.vy) < sp * .18) { ball.vy = (ball.vy < 0 ? -1 : 1) * sp * .18; ball.vx = (ball.vx < 0 ? -1 : 1) * Math.sqrt(sp * sp - ball.vy * ball.vy); }
  }

  function addParticles(x, y, color, count = 8, power = 130) {
    for (let i = 0; i < (reducedMotion ? Math.min(3, count) : count); i++) {
      if (particles.length >= 220) particles.shift();
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
    if (label) toast(comboCount > 1 ? `${label} x${comboCount}` : label, 1.1);
    floatingScore(x, y, `+${award}`);
  }

  function floatingScore(x, y, text) {
    if (particles.length >= 220) particles.shift();
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
    const dt = clamp((t - lastTick) / 1000 || 0, 0, .1); lastTick = t;
    if (isPlaying()) { accumulator += dt; while (accumulator >= 1 / 120) { accumulator -= 1 / 120; step(1 / 120); if (!isPlaying()) { accumulator = 0; break; } } } else accumulator = 0;
    draw(); requestAnimationFrame(loop);
  }

  function step(dt) {
    if (!isPlaying()) return;
    playTime += dt * 1000;
    if (shake > 0) shake = Math.max(0, shake - 34 * dt);
    if (comboTimer > 0) comboTimer = Math.max(0, comboTimer - dt);
    else comboCount = 0;

    if (paddle.widenUntil && playNow() >= paddle.widenUntil) { paddle.widenUntil = 0; paddle.w = paddle.baseW; toast("Normal paddle"); }
    if (fireballUntil && playNow() >= fireballUntil) { fireballUntil = 0; for (const b of balls) b.fire = false; toast("Fire ended"); }
    if (stickyUntil && playNow() >= stickyUntil) stickyUntil = 0;

    movePaddle(dt);
    updateDrops(dt);
    updateParticles(dt);
    updateToasts(dt);

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
    if (keys.has("arrowleft") || keys.has("a")) ax -= 1;
    if (keys.has("arrowright") || keys.has("d")) ax += 1;
    if (ax) { paddle.x += ax * clamp(cw() * 1.6, 460, 900) * dt; paddle.targetX = paddle.x; }
    else paddle.x += (paddle.targetX - paddle.x) * (1 - Math.exp(-26 * dt));
    paddle.x = clamp(paddle.x, paddle.w / 2 + 8, cw() - paddle.w / 2 - 8);
    paddle.targetX = clamp(paddle.targetX, paddle.w / 2 + 8, cw() - paddle.w / 2 - 8);
    for (const b of balls) if (b.stuck) attachBallToPaddle(b);
  }

  function updateBall(ball, ballIndex, dt) {
    if (ball.stuck) return;
    for (const br of ball.touching) if (!bricks.includes(br) || !circleRectHit(ball.x, ball.y, ball.r, br.x, br.y, br.w, br.h)) ball.touching.delete(br);
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
      if (stickyUntil > playNow()) { attachBallToPaddle(ball); sfx("paddle"); return; }
      const hit = clamp((ball.x - paddle.x) / (paddle.w / 2), -1, 1);
      const sp = Math.max(330 * physicsScale(ch()), Math.hypot(ball.vx, ball.vy));
      const angle = hit * (Math.PI * 0.39);
      ball.vx = Math.sin(angle) * sp;
      ball.vy = -Math.cos(angle) * sp;
      ball.y = pr.y - ball.r - 1;
      sfx("paddle");
    }

    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (!circleRectHit(ball.x, ball.y, ball.r, b.x, b.y, b.w, b.h) || ball.touching.has(b)) continue;
      ball.touching.add(b);
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
    if (!reducedMotion && shake > 0) ctx.translate(rand(-shake, shake), rand(-shake, shake));

    drawBackground(w, h);
    drawBricks();
    drawDrops();
    drawPaddle();
    drawBalls();
    drawParticles();
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

    const t = reducedMotion ? 0 : playNow() / 1000;
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
      ctx.beginPath(); ctx.roundRect(b.x + 2, b.y + Math.min(2, b.h * .15), b.w - 4, Math.max(1, b.h * .25), r * .7); ctx.fill();
      ctx.globalAlpha = 1;
      if (b.hp > 1 && b.h >= 14 && b.w >= 30) {
        ctx.fillStyle = "rgba(0,0,0,.52)";
        ctx.beginPath(); ctx.roundRect(b.x + b.w - 22, b.y + 4, 16, 12, 6); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.9)";
        ctx.font = "900 10px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(b.hp), b.x + b.w - 14, b.y + 10.5);
      }
      if (b.hp > 1 && b.h < 14) { ctx.fillStyle = "#fff"; for (let i = 0; i < Math.min(5, b.hp); i++) ctx.fillRect(b.x + 3 + i * 4, b.y + b.h / 2 - 1, 2, 2); }
      if (b.type === "explode" && b.h >= 12) {
        ctx.fillStyle = "rgba(255,255,255,.78)";
        ctx.font = "900 13px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✦", b.x + b.w / 2, b.y + b.h / 2 + 1);
      }
      if (b.type === "bonus" && b.h >= 12) {
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
    if (stickyUntil > playNow()) {
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
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(queueResize).observe(canvas.parentElement);
  requestAnimationFrame(loop);
})();
