# Math Sprint Arena v4.5 — Grade 8 learning path

Skyline Lab opens an independent Grade 8 journey with twenty missions, 100 Adventure activities and 100 alternate practice activities. Every activity has three progressive hints and a worked explanation. Grades 4–8 now contain 100 missions and 1,000 activities alongside the original 52-level Sprint.

## Skyline Lab

| Mission | Location | Selected learning focus |
| --- | --- | --- |
| 1 | Integer Reactors | Signed multiplication/division and order of operations |
| 2 | Factor Switchboard | Three-digit HCF/LCM and increases/decreases in a given ratio |
| 3 | Exponent Array | Same-base exponent laws, zero powers, negative bases and scientific notation |
| 4 | Rational Fuel Cells | Improper fractions, fraction division, rational powers and exact roots |
| 5 | Decimal Calibration | Multiplication and division by decimal fractions |
| 6 | Finance Lift | Supplied VAT rates, hire-purchase totals, exchange rates and percentage increases |
| 7 | Solar Pattern Terrace | Geometric patterns, changing differences and algebraic stage rules |
| 8 | Function Uplink | Signed substitution, input/output equations and ordered pairs |
| 9 | Like-Term Locks | Like terms, coefficients and variable powers |
| 10 | Distributive Workshop | Expand brackets and divide every term of an expression |
| 11 | Equation Relays | Equations with x on both sides; inverse operations and substitution checks |
| 12 | Coordinate Couriers | Four-quadrant points; reflections, translations and a quarter-turn |
| 13 | Signal Graph Observatory | Maxima/minima, linearity, constant values and discrete/continuous data |
| 14 | Parallel Beam Alignment | Vertically opposite, adjacent, corresponding and co-interior angles |
| 15 | Shape Structures | Triangle, isosceles, quadrilateral and parallelogram angle relationships |
| 16 | Pythagoras Bridges | Missing hypotenuse/leg, exact surd choices and the converse |
| 17 | Circle Decks | Circle area/circumference and composite rectangular areas |
| 18 | Prism Packing Bay | Closed triangular-prism surface area, volume and capacity conversions |
| 19 | Evidence and Chance Lab | Six-value mean/median, stem-and-leaf displays, probability and observed frequency |
| 20 | Skyline Lab Champion | Mixed signed arithmetic, algebra, transformations, Pythagoras and chance |

These original activities practise selected CAPS skills. They are not a complete Grade 8 course, formal assessment or school term timetable. Money questions state their own rates and assumptions. Circle questions explicitly use π ≈ 3.14. Irrational hypotenuse answers are selected in exact surd form rather than accepted as rounded rational approximations.

Primary sources:

