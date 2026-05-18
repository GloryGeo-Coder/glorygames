// apps/web/src/app/sitemap.ts

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = "https://glorygames.co.za";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const games = await prisma.game.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/games`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

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
      priority: 0.7,
    },
  ]);

  return [...staticRoutes, ...gameRoutes];
}