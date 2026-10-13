import { describe, expect, it } from "vitest";
import { codigoValido } from "@/lib/presupuestos/acceso";
import { AlmacenEnMemoria } from "@/lib/presupuestos/almacen";
import { AUDIO_MAX_BYTES, detectarFormato, validarAudio, validarTexto } from "@/lib/presupuestos/audio";
import { consumirCupo, diaDeMadrid, limitesDelEntorno } from "@/lib/presupuestos/cupos";
import { DemasiadoGrande, leerConTope } from "@/lib/presupuestos/leer-con-tope";

const conCabecera = (cabecera: number[], tamano = 2_000, desde = 0) => {
  const b = new Uint8Array(tamano);
  b.set(cabecera, desde);
  return b;
};
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe("audio", () => {
  it("reconoce el formato por los primeros bytes", () => {
    expect(detectarFormato(conCabecera(ascii("OggS")))).toBe("ogg");
    expect(detectarFormato(conCabecera([0x1a, 0x45, 0xdf, 0xa3]))).toBe("webm");
    expect(detectarFormato(conCabecera(ascii("ftypM4A "), 2_000, 4))).toBe("mp4");
    expect(detectarFormato(conCabecera([...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WAVE")]))).toBe("wav");
    expect(detectarFormato(conCabecera(ascii("fLaC")))).toBe("flac");
    expect(detectarFormato(conCabecera(ascii("ID3")))).toBe("mp3");
    expect(detectarFormato(conCabecera([0xff, 0xfb]))).toBe("mp3");
    expect(detectarFormato(conCabecera([0xff, 0xf1]))).toBe("aac");
    expect(detectarFormato(conCabecera(ascii("%PDF-1.7")))).toBeNull();
    expect(detectarFormato(conCabecera([0x89, ...ascii("PNG")]))).toBeNull();
  });

  it("valida tamaño y formato y da el MIME que entiende Gemini", () => {
    expect(validarAudio(conCabecera(ascii("OggS")))).toEqual({ ok: true, formato: "ogg", mimeType: "audio/ogg" });
    expect(validarAudio(conCabecera(ascii("OggS"), 500))).toMatchObject({ ok: false, motivo: "vacio" });
    expect(validarAudio(conCabecera(ascii("OggS"), AUDIO_MAX_BYTES + 1))).toMatchObject({ ok: false, motivo: "demasiado-grande" });
    expect(validarAudio(conCabecera(ascii("<html>")))).toMatchObject({ ok: false, motivo: "formato-no-admitido" });
  });

  it("valida el texto dictado", () => {
    expect(validarTexto("  Baño de cinco metros:\n quitar la bañera ")).toEqual({ ok: true, texto: "Baño de cinco metros: quitar la bañera" });
    expect(validarTexto("hola").ok).toBe(false);
    expect(validarTexto("x".repeat(2_001)).ok).toBe(false);
  });

  it("lee un flujo sin pasar del tope", async () => {
    const flujo = (n: number) => new Blob([new Uint8Array(n)]).stream();
    expect((await leerConTope(flujo(10), 10)).byteLength).toBe(10);
    await expect(leerConTope(flujo(11), 10)).rejects.toBeInstanceOf(DemasiadoGrande);
    expect((await leerConTope(null, 10)).byteLength).toBe(0);
  });
});

describe("cupos diarios", () => {
  const limites = { globalPorDia: 3, porSujetoPorDia: 2 };
  const hoy = new Date("2026-10-17T10:00:00Z");

  it("deja pasar hasta el límite del sujeto y luego corta", async () => {
    const a = new AlmacenEnMemoria();
    expect(await consumirCupo(a, "tg:1", hoy, limites)).toEqual({ ok: true });
    expect(await consumirCupo(a, "tg:1", hoy, limites)).toEqual({ ok: true });
    expect(await consumirCupo(a, "tg:1", hoy, limites)).toMatchObject({ ok: false, motivo: "sujeto" });
  });

  it("el cupo global corta aunque el sujeto sea nuevo", async () => {
    const a = new AlmacenEnMemoria();
    await consumirCupo(a, "tg:1", hoy, limites);
    await consumirCupo(a, "tg:2", hoy, limites);
    await consumirCupo(a, "web", hoy, limites);
    expect(await consumirCupo(a, "tg:3", hoy, limites)).toMatchObject({ ok: false, motivo: "global" });
  });

  it("el día es el de Madrid y al día siguiente se reinicia", async () => {
    expect(diaDeMadrid(new Date("2026-10-16T22:30:00Z"))).toBe("2026-10-17");
    expect(diaDeMadrid(new Date("2026-12-31T22:59:00Z"))).toBe("2026-12-31");
    const a = new AlmacenEnMemoria();
    await consumirCupo(a, "tg:1", hoy, limites);
    await consumirCupo(a, "tg:1", hoy, limites);
    expect(await consumirCupo(a, "tg:1", new Date("2026-10-18T10:00:00Z"), limites)).toEqual({ ok: true });
  });

  it("los límites del entorno solo aceptan enteros positivos razonables", () => {
    expect(limitesDelEntorno({})).toEqual({ globalPorDia: 60, porSujetoPorDia: 30 });
    expect(limitesDelEntorno({ PRESUPUESTO_LIMITE_GLOBAL_DIA: "10", PRESUPUESTO_LIMITE_SUJETO_DIA: "abc" })).toEqual({
      globalPorDia: 10,
      porSujetoPorDia: 30,
    });
    expect(limitesDelEntorno({ PRESUPUESTO_LIMITE_GLOBAL_DIA: "-5" }).globalPorDia).toBe(60);
  });
});

describe("acceso", () => {
  it("compara códigos sin aceptar vacíos", () => {
    expect(codigoValido("abc123", "abc123")).toBe(true);
    expect(codigoValido("abc124", "abc123")).toBe(false);
    expect(codigoValido("", "abc123")).toBe(false);
    expect(codigoValido("abc123", null)).toBe(false);
    expect(codigoValido(undefined, undefined)).toBe(false);
  });
});
