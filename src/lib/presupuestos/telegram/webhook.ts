/**
 * Webhook del bot de Telegram de la demo. Reglas:
 *  - Solo chats privados dados de alta con `/start <código>` (deep link
 *    t.me/<bot>?start=<código>). Al resto se le dice que es una demo privada.
 *  - Cada borrador consume cupo diario ANTES de llamar a la IA.
 *  - Cada actualización se procesa una sola vez (Telegram reintenta si tardamos).
 *  - Se trabaja dentro de la petición (Cloud Run no da CPU después de responder).
 */
import { z } from "zod";
import { codigoValido } from "../acceso";
import { registrarSinFallar, type AlmacenPresupuestos } from "../almacen";
import { AUDIO_MAX_BYTES, AUDIO_MAX_SEGUNDOS, validarAudio, validarTexto } from "../audio";
import { consumirCupo, type Limites } from "../cupos";
import { NoEsUnPresupuesto } from "../dominio/presupuesto";
import type { EntradaDictado } from "../ia/dictar";
import { textoDeAcompanamiento } from "../presentacion";
import type { Borrador } from "../servicio";
import type { BotTelegram } from "./bot-api";

const archivoSchema = z.object({
  file_id: z.string().min(1).max(300),
  file_size: z.number().int().nonnegative().optional(),
  mime_type: z.string().max(100).optional(),
  duration: z.number().nonnegative().optional(),
});

const actualizacionSchema = z.object({
  update_id: z.number().int(),
  message: z
    .object({
      message_id: z.number().int(),
      date: z.number().int(),
      chat: z.object({ id: z.number().int(), type: z.string() }),
      text: z.string().max(5000).optional(),
      voice: archivoSchema.optional(),
      audio: archivoSchema.optional(),
      document: archivoSchema.optional(),
    })
    .optional(),
});

export const MENSAJES = {
  bienvenida:
    "Listo. Mándame un audio contando el trabajo, como si salieras de la visita. Por ejemplo: «Baño de cinco metros: quitar la bañera, plato de ducha de 120, alicatar hasta el techo y cambiar el lavabo». Te devuelvo el borrador del presupuesto en PDF con los precios de la tarifa.\n\nDatos de ejemplo: la empresa y la tarifa son ficticias.",
  privado: "Esta es una demo privada de T800 Labs.",
  ayuda: "Mándame un audio (o escríbeme) con el trabajo que hay que presupuestar y te devuelvo el borrador en PDF.",
  audioLargo: `El audio es demasiado largo: como mucho ${Math.round(AUDIO_MAX_SEGUNDOS / 60)} minutos.`,
  noEntendido:
    "No he entendido trabajos que presupuestar en ese audio. Cuéntame qué hay que hacer, con medidas si las tienes.",
  fallo: "No he podido preparar el borrador ahora mismo. Prueba otra vez en un momento.",
} as const;

export type Accion =
  | "ignorado"
  | "duplicado"
  | "alta"
  | "no-autorizado"
  | "ayuda"
  | "rechazado"
  | "limite"
  | "no-es-presupuesto"
  | "borrador"
  | "error";

export interface DependenciasWebhook {
  bot: BotTelegram;
  almacen: AlmacenPresupuestos;
  codigoAlta: string | null;
  generar: (entrada: EntradaDictado) => Promise<Borrador>;
  limites: Limites;
  ahora: () => Date;
  reloj: () => number;
}

type Mensaje = NonNullable<z.infer<typeof actualizacionSchema>["message"]>;

function archivoDeAudio(m: Mensaje) {
  if (m.voice) return m.voice;
  if (m.audio) return m.audio;
  if (m.document?.mime_type?.startsWith("audio/")) return m.document;
  return null;
}

