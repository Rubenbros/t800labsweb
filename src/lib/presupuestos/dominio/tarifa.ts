/**
 * TARIFA del negocio: el catálogo de partidas con su precio, que es lo ÚNICO de
 * donde sale un precio en un presupuesto. La IA nunca da precios: elige un
 * código de esta lista (o dice que no está) y el precio lo pone este módulo.
 *
 * Módulo puro (sin red ni SDK).
 */
import { z } from "zod";

export const UNIDADES = ["m2", "ml", "ud", "h", "pa"] as const;
export type Unidad = (typeof UNIDADES)[number];

/** Cómo se escribe cada unidad en un presupuesto. */
export const ETIQUETA_UNIDAD: Record<Unidad, string> = {
  m2: "m²",
  ml: "m",
  ud: "ud",
  h: "h",
  pa: "P.A.",
};

/** Nombre largo de la unidad, para el catálogo que lee la IA. */
export const NOMBRE_UNIDAD: Record<Unidad, string> = {
  m2: "metro cuadrado",
  ml: "metro lineal",
  ud: "unidad",
  h: "hora",
  pa: "partida alzada",
};

export const CODIGO_PARTIDA_RE = /^[A-Z]{3}-\d{2}$/;

export const partidaTarifaSchema = z.object({
  codigo: z.string().regex(CODIGO_PARTIDA_RE),
  capitulo: z.string().min(1).max(60),
  descripcion: z.string().min(3).max(160),
  unidad: z.enum(UNIDADES),
  /** Euros SIN IVA. */
  precio: z.number().positive().max(100_000),
  incluye: z.string().max(200).optional(),
  sinonimos: z.array(z.string().min(2).max(80)).max(10).default([]),
});

export type PartidaTarifa = z.infer<typeof partidaTarifaSchema>;

export const tarifaSchema = z
  .object({
    nombre: z.string().min(1).max(80),
    vigencia: z.string().min(1).max(20),
    moneda: z.literal("EUR"),
    partidas: z.array(partidaTarifaSchema).min(1).max(500),
  })
  .superRefine((tarifa, ctx) => {
    const vistos = new Set<string>();
    for (const [i, p] of tarifa.partidas.entries()) {
      if (vistos.has(p.codigo)) {
        ctx.addIssue({
          code: "custom",
          path: ["partidas", i, "codigo"],
          message: `Código repetido: ${p.codigo}`,
        });
      }
      vistos.add(p.codigo);
      if (Math.round(p.precio * 100) / 100 !== p.precio) {
        ctx.addIssue({
          code: "custom",
          path: ["partidas", i, "precio"],
          message: `Precio con más de 2 decimales: ${p.precio}`,
        });
      }
    }
  });

export type Tarifa = z.infer<typeof tarifaSchema>;

/** Valida una tarifa que viene de fuera (fichero, hoja del cliente). Lanza si no es válida. */
export function cargarTarifa(datos: unknown): Tarifa {
  return tarifaSchema.parse(datos);
}

export function buscarPartida(tarifa: Tarifa, codigo: string): PartidaTarifa | undefined {
  return tarifa.partidas.find((p) => p.codigo === codigo);
}

/** Precio en céntimos (entero) para no arrastrar errores de coma flotante. */
export function precioEnCentimos(partida: PartidaTarifa): number {
  return Math.round(partida.precio * 100);
}
