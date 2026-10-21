# Recycle Rush v3.1 — Animated recovery and hands-on play

The existing five Restore Verdale missions now use reference-matched sprite artwork, hands-on activities, optional drag sorting, project choices and a playable Grime finale. This increment deepens those missions rather than claiming that the future 25-mission story roadmap is complete. All twenty arcade missions, their save keys, original backgrounds, bosses, scoring and Loop Mode remain available.

## What players do

- Circuit walks toward a selected object, collects it, carries it and reacts when it is routed. Players can tap an item and destination, or drag to a destination. Dragging an unprepared object opens its activity without charging a routing mistake. Second pointers are ignored; cancellation, rotation and leaving the game clear the drag safely.
- Empty cardboard has two flaps to fold and a final press. A bottle is tipped toward the designated sink, emptied in stages and recapped for this fictional service. Three food scraps move to the supervised compost caddy. A book or shirt gets a condition/reuse check; electrical assessment and testing are performed by Sam, the qualified repairer. Every activity has visible buttons; swipes are optional. These activities require no quick gestures, countdown or precise timing.
- Preparation changes the item picture: the bottle is empty, the tray is cleared and the box is flat. Books, cartons, radios, containers and food scraps have distinct artwork rather than borrowing the same icon.
- Completing an area earns a choice of dry-paper shelter, community exchange shelf or food-compost caddy. One project is installed before advancing. The chosen projects appear in the scene and each choice explains its purpose. Project choices cannot farm score or remove an earlier checkpoint.
- Clean routing builds a visible streak and recovers energy. In The School of Tomorrow, all eighteen recovery tasks must be completed before Grime is exposed. The player then clears two visible clouds and fires a six-cell Loop Pulse, three times. All six clouds are unique, all three hits are required, and pauses, refreshes or leaving the tab cannot manufacture energy or completion. The encounter is untimed; reduced motion holds the clouds still. Pause Duel opens the ordinary audio/accessibility/retry menu.

## Art and audio

New artwork follows the user's thumbnail: glossy white/lime Circuit and a charcoal-purple Grime. Circuit has sixteen frames, organised into idle, walk, pickup/work and sort/celebration clips. Grime has eight idle/impact frames. Canvas animation selects fixed atlas cells; reduced motion holds a meaningful still. The arcade uses the new material images, an animated Circuit portrait, animated Grime hazards and the new final-boss frames. The other seven arcade boss identities remain intact.

Twenty new item/tool/prepared/project images and two atlases plus two standalone character stills total **791,422 bytes**. Assets are RGBA WebP with transparent padding, consistent character baselines and bounded cells. New runtime files live in `apps/web/public/games/recycle-rush/assets/animated/`. Original assets remain as fallbacks. The deterministic packing script, generation prompts, source hashes and final-file hashes are included; see `docs/art/recycle-rush-v3.1-prompts.md` and `assets/animated/manifest.json`.

The five original mission soundtracks continue, with separate music/effects volumes. Activity re-entry resumes the musical phrase rather than restarting it at each action. New cloud-clear, Loop Pulse and project-install cues supplement collection, preparation, sorting and completion sounds. Missing audio support or a blocked AudioContext does not stop play.

## Progress and mobile reliability

Story storage remains `wga_recycle_restore_v1`; existing stars, unlocks, points, prepared items and area progress are migrated in place. Old completed finales stay completed. Partial activities, project choices, recovered energy, cleared clouds and boss hits persist after each action. Retry This Area resets that area's activity/points and its battle state while retaining previous-area work. All arcade storage keys are unchanged.

The existing portrait/landscape layout, safe areas, large touch targets, grouped destination pages, keyboard operation, modal focus containment, fullscreen access and background pause remain. Activity and battle panels fit the phone/landscape viewport and scroll internally when the explanatory content needs more space. A failed save displays the existing saving-unavailable notice. These are local browser/origin saves, not cloud synchronization.

## Validation

