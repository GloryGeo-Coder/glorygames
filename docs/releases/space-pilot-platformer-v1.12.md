# Space Pilot Platformer v1.12 — Original Route Visual Upgrade

The original eight missions have a new female Pilot Nova, animated drone and eight redesigned boss sprite sheets. Their idle, movement, attack, shield and damage poses work with the existing engine states. Four floating-platform styles, refreshed star cores, shield and time pickups, and the portal use new artwork and animated lighting. The established space backgrounds remain in use. Artwork is loaded only for the original route; the 30-mission Starfall Rift campaign is unchanged.

The twelve new sprite atlases are encoded as WebP with transparency. Only the current boss sheet is loaded initially; later sheets load when needed. The player artwork is sized to the existing collision box, and platform surfaces align with the unchanged landing geometry. Existing fallback drawings and pickup images remain available when assets fail to load. A rounded-rectangle radius fix prevents the boss health bar from covering the playfield.

## Validation

The existing original-route browser suite checks eight boss encounters, score and portal gates, checkpoint recovery, thirteen mobile and desktop viewports, simultaneous touch and storage/audio/fullscreen fallbacks. It also loads every new boss sheet, checks all four frames and captures `original-pilot-art-review` screenshots. Pilot, drone, platform and item frames are checked for visible content and transparent corners. Earlier campaign regression suites and the production build remain in CI. The 97 local chapter/progress/art tests pass, including the original mission-definition and level-generator preservation hash.

Browser emulation is not physical-device certification. Cloudflare deployment is performed by the owner.

## Files

Modified: `.github/workflows/space-pilot-foundation.yml`, `apps/web/public/games/space-pilot-platformer/game.js`, `game.json`, `original-route.html`, `apps/web/scripts/space-pilot-foundation-browser.cjs` and `space-pilot-novax.test.cjs`.

Added: `apps/web/public/games/space-pilot-platformer/assets/original-v2/` contains `pilot.webp`, `enemy.webp`, `platforms.webp`, `items.webp`, and `boss-1.webp` through `boss-8.webp`; this release note is also new.

The original generated images were created with the built-in image generation tool: a female pilot in 6×4 idle/run/jump/fire poses, a 4×4 drone animation atlas, four floating platforms, four collectible/portal icons, and eight distinct 2×2 boss sheets with idle/shield/attack/damage states. The resulting images were encoded as WebP for web delivery.

Pull merged `main` and use the existing OpenNext build/deploy workflow when ready. Existing saves need no migration or reset.
