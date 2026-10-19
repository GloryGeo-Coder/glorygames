# Map Master — World geography through Grade 10

The product grows from an Africa-only pin quiz into a geographic learning adventure covering the world, with South African and African case studies retained throughout. The established `/games/map-master-africa/` URL, portal information page, scores, chat and dedicated game tab remain stable.

## Released foundation: v5.0.0

Five complete Map Academy expeditions contain 30 authored tasks: symbols and legends, four-point directions, alphanumeric grids, grid routes and introductory world-map reading. The first four use a clearly identified fictional community plan. The fifth connects South Africa, Brazil and Japan with continental and hemispheric ideas. A free Explore mode opens the whole world independently of campaign unlocking.

Activities identify their grade, term, curriculum source and enrichment scope. The current playable course is introductory Grade 4 mapwork with supported enrichment. It does not claim to provide all Grade 4 topics or playable Grade 5–10 courses yet.

The locally bundled Natural Earth 1:50m overview contains 242 mapped countries and territories, including all continents. This is a cartographic-feature count, not a sovereign-country count. Source outlines, interior holes, island polygons and every source vertex are retained. Rendering, markers and hit testing use one longitude/latitude transform. Pan, zoom, country search, keyboard alternatives, hints, explanations, mastery XP, badges and saved progress form the reusable learning foundation.

## Released expansion: v5.1.0

Twenty playable missions contain 120 tasks. Grade 4 has the five preserved Map Academy missions plus seven investigations for settlements, provinces/oceans, food/farming and water; Grade 5 has eight missions covering African map skills, South African physical features, weather/climate/vegetation and minerals/mining. Both grade paths start independently, with sequential unlocking within each path. The release provides practice across the four topic areas in each grade, not a complete school course or an official assessment. Grade 6–10 remain planned.

The provincial atlas uses pinned public-domain Natural Earth 1:10m data: nine provinces, all 6,229 source vertices and every source polygon/ring, including the distant Prince Edward Islands in a separate view. Geographic hit testing, markers, labels and zoom use the same coordinate transform. Capitals and descriptive notes use the South African Government province reference. Provincial overviews do not represent every river, landform or mineral deposit. The world atlas and all 39 existing PNG assets remain unchanged.

Original fictional evidence tables support community, food, water, weather and mining investigations; the landform cross-section is explicitly schematic. The saved-progress record is upgraded in place to version 2 with stable mission IDs, retaining all original five results/cursors, hint history, stars, best score and sound preferences. No future mission completion is invented. The curriculum guide now identifies Grade 4 and Grade 5 practice as available.

See `docs/learning/map-master-grade4-5-v5.1.md` for the mission-to-topic matrix and factual sources.

## Curriculum paths

Each grade is a separate learning path with units, short skill lessons, applied missions and mixed revision. Country/capital recognition is enrichment within a much broader geography curriculum. Mission counts will follow the objective matrix and review, rather than stretching one activity into an arbitrary fixed number of levels.

| Grade | Curriculum coverage to build | Geographic scope and mission ideas |
|---|---|---|
| 4 | Settlements; map symbols, keys, grids and directions; food and farming; water in South Africa | Community plans; provinces and surrounding oceans; compare water sources and farming journeys; world orientation |
| 5 | Africa map skills; South African physical features; weather, climate and vegetation; minerals and mining | Neighbouring countries, atlas journeys, rivers and escarpments, weather observations and resource maps |
| 6 | World map skills, latitude/longitude and scale; trade; world climate/vegetation; population and settlement location | All continents, hemispheres, global trade connections, climate comparisons and settlement investigations |
| 7 | Local mapwork; earthquakes, volcanoes and floods; population growth/change; natural resources/conservation | Route and scale investigations, global hazard cases, South African conservation and population evidence |
| 8 | Maps and globes; climate regions; settlement; transport and trade | Earth/world relationships, global climate comparisons, African and South African settlements, transport networks |
| 9 | Topographic and orthophoto mapwork; development; surface processes; resource use/sustainability | Interpret real map/photo extracts, compare development evidence, investigate erosion and resource decisions |
| 10 | Geographical skills/techniques; atmosphere; geomorphology; population; water resources | Global processes with local/South African applications, mapped evidence and fieldwork-style investigations |

## Grade 10 depth

