/**
 * Reliable animation driver for the nine named glTF animation clips.
 * Clip selection is independent of 3D rendering so it can be tested on Node.
 */
export const CLIP_NAMES = ["Idle", "Walk", "Run", "Jump", "Glide", "Land", "Blast", "Hit", "Victory"];
const LOOPS = new Set(["Idle", "Walk", "Run", "Glide"]);

export function chooseHeroClip({ grounded, moving, speed, glide, won = false }) {
  if (won) return "Victory";
  if (!grounded) return glide ? "Glide" : "Jump";
  if (!moving) return "Idle";
  return speed > 5.9 ? "Run" : "Walk";
}

export function createHeroAnimator(groups, { reduceMotion = false, onFailure = () => {} } = {}) {
  const byName = new Map();
  for (const group of groups || []) {
    const key = CLIP_NAMES.find(name => (group?.name || "").toLowerCase().includes(name.toLowerCase()));
    if (key && !byName.has(key)) byName.set(key, group);
    try { group.stop?.(); } catch {} // Prevent all nine groups autoplaying at once.
  }
  let current = "", active = null, override = null, remaining = 0, paused = false;
  function start(name) {
    if (!byName.has(name)) name = byName.has("Idle") ? "Idle" : "";
    if (name === current) return;
    try { active?.stop?.(); } catch {}
    current = name;
    active = byName.get(name) ?? null;
    if (!active || paused) return;
    try {
      active.enableBlending = true;
      active.blendingSpeed = .18;
      active.start(LOOPS.has(name), reduceMotion ? .7 : 1.0);
    } catch (err) { onFailure(err); active = null; }
  }
  function update(dt, movement) {
    if (paused) return current;
    if (remaining > 0) {
      remaining = Math.max(0, remaining - dt);
      if (remaining > 0) { start(override); return current; }
      override = null;
    }
    start(chooseHeroClip(movement));
    return current;
  }
  function trigger(name, seconds) {
    if (!byName.has(name) || paused) return false;
    // Damage should override attacks; attacks never override a hit reaction.
    if (override === "Hit" && remaining > 0 && name !== "Victory") return false;
    override = name;
    remaining = Math.max(.15, seconds || .35);
    start(name);
    return true;
  }
  function suspend() {
    if (paused) return;
    paused = true;
    try { active?.pause?.(); } catch {}
  }
  function resume() {
    if (!paused) return;
    paused = false;
    try { active?.play?.(LOOPS.has(current)); } catch { try { active?.start?.(LOOPS.has(current)); } catch {} }
  }
  function reset() {
    override = null; remaining = 0;
    try { active?.stop?.(); } catch {}
    active = null; current = "";
    paused = false;
    start("Idle");
  }
  function dispose() { try { active?.stop?.(); } catch {}; active = null; }
  return { update, trigger, suspend, resume, reset, dispose, hasRig:byName.has("Idle"), hasClip:(name)=>byName.has(name), get currentClip(){return current;} };
}
