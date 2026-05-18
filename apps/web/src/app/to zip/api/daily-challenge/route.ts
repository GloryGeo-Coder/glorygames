import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const gameSlug = url.searchParams.get("gameSlug")?.trim();

    if (!gameSlug) {
      return NextResponse.json(
        { error: "Missing gameSlug" },
        { status: 400 }
      );
    }

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const game = await prisma.game.findUnique({
      where: { slug: gameSlug },
      select: { id: true },
    });

    if (!game) {
      return NextResponse.json(
        { rows: [], me: null, error: "Game not found" },
        { status: 200 }
      );
    }

    // Top scores for today (by game)
    const top = await prisma.dailyScore.findMany({
      where: {
        gameId: game.id,
        createdAt: { gte: start, lt: end },
      },
      orderBy: { score: "desc" },
      take: 20,
      select: {
        playerName: true,
        score: true,
      },
    });

    // We don’t have a reliable “current user” on this endpoint yet,
    // so return me=null for now (client shows "—").
    return NextResponse.json({
      rows: top.map((t) => ({ name: t.playerName, score: t.score })),
      me: null,
    });
  } catch (e) {
    console.error("[api/daily-challenge] GET failed", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
