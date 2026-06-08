// apps/web/src/lib/neon.ts

import { neon } from "@neondatabase/serverless";

export function hasUsableNeonDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) return false;
  if (url.includes("127.0.0.1")) return false;
  if (url.includes("localhost")) return false;

  return true;
}

export function getNeonSql() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is missing.");
  }

  if (!hasUsableNeonDatabaseUrl()) {
    throw new Error(
      "DATABASE_URL is not usable in production. Use your hosted Neon connection string."
    );
  }

  return neon(url);
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}