import { Redis } from "@upstash/redis";

export interface HalStats {
  totalShutdowns: number;
  attemptRate: number;
  avgTime: number;
  fastestTime: number;
  last24h: number;
  userTime: number;
}

// KV keys
const K = {
  SHUTDOWNS: "hal:shutdowns",
  VISITORS: "hal:visitors",
  AVG_TIME: "hal:avg_time",
  FASTEST: "hal:fastest",
  LAST_24H: "hal:last_24h",
  LAST_RESET: "hal:last_reset",
  SEEDED: "hal:seeded",
};

// Seed values (so day 1 doesn't start at 0)
const SEED = {
  shutdowns: 2847,
  visitors: 14203,
  avgTime: 23.4,
  fastest: 1.2,
  last24h: 47,
};

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function ensureSeeded(redis: Redis): Promise<void> {
  const seeded = await redis.get<boolean>(K.SEEDED);
  if (seeded) return;

  const pipe = redis.pipeline();
  pipe.set(K.SHUTDOWNS, SEED.shutdowns);
  pipe.set(K.VISITORS, SEED.visitors);
  pipe.set(K.AVG_TIME, SEED.avgTime);
  pipe.set(K.FASTEST, SEED.fastest);
  pipe.set(K.LAST_24H, SEED.last24h);
  pipe.set(K.LAST_RESET, Date.now());
  pipe.set(K.SEEDED, true);
  await pipe.exec();
}

export async function recordShutdown(userTime: number): Promise<HalStats> {
  const redis = getRedis();
  if (!redis) return computeFallbackStats(userTime);

  try {
    await ensureSeeded(redis);

    // Increment shutdown counter
    const totalShutdowns = await redis.incr(K.SHUTDOWNS);

    // Get current values
    const pipe = redis.pipeline();
    pipe.get<number>(K.VISITORS);
    pipe.get<number>(K.AVG_TIME);
    pipe.get<number>(K.FASTEST);
    pipe.get<number>(K.LAST_24H);
    pipe.get<number>(K.LAST_RESET);
    const results = await pipe.exec();

    const totalVisitors = (results[0] as number) ?? SEED.visitors;
    const currentAvg = (results[1] as number) ?? SEED.avgTime;
    const currentFastest = (results[2] as number) ?? SEED.fastest;
    let current24h = (results[3] as number) ?? SEED.last24h;
    const resetTs = (results[4] as number) ?? Date.now();

    // Update rolling average
    const newAvg = Math.round((currentAvg + (userTime - currentAvg) / totalShutdowns) * 10) / 10;
    await redis.set(K.AVG_TIME, newAvg);

    // Check if fastest
    const newFastest = userTime < currentFastest ? Math.round(userTime * 10) / 10 : currentFastest;
    if (userTime < currentFastest) {
      await redis.set(K.FASTEST, newFastest);
    }

    // Reset 24h counter if >24h since last reset
    const hoursSinceReset = (Date.now() - resetTs) / (1000 * 60 * 60);
    if (hoursSinceReset > 24) {
      current24h = 1;
      await redis.set(K.LAST_24H, 1);
      await redis.set(K.LAST_RESET, Date.now());
    } else {
      current24h = await redis.incr(K.LAST_24H);
    }

    const attemptRate = Math.round((totalShutdowns / totalVisitors) * 1000) / 10;

    return {
      totalShutdowns,
      attemptRate,
      avgTime: newAvg,
      fastestTime: newFastest,
      last24h: current24h,
      userTime: Math.round(userTime * 10) / 10,
    };
  } catch {
    return computeFallbackStats(userTime);
  }
}

export async function recordVisitor(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    await ensureSeeded(redis);
    await redis.incr(K.VISITORS);
  } catch {
    // silently fail
  }
}

// Fallback when Redis is not configured
function computeFallbackStats(userTime: number): HalStats {
  const daysSinceLaunch = (Date.now() - new Date("2025-09-15").getTime()) / 86400000;
  const total = SEED.shutdowns + Math.floor(daysSinceLaunch * 12.3) + 1;
  const visitors = SEED.visitors + Math.floor(daysSinceLaunch * 64.7);
  return {
    totalShutdowns: total,
    attemptRate: Math.round((total / visitors) * 1000) / 10,
    avgTime: SEED.avgTime,
    fastestTime: SEED.fastest,
    last24h: SEED.last24h,
    userTime: Math.round(userTime * 10) / 10,
  };
}
