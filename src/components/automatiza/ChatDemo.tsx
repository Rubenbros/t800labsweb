"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Alturas de las barras de la nota de voz (en %): fijas para que servidor y cliente pinten lo mismo.
const WAVE = [35, 60, 45, 80, 55, 95, 70, 40, 65, 85, 50, 75, 30, 60, 90, 45, 70, 55, 35, 65, 80, 40, 55, 30];

// Los pasos nacen ocultos y los enseña el timeline; sin JavaScript los destapa el <noscript>.
const HIDDEN = { opacity: 0, visibility: "hidden" } as const;

export function ChatDemo() {
  const t = useTranslations("Automatiza.demo");
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia(root);

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".chat-step", { autoAlpha: 1 });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });

      tl.fromTo(".chat-audio",
        { autoAlpha: 0, y: 14, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.4)" }, 0.4);
      tl.fromTo(".chat-wave span",
        { scaleY: 0.25 },
        { scaleY: 1, duration: 0.3, ease: "power2.out", stagger: { each: 0.035, from: "start" } }, 0.5);

      // «Escribiendo…» ocupa el hueco donde luego entra la respuesta.
      tl.fromTo(".chat-typing", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, 1.6);
      tl.fromTo(".chat-typing span",
        { y: 0 },
        { y: -4, duration: 0.28, ease: "power1.inOut", stagger: 0.12, repeat: 5, yoyo: true }, 1.6);
      tl.to(".chat-typing", { autoAlpha: 0, duration: 0.15 }, 3.4);

      tl.fromTo(".chat-reply",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 3.5);
      tl.fromTo(".chat-file",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 4.1);
      tl.fromTo(".chat-logged",
        { autoAlpha: 0, y: 8 },
        { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, 4.8);

      // Pausa para leerlo y vuelta a empezar.
      tl.to(".chat-step", { autoAlpha: 0, duration: 0.5, ease: "power1.in" }, 12);

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
      });
      if (trigger.isActive) tl.play();

      return () => trigger.kill();
    });

    return () => mm.revert();
  }, []);

  return (
    <figure ref={rootRef} className="relative mx-auto w-full max-w-[350px]">
      <noscript>
        <style>{`.chat-step{opacity:1!important;visibility:visible!important}.chat-typing{display:none}`}</style>
      </noscript>

      {/* Etiqueta obligatoria en toda demo: no son datos de un cliente real */}
      <figcaption className="absolute -top-3 right-4 z-10 rounded border border-[#e50914]/60 bg-black px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#ff4d4d]">
        {t("badge")}
      </figcaption>

      <div
        role="img"
        aria-label={t("alt")}
        className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0b141a] shadow-[0_30px_80px_-20px_rgba(229,9,20,0.35)]"
      >
        {/* Cabecera del chat */}
        <div className="flex items-center gap-3 border-b border-white/5 bg-[#1f2c34] px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e50914] font-mono text-[11px] font-bold text-white">
            T8
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white">{t("contact")}</span>
            <span className="text-[11px] text-white/50">{t("status")}</span>
          </span>
        </div>

        <div className="flex min-h-[25rem] flex-col gap-2.5 px-3 py-4" aria-hidden="true">
          {/* Nota de voz del dueño */}
          <div className="chat-step chat-audio ml-auto w-[88%] rounded-xl rounded-tr-sm bg-[#005c4b] px-3 py-2.5" style={HIDDEN}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M8 5v14l11-7z" /></svg>
              </span>
              <span className="chat-wave flex h-7 flex-1 items-center gap-[2px]">
                {WAVE.map((height, i) => (
                  <span
                    key={i}
                    className="w-[3px] origin-center rounded-full bg-white/70"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </span>
              <span className="font-mono text-[10px] text-white/70">{t("audioLength")}</span>
            </div>
            <p className="mt-2 text-[12px] italic leading-snug text-white/75">{t("audioCaption")}</p>
            <p className="mt-1 text-right font-mono text-[9px] text-white/50">{t("sentAt")} ✓✓</p>
          </div>

          <div className="relative flex flex-col gap-2.5">
            <div className="chat-typing absolute left-0 top-0 flex gap-1 rounded-xl rounded-tl-sm bg-[#202c33] px-3.5 py-3" style={HIDDEN}>
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            </div>

            {/* Respuesta: borrador listo */}
            <div className="chat-step chat-reply mr-auto w-[88%] rounded-xl rounded-tl-sm bg-[#202c33] px-3 py-2.5" style={HIDDEN}>
              <p className="text-[13px] font-semibold text-white">{t("replyTitle")}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-white/75">{t("replyBody")}</p>
            </div>

            {/* El PDF */}
            <div className="chat-step chat-file mr-auto flex w-[88%] items-center gap-3 rounded-xl rounded-tl-sm bg-[#202c33] p-2.5" style={HIDDEN}>
              <span className="flex h-11 w-9 shrink-0 items-center justify-center rounded bg-[#e50914] font-mono text-[9px] font-bold text-white">
                PDF
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-[12.5px] font-medium text-white">{t("fileName")}</span>
                <span className="mt-0.5 font-mono text-[10px] text-white/50">{t("fileMeta")}</span>
              </span>
            </div>

            <div className="chat-step chat-logged mr-auto w-[88%] rounded-xl rounded-tl-sm bg-[#202c33] px-3 py-2" style={HIDDEN}>
              <p className="text-[12.5px] leading-snug text-white/75">{t("logged")}</p>
              <p className="mt-1 text-right font-mono text-[9px] text-white/40">{t("repliedAt")}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm leading-snug text-white/60">{t("caption")}</p>
    </figure>
  );
}
