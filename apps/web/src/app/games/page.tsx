// apps/web/src/app/games/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { GameThumb } from "@/components/GameThumb";
import { getFallbackGames } from "@/lib/fallbackGames";
import { getGamesFromDatabase, isPublicGameSlug } from "@/lib/gamesDb";
import { catalogGame } from "@/lib/gameCatalog";

export const dynamic = "force-dynamic";

const SITE_URL = "https://webgamearena.com";

type SearchParams = {
  q?: string;
  category?: string;
};

type GameListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
};

const categories = [
  { value: "ARCADE", label: "Arcade" },
  { value: "ACTION", label: "Action" },
  { value: "ADVENTURE", label: "Adventure" },
  { value: "EDUCATIONAL", label: "Educational" },
  { value: "PUZZLE", label: "Puzzle" },
  { value: "RACING", label: "Racing" },
  { value: "WORD_TRIVIA", label: "Word & Trivia" },
  { value: "STRATEGY", label: "Strategy" },
  { value: "SPORTS", label: "Sports" },
  { value: "SIMULATION", label: "Simulation" },
  { value: "DEFENSE", label: "Defense" },
  { value: "PLATFORMER", label: "Platformer" },
  { value: "CASUAL", label: "Casual" },
  { value: "MULTIPLAYER", label: "Multiplayer" },
  { value: "KIDS_FAMILY", label: "Kids & Family" },
] as const;

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "ARCADE": "Quick arcade games reward timing, control and repetition. Try fast rounds of Fruit Slice or Brick Blaster, practise your precision and compare results with your previous attempts.",
  "ACTION": "Action games combine movement and quick decisions. Starfall Odyssey sends your ship through asteroid fields, enemy encounters and mission-based space combat.",
  "ADVENTURE": "Story-led journeys invite you to explore environments, meet characters and tackle obstacles. Choose from township missions, jungle ruins, city guardians and floating temples.",
  "EDUCATIONAL": "Learning games turn geography, mathematics, science, recycling and cybersecurity concepts into interactive challenges. Find experiences focused on observation, problem solving and practical knowledge.",
  "PUZZLE": "Puzzle games reward planning, timing and accurate decisions. Stack Tower turns precise block placement into a challenge to build as high as you can.",
  "RACING": "Racing and runner games require anticipation, smooth movement and good boost timing. Navigate traffic in Swipe Racer or High Spead Racer, or steer a futuristic hover craft around hazards.",
  "WORD_TRIVIA": "Word and trivia games focus on language, recognition and recall. Type target spellings, build streaks and work through timed missions in Word Dash.",
  "STRATEGY": "Strategy games put planning and considered choices first. Explore the library as new strategy titles are added.",
  "SPORTS": "Sports games focus on timing, tactical decisions and skill development. Browse this category when new titles become available.",
  "SIMULATION": "Simulation games model activities and scenarios through interactive choices. Browse this category when new titles become available.",
  "DEFENSE": "Defence games place protection and prioritisation at the centre of play. In Neon Orb: Base Defence, respond to hostile machines while protecting the orb and friendly units.",
  "PLATFORMER": "Platform games test jumps, navigation and timing. Follow Pilot Nova through asteroid platforms, drones, collectible star cores and boss encounters.",
  "CASUAL": "Casual games make it easy to begin a quick session. Bubble Pop Arena challenges you to pop useful bubbles, build combos and avoid hazards before time runs out.",
  "MULTIPLAYER": "Multiplayer games are designed for shared competition or cooperation. More titles will appear here as supported multiplayer experiences become available.",
  "KIDS_FAMILY": "Family-friendly titles offer approachable play and age-appropriate experiences. Use individual game pages for details about controls and suitability."
};

function normalizeCategory(input?: string) {
  if (!input) return "";

  const cleaned = input
    .trim()
    .toUpperCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .replace(/&/g, "");

  const found = categories.find((c) => c.value === cleaned);
  return found?.value ?? "";
}

function categoryUrlValue(value: string) {
  return value.toLowerCase().replace(/_/g, "-");
}

