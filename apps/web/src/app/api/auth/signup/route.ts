// apps/web/src/app/api/auth/signup/route.ts

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
  password: z.string().min(8),
  displayName: z.string().min(2).max(40).optional(),
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
    return "Account signup is temporarily unavailable because the database cannot be reached.";
  }

  if (
    message.includes("P2021") ||
    message.includes("P2022") ||
    message.toLowerCase().includes("does not exist") ||
    message.toLowerCase().includes("relation")
  ) {
    return "Account signup is temporarily unavailable because the database tables have not been created yet.";
  }

  return "Signup failed. Please try again later.";
}

export async function POST(req: NextRequest) {
  try {
    if (!hasUsableDatabaseUrl()) {
      return authUnavailable(
        "Account signup is temporarily unavailable because the production database is not configured."
      );
    }

    if (!isAuthConfigured()) {
      return authUnavailable(
        "Account signup is temporarily unavailable because the session secret is not configured."
      );
    }

    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid signup details. Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const displayName =
      parsed.data.displayName?.trim() ||
      email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "") ||
      "Player";

    const prisma = getPrisma();

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        displayName,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
      },
    });

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

    return NextResponse.json(
      { error: friendlyDatabaseError(error) },
      { status: 500 }
    );
  }
}