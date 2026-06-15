// apps/web/src/app/api/chat/report/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getNeonSql, hasUsableNeonDatabaseUrl } from "@/lib/neon";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (!hasUsableNeonDatabaseUrl()) {
      return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const messageId = String(body?.messageId || "").trim();

    if (!messageId) {
      return NextResponse.json({ ok: false, error: "Missing message id" }, { status: 400 });
    }

    const user = await getSessionUser();
    const sql = getNeonSql();

    await sql`
      UPDATE "ChatMessage"
      SET
        "reportedAt" = NOW(),
        "reportedBy" = ${user?.id ?? "anonymous"}
      WHERE id = ${messageId}
    `;

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[api/chat/report] failed", error);

    return NextResponse.json(
      { ok: false, error: "Message could not be reported" },
      { status: 500 }
    );
  }
}
