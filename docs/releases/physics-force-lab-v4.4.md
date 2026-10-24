# Physics Force Lab v4.4 — Grade 9: Forces & Power

Chapter five adds five missions and fifteen repair investigations. The adventure now has twenty-five missions and seventy-five repair stations, alongside the twelve preserved original labs. The team follows the isolated mechanical drive’s overload into Nova’s force laboratory, resistance works and protected supply system.

## Mission scope

| Mission | Selected Grade 9 topics | Investigation |
| --- | --- | --- |
| 21. The stalled drive yard | Contact forces and horizontal resultants | Balance opposing cable tensions, start a cart moving and apply a resultant opposite its initial motion. |
| 22. The field laboratory | Mass, weight, gravity and magnetic fields | Compare locations at fixed mass, change mass at fixed gravity, and compare magnetic poles across a gap. |
| 23. The resistance works | Length, thickness and temperature | Compare wire resistance/current while changing one property at a time. |
| 24. The cell vault | Cells and series resistor potential differences | Add aligned series cells, compare a matched parallel pair, and account for both resistor voltage drops. |
| 25. The protected restart route | Material resistance, supply systems, energy and cost | Choose a control link, order the supply stages and provide useful lighting within an energy budget. |

Content follows selected Energy and Change topics in [DBE’s 2026 Grade 9 Natural Sciences ATP](https://www.education.gov.za/LinkClick.aspx?fileticket=ny2xd3oxr_I%3D&mid=10751&portalid=0&tabid=3208), pages 7–9. The chapter covers force types, mass/weight, resistance factors, cell arrangements, circuit readings, generation/transmission/distribution and power/energy/cost distinctions. It does not claim the full Natural Sciences syllabus, every electricity-safety topic or a complete account of South African generation. Existing Grade 8 charge and branch investigations remain available for revision.

## Models and learning

Each station requires a prediction, observations at two distinct settings, a successful configuration and a correct explanation. Errors remain recoverable. Two-stage hints, untimed experiments, checkpoint retries and notebook findings continue to work.

New scalable diagrams show opposing force arrows, force-meter readings, facing magnetic poles, sample dimensions, cell paths, resistor voltage drops and an energy-budget bar. Written observations carry the same evidence. Contact force reactions are explicitly distinguished from opposing forces on the same object. Zero resultant means unchanged velocity, not necessarily rest; a resultant opposite motion initially slows a moving cart.

Mass remains in kilograms and weight in newtons. Gravity settings use approximate Earth/Moon/Mars field strengths. Wire models change length, area, temperature or material separately at a fixed 3 V source; sample resistances and temperature coefficients are illustrative, not measured constants. Ideal cell models omit internal resistance. Matched parallel cells retain one cell’s voltage, and series resistor drops add to the source voltage while current remains the same through both resistors.

The supply-route puzzle has three reorderable stages with Earlier/Later buttons, accessible names, focus retention and 44 px minimum controls. Its six permutations save as distinct valid settings. The route represents generation, high-voltage transmission and local transformation/distribution before consumers. It is a system diagram, not a practical mains-wiring activity.

Lighting comparisons hold useful lighting and five-hour duration constant across lit options. Energy is measured in kWh, calculated from kW × hours; the example bill multiplies energy by an explicitly illustrative R3.00/kWh lesson price. Switching off uses no energy but fails the required lighting service. Prices are not presented as current tariffs.

The new chapter reuses the established 4,400-unit routes, platforms, recoverable patrol drones and source backgrounds. New code-drawn apparatus, five original synthesized music arrangements and force/power effects extend the existing presentation. Music/effects volumes, sound-off evidence, reduced motion and fullscreen behavior remain intact. The workshop wall automatically accommodates twenty-five photographs.

## Compatibility and scope

All twenty earlier mission definitions remain data-equivalent to v4.3. The adventure retains its save key and version, sequential unlocks, earlier checkpoints, reward records, settings and notebook entries. A completed Grade 8 save advances into mission twenty-one; unfinished replays keep their own checkpoints. Route order, tested settings and hints survive refresh; recorded discoveries survive retries.

Cached Grade 8 entries still run their twenty missions without optional Grade 9 modules. If the new visual module cannot load, written observations keep repairs playable. Original twelve-lab files, legacy best-score key, source PNG assets, shared score/fullscreen bridge, other games, platform editorial pages and Cloudflare configuration are untouched. The final public game-page rewrite remains deferred until Grade 10 is complete.

## Exact files

Added:

- `apps/web/public/games/physics-force-lab/adventure-grade9.js`
- `apps/web/public/games/physics-force-lab/adventure-power-ui.js`
- `apps/web/scripts/physics-grade9.test.cjs`
- `docs/releases/physics-force-lab-v4.4.md`

Modified:

- `apps/web/public/games/physics-force-lab/adventure-data.js`
- `apps/web/public/games/physics-force-lab/adventure-audio.js`
- `apps/web/public/games/physics-force-lab/adventure.js`
- `apps/web/public/games/physics-force-lab/adventure.css`
- `apps/web/public/games/physics-force-lab/index.html`
- `apps/web/public/games/physics-force-lab/game.json`
- `apps/web/scripts/physics-adventure.test.cjs`
- `apps/web/scripts/physics-grade8.test.cjs`
- `apps/web/scripts/physics-browser.cjs`

## Validation

- Fifty-two Physics checks exercise all seventy-five repair targets, scientific relationships, earlier-data preservation, twenty-five distinct music phrases, comparison requirements, unlocks, migration, saved trial/hint evidence and notebook retention.
- Thirteen shared score/fullscreen checks and twenty-five game-page/Sky Temple launch checks pass: 90 automated checks total.
- A touch-enabled browser plays missions 21–25 through real movement and controls from a completed-Grade-8 save fixture. It checks the reorder puzzle, an incorrect explanation, two hints, refresh recovery, all seventy-five notebook entries, retry retention and preservation of the original best-score key.
- Nine viewport sizes cover phone portrait/landscape, tablet and desktop: 320×568, 360×740, 375×667, 390×844, 568×320, 844×390, 768×1024, 1024×768 and 1440×900. Checks include concurrent touch movement/jump, reachable controls, position-preserving rotation, experiment scrolling, audio/fullscreen settings and blocked storage/audio. Each new mission’s first diagram and the supply reorder controls are also checked across those layouts.
- Earlier lesson/model regressions, shared game-page behavior and original-lab browser startup pass. Passing browser runs report no uncaught JavaScript errors. New phone diagrams and reorder controls are visually inspected.
- Next.js production build, JavaScript syntax, HTML IDs, asset references, JSON, CSS parsing and diff whitespace checks pass.

Run `node --test apps/web/scripts/physics-*.test.cjs`. For browser checks, set `PLAYWRIGHT_PATH` and `CHROME_BIN` and run `PHYSICS_CHAPTER=5 node apps/web/scripts/physics-browser.cjs`; omitting the chapter runs the whole campaign. Optional `PHYSICS_SCREENSHOTS` stores local QA screenshots. Existing CI automatically discovers the Grade 9 test file.

Merge the validated feature branch into `main`. Deploy that branch’s merged files through the existing Cloudflare setup when ready; no ZIP or publication staging file is needed. Cloudflare deployment remains with the owner. Grade 10 and final campaign QA come next, followed by the requested public game details/story rewrite.
