"use client";

import { useCallback, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useTranslations } from "next-intl";
import LanguageSelector from "./LanguageSelector";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("Navbar");

  const NAV_LINKS = [
    { label: t("servicios"), href: "#servicios" },
    { label: t("proceso"), href: "#proceso" },
    { label: t("portfolio"), href: "#portfolio" },
    { label: t("equipo"), href: "#equipo" },
    { label: t("contacto"), href: "#contacto" },
  ];

  // For pinned sections, scroll to the point where content is fully visible
  // instead of the top of the section (where animation starts from scratch)
  const PIN_PROGRESS: Record<string, number> = {
    "#servicios": 0.60,  // all service cards visible (entrance now inside pin)
    "#proceso": 0.75,    // numbers revealed and clickable
    "#portfolio": 0.50,  // cards visible (now pinned)
    "#equipo": 0.60,     // all content revealed before fade (entrance inside pin)
    "#contacto": 0.38,   // HAL eye + Iniciar Contacto button visible
  };

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) {
        setMenuOpen(false);
        return;
      }

      const progress = PIN_PROGRESS[href];
      if (progress !== undefined) {
        const triggers = ScrollTrigger.getAll();
        const st = triggers.find(
          (t) => t.trigger === target && t.pin,
        );
        if (st) {
          const scrollPos = st.start + progress * (st.end - st.start);
          gsap.to(window, {
            scrollTo: { y: scrollPos },
            duration: 1.2,
            ease: "power3.inOut",
          });
          setMenuOpen(false);
          return;
        }
      }

      gsap.to(window, {
        scrollTo: { y: target, offsetY: 80 },
        duration: 1.2,
        ease: "power3.inOut",
      });
      setMenuOpen(false);
    },
    [],
  );

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-[990] pointer-events-none opacity-0 h-20">
      {/* Background bar */}
      <div className="navbar-bg absolute inset-0 bg-black/80 backdrop-blur-md border-b border-white/5 opacity-0" />

      {/* Red accent line at bottom */}
      <div className="navbar-accent-line absolute bottom-0 left-0 right-0 h-[1px] origin-center scale-x-0 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

      <div className="relative flex h-full items-center justify-between px-6 md:px-10">
        {/* Logo slot — the flying-logo element positions itself here */}
        <div className="navbar-logo-slot w-[180px] md:w-[260px]" />

        {/* Desktop links */}
        <div className="navbar-links pointer-events-auto hidden md:flex items-center gap-8 opacity-0">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="navbar-link font-mono text-xs tracking-[0.2em] text-white/60 uppercase transition-colors duration-300 hover:text-[#e50914]"
            >
              {link.label}
            </a>
          ))}
          <LanguageSelector />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="navbar-hamburger pointer-events-auto md:hidden flex flex-col gap-1.5 p-2 opacity-0"
          aria-label="Menu"
        >
          <span
            className={`block h-[1px] w-5 bg-white/70 transition-transform duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
          />
          <span
            className={`block h-[1px] w-5 bg-white/70 transition-opacity duration-300 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-[1px] w-5 bg-white/70 transition-transform duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="pointer-events-auto md:hidden absolute top-20 left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/5">
          <div className="flex flex-col items-center gap-6 py-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-mono text-sm tracking-[0.2em] text-white/70 uppercase transition-colors duration-300 hover:text-[#e50914]"
              >
                {link.label}
              </a>
            ))}
            <LanguageSelector />
          </div>
        </div>
      )}
    </nav>
  );
}
