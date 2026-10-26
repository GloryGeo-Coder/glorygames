# Space Pilot Platformer v1.5 — Asterion: Shattered Moon

The standalone game now opens The Starfall Rift's first five-mission chapter. Nova restores ORBIT, recovers Wayfarer drive assemblies, rescues three survivors, aligns the lunar relay and stops the Asteroid Warden's extraction. Briefings freeze gameplay, have a scrollable phone layout and can be reread from the pause menu. The chapter ends with Mira's signal from Vulcanis. The remaining worlds are scheduled in the roadmap; this release contains five new chapter missions.

Each mission has its own full-screen illustrated environment and original synthesised music. New transparent artwork animates Nova's run, jump, fall and firing states; drones, crawlers and the Warden use distinct frames and motion. Lunar platforms, asteroids, pickups, rescue capsules, the Wayfarer, mission devices and portals match the white-armour/cyan/magenta art direction. Directional laser trails and visible firing warnings support combat readability. Reduced motion, independent audio volumes, large/swapped touch controls and user-activated fullscreen carry over from v1.4.

The five lower routes grow from 4,400 to 7,000 world units, with 8–21 ordinary enemies plus the final Warden. Guaranteed lower platforms hold all required cores and mission devices. Upper platforms offer spare cores and alternate firing positions. Required interactions use a sustained nearby Fire hold (or E on a keyboard); a progress ring and HUD prompt show the action. Damage, shield dash, double jump, checkpoints, scoring and retries use the established engine. The Warden has a visible wind-up, a faster second phase and recoverable volley spacing.

## Progress and preservation

Asterion stores its five-mission progress separately under `wga_space_pilot_asterion_v1`. Completed rescues/repairs, collected items and enemy health recover with the safe checkpoint. Partial interaction charges reset on reload; completed interactions cannot award again. Mission gates require the objective, core quota and any boss defeat. Initial control/audio preferences migrate from an existing original-route save without replacing it.

The home screen links to `original-route.html`, retaining all eight original missions, their route/boss-definition preservation hash, assets, music, controls and `wga_space_pilot_campaign_v1` save. The shared game-tab bridge recognises that exact new entry for score reporting. No other title changes entry or behaviour. No dependency, database, Cloudflare configuration, thumbnail or final information-page editorial changes are included. The approved storyline remains verbatim in the roadmap for the final campaign-page update.

## Validation

- 57 Node/rendered-component checks pass: 17 chapter/progress/preservation checks, 15 shared score/fullscreen checks and 25 game-page/Sky Temple launch checks.
- Both routes pass browser checks across 13 sizes each, from 320×568 and 568×280 through tablet and 1440×900 desktop. Tests cover touch input, large/swapped controls, pause, rotation, fullscreen, recovery and capability fallbacks.
- Five complete lower-route traversal fixtures exercise actual player acceleration, gravity, jumps and platform collisions with combat isolated. Five chapter completion fixtures exercise sustained interactions, cores, portal gates, the Warden's laser exchange and story/unlock transitions. Eight original boss fixtures pass. These controlled fixtures are not thirteen full real-time combat playthroughs.
- The Next.js production build passes. Three built-site viewport checks exercise the information-page launch and both actual standalone entries without fixture hooks.
- All eight new WebP files decode; local references, JavaScript/JSON/CSS and diff checks pass. Chromium emulation is not physical-device Safari certification.

## Installation

Pull merged `main` and use the existing OpenNext/Cloudflare build/deployment process. No migration, dependency update or ZIP is required. Cloudflare deployment remains with the owner.

Artwork paths, generation method and the complete prompt set are in [the artwork/audio source notes](space-pilot-asterion-art.md). Next increment: Vulcanis — Pirate Foundries, levels 6–10.

## Exact files

Modified (12):

- `.github/workflows/space-pilot-foundation.yml`
- `apps/web/public/games/_shared/game-tab.mjs`
- `apps/web/public/games/space-pilot-platformer/game.js`
- `apps/web/public/games/space-pilot-platformer/game.json`
- `apps/web/public/games/space-pilot-platformer/index.html`
- `apps/web/public/games/space-pilot-platformer/pilot-progress.js`
- `apps/web/public/games/space-pilot-platformer/pilot-shell.css`
- `apps/web/scripts/game-tab-ui.test.mjs`
- `apps/web/scripts/space-pilot-built-browser.cjs`
- `apps/web/scripts/space-pilot-foundation-browser.cjs`
- `apps/web/scripts/space-pilot-foundation.test.cjs`
- `docs/space-pilot-starfall-rift-roadmap.md`

Added (16):

- `apps/web/public/games/space-pilot-platformer/assets/asterion/crash.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/devices.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/gate.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/objects.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/pilot.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/refuge.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/relay.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/salvage.webp`
- `apps/web/public/games/space-pilot-platformer/asterion-art.js`
- `apps/web/public/games/space-pilot-platformer/asterion-audio.js`
- `apps/web/public/games/space-pilot-platformer/asterion.js`
- `apps/web/public/games/space-pilot-platformer/original-route.html`
- `apps/web/scripts/space-pilot-asterion-browser.cjs`
- `apps/web/scripts/space-pilot-asterion.test.cjs`
- `docs/releases/space-pilot-asterion-art.md`
- `docs/releases/space-pilot-platformer-v1.5.md`
