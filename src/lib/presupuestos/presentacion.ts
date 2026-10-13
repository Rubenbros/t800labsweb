/**
 * Presentación del borrador fuera del PDF: el resumen que pinta la web y el
 * texto que acompaña al PDF en un chat. Sin dependencias de datos ni de red.
 */
import {
  formatearCantidad,
  formatearEuros,
  TEXTO_MOTIVO,
  type Presupuesto,
} from "./dominio/presupuesto";
import { ETIQUETA_UNIDAD } from "./dominio/tarifa";

/** Resumen serializable para la web (sin la transcripción completa ni datos internos). */
export interface ResumenBorrador {
  numero: string;
  titulo: string;
  datosDeEjemplo: boolean;
  lineas: Array<{
    numero: number;
    descripcion: string;
    cantidad: string | null;
    unidad: string;
    estimada: boolean;
    importe: string | null;
    pendiente: string | null;
  }>;
  base: string;
  iva: string;
  ivaPorcentaje: number;
  total: string;
  pendientes: number;
  transcripcion: string;
}

export function resumir(p: Presupuesto): ResumenBorrador {
  return {
    numero: p.numero,
    titulo: p.titulo,
    datosDeEjemplo: p.empresa.datosDeEjemplo,
    lineas: p.lineas.map((l) => ({
      numero: l.numero,
      descripcion: l.descripcion,
      cantidad: l.cantidad === null ? null : formatearCantidad(l.cantidad),
      unidad: ETIQUETA_UNIDAD[l.unidad],
      estimada: l.medicion === "estimada",
      importe: l.importeCent === null ? null : formatearEuros(l.importeCent),
      pendiente: l.pendiente ? TEXTO_MOTIVO[l.pendiente] : null,
    })),
    base: formatearEuros(p.baseImponibleCent),
    iva: formatearEuros(p.cuotaIvaCent),
    ivaPorcentaje: p.ivaPorcentaje,
    total: formatearEuros(p.totalCent),
    pendientes: p.lineasPendientes,
    transcripcion: p.transcripcion,
  };
}

/** Texto corto que acompaña al PDF en un chat (Telegram). Sin formato: no hay que escapar nada. */
export function textoDeAcompanamiento(p: Presupuesto): string {
  const partidas = p.lineas.length === 1 ? "1 partida" : `${p.lineas.length} partidas`;
  const lineas = [
    `Borrador listo: ${p.titulo}`,
    `${partidas} · ${formatearEuros(p.baseImponibleCent)} + IVA ${p.ivaPorcentaje} % = ${formatearEuros(p.totalCent)}`,
  ];
  if (p.lineasPendientes > 0) {
    lineas.push(
      p.lineasPendientes === 1 ? "1 partida con precio pendiente (no sumada)." : `${p.lineasPendientes} partidas con precio pendiente (no sumadas).`,
    );
  }
  lineas.push("Revísalo antes de enviarlo: no sale solo al cliente.");
  if (p.empresa.datosDeEjemplo) lineas.push("Datos de ejemplo.");
  return lineas.join("\n");
}
