# Physics Force Lab v5.0 — The Illustrated World of Nova

All eight playable/NPC/enemy roles now use the polished illustrated style of the approved v4.9 thumbnail: the young scientist, Professor Newtonia, Pip, orange Glitch robot, attack drone, Magnet robot, purple GlitchBot and gold maintenance patrol. Ninety-six drawn source poses are packed into all 227 existing animation frames and 40 action clips. Running, jumping, landing, repairs, tool use, celebration, scanning, attacks, recoil and shutdown now use cover-matched artwork. Feet anchors, body bounds, clip durations and gameplay collision geometry retain their existing values.

Twelve new environments replace the visible backgrounds throughout both modes: workshop, motion gallery, gravity chamber, friction factory, energy reactor, machines workshop, circuit causeway, magnet lab, wave/light gallery, pressure/water dome, orbital observatory and Quantum Core. Every existing mission/background reference selects a corresponding new location. Backgrounds fill the playfield without stretching, including portrait phones and short landscape screens. Shaded metal platforms use readable mint/amber upper edges. Quiet atmospheric lights respect reduced motion.

## Scope and performance

The 30 Adventure missions, 90 repairs, 55 revision concepts and 12 Original Labs remain intact. The educational models, mission definitions, progression, controls, fullscreen behavior, scoring, audio and save schemas are unchanged. The approved thumbnail is unchanged. Original image/procedural fallbacks remain available if new assets or their modules fail to load. No publication staging files or incremental ZIP is needed.

All eight runtime RGBA PNG atlases total 3,159,887 bytes (about 3.01 MiB). Their dimensions and decoded pixel allocation remain the same as v4.6, below 32 MiB in total. The twelve 1024 × 576 WebP backgrounds total 1,425,816 bytes (about 1.36 MiB). The loader requests locations on demand, shares requests for aliases and retains only three unique locations in its active cache; it no longer eagerly loads all campaign backgrounds. Artwork source sheets live outside public assets and are not downloaded during play.

## Artwork paths and method

The built-in image-generation tool produced eight transparent pose sheets and six paired environment illustrations. Sharp only extracts complete silhouettes, packs/scales poses, crops environment panels and encodes image formats. It does not repaint the artwork. The final saved runtime assets are:

- `apps/web/public/games/physics-force-lab/assets/characters/player.png`
- `apps/web/public/games/physics-force-lab/assets/characters/professor.png`
- `apps/web/public/games/physics-force-lab/assets/characters/helper.png`
- `apps/web/public/games/physics-force-lab/assets/characters/glitch.png`
- `apps/web/public/games/physics-force-lab/assets/characters/drone.png`
- `apps/web/public/games/physics-force-lab/assets/characters/magnetBot.png`
- `apps/web/public/games/physics-force-lab/assets/characters/boss.png`
- `apps/web/public/games/physics-force-lab/assets/characters/maintenance.png`
- Twelve `apps/web/public/games/physics-force-lab/assets/worlds/*.webp` files, named exactly for the twelve locations listed above (`workshop`, `motion`, `gravity`, `friction`, `energy`, `machines`, `circuit`, `magnet`, `waves`, `pressure`, `space`, `core`).

The exact built-in prompt set, identity references and framing refinements are recorded in [`tools/physics-art-source/prompts.json`](../../tools/physics-art-source/prompts.json). The eight lossless source sheets use the same character basenames under `tools/physics-art-source/characters/`, with `.webp` extensions. Repacking instructions are in [the artwork README](../../tools/physics-art-source/README.md). Rebuild with `node tools/build-physics-characters.cjs`; no new package is required. The reviewed cast and environment contact sheets are `docs/releases/physics-force-lab-v5.0-cast.png` and `docs/releases/physics-force-lab-v5.0-worlds.webp`.

## Validation

- 101 Physics Node regression checks, including source/atlas hashes, transparency, padded edges, every clip, the background mapping, cover framing, cache eviction and image failure recovery.
- Character browser regression covers player actions, all enemy attacks/hits, boss charge/fire/hit/defeat, scoring, pause, reduced motion, nine layouts and missing atlases/modules.
- World-art browser regression decodes all twelve images in both entries, checks opaque viewport edges across six layouts, renders final Core fixtures, checks bounded caching and verifies play when new backgrounds, both background formats or the world-art module are blocked.
- Existing revision and display/fullscreen checks cover thirteen viewport sizes, refresh, saved progress, rotation, touch targets, simulated safe areas and unsupported/denied fullscreen. Original Lab fixtures cover all twelve levels, with nine responsive layouts. Adventure smoke checks cover movement and repair controls in portrait/landscape.
- Actual phone, desktop and final-boss screenshots were visually inspected. The Next.js 16 production build, TypeScript and JavaScript syntax checks pass. Shared game-page/score checks run locally and in GitHub Actions before merge.

Browser checks use Chromium emulation. They are not a physical-device Safari certification or a new end-to-end playthrough of all 30 missions. All thirteen display sizes pass in the isolated suite. The new edge test waits for resize observers to settle before sampling canvas pixels.

## Installation and deployment

Merge the feature PR, pull `main` and use the existing Cloudflare/OpenNext build and deployment workflow. No save migration or database change is needed. The owner performs the Cloudflare deployment.

## Exact additional source files

Alongside the artwork files above, this release adds `world-art.js`, `physics-world-art.test.cjs`, `physics-world-art-browser.cjs`, `tools/physics-illustrated-poses.cjs`, the artwork README/prompt record and these three v5.0 release documents/contact sheets. It modifies `adventure.js`, `game.js`, `game.json`, both HTML entries, `character-sprite-data.js`, `physics-characters.test.cjs`, `tools/build-physics-characters.cjs` and the Physics CI workflow to run the new browser coverage. No other game or website component is modified.
