import { describe, expect, it, vi } from "vitest";
import { DictadoInvalido } from "@/lib/presupuestos/dominio/dictado";
import { catalogoParaIA, dictar, instrucciones, opcionesPorDefecto, type OpcionesDictado } from "@/lib/presupuestos/ia/dictar";
import { ErrorIA, costeUsd, type DependenciasVertex } from "@/lib/presupuestos/ia/vertex-gemini";
import { TARIFA_PRUEBA, dictadoT2, oggFalso } from "./fixtures";

const OPCIONES: OpcionesDictado = {
  modelo: "gemini-3.5-flash",
  nivelPensamiento: "low",
  timeoutMs: 5_000,
  peticionesIniciales: 1,
  coberturaTrasMs: 0,
  maxPeticiones: 2,
  limiteLanzamientoMs: 10_000,
};

function respuestaGemini(cuerpo: unknown, uso = { promptTokenCount: 3000, candidatesTokenCount: 600, thoughtsTokenCount: 200 }) {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: "pensando…", thought: true }, { text: JSON.stringify(cuerpo) }] }, finishReason: "STOP" }],
      usageMetadata: { ...uso, promptTokensDetails: [{ modality: "AUDIO", tokenCount: 250 }, { modality: "TEXT", tokenCount: 2750 }] },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

function deps(fetchMock: ReturnType<typeof vi.fn>): DependenciasVertex {
  let t = 0;
  return {
    fetch: fetchMock as unknown as typeof fetch,
    obtenerToken: async () => "token-de-prueba",
    proyecto: "t800labsweb",
    ubicacion: "eu",
    ahora: () => (t += 1000),
  };
}

