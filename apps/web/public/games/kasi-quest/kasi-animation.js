/* Pose animation owns presentation only. Movement, collision, damage and rewards stay in game.js. */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && module.exports) module.exports = factory(require("./kasi-animation-data.js"));
  else root.KasiAnimation = factory(root.KasiAnimationData);
})(typeof window !== "undefined" ? window : globalThis, function (data) {
  "use strict";
  const priority = { land: 10, shoot: 20, hurt: 30, defeat: 100 };
  function create() {
    let states = new WeakMap();
    const images = {};
    let reducedMotion = false;
    const atlas = kind => data?.atlases?.[kind];
    function ensure(actor, kind) {
      let state = states.get(actor);
      if (!state || state.kind !== kind) {
        let seed = 0;
        for (const letter of String(actor.id || "")) seed = (seed * 31 + letter.charCodeAt(0)) >>> 0;
        const phase = kind === "player" ? 0 : (seed % 100) / 100;
        state = { kind, clip: "idle", time: phase * duration(kind, "idle"), phase, event: null, face: 1 };
        states.set(actor, state);
      }
      return state;
    }
    function duration(kind, clip) {
      const spec = atlas(kind)?.clips?.[clip];
      return spec ? spec.count / spec.fps : 0;
    }
    function play(actor, kind, clip, face) {
      const spec = atlas(kind)?.clips?.[clip];
      if (!spec) return false;
      const state = ensure(actor, kind);
      if (state.event && (priority[state.event.clip] || 0) > (priority[clip] || 0)) return false;
      if (state.event?.clip === "defeat") return false;
      state.event = { clip, time: 0, face: face ?? actor.face ?? actor.dir ?? 1 };
      state.clip = clip; state.time = 0; state.face = state.event.face;
      return true;
    }
    function cancel(actor, clip) {
      const state = states.get(actor);
      if (state?.event?.clip === clip) state.event = null;
    }
    function update(actor, kind, dt, hints = {}) {
      const state = ensure(actor, kind), info = atlas(kind);
      if (!info) return;
      dt = Math.max(0, Number(dt) || 0);
      const defeated = hints.defeated || actor.alive === false || (kind === "player" && actor.lives <= 0);
      if (defeated && state.event?.clip !== "defeat") play(actor, kind, "defeat");
      let remaining = dt;
      if (state.event) {
        state.event.time += dt;
        state.clip = state.event.clip; state.time = state.event.time; state.face = state.event.face;
        const end = duration(kind, state.clip);
        if (state.clip === "defeat" || state.time < end) return;
        remaining = state.time - end;
        state.event = null;
      }
      const speed = Math.abs(actor.vx ?? actor.speed ?? 0);
      let clip = "idle";
      if (hints.windup && info.clips.windup) clip = "windup";
      else if (info.clips.jump && ((kind === "player" && !actor.onGround) || (kind === "boss" && Math.abs(actor.vy) > 45))) clip = actor.vy < 0 ? "jump" : "fall";
      else if (speed > (kind === "player" ? 45 : 3)) clip = "run";
      if (state.clip !== clip) { state.clip = clip; state.time = info.clips[clip].loop ? state.phase * duration(kind, clip) : 0; }
      const rate = clip === "run" ? (kind === "player" ? Math.max(0.65, Math.min(1.35, speed / 360)) : Math.max(0.65, Math.min(1.5, speed / 105))) : 1;
      state.time += remaining * rate;
      state.face = actor.face ?? actor.dir ?? 1;
    }
    function snapshot(actor, kind) {
      const state = ensure(actor, kind), info = atlas(kind), spec = info?.clips?.[state.clip];
      if (!spec) return null;
      const elapsed = reducedMotion && state.clip === "idle" ? 0 : state.time;
      const progress = Math.max(0, Math.floor((elapsed + 1e-9) * spec.fps));
      const local = spec.loop ? progress % spec.count : Math.min(spec.count - 1, progress);
      return { clip: state.clip, time: state.time, frame: spec.start + local, face: state.face,
        complete: !spec.loop && state.time + 1e-9 >= spec.count / spec.fps };
    }
    function rect(actor, kind, body) {
      const pose = snapshot(actor, kind), info = atlas(kind);
      if (!pose || !info) return null;
      const frame = info.frames[pose.frame], [x,y,w,h] = frame.crop, [cx,cy,cw,ch] = frame.content;
      const scale = body.h / info.referenceHeight;
      return { pose, crop: [x,y,w,h], exclude: frame.exclude || [], scale, x: body.x + body.w / 2 - (cw / 2 + cx - x) * scale,
        y: body.y + body.h - (ch + cy - y) * scale, w: w * scale, h: h * scale, contentHeight: ch * scale };
    }
    function draw(ctx, actor, kind, body) {
      const image = images[kind], frame = image && rect(actor, kind, body);
      if (!frame) return false;
      ctx.save();
      ctx.translate(frame.x + (frame.pose.face < 0 ? frame.w : 0), frame.y);
      if (frame.pose.face < 0) ctx.scale(-1, 1);
      if (frame.exclude.length) {
        ctx.beginPath(); ctx.rect(0, 0, frame.w, frame.h);
        for (const [x,y,w,h] of frame.exclude) ctx.rect(x * frame.scale, y * frame.scale, w * frame.scale, h * frame.scale);
        ctx.clip("evenodd");
      }
      ctx.drawImage(image, ...frame.crop, 0, 0, frame.w, frame.h);
      ctx.restore();
      return true;
    }
    async function load(loadImage) {
      await Promise.all(Object.entries(data?.atlases || {}).map(async ([kind, info]) => {
        if (images[kind]) return;
        try {
          const image = await loadImage(info.url);
          if (image && image.width === info.width && image.height === info.height) images[kind] = image;
        } catch (_) { /* Game rendering provides a per-actor fallback; later starts can retry. */ }
      }));
    }
    return { load, play, cancel, update, snapshot, rect, draw, duration,
      reset: actor => { if (actor) states.delete(actor); else states = new WeakMap(); },
      has: kind => Boolean(images[kind]),
      finished: (actor, kind) => { const pose = snapshot(actor, kind); return pose?.clip === "defeat" && pose.complete; },
      reduceMotion: value => { reducedMotion = !!value; } };
  }
  return Object.freeze({ create, data });
});
