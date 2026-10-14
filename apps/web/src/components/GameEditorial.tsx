import Link from "next/link";
import { getGameEditorial } from "@/content/gameEditorials";

type Props = {
  slug: string;
  title: string;
};

const listStyle = {
  color: "rgba(255,255,255,.78)",
  lineHeight: 1.85,
  paddingLeft: 22,
} as const;

const paragraphStyle = {
  color: "rgba(255,255,255,.8)",
  lineHeight: 1.8,
  marginTop: 10,
} as const;

/**
 * Server-rendered, independently authored game guides.
 * Shared by playable pages and game detail pages so all 22 games have
 * meaningful crawlable text without duplicating editorial logic.
 */
export default function GameEditorial({ slug, title }: Props) {
  const guide = getGameEditorial(slug);
  if (!guide) {
    return null;
  }

  const storyHeading =
    guide.story.some((paragraph) =>
      /no (long |named |formal |documented |scripted )*story|no named hero|rather than.*story|not a .*story campaign|no .*scripted campaign/i.test(
        paragraph
      )
    )
      ? "Premise and setting"
      : "Storyline and setting";

  return (
    <section
      className="section gameEditorialSection"
      aria-labelledby={`guide-${slug}`}
    >
      <div className="sectionTitle">
        <div>
          <span className="badge">Complete game guide</span>
          <h2 id={`guide-${slug}`}>Discover {title}</h2>
          <p>
            A practical guide to the game's premise, controls, objectives,
            progression and useful strategies.
          </p>
        </div>
        <Link className="pill" href={`/play/${slug}`}>
          Play {title} →
        </Link>
      </div>

      <article className="heroCard gameDetailPanel" style={{ marginTop: 16 }}>
        <h2>About {title}</h2>
        {guide.overview.map((paragraph, index) => (
          <p key={index} style={paragraphStyle}>
            {paragraph}
          </p>
        ))}
      </article>

      <article className="heroCard gameDetailPanel" style={{ marginTop: 16 }}>
        <h2>{storyHeading}</h2>
        {guide.story.map((paragraph, index) => (
          <p key={index} style={paragraphStyle}>
            {paragraph}
          </p>
        ))}
      </article>

      <div className="gameDetailInfoGrid" style={{ marginTop: 16 }}>
        <article className="heroCard gameDetailPanel">
          <h2>How to play {title}</h2>
          <ol style={listStyle}>
            {guide.howToPlay.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </article>
        <article className="heroCard gameDetailPanel">
          <h2>Desktop and mobile controls</h2>
          <h3>Desktop</h3>
          <ul style={listStyle}>
            {guide.desktop.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
          <h3>Mobile</h3>
          <ul style={listStyle}>
            {guide.mobile.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
          <p style={paragraphStyle}>
            Always follow the controls displayed in the running game if the
            version or device uses a different input layout.
          </p>
        </article>
      </div>

      <div className="gameDetailInfoGrid" style={{ marginTop: 16 }}>
        <article className="heroCard gameDetailPanel">
          <h2>Features and gameplay mechanics</h2>
          {guide.systems.map((system, index) => (
            <div key={index} style={{ marginTop: 14 }}>
              <h3>{system.title}</h3>
              <p style={paragraphStyle}>{system.body}</p>
            </div>
          ))}
        </article>
        <article className="heroCard gameDetailPanel">
          <h2>Objectives, progress and scoring</h2>
          {guide.progression.map((paragraph, index) => (
            <p key={index} style={paragraphStyle}>
              {paragraph}
            </p>
          ))}
        </article>
      </div>

      <article className="heroCard gameDetailPanel" style={{ marginTop: 16 }}>
        <h2>Tips and strategies for {title}</h2>
        <ul style={listStyle}>
          {guide.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </article>

      {guide.learning?.length ? (
        <article className="heroCard gameDetailPanel" style={{ marginTop: 16 }}>
          <h2>What you can learn</h2>
          {guide.learning.map((paragraph, index) => (
            <p key={index} style={paragraphStyle}>
              {paragraph}
            </p>
          ))}
        </article>
      ) : null}

      <article className="heroCard gameDetailPanel" style={{ marginTop: 16 }}>
        <h2>Frequently asked questions about {title}</h2>
        {guide.faqs.map(({ q, a }, index) => (
          <div key={index} style={{ marginTop: 16 }}>
            <h3>{q}</h3>
            <p style={paragraphStyle}>{a}</p>
          </div>
        ))}
      </article>
    </section>
  );
}
