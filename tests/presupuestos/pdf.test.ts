import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { FUERA_DE_TARIFA } from "@/lib/presupuestos/dominio/dictado";
import { construirPresupuesto } from "@/lib/presupuestos/dominio/presupuesto";
import { nombreDeArchivo, renderizarPresupuestoPdf } from "@/lib/presupuestos/pdf/presupuesto-pdf";
import { EMPRESA_PRUEBA, TARIFA_PRUEBA, dictadoT2 } from "./fixtures";
import { textoDelPdf } from "./pdf-texto";

const META = { numero: "B-261017-TEST", fecha: new Date("2026-10-17T09:00:00Z") };

describe("PDF del borrador", () => {
  it("lleva empresa, borrador y datos de ejemplo, partidas, totales y la marca discreta", async () => {
    const d = dictadoT2();
    d.partidas.push({ codigoTarifa: FUERA_DE_TARIFA, concepto: "Mampara de ducha a medida", cantidad: 1, unidad: "ud", medicion: "dicha", notaMedicion: null, estimacion: null });
    const p = construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    const bytes = await renderizarPresupuestoPdf(p);

    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
    const { paginas, texto } = await textoDelPdf(bytes);
    expect(paginas).toBe(1);
    for (const esperado of [
      "Reformas Prueba",
      "BORRADOR · DATOS DE EJEMPLO",
      "Reforma de baño (5 m²)",
      "B-261017-TEST",
      "17/10/2026",
      "Desmontaje de bañera",
      "Mampara de ducha a medida",
      "pendiente",
      "Precio pendiente: no está en tu tarifa.",
      "21*",
      "1.614,85 €",
      "IVA (21 %)",
      "1.953,97 €",
      "1 partida con precio pendiente: no está sumada en el total.",
      "Lo que dijiste en el audio".toUpperCase(),
      "T800 Labs · t800labs.com",
      "Página 1 de 1",
    ]) {
      expect(texto).toContain(esperado);
    }

    const doc = await PDFDocument.load(bytes);
    expect(doc.getTitle()).toBe("Presupuesto B-261017-TEST · Reforma de baño (5 m²)");
    expect(doc.getSubject()).toBe("Borrador · Datos de ejemplo");
    expect(nombreDeArchivo(p)).toBe("presupuesto-B-261017-TEST.pdf");
  });

  it("si no cabe, sigue en otra página con la cabecera de la tabla repetida", async () => {
    const d = dictadoT2();
    d.partidas = Array.from({ length: 40 }, (_, i) => ({ ...dictadoT2().partidas[i % 4], concepto: `trabajo ${i + 1}` }));
    const p = construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    const { paginas, texto } = await textoDelPdf(await renderizarPresupuestoPdf(p));
    expect(paginas).toBeGreaterThanOrEqual(2);
    expect(texto).toContain(`Página 2 de ${paginas}`);
    const cabeceras = texto.split("DESCRIPCIÓN").length - 1;
    expect(cabeceras).toBeGreaterThanOrEqual(2);
    expect(cabeceras).toBeLessThanOrEqual(paginas);
  });

  it("no se rompe con caracteres que la fuente no tiene (emojis, ≈, −)", async () => {
    const d = dictadoT2();
    d.titulo = "Baño 🛁 ≈ 5 m²";
    d.transcripcion = "Baño de 5 m² − quitar 🛁 → ducha";
    d.partidas[2] = { ...d.partidas[2], cantidad: 21, estimacion: null, notaMedicion: "≈ 21 m² (2,5 × 2 m)" };
    const p = construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    const { texto } = await textoDelPdf(await renderizarPresupuestoPdf(p));
    expect(texto).toContain("Baño aprox. 5 m²");
    expect(texto).toContain("Baño de 5 m² - quitar -> ducha");
  });
});
