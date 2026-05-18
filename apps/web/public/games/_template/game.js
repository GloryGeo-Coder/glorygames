(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");

  const elScore = document.getElementById("score");
  const elTime = document.getElementById("time");
  const btnStart = document.getElementById("btnStart");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnOverlay = document.getElementById("btnOverlay");

  // SDK init (optional; SDK auto-inits too)
  window.GG?.init?.({ title: "Neon Dodger (Template)" });

  async function loadMeta() {
  try {
    const res = await fetch("./game.json", { cache: "no-store" });
    const meta = await res.json();

    const title = meta?.title || "GloryGames Game";
    const desc = meta?.description || "";

    // Update visible UI
    const t1 = document.getElementById("ggTitle");
    const t2 = document.getElementById("ggCardTitle");
    if (t1) t1.textContent = `GloryGames • ${title}`;
    if (t2) t2.textContent = title;

    document.title = title;

    // Init SDK with correct title (optional)
    window.GG?.init?.({ title });

    // Optional: show description somewhere later if you add an element for it
    window.GG_META = meta;
    return meta;
  } catch {
    document.title = "GloryGames Game";
    return null;
  }
}

loadMeta();


  // Game state
  const W = canvas.width;
  const H = canvas.height;

  const keys = new Set();
  let running = false;
  let tLeft = 30.0;
  let score = 0;

  const player = { x: W * 0.5, y: H * 0.65, r: 14, vx: 0, vy: 0 };
  let orb = spawnOrb();
  let shards = [];
  let lastSpawn = 0;

  function reset() {
    running = false;
    tLeft = 30.0;
    score = 0;
    player.x = W * 0.5;
    player.y = H * 0.65;
    player.vx = 0;
    player.vy = 0;
    orb = spawnOrb();
    shards = [];
    lastSpawn = 0;
    updateHud();
  }

  function spawnOrb() {
    return { x: rand(60, W - 60), y: rand(80, H - 80), r: 10 };
  }

  function spawnShard() {
    // hazards fall from top
    const r = rand(10, 16);
    return {
      x: rand(40, W - 40),
      y: -30,
      r,
      vy: rand(140, 260),
      vx: rand(-40, 40)
    };
  }

  function updateHud() {
    elScore.textContent = String(score);
    elTime.textContent = tLeft.toFixed(1);
  }

  function submitScore() {
    window.GG?.submitScore?.(score);
    // optional: quick “GG” chat message (remove if you don’t want it)
    // window.GG?.chatSend?.(`I scored ${score} in Neon Dodger!`);
  }

  btnStart.onclick = () => { running = true; };
  btnSubmit.onclick = submitScore;
  btnOverlay.onclick = () => window.GG?.openOverlay?.();

  window.addEventListener("keydown", (e) => {
    keys.add(e.key);
    if (e.key === "r" || e.key === "R") reset();
    if (e.key === " " && running) {
      // boost
      player.vx *= 1.35;
      player.vy *= 1.35;
    }
  });

  window.addEventListener("keyup", (e) => {
    keys.delete(e.key);
  });

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    step(dt, now / 1000);
    draw();

    requestAnimationFrame(loop);
  }

  function step(dt, t) {
    if (!running) return;

    tLeft -= dt;
    if (tLeft <= 0) {
      tLeft = 0;
      running = false;
      updateHud();
      submitScore();
      return;
    }

    // Input
    const ax = (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0);
    const ay = (keys.has("ArrowDown") ? 1 : 0) - (keys.has("ArrowUp") ? 1 : 0);

    const accel = 700;
    player.vx += ax * accel * dt;
    player.vy += ay * accel * dt;

    // Friction
    player.vx *= Math.pow(0.001, dt);
    player.vy *= Math.pow(0.001, dt);

    // Move
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Bounds
    player.x = clamp(player.x, player.r, W - player.r);
    player.y = clamp(player.y, player.r, H - player.r);

    // Collect orb
    if (circleHit(player, orb)) {
      score += 10;
      orb = spawnOrb();
      // small difficulty curve
      if (score % 50 === 0) tLeft = Math.min(45, tLeft + 2.5);
    }

    // Spawn shards over time
    if (t - lastSpawn > 0.65) {
      shards.push(spawnShard());
      if (score >= 80 && Math.random() < 0.5) shards.push(spawnShard());
      lastSpawn = t;
    }

    // Update shards
    shards.forEach((s) => {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    });

    // Collision with shards
    for (const s of shards) {
      if (circleHit(player, s)) {
        score = Math.max(0, score - 25);
        // knockback
        player.vx *= -0.6;
        player.vy *= -0.6;
        // respawn orb so game feels reactive
        orb = spawnOrb();
        break;
      }
    }

    // Clean shards
    shards = shards.filter((s) => s.y < H + 50);

    updateHud();
  }

  function draw() {
    // background
    ctx.clearRect(0, 0, W, H);
    drawGrid();

    // orb
    glowCircle(orb.x, orb.y, orb.r, "rgba(34,197,94,.95)");

    // shards
    for (const s of shards) {
      glowCircle(s.x, s.y, s.r, "rgba(239,68,68,.92)");
    }

    // player
    glowCircle(player.x, player.y, player.r, "rgba(59,130,246,.95)");

    // instructions
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.font = "700 14px system-ui";
    ctx.fillText(running ? "Collect green • Avoid red" : "Press Start to play", 18, 28);

    if (!running && tLeft > 0 && score > 0) {
      ctx.fillStyle = "rgba(255,255,255,.88)";
      ctx.font = "900 20px system-ui";
      ctx.fillText(`Paused • Score ${score}`, 18, 56);
    }

    if (!running && tLeft === 0) {
      ctx.fillStyle = "rgba(255,255,255,.92)";
      ctx.font = "1000 28px system-ui";
      ctx.fillText(`Time! Final: ${score}`, 18, 62);

      ctx.fillStyle = "rgba(255,255,255,.70)";
      ctx.font = "800 14px system-ui";
      ctx.fillText(`Score submitted. Press R to restart.`, 18, 86);
    }
  }

  function drawGrid() {
    // subtle neon grid
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = "rgba(255,255,255,.10)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
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

    // core highlight
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,.20)";
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function circleHit(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const rr = (a.r + b.r) ** 2;
    return (dx * dx + dy * dy) <= rr;
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  reset();
  requestAnimationFrame(loop);
})();
