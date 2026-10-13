import { describe, expect, it } from "vitest";
import { calcularMedicion, type TipoEstimacion } from "@/lib/presupuestos/dominio/medicion";
import { construirPresupuesto } from "@/lib/presupuestos/dominio/presupuesto";
import { EMPRESA_PRUEBA, TARIFA_PRUEBA, dictadoT2 } from "./fixtures";

const e = (tipo: TipoEstimacion, superficieSuelo: number | null, alturaTecho: number | null = null) => ({
  tipo,
  estancia: "baño",
  superficieSuelo,
  alturaTecho,
});
const META = { numero: "B-1", fecha: new Date("2026-10-17T09:00:00Z") };

describe("mediciones estimadas (deterministas)", () => {
  it("paredes de un baño de 5 m² hasta el techo = 21 m², con la cuenta escrita", () => {
    expect(calcularMedicion(e("paredes", 5))).toEqual({
      cantidad: 21,
      unidad: "m2",
      nota: "Baño de 5 m² (2,5 × 2 m): perímetro 9 m × 2,5 m de alto − 1,6 m² de puerta = 20,9 m², redondeado a 21 m²",
    });
  });

  it("usa la altura dicha si es razonable", () => {
    expect(calcularMedicion(e("paredes", 5, 2.7))?.cantidad).toBe(23); // 9 × 2,7 − 1,6 = 22,7 → 23
    expect(calcularMedicion(e("paredes", 5, 40))?.cantidad).toBe(21); // altura absurda: la de por defecto
  });

  it("suelo, techo y perímetro", () => {
    expect(calcularMedicion(e("suelo", 4.3))).toMatchObject({ cantidad: 5, unidad: "m2" });
    expect(calcularMedicion(e("techo", 5))).toMatchObject({ cantidad: 5, unidad: "m2" });
    expect(calcularMedicion(e("perimetro", 5))).toMatchObject({ cantidad: 9, unidad: "ml" }); // 9 − 0,8 = 8,2 → 9
  });

  it("sin superficie o sin tipo no hay estimación", () => {
    expect(calcularMedicion(e("paredes", null))).toBeNull();
    expect(calcularMedicion(e("paredes", -1))).toBeNull();
    expect(calcularMedicion(e("ninguna", 5))).toBeNull();
    expect(calcularMedicion({ ...e("paredes", 5), estancia: null })?.nota).toMatch(/^Estancia de 5 m²/);
  });

  it("en el presupuesto, la cuenta del sistema manda sobre la cantidad que diga la IA", () => {
    const d = dictadoT2();
    d.partidas[2] = { ...d.partidas[2], cantidad: 17, notaMedicion: "cuenta mal hecha" };
    const p = construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    expect(p.lineas[2]).toMatchObject({ cantidad: 21, medicion: "estimada", importeCent: 21 * 4235 });
    expect(p.lineas[2].notaMedicion).toContain("= 20,9 m², redondeado a 21 m²");
  });

  it("si la estimación no casa con la unidad de la tarifa, no se usa", () => {
    const d = dictadoT2();
    d.partidas[2] = { ...d.partidas[2], cantidad: null, estimacion: e("perimetro", 5) };
    const p = construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    expect(p.lineas[2]).toMatchObject({ cantidad: null, medicion: "pendiente", pendiente: "medicion-pendiente" });
  });

  it("una medición dicha no se sustituye aunque venga una estimación", () => {
    const d = dictadoT2();
    d.partidas[2] = { ...d.partidas[2], cantidad: 30, medicion: "dicha" };
    const p = construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    expect(p.lineas[2]).toMatchObject({ cantidad: 30, medicion: "dicha" });
  });
});
