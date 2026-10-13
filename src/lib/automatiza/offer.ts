// Oferta de T800 Labs: automatización con IA para negocios. Las cifras salen de las
// BDR-MKT-08 y 09 (marketing-t800labs/docs/t800labs/oferta.md): si cambian allí, se
// cambian aquí. Los textos viven en messages/*.json (Automatiza).

export type PackageId = "p1" | "p2" | "p3";

/** Ejemplo con precio público: sirve a cualquier sector tal cual. */
export type OfferPackage = {
  id: PackageId;
  /** Puesta en marcha, en euros sin IVA. */
  setupPrice: number;
};

export const PACKAGES: readonly OfferPackage[] = [
  { id: "p1", setupPrice: 890 },
  { id: "p2", setupPrice: 1490 },
  { id: "p3", setupPrice: 690 },
];

export type CustomTierId = "t1" | "t2" | "t3";

/** Tramo orientativo de lo que va a medida: cada propuesta da un precio cerrado dentro. */
export type CustomTier = {
  id: CustomTierId;
  /** Puesta en marcha mínima y máxima, en euros sin IVA. */
  from: number;
  to: number;
  /** El tramo de varios procesos se cobra por fase. */
  perPhase: boolean;
};

export const CUSTOM_TIERS: readonly CustomTier[] = [
  { id: "t1", from: 690, to: 1490, perPhase: false },
  { id: "t2", from: 1500, to: 3000, perPhase: false },
  { id: "t3", from: 3000, to: 6000, perPhase: true },
];

/** Cuota mensual por automatización, en euros sin IVA. */
export const MONTHLY_FEE = 49;

export const LOWEST_SETUP_PRICE = Math.min(...PACKAGES.map((p) => p.setupPrice));

function intlLocale(locale: string): string {
  return locale === "es" ? "es-ES" : "en-IE";
}

/** «1.490 €» en español, «€1,490» en inglés. Siempre con separador de miles. */
export function formatEuros(amount: number, locale: string): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    useGrouping: "always",
  }).format(amount);
}

/** «1.500–3.000 €» en español, «€1,500–€3,000» en inglés. */
export function formatEuroRange(from: number, to: number, locale: string): string {
  if (locale !== "es") return `${formatEuros(from, locale)}–${formatEuros(to, locale)}`;
  const number = new Intl.NumberFormat(intlLocale(locale), { useGrouping: "always" });
  return `${number.format(from)}–${formatEuros(to, locale)}`;
}
