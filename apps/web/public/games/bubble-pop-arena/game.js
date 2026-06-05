(() => {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d', { alpha: false });
  canvas.style.touchAction = 'none';

  const elScore = document.getElementById('score');
  const elBest = document.getElementById('best');
  const elTime = document.getElementById('time');
  const elCombo = document.getElementById('combo');
  const elFreeze = document.getElementById('freeze');
  const elFever = document.getElementById('fever');
  const elTitle = document.getElementById('ggTitle');
  const elSub = document.getElementById('ggSub');

  const panel = document.getElementById('panel');
  const panelTitle = document.getElementById('panelTitle');
  const panelText = document.getElementById('panelText');
  const btnStart = document.getElementById('btnStart');
  const btnOverlay = document.getElementById('btnOverlay');
  const btnPause = document.getElementById('btnPause');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnRestart = document.getElementById('btnRestart');
  const btnChat = document.getElementById('btnChat');

  let META = { title: 'Bubble Pop Arena', description: '' };
  const BEST_KEY = 'gg_bubble_pop_best_v2';
  const GAME_SLUG = 'bubble-pop-arena';

  const ASSETS = {
    backgrounds: [
      './assets/backgrounds/bg-underwater.png',
      './assets/backgrounds/bg-lagoon.png',
      './assets/backgrounds/bg-cosmic.png',
    ],
    bubbles: {
      normal: './assets/bubbles/normal.png',
      time: './assets/bubbles/time.png',
      bomb: './assets/bubbles/bomb.png',
      freeze: './assets/bubbles/freeze.png',
      bonus: './assets/bubbles/bonus.png',
    }
  };

  let DPR = 1;
  let lastT = performance.now();
  let running = false;
  let paused = false;
  let gameOver = false;
  let submitted = false;

  let score = 0;
  let combo = 0;
  let timeLeft = 45;
  let comboWindow = 0;
  let freezeTimer = 0;
  let feverMeter = 0;
  let feverTimer = 0;
  let best = Number(localStorage.getItem(BEST_KEY) || '0') || 0;

  let spawnT = 0;
  let bubbles = [];
  let particles = [];
  let floatingTexts = [];
  let ambientBubbles = [];
  let activePointer = false;
  let pointerTrailCooldown = 0;

  let lastReportedScore = -1;
  let lastReportAt = 0;

  const images = { bg: [], bubble: {} };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const lerp = (a, b, t) => a + (b - a) * t;

  function cw() { return canvas.clientWidth || 360; }
  function ch() { return canvas.clientHeight || 640; }

  function resize() {
    const cssW = Math.max(1, canvas.clientWidth || window.innerWidth);
    const cssH = Math.max(1, canvas.clientHeight || window.innerHeight);
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(cssW * DPR);
    canvas.height = Math.floor(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function loadImageSafe(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function loadMeta() {
    try {
      const res = await fetch('./game.json', { cache: 'no-store' });
      META = (await res.json()) || META;
    } catch {}
    document.title = META.title || 'Bubble Pop Arena';
    if (elTitle) elTitle.textContent = META.title || 'Bubble Pop Arena';
    if (panelTitle) panelTitle.textContent = META.title || 'Bubble Pop Arena';
    if (panelText) panelText.textContent = META.description || 'Pop as many bubbles as you can before time runs out.';
    if (elSub) elSub.textContent = 'Drag or tap to pop • Catch time bubbles • Avoid bombs';
    try { window.GG?.init?.({ title: META.title || 'Bubble Pop Arena' }); } catch {}
  }

  async function loadAssets() {
    images.bg = await Promise.all(ASSETS.backgrounds.map(loadImageSafe));
    const keys = Object.keys(ASSETS.bubbles);
    const vals = await Promise.all(keys.map((k) => loadImageSafe(ASSETS.bubbles[k])));
    keys.forEach((k, i) => { images.bubble[k] = vals[i]; });
  }

  function canvasPointFromClient(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  function showPanel(title, text) {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (panel) panel.style.display = 'flex';
  }
  function hidePanel() {
    if (panel) panel.style.display = 'none';
  }

  function reportScoreLive(force = false) {
    const now = performance.now();
    if (!force) {
      if (score === lastReportedScore) return;
      if (now - lastReportAt < 80) return;
    }
    lastReportedScore = score;
    lastReportAt = now;
    try { window.GG?.setScore?.(score | 0); } catch {}
    try { window.parent?.postMessage?.({ type: 'GG_SCORE', slug: GAME_SLUG, score: score | 0 }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type: 'gg:score', slug: GAME_SLUG, score: score | 0 }, '*'); } catch {}
    try { window.dispatchEvent(new CustomEvent('gg:score', { detail: { slug: GAME_SLUG, score: score | 0 } })); } catch {}
  }

  function updateHud() {
    if (elScore) elScore.textContent = String(score | 0);
    if (elBest) elBest.textContent = String(best | 0);
    if (elCombo) elCombo.textContent = String(combo | 0);
    if (elTime) elTime.textContent = Math.max(0, timeLeft).toFixed(1);
    if (elFreeze) elFreeze.textContent = `${Math.max(0, freezeTimer).toFixed(1)}s`;
    if (elFever) elFever.textContent = feverTimer > 0 ? 'ACTIVE' : `${Math.round(clamp(feverMeter, 0, 1) * 100)}%`;
    reportScoreLive(false);
  }

  function resetAmbientBubbles() {
    ambientBubbles = [];
    for (let i = 0; i < 18; i++) {
      ambientBubbles.push({
        x: Math.random(),
        y: Math.random(),
        size: rnd(12, 42),
        speed: rnd(6, 18),
        sway: rnd(4, 18),
        phase: rnd(0, Math.PI * 2),
        alpha: rnd(0.12, 0.32),
      });
    }
  }

  function resetGame(showIntro = true) {
    running = false;
    paused = false;
    gameOver = false;
    submitted = false;
    score = 0;
    combo = 0;
    timeLeft = 45;
    comboWindow = 0;
    freezeTimer = 0;
    feverMeter = 0;
    feverTimer = 0;
    spawnT = 0;
    bubbles = [];
    particles = [];
    floatingTexts = [];
    activePointer = false;
    pointerTrailCooldown = 0;
    lastReportedScore = -1;
    resetAmbientBubbles();
    updateHud();
    if (showIntro) {
      showPanel(META.title || 'Bubble Pop Arena', META.description || 'Pop bubbles for points, chain combos, and avoid bombs.');
    }
  }

  function startGame() {
    running = true;
    paused = false;
    gameOver = false;
    submitted = false;
    score = 0;
    combo = 0;
    timeLeft = 45;
    comboWindow = 0;
    freezeTimer = 0;
    feverMeter = 0;
    feverTimer = 0;
    spawnT = 0;
    bubbles = [];
    particles = [];
    floatingTexts = [];
    activePointer = false;
    pointerTrailCooldown = 0;
    lastReportedScore = -1;
    hidePanel();
    for (let i = 0; i < 8; i++) spawnBubble(true);
    updateHud();
  }

  function togglePause() {
    if (!running || gameOver) return;
    paused = !paused;
    if (paused) showPanel('Paused', 'Tap Start or Pause to continue your round.');
    else hidePanel();
  }

  function submitScore() {
    if (submitted) return;
    submitted = true;
    reportScoreLive(true);
    try { window.GG?.submitScore?.(score | 0); } catch {}
  }

  function endGame(reason) {
    gameOver = true;
    running = false;
    paused = false;
    if (score > best) {
      best = score;
      localStorage.setItem(BEST_KEY, String(best));
    }
    updateHud();
    showPanel('Round Over', `${reason}\n\nScore: ${score} • Best: ${best}\nTap Start to play again.`);
    submitScore();
  }

  function bubbleColor(type) {
    switch (type) {
      case 'bomb': return 'rgba(255,80,110,0.95)';
      case 'time': return 'rgba(255,210,70,0.95)';
      case 'freeze': return 'rgba(110,240,255,0.95)';
      case 'bonus': return 'rgba(225,90,255,0.95)';
      default: return 'rgba(73,153,255,0.95)';
    }
  }

  function spawnBubble(seedStart = false) {
    const w = cw(), h = ch();
    const levelFactor = clamp(score / 1800, 0, 1.4);
    const largeChance = Math.random() < 0.14;
    const r = largeChance ? rnd(34, 56) : rnd(20, 44);
    const x = rnd(r + 8, w - r - 8);
    const y = seedStart ? rnd(h * 0.25, h * 0.92) : h + r + 20;
    const speedMul = freezeTimer > 0 ? 0.62 : 1;
    const vy = (seedStart ? rnd(-60, -150) : -rnd(92, 170)) * (1 + levelFactor * 0.35) * speedMul;
    const vx = rnd(-30, 30) * speedMul;

    let roll = Math.random();
    let type = 'normal';
    if (roll < 0.08) type = 'bomb';
    else if (roll < 0.18) type = 'time';
    else if (roll < 0.25) type = 'freeze';
    else if (roll < 0.33) type = 'bonus';

    const ttl = rnd(3.2, 5.2);
    bubbles.push({
      x, y, r, vx, vy, type, ttl,
      pulse: rnd(0, Math.PI * 2),
      spin: rnd(-1, 1),
      popped: false,
    });
  }

  function multiplierForCombo(c) {
    if (feverTimer > 0) return 2.25;
    if (c >= 12) return 1.9;
    if (c >= 8) return 1.55;
    if (c >= 4) return 1.25;
    return 1;
  }

  function addFloatingText(x, y, text, color = '#fff', size = 18) {
    floatingTexts.push({ x, y, text, color, size, t: 0.85, vy: rnd(-34, -22) });
  }

  function popParticles(x, y, baseColor, count = 14, radius = 0) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = rnd(55, 210) + radius * 0.8;
      particles.push({
        x, y,
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - rnd(25, 100),
        t: rnd(0.35, 0.9),
        r: rnd(2.5, 6.5),
        color: baseColor,
      });
    }
  }

  function triggerFever() {
    feverTimer = 5.5;
    feverMeter = 1;
    addFloatingText(cw() * 0.5, ch() * 0.28, 'FEVER!', '#ffd5ff', 28);
  }

  function onPop(b) {
    if (b.type === 'bomb') {
      combo = 0;
      comboWindow = 0;
      feverMeter = Math.max(0, feverMeter - 0.35);
      score = Math.max(0, score - 30);
      addFloatingText(b.x, b.y, '-30', '#ff7b93', 20);
      popParticles(b.x, b.y, bubbleColor('bomb'), 24, b.r);
      return;
    }

    combo += 1;
    comboWindow = 1.2;
    feverMeter = clamp(feverMeter + 0.08, 0, 1);
    if (feverMeter >= 1 && feverTimer <= 0) triggerFever();

    const mult = multiplierForCombo(combo);
    let base = Math.round(10 + b.r * 0.48);
    if (b.type === 'time') base += 6;
    if (b.type === 'freeze') base += 8;
    if (b.type === 'bonus') base += 18;
    const gained = Math.round(base * mult);
    score += gained;
    popParticles(b.x, b.y, bubbleColor(b.type), b.type === 'bonus' ? 22 : 16, b.r);
    addFloatingText(b.x, b.y, `+${gained}`, b.type === 'time' ? '#ffe486' : b.type === 'freeze' ? '#9ff7ff' : b.type === 'bonus' ? '#ffb0ff' : '#dff4ff', b.type === 'bonus' ? 22 : 18);

    if (b.type === 'time') {
      timeLeft += 2.4;
      addFloatingText(b.x, b.y - 20, '+2.4s', '#ffe486', 18);
    } else if (b.type === 'freeze') {
      freezeTimer = Math.min(8, freezeTimer + 3.5);
      addFloatingText(b.x, b.y - 20, 'FREEZE', '#9ff7ff', 18);
    } else if (b.type === 'bonus') {
      score += 20;
      addFloatingText(b.x, b.y - 22, 'BONUS!', '#ffb0ff', 20);
    }
  }

  function tryPopAt(px, py) {
    if (!running || paused || gameOver) return false;
    let bestI = -1;
    let bestD2 = 1e18;
    for (let i = 0; i < bubbles.length; i++) {
      const b = bubbles[i];
      const dx = px - b.x;
      const dy = py - b.y;
      const d2 = dx * dx + dy * dy;
      const rr = b.r + 14;
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
      playPopTone(b.type);
      return true;
    }
    return false;
  }

  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    }
    if (audioCtx?.state === 'suspended') audioCtx.resume().catch(() => {});
  }
  function playPopTone(type) {
    ensureAudio();
    if (!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const now = audioCtx.currentTime;
    const freq = type === 'bomb' ? 160 : type === 'time' ? 720 : type === 'freeze' ? 480 : type === 'bonus' ? 860 : 620;
    o.type = type === 'bomb' ? 'square' : 'sine';
    o.frequency.setValueAtTime(freq, now);
    o.frequency.exponentialRampToValueAtTime(type === 'bomb' ? 110 : freq * 1.12, now + 0.07);
    g.gain.setValueAtTime(type === 'bomb' ? 0.045 : 0.03, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + (type === 'bomb' ? 0.15 : 0.11));
    o.connect(g); g.connect(audioCtx.destination); o.start(now); o.stop(now + 0.16);
  }

  function onPointerDown(e) {
    e.preventDefault?.();
    ensureAudio();
    const p = canvasPointFromClient(e.clientX, e.clientY);
    activePointer = true;
    pointerTrailCooldown = 0;

    if (!running && !gameOver) {
      startGame();
      return;
    }
    if (gameOver) {
      startGame();
      return;
    }
    tryPopAt(p.x, p.y);
  }
  function onPointerMove(e) {
    if (!activePointer) return;
    const p = canvasPointFromClient(e.clientX, e.clientY);
    if (pointerTrailCooldown <= 0) {
      if (tryPopAt(p.x, p.y)) pointerTrailCooldown = 0.02;
    }
  }
  function onPointerUp() {
    activePointer = false;
  }

  canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
  canvas.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('pointerup', onPointerUp, { passive: true });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: true });
  canvas.addEventListener('pointerleave', onPointerUp, { passive: true });

  btnStart?.addEventListener('click', () => {
    ensureAudio();
    if (gameOver || !running) startGame();
    else togglePause();
  });
  btnPause?.addEventListener('click', togglePause);
  btnRestart?.addEventListener('click', () => { resetGame(false); startGame(); });
  btnSubmit?.addEventListener('click', submitScore);
  btnOverlay?.addEventListener('click', () => window.GG?.openOverlay?.());
  btnChat?.addEventListener('click', () => { window.GG?.openOverlay?.(); window.GG?.openChat?.(); });

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (gameOver || !running) startGame();
      else togglePause();
    }
    if (e.key.toLowerCase() === 'p') togglePause();
  });

  function update(dt) {
    if (!running || paused || gameOver) return;
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateHud();
      endGame('Time\'s up!');
      return;
    }

    pointerTrailCooldown = Math.max(0, pointerTrailCooldown - dt);
    comboWindow -= dt;
    if (comboWindow <= 0 && combo !== 0) {
      combo = 0;
      comboWindow = 0;
    }

    if (freezeTimer > 0) freezeTimer = Math.max(0, freezeTimer - dt);
    if (feverTimer > 0) {
      feverTimer = Math.max(0, feverTimer - dt);
      if (feverTimer <= 0) feverMeter = 0.35;
    }

    spawnT += dt;
    const freezeMul = freezeTimer > 0 ? 1.25 : 1;
    const feverMul = feverTimer > 0 ? 0.7 : 1;
    const spawnEvery = clamp(0.58 - score * 0.00003, 0.22, 0.58) * freezeMul * feverMul;
    while (spawnT >= spawnEvery) {
      spawnT -= spawnEvery;
      spawnBubble(false);
    }

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      const speedMul = freezeTimer > 0 ? 0.68 : 1;
      b.x += b.vx * dt * speedMul;
      b.y += b.vy * dt * speedMul;
      b.ttl -= dt;
      b.pulse += dt * (1.8 + b.spin * 0.2);

      if (b.x < b.r + 6) { b.x = b.r + 6; b.vx *= -0.85; }
      else if (b.x > cw() - b.r - 6) { b.x = cw() - b.r - 6; b.vx *= -0.85; }

      const offTop = b.y + b.r < -30;
      if (b.ttl <= 0 || offTop) {
        if (b.type !== 'bomb') {
          combo = 0;
          comboWindow = 0;
        }
        bubbles.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t -= dt;
      if (p.t <= 0) { particles.splice(i, 1); continue; }
      p.vy += 420 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const f = floatingTexts[i];
      f.t -= dt;
      if (f.t <= 0) { floatingTexts.splice(i, 1); continue; }
      f.y += f.vy * dt;
    }

    updateHud();
  }

  function drawBackground() {
    const w = cw(), h = ch();
    ctx.fillStyle = '#06101f';
    ctx.fillRect(0, 0, w, h);

    const phase = performance.now() * 0.00003;
    const bgIndex = Math.floor((performance.now() * 0.00003 + score / 1600) % Math.max(1, images.bg.length));
    const bg = images.bg[bgIndex] || null;
    if (bg) {
      const parallax = Math.sin(performance.now() * 0.00025) * 12;
      const drawW = w;
      const drawH = h;
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.drawImage(bg, 0, parallax - 8, drawW, drawH + 16);
      ctx.restore();
    }

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(8,11,36,0.26)');
    grad.addColorStop(1, 'rgba(3,10,20,0.44)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (const b of ambientBubbles) {
      const x = b.x * w + Math.sin(phase * 9 + b.phase) * b.sway;
      const y = (b.y * h + (performance.now() * 0.001 * b.speed)) % (h + b.size * 2) - b.size;
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.strokeStyle = 'rgba(255,255,255,.55)';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(x, h - y, b.size * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function fallbackBubble(b) {
    const col = bubbleColor(b.type);
    ctx.save();
    ctx.shadowColor = col;
    ctx.shadowBlur = 22;
    const g = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, 0, b.x, b.y, b.r * 1.1);
    g.addColorStop(0, 'rgba(255,255,255,0.75)');
    g.addColorStop(0.3, col);
    g.addColorStop(1, 'rgba(18,26,60,0.96)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.28, b.y - b.r * 0.28, b.r * 0.36, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawBubble(b) {
    const sprite = images.bubble[b.type];
    const bob = Math.sin(b.pulse) * b.r * 0.04;
    const rr = b.r * (1 + (b.type === 'bonus' ? 0.06 * Math.sin(b.pulse * 2.1) : 0));
    if (sprite) {
      ctx.save();
      const glowAlpha = b.type === 'bonus' ? 0.34 : b.type === 'freeze' ? 0.25 : 0.18;
      ctx.globalAlpha = glowAlpha;
      ctx.drawImage(sprite, b.x - rr * 1.22, b.y - rr * 1.22 + bob, rr * 2.44, rr * 2.44);
      ctx.restore();
      ctx.drawImage(sprite, b.x - rr, b.y - rr + bob, rr * 2, rr * 2);
    } else {
      fallbackBubble({ ...b, y: b.y + bob, r: rr });
    }

    if (b.type === 'bonus' && feverTimer > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.32)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, rr * 1.12 + Math.sin(b.pulse * 2) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      const a = clamp(p.t * 1.4, 0, 1);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFloatingTexts() {
    for (const f of floatingTexts) {
      ctx.save();
      ctx.globalAlpha = clamp(f.t * 1.3, 0, 1);
      ctx.fillStyle = f.color;
      ctx.strokeStyle = 'rgba(8,10,30,.55)';
      ctx.lineWidth = 3;
      ctx.font = `1000 ${f.size}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  function drawComboBanner() {
    if (!running || combo < 3) return;
    const w = cw();
    const text = feverTimer > 0 ? `FEVER x${multiplierForCombo(combo).toFixed(2)}` : `COMBO x${multiplierForCombo(combo).toFixed(2)}`;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.font = '1000 20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = feverTimer > 0 ? '#ffd9ff' : '#dbf4ff';
    ctx.strokeStyle = 'rgba(10,16,36,.5)';
    ctx.lineWidth = 4;
    ctx.strokeText(text, w * 0.5, 36);
    ctx.fillText(text, w * 0.5, 36);
    ctx.restore();
  }

  function drawIdleOverlay() {
    if (running || gameOver) return;
    const w = cw(), h = ch();
    ctx.save();
    ctx.fillStyle = 'rgba(4,7,18,.26)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.96)';
    ctx.font = '1000 18px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Tap Start or tap the screen to begin', w * 0.5, h * 0.43);
    ctx.font = '900 14px system-ui';
    ctx.fillStyle = 'rgba(255,255,255,.78)';
    ctx.fillText('Drag across bubbles for fast pops • Avoid red bomb bubbles', w * 0.5, h * 0.50);
    ctx.restore();
  }

  function draw() {
    drawBackground();
    for (const b of bubbles) drawBubble(b);
    drawParticles();
    drawFloatingTexts();
    drawComboBanner();
    drawIdleOverlay();
  }

  function loop(t) {
    const dt = Math.min(0.033, Math.max(0.001, (t - lastT) / 1000));
    lastT = t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  async function boot() {
    await loadMeta();
    await loadAssets();
    resize();
    resetGame(true);
    updateHud();
    requestAnimationFrame(loop);
    window.addEventListener('resize', resize, { passive: true });
  }

  boot();
})();
