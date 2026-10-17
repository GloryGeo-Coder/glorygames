import { createCampaignPlatform } from "../campaign-platform.mjs";
import { bindCampaignRuntime, describeCampaignLoadError } from "../campaign-runtime.mjs?v=0.13.1";
import { createCampaignAudio } from "../campaign-audio.mjs";
import { createCampaignPresentation } from "../campaign-presentation.mjs";
import { worldBalance, createJumpAssist, nextForwardCheckpoint, questDirection, canChargeDrone, droneWarningTime } from "../campaign-balance.mjs";
import { createCampaignVisuals } from "../campaign-visuals.mjs";
import { createCampaignPerformanceController } from "../campaign-performance.mjs";
import { CAMPAIGN_SAVE_INTERVAL_SECONDS, CAMPAIGN_WORLD_TITLES, CAMPAIGN_WORLD_PATHS, createCampaignSave } from "../campaign-save.mjs";
import { CAMPAIGN_DEPTH, buildCampaignDepth, enemyMaxHp, enemyCooldown, droneOffset } from "../campaign-depth.mjs";
import {
  GAME_SLUG, GRAVITY, JUMP_VELOCITY, WALK_SPEED, RUN_SPEED,
  islands, bridges, relics, checkpoints, goal,
  floorAt, floorCandidates, movementVector, horizontalToEngine,
  canEnterPortal, distance2, clamp, lerp,
  nextCheckpoint,
} from "./world-logic.mjs?v=0.7";
import { createHeroAnimator } from "../hero-animation.mjs";
import { DRONE_HP, DRONE_ATTACK_COOLDOWN, PLAYER_INVULNERABILITY, selectAimTarget, vectorToTarget, projectileHits, needsDroneWarning } from "../combat-logic.mjs";
import { GUARDIAN_MAX_HP, GUARDIAN_POSITION, GUARDIAN_ATTACKS, GUARDIAN_RANGE,
  guardianTitle, guardianPhase, createGuardianState, awakenGuardian, damageGuardian,
  stepGuardian, sigilHits, waveHits, portalAvailable, WAVE_SPEED, WAVE_MAX_RADIUS,
} from "./guardian-logic.mjs";
import { createStormVisuals } from "./storm-effects.mjs";
import { createHazardStates, stepHazard, lightningHits } from "./storm-hazards.mjs";

// Storm Citadel gameplay is isolated from the verified Sky Garden and Storm Citadel
// game. Existing score APIs and campaign saves are preserved.
const $ = (id) => document.getElementById(id);
const ui = Object.fromEntries([
  "gameCanvas", "hud", "relicCount", "healthCount", "scoreCount", "pauseBtn", "controlsBtn", "damageFlash",
  "guardianHud", "guardianName", "guardianPhaseText", "guardianHealthFill", "guardianHealthFillTrack", "guardianWarning",
  "questGuide", "questText", "toast", "touchControls", "orientationHint", "stormHazardWarning",
  "joystickPad", "joystickThumb", "jumpBtn", "glideBtn", "blastBtn",
  "overlay", "overlayEyebrow", "overlayTitle", "overlaySubtitle", "overlayDescription", "newRunBtn", "continueCampaignBtn",
  "instructions", "primaryBtn", "soundBtn", "nextWorldBtn", "loadingText", "loadTrack", "loadFill", "fpsDisplay",
].map(id => [id, $(id)]));

const MOBILE = matchMedia("(hover: none), (pointer: coarse)").matches || innerWidth <= 900 || ((typeof navigator !== "undefined") && (navigator.maxTouchPoints || 0) > 0);
const URL_OPTIONS = new URLSearchParams(location.search);
// Pointer/hover media queries are not reliable in every embedded mobile browser.
// Touch controls must also work in browser device emulators and on hybrid devices.
let touchSeen = false;
let touchControlsOverride = URL_OPTIONS.get("controls") === "1" ? true
  : URL_OPTIONS.get("controls") === "0" ? false : null;
function automaticTouchControls() {
  const narrowViewport = window.innerWidth <= 1024;
  const touchPoints = typeof navigator !== "undefined" && (navigator.maxTouchPoints || 0) > 0;
  return MOBILE || narrowViewport || touchPoints || touchSeen || ("ontouchstart" in window);
}
function touchControlsRequested() {
  return touchControlsOverride ?? automaticTouchControls();
}
function syncTouchControls() {
  const enabled = touchControlsRequested();
  ui.touchControls.hidden = currentMode !== "playing" || !enabled;
  ui.controlsBtn.setAttribute("aria-pressed", String(enabled));
  ui.controlsBtn.setAttribute("aria-label", enabled ? "Hide touch controls" : "Show touch controls");
  ui.controlsBtn.title = enabled ? "Hide touch controls" : "Show touch controls";
  ui.controlsBtn.textContent = enabled ? "Controls ✓" : "Controls";
}

const DEBUG = URL_OPTIONS.has("debug");
// Candidate runs use device scores; public score submission is disabled.
const REDUCED_MOTION = matchMedia("(prefers-reduced-motion: reduce)").matches;
const B = window.BABYLON;
let engine, scene, camera, heroRoot, heroVisual, relicMaterial, portalMaterial, portalNode;
let heroAnimator = null, hasRiggedHero = false, projectileMaterial = null, enemyShotMaterial = null;
let guardian = null, guardianArt = null, guardianSigil = null, guardianWave = null;
let campaignVisuals = null;
let visualPolish = null;
let stormHazards = [], stormWarnings = new Map(), stormStrikes = [];
let stormStrikeMaterial = null;
let guardianMarker = null, activeWave = null, guardianTarget = null;
let initialized = false;
let glideSoundActive = false;
let animationClock = 0, lastHudTime = 0, currentMode = "loading", cameraYaw = 0.32;
let skyTime = 0, checkpoint = checkpoints[0], health = 3, score = 0;
let relicSet = new Set(), relicObjects = [], enemies = [], bolts = [], enemyShots = [], impacts = [];
let pointerLook = null, toastUntil = 0, launchCooldown = 0, hitCooldown = 0;
let flashUntil = 0, cooldownUntil = 0, previousGrounded = true, lastCombatToastAt = 0;
let keyboard = new Set(), joystick = { x: 0, y: 0, activePointer: null };
let buttons = { glide: false, jumpQueued: false, blastQueued: false };
let hero = { x: -14, y: -15, h: .2, vH: 0, grounded: true, facing: 0, moving: false };
let lastFpsCheck = 0, performanceBudget = null;
// Independent per-world saves: no scores are sent to the server by this module.
const CAMPAIGN_WORLD = "storm";
const campaignPlatform = createCampaignPlatform({ world: CAMPAIGN_WORLD,
  enabled: /^https?:$/.test(location.protocol || "") });
const platformStatus = document.getElementById("platformStatus");
const disconnectPlatformStatus = campaignPlatform.subscribe(state => {
  if (platformStatus) platformStatus.textContent = `${state.player} · Device best: ${state.best.toLocaleString()} · Scores stay on this device`;
});
const runtimeControls = bindCampaignRuntime({
  onGraphicsLost: () => pause("The graphics device was interrupted. Continue when the scene is restored, or reload to resume your saved run."),
  onGraphicsRestored: () => announce("Graphics restored. Continue your adventure when ready.", 4),
  onStatus: message => announce(message, 3),
});
const campaignAudio = createCampaignAudio({ world: CAMPAIGN_WORLD });
const campaignPresentation = createCampaignPresentation({ world: CAMPAIGN_WORLD, audio: campaignAudio, reducedMotion: REDUCED_MOTION });
const tuning = worldBalance(CAMPAIGN_WORLD);
const jumpAssist = createJumpAssist();
const progressStore = createCampaignSave({
  world: CAMPAIGN_WORLD,
  relicIds: relics.map(relic => relic.id),
  checkpointIds: checkpoints.map(cp => cp.id),
  // Stable names prevent the same enemy from giving repeated scores on reload.
  enemyIds: [...['Storm scout', 'Citadel sentry'], ...CAMPAIGN_DEPTH.storm.enemies.map(enemy => enemy.name)],
  guardianMaxHp: GUARDIAN_MAX_HP,
});
let savedSnapshot = null;
let saveClock = 0;
let saveErrorNotified = false;

