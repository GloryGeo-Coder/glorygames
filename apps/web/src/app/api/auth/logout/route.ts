// apps/web/src/app/api/auth/logout/route.ts

import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: "Sign-out could not be confirmed. Please retry." },
      { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

export async function GET() {
  try {
    await destroySession();
    const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Sign-out could not be confirmed. Please retry." },
      { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
