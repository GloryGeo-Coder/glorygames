export const runtime = "nodejs";

import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  // Current chat polls its own HTTP routes. Never export the HTTP-only session
  // credential to JavaScript through this unused legacy bridge.
  return NextResponse.json(
    { ok: false, error: "Legacy realtime token endpoint retired." },
    { status: 410, headers: { "Cache-Control": "no-store" } },
  );
}
