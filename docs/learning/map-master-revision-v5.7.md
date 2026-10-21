# Map Master revision and learning polish — v5.7.0

The 84-mission / 504-task Grades 4–10 campaign remains unchanged. This release adds a separate revision record, 56 authored alternate activities, grade/topic summaries and a printable report. It does not add campaign levels or change previous question IDs, XP, stars, unlock rules, geographic data, images or music.

## Learning flow

1. Try campaign tasks. A wrong answer, a hint or a supported correct answer marks its task for further practice. Prior saves seed this list from best results of 50/70 XP and pending attempts/hints; no earlier detailed answer history is invented.
2. Choose a grade and **Practise focus topics**, or **Mixed revision**. A set contains at most six previously tried tasks from unlocked missions. A first-time learner sees an explanation and disabled revision actions until they have tried a task. Unseen or locked content is not introduced through revision.
3. Read evidence, answer using the existing map/native controls, and choose Continue. Hints, retries, map keys, pan/zoom, keyboard input and pause remain available. Revision answers do not award campaign XP, stars or unlocks, or move the campaign cursor.
4. An independent correct revision answer clears that task's current focus flag. A correct answer after a hint/mistake is recorded as supported, leaving it for further practice. This is a practice signal, not a certified assessment of topic mastery.
5. Open **Learning summary** for all-grade totals and a selected grade's topic detail. Use **Print summary** for the same semantic report. Replay an ordinary campaign mission to improve its best campaign result.

One unfinished revision set saves at a time. Resume preserves its completed prefix, current attempts and hint state. Starting a new set replaces that queue, while recorded answers remain in history; the menu states this when a set is pending. Reload after a correct answer resumes at the next item. Unsubmitted form/route/ruler drafts are not restored after reload. Existing pause/resume behaviour and pointer cancellation remain in place.

Mixed practice orders older revision work ahead of more recently revisited tasks and spreads a set across missions where possible. Focus sets first select tasks still needing practice. This is a deterministic practice scheduler, not an AI diagnosis or a scientifically validated spaced-repetition model.

## What the summary means

| Column | Definition |
|---|---|
| Tried | A task with a best campaign result, a saved pending hint/mistake, or recorded answer/hint history |
| On own | Best campaign result of 100 XP; revision does not increase this count |
| Focus | Latest record is a hint, retry or supported answer; without new history, a supported campaign result or pending attempt/hint seeds the flag |
| Tasks revisited | Distinct tasks with a completed revision answer; repeats do not inflate this distinct-task count |

The best-campaign count and current focus flag can both apply to one task: a recent mistake can flag a task whose previous best was independent. An independent revision can clear focus while a 50/70-XP campaign result remains unchanged. The screen and print view explain these different meanings. Topic totals sum to each grade's task total; variants are not counted as extra campaign tasks or marks.

## Alternate activity bank

`revision-variants.js` contains eight alternatives per grade. They change map targets, numerical inputs, evidence or the question being investigated. Each alternative has its own stable ID (`<base>-alternate`); it is linked to one existing base task. The first revision encounter uses the alternative where available, then subsequent completed revisions alternate with the original. The other 448 campaign tasks currently revisit their original activity. Campaign replay always uses the original definitions.

| Grade | Base task IDs with alternatives |
|---|---|
| 4 | s1, d2, g1, r2, w1, pv1, fj1, wa1 |
| 5 | an1, av1, ll1, ld1, ww1, cp1, mt1, mc1 |
| 6 | g6co2, g6sc1, g6tr1, g6cl1, g6pp1, g6sd1, g6ft1, g6rf1 |
| 7 | g7si1, g7rt1, g7ea1, g7hc1, g7pr1, g7wa1, g7fl1, g7lf1 |
| 8 | g8ai2, g8rs1, g8td1, g8mc2, g8uc1, g8cn1, g8so1, g8ht1 |
| 9 | g9ci1, g9ms2, g9oi1, g9di2, g9sc1, g9rr1, g9wf1, g9fs1 |
| 10 | g10ss2, g10bn4, g10gf1, g10pd5, g10ps4, g10cb2, g10as1, g10tl1 |

All 56 alternatives have a different prompt and answer from their base task. Choices are reordered without changing labels/keys. Province answers use the atlas's actual geographic IDs, not display abbreviations. World/province target labels are verified by geographic hit testing. Street alternatives use real open links in the existing fictional plan. The photo alternative targets R in the existing historical USGS image; no ground scale is invented.

Some checked examples:

- New Grade 4 route: 5 × 100 m = 500 m; household savings 20 + 15 = 35 litres.
- Grade 6 coordinates: 30° S, 60° E; a district of 900 people / 30 km² has density 30/km². The highest fictional January profile is E at 31°C, not a continent-wide temperature.
- Grade 7 I→F→C uses two open 200 m links and avoids closed E–F. Natural increase 24−9=15. The Iceland country task has an Iceland 2010 source card rather than the Nepal card.
- Grade 8 6 cm at 1:25000 represents 1500 m; 25°15′ S / 30°45′ E is `[-1515,1845]` when read latitude first in angular minutes. The internal answer pair is `[1845,-1515]` (longitude first). July's existing climate temperature is 13°C; its 90 mm rainfall is a separate quantity. 750/1250 = 60% urban; wait 4 + ride 8 = 12 minutes.
- Grade 9 D↔G is 2000 m; 160−100=60 m elevation difference; sediment reduction (200−60)/200=70%; stock 700+90−110=680 units.
- Grade 10 new DMS point is 10°20′30″ N, 40°05′45″ W: internal signed arcseconds `[-144345,37230]`. Fictional true 120° minus east declination 8° gives magnetic 112°. The monitoring shortlist requires low flood risk AND protected land AND road distance ≤120 m: only C meets all three (110 m). Population change 36−11+20−5=40; working-age share 1200/2000=60%; catchment storage 110−60−30=20 mm.

Numbers and trials are labelled fictional. Geographic references use the existing Natural Earth atlas and provincial notes. Dated Iceland material reuses the primary NASA reference verified for the earlier hazard cases. Other source and curriculum scope remain those documented in the Grade 4–10 learning notes. These original activities support practice and do not constitute a complete course or official assessment.

## Storage and compatibility

The campaign retains its existing version-2 record and keys:

- `wga_map_master_world_progress_v1`
- `wga_map_master_world_settings_v1`
- `wga_map_master_africa_explorer_best_v1`

New key **`wga_map_master_world_learning_v1`** stores schema version 1, known-question history, bounded local ordering counters and one revision session. It contains no learner name, class identifier, contact details or server upload. It is local to the browser and is not cross-device synchronisation. Unknown IDs/statuses, impossible session prefixes, oversized/duplicate queues, mismatched missions and unknown variants are rejected; inaccessible or untried items cannot resume. Denied/malformed storage retains usable in-memory practice and an honest storage notice.

The exact normalised 84-mission hash remains `37cb6fb6ba7c05161b83f2928b5bddcd44265163cdb2b92823217789f35e52d0`. Automated runs revise all 504 supported tasks, including all 56 alternatives, while retaining the exact campaign save bytes, cursor, XP, stars, unlocks and legacy best.

## Limits and next work

Physical iOS/Android and learner-group testing remain with release playtesting. Best-result summaries cannot reconstruct every pre-release mistake or demonstrate independent fieldwork mastery. Teacher accounts, class assignment/review, cloud progress, additional languages/narration, expanded variants, licensed South African map/photo extracts and deeper synoptic/GIS investigations remain optional future phases. No new curriculum-certification claim is made.
