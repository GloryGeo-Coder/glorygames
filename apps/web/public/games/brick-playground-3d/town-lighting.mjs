import { darkness, streetLamps, LIGHT_RANGE } from './street-lighting.mjs';
export function townLighting(B, scene, sky, sun) {
  const hex = B.Color3.FromHexString;
  const day = hex('#c5ebef'),
    dusk = hex('#dc9f8f'),
    night = hex('#253657');
  const white = hex('#ffffff'),
    warm = hex('#ffd09a'),
    moon = hex('#bdcdeb');
  let tone = -1,
    lastLamps = null,
    bulbs,
    pools,
    lamps = [],
    focusX = Infinity,
    focusZ = Infinity;
  const lights = [];
  function palette(t) {
    if (t === tone) return;
    tone = t;
    const blend = (a, b, c) =>
      t < 0.5 ? B.Color3.Lerp(a, b, t * 2) : B.Color3.Lerp(b, c, t * 2 - 1);
    const color = blend(day, dusk, night);
    scene.clearColor = new B.Color4(color.r, color.g, color.b, 1);
    scene.fogColor = color;
    sky.diffuse = B.Color3.Lerp(white, moon, t);
    sun.diffuse = blend(white, warm, moon);
    sky.intensity = 0.68 - 0.3 * t;
    sun.intensity = 0.76 - 0.58 * t;
  }
  function geometry() {
    bulbs = B.MeshBuilder.CreateBox(
      'Streetlamp glass',
      { width: 0.73, height: 0.44, depth: 0.73 },
      scene
    );
    const glass = new B.StandardMaterial('Lantern glass', scene);
    glass.diffuseColor = hex('#fff1bd');
    bulbs.material = glass;
    pools = B.MeshBuilder.CreateGround('Streetlamp pools', { width: 2, height: 2 }, scene);
    const texture = new B.DynamicTexture('Lantern falloff', 128, scene, false);
    const ctx = texture.getContext(),
      g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,216,126,0.84)');
    g.addColorStop(0.48, 'rgba(255,192,99,0.46)');
    g.addColorStop(1, 'rgba(255,177,82,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    texture.hasAlpha = true;
    texture.update();
    const glow = new B.StandardMaterial('Lantern pools', scene);
    glow.disableLighting = true;
    glow.emissiveColor = white;
    glow.diffuseTexture = texture;
    glow.useAlphaFromDiffuseTexture = true;
    glow.disableDepthWrite = true;
    pools.material = glow;
    bulbs.isPickable = pools.isPickable = false;
    for (let i = 0; i < 2; i++) {
      const light = new B.PointLight('Nearby streetlamp ' + i, B.Vector3.Zero(), scene);
      light.diffuse = hex('#ffce7f');
      light.range = LIGHT_RANGE;
      light.falloffType = B.Light.FALLOFF_STANDARD;
      light.setEnabled(false);
      lights.push(light);
    }
  }
  function matrix(x, y, z, s) {
    return [s, 0, 0, 0, 0, 1, 0, 0, 0, 0, s, 0, x, y, z, 1];
  }
  function buffers(next) {
    const glass = [],
      ground = [];
    for (const l of next) {
      glass.push(...matrix(l.x, l.y, l.z, 1));
      if (l.radius > 0) ground.push(...matrix(l.x, 0.036, l.z, l.radius));
    }
    for (const [mesh, arr] of [
      [bulbs, glass],
      [pools, ground]
    ]) {
      mesh.setEnabled(!!arr.length);
      if (arr.length) mesh.thinInstanceSetBuffer('matrix', new Float32Array(arr), 16, true);
    }
  }
  function reset() {
    if (tone >= 0) palette(0);
    tone = -1;
    lastLamps = null;
    focusX = Infinity;
    bulbs?.setEnabled(false);
    pools?.setEnabled(false);
    for (const light of lights) light.setEnabled(false);
  }
  function update(city, x, z) {
    const t = Math.round(darkness(city.lighting, city.clockMinutes) * 48) / 48;
    const changed = t !== tone;
    palette(t);
    const next = streetLamps(city.pieces);
    if (!bulbs && !next.length) return;
    if (!bulbs) geometry();
    const edited = next !== lastLamps;
    if (edited) {
      lastLamps = next;
      buffers(next);
    }
    if (edited || changed) {
      bulbs.material.emissiveColor = hex(t ? '#ffd179' : '#654f2c').scale(t || 0.18);
      pools.material.alpha = 0.68 * t;
      pools.isVisible = t > 0;
    }
    if (edited || changed || Math.hypot(x - focusX, z - focusZ) > 0.75) {
      focusX = x;
      focusZ = z;
      lamps = next
        .filter((l) => Math.hypot(l.x - x, l.z - z) < LIGHT_RANGE * 3)
        .sort((a, b) => (a.x - x) ** 2 + (a.z - z) ** 2 - (b.x - x) ** 2 - (b.z - z) ** 2)
        .slice(0, lights.length);
      lights.forEach((light, i) => {
        const l = lamps[i];
        light.setEnabled(!!l && t > 0);
        if (l) {
          light.position.set(l.x, l.y, l.z);
          light.intensity = 1.6 * t;
        }
      });
    }
  }
  return { update, reset };
}
