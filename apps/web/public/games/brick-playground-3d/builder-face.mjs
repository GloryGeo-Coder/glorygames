// Cylindrical portrait atlas for the sculpted head. The front of the face is centred at u = 0.5.
export function builderFace(B, scene) {
  const texture = new B.DynamicTexture(
    'Builder portrait',
    { width: 512, height: 768 },
    scene,
    false
  );
  const c = texture.getContext();
  function glow(x, y, rx, ry, color) {
    c.save();
    c.translate(x, y);
    c.scale(rx, ry);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(-1, -1, 2, 2);
    c.restore();
  }
  function shape(path, color) {
    c.fillStyle = color;
    c.fill(new Path2D(path));
  }
  function disc(x, y, rx, ry, color) {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    c.fill();
  }
  for (const closed of [false, true]) {
    c.save();
    c.translate(0, closed ? 384 : 0);
    c.fillStyle = '#a55d39';
    c.fillRect(0, 0, 512, 384);
    glow(255, 186, 105, 176, 'rgba(255,176,113,0.42)');
    for (const sign of [-1, 1]) {
      const x = 256 + sign * 51;
      glow(x, 229, 28, 38, 'rgba(182,76,57,0.32)');
      for (const [ox, oy, r] of [
        [-9, 1, 1.15],
        [-3, 6, 1.2],
        [3, 2, 1.5],
        [8, 8, 0.95],
        [12, -1, 1.0],
        [-4, -4, 0.85]
      ])
        disc(x + sign * ox, 222 + oy, r, r, '#965032');
      c.save();
      c.translate(256, 0);
      c.scale(sign, 1);
      // The stronger outer lash, amber iris and catchlights remain readable at phone size.
      if (closed) shape('M 10 182 Q 36 201 62 166 Q 56 191 34 194 Q 16 194 10 182 Z', '#533223');
      else {
        shape(
          'M 9 178 C 10 149 23 133 39 135 Q 59 135 65 171 Q 58 190 44 198 Q 23 208 11 191 Z',
          '#472825'
        );
        shape(
          'M 12 178 C 13 153 25 140 39 141 Q 57 141 62 171 Q 54 190 41 195 Q 23 204 14 189 Z',
          '#fff2dc'
        );
        c.save();
        c.clip(
          new Path2D(
            'M 12 178 C 13 153 25 140 39 141 Q 57 141 62 171 Q 54 190 41 195 Q 23 204 14 189 Z'
          )
        );
        c.translate(sign * 2, 0);
        disc(32, 174, 17, 24, '#482717');
        disc(32, 177, 14, 20, '#956536');
        disc(31, 172, 10.5, 16.5, '#241b19');
        disc(27, 164, 4.5, 6.2, '#fff9e8');
        disc(37, 182, 2, 2.8, '#f3cfa9');
        c.restore();
        shape('M 56 150 Q 65 158 70 149 Q 68 162 61 165 Z', '#422622');
      }
      shape(
        'M 10 123 C 23 110 37 108 49 113 Q 60 119 63 132 Q 65 137 61 136 C 46 122 29 120 15 134 Q 9 135 10 123 Z',
        '#472b24'
      );
      c.restore();
    }
    // A wide asymmetric smile with a single tooth band and a warm lower lip.
    shape(
      'M 202 259 Q 244 280 269 268 Q 295 260 308 243 Q 300 286 280 308 Q 259 330 236 315 Q 214 302 202 259 Z',
      '#703528'
    );
    shape(
      'M 205 262 Q 256 285 304 249 Q 298 284 277 305 Q 256 325 236 310 Q 215 297 205 262 Z',
      '#421f20'
    );
    shape('M 206 262 Q 257 283 303 249 L 297 264 Q 259 296 218 277 Z', '#ffead3');
    shape('M 238 307 Q 252 286 272 288 Q 282 288 282 295 Q 262 319 244 312 Z', '#cf7065');
    glow(257, 324, 17, 6, 'rgba(239,146,112,0.4)');
    c.restore();
  }
  texture.update(true);
  texture.vScale = 0.5;
  texture.vOffset = 0.5;
  const m = new B.StandardMaterial('Builder skin and expression', scene);
  m.diffuseTexture = texture;
  m.emissiveColor = new B.Color3(0.074, 0.035, 0.015);
  m.specularColor = new B.Color3(0.06, 0.045, 0.04);
  return m;
}
