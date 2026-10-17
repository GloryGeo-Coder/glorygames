/**
 * Sky Temple — four-world visual fidelity layer.
 *
 * No collision, damage, score, checkpoint or persistence logic lives here.
 * Babylon meshes are display-only (not pickable, no collisions) and use
 * shared materials. On low-frame-rate mobiles ambient ornaments are hidden.
 * Renderers or scenes without the required APIs may skip this layer entirely.
 */

export const CAMPAIGN_FX_PALETTES = Object.freeze({
  garden: Object.freeze({ base: '#284965', glow: '#72e9ff', deep: '#226b9b', rune: '#ffe49b', accent: '#61d7cc', tempo: 0.95 }),
  crystal: Object.freeze({ base: '#483c73', glow: '#ca95ff', deep: '#8753db', rune: '#8ff4ff', accent: '#b4a8ff', tempo: 0.78 }),
  storm: Object.freeze({ base: '#292b68', glow: '#a68aff', deep: '#753bdf', rune: '#8edcff', accent: '#da93ff', tempo: 1.35 }),
  solar: Object.freeze({ base: '#6d5134', glow: '#ffe09a', deep: '#ef9750', rune: '#9cfcff', accent: '#ffc878', tempo: 0.68 }),
});

export const FX_BUDGETS = Object.freeze({
  mobile: Object.freeze({ motes: 8, beacons: 4, bossShards: 4, portalRings: 1 }),
  desktop: Object.freeze({ motes: 18, beacons: 7, bossShards: 6, portalRings: 2 }),
});

export function fxBudget({ mobile = true, reducedMotion = false, world = 'garden' } = {}) {
  const base = FX_BUDGETS[mobile ? 'mobile' : 'desktop'];
  // Crystal Caverns already has its original mote, crystal and Warden effects.
  // Avoid doubling its procedural scene complexity or overdrawing the screen.
  return {
    motes: world === 'crystal' ? Math.max(3, Math.floor(base.motes * .4)) : base.motes,
    beacons: world === 'crystal' ? 2 : base.beacons,
    bossShards: world === 'crystal' ? 2 : base.bossShards,
    portalRings: world === 'crystal' ? 1 : base.portalRings,
    animateMotes: !reducedMotion,
  };
}

const clamp = (value, low, high) => Math.max(low, Math.min(high, Number.isFinite(value) ? value : low));
const ramp = (value, low, high) => clamp((value - low) / (high - low), 0, 1);

/** Testable pose cues: this *supplements* existing boss arm/mesh animations. */
export function guardianVisualCue({ time = 0, mode = 'idle', attack = '', phase = 1,
  reducedMotion = false, hit = false, world = 'garden' } = {}) {
  const cfg = CAMPAIGN_FX_PALETTES[world] || CAMPAIGN_FX_PALETTES.garden;
  const stage = clamp(phase, 1, 3);
  const charging = mode === 'windup';
  const recovering = mode === 'recovery';
  const speed = cfg.tempo * (.6 + stage * .25);
  const breath = reducedMotion ? 0 : .5 + .5 * Math.sin(time * speed * 3.1);
  let castForm = 'arc';
  if (/wave|shock|resonance/i.test(attack)) castForm = 'wave';
  else if (/sigil|ground|prism|mark/i.test(attack)) castForm = 'sigil';
  return {
    visible: mode !== 'defeated',
    charging,
    castForm,
    coreScale: charging ? 1.18 + (reducedMotion ? 0 : breath * .08) : recovering ? .92 : 1 + breath * .035,
    runeScale: charging ? (castForm === 'wave' ? 1.45 : 1.13) : 1,
    crownSpeed: reducedMotion ? 0 : charging ? .85 * speed : .23 * speed,
    shardRadius: charging ? 2.18 : 1.72,
    haloAlpha: clamp(.31 + stage * .1 + (charging ? .32 : 0) + (hit ? .25 : 0) + breath * .13, .25, 1),
    waveOpacity: charging && castForm === 'wave' ? .8 : .0,
    sigilOpacity: charging && castForm === 'sigil' ? .75 : .0,
  };
}

