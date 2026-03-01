import type { BusinessData, SectorConfig } from "@/lib/demo/types";
import { DemoHeader } from "./DemoHeader";
import { DemoHero } from "./DemoHero";
import { DemoServices } from "./DemoServices";
import { DemoReviews } from "./DemoReviews";
import { DemoHoursContact } from "./DemoHoursContact";
import { DemoFooter } from "./DemoFooter";
import { DemoWhatsApp } from "./DemoWhatsApp";

export interface DemoTranslations {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  cta1: string;
  cta2: string;
  servicesTitle: string;
  servicesSubtitle: string;
  services: { icon: string; title: string; desc: string }[];
  reviewsTitle: string;
  reviewsSubtitle: string;
  reviews: { author: string; rating: number; text: string }[];
  reviewsBadge: string;
  hoursTitle: string;
  contactTitle: string;
  addressLabel: string;
  phoneLabel: string;
  emailLabel: string;
  closed: string;
  footerCreatedBy: string;
  footerRights: string;
  navServices: string;
  navReviews: string;
  navHours: string;
  navContact: string;
  whatsappMsg: string;
  days: Record<string, string>;
}

interface DemoPageProps {
  business: BusinessData;
  sector: SectorConfig;
  translations: DemoTranslations;
}

export function DemoPage({ business, sector, translations }: DemoPageProps) {
  const heroImage = business.heroImage || sector.heroImageUrl;

  return (
    <>
      <DemoHeader
        businessName={business.businessName}
        cta={translations.cta1}
        isDark={sector.theme.isDark}
        navLinks={{
          services: translations.navServices,
          reviews: translations.navReviews,
          hours: translations.navHours,
          contact: translations.navContact,
        }}
      />

      <main>
        <DemoHero
          title={translations.heroTitle}
          subtitle={translations.heroSubtitle}
          badge={translations.heroBadge}
          cta1={translations.cta1}
          cta2={translations.cta2}
          imageUrl={heroImage}
          businessName={business.businessName}
        />

        <DemoServices
          title={translations.servicesTitle}
          subtitle={translations.servicesSubtitle}
          services={translations.services}
          isDark={sector.theme.isDark}
        />

        <DemoReviews
          title={translations.reviewsTitle}
          subtitle={translations.reviewsSubtitle}
          reviews={translations.reviews}
          rating={business.rating}
          reviewCount={business.reviewCount}
          badgeLabel={translations.reviewsBadge}
        />

        <DemoHoursContact
          hoursTitle={translations.hoursTitle}
          contactTitle={translations.contactTitle}
          hours={business.hours}
          address={business.address}
          phone={business.phone}
          email={business.email}
          closedLabel={translations.closed}
          addressLabel={translations.addressLabel}
          phoneLabel={translations.phoneLabel}
          emailLabel={translations.emailLabel}
          mapEmbedUrl={business.mapEmbedUrl}
          dayLabels={translations.days}
        />
      </main>

      <DemoFooter
        businessName={business.businessName}
        createdBy={translations.footerCreatedBy}
        rights={translations.footerRights}
      />

      {business.whatsapp && (
        <DemoWhatsApp
          phone={business.whatsapp}
          message={translations.whatsappMsg}
        />
      )}
    </>
  );
}
