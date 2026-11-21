import { communityWrite } from "@/lib/communityHttp";
import { PUBLIC_SCORE_SUBMISSIONS_ENABLED } from "@/lib/launchPolicy";
// apps/web/src/app/api/daily-challenge/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getNeonSql, hasUsableNeonDatabaseUrl } from "@/lib/neon";
import { getSessionUser } from "@/lib/auth";
import { isPublicGameSlug } from "@/lib/gamesDb";

export const dynamic = "force-dynamic";

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function sanitizePlayerName(value?: string | null) {
  const clean = String(value || "")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);

  return clean || "Guest Player";
}

async function getOrCreateChallenge(_sql: ReturnType<typeof getNeonSql>, slug: string) {
  const rows = await communityWrite(sql => sql`SELECT wga_community_private.daily_context(${slug}) AS context`);
  return rows[0]?.context as { id: string; day: string; seed: number };
}

export async function GET(req: NextRequest) {
  if (!PUBLIC_SCORE_SUBMISSIONS_ENABLED) return NextResponse.json({ ok: true, rows: [], status: "paused" }, { headers: { "Cache-Control": "no-store" } });
  try {
    if (!hasUsableNeonDatabaseUrl()) {
      return NextResponse.json({ ok: true, rows: [], entries: [], me: null });
    }

    const { searchParams } = new URL(req.url);

    const gameSlug = searchParams.get("gameSlug")?.trim() || "";
    const requestedPlayerName = sanitizePlayerName(searchParams.get("playerName"));

    if (!isPublicGameSlug(gameSlug)) {
      return NextResponse.json({ ok: true, rows: [], entries: [], me: null });
    }

    const user = await getSessionUser();
    const sql = getNeonSql();

    const gameRows = await sql`
      SELECT id, slug, title
      FROM "Game"
      WHERE
        slug = ${gameSlug}
        AND LEFT(slug, 1) <> '_'
        AND LOWER(slug) NOT LIKE '%template%'
        AND LOWER(title) NOT LIKE '%template%'
      LIMIT 1
    `;

    const game = gameRows[0] as { id: string; slug: string; title: string } | undefined;

    if (!game) {
      return NextResponse.json({ ok: true, rows: [], entries: [], me: null });
    }

    const challenge = await getOrCreateChallenge(sql, game.slug);

    const scoreRows = await sql`
      SELECT
        COALESCE(u."displayName", dcs."playerName", 'Player') AS name,
        MAX(dcs.value)::int AS score
      FROM "DailyChallengeScore" dcs
      LEFT JOIN "User" u ON u.id = dcs."userId"
      WHERE dcs."challengeId" = ${challenge.id}
      GROUP BY u.id, u."displayName", dcs."playerName"
      ORDER BY score DESC
      LIMIT 10
    `;

    const rows = scoreRows.map((row: any) => ({
      name: String(row.name || "Player"),
      score: Number(row.score || 0),
    }));

    let me: { name: string; score: number } | null = null;

    if (user?.id) {
      const myRows = await sql`
        SELECT
          COALESCE(u."displayName", dcs."playerName", 'Player') AS name,
          dcs.value::int AS score
        FROM "DailyChallengeScore" dcs
        LEFT JOIN "User" u ON u.id = dcs."userId"
        WHERE
          dcs."challengeId" = ${challenge.id}
          AND dcs."userId" = ${user.id}
        ORDER BY dcs.value DESC
        LIMIT 1
      `;

      if (myRows[0]) {
        me = {
          name: String(myRows[0].name || user.displayName || "Player"),
          score: Number(myRows[0].score || 0),
        };
      }
    }

    if (!me && requestedPlayerName) {
      const myRows = await sql`
        SELECT
          COALESCE("playerName", 'Guest Player') AS name,
          value::int AS score
        FROM "DailyChallengeScore"
        WHERE
          "challengeId" = ${challenge.id}
          AND LOWER(COALESCE("playerName", '')) = LOWER(${requestedPlayerName})
        ORDER BY value DESC
        LIMIT 1
      `;

      if (myRows[0]) {
        me = {
          name: String(myRows[0].name || requestedPlayerName),
          score: Number(myRows[0].score || 0),
        };
      }
    }

    return NextResponse.json(
      {
        ok: true,
        challenge: {
          id: challenge.id,
          day: challenge.day,
          seed: challenge.seed,
          gameSlug: game.slug,
          gameTitle: game.title,
        },
        rows,
        entries: rows,
        me,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.warn("[api/daily-challenge] unavailable");

    return NextResponse.json(
      { ok: false, rows: [], entries: [], me: null, error: "Daily challenge unavailable" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
