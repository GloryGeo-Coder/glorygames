# Physics Force Lab v4.5 — Grade 10 and Original-Lab Polish

The sixth chapter completes Nova’s recovery story with five Grade 10 missions and fifteen investigations. The adventure now contains thirty missions and ninety repair stations. This release also repairs the original twelve-lab campaign’s mobile layout and replaces its static actors with articulated scientists, robots, drones and GlitchBot. The public game description, story, controls, progression details and FAQs now describe both completed modes.

## Grade 10 chapter

| Mission | Selected Grade 10 physics | Investigations |
| --- | --- | --- |
| 26. The motion observatory | Vectors/scalars and one-dimensional motion | Distance versus displacement; position–time slope; horizontal acceleration and velocity–time area. |
| 27. The counterweight chamber | Mechanical energy | Ideal conservation of kinetic plus potential energy; speed-squared kinetic energy; raised-load potential energy. |
| 28. The timing-wave tunnel | Pulses, transverse waves and sound | Signed pulse superposition; wavelength/frequency/period; longitudinal sound and its medium. |
| 29. The charge records | Electrostatics and circuits | Charge sharing between identical isolated spheres; current as charge per time; equivalent series/parallel resistance. |
| 30. The Quantum Core restart | Combined physics | Controlled horizontal stopping; energy transferred per charge; electromagnetic signals in an evacuated link. |

