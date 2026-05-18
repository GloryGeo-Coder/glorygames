import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export type SessionUser = {
  id: string;
  displayName: string;
  email?: string | null;
};

const secret = process.env.JWT_SECRET;
const cookieName = process.env.COOKIE_NAME ?? "gg_session";

if (!secret) throw new Error("JWT_SECRET is missing");

const key = new TextEncoder().encode(secret);

type TokenPayload = {
  sub: string; // userId
  name: string;
  email?: string | null;
};

export async function signSession(payload: TokenPayload, maxAgeDays = 30) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + maxAgeDays * 24 * 60 * 60;

  return new SignJWT({ name: payload.name, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(key);
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    const userId = typeof payload.sub === "string" ? payload.sub : "";
    const displayName = typeof (payload as any).name === "string" ? (payload as any).name : "Player";
    const email = typeof (payload as any).email === "string" ? (payload as any).email : null;

    if (!userId) return null;
    return { id: userId, displayName, email };
  } catch {
    return null;
  }
}

export async function createSession(user: { id: string; displayName: string; email?: string | null }) {
  const token = await signSession({ sub: user.id, name: user.displayName, email: user.email });

  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return null;
  return verifySession(token);
}

/**
 * Route handlers don't always have access to server component cookies() in the same way,
 * so we read the Cookie header directly from the Request.
 */
export async function getSessionUserFromRequest(req: Request): Promise<SessionUser | null> {
  const header = req.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`${cookieName}=([^;]+)`));
  const token = match?.[1] ? decodeURIComponent(match[1]) : "";
  if (!token) return null;
  return verifySession(token);
}
