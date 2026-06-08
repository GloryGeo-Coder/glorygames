// apps/web/src/app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createId, getNeonSql, hasUsableNeonDatabaseUrl } from "@/lib/neon";
import {
  getSessionCookieName,
  getSessionCookieOptions,
  isAuthConfigured,
  signSession,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(40).optional(),
});

function unavailable(message: string, status = 503) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    if (!hasUsableNeonDatabaseUrl()) {
      return unavailable(
        "Account signup is temporarily unavailable because the production database is not configured."
      );
    }

    if (!isAuthConfigured()) {
      return unavailable(
        "Account signup is temporarily unavailable because the session secret is not configured."
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid signup details. Password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    const sql = getNeonSql();

    const email = parsed.data.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const displayName =
      parsed.data.displayName?.trim() ||
      email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "") ||
      "Player";

    const existing = await sql`
      SELECT id
      FROM "User"
      WHERE email = ${email}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const id = createId();

    const rows = await sql`
      INSERT INTO "User" (
        id,
        email,
        "displayName",
        "passwordHash",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${email},
        ${displayName},
        ${passwordHash},
        NOW(),
        NOW()
      )
      RETURNING id, email, "displayName"
    `;

    const user = rows[0] as {
      id: string;
      email: string;
      displayName: string;
    };

    const token = await signSession(user);

    const response = NextResponse.json({
      ok: true,
      user,
    });

    response.cookies.set(
      getSessionCookieName(),
      token,
      getSessionCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("[auth/signup] failed", error);

    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: `Signup failed: ${message}`,
      },
      { status: 500 }
    );
  }
}