describe("dictar (Gemini simulado)", () => {
  it("manda el audio y la tarifa SIN precios a la multirregión UE y valida la respuesta", async () => {
    const fetchMock = vi.fn(async () => respuestaGemini(dictadoT2()));
    const r = await dictar({ tipo: "audio", bytes: oggFalso(), mimeType: "audio/ogg" }, TARIFA_PRUEBA, OPCIONES, deps(fetchMock));

    expect(r.dictado.partidas).toHaveLength(4);
    expect(r.intentos).toBe(1);
    expect(r.uso).toMatchObject({ tokensEntrada: 3000, tokensSalida: 600, tokensPensamiento: 200, tokensAudio: 250 });
    expect(r.uso.costeUsd).toBeCloseTo((3000 * 1.65 + 800 * 9.9) / 1e6, 8);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(
      "https://aiplatform.eu.rep.googleapis.com/v1/projects/t800labsweb/locations/eu/publishers/google/models/gemini-3.5-flash:generateContent",
    );
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token-de-prueba");
    const cuerpo = JSON.parse(String(init.body));
    expect(cuerpo.contents[0].parts[0].inlineData).toEqual({ mimeType: "audio/ogg", data: Buffer.from(oggFalso()).toString("base64") });
    expect(cuerpo.generationConfig.responseMimeType).toBe("application/json");
    expect(cuerpo.generationConfig.thinkingConfig).toEqual({ thinkingLevel: "low" });
    const sistema: string = cuerpo.systemInstruction.parts[0].text;
    expect(sistema).toContain("FON-02 | unidad (ud) | Plato de ducha de resina de 101 a 140 cm");
    expect(sistema).not.toMatch(/395|42[.,]35|€/); // la IA no ve precios
  });

  it("acepta texto en vez de audio", async () => {
    const fetchMock = vi.fn(async () => respuestaGemini(dictadoT2()));
    await dictar({ tipo: "texto", texto: "Baño de cinco metros" }, TARIFA_PRUEBA, OPCIONES, deps(fetchMock));
    const cuerpo = JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(cuerpo.contents[0].parts[0].text).toContain("«Baño de cinco metros»");
  });

  it("reintenta una vez si Vertex falla de forma pasajera", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("ocupado", { status: 503 }))
      .mockResolvedValueOnce(respuestaGemini(dictadoT2()));
    const r = await dictar({ tipo: "texto", texto: "Baño de cinco metros" }, TARIFA_PRUEBA, OPCIONES, deps(fetchMock));
    expect(r.intentos).toBe(2);
  });

  it("reintenta si el JSON no casa con el esquema y, si vuelve a fallar, lo dice", async () => {
    const fetchMock = vi.fn(async () => respuestaGemini({ transcripcion: "x" }));
    await expect(dictar({ tipo: "texto", texto: "Baño de cinco metros" }, TARIFA_PRUEBA, OPCIONES, deps(fetchMock))).rejects.toBeInstanceOf(
      DictadoInvalido,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("no reintenta un error de la petición (400) ni pasado el tiempo de reintento", async () => {
    const f400 = vi.fn(async () => new Response("mal", { status: 400 }));
    await expect(dictar({ tipo: "texto", texto: "Baño de cinco metros" }, TARIFA_PRUEBA, OPCIONES, deps(f400))).rejects.toBeInstanceOf(ErrorIA);
    expect(f400).toHaveBeenCalledTimes(1);

    const f503 = vi.fn(async () => new Response("ocupado", { status: 503 }));
    const tarde = { ...OPCIONES, limiteLanzamientoMs: 500 };
    await expect(dictar({ tipo: "texto", texto: "Baño de cinco metros" }, TARIFA_PRUEBA, tarde, deps(f503))).rejects.toBeInstanceOf(ErrorIA);
    expect(f503).toHaveBeenCalledTimes(1);
  });

  it("si Vertex tarda, lanza una petición de cobertura, gana la primera y cancela la otra", async () => {
    const senales: AbortSignal[] = [];
    const fetchMock = vi.fn((_url: string, init: RequestInit) => {
      senales.push(init.signal!);
      const espera = senales.length === 1 ? 400 : 10;
      return new Promise<Response>((resolve, reject) => {
        const t = setTimeout(() => resolve(respuestaGemini(dictadoT2())), espera);
        init.signal!.addEventListener("abort", () => {
          clearTimeout(t);
          reject(Object.assign(new Error("cancelada"), { name: "AbortError" }));
        });
      });
    });
    const d = { ...deps(fetchMock as never), ahora: () => Date.now() };
    const t0 = Date.now();
    const r = await dictar({ tipo: "texto", texto: "Baño de cinco metros" }, TARIFA_PRUEBA, { ...OPCIONES, coberturaTrasMs: 50 }, d);
    expect(Date.now() - t0).toBeLessThan(300);
    expect(r.intentos).toBe(2);
    expect(senales[0].aborted).toBe(true);
    // Coste: la que gana + la entrada de la cancelada (cota).
    expect(r.uso.costeUsd).toBeCloseTo((3000 * 1.65 + 800 * 9.9) / 1e6 + (3000 * 1.65) / 1e6, 8);
  });

  it("con dos peticiones iniciales gana la más rápida aunque la otra falle", async () => {
    let n = 0;
    const fetchMock = vi.fn((_url: string, init: RequestInit) => {
      n++;
      if (n === 1) return Promise.resolve(new Response("ocupado", { status: 503 }));
      return new Promise<Response>((resolve, reject) => {
        const t = setTimeout(() => resolve(respuestaGemini(dictadoT2())), 20);
        init.signal!.addEventListener("abort", () => {
          clearTimeout(t);
          reject(Object.assign(new Error("cancelada"), { name: "AbortError" }));
        });
      });
    });
    const r = await dictar(
      { tipo: "texto", texto: "Baño de cinco metros" },
      TARIFA_PRUEBA,
      { ...OPCIONES, peticionesIniciales: 2 },
      { ...deps(fetchMock as never), ahora: () => Date.now() },
    );
    expect(r.intentos).toBe(2);
    expect(r.dictado.partidas).toHaveLength(4);
  });

  it("si fallan todas, devuelve el último error sin pasar del máximo de peticiones", async () => {
    const fetchMock = vi.fn(async () => new Response("ocupado", { status: 503 }));
    await expect(
      dictar({ tipo: "texto", texto: "Baño de cinco metros" }, TARIFA_PRUEBA, { ...OPCIONES, peticionesIniciales: 2, maxPeticiones: 3 }, {
        ...deps(fetchMock),
        ahora: () => Date.now(),
      }),
    ).rejects.toBeInstanceOf(ErrorIA);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("sin cobertura, una respuesta lenta pero buena se espera", async () => {
    const fetchMock = vi.fn(() => new Promise<Response>((r) => setTimeout(() => r(respuestaGemini(dictadoT2())), 60)));
    const r = await dictar({ tipo: "texto", texto: "Baño de cinco metros" }, TARIFA_PRUEBA, OPCIONES, deps(fetchMock));
    expect(r.intentos).toBe(1);
  });

  it("una respuesta cortada por tokens es un error", async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "{" }] }, finishReason: "MAX_TOKENS" }] }), { status: 200 }),
    );
    await expect(dictar({ tipo: "texto", texto: "Baño de cinco metros" }, TARIFA_PRUEBA, OPCIONES, deps(fetchMock))).rejects.toThrow(/MAX_TOKENS/);
  });

  it("instrucciones y catálogo", () => {
    expect(catalogoParaIA(TARIFA_PRUEBA).split("\n")).toHaveLength(5);
    expect(catalogoParaIA(TARIFA_PRUEBA)).toContain("DEM-01 | unidad (ud) | Desmontaje de bañera | se dice: quitar la bañera");
    expect(instrucciones(TARIFA_PRUEBA)).toContain("FUERA_DE_TARIFA");
    expect(opcionesPorDefecto({})).toMatchObject({
      modelo: "gemini-3.5-flash-lite",
      nivelPensamiento: "minimal",
      peticionesIniciales: 2,
      coberturaTrasMs: 5_000,
      maxPeticiones: 4,
    });
    expect(opcionesPorDefecto({ PRESUPUESTO_PETICIONES_INICIALES: "1" }).peticionesIniciales).toBe(1);
    expect(opcionesPorDefecto({ PRESUPUESTO_COBERTURA_MS: "0" }).coberturaTrasMs).toBe(0);
    expect(opcionesPorDefecto({ PRESUPUESTO_COBERTURA_MS: "-3" }).coberturaTrasMs).toBe(5_000);
    expect(opcionesPorDefecto({ PRESUPUESTO_MODELO: "gemini-3.5-flash", PRESUPUESTO_PENSAMIENTO: "nada" })).toMatchObject({
      modelo: "gemini-3.5-flash",
      nivelPensamiento: "minimal",
    });
    expect(opcionesPorDefecto({ PRESUPUESTO_PENSAMIENTO: "low" }).nivelPensamiento).toBe("low");
    expect(costeUsd("gemini-3.5-flash-lite", 1_000_000, 1_000_000)).toBeCloseTo(3.08, 6);
  });
});
