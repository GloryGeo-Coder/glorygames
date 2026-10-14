export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { catalogGame } from "@/lib/gameCatalog";
import { isPublicGameSlug } from "@/lib/gamesDb";

export async function GET() {
  const games = await prisma.game.findMany({ orderBy: { title: "asc" } });
  return NextResponse.json({ games: games.filter((game) => isPublicGameSlug(game.slug)).map(catalogGame) });
}
