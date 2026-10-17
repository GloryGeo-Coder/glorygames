/* Shared world-unit sizing. Resizing the display never changes movement or jump physics. */
(function (root) {
  "use strict";
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  // Bounds of the existing PNGs' non-transparent pixels. The source art stays untouched.
  const crops = Object.freeze({
    playerIdle: [277, 77, 645, 1103],
    playerRun: [168, 120, 867, 1023],
    enemy: [172, 82, 886, 1103],
    boss: [0, 0, 1254, 1254],
    taxi: [135, 213, 988, 866],
    coin: [189, 140, 858, 897],
  });
  const sizes = Object.freeze({ playerWidth: 33, playerHeight: 50, coin: 24, collectible: 26, powerupRadius: 14 });

  function viewport(width, height, pixelRatio = 1) {
    width = Math.max(1, width);
    height = Math.max(1, height);
    const scale = Math.min(width / 600, clamp(height / 540, 0.65, 1.25));
    // Limit backing-store work on high-density phones without changing world geometry.
    const dpr = Math.min(2, Math.max(1, pixelRatio), Math.sqrt(3500000 / (width * height)));
    return { width, height, scale, worldWidth: width / scale, worldHeight: height / scale,
      dpr, pixelWidth: Math.max(1, Math.floor(width * dpr)), pixelHeight: Math.max(1, Math.floor(height * dpr)) };
  }

  function camera(player, worldWidth, worldHeight, display, insets = {}) {
    const top = clamp(insets.top || 0, 0, display.height * 0.3);
    const bottom = clamp(insets.bottom || 0, 0, display.height * 0.3);
    const playHeight = (display.height - top - bottom) / display.scale;
    const topWorld = top / display.scale;
    const anchor = player.face < 0 ? 0.6 : 0.4;
    const camX = worldWidth <= display.worldWidth ? (worldWidth - display.worldWidth) / 2
      : clamp(player.x + player.w / 2 - display.worldWidth * anchor, 0, worldWidth - display.worldWidth);
    const camY = worldHeight <= playHeight ? (worldHeight - playHeight) / 2 - topWorld
      : clamp(player.y + player.h / 2 - (topWorld + playHeight * 0.66), -topWorld, worldHeight - playHeight - topWorld);
    return { camX, camY };
  }

  function spriteRect(name, body, mode = "height") {
    const crop = crops[name];
    if (!crop) return null;
    const ratio = crop[2] / crop[3];
    const h = mode === "contain" ? Math.min(body.h, body.w / ratio) : body.h;
    const w = h * ratio;
    return { crop, x: body.x + (body.w - w) / 2, y: body.y + body.h - h, w, h };
  }

  function drawSprite(ctx, img, name, body, face = 1, mode = "height") {
    if (!img) return false;
    const rect = spriteRect(name, body, mode);
    if (!rect) return false;
    ctx.save();
    if (face < 0) {
      ctx.translate(rect.x + rect.w, rect.y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, ...rect.crop, 0, 0, rect.w, rect.h);
    } else ctx.drawImage(img, ...rect.crop, rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
    return true;
  }

  function taxiSize(authoredWidth) {
    const w = Math.max(64, authoredWidth);
    return { w, h: w * crops.taxi[3] / crops.taxi[2] };
  }

  const api = Object.freeze({ viewport, camera, sizes, crops, spriteRect, drawSprite, taxiSize });
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.KasiPresentation = api;
})(typeof window !== "undefined" ? window : globalThis);
