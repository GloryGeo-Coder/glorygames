# Fruit Slice v2.1 — Sunset Trials

Incremental update over main commit `72f8449d7f22aab5c8156d13c66211306a463269`. Entry stays `/games/fruit-slice/`, with its existing dedicated game tab and optional browser fullscreen. The game information page editorial is updated for the new campaign. No other game, dependency or deployment configuration changes are included.

## Mobile and input

The arena fills the available viewport, including portrait and landscape. A 720-unit logical height makes fruit launch into a consistent reachable area instead of disappearing above a short screen or hovering near the bottom of a tall one. Fruit sizes retain roughly 48 CSS-pixel minimum diameters, with a small touch margin. Score values use the original unscaled radius, so changing the screen does not inflate each fruit's value. Safe areas, compact HUD, 44-pixel buttons and scrolling panels keep controls accessible. The existing dojo background covers the screen without stretching its aspect ratio.

Each pointer owns its own blade, capture and trail. Two fingers can cut independently; coalesced events follow curved swipes without drawing a false straight cut across a bomb. Stationary fingers do not auto-slice. Cancellation, focus loss, page hiding and rotation clear stale input. A significant resize pauses safely; resume is explicit. The simulation uses a fixed 120 Hz step and caps render pixels at three million. Sprite atlases decode sequentially into bounded 192-pixel crops, then release the large source images. No music is requested on startup.

## Campaign and preserved arcade rules

Campaign adds 25 unlocked-in-order trials across Sunset Dojo, Fruit Market, Tropical Garden, Lantern Festival and Master Trials. Each has score and fruit goals plus selected fruit-type, combo, gold or frenzy objectives. Time limits are 50–70 seconds; meeting every goal clears a round immediately. Stars, stage bests and unlocks are saved. The first two stages teach slicing without bombs, and later stages vary wave sizes and motion. Bomb/fruit trajectory clearance avoids forcing a hazardous overlap.

Endless Arcade remains available with its three lives, five fruits, accelerating waves, golden fruit and fatal bombs. A miss costs one life in either mode. Classic scoring is retained: base fruit values, bonuses from combo three onward, golden bonuses and the seven-second 1.6× frenzy multiplier. Frenzy must refill after it expires. A stroke containing a bomb cannot win by counting the last required fruit first. Fruit is not marked missed while initially rising into view, and a batch of misses cannot submit a result more than once.

| Stage | Trial / song | Time limit (s) | Lives | Score / fruit goals | Extra objective kind |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | First Slice | 50 | 5 | 270 / 13 | harvest |
| 2 | Orange Orbit | 50 | 5 | 300 / 14 | focus |
| 3 | Melon Morning | 50 | 5 | 330 / 15 | harvest |
| 4 | Triple Cut | 50 | 5 | 360 / 16 | combo |
| 5 | Golden Crown | 50 | 5 | 390 / 17 | gold |
| 6 | Market Warm-up | 55 | 5 | 420 / 18 | harvest |
| 7 | Melon Market | 55 | 5 | 450 / 19 | focus |
| 8 | Juice Rush | 55 | 5 | 480 / 20 | frenzy |
| 9 | Market Combos | 55 | 5 | 510 / 21 | combo |
| 10 | Golden Basket | 55 | 5 | 540 / 23 | gold |
| 11 | Garden Glide | 60 | 4 | 570 / 24 | harvest |
| 12 | Kiwi Crossing | 60 | 4 | 600 / 25 | focus |
| 13 | Frenzy Bloom | 60 | 4 | 630 / 26 | frenzy |
| 14 | Garden Rhythm | 60 | 4 | 660 / 27 | combo |
| 15 | Golden Harvest | 60 | 4 | 690 / 28 | gold |
| 16 | Lantern Launch | 65 | 4 | 720 / 29 | harvest |
| 17 | Pineapple Lanterns | 65 | 4 | 750 / 30 | focus |
| 18 | Festival Frenzy | 65 | 4 | 780 / 31 | frenzy |
| 19 | Five-fruit Flow | 65 | 4 | 810 / 32 | combo |
| 20 | Midnight Gold | 65 | 4 | 840 / 34 | gold |
| 21 | Masters Gate | 70 | 3 | 870 / 35 | harvest |
| 22 | Apple Precision | 70 | 3 | 900 / 36 | focus |
| 23 | Sunburst Frenzy | 70 | 3 | 930 / 37 | frenzy |
| 24 | Perfect Rhythm | 70 | 3 | 960 / 38 | combo |
| 25 | Sunset Champion | 70 | 3 | 990 / 39 | gold |

`focus` means a specified fruit count, `combo` a best chain, `gold` golden fruit, and `frenzy` a frenzy activation. `harvest` uses the score and sliced-fruit goals. Stage details are displayed during play. Automatic swipes prove reachability; they do not establish the subjective difficulty of a full human campaign.

