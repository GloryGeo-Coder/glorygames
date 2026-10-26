# Space Pilot Platformer v1.6 — Vulcanis: Pirate Foundries

Adds the second Starfall Rift chapter, missions 6–10: docking codes, mining relay shutdowns, worker rescues, Mira's signal links and the Rogue Captain's final shipment. Complete Asterion to unlock the Vulcanis link on its mission screen. The separate `vulcanis.html` entry retains links to Asterion and the eight original missions. No later chapter is advertised as playable; the approved final information-page story remains unchanged.

Five canvas-native foundry illustrations add molten backgrounds, industrial silhouettes, metallic gantries, animated pirate patrol rigs and a Rogue Captain command rig. Existing white-armoured Nova, cyan/magenta collectibles and portals retain the established artwork. Each mission has an original synthesised arrangement; effects and independent volume controls remain available. New artwork uses no external download or dependency.

Mining cutters have a 3.6-second cycle: safe, amber warning at 1.6 seconds, then active at 2.2 seconds. Mining relays must be disabled in route order; each completed relay permanently silences its cutter group. Worker shelters unlock only after nearby pirate patrols are cleared. Warning indicators remain live with reduced motion enabled. Required cores and interactions remain on stable lower platforms; upper routes are optional. The Captain uses the established telegraphed laser fan and faster second phase. Levels grow from 5,000 to 7,400 world units.

## Saves and mobile reliability

Vulcanis saves separately under `wga_space_pilot_vulcanis_v1`; Asterion's `wga_space_pilot_asterion_v1` and the original `wga_space_pilot_campaign_v1` are unchanged. Initial Vulcanis settings inherit Asterion preferences. Completed objectives, pickups and enemy/Captain damage recover together at safe checkpoints, while partial interaction holds reset. The initial unlock requires persisted Asterion completion on the same origin/browser. Once Vulcanis has a run or completed mission, replaying Asterion as a new expedition cannot relock it; the mission screen explains that unavailable browser storage prevents cross-page chapter progression.

Touch controls, cancellation, pause, orientation fitting, fullscreen, aiming assistance and checkpoint handling use the existing engine. The shared score bridge recognises only the explicit new chapter entry in addition to its existing paths.

## Validation status

- 29 Node checks pass locally: original mission/generator preservation, previous chapter behavior and twelve Vulcanis geometry/interaction/machinery/save regressions.
- JavaScript syntax and whitespace checks pass.
- New browser regression script covers Asterion unlock/link navigation, 13 viewport sizes, simultaneous touch/cancellation, five actual-physics lower-route traversal fixtures, mission objectives/core gates, Captain laser exchange, machinery damage timing, refresh recovery and capability fallbacks. These controlled fixtures are not full real-time combat playthroughs.
- Production browser checks now include the real Vulcanis entry and score-bridge registration without fixture hooks.
- Browser scripts and production build must pass on the exact PR commit in CI before merge. Local managed preview infrastructure timed out; no local browser or physical-device certification is claimed.

## Deployment

No dependency, database, Cloudflare configuration, thumbnail or final information-page editorial changes. The owner performs Cloudflare deployment after merge using the existing process. This work does not deploy.
