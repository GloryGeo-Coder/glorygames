# Climate Rescue Quest — Thumbnail refresh

The cover now matches the animated leaf superhero, falling eco-collectibles, green city and purple Carbon Boss in the current game. The old V2, ten-level badge and feature-list text are removed. Only the game title appears in the artwork, keeping it useful as the campaign develops.

The new PNG replaces `apps/web/public/games/climate-rescue-quest/thumb.png`. Existing `game.json` thumbnail references, game cards and game-page launch artwork continue to use that path. Gameplay code, saves, music, backgrounds, hero sheets and other games are unchanged.

The asset manifest moves the explicitly replaced thumbnail out of the preserved-image list and records its old and new hashes, complete built-in image-generation prompt, reference roles, dimensions and byte size under `replacedArtwork`. The 48 remaining original PNG assets retain their previous hashes. The existing preservation test validates that distinction and verifies the new cover against the game's thumbnail reference.

The incremental package contains exactly four payload files: the thumbnail, its existing provenance manifest, the adjusted asset-preservation test and these release notes. Apply its `files/` contents over the complete repository at `d5b9dd18cd89cae4801e6cb6ae73f0d63cb50ac3`. Merge directories and replace only the listed files. Do not replace the whole game directory. The ZIP installation guide and pull request record validation and publication separately.
