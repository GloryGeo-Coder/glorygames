import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_SCORE_SUBMISSIONS_ENABLED } from "@/lib/launchPolicy";
import { getSessionUser } from "@/lib/auth";
import { isPublicGameSlug } from "@/lib/gamesDb";
import { communityBody, communityName, communityScore, communityRateKey, communityWrite, communityError, CommunityInputError } from "@/lib/communityHttp";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  if (!PUBLIC_SCORE_SUBMISSIONS_ENABLED) return NextResponse.json({ ok: false, error: "Public score submissions are paused. Your game can still save locally." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  try {
    const body = await communityBody(req);
    const user = await getSessionUser();
    if (!user) throw new CommunityInputError(401, "Sign in to submit a global score.");
    const { slug } = await context.params;
    if (!isPublicGameSlug(slug)) throw new CommunityInputError(400, "Invalid game.");
    const score = communityScore(body.score ?? body.value);
    const mode = body.mode === undefined ? "global" : String(body.mode);
    if (!/^[a-zA-Z0-9_-]{1,32}$/.test(mode)) throw new CommunityInputError(400, "Invalid game mode.");
    const name = communityName(user.displayName);
    const key = await communityRateKey(req, user.id);
    const rows = await communityWrite(sql => sql`SELECT wga_community_private.submit_score(${slug}, ${user.id}, ${name}, ${score}, ${mode}, false, ${key}) AS result`);
    return NextResponse.json(rows[0]?.result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return communityError(error); }
}
