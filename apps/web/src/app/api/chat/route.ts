import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_CHAT_ENABLED } from "@/lib/launchPolicy";
import { getNeonSql } from "@/lib/neon";
import { getSessionUser } from "@/lib/auth";
import { isPublicGameSlug } from "@/lib/gamesDb";
import { communityBody, communityName, communityText, communityRateKey, communityWrite, communityError, CommunityInputError } from "@/lib/communityHttp";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  if (!PUBLIC_CHAT_ENABLED) return NextResponse.json({ ok: true, messages: [], status: "paused" }, { headers: { "Cache-Control": "no-store" } });
  try {
    const params = new URL(req.url).searchParams;
    const slug = params.get("gameSlug") || "";
    if (!isPublicGameSlug(slug)) throw new CommunityInputError(400, "Invalid game.");
    const parsed = Number(params.get("limit") || 50);
    const limit = Number.isInteger(parsed) ? Math.max(1, Math.min(80, parsed)) : 50;
    const sql = getNeonSql();
    const rows = await sql`SELECT * FROM wga_community_private.chat_messages(${slug}, ${limit})`;
    return NextResponse.json({ ok: true, messages: rows.map((r: any) => ({ id: r.id, user: r.playerName, text: r.text, ts: Number(r.ts) })) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return communityError(error); }
}
export async function POST(req: NextRequest) {
  if (!PUBLIC_CHAT_ENABLED) return NextResponse.json({ ok: false, error: "Chat is paused while safety controls are reviewed." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  try {
    const body = await communityBody(req);
    const slug = typeof body.gameSlug === "string" ? body.gameSlug : "";
    if (!isPublicGameSlug(slug)) throw new CommunityInputError(400, "Invalid game.");
    const text = communityText(body.text);
    const user = await getSessionUser();
    const name = communityName(user?.displayName || body.playerName || body.user);
    const key = await communityRateKey(req, user?.id);
    const rows = await communityWrite(sql => sql`SELECT wga_community_private.post_chat(${slug}, ${user?.id ?? null}, ${name}, ${text}, ${key}) AS message`);
    return NextResponse.json({ ok: true, message: rows[0]?.message }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return communityError(error); }
}
