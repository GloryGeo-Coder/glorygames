// apps/web/src/app/api/games/[slug]/score/route.ts
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function json(res: any, status = 200) {
  return NextResponse.json(res, { status });
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  const user = await getSessionUser(); // ok if null — we can still return global top

  const lbKey = `lb:${slug}`;
  const nameHash = `names`;

  try {
    const topRaw = (await redis.sendCommand(["ZREVRANGE", lbKey, "0", "0", "WITHSCORES"])) as string[];
    const topUserId = topRaw?.[0] ?? null;
    const topScore = Number(topRaw?.[1] ?? "0");

    let topName = "Player";
    if (topUserId) {
      const n = (await redis.hGet(nameHash, topUserId)) as string | null;
      topName = n && n.trim().length ? n : `Player-${topUserId.slice(0, 4)}`;
    }

    let myTop = null as null | number;
    if (user) {
      const s = (await redis.zScore(lbKey, user.id)) as number | null;
      myTop = s == null ? 0 : Number(s);
    }

    return json({
      gameSlug: slug,
      top: { userId: topUserId, displayName: topName, score: topScore },
      me: user ? { userId: user.id, displayName: user.displayName, topScore: myTop } : null,
    });
  } catch (e: any) {
    return json({ error: "Score unavailable", detail: String(e?.message ?? e) }, 500);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  const user = await getSessionUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const score = Number(body?.score);
  if (!Number.isFinite(score) || score < 0) {
    return json({ error: "score must be a non-negative number" }, 400);
  }

  const lbKey = `lb:${slug}`;
  const nameHash = `names`;

  try {
    // Store displayName for leaderboard rendering
    await redis.hSet(nameHash, user.id, user.displayName);

    // Update ONLY if new score is higher
    const prev = (await redis.zScore(lbKey, user.id)) as number | null;
    const prevScore = prev == null ? 0 : Number(prev);

    if (score > prevScore) {
      await redis.zAdd(lbKey, [{ score, value: user.id }]);
    }

    // Return my current top + global top
    const myTopNow = Math.max(prevScore, score);

    const topRaw = (await redis.sendCommand(["ZREVRANGE", lbKey, "0", "0", "WITHSCORES"])) as string[];
    const topUserId = topRaw?.[0] ?? null;
    const topScore = Number(topRaw?.[1] ?? "0");

    let topName = "Player";
    if (topUserId) {
      const n = (await redis.hGet(nameHash, topUserId)) as string | null;
      topName = n && n.trim().length ? n : `Player-${topUserId.slice(0, 4)}`;
    }

    return json({
      ok: true,
      gameSlug: slug,
      me: { userId: user.id, displayName: user.displayName, topScore: myTopNow },
      top: { userId: topUserId, displayName: topName, score: topScore },
    });
  } catch (e: any) {
    return json({ error: "Failed to submit score", detail: String(e?.message ?? e) }, 500);
  }
}
