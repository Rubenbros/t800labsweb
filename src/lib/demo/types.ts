export interface SectorTheme {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  bgMain: string;
  bgSection: string;
  bgDark: string;
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
  borderColor: string;
  cardBg: string;
  isDark: boolean;
}

export interface ServiceItem {
  icon: string;
  titleKey: string;
  descKey: string;
}

export interface HoursData {
  [day: string]: string;
}

export interface ReviewData {
  author: string;
  rating: number;
  textKey: string;
}

export interface SectorConfig {
  id: string;
  theme: SectorTheme;
  services: ServiceItem[];
  heroImageUrl: string;
  defaultHours: HoursData;
  ctaLabels: { cta1Key: string; cta2Key: string };
}

export interface BusinessData {
  slug: string;
  sectorId: string;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  whatsapp?: string;
  rating: number;
  reviewCount: number;
  hours: HoursData;
  reviews: ReviewData[];
  heroImage?: string;
  mapEmbedUrl?: string;
}
