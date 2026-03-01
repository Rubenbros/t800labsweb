import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { businesses } from "@/lib/demo/businesses";
import { sectors } from "@/lib/demo/sectors";
import { DemoPage } from "@/components/demo/DemoPage";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return Object.keys(businesses).flatMap((slug) => [
    { locale: "es", slug },
    { locale: "en", slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const business = businesses[slug];
  if (!business) return {};

  const t = await getTranslations({ locale, namespace: "Demo" });

  return {
    title: `${business.businessName} — ${t("metaTitle")}`,
    description: t("metaDesc", { name: business.businessName }),
    robots: { index: false, follow: false },
  };
}

export default async function DemoSlugPage({ params }: Props) {
  const { locale, slug } = await params;
  const business = businesses[slug];
  if (!business) notFound();

  const sector = sectors[business.sectorId];
  if (!sector) notFound();

  const t = await getTranslations({ locale, namespace: "Demo" });

  const translations = {
    heroTitle: t(`${business.sectorId}_heroTitle`, { name: business.businessName }),
    heroSubtitle: t(`${business.sectorId}_heroSubtitle`),
    heroBadge: t(`${business.sectorId}_heroBadge`),
    cta1: t(sector.ctaLabels.cta1Key),
    cta2: t(sector.ctaLabels.cta2Key),
    servicesTitle: t("servicesTitle"),
    servicesSubtitle: t("servicesSubtitle"),
    services: sector.services.map((s) => ({
      icon: s.icon,
      title: t(s.titleKey),
      desc: t(s.descKey),
    })),
    reviewsTitle: t("reviewsTitle"),
    reviewsSubtitle: t("reviewsSubtitle"),
    reviews: business.reviews.map((r) => ({
      author: r.author,
      rating: r.rating,
      text: t(r.textKey),
    })),
    reviewsBadge: t("reviewsBadge"),
    hoursTitle: t("hoursTitle"),
    contactTitle: t("contactTitle"),
    addressLabel: t("addressLabel"),
    phoneLabel: t("phoneLabel"),
    emailLabel: t("emailLabel"),
    closed: t("closed"),
    footerCreatedBy: t("footerCreatedBy"),
    footerRights: t("footerRights"),
    navServices: t("navServices"),
    navReviews: t("navReviews"),
    navHours: t("navHours"),
    navContact: t("navContact"),
    whatsappMsg: t("whatsappMsg", { name: business.businessName }),
    days: {
      Lunes: t("monday"),
      Martes: t("tuesday"),
      "Miércoles": t("wednesday"),
      Jueves: t("thursday"),
      Viernes: t("friday"),
      "Sábado": t("saturday"),
      Domingo: t("sunday"),
    },
  };

  return (
    <DemoPage
      business={business}
      sector={sector}
      translations={translations}
    />
  );
}
