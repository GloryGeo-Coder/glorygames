# Climate Rescue Quest v2.1.0 — Connected Planet

Climate Rescue Quest previously placed long information panels ahead of the arena on phones, switched controls between inconsistent grids, handled movement as single clicks, required dragging directly on the hero and spawned objects by render-frame probability. The updated game uses one viewport with separate HUD, arena and five-button control rows, captured multi-touch input, drag-anywhere steering and a fixed 120 Hz simulation.

## Campaign and gameplay

The campaign expands from ten to 25 missions. The original ten names, habitat scenes and environmental facts remain; 15 new missions connect mangroves, rooftops, river corridors, wildlife routes, regenerative farms and regional restoration partnerships. Ten existing habitat backgrounds are reused where appropriate, without altering their image bytes. These are 25 missions, not 25 newly drawn backgrounds.

Each mission has a 40–88 second minimum restoration time, an eco-action target and a guaranteed supply of its required resource. Three phases increase pressure. Five smog-front encounters appear in missions 5, 10, 15, 20 and 25, sharing one animated Carbon Boss design and progressively denser hazard patterns. Collecting eco-actions weakens a front after it arrives. Mission ten now opens the wider campaign; only mission 25 is the ending.

The classic Shield (one block for up to seven seconds), Magnet (eight seconds), Freeze (five seconds), ten-step combo multiplier and score awards are retained. Power-up refills and leaf-heart life recovery are actual collectibles. New mission checkpoints restore three lives and one charge of each power; retries restore the mission starting score. Hazard entry warnings, inset hitboxes and brief hit protection avoid stacked instant defeats. Actor and item sizes adapt to short landscape arenas. Freeze slows objects once, and Magnet uses elapsed time rather than a per-frame pull.

## Mobile, persistence and platform integration

- The page and controls stay inside the dynamic viewport, with safe-area spacing, 44-pixel minimum buttons, a scrollable menu and no forced orientation or disabled browser zoom.
- Hold Left/Right or A/D/arrows for continuous motion. Drag anywhere in the arena or swipe while holding contact. A second finger can activate Shield, Magnet or Freeze. S/M/F, pause, replay, score submission, scores/chat and the existing dedicated-tab fullscreen integration remain available.
- Blur, page hiding, platform pause and rotation stop gameplay and audio, release all held pointers and require an explicit resume. The actual viewport size must change before rotation handling pauses a run.
- The old `gg_climate_rescue_quest_v2_save` record remains untouched. Its known mission progress is migrated conservatively into `gg_climate_rescue_quest_campaign_v3`; a completed old final mission opens mission eleven. The legacy `gg_climate_rescue_quest_v2_best` score is preserved. New settings use `gg_climate_rescue_quest_settings_v3`. Higher recorded stars and best scores never decrease.
- Stars reward a clean run: three for no hits and three remaining lives; two for at least two lives and at most two hits; one for another successful finish. Blocked storage still permits session play.
- Score events retain the canonical `climate-rescue-quest` slug, GG_SCORE and gg:score. Cross-origin control messages are ignored; platform mute does not overwrite user preferences.

## Animation and audio

Four new transparent sheets provide 52 frames/icons for the leaf superhero, six eco-collectible types, three hazard types, the Carbon Boss and four power/life icons. Existing assets are not overwritten. Shared row source rectangles keep sapling growth, turbine rotation, smoke and flames anchored consistently. The renderer keeps four sheets and at most two backgrounds; unavailable artwork has a non-blocking rendered fallback. Reduced-motion settings disable sprite cycling and particles. Falling items are capped at 24, particles at 120 and floaters at 12.

Built-in image generation was used. Exact prompts, reference role, saved paths, alpha fractions, dimensions and SHA-256 values are in `apps/web/public/games/climate-rescue-quest/assets/animated/manifest.json`. The four saved siblings are `hero-sheet.png`, `eco-sheet.png`, `hazards-sheet.png` and `boss-power-sheet.png`. All 49 original PNG files, including the thumbnail, retain their hashes.

Every mission has its own original stereo MP3 score. Wooden mallets, plucked tones, soft flute-like melodies, restrained percussion and synthesized wind, water and birds provide an environmental theme. No third-party songs, samples or recordings are included. Score parameters and hashes are in `assets/music/manifest.json`; `tools/build-climate-soundtrack.py` contains the synthesizer and composer. Tracks stream through one reusable audio element rather than decoding all 25 songs at startup. Music and effects volumes are independently saved. Pickups, water, trees, powers, blocks, hazards, smog strikes, completion and failure have distinct sound cues. One audio context and at most 24 effect voices are used; pause/mute disconnect pending voices. Denied autoplay or missing audio APIs cannot block play.

## Validation and delivery

The release has 41 dedicated checks covering legacy migration, bounded progress, real controller inputs, multi-touch cancellation, keyboard/UI conflicts, frame-rate parity, power behaviour, mission gates, all five fronts, score events, retries, pause/rotation, six geometry sizes, all 25 missions through captured touch pointers, audio lifecycle and asset provenance/references.

The repository regression run passed 989 Node checks and 25 React checks: 1,014 total. Captured drag/power simulations completed all 25 missions in portrait and landscape, including retries where needed, without modifying player positions, lives, scores or objective counters. Twenty native-canvas fields were inspected at four sizes. Every MP3 fully decoded. Source peaks remain below 0.8 with headroom for MP3 encoding.

Next.js and OpenNext production builds, exact game-asset byte parity and a clean incremental-overlay regression run are recorded in the pull request and ZIP. Native canvas and input adapters do not emulate browser CSS and are not physical iOS/Android device QA. Successful merge and verified live publication are reported separately.

Only changed and added files are delivered. Apply the ZIP's `files/` contents over the complete WebGameArena repository at `64aeede633da7401b0ff539fe2baef68ad047fb4`; do not use an earlier partial ZIP as a complete base or replace the whole game directory. `INSTALL.md` explains controls, installation and rollback, and `FILES.json` lists exact paths and hashes. Other games, routes, deployment configuration, original backgrounds and thumbnail remain unchanged; website copy changes only Climate Rescue Quest's description and campaign count.
