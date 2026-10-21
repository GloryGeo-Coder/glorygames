# Cyber Shield Academy: Terminal Ops v3.1 — Mobile layout and investigation fixes

Based on `main` at `2421574690ec1bee72de5f51284b9537ab7731d9`. This is an incremental update to the existing eight-chapter Case BIT campaign. All original backgrounds, character images, thumbnail, tools, chapter text, command routes, music and effects remain in the game. No asset files change.

## Mobile and desktop behaviour

At widths up to 1160px, Terminal, Mission, Network, Files and Toolkit become five accessible panels. Each panel scrolls within the visible viewport; switching panels does not reset the investigation. The command input, run button, touch autocomplete/history controls and case controls stay reachable in portrait and landscape. VisualViewport resize handling follows the available height when browser bars or a software keyboard change it. Short visible areas compact the header and prompt. Inputs use 16px text, disabled autocorrect/capitalisation and a send key hint. Safe-area padding accommodates cutouts. Welcome controls fit short screens; optional welcome badges are hidden there.

Tap a file or an available tool to insert its command, review it, then press run. Available network nodes are native buttons with accessible labels; locked nodes are disabled. The map uses a grid so nodes no longer overlap or spill outside a narrow panel. Command completion chooses hosts, files or tools based on the command context, rather than completing a filename to the unrelated `briefing` command. Previous/Next recall command history. Tab completion and arrow-key history remain available, with Shift+Tab allowing keyboard focus to leave the input. Panel tabs support Left/Right/Home/End. Reduced-motion preferences stop node animation.

Wider screens keep the three-column workspace. Briefing, files, network and tools have independent scrolling so content remains reachable on short desktop windows. Sound, reset and score controls are grouped under Case controls. The existing Enter/Exit Fullscreen control moves into that menu after starting and remains reachable during play. Reset asks before clearing the current investigation. Existing desktop and new-tab launch routes remain unchanged.

## Investigation and score corrections

- Report submission requires every investigation objective and a compiled report, while connected to the final host. The final completion reward is awarded once.
- Undecoded cipher evidence cannot satisfy the collection objective. LogAudit only awards the relay objective while used on the relay.
- The containment timer pauses when the document is hidden, and an expired timer blocks further commands until reset.
- Score metadata and messages use the platform's canonical `cyber-shield-academy` identifier, fixing final submission rejection caused by the old terminal suffix. Existing event formats and shared score transport remain intact.
- File text renders its encoded newlines as readable lines. Existing simulated lab scope and content are retained.

## Validation

Run `node --check apps/web/public/games/cyber-shield-academy/game.js` and `node --test apps/web/scripts/cyber-shield.test.cjs`. Six controller regression tests drive the shipped UI handlers through all eight chapters, premature/duplicate report submission, cipher prerequisites, hidden-tab trace pause, lockout/reset, compact panels, navigation, completion/history, insertion controls, viewport resizing and asset references. The new Cyber Shield GitHub workflow runs these checks.

For real-browser QA, supply an installed `playwright-core` module and Chromium executable to `apps/web/scripts/cyber-shield-browser.cjs` through `PLAYWRIGHT_MODULE` and `CHROMIUM_EXECUTABLE`. Set `CYBER_QA_OUTPUT` to choose the screenshot/result directory. The script serves the existing public directory locally, checks eight layouts (320×568, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900), switches every compact panel, checks input/control bounds and page overflow, swipes the command strip, tests fullscreen, completion/history and cancellation/acceptance of reset. Four layouts complete every chapter through visible controls. A reduced visible area checks keyboard-resize behaviour. Browser emulation does not replace physical iOS/Android keyboard testing.

Validation passed: 1,113 repository Node checks, 25 React checks, the local Next.js production build, and all eight Chromium 151 viewport checks, including four full campaign playthroughs. There were no browser script errors or failed asset requests. GitHub check results and the merge are recorded in the PR. Cloudflare deployment remains the owner's step; no deployment is performed as part of this release.

## Recommended next development

1. Save/resume checkpoints, including evidence, chapter objectives, toolkit, score and preferences. The current game stores no campaign progress, so refreshing restarts the investigation. Offer a retry of the containment chapter instead of replaying the whole case.
2. Extend eight chapters to sixteen with distinct investigations: phishing evidence triage; MFA/account recovery; permission review; patch prioritisation; backup restoration; network segmentation; privacy/redaction; and a multi-system response capstone. Each should require interpreting evidence and choosing a response, rather than repeating an identical command sequence.
3. Add progressively revealing hints, explanations of why a response works, and a case debrief showing the skills learned and mistakes to revisit.
4. Add optional untimed practice, readable text-size settings, and separate music/effects volume settings. Test these on physical phones before publication.

The eight-chapter story remains intact in this release. Level expansion is a follow-up recommendation, not a claim of added missions.

## Exact files

Modified:
- `apps/web/public/games/cyber-shield-academy/index.html`
- `apps/web/public/games/cyber-shield-academy/styles.css`
- `apps/web/public/games/cyber-shield-academy/game.js`
- `apps/web/public/games/cyber-shield-academy/game.json`
- `apps/web/src/content/gameEditorials.ts` (Cyber Shield mobile instructions only)

Added:
- `apps/web/scripts/cyber-shield.test.cjs`
- `apps/web/scripts/cyber-shield-browser.cjs`
- `.github/workflows/cyber-shield.yml`
- `docs/releases/cyber-shield-v3.1.md`

Deploy the merged repository using the existing Cloudflare process. No manual file copying or incremental ZIP is needed. The game entry remains `/games/cyber-shield-academy/` and the existing information page remains `/play/cyber-shield-academy`. Deployment configuration, other games and original assets are unchanged.
