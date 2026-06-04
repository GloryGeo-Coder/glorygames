// apps/web/src/lib/auth.ts

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
};

export function getSessionCookieName() {
  return process.env.COOKIE_NAME ?? "gg_session";
}

export function isAuthConfigured() {
  return Boolean(process.env.JWT_SECRET);
}

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return null;
  }

  return new TextEncoder().encode(secret);
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function signSession(user: SessionUser) {
  const key = getSecret();

  if (!key) {
    throw new Error("JWT_SECRET is missing");
  }

  return new SignJWT({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function createSession(user: SessionUser) {
  const token = await signSession(user);
  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(), token, getSessionCookieOptions());
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const key = getSecret();

  if (!key) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, key);
    const payload = verified.payload as Partial<SessionUser>;

    if (!payload.id || !payload.email || !payload.displayName) {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      displayName: payload.displayName,
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}