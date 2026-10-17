/* Metres and seconds shared by traffic, rivals and the player. No progress teleporting. */
(() => {
  'use strict';
  const DISTANCE_SCALE = .92;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  function rivalPace(base, index, gap, time, phase = 0, difficulty = 1) {
    const skill = 1.015 + (index % 7) * .012;
    const catchup = clamp(-gap / 650, -.055, .12);
    const attack = Math.max(0, Math.sin(time * .32 + phase)) * .075;
    return base * (skill + catchup + attack) * difficulty;
  }
  function approachSpeed(speed, target, dt, acceleration = 7) {
    return speed + clamp(target - speed, -acceleration * 1.7 * dt, acceleration * dt);
  }
  function visibleZ(progress, playerProgress) { return 8 - (progress - playerProgress) / DISTANCE_SCALE; }
  function contact({dx, dz, playerSpeed, otherSpeed, heavy = false, hazard = false}) {
    const side = Math.abs(dx) > 1.05 && Math.abs(dz) < 3.1;
    const closing = clamp(Math.abs(playerSpeed - otherSpeed) / 65, 0, 1);
    const severity = hazard ? .85 : clamp((side ? .2 : .38) + closing * .52 + (heavy ? .1 : 0), .18, .95);
    return {severity, speedFactor: clamp(1 - severity * (side ? .65 : .85), .3, .9),
      push: (dx >= 0 ? 1 : -1) * (1.2 + severity * 3), damage: Math.round(severity * 18), side};
  }
  function recover(factor, dt) { return clamp(factor + dt * .19, .3, 1); }
  // A following driver brakes early when a slower vehicle occupies its lane.
  function followingSpeed(target, speed, distance, otherSpeed) {
    if (distance <= 0 || distance > 27 || speed <= otherSpeed) return target;
    return Math.min(target, Math.max(otherSpeed * .72, otherSpeed + (distance - 9) * .65));
  }
  window.RacerDriving = Object.freeze({DISTANCE_SCALE, rivalPace, approachSpeed, visibleZ, contact, recover, followingSpeed});
})();
