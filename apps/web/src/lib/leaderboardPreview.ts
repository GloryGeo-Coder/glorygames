// apps/web/src/lib/leaderboardPreview.ts

import { prisma } from "@/lib/prisma";
import { PUBLIC_HISTORICAL_LEADERBOARDS_ENABLED } from "@/lib/launchPolicy";

export type TopScore = {
  displayName: string;
  score: number;
};

export async function getTopScoreForGame(
  gameSlug: string
): Promise<TopScore | null> {
  if (!PUBLIC_HISTORICAL_LEADERBOARDS_ENABLED) return null;
  const game = await prisma.game.findUnique({
    where: { slug: gameSlug },
    select: { id: true },
  });

  if (!game) return null;

  const row = await prisma.dailyScore.findFirst({
    where: {
      gameId: game.id,
    },
    orderBy: {
      score: "desc",
    },
    select: {
      playerName: true,
      score: true,
    },
  });

  if (!row) return null;

  return {
    displayName: row.playerName || "Player",
    score: row.score,
  };
}

export async function getLeaderboardPreview(
  gameSlugs: string[]
): Promise<Record<string, TopScore | null>> {
  const result: Record<string, TopScore | null> = {};

  for (const slug of gameSlugs) {
    result[slug] = await getTopScoreForGame(slug);
  }

  return result;
}
