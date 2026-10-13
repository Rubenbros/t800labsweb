import { describe, expect, it } from "vitest";

import {
  CUSTOM_TIERS,
  LOWEST_SETUP_PRICE,
  MONTHLY_FEE,
  PACKAGES,
  formatEuroRange,
  formatEuros,
} from "@/lib/automatiza/offer";
import {
  WHATSAPP_NUMBER,
  buildWhatsAppUrl,
  resolveOrigin,
} from "@/lib/automatiza/whatsapp";

describe("oferta de /automatiza", () => {
  it("lleva los precios de los paquetes de la BDR-MKT-08", () => {
    const prices = Object.fromEntries(PACKAGES.map((p) => [p.id, p.setupPrice]));
    expect(prices).toEqual({ p1: 890, p2: 1490, p3: 690 });
    expect(MONTHLY_FEE).toBe(49);
    expect(LOWEST_SETUP_PRICE).toBe(690);
  });

  it("lleva los tramos a medida de la BDR-MKT-09, sin huecos entre ellos", () => {
    expect(CUSTOM_TIERS.map(({ id, from, to, perPhase }) => [id, from, to, perPhase])).toEqual([
      ["t1", 690, 1490, false],
      ["t2", 1500, 3000, false],
      ["t3", 3000, 6000, true],
    ]);
    // Una tarea suelta cuesta como un paquete: el primer tramo abarca los tres.
    const prices = PACKAGES.map((p) => p.setupPrice);
    expect(CUSTOM_TIERS[0].from).toBe(Math.min(...prices));
    expect(CUSTOM_TIERS[0].to).toBe(Math.max(...prices));
  });

  it("formatea los euros con separador de miles en los dos idiomas", () => {
    // Intl separa el símbolo con un espacio de no separación.
    expect(formatEuros(1490, "es").replace(/\s/g, " ")).toBe("1.490 €");
    expect(formatEuros(890, "es").replace(/\s/g, " ")).toBe("890 €");
    expect(formatEuros(1490, "en")).toBe("€1,490");
  });

  it("formatea los tramos con el símbolo una sola vez en español", () => {
    expect(formatEuroRange(690, 1490, "es").replace(/\s/g, " ")).toBe("690–1.490 €");
    expect(formatEuroRange(1500, 3000, "es").replace(/\s/g, " ")).toBe("1.500–3.000 €");
    expect(formatEuroRange(3000, 6000, "en")).toBe("€3,000–€6,000");
  });
});

describe("origen del visitante", () => {
  it.each([
    ["instagram", "instagram"],
    ["TikTok", "tiktok"],
    [" youtube ", "youtube"],
    ["facebook", "facebook"],
    ["ig", "instagram"],
    ["fb", "facebook"],
    ["yt", "youtube"],
  ])("reconoce %s", (param, expected) => {
    expect(resolveOrigin(param)).toBe(expected);
  });

  it.each([null, undefined, "", "newsletter", "<script>", "instagram.com", "web"])(
    "trata %s como visita desde la web",
    (param) => {
      expect(resolveOrigin(param)).toBe("web");
    },
  );
});

describe("enlace de WhatsApp", () => {
  it("apunta al número de la web y codifica el mensaje", () => {
    const url = buildWhatsAppUrl("Hola, vengo de Instagram. ¿Qué tal & cuánto?");
    expect(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`)).toBe(true);
    expect(WHATSAPP_NUMBER).toBe("34645515267");
    expect(new URL(url).searchParams.get("text")).toBe(
      "Hola, vengo de Instagram. ¿Qué tal & cuánto?",
    );
  });
});
