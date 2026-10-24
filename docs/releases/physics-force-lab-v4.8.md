# Physics Force Lab v4.8 — Revision Workshop

The Adventure now includes short, untimed revision sessions using the questions and explanations from completed repair investigations. The existing ninety repairs supply 55 distinct concept checks across selected Grades 4–10 topics. Repeated station questions share one practice identity, so a session contains different ideas rather than repeated versions of the same question.

Revision is available from the opening menu, Pause and the field notebook. Players can mix their discoveries or choose a grade. Sessions contain up to six questions; mixed sessions draw from different available grades, while questions previously missed receive priority within that balance. This is supplementary practice, not a complete syllabus or a formal assessment.

Every answer receives the existing scientific explanation. Incorrect choices also show the correct answer. Saved experiment notes remain available for comparison. The review distinguishes ideas answered correctly this time from ideas to revisit; it does not claim mastery from a single attempt.

## Saves and compatibility

Practice uses the separate device-local key `wga_physics_revision_v1`. Question selection, answer order, the current answer/feedback, session position and per-concept practice records survive refresh. Each question records only one answer in a session, including after refresh or repeated taps. A corrupt session is discarded safely; records are bounded and unknown concept IDs are ignored.

Only completed repairs in unlocked missions are eligible, including retained notebook evidence and older completed-mission saves. Locked or unrepaired concepts cannot be opened by the revision UI. Practice never changes mission completion, campaign score, collection records or the original best score. The original twelve action labs and both modes' fullscreen controls remain unchanged.

Unavailable storage leaves practice playable in the current tab and displays a save warning. Optional revision scripts fail without removing the existing Adventure controls. No backgrounds, sprites, audio files, routes, physics equations, curriculum answers or campaign save formats change.

## Validation

The Physics workflow now runs the Node regressions plus an isolated Chromium browser job and a Next.js production build. Browser tooling is pinned to Playwright 1.64.0 and installed in the runner's temporary directory; package manifests and lockfiles are not modified by this increment. [Playwright's CI guidance](https://playwright.dev/docs/ci) documents browser/system-dependency installation.

The revision browser harness covers the empty state, eligibility, grade filters, shuffled choices, incorrect-answer feedback, refresh recovery, session review, campaign/best-score preservation, nested Pause navigation and unavailable storage/audio. It checks 13 viewport sizes from 320×568 to 1440×900 and uses native document fullscreen. Existing Physics browser harnesses retain both modes' mobile/fullscreen checks, all twelve original level fixtures, actual Adventure repairs and sprite-loading fallback.

This increment is authored against the current GitHub source because the local execution workspace is unavailable. Validation results are recorded from GitHub Actions before merge; physical-device Safari testing is not claimed.

## Exact files

Added:

- `apps/web/public/games/physics-force-lab/adventure-revision.js`
- `apps/web/public/games/physics-force-lab/adventure-revision-ui.js`
- `apps/web/public/games/physics-force-lab/adventure-revision.css`
- `apps/web/scripts/physics-revision.test.cjs`
- `apps/web/scripts/physics-revision-browser.cjs`
- `docs/releases/physics-force-lab-v4.8.md`

Modified:

- `apps/web/public/games/physics-force-lab/index.html`
- `apps/web/public/games/physics-force-lab/adventure.js`
- `apps/web/public/games/physics-force-lab/game.json`
- `.github/workflows/physics-force-lab.yml`

## Installation

Pull main after the feature PR merges. Use the existing Cloudflare/OpenNext configuration when ready to deploy. No ZIP, publication staging file, save migration or Cloudflare configuration change is needed. Deployment remains with the owner.
