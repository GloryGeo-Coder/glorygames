# Kasi Quest — Character & Enemy Animation v3.2

The hero and robots now use time-based pose animation driven by the existing movement and combat logic. This release layers onto the v3.1 mobile foundation.

## Behavior

- Hero: four breathing idle poses, eight running poses, two rising/jump poses, two falling poses, four shooting poses, two landing poses, two hurt poses and four defeat poses.
- Patrol/chaser/shooter robots: four idle poses, eight walking/running poses, four attack poses, two hurt poses, two attack-preparation poses and four defeat poses.
- Bosses: four idle poses, four walking poses, four attack poses, two jump poses, two falling poses, two hurt poses, two attack wind-ups and four defeat poses.
- Run cadence follows movement speed. Opponents have deterministic phase offsets. Shot poses face the direction of their actual projectile even when their patrol direction differs.
- Hit reactions take precedence over attack poses; defeat takes precedence over all actions. Enemy and boss collisions/rewards resolve immediately, while their visual collapse finishes separately. Defeated actors cannot damage the player or award duplicate rewards.
- A visible fatal player hit stops the mission clock and posts the existing final score immediately, then plays a roughly 0.67-second collapse before showing retry. Falling out of the world skips this presentation delay. Interruption during collapse opens the retry menu immediately.
- Pausing freezes pose time. Reduced-motion preference holds breathing idle frames still while retaining gameplay feedback.

## Scale, assets and loading

The new atlases contain 76 poses in total and retain the purple/cyan hero, gunmetal/red robots and spiked purple/red boss identities. Original sprite PNGs, all eight level definitions and all backgrounds are unchanged. The 33 × 50 player collision body, enemy/boss dimensions, v3.1 mobile camera, input and vehicle sizing remain unchanged.

The sheets use explicit alpha-component frame bounds instead of assuming perfectly uniform cells. Small local clip masks exclude neighbouring poses from six boss frames whose rectangular bounds overlap. Each actor uses a single standing-height reference and bottom alignment across poses. A collapsed body stays shorter naturally; the renderer does not stretch it back to standing height. Source aspect ratios are preserved.

The three atlases occupy about 18 MiB decoded. Successful loads skip the four duplicate legacy actor images. Each atlas has a 15-second loading deadline and falls back independently to its original artwork on failure or unexpected dimensions. If the animation scripts are unavailable, the original playable sprite path remains. Background loading retains its previous behavior.

Art was created and refined with the built-in image generation tool. Full generation/refinement prompts, reference paths, dimensions and SHA-256 hashes are in `apps/web/public/games/kasi-quest/assets/animation/manifest.json`. Final runtime files are `player-v3.2.png`, `enemy-v3.2.png` and `boss-v3.2.png` in that folder. The generated PNGs are copied unchanged. `tools/build-kasi-animation-data.py` reads their alpha to regenerate metadata; Pillow, numpy and scipy are development-only requirements.

## Files

Modified:

- `.github/workflows/kasi-quest.yml`
- `apps/web/public/games/kasi-quest/game.js`
- `apps/web/public/games/kasi-quest/index.html`
- `apps/web/scripts/helpers/kasi-runtime.cjs`

Added:

- `apps/web/public/games/kasi-quest/kasi-animation-data.js`
- `apps/web/public/games/kasi-quest/kasi-animation.js`
- `apps/web/public/games/kasi-quest/assets/animation/player-v3.2.png`
- `apps/web/public/games/kasi-quest/assets/animation/enemy-v3.2.png`
- `apps/web/public/games/kasi-quest/assets/animation/boss-v3.2.png`
- `apps/web/public/games/kasi-quest/assets/animation/manifest.json`
- `apps/web/scripts/kasi-quest-animation.test.cjs`
- `tools/build-kasi-animation-data.py`
- `docs/kasi-quest-character-animation-v3.2.md`

## Verification and installation

Run `node --test apps/web/scripts/kasi-quest-*.test.cjs` from the repository root. Tests exercise the shipped game and controller, genuine PNG alpha and pose data, cadence at multiple frame rates, event priorities, asset failure paths, collision/reward timing, retry, saved progress, all eight campaign transitions and the v3.1 mobile checks. DOM adapters do not emulate browser CSS layout or physical touch ergonomics. Real-PNG canvas reviews check sprite/background rendering at portrait, landscape and desktop sizes; physical-device playtesting remains separate.

Apply the incremental ZIP over the complete v3.1 repository at the repository root, replacing/adding only the listed files. Do not delete the existing game assets. The ZIP contains installation instructions and a checksum manifest. Build from `apps/web` with `npx opennextjs-cloudflare build`, deploy through the normal GitHub/Cloudflare flow and refresh the game tab. Animation data, controller and gameplay scripts use `?v=3.2`; unchanged mobile CSS/presentation keep `?v=3.1`.

Save keys remain `wga_kasi_quest_v3`. Wallet, upgrades, stars, daily challenges, existing boss phases, scoring and dedicated-tab/fullscreen behavior are preserved. Longer levels and checkpoints follow in a separate release.
