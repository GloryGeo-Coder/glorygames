// apps/web/src/app/sitemap.ts

import type { MetadataRoute } from "next";
import { getSitemapGamesFromDatabase } from "@/lib/gamesDb";
import { GAME_EDITORIALS } from "@/content/gameEditorials";

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

  const contentRoutes = (slugs: string[]): MetadataRoute.Sitemap =>
    [...new Set(slugs)]
      .filter((slug) => Boolean(GAME_EDITORIALS[slug]))
      .map((slug) => ({
        url: `${SITE_URL}/play/${slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

  try {
    const games = await getSitemapGamesFromDatabase();
    const slugs = games.map((game) => game.slug);
    return [...staticRoutes, ...contentRoutes(slugs.length ? slugs : Object.keys(GAME_EDITORIALS))];
  } catch (error) {
    console.warn("[sitemap] Falling back to documented game routes", error);
    return [...staticRoutes, ...contentRoutes(Object.keys(GAME_EDITORIALS))];
  }
}
