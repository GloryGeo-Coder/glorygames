# Map Master Africa: World Explorer — v5.5.0

Grade 9 Interpretation adds 12 missions / 72 tasks: **68 missions / 408 tasks** across independently playable Grades 4–9. Grade 10 remains planned. Activities support topic practice, not a complete school course or official assessment.

A separate fictional metric contour plan supports slope/height reading, native/touch feature selection and two-endpoint straight-distance measurements. Editing, pan/zoom and Reset are unscored; only Check measurement submits. A real public-domain USGS orthoimage supports historical image interpretation, with an explicit source, publication/capture-date distinction and no invented ground scale. Development comparisons use current UNDP HDI terminology. Other missions investigate weathering, erosion/deposition, a soil-cover trial, renewable resources, food security and sustainable project choices. Matching tables accompany graphs and schematic diagrams.

The first 56 mission definitions, existing save keys/format, all 39 original PNG assets and world/province geometry remain unchanged. Results, stars, current task, hints, attempts, best score and audio settings are retained. Twelve quiet themes are appended. Website copy and the visible Grades 4–10 guide match the six currently playable grade paths.

## Validation

- 1,078 Node regression checks and 25 React platform checks passed. The final focused Map Master suite has 89 checks, including complete 408-task controller runs at portrait/landscape sizes, pinned old-mission definitions, v5.4 save retention, nested contour geometry, distance units, reversed endpoints, invalid/photo-coordinate rejection, pointer cancellation, keyboard focus, source/asset hashing and evidence arithmetic.
- Real Chromium completed all 408 campaign tasks at 390×844, retained 40,800 XP / 204 stars after reload, and performed 21 additional checked-answer interactions plus 46 layout checks. After compact-map label refinement, a final browser smoke run repeated 21 checked-answer interactions and 45 layouts at 320×568, 844×390 and 1440×900. Map/scale labels and screenshots were inspected. No page errors or failed requests were observed in the completed runs. Physical iOS/Android devices were not available.
- Local `npm run build` exited successfully, generated a fresh Next BUILD_ID and compiled the updated 68-mission/408-task metadata. No Cloudflare build/deploy command was run. JavaScript syntax, JSON, entry/asset references, CSS structure, preserved assets and `git diff --check` passed. Build-generated dependency/Prisma changes are excluded.

## Source and content limits

The additional JPEG is 226034 bytes (1336×692), bundled unchanged from a USGS public-domain rendition. Its adjacent manifest records credit, source URLs and SHA-256. Labels are a separate SVG overlay. The historical US image and fictional contour plan are different places; neither is presented as a licensed South African national map/photo sheet. Supplied paper-scale exercises introduce 1:50000 and 1:10000 relationships. Real South African sheet extracts, a real-country HDI thematic layer and independent fieldwork remain later content. See `docs/learning/map-master-grade9-v5.5.md` for the mission matrix, primary references and exact model arithmetic.

## Apply and release

This increment applies over the complete v5.4 repository state. Open a feature PR to `main`, wait for required GitHub checks and merge, as authorised by the user. Cloudflare build/deployment remains with the user. No Cloudflare configuration, CI workflow, dependency or database schema changes are included.

After merge, update a local checkout with `git pull --ff-only origin main`. The canonical entry remains `/games/map-master-africa/`; choose Grade 9 from the menu. Existing browser saves upgrade in place. The dedicated full-viewport game tab, fullscreen control, score bridge and website chat are preserved. No incremental ZIP is required under the current GitHub delivery preference.

## Exact files added or modified

- `apps/web/public/games/map-master-africa/academy-audio.js`
- `apps/web/public/games/map-master-africa/academy-content.js`
- `apps/web/public/games/map-master-africa/academy-engine.js`
- `apps/web/public/games/map-master-africa/academy-grade9.js`
- `apps/web/public/games/map-master-africa/assets/learning/manifest.json`
- `apps/web/public/games/map-master-africa/assets/learning/usgs-washington-ortho.jpg`
- `apps/web/public/games/map-master-africa/atlas-view.js`
- `apps/web/public/games/map-master-africa/field-notes.js`
- `apps/web/public/games/map-master-africa/game.js`
- `apps/web/public/games/map-master-africa/game.json`
- `apps/web/public/games/map-master-africa/index.html`
- `apps/web/public/games/map-master-africa/interpretation-lab.js`
- `apps/web/public/games/map-master-africa/styles.css`
- `apps/web/scripts/helpers/map-master-runtime.cjs`
- `apps/web/scripts/map-master-assets.test.cjs`
- `apps/web/scripts/map-master-audio.test.cjs`
- `apps/web/scripts/map-master-expansion.test.cjs`
- `apps/web/scripts/map-master-grade7.test.cjs`
- `apps/web/scripts/map-master-grade8.test.cjs`
- `apps/web/scripts/map-master-grade9.test.cjs`
- `apps/web/scripts/map-master-runtime.test.cjs`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`
- `docs/learning/map-master-grade9-v5.5.md`
- `docs/releases/map-master-v5.5.md`
- `docs/roadmaps/map-master-world-grades-4-10.md`
