# High Speed Racer 3D graphics upgrade

The dedicated game tab remains the platform standard. This release changes only the racer, its asset authoring source, documentation and tests. Sky Temple and the other games are unchanged.

The supplied reference establishes a red sports car, cyan/magenta neon, dark city architecture and glossy surfaces. Seven original glTF 2.0 binaries provide four garage vehicles, a seamless 128 m highway and two skyline towers. The cars have PBR paint, clearcoat, glass, emissive headlights/taillights, aero trim and separately animated wheel nodes. Geometry is batched by material; each car has 2,236 triangles and 14 primitives, the road has 876 triangles and five primitives. Existing GLBs, audio and thumbnails remain on disk unchanged.

The presentation layer supplies a generated image-based reflection atlas, cyan/magenta rim lights, inexpensive contact shadows, distant skyline geometry, a live menu car and a chase camera. Desktop gets restrained bloom. Phones use a lower pixel ratio, fewer scenery instances and no bloom. No realtime planar reflections or shadow maps are required. Reduced-motion preferences disable menu movement and bloom.

The original six routes, three laps, checkpoints, rival positions, traffic, collision rules, score calculations, rewards, car unlocks and upgrades remain. The canonical slug is still `high-spead-racer`; the save key remains `high-spead-racer-profile-v1`. Existing garage IDs, ownership migration and upgrade values are preserved. The game continues emitting the same score messages to the shared dedicated-tab bridge.

Related refinements fix held mobile Nitro being overwritten by keyboard polling, pause during a backgrounded countdown, stale car/effect references and spinning the imported wheels. Existing menu Audio and Help controls now work. WebGL startup/context errors show a recovery screen. Failed visual downloads retain the playable fallback and release the start button.

PlayCanvas 2.23.1 and its bloom script are bundled locally under the engine's MIT license. This removes the moving `playcanvas-stable` CDN dependency. Its fog API is used through `scene.fog.type`.

## Validation and remaining review

Run from the repository root:

```sh
node --test apps/web/scripts/high-speed-racer-*.test.*
node --test apps/web/scripts/game-tab-score.test.mjs apps/web/scripts/game-tab-ui.test.mjs
node --test tests/*.test.mjs tests/*.test.cjs
cd apps/web
node --import tsx --test scripts/game-tabs.test.tsx scripts/sky-temple-launch.test.tsx
npx opennextjs-cloudflare build
```

The racer tests use the actual shipped PlayCanvas engine and its NullGraphicsDevice. They import the actual new GLBs, build the scene, animate wheels, run controls/Nitro/pause, exercise collision and six-route completion, retain scores/saves and test failed asset downloads. DOM and audio are test adapters; these checks do not measure GPU appearance or frame rate. Separate tests inspect binary geometry budgets, asset links and phone/reduced-motion presets.

Local browser visual testing was blocked by the browser's URL security policy. Physical desktop/phone review is still needed before merging the graphics upgrade: inspect the live menu car, each route, paint/reflections, road seams, touch controls, HUD spacing, audio, restart, portrait/landscape rotation, fullscreen and save restoration. Use `?scores=0` on the direct game URL for score-free QA.

The pull request remains open for this review; this release is not a production deployment. Roll back a manual installation by restoring only the manifest's modified files and removing its added files. Existing assets and saves are unaffected.

Rebuild the seven original assets with `python3 tools/build-high-speed-racer-assets.py`; it requires only Python's standard library and does not alter the previous GLBs. Exported GLBs can be imported into Blender for further art work.
