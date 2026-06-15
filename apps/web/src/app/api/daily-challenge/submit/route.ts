// apps/web/src/app/api/daily-challenge/submit/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createId, getNeonSql, hasUsableNeonDatabaseUrl } from "@/lib/neon";
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

async function getOrCreateChallenge(sql: ReturnType<typeof getNeonSql>, gameId: string) {
  const day = todayUtc();
  const id = createId();
  const seed = Math.floor(Math.random() * 1_000_000_000);

  const rows = await sql`
    INSERT INTO "DailyChallenge" (id, day, seed, "gameId", "createdAt")
    VALUES (${id}, ${day}, ${seed}, ${gameId}, NOW())
    ON CONFLICT (day, "gameId")
    DO UPDATE SET day = EXCLUDED.day
    RETURNING id, day, seed
  `;

  return rows[0] as { id: string; day: string; seed: number };
}

export async function POST(req: NextRequest) {
  try {
    if (!hasUsableNeonDatabaseUrl()) {
      return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
    }

    const body = await req.json().catch(() => null);

    const gameSlug = String(body?.gameSlug || "").trim();
    const score = Math.max(0, Math.floor(Number(body?.score || body?.value || 0)));
    const submittedPlayerName = sanitizePlayerName(body?.playerName);

    if (!isPublicGameSlug(gameSlug)) {
      return NextResponse.json({ ok: false, error: "Invalid game" }, { status: 400 });
    }

    if (!Number.isFinite(score) || score <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid score" }, { status: 400 });
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
      return NextResponse.json({ ok: false, error: "Game not found" }, { status: 404 });
    }

    const playerName = sanitizePlayerName(user?.displayName || submittedPlayerName);
    const challenge = await getOrCreateChallenge(sql, game.id);

    await sql`
      INSERT INTO "DailyChallengeScore" (
        id,
        value,
        "playerName",
        "createdAt",
        "challengeId",
        "userId"
      )
      VALUES (
        ${createId()},
        ${score},
        ${playerName},
        NOW(),
        ${challenge.id},
        ${user?.id ?? null}
      )
    `;

    await sql`
      INSERT INTO "DailyScore" (
        id,
        day,
        "playerName",
        score,
        "gameId",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${createId()},
        ${challenge.day},
        ${playerName},
        ${score},
        ${game.id},
        NOW(),
        NOW()
      )
      ON CONFLICT (day, "gameId", "playerName")
      DO UPDATE SET
        score = GREATEST("DailyScore".score, EXCLUDED.score),
        "updatedAt" = NOW()
    `;

    return NextResponse.json(
      {
        ok: true,
        row: {
          name: playerName,
          score,
          gameSlug: game.slug,
          gameTitle: game.title,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[api/daily-challenge/submit] failed", error);

    return NextResponse.json(
      { ok: false, error: "Score could not be submitted" },
      { status: 500 }
    );
  }
}
