import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_SCORE_SUBMISSIONS_ENABLED } from "@/lib/launchPolicy";
import { getSessionUser } from "@/lib/auth";
import { isPublicGameSlug } from "@/lib/gamesDb";
import { communityBody, communityName, communityScore, communityRateKey, communityWrite, communityError, CommunityInputError } from "@/lib/communityHttp";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  if (!PUBLIC_SCORE_SUBMISSIONS_ENABLED) return NextResponse.json({ ok: false, error: "Public score submissions are paused." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  try {
    const body = await communityBody(req);
    const slug = typeof body.gameSlug === "string" ? body.gameSlug : "";
    if (!isPublicGameSlug(slug)) throw new CommunityInputError(400, "Invalid game.");
    const score = communityScore(body.score ?? body.value);
    const user = await getSessionUser();
    const name = communityName(user?.displayName || body.playerName);
    const key = await communityRateKey(req, user?.id);
    const rows = await communityWrite(sql => sql`SELECT wga_community_private.submit_score(${slug}, ${user?.id ?? null}, ${name}, ${score}, 'daily', true, ${key}) AS result`);
    return NextResponse.json(rows[0]?.result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return communityError(error); }
}
