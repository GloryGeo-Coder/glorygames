import Link from "next/link";

const year = new Date().getFullYear();

const footerGroups = [
  {
    title: "Play",
    links: [
      { label: "All Games", href: "/games" },
      { label: "Arcade Games", href: "/games?category=arcade" },
      { label: "Adventure Games", href: "/games?category=adventure" },
      { label: "Educational Games", href: "/games?category=educational" },
      { label: "Kasi Quest", href: "/games/kasi-quest" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Daily Challenge", href: "/games" },
      { label: "Popular Games", href: "/games" },
      { label: "Mobile Browser Games", href: "/games" },
      { label: "Kids & Family", href: "/games?category=kids-family" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About GloryGames", href: "/about" },
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
              GloryGames
            </Link>

            <p>
              Free mobile-first browser games built for instant play, high
              scores, daily challenges and friendly competition.
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

        <div className="footerBottom">
          <div>
            © {year} GloryGames.co.za. All rights reserved.
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