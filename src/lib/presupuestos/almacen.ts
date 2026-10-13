/**
 * Persistencia del presupuesto por audio: cupos diarios (para que nadie dispare
 * costes de IA), chats de Telegram autorizados, actualizaciones ya procesadas
 * (Telegram reintenta si no contestamos a tiempo) y un registro de cada borrador
 * con sus tiempos y su coste, que es la fuente de la cifra que se dice en vídeo.
 *
 * Producción: Cloud SQL (tablas en db/schema.sql). Sin DATABASE_URL (local o
 * pruebas): en memoria.
 */
import { getPool, isDatabaseConfigured } from "@/lib/db";

export interface RegistroBorrador {
  canal: "web" | "telegram";
  ok: boolean;
  error?: string | null;
  msTotal: number;
  msIa?: number | null;
  msPdf?: number | null;
  modelo?: string | null;
  tokensEntrada?: number | null;
  tokensSalida?: number | null;
  costeUsd?: number | null;
  lineas?: number | null;
  pendientes?: number | null;
}

export interface AlmacenPresupuestos {
  /** Suma 1 a cada clave del día y devuelve los valores ya incrementados. Atómico por clave. */
  incrementarUso(dia: string, claves: string[]): Promise<Map<string, number>>;
  autorizarChat(chatId: number): Promise<void>;
  chatAutorizado(chatId: number): Promise<boolean>;
  /** `true` si la actualización es nueva (y la marca); `false` si ya se había visto. */
  marcarActualizacion(updateId: number): Promise<boolean>;
  registrar(r: RegistroBorrador): Promise<void>;
}

export class AlmacenEnMemoria implements AlmacenPresupuestos {
  readonly uso = new Map<string, number>();
  readonly chats = new Set<number>();
  readonly actualizaciones = new Set<number>();
  readonly registros: RegistroBorrador[] = [];

  async incrementarUso(dia: string, claves: string[]): Promise<Map<string, number>> {
    const out = new Map<string, number>();
    for (const c of claves) {
      const k = `${dia}|${c}`;
      const n = (this.uso.get(k) ?? 0) + 1;
      this.uso.set(k, n);
      out.set(c, n);
    }
    return out;
  }
  async autorizarChat(chatId: number): Promise<void> {
    this.chats.add(chatId);
  }
  async chatAutorizado(chatId: number): Promise<boolean> {
    return this.chats.has(chatId);
  }
  async marcarActualizacion(updateId: number): Promise<boolean> {
    if (this.actualizaciones.has(updateId)) return false;
    this.actualizaciones.add(updateId);
    return true;
  }
  async registrar(r: RegistroBorrador): Promise<void> {
    this.registros.push(r);
  }
}

export class AlmacenPostgres implements AlmacenPresupuestos {
  private pool() {
    const p = getPool();
    if (!p) throw new Error("DATABASE_URL no está configurada");
    return p;
  }

  async incrementarUso(dia: string, claves: string[]): Promise<Map<string, number>> {
    const { rows } = await this.pool().query<{ clave: string; n: number }>(
      `INSERT INTO presupuesto_uso_diario (dia, clave, n)
       SELECT $1::date, c, 1 FROM unnest($2::text[]) AS c
       ON CONFLICT (dia, clave) DO UPDATE SET n = presupuesto_uso_diario.n + 1
       RETURNING clave, n`,
      [dia, claves],
    );
    return new Map(rows.map((r) => [r.clave, Number(r.n)]));
  }

  async autorizarChat(chatId: number): Promise<void> {
    await this.pool().query(
      `INSERT INTO presupuesto_telegram_chats (chat_id) VALUES ($1) ON CONFLICT (chat_id) DO NOTHING`,
      [chatId],
    );
  }

  async chatAutorizado(chatId: number): Promise<boolean> {
    const { rowCount } = await this.pool().query(`SELECT 1 FROM presupuesto_telegram_chats WHERE chat_id = $1`, [chatId]);
    return (rowCount ?? 0) > 0;
  }

  async marcarActualizacion(updateId: number): Promise<boolean> {
    const { rowCount } = await this.pool().query(
      `INSERT INTO presupuesto_telegram_updates (update_id) VALUES ($1) ON CONFLICT (update_id) DO NOTHING`,
      [updateId],
    );
    return (rowCount ?? 0) > 0;
  }

  async registrar(r: RegistroBorrador): Promise<void> {
    await this.pool().query(
      `INSERT INTO presupuesto_registro
         (canal, ok, error, ms_total, ms_ia, ms_pdf, modelo, tokens_entrada, tokens_salida, coste_usd, lineas, pendientes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        r.canal,
        r.ok,
        r.error?.slice(0, 500) ?? null,
        Math.round(r.msTotal),
        r.msIa ?? null,
        r.msPdf ?? null,
        r.modelo ?? null,
        r.tokensEntrada ?? null,
        r.tokensSalida ?? null,
        r.costeUsd ?? null,
        r.lineas ?? null,
        r.pendientes ?? null,
      ],
    );
  }
}

let almacen: AlmacenPresupuestos | null = null;

export function almacenPorDefecto(): AlmacenPresupuestos {
  if (!almacen) {
    if (!isDatabaseConfigured() && process.env.NODE_ENV === "production") {
      // En producción sin base de datos los cupos no se compartirían entre instancias.
      console.error("[presupuestos] sin DATABASE_URL en producción: cupos en memoria por instancia");
    }
    almacen = isDatabaseConfigured() ? new AlmacenPostgres() : new AlmacenEnMemoria();
  }
  return almacen;
}

/** Registro sin romper el flujo si la base de datos falla (el borrador ya está hecho). */
export async function registrarSinFallar(a: AlmacenPresupuestos, r: RegistroBorrador): Promise<void> {
  try {
    await a.registrar(r);
  } catch (err) {
    console.error("[presupuestos] no se pudo registrar el borrador:", err instanceof Error ? err.message : err);
  }
}
