# Space Pilot Platformer v1.4 — Mobile foundation

This increment prepares the existing eight-mission game for The Starfall Rift campaign. The canvas fits its actual play area, using a uniform camera scale to show upcoming platforms on phones without stretching characters or changing world physics. The HUD/objective strip, playfield and controls occupy separate rows. Short landscape screens use their actual height; the previous 420px minimum and zoom restriction are removed. Notch/home-indicator insets, keyboard focus and scrollable menus are supported.

Movement and action controls support simultaneous captured pointers and release on cancellation, lost capture, pause, focus loss, visibility change and resize. Players can enlarge the buttons, swap their sides and enable forward-cone aim assistance. Jump input buffers briefly before landing while retaining double jump. Enemy firing requires the enemy to be within the camera area. Moving platforms and hazards retain their original physical behaviour.

Menu/P/Escape pauses the current run and stops music. Resume retains position, time and progress. User-activated fullscreen is available in the HUD and menu, with a harmless rejection message where unsupported. Music and effects have separate saved volume controls. Reduced motion removes shake and reduces decorative animation/particles. Original level music and art are retained for this foundation; their replacements belong to the next world increments.

## Checkpoint recovery

`wga_space_pilot_campaign_v1` stores continuous mission unlocks, completion, campaign/best scores, settings and the active checkpoint. Checkpoints activate only on stable platforms, with space from existing hazards. Locations are rebuilt from a platform index and bounded offset; arbitrary stored world coordinates are not used. Saved pickup flags, collected cores, enemy/boss health, score, health, shield, lives and time recover without recollecting the same saved items. Transient projectiles are cleared and a short recovery grace period applies.

Refresh returns to the latest safe platform, retaining saved mission state. Progress autosaves periodically and at pause, damage, transitions and page exit. Explicit checkpoint return costs 100 points; mission restart retains its 300-point cost and restores three usable lives. Failed runs remain failed after refresh and require a retry. Cleared routes retain the final campaign score. Saves are local to the browser; blocked/corrupt storage recovers safely and displays a storage message. Platform account/leaderboard integration remains separate.

## Preservation and approved story

All eight original mission definitions and the route-generation code retain their previous preservation hash. Existing backgrounds, sprites, boss sheets, thumbnail, scoring values, double jump, shield dash and core/boss portal gates are retained. Other games, dependencies, database and Cloudflare configuration are unchanged.

The owner’s exact approved storyline is recorded in [the campaign roadmap](../space-pilot-starfall-rift-roadmap.md). The public game-page storyline and final information will be updated after the campaign upgrades are complete, as requested. This increment does not advertise thirty playable levels.

## Validation

- Eleven Node tests cover preserved route/boss definitions, continuous unlocks, stable geometry, active/failed/completed save recovery, duplicate pickup prevention, invalid data, storage failures, settings and asset/entry references.
- Thirty-nine shared checks cover all game-page launches, Sky Temple, score transport and fullscreen integration.
- Browser checks cover thirteen phone/tablet/desktop sizes, including 320×568 and 568×280; large/swapped controls; simultaneous movement/fire and cancellation; jump buffering; camera framing; safe-area insets; pause; fullscreen; rotation without state loss; active checkpoint reload; final score retention; failed-run retry; audio preferences; and missing storage/audio/art/fullscreen capabilities.
- Eight controlled boss fixtures verify original boss laser attacks, player projectile damage, core gates, completion and unlock transitions. They are not eight full real-time mission playthroughs.
- The Next.js production build and three built-site viewport cases check the information-page launch and the actual standalone entry, pause menu and checkpoint recovery without fixture hooks. JavaScript, HTML/relative references, CSS/JSON syntax and diff checks pass. Chromium emulation is not physical-device Safari certification.

## Installation

Pull merged `main`, then use the existing OpenNext/Cloudflare build/deployment process. No migration, dependency update or ZIP is required. Deployment remains with the owner. Next: Asterion’s five-level world with thumbnail-matched artwork/animation, story chapter and new audio.

## Exact files

Modified (3):

- `apps/web/public/games/space-pilot-platformer/game.js`
- `apps/web/public/games/space-pilot-platformer/game.json`
- `apps/web/public/games/space-pilot-platformer/index.html`

Added (8):

- `apps/web/public/games/space-pilot-platformer/pilot-progress.js`
- `apps/web/public/games/space-pilot-platformer/pilot-shell.css`
- `apps/web/scripts/space-pilot-foundation.test.cjs`
- `apps/web/scripts/space-pilot-foundation-browser.cjs`
- `apps/web/scripts/space-pilot-built-browser.cjs`
- `.github/workflows/space-pilot-foundation.yml`
- `docs/space-pilot-starfall-rift-roadmap.md`
- `docs/releases/space-pilot-platformer-v1.4.md`
