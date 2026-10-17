/** Thunder Golem — isolated, deterministic three-phase boss logic. */
export const GUARDIAN_MAX_HP = 18;
export const GUARDIAN_RANGE = 11.0;
export const GUARDIAN_POSITION = Object.freeze({ x: 7, y: 13 });
export const GUARDIAN_ATTACKS = Object.freeze({
  bolt: { warning: 1.15, recovery: 1.25, label: "Chain bolt — sidestep the lightning!" },
  sigil: { warning: 1.55, recovery: 1.35, label: "Thunder sigil — leave the marked circle!" },
  wave: { warning: 1.65, recovery: 1.55, label: "Thunder ring — jump to clear the shockwave!" },
});
export const SIGIL_RADIUS = 2.1;
export const WAVE_SPEED = 6.2;
export const WAVE_MAX_RADIUS = 7.0;
export function guardianPhase(hp, max = GUARDIAN_MAX_HP) {
  if (hp <= 0) return 0;
  if (hp <= Math.ceil(max/3)) return 3;
  if (hp <= Math.ceil(max*2/3)) return 2;
  return 1;
}
export function guardianTitle(phase) {
  return ["Defeated", "Awakening Storm", "Charged Tempest", "Thunder's Fury"][phase] || "Thunder Golem";
}
export function portalAvailable(collected, total, guardian) {
  return collected >= total && (!guardian || guardian.defeated);
}
export function createGuardianState() {
  return { active: false, defeated: false, hp: GUARDIAN_MAX_HP, mode: "dormant",
    attackIndex: 0, pendingAttack: null, timer: 0, phase: 1, attacksCast: 0 };
}
export function awakenGuardian(state) {
  if (!state || state.active || state.defeated) return false;
  Object.assign(state, { active: true, defeated: false, mode: "idle", timer: 2.5,
    hp: GUARDIAN_MAX_HP, phase: 1, pendingAttack: null, attacksCast: 0, attackIndex: 0 });
  return true;
}
export function damageGuardian(state, amount = 1) {
  if (!state?.active || state.defeated) return {hit:false,defeated:false,phaseChanged:false};
  const prev = state.phase;
  state.hp = Math.max(0, state.hp - Math.max(0, amount));
  state.phase = guardianPhase(state.hp);
  if (!state.hp) {
    state.defeated = true; state.active = false; state.mode = "defeated";
    state.pendingAttack = null; state.timer = 0;
  }
  return {hit:true,defeated:state.defeated,phaseChanged:prev!==state.phase && !state.defeated};
}
export function nextGuardianAttack(phase, index) {
  const attacks = phase === 1 ? ["bolt","sigil"]
    : phase === 2 ? ["sigil","wave","bolt"] : ["wave","bolt","sigil"];
  return attacks[index % attacks.length];
}
export function stepGuardian(state, dt, rangeToHero) {
  if (!state?.active || state.defeated) return [];
  // Active warnings must complete, even if the hero moves outside range.
  if (state.mode === "idle" && rangeToHero > GUARDIAN_RANGE) return [];
  state.timer = Math.max(0,state.timer-Math.min(.1,Math.max(0,dt)));
  if (state.timer>0) return [];
  if (state.mode === "windup") {
    const attack=state.pendingAttack;
    state.pendingAttack=null;state.mode="recovery";state.attacksCast++;
    state.timer=GUARDIAN_ATTACKS[attack].recovery;
    return [{type:"cast",attack,phase:state.phase}];
  }
  if (state.mode === "recovery") {
    state.mode="idle";state.timer=state.phase===3?.9:1.5;return [];
  }
  const attack=nextGuardianAttack(state.phase,state.attackIndex++);
  state.pendingAttack=attack;state.mode="windup";
  state.timer=GUARDIAN_ATTACKS[attack].warning;
  return [{type:"warn",attack,phase:state.phase}];
}
export function sigilHits(player,center,radius=SIGIL_RADIUS) {
  return Math.hypot(player.x-center.x,player.y-center.y)<=radius && Boolean(player.grounded);
}
export function waveHits(player,center,prior,radius,floorHeight,margin=.6) {
  if (!player.grounded || player.h>floorHeight+.85) return false;
  const dist=Math.hypot(player.x-center.x,player.y-center.y);
  return dist>=Math.max(0,prior-margin) && dist<=radius+margin;
}
