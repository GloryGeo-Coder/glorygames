# Math Sprint Arena v4.7 — Grade 10 and Grades 4–10 completion

Infinity Summit adds twenty Grade 10 missions, 100 Adventure activities and 100 alternate practice activities. The seven independent Grades 4–10 paths now contain 140 missions and 1,400 activities. Every activity includes three progressive hints and a worked explanation. The original 52-level Sprint remains available separately.

## Infinity Summit

| Mission | Location | Selected practice |
| --- | --- | --- |
| 1 | Real Number Gate | Rational/irrational values, surd bounds, powers and accuracy |
| 2 | Rational Power Engines | Positive-base rational exponents, negative powers and exponential equations |
| 3 | Cubic Factor Locks | Cubic identities, binomial/trinomial products, non-monic trinomials and grouping |
| 4 | Fraction Relay | Cubic cancellation, fraction addition/subtraction and original exclusions |
| 5 | Equation Control | Linear, factorised quadratic, simultaneous and literal equations |
| 6 | Inequality Bridge | Negative-coefficient inequalities, endpoint inclusion, intervals and budgets |
| 7 | Sequence Skyway | Constant-difference sequences, general terms and inverse positions |
| 8 | Coordinate Survey | Midpoint selection, distance, gradient and perpendicular gradients |
| 9 | Linear Signal Studio | Intercepts, coordinate substitution and parallel lines |
| 10 | Parabola Pavilion | Values, turning points, range, graph equations and roots |
| 11 | Reciprocal Crossing | Hyperbola values, excluded domain/range and asymptotes |
| 12 | Exponential Launch | Values, intercepts, asymptotes, decay bases and range |
| 13 | Trig Ratio Deck | Right-triangle ratios and reciprocal definitions |
| 14 | Angle and Wave Lab | Exact special angles, signed coordinate ratios, waves and tangent asymptotes/period |
| 15 | Survey Rescue | Right-triangle sighting applications and acute-angle solutions |
| 16 | Geometry Supports | Triangle midpoint theorem, quadrilateral properties and valid reasons |
| 17 | Solid Cargo Lab | Cones, spheres, square pyramids, combined solids and area scale |
| 18 | Data and Box Plot Studio | Quartiles, IQR/semi-IQR, histograms and estimated grouped means |
| 19 | Probability Forum | Venn regions, unions, intersections, complements and event relationships |
| 20 | Infinity Summit Finale | Simple/compound growth, quadratics, midpoint, combined volume and Venn probability |

This completes the planned grade-path rollout. It does not claim complete coverage of every CAPS outcome, a formal assessment, a school course or an examination simulator. The order is an original Pi-Bot story rather than a school term timetable. Earlier grades can still be started independently; finishing Grade 10 does not invent completion of earlier paths.

Primary references:

- [DBE Grade 10 Mathematics annual teaching plan](https://www.education.gov.za/LinkClick.aspx?fileticket=ZX3jJwqKE2E%3D&mid=10736&portalid=0&tabid=3205).
- [DBE Circular S19 of 2025 and annexures](https://www.education.gov.za/Portals/0/Documents/Publications/2026/Circulars/Circular%20S19%20of%202025%20and%20Annexures.pdf), retaining teaching plans for 2026 with listed exclusions.
- [CAPS Mathematics Grades 10–12](https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20MATHEMATICS%20_%20GR%2010-12%20_%20Web_1133.pdf).

The Grade 10 plan supports the selected algebra, inequalities, linear sequences, coordinate geometry, functions, trigonometry, measurement, finance, statistics and probability areas. All questions and explanations are original. Rational exponents use positive bases. Algebraic fractions retain original restrictions; quadratic options require every solution. Eight-value quartiles explicitly use medians of the two four-value halves. Grouped means are labelled estimates. Finance terms are fictional and state the method, rate, term and absence of payments/fees. Required irrational values are symbolic choices rather than rounded keypad approximations.

## Models, controls and sound

New SVG evidence includes simultaneous equations, interval endpoints/rays, sequences, equal-unit coordinate segments with a midpoint selector, parabolas, two separate hyperbola branches, exponential curves, trigonometric waves, separate tangent branches/asymptotes, right-triangle surveys, triangle midlines, cones, spheres, pyramids, joined cylinder/cone cargo, box plots, histograms, Venn regions and stated interest terms. Essential models can be enlarged with touch or keyboard activation. Drawing windows do not replace the functions' mathematical domains.

The existing signed-integer, exact rational, fraction and Cartesian response controls are reused. All new numerical answers are checked against their available keypad characters. Phone prompts are concise; full reasoning stays in the hints and persistent feedback. Original backgrounds, sprites, thumbnails, animations, controls and Sprint source remain unchanged.

Twenty mission themes and one Grade 10 Review arrangement are appended. There are 199 distinct arrangements: 192 mission/level themes and seven Review themes. Separate music/effects volume, mute, reduced motion, pause and unsupported-audio behavior remain available.

## Save compatibility

The `wga_math_sprint_learning_v1` key and profile version are unchanged. Grade 10 adds `gradeSessions[10]` with separate Adventure, Learn and Review checkpoints. Adventure unlocks its twenty missions in order; Learn and Review never award Adventure completion or Sprint scores.

Migration checks retain all six previous grade paths, results, numeric/fraction/point drafts, hints, practice visits, review plans, volumes and Sprint records. Hash tests retain all 1,200 earlier activity objects and 178 earlier arrangements. Corrupt, locked and cross-grade checkpoints are rejected without erasing valid older progress.

## Final public game information

The same release reconciles the 22 published game guides and catalog descriptions with repository content. Fixed campaigns, continuous modes, actual level/mission counts, controls, story scope and music/features are distinguished. The site now uses the current names for City of Legends, World Explorer and Restore Verdale even when database rows still contain older names. Slugs, IDs, score histories, database schema, thumbnails, chat and dedicated game-tab routes remain intact.

See [the final game-page content audit](game-pages-final-content.md) for all 22 verified scopes. Fibre Circle sponsorship is retained. Sky Temple's dedicated four-world launch contract is unchanged; its separate legacy game manifest is not used as the active campaign count.

## Exact incremental files

Added:

1. `apps/web/public/games/math-sprint-arena/learning-grade10.js`
2. `apps/web/public/games/math-sprint-arena/learning-grade10-tools.js`
3. `apps/web/scripts/math-sprint-grade10-browser.cjs`
4. `apps/web/scripts/game-content.test.tsx`
5. `docs/releases/math-sprint-v4.7.md`
6. `docs/releases/game-pages-final-content.md`

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
10. `apps/web/scripts/math-sprint-grade9-browser.cjs` — expected grade/music counts only
11. `apps/web/scripts/math-sprint.test.cjs`
12. `apps/web/src/content/gameEditorials.ts` — final information for the 22 public games
13. `apps/web/src/lib/gameCatalog.ts` — final descriptions and three canonical names
14. `apps/web/src/lib/fallbackGames.ts` — use the canonical names in fallback listings

## Validation and installation

The 84 game tests cover all 1,400 activities, exact maths, unique algebraic options, complete roots, inequality solution sets, coordinate models, rational powers, dimensional geometry, interest, data, probability, migration and old-content hashes. Sprint's original 260-question victory flow remains covered. Twenty-nine rendered-page/content checks and twelve shared score/fullscreen checks bring local tests to 125. The Next.js production webpack build includes TypeScript validation. JavaScript, HTML IDs/local references, CSS, JSON and diff checks are included.

Grade 10 browser checks use 320×568, 568×320, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. They exercise real touch/keyboard input, hints, diagram enlargement, partial fraction/point reloads, separate Review, six older-grade drafts, v4.6 migration, orientation changes and blocked storage/audio. The phone run completes all 100 Adventure and 100 alternate activities. A separate sweep checks every new activity, three hints, input targets and solved feedback at all nine viewports: 1,800 layout cases.

Browser regressions replay Grades 4–5 and Grade 9 campaigns/practice, Sprint, save migration, sound, fullscreen and motion behavior. Grades 6–8 checkpoint isolation is exercised by the Grade 10 browser scenarios; their complete activity/model/save suites and hashes remain in the game tests. Public-content checks render all 22 guides, verify catalog consistency and scope, preserve unknown-game behavior and confirm the three name corrections do not change slugs or IDs.

```sh
node --test apps/web/scripts/math-sprint.test.cjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
node --test scripts/game-tab-score.test.mjs scripts/game-tab-ui.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

For browser QA set `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE`, then run `apps/web/scripts/math-sprint-grade10-browser.cjs`. `MATH_QA_WIDTH` filters viewport widths and `MATH_QA_OUTPUT` selects the result directory. `MATH_QA_LAYOUT_ONLY=1` runs all-bank layout checks.

Install from merged `main`. No database migration, asset relocation or deployment-setting change is required. Existing profiles are normalized automatically on first load. The owner will build and deploy on Cloudflare; this release does not initiate deployment or provide a ZIP.

The planned Grades 4–10 learning paths and final game-page information are ready for the owner's production review and Cloudflare deployment once repository validation and merge are complete.
