import { beforeEach, describe, expect, it, vi } from "vitest";
import { AlmacenEnMemoria } from "@/lib/presupuestos/almacen";
import { NoEsUnPresupuesto, construirPresupuesto } from "@/lib/presupuestos/dominio/presupuesto";
import type { EntradaDictado } from "@/lib/presupuestos/ia/dictar";
import type { Borrador } from "@/lib/presupuestos/servicio";
import type { BotTelegram } from "@/lib/presupuestos/telegram/bot-api";
import { MENSAJES, atenderActualizacion, type DependenciasWebhook } from "@/lib/presupuestos/telegram/webhook";
import { EMPRESA_PRUEBA, TARIFA_PRUEBA, dictadoT2, oggFalso } from "./fixtures";

const CODIGO = "codigo-de-alta-123";
const CHAT = 4242;
let updateId = 1;

function update(message: Record<string, unknown>, chatType = "private") {
  return { update_id: updateId++, message: { message_id: 1, date: 1_792_000_000, chat: { id: CHAT, type: chatType }, ...message } };
}

function borradorFalso(): Borrador {
  const presupuesto = construirPresupuesto(dictadoT2(), TARIFA_PRUEBA, EMPRESA_PRUEBA, { numero: "B-261017-TEST", fecha: new Date() });
  return {
    presupuesto,
    pdf: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
    nombreArchivo: "presupuesto-B-261017-TEST.pdf",
    tiempos: { iaMs: 3000, pdfMs: 40, totalMs: 3040 },
    ia: { modelo: "gemini-3.5-flash", uso: { tokensEntrada: 3000, tokensSalida: 600, tokensPensamiento: 200, tokensAudio: 250, costeUsd: 0.0129 }, intentos: 1 },
  };
}

function montar(over: Partial<DependenciasWebhook> = {}) {
  const enviados: string[] = [];
  const documentos: Array<{ nombre: string; pie: string }> = [];
  const bot: BotTelegram = {
    enviarMensaje: vi.fn(async (_c: number, t: string) => void enviados.push(t)),
    enviarAccion: vi.fn(async () => {}),
    enviarDocumento: vi.fn(async (_c: number, _p: Uint8Array, nombre: string, pie: string) => void documentos.push({ nombre, pie })),
    descargarArchivo: vi.fn(async () => oggFalso()),
  };
  const almacen = new AlmacenEnMemoria();
  const generar = vi.fn<(entrada: EntradaDictado) => Promise<Borrador>>(async () => borradorFalso());
  const deps: DependenciasWebhook = {
    bot,
    almacen,
    codigoAlta: CODIGO,
    generar,
    limites: { globalPorDia: 60, porSujetoPorDia: 30 },
    ahora: () => new Date("2026-10-17T09:00:00Z"),
    reloj: () => performance.now(),
    ...over,
  };
  return { deps, bot, almacen, generar, enviados, documentos };
}

