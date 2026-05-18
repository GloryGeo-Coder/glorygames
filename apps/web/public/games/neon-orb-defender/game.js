
(() => {
  "use strict";

  // -----------------------------
  // DOM
  // -----------------------------
  const canvas = document.getElementById("c");
  if (!canvas) return;

  const elScore = document.getElementById("score");
  const elBest = document.getElementById("best");
  const elHp = document.getElementById("hp");

  const panel = document.getElementById("panel");
  const panelTitle = document.getElementById("panelTitle");
  const panelText = document.getElementById("panelText");
  const btnStart = document.getElementById("btnStart");
  const btnOverlay = document.getElementById("btnOverlay");

  canvas.style.touchAction = "none";

  // -----------------------------
  // GloryGames bridge
  // -----------------------------
  const GAME_SLUG = "neon-orb-defender";
  let GG_PAUSED = false;
  let GG_MUTED = false;

  function ggSetSlug() {
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
  }
  ggSetSlug();
  setTimeout(ggSetSlug, 250);

  function ggPostMessageScore(scoreValue, mode = "live") {
    const s = Math.max(0, scoreValue | 0);
    try {
      window.parent?.postMessage?.(
        { type: "GG_SCORE", gameSlug: GAME_SLUG, score: s, mode, payload: { value: s, mode } },
        window.location.origin
      );
    } catch {}
  }

  let _lastLiveSent = 0;
  function ggLiveScore(s) {
    const t = performance.now();
    if (t - _lastLiveSent < 120) return;
    _lastLiveSent = t;

    try { window.GG?.setScore?.(s, { gameSlug: GAME_SLUG }); return; } catch {}
    try { window.GG?.setScore?.({ gameSlug: GAME_SLUG, score: s }); return; } catch {}
    ggPostMessageScore(s, "live");
  }

  let _lastGlobalSent = 0;
  let _lastGlobalValue = 0;
  function ggSubmitBest(bestScore) {
    const s = Math.max(0, bestScore | 0);
    const t = performance.now();
    if (t - _lastGlobalSent < 900 && s <= _lastGlobalValue) return;
    _lastGlobalSent = t;
    if (s > _lastGlobalValue) _lastGlobalValue = s;

    const gg = window.GG;
    if (gg && typeof gg.endRound === "function") {
      try { gg.endRound(s, { gameSlug: GAME_SLUG }); return; } catch {}
      try { gg.endRound({ gameSlug: GAME_SLUG, score: s }); return; } catch {}
      try { gg.endRound(s); return; } catch {}
    }
    if (gg && typeof gg.submitScore === "function") {
      try { gg.submitScore({ gameSlug: GAME_SLUG, score: s }); return; } catch {}
      try { gg.submitScore(s, GAME_SLUG); return; } catch {}
      try { gg.submitScore(s); return; } catch {}
    }
    ggPostMessageScore(s, "global");
  }

  function ggRestart() {
    if (typeof window.resetGame === "function") return window.resetGame();
    location.reload();
  }

  window.addEventListener("message", (ev) => {
    if (ev.origin !== window.location.origin) return;
    const data = ev.data;
    if (!data || typeof data !== "object") return;
    const { type, payload } = data;

    if (type === "GG_PAUSE") GG_PAUSED = !!payload?.paused;
    if (type === "GG_MUTE") { GG_MUTED = !!payload?.muted; setMuted(GG_MUTED); }
    if (type === "GG_RESTART") ggRestart();
  });

  document.addEventListener("visibilitychange", () => {
    GG_PAUSED = document.hidden ? true : false;
  });

  // -----------------------------
  // SFX (WebAudio, pure code)
  // -----------------------------
  let AC = null;
  let MASTER = null;

  function ensureAudio() {
    if (GG_MUTED) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC) {
      AC = new Ctx();
      MASTER = AC.createGain();
      MASTER.gain.value = 0.12;
      MASTER.connect(AC.destination);
    }
    if (AC.state === "suspended") AC.resume().catch(() => {});
    return AC;
  }
  function setMuted(m) { if (MASTER) MASTER.gain.value = m ? 0 : 0.12; }

  function tone({ f = 440, d = 0.06, t = 0, type = "sine", v = 1 } = {}) {
    const a = ensureAudio();
    if (!a || GG_MUTED || GG_PAUSED) return;

    const osc = a.createOscillator();
    const gain = a.createGain();

    osc.type = type;
    osc.frequency.value = f;

    const start = a.currentTime + t;
    const end = start + d;

    const peak = 0.12 * v;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(MASTER || a.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  }

  function sfx(name) {
    if (name === "start") {
      tone({ f: 360, d: 0.06, type: "triangle", v: 0.65 });
      tone({ f: 720, d: 0.08, t: 0.05, type: "triangle", v: 0.65 });
      return;
    }
    if (name === "block") {
      tone({ f: 1100, d: 0.04, type: "triangle", v: 0.6 });
      tone({ f: 1460, d: 0.05, t: 0.02, type: "triangle", v: 0.55 });
      return;
    }
    if (name === "pulse") {
      tone({ f: 420, d: 0.06, type: "sawtooth", v: 0.55 });
      tone({ f: 820, d: 0.10, t: 0.06, type: "triangle", v: 0.65 });
      return;
    }
    if (name === "hit") {
      tone({ f: 180, d: 0.10, type: "sawtooth", v: 0.65 });
      tone({ f: 120, d: 0.12, t: 0.06, type: "sine", v: 0.65 });
      return;
    }
    if (name === "gameover") {
      tone({ f: 220, d: 0.12, type: "sawtooth", v: 0.65 });
      tone({ f: 160, d: 0.14, t: 0.10, type: "sine", v: 0.65 });
      tone({ f: 110, d: 0.18, t: 0.22, type: "sine", v: 0.55 });
      return;
    }
  }

  // unlock audio on first gesture
  function unlockAudioOnce() {
    ensureAudio();
    window.removeEventListener("pointerdown", unlockAudioOnce);
    window.removeEventListener("touchstart", unlockAudioOnce);
    window.removeEventListener("mousedown", unlockAudioOnce);
  }
  window.addEventListener("pointerdown", unlockAudioOnce, { once: true, passive: true });
  window.addEventListener("touchstart", unlockAudioOnce, { once: true, passive: true });
  window.addEventListener("mousedown", unlockAudioOnce, { once: true, passive: true });

  // -----------------------------
  // Babylon setup
  // -----------------------------
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.03, 0.04, 0.07, 1);

  // Camera
  const camera = new BABYLON.ArcRotateCamera("cam", -Math.PI / 2, 1.05, 10, new BABYLON.Vector3(0, 1.2, 0), scene);
  camera.attachControl(canvas, false);
  camera.inputs.clear(); // we implement our own
  camera.lowerRadiusLimit = 7.8;
  camera.upperRadiusLimit = 12;

  // Lights
  const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 0.65;

  const dir = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(0.2, -1, 0.4), scene);
  dir.position = new BABYLON.Vector3(0, 10, -8);
  dir.intensity = 0.9;

  // Fog (soft neon vibe)
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.025;
  scene.fogColor = new BABYLON.Color3(0.04, 0.04, 0.07);

  // Materials
  function neonMat(name, emissiveHex, alpha = 1) {
    const m = new BABYLON.StandardMaterial(name, scene);
    const c = BABYLON.Color3.FromHexString(emissiveHex);
    m.diffuseColor = c.scale(0.14);
    m.emissiveColor = c.scale(1.35);
    m.specularColor = new BABYLON.Color3(0.08, 0.08, 0.1);
    m.alpha = alpha;
    return m;
  }
  const matCore = neonMat("core", "#ffffff");
  const matRingA = neonMat("ringA", "#7c5cff");
  const matRingB = neonMat("ringB", "#23c2ff");
  const matShield = neonMat("shield", "#32d583");
  const matEnemy = neonMat("enemy", "#ef4444");
  const matPulse = neonMat("pulse", "#ffb020", 0.55);

  // Arena ring
  const arena = BABYLON.MeshBuilder.CreateTorus("arena", { diameter: 8.2, thickness: 0.18, tessellation: 64 }, scene);
  arena.position.y = 0.6;
  arena.rotation.x = Math.PI / 2;
  arena.material = matRingA;

  const arena2 = BABYLON.MeshBuilder.CreateTorus("arena2", { diameter: 7.1, thickness: 0.12, tessellation: 64 }, scene);
  arena2.position.y = 0.6;
  arena2.rotation.x = Math.PI / 2;
  arena2.material = matRingB;
  arena2.visibility = 0.55;

  // Core
  const core = BABYLON.MeshBuilder.CreateSphere("core", { diameter: 1.0, segments: 24 }, scene);
  core.position.y = 1.15;
  core.material = matCore;

  // Core glow spikes (visual flair)
  const spikeRoot = new BABYLON.TransformNode("spikes", scene);
  spikeRoot.position.y = 1.15;
  for (let i = 0; i < 10; i++) {
    const s = BABYLON.MeshBuilder.CreateCylinder("spike", { diameterTop: 0.05, diameterBottom: 0.12, height: 0.9, tessellation: 8 }, scene);
    s.material = i % 2 ? matRingA : matRingB;
    s.parent = spikeRoot;
    const ang = (i / 10) * Math.PI * 2;
    s.position.x = Math.cos(ang) * 0.75;
    s.position.z = Math.sin(ang) * 0.75;
    s.rotation.x = Math.PI / 2;
    s.rotation.y = ang;
    s.visibility = 0.6;
  }

  // Shield (partial torus via tube arc)
  const shieldRoot = new BABYLON.TransformNode("shieldRoot", scene);
  shieldRoot.position.y = 1.15;

  function makeArcTube(radius, thickness, arc) {
    const points = [];
    const steps = 42;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * arc;
      points.push(new BABYLON.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
    }
    return BABYLON.MeshBuilder.CreateTube(
      "shieldArc",
      {
        path: points,
        radius: thickness,
        tessellation: 12,
        cap: BABYLON.Mesh.CAP_ROUND,
        updatable: false,
      },
      scene
    );
  }

  const shieldArc = makeArcTube(2.35, 0.11, Math.PI * 0.78);
  shieldArc.material = matShield;
  shieldArc.parent = shieldRoot;
  shieldArc.rotation.y = 0;

  // Pulse ring (shows during pulse)
  const pulseRing = BABYLON.MeshBuilder.CreateTorus("pulseRing", { diameter: 4.6, thickness: 0.08, tessellation: 64 }, scene);
  pulseRing.position.y = 1.15;
  pulseRing.rotation.x = Math.PI / 2;
  pulseRing.material = matPulse;
  pulseRing.isVisible = false;

  // Stars (no texture)
  const stars = BABYLON.MeshBuilder.CreatePlane("stars", { size: 1 }, scene);
  stars.isVisible = false;
  const starPS = new BABYLON.ParticleSystem("starsPS", 1200, scene);
  starPS.particleTexture = null;
  starPS.emitter = new BABYLON.Vector3(0, 0, 0);
  starPS.minEmitBox = new BABYLON.Vector3(-14, 2, -14);
  starPS.maxEmitBox = new BABYLON.Vector3(14, 18, 14);
  starPS.color1 = new BABYLON.Color4(0.8, 0.9, 1.0, 1.0);
  starPS.color2 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
  starPS.minSize = 0.02;
  starPS.maxSize = 0.06;
  starPS.minLifeTime = 8;
  starPS.maxLifeTime = 14;
  starPS.emitRate = 130;
  starPS.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
  starPS.gravity = new BABYLON.Vector3(0, 0, 0);
  starPS.direction1 = new BABYLON.Vector3(0, 0, 0);
  starPS.direction2 = new BABYLON.Vector3(0, 0, 0);
  starPS.minEmitPower = 0;
  starPS.maxEmitPower = 0;
  starPS.updateSpeed = 0.02;
  starPS.start();

  // -----------------------------
  // Gameplay state
  // -----------------------------
  let running = false;
  let dead = false;

  let score = 0;
  let best = 0;
  let hp = 3;

  let shieldAngle = 0;      // current
  let targetAngle = 0;      // target (swipe)
  let shieldArcWidth = Math.PI * 0.34; // approximate block window (radians)

  // pulse ability
  let pulseReady = true;
  let pulseCooldown = 2.5; // seconds
  let pulseT = 0;

  // enemies
  const enemies = [];
  let spawnTimer = 0;
  let spawnEvery = 1.05;
  let enemySpeed = 2.35; // units/sec

  // submit best periodically
  let lastAutoSubmitAt = 0;

  function setHUD() {
    if (elScore) elScore.textContent = String(score | 0);
    if (elBest) elBest.textContent = String(best | 0);
    if (elHp) elHp.textContent = String(hp | 0);
  }

  function showPanel(title, body) {
    if (panel) panel.style.display = "flex";
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = body;
  }
  function hidePanel() {
    if (panel) panel.style.display = "none";
  }

  function resetGame() {
    ggSetSlug();

    running = true;
    dead = false;

    score = 0;
    hp = 3;

    shieldAngle = 0;
    targetAngle = 0;

    pulseReady = true;
    pulseT = 0;
    pulseRing.isVisible = false;

    spawnTimer = 0;
    spawnEvery = 1.05;
    enemySpeed = 2.35;

    // clear enemies
    for (const e of enemies) e.mesh.dispose();
    enemies.length = 0;

    setHUD();
    ggLiveScore(0);
    sfx("start");
    hidePanel();
  }
  window.resetGame = resetGame;

  function gameOver() {
    running = false;
    dead = true;
    if (score > best) best = score;
    setHUD();

    ggSubmitBest(best);
    sfx("gameover");

    showPanel("💥 Core breached!", `Score: ${score}\nBest: ${best}\n\nTap Start to try again.`);
  }

  // -----------------------------
  // Enemies (pure primitives)
  // -----------------------------
  function makeEnemy() {
    // tetra-ish: use a small cylinder + spikes to avoid external mesh
    const root = new BABYLON.TransformNode("enemyRoot", scene);

    const body = BABYLON.MeshBuilder.CreateSphere("enemyBody", { diameter: 0.55, segments: 12 }, scene);
    body.material = matEnemy;
    body.parent = root;

    // little fins
    for (let i = 0; i < 3; i++) {
      const fin = BABYLON.MeshBuilder.CreateBox("fin", { width: 0.12, height: 0.12, depth: 0.38 }, scene);
      fin.material = matEnemy;
      fin.parent = root;
      fin.position.z = 0.35;
      fin.rotation.y = (i / 3) * Math.PI * 2;
      fin.position.x = Math.cos(fin.rotation.y) * 0.22;
      fin.position.z = Math.sin(fin.rotation.y) * 0.22;
      fin.position.y = 0.02;
      fin.visibility = 0.65;
    }

    // spawn on ring outside, heading inward
    const ang = Math.random() * Math.PI * 2;
    const r = 5.4;
    root.position.set(Math.cos(ang) * r, 1.15, Math.sin(ang) * r);

    // direction to core
    const dir = new BABYLON.Vector3(-root.position.x, 0, -root.position.z).normalize();

    root.metadata = { ang, dir };
    return root;
  }

  // -----------------------------
  // Controls (swipe rotate + tap pulse)
  // -----------------------------
  let lastPointerX = null;
  let swipeAccum = 0;
  let tapCandidate = false;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  canvas.addEventListener("pointerdown", (e) => {
    if (!running && !dead) return;
    ensureAudio();
    lastPointerX = e.clientX;
    swipeAccum = 0;
    tapCandidate = true;
  }, { passive: true });

  canvas.addEventListener("pointermove", (e) => {
    if (!running || lastPointerX == null) return;
    const dx = e.clientX - lastPointerX;
    lastPointerX = e.clientX;
    swipeAccum += Math.abs(dx);

    // rotate target by dx (tuned for mobile)
    targetAngle += dx * 0.012; // sensitivity
    tapCandidate = tapCandidate && swipeAccum < 10;
  }, { passive: true });

  function pointerUp() {
    lastPointerX = null;
    if (running && tapCandidate) triggerPulse();
    tapCandidate = false;
  }
  canvas.addEventListener("pointerup", pointerUp, { passive: true });
  canvas.addEventListener("pointercancel", pointerUp, { passive: true });

  // desktop test
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") targetAngle -= 0.25;
    if (e.key === "ArrowRight") targetAngle += 0.25;
    if (e.key === " " || e.key === "Enter") triggerPulse();
  });

  function triggerPulse() {
    if (!running || GG_PAUSED) return;
    if (!pulseReady) return;

    pulseReady = false;
    pulseT = 0;
    pulseRing.isVisible = true;
    pulseRing.scaling.set(1, 1, 1);

    sfx("pulse");

    // pulse blast: remove enemies within radius (and score)
    const radius = 3.2;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const d = BABYLON.Vector3.Distance(e.mesh.position, core.position);
      if (d <= radius) {
        // destroy
        e.mesh.dispose();
        enemies.splice(i, 1);
        score += 25;
      }
    }
    const intScore = score | 0;
    if (intScore > best) best = intScore;
    setHUD();
    ggLiveScore(intScore);
  }

  // -----------------------------
  // Collision logic
  // -----------------------------
  function angleOf(v3) {
    // angle around Y axis
    return Math.atan2(v3.z, v3.x); // -pi..pi
  }
  function normAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  function isBlocked(enemyPos) {
    // Determine if enemy is within shield arc
    const a = normAngle(angleOf(enemyPos));
    const s = normAngle(shieldAngle);

    const diff = normAngle(a - s);
    return Math.abs(diff) <= shieldArcWidth;
  }

  // -----------------------------
  // Update loop
  // -----------------------------
  function update(dt) {
    if (!running || GG_PAUSED) return;

    // rotate shield smoothly
    const dAng = normAngle(targetAngle - shieldAngle);
    shieldAngle += dAng * clamp(dt * 10, 0, 1);
    shieldRoot.rotation.y = shieldAngle;

    // core breathing glow
    const t = performance.now() * 0.002;
    core.scaling.setAll(1 + 0.03 * Math.sin(t * 1.6));
    spikeRoot.rotation.y += dt * 0.35;

    // score over time
    score += dt * 10;
    const intScore = score | 0;
    if (intScore > best) best = intScore;
    setHUD();
    ggLiveScore(intScore);

    // auto submit best (helps sidebar top score)
    const now = performance.now();
    if (now - lastAutoSubmitAt > 2500) {
      lastAutoSubmitAt = now;
      ggSubmitBest(best | 0);
    }

    // difficulty scaling
    const diff = Math.min(1.0, score / 900);
    spawnEvery = 1.05 - diff * 0.42;       // faster spawns
    enemySpeed = 2.35 + diff * 2.25;       // faster enemies

    // spawn enemies
    spawnTimer += dt;
    if (spawnTimer >= spawnEvery) {
      spawnTimer = 0;
      const e = makeEnemy();
      enemies.push({ mesh: e, v: enemySpeed });
    }

    // pulse animation + cooldown
    if (!pulseReady) {
      pulseT += dt;
      // quick ring expansion
      pulseRing.scaling.setAll(1 + pulseT * 0.9);
      pulseRing.rotation.z += dt * 1.2;

      if (pulseT > 0.25) {
        pulseRing.isVisible = false;
      }
      if (pulseT >= pulseCooldown) {
        pulseReady = true;
      }
    }

    // move enemies inward & resolve collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const pos = e.mesh.position;

      // move toward core center in XZ plane
      const dir = new BABYLON.Vector3(-pos.x, 0, -pos.z).normalize();
      pos.x += dir.x * e.v * dt;
      pos.z += dir.z * e.v * dt;

      // rotate for flair
      e.mesh.rotation.y += dt * 3.2;
      e.mesh.rotation.x += dt * 1.6;

      const d = BABYLON.Vector3.Distance(pos, core.position);

      // shield collision zone around r ~2.35 (shield radius)
      const shieldR = 2.35;
      if (d <= shieldR + 0.22 && d >= shieldR - 0.45) {
        // compute angle around core using enemy position relative to core
        const rel = new BABYLON.Vector3(pos.x, 0, pos.z);
        const blocked = isBlocked(rel);

        if (blocked) {
          // deflected!
          sfx("block");
          score += 18;
          const intScore2 = score | 0;
          if (intScore2 > best) best = intScore2;
          setHUD();
          ggLiveScore(intScore2);

          // destroy enemy
          e.mesh.dispose();
          enemies.splice(i, 1);
          continue;
        }
      }

      // core hit
      if (d <= 0.75) {
        sfx("hit");
        hp -= 1;
        setHUD();

        e.mesh.dispose();
        enemies.splice(i, 1);

        if (hp <= 0) {
          gameOver();
          return;
        }
      }

      // cleanup far out (unlikely)
      if (Math.abs(pos.x) > 14 || Math.abs(pos.z) > 14) {
        e.mesh.dispose();
        enemies.splice(i, 1);
      }
    }
  }

  // -----------------------------
  // Render
  // -----------------------------
  let lastT = performance.now();
  engine.runRenderLoop(() => {
    const t = performance.now();
    const dt = Math.min(0.033, (t - lastT) / 1000);
    lastT = t;

    if (!GG_PAUSED) update(dt);

    scene.render();
  });

  window.addEventListener("resize", () => engine.resize());

  // -----------------------------
  // UI / Panel
  // -----------------------------
  const DEFAULT_PANEL_TITLE = (panelTitle?.textContent || "Neon Orb Defender").trim();
  const DEFAULT_PANEL_TEXT = (panelText?.textContent || "").trim();

  function showHowTo() {
    showPanel(
      DEFAULT_PANEL_TITLE,
      DEFAULT_PANEL_TEXT || "Swipe to rotate shield.\nTap to pulse (cooldown).\nBlock enemies before they reach the core.\n\nTap Start."
    );
  }

  if (btnStart) {
    btnStart.onclick = () => {
      ensureAudio();
      resetGame();
      GG_PAUSED = false;
      hidePanel();
    };
  }

  if (btnOverlay) {
    btnOverlay.onclick = () => {
      if (panel && panel.style.display === "none") {
        GG_PAUSED = true;
        showHowTo();
      } else {
        showHowTo();
      }
    };
  }

  // initial
  showHowTo();
  setHUD();

})();
