# Brick Blaster v2.2.0 — Neon Grid

Adds the first complete campaign world alongside Classic Arcade. Five designed missions progressively unlock, save their best score and replay stars, and end with the restoration of Neon Grid. No future worlds or unplayable mission slots are exposed.

| Mission | Objective | Scene |
| --- | --- | --- |
| Breach the Grid | Clear a designed barrier with explosive chains and bonus caches | Neon canal city |
| Circuit Reroute | Activate three relays, then destroy both adjacent core tiles | Conduit hall |
| Skybridge Evac | Release three repair drones from green rescue pods | Twilight skybridge |
| Sentinel Sweep | Defeat a shooting Sentinel and an armour-repair drone, then destroy the core | Security dockyard |
| The Grid Warden | Disable two generators and defeat the moving, three-phase boss through its central eye | Signal spire |

The patrol warns before shooting. A hit briefly narrows the paddle and breaks its combo; it does not kill the player. Repair charges are finite and cannot restore destroyed tiles. The Warden's shield rejects fireballs and explosions until its generators are destroyed. Phase two alternates eye openings; phase three accelerates the patrol and fires two-shot volleys. Shielded hits award no points.

Missions start with three lives and a fresh score. Finishing earns one star; losing at most one life earns two; losing no lives earns three. Extra-life pickups do not erase the number of lives lost. Completion, unlocks, best scores and stars save under `gg_brick_blaster_campaign_v1`. Blocked storage permits progress for the current session. Existing steering, sound preferences and player identity keys remain compatible.

## Art and rendering

Five original full-bleed PNG paintings, 1672 × 941 pixels each, were generated with the built-in image-generation tool. Their exact production prompts, paths, dimensions, bytes and SHA-256 hashes are recorded in `apps/web/public/games/brick-blaster/assets/backgrounds/art-manifest.json`. They use a stationary, centred cover crop with a dark readability layer. Each mission has its own scene; Classic cycles through the scenes. Settings offers the original neon grid. Unsupported or failed image decoding falls back to that grid without blocking play. The lazy image cache retains at most two scenes. The existing thumbnail is unchanged.

Enemy bodies, shields, eyes, wing movement, warning lines, health bars and projectiles are drawn by the game. Reduced-motion preferences stop wing motion and camera shake. Scene art stays stationary in all modes.

## Validation

- 897 Node checks and 25 React checks pass: 922 total, including all 66 Brick Blaster checks.
- Pointer-only simulations complete all five missions in order through the shipping collision and input code at 390 × 650 and 844 × 235 arena sizes. They never change HP, scores or ball positions directly.
- Objective counts, relay and rescue idempotence, shield rules, finite repairs, warnings, volleys, boss phases, unlock enforcement, save compatibility, life-based stars, retries, mode switching and score bridge context are covered.
- Pause and rotation retain boss HP, warnings, projectiles and objective state. Six geometry sizes from 320 × 390 through 3840 × 1990 are checked.
- Twenty native canvas fields were rendered across all five missions at portrait, landscape, short landscape and desktop sizes. All five scenes were visually inspected. This verifies the game renderer; it does not emulate browser CSS or constitute a physical-phone test.
- JavaScript syntax, JSON, relative entry references, unique HTML IDs, PNG headers and hashes, CSS parsing and whitespace checks pass.
- Next.js production build and OpenNext Worker bundle pass. Every Brick Blaster source asset matches its bundled copy byte for byte.
- The incremental archive must be applied over the complete preceding release in a clean checkout and all Node/React checks rerun before merge.

## Deployment and rollback

Only Brick Blaster files, its test support and this release note change. Website routes, other games, dependencies, Cloudflare configuration, the standalone game-tab integration and the original thumbnail remain unchanged. Production continues through GitHub → Cloudflare Worker `webgamearena` using `apps/web/wrangler.jsonc`.

A successful local bundle or GitHub merge does not establish that Cloudflare has published it. Check the live game for the Neon Grid Campaign mode and version 2.2 assets after the automatic deployment. Physical-device and live deployment verification remain separate from the local checks above.

For rollback, revert the release commit or restore only the modified files from the base commit and remove only files added by this release. Keep the campaign save key so progression is available when reinstalling v2.2.
