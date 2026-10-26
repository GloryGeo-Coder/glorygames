# Science Lab Dash v3.7 — Original Dash visual and audio polish

The original 20-mission science dash now shares the chemistry adventure’s illustrated academy characters. The scientist runs, changes pose when moving between lanes, fires, reacts to damage and celebrates. Professor Nova and patrol drones use the existing adventure atlas. A new twelve-frame transparent atlas animates slimes, lab robots and Core guardians. Labelled equipment, hazards, power-ups, question cards, badges and projectiles replace the old basic tokens and boxes. The existing eight original level backgrounds, thumbnail and adventure artwork are unchanged.

## Presentation and mobile play

The canvas adapts to the available portrait or landscape space instead of holding a wide image inside large empty bars. Its logical height stays 900 and its width follows the display within 600–3200 pixels. Existing background images use a centred cover crop. Three lanes and their controls remain the same; horizontal object positions, travel speeds and projectiles scale with the usable route width. Rotating rescales active entities without clearing mission time, score, choices, lives or progress. Character silhouettes and collision radii stay readable rather than being horizontally compressed.

Start appears above the scrollable mission map. Short landscape screens use a two-column tools panel, desktop tools stay at the top of the sidebar, and mobile button labels wrap inside their touch targets. The canvas is keyboard focusable; arrow/W/S controls, Space, Shift and the existing fullscreen control remain available. Reduced-motion preference holds decorative frames and glows stable and removes camera shake; essential lane travel still runs.

## Original music and effects

Each original lab has a distinct named electronic arrangement, with its own phrase, harmony, bass movement and tempo. Locally synthesised lead, pad, bass and percussion layers increase with combo/boss pressure. There are no remote music requests or third-party sample files. Collecting evidence, lane changes, firing, hits, shield use, power-ups, questions, answers, boss entry, defeat and completion have distinct cues.

Audio opens separate music/effects volume sliders and an effects test. Preferences use `wga_science_dash_audio_v1`, separate from both game saves. Audio starts only after interaction. Effects do not restart music. Pausing, opening questions/settings, hiding the tab or leaving the page stops the appropriate scheduled audio. Resume preserves the current run instead of restarting the mission. Muting a channel stops its existing notes, and music uses one owned scheduler with bounded source counts. Blocked storage, audio absence and missing optional art do not prevent play.

## Preservation and game-page information

The original `wga_science_lab_dash_2_save` and `wga_science_lab_dash_2_best` keys remain. The twenty lesson definitions, expanded questions and numerical mission tuning retain their previous hash. Progression, badges, star/scoring rules and boss objectives are retained. Only the presentation scales with the viewport. Existing saved unlocks, scores and badges load normally. The separate adventure save and its 35 missions/105 investigations are unchanged.

Three Science editorial paragraphs now describe the arcade animation and its 20 music arrangements and Audio controls. Other games’ entries, catalog, shared page launch, scores and chat are unchanged. No database, dependency or hosting configuration change is required.

## Validation

- 80 Science Node tests include ten new arcade checks: twelve padded unique poses, source/builder provenance, animation/reduced-motion frames, all 112 equipment/hazard/power/question pictograms, twenty distinct arrangements, channel isolation, scheduling, bounded nodes, safe settings and optional modules. The existing seventy curriculum/preservation checks remain.
- 45 shared/final-page Node checks cover the launch, thumbnail, editorials, Sky Temple, score transport and fullscreen integration. JavaScript, JSON/references and diff checks pass.
- The arcade browser suite exercises touch and keyboard input, real projectile/collision consequences, all power-ups, questions through actual answer buttons, boss hits/attacks, completion and persistence in twenty mission fixtures. These are controlled fixtures, not twenty complete real-time arcade playthroughs.
- Twelve viewport cases include 320×568, 568×280 and desktop. Controls, modal sliders, fullscreen, portrait framing, visibility/pause/resume, score/badge retention, saved preferences and separate adventure storage are checked. Reduced motion and missing art/icons/audio/storage/fullscreen fallbacks are checked; screenshots are reviewed.
- Twenty OfflineAudioContext renders verify distinct, non-silent, finite audio output below clipping, in addition to scheduler/channel tests. This verifies synthesis rather than relying only on fake audio nodes.
- Adventure layout/recovery regression covers all seven grades and 91 grade/size cases, diagram bounds, original fixtures and capability failures. CI retains the full 35-mission/105-investigation adventure playthrough and adds the arcade suite before the production build and built-site page tests.
- The Next.js production build and twelve built-page/viewport cases validate the final information pages, PNG thumbnail, standalone adventure launch and original dash’s real entry/art/audio without fixture hooks. Browser coverage is Chromium emulation, not physical-device Safari certification. Live account/chat services are outside the fallback-data page fixture.

## Artwork provenance

New runtime atlas: `apps/web/public/games/science-lab-dash/assets/arcade/creatures.png`. The [source and final generation prompt](../../tools/science-arcade-source/README.md) document the built-in image-generation tool, style reference and deterministic packing command. Existing hero, mentor and patrol artwork is reused without modification.

## Installation

Pull merged `main`, then build/deploy using the existing Cloudflare/OpenNext process. No migration, dependency update or ZIP is needed. Cloudflare deployment remains with the owner.

## Exact files

Modified (6):

- `.github/workflows/science-chemistry.yml`
- `apps/web/public/games/science-lab-dash/game.js`
- `apps/web/public/games/science-lab-dash/game.json`
- `apps/web/public/games/science-lab-dash/original-dash.html`
- `apps/web/scripts/science-page-browser.cjs`
- `apps/web/src/content/gameEditorials.ts`

Added (12):

- `apps/web/public/games/science-lab-dash/arcade-art-data.js`
- `apps/web/public/games/science-lab-dash/arcade-art.js`
- `apps/web/public/games/science-lab-dash/arcade-audio.js`
- `apps/web/public/games/science-lab-dash/arcade-icons.js`
- `apps/web/public/games/science-lab-dash/arcade-polish.css`
- `apps/web/public/games/science-lab-dash/assets/arcade/creatures.png`
- `apps/web/scripts/science-arcade-browser.cjs`
- `apps/web/scripts/science-arcade.test.cjs`
- `tools/build-science-arcade.cjs`
- `tools/science-arcade-source/creatures.webp`
- `tools/science-arcade-source/README.md`
- `docs/releases/science-lab-dash-v3.7.md`
