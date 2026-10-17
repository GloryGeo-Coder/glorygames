# High Speed Racer: City of Legends — v0.17

Game metadata version: 2.2.0. Incremental base: main `19b9aa3c3a1212e0b6b6146dc16d45d486445410` (v0.16).

## Playable changes

Opponents now advance using their own speed in metres per second. Rival distance and rendered position share one conversion with the player. Hard distance clamps have been removed: a leader can pull away and a trailing driver can fall behind. Rivals have individual pace, bounded acceleration, periodic attacks and modest gap-based pace adjustment. Their wheels use their own speed. Occupied lanes trigger following/braking and searches for space. Traffic includes faster cars approaching from behind, spawns into clear space and is capped at 10 cars on compact quality or 16 on desktop.

Car contact never ends a race. Scrapes and rear impacts have different momentum penalties, a short sideways impulse, a camera jolt and an impact sound. The other car is displaced and backs off/searches for a free lane. A per-car cooldown and player contact cooldown prevent frame-by-frame impact spam. Speed recovers over several seconds; Nitro does not clear the penalty. Condition affects delivery pay and objectives. Zero condition still permits driving and recovery. Arcade hazard gates also slow the car instead of ending the race. Condition resets for a new event.

Brake uses S/Down or the new hold button. Nitro and brake do not apply together. Wet story events reduce steering response and braking deceleration. Fog reduces the mountain event’s visibility. Existing steering, swipe, Nitro, pause/background handling, mute, garage, upgrades, checkpoints, laps, scores, twelve routes and dedicated game tab remain available.

The original music and audio files are unchanged. Engine gain stumbles briefly after contact, braking reduces engine load, the Family Coupe has a lower engine character, and music gain builds toward the final sector. Existing separate music/engine/effects volume preferences remain compatible. Radio dialogue is readable text; recorded voices are not included.

## Chapter One: Save the Family Garage

The player returns to Veyra Bay after a sibling’s controversial championship crash left the family garage in debt. Mara is the mechanic and family ally. Ivo introduces the first duel, Lena introduces the local crews and corporate-controlled championship, and Sora extends the Precision invitation. The championship mystery remains unresolved at the end of this chapter.

Choose a driver name, racing suit/helmet palette and driving identity. Precision adds a small steering response benefit; Bold extends Nitro efficiency; All-rounder uses the base setup. The palette also changes the faded paint on the Family Coupe. The coupe reuses existing geometry with per-instance worn paint materials; no previous GLBs are replaced.

| Job | Street | Requirement | Reward |
| --- | --- | --- | --- |
| First Green | Neon Tunnel, rain | Beat Ivo in a duel; he brakes early in the middle sector | 180 coins, 45 reputation |
| Precious Cargo | Old Town | Deliver the customer’s Silver GT with at least 55% condition | Up to 340 coins, 55 reputation |
| Engine Proof | Coast | Finish with at least 8 seconds of Nitro use | 280 coins, 60 reputation |
| Against the Clock | Downtown | Finish within 44 seconds | 380 coins, 80 reputation |
| Names at the Harbour | Harbour, rain | Finish top three against five rivals | 500 coins, 110 reputation |
| The Precision Invitation | Mountain, fog | Finish top two against three rivals | 650 coins, 150 reputation |

Jobs unlock in order, remain replayable and track personal bests. Reputation is awarded once per job; replay payments remain available. Failed jobs give no career payment or unlock. Delivery condition scales payment. The mission board and garage summary visibly gain customer, photograph, trophy and crew milestones. These are interface milestones, not a new explorable 3D garage.

Story jobs use beginner speed ranges and one-lap distances. They use the Family Coupe, apart from the customer loan car. Purchased upgrades still benefit the starter. An existing player’s selected arcade car, ownership, coins and upgrades are retained. The original four garage cars remain available, with the Family Coupe added as a fifth choice. The original three-lap, twelve-street arcade campaign and individual streets remain accessible from the menu.

## Save compatibility

