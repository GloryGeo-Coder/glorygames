// apps/web/src/app/about/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const dynamic = "force-static";

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
      title="Choose a game, learn its controls and start playing."
      description="WebGameArena brings browser games, game-specific guides and public scoreboards together. Browse by category, read the controls and open a game on your phone, tablet or desktop."
      updated="22 November 2026"
      cta={{
        label: "Browse Games",
        href: "/games",
      }}
      sections={[
        { title: "Built and maintained by Glory Mulopo", body: "WebGameArena is a browser-game project built and maintained by Glory Mulopo. Game-specific sponsorships are identified in the relevant game guide. Use Contact Us for support, game-content questions or ownership concerns." },
        { title: "Choose a game before you start", body: [
          "Game pages explain the premise, objectives, controls, progression, local saves and practical tips for that title. Educational guides also identify their learning themes and relevant source links where provided.",
          "Choose a category or search the library for a title or topic. Read the game’s mobile and desktop controls before starting; games vary in pace, difficulty and subject matter."
        ] },
        { title: "Open the game and keep the guide nearby", body: [
          "Play Game opens a dedicated game tab. The information page remains available for instructions, scores and chat. Brick Playground opens its full-window workshop, while Sky Temple opens its campaign launch.",
          "Sound and fullscreen controls depend on the game and browser. Start them from the game’s own controls where available. No app-store installation is required."
        ] },
        { title: "Progress, scores and community", body: [
          "Games that support local saves keep progress on this browser and device. Clearing site data can remove those saves. Local progress is separate from an account or a public score.",
          "Existing accounts can sign in for global score submissions. Daily challenges also accept guest nicknames. Leaderboard names and scores, including historical entries, are public. Use a nickname that does not reveal personal details.",
          "Public chat includes content checks, rate limits and reporting. New registration and reviews are currently closed. See Parents & Safety and the Privacy Policy for the current community and privacy boundaries."
        ] },
        { title: "When something does not work", body: "Games and guides are updated as issues are found. Use Contact Us to report the game title, your browser and device, and the steps that led to the problem. Do not include passwords or unnecessary personal information. This helps distinguish a loading, control, save or content issue." },
        { title: "For families", body: "Families can browse and play without creating an account. Parents and guardians should review each game’s description and controls with younger players, help them choose non-identifying nicknames and take breaks. Games do not all share one age rating." },
        { title: "For game creators", body: "Game submissions are currently closed. The Games contact on our Contact Us page is available for questions about game content, credits and ownership." },
      ]}
    />
  );
}