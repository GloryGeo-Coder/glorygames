# Recycle Rush v3.2 — Markets and community

Circuit’s story now continues from the restored school into Verdale’s market and community district. Five new missions bring the shipped story to **10 missions, 30 areas and 180 recovery tasks**, with 15 new community decisions and two playable Grime encounters. The separate 20-mission arcade campaign and endless Loop Mode remain available. The planned 25-mission story is being built in increments; this release delivers missions 6–10.

## New missions

| Mission | Story goal | Learning focus | Original music |
| --- | --- | --- | --- |
| 6 · Market Morning | Open Asha’s clean collection lane | Prepare packaging; separate food and dry materials | Market Morning Groove |
| 7 · The Food Loop | Organise the supervised food-compost point | Food scraps, packaging preparation and contamination | Garden Table |
| 8 · The Great Swap Day | Fill the exchange shelves and support Sam’s bench | Reuse, qualified repairs and approved special collection | Swap Day Shuffle |
| 9 · Before the Rain | Protect and dispatch Musa’s market collection | Keep paper dry; follow local acceptance lists | Shelter Before Rain |
| 10 · Light Up the Market | Restore the festival station with the community | Apply the recovery loop and clear Grime with three charged pulses | Verdale Afterglow |

All five missions contain three areas of six playable recovery objects. The established folding, emptying, scraping, reuse-check and qualified-repair activities, optional dragging, animated Circuit/Grime, project choices and saved checkpoints continue. Before each new area can advance, a neighbour presents a practical request with three possible plans. Wrong plans give an explanation and a recoverable correction; clues explain the principle. A correct decision saves and awards 50 points once. Retrying an area removes only its own decision, work, project and score; earlier checkpoints stay intact. Mission 10 also requires all tasks and decisions before the three-pulse finale.

Acceptance guidance describes the fictional local service rather than a universal bin-colour rule. Battery drop-offs remain supervisor-arranged, electrical assessment/testing stays with Sam, and broken glass is referred to an adult or trained collection worker. No dismantling or hazardous handling activity was added.

## Visuals, audio and mobile

A new market-square background matches the established warm Verdale artwork. It is a 1600 × 900 WebP of **306,384 bytes**, with a source/final hash record. Three new missions use it; the other two use the existing park and community scenes. All existing artwork and the thumbnail are preserved. The built-in image-generation prompt, final path and reference are recorded in [the art record](../art/recycle-rush-v3.2-prompts.md).

Each new mission has its own original procedural music theme, bringing story music to ten tracks. Existing music/effects controls, user-gesture audio startup, pause, unavailable-audio fallback and reduced motion remain supported. Community request controls use the existing robust pointer/touch binder and keyboard focus trap. Small-phone item labels fit their targets, and the scene status cannot cover them. Request panels scroll within the viewport.

## Saves and integration

The story key remains `wga_recycle_restore_v1`; its schema stays version 1 with an optional saved-decision map. Existing completed school saves keep their stars, results and completed finale, and unlock Market Morning without replaying the school. Partial school activities and battles continue to resume. New requests resume after refresh, pause or returning from the map. Arcade keys, unlocks, badges, settings, scoring and Loop Mode are unchanged. Mission counts in the menu, game metadata, catalog and information-page FAQ now agree.

This increment changes only Recycle Rush, its two automated QA scripts and its catalog/editorial copy. The dedicated game-tab/fullscreen integration and Cloudflare/OpenNext configuration remain unchanged.

## Validation

- Production Next.js build passed (`npm run build`). No Cloudflare build or deployment was run.
- Broad Node regression run: **1,160 passed**. Final Recycle Rush run after the provenance check: **34 passed**. React/TSX checks: **25 passed**.
- Real Chromium 151 QA passed at 320×568, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. Phone 390×844 and desktop 1440×900 completed all ten missions through ordinary UI actions. Other layouts completed the opening mission and Market Morning from a completed-school save. Browser runs reported no JavaScript, HTTP or asset-loading errors.
- Touch drag/cancellation, immediate next taps, activity/battle refreshes, request retries/clues/refreshes, rotation, fullscreen, keyboard modal focus, reduced motion and return to arcade were checked. Storage/audio failure checks passed. A separate 320×568 rerun verified final compact labels and request flow.
- All game JavaScript syntax, CSS parsing, JSON, entry-point asset references, unique HTML IDs, new WebP decoding and art hashes passed. Existing 20-mission arcade progression remains covered by regression tests.

## Exact files

Modified:

- `apps/web/public/games/recycle-rush/game.json`
- `apps/web/public/games/recycle-rush/index.html`
- `apps/web/public/games/recycle-rush/story-audio.js`
- `apps/web/public/games/recycle-rush/story-data.js`
- `apps/web/public/games/recycle-rush/story-play.js`
- `apps/web/public/games/recycle-rush/story.css`
- `apps/web/public/games/recycle-rush/story.js`
- `apps/web/scripts/recycle-rush-browser.cjs`
- `apps/web/scripts/recycle-rush.test.cjs`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`

Added:

- `apps/web/public/games/recycle-rush/assets/backgrounds/bg-market-square.webp`
- `apps/web/public/games/recycle-rush/assets/backgrounds/market-art.json`
- `docs/art/recycle-rush-v3.2-prompts.md`
- `docs/releases/recycle-rush-v3.2.md`

## Installation and next increment

After the feature PR merges, build/deploy the updated `main` using the existing Cloudflare setup when ready. No manual file placement, archive extraction, database change or save reset is needed. Existing players should refresh the dedicated game tab after deployment to load the updated scripts. Production verification remains pending that user-run deployment.

The next story increment is missions 11–15, taking the collection routes into the recovery district. Missions 16–20 cover repair and special collection; 21–25 complete the city-restoration arc.
