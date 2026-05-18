export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
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
