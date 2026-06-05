(() => {
  "use strict";

  const canvas = document.getElementById("c");
  const ctx = canvas?.getContext("2d", { alpha: false });
  if (!canvas || !ctx) return;

  const $ = (id) => document.getElementById(id);
  const elScore = $("score");
  const elBest = $("best");
  const elSpeed = $("speed");
  const elLives = $("lives");
  const boostFill = $("boostFill");
  const boostLabel = $("boostLabel");

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
  const uiPause = $("uiPause");
  const uiMute = $("uiMute");
  const uiRestart = $("uiRestart");

  const GAME_SLUG = "neon-hover-runner";
  const BEST_KEY = "gg_neon_hover_runner_best_v2";

  const ASSETS = {
    craft: "./assets/sprites/hovercraft.png",
    coin: "./assets/sprites/energy-orb.png",
    boost: "./assets/sprites/boost.png",
    shield: "./assets/sprites/shield.png",
    magnet: "./assets/sprites/magnet.png",
    barrier: "./assets/sprites/barrier.png",
    mine: "./assets/sprites/mine.png",
    bg: "./assets/backgrounds/cyber-track.png",
    bgAlt: "./assets/backgrounds/cyber-track-alt.png",
  };

  let W = 1, H = 1, DPR = 1;
  let running = false;
  let paused = false;
  let dead = false;
  let muted = false;
  let score = 0;
  let best = Number(localStorage.getItem(BEST_KEY) || "0") || 0;
  let lives = 3;
  let distance = 0;
  let speed = 1;
  let speedPx = 0.22;
  let boostMeter = 0;
  let boostTimer = 0;
  let shieldTimer = 0;
  let magnetTimer = 0;
  let combo = 0;
  let comboTimer = 0;
  let screenShake = 0;
  let lastT = performance.now();

  const player = {
    x: 0,
    targetX: 0,
    yNorm: 0.80,
    jump: 0,
    vy: 0,
    tilt: 0,
    invuln: 0,
  };

  const objects = [];
  const particles = [];
  const floaters = [];
  const trails = [];
  const bgBubbles = [];
  const images = {};
  let spawnTimer = 0;
  let pickupTimer = 0;
  let lastLiveScore = -1;
  let lastLiveAt = 0;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);

  function ggScore(mode = "live") {
    const clean = Math.max(0, Math.floor(score));
    const t = performance.now();
    if (mode === "live" && clean === lastLiveScore && t - lastLiveAt < 160) return;
    if (mode === "live" && t - lastLiveAt < 90) return;
    lastLiveScore = clean;
    lastLiveAt = t;

    const payload = {
      gameSlug: GAME_SLUG,
      slug: GAME_SLUG,
      score: clean,
      best,
      mode,
      speed: Number(speed.toFixed(2)),
      lives,
      distance: Math.floor(distance),
      boost: Math.round(boostMeter * 100),
    };
    try { window.GG?.setScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== "live") {
      try { window.GG?.submitScore?.(clean, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type: "GG_SCORE", ...payload, payload }, "*"); } catch {}
    try { window.parent?.postMessage?.({ type: "gg:score", ...payload, payload }, "*"); } catch {}
  }

  function updateHUD() {
    const clean = Math.floor(score);
    if (elScore) elScore.textContent = String(clean);
    if (elBest) elBest.textContent = String(Math.floor(best));
    if (elSpeed) elSpeed.textContent = `${speed.toFixed(1)}x`;
    if (elLives) elLives.textContent = String(lives);
    if (boostFill) boostFill.style.width = `${Math.round(boostMeter * 100)}%`;
    if (boostLabel) boostLabel.textContent = boostTimer > 0 ? "ACTIVE" : `${Math.round(boostMeter * 100)}%`;
    ggScore("live");
  }

  function showPanel(title, body) {
    if (panel) panel.style.display = "flex";
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = body;
  }
  function hidePanel() {
    if (panel) panel.style.display = "none";
  }

  function resize() {
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.floor(r.width || window.innerWidth));
    H = Math.max(1, Math.floor(r.height || window.innerHeight));
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function loadAssets() {
    const entries = Object.entries(ASSETS);
    const imgs = await Promise.all(entries.map(([, src]) => loadImage(src)));
    entries.forEach(([key], i) => images[key] = imgs[i]);
  }

  // -----------------------------
  // Audio
  // -----------------------------
  let AC = null;
  let master = null;
  let musicTimer = null;
  let musicStep = 0;

  function ensureAudio() {
    if (muted) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC) {
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = 0.13;
      master.connect(AC.destination);
    }
    if (AC.state === "suspended") AC.resume().catch(() => {});
    return AC;
  }

  function tone(freq, dur = 0.08, type = "sine", gain = 0.06, delay = 0) {
    const ac = ensureAudio();
    if (!ac || muted || paused) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master || ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  function noise(dur = 0.12, gain = 0.04) {
    const ac = ensureAudio();
    if (!ac || muted) return;
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource();
    const g = ac.createGain();
    g.gain.value = gain;
    src.buffer = buffer;
    src.connect(g);
    g.connect(master || ac.destination);
    src.start();
    src.stop(ac.currentTime + dur);
  }

  function sfx(name) {
    if (name === "start") { tone(330, .05, "triangle", .055); tone(660, .07, "triangle", .045, .05); return; }
    if (name === "jump") { tone(520, .05, "sine", .055); tone(820, .05, "sine", .04, .03); return; }
    if (name === "coin") { tone(1040, .04, "triangle", .05); tone(1560, .06, "triangle", .038, .02); return; }
    if (name === "boost") { tone(420, .05, "triangle", .052); tone(720, .08, "triangle", .055, .05); return; }
    if (name === "shield") { tone(520, .06, "sine", .05); tone(420, .10, "triangle", .04, .04); return; }
    if (name === "magnet") { tone(300, .04, "sawtooth", .03); tone(900, .08, "sine", .04, .04); return; }
    if (name === "hit") { noise(.16, .07); tone(150, .13, "sawtooth", .07); tone(90, .18, "sine", .055, .05); return; }
    if (name === "gameover") { tone(220, .12, "sawtooth", .06); tone(160, .14, "sine", .05, .1); tone(110, .18, "sine", .045, .22); return; }
  }

  function musicTick() {
    if (!running || paused || muted) return;
    const notes = [110, 147, 196, 220, 196, 147, 165, 220];
    const n = notes[musicStep++ % notes.length];
    tone(n, .13, "triangle", .014);
    if (musicStep % 2 === 0) tone(n * 2, .07, "sine", .010, .03);
  }
  function startMusic() {
    if (musicTimer || muted) return;
    musicTimer = setInterval(musicTick, 220);
  }
  function stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  // -----------------------------
  // Geometry helpers
  // -----------------------------
  function horizonY() { return H * 0.34; }
  function playerY() { return H * player.yNorm - player.jump; }
  function centerX() { return W * 0.5; }
  function lanePixels(progress) {
    const p = Math.pow(progress, 1.35);
    return lerp(W * 0.08, W * 0.44, p);
  }
  function worldToScreen(lane, progress) {
    const p = clamp(progress, 0, 1.18);
    const y = lerp(horizonY(), H * 0.92, Math.pow(p, 1.55));
    const x = centerX() + lane * lanePixels(p);
    const scale = lerp(0.18, 1.45, Math.pow(p, 1.25));
    return { x, y, scale };
  }
  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function resetBackgroundParticles() {
    bgBubbles.length = 0;
    for (let i = 0; i < 70; i++) {
      bgBubbles.push({
        x: Math.random(),
        y: Math.random(),
        s: rand(1, 4),
        a: rand(.08, .35),
        sp: rand(.04, .12),
        col: Math.random() < .5 ? "0,235,255" : Math.random() < .5 ? "168,85,247" : "255,62,187",
      });
    }
  }

  function resetGame() {
    running = true;
    paused = false;
    dead = false;
    score = 0;
    lives = 3;
    distance = 0;
    speed = 1;
    boostMeter = 0;
    boostTimer = 0;
    shieldTimer = 0;
    magnetTimer = 0;
    combo = 0;
    comboTimer = 0;
    screenShake = 0;
    player.x = 0;
    player.targetX = 0;
    player.jump = 0;
    player.vy = 0;
    player.tilt = 0;
    player.invuln = 1.2;
    objects.length = 0;
    particles.length = 0;
    floaters.length = 0;
    trails.length = 0;
    spawnTimer = 0;
    pickupTimer = 0;
    lastLiveScore = -1;
    resetBackgroundParticles();
    hidePanel();
    sfx("start");
    startMusic();
    updateHUD();
    for (let i = 0; i < 4; i++) spawnPickup(i % 2 === 0 ? "coin" : "boost", rand(.08,.25), rand(-.8,.8));
  }
  window.resetGame = resetGame;

  function gameOver(reason = "Crashed!") {
    if (dead) return;
    running = false;
    dead = true;
    stopMusic();
    if (score > best) {
      best = Math.floor(score);
      localStorage.setItem(BEST_KEY, String(best));
    }
    sfx("gameover");
    ggScore("game_over");
    showPanel(`💥 ${reason}`, `Score: ${Math.floor(score)}\nBest: ${Math.floor(best)}\n\nSwipe to steer, tap to jump, and use boost to survive longer.`);
    updateHUD();
  }

  function addFloater(x, y, text, color = "#fff", size = 20) {
    floaters.push({ x, y, text, color, size, age: 0, life: .9, vy: rand(-40, -26) });
  }

  function addParticles(x, y, color, count = 16, speed = 180) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(speed * .25, speed);
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(1.8, 5.5), color, age: 0, life: rand(.35, .85) });
    }
  }

  function spawnObstacle(kind = Math.random() < .35 ? "mine" : "barrier") {
    const lane = rand(-.9, .9);
    objects.push({
      type: "obstacle",
      kind,
      lane,
      progress: -0.08,
      w: kind === "barrier" ? .31 : .22,
      h: kind === "barrier" ? .19 : .22,
      rot: rand(-.3, .3),
      vr: kind === "mine" ? rand(-2, 2) : rand(-.45, .45),
      hit: false,
    });
  }

  function spawnPickup(kind = null, progress = -0.08, lane = rand(-.95, .95)) {
    const types = ["coin", "coin", "coin", "boost", "shield", "magnet"];
    kind = kind || types[(Math.random() * types.length) | 0];
    objects.push({
      type: "pickup",
      kind,
      lane,
      progress,
      w: .15,
      h: .15,
      rot: rand(0, Math.PI * 2),
      vr: rand(-2, 2),
      hit: false,
    });
  }

  function collect(o, sx, sy) {
    o.hit = true;
    if (o.kind === "coin") {
      combo += 1;
      comboTimer = 2.2;
      const gain = 35 + Math.min(120, combo * 6);
      score += gain;
      boostMeter = clamp(boostMeter + .035, 0, 1);
      addFloater(sx, sy, `+${gain}`, "#ffd166", 20);
      addParticles(sx, sy, "rgba(255,210,90,.9)", 16, 210);
      sfx("coin");
    } else if (o.kind === "boost") {
      boostMeter = clamp(boostMeter + .35, 0, 1);
      score += 60;
      addFloater(sx, sy, "BOOST+", "#72ffe0", 21);
      addParticles(sx, sy, "rgba(60,255,190,.9)", 20, 230);
      sfx("boost");
    } else if (o.kind === "shield") {
      shieldTimer = 7.0;
      score += 50;
      addFloater(sx, sy, "SHIELD", "#70b8ff", 21);
      addParticles(sx, sy, "rgba(70,170,255,.9)", 20, 230);
      sfx("shield");
    } else if (o.kind === "magnet") {
      magnetTimer = 7.0;
      score += 50;
      addFloater(sx, sy, "MAGNET", "#ff68d4", 21);
      addParticles(sx, sy, "rgba(255,90,210,.9)", 20, 230);
      sfx("magnet");
    }
  }

  function hitObstacle(o, sx, sy) {
    if (o.hit) return;
    o.hit = true;
    if (shieldTimer > 0 || player.invuln > 0) {
      shieldTimer = Math.max(0, shieldTimer - 2);
      score += 25;
      addFloater(sx, sy, "BLOCKED", "#a7f3ff", 20);
      addParticles(sx, sy, "rgba(120,240,255,.9)", 24, 270);
      screenShake = 8;
      sfx("shield");
      return;
    }
    lives -= 1;
    combo = 0;
    comboTimer = 0;
    player.invuln = 1.35;
    screenShake = 16;
    addFloater(sx, sy, "-1 LIFE", "#ff7a9c", 22);
    addParticles(sx, sy, "rgba(255,70,115,.95)", 32, 320);
    sfx("hit");
    if (lives <= 0) gameOver("Crashed!");
  }

  function activateBoost() {
    if (!running || paused || dead) return;
    if (boostMeter < .35 || boostTimer > 0) return;
    ensureAudio();
    boostTimer = 2.6 + boostMeter * 1.7;
    boostMeter = 0;
    screenShake = 5;
    sfx("boost");
    addFloater(W * .5, H * .34, "BOOST!", "#72ffe0", 26);
  }

  function jump() {
    if (!running || paused || dead) return;
    if (player.jump > 2) return;
    player.vy = 880;
    sfx("jump");
  }

  // -----------------------------
  // Controls
  // -----------------------------
  let pointerActive = false;
  let downX = 0, downY = 0, lastX = 0, lastY = 0;
  let moved = false;

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    ensureAudio();
    if (!running || dead) {
      resetGame();
      return;
    }
    if (paused) {
      paused = false;
      hidePanel();
      startMusic();
      return;
    }
    pointerActive = true;
    const p = pos(e);
    downX = lastX = p.x;
    downY = lastY = p.y;
    moved = false;
  }, { passive: false });

  canvas.addEventListener("pointermove", (e) => {
    if (!pointerActive || !running || paused) return;
    const p = pos(e);
    const dx = p.x - lastX;
    const dy = p.y - lastY;
    lastX = p.x;
    lastY = p.y;
    if (Math.abs(p.x - downX) > 8 || Math.abs(p.y - downY) > 8) moved = true;

    player.targetX = clamp(player.targetX + dx / Math.max(160, W * .28), -1, 1);
    if (dy < -34 && Math.abs(dy) > Math.abs(dx) * 1.1) {
      activateBoost();
    }
  }, { passive: true });

  function pointerUp(e) {
    if (!pointerActive) return;
    pointerActive = false;
    const totalDx = lastX - downX;
    const totalDy = lastY - downY;
    if (totalDy < -40 && Math.abs(totalDy) > Math.abs(totalDx) * 1.15) activateBoost();
    else if (!moved || Math.hypot(totalDx, totalDy) < 18) jump();
  }
  canvas.addEventListener("pointerup", pointerUp, { passive: true });
  canvas.addEventListener("pointercancel", pointerUp, { passive: true });
  canvas.addEventListener("pointerleave", pointerUp, { passive: true });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") player.targetX = clamp(player.targetX - .22, -1, 1);
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") player.targetX = clamp(player.targetX + .22, -1, 1);
    if (e.key === " " || e.key === "ArrowUp" || e.key.toLowerCase() === "w") jump();
    if (e.key.toLowerCase() === "b" || e.key === "Shift") activateBoost();
    if (e.key.toLowerCase() === "p") togglePause();
  });

  // -----------------------------
  // Update
  // -----------------------------
  function update(dt) {
    if (!running || paused || dead) return;

    speed = clamp(1 + distance / 1400 + (boostTimer > 0 ? .75 : 0), 1, 3.4);
    distance += dt * 100 * speed;
    score += dt * 14 * speed;
    if (score > best) best = Math.floor(score);

    if (boostTimer > 0) boostTimer = Math.max(0, boostTimer - dt);
    if (shieldTimer > 0) shieldTimer = Math.max(0, shieldTimer - dt);
    if (magnetTimer > 0) magnetTimer = Math.max(0, magnetTimer - dt);
    if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
    if (comboTimer > 0) comboTimer = Math.max(0, comboTimer - dt);
    else combo = 0;
    screenShake = Math.max(0, screenShake - dt * 35);

    player.x = lerp(player.x, player.targetX, 1 - Math.pow(.001, dt));
    player.tilt = lerp(player.tilt, (player.targetX - player.x) * -0.35, 1 - Math.pow(.01, dt));

    player.vy -= 2350 * dt;
    player.jump += player.vy * dt;
    if (player.jump <= 0) {
      player.jump = 0;
      player.vy = 0;
    }

    const travel = dt * speedPx * speed;
    spawnTimer -= dt * speed;
    pickupTimer -= dt * speed;

    if (spawnTimer <= 0) {
      spawnObstacle();
      spawnTimer = rand(.72, 1.15) / speed;
      if (speed > 2.1 && Math.random() < .25) {
        const old = objects[objects.length - 1];
        const lane = clamp(old.lane + rand(.45, .85) * (Math.random() < .5 ? -1 : 1), -1, 1);
        setTimeout(() => objects.push({ type:"obstacle", kind:"mine", lane, progress:-0.08, w:.22, h:.22, rot:0, vr:rand(-2,2), hit:false }), 80);
      }
    }

    if (pickupTimer <= 0) {
      spawnPickup();
      if (Math.random() < .36) spawnPickup("coin", -0.14, clamp(objects[objects.length - 1]?.lane + rand(-.22,.22) || rand(-.8,.8), -1, 1));
      pickupTimer = rand(.45, .82) / speed;
    }

    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];

      if (magnetTimer > 0 && o.type === "pickup") {
        const pull = clamp((o.progress - .45) * 2.2, 0, 1) * dt * 1.6;
        o.lane = lerp(o.lane, player.x, pull);
      }

      o.progress += travel;
      o.rot += (o.vr || 0) * dt;

      const s = worldToScreen(o.lane, o.progress);
      if (o.progress > 1.18) {
        objects.splice(i, 1);
        continue;
      }

      if (o.progress > .78 && o.progress < 1.04 && !o.hit) {
        const pScreen = {
          x: centerX() + player.x * lanePixels(1),
          y: playerY(),
          w: W * .14,
          h: H * .10
        };
        const objRect = {
          x: s.x - o.w * W * s.scale * .5,
          y: s.y - o.h * H * s.scale * .5,
          w: o.w * W * s.scale,
          h: o.h * H * s.scale,
        };
        const playerRect = {
          x: pScreen.x - pScreen.w * .5,
          y: pScreen.y - pScreen.h * .5,
          w: pScreen.w,
          h: pScreen.h,
        };

        if (rectsOverlap(playerRect, objRect)) {
          if (o.type === "pickup") {
            collect(o, s.x, s.y);
            objects.splice(i, 1);
          } else {
            const lowJumpSafe = o.kind === "barrier" && player.jump > H * .09;
            if (lowJumpSafe) {
              o.hit = true;
              score += 45;
              addFloater(s.x, s.y, "JUMPED!", "#9cfffb", 19);
              addParticles(s.x, s.y, "rgba(80,240,255,.8)", 14, 210);
            } else {
              hitObstacle(o, s.x, s.y);
              if (lives > 0) objects.splice(i, 1);
            }
          }
        }
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) { particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
    }

    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      f.age += dt;
      if (f.age >= f.life) { floaters.splice(i, 1); continue; }
      f.y += f.vy * dt;
    }

    trails.push({ x: centerX() + player.x * lanePixels(1), y: playerY() + H * .04, age: 0, life: .38, boost: boostTimer > 0 });
    for (let i = trails.length - 1; i >= 0; i--) {
      trails[i].age += dt;
      if (trails[i].age > trails[i].life) trails.splice(i, 1);
    }

    updateHUD();
  }

  // -----------------------------
  // Draw
  // -----------------------------
  function drawBackground(t) {
    const bg = images.bg || images.bgAlt;
    if (bg) {
      const par = Math.sin(t * .00025) * 10;
      ctx.drawImage(bg, 0, par - 12, W, H + 24);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#06101d");
      g.addColorStop(1, "#050816");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.fillStyle = "rgba(1,4,14,.20)";
    ctx.fillRect(0, 0, W, H);

    for (const p of bgBubbles) {
      const y = ((p.y * H + distance * p.sp) % (H + 40)) - 20;
      const x = p.x * W + Math.sin(t * .001 + p.x * 8) * 10;
      ctx.fillStyle = `rgba(${p.col},${p.a})`;
      ctx.beginPath();
      ctx.arc(x, y, p.s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawTrack(t) {
    const hy = horizonY();
    const bottom = H * .98;
    ctx.save();

    const leftH = W * .43, rightH = W * .57;
    const leftB = W * .04, rightB = W * .96;
    const trackG = ctx.createLinearGradient(0, hy, 0, bottom);
    trackG.addColorStop(0, "rgba(15,22,52,.60)");
    trackG.addColorStop(1, "rgba(8,10,24,.92)");
    ctx.fillStyle = trackG;
    ctx.beginPath();
    ctx.moveTo(leftH, hy);
    ctx.lineTo(rightH, hy);
    ctx.lineTo(rightB, bottom);
    ctx.lineTo(leftB, bottom);
    ctx.closePath();
    ctx.fill();

    // side glow rails
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0,240,255,.72)";
    ctx.beginPath(); ctx.moveTo(leftH, hy); ctx.lineTo(leftB, bottom); ctx.stroke();
    ctx.strokeStyle = "rgba(255,62,187,.68)";
    ctx.beginPath(); ctx.moveTo(rightH, hy); ctx.lineTo(rightB, bottom); ctx.stroke();

    const laneXs = [-.66, -.33, 0, .33, .66];
    for (let lx of laneXs) {
      ctx.strokeStyle = lx === 0 ? "rgba(255,255,255,.16)" : "rgba(95,230,255,.20)";
      ctx.lineWidth = lx === 0 ? 2 : 1.25;
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const p = i / 20;
        const y = lerp(hy, bottom, Math.pow(p, 1.55));
        const x = centerX() + lx * lanePixels(p);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    for (let i = 0; i < 15; i++) {
      const prog = ((i / 15 + (distance * .003) % 1) % 1);
      const y = lerp(hy, bottom, Math.pow(prog, 1.55));
      const left = centerX() - lanePixels(prog);
      const right = centerX() + lanePixels(prog);
      ctx.strokeStyle = `rgba(255,255,255,${0.05 + prog * .16})`;
      ctx.lineWidth = 1 + prog * 3;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
    }

    ctx.restore();
  }

  function drawImageCentered(img, x, y, w, h, rot = 0, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (img) ctx.drawImage(img, -w / 2, -h / 2, w, h);
    else {
      ctx.fillStyle = "white";
      ctx.fillRect(-w / 2, -h / 2, w, h);
    }
    ctx.restore();
  }

  function drawObjects() {
    const sorted = [...objects].sort((a, b) => a.progress - b.progress);
    for (const o of sorted) {
      const s = worldToScreen(o.lane, o.progress);
      const alpha = clamp((o.progress + .1) * 2, 0, 1);
      if (o.type === "obstacle") {
        const img = o.kind === "mine" ? images.mine : images.barrier;
        const ww = (o.kind === "mine" ? 82 : 126) * s.scale;
        const hh = (o.kind === "mine" ? 82 : 74) * s.scale;
        ctx.save();
        ctx.shadowColor = o.kind === "mine" ? "rgba(255,60,100,.9)" : "rgba(255,70,140,.75)";
        ctx.shadowBlur = 22 * s.scale;
        drawImageCentered(img, s.x, s.y, ww, hh, o.rot, alpha);
        ctx.restore();
      } else {
        const img = o.kind === "coin" ? images.coin :
          o.kind === "boost" ? images.boost :
          o.kind === "shield" ? images.shield : images.magnet;
        const size = (o.kind === "coin" ? 54 : 64) * s.scale;
        ctx.save();
        ctx.shadowColor = o.kind === "coin" ? "rgba(255,210,90,.85)" : "rgba(80,240,255,.75)";
        ctx.shadowBlur = 18 * s.scale;
        drawImageCentered(img, s.x, s.y, size, size, o.rot, alpha);
        ctx.restore();
      }
    }
  }

  function drawPlayer(t) {
    const x = centerX() + player.x * lanePixels(1);
    const y = playerY();
    const scale = clamp(W / 820, .78, 1.32);
    const w = 118 * scale;
    const h = 118 * scale;

    // shadow
    ctx.save();
    ctx.globalAlpha = .28 * (1 - clamp(player.jump / (H * .30), 0, .65));
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(x, H * .865, w * .42, h * .16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // trail
    for (const tr of trails) {
      const a = 1 - tr.age / tr.life;
      ctx.save();
      ctx.globalAlpha = a * (tr.boost ? .65 : .35);
      ctx.fillStyle = tr.boost ? "rgba(60,255,210,.55)" : "rgba(0,230,255,.35)";
      ctx.beginPath();
      ctx.ellipse(tr.x, tr.y + h * .32, w * .25 * a, h * .16 * a, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (shieldTimer > 0 || player.invuln > 0) {
      ctx.save();
      ctx.strokeStyle = shieldTimer > 0 ? "rgba(90,190,255,.85)" : "rgba(255,255,255,.36)";
      ctx.lineWidth = 4;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x, y, w * .62 + Math.sin(t * .008) * 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.tilt);
    if (boostTimer > 0) {
      ctx.globalAlpha = .8;
      const flame = ctx.createRadialGradient(0, h * .35, 4, 0, h * .60, h * .55);
      flame.addColorStop(0, "rgba(255,255,255,.95)");
      flame.addColorStop(.35, "rgba(60,255,210,.75)");
      flame.addColorStop(1, "rgba(60,255,210,0)");
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.ellipse(0, h * .50, w * .28, h * .38, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = (player.invuln > 0 && Math.sin(t * .04) > 0) ? .55 : 1;
    if (images.craft) ctx.drawImage(images.craft, -w / 2, -h / 2, w, h);
    else {
      ctx.fillStyle = "#23c2ff";
      ctx.beginPath(); ctx.arc(0, 0, w * .35, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      const a = 1 - p.age / p.life;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFloaters() {
    for (const f of floaters) {
      const a = 1 - f.age / f.life;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = `1000 ${f.size}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,.45)";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  function drawPaused() {
    if (!paused || !running) return;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,.32)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.font = "1000 30px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Paused", W * .5, H * .45);
    ctx.font = "800 14px system-ui, sans-serif";
    ctx.fillText("Tap Start, Pause, or the screen to continue", W * .5, H * .5);
    ctx.restore();
  }

  function draw(t) {
    const shake = screenShake > 0 ? { x: rand(-screenShake, screenShake), y: rand(-screenShake, screenShake) } : { x: 0, y: 0 };
    ctx.save();
    ctx.translate(shake.x, shake.y);
    drawBackground(t);
    drawTrack(t);
    drawObjects();
    drawParticles();
    drawPlayer(t);
    drawFloaters();
    if (boostTimer > 0) {
      ctx.fillStyle = `rgba(0,240,255,${0.035 + Math.sin(t * .025) * .02})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
    drawPaused();
  }

  function loop(t) {
    const dt = Math.min(.033, Math.max(.001, (t - lastT) / 1000));
    lastT = t;
    update(dt);
    draw(t);
    requestAnimationFrame(loop);
  }

  function togglePause() {
    if (!running || dead) return;
    paused = !paused;
    if (paused) {
      stopMusic();
      showPanel("Paused", "Tap Start or the screen to continue.\n\nSwipe to steer, tap to jump, and swipe up to boost.");
    } else {
      hidePanel();
      startMusic();
      lastT = performance.now();
    }
  }

  // Buttons
  btnStart && (btnStart.onclick = () => {
    ensureAudio();
    if (!running || dead) resetGame();
    else {
      paused = false;
      hidePanel();
      startMusic();
    }
  });

  btnOverlay && (btnOverlay.onclick = () => {
    paused = running && !dead ? true : paused;
    stopMusic();
    showPanel("How to play", "Drag left or right to steer your hovercraft.\nTap to jump over low red barriers.\nSwipe up to activate boost when the meter is charged.\nCollect yellow energy orbs, green boosts, blue shields, and pink magnets.\nAvoid barriers and mines.");
  });

  btnPause && (btnPause.onclick = togglePause);
  btnLaunch && (btnLaunch.onclick = () => { ensureAudio(); resetGame(); });
  btnRestart && (btnRestart.onclick = resetGame);
  btnSubmit && (btnSubmit.onclick = () => ggScore("global"));
  btnChat && (btnChat.onclick = () => {
    try { window.parent?.postMessage?.({ type: "GG_TOAST", text: "Chat coming soon" }, "*"); } catch {}
  });

  uiPause && (uiPause.onclick = togglePause);
  uiRestart && (uiRestart.onclick = () => { ensureAudio(); resetGame(); });
  uiMute && (uiMute.onclick = () => {
    muted = !muted;
    uiMute.textContent = muted ? "Muted" : "Sound";
    if (muted) stopMusic(); else if (running && !paused) startMusic();
  });

  window.addEventListener("message", (ev) => {
    const data = ev.data || {};
    const type = data.type || data.event;
    if (type === "GG_PAUSE") {
      paused = !!data.payload?.paused;
      if (paused) stopMusic(); else if (running) startMusic();
    }
    if (type === "GG_MUTE") {
      muted = !!data.payload?.muted;
      if (uiMute) uiMute.textContent = muted ? "Muted" : "Sound";
      if (muted) stopMusic();
    }
    if (type === "GG_RESTART") resetGame();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      paused = true;
      stopMusic();
    } else {
      lastT = performance.now();
    }
  });

  async function boot() {
    await loadAssets();
    resetBackgroundParticles();
    resize();
    showPanel("Neon Hover Runner", "Swipe or drag left and right to steer.\nTap to jump over low hazards.\nSwipe up to activate boost when the boost meter is ready.\nCollect energy, shields, magnets and boosts. Avoid barriers and mines.");
    updateHUD();
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
    requestAnimationFrame(loop);
  }
  boot();
})();