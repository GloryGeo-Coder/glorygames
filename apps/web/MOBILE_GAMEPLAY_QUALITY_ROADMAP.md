# WebGameArena — Mobile-First Game Quality Roadmap

## Mission

**Make every existing game reliably playable on real phones before adding new games.**
The library contains 22 published game packages under `apps/web/public/games/<slug>/`. Each game has its own HTML, stylesheet, controls, assets and game logic. The shared site launcher embeds these inside an iframe.

This release fixes the **shared launcher** only. It does not claim to have fixed each game's internal layout or tested hardware that was not available in this development environment. No gameplay logic, scoring, game URLs, or user-data contracts were changed.

## What the repository audit revealed

- The shared `ggStageInner` game mount previously inherited a fixed minimum height from competing CSS sections. It now receives a flexible mobile-friendly viewport height.
- The site implements a browser Fullscreen API that can be refused on iOS Safari. This release provides a fixed-position fallback so the game can still expand.
- All 22 game HTML entries have viewport meta tags, but their internal CSS and controls are **not standardised**.
- Some games deliberately hide body overflow or use an absolute canvas. If their HUD or buttons exceed the actual iframe viewport, CSS in the **parent** cannot recover those off-screen controls.
- Small-screen and landscape-specific rules vary from game to game; a universal scale transform would shrink touch targets and could break canvas pointer coordinates.
- The PlayCanvas racing game, Babylon.js space game, HTML/DOM terminal and word game, and custom-canvas 2D adventures need different mobile rendering solutions.

## Minimum mobile acceptance criteria for each game

1. **Fit:** no clipped scoreboard, Start/Pause/Restart buttons, touch pad, health bars, instructions or overlay text.
2. **Controls:** every button is reachable and operable in both touch and keyboard modes; targets preferably at least 44 × 44 CSS pixels.
3. **Canvas:** correct aspect ratio and internal drawing-buffer dimensions when rotating or resizing; consistent pointer/touch hit testing.
4. **Viewport:** portrait works where practical. Landscape-heavy games have clear, nonblocking guidance and can use the expanded stage.
5. **Safe areas:** important controls stay clear of notches and browser/gesture bars with CSS `env(safe-area-inset-*)`.
6. **Scroll:** menus, help and settings remain scrollable, even while the game canvas captures touch actions.
7. **Performance:** profile on mid-range Android and iPhone; target stable 30–60 fps with an adaptive render scale and low thermal load.
8. **Audio:** sound starts only after interaction; mute/pause works across foreground/background transitions.
9. **Game continuity:** rotations and expanding the stage do not reset a run, duplicate input handlers or lose saved progress.
10. **Quality:** no stretched sprites, illegible labels, placeholder art or confusing fail/retry loops.
11. **Accessibility:** reduced-motion preferences, contrast and alternative input arrangements when feasible.
12. **Score bridge:** retain `GG_SCORE` and `gg:score` parent messages and test submission to the platform.

## Device / viewport test matrix

| Profile | CSS viewport | Orientation | Focus |
| --- | --- | --- | --- |
| Compact phone | 320 × 568 | Portrait | Legibility, safe touch controls |
| Typical phone | 375 × 667 | Portrait | Start overlays and controls |
| Modern Android | 390 × 844 | Portrait | HUD, menus, gestures |
| Large phone | 430 × 932 | Portrait | Gameplay area use |
| Phone rotated | 844 × 390 | Landscape | Control visibility, full screen |
| Tablet | 768 × 1024 | Portrait | Larger screens and reading UI |
| Tablet rotated | 1024 × 768 | Landscape | No wasted/overlapping layout |

Run at least one **real iOS Safari** and one **real Android Chrome** check before closing a game's task. Browser device emulation is helpful but is not equivalent to physical hardware or GPU performance testing.

## 22-game upgrade queue

