# Physics Force Lab v4.2 — Grade 7: Heat & Energy

Chapter three adds five Grade 7 missions and fifteen investigations, bringing the adventure to fifteen missions and forty-five repair stations. Professor Newtonia and Pip follow the faulty temperature readings into Nova’s cooling district. The player restores an emergency delivery rail, tests thermal bridges, repairs the watchtowers, insulates deliveries and completes the central cooling relay.

## Mission scope

| Mission | Selected Grade 7 topic | Investigation |
| --- | --- | --- |
| 11. The energy courier | Potential/kinetic energy, conservation and energy transferred to surroundings | Follow a cart down a ramp; account for potential, kinetic and dissipated energy with a 100-unit model ledger. |
| 12. The heat-exchange workshop | Heating, temperature and conduction | Compare equal copper, steel and wooden bridges between a hot source and a cooler probe. |
| 13. The thermal watchtowers | Convection and radiation | Compare bottom/top heating in water models, then test absorption by dark and shiny surfaces. |
| 14. The insulated route | Insulation and energy saving | Compare hot deliveries, cold instrument boxes and summer shelter temperatures under different wraps. |
| 15. The cooling-district rescue | Combined heat-transfer investigation | Protect a handle, reflect unwanted radiant energy and insulate a cold instrument case. |

The content follows selected Energy and Change topics in [DBE’s 2026 Grade 7 Natural Sciences ATP](https://www.education.gov.za/LinkClick.aspx?fileticket=KWvhuNEW3-4%3D&mid=10747&portalid=0&tabid=3208) and [CAPS Natural Sciences Grades 7–9](https://www.education.gov.za/LinkClick.aspx?fileticket=zhaFloMyZTs%3D&mid=1629&portalid=0&tabid=573). It covers conservation, potential/kinetic energy, conduction/convection/radiation, insulation and useful energy versus transfers to surroundings. It is not a claim to cover the entire Grade 7 Natural Sciences syllabus. Joules are introduced as the energy unit; formal energy-equation calculations are not required. The previous falling-water enrichment labels are preserved.

## Learning and gameplay

Every new station requires observations at two different settings before a correct explanation can apply a repair. Mistakes remain recoverable, and the two-stage hints remain available. Temperature investigations add a solid current-result line, a dashed comparison line and a matching accessible data table with six time points. Readings are recorded by running the experiment; selecting untested equipment does not invent a recorded measurement table.

The energy ledger accounts for all 100 model units, including energy transferred to the surroundings on the rough track. The ideal first two ramp models explicitly ignore resistance. Conduction uses the same source, probe, bridge dimensions and observation time. Convection distinguishes a whole-tank current from stable upper-layer heating. Radiation comparisons retain the same source, area and exposure. Insulation slows both heating and cooling and cannot move an object beyond the surroundings temperature.

The numerical data illustrate relationships; they are not laboratory measurements or instructions for a real heating apparatus. Temperature curves are internal teaching models, not equations assessed at this grade. Time is simulated, so the learner does not wait ten real minutes for each trial.

New routes are 4,400 logical units long, with three optional inspection platforms and four recoverable drone patrols. Earlier routes retain their lengths and station positions. Repaired equipment displays the selected bridge material, heater arrangement and collector finish. Hot and cold containers have distinct visual indicators. The workshop now accommodates fifteen mission photographs.

Five additional original synthesized music arrangements bring the total to fifteen. Thermal-test and fluid-flow effects retain the separate music/effects settings and the existing unavailable-audio fallback. Reduced-motion support applies to new decorative effects.

## Saves and compatibility

The adventure keeps `wga_physics_adventure_v1`, save format version 1, sequential unlocks, earlier collection records, settings, checkpoints and field-notebook entries. Completed chapter-two saves continue into mission eleven. An unfinished replay keeps its own checkpoint. New material choices, hints, comparisons and notebook observations survive refresh and retries. Temperature series are reproducible from the saved equipment choices rather than adding large measurement arrays to the save.

The first ten mission definitions remain data-equivalent to v4.1. The twelve original labs, their runtime/styles/entry, all source artwork, legacy best-score key and the shared score/fullscreen bridge are unchanged. Older cached entry pages that have not loaded the new content module can still run their original ten missions.

No other game runtime, platform editorial page, thumbnail or Cloudflare configuration is changed. The final game-page/story rewrite remains deferred until the Grade 10 route is complete.

## Exact file list

Added:

- `apps/web/public/games/physics-force-lab/adventure-grade7.js`
- `apps/web/public/games/physics-force-lab/adventure-heat-ui.js`
- `apps/web/scripts/physics-grade7.test.cjs`
- `docs/releases/physics-force-lab-v4.2.md`

Modified:

- `apps/web/public/games/physics-force-lab/adventure-data.js`
- `apps/web/public/games/physics-force-lab/adventure-audio.js`
- `apps/web/public/games/physics-force-lab/adventure.js`
- `apps/web/public/games/physics-force-lab/adventure.css`
- `apps/web/public/games/physics-force-lab/index.html`
- `apps/web/public/games/physics-force-lab/game.json`
- `apps/web/scripts/physics-adventure.test.cjs`
- `apps/web/scripts/physics-browser.cjs`
- `.github/workflows/physics-force-lab.yml`

## Validation

- Thirty Physics tests cover all forty-five achievable repair targets, earlier mission preservation, fifteen distinct music phrases, Grade 7 energy accounting, heat-transfer ordering, two-way insulation, finite diagrams, save migration, comparisons, hints, notebook persistence and the existing wire/route checks.
- Thirteen shared score/fullscreen checks and twenty-five game-page/Sky Temple launch checks passed: 68 automated checks in total.
- A touch-enabled browser completed missions 11–15 through actual movement and equipment controls, starting from a completed-v4.1 fixture. The run included an incorrect explanation, two-stage hints, refresh during an insulation investigation, restored data tables, all forty-five notebook entries, notebook retention after a retry and preservation of the original best-score key.
- Nine layouts passed: 320×568, 360×740, 375×667, 390×844, 568×320, 844×390, 768×1024, 1024×768 and 1440×900. Checks cover concurrent movement/jump touches, reachable controls, state-preserving rotation, settings/fullscreen, scrollable experiments and unavailable storage/audio. The new temperature table was separately exercised at all nine sizes, including access to its last row.
- The original twelve-lab campaign starts successfully. Passing browser runs reported no uncaught JavaScript errors. The temperature graph/table was visually inspected on the phone layout.
- Next.js production build, JavaScript syntax, HTML IDs, JSON, CSS parsing and local asset references passed.

Run `node --test apps/web/scripts/physics-*.test.cjs`. CI now runs both Physics test files. The browser suite supports `PHYSICS_CHAPTER=3` for the Grade 7 migration/playthrough and `PHYSICS_SMOKE=1` for the shorter layout/fallback run; without either option it covers the complete adventure. Set `PLAYWRIGHT_PATH` and `CHROME_BIN` for an external Playwright/Chromium installation. Tests use a local static server and isolated browser storage.

Merge the validated increment into `main`; Cloudflare deployment remains with the owner. Continue with Grades 8–9 investigations, then Grade 10 physics and cumulative QA before rewriting the final public game details.
