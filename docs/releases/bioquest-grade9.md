# BioQuest Grade 9: Cells and body systems

Five new missions and 15 investigations bring the game to 30 missions and 90 investigations across six independent Grades 4–9 paths. Nala remains the female explorer and Pip her drone companion.

## Selected coverage

The Cell Discovery Lab covers cell structures, plant/animal comparisons and observations. The Body Systems Hub links cells, tissues, organs and systems. The Oxygen Journey distinguishes breathing, gas exchange, circulation and cellular respiration, including pulmonary-vessel exceptions. The Digestive Trail covers the alimentary canal, digestion, absorption and villi. Life Continues introduces reproductive structures, fertilisation, early development and variation in puberty timing.

Sources reviewed 7 November 2026:
- [DBE CAPS Natural Sciences Grades 7–9](https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20SP%20%20NATURAL%20SCIENCES%20GR%207-9%20%20WEB.pdf), Grade 9 Life and Living, printed pages 56–64.
- [DBE 2026 Grade 9 Natural Sciences ATP](https://www.education.gov.za/Portals/0/Documents/Recovery%20plan%20page/2026%20ATPs/2026_ATP_NS_Grade%209.pdf?ver=2026-01-20-202040-047), current cell and body-system learning sequence.

This is selected CAPS learning support, not full Grade 9 coverage or an assessment replacement. Detailed anatomy, diseases, contraception, pregnancy care and other strands are outside this increment. Reproduction uses neutral, age-appropriate science with no personal questions, diagnosis, medical advice, accounts or data collection.

## Compatibility and verification

Original Grades 4–8 mission files and IDs are unchanged. The existing `bioquest.guardians.grade4.v1` save key and original Grade 4 checkpoint migration remain supported. Grades retain separate checkpoints. Five new music patterns are appended without altering existing ones.

Local campaign, checkpoint, storage and stale-callback regressions run alongside score/UI bridge and catalogue tests. The existing BioQuest workflow checks the exact PR head, builds the site and runs Chromium at 320×568, 390×844, 844×390 and 1440×900. Browser coverage includes full Grades 7–9 campaigns at each viewport, Grades 4–6 desktop regressions, all-grade checkpoint switching, hints, retries, reload, replay, fullscreen, audio controls and screenshots of every Grade 9 investigation.

Actual browser validation and screenshot review must be confirmed from CI before calling this ready. Physical-device testing and audio listening are not covered. No merge or deployment is part of this increment.
