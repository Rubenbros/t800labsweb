// Escaparate: los vídeos que ya han salido en las redes, tal como los da el panel de
// marketing (marketing-t800labs, ADR-MKT-012). La web los enseña sin que nadie la toque.
// Lo que llega de fuera se valida entero aquí: una pieza que no encaja se descarta.
import { z } from "zod";

export const SHOWCASE_URL = "https://panel.t800labs.com/api/publico/escaparate";

/** Marcas que se enseñan en t800labs.com. */
export const BRANDS = ["t800", "guardesa", "stelvia"] as const;
export type Brand = (typeof BRANDS)[number];

export const BRAND_NAMES: Record<Brand, string> = {
  t800: "T800 Labs",
  guardesa: "Guardesa",
  stelvia: "Stelvia",
};

const NETWORK_HOSTS = {
  instagram: ["instagram.com"],
  youtube: ["youtube.com", "youtu.be"],
  tiktok: ["tiktok.com"],
  facebook: ["facebook.com", "fb.watch"],
  linkedin: ["linkedin.com"],
} as const;

export type Network = keyof typeof NETWORK_HOSTS;

export const NETWORK_NAMES: Record<Network, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};

export type VideoLink = { network: Network; url: string };

export type PublishedVideo = {
  id: string;
  brand: Brand;
  title: string;
  /** Lo que cuenta el pie, sin etiquetas ni enlaces. Vacío si no queda nada que enseñar. */
  caption: string;
  /** Fecha ISO de la primera red en la que salió. */
  publishedAt: string;
  /** Portada servida por el panel, o null si la pieza no tiene. */
  cover: string | null;
  links: VideoLink[];
};

const pieceSchema = z.object({
  id: z.string().uuid(),
  proyecto: z.enum(BRANDS),
  titulo: z.string().trim().min(1).max(300),
  pie: z.string().max(5000),
  publicadaEn: z.string().datetime(),
  portada: z.string().nullable(),
  redes: z.array(z.object({ red: z.string(), url: z.string() })).max(10),
});

const feedSchema = z.object({ piezas: z.array(z.unknown()).max(100) });

function isNetwork(value: string): value is Network {
  return Object.hasOwn(NETWORK_HOSTS, value);
}

/** Solo enlaces https al dominio de su red: es lo único que se pinta como enlace. */
function networkLink(network: string, url: string): VideoLink | null {
  if (!isNetwork(network)) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^(www|m)\./, "");
    const hosts: readonly string[] = NETWORK_HOSTS[network];
    return parsed.protocol === "https:" && hosts.includes(host) ? { network, url: parsed.toString() } : null;
  } catch {
    return null;
  }
}

/** La portada solo se carga si la sirve el propio escaparate. */
function coverUrl(url: string | null, feedUrl: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const feed = new URL(feedUrl);
    return parsed.origin === feed.origin && parsed.pathname.startsWith(`${feed.pathname}/portada/`) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Del pie de la red, lo que se lee bien en una web: fuera las etiquetas y los enlaces.
 * Un pie con un hueco sin rellenar («{duracion}», «[X min]») no se enseña.
 */
export function cleanCaption(caption: string): string {
  if (/\{[^}]*\}|\[[^\]]*\]/.test(caption)) return "";
  return caption
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/https?:\/\/\S+/g, "")
        .replace(/(^|\s)#[\p{L}\p{N}_]+/gu, "")
        .replace(/\s{2,}/g, " ")
        .trim(),
    )
    // Fuera las líneas sin texto y las que se quedan colgando al quitarles el enlace («Entra en:»).
    .filter((line) => /[\p{L}\p{N}]/u.test(line) && !line.endsWith(":"))
    .join(" ");
}

/** Los títulos de las piezas con cara llegan entre comillas angulares: en la web sobran. */
function cleanTitle(title: string): string {
  return title.replace(/^«([\s\S]*)»$/, "$1").trim();
}

/** Valida la respuesta del panel y la pasa al modelo de la web. Nunca lanza. */
export function parseShowcase(payload: unknown, feedUrl: string = SHOWCASE_URL): PublishedVideo[] {
  const feed = feedSchema.safeParse(payload);
  if (!feed.success) return [];

  const videos: PublishedVideo[] = [];
  for (const raw of feed.data.piezas) {
    const piece = pieceSchema.safeParse(raw);
    if (!piece.success) continue;
    const links = piece.data.redes
      .map(({ red, url }) => networkLink(red, url))
      .filter((link): link is VideoLink => link !== null);
    if (links.length === 0) continue;
    videos.push({
      id: piece.data.id,
      brand: piece.data.proyecto,
      title: cleanTitle(piece.data.titulo),
      caption: cleanCaption(piece.data.pie),
      publishedAt: piece.data.publicadaEn,
      cover: coverUrl(piece.data.portada, feedUrl),
      links,
    });
  }
  return videos.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Los casos de automatización: los vídeos de la marca T800 Labs. */
export function automationCases(videos: readonly PublishedVideo[]): PublishedVideo[] {
  return videos.filter((video) => video.brand === "t800");
}

/** Los vídeos de los productos propios (Guardesa, Stelvia), los más recientes primero. */
export function productVideos(videos: readonly PublishedVideo[], limit: number): PublishedVideo[] {
  return videos.filter((video) => video.brand !== "t800").slice(0, limit);
}

/** El último vídeo de cada marca. */
export function latestByBrand(videos: readonly PublishedVideo[]): Partial<Record<Brand, PublishedVideo>> {
  const latest: Partial<Record<Brand, PublishedVideo>> = {};
  for (const video of videos) latest[video.brand] ??= video;
  return latest;
}

/** «12 oct» / «12 Oct», siempre con la fecha de Madrid: igual en el servidor y en el navegador. */
export function formatPublishedDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(iso));
}
