import { Pool, type QueryResult, type QueryResultRow } from "pg";

/**
 * Acceso a Cloud SQL (PostgreSQL) con pool perezoso.
 *
 * El pool NO se crea al importar el módulo: así el build de Next (y el
 * Dockerfile) no necesitan una `DATABASE_URL` falsa. La instancia es
 * compartida entre varias apps, por eso el pool es pequeño.
 *
 * Formatos válidos de `DATABASE_URL`:
 *  - local (Cloud SQL Auth Proxy): postgresql://user:pass@127.0.0.1:5433/db
 *  - Cloud Run (socket unix):      postgresql://user:pass@localhost/db?host=/cloudsql/PROJECT:REGION:INSTANCE
 */

const MAX_POOL_SIZE = 3;

let pool: Pool | null = null;
let poolUrl: string | null = null;

/** `true` si hay `DATABASE_URL` configurada (si no, los módulos degradan). */
export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Pool compartido, o `null` si no hay `DATABASE_URL`. */
export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  // Si la URL cambia (tests), se descarta el pool anterior.
  if (pool && poolUrl !== url) {
    const previous = pool;
    pool = null;
    void previous.end().catch(() => {});
  }

  if (!pool) {
    poolUrl = url;
    pool = new Pool({
      connectionString: url,
      max: MAX_POOL_SIZE,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
      // Sin SSL: el proxy y el socket de Cloud SQL ya cifran el tráfico.
    });
    // Sin este manejador, un error de un cliente ocioso tumba el proceso.
    pool.on("error", (err) => {
      console.error("[db] error en cliente ocioso del pool:", err.message);
    });
  }

  return pool;
}

/** Pool obligatorio: lanza si falta `DATABASE_URL`. */
export function requirePool(): Pool {
  const p = getPool();
  if (!p) throw new Error("DATABASE_URL no está configurada");
  return p;
}

/** Consulta parametrizada contra el pool obligatorio. */
export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: readonly unknown[],
): Promise<QueryResult<T>> {
  return requirePool().query<T>(text, params as unknown[]);
}

/** Cierra el pool (tests y scripts; en Cloud Run no hace falta). */
export async function closePool(): Promise<void> {
  if (!pool) return;
  const previous = pool;
  pool = null;
  poolUrl = null;
  await previous.end();
}
