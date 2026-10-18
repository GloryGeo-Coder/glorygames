# Brick Blaster 2.1.0 — mobile foundation

The first Brick Blaster upgrade improves Classic Arcade on phones, tablets and desktops. It preserves the existing progressively generated levels, six power-ups, brick types, explosive chains, combos, scoring, sound effects and standalone game-tab integrations. The proposed story campaign, new missions, enemies, boss battles and soundtrack belong to later increments.

## Layout and controls

The available dynamic viewport is divided into a compact HUD, a flexible arena and a control dock, with safe-area padding. A dedicated touch strip beneath the arena keeps fingers clear of the ball. Launch and Pause/Menu are always accessible; restart, score submission, leaderboard and chat are in the scrollable start/pause panel. Combo and power-up notifications appear in the strip rather than covering the brick formation. Desktop and touch layouts retain the neon background and original thumbnail unchanged.

Touch steering defaults to relative movement: touching the strip does not jump the paddle, and sliding moves it from its starting position. Direct touch steering is available in Controls & sound. Mouse dragging follows position; arrow keys and A/D move directly without the previous smoothing-related speed reduction. Tap or Space launches. P toggles pause; Escape pauses. Button and selector inputs, key repeat and the shared fullscreen shortcut are handled separately.

One pointer owns the gesture and its capture. Secondary fingers and right clicks cannot steal it. Pointer cancellation, lost capture, screen changes, pause and lost focus clear input and held keys. Coalesced moves and offset canvas coordinates are supported. Finishing a quick drag preserves the requested paddle destination; cancelling stops it.

## Rotation, pacing and physics

A level records the row and column of each brick. Resizing repositions surviving objects without regenerating bricks or changing their identities, HP, score, lives or level. A screen change pauses play and requires Continue. Waiting balls stay attached to the paddle. In-flight balls scale into the new arena; if a resized brick would overlap a ball, it is placed in the open corridor below the formation without charging a collision.

Brick geometry stays above the paddle even in short landscape arenas and late arcade levels. Small armored bricks use health pips. Ball speed scales with arena height, and the backing canvas is capped at 3 million pixels. Simulation uses fixed 120 Hz steps with bounded catch-up; high-speed paddle and thin-brick collisions are checked independently of rendering cadence. Collisions resolve out of surfaces, and fireballs damage an intact brick once per crossing. A small minimum vertical speed prevents nearly horizontal stalls.

## Pause and sound

Power-up deadlines use active simulation time. Manual pause, hidden tabs, focus loss, platform pause, menus and resize freeze balls, drops, combos, power-up durations and effects. Returning to a visible tab does not resume the round automatically. Platform pause remains respected until cleared.

The existing generated sound effects are retained. A saved Sound On/Off option is available; platform mute still takes priority. Unsupported, denied or interrupted audio cannot stop the game. One context is reused, sound voices are capped at 24 and nodes disconnect when finished, paused or muted. Reduced-motion preferences remove shake, freeze ambient background animation and reduce burst particles.

Preferences use the new `gg_brick_blaster_controls_v1` key. Existing `gg_player_name`, `webgamearena_player_name`, shared high scores and score transport storage are untouched. Storage failures and malformed preferences are tolerated. Existing `GG_SCORE`, `gg:score`, `score_live`, final/level score reporting and the shared fullscreen start hook are retained.

## Validation

- 34 targeted game checks: shipped runtime and input events; two actual successive level clears in portrait and landscape; all six power-ups; collision checks at 15, 30, 60 and 120 FPS; levels 1, 3, 5, 10, 25 and 60 at seven field sizes; surviving-brick identity and HP through rotation; pause/focus/platform lifecycle; audio support failures and bounded cleanup; score integration, restart, entry references and unchanged thumbnail.
- Full repository Node suite: 865 passed. React/game-page suite: 25 passed. Total: 890 checks.
- Native canvas review at 320×390, 390×650, 844×235, 640×170 and 1366×600 field sizes, including late formations. These are arena sizes, not full device sizes.
- JavaScript syntax, JSON/HTML references and CSS parsing passed.
- Next.js production webpack build and OpenNext Cloudflare Worker bundle passed; all six public game files are compared byte-for-byte with Worker assets.
- The incremental ZIP is CRC/SHA-256 checked, applied to a complete clean base at `ae64945016e720bd3f42fcfcdad827b7bfaaa6be`, and its exact source tree and full test suites are checked before delivery.

The DOM adapter supplies geometry and does not emulate browser CSS. The cloud test browser cannot reach the local development server. Physical phone interaction, actual mobile browser chrome/safe areas and speaker output therefore remain outside these automated checks. Do not describe native renders as physical-device tests.

## Install and rollback

Use `INSTALL.md` and `FILES.json` in the incremental ZIP. Copy only `files/` contents to the repository root, preserving paths. Keep the existing game directory, thumbnail, SDK and shared game-tab files. No dependencies, framework, Worker configuration or unrelated games are changed.

Merge the tested feature PR into main after checks succeed and let the existing Cloudflare GitHub pipeline publish. A successful build or merge alone does not establish deployment. Verify that `/games/brick-blaster/` shows the control strip and Pause/Menu, and that its game.json reports 2.1.0. From apps/web, the existing manual commands remain `npx opennextjs-cloudflare build` and `npx opennextjs-cloudflare deploy`, targeting the existing webgamearena Worker when the correct account is available.

Rollback by reverting this release PR/commit. Do not clear browser storage. The next proposed increment introduces the first five designed campaign missions and their initial interactive bricks, enemies and boss.