The selected content follows [CAPS Physical Sciences Grades 10–12](https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20%20PHYSICAL%20SCIENCE%20WEB.pdf) and [DBE’s Grade 10 Physical Sciences ATP, labelled 2024](https://www.education.gov.za/LinkClick.aspx?fileticket=mQ_5vFi9Voc%3D&mid=10736&portalid=0&tabid=3205), still linked from DBE’s public FET ATP page when checked for this release. The source is identified by its actual year; this release does not present it as a 2026 document. It covers selected physics topics, not Chemistry or the complete Physical Sciences syllabus. Newton’s laws, Coulomb-force calculations and a formal Ohm’s-law investigation are not represented as newly assessed Grade 10 content.

Every new repair requires a prediction, tests at two distinct settings, a successful result and an evidence explanation. Graphs include signed axes, a current line and a dashed comparison when prior evidence exists. Matching five-row motion tables are only recorded after testing. Graphs and notebook observations reproduce from saved trial settings. Numerical models state their ideal assumptions: horizontal kinematics, omitted resistance in mechanical-energy conservation, fixed wave-medium speeds, isolated identical conducting spheres and ideal circuit sources. Wave periods retain enough decimal places for the sound examples.

The final mission ends with a working Quantum Core and the Junior Physics Guardian story award. Completed investigations remain available through the mission map and field notebook. Thirty mission photographs fit the growing workshop wall. Five more original synthesized arrangements bring Adventure music to thirty themes; the original campaign keeps its twelve existing themes.

## Original-lab mobile and graphics fixes

The HUD, mission strip, playfield and touch controls now occupy separate layout rows. The canvas no longer sits underneath the HUD. The logical world keeps its original 720-unit height while display scaling and a vertical camera adapt to the available play area. Rotation changes the view rather than moving platforms or collectibles relative to the player. The camera keeps the nearby boss and health bar visible on short landscape screens.

Native scrollable dialogs keep menu and question actions reachable on phones and contain keyboard focus. Touch movement uses pointer capture and independent input sources, so holding movement while jumping does not lose the movement input. Pause, blur and backgrounding clear held inputs. Keyboard pause/resume remains available. Questions cannot be dismissed to bypass their answer gate. Original platform landing uses the actual previous position, and moving-platform carry uses elapsed time rather than a fixed per-frame offset.

The scientist has separate legs, arms, coat, goggles, jump and tool poses. Ground robots walk, drones have moving rotors and eyes, magnetic robots retain their distinguishing shape, and GlitchBot has articulated arms and a rotating core. Newtonia and Pip appear near the starting workshop. Actors use sizes consistent with their collision bodies; platform edges and tread details improve readability. A reduced-decorative-motion option freezes ornamental animation without stopping gameplay. Original backgrounds and PNG source assets are unchanged.

The legacy best-score key is preserved. Blocked storage and unavailable audio no longer prevent the original game from starting or finishing a run. The Adventure save key, version, earlier checkpoints, collection records, settings and notebook entries remain intact. The original action mode still records a best score rather than adding a separate checkpoint campaign.

## Public game details

The Physics entry in `gameEditorials.ts` and `gameCatalog.ts` now describes thirty Adventure missions, ninety repairs and twelve original action labs. It includes the final Nova storyline, selected Grades 4–10 scope, controls for both modes, sequential unlocks, device-local saves, audio/accessibility options and teaching-model limits. The standalone thumbnail/Play Game launch, related games, scores and sidebar chat remain intact. Other games’ editorial content and runtimes are unchanged.

## Exact files

Added:

- `apps/web/public/games/physics-force-lab/adventure-grade10.js`
- `apps/web/public/games/physics-force-lab/adventure-final-ui.js`
- `apps/web/public/games/physics-force-lab/legacy-visuals.js`
- `apps/web/scripts/physics-grade10.test.cjs`
- `apps/web/scripts/physics-legacy.test.cjs`
- `apps/web/scripts/physics-legacy-browser.cjs`
- `apps/web/scripts/physics-editorial.test.cjs`
- `docs/releases/physics-force-lab-v4.5.md`

Modified:

- `apps/web/public/games/physics-force-lab/adventure-data.js`
- `apps/web/public/games/physics-force-lab/adventure-audio.js`
- `apps/web/public/games/physics-force-lab/adventure.js`
- `apps/web/public/games/physics-force-lab/index.html`
- `apps/web/public/games/physics-force-lab/game.json`
- `apps/web/public/games/physics-force-lab/original-labs.html`
- `apps/web/public/games/physics-force-lab/styles.css`
- `apps/web/public/games/physics-force-lab/game.js`
- `apps/web/scripts/physics-adventure.test.cjs`
- `apps/web/scripts/physics-grade9.test.cjs`
- `apps/web/scripts/physics-browser.cjs`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`

## Validation

- Seventy-one Physics checks cover all ninety repair targets, the final chapter’s equations/accounting, saved graph evidence, earlier mission preservation, thirty distinct Adventure music phrases, original level/question preservation, viewport scaling, articulated frames and public-details consistency.
- Thirteen shared score/fullscreen checks and twenty-five game-page/Sky Temple checks pass: 109 automated checks in total. GitHub also runs the existing Fruit Slice and Lost Jungle regressions because their workflow filters include the shared editorial file.
- Grade 10 is completed through actual movement and experiment controls from a completed-Grade-9 save fixture. Tests cover graph-table refresh recovery, all ninety notebook entries, retries, the final story ending and preservation of the old best-score key. The final cumulative Adventure run traverses all thirty missions, including earlier wire-board, platform, heat-table and supply-route checks.
- Both modes pass nine viewports: 320×568, 360×740, 375×667, 390×844, 568×320, 844×390, 768×1024, 1024×768 and 1440×900. Checks cover reachable controls, concurrent touch movement/jump, geometry-preserving rotation, scrolling menus/questions, motion tables, reduced motion, pause/resume and blocked storage/audio. All twelve original levels are built and checked in the small landscape layout, including the original boss. The level-building checks use isolated local QA fixtures rather than claiming a full manual action-campaign playthrough.
- The local original-lab browser harness instruments a closure boundary only in its own HTTP response to inspect state and seed level fixtures. No production test hook or unlocked-level shortcut is added to `game.js`.
- New phone diagrams, motion tables, original actors and the small-landscape boss view are visually inspected. Passing browser runs report no uncaught JavaScript errors. The first twenty-five Adventure mission definitions and original level/extra-question data are equivalent to the previous release.
- Next.js production build, JavaScript syntax, both HTML entries/IDs, asset references, JSON, CSS parsing and diff whitespace checks pass.

Run `node --test apps/web/scripts/physics-*.test.cjs`. With `PLAYWRIGHT_PATH` and `CHROME_BIN` set, run `node apps/web/scripts/physics-browser.cjs` for the whole Adventure or `PHYSICS_CHAPTER=6` for Grade 10. Run `node apps/web/scripts/physics-legacy-browser.cjs` for the original labs. Optional `PHYSICS_SCREENSHOTS` writes local QA images. Existing CI discovers the new Physics tests.

## Installation and deployment

The feature pull request merges the increment into `main`. Pull current `main` and use the existing Cloudflare/OpenNext build configuration when ready. No ZIP, publication staging files, database migration or Cloudflare configuration change is required. Cloudflare deployment remains with the owner; this release’s verification is against local builds and GitHub checks, not a claimed production deployment.
