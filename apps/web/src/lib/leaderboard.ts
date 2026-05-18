import { ensureRedis, redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export async function getLeaderboard(slug: string, mode = "global", limit = 10) {
  const safeLimit = Math.min(Math.max(limit, 1), 200);

  await ensureRedis();
  const key = `lb:${slug}:${mode}`;

  // highest first
  const raw = await redis.zRangeWithScores(key, 0, safeLimit - 1, { REV: true });
  const userIds = raw.map((r) => r.value);

  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, displayName: true }
      })
    : [];

  const map = new Map(users.map((u) => [u.id, u.displayName]));

  return raw.map((r, idx) => ({
    rank: idx + 1,
    userId: r.value,
    displayName: map.get(r.value) ?? "Unknown",
    score: r.score
  }));
}
