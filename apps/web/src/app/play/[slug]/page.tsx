// apps/web/src/app/play/[slug]/page.tsx

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PlayClient from "./play-client";
import { getFallbackGameBySlug } from "@/lib/fallbackGames";

export const dynamic = "force-dynamic";

const SITE_URL = "https://WebGameArena.co.za";

const CATEGORY_LABELS: Record<string, string> = {
  ARCADE: "Arcade",
  ACTION: "Action",
  ADVENTURE: "Adventure",
  EDUCATIONAL: "Educational",
  PUZZLE: "Puzzle",
  RACING: "Racing",
  WORD_TRIVIA: "Word & Trivia",
  STRATEGY: "Strategy",
  SPORTS: "Sports",
  SIMULATION: "Simulation",
  DEFENSE: "Defense",
  PLATFORMER: "Platformer",
  CASUAL: "Casual",
  MULTIPLAYER: "Multiplayer",
  KIDS_FAMILY: "Kids & Family",
};

type PlayGame = {
  id?: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  updatedAt?: Date | string;
};

function titleFromSlug(slug: string) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function categoryLabel(category?: string | null) {
  if (!category) return "Arcade";
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");
}

function hasUsableDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) return false;

  // Cloudflare cannot connect to your laptop/local Docker database.
  if (url.includes("127.0.0.1")) return false;
  if (url.includes("localhost")) return false;

  return true;
}

function normalizeGame(game: PlayGame | null): PlayGame | null {
  if (!game) return null;

  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    description: game.description ?? null,
    category: game.category ?? "ARCADE",
    tags: game.tags ?? [],
    updatedAt: game.updatedAt,
  };
}

async function getGame(slug: string): Promise<PlayGame | null> {
  const fallback = normalizeGame(getFallbackGameBySlug(slug));

  try {
    if (!hasUsableDatabaseUrl()) {
      return fallback;
    }

    const game = await prisma.game.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        tags: true,
        updatedAt: true,
      },
    });

    return normalizeGame(game as PlayGame | null) ?? fallback;
  } catch (error) {
    console.warn("[play] Falling back to static game", error);
    return fallback;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);

  const title = game?.title ?? titleFromSlug(slug);
  const category = categoryLabel(game?.category);

  const description =
    game?.description ||
    `Play ${title} for free on WebGameArena. A mobile-first ${category.toLowerCase()} browser game built for instant play.`;

  const url = `${SITE_URL}/play/${slug}`;

  return {
    title: `${title} | Play Free on WebGameArena`,
    description,
    keywords: [
      title,
      `${title} game`,
      `${category} game`,
      "WebGameArena",
      "free browser games",
      "mobile games",
      "HTML5 games",
      ...(game?.tags ?? []),
    ],
    alternates: {
      canonical: `/play/${slug}`,
    },
    openGraph: {
      title: `${title} | Play Free on WebGameArena`,
      description,
      url,
      siteName: "WebGameArena",
      type: "website",
      locale: "en_ZA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Play Free on WebGameArena`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGame(slug);

  const title = game?.title ?? titleFromSlug(slug);
  const description =
    game?.description ||
    `Play ${title} instantly on WebGameArena. No downloads required.`;

  const category = categoryLabel(game?.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: title,
    description,
    url: `${SITE_URL}/play/${slug}`,
    applicationCategory: "Game",
    genre: category,
    gamePlatform: ["Web browser", "Mobile browser", "Desktop browser"],
    operatingSystem: "Any",
    publisher: {
      "@type": "Organization",
      name: "WebGameArena",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PlayClient slug={slug} title={title} />
    </>
  );
}