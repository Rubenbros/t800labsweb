import { getTranslations } from "next-intl/server";
import { MONTHLY_FEE, formatEuros, type OfferPackage } from "@/lib/automatiza/offer";
import { WhatsAppCta } from "./WhatsAppCta";
import { BUTTON_OUTLINE } from "./styles";

type Props = {
  pkg: OfferPackage;
  index: number;
  locale: string;
};

const LABEL = "font-mono text-[11px] uppercase tracking-[0.15em] text-white/50";

export async function PackageCard({ pkg, index, locale }: Props) {
  const t = await getTranslations({ locale, namespace: "Automatiza.packages" });
  const name = t(`${pkg.id}.name`);
  const includes = t.raw(`${pkg.id}.includes`) as string[];
  const excludes = t.raw(`${pkg.id}.excludes`) as string[];

  return (
    <article data-reveal className="flex flex-col rounded-lg border border-white/10 bg-[#0a0a0a] p-6 md:p-7">
      <p className="font-mono text-[11px] tracking-[0.25em] text-[#ff4d4d]">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-2 text-2xl font-bold leading-tight text-white">{name}</h3>
      <p className="mt-2 text-sm leading-snug text-white/60">{t(`${pkg.id}.audience`)}</p>

      <p className="mt-5 flex items-baseline gap-2">
        <span className="text-[2.5rem] font-bold leading-none tracking-tight text-white">
          {formatEuros(pkg.setupPrice, locale)}
        </span>
        <span className="font-mono text-xs text-white/60">{t("plusVat")}</span>
      </p>
      <p className="mt-2 font-mono text-xs text-white/60">
        {t("setupLabel")} · {t("monthly", { fee: formatEuros(MONTHLY_FEE, locale) })}
      </p>

      <p className="mt-5 text-[15px] leading-relaxed text-white/75">{t(`${pkg.id}.summary`)}</p>

      <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm leading-snug">
        <div className="flex gap-3">
          <dt className={`${LABEL} w-20 shrink-0 pt-0.5 tracking-[0.12em]`}>{t("deadlineLabel")}</dt>
          <dd className="text-white/80">{t(`${pkg.id}.deadline`)}</dd>
        </div>
        <div className="flex gap-3">
          <dt className={`${LABEL} w-20 shrink-0 pt-0.5 tracking-[0.12em]`}>{t("usageLabel")}</dt>
          <dd className="text-white/80">{t(`${pkg.id}.usage`)}</dd>
        </div>
      </dl>

      <details className="group mt-4 border-t border-white/10 pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.15em] text-white/70 transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
          {t("details")}
          <span aria-hidden="true" className="text-base leading-none text-[#ff4d4d] transition-transform duration-300 group-open:rotate-45">
            +
          </span>
        </summary>

        <h4 className={`${LABEL} mt-4`}>{t("includesLabel")}</h4>
        <ul className="mt-2 space-y-1.5 text-sm leading-snug text-white/80">
          {includes.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="text-[#25D366]">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <h4 className={`${LABEL} mt-4`}>{t("excludesLabel")}</h4>
        <ul className="mt-2 space-y-1.5 text-sm leading-snug text-white/60">
          {excludes.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="text-white/40">✕</span>
              {item}
            </li>
          ))}
        </ul>

        <h4 className={`${LABEL} mt-4`}>{t("youProvideLabel")}</h4>
        <p className="mt-2 text-sm leading-snug text-white/80">{t(`${pkg.id}.youProvide`)}</p>

        <p className="mt-4 border-l-2 border-[#e50914]/50 pl-3 text-sm leading-snug text-white/60">
          {t(`${pkg.id}.note`)}
        </p>
      </details>

      <div className="mt-auto pt-6">
        <WhatsAppCta placement={`package-${pkg.id}`} packageName={name} className={`w-full ${BUTTON_OUTLINE}`}>
          {t("cta")}
        </WhatsAppCta>
      </div>
    </article>
  );
}
