/* Stationary full-bleed paintings. Keep at most two decoded scenes in memory. */
(() => {
  "use strict";
  const scenes = ["neon-canal", "conduit-hall", "skybridge", "sentinel-yard", "signal-spire"];
  function cover(iw, ih, w, h) { const scale = Math.max(w / iw, h / ih); const dw = Math.max(w, iw * scale), dh = Math.max(h, ih * scale); return { x: (w - dw) / 2, y: (h - dh) / 2, w: dw, h: dh }; }
  function create(ImageClass) {
    const cache = new Map(); let selected = "";
    return {
      select(index) {
        selected = scenes[((index % scenes.length) + scenes.length) % scenes.length];
        if (!ImageClass || cache.has(selected)) return;
        const key = selected, entry = { image: new ImageClass(), ready: false }; cache.set(key, entry);
        entry.image.onload = () => { if (cache.get(key) === entry) entry.ready = entry.image.naturalWidth > 0 && entry.image.naturalHeight > 0; };
        entry.image.onerror = () => { entry.ready = false; };
        entry.image.src = `./assets/backgrounds/${key}.png`;
        while (cache.size > 2) { const key = cache.keys().next().value, old = cache.get(key); old.image.onload = old.image.onerror = null; cache.delete(key); }
      },
      draw(ctx, w, h) {
        const entry = cache.get(selected); if (!entry?.ready) return false;
        const r = cover(entry.image.naturalWidth, entry.image.naturalHeight, w, h);
        ctx.drawImage(entry.image, r.x, r.y, r.w, r.h);
        ctx.fillStyle = "rgba(3,8,26,.52)"; ctx.fillRect(0, 0, w, h);
        return true;
      },
      get size() { return cache.size; }, get selected() { return selected; }
    };
  }
  const api = { scenes, cover, create };
  if (typeof window !== "undefined") window.BrickScenery = api;
  if (typeof module !== "undefined") module.exports = api;
})();
