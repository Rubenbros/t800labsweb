import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NoEsUnPresupuesto, construirPresupuesto } from "@/lib/presupuestos/dominio/presupuesto";
import { renderizarPresupuestoPdf } from "@/lib/presupuestos/pdf/presupuesto-pdf";
import { EMPRESA_PRUEBA, TARIFA_PRUEBA, dictadoT2, oggFalso } from "./fixtures";

const h = vi.hoisted(() => ({
  secretos: new Map<string, string>(),
  generar: vi.fn(),
  mensajes: [] as string[],
}));

vi.mock("@/lib/secretos", () => ({ leerSecreto: async (n: string) => h.secretos.get(n) ?? null }));
vi.mock("@/lib/presupuestos/servicio", () => ({ generarBorrador: h.generar }));
vi.mock("@/lib/presupuestos/telegram/bot-api", () => ({
  crearBot: () => ({
    enviarMensaje: async (_c: number, t: string) => void h.mensajes.push(t),
    enviarAccion: async () => {},
    enviarDocumento: async () => {},
    descargarArchivo: async () => oggFalso(),
  }),
}));

import { POST as borrador } from "@/app/api/presupuesto/borrador/route";
import { POST as telegram } from "@/app/api/presupuesto/telegram/route";

const CODIGO = "codigo-demo-xyz";

async function borradorFalso() {
  const presupuesto = construirPresupuesto(dictadoT2(), TARIFA_PRUEBA, EMPRESA_PRUEBA, { numero: "B-261017-TEST", fecha: new Date() });
  return {
    presupuesto,
    pdf: await renderizarPresupuestoPdf(presupuesto),
    nombreArchivo: "presupuesto-B-261017-TEST.pdf",
    tiempos: { iaMs: 3100, pdfMs: 30, totalMs: 3130 },
    ia: { modelo: "gemini-3.5-flash", uso: { tokensEntrada: 3000, tokensSalida: 600, tokensPensamiento: 0, tokensAudio: 250, costeUsd: 0.011 }, intentos: 1 },
  };
}

function pedir(cuerpo: BodyInit, cabeceras: Record<string, string>) {
  return new NextRequest("https://t800labs.com/api/presupuesto/borrador", { method: "POST", body: cuerpo, headers: cabeceras });
}

