# Final public game-page information

All 22 public game guides and catalog summaries are reconciled with the implemented repository content. Counts below distinguish separate modes; they must not be combined into a misleading single campaign. These changes update information pages and listings, not other games' runtime code or assets.

| Game | Verified playable scope | Repository evidence |
| --- | --- | --- |
| Brick Blaster | Five Neon Grid missions and separate Classic Arcade | `brick-blaster/game.json`; `brick-blaster-v2.2.md` mission table |
| Bubble Pop Arena | Continuous round starting at 45 seconds, six changing arenas; time bubbles extend the run | `bubble-pop-arena/game.json`; `bubble-pop-v2.1.md` |
| City Quest: Rise of the Guardian | 25 township levels; animated combat, drones and 25 Amapiano-inspired arrangements | `city-quest-rise-of-the-guardian/game.json` |
| Climate Rescue Quest | 25 missions and five boss encounters | `climate-rescue-quest/game.json` |
| Cyber Shield Academy: Terminal Ops | 16 simulated investigations; checkpoints, retries and untimed practice | `cyber-shield-academy/game.json` |
| Fruit Slice | 25 trials and separate Endless Arcade | `fruit-slice/game.json` |
| High Speed Racer: City of Legends | Six opening career jobs, twelve arcade streets; recoverable impacts | `high-spead-racer/game.json`, `racer-career.js`, `game.js` and `racer-driving.js` |
| Kasi Quest | 20 campaign levels and separate daily challenge | `kasi-quest/game.js`, `LEVEL_COUNT = 20`, campaign/daily progression |
| Lost Jungle: Temple of the Sun | 25 long 2D levels and five story chapters | `lost-jungle-3d-temple-of-the-sun/game.json` |
| Map Master Africa: World Explorer | Grades 4–10; 84 missions, 504 campaign tasks, 56 alternate revision activities | `map-master-africa/game.json`; existing final grade-path guide |
| Math Sprint Arena | Grades 4–10; 140 missions and 1,400 activities, plus separate 52-level Sprint | `math-sprint-arena/learning-data.js`, grade banks and `game.json` |
| Neon Hover Runner | Five zones ending at Apex Night Run | `neon-hover-runner/game.js`, five-entry `LEVELS` and campaign completion flow |
| Neon Orb: Base Defence | 25 missions, one boss in each; 15 enemy types and five boss families | `neon-orb-defender/game.json` |
| Physics Force Lab | Twelve story missions | `physics-force-lab/game.json` |
| Recycle Rush: Restore Verdale | 25 story missions, 450 recovery tasks, separate 20-mission Arcade; unlocked Loop Mode | `recycle-rush/game.json`; final story/arcade guide |
| Science Lab Dash | 20 missions leading to the Glitch Experiment | `science-lab-dash/game.json` |
| Sky Temple 3D | Four active 3D campaign worlds; five relics and a Guardian in each | `src/lib/skyTempleLaunch.ts`; `preview3d` world entry scripts |
| Space Dodger 3D: Starfall Odyssey | 18 story sectors with rescue, relay, escort, gravity and boss objectives | `space-dodger/game.json` |
| Space Pilot Platformer | Eight missions, each with a boss, ending at Final Gate | `space-pilot-platformer/game.js`, eight-entry `LEVELS` |
| Stack Tower | Endless block-stacking score challenge with Focus Mode | `stack-tower/game.json`; existing game guide |
| Swipe Racer | Four mission routes | `swipe-racer/game.json` |
| Word Dash | Four themed mission levels | `word-dash/game.json` |

Game paths in the evidence column are under `apps/web/public/games/`; prior release notes are under `docs/releases/`. Runtime definitions and active launch routes take precedence over stale legacy manifests. Sky Temple's older root `game.json` describes a separate legacy entry; the site's active link continues to use the four-world `preview3d/launch.html` campaign.

## What changed

Every public guide and card now presents a matching final summary and level/mode FAQ. The Brick Blaster text describes the playable Neon Grid story and touch strip. City Quest no longer claims ten levels. City of Legends describes the six-job opening chapter, actual brake controls and speed-loss collisions rather than a six-level campaign with instant collision failure. Kasi Quest shows the 20-level unlock path. Neon Orb explains a boss in every mission. The eight Space Pilot missions and five Neon Hover Runner zones are now stated explicitly.

Math Sprint information covers all seven implemented grade paths and the final Grade 10 topic scope, while retaining the selected-practice qualification. Existing descriptions, story, controls, learning information, tips and FAQs remain available. Recycle Rush retains Fibre Circle sponsorship; no other PRO is introduced. The existing Fibre Circle game link is untouched.

The catalog supplies current names for City of Legends, World Explorer and Restore Verdale to database-backed pages and fallback listings. Game slugs, IDs, category assignments, scores, saved games, thumbnails and launch links are unchanged. Unknown games keep their existing names and descriptions. No database write or migration is required.

## Verification

Content tests cover all 22 catalog/guide summaries, actual rendered guides, level/mode facts, rejection of superseded claims, canonical and unknown names, stable IDs/slugs and Fibre Circle sponsorship. Existing rendered play-page tests retain the thumbnail, dedicated Play Game link, sidebar chat, score and Sky Temple launch snapshot. TypeScript and the production Next.js webpack build validate the updated shared catalog behavior.

This audit verifies page information against source. It does not claim a fresh gameplay test of every other game's full campaign or a Cloudflare deployment. The Grade 10 release notes describe the separate gameplay and mobile regression evidence.
