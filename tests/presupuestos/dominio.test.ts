import { describe, expect, it } from "vitest";
import { FUERA_DE_TARIFA, validarDictado, DictadoInvalido, esquemaDeSalida } from "@/lib/presupuestos/dominio/dictado";
import {
  NoEsUnPresupuesto,
  construirPresupuesto,
  formatearCantidad,
  formatearEuros,
  formatearFecha,
  numeroDeBorrador,
} from "@/lib/presupuestos/dominio/presupuesto";
import { cargarTarifa } from "@/lib/presupuestos/dominio/tarifa";
import { EMPRESA_PRUEBA, TARIFA_PRUEBA, dictadoT2 } from "./fixtures";

const META = { numero: "B-261017-TEST", fecha: new Date("2026-10-17T09:00:00Z") };

describe("construirPresupuesto", () => {
  it("pone los precios de la tarifa y calcula base, IVA y total en céntimos", () => {
    const p = construirPresupuesto(dictadoT2(), TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    expect(p.lineas.map((l) => l.importeCent)).toEqual([12000, 39550, 88935, 21000]);
    expect(p.baseImponibleCent).toBe(161485);
    expect(p.cuotaIvaCent).toBe(33912); // 1.614,85 × 21 % = 339,1185 → 339,12
    expect(p.totalCent).toBe(195397);
    expect(p.lineasPendientes).toBe(0);
    expect(p.lineas[2]).toMatchObject({ medicion: "estimada", cantidad: 21, unidad: "m2", codigo: "ALI-01" });
    expect(p.lineas[2].notaMedicion).toBe("Baño de 5 m² (2,5 × 2 m): perímetro 9 m × 2,5 m de alto − 1,6 m² de puerta = 20,9 m², redondeado a 21 m²");
    expect(p.lineas[0].descripcion).toBe("Desmontaje de bañera");
    expect(p.lineas[0].dicho).toBe("quitar la bañera");
  });

  it("lo que no está en la tarifa sale con precio pendiente y no suma", () => {
    const d = dictadoT2();
    d.partidas.push({
      codigoTarifa: FUERA_DE_TARIFA,
      concepto: "Radiador toallero eléctrico",
      cantidad: 1,
      unidad: "ud",
      medicion: "dicha",
      notaMedicion: null,
      estimacion: null,
    });
    d.partidas.push({ codigoTarifa: "XYZ-99", concepto: "algo inventado", cantidad: 2, unidad: "ud", medicion: "dicha", notaMedicion: null, estimacion: null });
    const p = construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    const [radiador, inventado] = p.lineas.slice(-2);
    expect(radiador).toMatchObject({ pendiente: "fuera-de-tarifa", precioUnitarioCent: null, importeCent: null, codigo: null });
    expect(radiador.descripcion).toBe("Radiador toallero eléctrico");
    expect(inventado.pendiente).toBe("fuera-de-tarifa");
    expect(p.baseImponibleCent).toBe(161485);
    expect(p.lineasPendientes).toBe(2);
  });

  it("si la unidad no es la de la tarifa no convierte: precio pendiente", () => {
    const d = dictadoT2();
    d.partidas[2] = { ...d.partidas[2], unidad: "ml" };
    const p = construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    expect(p.lineas[2]).toMatchObject({ pendiente: "unidad-distinta", precioUnitarioCent: null, importeCent: null, unidad: "ml" });
  });

  it("sin cantidad: medición pendiente, con el precio unitario a la vista", () => {
    const d = dictadoT2();
    d.partidas[2] = { ...d.partidas[2], cantidad: null, medicion: "pendiente", estimacion: null };
    const p = construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    expect(p.lineas[2]).toMatchObject({ pendiente: "medicion-pendiente", precioUnitarioCent: 4235, importeCent: null, medicion: "pendiente" });
  });

  it("redondea las cantidades a 2 decimales y el importe al céntimo", () => {
    const d = dictadoT2();
    d.partidas = [{ ...d.partidas[2], cantidad: 10.333, medicion: "dicha", estimacion: null }];
    const p = construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    expect(p.lineas[0].cantidad).toBe(10.33);
    expect(p.lineas[0].importeCent).toBe(Math.round(10.33 * 4235)); // 43747,55 → 43748
  });

  it("aplica el IVA que configura la empresa", () => {
    const p = construirPresupuesto(dictadoT2(), TARIFA_PRUEBA, { ...EMPRESA_PRUEBA, ivaPorcentaje: 10 }, META);
    expect(p.cuotaIvaCent).toBe(16149); // 161.485 × 10 % = 16.148,5 → 16.149
  });

  it("las sugerencias no repiten partidas y las que no están en la tarifa van sin precio", () => {
    const p = construirPresupuesto(dictadoT2(), TARIFA_PRUEBA, EMPRESA_PRUEBA, META);
    expect(p.sugerencias).toHaveLength(2);
    expect(p.sugerencias[0]).toMatchObject({ codigo: "RES-01", precioUnitarioCent: 18000, unidad: "ud" });
    expect(p.sugerencias[1]).toMatchObject({ codigo: null, precioUnitarioCent: null, descripcion: "Mampara de ducha a medida" });
  });

  it("rechaza un audio que no describe trabajos", () => {
    const d = { ...dictadoT2(), esPresupuesto: false };
    expect(() => construirPresupuesto(d, TARIFA_PRUEBA, EMPRESA_PRUEBA, META)).toThrow(NoEsUnPresupuesto);
    const vacio = { ...dictadoT2(), partidas: [] };
    expect(() => construirPresupuesto(vacio, TARIFA_PRUEBA, EMPRESA_PRUEBA, META)).toThrow(NoEsUnPresupuesto);
  });
});

describe("formatos", () => {
  it("euros con miles siempre agrupados", () => {
    expect(formatearEuros(0)).toBe("0,00 €");
    expect(formatearEuros(5)).toBe("0,05 €");
    expect(formatearEuros(123456)).toBe("1.234,56 €");
    expect(formatearEuros(100000000)).toBe("1.000.000,00 €");
    expect(formatearEuros(-1999)).toBe("-19,99 €");
  });

  it("cantidades sin ceros de sobra", () => {
    expect(formatearCantidad(21)).toBe("21");
    expect(formatearCantidad(20.9)).toBe("20,9");
    expect(formatearCantidad(1234.5)).toBe("1.234,5");
    expect(formatearCantidad(0.333)).toBe("0,33");
  });

  it("fecha y número de borrador en hora de Madrid", () => {
    const tarde = new Date("2026-10-16T22:30:00Z"); // 00:30 del 17 en Madrid
    expect(formatearFecha(tarde)).toBe("17/10/2026");
    expect(numeroDeBorrador(tarde, () => 0)).toBe("B-261017-2222");
    expect(numeroDeBorrador(tarde, () => 0.999)).toMatch(/^B-261017-[2-9A-Z]{4}$/);
  });
});

describe("tarifa y dictado", () => {
  it("rechaza tarifas con códigos repetidos, más de 2 decimales o unidades raras", () => {
    const base = { nombre: "x", vigencia: "2026", moneda: "EUR" as const };
    const p = { codigo: "AAA-01", capitulo: "Varios", descripcion: "Partida", unidad: "ud", precio: 10 };
    expect(() => cargarTarifa({ ...base, partidas: [p, p] })).toThrow(/repetido/);
    expect(() => cargarTarifa({ ...base, partidas: [{ ...p, precio: 10.123 }] })).toThrow(/decimales/);
    expect(() => cargarTarifa({ ...base, partidas: [{ ...p, unidad: "kg" }] })).toThrow();
    expect(() => cargarTarifa({ ...base, partidas: [{ ...p, codigo: "baño" }] })).toThrow();
  });

  it("valida la salida del modelo", () => {
    expect(validarDictado(dictadoT2()).partidas).toHaveLength(4);
    expect(() => validarDictado({ ...dictadoT2(), partidas: [{ codigoTarifa: "DEM-01" }] })).toThrow(DictadoInvalido);
    expect(() => validarDictado({ ...dictadoT2(), partidas: [{ ...dictadoT2().partidas[0], cantidad: -1 }] })).toThrow(DictadoInvalido);
  });

  it("el esquema de salida solo admite códigos de la tarifa o FUERA_DE_TARIFA", () => {
    const e = esquemaDeSalida(["DEM-01", "FON-02"]) as {
      properties: { partidas: { items: { properties: { codigoTarifa: { enum: string[] } } } } };
    };
    expect(e.properties.partidas.items.properties.codigoTarifa.enum).toEqual(["DEM-01", "FON-02", FUERA_DE_TARIFA]);
  });
});
