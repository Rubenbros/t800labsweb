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
    // Normalized -1 to 1
    mouseRef.current.x = (e.clientX - cx) / (window.innerWidth / 2);
    mouseRef.current.y = (e.clientY - cy) / (window.innerHeight / 2);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      const { x, y } = mouseRef.current;
      // Each layer moves progressively more (parallax depth)
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
      style={{ width: "min(60vw, 60vh)", height: "min(60vw, 60vh)" }}
    >
      {/* Layer 0: Outer ambient glow on background */}
      <div
        ref={setLayerRef(0)}
        className="absolute rounded-full"
        style={{
          width: "110%",
          height: "110%",
          background:
            "radial-gradient(circle, rgba(229,9,20,0.08) 0%, rgba(229,9,20,0.03) 40%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* Layer 1: Black bezel / barrel ring */}
      <div
        ref={setLayerRef(1)}
        className="absolute rounded-full"
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle, #111 0%, #080808 85%, #000 100%)",
          boxShadow:
            "inset 0 2px 4px rgba(255,255,255,0.06), inset 0 -2px 4px rgba(0,0,0,0.8), 0 0 60px rgba(229,9,20,0.1)",
        }}
      />

      {/* Layer 2: Dark glass zone */}
      <div
        ref={setLayerRef(2)}
        className="absolute rounded-full"
        style={{
          width: "82%",
          height: "82%",
          background: `
            radial-gradient(circle at 50% 50%,
              #0a0000 0%,
              #050000 60%,
              #000000 100%
            )
          `,
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.9)",
        }}
      />

      {/* Convex glass reflection overlay */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "82%",
          height: "82%",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.01) 100%)",
          zIndex: 10,
        }}
      />

      {/* Layer 3: Deep red glow zone */}
      <div
        ref={setLayerRef(3)}
        className="absolute rounded-full"
        style={{
          width: "58%",
          height: "58%",
          background: `
            radial-gradient(circle at 50% 50%,
              #920000 0%,
              #5a0000 40%,
              #2d0408 70%,
              #0a0000 100%
            )
          `,
          boxShadow: "0 0 40px rgba(146,0,0,0.3)",
        }}
      />

      {/* Layer 4: Bright red ring */}
      <div
        ref={setLayerRef(4)}
        className="absolute rounded-full hal-red-ring"
        style={{
          width: "36%",
          height: "36%",
          background: `
            radial-gradient(circle at 50% 50%,
              #F11A08 0%,
              #cc0000 40%,
              #920000 75%,
              #5a0000 100%
            )
          `,
          boxShadow:
            "0 0 25px rgba(241,26,8,0.4), 0 0 60px rgba(204,0,0,0.2)",
        }}
      />

      {/* Layer 5: Amber/orange transition ring */}
      <div
        ref={setLayerRef(5)}
        className="absolute rounded-full"
        style={{
          width: "18%",
          height: "18%",
          background: `
            radial-gradient(circle at 49% 49%,
              #ff9900 0%,
              #ff6600 35%,
              #cc3300 70%,
              #F11A08 100%
            )
          `,
          boxShadow: "0 0 15px rgba(255,153,0,0.3)",
        }}
      />

      {/* Layer 6: Yellow/gold core — the "pupil" */}
      <div
        ref={setLayerRef(6)}
        className="absolute rounded-full hal-core"
        style={{
          width: "8%",
          height: "8%",
          background: `
            radial-gradient(circle at 48% 48%,
              #fff8c0 0%,
              #FFE913 30%,
              #FFCC00 60%,
              #ff9900 100%
            )
          `,
          boxShadow:
            "0 0 8px rgba(255,233,19,0.8), 0 0 20px rgba(255,204,0,0.4), 0 0 40px rgba(241,26,8,0.2)",
        }}
      />

      {/* Subtle hexagonal aperture hint (very faint) */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "28%",
          height: "28%",
          opacity: 0.03,
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.5) 2deg, transparent 4deg, transparent 56deg, rgba(255,255,255,0.5) 58deg, transparent 60deg, transparent 116deg, rgba(255,255,255,0.5) 118deg, transparent 120deg, transparent 176deg, rgba(255,255,255,0.5) 178deg, transparent 180deg, transparent 236deg, rgba(255,255,255,0.5) 238deg, transparent 240deg, transparent 296deg, rgba(255,255,255,0.5) 298deg, transparent 300deg, transparent 356deg, rgba(255,255,255,0.5) 358deg, transparent 360deg)",
          borderRadius: "50%",
        }}
      />

      <style jsx>{`
        @keyframes hal-pulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(255,233,19,0.8),
                        0 0 20px rgba(255,204,0,0.4),
                        0 0 40px rgba(241,26,8,0.2);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 12px rgba(255,233,19,1),
                        0 0 30px rgba(255,204,0,0.6),
                        0 0 60px rgba(241,26,8,0.3);
            transform: scale(1.08);
          }
        }
        @keyframes hal-ring-pulse {
          0%, 100% {
            box-shadow: 0 0 25px rgba(241,26,8,0.4),
                        0 0 60px rgba(204,0,0,0.2);
          }
          50% {
            box-shadow: 0 0 35px rgba(241,26,8,0.5),
                        0 0 80px rgba(204,0,0,0.3);
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
