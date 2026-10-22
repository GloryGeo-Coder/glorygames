# Recycle Rush v3.4 — Verdale, Together

Completes Restore Verdale with missions 16–25. The campaign now has five chapters, 25 missions, 75 saved areas, 450 recovery tasks, 60 community requests, 30 collection-dispatch boards (120 visits), 30 community work orders (120 actions) and five Grime showdowns. Each mission has a distinct original music theme.

## New missions

| Mission | Title | Focus |
| --- | --- | --- |
| 16 | Repair Row | Qualified assessment before replacement |
| 17 | The Sharing Shelves | Checked books and clothing for reuse |
| 18 | Care and Keep | Safe care, expert assessment and accepted next destinations |
| 19 | Special Appointments | Supervisor-led specialist collection arrangements |
| 20 | The Workshop Beacon | Repair-quarter showdown |
| 21 | School to Square | Connect the school to the city network |
| 22 | The Market Promise | Reuse and separate event collections |
| 23 | The Centre Check | Local acceptance and recorded handovers |
| 24 | A Rain-Ready City | Dry fibre storage and separate collection trips |
| 25 | Verdale, Together | Final network, showdown and completed-city celebration |

## Gameplay and saves

New work-order boards have two independent checks, team approval that requires both checks, and a final record that requires approval. Both check orders work. Premature actions and shortcuts explain the correction; clues identify a useful next step. Successful actions save individually and award points once. Qualified staff perform specialist work. The final chapter also connects pickups and accepted deliveries through the existing capacity and separate-load rules.

The workshop and final city showdowns require the relevant requests, work orders and deliveries before Grime can be cleared. The ending celebrates all five districts and shows the campaign star total. All missions remain available for replay after unlocking.

The existing `wga_recycle_restore_v1` key and schema version 1 are retained. Completed mission-15 saves unlock Repair Row; older completed and partial sessions retain their progress. Retrying an area removes only its current actions, decision and dispatch records and restores its checkpoint score, corrections and clues. Earlier areas, best stars and scores remain. The separate 20-mission arcade campaign and Loop Mode retain their original logic and saves.

Two new full-bleed backgrounds depict the repair courtyard and restored civic square. Their combined WebP size is 670,806 bytes. Existing backgrounds, sprite atlases and thumbnail are unchanged. The original 15 music themes are retained, with ten new themes and a work-order confirmation effect.

The information page now describes the completed story, work orders and 25-mission progression. It retains Fibre Circle sponsorship, the approved Zithande Mzansi resource, thumbnail launch, scores and sidebar chat. No other PRO is introduced.

## Exact files

Added:

- `apps/web/public/games/recycle-rush/story-finale.js`
- `apps/web/public/games/recycle-rush/story-orders.js`
- `apps/web/public/games/recycle-rush/assets/backgrounds/bg-repair-courtyard.webp`
- `apps/web/public/games/recycle-rush/assets/backgrounds/bg-verdale-square.webp`
- `apps/web/public/games/recycle-rush/assets/backgrounds/finale-art.json`
- `docs/art/recycle-rush-v3.4-prompts.md`
- `docs/releases/recycle-rush-v3.4.md`

Modified:

- `apps/web/public/games/recycle-rush/game.json`
- `apps/web/public/games/recycle-rush/index.html`
- `apps/web/public/games/recycle-rush/story-audio.js`
- `apps/web/public/games/recycle-rush/story-data.js`
- `apps/web/public/games/recycle-rush/story-play.js`
- `apps/web/public/games/recycle-rush/story.css`
- `apps/web/public/games/recycle-rush/story.js`
- `apps/web/scripts/recycle-rush.test.cjs`
- `apps/web/scripts/recycle-rush-browser.cjs`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`

## Validation

- `node --test apps/web/scripts/recycle-rush.test.cjs` — 47 rules and regression tests. Includes complete 25-mission play, all 20 arcade missions and Loop Mode, every dispatch permutation, work-order dependency branches, partial saves, migration, retry, forged records, duplicate rewards, independent audio buses and art hashes.
- `node --import tsx --test scripts/*.test.tsx` from `apps/web` — 25 platform rendering tests.
- `npm run build` from the repository root — production Next.js build. Incidental dependency and generated Prisma changes are excluded from the release.
- JavaScript syntax, PostCSS parsing, metadata JSON, entry-script references, new image decoding and dimensions, and `git diff --check`.
- The actual built `/play/recycle-rush` route returns 200 and includes the finished story, 25-mission counts, Fibre Circle credit, direct game launch and chat.
- Browser suite: 320×568, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. The phone and desktop runs play all 25 missions through ordinary controls. Other layouts cover missions 1, 11, 16, 21 and 25 using supported completed-chapter saves. Assertions cover touch/keyboard target bounds, no page overflow, rotation, reloads within work orders and dispatch, boss-wave reloads, clues, final districts, the approved resource link, fullscreen, reduced motion, arcade return/play and blocked storage/audio.

Optional browser command (Chrome and Playwright are supplied by the QA environment):

```sh
PLAYWRIGHT_MODULE=/path/to/playwright-core \
CHROMIUM_EXECUTABLE=/path/to/chrome \
node apps/web/scripts/recycle-rush-browser.cjs
```

`RECYCLE_QA_WIDTH` optionally accepts one width or comma-separated widths from the suite. `RECYCLE_QA_OUTPUT` selects the screenshot/results directory. Tests and screenshots run locally; CI runs the pure rules suite without browser downloads.

## Installation and deployment

Use the merged `main` branch as one incremental update over v3.3.1. Keep all existing game assets. No database migration, save reset or environment change is required. All new game files are under `apps/web/public/games/recycle-rush/`; the entry includes the new work-order and finale modules in dependency order.

The owner performs the Cloudflare build and deployment using the existing OpenNext setup. No Cloudflare build or deploy is performed for this release. After deployment, open `/games/recycle-rush/`, resume an existing save, and verify the updated `/play/recycle-rush` description. The next planned phase is the arcade graphics upgrade.
