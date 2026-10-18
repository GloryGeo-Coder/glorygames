# City Quest v2.2 — Township campaign expansion

Base: complete City Quest v2.1 on main commit `53f6c8dff13471abebf1cf5c1311b59427f1d123`.

The campaign now contains 25 sequentially unlocked missions. Each original stage is exactly twice its v2.1 width and has exactly twice its regular enemy spawns. Their original backgrounds, starting districts, hazards and boss identities are retained. Bosses in stages 6 and 10 move to the ends of the extended routes. New township stages 11–25 add their own backgrounds, route profiles, guides, encounters and boss milestones at 15, 20 and 25. Only stage 25 now ends the story.

| Stage | v2.1 width | v2.2 width | Regular enemies before → after |
|---|---:|---:|---:|
| 1 | 4,900 | 9,800 | 9 → 18 |
| 2 | 5,300 | 10,600 | 11 → 22 |
| 3 | 5,660 | 11,320 | 11 → 22 |
| 4 | 5,860 | 11,720 | 9 → 18 |
| 5 | 5,720 | 11,440 | 10 → 20 |
| 6 | 5,420 | 10,840 | 6 → 12 |
| 7 | 6,480 | 12,960 | 12 → 24 |
| 8 | 6,680 | 13,360 | 11 → 22 |
| 9 | 6,740 | 13,480 | 12 → 24 |
| 10 | 7,040 | 14,080 | 10 → 20 |

The original 101 regular spawns become 202. The new districts add 420 regular spawns, for **622 regular enemies plus five boss fights** across the campaign. New routes range from 11,000 to 14,360 world units with 24–32 enemies each. Increased health/attack speed is restrained: the longer routes spread encounters out, retain charged-shot warnings, and provide additional healing, shields and blaster pickups.

## New districts

11. Ubuntu Park Rooftops
12. Sunrise Taxi Exchange
13. Spaza Street Sprint
14. Schoolyard Heights
15. Mural Square Stand
16. Community Garden Bridges
17. Clinic Crossing
18. Commuter Rail Run
19. Recycling Works
20. Reservoir Guardian
21. Festival Avenue
22. Solar Ridge
23. Water Tower Heights
24. Night Market Lights
25. Guardian Homecoming

Each has a distinct opaque 16:9 township environment image. Images are loaded one district at a time rather than preloaded for the entire campaign. The original ten backgrounds, thumbnail, all legacy sprite PNGs and the 60-pose animation sheets are unchanged. The final prompts, built-in image-generation mode, saved asset names, dimensions and hashes are recorded in `assets/backgrounds/township-manifest.json`.

## Playability and saves

Permanent terrain, optional raised paths, moving lifts and cover crates extend the routes. New lifts sit farther inside landing surfaces, leaving room to recover before a gap. Beacons are placed regularly, including more in the original portions; jumping past a beacon can activate it. Boss recovery beacons remain outside the final arena. Nearby guides can be spoken to again after accepting a mission.

Mobile controls, safe-area layout, pixel budget, sound, score bridge, outfits, jump buffering, coyote time, invulnerability and checkpoint recovery remain available. Existing localStorage keys are retained. Coins, score, record, selected outfit, sound settings, current mission and earned unlocks migrate without resetting. Saves from later missions round-trip with the expanded 25-stage bounds.

The v2.1 save did not record whether its final unlocked stage 10 had actually been cleared. To avoid granting unearned progression, such saves keep stages 1–10 and open stage 11 when stage 10 is cleared in v2.2. New saves record the highest completed mission explicitly. Checkpoint positions remain per run, as before.

## Validation

- **72 City Quest checks**: all 25 complete terrain traversals through the shipped physics, collectible quotas and final checkpoint; exact doubling from the recorded v2.1 baseline; locked progression; old and new save round-trips; the stage 10→11 transition and stage 25 finale; guides; enemies; bosses; moving lifts/taxis; hazards; pause/input interruption; six phone/desktop viewport sizes; asset references; 15 distinct background images; legacy image hashes; transparent animation poses; lazy image loading and memory sizing.
- **513 existing regression checks**: 210 existing game/shared checks, 278 Sky Temple checks and 25 React launch checks. Total **585 passing checks**.
- Next.js production build with TypeScript and standalone output; final OpenNext Worker build; source public files compared byte for byte with bundled Worker assets.
- Native canvas artwork checked using the shipped runtime in new districts 11, 24 and 25.
- One incremental ZIP is applied to a clean complete base checkout, its before/after file hashes and Git tree verified, then all 585 checks rerun.

Terrain traversal isolates combat and damage hazards while retaining actual terrain, crates and lifts. Separate encounter checks cover combat/hazards. Viewport/input adapters do not emulate browser CSS or physical touch hardware. Full human playthroughs and physical iOS/Android testing remain QA items.

## Installation and deployment

Apply the incremental ZIP at the repository root over the complete v2.1 source, merging only its listed paths. Do not clear browser storage or copy only game.js. The new `city-township.js` must load after `city-campaign.js` and before `game.js`; the HTML includes all required versioned references. The game remains at `/games/city-quest-rise-of-the-guardian/`.

Deployment configuration is unchanged: `apps/web/wrangler.jsonc`, Worker `webgamearena`, OpenNext and GitHub main. A merge or local build is not proof of production deployment; verify the live `city-township.js?v=2.2` and `game.js?v=2.2` references after the normal Cloudflare rollout.
