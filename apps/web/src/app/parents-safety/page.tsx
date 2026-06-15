// apps/web/src/app/parents-safety/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Parents & Safety | WebGameArena",
  description:
    "Learn how WebGameArena approaches player safety, younger players, accounts, chat, public leaderboards, privacy, advertising and family-friendly browser gaming.",
  alternates: {
    canonical: "/parents-safety",
  },
  openGraph: {
    title: "Parents & Safety | WebGameArena",
    description:
      "Information for parents and guardians about WebGameArena safety, privacy, chat, public leaderboards, advertising and responsible play.",
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
      description="WebGameArena is designed as a mobile-first browser gaming platform. This page explains how the platform approaches player safety, younger users, privacy, chat, advertising, leaderboards and responsible play."
      updated="15 June 2026"
      sections={[
        {
          title: "1. What is WebGameArena?",
          body: "WebGameArena is a browser-based gaming platform where players can play free games instantly without downloads. The platform includes game categories, leaderboards, daily challenges, game detail pages and selected social features such as game chat.",
        },
        {
          title: "2. Guidance for younger players",
          body: [
            "Younger players should use WebGameArena with guidance from a parent or guardian.",
            "Parents and guardians should help younger players choose suitable games and understand safe online behaviour.",
            "Players should avoid using full names, addresses, phone numbers, school names or personal contact details in usernames, chat or public score names.",
            "Parents can encourage players to use a simple nickname that does not reveal identity or location.",
          ],
        },
        {
          title: "3. Accounts and display names",
          body: [
            "Some features may require an account, such as saved scores or personalised player display.",
            "Display names may appear publicly on leaderboards or gameplay features.",
            "Parents should help younger players choose display names that are appropriate and do not include private information.",
            "Account credentials should never be shared in chat, email or public messages.",
          ],
        },
        {
          title: "4. Public leaderboards",
          body: [
            "Leaderboards may show a player display name, score and game name.",
            "Players should understand that public scores can be visible to other visitors.",
            "Suspicious, abusive or inappropriate leaderboard entries may be removed or moderated.",
          ],
        },
        {
          title: "5. Chat and community safety",
          body: [
            "Game chat is intended for short, friendly messages related to play.",
            "Players should not share private information in chat.",
            "Chat may include filters, message reporting, hiding or moderation.",
            "Parents should remind younger players not to click links from strangers or continue conversations that feel uncomfortable.",
            "Players can report problem messages and contact support@webgamearena.com for help.",
          ],
        },
        {
          title: "6. Game content and age suitability",
          body: [
            "WebGameArena aims to provide casual, family-friendly browser games.",
            "Game pages include descriptions, controls, objectives, scoring notes and family notes to help players understand what to expect.",
            "Some games may be faster, more competitive or more difficult than others.",
            "Parents should review game pages and choose games that match a player’s age, skills and comfort level.",
          ],
        },
        {
          title: "7. Advertising and sponsored content",
          body: [
            "WebGameArena may display advertising or sponsored content in future.",
            "Ads should be clearly separated from gameplay, controls, chat buttons, play buttons, fullscreen buttons and navigation links.",
            "Ads should not be placed inside game canvases or directly next to touch controls.",
            "Advertising cookies and personalised advertising choices are explained in the Privacy Policy and Cookie Policy.",
          ],
        },
        {
          title: "8. Privacy and cookies",
          body: [
            "WebGameArena may use cookies for login sessions, preferences, security, analytics and advertising where enabled.",
            "Parents can manage cookies through browser settings, although blocking some cookies may affect login or leaderboard features.",
            "Privacy questions can be sent to privacy@webgamearena.com.",
          ],
        },
        {
          title: "9. Healthy play habits",
          body: [
            "Take breaks between play sessions.",
            "Use games for fun and learning rather than pressure or frustration.",
            "Avoid sharing account details or private information.",
            "Stop playing and ask for help if another player behaves in a worrying or uncomfortable way.",
          ],
        },
        {
          title: "10. Contact for parents and guardians",
          body: [
            "For player support and safety issues, email support@webgamearena.com.",
            "For privacy questions, email privacy@webgamearena.com.",
            "For game content concerns, email games@webgamearena.com.",
          ],
        },
      ]}
    />
  );
}
