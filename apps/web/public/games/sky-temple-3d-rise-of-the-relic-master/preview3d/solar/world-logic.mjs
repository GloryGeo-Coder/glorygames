import { CAMPAIGN_DEPTH } from "../campaign-depth.mjs";
/** Fourth world — Solar Sanctuary. Final campaign stage and collision configuration. */
export const GAME_SLUG = "sky-temple-3d-rise-of-the-relic-master";
export const GRAVITY = 19.5;
export const JUMP_VELOCITY = 8.25;
export const WALK_SPEED = 5.6;
export const RUN_SPEED = 7.2;
export const PLAYER_RADIUS = .35;

// Author XY horizontal, height vertical, export to Babylon X,height,-Y.
// Collision islands and bridges match SolarSanctuary_Enhanced_Yup_Mobile.glb.
export const islands = Object.freeze([
  { id: "arrival", x: -18, y: -12, h: .45, r: 6.4 },
  { id: "sun-terrace", x: -8, y: -1, h: 1.75, r: 5.25 },
  { id: "temple-court", x: 7, y: 13, h: 3.15, r: 10.0 },
  { id: "solar-crown", x: 20, y: 2, h: 4.05, r: 5.0 },
  ...CAMPAIGN_DEPTH.solar.islands,
]);
export const bridges = Object.freeze([
  { id: "arrival-terrace", from: [-15,-9,.45], to: [-10,-4,1.75], width: 3.0 },
  { id: "terrace-temple", from: [-5,2,1.75], to: [1,6,3.15], width: 3.4 },
  { id: "temple-crown", from: [12,8,3.15], to: [17,5,4.05], width: 3.2 },
  ...CAMPAIGN_DEPTH.solar.bridges,
]);
export const relics = Object.freeze([
  { id: "dawn-spark", label: "Dawn Spark", x: -18.0, y: -10.0 },
  { id: "sunstone-prism", label: "Sunstone Prism", x: -8.1, y: -.7 },
  { id: "crown-of-light", label: "Crown of Light", x: 5.2, y: 9.5 },
  ...CAMPAIGN_DEPTH.solar.relics,
]);
export const checkpoints = Object.freeze([
  { id: "arrival", x: -18, y: -12 },
  { id: "sun-terrace", x: -8, y: -1 },
  { id: "temple-court", x: 5.2, y: 9.4 },
]);
export const goal = Object.freeze({ id: "solar-crown-gate", x: 20, y: 2, targetWorld: "Campaign Complete" });

export function horizontalToEngine(x, y, height = 0) { return { x, y: height, z: -y }; }
function circleHeight(island, x, y) {
  return Math.hypot(x - island.x, y - island.y) <= island.r + .05
    ? { id: island.id, height: island.h, kind: "island" } : null;
}
function bridgeHeight(bridge, x, y) {
  const [ax, ay, ah] = bridge.from, [bx, by, bh] = bridge.to;
  const vx = bx - ax, vy = by - ay, len2 = vx * vx + vy * vy;
  if (len2 <= 0) return null;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / len2));
  const dx = x - (ax + t * vx), dy = y - (ay + t * vy);
  if (Math.hypot(dx, dy) > bridge.width * .5 + .03) return null;
  return { id: bridge.id, height: ah + t * (bh - ah), kind: "bridge" };
}
export function floorCandidates(x, y) {
  return [...islands.map(i => circleHeight(i, x, y)), ...bridges.map(b => bridgeHeight(b, x, y))]
    .filter(Boolean).sort((a, b) => b.height - a.height);
}
export function floorAt(x, y, currentFeet = Infinity, maxStepUp = .65) {
  return floorCandidates(x, y).find(f => f.height <= currentFeet + maxStepUp) ?? null;
}
export function movementVector(forward, strafe, yaw, speed = WALK_SPEED) {
  const magnitude = Math.min(1, Math.hypot(strafe, forward));
  if (!magnitude) return { x: 0, y: 0 };
  const d = Math.hypot(strafe, forward);
  const f = forward / d, s = strafe / d;
  return { x: (Math.cos(yaw) * s + Math.sin(yaw) * f) * magnitude * speed,
    y: (Math.cos(yaw) * f - Math.sin(yaw) * s) * magnitude * speed };
}
export function canEnterPortal(collectedCount) { return collectedCount >= relics.length; }
export function distance2(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
/** Advance checkpoints only forward; standing on an older checkpoint never rewinds progress. */
export function nextCheckpoint(current, x, y, radius = 2.7) {
  const currentIndex = Math.max(0, checkpoints.findIndex(c => c.id === current?.id));
  for (let i = checkpoints.length - 1; i > currentIndex; i--) {
    if (Math.hypot(x - checkpoints[i].x, y - checkpoints[i].y) < radius) return checkpoints[i];
  }
  return current;
}
