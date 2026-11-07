# BioQuest character sprites

Generated with the built-in image generation tool on 2026-11-07 using the approved BioQuest `../../thumb.webp` as the character and rendering-style reference. No substitute vector or CSS artwork was used.

## Production geometry

- `nala.webp`: 1536 × 512 RGBA WebP; four 384 × 512 frames, aspect ratio 3:4.
- `pip.webp`: 1280 × 320 RGBA WebP; four 320 × 320 frames, aspect ratio 1:1.
- Both strips run left to right. Use `background-size: 400% 100%` with discrete horizontal positions 0%, 33.333333%, 66.666667%, 100%.
- Nala poses: relaxed, head tilt, blink, small wave. Pip poses: cheerful, blink, cheerful variations.
- Preserve each frame's aspect ratio. A reduced-motion presentation can use the first frame.

## Generation prompt summary

Create a genuinely transparent 4-column, 2-row production sprite atlas in the approved thumbnail's cinematic stylized 3D style, preserving character identity and consistent scale, lighting, and camera. Top row: full-body Nala with warm brown skin, dark curly ponytail, silver goggles, small gold hoops, olive explorer jacket and South African flag patch, beige shirt, hiking trousers and boots, backpack, botanical journal; subtle expressive idle poses. Bottom row: Pip with white spherical shell, glossy black face, cyan smiling eyes and side rings, fin rotors, and underside glow; four cheerful/blinking idle poses. No text, labels, scenery, or ground shadows.

## Processing and checks

The generated 1536 × 1024 PNG was mechanically split with ImageMagick and encoded as quality-90 WebP with alpha quality 100. Nala retains its full 384 × 512 cells. Pip cells were identically cropped to x=32..351, y=80..399 of their original 384 × 512 bottom-row cells, then concatenated into a square-frame strip. All four Pip silhouettes and their principal glow fit the common crop. Both strips were visually checked composited on dark green; generated alpha was preserved.
