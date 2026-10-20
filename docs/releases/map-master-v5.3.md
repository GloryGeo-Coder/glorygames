# Map Master Africa: World Explorer — v5.3.0

Grade 7 Investigations adds 12 missions / 72 tasks: **44 missions / 264 tasks** across independently playable Grades 4–7. The new path covers local maps/routes, Earth structure and historical hazards, population concepts/graphs, resources and conservation. Grades 8–10 remain planned. This is topic practice, not a complete course or official assessment.

The street planner accepts genuine alternative routes within the stated distance limit, supports Undo and Start again, and submits only on Check route. A closed bridge and open crossings introduce purposeful detours. Native junction controls, keyboard navigation and a clear compact map support phones as well as desktop. An Earth cutaway and line/bar/pie graphs add visual evidence with matching tables. Publisher/date links distinguish historical cases and estimates from explicitly fictional practice records.

The first 32 mission definitions, save keys/format, all 39 PNGs and world/province geometry are unchanged. Results, stars, task cursors, hints, attempts, best scores and audio preferences are retained. Twelve quiet themes extend the existing 32 without changing them. Scores, chat, dedicated tabs and fullscreen integration remain intact. Portal descriptions, FAQs and the curriculum guide reflect the new scope.

## Delivery and later publication

This phase is delivered in `feature/map-master-grade7-v530` as a checked, **unmerged** feature PR. The user will build and deploy on Cloudflare when development is ready, conserving service usage. No Cloudflare build/deployment command or production merge is part of this phase. The existing production pipeline watches `main`; merge when the user is ready for publication. The source needs no migration, dependency update or deployment-configuration change.

Continue later development from this feature branch while its PR remains unmerged, so the Grade 7 work is included. Once publishing is authorised, use the established GitHub/Cloudflare workflow and reload the game to load the versioned scripts/styles. No ZIP or manual file upload is required. Game files remain in `apps/web/public/games/map-master-africa/`.

## Exact added files

- `apps/web/public/games/map-master-africa/academy-grade7.js`
- `apps/web/public/games/map-master-africa/field-lab.js`
- `apps/web/scripts/map-master-grade7.test.cjs`
- `docs/learning/map-master-grade7-v5.3.md`
- `docs/releases/map-master-v5.3.md`

## Exact modified files

- Game directory: `academy-audio.js`, `academy-content.js`, `academy-engine.js`, `atlas-view.js`, `field-notes.js`, `game.js`, `game.json`, `index.html`, `styles.css`.
- Test directory: `helpers/map-master-runtime.cjs`, `map-master-assets.test.cjs`, `map-master-audio.test.cjs`, `map-master-expansion.test.cjs`, `map-master-grade6.test.cjs`, `map-master-runtime.test.cjs`.
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`
- `docs/roadmaps/map-master-world-grades-4-10.md`

## Validation

1,057 Node regression checks and 25 React platform checks passed. Map Master’s checks include complete 264-task runs at portrait/landscape controller sizes, exact old-mission hashing, v5.2 save retention, alternative route judging, closures, route editing, recoverable submissions, pointer cancellation, keyboard focus and graph/table consistency.

Real Chromium completed every mission/task at 390×844 and retained 26,400 XP / 132 stars after reload. Browser layout checks covered 320×568, 844×390 and 1440×900, with final smoke checks for the route controls, graphs and atlas switching after compact-layout refinement. Browser emulation is not physical iOS/Android device testing; those devices were not available. No page errors or failed requests were observed in the completed browser runs.

Local `npm run build` completed successfully; its generated Next server output includes the updated 44-mission/264-task metadata. No Cloudflare command was used. JavaScript syntax, JSON, entry references, CSS structure, existing asset preservation and `git diff --check` passed. Build-generated dependency/Prisma changes are excluded from the release. GitHub check status is recorded in the PR.
