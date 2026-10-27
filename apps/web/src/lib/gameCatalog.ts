/** The reviewed public-game catalog is the canonical editorial classification. 
 * It corrects legacy database rows without requiring a production migration,
 * while a separate admin sync can persist categories to the database.
 * Unknown/new games retain their database category and description.
 */
export const GAME_CATEGORIES = ["ARCADE","ACTION","ADVENTURE","EDUCATIONAL","PUZZLE","RACING","WORD_TRIVIA","STRATEGY","SPORTS","SIMULATION","DEFENSE","PLATFORMER","CASUAL","MULTIPLAYER","KIDS_FAMILY"] as const;
export type GameCategoryValue = (typeof GAME_CATEGORIES)[number];

type CatalogEntry = { title?: string; category: GameCategoryValue; description: string };

export const GAME_CATALOG: Record<string, CatalogEntry> = {
  "brick-blaster": { category: "ARCADE", description: "Restore Neon Grid through five missions with interactive bricks, rescue drones, enemies and the Grid Warden, or chase high scores in Classic Arcade." },
  "bubble-pop-arena": { category: "CASUAL", description: "Pop and drag through a continuous score attack across six changing arenas. Chain combos, collect time, freeze and bonus bubbles, and avoid bombs." },
  "city-quest-rise-of-the-guardian": { category: "ADVENTURE", description: "Explore 25 township platforming levels with animated characters, NPC missions, shooting enemies and drones, moving platforms, bosses and Amapiano-inspired music." },
  "climate-rescue-quest": { category: "EDUCATIONAL", description: "Restore the environment across 25 animated climate missions and five boss encounters, with nature-inspired level music, touch controls and saved progress." },
  "cyber-shield-academy": { category: "EDUCATIONAL", description: "Solve 16 fictional cybersecurity investigations with saved checkpoints, chapter retries, evidence-led choices, progressive hints and untimed practice." },
  "fruit-slice": { category: "ARCADE", description: "Slice animated fruit through 25 sunset trials or Endless Arcade, build combos and frenzy, avoid bombs and enjoy original stage music." },
  "high-spead-racer": { title: "High Speed Racer: City of Legends", category: "RACING", description: "Rebuild your family garage in High Speed Racer: City of Legends through six career jobs, twelve arcade streets, 3D cars, reactive rivals and recoverable collisions." },
  "kasi-quest": { category: "ADVENTURE", description: "Explore 20 longer township campaign levels with animated heroes and enemies, shooting drones, NPC missions, collectibles, upgrades, bosses and a daily challenge." },
  "lost-jungle-3d-temple-of-the-sun": { category: "ADVENTURE", description: "Follow Ari through 25 long 2D jungle levels and five story chapters to recover the Sun Seals, find a missing mentor and restore the Temple of the Sun." },
  "map-master-africa": { title: "Map Master Africa: World Explorer", category: "EDUCATIONAL", description: "Practise Grades 4–10 geography through 84 missions and 504 campaign tasks, with 56 alternate revision activities, world and province atlases, and printable learning summaries." },
  "math-sprint-arena": { category: "EDUCATIONAL", description: "Explore Grades 4–10 through seven independent maths paths: 140 untimed missions, 1 400 Adventure and practice activities, visual tools, saved checkpoints and focused revision, plus a 52-level Sprint." },
  "neon-hover-runner": { category: "RACING", description: "Carry the core through five neon zones. Switch lanes, jump barriers, collect energy and data shards, use boosts and shields, and complete each zone objective." },
  "neon-orb-defender": { category: "DEFENSE", description: "Defend Fort Nova across 25 missions, with 15 robot and drone types, a boss in every mission, animated supplies, reserve lives and original level music." },
  "physics-force-lab": { title: "Physics Force Lab: Rise of the Young Physicist", category: "EDUCATIONAL", description: "Join Newtonia and Pip to restore Nova through 30 untimed missions and 90 investigations covering selected Grades 4–10 physics topics, with saved discoveries, 55 revision checks and 12 animated action labs." },
  "recycle-rush": { title: "Recycle Rush: Restore Verdale", category: "EDUCATIONAL", description: "Restore Verdale with Circuit through 25 untimed story missions and 450 recovery tasks, plus 20 arcade missions with animated bosses, material cards and power-ups." },
  "science-lab-dash": { title: "Science Lab Dash: The Element Core Mystery", category: "EDUCATIONAL", description: "Restore Nova Science Academy through 35 untimed adventure missions and 105 investigations covering selected Grades 4–10 chemistry topics, with animated characters, saved evidence and an element guide, plus the original 20-mission science dash." },
  "sky-temple-3d-rise-of-the-relic-master": { category: "ADVENTURE", description: "Explore four 3D worlds, collect five relics in each and defeat their Guardians using jumps, gliding and relic blasts, with world music and saved checkpoints." },
  "space-dodger": { category: "ACTION", description: "Pilot a GLB spacecraft through 18 story sectors with cinematic space backgrounds, rescue and escort objectives, reactive bosses, saved checkpoints and separate audio controls." },
  "space-pilot-platformer": { title: "Space Pilot Platformer: The Starfall Rift", category: "PLATFORMER", description: "Join Pilot Nova across 30 Starfall Rift missions in six worlds, rescue the expedition, restore the portal network and face the NOVA-X Commander, with saved checkpoints, original level music and the separate eight-mission route." },
  "stack-tower": { category: "PUZZLE", description: "Time each block drop, build perfect-placement combos, charge Focus Mode and keep climbing in an endless tower-building score challenge." },
  "swipe-racer": { category: "RACING", description: "Race through four city, mountain, coastal and neon-night missions. Swipe around traffic, collect pickups, use nitro and complete route objectives." },
  "word-dash": { category: "WORD_TRIVIA", description: "Complete four themed word missions by typing or tapping letters, building spelling streaks and using Hint, Freeze and extra-time powers." },
};

export function catalogCategory(slug: string, fallback: string | null | undefined = "ARCADE"): GameCategoryValue {
  const known = GAME_CATALOG[slug]?.category;
  if (known) return known;
  return GAME_CATEGORIES.includes(fallback as GameCategoryValue) ? fallback as GameCategoryValue : "ARCADE";
}

export function catalogDescription(slug: string, fallback?: string | null): string | null {
  return GAME_CATALOG[slug]?.description ?? fallback ?? null;
}

export function catalogGame<T extends { slug: string; title?: string; category?: string | null; description?: string | null }>(game: T): T & { category: GameCategoryValue; description: string | null } {
  return {
    ...game,
    ...(GAME_CATALOG[game.slug]?.title ? { title: GAME_CATALOG[game.slug].title } : {}),
    category: catalogCategory(game.slug, game.category),
    description: catalogDescription(game.slug, game.description),
  };
}
