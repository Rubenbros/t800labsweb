import { describe, expect, it } from "vitest";
import { EMPRESA_EJEMPLO } from "@/lib/presupuestos/datos/empresa-ejemplo";
import { TARIFA_EJEMPLO } from "@/lib/presupuestos/datos/tarifa";
import { FUERA_DE_TARIFA, type Dictado } from "@/lib/presupuestos/dominio/dictado";
import { resumir, textoDeAcompanamiento } from "@/lib/presupuestos/presentacion";
import { generarBorrador, type DependenciasBorrador } from "@/lib/presupuestos/servicio";
import { TRANSCRIPCION_T2 } from "./fixtures";
import { textoDelPdf } from "./pdf-texto";

const partida = (re: RegExp) => {
  const p = TARIFA_EJEMPLO.partidas.find((x) => re.test(x.descripcion));
  if (!p) throw new Error(`La tarifa de ejemplo no tiene ${re}`);
  return p;
};

describe("tarifa de ejemplo (datos de la demo)", () => {
  it("es válida, amplia y cubre el baño del vídeo", () => {
    expect(TARIFA_EJEMPLO.partidas.length).toBeGreaterThanOrEqual(55);
    expect(partida(/^Desmontaje de bañera/).unidad).toBe("ud");
    expect(partida(/Plato de ducha.*de 101 a 140 cm/).unidad).toBe("ud");
    expect(partida(/^Alicatado con azulejo cerámico/).unidad).toBe("m2");
    expect(partida(/^Mueble de baño .* con lavabo/).unidad).toBe("ud");
  });

  it("no tiene mampara ni radiador toallero, a propósito (salen como «precio pendiente»)", () => {
    const todo = JSON.stringify(TARIFA_EJEMPLO).toLowerCase();
    expect(todo).not.toContain("mampara");
    expect(todo).not.toContain("toallero");
  });

  it("la empresa de la demo es ficticia y lo dice", () => {
    expect(EMPRESA_EJEMPLO.datosDeEjemplo).toBe(true);
    expect(EMPRESA_EJEMPLO.subtitulo).toContain("ficticia");
  });
});

describe("generarBorrador: transcripción simulada → partidas → PDF", () => {
  const bañera = partida(/^Desmontaje de bañera/);
  const plato = partida(/Plato de ducha.*de 101 a 140 cm/);
  const alicatado = partida(/^Alicatado con azulejo cerámico/);
  const desmontajeLavabo = partida(/^Desmontaje de lavabo/);
  const lavabo = partida(/^Mueble de baño .* con lavabo/);

  const dictado: Dictado = {
    transcripcion: TRANSCRIPCION_T2,
    esPresupuesto: true,
    titulo: "Reforma de baño (5 m²)",
    cliente: null,
    ubicacion: null,
    partidas: [
      { codigoTarifa: bañera.codigo, concepto: "quitar la bañera", cantidad: 1, unidad: "ud", medicion: "dicha", notaMedicion: null, estimacion: null },
      { codigoTarifa: plato.codigo, concepto: "plato de ducha de 120", cantidad: 1, unidad: "ud", medicion: "dicha", notaMedicion: null, estimacion: null },
      {
        codigoTarifa: alicatado.codigo,
        concepto: "alicatar hasta el techo",
        cantidad: null,
        unidad: "m2",
        medicion: "estimada",
        notaMedicion: null,
        estimacion: { tipo: "paredes", estancia: "baño", superficieSuelo: 5, alturaTecho: null },
      },
      { codigoTarifa: desmontajeLavabo.codigo, concepto: "cambiar el lavabo", cantidad: 1, unidad: "ud", medicion: "dicha", notaMedicion: null, estimacion: null },
      { codigoTarifa: lavabo.codigo, concepto: "cambiar el lavabo", cantidad: 1, unidad: "ud", medicion: "dicha", notaMedicion: null, estimacion: null },
      { codigoTarifa: FUERA_DE_TARIFA, concepto: "Mampara de ducha", cantidad: 1, unidad: "ud", medicion: "dicha", notaMedicion: null, estimacion: null },
    ],
    sugerencias: [],
    avisos: [],
  };

  it("pone los precios de la tarifa, deja la mampara pendiente y genera el PDF", async () => {
    let t = 0;
    const deps: DependenciasBorrador = {
      dictar: async () => ({
        dictado,
        modelo: "gemini-3.5-flash-lite",
        uso: { tokensEntrada: 7000, tokensSalida: 850, tokensPensamiento: 0, tokensAudio: 200, costeUsd: 0.0046 },
        ms: 4200,
        intentos: 1,
      }),
      tarifa: TARIFA_EJEMPLO,
      empresa: EMPRESA_EJEMPLO,
      ahora: () => new Date("2026-10-17T09:00:00Z"),
      reloj: () => (t += 1000),
      numero: () => "B-261017-DEMO",
    };
    const b = await generarBorrador({ tipo: "texto", texto: TRANSCRIPCION_T2 }, deps);

    const esperadoBase = Math.round(bañera.precio * 100) + Math.round(plato.precio * 100) + 21 * Math.round(alicatado.precio * 100) +
      Math.round(desmontajeLavabo.precio * 100) + Math.round(lavabo.precio * 100);
    expect(b.presupuesto.baseImponibleCent).toBe(esperadoBase);
    expect(b.presupuesto.totalCent).toBe(esperadoBase + Math.round(esperadoBase * 0.21));
    expect(b.presupuesto.lineasPendientes).toBe(1);
    expect(b.tiempos).toEqual({ iaMs: 1000, pdfMs: 1000, totalMs: 2000 });
    expect(b.nombreArchivo).toBe("presupuesto-B-261017-DEMO.pdf");

    const { texto } = await textoDelPdf(b.pdf);
    expect(texto).toContain("Reformas Ejemplo");
    expect(texto).toContain("Empresa ficticia · Datos de ejemplo");
    expect(texto).toContain("BORRADOR · DATOS DE EJEMPLO");
    expect(texto).toContain("Mampara de ducha");
    expect(texto).toContain("= 20,9 m², redondeado a 21 m²");

    const r = resumir(b.presupuesto);
    expect(r.lineas).toHaveLength(6);
    expect(r.lineas[5]).toMatchObject({ importe: null, pendiente: "No está en tu tarifa" });
    expect(textoDeAcompanamiento(b.presupuesto)).toContain("1 partida con precio pendiente (no sumada).");
  });
});
