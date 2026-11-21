import Link from "next/link";
import { ANALYTICS_ENABLED } from "@/lib/publicAnalytics";

const year = new Date().getFullYear();

const footerGroups = [
  {
    title: "Play",
    links: [
      { label: "All Games", href: "/games" },
      { label: "Arcade Games", href: "/categories/arcade" },
      { label: "Adventure Games", href: "/categories/adventure" },
      { label: "Educational Games", href: "/categories/educational" },
      { label: "Kasi Quest", href: "/play/kasi-quest" },
    ],
  },
  {
    title: "Playing here",
    links: [
      { label: "Game guides", href: "/games" },
      { label: "Parents & Safety", href: "/parents-safety" },
      { label: "Help & Contact", href: "/contact" },
      { label: "Word & Trivia", href: "/games?category=word-trivia" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About WebGameArena", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Submit a Game", href: "/submit-game" },
      { label: "Advertise", href: "/advertise" },
    ],
  },
  {
    title: "Legal & Safety",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Community Guidelines", href: "/community-guidelines" },
      { label: "Parents & Safety", href: "/parents-safety" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="container">
        <div className="footerTop">
          <div className="footerBrand">
            <Link href="/" className="footerLogo">
              WebGameArena
            </Link>

            <p>
              Free browser games with guides for controls, objectives and
              local progress. Play as a guest on desktop or mobile.
            </p>

            <div className="footerBadges">
              <span className="badge">No downloads</span>
              <span className="badge">Mobile-first</span>
              <span className="badge">Free to play</span>
            </div>
          </div>

          <div className="footerLinksGrid">
            {footerGroups.map((group) => (
              <div key={group.title} className="footerGroup">
                <h3>{group.title}</h3>

                <ul>
                    {group.links.map((link, index) => (
  <li key={`${group.title}-${link.label}-${link.href}-${index}`}>
    <Link href={link.href}>{link.label}</Link>
  </li>
))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mutedTiny">Advertising is paused. {ANALYTICS_ENABLED ? "Optional analytics is available to adults who explicitly allow it in Analytics settings below." : "Optional analytics setup is not yet active."} Games may save progress and preferences on this device; existing sign-in uses an essential session cookie. <Link href="/cookies">Cookie information</Link></p>
        <div className="footerBottom">
          <div>
            © {year} WebGameArena.com All rights reserved.
            <span className="footerCredit"> Built by Glory Mulopo.</span>
          </div>

          <div className="footerBottomLinks">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
