// apps/web/src/app/community-guidelines/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Community Guidelines | WebGameArena",
  description:
    "Read the WebGameArena Community Guidelines for fair play, respectful chat, leaderboard behaviour and platform safety.",
  alternates: {
    canonical: "/community-guidelines",
  },
  openGraph: {
    title: "Community Guidelines | WebGameArena",
    description:
      "Learn the rules for respectful play, chat, leaderboards and community behaviour on WebGameArena.",
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
      updated="18 May 2026"
      sections={[
        {
          title: "1. Respect other players",
          body: [
            "Treat other players with respect, even when competing.",
            "Do not harass, threaten, insult, bully or target other players.",
            "Avoid language or behaviour that makes the platform unsafe or unwelcoming.",
          ],
        },
        {
          title: "2. Keep chat safe",
          body: [
            "Do not share private information such as phone numbers, addresses, passwords or personal contact details.",
            "Do not spam chat or repeatedly post disruptive messages.",
            "Do not post harmful links, scams, misleading offers or suspicious downloads.",
            "Do not use chat to pressure, manipulate or intimidate other players.",
          ],
        },
        {
          title: "3. No hate or discrimination",
          body: "Content or behaviour that attacks, degrades or excludes people based on identity, background, nationality, disability, gender, religion or similar characteristics is not allowed.",
        },
        {
          title: "4. Fair play matters",
          body: [
            "Do not cheat, exploit bugs, manipulate scores or use bots.",
            "Do not try to bypass game rules or leaderboard systems.",
            "Do not submit fake, impossible or automated scores.",
            "If you discover a bug, report it instead of abusing it.",
          ],
        },
        {
          title: "5. Display names and profiles",
          body: [
            "Choose display names that are appropriate for a broad audience.",
            "Do not impersonate another player, brand, organisation or public figure.",
            "Do not use names that include offensive, harmful or misleading content.",
          ],
        },
        {
          title: "6. Appropriate content",
          body: [
            "Keep messages, usernames and submitted content suitable for a general gaming audience.",
            "Do not share sexually explicit, violent, hateful, exploitative or illegal content.",
            "Do not encourage unsafe behaviour or harmful challenges.",
          ],
        },
        {
          title: "7. Game submissions",
          body: [
            "Submitted games should be safe, playable and mobile-friendly.",
            "Game content should not mislead players or contain hidden harmful behaviour.",
            "Creators should respect copyright, trademarks and the rights of others.",
            "WebGameArena may reject or remove games that do not meet platform standards.",
          ],
        },
        {
          title: "8. Moderation",
          body: [
            "WebGameArena may remove content, scores, messages or accounts that break these guidelines.",
            "Leaderboards may be reviewed or reset if unfair activity is detected.",
            "Repeated or serious violations may lead to restrictions or removal from platform features.",
          ],
        },
        {
          title: "9. Reporting problems",
          body: "If you notice cheating, broken games, unsafe chat, offensive display names or suspicious activity, use the Contact page to report the issue with as much detail as possible.",
        },
        {
          title: "10. Our goal",
          body: "WebGameArena should feel fun, safe and welcoming. These guidelines help protect players, creators and the platform as the game library and community features grow.",
        },
      ]}
    />
  );
}