# Map Master Africa: World Explorer — v5.2.0

Grade 6 now has 12 missions / 72 tasks. The game totals **32 missions / 192 tasks** across independent Grade 4, 5 and 6 paths. Coordinates, word and line scales, trade, world climate/vegetation and population/settlement investigations extend the curriculum journey. Grades 7–10 remain planned. These activities support practice, not a complete course or official assessment.

Coordinate tasks add native latitude/longitude selectors and map-tap previews before explicit submission. A fictional kilometre plan carries a line scale that zooms with the map. World layers compare seven labelled fictional profiles, with accessible tables for January/July temperatures, annual rainfall and vegetation. Zoom controls have their own strip beside the SVG so they cannot obscure map targets on phones. Twelve additional quiet procedural themes retain the previous 20 arrangements.

The first 20 mission definitions, save format/keys and all existing geographic/image assets remain unchanged. Existing scores, hints, stars, cursors, settings and platform integration are preserved. Website descriptions and FAQs match the available grades. Mission/topic mapping and evidence limitations are documented in `docs/learning/map-master-grade6-v5.2.md`.

## Installation and release

The repository remains the source of truth: game files live in `apps/web/public/games/map-master-africa/`. Merge the checked feature PR into `main`; the existing GitHub/Cloudflare integration builds and publishes the site. No ZIP, manual asset upload, migration, dependency change or deployment-configuration change is needed. Existing players keep their browser storage. A normal reload loads the versioned scripts/styles.

## Changed files

Added:

- `apps/web/public/games/map-master-africa/academy-grade6.js`
- `apps/web/public/games/map-master-africa/world-layers.js`
- `apps/web/scripts/map-master-grade6.test.cjs`
- `docs/learning/map-master-grade6-v5.2.md`
- `docs/releases/map-master-v5.2.md`

Modified:

- Game directory: `academy-audio.js`, `academy-content.js`, `academy-engine.js`, `atlas-view.js`, `game.js`, `game.json`, `index.html`, `styles.css`.
- Test directory: `helpers/map-master-runtime.cjs`, `map-master-assets.test.cjs`, `map-master-audio.test.cjs`, `map-master-expansion.test.cjs`, `map-master-runtime.test.cjs`.
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`
- `docs/roadmaps/map-master-world-grades-4-10.md`

## Validation

- 1,047 Node regression checks and 25 React platform checks passed; the 58 Map Master checks include complete 192-task runs at portrait/landscape controller sizes.
- Real Chromium completed all 192 tasks at 390×844 through visible game controls, then retained 19,200 XP and 96 stars after reload. Final browser layout/smoke checks covered 320×568, 844×390 and 1440×900, including native coordinate submission, scale diagrams, layers/tables and provincial switching. No page errors or failed requests were observed.
- The production OpenNext build passed. After the final static-script refinements, OpenNext rebundling reused the successful Next output; all 56 game files match the generated asset bundle byte for byte. JavaScript syntax, JSON, entry references, CSS structure and the change diff passed checks.
- The first build attempt hit a temporary `.next/export` cleanup error; a clean full build succeeded. Build-generated dependency/Prisma changes were excluded from the release.

GitHub checks and publication status are recorded in the pull request. Browser emulation checks are distinct from physical-device testing; physical iOS/Android devices were not available for this release.
