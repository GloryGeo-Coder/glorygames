export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const jar = await cookies();
  const cookieName = process.env.COOKIE_NAME ?? "gg_session";
  const token = jar.get(cookieName)?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  return NextResponse.json({ token });
}
