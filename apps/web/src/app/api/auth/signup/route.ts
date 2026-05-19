// apps/web/src/app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2).max(40).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid signup details" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const displayName =
      parsed.data.displayName?.trim() ||
      email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "") ||
      "Player";

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

    await createSession(user);

    return NextResponse.json({
      ok: true,
      user,
    });
  } catch (err) {
    console.error("[auth/signup] failed", err);

    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}