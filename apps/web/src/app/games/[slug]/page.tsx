// apps/web/src/app/games/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLeaderboard } from "@/lib/leaderboard";
import { GameThumb } from "@/components/GameThumb";

export const dynamic = "force-dynamic";

const SITE_URL = "https://glorygames.co.za";

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

async function getGame(slug: string) {
  return prisma.game.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
    },
  });
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
    `Play ${title}, a free mobile-first ${category.toLowerCase()} browser game on GloryGames. No downloads required.`;

  return {
    metadataBase: new URL(SITE_URL),
    title: `${title} Game | Free Browser Game on GloryGames`,
    description,
    keywords: [
      title,
      `${title} game`,
      `${category} game`,
      "free browser game",
      "mobile game",
      "HTML5 game",
      "GloryGames",
      ...(game?.tags ?? []),
    ],
    alternates: {
      canonical: `/games/${slug}`,
    },
    openGraph: {
      title: `${title} Game | GloryGames`,
      description,
      url: `${SITE_URL}/games/${slug}`,
      siteName: "GloryGames",
      type: "website",
      locale: "en_ZA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} Game | GloryGames`,
      description,
    },
    robots: {
      index: true,
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

  if (!game) return notFound();

  const category = categoryLabel(game.category);
  const tags = game.tags ?? [];

  // Uses your existing leaderboard helper from the uploaded reference file.
  // This keeps the page compatible with your current leaderboard logic.
  const leaderboard = await getLeaderboard(game.slug, "global", 10);

  const relatedGames = await prisma.game.findMany({
    where: {
      category: game.category,
      NOT: { id: game.id },
    },
    orderBy: { title: "asc" },
    take: 4,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      tags: true,
    },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description:
      game.description ||
      `Play ${game.title}, a free mobile-first browser game on GloryGames.`,
    url: `${SITE_URL}/games/${game.slug}`,
    applicationCategory: "Game",
    genre: category,
    gamePlatform: ["Web browser", "Mobile browser", "Desktop browser"],
    operatingSystem: "Any",
    publisher: {
      "@type": "Organization",
      name: "GloryGames",
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

                <p>
                  {game.description ||
                    `Play ${game.title} instantly on GloryGames. Built for quick browser play on mobile and desktop.`}
                </p>

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
                        key={`${row.rank}-${row.userId}`}
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
                  <h2>More {category} Games</h2>
                  <p>Keep playing games in the same category.</p>
                </div>

                <Link
                  className="pill"
                  href={`/games?category=${categoryUrl(game.category)}`}
                >
                  View category →
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