The Grade 10 path must include more than harder location questions. Planned mapwork covers coordinates in degrees/minutes/seconds; word, ratio and line scales; the South African 1:50,000 map referencing system; conventional signs; 16-point directions; true and magnetic bearings; contours, slopes and simple cross-sections; straight and curved map-to-ground distances; and aerial/orthophoto interpretation.

GIS introduces its purpose, remote sensing and spatial objects, points, lines, nodes and scale. Fieldwork and evidence interpretation link the techniques to atmosphere/heating/moisture/synoptic maps, Earth structure and tectonics/folding/faulting/earthquakes/volcanoes, population distribution/structure/growth/migration, and world water/oceans/South African management/floods. Assessment plans will be checked against the applicable current school requirements before assessment claims are made.

The world overview is equirectangular and is not an equal-distance or equal-area teaching surface. Its pixel distances must never be treated as real ground distances. The practice-town route exercises explicitly define 100 metres between neighbouring square centres. Later measurement work needs appropriate projections, scale metadata and geodesic calculations; real Grade 9–10 topographic/photo lessons need suitable source extracts and publication rights, not enlarged overview polygons.

## Incremental development sequence

1. **v5.0 — Atlas and Map Academy:** accurate bundled world data, functional phone/desktop layout, five finished missions, Explore, saved progress and reliable learning feedback.
2. **v5.1 — South African foundations and Grade 5:** complete the Grade 4 topic path, add geographically accurate provincial content and develop the Africa-focused Grade 5 units. Add richer atlas entries without relocating map geometry.
3. **v5.2 — Grade 6 world expeditions:** latitude/longitude, global climate/vegetation, trade and population. Include all world regions and purposeful map-layer comparisons.
4. **v5.3 — Grade 7 investigations:** local map techniques, natural hazards, population and conservation, with mixed skill revision.
5. **v5.4 — Grade 8 connections:** maps/globes, climate, settlement, transport and trade through comparative world cases.
6. **v5.5 — Grade 9 interpretation:** topographic and orthophoto activities, development, surface processes and sustainability.
7. **v5.6 — Grade 10 geography:** the full topic/technique scope above, applied investigations and increasingly independent evidence-based responses.
8. **Following releases — Classroom use and polish:** teacher assignment/review tools, printable learning summaries, topic revision, language support, optional narration, reviewed cultural/landmark material, richer soundscapes and a world-focused cover. Use a question bank with meaningful variants and spaced topic return.

Every release contains only new/modified files, applies over the previous complete version, preserves existing save records and platform integration, and passes game/regression/build/asset checks before merge. Unsupported future units remain in this roadmap rather than appearing as inactive production buttons.

## Content and learning architecture

- Separate geographic data, coordinate maths, authored curriculum activities, progress/scoring, rendering, input and audio. Each new map surface declares its coordinate system and units.
- Store grade, term, topic, learning objective, source, prerequisites, enrichment status, correct-answer reasoning and misconception feedback per activity. The current `academy-content.js` starts that schema and exposes the Grade 4–10 path catalog.
- Learn through briefing, a usable field note, map interaction, explanation and learner-controlled Continue. Preserve retries, hints and useful feedback; keep timed competition optional in later Challenge mode.
- Award mastery for independent performance, retain the best result per task and revisit weaker topics. Avoid repeated-click score farming, punitive life loss and progress resets after a wrong answer.
- Retain a single mobile viewport, visible task/map, safe areas, large controls, keyboard alternatives, reduced motion and explicit pause/resume around interruptions. Browser/device QA is distinct from input and geometry adapters.

## Curriculum and map sources

- DBE, **CAPS Social Sciences Grades 4–6**, geography overview and Grade 4 map-skills Term 2: https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20IP%20%20SOCIAL%20SCIENCES%20%20WEB.pdf
- DBE, **CAPS Social Sciences Grades 7–9**: https://www.education.gov.za/LinkClick.aspx?fileticket=6jpCz5DCZ08%3D&mid=1629&portalid=0&tabid=573
- DBE, **CAPS Geography Grades 10–12**, Grade 10 scope and techniques, printed pages 17–24: https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20GEOGRAPHY%20_%20GR%2010-12%20_%20WEB_C9A9.pdf
- Natural Earth source, pinned commit, hashes, conversion details and retained-art hashes: `apps/web/public/games/map-master-africa/assets/maps/manifest.json`. Data terms: https://www.naturalearthdata.com/about/terms-of-use/

Sources establish content scope and geographic provenance. These original game activities are not a DBE-endorsed course or an official school assessment.
