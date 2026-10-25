# Science Lab Dash v3.5 — Grade 9 Reaction Guardian

Completing the Particle Observatory now opens the Reaction District. Five Grade 9 missions add fifteen investigations on compound formulae, balanced equations, oxides, corrosion, pH, neutralisation and recovery decisions. The adventure contains thirty missions and ninety investigations across Grades 4–9. The original twenty-mission dash remains available, giving fifty missions across both modes in the manifest.

The story repairs the district ledger, oxide workshop, skyline station and indicator relay before reconnecting the restoration core. Professor Nova awards the Reaction Guardian title after the final mission. Learning stays untimed and uses predictions, comparison records, explanations, hints, application and replay.

## Presentation and play

New SVG diagrams show name/formula records, charged crystal slices, atom-count ledgers, protective coatings, pH scales, indicator evidence, neutralisation counters and pollution-source comparisons. Text labels support colour. Ionic-solid formulae are distinguished from molecules; invalid proposals are explicitly described as proposals to audit.

Five original Web Audio arrangements bring the adventure to thirty distinct mission phrases. Crystal, balancing and neutralisation effects join the existing cues, with independent music/effects volumes. Existing animated character sprites, background image files and the thumbnail are unchanged.

The first-twenty element guide supports the three new district-ledger investigations and their replays. Reference selections save per activity and award no score. Existing touch controls, portrait/landscape layouts, safe areas, reduced motion and optional fullscreen remain supported.

## Compatibility and scope

The save key remains `wga_science_chemistry_v1`, schema version 1. Completed Grade 8 saves enter Grade 9 with all seventy-five notebook records and their score intact. Unfinished activities preserve position, predictions, trial history, hints, answer order, unrun choices and reference selections. Oversupply records remain recorded when a player returns to a matched but unrun neutralisation setting.

The first seventy-five investigation placements, Grade 4–8 stories and first twenty-five music arrangements are unchanged. Grade 4’s existing waterproof task remains intentionally reused in two missions. The original dash’s twenty lessons, question banks, tuning and save keys are unchanged. No dependency, database, deployment configuration or unrelated-game change is included.

[The curriculum mapping](science-lab-dash-v3.5-curriculum.md) records the 2026 teaching-plan topics, reference sources and model limits. Grade 10 and final website editorial updates remain later increments.

## Validation

- Sixty-two Science Node checks cover earlier-content/audio hashes, all six paths, exact formula/charge inventories, balancing without subscript changes, oxide families, corrosion sites, pH evidence limits, neutralisation excess, product identities, restoration targets, old saves, new checkpoints, locks, replay scoring and assets.
- Thirty-nine shared score/fullscreen and rendered game-page/Sky Temple regressions cover the platform launch model.
- The browser suite uses held touch movement and tapped controls through all thirty missions and ninety investigations. It checks wrong-answer recovery, all grade boundaries, final title, ninety notebook records, replay scoring and unchanged original saves. Active-refresh fixtures cover each grade, including a Grade 9 reference selection and an unrun matched setting after recorded neutralisation oversupply.
- Completed Grade 4, 5, 6, 7 and 8 save fixtures retain fifteen, thirty, forty-five, sixty and seventy-five notebook entries and their scores while opening the next grade.
- Thirteen viewport sizes per grade give seventy-eight adventure grade/size cases. Checks include 320×568 and 568×280, simultaneous touch input, cancellation, fullscreen, rotation, safe areas, scrolling and guide-card targets. All 180 Grade 6–9 diagram-setting combinations are checked for clipped labels. Screenshots are visually reviewed.
- Touch-cancellation automation waits for released movement with a two-second failure limit, then asserts the state. It does not clear the game input to pass the check. Twenty focused landscape repetitions also released correctly.
- Twenty original-dash level fixtures and six original layouts remain covered. Audio/storage/art failures, optional Grade 5–9 diagram-renderer failures and unsupported/denied fullscreen remain covered.
- JavaScript syntax, JSON/asset references, diff checks and the Next.js 16 production build are validated before merging. Chromium emulation is not physical-device Safari certification; original level fixtures are not full arcade playthroughs.

## Installation

Pull merged `main` and use the existing Cloudflare/OpenNext build process. No ZIP, migration or dependency update is required. Cloudflare deployment remains with the owner. Grade 10 is the next learning-path increment.

## Exact files

Modified:

- `.github/workflows/science-chemistry.yml`
- `apps/web/public/games/science-lab-dash/chemistry-audio.js`
- `apps/web/public/games/science-lab-dash/chemistry-data.js`
- `apps/web/public/games/science-lab-dash/chemistry-game.js`
- `apps/web/public/games/science-lab-dash/chemistry-visuals.js`
- `apps/web/public/games/science-lab-dash/game.json`
- `apps/web/public/games/science-lab-dash/index.html`
- `apps/web/scripts/science-chemistry-browser.cjs`
- `apps/web/scripts/science-chemistry.test.cjs`

Added:

- `apps/web/public/games/science-lab-dash/chemistry-grade9.js`
- `apps/web/public/games/science-lab-dash/chemistry-grade9-visuals.js`
- `docs/releases/science-lab-dash-v3.5-curriculum.md`
- `docs/releases/science-lab-dash-v3.5.md`
