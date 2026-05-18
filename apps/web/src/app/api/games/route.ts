export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const games = await prisma.game.findMany({ orderBy: { title: "asc" } });
  return NextResponse.json({ games });
}
