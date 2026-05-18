/* Neon Hover Runner — Babylon.js (pure-code 3D)
   - No models/textures (.glb) required
   - Primitives only + emissive neon materials
   - Mobile-first controls: swipe steer + tap jump
   - GloryGames score bridge: live score + best submit (top score)
   - Host controls: GG_PAUSE / GG_MUTE / GG_RESTART

   DOM IDs matched to index.html:
   canvas: #c
   HUD: #score #best #speed
   Panel: #panel #panelTitle #panelText #btnStart #btnOverlay
   Hidden: #btnPause #btnLaunch #btnSubmit #btnRestart #btnChat
*/
(() => {
  "use strict";

  // -----------------------------
  // DOM
  // -----------------------------
  const canvas = document.getElementById("c");
  if (!canvas) return;

  const elScore = document.getElementById("score");
  const elBest = document.getElementById("best");
  const elSpeed = document.getElementById("speed");

  const panel = document.getElementById("panel");
  const panelTitle = document.getElementById("panelTitle");
  const panelText = document.getElementById("panelText");
  const btnStart = document.getElementById("btnStart");
  const btnOverlay = document.getElementById("btnOverlay");

  // hidden compat buttons
  const btnPause = document.getElementById("btnPause");
  const btnLaunch = document.getElementById("btnLaunch");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnRestart = document.getElementById("btnRestart");
  const btnChat = document.getElementById("btnChat");

  const DEFAULT_PANEL_TITLE = (panelTitle?.textContent || "Neon Hover Runner").trim();
  const DEFAULT_PANEL_TEXT = (panelText?.textContent || "").trim();

  // Prevent scroll/zoom while playing (mobile)
  canvas.style.touchAction = "none";

  // -----------------------------
  // GloryGames bridge
  // -----------------------------
  const GAME_SLUG = "neon-hover-runner";

  let GG_PAUSED = false;
  let GG_MUTED = false;

  function ggToast(text) {
    try {
      window.parent?.postMessage?.({ type: "GG_TOAST", text }, window.location.origin);
    } catch {}
  }

  function ggSetSlug() {
    try {
      window.GG?.setSlug?.(GAME_SLUG);
    } catch {}
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

  // Live score updates
  let _lastLiveSent = 0;
  function ggLiveScore(s) {
    const t = performance.now();
    if (t - _lastLiveSent < 120) return;
    _lastLiveSent = t;

    // Prefer GG SDK if present
    try {
      window.GG?.setScore?.(s, { gameSlug: GAME_SLUG });
      return;
    } catch {}
    try {
      window.GG?.setScore?.({ gameSlug: GAME_SLUG, score: s });
      return;
    } catch {}

    ggPostMessageScore(s, "live");
  }

  // ✅ Final submit to update top score
  let _lastGlobalSent = 0;
  let _lastGlobalValue = 0;
  function ggSubmitBest(bestScore) {
    const s = Math.max(0, bestScore | 0);
    const t = performance.now();
    if (t - _lastGlobalSent < 900 && s <= _lastGlobalValue) return;
    _lastGlobalSent = t;
    if (s > _lastGlobalValue) _lastGlobalValue = s;

    const gg = window.GG;

    // Preferred: daily-aware endRound
    if (gg && typeof gg.endRound === "function") {
      try {
        gg.endRound(s, { gameSlug: GAME_SLUG });
        return;
      } catch {}
      try {
        gg.endRound({ gameSlug: GAME_SLUG, score: s });
        return;
      } catch {}
      try {
        gg.endRound(s);
        return;
      } catch {}
    }

    // Fallback: submitScore
    if (gg && typeof gg.submitScore === "function") {
      try {
        gg.submitScore({ gameSlug: GAME_SLUG, score: s });
        return;
      } catch {}
      try {
        gg.submitScore(s, GAME_SLUG);
        return;
      } catch {}
      try {
        gg.submitScore(s);
        return;
      } catch {}
    }

    ggPostMessageScore(s, "global");
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

    if (type === "GG_PAUSE") GG_PAUSED = !!payload?.paused;
    if (type === "GG_MUTE") {
      GG_MUTED = !!payload?.muted;
      setMuted(GG_MUTED);
    }
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

  function setMuted(m) {
    if (MASTER) MASTER.gain.value = m ? 0 : 0.12;
  }

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
      tone({ f: 330, d: 0.05, type: "triangle", v: 0.7 });
      tone({ f: 660, d: 0.07, t: 0.05, type: "triangle", v: 0.7 });
      return;
    }
    if (name === "jump") {
      tone({ f: 520, d: 0.05, type: "sine", v: 0.7 });
      tone({ f: 820, d: 0.05, t: 0.03, type: "sine", v: 0.55 });
      return;
    }
    if (name === "coin") {
      tone({ f: 1040, d: 0.04, type: "triangle", v: 0.6 });
      tone({ f: 1560, d: 0.06, t: 0.02, type: "triangle", v: 0.55 });
      return;
    }
    if (name === "hit") {
      tone({ f: 180, d: 0.09, type: "sawtooth", v: 0.65 });
      tone({ f: 120, d: 0.11, t: 0.05, type: "sine", v: 0.65 });
      return;
    }
    if (name === "boost") {
      tone({ f: 420, d: 0.05, type: "triangle", v: 0.6 });
      tone({ f: 720, d: 0.08, t: 0.05, type: "triangle", v: 0.7 });
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
  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: false,
    disableWebGL2Support: false,
  });

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.03, 0.04, 0.07, 1);

  // Camera: follows player (no external assets)
  const camera = new BABYLON.UniversalCamera("cam", new BABYLON.Vector3(0, 4.3, -9.5), scene);
  camera.setTarget(new BABYLON.Vector3(0, 1.2, 6));
  camera.attachControl(canvas, false);
  camera.inputs.clear(); // we use our own touch controls, so disable default

  // Lights
  const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 0.55;

  const dir = new BABYLON.DirectionalLight("dir", new BABYLON.Vector3(0.2, -1, 0.4), scene);
  dir.position = new BABYLON.Vector3(0, 10, -10);
  dir.intensity = 0.9;

  // Materials (neon emissive)
  function neonMat(name, emissiveHex, alpha = 1) {
    const m = new BABYLON.StandardMaterial(name, scene);
    const c = BABYLON.Color3.FromHexString(emissiveHex);
    m.diffuseColor = c.scale(0.15);
    m.emissiveColor = c.scale(1.35);
    m.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    m.alpha = alpha;
    return m;
  }

  const matTrack = new BABYLON.StandardMaterial("track", scene);
  matTrack.diffuseColor = new BABYLON.Color3(0.03, 0.035, 0.06);
  matTrack.emissiveColor = new BABYLON.Color3(0.02, 0.03, 0.06);
  matTrack.specularColor = new BABYLON.Color3(0.02, 0.02, 0.03);

  const matRailL = neonMat("railL", "#7c5cff");
  const matRailR = neonMat("railR", "#23c2ff");
  const matPlayer = neonMat("player", "#ffffff");
  const matObstacle = neonMat("obstacle", "#ef4444");
  const matCoin = neonMat("coin", "#ffb020");
  const matBoost = neonMat("boost", "#32d583");

  // Ground fog for vibe
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.02;
  scene.fogColor = new BABYLON.Color3(0.04, 0.04, 0.07);

  // -----------------------------
  // World primitives
  // -----------------------------
  const TRACK_WIDTH = 4.2;
  const LANE_MAX = 2.0; // x clamp
  const TRACK_SEG_LEN = 14;
  const SEGMENTS = [];
  const SEG_COUNT = 10;

  function makeSegment(z) {
    const root = new BABYLON.TransformNode("seg", scene);
    root.position.z = z;

    // Track plate
    const plate = BABYLON.MeshBuilder.CreateBox("plate", { width: TRACK_WIDTH, height: 0.35, depth: TRACK_SEG_LEN }, scene);
    plate.material = matTrack;
    plate.position.y = 0;
    plate.position.z = 0;
    plate.parent = root;

    // Rails
    const railL = BABYLON.MeshBuilder.CreateBox("railL", { width: 0.14, height: 0.45, depth: TRACK_SEG_LEN }, scene);
    railL.material = matRailL;
    railL.position.set(-TRACK_WIDTH / 2 - 0.08, 0.22, 0);
    railL.parent = root;

    const railR = BABYLON.MeshBuilder.CreateBox("railR", { width: 0.14, height: 0.45, depth: TRACK_SEG_LEN }, scene);
    railR.material = matRailR;
    railR.position.set(TRACK_WIDTH / 2 + 0.08, 0.22, 0);
    railR.parent = root;

    // Grid lines (thin emissive strips)
    for (let i = 0; i < 6; i++) {
      const strip = BABYLON.MeshBuilder.CreateBox("strip", { width: 0.04, height: 0.36, depth: TRACK_SEG_LEN }, scene);
      strip.material = i % 2 === 0 ? matRailL : matRailR;
      strip.position.set(-TRACK_WIDTH / 2 + (i + 1) * (TRACK_WIDTH / 7), 0.01, 0);
      strip.parent = root;
      strip.visibility = 0.25;
    }

    return { root };
  }

  // Build initial segments ahead
  for (let i = 0; i < SEG_COUNT; i++) {
    const seg = makeSegment(i * TRACK_SEG_LEN);
    SEGMENTS.push(seg);
  }

  // Stars (procedural particles with points)
  const stars = BABYLON.MeshBuilder.CreatePlane("stars", { size: 1 }, scene);
  stars.isVisible = false;
  const starPS = new BABYLON.ParticleSystem("starsPS", 1400, scene);
  starPS.particleTexture = null; // no texture
  starPS.emitter = new BABYLON.Vector3(0, 0, 0);
  starPS.minEmitBox = new BABYLON.Vector3(-20, 2, -20);
  starPS.maxEmitBox = new BABYLON.Vector3(20, 18, 80);
  starPS.color1 = new BABYLON.Color4(0.8, 0.9, 1.0, 1.0);
  starPS.color2 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
  starPS.minSize = 0.02;
  starPS.maxSize = 0.06;
  starPS.minLifeTime = 8;
  starPS.maxLifeTime = 14;
  starPS.emitRate = 170;
  starPS.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
  starPS.gravity = new BABYLON.Vector3(0, 0, 0);
  starPS.direction1 = new BABYLON.Vector3(0, 0, 0);
  starPS.direction2 = new BABYLON.Vector3(0, 0, 0);
  starPS.minAngularSpeed = 0;
  starPS.maxAngularSpeed = 0;
  starPS.minEmitPower = 0;
  starPS.maxEmitPower = 0;
  starPS.updateSpeed = 0.02;
  starPS.start();

  // -----------------------------
  // Player (hover pod, pure shapes)
  // -----------------------------
  const playerRoot = new BABYLON.TransformNode("playerRoot", scene);
  playerRoot.position.set(0, 0.8, 2.2);

  const pod = BABYLON.MeshBuilder.CreateBox("pod", { width: 0.9, height: 0.34, depth: 1.25 }, scene);
  pod.material = matPlayer;
  pod.parent = playerRoot;

  // glow fins
  const finL = BABYLON.MeshBuilder.CreateBox("finL", { width: 0.12, height: 0.18, depth: 1.05 }, scene);
  finL.material = matRailL;
  finL.position.set(-0.55, -0.05, 0);
  finL.parent = playerRoot;

  const finR = BABYLON.MeshBuilder.CreateBox("finR", { width: 0.12, height: 0.18, depth: 1.05 }, scene);
  finR.material = matRailR;
  finR.position.set(0.55, -0.05, 0);
  finR.parent = playerRoot;

  // thruster
  const thr = BABYLON.MeshBuilder.CreateCylinder("thr", { diameter: 0.24, height: 0.22 }, scene);
  thr.material = matBoost;
  thr.rotation.x = Math.PI / 2;
  thr.position.set(0, -0.06, -0.66);
  thr.parent = playerRoot;
  thr.visibility = 0.35;

  // Shadow (fake)
  const shadow = BABYLON.MeshBuilder.CreateDisc("shadow", { radius: 0.8, tessellation: 32 }, scene);
  shadow.rotation.x = Math.PI / 2;
  shadow.position.set(0, 0.18, playerRoot.position.z);
  const matShadow = new BABYLON.StandardMaterial("shadowMat", scene);
  matShadow.diffuseColor = new BABYLON.Color3(0, 0, 0);
  matShadow.emissiveColor = new BABYLON.Color3(0, 0, 0);
  matShadow.alpha = 0.18;
  shadow.material = matShadow;

  // -----------------------------
  // Gameplay state
  // -----------------------------
  let running = false;
  let dead = false;

  let score = 0;
  let best = 0;

  let speed = 10.5; // base units/sec
  let speedMult = 1.0;

  let laneX = 0; // target x
  let vx = 0;

  // jump
  let y = 0.8;
  let vy = 0;
  const GRAV = 24.0;
  const JUMP_V = 10.8;
  let grounded = true;

  // spawn pools
  const obstacles = [];
  const pickups = [];

  // Difficulty timers
  let dist = 0;
  let spawnZ = 20;
  let nextObstacleAt = 0;
  let nextPickupAt = 0;

  // Auto-submit best periodically while running (for sidebar top score)
  let lastAutoSubmitAt = 0;

  function setHUD() {
    if (elScore) elScore.textContent = String(score | 0);
    if (elBest) elBest.textContent = String(best | 0);
    if (elSpeed) elSpeed.textContent = `${speedMult.toFixed(1)}x`;
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
    speedMult = 1.0;
    speed = 10.5;

    dist = 0;
    spawnZ = 20;
    nextObstacleAt = 0;
    nextPickupAt = 0;

    laneX = 0;
    vx = 0;

    y = 0.8;
    vy = 0;
    grounded = true;

    // clear entities
    for (const o of obstacles) o.mesh.dispose();
    obstacles.length = 0;

    for (const p of pickups) p.mesh.dispose();
    pickups.length = 0;

    // reset track positions
    for (let i = 0; i < SEGMENTS.length; i++) {
      SEGMENTS[i].root.position.z = i * TRACK_SEG_LEN;
    }

    playerRoot.position.set(0, 0.8, 2.2);
    shadow.position.set(0, 0.18, playerRoot.position.z);

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

    // ✅ submit best (top score)
    ggSubmitBest(best);

    sfx("gameover");
    showPanel("💥 Crashed!", `Score: ${score}\nBest: ${best}\n\nTap Start to try again.`);
  }

  // -----------------------------
  // Entity creation (pure primitives)
  // -----------------------------
  function makeObstacle(z) {
    const m = BABYLON.MeshBuilder.CreateBox("ob", { width: 1.05, height: 1.05, depth: 1.05 }, scene);
    m.material = matObstacle;
    m.position.set((Math.random() * 2 - 1) * 1.7, 0.75, z);
    m.metadata = { type: "obstacle" };
    return m;
  }

  function makeCoin(z) {
    const m = BABYLON.MeshBuilder.CreateTorus("coin", { diameter: 0.7, thickness: 0.18, tessellation: 24 }, scene);
    m.material = matCoin;
    m.position.set((Math.random() * 2 - 1) * 1.8, 1.25, z);
    m.rotation.x = Math.PI / 2;
    m.metadata = { type: "coin" };
    return m;
  }

  function makeBoost(z) {
    const m = BABYLON.MeshBuilder.CreateCylinder("boost", { diameterTop: 0.55, diameterBottom: 0.8, height: 0.9, tessellation: 18 }, scene);
    m.material = matBoost;
    m.position.set((Math.random() * 2 - 1) * 1.75, 1.1, z);
    m.metadata = { type: "boost" };
    return m;
  }

  // Simple AABB collision
  function aabb(mesh) {
    const b = mesh.getBoundingInfo().boundingBox;
    const min = b.minimumWorld;
    const max = b.maximumWorld;
    return { min, max };
  }
  function overlap(a, b) {
    return !(
      a.max.x < b.min.x || a.min.x > b.max.x ||
      a.max.y < b.min.y || a.min.y > b.max.y ||
      a.max.z < b.min.z || a.min.z > b.max.z
    );
  }

  // -----------------------------
  // Controls (mobile-first)
  // -----------------------------
  let lastPointerX = null;
  let steer = 0; // -1..1
  let tapPendingJump = false;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  canvas.addEventListener("pointerdown", (e) => {
    if (!running && !dead) return; // panel handles start
    ensureAudio();
    lastPointerX = e.clientX;
    tapPendingJump = true;
  }, { passive: true });

  canvas.addEventListener("pointermove", (e) => {
    if (!running) return;
    if (lastPointerX == null) return;

    const dx = e.clientX - lastPointerX;
    lastPointerX = e.clientX;

    // swipe steer sensitivity (mobile)
    const s = clamp(dx / 120, -1, 1);
    steer = clamp(steer + s, -1, 1);

    // if user moved enough, it's not a tap
    if (Math.abs(dx) > 8) tapPendingJump = false;
  }, { passive: true });

  function pointerUp() {
    lastPointerX = null;
    // Apply jump if it was a tap
    if (running && tapPendingJump) {
      doJump();
    }
    tapPendingJump = false;
    // ease steer back to 0 over time in update()
  }

  canvas.addEventListener("pointerup", pointerUp, { passive: true });
  canvas.addEventListener("pointercancel", pointerUp, { passive: true });

  // Keyboard (desktop testing)
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") steer = clamp(steer - 0.35, -1, 1);
    if (e.key === "ArrowRight") steer = clamp(steer + 0.35, -1, 1);
    if (e.key === " " || e.key === "ArrowUp") doJump();
  });

  function doJump() {
    if (!running || GG_PAUSED) return;
    if (!grounded) return;
    vy = JUMP_V;
    grounded = false;
    sfx("jump");
  }

  // -----------------------------
  // Update loop
  // -----------------------------
  const playerCollider = BABYLON.MeshBuilder.CreateBox("pCol", { width: 0.9, height: 0.5, depth: 1.1 }, scene);
  playerCollider.isVisible = false;
  playerCollider.parent = playerRoot;
  playerCollider.position.y = 0.25;

  function update(dt) {
    if (!running || GG_PAUSED) return;

    // speed ramp
    dist += (speed * speedMult) * dt;
    const ramp = 1 + dist / 1400;
    speedMult = clamp(ramp, 1, 3.2);

    // score increases with distance
    score += dt * 12 * speedMult;
    const intScore = score | 0;
    if (intScore > (best | 0)) best = intScore;
    setHUD();
    ggLiveScore(intScore);

    // auto submit best every few seconds (helps sidebar top score)
    const t = performance.now();
    if (t - lastAutoSubmitAt > 2500) {
      lastAutoSubmitAt = t;
      ggSubmitBest(best | 0);
    }

    // Player steer (laneX target)
    laneX += steer * 4.2 * dt;
    laneX = clamp(laneX, -LANE_MAX, LANE_MAX);

    // decay steer to center (makes control stable)
    steer *= Math.pow(0.2, dt);

    // smoothing
    const targetX = laneX;
    const dx = targetX - playerRoot.position.x;
    vx += dx * 14 * dt;
    vx *= Math.pow(0.06, dt);
    playerRoot.position.x += vx * dt;
    playerRoot.position.x = clamp(playerRoot.position.x, -LANE_MAX, LANE_MAX);

    // Jump physics
    vy -= GRAV * dt;
    y += vy * dt;
    if (y <= 0.8) {
      y = 0.8;
      vy = 0;
      grounded = true;
    }
    playerRoot.position.y = y;

    // Hover bob
    const bob = Math.sin(performance.now() * 0.006) * 0.06;
    pod.position.y = 0 + bob;
    finL.position.y = -0.05 + bob;
    finR.position.y = -0.05 + bob;

    // Thruster visibility pulses with speed
    thr.visibility = 0.25 + 0.15 * Math.sin(performance.now() * 0.02);

    // Camera follow
    const camTarget = new BABYLON.Vector3(playerRoot.position.x * 0.4, 1.2, playerRoot.position.z + 6);
    camera.setTarget(camTarget);
    camera.position.x = playerRoot.position.x * 0.55;
    camera.position.y = 4.2 + (grounded ? 0 : 0.25);
    camera.position.z = playerRoot.position.z - 9.5;

    // Fake shadow
    shadow.position.x = playerRoot.position.x;
    shadow.position.z = playerRoot.position.z;
    shadow.scaling.x = shadow.scaling.z = grounded ? 1 : 0.75;

    // Recycle track segments
    for (const seg of SEGMENTS) {
      seg.root.position.z -= (speed * speedMult) * dt;
    }
    // If a segment goes behind camera, move it to the end
    for (const seg of SEGMENTS) {
      if (seg.root.position.z < -TRACK_SEG_LEN) {
        // find max z among segments
        let maxZ = -Infinity;
        for (const s of SEGMENTS) maxZ = Math.max(maxZ, s.root.position.z);
        seg.root.position.z = maxZ + TRACK_SEG_LEN;
      }
    }

    // spawn ahead
    spawnZ -= (speed * speedMult) * dt;

    const worldFrontZ = 40; // spawn distance in front of player
    // obstacles
    if (dist >= nextObstacleAt) {
      const z = worldFrontZ;
      const ob = makeObstacle(z);
      obstacles.push({ mesh: ob });
      nextObstacleAt = dist + (12 + Math.random() * 18) / speedMult;
    }
    // pickups
    if (dist >= nextPickupAt) {
      const z = worldFrontZ + 2 + Math.random() * 8;
      const make = Math.random() < 0.22 ? makeBoost : makeCoin;
      const mesh = make(z);
      pickups.push({ mesh, kind: mesh.metadata.type });
      nextPickupAt = dist + (9 + Math.random() * 14) / speedMult;
    }

    // move entities toward player (illusion of forward motion)
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const ob = obstacles[i].mesh;
      ob.position.z -= (speed * speedMult) * dt;

      // rotate for style
      ob.rotation.y += dt * 1.2;
      ob.rotation.x += dt * 0.7;

      // remove if behind
      if (ob.position.z < -16) {
        ob.dispose();
        obstacles.splice(i, 1);
      }
    }

    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i].mesh;
      p.position.z -= (speed * speedMult) * dt;

      p.rotation.y += dt * 3.2;
      p.rotation.x += dt * 1.6;

      if (p.position.z < -16) {
        p.dispose();
        pickups.splice(i, 1);
      }
    }

    // collisions
    const pb = aabb(playerCollider);

    // obstacle hit
    for (const ob of obstacles) {
      const b = aabb(ob.mesh);
      if (overlap(pb, b)) {
        sfx("hit");
        gameOver();
        return;
      }
    }

    // pickup
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i].mesh;
      const b = aabb(p);
      if (overlap(pb, b)) {
        const kind = p.metadata.type;
        if (kind === "coin") {
          score += 40;
          sfx("coin");
        } else {
          score += 60;
          speedMult = Math.min(3.2, speedMult + 0.25);
          sfx("boost");
        }
        const intScore2 = score | 0;
        if (intScore2 > best) best = intScore2;
        setHUD();
        ggLiveScore(intScore2);

        p.dispose();
        pickups.splice(i, 1);
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
  // Panel + Buttons
  // -----------------------------
  function showHowTo() {
    showPanel(DEFAULT_PANEL_TITLE, DEFAULT_PANEL_TEXT || "Swipe to steer • Tap to jump.\nAvoid red blocks.\nCollect coins and green boosts.\n\nTap Start.");
  }

  function showPanel(title, body) {
    if (panel) panel.style.display = "flex";
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = body;
  }

  function hidePanel() {
    if (panel) panel.style.display = "none";
  }

  // Start
  if (btnStart) {
    btnStart.onclick = () => {
      ensureAudio();
      resetGame();
      GG_PAUSED = false;
      hidePanel();
    };
  }

  // How to
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

  // Hidden compat buttons
  if (btnPause) btnPause.onclick = () => (GG_PAUSED = !GG_PAUSED);
  if (btnLaunch) btnLaunch.onclick = () => {
    ensureAudio();
    if (!running) resetGame();
    GG_PAUSED = false;
    hidePanel();
  };
  if (btnRestart) btnRestart.onclick = () => ggRestart();
  if (btnSubmit) btnSubmit.onclick = () => ggSubmitBest(best | 0);
  if (btnChat) btnChat.onclick = () => ggToast("Chat coming soon");

  // initial
  showHowTo();
  setHUD();

})();
