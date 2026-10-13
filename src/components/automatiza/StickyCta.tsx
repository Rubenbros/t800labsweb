"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { WhatsAppCta } from "./WhatsAppCta";

type Props = {
  /** Selector del botón principal: la barra aparece cuando deja de verse. */
  showAfter: string;
  /** Selector de la sección final, que ya tiene su propio botón: la barra se retira. */
  hideAt: string;
};

/** Barra fija con el WhatsApp, solo en móvil, mientras no hay otro botón a la vista. */
export function StickyCta({ showAfter, hideAt }: Props) {
  const t = useTranslations("Automatiza.sticky");
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    gsap.set(bar, { yPercent: 110, autoAlpha: 0 });

    const trigger = ScrollTrigger.create({
      trigger: showAfter,
      start: "bottom top",
      endTrigger: hideAt,
      end: "top 70%",
      onToggle: (self) =>
        gsap.to(bar, {
          yPercent: self.isActive ? 0 : 110,
          autoAlpha: self.isActive ? 1 : 0,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        }),
    });

    return () => trigger.kill();
  }, [showAfter, hideAt]);

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <WhatsAppCta
        placement="sticky"
        className="flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-md bg-[#25D366] px-5 py-3.5 text-[15px] font-semibold text-black"
      >
        {t("cta")}
        <span className="font-normal text-black/60">· {t("note")}</span>
      </WhatsAppCta>
    </div>
  );
}