- Twenty-nine dedicated tests run the shipped rules, actual arcade controller, audio scheduler and sprite helpers. They cover all ninety story recovery tasks, all five activity types, preparation gates and repeat protection, project choices, old-save migration, partial activity/battle resume, retry rollback, finale prerequisites and duplicate protection, malformed saves, every original arcade level, touch capture/cancellation, audio/storage failures, all twenty-four atlas frames, touch activation/click-through isolation, art references/hashes and a sub-megabyte image budget.
- Chromium QA covers 320×568, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. Each layout completes a story mission through visible controls; mobile and desktop complete all five with activities, projects and the three-phase finale. Additional checks cover physical touch-event drag/cancel, partial activity refresh, area checkpoints, battle refresh, rotation, fullscreen, live animation frames, alpha/cell geometry, actual arcade canvas sorting and blocked storage/audio. This is browser emulation rather than physical iOS/Android certification.
- Repository Node and React regressions, the local Next.js production build, JavaScript syntax, CSS parsing, JSON, unique HTML IDs and asset references are checked before merge. The dedicated GitHub workflow runs the updated syntax/rules/controller/art checks.

## Installation and deployment

Deploy the merged `main` branch through the owner's existing Cloudflare process. The game remains at `/games/recycle-rush/`, with information at `/play/recycle-rush`. No manual asset copying or ZIP is required. No Cloudflare build or deployment is run in this development session. No shared launch module, unrelated game or existing image/model file is replaced.

## Exact incremental files

### Modified

- `.github/workflows/recycle-rush.yml`
- `apps/web/public/games/recycle-rush/game.js`
- `apps/web/public/games/recycle-rush/game.json`
- `apps/web/public/games/recycle-rush/index.html`
- `apps/web/public/games/recycle-rush/story-audio.js`
- `apps/web/public/games/recycle-rush/story-data.js`
- `apps/web/public/games/recycle-rush/story.css`
- `apps/web/public/games/recycle-rush/story.js`
- `apps/web/scripts/recycle-rush-browser.cjs`
- `apps/web/scripts/recycle-rush.test.cjs`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`

### Added

- `apps/web/public/games/recycle-rush/assets/animated/apple.webp`
- `apps/web/public/games/recycle-rush/assets/animated/battery.webp`
- `apps/web/public/games/recycle-rush/assets/animated/book.webp`
- `apps/web/public/games/recycle-rush/assets/animated/bottle.webp`
- `apps/web/public/games/recycle-rush/assets/animated/box-flat.webp`
- `apps/web/public/games/recycle-rush/assets/animated/box.webp`
- `apps/web/public/games/recycle-rush/assets/animated/can.webp`
- `apps/web/public/games/recycle-rush/assets/animated/carton.webp`
- `apps/web/public/games/recycle-rush/assets/animated/circuit-atlas.webp`
- `apps/web/public/games/recycle-rush/assets/animated/circuit-idle.webp`
- `apps/web/public/games/recycle-rush/assets/animated/compost-caddy.webp`
- `apps/web/public/games/recycle-rush/assets/animated/glass.webp`
- `apps/web/public/games/recycle-rush/assets/animated/grime-atlas.webp`
- `apps/web/public/games/recycle-rush/assets/animated/grime-idle.webp`
- `apps/web/public/games/recycle-rush/assets/animated/juice.webp`
- `apps/web/public/games/recycle-rush/assets/animated/manifest.json`
- `apps/web/public/games/recycle-rush/assets/animated/newspaper.webp`
- `apps/web/public/games/recycle-rush/assets/animated/paper-bundle.webp`
- `apps/web/public/games/recycle-rush/assets/animated/peel.webp`
- `apps/web/public/games/recycle-rush/assets/animated/radio.webp`
- `apps/web/public/games/recycle-rush/assets/animated/shirt.webp`
- `apps/web/public/games/recycle-rush/assets/animated/spanner.webp`
- `apps/web/public/games/recycle-rush/assets/animated/tray-empty.webp`
- `apps/web/public/games/recycle-rush/assets/animated/tray.webp`
- `apps/web/public/games/recycle-rush/assets/animated/wetpaper.webp`
- `apps/web/public/games/recycle-rush/story-input.js`
- `apps/web/public/games/recycle-rush/story-play.js`
- `apps/web/public/games/recycle-rush/story-sprites.js`
- `apps/web/scripts/recycle-sprite-pack.cjs`
- `docs/art/recycle-rush-v3.1-prompts.md`
- `docs/releases/recycle-rush-v3.1.md`

All 43 files apply over the complete v3.0 repository. The image-generation prompt set and saved paths are recorded in the art document listed above.
