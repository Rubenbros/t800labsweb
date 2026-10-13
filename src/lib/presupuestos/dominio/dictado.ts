/**
 * DICTADO: lo que la IA entiende de un audio (o de un texto) del dueño, ya
 * estructurado. NO lleva precios: solo qué trabajos ha dicho, con qué código de
 * la tarifa casa cada uno y cuánto mide. El precio lo pone `presupuesto.ts`.
 *
 * Módulo puro: esquema de validación (zod) + esquema de salida para el modelo.
 */
import { z } from "zod";
import { TIPOS_ESTIMACION } from "./medicion";
import { UNIDADES } from "./tarifa";

/** Código que usa la IA cuando un trabajo no está en la tarifa (sale «precio pendiente»). */
export const FUERA_DE_TARIFA = "FUERA_DE_TARIFA";

export const MEDICIONES = ["dicha", "estimada", "pendiente"] as const;
export type Medicion = (typeof MEDICIONES)[number];

const texto = (max: number) => z.string().trim().max(max);

export const partidaDictadaSchema = z.object({
  codigoTarifa: texto(20),
  /** Cómo lo describiría el presupuesto si no está en la tarifa; si está, lo que dijo el dueño. */
  concepto: texto(200).min(2),
  /** `null` cuando no se puede saber sin medir (sale «medición pendiente»). */
  cantidad: z.number().positive().max(100_000).nullable(),
  unidad: z.enum(UNIDADES),
  /** dicha = la dijo el dueño; estimada = la deduce la IA (explica cómo); pendiente = hay que medir. */
  medicion: z.enum(MEDICIONES),
  notaMedicion: texto(240).nullable(),
  /** Qué hay que medir cuando la cantidad se deduce de la superficie de una estancia (la cuenta la hace el código). */
  estimacion: z
    .object({
      tipo: z.enum(TIPOS_ESTIMACION),
      estancia: texto(40).nullable(),
      superficieSuelo: z.number().positive().max(2_000).nullable(),
      alturaTecho: z.number().positive().max(10).nullable(),
    })
    .nullable()
    .default(null),
});

export type PartidaDictada = z.infer<typeof partidaDictadaSchema>;

export const sugerenciaSchema = z.object({
  codigoTarifa: texto(20),
  concepto: texto(200).min(2),
  motivo: texto(200),
});

export type Sugerencia = z.infer<typeof sugerenciaSchema>;

export const dictadoSchema = z.object({
  transcripcion: texto(5000),
  /** `false` si el audio no describe trabajos (vacío, ininteligible, otra cosa). */
  esPresupuesto: z.boolean(),
  titulo: texto(100),
  cliente: texto(100).nullable(),
  ubicacion: texto(140).nullable(),
  partidas: z.array(partidaDictadaSchema).max(40),
  sugerencias: z.array(sugerenciaSchema).max(8),
  avisos: z.array(texto(240)).max(6),
});

export type Dictado = z.infer<typeof dictadoSchema>;

/**
 * Esquema de salida estructurada para Gemini (subconjunto OpenAPI de Vertex).
 * `codigosTarifa` restringe los códigos a los de la tarifa + FUERA_DE_TARIFA,
 * así el modelo no puede inventarse uno. El orden de propiedades pone primero la
 * transcripción: el modelo escribe lo que oye antes de interpretarlo.
 */
export function esquemaDeSalida(codigosTarifa: readonly string[]): Record<string, unknown> {
  const codigo = { type: "string", enum: [...codigosTarifa, FUERA_DE_TARIFA] };
  const textoNullable = { type: "string", nullable: true };
  return {
    type: "object",
    properties: {
      transcripcion: { type: "string" },
      esPresupuesto: { type: "boolean" },
      titulo: { type: "string" },
      cliente: textoNullable,
      ubicacion: textoNullable,
      partidas: {
        type: "array",
        items: {
          type: "object",
          properties: {
            codigoTarifa: codigo,
            concepto: { type: "string" },
            cantidad: { type: "number", nullable: true },
            unidad: { type: "string", enum: [...UNIDADES] },
            medicion: { type: "string", enum: [...MEDICIONES] },
            notaMedicion: textoNullable,
            estimacion: {
              type: "object",
              properties: {
                tipo: { type: "string", enum: [...TIPOS_ESTIMACION] },
                estancia: textoNullable,
                superficieSuelo: { type: "number", nullable: true },
                alturaTecho: { type: "number", nullable: true },
              },
              required: ["tipo", "estancia", "superficieSuelo", "alturaTecho"],
              propertyOrdering: ["tipo", "estancia", "superficieSuelo", "alturaTecho"],
            },
          },
          required: ["codigoTarifa", "concepto", "cantidad", "unidad", "medicion", "notaMedicion", "estimacion"],
          propertyOrdering: ["concepto", "codigoTarifa", "unidad", "medicion", "estimacion", "cantidad", "notaMedicion"],
        },
      },
      sugerencias: {
        type: "array",
        items: {
          type: "object",
          properties: {
            codigoTarifa: codigo,
            concepto: { type: "string" },
            motivo: { type: "string" },
          },
          required: ["codigoTarifa", "concepto", "motivo"],
          propertyOrdering: ["concepto", "codigoTarifa", "motivo"],
        },
      },
      avisos: { type: "array", items: { type: "string" } },
    },
    required: [
      "transcripcion",
      "esPresupuesto",
      "titulo",
      "cliente",
      "ubicacion",
      "partidas",
      "sugerencias",
      "avisos",
    ],
    propertyOrdering: [
      "transcripcion",
      "esPresupuesto",
      "titulo",
      "cliente",
      "ubicacion",
      "partidas",
      "sugerencias",
      "avisos",
    ],
  };
}

/** Valida la salida del modelo. Lanza `DictadoInvalido` con el detalle si no casa. */
export function validarDictado(datos: unknown): Dictado {
  const r = dictadoSchema.safeParse(datos);
  if (!r.success) {
    throw new DictadoInvalido(r.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  return r.data;
}

export class DictadoInvalido extends Error {
  constructor(detalle: string) {
    super(`La respuesta del modelo no tiene la forma esperada: ${detalle}`);
    this.name = "DictadoInvalido";
  }
}
