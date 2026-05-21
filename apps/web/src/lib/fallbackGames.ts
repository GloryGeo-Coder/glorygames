// apps/web/src/lib/fallbackGames.ts

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

export const fallbackGames: FallbackGame[] = [
  {
    id: "fallback-kasi-quest",
    slug: "kasi-quest",
    title: "Kasi Quest",
    description:
      "A mobile-first platform adventure with levels, coins, enemies, and township-inspired quests.",
    category: "ADVENTURE",
    tags: ["platformer", "levels", "story", "mobile"],
  },
  {
    id: "fallback-fruit-slice",
    slug: "fruit-slice",
    title: "Fruit Slice",
    description:
      "Swipe to slice fruit, avoid bombs, and build high-score combos in this fast arcade game.",
    category: "ARCADE",
    tags: ["swipe", "reflex", "casual", "mobile"],
  },
  {
    id: "fallback-brick-blaster",
    slug: "brick-blaster",
    title: "Brick Blaster",
    description:
      "Classic brick-breaking action with quick rounds, score chasing, and mobile-friendly controls.",
    category: "ARCADE",
    tags: ["classic", "blocks", "score", "casual"],
  },
  {
    id: "fallback-bubble-pop-arena",
    slug: "bubble-pop-arena",
    title: "Bubble Pop Arena",
    description:
      "Pop, match, and clear bubbles in a colourful casual puzzle arena.",
    category: "PUZZLE",
    tags: ["bubbles", "matching", "casual", "mobile"],
  },
  {
    id: "fallback-neon-hover-runner",
    slug: "neon-hover-runner",
    title: "Neon Hover Runner",
    description:
      "Dash through glowing lanes, dodge obstacles, and chase speed in a neon runner.",
    category: "RACING",
    tags: ["runner", "neon", "speed", "reflex"],
  },
  {
    id: "fallback-neon-orb-defender",
    slug: "neon-orb-defender",
    title: "Neon Orb Defender",
    description:
      "Defend your orb against waves of enemies in a fast-paced survival challenge.",
    category: "DEFENSE",
    tags: ["defense", "action", "survival", "waves"],
  },
  {
    id: "fallback-space-dodger",
    slug: "space-dodger",
    title: "Space Dodger",
    description:
      "Dodge asteroids and survive as long as possible in a fast space reflex game.",
    category: "ACTION",
    tags: ["space", "dodging", "reflex", "survival"],
  },
  {
    id: "fallback-swipe-racer",
    slug: "swipe-racer",
    title: "Swipe Racer",
    description:
      "Swipe through lanes, avoid traffic, and push your reaction time to the limit.",
    category: "RACING",
    tags: ["driving", "swipe", "speed", "mobile"],
  },
  {
    id: "fallback-stack-tower",
    slug: "stack-tower",
    title: "Stack Tower",
    description:
      "Stack blocks carefully and build the tallest tower you can.",
    category: "PUZZLE",
    tags: ["stacking", "timing", "physics", "casual"],
  },
  {
    id: "fallback-word-dash",
    slug: "word-dash",
    title: "Word Dash",
    description:
      "A fast word game that challenges spelling, vocabulary, and quick thinking.",
    category: "EDUCATIONAL",
    tags: ["word", "typing", "vocabulary", "learning"],
  },

];

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
  const games = getFallbackGames();

  return games
    .filter((game) => game.slug !== slug)
    .filter((game) => !category || game.category === category)
    .slice(0, 4);
}