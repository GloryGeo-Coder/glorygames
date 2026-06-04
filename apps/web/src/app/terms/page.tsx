// apps/web/src/app/terms/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Terms of Use | WebGameArena",
  description:
    "Read the WebGameArena Terms of Use for rules about playing games, accounts, leaderboards, chat, content, safety and platform use.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Use | WebGameArena",
    description:
      "Understand the rules and conditions for using WebGameArena and playing free browser games.",
    url: "https://webgamearena.com/terms",
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms of Use"
      title="The rules for playing fairly on WebGameArena."
      description="These Terms of Use explain how players may use WebGameArena, including games, accounts, leaderboards, chat features and platform content."
      updated="18 May 2026"
      sections={[
        {
          title: "1. Acceptance of these terms",
          body: "By using WebGameArena, browsing the website, creating an account, playing games or submitting scores, you agree to these Terms of Use. If you do not agree, you should stop using the platform.",
        },
        {
          title: "2. About WebGameArena",
          body: "WebGameArena is a browser gaming platform that provides free, mobile-first games for instant play. The platform may include game categories, leaderboards, daily challenges, chat features, player accounts and game detail pages.",
        },
        {
          title: "3. Player accounts",
          body: [
            "Players may be able to create accounts to save scores, use leaderboards or access platform features.",
            "You are responsible for keeping your login details safe.",
            "You should not use another person’s account without permission.",
            "Display names must not be offensive, misleading, harmful or impersonate another person or organisation.",
          ],
        },
        {
          title: "4. Fair play and leaderboards",
          body: [
            "Players must not cheat, manipulate scores, exploit bugs or use automated tools to gain unfair leaderboard advantages.",
            "Scores may be removed if they appear fraudulent, abusive, impossible or harmful to platform integrity.",
            "WebGameArena may reset, moderate or adjust leaderboards where needed to protect fair play.",
          ],
        },
        {
          title: "5. Chat and community behaviour",
          body: [
            "Players must treat others respectfully when using chat or community features.",
            "Do not post harassment, hate speech, threats, spam, scams, private personal information or inappropriate content.",
            "Do not encourage unsafe behaviour or share harmful links.",
            "Messages may be moderated, removed or restricted if they break community standards.",
          ],
        },
        {
          title: "6. Younger players",
          body: "WebGameArena is designed to be player-friendly and broadly accessible. Younger players should use the platform with guidance from a parent or guardian, especially when creating accounts, using chat or sharing public scores.",
        },
        {
          title: "7. Game availability",
          body: "Games may be added, updated, paused, removed or replaced over time. WebGameArena does not guarantee that every game, score, leaderboard or feature will always be available without interruption.",
        },
        {
          title: "8. Intellectual property",
          body: "The WebGameArena name, platform design, original text, code, game pages, layouts and platform branding belong to their respective owners. Players may not copy, resell or misuse platform content without permission.",
        },
        {
          title: "9. User-submitted content",
          body: "If players submit messages, game feedback, usernames, scores or future game submissions, they are responsible for ensuring that their content is lawful, respectful and does not infringe the rights of others.",
        },
        {
          title: "10. Game submissions",
          body: "Future game submissions may be reviewed before publishing. WebGameArena may reject, remove or request changes to submitted games if they are unsafe, unsuitable, broken, misleading or inconsistent with platform standards.",
        },
        {
          title: "11. Advertising and sponsorships",
          body: "Advertising, sponsorships or promoted placements may be introduced in future. Such content should be clearly presented and should not intentionally mislead players or interfere unfairly with gameplay.",
        },
        {
          title: "12. Platform misuse",
          body: [
            "Do not attempt to hack, overload, reverse-engineer, disrupt or damage the platform.",
            "Do not use bots, scraping tools or automated abuse against accounts, games, scores or chat systems.",
            "Do not upload or share malware, harmful scripts or deceptive files.",
          ],
        },
        {
          title: "13. Limitation of responsibility",
          body: "WebGameArena is provided on an as-is basis. While reasonable effort is made to keep the platform useful and safe, errors, downtime, data loss, score issues or gameplay bugs may occur.",
        },
        {
          title: "14. Changes to these terms",
          body: "These Terms of Use may be updated as WebGameArena grows and new features are added. The updated date will show when changes were last made.",
        },
        {
          title: "15. Contact",
          body: "For questions about these terms, account issues, game problems or platform feedback, please use the Contact page.",
        },
      ]}
    />
  );
}