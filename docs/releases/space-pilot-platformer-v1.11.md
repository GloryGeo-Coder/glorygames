# Space Pilot Platformer v1.11 — Campaign QA and final guide

The Starfall Rift campaign has 30 missions across Asterion, Vulcanis, Luminara, Cryon, Verdantis and NOVA-X. The original eight-mission route remains separate. This increment completes the campaign regression pass and publishes the owner's exact approved storyline, final description, world/mission counts, controls, checkpoint rules and FAQs on `/play/space-pilot-platformer` and `/games/space-pilot-platformer`. The catalog title and description override stale database/fallback copy without a migration. The existing thumbnail, dedicated game tab, score interface, related games and chat remain in place.

## QA fixes

- Later chapter reports could finish without a visible route to the next world. The shared completion flow now reuses or adds a Continue link from the chapter's unlocked navigation. It appears on successful completion and is hidden on failure. All five chapter hand-offs use the same path.
- The HUD could show the score before the completion bonus while the report showed the final score. Ending a mission now refreshes the HUD after awarding the bonus.
- A defeated boss could announce an unlocking portal while cores or objectives remained. The message now identifies the remaining core collection or mission objective. The Commander still requires the escape seals and Wayfarer beacon; no gate condition is relaxed.

Mission generation, all artwork/music files, physics, damage, lives, boss health, score values, save keys and snapshot schema are unchanged. The final story describes the narrative; an interactive Wayfarer hub, purchasable upgrades, ship missions and replay medals remain future expansions and are not advertised as implemented features.

## Release gates and evidence

- **149 automated tests:** 97 chapter/progress/art tests, 17 shared score/fullscreen tests and 35 rendered catalog/page/launch tests. These include a paragraph-by-paragraph comparison against the approved roadmap story and the original eight-mission generator preservation hash.
- **All earlier browser suites:** original route and each of six chapters, 13 viewport sizes from 320×568 through desktop and shallow landscape, simultaneous touch/cancel, larger/swapped buttons, physical lower-route traversal, timing/hazard rules, damage, cargo/guardian/escape recovery and unavailable-storage/audio/art fallbacks.
- **Continuous campaign regression:** one browser/storage context advances through all 30 missions and all five Continue links. It earns completion through held interactions, real full-health laser fights, collected cores and portal entry rather than seeding completion flags or reducing enemy health. Mid-chapter reloads retain scores, defeated enemies, objectives and stable checkpoints. Settings inherit between chapters; the original-route save remains unchanged. The supported browser's actual fullscreen enter/exit is exercised.
- **Audio:** all 30 actual music composers feed real OfflineAudioContext nodes using a virtual scheduling clock. Waveforms must be distinct, audible, finite and below clipping. Seven effects per chapter produce 42 additional finite/audible render checks. Volumes and pause/resume remain covered by runtime checks.
- **Built production routes:** Next.js production build and the full OpenNext Cloudflare Worker build pass locally. Browser gates cover both information pages' exact story and metadata, 320×568/844×390/1440×900 layouts, a real Play Game popup, direct entries without fixture hooks, menu and save recovery. `pilot-page-review` and `pilot-campaign-review` are the CI screenshot artifacts, alongside each world's existing artifact.
- **Static checks:** JavaScript syntax, all seven HTML entry references/unique IDs, CSS asset URLs, manifest JSON and clean diffs.

The continuous regression uses controlled player positioning and invulnerability to isolate progression; it does not replace a human combat playthrough. Physical-route and damage fixtures run separately. Screenshot review and Chromium viewport emulation are not physical iOS/Android device certification. The managed local preview infrastructure remained unavailable; browser checks and screenshot evidence run in GitHub Actions. Live Cloudflare deployment and post-deployment smoke checks remain with the owner.

## Installation

Pull merged `main`. No ZIP, asset replacement, dependency update, database migration or save reset is required. When ready, run the existing commands from `apps/web`:

```sh
npx opennextjs-cloudflare build
npx opennextjs-cloudflare deploy
```

Worker `webgamearena` and `apps/web/wrangler.jsonc` are unchanged. This work does not deploy to Cloudflare.

## Exact files

Modified (8):

- `.github/workflows/space-pilot-foundation.yml`
- `apps/web/public/games/space-pilot-platformer/game.js`
- `apps/web/public/games/space-pilot-platformer/game.json`
- `apps/web/scripts/space-pilot-built-browser.cjs`
- `apps/web/scripts/space-pilot-novax.test.cjs`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`
- `docs/space-pilot-starfall-rift-roadmap.md`

Added (3):

- `apps/web/scripts/space-pilot-campaign-browser.cjs`
- `apps/web/scripts/space-pilot-page.test.tsx`
- `docs/releases/space-pilot-platformer-v1.11.md`
