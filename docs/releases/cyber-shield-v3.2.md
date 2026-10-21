# Cyber Shield Academy: Terminal Ops v3.2 — Saved investigations and Beacon campaign

Incremental release based on `main` at `335f51dcf41207c14de14b97734f192a03b97ad9`. The original eight Case BIT chapters lead into eight new Beacon investigations. All original backgrounds, sprites, thumbnail, sounds, simulated tools and terminal commands remain available. No original asset files or deployment configuration change.

## Sixteen missions

The Case BIT report still closes the original investigation in chapter eight, then unlocks Beacon with Bit as an adviser. New hosts unlock sequentially; the final academy reward is awarded once after chapter sixteen.

| Chapter | Mission | Player task |
| --- | --- | --- |
| 9 | The Borrowed Sender | Compare a message with a trusted directory, preserve it, then decide how to contain and verify it. |
| 10 | The Endless Approval | Review unexpected MFA prompts, choose verified recovery and session revocation, then collect the identity report. |
| 11 | A Key for Every Door | Compare duties with permissions and remove excess access while preserving the volunteer's legitimate task. |
| 12 | The Backup That Matters | Compare two backup signatures, choose the verified snapshot, restore 48 fictional records into the isolated recovery area and retain the test report. |
| 13 | Patch with a Plan | Prioritise an exposed service, with staging checks, approval and rollback. |
| 14 | Keep the Clinic Connected | Isolate the identified kiosk segment while keeping clinic appointments and responder access available. |
| 15 | Only What We Need | Choose the permitted district counts, generate a summary excluding resident details and collect that summary. |
| 16 | Beacon Holds the Line | Preserve an incident timeline, contain the identified path, combine earlier recovery/privacy evidence and submit a response report. |

Six simulated tools support these tasks: MailLens, AccessReview, RestoreLab, PatchPlan, SegmentSim and PrivacyLens. Review tools and response choices require the mission evidence first. `decide <choice>` and `restore <snapshot>` supplement the original commands. The Mission panel provides accessible response buttons, explanation text and visible prerequisite status. Incorrect choices explain their consequences; repeating the same wrong choice does not repeatedly reduce trust. Correct actions update the simulated files, including permissions, routes and the restored timetable; those changes survive reload. All addresses, people, services and records are fictional. Backup signatures are explicitly labelled training tokens, not cryptographic verification.

## Saves, retries and practice

Progress saves after starting, commands, hints, timer ticks and pagehide/hidden events. Continue Investigation restores the current host, directory, objectives, collected evidence, score/trust, trace/lockout, command history, recent terminal output and chapter checkpoints. Sound preference persists. Saves are local to this browser and origin; changing devices, clearing site storage or using another browser does not transfer progress.

The current chapter's entry checkpoint retains all earlier chapter completions and evidence. Retry Chapter resets current-chapter work and points to that entry state. Hint usage, choices to revisit and retry count remain in the learning record. A timer lockout survives refresh and can be recovered through a chapter retry; the entire campaign does not need to restart. Reset Campaign asks before clearing campaign progress and removes the old practice session.

Storage keys:
- `wga_cyber_shield_campaign_v1`
- `wga_cyber_shield_practice_v1`
- `wga_cyber_shield_preferences_v1`

The schema has an explicit version, bounds and allowlists. Saved executable content or arbitrary file systems are never loaded: authored files are rebuilt and completed actions reapplied. Host access derives from completed chapter objectives. Unknown or malformed saves fall back safely. Blocked storage or quota failure does not prevent session play or in-memory retries; the game displays a saving-unavailable notice. v3.1 had no campaign persistence to migrate, and unrelated storage keys remain untouched.

Untimed Practice is available from the welcome screen and Case controls. Choose any unlocked chapter. The countdown is disabled, practice completion stays in that chapter, and practice submits no leaderboard scores. Its save is separate from the campaign. Return to Campaign restores the campaign session, including an existing containment lockout if present. Practice cannot unlock later campaign chapters.

## Hints and learning feedback

Hints are tracked per unfinished objective. The three steps reveal the chapter principle, the relevant task and then a useful command or response. Hints do not automatically award objectives or score. Decision feedback explains why a response fits or misses the evidence. Chapter completion records a specific learning takeaway. `debrief` or Learning Review shows completed skills, hint use, choices to revisit and retry count.

Mobile panel navigation, 16px command input, touch completion/history, software-keyboard height handling, safe-area padding, reduced motion and persistent fullscreen access from v3.1 are retained. New mission panels scroll internally, welcome controls fit small screens, and the practice selector is not rebuilt on timer ticks. Decision controls retain focus when possible; a new chapter returns the Mission panel to its heading. Local save status is announced only when its message changes.

## Validation

- Twenty dedicated checks drive the shipped controller through the full campaign, refresh in all sixteen chapters, retries at containment/finale, corrupted/blocked storage, generated-file restoration, progressive hints, wrong-choice feedback, locked practice, practice refresh/return, score isolation, final report prerequisites, sound preferences, canonical score messages and foreign-frame controls.
- Real Chromium QA covers eight sizes: 320×568, 390×844, 844×390, 768×1024, 1024×768, 1160×700, 1280×600 and 1440×900. Four layouts complete all sixteen missions through visible inputs and response buttons. Additional mobile flows reload a partial containment chapter, retry it, complete untimed practice, reload practice, return to the campaign and reset with confirmation. Browser checks also cover horizontal touch scrolling, keyboard-area resizing, fullscreen, bounds and failed requests/script errors.
- Repository Node and React regressions, the local Next.js production build, JavaScript syntax, JSON, CSS parsing, unique HTML IDs and asset references are checked before merge. The GitHub workflow runs the Cyber Shield syntax and controller suites.

Browser emulation is not physical iOS/Android keyboard testing. No Cloudflare build or deployment is performed by this release; publication remains the owner's step.

## Exact incremental file list

Modified:
- `.github/workflows/cyber-shield.yml`
- `apps/web/public/games/cyber-shield-academy/index.html`
- `apps/web/public/games/cyber-shield-academy/styles.css`
- `apps/web/public/games/cyber-shield-academy/game.js`
- `apps/web/public/games/cyber-shield-academy/game.json`
- `apps/web/scripts/cyber-shield.test.cjs`
- `apps/web/scripts/cyber-shield-browser.cjs`
- `apps/web/src/content/gameEditorials.ts` (Cyber Shield only)
- `apps/web/src/lib/gameCatalog.ts` (Cyber Shield only)

Added:
- `apps/web/public/games/cyber-shield-academy/cyber-campaign.js`
- `apps/web/public/games/cyber-shield-academy/cyber-progress.js`
- `apps/web/scripts/helpers/cyber-runtime.cjs`
- `apps/web/scripts/cyber-shield-progress.test.cjs`
- `docs/releases/cyber-shield-v3.2.md`

Deploy the merged repository using the existing Cloudflare process. Entry and information-page URLs stay `/games/cyber-shield-academy/` and `/play/cyber-shield-academy`. No ZIP or manual file copying is required. All fourteen changes apply over the complete existing repository; unrelated games and original assets are untouched.
