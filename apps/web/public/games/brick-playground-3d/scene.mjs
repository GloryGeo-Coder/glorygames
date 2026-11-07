import { TYPES, PALETTE, parts, size } from './model.mjs';
const B = window.BABYLON,
  V = (x, y, z) => new B.Vector3(x, y, z);
export function studio(canvas) {
  const engine = new B.Engine(canvas, true, { stencil: true, preserveDrawingBuffer: false });
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
      { diameterBottom: 2 * r, diameterTop: 2 * top, height: h, tessellation: segments },
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
    mesh.position.set(p.x + s.w / 2, p.y, p.z + s.d / 2);
    mesh.rotation.y = (-p.r * Math.PI) / 2;
  }
  let preview = null,
    previewKey = '',
    worldNodes = [],
    kind = 'free';
  function drawPieces(items, selected) {
    const ids = new Set(items.map((p) => p.id));
    for (const [id, m] of pieces)
      if (!ids.has(id)) {
        m.dispose();
        pieces.delete(id);
      }
    for (const p of items) {
      const key = p.type + ':' + p.color;
      let m = pieces.get(p.id);
      if (m?.metadata.key !== key) {
        m?.dispose();
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
  function label(words, x, y, z, width) {
    const tex = new B.DynamicTexture(words, { width: 512, height: 120 }, scene, false);
    tex.drawText(words, null, 83, 'bold 66px sans-serif', '#fff1bc', '#174c4b', true);
    const plane = B.MeshBuilder.CreatePlane(
      words,
      { width, height: (width * 120) / 512, sideOrientation: B.Mesh.DOUBLESIDE },
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
  function neighbourhood(next) {
    for (const m of worldNodes) m.dispose(false, !!m.metadata?.sign);
    worldNodes = [];
    kind = next;
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
    block(0, -3.6, 0, 94, 1, 94, '#8eaf79');
    for (const x of [-28, 28]) block(x, -0.23, 0, 36, 0.36, 92, '#91b47c');
    for (const z of [-28, 28]) block(0, -0.23, z, 20, 0.36, 36, '#91b47c');
    block(0, -0.25, 13.4, 77, 0.45, 5.8, '#56666a');
    block(0, -0.13, 10.75, 76, 0.24, 1.5, '#dec9a8');
    for (let i = -32; i < 32; i += 4) block(i, 0, 13.4, 1.9, 0.035, 0.11, '#fff1bb');
    if (kind === 'free') land(0, 20);
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
      if (kind === 'free' || i <= -3 || i >= 3) lines.push([V(i, 0.012, -10), V(i, 0.012, 10)]);
      for (const [start, end] of kind === 'free'
        ? [[-10, 10]]
        : [
            [-10, -3],
            [3, 10]
          ])
        lines.push([V(start, 0.012, i), V(end, 0.012, i)]);
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
    if (kind === 'bridge') {
      for (const z of [-0.92, 0.92]) block(9.1, 0.018, z, 1.7, 0.025, 0.08, '#197568');
      block(9.93, 0.018, 0, 0.08, 0.025, 1.84, '#197568');
    }
    // The destination sits directly beyond the east bank.
    block(13, 1.55, 0.1, 4, 3.1, 4.5, '#1f837d');
    block(13, 3.18, 0.1, 4.6, 0.28, 5, '#e1a34b');
    for (let i = 0; i < 8; i++)
      block(11.0, 2.17, -1.75 + i * 0.5, 1.65, 0.18, 0.48, i % 2 ? '#f4cb55' : '#faf0be');
    const sign = label('SPAZA', 13, 2.5, -2.2, 3.5);
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
  const person = new B.TransformNode('Builder', scene),
    legs = [];
  const body = (name, x, y, z, w, h, d, color, parent = person) =>
    box(name, x, y, z, w, h, d, color, parent);
  const skin = '#825139',
    teal = '#247c7c',
    gold = '#edac36';
  for (const x of [-0.16, 0.16]) {
    const leg = new B.TransformNode('Leg', scene);
    leg.parent = person;
    leg.position.set(x, 0.63, 0);
    legs.push(leg);
    body('Trouser', 0, -0.26, 0, 0.24, 0.48, 0.25, teal, leg);
    body('Boot', 0, -0.53, 0.045, 0.27, 0.17, 0.38, '#344551', leg);
    body('Sleeve', x * 2.05, 0.94, 0, 0.2, 0.34, 0.27, gold);
    body('Hand', x * 2.05, 0.72, 0.02, 0.18, 0.19, 0.2, skin);
  }
  body('Overalls', 0, 0.91, 0, 0.46, 0.59, 0.31, teal);
  body('Pocket', 0, 0.96, 0.17, 0.24, 0.18, 0.045, '#74c2ad');
  body('Head', 0, 1.38, 0, 0.46, 0.42, 0.42, skin);
  body('Hair', 0, 1.53, -0.055, 0.49, 0.18, 0.43, '#443834');
  for (const x of [-0.21, 0.21])
    for (let i = 0; i < 3; i++)
      body('Braid', x, 1.39 - i * 0.105, -0.18, 0.11, 0.12, 0.13, '#443834');
  body('Cap', 0, 1.63, 0, 0.53, 0.15, 0.47, gold);
  body('Visor', 0, 1.59, 0.23, 0.52, 0.065, 0.25, gold);
  for (const x of [-0.11, 0.11]) body('Eye', x, 1.4, 0.214, 0.046, 0.054, 0.026, '#342828');
  const car = new B.TransformNode('Delivery buggy', scene),
    wheels = [];
  body('Body', 0, 0.52, 0, 1.65, 0.46, 1.02, gold, car);
  body('Cab', 0.37, 0.9, 0, 0.62, 0.52, 0.8, teal, car);
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
  const orbit = { yaw: -0.63, pitch: 0.91, zoom: 1, focusX: 0, focusZ: 0 },
    chase = { yaw: 0 };
  function view(mode, a) {
    const aspect = canvas.clientWidth / canvas.clientHeight;
    if (mode === 'build') {
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
      const delta = V(-Math.sin(chase.yaw) * 3.4, 1.18, -Math.cos(chase.yaw) * 3.4);
      const ray = new B.Ray(head, delta.clone().normalize(), delta.length());
      const hit = scene.pickWithRay(ray, (m) => !!m.metadata?.id);
      const dist = hit?.hit ? Math.max(0.19, hit.distance - 0.2) : delta.length();
      camera.position.copyFrom(head.add(delta.normalize().scale(dist)));
      camera.setTarget(head.add(V(Math.sin(chase.yaw) * 1.5, 0.02, Math.cos(chase.yaw) * 1.5)));
      person.setEnabled(dist > 0.75);
    }
  }
  function pick(x, y) {
    const hit = scene.pick(x, y, (m) => m.isPickable && (m.metadata?.ground || m.metadata?.id));
    if (!hit?.hit) return null;
    return { x: hit.pickedPoint.x, z: hit.pickedPoint.z, id: hit.pickedMesh.metadata.id };
  }
  function actors(mode, a, c, walk, t) {
    person.setEnabled(true);
    person.position.set(a.x, a.y, a.z);
    person.rotation.y = a.heading;
    legs.forEach((l, i) => (l.rotation.x = walk ? Math.sin(t * 11 + i * Math.PI) * 0.43 : 0));
    car.setEnabled(kind === 'bridge');
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
    drawPieces,
    ghost,
    actors
  };
}
