/**
 * Caso de uso: «el dueño manda un audio (o un texto) y recibe el borrador en PDF».
 * Orquesta dictado (IA) → presupuesto (determinista, precios de la tarifa) → PDF,
 * y mide cada tramo. Los canales (web, Telegram) solo adaptan entrada y salida.
 */
import { EMPRESA_EJEMPLO } from "./datos/empresa-ejemplo";
import { TARIFA_EJEMPLO } from "./datos/tarifa";
import type { Empresa } from "./dominio/empresa";
import { construirPresupuesto, numeroDeBorrador, type Presupuesto } from "./dominio/presupuesto";
import type { Tarifa } from "./dominio/tarifa";
import { dictar, type EntradaDictado, type ResultadoDictado } from "./ia/dictar";
import { nombreDeArchivo, renderizarPresupuestoPdf } from "./pdf/presupuesto-pdf";

export interface DependenciasBorrador {
  dictar: (entrada: EntradaDictado, tarifa: Tarifa) => Promise<ResultadoDictado>;
  tarifa: Tarifa;
  empresa: Empresa;
  ahora: () => Date;
  reloj: () => number;
  numero: (fecha: Date) => string;
}

export function dependenciasDeBorrador(): DependenciasBorrador {
  return {
    dictar: (entrada, tarifa) => dictar(entrada, tarifa),
    tarifa: TARIFA_EJEMPLO,
    empresa: EMPRESA_EJEMPLO,
    ahora: () => new Date(),
    reloj: () => performance.now(),
    numero: (fecha) => numeroDeBorrador(fecha),
  };
}

export interface Borrador {
  presupuesto: Presupuesto;
  pdf: Uint8Array;
  nombreArchivo: string;
  tiempos: { iaMs: number; pdfMs: number; totalMs: number };
  ia: Pick<ResultadoDictado, "modelo" | "uso" | "intentos">;
}

export async function generarBorrador(
  entrada: EntradaDictado,
  deps: DependenciasBorrador = dependenciasDeBorrador(),
): Promise<Borrador> {
  const t0 = deps.reloj();
  const r = await deps.dictar(entrada, deps.tarifa);
  const t1 = deps.reloj();
  const fecha = deps.ahora();
  const presupuesto = construirPresupuesto(r.dictado, deps.tarifa, deps.empresa, { numero: deps.numero(fecha), fecha });
  const pdf = await renderizarPresupuestoPdf(presupuesto);
  const t2 = deps.reloj();
  return {
    presupuesto,
    pdf,
    nombreArchivo: nombreDeArchivo(presupuesto),
    tiempos: { iaMs: Math.round(t1 - t0), pdfMs: Math.round(t2 - t1), totalMs: Math.round(t2 - t0) },
    ia: { modelo: r.modelo, uso: r.uso, intentos: r.intentos },
  };
}
