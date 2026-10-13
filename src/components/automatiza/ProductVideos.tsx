"use client";

import { useLocale, useTranslations } from "next-intl";
import { BRAND_NAMES, formatPublishedDate, productVideos, type PublishedVideo } from "@/lib/escaparate/feed";
import { usePublishedVideos } from "@/lib/escaparate/use-published-videos";
import { VideoCover } from "./VideoCover";

const MAX_VIDEOS = 4;

/**
 * Prueba de «lo que ya funciona»: los últimos vídeos de Guardesa y Stelvia, que se
 * publican solos. La tira se rellena sola con lo que va saliendo en las redes.
 */
export function ProductVideos({ initial }: { initial: PublishedVideo[] }) {
  const t = useTranslations("Automatiza.about");
  const locale = useLocale();
  const videos = productVideos(usePublishedVideos(initial), MAX_VIDEOS);

  if (videos.length === 0) return null;

  return (
    <div id="ultimos-videos" className="mt-8 scroll-mt-6">
      <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">{t("videosTitle")}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-white/75">{t("videosBody")}</p>
      {/* En móvil, una fila que se desliza: cuatro portadas verticales en rejilla ocuparían dos pantallas */}
      <ul className="mt-5 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0">
        {videos.map((video) => (
          <li key={video.id} className="w-32 shrink-0 sm:w-auto">
            <a
              href={video.links[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <VideoCover
                video={video}
                sizes="(min-width: 640px) 150px, 128px"
                className="transition-colors duration-300 group-hover:border-white/40"
              />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-[#ff4d4d]">
                {BRAND_NAMES[video.brand]} ·{" "}
                <time dateTime={video.publishedAt}>{formatPublishedDate(video.publishedAt, locale)}</time>
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-white/70 transition-colors duration-300 group-hover:text-white">
                {video.title}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
