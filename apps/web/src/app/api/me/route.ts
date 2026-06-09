// apps/web/src/app/api/me/route.ts

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();

    return NextResponse.json(
      {
        ok: true,
        user: user
          ? {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
            }
          : null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("[api/me] failed", error);

    return NextResponse.json(
      {
        ok: true,
        user: null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}