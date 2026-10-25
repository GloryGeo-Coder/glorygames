# Science Lab Dash v3.2 — Grade 6 Water Investigator

The academy’s water wing opens after the Grade 5 materials fair. Five new missions and fifteen investigations explore particle arrangements, mixtures, separating materials, solutions, dissolving rates, saturation, wetlands and evidence-led water decisions. The adventure now has fifteen missions and forty-five investigations across Grades 4–6. The original twenty-mission dash remains available; the manifest totals thirty-five missions across both modes.

The story leads from a mixed-up supply dock through a solution vault and timing hub to a wetland exhibition and waterworks relay. Learners track material markers, compare fair-test time bars and explain different kinds of evidence. The final sample stays with qualified specialists while its chemical alert remains unresolved. Completing the path awards the Water Investigator story title.

## Presentation and controls

New SVG diagrams cover every Grade 6 activity. Particle and separation diagrams track their model quantities; dissolving charts label their units as illustrative. Solid-particle vibration and reduced-motion handling are included. Existing character sprites, thumbnail and academy background images remain unchanged. The background renderer now accepts each mission’s location, retaining the same existing locations for Grades 4–5 and using them for the new water-wing missions.

Five additional original Web Audio arrangements bring the adventure to fifteen distinct mission phrases. New flow, sieve, stirring and valve effects accompany existing sounds. Separate audio volumes, optional fullscreen, portrait/landscape layouts, safe-area spacing and simultaneous touch controls remain available.

The mission map groups all three grades and preserves sequential unlocks. Grade titles and completion transitions use the current learning path. Grade 5’s ending leads to Grade 6; a completed Grade 5 save continues into its first new mission, while an unfinished investigation remains at its existing checkpoint.

## Compatibility and scope

The save key remains `wga_science_chemistry_v1`, schema version 1. The first thirty investigation definitions, Grade 4–5 story data and first ten music arrangements are unchanged. Existing scores, trial histories, choice orders, hints, notebook records and fragment collections remain compatible. Original-dash lesson definitions, expanded question banks, tuning and save keys remain unchanged. No dependencies, database changes, hosting configuration or unrelated game changes are included.

[Curriculum mapping and scientific model assumptions](science-lab-dash-v3.2-curriculum.md) document the selected CAPS topics, illustrative quantities and water-evidence limits. Grades 7–10 and final website editorial updates remain subsequent increments.

## Validation

- Thirty-two Science Node checks cover all three grades, existing content/audio hashes, Grade 6 model reachability, conserved markers, fair-test graphs, saturation with and without residue, water-hazard distinctions, old-save continuation, active checkpoints, locks, replay scoring, diagrams and asset references.
- Shared score/fullscreen tests and rendered game-page/Sky Temple regressions provide another thirty-nine checks.
- The browser suite uses held touch movement and tapped controls to play all fifteen missions and forty-five investigations. It refreshes active investigations in each grade, including an unrun Grade 6 setting after a second comparison trial, and checks wrong-answer recovery, grade transitions, forty-five notebook entries, replay scoring and preserved original save data.
- Separate completed Grade 4 and Grade 5 save fixtures continue into the next grade with their scores and existing fifteen/thirty notebook records intact.
- Thirteen viewport sizes are checked in each grade (thirty-nine grade/size cases), including 320×568 and 568×280, fullscreen, rotation, emulated safe areas, simultaneous input, touch cancellation and scrollable investigations. Six original-dash layouts and twenty level-loading fixtures remain covered.
- Storage/audio/art failures, missing optional Grade 5/6 diagram renderers and denied/unsupported fullscreen are checked. Reduced-motion behaviour for the new particle diagram is verified. Screenshots are visually reviewed, and all forty-five Grade 6 diagram-setting variants are checked for clipped labels. Chromium emulation is not physical iOS/Safari certification; original level fixtures are not full arcade playthroughs.
- JavaScript syntax, JSON/asset references, diff checks and the Next.js 16 production build are validated before merging.

## Installation

Pull `main` after the feature PR merges and use the existing Cloudflare/OpenNext build process. No ZIP or migration is required. Cloudflare deployment stays with the owner. The next increment is Grade 7.

## Exact files

Modified:

- `.github/workflows/science-chemistry.yml`
- `apps/web/public/games/science-lab-dash/chemistry-art.js`
- `apps/web/public/games/science-lab-dash/chemistry-audio.js`
- `apps/web/public/games/science-lab-dash/chemistry-data.js`
- `apps/web/public/games/science-lab-dash/chemistry-game.js`
- `apps/web/public/games/science-lab-dash/chemistry-visuals.js`
- `apps/web/public/games/science-lab-dash/chemistry.css`
- `apps/web/public/games/science-lab-dash/game.json`
- `apps/web/public/games/science-lab-dash/index.html`
- `apps/web/scripts/science-chemistry-browser.cjs`
- `apps/web/scripts/science-chemistry.test.cjs`

Added:

- `apps/web/public/games/science-lab-dash/chemistry-grade6.js`
- `apps/web/public/games/science-lab-dash/chemistry-grade6-visuals.js`
- `docs/releases/science-lab-dash-v3.2-curriculum.md`
- `docs/releases/science-lab-dash-v3.2.md`
