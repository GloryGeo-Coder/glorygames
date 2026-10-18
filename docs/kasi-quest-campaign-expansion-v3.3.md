# Kasi Quest — Twenty-Level Campaign v3.3

Completing a mission and entering its exit now unlocks the next stage. Fresh saves start at level 1. The campaign picker is collapsed initially; locked buttons explain which previous level must be completed. Completed stages remain replayable. The daily challenge remains separate.

## Campaign and combat

- Twenty authored routes, 280–440 tiles long (the previous eight were 112–196). Existing district backgrounds are reused explicitly; no artwork is replaced or re-encoded.
- Existing eight route identities continue into twelve new missions, ending with Kasi United and the Iron King. Every stage retains a guardian, mission items, coins, NPC guidance, upgrades and star ratings.
- Each route has 12–20 ground opponents, mostly shooters, plus 3–10 firing drones. Objective quotas leave spare targets and pickups. Ground opponents turn before ledges.
- Drones use a lightweight animated canvas body, twin rotors, thrusters, warning ring and aiming line. Aim locks for 0.4 seconds before a 280-unit/second projectile fires; it does not track the player in flight. Drones can be shot or stomped. Distant encounters sleep; enemy shots are capped at 40 and culled outside the playable area.
- Holding Shoot repeats at the existing upgrade-sensitive cooldown. Brief taps still fire once. Desktop and multi-touch movement controls and physical body sizes are unchanged.
- Three to five recovery flags per route. Landing near a crossed flag activates it. A nonfatal life loss returns to the furthest flag while preserving mission pickups, defeated enemies, open switches, wallet and remaining lives. Nearby hostile projectiles are cleared. A full restart resets the route. Checkpoints persist for the current run, not across page reloads.
- Time-limit penalties now grant 30 seconds before the next penalty, avoiding repeated deaths immediately after recovery.

## Boss presentation and deployment finding

The existing v3.2 transparent animated boss atlas remains the primary artwork. Failed atlas loads can retry on Start. The old opaque `assets/sprites/boss.png` is never requested; if animation cannot load, a new armored canvas guardian keeps combat readable. Boss names and health bars identify each encounter.

The public page inspected before this release loaded `game.js?v=3.1`, without either animation script. That explains the old boss sprites despite PR #21 already being merged. Main was confirmed at `d51072f6f157480cf3d31a8c2b8854fdfc17421e`, containing all v3.2 atlases. The configured Worker remains `webgamearena`, assets `.open-next/assets`, entry `.open-next/worker.js`, compatibility date `2026-05-18`, `nodejs_compat`. The connected Cloudflare account exposed only `cold-cherry-13d9` and `fibre-circle-website`, so its connection cannot inspect/retry the production Worker deployment. Do not deploy to either of those unrelated Workers.

## Save compatibility

The existing `wga_kasi_quest_v3` best, wallet, upgrade, star and daily keys remain. Valid legacy stars unlock through the highest previously completed stage plus one; clearing the old level 8 therefore opens level 9. `wga_kasi_quest_v3_campaign` records `{ "unlocked": N }`, clamped to 1–20. Save migration does not spend wallet funds, erase stars or reset upgrades. Campaign loads reject locked or invalid stage numbers. Incomplete objectives cannot unlock a stage through completion calls.

## Verification

492 automated checks passed: 91 Kasi Quest, 98 racer/space/shared game-tab, 278 Sky Temple, 25 React launch and score-flow checks. Kasi checks include:

- All twenty full terrain routes traversed through shipped movement/input physics without upgrades or damage, alternating phone portrait and landscape sizes. Solids, pits, taxis, falling crates, trampolines, moving/collapsing platforms, hazards, pressure switches and doors remain enabled. Combat is isolated in these terrain checks; separate tests cover combat and all twenty mission/gate transitions.
- Fresh/legacy/malformed saves, locked UI and direct loads, actual exit-triggered unlock, replay, reload and daily isolation.
- Checkpoint recovery with retained pickups, kills and switches, reset on restart, and time-limit grace.
- Drone hover/warning/locked aim/projectiles/damage/defeat/pause; ground-enemy patrol survival; holding fire and shot limits.
- Actual boss-atlas rendering and no request for the old boss image, including asset-failure fallback. Existing 76-pose alpha/crop/animation tests remain.
- Existing multi-touch, interruption, rotation, fullscreen, scoring, economy, daily challenge and 11 viewport sizing checks.

JavaScript syntax, CSS parsing, JSON and local asset references passed. Next.js production build (including TypeScript) and final OpenNext Worker bundling passed. All 63 Kasi files exactly matched the bundled Worker assets. Actual PNG/canvas renders were inspected at 390×844, 844×390 and 1280×720, including the animated guardian. Test adapters do not replace physical-device testing or browser CSS layout verification; live v3.3 verification remains dependent on the correct Cloudflare deployment.

## Incremental installation

Apply this version over the complete v3.2 project corresponding to main commit `d51072f6f157480cf3d31a8c2b8854fdfc17421e`. The archive contains only changed/new repository files plus its installation guide and manifest. It deliberately omits unchanged atlases and backgrounds. Do not install it as a standalone game or over an incomplete older archive.

Extract at repository root so game files land in `apps/web/public/games/kasi-quest/`; retain all unrelated files. Do not clear browser storage. `PATCH_MANIFEST.json` enumerates every file with base/result hashes. After applying, validate and build from `apps/web`, then let the GitHub-connected production Worker build the merged main branch.

Authoring source: `tools/build-kasi-campaign.cjs`; regenerate via `node tools/build-kasi-campaign.cjs`. Runtime uses only static level JSON. No new dependency is required.

## Exact repository changes

Modified (17):

- `.github/workflows/kasi-quest.yml`
- `apps/web/public/games/kasi-quest/game.js`
- `apps/web/public/games/kasi-quest/index.html`
- `apps/web/public/games/kasi-quest/kasi-animation.js`
- `apps/web/public/games/kasi-quest/styles.css`
- `apps/web/public/games/kasi-quest/levels/level-01.json` through `level-08.json` (all eight)
- `apps/web/scripts/helpers/kasi-runtime.cjs`
- `apps/web/scripts/kasi-quest-animation.test.cjs`
- `apps/web/scripts/kasi-quest-assets.test.cjs`
- `apps/web/scripts/kasi-quest-runtime.test.cjs`

Added (15):

- `apps/web/public/games/kasi-quest/levels/level-09.json` through `level-20.json` (all twelve)
- `apps/web/scripts/kasi-quest-campaign.test.cjs`
- `tools/build-kasi-campaign.cjs`
- `docs/kasi-quest-campaign-expansion-v3.3.md`

No removals. No website launch, mobile presentation, original sprite, background, other game, dependency or deployment-configuration changes.
