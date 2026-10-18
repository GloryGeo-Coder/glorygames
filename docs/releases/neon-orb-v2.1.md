# Neon Orb: Base Defence v2.1.0

Expands the nine-mission game to 25 complete missions with longer three-wave defences, four command-core bosses, progressive unlocks, replay stars, animated transparent sprites, full-screen scenes and an original song for every level. The existing standalone game-tab and fullscreen workflow remains intact.

## Mobile and controls

The layout reserves separate rows for a compact HUD, the full-width arena and touch controls. Buttons no longer cover the player or overlap mission meters. Safe-area insets, dynamic viewport height, scrolling menus and portrait/landscape layouts are supported. Sprite sizes and combat geometry adapt to the available arena; rotation pauses while preserving health, mission counts, enemy state, boss HP and warnings.

Captured pointers allow independent movement, jumping, forward/upward fire, dash and EMP. Optional auto-fire with aim assist is on by default and can be disabled for manual play. Forward fire, Jump + Fire, Q/R upward shots, double jump, dash, EMP, all five weapons, eight pickups and friendly AI rescues are retained. Hidden tabs, focus loss and platform pause clear held inputs. Mission transition countdowns use active gameplay time, so pausing cannot lose the transition.

## Campaign

Missions require a minimum 90–162 seconds, increasing by three seconds per level, and have three escalating waves as well as their combat, collection, rescue or Orb objective. Required supplies spawn deliberately at reachable heights. Two launch missions add generous deadlines. Bosses enter in wave three at missions 9, 15, 20 and 25. OMEGA-9 reveals the wider network rather than ending the campaign at mission 9; the Prime core concludes it at mission 25.

Enemy bullets are telegraphed with amber aiming lines. Swept collision checks prevent fast bullets crossing targets without a hit. Repair drones have finite repair reserves and cannot heal above original HP. Orb attacks use the actual Orb position and ground contact has a bounded attack interval. Enemies, projectiles, particles, floaters, pickups and NPCs have explicit count limits.

Unlocked missions, best mission scores and replay stars use `wga_neon_orb_campaign_v2`. Settings use `wga_neon_orb_settings_v2`. The legacy `wga_neon_orb_base_defence_best_v1` high score is preserved. Each selected mission starts a new score run; advancing keeps the campaign score. Retrying restores the mission starting score to avoid repeated failed-run farming. Completion earns one star, armour and Orb at least 50 earn two, and at least 80 earn three; non-Orb missions use armour alone. Blocked storage allows session play without persistence.

The score bridge now identifies the canonical website slug `neon-orb-defender`, retaining the original slug as additional legacy context. Game descriptions on the website reflect the 25-mission campaign. Other games, routes, dependency versions and Cloudflare settings are unchanged.

## Art and audio

All 33 existing art assets, including the thumbnail, remain byte-for-byte unchanged. The existing nine backgrounds remain in use with their top title banners cropped by the renderer. Sixteen newly generated environments give every level a different scene. Four new transparent eight-frame sheets animate the defender, ground robots, drones and command cores. The sheets support direction changes, idle/run states, firing flashes, shields and reduced motion.

`assets/art-manifest.json` records the exact final paths, image prompts, built-in generation mode, dimensions, alpha checks and SHA-256 hashes. No generated project asset is referenced outside the game directory. Backgrounds use stationary aspect-preserving cover crops with a dark readability layer; only the current and previous scene are retained. Failed image loads have a code-drawn fallback and do not block play.

Twenty-five distinct original electronic compositions are rendered locally from synthesized instruments, without third-party songs or samples. Each has its own tempo, key, harmony, groove and motif. The stereo MP3 files stream one at a time. Music and effects have separate persisted volume controls; platform mute has priority. The audio lifecycle handles denied autoplay, missing APIs, failed media, late play promises, hidden tabs and disposal. Effects reuse one context and one noise buffer, with at most 24 voices. The source score renderer is `tools/build-orb-soundtrack.py`; `assets/music/manifest.json` contains the track hashes, timing, synthesis provenance and mastering settings.

## Validation

- 937 Node and 25 React checks pass: **962 total**, including 40 Neon Orb checks.
- Touch-only simulations complete and unlock all 25 missions in order at 390 × 580 and 844 × 235 arena sizes. The test player uses the shipped buttons and actions without changing health, scores, enemy HP, positions or mission counts.
- Geometry checks cover every mission at six sizes from 320 × 390 through 3840 × 1990. Sixteen native-canvas combat scenes cover portrait, landscape, short landscape and desktop fields; selected scenes were visually inspected. These adapters do not emulate browser CSS or constitute physical-phone QA.
- Original asset hashes, new PNG dimensions/transparency, MP3 hashes, unique scores, entry references, HTML IDs, JavaScript syntax, JSON, CSS parsing and whitespace checks pass. All 25 MP3s fully decode and match their declared durations. Representative tracks have peaks below −3 dBFS and RMS levels around −19 dBFS.
- Next.js production and OpenNext Worker builds pass. Every source game file matches its bundled asset byte for byte.
- Apply the incremental ZIP over the complete preceding release in a clean checkout, require the resulting tree to match the tested source tree, and rerun Node/React checks before merging.

## Deployment and rollback

Production remains GitHub → Cloudflare Worker `webgamearena`, configured by `apps/web/wrangler.jsonc`. A local build or merge is not a deployment receipt. Verify the live game shows 25 missions, the revised controls and version 2.1 assets after automatic publication. Physical-phone QA and live publication remain separate checks.

Rollback by reverting the release source commit, or restore only modified files from the base and remove only added files listed in the incremental package. Keep the campaign and legacy high-score browser keys so progression remains available when reinstalling the upgrade.
