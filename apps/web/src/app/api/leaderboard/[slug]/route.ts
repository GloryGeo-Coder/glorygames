import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameSlug = searchParams.get("gameSlug");// apps/web/src/app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

type Row = { rank: number; userId: string; displayName: string; score: number };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gameSlug = url.searchParams.get("gameSlug");
  if (!gameSlug) {
    return NextResponse.json({ error: "Missing gameSlug" }, { status: 400 });
  }

  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") ?? "25")));

  const lbKey = `lb:${gameSlug}`;
  const nameHash = `names`;

  try {
    // node-redis v4: zRange with REV + WITHSCORES
    // We’ll do ZREVRANGE to be safe via sendCommand (works reliably across wrappers)
    const raw = (await redis.sendCommand([
      "ZREVRANGE",
      lbKey,
      "0",
      String(limit - 1),
      "WITHSCORES",
    ])) as string[];

    const rows: Row[] = [];
    for (let i = 0; i < raw.length; i += 2) {
      const userId = raw[i];
      const score = Number(raw[i + 1] ?? "0");
      rows.push({ rank: rows.length + 1, userId, displayName: "Player", score });
    }

    if (rows.length) {
      const ids = rows.map((r) => r.userId);
      const names = (await redis.hmGet(nameHash, ids)) as (string | null)[];
      rows.forEach((r, idx) => {
        const n = names[idx];
        r.displayName = n && n.trim().length ? n : `Player-${r.userId.slice(0, 4)}`;
      });
    }

    return NextResponse.json({ gameSlug, rows });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Leaderboard unavailable", detail: String(e?.message ?? e) },
      { status: 500 },
    );
  }
}


    if (!gameSlug) {
      return NextResponse.json(
        { error: "gameSlug is required" },
        { status: 400 }
      );
    }

    const scores = await prisma.score.findMany({
      where: { gameSlug },
      orderBy: { score: "desc" },
      take: 10,
      include: {
        user: {
          select: { displayName: true }
        }
      }
    });

    return NextResponse.json(
      scores.map(s => ({
        player: s.user?.displayName ?? "Guest",
        score: s.score
      }))
    );
  } catch (err) {
    console.error("[leaderboard]", err);
    return NextResponse.json(
      { error: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
