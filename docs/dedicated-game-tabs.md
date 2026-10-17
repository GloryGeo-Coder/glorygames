# Dedicated game tabs — v0.14

Game information pages now show the catalog thumbnail and a Play Game link. The link opens the existing game entry in a separate tab without the website interface. Descriptions, instructions, FAQs, related games, scores and sidebar chat remain on the information page.

This applies to all 21 other catalog games. Sky Temple's existing campaign, launcher, launch card and assets remain unchanged.

## Runtime behavior

Each affected `public/games/<slug>/index.html` adds only a shared stylesheet and module. Existing game scripts, asset files, controls and save keys are unchanged. The module activates only at the top-level game URL; it does not activate inside an iframe or for Sky Temple.

Where the browser supports element fullscreen, an Enter Fullscreen button appears beside the existing start/menu controls. Alt+Enter also toggles fullscreen. Unsupported browsers still use the entire game tab viewport. The existing game owns its canvas resolution and resize handling. The shared CSS removes legacy SDK website overlays, removes restrictive wrapper widths where necessary, and permits long mobile mission panels to scroll.

The standalone module adapts existing SDK score calls and same-origin self-window score messages. It retains guest daily challenge submissions and signed-in global submissions through the existing APIs. Improved scores are coalesced, final scores are flushed promptly, and duplicate SDK event variants do not produce duplicate writes. Failed boards retry independently. No score is submitted merely by opening a game.

The information page receives current scores and submission notifications through BroadcastChannel with a localStorage fallback. It refreshes its existing leaderboard after successful submissions. Account identity stays in the game tab's memory and is not included in cross-tab messages. Sky Temple does not subscribe to this bridge.

For gameplay QA without leaderboard writes, append `?scores=0` to a direct game URL. This changes only score submission, not gameplay.

## Validation

- 12 unit tests: legacy score payloads, endpoint behavior, retries, deduplication, unavailable storage, cross-tab delivery, practice mode, fullscreen interaction and all 21 entry points.
- 25 React render tests: the 21 launch pages, thumbnail/link/chat/score preservation, server editorial sections and Sky Temple's existing launch/sidebar rendering.
- 278 existing Sky Temple campaign regression tests.
- All 21 production information routes and direct game HTML entries returned successfully in the local production server. Shared runtime assets resolved successfully.
- Existing game JavaScript passed syntax checks; the new stylesheet parsed successfully; entry pages retain viewport metadata and original asset references.
- Next.js production compilation and TypeScript validation passed. OpenNext generated the Cloudflare Worker successfully.

Responsive styles cover narrow screens and short landscape viewports. These automated checks do not replace physical-device playthroughs of all 21 games or browser-specific fullscreen testing.

Run checks from the repository root:

```sh
node --test apps/web/scripts/game-tab-score.test.mjs apps/web/scripts/game-tab-ui.test.mjs
cd apps/web
node --import tsx --test scripts/game-tabs.test.tsx scripts/sky-temple-launch.test.tsx
npx opennextjs-cloudflare build
```

Run the existing Sky Temple checks with the command documented in `.github/workflows/sky-temple-campaign.yml`.

## Deployment and rollback

The base release is main commit `9748d992c3cf3b3a9841d85e8bb5e4a96880f6f3`. Changes are confined to the information-page client, new launch/shared modules, 21 HTML opt-ins, tests, workflow and this document. No game engines, GLBs, audio, thumbnails, database schema or Cloudflare configuration are included.

Merge the passing feature pull request into `main`; the existing GitHub-linked Cloudflare pipeline builds and deploys `apps/web` to Worker `webgamearena`. Verify a game information page opens its direct game in a new tab, menus expose fullscreen where supported, scores return to the information page, editorial/chat sections remain present, and Sky Temple still opens its existing campaign.

Rollback by reverting the feature merge in GitHub and allowing the normal deployment pipeline to run. This restores the iframe information pages without changing game save data or assets.
