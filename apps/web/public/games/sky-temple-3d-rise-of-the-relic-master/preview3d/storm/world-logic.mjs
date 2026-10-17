import { CAMPAIGN_DEPTH } from "../campaign-depth.mjs";
/** Third world — Storm Citadel. Pure geometry and gameplay configuration. */
export const GAME_SLUG = "sky-temple-3d-rise-of-the-relic-master";
export const GRAVITY = 19.5;
export const JUMP_VELOCITY = 8.25;
export const WALK_SPEED = 5.6;
export const RUN_SPEED = 7.2;
export const PLAYER_RADIUS = .35;

// Authored coordinates: X/Y horizontal, H vertical, converted to Babylon X,H,-Y.
// Surface centers and bridges match StormCitadel_Enhanced_Yup_Mobile.glb.
export const islands = Object.freeze([
  { id: "entrance", x: -14, y: -15, h: .2, r: 6.2 },
  { id: "spire", x: -5, y: -3, h: 2.6, r: 4.185 },
  { id: "arena", x: 7, y: 13, h: 4.2, r: 9.92 },
  { id: "relay", x: 19, y: -3, h: 3.6, r: 4.185 },
  ...CAMPAIGN_DEPTH.storm.islands,
]);
export const bridges = Object.freeze([
  { id: "entrance-spire", from: [-11, -11.2, .2], to: [-7, -6.1, 2.6], width: 2.5 },
  { id: "spire-arena", from: [-2.4, -.5, 2.6], to: [2.8, 5.7, 4.2], width: 3.1 },
  { id: "arena-relay", from: [11.3, 6.4, 4.2], to: [17.3, .1, 3.6], width: 2.9 },
  ...CAMPAIGN_DEPTH.storm.bridges,
]);
export const relics = Object.freeze([
  { id: "storm-charge", label: "Storm Charge", x: -14.4, y: -13.3 },
  { id: "spire-spark", label: "Spire Spark", x: -5.1, y: -2.7 },
  { id: "thunder-heart", label: "Thunder Heart", x: 5.0, y: 9.2 },
  ...CAMPAIGN_DEPTH.storm.relics,
]);
export const checkpoints = Object.freeze([
  { id: "entrance", x: -14, y: -15 },
  { id: "spire", x: -5, y: -3 },
  { id: "arena", x: 5.4, y: 9.0 },
]);
export const goal = Object.freeze({ id: "solar-gateway", x: 19, y: -3, targetWorld: "Solar Sanctuary" });

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
