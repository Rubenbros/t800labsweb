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
          email: "hola@t800labs.com",
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
        email: "hola@t800labs.com",
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
          name: locale === "es" ? "Diseño y Desarrollo Web" : "Web Design & Development",
          description:
            locale === "es"
              ? "Webs profesionales desde cero, rápidas, adaptadas a móvil y optimizadas para Google."
              : "Professional websites from scratch, fast, mobile-ready and optimized for Google.",
        },
        {
          name: locale === "es" ? "Automatización con IA" : "AI Automation",
          description:
            locale === "es"
              ? "Automatización de tareas con inteligencia artificial: respuestas automáticas, facturación, gestión de stock."
              : "Task automation with AI: auto-replies, invoicing, stock management.",
        },
        {
          name: locale === "es" ? "Reservas y Citas Online" : "Online Bookings & Appointments",
          description:
            locale === "es"
              ? "Sistemas de reservas online para que tus clientes reserven sin llamar. Avisos automáticos incluidos."
              : "Online booking systems so your customers can book without calling. Automatic reminders included.",
        },
        {
          name: locale === "es" ? "Tienda Online" : "Online Store",
          description:
            locale === "es"
              ? "E-commerce con catálogo, carrito, pagos seguros y gestión desde el móvil."
              : "E-commerce with catalog, cart, secure payments and mobile management.",
        },
        {
          name: locale === "es" ? "Apps a Medida" : "Custom Apps",
          description:
            locale === "es"
              ? "Aplicaciones y paneles de gestión a medida para necesidades específicas de tu negocio."
              : "Custom applications and admin panels for your specific business needs.",
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
        mainEntity: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({
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
