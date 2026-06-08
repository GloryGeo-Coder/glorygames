// apps/web/src/app/api/health/db/route.ts

import { NextResponse } from "next/server";
import { hasUsableNeonDatabaseUrl, getNeonSql } from "@/lib/neon";
import { isAuthConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

function maskDatabaseUrl(url?: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    return {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      database: parsed.pathname.replace("/", ""),
      sslmode: parsed.searchParams.get("sslmode"),
      isLocalhost:
        parsed.hostname.includes("localhost") ||
        parsed.hostname.includes("127.0.0.1"),
    };
  } catch {
    return {
      invalid: true,
    };
  }
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;

  const report = {
    ok: false,
    runtime: "cloudflare-worker",
    driver: "neon-serverless-http",
    hasDatabaseUrl: Boolean(databaseUrl),
    usableDatabaseUrl: hasUsableNeonDatabaseUrl(),
    database: maskDatabaseUrl(databaseUrl),
    hasJwtSecret: isAuthConfigured(),
    cookieName: process.env.COOKIE_NAME ?? "gg_session",
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    if (!hasUsableNeonDatabaseUrl()) {
      return NextResponse.json(
        {
          ...report,
          error:
            "DATABASE_URL is missing or points to localhost/127.0.0.1, which cannot work on Cloudflare.",
        },
        { status: 503 }
      );
    }

    const sql = getNeonSql();

    const userRows = await sql`
      SELECT COUNT(*)::int AS count
      FROM "User"
    `;

    const gameRows = await sql`
      SELECT COUNT(*)::int AS count
      FROM "Game"
    `;

    return NextResponse.json({
      ...report,
      ok: true,
      userCount: userRows[0]?.count ?? 0,
      gameCount: gameRows[0]?.count ?? 0,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error("[health/db] failed", error);

    return NextResponse.json(
      {
        ...report,
        error: message,
      },
      { status: 500 }
    );
  }
}