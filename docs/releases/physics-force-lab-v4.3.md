# Physics Force Lab v4.3 — Grade 8: Electricity & Light

Chapter four adds five missions and fifteen repair investigations. The adventure now contains twenty missions and sixty repair stations, alongside the twelve preserved original labs. Newtonia and Pip trace the Quantum Core’s missing signal through a cargo yard, a resistor network and an optical beacon before reconnecting the signal tower.

## Shipped missions

| Mission | Selected Grade 8 topic | Investigation |
| --- | --- | --- |
| 16. The charged cargo yard | Static electricity | Transfer electrons between a cloth and rod; compare attraction and repulsion against already charged probes. |
| 17. The circuit causeway | Series and parallel circuits | Compare source and path currents as identical resistors are added in series or parallel. |
| 18. The beacon’s missing ray | Reflection and refraction | Aim a mirror, compare smooth/rough reflection and trace an oblique ray into air, water and glass. |
| 19. The spectrum gallery | Transmission and visible light | Compare an opaque/transparent window, disperse white light and recombine its spectrum. |
| 20. The signal-tower rescue | Magnetic effect, branch faults and reflection | Lift an iron load with a coil, isolate a local parallel branch and aim the tower mirror. |

The selected content follows Energy and Change in [DBE’s 2026 Grade 8 Natural Sciences ATP](https://www.education.gov.za/LinkClick.aspx?fileticket=7frUwtqsOU4%3D&forcedownload=true&mid=10749&portalid=0&tabid=3208), pages 8–10, and [CAPS Natural Sciences Grades 7–9](https://www.education.gov.za/LinkClick.aspx?fileticket=zhaFloMyZTs%3D&mid=1629&portalid=0&tabid=573). This is selected physics content, not the whole Natural Sciences syllabus. Ray presets illustrate relationships without assessing angle measurement or refraction equations. Other current effects, lenses, astronomy and non-physics strands are not claimed as completed.

## Learning and play

Each station requires a prediction, tests at two different equipment settings, a successful outcome and a correct evidence explanation. Duplicate tests and unrelated switch flags cannot satisfy the comparison requirement. Mistakes cost no lives. Two-stage hints, checkpoint retries and the field notebook remain available.

The new scalable diagrams show electron transfer, particle counts and charge signs; complete circuit paths and current readings; rays, normals and a marked target receiver; transmission/shadows; dispersion/recombination; and a powered magnetic crane. Written observations provide the same evidence without relying on sound or colour. New diagrams resize with the experiment card, and longer selectors remain contained on narrow screens. Decorative pulses respect reduced motion.

The numerical models are illustrative, not laboratory readings. Rod/cloth counts conserve electrons and net charge while keeping protons fixed. Probes are already charged; neutral-object polarisation is outside this model. Series/parallel comparisons use identical fixed 15 Ω resistors and an ideal 3 V source, not nonlinear lamp filaments. Source current equals the sum of parallel branch currents. Opening a local parallel branch leaves another complete branch powered; opening the only series path interrupts both lamps. The coil comparison maintains current and core while changing turns, with abstract lifting units. Refraction uses fixed transparent-medium properties internally, while learners interpret direction rather than calculate equations. The spectrum combiner is schematic and mixes light, not paint.

New missions reuse the established 4,400-unit route, optional inspection platforms and recoverable drone patrols. They retain the existing backgrounds and add code-drawn electrical/optical apparatus. The workshop wall grows to display all twenty mission photographs. Five new original synthesized arrangements bring the music total to twenty, with electrical and optical test effects and separate volume settings.

## Compatibility

The first fifteen mission definitions remain data-equivalent to v4.2. The same save key, format version, previous checkpoints, sequential unlocks, reward records, settings and notebook entries remain in use. A completed Grade 7 save advances into mission sixteen; an unfinished replay resumes its own checkpoint. Grade 8 choices, trial evidence and hints survive refresh. Recorded discoveries survive mission retries, and completed missions cannot be farmed for repeated completion rewards.

Older cached entry pages can run their original ten or fifteen missions without the optional Grade 8 modules. The twelve original labs, their entry/runtime/styles, source PNG assets, original best-score key, shared launch/score/fullscreen code, other games and Cloudflare configuration are unchanged. The platform’s final editorial/game-page rewrite remains deferred until Grade 10 is complete.

## Exact file list

Added:

- `apps/web/public/games/physics-force-lab/adventure-grade8.js`
- `apps/web/public/games/physics-force-lab/adventure-signal-ui.js`
- `apps/web/scripts/physics-grade8.test.cjs`
- `docs/releases/physics-force-lab-v4.3.md`

Modified:

- `apps/web/public/games/physics-force-lab/adventure-data.js`
- `apps/web/public/games/physics-force-lab/adventure-audio.js`
- `apps/web/public/games/physics-force-lab/adventure.js`
- `apps/web/public/games/physics-force-lab/adventure.css`
- `apps/web/public/games/physics-force-lab/index.html`
- `apps/web/public/games/physics-force-lab/game.json`
- `apps/web/scripts/physics-adventure.test.cjs`
- `apps/web/scripts/physics-grade7.test.cjs`
- `apps/web/scripts/physics-browser.cjs`

## Validation

- Forty Physics checks cover sixty reachable repair targets, meaningful alternatives, preserved earlier mission data, twenty distinct music phrases, charge conservation, current accounting, optical relationships, local branch faults, saves, hints, notebook retention, wire routing and route physics.
- Thirteen shared score/fullscreen checks and twenty-five game-page/Sky Temple launch checks pass: 78 automated checks in total.
- A touch-enabled browser completes missions 16–20 through actual movement and equipment controls from a completed-v4.2 save fixture. It exercises an incorrect explanation, progressive hints, refresh during a static-electricity investigation, all sixty notebook entries, retained findings after a retry and preservation of the legacy best-score key.
- Responsive checks cover 320×568, 360×740, 375×667, 390×844, 568×320, 844×390, 768×1024, 1024×768 and 1440×900. They include concurrent movement/jump touches, reachable controls, state-preserving rotation, fullscreen/audio settings, scrollable experiments and unavailable storage/audio. Each new mission’s first experiment is also resized across those nine layouts. Phone circuit, charge and ray diagrams are visually inspected.
- A cumulative browser playthrough covers all twenty missions, including earlier wire-board and temperature-table refresh regressions, optional platform collection, and the original-lab startup smoke check. Passing runs report no uncaught JavaScript errors.
- Next.js production build, JavaScript syntax, HTML IDs, local references, JSON, CSS parsing and diff whitespace checks pass.

Run `node --test apps/web/scripts/physics-*.test.cjs`. For browser QA, set `PLAYWRIGHT_PATH` and `CHROME_BIN`, then run `node apps/web/scripts/physics-browser.cjs`. `PHYSICS_CHAPTER=4` starts from the completed Grade 7 fixture; no chapter argument tests the full adventure. Optional `PHYSICS_SCREENSHOTS` writes local QA screenshots. CI automatically discovers the new Physics test file.

The increment is merged to `main` through a feature pull request after checks pass. Deploy the current `main` using the existing Cloudflare build configuration; no separate ZIP or publication staging file is required. Deployment remains with the owner. Continue with Grade 9, then Grade 10 and the final public game details.
