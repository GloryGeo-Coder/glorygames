/* Arcade presentation only. No scoring, spawning, collisions or save writes. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RecycleArcadeArt = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const base = 'assets/arcade/';
  const icons = Object.fromEntries(['magnet', 'slow', 'shield', 'double', 'life', 'star', 'combo', 'medal'].map(id => [id, base + id + '.webp']));
  const bosses = ['hallway-sludge', 'curbside-crawler', 'the-bog', 'coin-op-chaos', 'the-sorter', 'landfill-leviathan', 'circuit-storm', 'great-grime'].map((id, index) => ({ id, sheet: base + (index < 4 ? 'bosses-a.webp' : 'bosses-b.webp'), row: index % 4 }));
  const variants = {
    paper: ['newspaper', 'box-flat'], plastic: ['bottle', 'tray-empty'], organic: ['peel', 'apple'],
    glass: ['glass'], metal: ['can'], ewaste: ['radio'], hazmat: ['battery'], textiles: ['shirt']
  };
  const assetPaths = [...new Set(bosses.map(boss => boss.sheet)), ...Object.values(icons), ...new Set(Object.values(variants).flat().map(id => 'assets/animated/' + id + '.webp'))];
  function bossFrame(index, pose, time, reduced = false) {
    const boss = bosses[Math.max(0, Math.min(7, index | 0))];
    const clip = pose === 'hurt' ? [3] : pose === 'attack' ? [1, 0, 1, 0] : [0, 2, 0, 2];
    const frame = clip[reduced ? 0 : Math.floor(Math.max(0, time) * (pose === 'attack' ? 6 : 3)) % clip.length];
    return { src: boss.sheet, frame, x: frame * 256, y: boss.row * 256, width: 256, height: 256 };
  }
  function itemArt(category, serial = 0) {
    const list = variants[category];
    return list ? 'assets/animated/' + list[Math.abs(serial | 0) % list.length] + '.webp' : null;
  }
  function bossLayout(width, height, line) {
    const size = Math.max(36, Math.min(180, width * .28, Math.max(36, line * .62), height * .65));
    return { x: width - size * .6 - 12, y: Math.max(4, Math.min(height * .08, line - size - 8)), size };
  }
  function create(ctx, image, preferences, sprites) {
    let events = [], heroPose = 'idle', heroUntil = 0, attackAt = -10;
    const reduced = () => !!preferences().reducedMotion;
    function round(x, y, w, h, radius, fill, stroke) {
      const r = Math.max(0, Math.min(radius, w / 2, h / 2));
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
      if (fill) ctx.fill(); if (stroke) ctx.stroke();
    }
    function icon(src, x, y, w, h, fallback) {
      const art = image(src) || image(fallback);
      if (art) { ctx.drawImage(art, x, y, w, h); return true; }
      return false;
    }
    function emit(kind, data, time) {
      events.push({ kind, ...data, at: time, life: reduced() ? .22 : kind === 'sort' ? .65 : .8 });
      if (events.length > 16) events = events.slice(-16);
      if (kind === 'sort' || kind === 'power') { heroPose = 'celebrate'; heroUntil = time + .8; }
      if (kind === 'collect') { heroPose = 'collect'; heroUntil = time + .5; }
      if (kind === 'mistake') { heroPose = 'worried'; heroUntil = time + 1; }
      if (kind === 'attack') attackAt = time;
    }
    function advance(time) { events = events.filter(event => time - event.at < event.life); }
    function reset() { events = []; heroPose = 'idle'; heroUntil = 0; attackAt = -10; }
    function backdrop(width, height, progress, color, time) {
      ctx.save();
      const shade = ctx.createLinearGradient(0, 0, 0, height);
      shade.addColorStop(0, 'rgba(3,19,28,.16)'); shade.addColorStop(.6, 'rgba(3,19,28,.02)'); shade.addColorStop(1, 'rgba(3,19,28,.50)');
      ctx.fillStyle = shade; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = `rgba(5,15,24,${.22 * (1 - progress)})`; ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = color + '44'; ctx.lineWidth = 2; round(3, 3, width - 6, height - 6, 18, false, true);
      if (!reduced()) for (let i = 0; i < 6; i++) {
        const x = i % 2 ? width - 9 - i * 2 : 9 + i * 2, y = (i * 71 + time * (5 + i)) % Math.max(1, height - 30) + 10;
        ctx.fillStyle = color + '55'; ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    function bin(b, category, selected, progress) {
      ctx.save();
      ctx.shadowColor = selected ? category.color : '#00141c'; ctx.shadowBlur = selected ? 12 : 4;
      const body = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h); body.addColorStop(0, '#284e53'); body.addColorStop(1, '#0a242e');
      ctx.fillStyle = body; ctx.strokeStyle = selected ? category.color : '#9dc9c966'; ctx.lineWidth = selected ? 3 : 1;
      round(b.x + 1, b.y + 1, b.w - 2, b.h - 2, 10, true, true); ctx.shadowBlur = 0;
      ctx.fillStyle = category.color; ctx.globalAlpha = .18; round(b.x + 4, b.y + b.h - 5 - (b.h - 10) * progress, b.w - 8, (b.h - 10) * progress, 6, true, false); ctx.globalAlpha = 1;
      const lift = reduced() ? 0 : Math.sin(Math.min(1, b.lid / .22) * Math.PI) * 3;
      ctx.fillStyle = category.color; round(b.x + 5, b.y + 3 - lift, b.w - 10, 5, 3, true, false);
      icon(category.icon, b.x + b.w / 2 - 14, b.y + 8, 28, 28, category.fallback);
      ctx.fillStyle = '#f1fff6'; ctx.font = `800 ${Math.max(9, Math.min(12, (b.w - 8) / (category.label.length * .65)))}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(category.label, b.x + b.w / 2, b.y + b.h - 6);
      if (selected) { ctx.fillStyle = '#fff4b0'; ctx.font = '900 12px system-ui'; ctx.fillText('✓', b.x + b.w - 10, b.y + 19); }
      ctx.restore();
    }
    function tile(item, category, selected, fallback) {
      const color = category.color, angle = reduced() ? 0 : Math.sin(item.age * 2.2) * .045;
      ctx.save(); ctx.translate(item.x + item.w / 2, item.y + item.h / 2); ctx.rotate(angle);
      ctx.fillStyle = item.kind === 'power' ? '#403b1ee8' : '#082a32d9'; ctx.strokeStyle = selected ? '#fff2a0' : color + '99'; ctx.lineWidth = selected ? 3 : 1.5;
      ctx.shadowColor = '#001018'; ctx.shadowBlur = 5; round(-item.w / 2, -item.h / 2, item.w, item.h, 11, true, true); ctx.shadowBlur = 0;
      const source = item.kind === 'power' ? icons[item.power] : item.art || category.icon;
      if (!icon(source, -item.w / 2, -item.h / 2, item.w, item.h, image(category.icon) ? category.icon : fallback)) {
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, -3, item.w * .2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '800 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText(category.label, 0, item.h * .33);
      }
      ctx.restore();
    }
    function circuit(width, height, line, time) {
      const sheet = image('assets/animated/circuit-atlas.webp'), S = sprites();
      if (!sheet || !S || height < 110) return;
      const size = Math.min(132, Math.max(42, width * .17), line * .65), pose = time < heroUntil ? heroPose : 'idle';
      const frame = S.frameAt('circuit', pose, time, reduced()), r = S.rect('circuit', frame);
      const x = 7, y = Math.max(8, line - size - 8);
      ctx.save(); ctx.globalAlpha = .95; ctx.drawImage(sheet, r.x, r.y, 256, 256, x, y, size, size); ctx.restore();
    }
    function boss(index, b, color, time, fallback) {
      const pose = b.hurt > 0 ? 'hurt' : time - attackAt < .7 ? 'attack' : 'idle', r = bossFrame(index, pose, time, reduced());
      const sheet = image(r.src), size = b.size;
      ctx.save(); ctx.globalAlpha = b.hp > 0 ? 1 : .38;
      ctx.fillStyle = color + '18'; ctx.beginPath(); ctx.ellipse(b.x, b.y + size * .85, size * .48, size * .12, 0, 0, Math.PI * 2); ctx.fill();
      if (sheet) ctx.drawImage(sheet, r.x, r.y, 256, 256, b.x - size / 2, b.y, size, size);
      else icon(fallback, b.x - size / 2, b.y, size, size);
      ctx.restore();
    }
    function feedback(time) {
      for (const event of events) {
        if (event.kind === 'collect' || event.kind === 'attack') continue;
        const t = Math.max(0, Math.min(1, (time - event.at) / event.life));
        ctx.save(); ctx.globalAlpha = 1 - t; ctx.strokeStyle = event.color || '#ffe1a3'; ctx.fillStyle = event.color || '#ffe1a3'; ctx.lineWidth = 2;
        if (event.kind === 'sort' && !reduced()) {
          const x = event.x + (event.toX - event.x) * t, y = event.y + (event.toY - event.y) * t - Math.sin(t * Math.PI) * 24;
          ctx.beginPath(); ctx.arc(x, y, 5 - t * 3, 0, Math.PI * 2); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(event.toX ?? event.x, event.toY ?? event.y, 10 + (reduced() ? 0 : t * 20), 0, Math.PI * 2); ctx.stroke();
        if (event.text) { ctx.font = '900 13px system-ui'; ctx.textAlign = 'center'; ctx.fillText(event.text, event.x, event.y - (reduced() ? 0 : t * 18)); }
        ctx.restore();
      }
    }
    return { emit, advance, reset, backdrop, bin, tile, circuit, boss, feedback, get eventCount() { return events.length; } };
  }
  return { icons, bosses, variants, assetPaths, bossFrame, itemArt, bossLayout, create };
});
