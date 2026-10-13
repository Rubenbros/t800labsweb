import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { AlmacenPostgres as TipoAlmacen } from "@/lib/presupuestos/almacen";

/**
 * Integración contra Postgres real (en la CI, el Postgres efímero del build; en
 * local, el proxy de Cloud SQL). Solo con `DATABASE_URL_TEST`. Usa un esquema
 * propio que se crea y se borra.
 */
const TEST_URL = process.env.DATABASE_URL_TEST;
const SCHEMA = "t800_itest_presupuestos";

function withSchema(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}options=-c%20search_path%3D${SCHEMA}`;
}

describe.skipIf(!TEST_URL)("almacén del presupuesto por audio en Postgres", () => {
  let almacen: TipoAlmacen;
  let closePool: () => Promise<void>;

  beforeAll(async () => {
    const admin = new Client({ connectionString: TEST_URL });
    await admin.connect();
    try {
      await admin.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
      await admin.query(`CREATE SCHEMA ${SCHEMA}`);
      await admin.query(`SET search_path TO ${SCHEMA}`);
      await admin.query(await readFile(path.join(process.cwd(), "db", "schema.sql"), "utf8"));
    } finally {
      await admin.end();
    }
    process.env.DATABASE_URL = withSchema(TEST_URL!);
    closePool = (await import("@/lib/db")).closePool;
    const { AlmacenPostgres } = await import("@/lib/presupuestos/almacen");
    almacen = new AlmacenPostgres();
  });

  afterAll(async () => {
    if (closePool) await closePool();
    delete process.env.DATABASE_URL;
    const admin = new Client({ connectionString: TEST_URL });
    await admin.connect();
    try {
      await admin.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
    } finally {
      await admin.end();
    }
  });

  it("cuenta el uso diario de forma atómica aunque lleguen a la vez", async () => {
    await Promise.all(Array.from({ length: 8 }, () => almacen.incrementarUso("2026-10-17", ["global", "sujeto:web"])));
    const r = await almacen.incrementarUso("2026-10-17", ["global", "sujeto:web"]);
    expect(r.get("global")).toBe(9);
    expect(r.get("sujeto:web")).toBe(9);
    expect((await almacen.incrementarUso("2026-10-18", ["global"])).get("global")).toBe(1);
  });

  it("da de alta chats y marca actualizaciones una sola vez", async () => {
    expect(await almacen.chatAutorizado(123456789012)).toBe(false);
    await almacen.autorizarChat(123456789012);
    await almacen.autorizarChat(123456789012);
    expect(await almacen.chatAutorizado(123456789012)).toBe(true);
    expect(await almacen.marcarActualizacion(1)).toBe(true);
    expect(await almacen.marcarActualizacion(1)).toBe(false);
  });

  it("registra los borradores con sus tiempos y coste", async () => {
    await almacen.registrar({ canal: "web", ok: true, msTotal: 5234.6, msIa: 4800, msPdf: 40, modelo: "gemini-3.5-flash", costeUsd: 0.0123, lineas: 4, pendientes: 0 });
    await almacen.registrar({ canal: "telegram", ok: false, error: "x".repeat(900), msTotal: 100 });
    const c = new Client({ connectionString: withSchema(TEST_URL!) });
    await c.connect();
    try {
      const { rows } = await c.query(`SELECT canal, ok, ms_total, coste_usd, length(error) AS lerror FROM presupuesto_registro ORDER BY id`);
      expect(rows).toEqual([
        { canal: "web", ok: true, ms_total: 5235, coste_usd: "0.012300", lerror: null },
        { canal: "telegram", ok: false, ms_total: 100, coste_usd: null, lerror: 500 },
      ]);
    } finally {
      await c.end();
    }
  });
});
