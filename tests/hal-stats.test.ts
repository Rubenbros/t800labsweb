import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `pg` mockeado: el pool devuelve un `query` que simula la tabla `hal_stats`.
const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));

vi.mock("pg", () => {
  class Pool {
    query = queryMock;
    on = vi.fn();
    end = vi.fn(async () => {});
  }
  return { Pool, default: { Pool } };
});

import { recordShutdown, recordVisitor } from "@/lib/hal-stats";

const TEST_URL = "postgresql://user:pass@127.0.0.1:5433/test";

/** Estado en memoria de la tabla; devuelve el objeto para poder inspeccionarlo. */
function mockTable(initial: Record<string, number>): Record<string, number> {
  const values = { ...initial };
  queryMock.mockImplementation(
    async (text: string, params: unknown[] = []) => {
      if (text.includes("INSERT INTO hal_stats")) {
        return { rows: [], rowCount: 0 };
      }
      if (text.includes("SELECT key, value")) {
        const keys = params[0] as string[];
        const rows = keys
          .filter((k) => k in values)
          .map((k) => ({ key: k, value: values[k] }));
        return { rows, rowCount: rows.length };
      }
      if (text.includes("SET value = value + 1")) {
        const key = params[0] as string;
        values[key] = (values[key] ?? 0) + 1;
        return { rows: [{ value: values[key] }], rowCount: 1 };
      }
      if (text.includes("SET value = LEAST(value, $2)")) {
        const [key, v] = params as [string, number];
        values[key] = Math.min(values[key], v);
        return { rows: [{ value: values[key] }], rowCount: 1 };
      }
      if (text.includes("SET value = $2")) {
        const [key, v] = params as [string, number];
        values[key] = v;
        return { rows: [], rowCount: 1 };
      }
      throw new Error(`Consulta no esperada: ${text}`);
    },
  );
  return values;
}

const HOUR = 60 * 60 * 1000;

function baseValues(overrides: Record<string, number> = {}) {
  return {
    shutdowns: 10,
    visitors: 1000,
    avg_time: 20,
    fastest: 5,
    last_24h: 3,
    last_reset: Date.now(),
    seeded: 1,
    ...overrides,
  };
}

beforeEach(() => {
  queryMock.mockReset();
  process.env.DATABASE_URL = TEST_URL;
});

afterEach(() => {
  delete process.env.DATABASE_URL;
});

describe("recordShutdown", () => {
  it("incrementa el contador de apagados de forma atómica", async () => {
    const values = mockTable(baseValues());
    const stats = await recordShutdown(30);
    expect(stats.totalShutdowns).toBe(11);
    expect(values.shutdowns).toBe(11);
  });

  it("actualiza la media móvil con el nuevo tiempo", async () => {
    const values = mockTable(baseValues());
    // avg = round((20 + (30 - 20) / 11) * 10) / 10 = 20.9
    const stats = await recordShutdown(30);
    expect(stats.avgTime).toBe(20.9);
    expect(values.avg_time).toBe(20.9);
  });

  it("acerca la media al tiempo del usuario cuando es más rápido", async () => {
    const values = mockTable(baseValues({ avg_time: 20, shutdowns: 4 }));
    // avg = round((20 + (10 - 20) / 5) * 10) / 10 = 18
    const stats = await recordShutdown(10);
    expect(stats.avgTime).toBe(18);
    expect(values.avg_time).toBe(18);
  });

  it("guarda el mejor tiempo cuando el usuario lo supera", async () => {
    const values = mockTable(baseValues({ fastest: 5 }));
    const stats = await recordShutdown(2.34);
    expect(stats.fastestTime).toBe(2.3);
    expect(values.fastest).toBe(2.3);
  });

  it("no toca el mejor tiempo cuando el usuario no lo supera", async () => {
    const values = mockTable(baseValues({ fastest: 5 }));
    const stats = await recordShutdown(9);
    expect(stats.fastestTime).toBe(5);
    expect(values.fastest).toBe(5);
    const leastCalls = queryMock.mock.calls.filter(([sql]) =>
      String(sql).includes("LEAST"),
    );
    expect(leastCalls).toHaveLength(0);
  });

  it("incrementa la ventana de 24 h si el corte es reciente", async () => {
    const values = mockTable(baseValues({ last_reset: Date.now() - 1 * HOUR }));
    const stats = await recordShutdown(12);
    expect(stats.last24h).toBe(4);
    expect(values.last_24h).toBe(4);
  });

  it("reinicia la ventana de 24 h cuando ha pasado más de un día", async () => {
    const before = Date.now();
    const values = mockTable(baseValues({ last_reset: before - 25 * HOUR }));
    const stats = await recordShutdown(12);
    expect(stats.last24h).toBe(1);
    expect(values.last_24h).toBe(1);
    expect(values.last_reset).toBeGreaterThanOrEqual(before);
  });

  it("calcula la tasa de intentos sobre las visitas", async () => {
    mockTable(baseValues({ shutdowns: 10, visitors: 1000 }));
    const stats = await recordShutdown(12);
    // 11 / 1000 = 1.1 %
    expect(stats.attemptRate).toBe(1.1);
  });

  it("usa el fallback determinista si no hay DATABASE_URL", async () => {
    delete process.env.DATABASE_URL;
    const stats = await recordShutdown(7.77);
    expect(queryMock).not.toHaveBeenCalled();
    expect(stats.userTime).toBe(7.8);
    expect(stats.totalShutdowns).toBeGreaterThan(2847);
    expect(stats.avgTime).toBe(23.4);
  });

  it("usa el fallback si la base de datos falla", async () => {
    queryMock.mockRejectedValue(new Error("conexión rechazada"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const stats = await recordShutdown(3);
    expect(stats.totalShutdowns).toBeGreaterThan(2847);
    expect(stats.userTime).toBe(3);
  });
});

describe("recordVisitor", () => {
  it("incrementa el contador de visitas", async () => {
    const values = mockTable(baseValues());
    await recordVisitor();
    expect(values.visitors).toBe(1001);
  });

  it("no hace nada sin DATABASE_URL", async () => {
    delete process.env.DATABASE_URL;
    await recordVisitor();
    expect(queryMock).not.toHaveBeenCalled();
  });
});
