import { GameCategory, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const games = [
  {
    slug: "fruit-slice",
    title: "Fruit Slice",
    description:
      "Swipe to slice fruit, avoid bombs, and build high-score combos in this fast arcade game.",
    category: GameCategory.ARCADE,
    tags: ["swipe", "reflex", "casual", "mobile", "score"],
  },
  {
    slug: "brick-blaster",
    title: "Brick Blaster",
    description:
      "Classic brick-breaking action with quick rounds, score chasing, and mobile-friendly controls.",
    category: GameCategory.ARCADE,
    tags: ["classic", "blocks", "reflex", "score", "casual"],
  },
  {
    slug: "bubble-pop-arena",
    title: "Bubble Pop Arena",
    description:
      "Pop, match, and clear bubbles in a colourful casual puzzle arena.",
    category: GameCategory.PUZZLE,
    tags: ["bubbles", "matching", "casual", "mobile", "puzzle"],
  },
  {
    slug: "neon-hover-runner",
    title: "Neon Hover Runner",
    description:
      "Dash through glowing lanes, dodge obstacles, and chase speed in a neon runner.",
    category: GameCategory.RACING,
    tags: ["runner", "neon", "speed", "reflex", "mobile"],
  },
  {
    slug: "neon-orb-defender",
    title: "Neon Orb Defender",
    description:
      "Defend your orb against waves of enemies in a fast-paced survival challenge.",
    category: GameCategory.DEFENSE,
    tags: ["defense", "action", "survival", "waves", "neon"],
  },
  {
    slug: "space-dodger",
    title: "Space Dodger",
    description:
      "Dodge asteroids and survive as long as possible in a fast space reflex game.",
    category: GameCategory.ACTION,
    tags: ["space", "dodging", "reflex", "survival", "mobile"],
  },
  {
    slug: "swipe-racer",
    title: "Swipe Racer",
    description:
      "Swipe through lanes, avoid traffic, and push your reaction time to the limit.",
    category: GameCategory.RACING,
    tags: ["driving", "swipe", "speed", "mobile", "reflex"],
  },
  {
    slug: "stack-tower",
    title: "Stack Tower",
    description:
      "Stack blocks carefully and build the tallest tower you can.",
    category: GameCategory.PUZZLE,
    tags: ["stacking", "timing", "physics", "casual", "mobile"],
  },
  {
    slug: "word-dash",
    title: "Word Dash",
    description:
      "A fast word game that challenges spelling, vocabulary, and quick thinking.",
    category: GameCategory.EDUCATIONAL,
    tags: ["word", "typing", "vocabulary", "learning", "educational"],
  },
  {
    slug: "kasi-quest",
    title: "Kasi Quest",
    description:
      "A mobile-first platform adventure with levels, coins, enemies, and township-inspired quests.",
    category: GameCategory.ADVENTURE,
    tags: ["platformer", "levels", "story", "mobile", "adventure"],
  },
];

async function main() {
  for (const game of games) {
    await prisma.game.upsert({
      where: { slug: game.slug },
      update: {
        title: game.title,
        description: game.description,
        category: game.category,
        tags: game.tags,
      },
      create: {
        slug: game.slug,
        title: game.title,
        description: game.description,
        category: game.category,
        tags: game.tags,
      },
    });
  }

  console.log(`Seeded ${games.length} games with categories.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });