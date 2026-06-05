(() => {
  'use strict';

  const canvas = document.getElementById('c');
  if (!canvas || !window.BABYLON) return;
  canvas.style.touchAction = 'none';

  const $ = (id) => document.getElementById(id);
  const elScore = $('score');
  const elBest = $('best');
  const elHp = $('hp');
  const elWave = $('wave');
  const elPulseFill = $('pulseFill');
  const elPulseLabel = $('pulseLabel');
  const elShieldFill = $('shieldFill');
  const elShieldLabel = $('shieldLabel');
  const panel = $('panel');
  const panelTitle = $('panelTitle');
  const panelText = $('panelText');
  const btnStart = $('btnStart');
  const btnOverlay = $('btnOverlay');
  const btnPause = $('btnPause');
  const btnLaunch = $('btnLaunch');
  const btnSubmit = $('btnSubmit');
  const btnRestart = $('btnRestart');
  const btnChat = $('btnChat');
  const uiPause = $('uiPause');
  const uiMute = $('uiMute');
  const uiRestart = $('uiRestart');

  const GAME_SLUG = 'neon-orb-defender';
  const BEST_KEY = 'gg_neon_orb_defender_best_v2';
  let best = Number(localStorage.getItem(BEST_KEY) || '0') || 0;

  let GG_PAUSED = false;
  let GG_MUTED = false;
  let lastLiveScore = -1;
  let lastLiveAt = 0;

  function ggSetSlug() {
    try { window.GG?.setSlug?.(GAME_SLUG); } catch {}
  }
  function ggPostScore(mode = 'live') {
    const score = Math.max(0, state.score | 0);
    const now = performance.now();
    if (mode === 'live' && score === lastLiveScore && now - lastLiveAt < 120) return;
    if (mode === 'live' && now - lastLiveAt < 90) return;
    lastLiveScore = score;
    lastLiveAt = now;
    const payload = {
      gameSlug: GAME_SLUG,
      slug: GAME_SLUG,
      score,
      best,
      wave: state.wave,
      hp: state.hp,
      combo: state.combo,
      mode,
    };
    try { window.GG?.setScore?.(score, { gameSlug: GAME_SLUG }); } catch {}
    if (mode !== 'live') {
      try { window.GG?.submitScore?.(score, { gameSlug: GAME_SLUG }); } catch {}
      try { window.GG?.endRound?.(payload); } catch {}
    }
    try { window.parent?.postMessage?.({ type: 'GG_SCORE', ...payload, payload }, '*'); } catch {}
    try { window.parent?.postMessage?.({ type: 'gg:score', ...payload, payload }, '*'); } catch {}
  }

  function showPanel(title, text) {
    if (panelTitle) panelTitle.textContent = title;
    if (panelText) panelText.textContent = text;
    if (panel) panel.style.display = 'flex';
  }
  function hidePanel() {
    if (panel) panel.style.display = 'none';
  }
  function updateHUD() {
    if (elScore) elScore.textContent = String(state.score | 0);
    if (elBest) elBest.textContent = String(best | 0);
    if (elHp) elHp.textContent = String(state.hp | 0);
    if (elWave) elWave.textContent = String(state.wave | 0);
    if (elPulseFill) elPulseFill.style.width = `${Math.round(state.pulseCharge * 100)}%`;
    if (elPulseLabel) elPulseLabel.textContent = state.pulseActive ? 'BLASTING' : state.pulseCharge >= 1 ? 'Ready' : `${Math.round(state.pulseCharge * 100)}%`;
    if (elShieldFill) elShieldFill.style.width = `${Math.round(state.shieldEnergy * 100)}%`;
    if (elShieldLabel) elShieldLabel.textContent = `${Math.round(state.shieldEnergy * 100)}%`;
    ggPostScore('live');
  }

  // ---------------- Audio ----------------
  let AC = null;
  let master = null;
  let musicTimer = null;
  let musicStep = 0;
  function ensureAudio() {
    if (GG_MUTED) return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!AC) {
      AC = new Ctx();
      master = AC.createGain();
      master.gain.value = 0.12;
      master.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume().catch(() => {});
    return AC;
  }
  function tone(freq, dur = 0.07, type = 'sine', gain = 0.055, delay = 0) {
    const ac = ensureAudio();
    if (!ac || GG_MUTED) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(master || ac.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }
  function noise(dur = 0.14, gain = 0.05) {
    const ac = ensureAudio();
    if (!ac || GG_MUTED) return;
    const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ac.createBufferSource();
    const g = ac.createGain();
    g.gain.value = gain;
    src.buffer = buffer;
    src.connect(g); g.connect(master || ac.destination);
    src.start(); src.stop(ac.currentTime + dur);
  }
  function sfx(name) {
    if (name === 'start') { tone(320, .05, 'triangle', .05); tone(520, .07, 'triangle', .04, .05); return; }
    if (name === 'block') { tone(780, .04, 'triangle', .05); tone(1180, .06, 'triangle', .04, .02); return; }
    if (name === 'heavyBlock') { tone(460, .05, 'triangle', .05); tone(760, .08, 'sine', .04, .03); return; }
    if (name === 'pulse') { tone(240, .08, 'triangle', .055); tone(480, .12, 'triangle', .04, .04); tone(960, .10, 'sine', .035, .12); return; }
    if (name === 'pickup') { tone(990, .04, 'triangle', .05); tone(1480, .06, 'triangle', .04, .02); return; }
    if (name === 'hit') { noise(.16, .06); tone(140, .15, 'sawtooth', .06); tone(90, .18, 'sine', .05, .04); return; }
    if (name === 'wave') { tone(420, .05, 'sine', .05); tone(700, .07, 'triangle', .04, .04); tone(980, .09, 'sine', .035, .1); return; }
    if (name === 'gameover') { tone(220, .12, 'sawtooth', .06); tone(150, .16, 'sine', .05, .12); tone(110, .2, 'sine', .04, .26); return; }
  }
  function musicTick() {
    if (!state.running || GG_PAUSED || GG_MUTED) return;
    const notes = [147, 220, 262, 196, 220, 330, 262, 196];
    const n = notes[musicStep++ % notes.length];
    tone(n, .11, 'triangle', .012);
    if (musicStep % 2 === 0) tone(n * 2, .06, 'sine', .008, .03);
  }
  function startMusic() {
    if (musicTimer || GG_MUTED) return;
    musicTimer = setInterval(musicTick, 240);
  }
  function stopMusic() {
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = null;
  }

  // ---------------- Babylon Scene ----------------
  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, antialias: true });
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.03, 0.04, 0.08, 1);
  scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.012;
  scene.fogColor = new BABYLON.Color3(0.03, 0.04, 0.08);

  const camera = new BABYLON.ArcRotateCamera('cam', -Math.PI / 2, 1.05, 12, new BABYLON.Vector3(0, 1.4, 0), scene);
  camera.lowerRadiusLimit = 8.5;
  camera.upperRadiusLimit = 13;
  camera.lowerBetaLimit = 0.75;
  camera.upperBetaLimit = 1.28;
  camera.wheelPrecision = 80;
  camera.panningSensibility = 0;
  camera.inputs.clear();

  const hemi = new BABYLON.HemisphericLight('hemi', new BABYLON.Vector3(0, 1, 0), scene);
  hemi.intensity = 0.75;
  const pointA = new BABYLON.PointLight('pointA', new BABYLON.Vector3(0, 3, 0), scene);
  pointA.diffuse = BABYLON.Color3.FromHexString('#23c2ff');
  pointA.intensity = 1.0;
  const pointB = new BABYLON.PointLight('pointB', new BABYLON.Vector3(0, 1.2, 0), scene);
  pointB.diffuse = BABYLON.Color3.FromHexString('#7c5cff');
  pointB.intensity = 0.75;
  const glow = new BABYLON.GlowLayer('glow', scene, { blurKernelSize: 64 });
  glow.intensity = 0.7;

  function neonMat(name, hex, alpha = 1) {
    const mat = new BABYLON.StandardMaterial(name, scene);
    const c = BABYLON.Color3.FromHexString(hex);
    mat.diffuseColor = c.scale(0.15);
    mat.emissiveColor = c.scale(1.1);
    mat.specularColor = new BABYLON.Color3(0.08, 0.08, 0.1);
    mat.alpha = alpha;
    return mat;
  }
  const matCore = neonMat('matCore', '#ffffff');
  const matRingA = neonMat('matRingA', '#23c2ff');
  const matRingB = neonMat('matRingB', '#7c5cff', 0.9);
  const matShield = neonMat('matShield', '#32d583');
  const matEnemy = neonMat('matEnemy', '#ef4444');
  const matHeavy = neonMat('matHeavy', '#ffb020');
  const matPickup = neonMat('matPickup', '#ffd166');
  const matHeal = neonMat('matHeal', '#32d583');
  const matSlow = neonMat('matSlow', '#23c2ff');
  const matPulse = neonMat('matPulse', '#ff8aee', 0.55);

  // Sky domes with local backgrounds
  const sky1 = BABYLON.MeshBuilder.CreateSphere('sky1', { diameter: 80, segments: 32, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene);
  const skyMat1 = new BABYLON.StandardMaterial('skyMat1', scene);
  skyMat1.disableLighting = true;
  skyMat1.backFaceCulling = false;
  skyMat1.diffuseTexture = new BABYLON.Texture('./assets/backgrounds/nebula-a.png', scene);
  skyMat1.emissiveTexture = skyMat1.diffuseTexture;
  skyMat1.diffuseColor = new BABYLON.Color3(0.6, 0.6, 0.8);
  skyMat1.emissiveColor = new BABYLON.Color3(0.9, 0.9, 1.0);
  sky1.material = skyMat1;

  const sky2 = BABYLON.MeshBuilder.CreateSphere('sky2', { diameter: 62, segments: 24, sideOrientation: BABYLON.Mesh.BACKSIDE }, scene);
  const skyMat2 = new BABYLON.StandardMaterial('skyMat2', scene);
  skyMat2.disableLighting = true;
  skyMat2.backFaceCulling = false;
  skyMat2.diffuseTexture = new BABYLON.Texture('./assets/backgrounds/nebula-b.png', scene);
  skyMat2.emissiveTexture = skyMat2.diffuseTexture;
  skyMat2.alpha = 0.55;
  sky2.material = skyMat2;

  // Floating city/background geometry
  const cityRoot = new BABYLON.TransformNode('cityRoot', scene);
  for (let i = 0; i < 36; i++) {
    const ang = (i / 36) * Math.PI * 2;
    const radius = 10 + Math.sin(i * 0.5) * 0.7;
    const h = 0.8 + (i % 5) * 0.6 + Math.random() * 1.2;
    const building = BABYLON.MeshBuilder.CreateBox(`b${i}`, { width: 0.6 + Math.random() * 0.6, depth: 0.6 + Math.random() * 0.6, height: h }, scene);
    building.position.set(Math.cos(ang) * radius, h / 2 - 0.8, Math.sin(ang) * radius);
    building.rotation.y = ang;
    building.material = i % 2 ? matRingA : matRingB;
    building.parent = cityRoot;
    building.visibility = 0.66;
  }

  const arenaDisc = BABYLON.MeshBuilder.CreateDisc('arenaDisc', { radius: 4.9, tessellation: 96 }, scene);
  arenaDisc.rotation.x = Math.PI / 2;
  arenaDisc.position.y = 0.02;
  const discMat = new BABYLON.StandardMaterial('discMat', scene);
  discMat.diffuseColor = BABYLON.Color3.FromHexString('#0a1022');
  discMat.emissiveColor = BABYLON.Color3.FromHexString('#080f19');
  arenaDisc.material = discMat;

  const arenaOuter = BABYLON.MeshBuilder.CreateTorus('arenaOuter', { diameter: 8.8, thickness: 0.18, tessellation: 96 }, scene);
  arenaOuter.rotation.x = Math.PI / 2;
  arenaOuter.position.y = 0.1;
  arenaOuter.material = matRingA;
  const arenaInner = BABYLON.MeshBuilder.CreateTorus('arenaInner', { diameter: 7.4, thickness: 0.1, tessellation: 96 }, scene);
  arenaInner.rotation.x = Math.PI / 2;
  arenaInner.position.y = 0.11;
  arenaInner.material = matRingB;
  arenaInner.visibility = 0.7;

  // Core
  const coreRoot = new BABYLON.TransformNode('coreRoot', scene);
  const core = BABYLON.MeshBuilder.CreateSphere('core', { diameter: 1.18, segments: 24 }, scene);
  core.material = matCore;
  core.position.y = 1.28;
  core.parent = coreRoot;
  const coreShell = BABYLON.MeshBuilder.CreateSphere('coreShell', { diameter: 1.64, segments: 18 }, scene);
  const shellMat = neonMat('shellMat', '#23c2ff', 0.22);
  coreShell.material = shellMat;
  coreShell.position.y = 1.28;
  coreShell.parent = coreRoot;
  const spikes = [];
  for (let i = 0; i < 12; i++) {
    const sp = BABYLON.MeshBuilder.CreateCylinder(`sp${i}`, { diameterTop: 0.05, diameterBottom: 0.12, height: 0.8, tessellation: 8 }, scene);
    sp.material = i % 2 ? matRingA : matRingB;
    const ang = (i / 12) * Math.PI * 2;
    sp.position.set(Math.cos(ang) * 0.9, 1.28, Math.sin(ang) * 0.9);
    sp.rotation.x = Math.PI / 2;
    sp.rotation.y = ang;
    spikes.push(sp);
  }

  // Shield arcs
  const shieldRoot = new BABYLON.TransformNode('shieldRoot', scene);
  shieldRoot.position.y = 1.28;
  function buildArc(radius, thickness, arcAngle) {
    const pts = [];
    const steps = 48;
    const start = -arcAngle / 2;
    for (let i = 0; i <= steps; i++) {
      const t = start + (i / steps) * arcAngle;
      pts.push(new BABYLON.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius));
    }
    return BABYLON.MeshBuilder.CreateTube('shieldArc', { path: pts, radius: thickness, tessellation: 14, cap: BABYLON.Mesh.CAP_ROUND }, scene);
  }
  let shieldArcA = buildArc(2.7, 0.13, Math.PI * 0.42);
  let shieldArcB = buildArc(2.52, 0.06, Math.PI * 0.42);
  shieldArcA.material = matShield;
  shieldArcB.material = matRingA;
  shieldArcA.parent = shieldRoot;
  shieldArcB.parent = shieldRoot;

  function rebuildShieldArc() {
    const width = state.shieldWidth;
    const oldA = shieldArcA; const oldB = shieldArcB;
    shieldArcA = buildArc(2.7, 0.13, width);
    shieldArcB = buildArc(2.52, 0.06, width);
    shieldArcA.material = matShield; shieldArcB.material = matRingA;
    shieldArcA.parent = shieldRoot; shieldArcB.parent = shieldRoot;
    oldA.dispose(); oldB.dispose();
  }

  const pulseRing = BABYLON.MeshBuilder.CreateTorus('pulseRing', { diameter: 4.7, thickness: 0.08, tessellation: 96 }, scene);
  pulseRing.rotation.x = Math.PI / 2;
  pulseRing.position.y = 1.28;
  pulseRing.material = matPulse;
  pulseRing.isVisible = false;

  // Floating star/particles as tiny spheres
  const starRoot = new BABYLON.TransformNode('starRoot', scene);
  for (let i = 0; i < 180; i++) {
    const star = BABYLON.MeshBuilder.CreateSphere(`st${i}`, { diameter: 0.05 + Math.random() * 0.06, segments: 6 }, scene);
    star.material = Math.random() > 0.5 ? matRingA : matRingB;
    const r = 18 + Math.random() * 18;
    const a = Math.random() * Math.PI * 2;
    const y = 3 + Math.random() * 12;
    star.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
    star.parent = starRoot;
    star.visibility = 0.55;
  }

  // ---------------- Gameplay State ----------------
  const state = {
    running: false,
    dead: false,
    score: 0,
    hp: 5,
    wave: 1,
    combo: 0,
    comboTimer: 0,
    waveTimer: 0,
    pulseCharge: 1,
    pulseActive: false,
    pulseRadius: 0,
    shieldAngle: 0,
    targetAngle: 0,
    shieldEnergy: 1,
    shieldWidth: Math.PI * 0.42,
    spawnTimer: 0,
    pickupTimer: 5,
    enemies: [],
    pickups: [],
    floaters: [],
    slowTimer: 0,
  };

  function normalizedAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  function addFloater(text, color, position) {
    const dt = new BABYLON.DynamicTexture(`txt${Math.random()}`, { width: 256, height: 128 }, scene, true);
    dt.hasAlpha = true;
    dt.drawText(text, null, 84, 'bold 56px Arial', color, 'transparent', true);
    const mat = new BABYLON.StandardMaterial(`fm${Math.random()}`, scene);
    mat.diffuseTexture = dt;
    mat.emissiveTexture = dt;
    mat.opacityTexture = dt;
    mat.backFaceCulling = false;
    const plane = BABYLON.MeshBuilder.CreatePlane(`fp${Math.random()}`, { size: 0.9 }, scene);
    plane.material = mat;
    plane.position.copyFrom(position);
    plane.position.y += 0.35;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    state.floaters.push({ mesh: plane, age: 0, life: 0.9 });
  }

  function makeEnemy(type) {
    const root = new BABYLON.TransformNode(`enemy-${type}-${Math.random()}`, scene);
    const ang = Math.random() * Math.PI * 2;
    const dist = 5.7 + Math.random() * 0.5;
    let mesh;
    let speed = 1.9 + state.wave * 0.08;
    let hp = 1;
    let damage = 1;
    let points = 18;
    let material = matEnemy;

    if (type === 'spinner') {
      mesh = BABYLON.MeshBuilder.CreateTorusKnot(`sp-${Math.random()}`, { radius: 0.24, tube: 0.09, radialSegments: 32, tubularSegments: 24, p: 2, q: 3 }, scene);
      speed = 2.5 + state.wave * 0.1;
      points = 24;
      material = matRingA;
    } else if (type === 'heavy') {
      mesh = BABYLON.MeshBuilder.CreatePolyhedron(`hv-${Math.random()}`, { type: 1, size: 0.42 }, scene);
      speed = 1.35 + state.wave * 0.06;
      hp = 2;
      damage = 2;
      points = 38;
      material = matHeavy;
    } else {
      mesh = BABYLON.MeshBuilder.CreateSphere(`en-${Math.random()}`, { diameter: 0.62, segments: 14 }, scene);
      const fin1 = BABYLON.MeshBuilder.CreateBox(`finA-${Math.random()}`, { width: 0.12, height: 0.12, depth: 0.4 }, scene);
      const fin2 = fin1.clone(`finB-${Math.random()}`);
      const fin3 = fin1.clone(`finC-${Math.random()}`);
      [fin1, fin2, fin3].forEach((f, i) => {
        f.parent = root; f.material = material; f.position.y = 1.28;
        const aa = i * (Math.PI * 2 / 3);
        f.position.x = Math.cos(aa) * 0.28; f.position.z = Math.sin(aa) * 0.28; f.rotation.y = aa;
      });
      speed = 1.95 + state.wave * 0.08;
      points = 18;
      material = matEnemy;
    }

    mesh.parent = root;
    mesh.material = material;
    mesh.position.y = 1.28;
    root.position.set(Math.cos(ang) * dist, 0, Math.sin(ang) * dist);
    root.rotation.y = -ang;
    return { root, mesh, type, angle: ang, dist, speed, hp, damage, points, wobble: Math.random() * Math.PI * 2, pulseHit: false };
  }

  function makePickup(type) {
    const root = new BABYLON.TransformNode(`pickup-${type}-${Math.random()}`, scene);
    const ang = Math.random() * Math.PI * 2;
    const dist = 5.9;
    let mesh;
    let mat = matPickup;
    if (type === 'heal') {
      mesh = BABYLON.MeshBuilder.CreateBox(`heal-${Math.random()}`, { width: 0.42, height: 0.42, depth: 0.42 }, scene);
      mat = matHeal;
    } else if (type === 'slow') {
      mesh = BABYLON.MeshBuilder.CreatePolyhedron(`slow-${Math.random()}`, { type: 1, size: 0.42 }, scene);
      mat = matSlow;
    } else {
      mesh = BABYLON.MeshBuilder.CreateTorus(`charge-${Math.random()}`, { diameter: 0.58, thickness: 0.16, tessellation: 32 }, scene);
      mat = matPickup;
    }
    mesh.parent = root;
    mesh.material = mat;
    mesh.position.y = 1.28;
    root.position.set(Math.cos(ang) * dist, 0, Math.sin(ang) * dist);
    return { root, mesh, type, angle: ang, dist, speed: 1.35, rot: Math.random() * Math.PI * 2 };
  }

  function destroyEnemy(entry, reward = true, blocked = true) {
    const idx = state.enemies.indexOf(entry);
    if (idx >= 0) state.enemies.splice(idx, 1);
    if (reward) {
      state.score += entry.points + Math.min(40, state.combo * 2);
      state.combo += 1;
      state.comboTimer = 2.5;
      state.pulseCharge = Math.min(1, state.pulseCharge + (entry.type === 'heavy' ? 0.18 : 0.10));
      state.shieldEnergy = Math.min(1, state.shieldEnergy + 0.04);
      addFloater(`+${entry.points}`, blocked ? '#8dffcc' : '#ffd166', entry.root.position.add(new BABYLON.Vector3(0, 1.4, 0)));
    }
    const flash = BABYLON.MeshBuilder.CreateSphere(`flash-${Math.random()}`, { diameter: 0.35, segments: 8 }, scene);
    flash.position.copyFrom(entry.root.position);
    flash.position.y = 1.28;
    flash.material = entry.type === 'heavy' ? matHeavy : (entry.type === 'spinner' ? matRingA : matEnemy);
    const start = performance.now();
    scene.onBeforeRenderObservable.add(function fxObserver() {
      const t = (performance.now() - start) / 240;
      if (t >= 1) {
        flash.dispose();
        scene.onBeforeRenderObservable.removeCallback(fxObserver);
      } else {
        flash.scaling.setAll(1 + t * 3.5);
        flash.visibility = 1 - t;
      }
    });
    entry.root.dispose();
  }

  function destroyPickup(entry) {
    const idx = state.pickups.indexOf(entry);
    if (idx >= 0) state.pickups.splice(idx, 1);
    if (entry.type === 'heal') {
      state.hp = Math.min(5, state.hp + 1);
      state.score += 15;
      addFloater('+HP', '#6effc2', entry.root.position.add(new BABYLON.Vector3(0, 1.2, 0)));
    } else if (entry.type === 'slow') {
      state.slowTimer = 6;
      state.score += 18;
      addFloater('SLOW', '#7ed7ff', entry.root.position.add(new BABYLON.Vector3(0, 1.2, 0)));
    } else {
      state.pulseCharge = Math.min(1, state.pulseCharge + 0.28);
      state.score += 20;
      addFloater('+PULSE', '#ffe08a', entry.root.position.add(new BABYLON.Vector3(0, 1.2, 0)));
    }
    state.shieldEnergy = Math.min(1, state.shieldEnergy + 0.05);
    sfx('pickup');
    entry.root.dispose();
  }

  function coreHit(dmg) {
    state.hp -= dmg;
    state.combo = 0;
    state.comboTimer = 0;
    state.shieldEnergy = Math.max(0, state.shieldEnergy - 0.18 * dmg);
    sfx('hit');
    addFloater(`-${dmg} HP`, '#ff7a9c', core.position.add(new BABYLON.Vector3(0, 0.8, 0)));
    pointB.intensity = 1.2;
    if (state.hp <= 0) gameOver();
  }

  function triggerPulse() {
    if (!state.running || GG_PAUSED || state.dead) return;
    if (state.pulseCharge < 1 || state.pulseActive) return;
    ensureAudio();
    state.pulseCharge = 0;
    state.pulseActive = true;
    state.pulseRadius = 0.8;
    pulseRing.isVisible = true;
    pulseRing.scaling.setAll(0.55);
    sfx('pulse');
  }

  function resetGame() {
    ggSetSlug();
    state.running = true;
    state.dead = false;
    state.score = 0;
    state.hp = 5;
    state.wave = 1;
    state.combo = 0;
    state.comboTimer = 0;
    state.waveTimer = 0;
    state.pulseCharge = 1;
    state.pulseActive = false;
    state.pulseRadius = 0;
    state.shieldAngle = 0;
    state.targetAngle = 0;
    state.shieldEnergy = 1;
    state.shieldWidth = Math.PI * 0.42;
    state.spawnTimer = 0.7;
    state.pickupTimer = 5.5;
    state.slowTimer = 0;
    state.enemies.forEach(e => e.root.dispose());
    state.pickups.forEach(p => p.root.dispose());
    state.floaters.forEach(f => f.mesh.dispose());
    state.enemies.length = 0;
    state.pickups.length = 0;
    state.floaters.length = 0;
    pulseRing.isVisible = false;
    rebuildShieldArc();
    hidePanel();
    sfx('start');
    startMusic();
    updateHUD();
  }
  window.resetGame = resetGame;

  function gameOver() {
    if (state.dead) return;
    state.running = false;
    state.dead = true;
    stopMusic();
    if (state.score > best) {
      best = state.score | 0;
      localStorage.setItem(BEST_KEY, String(best));
    }
    updateHUD();
    ggPostScore('game_over');
    sfx('gameover');
    showPanel('💥 Core breached!', `Score: ${state.score | 0}\nBest: ${best | 0}\nWave reached: ${state.wave | 0}\n\nTap Start to try again.`);
  }

  // Controls
  let lastPointerX = null;
  let tapCandidate = false;
  let swipeAccum = 0;
  canvas.addEventListener('pointerdown', (e) => {
    ensureAudio();
    if (!state.running && !state.dead) return;
    if (state.dead) { resetGame(); return; }
    if (GG_PAUSED) { GG_PAUSED = false; hidePanel(); startMusic(); return; }
    lastPointerX = e.clientX;
    tapCandidate = true;
    swipeAccum = 0;
  }, { passive: true });

  canvas.addEventListener('pointermove', (e) => {
    if (!state.running || lastPointerX == null || GG_PAUSED) return;
    const dx = e.clientX - lastPointerX;
    lastPointerX = e.clientX;
    swipeAccum += Math.abs(dx);
    state.targetAngle += dx * 0.0125;
    tapCandidate = tapCandidate && swipeAccum < 9;
  }, { passive: true });

  function onPointerUp() {
    if (lastPointerX == null) return;
    lastPointerX = null;
    if (state.running && tapCandidate) triggerPulse();
    tapCandidate = false;
  }
  canvas.addEventListener('pointerup', onPointerUp, { passive: true });
  canvas.addEventListener('pointercancel', onPointerUp, { passive: true });
  canvas.addEventListener('pointerleave', onPointerUp, { passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') state.targetAngle -= 0.18;
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') state.targetAngle += 0.18;
    if (e.key === ' ' || e.key === 'Enter' || e.key.toLowerCase() === 'w') triggerPulse();
    if (e.key.toLowerCase() === 'p') togglePause();
  });

  function togglePause() {
    if (!state.running || state.dead) return;
    GG_PAUSED = !GG_PAUSED;
    if (GG_PAUSED) {
      stopMusic();
      showPanel('Paused', 'Tap Start, Pause, or the game area to continue.\n\nDrag to rotate the shield and tap to pulse.');
    } else {
      hidePanel();
      startMusic();
    }
  }

  btnStart?.addEventListener('click', () => { ensureAudio(); if (!state.running || state.dead) resetGame(); else { GG_PAUSED = false; hidePanel(); startMusic(); } });
  btnOverlay?.addEventListener('click', () => {
    stopMusic();
    GG_PAUSED = state.running && !state.dead ? true : GG_PAUSED;
    showPanel('How to play', 'Rotate the green shield around the core to block enemies.\n\n• Drag left/right to rotate\n• Tap to pulse when charge is full\n• Deflect enemies to gain score and combo\n• Catch pickups for pulse, healing, or slow-time\n• Heavy enemies hurt more if they breach the core');
  });
  btnPause?.addEventListener('click', togglePause);
  btnLaunch?.addEventListener('click', () => { ensureAudio(); resetGame(); });
  btnSubmit?.addEventListener('click', () => ggPostScore('manual_submit'));
  btnRestart?.addEventListener('click', resetGame);
  btnChat?.addEventListener('click', () => {
    try { window.parent?.postMessage?.({ type: 'GG_TOAST', text: 'Chat coming soon' }, '*'); } catch {}
  });
  uiPause?.addEventListener('click', togglePause);
  uiRestart?.addEventListener('click', () => { ensureAudio(); resetGame(); });
  uiMute?.addEventListener('click', () => {
    GG_MUTED = !GG_MUTED;
    if (uiMute) uiMute.textContent = GG_MUTED ? 'Muted' : 'Sound';
    if (GG_MUTED) stopMusic(); else if (state.running && !GG_PAUSED) startMusic();
  });

  window.addEventListener('message', (ev) => {
    const data = ev.data || {};
    const type = data.type || data.event;
    if (type === 'GG_PAUSE') {
      GG_PAUSED = !!(data.payload?.paused ?? data.paused);
      if (GG_PAUSED) stopMusic(); else if (state.running) startMusic();
    }
    if (type === 'GG_MUTE') {
      GG_MUTED = !!(data.payload?.muted ?? data.muted);
      if (uiMute) uiMute.textContent = GG_MUTED ? 'Muted' : 'Sound';
      if (GG_MUTED) stopMusic();
    }
    if (type === 'GG_RESTART') resetGame();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { GG_PAUSED = true; stopMusic(); }
  });

  // Main update
  let pulseHitSet = new WeakSet();
  function update(dt) {
    if (!state.running || GG_PAUSED || state.dead) return;

    state.waveTimer += dt;
    if (state.waveTimer >= 18) {
      state.waveTimer = 0;
      state.wave += 1;
      state.spawnTimer = Math.max(0.35, state.spawnTimer - 0.04);
      sfx('wave');
      addFloater(`WAVE ${state.wave}`, '#9ecbff', core.position.add(new BABYLON.Vector3(0, 1.8, 0)));
    }

    if (state.comboTimer > 0) state.comboTimer -= dt;
    else state.combo = 0;

    if (state.slowTimer > 0) state.slowTimer -= dt;

    state.shieldEnergy = Math.min(1, state.shieldEnergy + dt * 0.012);
    const newWidth = Math.PI * (0.28 + state.shieldEnergy * 0.18);
    if (Math.abs(newWidth - state.shieldWidth) > 0.02) {
      state.shieldWidth = newWidth;
      rebuildShieldArc();
    }

    state.shieldAngle += normalizedAngle(state.targetAngle - state.shieldAngle) * Math.min(1, dt * 10.5);
    shieldRoot.rotation.y = state.shieldAngle;

    // pulse anim
    if (state.pulseActive) {
      state.pulseRadius += dt * 5.7;
      pulseRing.isVisible = true;
      const scale = 0.4 + state.pulseRadius / 2.35;
      pulseRing.scaling.set(scale, 1, scale);
      pulseRing.visibility = Math.max(0, 1 - state.pulseRadius / 5.8);
      if (state.pulseRadius > 5.8) {
        state.pulseActive = false;
        pulseRing.isVisible = false;
        pulseHitSet = new WeakSet();
      }
    }

    // Spawning
    state.spawnTimer -= dt;
    const spawnEvery = Math.max(0.35, 1.15 - state.wave * 0.05);
    if (state.spawnTimer <= 0) {
      let type = 'orb';
      const r = Math.random();
      if (state.wave >= 2 && r > 0.58) type = 'spinner';
      if (state.wave >= 3 && r > 0.83) type = 'heavy';
      state.enemies.push(makeEnemy(type));
      if (state.wave >= 4 && Math.random() < 0.18) state.enemies.push(makeEnemy('orb'));
      state.spawnTimer = spawnEvery;
    }

    state.pickupTimer -= dt;
    if (state.pickupTimer <= 0) {
      const r = Math.random();
      const type = r < 0.2 ? 'heal' : r < 0.45 ? 'slow' : 'charge';
      state.pickups.push(makePickup(type));
      state.pickupTimer = 6 + Math.random() * 2.5;
    }

    const enemySpeedFactor = state.slowTimer > 0 ? 0.6 : 1;
    // update enemies
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.wobble += dt * 2.8;
      e.dist -= dt * e.speed * enemySpeedFactor;
      e.angle += Math.sin(e.wobble) * 0.0015;
      e.root.position.set(Math.cos(e.angle) * e.dist, 0, Math.sin(e.angle) * e.dist);
      e.root.rotation.y += dt * (e.type === 'spinner' ? 4.4 : 1.8);
      e.mesh.position.y = 1.28 + Math.sin(e.wobble * 2.2) * 0.08;

      if (state.pulseActive && !pulseHitSet.has(e) && e.dist <= state.pulseRadius) {
        pulseHitSet.add(e);
        destroyEnemy(e, true, false);
        continue;
      }

      const shieldDiff = Math.abs(normalizedAngle(e.angle - state.shieldAngle));
      const shieldReach = 2.75;
      if (e.dist <= shieldReach && shieldDiff <= state.shieldWidth / 2) {
        if (e.type === 'heavy' && e.hp > 1) {
          e.hp -= 1;
          e.dist += 0.7;
          e.root.scaling.setAll(1.18);
          state.score += 8;
          state.pulseCharge = Math.min(1, state.pulseCharge + 0.08);
          state.shieldEnergy = Math.max(0, state.shieldEnergy - 0.06);
          addFloater('CRACK!', '#ffd27a', e.root.position.add(new BABYLON.Vector3(0, 1.3, 0)));
          sfx('heavyBlock');
        } else {
          destroyEnemy(e, true, true);
          sfx(e.type === 'heavy' ? 'heavyBlock' : 'block');
        }
        continue;
      }

      if (e.dist <= 0.82) {
        const dmg = e.damage || 1;
        e.root.dispose();
        state.enemies.splice(i, 1);
        coreHit(dmg);
      }
    }

    // update pickups
    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const p = state.pickups[i];
      p.rot += dt * 2.6;
      p.dist -= dt * p.speed;
      p.root.position.set(Math.cos(p.angle) * p.dist, 0, Math.sin(p.angle) * p.dist);
      p.root.rotation.y = p.rot;
      p.mesh.position.y = 1.28 + Math.sin(p.rot * 2.4) * 0.14;
      if (p.dist <= 2.0 && Math.abs(normalizedAngle(p.angle - state.shieldAngle)) <= state.shieldWidth / 2 + 0.08) {
        destroyPickup(p);
        continue;
      }
      if (p.dist <= 0.85) {
        p.root.dispose();
        state.pickups.splice(i, 1);
      }
    }

    // floaters
    for (let i = state.floaters.length - 1; i >= 0; i--) {
      const f = state.floaters[i];
      f.age += dt;
      if (f.age >= f.life) {
        f.mesh.dispose();
        state.floaters.splice(i, 1);
      } else {
        f.mesh.position.y += dt * 0.8;
        f.mesh.visibility = 1 - f.age / f.life;
      }
    }

    updateHUD();
  }

  // Render loop effects
  scene.onBeforeRenderObservable.add(() => {
    const dt = engine.getDeltaTime() / 1000;
    update(dt);
    const t = performance.now() * 0.001;
    sky1.rotation.y += dt * 0.0025;
    sky2.rotation.y -= dt * 0.004;
    cityRoot.rotation.y += dt * 0.05;
    arenaOuter.rotation.z += dt * 0.08;
    arenaInner.rotation.z -= dt * 0.12;
    core.scaling.setAll(1 + Math.sin(t * 2.5) * 0.05);
    coreShell.scaling.setAll(1 + Math.sin(t * 2.1 + 1) * 0.08);
    spikes.forEach((sp, i) => {
      sp.position.y = 1.28 + Math.sin(t * 1.8 + i) * 0.08;
      sp.rotation.z = Math.sin(t * 1.4 + i) * 0.18;
    });
    pointB.intensity += (0.75 - pointB.intensity) * Math.min(1, dt * 5);
    camera.alpha += dt * 0.08;
  });

  engine.runRenderLoop(() => {
    scene.render();
  });
  window.addEventListener('resize', () => engine.resize());

  // Boot
  function boot() {
    ggSetSlug();
    showPanel('Neon Orb Defender', 'Protect the glowing orb core.\nRotate the shield around the core to block incoming enemies.\nTap to release a pulse blast when the pulse meter is charged.\nDeflect enemies to build combos and survive longer waves.');
    updateHUD();
  }
  boot();
})();
