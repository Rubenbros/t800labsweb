/**
 * Cupos diarios para que nadie dispare el gasto de IA (BDR de la demo, ver
 * docs/adr/0002). Cada borrador cuenta en el cupo global del día y en el de su
 * sujeto (un chat de Telegram o el código web). El día es el de Madrid.
 *
 * Se cuenta ANTES de llamar a la IA y fallando en cerrado: si la base de datos
 * no contesta, no se genera nada.
 */
import type { AlmacenPresupuestos } from "./almacen";

export interface Limites {
  globalPorDia: number;
  porSujetoPorDia: number;
}

/** 60 borradores al día en total ≈ 0,60 $ de IA como máximo (≤1 céntimo cada uno); de sobra para grabar y enseñar. */
export const LIMITES_POR_DEFECTO: Limites = { globalPorDia: 60, porSujetoPorDia: 30 };

export function limitesDelEntorno(env: Partial<Record<string, string | undefined>> = process.env): Limites {
  const leer = (v: string | undefined, porDefecto: number) => {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 && n <= 10_000 ? n : porDefecto;
  };
  return {
    globalPorDia: leer(env.PRESUPUESTO_LIMITE_GLOBAL_DIA, LIMITES_POR_DEFECTO.globalPorDia),
    porSujetoPorDia: leer(env.PRESUPUESTO_LIMITE_SUJETO_DIA, LIMITES_POR_DEFECTO.porSujetoPorDia),
  };
}

export function diaDeMadrid(ahora: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ahora);
}

export type ResultadoCupo = { ok: true } | { ok: false; motivo: "global" | "sujeto"; mensaje: string };

export async function consumirCupo(
  almacen: AlmacenPresupuestos,
  sujeto: string,
  ahora: Date,
  limites: Limites = limitesDelEntorno(),
): Promise<ResultadoCupo> {
  const claveSujeto = `sujeto:${sujeto}`;
  const usos = await almacen.incrementarUso(diaDeMadrid(ahora), ["global", claveSujeto]);
  if ((usos.get("global") ?? Infinity) > limites.globalPorDia) {
    return { ok: false, motivo: "global", mensaje: "La demo ha llegado a su límite de hoy. Vuelve a probar mañana." };
  }
  if ((usos.get(claveSujeto) ?? Infinity) > limites.porSujetoPorDia) {
    return { ok: false, motivo: "sujeto", mensaje: "Has llegado al límite de borradores de hoy. Vuelve a probar mañana." };
  }
  return { ok: true };
}
