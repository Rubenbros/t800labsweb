/**
 * MEDICIONES ESTIMADAS, calculadas aquí y no por la IA (los modelos se
 * equivocan con la aritmética). La IA solo dice qué se mide («paredes de un
 * baño de 5 m²») y este módulo hace la cuenta con supuestos fijos y escritos:
 *  - planta rectangular de proporción 5:4 con la superficie dicha;
 *  - altura de techo 2,50 m si no se dice;
 *  - una puerta de 0,80 × 2,00 m (1,6 m² de pared, 0,8 m de perímetro);
 *  - sin ventanas; se redondea hacia arriba al entero.
 * El PDF enseña la cuenta para que el dueño la corrija si su obra es distinta.
 */
import type { Unidad } from "./tarifa";

export const TIPOS_ESTIMACION = ["ninguna", "paredes", "suelo", "techo", "perimetro"] as const;
export type TipoEstimacion = (typeof TIPOS_ESTIMACION)[number];

export interface Estimacion {
  tipo: TipoEstimacion;
  estancia: string | null;
  superficieSuelo: number | null;
  alturaTecho: number | null;
}

export const ALTURA_POR_DEFECTO = 2.5;
const PUERTA = { ancho: 0.8, alto: 2 };
const PROPORCION = 5 / 4;

/** Unidad que produce cada tipo de estimación. */
export const UNIDAD_DE_ESTIMACION: Record<Exclude<TipoEstimacion, "ninguna">, Unidad> = {
  paredes: "m2",
  suelo: "m2",
  techo: "m2",
  perimetro: "ml",
};

const num = (n: number, decimales = 2) =>
  n
    .toFixed(decimales)
    .replace(/\.?0+$/, "")
    .replace(".", ",");

export interface MedicionCalculada {
  cantidad: number;
  unidad: Unidad;
  nota: string;
}

/** Calcula la medición o devuelve `null` si no hay datos para hacerlo. */
export function calcularMedicion(e: Estimacion): MedicionCalculada | null {
  if (e.tipo === "ninguna") return null;
  const s = e.superficieSuelo;
  if (s === null || !Number.isFinite(s) || s <= 0 || s > 2_000) return null;
  const altura = e.alturaTecho && e.alturaTecho >= 1.8 && e.alturaTecho <= 6 ? e.alturaTecho : ALTURA_POR_DEFECTO;
  const nombre = e.estancia?.trim() ? e.estancia.trim().charAt(0).toUpperCase() + e.estancia.trim().slice(1) : "Estancia";
  const largo = Math.sqrt(s * PROPORCION);
  const ancho = Math.sqrt(s / PROPORCION);
  const perimetro = 2 * (largo + ancho);
  const planta = `${nombre} de ${num(s)} m² (${num(largo)} × ${num(ancho)} m)`;
  const unidad = UNIDAD_DE_ESTIMACION[e.tipo];

  switch (e.tipo) {
    case "suelo":
    case "techo":
      return { cantidad: Math.ceil(s), unidad, nota: `${planta}: ${num(s)} m² de ${e.tipo}, redondeado a ${Math.ceil(s)} m²` };
    case "perimetro": {
      const ml = perimetro - PUERTA.ancho;
      return {
        cantidad: Math.ceil(ml),
        unidad,
        nota: `${planta}: perímetro ${num(perimetro, 1)} m − ${num(PUERTA.ancho)} m de puerta = ${num(ml, 1)} m, redondeado a ${Math.ceil(ml)} m`,
      };
    }
    case "paredes": {
      const bruto = perimetro * altura;
      const neto = bruto - PUERTA.ancho * PUERTA.alto;
      return {
        cantidad: Math.ceil(neto - 1e-9),
        unidad,
        nota:
          `${planta}: perímetro ${num(perimetro, 1)} m × ${num(altura)} m de alto` +
          ` − ${num(PUERTA.ancho * PUERTA.alto)} m² de puerta = ${num(neto, 1)} m², redondeado a ${Math.ceil(neto - 1e-9)} m²`,
      };
    }
  }
}
