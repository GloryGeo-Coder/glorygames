// apps/web/src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPrisma, hasUsableDatabaseUrl } from "@/lib/prisma";
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

function authUnavailable(message: string) {
  return NextResponse.json(
    {
      error: message,
    },
    { status: 503 }
  );
}

function friendlyDatabaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes("P1001") ||
    message.toLowerCase().includes("can't reach database") ||
    message.toLowerCase().includes("connection")
  ) {
    return "Account login is temporarily unavailable because the database cannot be reached.";
  }

  if (
    message.includes("P2021") ||
    message.includes("P2022") ||
    message.toLowerCase().includes("does not exist") ||
    message.toLowerCase().includes("relation")
  ) {
    return "Account login is temporarily unavailable because the database tables have not been created yet.";
  }

  return "Login failed. Please try again later.";
}

export async function POST(req: NextRequest) {
  try {
    if (!hasUsableDatabaseUrl()) {
      return authUnavailable(
        "Account login is temporarily unavailable because the production database is not configured."
      );
    }

    if (!isAuthConfigured()) {
      return authUnavailable(
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

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;

    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        displayName: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };

    const token = await signSession(sessionUser);

    const response = NextResponse.json({
      ok: true,
      user: sessionUser,
    });

    response.cookies.set(
      getSessionCookieName(),
      token,
      getSessionCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("[auth/login] failed", error);

    return NextResponse.json(
      { error: friendlyDatabaseError(error) },
      { status: 500 }
    );
  }
}