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
export function cityScene(B, scene, box, mat) {
  const lots = [],
    land = [],
    roads = [],
    distant = new Map();
  let grid,
    lastStreets,
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
  function open() {
    land.push(box('Grassland', 0, -0.8, 0, 660, 1.25, 660, '#88a86d'));
    // Low hills frame the map without occupying any buildable ground.
    const hills = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI) / 12,
        radius = 158 + (i % 3) * 9;
      const hill = B.MeshBuilder.CreateSphere('Ridge', { segments: 6 }, scene);
      hill.position.set(Math.cos(angle) * radius, -4, Math.sin(angle) * radius);
      hill.scaling.set(42 + (i % 4) * 5, 11 + (i % 3) * 4, 40);
      hill.material = mat('#75966b');
      hill.isPickable = false;
      hills.push(hill);
    }
    const ridge = B.Mesh.MergeMeshes(hills, true, true);
    ridge.isPickable = false;
    land.push(ridge);
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
    clear(land);
    clear(lots);
    clear(roads);
    grid?.dispose();
    grid = null;
    for (const mesh of distant.values()) mesh.dispose();
    distant.clear();
    lastStreets = lastBlocks = lastItems = lastBlock = null;
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
  function sector(city, b) {
    if (lastStreets !== city.streets) {
      layStreets(city.streets);
      lastStreets = city.streets;
    }
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
  return { open, close, sector };
}
