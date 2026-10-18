# City Quest v2.1 — Mobile, movement and campaign refinement

Base: main `7710f44266872a94bbacd706865fe38186030258` (City Quest 2.0).

The game now uses the whole tab viewport. Safe-area-aware thumb controls allow movement, jumping and held fire together; separate pointer ownership prevents one finger from cancelling another. Interruption pauses play, clears inputs and saves progress. Scrollable menus expose outfits on phones. Keyboard controls and the shared game-tab fullscreen/score integration remain available.

The original ten backgrounds, thumbnail, district names, story beats, outfit economy, storage keys and legacy PNGs are unchanged. The ten routes expand from 2,800–4,300 units to 4,900–7,040 units. They contain 6–12 enemies, three additional checkpoints per route, raised side paths and extra healing/blaster pickups. The two bosses move to their final arenas. Missions ask for a forgiving share of available keepsakes rather than every pickup. Guides, collectibles and boss defeat all independently gate the exit.

Sixty new poses cover three guardian outfits, patrol robots and the taxi boss. Six-frame gait cycles, airborne poses, attack charges, hits and enemy defeats follow simulation time and pause with gameplay. Drone rotors and directional sprites clarify movement. Frame metadata removes transparent margins and preserves proportions and feet anchors. The two source animation sheets and generation prompts are in `assets/animation/manifest.json`. `tools/build-city-animation-data.py` records metadata without altering source PNGs.

The physics solver now separates axes, resolves ceilings, buffers jump input and grants a short coyote window. Moving lifts are passable from below and carry the player once per step; taxi roofs can be ridden. Permanent stepping piers offer an alternative through the longest lift gaps. Spike strips are narrow enough to clear with the normal jump and are moved away from landing edges. Falls cost one life and return to a safe checkpoint while retaining collected items and shields. Enemy shots visibly charge, respect cover and start only within encounter range. Off-screen patrols do not fire into unseen encounters.

Startup requests one background and 18 other assets, sharing each animation atlas across its actors. Modern browsers crop and shrink retained legacy prop textures to at most 192px; only one district background is retained. The drawing buffer is limited to approximately three million pixels. Older browsers retain the original image path if bitmap resizing is unavailable. Failed animation sheets fall back to legacy poses.

## Validation

- 46 City Quest checks: multi-pointer input, interruption, six viewport sizes, jump timing, checkpoints, storage failure/migration, outfit thresholds, progression, all ten full terrain traversals, moving lifts/taxis, spike jumping, enemy attacks, bosses, projectiles, trusted messages, memory sizing, actual PNG transparency and 60 distinct poses.
- 210 existing Kasi, Racer, Starfall and shared tab checks; 278 Sky Temple checks; 25 React launch/score checks. Total: **559 passing checks**.
- Next.js production build, TypeScript checks and OpenNext Worker build.
- Native canvas rendering inspected using the shipped game logic and source images.
- All original City Quest PNGs verified byte for byte against the baseline manifest. No shared website launch code or other game's files are changed.
- Incremental ZIP is applied to a clean checkout of the complete base, file hashes/tree verified, then all 559 checks rerun.

The six viewport checks exercise game sizing and input adapters; they do not emulate CSS layout, touch hardware or mobile browser chrome. Real iOS/Android browser play testing remains a release QA item. Terrain traversal isolates combat and damage hazards; separate encounter tests verify those mechanics. This does not replace a complete human playthrough of every encounter.

## Review findings and further development

1. Give districts distinct mission mechanics: rescue a guide, restore a power relay, escort a taxi, then offer optional time trials. Keep mandatory objectives readable and provide spare pickups.
2. Add enemy identities beyond robots: shield carriers, quick rooftop runners and stationary sentries with distinct silhouettes and counters. Introduce each safely before mixing them.
3. Differentiate boss phases with readable arena warnings, recovery windows and unique attacks rather than only more health or faster shots.
4. Add per-mission stars/best times, an optional collectible journal and explicit checkpoint indicators on the map. Store these alongside the existing save rather than replacing it.
5. Add remappable keys, controller support, reduced effects and separate music/effects sliders. Retain the two-thumb mobile controls as the default.

## Deployment

Use the normal `main` GitHub/Cloudflare pipeline. Worker name remains `webgamearena`; `apps/web/wrangler.jsonc` and all deployment settings are unchanged. Build from `apps/web` using `npx opennextjs-cloudflare build`; the hosted game entry remains `/games/city-quest-rise-of-the-guardian/`. Verify the four `?v=2.1` script references on the live page before calling the update deployed. A successful local build or GitHub merge alone is not deployment evidence.
