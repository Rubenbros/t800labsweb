import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Test de integración contra Postgres real. Solo se ejecuta si hay
 * `DATABASE_URL_TEST` (en local, por el Cloud SQL Auth Proxy en 127.0.0.1:5433).
 *
 * Trabaja en un esquema propio (`t800_itest`) que se crea y se borra, para no
 * tocar los datos de la aplicación en la misma base de datos.
 */

const TEST_URL = process.env.DATABASE_URL_TEST;
const SCHEMA = "t800_itest";

function withSchema(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}options=-c%20search_path%3D${SCHEMA}`;
}

let closePool: () => Promise<void>;
let recordShutdown: (t: number) => Promise<{
  totalShutdowns: number;
  avgTime: number;
  fastestTime: number;
  last24h: number;
}>;
let recordVisitor: () => Promise<void>;
let saveDynamicBusiness: (data: unknown) => Promise<void>;
let getDynamicBusiness: (slug: string) => Promise<unknown>;
let dynamicSlugExists: (slug: string) => Promise<boolean>;
let trackDemoVisit: (slug: string) => Promise<void>;

describe.skipIf(!TEST_URL)("integración con Postgres", () => {
  beforeAll(async () => {
    const admin = new Client({ connectionString: TEST_URL });
    await admin.connect();
    try {
      await admin.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
      await admin.query(`CREATE SCHEMA ${SCHEMA}`);
      await admin.query(`SET search_path TO ${SCHEMA}`);
      const schemaSql = await readFile(
        path.join(process.cwd(), "db", "schema.sql"),
        "utf8",
      );
      await admin.query(schemaSql);
    } finally {
      await admin.end();
    }

    process.env.DATABASE_URL = withSchema(TEST_URL!);
    const db = await import("@/lib/db");
    closePool = db.closePool;
    const hal = await import("@/lib/hal-stats");
    recordShutdown = hal.recordShutdown;
    recordVisitor = hal.recordVisitor;
    const demo = await import("@/lib/demo/dynamic-businesses");
    saveDynamicBusiness = demo.saveDynamicBusiness as typeof saveDynamicBusiness;
    getDynamicBusiness = demo.getDynamicBusiness;
    dynamicSlugExists = demo.dynamicSlugExists;
    trackDemoVisit = demo.trackDemoVisit;
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

  it("siembra los contadores y los incrementa de forma persistente", async () => {
    const first = await recordShutdown(30);
    expect(first.totalShutdowns).toBe(2848); // semilla 2847 + 1
    const second = await recordShutdown(30);
    expect(second.totalShutdowns).toBe(2849);
  });

  it("guarda el mejor tiempo cuando se supera", async () => {
    const stats = await recordShutdown(0.5);
    expect(stats.fastestTime).toBe(0.5);
    const next = await recordShutdown(4);
    expect(next.fastestTime).toBe(0.5);
  });

  it("cuenta visitantes", async () => {
    await recordVisitor();
    const client = new Client({ connectionString: TEST_URL });
    await client.connect();
    try {
      const { rows } = await client.query(
        `SELECT value FROM ${SCHEMA}.hal_stats WHERE key = 'visitors'`,
      );
      expect(Number(rows[0].value)).toBe(14204);
    } finally {
      await client.end();
    }
  });

  it("guarda, lee y cuenta visitas de un negocio dinámico", async () => {
    const business = {
      slug: "taller-itest",
      sectorId: "taller",
      businessName: "Taller de prueba",
      address: "Calle Falsa 123",
      phone: "+34 600 000 000",
      email: "taller@example.com",
      rating: 4.5,
      reviewCount: 0,
      hours: { lunes: "9-18" },
      reviews: [],
    };

    expect(await dynamicSlugExists("taller-itest")).toBe(false);
    await saveDynamicBusiness(business);
    expect(await dynamicSlugExists("taller-itest")).toBe(true);
    expect(await getDynamicBusiness("taller-itest")).toEqual(business);
    expect(await getDynamicBusiness("no-existe")).toBeNull();

    await trackDemoVisit("taller-itest");
    await trackDemoVisit("taller-itest");

    const client = new Client({ connectionString: TEST_URL });
    await client.connect();
    try {
      const { rows } = await client.query(
        `SELECT visits FROM ${SCHEMA}.demo_businesses WHERE slug = 'taller-itest'`,
      );
      expect(rows[0].visits).toBe(2);
    } finally {
      await client.end();
    }
  });

  it("sobrescribe la ficha al volver a guardar el mismo slug", async () => {
    const business = {
      slug: "taller-itest",
      sectorId: "taller",
      businessName: "Taller renombrado",
      address: "Calle Falsa 123",
      phone: "+34 600 000 000",
      email: "taller@example.com",
      rating: 5,
      reviewCount: 1,
      hours: { lunes: "9-18" },
      reviews: [],
    };
    await saveDynamicBusiness(business);
    expect(await getDynamicBusiness("taller-itest")).toEqual(business);
  });
});
