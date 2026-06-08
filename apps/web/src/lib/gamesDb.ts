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
    ORDER BY category ASC, title ASC
  `;

  return rows.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? null,
    category: row.category ?? "ARCADE",
    tags: Array.isArray(row.tags) ? row.tags : [],
  }));
}