"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useTranslations } from "next-intl";

/**
 * Tesseract Bookshelf — Interstellar-style.
 *
 * Phase 0: Wormhole tunnel sucks you in
 * Phase 1: Bookshelf materializes in 3D perspective
 * Phase 2: Zoom into gaps to reveal step cards
 */
export default function ProcessTesseract() {
  const sectionRef = useRef<HTMLElement>(null);
  const t = useTranslations();

  const COLS = 8;
  const ROWS = 5;

  const gaps: [number, number][] = [
    [1, 1], [4, 0], [6, 2], [2, 3], [5, 4],
  ];

  // Realistic book colors — like a real library
  const bookColors = [
    "#8B1A1A", "#2F4F4F", "#8B4513", "#1C3A5F", "#556B2F",
    "#722F37", "#C4A35A", "#4A3728", "#1B4D3E", "#6B3A2A",
    "#2C3E50", "#8B0000", "#3B5998", "#704214", "#3E5641",
    "#A0522D", "#483D8B", "#5C4033", "#D4A017", "#2E4057",
    "#614B3B", "#8B6914", "#4B0082", "#36454F", "#C19A6B",
    "#654321", "#800020", "#1C1C3C", "#556B2F", "#DAA520",
  ];

  // Wormhole ring count
  const WORMHOLE_RINGS = 12;

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const scrollEnd = isMobile ? "+=4500" : "+=8000";

      // Snap points: wormhole end, overview, each card peak, end
      // Timeline: wormhole 0→5, bookshelf 4.5→7, steps at 7,12,17,22,27 (card at +1.5)
      const totalDur = 32;
      const snapPoints = [
        0,
        5 / totalDur,        // wormhole done
        7 / totalDur,        // bookshelf overview
        8.5 / totalDur,      // card 1
        13.5 / totalDur,     // card 2
        18.5 / totalDur,     // card 3
        23.5 / totalDur,     // card 4
        28.5 / totalDur,     // card 5
        1,
      ];

      const pt = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: scrollEnd,
          scrub: true,
          pin: true,
        },
      });

      // ═══════════════════════════════════════
      // PHASE 0: WORMHOLE TUNNEL (0→5)
      // ═══════════════════════════════════════

      // Wormhole container fades in
      pt.fromTo(".tess-wormhole",
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }, 0);

      // Rings expand from center outward with stagger
      pt.fromTo(".tess-ring",
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1.5,
          stagger: 0.12, ease: "power2.out",
        }, 0.2);

      // Rings start pulling toward camera (scale up dramatically)
      pt.to(".tess-ring", {
        scale: 8, opacity: 0, duration: 2.5,
        stagger: 0.15, ease: "power3.in",
      }, 2);

      // Wormhole center flash
      pt.fromTo(".tess-wormhole-flash",
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 2, duration: 0.4, ease: "power4.out" }, 4);
      pt.to(".tess-wormhole-flash",
        { opacity: 0, scale: 4, duration: 0.8, ease: "power2.out" }, 4.4);

      // Wormhole fades away
      pt.to(".tess-wormhole",
        { opacity: 0, duration: 0.5, pointerEvents: "none" }, 4.5);

      // ═══════════════════════════════════════
      // PHASE 1: BOOKSHELF MATERIALIZES (4.5→7)
      // ═══════════════════════════════════════

      // 3D perspective container rotates from steep angle to subtle tilt
      pt.fromTo(".tess-perspective",
        { rotateX: 45, opacity: 0, scale: 0.6 },
        { rotateX: 12, opacity: 1, scale: 1, duration: 2.5, ease: "power2.out" }, 4.5);

      // Depth beams glow in
      pt.fromTo(".tess-beam",
        { opacity: 0 },
        { opacity: 1, duration: 1.5, stagger: 0.04 }, 5);

      // Title
      pt.fromTo(".tess-title-wrap",
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, 5.5);
      pt.fromTo(".tess-divider",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 6.2);

      // Corner decorations
      pt.fromTo(".tess-corner",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, stagger: 0.1 }, 5.5);

      // Dots
      pt.fromTo(".tess-dots",
        { opacity: 0 },
        { opacity: 1, duration: 0.8 }, 6.5);

      // ═══════════════════════════════════════
      // PHASE 2: ZOOM INTO GAPS (7→32)
      // ═══════════════════════════════════════
      let pos = 7;

      for (let i = 0; i < 5; i++) {
        const [gc, gr] = gaps[i];
        const n = i + 1;

        const cellCenterX = ((gc + 0.5) / COLS) * 100;
        const cellCenterY = ((gr + 0.5) / ROWS) * 100;

        // Set transform origin for zoom
        pt.to(".tess-shelf", {
          transformOrigin: `${cellCenterX}% ${cellCenterY}%`,
          duration: 0.01,
        }, pos);

        // Flatten perspective as we zoom in (more immersive)
        pt.to(".tess-perspective", {
          rotateX: 2,
          duration: 1.8,
          ease: "power2.inOut",
        }, pos);

        // Zoom INTO the gap
        pt.to(".tess-shelf", {
          scale: 12,
          duration: 1.8,
          ease: "power2.inOut",
        }, pos);

        // Fade title during zoom
        pt.to(".tess-title-wrap", {
          opacity: 0,
          duration: 0.5,
        }, pos);

        // Show the card
        pt.fromTo(`.tess-card-${n}`,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" },
          pos + 1.5);

        // Gap cell glows
        pt.to(`.tess-gap-${n}`, {
          boxShadow: "0 0 20px rgba(212,160,23,0.3), inset 0 0 15px rgba(212,160,23,0.1)",
          duration: 0.5,
        }, pos + 1.2);

        // Dot activates
        pt.to(`.tess-dot-${n}`, {
          backgroundColor: "#d4a017",
          scale: 1.5,
          boxShadow: "0 0 8px rgba(212,160,23,0.6)",
          duration: 0.4,
        }, pos + 1.5);

        // Hide card and zoom out
        pt.to(`.tess-card-${n}`, {
          opacity: 0,
          duration: 0.5,
        }, pos + 3.5);

        pt.to(`.tess-gap-${n}`, {
          boxShadow: "0 0 0px rgba(212,160,23,0)",
          duration: 0.3,
        }, pos + 3.5);

        // Zoom OUT back to overview
        if (i < 4) {
          pt.to(".tess-shelf", {
            scale: 1,
            duration: 1.5,
            ease: "power2.inOut",
          }, pos + 3.8);

          // Restore 3D tilt
          pt.to(".tess-perspective", {
            rotateX: 12,
            duration: 1.5,
            ease: "power2.inOut",
          }, pos + 3.8);

          // Title fades back
          pt.to(".tess-title-wrap", {
            opacity: 1,
            duration: 0.5,
          }, pos + 4.5);
        }

        pos += 5;
      }

      // Ambient glow pulse (loop)
      gsap.to(".tess-ambient", {
        opacity: 0.7,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="proceso" className="process-section relative h-screen overflow-hidden bg-black">

      {/* ═══ WORMHOLE TUNNEL ═══ */}
      <div className="tess-wormhole pointer-events-none absolute inset-0 z-40 flex items-center justify-center opacity-0">
        {/* Concentric rings */}
        {Array.from({ length: WORMHOLE_RINGS }).map((_, i) => {
          const size = 60 + i * 80;
          const hue = 35 + i * 3; // golden range
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

            {/* Cells with books OR gaps */}
            {Array.from({ length: ROWS }).map((_, row) =>
              Array.from({ length: COLS }).map((_, col) => {
                const gapIndex = gaps.findIndex(([gc, gr]) => gc === col && gr === row);
                const cellIsGap = gapIndex !== -1;

                return (
                  <div
                    key={`cell-${col}-${row}`}
                    className={cellIsGap ? `tess-gap-${gapIndex + 1}` : ""}
                    style={{
                      position: "absolute",
                      left: `${(col / COLS) * 100}%`,
                      top: `${(row / ROWS) * 100}%`,
                      width: `${100 / COLS}%`,
                      height: `${100 / ROWS}%`,
                      padding: "6px",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      gap: "2px",
                    }}
                  >
                    {!cellIsGap ? (
                      <>
                        {Array.from({ length: 4 + (col + row) % 3 }).map((_, bi) => {
                          const h = 50 + ((col * 3 + row * 7 + bi * 11) % 40);
                          const color = bookColors[(col * 7 + row * 5 + bi * 11) % bookColors.length];
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
                      <div className="flex h-full w-full items-center justify-center">
                        <div
                          className="h-[70%] w-[60%] rounded-sm border border-[#d4a017]/25"
                          style={{
                            background: "radial-gradient(circle, rgba(212,160,23,0.08) 0%, rgba(212,160,23,0.02) 50%, transparent 80%)",
                            boxShadow: "inset 0 0 15px rgba(212,160,23,0.06)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Step cards */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={`tess-card-${n} absolute w-[80vw] max-w-md rounded border border-[#d4a017]/30 bg-black/85 px-6 py-5 opacity-0 backdrop-blur-sm md:px-8 md:py-7`}
          >
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-4xl font-bold text-[#d4a017]/20 md:text-5xl">
                {String(n).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-mono text-sm font-bold tracking-[0.15em] text-[#d4a017] uppercase md:text-lg">
                  {t(`Process.step${n}Title`)}
                </h3>
                <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/50 md:text-xs">
                  {t(`Process.step${n}Desc`)}
                </p>
              </div>
            </div>
          </div>
        ))}
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
    </section>
  );
}
