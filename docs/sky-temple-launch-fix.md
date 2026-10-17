# Sky Temple campaign launch correction — v0.13.1

After PR #10 was merged and deployed, the campaign was present under `apps/web/public/games/sky-temple-3d-rise-of-the-relic-master/preview3d/`, but `/play/sky-temple-3d-rise-of-the-relic-master` still embedded the older game's parent `index.html`. Correct file placement alone did not connect the public play page to the four-world campaign.

The Sky Temple play page now uses the catalog's existing thumbnail component and a **Play Game** link to `/games/sky-temple-3d-rise-of-the-relic-master/preview3d/launch.html`. It opens in a new tab with `noopener noreferrer`; the campaign uses the whole window and its own Fullscreen control. The original page retains its chat and sidebar. Other games keep their current iframe/fullscreen behavior. The Sky Temple page title and guide are corrected to the campaign's four worlds, controls, checkpoints and local score behavior.

No world, character, artwork, music, balance, score calculation or save format is changed. The older game files remain available for rollback. The campaign's existing device-only score isolation is preserved. No authentication, database or Wrangler changes are needed.

All four campaign worlds now distinguish an unavailable WebGL renderer from failed asset loading. Graphics errors explain how to try hardware acceleration or another supported browser. Asset errors retain a retry path. Entry scripts request `game.js?v=0.13.1` and the updated shared runtime module to avoid reusing older error handling.

Validation:

- 278 campaign checks pass, including the real Babylon asset/scene tests and graphics-error classification.
- Two React server-rendering tests exercise the actual PlayClient: Sky Temple has the correct campaign link, thumbnail and chat without an iframe; Brick Blaster retains its iframe, fullscreen control and chat.
- The production Next.js server returns the new launcher and title from the exact public `/play/sky-temple-3d-rise-of-the-relic-master` path; the other game's iframe remains intact.
- Next.js production compilation, TypeScript and OpenNext Worker/asset bundling pass. Scoped launch CSS parses successfully and supplies narrow-screen and short-landscape layouts with scrollable content.
- Existing campaign models, music and save/balance modules match the pre-fix commit byte for byte.

Commands from the repository root:

```sh
node tools/audit-sky-temple.mjs
node --test --test-reporter=tap tests/*.test.mjs tests/*.test.cjs
cd apps/web
node --import tsx --test scripts/sky-temple-launch.test.tsx
npx opennextjs-cloudflare build
```

After deployment, verify the public play page has **Play Game**, the link opens the four-world chooser, and each world has the correct graphics support/error state. A capable desktop/phone is required to sign off actual GPU rendering, touch feel and audio; the current cloud browser reports WebGL unavailable. Seeing a clear unsupported-graphics message is not a successful gameplay rendering test.

The incremental ZIP is applied over the complete v0.13 installation. The website change requires the full Next.js repository and a new build/deployment; copying only public assets cannot update a Next.js play-page component. Its manifest lists every added/modified path and old/new checksum. Rollback restores those paths from the pre-fix revision without clearing saves or removing models/music.
