# Science Lab Dash character artwork

The built-in image-generation tool created two transparent pose sheets using the existing game thumbnail as the identity reference. `hero.webp` preserves twelve poses of the original young scientist. `support.webp` preserves four poses each of Professor Nova, the analysis drone and the academy patrol scanner. Both source sheets are lossless WebP with alpha; they are outside public assets and are not downloaded by the game.

Run `node tools/build-science-characters.cjs` from the repository root to rebuild `apps/web/public/games/science-lab-dash/assets/chemistry/characters.png` and `chemistry-art-data.js`. Sharp is already a repository dependency. The builder extracts complete alpha-connected silhouettes, retaining antialiased edges, then scales each role consistently and aligns its feet. This handles illustrated poses that extend over approximate source-grid boundaries. The resulting RGBA atlas is 640 × 1152, with twenty-four padded 160 × 192 cells and about 2.81 MiB decoded allocation.

The runtime maps action states to drawn poses and supplies small secondary hover/breathing motion. Reduced decorative motion holds a representative pose. Missing art or metadata has a playable rendering fallback.

The same built-in tool created three new laboratory backgrounds. Their final 1280 × 720 quality-85 WebP files are `storeroom.webp`, `workshop.webp` and `archive.webp` under the game's `assets/chemistry/` directory. These encoded backgrounds are ready to deploy and do not require image generation during a build. The runtime requests the current location on demand. The selected files are independent of the unchanged original-dash backgrounds and thumbnail.

`prompts.json` records the exact prompt set, references, source paths and saved output paths. Sharp performs extraction, scaling, packing and encoding only; it does not repaint the selected illustrations. Experiment diagrams use precise SVG geometry and labelled observations rather than generated scientific diagrams.
