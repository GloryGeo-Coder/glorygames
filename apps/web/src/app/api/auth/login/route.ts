import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          displayName: email.split("@")[0],
        },
      });
    }

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, displayName: user.displayName },
    });
  } catch (e) {
    console.error("[auth/login]", e);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
