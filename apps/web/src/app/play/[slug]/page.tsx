// apps/web/src/app/play/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlayClient from "./play-client";
import GameEditorial from "@/components/GameEditorial";
import { getGameEditorial } from "@/content/gameEditorials";
import { GameThumb } from "@/components/GameThumb";
import { getFallbackGameBySlug, getRelatedFallbackGames } from "@/lib/fallbackGames";
import {
  getGameFromDatabase,
  getRelatedGamesFromDatabase,
  isPublicGameSlug,
} from "@/lib/gamesDb";

export const dynamic = "force-dynamic";

const SITE_URL = "https://webgamearena.com";

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
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
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

function categoryUrl(category?: string | null) {
  if (!category) return "arcade";
  return category.toLowerCase().replace(/_/g, "-");
}

function normalizeGame(game: any): PlayGame | null {
  if (!game || !isPublicGameSlug(game.slug)) {
    return null;
  }

  return {
    id: String(game.id ?? `fallback-${game.slug}`),
    slug: String(game.slug),
    title: String(game.title ?? titleFromSlug(String(game.slug))),
    description: game.description ?? null,
    category: game.category ?? "ARCADE",
    tags: Array.isArray(game.tags) ? game.tags : [],
  };
}

async function getGame(slug: string): Promise<PlayGame | null> {
  if (!isPublicGameSlug(slug)) {
    return null;
  }

  try {
    const dbGame = await getGameFromDatabase(slug);

    if (dbGame) {
      return normalizeGame(dbGame);
    }
  } catch (error) {
    console.warn("[play] Database game lookup failed", error);
  }

  return normalizeGame(getFallbackGameBySlug(slug));
}

async function getRelatedGames(game: PlayGame): Promise<PlayGame[]> {
  try {
    const dbRelated = await getRelatedGamesFromDatabase({
      slug: game.slug,
      category: game.category,
      limit: 4,
    });

    if (dbRelated.length) {
      return dbRelated.map(normalizeGame).filter(Boolean) as PlayGame[];
    }
  } catch (error) {
    console.warn("[play] Related games lookup failed", error);
  }

  return getRelatedFallbackGames(game.slug, game.category)
    .map(normalizeGame)
    .filter(Boolean) as PlayGame[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (!isPublicGameSlug(slug)) {
    return {
      title: "Game not found | WebGameArena",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const game = await getGame(slug);
  const title = game?.title ?? titleFromSlug(slug);
  const category = categoryLabel(game?.category);

  const editorial = getGameEditorial(slug);
  const description = editorial?.summary ?? game?.description ?? `Play ${title} on WebGameArena.`;

  return {
    metadataBase: new URL(SITE_URL),
    title: `${title} | Play Free on WebGameArena`,
    description,
    keywords: [
      title,
      `${title} game`,
      `${category} game`,
      "free browser game",
      "mobile game",
      "HTML5 game",
      "WebGameArena",
      ...(game?.tags ?? []),
    ],
    alternates: {
      canonical: `/play/${slug}`,
    },
    openGraph: {
      title: `${title} | Play Free on WebGameArena`,
      description,
      url: `${SITE_URL}/play/${slug}`,
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
      index: Boolean(editorial),
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

  if (!game) {
    notFound();
  }

  const title = game.title;
  const category = categoryLabel(game.category);
  const editorial = getGameEditorial(game.slug);
  const relatedGames = await getRelatedGames(game);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: title,
    description: editorial?.summary ?? game.description ?? title,
    url: `${SITE_URL}/play/${game.slug}`,
    applicationCategory: "Game",
    genre: category,
    keywords: game.tags.join(", "),
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

      <PlayClient slug={game.slug} title={title} />

      <main className="container">
        <GameEditorial slug={game.slug} title={title} />

        {relatedGames.length ? (
          <section className="section relatedGamesSection">
            <div className="sectionTitle">
              <div>
                <h2>Related games</h2>
                <p>Try more games in the WebGameArena library.</p>
              </div>

              <Link
                className="pill"
                href={`/games?category=${categoryUrl(game.category)}`}
              >
                View {category} games →
              </Link>
            </div>

            <div className="grid">
              {relatedGames.map((related) => (
                <Link
                  key={related.id}
                  href={`/play/${related.slug}`}
                  className="tile"
                >
                  <div
                    className="thumb thumbWrap"
                    style={{ position: "relative", overflow: "hidden" }}
                  >
                    <GameThumb slug={related.slug} title={related.title} />
                  </div>

                  <div className="tileBody">
                    <div className="tileTitle">{related.title}</div>
                    <div className="tileDesc">
                      {related.description || "Tap to play instantly."}
                    </div>
                    <div className="tileActions">
                      <span className="playBtn">Play →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </>
  );
}
