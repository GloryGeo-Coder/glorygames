# Map Master Grade 10 — v5.6.0

Sixteen missions / 96 tasks introduce map skills and the four Grade 10 Geography topic areas. Together with the preserved Grades 4–9, the game contains 84 missions / 504 tasks. Grade 10 starts independently and unlocks within its own path. Each mission has six tasks, a briefing, explanations, learner-controlled feedback, hints and a badge.

These are original topic-practice activities guided by South African CAPS, not a complete school course, official assessment or DBE endorsement. Numeric evidence is fictional unless a dated historical case is explicitly identified. No observed population, weather, health or water-allocation dataset is invented.

## Mission and objective matrix

| Term | Mission | Practised objectives and evidence |
|---|---|---|
| 1 | The Seconds and Sheets Desk | Exact degrees/minutes/seconds, hemispheres, original 3318 angular index and precision versus source accuracy |
| 1 | The Atmosphere Reference Station | Atmospheric composition/layers, protective stratospheric ozone, ozone depletion and greenhouse distinctions |
| 1 | The Earth Energy Investigation | Insolation, reflection/albedo, heat transfer, outgoing infrared radiation, climate evidence and local adaptation |
| 1 | The Moisture and Weather Desk | Dew point, rainfall mechanisms and a labelled fictional station plot with wind direction/speed, cloud and full pressure |
| 2 | The Bearing Navigation Desk | 16-point compass, clockwise bearings, true/magnetic conversion, back bearings and supplied 1:50000 paper-scale arithmetic |
| 2 | The Earth and Rock-Cycle Cabinet | Rock formation, dykes/sills and the solid/liquid state of Earth layers; the existing cutaway is schematic |
| 2 | The Tectonic Landform Files | Divergent/convergent/transform boundaries, movement evidence, compression/folding and extension/normal faults |
| 2 | The Hazard Evidence Briefing | Dated Nepal 2015 and Iceland 2010 cases, magnitude/intensity, exposure, vulnerability and realistic preparedness |
| 3 | The GIS and Fieldwork Desk | Free inspection of flood/protected/road layers, multi-criterion selection, object types, remote sensing, projection/date checks and field records |
| 3 | The Population Distribution Desk | Fictional density, distribution, natural increase, net migration and combined annual change |
| 3 | The Population Structure Lab | Mirrored age-sex diagram, counts, conventional age bands, dependent-age share and limits of employment/growth inference |
| 3 | The Movement and Health Access Brief | Push/pull and forced movement, non-stereotyping, HIV/AIDS distinction, care access and privacy of aggregated data |
| 4 | The Terrain Profile Survey | Exact crossings of the existing metric contours, spot height, distance, unequal display scales, slope comparison and supplied curved sections |
| 4 | The World Water Connections Desk | Oceans, freshwater stores, circulation, availability and groundwater renewal limits |
| 4 | The Catchment Balance Lab | Explicit 100 mm accounting, runoff/storage arithmetic, infiltration, sealed surfaces, pollution and wetland limits |
| 4 | The Geography and Water Council | Fictional water allocations and savings, dated KwaZulu-Natal 2022 flood evidence, planning and evidence-based recommendations |

Mission IDs are stable, appended at indices 68–83 in `academy-grade10.js`. The content schema records grade, term, source, objective, scope and same-grade prerequisite. The game metadata, menu and information page advertise all seven available paths.

## Exact map and diagram models

- DMS answers are `[longitude, latitude]` in signed integer arcseconds. Cedar is `[66015, -121830]`, Beacon `[101440, -92720]`, Delta `[-108945, 0]`. The UI presents latitude first with eight native controls. Blank parts, minutes/seconds outside 0–59 and non-zero minutes/seconds at 90° latitude or 180° longitude cannot submit. Zero latitude accepts either hemisphere. The world marker is explicitly approximate; entered seconds are checked exactly. Drafts do not award XP; an explicit Check is required.
- The original index divides a 33–34° S / 18–19° E degree block into NW A, NE B, SW C, SE D, then repeats within each quadrant. Cedar lies in 3318CD. The final cells span 15 angular minutes, not equal metric distances. The index is an original teaching diagram, not a scanned national sheet or a national coverage lookup.
- Bearings run clockwise from north on the metric plan (`x` east, `y` south). C→G is 90°. ESE is 112.5°, WNW 292.5°. The explicitly fictional example true 80° with 6° west declination yields magnetic 86° because magnetic = true − east declination. The inspector changes no score or hint state. It is not a current real-place declination calculator.
- GIS uses local metres: A=(50,40), B=(150,100), C=(250,140), road y=250. Perpendicular road distances are 210, 150 and 110 m. A is high flood risk, C protected; only B meets low risk AND outside protected land AND within 200 m. The diagram and table agree; toggling visibility never removes the attribute table or answers a task. The model is not planning permission.
- X–Z follows y=1200 from x=200 to 2600 on the preserved fictional hill. At distances 0, 350, 700, 1000, 1270, 1480, 1690, 1900, 2100, 2250, 2400 m, heights are 100, 120, 140, 160, 180, 192, 180, 160, 140, 120, 100 m. Every contour crossing and summit matches the original plan. X–summit spans 1480 m; summit–Z spans 920 m for the same fall, so the east side is steeper. Horizontal positions are proportional to distance; the vertical scale is explicitly exaggerated. This is sampled geometry, not a surveyed terrain model. A separate curved paper-route record supplies 1200+800+600=2600 m.
- The simplified station plot uses 21°C, dew point 16°C, full pressure 1012 hPa, half cloud (4/8), wind FROM NW (315°) and one full 10-knot plus one half 5-knot barb. It is explicitly fictional, with full units; operational station plots often encode pressure differently. It is not a live forecast or a full synoptic chart.
- The age-sex diagram has three broad bands, not five-year census bins: male/female 300/300 at 0–14, 600/600 at 15–64, 100/100 at 65+, totalling 2000. Conventional dependent-age share is 800/2000=40%, not the dependency ratio. Age bands alone do not establish actual employment or guarantee growth.
- The fictional district starts with 2000 people in 10 km²: density 200/km², natural increase 50−20=30, net migration 30−10=20, total change +50. The water balance allocates 100 mm rainfall to 50 evapotranspiration +35 runoff +15 storage increase. Water allocation is 80+90+30=200 units; homes receive 40%, agriculture 45%. Saving 5000→4000 litres over comparable periods is a 20% reduction. These figures are not South African national statistics.

All graphical evidence has a matching semantic table and an accessible label. Native compass/profile selects and GIS layer buttons are free inspection controls; only answer controls submit tasks. Source links open safely in a separate tab. Existing pause, reduced motion, hints, retries, best-only XP, score bridge, independent grade paths and browser save keys/format are retained.

## Primary references

- [DBE CAPS Geography Grades 10–12](https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20GEOGRAPHY%20_%20GR%2010-12%20_%20WEB_C9A9.pdf), Grade 10 overview printed pp17–18, techniques pp19–20 and Terms 1–4 pp21,23,25,26. Defines topic scope; it does not endorse this game.
- [DBE Mind the Gap Geography, 2014](https://www.education.gov.za/Portals/0/Documents/Manuals/3b%20MTG%20Geog%20EN%2018%20Sept%202014.pdf), chapter 5 printed pp124–125: South African sheet-index convention. This Grade 12 manual is used only to verify the shared map-reference convention; Grade 10 scope comes from CAPS.
- [NOAA surface weather plots](https://www.noaa.gov/jetstream/wxmaps-max): wind direction from the station, barb units and cloud fractions. The game uses an original simplified observation with explicit °C and full hPa.
- [NASA climate evidence](https://science.nasa.gov/climate-change/evidence/): evidence for warming and greenhouse mechanisms. No changing annual temperature statistic is used.
- [USGS water on Earth](https://www.usgs.gov/special-topics/water-science-school/science/how-much-water-there-earth): water stores and availability distinctions. No invented observed percentages are presented.
- [WHO HIV and AIDS](https://www.who.int/news-room/fact-sheets/detail/hiv-aids): HIV/AIDS distinction and the role of effective prevention, diagnosis, treatment and care. Geographic access/privacy practice only, with no individual diagnosis or treatment advice.
- [USGS Nepal earthquake, 2015](https://www.usgs.gov/news/featured-story/magnitude-78-earthquake-nepal-aftershocks), [NASA Iceland eruption, 2010](https://science.nasa.gov/earth/earth-observatory/eruption-of-eyjafjallajokull-volcano-iceland-43968/) and [South African Government KwaZulu-Natal floods, 2022](https://www.gov.za/news/speeches/president-cyril-ramaphosa-declaration-national-state-disaster-respond-widespread): historical cases, not current warnings.

## Remaining depth

All grades now have playable practice, but independent investigations, expanded misconception/variant banks, full synoptic maps, detailed intrusion/fault diagrams, licensed South African 1:50000 and 1:10000 extracts, advanced image/GIS work and classroom assessment/review remain future work. A supplied answer in an evidence table is a supported learning activity, not evidence of independent fieldwork mastery. Curriculum/assessment claims should be reviewed before adding teacher certification or official-assessment language.
