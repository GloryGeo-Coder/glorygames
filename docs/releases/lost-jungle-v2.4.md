# Lost Jungle: Temple of the Sun — v2.4.0

Incremental update based on `512d98d2d5120845553432a3310216247f82ced9` (main). Public entry remains `/games/lost-jungle-3d-temple-of-the-sun/`. This is a 2D side-scrolling game; the historical URL is retained for compatibility.

## Campaign and gameplay

Ari, an apprentice cartographer, follows missing mentor Mara through a jungle losing its daylight. Relic hunter Voss has broken the Sun Lattice. Five chapters and five recovered Sun Seals lead to Mara's rescue and the restoration of the temple. Each route has a distinct briefing and discoveries during play. Stage 10 now opens the outer gate; the campaign ending is at stage 25.

All ten existing routes are longer; fifteen new routes extend the same jungle, ruins, river and cavern themes. Relics, keys and pressure plates remain mandatory where applicable. Side ledges offer treasure and supplies. Six guardian encounters retain the original three guardian identities, with later fights adding tougher patterns. Nine regular enemy types introduce swoops, charges, hops and aimed attacks progressively. Windups provide warning, and checkpoint beacons reduce the cost of a mistake.

Route width is measured in game world units. Regular enemy counts exclude the guardian and hazards; traversal time depends on play and exploration.

| Stage | Route | Width | Regular enemies | Guardian |
| --- | --- | ---: | ---: | --- |
| 1 | Jungle Entrance | 9,600 | 6 | — |
| 2 | River Crossing | 10,080 | 8 | — |
| 3 | Waterfall Ruins | 10,560 | 8 | — |
| 4 | Spider Cave | 11,040 | 11 | — |
| 5 | Monkey Bridge | 11,520 | 11 | Monkey King |
| 6 | Stone Puzzle Temple | 12,000 | 13 | — |
| 7 | Underground Crystal Cave | 12,480 | 15 | — |
| 8 | Lost Village | 12,960 | 17 | Spider Queen |
| 9 | Volcano Path | 13,440 | 19 | — |
| 10 | Outer Sun Gate | 13,920 | 21 | Sun Guardian |
| 11 | Mist Aqueduct | 14,400 | 23 | — |
| 12 | Orchid Gorge | 14,880 | 24 | — |
| 13 | Canopy Settlement | 15,360 | 25 | — |
| 14 | Moonlit Rootways | 15,840 | 26 | — |
| 15 | Canopy Observatory | 16,320 | 26 | Monkey King |
| 16 | Mossbound Archives | 16,800 | 27 | — |
| 17 | Thunderfall Ravine | 17,280 | 28 | — |
| 18 | Amber Caverns | 17,760 | 29 | — |
| 19 | Flooded Sanctuary | 18,240 | 30 | — |
| 20 | Heartwood Shrine | 18,720 | 31 | Spider Queen |
| 21 | Ashen Causeway | 19,200 | 31 | — |
| 22 | Sunken Sun Gardens | 19,680 | 32 | — |
| 23 | Serpent Crown Pass | 20,160 | 33 | — |
| 24 | Eclipse Stair | 20,640 | 34 | — |
| 25 | Temple of the Returning Sun | 21,120 | 35 | Sun Guardian |

## Animation and artwork

Five transparent atlases provide 60 actual poses across the explorer, nine regular enemies and three guardians. Fifteen new full-screen backgrounds accompany stages 11–25. The replacement thumbnail depicts the green explorer, side-scrolling platforms, relics and temple enemies seen in this game. Original 53 background, texture, item, sprite and effect PNGs are byte-identical; only the old thumbnail is replaced.

`assets/art-manifest.json` records every final generation prompt, dimensions, hashes and provenance for the 21 new/replaced images. `assets/animation/manifest.json` records atlas metadata. `tools/build-jungle-animation-data.py` derives alpha bounds and crop metadata without rewriting the art.

## Mobile and controls

The canvas fills the available viewport in portrait and landscape, responds to visual viewport changes and respects safe areas. Camera scale keeps the explorer readable on smaller screens. Render pixels and cached sprite sizes are bounded. Only the active background/texture/actors are retained. Touch input tracks each pointer separately, permitting direction plus Jump, Dash and held Shoot. Cancelled pointers, tab hiding and focus loss clear held inputs and pause safely. Panels and the map can scroll on short screens; browser zoom remains available.

- Move: A/D or arrows; Jump: Space/W/Up.
- Dash: Shift/J; Shoot: K/F; phone buttons support simultaneous holds.
- Pause: P/Escape; map: M or Map. Sound can be muted.
- Browser fullscreen remains available from the start screen where supported, with Alt+Enter during play.

## Saves and recovery

Existing save keys `wga_lost_jungle_2d_save_v1` and `wga_lost_jungle_2d_best_v1` are preserved. Existing unlocked stages, coins, score, best and mute preference migrate, including the old stage-11 unlock following completion of stage 10. Corrupt or unavailable storage is handled safely. Only reached stages can be selected. New completion records track recovered seals. Checkpoints, collected items and temporary powers are retained during recovery in the current mission; checkpoint position is not saved across a page reload. Reloading restarts the selected mission. No reset of other games is required.

## Validation and limits

675 automated checks pass: 650 Node checks (including 71 new Lost Jungle checks) and 25 React page checks. The shipped physics traverses every route to its exit while collecting required relics/keys, activating plates and using recovery points. Combat, hazards, powers, boss phases, projectiles, map locks, old saves, score transport and input interruptions are checked separately. Tests exercise six viewport dimensions and simultaneous touch controls. Native canvas renders were visually inspected at 390×844, 844×390 and 1366×768.

These adapters do not render browser CSS or prove physical iOS/Android performance. A full human combat playthrough and physical-device testing remain recommended before declaring final difficulty balance. Automated route checks isolate combat to establish reachability. Original WebAudio music and effects remain; this release adds no audio downloads.

## Install and rollback

1. Back up the current complete repository/game and browser save data.
2. Start from the complete repository at the base commit above. This ZIP is an overlay, not a complete application.
3. Extract the ZIP and copy only `files/` contents into the repository root, preserving paths. Game files land in `apps/web/public/games/lost-jungle-3d-temple-of-the-sun/`. Do not extract into another nested game folder.
4. Use the included exact file manifest to review additions/replacements. Nothing is deleted. Existing original artwork remains in place.
5. Run the documented tests and the normal OpenNext/Cloudflare build. Deploy through the existing main-branch build only after review. No Wrangler, routing, dependency or other game changes are needed.
6. For a local static test, serve the existing `apps/web/public` directory over HTTP and visit the unchanged game URL. Serving only this ZIP will miss unchanged dependencies and original art.

For rollback, restore the previous versions of the six modified files and remove only the added files in the manifest. Preserve browser saves. The ZIP contains `INSTALL.md`, an exact SHA-256 file manifest, and new/modified files only.

Validation commands (repository root unless stated):

```sh
node --test tests/*.test.mjs tests/*.test.cjs apps/web/scripts/*.test.cjs apps/web/scripts/*.test.mjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
NEXT_PRIVATE_STANDALONE=true node node_modules/next/dist/bin/next build --webpack
node node_modules/@opennextjs/cloudflare/dist/cli/index.js build --skipNextBuild
```
