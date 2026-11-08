// Batch coloured surfaces by joint so braid strands, seams and fasteners can share a draw call.
export function surface(B, scene) {
  const positions = [],
    indices = [],
    colors = [],
    uvs = [];
  const colorCache = new Map();
  function vertex(x, y, z, hex, u = 0, v = 0) {
    let c = colorCache.get(hex);
    if (!c) {
      c = B.Color3.FromHexString(hex);
      colorCache.set(hex, c);
    }
    positions.push(x, y, z);
    colors.push(c.r, c.g, c.b, 1);
    uvs.push(u, v);
  }
  function join(start, count, rows, seam = false) {
    const stride = seam ? count + 1 : count;
    for (let j = 0; j < rows - 1; j++)
      for (let i = 0; i < count; i++) {
        const a = start + j * stride + i,
          b = start + j * stride + (seam ? i + 1 : (i + 1) % count);
        indices.push(a, a + stride, b, b + stride, b, a + stride);
      }
  }
  // Rows ascend from chin to crown, or from hem to collar. The seam faces backwards.
  function profile(x, z, rows, color, n = 20, seam = false) {
    const start = positions.length / 3,
      min = rows[0][0],
      height = rows.at(-1)[0] - min;
    for (const [y, rx, rz, shift = 0] of rows) {
      for (let i = 0; i < (seam ? n + 1 : n); i++) {
        const a = (i / n - 0.5) * 2 * Math.PI;
        vertex(
          x + rx * Math.sin(a),
          y,
          z + shift + rz * Math.cos(a),
          color,
          i / n,
          (y - min) / height
        );
      }
    }
    join(start, n, rows.length, seam);
    // Flat end faces need their own rim normals to keep shoe soles and hems crisp.
    for (const end of [0, rows.length - 1]) {
      const [y, rx, rz, shift = 0] = rows[end];
      if (Math.min(rx, rz) < 0.002) continue;
      const center = positions.length / 3;
      vertex(x, y, z + shift, color, 0.5, end ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const a = (i / n - 0.5) * 2 * Math.PI;
        vertex(x + rx * Math.sin(a), y, z + shift + rz * Math.cos(a), color, i / n, end ? 1 : 0);
      }
      for (let i = 0; i < n; i++) {
        const a = center + 1 + i,
          b = center + 1 + ((i + 1) % n);
        if (end) indices.push(center, b, a);
        else indices.push(center, a, b);
      }
    }
  }
  function oval(x, y, z, w, h, d, color, n = 14, bands = 8) {
    const rows = [];
    for (let j = 0; j <= bands; j++) {
      const angle = (j / bands - 0.5) * Math.PI,
        r = Math.max(0.001, Math.cos(angle));
      rows.push([y + h * Math.sin(angle), w * r, d * r]);
    }
    profile(x, z, rows, color, n);
  }
  function cord(coords, radius, color, sides = 6) {
    const start = positions.length / 3,
      points = coords.map((p) => B.Vector3.FromArray(p));
    let ref;
    points.forEach((p, i) => {
      const t = points[Math.min(i + 1, points.length - 1)]
        .subtract(points[Math.max(i - 1, 0)])
        .normalize();
      if (!ref) ref = Math.abs(t.x) < 0.85 ? B.Axis.X : B.Axis.Z;
      const u = ref.subtract(t.scale(B.Vector3.Dot(ref, t))).normalize();
      const v = B.Vector3.Cross(t, u);
      ref = u;
      const r = Array.isArray(radius) ? radius[i] : radius;
      for (let k = 0; k < sides; k++) {
        const a = (k * 2 * Math.PI) / sides;
        const n = p.add(u.scale(r * Math.cos(a))).add(v.scale(r * Math.sin(a)));
        vertex(n.x, n.y, n.z, color);
      }
    });
    join(start, sides, points.length);
  }
  function panel(left, right, color) {
    for (const reverse of [false, true]) {
      const start = positions.length / 3;
      for (let i = 0; i < left.length; i++) {
        vertex(...left[i], color);
        vertex(...right[i], color);
        if (i) {
          const a = start + 2 * i;
          if (reverse) indices.push(a - 1, a, a - 2, a + 1, a, a - 1);
          else indices.push(a - 2, a, a - 1, a - 1, a, a + 1);
        }
      }
    }
  }
  function mesh(name, parent, material) {
    const m = new B.Mesh(name, scene),
      data = new B.VertexData(),
      normals = [];
    B.VertexData.ComputeNormals(positions, indices, normals);
    Object.assign(data, { positions, indices, normals, colors, uvs });
    data.applyToMesh(m);
    m.parent = parent;
    m.material = material;
    m.isPickable = false;
    m.receiveShadows = true;
    return m;
  }
  return { profile, oval, cord, panel, mesh };
}
