
(() => {
  const canvas = document.getElementById("c");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: false });
  const $ = (id) => document.getElementById(id);

  const elScore = $("score");
  const elLives = $("lives");
  const elCombo = $("combo");
  const elBest = $("best");
  const elPanel = $("panel");
  const elPanelTitle = $("panelTitle");
  const elPanelText = $("panelText");
  const frenzyFill = $("frenzyFill");
  const btnStart = $("btnStart");
  const btnHow = $("btnHow");
  const btnPause = $("btnPause");
  const btnRestart = $("btnRestart");
  const btnSubmit = $("btnSubmit");
  const btnMute = $("btnMute");
  const btnLaunch = $("btnLaunch");

  const GAME_SLUG = "fruit-slice";
  const BEST_KEY = "gg_fruit_slice_best_v2";

  let W = 1, H = 1, DPR = 1;
  let running = false, paused = false, pointerDown = false, muted = false;
  let score = 0, lives = 3, combo = 0, best = Number(localStorage.getItem(BEST_KEY) || 0) || 0;
  let lastSliceAt = 0, comboWindowMs = 900;
  let frenzyMeter = 0, frenzyTimer = 0, finalSubmitted = false;
  let screenShake = 0;

  let lastTs = performance.now();
  const objects = [];
  const particles = [];
  const halves = [];
  const splashes = [];
  const floaters = [];
  const trail = [];
  const ambient = [];
  const MAX_TRAIL = 18;

  const spritePaths = {
    apple: "./assets/fruits/apple.png",
    orange: "./assets/fruits/orange.png",
    watermelon: "./assets/fruits/watermelon.png",
    kiwi: "./assets/fruits/kiwi.png",
    pineapple: "./assets/fruits/pineapple.png",
    bomb: "./assets/fruits/bomb.png",
    bg: "./assets/backgrounds/dojo-sunset.png",
  };
  const imgs = {};

  const FRUITS = [
    { key: "apple", tint: "#ff5e62", base: 14 },
    { key: "orange", tint: "#ffb020", base: 16 },
    { key: "watermelon", tint: "#ff4d6d", base: 18 },
    { key: "kiwi", tint: "#6ee7b7", base: 15 },
    { key: "pineapple", tint: "#facc15", base: 19 },
  ];

  let ggLastLiveScore = -1;
  function ggSetSlug() { try { window.GG?.setSlug?.(GAME_SLUG); } catch {} }
  function ggPostLiveScore(val) {
    try { if (window.GG?.setScore) window.GG.setScore(val); } catch {}
    try { window.parent?.postMessage?.({ type: "GG_SCORE", slug: GAME_SLUG, score: val }, "*"); } catch {}
    try { window.parent?.postMessage?.({ type: "gg:score", slug: GAME_SLUG, score: val }, "*"); } catch {}
    try { window.dispatchEvent(new CustomEvent("gg:score", { detail: { slug: GAME_SLUG, score: val } })); } catch {}
  }
  function ggSubmitFinalScore(val) {
    try { window.GG?.submitScore?.(val, { board: "global" }); } catch {}
    ggPostLiveScore(val);
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function loadImage(src) { return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }); }
  async function loadAssets() {
    const entries = Object.entries(spritePaths);
    const vals = await Promise.all(entries.map(([, src]) => loadImage(src)));
    entries.forEach(([key], idx) => imgs[key] = vals[idx]);
  }

  function resize() {
    const r = canvas.parentElement?.getBoundingClientRect?.() || { width: innerWidth, height: innerHeight };
    DPR = Math.min(2, devicePixelRatio || 1);
    W = Math.max(1, Math.floor(r.width));
    H = Math.max(1, Math.floor(r.height));
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  addEventListener("resize", resize, { passive: true });

  function updateHUD() {
    if (elScore) elScore.textContent = String(score);
    if (elLives) elLives.textContent = String(lives);
    if (elCombo) elCombo.textContent = String(combo);
    if (elBest) elBest.textContent = String(best);
    if (frenzyFill) frenzyFill.style.width = `${Math.round(clamp(frenzyTimer > 0 ? frenzyTimer / 7 : frenzyMeter, 0, 1) * 100)}%`;
    if (score !== ggLastLiveScore) { ggLastLiveScore = score; ggPostLiveScore(score); }
  }

  function setPanel(title, text) {
    if (elPanelTitle) elPanelTitle.textContent = title;
    if (elPanelText) elPanelText.textContent = text;
    if (elPanel) elPanel.style.display = "flex";
  }
  function hidePanel() { if (elPanel) elPanel.style.display = "none"; }

  function makeAmbient() {
    ambient.length = 0;
    for (let i = 0; i < 24; i++) ambient.push({ x: Math.random(), y: Math.random(), r: rand(2, 7), sp: rand(12, 26), a: rand(0.08, 0.22), hue: rand(0, 1) });
  }

  function resetGame(startNow = false) {
    running = !!startNow; paused = false; score = 0; lives = 3; combo = 0; frenzyMeter = 0; frenzyTimer = 0; lastSliceAt = 0; finalSubmitted = false;
    objects.length = 0; particles.length = 0; halves.length = 0; splashes.length = 0; floaters.length = 0; trail.length = 0; screenShake = 0; ggLastLiveScore = -1;
    spawnLogic.nextAt = 0;
    makeAmbient();
    if (startNow) {
      hidePanel();
      spawnBurst(3, false);
      sfx("start");
      musicStart();
    } else {
      setPanel("Fruit Slice", "Swipe across the screen to slice fruit. Avoid bombs. Build combos for bonus points and fill the frenzy meter for frenzy mode.");
    }
    updateHUD();
  }

  function startGame() { resetGame(true); }
  function endGame(reason = "Game Over") {
    running = false; paused = false;
    if (score > best) { best = score; localStorage.setItem(BEST_KEY, String(best)); }
    setPanel(reason, `Score: ${score}\nBest: ${best}\n\nSlice fruit fast to build combos and trigger frenzy mode.`);
    sfx(reason.includes("Boom") ? "boom" : "gameover");
    if (!finalSubmitted) { finalSubmitted = true; ggSubmitFinalScore(score); }
    musicStop();
    updateHUD();
  }

  // GG host controls
  addEventListener("message", (e) => {
    const payload = e.data || {}; const type = payload.type || payload.event;
    if (type === "GG_PAUSE") paused = !!payload.paused;
    if (type === "GG_MUTE") { muted = !!payload.muted; if (btnMute) btnMute.textContent = muted ? "Muted" : "Sound"; }
    if (type === "GG_RESTART") startGame();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { paused = true; musicStop(); }
    else { lastTs = performance.now(); if (running) musicStart(); }
  });

  // Audio
  let AC = null, master = null, musicNodes = [];
  function ensureAudio() {
    if (muted) return null;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    if (!AC) { AC = new C(); master = AC.createGain(); master.gain.value = 0.14; master.connect(AC.destination); }
    if (AC.state === "suspended") AC.resume().catch(() => {});
    return AC;
  }
  function tone(f, d, t = 0, type = "sine", v = 0.6) {
    if (muted) return; const ac = ensureAudio(); if (!ac) return; const now = ac.currentTime + t;
    const osc = ac.createOscillator(); const gain = ac.createGain();
    osc.type = type; osc.frequency.setValueAtTime(f, now);
    gain.gain.setValueAtTime(0.0001, now); gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, v), now + 0.012); gain.gain.exponentialRampToValueAtTime(0.0001, now + d);
    osc.connect(gain); gain.connect(master); osc.start(now); osc.stop(now + d + 0.03);
  }
  function noiseBurst(duration=0.12, amp=0.3){
    if(muted) return; const ac=ensureAudio(); if(!ac) return; const buffer=ac.createBuffer(1, ac.sampleRate*duration, ac.sampleRate); const data=buffer.getChannelData(0); for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length); const src=ac.createBufferSource(); const gain=ac.createGain(); src.buffer=buffer; gain.gain.value=amp*0.12; src.connect(gain); gain.connect(master); src.start(); src.stop(ac.currentTime+duration);
  }
  function sfx(name) {
    if (name === "slice") { tone(680,0.04,0,"triangle",0.52); tone(920,0.05,0.018,"triangle",0.45); return; }
    if (name === "combo") { tone(880,0.05,0,"sine",0.56); tone(1240,0.06,0.03,"sine",0.46); return; }
    if (name === "gold") { tone(920,0.06,0,"triangle",0.6); tone(1380,0.08,0.03,"triangle",0.5); tone(1720,0.09,0.06,"sine",0.4); return; }
    if (name === "miss") { tone(200,0.07,0,"sawtooth",0.5); tone(140,0.11,0.05,"sine",0.45); return; }
    if (name === "boom") { noiseBurst(0.18,0.9); tone(120,0.18,0,"sawtooth",0.66); tone(80,0.22,0.06,"sine",0.6); return; }
    if (name === "start") { tone(320,0.04,0,"triangle",0.52); tone(520,0.05,0.05,"triangle",0.6); return; }
    if (name === "gameover") { tone(220,0.1,0,"sawtooth",0.5); tone(160,0.14,0.1,"sine",0.45); tone(110,0.18,0.22,"sine",0.42); return; }
    if (name === "frenzy") { tone(620,0.08,0,"triangle",0.55); tone(900,0.08,0.06,"triangle",0.5); tone(1220,0.1,0.12,"triangle",0.45); return; }
  }
  function musicStop(){ musicNodes.forEach(n=>{ try{ n.stop(); }catch{} }); musicNodes=[]; }
  function musicStart(){
    if(muted||!running) return; const ac=ensureAudio(); if(!ac) return; musicStop();
    const notes=[220,277,330,392,330,277,247,330];
    const now=ac.currentTime+0.05; let t=0;
    for(let i=0;i<notes.length;i++){
      const osc=ac.createOscillator(); const gain=ac.createGain(); osc.type='triangle'; osc.frequency.value=notes[i]; gain.gain.value=0.0001; gain.gain.setValueAtTime(0.0001, now+t); gain.gain.linearRampToValueAtTime(0.018, now+t+0.02); gain.gain.linearRampToValueAtTime(0.0001, now+t+0.34); osc.connect(gain); gain.connect(master); osc.start(now+t); osc.stop(now+t+0.36); musicNodes.push(osc); t += 0.24; }
    clearTimeout(musicStart._timer); musicStart._timer=setTimeout(()=>{ if(running&&!paused&&!muted) musicStart(); }, 1900);
  }

  // Gameplay
  function spawnOne(isBomb = false, isGolden = false) {
    const x = rand(W * 0.16, W * 0.84);
    const y = H + rand(40, 100);
    const vx = rand(-130, 130);
    const vy = -rand(600, 860) * (frenzyTimer > 0 ? 1.12 : 1);
    const g = rand(900, 1100);
    if (isBomb) {
      const r = rand(26, 34);
      objects.push({ kind: "bomb", key: "bomb", x, y, vx, vy, g, r, rot: rand(-2,2), vr: rand(-1.8,1.8), sliced: false, value: 0, ttl: 0, tint: "#ef4444", golden: false });
      return;
    }
    const fruit = FRUITS[(Math.random() * FRUITS.length) | 0];
    const scale = fruit.key === "pineapple" ? rand(1.05, 1.2) : rand(0.95, 1.12);
    const r = rand(28, 40) * scale;
    objects.push({ kind: "fruit", key: fruit.key, x, y, vx, vy, g, r, rot: rand(-1,1), vr: rand(-1.3,1.3), sliced: false, value: (isGolden ? 34 : fruit.base) + Math.round(r*0.15), ttl: 0, tint: fruit.tint, golden: isGolden });
  }

  function spawnBurst(n = 3, allowBomb = true) {
    const bombs = allowBomb && Math.random() < 0.22 ? 1 : 0;
    const gold = Math.random() < 0.12 ? 1 : 0;
    for (let i = 0; i < n; i++) spawnOne(false, i===0 && gold===1);
    for (let i = 0; i < bombs; i++) spawnOne(true);
  }
  function spawnLogic(nowMs) {
    const base = 900;
    const rate = Math.max(350, base - score * 1.2 - (frenzyTimer>0?120:0));
    const burstChance = Math.min(0.62, 0.24 + score / 2200 + (frenzyTimer>0?0.08:0));
    if (!spawnLogic.nextAt) spawnLogic.nextAt = nowMs + 550;
    if (nowMs >= spawnLogic.nextAt) {
      const burst = Math.random() < burstChance;
      spawnBurst(burst ? (frenzyTimer>0?5:4) : 2, true);
      spawnLogic.nextAt = nowMs + rate;
    }
  }
  spawnLogic.nextAt = 0;

  function addTrailPoint(x, y, t) { trail.push({ x, y, t }); while (trail.length > MAX_TRAIL) trail.shift(); }
  function clearTrail() { trail.length = 0; }
  function pointLineDist(px, py, ax, ay, bx, by) {
    const abx = bx - ax, aby = by - ay, apx = px - ax, apy = py - ay;
    const ab2 = abx * abx + aby * aby;
    const tt = ab2 ? Math.max(0, Math.min(1, (apx * abx + apy * aby) / ab2)) : 0;
    const cx = ax + abx * tt, cy = ay + aby * tt;
    return Math.hypot(px - cx, py - cy);
  }
  function trySliceSegment(ax, ay, bx, by, nowMs) {
    for (const o of objects) {
      if (o.sliced) continue;
      const d = pointLineDist(o.x, o.y, ax, ay, bx, by);
      if (d <= o.r + 12) sliceObject(o, ax, ay, bx, by, nowMs);
    }
  }

  function addParticles(x, y, color, count = 18, speed=220) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(speed*0.3, speed);
      particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s - rand(20,80), r: rand(2.5, 6), life: rand(.4,.9), age:0, color });
    }
  }
  function addSplash(x, y, color, r) { splashes.push({ x, y, color, r, age:0, life:.35 }); }
  function addFloater(x, y, text, color="#fff", size=22){ floaters.push({x,y,text,color,size,age:0,life:.9,vy:rand(-50,-30)}); }

  function spawnHalves(o, ax, ay, bx, by) {
    const angle = Math.atan2(by - ay, bx - ax);
    const sprite = imgs[o.key] || null;
    for (const side of [-1,1]) {
      halves.push({
        sprite, x:o.x, y:o.y, r:o.r, life:1.05, age:0, side,
        vx:o.vx*0.18 + Math.cos(angle + Math.PI/2*side) * rand(90,160),
        vy:o.vy*0.12 - rand(20,120),
        vr: side*rand(2,4), rot:o.rot,
        angle, kind:o.key,
      });
    }
  }

  function triggerFrenzy(){ frenzyTimer = 7; frenzyMeter = 1; addFloater(W*0.5, H*0.24, "FRENZY!", "#ffd166", 34); sfx("frenzy"); }

  function sliceObject(o, ax, ay, bx, by, nowMs) {
    o.sliced = true;
    if (nowMs - lastSliceAt <= comboWindowMs) { combo += 1; if (combo > 1) sfx("combo"); }
    else combo = 1;
    lastSliceAt = nowMs;

    if (o.kind === "bomb") {
      screenShake = 14;
      addParticles(o.x, o.y, "#ff5757", 46, 340); addSplash(o.x,o.y,"rgba(255,70,70,.5)", o.r*1.3); sfx("boom");
      endGame("💣 Boom!");
      return;
    }

    spawnHalves(o, ax, ay, bx, by);
    addParticles(o.x, o.y, o.golden ? "#ffd166" : o.tint, o.golden ? 28 : 20, 260);
    addSplash(o.x, o.y, o.golden ? "rgba(255,209,102,.55)" : `${o.tint}88`, o.r*1.1);
    sfx(o.golden ? "gold" : "slice");

    let gained = o.value;
    if (combo >= 3) gained += combo * 2;
    if (frenzyTimer > 0) gained = Math.round(gained * 1.6);
    if (o.golden) gained += 24;
    score += gained;
    frenzyMeter = clamp(frenzyMeter + (o.golden ? 0.16 : 0.055), 0, 1);
    if (frenzyMeter >= 1 && frenzyTimer <= 0) triggerFrenzy();
    addFloater(o.x, o.y, `+${gained}`, o.golden ? "#ffe08a" : "#ffffff", o.golden ? 28 : 22);
    updateHUD();
  }

  function objectMissed(o){
    if (o.kind !== "bomb") {
      lives -= 1; combo = 0; frenzyMeter = Math.max(0, frenzyMeter - 0.14); addFloater(o.x, H-46, "MISS", "#ff9ca3", 22); addParticles(o.x, H-16, "#ff9ca3", 10, 140); sfx("miss"); updateHUD();
      if (lives <= 0) endGame("No lives left");
    }
  }

  // Input
  function posFromEvent(e){ const r=canvas.getBoundingClientRect(); return { x:e.clientX-r.left, y:e.clientY-r.top }; }
  function pointerStart(e){ e.preventDefault?.(); ensureAudio(); if(!running){ startGame(); return; } if(paused){ paused=false; hidePanel(); musicStart(); return; } pointerDown=true; const p=posFromEvent(e); addTrailPoint(p.x,p.y,performance.now()); }
  function pointerMove(e){ if(!pointerDown||!running||paused) return; const p=posFromEvent(e); const now=performance.now(); const last=trail[trail.length-1]; if(last){ trySliceSegment(last.x,last.y,p.x,p.y,now); } addTrailPoint(p.x,p.y,now); }
  function pointerEnd(){ pointerDown=false; setTimeout(clearTrail, 50); }
  canvas.addEventListener("pointerdown", pointerStart, { passive:false });
  canvas.addEventListener("pointermove", pointerMove, { passive:true });
  canvas.addEventListener("pointerup", pointerEnd, { passive:true });
  canvas.addEventListener("pointercancel", pointerEnd, { passive:true });
  canvas.addEventListener("pointerleave", pointerEnd, { passive:true });
  window.addEventListener("pointerdown", () => ensureAudio(), { once:true, passive:true });

  // UI buttons
  btnStart?.addEventListener("click", () => { ensureAudio(); if(!running) startGame(); else { paused=false; hidePanel(); musicStart(); } });
  btnHow?.addEventListener("click", () => setPanel("How to Play", "Swipe across fruit to slice it.\n\n• Each sliced fruit scores points\n• Bombs end the run instantly\n• Missed fruit costs a life\n• Chain slices for combos\n• Fill the frenzy bar for bonus scoring"));
  btnPause?.addEventListener("click", () => {
    if(!running) return; paused = !paused; if(paused){ setPanel("Paused", "Tap Start to continue, or Restart to start fresh."); musicStop(); } else { hidePanel(); lastTs = performance.now(); musicStart(); }
  });
  btnRestart?.addEventListener("click", startGame);
  btnSubmit?.addEventListener("click", () => ggSubmitFinalScore(score));
  btnMute?.addEventListener("click", () => { muted = !muted; btnMute.textContent = muted ? "Muted" : "Sound"; if (muted) musicStop(); else if (running && !paused) musicStart(); });
  btnLaunch?.addEventListener("click", startGame);

  // update and draw
  function update(dt, nowMs){
    screenShake = Math.max(0, screenShake - dt*30);
    if(!running || paused) return;
    if (frenzyTimer > 0) frenzyTimer = Math.max(0, frenzyTimer - dt);
    else frenzyMeter = Math.max(0, frenzyMeter - dt * 0.014);

    spawnLogic(nowMs);

    for(let i=objects.length-1;i>=0;i--){
      const o=objects[i];
      o.vy += o.g * dt;
      o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.vr * dt; o.ttl += dt;
      if (o.y - o.r > H + 40) { if(!o.sliced) objectMissed(o); objects.splice(i,1); continue; }
      if (o.x < -120 || o.x > W + 120) { objects.splice(i,1); continue; }
      if (o.sliced) { objects.splice(i,1); continue; }
    }

    for(let i=halves.length-1;i>=0;i--){ const h=halves[i]; h.age += dt; h.x += h.vx*dt; h.y += h.vy*dt; h.vy += 950*dt; h.rot += h.vr*dt; if(h.age >= h.life) halves.splice(i,1); }
    for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.age += dt; p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 480*dt; if(p.age>=p.life){ particles.splice(i,1); continue; } }
    for(let i=splashes.length-1;i>=0;i--){ splashes[i].age += dt; if(splashes[i].age >= splashes[i].life) splashes.splice(i,1); }
    for(let i=floaters.length-1;i>=0;i--){ const f=floaters[i]; f.age += dt; f.y += f.vy * dt; if(f.age>=f.life) floaters.splice(i,1); }

    const now = performance.now();
    for(let i=trail.length-1;i>=0;i--){ if(now - trail[i].t > 180) trail.splice(i,1); }
    updateHUD();
  }

  function drawBackground(nowMs){
    ctx.fillStyle = "#160f0b"; ctx.fillRect(0,0,W,H);
    const bg = imgs.bg;
    if(bg){
      const off = Math.sin(nowMs*0.0003)*8;
      ctx.drawImage(bg, -10, -10 + off, W+20, H+20);
    } else {
      const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,"#3b1f0b"); g.addColorStop(1,"#1a120d"); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    }
    ctx.fillStyle="rgba(11,9,7,.16)"; ctx.fillRect(0,0,W,H);
    for(const a of ambient){
      const x = a.x * W + Math.sin(nowMs*0.0003 + a.x*8) * 14;
      const y = (a.y * H + nowMs*0.02*a.sp) % (H+50) - 20;
      ctx.fillStyle = a.hue > .5 ? `rgba(255,180,0,${a.a})` : `rgba(255,255,255,${a.a})`;
      ctx.beginPath(); ctx.arc(x, H-y, a.r, 0, Math.PI*2); ctx.fill();
    }
  }

  function drawSprite(sprite, x, y, r, rot=0, alpha=1){
    if(!sprite){ ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); return; }
    const w = r*2.2, h = r*2.2;
    ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.globalAlpha = alpha; ctx.drawImage(sprite, -w/2, -h/2, w, h); ctx.restore();
  }
  function drawObjects(){
    for(const o of objects){
      if (o.golden && o.kind === "fruit") {
        ctx.save(); ctx.shadowColor = "rgba(255,209,102,.9)"; ctx.shadowBlur = 28; drawSprite(imgs[o.key], o.x, o.y, o.r*1.02, o.rot); ctx.restore();
        ctx.strokeStyle = "rgba(255,220,120,.7)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(o.x, o.y, o.r*1.08 + Math.sin(performance.now()*0.01)*4, 0, Math.PI*2); ctx.stroke();
      } else {
        if (o.kind === "bomb") { ctx.save(); ctx.shadowColor = "rgba(239,68,68,.65)"; ctx.shadowBlur=18; drawSprite(imgs[o.key], o.x, o.y, o.r*1.02, o.rot); ctx.restore(); }
        else drawSprite(imgs[o.key], o.x, o.y, o.r, o.rot);
      }
    }
  }

  function drawHalves(){
    for(const h of halves){
      const alpha = 1 - h.age / h.life;
      const sprite = h.sprite;
      const w = h.r*2.25, hh = h.r*2.25;
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.rot);
      if (h.side < 0) { ctx.beginPath(); ctx.rect(-w/2, -hh/2, w/2, hh); ctx.clip(); ctx.drawImage(sprite, -w/2, -hh/2, w, hh); }
      else { ctx.beginPath(); ctx.rect(0, -hh/2, w/2, hh); ctx.clip(); ctx.drawImage(sprite, -w/2, -hh/2, w, hh); }
      ctx.globalAlpha = alpha * 0.55; ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(-w/2,-hh/2,w,hh); ctx.restore();
    }
  }

  function drawSplashes(){
    for(const s of splashes){
      const t = s.age / s.life; const rr = s.r * (0.8 + t*1.25); const alpha = 1-t;
      ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(s.x, s.y, rr*0.78, 0, Math.PI*2);
      for(let i=0;i<8;i++){ const a=i/8*Math.PI*2 + t; const pr = rr * rand(.18,.34); const px=s.x + Math.cos(a)*rr*.8; const py=s.y + Math.sin(a)*rr*.8; ctx.moveTo(px+pr,py); ctx.arc(px,py,pr,0,Math.PI*2); }
      ctx.fill(); ctx.restore();
    }
  }
  function drawParticles(){ for(const p of particles){ const a=1-p.age/p.life; ctx.fillStyle = p.color; ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); } ctx.globalAlpha=1; }
  function drawFloaters(){
    for(const f of floaters){ const a=1-f.age/f.life; ctx.save(); ctx.globalAlpha=a; ctx.font=`1000 ${f.size}px Inter, system-ui, sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.lineWidth=5; ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.strokeText(f.text,f.x,f.y); ctx.fillStyle=f.color; ctx.fillText(f.text,f.x,f.y); ctx.restore(); }
  }
  function drawTrail(){
    if(trail.length < 2) return;
    ctx.save();
    for(let i=1;i<trail.length;i++){
      const a=trail[i-1], b=trail[i];
      const alpha=i/trail.length;
      ctx.strokeStyle=`rgba(255,255,255,${0.08 + alpha*0.46})`;
      ctx.lineWidth=4 + alpha*10;
      ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      ctx.strokeStyle=`rgba(255,120,80,${0.08 + alpha*0.38})`;
      ctx.lineWidth=2 + alpha*4;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawPauseHint(){
    if(running && paused){ ctx.save(); ctx.fillStyle="rgba(0,0,0,.26)"; ctx.fillRect(0,0,W,H); ctx.fillStyle="#fff"; ctx.font="900 28px Inter, system-ui"; ctx.textAlign="center"; ctx.fillText("Paused", W/2, H*0.44); ctx.font="700 14px Inter, system-ui"; ctx.fillText("Tap Start to continue", W/2, H*0.49); ctx.restore(); }
  }

  function loop(ts){
    const dt = Math.min(0.033, Math.max(0.001, (ts-lastTs)/1000)); lastTs=ts;
    update(dt, ts);
    const shake = screenShake>0 ? { x: rand(-screenShake, screenShake), y: rand(-screenShake, screenShake)} : {x:0,y:0};
    ctx.save(); ctx.translate(shake.x, shake.y);
    drawBackground(ts); drawSplashes(); drawHalves(); drawObjects(); drawParticles(); drawTrail(); drawFloaters();
    if(frenzyTimer>0){ ctx.fillStyle=`rgba(255,180,0,${0.06 + Math.sin(ts*0.02)*0.03})`; ctx.fillRect(0,0,W,H); }
    ctx.restore();
    drawPauseHint();
    requestAnimationFrame(loop);
  }

  async function boot(){
    ggSetSlug();
    await loadAssets();
    resize();
    resetGame(false);
    lastTs=performance.now();
    requestAnimationFrame(loop);
  }
  boot();
})();