describe("webhook de Telegram", () => {
  beforeEach(() => {
    updateId = 1;
  });

  it("da de alta el chat con /start <código> y no con otro código", async () => {
    const m = montar();
    expect(await atenderActualizacion(update({ text: "/start otro" }), m.deps)).toBe("no-autorizado");
    expect(await m.almacen.chatAutorizado(CHAT)).toBe(false);
    expect(await atenderActualizacion(update({ text: `/start ${CODIGO}` }), m.deps)).toBe("alta");
    expect(await m.almacen.chatAutorizado(CHAT)).toBe(true);
    expect(m.enviados).toEqual([MENSAJES.privado, MENSAJES.bienvenida]);
  });

  it("sin código configurado no da de alta a nadie", async () => {
    const m = montar({ codigoAlta: null });
    expect(await atenderActualizacion(update({ text: "/start " }), m.deps)).toBe("no-autorizado");
  });

  it("un chat no autorizado no gasta IA", async () => {
    const m = montar();
    expect(await atenderActualizacion(update({ voice: { file_id: "f1", duration: 8 } }), m.deps)).toBe("no-autorizado");
    expect(m.generar).not.toHaveBeenCalled();
    expect(m.bot.descargarArchivo).not.toHaveBeenCalled();
  });

  it("nota de voz → borrador en PDF con su texto, y queda registrado", async () => {
    const m = montar();
    await m.almacen.autorizarChat(CHAT);
    expect(await atenderActualizacion(update({ voice: { file_id: "f1", duration: 8, mime_type: "audio/ogg" } }), m.deps)).toBe("borrador");
    expect(m.generar).toHaveBeenCalledWith(expect.objectContaining({ tipo: "audio", mimeType: "audio/ogg" }));
    expect(m.documentos).toHaveLength(1);
    expect(m.documentos[0].nombre).toBe("presupuesto-B-261017-TEST.pdf");
    expect(m.documentos[0].pie).toContain("Borrador listo: Reforma de baño (5 m²)");
    expect(m.documentos[0].pie).toContain("1.614,85 € + IVA 21 % = 1.953,97 €");
    expect(m.documentos[0].pie).toContain("Datos de ejemplo.");
    expect(m.almacen.registros).toEqual([expect.objectContaining({ canal: "telegram", ok: true, msIa: 3000, lineas: 4, costeUsd: 0.0129 })]);
  });

  it("también acepta el trabajo escrito", async () => {
    const m = montar();
    await m.almacen.autorizarChat(CHAT);
    expect(await atenderActualizacion(update({ text: "Baño de cinco metros: quitar la bañera" }), m.deps)).toBe("borrador");
    expect(m.generar).toHaveBeenCalledWith({ tipo: "texto", texto: "Baño de cinco metros: quitar la bañera" });
  });

  it("procesa cada actualización una sola vez", async () => {
    const m = montar();
    await m.almacen.autorizarChat(CHAT);
    const u = update({ voice: { file_id: "f1", duration: 8 } });
    expect(await atenderActualizacion(u, m.deps)).toBe("borrador");
    expect(await atenderActualizacion(u, m.deps)).toBe("duplicado");
    expect(m.generar).toHaveBeenCalledTimes(1);
  });

  it("rechaza audios largos sin descargarlos ni gastar cupo", async () => {
    const m = montar();
    await m.almacen.autorizarChat(CHAT);
    expect(await atenderActualizacion(update({ voice: { file_id: "f1", duration: 400 } }), m.deps)).toBe("rechazado");
    expect(m.bot.descargarArchivo).not.toHaveBeenCalled();
    expect(m.almacen.uso.size).toBe(0);
  });

  it("rechaza un archivo que no es audio aunque diga que sí", async () => {
    const m = montar();
    m.bot.descargarArchivo = vi.fn(async () => new Uint8Array(5_000).fill(0x41));
    await m.almacen.autorizarChat(CHAT);
    expect(await atenderActualizacion(update({ document: { file_id: "f1", mime_type: "audio/ogg" } }), m.deps)).toBe("rechazado");
    expect(m.generar).not.toHaveBeenCalled();
  });

  it("respeta el cupo diario", async () => {
    const m = montar({ limites: { globalPorDia: 60, porSujetoPorDia: 1 } });
    await m.almacen.autorizarChat(CHAT);
    expect(await atenderActualizacion(update({ voice: { file_id: "f1", duration: 8 } }), m.deps)).toBe("borrador");
    expect(await atenderActualizacion(update({ voice: { file_id: "f2", duration: 8 } }), m.deps)).toBe("limite");
    expect(m.generar).toHaveBeenCalledTimes(1);
  });

  it("si el audio no es un trabajo, lo dice; si falla la IA, también, y lo registra", async () => {
    const m = montar();
    await m.almacen.autorizarChat(CHAT);
    m.generar.mockRejectedValueOnce(new NoEsUnPresupuesto("hola"));
    expect(await atenderActualizacion(update({ voice: { file_id: "f1", duration: 3 } }), m.deps)).toBe("no-es-presupuesto");
    m.generar.mockRejectedValueOnce(new Error("Vertex respondió 500"));
    expect(await atenderActualizacion(update({ voice: { file_id: "f2", duration: 3 } }), m.deps)).toBe("error");
    expect(m.enviados.slice(-2)).toEqual([MENSAJES.noEntendido, MENSAJES.fallo]);
    expect(m.almacen.registros.map((r) => r.ok)).toEqual([false, false]);
  });

  it("ignora grupos, mensajes sin contenido y cuerpos raros", async () => {
    const m = montar();
    expect(await atenderActualizacion(update({ text: `/start ${CODIGO}` }, "group"), m.deps)).toBe("ignorado");
    expect(await atenderActualizacion({ update_id: 9 }, m.deps)).toBe("ignorado");
    expect(await atenderActualizacion("basura", m.deps)).toBe("ignorado");
    await m.almacen.autorizarChat(CHAT);
    expect(await atenderActualizacion(update({ text: "/ayuda" }), m.deps)).toBe("ayuda");
  });
});
