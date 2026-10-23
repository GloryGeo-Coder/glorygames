/** The reviewed public-game catalog is the canonical editorial classification. 
 * It corrects legacy database rows without requiring a production migration,
 * while a separate admin sync can persist categories to the database.
 * Unknown/new games retain their database category and description.
 */
export const GAME_CATEGORIES = ["ARCADE","ACTION","ADVENTURE","EDUCATIONAL","PUZZLE","RACING","WORD_TRIVIA","STRATEGY","SPORTS","SIMULATION","DEFENSE","PLATFORMER","CASUAL","MULTIPLAYER","KIDS_FAMILY"] as const;
export type GameCategoryValue = (typeof GAME_CATEGORIES)[number];

type CatalogEntry = { category: GameCategoryValue; description: string };

export const GAME_CATALOG: Record<string, CatalogEntry> = {
  "brick-blaster": { category: "ARCADE", description: "Move your paddle, angle the bouncing ball through brick formations, collect power-ups and pursue a high score." },
  "bubble-pop-arena": { category: "CASUAL", description: "Pop bubbles against the clock, build combos, collect time and freeze effects, and steer clear of bomb bubbles." },
  "city-quest-rise-of-the-guardian": { category: "ADVENTURE", description: "Explore township rooftops, markets and taxi ranks as a Guardian completing NPC missions, battles and platform challenges." },
  "climate-rescue-quest": { category: "EDUCATIONAL", description: "Restore cities, forests, rivers and oceans in 25 animated missions with responsive touch controls and original nature-inspired music." },
  "cyber-shield-academy": { category: "EDUCATIONAL", description: "Solve 16 simulated cybersecurity investigations with saved checkpoints, evidence-led decisions and untimed practice." },
  "fruit-slice": { category: "ARCADE", description: "Swipe through flying fruit, build slicing combos, avoid bombs and respond quickly to frenzy mode." },
  "high-spead-racer": { category: "RACING", description: "Race AI rivals, change lanes, use nitro, pass checkpoints and progress through a multi-level arcade racing campaign." },
  "kasi-quest": { category: "ADVENTURE", description: "Jump through township-inspired platform missions, meet NPCs, collect coins, unlock upgrades and face bosses." },
  "lost-jungle-3d-temple-of-the-sun": { category: "ADVENTURE", description: "Search for Sun Relics and keys, cross dangerous jungle platforms, solve temple puzzles and face guardians." },
  "map-master-africa": { category: "EDUCATIONAL", description: "Practise Grades 4–10 geography through 84 missions and 504 tasks, with a world atlas and all nine South African provinces. All seven paths include revision and printable grade/topic learning summaries." },
  "math-sprint-arena": { category: "EDUCATIONAL", description: "Explore separate Grade 4 and Grade 5 maths paths with 40 untimed missions, 400 Adventure and practice activities, visual tools, saved checkpoints and focused revision, or play the 52-level Sprint." },
  "neon-hover-runner": { category: "RACING", description: "Steer a futuristic hover runner around hazards, jump barriers and collect energy, shields, magnets and boosts." },
  "neon-orb-defender": { category: "DEFENSE", description: "Defend a futuristic Neon Orb, rescue friendly AI units and repel rogue robots and drones across 25 missions with animated combat and original level music." },
  "physics-force-lab": { category: "EDUCATIONAL", description: "Follow a young physicist through 12 educational missions about forces, gravity, energy, circuits and other concepts." },
  "recycle-rush": { category: "EDUCATIONAL", description: "Restore Verdale with animated characters, hands-on activities, community work orders, collection dispatch and five Grime showdowns across 25 story missions, plus 20 arcade missions." },
  "science-lab-dash": { category: "EDUCATIONAL", description: "Restore Nova Science Academy by completing 20 science missions, collecting evidence and solving challenges." },
  "sky-temple-3d-rise-of-the-relic-master": { category: "ADVENTURE", description: "Explore floating islands and ancient temples, gather relics, unlock powers and challenge fantasy guardians." },
  "space-dodger": { category: "ACTION", description: "Pilot a 3D spacecraft through asteroid fields, engage enemy ships, activate boosts and complete story missions." },
  "space-pilot-platformer": { category: "PLATFORMER", description: "Guide Pilot Nova across asteroid platforms, gather star cores, overcome drones and battle level bosses." },
  "stack-tower": { category: "PUZZLE", description: "Drop precisely timed blocks, chain perfect placements, use Focus Mode and build the tallest tower you can." },
  "swipe-racer": { category: "RACING", description: "Steer through traffic, collect pickups and use nitro across city, mountain, coast and neon-night routes." },
  "word-dash": { category: "WORD_TRIVIA", description: "Type or tap target words, build spelling streaks and tackle timed vocabulary challenges with helpful power-ups." },
};

export function catalogCategory(slug: string, fallback: string | null | undefined = "ARCADE"): GameCategoryValue {
  const known = GAME_CATALOG[slug]?.category;
  if (known) return known;
  return GAME_CATEGORIES.includes(fallback as GameCategoryValue) ? fallback as GameCategoryValue : "ARCADE";
}

export function catalogDescription(slug: string, fallback?: string | null): string | null {
  return GAME_CATALOG[slug]?.description ?? fallback ?? null;
}

export function catalogGame<T extends { slug: string; category?: string | null; description?: string | null }>(game: T): T & { category: GameCategoryValue; description: string | null } {
  return {
    ...game,
    category: catalogCategory(game.slug, game.category),
    description: catalogDescription(game.slug, game.description),
  };
}