/** Mark a point-in-time save as safe to resume: no midair position or projectiles. */
function progressSnapshot() {
  return {
    checkpointId: checkpoint.id,
    relicIds: [...relicSet],
    defeatedEnemyIds: enemies.filter(enemy => !enemy.alive).map(enemy => enemy.id),
    guardianDefeated: Boolean(guardian?.defeated),
    guardianHp: guardian?.hp ?? GUARDIAN_MAX_HP,
    score, health,
  };
}
function saveProgress() {
  if (!initialized || (currentMode !== "playing" && currentMode !== "paused")) return;
  if (!progressStore.write(progressSnapshot()) && !saveErrorNotified) {
    saveErrorNotified = true;
    announce("Device storage is unavailable. This run will not be saved.", 4);
  }
}
function restoreProgress(snapshot, retry = false) {
  resetGame(false);
  const destination = checkpoints.find(cp => cp.id === snapshot.checkpointId) ?? checkpoints[0];
  checkpoint = destination;
  const safeHeight = floorAt(destination.x, destination.y)?.height ?? .2;
  hero.x = destination.x; hero.y = destination.y; hero.h = safeHeight;
  hero.vH = 0; hero.grounded = true; hero.moving = false;
  if (heroRoot) heroRoot.position = pos(hero.x, hero.y, hero.h);
  relicSet = new Set(snapshot.relicIds);
  relicObjects.forEach(item => item.marker.setEnabled(!relicSet.has(item.id)));
  score = snapshot.score;
  health = retry ? 3 : snapshot.health;
  const defeated = new Set(snapshot.defeatedEnemyIds);
  enemies.forEach(enemy => {
    if (!defeated.has(enemy.id)) return;
    enemy.alive = false;
    enemy.hp = 0;
    enemy.root.setEnabled(false);
    enemy.hpFill.scaling.x = 0;
  });
  if (guardian && relicSet.size === relics.length) {
    if (snapshot.guardianDefeated) {
      Object.assign(guardian, createGuardianState(), {
        alive: false, active: false, defeated: true, hp: 0, phase: 0,
        mode: "defeated", pendingAttack: null, timer: 0,
      });
      guardianArt?.root?.setEnabled(false);
      clearGuardianSignals();
      portalMaterial.emissiveColor = B.Color3.FromHexString("#53dfff");
      visualPolish?.setPortalReady(true);
      clearStormHazards();
    } else {
      // Restart the windup rather than restoring a dangerous half-cast attack.
      awakenThunderGolem();
      guardian.hp = Math.max(1, Math.min(GUARDIAN_MAX_HP, snapshot.guardianHp));
      guardian.phase = guardianPhase(guardian.hp);
      guardian.mode = "idle";
      guardian.pendingAttack = null;
      guardian.timer = 2.5;
      clearGuardianSignals();
    }
  } else if (relicSet.size === relics.length) {
    portalMaterial.emissiveColor = B.Color3.FromHexString("#53dfff");
    visualPolish?.setPortalReady(true);
  }
  uiUpdate();
  guardianUi();
}
function showSaveOptions() {
  savedSnapshot = progressStore.load();
  ui.newRunBtn.hidden = !savedSnapshot;
  if (savedSnapshot) {
    // Returning players can reach both resume and new-run buttons on compact phones.
    ui.instructions.hidden = true;
    const checkpointName = savedSnapshot.checkpointId.replace(/[-_]/g, " ");
    menu("Sky Temple 3D", "Welcome back to Storm Citadel",
      `Saved at ${checkpointName} · ${savedSnapshot.relicIds.length}/${relics.length} relics · ${savedSnapshot.score.toLocaleString()} points. You'll resume safely at your checkpoint.`,
      "Resume Adventure", "SAVED PROGRESS");
  }
  if (CAMPAIGN_WORLD === "garden" && ui.continueCampaignBtn) {
    const recent = progressStore.lastWorld();
    ui.continueCampaignBtn.hidden = !recent || recent === "garden";
    if (recent && recent !== "garden") {
      ui.continueCampaignBtn.textContent = `Continue Campaign · ${CAMPAIGN_WORLD_TITLES[recent]}`;
      ui.continueCampaignBtn.dataset.world = recent;
    }
  }
}


// Visual upgrades must never interrupt the already-verified gameplay loop.
// If a browser cannot animate an optional effect, retain the original scene.
function safelyUpdateVisuals(action, fn) {
  if (!visualPolish) return false;
  try { fn(visualPolish); return true; }
  catch (err) {
    console.warn(`Optional storm ${action} disabled; gameplay continues.`, err);
    try { visualPolish.dispose(); } catch {}
    visualPolish = null;
    return false;
  }
}

