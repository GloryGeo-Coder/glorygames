(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RecycleSprites = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const sheets = {
    circuit: { src: 'assets/animated/circuit-atlas.webp', columns: 4, rows: 4, clips: { idle: [0, 1, 0, 2, 0, 3], walk: [4, 5, 6, 7], collect: [8, 9, 10, 11], prepare: [8, 9, 10, 11], sort: [12, 13, 15, 12], celebrate: [12, 14, 15, 14], worried: [2, 0] } },
    grime: { src: 'assets/animated/grime-atlas.webp', columns: 4, rows: 2, clips: { idle: [0, 1, 2, 3], hurt: [4, 5, 6, 7] } }
  };
  const cache = new Map();
  function frameAt(type, pose, seconds, reduced = false) {
    const sheet = sheets[type], clip = sheet.clips[pose] || sheet.clips.idle;
    const fps = pose === 'idle' ? 2 : 7;
    return clip[reduced ? 0 : Math.floor(Math.max(0, seconds) * fps) % clip.length];
  }
  function rect(type, frame) {
    const sheet = sheets[type];
    if (!Number.isInteger(frame) || frame < 0 || frame >= sheet.columns * sheet.rows) return null;
    return { x: frame % sheet.columns * 256, y: Math.floor(frame / sheet.columns) * 256, width: 256, height: 256 };
  }
  function load(type) {
    if (!cache.has(type)) cache.set(type, new Promise(resolve => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = () => resolve(null); image.src = sheets[type].src;
    }));
    return cache.get(type);
  }
  function create(canvas, type) {
    const ctx = canvas.getContext('2d'); let image, last = '';
    canvas.width = 256; canvas.height = 256;
    load(type).then(value => { image = value; if (image) canvas.parentElement.classList.add('sprite-ready'); });
    return { paint(pose, seconds, reduced = false) {
      if (!image || !ctx) return;
      const frame = frameAt(type, pose, seconds, reduced);
      if (last === String(frame)) return;
      last = String(frame); const source = rect(type, frame);
      ctx.clearRect(0, 0, 256, 256); ctx.drawImage(image, source.x, source.y, 256, 256, 0, 0, 256, 256);
      canvas.dataset.frame = String(frame);
    } };
  }
  return { sheets, frameAt, rect, create, load };
});
