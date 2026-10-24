# Physics Force Lab v4.0 — Academy adventure

The standalone entry now opens a mobile-first adventure set at Nova Physics Institute. A young physicist joins Professor Newtonia and Pip to restore a district after the Quantum Core shutdown. Five missions contain fifteen repair investigations. The existing twelve-lab campaign remains available from the opening menu; its runtime, art, controls and best-score key are unchanged.

## Shipped scope

| Mission | Selected grade topic | Player investigation |
| --- | --- | --- |
| The silent workshop | Grade 4: energy and movement | Transfer energy to a trolley; compare push settings with a fixed trolley and track. |
| A voice across the bridge | Grade 4: energy and sound | Change a vibrating ruler's free length; compare pitch through audible and visible signals. |
| The recovery convoy | Grade 5: systems for moving things | Compare locked, rubbing and freely turning wheel assemblies using the same starting energy. |
| The energy gardens | Grade 5: stored energy and movement | Compress and release a spring to deliver repair capsules. |
| Light the district | Grade 6: circuits, conductors and insulators | Test materials and switch states to complete a conducting circuit. |

Each investigation follows prediction, equipment adjustment, test, observation, explanation and application. Players can repeat tests and request hints without losing health. Optional data cells reward exploration. Maintenance drone contact slows the player without ending the mission. Repairs unlock gates and visibly activate equipment. Completed missions add photographs to the workshop.

The layout reserves separate space for the HUD, canvas and touch controls. Pointer capture and independent movement pointers support simultaneous movement and jumping. Logical world coordinates survive rotation. Native modal dialogs scroll on short screens and retain keyboard focus. Settings include separate music/effects volumes and reduced decorative motion. New articulated canvas sprites animate the scientist, professor, companion and drones; source PNGs remain unchanged.

Five original synthesized arrangements and effects require no remote audio downloads. Browser audio starts through player interaction, stops its music timer during dialogs/pause/backgrounding, and fails safely if Web Audio is unavailable.

## Curriculum boundary

This is selected Grades 4–6 Natural Sciences and Technology content, not a complete grade syllabus. Numerical simulations are simplified teaching models and are labelled as such. Formal Newton's second-law calculations are not assessed in the Grade 4 missions. Later increments will extend the learning route towards Grade 10 physics within Physical Sciences; they are not shipped in this release.

Source: Department of Basic Education, [CAPS Natural Sciences and Technology Grades 4–6](https://www.education.gov.za/LinkClick.aspx?fileticket=IzbFrpzoQ44%3D&tabid=572), especially the Energy and Change / Systems and Control sections on energy transfer, sound, wheels and axles, springs, electric circuits and conductors. The game is supplementary practice, not a claim to cover the chemistry component of Physical Sciences.

## Persistence and compatibility

Adventure progress uses `wga_physics_adventure_v1`. It saves the selected mission, position, solved stations, optional cells, equipment settings, predictions, recent trials, hints and audio settings. Sequential unlocks are validated on load. Refresh returns to the saved mission checkpoint; reopen a station to recover its equipment and trial history. Repeating a completed mission cannot multiply its completion reward. Blocked storage produces a visible notice and keeps the session playable.

The original `wga_physics_force_lab_v3_best` is neither migrated nor overwritten. `original-labs.html` loads the unchanged `game.js` and `styles.css`. Its explicit URL receives the shared score and fullscreen bridge, just like the main game. No other game launch routes change, and Sky Temple remains excluded from that bridge.

## Files

Added:

- `apps/web/public/games/physics-force-lab/adventure-data.js`
- `apps/web/public/games/physics-force-lab/adventure-audio.js`
- `apps/web/public/games/physics-force-lab/adventure.js`
- `apps/web/public/games/physics-force-lab/adventure.css`
- `apps/web/public/games/physics-force-lab/original-labs.html`
- `apps/web/scripts/physics-adventure.test.cjs`
- `apps/web/scripts/physics-browser.cjs`
- `.github/workflows/physics-force-lab.yml`
- `docs/releases/physics-force-lab-v4.0.md`

Modified:

- `apps/web/public/games/physics-force-lab/index.html`
- `apps/web/public/games/physics-force-lab/game.json`
- `apps/web/public/games/_shared/game-tab.mjs`
- `apps/web/scripts/game-tab-ui.test.mjs`

## Validation

- Ten Node tests cover all fifteen achievable repair targets, model relationships, fair-test content, sequential unlocks, corrupted/blocked storage, checkpoint round trips, shuffled answer identity, replay scores, asset references and distinct audio phrases/timer cleanup.
- Browser playthrough completed all five missions and fifteen repairs using actual keyboard and UI input on a 390×844 touch-enabled viewport, including a failed experiment, incorrect explanation, hint and mid-investigation refresh.
- Nine viewports: 320×568, 360×740, 375×667, 390×844, 568×320, 844×390, 768×1024, 1024×768 and 1440×900. Each checked concurrent movement/jump touch events, reachable controls, scrollable repair panels, non-overlapping playfield and state-preserving rotation.
- Browser checks covered unavailable local storage and Web Audio, and starting the original twelve-lab campaign with its fullscreen control. No uncaught JavaScript errors were observed.
- Shared score/fullscreen tests: 13 passed. Game-page/Sky Temple launch regressions: 25 passed. Existing Math Sprint regression suite: 84 passed.
- Next.js production build passed; HTML IDs, JSON, JavaScript syntax, CSS parsing and local asset references checked.

Reproduce the logic tests with `node --test apps/web/scripts/physics-adventure.test.cjs`. The browser suite is `apps/web/scripts/physics-browser.cjs`; set `PLAYWRIGHT_PATH` to an installed Playwright package and `CHROME_BIN` to its Chromium executable (or use an installed `playwright` package/browser). It starts its own static server and does not contact production. Optional `PHYSICS_SCREENSHOTS` writes QA images to a chosen directory.

## Deployment and next increments

Deploy the merged repository using the owner's existing Cloudflare build. No Cloudflare configuration change or deployment is part of this increment. No incremental ZIP or publication staging files are required.

Continue in separate, tested increments: deepen Grades 4–6 investigations and routes, add Grades 7–9 district adventures, then build Grade 10 physics investigations and cumulative revision. Only after the Grade 10 path is complete, update the platform game page and final game details with the complete storyline and actual shipped scope, as requested by the owner.
