export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

  const { slug } = await ctx.params;
  const body = await req.json().catch(() => ({} as any));

  const rating = Number(body.rating);
  const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, 500) : null;

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1..5" }, { status: 400 });
  }

  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) return NextResponse.json({ error: "GAME_NOT_FOUND" }, { status: 404 });

  const review = await prisma.review.upsert({
    where: { gameId_userId: { gameId: game.id, userId: user.id } },
    create: { gameId: game.id, userId: user.id, rating, comment },
    update: { rating, comment }
  });

  return NextResponse.json({ ok: true, review });
}
