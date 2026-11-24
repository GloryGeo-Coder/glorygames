import { NextResponse } from "next/server";
import { hasUsableNeonDatabaseUrl, getNeonSql } from "@/lib/neon";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

// Public readiness reports availability, never infrastructure or visitor counts.
export async function GET() {
  try {
    if (!hasUsableNeonDatabaseUrl()) {
      return NextResponse.json(
        { ok: false, error: "Database unavailable" },
        { status: 503, headers }
      );
    }
    const sql = getNeonSql();
    await sql`SELECT 1`;
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    console.error("[health/db] failed", {
      errorClass: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { ok: false, error: "Database unavailable" },
      { status: 500, headers }
    );
  }
}
