import { describe, expect, it, vi } from "vitest";

import {
  SHOWCASE_URL,
  automationCases,
  cleanCaption,
  formatPublishedDate,
  latestByBrand,
  parseShowcase,
  productVideos,
} from "@/lib/escaparate/feed";
import { createShowcaseSource } from "@/lib/escaparate/source";

const ID = "d77f1803-2bbd-4c1a-a57c-6e2aa0253d22";
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

/** Una pieza tal como la da el panel (marketing-t800labs, ADR-MKT-012). */
function piece(overrides: Record<string, unknown> = {}) {
  return {
    id: ID,
    proyecto: "stelvia",
    titulo: "La luz de Altair",
    gancho: "ESTA LUZ SALIÓ EN 2009",
    pie: "La luz de Altair tarda casi 17 años en llegar ✨\nFirma la tuya: https://stelvia.space\n#stelvia #astronomia",
    duracionS: 11.5,
    publicadaEn: "2026-10-12T18:31:13.294Z",
    portada: `${SHOWCASE_URL}/portada/${ID}.jpg?v=3`,
    redes: [
      { red: "instagram", url: "https://www.instagram.com/reel/DeZ4YxJGqze/" },
      { red: "youtube", url: "https://youtube.com/shorts/PqI4woGSCtw" },
    ],
    ...overrides,
  };
}

const feed = (...piezas: unknown[]) => ({ generadoEn: "2026-10-13T10:00:00.000Z", piezas });

describe("escaparate: lo que llega del panel", () => {
  it("pasa una pieza publicada al modelo de la web", () => {
    expect(parseShowcase(feed(piece()))).toEqual([
      {
        id: ID,
        brand: "stelvia",
        title: "La luz de Altair",
        caption: "La luz de Altair tarda casi 17 años en llegar ✨",
        publishedAt: "2026-10-12T18:31:13.294Z",
        cover: `${SHOWCASE_URL}/portada/${ID}.jpg?v=3`,
        links: [
          { network: "instagram", url: "https://www.instagram.com/reel/DeZ4YxJGqze/" },
          { network: "youtube", url: "https://youtube.com/shorts/PqI4woGSCtw" },
        ],
      },
    ]);
  });

  it("quita las comillas angulares del título de las piezas con cara", () => {
    expect(parseShowcase(feed(piece({ titulo: "«¿Quién me debe?»" })))[0].title).toBe("¿Quién me debe?");
  });

  it.each([
    ["no es un objeto", null],
    ["no trae piezas", { generadoEn: "x" }],
    ["piezas no es una lista", { piezas: "todas" }],
  ])("una respuesta rota (%s) da una lista vacía, sin lanzar", (_, payload) => {
    expect(parseShowcase(payload)).toEqual([]);
  });

  it.each([
    ["sin título", { titulo: "  " }],
    ["de una marca que la web no enseña", { proyecto: "noesgratis" }],
    ["con un id que no es un uuid", { id: "../../etc" }],
    ["con una fecha que no es ISO", { publicadaEn: "ayer" }],
    ["sin ninguna red", { redes: [] }],
  ])("descarta la pieza %s y conserva las demás", (_, overrides) => {
    const good = piece({ id: id(1), titulo: "Buena" });
    expect(parseShowcase(feed(piece(overrides), good)).map((v) => v.title)).toEqual(["Buena"]);
  });

  it.each([
    ["http en vez de https", "instagram", "http://www.instagram.com/reel/abc/"],
    ["otro dominio", "instagram", "https://instagram.com.malo.example/reel/abc/"],
    ["el dominio de otra red", "tiktok", "https://www.instagram.com/reel/abc/"],
    ["un esquema que ejecuta código", "youtube", "javascript:alert(1)"],
    ["una red que no existe", "myspace", "https://myspace.com/x"],
  ])("no pinta un enlace con %s", (_, red, url) => {
    const [video] = parseShowcase(feed(piece({ redes: [{ red, url }, { red: "facebook", url: "https://www.facebook.com/reel/1" }] })));
    expect(video.links).toEqual([{ network: "facebook", url: "https://www.facebook.com/reel/1" }]);
  });

  it.each([
    ["de otro servidor", "https://malo.example/api/publico/escaparate/portada/x.jpg"],
    ["de otra ruta del panel", "https://panel.t800labs.com/api/v1/piezas"],
    ["que no es una URL", "portada.jpg"],
  ])("no carga una portada %s", (_, portada) => {
    expect(parseShowcase(feed(piece({ portada })))[0].cover).toBeNull();
  });

  it("ordena de lo más reciente a lo más antiguo", () => {
    const videos = parseShowcase(
      feed(
        piece({ id: id(1), titulo: "Vieja", publicadaEn: "2026-10-05T18:30:00.000Z" }),
        piece({ id: id(2), titulo: "Nueva", publicadaEn: "2026-10-14T18:30:00.000Z" }),
        piece({ id: id(3), titulo: "Media", publicadaEn: "2026-10-09T18:30:00.000Z" }),
      ),
    );
    expect(videos.map((v) => v.title)).toEqual(["Nueva", "Media", "Vieja"]);
  });
});

