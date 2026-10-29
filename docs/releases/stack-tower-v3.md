# Stack Tower v3 — Skyline Adventure

The endless tower challenge now climbs through Harbour Heights, Cloud Gardens and Aurora Summit at floors 0, 10 and 20. Every ten floors begins a fresh stage: three perfect drops in that stage earn 400 bonus points, and every four perfect drops in the stage earn one repair (up to two held). Repair widens the settled top and the next moving block without consuming a charge when already at maximum width. The final skyline continues for an unlimited run.

Focus Mode, best-height key, score bridge, pause, keyboard, touch and fullscreen entry remain available. Music changes melody with the skyline; music and effects can be muted independently. The layout supports portrait and landscape screens and the playfield scales when the device is rotated.

## Image assets

The built-in image-generation tool created three full-bleed vertical backgrounds, encoded as WebP at `apps/web/public/games/stack-tower/assets/backgrounds/skyline-{city,clouds,aurora}.webp`. Prompt set: "A premium whimsical 3D animated-film background for a mobile family tower-building game, with clear central play space, no UI or text"; the scenes are respectively a sunrise waterfront city, blue sky with floating gardens, and a star-filled aurora above clouds.

## Checks

`node --test apps/web/scripts/stack-tower-logic.test.cjs` tests the stage, bonus and repair rules. `apps/web/scripts/stack-tower-browser.cjs` covers portrait, landscape and desktop layouts, real placement interactions, 21 floors, stage transitions, repair, pause, audio controls, best-height persistence and unavailable storage/audio. The GitHub workflow runs both checks and saves screenshots. Production deployment is performed separately by the site owner.
