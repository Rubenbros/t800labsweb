"use client";

import { useEffect, useRef, useCallback } from "react";

export default function Hal9000() {
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
      const depths = [0, 0.5, 1, 2, 3, 5, 8];
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
      {/* Layer 0: Outer ambient glow */}
      <div
        ref={setLayerRef(0)}
        className="absolute rounded-full"
        style={{
          width: "120%",
          height: "120%",
          background:
            "radial-gradient(circle, rgba(229,9,20,0.1) 0%, rgba(229,9,20,0.04) 40%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />

      {/* Layer 1: Black bezel / barrel ring — metallic */}
      <div
        ref={setLayerRef(1)}
        className="absolute rounded-full"
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 40% 35%, #1a1a1a 0%, #0d0d0d 60%, #050505 100%)",
          boxShadow:
            "inset 0 2px 6px rgba(255,255,255,0.08), inset 0 -3px 8px rgba(0,0,0,0.9), 0 0 80px rgba(229,9,20,0.12), 0 4px 20px rgba(0,0,0,0.8)",
        }}
      />

      {/* Layer 2: Dark glass zone — the fisheye lens dome */}
      <div
        ref={setLayerRef(2)}
        className="absolute rounded-full"
        style={{
          width: "82%",
          height: "82%",
          background: `
            radial-gradient(circle at 48% 46%,
              #0c0000 0%,
              #060000 50%,
              #020000 80%,
              #000000 100%
            )
          `,
          boxShadow:
            "inset 0 0 40px rgba(0,0,0,0.95), inset 0 -4px 20px rgba(139,0,0,0.05)",
        }}
      />

      {/* Glass reflection — primary specular highlight (top-left) */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "82%",
          height: "82%",
          background: `
            radial-gradient(ellipse at 32% 28%, rgba(255,255,255,0.09) 0%, transparent 45%),
            radial-gradient(ellipse at 65% 70%, rgba(255,255,255,0.03) 0%, transparent 35%),
            linear-gradient(155deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.02) 100%)
          `,
          zIndex: 20,
        }}
      />

      {/* Glass curvature rim — edge light catch */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "82%",
          height: "82%",
          border: "1px solid rgba(255,255,255,0.04)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.06), inset 0 -1px 1px rgba(255,255,255,0.02)",
          zIndex: 21,
        }}
      />

      {/* Layer 3: Deep red glow zone */}
      <div
        ref={setLayerRef(3)}
        className="absolute rounded-full"
        style={{
          width: "55%",
          height: "55%",
          background: `
            radial-gradient(circle at 50% 50%,
              #920000 0%,
              #5a0000 35%,
              #2d0408 60%,
              #0a0000 100%
            )
          `,
          boxShadow: "0 0 50px rgba(146,0,0,0.3)",
        }}
      />

      {/* Layer 4: Bright red ring */}
      <div
        ref={setLayerRef(4)}
        className="absolute rounded-full hal-red-ring"
        style={{
          width: "34%",
          height: "34%",
          background: `
            radial-gradient(circle at 50% 50%,
              #F11A08 0%,
              #cc0000 35%,
              #920000 70%,
              #5a0000 100%
            )
          `,
          boxShadow:
            "0 0 30px rgba(241,26,8,0.5), 0 0 70px rgba(204,0,0,0.25)",
        }}
      />

      {/* Layer 5: Amber/orange transition */}
      <div
        ref={setLayerRef(5)}
        className="absolute rounded-full"
        style={{
          width: "16%",
          height: "16%",
          background: `
            radial-gradient(circle at 49% 49%,
              #ff9900 0%,
              #ff6600 30%,
              #cc3300 65%,
              #F11A08 100%
            )
          `,
          boxShadow: "0 0 20px rgba(255,153,0,0.35)",
        }}
      />

      {/* Layer 6: Yellow/gold core — the "pupil" */}
      <div
        ref={setLayerRef(6)}
        className="absolute rounded-full hal-core"
        style={{
          width: "7%",
          height: "7%",
          background: `
            radial-gradient(circle at 47% 47%,
              #fffbe0 0%,
              #FFE913 25%,
              #FFCC00 55%,
              #ff9900 100%
            )
          `,
          boxShadow:
            "0 0 10px rgba(255,233,19,0.9), 0 0 25px rgba(255,204,0,0.5), 0 0 50px rgba(241,26,8,0.25)",
        }}
      />

      {/* Hexagonal aperture hint */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: "26%",
          height: "26%",
          opacity: 0.04,
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.5) 2deg, transparent 4deg, transparent 56deg, rgba(255,255,255,0.5) 58deg, transparent 60deg, transparent 116deg, rgba(255,255,255,0.5) 118deg, transparent 120deg, transparent 176deg, rgba(255,255,255,0.5) 178deg, transparent 180deg, transparent 236deg, rgba(255,255,255,0.5) 238deg, transparent 240deg, transparent 296deg, rgba(255,255,255,0.5) 298deg, transparent 300deg, transparent 356deg, rgba(255,255,255,0.5) 358deg, transparent 360deg)",
        }}
      />

      {/* Full glass overlay — convex distortion + fresnel edge */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "82%",
          height: "82%",
          background: `
            radial-gradient(circle at 50% 50%,
              transparent 60%,
              rgba(255,255,255,0.02) 75%,
              rgba(255,255,255,0.05) 90%,
              rgba(255,255,255,0.08) 100%
            )
          `,
          zIndex: 22,
        }}
      />

      <style jsx>{`
        @keyframes hal-pulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(255,233,19,0.9),
                        0 0 25px rgba(255,204,0,0.5),
                        0 0 50px rgba(241,26,8,0.25);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 14px rgba(255,233,19,1),
                        0 0 35px rgba(255,204,0,0.7),
                        0 0 70px rgba(241,26,8,0.35);
            transform: scale(1.06);
          }
        }
        @keyframes hal-ring-pulse {
          0%, 100% {
            box-shadow: 0 0 30px rgba(241,26,8,0.5),
                        0 0 70px rgba(204,0,0,0.25);
          }
          50% {
            box-shadow: 0 0 40px rgba(241,26,8,0.6),
                        0 0 90px rgba(204,0,0,0.35);
          }
        }
        .hal-core {
          animation: hal-pulse 5s ease-in-out infinite;
        }
        .hal-red-ring {
          animation: hal-ring-pulse 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
