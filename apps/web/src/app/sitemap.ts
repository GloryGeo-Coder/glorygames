import type { MetadataRoute } from "next";
import { GAME_EDITORIALS } from "@/content/gameEditorials";

const SITE_URL = "https://webgamearena.com";
const CATEGORY_HUBS = ["educational", "adventure", "racing", "arcade"] as const;

/**
 * Generate a complete, deterministic sitemap without relying on a database
 * connection. Only canonical, indexable editorial game URLs are included.
 * Do not set lastModified to the current time on every request: it should
 * represent an actual page modification, not a sitemap regeneration.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/games`, changeFrequency: "weekly", priority: 0.9 },
    ...CATEGORY_HUBS.map((category) => ({
      url: `${SITE_URL}/categories/${category}`,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/cookies`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/community-guidelines`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/parents-safety`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/accessibility`, changeFrequency: "yearly", priority: 0.4 },
  ];

  const gameRoutes: MetadataRoute.Sitemap = Object.keys(GAME_EDITORIALS)
    .sort()
    .map((slug) => ({
      url: `${SITE_URL}/play/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...pages, ...gameRoutes];
}
