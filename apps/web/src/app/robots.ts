// apps/web/src/app/robots.ts

import type { MetadataRoute } from "next";

const SITE_URL = "https://glorygames.co.za";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/login",
        "/signup",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}