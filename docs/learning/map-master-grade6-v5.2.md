# Grade 6 World Expeditions — v5.2.0

Twelve original missions add 72 tasks, six per mission. They support practice across the four Grade 6 CAPS geography topic areas. They are not a complete school course, prescribed assessment or DBE-endorsed product. Grades 4 and 5 remain playable; Grades 7–10 remain planned. Grade 6 can be started independently, with sequential unlocking inside the grade.

| Term | Mission | Practice objective |
|---|---|---|
| 1 | The Coordinate Courier | Latitude/longitude in degrees; Equator, Greenwich and hemispheres |
| 1 | Six Continents, One Atlas | World atlas information; countries and continental regions |
| 1 | The Survey Team’s Scale | Word and line scales; straight sections and a combined road distance |
| 2 | The Harbour Exchange | Goods/services; imports/exports from a stated country’s perspective |
| 2 | From Cocoa to Chocolate | Raw materials, manufacturing, transport and value; value is not profit |
| 2 | A Fairer Trading Table | Payment, safety, participation and checking trade claims |
| 3 | Two Months, One World | January/July temperatures, annual rainfall and climate versus weather |
| 3 | Under the Rainforest Canopy | Warm/wet profiles, habitats, forest use and community evidence |
| 3 | Beyond the Green Canopy | Deserts, coniferous forests, climate and selected adaptations |
| 4 | People on the Map | Distribution versus density; population/area comparisons and units |
| 4 | Why Here? Why Move? | Natural/human settlement factors, movement and historical restrictions |
| 4 | The World Expedition Desk | Mixed coordinates, trade, vegetation, settlement and source evaluation |

## Curriculum references

- DBE, **CAPS Social Sciences Grades 4–6**, Grade 6 geography topic framework: https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20IP%20%20SOCIAL%20SCIENCES%20%20WEB.pdf
- DBE, **2023/24 Annual Teaching Plans: Social Sciences (Geography), Grade 6**, geography terms 1–4 on the first four pages: https://www.education.gov.za/LinkClick.aspx?fileticket=VMQ-dE3bV3E%3D&mid=10744&portalid=0&tabid=3207

The ATP was used to clarify topic scope, including **word and line scales only** at this stage. It is not represented as a 2026 assessment plan. Degree/minute/second coordinates, ratio scale calculations, real topographic extracts and GIS remain later-grade work.

## Geographic and evidence integrity

The real world and province geometry and all 39 existing PNGs are unchanged. Countries/territories retain their source outlines, holes and islands. The world overview is equirectangular; its screen distances and polygon areas are never used as ground distances or areas.

Coordinate answers store `[longitude, latitude]` internally; the learner-facing controls deliberately present **latitude first, longitude second**, with N/S/E/W and zero labels. Practice targets are 30-degree intersections, not exact city or weather-station coordinates. Map tapping previews a point; a separate Check point action submits it. Keyboard users can use native selects, or pan the map and preview its centre with Enter. Drag, pinch and cancellation never submit.

The survey plan is a separate fictional Cartesian surface in kilometres: A=(10,45), B=(50,45), C=(50,15). Grid lines are 10 km apart. A–B is 40 km, B–C is 30 km and the combined road route is 70 km. The 0–20 km line bar has the same coordinate transform as the plan and scales with it. A separate *printed* word-scale example explicitly supplies its 3 cm measurement; no device centimetres are assumed.

The seven world comparison points A–G use **fictional practice profiles**, clearly labelled at the controls and in tables. They are not station measurements, country averages or complete climate-region polygons. January/July means, annual rainfall and vegetation can be compared without changing country geometry or continental fill colours. Each point has a stable letter and a matching text-table row; numeric values and vegetation labels ensure colour is not the only source of information. Free exploration awards no mastery XP.

Other records—shipments, invented value units, contracts, monthly profiles, districts and settlement cases—are labelled fictional at point of use. Monthly rainforest data cover four selected months and are never summed into an invented annual total. District densities are internally consistent: 1200/10=120, 2400/40=60 and 600/20=30 people/km². Settlement activities acknowledge apartheid’s forced residential restrictions without treating one factor as a universal explanation or judging rural communities as inferior.

## Compatibility

Append-only mission order preserves all first 20 definitions; a pinned SHA-256 regression check protects that boundary. The version-2 save format and all three storage keys remain unchanged. A real v5.1-shaped record is tested for best results, stars, cursor, attempts, hints, preferences and legacy score retention. Only Grade 6’s first mission is newly available; later missions require completion. Existing score/chat/fullscreen integration is retained.
