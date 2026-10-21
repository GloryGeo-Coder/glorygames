# Map Master Africa: World Explorer — v5.6.0

Grade 10 Geography adds **16 missions / 96 tasks**, bringing Map Master to **84 missions / 504 tasks across all seven Grades 4–10 paths**. Each grade starts independently and later missions unlock sequentially within it. Activities provide original topic practice, not a complete school course or an official assessment.

New mapwork includes exact degrees/minutes/seconds entry, an original South African-style sheet index, 16-point compass inspection, true/magnetic bearings, a fictional GIS layer investigation and a terrain profile matched to the existing hill. Further missions practise atmosphere/energy/moisture, weather-station interpretation, rocks/tectonics/hazards, population distribution/structure/movement/health access, and oceans/catchments/water planning. Graphs and diagrams have matching semantic tables, clear units and honest model/source labels. Free inspection never awards XP or consumes hints.

The first 68 mission definitions, save keys/format, all existing images and world/province geometry remain intact. Current results, stars, attempts, hints, cursor, audio preferences and prior best scores are retained. Sixteen quiet procedural themes are appended. The menu, curriculum guide, metadata and website information page now identify all seven grade paths as available.

Small-screen refinement keeps off-screen evidence captions inside their scroll container, constrains the application grid at maximum score/star counts, and preserves readable header text. New selects use 16 px text and at least 44 px targets. Profile endpoint labels retain clearance from existing feature targets when the map is resized.

## Validation

- **1,090 Node regression checks and 25 React platform checks passed.** The final focused Map Master suite has 101 checks, including two complete 504-task controller runs, the exact first-68-mission hash, v5.5 save retention, DMS invalid/boundary/retry cases, bearing/index conventions, unscored inspection, contour/profile agreement, GIS geometry, evidence arithmetic and source/asset provenance.
- **Chromium completed all 504 tasks at 390×844**, using the shipped native answer controls and map taps, and retained **50,400 XP / 252 stars after reload**. A saved completed campaign then exercised **45 additional checked-answer interactions and 30 layout checks** at 320×568, 844×390 and 1440×900. These include new seconds/station/compass/GIS/population/profile content and earlier minute/ruler/photo/street controls. Screenshots were inspected; the final runs had no page errors or failed requests. Physical iOS/Android devices were not available.
- Local **`npm run build` exited successfully**, created a fresh Next BUILD_ID and compiled the updated 84-mission/504-task website metadata. JavaScript syntax, JSON, local references, CSS structure, preserved assets and `git diff --check` passed. Build-generated dependency/Prisma edits are excluded. No Cloudflare build/deploy command was run.

## Scope and sources

The new values, declination, weather observation, GIS sites, population counts and water arithmetic are labelled fictional teaching models. The sheet-index graphic is original, not a scanned national map. The profile uses exact crossings of the preserved fictional contours and an exaggerated vertical display scale. The station plot supplies explicit °C/full hPa/knots rather than claiming a complete operational synoptic chart. Historical Nepal/Iceland/KwaZulu-Natal cases remain dated evidence.

See `docs/learning/map-master-grade10-v5.6.md` for the mission matrix, exact arithmetic, primary DBE/NOAA/NASA/USGS/WHO references and content limits. Deeper variant banks, licensed South African map/photo extracts, richer synoptic/GIS work, independent fieldwork and teacher review remain further work.

## Apply and release

Apply this increment over the complete v5.5 repository state. The feature PR targets `main`; merge only after required GitHub checks pass, as authorised by the user. Cloudflare build/deployment remains with the user. No Cloudflare configuration, CI workflow, dependency or database schema change is included.

After merge, update a local checkout with `git pull --ff-only origin main`. The canonical entry stays `/games/map-master-africa/`; choose Grade 10 from the menu. Existing browser saves upgrade in place. The dedicated full-viewport tab, fullscreen control, score bridge, information-page sections and website chat remain intact. No ZIP is required under the current GitHub delivery preference.

## Exact files added or modified

- `apps/web/public/games/map-master-africa/academy-audio.js`
- `apps/web/public/games/map-master-africa/academy-content.js`
- `apps/web/public/games/map-master-africa/academy-engine.js`
- `apps/web/public/games/map-master-africa/academy-grade10.js`
- `apps/web/public/games/map-master-africa/field-notes.js`
- `apps/web/public/games/map-master-africa/game.js`
- `apps/web/public/games/map-master-africa/game.json`
- `apps/web/public/games/map-master-africa/grade10-lab.js`
- `apps/web/public/games/map-master-africa/index.html`
- `apps/web/public/games/map-master-africa/interpretation-lab.js`
- `apps/web/public/games/map-master-africa/styles.css`
- `apps/web/scripts/helpers/map-master-runtime.cjs`
- `apps/web/scripts/map-master-assets.test.cjs`
- `apps/web/scripts/map-master-audio.test.cjs`
- `apps/web/scripts/map-master-expansion.test.cjs`
- `apps/web/scripts/map-master-grade10.test.cjs`
- `apps/web/scripts/map-master-grade7.test.cjs`
- `apps/web/scripts/map-master-grade8.test.cjs`
- `apps/web/scripts/map-master-grade9.test.cjs`
- `apps/web/scripts/map-master-runtime.test.cjs`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`
- `docs/learning/map-master-grade10-v5.6.md`
- `docs/releases/map-master-v5.6.md`
- `docs/roadmaps/map-master-world-grades-4-10.md`
