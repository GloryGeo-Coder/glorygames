# Grade 9 Interpretation — v5.5.0

Twelve original missions add 72 tasks: 68 missions / 408 tasks across Grades 4–9. Each grade starts independently, with sequential unlocking within its own path. Grade 10 remains planned. These activities support topic practice; they are not a complete course, a prescribed school project or an official assessment.

| Term | Mission | Practice objective |
|---|---|---|
| 1 | The Contour Investigation | Equal-height lines, contour interval, relative slope, spot height, valleys and spurs |
| 1 | The Map Measurement Desk | Natural/constructed features, two endpoints, straight distance, local coordinates, 1:50000 and 1:10000 paper scales |
| 1 | The Image Interpretation Lab | Real historical orthoimage observations, orthorectification, height information and source limits |
| 2 | Beyond One Development Number | Health, education, living standard, HDI and the limits of averages |
| 2 | The Development Connections Desk | History, trade, technology, health, education and conflict as interacting influences |
| 2 | The Community Proposal Review | Budget arithmetic, participation, maintenance and social/economic/environmental outcomes |
| 3 | The Weathering Field Lab | Physical, chemical and biological weathering; change in place versus transport |
| 3 | The Moving Landscape Files | River, coastal, ice and wind erosion/deposition and evidence interpretation |
| 3 | The Soil-Cover Investigation | Controlled comparisons, sediment loss, percentage reduction and cautious conclusions |
| 4 | The Resource Renewal Ledger | Renewable/non-renewable resources, simplified stock change, fishing and grazing pressure |
| 4 | The Food-System Review | Availability, access, use/stability; compare production methods and appropriate technologies |
| 4 | The Evidence and Futures Council | Mixed measurements, indicators, material recovery and evidence-based resource choices |

## Curriculum and primary references

- DBE, **CAPS Social Sciences Grades 7–9**, Grade 9 geography, printed pages 29–32 / PDF pages 33–36: https://www.education.gov.za/LinkClick.aspx?fileticket=6jpCz5DCZ08%3D&mid=1629&portalid=0&tabid=573
- USGS National Geospatial Program, **OrthoImage layer in a US Topo Map of Washington, D.C.**, page published 14 April 2014; public domain; credit Kristin A. Fishburn: https://www.usgs.gov/media/images/orthoimage-layer-a-us-topo-map-washington-dc
- USGS, **What is a digital orthophoto quadrangle or orthoimage?**: https://www.usgs.gov/faqs/what-a-digital-orthophoto-quadrangle-doq-or-orthoimage
- USGS, **Aerial Photograph vs. Orthoimage**, correction of camera/terrain displacement: https://www.usgs.gov/media/images/aerial-photograph-vs-orthoimage
- UNDP, **Human Development Index**, dimensions, indicators and limitations: https://hdr.undp.org/data-center/human-development-index

The CAPS reference establishes topic scope rather than a current assessment schedule. Its older HDI description refers to per-capita GDP; current UNDP methodology uses GNI per capita adjusted for purchasing power, alongside life expectancy and mean/expected schooling years. The game makes that distinction explicit instead of treating GDP and GNI as interchangeable. It does not calculate a real country's HDI or publish changing country rankings.

The bundled contour plan is an original fictional teaching surface, not an official South African sheet. The real image is a separate US example, not a photo of that plan or a South African 1:10000 orthophoto. Paper-scale exercises teach both series using supplied measurements. Licensed South African national map/photo extracts, a real-country HDI thematic layer, local erosion field cases and extended independent investigation remain future content. The release does not claim these as complete.

## Metric teaching map

`interpretation-lab.js` declares a flat local metre system: eastings increase right; northings increase up. Screen y runs down, so local northing is 3000 − y. The grid interval is 1000 m. Five nested ellipses mark 100, 120, 140, 160 and 180 m above a common height datum. The summit spot height H is 192 m. The inner contours are geometrically contained by their outer neighbours; equal height increments have consistently smaller east-side than west-side horizontal spacing, supporting the slope comparison.

