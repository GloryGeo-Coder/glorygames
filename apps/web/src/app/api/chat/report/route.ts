import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_CHAT_ENABLED } from "@/lib/launchPolicy";
import { getSessionUser } from "@/lib/auth";
import { communityBody, communityRateKey, communityWrite, communityError, CommunityInputError } from "@/lib/communityHttp";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  if (!PUBLIC_CHAT_ENABLED) return NextResponse.json({ ok: false, error: "Chat is paused." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  try {
    const body = await communityBody(req);
    const id = typeof body.messageId === "string" ? body.messageId : "";
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) throw new CommunityInputError(400, "Invalid message id.");
    const user = await getSessionUser();
    const key = await communityRateKey(req, user?.id);
    const rows = await communityWrite(sql => sql`SELECT wga_community_private.report_chat(${id}, ${user?.id ?? null}, ${key}) AS reported`);
    if (rows[0]?.reported !== true) throw new Error("Report not confirmed");
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return communityError(error); }
}
