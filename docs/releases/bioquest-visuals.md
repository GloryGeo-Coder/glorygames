# BioQuest illustrated expedition

## Scope

- Nala and Pip now use generated four-frame transparent sprite sheets matching the approved BioQuest thumbnail.
- All 35 missions across Grades 4–10 have individual illustrated settings, shown in the field journal, mission introduction, investigation panel and completion screen.
- Backgrounds are local 960px WebP assets, lazy-loaded on journal cards. Character strips preserve their frame aspect ratios.
- Learning text remains on opaque panels, separate from artwork. Motion is disabled when reduced motion is requested, and missing artwork does not prevent playing.
- Curriculum content, mission IDs, audio, unlock rules and the saved-progress schema are unchanged. No Cloudflare deployment is included.

## Asset provenance

The approved thumbnail is the visual reference. Scene and sprite assets were generated using the built-in image-generation tool, then mechanically resized/cropped and WebP-encoded. Prompt and geometry details are recorded in the asset README files. The atmospheric research-room pictures are decorative, not labeled scientific teaching diagrams.

## Verification

- Existing campaign, save, score and game-page tests.
- Asset existence, distinct-file hashes, WebP signatures and mobile file-size budgets for every mission.
- Production application build and TypeScript check.
- Browser campaign regressions at 320×568, 390×844, 844×390 and 1440×900.
- Artwork tour of all 35 missions at those sizes plus 600×900: image decoding, correct per-mission selection, sprite framing and animation, grade switching and hints.
- Reduced-motion and blocked-artwork fallbacks.

Browser tests and screenshot review are required before merging. Physical-device and audible-music tests remain outside this change's automated verification.
