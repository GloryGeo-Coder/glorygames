import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import { GAME_CATEGORIES, GAME_CATALOG, catalogCategory, catalogDescription } from "@/lib/gameCatalog";
import type { GameCategoryValue } from "@/lib/gameCatalog";

export type FsGame = {
  slug: string;
  title: string;
  description: string | null;
  category: GameCategoryValue;
  tags: string[];
  hasIndex: boolean;
};

function tryDirs() {
  const cwd = process.cwd();

  return [
    path.join(cwd, "public", "games"),
    path.join(cwd, "apps", "web", "public", "games"),
    path.join(cwd, "..", "public", "games"),
    path.join(cwd, "..", "apps", "web", "public", "games"),
  ];
}

export function resolveGamesDir() {
  for (const p of tryDirs()) {
    if (fssync.existsSync(p)) return p;
  }

  throw new Error(
    `Could not find public/games directory. Tried: ${tryDirs().join(" | ")}`
  );
}

function titleFromSlug(slug: string) {
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

async function readJsonIfExists(filePath: string) {
  try {
    const s = await fs.readFile(filePath, "utf8");
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function normalizeCategory(input: unknown): GameCategoryValue | null {
  if (typeof input !== "string") return null;

  const cleaned = input
    .trim()
    .toUpperCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .replace(/&/g, "")
    .replace(/\+/g, "_");

  if (cleaned === "WORD" || cleaned === "TRIVIA" || cleaned === "WORD_TRIVIA") {
    return "WORD_TRIVIA";
  }

  if (cleaned === "KIDS" || cleaned === "FAMILY" || cleaned === "KIDS_FAMILY") {
    return "KIDS_FAMILY";
  }

  return GAME_CATEGORIES.includes(cleaned as GameCategoryValue)
    ? (cleaned as GameCategoryValue)
    : null;
}

function normalizeTags(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((t) =>
      String(t)
        .trim()
        .toLowerCase()
        .replace(/^#/, "")
        .replace(/\s+/g, "-")
    )
    .filter(Boolean)
    .slice(0, 20);
}

function inferCategory(slug: string, title: string, tags: string[]): GameCategoryValue {
  const known = catalogCategory(slug, "ARCADE");
  if (slug in GAME_CATALOG) return known;

  const haystack = `${slug} ${title} ${tags.join(" ")}`.toLowerCase();

  if (
    haystack.includes("word") ||
    haystack.includes("typing") ||
    haystack.includes("math") ||
    haystack.includes("quiz") ||
    haystack.includes("learn") ||
    haystack.includes("education")
  ) {
    return "EDUCATIONAL";
  }

  if (
    haystack.includes("quest") ||
    haystack.includes("adventure") ||
    haystack.includes("story") ||
    haystack.includes("explore")
  ) {
    return "ADVENTURE";
  }

  if (
    haystack.includes("platform") ||
    haystack.includes("mario") ||
    haystack.includes("jump")
  ) {
    return "PLATFORMER";
  }

  if (
    haystack.includes("race") ||
    haystack.includes("racer") ||
    haystack.includes("runner") ||
    haystack.includes("speed") ||
    haystack.includes("drive")
  ) {
    return "RACING";
  }

  if (
    haystack.includes("defend") ||
    haystack.includes("defender") ||
    haystack.includes("tower-defense") ||
    haystack.includes("waves")
  ) {
    return "DEFENSE";
  }

  if (
    haystack.includes("puzzle") ||
    haystack.includes("match") ||
    haystack.includes("bubble") ||
    haystack.includes("stack") ||
    haystack.includes("logic")
  ) {
    return "PUZZLE";
  }

  if (
    haystack.includes("space") ||
    haystack.includes("shooter") ||
    haystack.includes("dodger") ||
    haystack.includes("combat") ||
    haystack.includes("action")
  ) {
    return "ACTION";
  }

  if (
    haystack.includes("casual") ||
    haystack.includes("tap") ||
    haystack.includes("idle")
  ) {
    return "CASUAL";
  }

  return "ARCADE";
}

export async function scanGamesFolder(): Promise<FsGame[]> {
  const gamesDir = resolveGamesDir();
  const entries = await fs.readdir(gamesDir, { withFileTypes: true });

  const out: FsGame[] = [];

  for (const e of entries) {
    if (!e.isDirectory()) continue;

    const slug = e.name.trim();
    if (!slug || slug.startsWith(".") || slug.startsWith("_") || slug.includes("template") || slug === "sdk") continue;

    const folder = path.join(gamesDir, slug);

    const indexPath = path.join(folder, "index.html");
    const hasIndex = fssync.existsSync(indexPath);

    const meta =
      (await readJsonIfExists(path.join(folder, "game.json"))) ??
      (await readJsonIfExists(path.join(folder, "manifest.json")));

    const title =
      typeof meta?.title === "string" && meta.title.trim()
        ? meta.title.trim()
        : titleFromSlug(slug);

    const description = catalogDescription(slug,
      typeof meta?.description === "string" && meta.description.trim()
        ? meta.description.trim().slice(0, 500)
        : null);

    const tags = normalizeTags(meta?.tags);

    const category =
      catalogCategory(slug, normalizeCategory(meta?.category) ?? inferCategory(slug, title, tags));

    out.push({ slug, title, description, category, tags, hasIndex });
  }

  return out
    .filter((g) => g.hasIndex)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function gameIndexExists(slug: string): Promise<boolean> {
  const gamesDir = resolveGamesDir();
  const p = path.join(gamesDir, slug, "index.html");
  return fssync.existsSync(p);
}