export function portalPulse({ time = 0, ready = false, reducedMotion = false, world = 'garden' } = {}) {
  const tempo = (CAMPAIGN_FX_PALETTES[world] || CAMPAIGN_FX_PALETTES.garden).tempo;
  const variation = reducedMotion ? 0 : Math.sin(time * tempo * 1.55) * .065;
  return clamp((ready ? .87 : .33) + variation, .18, 1);
}

/** Drop-in visual layer. Babylon is supplied by the game runtime. */
export function createCampaignVisuals(B, scene, {
  world = 'garden', islands = [], guardianArt = null, portalNode = null,
  heroRoot = null, mobile = true, reducedMotion = false,
} = {}) {
  const cfg = CAMPAIGN_FX_PALETTES[world];
  if (!cfg) throw new Error(`Unknown Sky Temple world: ${world}`);
  if (!scene || !B?.MeshBuilder?.CreatePolyhedron || !B?.StandardMaterial || !B?.Color3?.FromHexString) {
    throw new Error('The 3D engine does not support optional campaign visuals');
  }
  const budget = fxBudget({ mobile, reducedMotion, world });
  const owned = [], ownedMaterials = [], motes = [], beacons = [], bossShards = [], gateRings = [];
  const mat = (name, diffuse, emissive, alpha = 1) => {
    const m = new B.StandardMaterial(`Sky Temple ${world} ${name}`, scene);
    m.diffuseColor = B.Color3.FromHexString(diffuse);
    m.emissiveColor = B.Color3.FromHexString(emissive);
    m.alpha = alpha;
    m.backFaceCulling = false;
    m.disableLighting = true; // predictable magic colours without extra lights
    ownedMaterials.push(m);
    return m;
  };
  const gold = mat('beacon stone-gold', cfg.base, cfg.deep);
  const gem = mat('beacon luminous crystal', cfg.rune, cfg.deep);
  const dust = mat('ambient motes', cfg.accent, cfg.deep, .82);
  const portalGlow = mat('portal energy corona', cfg.glow, cfg.deep, .65);
  const bossGlow = mat('guardian phase aura', cfg.glow, cfg.deep, .74);
  const impactGlow = mat('relic blast ring', cfg.rune, cfg.deep, .75);
  // Cache palette values; no per-frame Color3 allocations in the visual tick.
  const glowRGB = B.Color3.FromHexString(cfg.glow);
  let disposed = false, playTime = 0, blastLife = 0, impactLife = 0;
  let effectsEnabled = true, slowCount = 0, fastCount = 0;

  const register = (mesh, m) => {
    if (!mesh) return null;
    mesh.material = m;
    mesh.isPickable = false;
    mesh.checkCollisions = false;
    owned.push(mesh);
    return mesh;
  };
  function poly(name, size, m) {
    return register(B.MeshBuilder.CreatePolyhedron(name, { type: 1, size }, scene), m);
  }
  function torus(name, diameter, thickness, m, tessellation = 24) {
    return register(B.MeshBuilder.CreateTorus(name, { diameter, thickness, tessellation }, scene), m);
  }
  function cylinder(name, diameter, height, m) {
    return register(B.MeshBuilder.CreateCylinder(name, { diameter, height, tessellation: 8 }, scene), m);
  }

  // Deterministic light-pedestals at the perimeter of pre-existing platforms.
  // They don't alter walkable surface geometry or any collision calculation.
  for (let i = 0; i < budget.beacons && islands.length; i++) {
    const island = islands[(i * 3) % islands.length];
    const angle = i * 2.39996 + .4;
    const radius = Math.min(island.r * .67, 3.4);
    const x = island.x + Math.cos(angle) * radius;
    const z = -(island.y + Math.sin(angle) * radius);
    const base = cylinder(`SkyTemple VFX ${world} beacon ${i}`, .42, .4, gold);
    const crystal = poly(`SkyTemple VFX ${world} beacon jewel ${i}`, .52, gem);
    if (base) base.position.set(x, island.h + .24, z);
    if (crystal) crystal.position.set(x, island.h + .75, z);
    beacons.push({ base, crystal, baseY: island.h + .75, phase: i * 1.4 });
  }

  // Tiny reusable mesh-based motes: no per-frame allocations or GPU particle systems.
  for (let i = 0; i < budget.motes && islands.length; i++) {
    const island = islands[i % islands.length];
    const angle = i * 2.414;
    const r = Math.min(1.8 + (i % 4) * .57, island.r * .65);
    const sparkle = poly(`SkyTemple VFX ${world} mote ${i}`, .08 + (i % 3) * .025, dust);
    if (!sparkle) continue;
    const baseY = island.h + 1.5 + (i % 5) * .5;
    sparkle.position.set(island.x + Math.cos(angle) * r, baseY, -(island.y + Math.sin(angle) * r));
    motes.push({ mesh: sparkle, baseY, phase: i * 1.618 });
  }

  if (portalNode) {
    for (let i = 0; i < budget.portalRings; i++) {
      const ring = torus(`SkyTemple VFX ${world} gate corona ${i}`, 3.55 + i * .42, .043, portalGlow, 34);
      if (!ring) continue;
      ring.parent = portalNode;
      ring.position.z = -.22 - i * .12;
      ring.rotation.x = Math.PI / 2;
      gateRings.push(ring);
    }
  }

  let bossChestRing = null, bossFloorRune = null, bossCastRing = null;
  if (guardianArt?.root) {
    bossChestRing = torus(`SkyTemple VFX ${world} guardian power core`, 1.65, .05, bossGlow, 28);
    if (bossChestRing) {
      bossChestRing.parent = guardianArt.root;
      bossChestRing.position.set(0, 2.42, 1.15);
      bossChestRing.rotation.x = Math.PI / 2;
    }
    bossFloorRune = torus(`SkyTemple VFX ${world} guardian arena rune`, 4.3, .075, bossGlow, 36);
    if (bossFloorRune) {
      bossFloorRune.parent = guardianArt.root;
      bossFloorRune.position.set(0, .16, 0);
    }
    bossCastRing = torus(`SkyTemple VFX ${world} guardian cast halo`, 2.2, .055, bossGlow, 26);
    if (bossCastRing) {
      bossCastRing.parent = guardianArt.root;
      bossCastRing.position.set(0, 3.5, .4);
      bossCastRing.rotation.x = Math.PI / 2;
      bossCastRing.setEnabled(false);
    }
    for (let i = 0; i < budget.bossShards; i++) {
      const shard = poly(`SkyTemple VFX ${world} guardian orbit ${i}`, i % 2 ? .29 : .39, i % 2 ? gem : bossGlow);
      if (!shard) continue;
      shard.parent = guardianArt.root;
      shard.position.set(0, 3.7, 0);
      bossShards.push(shard);
    }
  }

  let heroRing = null;
  if (heroRoot) {
    heroRing = torus(`SkyTemple VFX ${world} hero relic flash`, 1.35, .065, impactGlow, 24);
    if (heroRing) {
      heroRing.parent = heroRoot;
      heroRing.position.set(0, 1.12, 0);
      heroRing.rotation.x = Math.PI / 2;
      heroRing.setEnabled(false);
    }
  }

  function setAmbientEnabled(enabled) {
    for (const m of motes) m.mesh.setEnabled(enabled);
    // The beacons remain visible; don't cause gameplay guidance to disappear.
    effectsEnabled = enabled;
  }

  function adaptiveBudget(fps) {
    if (!mobile || !Number.isFinite(fps) || fps <= 0) return;
    // Evaluated only ~once per second by the integrator so it can't thrash.
    if (fps < 28) { slowCount++; fastCount = 0; }
    else if (fps > 49) { fastCount++; slowCount = 0; }
    else { slowCount = 0; fastCount = 0; }
    if (slowCount >= 3 && effectsEnabled) { setAmbientEnabled(false); slowCount = 0; }
    if (fastCount >= 8 && !effectsEnabled) { setAmbientEnabled(true); fastCount = 0; }
  }

  function emit(event) {
    if (disposed) return;
    if (event === 'blast') blastLife = .32;
    if (event === 'guardian-hit') impactLife = .24;
  }

  function reset() {
    blastLife = impactLife = 0;
    heroRing?.setEnabled(false);
    bossCastRing?.setEnabled(false);
  }

  function step(dt, time, { guardian = null, portalReady = false, fps = 60 } = {}) {
    if (disposed) return;
    dt = clamp(dt, 0, .08);
    playTime = Number.isFinite(time) ? time : playTime + dt;
    const p = portalPulse({ time: playTime, ready: portalReady, reducedMotion, world });
    // Reuse colours instead of creating a Color3 for every frame.
    const setEmission = (m, multiplier) => {
      m.emissiveColor.r = glowRGB.r * multiplier;
      m.emissiveColor.g = glowRGB.g * multiplier;
      m.emissiveColor.b = glowRGB.b * multiplier;
    };
    setEmission(portalGlow, p * .52);
    if (!reducedMotion) {
      for (let i = 0; i < gateRings.length; i++) gateRings[i].rotation.z += dt * cfg.tempo * (i ? -.16 : .19);
      if (effectsEnabled) for (const mote of motes) {
        mote.mesh.position.y = mote.baseY + Math.sin(playTime * cfg.tempo + mote.phase) * .15;
      }
      beacons.forEach(b => { if (b.crystal) b.crystal.position.y = b.baseY + Math.sin(playTime * .8 + b.phase) * .07; });
    }
    if (heroRing) {
      blastLife = Math.max(0, blastLife - dt);
      heroRing.setEnabled(blastLife > 0);
      if (blastLife > 0) heroRing.scaling.setAll(1 + (1 - blastLife / .32) * .95);
    }
    if (guardianArt?.root && guardian) {
      const cue = guardianVisualCue({
        time: playTime, mode: guardian.mode, attack: guardian.pendingAttack,
        phase: guardian.phase, reducedMotion, hit: impactLife > 0, world,
      });
      const alive = Boolean(guardian.active && !guardian.defeated);
      if (bossCastRing) bossCastRing.setEnabled(alive && cue.charging);
      if (bossChestRing) {
        bossChestRing.setEnabled(alive);
        bossChestRing.scaling.setAll(cue.coreScale);
        if (!reducedMotion) bossChestRing.rotation.z += dt * cue.crownSpeed;
      }
      if (bossFloorRune) {
        bossFloorRune.setEnabled(alive);
        bossFloorRune.scaling.setAll(cue.runeScale);
      }
      for (let i = 0; i < bossShards.length; i++) {
        const shard = bossShards[i];
        shard.setEnabled(alive);
        if (!alive) continue;
        const a = i * Math.PI * 2 / bossShards.length + (reducedMotion ? 0 : playTime * .42 * cfg.tempo);
        shard.position.set(Math.cos(a) * cue.shardRadius, 3.9 + (reducedMotion ? 0 : Math.sin(a * 2) * .13), Math.sin(a) * cue.shardRadius);
        if (!reducedMotion) shard.rotation.y += dt * .3;
      }
      if (bossCastRing && cue.charging && !reducedMotion) bossCastRing.rotation.z += dt * cue.crownSpeed * -1.4;
      setEmission(bossGlow, alive ? cue.haloAlpha * .6 : .05);
      impactLife = Math.max(0, impactLife - dt);
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    for (const mesh of owned.reverse()) { try { mesh.dispose(); } catch {} }
    for (const m of ownedMaterials) { try { m.dispose(); } catch {} }
    owned.length = 0;
    ownedMaterials.length = 0;
  }
  return { world, budget, emit, reset, step, adaptiveBudget, dispose, get disposed() { return disposed; },
    get meshCount() { return owned.length; } };
}
