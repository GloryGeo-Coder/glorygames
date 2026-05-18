export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import { resolveGamesDir } from "@/lib/gamesFs";

function authed(req: Request) {
  const key = process.env.ADMIN_KEY;
  if (!key) return false;
  return req.headers.get("x-admin-key") === key;
}

function sanitizeSlug(input: string) {
  let slug = (input || "").trim().toLowerCase();
  slug = slug.replace(/\s+/g, "-");
  slug = slug.replace(/[^a-z0-9-]/g, "");
  slug = slug.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return slug;
}

export async function POST(req: Request) {
  if (!authed(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as any;
  const rawSlug = String(body?.slug ?? "");
  const slug = sanitizeSlug(rawSlug);

  const title = String(body?.title ?? "").trim() || slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  const description = String(body?.description ?? "").trim().slice(0, 500) || null;

  let tags: string[] = [];
  if (Array.isArray(body?.tags)) {
    tags = body.tags.map((t: any) => String(t).trim()).filter(Boolean).slice(0, 20);
  }

  if (!slug || slug.length < 2) {
    return NextResponse.json({ error: "INVALID_SLUG" }, { status: 400 });
  }
  if (slug === "_template") {
    return NextResponse.json({ error: "SLUG_RESERVED" }, { status: 400 });
  }

  const gamesDir = resolveGamesDir();
  const templateDir = path.join(gamesDir, "_template");
  const targetDir = path.join(gamesDir, slug);

  if (!fssync.existsSync(templateDir)) {
    return NextResponse.json({ error: "TEMPLATE_NOT_FOUND", detail: templateDir }, { status: 500 });
  }
  if (fssync.existsSync(targetDir)) {
    return NextResponse.json({ error: "ALREADY_EXISTS", slug }, { status: 409 });
  }

  // Copy template folder
  await fs.mkdir(targetDir, { recursive: true });
  // Node 22 supports fs.cp
  await fs.cp(templateDir, targetDir, { recursive: true });

  // Overwrite game.json
  const meta = {
    title,
    description,
    tags,
    controls: Array.isArray(body?.controls) ? body.controls : undefined
  };

  await fs.writeFile(path.join(targetDir, "game.json"), JSON.stringify(meta, null, 2), "utf8");

  // Optional: auto-sync after creating
  const autoSync = body?.autoSync === true;
  let synced = false;

  return NextResponse.json({
    ok: true,
    slug,
    createdPath: targetDir,
    autoSyncRequested: autoSync,
    synced
  });
}
