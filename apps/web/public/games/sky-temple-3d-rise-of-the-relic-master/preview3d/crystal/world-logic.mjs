import { CAMPAIGN_DEPTH } from "../campaign-depth.mjs";
/** Pure, testable gameplay geometry and movement functions. No engine globals. */
export const GAME_SLUG = "sky-temple-3d-rise-of-the-relic-master";
export const GRAVITY = 19.5;
export const JUMP_VELOCITY = 8.25;
export const WALK_SPEED = 5.6;
export const RUN_SPEED = 7.2;
export const PLAYER_RADIUS = 0.35;

// The Blender source is X/Y horizontal, Z vertical; use X/Y/Z in these authored
// coordinates for the collision math. Babylon transforms to X/Z/-Y at render time.
export const islands = [
  { id: "entrance", x: -13, y: -11, h: .2, r: 5.58 },
  { id: "echo", x: -4, y: 0, h: 1.0, r: 4.42 },
  { id: "shrine", x: 9, y: 12, h: 2.4, r: 6.51 },
  { id: "treasure", x: 17, y: -6, h: 3.8, r: 4.34 },
  ...CAMPAIGN_DEPTH.crystal.islands,
];
export const bridges = [
  { id: "entrance-echo", from: [-10,-8,.2], to: [-7,-3,1.0], width: 3.1 },
  { id: "echo-shrine", from: [-1,3,1.0], to: [5,8,2.4], width: 3.0 },
  { id: "shrine-treasure", from: [11,7.5,2.4], to: [14.9,-2.4,3.8], width: 3.1 },
  ...CAMPAIGN_DEPTH.crystal.bridges,
];
export const relics = [
  { id: "relic-echo", label: "Echo Shard", x: -10.0, y: -10.0 },
  { id: "relic-resonance", label: "Resonance Crystal", x: -3.5, y: .6 },
  { id: "relic-prism", label: "Prism Heart", x: 8.0, y: 11.6 },
  ...CAMPAIGN_DEPTH.crystal.relics,
];
export const checkpoints = [
  { id: "entrance", x: -13, y: -11 },
  { id: "echo", x: -4, y: 0 },
  { id: "shrine", x: 8.0, y: 10 },
];
export const goal = { id: "cavern-exit", x: 17, y: -6, targetWorld: "Storm Citadel" };

export function horizontalToEngine(x, y, height = 0) {
  return { x, y: height, z: -y };
}

function circleHeight(island, x, y) {
  const dist = Math.hypot(x - island.x, y - island.y);
  return dist <= island.r + 0.05 ? { id: island.id, height: island.h, kind: "island" } : null;
}

function bridgeHeight(bridge, x, y) {
  const [ax, ay, ah] = bridge.from;
  const [bx, by, bh] = bridge.to;
  const vx = bx - ax, vy = by - ay;
  const len2 = vx * vx + vy * vy;
  if (len2 <= 0) return null;
  const t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / len2));
  const nearestX = ax + t * vx, nearestY = ay + t * vy;
  const lateral = Math.hypot(x - nearestX, y - nearestY);
  if (lateral > bridge.width * 0.5 + 0.03) return null;
  return { id: bridge.id, height: ah + t * (bh - ah), kind: "bridge" };
}

/** Returns plausible floor candidates at a horizontal position, highest first. */
export function floorCandidates(x, y) {
  return [...islands.map(i => circleHeight(i, x, y)), ...bridges.map(b => bridgeHeight(b, x, y))]
    .filter(Boolean).sort((a, b) => b.height - a.height);
}

/** Avoid popping onto the top of an elevated surface from far below. */
export function floorAt(x, y, currentFeet = Infinity, maxStepUp = 0.65) {
  return floorCandidates(x, y).find(f => f.height <= currentFeet + maxStepUp) ?? null;
}

/** Map forward and sideways input relative to camera facing toward -Z. */
export function movementVector(forward, strafe, yaw, speed = WALK_SPEED) {
  const magnitude = Math.min(1, Math.hypot(strafe, forward));
  if (magnitude === 0) return { x: 0, y: 0 };
  const f = forward / Math.hypot(strafe, forward), s = strafe / Math.hypot(strafe, forward);
  // In Blender horizontal coordinates, increasing Y moves toward distant islands.
  // Camera yaw 0 faces +Y in Blender (towards -Z in Babylon).
  return { x: (Math.cos(yaw) * s + Math.sin(yaw) * f) * magnitude * speed,
           y: (Math.cos(yaw) * f - Math.sin(yaw) * s) * magnitude * speed };
}

export function canEnterPortal(collectedCount) { return collectedCount >= relics.length; }
export function distance2(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
