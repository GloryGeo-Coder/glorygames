// apps/web/src/app/about/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "About WebGameArena | Free Mobile Browser Games",
  description:
    "Learn about WebGameArena, a mobile-first browser gaming platform for free arcade, adventure, puzzle, educational and casual games.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About WebGameArena",
    description:
      "WebGameArena is a mobile-first browser gaming platform built for instant play, high scores and friendly competition.",
    url: "https://WebGameArena.com/about",
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "About WebGameArena",
    description:
      "Play free mobile-first browser games instantly on WebGameArena.",
  },
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About WebGameArena"
      title="A mobile-first home for quick, fun browser games."
      description="WebGameArena is built for players who want fast, beautiful and accessible games that launch instantly in the browser — no downloads, no complicated setup, just play."
      cta={{
        label: "Browse Games",
        href: "/games",
      }}
      sections={[
        {
          title: "What is WebGameArena?",
          body: "WebGameArena is a free browser gaming platform focused on mobile-first play. The platform hosts arcade, action, adventure, educational, puzzle, racing and casual games that players can launch instantly from their phone, tablet or desktop.",
        },
        {
          title: "Our player promise",
          body: [
            "Games should be easy to open, easy to understand and fun to replay.",
            "Every game should work smoothly on mobile and desktop screens.",
            "Players should be able to chase scores, discover categories and come back for new challenges.",
          ],
        },
        {
          title: "Why browser games?",
          body: "Browser games are accessible, lightweight and quick to play. They are ideal for short breaks, casual sessions and mobile-first entertainment without requiring app store downloads.",
        },
        {
          title: "What we are building",
          body: [
            "A growing library of free instant-play games.",
            "Daily challenges and leaderboards for friendly competition.",
            "Game categories such as Arcade, Adventure, Educational, Racing, Puzzle and Casual.",
            "More original games, including Kasi Quest levels and future multiplayer experiences.",
          ],
        },
        {
          title: "For developers and creators",
          body: "WebGameArena is also being shaped as a platform where browser game creators can publish, test and showcase mobile-friendly HTML5 games. A submission process will be added as the platform matures.",
        },
      ]}
    />
  );
}