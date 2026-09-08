import { Redis } from "@upstash/redis";
import type { BusinessData } from "./types";

// KV keys
const K = {
  BIZ: (slug: string) => `demo:biz:${slug}`,
  INDEX: "demo:biz:index",
  VISIT: (slug: string) => `demo:visit:${slug}`,
};

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function getDynamicBusiness(
  slug: string,
): Promise<BusinessData | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const data = await redis.get<BusinessData>(K.BIZ(slug));
    return data ?? null;
  } catch {
    return null;
  }
}

export async function saveDynamicBusiness(data: BusinessData): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis not configured");
  const pipe = redis.pipeline();
  pipe.set(K.BIZ(data.slug), JSON.stringify(data));
  pipe.sadd(K.INDEX, data.slug);
  await pipe.exec();
}

export async function dynamicSlugExists(slug: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  try {
    const exists = await redis.sismember(K.INDEX, slug);
    return exists === 1;
  } catch {
    return false;
  }
}

export async function trackDemoVisit(slug: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.incr(K.VISIT(slug));
  } catch {
    // silently fail
  }
}
