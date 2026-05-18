export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setAuthCookie, signSession } from "@/lib/auth";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(40)
});

export async function POST(req: Request) {
  const data = Body.parse(await req.json());

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: { email: data.email, displayName: data.displayName, passwordHash }
  });

  const token = await signSession({ id: user.id, email: user.email, displayName: user.displayName });
  await setAuthCookie(token);

  return NextResponse.json({ ok: true });
}
