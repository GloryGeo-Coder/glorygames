# Recycle Rush v3.3.1 — Fibre Circle credit and final game-page copy

The Recycle Rush game guide now appends **- Sponsored by Fibre Circle** to its existing Discover heading. The About section has three final player-facing paragraphs describing Circuit’s recycling adventure, the fifteen current story missions, collection dispatch, Grime encounters and the separate twenty-mission arcade campaign. Story and setting has four final narrative paragraphs following Circuit, Professor Loop, Nandi, Sam, Asha, Musa and Lebo through the school, market and recovery district. The copy describes shipped gameplay without presenting planned missions as available.

The in-game service board now links to **Fibre Circle · Zithande Mzansi** at <https://fibrecircle.co.za/zithande_mzansi.html>. It retains its new-tab and opener-protection attributes, and uses the existing light link colour for readability against the dark panel. The source-link assertion and the original release’s current-resource note use the same Fibre Circle URL. The current-source audit found no remaining competing PRO references in the game’s sources, tests or release documentation.

The sponsor is an optional field in the shared guide data, populated only for Recycle Rush. Other games’ headings remain unchanged. Missions, artwork, audio, controls, score publishing, saved progress, game-tab behaviour and deployment configuration are unchanged.

## Validation

- Production Next.js build passed.
- All 41 Recycle Rush regression checks and 25 React/TSX checks passed.
- Server rendering verified the sponsorship heading, final About/story paragraphs and an unchanged other-game heading.
- Chromium checks at 320×568, 390×844, 844×390 and 1440×900 verified heading wrapping, no horizontal overflow, the exact service-board link/label and a playable story sort. No JavaScript or HTTP errors were recorded.
- Game JavaScript syntax, CSS parsing, metadata JSON and whitespace checks passed.

## Exact files

Modified:

- `apps/web/public/games/recycle-rush/game.json`
- `apps/web/public/games/recycle-rush/story-data.js`
- `apps/web/public/games/recycle-rush/story.js`
- `apps/web/public/games/recycle-rush/story.css`
- `apps/web/scripts/recycle-rush.test.cjs`
- `apps/web/src/components/GameEditorial.tsx`
- `apps/web/src/content/gameEditorials.ts`
- `docs/releases/recycle-rush-v3.0.md`

Added:

- `docs/releases/recycle-rush-v3.3.1.md`

## Installation

Build and deploy the merged `main` with the existing Cloudflare setup when ready, then refresh the game information page and dedicated game tab. No database migration or save reset is needed. No Cloudflare build or deployment was run for this amendment; production verification follows the owner’s deployment.
