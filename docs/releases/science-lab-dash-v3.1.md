# Science Lab Dash v3.1 — Grade 5 Materials Maker

Five new missions reopen Nova Science Academy’s makers’ wing after Grade 4’s Element Archive restoration. Fifteen new investigations cover metal properties, magnetic attraction, heat conduction, rust protection, combining and processing materials, clay, plant fibres and choosing products for a purpose. The campaign now contains ten missions and thirty investigations across Grades 4–5. The original twenty-mission dash remains accessible, bringing the manifest’s total across both modes to thirty missions.

The learning path remains sequential. The mission map groups Grade 4 and Grade 5 clearly and marks locked missions. The Grade 4 ending leads into Grade 5; completed Grade 4 saves continue to the first new mission without replaying the archive. Unfinished investigations resume in their existing grade. The final new mission awards the Materials Maker story badge. More than one material can solve the final window and packaging briefs.

## Presentation and mobile

Existing illustrated characters, sprite atlas, thumbnail and three academy backgrounds are reused unchanged. Grade 5 adds exact SVG teaching diagrams for every new activity and reuses the world’s established scale. The restored-room display follows the current grade. Five additional original Web Audio arrangements give each new mission a distinct musical phrase; mixing, magnet and time-lapse sounds join existing effects. Music/effects controls and optional fullscreen remain available.

The portrait/landscape shell, safe-area handling, simultaneous touch input and native scrollable dialogs are retained. Grade labels, story endings, progress counts and diagram descriptions adapt to the current path. Missing optional Grade 5 diagram rendering falls back to labelled observations without blocking learning.

## Compatibility and scope

The save key remains `wga_science_chemistry_v1` and the schema remains version 1. Existing mission IDs, Grade 4 lessons, checkpoints, trial history, choice order, hints, scores, fragments and notebook records remain compatible. New mission IDs are appended. The original dash’s lesson definitions, question banks, tuning, graphics and save keys are unchanged. No dependency, database, deployment configuration or other game changes are required.

[Curriculum mapping and model assumptions](science-lab-dash-v3.1-curriculum.md) document the selected CAPS topics and limits. This increment is a Grade 5 chemistry/materials path, not a complete annual Natural Sciences course. Grades 6–10 and final website editorial updates remain later increments.

## Validation

- Twenty-three Science Node tests cover both grades, all new models and alternatives, original Grade 4 content hashes, old-save continuation, active Grade 5 checkpoint recovery, replay scoring, ten distinct audio arrangements, diagrams and unchanged original-dash lesson data.
- Shared score/fullscreen and rendered game-page/Sky Temple regressions validate existing launch and scoring contracts.
- The browser suite plays all ten missions and thirty investigations through real phone controls, refreshes active Grade 4 and Grade 5 experiments, verifies the grade boundary and completion story, checks thirty saved notebook entries and confirms original save data remains unchanged.
- An upgraded completed Grade 4 save enters Grade 5 with its score and fifteen notebook records intact.
- Thirteen viewport sizes are exercised in both grades (twenty-six grade/size cases), including 320×568 and 568×280, touch cancellation, fullscreen, rotation, emulated safe areas and scrollable diagrams. Six original-dash layouts and twenty level-loading fixtures remain covered.
- Unavailable storage/audio/art, optional diagram rendering and denied/unsupported fullscreen are checked. Chromium emulation does not certify physical iOS/Safari devices; original level fixtures are not complete arcade playthroughs.
- JavaScript syntax, JSON/asset references, diff checks and the Next.js production build are validated before merging.

## Installation

Pull `main` after the feature PR merges and build with the existing Cloudflare/OpenNext commands. No ZIP or migration is needed. Cloudflare deployment stays with the owner. The next increment is Grade 6.

## Exact files

Modified:

- `.github/workflows/science-chemistry.yml`
- `apps/web/public/games/science-lab-dash/chemistry-art.js`
- `apps/web/public/games/science-lab-dash/chemistry-audio.js`
- `apps/web/public/games/science-lab-dash/chemistry-data.js`
- `apps/web/public/games/science-lab-dash/chemistry-game.js`
- `apps/web/public/games/science-lab-dash/chemistry-visuals.js`
- `apps/web/public/games/science-lab-dash/game.json`
- `apps/web/public/games/science-lab-dash/index.html`
- `apps/web/scripts/science-chemistry-browser.cjs`
- `apps/web/scripts/science-chemistry.test.cjs`

Added:

- `apps/web/public/games/science-lab-dash/chemistry-grade5.js`
- `apps/web/public/games/science-lab-dash/chemistry-grade5-visuals.js`
- `docs/releases/science-lab-dash-v3.1-curriculum.md`
- `docs/releases/science-lab-dash-v3.1.md`
