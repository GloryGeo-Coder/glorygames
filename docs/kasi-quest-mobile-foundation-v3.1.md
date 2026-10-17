# Kasi Quest — Mobile & Gameplay Foundation v3.1

This release fixes mobile viewport handling, touch input, menu access and asset proportions before the animation and extended-campaign releases.

## Player-visible changes

- A consistent world scale and camera look-ahead across portrait, landscape and desktop. The camera reserves space for the HUD, mission progress and touch controls.
- Transparent source margins are cropped at draw time. Player, enemy, boss, vehicle and coin images retain their aspect ratios and share stable bottom alignment. The original PNG files are unchanged.
- The player retains the existing 33 × 50 world-unit collision body. Visible player height ranges from about 27 CSS pixels at 320px width to 63 on larger displays. A 3.5-million-pixel backing-store budget limits high-DPI rendering work.
- Taxis use the source art's proportions, with matching collision dimensions and the same authored bottom position. The standard 80-unit-wide vehicle is about 70 units high, instead of stretching the image into a 116 × 42 box. Clearance is tested with the actual jump physics across all eight configurations.
- Coins use 24-unit artwork with the existing forgiving pickup area; other pickups remain visually subordinate to characters.
- Independent pointer capture for simultaneous movement, jumping and shooting. Short taps between frames are retained. Sliding off a held button no longer interrupts it.
- Pause is reachable during play. Esc/P toggles pause; leaving the tab, losing focus or rotating pauses safely and clears held controls. Returning requires an explicit resume.
- Scrollable, safe-area-aware menus; readable mobile labels, lives and mission progress; fullscreen remains supplied by the shared game-tab integration.
- Jump buffering (120ms) and edge grace (100ms). Restarting resets the shot cooldown. Concurrent start/level-selection requests are serialized and load failures retain a usable retry menu.

## Preserved content and compatibility

All eight campaign JSON files and background/character PNGs remain byte-for-byte unchanged. Existing enemies, boss phases, obstacles, doors, NPC objectives, upgrades, wallet, stars, daily challenge and score events remain. Save keys retain the `wga_kasi_quest_v3` namespace. Website launch pages, other games, shared fullscreen/score files and deployment configuration are unchanged.

Full frame animation, checkpoints and longer authored levels belong to the following releases. This update retains the existing single-pose idle/run artwork.

## Changed files

Modified:

- `apps/web/public/games/kasi-quest/game.js`
- `apps/web/public/games/kasi-quest/index.html`
- `apps/web/public/games/kasi-quest/styles.css`

Added:

- `apps/web/public/games/kasi-quest/kasi-presentation.js`
- `apps/web/scripts/helpers/kasi-runtime.cjs`
- `apps/web/scripts/kasi-quest-runtime.test.cjs`
- `apps/web/scripts/kasi-quest-assets.test.cjs`
- `.github/workflows/kasi-quest.yml`
- `docs/kasi-quest-mobile-foundation-v3.1.md`

## Validation and installation

Run `node --test apps/web/scripts/kasi-quest-*.test.cjs` from the repository root. The suite executes the shipped gameplay in a VM with DOM/input adapters; it covers gameplay state, input, saves, score contracts, all eight mission transitions, vehicle jump clearance, asset references, sprite proportions and background coverage. Display calculations cover eleven viewport sizes, including narrow portrait, short landscape and 4K desktop.

The DOM adapters do not emulate browser CSS layout or physical touch ergonomics. Offline canvas reviews use the real PNGs and draw functions. Device/browser playtesting remains a separate release verification item.

Apply the incremental ZIP at the repository root, allowing these listed files to be added/replaced. Keep the existing complete game and its assets. Run the tests and `npx opennextjs-cloudflare build` from `apps/web`. The root `README_INSTALL.md` and `PATCH_MANIFEST.json` in the ZIP contain base revision and file checksums; they are installation aids, not runtime assets. After deploying, refresh the game tab to load the versioned CSS and scripts.
