# Recycle Rush v3.0 — Restore Verdale foundation

This increment adds five complete story missions with mobile play as the priority. It is the first story district, not the entire proposed 25-mission story campaign. The existing twenty arcade missions across eight hubs, bosses, badges, powers, scoring and endless Loop Mode remain available from the same map. Their original storage keys and assets are retained.

## Playable story

| Mission | Focus | Community outcome |
| --- | --- | --- |
| Wake the Workshop | Collect, inspect and sort accepted materials | Workshop lights and school collection station reopen |
| Lunchbreak Rescue | Empty, scrape or flatten packaging; protect paper | Clean store and supervised compost collection open |
| A Second Life | Reuse usable goods; qualified electrical repair; battery collection | Exchange shelf and repair bench return to use |
| Collection Day | Follow this service's accepted materials and destinations | Community collection reaches the recovery centre |
| The School of Tomorrow | Combine the skills to clear Grime's shield | School recovery loop is restored |

Each mission contains three areas with six tasks each: 90 recovery tasks in total. Preparation actions add decisions where the item condition requires them. Story missions are untimed, and reading, movement and preparation determine their duration; there is no minimum-duration wait. Players tap an object to collect it, read its material and condition, prepare it when needed, and select a labelled route. Incorrect choices explain the reason and remain recoverable. Clues explain the principle and destination. A clean run without corrections or clues earns three stars; other completed runs earn one or two. Later missions unlock in order. The finale can only complete after all eighteen recovery tasks, which fully remove Grime's shield.

Circuit is an articulated vector character with independent eyes, arms, body and legs, plus collect, work, sort and celebration poses. The art scales with the playfield; the existing backgrounds fill its area without stretching. Item cards retain the established art and clear material labels. Five original music themes use different melodies, bass movement and rhythms. Recovery progress adds a musical layer. Collection, preparation, sorting, corrections and restoration have sound cues. Music and effects volumes are separately adjustable in the mission menu; audio failure cannot prevent play.

## Mobile and saves

Portrait, landscape and desktop layouts keep scene, inspection card and essential controls inside the browser viewport. Story destinations are grouped four per page rather than shrinking eight targets across a phone. Item and route controls have at least 44px touch targets at tested sizes. Labels and icons supplement colour. Safe areas, keyboard focus, modal focus containment, reduced motion, pause on backgrounding and persistent access to supported fullscreen are included. Fullscreen support depends on the browser; the game remains playable without it.

Story decisions save under `wga_recycle_restore_v1`. A refresh restores selected items, prepared materials, partial areas, score, corrections and hints. A completed-area checkpoint restores the Next Area screen. Retry This Area requires confirmation and rolls back only the current area's points and work; earlier areas and all arcade progress are kept. Invalid or out-of-order sessions fall back safely. A visible notice explains when storage is unavailable. Saves are browser/origin local, not cross-device cloud saves.

Arcade storage remains `wga_recycle_rush_2_save_v1` and `wga_recycle_rush_2_best`. Story and arcade completion are intentionally separate: returning players keep all their previous arcade unlocks and stars without automatically completing new learning tasks. Settings are shared between modes. The existing information-page/new-tab launch model is retained.

## Arcade corrections

- Correct material selection is authoritative; wind or lateral drift can no longer invalidate it. Tap-item/tap-bin and optional drag use pointer capture, ignore a second pointer and cancel safely on interruption. Keyboard bin selection and Enter routing remain available.
- All eight destinations wrap to readable rows on narrow screens. The HUD has an explicit canvas row whether the boss bar is visible or hidden. Fall speed is capped by available travel distance so short landscape playfields preserve reaction time.
- Both the material target and boss defeat are required. Boss kills and level completion cannot award bonuses repeatedly. Frame processing stops after a terminal catch, and delayed recovery cannot interrupt the story or map.
- Boss art points to the existing PNGs rather than absent SVGs. Slow-Mo reduces both motion and spawn rate. Mute covers music and effects; disabling effects no longer disables musical notes.
- Scores use canonical `recycle-rush`. Unchanged scores are not emitted or written on every animation frame. The hidden arcade canvas does not continue painting over story play.

## Educational grounding

The story's service boards describe a fictional community, not universal bin colours or acceptance rules. The player sees material, condition, required preparation and accepted destination. Cartons and glass explicitly use this service's recovery centre. A battery task asks a supervisor to arrange collection; electrical assessment is performed by a qualified repairer. Players are not instructed to open devices, handle damaged batteries or pick up broken glass. No invented real-world prices, carbon totals or curriculum certification are claimed.

Current learning resource (updated after this release): Fibre Circle’s Zithande Mzansi programme, <https://fibrecircle.co.za/zithande_mzansi.html>. The in-game service board links to this resource. The mission acceptance rules describe Verdale’s fictional local services, and players are still directed to check their own collector’s current guidance.

## Validation

- Eighteen dedicated regression checks execute shipped story rules, audio scheduling and the actual arcade controller. They cover all 90 story tasks, preparations, recovery feedback, save/retry bounds, every existing arcade level through Loop unlock, boss gates, duplicate rewards, narrow-screen bin geometry, touch capture/cancellation, pause/rotation, canonical scores, missing assets and blocked storage/audio.
- Real Chromium QA exercises 320×568, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. Every layout completes a story mission through visible controls; mobile 390px and desktop 1440px complete all five. Additional flows cover partial/area-complete refresh, feedback, clues, acceptance boards, route paging, preparation, rotation, focus, fullscreen, an actual canvas item sort and blocked storage/audio. Requests and script errors are checked. These are browser-emulation checks, not physical iOS/Android device certification.
- The repository Node/React regression suites, local Next.js production build, JavaScript syntax, JSON, HTML IDs, CSS parsing and asset references are checked. The dedicated GitHub workflow runs the syntax and regression checks on PR/main changes.

## Exact incremental files

Modified:
- `apps/web/public/games/recycle-rush/index.html`
- `apps/web/public/games/recycle-rush/styles.css`
- `apps/web/public/games/recycle-rush/game.js`
- `apps/web/public/games/recycle-rush/game.json`
- `apps/web/src/content/gameEditorials.ts` (Recycle Rush only)
- `apps/web/src/lib/gameCatalog.ts` (Recycle Rush only)
- `apps/web/src/data/games.generated.ts` (Recycle Rush title only)

Added:
- `apps/web/public/games/recycle-rush/story-data.js`
- `apps/web/public/games/recycle-rush/story-audio.js`
- `apps/web/public/games/recycle-rush/story.js`
- `apps/web/public/games/recycle-rush/story.css`
- `apps/web/scripts/helpers/recycle-runtime.cjs`
- `apps/web/scripts/recycle-rush.test.cjs`
- `apps/web/scripts/recycle-rush-browser.cjs`
- `.github/workflows/recycle-rush.yml`
- `docs/releases/recycle-rush-v3.0.md`

All sixteen files apply over the current complete repository. No existing image, model, shared launch module or unrelated game is replaced. Deploy the merged `main` branch through the owner's existing Cloudflare build/deploy process. Entry remains `/games/recycle-rush/`; information page remains `/play/recycle-rush`. No ZIP or manual copying is needed. No Cloudflare build or deployment is performed in this release.

## Following increments

Extend the story to five districts and 25 purpose-built missions: markets/community, collection/recovery, repair/special collection, then city restoration. Add district-specific allies and animations, exploration/collection variations, deeper recovery-centre jobs, more equipment/restoration visuals and a unique score for every new mission. Keep this untimed learning foundation and existing arcade saves throughout.
