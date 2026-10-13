/**
 * PRESUPUESTO (borrador): se construye de forma determinista a partir del
 * dictado y la tarifa. Reglas (invariantes):
 *  - Un precio solo sale de la tarifa. Si el trabajo no está en la tarifa, la
 *    línea va con «precio pendiente» y no suma.
 *  - Si la unidad dictada no es la de la tarifa, no se convierte: la línea va
 *    con precio pendiente y el motivo, para que lo revise el dueño.
 *  - Sin cantidad (hay que medir) no hay importe: «medición pendiente».
 *  - Las mediciones que se deducen de la superficie de una estancia las calcula
 *    `medicion.ts` (la IA solo dice qué se mide), con la cuenta a la vista.
 *  - El dinero se calcula en céntimos enteros; el IVA, sobre la base, al tipo
 *    que configura la empresa.
 *  - Es siempre un BORRADOR: nadie lo envía al cliente salvo el dueño.
 */
import type { Empresa } from "./empresa";
import { FUERA_DE_TARIFA, type Dictado, type Medicion } from "./dictado";
import { calcularMedicion } from "./medicion";
import { buscarPartida, precioEnCentimos, type Tarifa, type Unidad } from "./tarifa";

export type MotivoPendiente = "fuera-de-tarifa" | "unidad-distinta" | "medicion-pendiente";

export const TEXTO_MOTIVO: Record<MotivoPendiente, string> = {
  "fuera-de-tarifa": "No está en tu tarifa",
  "unidad-distinta": "La unidad no coincide con la de la tarifa",
  "medicion-pendiente": "Falta la medición",
};

export interface LineaPresupuesto {
  numero: number;
  /** Código de la tarifa, o `null` si no está en ella. */
  codigo: string | null;
  capitulo: string | null;
  descripcion: string;
  /** Lo que dijo el dueño, cuando la descripción sale de la tarifa. */
  dicho: string;
  unidad: Unidad;
  cantidad: number | null;
  medicion: Medicion;
  notaMedicion: string | null;
  precioUnitarioCent: number | null;
  importeCent: number | null;
  pendiente: MotivoPendiente | null;
}

export interface SugerenciaPresupuesto {
  codigo: string | null;
  descripcion: string;
  unidad: Unidad | null;
  precioUnitarioCent: number | null;
  motivo: string;
}

export interface Presupuesto {
  numero: string;
  fecha: Date;
  titulo: string;
  cliente: string | null;
  ubicacion: string | null;
  transcripcion: string;
  empresa: Empresa;
  lineas: LineaPresupuesto[];
  sugerencias: SugerenciaPresupuesto[];
  avisos: string[];
  baseImponibleCent: number;
  ivaPorcentaje: number;
  cuotaIvaCent: number;
  totalCent: number;
  lineasPendientes: number;
}

export class NoEsUnPresupuesto extends Error {
  constructor(readonly transcripcion: string) {
    super("El audio no describe trabajos que presupuestar");
    this.name = "NoEsUnPresupuesto";
  }
}

/** Redondea una cantidad a 2 decimales (las mediciones se dan así en obra). */
export function redondearCantidad(cantidad: number): number {
  return Math.round(cantidad * 100) / 100;
}

