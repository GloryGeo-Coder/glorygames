# Physics Force Lab v4.9 — Illustrated Cover and Story

The cover now matches the redesigned young physicist, Professor Newtonia, Pip and GlitchBot. It depicts a hands-on repair in Nova’s illustrated laboratory, using the current goggles, teal-and-ivory field jacket, orange tool bracer, silver-haired mentor and gold-and-teal companion. The compact, centred title survives the website’s narrow mobile card crop and leaves room for its existing category badge.

The website’s About, Story and setting, catalog description, revision/fullscreen guidance and FAQs now describe the same recovery adventure. Both game opening screens introduce Nova, Newtonia, Pip and the Quantum Core in final copy. The guide accurately identifies 30 Adventure missions, 90 repairs, selected Grades 4–10 topics, 55 distinct revision checks and 12 original action labs. No mission briefs, educational answers, physics models, gameplay code, scoring or save formats change. Other games’ editorial entries remain unchanged.

## Saved artwork

- `apps/web/public/games/physics-force-lab/thumb.png` — final 1672×941 PNG, replacing the old cover and its outdated 12-level badge.
- `apps/web/public/games/physics-force-lab/thumb.webp` — matching optimized WebP, 205,850 bytes, quality 86. The existing GameThumb component prefers this format automatically; PNG remains the fallback.

The built-in image-generation tool produced the cover using `docs/releases/physics-force-lab-v4.6-cast.png` as the identity reference. The selected final PNG is kept intact. Sharp performs only WebP encoding; no new package dependency or production build step is added.

## Validation

The reviewed game-card, GameLaunch and GameEditorial components render at 320×568, 390×844, 768×1024 and 1440×900 without horizontal overflow. The actual 140×160 mobile card and the phone launch/story views were visually inspected from Chromium screenshots. The full title remains visible in the narrow crop. The optimized binary’s Git blob checksum is verified against its encoder output.

Existing Physics, shared game-page/fullscreen and adjacent editorial regressions run in GitHub Actions, including both modes’ mobile/fullscreen flows, revision recovery, original-level fixtures and the Next.js production build. The editorial checks now compare revision claims with the actual question bank. No new full campaign playthrough or physical-device Safari certification is claimed for this presentation-only update. The local workspace disconnected during final QA; the artwork and completed source were preserved and verified through GitHub. A temporary cover-preparation check is removed from the final workflow diff.

## Exact files

Added:

- `apps/web/public/games/physics-force-lab/thumb.webp`
- `docs/releases/physics-force-lab-v4.9.md`

Modified:

- `apps/web/public/games/physics-force-lab/thumb.png`
- `apps/web/public/games/physics-force-lab/index.html`
- `apps/web/public/games/physics-force-lab/original-labs.html`
- `apps/web/public/games/physics-force-lab/game.json`
- `apps/web/src/content/gameEditorials.ts`
- `apps/web/src/lib/gameCatalog.ts`
- `apps/web/scripts/physics-editorial.test.cjs`

The shared thumbnail/launch components, other game entries, runtime sprites, backgrounds, audio and Cloudflare configuration are unchanged. Pull main after merge and deploy using the existing Cloudflare/OpenNext setup when ready. No ZIP, publication staging files or save migration is needed. Deployment remains with the owner.

## Built-in artwork prompt set

Initial cover, with the existing cast sheet as the identity reference:

