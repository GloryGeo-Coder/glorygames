# Lost Jungle v2.5 — The Sunlit Expedition

Ten original jungle adventure instrumentals replace the short repeating synth phrase. The score combines synthesized wooden mallets, hand drums, wood percussion, flute melodies, warm string layers, bass, chimes and quiet canopy accents. Each 40-bar arrangement moves through an opening, main theme, quieter bridge and return. No third-party songs, recordings, samples or artist imitations are used.

The 10 stereo MP3s total 946.685 seconds (15 minutes 47 seconds), 15,158,321 bytes, at 128 kbps. They last 80–109.091 seconds and repeat during longer missions. The existing themeId selects music matching the setting across all 25 stages; tracks are shared by routes with the same setting.

| Setting | Track | BPM | Seconds | Stages |
| --- | --- | ---: | ---: | --- |
| Jungle | The Emerald Trail | 106 | 90.566 | 1, 12, 22 |
| River | River of First Light | 96 | 100.0 | 2, 11, 19 |
| Waterfall | Beyond the Waterfall | 102 | 94.118 | 3, 17 |
| Cave | Roots beneath the Moon | 88 | 109.091 | 4, 14 |
| Canopy | The Canopy Road | 112 | 85.714 | 5, 15, 23 |
| Ruins | The Stone Sundial | 98 | 97.959 | 6, 16, 24 |
| Crystal | Echoes in Amber | 92 | 104.348 | 7, 18 |
| Village | Lanterns in the Leaves | 100 | 96.0 | 8, 13, 20 |
| Volcano | Embers of the Lost Valley | 120 | 80.0 | 9, 21 |
| Sun Temple | Dawn at the Sun Temple | 108 | 88.889 | 10, 25 |

## Playback and controls

The game creates no audio context, media element or song request during initial loading. A play gesture unlocks sound; music begins after Continue. One streamed media element and one shared context serve the current setting. No soundtrack preload or full-song decoded buffer is added to game startup. Pause, map, hidden tabs, focus loss, completion and game-over stop music. Resume continues the same position; rebuilding/retrying or selecting a route resets it. Delayed playback promises, denied/unsupported audio and failed media do not block gameplay. Later play gestures can retry a browser refusal.

Pause contains labelled, 44-pixel-high Music and Sound effects sliders and the selected soundtrack title. Each volume persists with the existing save, independently of Sound On / Off master mute. Defaults are 55% music and 80% effects. Gain nodes provide independent mixing when Web Audio is available; a media fallback handles other environments. The existing eleven sound-effect cues retain their frequencies, timing and purpose, with their own mix level, bounded voices and cleanup on interruption. No new audio-related game timers are introduced.

Existing keys `wga_lost_jungle_2d_save_v1` and `wga_lost_jungle_2d_best_v1`, campaignVersion 24, unlocks, score, coins, powers, checkpoints and mobile controls remain. Old saves receive default volumes; zero settings survive reload. All 74 existing PNGs, campaign/animation source and art manifest are byte-identical (78 checked hashes in `release-v25-baseline.json`). No background, thumbnail, route, enemy or unrelated game changes are included.

## Validation

693 automated checks pass: 668 Node and 25 React checks, including all previous 25-route traversal, combat, saves, mobile input and page-launch regressions. New audio checks cover theme mapping across all 25 routes, lazy startup, one-element reuse, independent gains, mute, saved sliders, pause/map/visibility/completion, deferred/rejected playback, unavailable audio, interrupted contexts and bounded effect cleanup. Every MP3 was fully decoded as stereo audio and checked for duration, non-silent signal and stereo content. Measured integrated loudness is −17.70 to −17.66 LUFS; maximum measured true peak is −3.06 dBFS.

JavaScript/JSON/HTML references and CSS parsing pass. Next.js/TypeScript and OpenNext Worker builds pass; the published Lost Jungle assets are compared byte for byte. The incremental ZIP is applied over the complete base release, its tree is verified, and the full checks run again.

The DOM/audio adapters do not emulate browser CSS, physical phone speakers or real autoplay policy. Physical iOS/Android listening and subjective soundtrack review remain outstanding. Deployment is verified separately; a merge or successful build does not establish that Cloudflare has published it.

## Installation and rollback

Apply this update only over the complete v2.4 repository at main commit `cb7e1d68d447ff10c42db5dca27c198b6d21157e`. The incremental ZIP is an overlay containing only new/modified files, not a complete application. Back up the current repository and browser saves, then copy `files/` contents to the repository root while preserving paths. Review `FILES.json` for every exact path, action and hash. Keep the public game at `apps/web/public/games/lost-jungle-3d-temple-of-the-sun/`. No dependency, Worker configuration or routing changes are required. Test and deploy through the existing GitHub-main/Cloudflare workflow.

To roll back, restore only the modified files from the base and remove only the additions listed in the manifest. Keep browser progress. The extra volume fields are harmless to the earlier version.

```sh
# Repository root
node --test tests/*.test.mjs tests/*.test.cjs apps/web/scripts/*.test.cjs apps/web/scripts/*.test.mjs
cd apps/web
node --import tsx --test scripts/*.test.tsx
NEXT_PRIVATE_STANDALONE=true node node_modules/next/dist/bin/next build --webpack
node node_modules/@opennextjs/cloudflare/dist/cli/index.js build --skipNextBuild
```

## Regenerating the score

Run `python3 tools/build-jungle-soundtrack.py` with NumPy, SciPy and FFmpeg available. It writes the ten MP3s, `assets/music/manifest.json` and `jungle-music.js`. The manifest records score identity, title, setting, tempo, key, duration, byte size, SHA-256 and provenance. Encoder-version changes can alter output bytes; commit regenerated files and metadata together.