export function construirPresupuesto(
  dictado: Dictado,
  tarifa: Tarifa,
  empresa: Empresa,
  meta: { numero: string; fecha: Date },
): Presupuesto {
  if (!dictado.esPresupuesto || dictado.partidas.length === 0) {
    throw new NoEsUnPresupuesto(dictado.transcripcion);
  }

  const lineas: LineaPresupuesto[] = dictado.partidas.map((p, i) => {
    const partida = p.codigoTarifa === FUERA_DE_TARIFA ? undefined : buscarPartida(tarifa, p.codigoTarifa);
    const calculada = p.medicion !== "dicha" && p.estimacion ? calcularMedicion(p.estimacion) : null;
    const usarCalculada = calculada !== null && calculada.unidad === p.unidad;
    const cantidadBase = usarCalculada ? calculada.cantidad : p.medicion === "pendiente" ? null : p.cantidad;
    const cantidad = cantidadBase === null ? null : redondearCantidad(cantidadBase);
    const medicion: Medicion = cantidad === null ? "pendiente" : usarCalculada ? "estimada" : p.medicion;
    const notaMedicion = usarCalculada ? calculada.nota : p.notaMedicion;

    let pendiente: MotivoPendiente | null = null;
    if (!partida) pendiente = "fuera-de-tarifa";
    else if (partida.unidad !== p.unidad) pendiente = "unidad-distinta";
    else if (cantidad === null) pendiente = "medicion-pendiente";

    const precioUnitarioCent = partida && pendiente !== "unidad-distinta" ? precioEnCentimos(partida) : null;
    const importeCent =
      pendiente === null && precioUnitarioCent !== null && cantidad !== null
        ? Math.round(cantidad * precioUnitarioCent)
        : null;

    return {
      numero: i + 1,
      codigo: partida?.codigo ?? null,
      capitulo: partida?.capitulo ?? null,
      descripcion: partida?.descripcion ?? p.concepto,
      dicho: p.concepto,
      unidad: partida && pendiente !== "unidad-distinta" ? partida.unidad : p.unidad,
      cantidad,
      medicion,
      notaMedicion,
      precioUnitarioCent,
      importeCent,
      pendiente,
    };
  });

  const codigosEnLineas = new Set(lineas.map((l) => l.codigo).filter(Boolean));
  const sugerencias: SugerenciaPresupuesto[] = dictado.sugerencias
    .filter((s) => s.codigoTarifa === FUERA_DE_TARIFA || !codigosEnLineas.has(s.codigoTarifa))
    .map((s) => {
      const partida = s.codigoTarifa === FUERA_DE_TARIFA ? undefined : buscarPartida(tarifa, s.codigoTarifa);
      return {
        codigo: partida?.codigo ?? null,
        descripcion: partida?.descripcion ?? s.concepto,
        unidad: partida?.unidad ?? null,
        precioUnitarioCent: partida ? precioEnCentimos(partida) : null,
        motivo: s.motivo,
      };
    });

  const baseImponibleCent = lineas.reduce((suma, l) => suma + (l.importeCent ?? 0), 0);
  const cuotaIvaCent = Math.round((baseImponibleCent * empresa.ivaPorcentaje) / 100);

  return {
    numero: meta.numero,
    fecha: meta.fecha,
    titulo: dictado.titulo || "Presupuesto",
    cliente: dictado.cliente,
    ubicacion: dictado.ubicacion,
    transcripcion: dictado.transcripcion,
    empresa,
    lineas,
    sugerencias,
    avisos: dictado.avisos,
    baseImponibleCent,
    ivaPorcentaje: empresa.ivaPorcentaje,
    cuotaIvaCent,
    totalCent: baseImponibleCent + cuotaIvaCent,
    lineasPendientes: lineas.filter((l) => l.pendiente !== null).length,
  };
}

/** «1.234,56 €» (agrupa siempre los miles, como en los presupuestos españoles). */
export function formatearEuros(centimos: number): string {
  const negativo = centimos < 0;
  const abs = Math.abs(Math.round(centimos));
  const enteros = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimales = (abs % 100).toString().padStart(2, "0");
  return `${negativo ? "-" : ""}${enteros},${decimales} €`;
}

/** «21,5» / «3» (sin ceros de sobra, coma decimal). */
export function formatearCantidad(cantidad: number): string {
  const r = redondearCantidad(cantidad);
  const [ent, dec] = r.toFixed(2).split(".");
  const entero = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimal = dec.replace(/0+$/, "");
  return decimal ? `${entero},${decimal}` : entero;
}

/** Fecha corta española en hora de Madrid: «17/10/2026». */
export function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(fecha);
}

/** Número de borrador legible y sin colisiones prácticas: «B-261017-7K3Q». */
export function numeroDeBorrador(fecha: Date, aleatorio: () => number = Math.random): string {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);
  const v = (t: string) => partes.find((p) => p.type === t)?.value ?? "00";
  const alfabeto = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let sufijo = "";
  for (let i = 0; i < 4; i++) sufijo += alfabeto[Math.floor(aleatorio() * alfabeto.length) % alfabeto.length];
  return `B-${v("year")}${v("month")}${v("day")}-${sufijo}`;
}
