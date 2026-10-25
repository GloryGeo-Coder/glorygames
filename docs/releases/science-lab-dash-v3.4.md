# Science Lab Dash v3.4 — Grade 8 Particle Pathfinder

Completing the Element Registry now opens the Particle Observatory. Five Grade 8 missions add fifteen investigations about atoms, compounds and mixtures, particle movement, density, thermal expansion, pressure and chemical change. The adventure contains twenty-five missions and seventy-five investigations across Grades 4–8. The original twenty-mission dash remains accessible; the manifest counts forty-five missions across both modes.

The story visits the atom observatory, sample vault, motion gallery and observatory bridge before reconnecting the core. Professor Nova awards the Particle Pathfinder title after the final mission. Learning remains untimed, with predictions, comparison trials, explanations, progressive hints and replayable missions.

## Presentation and play

New SVG diagrams show subatomic counts, bonded atom groups, state arrangements, tracer snapshots, the ice-density exception, cargo comparisons, thermal clearance, transferred gas and before/after reaction inventories. Element symbols and text labels accompany colours. Equal marker counts and recorded observations make conservation and model assumptions visible. Proposed incorrect records are explicitly identified as records to reject.

Five original Web Audio arrangements bring the adventure to twenty-five distinct mission phrases. Particle, bond and pressure cues join the existing effects, with separate music/effects controls. Existing animated character sprites, thumbnail and background assets remain unchanged.

The first-twenty element guide is also available in the neutral-carbon investigation and its replay. Selection persists per activity without awarding points. Existing portrait/landscape controls, dialog scrolling, safe areas, reduced motion and optional fullscreen remain supported.

## Compatibility and scope

The save key stays `wga_science_chemistry_v1` with schema version 1. Completed Grade 7 saves continue into Grade 8 with sixty notebook records and their score intact. Unfinished checkpoints retain location, choices, trial history, hints, answer order and reference selections. Earlier scores cannot be farmed by replaying missions.

The first sixty investigation placements, Grades 4–7 story definitions and first twenty music arrangements are unchanged. Grade 4’s existing waterproof investigation is intentionally reused in two missions. The original dash’s twenty lessons, expanded question bank, tuning and save keys remain unchanged. No dependencies, databases, deployment configuration or unrelated games change.

[The curriculum mapping](science-lab-dash-v3.4-curriculum.md) records primary sources and teaching-model limits. Grade 9–10 paths and final information-page editorial updates remain later increments.

## Validation

- Fifty-one Science Node checks cover prior-content/audio hashes, all five paths, atom identity and charge, sample classification, formula ratios, particle and tracer counts, ordinary ice, density, thermal expansion, pressure-band overshoot, reaction inventories, locks, saves, replay scoring and asset references.
- Shared score/fullscreen and rendered game-page/Sky Temple regressions add thirty-nine checks.
- The browser suite uses held touch movement and tapped controls through all twenty-five missions and seventy-five investigations. Refresh fixtures cover every grade, including the Grade 8 unrun carbon setting, reference selection, hints and stable answer order. It checks wrong-answer recovery, grade transitions, notebook records, replay scoring and unchanged original save data.
- Completed Grade 4, 5, 6 and 7 fixtures continue to the next grade with fifteen, thirty, forty-five and sixty notebook records and their scores intact.
- Thirteen viewport sizes per grade give sixty-five adventure grade/size cases, including 320×568 and 568×280. Touch cancellation, simultaneous movement/jump, fullscreen, rotation, safe areas, element-card sizing, modal scrolling and diagram bounds are checked. Six original-dash layouts and twenty original level fixtures remain covered.
- All 135 Grade 6–8 diagram-setting combinations are checked for clipped SVG labels. Storage/audio/art failures, optional Grade 5–8 renderer failures and unsupported/denied fullscreen remain covered. Screenshots are visually reviewed.
- JavaScript syntax, JSON/asset references, diff checks and the Next.js 16 production build are validated before merging. Chromium emulation is not physical-device Safari certification. Original level fixtures are not complete arcade playthroughs.

## Installation

Pull merged `main` and use the existing Cloudflare/OpenNext build process. No ZIP, migration or dependency change is required. Cloudflare deployment remains with the owner. Grade 9 is the next learning-path increment.

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

- `apps/web/public/games/science-lab-dash/chemistry-grade8.js`
- `apps/web/public/games/science-lab-dash/chemistry-grade8-visuals.js`
- `docs/releases/science-lab-dash-v3.4-curriculum.md`
- `docs/releases/science-lab-dash-v3.4.md`
