export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scanGamesFolder } from "@/lib/gamesFs";

function isAuthorized(req: Request) {
  const key = process.env.ADMIN_KEY;
  if (!key) return false;
  const sent = req.headers.get("x-admin-key");
  return sent && sent === key;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dry") === "1";
  const deleteMissing = url.searchParams.get("deleteMissing") === "1";

  const fsGames = await scanGamesFolder();
  const fsSlugs = new Set(fsGames.map((g) => g.slug));

  const created: string[] = [];
  const updated: string[] = [];
  const unchanged: string[] = [];

  for (const g of fsGames) {
    const existing = await prisma.game.findUnique({ where: { slug: g.slug } });

    if (!existing) {
      if (!dryRun) {
        await prisma.game.create({
          data: {
            slug: g.slug,
            title: g.title,
            description: g.description,
            tags: g.tags
          }
        });
      }
      created.push(g.slug);
      continue;
    }

    const needsUpdate =
      existing.title !== g.title ||
      (existing.description ?? null) !== (g.description ?? null) ||
      JSON.stringify(existing.tags ?? []) !== JSON.stringify(g.tags ?? []);

    if (!needsUpdate) {
      unchanged.push(g.slug);
      continue;
    }

    if (!dryRun) {
      await prisma.game.update({
        where: { slug: g.slug },
        data: { title: g.title, description: g.description, tags: g.tags }
      });
    }

    updated.push(g.slug);
  }

  const deleted: string[] = [];
  if (deleteMissing) {
    const db = await prisma.game.findMany({ select: { slug: true } });
    const missing = db.map((x) => x.slug).filter((s) => !fsSlugs.has(s));

    if (!dryRun && missing.length) {
      await prisma.game.deleteMany({ where: { slug: { in: missing } } });
    }
    deleted.push(...missing);
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    deleteMissing,
    totals: { scanned: fsGames.length, created: created.length, updated: updated.length, unchanged: unchanged.length, deleted: deleted.length },
    created,
    updated,
    unchanged,
    deleted
  });
}
