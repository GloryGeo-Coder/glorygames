# Map Master Africa: World Explorer — v5.4.0

Grade 8 Connections adds 12 missions / 72 tasks: **56 missions / 336 tasks** across independently playable Grades 4–8. Grades 9–10 remain planned. These original activities support topic practice, not a complete school course or official assessment.

Degrees/minutes/hemisphere controls submit exact angular-minute coordinates. Numeric tasks display units, require Check answer and accept finite decimal-point/comma entries. New investigations cover ratio scales, UTC/SAST/date rollover, seasons, monthly climate graphs, seven climate-region summaries, settlement land use, urbanisation, harbour transport and commuter access. Alternative open street routes remain accepted, including a via-point task. The seasonal comparison and twelve-month graphs include matching text/tables and clear schematic/fictional labels.

The first 44 mission definitions, save keys/format, all 39 PNGs and all world/province geometry are unchanged. Existing results, stars, current task, hints, attempts, legacy best and audio preferences are retained. Twelve additional quiet music roots serve the new missions. Grade 8 starts without clearing previous grades and unlocks later missions sequentially. Production information-page copy and the in-game Grades 4–10 guide match current availability.

## Validation

- 1,067 Node regression checks and 25 React platform checks passed. The focused Map Master suite has 78 checks, including complete 336-task controller runs at portrait and landscape sizes, old-definition hashing, v5.3 save retention, explicit answer submission, invalid/sparse coordinate inputs, unit/clock arithmetic, route alternatives and chart/table consistency.
- Real Chromium completed all 336 campaign tasks at 390×844 and retained 33,600 XP / 168 stars after reload. Nine further checked-answer smoke interactions and 31 layout checks covered 320×568, 844×390 and 1440×900, including Grade 7 regression views, Grade 8 controls/graphs and free-atlas switching. No page errors or failed requests were observed. Screenshots were inspected; physical iOS/Android devices were not available.
- Local `npm run build` exited successfully and produced a fresh Next BUILD_ID and compiled 56-mission/336-task metadata. No Cloudflare build or deploy command was used. JavaScript syntax, JSON, HTML entry references, CSS structure, retained-asset hashes and `git diff --check` passed. Build-generated dependency/Prisma changes are excluded.
- The runtime test adapter now caches connected nodes for `getElementById`, avoiding repeated full-world SVG/select scans while retaining stale-node detection. This affects tests only; browser gameplay uses native DOM APIs.

## Use and release

This increment applies over the complete v5.3 repository state; it is not a replacement application package. PR #42 was merged after its four checks passed, establishing that baseline. Open the v5.4 PR against `main`, require passing checks and merge it, as authorised by the user. The user runs the existing Cloudflare build/deployment workflow when ready. No Cloudflare configuration, workflow or dependency version is changed.

After merge, update a local checkout with `git pull --ff-only origin main`. The canonical entry remains `/games/map-master-africa/`; choose Grade 8 from the menu. Existing browser progress upgrades in place. The dedicated full-viewport game tab, fullscreen control, score bridge and website chat remain in place. No incremental ZIP is needed under the user's current GitHub delivery preference.

See `docs/learning/map-master-grade8-v5.4.md` for the curriculum matrix, primary references, arithmetic and explicitly deferred coverage.

## Exact files added or modified

- `apps/web/public/games/map-master-africa/academy-audio.js`
- `apps/web/public/games/map-master-africa/academy-content.js`
- `apps/web/public/games/map-master-africa/academy-engine.js`
- `apps/web/public/games/map-master-africa/academy-grade8.js`
- `apps/web/public/games/map-master-africa/connections-lab.js`
- `apps/web/public/games/map-master-africa/field-notes.js`
- `apps/web/public/games/map-master-africa/game.js`
- `apps/web/public/games/map-master-africa/game.json`
- `apps/web/public/games/map-master-africa/index.html`
- `apps/web/public/games/map-master-africa/styles.css`
- `apps/web/scripts/helpers/map-master-runtime.cjs`
- `apps/web/scripts/map-master-assets.test.cjs`
- `apps/web/scripts/map-master-audio.test.cjs`
- `apps/web/scripts/map-master-expansion.test.cjs`
- `apps/web/scripts/map-master-grade7.test.cjs`
- `apps/web/scripts/map-master-grade8.test.cjs`
- `apps/web/scripts/map-master-runtime.test.cjs`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`
- `docs/learning/map-master-grade8-v5.4.md`
- `docs/releases/map-master-v5.4.md`
- `docs/roadmaps/map-master-world-grades-4-10.md`
