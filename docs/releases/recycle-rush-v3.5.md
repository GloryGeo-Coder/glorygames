# Recycle Rush v3.5 — Arcade Visual Upgrade

The 20-mission Arcade Campaign now uses the same illustrated material style as Restore Verdale. Eight bosses have 32 new animation frames, Circuit reacts in the playfield, and material cards, collection bins, power-ups, HUD symbols, hub portraits and mission introductions have matching artwork. The existing eight arcade backgrounds remain in place with clearer colour and less visual obstruction.

## Presentation changes

- Two transparent 1024×1024 WebP sheets contain four frames for each of Hallway Sludge, Curbside Crawler, The Bog, Coin-Op Chaos, The Sorter, Landfill Leviathan, Circuit Storm and The Great Grime. Idle, attack and hit poses use actual frame changes.
- Existing Circuit artwork supplies idle, collection, celebration and worried poses in the playfield. Existing material sprites add newspaper/cardboard, bottle/empty-container and peel/apple variations while keeping the original material categories.
- Four new power icons depict Magnet, Slow-Mo, Shield and Double Points. Matching heart, star, combo and medal artwork appears in the HUD and achievements.
- Labelled bins have a shaded body, selection border, material artwork, progress fill and a lid response. The item hitboxes and destination geometry remain unchanged.
- Successful sorts show a short destination confirmation and the points actually earned. Effects are capped at 16 presentation events and 180 particles. Reduced motion uses fixed sprite poses and omits decorative travel, bobbing, ambient motion and particle bursts; essential falling gameplay continues.
- The compact title gives phones more playfield height. The controls retain 44px minimum touch targets, including landscape layouts and the eight-material finale.
- Full-canvas grayscale filters, randomly flickering overlays, large crossing energy trails, the playfield watermark and rapid full-screen storm flashes are removed. Progress still brightens the scene through a controlled tint.

## Rules, performance and compatibility

The renderer is separate from the rules. Paint calls do not mutate gameplay state or consume the gameplay random stream. Bin-lid timing advances with simulation time rather than draw frequency. All 20 mission definitions, sorting targets, speeds, spawn rules, attacks, score formulas, power effects, unlock rules, controls and save keys are retained. Artwork selection adds only a transient visual field to falling items.

All ten new WebP assets total **810,814 bytes**. Each boss sheet is decoded once and reused for the relevant four characters and their hub/comic portraits. The old large boss PNGs and earlier item/power art remain as fallbacks and load only when the corresponding packed artwork fails. Circuit’s still image is preloaded for quick transitions between illustrated introductions and play.

The 25-mission story, story checkpoints, stars, original music, Fibre Circle credit and approved Zithande Mzansi resource remain available. The game information page retains its thumbnail launch, scores, FAQs and sidebar chat; its description now mentions the finished arcade artwork. The thumbnail and existing background/character files are unchanged.

## Exact files

Added:

- `apps/web/public/games/recycle-rush/arcade-art.js`
- `apps/web/public/games/recycle-rush/assets/arcade/bosses-a.webp`
- `apps/web/public/games/recycle-rush/assets/arcade/bosses-b.webp`
- `apps/web/public/games/recycle-rush/assets/arcade/magnet.webp`
- `apps/web/public/games/recycle-rush/assets/arcade/slow.webp`
- `apps/web/public/games/recycle-rush/assets/arcade/shield.webp`
- `apps/web/public/games/recycle-rush/assets/arcade/double.webp`
- `apps/web/public/games/recycle-rush/assets/arcade/life.webp`
- `apps/web/public/games/recycle-rush/assets/arcade/star.webp`
- `apps/web/public/games/recycle-rush/assets/arcade/combo.webp`
- `apps/web/public/games/recycle-rush/assets/arcade/medal.webp`
- `apps/web/public/games/recycle-rush/assets/arcade/manifest.json`
- `apps/web/scripts/recycle-arcade-pack.cjs`
- `apps/web/scripts/recycle-rush-arcade-browser.cjs`
- `docs/art/recycle-rush-v3.5-prompts.md`
- `docs/releases/recycle-rush-v3.5.md`

Modified:

- `.github/workflows/recycle-rush.yml`
- `apps/web/public/games/recycle-rush/game.js`
- `apps/web/public/games/recycle-rush/game.json`
- `apps/web/public/games/recycle-rush/index.html`
- `apps/web/public/games/recycle-rush/styles.css`
- `apps/web/scripts/helpers/recycle-runtime.cjs`
- `apps/web/scripts/recycle-rush-browser.cjs`
- `apps/web/scripts/recycle-rush.test.cjs`
- `apps/web/src/content/gameEditorials.ts`

## Verification

- `node --test apps/web/scripts/recycle-rush.test.cjs`: 53 tests cover all 25 story missions and 20 arcade missions, Loop Mode, saves/migrations, audio, controls, all four powers, graphics fallbacks, asset hashes, bounded effects and read-only rendering.
- `node --import tsx --test scripts/*.test.tsx` from `apps/web`: 25 platform rendering tests.
- Production Next.js webpack build from `apps/web`: `node node_modules/next/dist/bin/next build --webpack`.
- JavaScript syntax, CSS parsing, JSON, HTML entry references, asset dimensions, all 32 boss cells with real transparency and matching provenance hashes, and `git diff --check`.
- `recycle-rush-arcade-browser.cjs`: eight viewports from 320×568 to 1440×900, all eight bosses at each size, real pointer sorting, idle/attack/hit frames, hazard clearing, pause, reduced motion, rotation, HUD/control bounds, story entry and the approved resource. The 390px phone uses device-pixel ratio 3 while canvas rendering stays capped at 2.
- `recycle-rush-browser.cjs`: phone portrait and landscape story regression through missions 1, 11, 16, 21 and 25, saved work orders/dispatch, the ending and actual arcade return/play.

The browser capture records draw coordinates through the canvas transform and actual backing-store ratio. It observes rendering without exposing or modifying game internals. The shared runtime helper loads the shipped sprite and presentation modules. Browser dependencies are supplied by the QA environment; CI runs the pure rules suite without downloading Chrome.

## Installation and deployment

Apply the merged `main` update over v3.4 and retain all existing files/assets. The entry loads `arcade-art.js` before `game.js`; include the entire new `assets/arcade` directory. No database migration, save reset or environment change is needed.

The owner builds and deploys through the existing Cloudflare/OpenNext setup. This release performs no Cloudflare build or deployment. After deployment, check an early boss and the eight-category finale on mobile, then resume a story save and verify that the information page still credits Fibre Circle. No ZIP is required because delivery is through GitHub.
