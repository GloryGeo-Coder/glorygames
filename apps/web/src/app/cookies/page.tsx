// apps/web/src/app/cookies/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Cookie Policy | GloryGames",
  description:
    "Read the GloryGames Cookie Policy to understand how cookies and similar technologies may be used for login sessions, analytics, preferences and platform improvement.",
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "Cookie Policy | GloryGames",
    description:
      "Learn how GloryGames uses cookies for sessions, preferences, analytics and player experience improvements.",
    url: "https://glorygames.co.za/cookies",
    siteName: "GloryGames",
    type: "website",
    locale: "en_ZA",
  },
};

export default function CookiePolicyPage() {
  return (
    <InfoPage
      eyebrow="Cookie Policy"
      title="How GloryGames may use cookies."
      description="This Cookie Policy explains how GloryGames may use cookies and similar technologies to support login sessions, preferences, analytics, security and platform improvement."
      updated="18 May 2026"
      sections={[
        {
          title: "1. What are cookies?",
          body: "Cookies are small text files stored on your device by a website. They help websites remember information such as login sessions, preferences and basic usage activity.",
        },
        {
          title: "2. Why GloryGames may use cookies",
          body: [
            "To keep players signed in where account features are available.",
            "To remember basic preferences and improve the player experience.",
            "To help games and pages load correctly.",
            "To understand how players use the platform so we can improve performance, content and game discovery.",
            "To support security, abuse prevention and platform stability.",
          ],
        },
        {
          title: "3. Types of cookies we may use",
          body: [
            "Essential cookies — needed for core website functions such as authentication, security and page operation.",
            "Preference cookies — used to remember settings or interface preferences.",
            "Analytics cookies — used to understand general usage patterns, game popularity and platform performance.",
            "Advertising cookies — may be introduced in future if GloryGames adds player-friendly advertising or sponsorship features.",
          ],
        },
        {
          title: "4. Essential cookies",
          body: "Essential cookies help the platform work properly. These may support login sessions, security checks, routing and other core features needed to use the website.",
        },
        {
          title: "5. Analytics and improvement",
          body: "Analytics may help GloryGames understand which pages and games are popular, where errors happen and how the platform can be improved. Analytics should be used in a way that supports platform quality and player experience.",
        },
        {
          title: "6. Advertising cookies",
          body: "If advertising is added in future, advertising partners may use cookies or similar technologies to measure ad delivery and relevance. GloryGames aims to keep advertising respectful, clear and appropriate for a broad audience.",
        },
        {
          title: "7. Managing cookies",
          body: "Most browsers allow you to block, delete or manage cookies through browser settings. Blocking some cookies may affect login, leaderboard features, preferences or other platform functions.",
        },
        {
          title: "8. Third-party services",
          body: "Some features may rely on trusted third-party tools such as analytics, hosting, security, payments or advertising services. These services may use cookies according to their own policies.",
        },
        {
          title: "9. Changes to this policy",
          body: "This Cookie Policy may be updated as GloryGames adds new features, analytics, advertising or platform tools. The updated date will show when changes were last made.",
        },
        {
          title: "10. Contact",
          body: "For questions about cookies or privacy on GloryGames, please use the Contact page.",
        },
      ]}
    />
  );
}