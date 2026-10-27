# Space Pilot Platformer v1.13 — Campaign guardians

All 30 Starfall Rift missions now end with a guardian. The existing six chapter finales and their mechanics remain unchanged. The first four missions of each world receive a guardian with a world-specific design, a health bar, telegraphed laser attacks and scaling health. The portal requires its defeat as well as the existing cores and mission objectives. The separate original route is unchanged.

Saved progress remains compatible: the guardian is appended after existing enemies, so older checkpoints retain their enemy and objective state and begin the new fight with a healthy guardian. Defeated guardians and damage use the existing checkpoint format.

## Art

Six transparent 2×2 WebP atlases under `apps/web/public/games/space-pilot-platformer/assets/campaign-bosses/` were created with the built-in image-generation tool and encoded as WebP. The renderer selects one design per mission and animates hover, impact and attack warning; reduced motion suppresses decorative animation. Existing chapter finale art remains intact.

Prompt set: side-scrolling game boss atlas, four different full-body enemies in a strict 2×2 grid, transparent background, detailed illustrated sci-fi game art, glowing weak core, no text or borders. World-specific directions: Asterion moon salvage machinery in white and magenta; Vulcanis volcanic pirate foundry machinery in orange and iron; Luminara crystal guardians in amethyst and cyan; Cryon frozen station guardians in ice blue and silver; Verdantis biomechanical jungle creatures in emerald and pink; NOVA-X rift fortress commanders in dark indigo and neon red.

## Verification and deployment

Run `node --test apps/web/scripts/space-pilot-bosses.test.cjs` alongside the existing Space Pilot tests. The Space Pilot workflow also runs the continuous campaign, mobile viewports, boss encounters, saves and production build. The update is deployed by the site owner through the established Cloudflare workflow after merging.
