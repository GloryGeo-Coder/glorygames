// apps/web/src/app/play/[slug]/page.tsx

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PlayClient from "./play-client";

export const dynamic = "force-dynamic";

const SITE_URL = "https://glorygames.co.za";

const CATEGORY_LABELS: Record<string, string> = {
  ARCADE: "Arcade",
  ACTION: "Action",
  ADVENTURE: "Adventure",
  EDUCATIONAL: "Educational",
  PUZZLE: "Puzzle",
  RACING: "Racing",
  WORD_TRIVIA: "Word & Trivia",
  STRATEGY: "Strategy",
  SPORTS: "Sports",
  SIMULATION: "Simulation",
  DEFENSE: "Defense",
  PLATFORMER: "Platformer",
  CASUAL: "Casual",
  MULTIPLAYER: "Multiplayer",
  KIDS_FAMILY: "Kids & Family",
};

function titleFromSlug(slug: string) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function categoryLabel(category?: string | null) {
  if (!category) return "Arcade";
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");
}

async function getGame(slug: string) {
  return prisma.game.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      tags: true,
      updatedAt: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGame(slug);

  const title = game?.title ?? titleFromSlug(slug);
  const category = categoryLabel(game?.category);

  const description =
    game?.description ||
    `Play ${title} for free on GloryGames. A mobile-first ${category.toLowerCase()} browser game built for instant play.`;

  const url = `${SITE_URL}/play/${slug}`;

  return {
    title: `${title} | Play Free on GloryGames`,
    description,
    keywords: [
      title,
      `${title} game`,
      `${category} game`,
      "GloryGames",
      "free browser games",
      "mobile games",
      "HTML5 games",
      ...(game?.tags ?? []),
    ],
    alternates: {
      canonical: `/play/${slug}`,
    },
    openGraph: {
      title: `${title} | Play Free on GloryGames`,
      description,
      url,
      siteName: "GloryGames",
      type: "website",
      locale: "en_ZA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Play Free on GloryGames`,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await getGame(slug);

  const title = game?.title ?? titleFromSlug(slug);
  const description =
    game?.description ||
    `Play ${title} instantly on GloryGames. No downloads required.`;

  const category = categoryLabel(game?.category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: title,
    description,
    url: `${SITE_URL}/play/${slug}`,
    applicationCategory: "Game",
    genre: category,
    gamePlatform: ["Web browser", "Mobile browser", "Desktop browser"],
    operatingSystem: "Any",
    publisher: {
      "@type": "Organization",
      name: "GloryGames",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PlayClient slug={slug} title={title} />
    </>
  );
}