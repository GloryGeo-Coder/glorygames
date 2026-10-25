import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GameThumb } from "@/components/GameThumb";
import { getGameEditorial } from "@/content/gameEditorials";

const SITE_URL = "https://webgamearena.com";

type CuratedGame = { slug: string; title: string; whyPlay: string };
type Hub = {
  title: string;
  heading: string;
  description: string;
  introduction: string[];
  skillsTitle: string;
  skills: string[];
  chooseTitle: string;
  choose: string[];
  faqs: { q: string; a: string }[];
  games: CuratedGame[];
};

const HUBS: Record<string, Hub> = {
  educational: {
    title: "Educational Games",
    heading: "Learn by playing",
    description: "Explore interactive science, maths, geography, recycling and cybersecurity games on WebGameArena, with complete guides for each title.",
    introduction: [
      "Educational browser games can turn an unfamiliar idea into something you can explore, test and discuss. The WebGameArena learning collection covers subjects as varied as map reading, mathematics, physical science, environmental care and digital safety. Each game approaches its topic differently, so the best starting point depends on what you want to practise.",
      "Some experiences use stories and missions to introduce new ideas. Others ask you to make quick decisions, solve puzzles or interpret information. Playing is a starting point for learning: read the mission explanations, compare your choices with the feedback and return to concepts that need more attention."
    ],
    skillsTitle: "Learning themes across the collection",
    skills: [
      "Geography and spatial thinking: locate places, interpret map pins, work with routes and recognise coordinates.",
      "Science and investigation: connect observations with ideas about forces, energy, experiments and evidence.",
      "Mathematics and language: practise problem solving, arithmetic, fractions and accurate responses under time pressure.",
      "Sustainability: recognise materials and explore why correct sorting matters in recycling systems.",
      "Digital safety: investigate a fictional cybersecurity case using a simulated environment and responsible defensive reasoning."
    ],
    chooseTitle: "Find an educational game that fits your interests",
    choose: [
      "For places, countries and map reading, begin with Map Master Africa. Its explorer missions introduce coordinates, routes and location choices.",
      "Explore selected Grades 4–10 topics through Physics Force Lab’s physics investigations and Science Lab Dash’s 35-mission chemistry adventure, with saved evidence and untimed learning.",
      "For a practical environmental challenge, Recycle Rush focuses on sorting and contamination, while Climate Rescue Quest uses an arcade journey through environmental themes.",
      "For a different kind of problem solving, Math Sprint Arena explores mathematics gates and Cyber Shield Academy uses a fictional terminal investigation."
    ],
    faqs: [
      {q: "Do these games replace lessons or textbooks?", a: "No. They are interactive introductions and practice activities. Use them alongside teaching, reading and reliable learning resources."},
      {q: "Which game helps with map-reading skills?", a: "Map Master Africa includes location selection, routes, geographic questions and coordinate challenges."},
      {q: "Can these games run on phones?", a: "The games are made for browsers and many have touch controls. Check each game's own guide for the specific input method and screen requirements."}
    ],
    games: [
      {slug:"map-master-africa",title:"Map Master Africa: Explorer Missions",whyPlay:"Choose pins, trace routes and work through African geography missions."},
      {slug:"physics-force-lab",title:"Physics Force Lab",whyPlay:"Explore force, motion, circuits and other physics concepts through missions."},
      {slug:"science-lab-dash",title:"Science Lab Dash",whyPlay:"Restore an academy through 35 chemistry missions and 105 investigations for Grades 4–10, plus the original 20-mission dash."},
      {slug:"recycle-rush",title:"Recycle Rush",whyPlay:"Practise waste sorting and contamination prevention across community scenarios."},
      {slug:"climate-rescue-quest",title:"Climate Rescue Quest",whyPlay:"Travel through environmental stages inspired by energy, water and nature."},
      {slug:"math-sprint-arena",title:"Math Sprint Arena",whyPlay:"Solve arithmetic, fractions, geometry and algebra challenges in a neon arena."},
      {slug:"cyber-shield-academy",title:"Cyber Shield Academy",whyPlay:"Solve a safe simulated defensive cybersecurity investigation."}
    ]
  },
  adventure: {
    title: "Adventure Games",
    heading: "Explore stories, worlds and challenges",
    description: "Discover township quests, jungle ruins, floating fantasy islands and guardian missions in WebGameArena's browser adventure games.",
    introduction: [
      "Adventure games give every obstacle a place in a larger journey. An unfamiliar route may lead to a new character, a collectible can open another possibility, and a boss encounter can test the skills gathered across earlier stages. WebGameArena's adventure collection ranges from township-inspired platformers to ancient temples and floating fantasy worlds.",
      "Choosing an adventure is partly about what you enjoy exploring. Some games focus on NPC missions and the life of a neighbourhood; others emphasise environmental puzzles, relic collection, combat or demanding jumps. Read the game's controls and objectives before playing, then take your time discovering how each area fits into its story."
    ],
    skillsTitle: "What makes these adventures different?",
    skills: [
      "Exploration: look beyond the shortest route to discover coins, keys, relics and mission opportunities.",
      "Platforming: learn jump distances, hazards and moving-platform rhythms.",
      "Story and characters: follow mission guidance and discover why the next area matters.",
      "Combat: respond to enemies and guardians after observing their patterns.",
      "Progression: revisit earlier areas or improve your preparation for more demanding stages."
    ],
    chooseTitle: "Choose your kind of adventure",
    choose: [
      "Kasi Quest is a township-inspired platform journey with character missions, collectibles, upgrades and boss challenges.",
      "City Quest: Rise of the Guardian adds rooftops, taxi ranks, neighbourhood missions, energy attacks and a wider city journey.",
      "Temple of the Sun rewards explorers who enjoy jungle hazards, keys, Sun Relics, locked gates and guardian encounters.",
      "Sky Temple offers floating fantasy worlds, relics, flight abilities and large guardian battles."
    ],
    faqs: [
      {q:"Where should I start if I like platform games?",a:"Kasi Quest and Temple of the Sun are good starting points if you enjoy movement, jumps and collectibles."},
      {q:"Do these adventures have missions?",a:"Yes. Mission objectives, stage progression or story encounters give each game direction; consult the individual guide for details."},
      {q:"Can I play without downloading anything?",a:"These are browser games. Open the game page and start when the game finishes loading."}
    ],
    games:[
      {slug:"kasi-quest",title:"Kasi Quest",whyPlay:"Meet NPCs, complete township quests, collect coins and prepare for bosses."},
      {slug:"city-quest-rise-of-the-guardian",title:"City Quest: Rise of the Guardian",whyPlay:"Explore rooftops, markets and taxi ranks as a Guardian with missions and powers."},
      {slug:"lost-jungle-3d-temple-of-the-sun",title:"Lost Jungle: Temple of the Sun",whyPlay:"Find Sun Relics, solve temple puzzles and confront jungle guardians."},
      {slug:"sky-temple-3d-rise-of-the-relic-master",title:"Sky Temple: Rise of the Relic Master",whyPlay:"Explore floating islands, unlock abilities and face powerful guardians."}
    ]
  },
  racing: {
    title: "Racing Games",
    heading: "Find your rhythm on the road",
    description: "Play arcade racing, traffic-dodging and futuristic hover runner games. Discover controls, boosts and smart driving strategies.",
    introduction: [
      "The strongest racing runs depend on more than pressing a boost button. You need to anticipate obstacles, understand how the vehicle responds and decide when a risky overtake is worth attempting. WebGameArena's racing collection explores those decisions through conventional cars and a futuristic hover track.",
      "High Spead Racer has a garage, rivals, checkpoint gates and a multi-level campaign. Swipe Racer focuses on traffic navigation across four environments, while Neon Hover Runner blends steering, jumping and energy pickups. Each game has a different rhythm, so learning its controls matters as much as reacting quickly."
    ],
    skillsTitle: "Core racing skills",
    skills: [
      "Look ahead: consider the space beyond the nearest vehicle or barrier before moving.",
      "Steer deliberately: unnecessary lane changes can make the next hazard harder to avoid.",
      "Time boosts: use nitro or energy boosts on clear routes rather than just before obstacles.",
      "Learn from each attempt: watch where a run became difficult and adjust your approach.",
      "Understand the mode: checkpoints, lap completion and endless score runs reward different choices."
    ],
    chooseTitle: "Which racer should you play?",
    choose: [
      "Choose High Spead Racer for a longer campaign with AI rivals, a garage, unlockable cars, checkpoints and laps.",
      "Choose Swipe Racer for gesture-controlled traffic dodging through city, mountain, coastal and neon-night routes.",
      "Choose Neon Hover Runner if you prefer a futuristic challenge with jumping, shields, magnets and energy pickups."
    ],
    faqs:[
      {q:"Which game has cars to unlock?",a:"High Spead Racer includes a garage, unlockable vehicles and upgrade systems."},
      {q:"Which racer uses touch swipes?",a:"Swipe Racer is built around swipe or drag steering; High Spead Racer also provides mobile lane controls."},
      {q:"When should I use nitro?",a:"Aim to boost during a clear section after checking for the next vehicle or hazard. The exact controls are shown in each game's guide."}
    ],
    games:[
      {slug:"high-spead-racer",title:"High Spead Racer",whyPlay:"Race rivals through a campaign using checkpoints, nitro and garage upgrades."},
      {slug:"swipe-racer",title:"Swipe Racer",whyPlay:"Swipe through traffic, collect pickups and race across four road settings."},
      {slug:"neon-hover-runner",title:"Neon Hover Runner",whyPlay:"Steer, jump and boost through a glowing futuristic obstacle track."}
    ]
  },
  arcade:{
    title:"Arcade Games",
    heading:"Small controls, big challenges",
    description:"Play classic score-focused arcade games on WebGameArena, from precision brick breaking to fruit slicing and combinations.",
    introduction:[
      "Arcade games are easy to begin and rewarding to practise. A few familiar actions can support a surprisingly demanding challenge: keep a ball bouncing with a paddle, or draw a quick line through moving fruit while avoiding hazards. The appeal lies in learning how much control you can gain from repeated attempts.",
      "WebGameArena's arcade selection includes Brick Blaster and Fruit Slice. Brick Blaster rewards anticipation and precise rebounds, while Fruit Slice combines swipe accuracy, combos and bomb avoidance. Both invite short sessions with a clear goal and give you room to improve your own best result."
    ],
    skillsTitle:"Ways to improve an arcade run",
    skills:[
      "Learn the basic controls before trying to act at maximum speed.",
      "Pay attention to patterns: ball trajectories and moving fruit both reward anticipation.",
      "Aim for controlled combinations instead of taking every risky opportunity.",
      "Use the score display to track progress, but focus on repeatable accuracy.",
      "Return to a challenge with one improvement in mind rather than repeating a losing move."
    ],
    chooseTitle:"Two different arcade challenges",
    choose:[
      "Brick Blaster is about paddle positioning, bounce angles and clearing a wall of bricks while keeping the ball alive.",
      "Fruit Slice uses swipe gestures to slice moving targets, chain combinations and avoid bombs as the arena becomes busier."
    ],
    faqs:[
      {q:"Which arcade game is better for careful timing?",a:"Brick Blaster emphasises paddle position and rebound planning. Both games reward good timing."},
      {q:"Which game is designed for touch gestures?",a:"Fruit Slice supports swiping directly through fruit; Brick Blaster supports drag movement for its paddle."},
      {q:"Do I need an account to read the game guides?",a:"No. You can explore the guides and open the browser games directly."}
    ],
    games:[
      {slug:"brick-blaster",title:"Brick Blaster",whyPlay:"Bounce a ball through bricks, control the paddle and collect power-ups."},
      {slug:"fruit-slice",title:"Fruit Slice",whyPlay:"Cut flying fruit, build combos and avoid bombs with careful swipes."}
    ]
  }
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(HUBS).map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const hub = HUBS[category];
  if (!hub) return { title: "Category not found | WebGameArena", robots: { index: false } };

  const canonical = `/categories/${category}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: `${hub.title} | WebGameArena`,
    description: hub.description,
    alternates: { canonical },
    openGraph: {
      title: `${hub.title} | WebGameArena`,
      description: hub.description,
      url: `${SITE_URL}${canonical}`,
      siteName: "WebGameArena",
      type: "website",
      locale: "en_ZA",
    },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryHubPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const hub = HUBS[category];
  if (!hub) notFound();

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Games", item: `${SITE_URL}/games` },
      { "@type": "ListItem", position: 3, name: hub.title, item: `${SITE_URL}/categories/${category}` },
    ],
  };
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.title,
    description: hub.description,
    url: `${SITE_URL}/categories/${category}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: hub.games.map((game, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: game.title,
        url: `${SITE_URL}/play/${game.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collection]) }}
      />
      <div className="container">
        <nav aria-label="Breadcrumb" style={{ marginTop: 20, marginBottom: 12 }}>
          <Link href="/">Home</Link>{" / "}
          <Link href="/games">Games</Link>{" / "}
          <span aria-current="page">{hub.title}</span>
        </nav>
        <header className="heroCard gameDetailPanel">
          <span className="badge">Explore the collection</span>
          <h1 style={{ marginTop: 12 }}>{hub.title}</h1>
          <h2>{hub.heading}</h2>
          {hub.introduction.map((paragraph, i) => (
            <p key={i} style={{ lineHeight: 1.8, color: "rgba(255,255,255,.78)" }}>{paragraph}</p>
          ))}
        </header>

        <section className="section" aria-labelledby="category-games-title">
          <div className="sectionTitle">
            <div>
              <h2 id="category-games-title">Games in this collection</h2>
              <p>Open a game to play and read its complete guide.</p>
            </div>
            <Link className="pill" href="/games">Browse the full library →</Link>
          </div>
          <div className="grid">
            {hub.games.map((game) => {
              const details = getGameEditorial(game.slug);
              return (
                <Link href={`/play/${game.slug}`} key={game.slug} className="tile">
                  <div className="thumb thumbWrap" style={{ position: "relative", overflow: "hidden" }}>
                    <GameThumb slug={game.slug} title={game.title} />
                  </div>
                  <div className="tileBody">
                    <h3 className="tileTitle">{game.title}</h3>
                    <p className="tileDesc">{game.whyPlay}</p>
                    {details ? <p className="muted" style={{ marginTop: 8 }}>{details.summary}</p> : null}
                    <div className="tileActions"><span className="playBtn">Play game →</span></div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="section" aria-labelledby="category-skills">
          <div className="heroCard gameDetailPanel">
            <h2 id="category-skills">{hub.skillsTitle}</h2>
            <ul style={{ lineHeight: 1.8, color: "rgba(255,255,255,.78)" }}>
              {hub.skills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </div>
        </section>

        <section className="section" aria-labelledby="category-choose">
          <div className="heroCard gameDetailPanel">
            <h2 id="category-choose">{hub.chooseTitle}</h2>
            {hub.choose.map((paragraph,i) => (
              <p key={i} style={{ lineHeight: 1.8, color: "rgba(255,255,255,.78)" }}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="section" aria-labelledby="category-faq">
          <div className="heroCard gameDetailPanel">
            <h2 id="category-faq">Frequently asked questions</h2>
            {hub.faqs.map((item) => (
              <div key={item.q} style={{ marginTop: 16 }}>
                <h3>{item.q}</h3>
                <p style={{ lineHeight: 1.8, color: "rgba(255,255,255,.78)" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
