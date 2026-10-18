# Bubble Pop Arena 2.1.0

Bubble Pop Arena now fits the available phone, tablet or desktop viewport and keeps its continuous 45-second score attack. Time bubbles extend the same round; there is no campaign or level selection.

## Play and presentation

- A grid layout reserves space for statistics, the arena status bar and four touch controls. Dynamic viewport units and safe-area padding accommodate browser bars and notches; short landscape screens use a compact header. Long pause/start panels scroll.
- The canvas uses its actual CSS bounds for input, captures one active pointer, processes full swipe segments and coalesced moves, and clears input on cancellation, pause, rotation or lost focus. Touch targets have a minimum 52 CSS-pixel diameter including the outer sprite canvas. Raster rendering is capped at 3 million pixels.
- New waves follow total safe-pop milestones of 20 and elapsed-play milestones of 25 seconds. Whichever milestone is furthest ahead sets the wave. Bomb score deductions cannot reverse progress. Spawns accelerate, then arrive in groups of two and three; bubble count, speed, particles, text and sound voices have finite limits.
- The original Coral Kingdom, Moonlit Lagoon and Cosmic Drift paintings are joined by Jellylight Grotto, Aurora Garden and Solar Oasis. Scenes fill the canvas with aspect-ratio-preserving cover cropping and a short dissolve; decorative scenery stays still. Six arenas cycle throughout long rounds. Reduced-motion preferences remove dissolves and ambient bubbles and reduce burst particles.
- The original eight background/bubble PNG files remain byte-identical, recorded in `release-v21-baseline.json`. Existing thumbnails are unchanged. Final new-art prompts, dimensions and hashes are in `assets/backgrounds/art-manifest.json`.

## Sound

Six original instrumental scores, one per arena: 422.007 seconds combined, 5,914,064 MP3 bytes, stereo 44.1 kHz at 112 kbps. Liquid mallets, pads, bass and light percussion were synthesized from the included reproducible composer, without third-party songs or recordings. `assets/music/manifest.json` records composition, mastering and checksums.

Pop pitches respond to combos. Time, freeze, bonus, bombs, fever, new scenes, countdown and round results have distinct effects. Music and effects have separate saved volume controls plus master mute. One streamed music element and one optional Web Audio context are reused; effects are limited to 24 voices with a reused noise buffer and compressor. Start/loading screens request no audio. Pause, hidden tabs and screen changes stop playback; resuming retains the current position. Denied playback or unsupported audio does not prevent playing.

## Preserved integrations and corrections

The legacy best-score key `gg_bubble_pop_best_v2`, time/bonus/freeze bubbles, combos, fever, red-bomb point penalties, scoreboard, sidebar-chat link, live score messages and standalone fullscreen start hook are retained. New audio preferences use `gg_bubble_pop_audio_v1`; malformed or blocked storage is tolerated.

Freeze now applies once to every bubble and slows its lifetime consistently. Bubbles receive enough lifetime to traverse tall screens. Keyboard controls ignore buttons, sliders, key repeat and the shared fullscreen shortcut. Changed scores can be submitted after a previous manual submission; duplicate submissions of the same score are ignored.

## Validation

- 41 new game checks: actual shipped runtime, pointer events and audio lifecycle/fallbacks; all six scenes; sustained pointer play at seven field sizes; rotation, cancellation, pause, restart, final scores and save compatibility; preserved/new art and music checksums; entry references and responsive CSS requirements.
- Entire repository Node suite: 831 passed. React/standalone game-page suite: 25 passed. Total: 856 passed.
- Native canvas inspection of all six scenes at 390×690, 844×265 and 1366×618 playfield sizes. DOM adapters supply geometry and do not emulate browser CSS or physical devices.
- All six MP3s fully decoded; RMS around 0.10 and maximum sample peak below 0.668. Audio lifecycle tests do not emulate speaker output or browser autoplay permissions.
- JavaScript syntax, CSS parsing, JSON/HTML references and Python composer syntax passed.
- Production Next.js webpack build and OpenNext Cloudflare bundle passed. Public game payloads compared byte-for-byte with Worker assets.
- Incremental ZIP is applied over a complete clean checkout of base `8152ec9dcc3f0ab460cfc6c14ebbc6a79a56669f`; overlay tree and regression suites are verified before delivery.

## Install and rollback

Use the incremental archive's `INSTALL.md` and `FILES.json`. Copy only `files/` contents into the repository root, preserving paths. Do not delete the existing game folder: the eight original PNGs and thumbnails are required and intentionally omitted. No dependency, schema, framework, Worker configuration or unrelated-game changes are required. Do not delete browser storage.

For a Cloudflare GitHub build, merge the tested feature PR to `main` after checks succeed and let the existing build pipeline publish. An alternative manual build from `apps/web` is `npx opennextjs-cloudflare build`, followed by `npx opennextjs-cloudflare deploy` to the existing `webgamearena` Worker. A successful local build or merge alone does not establish that production has updated.

Rollback by reverting the release commit/PR; retain user browser storage. This release is isolated to Bubble Pop Arena, its tests, build recipe, CI and this note.
