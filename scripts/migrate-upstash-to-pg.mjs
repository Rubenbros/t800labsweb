#!/usr/bin/env node
/**
 * Migración de datos de Upstash Redis a Cloud SQL (PostgreSQL).
 *
 * Lee por la API REST de Upstash:
 *   - hal:shutdowns, hal:visitors, hal:avg_time, hal:fastest, hal:last_24h,
 *     hal:last_reset, hal:seeded          -> tabla `hal_stats` (sin el prefijo `hal:`)
 *   - demo:biz:index (SMEMBERS)           -> lista de slugs
 *   - demo:biz:{slug} + demo:visit:{slug} -> tabla `demo_businesses`
 *
 * Upstash es la fuente de la verdad: las filas existentes se sobrescriben
 * (salvo `visits`, donde se conserva el mayor de los dos). Volver a ejecutarlo
 * deja el mismo resultado.
 *
 * Uso:
 *   UPSTASH_REDIS_REST_URL=... UPSTASH_REDIS_REST_TOKEN=... \
 *   DATABASE_URL=postgresql://... node scripts/migrate-upstash-to-pg.mjs
 *
 *   --dry-run   solo lee de Upstash e imprime el resumen (no necesita DATABASE_URL)
 */
import pg from "pg";

const dryRun = process.argv.includes("--dry-run");

const upstashUrl = (process.env.UPSTASH_REDIS_REST_URL ?? "").replace(/\/+$/, "");
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!upstashUrl || !upstashToken) {
  console.error("Faltan UPSTASH_REDIS_REST_URL y/o UPSTASH_REDIS_REST_TOKEN");
  process.exit(1);
}
if (!dryRun && !process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL (o usa --dry-run)");
  process.exit(1);
}

const HAL_KEYS = [
  "shutdowns",
  "visitors",
  "avg_time",
  "fastest",
  "last_24h",
  "last_reset",
  "seeded",
];

/** Ejecuta varios comandos Redis en una sola llamada REST. */
async function pipeline(commands) {
  if (commands.length === 0) return [];
  const res = await fetch(`${upstashUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${upstashToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) {
    throw new Error(`Upstash respondió ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  return body.map((entry, i) => {
    if (entry.error) {
      throw new Error(`Comando ${commands[i].join(" ")} falló: ${entry.error}`);
    }
    return entry.result;
  });
}

/** Los valores llegan como texto; `true`/`false` se guardan como 1/0. */
function toNumber(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return raw;
  const s = String(raw).trim();
  if (s === "true") return 1;
  if (s === "false") return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseBusiness(raw) {
  if (raw === null || raw === undefined) return null;
  let value = raw;
  // El valor puede venir ya como objeto, como JSON o como JSON doblemente
  // serializado (según cómo lo escribiera el cliente de Upstash).
  for (let i = 0; i < 2 && typeof value === "string"; i++) {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value && typeof value === "object" ? value : null;
}

// ── Lectura ────────────────────────────────────────────────────────────────
const halRaw = await pipeline(HAL_KEYS.map((k) => ["GET", `hal:${k}`]));
const halStats = [];
HAL_KEYS.forEach((key, i) => {
  const value = toNumber(halRaw[i]);
  if (value !== null) halStats.push({ key, value });
});

const [slugsRaw] = await pipeline([["SMEMBERS", "demo:biz:index"]]);
const slugs = Array.isArray(slugsRaw) ? slugsRaw.map(String) : [];

const bizRaw = await pipeline(
  slugs.flatMap((s) => [
    ["GET", `demo:biz:${s}`],
    ["GET", `demo:visit:${s}`],
  ]),
);

const businesses = [];
const missing = [];
slugs.forEach((slug, i) => {
  const data = parseBusiness(bizRaw[i * 2]);
  const visits = toNumber(bizRaw[i * 2 + 1]) ?? 0;
  if (!data) {
    missing.push(slug);
    return;
  }
  businesses.push({ slug, data, visits: Math.trunc(visits) });
});

// ── Resumen ────────────────────────────────────────────────────────────────
console.log(`Upstash: ${upstashUrl}`);
console.log(`\nhal_stats (${halStats.length} de ${HAL_KEYS.length} claves):`);
for (const { key, value } of halStats) console.log(`  ${key.padEnd(11)} ${value}`);
const absent = HAL_KEYS.filter((k) => !halStats.some((h) => h.key === k));
if (absent.length > 0) console.log(`  (sin valor en Upstash: ${absent.join(", ")})`);

console.log(`\ndemo_businesses (${businesses.length} de ${slugs.length} slugs):`);
for (const b of businesses) {
  console.log(`  ${b.slug.padEnd(30)} visitas=${b.visits}`);
}
if (missing.length > 0) {
  console.log(`  SIN FICHA LEGIBLE (no se migran): ${missing.join(", ")}`);
}

if (dryRun) {
  console.log("\n--dry-run: no se ha escrito nada en Postgres.");
  process.exit(0);
}

// ── Escritura ──────────────────────────────────────────────────────────────
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query("BEGIN");

  for (const { key, value } of halStats) {
    await client.query(
      `INSERT INTO hal_stats (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, value],
    );
  }

  for (const b of businesses) {
    await client.query(
      `INSERT INTO demo_businesses (slug, data, visits) VALUES ($1, $2::jsonb, $3)
       ON CONFLICT (slug) DO UPDATE
         SET data = EXCLUDED.data,
             visits = GREATEST(demo_businesses.visits, EXCLUDED.visits),
             updated_at = now()`,
      [b.slug, JSON.stringify(b.data), b.visits],
    );
  }

  await client.query("COMMIT");
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  await client.end();
}

console.log(
  `\nMigrado: ${halStats.length} contadores y ${businesses.length} negocios.`,
);
