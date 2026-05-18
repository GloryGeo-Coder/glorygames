import { ensureRedis, redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export type TopScore = { displayName: string; score: number };

export async function getTopScoresBySlugs(
  slugs: string[],
  mode = "global"
): Promise<Record<string, TopScore | null>> {
  const out: Record<string, TopScore | null> = {};
  if (slugs.length === 0) return out;

  await ensureRedis();

  // 1) Fetch top entry (userId + score) per game
  const tops = await Promise.all(
    slugs.map(async (slug) => {
      const key = `lb:${slug}:${mode}`;
      const arr = await redis.zRangeWithScores(key, 0, 0, { REV: true });
      const top = arr?.[0];
      return top ? { slug, userId: top.value, score: top.score } : { slug, userId: null, score: null };
    })
  );

  // 2) Hydrate display names in one query
  const userIds = Array.from(new Set(tops.map((t) => t.userId).filter(Boolean))) as string[];
  const users = userIds.length
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, displayName: true } })
    : [];

  const nameMap = new Map(users.map((u) => [u.id, u.displayName]));

  for (const t of tops) {
    if (!t.userId || t.score === null) {
      out[t.slug] = null;
      continue;
    }
    out[t.slug] = {
      displayName: nameMap.get(t.userId) ?? "Unknown",
      score: t.score
    };
  }

  return out;
}
