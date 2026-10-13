/**
 * Acceso a la demo: nombres de los secretos y comparación de códigos en tiempo
 * constante. Los VALORES viven solo en Secret Manager (proyecto t800labsweb).
 */
import { createHash, timingSafeEqual } from "node:crypto";

/** Token del bot de Telegram (lo da @BotFather). Si no existe, el canal Telegram está apagado. */
export const SECRETO_TOKEN_TELEGRAM = "PRESUPUESTO_TELEGRAM_BOT_TOKEN";
/** Secreto que Telegram manda en cada webhook (cabecera X-Telegram-Bot-Api-Secret-Token). */
export const SECRETO_WEBHOOK_TELEGRAM = "PRESUPUESTO_TELEGRAM_WEBHOOK_SECRET";
/** Código de acceso de la demo: da de alta un chat (/start <código>) y abre la página web. */
export const SECRETO_CODIGO_DEMO = "PRESUPUESTO_DEMO_CODIGO";

/** Compara dos secretos sin filtrar por tiempo cuántos caracteres coinciden. */
export function codigoValido(dado: string | null | undefined, esperado: string | null | undefined): boolean {
  if (!dado || !esperado) return false;
  const a = createHash("sha256").update(dado).digest();
  const b = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(a, b);
}
