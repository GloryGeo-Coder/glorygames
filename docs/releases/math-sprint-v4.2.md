# Math Sprint Arena v4.2 — Grade 5 learning path

Grade 5 opens Discovery District as a separate twenty-mission journey. It contains 100 Adventure activities and 100 alternate practice activities, each with progressive hints and a worked explanation. Together, Grade 4 and Grade 5 now contain 40 missions and 400 authored activities. The existing 52-level Sprint remains available.

## Grade 5 journey

| Mission | Location | Selected learning focus |
| --- | --- | --- |
| 1 | Signal Towers | Six-digit place value and the value of a specified digit |
| 2 | Estimate Express | Rounding to the nearest ten, hundred and thousand |
| 3 | Power Ledger | Five-digit addition and subtraction with inverse checks |
| 4 | Solar Factory | Three-digit by two-digit multiplication using partial products |
| 5 | Delivery Groups | Three-digit by two-digit division with exact whole-number quotients |
| 6 | Factor Locks | Whole-number factors and positive multiples |
| 7 | Pattern Network | Numeric patterns, growing dot patterns and input/output rules |
| 8 | Fraction Links | Equivalent fractions and comparisons, including different denominators |
| 9 | Fraction Energy | Addition and subtraction of common fractions with matching denominators |
| 10 | Garden Shares | Fractions of whole-number quantities |
| 11 | Market Planner | Multi-step money, equal grouping and steady-rate contexts |
| 12 | Angle Design | Acute, right, obtuse and straight angles |
| 13 | Solid Workshop | Flat faces, edges and vertices of cubes, prisms and square pyramids |
| 14 | Mirror Gallery | Completing reflected patterns across a vertical line |
| 15 | Measure Depot | Converting length, mass and liquid measures to compatible units |
| 16 | Floor Plan | Irregular areas by counting squares; rectangular perimeter |
| 17 | Cube Cargo | Volume by counting equal cubic units in complete layers |
| 18 | Journey Clock | Same-day time intervals using analogue and 24-hour digital displays |
| 19 | Survey Centre | Bar graphs and pictographs with two or five learners per symbol |
| 20 | Discovery Festival | Mixed application of rounding, fractions, area, volume and survey data |

These are original activities mapped to selected Grade 5 CAPS skills. The game's order is a learning journey, not a school's term timetable. This is a practice resource, not a complete Grade 5 course or a formal assessment. Decimal notation appears in money and unit conversion contexts; this release does not introduce a separate decimal-arithmetic course.

Primary curriculum references:

- [DBE CAPS Mathematics Grades 4–6](https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20IP%20%20MATHEMATICS%20GR%204-6%20web.pdf)
- [DBE 2026 Grade 5 Mathematics annual teaching plan](https://www.education.gov.za/LinkClick.aspx?fileticket=Zcwzy598npw%3D&mid=10742&portalid=0&tabid=3207)
- [DBE 2026 Grade 5 Mathematics workbook, volume 1](https://www.education.gov.za/Portals/0/Documents/Manuals/2026%20Workbooks/Maths%20vol%201/grade%205/Num%20eng%20gr5%20vol1%20lowres.pdf?ver=2026-01-20-010612-000)

## Independent grades and saved learning

The home screen has a Grade 4 / Grade 5 selector. Each grade starts with its first Adventure mission available. Completing its five activities unlocks the next mission within that grade. Grade 5 does not require Grade 4 completion.

Adventure, Learn and Review have separate checkpoints for each grade. Switching grades retains drafts, hints, assisted-answer records, practice-bank visits and Review plans. Review selects five activities only from the selected grade, prioritising practised activities that needed support. Learn and Review do not unlock Adventure or submit learning results to Sprint leaderboards.

The existing `wga_math_sprint_learning_v1` key and profile version remain unchanged. Grade 4 uses its existing `sessions` fields, and Grade 5 uses an additional `gradeSessions[5]` object. Normalisation validates each grade's completion chain independently. Older saves without the new fields are accepted; no Grade 5 completion is invented.

All original 200 Grade 4 activity objects and all previous 73 musical arrangements are hash-locked by regression tests. Existing Grade 4 IDs, checkpoints and settings remain valid. The Sprint source, its 52 levels, save keys and best-score record are unchanged.

## Controls, diagrams and audio

- Fraction calculations have a `/` key on the touch keypad and accept the same key on a physical keyboard. Answers use exact rational equivalence, so an equivalent fraction is accepted.
- Labelled SVG/DOM models show six-digit columns, rounding intervals, fraction bars, growing dot patterns, solid objects, irregular square grids and separately displayed cube layers.
- Essential diagrams can be enlarged with touch or keyboard. Pictograph symbol counts, keys and displayed category values agree.
- Returning home resets its internal scroll position to keep the grade selector reachable. Once an answer is accepted, the numeric value or selected choice remains visible while unused controls give room to worked feedback. The smallest portrait layouts keep diagrams, 44-pixel input targets and explanations separate, including when all three hints are shown.
- Twenty Grade 5 mission arrangements and one Grade 5 Review arrangement are appended. Total: 92 level arrangements and two Review arrangements, or 94 in all. Music and effects retain separate volume controls.
- Existing raster backgrounds, character sprites and thumbnails are unchanged. No new asset downloads or external audio requests are required.

## Exact incremental files

Added:

1. `apps/web/public/games/math-sprint-arena/learning-grade5.js`
2. `docs/releases/math-sprint-v4.2.md`

Modified:

1. `apps/web/public/games/math-sprint-arena/arena-audio.js`
2. `apps/web/public/games/math-sprint-arena/game.json`
3. `apps/web/public/games/math-sprint-arena/index.html`
4. `apps/web/public/games/math-sprint-arena/learning-data.js`
5. `apps/web/public/games/math-sprint-arena/learning-tools.js`
6. `apps/web/public/games/math-sprint-arena/learning-ui.js`
7. `apps/web/public/games/math-sprint-arena/learning.css`
8. `apps/web/scripts/math-sprint.test.cjs`
9. `apps/web/scripts/math-sprint-browser.cjs`
10. `apps/web/src/content/gameEditorials.ts` — Math Sprint Arena entry only
11. `apps/web/src/lib/gameCatalog.ts` — Math Sprint Arena description only

## Validation and rollout

The 37 game tests cover both paths, all 400 activities, exact mathematical models, ordered unlocks, per-grade Review and checkpoint isolation, save migration, alternate banks, old-content hashes and the existing 260-question Sprint victory flow. Platform regression checks include 25 rendered-page tests and 12 shared fullscreen/score tests. The Next.js production webpack build includes TypeScript checking.

The browser QA script checks nine desktop, tablet and phone viewports from 320×568 and 568×320 to 1440×900. It exercises touch controls, all new model types, grade switching, reloads, saved fraction entry, hints, Review plans, a complete twenty-mission Adventure in each grade, all 100 Grade 5 alternate activities, Sprint controls, reduced motion, live rotation, real audio activation, blocked storage/audio and migration from a v4.0-shaped save.

```sh
node --test apps/web/scripts/math-sprint.test.cjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
node --test scripts/game-tab-score.test.mjs scripts/game-tab-ui.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

Apply this feature branch over v4.1 and merge its pull request into `main` after checks pass. No database migration, asset relocation or Cloudflare configuration change is needed. Cloudflare deployment remains with the owner and is deferred until the planned learning paths are ready.

Next: a separately mapped Grade 6 path, followed by Grades 7–9 and Grade 10 Mathematics.
