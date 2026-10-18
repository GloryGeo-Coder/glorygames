# City Quest 2.3 — Township Rhythms

Each of the 25 campaign missions now plays its own original Amapiano-inspired
instrumental. The score uses synthesized log-drum bass, swung shakers, kicks,
claps, rim percussion, soulful extended chords and mallet melodies. Each track
has a distinct combination of tempo, key, progression, bass groove and lead
phrase, arranged over 32 bars with opening, main, breakdown and return sections.
No third-party songs, samples, recordings or artist imitations are used.

The 25 stereo MP3s total 1,715.3 encoded seconds (about 28½ minutes), approximately
24 MB. They play at 108–116 BPM and repeat during longer missions. The game
requests only the selected level's song, reusing one media element. It does not
preload the full soundtrack or allocate audio before the first play gesture.

## Player controls and effects

- Pause contains independent Music and Sound effects sliders and the track name.
- Sound On / Off remains the master mute for both channels.
- The two volumes and mute preference persist alongside existing progress.
- Pause, map, page hiding and focus loss stop music and active effect tails.
- Resume continues the same song; restarting or choosing a mission restarts it.
- Each mission transition selects the corresponding soundtrack entry.
- A supported Web Audio context routes the media through a gain node, including
  on browsers where the media element's volume property is not adjustable.
- Missing audio support, blocked playback or a failed song never prevents play.

Layered synthesized cues cover jumping, landing, shooting, enemy fire, damage,
shield absorption, enemy defeat, coins, tokens, powers, checkpoints, guide
dialogue, mission completion, victory and game over. Noise is reused and effect
voices are bounded and rate limited to prevent dense combat from flooding audio.

All 25 map entries now use the same enemy/checkpoint summary format. For
example, Ubuntu Park Rooftops reads “Extended city route. 24 enemies across
10 checkpoint beacons.” Counts come from the actual route definitions.

## Compatibility and scope

Apply the incremental ZIP to the complete working v2.2 campaign at main commit
`9efab75ca3feb4ed9b7600edf26eb3a794353be5`. Do not use it as a standalone game.
The existing 25 routes, progression locks, enemy budgets, bosses, backgrounds,
sprite animation, mobile controls, scores, outfits and storage keys are retained.
Internal campaign/save version stays 22; release metadata becomes 2.3.0.
Existing saves receive default music/effects volumes of 55%/80%.

The release changes seven existing repository files and adds 32 files:
25 MP3s, their manifest, the public catalogue and audio controller, two audio
test files, the reproducible soundtrack composer and this release note.
The ZIP installation note and patch manifest list every exact path and hash.

## Validation

- 604 automated checks: 91 City Quest, 488 other game/shared/runtime checks and
  25 React launch/interface checks.
- The City suite traverses all 25 authored routes, checks existing graphics,
  saves, unlocks, checkpoints, mobile viewport/input adapters and combat systems.
- New audio tests exercise streamed track selection, independent gains, master
  mute, delayed/rejected playback, unsupported/interrupted contexts, bounded
  effects, persisted settings, pause/map transitions and the map text.
- All 25 actual MP3s decode as stereo audio, match manifest hashes, and have
  matching encoded durations. Measured integrated loudness is −17.7 to −17.5
  LUFS, with maximum measured true peak −1.7 dBFS.
- Next.js/TypeScript and OpenNext Worker production builds pass; packaged City
  files are compared byte for byte with the source.
- The incremental ZIP is applied over a complete clean v2.2 checkout; before
  and after hashes and the resulting source tree are verified, and all checks
  are repeated before delivery.

The DOM/audio adapters do not emulate real browser autoplay policy, CSS layout
or phone hardware. Physical iOS/Android listening and touch QA, and subjective
music review, remain outstanding. Terrain traversal isolates combat hazards;
encounter tests cover them separately. A passing build or merge does not prove
Cloudflare has published the release; live deployment is checked separately.

## Regenerating the score

Run `python3 tools/build-city-soundtrack.py` with NumPy, SciPy and FFmpeg
available. It writes the 25 MP3s, `assets/music/manifest.json` and `city-music.js`.
The manifest records track titles, tempos, score variations, durations, sizes,
SHA-256 hashes and provenance. FFmpeg version changes may alter encoded bytes;
commit regenerated files together with the updated manifest/catalogue.
