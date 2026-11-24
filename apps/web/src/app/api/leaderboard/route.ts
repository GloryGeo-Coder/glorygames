// apps/web/src/app/api/leaderboard/route.ts

import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_HISTORICAL_LEADERBOARDS_ENABLED } from "@/lib/launchPolicy";
import {
  getGlobalLeaderboardFromDatabase,
  getLeaderboardForGameFromDatabase,
  isPublicGameSlug,
} from "@/lib/gamesDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!PUBLIC_HISTORICAL_LEADERBOARDS_ENABLED) {
    return NextResponse.json(
      { ok: true, paused: true, entries: [], rows: [], topScore: null },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }
  try {
    const { searchParams } = new URL(req.url);

    const gameSlug = searchParams.get("gameSlug")?.trim() || "";
    const mode = searchParams.get("mode")?.trim() || "global";
    const limitParam = Number(searchParams.get("limit") || 10);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(Math.floor(limitParam), 1), 100)
      : 10;

    const entries = gameSlug
      ? isPublicGameSlug(gameSlug)
        ? await getLeaderboardForGameFromDatabase({ slug: gameSlug, mode, limit })
        : []
      : await getGlobalLeaderboardFromDatabase(limit);

    const topScore = entries.length ? entries[0].score : null;

    return NextResponse.json(
      {
        ok: true,
        entries: entries.map(({ rank, displayName, score, gameSlug, gameTitle }) => ({
          rank, displayName, score, gameSlug, gameTitle,
        })),
        rows: entries.map((entry) => ({
          name: entry.displayName,
          score: entry.score,
          gameSlug: entry.gameSlug,
          gameTitle: entry.gameTitle,
        })),
        topScore,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[api/leaderboard] failed", {
      errorClass: error instanceof Error ? error.name : "UnknownError",
    });

    return NextResponse.json(
      {
        ok: false,
        entries: [],
        rows: [],
        topScore: null,
        error: "Leaderboard unavailable",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
