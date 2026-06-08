// apps/web/src/app/games/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { GameThumb } from "@/components/GameThumb";
import { getFallbackGames } from "@/lib/fallbackGames";
import { getGamesFromDatabase } from "@/lib/gamesDb";

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
  return rows.map((row) => ({
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
  return normalizeGameRows(getFallbackGames());
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

  const canonical =
    category || q
      ? `/games${category ? `?category=${categoryUrlValue(category)}` : ""}${
          q ? `${category ? "&" : "?"}q=${encodeURIComponent(q)}` : ""
        }`
      : "/games";

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
      index: true,
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
                Discover free mobile-first browser games across arcade, action,
                adventure, educational, puzzle, racing, word and casual
                categories.
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

              {categories.map((c) => {
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