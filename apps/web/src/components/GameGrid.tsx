import GameTile, { type GameTileModel } from "./GameTile";

type GameGridInput = {
  slug: string;
  title: string;
  description?: string | null;
  category?: string | null;
  tags?: string[];
  top?: { displayName: string; score: number } | null;
};

export default function GameGrid({
  games,
  fillTo = 12,
}: {
  games: GameGridInput[];
  fillTo?: number;
}) {
  const mapped: GameTileModel[] = games.map((g, idx) => ({
    slug: g.slug,
    title: g.title,
    description: g.description ?? "",
    category: g.category ?? "ARCADE",
    tags: g.tags?.length ? g.tags : ["arcade"],
    top: g.top ?? null,
    variant: idx % 2 === 0 ? "a" : "b",
  }));

  while (mapped.length < fillTo) {
    mapped.push({
      slug: "",
      title: "Coming Soon",
      description: "New game in development. Stay tuned.",
      category: "CASUAL",
      tags: ["new", "platform"],
      placeholder: true,
      variant: "soon",
    });
  }

  return (
    <div className="grid">
      {mapped.map((g, i) => (
        <GameTile key={`${g.slug || "soon"}-${i}`} game={g} />
      ))}
    </div>
  );
}