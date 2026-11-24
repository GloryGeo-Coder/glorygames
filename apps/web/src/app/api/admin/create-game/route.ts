import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Game assets are published from reviewed source, not written inside a Worker.
export async function POST() {
  return NextResponse.json(
    { ok: false, error: "MAINTENANCE_PAUSED" },
    { status: 403, headers: { "Cache-Control": "no-store" } }
  );
}
