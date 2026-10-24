# Physics Force Lab v4.7 — Mobile Display and Fullscreen

Adventure and Original Labs now have a fullscreen control beside the touch controls, with a second control in Adventure Settings or the original start/pause menu. Both use the same state and switch between Enter Fullscreen and Exit Fullscreen. The entire document enters fullscreen so the HUD, touch controls and scrollable experiment dialogs remain available. Alt+Enter works outside editable fields. Native fullscreen changes update both labels and release held movement input.

The Physics-specific display controller replaces only this game's shared fullscreen binding; the shared score transport and every other game remain unchanged. It prevents duplicate pending requests, supports standard and prefixed APIs, handles native exit, and recovers from rejected requests. When the browser does not expose fullscreen, unusable buttons are hidden and the menu explains that the game already fills its tab. This fallback does not claim to hide unsupported browsers' address bars.

Mobile/tablet controls use an accessible SVG fullscreen icon with a 44×44 CSS-pixel target. The full label remains visible on wide screens. Hiding the keyboard hint and long fullscreen label on tablets fixes an Interact button that could extend past the right edge at 768 CSS pixels. Long mission names wrap within their layout column.

Original Labs uses a compact HUD below 360 CSS pixels of available landscape height. Counters sit beside the pause/audio/restart controls; the duplicate full objective line is omitted from this compact strip while collection targets and progress remain visible. Pause now includes the full objective and current lesson text at every size. At 568×280, the first lab's playable height increases from 104 to approximately 156 CSS pixels. Touch targets remain at least 44 pixels. Both existing grid layouts retain dynamic viewport sizing and safe-area padding, and fullscreen/rotation resize the canvas view without rebuilding or repositioning world geometry.

No sprites, backgrounds, audio, levels, questions, physics models, scoring rules or save formats change. The thirty-mission Adventure, ninety repairs, twelve original labs, checkpoints and existing best score remain intact. Cloudflare configuration is unchanged.

## Validation

- 85 Physics checks, 13 shared score/fullscreen checks and 25 game-page/Sky Temple checks: **123 automated checks**. Seven new tests cover synchronized controls, user activation, native exit, prefixed APIs, unavailable/disabled fullscreen, rejection recovery, keyboard filtering, duplicate requests and preservation of the score bridge.
- The new browser harness exercises both modes at **13 viewport sizes**: 320×568, 360×640, 360×740, 375×667, 390×844, 412×915, 568×280, 568×320, 667×375, 844×390, 768×1024, 1024×768 and 1440×900. Each checks concurrent touch movement/jump, reachable controls, canvas sizing, fullscreen entry/exit from play and menus, native API exit, synchronized labels, paused state preservation during fullscreen rotation and best-score preservation. Desktop Alt+Enter and movement-input release are checked too.
- The harness uses Chromium safe-area overrides at 844×390 with 34-pixel left/right cutouts and a 21-pixel bottom inset, inside and outside fullscreen. Unavailable and rejected fullscreen APIs are separately simulated in both games, with continued movement verified afterward. These are local browser/device emulations, not physical iPhone/Safari certification; prefixed handling also has unit coverage.
- The original regression harness checks nine layouts, touch, fullscreen quiz answers, pause, rotation, reduced motion and unavailable storage/audio. All twelve original level fixtures now build in the smaller 568×280 viewport. Adventure smoke checks complete fullscreen repairs through actual movement and experiment controls in portrait and landscape, exercise the Settings fullscreen control, and retain blocked storage/audio and optional-diagram fallback checks. Sprite/state browser regressions continue to pass. No new full thirty-mission playthrough is claimed for this display-only increment.
- Phone and short-landscape views are visually inspected, including SVG fullscreen icons and the original boss view. Browser runs report no uncaught JavaScript errors. Next.js production build, JavaScript syntax, HTML IDs/local references, CSS parsing, JSON, existing-asset preservation and diff whitespace checks pass.

Run `node --test apps/web/scripts/physics-*.test.cjs`. With `PLAYWRIGHT_PATH` and `CHROME_BIN` set, run:

```
node apps/web/scripts/physics-display-browser.cjs
node apps/web/scripts/physics-legacy-browser.cjs
PHYSICS_SMOKE=1 node apps/web/scripts/physics-browser.cjs
node apps/web/scripts/physics-characters-browser.cjs
```

The new harness exposes isolated closure fixtures only in its local HTTP responses; no QA hook or progression shortcut ships in the game.

## Exact files

Added:

- `apps/web/public/games/physics-force-lab/display-controls.js`
- `apps/web/public/games/physics-force-lab/display-controls.css`
- `apps/web/scripts/physics-display.test.cjs`
- `apps/web/scripts/physics-display-browser.cjs`
- `docs/releases/physics-force-lab-v4.7.md`

Modified:

- `apps/web/public/games/physics-force-lab/index.html`
- `apps/web/public/games/physics-force-lab/original-labs.html`
- `apps/web/public/games/physics-force-lab/adventure.js`
- `apps/web/public/games/physics-force-lab/game.js`
- `apps/web/public/games/physics-force-lab/game.json`
- `apps/web/scripts/physics-browser.cjs`
- `apps/web/scripts/physics-legacy-browser.cjs`

## Installation

Pull `main` after the feature pull request merges, then use the existing Cloudflare/OpenNext build and deploy setup when ready. No ZIP, publication staging file, save migration or deployment configuration change is needed. Cloudflare deployment remains with the owner; this release does not claim a production deployment.
