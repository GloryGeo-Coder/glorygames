# Math Sprint Arena v4.4 — Grade 7 learning path

Research Ridge adds an independent Grade 7 journey with twenty missions, 100 Adventure activities and 100 alternate practice activities. Every activity includes three progressive hints and a worked explanation. Grades 4–7 now offer 80 missions and 800 activities alongside the original 52-level Sprint.

## Research Ridge

| Mission | Location | Selected learning focus |
| --- | --- | --- |
| 1 | Signed Signal Ridge | Negative integers, order, opposites and distance from zero |
| 2 | Integer Lift Control | Integer addition and subtraction on number lines |
| 3 | Power Observatory | Positive whole-number powers through exponent 5; square and cube roots |
| 4 | Factor Frequency | Highest common factors and lowest common multiples |
| 5 | Fraction Fuel Lab | Common-fraction addition, subtraction, multiplication and division |
| 6 | Decimal Detectors | Three-place decimal arithmetic and equivalent common fractions |
| 7 | Budget Station | Discounts, profit on cost, budgets and simple interest |
| 8 | Ratio Relay | Sharing in a ratio, unit rates and direct proportion |
| 9 | Growing Array Garden | Geometric patterns with changing differences; n × (n + 1) |
| 10 | Function Gateway | Input/output rules and finding a missing input |
| 11 | Algebra Language Lab | Variables, constants, word descriptions and substitution |
| 12 | Equation Balance Bridge | Equations by inspection, inverse checks and modelling a situation |
| 13 | Journey Graphs | Global distance–time trends and labelled graph readings |
| 14 | Angle Beacons | Acute, obtuse and reflex angles; parallel and perpendicular lines |
| 15 | Shape Survey | Circle parts, diameter, similar/congruent squares and equal-sided triangles |
| 16 | Scale Design Studio | Grid enlargements, reductions and reflection properties |
| 17 | Triangle Terraces | Perpendicular height, triangle area, perimeter and square-unit conversions |
| 18 | Surface and Space Workshop | Closed-box surface area, volume, capacity and cubic-unit conversions |
| 19 | Data Detectives | Mean, median, mode, range and representative samples |
| 20 | Research Ridge Champion | Mixed integer, algebra, finance, area and data problems |

These original activities practise selected Grade 7 CAPS skills. They are not a complete course, formal assessment or term-by-term teaching programme. Integer multiplication/division and formal algebraic manipulation are not introduced by this path. Learners use addition/subtraction, substitution and equations solved by inspection with inverse checks.

Primary curriculum references:

- [DBE Senior Phase Mathematics CAPS, Grades 7–9](https://www.education.gov.za/LinkClick.aspx?fileticket=uCNqOwfGbmc%3D&tabid=)
- [DBE Grade 7 Mathematics annual teaching plan, 2023/24](https://www.education.gov.za/LinkClick.aspx?fileticket=ntUvRUteBtQ%3D&mid=10747&portalid=0&tabid=3208)
- [DBE Grade 7 Mathematics content and skill assessment guidelines, 2014](https://www.education.gov.za/LinkClick.aspx?fileticket=ZQdQc8NG4r0%3D&mid=1722&portalid=0&tabid=590)

The reference years identify the source documents; this release does not claim that a new 2026 teaching plan was verified. The 2023/24 Grade 7 plan informs the selected data-handling focus; the earlier Grade 6 chance mission is retained unchanged.

## Controls, visuals and sound

Signed-integer tasks use a contextual **−** keypad button, replacing the decimal-point button for those tasks. It toggles the sign before or after digits have been entered. Physical keyboards support `-` and `−`. An unfinished minus is saved and does not count as an incorrect answer. Other grades retain their existing decimal and fraction keypads.

New models include signed number lines, exact rectangular pattern arrays, function arrows, equation balances, labelled distance–time graphs, correctly marked reflex arcs, circle parts, same-scale squares, enlargement grids, perpendicular triangle heights and closed-box dimension diagrams. Mathematical evidence also has accessible descriptions. Essential diagrams retain touch/keyboard enlargement. Existing responsive layouts, reduced motion, browser fullscreen, hint feedback and independent music/effects controls remain in use.

Twenty original mission arrangements and one Review arrangement are appended. All 115 earlier arrangements are hash-locked; the complete bank now contains 136 arrangements: 132 mission/level arrangements and four grade-specific Review themes.

## Saves and compatibility

Grade 7 can begin immediately. Its Adventure unlocks, Learn checkpoint and five-question Review checkpoint are independent of Grades 4–6. Learn and Review do not unlock Adventure or affect Sprint scores.

The existing `wga_math_sprint_learning_v1` key and profile version remain unchanged. `gradeSessions[7]` is initialised when an older save is loaded. Earlier results, drafts, support counts, Review plans, practice visits, volume settings and Sprint records are retained. All 600 existing activities and the first 115 music arrangements are covered by unchanged-content hash checks. Original backgrounds, sprites, thumbnails, shared game-tab infrastructure, Sprint code and Cloudflare configuration remain unchanged.

## Exact incremental files

Added:

1. `apps/web/public/games/math-sprint-arena/learning-grade7.js`
2. `apps/web/public/games/math-sprint-arena/learning-grade7-tools.js`
3. `apps/web/scripts/math-sprint-grade7-browser.cjs`
4. `docs/releases/math-sprint-v4.4.md`

Modified:

1. `apps/web/public/games/math-sprint-arena/arena-audio.js`
2. `apps/web/public/games/math-sprint-arena/game.json`
3. `apps/web/public/games/math-sprint-arena/index.html`
4. `apps/web/public/games/math-sprint-arena/learning-data.js`
5. `apps/web/public/games/math-sprint-arena/learning-tools.js`
6. `apps/web/public/games/math-sprint-arena/learning-ui.js`
7. `apps/web/scripts/math-sprint-grade6-browser.cjs` — expected grade-selector and music counts only
8. `apps/web/scripts/math-sprint.test.cjs`
9. `apps/web/src/content/gameEditorials.ts` — Math Sprint Arena entry only
10. `apps/web/src/lib/gameCatalog.ts` — Math Sprint Arena description only

## Validation and rollout

All 89 local tests passed: 52 game tests cover all 800 activities, the original 260-question Sprint victory flow, exact rational answers, mathematical models, independent unlocks, migration, hints, revision and earlier-content hashes. Platform checks add 25 rendered-page tests and 12 shared score/fullscreen tests. Syntax, HTML IDs and local references, CSS and JSON are checked. The Next.js production webpack build includes TypeScript validation.

The Grade 7 browser suite targets nine viewports: 320×568, 568×320, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. It exercises every mission, new visual models, three-stage hints, touch target sizes, diagram enlargement, signed and fractional draft reloads, separate Review plans, earlier-grade checkpoints, rotation, actual audio, denied storage/audio and a v4.3-shaped save. At 390×844 it completes all twenty Adventure missions and all 100 alternate activities. The earlier browser suite verifies Grades 4–5 campaigns and Grade 5 alternates, plus Sprint, old saves, sound and fullscreen; the Grade 6 suite verifies its full campaign and alternate bank.

```sh
node --test apps/web/scripts/math-sprint.test.cjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
node --test scripts/game-tab-score.test.mjs scripts/game-tab-ui.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

The additional `MATH_QA_LAYOUT_ONLY=1` sweep checks all 200 Grade 7 activities, all three hints and solved feedback at each selected viewport.

Optional browser QA uses `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE` to select installed Playwright/Chromium. Run `apps/web/scripts/math-sprint-grade7-browser.cjs` from the repository root. `MATH_QA_WIDTH` selects widths and `MATH_QA_OUTPUT` selects the screenshot/results directory.

Installation uses the merged `main` repository state. No database migration, asset move or Cloudflare configuration change is required. The owner will build and deploy on Cloudflare once the planned learning paths are complete. No incremental ZIP is required.

Next: Grade 8, followed by Grade 9 and Grade 10 Mathematics.
