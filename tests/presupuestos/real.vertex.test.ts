import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Prueba REAL contra Vertex AI (cuesta céntimos): solo con PRESUPUESTO_PRUEBA_REAL=1.
 *   PRESUPUESTO_PRUEBA_REAL=1 PRESUPUESTO_AUDIO=ruta.ogg [PRESUPUESTO_SALIDA=salida.pdf] \
 *   [PRESUPUESTO_LOG=resultado.jsonl] npx vitest run tests/presupuestos/real.vertex.test.ts
 * Usa las credenciales por defecto (ADC) y la tarifa de ejemplo.
 */
const ACTIVA = process.env.PRESUPUESTO_PRUEBA_REAL === "1";

describe.skipIf(!ACTIVA)("presupuesto por audio contra Vertex (real)", () => {
  it(
    "audio → borrador en PDF",
    async () => {
      const { generarBorrador } = await import("@/lib/presupuestos/servicio");
      const { validarAudio } = await import("@/lib/presupuestos/audio");
      const ruta = process.env.PRESUPUESTO_AUDIO;
      const texto = process.env.PRESUPUESTO_TEXTO;
      let entrada: Parameters<typeof generarBorrador>[0];
      if (ruta) {
        const bytes = new Uint8Array(readFileSync(ruta));
        const v = validarAudio(bytes);
        if (!v.ok) throw new Error(v.mensaje);
        entrada = { tipo: "audio", bytes, mimeType: v.mimeType };
      } else {
        entrada = { tipo: "texto", texto: texto ?? "Baño de cinco metros: quitar la bañera, plato de ducha de 120, alicatar hasta el techo y cambiar el lavabo." };
      }
      const b = await generarBorrador(entrada);
      if (process.env.PRESUPUESTO_SALIDA) writeFileSync(process.env.PRESUPUESTO_SALIDA, b.pdf);
      const informe = JSON.stringify({
        tiempos: b.tiempos,
        ia: b.ia,
        transcripcion: b.presupuesto.transcripcion,
        lineas: b.presupuesto.lineas.map((l) => [l.codigo, l.descripcion, l.cantidad, l.unidad, l.medicion, l.notaMedicion, l.importeCent, l.pendiente]),
        sugerencias: b.presupuesto.sugerencias.map((s) => [s.codigo, s.descripcion]),
        avisos: b.presupuesto.avisos,
        total: b.presupuesto.totalCent,
      });
      if (process.env.PRESUPUESTO_LOG) appendFileSync(process.env.PRESUPUESTO_LOG, informe + "\n");
      else console.log(informe);
      expect(b.presupuesto.lineas.length).toBeGreaterThan(0);
    },
    60_000,
  );
});
