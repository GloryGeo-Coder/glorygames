/** Pure combat math shared by keyboard and mobile play. No 3D or DOM dependency. */
export const DRONE_HP = 3;
export const DRONE_ATTACK_RANGE = 8.2;
export const DRONE_ATTACK_COOLDOWN = 3.8;
export const PLAYER_INVULNERABILITY = 1.5;

/** Forward-facing assist for small touch screens; never lock on behind the hero. */
export function selectAimTarget(origin, facing, enemies, maxDistance = 9.5) {
  const fx = Math.sin(facing), fy = Math.cos(facing);
  let selected = null, best = Infinity;
  for (const target of enemies) {
    if (!target?.alive) continue;
    const dx = target.x - origin.x, dy = target.y - origin.y;
    const distance = Math.hypot(dx, dy);
    if (distance < .0001 || distance > maxDistance) continue;
    const alignment = (dx * fx + dy * fy) / distance;
    if (alignment < .26) continue;
    const priority = distance + (1 - alignment) * 8;
    if (priority < best) { best = priority; selected = target; }
  }
  return selected;
}

export function vectorToTarget(from, to, speed) {
  const dx = to.x - from.x, dy = to.y - from.y, dh = (to.h ?? 0) - (from.h ?? 0);
  const magnitude = Math.hypot(dx, dy, dh);
  if (magnitude < .00001) return { vx: 0, vy: 0, vh: 0 };
  return { vx: dx / magnitude * speed, vy: dy / magnitude * speed, vh: dh / magnitude * speed };
}

export function projectileHits(a, b, radius = 1.1, heightTolerance = 1.15) {
  return Math.hypot(a.x - b.x, a.y - b.y) < radius && Math.abs((a.h ?? 0) - (b.h ?? 0)) < heightTolerance;
}

export function needsDroneWarning(enemy, player, elapsed) {
  return Boolean(enemy.alive && elapsed > 6 && enemy.cooldown <= 0 &&
    Math.hypot(enemy.x - player.x, enemy.y - player.y) <= DRONE_ATTACK_RANGE);
}
