/* Fruit Slice — GloryGames (mobile-first)
   - Swipe to slice fruit
   - Avoid bombs
   - Combos reward fast slices
   - WebAudio SFX (no external files)
   - Platform Bridge: GG_PAUSE / GG_MUTE / GG_RESTART / GG_SCORE
*/

(() => {
  // ------------------------------------------------------
  // DOM (IDs aligned with your index.html)
  // ------------------------------------------------------
  const canvas = document.getElementById("c");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });

  const $ = (id) => document.getElementById(id);

  // HUD
  const elScore = $("score");
  const elLives = $("lives");
  const elCombo = $("level"); // in your HTML "level" is used as combo

  // Title/sub (optional)
  const elTitle = $("ggTitle");
  const elSub = $("ggSub");

  // Panel
  const panel = $("panel");
  const panelTitle = $("panelTitle");
  const panelText = $("panelText");
  const btnStart = $("btnStart");
  const btnOverlay = $("btnOverlay");

  // Hidden compatibility buttons (exist in your HTML)
  const btnPause = $("btnPause");
  const btnLaunch = $("btnLaunch");
  const btnSubmit = $("btnSubmit");
  const btnRestart = $("btnRestart");
  const btnChat = $("btnChat");

  const GAME_SLUG = "fruit-slice";

  // Keep the default panel copy from HTML (so it stays in sync)
  const DEFAULT_PANEL_TITLE = (panelTitle?.textContent || "Fruit Slice").trim();
  const DEFAULT_PANEL_TEXT = (panelText?.textContent || "").trim();

  // Make canvas mobile-friendly (no scroll/zoom while swiping)
  canvas.style.touchAction = "none";

  // ------------------------------------------------------
  // Platform bridge state
  // ------------------------------------------------------
  let GG_PAUSED = false;
  let GG_MUTED = false;
  let GG_LAST_TICK_TS = performance.now();

  function ggToast(text) {
    try {
      window.parent?.postMessage?.({ type: "GG_TOAST", text }, window.location.origin);
    } catch {}
  }

  /**
   * Live-score message (updates sidebar live score).
   * This is intentionally a simple postMessage.
   */
  function ggPostLiveScore(scoreValue) {
    const s = Math.max(0, scoreValue | 0);
    try {
      window.parent?.postMessage?.(
        {
          type: "GG_SCORE",
          gameSlug: GAME_SLUG,
          score: s,
          mode: "live",
          payload: { value: s, mode: "live", live: true },
        },
        window.location.origin
      );
    } catch {}
  }

  /**
   * ✅ FIX: Final score submit (updates & persists top score)
   * Prefer window.GG.endRound / submitScore so server updates + sidebar refresh events happen.
   * Fallback to postMessage with canonical fields.
   */
  function ggSubmitFinalScore(scoreValue, mode = "global") {
    const s = Math.max(0, scoreValue | 0);

    const gg = window.GG;

    // 1) Preferred (daily-aware / server-backed)
    if (gg && typeof gg.endRound === "function") {
      try {
        gg.endRound(s, { gameSlug: GAME_SLUG, mode });
        return true;
      } catch {}
      try {
        gg.endRound({ gameSlug: GAME_SLUG, score: s, mode });
        return true;
      } catch {}
      try {
        gg.endRound(s);
        return true;
      } catch {}
    }

    // 2) Older signatures
    if (gg && typeof gg.submitScore === "function") {
      try {
        gg.submitScore({ gameSlug: GAME_SLUG, score: s, mode });
        return true;
      } catch {}
      try {
        gg.submitScore(s, GAME_SLUG);
        return true;
      } catch {}
      try {
        gg.submitScore(s);
        return true;
      } catch {}
    }

    // 3) Direct same-origin API fallback.
    // This makes the game work even when opened directly at /games/fruit-slice/index.html
    // and also helps if the parent bridge attaches late.
    try {
      fetch(`/api/games/${encodeURIComponent(GAME_SLUG)}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          score: s,
          mode,
          playerName:
            localStorage.getItem("gg_player_name") ||
            localStorage.getItem("playerName") ||
            "Player",
        }),
      }).catch(() => {});
    } catch {}

    // 3) Last resort: postMessage (may only update live score on some hosts)
    try {
      window.parent?.postMessage?.(
        {
          type: "GG_SCORE",
          gameSlug: GAME_SLUG,
          score: s,
          mode,
          payload: { value: s, mode },
        },
        window.location.origin
      );
      return true;
    } catch {}

    return false;
  }

  function ggRestart() {
    if (typeof window.resetGame === "function") {
      window.resetGame();
      ggToast("Restarted");
      return;
    }
    location.reload();
  }

  window.addEventListener("message", (ev) => {
    if (ev.origin !== window.location.origin) return;
    const data = ev.data;
    if (!data || typeof data !== "object") return;

    const { type, payload } = data;

    if (type === "GG_PAUSE") {
      GG_PAUSED = !!payload?.paused;
      GG_LAST_TICK_TS = performance.now();
    }

    if (type === "GG_MUTE") {
      GG_MUTED = !!payload?.muted;
      ggSetMuted(GG_MUTED);
    }

    if (type === "GG_RESTART") {
      ggRestart();
    }
  });

  // Auto-pause when app tab is backgrounded (mobile)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      GG_PAUSED = true;
    } else {
      GG_PAUSED = false;
      GG_LAST_TICK_TS = performance.now();
    }
  });

  // Tell host which game is running
  try {
    window.GG?.setSlug?.(GAME_SLUG);
  } catch {}

  // ------------------------------------------------------
  // SFX (WebAudio)
  // ------------------------------------------------------
  let GG_SFX_CTX = null;
  let GG_SFX_MASTER = null;

  function ggEnsureAudio() {
    if (GG_MUTED) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;

    if (!GG_SFX_CTX) {
      GG_SFX_CTX = new AC();
      GG_SFX_MASTER = GG_SFX_CTX.createGain();
      GG_SFX_MASTER.gain.value = 0.14;
      GG_SFX_MASTER.connect(GG_SFX_CTX.destination);
    }

    if (GG_SFX_CTX.state === "suspended") GG_SFX_CTX.resume().catch(() => {});
    return GG_SFX_CTX;
  }

  function ggSetMuted(muted) {
    if (GG_SFX_MASTER) GG_SFX_MASTER.gain.value = muted ? 0 : 0.14;
  }

  function ggTone({ f = 440, d = 0.08, t = 0, type = "sine", v = 0.6 }) {
    if (GG_MUTED) return;
    const ac = ggEnsureAudio();
    if (!ac) return;
    const now = ac.currentTime + t;

    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(f, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + d);

    osc.connect(gain);
    gain.connect(GG_SFX_MASTER);

    osc.start(now);
    osc.stop(now + d + 0.02);
  }

  function sfx(name) {
    if (name === "slice") {
      ggTone({ f: 740, d: 0.05, type: "triangle", v: 0.7 });
      ggTone({ f: 980, d: 0.05, t: 0.02, type: "triangle", v: 0.55 });
      return;
    }
    if (name === "combo") {
      ggTone({ f: 920, d: 0.06, type: "sine", v: 0.7 });
      ggTone({ f: 1240, d: 0.06, t: 0.03, type: "sine", v: 0.55 });
      return;
    }
    if (name === "miss") {
      ggTone({ f: 190, d: 0.07, type: "sawtooth", v: 0.55 });
      ggTone({ f: 130, d: 0.11, t: 0.06, type: "sine", v: 0.55 });
      return;
    }
    if (name === "boom") {
      ggTone({ f: 120, d: 0.16, type: "sawtooth", v: 0.65 });
      ggTone({ f: 80, d: 0.2, t: 0.08, type: "sine", v: 0.65 });
      return;
    }
    if (name === "start") {
      ggTone({ f: 320, d: 0.04, type: "triangle", v: 0.6 });
      ggTone({ f: 520, d: 0.05, t: 0.05, type: "triangle", v: 0.65 });
      return;
    }
    if (name === "gameover") {
      ggTone({ f: 220, d: 0.1, type: "sawtooth", v: 0.55 });
      ggTone({ f: 160, d: 0.14, t: 0.1, type: "sine", v: 0.55 });
      ggTone({ f: 110, d: 0.18, t: 0.22, type: "sine", v: 0.5 });
      return;
    }
  }

  // Unlock audio on first user interaction
  function unlockAudioOnce() {
    ggEnsureAudio();
    window.removeEventListener("pointerdown", unlockAudioOnce);
    window.removeEventListener("touchstart", unlockAudioOnce);
    window.removeEventListener("mousedown", unlockAudioOnce);
  }
  window.addEventListener("pointerdown", unlockAudioOnce, { once: true, passive: true });
  window.addEventListener("touchstart", unlockAudioOnce, { once: true, passive: true });
  window.addEventListener("mousedown", unlockAudioOnce, { once: true, passive: true });

  // ------------------------------------------------------
  // Game state
  // ------------------------------------------------------
  let W = 1,
    H = 1,
    DPR = 1;

  let running = false;
  let score = 0;
  let lives = 3;

  let combo = 0;
  let comboWindowMs = 850;
  let lastSliceAt = 0;

  let best = 0;
  let finalSubmitted = false;

  const FRUITS = [
    { name: "apple", color: "#ff4d6d" },
    { name: "lime", color: "#32d583" },
    { name: "orange", color: "#ffb020" },
    { name: "berry", color: "#7c5cff" },
  ];

  const objects = []; // fruit/bomb entities
  const splats = []; // slice particles

  // swipe trail
  const trail = [];
  const MAX_TRAIL = 14;
  let pointerDown = false;

  function resize() {
    const r = canvas.parentElement?.getBoundingClientRect?.() || { width: innerWidth, height: innerHeight };
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.floor(r.width));
    H = Math.max(1, Math.floor(r.height));
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });

  function updateHUD() {
    if (elScore) elScore.textContent = String(score);
    if (elLives) elLives.textContent = String(lives);
    if (elCombo) elCombo.textContent = String(combo);
    // live score to sidebar
    ggPostLiveScore(score);
  }

  function showPanel(t, body) {
    if (!panel) return;
    panel.style.display = "flex";
    if (panelTitle) panelTitle.textContent = t;
    if (panelText) panelText.textContent = body;
  }

  function hidePanel() {
    if (!panel) return;
    panel.style.display = "none";
  }

  function resetGame() {
    running = true;
    score = 0;
    lives = 3;
    combo = 0;
    lastSliceAt = 0;
    best = Math.max(best | 0, 0);
    finalSubmitted = false;

    objects.length = 0;
    splats.length = 0;
    trail.length = 0;

    // let host know again (some bridges attach late)
    try {
      window.GG?.setSlug?.(GAME_SLUG);
    } catch {}

    spawnBurst(2, false);
    updateHUD();
    hidePanel();
    sfx("start");
  }
  window.resetGame = resetGame;

  function endGame(reason = "Game Over") {
    running = false;

    // Update best from this run
    if (score > best) best = score;

    showPanel(
      reason,
      `Score: ${score}\nBest: ${best}\n\nTip: Quick slices build combos ⚡.\nAvoid bombs 💣.`
    );

    sfx("gameover");

    // ✅ FINAL SUBMIT (this is what updates top score in the sidebar)
    if (!finalSubmitted) {
      finalSubmitted = true;
      ggSubmitFinalScore(score, "global");
    }
  }

  // ------------------------------------------------------
  // Spawn
  // ------------------------------------------------------
  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function spawnOne(isBomb) {
    const x = rand(W * 0.15, W * 0.85);
    const y = H + rand(20, 90);
    const vx = rand(-110, 110);
    const vy = -rand(520, 760);
    const g = rand(860, 1040);

    const r = isBomb ? rand(18, 24) : rand(18, 26);
    const fruit = FRUITS[(Math.random() * FRUITS.length) | 0];

    objects.push({
      kind: isBomb ? "bomb" : "fruit",
      x,
      y,
      vx,
      vy,
      g,
      r,
      color: isBomb ? "#111827" : fruit.color,
      rim: isBomb ? "#ef4444" : "rgba(255,255,255,0.35)",
      sliced: false,
      value: isBomb ? 0 : r > 23 ? 18 : 14,
      t: 0,
    });
  }

  function spawnBurst(n = 3, allowBomb = true) {
    const bombs = allowBomb && Math.random() < 0.24 ? 1 : 0;
    for (let i = 0; i < n; i++) spawnOne(false);
    for (let i = 0; i < bombs; i++) spawnOne(true);
  }

  function spawnLogic(nowMs) {
    // Difficulty ramps with score
    const base = 850;
    const rate = Math.max(420, base - score * 1.2);
    const burstChance = Math.min(0.55, 0.22 + score / 2200);

    if (!spawnLogic.nextAt) spawnLogic.nextAt = nowMs + 500;
    if (nowMs >= spawnLogic.nextAt) {
      const burst = Math.random() < burstChance;
      spawnBurst(burst ? 4 : 2, true);
      spawnLogic.nextAt = nowMs + rate;
    }
  }
  spawnLogic.nextAt = 0;

  // ------------------------------------------------------
  // Input + slicing
  // ------------------------------------------------------
  function addTrailPoint(x, y, t) {
    trail.push({ x, y, t });
    while (trail.length > MAX_TRAIL) trail.shift();
  }

  function clearTrail() {
    trail.length = 0;
  }

  function pointLineDist(px, py, ax, ay, bx, by) {
    const abx = bx - ax,
      aby = by - ay;
    const apx = px - ax,
      apy = py - ay;
    const ab2 = abx * abx + aby * aby;
    const tt = ab2 ? Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2)) : 0;
    const cx = ax + abx * tt,
      cy = ay + aby * tt;
    const dx = px - cx,
      dy = py - cy;
    return Math.hypot(dx, dy);
  }

  function trySliceSegment(ax, ay, bx, by, nowMs) {
    for (const o of objects) {
      if (o.sliced) continue;
      const d = pointLineDist(o.x, o.y, ax, ay, bx, by);
      if (d <= o.r + 8) sliceObject(o, nowMs);
    }
  }

  function sliceObject(o, nowMs) {
    o.sliced = true;

    // combo window
    if (nowMs - lastSliceAt <= comboWindowMs) {
      combo += 1;
      if (combo > 1) sfx("combo");
    } else {
      combo = 1;
    }
    lastSliceAt = nowMs;

    if (o.kind === "bomb") {
      sfx("boom");
      updateHUD();
      endGame("💣 Boom!");
      return;
    }

    // score + splat
    const gain = o.value + Math.min(12, (combo - 1) * 2);
    score += gain;
    if (score > best) best = score;

    sfx("slice");

    splats.push({
      x: o.x,
      y: o.y,
      r: o.r,
      color: o.color,
      t: 0.0,
    });

    updateHUD();
  }

  function canvasPos(ev) {
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left) * (W / rect.width);
    const y = (ev.clientY - rect.top) * (H / rect.height);
    return { x, y };
  }

  canvas.addEventListener("pointerdown", (ev) => {
    if (!running) return;
    pointerDown = true;
    canvas.setPointerCapture?.(ev.pointerId);
    const p = canvasPos(ev);
    addTrailPoint(p.x, p.y, performance.now());
  });

  canvas.addEventListener("pointermove", (ev) => {
    if (!running || !pointerDown) return;
    const t = performance.now();
    const p = canvasPos(ev);

    const last = trail[trail.length - 1];
    if (last) {
      trySliceSegment(last.x, last.y, p.x, p.y, t);
    }

    addTrailPoint(p.x, p.y, t);
  });

  function endPointer(ev) {
    pointerDown = false;
    try {
      canvas.releasePointerCapture?.(ev.pointerId);
    } catch {}
    clearTrail();
  }

  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);

  // ------------------------------------------------------
  // Step + draw
  // ------------------------------------------------------
  function step(dt, nowMs) {
    if (!running) return;

    spawnLogic(nowMs);

    // update objects
    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];
      o.t += dt;

      o.vy += o.g * dt;
      o.x += o.vx * dt;
      o.y += o.vy * dt;

      // drift bounds
      if (o.x < -80 || o.x > W + 80) o.vx *= -0.85;

      // fell off bottom
      if (o.y > H + 120) {
        objects.splice(i, 1);

        // missed fruit costs life
        if (o.kind === "fruit" && !o.sliced) {
          lives -= 1;
          combo = 0;
          sfx("miss");
          updateHUD();
          if (lives <= 0) endGame("Out of Lives");
        }
      }
    }

    // splats fade
    for (let i = splats.length - 1; i >= 0; i--) {
      const s = splats[i];
      s.t += dt;
      if (s.t > 0.35) splats.splice(i, 1);
    }

    // trail decay
    const now = performance.now();
    for (let i = trail.length - 1; i >= 0; i--) {
      if (now - trail[i].t > 120) trail.splice(i, 1);
    }
  }

  function draw() {
    // background
    ctx.fillStyle = "#070a12";
    ctx.fillRect(0, 0, W, H);

    // subtle glow
    const g = ctx.createRadialGradient(W * 0.4, H * 0.25, 20, W * 0.4, H * 0.25, Math.max(W, H));
    g.addColorStop(0, "rgba(124,92,255,0.16)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // splats
    for (const s of splats) {
      const a = Math.max(0, 1 - s.t / 0.35);
      ctx.fillStyle = s.color.replace(")", `,${0.18 * a})`).includes("rgba") ? s.color : `rgba(255,255,255,${0.12 * a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * (1.4 + s.t * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }

    // objects
    for (const o of objects) {
      if (o.sliced) continue;

      // body
      ctx.fillStyle = o.color;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();

      // rim
      ctx.strokeStyle = o.rim;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r - 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // bomb icon
      if (o.kind === "bomb") {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "bold 14px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("💣", o.x, o.y + 1);
      }
    }

    // trail
    if (trail.length >= 2) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.strokeStyle = "rgba(124,92,255,0.9)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();

      ctx.strokeStyle = "rgba(35,194,255,0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }

    // paused overlay inside the game (platform also shows one, but this makes iframe obvious)
    if (GG_PAUSED) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "900 18px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Paused", W / 2, H / 2);
    }
  }

  // ------------------------------------------------------
  // Loop
  // ------------------------------------------------------
  function loop(now) {
    if (GG_PAUSED) {
      GG_LAST_TICK_TS = now;
      requestAnimationFrame(loop);
      draw();
      return;
    }

    const dt = Math.min(0.033, (now - GG_LAST_TICK_TS) / 1000);
    GG_LAST_TICK_TS = now;

    step(dt, now);
    draw();

    requestAnimationFrame(loop);
  }

  // ------------------------------------------------------
  // UI wiring (fixed + guarded)
  // ------------------------------------------------------
  function showHowTo() {
    showPanel(DEFAULT_PANEL_TITLE, DEFAULT_PANEL_TEXT || "Swipe to slice fruit.\nAvoid bombs 💣.\nChain combos ⚡.\n\nTap Start.");
  }

  function toggleHowTo() {
    if (!panel) return;
    const visible = panel.style.display !== "none" && panel.style.display !== "";
    if (!visible) {
      // If game is running, pause while showing help (better UX)
      if (running) GG_PAUSED = true;
      showHowTo();
      return;
    }
    // If visible, keep it visible; Start will close it (prevents confusion)
    showHowTo();
  }

  if (btnStart) {
    btnStart.onclick = () => {
      // resume from help/pause
      if (!running) resetGame();
      GG_PAUSED = false;
      hidePanel();
    };
  }

  if (btnOverlay) {
    btnOverlay.onclick = () => toggleHowTo();
  }

  // Hidden buttons for platform compatibility
  if (btnPause) btnPause.onclick = () => (GG_PAUSED = !GG_PAUSED);
  if (btnLaunch) btnLaunch.onclick = () => {
    if (!running) resetGame();
    GG_PAUSED = false;
    hidePanel();
  };
  if (btnRestart) btnRestart.onclick = () => ggRestart();
  if (btnSubmit) btnSubmit.onclick = () => ggSubmitFinalScore(best || score, "global");
  if (btnChat) btnChat.onclick = () => ggToast("Chat coming soon");

  // ------------------------------------------------------
  // Init
  // ------------------------------------------------------
  function init() {
    resize();

    // Keep title/sub if present
    if (elTitle) elTitle.textContent = DEFAULT_PANEL_TITLE || "Fruit Slice";
    if (elSub && !elSub.textContent.trim()) elSub.textContent = "Swipe to slice • Avoid bombs • Chain combos";

    try {
      window.GG?.setSlug?.(GAME_SLUG);
    } catch {}

    // Show initial panel from HTML (so IDs/classes align)
    showHowTo();
    updateHUD();

    requestAnimationFrame((t) => {
      GG_LAST_TICK_TS = t;
      requestAnimationFrame(loop);
    });
  }

  init();
})();
