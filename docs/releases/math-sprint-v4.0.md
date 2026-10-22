# Math Sprint Arena v4.0 — Number City learning foundation

Math Sprint Arena now opens with a mobile learning hub. Number City has ten untimed Grade 4 missions and 50 authored activities, with separate Adventure and Learn checkpoints. The existing 52-level Sprint remains available, including its earlier best-score key.

## What players receive

- Adventure unlocks ten missions in order: Place Value Power, Number Line Bridge, Addition Workshop, Subtraction Station, Array Engines, Sharing Station, Pattern Tracks, Market Mission, Fraction Bridge and Number City Champion.
- Learn permits any topic without unlocking Adventure or submitting learning results to Sprint leaderboards.
- Place-value columns and fraction pieces respond to taps; other activities use a built-in keypad or a physical keyboard. Diagrams include number lines, arrays, equal-share generators and a labelled rectangle.
- Three stages of help and persistent explanations support recoverable mistakes. Results distinguish independently correct answers from activities completed after hints or retries. A weaker replay does not erase a better Adventure result.
- Checkpoints retain the current activity, draft number or selected fraction amount, hints and retries. Reopening an answered activity retains its explanation and Continue button.
- The mobile layout puts the task, response and feedback together. The common menu contains the mission strategy, separate music/effects controls, save/home and the existing supported-browser fullscreen control.
- Existing character art is retained, with contextual Pi-Bot poses, gentle animation, reduced-motion support and responsive Sprint character/platform scale.
- Ten learning arrangements and 52 Sprint arrangements have distinct original melodies. They use browser-synthesised melody, bass and percussion without additional audio downloads. Audio denial leaves both modes playable.

## Curriculum scope

Number City is a selected-skills Grade 4 practice chapter, not a complete course or a formal assessment. The visible home page, metadata and information-page copy state that scope.

| Missions | Grade 4 content area | Practice focus |
| --- | --- | --- |
| 1–4 | Numbers, Operations and Relationships | Four-digit place value, mental strategies, addition and subtraction with regrouping |
| 5–6 | Numbers, Operations and Relationships | Equal groups, multiplication, equal sharing and division checks |
| 7 | Patterns, Functions and Algebra | Extending additive and multiplicative number patterns |
| 8 | Numbers, Operations and Relationships | Money contexts: totals, change and equal shares |
| 9 | Numbers, Operations and Relationships | Common fractions as equal parts of a whole |
| 10 | Mixed number skills and Measurement | Transfer activities and the perimeter of a rectangle |

Source: DBE, *CAPS Mathematics Grades 4–6*, especially the Grade 4 topic/content specifications. The activities and explanations are original; they do not copy assessment questions.

- https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements%28CAPS%29/CAPSIntermediate/tabid/572/Default.aspx
- https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20IP%20%20MATHEMATICS%20GR%204-6%20web.pdf

## Sprint corrections and compatibility

- Skip replaces the current question with a 50-point cost; it cannot advance rounds or unlock levels.
- Continue resumes the same question. Level-complete overlays and menu/background pauses stop the timer. Pending correct-answer, retry and timeout transitions are saved and cannot run inside learning mode.
- Fraction comparisons use equivalent fraction choices instead of long recurring decimal strings. Geometry includes dimensions/units; triangle questions vary all unknown answers. Prompts avoid duplicated question suffixes.
- The victory bonus contributes to the saved best score. Browser storage exceptions and missing images have safe fallbacks. Sprint assets load on demand when entering Sprint.
- Existing key `wga_math_sprint_arena_v3_best` is preserved. New keys are `wga_math_sprint_arena_v4_sprint` and `wga_math_sprint_learning_v1`. No other game's assets, controls or saves change.

## Exact incremental file list

Modified:

1. `apps/web/public/games/math-sprint-arena/game.js`
2. `apps/web/public/games/math-sprint-arena/game.json`
3. `apps/web/public/games/math-sprint-arena/index.html`
4. `apps/web/src/content/gameEditorials.ts` — Math Sprint Arena entry only
5. `apps/web/src/lib/gameCatalog.ts` — Math Sprint Arena description only

Added:

1. `apps/web/public/games/math-sprint-arena/learning-data.js`
2. `apps/web/public/games/math-sprint-arena/learning-ui.js`
3. `apps/web/public/games/math-sprint-arena/learning.css`
4. `apps/web/public/games/math-sprint-arena/arena-audio.js`
5. `apps/web/scripts/helpers/math-runtime.cjs`
6. `apps/web/scripts/math-sprint.test.cjs`
7. `apps/web/scripts/math-sprint-browser.cjs`
8. `.github/workflows/math-sprint.yml`
9. `docs/releases/math-sprint-v4.0.md`

All existing backgrounds, sprites, thumbnails and other game assets are unchanged. The game page retains its thumbnail, new-tab launch, description, FAQs, scores, related games and chat.

## Validation

Automated checks cover all 50 learning activities, ordered unlocks, support tracking, checkpoint recovery, exact rational comparisons, unavailable storage/audio, sampled choice correctness across all 52 Sprint levels, a complete 260-question Sprint playthrough and compatibility with existing best scores. A dedicated GitHub workflow runs the shipped JavaScript and game tests.

```sh
node --test apps/web/scripts/math-sprint.test.cjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
node --test scripts/game-tab-score.test.mjs scripts/game-tab-ui.test.mjs
node node_modules/next/dist/bin/next build --webpack
```

The optional real-browser script exercises touch/desktop controls, all ten Adventure missions, free practice, checkpoints, menu/fullscreen, audio settings, supported storage failures and Sprint pause/reload/Skip. Viewports: 320×568, 568×320, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE` can point to an installed Playwright package and browser. `MATH_QA_OUTPUT` selects the screenshot/report directory.

## Installation and deployment

Merge this feature branch through its pull request to `main`, then use the existing Cloudflare project to build and deploy `apps/web`. No manual asset movement or database migration is required. Existing Cloudflare Worker configuration is unchanged. This release does not perform a Cloudflare deployment.

## Remaining roadmap

1. Extend and vary the Grade 4 activity banks; add more hands-on geometry, measurement and data handling. Validate each new topic against its grade specification.
2. Add separate Grade 5 and Grade 6 learning paths with their own prerequisites, explanations and review tasks.
3. Expand to Grades 7–9 with integer/ratio reasoning, deeper algebra, geometry and data activities.
4. Add a separately mapped Grade 10 Mathematics path, including functions, geometry, trigonometry, statistics, finance and probability.
5. Add cross-topic revision, spaced practice, printable topic summaries and further character/scene animation as these paths become playable.

These stages are a roadmap; the production interface advertises only the Grade 4 chapter and Sprint that are currently playable.
