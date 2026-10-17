import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGN_FX_PALETTES, FX_BUDGETS, fxBudget,
  guardianVisualCue, portalPulse, createCampaignVisuals,
} from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/campaign-visuals.mjs';

const root = '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/';
const paletteNames = ['garden', 'crystal', 'storm', 'solar'];
const islands = [
  { x: -11, y: -8, r: 6, h: .6 },
  { x: -5, y: 1, r: 5, h: 1.5 },
  { x: 7, y: 10, r: 7, h: 3.5 },
  { x: 15, y: -2, r: 4.2, h: 3.5 },
];
function vector() {
  return { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; }, setAll(n) { this.x = n; this.y = n; this.z = n; } };
}
function mockBabylon() {
  const nodes = [], materials = [];
  function mesh(name) {
    const n = {
      name, material: null, position: vector(), rotation: vector(), scaling: vector(),
      isPickable: true, checkCollisions: true, enabled: true,
      setEnabled(value) { this.enabled = Boolean(value); }, dispose() { this.disposed = true; },
    };
    nodes.push(n);
    return n;
  }
  class Material {
    constructor(name) { this.name = name; this.emissiveColor = vector(); this.diffuseColor = vector(); materials.push(this); }
    dispose() { this.disposed = true; }
  }
  const B = {
    StandardMaterial: Material,
    Color3: { FromHexString(hex) { const n = parseInt(hex.slice(1),16); return { r: (n>>16 & 255)/255, g: (n>>8 & 255)/255, b: (n & 255)/255 }; } },
    MeshBuilder: {
      CreatePolyhedron: mesh, CreateCylinder: mesh, CreateTorus: mesh,
    },
  };
  return { B, nodes, materials };
}
function createCase(world, mobile = true, reducedMotion = false) {
  const mock = mockBabylon();
  const art = { root: mock.B.MeshBuilder.CreatePolyhedron('boss root'), skinRoot: { rotation: vector() } };
  art.root.attackArmLeft = { rotation: vector() };
  art.root.attackArmRight = { rotation: vector() };
  const portalNode = mock.B.MeshBuilder.CreatePolyhedron('old portal');
  const heroRoot = mock.B.MeshBuilder.CreatePolyhedron('old hero');
  const layer = createCampaignVisuals(mock.B, { foo: 1 }, {
    world, mobile, reducedMotion, islands, guardianArt: art, portalNode, heroRoot,
  });
  return { ...mock, layer, art, portalNode, heroRoot };
}

