// apps/web/src/app/api/games/[slug]/score/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json().catch(() => ({}));

    const score = Number(body.score);
    const playerName =
      typeof body.playerName === "string" && body.playerName.trim()
        ? body.playerName.trim()
        : "Player";

    if (!Number.isFinite(score) || score < 0) {
      return NextResponse.json(
        { error: "Invalid score" },
        { status: 400 }
      );
    }

    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    const day = todayKey();

    const existing = await prisma.dailyScore.findFirst({
      where: {
        gameId: game.id,
        day,
        playerName,
      },
      select: {
        id: true,
        score: true,
      },
    });

    let savedScore = Math.floor(score);

    if (existing) {
      savedScore = Math.max(existing.score, Math.floor(score));

      await prisma.dailyScore.update({
        where: { id: existing.id },
        data: { score: savedScore },
      });
    } else {
      await prisma.dailyScore.create({
        data: {
          gameId: game.id,
          day,
          playerName,
          score: savedScore,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      score: savedScore,
    });
  } catch (err) {
    console.error("Score submit error:", err);

    return NextResponse.json(
      { error: "Failed to submit score" },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const game = await prisma.game.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!game) {
      return NextResponse.json({ topScore: 0 });
    }

    const top = await prisma.dailyScore.findFirst({
      where: { gameId: game.id },
      orderBy: { score: "desc" },
      select: { score: true, playerName: true },
    });

    return NextResponse.json({
      topScore: top?.score ?? 0,
      playerName: top?.playerName ?? null,
    });
  } catch (err) {
    console.error("Score GET error:", err);

    return NextResponse.json(
      { error: "Failed to fetch score" },
      { status: 500 }
    );
  }
}