// apps/web/src/app/privacy/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Privacy Policy | GloryGames",
  description:
    "Read the GloryGames Privacy Policy to understand what information may be collected, how it is used, and how player privacy is protected.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | GloryGames",
    description:
      "Learn how GloryGames handles player information, gameplay data, cookies, analytics and safety.",
    url: "https://glorygames.co.za/privacy",
    siteName: "GloryGames",
    type: "website",
    locale: "en_ZA",
  },
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy Policy"
      title="Your privacy matters when you play."
      description="This Privacy Policy explains how GloryGames may collect, use and protect information when players visit the website, create an account, play games, use chat features or interact with leaderboards."
      updated="18 May 2026"
      sections={[
        {
          title: "1. Information we may collect",
          body: [
            "Account information such as display name, email address and login details if players create an account.",
            "Gameplay information such as scores, leaderboard entries, game progress, daily challenge activity and selected game categories.",
            "Technical information such as browser type, device type, pages visited, approximate usage time and basic performance information.",
            "Chat or community content if a player uses game chat or other interactive features.",
            "Cookies or similar technologies used for login sessions, preferences, analytics, security and site improvement.",
          ],
        },
        {
          title: "2. How we use information",
          body: [
            "To operate the website and make games playable in the browser.",
            "To save scores, display leaderboards and support daily challenges.",
            "To improve game performance, fix errors and understand which games players enjoy.",
            "To keep accounts secure and prevent misuse, spam or harmful behaviour.",
            "To communicate important platform updates where needed.",
          ],
        },
        {
          title: "3. Leaderboards and public activity",
          body: "If you submit a score, your display name or player name may appear on public leaderboards. Players should avoid using sensitive personal information as a display name.",
        },
        {
          title: "4. Chat and community features",
          body: "Game chat and community features may display messages to other players. Players should not share private information in chat, including addresses, phone numbers, passwords or personal contact details.",
        },
        {
          title: "5. Cookies and analytics",
          body: "GloryGames may use cookies or similar technologies to keep players logged in, remember preferences, measure site usage and improve the player experience. More details are available in the Cookie Policy.",
        },
        {
          title: "6. Children and younger players",
          body: "GloryGames is designed to be player-friendly and broadly accessible. Younger players should use the platform with guidance from a parent or guardian, especially when creating accounts, using chat or sharing public scores.",
        },
        {
          title: "7. Advertising and third-party services",
          body: "If advertising, analytics or third-party tools are added, those services may process limited technical information according to their own policies. GloryGames aims to use player-friendly services that do not interfere with gameplay.",
        },
        {
          title: "8. Data protection and security",
          body: "Reasonable steps are taken to protect player information, including limiting access, using secure authentication practices and improving platform security over time. No online service can guarantee complete security.",
        },
        {
          title: "9. Player choices",
          body: [
            "Players may choose not to create an account and still browse available games where supported.",
            "Players can avoid using chat if they do not want to share messages publicly.",
            "Players can request help with account or privacy questions through the Contact page.",
          ],
        },
        {
          title: "10. Changes to this policy",
          body: "This Privacy Policy may be updated as GloryGames adds new features, games, accounts, analytics, advertising or community tools. The updated date will show when changes were last made.",
        },
        {
          title: "11. Contact",
          body: "For privacy questions, player support or data-related enquiries, please use the Contact page.",
        },
      ]}
    />
  );
}