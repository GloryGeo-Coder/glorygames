// apps/web/src/lib/prisma.ts

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type GeneratedPrismaClient = PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma?: GeneratedPrismaClient;
};

export function hasUsableDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) return false;
  if (url.includes("127.0.0.1")) return false;
  if (url.includes("localhost")) return false;

  return true;
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is missing.");
  }

  if (!hasUsableDatabaseUrl()) {
    throw new Error(
      "DATABASE_URL is not usable in production."
    );
  }

  return url;
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: getDatabaseUrl(),
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error", "warn"],
  });
}

export function getPrisma() {
  /*
    In Cloudflare production, create the client through the adapter.
    In local development, reuse the client to prevent too many connections.
  */
  if (process.env.NODE_ENV === "production") {
    return createPrismaClient();
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as GeneratedPrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = (client as any)[prop];

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});