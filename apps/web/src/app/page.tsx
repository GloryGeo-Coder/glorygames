// apps/web/src/app/page.tsx

import { gamePagePath } from "@/lib/gamePaths";
import type { Metadata } from "next";
import Link from "next/link";
import { getGamesFromDatabase } from "@/lib/gamesDb";
import { DailyChallengeWidget } from "@/components/DailyChallengeWidget";
import { GameThumb } from "@/components/GameThumb";
import { getFallbackGames } from "@/lib/fallbackGames";

export const dynamic = "force-dynamic";

const SITE_URL = "https://webgamearena.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "WebGameArena | Play Free Browser Games",
  description:
    "Play free browser games on WebGameArena. Discover arcade, action, adventure, puzzle, racing, educational and casual games built for instant play.",
  keywords: [
    "WebGameArena",
    "free browser games",
    "mobile games",
    "HTML5 games",
    "arcade games",
    "action games",
    "adventure games",
    "educational games",
    "puzzle games",
    "racing games",
    "casual games",
    "games",
    "online games",
    "free games",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "WebGameArena | Play Free Mobile Browser Games",
    description:
      "Jump into fast, mobile-first browser games. Play arcade, action, adventure, puzzle, racing and educational games instantly.",
    url: SITE_URL,
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "WebGameArena | Play Free Mobile Browser Games",
    description:
      "Play free mobile-first browser games instantly on WebGameArena.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

type HomeGame = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
};

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

const FEATURED_CATEGORIES = [
  "ARCADE",
  "ACTION",
  "ADVENTURE",
  "EDUCATIONAL",
  "PUZZLE",
  "RACING",
  "WORD_TRIVIA",
  "CASUAL",
];

function categoryLabel(category?: string | null) {
  if (!category) return "Arcade";
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");
}

function categoryUrl(category: string) {
  return category.toLowerCase().replace(/_/g, "-");
}

function normalizeGames(
  rows: Array<{
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    category?: string | null;
    tags?: string[];
  }>
): HomeGame[] {
  return rows.map((game) => ({
    id: game.id,
    slug: game.slug,
    title: game.title,
    description: game.description ?? null,
    category: game.category ?? "ARCADE",
    tags: game.tags ?? [],
  }));
}

async function getGames(): Promise<HomeGame[]> {
  const fallbackGames = normalizeGames(getFallbackGames());

  try {
    const dbGames = await getGamesFromDatabase();

    if (dbGames.length) {
      return normalizeGames(dbGames);
    }

    return fallbackGames;
  } catch (error) {
    console.warn("[home] Falling back to static game list", error);
    return fallbackGames;
  }
}

