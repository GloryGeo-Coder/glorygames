# Space Dodger 3D: Starfall Odyssey — v4.2

Incremental base: `GloryGeo-Coder/glorygames` main `aa700e3a768b25af3cb9c3f5756ec509401f66eb` (working v4.1 campaign).
Game entry stays `/games/space-dodger/`. The score alias stays `space-dodger-starfall-odyssey`.

## What changed

v4.2 replaces the six subdued procedural skies with eighteen independently generated cinematic space scenes, one for every sector. Rich nebulae, asteroid belts, icy comet fields, orbital structures, solar prominences, a lost fleet, ion storms and the Sovereign Citadel follow each mission's setting. Native image dimensions and the complete prompt set are recorded in `assets/backgrounds/sectors/manifest.json`. The checked-in JPEGs total about 10 MB; each sector loads only its own artwork.

The supplied screenshot showed an entirely white sky. The sky now samples the artwork directly through an unlit shader, with no diffuse/emissive colour calculation, lighting or fog. It is explicitly excluded from the reactor glow buffer. The opaque camera-enclosing sphere remains, while the shader computes a centred cover crop from the real render dimensions. This keeps desktop, portrait and ultrawide views filled without stretching or rectangular edges. Distant art stays fixed; nearby stars and debris provide forward travel.

A new image is bound only when ready. Sector changes cancel pending textures, retain the previous image while loading and dispose the replaced image after a successful swap. A navy texture covers initial loading; failures never bind a white emissive surface. Generation guards prevent stale loads from replacing the current sector or rebinding a disposed scene. Compatibility flight uses the same sector map and crop calculation, retaining its cached colourful sky if an image fails.

The v4.1 models, planets, engine trails, all eighteen missions, controls, combat, score events, audio, saves, mobile layout and shared dedicated-tab flow are preserved. No GLB, sprite atlas, thumbnail, old background, other game, dependency or deployment setting changes in this release.

The artwork was created with the built-in image-generation tool, then encoded as runtime JPEGs without resizing or changing the composition. `tools/package-starfall-backgrounds.py` accepts a source-map JSON containing the local generated PNG paths, file/name/scene prompt fields and shared prompt. It validates dimensions, hashes, image brightness and near-white coverage. It requires Pillow only during authoring. Original PNG hashes and the full shared/sector prompts are retained in the checked-in manifest; generated source PNGs are not needed by the browser.

The engine and glTF loader are pinned, self-hosted Babylon 9.31.0 files with license and byte/hash manifest. They match the existing repository's pinned runtime; Sky Temple's copies are unchanged. If detailed models fail to download, solid procedural safety geometry stays visible. Browsers without working WebGL retain a compatibility renderer with the same campaign progression and objective types.

The original twelve sectors remain in order. Six v4.0 additions follow the Mothership battle: the route is open, but the missing survey fleet and refugee Ark still need a path home.

| Sector | Region | Mission goal |
| --- | --- | --- |
| 13. Echoes of Asterion | Lost Survey Fleet | Collect four rescue pods, cores and targets |
| 14. Ion Tempest | Sapphire Storm | Leave charged lanes before their telegraphed discharge |
| 15. Relay Breaker | Silent Array | Destroy four command relays and defence drones |
| 16. Ark of the Dawn | Refugee Passage | Protect the Ark; finish with at least 20% integrity |
| 17. Singularity Crossing | Event Horizon | Pass five gates while correcting for gravity drift |
| 18. Heart of Starfall | Sovereign Citadel | Defeat the Sovereign through shield windows and escalating fire |

All sectors retain normal cores/target requirements, while new objectives are required for their respective missions. Guaranteed cores appear every 2.25 seconds near a reachable line, in addition to random pickups. Rescue pods, relays and navigation gates have dedicated replenishing spawn schedules so missing one does not permanently block a mission. The Ark loses integrity when raiders escape. Ion sectors telegraph and damage an occupied lane; gravity sectors apply a mild lateral current. The original Solar Furnace and gravity missions now also apply their described environmental effects.

## Combat and controls

- Solid ships bank under continuous flight control. Portrait camera framing and horizontal flight limits adapt to the actual aspect ratio.
- WASD/arrows fly, Space or held canvas fires, Shift boosts, E releases a plasma charge, P/Escape pauses, M mutes.
- Mobile supports drag-to-fly and simultaneous thruster/FIRE/BOOST buttons, plus a PLASMA button. Pointer capture/cancel and backgrounding release held controls.
- Automatic laser fire is enabled by default and can be switched off. Reduced camera effects respect the system preference and can be selected explicitly.
- Boost, lives, power-ups and encounter warnings are visible on the HUD. Pause suspends movement, damage and pending sector jumps. Visibility loss also pauses and suspends sound.
- Music and effects have separate saved volume settings. Audio remains gesture-unlocked, and no sound is required for gameplay.
- Boss cores cycle between shielded and exposed windows; plasma penetrates their shields. Their fire rate increases at low health. Shield drones reduce damage to nearby enemies, making them useful priority targets.
- Three lives permit two emergency hull reboots before failure. Hits have a short protection interval, avoiding damage on every overlap frame. Retry restores lives at the current sector.

## Progression and compatibility

Unlocked sectors, checkpoint score/hull/shield/lives and per-sector medals/records save under the additive `wga_starfall_campaign_v4` key. The existing `wga_space_dodger_starfall_odyssey_v3` best score remains compatible. Completed sectors stay replayable. Continue starts from the last sector entry, not a mid-sector frame. Restart Odyssey begins at sector one without erasing unlocked sectors or records.

Sector jumps use the game update clock rather than unmanaged timeouts. Pausing, leaving for the flight plan or ending a run cancels/freezes them correctly. Gate/relay/rescue counters reset per sector. Bosses cannot repeatedly respawn after defeat in compatibility flight.

The game still emits both legacy score events through the existing dedicated-tab bridge. The surrounding game information page retains description, instructions, FAQs, related games, score and chat, with its existing thumbnail/Play Game launch. The game information page continues to describe eighteen sectors. Racer, Sky Temple and other game code/assets are unchanged.

## Fixes included

The previously mismatched explosion function name is corrected. Projectiles test their travelled Z segment to avoid skipping targets between frames. Transient effects use owned materials, preventing fades from changing shared ship/gate materials. Effect material cleanup captures the material directly so scene disposal is safe. New sector entry clears previous boss meshes before resetting the boss reference. Spawn timers, flight inputs, temporary encounter counters and camera framing reset consistently.

## Validation

```sh
# Repository root
node --test apps/web/scripts/space-dodger-*.test.cjs
node --test apps/web/scripts/high-speed-racer-*.test.* apps/web/scripts/game-tab-score.test.mjs apps/web/scripts/game-tab-ui.test.mjs
node --test tests/*.test.mjs tests/*.test.cjs
cd apps/web
node --import tsx --test --test-reporter=tap scripts/game-tabs.test.tsx scripts/sky-temple-launch.test.tsx
npx opennextjs-cloudflare build
```

The Space suite uses the shipped Babylon engine with its NullEngine to parse actual GLBs and exercise geometry visibility/orientation, combat, swept laser hits, power-ups, damage/reboots, new objectives, all eighteen sector transitions, boss shield/plasma combat, pause/transition safety, checkpoint restoration, simultaneous controls, portrait camera bounds, audio state, cleanup and compatibility flight. Asset validation checks geometry budgets, finite coordinates, engine hashes, JSON and local references. Existing platform, Racer and Sky Temple tests remain part of release QA.

The visual regression checks cover all camera corner rays at 390×844, 844×390, 1920×1080 and 2560×720, anchored sky/planets, forward-only star travel, pause, full-canvas panorama cropping, texture replacement and baked image hashes. The offline EGL/GLES authoring renderer samples the actual eighteen JPEGs through the shipped sky shader at three aspect ratios (54 render checks), compares 486 GPU samples to source pixels and rejects uncovered or white-washed output. It also compiles the planetary shader. Its model contact sheets are visually reviewed; compatibility atlases are rendered with back-face culling enabled.

Geometry and compatibility artwork can still be regenerated with `python3 tools/build-starfall-assets.py`, then `python3 tools/render-starfall-assets.py`. This does not regenerate the new sector images or alter the retained v4.1 panoramas. The latter is an optional authoring tool requiring numpy, Pillow and Mesa EGL/GLES2 (GLVND dispatch is also supported). To inspect shaders/models, pass `--review /absolute/output/folder`. Generated files are checked in and require no Python, Mesa or image-generation service at runtime. `assets/models/starfall/assets.json` and `assets/visual-assets.json` record budgets, dimensions and hashes.

NullEngine checks do not certify GPU frame rate or perceived audio quality. Physical mobile touch ergonomics and rendered WebGL gameplay still need device playtesting. The cloud browser can exercise compatibility flight when WebGL is unavailable.

## Install and rollback

Apply the release ZIP over the base checkout at the repository root, keeping its `apps/`, `tools/`, `.github/` and `docs/` paths. It contains only added/modified files; existing assets and application dependencies are required. The ZIP's installation guide lists every file and its checksums. Validate this patch over the working v4.1 checkout before merging. The existing main-to-Cloudflare build deploys Worker `webgamearena`; no Worker, database or environment configuration changes are required.

For local review use the existing Next dev server and `/games/space-dodger/index.html?scores=0`, which disables leaderboard writes. Roll back by reverting the release PR, or restoring modified files from the base and removing only the listed additions. Existing best-score data remains readable; the additive campaign/audio records can remain stored for reinstalling the update.
