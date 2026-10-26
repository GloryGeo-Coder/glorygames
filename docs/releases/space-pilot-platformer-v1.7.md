# Space Pilot Platformer v1.7 — Luminara: Crystal Expanse

Adds the third Starfall Rift chapter, missions 11–15: ordered memory archives, reflected-beam receivers, scholar refuges, dimensional bridges and a shielded Prism Guardian. Complete Vulcanis to unlock Luminara on its mission screen. The separate `luminara.html` entry retains links to Asterion, Vulcanis and the eight original missions. No unfinished later world is advertised as playable. The exact approved final information-page story remains reserved for campaign completion.

## Five missions and their rules

- **Whispers in the Glass:** recover the archives in west-to-east order. A blocked archive explains which action is needed.
- **The Reflected Path:** hold Fire for 0.8 seconds while a mirror's emitter is blue. The reflected ray locks onto its receiver and permanently silences that emitter group. Amber warning starts at 1.9 seconds, harmful magenta pulses at 2.6 seconds, and the four-second cycle then resets.
- **Sanctuary Out of Phase:** clear sentries within 200 world units of each refuge before holding Fire to release the scholars.
- **Bridges Between Moments:** phase bridges are solid for 3.5 seconds of their five-second cycle, with a 0.7-second amber warning before disappearing. Hold Fire at an anchor during its blue interval to make that bridge group permanently solid. The stone lower route never disappears.
- **Heart of the Prism:** ground all three anchors before lasers can damage the Prism Guardian. A visible shield and HUD instruction explain the protection. Its volley warning and faster second phase use the established combat system.

Every required core and interaction remains reachable from stable lower platforms. Dimensional ledges provide optional upper routes, not mandatory waiting traps. Moving and phased platforms cannot become saved checkpoints. Level widths grow from 5,100 to 7,500 world units.

Five canvas-native illustrated crystal landscapes, animated sentries, readable mirror receivers and the Prism Guardian retain Nova's existing white-armoured artwork. Five original synthesised arrangements and seven effects use the existing independent volume controls. Decorative motion respects reduced-motion settings while warning colours, timing labels and danger states remain accurate.

## Progress and controls

Luminara saves separately under `wga_space_pilot_luminara_v1`. All three previous save keys remain unchanged. First-run settings inherit Vulcanis preferences. Completed objectives, collected items and enemy damage persist at safe checkpoints; partial interaction holds reset. Once Luminara has legitimate saved progress, replaying an earlier chapter cannot relock it. Unavailable browser storage is explained because cross-page unlocking requires it.

The chapter retains simultaneous touch controls, cancellation, pause, orientation fitting, fullscreen, aim assistance, keyboard controls and checkpoint recovery. The score bridge recognises the explicit Luminara entry. No dependency, database, thumbnail, deployment configuration or final information-page editorial changes.

## Verification

- 45 local Node checks pass, including all original-route, Asterion and Vulcanis tests plus 16 Luminara checks.
- JavaScript syntax checks and independent code review are required before the draft PR handoff.
- The added GitHub browser suite covers 13 viewport sizes, carried settings, simultaneous touch/cancellation, five actual-physics lower-route fixtures, visible blocked-interaction phone hints, beam/bridge timing, Guardian shield/projectile exchange, progression and save recovery. These controlled fixtures are not full real-time combat playthroughs or physical-phone certification.
- Existing GitHub CI also runs all prior browser suites, the Next.js production build and production-entry checks, now including Luminara without fixture hooks. Screenshot artifacts support independent visual review.
- Local managed-preview infrastructure was unavailable; no alternative local browser path was used. Browser/build results must be checked on the exact PR head before declaring it validated.

## Release control

This increment is submitted as a draft PR for review only. It does not merge or deploy. The owner retains Cloudflare deployment, and a future merge requires authorization.
