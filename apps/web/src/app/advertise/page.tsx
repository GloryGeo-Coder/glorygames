// apps/web/src/app/advertise/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Advertise on WebGameArena | Safe Gaming Sponsorships",
  description:
    "Advertise on WebGameArena through player-friendly sponsorships and brand-safe placements that do not interfere with gameplay, controls, chat or navigation.",
  alternates: {
    canonical: "/advertise",
  },
  openGraph: {
    title: "Advertise on WebGameArena",
    description:
      "Explore future advertising and sponsorship opportunities on WebGameArena, a mobile-first browser gaming platform with player-first ad placement rules.",
    url: "https://webgamearena.com/advertise",
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
};

export default function AdvertisePage() {
  return (
    <InfoPage
      eyebrow="Advertise"
      title="Reach players through respectful, player-friendly placements."
      description="WebGameArena is being built as a browser gaming platform where brands can connect with players without interrupting gameplay or weakening trust. Advertising and sponsorships should be clear, safe and separated from game controls."
      updated="15 June 2026"
      cta={{
        label: "Explore Games",
        href: "/games",
      }}
      sections={[
        {
          title: "Advertising vision",
          body: "WebGameArena aims to support advertising that fits naturally within a safe and enjoyable gaming environment. The goal is to create opportunities for sponsors and brands while keeping gameplay, navigation, chat and score submission clear and easy to use.",
        },
        {
          title: "Potential ad opportunities",
          body: [
            "Homepage sponsorship placements for selected campaigns.",
            "Featured game sponsorships for popular or seasonal titles.",
            "Category sponsorships such as Arcade, Adventure, Educational or Racing.",
            "Daily Challenge sponsorships connected to high-score competitions.",
            "Brand-safe display placements on non-gameplay pages.",
            "Sponsored editorial-style placements that are clearly labelled and separated from normal navigation.",
          ],
        },
        {
          title: "Player-first ad placement rules",
          body: [
            "Ads should not be placed inside game canvases, game iframes or active gameplay areas.",
            "Ads should not be placed directly beside play buttons, fullscreen buttons, score buttons, leaderboard buttons, chat send buttons, movement controls or other interactive controls.",
            "Ads should not be placed in a way that could be confused with game menus, download buttons, navigation links, rewards, score prompts or gameplay instructions.",
            "Ads should have clear spacing from game windows and interactive elements.",
            "Ads should only be labelled with clear wording such as Advertisement or Sponsored Links.",
            "Ads should not use arrows, animations or wording that encourages users to click.",
          ],
        },
        {
          title: "Game-page advertising approach",
          body: [
            "Gameplay pages should prioritise the player experience first.",
            "Where ads are introduced in future, they should appear outside the game area and away from controls.",
            "Ads should not block the player from starting a game, continuing a game, sending a score, using mobile controls or accessing instructions.",
            "Ads should not appear beside chat until chat moderation and reporting controls are strong enough to manage user-generated content safely.",
          ],
        },
        {
          title: "Brand safety",
          body: [
            "WebGameArena is intended to remain family-friendly and suitable for casual gaming audiences.",
            "Advertising should not promote harmful, misleading, unsafe or inappropriate content.",
            "Advertising should not encourage risky behaviour, cheating, harassment, spam or misuse of the platform.",
            "WebGameArena may decline campaigns that do not fit the platform’s safety, content or quality standards.",
          ],
        },
        {
          title: "Sponsored content transparency",
          body: [
            "Sponsored placements should be clearly labelled so visitors can distinguish advertising from normal platform content.",
            "Sponsored games, featured placements or campaign pages should not be presented as independent editorial recommendations if they are paid placements.",
            "Users should not be offered rewards or compensation for clicking ads.",
          ],
        },
        {
          title: "Audience and platform fit",
          body: "WebGameArena is focused on mobile-first browser games, instant play, light competition, leaderboards and daily challenges. Suitable partners may include brands interested in family-friendly entertainment, education, casual gaming, technology, youth-safe campaigns or digital engagement.",
        },
        {
          title: "Advertising enquiries",
          body: [
            "For advertising and sponsorship enquiries, email ads@webgamearena.com.",
            "For general support, email support@webgamearena.com.",
            "For privacy or cookie-related questions, email privacy@webgamearena.com.",
          ],
        },
      ]}
    />
  );
}
