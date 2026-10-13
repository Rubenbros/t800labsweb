/**
 * POST /api/presupuesto/telegram — webhook del bot de Telegram de la demo.
 *
 * Apagado (404) mientras no existan en Secret Manager el token del bot y el
 * secreto del webhook. Telegram firma cada llamada con la cabecera
 * X-Telegram-Bot-Api-Secret-Token (la fijamos al registrar el webhook con
 * scripts/presupuesto-telegram-webhook.mjs).
 */
import { NextResponse, type NextRequest } from "next/server";
import { leerSecreto } from "@/lib/secretos";
import {
  codigoValido,
  SECRETO_CODIGO_DEMO,
  SECRETO_TOKEN_TELEGRAM,
  SECRETO_WEBHOOK_TELEGRAM,
} from "@/lib/presupuestos/acceso";
import { almacenPorDefecto } from "@/lib/presupuestos/almacen";
import { limitesDelEntorno } from "@/lib/presupuestos/cupos";
import { DemasiadoGrande, leerConTope } from "@/lib/presupuestos/leer-con-tope";
import { generarBorrador } from "@/lib/presupuestos/servicio";
import { crearBot } from "@/lib/presupuestos/telegram/bot-api";
import { atenderActualizacion } from "@/lib/presupuestos/telegram/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CUERPO = 256 * 1024;

export async function POST(req: NextRequest) {
  const [token, secretoWebhook, codigoAlta] = await Promise.all([
    leerSecreto(SECRETO_TOKEN_TELEGRAM),
    leerSecreto(SECRETO_WEBHOOK_TELEGRAM),
    leerSecreto(SECRETO_CODIGO_DEMO),
  ]);
  if (!token || !secretoWebhook) return new NextResponse(null, { status: 404 });
  if (!codigoValido(req.headers.get("x-telegram-bot-api-secret-token"), secretoWebhook)) {
    return new NextResponse(null, { status: 401 });
  }

  let cuerpo: unknown;
  try {
    const bytes = await leerConTope(req.body, MAX_CUERPO);
    cuerpo = JSON.parse(new TextDecoder().decode(bytes));
  } catch (err) {
    return new NextResponse(null, { status: err instanceof DemasiadoGrande ? 413 : 400 });
  }

  try {
    const accion = await atenderActualizacion(cuerpo, {
      bot: crearBot(token),
      almacen: almacenPorDefecto(),
      codigoAlta,
      generar: (entrada) => generarBorrador(entrada),
      limites: limitesDelEntorno(),
      ahora: () => new Date(),
      reloj: () => performance.now(),
    });
    if (accion !== "ignorado" && accion !== "duplicado") console.info(`[presupuestos] telegram: ${accion}`);
  } catch (err) {
    // Contestamos 200 igualmente: si no, Telegram reintenta la misma actualización.
    console.error("[presupuestos] telegram (sin responder al chat):", err instanceof Error ? err.message : err);
  }
  return NextResponse.json({ ok: true });
}