export async function atenderActualizacion(cuerpo: unknown, deps: DependenciasWebhook): Promise<Accion> {
  const inicio = deps.reloj();
  const parsed = actualizacionSchema.safeParse(cuerpo);
  if (!parsed.success || !parsed.data.message) return "ignorado";
  const { update_id: updateId, message: m } = parsed.data;
  if (m.chat.type !== "private") return "ignorado";
  const chatId = m.chat.id;

  if (!(await deps.almacen.marcarActualizacion(updateId))) return "duplicado";

  const texto = m.text?.trim() ?? "";
  if (texto.startsWith("/start")) {
    const codigo = texto.slice("/start".length).trim();
    if (await deps.almacen.chatAutorizado(chatId)) {
      await deps.bot.enviarMensaje(chatId, MENSAJES.bienvenida);
      return "alta";
    }
    if (codigoValido(codigo, deps.codigoAlta)) {
      await deps.almacen.autorizarChat(chatId);
      await deps.bot.enviarMensaje(chatId, MENSAJES.bienvenida);
      return "alta";
    }
    await deps.bot.enviarMensaje(chatId, MENSAJES.privado);
    return "no-autorizado";
  }

  if (!(await deps.almacen.chatAutorizado(chatId))) {
    await deps.bot.enviarMensaje(chatId, MENSAJES.privado);
    return "no-autorizado";
  }

  // ¿Qué ha mandado? Audio (nota de voz, archivo de audio) o texto.
  const archivo = archivoDeAudio(m);
  let textoDictado: string | null = null;
  if (!archivo) {
    if (!texto || texto.startsWith("/")) {
      await deps.bot.enviarMensaje(chatId, MENSAJES.ayuda);
      return "ayuda";
    }
    const v = validarTexto(texto);
    if (!v.ok) {
      await deps.bot.enviarMensaje(chatId, v.mensaje);
      return "rechazado";
    }
    textoDictado = v.texto;
  } else if ((archivo.duration ?? 0) > AUDIO_MAX_SEGUNDOS || (archivo.file_size ?? 0) > AUDIO_MAX_BYTES) {
    await deps.bot.enviarMensaje(chatId, MENSAJES.audioLargo);
    return "rechazado";
  }

  const cupo = await consumirCupo(deps.almacen, `tg:${chatId}`, deps.ahora(), deps.limites);
  if (!cupo.ok) {
    await deps.bot.enviarMensaje(chatId, cupo.mensaje);
    return "limite";
  }

  void deps.bot.enviarAccion(chatId, "upload_document").catch(() => {});

  try {
    let entrada: EntradaDictado;
    if (archivo) {
      const bytes = await deps.bot.descargarArchivo(archivo.file_id, AUDIO_MAX_BYTES);
      const v = validarAudio(bytes);
      if (!v.ok) {
        await deps.bot.enviarMensaje(chatId, v.mensaje);
        return "rechazado";
      }
      entrada = { tipo: "audio", bytes, mimeType: v.mimeType };
    } else {
      entrada = { tipo: "texto", texto: textoDictado! };
    }

    const borrador = await deps.generar(entrada);
    await deps.bot.enviarDocumento(chatId, borrador.pdf, borrador.nombreArchivo, textoDeAcompanamiento(borrador.presupuesto));
    const msTotal = deps.reloj() - inicio;
    console.info(
      `[presupuestos] telegram borrador ${borrador.presupuesto.numero}: ${Math.round(msTotal)} ms en servidor ` +
        `(IA ${borrador.tiempos.iaMs} ms, PDF ${borrador.tiempos.pdfMs} ms); ` +
        `~${Math.max(0, Math.round(deps.ahora().getTime() / 1000 - m.date))} s desde el audio`,
    );
    await registrarSinFallar(deps.almacen, {
      canal: "telegram",
      ok: true,
      msTotal,
      msIa: borrador.tiempos.iaMs,
      msPdf: borrador.tiempos.pdfMs,
      modelo: borrador.ia.modelo,
      tokensEntrada: borrador.ia.uso.tokensEntrada,
      tokensSalida: borrador.ia.uso.tokensSalida + borrador.ia.uso.tokensPensamiento,
      costeUsd: borrador.ia.uso.costeUsd,
      lineas: borrador.presupuesto.lineas.length,
      pendientes: borrador.presupuesto.lineasPendientes,
    });
    return "borrador";
  } catch (err) {
    const noEs = err instanceof NoEsUnPresupuesto;
    if (!noEs) console.error("[presupuestos] telegram:", err instanceof Error ? err.message : err);
    await registrarSinFallar(deps.almacen, {
      canal: "telegram",
      ok: false,
      error: noEs ? "no-es-presupuesto" : err instanceof Error ? err.message : String(err),
      msTotal: deps.reloj() - inicio,
    });
    await deps.bot.enviarMensaje(chatId, noEs ? MENSAJES.noEntendido : MENSAJES.fallo).catch(() => {});
    return noEs ? "no-es-presupuesto" : "error";
  }
}
