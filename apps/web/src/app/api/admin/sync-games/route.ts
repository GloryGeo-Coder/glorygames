import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Maintenance runs outside the public Worker, without a second privileged URL.
export async function POST() {
  return NextResponse.json(
    { ok: false, error: "MAINTENANCE_PAUSED" },
    { status: 403, headers: { "Cache-Control": "no-store" } }
  );
}
