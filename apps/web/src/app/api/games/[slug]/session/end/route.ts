export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const body = await req.json().catch(() => ({} as any));
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";

  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

  const user = await getSessionUser();

  // ensure game exists (and prevents ending a session for another slug by mistake)
  const game = await prisma.game.findUnique({ where: { slug } });
  if (!game) return NextResponse.json({ error: "GAME_NOT_FOUND" }, { status: 404 });

  const session = await prisma.gameSession.findUnique({ where: { id: sessionId } });
  if (!session || session.gameId !== game.id) {
    return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });
  }

  // if session was created with a user, only that user can close it
  if (session.userId && (!user || user.id !== session.userId)) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (session.endedAt) return NextResponse.json({ ok: true, alreadyEnded: true });

  const endedAt = new Date();
  const durationSec = Math.max(
    0,
    Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000)
  );

  await prisma.gameSession.update({
    where: { id: sessionId },
    data: { endedAt, durationSec }
  });

  return NextResponse.json({ ok: true, durationSec });
}
