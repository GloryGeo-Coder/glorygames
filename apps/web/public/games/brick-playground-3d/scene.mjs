import { transportPoint } from './transport.mjs';
import { residentFigure } from './resident-figure.mjs';
import { townLighting } from './town-lighting.mjs';
import { builder } from './builder.mjs';
import { cityScene } from './city-scene.mjs';
import { COUNTER, FLAT } from './upstairs.mjs';
import { BAY_Z, BAY_WIDTH, BAY_DEPTH, cargoCount, openBed } from './freight.mjs';
import { LOTS, STATIONS } from './district.mjs';
import { PIVOTS, FERRY, hingeAngle, mountOf } from './canal.mjs';
import { CHASSIS_TOP, TYRES, GATES, GATE_HALF_WIDTH } from './vehicle.mjs';
import { TYPES, PALETTE, parts, size, hasChannel } from './model.mjs';
const B = window.BABYLON,
  V = (x, y, z) => new B.Vector3(x, y, z);
export function studio(canvas) {
  const engine = new B.Engine(canvas, true, {
    stencil: true,
    preserveDrawingBuffer: false
  });
  engine.setHardwareScalingLevel(Math.max(0.85, Math.min(1.6, window.devicePixelRatio / 1.6)));
  const scene = new B.Scene(engine),
    mats = new Map(),
    templates = new Map(),
    pieces = new Map();
  const hex = B.Color3.FromHexString;
  scene.clearColor = B.Color4.FromHexString('#c5ebefff');
  scene.fogMode = B.Scene.FOGMODE_EXP2;
  scene.fogColor = hex('#c5ebef');
  scene.fogDensity = 0.004;
  scene.skipPointerMovePicking = true;
  const camera = new B.FreeCamera('View', V(0, 25, -22), scene);
  camera.minZ = 0.07;
  camera.maxZ = 150;
  camera.fov = 0.85;
  const sky = new B.HemisphericLight('Sky', V(0, 1, 0), scene);
  sky.intensity = 0.68;
  sky.groundColor = hex('#bba18c');
  const sun = new B.DirectionalLight('Sun', V(0.45, -1, 0.42), scene);
  sun.position = V(-16, 32, -16);
  sun.intensity = 0.76;
  const shadows = new B.ShadowGenerator(1024, sun);
  shadows.bias = 0.0015;
  shadows.normalBias = 0.025;
  shadows.setDarkness(0.22);
  shadows.usePercentageCloserFiltering = true;
  shadows.filteringQuality = B.ShadowGenerator.QUALITY_LOW;
  sun.shadowMinZ = 0.1;
  sun.shadowMaxZ = 85;
  function mat(color, alpha = 1) {
    const key = color + alpha;
    if (!mats.has(key)) {
      const m = new B.StandardMaterial(key, scene);
      m.diffuseColor = hex(color);
      m.specularColor = new B.Color3(0.045, 0.045, 0.045);
      m.specularPower = 46;
      m.alpha = alpha;
      if (alpha < 1) {
        m.backFaceCulling = true;
        m.disableDepthWrite = true;
      }
      mats.set(key, m);
    }
    return mats.get(key);
  }
  function box(name, x, y, z, w, h, d, color, parent = null) {
    const m = B.MeshBuilder.CreateBox(name, { width: w, height: h, depth: d }, scene);
    m.position.set(x, y, z);
    m.material = mat(color);
    m.parent = parent;
    m.isPickable = false;
    m.receiveShadows = true;
    return m;
  }
  function cyl(name, x, y, z, r, h, color, parent = null, segments = 10, top = r) {
    const m = B.MeshBuilder.CreateCylinder(
      name,
      {
        diameterBottom: 2 * r,
        diameterTop: 2 * top,
        height: h,
        tessellation: segments
      },
      scene
    );
    m.position.set(x, y, z);
    m.material = mat(color);
    m.parent = parent;
    m.isPickable = false;
    return m;
  }
  function wedge(s) {
    const m = new B.Mesh('Wedge', scene),
      w = s.w,
      d = s.d,
      h = s.h;
    const v = [
      [0, 0, 0],
      [w, 0, 0],
      [w, h, 0],
      [0, 0, d],
      [w, 0, d],
      [w, h, d]
    ];
    const data = new B.VertexData();
    data.positions = v.flat();
    data.indices = [0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 0, 2, 5, 0, 5, 3];
    data.normals = [];
    B.VertexData.ComputeNormals(data.positions, data.indices, data.normals);
    data.applyToMesh(m);
    m.convertToFlatShadedMesh();
    return m;
  }
  function template(type, color, ghost = false) {
    const key = [type, color, ghost].join(':');
    if (templates.has(key)) return templates.get(key);
    const { w, d, shape } = TYPES[type],
      meshes = [];
    for (const s of parts(type)) {
      if (s.detail === 'ramp') {
        const m = wedge(s);
        m.position.set(-w / 2, 0, -d / 2);
        meshes.push(m);
      } else
        meshes.push(
          box(
            'Shell',
            s.x + s.w / 2 - w / 2,
            s.y + s.h / 2,
            s.z + s.d / 2 - d / 2,
            s.w - 0.014,
            s.h - 0.008,
            s.d - 0.014,
            color
          )
        );
    }
    if (shape !== 'ramp')
      for (let x = 0.5; x < w; x++)
        for (let z = 0.5; z < d; z++) {
          const surfaces = parts(type).filter(
            (s) => x >= s.x && x < s.x + s.w && z >= s.z && z < s.z + s.d
          );
          if (!surfaces.length) continue;
          const h = Math.max(...surfaces.map((s) => s.y + s.h));
          meshes.push(cyl('Dimple', x - w / 2, h + 0.035, z - d / 2, 0.23, 0.07, color, null, 12));
        }
    const m = B.Mesh.MergeMeshes(meshes, true, true);
    m.name = key;
    m.material = mat(color, ghost ? 0.48 : 1);
    m.isVisible = false;
    m.isPickable = false;
    templates.set(key, m);
    return m;
  }
  function transform(mesh, p) {
    const s = size(p);
    const side = kind === 'canal' ? mountOf(p) : 'fixed';
    mesh.parent = kind === 'garage' ? chassis : leaves[side] || null;
    mesh.position.set(
      p.x + s.w / 2 - (PIVOTS[side] ?? 0),
      p.y + (kind === 'garage' ? CHASSIS_TOP : 0),
      p.z + s.d / 2
    );
    mesh.rotation.y = (-p.r * Math.PI) / 2;
  }
  let preview = null,
    previewKey = '',
    worldNodes = [],
    shopSigns = [],
    kind = 'free';
  function drawPieces(items, selected) {
    const ids = new Set(items.map((p) => p.id));
    for (const [id, m] of pieces)
      if (!ids.has(id)) {
        shadows.removeShadowCaster(m);
        m.dispose();
        pieces.delete(id);
      }
    for (const p of items) {
      const key = p.type + ':' + p.color;
      let m = pieces.get(p.id);
      if (m?.metadata.key !== key) {
        if (m) {
          shadows.removeShadowCaster(m);
          m.dispose();
        }
        m = template(p.type, PALETTE[p.color]).createInstance(p.id);
        m.metadata = { id: p.id, key };
        m.isPickable = true;
        m.receiveShadows = true;
        shadows.addShadowCaster(m);
        pieces.set(p.id, m);
      }
      transform(m, p);
      if (m.metadata.selected !== (selected === p.id)) {
        m.metadata.selected = selected === p.id;
        m.showBoundingBox = m.metadata.selected;
      }
    }
    for (const sign of shopSigns) {
      const anchor = pieces.get(sign.id);
      sign.mesh.setEnabled(!!anchor);
      if (!anchor) continue;
      const yaw = anchor.rotation.y;
      sign.mesh.rotation.y = yaw;
      sign.mesh.position.set(
        anchor.position.x - 0.52 * Math.sin(yaw),
        anchor.position.y + sign.height,
        anchor.position.z - 0.52 * Math.cos(yaw)
      );
    }
  }
  function ghost(p, ok) {
    if (!p) {
      preview?.setEnabled(false);
      return;
    }
    const color = ok ? '#abffe2' : '#ff5052',
      key = p.type + color;
    if (key !== previewKey) {
      preview?.dispose();
      preview = template(p.type, color, true).createInstance('Preview');
      preview.isPickable = false;
      previewKey = key;
    }
    preview.setEnabled(true);
    transform(preview, p);
  }
  const planMeshes = [];
  function planGhost(items, ok) {
    while (planMeshes.length > items.length) planMeshes.pop().dispose();
    items.forEach((p, i) => {
      const source = template(p.type, ok ? PALETTE[p.color] : '#ff5052', true);
      if (planMeshes[i]?.sourceMesh !== source) {
        planMeshes[i]?.dispose();
        planMeshes[i] = source.createInstance('Blueprint preview');
        planMeshes[i].isPickable = false;
      }
      transform(planMeshes[i], p);
    });
  }
  function label(words, x, y, z, width) {
    const tex = new B.DynamicTexture(words, { width: 512, height: 120 }, scene, false);
    tex.drawText(words, null, 83, 'bold 66px sans-serif', '#fff1bc', '#174c4b', true);
    const plane = B.MeshBuilder.CreatePlane(
      words,
      {
        width,
        height: (width * 120) / 512,
        sideOrientation: B.Mesh.DOUBLESIDE
      },
      scene
    );
    const m = new B.StandardMaterial(words, scene);
    m.diffuseTexture = tex;
    m.emissiveColor = new B.Color3(0.24, 0.24, 0.24);
    plane.material = m;
    plane.position.set(x, y, z);
    plane.isPickable = false;
    return plane;
  }
  const lighting = townLighting(B, scene, sky, sun);
  const settlement = cityScene(B, scene, box, mat);
  const residentModels = new Map();
  function showResident(profile, trip, moving, t, waiting = false) {
    if (trip && !residentModels.has(profile.key))
      residentModels.set(profile.key, residentFigure(B, scene, mat('#ffffff'), profile));
    residentModels.get(profile.key)?.show(trip, moving, t, waiting);
  }
  function removeResident(key) {
    residentModels.get(key)?.dispose();
    residentModels.delete(key);
  }
  let stallSign;
  function showMarket(counter) {
    if (counter && !stallSign) {
      stallSign = new B.TransformNode('Market day storefront', scene);
      for (let i = 0; i < 6; i++) {
        const strip = box(
          'Market canopy stripe',
          (i - 2.5) * 0.55,
          0,
          -0.23,
          0.55,
          0.14,
          1.05,
          i % 2 ? '#ffbc45' : '#19695d',
          stallSign
        );
        strip.rotation.x = -0.12;
      }
      label('MARKET', 0, 0.49, 0, 2.8).parent = stallSign;
      box('Market till mat', 0, -3.245, 1.5, 1.45, 0.035, 1, '#f6bf43', stallSign);
    }
    if (!stallSign) return;
    stallSign.setEnabled(!!counter);
    if (counter) {
      stallSign.position.set(counter.center.x, counter.y + 3.28, counter.center.z);
      stallSign.rotation.y = (-counter.r * Math.PI) / 2;
    }
  }
  let trailMarker;
  function showTrail(front) {
    if (front && !trailMarker) {
      trailMarker = new B.TransformNode('Trail checkpoint', scene);
      box('Trail stamp pad', 0, 0.035, 0, 1.5, 0.05, 1.5, '#e8bf61', trailMarker);
      const sign = label('TRAIL', 0, 2.15, 0, 1.65);
      sign.parent = trailMarker;
      sign.billboardMode = B.Mesh.BILLBOARDMODE_Y;
    }
    if (!trailMarker) return;
    trailMarker.setEnabled(!!front);
    if (front) trailMarker.position.set(front.inside.x, front.y, front.inside.z);
  }
  function neighbourhood(next) {
    for (const m of worldNodes) m.dispose(false, !!m.metadata?.sign);
    worldNodes = [];
    showMarket(null);
    showTrail(null);
    if (kind === 'city') {
      lighting.reset();
      settlement.close();
    }
    kind = next;
    shopSigns = [];
    if (kind === 'upstairs') {
      for (const [id, words, height, width] of [
        ['shop-awning', 'PARCEL SHOP', 0, 3.4],
        ['flat-door', 'FLAT 1', 2.8, 1.85]
      ]) {
        const mesh = label(words, 0, 0, 0, width);
        mesh.metadata = { sign: true };
        worldNodes.push(mesh);
        shopSigns.push({ id, height, mesh });
      }
    }
    camera.maxZ = kind === 'city' ? 1500 : kind === 'district' ? 420 : 150;
    scene.fogDensity = kind === 'city' ? 0.0007 : 0.004;
    canalMechanism(0, -8);
    if (kind === 'city') {
      settlement.open();
      return;
    }
    const scenery = [];
    const block = (...args) => {
      const m = box('Neighbourhood', ...args);
      scenery.push(m);
      return m;
    };
    const round = (...args) => {
      const m = cyl('Tree', ...args);
      scenery.push(m);
      return m;
    };
    const land = (x, w) => {
      const m = box('Plot', x, -0.17, 0, w, 0.34, 20, '#e9ce99');
      m.metadata = { ground: true };
      m.isPickable = true;
      worldNodes.push(m);
    };
    if (kind === 'district') {
      buildDistrict(block, round);
      mergeScenery(scenery);
      return;
    }
    block(0, -3.6, 0, 94, 1, 94, '#8eaf79');
    for (const x of [-28, 28]) block(x, -0.23, 0, 36, 0.36, 92, '#91b47c');
    for (const z of [-28, 28]) block(0, -0.23, z, 20, 0.36, 36, '#91b47c');
    block(0, -0.25, 13.4, 77, 0.45, 5.8, '#56666a');
    block(0, -0.13, 10.75, 76, 0.24, 1.5, '#dec9a8');
    for (let i = -32; i < 32; i += 4) block(i, 0, 13.4, 1.9, 0.035, 0.11, '#fff1bb');
    if (!hasChannel(kind)) land(0, 20);
    else {
      land(-6.5, 7);
      land(6.5, 7);
      block(0, -1.6, 0, 6, 0.18, 20, '#59b4c2');
      for (const x of [-3.12, 3.12]) block(x, -1, 0, 0.24, 1.9, 20, '#b9a790');
      for (const x of [-8.4, -6.3, -4.2, 4.2, 6.3, 8.4])
        for (const z of [-0.8, 0.8]) block(x, 0.02, z, 0.95, 0.03, 0.09, '#ec9b2d');
      // A pickable datum lets the builder aim precisely across the open channel.
      const m = box('Channel guide', 0, -0.018, 0, 6, 0.012, 20, '#71aeaf');
      m.visibility = 0.02;
      m.isPickable = true;
      m.metadata = { ground: true };
      worldNodes.push(m);
    }
    // Grid lines sit on the plot, leaving the water visible below the bridge.
    const lines = [];
    for (let i = -10; i <= 10; i++) {
      if (!hasChannel(kind) || i <= -3 || i >= 3) lines.push([V(i, 0.012, -10), V(i, 0.012, 10)]);
      for (const [start, end] of !hasChannel(kind)
        ? [[-10, 10]]
        : [
            [-10, -3],
            [3, 10]
          ])
        lines.push([V(start, 0.012, i), V(end, 0.012, i)]);
    }
    if (kind === 'canal') {
      for (const sign of [-1, 1]) {
        const berthZ = sign * 8;
        block(sign * 2.2, -0.78, berthZ, 1.4, 0.24, 3.25, '#b18657');
        for (const dz of [-1.45, 1.45]) {
          round(sign * 1.58, -0.68, berthZ + dz, 0.12, 1.25, '#654e3c');
          round(sign * 1.58, -0.08, berthZ + dz, 0.13, 0.12, '#f3d8a2');
        }
        for (let i = 0; i < 6; i++)
          block(sign * 2.2, -0.643, berthZ - 1.25 + i * 0.5, 1.36, 0.022, 0.025, '#7e664a');
      }
      const wharf = label('CANAL WHARF', -3.8, 1.3, -7.8, 3);
      wharf.billboardMode = B.Mesh.BILLBOARDMODE_Y;
      wharf.metadata = { sign: true };
      worldNodes.push(wharf);
    }
    const grid = B.MeshBuilder.CreateLineSystem('Stud grid', { lines }, scene);
    grid.color = hex('#ae986e');
    grid.alpha = 0.65;
    grid.isPickable = false;
    worldNodes.push(grid);
    for (const [x, z, color] of [
      [-14, 5, '#d9805d'],
      [-13, -4, '#e9ad59'],
      [-8, 19, '#ecaa7d'],
      [0, 19, '#71a8ab'],
      [9, 19, '#e9b94e'],
      [14, -3, '#85ae93']
    ]) {
      block(x, 1.45, z, 4.8, 2.9, 4, color);
      block(x, 3, z, 5.15, 0.25, 4.4, '#626e74');
      for (let i = -2; i < 2.5; i += 0.35) block(x + i, 3.16, z, 0.06, 0.07, 4.28, '#83908e');
      block(x - 0.9, 1, z - 2.015, 1.05, 2, 0.07, '#356465');
      block(x + 0.95, 1.65, z - 2.04, 1.36, 1, 0.09, '#d5f2ef');
    }
    // A painted delivery bay marks the shop's unloading point on the east bank.
    if (hasChannel(kind)) {
      for (const z of [-0.92, 0.92]) block(9.1, 0.018, z, 1.7, 0.025, 0.08, '#197568');
      block(9.93, 0.018, 0, 0.08, 0.025, 1.84, '#197568');
    }
    // The destination sits directly beyond the east bank.
    block(13, 1.55, 0.1, 4, 3.1, 4.5, '#1f837d');
    block(13, 3.18, 0.1, 4.6, 0.28, 5, '#e1a34b');
    for (let i = 0; i < 8; i++)
      block(11.0, 2.17, -1.75 + i * 0.5, 1.65, 0.18, 0.48, i % 2 ? '#f4cb55' : '#faf0be');
    const sign = label(kind === 'upstairs' ? 'PARCELS' : 'SPAZA', 13, 2.5, -2.2, 3.5);
    sign.metadata = { sign: true };
    worldNodes.push(sign);
    block(-2, -0.2, -15, 21, 0.38, 8, '#98bb76');
    for (const [x, z] of [
      [-10, -14],
      [-5, -16],
      [2, -15],
      [8, -15],
      [17, 8],
      [-17, 13],
      [17, 18],
      [-16, -13]
    ]) {
      round(x, 1.2, z, 0.29, 2.4, '#956849');
      round(x, 2.65, z, 1.45, 2.4, '#49896b', null, 7, 0.74);
      round(x + 0.56, 3.4, z, 1.1, 1.7, '#72a35e', null, 7, 0.5);
    }
    for (const x of [-1, 5]) {
      block(x, 0.62, -12.5, 2.4, 0.24, 0.85, '#bc7951');
      block(x, 1.1, -12.86, 2.4, 0.68, 0.14, '#cf8c59');
      for (const d of [-0.85, 0.85]) block(x + d, 0.27, -12.5, 0.2, 0.55, 0.65, '#42665f');
    }
    mergeScenery(scenery);
  }
  function mergeScenery(scenery) {
    const groups = new Map();
    for (const m of scenery) {
      const g = groups.get(m.material) || [];
      g.push(m);
      groups.set(m.material, g);
    }
    for (const group of groups.values()) {
      const m = B.Mesh.MergeMeshes(group, true, true);
      m.isPickable = false;
      m.receiveShadows = true;
      m.freezeWorldMatrix();
      shadows.addShadowCaster(m);
      worldNodes.push(m);
    }
  }
  function buildDistrict(block, round) {
    block(0, -0.32, 0, 100, 0.44, 80, '#94b585');
    block(0, -0.11, 0, 48, 0.2, 24, '#d7c4a4');
    block(0, -0.045, -9.7, 68, 0.08, 4.2, '#52696d');
    for (let x = -31; x < 32; x += 3) block(x, 0.006, -9.7, 1.3, 0.02, 0.09, '#fff0ba');
    for (const x of [-8, 8])
      for (let z = -11.2; z < -8; z += 0.6) block(x, 0.023, z, 1.8, 0.025, 0.29, '#f9ead2');
    const lines = [];
    for (const lot of LOTS) {
      const x = lot.x;
      const plot = box('District plot', x, -0.08, 0, 12, 0.16, 14, lot.ground);
      plot.isPickable = true;
      plot.metadata = { ground: true };
      worldNodes.push(plot);
      for (let i = -6; i <= 6; i++) lines.push([V(x + i, 0.014, -7), V(x + i, 0.014, 7)]);
      for (let i = -7; i <= 7; i++) lines.push([V(x - 6, 0.014, i), V(x + 6, 0.014, i)]);
      // Painted loading edge, shop window and a striped market awning.
      block(x, 0.86, -0.017, 4, 0.11, 0.03, lot.color);
      block(x, 2.23, 2.98, 3.3, 1.22, 0.05, '#304e50');
      block(x, 1.64, 2.91, 3.6, 0.11, 0.22, '#fee6af');
      for (let k = 0; k < 8; k++) {
        const col = k % 2 === 0 ? lot.color : '#fff0c9';
        block(x - 1.925 + k * 0.55, 3.48, 4.05, 0.55, 0.16, 3.3, col);
        block(x - 1.925 + k * 0.55, 3.34, 2.46, 0.55, 0.23, 0.12, col);
      }
      const sign = label(lot.sign, x, 2.95, 2.84, 2.45);
      sign.metadata = { sign: true };
      worldNodes.push(sign);
      if (lot === LOTS[1]) {
        block(x, 1.78, 2.82, 0.72, 0.16, 0.39, '#7cc9bf');
        block(x, 2.04, 2.9, 0.29, 0.4, 0.11, '#f3bf53');
      } else
        for (let k = 0; k < 6; k++) {
          round(x - 1.14 + k * 0.41, 1.8, 2.88, 0.16, 0.24, k % 2 ? '#ed9d34' : '#8cba64');
        }
    }
    for (const slab of STATIONS) {
      const m = box(
        'Market station',
        slab.x,
        slab.h / 2,
        slab.z,
        slab.w,
        slab.h,
        slab.d,
        slab.color
      );
      m.metadata = { cameraWall: true };
      m.isPickable = true;
      shadows.addShadowCaster(m);
      worldNodes.push(m);
    }
    const grid = B.MeshBuilder.CreateLineSystem('District stud grids', { lines }, scene);
    grid.color = hex('#a18b67');
    grid.alpha = 0.62;
    grid.isPickable = false;
    worldNodes.push(grid);
    // Homes face the district from beyond the buildable neighbourhood.
    for (let i = 0; i < 8; i++) {
      const x = -26 + i * 7,
        z = 15 + (i % 2);
      block(x, 1.35, z, 4.6, 2.7, 4, ['#d59c63', '#83a8a2', '#c7836b'][i % 3]);
      block(x, 2.83, z, 5, 0.27, 4.45, '#586b70');
      block(x - 0.95, 1, z - 2.025, 0.95, 2, 0.06, '#365c59');
      block(x + 0.9, 1.55, z - 2.04, 1.25, 0.92, 0.08, '#c0e5dd');
    }
    for (const x of [-24, -12, 4, 14, 26])
      for (const z of [-14, 13]) {
        round(x, 1, z, 0.24, 2, '#82664a');
        round(x, 2.9, z, 1.35, 2.8, '#538c66', null, 8, 0.65);
        round(x, 3.9, z, 0.94, 1.5, '#7fac68', null, 8, 0.35);
      }
  }
  const explorer = builder(B, scene),
    person = explorer.root;
  const body = (name, x, y, z, w, h, d, color, parent) =>
    box(name, x, y, z, w, h, d, color, parent);
  const gold = '#edac36';
  const parcel = new B.TransformNode('Market crate', scene);
  parcel.parent = person;
  parcel.position.set(0.24, -0.12, -0.005);
  body('Produce crate', 0, 0.85, 0.31, 0.55, 0.34, 0.41, '#a76a37', parcel);
  for (const x of [-0.13, 0.09]) cyl('Oranges', x, 1.05, 0.32, 0.11, 0.16, '#ef9e34', parcel);
  body('Crate rim', 0, 1, 0.49, 0.6, 0.1, 0.06, '#eac078', parcel);
  body('Crate brace', 0, 0.84, 0.09, 0.58, 0.07, 0.05, '#dfad6b', parcel);
  parcel.setEnabled(false);
  const shopParcel = new B.TransformNode('Flat delivery parcel', scene);
  shopParcel.parent = person;
  shopParcel.position.set(0.065, -0.07, 0.095);
  body('Paper parcel', -0.36, 0.82, 0.19, 0.48, 0.39, 0.46, '#cb8c45', shopParcel);
  body('String', -0.36, 1.025, 0.19, 0.055, 0.02, 0.47, '#fff3d8', shopParcel);
  body('Label', -0.47, 1.028, 0.21, 0.13, 0.024, 0.19, '#f0e1b5', shopParcel);
  shopParcel.setEnabled(false);
  const stopMarker = cyl('Delivery stop', 0, 0, 0, 0, 0.65, '#ffc437', null, 4, 0.32);
  stopMarker.setEnabled(false);
  const car = new B.TransformNode('Delivery buggy', scene),
    wheels = [];
  body('Body', 0, 0.52, 0, 1.65, 0.46, 1.02, gold, car);
  body('Cab', 0.37, 0.9, 0, 0.62, 0.52, 0.8, '#247c7c', car);
  body('Windscreen', 0.69, 0.92, 0, 0.04, 0.34, 0.65, '#badfdd', car);
  body('Crate', -0.4, 0.87, 0, 0.63, 0.33, 0.72, '#cd7851', car);
  for (const x of [-0.56, 0.56])
    for (const z of [-0.49, 0.49]) {
      const wheel = cyl('Tyre', x, 0.26, z, 0.26, 0.2, '#37464a', car, 16);
      const axle = new B.TransformNode('Axle', scene);
      axle.parent = car;
      axle.position.copyFrom(wheel.position);
      wheel.parent = axle;
      wheel.position.setAll(0);
      wheel.rotation.x = Math.PI / 2;
      const cap = cyl('Hub', 0, z > 0 ? 0.115 : -0.115, 0, 0.115, 0.045, '#e9c66e', wheel, 8);
      box('Hub stripe', 0, z > 0 ? 0.03 : -0.03, 0, 0.14, 0.018, 0.045, '#61746e', cap);
      wheels.push(axle);
    }
  for (const m of [...person.getChildMeshes(), ...car.getChildMeshes()]) shadows.addShadowCaster(m);
  const canalRoot = new B.TransformNode('Canal machinery', scene),
    leaves = {};
  for (const [side, x] of Object.entries(PIVOTS)) {
    const root = new B.TransformNode(side + ' lifting leaf', scene);
    root.parent = canalRoot;
    root.position.x = x;
    leaves[side] = root;
    const color = side === 'west' ? '#1b8b84' : '#e49e32';
    box('Hinge shoe', side === 'west' ? 0.5 : -0.5, -0.075, 0, 1, 0.15, 2, color, root);
    const pin = cyl('Hinge pin', x, 0, 0, 0.15, 2.7, '#46575b', canalRoot, 16);
    pin.rotation.x = Math.PI / 2;
    for (const z of [-1.29, 1.29]) {
      const housing = cyl('Bearing housing', x, 0, z, 0.24, 0.24, color, canalRoot, 14);
      housing.rotation.x = Math.PI / 2;
    }
  }
  const signalHeads = [];
  for (const side of [-1, 1]) {
    box('Signal base', side * 3.6, 0.22, -2, 0.42, 0.44, 0.42, '#454f4d', canalRoot);
    cyl('Signal post', side * 3.6, 0.85, -2, 0.1, 1.0, '#718780', canalRoot, 8);
    signalHeads.push(cyl('Road signal', side * 3.6, 1.45, -2, 0.18, 0.35, '#77b36b', canalRoot));
  }
  const ripples = [];
  for (let i = 0; i < 18; i++) {
    const x = ((i * 17) % 43) / 10 - 2.25,
      z = -9.5 + i * 1.04;
    ripples.push([V(x, -1.5, z), V(x + 0.33, -1.5, z + 0.045), V(x + 0.67, -1.5, z)]);
  }
  const waves = B.MeshBuilder.CreateLineSystem('Canal ripples', { lines: ripples }, scene);
  waves.color = hex('#c4ece7');
  waves.alpha = 0.56;
  waves.isPickable = false;
  waves.parent = canalRoot;
  const ferry = new B.TransformNode('Canal ferry', scene);
  ferry.parent = canalRoot;
  for (const f of FERRY)
    box(f.name, f.x + f.w / 2, f.y + f.h / 2, f.z + f.d / 2, f.w, f.h, f.d, f.color, ferry);
  box('Bridge windows', 0, -0.57, 0.407, 0.82, 0.33, 0.024, '#a6d8d8', ferry);
  for (const sign of [-1, 1])
    box('Cabin window', sign * 0.524, -0.57, -0.2, 0.025, 0.32, 0.72, '#a6d8d8', ferry);
  for (const mesh of canalRoot.getChildMeshes()) shadows.addShadowCaster(mesh);
  canalRoot.setEnabled(false);
  function canalMechanism(angle, boatZ, moving = false) {
    const active = kind === 'canal';
    canalRoot.setEnabled(active);
    if (!active) return;
    for (const [side, node] of Object.entries(leaves)) node.rotation.z = hingeAngle(side, angle);
    ferry.position.z = boatZ;
    const color = moving ? '#efbb47' : angle > 0 ? '#db6050' : '#75c481';
    for (const signal of signalHeads) signal.material = mat(color);
  }
  const chassis = new B.TransformNode('Workshop chassis', scene);
  const base = box('Mounting plate', 0, CHASSIS_TOP - 0.16, 0, 4, 0.32, 4, '#288478', chassis);
  base.isPickable = true;
  base.metadata = { ground: true };
  for (let x = -1.5; x < 2; x++)
    for (let z = -1.5; z < 2; z++)
      cyl('Axle plate stud', x, CHASSIS_TOP + 0.035, z, 0.22, 0.07, '#288478', chassis);
  box('Front bumper', 0, 0.52, 1.92, 3.62, 0.22, 0.24, '#345558', chassis);
  for (const x of [-1.43, 1.43]) {
    box('Headlamp', x, 0.79, 2.016, 0.48, 0.2, 0.09, '#fff1a3', chassis);
    box('Tail lamp', x, 0.79, -2.016, 0.42, 0.16, 0.09, '#eb5545', chassis);
  }
  const roadWheels = [];
  for (const x of [-2.08, 2.08])
    for (const z of [-1.29, 1.29]) {
      const steering = new B.TransformNode('Steering knuckle', scene);
      steering.parent = chassis;
      steering.position.set(x, 0.46, z);
      const roll = new B.TransformNode('Wheel rotation', scene);
      roll.parent = steering;
      const tyre = cyl('Workshop tyre', 0, 0, 0, 0.46, 0.4, '#303e41', roll, 16);
      tyre.rotation.z = Math.PI / 2;
      const hub = cyl('Wheel hub', Math.sign(x) * 0.19, 0, 0, 0.23, 0.08, '#ecc15a', roll, 12);
      hub.rotation.z = Math.PI / 2;
      box('Hub notch', Math.sign(x) * 0.24, 0, 0.09, 0.035, 0.075, 0.15, '#345558', roll);
      roadWheels.push({ steering, roll, hub });
    }
  for (const mesh of chassis.getChildMeshes()) shadows.addShadowCaster(mesh);
  chassis.setEnabled(false);
  const gateNodes = GATES.map((g, i) => {
    const root = new B.TransformNode(g.name + ' gate', scene);
    root.position.set(g.x, 0, g.z);
    root.rotation.y = Math.atan2(g.nx, g.nz);
    const lights = [];
    for (const side of [-1, 1]) {
      const x = side * GATE_HALF_WIDTH;
      box('Gate foot', x, 0.1, 0, 0.65, 0.2, 0.65, '#354e50', root);
      lights.push(box('Gate marker', x, 0.83, 0, 0.26, 1.35, 0.26, '#f4c64b', root));
    }
    lights.push(box('Gate line', 0, 0.025, 0, GATE_HALF_WIDTH * 2, 0.04, 0.18, '#f4c64b', root));
    for (const side of [-1, 1]) {
      const arm = box('Gate arrow', side * 0.24, 0.036, -0.62, 0.12, 0.04, 0.72, '#fff2bc', root);
      arm.rotation.y = -side * 0.72;
    }
    const flag = label(i + 1 + ' ' + g.name.toUpperCase(), -GATE_HALF_WIDTH, 2.2, 0, 2.6);
    flag.parent = root;
    flag.billboardMode = B.Mesh.BILLBOARDMODE_Y;
    root.setEnabled(false);
    return { root, lights };
  });
  let freightBody;
  const bays = LOTS.map((lot, index) => {
    const root = new B.TransformNode(lot.name + ' freight bay', scene);
    root.position.set(lot.x, 0, BAY_Z);
    const paint = [];
    for (const x of [-BAY_WIDTH / 2, BAY_WIDTH / 2])
      paint.push(box('Bay end', x, 0.04, 0, 0.13, 0.035, BAY_DEPTH, '#eed298', root));
    for (const z of [-BAY_DEPTH / 2, BAY_DEPTH / 2])
      paint.push(box('Bay edge', 0, 0.04, z, BAY_WIDTH, 0.035, 0.13, '#eed298', root));
    const sign = label(String(index + 1) + ' ' + lot.sign, 0, 1.26, 2.48, 2.9);
    sign.parent = root;
    sign.billboardMode = B.Mesh.BILLBOARDMODE_Y;
    box('Bay signpost', 0, 0.58, 2.48, 0.14, 1.16, 0.14, '#495e55', root);
    root.setEnabled(false);
    return { root, paint };
  });
  let crates = [];
  function freightBodywork(items) {
    freightBody?.dispose();
    freightBody = null;
    crates = [];
    for (const bay of bays) bay.root.setEnabled(!!items && kind === 'district');
    if (!items) return;
    freightBody = new B.TransformNode('Dispatched buggy', scene);
    freightBody.parent = chassis;
    for (const p of items) {
      const mesh = template(p.type, PALETTE[p.color]).createInstance('Freight ' + p.id);
      transform(mesh, p);
      mesh.parent = freightBody;
      mesh.position.y += CHASSIS_TOP;
      mesh.isPickable = false;
      shadows.addShadowCaster(mesh);
    }
    const bed = openBed(items),
      dims = size(bed);
    const rack = new B.TransformNode('Freight load', scene);
    rack.parent = freightBody;
    rack.position.set(bed.x + dims.w / 2, CHASSIS_TOP + bed.y + 0.22, bed.z + dims.d / 2);
    rack.rotation.y = (-bed.r * Math.PI) / 2;
    for (let i = 0; i < 2; i++) {
      const crate = new B.TransformNode('Freight crate ' + (i + 1), scene);
      crate.parent = rack;
      crate.position.x = i === 0 ? -0.4 : 0.4;
      box('Produce box', 0, 0.45, 0, 0.72, 0.9, 1.36, i ? '#cb813f' : '#42876e', crate);
      for (const z of [-0.47, 0.47])
        box('Packing strap', 0, 0.91, z, 0.72, 0.04, 0.12, '#ffdc85', crate);
      crates.push(crate);
    }
  }
  function showFreightStop(stop) {
    crates.forEach((crate, i) => crate.setEnabled(i < cargoCount(stop)));
    bays.forEach((bay, i) => {
      const paint = mat(i === stop - 1 ? '#ffbc37' : i < stop - 1 ? '#5fb699' : '#f2e2bb');
      for (const mesh of bay.paint) mesh.material = paint;
    });
  }
  let townMarkers = [];
  function showTransport(trip) {
    townMarkers.forEach((m) => m.dispose());
    townMarkers = [];
    crates.forEach((crate, i) => crate.setEnabled(trip?.stage === 2 && i === 0));
    if (!trip) return;
    for (const [index, key] of [trip.pickup, trip.dropoff].entries()) {
      const point = transportPoint(key);
      if (!point) continue;
      const root = new B.TransformNode(index ? 'Town drop-off' : 'Town pickup', scene);
      root.position.set(point.x, 0.04, point.z);
      root.rotation.y = point.yaw;
      const color = index ? '#edb741' : '#35ad9a';
      for (const x of [-2.7, 2.7]) box('Delivery bay edge', x, 0, 0, 0.1, 0.04, 6, color, root);
      for (const z of [-3, 3]) box('Delivery bay end', 0, 0, z, 5.5, 0.04, 0.1, color, root);
      townMarkers.push(root);
    }
  }
  let lastGate = -1;
  function workshop(driving, run, tyres) {
    const garage = kind === 'garage';
    const freight = (kind === 'district' || kind === 'city') && driving;
    chassis.setEnabled(garage || freight);
    for (const gate of gateNodes) gate.root.setEnabled(garage && driving);
    if (!garage && !freight) return;
    chassis.position.set(driving ? run.x : 0, 0, driving ? run.z : 0);
    chassis.rotation.y = driving ? run.yaw : 0;
    for (const { steering, roll, hub } of roadWheels) {
      steering.rotation.y = driving && steering.position.z > 0 ? run.steer * 0.38 : 0;
      roll.rotation.x = driving ? run.distance / 0.46 : 0;
      hub.material = mat(TYRES[tyres].color);
    }
    if (garage && lastGate !== run.gate) {
      lastGate = run.gate;
      gateNodes.forEach((gate, i) => {
        for (const mesh of gate.lights)
          mesh.material = mat(i === run.gate ? '#ffbf34' : i < run.gate ? '#2e967e' : '#82979a');
      });
    }
  }
  const orbit = { yaw: -0.63, pitch: 0.91, zoom: 1, focusX: 0, focusZ: 0 },
    chase = { yaw: 0 };
  function view(mode, a, run) {
    const aspect = canvas.clientWidth / canvas.clientHeight;
    if (mode === 'drive') {
      const angle = run.yaw + chase.yaw;
      const distance = 8.8 / Math.max(0.53, Math.min(1, aspect));
      camera.position.set(
        run.x - Math.sin(angle) * distance,
        3.5 + distance * 0.38,
        run.z - Math.cos(angle) * distance
      );
      camera.setTarget(V(run.x, 1.2, run.z));
    } else if (mode === 'build') {
      const dist = Math.max(27, 25 / Math.min(aspect, 1)) * orbit.zoom,
        flat = Math.cos(orbit.pitch) * dist;
      const target = V(orbit.focusX, 0, orbit.focusZ);
      camera.position.set(
        target.x + Math.sin(orbit.yaw) * flat,
        dist * Math.sin(orbit.pitch),
        target.z - Math.cos(orbit.yaw) * flat
      );
      camera.setTarget(target);
    } else {
      const head = V(a.x, a.y + 1.4, a.z);
      const distance = kind === 'district' ? 5.6 : 3.4;
      const delta = V(
        -Math.sin(chase.yaw) * distance,
        kind === 'district' ? 1.85 : 0.76,
        -Math.cos(chase.yaw) * distance
      );
      const ray = new B.Ray(head, delta.clone().normalize(), delta.length());
      const hit = scene.pickWithRay(ray, (m) => !!(m.metadata?.id || m.metadata?.cameraWall));
      const dist = hit?.hit ? Math.max(0.19, hit.distance - 0.2) : delta.length();
      camera.position.copyFrom(head.add(delta.normalize().scale(dist)));
      camera.setTarget(head.add(V(Math.sin(chase.yaw) * 1.25, -0.3, Math.cos(chase.yaw) * 1.25)));
      person.setEnabled(dist > 0.75);
    }
  }
  function pick(x, y) {
    // Babylon uses the supplied predicate instead of its normal enabled/visible checks.
    const hit = scene.pick(
      x,
      y,
      (m) => m.isEnabled() && m.isVisible && m.isPickable && (m.metadata?.ground || m.metadata?.id)
    );
    if (!hit?.hit) return null;
    return {
      x: hit.pickedPoint.x,
      z: hit.pickedPoint.z,
      id: hit.pickedMesh.metadata.id
    };
  }
  function actors(mode, a, c, walk, t, seat, deliveryStage = 0) {
    const shop = kind === 'upstairs';
    parcel.setEnabled(!shop && (deliveryStage === 2 || deliveryStage === 3));
    shopParcel.setEnabled(shop && deliveryStage === 2);
    const stop = shop ? [COUNTER, FLAT][deliveryStage - 1] : LOTS[deliveryStage - 1];
    stopMarker.setEnabled(!!stop);
    if (stop)
      stopMarker.position.set(
        stop.x,
        (shop ? stop.y + 1.7 : 3.65) + 0.12 * Math.sin(t * 3),
        shop ? stop.z : 1.5
      );
    const seated = mode === 'drive' && seat;
    person.parent = seated ? chassis : null;
    person.setEnabled(kind !== 'garage' || Boolean(seated));
    if (seated) {
      const s = size(seat);
      person.position.set(seat.x + s.w / 2, CHASSIS_TOP + seat.y + 0.36 - 0.63, seat.z + s.d / 2);
      person.rotation.y = (-seat.r * Math.PI) / 2;
    } else {
      person.position.set(a.x, a.y, a.z);
      person.rotation.y = a.heading;
    }
    explorer.pose(
      walk,
      Boolean(seated),
      parcel.isEnabled(false) ? 1 : shopParcel.isEnabled(false) ? -1 : 0,
      !a.grounded,
      t
    );
    car.setEnabled(hasChannel(kind));
    car.position.set(c.x, c.y + (c.state === 'fell' ? -0.48 : 0), c.z);
    car.rotation.z = c.pitch + (c.state === 'fell' ? -0.32 : 0);
    car.rotation.x = -c.roll;
    for (const m of wheels) {
      const { x, z } = m.position;
      const tyre = (x > 0 ? 0 : 2) + (z > 0 ? 1 : 0);
      // Independent suspension keeps each tyre at its sampled deck height.
      m.position.y = 0.26 + c.wheels[tyre] - c.y - x * Math.sin(c.pitch) - z * Math.sin(c.roll);
      m.rotation.z = -c.x / 0.26;
    }
  }
  return {
    engine,
    scene,
    camera,
    orbit,
    chase,
    view,
    pick,
    neighbourhood,
    showResident,
    showMarket,
    showTrail,
    removeResident,
    townLighting: lighting.update,
    citySector: settlement.sector,
    drawPieces,
    ghost,
    planGhost,
    actors,
    workshop,
    canalMechanism,
    freightBodywork,
    showFreightStop,
    showTransport
  };
}
