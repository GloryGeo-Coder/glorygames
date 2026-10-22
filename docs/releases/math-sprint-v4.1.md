# Math Sprint Arena v4.1 — Grade 4 exploration and revision

Number City expands from ten to twenty missions. The original 50 Adventure activities remain unchanged, and ten new missions add 50 more. Every mission also has an alternate five-activity practice bank: 100 Adventure activities plus 100 alternate activities, for 200 authored activities in total.

## New playable district

| Mission | Location | Learning focus and interaction |
| --- | --- | --- |
| 11 | Shape Workshop | Identify 2-D shapes, count straight sides and compare properties using illustrated choices |
| 12 | Symmetry Studio | Complete a reflected pattern by matching each row and distance from the mirror line |
| 13 | Ruler Route | Read scaled rulers, including strips beginning above zero, and subtract start from end |
| 14 | Tile Workshop | Cover rectangular floors with equal squares and connect counting to rows and columns |
| 15 | Mass Delivery | Convert kilograms and additional grams into a whole-number gram total |
| 16 | Water Lab | Read labelled liquid scales with different capacities and interval sizes |
| 17 | Tram Timetable | Find elapsed minutes across an hour boundary using matching analogue and digital clocks |
| 18 | Survey Square | Count a supplied shape collection and record frequencies with grouped tally marks |
| 19 | Data Observatory | Interpret category counts, totals and differences in bar graphs and one-to-one pictographs |
| 20 | City Showcase | Apply shapes, time, area, data and symmetry in a mixed final mission |

These activities extend selected CAPS Grade 4 skills. They are not a complete Grade 4 course or a formal assessment. Area is introduced through equal squares, and pictographs use one picture per learner.

The mathematical content is original. Topic mapping uses the DBE Mathematics Grades 4–6 CAPS specifications and the Grade 4 annual teaching plan; no claim is made that this game's order matches a school's term schedule.

- [DBE CAPS Mathematics Grades 4–6](https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20IP%20%20MATHEMATICS%20GR%204-6%20web.pdf)
- [DBE 2026 Grade 4 Mathematics annual teaching plan](https://www.education.gov.za/LinkClick.aspx?fileticket=HINtK497f94%3D&mid=10739&portalid=0&tabid=3207)

## Fresh practice and focused review

Learn can use a guided or alternate bank for every mission. After a completed set, **Try a fresh practice set** changes the bank and starts at its first activity. Each bank keeps the same topic and controls while varying the examples. Reopening an unfinished set resumes its existing bank and draft.

**Review with Pi-Bot** creates a saved five-activity plan from practised topics. It prioritises activities whose latest recorded completion used a hint or retry, then mixes topics with fewer recorded completions. Repeated review rotates through older completed topics instead of staying in the first five missions. A new player begins with number-building review.

Review has its own checkpoint and music. It records independent and supported practice, while retaining the exact active Adventure checkpoint, mission results and Sprint scores. A completed review never unlocks Adventure missions. History is recorded once when the learner continues after a correct activity, preventing duplicate completion credit.

## Mobile and visual behaviour

- Reflection squares, equal floor tiles, illustrated shape choices and tally counters use touch-sized controls.
- Draft reflections preserve the exact lit-square pattern; tally counters preserve each category's count.
- Essential models stay visible in compact landscape. Every measuring/data diagram can be enlarged by tapping it, or by focusing it and pressing Enter/Space. The enlarged view uses the same diagram and values.
- Bar heights, axes, category labels and displayed counts use the same data. Jug levels and graduated intervals match the answer; clock hands include the minute contribution to the hour-hand position.
- The existing responsive layouts, contextual Pi-Bot poses, keyboard input, reduced-motion behaviour, fullscreen menu and separate volume controls remain available.
- Ten new mission arrangements and one Review arrangement are appended to the music bank. The original 62 arrangements are unchanged. Total: 72 level arrangements and one Review arrangement.

## Save and asset compatibility

The existing `wga_math_sprint_learning_v1` key and profile version remain in use. Missing optional practice/history/review fields are initialised safely. Older sessions without a bank field resolve to their original activities.

All original ten mission IDs, results, hints, drafts and checkpoints remain valid. Completing mission ten opens Shape Workshop. The original Sprint source, its 52 levels and save keys are unchanged. Existing backgrounds, sprites, thumbnails and other game assets are unchanged.

Tests lock the hashes of the original 50 activities and first 62 musical arrangements. Migration is also exercised in a browser with a v4.0-shaped profile containing completed missions, an unfinished fraction activity and existing music/effects settings.

## Exact incremental files

Modified:

1. `apps/web/public/games/math-sprint-arena/arena-audio.js`
2. `apps/web/public/games/math-sprint-arena/game.json`
3. `apps/web/public/games/math-sprint-arena/index.html`
4. `apps/web/public/games/math-sprint-arena/learning-data.js`
5. `apps/web/public/games/math-sprint-arena/learning-ui.js`
6. `apps/web/public/games/math-sprint-arena/learning.css`
7. `apps/web/scripts/math-sprint.test.cjs`
8. `apps/web/scripts/math-sprint-browser.cjs`
9. `apps/web/src/content/gameEditorials.ts` — Math Sprint Arena entry only
10. `apps/web/src/lib/gameCatalog.ts` — Math Sprint Arena description only

Added:

1. `apps/web/public/games/math-sprint-arena/learning-extension.js`
2. `apps/web/public/games/math-sprint-arena/learning-tools.js`
3. `docs/releases/math-sprint-v4.1.md`

## Validation and installation

The 31 game tests cover all 200 activities, mathematical model consistency, ordered unlocks, alternate banks, review history/rotation, exact old-content preservation, migrations and the existing 260-question Sprint completion. Platform validation includes 25 rendered-page tests and 12 shared score/fullscreen checks. The Next.js production webpack build and TypeScript checks pass.

The optional browser script covers nine viewports from 320×568 and 568×320 to 1440×900, a full twenty-mission Adventure, all new tools, enlarged diagrams, exact mirror/tally reloads, alternate-bank practice, saved Review plans, Adventure checkpoint isolation, real audio activation, reduced motion and live rotation. It also exercises blocked storage/audio and the old-profile migration.

```sh
node --test apps/web/scripts/math-sprint.test.cjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
node --test scripts/game-tab-score.test.mjs scripts/game-tab-ui.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

Merge the feature pull request into `main`, then build/deploy `apps/web` through the existing Cloudflare project. No asset relocation, database migration or Cloudflare configuration change is required. Cloudflare deployment remains with the owner.

Next: separate Grade 5 and Grade 6 learning paths, followed by Grades 7–9 and a separately mapped Grade 10 Mathematics path. Further revision/reporting and visual polish can build on the current saved learning records.
