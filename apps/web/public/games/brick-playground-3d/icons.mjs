import { TYPES, parts } from './model.mjs';
// Orthographic miniatures use the same frame, staircase and ramp profiles as the plot.
export function miniature(type, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 112;
  canvas.height = 62;
  const ctx = canvas.getContext('2d'),
    { w, d, h } = TYPES[type],
    k = Math.min(90 / (w + d), 47 / (h + 0.37 * (w + d)));
  const at = (x, y, z) => [
    56 + (x - z - (w - d) / 2) * k,
    31 + ((x + z - (w + d) / 2) * 0.37 - y + h / 2) * k
  ];
  function face(vertices, tint) {
    ctx.beginPath();
    vertices.forEach(([x, y, z], i) => ctx[i ? 'lineTo' : 'moveTo'](...at(x, y, z)));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = tint;
    ctx.fill();
    ctx.strokeStyle = '#24393355';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (const s of parts(type)) {
    const x = s.x,
      X = x + s.w,
      y = s.y,
      Y = y + s.h,
      z = s.z,
      Z = z + s.d,
      L = s.detail === 'ramp' ? y : Y;
    face(
      [
        [X, y, z],
        [X, y, Z],
        [X, Y, Z],
        [X, Y, z]
      ],
      '#0002'
    );
    face(
      [
        [x, y, Z],
        [X, y, Z],
        [X, Y, Z],
        [x, L, Z]
      ],
      '#0004'
    );
    face(
      [
        [x, L, z],
        [X, Y, z],
        [X, Y, Z],
        [x, L, Z]
      ],
      '#fff2'
    );
    if (s.detail !== 'ramp')
      for (let a = Math.ceil(x - 0.5) + 0.5; a < X; a++)
        for (let b = Math.ceil(z - 0.5) + 0.5; b < Z; b++) {
          const [px, py] = at(a, Y + 0.03, b);
          ctx.beginPath();
          ctx.ellipse(px, py, k * 0.24, k * 0.12, 0, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.stroke();
        }
  }
  return canvas;
}
