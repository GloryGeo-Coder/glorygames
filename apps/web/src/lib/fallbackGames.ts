import { GAME_CATALOG, catalogGame } from "@/lib/gameCatalog";

export type FallbackGame = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: Date;
};

// Maintained alongside the reviewed 22-game catalog.
// If Neon is temporarily unavailable, all published games stay discoverable.
const TITLES: Record<string, string> = {
  "brick-blaster": "Brick Blaster",
  "bubble-pop-arena": "Bubble Pop Arena",
  "city-quest-rise-of-the-guardian": "City Quest: Rise of the Guardian",
  "climate-rescue-quest": "Climate Rescue Quest",
  "cyber-shield-academy": "Cyber Shield Academy: Terminal Ops",
  "fruit-slice": "Fruit Slice",
  "high-spead-racer": "High Spead Racer",
  "kasi-quest": "Kasi Quest",
  "lost-jungle-3d-temple-of-the-sun": "Lost Jungle: Temple of the Sun",
  "map-master-africa": "Map Master Africa: Explorer Missions",
  "math-sprint-arena": "Math Sprint Arena",
  "neon-hover-runner": "Neon Hover Runner",
  "neon-orb-defender": "Neon Orb: Base Defence",
  "physics-force-lab": "Physics Force Lab: Rise of the Young Physicist",
  "recycle-rush": "Recycle Rush",
  "science-lab-dash": "Science Lab Dash: Element Core Mystery",
  "sky-temple-3d-rise-of-the-relic-master": "Sky Temple 3D: Rise of the Relic Master",
  "space-dodger": "Space Dodger 3D: Starfall Odyssey",
  "space-pilot-platformer": "Space Pilot Platformer",
  "stack-tower": "Stack Tower",
  "swipe-racer": "Swipe Racer",
  "word-dash": "Word Dash"
};

export const fallbackGames: FallbackGame[] = Object.entries(GAME_CATALOG).map(([slug, entry]) => ({
  id: `fallback-${slug}`,
  slug,
  title: entry.title ?? TITLES[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
  description: entry.description,
  category: entry.category,
  tags: [entry.category.toLowerCase().replace(/_/g, "-")],
}));

export function getFallbackGames() {
  const now = new Date();
  return fallbackGames.map((game) => ({
    ...game,
    createdAt: game.createdAt ?? now.toISOString(),
    updatedAt: game.updatedAt ?? now,
  }));
}

export function getFallbackGameBySlug(slug: string) {
  return getFallbackGames().find((game) => game.slug === slug) ?? null;
}

export function getRelatedFallbackGames(slug: string, category?: string | null) {
  const games = getFallbackGames().filter((game) => game.slug !== slug).map(catalogGame);
  const matching = category ? games.filter((game) => game.category === category) : games;
  return [...matching, ...games.filter((g) => !matching.includes(g))].slice(0, 4);
}
