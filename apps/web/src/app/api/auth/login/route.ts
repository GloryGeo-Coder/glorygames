// apps/web/src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getNeonSql, hasUsableNeonDatabaseUrl } from "@/lib/neon";
import {
  getSessionCookieName,
  getSessionCookieOptions,
  isAuthConfigured,
  signSession,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function unavailable(message: string, status = 503) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    if (!hasUsableNeonDatabaseUrl()) {
      return unavailable(
        "Account login is temporarily unavailable because the production database is not configured."
      );
    }

    if (!isAuthConfigured()) {
      return unavailable(
        "Account login is temporarily unavailable because the session secret is not configured."
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid login details" },
        { status: 400 }
      );
    }

    const sql = getNeonSql();

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const rows = await sql`
      SELECT id, email, "displayName", "passwordHash"
      FROM "User"
      WHERE email = ${email}
      LIMIT 1
    `;

    const userRow = rows[0] as
      | {
          id: string;
          email: string;
          displayName: string;
          passwordHash: string;
        }
      | undefined;

    if (!userRow) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordOk = await bcrypt.compare(password, userRow.passwordHash);

    if (!passwordOk) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = {
      id: userRow.id,
      email: userRow.email,
      displayName: userRow.displayName,
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
    console.error("[auth/login] failed", error);

    const message = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: `Login failed: ${message}`,
      },
      { status: 500 }
    );
  }
}