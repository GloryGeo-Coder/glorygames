import { PUBLIC_SCORE_SUBMISSIONS_ENABLED } from "@/lib/launchPolicy";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  if (!PUBLIC_SCORE_SUBMISSIONS_ENABLED) return NextResponse.json({ ok: false, error: "This online feature is paused. Guest gameplay remains available." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const { slug } = await ctx.params;

  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) return NextResponse.json({ error: "GAME_NOT_FOUND" }, { status: 404 });

  const user = await getSessionUser();

  const session = await prisma.gameSession.create({
    data: {
      gameId: game.id,
      userId: user?.id ?? null
    }
  });

  return NextResponse.json({ sessionId: session.id });
}
