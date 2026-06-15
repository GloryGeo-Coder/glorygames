// apps/web/src/lib/gamesDb.ts

import { getNeonSql, hasUsableNeonDatabaseUrl } from "@/lib/neon";

export type DbGameListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
};

export type DbSitemapGame = {
  slug: string;
  updatedAt: Date | string;
};

export type DbLeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  gameSlug: string;
  gameTitle: string;
};

const HIDDEN_GAME_SLUGS = new Set([
  "_template",
  "template",
  "neon-dodger-template",
]);

export function isPublicGameSlug(slug?: string | null) {
  if (!slug) return false;

  const clean = slug.trim().toLowerCase();

  if (!clean) return false;
  if (clean.startsWith("_")) return false;
  if (HIDDEN_GAME_SLUGS.has(clean)) return false;
  if (clean.includes("template")) return false;

  return true;
}

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.filter(Boolean).map((tag) => String(tag));
  }

  return [];
}

function normalizeGameRow(row: any): DbGameListItem {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: row.description ?? null,
    category: row.category ?? "ARCADE",
    tags: normalizeTags(row.tags),
  };
}

export async function getGamesFromDatabase(): Promise<DbGameListItem[]> {
  if (!hasUsableNeonDatabaseUrl()) {
    return [];
  }

  const sql = getNeonSql();

  const rows = await sql`
    SELECT
      id,
      slug,
      title,
      description,
      category::text AS category,
      tags
    FROM "Game"
    WHERE
      LEFT(slug, 1) <> '_'
      AND LOWER(slug) NOT LIKE '%template%'
      AND LOWER(title) NOT LIKE '%template%'
    ORDER BY category ASC, title ASC
  `;

  return rows.map(normalizeGameRow).filter((game) => isPublicGameSlug(game.slug));
}

export async function getGameFromDatabase(
  slug: string
): Promise<DbGameListItem | null> {
  if (!hasUsableNeonDatabaseUrl() || !isPublicGameSlug(slug)) {
    return null;
  }

  const sql = getNeonSql();

  const rows = await sql`
    SELECT
      id,
      slug,
      title,
      description,
      category::text AS category,
      tags
    FROM "Game"
    WHERE
      slug = ${slug}
      AND LEFT(slug, 1) <> '_'
      AND LOWER(slug) NOT LIKE '%template%'
      AND LOWER(title) NOT LIKE '%template%'
    LIMIT 1
  `;

  const game = rows[0] ? normalizeGameRow(rows[0]) : null;

  return game && isPublicGameSlug(game.slug) ? game : null;
}

export async function getRelatedGamesFromDatabase({
  slug,
  category,
  limit = 4,
}: {
  slug: string;
  category?: string | null;
  limit?: number;
}): Promise<DbGameListItem[]> {
  if (!hasUsableNeonDatabaseUrl()) {
    return [];
  }

  const sql = getNeonSql();

  if (category) {
    const rows = await sql`
      SELECT
        id,
        slug,
        title,
        description,
        category::text AS category,
        tags
      FROM "Game"
      WHERE
        slug <> ${slug}
        AND category::text = ${category}
        AND LEFT(slug, 1) <> '_'
        AND LOWER(slug) NOT LIKE '%template%'
        AND LOWER(title) NOT LIKE '%template%'
      ORDER BY title ASC
      LIMIT ${limit}
    `;

    const related = rows.map(normalizeGameRow).filter((game) => isPublicGameSlug(game.slug));

    if (related.length) {
      return related;
    }
  }

  const fallbackRows = await sql`
    SELECT
      id,
      slug,
      title,
      description,
      category::text AS category,
      tags
    FROM "Game"
    WHERE
      slug <> ${slug}
      AND LEFT(slug, 1) <> '_'
      AND LOWER(slug) NOT LIKE '%template%'
      AND LOWER(title) NOT LIKE '%template%'
    ORDER BY title ASC
    LIMIT ${limit}
  `;

  return fallbackRows.map(normalizeGameRow).filter((game) => isPublicGameSlug(game.slug));
}

export async function getSitemapGamesFromDatabase(): Promise<DbSitemapGame[]> {
  if (!hasUsableNeonDatabaseUrl()) {
    return [];
  }

  const sql = getNeonSql();

  const rows = await sql`
    SELECT
      slug,
      "updatedAt"
    FROM "Game"
    WHERE
      LEFT(slug, 1) <> '_'
      AND LOWER(slug) NOT LIKE '%template%'
      AND LOWER(title) NOT LIKE '%template%'
    ORDER BY title ASC
  `;

  return rows
    .map((row: any) => ({
      slug: String(row.slug),
      updatedAt: row.updatedAt ?? new Date(),
    }))
    .filter((game) => isPublicGameSlug(game.slug));
}

export async function getLeaderboardForGameFromDatabase({
  slug,
  mode = "global",
  limit = 10,
}: {
  slug: string;
  mode?: string;
  limit?: number;
}): Promise<DbLeaderboardEntry[]> {
  if (!hasUsableNeonDatabaseUrl() || !isPublicGameSlug(slug)) {
    return [];
  }

  const sql = getNeonSql();

  const rows = await sql`
    SELECT
      u.id AS "userId",
      COALESCE(u."displayName", 'Player') AS "displayName",
      MAX(s.value)::int AS score,
      g.slug AS "gameSlug",
      g.title AS "gameTitle"
    FROM "Score" s
    INNER JOIN "Game" g ON g.id = s."gameId"
    INNER JOIN "User" u ON u.id = s."userId"
    WHERE
      g.slug = ${slug}
      AND s.mode = ${mode}
      AND LEFT(g.slug, 1) <> '_'
      AND LOWER(g.slug) NOT LIKE '%template%'
      AND LOWER(g.title) NOT LIKE '%template%'
    GROUP BY u.id, u."displayName", g.slug, g.title
    ORDER BY score DESC
    LIMIT ${limit}
  `;

  return rows.map((row: any, index: number) => ({
    rank: index + 1,
    userId: String(row.userId),
    displayName: String(row.displayName || "Player"),
    score: Number(row.score || 0),
    gameSlug: String(row.gameSlug),
    gameTitle: String(row.gameTitle),
  }));
}

export async function getGlobalLeaderboardFromDatabase(
  limit = 50
): Promise<DbLeaderboardEntry[]> {
  if (!hasUsableNeonDatabaseUrl()) {
    return [];
  }

  const sql = getNeonSql();

  const rows = await sql`
    SELECT
      u.id AS "userId",
      COALESCE(u."displayName", 'Player') AS "displayName",
      MAX(s.value)::int AS score,
      g.slug AS "gameSlug",
      g.title AS "gameTitle"
    FROM "Score" s
    INNER JOIN "Game" g ON g.id = s."gameId"
    INNER JOIN "User" u ON u.id = s."userId"
    WHERE
      LEFT(g.slug, 1) <> '_'
      AND LOWER(g.slug) NOT LIKE '%template%'
      AND LOWER(g.title) NOT LIKE '%template%'
    GROUP BY u.id, u."displayName", g.slug, g.title
    ORDER BY score DESC
    LIMIT ${limit}
  `;

  return rows.map((row: any, index: number) => ({
    rank: index + 1,
    userId: String(row.userId),
    displayName: String(row.displayName || "Player"),
    score: Number(row.score || 0),
    gameSlug: String(row.gameSlug),
    gameTitle: String(row.gameTitle),
  }));
}
