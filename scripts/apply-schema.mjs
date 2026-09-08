#!/usr/bin/env node
/**
 * Aplica db/schema.sql a la base de datos de `DATABASE_URL`.
 * Idempotente: el esquema usa CREATE TABLE IF NOT EXISTS.
 *
 *   DATABASE_URL=postgresql://... node scripts/apply-schema.mjs
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = path.join(root, "db", "schema.sql");
const sql = await readFile(schemaPath, "utf8");

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(sql);
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_name IN ('hal_stats', 'demo_businesses')
      ORDER BY table_name`,
  );
  console.log(
    `Esquema aplicado. Tablas presentes: ${rows.map((r) => r.table_name).join(", ") || "ninguna"}`,
  );
} finally {
  await client.end();
}
