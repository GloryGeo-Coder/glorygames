/* Neon Grid mission rules: independent of rendering, input and browser storage. */
(() => {
  "use strict";
  const missions = [
    { title: "Breach the Grid", goal: "Clear the barrier", story: "The Nexus has sealed Neon Grid. Pilot your breaker rig through the canal barrier. Orange charges blast neighbouring tiles; gold caches release a power-up.", map: ["NNHNNHNN", "NXN..NXN", "NBNNNNBN", ".NN..NN."] },
    { title: "Circuit Reroute", goal: "Activate 3 relays, then break the core", story: "The city has gone dark. Hit each yellow relay once to restore power, then break the violet core. Its shield blocks every attack until all three relays are active.", map: ["..HCCH..", "NN....NN", ".R.XR.R.", "NHN..NHN"] },
    { title: "Skybridge Evac", goal: "Free 3 repair drones", story: "Three repair drones are trapped above the canal. Break their green rescue pods before the bridge closes. You only need the pods; the remaining tiles are optional.", map: ["NNHNNHNN", ".P..P.P.", "HXN..NXH", "NNB..BNN"] },
    { title: "Sentinel Sweep", goal: "Defeat both drones, then break the core", story: "A Sentinel guards the signal core while a repair drone patches armour. Return the ball into both drones. Amber aiming lines warn of a shot: dodge it to avoid a brief paddle jam. Repairs are limited.", map: ["...CC...", "HNN..NNH", "NXH..HXN", ".NB..BN."] },
    { title: "The Grid Warden", goal: "Break 2 generators, then defeat the Warden", story: "The Warden controls the last uplink. Break both blue generators to lower its shield. Aim at the glowing central eye; in phase two, wait for the green opening. Avoid its telegraphed pulses and restore the city.", map: ["H......H", ".G....G.", "NX....XN", ".HB..BH."] }
  ];
  // One core spans two cells visually only through adjacent independently hittable tiles.
  // Each core tile is a valid final target; both must be destroyed.
  const types = { N: ["normal", 1, "#38bdf8"], H: ["heavy", 2, "#a78bfa"], X: ["explode", 1, "#fb923c"], B: ["bonus", 1, "#facc15"], R: ["relay", 1, "#fde047"], C: ["core", 2, "#e879f9"], P: ["pod", 2, "#4ade80"], G: ["generator", 2, "#60a5fa"] };
  const SAVE_KEY = "gg_brick_blaster_campaign_v1";
  const bounded = (v, max) => Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0;
  function readProgress(value) {
    return { unlocked: Math.max(1, bounded(value?.unlocked, 5)), stars: Array.from({ length: 5 }, (_, i) => bounded(value?.stars?.[i], 3)), best: Array.from({ length: 5 }, (_, i) => bounded(value?.best?.[i], 99999999)) };
  }
  function record(progress, index, points, livesLost) {
    const p = readProgress(progress); if (!Number.isInteger(index) || index < 0 || index >= p.unlocked) return p;
    p.unlocked = Math.min(5, Math.max(p.unlocked, index + 2)); p.stars[index] = Math.max(p.stars[index], livesLost === 0 ? 3 : livesLost === 1 ? 2 : 1); p.best[index] = Math.max(p.best[index], bounded(points, 99999999)); return p;
  }
  function create(index, layout) {
    if (!Number.isInteger(index) || !missions[index]) throw new RangeError("Unknown mission");
    const definition = missions[index], bricks = [], enemies = [], shots = [], events = [];
    for (let row = 0; row < definition.map.length; row++) for (let col = 0; col < 8; col++) {
      const spec = types[definition.map[row][col]]; if (!spec) continue;
      const [type, hp, color] = spec; bricks.push({ row, col, type, hp, maxHp: hp, color, pulse: 0, active: false });
    }
    if (index === 3) enemies.push({ type: "sentinel", hp: 3, maxHp: 3, phaseOffset: 0, cooldown: 4, warning: 0 }, { type: "repair", hp: 2, maxHp: 2, phaseOffset: Math.PI, cooldown: 5, warning: 0 });
    if (index === 4) enemies.push({ type: "warden", hp: 18, maxHp: 18, phaseOffset: 0, cooldown: 3, warning: 0 });
    let w = 360, h = 640, elapsed = 0, relays = 0, rescued = 0, repairs = 4, repairTimer = 5, jam = 0, resolved = false;
    function phase(a) { return a.type !== "warden" ? 1 : a.hp > 12 ? 1 : a.hp > 6 ? 2 : 3; }
    function shielded() { return index === 1 ? relays < 3 : index === 3 ? enemies.some(a => a.hp > 0) : index === 4 ? bricks.some(b => b.type === "generator") : false; }
    function open(a) { return !shielded() && (phase(a) !== 2 || elapsed % 3.6 < 2.4); }
    function placeActors() {
      for (const a of enemies) {
        a.w = Math.min(a.type === "warden" ? 200 : 95, w * (a.type === "warden" ? .36 : .2)); a.h = Math.max(10, Math.min(a.type === "warden" ? 44 : 30, h * .065));
        const speed = a.type === "warden" ? .65 + phase(a) * .15 : .8;
        a.x = w * (.5 + Math.sin(elapsed * speed + a.phaseOffset) * .27) - a.w / 2; a.y = h * (a.type === "repair" ? .57 : .49);
      }
    }
    function reflow(width, height) { w = width; h = height; const g = layout.grid(w, h, definition.map.length, 8); for (const b of bricks) Object.assign(b, layout.cell(g, b.row, b.col)); placeActors(); }
    function event(b, label, score, drop = false) { events.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, color: b.color || "#e879f9", label, score, drop, broken: true }); }
    function hitBrick(b, damage = 1, visited = new Set()) {
      if (resolved || !bricks.includes(b) || b.active || visited.has(b)) return { accepted: false, forceBounce: false };
      visited.add(b);
      if (b.type === "core" && shielded()) return { accepted: false, forceBounce: true };
      if (b.type === "relay") { b.active = true; relays++; event(b, `Relay ${relays}/3`, 90); return { accepted: true, forceBounce: true }; }
      b.hp -= damage;
      if (b.hp > 0) { events.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, color: b.color, score: 14, label: "Hit" }); return { accepted: true, forceBounce: false }; }
      bricks.splice(bricks.indexOf(b), 1);
      if (b.type === "pod") rescued++;
      event(b, b.type === "pod" ? `Rescue ${rescued}/3` : b.type === "generator" ? "Generator offline" : b.type === "core" ? "Core broken" : "Break", b.type === "pod" ? 180 : b.type === "core" ? 240 : 70, b.type === "bonus");
      if (b.type === "explode") for (const other of [...bricks]) if (Math.hypot(other.row - b.row, other.col - b.col) <= 1.5) hitBrick(other, 2, visited);
      return { accepted: true, forceBounce: false };
    }
    function hitActor(a, ball) {
      if (resolved || !enemies.includes(a) || a.hp <= 0) return { accepted: false, forceBounce: true };
      if (a.type === "warden" && (!open(a) || Math.abs(ball.x - (a.x + a.w / 2)) > a.w * .28)) return { accepted: false, forceBounce: true };
      a.hp = Math.max(0, a.hp - (ball.fire ? 2 : 1)); event(a, a.hp ? "Direct hit" : a.type === "warden" ? "Warden defeated" : "Drone disabled", a.hp ? 45 : 300);
      if (!a.hp) { a.warning = 0; shots.splice(0, shots.length, ...shots.filter(s => s.owner !== a)); }
      return { accepted: true, forceBounce: true };
    }
    function complete() { return index === 0 ? bricks.length === 0 : index === 1 || index === 3 ? !shielded() && !bricks.some(b => b.type === "core") : index === 2 ? rescued === 3 : !enemies.some(a => a.hp > 0); }
    function update(dt, paddle, active = true) {
      if (resolved) return; jam = Math.max(0, jam - dt); if (!active) return;
      elapsed += dt; placeActors();
      if (index === 3 && enemies.some(a => a.type === "repair" && a.hp > 0) && repairs > 0 && (repairTimer -= dt) <= 0) {
        repairTimer = 5; const target = bricks.find(b => b.type === "heavy" && b.hp < b.maxHp);
        if (target) { target.hp++; repairs--; events.push({ x: target.x + target.w / 2, y: target.y, color: "#4ade80", label: `Armour repaired · ${repairs} charges left`, score: 0 }); }
      }
      for (const a of enemies) {
        if (a.hp <= 0 || a.type === "repair" || (a.type === "warden" && shielded())) continue;
        if (a.warning > 0) {
          a.warning -= dt;
          if (a.warning <= 0) {
            for (const offset of phase(a) === 3 ? [-.045, .045] : [0]) { const u = (a.x + a.w / 2) / w, v = (a.y + a.h) / h, target = a.aim + offset, span = Math.max(.1, paddle.y / h - v); shots.push({ u, v, du: (target - u) / span * .32, dv: .32, owner: a }); }
            a.cooldown = a.type === "warden" ? 3.8 - phase(a) * .5 : 4.2;
          }
        } else if ((a.cooldown -= dt) <= 0) { a.warning = .9; a.aim = paddle.x / w; }
      }
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i]; s.u += s.du * dt; s.v += s.dv * dt;
        if (Math.abs(s.u * w - paddle.x) < paddle.w / 2 + 4 && Math.abs(s.v * h - paddle.y) < paddle.h / 2 + 6) { jam = 1.8; shots.splice(i, 1); events.push({ x: paddle.x, y: paddle.y, color: "#fbbf24", label: "Paddle jam · 1.8s", score: 0, jam: true }); }
        else if (s.v > 1.05 || s.u < -.1 || s.u > 1.1) shots.splice(i, 1);
      }
    }
    function status() {
      if (resolved) return "Mission complete";
      if (index === 0) return `Barrier · ${bricks.length} tiles left`;
      if (index === 1) return relays < 3 ? `Relays ${relays}/3 · Core shielded` : `Power restored · Break the core`;
      if (index === 2) return `Repair drones rescued ${rescued}/3`;
      if (index === 3) return enemies.some(a => a.hp > 0) ? `Patrol ${enemies.filter(a => a.hp > 0).length}/2 · Core shielded` : "Patrol cleared · Break the core";
      const a = enemies[0]; return shielded() ? `Generators ${2 - bricks.filter(b => b.type === "generator").length}/2 · Warden shielded` : `Warden ${a.hp}/18 · Phase ${phase(a)} · ${open(a) ? "Eye open" : "Eye closed"}`;
    }
    function draw(ctx, reducedMotion) {
      for (const a of enemies) {
        if (a.hp <= 0) continue; const isBoss = a.type === "warden", color = a.type === "repair" ? "#4ade80" : isBoss ? "#e879f9" : "#fbbf24", cx = a.x + a.w / 2, cy = a.y + a.h / 2;
        ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.fillStyle = "#0b1730";
        if (a.warning > 0) { ctx.setLineDash([7, 6]); ctx.globalAlpha = .7; ctx.beginPath(); ctx.moveTo(cx, a.y + a.h); ctx.lineTo(a.aim * w, h); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
        ctx.beginPath(); ctx.roundRect(a.x, a.y, a.w, a.h, a.h * .32); ctx.fill(); ctx.stroke();
        const wing = reducedMotion ? 0 : Math.sin(elapsed * 9 + a.phaseOffset) * a.h * .12;
        for (const sign of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sign * a.w * .22, cy); ctx.lineTo(cx + sign * a.w * .44, cy - wing); ctx.stroke(); }
        ctx.fillStyle = isBoss ? open(a) ? "#86efac" : "#fbbf24" : color; ctx.beginPath(); ctx.arc(cx, cy, a.h * .27, 0, Math.PI * 2); ctx.fill();
        if (isBoss && shielded()) { ctx.strokeStyle = "#60a5fa"; ctx.beginPath(); ctx.roundRect(a.x - 3, a.y - 3, a.w + 6, a.h + 6, a.h / 2); ctx.stroke(); }
        ctx.fillStyle = "#102038"; ctx.fillRect(a.x, a.y - 6, a.w, 3); ctx.fillStyle = color; ctx.fillRect(a.x, a.y - 6, a.w * a.hp / a.maxHp, 3);
        ctx.restore();
      }
      ctx.fillStyle = "#fbbf24"; for (const s of shots) { ctx.beginPath(); ctx.arc(s.u * w, s.v * h, Math.max(3, Math.min(5, h * .018)), 0, Math.PI * 2); ctx.fill(); }
    }
    return { definition, bricks, enemies, shots, reflow, hitBrick, hitActor, update, draw, complete, status, shielded, open, phase, solid: b => !b.active, drain: () => events.splice(0), resolve() { resolved = true; shots.length = 0; }, clearShots() { shots.length = 0; jam = 0; for (const a of enemies) { a.warning = 0; a.cooldown = 3; } }, get elapsed() { return elapsed; }, get relays() { return relays; }, get rescued() { return rescued; }, get jam() { return jam; }, get repairsRemaining() { return repairs; } };
  }
  const api = { missions, SAVE_KEY, readProgress, record, create };
  if (typeof window !== "undefined") window.BrickCampaign = api;
  if (typeof module !== "undefined") module.exports = api;
})();
