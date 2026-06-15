// apps/web/src/app/privacy/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy | WebGameArena",
  description:
    "Read the WebGameArena Privacy Policy to understand what information may be collected, how it is used, how advertising cookies may work, and how player privacy is protected.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | WebGameArena",
    description:
      "Learn how WebGameArena handles player information, gameplay data, cookies, analytics, advertising cookies and safety.",
    url: "https://webgamearena.com/privacy",
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy Policy"
      title="Your privacy matters when you play."
      description="This Privacy Policy explains how WebGameArena may collect, use and protect information when players visit the website, create an account, play games, use chat features, interact with leaderboards, or view advertising."
      updated="15 June 2026"
      sections={[
        {
          title: "1. Information we may collect",
          body: [
            "Account information such as display name, email address and login details if players create an account.",
            "Gameplay information such as scores, leaderboard entries, game progress, daily challenge activity and selected game categories.",
            "Technical information such as browser type, device type, pages visited, approximate usage time, referring pages and basic performance information.",
            "Chat or community content if a player uses game chat or other interactive features.",
            "Cookies or similar technologies used for login sessions, preferences, analytics, advertising, security and site improvement.",
          ],
        },
        {
          title: "2. How we use information",
          body: [
            "To operate the website and make games playable in the browser.",
            "To create and manage accounts where account features are available.",
            "To save scores, display leaderboards and support daily challenges.",
            "To improve game performance, fix errors and understand which games players enjoy.",
            "To keep accounts secure and prevent misuse, spam, harmful behaviour or abuse of chat and leaderboard features.",
            "To measure site performance and understand how visitors discover and use WebGameArena.",
            "To support advertising, sponsorships or analytics if these services are enabled on the website.",
          ],
        },
        {
          title: "3. Leaderboards and public activity",
          body: "If you submit a score, your display name or player name may appear on public leaderboards. Players should avoid using sensitive personal information as a display name.",
        },
        {
          title: "4. Chat and community features",
          body: "Game chat and community features may display messages to other players. Players should not share private information in chat, including addresses, phone numbers, passwords, personal contact details or sensitive information. Messages may be hidden, reported or moderated if they break the Community Guidelines.",
        },
        {
          title: "5. Cookies and analytics",
          body: "WebGameArena may use cookies or similar technologies to keep players logged in, remember preferences, measure site usage, support security and improve the player experience. More details are available in the Cookie Policy.",
        },
        {
          title: "6. Google advertising cookies",
          body: [
            "Third-party vendors, including Google, may use cookies to serve ads based on a user's prior visits to WebGameArena.com or other websites.",
            "Google's use of advertising cookies enables Google and its partners to serve ads to users based on visits to WebGameArena.com and/or other sites on the Internet.",
            "Users may opt out of personalized advertising by visiting Google Ads Settings.",
            "Users may also be able to opt out of some third-party vendors' use of cookies for personalized advertising by visiting industry opt-out pages such as aboutads.info, where available.",
          ],
        },
        {
          title: "7. Third-party advertising and services",
          body: [
            "If WebGameArena displays advertising, advertising partners may use cookies, web beacons or similar technologies to deliver, measure and improve ads.",
            "Third-party vendors and ad networks may serve ads on WebGameArena and may use their own cookies or similar technologies according to their own privacy policies.",
            "WebGameArena aims to keep advertising clearly separated from gameplay, navigation buttons, chat controls and other interactive areas to reduce accidental clicks.",
          ],
        },
        {
          title: "8. Children and younger players",
          body: "WebGameArena is designed to be player-friendly and broadly accessible. Younger players should use the platform with guidance from a parent or guardian, especially when creating accounts, using chat or sharing public scores.",
        },
        {
          title: "9. Data protection and security",
          body: "Reasonable steps are taken to protect player information, including limiting access, using secure authentication practices and improving platform security over time. No online service can guarantee complete security.",
        },
        {
          title: "10. Player choices",
          body: [
            "Players may choose not to create an account and still browse available games where supported.",
            "Players can avoid using chat if they do not want to share messages publicly.",
            "Players can manage cookies through their browser settings. Blocking some cookies may affect login, leaderboard or preference features.",
            "Players can opt out of personalized advertising through Google Ads Settings where Google advertising is used.",
            "Players can request help with account or privacy questions by contacting privacy@webgamearena.com.",
          ],
        },
        {
          title: "11. Data retention",
          body: "WebGameArena may retain account, score, leaderboard, chat moderation and technical information for as long as needed to operate the platform, resolve issues, protect users, prevent abuse and comply with applicable requirements.",
        },
        {
          title: "12. Changes to this policy",
          body: "This Privacy Policy may be updated as WebGameArena adds new features, games, accounts, analytics, advertising or community tools. The updated date will show when changes were last made.",
        },
        {
          title: "13. Contact",
          body: [
            "For privacy questions, contact privacy@webgamearena.com.",
            "For player support, contact support@webgamearena.com.",
            "For game issues or submissions, contact games@webgamearena.com.",
          ],
        },
      ]}
    />
  );
}
