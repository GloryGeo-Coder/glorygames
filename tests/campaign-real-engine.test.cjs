const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d');
const B = require(path.join(root, 'vendor/babylon-9.31.0.js'));
vm.runInNewContext(fs.readFileSync(path.join(root, 'vendor/babylon-loaders-9.31.0.min.js'), 'utf8'), {
  BABYLON: B, module: { exports: {} }, exports: {}, require: id => { assert.equal(id, 'babylonjs'); return B; },
  console, TextDecoder, TextEncoder, URL, Blob, ArrayBuffer, Uint8Array, setTimeout, clearTimeout,
});
for (const file of fs.readdirSync(path.join(root, 'assets')).filter(x => x.endsWith('.glb'))) {
  test(`real Babylon ${B.Engine.Version}: imports and renders ${file} with valid geometry`, async () => {
    const engine = new B.NullEngine({ renderWidth: 128, renderHeight: 128 });
    const scene = new B.Scene(engine);
    try {
      const result = await B.SceneLoader.ImportMeshAsync(null, '',
        new Uint8Array(fs.readFileSync(path.join(root, 'assets', file))), scene, undefined, '.glb');
      assert.ok(result.meshes.length > 1);
      const meshes = result.meshes.filter(m => m.getTotalVertices() > 0);
      assert.ok(meshes.length > 0); assert.ok(meshes.every(m => m.getTotalVertices() > 0));
      new B.FreeCamera('Asset verification camera', new B.Vector3(0, 5, 12), scene).setTarget(B.Vector3.Zero());
      new B.HemisphericLight('Asset verification light', new B.Vector3(0, 1, 0), scene);
      for (const mesh of meshes) {
        mesh.computeWorldMatrix(true);
        const box = mesh.getBoundingInfo().boundingBox;
        assert.ok([box.minimumWorld.x, box.minimumWorld.y, box.minimumWorld.z,
          box.maximumWorld.x, box.maximumWorld.y, box.maximumWorld.z].every(Number.isFinite));
      }
      if (/RelicHero_Rigged/.test(file)) {
        assert.equal(result.skeletons.length, 1);
        for (const name of ['Idle', 'Walk', 'Run', 'Jump', 'Glide', 'Land', 'Blast', 'Hit', 'Victory']) {
          const clip = result.animationGroups.find(g => g.name === name); assert.ok(clip, name);
          clip.start(false); scene.render(); clip.stop();
        }
      }
      scene.render(); assert.ok(scene.meshes.length > 0);
    } finally { scene.dispose(); engine.dispose(); }
  });
}
