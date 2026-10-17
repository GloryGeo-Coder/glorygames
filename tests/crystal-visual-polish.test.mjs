import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {
  CRYSTAL_VFX_BUDGET, wardenVisualPose, cavernGlowLevel,
  createCrystalVisualPolish,
} from '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/crystal/visual-polish.mjs';

const base = { time: 1.6, phase: 2 };

test('Warden animations distinguish all three attack warnings', () => {
  const bolt = wardenVisualPose({ ...base, mode: 'windup', attack: 'bolt' });
  const sigil = wardenVisualPose({ ...base, mode: 'windup', attack: 'sigil' });
  const wave = wardenVisualPose({ ...base, mode: 'windup', attack: 'wave' });
  assert.notEqual(bolt.armX, sigil.armX);
  assert.notEqual(sigil.armX, wave.armX);
  assert.notEqual(bolt.leftZ, wave.leftZ);
  assert.ok(bolt.glow > 0.6);
  assert.ok(sigil.ringScale > 1.1);
});

test('Warden pose is deterministic and phase three increases energy', () => {
  const one = wardenVisualPose({ time: 7, mode: 'windup', attack: 'bolt', phase: 1 });
  const three = wardenVisualPose({ time: 7, mode: 'windup', attack: 'bolt', phase: 3 });
  assert.deepEqual(one, wardenVisualPose({ time: 7, mode: 'windup', attack: 'bolt', phase: 1 }));
  assert.ok(three.glow > one.glow);
});

test('reduced motion removes decorative bob and orbit but keeps warnings', () => {
  const pose = wardenVisualPose({ ...base, mode: 'windup', attack: 'wave', reducedMotion: true });
  assert.equal(pose.bob, 0);
  assert.equal(pose.bodyTilt, 0);
  assert.equal(pose.ringSpeed, 0);
  assert.ok(Math.abs(pose.leftZ) > .7);
  assert.ok(Math.abs(pose.rightZ) > .7);
});

test('inactive portal remains dimmer than the unlocked portal', () => {
  const locked = cavernGlowLevel({ time: 0, portalReady: false });
  const open = cavernGlowLevel({ time: 0, portalReady: true });
  assert.ok(open > locked);
  assert.ok(open < 1);
});

test('mobile visual budget is smaller than desktop and has bounded geometry', () => {
  const mobile = CRYSTAL_VFX_BUDGET.mobile;
  const desktop = CRYSTAL_VFX_BUDGET.desktop;
  for (const key of Object.keys(mobile)) assert.ok(mobile[key] < desktop[key], key);
  assert.ok(Object.values(mobile).reduce((a, b) => a + b, 0) <= 30);
});

test('visual module updates and disposes using existing boss and portal without changing gameplay state', () => {
  globalThis.window = globalThis;
  const babylonShim = fs.readFileSync(new URL('./babylon-test-shim.js', import.meta.url), 'utf8');
  vm.runInThisContext(babylonShim);
  const B = window.BABYLON;
  const scene = new B.Scene();
  const root = new B.TransformNode('boss');
  root.attackArmLeft = new B.TransformNode('left');
  root.attackArmRight = new B.TransformNode('right');
  const art = {
    root, ground: 2.4, skinRoot: new B.TransformNode('ornate'),
    core: new B.TransformNode('core'), halo: new B.TransformNode('halo'),
    floatingShards: Array.from({ length: 4 }, (_, i) => new B.TransformNode('shard' + i)),
    crystal: new B.StandardMaterial('core material'), hitFlash: .2,
  };
  art.crystal.emissiveColor = B.Color3.FromHexString('#8e50e9');
  const portalNode = new B.TransformNode('portal');
  const islands = [
    { x: -13, y: -11, h: .2, r: 5.58 },
    { x: -4, y: 0, h: 1, r: 4.42 },
    { x: 9, y: 12, h: 2.4, r: 6.51 },
    { x: 17, y: -6, h: 3.8, r: 4.34 },
  ];
  const guardian = {
    active: true, hp: 15, phase: 1,
    mode: 'windup', pendingAttack: 'sigil',
  };
  const visual = createCrystalVisualPolish(B, scene, {
    islands, guardianArt: art, portalNode, mobile: true, reducedMotion: false,
  });
  visual.updateAmbient(.033, 1);
  visual.setPortalReady(true);
  visual.updateAmbient(.033, 2);
  visual.updateWarden(.033, 2, guardian, art);
  assert.equal(guardian.hp, 15);
  assert.equal(guardian.pendingAttack, 'sigil');
  assert.ok(Math.abs(art.root.attackArmLeft.rotation.z) > 1);
  assert.ok(Number.isFinite(art.core.rotation.x));
  assert.ok(Number.isFinite(art.halo.scaling.x));
  assert.equal(visual.budget.ambientMotes, 12);
  visual.dispose();
});
