// apps/web/src/app/parents-safety/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Parents & Safety | WebGameArena",
  description:
    "Learn how WebGameArena approaches player safety, younger players, chat, privacy, ads, game content and family-friendly browser gaming.",
  alternates: {
    canonical: "/parents-safety",
  },
  openGraph: {
    title: "Parents & Safety | WebGameArena",
    description:
      "Information for parents and guardians about WebGameArena safety, privacy, chat, content and responsible play.",
    url: "https://webgamearena.com/parents-safety",
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
};

export default function ParentsSafetyPage() {
  return (
    <InfoPage
      eyebrow="Parents & Safety"
      title="Helping families understand safe play on WebGameArena."
      description="WebGameArena is designed as a mobile-first browser gaming platform. This page explains how the platform approaches player safety, younger users, privacy, chat, advertising and responsible play."
      updated="18 May 2026"
      sections={[
        {
          title: "1. What is WebGameArena?",
          body: "WebGameArena is a browser-based gaming platform where players can play free games instantly without downloads. The platform includes game categories, leaderboards, daily challenges and selected social features such as game chat.",
        },
        {
          title: "2. Younger players",
          body: [
            "Younger players should use WebGameArena with guidance from a parent or guardian.",
            "Parents and guardians should help younger players choose suitable games and understand safe online behaviour.",
            "Players should not use personal information such as full names, addresses, phone numbers or school names in usernames or chat.",
          ],
        },
        {
          title: "3. Chat and social features",
          body: [
            "Some games may include chat or social interaction features.",
            "Players should keep chat respectful, avoid sharing private information and report unsafe or inappropriate behaviour.",
            "WebGameArena may moderate or restrict chat features where needed to protect players and platform safety.",
          ],
        },
        {
          title: "4. Leaderboards and display names",
          body: [
            "Leaderboards may show player names and scores publicly.",
            "Players should use safe display names that do not reveal personal identity or contact details.",
            "Scores that appear fraudulent, abusive or unfair may be removed.",
          ],
        },
        {
          title: "5. Game content",
          body: "WebGameArena aims to offer browser games suitable for a broad player audience. As the platform grows, game categories and safety review processes will help players and parents understand the type of experience each game offers.",
        },
        {
          title: "6. Advertising and sponsorships",
          body: "If advertising or sponsorships are added in future, WebGameArena aims to keep ads clearly separated from gameplay, suitable for a broad audience and respectful of the player experience.",
        },
        {
          title: "7. Privacy",
          body: "WebGameArena may collect limited information to support accounts, scores, leaderboards, chat, analytics and platform improvements. More information is available in the Privacy Policy and Cookie Policy.",
        },
        {
          title: "8. Responsible play",
          body: [
            "Games should be played for fun, relaxation and healthy competition.",
            "Players should take breaks and avoid playing for long periods without rest.",
            "Parents and guardians can help younger players balance gaming with school, sleep, exercise and offline activities.",
          ],
        },
        {
          title: "9. Reporting concerns",
          body: "If you notice unsafe chat, inappropriate usernames, broken games, suspicious behaviour or privacy concerns, use the Contact page and include the game name, device/browser and a short description of the issue.",
        },
        {
          title: "10. Our safety direction",
          body: "As WebGameArena grows, safety features may include clearer age guidance, reporting tools, moderation systems, improved content labels and more family-focused information on game pages.",
        },
      ]}
    />
  );
}