describe("POST /api/presupuesto/borrador", () => {
  beforeEach(() => {
    h.secretos.set("PRESUPUESTO_DEMO_CODIGO", CODIGO);
    h.generar.mockReset();
    h.generar.mockImplementation(borradorFalso);
  });
  afterEach(() => {
    h.secretos.clear();
    delete process.env.PRESUPUESTO_LIMITE_SUJETO_DIA;
  });

  it("503 si la demo no tiene código configurado", async () => {
    h.secretos.clear();
    const res = await borrador(pedir(oggFalso(), { "x-presupuesto-codigo": CODIGO, "content-type": "audio/ogg" }));
    expect(res.status).toBe(503);
  });

  it("401 sin el código correcto, sin llamar a la IA", async () => {
    const res = await borrador(pedir(oggFalso(), { "x-presupuesto-codigo": "otro", "content-type": "audio/ogg" }));
    expect(res.status).toBe(401);
    expect(h.generar).not.toHaveBeenCalled();
  });

  it("400 si lo que llega no es audio (por sus bytes, no por su Content-Type)", async () => {
    const res = await borrador(pedir(new Uint8Array(3_000).fill(0x3c), { "x-presupuesto-codigo": CODIGO, "content-type": "audio/ogg" }));
    expect(res.status).toBe(400);
    expect(h.generar).not.toHaveBeenCalled();
  });

  it("413 si el audio pasa del tope", async () => {
    const grande = oggFalso(5 * 1024 * 1024 + 10);
    const res = await borrador(pedir(grande, { "x-presupuesto-codigo": CODIGO, "content-type": "audio/ogg" }));
    expect(res.status).toBe(413);
  });

  it("200 con el resumen, el PDF y los tiempos", async () => {
    const res = await borrador(pedir(oggFalso(), { "x-presupuesto-codigo": CODIGO, "content-type": "audio/webm;codecs=opus" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const json = await res.json();
    expect(json.resumen.total).toBe("1.953,97 €");
    expect(json.resumen.lineas[2]).toMatchObject({ cantidad: "21", unidad: "m²", estimada: true, importe: "889,35 €" });
    expect(Buffer.from(json.pdf, "base64").subarray(0, 5).toString()).toBe("%PDF-");
    expect(json.tiempos).toMatchObject({ iaMs: 3100, pdfMs: 30 });
    expect(h.generar).toHaveBeenCalledWith(expect.objectContaining({ tipo: "audio", mimeType: "audio/ogg" }));
  });

  it("acepta texto y valida su longitud", async () => {
    expect((await borrador(pedir("Baño de cinco metros: quitar la bañera", { "x-presupuesto-codigo": CODIGO, "content-type": "text/plain" }))).status).toBe(200);
    expect(h.generar).toHaveBeenCalledWith({ tipo: "texto", texto: "Baño de cinco metros: quitar la bañera" });
    expect((await borrador(pedir("hola", { "x-presupuesto-codigo": CODIGO, "content-type": "text/plain" }))).status).toBe(400);
  });

  it("422 si no hay trabajos y 502 si falla la IA", async () => {
    h.generar.mockRejectedValueOnce(new NoEsUnPresupuesto("hola hola"));
    expect((await borrador(pedir(oggFalso(), { "x-presupuesto-codigo": CODIGO, "content-type": "audio/ogg" }))).status).toBe(422);
    h.generar.mockRejectedValueOnce(new Error("Vertex respondió 500"));
    expect((await borrador(pedir(oggFalso(), { "x-presupuesto-codigo": CODIGO, "content-type": "audio/ogg" }))).status).toBe(502);
  });

  it("429 al pasar el cupo diario", async () => {
    process.env.PRESUPUESTO_LIMITE_SUJETO_DIA = "1";
    const res = await borrador(pedir(oggFalso(), { "x-presupuesto-codigo": CODIGO, "content-type": "audio/ogg" }));
    expect(res.status).toBe(429);
    expect(h.generar).not.toHaveBeenCalled();
  });
});

describe("POST /api/presupuesto/telegram", () => {
  const pedirTg = (cuerpo: unknown, secreto?: string) =>
    new NextRequest("https://t800labs.com/api/presupuesto/telegram", {
      method: "POST",
      body: JSON.stringify(cuerpo),
      headers: { "content-type": "application/json", ...(secreto ? { "x-telegram-bot-api-secret-token": secreto } : {}) },
    });
  const alta = { update_id: 77, message: { message_id: 1, date: 1, chat: { id: 5, type: "private" }, text: `/start ${CODIGO}` } };

  afterEach(() => h.secretos.clear());

  it("404 mientras no existan el token del bot y el secreto del webhook", async () => {
    expect((await telegram(pedirTg(alta, "s"))).status).toBe(404);
  });

  it("401 si la llamada no trae el secreto del webhook", async () => {
    h.secretos.set("PRESUPUESTO_TELEGRAM_BOT_TOKEN", "123:abc");
    h.secretos.set("PRESUPUESTO_TELEGRAM_WEBHOOK_SECRET", "secreto-webhook");
    expect((await telegram(pedirTg(alta))).status).toBe(401);
    expect((await telegram(pedirTg(alta, "otro"))).status).toBe(401);
  });

  it("200 y da de alta el chat con el código de la demo", async () => {
    h.secretos.set("PRESUPUESTO_TELEGRAM_BOT_TOKEN", "123:abc");
    h.secretos.set("PRESUPUESTO_TELEGRAM_WEBHOOK_SECRET", "secreto-webhook");
    h.secretos.set("PRESUPUESTO_DEMO_CODIGO", CODIGO);
    const res = await telegram(pedirTg(alta, "secreto-webhook"));
    expect(res.status).toBe(200);
    expect(h.mensajes.at(-1)).toContain("Mándame un audio");
  });
});
