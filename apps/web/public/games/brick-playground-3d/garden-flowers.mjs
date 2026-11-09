import { blockIndex, blockInfo, BLOCKS, neighbouring } from './settlement.mjs';
import { size } from './model.mjs';
import { FLOWERS, GROW_MS, flowerStage } from './community-garden.mjs';

export function gardenFlowers(B, scene, box, mat) {
  const templates = new Map(),
    visible = new Map();
  let held = null,
    prior = null,
    nextBloom = Infinity;
  function flowerMesh(flower, stage) {
    const key = flower + ' ' + stage;
    if (templates.has(key)) return templates.get(key);
    const pieces = [],
      { petal, centre } = FLOWERS[flower];
    function brick(x, y, z, w, h, d, colour, angle = 0) {
      const m = box('Flower brick', x, y, z, w, h, d, '#ffffff'),
        c = B.Color3.FromHexString(colour),
        colours = [];
      for (let i = 0; i < m.getTotalVertices(); i++) colours.push(c.r, c.g, c.b, 1);
      m.setVerticesData(B.VertexBuffer.ColorKind, colours);
      m.rotation.y = angle;
      pieces.push(m);
      return m;
    }
    if (stage === 'display') brick(0, 0.14, 0, 0.4, 0.28, 0.33, '#388b90');
    for (const [x, z, height] of [
      [-0.32, -0.16, 0.8],
      [0.29, -0.12, 0.65],
      [0.03, 0.27, 0.94]
    ]) {
      const h = stage === 'seed' ? 0.19 : stage === 'growing' ? height * 0.65 : height;
      brick(x, h / 2, z, 0.09, h, 0.09, '#367343');
      brick(x + 0.11, h * 0.57, z, 0.23, 0.07, 0.1, '#6ea544').rotation.z = 0.38;
      if (stage === 'seed') continue;
      if (stage === 'growing') {
        brick(x, h, z, 0.18, 0.18, 0.18, '#96b34f');
        continue;
      }
      const daisy = flower === 'daisy',
        n = daisy ? 8 : 6;
      for (let i = 0; i < n; i++) {
        const a = (i * 2 * Math.PI) / n,
          radius = daisy ? 0.17 : 0.13;
        brick(
          x + Math.sin(a) * radius,
          h,
          z + Math.cos(a) * radius,
          daisy ? 0.105 : 0.17,
          daisy ? 0.075 : 0.15,
          daisy ? 0.24 : 0.17,
          petal,
          a
        );
      }
      if (!daisy) {
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + 0.4;
          brick(
            x + 0.085 * Math.sin(a),
            h + 0.09,
            z + 0.085 * Math.cos(a),
            0.12,
            0.1,
            0.15,
            '#ffbf45',
            a
          );
        }
      }
      brick(x, h + (daisy ? 0.065 : 0.15), z, 0.14, 0.08, 0.14, centre);
    }
    const mesh = B.Mesh.MergeMeshes(pieces, true, true);
    mesh.material = mat('#ffffff');
    mesh.isVisible = false;
    mesh.isPickable = false;
    mesh.name = 'Garden template ' + key;
    templates.set(key, mesh);
    return mesh;
  }
  function update(city, focus, now) {
    const state = city.garden;
    if (
      prior &&
      prior.state === state &&
      prior.parts === city.pieces &&
      prior.blocks === city.blocks &&
      prior.focus === focus &&
      now < nextBloom
    )
      return;
    prior = { state, parts: city.pieces, blocks: city.blocks, focus };
    nextBloom = Infinity;
    const alive = new Set();
    if (state && focus) {
      const plants = new Map(state.plants.map((p) => [p.id, p])),
        displays = new Map(state.displays.map((p) => [p.id, p]));
      const index = blockIndex(city.pieces);
      for (const b of BLOCKS) {
        if (!neighbouring(b, focus) || blockInfo(city, b).zone !== 'park') continue;
        for (const p of index[b.id]) {
          const item =
            p.type === 'pot' ? plants.get(p.id) : p.type === 'bench' ? displays.get(p.id) : null;
          if (!item) continue;
          const stage = p.type === 'bench' ? 'display' : flowerStage(item, now);
          if (stage === 'growing') nextBloom = Math.min(nextBloom, item.watered + GROW_MS);
          const template = flowerMesh(item.flower, stage);
          let mesh = visible.get(p.id);
          if (mesh?.sourceMesh !== template) {
            mesh?.dispose();
            mesh = template.createInstance('Garden ' + stage + ' ' + p.id);
            mesh.isPickable = false;
            visible.set(p.id, mesh);
          }
          const { w, h, d } = size(p);
          mesh.position.set(p.x + w / 2, p.y + h + 0.02, p.z + d / 2);
          mesh.rotation.y = (-p.r * Math.PI) / 2;
          mesh.scaling.setAll(stage === 'display' ? 0.67 : 1);
          alive.add(p.id);
        }
      }
    }
    for (const [id, mesh] of visible)
      if (!alive.has(id)) {
        mesh.dispose();
        visible.delete(id);
      }
  }
  function carry(flower, parent) {
    const source = flower && flowerMesh(flower, 'bloom');
    if (held?.sourceMesh === source) return;
    held?.dispose();
    held = null;
    if (!source) return;
    held = source.createInstance('Carried garden bouquet');
    held.parent = parent;
    held.isPickable = false;
    held.position.set(0.25, 0.68, 0.32);
    held.scaling.setAll(0.65);
    held.rotation.z = -0.2;
  }
  function close() {
    carry(null, null);
    for (const mesh of visible.values()) mesh.dispose();
    for (const mesh of templates.values()) mesh.dispose();
    visible.clear();
    templates.clear();
    prior = null;
  }
  return {
    update,
    close,
    carry,
    get holding() {
      return !!held;
    }
  };
}
