// apps/web/src/app/submit-game/page.tsx

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Submit a Game | WebGameArena",
  description:
    "Submit a mobile-friendly HTML5 browser game for future consideration on WebGameArena.",
  alternates: {
    canonical: "/submit-game",
  },
  openGraph: {
    title: "Submit a Game | WebGameArena",
    description:
      "Developers and creators can prepare mobile-friendly HTML5 games for future submission to WebGameArena.",
    url: "https://WebGameArena.com/submit-game",
    siteName: "WebGameArena",
    type: "website",
    locale: "en_ZA",
  },
};

export default function SubmitGamePage() {
  return (
    <InfoPage
      eyebrow="Submit a Game"
      title="Build for players. Submit for the browser."
      description="WebGameArena is preparing a game submission pathway for creators who build mobile-friendly browser games that are fun, safe and easy to play."
      cta={{
        label: "Browse Current Games",
        href: "/games",
      }}
      sections={[
        {
          title: "What kind of games fit WebGameArena?",
          body: [
            "Mobile-first HTML5 games that work smoothly on phones, tablets and desktop browsers.",
            "Games with clear controls, quick loading times and simple player onboarding.",
            "Arcade, puzzle, adventure, educational, racing, casual, strategy and family-friendly games.",
          ],
        },
        {
          title: "Technical requirements",
          body: [
            "The game should run from a standard index.html file.",
            "Assets should be organised clearly inside the game folder.",
            "The game should support responsive canvas or layout scaling.",
            "The game should avoid unnecessary external dependencies that can break loading.",
            "The game should be tested on Chrome, Edge and mobile browsers where possible.",
          ],
        },
        {
          title: "Player safety requirements",
          body: [
            "Games should be appropriate for a broad player audience.",
            "Avoid harmful, hateful, sexually explicit or exploitative content.",
            "Avoid deceptive mechanics, misleading rewards or unsafe downloads.",
            "If a game includes chat or user-generated content, moderation and safety should be considered.",
          ],
        },
        {
          title: "Recommended game folder structure",
          body: [
            "index.html — the main game entry point.",
            "game.js — the main gameplay logic.",
            "styles.css — responsive game styling.",
            "assets/ — images, sounds, sprites and backgrounds.",
            "game.json — optional metadata such as title, description, category and tags.",
          ],
        },
        {
          title: "Suggested metadata",
          body: [
            "Title and short description.",
            "Primary category such as Arcade, Adventure, Puzzle, Educational or Racing.",
            "Tags such as mobile, touch, platformer, reflex, learning or casual.",
            "Recommended age suitability and any important gameplay notes.",
          ],
        },
        {
          title: "Submission process",
          body: "A public submission form will be added as the platform matures. For now, developers should prepare games using the structure above so they are easy to review, test and publish later.",
        },
      ]}
    />
  );
}