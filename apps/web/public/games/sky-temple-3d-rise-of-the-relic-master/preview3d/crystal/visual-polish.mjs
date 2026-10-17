/**
 * Sky Temple 3D — Crystal Caverns visual polish (incremental).
 *
 * No new GLBs and no gameplay/collision modifications. All Babylon geometry
 * is deliberately low-poly, created once, and reused across frames.
 */

export const CRYSTAL_VFX_BUDGET = Object.freeze({
  mobile: Object.freeze({ ambientMotes: 12, islandCrystals: 8, guardianShards: 6 }),
  desktop: Object.freeze({ ambientMotes: 22, islandCrystals: 12, guardianShards: 8 }),
});

const between = (value, min, max) => Math.max(min, Math.min(max, value));
const blend = (a, b, t) => a + (b - a) * t;

/**
 * The Guardian's attack animation is deterministic and independent of the
 * scene renderer, making phase changes testable and repeatable on mobile.
 */
export function wardenVisualPose({ time = 0, mode = "idle", attack = null, phase = 1,
  hitFlash = 0, reducedMotion = false } = {}) {
  const t = Number.isFinite(time) ? time : 0;
  const level = between(Number.isFinite(phase) ? phase : 1, 1, 3);
  const windup = mode === "windup";
  const recovery = mode === "recovery";
  let leftZ = -.16, rightZ = .16, armX = 0;
  if (windup) {
    if (attack === "sigil") { leftZ = -1.15; rightZ = 1.15; armX = .32; }
    else if (attack === "wave") { leftZ = -.86; rightZ = .86; armX = -.48; }
    else { leftZ = -.42; rightZ = .42; armX = -.72; }
  } else if (recovery) {
    leftZ = -.32; rightZ = .32; armX = .18;
  } else if (!reducedMotion) {
    leftZ -= Math.sin(t * 1.25) * .08;
    rightZ += Math.sin(t * 1.2) * .08;
  }
  const pulse = reducedMotion ? .5 : (.5 + .5 * Math.sin(t * (2.4 + level * .5)));
  return {
    leftZ, rightZ, armX,
    bob: reducedMotion ? 0 : Math.sin(t * 1.7) * .075,
    bodyTilt: reducedMotion ? 0 : Math.sin(t * .82) * .035,
    ringScale: (windup ? 1.18 : 1) + (reducedMotion ? 0 : pulse * .06),
    ringSpeed: reducedMotion ? 0 : (windup ? .72 : .19) * (1 + level * .18),
    shardRadius: windup ? 2.32 : 1.95,
    shardHeight: windup ? 3.9 : 3.52,
    glow: between(.32 + level * .1 + (windup ? .4 : 0) + (hitFlash > 0 ? .3 : 0) + pulse * .16, 0, 1.4),
  };
}

export function cavernGlowLevel({ time = 0, portalReady = false, reducedMotion = false } = {}) {
  const oscillation = reducedMotion ? 0 : Math.sin(time * .9) * .07;
  return between((portalReady ? .75 : .28) + oscillation, .18, .9);
}

function makeMaterial(B, scene, name, diffuseHex, emissionHex, alpha = 1) {
  const material = new B.StandardMaterial(name, scene);
  material.diffuseColor = B.Color3.FromHexString(diffuseHex);
  material.emissiveColor = B.Color3.FromHexString(emissionHex);
  material.alpha = alpha;
  material.backFaceCulling = false;
  return material;
}
function colorInto(color, target, weight) {
  color.r = target.r * weight;
  color.g = target.g * weight;
  color.b = target.b * weight;
}

/**
 * Integrates solely at the visual layer. Uses the existing Crystal Caverns
 * GLB, boss logic, joystick and platform collision definitions as-is.
 */
