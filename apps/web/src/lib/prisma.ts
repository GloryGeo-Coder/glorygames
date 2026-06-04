// apps/web/src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function hasUsableDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) return false;
  if (url.includes("127.0.0.1")) return false;
  if (url.includes("localhost")) return false;

  return true;
}

export function getPrisma() {
  if (!hasUsableDatabaseUrl()) {
    throw new Error("DATABASE_URL is not configured for production.");
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: ["error", "warn"],
    });
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    return (client as any)[prop];
  },
});