function v3(x, y, height = 0) {
  const p = horizontalToEngine(x, y, height);
  return new B.Vector3(p.x, p.y, p.z);
}
function pos(x, y, h) { return v3(x, y, h); }
function setMode(mode) {
  const wasPlaying = currentMode === "playing";
  currentMode = mode;
  campaignAudio.setState({ mode, visible: !document.hidden, battle: Boolean(guardian?.active && !guardian?.defeated) });
  campaignPresentation.setMode(mode);
  if (mode !== "playing") glideSoundActive = false;
  if (mode !== "playing") performanceBudget?.reset();
  if (mode === "playing" && !wasPlaying) heroAnimator?.resume();
  else if (mode !== "playing" && wasPlaying) heroAnimator?.suspend();
  const showHud = mode === "playing" || mode === "paused";
  ui.hud.hidden = !showHud;
  ui.questGuide.hidden = !showHud;
  ui.guardianHud.hidden = !showHud || !guardian?.active;
  syncTouchControls();
  guardianUi();
  ui.overlay.classList.toggle("closed", mode === "playing");
  ui.overlay.setAttribute("aria-hidden", String(mode === "playing"));
  if (mode !== "playing") { joystick.x = joystick.y = 0; buttons.glide = false; buttons.jumpQueued = false; jumpAssist.reset(); }
  orientHint();
}
function fillLoading(percent, message) {
  ui.loadFill.style.width = `${percent}%`;
  ui.loadTrack.setAttribute("aria-valuenow", String(percent));
  ui.loadingText.textContent = message;
}
function menu(title, sub, detail, action, eyebrow = "RISE OF THE RELIC MASTER") {
  ui.overlayEyebrow.textContent = eyebrow;
  ui.overlayTitle.textContent = title;
  ui.overlaySubtitle.textContent = sub;
  ui.overlayDescription.textContent = detail;
  ui.primaryBtn.textContent = action;
  ui.nextWorldBtn.hidden = true;
  ui.instructions.hidden = false;
  ui.loadingText.hidden = true;
  ui.loadTrack.hidden = true;
}
function announce(text, seconds = 2.5) {
  ui.toast.hidden = false;
  ui.toast.textContent = text;
  toastUntil = performance.now() + seconds * 1000;
}
function orientHint() {
  const portrait = innerHeight > innerWidth;
  ui.orientationHint.hidden = !touchControlsRequested() || !portrait || currentMode !== "playing";
}
function uiUpdate() {
  ui.relicCount.textContent = `${relicSet.size} / ${relics.length}`;
  ui.healthCount.textContent = "♥ ".repeat(Math.max(0, health)).trim() || "—";
  ui.scoreCount.textContent = score.toLocaleString();
  const routeHint = questDirection(hero, relics, relicSet, cameraYaw);
  const nextQuestText = guardian?.active
    ? "Thunder Golem awakened! Read the warnings, dodge its spells and use Blast."
    : portalAvailable(relicSet.size, relics.length, guardian)
      ? "Thunder Golem defeated! Cross the final bridge to the Solar Gateway."
      : routeHint ?? "Collect the relics to unlock the Guardian";
  if (ui.questText.textContent !== nextQuestText) ui.questText.textContent = nextQuestText;
}
function submitScore() {
  campaignPlatform.recordScore(score);
}
function soundCue(event, options) {
  try { campaignAudio.play(event, options); } catch { /* Sound cannot interrupt play. */ }
  campaignPresentation.emit(event);
}
function material(name, diffuse, emissive, alpha = 1) {
  const mat = new B.StandardMaterial(name, scene);
  mat.diffuseColor = B.Color3.FromHexString(diffuse);
  mat.emissiveColor = B.Color3.FromHexString(emissive);
  mat.alpha = alpha;
  if (alpha < 1) mat.backFaceCulling = false;
  return mat;
}
// Optional visual quality layer: never allow a visual exception to stop a saved game.
function safelyRunCampaignVisuals(label, fn) {
  if (!campaignVisuals) return;
  try { fn(campaignVisuals); }
  catch (error) {
    console.warn(`Campaign visuals disabled during ${label}; gameplay continues.`, error);
    try { campaignVisuals.dispose(); } catch {}
    campaignVisuals = null;
  }
}
function emitCampaignVisual(event) {
  safelyRunCampaignVisuals(event, vfx => vfx.emit(event));
}
function tickCampaignVisuals(dt) {
  safelyRunCampaignVisuals('update', vfx => vfx.step(dt, skyTime, {
    guardian, portalReady: portalAvailable(relicSet.size, relics.length, guardian),
    fps: engine?.getFps?.() ?? 60,
  }));
}
function beginScene() {
  const options = { preserveDrawingBuffer: false, stencil: false, powerPreference: MOBILE ? "low-power" : "high-performance" };
  engine = new B.Engine(ui.gameCanvas, true, options, false);
  // Performance level is independent from character/world gameplay data.
  performanceBudget = createCampaignPerformanceController(engine, {
    mobile: MOBILE || automaticTouchControls(),
    dpr: devicePixelRatio || 1,
    quality: URL_OPTIONS.get("quality") || "auto",
  });
  scene = new B.Scene(engine);
  scene.useRightHandedSystem = true;
  scene.clearColor = new B.Color4(.045, .059, .125, 1);
  scene.fogMode = B.Scene.FOGMODE_EXP2;
  scene.fogColor = new B.Color3(.105, .13, .235);
  scene.fogDensity = .0075;
  scene.imageProcessingConfiguration.contrast = 1.32;
  scene.imageProcessingConfiguration.exposure = 1.09;
  new B.HemisphericLight("Storm Citadel ambient light", new B.Vector3(.1, 1, .2), scene).intensity = 1.07;
  const sun = new B.DirectionalLight("Electric storm skylight", new B.Vector3(-.7, -1, -.35), scene);
  sun.intensity = 1.25;
  sun.diffuse = new B.Color3(.74, .78, 1);
  camera = new B.FreeCamera("FollowCamera", new B.Vector3(-18, 7, 24), scene);
  camera.minZ = .09;
  camera.maxZ = 450;
  camera.fov = MOBILE ? 1.04 : .90;
  scene.activeCamera = camera;
  relicMaterial = material("Storm charge relic glow", "#86e8ff", "#4588ef");
  portalMaterial = material("Solar Gateway energy", "#ffe4af", "#9a7538", .76);
  projectileMaterial = material("Relic lightning pulse", "#b0fbff", "#4a93ff");
  enemyShotMaterial = material("Enemy violet pulse", "#c68aff", "#8f35d6");
  stormStrikeMaterial = material("Storm lightning warning", "#b8d3ff", "#7459f1", .72);
  scene.onDisposeObservable.add(() => {
    heroAnimator?.dispose();
    try { campaignVisuals?.dispose(); } catch {}
    campaignVisuals = null;
    visualPolish?.dispose();
    stormStrikes.forEach(s => s.mesh?.dispose());
    try { engine.stopRenderLoop(); } catch {}
  });
  engine.runRenderLoop(() => {
    const delta = clamp(engine.getDeltaTime() / 1000, 0, .045);
    if (currentMode === "playing") update(delta);
    if (scene) {
      if (heroRoot) updateCamera(delta);
      scene.render();
    }
    if (performance.now() > toastUntil && !ui.toast.hidden) ui.toast.hidden = true;
    if (performance.now() > flashUntil && ui.damageFlash.classList.contains("active")) {
      ui.damageFlash.classList.remove("active");
    }
    if (DEBUG && performance.now() - lastFpsCheck > 1000) {
      ui.fpsDisplay.hidden = false;
      ui.fpsDisplay.textContent = `${Math.round(engine.getFps())} FPS · ${performanceBudget?.state().mode || "auto"} · ${Math.round(engine.getHardwareScalingLevel() * 100) / 100} scale · ${hasRiggedHero ? "rigged" : "static fallback"} · ${heroAnimator?.currentClip || "none"} · ${hero.x.toFixed(1)},${hero.y.toFixed(1)},${hero.h.toFixed(1)}`;
    }
    if (performance.now() - lastFpsCheck > 1400) { optimizeForMobile(); lastFpsCheck = performance.now(); }
  });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", onResize);
  window.addEventListener("pagehide", () => engine?.dispose(), { once: true });
}
function onResize() {
  syncTouchControls();
  engine?.resize();
  performanceBudget?.reset();
  camera && (camera.fov = MOBILE && innerWidth < 700 ? 1.05 : .9);
  orientHint();
}
function optimizeForMobile() {
  if (currentMode !== "playing" || !engine) return;
  const fps = engine.getFps();
  // Existing v0.9 visual budget still follows actual framerate.
  safelyRunCampaignVisuals('performance adaptation', vfx => vfx.adaptiveBudget(fps));
  performanceBudget?.sample({ fps, active: true, visible: !document.hidden });
}
async function loadGlb(file, label) {
  const worldAsset = label === "world";
  const start = worldAsset ? 21 : 67;
  const end = worldAsset ? 64 : 89;
  const begin = performance.now();
  const result = await B.SceneLoader.ImportMeshAsync(null, "../assets/", file, scene, (progress) => {
    // Babylon reports real byte progress when the host/CDN supplies totals.
    // Avoid invented percentages when an asset is cached or total is unknown.
    if (!progress?.lengthComputable || !progress.total || currentMode !== "loading") return;
    const part = Math.max(0, Math.min(1, progress.loaded / progress.total));
    fillLoading(Math.round(start + (end - start) * part), worldAsset ? "Loading the floating islands…" : "Loading the relic hero…");
  });
  for (const mesh of result.meshes || []) mesh.isPickable = false;
  if (DEBUG) console.info(`[Sky Temple] ${file} loaded in ${Math.round(performance.now() - begin)} ms`);
  return result;
}
async function loadGame() {
  try {
    if (!B?.Engine || !B?.SceneLoader?.ImportMeshAsync) throw Error("3D renderer is unavailable. Reload the page to try again.");
    fillLoading(6, "Preparing the sky…");
    beginScene();
    fillLoading(21, "Loading the floating islands…");
    const world = await loadGlb("StormCitadel_Enhanced_Yup_Mobile.glb", "world");
    if (!world.meshes?.length) throw Error("Storm Citadel world was empty.");
    // Extra visible islands exactly match the collision definitions in world-logic.
    buildCampaignDepth(B, scene, "storm");
    fillLoading(66, "Preparing your relic guardian…");
    // Prefer the refined 3D hero; if an asset or skin fails, preserve the
    // *previously tested animated model*, then the original static hero.
    // An incomplete import must be cleaned up before the next attempt.
    let character = null;
    hasRiggedHero = false;
    for (const [file, animated] of [
      ["RelicHero_Rigged_Refined_Mobile.glb", true],
      ["RelicHero_Rigged_Mobile.glb", true],
      ["RelicHero_Mobile.glb", false],
    ]) {
      let attempt = null;
      try {
        attempt = await loadGlb(file, file);
        if (!attempt?.meshes?.length) throw Error("Hero GLB had no meshes");
        if (animated && !(attempt.animationGroups || []).some(g => /Idle/i.test(g.name || ""))) {
          throw Error("Hero GLB contained no playable animation groups");
        }
        character = attempt;
        hasRiggedHero = animated;
        break;
      } catch (err) {
        console.warn("Hero model unavailable; trying next option:", file, err);
        for (const group of attempt?.animationGroups || []) {
          try { group.dispose?.(); } catch {}
        }
        for (const node of [...(attempt?.meshes || []), ...(attempt?.transformNodes || [])]) {
          try { node.dispose?.(); } catch {}
        }
      }
    }
    if (!character) throw Error("No Sky Temple hero model could be loaded.");
    if (!character.meshes?.length) throw Error("Hero model was empty.");
    heroRoot = new B.TransformNode("Player collision origin", scene);
    heroVisual = new B.TransformNode("Hero visual animation pivot", scene);
    heroVisual.parent = heroRoot;
    const importedRoot = character.meshes.find(mesh => !mesh.parent) ?? character.meshes[0];
    importedRoot.parent = heroVisual;
    importedRoot.scaling.setAll(hasRiggedHero ? .62 : .69);
    // Both source characters face +Z; forward movement in Babylon is -Z.
    heroVisual.rotation.y = Math.PI;
    heroAnimator = createHeroAnimator(hasRiggedHero ? character.animationGroups : [], {
      reduceMotion: REDUCED_MOTION,
      onFailure: err => console.warn("Hero animation failed", err),
    });
    createRelics(); createEnemies(); createPortal(); createStormHazards();
    // Guardian art is optional. If an unsupported GPU/engine fails to create
    // the boss meshes, the verified relic/portal adventure stays completable.
    try { createThunderGolem(); } catch (err) {
      console.warn("Guardian visuals could not initialize; retaining original portal journey", err);
      guardian = null; guardianArt = null; guardianTarget = null;
    }
    if (guardianArt) await loadOrnateGuardianSkin("ThunderGolem_Ornate_Mobile.glb");
    // Optional scenery and boss animation polish. A shader/mesh limitation must
    // never stop the already-tested relic, combat or mobile-control systems.
    try {
      visualPolish = createStormVisuals(B, scene, {
        islands, guardianArt, portalNode, mobile: MOBILE, reducedMotion: REDUCED_MOTION,
      });
    } catch (err) {
      visualPolish = null;
      console.warn("Storm visual effects unavailable; gameplay continues.", err);
    }
    // Reuse the verified geometry and boss logic. Only additional display
    // meshes are generated, with a lower budget on touch-sized screens.
    if (URL_OPTIONS.get("fx") !== "off") {
      try {
        campaignVisuals = createCampaignVisuals(B, scene, {
          world: CAMPAIGN_WORLD, islands, guardianArt, portalNode, heroRoot,
          mobile: MOBILE || automaticTouchControls(), reducedMotion: REDUCED_MOTION,
        });
      } catch (error) {
        campaignVisuals = null;
        console.warn("Optional campaign VFX could not load; gameplay continues.", error);
      }
    }
    if (DEBUG) createDebugProxies();
    resetGame(false);
    fillLoading(100, "Storm Citadel is ready.");
    initialized = true;
    ui.primaryBtn.disabled = false;
    ui.loadingText.hidden = true;
    ui.loadTrack.hidden = true;
    setMode("menu");
    showSaveOptions();
  } catch (err) {
    console.error("[SkyTemple3D] Scene initialization failed", err);
    const failure = describeCampaignLoadError(err);
    menu("Sky Temple 3D", "Unable to open Storm Citadel", failure.message, "Try Again", failure.label);
    ui.primaryBtn.disabled = false;
    ui.primaryBtn.dataset.retry = "true";
    setMode("error");
  }
}
function makeRelicVisual(id) {
  const parent = new B.TransformNode(`Collectible ${id}`, scene);
  const shape = B.MeshBuilder.CreatePolyhedron(`Relic gem ${id}`, { type: 1, size: .66 }, scene);
  shape.material = relicMaterial;
  shape.parent = parent;
  const hoop = B.MeshBuilder.CreateTorus(`Relic orbit ${id}`, { diameter: 1, thickness: .028, tessellation: 20 }, scene);
  hoop.rotation.x = Math.PI / 2;
  hoop.parent = parent;
  hoop.material = material(`Relic ring ${id}`, "#d7ae62", "#bd8a33");
  return parent;
}
function createRelics() {
  relicObjects = relics.map((r, i) => {
    const marker = makeRelicVisual(r.id);
    const ground = floorAt(r.x, r.y)?.height ?? 1;
    marker.position = pos(r.x, r.y, ground + 1.5);
    return { ...r, marker, initialY: marker.position.y, phase: i * 1.5 };
  });
}
function makeDrone(name, x, y, offset = 0, role = "scout") {
  const root = new B.TransformNode(name, scene);
  const body = B.MeshBuilder.CreateSphere(`${name} core`, { diameter: .8, segments: 10 }, scene);
  body.parent = root;
  body.material = material(`${name} armour`, role === "bulwark" ? "#7e709f" : role === "skimmer" ? "#8eacbc" : "#a68b61", role === "bulwark" ? "#3f316c" : "#282034");
  const eye = B.MeshBuilder.CreateSphere(`${name} violet eye`, { diameter: .4, segments: 12 }, scene);
  eye.parent = root;
  eye.position.set(0, 0, -.39);
  eye.material = material(`${name} energy`, role === "bulwark" ? "#ffa8ed" : role === "skimmer" ? "#8eeaff" : "#b955ff", role === "bulwark" ? "#a949ae" : role === "skimmer" ? "#3296db" : "#a742ff");
  for (const side of [-1, 1]) {
    const wing = B.MeshBuilder.CreateBox(`${name} wing ${side}`, { width: .9, height: .13, depth: .33 }, scene);
    wing.parent = root;
    wing.position.x = side * .79;
    wing.rotation.z = side * .26;
    wing.material = body.material;
  }
  // Readable world-space health indicator, without DOM overlays over touch controls.
  const hpBackground = B.MeshBuilder.CreateBox(`${name} health backing`, { width: 1.1, height: .08, depth: .03 }, scene);
  hpBackground.parent = root;
  hpBackground.position.y = .95;
  hpBackground.material = material(`${name} health background`, "#263045", "#0c1226");
  const hpFill = B.MeshBuilder.CreateBox(`${name} health fill`, { width: 1.04, height: .06, depth: .04 }, scene);
  hpFill.parent = root;
  hpFill.position.set(0,.95,-.04);
  hpFill.material = material(`${name} health glow`, "#a8efff", "#3f6fff");
  const ground = floorAt(x, y)?.height ?? 2;
  const home = { x, y, h: ground + 2.9 };
  root.position = pos(home.x, home.y, home.h);
  if (role === "bulwark") root.scaling.setAll(1.20);
  else if (role === "skimmer") root.scaling.setAll(.92);
  return { id: name, root, hpFill, home, x, y, h: home.h, role, maxHp: enemyMaxHp(role), hp: enemyMaxHp(role),
    alive: true, phase: offset, cooldown: 2.5 + offset, windup: 0 };
}
function createEnemies() {
  enemies = [makeDrone("Storm scout", -5.4, -1.7, 0), makeDrone("Citadel sentry", 14.2, 12.0, 2.3)];
  // Five enemies per world: two original patrols plus three new expedition encounters.
  enemies.push(...CAMPAIGN_DEPTH.storm.enemies.map(e => makeDrone(e.name,e.x,e.y,e.phase,e.role)));
}
function createPortal() {
  portalNode = new B.TransformNode("Storm Citadel solar gateway", scene);
  const ground = floorAt(goal.x, goal.y)?.height ?? 3.9;
  portalNode.position = pos(goal.x, goal.y, ground + 2.2);
  for (const [i, diameter] of [3.2, 2.6, 1.9].entries()) {
    const torus = B.MeshBuilder.CreateTorus(`Storm gateway ring ${i}`, { diameter, thickness: .11 - i * .012, tessellation: 36 }, scene);
    torus.parent = portalNode;
    torus.rotation.x = Math.PI / 2;
    torus.position.z = -.1 * i;
    torus.material = i === 1 ? relicMaterial : portalMaterial;
  }
  const ringPedestal = B.MeshBuilder.CreateCylinder("Portal stone dais", { height: .4, diameter: 3.7, tessellation: 20 }, scene);
  ringPedestal.parent = portalNode;
  ringPedestal.position.y = -1.9;
  ringPedestal.material = material("Portal stone", "#555e8b", "#141937");
}
// The world's lightning rods share an isolated, pure timing state machine.
// All warning geometry is constructed once so hazards do not create per-frame meshes.
function createStormHazards() {
  stormHazards = createHazardStates().map((hazard) => {
    const warning = B.MeshBuilder.CreateTorus(`Lightning marker ${hazard.id}`, {
      diameter: 2, thickness: .065, tessellation: 28,
    }, scene);
    warning.material = stormStrikeMaterial;
    warning.position = pos(hazard.x,hazard.y,hazard.h+.09);
    warning.rotation.x = Math.PI/2;
    warning.scaling.setAll(hazard.radius);
    warning.isPickable = false;
    warning.setEnabled(false);
    return {...hazard,warning};
  });
}
function clearStormHazards() {
  stormWarnings.clear();
  ui.stormHazardWarning.hidden = true;
  for(const hazard of stormHazards){
    Object.assign(hazard,{mode:'idle',timer:0,casts:0});
    hazard.warning?.setEnabled(false);
  }
  stormStrikes.forEach(e => e.mesh.dispose());
  stormStrikes = [];
}
function updateStormHazards(dt) {
  // Lightning-rod warnings never compete with the boss's own warnings.
  const enabled = !guardian?.active && !guardian?.defeated;
  for(const hazard of stormHazards) {
    const events = stepHazard(hazard, dt, hero, enabled);
    for(const event of events) {
      if(event.type==='warn'){
        hazard.warning.setEnabled(true);
        stormWarnings.set(hazard.id, `${hazard.name} — move away or jump!`);
        soundCue('hazard');
      }
      if(event.type==='strike') {
        hazard.warning.setEnabled(false);
        stormWarnings.delete(hazard.id);
        const beam = B.MeshBuilder.CreateCylinder(`Lightning bolt ${hazard.id}`, {
          diameter: .24, height: 9, tessellation: 7,
        }, scene);
        beam.material=stormStrikeMaterial;
        beam.position=pos(hazard.x,hazard.y,hazard.h+4.5);
        beam.isPickable=false;
        stormStrikes.push({mesh:beam,life:.18});
        if (lightningHits(hero,hazard)) pulseDamage('Lightning strike! Dodge or jump during the warning.');
        else if (distance2(hero,hazard)<4) addImpact(hazard.x,hazard.y,hazard.h+.12,'enemy');
      }
    }
  }
  if(!enabled){
    stormWarnings.clear();
    stormHazards.forEach(h=>h.warning?.setEnabled(false));
  }
  ui.stormHazardWarning.hidden=stormWarnings.size===0;
  ui.stormHazardWarning.textContent=stormWarnings.values().next().value || '';
  for(let i=stormStrikes.length-1;i>=0;i--){
    stormStrikes[i].life-=dt;
    if(stormStrikes[i].life<=0){
      stormStrikes[i].mesh.dispose();
      stormStrikes.splice(i,1);
    }
  }
}
// ---- Thunder Golem: separate from ordinary flying drones ----
function createThunderGolem() {
  const ground = floorAt(GUARDIAN_POSITION.x, GUARDIAN_POSITION.y)?.height ?? 4.2;
  const root = new B.TransformNode("Thunder Golem boss", scene);
  root.position = pos(GUARDIAN_POSITION.x, GUARDIAN_POSITION.y, ground);
  const granite = material("Sentinel dark stone", "#3c4059", "#121630");
  const slate = material("Sentinel blue-grey stone", "#737fba", "#202251");
  const gold = material("Sentinel inlaid gold", "#e6bd78", "#71619f");
  const crystal = material("Sentinel violet crystal", "#c486ff", "#8650d9");
  const eyes = material("Sentinel molten eyes", "#d0eaff", "#768cef");
  function piece(kind, name, options, parent, loc, mat) {
    const mesh = B.MeshBuilder[kind](name, options, scene);
    mesh.parent = parent;
    mesh.position.set(...loc);
    mesh.material = mat;
    mesh.isPickable = false;
    return mesh;
  }
  // Ornate ancient stone-and-gold silhouette: shoulders, crown, chest core
  // and animated gauntlets. Small fixed-geometry shapes are preferable to
  // per-frame dynamic geometry on mobile devices.
  piece("CreateCylinder", "Sentinel base", { height: .52, diameterTop: 1.2, diameterBottom: 2.2, tessellation: 8 }, root, [0,.32,0], granite);
  piece("CreateBox", "Sentinel chest", { width: 2.10, height: 1.58, depth: 1.10 }, root, [0,2.16,0], slate);
  piece("CreateBox", "Sentinel armour chest plate", { width: 1.64, height: 1.0, depth: .17 }, root, [0,2.28,.65], granite);
  piece("CreateBox", "Sentinel waist band", { width: 2.2, height: .20, depth: 1.26 }, root, [0,1.36,0], gold);
  piece("CreateBox", "Sentinel breastplate trim", { width: 2.26, height: .17, depth: 1.24 }, root, [0,2.88,.05], gold);
  piece("CreateBox", "Sentinel mid trim", { width: 2.12, height: .10, depth: 1.2 }, root, [0,2.13,.05], gold);
  for (const side of [-1,1]) {
    piece("CreateBox", `Sentinel greave ${side}`, { width: .58,height: 1.0,depth:.62 }, root, [side*.59,.69,.04], slate);
    piece("CreateBox", `Sentinel leg gold ${side}`, { width:.69,height:.17,depth:.75 }, root, [side*.59,.28,.08], gold);
    piece("CreateBox", `Sentinel shoulder ${side}`, { width: 1.02, height:.67, depth:1.12 }, root, [side*1.30,2.97,0], granite);
    piece("CreateBox", `Sentinel shoulder trim ${side}`, { width:1.08,height:.14,depth:1.16 }, root, [side*1.30,3.29,0], gold);
    const arm = new B.TransformNode(`Sentinel attack arm ${side}`, scene);
    arm.parent = root; arm.position.set(side*1.62,2.56,0);
    piece("CreateBox", `Sentinel arm ${side}`, { width:.54,height:1.35,depth:.70 }, arm,[side*.09,-.59,0],slate);
    piece("CreateBox", `Sentinel gauntlet ${side}`, { width:.80,height:.48,depth:.83 }, arm,[side*.12,-1.17,.10],granite);
    piece("CreatePolyhedron", `Sentinel hand crystal ${side}`,{type:1,size:.32},arm,[side*.12,-1.27,.58],crystal);
    if (side<0) root.attackArmLeft=arm; else root.attackArmRight=arm;
    // Curved-looking stone horns from tapered cylinders.
    const horn = piece("CreateCylinder", `Sentinel horn ${side}`, { height:.97,diameterTop:.04,diameterBottom:.36,tessellation:7 },root,[side*.52,4.23,0],gold);
    horn.rotation.z = side*.35;
  }
  piece("CreateBox", "Sentinel head", {width:1.1,height:.86,depth:.90},root,[0,3.55,.06],granite);
  piece("CreateBox", "Sentinel brow",{width:1.28,height:.17,depth:1.05},root,[0,3.85,.10],gold);
  for (const side of [-1,1]) piece("CreateSphere",`Sentinel eye ${side}`,{diameter:.18,segments:8},root,[side*.25,3.59,.55],eyes);
  const core = piece("CreateSphere","Sentinel Heart of Storm",{diameter:.80,segments:16},root,[0,2.41,.83],crystal);
  const halo=piece("CreateTorus","Sentinel energy halo",{diameter:1.25,thickness:.065,tessellation:24},root,[0,2.41,.92],gold);
  halo.rotation.x=Math.PI/2;
  const floatingShards=[];
  for (let i=0;i<4;i++) {
    floatingShards.push(piece("CreatePolyhedron",`Sentinel orbit crystal ${i}`,{type:1,size:.36},root,[0,3.75,0],i%2?crystal:gold));
  }
  guardianArt={ root, ground, core, halo, crystal, eyes, floatingShards, hitFlash:0 };
  guardian={...createGuardianState(), x:GUARDIAN_POSITION.x, y:GUARDIAN_POSITION.y,
    h:ground+2.4, alive:false };
  guardianTarget=guardian;
  // Reuse one ring mesh for each telegraph; hiding them avoids effect leaks.
  guardianSigil = piece("CreateTorus", "Thunder sigil ground warning",{diameter:2,thickness:.085,tessellation:40},null,[0,0,0],crystal);
  guardianSigil.setEnabled(false);
  guardianWave = piece("CreateTorus", "Guardian expanding shockwave",{diameter:2,thickness:.12,tessellation:48},null,[0,0,0],eyes);
  guardianWave.setEnabled(false);
  root.setEnabled(false);
}
// Enhancement-only: retain the tested primitive guardian if the mesh cannot load.
async function loadOrnateGuardianSkin(fileName) {
  if (!guardianArt?.root) return;
  try {
    const imported = await loadGlb(fileName, "ornate guardian art");
    const node = imported.meshes.find(mesh => !mesh.parent) || imported.meshes[0];
    if (!node) return;
    // Keep the original animated gauntlets, energy core and orbiting crystals.
    // Hide only non-animated primitive body/head pieces after GLB import succeeds.
    for (const mesh of guardianArt.root.getChildMeshes(false)) {
      const isAnimatedArm = (() => {
        let item = mesh.parent;
        while (item && item !== guardianArt.root) {
          if (item === guardianArt.root.attackArmLeft || item === guardianArt.root.attackArmRight) return true;
          item = item.parent;
        }
        return false;
      })();
      if (!isAnimatedArm && !/Heart of Storm|energy halo|orbit crystal/.test(mesh.name || "")) {
        mesh.setEnabled(false);
      }
    }
    node.parent = guardianArt.root;
    guardianArt.skinRoot = node;
    announce("The guardian's ancient armour glimmers to life.", 2.4);
  } catch (error) {
    console.warn("Optional guardian art unavailable; retaining the verified guardian.", error);
  }
}
function guardianUi() {
  const visible=Boolean(guardian?.active);
  ui.guardianHud.hidden = !visible || (currentMode !== "playing" && currentMode !== "paused");
  if (!guardian) return;
  ui.guardianName.textContent="THUNDER GOLEM";
  ui.guardianPhaseText.textContent=guardianTitle(guardian.phase);
  ui.guardianHealthFill.style.width=`${Math.round(guardian.hp/GUARDIAN_MAX_HP*100)}%`;
  ui.guardianHealthFillTrack.setAttribute("aria-valuenow",String(guardian.hp));
}
function awakenThunderGolem() {
  if (!guardian || !awakenGuardian(guardian)) return;
  guardian.alive=true;
  clearStormHazards();
  guardianArt.root.setEnabled(true);
  guardianUi();
  announce("The Thunder Golem awakens! Dodge its lightning to open the Solar Gateway!",4.2);
  campaignAudio.setState({ battle: true });
  soundCue('boss-awaken');
}
function clearGuardianSignals() {
  guardianSigil?.setEnabled(false);
  guardianWave?.setEnabled(false);
  if (ui.guardianWarning) { ui.guardianWarning.hidden=true; ui.guardianWarning.dataset.attack=""; }
  activeWave=null;
  guardianMarker=null;
}
function guardianDefeated() {
  guardian.alive=false;
  guardianArt.root.setEnabled(false);
  clearGuardianSignals();
  clearStormHazards();
  score+=420;
  portalMaterial.emissiveColor=B.Color3.FromHexString("#53dfff");
  visualPolish?.setPortalReady(true);
  ui.guardianHud.hidden=true;
  announce("Thunder Golem defeated! +420 · The Solar Gateway is open!",4);
  campaignAudio.setState({ battle: false });
  soundCue('boss-defeated');
  saveProgress();
}
function castGuardianAttack(attack) {
  if (!guardian?.active) return;
  soundCue('boss-cast');
  if (attack==="bolt") {
    const from={x:guardian.x,y:guardian.y,h:guardian.h};
    const to={x:hero.x,y:hero.y,h:hero.h+1.0};
    const v=vectorToTarget(from,to,guardian.phase===3?7.6:6.4);
    const mesh=B.MeshBuilder.CreateSphere("Sentinel violet arc",{diameter:.63,segments:9},scene);
    mesh.material=enemyShotMaterial;
    mesh.position=pos(from.x,from.y,from.h);
    enemyShots.push({mesh,...from,...v,life:2.35});
    addImpact(from.x,from.y,from.h,"enemy");
  }
  if (attack==="sigil") {
    guardianSigil?.setEnabled(false);
    if (guardianMarker) {
      addImpact(guardianMarker.x,guardianMarker.y,guardianMarker.h+.12,"enemy");
      if (sigilHits(hero,guardianMarker)) pulseDamage("Thunder sigil! Move away from marked ground.");
    }
    guardianMarker=null;
  }
  if (attack==="wave") {
    guardianWave?.setEnabled(true);
    guardianWave.position=pos(guardian.x,guardian.y,guardianArt.ground+.16);
    activeWave={radius:0,hit:false,life:1.28};
  }
  ui.guardianWarning.hidden=true;
  ui.guardianWarning.dataset.attack="";
}
function updateGuardianWave(dt) {
  if (!activeWave) return;
  const prior=activeWave.radius;
  activeWave.radius=Math.min(WAVE_MAX_RADIUS,prior+WAVE_SPEED*dt);
  activeWave.life-=dt;
  guardianWave.scaling.setAll(Math.max(.1,activeWave.radius));
  guardianWave.scaling.y=.22;
  if (!activeWave.hit && hitCooldown<=0 && waveHits(hero,guardian,prior,activeWave.radius,guardianArt.ground)) {
    activeWave.hit=true;
    pulseDamage("Shockwave! Jump as the ring approaches.");
  }
  if (activeWave.life<=0 || activeWave.radius>=WAVE_MAX_RADIUS) {
    guardianWave.setEnabled(false); activeWave=null;
  }
}
function updateGuardian(dt) {
  if (!guardian || !guardianArt || !guardian.active) return;
  const radius=Math.hypot(hero.x-guardian.x,hero.y-guardian.y);
  const events=stepGuardian(guardian, dt * tuning.guardianClock, radius);
  for (const ev of events) {
    if (ev.type==="warn") {
      ui.guardianWarning.hidden=false;
      soundCue('boss-warn');
      ui.guardianWarning.textContent=GUARDIAN_ATTACKS[ev.attack].label;
      ui.guardianWarning.dataset.attack=ev.attack;
      if (ev.attack==="sigil") {
        const height=floorAt(hero.x,hero.y,hero.h+.6)?.height ?? hero.h;
        guardianMarker={x:hero.x,y:hero.y,h:height};
        guardianSigil.position=pos(hero.x,hero.y,height+.09);
        guardianSigil.scaling.setAll(2.05);
        guardianSigil.scaling.y=.18;
        guardianSigil.setEnabled(true);
      }
      if (ev.attack==="wave") {
        guardianArt.core.material.emissiveColor=B.Color3.FromHexString("#df63ff");
      }
      // A distinct readable warning is better than hiding danger in VFX.
      if (radius < GUARDIAN_RANGE+1) announce(GUARDIAN_ATTACKS[ev.attack].label,1.65);
    } else if (ev.type==="cast") {
      castGuardianAttack(ev.attack);
    }
  }
  if (!safelyUpdateVisuals("golem animation", polish =>
    polish.updateGuardian(dt, skyTime, guardian, guardianArt))) {
    // On visual-only failure, keep the previously verified boss animation.
    // Verified base animation remains the fallback on unsupported browsers.
    const t=skyTime*(REDUCED_MOTION?.55:1);
    guardianArt.root.position.y=guardianArt.ground+(REDUCED_MOTION?0:Math.sin(t*1.9)*.06);
    guardianArt.root.attackArmLeft.rotation.z= -.16+(guardian.mode==="windup"?-.65:Math.sin(t*1.2)*.08);
    guardianArt.root.attackArmRight.rotation.z=.16+(guardian.mode==="windup"?.65:Math.sin(t*1.1)*.08);
    guardianArt.halo.rotation.z+=dt*.25;
    guardianArt.floatingShards.forEach((shard,i)=>{
      const a=t*.8+i*Math.PI*.5;
      shard.position.set(Math.cos(a)*2.1,3.55+Math.sin(t+i)*.23,Math.sin(a)*1.65);
      shard.rotation.y+=dt*.8;
    });
    if (guardianArt.hitFlash>0) {
      guardianArt.hitFlash=Math.max(0,guardianArt.hitFlash-dt);
      if (!guardianArt.hitFlash) guardianArt.crystal.emissiveColor=B.Color3.FromHexString("#8650d9");
    }
    if (guardian.mode!=="windup" && guardianArt.hitFlash<=0) guardianArt.crystal.emissiveColor=B.Color3.FromHexString("#8650d9");
  }
  updateGuardianWave(dt);
  guardianUi();
}
function createDebugProxies() {
  const islandMaterial = material("Debug islands", "#0fff77", "#1c7a4d", .3);
  const bridgeMaterial = material("Debug bridges", "#ffca62", "#8d6f32", .42);
  for (const island of islands) {
    const m = B.MeshBuilder.CreateCylinder(`COLLIDER ${island.id}`, { diameter: island.r * 2, height: .10, tessellation: 32 }, scene);
    m.position = pos(island.x, island.y, island.h);
    m.material = islandMaterial;
  }
  for (const bridge of bridges) {
    const [ax, ay, ah] = bridge.from, [bx, by, bh] = bridge.to;
    const length = Math.hypot(bx - ax, by - ay);
    const m = B.MeshBuilder.CreateBox(`COLLIDER ${bridge.id}`, { width: bridge.width, depth: length, height: .09 }, scene);
    m.position = pos((ax + bx) / 2, (ay + by) / 2, (ah + bh) / 2);
    m.rotation.y = -Math.atan2(bx - ax, by - ay);
    m.material = bridgeMaterial;
  }
}
function resetGame(enter = true) {
  skyTime = 0;
  checkpoint = checkpoints[0];
  health = 3; score = 0; hitCooldown = launchCooldown = 0;
  flashUntil = cooldownUntil = 0;
  previousGrounded = true;
  ui.damageFlash.classList.remove("active");
  heroAnimator?.reset();
  jumpAssist.reset();
  safelyRunCampaignVisuals('reset', vfx => vfx.reset());
  relicSet = new Set();
  hero = { x: -14, y: -15, h: .2, vH: 0, grounded: true, facing: 0, moving: false };
  relicObjects.forEach(r => r.marker.setEnabled(true));
  clearStormHazards();
  if (guardian) {
    Object.assign(guardian,createGuardianState(),{alive:false});
    guardianArt.root.setEnabled(false);
    clearGuardianSignals();
    guardianUi();
  }
  enemies.forEach(e => { e.hp = e.maxHp ?? DRONE_HP; e.alive = true; e.root.setEnabled(true);
    e.cooldown = 2.5 + e.phase; e.windup = 0; e.hpFill.scaling.x = 1; });
  bolts.forEach(b => b.mesh.dispose()); bolts = [];
  enemyShots.forEach(b => b.mesh.dispose()); enemyShots = [];
  impacts.forEach(fx => fx.mesh.dispose()); impacts = [];
  if (heroRoot) heroRoot.position = pos(hero.x, hero.y, hero.h);
  portalMaterial.emissiveColor = B.Color3.FromHexString("#906534");
  visualPolish?.setPortalReady(false);
  buttons.glide = false; buttons.jumpQueued = buttons.blastQueued = false;
  uiUpdate();
  if (enter) { void campaignPlatform.connect(); void campaignAudio.unlock(); setMode("playing"); ui.gameCanvas.focus(); announce("Find the five storm relics!", 2.6); }
}
function resume() {
  void campaignPlatform.connect();
  void campaignAudio.unlock();
  setMode("playing");
  ui.gameCanvas.focus();
}
function pause(reason = "Return when you are ready to continue.") {
  if (currentMode !== "playing") return;
  menu("Sky Temple 3D", "Adventure paused", reason, "Continue Adventure");
  setMode("paused");
  saveProgress();
}
function endGame(won = false) {
  if (currentMode !== "playing") return;
  if (won) {
    heroAnimator?.trigger("Victory", 1.2);
    score += 500 + health * 60;
    submitScore();
    // Victory audio follows the terminal mode change below.
    menu("Sky Temple 3D", "Storm Citadel secured!", `The storm relics are restored and the Thunder Golem is defeated. The Solar Sanctuary lies beyond. Final score: ${score.toLocaleString()}.`, "Play Again", "STORM CITADEL CLEARED");
    try { const prior = Number(localStorage.getItem("wga_storm_citadel_best") || 0); if (score > prior) localStorage.setItem("wga_storm_citadel_best", String(score)); } catch {}
    setMode("won");
    soundCue('portal', { terminal: true });
    soundCue('victory', { terminal: true });
    progressStore.complete('solar');
    // Storm Citadel progression is stored separately and Sky Garden stays replayable.
    try { localStorage.setItem("wga_skytemple_storm_complete", "1"); } catch {}
    ui.nextWorldBtn.textContent = "Enter Solar Sanctuary";
    ui.nextWorldBtn.hidden = false;
  } else {
    menu("Sky Temple 3D", "The storm guardians prevailed", `Your journey reached ${relicSet.size} of ${relics.length} relics. Return to Storm Citadel and try a new route.`, "Try Again", "JOURNEY ENDED");
    if (progressStore.load()) ui.primaryBtn.textContent = "Retry from Checkpoint";
    setMode("lost");
    soundCue('defeat', { terminal: true });
  }
}
function collectRelics() {
  for (const relic of relicObjects) {
    if (relicSet.has(relic.id)) continue;
    if (Math.hypot(hero.x - relic.x, hero.y - relic.y) < 1.25 && Math.abs(hero.h - (relic.initialY - 1.5)) < 2.1) {
      relicSet.add(relic.id);
      relic.marker.setEnabled(false);
      score += 150;
      soundCue('relic');
      announce(`${relic.label} awakened · ${relicSet.size}/${relics.length}`);
      submitScore();
      saveProgress();
      if (canEnterPortal(relicSet.size)) {
        if (guardian) awakenThunderGolem();
        else { announce("All relics collected — find the exit portal!",3.2);
          portalMaterial.emissiveColor=B.Color3.FromHexString("#53dfff");
          visualPolish?.setPortalReady(true); }
      }
    }
  }
}
function checkpointUpdate() {
  const next = nextForwardCheckpoint(checkpoints, checkpoint, hero, 3.1);
  if (next?.id === checkpoint?.id) return;
  checkpoint = next;
  const recovered = health < 3;
  if (recovered) health = Math.min(3, health + tuning.checkpointHeal);
  announce(recovered ? "Citadel checkpoint reached · restored one heart" : "Citadel checkpoint reached", 2.1);
  soundCue('checkpoint');
  saveProgress();
}

