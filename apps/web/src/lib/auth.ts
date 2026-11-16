// apps/web/src/lib/auth.ts

import { SignJWT, jwtVerify, base64url } from "jose";
import { cookies } from "next/headers";
import { getNeonSql, hasUsableNeonDatabaseUrl } from "@/lib/neon";

const SESSION_SECONDS = 60 * 60;
const SESSION_ISSUER = "https://webgamearena.com";
const SESSION_AUDIENCE = "webgamearena-session";

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
    maxAge: SESSION_SECONDS,
  };
}

async function accountProofKey(key: Uint8Array) {
  return crypto.subtle.importKey(
    "raw", new Uint8Array(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
  );
}

function accountProofInput(id: string, passwordHash: string) {
  return new TextEncoder().encode(JSON.stringify(["wga-account-session-v1", id, passwordHash]));
}

export async function signSession(user: SessionUser, passwordHash: string) {
  const key = getSecret();

  if (!key) {
    throw new Error("JWT_SECRET is missing");
  }

  if (!user.id || !passwordHash) throw new Error("Account session cannot be issued");
  const proof = await crypto.subtle.sign(
    "HMAC", await accountProofKey(key), accountProofInput(user.id, passwordHash)
  );

  return new SignJWT({
    ver: 1,
    accountProof: base64url.encode(new Uint8Array(proof)),
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

export async function createSession(user: SessionUser, passwordHash: string) {
  const token = await signSession(user, passwordHash);
  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(), token, getSessionCookieOptions());
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const key = getSecret();

  if (!key) {
    return null;
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getSessionCookieName())?.value;
    if (!token || token.length > 4096) return null;
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"], typ: "JWT", issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE, maxTokenAge: SESSION_SECONDS,
      requiredClaims: ["sub", "iat", "exp"],
    });
    if (payload.ver !== 1 || typeof payload.sub !== "string" || !payload.sub ||
        typeof payload.iat !== "number" || typeof payload.exp !== "number" ||
        payload.exp - payload.iat > SESSION_SECONDS ||
        typeof payload.accountProof !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(payload.accountProof) ||
        !hasUsableNeonDatabaseUrl()) {
      return null;
    }

    // Use only the existing four granted fields. Never trust cached profile
    // claims or accept a deleted account / changed password from an old token.
    const sql = getNeonSql();
    const rows = await sql`
      SELECT id, email, "displayName", "passwordHash"
      FROM "User" WHERE id = ${payload.sub} LIMIT 1
    `;
    const account = rows[0] as (SessionUser & { passwordHash: string }) | undefined;
    if (!account || account.id !== payload.sub || typeof account.email !== "string" ||
        typeof account.displayName !== "string" || typeof account.passwordHash !== "string" ||
        !account.passwordHash) return null;
    const matches = await crypto.subtle.verify(
      "HMAC", await accountProofKey(key), new Uint8Array(base64url.decode(payload.accountProof)),
      accountProofInput(account.id, account.passwordHash)
    );
    if (!matches) return null;
    return {
      id: account.id,
      email: account.email,
      displayName: account.displayName,
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