- Garage: unchanged `high-spead-racer-profile-v1`; legacy IDs still migrate.
- Audio: unchanged `high-spead-racer-audio-v1`.
- Career: additive `high-spead-racer-city-legends-v1`; guarded against malformed/unavailable storage, with sanitized driver input and validated job records.
- The historical `high-spead-racer` URL/slug and score event names stay unchanged.
- No database, deployment configuration, leaderboard API, other game, shared launch UI, GLB, thumbnail, engine vendor or audio media file is modified.

## Validation

Run from the repository root:

```sh
node --test apps/web/scripts/high-speed-racer-*.test.*
node --test apps/web/scripts/game-tab-score.test.mjs apps/web/scripts/game-tab-ui.test.mjs
node --test tests/*.test.mjs tests/*.test.cjs
cd apps/web
node --import tsx --test --test-reporter=tap scripts/game-tabs.test.tsx scripts/sky-temple-launch.test.tsx
npx opennextjs-cloudflare build
```

Racer tests load the shipped PlayCanvas engine with its NullGraphicsDevice, parse real GLBs and exercise actual game state, traffic/rival impacts, hazard recovery, pause/braking, appearance materials, job rewards/failures, all six story jobs and legacy saves. A seeded driver completes all six jobs through frame-by-frame driving with traffic, pickups and contacts, including retrying a lost crew challenge. This checks reachability, not human difficulty or device frame rate. Asset/media reference checks and existing platform/Sky Temple regressions remain in the suite.

The career UI has scrollable portrait/landscape layouts, 44px form/button targets, safe-area positioning, a keyboard focus loop, Escape close, and reduced-motion rain. Physical mobile touch ergonomics, audible mix and GPU performance still need device playtesting. The available cloud browser does not provide WebGL 2, so it cannot certify rendered gameplay.

## Production roadmap guided by the full story

This release is a first playable chapter in the existing lane-based racer. It does not implement an open city, suspension simulation, manual gears, physical deformation, free drifting, recorded dialogue or the final championship.

1. **Driving foundation:** continuous steering and throttle/brake axes, keyboard smoothing, controller support/remapping, lateral tyre grip and weight transfer, then car-specific mass/drivetrain/suspension and recoverable multi-car physics. Keep the starter competitive within a class. Add accessible assists and reduced camera effects before tuning harder events.
2. **Connected Veyra Bay:** route guidance, checkpoints and shortcuts across downtown, harbour, old neighbourhoods, coastal roads, mountain passes and outer ring highway. Author road geometry, collision meshes, mobile LODs and streaming sectors before replacing the existing arcade roads. Add chase/bonnet/cockpit views against that geometry.
3. **Crews and garage life:** Precision mountain drivers, industrial drift specialists and highway speed crews with recurring leaders, alliances, class-based upgrades and meaningful garage photographs/trophies/team growth. Add performance trade-offs for power, gearing, suspension, brakes, tyres and differentials alongside visual customisation.
4. **Mission variety:** expand from the six introductory jobs into deliveries with damage pay, unfamiliar-car storm tests, team checkpoints, controlled-corner mountain runs, sprints, circuits, drift, drag, highway battles, pursuit and endurance. Each event must measure a specific driving skill. Unlock the sibling’s crash evidence through these events.
5. **Cinematic championship:** link sunset downtown, changing harbour weather and a mountain duel; resolve the champion’s corporate organisation and the player’s alliances; return to the opening highway for the final race. Mara’s final line is “You know this road.” Progression should reward the car and skills the player built, without a final-race power-up.
6. **Audio/visual production:** load/RPM/gear engine layers, turbo/overrun and surface tyres, stereo opponent pass-bys, tunnel acoustics, separately adjustable dialogue, and a composed adaptive soundtrack. Add suspension, kerb, spark, debris and damage feedback with clear performance budgets. Weather must affect handling as well as appearance.

Each phase should arrive as a tested incremental patch and focused PR. Preserve the arcade modes and saved progress while the new driving/city systems go through production QA.
