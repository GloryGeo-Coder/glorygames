# Neon Orb: Base Defence v2.2.0 — Reinforcements

The former single-enemy waves and generous healing made stationary aim assist too effective. Missions now use alternating ground/air formations, escalating group sizes and late-campaign flank entries. All 25 missions require a named boss encounter in wave three as well as their existing objectives and minimum hold time.

## Combat and progression

- Fifteen enemy types: the original seven plus Blade Bot, Siege Walker, Rocket Bot, Phase Stalker, Swarm Wasp, Bomber Manta, Arc Drone and Interceptor. New roles include warning-led rushes, arcing mortars, spread fire and altitude-changing strafes.
- Twenty-five boss encounters share five visual/attack families: Goliath low volleys and charges, Manta flight/fans, Weaver mortars, Crown volleys and shielded command cores. These are five families, not 25 unique art designs.
- Enemy health grows modestly; density, mixed roles and attacks create the added pressure. Shot warnings snapshot their target. Entry grace, a shared attack budget, bounded simultaneous warnings and Orb hit protection preserve response time.
- Aim assist remains enabled by default. Manual forward/upward fire has full damage and a faster fire rate. All five weapons, jumping, double jump, dash and EMP remain available on keyboard and captured touch buttons.
- Supplies arrive every 14 seconds instead of eight; health packs restore 20 instead of 26 and wave recovery restores six instead of 12. A boss defeat restores 20 player health and 12 Orb health, clears hostile shots and eases the remaining reinforcement rate.
- Armour absorbs 60% of an incoming hit while its pool lasts. Energy cells restore three health and reduce the EMP cooldown by 0.8 seconds. One winged-heart supply is offered halfway through each mission; carrying a reserve allows one revival at 45 health with temporary protection and a cleared projectile field. A used reserve caps this run at one star, preserving any higher saved rating.
- Launch-window missions still require their supplies before the deadline. After collecting them, a mandatory boss can be finished without an expired supply timer ending the encounter.
- Existing campaign/settings keys, unlocked missions, best scores and stars remain compatible. Only mission 25 ends the campaign. PRIME enters a dedicated final duel with reduced reinforcements and a small arrival recovery; its three phases and Orb defence remain mandatory.

## Art and performance

Six new transparent PNG atlases provide 88 frames/icons for four robot designs, four drone designs, four additional boss designs, friendly AI, all ten pickup kinds, the Orb, projectiles, HUD/control icons, warning markers, explosions, muzzle flashes and EMP rings. Existing player/enemy/core sheets remain intact. Per-cell alpha bounds are source rectangles used by the canvas renderer, avoiding stretched or clipped sprites.

Built-in image generation was used. Final assets and exact prompts, dimensions, alpha fractions, byte counts and SHA-256 values are recorded in `apps/web/public/games/neon-orb-defender/assets/reinforcements/art-manifest.json`. The six saved image paths are siblings of that manifest: `robots-atlas.png`, `drones-atlas.png`, `bosses-atlas.png`, `items-atlas.png`, `effects-atlas.png` and `ally-atlas.png`.

The renderer retains at most two background scenes and ten shared sprite sheets. Friendly AI and boss/effects sheets load when needed, avoiding unnecessary opening downloads. Combat caps normal enemies at 14–22, player projectiles at 80, hostile projectiles at 128, effects at 24, particles at 200, pickups at 14 and friendly AI at four. Reduced-motion mode suppresses sprite cycling and small particles. The separate HUD/arena/control rows, safe-area spacing and 44-pixel minimum buttons remain in place.

All 25 backgrounds, 25 original MP3 tracks, the thumbnail, shared game-tab integration and other games are unchanged. Website copy only updates Neon Orb's boss count.

## Validation and installation

The release is checked with engine/controller tests, captured-touch campaign simulations, save/retry/pause/rotation tests, atlas/reference/hash validation, native canvas inspection, the repository regression suite, Next.js and OpenNext builds, and byte comparison of generated game assets. Touch simulations and native canvas geometry are not physical iOS/Android browser testing.

The incremental ZIP contains `INSTALL.md`, `FILES.json` and `files/` with only changed/added repository paths. Apply `files/` over the complete v2.1.0 checkout at `788751e9d2261c21994ffd932cfce0e170a32a0e`. Do not replace the whole game directory or use a partial older ZIP as a complete base. `FILES.json` lists every payload path and checksum. Production publication must be verified separately from a successful GitHub merge.

## Release verification record

- 948 Node checks and 25 React checks passed (973 total), including 51 Neon Orb checks.
- Touch-only simulations completed all 25 missions from a new save in 390×580 portrait and 844×235 landscape. These runs used 13 and two retries respectively; seven and 12 successful missions used a reserve life. No campaign test changes player health, score, positions or objective counters.
- Successful missions spawned 106–248 enemies in portrait and 118–219 in landscape. Stationary aim assist takes substantial damage or fails. Geometry covers all missions at six viewport sizes, and 20 native-canvas fields cover all five boss families at four sizes.
- Next.js and OpenNext production builds passed. The bundle is checked against all 96 source game files by SHA-256. Existing art and all 25 music tracks retain their prior hashes.
- The incremental ZIP is applied to the complete v2.1 base, its resulting Git tree is compared with the reviewed source tree, and both regression suites are repeated before merge. The pull request and ZIP carry that overlay result and exact source SHA.

These are automated/native-rendering results, not physical-phone QA or a promise that human difficulty is identical to the test player's. Production publication is reported separately after the merge.
