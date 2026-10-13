// Enlace de WhatsApp de la página /automatiza. El mensaje ya escrito dice de qué red
// viene el visitante (utm_source del enlace del perfil) para poder atribuirlo al leerlo.

export const WHATSAPP_NUMBER = "34645515267";

/** Redes desde las que se enlaza la página; cualquier otro origen cuenta como «web». */
export const ORIGINS = ["instagram", "tiktok", "youtube", "facebook", "web"] as const;

export type Origin = (typeof ORIGINS)[number];

const ALIASES: Record<string, Origin> = {
  ig: "instagram",
  fb: "facebook",
  yt: "youtube",
};

/** `utm_source` llega de la URL: solo se acepta lo que está en la lista. */
export function resolveOrigin(utmSource: string | null | undefined): Origin {
  if (!utmSource) return "web";
  const value = utmSource.trim().toLowerCase();
  if ((ORIGINS as readonly string[]).includes(value)) return value as Origin;
  return ALIASES[value] ?? "web";
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
