import { surface } from './builder-geometry.mjs';
import { builderFace } from './builder-face.mjs';

const SKIN = '#a25f3b',
  HAIR = '#322521',
  DENIM = '#146f72',
  DEEP = '#13595d',
  THREAD = '#e4ae46',
  CREAM = '#f3dfb4',
  YELLOW = '#ffbd21',
  GOLD = '#f6bc32',
  WHITE = '#ffffff';
const tau = Math.PI * 2;
function node(B, scene, name, parent, x, y, z) {
  const bone = new B.TransformNode(name, scene);
  bone.parent = parent;
  bone.position.set(x, y, z);
  return bone;
}
function braid(g, angle, length, index) {
  const sx = Math.sin(angle),
    cz = Math.cos(angle),
    count = 24;
  for (let strand = 0; strand < 2; strand++) {
    const points = [],
      radii = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count,
        turn = t * tau * 3.2 + strand * Math.PI;
      const spread = 0.228 + 0.062 * t + 0.012 * Math.sin(t * Math.PI);
      points.push([
        sx * spread + cz * 0.014 * Math.cos(turn),
        0.395 - t * length,
        cz * (spread - 0.035) - 0.016 - 0.049 * t + sx * 0.014 * Math.sin(turn)
      ]);
      radii.push(0.022 * (1 - 0.42 * t));
    }
    g.cord(points, radii, strand ? '#49332a' : HAIR, 6);
  }
  const x = sx * 0.29,
    z = cz * 0.254 - 0.065,
    y = 0.395 - length;
  g.oval(x, y, z, 0.023, 0.036, 0.022, HAIR);
  if (index % 2 === 0)
    g.profile(
      x,
      z,
      [
        [y + 0.012, 0.026, 0.025],
        [y + 0.016, 0.03, 0.029],
        [y + 0.048, 0.03, 0.029],
        [y + 0.052, 0.026, 0.025]
      ],
      GOLD,
      12
    );
}
function headModel(B, scene, bone, material) {
  const skin = surface(B, scene);
  skin.profile(
    0,
    0,
    [
      [-0.01, 0.045, 0.065, 0.028],
      [0.014, 0.112, 0.115, 0.032],
      [0.065, 0.175, 0.156, 0.031],
      [0.133, 0.217, 0.18, 0.021],
      [0.205, 0.249, 0.197, 0.011],
      [0.293, 0.255, 0.2, 0.003],
      [0.373, 0.241, 0.193, -0.004],
      [0.435, 0.204, 0.163, -0.011],
      [0.48, 0.078, 0.085, -0.015]
    ],
    WHITE,
    40,
    true
  );
  const portrait = builderFace(B, scene);
  skin.mesh('Builder face', bone, portrait);
  const g = surface(B, scene);
  g.oval(0, 0.216, 0.195, 0.028, 0.048, 0.022, '#a7633e');
  g.oval(0, 0.187, 0.214, 0.039, 0.024, 0.022, '#ad6741');
  for (const s of [-1, 1]) {
    g.oval(0.032 * s, 0.179, 0.207, 0.022, 0.015, 0.02, SKIN);
    g.oval(0.03 * s, 0.174, 0.225, 0.008, 0.004, 0.004, '#74402d');
    g.oval(s * 0.238, 0.217, -0.006, 0.046, 0.06, 0.04, SKIN);
    g.oval(s * 0.255, 0.22, 0.018, 0.024, 0.036, 0.014, '#85472f');
    g.oval(s * 0.255, 0.22, 0.031, 0.01, 0.015, 0.008, '#b97147');
    const hoop = [];
    for (let i = 0; i <= 20; i++) {
      const a = (tau * i) / 20;
      hoop.push([
        s * (0.26 + 0.029 * Math.sin(a)),
        0.149 + 0.041 * Math.cos(a),
        0.019 - 0.019 * Math.sin(a)
      ]);
    }
    g.cord(hoop, 0.008, GOLD, 7);
  }
  // Hairline follows the forehead, dropping lower at the nape.
  function scalpEdge(a) {
    const front = Math.cos(a);
    return [
      [0.244 * Math.sin(a), 0.236 + 0.13 * front, 0.199 * front - 0.006],
      [0.254 * Math.sin(a), 0.354 + 0.035 * front, 0.206 * front - 0.008],
      [0.232 * Math.sin(a), 0.44, 0.181 * front - 0.008]
    ];
  }
  for (let i = 0; i < 32; i++)
    g.panel(scalpEdge((i * tau) / 32), scalpEdge(((i + 1) * tau) / 32), HAIR);
  for (let i = 0; i < 23; i++) {
    const a = (i * tau) / 23,
      x = 0.235 * Math.sin(a),
      z = 0.178 * Math.cos(a) - 0.006;
    g.oval(
      x,
      0.332 + 0.069 * Math.cos(a),
      z,
      0.048,
      0.056,
      0.04,
      i % 3 === 0 ? '#402d25' : HAIR,
      12,
      7
    );
  }
  const hair = surface(B, scene);
  const angles = [1.04, 1.45, 1.87, 2.28, 2.7, 3.14, -2.7, -2.28, -1.87, -1.45, -1.04];
  angles.forEach((a, i) =>
    braid(hair, a, 0.54 + (i % 3) * 0.047 + (Math.cos(a) < 0 ? 0.065 : 0), i)
  );
  const tails = node(B, scene, 'Builder braids', bone, 0, 0, 0);
  hair.mesh('Twisted braids and cuffs', tails, material);
  // Six crown panels, a curved peak and a rear adjustment strap.
  const dome = [
    [0.382, 0.266, 0.22],
    [0.402, 0.276, 0.229],
    [0.448, 0.274, 0.226],
    [0.497, 0.26, 0.211],
    [0.548, 0.223, 0.183],
    [0.59, 0.166, 0.137],
    [0.61, 0.084, 0.07],
    [0.615, 0.013, 0.012]
  ];
  g.profile(0, -0.015, dome, YELLOW, 32);
  g.profile(
    0,
    -0.015,
    [
      [0.383, 0.268, 0.222],
      [0.396, 0.278, 0.231],
      [0.408, 0.277, 0.23]
    ],
    '#d79414',
    32
  );
  for (let i = 0; i < 6; i++) {
    const a = ((i + 0.5) * tau) / 6;
    g.cord(
      dome
        .slice(1)
        .map(([y, rx, rz]) => [(rx + 0.001) * Math.sin(a), y, (rz + 0.001) * Math.cos(a) - 0.015]),
      0.0035,
      '#ffd25a',
      5
    );
  }
  g.oval(0, 0.619, -0.015, 0.022, 0.01, 0.02, '#d89414');
  const upper = [],
    lower = [],
    rim = [];
  for (let i = 0; i <= 26; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 26;
    const x = 0.277 * Math.sin(a),
      c = Math.max(0, Math.cos(a));
    const back = [x, 0.396 - 0.023 * (1 - c), 0.028 + c * 0.12];
    const front = [x, 0.39 - 0.035 * (1 - c), 0.028 + c * 0.36];
    upper.push(back);
    lower.push(front);
    rim.push(front);
  }
  g.panel(upper, lower, '#ffc231');
  g.cord(rim, 0.009, '#e09a0e', 7);
  g.cord(
    rim.slice(2, -2).map(([x, y, z]) => [x * 0.98, y + 0.005, z - 0.012]),
    0.0025,
    '#ffd772',
    5
  );
  g.cord(
    [
      [-0.091, 0.393, -0.225],
      [0, 0.39, -0.248],
      [0.091, 0.393, -0.225]
    ],
    0.015,
    '#cf8d12'
  );
  g.oval(0.045, 0.393, -0.242, 0.018, 0.014, 0.009, GOLD);
  g.mesh('Cap, hairline and features', bone, material);
  return { tails, texture: portrait.diffuseTexture };
}
function overalls(g) {
  g.profile(
    0,
    0,
    [
      [-0.072, 0.094, 0.084],
      [-0.047, 0.156, 0.113],
      [0.006, 0.181, 0.135],
      [0.06, 0.192, 0.145],
      [0.13, 0.182, 0.137],
      [0.185, 0.173, 0.131]
    ],
    DENIM
  );
  g.profile(
    0,
    0,
    [
      [0.145, 0.17, 0.13],
      [0.23, 0.174, 0.132],
      [0.345, 0.196, 0.144],
      [0.397, 0.199, 0.132],
      [0.427, 0.143, 0.107],
      [0.435, 0.082, 0.076]
    ],
    CREAM
  );
  g.profile(
    0,
    0,
    [
      [0.405, 0.082, 0.078],
      [0.49, 0.075, 0.071],
      [0.525, 0.087, 0.078]
    ],
    SKIN
  );
  g.profile(
    0,
    0,
    [
      [0.421, 0.09, 0.082],
      [0.435, 0.088, 0.081]
    ],
    '#e9cd99'
  );
  // The bib and pockets follow the chest rather than projecting as a flat box.
  const bibLeft = [
    [-0.142, 0.096, 0.105],
    [-0.151, 0.2, 0.096],
    [-0.129, 0.31, 0.115],
    [-0.125, 0.346, 0.117]
  ];
  for (let i = 0; i < 8; i++) {
    const edge = (t) =>
      bibLeft.map(([x, y, z]) => [x * (1 - 2 * t), y, z + 0.048 * Math.sin(Math.PI * t)]);
    g.panel(edge(i / 8), edge((i + 1) / 8), DENIM);
  }
  for (const s of [-1, 1]) {
    const strap = [
      [s * 0.116, 0.32, 0.124],
      [s * 0.13, 0.38, 0.122],
      [s * 0.137, 0.429, 0.077],
      [s * 0.134, 0.438, 0],
      [s * 0.128, 0.424, -0.067],
      [s * 0.11, 0.37, -0.119],
      [s * 0.07, 0.3, -0.138],
      [s * 0.032, 0.238, -0.14],
      [s * 0.07, 0.155, -0.133]
    ];
    const edge = (dx) => strap.map(([x, y, z]) => [x + dx, y, z]);
    g.panel(edge(-0.027), edge(0.027), DENIM);
    g.cord(edge(s * 0.018), 0.0025, THREAD, 5);
    g.oval(s * 0.119, 0.337, 0.135, 0.023, 0.023, 0.009, GOLD);
    g.cord(
      [
        [s * 0.178, 0.145, 0.035],
        [s * 0.152, 0.105, 0.087],
        [s * 0.101, 0.08, 0.119]
      ],
      0.004,
      THREAD
    );
    const rear = [
      [s * 0.066, 0.118, -0.134],
      [s * 0.135, 0.122, -0.106],
      [s * 0.139, 0.074, -0.109],
      [s * 0.103, 0.052, -0.13],
      [s * 0.066, 0.07, -0.14]
    ];
    g.cord(rear, 0.0035, '#be9c55');
  }
  g.panel(
    [
      [-0.072, 0.264, 0.171],
      [-0.063, 0.192, 0.171],
      [-0.003, 0.17, 0.171]
    ],
    [
      [0.072, 0.264, 0.171],
      [0.063, 0.192, 0.171],
      [0.003, 0.17, 0.171]
    ],
    '#258183'
  );
  const pocket = [
    [-0.071, 0.264, 0.171],
    [0.071, 0.264, 0.171],
    [0.063, 0.192, 0.171],
    [0, 0.17, 0.171],
    [-0.062, 0.192, 0.171],
    [-0.071, 0.264, 0.171]
  ];
  g.cord(pocket, 0.004, THREAD);
  g.profile(
    0,
    0,
    [
      [0.145, 0.18, 0.138],
      [0.161, 0.18, 0.138]
    ],
    DEEP
  );
}
function limb(B, scene, root, torso, s, material) {
  const hip = node(B, scene, 'Builder hip', root, s * 0.107, 0.59, 0);
  const thigh = surface(B, scene);
  thigh.profile(
    0,
    0,
    [
      [-0.272, 0.073, 0.082],
      [-0.2, 0.085, 0.092],
      [-0.07, 0.099, 0.112],
      [0.015, 0.094, 0.106]
    ],
    DENIM
  );
  thigh.cord(
    [
      [s * 0.096, -0.04, 0],
      [s * 0.09, -0.14, 0],
      [s * 0.076, -0.245, 0]
    ],
    0.004,
    '#ba9656'
  );
  thigh.mesh('Dungaree leg', hip, material);
  const knee = node(B, scene, 'Builder knee', hip, 0, -0.246, 0);
  const boot = surface(B, scene);
  boot.profile(
    0,
    0,
    [
      [-0.252, 0.069, 0.079],
      [-0.154, 0.078, 0.085],
      [-0.052, 0.079, 0.088],
      [0.02, 0.075, 0.083]
    ],
    DENIM
  );
  boot.profile(
    0,
    0,
    [
      [-0.228, 0.08, 0.087],
      [-0.2, 0.082, 0.09]
    ],
    '#41918b'
  );
  boot.oval(0, -0.28, 0.033, 0.089, 0.066, 0.131, '#754b37');
  boot.profile(
    0,
    0.034,
    [
      [-0.343, 0.072, 0.108],
      [-0.336, 0.092, 0.136],
      [-0.314, 0.093, 0.134]
    ],
    '#463c36'
  );
  for (const d of [0.07, 0.092])
    boot.cord(
      [
        [-0.045, -0.235, d],
        [0, -0.226, d + 0.005],
        [0.045, -0.235, d]
      ],
      0.005,
      '#e1bf84'
    );
  boot.mesh('Cuffed trouser and boot', knee, material);
  const shoulder = node(B, scene, 'Builder shoulder', torso, s * 0.199, 0.377, 0);
  const upper = surface(B, scene);
  upper.oval(s * 0.017, -0.129, 0, 0.072, 0.119, 0.072, SKIN);
  upper.profile(
    s * 0.015,
    0,
    [
      [-0.137, 0.08, 0.08],
      [-0.117, 0.083, 0.082],
      [-0.03, 0.087, 0.084],
      [0.019, 0.069, 0.068],
      [0.04, 0.038, 0.042]
    ],
    CREAM
  );
  upper.profile(
    s * 0.015,
    0,
    [
      [-0.14, 0.082, 0.082],
      [-0.125, 0.084, 0.084]
    ],
    '#e9cfa2'
  );
  upper.mesh('Rolled shirt sleeve', shoulder, material);
  const elbow = node(B, scene, 'Builder elbow', shoulder, s * 0.021, -0.214, 0);
  const hand = surface(B, scene);
  hand.profile(
    0,
    0,
    [
      [-0.16, 0.041, 0.047],
      [-0.093, 0.056, 0.058],
      [-0.026, 0.065, 0.064],
      [0.023, 0.056, 0.056]
    ],
    SKIN
  );
  hand.oval(0, -0.181, 0.008, 0.05, 0.065, 0.049, SKIN);
  for (let i = 0; i < 4; i++)
    hand.oval(
      s * 0.004,
      -0.222 - Math.sin((i + 1) * 0.65) * 0.009,
      (i - 1.5) * 0.022 + 0.009,
      0.028,
      0.037,
      0.014,
      SKIN,
      10,
      6
    );
  hand.oval(-s * 0.026, -0.185, 0.051, 0.023, 0.041, 0.024, '#a6623e');
  hand.mesh('Forearm and hand', elbow, material);
  return { hip, knee, shoulder, elbow, side: s };
}
export function builder(B, scene) {
  const root = new B.TransformNode('Builder', scene);
  const material = new B.StandardMaterial('Builder moulded surfaces', scene);
  material.diffuseColor = B.Color3.White();
  material.specularColor = new B.Color3(0.07, 0.06, 0.05);
  material.specularPower = 40;
  const torso = node(B, scene, 'Builder torso', root, 0, 0.585, 0),
    head = node(B, scene, 'Builder head', torso, 0, 0.471, 0);
  const suit = surface(B, scene);
  overalls(suit);
  suit.mesh('Shirt and stitched overalls', torso, material);
  const { tails, texture } = headModel(B, scene, head, material);
  const limbs = [-1, 1].map((s) => limb(B, scene, root, torso, s, material));
  function pose(walking, seated, carrySide, airborne, t) {
    const carrying = carrySide !== 0;
    const moving = walking && !seated && !airborne;
    const gait = moving ? Math.sin(t * 11) : 0;
    torso.position.y = 0.585 + (moving ? 0.014 * Math.abs(gait) : 0.004 * Math.sin(t * 2.3));
    torso.rotation.y = gait * 0.055;
    head.rotation.z = seated ? 0.018 : Math.sin(t * 2) * 0.018;
    head.rotation.x = carrying ? 0.045 : 0;
    head.rotation.y = seated ? 0 : gait * -0.032 + Math.sin(t * 0.9) * 0.045;
    texture.vOffset = t % 4.37 > 4.21 ? 0 : 0.5;
    tails.rotation.x = moving ? 0.034 * Math.sin(t * 11 - 0.35) : 0;
    for (const { hip, knee, shoulder, elbow, side } of limbs) {
      const phase = side * gait;
      hip.rotation.x = seated ? -1.43 : airborne ? -0.34 : phase * 0.52;
      knee.rotation.x = seated ? 1.25 : airborne ? 0.67 : Math.max(0, -phase) * 0.58;
      shoulder.rotation.x = seated ? -0.74 : airborne ? -0.32 : -phase * 0.42;
      shoulder.rotation.z = side * 0.11;
      elbow.rotation.x = seated ? -0.74 : -0.22;
      if (carrying) {
        const supporting = carrySide === side;
        shoulder.rotation.x = supporting ? -0.23 : -0.65;
        shoulder.rotation.z = side * (supporting ? 0.22 : -0.48);
        elbow.rotation.x = supporting ? -1.16 : -1.03;
      }
    }
  }
  return { root, pose };
}
