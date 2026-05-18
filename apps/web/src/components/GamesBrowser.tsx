"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GameGrid from "@/components/GameGrid";

type GameModel = {
  slug: string;
  title: string;
  description?: string | null;
  category?: string | null;
  tags: string[];
  createdAt: string;
  top?: { displayName: string; score: number } | null;
};

type SortKey = "new" | "az" | "old";

const CATEGORIES = [
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

function includesQ(text: string, q: string) {
  return text.toLowerCase().includes(q.toLowerCase());
}

function parseTagsParam(v: string | null) {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeCategory(input?: string | null) {
  if (!input) return "";

  const cleaned = input
    .trim()
    .toUpperCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .replace(/&/g, "");

  const found = CATEGORIES.find((c) => c.value === cleaned);
  return found?.value ?? "";
}

function categoryUrlValue(value: string) {
  return value.toLowerCase().replace(/_/g, "-");
}

function categoryLabel(value?: string | null) {
  if (!value) return "Arcade";
  const found = CATEGORIES.find((c) => c.value === value);
  return found?.label ?? value.replace(/_/g, " ");
}

export default function GamesBrowser({ games }: { games: GameModel[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("new");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // 1) Initialize from URL params and react to back/forward navigation.
  useEffect(() => {
    const nextQ = sp.get("q") ?? "";
    const nextSort = (sp.get("sort") as SortKey) || "new";
    const nextTags = parseTagsParam(sp.get("tags"));
    const nextCategory = normalizeCategory(sp.get("category"));

    setQ(nextQ);
    setSort(nextSort === "az" || nextSort === "old" ? nextSort : "new");
    setSelectedTags(nextTags);
    setCategory(nextCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);

  // 2) Push current filters back into the URL.
  useEffect(() => {
    const params = new URLSearchParams();

    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", categoryUrlValue(category));
    if (selectedTags.length) params.set("tags", selectedTags.join(","));
    if (sort !== "new") params.set("sort", sort);

    const qs = params.toString();
    const nextUrl = qs ? `/games?${qs}` : "/games";
    const current = sp.toString();

    if ((qs || "") !== (current || "")) {
      router.replace(nextUrl, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, selectedTags.join(","), sort]);

  const allTags = useMemo(() => {
    const set = new Set<string>();

    for (const g of games) {
      for (const t of g.tags ?? []) set.add(t);
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [games]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const g of games) {
      const cat = g.category ?? "ARCADE";
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }

    return counts;
  }, [games]);

  const filtered = useMemo(() => {
    const qq = q.trim();

    let out = games.filter((g) => {
      const title = g.title ?? "";
      const desc = g.description ?? "";
      const tags = (g.tags ?? []).join(" ");
      const gameCategory = g.category ?? "ARCADE";

      const matchQ =
        qq.length === 0 ||
        includesQ(title, qq) ||
        includesQ(desc, qq) ||
        includesQ(tags, qq) ||
        includesQ(categoryLabel(gameCategory), qq);

      const matchCategory = !category || gameCategory === category;

      const matchTags =
        selectedTags.length === 0 ||
        selectedTags.every((t) => (g.tags ?? []).includes(t));

      return matchQ && matchCategory && matchTags;
    });

    out = out.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title);
      if (sort === "old") {
        return +new Date(a.createdAt) - +new Date(b.createdAt);
      }
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });

    return out;
  }, [games, q, category, selectedTags, sort]);

  const showPlaceholders =
    q.trim().length === 0 && selectedTags.length === 0 && !category;

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function resetFilters() {
    setQ("");
    setSelectedTags([]);
    setCategory("");
    setSort("new");
  }

  return (
    <>
      <div className="toolbar">
        <input
          className="input"
          placeholder="Search games, categories, tags, descriptions…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="input"
          style={{ flex: "0 0 190px" }}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
              {categoryCounts.get(c.value)
                ? ` (${categoryCounts.get(c.value)})`
                : ""}
            </option>
          ))}
        </select>

        <select
          className="input"
          style={{ flex: "0 0 170px" }}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort games"
        >
          <option value="new">Sort: Newest</option>
          <option value="az">Sort: A–Z</option>
          <option value="old">Sort: Oldest</option>
        </select>

        <button className="pill" onClick={resetFilters}>
          Reset
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <button
          className="pill"
          onClick={() => setCategory("")}
          style={{
            background: !category ? "rgba(255,255,255,.12)" : undefined,
            color: !category ? "rgba(255,255,255,.92)" : undefined,
          }}
        >
          All
        </button>

        {CATEGORIES.map((c) => {
          const active = category === c.value;
          const count = categoryCounts.get(c.value) ?? 0;

          return (
            <button
              key={c.value}
              className="pill"
              onClick={() => setCategory(active ? "" : c.value)}
              style={{
                background: active ? "rgba(255,255,255,.12)" : undefined,
                color: active ? "rgba(255,255,255,.92)" : undefined,
                opacity: count === 0 ? 0.55 : undefined,
              }}
            >
              {c.label}
              {count ? ` · ${count}` : ""}
            </button>
          );
        })}
      </div>

      {allTags.length > 0 ? (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          {allTags.slice(0, 18).map((t) => {
            const active = selectedTags.includes(t);

            return (
              <button
                key={t}
                className="pill"
                onClick={() => toggleTag(t)}
                style={{
                  background: active ? "rgba(255,255,255,.12)" : undefined,
                  color: active ? "rgba(255,255,255,.92)" : undefined,
                }}
              >
                #{t}
              </button>
            );
          })}

          {allTags.length > 18 ? (
            <span className="pill" aria-disabled="true">
              +{allTags.length - 18} more
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13 }}>
          Showing{" "}
          <b style={{ color: "rgba(255,255,255,.92)" }}>{filtered.length}</b>{" "}
          games
          {category ? (
            <>
              {" "}
              in{" "}
              <b style={{ color: "rgba(255,255,255,.92)" }}>
                {categoryLabel(category)}
              </b>
            </>
          ) : null}
        </div>

        <div style={{ color: "rgba(255,255,255,.55)", fontSize: 13 }}>
          {showPlaceholders
            ? "Placeholders included"
            : "Placeholders hidden while filtering"}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="heroCard" style={{ padding: 18 }}>
          <b>No results.</b>
          <div style={{ color: "rgba(255,255,255,.70)", marginTop: 6 }}>
            Try a different search, category, or tag filter.
          </div>
        </div>
      ) : (
        <GameGrid games={filtered} fillTo={showPlaceholders ? 18 : filtered.length} />
      )}
    </>
  );
}