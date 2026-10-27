# Space Pilot Platformer v1.8 — Cryon: Frozen Orbit

The fourth Starfall Rift chapter adds missions 16–20 across ice caverns, a derelict orbital station and the Frost Mothership’s hangar. Complete Luminara to unlock `cryon.html`. The original eight missions and all three earlier chapters retain their content, save keys and entry links. The exact approved storyline remains reserved for the final information-page editorial.

## Five missions

- **A Light Beneath the Ice:** restore three thermal relays. Each relay thaws its route section, restoring braking traction, and permanently silences a frost-jet group. Ice carries momentum after movement is released; reverse input remains responsive.
- **The Silent Station:** restore docking power west to east. Later relays explain the required order instead of silently accepting input. Optional service lifts offer spare cores.
- **Warmth for the Lost:** clear drones within 200 units of each cryopod before releasing four expedition specialists.
- **Cold Circuit:** close coolant valves during their blue low-pressure interval. The five-second cycle warns in amber from 2.8–3.5 seconds, then activates frost jets until the cycle resets. Completed valves permanently isolate their jet group.
- **Winter’s Last Engine:** open three exhaust vents, then attack the Frost Mothership during its blue hull windows. Its six-second armour cycle exposes the hull for 2.6 seconds, with amber warning from 2–2.6 seconds; the rest of the cycle blocks damage. Existing laser volleys and the faster second combat phase remain active.

Every required objective and core is accessible from a stable lower route. Optional upper lifts cannot become saved checkpoints. Level widths grow from 5,400 to 7,800 units. Five original animated canvas landscapes, frost sentries, readable machinery and a broad-winged carrier retain Nova’s established white-armoured artwork. Five original synthesised music arrangements and seven effects retain independent volume controls. Reduced motion freezes decorative animation, not live danger indicators.

## Continuity

Cryon saves separately under `wga_space_pilot_cryon_v1`; first-run settings inherit Luminara. Completed objectives, collected items and enemy damage persist at safe checkpoints. Derived thaw and jet states are reconstructed from saved objectives; partial holds reset. Existing Cryon progress permits return even if an earlier chapter is restarted. Cross-page unlocks need browser storage, with an explicit message when unavailable.

The shared engine receives only chapter selection, next-chapter links, an optional chapter-specific ground-drag hook and a chapter-specific shield hint. Earlier chapters retain their original drag and shield behavior. Simultaneous touch, cancellation, pause, fullscreen, orientation fitting, aim assistance and checkpoint recovery remain supported. No dependency, thumbnail, database, deployment configuration or final editorial change.

## Verification

- 62 Node tests pass locally, including all earlier route/chapter tests and 17 Cryon checks. JavaScript syntax checks cover the new chapter and test scripts.
- The established GitHub browser workflow now includes Cryon: 13 viewport sizes, carried settings, simultaneous touch/cancel, five actual-physics lower-route fixtures, blocked-action phone hints, frost timing, traction, hull shielding/projectiles, story progression and recovery/fallbacks.
- Screenshots cover all five landscapes and the Mothership on portrait phone, landscape phone and desktop, alongside home, briefing, controls and completion states.
- Existing CI retains all earlier browser suites, a Next.js production build and production-entry checks without fixture hooks, now including Cryon.
- Browser tests are controlled fixtures, not full real-time combat playthroughs or physical-device certification. Local managed preview was unavailable; no alternate local browser path was used. Exact-head CI and independent code/visual review must be verified before handoff.

## Release control

Draft review only: no merge or deployment. Cloudflare deployment remains with the owner. Verdantis, NOVA-X and final campaign editorial remain separate future increments.
