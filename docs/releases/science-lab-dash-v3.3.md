# Science Lab Dash v3.3 — Grade 7 Element Navigator

The senior laboratory opens after the Grade 6 waterworks relay. Five missions and fifteen new investigations cover material properties, heating records, physical separation, paired litmus evidence, recovery plans, resource choices and introductory periodic-table navigation. The adventure now has twenty missions and sixty investigations across Grades 4–7. The original twenty-mission dash remains accessible; the manifest counts forty missions across both modes.

The story moves through a relay laboratory, separation gallery, indicator wing and recovery workshop before reconnecting the Element Registry. The final story title is Element Navigator. Each activity keeps untimed predictions, recorded comparisons, explanations, progressive hints and recoverable movement challenges.

## Reference guide and presentation

The three Element Registry investigations include a collapsible first-twenty field guide. Every card supplies its name, symbol, category, group/period and atomic number. The guide is available in the Element Registry investigations and their replays. The card list is a reference sequence, while the exact SVG overview preserves standard periodic-table columns. Learners can consult all twenty cards and return directly to the investigation. Card selection is saved per activity and gives no extra score.

The guide has large touch targets, a two-column narrow-phone layout and ordinary vertical dialog scrolling. Names and categories remain available as text rather than relying on colour. Keyboard button activation, optional fullscreen, safe-area spacing and the existing portrait/landscape controls remain supported.

New SVG diagrams show circuits, warming comparisons, heating curves, separated collections, chromatography, paired indicators and reference-table positions. Five new original Web Audio arrangements bring the adventure to twenty distinct mission phrases. Relay, ink-drop, indicator and registry cues join existing effects, with separate music/effects volumes. Existing character sprites, thumbnail and background image files remain unchanged.

## Compatibility and scope

The save key remains `wga_science_chemistry_v1`, schema version 1. Completed Grade 6 saves continue into Grade 7. Unfinished investigations retain their existing position, settings, trials, hints, choice order and notebook records. New reference-symbol data is validated only for new guide activities; older laboratory record shapes are preserved. Earlier scores and permanent discoveries cannot be farmed by replaying or tapping reference cards.

The first forty-five investigation definitions, Grade 4–6 story data and first fifteen audio arrangements are unchanged. The original dash’s lessons, expanded question bank, tuning and save keys remain unchanged. This increment changes no dependency, database, deployment configuration or unrelated game.

[The curriculum mapping](science-lab-dash-v3.3-curriculum.md) documents selected CAPS topics, element-reference sources and the model assumptions. Grade 8–10 paths and final website editorial updates remain later increments.

## Validation

- Forty-one Science Node checks cover earlier-content/audio hashes, all four paths, the first-twenty data, material-property exceptions, paired indicators, conservation across separation routes, chromatography limits, resource-brief trade-offs, old saves, new reference choices, locks, replay scoring and assets.
- Shared score/fullscreen and rendered game-page/Sky Temple regressions provide another thirty-nine checks.
- The browser suite uses held touch movement and tapped controls for all twenty missions and sixty investigations. It refreshes active activities in every grade, including an unrun label-packet setting with a saved reference card, and verifies wrong-answer recovery, grade transitions, sixty notebook records, anti-farming and unchanged original saves.
- Completed Grade 4, 5 and 6 save fixtures continue to the next grade with fifteen, thirty and forty-five existing notebook records and their scores intact.
- Thirteen viewport sizes per grade give fifty-two grade/size cases. Checks include 320×568, 568×280, fullscreen, rotation, emulated safe areas, simultaneous controls, touch cancellation and reference-card sizing/selection. Six original-dash layouts and twenty original level fixtures remain covered.
- Ninety Grade 6–7 diagram-setting variants are checked for clipped labels. All twenty reference cards are exercised through the phone UI, with separate narrow-phone/desktop guide inspection. Storage/audio/art failures, optional diagram-renderer failures and unsupported/denied fullscreen are checked. Screenshots are visually reviewed.
- JavaScript syntax, JSON/asset references, diff checks and the Next.js 16 production build are validated before merging. Chromium emulation is not physical-device Safari certification, and original level fixtures are not complete arcade playthroughs.

## Installation

Pull `main` after the feature PR merges and build with the existing Cloudflare/OpenNext configuration. No ZIP, migration or dependency update is required. Cloudflare deployment remains with the owner. The next learning-path increment is Grade 8.

## Exact files

Modified:

- `.github/workflows/science-chemistry.yml`
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

- `apps/web/public/games/science-lab-dash/chemistry-grade7.js`
- `apps/web/public/games/science-lab-dash/chemistry-grade7-visuals.js`
- `docs/releases/science-lab-dash-v3.3-curriculum.md`
- `docs/releases/science-lab-dash-v3.3.md`
