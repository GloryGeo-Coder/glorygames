import { namedSegments } from './street-directory.mjs';
import { gardenFlowers } from './garden-flowers.mjs';
import {
  BLOCKS,
  HALF,
  LOT,
  PITCH,
  ZONES,
  blockInfo,
  blockIndex,
  neighbouring,
  streetSegment
} from './settlement.mjs';
import { PALETTE, size } from './model.mjs';
export function cityScene(B, scene, box, mat, label) {
  const flowers = gardenFlowers(B, scene, box, mat);
  const lots = [],
    land = [],
    roads = [],
    distant = new Map(),
    signs = new Map();
  let grid,
    lastStreets,
    lastNames,
    lastBlocks,
    lastItems,
    lastBlock,
    detail = [];
  function ground(name, x, y, z, w, h, d, color) {
    const mesh = box(name, x, y, z, w, h, d, color);
    mesh.isPickable = true;
    mesh.metadata = { ground: true };
    return mesh;
  }
  function countryside() {
    const mesh = B.MeshBuilder.CreateGround(
      'Highveld',
      { width: 720, height: 720, subdivisions: 72 },
      scene
    );
    const positions = mesh.getVerticesData(B.VertexBuffer.PositionKind),
      normals = [],
      colors = [];
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i],
        z = positions[i + 2];
      const distance = Math.max(Math.abs(x), Math.abs(z)) - HALF - 12;
      const t = Math.max(0, Math.min(1, distance / 60));
      const ridge = (Math.sin(x / 47 + z / 83) + Math.cos(z / 31 - x / 93)) * 0.25 + 0.5;
      positions[i + 1] = -0.32 + t * t * (3 - 2 * t) * (3 + ridge * 24);
      colors.push(0.4 + ridge * 0.09, 0.55 + ridge * 0.08, 0.34 + ridge * 0.08, 1);
    }
    B.VertexData.ComputeNormals(positions, mesh.getIndices(), normals);
    mesh.setVerticesData(B.VertexBuffer.PositionKind, positions);
    mesh.setVerticesData(B.VertexBuffer.NormalKind, normals);
    mesh.setVerticesData(B.VertexBuffer.ColorKind, colors);
    mesh.material = mat('#ffffff');
    mesh.isPickable = false;
    return mesh;
  }
  function open() {
    land.push(countryside());
    land.push(ground('Settlement ground', 0, -0.22, 0, HALF * 2, 0.4, HALF * 2, '#b3c093'));
    for (const b of BLOCKS) {
      lots.push(ground('City block ' + b.code, b.x, -0.08, b.z, LOT, 0.16, LOT, ZONES.mixed.color));
    }
    const lines = [];
    for (let i = -LOT / 2; i <= LOT / 2; i++) {
      lines.push([new B.Vector3(i, 0.012, -LOT / 2), new B.Vector3(i, 0.012, LOT / 2)]);
      lines.push([new B.Vector3(-LOT / 2, 0.012, i), new B.Vector3(LOT / 2, 0.012, i)]);
    }
    grid = B.MeshBuilder.CreateLineSystem('Active block studs', { lines }, scene);
    grid.isPickable = false;
    grid.color = B.Color3.FromHexString('#977e55');
    grid.alpha = 0.6;
  }
  function clear(list) {
    for (const m of list) m.dispose();
    list.length = 0;
  }
  function close() {
    flowers.close();
    clear(land);
    clear(lots);
    clear(roads);
    grid?.dispose();
    grid = null;
    for (const mesh of distant.values()) mesh.dispose();
    distant.clear();
    for (const sign of signs.values()) {
      sign.face.dispose(false, true);
      sign.post.dispose();
    }
    signs.clear();
    lastNames = lastStreets = lastBlocks = lastItems = lastBlock = null;
    detail = [];
  }
  function layStreets(keys) {
    clear(roads);
    const asphalt = [],
      paint = [],
      ends = new Map();
    for (const key of keys) {
      const { x, z, w, d, axis } = streetSegment(key);
      asphalt.push(box('Asphalt', x, -0.012, z, w, 0.028, d, '#54676a'));
      for (const delta of [-8, -4, 0, 4, 8]) {
        paint.push(
          box(
            'Lane marking',
            axis === 'h' ? x + delta : x,
            0.009,
            axis === 'v' ? z + delta : z,
            axis === 'h' ? 1.7 : 0.1,
            0.012,
            axis === 'v' ? 1.7 : 0.1,
            '#fff1bd'
          )
        );
      }
      for (const sign of [-1, 1]) {
        const ex = x + (axis === 'h' ? (PITCH / 2) * sign : 0),
          ez = z + (axis === 'v' ? (PITCH / 2) * sign : 0);
        ends.set(ex + ',' + ez, [ex, ez]);
      }
    }
    for (const [x, z] of ends.values())
      asphalt.push(box('Junction', x, -0.014, z, 4, 0.028, 4, '#54676a'));
    for (const group of [asphalt, paint])
      if (group.length) {
        const mesh = B.Mesh.MergeMeshes(group, true, true);
        mesh.isPickable = false;
        roads.push(mesh);
      }
  }
  function streetSigns(city, focus) {
    // Show one entrance sign per neighbourhood, within the usual detailed city sector.
    const seen = new Set(),
      visible = new Set();
    function place(key, name, x, z, width, height, road) {
      visible.add(key);
      let sign = signs.get(key);
      if (!sign) {
        const face = label(name, 0, height, 0, width, true, road ? '#1c4c72' : undefined);
        if (road) face.name = 'Street sign · ' + name;
        face.billboardMode = B.Mesh.BILLBOARDMODE_Y;
        const post = box(
          road ? 'Street signpost' : 'Neighbourhood signpost',
          0,
          height / 2,
          0,
          0.12,
          height - 0.05,
          0.12,
          '#38554a'
        );
        sign = { face, post };
        signs.set(key, sign);
      }
      sign.face.position.set(x, height, z);
      sign.post.position.set(x, height / 2, z);
    }
    for (const b of BLOCKS) {
      const name = blockInfo(city, b).neighbourhood;
      if (!name || seen.has(name)) continue;
      seen.add(name);
      if (neighbouring(focus, b))
        place('area/' + name, name, b.x - 8, b.z - LOT / 2 - 0.55, 4.4, 1.85, false);
    }
    for (const s of namedSegments(city)) {
      if (Math.abs(s.x - focus.x) > PITCH * 1.5 || Math.abs(s.z - focus.z) > PITCH * 1.5) continue;
      const clamp = (n) => Math.min(HALF - 0.4, Math.max(-HALF + 0.4, n));
      const x = clamp(s.x + (s.axis === 'h' ? 9 : 1.65)),
        z = clamp(s.z + (s.axis === 'v' ? 9 : 1.65));
      place('street/' + s.key + '/' + s.name, s.name, x, z, 2.9, 1.95, true);
    }
    for (const [name, sign] of signs) {
      if (visible.has(name)) continue;
      sign.face.dispose(false, true);
      sign.post.dispose();
      signs.delete(name);
    }
  }
  function sector(city, b) {
    if (lastStreets !== city.streets) {
      layStreets(city.streets);
      lastStreets = city.streets;
    }
    if (lastBlock !== b || lastBlocks !== city.blocks || lastNames !== city.streetNames)
      streetSigns(city, b);
    lastNames = city.streetNames;
    if (lastBlocks !== city.blocks) {
      for (const lot of BLOCKS) lots[lot.id].material = mat(ZONES[blockInfo(city, lot).zone].color);
      lastBlocks = city.blocks;
    }
    if (lastBlock === b && lastItems === city.pieces) return detail;
    grid.position.set(b.x, 0, b.z);
    lastBlock = b;
    lastItems = city.pieces;
    detail = [];
    const buffers = new Map(),
      index = blockIndex(city.pieces);
    for (const cell of BLOCKS) {
      if (neighbouring(b, cell)) {
        for (const p of index[cell.id]) detail.push(p);
        continue;
      }
      for (const p of index[cell.id]) {
        const a = size(p);
        if (!buffers.has(p.color)) buffers.set(p.color, []);
        buffers
          .get(p.color)
          .push(
            a.w,
            0,
            0,
            0,
            0,
            a.h,
            0,
            0,
            0,
            0,
            a.d,
            0,
            p.x + a.w / 2,
            p.y + a.h / 2,
            p.z + a.d / 2,
            1
          );
      }
    }
    for (const [color, mesh] of distant) if (!buffers.has(color)) mesh.setEnabled(false);
    for (const [color, buffer] of buffers) {
      let mesh = distant.get(color);
      if (!mesh) {
        mesh = box('Distant city ' + color, 0, 0, 0, 1, 1, 1, PALETTE[color]);
        mesh.isPickable = false;
        distant.set(color, mesh);
      }
      mesh.thinInstanceSetBuffer('matrix', new Float32Array(buffer), 16, true);
      mesh.setEnabled(true);
    }
    return detail;
  }
  return { open, close, sector, flowers };
}
