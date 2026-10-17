/**
 * Sky Temple 3D — difficulty, platforming grace and objective guidance.
 * Pure data/functions shared by all four already-tested worlds.
 * Changes here intentionally never enter the v1 campaign-save schema.
 */
export const WORLD_BALANCE = Object.freeze({
  garden: Object.freeze({ label: "Sky Garden", droneCooldownScale: 1.18,
    warningBonus: .22, maxSimultaneousWindups: 1, maxFlyingDroneShots: 1,
    droneProjectileSpeed: 4.15, guardianClock: .89, hitGraceBonus: .20, checkpointHeal: 1 }),
  crystal: Object.freeze({ label: "Crystal Caverns", droneCooldownScale: 1.10,
    warningBonus: .16, maxSimultaneousWindups: 1, maxFlyingDroneShots: 1,
    droneProjectileSpeed: 4.35, guardianClock: .95, hitGraceBonus: .15, checkpointHeal: 1 }),
  storm: Object.freeze({ label: "Storm Citadel", droneCooldownScale: 1.04,
    warningBonus: .12, maxSimultaneousWindups: 2, maxFlyingDroneShots: 2,
    droneProjectileSpeed: 4.55, guardianClock: 1.0, hitGraceBonus: .10, checkpointHeal: 1 }),
  solar: Object.freeze({ label: "Solar Sanctuary", droneCooldownScale: 1.0,
    warningBonus: .10, maxSimultaneousWindups: 2, maxFlyingDroneShots: 2,
    droneProjectileSpeed: 4.6, guardianClock: 1.0, hitGraceBonus: .10, checkpointHeal: 1 }),
});

export function worldBalance(world) {
  const config = WORLD_BALANCE[world];
  if (!config) throw Error(`Unknown campaign world: ${String(world)}`);
  return config;
}

/** Dodge room is protected after taking a hit: prevent unavoidable chain hits. */
export function canChargeDrone(config, { charging = 0, flying = 0, playerGrace = false, bossActive = false } = {}) {
  return !playerGrace && !bossActive && charging < config.maxSimultaneousWindups &&
    flying < config.maxFlyingDroneShots;
}

export function droneWarningTime(config, role) {
  return (role === 'bulwark' ? .95 : .72) + config.warningBonus;
}

/**
 * Small timing allowance, not double jump. Jump height and speed are unchanged.
 * A pressed button just before landing remains buffered briefly; moving off
 * a ledge grants 100 ms of coyote time, only when descending.
 */
export function createJumpAssist({ buffer = .16, coyote = .10 } = {}) {
  let queued = 0, grace = 0;
  return {
    reset() { queued = grace = 0; },
    step({ dt, pressed = false, grounded = false, verticalVelocity = 0 } = {}) {
      const elapsed = Number.isFinite(dt) ? Math.max(0, Math.min(dt, .10)) : 0;
      if (pressed) queued = buffer;
      else queued = Math.max(0, queued - elapsed);
      if (grounded) grace = coyote;
      else grace = Math.max(0, grace - elapsed);
      // Positive vertical speed means this is the same jump, not a new one.
      if (queued > 0 && (grounded || (grace > 0 && verticalVelocity <= 0))) {
        queued = grace = 0;
        return true;
      }
      return false;
    },
    state() { return { queued, grace }; },
  };
}

/** Checkpoints only advance in authored route order, never rewind on revisits. */
export function nextForwardCheckpoint(checkpoints, current, player, radius = 3.0) {
  if (!Array.isArray(checkpoints) || !checkpoints.length) return current;
  // Do not award a future checkpoint while gliding high above its platform.
  if (player?.grounded === false) return current;
  const currentIndex = Math.max(0, checkpoints.findIndex(cp => cp.id === current?.id));
  for (let index = checkpoints.length - 1; index > currentIndex; index--) {
    const cp = checkpoints[index];
    if (Number.isFinite(cp.x) && Number.isFinite(cp.y) &&
      Math.hypot(player.x - cp.x, player.y - cp.y) <= radius) return cp;
  }
  return current;
}

const ARROWS = Object.freeze(['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']);

/** Nearest *uncollected* relic, not a promised straight-line walking route. */
export function nextRelicHint(player, relics, collected, cameraYaw = 0) {
  if (!player || !Array.isArray(relics)) return null;
  let closest = null;
  let distance = Infinity;
  for (const relic of relics) {
    if (collected?.has(relic.id)) continue;
    const d = Math.hypot(player.x - relic.x, player.y - relic.y);
    if (!Number.isFinite(d)) continue;
    if (d < distance) { closest = relic; distance = d; }
  }
  if (!closest) return null;
  const heading = Math.atan2(closest.x - player.x, closest.y - player.y);
  const relative = (heading - cameraYaw + Math.PI * 4) % (Math.PI * 2);
  const bucket = Math.floor((relative + Math.PI / 8) / (Math.PI / 4)) % 8;
  return {
    id: closest.id,
    label: closest.label || 'Relic',
    meters: Math.max(0, Math.ceil(distance / 10) * 10),
    arrow: ARROWS[bucket],
  };
}

export function questDirection(player, relics, collected, cameraYaw) {
  const hint = nextRelicHint(player, relics, collected, cameraYaw);
  return hint
    ? `Next: ${hint.label} ${hint.arrow} · about ${hint.meters}m · use the bridges`
    : null;
}
