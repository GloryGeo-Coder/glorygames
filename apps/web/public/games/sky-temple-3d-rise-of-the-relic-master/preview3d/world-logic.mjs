import { CAMPAIGN_DEPTH } from "./campaign-depth.mjs";
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
  { id: "arrival", x: -12, y: -17, h: 0.58, r: 5.95 },
  { id: "middle", x: -6, y: -2, h: 1.58, r: 4.33 },
  { id: "citadel", x: 5, y: 14, h: 3.58, r: 7.85 },
  { id: "exit", x: 18, y: -4, h: 3.88, r: 4.40 },
  { id: "vista", x: -20, y: 10, h: 6.58, r: 3.40 },
  ...CAMPAIGN_DEPTH.garden.islands,
];

export const bridges = [
  { id: "arrival-bridge", from: [-9, -13, .58], to: [-8, -5, 1.58], width: 2.65 },
  { id: "citadel-bridge", from: [-5, 1, 1.58], to: [1, 9, 3.58], width: 2.4 },
  { id: "exit-bridge", from: [10, 9, 3.58], to: [15, -2, 3.88], width: 2.5 },
  ...CAMPAIGN_DEPTH.garden.bridges,
];

export const relics = [
  { id: "relic-dawn", label: "Dawn Relic", x: -8.8, y: -11.1 },
  { id: "relic-wisdom", label: "Wisdom Relic", x: -6, y: -2 },
  { id: "relic-courage", label: "Courage Relic", x: 5, y: 11.5 },
  ...CAMPAIGN_DEPTH.garden.relics,
];
export const checkpoints = [
  { id: "arrival", x: -12, y: -17 },
  { id: "middle", x: -6, y: -2 },
  { id: "citadel", x: 5, y: 11.5 },
];
export const goal = { id: "sky-garden-exit", x: 18, y: -4, targetWorld: "Crystal Caverns" };

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
