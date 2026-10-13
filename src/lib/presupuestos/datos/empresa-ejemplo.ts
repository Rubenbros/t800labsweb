import { empresaSchema, type Empresa } from "../dominio/empresa";

/**
 * Empresa FICTICIA de la demo (vídeo T2 de T800 Labs). No existe: el nombre es
 * genérico a propósito y no lleva NIF, dirección ni teléfono para no parecerse
 * a ninguna real. El PDF dice «Empresa ficticia · Datos de ejemplo».
 *
 * IVA: 21 % (tipo general). En obras de renovación de vivienda para un
 * particular puede aplicar el 10 % (art. 91.Uno.2.10.º de la Ley 37/1992 del
 * IVA) si se cumplen sus requisitos; eso lo decide cada empresa en su
 * configuración, nunca la IA.
 */
export const EMPRESA_EJEMPLO: Empresa = empresaSchema.parse({
  nombre: "Reformas Ejemplo",
  subtitulo: "Empresa ficticia · Datos de ejemplo",
  datosDeEjemplo: true,
  ivaPorcentaje: 21,
  validezDias: 30,
  condiciones: [
    "Precios sin IVA. El IVA se aplica al tipo indicado en el resumen.",
    "Las mediciones marcadas como estimadas se confirman en obra antes de empezar.",
    "Forma de pago: 40 % al aceptar, 40 % a mitad de obra y 20 % al terminar.",
    "No incluye licencias ni tasas municipales salvo que figuren como partida.",
  ],
});
