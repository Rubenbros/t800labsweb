import { isDatabaseConfigured, query } from "@/lib/db";

export interface HalStats {
  totalShutdowns: number;
  attemptRate: number;
  avgTime: number;
  fastestTime: number;
  last24h: number;
  userTime: number;
}

// Claves de la tabla `hal_stats` (una fila por contador).
const K = {
  SHUTDOWNS: "shutdowns",
  VISITORS: "visitors",
  AVG_TIME: "avg_time",
  FASTEST: "fastest",
  LAST_24H: "last_24h",
  LAST_RESET: "last_reset",
  SEEDED: "seeded",
} as const;

// Valores iniciales (para que el día 1 no empiece a cero).
const SEED = {
  shutdowns: 2847,
  visitors: 14203,
  avgTime: 23.4,
  fastest: 1.2,
  last24h: 47,
};

const HOUR_MS = 1000 * 60 * 60;

type ValueRow = { key: string; value: number };

/** Siembra los contadores que aún no existan. No pisa los ya presentes. */
async function ensureSeeded(): Promise<void> {
  await query(
    `INSERT INTO hal_stats (key, value)
     SELECT * FROM unnest($1::text[], $2::double precision[])
     ON CONFLICT (key) DO NOTHING`,
    [
      [K.SHUTDOWNS, K.VISITORS, K.AVG_TIME, K.FASTEST, K.LAST_24H, K.LAST_RESET, K.SEEDED],
      [
        SEED.shutdowns,
        SEED.visitors,
        SEED.avgTime,
        SEED.fastest,
        SEED.last24h,
        Date.now(),
        1,
      ],
    ],
  );
}

/** Incremento atómico; devuelve el valor resultante. */
async function increment(key: string): Promise<number> {
  const { rows } = await query<{ value: number }>(
    `UPDATE hal_stats SET value = value + 1, updated_at = now()
      WHERE key = $1
      RETURNING value`,
    [key],
  );
  return rows[0]?.value ?? 0;
}

async function setValue(key: string, value: number): Promise<void> {
  await query(
    `UPDATE hal_stats SET value = $2, updated_at = now() WHERE key = $1`,
    [key, value],
  );
}

export async function recordShutdown(userTime: number): Promise<HalStats> {
  if (!isDatabaseConfigured()) return computeFallbackStats(userTime);

  try {
    await ensureSeeded();

    // Contador de apagados (atómico).
    const totalShutdowns = await increment(K.SHUTDOWNS);

    // Valores actuales.
    const { rows } = await query<ValueRow>(
      `SELECT key, value FROM hal_stats WHERE key = ANY($1::text[])`,
      [[K.VISITORS, K.AVG_TIME, K.FASTEST, K.LAST_24H, K.LAST_RESET]],
    );
    const current = new Map(rows.map((r) => [r.key, Number(r.value)]));

    const totalVisitors = current.get(K.VISITORS) ?? SEED.visitors;
    const currentAvg = current.get(K.AVG_TIME) ?? SEED.avgTime;
    const currentFastest = current.get(K.FASTEST) ?? SEED.fastest;
    let current24h = current.get(K.LAST_24H) ?? SEED.last24h;
    const resetTs = current.get(K.LAST_RESET) ?? Date.now();

    // Media móvil.
    const newAvg =
      Math.round((currentAvg + (userTime - currentAvg) / totalShutdowns) * 10) / 10;
    await setValue(K.AVG_TIME, newAvg);

    // Mejor tiempo: se guarda el menor de los dos (atómico con LEAST).
    let newFastest = currentFastest;
    if (userTime < currentFastest) {
      const rounded = Math.round(userTime * 10) / 10;
      const { rows: fastestRows } = await query<{ value: number }>(
        `UPDATE hal_stats SET value = LEAST(value, $2), updated_at = now()
          WHERE key = $1
          RETURNING value`,
        [K.FASTEST, rounded],
      );
      newFastest = Number(fastestRows[0]?.value ?? rounded);
    }

    // Ventana de 24 h: se reinicia si ha pasado más de un día desde el corte.
    const hoursSinceReset = (Date.now() - resetTs) / HOUR_MS;
    if (hoursSinceReset > 24) {
      current24h = 1;
      await setValue(K.LAST_24H, 1);
      await setValue(K.LAST_RESET, Date.now());
    } else {
      current24h = await increment(K.LAST_24H);
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
  } catch (err) {
    console.error("[hal-stats] recordShutdown falló:", err);
    return computeFallbackStats(userTime);
  }
}

export async function recordVisitor(): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    await ensureSeeded();
    await increment(K.VISITORS);
  } catch (err) {
    console.error("[hal-stats] recordVisitor falló:", err);
  }
}

// Fallback determinista cuando no hay base de datos configurada.
function computeFallbackStats(userTime: number): HalStats {
  const daysSinceLaunch =
    (Date.now() - new Date("2025-09-15").getTime()) / 86400000;
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
