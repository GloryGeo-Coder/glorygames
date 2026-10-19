# Map Master Africa: World Explorer — v5.1.0

## Learner outcome

Grade 4 now has 12 playable missions and Grade 5 has eight: 20 missions / 120 tasks. Learners can start either grade and unlock later missions within that path. The original five Map Academy missions and their 30 question definitions remain unchanged. The new investigations cover settlements, South African provinces and oceans, food and farming, water, African neighbours, intermediate directions, physical features, weather/climate/vegetation and minerals/mining. This is practice across the four topic areas of each grade, not a complete school course or an official assessment.

## Atlas and evidence

A separate provincial atlas contains all nine provinces, capitals, coast/inland descriptions and geographic notes. Natural Earth 1:10m Admin 1 data are pinned by commit and SHA-256; all 6,229 source vertices and every polygon/ring remain, with five-decimal rounding only. The default mainland view and separate Prince Edward Islands view retain the real coordinate system. Lesotho remains a separate country. The existing 242-feature world atlas and its data are unchanged. Map key, colours, province abbreviations, search, close-ups, keyboard selection and inverse pointer coordinates agree.

Fictional practice records are labelled at the point of use. Native evidence tables support water audits, farming, weather and mining decisions; original vector illustrations provide context. A schematic landform cross-section has letter labels that match its table and no invented real-world elevation scale. The game does not draw made-up physical features or mine deposits onto real provincial boundaries. More world countries have useful case-study notes. Quiet procedural music now has 20 roots/themes, preserving the first five.

## Progress and compatibility

The existing progress key stays wga_map_master_world_progress_v1; its record upgrades to version 2 with stable mission IDs. The five old mission records keep scores, stars, run cursors, hints and mistakes. The old best-score and settings keys remain. New content has no invented completion. Sequential unlocking is derived from completed tasks within each grade. XP uses only best task scores, and saved per-mission progress survives changing grades. Existing retries, hints, learner-controlled continuation, maps, audio controls, shared score/chat bridge, fullscreen and all 39 PNG assets are preserved.

## Validation and delivery

Focused checks include both full 120-task controller campaigns, saved-record migration, grade isolation, geography/provenance, Lesotho and island polygons, semantic evidence, four provincial map sizes and accessible search. Local Chromium has completed the full 120-task campaign through visible UI at 390×844, followed by a reload retaining 12,000 XP and 60 stars. Additional browser layout checks cover 320×568, 844×390 and 1440×900. Browser emulation is separate from physical iOS/Android testing. The pull request and incremental ZIP record final regression, build, overlay and publication results; no deployment is claimed from a successful build alone.

The required base is the complete repository at f3ff0926e2d97d1267d6bbb585c7912f130fde05 (v5.0.1 / PR #39). Apply only the ZIP's files/ contents at the repository root. Preserve everything else and browser storage. INSTALL.md contains exact payload paths, hashes, checks and rollback instructions. No package, dependency, database, route or deployment configuration changes are required.