function move(dt) {
  let forward = 0, strafe = 0;
  if (keyboard.has("w") || keyboard.has("arrowup")) forward += 1;
  if (keyboard.has("s") || keyboard.has("arrowdown")) forward -= 1;
  if (keyboard.has("d") || keyboard.has("arrowright")) strafe += 1;
  if (keyboard.has("a") || keyboard.has("arrowleft")) strafe -= 1;
  forward = clamp(forward + joystick.y, -1, 1);
  strafe = clamp(strafe + joystick.x, -1, 1);
  const length = Math.hypot(forward, strafe);
  const glide = buttons.glide || keyboard.has("shift");
  const assistedJump = jumpAssist.step({
    dt, pressed: buttons.jumpQueued, grounded: hero.grounded,
    verticalVelocity: hero.vH,
  });
  if (assistedJump) {
    heroAnimator?.trigger("Jump", .24);
    hero.vH = JUMP_VELOCITY;
    hero.grounded = false;
    soundCue('jump');
  }
  buttons.jumpQueued = false;
  const speed = length > .82 ? RUN_SPEED : WALK_SPEED;
  const v = movementVector(forward, strafe, cameraYaw, speed);
  hero.moving = length > .1;
  const oldH = hero.h;
  hero.x += v.x * dt;
  hero.y += v.y * dt;
  if (length > .03) hero.facing = Math.atan2(v.x, v.y);
  let floor = floorAt(hero.x, hero.y, hero.h, .75);
  if (hero.grounded) {
    if (floor && Math.abs(floor.height - hero.h) < .8) {
      hero.h = floor.height;
      hero.vH = 0;
    } else {
      hero.grounded = false;
      hero.vH = 0;
    }
  }
  if (!hero.grounded) {
    hero.vH -= (glide && hero.vH < 0 ? 5 : GRAVITY) * dt;
    if (glide && hero.vH < -2.6) hero.vH = -2.6;
    hero.h += hero.vH * dt;
    floor = floorAt(hero.x, hero.y, Math.max(hero.h, oldH), .15);
    if (floor && hero.vH <= 0 && hero.h <= floor.height && oldH >= floor.height - .2) {
      hero.h = floor.height;
      hero.vH = 0;
      hero.grounded = true;
      heroAnimator?.trigger("Land", .28);
      addImpact(hero.x, hero.y, hero.h + .04, "land");
      soundCue('land');
    }
  }
  const glidingNow = glide && !hero.grounded && hero.vH < 0;
  if (glidingNow && !glideSoundActive) soundCue('glide');
  glideSoundActive = glidingNow;
  if (hero.h < -16) fallRecovery();
  if (heroRoot) {
    heroRoot.position = pos(hero.x, hero.y, hero.h);
    heroRoot.rotation.y = -hero.facing;
    // Procedural bob remains only for the static fallback; the rigged hero
    // uses its GLB animation groups, keeping mobile movement controls intact.
    if (!hasRiggedHero) {
      const swing = REDUCED_MOTION ? 0 : Math.sin(skyTime * 10) * (hero.moving && hero.grounded ? .06 : .012);
      heroVisual.position.y = swing;
      heroVisual.rotation.z = hero.moving && hero.grounded ? Math.sin(skyTime * 8) * .032 : 0;
    }
    heroAnimator?.update(dt, {
      grounded: hero.grounded, moving: hero.moving,
      speed, glide,
    });
  }
}
function fallRecovery() {
  health = Math.max(0, health - 1);
  soundCue('fall');
  if (health <= 0) return endGame(false);
  const floor = floorAt(checkpoint.x, checkpoint.y)?.height ?? .58;
  hero.x = checkpoint.x; hero.y = checkpoint.y; hero.h = floor;
  hero.vH = 0; hero.grounded = true;
  announce("Returning to the storm checkpoint");
}
// Reusable, short-lived effects — no persistent particle emitters or bloom
// pass are required for a usable impact response on mobile GPUs.
function addImpact(x, y, h, kind = "relic") {
  if (impacts.length >= 10) return;
  const ring = B.MeshBuilder.CreateTorus(`Impact ${kind}`, { diameter: kind === "land" ? .8 : .48,
    thickness: .035, tessellation: 12 }, scene);
  ring.material = kind === "enemy" ? enemyShotMaterial : projectileMaterial;
  ring.position = pos(x, y, h);
  ring.rotation.x = Math.PI / 2;
  impacts.push({ mesh: ring, life: REDUCED_MOTION ? .14 : .33, maxLife: REDUCED_MOTION ? .14 : .33 });
}
function updateImpacts(dt) {
  for (let i = impacts.length - 1; i >= 0; i--) {
    const fx = impacts[i]; fx.life -= dt;
    fx.mesh.scaling.setAll(1 + (1 - fx.life / fx.maxLife) * (REDUCED_MOTION ? .15 : 1.2));
    if (fx.life <= 0) { fx.mesh.dispose(); impacts.splice(i, 1); }
  }
}
function pulseDamage(text) {
  if (hitCooldown > 0 || currentMode !== "playing") return;
  health = Math.max(0, health - 1);
  hitCooldown = PLAYER_INVULNERABILITY + tuning.hitGraceBonus;
  flashUntil = performance.now() + 170;
  ui.damageFlash.classList.add("active");
  heroAnimator?.trigger("Hit", .46);
  soundCue('damage');
  announce(text, 1.5);
  if (health <= 0) endGame(false);
}
function fire() {
  if (launchCooldown > 0 || currentMode !== "playing") return;
  launchCooldown = .46;
  cooldownUntil = performance.now() + 460;
  ui.blastBtn.classList.add("cooldown");
  heroAnimator?.trigger("Blast", .38);
  emitCampaignVisual('blast');
  soundCue('blast');
  const from = { x: hero.x, y: hero.y, h: hero.h + 1.3 };
  const target = selectAimTarget(hero, hero.facing,
    guardian?.active ? [...enemies, guardianTarget] : enemies, 11.5);
  const to = target ? { x: target.x, y: target.y, h: target.h - .1 }
    : { x: hero.x + Math.sin(hero.facing) * 8, y: hero.y + Math.cos(hero.facing) * 8, h: from.h };
  const direction = vectorToTarget(from, to, 21);
  const ball = B.MeshBuilder.CreateSphere("Relic pulse", { diameter: .32, segments: 8 }, scene);
  ball.material = projectileMaterial;
  ball.position = pos(from.x, from.y, from.h);
  bolts.push({ mesh: ball, ...from, ...direction, life: .85 });
}
function updateProjectiles(dt) {
  if (ui.blastBtn.classList.contains("cooldown") && performance.now() > cooldownUntil) {
    ui.blastBtn.classList.remove("cooldown");
  }
  for (let i = bolts.length - 1; i >= 0; i--) {
    const b = bolts[i];
    b.life -= dt;
    b.x += b.vx * dt; b.y += b.vy * dt; b.h += b.vh * dt;
    b.mesh.position = pos(b.x, b.y, b.h);
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      if (projectileHits(b, { x: enemy.x, y: enemy.y, h: enemy.h - .1 }, 1.15, 1.25)) {
        enemy.hp = Math.max(0, enemy.hp - 1);
        enemy.hpFill.scaling.x = enemy.hp / (enemy.maxHp ?? DRONE_HP);
        addImpact(b.x, b.y, b.h, "relic");
        b.life = 0;
        if (enemy.hp <= 0) {
          enemy.alive = false; enemy.root.setEnabled(false);
          score += 90; announce("Sky drone disabled · +90"); soundCue('drone-down');
          saveProgress();
        } else {
          soundCue('hit');
          if (performance.now() - lastCombatToastAt > 1300) {
            announce(`Drone armour ${enemy.hp} / ${enemy.maxHp ?? DRONE_HP}`, 1.2);
            lastCombatToastAt = performance.now();
          }
        }
        break;
      }
    }
    if (b.life > 0 && guardian?.active && guardianArt &&
      projectileHits(b,guardian,1.57,1.85)) {
      b.life=0;
      const result=damageGuardian(guardian,1);
      if (result.hit) {
        addImpact(b.x,b.y,b.h,"enemy");
        guardianArt.hitFlash=.19;
        emitCampaignVisual('guardian-hit');
        soundCue('hit');
        guardianArt.crystal.emissiveColor=B.Color3.FromHexString("#ffdfff");
        guardianUi();
        if (result.defeated) guardianDefeated();
        else if (result.phaseChanged) {
          announce(`${guardianTitle(guardian.phase)} — the guardian grows stronger!`,2.8);
          soundCue('boss-phase');
        } else if (performance.now()-lastCombatToastAt>750) {
          announce(`Thunder Golem · ${guardian.hp}/${GUARDIAN_MAX_HP} guard`,1.0);
          lastCombatToastAt=performance.now();
        }
      }
    }
    if (b.life <= 0) { b.mesh.dispose(); bolts.splice(i, 1); }
  }
}
function launchEnemyShot(enemy) {
  soundCue('enemy-shot');
  const from = { x: enemy.x, y: enemy.y, h: enemy.h };
  const target = { x: hero.x, y: hero.y, h: hero.h + .85 };
  const direction = vectorToTarget(from, target, tuning.droneProjectileSpeed);
  const orb = B.MeshBuilder.CreateSphere("Guardian energy pulse", { diameter: .37, segments: 8 }, scene);
  orb.material = enemyShotMaterial;
  orb.position = pos(from.x, from.y, from.h);
  enemyShots.push({ mesh: orb, ...from, ...direction, life: 2.8, droneShot: true });
  enemy.root.scaling.setAll(1);
}
function updateEnemyShots(dt) {
  for (let i = enemyShots.length - 1; i >= 0; i--) {
    const b = enemyShots[i];
    b.life -= dt;
    b.x += b.vx * dt; b.y += b.vy * dt; b.h += b.vh * dt;
    b.mesh.position = pos(b.x, b.y, b.h);
    if (hitCooldown <= 0 && projectileHits(b, { x: hero.x, y: hero.y, h: hero.h + .95 }, .8, .90)) {
      addImpact(b.x,b.y,b.h,"enemy");
      pulseDamage("Storm spell! Keep moving to evade lightning.");
      b.life = 0;
    }
    if (b.life <= 0) { b.mesh.dispose(); enemyShots.splice(i, 1); }
  }
}
function updateEnemies(dt) {
  let charging = enemies.filter(e => e.alive && e.windup > 0).length;
  let flying = enemyShots.filter(shot => shot.droneShot && shot.life > 0).length;
  for (const enemy of enemies) {
    if (!enemy.alive) continue;
    const patrol = droneOffset(enemy.role, skyTime, enemy.phase, REDUCED_MOTION);
    enemy.x = enemy.home.x + patrol.x;
    enemy.y = enemy.home.y + patrol.y;
    enemy.h = enemy.home.h + patrol.h;
    enemy.root.position = pos(enemy.x, enemy.y, enemy.h);
    enemy.root.rotation.y += dt * 1.2;
    enemy.cooldown -= dt;
    if (enemy.windup > 0) {
      enemy.windup -= dt;
      enemy.hpFill.material.emissiveColor = B.Color3.FromHexString("#d361e6");
      if (enemy.windup <= 0) {
        enemy.hpFill.material.emissiveColor = B.Color3.FromHexString("#3f6fff");
        launchEnemyShot(enemy);
        charging = Math.max(0, charging - 1);
        flying += 1;
        enemy.cooldown = enemyCooldown(enemy.role) * tuning.droneCooldownScale;
      }
    } else if (needsDroneWarning(enemy, hero, skyTime) &&
      canChargeDrone(tuning, { charging, flying, playerGrace: hitCooldown > 0,
        bossActive: Boolean(guardian?.active) })) {
      enemy.windup = droneWarningTime(tuning, enemy.role);
      charging += 1;
      if (performance.now() - lastCombatToastAt > 3200) {
        announce("Storm drone charging an attack — keep moving!", 2.0);
        lastCombatToastAt = performance.now();
      }
    }
    if (hitCooldown <= 0 && distance2(hero, enemy) < 1.55 && Math.abs(hero.h + 1 - enemy.h) < 2) {
      pulseDamage("Guardian contact — keep your distance");
    }
  }
}
function updatePortal() {
  if (!portalNode) return;
  portalNode.rotation.y += REDUCED_MOTION ? 0 : .003;
  if (distance2(hero, goal) < 2.2 && Math.abs(hero.h - (floorAt(goal.x,goal.y)?.height ?? 3.8)) < 1.5) {
    if (portalAvailable(relicSet.size,relics.length,guardian)) endGame(true);
    else if (performance.now()-lastHudTime>4000) {
      announce(guardian?.active ? "Defeat the Thunder Golem to unlock the portal" : "The Solar Gateway requires all five storm relics",2.0);
      lastHudTime=performance.now();
    }
  }
}
function updateCamera(dt) {
  const dist = MOBILE ? 8.1 : 9.6;
  const desired = pos(hero.x - Math.sin(cameraYaw) * dist, hero.y - Math.cos(cameraYaw) * dist, hero.h + (MOBILE ? 5.1 : 5.75));
  // Camera behind the hero: invert original horizontal Y; lerp in engine space.
  const alpha = clamp(dt * 5.2, .018, 1);
  camera.position = B.Vector3.Lerp(camera.position, desired, alpha);
  camera.setTarget(pos(hero.x + Math.sin(cameraYaw) * .9, hero.y + Math.cos(cameraYaw) * .9, hero.h + 1.6));
}
function update(dt) {
  skyTime += dt;
  tickCampaignVisuals(dt);
  safelyUpdateVisuals("ambient effects", polish => polish.updateAmbient(dt, skyTime));
  launchCooldown = Math.max(0, launchCooldown - dt);
  hitCooldown = Math.max(0, hitCooldown - dt);
  if (buttons.blastQueued) fire();
  buttons.blastQueued = false;
  move(dt);
  if (currentMode !== "playing") return;
  updateProjectiles(dt);
  updateEnemies(dt);
  updateEnemyShots(dt);
  updateStormHazards(dt);
  updateGuardian(dt);
  updateImpacts(dt);
  for (const r of relicObjects) {
    if (relicSet.has(r.id)) continue;
    r.marker.rotation.y += dt * (REDUCED_MOTION ? .24 : 1.2);
    r.marker.position.y = r.initialY + (REDUCED_MOTION ? 0 : Math.sin(skyTime * 2 + r.phase) * .17);
  }
  collectRelics();
  checkpointUpdate();
  updatePortal();
  uiUpdate();
  saveClock += dt;
  if (saveClock >= CAMPAIGN_SAVE_INTERVAL_SECONDS) {
    saveClock = 0;
    saveProgress();
  }
}
function installInputs() {
  const valid = new Set(["w","a","s","d","arrowup","arrowleft","arrowdown","arrowright","shift"," ","e","p","escape"]);
  window.addEventListener("keydown", event => {
    if (event.target?.matches("input,textarea,select")) return;
    const key = event.key.toLowerCase();
    if (valid.has(key) && currentMode === "playing") event.preventDefault();
    keyboard.add(key);
    if (currentMode === "playing" && key === " " && !event.repeat) buttons.jumpQueued = true;
    if (currentMode === "playing" && key === "e") buttons.blastQueued = true;
    if (key === "p" || key === "escape") currentMode === "playing" ? pause() : currentMode === "paused" ? resume() : null;
  });
  window.addEventListener("keyup", event => keyboard.delete(event.key.toLowerCase()));
  // Screenshot tools (e.g. Windows Snipping Tool) temporarily remove window
  // focus. Release held inputs to prevent drift, but do not interrupt gameplay.
  // Genuine backgrounding is still paused by visibilitychange below.
  window.addEventListener("blur", () => {
    keyboard.clear();
    joystick.x = joystick.y = 0;
    joystick.activePointer = null;
    buttons.glide = false;
    buttons.jumpQueued = false;
    jumpAssist.reset();
    buttons.blastQueued = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && currentMode === "playing") pause();
    campaignAudio.setState({ visible: !document.hidden });
  });
  window.addEventListener("pagehide", saveProgress);
  window.addEventListener("pagehide", () => { campaignAudio.dispose(); campaignPresentation.dispose(); campaignPlatform.dispose(); disconnectPlatformStatus(); runtimeControls.dispose(); });
  ui.pauseBtn.addEventListener("click", () => pause());
  ui.controlsBtn.addEventListener("click", () => {
    touchControlsOverride = !touchControlsRequested();
    syncTouchControls();
    orientHint();
  });
  // A real touch gesture immediately enables the controls even if this
  // browser reported a fine pointer or hover support during initial load.
  document.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch" && !touchSeen) {
      touchSeen = true;
      if (touchControlsOverride === null) {
        syncTouchControls();
        orientHint();
      }
    }
  }, { capture: true, passive: true });
  document.addEventListener("touchstart", () => {
    if (!touchSeen) {
      touchSeen = true;
      if (touchControlsOverride === null) {
        syncTouchControls();
        orientHint();
      }
    }
  }, { passive: true });
  ui.primaryBtn.disabled = true;
  ui.primaryBtn.addEventListener("click", () => {
    if (ui.primaryBtn.dataset.retry === "true") return location.reload();
    if (!initialized) return;
    if (currentMode === "paused") resume();
    else if (currentMode === "menu") {
      if (savedSnapshot) {
        restoreProgress(savedSnapshot);
        savedSnapshot = null;
      }
      resume();
      saveProgress();
    } else if (currentMode === "lost") {
      const previous = progressStore.load();
      if (previous) {
        restoreProgress(previous, true);
        resume();
      } else resetGame(true);
      saveProgress();
    } else if (currentMode === "won") { resetGame(true); saveProgress(); }
  });
  ui.newRunBtn.addEventListener("click", () => {
    const discard = window.confirm("Start a new run in this world? This will replace the saved checkpoint and collected relics for this world only.");
    if (!discard) return;
    progressStore.clear();
    savedSnapshot = null;
    ui.newRunBtn.hidden = true;
    resetGame(true);
    saveProgress();
  });
  if (CAMPAIGN_WORLD === "garden" && ui.continueCampaignBtn) {
    ui.continueCampaignBtn.addEventListener("click", () => {
      const target = ui.continueCampaignBtn.dataset.world;
      if (CAMPAIGN_WORLD_PATHS[target]) location.href = CAMPAIGN_WORLD_PATHS[target];
    });
  }
  ui.nextWorldBtn.addEventListener("click", () => {
    if (currentMode === "won") location.href = "../solar/";
  });
  // Audio toggle and sliders are bound once by the shared presentation module.
  ui.jumpBtn.addEventListener("pointerdown", e => { e.preventDefault(); buttons.jumpQueued = true; });
  ui.blastBtn.addEventListener("pointerdown", e => { e.preventDefault(); buttons.blastQueued = true; });
  const releaseGlide = () => { buttons.glide = false; ui.glideBtn.classList.remove("active"); };
  ui.glideBtn.addEventListener("pointerdown", e => { e.preventDefault(); buttons.glide = true; ui.glideBtn.classList.add("active"); try { ui.glideBtn.setPointerCapture(e.pointerId); } catch {} });
  ["pointerup","pointercancel","lostpointercapture"].forEach(name => ui.glideBtn.addEventListener(name, releaseGlide));
  const pad = ui.joystickPad;
  function movePad(e) {
    const rect = pad.getBoundingClientRect();
    const radius = rect.width * .33;
    const x = e.clientX - (rect.left + rect.width * .5), y = e.clientY - (rect.top + rect.height * .5);
    const len = Math.hypot(x, y) || 1, factor = Math.min(1, radius / len);
    joystick.x = (x * factor) / radius;
    joystick.y = -(y * factor) / radius;
    ui.joystickThumb.style.transform = `translate(calc(-50% + ${joystick.x * radius}px),calc(-50% + ${-joystick.y * radius}px))`;
  }
  function releasePad() {
    joystick.activePointer = null; joystick.x = joystick.y = 0;
    ui.joystickThumb.style.transform = "translate(-50%,-50%)";
  }
  pad.addEventListener("pointerdown", e => { e.preventDefault(); joystick.activePointer = e.pointerId; try { pad.setPointerCapture(e.pointerId); } catch {} movePad(e); });
  pad.addEventListener("pointermove", e => { if (e.pointerId === joystick.activePointer) movePad(e); });
  ["pointerup","pointercancel","lostpointercapture"].forEach(name => pad.addEventListener(name, releasePad));
  // Camera drag is restricted to the canvas, so touching movement or action
  // buttons can never accidentally spin the view.
  ui.gameCanvas.addEventListener("pointerdown", e => { if (currentMode !== "playing") return; pointerLook = { id: e.pointerId, x: e.clientX }; try { ui.gameCanvas.setPointerCapture(e.pointerId); } catch {} });
  ui.gameCanvas.addEventListener("pointermove", e => {
    if (!pointerLook || pointerLook.id !== e.pointerId || currentMode !== "playing") return;
    const dx = e.clientX - pointerLook.x;
    cameraYaw = (cameraYaw + dx * (MOBILE ? .006 : .004)) % (Math.PI * 2);
    pointerLook.x = e.clientX;
  });
  const releaseLook = e => { if (pointerLook?.id === e.pointerId) pointerLook = null; };
  ["pointerup","pointercancel","lostpointercapture"].forEach(name => ui.gameCanvas.addEventListener(name, releaseLook));
  ui.gameCanvas.addEventListener("contextmenu", e => e.preventDefault());
}
installInputs();
loadGame();
