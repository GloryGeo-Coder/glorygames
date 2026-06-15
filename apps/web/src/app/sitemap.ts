// apps/web/src/app/sitemap.ts

import type { MetadataRoute } from "next";
import { getSitemapGamesFromDatabase } from "@/lib/gamesDb";

const SITE_URL = "https://webgamearena.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/games`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/cookies`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/community-guidelines`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/parents-safety`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/accessibility`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const games = await getSitemapGamesFromDatabase();

    const gameRoutes: MetadataRoute.Sitemap = games.flatMap((game) => [
      {
        url: `${SITE_URL}/play/${game.slug}`,
        lastModified: game.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/games/${game.slug}`,
        lastModified: game.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      },
    ]);

    return [...staticRoutes, ...gameRoutes];
  } catch (error) {
    console.warn("[sitemap] Falling back to static sitemap routes", error);
    return staticRoutes;
  }
}
