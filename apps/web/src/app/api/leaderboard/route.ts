// apps/web/src/app/api/leaderboard/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const gameSlug = searchParams.get("gameSlug");

    if (!gameSlug) {
      return NextResponse.json(
        { error: "Missing gameSlug" },
        { status: 400 }
      );
    }

    // Find the game first
    const game = await prisma.game.findUnique({
      where: { slug: gameSlug },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    if (!game) {
      return NextResponse.json(
        {
          entries: [],
          topScore: 0,
        },
        { status: 200 }
      );
    }

    // IMPORTANT:
    // Your schema uses gameId, NOT gameSlug
    const rows = await prisma.dailyScore.findMany({
      where: {
        gameId: game.id,
      },
      orderBy: {
        score: "desc",
      },
      take: 10,
      select: {
        playerName: true,
        score: true,
      },
    });

    const entries = rows.map((r) => ({
      user: r.playerName || "Player",
      score: r.score,
    }));

    return NextResponse.json({
      entries,
      topScore: rows[0]?.score ?? 0,
    });
  } catch (err) {
    console.error("Leaderboard API error:", err);

    return NextResponse.json(
      {
        error: "Failed to load leaderboard",
      },
      { status: 500 }
    );
  }
}