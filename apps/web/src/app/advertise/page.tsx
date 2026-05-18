// apps/web/src/app/advertise/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Advertise on GloryGames | Gaming Audience & Sponsorships",
  description:
    "Advertise on GloryGames through future sponsorships, featured game placements and player-friendly brand opportunities.",
  alternates: {
    canonical: "/advertise",
  },
  openGraph: {
    title: "Advertise on GloryGames",
    description:
      "Explore future advertising and sponsorship opportunities on GloryGames, a mobile-first browser gaming platform.",
    url: "https://glorygames.co.za/advertise",
    siteName: "GloryGames",
    type: "website",
    locale: "en_ZA",
  },
};

export default function AdvertisePage() {
  return (
    <InfoPage
      eyebrow="Advertise"
      title="Reach players through a fun, mobile-first gaming experience."
      description="GloryGames is being built as a browser gaming platform where brands can connect with players through respectful, relevant and player-friendly placements."
      cta={{
        label: "Explore Games",
        href: "/games",
      }}
      sections={[
        {
          title: "Advertising vision",
          body: "GloryGames aims to support advertising that fits naturally within a safe and enjoyable gaming environment. The goal is to create opportunities for sponsors and brands without interrupting gameplay or reducing player trust.",
        },
        {
          title: "Potential ad opportunities",
          body: [
            "Homepage sponsorship placements for selected campaigns.",
            "Featured game sponsorships for popular or seasonal titles.",
            "Category sponsorships such as Arcade, Adventure, Educational or Racing.",
            "Daily Challenge sponsorships connected to high-score competitions.",
            "Brand-safe display placements on non-gameplay pages.",
          ],
        },
        {
          title: "Player-first approach",
          body: [
            "Ads should be clearly separated from gameplay.",
            "Advertising should not mislead players or imitate game controls.",
            "Game performance and loading speed must remain a priority.",
            "Ads should be appropriate for a broad audience, including younger players.",
          ],
        },
        {
          title: "Suitable partners",
          body: [
            "Brands interested in youth-friendly digital entertainment.",
            "Education, learning, technology and mobile-first brands.",
            "Game developers, publishers and creative studios.",
            "Sponsors interested in leaderboard events or daily challenges.",
          ],
        },
        {
          title: "What comes next",
          body: "As GloryGames grows, dedicated media kits, audience statistics and campaign packages can be added. For now, this page establishes the advertising direction and gives future partners a professional landing page.",
        },
      ]}
    />
  );
}