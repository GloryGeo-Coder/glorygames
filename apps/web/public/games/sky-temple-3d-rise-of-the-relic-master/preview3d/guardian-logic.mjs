/**
 * Sky Garden's first boss: deterministic, testable encounter state.
 * A boss is unlocked by the third relic and can then be defeated without
 * forcing any keyboard-only mechanics on mobile players.
 */
export const GUARDIAN_MAX_HP = 12;
export const GUARDIAN_RANGE = 10.5;
export const GUARDIAN_POSITION = Object.freeze({ x: 6.7, y: 15.3 });
export const GUARDIAN_ATTACKS = Object.freeze({
  bolt: { warning: 0.9, recovery: 1.2, label: "Arc bolts incoming — keep moving!" },
  sigil: { warning: 1.4, recovery: 1.0, label: "Violet circle — move out of the marked area!" },
  wave: { warning: 1.4, recovery: 1.4, label: "Shockwave charging — jump to avoid it!" },
});
export const SIGIL_RADIUS = 2.05;
export const WAVE_SPEED = 5.8;
export const WAVE_MAX_RADIUS = 6.6;

export function guardianPhase(hp, maxHp = GUARDIAN_MAX_HP) {
  if (hp <= 0) return 0;
  if (hp <= Math.ceil(maxHp / 3)) return 3;
  if (hp <= Math.ceil(maxHp * 2 / 3)) return 2;
  return 1;
}
export function guardianTitle(phase) {
  return ["Defeated", "Awakened Sentinel", "Stormbound Sentinel", "Relic Fury"][phase] || "Garden Sentinel";
}
export function portalAvailable(collectedRelics, relicTotal, guardian) {
  return collectedRelics >= relicTotal && (!guardian || guardian.defeated);
}
export function createGuardianState() {
  return { active: false, defeated: false, hp: GUARDIAN_MAX_HP,
    mode: "dormant", attackIndex: 0, pendingAttack: null, timer: 0,
    phase: 1, attacksCast: 0 };
}
export function awakenGuardian(state) {
  if (state.active || state.defeated) return false;
  Object.assign(state, { active: true, mode: "idle", timer: 2.5,
    hp: GUARDIAN_MAX_HP, phase: 1, pendingAttack: null, attacksCast: 0 });
  return true;
}
export function damageGuardian(state, amount = 1) {
  if (!state?.active || state.defeated) return { hit: false, defeated: false, phaseChanged: false };
  const prior = state.phase;
  state.hp = Math.max(0, state.hp - Math.max(0, amount));
  state.phase = guardianPhase(state.hp);
  if (state.hp === 0) {
    state.defeated = true;
    state.active = false;
    state.mode = "defeated";
    state.pendingAttack = null;
    state.timer = 0;
  }
  return { hit: true, defeated: state.defeated, phaseChanged: prior !== state.phase && !state.defeated };
}
export function nextGuardianAttack(phase, attackIndex) {
  const rotation = phase === 1 ? ["bolt", "sigil"] : phase === 2 ? ["sigil", "bolt", "wave"] : ["wave", "sigil", "bolt"];
  return rotation[attackIndex % rotation.length];
}
/**
 * Mutates an encounter state; returns one or zero render/gameplay events.
 * Timer advancement is paused outside the arena only between attacks.
 * A started warning always resolves, so it cannot be bypassed through range flicker.
 */
export function stepGuardian(state, dt, distanceToPlayer) {
  if (!state?.active || state.defeated) return [];
  if (state.mode === "idle" && distanceToPlayer > GUARDIAN_RANGE) return [];
  state.timer = Math.max(0, state.timer - Math.min(0.1, Math.max(0, dt)));
  if (state.timer > 0) return [];
  if (state.mode === "windup") {
    const attack = state.pendingAttack;
    state.pendingAttack = null;
    state.mode = "recovery";
    state.attacksCast += 1;
    state.timer = GUARDIAN_ATTACKS[attack].recovery;
    return [{ type: "cast", attack, phase: state.phase }];
  }
  if (state.mode === "recovery") {
    state.mode = "idle";
    state.timer = state.phase === 3 ? 0.9 : 1.65;
    return [];
  }
  const attack = nextGuardianAttack(state.phase, state.attackIndex++);
  state.pendingAttack = attack;
  state.mode = "windup";
  state.timer = GUARDIAN_ATTACKS[attack].warning;
  return [{ type: "warn", attack, phase: state.phase }];
}
/** Geometric checks for fair, dodgeable ground attacks. */
export function sigilHits(player, center, radius = SIGIL_RADIUS) {
  return Math.hypot(player.x - center.x, player.y - center.y) <= radius && player.grounded;
}
export function waveHits(player, center, previousRadius, radius, floorHeight, margin = 0.6) {
  if (!player.grounded || player.h > floorHeight + 0.85) return false;
  const distance = Math.hypot(player.x - center.x, player.y - center.y);
  return distance >= Math.max(0, previousRadius - margin) && distance <= radius + margin;
}