export default async function HomePage() {
  const games = await getGames();

  const featuredGame =
    games.find((g) => g.slug === "kasi-quest") ||
    games.find((g) => g.slug === "fruit-slice") ||
    games[0];

  const featuredSlug = featuredGame?.slug || "fruit-slice";
  const featuredTitle = featuredGame?.title || "Fruit Slice";

  // Important: show all games from Neon on the homepage.
  const playNowGames = games;
  const gameCount = games.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "WebGameArena",
    url: SITE_URL,
    description:
      "A free mobile-first browser gaming platform with arcade, action, adventure, puzzle, racing, educational and casual games.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/games?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "42px 0 28px",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 15% 10%, rgba(56,189,248,.18), transparent 34%), radial-gradient(circle at 80% 15%, rgba(167,139,250,.18), transparent 34%), radial-gradient(circle at 50% 90%, rgba(34,197,94,.10), transparent 40%)",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div
            className="heroCard"
            style={{
              padding: "clamp(20px, 4vw, 42px)",
              borderRadius: 28,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: -80,
                top: -80,
                width: 260,
                height: 260,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(56,189,248,.22), transparent 65%)",
              }}
            />

            <div className="homeHeroGrid">
              <div>
                <div
                  className="badge"
                  style={{
                    display: "inline-flex",
                    marginBottom: 14,
                    background: "rgba(56,189,248,.10)",
                    borderColor: "rgba(56,189,248,.28)",
                  }}
                >
                  🎮 Free browser games • No downloads • Play instantly
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(38px, 7vw, 78px)",
                    lineHeight: 0.92,
                    letterSpacing: "-0.07em",
                    maxWidth: 780,
                  }}
                >
                  Play fast, fun and educational games built for your browser.
                </h1>

                <p
                  style={{
                    margin: "18px 0 0",
                    color: "rgba(255,255,255,.72)",
                    fontSize: "clamp(15px, 2vw, 19px)",
                    lineHeight: 1.55,
                    maxWidth: 720,
                  }}
                >
                  WebGameArena is a mobile-first gaming hub where you can jump
                  straight into arcade, action, adventure, puzzle, racing and
                  learning games — from quick arcade sessions to longer story
                  campaigns. Play as a guest and read each game’s guide for controls, objectives and saved progress.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 24,
                  }}
                >
                  <Link
                    className="cta"
                    href={`/play/${featuredSlug}`}
                    style={{ fontSize: 15 }}
                  >
                    Play Featured Game →
                  </Link>

                  <Link className="pill" href="/games">
                    Browse All Games
                  </Link>

                  <Link className="pill" href="/categories/adventure">
                    Explore Adventures
                  </Link>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 10,
                    marginTop: 24,
                    maxWidth: 620,
                  }}
                >
                  <div className="kpi">
                    <b>{gameCount}</b>
                    <span>Games live</span>
                  </div>

                  <div className="kpi">
                    <b>Mobile</b>
                    <span>Touch-friendly</span>
                  </div>

                  <div className="kpi">
                    <b>Daily</b>
                    <span>Challenges</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: "relative",
                  minHeight: 360,
                  borderRadius: 28,
                  padding: 14,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.04))",
                  border: "1px solid rgba(255,255,255,.12)",
                  boxShadow: "0 24px 80px rgba(0,0,0,.32)",
                }}
              >
                <div
                  className="badge"
                  style={{
                    position: "absolute",
                    top: 24,
                    left: 24,
                    zIndex: 2,
                    backdropFilter: "blur(10px)",
                    background: "rgba(0,0,0,.35)",
                  }}
                >
                  Featured
                </div>

                <div
                  style={{
                    height: 210,
                    borderRadius: 22,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <GameThumb slug={featuredSlug} title={featuredTitle} />
                </div>

                <div style={{ padding: "16px 4px 4px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          letterSpacing: "-.04em",
                        }}
                      >
                        {featuredTitle}
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          color: "rgba(255,255,255,.68)",
                          fontSize: 13,
                          lineHeight: 1.45,
                        }}
                      >
                        {featuredGame?.description ||
                          "Start playing as a guest and follow the game guide for controls and objectives."}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 14,
                    }}
                  >
                    <span className="badge">
                      {categoryLabel(featuredGame?.category)}
                    </span>

                    {(featuredGame?.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="badge">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    className="playBtn"
                    href={`/play/${featuredSlug}`}
                    style={{
                      display: "inline-flex",
                      marginTop: 16,
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    Launch Game
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY QUICK LINKS */}
      <section className="section">
        <div className="container">
          <div className="sectionTitle">
            <div>
              <h2>Choose your next game</h2>
              <p>
                Browse by mood, play style or skill. Every game is designed to
                work smoothly on desktop and mobile.
              </p>
            </div>

            <Link className="pill" href="/games">
              View all →
            </Link>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link className="pill" href="/games">
              All Games
            </Link>

            {FEATURED_CATEGORIES.map((category) => (
              <Link
                key={category}
                className="pill"
                href={`/games?category=${categoryUrl(category)}`}
              >
                {categoryLabel(category)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="choose-collection">
        <div className="container">
          <div className="sectionTitle"><div>
            <h2 id="choose-collection">Find a game that fits your session</h2>
            <p>These collection guides explain what to try and how the games differ.</p>
          </div></div>
          <div className="playerValueGrid">
            <article className="playerValueCard"><div>
              <h3><Link href="/categories/educational">Explore a learning topic</Link></h3>
              <p>Compare maths, geography, science and environmental games. Read each guide for its activities and controls before choosing.</p>
            </div></article>
            <article className="playerValueCard"><div>
              <h3><Link href="/categories/adventure">Follow a story</Link></h3>
              <p>Choose township, city, jungle or temple adventures. Compare exploration, platforming and mission progression in the collection guide.</p>
            </div></article>
            <article className="playerValueCard"><div>
              <h3><Link href="/categories/arcade">Try a short challenge</Link></h3>
              <p>Practise timing and control in fruit slicing, brick breaking and other arcade games. Check individual guides for modes and local saves.</p>
            </div></article>
          </div>
        </div>
      </section>

      {/* PLAYER VALUE STRIP */}
      <section className="section playerValueSection">
        <div className="container">
          <div className="playerValueGrid">
            <div className="playerValueCard">
              <div className="playerValueIcon">⚡</div>
              <div>
                <div className="playerValueLabel">Instant play</div>
                <h3>No installs. No waiting.</h3>
                <p>
                  Open a game and start playing directly in your browser. No
                  downloads, no setup, no friction.
                </p>
              </div>
            </div>

            <div className="playerValueCard featuredValueCard">
              <div className="playerValueIcon">🏆</div>
              <div>
                <div className="playerValueLabel">Your own progress</div>
                <h3>Play at your own pace.</h3>
                <p>
                  Games with local saves keep progress on this device. Online
                  leaderboards and score submissions are currently paused.
                </p>
              </div>
            </div>

            <div className="playerValueCard">
              <div className="playerValueIcon">📱</div>
              <div>
                <div className="playerValueLabel">Mobile-first</div>
                <h3>Built for touch controls.</h3>
                <p>
                  Play comfortably on phones, tablets and desktop screens with
                  responsive layouts and simple controls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DAILY CHALLENGE */}
      <section className="section dailyChallengeSection">
        <div className="container">
          <div className="dailyChallengeShell">
            <div className="dailyChallengeIntro">
              <div className="badge dailyBadge">🎮 Today’s pick</div>

              <h2>Try {featuredTitle}.</h2>

              <p>
                Open the featured game as a guest. Its guide explains the
                controls, objectives and available ways to play. No account or
                public score submission is needed.
              </p>

              <div className="dailyChallengeActions">
                <Link className="cta" href={`/play/${featuredSlug}`}>
                  Play featured game →
                </Link>

                <Link className="pill" href="/games">
                  Browse more games
                </Link>
              </div>
            </div>

            <div className="dailyChallengeWidgetWrap">
              <DailyChallengeWidget
                gameSlug={featuredSlug}
                title={featuredTitle}
              />
            </div>
          </div>
        </div>
      </section>

      {/* GAME GRID */}
      <section className="section popularGamesSection">
        <div className="container">
          <div className="popularGamesHeader">
            <div>
              <div className="badge popularBadge">🎯 Game Arena</div>
              <h2>Jump into a game</h2>
              <p>
                Choose a quick arcade challenge, a story adventure or a learning
                mission. Read the game’s guide for its controls, progress system
                and topic before playing.
              </p>
            </div>

            <Link className="pill" href="/games">
              Browse full library →
            </Link>
          </div>

          <div className="popularGamesGrid">
            {playNowGames.map((g, index) => (
              <Link
                key={g.id}
                href={gamePagePath(g.slug)}
                className={`popularGameCard ${
                  index === 0 ? "featuredGameCard" : ""
                }`}
                aria-label={`Play ${g.title}`}
              >
                <div className="popularThumb">
                  <GameThumb slug={g.slug} title={g.title} />

                  <span className="badge popularCategoryBadge">
                    {categoryLabel(g.category)}
                  </span>

                  {index === 0 ? (
                    <span className="badge popularFeaturedBadge">
                      Featured
                    </span>
                  ) : null}
                </div>

                <div className="popularGameBody">
                  <div className="popularGameTitle">{g.title}</div>

                  <div className="popularGameDesc">
                    {g.description ||
                      "Tap to play instantly. Built for mobile and desktop."}
                  </div>

                  <div className="popularGameTags">
                    <span className="badge">{categoryLabel(g.category)}</span>

                    {(g.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="badge">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="popularGameFooter">
                    <span className="playBtn">Play now →</span>
                    <span className="popularMeta">Instant browser play</span>
                  </div>
                </div>
              </Link>
            ))}

            {!playNowGames.length ? (
              <div className="heroCard popularEmptyCard">
                <b>No games found.</b>
                <div
                  style={{
                    color: "rgba(255,255,255,.7)",
                    marginTop: 6,
                  }}
                >
                  Seed the database or sync your public games folder.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
