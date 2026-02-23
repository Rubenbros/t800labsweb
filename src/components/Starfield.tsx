"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const visibleRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PARTICLE_COUNT = 180;
    const MAX_DEPTH = 1000;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles at random depths
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        z: Math.random() * MAX_DEPTH,
        speed: 0.8 + Math.random() * 2.5,
        size: 0.5 + Math.random() * 1.5,
      });
    }

    const draw = () => {
      if (!visibleRef.current) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Fade trail for streaking effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (const p of particles) {
        p.z -= p.speed;

        // Reset when particle passes camera
        if (p.z <= 0) {
          p.x = (Math.random() - 0.5) * canvas.width;
          p.y = (Math.random() - 0.5) * canvas.height;
          p.z = MAX_DEPTH;
          p.speed = 0.8 + Math.random() * 2.5;
        }

        // 3D → 2D projection
        const scale = 300 / p.z;
        const sx = cx + p.x * scale;
        const sy = cy + p.y * scale;
        const r = Math.max(0.3, p.size * scale);

        // Brightness based on proximity
        const brightness = Math.min(1, (MAX_DEPTH - p.z) / (MAX_DEPTH * 0.7));
        const alpha = brightness * 0.8;

        // Close particles: gold. Far particles: white
        if (brightness > 0.5) {
          ctx.fillStyle = `rgba(212, 160, 23, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.7})`;
        }

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // Speed streak for fast/close particles
        if (brightness > 0.3 && p.speed > 1.5) {
          const prevScale = 300 / (p.z + p.speed * 4);
          const prevSx = cx + p.x * prevScale;
          const prevSy = cy + p.y * prevScale;
          ctx.strokeStyle = `rgba(212, 160, 23, ${alpha * 0.25})`;
          ctx.lineWidth = r * 0.4;
          ctx.beginPath();
          ctx.moveTo(prevSx, prevSy);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    // Only animate when visible
    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 },
    );
    observer.observe(canvas);

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: "block" }}
    />
  );
}
