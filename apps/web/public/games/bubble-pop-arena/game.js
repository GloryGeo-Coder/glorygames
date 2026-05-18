(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });

  // HUD
  const elScore = document.getElementById("score");
  const elTime = document.getElementById("time");
  const elCombo = document.getElementById("combo");
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
  const btnSubmit = document.getElementById("btnSubmit");
  const btnRestart = document.getElementById("btnRestart");
  const btnChat = document.getElementById("btnChat");

  // Prevent mobile scroll/zoom on canvas interactions
  if (canvas) canvas.style.touchAction = "none";

  // Meta
  let META = { title: "Bubble Pop Arena", description: "" };
  async function loadMeta() {
    try {
      const res = await fetch("./game.json", { cache: "no-store" });
      META = (await res.json()) || META;

      const title = META.title || "Bubble Pop Arena";
      document.title = title;

      if (elTitle) elTitle.textContent = title;
      if (panelTitle) panelTitle.textContent = title;
      if (META.description && panelText) panelText.textContent = META.description;
      if (elSub) elSub.textContent = "Tap bubbles • Build combos • Avoid bombs";

      window.GG?.init?.({ title });
    } catch {
      // ignore
    }
  }
  loadMeta();

  // Canvas resize
  let DPR = 1;
  function resize() {
    const cssW = Math.max(1, canvas.clientWidth || window.innerWidth);
    const cssH = Math.max(1, canvas.clientHeight || window.innerHeight);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(cssW * DPR);
    canvas.height = Math.floor(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  requestAnimationFrame(() => {
    resize();
    window.addEventListener("resize", resize, { passive: true });
  });

  function cw() {
    return canvas.clientWidth || 360;
  }
  function ch() {
    return canvas.clientHeight || 640;
  }

  // Helpers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);

  // State
  let running = false;
  let paused = false;
  let gameOver = false;

  let score = 0;
  let combo = 0;
  let timeLeft = 30.0;

  // combo timing
  let comboWindow = 0; // time left to keep combo alive

  // entities
  let bubbles = []; // {x,y,r,vx,vy,type,ttl}
  let particles = []; // {x,y,vx,vy,t,color,r}

  let spawnT = 0;

  const BEST_KEY = "gg_bubble_pop_best";
  let best = Number(localStorage.getItem(BEST_KEY) || "0") || 0;

  // ---- Sidebar score reporting (LIVE) ----
  const GAME_SLUG = "bubble-pop-arena";
  let lastReportedScore = -1;
  let lastReportAt = 0;

  function reportScoreLive(force = false) {
    const now = performance.now();
    if (!force) {
      if (score === lastReportedScore) return;
      // throttle a bit so we don't spam messages on rapid taps
      if (now - lastReportAt < 80) return;
    }

    lastReportedScore = score;
    lastReportAt = now;

    // 1) If your platform provides a GG bridge method:
    try {
      window.GG?.setScore?.(score | 0);
    } catch {}

    // 2) Fallback: postMessage for the parent (Play page / sidebar)
    try {
      window.parent?.postMessage?.({ type: "gg:score", slug: GAME_SLUG, score: score | 0 }, "*");
    } catch {}

    // 3) Local event (useful for debugging inside iframe)
    try {
      window.dispatchEvent(new CustomEvent("gg:score", { detail: { slug: GAME_SLUG, score: score | 0 } }));
    } catch {}
  }

  function updateHud() {
    if (elScore) elScore.textContent = String(score | 0);
    if (elCombo) elCombo.textContent = String(combo | 0);
    if (elTime) elTime.textContent = String(Math.max(0, timeLeft).toFixed(1));
    reportScoreLive(false);
  }

  function showPanel(title, text) {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (panel) panel.style.display = "flex";
  }
  function hidePanel() {
    if (panel) panel.style.display = "none";
  }

  let submitted = false;
  function submitScore() {
    if (submitted) return;
    submitted = true;

    // ensure sidebar has latest score before submit
    reportScoreLive(true);

    // platform submit (leaderboard / daily)
    window.GG?.submitScore?.(score | 0);
  }

  function resetGame() {
    running = false;
    paused = false;
    gameOver = false;
    submitted = false;

    score = 0;
    combo = 0;
    timeLeft = 30.0;
    comboWindow = 0;

    bubbles = [];
    particles = [];
    spawnT = 0;

    lastReportedScore = -1;
    updateHud();

    showPanel(
      META.title || "Bubble Pop Arena",
      META.description || "Pop bubbles for points. Avoid bombs!"
    );
  }

  function startGame() {
    running = true;
    paused = false;
    gameOver = false;
    submitted = false;

    score = 0;
    combo = 0;
    timeLeft = 30.0;
    comboWindow = 0;

    bubbles = [];
    particles = [];
    spawnT = 0;

    lastReportedScore = -1;

    hidePanel();
    updateHud();
  }

  function togglePause() {
    if (!running || gameOver) return;
    paused = !paused;
    if (paused) showPanel("Paused", "Tap Start to resume.");
    else hidePanel();
  }

  function endGame(reason) {
    gameOver = true;
    running = false;
    paused = false;

    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
    }

    showPanel(
      "Round Over",
      `${reason}\n\nScore: ${score} • Best: ${best}\nTap Start to play again.`
    );

    // Auto-submit once (so sidebar + leaderboard update)
    submitScore();
  }

  function popParticles(x, y, baseColor, count = 16) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: rnd(-220, 220),
        vy: rnd(-260, 80),
        t: rnd(0.35, 0.8),
        r: rnd(1.6, 3.2),
        color: baseColor
      });
    }
  }

  function bubbleColor(type) {
    if (type === "bomb") return "rgba(244,63,94,0.90)";
    if (type === "time") return "rgba(250,204,21,0.92)";
    return "rgba(59,130,246,0.90)";
  }

  function spawnBubble() {
    const w = cw();
    const h = ch();

    const r = rnd(18, 44);
    const x = rnd(r + 10, w - r - 10);
    const y = h + r + 20;

    const baseUp = rnd(90, 160);
    const vy = -baseUp - score * 0.002; // slight ramp
    const vx = rnd(-28, 28);

    // types: normal, time, bomb
    const roll = Math.random();
    let type = "normal";
    if (roll < 0.08) type = "bomb";
    else if (roll < 0.16) type = "time";

    // ttl (seconds) - miss window
    const ttl = rnd(2.6, 4.0);

    bubbles.push({ x, y, r, vx, vy, type, ttl });
  }

  function multiplierForCombo(c) {
    if (c >= 12) return 2.0;
    if (c >= 7) return 1.5;
    if (c >= 3) return 1.25;
    return 1.0;
  }

  function onPop(b) {
    if (b.type === "bomb") {
      // bomb resets combo and penalizes
      combo = 0;
      comboWindow = 0;
      score = Math.max(0, score - 35);
      popParticles(b.x, b.y, bubbleColor("bomb"), 24);
      return;
    }

    // keep combo alive
    combo += 1;
    comboWindow = 1.15; // seconds window to keep combo alive

    const mult = multiplierForCombo(combo);
    const base = Math.round(10 + b.r * 0.45);
    const gained = Math.round(base * mult);

    score += gained;
    popParticles(b.x, b.y, bubbleColor(b.type), 18);

    // time bubble adds time bonus
    if (b.type === "time") {
      timeLeft += 2.0;
      popParticles(b.x, b.y, bubbleColor("time"), 10);
    }
  }

  // Input: tap to pop
  function canvasPointFromClient(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  function tryPopAt(px, py) {
    if (!running || paused || gameOver) return;

    // find nearest bubble under finger
    let bestI = -1;
    let bestD2 = 1e18;

    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const dx = px - b.x;
      const dy = py - b.y;
      const d2 = dx * dx + dy * dy;

      const rr = b.r + 10; // forgiveness
      if (d2 <= rr * rr && d2 < bestD2) {
        bestD2 = d2;
        bestI = i;
      }
    }

    if (bestI >= 0) {
      const b = bubbles[bestI];
      bubbles.splice(bestI, 1);
      onPop(b);
      updateHud();
    }
  }

  // Pointer events (mobile + desktop)
  function onPointerDown(e) {
    e.preventDefault?.();
    const p = canvasPointFromClient(e.clientX, e.clientY);

    // If not running, Start is the main action (but allow tap-to-start too)
    if (!running && !gameOver) {
      startGame();
      return;
    }

    // If game over, start again
    if (gameOver) {
      startGame();
      return;
    }

    tryPopAt(p.x, p.y);
  }

  canvas.addEventListener("pointerdown", onPointerDown, { passive: false });

  // Buttons
  if (btnStart) {
    btnStart.addEventListener("click", () => {
      if (gameOver) startGame();
      else if (!running) startGame();
      else if (paused) togglePause();
      else togglePause();
    });
  }

  if (btnPause) btnPause.addEventListener("click", togglePause);

  if (btnRestart) {
    btnRestart.addEventListener("click", () => {
      resetGame();
      startGame();
    });
  }

  if (btnSubmit) btnSubmit.addEventListener("click", submitScore);

  if (btnOverlay) btnOverlay.addEventListener("click", () => window.GG?.openOverlay?.());

  if (btnChat) btnChat.addEventListener("click", () => window.GG?.openChat?.());

  // Keyboard helper (desktop)
  window.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (gameOver) startGame();
      else if (!running) startGame();
      else if (paused) togglePause();
      return;
    }
    if (e.key.toLowerCase() === "p") togglePause();
  });

  // Loop
  let lastT = performance.now();
  function loop(t) {
    const dt = Math.min(0.033, Math.max(0.001, (t - lastT) / 1000));
    lastT = t;

    update(dt);
    draw();

    requestAnimationFrame(loop);
  }

  function update(dt) {
    if (!running || paused || gameOver) return;

    // time
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateHud();
      endGame("Time’s up!");
      return;
    }

    // combo decay
    if (comboWindow > 0) comboWindow -= dt;
    if (comboWindow <= 0 && combo !== 0) {
      combo = 0;
      comboWindow = 0;
    }

    // spawn bubbles
    spawnT += dt;
    const spawnEvery = clamp(0.58 - (score * 0.00002), 0.34, 0.58);
    while (spawnT >= spawnEvery) {
      spawnT -= spawnEvery;
      spawnBubble();
    }

    // update bubbles
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.ttl -= dt;

      // bounce lightly on edges
      if (b.x < b.r + 6) {
        b.x = b.r + 6;
        b.vx *= -0.8;
      } else if (b.x > cw() - b.r - 6) {
        b.x = cw() - b.r - 6;
        b.vx *= -0.8;
      }

      // expired/missed
      const offTop = b.y + b.r < -30;
      if (b.ttl <= 0 || offTop) {
        // missing a normal/time bubble breaks combo (bomb just disappears)
        if (b.type !== "bomb") {
          combo = 0;
          comboWindow = 0;
        }
        bubbles.splice(i, 1);
      }
    }

    // particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t -= dt;
      if (p.t <= 0) {
        particles.splice(i, 1);
        continue;
      }
      p.vy += 520 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    updateHud();
  }

  function drawBackground() {
    const w = cw();
    const h = ch();

    // base
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, w, h);

    // glow blobs
    ctx.save();
    const grad = ctx.createRadialGradient(w * 0.25, h * 0.2, 0, w * 0.25, h * 0.2, Math.max(w, h) * 0.9);
    grad.addColorStop(0, "rgba(59,130,246,0.18)");
    grad.addColorStop(0.6, "rgba(168,85,247,0.12)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // subtle grid
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
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
  }

  function drawParticles() {
    for (const p of particles) {
      const a = clamp(p.t * 1.6, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBubble(b) {
    const col = bubbleColor(b.type);

    // glow
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = 20;

    // bubble body
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();

    // inner shine
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.28, b.y - b.r * 0.28, b.r * 0.40, 0, Math.PI * 2);
    ctx.fill();

    // icon
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.font = `1000 ${Math.max(12, b.r * 0.65)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const icon = b.type === "bomb" ? "💣" : b.type === "time" ? "⏱" : "";
    if (icon) ctx.fillText(icon, b.x, b.y + 1);

    ctx.restore();
  }

  function draw() {
    drawBackground();

    // bubbles
    for (const b of bubbles) drawBubble(b);

    // particles
    drawParticles();

    // hint overlay if idle
    if (!running && !gameOver) {
      const w = cw();
      const h = ch();
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "1000 18px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Tap Start (or tap screen) to begin", w * 0.5, h * 0.45);

      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.font = "900 14px system-ui";
      ctx.fillText("Tap bubbles to POP • Avoid red bombs", w * 0.5, h * 0.62);
      ctx.restore();
    }
  }

  // Init
  updateHud();
  resetGame();
  requestAnimationFrame(loop);
})();
