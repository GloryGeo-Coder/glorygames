export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getGamesFromDatabase } from "@/lib/gamesDb";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    // Use the same restricted Neon HTTP reader as the hosted catalogue pages.
    const games = await getGamesFromDatabase();
    return NextResponse.json({ games }, { headers });
  } catch (error) {
    console.error("[api/games] failed", {
      errorClass: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { games: [], error: "Catalogue unavailable" },
      { status: 503, headers }
    );
  }
}
