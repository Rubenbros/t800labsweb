/**
 * Datos de prueba deterministas del presupuesto por audio: una tarifa pequeña
 * propia (las pruebas no dependen de los precios de la tarifa de ejemplo) y el
 * dictado que devolvería la IA para el audio del vídeo T2.
 */
import { FUERA_DE_TARIFA, type Dictado } from "@/lib/presupuestos/dominio/dictado";
import type { Empresa } from "@/lib/presupuestos/dominio/empresa";
import { cargarTarifa } from "@/lib/presupuestos/dominio/tarifa";

export const TARIFA_PRUEBA = cargarTarifa({
  nombre: "Tarifa de prueba",
  vigencia: "2026",
  moneda: "EUR",
  partidas: [
    { codigo: "DEM-01", capitulo: "Demoliciones y desmontajes", descripcion: "Desmontaje de bañera", unidad: "ud", precio: 120, sinonimos: ["quitar la bañera"] },
    { codigo: "FON-02", capitulo: "Fontanería", descripcion: "Plato de ducha de resina de 101 a 140 cm, suministro y colocación", unidad: "ud", precio: 395.5 },
    { codigo: "ALI-01", capitulo: "Alicatados y solados", descripcion: "Alicatado con azulejo cerámico gama media, suministro y colocación", unidad: "m2", precio: 42.35 },
    { codigo: "SAN-03", capitulo: "Sanitarios y grifería", descripcion: "Sustitución de lavabo con pedestal", unidad: "ud", precio: 210 },
    { codigo: "RES-01", capitulo: "Gestión de residuos", descripcion: "Contenedor de escombros", unidad: "ud", precio: 180 },
  ],
});

export const EMPRESA_PRUEBA: Empresa = {
  nombre: "Reformas Prueba",
  subtitulo: "Empresa ficticia · Datos de ejemplo",
  datosDeEjemplo: true,
  ivaPorcentaje: 21,
  validezDias: 30,
  condiciones: ["Precios sin IVA."],
};

export const TRANSCRIPCION_T2 =
  "Baño de cinco metros: quitar la bañera, plato de ducha de 120, alicatar hasta el techo y cambiar el lavabo.";

/** Lo que la IA devuelve para el audio del vídeo T2 (simulado). */
export function dictadoT2(): Dictado {
  return {
    transcripcion: TRANSCRIPCION_T2,
    esPresupuesto: true,
    titulo: "Reforma de baño (5 m²)",
    cliente: null,
    ubicacion: null,
    partidas: [
      { codigoTarifa: "DEM-01", concepto: "quitar la bañera", cantidad: 1, unidad: "ud", medicion: "dicha", notaMedicion: null, estimacion: null },
      { codigoTarifa: "FON-02", concepto: "plato de ducha de 120", cantidad: 1, unidad: "ud", medicion: "dicha", notaMedicion: null, estimacion: null },
      {
        codigoTarifa: "ALI-01",
        concepto: "alicatar hasta el techo",
        // La IA no calcula: dice qué se mide y la cuenta la hace medicion.ts (→ 21 m²).
        cantidad: null,
        unidad: "m2",
        medicion: "estimada",
        notaMedicion: null,
        estimacion: { tipo: "paredes", estancia: "baño", superficieSuelo: 5, alturaTecho: null },
      },
      { codigoTarifa: "SAN-03", concepto: "cambiar el lavabo", cantidad: 1, unidad: "ud", medicion: "dicha", notaMedicion: null, estimacion: null },
    ],
    sugerencias: [
      { codigoTarifa: "RES-01", concepto: "Contenedor de escombros", motivo: "Sale escombro de la bañera y del alicatado." },
      { codigoTarifa: FUERA_DE_TARIFA, concepto: "Mampara de ducha a medida", motivo: "Con plato de ducha suele ir mampara." },
      { codigoTarifa: "DEM-01", concepto: "Desmontaje de bañera", motivo: "Repetida: ya está en partidas." },
    ],
    avisos: ["No se dice si hay que picar el alicatado actual."],
  };
}

/** Bytes mínimos que pasan por una nota de voz OGG/Opus (cabecera real + relleno). */
export function oggFalso(tamano = 4_000): Uint8Array<ArrayBuffer> {
  const b = new Uint8Array(tamano);
  b.set([0x4f, 0x67, 0x67, 0x53]); // "OggS"
  return b;
}
