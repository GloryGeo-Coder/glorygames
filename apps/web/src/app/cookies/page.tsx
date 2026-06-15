// apps/web/src/app/cookies/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cookie Policy | WebGameArena",
  description:
    "Read the WebGameArena Cookie Policy to understand how cookies and similar technologies may be used for login sessions, analytics, advertising, preferences and platform improvement.",
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "Cookie Policy | WebGameArena",
    description:
      "Learn how WebGameArena uses cookies for sessions, preferences, analytics, advertising and player experience improvements.",
    url: "https://webgamearena.com/cookies",
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
};

export default function CookiePolicyPage() {
  return (
    <InfoPage
      eyebrow="Cookie Policy"
      title="How WebGameArena may use cookies."
      description="This Cookie Policy explains how WebGameArena may use cookies and similar technologies to support login sessions, preferences, analytics, security, advertising and platform improvement."
      updated="15 June 2026"
      sections={[
        {
          title: "1. What are cookies?",
          body: "Cookies are small text files stored on your device by a website. Similar technologies may include local storage, pixels, tags, device identifiers or browser storage. They help websites remember information such as login sessions, preferences and basic usage activity.",
        },
        {
          title: "2. Why WebGameArena may use cookies",
          body: [
            "To keep players signed in where account features are available.",
            "To remember basic preferences and improve the player experience.",
            "To help games and pages load correctly.",
            "To understand how players use the platform so we can improve performance, content and game discovery.",
            "To support security, abuse prevention and platform stability.",
            "To support advertising, sponsorships or analytics if these services are enabled on the website.",
          ],
        },
        {
          title: "3. Types of cookies we may use",
          body: [
            "Essential cookies — needed for core website functions such as authentication, security, routing and page operation.",
            "Preference cookies — used to remember settings or interface preferences.",
            "Analytics cookies — used to understand general usage patterns, game popularity and platform performance.",
            "Advertising cookies — used by advertising partners to deliver, measure and improve ads, including personalized ads where permitted.",
            "Security cookies — used to help protect accounts, prevent spam and reduce misuse of community or leaderboard features.",
          ],
        },
        {
          title: "4. Essential cookies",
          body: "Essential cookies help the platform work properly. These may support login sessions, security checks, routing and other core features needed to use the website. Some parts of WebGameArena may not work correctly if essential cookies are blocked.",
        },
        {
          title: "5. Analytics and improvement cookies",
          body: "Analytics may help WebGameArena understand which pages and games are popular, where errors happen and how the platform can be improved. Analytics should be used in a way that supports platform quality and player experience.",
        },
        {
          title: "6. Google advertising cookies",
          body: [
            "Third-party vendors, including Google, may use cookies to serve ads based on a user's prior visits to WebGameArena.com or other websites.",
            "Google's use of advertising cookies enables Google and its partners to serve ads to users based on visits to WebGameArena.com and/or other sites on the Internet.",
            "Users may opt out of personalized advertising by visiting Google Ads Settings.",
            "Users may also be able to opt out of some third-party vendors' use of cookies for personalized advertising through industry opt-out pages such as aboutads.info, where available.",
          ],
        },
        {
          title: "7. Third-party services",
          body: [
            "Some features may rely on trusted third-party tools such as analytics, hosting, security, database, advertising or measurement services.",
            "These services may use cookies or similar technologies according to their own policies.",
            "Where advertising is used, third-party vendors and ad networks may serve ads on WebGameArena and may place or read cookies on a user's browser.",
          ],
        },
        {
          title: "8. Managing cookies",
          body: [
            "Most browsers allow you to block, delete or manage cookies through browser settings.",
            "Blocking some cookies may affect login, leaderboard features, preferences, chat safety controls or other platform functions.",
            "You can manage personalized advertising preferences through Google Ads Settings where Google advertising is used.",
          ],
        },
        {
          title: "9. Ad placement and gameplay",
          body: "WebGameArena aims to keep advertising clearly separated from game windows, play buttons, fullscreen buttons, chat send buttons, navigation controls and other interactive elements to reduce accidental clicks and protect the gameplay experience.",
        },
        {
          title: "10. Changes to this policy",
          body: "This Cookie Policy may be updated as WebGameArena adds new features, analytics, advertising or platform tools. The updated date will show when changes were last made.",
        },
        {
          title: "11. Contact",
          body: [
            "For questions about cookies or privacy on WebGameArena, contact privacy@webgamearena.com.",
            "For player support, contact support@webgamearena.com.",
          ],
        },
      ]}
    />
  );
}
