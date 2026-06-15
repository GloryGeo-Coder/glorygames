// apps/web/src/app/community-guidelines/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Community Guidelines | WebGameArena",
  description:
    "Read the WebGameArena Community Guidelines for respectful chat, fair play, safe display names, leaderboard behaviour, reporting and moderation.",
  alternates: {
    canonical: "/community-guidelines",
  },
  openGraph: {
    title: "Community Guidelines | WebGameArena",
    description:
      "Learn the rules for respectful play, chat, leaderboards, reporting and community behaviour on WebGameArena.",
    url: "https://webgamearena.com/community-guidelines",
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
};

export default function CommunityGuidelinesPage() {
  return (
    <InfoPage
      eyebrow="Community Guidelines"
      title="Play fair. Be respectful. Keep WebGameArena fun."
      description="These guidelines explain the behaviour expected from players when using WebGameArena, including chat, leaderboards, display names, game submissions and future community features."
      updated="15 June 2026"
      sections={[
        {
          title: "1. Respect other players",
          body: [
            "Treat other players with respect, even when competing.",
            "Do not harass, threaten, insult, bully or target other players.",
            "Do not use hateful, discriminatory, degrading or abusive language.",
            "Avoid language or behaviour that makes the platform unsafe or unwelcoming.",
          ],
        },
        {
          title: "2. Keep chat safe",
          body: [
            "Do not share private information such as phone numbers, addresses, passwords, school names, personal contact details or account credentials.",
            "Do not spam chat or repeatedly post disruptive messages.",
            "Do not post harmful links, scams, misleading offers, suspicious downloads or requests for private contact.",
            "Do not use chat to pressure, manipulate, intimidate or target other players.",
            "Keep messages short, friendly and relevant to the game.",
          ],
        },
        {
          title: "3. User-generated content and moderation",
          body: [
            "Chat messages, display names, score names, game comments or future community submissions may be moderated.",
            "WebGameArena may hide, remove or restrict content that appears unsafe, harmful, spammy, offensive or unrelated to the platform.",
            "Reported content may be reviewed and may lead to warnings, temporary restrictions or account action.",
            "Ads should not be placed directly beside chat areas or user-generated content until moderation controls are strong enough to reduce policy and safety risks.",
          ],
        },
        {
          title: "4. Reporting chat messages",
          body: [
            "Players should use the report option when a chat message breaks these rules.",
            "Reported messages may be hidden from the player’s view immediately and may be reviewed later.",
            "Reports should be used honestly and not to target players unfairly.",
            "For serious or repeated problems, contact support@webgamearena.com with the game name, approximate time and details of the issue.",
          ],
        },
        {
          title: "5. Fair play and leaderboards",
          body: [
            "Do not cheat, exploit bugs, manipulate scores or use automated tools to gain an unfair advantage.",
            "Do not submit fake scores or attempt to overload leaderboard systems.",
            "Suspicious scores may be removed or excluded from leaderboards.",
            "Players should compete fairly and focus on improving their own gameplay.",
          ],
        },
        {
          title: "6. Display names and profiles",
          body: [
            "Display names should be appropriate for a broad gaming audience.",
            "Do not use display names that include private information, abusive wording, impersonation, hate speech, threats, spam, misleading links or offensive content.",
            "WebGameArena may rename, hide or restrict display names that break these guidelines.",
          ],
        },
        {
          title: "7. Content that is not allowed",
          body: [
            "Harassment, hate speech, threats, bullying or targeted abuse.",
            "Sexual, explicit, graphic, illegal, exploitative or unsafe content.",
            "Instructions, links or encouragement for harmful activity.",
            "Spam, scams, phishing, malware links or suspicious downloads.",
            "Impersonation of WebGameArena, staff, moderators, creators or other players.",
            "Content that encourages ad clicking, misleading clicks or platform misuse.",
          ],
        },
        {
          title: "8. Game submissions and creator content",
          body: [
            "Submitted games should be mobile-friendly, playable, safe and suitable for a broad audience.",
            "Games should include clear controls, instructions and original or properly licensed assets.",
            "Games that appear unfinished, misleading, broken, unsafe or inappropriate may be rejected or removed.",
          ],
        },
        {
          title: "9. Enforcement",
          body: [
            "WebGameArena may remove content, hide messages, reset scores, limit features or restrict accounts when guidelines are broken.",
            "Some enforcement may happen automatically through filters, while other cases may require manual review.",
            "Repeated or serious violations may lead to longer restrictions.",
          ],
        },
        {
          title: "10. Contact",
          body: [
            "For player support or safety concerns, email support@webgamearena.com.",
            "For privacy concerns, email privacy@webgamearena.com.",
            "For game submissions, email games@webgamearena.com.",
          ],
        },
      ]}
    />
  );
}
