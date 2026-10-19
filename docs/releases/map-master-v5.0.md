# Map Master Africa: World Explorer — v5.0.0

This release implements the approved new learning concept. It replaces the previous fifteen-mission picture/pin campaign with five finished Map Academy expeditions (30 tasks) and an unrestricted geographic world atlas. The public `/games/map-master-africa/` path and dedicated-tab launch stay unchanged. The canonical metadata/scoring slug is corrected to match that path.

## What learners can play

The Missing Map Key teaches symbols/legends; The Compass Courier teaches four-point directions; Grid Detectives teaches alphanumeric references; The Community Supply Run applies directions, grids and explicitly defined practice distances; Your First World Expedition introduces South Africa, Brazil, Japan, continents and a hemisphere. Each mission has a briefing, field note, six authored tasks, persistent explanations, retries, hints and an earned badge. Later missions unlock through completion. The first four use an original fictional community plan; enrichment is identified in the content schema.

Explore opens the world from the beginning, with regions, 242 mapped countries/territories, geographic outlines, search, close-ups, zoom and panning. The mapped-feature count is not a sovereign-state count. Natural Earth data are pinned to a commit and SHA-256 in `assets/maps/manifest.json`, with the source's de facto boundary policy retained. All 99,613 source vertices, island polygons and interior rings remain, with coordinates rounded to four decimal degrees. No geography was generated as an illustration. The map is a 1:50m overview, not a topographic map or a surface for measuring equal ground distances.

## Input, progression and integration

One coordinate transform handles SVG shapes, markers, inverse pointer coordinates and actual point-in-polygon selection, including holes such as Lesotho within South Africa. Dragging and multi-touch pinch gestures cannot submit an answer. Capture cancellation, interruption, rotation and explicit Continue clear held pointers. The map and current task stay in the responsive viewport, with a scrollable task area/menu, safe-area spacing, 44-pixel controls, reduced motion, keyboard grid navigation and a searchable country-list alternative.

Mistakes produce a clue and another attempt. Feedback never advances on a short timer. Independent answers earn 100 XP, hinted answers 70 and answers after mistakes 50. Only the best result per task contributes to total XP. Best stars and task scores never decrease. Per-mission cursors, mistakes and hint history survive revisiting another skill or refreshing. Map-key reference is free; Find is explicitly assisted during country tasks. The world legend and map use the same region palette; the town key and features use the same symbol definitions.

New records are `wga_map_master_world_progress_v1` and `wga_map_master_world_settings_v1`. The old `wga_map_master_africa_explorer_best_v1` score remains and can increase. The old game did not persist campaign position; no old completion is invented. Malformed/blocked storage does not prevent session play. Original expedition arpeggios vary across the five missions, with independent music/effects controls and bounded feedback voices. Unsupported or denied audio never blocks learning; pause stops all active voices.

Shared score submission, scores/chat and browser-supported fullscreen are preserved. Website editorial/catalog changes affect only Map Master. All 39 existing PNG images, including the current thumbnail, remain byte-identical; the old map pictures are retained as unused artwork rather than serving as teaching geography. Dependency declarations, deployment configuration, routes and unrelated games are unchanged.

## Curriculum roadmap

`docs/roadmaps/map-master-world-grades-4-10.md` expands the development plan to South African CAPS Grades 4 through 10, including world geography and South African/African cases. The current playable course is introductory Grade 4 mapwork with supported enrichment. It does not claim that future grade courses are already playable. Grade 10 includes appropriate topographic/photo material, bearings, contours, GIS/remote sensing/fieldwork, atmosphere, geomorphology, population and water resources. Future units appear in the roadmap rather than inactive production controls.

## Validation and delivery

There are 39 focused checks for source data/provenance, unchanged art, source references, content, coordinate transforms at six field sizes, polygon holes/islands, saved progression, anti-farming, feedback, routes, full real-controller input campaigns in portrait/landscape, capture/rotation/keyboard/search behaviour, trusted score/control events and audio lifecycle. DOM/input adapters do not emulate browser CSS. Sixteen native SVG map fields were rendered at four sizes, with representative town, world and regional fields inspected. Native rendering is separate from browser visual QA and physical-device QA.

The browser inspection service timed out and browser visual QA could not be completed in this environment. The pull request and incremental ZIP report the final complete repository/React regressions, Next.js/OpenNext production build, exact deployment-asset parity and clean ZIP-overlay verification. Merge and live publication are separate checks; publication can be verified by HTTP asset hashes without claiming a browser playthrough.

Apply only the incremental ZIP's `files/` contents over the complete repository at `05aef635aa9588c6c094dc211ae8d4bf471bda7e`. Keep all other files and browser saves. `INSTALL.md` provides exact paths, verification and rollback; `FILES.json` records sizes/hashes and actual source/pull-request identity.
