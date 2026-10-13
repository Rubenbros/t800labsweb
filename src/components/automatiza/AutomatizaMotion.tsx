"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Movimiento de la página /automatiza, todo con GSAP: entrada de los bloques marcados
 * con `data-reveal` al llegar a ellos y desplazamiento suave de los enlaces internos.
 * El contenido se sirve visible: sin JavaScript o con «reducir movimiento» no se anima nada.
 */
export function AutomatizaMotion() {
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Lo que ya está en pantalla al cargar no se esconde: parpadearía.
      const below = gsap.utils
        .toArray<HTMLElement>("[data-reveal]")
        .filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);

      gsap.set(below, { autoAlpha: 0, y: 28 });

      const triggers = ScrollTrigger.batch(below, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
          }),
      });

      const onClick = (event: MouseEvent) => {
        const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
        const target = link && document.querySelector(link.hash);
        if (!link || !target) return;
        event.preventDefault();
        gsap.to(window, { scrollTo: { y: target, offsetY: 24 }, duration: 0.9, ease: "power3.inOut" });
        history.replaceState(null, "", link.hash);
      };
      document.addEventListener("click", onClick);

      return () => {
        document.removeEventListener("click", onClick);
        triggers.forEach((trigger) => trigger.kill());
        gsap.set(below, { clearProps: "all" });
      };
    });

    return () => mm.revert();
  }, []);

  return null;
}
