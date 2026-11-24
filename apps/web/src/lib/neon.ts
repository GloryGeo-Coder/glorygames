// apps/web/src/lib/neon.ts

import { neon } from "@neondatabase/serverless";
import { getRuntimeDatabaseUrl, hasUsableRuntimeDatabaseUrl } from "@/lib/runtimeDatabaseUrl";

export function hasUsableNeonDatabaseUrl() {
  return hasUsableRuntimeDatabaseUrl();
}

export function getNeonSql() {
  return neon(getRuntimeDatabaseUrl());
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
