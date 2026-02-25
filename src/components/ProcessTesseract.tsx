"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useTranslations } from "next-intl";

/* ── constants (outside component to avoid recreation) ── */
const COLS = 8;
const ROWS = 5;
const GAPS: [number, number][] = [
  [1, 1], [4, 0], [6, 2], [2, 3], [5, 4],
];
const WORMHOLE_RINGS = 12;
const WORMHOLE_STARS = 50;

/* Deterministic pseudo-random from index (no Math.random per render) */
function seededValue(index: number, seed: number): number {
  const x = Math.sin(index * 9301 + seed * 4973) * 49297;
  return x - Math.floor(x); // 0..1
}

const STEP_IMAGES = [
  "/process/step1-contacto.jpg",
  "/process/step2-analisis.jpg",
  "/process/step3-propuesta.jpg",
  "/process/step4-desarrollo.jpg",
  "/process/step5-lanzamiento.jpg",
];

const BOOK_COLORS = [
  "#8B1A1A", "#2F4F4F", "#8B4513", "#1C3A5F", "#556B2F",
  "#722F37", "#C4A35A", "#4A3728", "#1B4D3E", "#6B3A2A",
  "#2C3E50", "#8B0000", "#3B5998", "#704214", "#3E5641",
  "#A0522D", "#483D8B", "#5C4033", "#D4A017", "#2E4057",
  "#614B3B", "#8B6914", "#4B0082", "#36454F", "#C19A6B",
  "#654321", "#800020", "#1C1C3C", "#556B2F", "#DAA520",
];

/**
 * Tesseract Bookshelf — Interstellar-style.
 *
 * Phase 0: Wormhole tunnel sucks you in
 * Phase 1: Bookshelf materializes in 3D perspective
 * Phase 1.5: Numbers reveal in the gaps (clickable)
 * Click: Zoom into gap → detail overlay with image + info
 */