- [DBE 2026 English Mathematics Grade 8 annual teaching plan](https://www.education.gov.za/LinkClick.aspx?fileticket=E68Ig0s3y4U%3D&mid=10749&portalid=0&tabid=3208) — number operations, algebra/functions/graphs, data/chance, geometry, transformations and measurement.
- [DBE Mathematics Grades 7–9 CAPS](https://www.education.gov.za/LinkClick.aspx?fileticket=uCNqOwfGbmc%3D&tabid=573) — Senior Phase curriculum reference.

The 2026 Grade 8 plan includes data handling and probability in Term 3 and triangular-prism measurement in Term 4. The selected mission topics reflect those areas as well as algebra and Pythagoras. All questions and examples are newly authored.

## Learning tools and responsiveness

The Cartesian selector uses nine labelled points at x/y values −2, 0 and 2, with visible coordinate headings. The model uses equal unit spacing on both axes. Touch users select a point; keyboard users can focus a point button and activate it. Exact selection and hints survive refresh and live rotation. The compact landscape layout keeps the point buttons visible; their pressed state and accessible coordinate labels identify the selection.

New models show geometric cell arrays, input/output rules, equations with expressions on both sides, signed graphs, accurately related angle sectors, triangle angles, Pythagorean triangles, labelled circles, L-shaped floor plans, triangular prisms, six-value data, stem-and-leaf displays and equally likely tokens. Essential diagrams can be enlarged with touch or keyboard controls.

Existing fraction entry, signed-integer keys, exact rational comparison, portrait/landscape layouts, reduced motion, fullscreen and music/effects controls remain available. Longer solar-stage prompts are concise enough for 320-pixel phones. Twenty mission arrangements and one Grade 8 Review theme are appended, bringing the bank to 157 arrangements: 152 mission/level themes and five Review themes.

## Save compatibility

The same `wga_math_sprint_learning_v1` key and profile version are retained. Grade 8 adds `gradeSessions[8]`, with separate Adventure, Learn and Review checkpoints. Players can start Grade 8 immediately; later Adventure missions unlock through that grade's completion. Learn and Review do not unlock Adventure or submit Sprint scores.

Older profiles retain results, drafts, hints, practice visits, Review plans, volume settings and earlier Sprint records. New hash checks preserve all 800 earlier activity objects and all 136 earlier arrangements. Original raster backgrounds, sprites, thumbnails, Sprint code, shared game-tab infrastructure and Cloudflare configuration are unchanged.

## Exact incremental files

Added:

1. `apps/web/public/games/math-sprint-arena/learning-grade8.js`
2. `apps/web/public/games/math-sprint-arena/learning-grade8-tools.js`
3. `apps/web/scripts/math-sprint-grade8-browser.cjs`
4. `docs/releases/math-sprint-v4.5.md`

Modified:

1. `apps/web/public/games/math-sprint-arena/arena-audio.js`
2. `apps/web/public/games/math-sprint-arena/game.json`
3. `apps/web/public/games/math-sprint-arena/index.html`
4. `apps/web/public/games/math-sprint-arena/learning-data.js`
5. `apps/web/public/games/math-sprint-arena/learning-tools.js`
6. `apps/web/public/games/math-sprint-arena/learning-ui.js`
7. `apps/web/public/games/math-sprint-arena/learning.css` — Cartesian headings and compact-landscape selector only
8. `apps/web/scripts/math-sprint-grade6-browser.cjs` — expected grade/music counts only
9. `apps/web/scripts/math-sprint-grade7-browser.cjs` — expected grade/music counts only
10. `apps/web/scripts/math-sprint.test.cjs`
11. `apps/web/src/content/gameEditorials.ts` — Math Sprint Arena entry only
12. `apps/web/src/lib/gameCatalog.ts` — Math Sprint Arena description only

## Validation and rollout

The 61 game tests cover all 1,000 activities, exact maths, unique expression choices, independent unlocks, migration, Cartesian controls, SVG evidence, previous-content hashes and the original 260-question Sprint victory flow. The 25 rendered-page tests and 12 shared score/fullscreen tests bring local checks to 98. JavaScript, HTML IDs/local references, CSS, JSON and diff checks are included. The Next.js production webpack build includes TypeScript validation.

Grade 8 browser QA covers 320×568, 568×320, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. It checks real touch/keyboard input, hints, diagram enlargement, point/fraction reloads, separate Review checkpoints, all earlier-grade checkpoint isolation, v4.4 migration, orientation changes, actual audio and unavailable storage/audio. The 390×844 run completes all 100 Adventure and 100 alternate activities. A separate full-bank sweep checks all 200 activities, all three hints and solved feedback at every viewport: 1,800 layout cases.

Earlier browser suites replay Grades 4–5 and Grade 7 campaigns and Grade 5/7 alternate sets, plus Sprint, legacy saves, sound, fullscreen and motion settings. Grade 6 fractions and checkpoints are exercised in the new cross-grade browser checks, and its full activity/save/model suite remains in the game tests.

```sh
node --test apps/web/scripts/math-sprint.test.cjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
node --test scripts/game-tab-score.test.mjs scripts/game-tab-ui.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

For browser QA, set `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE` to installed Playwright/Chromium paths, then run `apps/web/scripts/math-sprint-grade8-browser.cjs` from the repository root. `MATH_QA_WIDTH` filters viewport widths; `MATH_QA_OUTPUT` selects the screenshot/results directory. Set `MATH_QA_LAYOUT_ONLY=1` for the full-bank layout sweep.

Installation uses the merged `main` repository state. No database migration, asset relocation or Cloudflare configuration change is required. The owner will build and deploy on Cloudflare after the remaining learning paths are complete. No incremental ZIP is required.

Next: Grade 9, followed by Grade 10 Mathematics.