export function createCrystalVisualPolish(B, scene, {
  islands, guardianArt, portalNode, mobile = true, reducedMotion = false,
}) {
  const budget = CRYSTAL_VFX_BUDGET[mobile ? "mobile" : "desktop"];
  const lilac = makeMaterial(B, scene, "Caverns lilac ambient light", "#9885de", "#392064", .8);
  const cyan = makeMaterial(B, scene, "Caverns cyan reflected light", "#8ae8e9", "#174c6b", .83);
  const dustMat = makeMaterial(B, scene, "Caverns airborne luminescence", "#beaaff", "#4c3789", .64);
  const gateMat = makeMaterial(B, scene, "Caverns gateway corona", "#cdbbff", "#4b367a", .62);
  const bossMat = makeMaterial(B, scene, "Warden prismatic aura", "#d7b1ff", "#6943ad", .75);
  const motes = [], crystals = [], orbit = [], gateRings = [];
  let ready = false, totalTime = 0;

  // Low-poly static crystal accents on the edges of the existing islands.
  for (let i = 0; i < budget.islandCrystals; i++) {
    const island = islands[i % islands.length];
    const angle = i * 2.399963229728653 + (i % 3) * .33;
    const distance = island.r * (.60 + .05 * (i % 2));
    const mesh = B.MeshBuilder.CreatePolyhedron(`Cavern edge crystal ${i}`, {
      type: 1, size: .52 + (i % 3) * .12,
    }, scene);
    mesh.position.set(island.x + Math.cos(angle) * distance,
      island.h + .72 + (i % 2) * .2, -(island.y + Math.sin(angle) * distance));
    mesh.rotation.set(.24, angle, .27);
    mesh.material = i % 2 ? lilac : cyan;
    mesh.isPickable = false;
    crystals.push(mesh);
  }

  // Suspended crystal dust: no CPU-created particles every frame and no
  // GPU-heavy full-screen particles/post-processing on phones.
  for (let i = 0; i < budget.ambientMotes; i++) {
    const island = islands[i % islands.length];
    const a = i * 2.13;
    const radius = 1.9 + ((i * 13) % 11) * .28;
    const mesh = B.MeshBuilder.CreatePolyhedron(`Crystal light mote ${i}`, {
      type: 1, size: .075 + (i % 3) * .018,
    }, scene);
    const h = island.h + 2.0 + (i % 6) * .53;
    mesh.position.set(island.x + Math.cos(a) * radius, h,
      -(island.y + Math.sin(a) * radius));
    mesh.material = dustMat;
    mesh.isPickable = false;
    motes.push({ mesh, baseY: h, phase: i * 1.83 });
  }

  // Extra luminous outlines surround the *existing* portal; no objective
  // position or collision state is changed.
  for (let i = 0; i < 2; i++) {
    const ring = B.MeshBuilder.CreateTorus(`Crystal gate halo ${i}`, {
      diameter: 3.45 + .32 * i, thickness: .035, tessellation: 28,
    }, scene);
    ring.parent = portalNode;
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = .16 * (i ? -1 : 1);
    ring.position.z = -.15 - i * .13;
    ring.material = gateMat;
    ring.isPickable = false;
    gateRings.push(ring);
  }

  // Ornament the existing procedural combat rig, preserving its original
  // animated gauntlets and fully separate 15-HP encounter state.
  if (guardianArt?.root) {
    for (let i = 0; i < budget.guardianShards; i++) {
      const shard = B.MeshBuilder.CreatePolyhedron(`Crystal Warden orbit shard ${i}`, {
        type: 1, size: i % 2 ? .27 : .37,
      }, scene);
      shard.parent = guardianArt.root;
      shard.position.set(0, 3.6, 0);
      shard.material = i % 2 ? cyan : bossMat;
      shard.isPickable = false;
      orbit.push(shard);
    }
    const corona = B.MeshBuilder.CreateTorus("Crystal Warden crown corona", {
      diameter: 2.15, thickness: .055, tessellation: 28,
    }, scene);
    corona.parent = guardianArt.root;
    corona.position.set(0, 4.15, .05);
    corona.rotation.x = Math.PI / 2;
    corona.material = bossMat;
    corona.isPickable = false;
    guardianArt.crownCorona = corona;
  }

  // Desktop-only optional glow. Phone assets always use the cheaper emissive
  // materials and atmospheric geometry above.
  let glowLayer = null;
  if (!mobile && B.GlowLayer) {
    try {
      glowLayer = new B.GlowLayer("Caverns gentle bloom", scene, {
        mainTextureRatio: .2, blurKernelSize: 16,
      });
      glowLayer.intensity = .24;
    } catch { glowLayer = null; }
  }

  const gateOn = B.Color3.FromHexString("#9b72eb");
  const wardenColor = B.Color3.FromHexString("#a77ce8");
  const defaultStone = B.Color3.FromHexString("#8e50e9");

  function setPortalReady(flag) { ready = Boolean(flag); }

  function updateAmbient(dt, time) {
    totalTime = time;
    const light = cavernGlowLevel({ time, portalReady: ready, reducedMotion });
    colorInto(gateMat.emissiveColor, gateOn, light);
    if (!reducedMotion) {
      for (let i = 0; i < motes.length; i++) {
        const mote = motes[i];
        mote.mesh.position.y = mote.baseY + Math.sin(time * .7 + mote.phase) * .22;
      }
      for (let i = 0; i < gateRings.length; i++) {
        gateRings[i].rotation.z += dt * (i ? -.11 : .13);
      }
      scene.fogDensity = .009 + Math.sin(time * .45) * .0007;
    }
    if (glowLayer) glowLayer.intensity = light * .28;
  }

  function updateWarden(dt, time, guardian, art) {
    if (!guardian || !art?.root || !guardian.active) return;
    const p = wardenVisualPose({
      time, mode: guardian.mode, attack: guardian.pendingAttack,
      phase: guardian.phase, hitFlash: art.hitFlash, reducedMotion,
    });
    art.root.position.y = art.ground + p.bob;
    art.root.attackArmLeft.rotation.z = p.leftZ;
    art.root.attackArmRight.rotation.z = p.rightZ;
    art.root.attackArmLeft.rotation.x = p.armX;
    art.root.attackArmRight.rotation.x = p.armX;
    art.halo.rotation.z += dt * p.ringSpeed;
    art.halo.scaling.setAll(p.ringScale);

    // Tiny independent movement of the ornate GLB creates breathing/leaning
    // without changing the boss mesh, hit position or joint animations.
    if (art.skinRoot) {
      art.skinRoot.rotation.x = p.bodyTilt;
    }
    if (art.crownCorona) {
      art.crownCorona.rotation.z += dt * p.ringSpeed * -.7;
      art.crownCorona.scaling.setAll(p.ringScale);
    }
    art.floatingShards.forEach((shard, i) => {
      const a = time * (reducedMotion ? 0 : .72) + i * Math.PI * .5;
      shard.position.set(Math.cos(a) * p.shardRadius,
        p.shardHeight + (reducedMotion ? 0 : Math.sin(time + i) * .18),
        Math.sin(a) * 1.65);
      if (!reducedMotion) shard.rotation.y += dt * .58;
    });
    orbit.forEach((shard, i) => {
      const a = (reducedMotion ? 0 : time * .49) + i * Math.PI * 2 / Math.max(1, orbit.length);
      shard.position.set(Math.cos(a) * 1.6, 4.05 + Math.sin(i + time * .7) * (reducedMotion ? 0 : .08), Math.sin(a) * 1.3);
      if (!reducedMotion) shard.rotation.y += dt * .35;
    });
    colorInto(bossMat.emissiveColor, wardenColor, p.glow);
    if (art.hitFlash > 0) art.hitFlash = Math.max(0, art.hitFlash - dt);
    const target = art.hitFlash > 0 ? gateOn : defaultStone;
    colorInto(art.crystal.emissiveColor, target, art.hitFlash > 0 ? 1.12 : p.glow);
  }

  function dispose() {
    for (const object of [...crystals, ...motes.map(item => item.mesh), ...orbit, ...gateRings]) {
      try { object.dispose(); } catch { /* Scene disposal also handles this. */ }
    }
    try { guardianArt?.crownCorona?.dispose(); } catch {}
    try { glowLayer?.dispose(); } catch {}
    for (const mat of [lilac, cyan, dustMat, gateMat, bossMat]) {
      try { mat.dispose(); } catch {}
    }
  }
  return { budget, setPortalReady, updateAmbient, updateWarden, dispose };
}