describe("escaparate: el pie de la red, en la web", () => {
  it("quita etiquetas y enlaces y junta las líneas", () => {
    expect(cleanCaption("Presupuesto por audio: sales de la visita y te llega el PDF.\nDatos de ejemplo.\n#reformas #fontaneria")).toBe(
      "Presupuesto por audio: sales de la visita y te llega el PDF. Datos de ejemplo.",
    );
    expect(cleanCaption("Mira esto #stelvia ahora https://stelvia.space/x")).toBe("Mira esto ahora");
  });

  it.each(["De {duracion_tomas} de tomas salieron {duracion_video}.", "Tarda [X min] en llegar."])(
    "un pie con un hueco sin rellenar no se enseña: %s",
    (caption) => {
      expect(cleanCaption(caption)).toBe("");
    },
  );

  it("un pie que solo son etiquetas se queda vacío", () => {
    expect(cleanCaption("#stelvia #astronomia\n✨")).toBe("");
  });
});

describe("escaparate: qué se enseña en cada sitio", () => {
  const videos = parseShowcase(
    feed(
      piece({ id: id(1), proyecto: "t800", titulo: "Caso 1", publicadaEn: "2026-10-16T19:00:00.000Z" }),
      piece({ id: id(2), proyecto: "stelvia", titulo: "Estrella nueva", publicadaEn: "2026-10-14T18:30:00.000Z" }),
      piece({ id: id(3), proyecto: "guardesa", titulo: "Cobros", publicadaEn: "2026-10-13T18:30:00.000Z" }),
      piece({ id: id(4), proyecto: "stelvia", titulo: "Estrella vieja", publicadaEn: "2026-10-05T18:30:00.000Z" }),
    ),
  );

  it("los casos de /automatiza son solo los vídeos de T800 Labs", () => {
    expect(automationCases(videos).map((v) => v.title)).toEqual(["Caso 1"]);
  });

  it("la tira de productos lleva Guardesa y Stelvia, con tope", () => {
    expect(productVideos(videos, 2).map((v) => v.title)).toEqual(["Estrella nueva", "Cobros"]);
  });

  it("cada tarjeta del portfolio enseña el último vídeo de su marca", () => {
    const latest = latestByBrand(videos);
    expect(latest.stelvia?.title).toBe("Estrella nueva");
    expect(latest.guardesa?.title).toBe("Cobros");
    expect(latestByBrand([]).t800).toBeUndefined();
  });

  it("la fecha es la de Madrid, también cerca de medianoche", () => {
    // 22:30 UTC del día 14 ya es el día 15 en Madrid (UTC+2 en octubre).
    expect(formatPublishedDate("2026-10-14T22:30:00.000Z", "es")).toBe("15 oct");
    expect(formatPublishedDate("2026-10-14T22:30:00.000Z", "en")).toBe("15 Oct");
  });
});

describe("escaparate: lectura desde el servidor de la web", () => {
  const ok = (...piezas: unknown[]) => new Response(JSON.stringify(feed(...piezas)));

  it("pide la lista al panel y la guarda un minuto", async () => {
    let now = 1_000_000;
    const fetchImpl = vi.fn<typeof fetch>(async () => ok(piece()));
    const load = createShowcaseSource();
    const options = { waitMs: 1000, fetchImpl, now: () => now };

    expect((await load(options)).map((v) => v.title)).toEqual(["La luz de Altair"]);
    now += 59_000;
    await load(options);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    now += 2_000;
    await load(options);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[0][0]).toBe(SHOWCASE_URL);
  });

  it("si el panel falla, sigue enseñando la última lista buena", async () => {
    let now = 0;
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(ok(piece()))
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce(new Response("caído", { status: 503 }));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const load = createShowcaseSource();
    const options = { waitMs: 1000, fetchImpl, now: () => now };

    await load(options);
    for (let attempt = 0; attempt < 2; attempt++) {
      now += 61_000;
      expect((await load(options)).map((v) => v.title)).toEqual(["La luz de Altair"]);
    }
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it("sin ninguna lista previa y con el panel caído, la web sigue: lista vacía", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const load = createShowcaseSource();
    expect(await load({ waitMs: 1000, fetchImpl: vi.fn(async () => Promise.reject(new Error("sin red"))) })).toEqual([]);
    warn.mockRestore();
  });

  it("una página con lista vieja no espera al panel: da la que tiene y refresca por detrás", async () => {
    let now = 0;
    let release: (response: Response) => void = () => {};
    const slow = new Promise<Response>((resolve) => {
      release = resolve;
    });
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(ok(piece())).mockReturnValueOnce(slow);
    const load = createShowcaseSource();
    const options = { waitMs: 1000, staleOk: true, fetchImpl, now: () => now };

    await load(options);
    now += 61_000;
    // El panel aún no ha contestado y la página ya tiene su lista.
    expect((await load(options)).map((v) => v.title)).toEqual(["La luz de Altair"]);
    release(ok(piece({ titulo: "Recién salida" })));
    await vi.waitFor(async () => expect((await load(options)).map((v) => v.title)).toEqual(["Recién salida"]));
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("una página sin lista previa espera un instante y, si el panel no llega, sale sin vídeos", async () => {
    let release: (response: Response) => void = () => {};
    const slow = new Promise<Response>((resolve) => {
      release = resolve;
    });
    const fetchImpl = vi.fn<typeof fetch>().mockReturnValue(slow);
    const load = createShowcaseSource();

    expect(await load({ waitMs: 20, staleOk: true, fetchImpl })).toEqual([]);
    // La petición sigue viva: quien espere más (la ruta que llama el navegador) la aprovecha.
    const patient = load({ waitMs: 5_000, fetchImpl });
    release(ok(piece()));
    expect((await patient).map((v) => v.title)).toEqual(["La luz de Altair"]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("varias visitas a la vez comparten una sola petición", async () => {
    const fetchImpl = vi.fn(async () => ok(piece()));
    const load = createShowcaseSource();
    const options = { waitMs: 1000, fetchImpl };
    await Promise.all([load(options), load(options), load(options)]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
