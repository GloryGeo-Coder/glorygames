import Link from "next/link";
import { GameThumb } from "@/components/GameThumb";

export type GameTileModel = {
  slug: string;
  title: string;
  description: string;
  category?: string | null;
  tags: string[];
  placeholder?: boolean;
  variant?: "a" | "b" | "soon";
  top?: { displayName: string; score: number } | null;
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

function categoryLabel(category?: string | null) {
  if (!category) return "Arcade";
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");
}

function categoryUrl(category?: string | null) {
  if (!category) return "arcade";
  return category.toLowerCase().replace(/_/g, "-");
}

export default function GameTile({ game }: { game: GameTileModel }) {
  const category = game.category ?? "ARCADE";

  return (
    <article className="tile">
      <div style={{ position: "relative" }}>
        {game.placeholder ? (
          <div
            className="thumbWrap"
            style={{
              minHeight: 150,
              display: "grid",
              placeItems: "center",
              borderRadius: 18,
              background:
                "radial-gradient(circle at 25% 15%, rgba(255,255,255,.12), transparent 34%), linear-gradient(135deg, rgba(56,189,248,.14), rgba(167,139,250,.12))",
              border: "1px solid rgba(255,255,255,.10)",
              color: "rgba(255,255,255,.75)",
              fontWeight: 900,
            }}
          >
            Coming Soon
          </div>
        ) : (
          <div className="thumbWrap">
            <GameThumb slug={game.slug} title={game.title} />
          </div>
        )}

        {!game.placeholder ? (
          <Link
            className="badge"
            href={`/games?category=${encodeURIComponent(categoryUrl(category))}`}
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 3,
              backdropFilter: "blur(10px)",
              background: "rgba(0,0,0,.35)",
              borderColor: "rgba(255,255,255,.18)",
            }}
          >
            {categoryLabel(category)}
          </Link>
        ) : null}
      </div>

      <div className="tileBody">
        <h3 className="tileTitle">
          {game.placeholder ? (
            game.title
          ) : (
            <Link href={`/games/${game.slug}`}>{game.title}</Link>
          )}
        </h3>

        <p className="tileDesc">{game.description}</p>

        <div className="badges">
          {!game.placeholder ? (
            <Link
              className="badge"
              href={`/games?category=${encodeURIComponent(categoryUrl(category))}`}
            >
              {categoryLabel(category)}
            </Link>
          ) : (
            <span className="badge">{categoryLabel(category)}</span>
          )}

          {game.tags.slice(0, 3).map((t) =>
            game.placeholder ? (
              <span key={t} className="badge">
                #{t}
              </span>
            ) : (
              <Link
                key={t}
                className="badge"
                href={`/games?q=${encodeURIComponent(t)}`}
              >
                #{t}
              </Link>
            )
          )}
        </div>

        {!game.placeholder ? (
          <div
            style={{
              color: "rgba(255,255,255,.65)",
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {game.top ? (
              <>
                <b style={{ color: "rgba(255,255,255,.9)" }}>Top:</b>{" "}
                {game.top.displayName} ·{" "}
                <b style={{ color: "rgba(255,255,255,.9)" }}>
                  {game.top.score}
                </b>
              </>
            ) : (
              <>No scores yet — be the first.</>
            )}
          </div>
        ) : null}

        <div className="tileActions">
          {game.placeholder ? (
            <span style={{ color: "rgba(255,255,255,.55)", fontWeight: 800 }}>
              In progress
            </span>
          ) : (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link className="playBtn" href={`/play/${game.slug}`}>
                Play
              </Link>

              <Link className="pill" href={`/games/${game.slug}`}>
                Details
              </Link>
            </div>
          )}

          <span style={{ color: "rgba(255,255,255,.55)", fontSize: 12 }}>
            {game.placeholder ? "Soon" : "Live"}
          </span>
        </div>
      </div>
    </article>
  );
}