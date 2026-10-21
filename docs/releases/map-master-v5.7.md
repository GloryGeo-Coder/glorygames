# Map Master Africa: World Explorer — v5.7.0

Revision & Learning Polish adds short focus/mixed revision sets, **56 authored alternate activities** (eight per grade), local grade/topic summaries and browser printing. The **84-mission / 504-task Grades 4–10 campaign remains exact**, including every existing question, save key, XP/star rule, unlock path and asset.

Focus sets revisit tried tasks with recent mistakes, hints or supported answers; mixed sets spread earlier practice across missions. Both use at most six tasks from unlocked missions. An independent revision answer clears its focus flag, while campaign XP, stars, unlocks and cursor remain intact. Replaying the campaign improves its best result. Unfinished revision resumes its completed prefix, current attempts and hints. The menu explains the single saved-set model and the effect of starting a new set.

The summary distinguishes tasks tried, best independent campaign answers and next practice. It includes all seven grade totals and selected-grade topic detail, with semantic tables and an ink-conscious print view. Recent history begins with the new tools; older supported results and pending attempts/hints seed focus without inventing previous detailed records. The report describes browser practice, not school marks.

Alternatives change map targets, values or evidence rather than only shuffling answer positions. Province targets use actual atlas IDs; map/route/photo references, chart quantities and arithmetic are checked. Existing images, geography, music, dedicated game tab/fullscreen, platform score bridge, information-page sections and chat are retained. No dependency, CI workflow, Cloudflare configuration or database changes are included.

## Validation

- **1,107 Node regression checks and 25 React platform checks passed.** The final focused Map Master suite has **118 checks**, including 17 new revision cases. Coverage pins the exact 84-mission hash, revises all 504 supported tasks including all 56 alternatives, preserves campaign save bytes/XP/cursor/legacy best, checks historical-save seeding, recent mistakes after previous bests, pause/reload/hint/retry, queue/variant validation, missing storage, semantic summaries, printing and final-feedback continuation.
- **Chromium completed all 504 campaign tasks and a 504-task revision pass**, including all 56 alternatives. Revision retained the exact old campaign save, 25,200 XP and existing completion state. Further checks exercised 21 additional revision answers and 27 layouts at 320×568, 844×390 and 1440×900, including DMS, metric ruler, street route, profile, station, climate/GIS alternatives, menu and reports. Native legacy-save, final-feedback pause, hinted wrong-answer recovery, reload/resume and later focus clearance also passed. Completed runs had no page errors or failed requests. Physical iOS/Android devices were unavailable.
- The report's two-page A4 print output was rendered and visually inspected, including repeated table headers and white page backgrounds. New controls retain native labels and at least 44 px targets; selects use 16 px text.
- Local **`npm run build` exited successfully**, generated a fresh Next BUILD_ID and compiled the revision/summary website content. JavaScript syntax, JSON, HTML IDs and local references, CSS structure, asset preservation and `git diff --check` passed. Build-generated dependency/Prisma changes are excluded. No Cloudflare build/deploy command was run.

## Data and content limits

New local key `wga_map_master_world_learning_v1` stores bounded known-question history and one revision session; the existing campaign version-2 format and all three old keys remain unchanged. No learner identity, class list or server synchronisation is introduced. Unknown/malformed/ineligible sessions are rejected and denied storage remains playable in memory.

The bank supplies 56 alternatives; the other 448 tasks revisit their original form. Practice ordering and focus flags are deterministic learning aids, not certified mastery or a validated adaptive-learning model. New numeric/trial evidence is labelled fictional; geographic data and dated primary references retain their earlier provenance. See `docs/learning/map-master-revision-v5.7.md` for rules, exact example arithmetic, coverage and limitations.

## Apply and release

This increment applies over the complete v5.6 repository state. Open the feature PR to `main`, wait for all required GitHub checks, and merge as authorised by the user. The user runs Cloudflare builds/deployments when ready. No incremental ZIP is required under the current GitHub delivery preference.

After merge, update a local checkout with `git pull --ff-only origin main`. The canonical entry remains `/games/map-master-africa/`. From the game menu, choose a grade, then **Practise focus topics**, **Mixed revision** or **Learning summary**. Existing saves upgrade in place. Deploy and conduct real-device/learner playtesting before deciding on optional teacher/classroom or deeper-content phases.

## Exact files added or modified

- `apps/web/public/games/map-master-africa/academy-engine.js`
- `apps/web/public/games/map-master-africa/game.js`
- `apps/web/public/games/map-master-africa/game.json`
- `apps/web/public/games/map-master-africa/index.html`
- `apps/web/public/games/map-master-africa/learning-report.js`
- `apps/web/public/games/map-master-africa/learning-tools.js`
- `apps/web/public/games/map-master-africa/revision-variants.js`
- `apps/web/public/games/map-master-africa/styles.css`
- `apps/web/scripts/helpers/map-master-runtime.cjs`
- `apps/web/scripts/map-master-assets.test.cjs`
- `apps/web/scripts/map-master-revision.test.cjs`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`
- `docs/learning/map-master-revision-v5.7.md`
- `docs/releases/map-master-v5.7.md`
- `docs/roadmaps/map-master-world-grades-4-10.md`
