# Science Lab Dash v3.0 — Grade 4 Chemistry Adventure

The root game now opens a complete five-mission adventure through Nova Science Academy's materials wing. Players investigate mixed-up sample records, restore the cold room, test material properties, strengthen structures and correct the Element Archive. Fifteen untimed activities use a predict–compare–explain–apply sequence with equipment choices, labelled diagrams, recorded trials, progressive hints and a saved field notebook. Mission completion unlocks the next chapter location. Optional archive fragments and recoverable scanner encounters provide movement challenges without turning learning mistakes into life losses.

The original twenty-mission science dash remains accessible at `original-dash.html`. Its lesson definitions, expanded question banks, mission tuning and save keys remain unchanged. Its audio initialization now handles unavailable Web Audio, its responsive controls/fullscreen are reachable and explicit Adventure links make mode switching clear. The shared game-tab bootstrap recognizes this additional entry; all existing routes and Sky Temple's launch contract remain unchanged.

## Mobile and persistence

The Adventure layout supports portrait and landscape, safe-area padding, large touch targets, simultaneous movement/jump, pointer cancellation and scrollable native experiment dialogs. Fullscreen is user activated, synchronized across footer/menus and optional when unsupported. Rotation and menu use preserve world state. Background and character fallback rendering allows play if new art cannot load. Paused menus avoid continuous canvas painting once assets/layout settle.

The new save key is `wga_science_chemistry_v1`. It retains position, current investigation, equipment setting, prediction, shuffled choice order, recent trials, hints, reflection, discoveries, notebook records, fragments and sound/motion settings. Original keys `wga_science_lab_dash_2_save` and `wga_science_lab_dash_2_best` are not migrated or overwritten. Mission replays keep permanent discoveries and cannot farm completion points.

## Artwork and audio

The approved existing thumbnail supplies character identities. The built-in image-generation tool produced twelve scientist poses plus four each for Professor Nova, the analysis drone and patrol scanner. The twenty-four drawn poses are packed into one 640 × 1152 RGBA atlas (`assets/chemistry/characters.png`, 683,267 bytes). Three new text-free illustrated environments fill the canvas with cover cropping: `storeroom.webp`, `workshop.webp`, `archive.webp`. The game requests locations on demand. Original backgrounds and thumbnail are unchanged.

Final art paths are under `apps/web/public/games/science-lab-dash/assets/chemistry/`. Source sheets, built-in prompts and repacking instructions are in [`tools/science-character-source/`](../../tools/science-character-source/README.md), including [`prompts.json`](../../tools/science-character-source/prompts.json). The `chemistry-art-data.js` metadata records source hashes. Sharp only extracts, packs/scales and encodes artwork; scientific diagrams use exact SVG geometry.

Five original Web Audio arrangements provide distinct mission melodies, bass and percussion with separate music/effects volume controls. Interaction sounds include water, cooling, paper/structure tests, scanning, footsteps, collection, contact and restoration. Audio is unlocked through user input and stops on pause or tab interruption. No sound is required to understand an investigation.

## Curriculum and roadmap

[The curriculum mapping](science-lab-dash-v3.0-curriculum.md) identifies the selected Grade 4 topics and model assumptions. Only Grade 4 is currently available in Adventure. Grades 5–10, revision activities, further arcade graphics and final website editorial updates remain subsequent increments. The existing broader science dash still has twenty missions; the manifest's total of twenty-five counts both modes.

## Validation

Sixteen Science Node tests cover reachability, material/state rules, water representation, two-setting evidence, save sanitization/recovery, stable choice order, mission locks, anti-farming, atlas transparency/padding/source hashes, animation state selection, five music arrangements and unchanged original lesson data. Shared score/fullscreen and rendered game-page regressions provide another thirty-nine checks.

The browser suite plays all five missions and all fifteen investigations through real controls on a phone viewport, including a refresh during an active experiment and notebook recovery after a replay. It checks thirteen Adventure sizes (320×568 through 1440×900, including 568×280), touch cancellation, fullscreen, rotation, emulated safe areas, experiment scrolling and unavailable/denied fullscreen. It loads all twenty original level fixtures and checks six original layouts. Additional cases block storage, audio, character art, metadata and new backgrounds. Screenshots of actual phone/desktop gameplay and investigations were visually inspected. JavaScript/JSON references and the Next.js 16 production build are validated. Chromium emulation is not a physical-device Safari certification, and level fixtures are not full original-campaign playthroughs.

## Installation

Pull main after the feature PR merges and use the existing Cloudflare/OpenNext build setup. No database migration, new dependency or ZIP is required. Cloudflare deployment remains with the owner. The next development increment is the Grade 5 materials learning path.

## Exact files

Modified:

- `apps/web/public/games/_shared/game-tab.mjs`
- `apps/web/public/games/science-lab-dash/game.js`
- `apps/web/public/games/science-lab-dash/game.json`
- `apps/web/public/games/science-lab-dash/index.html`
- `apps/web/scripts/game-tab-ui.test.mjs`

Added:

- `.github/workflows/science-chemistry.yml`
- `apps/web/public/games/science-lab-dash/assets/chemistry/archive.webp`
- `apps/web/public/games/science-lab-dash/assets/chemistry/characters.png`
- `apps/web/public/games/science-lab-dash/assets/chemistry/storeroom.webp`
- `apps/web/public/games/science-lab-dash/assets/chemistry/workshop.webp`
- `apps/web/public/games/science-lab-dash/chemistry-art-data.js`
- `apps/web/public/games/science-lab-dash/chemistry-art.js`
- `apps/web/public/games/science-lab-dash/chemistry-audio.js`
- `apps/web/public/games/science-lab-dash/chemistry-data.js`
- `apps/web/public/games/science-lab-dash/chemistry-display.js`
- `apps/web/public/games/science-lab-dash/chemistry-game.js`
- `apps/web/public/games/science-lab-dash/chemistry-visuals.js`
- `apps/web/public/games/science-lab-dash/chemistry.css`
- `apps/web/public/games/science-lab-dash/legacy-mobile.css`
- `apps/web/public/games/science-lab-dash/original-dash.html`
- `apps/web/scripts/science-chemistry-browser.cjs`
- `apps/web/scripts/science-chemistry.test.cjs`
- `docs/releases/science-lab-dash-v3.0-curriculum.md`
- `docs/releases/science-lab-dash-v3.0.md`
- `tools/build-science-characters.cjs`
- `tools/science-character-source/README.md`
- `tools/science-character-source/hero.webp`
- `tools/science-character-source/prompts.json`
- `tools/science-character-source/support.webp`