function categoryLabel(value?: string | null) {
  const found = categories.find((c) => c.value === value);
  return found?.label ?? "Arcade";
}

function normalizeGameRows(
  rows: Array<{
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    category?: string | null;
    tags?: string[];
  }>
): GameListItem[] {
  return rows.map((row) => catalogGame({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? null,
    category: row.category ?? "ARCADE",
    tags: row.tags ?? [],
  }));
}

function filterGames(
  games: GameListItem[],
  q: string,
  category: string
): GameListItem[] {
  const query = q.toLowerCase();

  return games.filter((game) => {
    if (!isPublicGameSlug(game.slug)) return false;

    const matchCategory = !category || game.category === category;

    const matchQ =
      !query ||
      game.title.toLowerCase().includes(query) ||
      game.slug.toLowerCase().includes(query) ||
      (game.description ?? "").toLowerCase().includes(query) ||
      game.tags.join(" ").toLowerCase().includes(query) ||
      categoryLabel(game.category).toLowerCase().includes(query);

    return matchCategory && matchQ;
  });
}

function fallbackGameList() {
  return normalizeGameRows(getFallbackGames()).filter((game) =>
    isPublicGameSlug(game.slug)
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await Promise.resolve(searchParams);

  const q = typeof sp?.q === "string" ? sp.q.trim() : "";
  const category = normalizeCategory(sp?.category);
  const label = category ? categoryLabel(category) : "";

  const title = category
    ? `${label} Games | Free Browser Games on WebGameArena`
    : q
      ? `Search: ${q} | WebGameArena`
      : "Games Library | Free Mobile Browser Games on WebGameArena";

  const description = category
    ? `Play free ${label.toLowerCase()} browser games on WebGameArena. Discover mobile-first games built for instant play, high scores and quick fun.`
    : q
      ? `Search results for ${q} on WebGameArena. Find free browser games across arcade, action, adventure, puzzle, racing, educational and casual categories.`
      : "Browse free mobile-first browser games on WebGameArena. Play arcade, action, adventure, educational, puzzle, racing, word, casual and strategy games instantly.";

  // Filter/search pages are navigation tools, not separate editorial landing pages.
  // The curated /categories/* pages are the indexable category destinations.
  const canonical = "/games";

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
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
      "word games",
      "casual games",
      ...(category ? [`${label} games`] : []),
      ...(q ? [q] : []),
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: "WebGameArena",
      type: "website",
      locale: "en_ZA",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: !q && !category,
      follow: true,
    },
  };
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const sp = await Promise.resolve(searchParams);

  const q = typeof sp?.q === "string" ? sp.q.trim() : "";
  const category = normalizeCategory(sp?.category);

  let allGames: GameListItem[] = fallbackGameList();

  try {
    const dbGames = await getGamesFromDatabase();

    if (dbGames.length) {
      allGames = normalizeGameRows(dbGames);
    }
  } catch (error) {
    console.warn("[games] Falling back to static game list", error);
    allGames = fallbackGameList();
  }

  const totalGames = allGames.length;
  const games = filterGames(allGames, q, category);
  const availableCategories = categories.filter((option) => allGames.some((game) => game.category === option.value));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category
      ? `${categoryLabel(category)} Games`
      : q
        ? `Search results for ${q}`
        : "WebGameArena Game Library",
    url: `${SITE_URL}/games`,
    description:
      "Browse and play free mobile-first browser games on WebGameArena.",
    isPartOf: {
      "@type": "WebSite",
      name: "WebGameArena",
      url: SITE_URL,
    },
  };

  function hrefForCategory(nextCategory?: string) {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (nextCategory) {
      params.set("category", categoryUrlValue(nextCategory));
    }

    const qs = params.toString();
    return `/games${qs ? `?${qs}` : ""}`;
  }

  function clearSearchHref() {
    const params = new URLSearchParams();

    if (category) {
      params.set("category", categoryUrlValue(category));
    }

    const qs = params.toString();
    return `/games${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container">
        <section className="section">
          <div className="sectionTitle">
            <div>
              <div className="badge" style={{ width: "fit-content" }}>
                🎮 Game Library
              </div>

              <h2>
                {category
                  ? `${categoryLabel(category)} Games`
                  : q
                    ? `Search results for “${q}”`
                    : "Browse Games"}
              </h2>

              <p>
                {category ? CATEGORY_DESCRIPTIONS[category] : "Discover original browser games across racing, arcade, adventures, physics, geography, environmental learning, puzzles, word games and more. Choose a category that matches the kind of challenge you enjoy."}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link className="pill" href="/">
                Home
              </Link>
            </div>
          </div>

          <div
            className="heroCard"
            style={{
              padding: 14,
              marginBottom: 14,
              display: "grid",
              gap: 12,
            }}
          >
            <form className="toolbar" action="/games" method="get">
              {category ? (
                <input
                  type="hidden"
                  name="category"
                  value={categoryUrlValue(category)}
                />
              ) : null}

              <input
                className="input"
                name="q"
                defaultValue={q}
                placeholder="Search games, tags, descriptions…"
                aria-label="Search games"
              />

              <button className="cta" type="submit">
                Search
              </button>

              {q ? (
                <Link className="pill" href={clearSearchHref()}>
                  Clear search
                </Link>
              ) : null}

              {q || category ? (
                <Link className="pill" href="/games">
                  Reset all
                </Link>
              ) : null}
            </form>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Link
                className="pill"
                href={hrefForCategory()}
                style={{
                  borderColor: !category
                    ? "rgba(255,255,255,.35)"
                    : "rgba(255,255,255,.14)",
                  background: !category
                    ? "rgba(255,255,255,.12)"
                    : "rgba(255,255,255,.06)",
                }}
              >
                All
              </Link>

              {availableCategories.map((c) => {
                const active = category === c.value;

                return (
                  <Link
                    key={c.value}
                    className="pill"
                    href={hrefForCategory(c.value)}
                    style={{
                      borderColor: active
                        ? "rgba(255,255,255,.35)"
                        : "rgba(255,255,255,.14)",
                      background: active
                        ? "rgba(255,255,255,.12)"
                        : "rgba(255,255,255,.06)",
                    }}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>

            <div style={{ color: "rgba(255,255,255,.68)", fontSize: 13 }}>
              Showing <b>{games.length}</b> of <b>{totalGames}</b> games
              {category ? (
                <>
                  {" "}
                  in <b>{categoryLabel(category)}</b>
                </>
              ) : null}
              {q ? (
                <>
                  {" "}
                  matching <b>“{q}”</b>
                </>
              ) : null}
              .
            </div>
          </div>

          <div className="grid">
            {games.map((g, idx) => {
              const thumbVariant =
                idx % 3 === 1 ? "alt" : idx % 3 === 2 ? "soon" : "";

              const tags = (g.tags || []).slice(0, 3);

              return (
                <Link key={g.id} href={`/play/${g.slug}`} className="tile">
                  <div
                    className={`thumb ${thumbVariant}`}
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
                        backdropFilter: "blur(10px)",
                        background: "rgba(0,0,0,.35)",
                        borderColor: "rgba(255,255,255,.18)",
                      }}
                    >
                      {categoryLabel(g.category)}
                    </span>
                  </div>

                  <div className="tileBody">
                    <div className="tileTitle">{g.title}</div>

                    <div className="tileDesc">
                      {g.description || "Tap to play. Mobile-first."}
                    </div>

                    <div className="badges">
                      <span className="badge">
                        {categoryLabel(g.category)}
                      </span>

                      {tags.length ? (
                        tags.map((t) => (
                          <span key={t} className="badge">
                            {t}
                          </span>
                        ))
                      ) : (
                        <span className="badge">mobile</span>
                      )}
                    </div>

                    <div className="tileActions">
                      <span className="playBtn">Play →</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {!games.length ? (
              <div
                className="heroCard"
                style={{ gridColumn: "1 / -1", padding: 16 }}
              >
                <b>No games found.</b>
                <div style={{ color: "rgba(255,255,255,.7)", marginTop: 6 }}>
                  Try another category or clear your search filters.
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}