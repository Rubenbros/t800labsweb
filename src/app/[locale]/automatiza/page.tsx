import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AutomatizaPage } from "@/components/automatiza/AutomatizaPage";
import { PACKAGES } from "@/lib/automatiza/offer";
import { OG_IMAGE } from "@/lib/seo";

const BASE_URL = "https://t800labs.com";

type Props = {
  params: Promise<{ locale: string }>;
};

function pageUrl(locale: string): string {
  return locale === "es" ? `${BASE_URL}/automatiza` : `${BASE_URL}/${locale}/automatiza`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Automatiza" });
  const url = pageUrl(locale);

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      languages: {
        es: pageUrl("es"),
        en: pageUrl("en"),
        "x-default": pageUrl("es"),
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      url,
      siteName: "T800 Labs",
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
      images: [OG_IMAGE.url],
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Automatiza" });
  const faq = t.raw("faq.items") as { q: string; a: string }[];
  const url = pageUrl(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: t("metaTitle"),
        description: t("metaDescription"),
        isPartOf: { "@id": `${BASE_URL}/#website` },
        inLanguage: locale,
      },
      ...PACKAGES.map((pkg) => ({
        "@type": "Service",
        name: t(`packages.${pkg.id}.name`),
        description: t(`packages.${pkg.id}.summary`),
        provider: { "@id": `${BASE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Spain" },
        // Precio de la puesta en marcha, sin IVA. La cuota mensual va en el texto.
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "EUR",
          price: pkg.setupPrice,
          priceSpecification: {
            "@type": "PriceSpecification",
            price: pkg.setupPrice,
            priceCurrency: "EUR",
            valueAddedTaxIncluded: false,
          },
        },
      })),
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <AutomatizaPage locale={locale} />
    </>
  );
}