> Use case: illustration-story. Asset type: final wide 16:9 browser-game thumbnail and cover, landscape composition. Transform the supplied character cast reference into a polished cover for Physics Force Lab, preserving the actual illustrated character identities and the approachable 2D cel-shaded game style. The supplied image is a CHARACTER IDENTITY reference only: do not copy the contact sheet, labels or grid. Main subject: the young brown-skinned physicist with short dark curly hair, goggles resting on the forehead, teal-and-ivory field jacket, orange tool bracer, dark trousers, boots and small backpack; curious and confident, using a handheld tool to restore a small circuit machine, not casting a magic spell. Beside the hero, Pip is a friendly hovering round gold-and-teal robot with a single luminous eye, small fins and antenna. Professor Newtonia appears as the supportive mentor, with silver hair and bun, round glasses, ivory lab coat and amber tablet. Keep these three faces and silhouettes close to the reference. Scene: Nova Physics Institute, an inviting deep-navy and teal laboratory with a luminous grid floor, readable side-view platforms, a spring apparatus and restored circuit lights; a city silhouette visible through the laboratory windows. Farther back, include a small angular purple GlitchBot mech as a secondary challenge, matching its reference silhouette, with an amber core. Hero and Pip are the strongest visual focus, Newtonia remains clearly visible. Clean layered 2D illustration, crisp outlines, restrained highlights, flat-to-soft shading matching the reference, vivid mint, teal and amber accents. It must resemble the playable illustrated platform adventure, not a photorealistic scene, anime battle or 3D-rendered game. Composition: strong silhouettes and uncluttered hierarchy that reads at a 320-pixel card width; reserve the upper third for accurate, very legible title typography with a dark clear field. Exact title text: "PHYSICS FORCE LAB". Smaller exact subtitle: "RISE OF THE YOUNG PHYSICIST". No other text, level counts, version badges, grade badges, HUD, watermark or website interface. Keep all title text and key faces comfortably inside the central 85% so the cover survives small edge crops. Fill the entire 16:9 frame with the finished scene, without borders or letterboxing.

Title placement refinement, with the first cover as the edit target:

> Edit this finished game cover. Change only the placement and arrangement of the title typography, preserving the illustrated characters, their identities, poses, equipment, colours, laboratory, city, lighting, spring apparatus and purple mech. The cover will appear in small website cards with an Educational badge in the upper-left corner, so the upper-left 35% must be free of essential text. Remove the existing title and subtitle from the top and naturally restore the lab architecture behind their old position. Place the exact title "PHYSICS FORCE LAB" in a strong, very readable wide dark navy title panel across the LOWER part of the cover, below the characters' faces and upper bodies; the panel can cover some foreground pipes and the bottom of the machine but must not cover any face, Pip, Newtonia's tablet or the hero's hands. Keep the title on one line if comfortably readable, or two balanced lines if that works better. Below it use the exact subtitle "RISE OF THE YOUNG PHYSICIST". Keep both text lines inset from the left/right/bottom edges with enough room for small 16:9 crops, and keep the headline comfortably above the bottom 8% of the frame. Maintain the same crisp approachable 2D cel-shaded artwork, landscape 16:9 aspect and full-frame image, without borders. No other text, badges, counts, versions or new objects. Everything except title placement and the architecture revealed where the old title was must remain visually consistent.

Final narrow-card typography refinement, with the preceding cover as the edit target:

> Make one precise typography edit to this cover so it also works when cropped to a narrow mobile game card. Preserve the characters, poses, faces, equipment, lab architecture, spring, city and all scene details. Keep the dark title panel in the lower part, but reflow its text into a compact CENTERED block. Exact main title on TWO lines: first line "PHYSICS", second line "FORCE LAB". Both lines, including every letter, must fit within the central 42% of the image width, approximately x=485 to x=1185 on a 1672-pixel-wide image. Make the two-line title bold, clean and very legible, with white PHYSICS and mint FORCE LAB. Keep the text block between approximately 700 and 850 pixels vertically. Under it place the exact subtitle "RISE OF THE YOUNG PHYSICIST", also entirely within the same central 42% width; it can be smaller. The dark decorative panel may remain wide, but ALL lettering must be compact and central, with ample empty panel space on both sides. This preserves the whole title in a narrow centered crop. No text at the top of the image. Do not enlarge or move the characters or add objects. Maintain the same 16:9 landscape frame, existing 2D illustrated style, palette and quality. No new text, badges, numbers, watermark, borders or letterboxing.
