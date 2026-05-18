import Link from "next/link";

type InfoSection = {
  title: string;
  body: string | string[];
};

type InfoPageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  updated?: string;
  sections: InfoSection[];
  cta?: {
    label: string;
    href: string;
  };
};

export default function InfoPage({
  eyebrow = "GloryGames",
  title,
  description,
  updated,
  sections,
  cta,
}: InfoPageProps) {
  return (
    <main className="infoPage">
      <div className="container">
        <section className="infoHero">
          <div className="badge infoEyebrow">{eyebrow}</div>

          <h1>{title}</h1>

          <p>{description}</p>

          {updated ? (
            <div className="infoUpdated">Last updated: {updated}</div>
          ) : null}

          {cta ? (
            <div className="infoHeroActions">
              <Link className="cta" href={cta.href}>
                {cta.label}
              </Link>

              <Link className="pill" href="/">
                Back to Home
              </Link>
            </div>
          ) : (
            <div className="infoHeroActions">
              <Link className="pill" href="/">
                Back to Home
              </Link>

              <Link className="pill" href="/games">
                Browse Games
              </Link>
            </div>
          )}
        </section>

        <section className="infoContentWrap">
          <div className="infoContent">
            {sections.map((section) => (
              <article key={section.title} className="infoCard">
                <h2>{section.title}</h2>

                {Array.isArray(section.body) ? (
                  <div className="infoList">
                    {section.body.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                ) : (
                  <p>{section.body}</p>
                )}
              </article>
            ))}
          </div>

          <aside className="infoSidebar">
            <div className="infoSidebarCard">
              <h3>Helpful links</h3>

              <Link href="/games">All Games</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Use</Link>
              <Link href="/community-guidelines">Community Guidelines</Link>
              <Link href="/parents-safety">Parents & Safety</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}