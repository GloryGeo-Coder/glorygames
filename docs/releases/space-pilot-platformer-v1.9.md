# Space Pilot Platformer v1.9 — Verdantis: Living Planet

Verdantis adds campaign missions 21–25. Complete Cryon to unlock the chapter from its mission screen. Nova, Mira and ORBIT meet the pathfinder Luma, restore the living forest, rescue the people protecting the expedition and free the star core from the Brood Titan. Five original animated environments and five original forest/electronic music arrangements extend the established chapter art and audio systems.

## Missions and rules

- **The Forest That Remembers:** restore three root nodes. Each permanently calms a group of spore vents.
- **An Answer in the Leaves:** hold Fire during each resonator's blue listening interval. Leaving, releasing input or crossing into its next call clears the partial signal.
- **A Promise Beneath the Leaves:** clear sentries within 200 units of each of four shelters, then release the pathfinders. Completed shelters render one allied group and calm their vents.
- **Seeds Across the Rift:** collect a numbered seed and carry it to its matching planter before taking another. Cargo is derived from saved source/planter flags, so refresh cannot lose it or duplicate it. Each planted seed permanently grows one optional upper bridge; the lower route remains available.
- **The Heart That Will Not Fall:** sever all three extraction pods, then shoot the Brood Titan's exposed heart between volleys. It braces during the last half-second before firing; amber warns before bracing. Its faster second phase retains the existing readable laser fan.

Routes grow from 5,600 to 8,200 world units, with 16–28 ordinary enemies plus the final Titan. Moth-like skimmers, thorn prowlers and rooted bloom sentries all fire lasers. Every required core and objective sits on a stable lower platform; spare cores and upper vine lifts/bridges reward exploration. Spore vents rest until 3.2 seconds, warn in amber until 4 seconds, then release harmful spores until their six-second cycle resets. Completed matching objectives suppress the entire vent group. Reduced motion freezes decorative motion while live warnings and danger labels remain accurate.

## Saves, controls and audio

`wga_space_pilot_verdantis_v1` stores this chapter separately. Initial settings inherit Cryon. Saved objectives, pickups and enemy/Titan damage use the existing checkpoint schema; cargo, bridges, allies and vent suppression reconstruct from those flags. Once legitimate Verdantis progress exists, restarting Cryon cannot relock it. Cross-page unlocking requires browser storage and explains that requirement when storage is blocked.

The shared engine adds only chapter selection, navigation and artwork-loading selection. Earlier chapter data, sprites, music, physics, scoring values and save keys remain unchanged. Simultaneous touch, adjustable/swapped buttons, double jump, shield dash, aim assistance, pause, fullscreen and checkpoint retries remain available. Five music scores and seven effects use the existing independent volume controls. The same composer supports real offline waveform checks without external recordings or dependencies.

## Release-record cleanup

Vulcanis, Luminara and Cryon's notes now record their actual merged PRs, commits and verified CI rather than outstanding review steps. Their closed PR descriptions were also finalised using exact-head checks. Cryon's static initial HUD count is corrected to 16/20. The manifest is version 1.9.0 and explicitly reports 25 campaign missions across five worlds, plus the preserved eight-mission original route. The main Asterion entry still contains five missions, recorded separately as `features.levels`.

The exact approved storyline in the roadmap is unchanged. The public game-page editorial remains reserved for completion of NOVA-X and final campaign QA, as requested. No dependency, database, thumbnail, earlier artwork or Cloudflare configuration changes are included.

## Verification and reproduction

- 77 chapter/progress/geometry/art checks, 16 shared score/fullscreen checks and 25 rendered game-page/Sky Temple checks: 118 automated checks.
- The established workflow retains every earlier chapter's browser suite. Verdantis adds 13 viewport sizes, touch/cancellation, carried settings, paused rotation, readable blocked-action hints, five complete lower-route physics fixtures, objective/core gates, seed-cargo reload, spore damage timing, shielded/open Titan projectile exchanges, story progression and storage/audio/art fallbacks.
- Five real OfflineAudioContext renders check finite, audible, distinct waveforms below clipping. The production build and actual standalone-entry suite include Verdantis without fixture hooks.
- Screenshot artifacts cover all five environments and the Titan on portrait phone, landscape phone and desktop, plus home, briefings, blocked hints and completion. Browser cases are controlled fixtures, not full real-time combat playthroughs or physical-device certification.
- Local managed preview could not start because its runtime was missing a dependency. Browser and visual verification use the GitHub workflow and its `verdantis-browser-screenshots` artifact; no alternate local browser was used.

Run `node --test apps/web/scripts/space-pilot-*.test.cjs` for chapter checks. The workflow installs its isolated browser tools, runs the existing and new browser scripts, builds Next.js and runs the built-entry checks. Release PR checks must all pass before merge.

## Installation and next chapter

Pull merged `main`, then use the existing OpenNext/Cloudflare build and deployment process. No migration, dependency update or ZIP is required. Cloudflare deployment remains with the owner. Next: NOVA-X — Rift Citadel, missions 26–30, followed by complete campaign QA and the approved final information-page update.

## Exact files

Modified (11):

- `.github/workflows/space-pilot-foundation.yml`
- `apps/web/public/games/_shared/game-tab.mjs`
- `apps/web/public/games/space-pilot-platformer/cryon.html`
- `apps/web/public/games/space-pilot-platformer/game.js`
- `apps/web/public/games/space-pilot-platformer/game.json`
- `apps/web/scripts/game-tab-ui.test.mjs`
- `apps/web/scripts/space-pilot-built-browser.cjs`
- `docs/releases/space-pilot-platformer-v1.6.md`
- `docs/releases/space-pilot-platformer-v1.7.md`
- `docs/releases/space-pilot-platformer-v1.8.md`
- `docs/space-pilot-starfall-rift-roadmap.md`

Added (7):

- `apps/web/public/games/space-pilot-platformer/verdantis-art.js`
- `apps/web/public/games/space-pilot-platformer/verdantis-audio.js`
- `apps/web/public/games/space-pilot-platformer/verdantis.html`
- `apps/web/public/games/space-pilot-platformer/verdantis.js`
- `apps/web/scripts/space-pilot-verdantis-browser.cjs`
- `apps/web/scripts/space-pilot-verdantis.test.cjs`
- `docs/releases/space-pilot-platformer-v1.9.md`