## Animation and sound

Three new transparent atlases provide 24 real poses (four for each of five fruits and the bomb) and ten separate juicy cut halves. Fruit squash/stretch, leaf/crown movement, spinning halves, seeded interiors, juice, stars and an animated fuse make each object readable. All eight original PNGs, including the background and thumbnail, are byte-identical. Final built-in image-generation prompts and hashes are recorded in `assets/animation/art-manifest.json`; `tools/build-fruit-animation-data.py` only reads alpha bounds and writes metadata.

Every campaign level has its own original 32-bar instrumental, with its stage title, a distinct tempo/key/harmony/groove/motif combination and arranged musical sections. Mallets, plucked keys, bass and percussion provide a playful arcade score. The 25 stereo MP3s total 1,642.005 seconds (27 minutes 22 seconds), 23,012,243 bytes at 112 kbps. Endless uses First Slice. No third-party music, recordings, samples or artist imitations are used. Only the selected song streams through one reusable media element and shared audio context.

Pause/results contain separate saved Music and Sound effects sliders (55%/80% defaults). Sound On / Off mutes both. Effects cover slicing, combos, golden fruit, misses, bombs, countdown, frenzy and results; voices are bounded, noise is reused and output is mixed through a compressor when supported. Pause, map, hiding and results stop music and active tails. Resume retains the same track position; a new round restarts it. Unsupported audio, failed files and rejected/delayed playback never prevent a round.

## Saves and controls

The existing best key `gg_fruit_slice_best_v2` is preserved. New campaign/audio settings use `gg_fruit_slice_progress_v1`. Corrupt, missing or unavailable storage is handled safely; old best scores are not reset. Round positions are not saved across reloads. Restart affects only the current round; saved unlocks and bests remain. The existing GG score bridge and manual Submit button are retained, with trusted-origin host controls.

Swipe one or two fingers on phones; click and drag on desktop. P / Escape pauses. The pause panel provides Resume, Restart Round, Level Map, Music, Sound effects, Submit Score and Main Menu. Browser fullscreen remains available from the panel where supported and through the shared Alt+Enter control.

## Validation and limits

815 automated checks pass: 790 Node and 25 React checks, including 122 new Fruit Slice checks. All 25 trials are completed through actual pointer swipes at 390×844, 844×390 and 1366×768, plus all 25 at 320×1000. Additional viewport checks include 320×568, 1024×768 and 3840×2160. Input cancellation, simultaneous pointers, coalesced paths, rotation, progression locks, scoring, frenzy, storage, audio failures and asset hashes are covered. Motion is compared at 20/60/120 render frames per second. Native canvas gameplay was visually inspected at portrait phone, landscape phone and desktop dimensions.

Every MP3 fully decodes as non-silent stereo audio with the expected duration. Measured integrated loudness spans −18.13 to −18.00 LUFS; maximum measured true peak is −2.81 dBFS. Scripts, JSON, HTML references and CSS parsing pass. Next.js/TypeScript and OpenNext Worker builds pass, with packaged game files checked byte for byte. The incremental ZIP is applied to a complete clean base, its source tree is verified and all checks are repeated.

The input/audio adapters do not emulate browser CSS, real mobile autoplay policy, speakers or hardware performance. Physical iOS/Android play and listening, and subjective balancing/music review, remain outstanding. A merge or passing build does not prove Cloudflare deployment; the live version is checked separately.

## Install, regenerate and roll back

Back up the complete v2.0 repository and browser saves. Copy only the ZIP's `files/` contents into the repository root, preserving paths; do not create another nested Fruit Slice folder. `FILES.json` lists every exact addition/replacement and SHA-256. This is an overlay, not a complete app. Keep unchanged assets and shared files. Run the checks below and deploy through the existing GitHub-main/Cloudflare workflow after review.

```sh
node --test tests/*.test.mjs tests/*.test.cjs apps/web/scripts/*.test.cjs apps/web/scripts/*.test.mjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
NEXT_PRIVATE_STANDALONE=true node node_modules/next/dist/bin/next build --webpack
node node_modules/@opennextjs/cloudflare/dist/cli/index.js build --skipNextBuild
```

`python3 tools/build-fruit-soundtrack.py` uses NumPy, SciPy and FFmpeg to regenerate the 25 MP3s and their catalogue/manifest. Commit changed encoded files and hashes together if the encoder version changes. `python3 tools/build-fruit-animation-data.py` reads the three sprite PNGs and recreates crop metadata without editing the art. To roll back, restore the modified files and remove only additions listed in the ZIP manifest. Keep the existing best key and browser saves.
