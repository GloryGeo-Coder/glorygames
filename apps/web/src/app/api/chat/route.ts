// apps/web/src/app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createId, getNeonSql, hasUsableNeonDatabaseUrl } from "@/lib/neon";
import { getSessionUser } from "@/lib/auth";
import { isPublicGameSlug } from "@/lib/gamesDb";

export const dynamic = "force-dynamic";

function sanitizePlayerName(value?: string | null) {
  const clean = String(value || "")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);

  return clean || "Guest Player";
}

function sanitizeMessage(value?: string | null) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function isBlockedMessage(text: string) {
  const lower = text.toLowerCase();

  if (!text) return true;
  if (text.length > 180) return true;
  if (lower.includes("http://")) return true;
  if (lower.includes("https://")) return true;
  if (lower.includes("www.")) return true;
  if ((lower.match(/(.)\1{8,}/g) || []).length > 0) return true;

  return false;
}

async function ensureChatTable(sql: ReturnType<typeof getNeonSql>) {
  await sql`
    CREATE TABLE IF NOT EXISTS "ChatMessage" (
      id TEXT PRIMARY KEY,
      "gameId" TEXT NOT NULL REFERENCES "Game"(id) ON DELETE CASCADE,
      "userId" TEXT NULL REFERENCES "User"(id) ON DELETE SET NULL,
      "playerName" TEXT NOT NULL,
      text TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "reportedAt" TIMESTAMPTZ NULL,
      "reportedBy" TEXT NULL,
      "hiddenAt" TIMESTAMPTZ NULL
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "ChatMessage_game_created_idx"
    ON "ChatMessage" ("gameId", "createdAt")
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "ChatMessage_hidden_idx"
    ON "ChatMessage" ("hiddenAt")
  `;
}

async function getGameBySlug(sql: ReturnType<typeof getNeonSql>, gameSlug: string) {
  const rows = await sql`
    SELECT id, slug, title
    FROM "Game"
    WHERE
      slug = ${gameSlug}
      AND LEFT(slug, 1) <> '_'
      AND LOWER(slug) NOT LIKE '%template%'
      AND LOWER(title) NOT LIKE '%template%'
    LIMIT 1
  `;

  return rows[0] as { id: string; slug: string; title: string } | undefined;
}

export async function GET(req: NextRequest) {
  try {
    if (!hasUsableNeonDatabaseUrl()) {
      return NextResponse.json({ ok: true, messages: [] });
    }

    const { searchParams } = new URL(req.url);
    const gameSlug = searchParams.get("gameSlug")?.trim() || "";
    const limitParam = Number(searchParams.get("limit") || 50);
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(Math.floor(limitParam), 1), 80)
      : 50;

    if (!isPublicGameSlug(gameSlug)) {
      return NextResponse.json({ ok: true, messages: [] });
    }

    const sql = getNeonSql();

    await ensureChatTable(sql);

    const game = await getGameBySlug(sql, gameSlug);

    if (!game) {
      return NextResponse.json({ ok: true, messages: [] });
    }

    const rows = await sql`
      SELECT
        id,
        "playerName",
        text,
        EXTRACT(EPOCH FROM "createdAt") * 1000 AS ts
      FROM "ChatMessage"
      WHERE
        "gameId" = ${game.id}
        AND "hiddenAt" IS NULL
        AND "createdAt" > NOW() - INTERVAL '24 hours'
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `;

    const messages = rows
      .reverse()
      .map((row: any) => ({
        id: String(row.id),
        user: String(row.playerName || "Player"),
        text: String(row.text || ""),
        ts: Number(row.ts || Date.now()),
      }));

    return NextResponse.json(
      {
        ok: true,
        messages,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[api/chat] GET failed", error);

    return NextResponse.json(
      {
        ok: false,
        messages: [],
        error: "Chat unavailable",
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

export async function POST(req: NextRequest) {
  try {
    if (!hasUsableNeonDatabaseUrl()) {
      return NextResponse.json(
        { ok: false, error: "Database unavailable" },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null);

    const gameSlug = String(body?.gameSlug || "").trim();
    const text = sanitizeMessage(body?.text);
    const requestedPlayerName = sanitizePlayerName(body?.playerName || body?.user);

    if (!isPublicGameSlug(gameSlug)) {
      return NextResponse.json({ ok: false, error: "Invalid game" }, { status: 400 });
    }

    if (isBlockedMessage(text)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Message blocked. Keep chat short, respectful and free of links.",
        },
        { status: 400 }
      );
    }

    const user = await getSessionUser();
    const playerName = sanitizePlayerName(user?.displayName || requestedPlayerName);

    const sql = getNeonSql();

    await ensureChatTable(sql);

    const game = await getGameBySlug(sql, gameSlug);

    if (!game) {
      return NextResponse.json({ ok: false, error: "Game not found" }, { status: 404 });
    }

    const id = createId();

    const rows = await sql`
      INSERT INTO "ChatMessage" (
        id,
        "gameId",
        "userId",
        "playerName",
        text,
        "createdAt"
      )
      VALUES (
        ${id},
        ${game.id},
        ${user?.id ?? null},
        ${playerName},
        ${text},
        NOW()
      )
      RETURNING
        id,
        "playerName",
        text,
        EXTRACT(EPOCH FROM "createdAt") * 1000 AS ts
    `;

    const row = rows[0];

    return NextResponse.json(
      {
        ok: true,
        message: {
          id: String(row.id),
          user: String(row.playerName || playerName),
          text: String(row.text || text),
          ts: Number(row.ts || Date.now()),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[api/chat] POST failed", error);

    return NextResponse.json(
      { ok: false, error: "Message could not be sent" },
      { status: 500 }
    );
  }
}