for (const world of paletteNames) {
  test(`${world}: has a distinctive palette and safe phone geometry budget`, () => {
    assert.ok(/^#[0-9a-f]{6}$/i.test(CAMPAIGN_FX_PALETTES[world].glow));
    const budget = fxBudget({ world, mobile: true });
    assert.ok(budget.motes <= 8 && budget.beacons <= 4 && budget.bossShards <= 4);
    const a = createCase(world);
    assert.ok(a.layer.meshCount <= 28);
    assert.ok(a.nodes.filter(n=>n.name.startsWith('SkyTemple VFX')).length <= 28);
    for (const n of a.nodes.filter(n => n.name.startsWith('SkyTemple VFX'))) {
      assert.equal(n.isPickable, false, n.name);
      assert.equal(n.checkCollisions, false, n.name);
    }
    a.layer.dispose();
    a.nodes.filter(n => n.name.startsWith('SkyTemple VFX')).forEach(n=>assert.equal(n.disposed,true));
  });
  test(`${world}: living Guardian charges visibly and defeated Guardian hides cues`, () => {
    const a = createCase(world);
    const guardian = { active: true, defeated: false, phase: 2, mode: 'windup', pendingAttack: 'wave' };
    const originalArmZ = a.art.root.attackArmRight.rotation.z;
    a.layer.step(.033, 2, { guardian, portalReady: false });
    const ring=a.nodes.find(n=>n.name.includes('guardian cast halo'));
    const orbit=a.nodes.find(n=>n.name.includes('guardian orbit'));
    assert.equal(ring.enabled,true);
    assert.equal(orbit.enabled,true);
    assert.equal(a.art.root.attackArmRight.rotation.z, originalArmZ, 'existing boss animation untouched');
    guardian.active = false; guardian.defeated = true; guardian.mode = 'defeated';
    a.layer.step(.033, 2.2, { guardian, portalReady: true });
    assert.equal(ring.enabled,false);
    assert.equal(orbit.enabled,false);
    a.layer.dispose();
  });
  test(`${world}: blast flash and browser-fallback reset do not change gameplay state`, () => {
    const a=createCase(world);
    const flash=a.nodes.find(n=>n.name.includes('hero relic flash'));
    const before=a.nodes.length;
    a.layer.emit('blast');
    a.layer.step(.02,1.5, {portalReady:false});
    assert.equal(flash.enabled,true);
    a.layer.step(.4,2, {}); // dt intentionally clamped to .08, effects are frame-time safe
    a.layer.reset();
    assert.equal(flash.enabled,false);
    assert.equal(a.nodes.length,before,'no runtime mesh allocations');
    a.layer.dispose();
    a.layer.dispose(); // idempotent disposal
  });
}

test('reduced motion freezes moving motes and rotation while preserving visible highlights',()=>{
  const a=createCase('garden',true,true);
  const mote=a.nodes.find(n=>n.name.includes('mote 0'));
  const before=mote.position.y;
  a.layer.step(.04, 13, { portalReady: true });
  assert.equal(mote.position.y,before);
  const portalGlow=a.materials.find(m=>m.name.includes('portal energy'));
  assert.ok(portalGlow.emissiveColor.r>0);
  a.layer.dispose();
});
test('optional visual layer throttles ambient animation on low FPS, restores after recovery',()=>{
  const a=createCase('garden');
  const mote=a.nodes.find(n=>n.name.includes('mote 0'));
  for(let i=0;i<3;i++)a.layer.adaptiveBudget(19);
  assert.equal(mote.enabled,false);
  for(let i=0;i<8;i++)a.layer.adaptiveBudget(59);
  assert.equal(mote.enabled,true);
  a.layer.dispose();
});
test('phase and attack changes modify visual cues, not boss or collision rules',()=>{
  const idle=guardianVisualCue({world:'storm',phase:1});
  const charged=guardianVisualCue({world:'storm',mode:'windup',attack:'wave',phase:3});
  assert.ok(charged.coreScale>idle.coreScale);
  assert.ok(charged.runeScale>idle.runeScale);
  assert.equal(charged.castForm,'wave');
  assert.equal(guardianVisualCue({mode:'windup',attack:'sigil'}).castForm,'sigil');
  assert.equal(guardianVisualCue({mode:'windup',attack:'bolt'}).castForm,'arc');
  assert.equal(guardianVisualCue({reducedMotion:true}).crownSpeed,0);
  assert.ok(guardianVisualCue({mode:'defeated'}).visible === false);
});
test('portal glow differentiates locked vs complete campaign and respects reduced motion',()=>{
  for(const world of paletteNames){
    assert.ok(portalPulse({time:2,ready:true,world})>portalPulse({time:2,ready:false,world}));
    assert.equal(portalPulse({time:0,ready:true,world,reducedMotion:true}),portalPulse({time:500,ready:true,world,reducedMotion:true}));
  }
});
test('all four HTML entries and runtime files wire the shared module safely',()=>{
  for (const world of paletteNames){
    const dir = world==='garden'?root:`${root}${world}/`;
    const js = readFileSync(new URL(`${dir}game.js`, import.meta.url),'utf8');
    const html = readFileSync(new URL(`${dir}index.html`,import.meta.url),'utf8');
    for(const needle of ['createCampaignVisuals','tickCampaignVisuals(dt)','safelyRunCampaignVisuals','emitCampaignVisual(\'blast\')','campaignVisuals?.dispose()','campaignVisuals = null','URL_OPTIONS.get("fx") !== "off"']) {
      assert.ok(js.includes(needle),`${world}: missing ${needle}`);
    }
    assert.match(html,/game\.js\?v=0\.13/);
    assert.ok(js.includes('createCampaignSave'),`${world}: persistence removed`);
    assert.ok(js.includes('syncTouchControls'),`${world}: mobile controls removed`);
  }
});
test('budgets bound object counts and do not add postprocessing layers on mobile',()=>{
  assert.equal(FX_BUDGETS.mobile.portalRings,1);
  assert.equal(FX_BUDGETS.mobile.motes,8);
  const c=fxBudget({world:'crystal',mobile:true});
  assert.ok(c.motes<=3 && c.bossShards<=2 && c.beacons<=2);
  const a=createCase('crystal');
  assert.equal(a.materials.length,6);
  assert.ok(a.nodes.filter(n=>n.name.startsWith('SkyTemple VFX')).every(n=>!n.name.includes('blur')));
  a.layer.dispose();
});
test('invalid visual configuration fails locally and cannot modify the campaign',()=>{
  const fake=mockBabylon();
  assert.throws(()=>createCampaignVisuals(fake.B, {}, {world:'unknown'}),/Unknown Sky Temple world/);
  assert.throws(()=>createCampaignVisuals({}, {}, {world:'garden'}),/engine/);
});
