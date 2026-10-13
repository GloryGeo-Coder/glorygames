// apps/web/src/app/games/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GameThumb } from "@/components/GameThumb";
import GameEditorial from "@/components/GameEditorial";
import { getGameEditorial } from "@/content/gameEditorials";
import { getFallbackGameBySlug, getRelatedFallbackGames } from "@/lib/fallbackGames";
import {
  getGameFromDatabase,
  getLeaderboardForGameFromDatabase,
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

type GameForPage = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
};

type RelatedGame = GameForPage;

function categoryLabel(category?: string | null) {
  if (!category) return "Arcade";
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");
}

function categoryUrl(category?: string | null) {
  if (!category) return "arcade";
  return category.toLowerCase().replace(/_/g, "-");
}

function titleFromSlug(slug: string) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizeGame(game: any): GameForPage | null {
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

async function getGame(slug: string): Promise<GameForPage | null> {
  if (!isPublicGameSlug(slug)) {
    return null;
  }

  try {
    const dbGame = await getGameFromDatabase(slug);

    if (dbGame) {
      return normalizeGame(dbGame);
    }
  } catch (error) {
    console.warn("[game-detail] Database game lookup failed", error);
  }

  return normalizeGame(getFallbackGameBySlug(slug));
}

async function getRelatedGames(game: GameForPage): Promise<RelatedGame[]> {
  try {
    const dbRelated = await getRelatedGamesFromDatabase({
      slug: game.slug,
      category: game.category,
      limit: 4,
    });

    if (dbRelated.length) {
      return dbRelated.map(normalizeGame).filter(Boolean) as RelatedGame[];
    }
  } catch (error) {
    console.warn("[game-detail] Related games lookup failed", error);
  }

  return getRelatedFallbackGames(game.slug, game.category)
    .map(normalizeGame)
    .filter(Boolean) as RelatedGame[];
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
  const description = editorial?.summary ?? game?.description ?? `Learn more about ${title} on WebGameArena.`;

  return {
    metadataBase: new URL(SITE_URL),
    title: `${title} Game | Free Browser Game on WebGameArena`,
    description,
    keywords: [
      title,
      `${title} game`,
      `${category} game`,
      "free browser game",
      "mobile game",
      "HTML5 game",
      "how to play",
      "WebGameArena",
      ...(game?.tags ?? []),
    ],
    alternates: {
      canonical: `/play/${slug}`,
    },
    openGraph: {
      title: `${title} Game | WebGameArena`,
      description,
      url: `${SITE_URL}/games/${slug}`,
      siteName: "WebGameArena",
      type: "website",
      locale: "en_ZA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} Game | WebGameArena`,
      description,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function GameDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGame(slug);

  if (!game) {
    notFound();
  }

  const category = categoryLabel(game.category);
  const tags = game.tags ?? [];
  const editorial = getGameEditorial(game.slug);

  let leaderboard: Awaited<ReturnType<typeof getLeaderboardForGameFromDatabase>> = [];

  try {
    leaderboard = await getLeaderboardForGameFromDatabase({
      slug: game.slug,
      mode: "global",
      limit: 10,
    });
  } catch (error) {
    console.warn("[game-detail] Leaderboard unavailable", error);
    leaderboard = [];
  }

  const relatedGames = await getRelatedGames(game);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: editorial?.summary ?? game.description ?? game.title,
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

      <main className="gameDetailPage">
        <div className="container">
          <section className="section gameDetailHeroSection">
            <div className="gameDetailHero">
              <div className="gameDetailCopy">
                <Link
                  className="pill"
                  href={`/games?category=${categoryUrl(game.category)}`}
                >
                  {category}
                </Link>

                <h1>{game.title}</h1>

                <p>{editorial?.summary ?? game.description}</p>

                <div className="gameDetailTags">
                  <span className="badge">{category}</span>

                  {tags.slice(0, 8).map((tag) => (
                    <span key={tag} className="badge">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="gameDetailActions">
                  <Link className="cta" href={`/play/${game.slug}`}>
                    Play Now →
                  </Link>

                  <Link className="pill" href="/games">
                    Browse More Games
                  </Link>
                </div>
              </div>

              <div className="gameDetailPreview">
                <div className="gameDetailThumb">
                  <GameThumb slug={game.slug} title={game.title} />
                </div>

                <div className="gameDetailPreviewFooter">
                  <div>
                    <b>Instant browser play</b>
                    <span>No downloads required</span>
                  </div>

                  <Link className="playBtn" href={`/play/${game.slug}`}>
                    Launch
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <GameEditorial slug={game.slug} title={game.title} />

          <section className="section gameDetailInfoSection">
            <div className="gameDetailInfoGrid">
              <div className="heroCard gameDetailPanel">
                <div className="badge">🏆 Leaderboard</div>

                <h2>Top Players</h2>

                {leaderboard.length === 0 ? (
                  <p className="muted">
                    No scores yet. Play now and be the first on the leaderboard.
                  </p>
                ) : (
                  <div className="gameDetailScores">
                    {leaderboard.map((row) => (
                      <div
                        key={`${row.rank}-${row.userId}-${row.gameSlug}`}
                        className="gameDetailScoreRow"
                      >
                        <span>
                          #{row.rank} {row.displayName}
                        </span>

                        <b>{row.score}</b>
                      </div>
                    ))}
                  </div>
                )}

                <div className="gameDetailHint">
                  More modes and weekly leaderboards coming soon.
                </div>
              </div>

              <div className="heroCard gameDetailPanel">
                <div className="badge">🎮 Game Info</div>

                <h2>About this game</h2>

                <div className="gameDetailFacts">
                  <div>
                    <span>Category</span>
                    <b>{category}</b>
                  </div>

                  <div>
                    <span>Platform</span>
                    <b>Browser</b>
                  </div>

                  <div>
                    <span>Controls</span>
                    <b>Mobile + Keyboard</b>
                  </div>

                  <div>
                    <span>Status</span>
                    <b>Live</b>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {relatedGames.length ? (
            <section className="section relatedGamesSection">
              <div className="sectionTitle">
                <div>
                  <h2>Related games</h2>
                  <p>Keep playing more WebGameArena games.</p>
                </div>

                <Link
                  className="pill"
                  href={`/games?category=${categoryUrl(game.category)}`}
                >
                  View {category} games →
                </Link>
              </div>

              <div className="grid">
                {relatedGames.map((g) => (
                  <Link key={g.id} href={`/play/${g.slug}`} className="tile">
                    <div
                      className="thumb thumbWrap"
                      style={{ position: "relative", overflow: "hidden" }}
                    >
                      <GameThumb slug={g.slug} title={g.title} />

                      <span
                        className="badge"
                        style={{
                          position: "absolute",
                          left: 10,
                          top: 10,
                          zIndex: 3,
                          background: "rgba(0,0,0,.35)",
                          borderColor: "rgba(255,255,255,.18)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        {categoryLabel(g.category)}
                      </span>
                    </div>

                    <div className="tileBody">
                      <div className="tileTitle">{g.title}</div>

                      <div className="tileDesc">
                        {g.description || "Tap to play instantly."}
                      </div>

                      <div className="badges">
                        {(g.tags || []).slice(0, 3).map((tag) => (
                          <span key={tag} className="badge">
                            {tag}
                          </span>
                        ))}
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
        </div>
      </main>
    </>
  );
}