| Target | Feature | Local easting · m | Local northing · m |
|---|---|---:|---:|
| A | Western slope | 700 | 1800 |
| B | Eastern slope | 2375 | 1800 |
| C | West road junction | 500 | 500 |
| D | School | 1500 | 500 |
| E | Woodland | 3100 | 2350 |
| F | River | 3500 | 1500 |
| G | Bridge | 3500 | 500 |
| H | Spot height 192 m | 1680 | 1800 |

The line bar uses the same transform as the plan and resizes with zoom. C–G is 3000 m; D–G is 2000 m. These are straight distances, not terrain-adjusted walking lengths. The fictional map supports these measurements independently of the world overview projection. At 1:50000, a supplied paper length of 4 cm represents 2000 m; at 1:10000 it represents 400 m. Learners must not measure physical screen centimetres.

New `map-feature` tasks accept a selected feature ID. New `map-measure` tasks require two distinct specified endpoints in either order and explicit **Check measurement**. Editing, replacing endpoints, resetting, pan, zoom and map-key reference are unscored. Unknown points, duplicate endpoints, malformed arrays and photo coordinates cannot satisfy a measurement. Native labelled buttons and SVG keyboard focus provide alternatives to touch targets. Arrow keys move between feature targets; Enter selects. Drag/pinch/cancel never adds an endpoint.

Draft endpoints survive pause/resume within the tab. Reload resets an unsubmitted draft while preserving task position, hints and attempts. Hints can show the relevant feature/endpoints but do not submit. Wrong pairs remain recoverable and best-only XP prevents repeated submission farming. On small displays, an in-map north arrow, fictional label and line bar replace caption overlays so height/scale labels stay readable.

The valley/spur comparison is a separate schematic. Its valley contour Vs point upstream, opposite the river-flow arrow. Spur bends point downslope. Matching text/table information avoids relying on colour alone; the diagram is not attributed to an actual landform.

## Real historical image

`assets/learning/usgs-washington-ortho.jpg` is the publisher's full-width rendition, bundled without byte changes: **1336 × 692 pixels, 226034 bytes**, SHA-256 `a514d937045840ac992f0fc5ed49973649cc5a12956f7695a094cffe09f5bf89`. The adjacent manifest records its exact source URL, public-domain status, credit and retrieval date. Original P–S observation labels are drawn separately by SVG.

The source page's publication date is not inferred to be the capture date. The web rendition has no supplied ground georeferencing/scale, so its pixel coordinates are used only to place observation targets. No north direction or ground measurement is asserted. P shows a broad water channel; Q a river crossing; R dense street/building blocks; S tree cover. These visible features do not establish current land use, residents' incomes or building heights. Orthophoto-map elevation work explains added contours and spot heights rather than reading height from image tone.

## Practice evidence and arithmetic

Development profiles A/B, budgets, soil plots, fish stocks and water-use records are explicitly fictional. No national statistics, real fares, procurement costs, fishing quotas or stocking recommendations are invented.

- Life expectancy comparison: 74 − 66 = 8 years. Supplied HDI values 0.80 and 0.65 share a 0–1 graph axis. Averages need distribution and contextual evidence.
- Community budget: 40 + 25 = 65 credits; 100 − 65 = 35 credits remain for 20 + 15 credits of other work.
- Equal-area soil trial: 200 − 60 = 140 kg less sediment; 140 / 200 × 100 = 70% reduction relative to the bare plot. Other test conditions are held similar; one trial does not predict every farm/storm.
- Simplified fish ledger: 1000 + 120 − 150 = 970 tonnes; 1000 + 120 − 100 = 1020 tonnes. Real population dynamics require more evidence.
- Water-use difference: 5000 − 4000 = 1000 litres per comparable period. The numbers alone do not establish every cause.

Food-system activities compare availability, access, suitable use and stability. Livestock/crop methods are assessed through specific evidence and social, economic, environmental, health-management and welfare trade-offs rather than blanket claims. Resource activities connect waste reduction, repair, reuse and recovery while acknowledging that recycling also needs infrastructure, energy and water.

All first 56 mission definitions are protected by a pinned hash. Save keys/format, prior progress and preferences, all 39 original PNGs, world/province geometry, scores/chat and the dedicated game tab are preserved. Twelve additional music roots serve Grade 9; earlier themes and separate music/effects controls remain intact.
