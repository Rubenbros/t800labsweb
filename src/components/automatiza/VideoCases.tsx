"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  NETWORK_NAMES,
  automationCases,
  formatPublishedDate,
  type PublishedVideo,
} from "@/lib/escaparate/feed";
import { usePublishedVideos } from "@/lib/escaparate/use-published-videos";
import { VideoCover } from "./VideoCover";
import { WhatsAppCta } from "./WhatsAppCta";
import { CONTAINER, EYEBROW, SECTION_TITLE } from "./styles";

const MAX_CASES = 6;

/**
 * Los casos que se han enseñado en vídeo: los vídeos de T800 Labs que ya han salido en las
 * redes. Nadie los añade a mano; mientras no haya ninguno, la sección no existe.
 */
export function VideoCases({ initial }: { initial: PublishedVideo[] }) {
  const t = useTranslations("Automatiza.cases");
  const locale = useLocale();
  const cases = automationCases(usePublishedVideos(initial)).slice(0, MAX_CASES);

  if (cases.length === 0) return null;

  return (
    <section id="casos" className="border-t border-white/5 py-20 md:py-28">
      <div className={CONTAINER}>
        <div className="max-w-2xl">
          <p className={EYEBROW}>{t("eyebrow")}</p>
          <h2 className={SECTION_TITLE}>{t("title")}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-white/70">{t("lead")}</p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {cases.map((video) => (
            <li key={video.id} className="flex gap-5 rounded-lg border border-white/10 bg-[#0a0a0a] p-4 md:p-5">
              <VideoCover video={video} sizes="112px" className="w-24 shrink-0 self-start md:w-28" />
              <div className="flex min-w-0 flex-col">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/50">
                  <time dateTime={video.publishedAt}>{formatPublishedDate(video.publishedAt, locale)}</time>
                </p>
                <h3 className="mt-1.5 text-lg font-bold leading-snug text-white">{video.title}</h3>
                {video.caption && (
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-white/70">{video.caption}</p>
                )}
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em]">
                  {video.links.map((link) => (
                    <a
                      key={link.network}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 underline decoration-white/25 underline-offset-4 transition-colors duration-300 hover:text-white"
                    >
                      {t("watchOn", { network: NETWORK_NAMES[link.network] })}
                    </a>
                  ))}
                </p>
                <div className="mt-auto pt-4">
                  <WhatsAppCta
                    placement="case"
                    caseTitle={video.title}
                    className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#25D366] transition-colors duration-300 hover:text-[#4ae586]"
                  >
                    {t("cta")}
                  </WhatsAppCta>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
