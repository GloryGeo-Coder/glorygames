import { createClient } from "redis";

const url = process.env.REDIS_URL!;
export const redis = createClient({ url });

redis.on("error", err => console.error("Redis error", err));

if (!redis.isOpen) {
  await redis.connect();
}
