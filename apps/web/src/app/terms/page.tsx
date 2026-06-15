// apps/web/src/app/terms/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Use | WebGameArena",
  description:
    "Read the WebGameArena Terms of Use for rules about playing games, accounts, leaderboards, chat, advertising, moderation, content and platform use.",
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
      description="These Terms of Use explain how players may use WebGameArena, including games, accounts, leaderboards, chat features, advertising, moderation and platform content."
      updated="15 June 2026"
      sections={[
        {
          title: "1. Acceptance of these terms",
          body: "By using WebGameArena, browsing the website, creating an account, playing games, using chat or submitting scores, you agree to these Terms of Use. If you do not agree, you should stop using the platform.",
        },
        {
          title: "2. About WebGameArena",
          body: "WebGameArena is a browser gaming platform that provides free, mobile-first games for instant play. The platform may include game categories, game detail pages, leaderboards, daily challenges, chat features, player accounts and future advertising or sponsorship features.",
        },
        {
          title: "3. Player accounts",
          body: [
            "Players may be able to create accounts to save scores, use leaderboards or access platform features.",
            "You are responsible for keeping your login details safe.",
            "You should not use another person’s account without permission.",
            "You should not share passwords or account credentials in chat, email or public messages.",
            "WebGameArena may restrict, suspend or remove accounts that are used for spam, abuse, cheating, impersonation or other misuse.",
          ],
        },
        {
          title: "4. Display names and public scores",
          body: [
            "Display names may appear publicly on leaderboards or gameplay features.",
            "Do not use display names that include private information, abusive wording, hate speech, impersonation, spam, misleading links or offensive content.",
            "Scores may be shown publicly with a display name, game name and ranking.",
            "WebGameArena may remove suspicious, inappropriate, automated, fake or manipulated scores.",
          ],
        },
        {
          title: "5. Chat and community features",
          body: [
            "Chat features are provided for short, friendly game-related messages.",
            "Players must follow the Community Guidelines when using chat or other interactive features.",
            "Do not share private information, harmful links, spam, scams, abusive content or unsafe content in chat.",
            "WebGameArena may filter, hide, report, moderate or remove chat messages.",
            "Ads should not be placed directly beside private communication or chat-focused areas where chat is the main focus.",
          ],
        },
        {
          title: "6. Fair play",
          body: [
            "Do not cheat, exploit bugs, manipulate scores, use bots or overload platform systems.",
            "Do not interfere with games, leaderboards, APIs, authentication, chat systems or platform security.",
            "Do not attempt to access restricted admin tools, private data or another player’s account.",
            "WebGameArena may reset scores or restrict features if unfair activity is detected.",
          ],
        },
        {
          title: "7. Acceptable use",
          body: [
            "Use WebGameArena only for lawful, safe and respectful purposes.",
            "Do not upload, submit or share content that is harmful, hateful, explicit, illegal, misleading, spammy, exploitative or unsafe.",
            "Do not use the platform to distribute malware, phishing links, suspicious downloads or deceptive offers.",
            "Do not encourage users to click ads or interact with ads in misleading ways.",
          ],
        },
        {
          title: "8. Games and availability",
          body: [
            "WebGameArena aims to keep games playable and accessible, but games may change, be removed, be unavailable or contain bugs.",
            "Some games may perform differently depending on browser, device, connection speed or screen size.",
            "Game instructions, controls, scoring systems and features may be updated over time.",
          ],
        },
        {
          title: "9. Advertising and sponsored content",
          body: [
            "WebGameArena may display advertising, sponsorships or promoted content.",
            "Ads and sponsored content should be clearly labelled and separated from gameplay, controls, navigation and chat actions.",
            "Players should not be encouraged, rewarded or pressured to click advertisements.",
            "Advertising cookies and personalised advertising choices are explained in the Privacy Policy and Cookie Policy.",
          ],
        },
        {
          title: "10. Intellectual property",
          body: [
            "WebGameArena pages, branding, layout, code, game descriptions and platform content may be protected by copyright, trademark or other rights.",
            "Game creators should submit only content they own or have permission to use.",
            "Do not copy, resell, redistribute or misuse WebGameArena content without permission, except where allowed by law.",
          ],
        },
        {
          title: "11. Game submissions",
          body: [
            "Submitted games may be reviewed for quality, safety, originality, mobile performance, controls and suitability.",
            "WebGameArena may decline, edit, hide or remove submitted games that appear broken, unfinished, unsafe, misleading, inappropriate or not suitable for the platform.",
            "Creators are responsible for ensuring they have rights to all submitted assets, code, audio, images and text.",
          ],
        },
        {
          title: "12. Moderation and enforcement",
          body: [
            "WebGameArena may moderate chat, scores, display names, accounts, submitted content and other platform activity.",
            "Enforcement may include warnings, hidden content, removed scores, feature restrictions or account restrictions.",
            "Moderation tools may include automatic filters, report buttons, manual review or other safety controls.",
          ],
        },
        {
          title: "13. Privacy and cookies",
          body: "Use of WebGameArena is also governed by the Privacy Policy and Cookie Policy. These explain how account information, scores, cookies, analytics, advertising cookies and privacy choices may work.",
        },
        {
          title: "14. No guarantee of uninterrupted service",
          body: "WebGameArena may experience downtime, bugs, game errors, score delays, maintenance, data interruptions or service changes. The platform is provided as available.",
        },
        {
          title: "15. Changes to these terms",
          body: "These Terms may be updated as WebGameArena adds new games, accounts, leaderboards, advertising, community features or safety tools. The updated date will show when changes were last made.",
        },
        {
          title: "16. Contact",
          body: [
            "For support, email support@webgamearena.com.",
            "For privacy questions, email privacy@webgamearena.com.",
            "For game submissions or content concerns, email games@webgamearena.com.",
            "For advertising enquiries, email ads@webgamearena.com.",
          ],
        },
      ]}
    />
  );
}
