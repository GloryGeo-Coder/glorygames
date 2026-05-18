import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TZ = "Africa/Johannesburg";

function dayKey(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ").slice(0, 24);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as
    | { gameSlug?: string; playerName?: string; score?: number }
    | null;

  const gameSlug = body?.gameSlug?.trim();
  const playerName = body?.playerName ? cleanName(body.playerName) : "";
  const score = Number(body?.score);

  if (!gameSlug) return NextResponse.json({ error: "Missing gameSlug" }, { status: 400 });
  if (!playerName) return NextResponse.json({ error: "Missing playerName" }, { status: 400 });
  if (!Number.isFinite(score)) return NextResponse.json({ error: "Invalid score" }, { status: 400 });

  const game = await prisma.game.findUnique({ where: { slug: gameSlug } });
  if (!game) return NextResponse.json({ error: `Game not found: ${gameSlug}` }, { status: 404 });

  const day = dayKey();
  const key = { day_gameId_playerName: { day, gameId: game.id, playerName } };

  const existing = await prisma.dailyScore.findUnique({ where: key });

  // Only keep the best score for that player, today, on that game
  if (!existing) {
    await prisma.dailyScore.create({
      data: { day, gameId: game.id, playerName, score: Math.trunc(score) },
    });
    return NextResponse.json({ ok: true, improved: true, day, gameSlug, playerName, score });
  }

  if (Math.trunc(score) > existing.score) {
    await prisma.dailyScore.update({
      where: key,
      data: { score: Math.trunc(score) },
    });
    return NextResponse.json({ ok: true, improved: true, day, gameSlug, playerName, score });
  }

  return NextResponse.json({
    ok: true,
    improved: false,
    day,
    gameSlug,
    playerName,
    score: existing.score,
    note: "Score not higher than existing best for today.",
  });
}
