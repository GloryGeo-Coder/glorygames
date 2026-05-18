(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });

  // HUD
  const elDistance = document.getElementById("distance");
  const elNear = document.getElementById("near");
  const elBoost = document.getElementById("boost");
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
  const btnBoost = document.getElementById("btnBoost");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnRestart = document.getElementById("btnRestart");
  const btnChat = document.getElementById("btnChat");

  // Meta
  let META = { title: "Swipe Racer", description: "" };
  async function loadMeta() {
    try {
      const res = await fetch("./game.json", { cache: "no-store" });
      META = (await res.json()) || META;
      const title = META.title || "Swipe Racer";
      document.title = title;
      if (elTitle) elTitle.textContent = title;
      if (panelTitle) panelTitle.textContent = title;
      if (META.description && panelText) panelText.textContent = META.description;
      if (elSub) elSub.textContent = "Swipe/drag to steer • Tap Boost when ready";
      window.GG?.init?.({ title });
    } catch {}
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

  function cw() { return canvas.clientWidth || 360; }
  function ch() { return canvas.clientHeight || 640; }

  // State
  let running = false;
  let paused = false;
  let gameOver = false;

  let distance = 0;   // meters-ish
  let near = 0;       // near miss count
  let score = 0;

  // Road / lanes
  const road = {
    x: 0,
    w: 0,
    yTop: 0,
    yBot: 0,
    lanes: 3,
    laneW: 0,
    scroll: 0
  };

  // Player car
  const player = {
    x: 0,
    y: 0,
    w: 38,
    h: 64,
    vx: 0,
    steer: 0,         // -1..1 from swipe/drag
    targetX: 0,
    invuln: 0
  };

  // Speed & boost
  let speed = 380;
  let boostEnergy = 0;     // 0..3 (like charges)
  let boosting = 0;        // seconds remaining
  let boostGlow = 0;

  // Entities
  let traffic = [];        // {x,y,w,h,vy,kind,nearGiven}
  let pickups = [];        // {x,y,r,vy,type}
  let particles = [];

  let spawnT = 0;
  let pickupT = 0;

  // Pointer control
  const pointer = {
    id: null,
    down: false,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    tDown: 0
  };

  // UI
  function updateHud() {
    if (elDistance) elDistance.textContent = String(distance | 0);
    if (elNear) elNear.textContent = String(near | 0);
    if (elBoost) elBoost.textContent = String(boostEnergy | 0);
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
    window.GG?.submitScore?.(score | 0);
  }

  function resetGame() {
    running = false;
    paused = false;
    gameOver = false;

    distance = 0;
    near = 0;
    score = 0;

    traffic = [];
    pickups = [];
    particles = [];

    speed = 380;
    boostEnergy = 0;
    boosting = 0;
    boostGlow = 0;

    spawnT = 0;
    pickupT = 0;

    // road sizing
    const w = cw();
    const h = ch();

    road.w = Math.min(360, w * 0.86);
    road.x = w * 0.5;
    road.yTop = 0;
    road.yBot = h;
    road.laneW = road.w / road.lanes;
    road.scroll = 0;

    player.x = road.x;
    player.y = h * 0.74;
    player.vx = 0;
    player.steer = 0;
    player.targetX = road.x;
    player.invuln = 0;

    updateHud();
    showPanel(META.title || "Swipe Racer", META.description || "Swipe/drag to steer. Avoid traffic. Collect boosts. Near misses score bonus!");
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

  function endGame(reason) {
    gameOver = true;
    running = false;
    paused = false;

    // final score
    score = Math.max(score, (distance | 0) + near * 35);
    updateHud();

    showPanel("Crash!", `${reason}\n\nScore: ${score}\nDistance: ${distance | 0} • Near misses: ${near}\nTap Start to try again.`);
    submitScore();
  }

  // Helpers
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return (
      Math.abs(ax - bx) * 2 < (aw + bw) &&
      Math.abs(ay - by) * 2 < (ah + bh)
    );
  }

  function spawnTraffic() {
    const lane = Math.floor(Math.random() * road.lanes);
    const x = road.x - road.w * 0.5 + road.laneW * (lane + 0.5);

    const kindRoll = Math.random();
    const kind = kindRoll < 0.72 ? "car" : "truck";

    const w = kind === "truck" ? 44 : 36;
    const h = kind === "truck" ? 84 : 62;

    const vy = speed * rnd(0.86, 1.16);

    traffic.push({
      x,
      y: -120,
      w, h,
      vy,
      kind,
      nearGiven: false
    });
  }

  function spawnPickup() {
    // boost charge pickup
    const lane = Math.floor(Math.random() * road.lanes);
    const x = road.x - road.w * 0.5 + road.laneW * (lane + 0.5);
    pickups.push({ x, y: -40, r: 12, vy: speed * 0.9, type: "boost" });
  }

  function popParticles(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x, y,
        vx: rnd(-140, 140),
        vy: rnd(-140, 140),
        t: rnd(0.35, 0.7),
        color
      });
    }
  }

  function useBoost() {
    if (!running || paused || gameOver) return;
    if (boostEnergy <= 0) return;
    if (boosting > 0) return;

    boostEnergy -= 1;
    boosting = 1.0; // 1 sec burst
    boostGlow = 1.0;
    popParticles(player.x, player.y + 18, 14, "rgba(250,204,21,.9)");
    updateHud();
  }

  // Input
  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture?.(e.pointerId);
    const p = canvasPoint(e);
    pointer.id = e.pointerId;
    pointer.down = true;
    pointer.startX = p.x;
    pointer.startY = p.y;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.tDown = performance.now();

    if (!running && !gameOver) startGame();
    if (gameOver) { resetGame(); startGame(); }
  }, { passive: true });

  canvas.addEventListener("pointermove", (e) => {
    if (!pointer.down || pointer.id !== e.pointerId) return;
    const p = canvasPoint(e);
    pointer.x = p.x;
    pointer.y = p.y;

    // drag steer: map x to road bounds
    const minX = road.x - road.w * 0.5 + player.w * 0.6;
    const maxX = road.x + road.w * 0.5 - player.w * 0.6;
    player.targetX = clamp(p.x, minX, maxX);
  }, { passive: true });

  canvas.addEventListener("pointerup", (e) => {
    if (!pointer.down || pointer.id !== e.pointerId) return;

    const p = canvasPoint(e);
    const dt = performance.now() - pointer.tDown;
    const dx = p.x - pointer.startX;
    const dy = p.y - pointer.startY;
    const dist2 = dx * dx + dy * dy;

    // quick tap (no drag) triggers boost if available
    if (dt < 220 && dist2 < 16 * 16) useBoost();

    pointer.down = false;
    pointer.id = null;
  }, { passive: true });

  window.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P") togglePause();
    if (e.key === " " || e.key === "Enter") useBoost();
    if (e.key === "r" || e.key === "R") { resetGame(); startGame(); }
    if (e.key === "ArrowLeft") player.targetX -= road.laneW;
    if (e.key === "ArrowRight") player.targetX += road.laneW;
  });

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
  btnBoost.onclick = () => useBoost();
  btnRestart.onclick = () => { resetGame(); startGame(); };
  btnSubmit.onclick = () => { submitScore(); window.GG?.openOverlay?.(); };

  // Loop
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    step(dt);
    draw();

    requestAnimationFrame(loop);
  }

  function step(dt) {
    if (!running || paused || gameOver) {
      // still animate particles for polish
      updateParticles(dt);
      updateHud();
      return;
    }

    // speed ramps with distance
    speed = 380 + Math.min(520, distance * 0.55);

    // boost changes effective speed and gives bonus
    if (boosting > 0) {
      boosting -= dt;
      distance += dt * (speed * 0.010) * 2.0;
      score += dt * 6;
      boostGlow = Math.min(1, boostGlow + dt * 3);
    } else {
      distance += dt * (speed * 0.010);
      boostGlow = Math.max(0, boostGlow - dt * 2);
    }

    // road scroll
    road.scroll += dt * (speed * 0.9);
    if (road.scroll > 100000) road.scroll = 0;

    // player move towards target
    const ease = 20;
    player.x += (player.targetX - player.x) * (1 - Math.pow(0.002, dt * ease));
    player.invuln = Math.max(0, player.invuln - dt);

    // spawn traffic
    spawnT -= dt;
    const spawnEvery = Math.max(0.28, 0.9 - distance * 0.003);
    if (spawnT <= 0) {
      spawnTraffic();
      // occasional double spawn at higher distances
      if (distance > 250 && Math.random() < 0.25) spawnTraffic();
      spawnT = spawnEvery;
    }

    // spawn pickups
    pickupT -= dt;
    if (pickupT <= 0) {
      if (boostEnergy < 3 && Math.random() < 0.7) spawnPickup();
      pickupT = 2.2 + Math.random() * 2.0;
    }

    // move entities
    for (const t0 of traffic) t0.y += t0.vy * dt * (boosting > 0 ? 1.2 : 1);
    for (const p0 of pickups) p0.y += p0.vy * dt;

    // collisions (player vs traffic)
    for (const t0 of traffic) {
      if (rectsOverlap(player.x, player.y, player.w, player.h, t0.x, t0.y, t0.w, t0.h)) {
        if (player.invuln <= 0) {
          popParticles(player.x, player.y, 20, "rgba(244,63,94,.9)");
          endGame("You hit traffic!");
          return;
        }
      }

      // near-miss bonus (pass close without colliding)
      if (!t0.nearGiven) {
        const dx = Math.abs(player.x - t0.x);
        const dy = Math.abs(player.y - t0.y);
        const closeX = dx < (player.w * 0.5 + t0.w * 0.5 + 14);
        const closeY = dy < (player.h * 0.5 + t0.h * 0.5 + 10);
        const notHit = !rectsOverlap(player.x, player.y, player.w, player.h, t0.x, t0.y, t0.w, t0.h);

        if (closeX && closeY && notHit) {
          near += 1;
          score += 35;
          t0.nearGiven = true;
          popParticles(player.x, player.y - 20, 10, "rgba(255,255,255,.75)");
        }
      }
    }

    // pickups
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p0 = pickups[i];
      const dx = player.x - p0.x;
      const dy = player.y - p0.y;
      if (dx * dx + dy * dy < (p0.r + 26) * (p0.r + 26)) {
        pickups.splice(i, 1);
        if (p0.type === "boost") {
          boostEnergy = Math.min(3, boostEnergy + 1);
          score += 15;
          popParticles(p0.x, p0.y, 12, "rgba(250,204,21,.9)");
        }
      }
    }

    // cleanup offscreen
    const h = ch();
    traffic = traffic.filter(t0 => t0.y < h + 160);
    pickups = pickups.filter(p0 => p0.y < h + 80);

    // score finalization
    score = Math.max(score, (distance | 0) + near * 35);

    updateParticles(dt);
    updateHud();
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(0.06, dt);
      p.vy *= Math.pow(0.06, dt);
      if (p.t <= 0) particles.splice(i, 1);
    }
  }

  // Draw
  function draw() {
    const w = cw();
    const h = ch();

    // background
    ctx.fillStyle = "#070b16";
    ctx.fillRect(0, 0, w, h);

    // road
    const roadX = road.x;
    const roadW = road.w;

    // shoulders
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.fillRect(roadX - roadW * 0.5 - 22, 0, 22, h);
    ctx.fillRect(roadX + roadW * 0.5, 0, 22, h);
    ctx.restore();

    // asphalt
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.05)";
    roundRectFill(roadX - roadW * 0.5, 0, roadW, h, 18);

    // lane lines (dashed)
    ctx.clip();
    for (let i = 1; i < road.lanes; i++) {
      const x = roadX - roadW * 0.5 + road.laneW * i;
      drawDashedLine(x, -40, x, h + 40, 18, 18, road.scroll * 0.6);
    }

    // center highlight
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "rgba(255,255,255,.20)";
    ctx.fillRect(roadX - 2, 0, 4, h);
    ctx.restore();

    // pickups
    for (const p0 of pickups) {
      const col = "rgba(250,204,21,.92)";
      ctx.save();
      ctx.shadowColor = col;
      ctx.shadowBlur = 18;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(p0.x, p0.y, p0.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(0,0,0,.55)";
      ctx.font = "1000 14px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡", p0.x, p0.y + 0.5);
      ctx.restore();
    }

    // traffic
    for (const t0 of traffic) drawCar(t0.x, t0.y, t0.w, t0.h, t0.kind);

    // player car
    drawPlayer(player.x, player.y, player.w, player.h);

    // particles
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.t / 0.7));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // boost glow indicator
    if (boostGlow > 0.02) {
      ctx.save();
      ctx.globalAlpha = 0.18 + boostGlow * 0.22;
      ctx.fillStyle = "rgba(250,204,21,.9)";
      ctx.beginPath();
      ctx.arc(player.x, player.y + 12, 48 + boostGlow * 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawDashedLine(x1, y1, x2, y2, dash, gap, offset) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.26)";
    ctx.lineWidth = 3;
    ctx.setLineDash([dash, gap]);
    ctx.lineDashOffset = -offset;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
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

  function drawCar(x, y, w, h, kind) {
    const col = kind === "truck" ? "rgba(244,63,94,.86)" : "rgba(14,165,233,.86)";
    ctx.save();
    ctx.translate(x, y);

    ctx.shadowColor = col;
    ctx.shadowBlur = 18;
    ctx.fillStyle = col;
    roundRectFill(-w * 0.5, -h * 0.5, w, h, 12);

    // window
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "rgba(255,255,255,.95)";
    roundRectFill(-w * 0.32, -h * 0.32, w * 0.64, h * 0.26, 10);

    // stripes
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "rgba(0,0,0,.8)";
    roundRectFill(-w * 0.38, -h * 0.04, w * 0.76, h * 0.10, 10);

    // wheels
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "rgba(0,0,0,.9)";
    ctx.fillRect(-w * 0.56, -h * 0.28, w * 0.12, h * 0.22);
    ctx.fillRect(w * 0.44, -h * 0.28, w * 0.12, h * 0.22);
    ctx.fillRect(-w * 0.56, h * 0.06, w * 0.12, h * 0.22);
    ctx.fillRect(w * 0.44, h * 0.06, w * 0.12, h * 0.22);

    ctx.restore();
  }

  function drawPlayer(x, y, w, h) {
    const col = "rgba(250,204,21,.92)";
    ctx.save();
    ctx.translate(x, y);

    ctx.shadowColor = col;
    ctx.shadowBlur = 18;
    ctx.fillStyle = col;
    roundRectFill(-w * 0.5, -h * 0.5, w, h, 12);

    // cockpit
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "rgba(255,255,255,.95)";
    roundRectFill(-w * 0.30, -h * 0.34, w * 0.60, h * 0.30, 10);

    // nose stripe
    ctx.globalAlpha = 0.20;
    ctx.fillStyle = "rgba(0,0,0,.8)";
    roundRectFill(-w * 0.10, -h * 0.50, w * 0.20, h, 10);

    // wheels
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = "rgba(0,0,0,.9)";
    ctx.fillRect(-w * 0.56, -h * 0.22, w * 0.12, h * 0.20);
    ctx.fillRect(w * 0.44, -h * 0.22, w * 0.12, h * 0.20);
    ctx.fillRect(-w * 0.56, h * 0.02, w * 0.12, h * 0.20);
    ctx.fillRect(w * 0.44, h * 0.02, w * 0.12, h * 0.20);

    ctx.restore();
  }

  // Init
  updateHud();
  resetGame();
  requestAnimationFrame(loop);
})();
