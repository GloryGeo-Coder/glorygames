# Grade 7 Investigations — v5.3.0

Twelve original missions add 72 tasks, bringing Grades 4–7 to 44 missions / 264 tasks. Each grade can start independently and unlocks later missions within its own path. These activities practise the four Grade 7 CAPS geography topic areas; they are not a complete course, prescribed school project or official assessment. Grades 8–10 remain planned.

| Term | Mission | Practice objective |
|---|---|---|
| 1 | The Neighbourhood Street Guide | Street index, junction/grid references and eight-point directions |
| 1 | The Route Planning Desk | Connected routes, indirect distance, open crossings and word/line scale |
| 1 | A Map Worth Trusting | Sketch maps, land-use/vegetation observations, orientation and source quality |
| 2 | Beneath Our Feet | Crust, mantle, core, plates and earthquake/volcano processes |
| 2 | The Hazard Casefiles | Locate Nepal/Iceland; dated earthquake and eruption evidence; risk factors |
| 2 | When the Roads Disconnect | KwaZulu-Natal’s 2022 floods, runoff, infrastructure and a separate fictional planning exercise |
| 3 | The Population Notebook | Birth rates, natural increase, net migration, infant mortality and life expectancy |
| 3 | A World in the Graph | World population milestone line graph, dates, units and interpretation limits |
| 3 | Lives Behind the Numbers | Survival, family circumstances, conflict, movement and contextual evidence |
| 4 | The Catchment Resource Audit | Water users, pie charts, weekly readings, resource care and causal limits |
| 4 | Coast and Wetland Partners | Marine conservation, community participation, tourism and catchment care |
| 4 | The Investigation Council | Mixed maps, historical cases, graphs, conservation and evidence evaluation |

## Curriculum scope

- DBE, **CAPS Social Sciences Grades 7–9**, printed pages 21–24 / PDF pages 25–28, Grade 7 geography terms 1–4: https://www.education.gov.za/LinkClick.aspx?fileticket=6jpCz5DCZ08%3D&mid=1629&portalid=0&tabid=573
- DBE, **2023/24 Annual Teaching Plans: Social Sciences (Geography), Grade 7**: https://www.education.gov.za/LinkClick.aspx?fileticket=Cu29vSoUCBs%3D&mid=10747&portalid=0&tabid=3208

References establish topic scope. The older ATP is not presented as a 2026 assessment schedule. Detailed faulting, ratio-scale calculations, actual topographic/orthophoto extracts and advanced GIS remain later-grade work. The Earth cutaway is a schematic with exaggerated layer proportions, not a geographic plate-boundary map. Real plate geometry and an independent learner sketch-map project are not claimed as implemented in this increment.

## Street plan and route judging

`field-lab.js` defines nine junctions in a 3×3 grid, 200 metres apart horizontally and vertically. A/B/C are the northern row; D/E/F the middle; G/H/I the southern row. The column/row index gives references A1–C3. E–F is closed, while B–C and H–I are open crossings in this invented scenario. Every shown street section measures exactly 200 metres in the declared local coordinate system. The line bar uses the same transform and zooms with the plan; world overview pixels are never treated as ground distances.

Learners tap junctions or use nine accessible native buttons. A draft starts at the stated junction, accepts only neighbouring open links and reports its total distance. Undo and Start again edit freely. Only Check route submits an answer. Scoring accepts any connected route meeting the stated start, destination and distance limit; it does not require the authored example path. E–B–C–F and E–H–I–F both solve the 600 m E-to-F task. A–B–E and A–D–E both solve the 400 m A-to-E task. Drag/pinch/cancel do not append or submit a route.

Drafts survive pause/resume in the same tab. An unsubmitted draft is not saved as mastery; reload restarts that draft while preserving its task cursor, hints and attempts. Existing progress/save keys and format remain unchanged. A pinned hash protects all first 32 mission definitions, and an old v5.2-shaped record is checked for results, stars, cursor, attempts, hints, legacy score and preferences.

On compact layouts the map keeps clear junction letters, grid axes, river, closure mark and distance bar; full place names remain in buttons, the index and Map key. Roomier layouts also show place/road labels on the plan. Zoom controls remain beside the SVG and cannot cover its targets.

## Primary factual sources

- USGS, **Are the tectonic plates floating on magma?**: https://www.usgs.gov/faqs/are-tectonic-plates-floating-magma
- USGS, **Inside the Earth** and **What is a tectonic plate?**: https://pubs.usgs.gov/gip/dynamic/inside.html and https://pubs.usgs.gov/gip/dynamic/tectonic.html
- USGS, **Magnitude 7.8 Earthquake in Nepal Aftershocks**, May 2015: https://www.usgs.gov/news/featured-story/magnitude-78-earthquake-nepal-aftershocks
- NASA Earth Observatory, **Eruption of Eyjafjallajökull Volcano, Iceland**, May 2010: https://science.nasa.gov/earth/earth-observatory/eruption-of-eyjafjallajokull-volcano-iceland-43968/
- South African Government, **Declaration of a national state of disaster to respond to widespread flooding**, 18 April 2022: https://www.gov.za/news/speeches/president-cyril-ramaphosa-declaration-national-state-disaster-respond-widespread
- UNECE, **8 billion reasons to redouble our efforts**, 2022: https://unece.org/general-unece/news/8-billion-reasons-redouble-our-efforts
- SANParks, **Marine Protected Areas** and **Robben Island MPA**: https://www.sanparks.org/conservation/marine-protected-areas/overview and https://www.sanparks.org/conservation/marine-protected-areas/robben-island-mpa

Historical case cards include publisher/date links at point of use. No changing casualty counts, live warnings or current permit advice are taught. Approximate population milestones—1987/5 billion, 1999/6, 2011/7 and 2022/8—are explicitly historical UN milestone years reported by UNECE, not exact annual census totals. The graph’s x spacing follows actual year gaps; its y axis begins at zero. The line connects only selected milestones and is not used to forecast the future.

## Invented evidence and graphs

The street plan, bridge inspections, district register, community water use/allocation and wetland partnership are original fictional records, labelled at point of use. The real 2022 floods are never represented as the source of the invented streets or bridge statuses. The fictional 60/25/15 water allocation is explicitly not a national South African statistic. Charts appear before longer notes on compact layouts and always retain matching semantic tables and units.

The district arithmetic is internally consistent: births 250 minus deaths 100 = natural increase 150; arrivals 120 minus departures 70 = net migration 50; total change 200. Its stated reference population 10,000 gives a birth rate of 25 per 1,000 per year. Infant mortality instead uses live births as its denominator. Weekly water readings are 1000, 900, 750 and 700 litres, a first-to-last reduction of 300 litres. The readings alone are not treated as proof of every causal effect.