export default function ProcessTesseract() {
  const sectionRef = useRef<HTMLElement>(null);
  const zoomTlRef = useRef<gsap.core.Timeline | null>(null);
  const activeGapRef = useRef<number | null>(null);
  const [activeGap, setActiveGap] = useState<number | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const gapsRevealedRef = useRef(false);
  const t = useTranslations();

  /* ── portal target (must be outside transform ancestors) ── */
  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  /* ── preload step images ── */
  useEffect(() => {
    STEP_IMAGES.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  /* ── click: zoom into a gap ── */
  const handleGapClick = useCallback((index: number) => {
    if (activeGapRef.current !== null || !gapsRevealedRef.current) return;

    const [gc, gr] = GAPS[index];
    const cellCenterX = ((gc + 0.5) / COLS) * 100;
    const cellCenterY = ((gr + 0.5) / ROWS) * 100;

    activeGapRef.current = index;
    setActiveGap(index);

    if (zoomTlRef.current) zoomTlRef.current.kill();

    const tl = gsap.timeline();
    zoomTlRef.current = tl;

    tl.set(".tess-shelf", { transformOrigin: `${cellCenterX}% ${cellCenterY}%` });

    tl.to(".tess-perspective", { rotateX: 2, duration: 1, ease: "power2.inOut" }, 0);
    tl.to(".tess-shelf", { scale: 12, duration: 1, ease: "power2.inOut" }, 0);
    tl.to(".tess-title-wrap", { opacity: 0, duration: 0.3 }, 0);
    tl.to(".tess-gap-number", { opacity: 0, duration: 0.3 }, 0);
    tl.to(".tess-dots", { opacity: 0, duration: 0.3 }, 0);

    tl.fromTo(".tess-detail-overlay",
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" },
      0.7,
    );

    tl.to(`.tess-dot-${index + 1}`, {
      backgroundColor: "#d4a017", scale: 1.5,
      boxShadow: "0 0 8px rgba(212,160,23,0.6)", duration: 0.4,
    }, 0.5);
  }, []);

  /* ── click: zoom back out ── */
  const handleBack = useCallback(() => {
    if (activeGapRef.current === null) return;
    const prevGap = activeGapRef.current;

    if (zoomTlRef.current) zoomTlRef.current.kill();

    const tl = gsap.timeline({
      onComplete: () => {
        activeGapRef.current = null;
        setActiveGap(null);
        zoomTlRef.current = null;
      },
    });
    zoomTlRef.current = tl;

    tl.to(".tess-detail-overlay", { opacity: 0, duration: 0.3 }, 0);
    tl.to(".tess-shelf", { scale: 1, duration: 1, ease: "power2.inOut" }, 0.2);
    tl.to(".tess-perspective", { rotateX: 12, duration: 1, ease: "power2.inOut" }, 0.2);
    tl.to(".tess-title-wrap", { opacity: 1, duration: 0.5 }, 0.8);
    tl.to(".tess-gap-number", { opacity: 1, duration: 0.5 }, 0.8);
    tl.to(".tess-dots", { opacity: 1, duration: 0.5 }, 0.8);
    tl.to(`.tess-dot-${prevGap + 1}`, {
      backgroundColor: "transparent", scale: 1,
      boxShadow: "none", duration: 0.3,
    }, 0.3);
  }, []);

  /* ── GSAP scroll-driven timeline ── */
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const scrollEnd = isMobile ? "+=500" : "+=800";
      const totalDur = 6;

      const pt = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: scrollEnd,
          scrub: true,
          pin: true,
          onUpdate: (self) => {
            const revealed = self.progress >= 4.8 / totalDur;
            gapsRevealedRef.current = revealed;

            const btns = sectionRef.current?.querySelectorAll(".tess-gap-btn");
            if (btns) {
              btns.forEach((el) => {
                (el as HTMLElement).style.pointerEvents = revealed ? "auto" : "none";
              });
            }
          },
        },
      });

      // ═══════════════════════════════════════
      // PHASE 0: WORMHOLE TUNNEL (0→2)
      // ═══════════════════════════════════════

      pt.fromTo(".tess-wormhole",
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }, 0);

      // Stars: appear, then get pulled toward center and stretch
      const starEls = sectionRef.current?.querySelectorAll(".tess-star");
      if (starEls) {
        starEls.forEach((star, i) => {
          const el = star as HTMLElement;
          const startLeft = parseFloat(el.style.left);
          const startTop = parseFloat(el.style.top);
          const dx = 50 - startLeft;
          const dy = 50 - startTop;
          const delay = 0.03 + seededValue(i, 10) * 0.25;

          pt.fromTo(el,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power1.out" },
            delay,
          );

          pt.to(el, {
            x: `${dx * 0.9}vw`,
            y: `${dy * 0.9}vh`,
            scaleY: 8 + seededValue(i, 11) * 12,
            scaleX: 0.5,
            rotation: Math.atan2(dy, dx) * (180 / Math.PI) + 90,
            opacity: 0,
            duration: 1.2,
            ease: "power3.in",
          }, 0.4 + seededValue(i, 12) * 0.3);
        });
      }

      pt.fromTo(".tess-ring",
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.6,
          stagger: 0.05, ease: "power2.out",
        }, 0.05);

      pt.to(".tess-ring", {
        scale: 8, opacity: 0, duration: 0.8,
        stagger: 0.06, ease: "power3.in",
      }, 0.7);

      pt.fromTo(".tess-wormhole-flash",
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 2, duration: 0.2, ease: "power4.out" }, 1.6);
      pt.to(".tess-wormhole-flash",
        { opacity: 0, scale: 4, duration: 0.3, ease: "power2.out" }, 1.8);

      pt.to(".tess-wormhole",
        { opacity: 0, duration: 0.2, pointerEvents: "none" }, 1.9);

      // ═══════════════════════════════════════
      // PHASE 1: BOOKSHELF MATERIALIZES (2→4)
      // ═══════════════════════════════════════

      pt.fromTo(".tess-perspective",
        { rotateX: 45, opacity: 0, scale: 0.6 },
        { rotateX: 12, opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }, 2.0);

      pt.fromTo(".tess-beam",
        { opacity: 0 },
        { opacity: 1, duration: 0.7, stagger: 0.02 }, 2.3);

      pt.fromTo(".tess-title-wrap",
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 2.5);
      pt.fromTo(".tess-divider",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 3.0);

      pt.fromTo(".tess-corner",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, stagger: 0.06 }, 2.5);

      pt.fromTo(".tess-dots",
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }, 3.3);

      // ═══════════════════════════════════════
      // PHASE 1.5: NUMBER REVEAL (4→5)
      // ═══════════════════════════════════════

      pt.fromTo(".tess-gap-number",
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" },
        4.0,
      );

      // (fade-to-black removed — process section stays visible as it unpins)

      // ── ambient loops ──
      gsap.to(".tess-ambient", {
        opacity: 0.7, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut",
      });

      gsap.to(".tess-gap-glow", {
        boxShadow: "0 0 15px rgba(212,160,23,0.4), inset 0 0 10px rgba(212,160,23,0.15)",
        duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut",
      });

    }, sectionRef);

    return () => {
      if (zoomTlRef.current) zoomTlRef.current.kill();
      ctx.revert();
    };
  }, []);

  return (
    <>
    <section ref={sectionRef} id="proceso" className="process-section relative z-[4] h-screen overflow-hidden bg-black">
      <div className="process-inner absolute inset-0">

      {/* ═══ WORMHOLE TUNNEL ═══ */}
      <div className="tess-wormhole pointer-events-none absolute inset-0 z-40 flex items-center justify-center opacity-0">
        {/* Stars — behind rings (rendered first = lower in stacking) */}
        {Array.from({ length: WORMHOLE_STARS }).map((_, i) => {
          // Deterministic position spread across viewport (rounded to avoid hydration mismatch)
          const r = (v: number, d = 2) => Math.round(v * (10 ** d)) / (10 ** d);
          const angle = seededValue(i, 1) * Math.PI * 2;
          const radius = 15 + seededValue(i, 2) * 40; // 15-55% from center
          const x = r(50 + Math.cos(angle) * radius);
          const y = r(50 + Math.sin(angle) * radius);
          const size = r(2 + seededValue(i, 3)); // 2-3px
          // Mix golden and warm white
          const isGolden = seededValue(i, 4) > 0.5;
          const alpha = r(isGolden ? 0.4 + seededValue(i, 5) * 0.3 : 0.5 + seededValue(i, 6) * 0.3, 3);
          const color = isGolden
            ? `rgba(212,160,23,${alpha})`
            : `rgba(255,255,255,${alpha})`;
          const glow = r(2 + seededValue(i, 7) * 3);

          return (
            <div
              key={`star-${i}`}
              className="tess-star absolute rounded-full opacity-0"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                left: `${x}%`,
                top: `${y}%`,
                zIndex: 0, // behind rings
                boxShadow: `0 0 ${glow}px ${color}`,
              }}
            />
          );
        })}
        {/* Concentric rings */}
        {Array.from({ length: WORMHOLE_RINGS }).map((_, i) => {
          const size = 60 + i * 80;
          const hue = 35 + i * 3;
          return (
            <div
              key={`ring-${i}`}
              className="tess-ring absolute rounded-full opacity-0"
              style={{
                width: size,
                height: size,
                border: `${2 + (WORMHOLE_RINGS - i) * 0.3}px solid hsla(${hue}, 70%, ${45 + i * 3}%, ${0.6 - i * 0.03})`,
                boxShadow: `0 0 ${15 + i * 3}px hsla(${hue}, 80%, 50%, ${0.3 - i * 0.02}), inset 0 0 ${10 + i * 2}px hsla(${hue}, 80%, 50%, ${0.15 - i * 0.01})`,
                transform: "scale(0)",
              }}
            />
          );
        })}
        {/* Center bright flash */}
        <div className="tess-wormhole-flash absolute h-32 w-32 rounded-full opacity-0"
          style={{
            background: "radial-gradient(circle, rgba(212,160,23,0.9) 0%, rgba(212,160,23,0.4) 30%, transparent 70%)",
            boxShadow: "0 0 60px rgba(212,160,23,0.5)",
          }}
        />
        {/* Streaking light lines (speed lines) */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * 360;
          const length = 30 + (i % 5) * 15;
          return (
            <div
              key={`streak-${i}`}
              className="tess-ring absolute opacity-0"
              style={{
                width: `${length}%`,
                height: "1px",
                background: `linear-gradient(to right, transparent, rgba(212,160,23,${0.15 + (i % 3) * 0.05}), transparent)`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: "0% 50%",
                left: "50%",
                top: "50%",
              }}
            />
          );
        })}
      </div>

      {/* ═══ TITLE ═══ */}
      <div className="tess-title-wrap pointer-events-none absolute left-0 right-0 top-0 z-30 flex flex-col items-center gap-2 pt-24 opacity-0">
        <span className="font-mono text-[10px] tracking-[0.3em] text-[#d4a017]/60 uppercase">
          {t("Process.subtitle")}
        </span>
        <h2 className="font-bold text-3xl tracking-[0.15em] text-[#d4a017] md:text-5xl">
          {t("Process.title")}
        </h2>
        <div className="tess-divider h-[1px] w-16 origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#d4a017]/50 to-transparent" />
      </div>

      {/* Ambient center glow */}
      <div className="tess-ambient pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50">
        <div className="h-[80vh] w-[80vh] bg-[radial-gradient(circle,rgba(212,160,23,0.06)_0%,transparent_60%)]" />
      </div>

      {/* Depth beams extending from grid */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {Array.from({ length: ROWS + 1 }).map((_, i) => {
          const top = 20 + (i / ROWS) * 60;
          return (
            <div
              key={`hbeam-${i}`}
              className="tess-beam absolute h-[2px] opacity-0"
              style={{
                top: `${top}%`,
                left: 0,
                right: 0,
                background: `linear-gradient(to right, transparent 3%, rgba(212,160,23,${0.06 + (i === 0 || i === ROWS ? 0.06 : 0.02)}) 12%, rgba(212,160,23,${0.15 + (i === 0 || i === ROWS ? 0.1 : 0.03)}) 50%, rgba(212,160,23,${0.06 + (i === 0 || i === ROWS ? 0.06 : 0.02)}) 88%, transparent 97%)`,
                boxShadow: "0 0 12px rgba(212,160,23,0.06)",
              }}
            />
          );
        })}
        {Array.from({ length: COLS + 1 }).map((_, i) => {
          const left = 10 + (i / COLS) * 80;
          return (
            <div
              key={`vbeam-${i}`}
              className="tess-beam absolute w-[2px] opacity-0"
              style={{
                left: `${left}%`,
                top: 0,
                bottom: 0,
                background: `linear-gradient(to bottom, transparent 3%, rgba(212,160,23,${0.06 + (i === 0 || i === COLS ? 0.06 : 0.02)}) 12%, rgba(212,160,23,${0.15 + (i === 0 || i === COLS ? 0.1 : 0.03)}) 50%, rgba(212,160,23,${0.06 + (i === 0 || i === COLS ? 0.06 : 0.02)}) 88%, transparent 97%)`,
                boxShadow: "0 0 12px rgba(212,160,23,0.06)",
              }}
            />
          );
        })}
      </div>

      {/* ═══ THE BOOKSHELF — 3D perspective container ═══ */}
      <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
        style={{ perspective: "1200px" }}>
        <div className="tess-perspective" style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(12deg)",
          opacity: 0,
        }}>
          <div className="tess-shelf relative" style={{
            width: "80vw",
            maxWidth: "900px",
            aspectRatio: `${COLS} / ${ROWS}`,
            transformStyle: "preserve-3d",
          }}>
            {/* Shelf "depth" — back panel */}
            <div className="absolute inset-0" style={{
              transform: "translateZ(-30px)",
              background: "linear-gradient(135deg, rgba(212,160,23,0.03) 0%, rgba(0,0,0,0.8) 50%, rgba(212,160,23,0.02) 100%)",
              border: "1px solid rgba(212,160,23,0.08)",
            }} />

            {/* Grid lines (golden) */}
            <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${COLS * 100} ${ROWS * 100}`} preserveAspectRatio="none">
              {Array.from({ length: ROWS + 1 }).map((_, i) => (
                <line key={`h-${i}`}
                  x1="0" y1={i * 100} x2={COLS * 100} y2={i * 100}
                  stroke="#d4a017"
                  strokeWidth={i === 0 || i === ROWS ? "4" : "2"}
                  opacity={i === 0 || i === ROWS ? "0.7" : "0.4"}
                />
              ))}
              {Array.from({ length: COLS + 1 }).map((_, i) => (
                <line key={`v-${i}`}
                  x1={i * 100} y1="0" x2={i * 100} y2={ROWS * 100}
                  stroke="#d4a017"
                  strokeWidth={i === 0 || i === COLS ? "4" : "2"}
                  opacity={i === 0 || i === COLS ? "0.7" : "0.4"}
                />
              ))}
            </svg>

            {/* 3D shelf edges — horizontal shelves with depth */}
            {Array.from({ length: ROWS + 1 }).map((_, i) => (
              <div key={`shelf3d-${i}`} className="absolute" style={{
                left: 0,
                right: 0,
                top: `${(i / ROWS) * 100}%`,
                height: "4px",
                transform: "translateZ(5px)",
                background: "linear-gradient(to bottom, rgba(212,160,23,0.35), rgba(212,160,23,0.1))",
                boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
              }} />
            ))}

            {/* 3D vertical dividers with depth */}
            {Array.from({ length: COLS + 1 }).map((_, i) => (
              <div key={`vert3d-${i}`} className="absolute" style={{
                top: 0,
                bottom: 0,
                left: `${(i / COLS) * 100}%`,
                width: "3px",
                transform: "translateZ(3px)",
                background: "linear-gradient(to right, rgba(212,160,23,0.25), rgba(212,160,23,0.08))",
                boxShadow: "2px 0 4px rgba(0,0,0,0.4)",
              }} />
            ))}

            {/* Cells with books OR clickable gaps */}
            {Array.from({ length: ROWS }).map((_, row) =>
              Array.from({ length: COLS }).map((_, col) => {
                const gapIndex = GAPS.findIndex(([gc, gr]) => gc === col && gr === row);
                const cellIsGap = gapIndex !== -1;

                return (
                  <div
                    key={`cell-${col}-${row}`}
                    style={{
                      position: "absolute",
                      left: `${(col / COLS) * 100}%`,
                      top: `${(row / ROWS) * 100}%`,
                      width: `${100 / COLS}%`,
                      height: `${100 / ROWS}%`,
                      padding: "6px",
                      display: "flex",
                      alignItems: cellIsGap ? "center" : "flex-end",
                      justifyContent: "center",
                      gap: "2px",
                    }}
                  >
                    {!cellIsGap ? (
                      <>
                        {Array.from({ length: 4 + (col + row) % 3 }).map((_, bi) => {
                          const h = 50 + ((col * 3 + row * 7 + bi * 11) % 40);
                          const color = BOOK_COLORS[(col * 7 + row * 5 + bi * 11) % BOOK_COLORS.length];
                          return (
                            <div
                              key={bi}
                              style={{
                                width: `${14 + (bi % 3) * 2}%`,
                                height: `${h}%`,
                                backgroundColor: color,
                                borderRadius: "1px 2px 1px 1px",
                                opacity: 0.92,
                                transform: "translateZ(2px)",
                                boxShadow: "inset -2px 0 3px rgba(0,0,0,0.5), inset 1px 0 1px rgba(255,255,255,0.05), 1px 1px 3px rgba(0,0,0,0.3)",
                              }}
                            />
                          );
                        })}
                      </>
                    ) : (
                      <button
                        className={`tess-gap-btn tess-gap-${gapIndex + 1} flex h-full w-full cursor-pointer items-center justify-center`}
                        style={{ pointerEvents: "none", background: "none", border: "none", padding: 0 }}
                        onClick={() => handleGapClick(gapIndex)}
                      >
                        <div
                          className="tess-gap-glow flex h-[70%] w-[60%] items-center justify-center rounded-sm border border-[#d4a017]/30 transition-colors hover:border-[#d4a017]/70"
                          style={{
                            background: "radial-gradient(circle, rgba(212,160,23,0.08) 0%, rgba(212,160,23,0.02) 50%, transparent 80%)",
                            boxShadow: "inset 0 0 15px rgba(212,160,23,0.06)",
                          }}
                        >
                          <span className="tess-gap-number font-mono text-lg font-bold text-[#d4a017] opacity-0 md:text-2xl">
                            {String(gapIndex + 1).padStart(2, "0")}
                          </span>
                        </div>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="tess-dots pointer-events-none absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3 opacity-0">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={`tess-dot-${n} h-1.5 w-1.5 rounded-full border border-[#d4a017]/30`} />
        ))}
      </div>

      {/* Corner decorations */}
      <div className="tess-corner absolute left-6 top-6 z-20 opacity-0">
        <div className="h-8 w-[1px] bg-gradient-to-b from-[#d4a017]/40 to-transparent" />
        <div className="absolute top-0 h-[1px] w-8 bg-gradient-to-r from-[#d4a017]/40 to-transparent" />
        <span className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.3em] text-[#d4a017]/50">SYS.04</span>
      </div>
      <div className="tess-corner absolute right-6 top-6 z-20 opacity-0">
        <div className="ml-auto h-8 w-[1px] bg-gradient-to-b from-[#d4a017]/40 to-transparent" />
        <div className="absolute right-0 top-0 h-[1px] w-8 bg-gradient-to-l from-[#d4a017]/40 to-transparent" />
        <span className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.3em] text-[#d4a017]/50">TESS</span>
      </div>
      <div className="tess-corner absolute bottom-6 left-6 z-20 opacity-0">
        <div className="h-8 w-[1px] bg-gradient-to-t from-[#d4a017]/40 to-transparent" />
        <div className="absolute bottom-0 h-[1px] w-8 bg-gradient-to-r from-[#d4a017]/40 to-transparent" />
      </div>
      <div className="tess-corner absolute bottom-6 right-6 z-20 opacity-0">
        <div className="ml-auto h-8 w-[1px] bg-gradient-to-t from-[#d4a017]/40 to-transparent" />
        <div className="absolute bottom-0 right-0 h-[1px] w-8 bg-gradient-to-l from-[#d4a017]/40 to-transparent" />
      </div>
      </div>{/* /process-inner */}
    </section>

    {/* ═══ DETAIL OVERLAY — portalled to body to escape transform containment ═══ */}
    {portalTarget && createPortal(
      <div
        className="tess-detail-overlay fixed inset-0"
        style={{ zIndex: 9999, opacity: 0, pointerEvents: activeGap !== null ? "auto" : "none" }}
      >
        {activeGap !== null && (
          <div className="relative flex h-full w-full items-center justify-center bg-black">
            {/* Background image with dark filter */}
            <div className="absolute inset-0 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={STEP_IMAGES[activeGap]}
                alt=""
                className="h-full w-full object-cover"
                style={{ filter: "brightness(0.45) saturate(0.85)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            </div>

            {/* Back button */}
            <button
              className="absolute left-6 top-6 cursor-pointer border border-[#d4a017]/50 bg-black/80 px-5 py-2.5 font-mono text-sm tracking-[0.2em] text-[#d4a017] backdrop-blur-sm transition-colors hover:border-[#d4a017] hover:bg-black"
              style={{ zIndex: 10 }}
              onClick={handleBack}
            >
              &larr; {t("Process.back")}
            </button>

            {/* Content */}
            <div className="relative z-[5] flex flex-col items-center px-6">
              {/* Watermark number */}
              <span className="absolute font-mono text-[20vw] font-bold leading-none text-[#d4a017]/[0.04] select-none">
                {String(activeGap + 1).padStart(2, "0")}
              </span>

              <span className="font-mono text-[10px] tracking-[0.3em] text-[#d4a017]/60 uppercase">
                {t("Process.subtitle")} — {String(activeGap + 1).padStart(2, "0")}/05
              </span>
              <h3 className="mt-4 text-center font-mono text-2xl font-bold tracking-[0.15em] text-[#d4a017] md:text-4xl">
                {t(`Process.step${activeGap + 1}Title`)}
              </h3>
              <div className="mt-3 h-[1px] w-16 bg-gradient-to-r from-transparent via-[#d4a017]/50 to-transparent" />
              <p className="mt-4 max-w-md text-center font-mono text-sm leading-relaxed text-white/60 md:text-base">
                {t(`Process.step${activeGap + 1}Desc`)}
              </p>
            </div>
          </div>
        )}
      </div>,
      portalTarget,
    )}
    </>
  );
}
