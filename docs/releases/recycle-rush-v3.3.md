# Recycle Rush v3.3 — Collection routes and the recovery district

Circuit’s story continues through five new missions with Musa and Lebo, the recovery coordinator. This release delivers story missions **11–15**, bringing the shipped campaign to **15 missions, 45 areas and 270 recovery tasks**. It adds 15 community requests, 15 interactive dispatch boards with 60 pickup/delivery visits, five original music themes and a third Grime showdown. The 20-mission arcade campaign and Loop Mode remain available. The planned 25-mission story continues in later increments.

## Missions

| Mission | Story objective | New challenge | Music |
| --- | --- | --- | --- |
| 11 · Musa’s Collection Round | Connect community collection points to the recovery district | Collect each load before its accepted delivery; unload to free vehicle space | Musa’s Morning Round |
| 12 · Keep the Fibre Dry | Protect Nandi’s covered paper store | Separate food and dry-paper trips; preserve clean, dry fibre | Under the Canopy |
| 13 · The Right Destination | Help Lebo connect collection services | Follow the local acceptance board for cartons, intact glass and other loads | Connected Streams |
| 14 · Load by Load | Check the intake record and organise prepared loads | Verify actual visits and manage limited collection space | Load by Load |
| 15 · The Recovery District Rises | Reconnect the district gate and restoration station | Complete the tasks, requests and delivery rounds before clearing Grime | Recovery Rising |

Each mission retains three areas of six recovery objects, hands-on preparation/reuse/repair activities and a community project between areas. Its three community requests ask players to apply the local-service rules with feedback, optional clues and recoverable retries. Thirty such requests now appear across the market and recovery chapters.

## Interactive collection dispatch

After each new area’s recovery tasks and community request, a visual dispatch board presents two loads and their four pickup/delivery stops. Each load occupies two game load spaces, while the vehicle holds two, three or four spaces depending on the round. Players can start with either load. A delivery requires its pickup first, and a pickup cannot exceed available space. Separate-load rounds additionally require the first stream to be delivered before collecting the other. This is an untimed scheduling challenge; it does not claim real route distances, weights or payments.

The board shows occupied vehicle space, cargo pictures, completed visits, a route trace and Circuit’s current stop. All visits use labelled touch/keyboard buttons; dragging, fast input and precise gestures are unnecessary. Each valid visit awards 25 points once. Incorrect visits explain the problem without changing the cargo, visit history or score. Dispatch Clue suggests a useful next stop. The community request awards its existing 50-point reward once.

Every valid visit saves. Refresh, pause, map return and rotation resume the remaining visits. Retry This Area resets only that area’s work, decision, dispatch record, project and rewards; previous areas remain complete. The next area and finale stay locked until all required visits are finished. Saved sequences are replay-validated to reject impossible pickups, duplicate visits and deliveries without cargo. Cargo occupancy is derived from the visits, so it cannot drift after reload.

The physical loads are handled by Musa and the trained collection team. Sam retains electrical assessment/repair work, supervisors arrange special drop-off, and broken glass is referred to appropriate adult or trained help. Material acceptance describes Verdale’s fictional local services, rather than universal bin colours or a claim that all packaging is accepted everywhere.

## Art, music and saves

A new warm recovery-depot courtyard matches the existing Verdale artwork. `assets/backgrounds/bg-recovery-district.webp` is 1600 × 900 and **332,042 bytes**. Keep the Fibre Dry and The Recovery District Rises use it; the other missions use the established community, buyback-centre and recovery-facility scenes. All previous art, sprites, backgrounds and the thumbnail are preserved. The [art record](../art/recycle-rush-v3.3-prompts.md) contains the built-in generation prompt and final asset path; `recovery-art.json` records source/final hashes.

Fifteen story missions now have fifteen distinct original music themes. Dispatch uses a short pickup/delivery sound and the existing independent music/effects controls. Existing audio fallback, pause and reduced-motion settings continue.

The story key remains `wga_recycle_restore_v1`, schema version 1. Dispatch records are an optional extension. Completed ten-mission saves keep their achievements and unlock Musa’s Collection Round without replaying earlier chapters; partial school and market sessions remain valid. Arcade keys, unlocks, badges, settings, scoring, bosses and Loop Mode are unchanged. The information page, menu and metadata now report fifteen story missions plus twenty arcade missions.

## Validation

- Production Next.js build passed. No Cloudflare build or deployment was run.
- **1,168 broad Node regression tests passed; 41 Recycle Rush checks passed; 25 React/TSX checks passed.** The dispatch checks enumerate all possible visit orders for each board and verify feasible routes, capacity, separate loads, prefix saves, no duplicate rewards, retries, corrupt-record rejection, old-save migration and finale gates.
- Chromium 151 UI QA passed 320×568, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. Both 390px touch and 1440px desktop completed all fifteen missions through the actual UI. Other layouts completed the opening mission and mission 11 from a completed-market save.
- UI checks cover wrong visits, dispatch clues, pickup persistence after refresh, pause/resume, rotation while carrying a load, separate-load feedback, saved requests/activities/battles, touch drag/cancel, immediate next taps, fullscreen, keyboard focus, reduced motion and return to arcade. No JavaScript, HTTP or asset-loading errors were recorded. Existing blocked-storage/audio checks passed. A separate phone capture verified the new depot background.
- Game JavaScript syntax, CSS parsing, JSON, HTML IDs, script/asset references, new WebP decoding and asset hashes passed. Existing arcade progression through all twenty missions and Loop Mode remains covered.

## Exact files

Modified:

- `apps/web/public/games/recycle-rush/game.json`
- `apps/web/public/games/recycle-rush/index.html`
- `apps/web/public/games/recycle-rush/story-audio.js`
- `apps/web/public/games/recycle-rush/story-data.js`
- `apps/web/public/games/recycle-rush/story-play.js`
- `apps/web/public/games/recycle-rush/story.css`
- `apps/web/public/games/recycle-rush/story.js`
- `apps/web/scripts/recycle-rush-browser.cjs`
- `apps/web/scripts/recycle-rush.test.cjs`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`

Added:

- `apps/web/public/games/recycle-rush/story-dispatch.js`
- `apps/web/public/games/recycle-rush/assets/backgrounds/bg-recovery-district.webp`
- `apps/web/public/games/recycle-rush/assets/backgrounds/recovery-art.json`
- `docs/art/recycle-rush-v3.3-prompts.md`
- `docs/releases/recycle-rush-v3.3.md`

## Installation and next phase

Build and deploy the merged `main` using the existing Cloudflare setup when ready. No manual file placement, ZIP extraction, database migration or save reset is required. Players should refresh their dedicated game tab after deployment. The shared game-tab/fullscreen integration and Cloudflare/OpenNext configuration are unchanged. Production verification remains pending the owner’s deployment.

Next: missions 16–20, repair workshops and special collection. Missions 21–25 complete city restoration. The dedicated arcade graphics phase follows completion of the story campaign.
