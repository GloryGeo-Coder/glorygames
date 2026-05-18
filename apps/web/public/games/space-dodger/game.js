(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });

  // HUD
  const elScore = document.getElementById("score");
  const elBest = document.getElementById("best");
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

  // ---- Meta (game.json) ----
  let META = { title: "Space Dodger", description: "", tags: [] };

  async function loadMeta() {
    try {
      const res = await fetch("./game.json", { cache: "no-store" });
      const meta = await res.json();
      META = meta || META;

      const title = META.title || "Space Dodger";
      document.title = title;

      if (elTitle) elTitle.textContent = title;
      if (panelTitle) panelTitle.textContent = title;

      if (META.description && panelText) panelText.textContent = META.description;

      // Friendly hint line
      if (elSub) elSub.textContent = "Drag to move • Tap to dash • Dodge asteroids • Collect stars";

      // Init SDK (optional)
      window.GG?.init?.({ title });
    } catch {
      // ignore
    }
  }
  loadMeta();

  // ---- Canvas resize (mobile-first) ----
  let W = 0, H = 0, DPR = 1;

  function resize() {
    const cssW = Math.max(1, canvas.clientWidth || window.innerWidth);
    const cssH = Math.max(1, canvas.clientHeight || window.innerHeight);

    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(cssW * DPR);
    canvas.height = Math.floor(cssH * DPR);

    W = canvas.width;
    H = canvas.height;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); // draw in CSS pixels
  }

  // ensure stage sizes canvas via CSS; canvas.clientWidth/Height now valid
  requestAnimationFrame(() => {
    resize();
    window.addEventListener("resize", resize, { passive: true });
  });

  // ---- Game state ----
  const BEST_KEY = "gg_space_dodger_best";
  const keys = new Set();

  let running = false;
  let paused = false;
  let gameOver = false;

  let score = 0;
  let best = Number(localStorage.getItem(BEST_KEY) || "0") || 0;

  // Player
  const player = {
    x: 0, y: 0,
    r: 14,
    vx: 0, vy: 0,
    invuln: 0,
    dashCd: 0,
    lastDX: 0, lastDY: -1
  };

  // Pointer control
  const pointer = {
    id: null,
    down: false,
    startX: 0, startY: 0,
    x: 0, y: 0,
    tDown: 0,
    dragging: false
  };

  // Entities
  let asteroids = [];
  let stars = [];
  let bgStars = [];

  // Difficulty / spawn timers
  let t = 0;
  let asteroidTimer = 0;
  let starTimer = 0;

  function resetGame() {
    score = 0;
    t = 0;
    asteroidTimer = 0;
    starTimer = 0;
    asteroids = [];
    stars = [];
    bgStars = makeBgStars(90);

    running = false;
    paused = false;
    gameOver = false;

    player.x = (canvas.clientWidth || 360) * 0.5;
    player.y = (canvas.clientHeight || 640) * 0.72;
    player.vx = 0;
    player.vy = 0;
    player.invuln = 0;
    player.dashCd = 0;
    player.lastDX = 0;
    player.lastDY = -1;

    pointer.id = null;
    pointer.down = false;
    pointer.dragging = false;

    updateHud();
    showPanel("Space Dodger", "Drag your ship to dodge asteroids. Collect stars for points. Tap to dash.");
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

  function endGame(reasonText) {
    gameOver = true;
    running = false;
    paused = false;

    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
    }
    updateHud();

    showPanel("Game Over", `${reasonText}\nScore: ${score} • Best: ${best}\nTap Start to try again.`);
  }

  function updateHud() {
    if (elScore) elScore.textContent = String(score | 0);
    if (elBest) elBest.textContent = String(best | 0);
  }

  function showPanel(title, text) {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (panel) panel.style.display = "flex";
  }

  function hidePanel() {
    if (panel) panel.style.display = "none";
  }

  function submitScore() {
    // Keep best in sync
    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
      updateHud();
    }
    window.GG?.submitScore?.(score | 0);
  }

  // ---- Spawning ----
  function makeBgStars(n) {
    const w = canvas.clientWidth || 360;
    const h = canvas.clientHeight || 640;
    const out = [];
    for (let i = 0; i < n; i++) {
      out.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        s: 10 + Math.random() * 40
      });
    }
    return out;
  }

  function spawnAsteroid() {
    const w = canvas.clientWidth || 360;
    const h = canvas.clientHeight || 640;

    // spawn from top or sides
    const edge = Math.random();
    let x, y, vx, vy;

    const speed = 120 + Math.min(220, t * 8);
    const r = 10 + Math.random() * 18;

    if (edge < 0.7) {
      x = Math.random() * w;
      y = -30;
      vx = (Math.random() - 0.5) * 60;
      vy = speed * (0.75 + Math.random() * 0.35);
    } else if (edge < 0.85) {
      x = -30;
      y = Math.random() * h * 0.7;
      vx = speed * (0.55 + Math.random() * 0.35);
      vy = speed * (0.15 + Math.random() * 0.25);
    } else {
      x = w + 30;
      y = Math.random() * h * 0.7;
      vx = -speed * (0.55 + Math.random() * 0.35);
      vy = speed * (0.15 + Math.random() * 0.25);
    }

    asteroids.push({ x, y, vx, vy, r });
  }

  function spawnStar() {
    const w = canvas.clientWidth || 360;
    const h = canvas.clientHeight || 640;

    const r = 7 + Math.random() * 6;
    const x = 24 + Math.random() * (w - 48);
    const y = -20;
    const vy = 110 + Math.random() * 120;

    stars.push({ x, y, vy, r });
  }

  // ---- Input (pointer + keyboard) ----
  function canvasPointFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left),
      y: (e.clientY - rect.top)
    };
  }

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture?.(e.pointerId);
    const p = canvasPointFromEvent(e);

    pointer.id = e.pointerId;
    pointer.down = true;
    pointer.startX = p.x;
    pointer.startY = p.y;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.tDown = performance.now();
    pointer.dragging = true;

    // start game on first interaction
    if (!running && !gameOver) startGame();
    if (gameOver) {
      resetGame();
      startGame();
    }
  }, { passive: true });

  canvas.addEventListener("pointermove", (e) => {
    if (!pointer.down || pointer.id !== e.pointerId) return;
    const p = canvasPointFromEvent(e);
    pointer.x = p.x;
    pointer.y = p.y;
  }, { passive: true });

  canvas.addEventListener("pointerup", (e) => {
    if (!pointer.down || pointer.id !== e.pointerId) return;

    const p = canvasPointFromEvent(e);
    const dt = performance.now() - pointer.tDown;
    const dx = p.x - pointer.startX;
    const dy = p.y - pointer.startY;
    const dist2 = dx * dx + dy * dy;

    // Quick tap -> dash
    if (dt < 180 && dist2 < 18 * 18) {
      dashToward(p.x, p.y);
    }

    pointer.down = false;
    pointer.dragging = false;
    pointer.id = null;
  }, { passive: true });

  window.addEventListener("keydown", (e) => {
    keys.add(e.key);

    if (e.key === "p" || e.key === "P") togglePause();
    if (e.key === "r" || e.key === "R") { resetGame(); startGame(); }
    if (e.key === " " && running && !paused && !gameOver) {
      // dash in last direction
      dashDir(player.lastDX, player.lastDY);
    }
  });

  window.addEventListener("keyup", (e) => keys.delete(e.key));

  // ---- Dash ----
  function dashToward(tx, ty) {
    if (!running || paused || gameOver) return;
    if (player.dashCd > 0) return;

    const dx = tx - player.x;
    const dy = ty - player.y;
    const len = Math.hypot(dx, dy) || 1;

    dashDir(dx / len, dy / len);
  }

  function dashDir(nx, ny) {
    player.vx += nx * 480;
    player.vy += ny * 480;

    player.lastDX = nx;
    player.lastDY = ny;

    player.invuln = 0.35;
    player.dashCd = 0.45;
  }

  // ---- Buttons ----
  btnStart.onclick = () => {
    if (gameOver) resetGame();
    if (!running) startGame();
    else if (paused) togglePause();
    else startGame();
  };

  btnOverlay.onclick = () => window.GG?.openOverlay?.();
  btnChat.onclick = () => window.GG?.openOverlay?.();

  btnPause.onclick = () => togglePause();

  btnRestart.onclick = () => {
    resetGame();
    startGame();
  };

  btnSubmit.onclick = () => {
    submitScore();
    // optional: open overlay to see leaderboard/chat right away
    window.GG?.openOverlay?.();
  };

  // ---- Loop ----
  let last = performance.now();

  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    step(dt);
    draw();

    requestAnimationFrame(loop);
  }

  function step(dt) {
    if (!running || paused || gameOver) return;

    t += dt;

    // score increases over time (survival)
    score += dt * 12;
    score |= 0;

    // cooldown timers
    player.invuln = Math.max(0, player.invuln - dt);
    player.dashCd = Math.max(0, player.dashCd - dt);

    // keyboard nudge (desktop)
    const ax = (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0);
    const ay = (keys.has("ArrowDown") ? 1 : 0) - (keys.has("ArrowUp") ? 1 : 0);

    // target from pointer drag
    let tx = player.x, ty = player.y;
    if (pointer.dragging) {
      tx = pointer.x;
      ty = pointer.y;
    } else if (ax || ay) {
      tx = player.x + ax * 120;
      ty = player.y + ay * 120;
    }

    // move toward target (smooth)
    const dx = tx - player.x;
    const dy = ty - player.y;

    const follow = 18; // higher = snappier
    player.vx += dx * follow * dt;
    player.vy += dy * follow * dt;

    // friction
    player.vx *= Math.pow(0.002, dt);
    player.vy *= Math.pow(0.002, dt);

    // integrate
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // last direction
    const vlen = Math.hypot(player.vx, player.vy);
    if (vlen > 10) {
      player.lastDX = player.vx / vlen;
      player.lastDY = player.vy / vlen;
    }

    // bounds in CSS pixels
    const w = canvas.clientWidth || 360;
    const h = canvas.clientHeight || 640;
    player.x = clamp(player.x, player.r + 4, w - player.r - 4);
    player.y = clamp(player.y, player.r + 4, h - player.r - 4);

    // Spawns (difficulty ramps)
    const asteroidEvery = Math.max(0.24, 0.9 - t * 0.01);
    asteroidTimer -= dt;
    if (asteroidTimer <= 0) {
      spawnAsteroid();
      // small chance extra
      if (t > 25 && Math.random() < 0.25) spawnAsteroid();
      asteroidTimer = asteroidEvery;
    }

    starTimer -= dt;
    if (starTimer <= 0) {
      spawnStar();
      starTimer = 0.8 + Math.random() * 0.7;
    }

    // Update background stars
    for (const s of bgStars) {
      s.y += s.s * dt;
      if (s.y > h + 8) {
        s.y = -8;
        s.x = Math.random() * w;
      }
    }

    // Update asteroids
    for (const a of asteroids) {
      a.x += a.vx * dt;
      a.y += a.vy * dt;
    }

    // Update stars
    for (const s of stars) {
      s.y += s.vy * dt;
    }

    // Collisions: stars
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      if (hitCircle(player.x, player.y, player.r, s.x, s.y, s.r)) {
        stars.splice(i, 1);
        score += 60;
      }
    }

    // Collisions: asteroids
    if (player.invuln <= 0) {
      for (const a of asteroids) {
        if (hitCircle(player.x, player.y, player.r, a.x, a.y, a.r)) {
          endGame("You hit an asteroid!");
          submitScore();
          return;
        }
      }
    }

    // Cleanup
    asteroids = asteroids.filter((a) => a.y < h + 80 && a.x > -120 && a.x < w + 120);
    stars = stars.filter((s) => s.y < h + 60);

    // Best tracking
    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
    }

    updateHud();
  }

  // ---- Drawing ----
  function draw() {
    const w = canvas.clientWidth || 360;
    const h = canvas.clientHeight || 640;

    // background
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, w, h);

    // starfield
    ctx.fillStyle = "rgba(255,255,255,.75)";
    for (const s of bgStars) {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // stars (collectibles)
    for (const s of stars) {
      glowCircle(s.x, s.y, s.r, "rgba(34,197,94,.95)");
      drawStarMark(s.x, s.y, s.r);
    }

    // asteroids
    for (const a of asteroids) {
      glowCircle(a.x, a.y, a.r, "rgba(239,68,68,.92)");
      drawCrater(a.x, a.y, a.r);
    }

    // player ship
    drawShip(player.x, player.y, player.r, player.invuln > 0);

    // invuln ring
    if (player.invuln > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(59,130,246,.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r + 10 + Math.sin(t * 10) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawShip(x, y, r, blinking) {
    const a = Math.atan2(player.lastDY, player.lastDX);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);

    const col = blinking ? "rgba(59,130,246,.75)" : "rgba(59,130,246,.95)";
    ctx.shadowColor = col;
    ctx.shadowBlur = 18;
    ctx.fillStyle = col;

    ctx.beginPath();
    ctx.moveTo(0, -r * 1.4);
    ctx.lineTo(r * 0.85, r * 1.2);
    ctx.lineTo(0, r * 0.7);
    ctx.lineTo(-r * 0.85, r * 1.2);
    ctx.closePath();
    ctx.fill();

    // cockpit highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,.22)";
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.35, r * 0.25, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // thruster
    if (Math.hypot(player.vx, player.vy) > 40) {
      ctx.fillStyle = "rgba(168,85,247,.85)";
      ctx.shadowColor = "rgba(168,85,247,.85)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0, r * 1.25);
      ctx.lineTo(r * 0.22, r * 1.9 + Math.random() * 6);
      ctx.lineTo(-r * 0.22, r * 1.9 + Math.random() * 6);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function glowCircle(x, y, r, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCrater(x, y, r) {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "rgba(0,0,0,.8)";
    ctx.beginPath();
    ctx.arc(x - r * 0.2, y - r * 0.15, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.18, y + r * 0.10, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawStarMark(x, y, r) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.strokeStyle = "rgba(255,255,255,.30)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.stroke();
    ctx.restore();
  }

  // ---- Utils ----
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hitCircle(ax, ay, ar, bx, by, br) {
    const dx = ax - bx, dy = ay - by;
    const rr = (ar + br) * (ar + br);
    return dx * dx + dy * dy <= rr;
  }

  // Start loop + init
  resetGame();
  requestAnimationFrame(loop);
})();
