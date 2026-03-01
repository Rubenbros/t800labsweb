import HomeClient from "./HomeClient";
import { getTranslations } from "next-intl/server";

const BASE_URL = "https://t800labs.com";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const faq = await getTranslations({ locale, namespace: "FAQ" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "T800 Labs",
        url: BASE_URL,
        logo: `${BASE_URL}/logo-t800labs.png`,
        description: t("description"),
        founder: {
          "@type": "Person",
          name: "Rubén Jarné Cabañero",
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "ruben.jarne.cabanero@gmail.com",
          telephone: "+34645515267",
          contactType: "sales",
          availableLanguage: ["Spanish", "English"],
        },
        sameAs: [
          "https://github.com/Rubenbros",
          "https://www.linkedin.com/in/ruben-jarne/",
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${BASE_URL}/#localbusiness`,
        name: "T800 Labs",
        url: BASE_URL,
        image: `${BASE_URL}/logo-t800labs.png`,
        telephone: "+34645515267",
        email: "ruben.jarne.cabanero@gmail.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Zaragoza",
          addressRegion: "Aragón",
          addressCountry: "ES",
        },
        priceRange: "€€",
        openingHours: "Mo-Fr 09:00-18:00",
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "T800 Labs",
        publisher: { "@id": `${BASE_URL}/#organization` },
        inLanguage: ["es", "en"],
      },
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/#webpage`,
        url: locale === "es" ? BASE_URL : `${BASE_URL}/${locale}`,
        name: t("title"),
        description: t("description"),
        isPartOf: { "@id": `${BASE_URL}/#website` },
        about: { "@id": `${BASE_URL}/#organization` },
        inLanguage: locale,
      },
      ...[
        {
          name: locale === "es" ? "Desarrollo Web" : "Web Development",
          description:
            locale === "es"
              ? "Webs y aplicaciones web a medida con React, Next.js, full-stack."
              : "Custom websites and web applications with React, Next.js, full-stack.",
        },
        {
          name: locale === "es" ? "IA y Automatización" : "AI & Automation",
          description:
            locale === "es"
              ? "Integraciones de inteligencia artificial, chatbots y automatización de procesos."
              : "AI integrations, chatbots, and business process automation.",
        },
        {
          name: locale === "es" ? "Apps Móviles" : "Mobile Apps",
          description:
            locale === "es"
              ? "Aplicaciones nativas e híbridas para iOS y Android."
              : "Native and hybrid applications for iOS and Android.",
        },
        {
          name: "Cloud & DevOps",
          description:
            locale === "es"
              ? "Infraestructura cloud, CI/CD, contenedores y despliegues automatizados."
              : "Cloud infrastructure, CI/CD pipelines, containers and automated deployments.",
        },
        {
          name: locale === "es" ? "Software a Medida" : "Custom Software",
          description:
            locale === "es"
              ? "Soluciones de software a medida para necesidades empresariales específicas."
              : "Tailored software solutions for specific business needs.",
        },
      ].map((service) => ({
        "@type": "Service",
        provider: { "@id": `${BASE_URL}/#organization` },
        areaServed: { "@type": "Country", name: "Spain" },
        name: service.name,
        description: service.description,
      })),
      {
        "@type": "FAQPage",
        mainEntity: [1, 2, 3, 4, 5, 6].map((i) => ({
          "@type": "Question",
          name: faq(`q${i}`),
          acceptedAnswer: {
            "@type": "Answer",
            text: faq(`a${i}`),
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}
