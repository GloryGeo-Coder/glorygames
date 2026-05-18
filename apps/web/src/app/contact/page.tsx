// apps/web/src/app/contact/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Contact GloryGames | Support, Feedback & Partnerships",
  description:
    "Contact GloryGames for player support, feedback, game submissions, advertising and partnership opportunities.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact GloryGames",
    description:
      "Get in touch with GloryGames for support, feedback, partnerships and game submissions.",
    url: "https://glorygames.co.za/contact",
    siteName: "GloryGames",
    type: "website",
    locale: "en_ZA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact GloryGames",
    description:
      "Contact GloryGames for player support, feedback and partnerships.",
  },
};

export default function ContactPage() {
  return (
    <>
      <InfoPage
        eyebrow="Contact"
        title="Need help, have feedback, or want to work with GloryGames?"
        description="We are building GloryGames into a player-friendly browser gaming platform. Reach out for support, suggestions, partnerships, game submissions or advertising enquiries."
        cta={{
          label: "Browse Games",
          href: "/games",
        }}
        sections={[
          {
            title: "Player support",
            body: "If a game is not loading, a score is not saving, or something does not work as expected, please include the game name, your browser, your device type and a short description of the problem.",
          },
          {
            title: "Feedback and suggestions",
            body: "Player feedback helps improve the platform. You can suggest new game categories, report confusing controls, recommend features or share ideas for new games.",
          },
          {
            title: "Game submissions",
            body: "Developers and creators will soon be able to submit mobile-friendly HTML5 browser games for review. Submitted games should work on desktop and mobile, include clear controls, and avoid harmful or inappropriate content.",
          },
          {
            title: "Advertising and partnerships",
            body: "GloryGames is open to future brand partnerships, sponsorships and advertising opportunities that fit a safe, player-focused gaming experience.",
          },
        ]}
      />

      <section className="section">
        <div className="container">
          <div className="heroCard" style={{ padding: 20 }}>
            <div className="badge" style={{ width: "fit-content" }}>
              Contact Options
            </div>

            <h2 style={{ marginTop: 12 }}>Quick links</h2>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 14,
              }}
            >
              <Link className="pill" href="/submit-game">
                Submit a Game
              </Link>

              <Link className="pill" href="/advertise">
                Advertise
              </Link>

              <Link className="pill" href="/community-guidelines">
                Community Guidelines
              </Link>

              <Link className="pill" href="/parents-safety">
                Parents & Safety
              </Link>
            </div>

            <p
              style={{
                color: "rgba(255,255,255,.68)",
                marginTop: 16,
                lineHeight: 1.6,
              }}
            >
            </p>
          </div>
        </div>
      </section>
    </>
  );
}