# Neon Hover Runner — City Blackout

A five-district courier story adds a new briefing at each existing zone transition. The optional zone objectives, scores, controls, life recovery and completion route remain in place. The existing hoverboard rider now has cruising, turning, jumping and boost poses; the original sprite remains the fallback. New Data Tunnel and Reactor Bridge scenes and an animated-hover security drone complement the existing city art. Converted WebP copies reduce mobile downloads without altering the original PNG assets.

Each zone has its own generated synth melody with bass and percussion; new boost and impact effects join the existing jump, collection and mission sounds. Music and effects levels can be adjusted independently. Swipe movement accumulates small pointer movements, panels scroll on small screens, best scores save correctly, and unavailable browser storage or audio does not block play. The five-distance campaign retains its existing optional objectives rather than requiring those objectives to finish a zone.

## Artwork

Built-in image generation produced `assets/v3/rider.webp`, `drone.webp`, `data-tunnel.webp`, and `reactor-bridge.webp`. Prompts: a 2×2 transparent sprite atlas preserving the original blue-haired rider, black neon jacket and cyan/magenta hoverboard across cruise, turn, jump and boost; an isolated magenta-eyed security drone; a neon data tunnel viewed down the centre of the road; and an amber reactor bridge viewed down the centre of the road. The other WebP files in that directory are resized conversions of existing game assets.

## Verification

`node --check` validates the JavaScript. The Neon Hover GitHub workflow checks five mobile and desktop viewports, slow swipes, jump and boost, each rider pose, independent audio levels, five story zones, saved scores and unavailable storage/audio. The site owner deploys through Cloudflare after merge.
