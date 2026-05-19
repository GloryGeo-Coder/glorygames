// apps/web/src/lib/leaderboard.ts

import { prisma } from "@/lib/prisma";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
};

export async function getLeaderboard(
  slug: string,
  _mode = "global",
  limit = 10
): Promise<LeaderboardEntry[]> {
  const game = await prisma.game.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!game) return [];

  const rows = await prisma.dailyScore.findMany({
    where: {
      gameId: game.id,
    },
    orderBy: {
      score: "desc",
    },
    take: limit,
    select: {
      id: true,
      playerName: true,
      score: true,
    },
  });

  return rows.map((row, index) => ({
    rank: index + 1,
    userId: row.id,
    displayName: row.playerName || "Player",
    score: row.score,
  }));
}