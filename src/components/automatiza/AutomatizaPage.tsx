import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import LanguageSelector from "@/components/LanguageSelector";
import { CUSTOM_TIERS, MONTHLY_FEE, PACKAGES, formatEuroRange, formatEuros } from "@/lib/automatiza/offer";
import { AutomatizaForm } from "./AutomatizaForm";
import { AutomatizaMotion } from "./AutomatizaMotion";
import { ChatDemo } from "./ChatDemo";
import { PackageCard } from "./PackageCard";
import { StickyCta } from "./StickyCta";
import { WhatsAppCta } from "./WhatsAppCta";
import { BUTTON_OUTLINE, BUTTON_WHATSAPP, CONTAINER, EYEBROW, SECTION_TITLE } from "./styles";

type TitledItem = { title: string; body: string };
type FaqItem = { q: string; a: string };

export async function AutomatizaPage({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Automatiza" });
  const steps = t.raw("steps.items") as TitledItem[];
  const conditions = t.raw("conditions.items") as TitledItem[];
  const proof = t.raw("about.proof") as string[];
  const faq = t.raw("faq.items") as FaqItem[];
  const fee = formatEuros(MONTHLY_FEE, locale);

  return (
    <div className="relative min-h-screen bg-black text-white">
      <AutomatizaMotion />

      {/* ── CABECERA ── */}
      <header className={`${CONTAINER} relative z-20 flex items-center justify-between py-5`}>
        <Link href="/" aria-label={t("header.home")} className="flex items-center">
          {/* El PNG trae mucho aire a los lados de la calavera: los márgenes negativos lo recortan */}
          <Image src="/logo-t800labs.png" alt="" width={110} height={60} priority className="-ml-7 -mr-5" />
          <span className="text-lg font-bold tracking-tight text-white">
            T800<span className="text-[#e50914]">Labs</span>
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <LanguageSelector />
          <WhatsAppCta
            placement="header"
            className="hidden items-center gap-2 rounded-md border border-[#25D366]/50 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#25D366] transition-colors duration-300 hover:bg-[#25D366]/10 md:inline-flex"
          >
            {t("header.cta")}
          </WhatsAppCta>
        </div>
      </header>

      <main>
        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 55% 60% at 85% 35%, rgba(229,9,20,0.16) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 0% 0%, rgba(229,9,20,0.08) 0%, transparent 70%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "linear-gradient(to bottom, black 30%, transparent 95%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 95%)",
            }}
          />

          <div className={`${CONTAINER} relative grid items-center gap-14 pb-20 pt-8 md:grid-cols-[1.15fr_0.85fr] md:gap-10 md:pb-28 md:pt-14`}>
            <div>
              <p className={EYEBROW}>{t("hero.eyebrow")}</p>
              <h1 className="mt-4 text-[2.15rem] font-bold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                {t("hero.title")} <span className="block text-[#e50914]">{t("hero.titleAccent")}</span>
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/75 md:text-lg">
                {t("hero.lead")}
              </p>

              <div id="hero-cta" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <WhatsAppCta placement="hero" className={BUTTON_WHATSAPP}>
                  {t("hero.cta")}
                </WhatsAppCta>
                <a href="#paquetes" className={BUTTON_OUTLINE}>
                  {t("hero.secondary")}
                </a>
              </div>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60">{t("hero.ctaNote")}</p>
            </div>

            <ChatDemo />
          </div>

          {/* Esquinas, como en el resto de la web */}
          <div aria-hidden="true" className="pointer-events-none absolute bottom-6 left-6 hidden lg:block">
            <div className="h-8 w-[1px] bg-gradient-to-t from-[#e50914]/50 to-transparent" />
            <div className="absolute bottom-0 h-[1px] w-8 bg-gradient-to-r from-[#e50914]/50 to-transparent" />
            <span className="absolute bottom-3 left-3 font-mono text-[9px] tracking-[0.3em] text-white/40">
              {t("hero.cornerSys")}
            </span>
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute bottom-6 right-6 hidden lg:block">
            <div className="ml-auto h-8 w-[1px] bg-gradient-to-t from-[#e50914]/50 to-transparent" />
            <div className="absolute bottom-0 right-0 h-[1px] w-8 bg-gradient-to-l from-[#e50914]/50 to-transparent" />
            <span className="absolute bottom-3 right-3 whitespace-nowrap font-mono text-[9px] tracking-[0.3em] text-white/40">
              {t("hero.cornerLabel")}
            </span>
          </div>
        </section>

        {/* ── PAQUETES ── */}
        <section id="paquetes" className="border-t border-white/5 py-20 md:py-28">
          <div className={CONTAINER}>
            <div data-reveal className="max-w-2xl">
              <p className={EYEBROW}>{t("packages.eyebrow")}</p>
              <h2 className={SECTION_TITLE}>{t("packages.title")}</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-white/70">{t("packages.lead")}</p>
            </div>

            <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
              {PACKAGES.map((pkg, index) => (
                <PackageCard key={pkg.id} pkg={pkg} index={index} locale={locale} />
              ))}
            </div>

            <div data-reveal className="mt-8 rounded-lg border border-white/10 bg-[#0a0a0a] p-6 md:flex md:items-baseline md:gap-8 md:p-7">
              <h3 className="shrink-0 text-lg font-bold leading-snug text-white md:w-72">{t("fee.title", { fee })}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/70 md:mt-0">{t("fee.body")}</p>
            </div>
          </div>
        </section>

        {/* ── A MEDIDA ── */}
        <section id="a-medida" className="border-t border-white/5 bg-[#050505] py-20 md:py-28">
          <div className={CONTAINER}>
            <div data-reveal className="max-w-2xl">
              <p className={EYEBROW}>{t("custom.eyebrow")}</p>
              <h2 className={SECTION_TITLE}>{t("custom.title")}</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-white/70">{t("custom.lead", { fee })}</p>
            </div>

            <ol className="mt-12 divide-y divide-white/10 border-y border-white/10">
              {CUSTOM_TIERS.map((tier) => (
                <li key={tier.id} data-reveal className="grid gap-4 py-7 md:grid-cols-[1fr_1.5fr] md:gap-10">
                  <div>
                    <h3 className="text-xl font-bold leading-snug text-white">{t(`custom.tiers.${tier.id}.name`)}</h3>
                    <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-[1.75rem] font-bold leading-none tracking-tight text-white">
                        {formatEuroRange(tier.from, tier.to, locale)}
                      </span>
                      {tier.perPhase && (
                        <span className="font-mono text-xs text-white/60">{t("custom.perPhase")}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-[15px] leading-relaxed">
                    <p className="text-white/75">{t(`custom.tiers.${tier.id}.body`)}</p>
                    <p className="mt-3 text-white/60">
                      <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/50">
                        {t("custom.examplesLabel")}
                      </span>
                      {t(`custom.tiers.${tier.id}.examples`)}
                    </p>
                    <p className="mt-3 text-white/60">
                      <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/50">
                        {t("custom.deadlineLabel")}
                      </span>
                      {t(`custom.tiers.${tier.id}.deadline`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div data-reveal className="mt-8 rounded-lg border border-[#e50914]/40 bg-[#110506] p-6 md:flex md:items-baseline md:gap-8 md:p-7">
              <h3 className="shrink-0 text-lg font-bold leading-snug text-white md:w-72">{t("custom.honestTitle")}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/75 md:mt-0">{t("custom.honestBody")}</p>
            </div>
          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section className="border-t border-white/5 py-20 md:py-28">
          <div className={CONTAINER}>
            <div data-reveal className="max-w-2xl">
              <p className={EYEBROW}>{t("steps.eyebrow")}</p>
              <h2 className={SECTION_TITLE}>{t("steps.title")}</h2>
            </div>

            <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {steps.map((step, index) => (
                <li key={step.title} data-reveal className="border-t border-[#e50914]/50 pt-5">
                  <span className="font-mono text-sm tracking-[0.2em] text-[#ff4d4d]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-xl font-bold leading-snug text-white">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── CONDICIONES ── */}
        <section className="border-t border-white/5 bg-[#050505] py-20 md:py-28">
          <div className={CONTAINER}>
            <div data-reveal className="max-w-2xl">
              <p className={EYEBROW}>{t("conditions.eyebrow")}</p>
              <h2 className={SECTION_TITLE}>{t("conditions.title")}</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-white/70">{t("conditions.lead")}</p>
            </div>

            <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {conditions.map((item) => (
                <li key={item.title} data-reveal className="border-l border-white/15 pl-5">
                  <h3 className="text-lg font-bold leading-snug text-white">{item.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">{item.body}</p>
                </li>
              ))}
            </ul>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div data-reveal className="rounded-lg border border-[#e50914]/40 bg-[#110506] p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff4d4d]">
                  {t("conditions.foundersTitle")}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/80">{t("conditions.foundersBody")}</p>
              </div>
              <div data-reveal className="rounded-lg border border-white/10 bg-[#0a0a0a] p-6">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">
                  {t("conditions.capacityTitle")}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/80">{t("conditions.capacityBody")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── QUIÉN LO MONTA ── */}
        <section className="border-t border-white/5 py-20 md:py-28">
          <div className={`${CONTAINER} grid gap-10 md:grid-cols-[auto_1fr] md:gap-14`}>
            <div data-reveal className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg border border-white/10 md:h-52 md:w-52">
              <Image
                src="/ruben-jarne.jpg"
                alt={t("about.photoAlt")}
                fill
                sizes="(min-width: 768px) 208px, 160px"
                className="object-cover grayscale"
              />
            </div>
            <div data-reveal className="max-w-2xl">
              <p className={EYEBROW}>{t("about.eyebrow")}</p>
              <h2 className={SECTION_TITLE}>{t("about.title")}</h2>
              <p className="mt-5 text-[17px] leading-relaxed text-white/75">{t("about.body")}</p>

              <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-white/60">
                {t("about.proofTitle")}
              </h3>
              <ul className="mt-3 space-y-3 text-[15px] leading-relaxed text-white/75">
                {proof.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#e50914]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── DUDAS ── */}
        <section className="border-t border-white/5 bg-[#050505] py-20 md:py-28">
          <div className={`${CONTAINER} grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
            <div data-reveal>
              <p className={EYEBROW}>{t("faq.eyebrow")}</p>
              <h2 className={SECTION_TITLE}>{t("faq.title")}</h2>
            </div>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {faq.map((item) => (
                <details key={item.q} data-reveal className="group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg font-semibold leading-snug text-white [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span aria-hidden="true" className="mt-0.5 text-xl leading-none text-[#ff4d4d] transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/70">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACTO ── */}
        <section id="contacto" className="relative overflow-hidden border-t border-white/5 py-20 md:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 70% at 15% 60%, rgba(229,9,20,0.14) 0%, transparent 70%)",
            }}
          />
          <div className={`${CONTAINER} relative grid gap-12 lg:grid-cols-2 lg:gap-16`}>
            <div data-reveal>
              <p className={EYEBROW}>{t("contact.eyebrow")}</p>
              <h2 className={SECTION_TITLE}>{t("contact.title")}</h2>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/75">{t("contact.lead")}</p>
              <WhatsAppCta placement="contact" className={`${BUTTON_WHATSAPP} mt-8 w-full sm:w-auto`}>
                {t("contact.cta")}
              </WhatsAppCta>
            </div>

            <div data-reveal className="rounded-lg border border-white/10 bg-black p-6 md:p-8">
              <h3 className="mb-5 text-xl font-bold text-white">{t("contact.formTitle")}</h3>
              <AutomatizaForm />
            </div>
          </div>
        </section>
      </main>

      {/* ── PIE ── */}
      <footer className="border-t border-white/10 pb-28 pt-8 md:pb-8">
        <div className={`${CONTAINER} flex flex-col gap-3 font-mono text-[11px] text-white/50 md:flex-row md:items-center md:justify-between`}>
          <p>{t("footer.rights")}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/" className="transition-colors duration-300 hover:text-white">
              {t("footer.home")}
            </Link>
            <a href="mailto:hola@t800labs.com" className="transition-colors duration-300 hover:text-white">
              hola@t800labs.com
            </a>
            <WhatsAppCta placement="footer" showIcon={false} className="transition-colors duration-300 hover:text-white">
              +34 645 515 267
            </WhatsAppCta>
          </div>
        </div>
      </footer>

      <StickyCta showAfter="#hero-cta" hideAt="#contacto" />
    </div>
  );
}
