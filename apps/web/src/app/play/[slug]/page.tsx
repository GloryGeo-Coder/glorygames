// apps/web/src/app/play/[slug]/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlayClient from "./play-client";
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

function getGameGuide(game: PlayGame) {
  const category = categoryLabel(game.category);
  const title = game.title;
  const tags = game.tags.length ? game.tags.join(", ") : "browser game";

  return {
    overview:
      game.description ||
      `${title} is a free ${category.toLowerCase()} browser game on WebGameArena. It is designed for quick play sessions on mobile and desktop, with simple controls and replayable scoring.`,
    objective:
      category === "Racing"
        ? `Reach the best possible score in ${title} by reacting quickly, avoiding mistakes and keeping your run going as long as possible.`
        : category === "Puzzle"
          ? `Solve each challenge in ${title} by making smart moves, watching the pattern and improving your score with each attempt.`
          : category === "Educational"
            ? `Use ${title} to practise useful skills while playing. The aim is to learn, improve and score as high as possible.`
            : `Survive, collect points and improve your high score in ${title}. Each run gives you a chance to beat your previous best.`,
    desktopControls:
      "Use the keyboard, mouse or on-screen buttons depending on the game. Most games support arrow keys, WASD, spacebar, mouse clicks or simple taps.",
    mobileControls:
      "Use touch controls on your phone or tablet. Tap, swipe or press the on-screen buttons shown inside the game area.",
    scoring:
      "Scores are based on successful actions such as collecting items, completing objectives, surviving longer, clearing levels or avoiding mistakes. Your best scores can appear on the leaderboard when score saving is enabled.",
    tips: [
      "Start slowly and learn the timing before chasing a high score.",
      "Use fullscreen mode for better focus, especially on mobile.",
      "Avoid risky moves when you already have a strong score.",
      `Replay ${title} to learn patterns and improve your reaction time.`,
    ],
    ageNote:
      `${title} is intended as a family-friendly browser game. Younger players may need help reading instructions or understanding scoring.`,
    tags,
  };
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

  const description =
    game?.description ||
    `Play ${title} for free on WebGameArena. A mobile-first ${category.toLowerCase()} browser game with instant play, simple controls and no downloads.`;

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

  if (!game) {
    notFound();
  }

  const title = game.title;
  const category = categoryLabel(game.category);
  const guide = getGameGuide(game);
  const relatedGames = await getRelatedGames(game);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: title,
    description: guide.overview,
    url: `${SITE_URL}/play/${game.slug}`,
    applicationCategory: "Game",
    genre: category,
    keywords: guide.tags,
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
        <section className="section">
          <div className="sectionTitle">
            <div>
              <div className="badge" style={{ width: "fit-content" }}>
                🎮 {category} Game Guide
              </div>

              <h2>About {title}</h2>

              <p>{guide.overview}</p>
            </div>

            <Link className="pill" href={`/games/${game.slug}`}>
              View game details →
            </Link>
          </div>

          <div className="gameDetailInfoGrid">
            <div className="heroCard gameDetailPanel">
              <div className="badge">🎯 Objective</div>
              <h3>What to do</h3>
              <p className="muted">{guide.objective}</p>
            </div>

            <div className="heroCard gameDetailPanel">
              <div className="badge">🕹️ Controls</div>
              <h3>Desktop and mobile</h3>
              <p className="muted">
                <b>Desktop:</b> {guide.desktopControls}
              </p>
              <p className="muted">
                <b>Mobile:</b> {guide.mobileControls}
              </p>
            </div>

            <div className="heroCard gameDetailPanel">
              <div className="badge">🏆 Scoring</div>
              <h3>How scores work</h3>
              <p className="muted">{guide.scoring}</p>
            </div>

            <div className="heroCard gameDetailPanel">
              <div className="badge">👨‍👩‍👧 Family note</div>
              <h3>Age suitability</h3>
              <p className="muted">{guide.ageNote}</p>
            </div>
          </div>

          <div className="heroCard gameDetailPanel" style={{ marginTop: 16 }}>
            <div className="badge">💡 Tips</div>
            <h3>Tips for playing {title}</h3>

            <ul style={{ color: "rgba(255,255,255,.72)", lineHeight: 1.75 }}>
              {guide.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </section>

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
