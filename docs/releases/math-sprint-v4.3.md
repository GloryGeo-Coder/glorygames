# Math Sprint Arena v4.3 — Grade 6 learning path

Grade 6 opens Innovation Harbour as an independent twenty-mission journey. It adds 100 Adventure activities and 100 alternate practice activities, each with three hints and a worked explanation. Grades 4, 5 and 6 now contain 60 missions and 600 activities. The existing 52-level Sprint remains available.

## Innovation Harbour

| Mission | Location | Selected learning focus |
| --- | --- | --- |
| 1 | Harbour Codes | Place value in nine-digit whole numbers |
| 2 | Energy Accounts | Six-digit addition and subtraction with inverse checks |
| 3 | Turbine Batches | Four-digit by three-digit multiplication |
| 4 | Cargo Packing | Four-digit by three-digit division; distinguish full groups from remainders |
| 5 | Prime Workshop | Prime numbers, prime factors, factorisation and multiples |
| 6 | Crew Ratios | Ratio parts and steady rates in practical contexts |
| 7 | Fraction Reservoir | Unlike-denominator and mixed-number addition and subtraction |
| 8 | Decimal Dock | Tenths, hundredths, comparison and rounding |
| 9 | Decimal Engines | Decimal addition, subtraction and multiplication by 10 or 100 |
| 10 | Percent Plaza | Percentages of quantities; fraction, decimal and percentage equivalents |
| 11 | Function Signals | Multi-step input/output rules and numeric patterns |
| 12 | Angle Lab | Read a labelled protractor using 15-degree intervals |
| 13 | Design Moves | Translation, reflection and clockwise quarter-turns on a labelled grid |
| 14 | Net Studio | Identify objects from nets and count specified face types |
| 15 | Garden Measures | Rectangular area and perimeter with correct units |
| 16 | Storage Volume | Volume of rectangular prisms from three labelled dimensions |
| 17 | Measurement Mission | Length, mass, capacity, simple map scale and overnight time |
| 18 | Research Data | Pie charts, frequency tables and the mode of recorded values |
| 19 | Chance Station | Possible outcomes, fair-spinner sectors and recorded trials |
| 20 | Harbour Launch | Mixed fractions, percentages, transformations, volume and survey evidence |

The activities are original practice mapped to selected CAPS Grade 6 skills. They do not form a complete course or a formal assessment, and the mission order is not a school's term timetable. The grade and learning topic remain visible during play.

Primary references:

- [DBE Mathematics Grades 4–6 CAPS](https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20IP%20%20MATHEMATICS%20GR%204-6%20web.pdf)
- [DBE Grade 6 Mathematics annual teaching plan, 2023/24](https://www.education.gov.za/LinkClick.aspx?fileticket=cT8nlsKsBAs%3D&mid=10744&portalid=0&tabid=3207)
- [DBE Grade 6 Mathematics assessment guidelines: content and skills](https://www.education.gov.za/LinkClick.aspx?fileticket=9gHRrAB43Kc%3D&mid=1720&portalid=0&tabid=590)

## Learning controls and mathematical models

- The transformation response grid has nine touch-sized cells, labelled A–C from left to right and 1–3 from bottom to top. Translation changes the stated row/column; reflection uses column B; clockwise quarter-turns use B2 as their centre. The exact selected cell survives refresh and orientation changes. Keyboard users can focus and select the same buttons.
- Mixed-number calculations accept equivalent improper fractions using the existing `/` key. Exact rational comparison remains in use; recurring fractions are not rounded to a decimal answer.
- Decimal arithmetic uses integer hundredths when authoring answers. Tenths/hundredths cards and hundred-square diagrams show their stated values exactly.
- Nets show six equal squares for a cube, three rectangles and two triangular ends for a triangular prism, a square and four triangles for a square pyramid, or a rectangle with two circular ends for a cylinder.
- Angle models mark a baseline and numbered scale; small tick intervals are explicitly identified as 15 degrees. Pie-chart sector angles follow their percentages. Fair-spinner models include six equal sector boundaries and recorded trials are distinguished from guaranteed future outcomes.
- Essential diagrams retain touch/keyboard enlargement. Existing portrait, compact landscape, reduced-motion, fullscreen and separate music/effects controls remain available.

## Progress and compatibility

Grade 6 starts at its first mission without requiring either earlier grade. Adventure, Learn and Review have separate Grade 6 checkpoints. Completing an Adventure mission unlocks the next one in that grade; Learn and Review do not unlock Adventure or submit learning results to Sprint leaderboards.

The same `wga_math_sprint_learning_v1` key and profile version are retained. Grade 4 keeps its legacy `sessions` object, Grade 5 keeps `gradeSessions[5]`, and Grade 6 adds `gradeSessions[6]`. Session selection is now derived from the registered grade paths. Older profiles without Grade 6 fields initialise them safely while preserving earlier results, drafts, hints, Review plans, practice visits and volume settings.

All original 400 Grade 4–5 activity objects and the first 94 musical arrangements remain hash-locked. The Sprint source, original background images, sprites and thumbnails are unchanged. Twenty new mission arrangements and one Grade 6 Review arrangement bring the music bank to 115: 112 level arrangements and three Review themes.

## Exact incremental files

Added:

1. `apps/web/public/games/math-sprint-arena/learning-grade6.js`
2. `apps/web/public/games/math-sprint-arena/learning-grade6-tools.js`
3. `apps/web/scripts/math-sprint-grade6-browser.cjs`
4. `docs/releases/math-sprint-v4.3.md`

Modified:

1. `apps/web/public/games/math-sprint-arena/arena-audio.js`
2. `apps/web/public/games/math-sprint-arena/game.json`
3. `apps/web/public/games/math-sprint-arena/index.html`
4. `apps/web/public/games/math-sprint-arena/learning-data.js`
5. `apps/web/public/games/math-sprint-arena/learning-tools.js`
6. `apps/web/public/games/math-sprint-arena/learning-ui.js`
7. `apps/web/public/games/math-sprint-arena/learning.css`
8. `apps/web/scripts/math-sprint.test.cjs`
9. `apps/web/src/content/gameEditorials.ts` — Math Sprint Arena entry only
10. `apps/web/src/lib/gameCatalog.ts` — Math Sprint Arena description only

## Validation and rollout

The 44 game tests cover all 600 activities, mathematical consistency, per-grade unlocks and Review, migration, transformation controls, alternate banks, previous-content hashes and the original 260-question Sprint victory flow. Platform checks include 25 rendered-page tests and 12 shared fullscreen/score tests. JavaScript syntax, HTML IDs and local references, CSS and JSON are validated. The Next.js production webpack build includes TypeScript checking.

The Grade 6 browser suite covers nine viewports from 320×568 and 568×320 through 1440×900. It completes all twenty Adventure missions and all 100 alternate activities, checks every new model, three-stage hints, exact fraction/grid reloads, Review-plan persistence, earlier-grade checkpoint isolation, live rotation, diagram enlargement, real audio, denied storage/audio and migration from a v4.2-shaped save. The existing browser suite is also run at 390×844 for full Grade 4 and Grade 5 campaigns, Grade 5 alternate sets, Sprint controls, old-save migration, reduced motion, rotation and sound/fullscreen behaviour.

```sh
node --test apps/web/scripts/math-sprint.test.cjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
node --test scripts/game-tab-score.test.mjs scripts/game-tab-ui.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

For optional browser QA, set `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE` to the installed Playwright module and Chromium executable, then run `apps/web/scripts/math-sprint-grade6-browser.cjs` from the repository root. `MATH_QA_WIDTH` can select viewport widths; `MATH_QA_OUTPUT` selects the screenshot/results directory.

Merge the feature pull request into `main` after checks pass. No database migration, asset relocation or Cloudflare configuration change is required. The owner will deploy to Cloudflare once the planned learning paths are ready.

Next: a separately mapped Grade 7 path, then Grades 8–9 and Grade 10 Mathematics.
