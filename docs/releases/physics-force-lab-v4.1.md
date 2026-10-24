# Physics Force Lab v4.1 — Recovery District

The adventure expands from five to ten missions and from fifteen to thirty repair stations. Chapter two follows Professor Newtonia and Pip into Nova’s Recovery District, where restored beacons, a canal, power cabinets and the observatory reveal why the Quantum Core shut down. The final rescue leads into the next heat-and-energy investigation.

## New missions

| Mission | Learning scope | Practical task |
| --- | --- | --- |
| 6. The listening garden | Grade 4 sound | Change pluck strength; distinguish loudness from pitch using wave height and a constant-pitch sound. |
| 7. Power from the canal | Grade 5 enrichment | Compare release heights with a fixed quantity of water and the same wheel. Use its movement to operate recovery machinery. |
| 8. The wireworks mystery | Grade 6 circuits | Rotate wire tiles into a continuous route between a cell and lamp; retain the fixed return lead. |
| 9. The turning sky | Grade 6 Earth movements | Rotate an Earth model relative to a fixed light source to investigate day, night and their boundary. |
| 10. A light through the storm | Grade 6 revision and enrichment | Combine the water system, wire-routing circuit and night-relay investigations. Each station retains its own equipment and lesson. |

These are selected topics, not complete grade syllabuses. [DBE CAPS Natural Sciences and Technology Grades 4–6](https://www.education.gov.za/LinkClick.aspx?fileticket=IzbFrpzoQ44%3D&tabid=572) covers Grade 4 sound, Grade 5 energy/movement and Grade 6 circuits and Earth rotation. The falling-water application is explicitly labelled **extension** in the game: it is enrichment, rather than a claim that reservoir-height calculations are a prescribed Grade 5 CAPS assessment. Numerical outputs are simplified teaching models. No formal gravitational-energy equation is assessed here.

## Gameplay and learning

- New routes are 4,000 logical units long, 25% longer than the unchanged 3,200-unit opening routes. Optional one-way inspection platforms hold exploration rewards, with four recoverable drone patrols per new route.
- New investigations require observations at two different equipment settings before an explanation can complete a repair. Repeated clicks on the same setting do not count as a comparison. The original five missions retain their existing completion rules.
- Wire puzzles use large tap-to-rotate buttons, keyboard activation, directional labels and a visible return wire. No precise dragging is required.
- Two hint stages provide a conceptual prompt followed by station-specific guidance. Hint state, equipment, predictions and recent trials survive refresh.
- A field notebook records completed repairs, concepts and measured observations. Its entries survive mission retries; earlier saved repairs can be imported without inventing missing trial measurements. Open it from Pause or Settings.
- Five additional original synthesized arrangements bring the total to ten. Sound-strength tests change volume while holding the tone at 440 Hz. Visible waves and written results support muted play.
- Repaired equipment animates in the world, the workshop displays ten mission photographs, and reduced-motion settings also stop decorative robot gestures and wheel rotation.

## Compatibility

The adventure keeps `wga_physics_adventure_v1` and save format version 1. Loading a completed first-chapter save offers mission six while preserving earlier repairs, collection records, settings and checkpoints. An unfinished replay resumes its own checkpoint. The original five mission definitions remain data-equivalent to v4.0; their models, route lengths, controls and scoring are retained.

The twelve original labs, their entry, runtime, assets, best-score key and score/fullscreen support are untouched. No game-page editorial copy, other game runtime, shared launch code or Cloudflare configuration is changed. The platform game-page/story rewrite remains deferred until the Grade 10 learning route is complete.

## Exact file list

Added:

- `apps/web/public/games/physics-force-lab/adventure-chapter2.js`
- `docs/releases/physics-force-lab-v4.1.md`

Modified:

- `apps/web/public/games/physics-force-lab/adventure-data.js`
- `apps/web/public/games/physics-force-lab/adventure-audio.js`
- `apps/web/public/games/physics-force-lab/adventure.js`
- `apps/web/public/games/physics-force-lab/adventure.css`
- `apps/web/public/games/physics-force-lab/index.html`
- `apps/web/public/games/physics-force-lab/game.json`
- `apps/web/scripts/physics-adventure.test.cjs`
- `apps/web/scripts/physics-browser.cjs`

## Validation

- Twenty Physics tests cover all thirty achievable repair targets, legacy mission preservation, ten distinct audio phrases, migration, unlocks, retries, notebook persistence, comparison rules, hint bounds, platform landings, model relationships and references. Wire routing is compared with an independent geometry/union-find oracle across all 18,432 active-tile rotation combinations.
- Thirteen shared score/fullscreen checks and twenty-five game-page/Sky Temple launch checks passed: 58 automated checks in total.
- Real browser input completed missions 1–5 as regression coverage, then missions 6–10 from a completed-v4.0 migration fixture. The new chapter checked the optional platform jump, a partially rotated puzzle and hints across refresh, mixed-station equipment, all thirty notebook entries, and notebook retention after retry.
- Nine viewport layouts passed: 320×568, 360×740, 375×667, 390×844, 568×320, 844×390, 768×1024, 1024×768 and 1440×900. Checks include simultaneous movement/jump touches, reachable controls, state-preserving rotation, experiment scrolling, settings/fullscreen and unavailable storage/audio. The new wire board was additionally checked at 320×568, 568×320, 1440×900 and 390×844.
- The original twelve-lab entry starts successfully. No uncaught browser JavaScript errors were observed in the passing runs.
- Next.js production build, JavaScript syntax, HTML IDs, JSON, CSS parsing and local asset references passed.

Run `node --test apps/web/scripts/physics-adventure.test.cjs`. The existing `physics-browser.cjs` suite now covers all ten missions by default. `PHYSICS_CHAPTER=2` exercises migration and the new chapter; `PHYSICS_SMOKE=1` runs the shorter layout/fallback suite. Set `PLAYWRIGHT_PATH` and `CHROME_BIN` when using an externally installed Playwright/Chromium runtime. All browser tests use a local static server and isolated test storage.

Merge the tested increment into `main`; the owner handles Cloudflare deployment. Next: Grade 7 heat-and-energy missions, followed by Grades 8–9 and Grade 10 physics in later increments.
