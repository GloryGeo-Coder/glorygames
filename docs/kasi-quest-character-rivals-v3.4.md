# Kasi Quest — Character Rivals v3.4

The campaign now introduces four human rival characters alongside the existing bots, drones and guardians. Each character has original transparent artwork, 20 animated poses and a distinct attack/counter pattern.

| First stage | Character | Combat behavior | Counter |
| --- | --- | --- | --- |
| 2 | Rooftop Runner | Brief crouch warning, committed forward dash, recovery pause | Jump the dash; attack during recovery |
| 5 | Shield Warden | Blocks frontal shots and winds up a short shield bash | Two blocked shots stagger the shield; rear shots bypass it; two stomps defeat the guard |
| 8 | Spark Thrower | Winds up a locked, arcing charge that bursts on impact or expiry | Move away from the amber charge and its visible burst radius |
| 12 | Lookout Ranger | Raises a crossbow, shows an aiming line, then fires along the locked trajectory | Move after the aiming signal; the projectile does not follow the player |

Stages 16–20 mix the full roster. Existing bot shooters and drones remain. New enemies replace selected ground encounter slots; actor counts, mission quotas, terrain, pickups, obstacles, checkpoint positions, switches, doors, backgrounds and bosses stay unchanged. The first stage is unchanged. Saves and the sequential 20-stage unlock system use the existing keys. Daily mode retains its existing roster.

## Gameplay and accessibility

Attack warnings use distinct pose changes, colors, an exclamation mark and a charge bar. Ranger aim is shown before firing. Wardens show an orange OPEN indicator when staggered. On first approach, a short encounter tip explains the counter; the mission panel also identifies new characters. Hurt interrupts a windup. Defeated opponents immediately stop colliding and awarding rewards, while the defeat animation finishes.

Ranged attacks retain the 40-projectile cap and offscreen cleanup. A spark charge uses gravity and creates a 48-world-unit circular burst for 0.18 seconds, applying damage at most once. The drawn circle matches the collision radius. Dash movement uses the existing patrol bounds, ledge checks and solid collision, so it cannot bypass terrain. The older `runner` bot alias remains a patrol bot; the new human Runner uses the internal `sprinter` type.

Mobile controls, player size, camera, responsive CSS, pause/rotation behavior, hold-to-fire, checkpoints, scoring, upgrades and daily saves are preserved. Reduced motion retains attack cues while reducing optional movement effects. If a new sheet fails to load, its character uses a recognizable human canvas fallback and retains its combat behavior; it does not turn into an old bot sprite.

## Artwork and resource budget

All four atlases were generated with the built-in `image_gen` tool. Their pixels are copied unchanged into the repository. Full final prompts, SHA-256 hashes, dimensions, decoded sizes and exact project paths are recorded in `apps/web/public/games/kasi-quest/assets/animation/roster-manifest.json`.

New atlas paths:

- `apps/web/public/games/kasi-quest/assets/animation/sprinter-v3.4.png`
- `apps/web/public/games/kasi-quest/assets/animation/warden-v3.4.png`
- `apps/web/public/games/kasi-quest/assets/animation/thrower-v3.4.png`
- `apps/web/public/games/kasi-quest/assets/animation/ranger-v3.4.png`

Each sheet contains idle, walk/run, anticipation, attack, hurt and defeat poses. The metadata builder includes nearby disconnected heads, hair and accessories, and excludes neighbouring sprites at draw time. Source PNGs are never cropped, resized, recolored or re-encoded. The existing 76 player/bot/boss poses and all backgrounds are unchanged.

Only sheets needed by the current campaign level are loaded. Moving back to earlier stages or entering Daily releases unused sheets from both animation and image caches. Returning reloads them. All seven actor sheets together require 44,037,888 decoded bytes (about 42 MiB), below the enforced 48 MiB budget; early stages load fewer. Failed loads can retry on later starts. This figure covers actor pixel storage, not total browser/GPU memory or transfer time.

## Validation

513 automated checks passed: 112 Kasi Quest, 98 other games/shared game-tab, 278 Sky Temple and 25 React launch/score-flow checks. Coverage includes:

- Role introduction levels, later mixed encounters, and v3.3 geometry/obstacle/boss/quota fingerprints across all 20 levels.
- All 20 complete terrain routes using shipped movement physics, without upgrades or damage. Combat is isolated in those terrain checks; separate checks exercise combat, all mission gates and campaign transitions.
- Actual player projectile hits, shield blocking/stagger/rear hits, successive stomps, dash commitment/recovery, charge gravity/burst radius, ranger lock/no homing, interrupted windups and projectile limits.
- 80 new distinct poses, genuine alpha, frame bounds, disconnected-feature coverage, source hashes, foot alignment, facing, shorter defeat poses and resource budget.
- Per-character artwork failure, residency/reload behavior, legacy bot aliases, save migration, checkpoint recovery, daily isolation, multi-touch, pause/rotation, 11 viewport sizing checks and existing gameplay regressions.

Next.js/TypeScript production build and final OpenNext Worker bundling passed. All 70 Kasi public files exactly match the Worker asset output. Actual PNG/canvas scene renders were inspected at 390×844, 844×390 and 1280×720, including windup and defeat poses. The test DOM adapters do not replace browser CSS layout checks or physical-device testing. Live rollout is reported separately from local QA.

## Incremental installation and authoring

Base: complete v3.3 at main commit `52bafa9292f350ea2eed9cf8edd51380dbcc49a1`. Extract the incremental archive at repository root, preserving paths. It includes only added/modified repository files plus an installation guide and exact before/after SHA-256 manifest. Retain existing assets and browser storage. The archive is not a standalone game.

Run `node tools/build-kasi-campaign.cjs` to regenerate campaign encounter definitions. Run `python3 tools/build-kasi-roster-data.py` to regenerate the new frame metadata (development dependencies: Pillow, NumPy, SciPy). Runtime requires no new dependency or build-time generation.

Deployment configuration remains `apps/web/wrangler.jsonc`, Worker `webgamearena`, OpenNext entry `.open-next/worker.js`, public assets `.open-next/assets`. No deployment settings or unrelated games are changed. A successful merge is not proof of production deployment; confirm the deployed entry references `game.js?v=3.4`, `kasi-enemies.js?v=3.4` and `kasi-enemy-data.js?v=3.4`.

## Exact repository changes

Modified (26):

- `.github/workflows/kasi-quest.yml`
- `apps/web/public/games/kasi-quest/game.js`
- `apps/web/public/games/kasi-quest/index.html`
- `apps/web/public/games/kasi-quest/kasi-animation.js`
- `apps/web/public/games/kasi-quest/levels/level-02.json` through `level-20.json` (all nineteen)
- `apps/web/scripts/helpers/kasi-runtime.cjs`
- `apps/web/scripts/kasi-quest-animation.test.cjs`
- `tools/build-kasi-campaign.cjs`

Added (11):

- Four PNG atlases listed above
- `apps/web/public/games/kasi-quest/assets/animation/roster-manifest.json`
- `apps/web/public/games/kasi-quest/kasi-enemy-data.js`
- `apps/web/public/games/kasi-quest/kasi-enemies.js`
- `apps/web/scripts/helpers/kasi-png.cjs`
- `apps/web/scripts/kasi-quest-roster.test.cjs`
- `tools/build-kasi-roster-data.py`
- `docs/kasi-quest-character-rivals-v3.4.md`

No removals; no existing image, character atlas, background, responsive stylesheet, website launch component, dependency or deployment-configuration changes.
