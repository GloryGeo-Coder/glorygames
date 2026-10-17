/**
 * Sky Temple 3D | Shared mobile rendering budget (v0.10).
 * Pure logic and no DOM/Babylon imports: all four worlds use one controller.
 * Babylon's hardware scaling value > 1 reduces render resolution.
 */
export const QUALITY_MODES = Object.freeze(["auto", "performance", "balanced", "quality"]);

export function parseQualityPreference(value) {
  return QUALITY_MODES.includes(value) ? value : "auto";
}

export function startingHardwareScale({ mobile = false, dpr = 1, quality = "auto" } = {}) {
  const ratio = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  const mode = parseQualityPreference(quality);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  if (mode === "performance") return clamp(mobile ? ratio * 0.95 : ratio * 0.8, mobile ? 1.7 : 1.3, mobile ? 2.8 : 2.0);
  if (mode === "balanced") return clamp(ratio / (mobile ? 1.35 : 1.55), 1.15, mobile ? 2.2 : 1.65);
  if (mode === "quality") return clamp(ratio / (mobile ? 2 : 2.25), 1, mobile ? 1.45 : 1.25);
  return clamp(ratio / (mobile ? 1.2 : 1.5), 1, mobile ? 2.25 : 1.75);
}

/**
 * Adaptive hardware scaling with hysteresis and a cooldown.
 * - No scaling while paused/loading or when the page is hidden.
 * - Ignore loading and first seconds of gameplay (shader/GLB warmup).
 * - Prioritize stable ~30fps on phones; avoid bouncing resolution every frame.
 * - Only touch the renderer resolution; game simulation and save data are untouched.
 */
export function createCampaignPerformanceController(engine, {
  mobile = false,
  dpr = 1,
  quality = "auto",
  now = () => performance.now(),
} = {}) {
  const mode = parseQualityPreference(quality);
  const minScale = mobile ? 1.12 : 1;
  const maxScale = mobile ? 2.6 : 1.9;
  const initial = startingHardwareScale({ mobile, dpr, quality: mode });
  engine.setHardwareScalingLevel(initial);
  let activeAt = null;
  let lastSampleAt = null;
  let lastAdjustmentAt = -Infinity;
  let lows = 0, highs = 0;
  let smoothedFps = null;
  let changes = 0;
  const round = (n) => Math.round(n * 100) / 100;
  function reset() { activeAt = null; lastSampleAt = null; lows = highs = 0; smoothedFps = null; }
  function sample({ fps, active = true, visible = true, time = now() } = {}) {
    if (!active || !visible) { reset(); return false; }
    if (!mobile || mode !== "auto") return false;
    if (!Number.isFinite(fps) || fps <= 2 || !Number.isFinite(time)) return false;
    if (activeAt === null) activeAt = time;
    if (lastSampleAt !== null && time - lastSampleAt < 1350) return false;
    lastSampleAt = time;
    smoothedFps = smoothedFps === null ? fps : smoothedFps * 0.55 + fps * 0.45;
    if (time - activeAt < 6500) return false;
    if (smoothedFps < 29) { lows++; highs = 0; }
    else if (smoothedFps > 52) { highs++; lows = 0; }
    else { lows = 0; highs = 0; }
    if (time - lastAdjustmentAt < 5200) return false;
    const previous = engine.getHardwareScalingLevel();
    let next = previous;
    if (lows >= 2) next = Math.min(maxScale, previous + .18);
    else if (highs >= 5) next = Math.max(minScale, previous - .1);
    if (Math.abs(next - previous) < .001) return false;
    engine.setHardwareScalingLevel(round(next));
    lastAdjustmentAt = time;
    lows = highs = 0;
    changes++;
    return true;
  }
  function state() {
    return { mode, scale: round(engine.getHardwareScalingLevel()),
      smoothedFps: smoothedFps == null ? null : Math.round(smoothedFps),
      adjustments: changes, mobile };
  }
  return { mode, sample, reset, state };
}
