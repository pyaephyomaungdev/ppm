import { createClient, type RedisClientType } from "redis";

let redis: RedisClientType | null = null;

export async function getRedis(): Promise<RedisClientType | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (redis?.isOpen) return redis;
  redis = createClient({ url });
  redis.on("error", (err) => console.error("Redis error", err));
  await redis.connect();
  return redis;
}
