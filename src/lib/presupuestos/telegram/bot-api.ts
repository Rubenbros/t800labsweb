/**
 * Cliente mínimo de la Bot API de Telegram (solo lo que usa la demo). El token
 * va en la URL de la API, así que NUNCA aparece en mensajes de error ni logs.
 */

import { DemasiadoGrande, leerConTope } from "../leer-con-tope";

const API = "https://api.telegram.org";

export class ErrorTelegram extends Error {
  constructor(
    readonly metodo: string,
    readonly estado: number | null,
    descripcion: string,
  ) {
    super(`Telegram ${metodo}: ${estado ?? "sin respuesta"} ${descripcion}`.trim());
    this.name = "ErrorTelegram";
  }
}

export interface BotTelegram {
  enviarMensaje(chatId: number, texto: string): Promise<void>;
  enviarAccion(chatId: number, accion: "upload_document" | "typing"): Promise<void>;
  enviarDocumento(chatId: number, pdf: Uint8Array, nombreArchivo: string, pie: string): Promise<void>;
  /** Descarga un archivo del chat; falla si pasa de `maxBytes`. */
  descargarArchivo(fileId: string, maxBytes: number): Promise<Uint8Array>;
}

export function crearBot(token: string, f: typeof fetch = fetch): BotTelegram {
  async function llamar(metodo: string, cuerpo: Record<string, unknown> | FormData, timeoutMs = 15_000): Promise<unknown> {
    const esForm = cuerpo instanceof FormData;
    let res: Response;
    try {
      res = await f(`${API}/bot${token}/${metodo}`, {
        method: "POST",
        headers: esForm ? undefined : { "Content-Type": "application/json" },
        body: esForm ? cuerpo : JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      throw new ErrorTelegram(metodo, null, "no se pudo conectar");
    }
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: unknown; description?: string };
    if (!res.ok || !json.ok) throw new ErrorTelegram(metodo, res.status, json.description ?? "");
    return json.result;
  }

  return {
    async enviarMensaje(chatId, texto) {
      await llamar("sendMessage", { chat_id: chatId, text: texto.slice(0, 4000), link_preview_options: { is_disabled: true } });
    },
    async enviarAccion(chatId, accion) {
      await llamar("sendChatAction", { chat_id: chatId, action: accion }, 5_000);
    },
    async enviarDocumento(chatId, pdf, nombreArchivo, pie) {
      const form = new FormData();
      form.append("chat_id", String(chatId));
      form.append("caption", pie.slice(0, 1000));
      form.append("document", new Blob([pdf as Uint8Array<ArrayBuffer>], { type: "application/pdf" }), nombreArchivo);
      await llamar("sendDocument", form, 30_000);
    },
    async descargarArchivo(fileId, maxBytes) {
      const archivo = (await llamar("getFile", { file_id: fileId })) as { file_path?: string; file_size?: number };
      if (!archivo.file_path) throw new ErrorTelegram("getFile", null, "sin ruta de archivo");
      if ((archivo.file_size ?? 0) > maxBytes) throw new ErrorTelegram("getFile", null, "archivo demasiado grande");
      let res: Response;
      try {
        res = await f(`${API}/file/bot${token}/${archivo.file_path}`, { signal: AbortSignal.timeout(15_000) });
      } catch {
        throw new ErrorTelegram("download", null, "no se pudo descargar");
      }
      if (!res.ok) throw new ErrorTelegram("download", res.status, "");
      try {
        return await leerConTope(res.body, maxBytes);
      } catch (err) {
        if (err instanceof DemasiadoGrande) throw new ErrorTelegram("download", null, "archivo demasiado grande");
        throw err;
      }
    },
  };
}
