# Grade 8 Connections — v5.4.0

Twelve original missions add 72 tasks: 56 missions / 336 tasks across Grades 4–8. Each grade starts independently and unlocks sequentially within its path. Grades 9–10 remain planned. These activities practise the four Grade 8 CAPS geography topic areas; they are not a complete course, prescribed fieldwork project or official assessment.

| Term | Mission | Practice objective |
|---|---|---|
| 1 | The Minute-Precision Atlas | Atlas index; latitude/longitude in degrees, angular minutes and hemispheres |
| 1 | The Scale Survey Office | Ratio, word and line scale; same-unit conversion; overview-map limitations |
| 1 | The World-Time Dispatch | Rotation; idealised longitude/time relationship; UTC, SAST and date changes |
| 1 | The Sunlight Observation Lab | Axial tilt, solstices/equinoxes; satellite evidence and vertical/oblique views |
| 2 | The Climate Factor Files | Latitude, sea, altitude, ocean currents and relief; weather vs climate |
| 2 | The Twelve-Month Climate Notebook | Monthly temperature line and rainfall bars; units, range and winter-rainfall pattern |
| 2 | The World Climate Passport | Seven climate-region summaries; similarities, contrasts and variation |
| 3 | The Settlement Survey Team | Urban services, recreation, industry; rural functions; respectful field evidence |
| 3 | The Urban Change Council | Urban proportions; push/pull influences; apartheid controls and service access |
| 4 | The Harbour Connection | Durban province/location; cargo types; sea, road, rail, air and pipeline links |
| 4 | The Commuter Network Workshop | Whole-trip fare/time, accessibility and open routes with a via-point requirement |
| 4 | The Connections Council | Mixed coordinate, scale, climate, settlement and transport evidence |

## Scope and primary references

- DBE, **CAPS Social Sciences Grades 7–9**, Grade 8 geography, printed pages 25–28 / PDF pages 29–32: https://www.education.gov.za/LinkClick.aspx?fileticket=6jpCz5DCZ08%3D&mid=1629&portalid=0&tabid=573
- NASA Space Place, **What Causes the Seasons?**: https://spaceplace.nasa.gov/seasons/en/
- NOAA, **Changing seasons**, axial tilt and revolution: https://www.noaa.gov/education/resource-collections/climate/changing-seasons
- NMISA, **South African Standard Time**, SAST defined as UTC + 2 hours: https://time.nmisa.org/time/
- South African Government Gazette, **Measurement Units and Measurement Standards Act notice**, 19 October 2018, definition of SAST: https://www.gov.za/sites/default/files/gcis_document/201810/41982gen1131.pdf

The CAPS reference establishes topic scope, not a claim of complete coverage or current school assessment scheduling. The source links are optional reference material; gameplay needs no network requests beyond the bundled game. Satellite/aerial activities teach interpretation principles without supplying a real image extract. A national transport-route map, real monthly station datasets, regional climate polygons, an independent settlement project and a full harbour economic case remain future content. The fictional profile resembles winter rainfall but is not presented as Cape Town measurements. The harbour activity provides introductory transport-mode practice, not changing throughput figures or operational advice.

## Exact coordinates and explicit answers

New `dm-coordinate` questions store `[longitude, latitude]` as integer angular minutes, avoiding floating-point conversion in answer judging. For example, Cedar is 30°30′ S, 20°15′ E: `[1215, -1830]`. Each axis has labelled degree, minute and hemisphere controls. Degrees are 0–90 for latitude and 0–180 for longitude; minutes are 0–59, with zero minutes required at the terminal degree. Zero latitude works with N or S. The world marker converts angular minutes to degrees solely as an approximate preview on the unchanged overview map; tapping/dragging never fills or submits these precision coordinates.

All six parts are required. Only **Check coordinates** submits; editing is unscored. Native controls preserve keyboard/phone access. Hints, wrong-answer recovery, feedback continuation and best-only XP follow the existing engine. A numeric task accepts a finite plain decimal number, supports decimal point or comma and displays its expected unit. Blank, non-finite, scientific-notation, unit-suffixed and malformed entries do not submit. Numeric comparisons use a 1e-7 tolerance; units are never silently converted.

Unsubmitted form drafts are not saved as mastery. A reload or explicit resume may clear the form while retaining task position, hints and attempts. No save key or format is changed. A pinned hash protects all first 44 mission definitions, and a v5.3-shaped record verifies prior results, stars, resume cursor, hint/attempt state, legacy best and audio settings.

## Scale and clocks

Ratio-scale questions provide **paper-map lengths** in centimetres; learners must not measure physical centimetres on a resized display. At 1:25000, 4 cm represents 1000 m and 8 cm represents 2000 m. At 1:50000, 6 cm represents 3 km. At 1:10000000, 2 cm represents 200 km. These supplied values are independent of the world overview and its projection. Existing fictional grid/route line bars still resize with their own maps.

The clock exercises state their offsets explicitly. Monday 22:30 UTC corresponds to Tuesday 00:30 SAST, Tuesday 07:30 at the supplied UTC +9 station, and Monday 17:30 at the supplied UTC −5 station. These stations are invented, not live city clocks. 360° / 24 hours = 15° per hour is an idealised explanation, not a claim that actual time-zone boundaries follow perfect meridian strips. Westward date-line crossing adds a calendar day; eastward subtracts one. The time helper also checks backward rollover across midnight.

## Graphics, evidence and arithmetic

The solstice diagram puts Earth on opposite sides of the Sun with both axes pointing in the same direction. June/December controls highlight the corresponding position and announce hemispheric seasons; Equinoxes explains approximately equal day/night without pretending the solstice picture represents an equinox. The diagram is explicitly not to scale and does not animate an axis reversal. Its text/table remains authoritative and accessible. The comparison itself awards no XP.

Twelve-month temperature and rainfall data appear in separate graph panels with independent °C and mm units and zero baselines. Every value is repeated in a semantic table. Labels Jan/Apr/Jul/Oct/Dec keep the compact graph legible; all months appear in the table. Monthly mean temperature ranges from 13 to 24 °C (range 11 °C); June is the wettest month at 100 mm; July has 90 mm. These invented monthly averages cannot forecast tomorrow’s weather.

The fictional urban share changes from 4000/10000 = 40% to 6000/12000 = 50%. The commuter comparison saves 30 − 12 = 18 fare credits at a time cost of 35 − 25 = 10 minutes. It is not a real fare table. Both open E-to-F detours work within 600 m; D-to-C via E requires an open three-link route such as D–E–B–C. Neither fictional plan is attributed to real Durban streets.

The unchanged Natural Earth world/province data, all 39 PNG assets, platform scores/chat, full-viewport game tab, grade unlocking and previous audio roots remain intact. Twelve additional quiet music roots serve Grade 8; music/effects settings remain separate.
