"use client";

import { useEffect, useRef, useCallback } from "react";

/* V2 — Deep Photographic: heavier shadows, more glass layers,
   visible internal lens elements, more contrast between zones */
export default function Hal9000v2() {
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseRef.current.x = (e.clientX - cx) / (window.innerWidth / 2);
    mouseRef.current.y = (e.clientY - cy) / (window.innerHeight / 2);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    const animate = () => {
      const { x, y } = mouseRef.current;
      const depths = [0, 0.3, 0.8, 1.5, 2.5, 4, 7];
      layersRef.current.forEach((el, i) => {
        if (!el) return;
        const d = depths[i] ?? 0;
        el.style.transform = `translate(${x * d}px, ${y * d}px)`;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [handleMouseMove]);

  const setLayerRef = (i: number) => (el: HTMLDivElement | null) => {
    layersRef.current[i] = el;
  };

  return (
    <div
      ref={containerRef}
      className="hal-container relative flex items-center justify-center"
      style={{ width: "min(50vw, 50vh)", height: "min(50vw, 50vh)" }}
    >
      {/* Ambient glow — tight, warm */}
      <div
        ref={setLayerRef(0)}
        className="absolute rounded-full"
        style={{
          width: "130%",
          height: "130%",
          background: "radial-gradient(circle, rgba(180,20,0,0.07) 0%, rgba(100,0,0,0.03) 50%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Bezel — brushed metal look with subtle ring groove */}
      <div
        ref={setLayerRef(1)}
        className="absolute rounded-full"
        style={{
          width: "100%",
          height: "100%",
          background: `
            conic-gradient(from 180deg, #141414 0%, #1c1c1c 25%, #111 50%, #1a1a1a 75%, #141414 100%)
          `,
          boxShadow:
            "inset 0 2px 8px rgba(255,255,255,0.05), inset 0 -4px 12px rgba(0,0,0,0.95), 0 0 100px rgba(180,20,0,0.08), 0 8px 30px rgba(0,0,0,0.9)",
        }}
      />

      {/* Bezel inner groove */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "88%",
          height: "88%",
          border: "1px solid rgba(255,255,255,0.03)",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.02)",
        }}
      />

      {/* Dark glass dome — deep, nearly black */}
      <div
        ref={setLayerRef(2)}
        className="absolute rounded-full"
        style={{
          width: "84%",
          height: "84%",
          background: `radial-gradient(circle at 47% 44%, #080202 0%, #030000 55%, #000 100%)`,
          boxShadow: "inset 0 0 50px rgba(0,0,0,0.98), inset 0 8px 30px rgba(0,0,0,0.5)",
        }}
      />

      {/* Glass specular — bright spot top-left like studio lighting */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "84%",
          height: "84%",
          background: `
            radial-gradient(ellipse 45% 35% at 28% 22%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.08) 35%, transparent 60%),
            radial-gradient(ellipse 30% 25% at 72% 76%, rgba(255,255,255,0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(255,255,255,0.03) 75%, rgba(255,255,255,0.08) 92%, rgba(255,255,255,0.16) 100%)
          `,
          zIndex: 20,
        }}
      />

      {/* Window reflection — studio light rectangle */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "22%",
          height: "9%",
          top: "20%",
          left: "22%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 100%)",
          borderRadius: "50%",
          filter: "blur(5px)",
          transform: "rotate(-25deg)",
          zIndex: 22,
        }}
      />

      {/* Secondary small reflection — bottom right */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "8%",
          height: "5%",
          bottom: "26%",
          right: "24%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(3px)",
          zIndex: 22,
        }}
      />

      {/* Rim catch */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "84%",
          height: "84%",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "inset 0 2px 3px rgba(255,255,255,0.12), inset 0 -1px 2px rgba(255,255,255,0.04)",
          zIndex: 21,
        }}
      />

      {/* Internal lens element ring — concentric line */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "62%",
          height: "62%",
          border: "1px solid rgba(139,0,0,0.15)",
          boxShadow: "0 0 8px rgba(139,0,0,0.08), inset 0 0 4px rgba(255,255,255,0.03)",
        }}
      />

      {/* Deep red glow */}
      <div
        ref={setLayerRef(3)}
        className="absolute rounded-full"
        style={{
          width: "52%",
          height: "52%",
          background: `radial-gradient(circle at 50% 50%, #8a0000 0%, #4a0000 30%, #1a0204 60%, #060000 100%)`,
          boxShadow: "0 0 60px rgba(138,0,0,0.25)",
        }}
      />

      {/* Bright red ring */}
      <div
        ref={setLayerRef(4)}
        className="absolute rounded-full hal-red-ring-v2"
        style={{
          width: "30%",
          height: "30%",
          background: `radial-gradient(circle at 50% 50%, #e81000 0%, #b80000 30%, #7a0000 65%, #3a0000 100%)`,
          boxShadow: "0 0 35px rgba(232,16,0,0.5), 0 0 80px rgba(184,0,0,0.2)",
        }}
      />

      {/* Amber ring */}
      <div
        ref={setLayerRef(5)}
        className="absolute rounded-full"
        style={{
          width: "14%",
          height: "14%",
          background: `radial-gradient(circle at 49% 49%, #e88a00 0%, #cc5500 35%, #aa2200 70%, #e81000 100%)`,
          boxShadow: "0 0 18px rgba(232,138,0,0.4)",
        }}
      />

      {/* Yellow core */}
      <div
        ref={setLayerRef(6)}
        className="absolute rounded-full hal-core-v2"
        style={{
          width: "6%",
          height: "6%",
          background: `radial-gradient(circle at 46% 46%, #fff4b0 0%, #ffd700 30%, #ffaa00 65%, #e88a00 100%)`,
          boxShadow: "0 0 8px rgba(255,215,0,0.95), 0 0 22px rgba(255,170,0,0.6), 0 0 45px rgba(232,16,0,0.2)",
        }}
      />

      {/* Aperture blades hint */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: "24%",
          height: "24%",
          opacity: 0.05,
          background: "conic-gradient(from 15deg, transparent 0deg, rgba(255,255,255,0.4) 1.5deg, transparent 3deg, transparent 51.5deg, rgba(255,255,255,0.4) 53deg, transparent 54.5deg, transparent 111.5deg, rgba(255,255,255,0.4) 113deg, transparent 114.5deg, transparent 171.5deg, rgba(255,255,255,0.4) 173deg, transparent 174.5deg, transparent 231.5deg, rgba(255,255,255,0.4) 233deg, transparent 234.5deg, transparent 291.5deg, rgba(255,255,255,0.4) 293deg, transparent 294.5deg, transparent 351.5deg, rgba(255,255,255,0.4) 353deg, transparent 354.5deg)",
        }}
      />

      <style jsx>{`
        @keyframes hal-pulse-v2 {
          0%, 100% {
            box-shadow: 0 0 8px rgba(255,215,0,0.95), 0 0 22px rgba(255,170,0,0.6), 0 0 45px rgba(232,16,0,0.2);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 12px rgba(255,215,0,1), 0 0 30px rgba(255,170,0,0.75), 0 0 60px rgba(232,16,0,0.3);
            transform: scale(1.05);
          }
        }
        @keyframes hal-ring-v2 {
          0%, 100% { box-shadow: 0 0 35px rgba(232,16,0,0.5), 0 0 80px rgba(184,0,0,0.2); }
          50% { box-shadow: 0 0 45px rgba(232,16,0,0.6), 0 0 100px rgba(184,0,0,0.3); }
        }
        .hal-core-v2 { animation: hal-pulse-v2 4.5s ease-in-out infinite; }
        .hal-red-ring-v2 { animation: hal-ring-v2 5.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
