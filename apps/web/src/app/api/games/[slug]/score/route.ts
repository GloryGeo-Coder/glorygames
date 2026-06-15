// apps/web/src/app/api/games/[slug]/score/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createId, getNeonSql, hasUsableNeonDatabaseUrl } from "@/lib/neon";
import { getSessionUser } from "@/lib/auth";
import { isPublicGameSlug } from "@/lib/gamesDb";

export const dynamic = "force-dynamic";

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    if (!hasUsableNeonDatabaseUrl()) {
      return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
    }

    const { slug } = await context.params;

    if (!isPublicGameSlug(slug)) {
      return NextResponse.json({ ok: false, error: "Invalid game" }, { status: 400 });
    }

    const user = await getSessionUser();

    if (!user?.id) {
      return NextResponse.json(
        { ok: false, error: "Sign in to save global scores" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    const score = Math.max(0, Math.floor(Number(body?.score || body?.value || 0)));
    const mode = String(body?.mode || "global").trim() || "global";

    if (!Number.isFinite(score) || score <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid score" }, { status: 400 });
    }

    const sql = getNeonSql();

    const gameRows = await sql`
      SELECT id, slug, title
      FROM "Game"
      WHERE
        slug = ${slug}
        AND LEFT(slug, 1) <> '_'
        AND LOWER(slug) NOT LIKE '%template%'
        AND LOWER(title) NOT LIKE '%template%'
      LIMIT 1
    `;

    const game = gameRows[0] as { id: string; slug: string; title: string } | undefined;

    if (!game) {
      return NextResponse.json({ ok: false, error: "Game not found" }, { status: 404 });
    }

    await sql`
      INSERT INTO "Score" (
        id,
        "userId",
        "gameId",
        mode,
        value,
        "createdAt"
      )
      VALUES (
        ${createId()},
        ${user.id},
        ${game.id},
        ${mode},
        ${score},
        NOW()
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
        ${todayUtc()},
        ${user.displayName || "Player"},
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
        score,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
        game: {
          slug: game.slug,
          title: game.title,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[api/games/[slug]/score] failed", error);

    return NextResponse.json(
      { ok: false, error: "Score could not be saved" },
      { status: 500 }
    );
  }
}