| Wave | Game | Primary mobile QA focus |
| --- | --- | --- |
| 1 | High Spead Racer | PlayCanvas canvas sizing, steering, nitro reach, garage/overlays, frame rate |
| 1 | Sky Temple 3D | Dense HUD and six-button actions, canvas aspect ratio, boss menus |
| 1 | Space Dodger | Babylon canvas/GPU scale, overlays, joystick/touch controls |
| 1 | City Quest: Rise of the Guardian | Top HUD, jump/shoot/actions, canvas scaling |
| 2 | Kasi Quest | Touch movement, jump timing, long dialogue and mission overlays |
| 2 | Lost Jungle: Temple of the Sun | Jump/dash controls, hazard visibility, expedition map |
| 2 | Space Pilot Platformer | Touch pad, platform collision/landing, menus |
| 2 | Neon Orb: Base Defence | Combat and movement touch controls, boss overlays |
| 2 | Physics Force Lab | Experiment UI, mission text, touch input |
| 2 | Science Lab Dash | Three-lane controls, science questions, power-up buttons |
| 3 | Map Master Africa | Map touch targets, coordinate choices, pinch/drag distinction |
| 3 | Math Sprint Arena | Readable question gates, answer input and HUD |
| 3 | Cyber Shield Academy | Small-screen terminal, virtual keyboard, side windows and scrolling |
| 3 | Recycle Rush | Bin selection, HUD, map/dialogs, gesture safe areas |
| 3 | Word Dash | Virtual keyboard visibility and timer/word display |
| 3 | Climate Rescue Quest | Swipes, score/mission HUD, power-up overlays |
| 4 | Neon Hover Runner | Track viewport, swipe/jump boost input |
| 4 | Swipe Racer | Gesture steering, visible road and nitro controls |
| 4 | Fruit Slice | Swipe precision, scoreboard, bomb safety and overlays |
| 4 | Bubble Pop Arena | Full-canvas touch hit detection, timers and buttons |
| 4 | Brick Blaster | Paddle drag area, overlay and dock visibility |
| 4 | Stack Tower | Tap/drop controls, tower centering and Focus Mode |

Each wave gets its own incremental GitHub PR and Cloudflare preview test. A game's work is complete only when it passes the matrix, not when the CSS compiles.

## Quality and gameplay roadmap, after mobile QA

### Phase 2 — Mechanics and player experience
Per title: assess first-time onboarding, controls, difficulty curve, input latency, collision fairness, scoring clarity, rewards, pause/restart, checkpoint frequency, audio and replayability. Record a baseline and test the improved result with players.

### Phase 3 — Graphics, sound and environments
Introduce a **Blender → glTF/GLB** pipeline for 3D games and a 2D sprite/atlas pipeline for the others. Build consistent art direction and reusable, version-controlled assets. Export optimized glTF textures and animations with sensible mesh counts, draw calls, texture dimensions and LODs for phones. Test visual improvements against frame rate and download size, not screenshots alone.

### Phase 4 — New games
Start new games only after existing titles have mobile QA and gameplay-quality signoff. Reuse proven mobile input, audio, scoring, telemetry and asset packages.

## Blender and asset authoring

Blender is a standalone desktop 3D application, **not a Cloudflare Worker plugin**. Export game-ready `.glb` files to `apps/web/public/games/<slug>/assets/models/` and source `.blend` files to a versioned asset-development folder or external storage. Build a scriptable asset pipeline with Blender in headless/batch mode on a developer machine or a suitable build/asset workstation. Cloudflare should deploy **exported assets**, not attempt to run the Blender editor to render them at request time.

For 2D games, sprite sheets/atlases, texture optimisations, animation-state consistency and responsive canvas rendering generally give a stronger return than moving every game to 3D.

Useful tools: Blender (3D modelling, UVs, animation, lighting/baking), Krita or Inkscape (2D art), image creation for original concept art, and glTF optimization/validation tools. Keep texture and asset licensing records for commercial publishing.

## Practical next action after the shared launcher PR

Start **Wave 1** with a mobile preview of **High Spead Racer**, then adapt its inner `index.html`, `styles.css`, `game.js` and canvas resize logic. Test actual portrait and landscape screen sizes, native fullscreen and expanded fallback, and the touch controls. Apply the same verified workflow to Sky Temple, Space Dodger and City Quest.

No individual game's mobile problems should be marked resolved until its own HTML/CSS/JS code and control behaviour have been reviewed.
