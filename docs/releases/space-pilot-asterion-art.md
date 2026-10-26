# Asterion artwork and audio sources

Created for Space Pilot Platformer: The Starfall Rift v1.5 with the built-in `image_gen` tool. All final images are project assets in `apps/web/public/games/space-pilot-platformer/assets/asterion/`. Original PNG output was encoded as WebP at quality 87, retaining source dimensions and transparency; no existing artwork or thumbnail was overwritten. Atlas frames are cropped at draw time using measured source rectangles in `asterion-art.js`. Eight WebP files total approximately 2.9 MiB.

## Final asset paths

- `apps/web/public/games/space-pilot-platformer/assets/asterion/pilot.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/objects.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/devices.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/crash.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/salvage.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/refuge.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/relay.webp`
- `apps/web/public/games/space-pilot-platformer/assets/asterion/gate.webp`

## Generation prompt set

### Pilot atlas

Use case: stylized-concept. Production game sprite atlas, transparent background. Create exactly 8 equally sized cells in a precise 4-column by 2-row grid on a square 2048x2048 canvas, no grid lines. Same full-body Pilot Nova in all cells, facing right in a side-on 2D platformer silhouette: white and gunmetal articulated armour, luminous electric blue visor, cyan details, small orange fasteners, compact jetpack, right-facing laser rifle. Premium painted 3D-render look with clear outlines, matches cinematic sci-fi game art. Every figure entirely within its own cell, identical scale and baseline with generous transparent margins. Row 1 left to right: relaxed ready stance, run left foot forward, run passing pose, run right foot forward. Row 2: jump ascending with knees bent, fall descending with legs extended, standing rifle firing with small cyan muzzle glow, recoil firing. True transparent alpha around each figure. No ground, shadows extending beyond cell, text, borders, checkerboard, logos or labels. Keep feet at 88% of each cell, head at 10%. Strong readable anatomy at small screen sizes.

### Objects atlas

Use case: stylized-concept. Production 2D platform adventure atlas. Transparent background, precise 4-column by 3-row grid, 1536x1152 canvas. Exactly twelve separated equally sized cells with generous clear margins, no grid lines. Premium polished sci-fi assets, gunmetal/white armour, electric cyan and magenta emissive lights, dimensional material detail. Row 1: spherical black magenta laser drone idle; same drone fins deployed; squat four-legged alien moon crawler with cyan eyes standing; same crawler with alternating feet extended. Row 2: large menacing round Asteroid Warden machine with magenta glowing reactor front view neutral; same Warden attack with reactor open; white-and-gunmetal crashed small explorer spaceship with cyan cockpit (Wayfarer); small sealed white rescue capsule cyan window. Row 3: long flat lunar-rock platform slab with cyan metal top edge (horizontal top surface); faceted bright cyan star core collectible; green-white shield pickup; upright cyan-magenta dimensional oval portal ring. All subjects fully inside cells and isolated with TRUE TRANSPARENT alpha. No text, no checkerboard, no labels, no backgrounds or ground shadows. Each subject occupies about 75% of own cell. Side/three-quarter views suitable for horizontal scrolling game.

### Devices atlas

Use case: stylized-concept. Production sprite atlas for sci-fi 2D platform adventure. True transparent alpha background. Exactly 6 fully isolated objects, evenly arranged in a strict 3-column by 2-row grid, no grid lines, each object with wide transparent margins and centred in its cell, no overlaps. Landscape 1536x1024 canvas. Premium detailed painted 3D game art, white and gunmetal surfaces, glowing cyan and magenta energy, cinematic material rendering. Row 1 left to right: a rugged irregular lunar asteroid with cracked grey rock and a faint orange molten fissure; same asteroid rotated about 35 degrees; a compact white communications beacon mounted on a small metal base with cyan antenna and bright blue display. Row 2 left to right: a salvaged starship engine assembly in a compact gunmetal case, white plating, cyan circular power coupling; a damaged satellite relay dish with cyan indicator on a small stand, silhouette fits one cell; a menacing rift anchor device, a black metallic tripod with contained magenta energy reactor. Entire objects within cells. No ground, no shadows outside objects, no text, no labels, no borders, no checkerboard. These are sprite cutouts, not an illustration of a scene.

### Crash Valley background

Use case: stylized-concept. Full-screen background painting for a horizontal scrolling sci-fi platform game, 1536x1024. Asterion shattered moon crash valley, deep navy sky, enormous fractured blue planet high above horizon, distant grey lunar craters and broken orbital rings, restrained cyan dawn glow and purple nebula wisps. Premium cinematic painted game environment resembling white-armoured explorer sci-fi art. Broad atmospheric depth, low-detail dark space in central gameplay area, remote scenery only, no foreground platform, no player, no characters, no HUD, no lettering, no border. Horizon in lower third. Full bleed to every edge; should crop beautifully to portrait and landscape.

### Remaining four backgrounds

Each uses this prompt template, substituting the scene below:

> Use case: stylized-concept. Production full-screen painted background for a 2D sci-fi platform adventure. 1536x1024 landscape, cinematic premium game environment with dimensional rocky textures and restrained cyan/magenta lighting. [SCENE] Horizon in lower third. Scenery is distant and non-interactive. No foreground platforms, no characters, no enemies, no HUD, no text, no border, no watermark. Full bleed to all edges, composition crops well to portrait and landscape.

- **salvage.webp:** A ruined orbital shipyard hanging above the shattered moon Asterion. Distant broken white space freighters and wrecked metal gantries, a broad indigo nebula, tiny drifting debris, cyan rim light with distant orange engine embers. Wide, atmospheric, quiet central space for platform gameplay.
- **refuge.webp:** An enormous moon cave open to space, blue and violet luminous mineral veins running through remote rock arches, distant abandoned scientific dome and cyan emergency beacons under a field of stars. Peaceful but mysterious. Open central gameplay space.
- **relay.webp:** A shattered communications relay on the lunar horizon, leaning satellite dishes and ruined transmission towers illuminated by distant gold sunlight, dark cobalt cosmos above with a cracked pale planet. Far-off machinery only, spacious central atmosphere.
- **gate.webp:** Asterion ancient rift sanctuary, vast distant stone and metal arches across a lunar crater, a monumental violet dimensional rift in the distant sky, cyan energy flowing through distant rock, stormy purple nebula light. Epic final-world-boss arena mood, spacious calm central gameplay area.

## Audio

`asterion-audio.js` contains five original Web Audio arrangements, with distinct melodies, roots, bass patterns and tempos of 78, 96, 72, 108 and 116 BPM. Final-sector intensity increases the lead gain. Drum, bass and lead voices are scheduled against the audio clock. Jump, collection, laser, damage, explosion, guardian defeat and interaction effects use separately enveloped frequency sweeps. No external recordings, streaming services or sound libraries are used. Music and effects follow the saved independent volume controls, start after a player gesture and stop scheduling on pause/briefing/hidden tab.
