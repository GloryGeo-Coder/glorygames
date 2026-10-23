# Math Sprint Arena v4.6 — Grade 9 learning path

Horizon Station adds an independent Grade 9 journey with twenty missions, 100 Adventure activities and 100 alternate practice activities. Every activity includes three progressive hints and a worked explanation. Grades 4–9 now contain 120 missions and 1,200 activities alongside the original 52-level Sprint.

## Horizon Station

| Mission | Location | Selected skills |
| --- | --- | --- |
| 1 | Number System Signals | Rational/irrational numbers, signed calculations and bracketed powers |
| 2 | Reciprocal Exponents | Negative exponents, reciprocal powers and same-base division |
| 3 | Scientific Signals | Negative powers of ten, scientific notation and calculations |
| 4 | Proportion Dock | Direct/inverse proportion, constant-rate journeys and fixed-work problems |
| 5 | Growth Finance | Yearly compound growth, interest earned, commission and rentals |
| 6 | Pattern Frames | Border-cell patterns, simplified general rules and inverse stage problems |
| 7 | Binomial Workshop | Binomial products, squares, difference of squares and substitution |
| 8 | Factor Locks | Common factors, monic trinomials and difference of squares |
| 9 | Fraction Circuits | Algebraic fractions, valid cancellation and original denominator restrictions |
| 10 | Equation Airlocks | Linear equations with brackets/fractions and all zero-product solutions |
| 11 | Gradient Navigation | Signed/rational gradients, x-intercepts and y-intercepts |
| 12 | Line Code Studio | Equations from marked coordinates, parallel gradients and substitution |
| 13 | Similarity Supports | Corresponding sides, scale factors, AA similarity and SSS congruence |
| 14 | Polygon Frameworks | Interior-angle sums, regular interior/exterior angles and parallelograms |
| 15 | Rescue Spans | Pythagorean diagonals, missing legs, exact surds and ladder applications |
| 16 | Scale and Transform Lab | Origin enlargement, reflection in y = x, quarter-turns and area/perimeter scaling |
| 17 | Cylinder Cargo | Volume, closed surface area, capacity and cubic scaling |
| 18 | Research Evidence | Mean/median with outliers, scatter association, sampling and claims |
| 19 | Probability Routes | Independent compound events, coin trees, two-way tables, replacement and observed frequency |
| 20 | Horizon Station Champion | Mixed compound growth, algebraic fractions, cylinders, transformations and chance |

These original activities practise selected CAPS skills. They are not a complete Grade 9 course, formal assessment or school timetable. Finance questions supply fictional rates and assumptions. Cylinder questions explicitly use π ≈ 3.14. Exact irrational roots use symbolic choices. Algebraic fraction tasks retain the original excluded values after cancellation; zero-product tasks require all solutions.

Primary curriculum references:

- [DBE 2026 English Mathematics Grade 9 annual teaching plan](https://www.education.gov.za/LinkClick.aspx?fileticket=UVUDK7_VooM%3D&mid=10751&portalid=0&tabid=3208).
- [DBE Mathematics Grades 7–9 CAPS](https://www.education.gov.za/LinkClick.aspx?fileticket=uCNqOwfGbmc%3D&tabid=573).

The Grade 9 ATP includes integer exponents, factorisation, algebraic fractions, equations solved through zero products, gradients/intercepts, cylinders and compound probability. The mission sequence groups these selected skills into an original station story; it does not claim to reproduce the full school programme.

## Models, controls and sound

New evidence models include direct/inverse-proportion tables, countable hollow-square borders, four-part binomial areas, coordinate-labelled line graphs, similar triangles drawn at a common scale, regular polygons, proportional square plans, closed cylinders, scatter plots, fair-coin trees, coin/die tables and replacement-token bags. Essential diagrams can be enlarged on touch screens or with keyboard activation. Graph coordinates and axis values specify the data; learners calculate gradients using coordinate differences rather than the apparent drawing angle.

The existing Cartesian selector, signed-integer keypad, exact fraction/decimal comparison, right-triangle and statistics models are reused. Signed gradients with denominator one request an integer so every answer can be entered with the supplied keys. Phone prompts remain concise without removing necessary assumptions. Original backgrounds, sprites, thumbnail, platform game-tab controls and Sprint code remain unchanged.

Twenty mission arrangements and one Grade 9 Review theme are appended. There are now 178 distinct arrangements: 172 mission/level themes and six Review themes. Music and effects retain their separate controls and unavailable-audio fallback.

## Save compatibility

The existing `wga_math_sprint_learning_v1` key and profile version remain. Grade 9 adds `gradeSessions[9]` with independent Adventure, Learn and Review checkpoints. Its first mission is available immediately; the remaining Adventure missions unlock in order. Learn and Review do not award Adventure completion or submit Sprint scores.

Grades 4–8 results, unfinished drafts, hint counts, practice visits, revision plans and volume settings are retained. Hash checks preserve all 1,000 earlier activity objects and all 157 earlier arrangements. New Grade 9 revision plans cannot cross into another grade, and locked/corrupt checkpoints remain rejected.

## Exact incremental files

Added:

1. `apps/web/public/games/math-sprint-arena/learning-grade9.js`
2. `apps/web/public/games/math-sprint-arena/learning-grade9-tools.js`
3. `apps/web/scripts/math-sprint-grade9-browser.cjs`
4. `docs/releases/math-sprint-v4.6.md`

Modified:

1. `apps/web/public/games/math-sprint-arena/arena-audio.js`
2. `apps/web/public/games/math-sprint-arena/game.json`
3. `apps/web/public/games/math-sprint-arena/index.html`
4. `apps/web/public/games/math-sprint-arena/learning-data.js`
5. `apps/web/public/games/math-sprint-arena/learning-tools.js`
6. `apps/web/public/games/math-sprint-arena/learning-ui.js`
7. `apps/web/scripts/math-sprint-grade6-browser.cjs` — expected grade/music counts only
8. `apps/web/scripts/math-sprint-grade7-browser.cjs` — expected grade/music counts only
9. `apps/web/scripts/math-sprint-grade8-browser.cjs` — expected grade/music counts only
10. `apps/web/scripts/math-sprint.test.cjs`
11. `apps/web/src/content/gameEditorials.ts` — Math Sprint Arena entry only
12. `apps/web/src/lib/gameCatalog.ts` — Math Sprint Arena description only

## Validation and rollout

The 71 game tests cover all 1,200 activities, ordered grade unlocks, supported/independent answers, revision, migration, original content hashes and Sprint’s 260-question victory flow. New checks independently evaluate polynomial options, exact reciprocal powers, coordinate gradients, compound-growth balances, dimensional scaling and enumerated probability spaces. Every new numerical answer is checked against its keypad’s available characters. The 25 rendered-page and 12 shared score/fullscreen tests bring local checks to 108. JavaScript, HTML IDs/local references, CSS, JSON and diff checks are included. The Next.js production webpack build validates TypeScript.

Grade 9 browser QA covers 320×568, 568×320, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. It exercises real touch/keyboard input, three hints, diagram enlargement, fraction/point reloads, Review, five earlier-grade checkpoints, v4.5 migration, orientation changes, actual audio and unavailable storage/audio. At 390×844 it completes all 100 Adventure and 100 alternate activities. A separate full-bank sweep checks all 200 activities with hints and solved feedback at every viewport: 1,800 layout cases.

Earlier browser suites replay Grades 4–5 and Grade 8 campaigns and their alternate sets, alongside Sprint, legacy saves, sound, fullscreen and motion settings. The new browser checks also retain and resume Grade 6/7 drafts; their full activity, model and save tests remain in the game suite.

```sh
node --test apps/web/scripts/math-sprint.test.cjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
node --test scripts/game-tab-score.test.mjs scripts/game-tab-ui.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

For browser QA, set `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE` to installed Playwright/Chromium paths and run `apps/web/scripts/math-sprint-grade9-browser.cjs` from the repository root. `MATH_QA_WIDTH` filters viewport widths; `MATH_QA_OUTPUT` selects the results directory. `MATH_QA_LAYOUT_ONLY=1` runs the full-bank layout sweep.

Installation uses merged `main`. No database migration, asset relocation or Cloudflare configuration change is required. The owner will build and deploy on Cloudflare once the remaining learning paths are complete. No incremental ZIP is required.

Next: Grade 10 Mathematics.
