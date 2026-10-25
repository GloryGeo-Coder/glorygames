# Science Lab Dash v3.6 — Grade 10 and the Element Core finale

Completing the Reaction District opens the isotope archive, bonding workshop, structure laboratory and amount observatory before the Element Core finale. Five Grade 10 missions add fifteen investigations and resolve the academy story. The adventure now contains thirty-five missions and 105 investigations across Grades 4–10. The original twenty-mission dash remains accessible, giving fifty-five missions across the two modes in the manifest.

The final story title is Element Core Investigator. Players retain the mission map, replay and Field notebook after the finale. The learning remains untimed and uses predictions, comparison trials, explanations, hints and applied discoveries.

## New learning and presentation

New SVG diagrams show isotope and ion counts, weighted abundances, subshell occupancy, bonding/structure evidence, mass boundaries and quantitative calculations. Supplied entities, units, rounded masses and final solution volumes remain visible. Multiple working conductor choices are accepted, and invalid proposals are identified explicitly.

Five original Web Audio arrangements bring the adventure to thirty-five distinct mission phrases. Count, calibration and finale effects join the existing sounds, with separate music/effects controls. Existing character sprites, thumbnail and background images remain unchanged.

[The curriculum mapping](science-lab-dash-v3.6-curriculum.md) identifies the selected Grade 10 topics, SI reference and teaching limits. This adventure is a selected CAPS chemistry learning path, not the complete annual science syllabus or a formal assessment programme.

## Final game information

The Science editorial, canonical catalog entry and Science references in the educational category now describe the completed game. Both information routes use the final storyline, grade coverage, mode-specific counts, controls, learning systems, progress/scoring, local saves, audio and FAQs. Catalog normalization applies the final title and summary to stale database rows and fallback listings without a migration.

Science’s server-rendered thumbnail now selects its existing PNG first, avoiding an initial request for an absent WebP. Other games retain their existing thumbnail order. The thumbnail-and-Play launch, dedicated game tab, score display, sidebar chat and related-game sections retain their existing behavior. Other games’ editorial and catalog entries are unchanged. No publication ZIP, artwork replacement or whole-application packaging is included.

## Save compatibility and scope

The save key remains `wga_science_chemistry_v1`, schema version 1. Completed Grade 9 saves open Grade 10 with ninety earlier notebook records and their score intact. Active choices, hints, reference cards, stable answer order, unrun settings and trials remain recoverable. Replay does not duplicate first-discovery or completion scores.

The first ninety investigation placements, Grades 4–9 stories and first thirty music arrangements are unchanged. The original dash retains its twenty lessons, expanded question bank, tuning and separate saves. No dependency, database, deployment configuration or unrelated game is modified.

## Validation

- Seventy Science Node checks cover preserved data/audio hashes, all seven paths, isotope identity, charges, weighted mass, occupancy, bonding, mobile carriers, molecule identity, mass boundaries, entity counts, units, concentration, ideal yield, calibration, old saves, locks, replay and assets.
- Six final-page checks cover counts, selected-curriculum wording, rendered guides, stale-database/fallback normalization, controls, launch, metadata sources and surrounding platform features. Thirty-nine shared game-tab/Sky Temple regressions remain covered.
- The browser suite uses held touch movement and tapped controls through all thirty-five missions and 105 investigations, all grade transitions and the final story resolution. It checks notebook retention, replay scoring, active refreshes in every grade and unchanged original save data.
- Completed Grade 4–9 fixtures continue into the next grade with fifteen through ninety notebook records and their scores intact. Grade 10 refreshes cover a selected reference card and a correct concentration setting not yet run.
- Thirteen viewport sizes per grade give ninety-one adventure grade/size cases, including 320×568 and 568×280. Touch cancellation, simultaneous movement/jump, safe areas, fullscreen, rotation, scrolling and reference cards remain checked. All 225 Grade 6–10 diagram-setting combinations are checked for clipped labels.
- Twenty original level fixtures, six original layouts, missing optional Grade 5–10 renderers, audio/storage/art failures and denied/unsupported fullscreen remain covered. Screenshots are visually reviewed. Chromium emulation is not physical-device Safari certification; original fixtures are not complete arcade playthroughs.
- The built Next.js site is checked at phone and desktop widths for the play page, detail page and educational category, including metadata and a real Play Game popup into the standalone adventure. This uses local fallback data; live account/chat services are not part of that fixture.
- JavaScript syntax, JSON/asset references, diff checks and the Next.js 16 production build are validated before merging. CI installs only the headless Chromium shell used by the suite, retaining system dependencies and all checks. Its browser-job timeout accommodates the expanded seven-grade suite and installation time.

## Installation

Pull merged `main` and use the existing Cloudflare/OpenNext build process. No migration, ZIP or dependency update is required. Cloudflare deployment remains with the owner. The planned Grades 4–10 learning paths and final game-page information are complete in this release.

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
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`
- `apps/web/src/components/GameThumb.tsx`
- `apps/web/scripts/game-tabs.test.tsx`
- `apps/web/src/app/categories/[category]/page.tsx`

Added:

- `apps/web/public/games/science-lab-dash/chemistry-grade10.js`
- `apps/web/public/games/science-lab-dash/chemistry-grade10-visuals.js`
- `apps/web/scripts/science-page.test.tsx`
- `apps/web/scripts/science-page-browser.cjs`
- `docs/releases/science-lab-dash-v3.6-curriculum.md`
- `docs/releases/science-lab-dash-v3.6.md`
