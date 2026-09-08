import { isDatabaseConfigured, query } from "@/lib/db";
import type { BusinessData } from "./types";

/**
 * Negocios de demo creados dinámicamente. Postgres NO es caché aquí: la tabla
 * `demo_businesses` es la única persistencia de estas fichas.
 */

export async function getDynamicBusiness(
  slug: string,
): Promise<BusinessData | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const { rows } = await query<{ data: BusinessData }>(
      `SELECT data FROM demo_businesses WHERE slug = $1`,
      [slug],
    );
    return rows[0]?.data ?? null;
  } catch (err) {
    console.error("[demo] getDynamicBusiness falló:", err);
    return null;
  }
}

export async function saveDynamicBusiness(data: BusinessData): Promise<void> {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL no está configurada");
  await query(
    `INSERT INTO demo_businesses (slug, data)
     VALUES ($1, $2::jsonb)
     ON CONFLICT (slug) DO UPDATE
       SET data = EXCLUDED.data, updated_at = now()`,
    [data.slug, JSON.stringify(data)],
  );
}

export async function dynamicSlugExists(slug: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    const { rowCount } = await query(
      `SELECT 1 FROM demo_businesses WHERE slug = $1`,
      [slug],
    );
    return (rowCount ?? 0) > 0;
  } catch (err) {
    console.error("[demo] dynamicSlugExists falló:", err);
    return false;
  }
}

export async function trackDemoVisit(slug: string): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    await query(
      `UPDATE demo_businesses SET visits = visits + 1, updated_at = now()
        WHERE slug = $1`,
      [slug],
    );
  } catch (err) {
    console.error("[demo] trackDemoVisit falló:", err);
  }
}
