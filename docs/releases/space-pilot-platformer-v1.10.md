# Space Pilot Platformer v1.10 — NOVA-X: Rift Citadel

NOVA-X adds missions 26–30 and the playable story finale. Complete Verdantis to unlock `novax.html` from its mission screen. Nova enters the fractured Citadel, evacuates the expedition, restores reactor safety circuits, reconnects the five rescued worlds and faces the NOVA-X Commander. Five original animated environments, five original music arrangements and seven effects extend the established art/audio system.

## Missions

- **Where Worlds Collide:** override three access locks west to east. Completed locks permanently stabilise their optional dimensional ledges and silence their emitter group. Unsecured ledges warn before disappearing; the stable lower route remains available.
- **No One Left in the Rift:** clear sentries within 200 units of each of four shuttle piers, then release its boarding clamps. All four groups must evacuate before the route opens.
- **The Engine of Stolen Stars:** carry one numbered relay fuse to its matching socket. Install during the blue cooling interval, completing the pair before collecting another fuse. Saved objective flags reconstruct carried fuses and installed relays after refresh.
- **Five Roads Home:** stabilise Asterion, Vulcanis, Luminara, Cryon and Verdantis tethers in route order during their blue signal intervals.
- **The Last Gate:** cut three Aegis feeds, defeat the Commander during exposed blue core windows, seal three gate controls, activate the Wayfarer beacon, then enter the home portal. Boss defeat alone does not finish the mission.

Routes grow from 5,800 to 8,800 world units with 20–32 ordinary sentries plus the final Commander. Required cores and devices sit on stable lower platforms. Optional lifts and phased ledges add alternate firing positions and spare cores. Rift emitters rest until three seconds, warn until 3.8 seconds, then pulse until their six-second cycle resets. Completed controls suppress their group. All emitters stop after the Commander falls so the escape phase stays recoverable.

The Commander's shield depends on the three Aegis feeds, independently of later escape objectives. After those feeds are cut, its normal seven-second armour cycle exposes the core for 3.5 seconds, with a 0.7-second closing warning. Below half health, the cycle becomes 5.5 seconds with a 2.6-second open window; the existing faster five-laser fan remains active. The final report follows only after the seals, launch beacon, core quota and home portal are complete.

## Continuity and controls

`wga_space_pilot_novax_v1` stores the chapter separately; initial settings inherit Verdantis. Existing snapshot fields preserve relay cargo, core/pickup flags, enemy/Commander health and escape objectives without a save migration. Refresh after the boss fight retains the defeat and completed seals. Once legitimate NOVA-X progress exists, restarting Verdantis cannot relock it. The original eight missions and five earlier chapter namespaces/content remain intact.

The shared engine adds chapter selection/navigation and an optional victory title; earlier chapters retain their established outcome text. Simultaneous touch, adjustable/swapped buttons, pause, fullscreen, aim assistance, shield dash, double jump and checkpoint penalties are preserved. Decorative motion can be reduced while live warning states remain accurate. The explicit new entry mounts the existing game score bridge.

Artwork is canvas-native in `novax-art.js`, retaining Nova's existing transparent atlas, collectibles and portal artwork. The five scenes show the fractured approach, convoy dock, reactor, five-world array and Rift Engine heart. New armoured drones, crawler rigs, sentry cannons and the Commander have movement/attack animations. `novax-audio.js` contains original Citadel/convoy/reactor/world-tether/finale arrangements at 100, 108, 116, 92 and 136 BPM, plus separately enveloped effects. No external recordings or new dependencies are required.

## Release validation

- 97 chapter/progress/geometry/art checks, 17 shared score/fullscreen checks and 25 rendered game-page/Sky Temple checks: 139 automated checks.
- The existing workflow retains earlier chapter browser regressions and adds NOVA-X: 13 viewport sizes, simultaneous touch/cancel, inherited settings, readable blocked-action hints, five complete lower-route physics fixtures, order/timing rules, fuse reload, Commander shield/projectile exchanges, post-boss save recovery and the staged homeward finale.
- Five real offline audio renders check finite, audible, distinct waveforms below clipping. The production build and actual-entry suite include NOVA-X without fixture hooks.
- Screenshot artifacts wait for HUD layout and canvas repaint, and assert a painted frame before capture. They cover all five environments, phone portrait/landscape and desktop, plus the menu, briefings, blocked hints and escape states. Controlled fixtures are not full real-time campaign playthroughs or physical-device certification.
- CI browser setup uses installed Chrome when available and falls back to Playwright Chromium, with a four-minute setup bound to prevent stalled downloads.
- Local managed preview was unavailable in this workspace. Browser/visual validation uses the GitHub workflow and its `novax-browser-screenshots` artifact; no alternate local browser was used.

## Scope and next phase

This completes implementation of the six chapter routes and 30 missions. **Final whole-campaign QA is a separate next phase**, as requested. The exact approved storyline and final public game-page editorial remain deferred until that phase. No earlier artwork, thumbnail, dependency, database, Cloudflare configuration or public editorial change is included here.

Pull merged `main`, then use the existing OpenNext/Cloudflare build/deployment process when ready. No migration or ZIP is required. Cloudflare deployment remains with the owner.

## Exact files

Modified (9):

- `.github/workflows/space-pilot-foundation.yml`
- `apps/web/public/games/_shared/game-tab.mjs`
- `apps/web/public/games/space-pilot-platformer/game.js`
- `apps/web/public/games/space-pilot-platformer/game.json`
- `apps/web/public/games/space-pilot-platformer/verdantis.html`
- `apps/web/scripts/game-tab-ui.test.mjs`
- `apps/web/scripts/space-pilot-built-browser.cjs`
- `apps/web/scripts/space-pilot-verdantis.test.cjs`
- `docs/space-pilot-starfall-rift-roadmap.md`

Added (7):

- `apps/web/public/games/space-pilot-platformer/novax-art.js`
- `apps/web/public/games/space-pilot-platformer/novax-audio.js`
- `apps/web/public/games/space-pilot-platformer/novax.html`
- `apps/web/public/games/space-pilot-platformer/novax.js`
- `apps/web/scripts/space-pilot-novax-browser.cjs`
- `apps/web/scripts/space-pilot-novax.test.cjs`
- `docs/releases/space-pilot-platformer-v1.10.md`
