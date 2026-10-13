/**
 * EMPRESA que presupuesta: lo que el dueño configura una vez (nombre, IVA,
 * validez, condiciones). En la demo es una empresa ficticia y lo dice.
 */
import { z } from "zod";

export const empresaSchema = z.object({
  nombre: z.string().min(1).max(80),
  /** Segunda línea bajo el nombre (actividad, o el aviso de empresa ficticia). */
  subtitulo: z.string().max(120).optional(),
  /** `true` en la demo: el PDF lleva «Datos de ejemplo» de forma visible. */
  datosDeEjemplo: z.boolean(),
  /** Tipo de IVA que aplica la empresa a sus presupuestos. Lo decide ella, no la IA. */
  ivaPorcentaje: z.number().min(0).max(30),
  validezDias: z.number().int().min(1).max(365),
  condiciones: z.array(z.string().min(1).max(240)).max(8),
});

export type Empresa = z.infer<typeof empresaSchema>;
