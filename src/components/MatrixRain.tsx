"use client";

import { useEffect, useRef } from "react";

const CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/{}[]();:=+*#@!";
const FONT_SIZE = 14;
const FADE_ALPHA = 0.04;
const DROP_SPEED = 0.12; // <1 = slower than 1 char per frame

export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let columns = 0;
    let drops: number[] = [];
    let animId = 0;
    let isVisible = false;

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent?.clientWidth || window.innerWidth;
      canvas.height = parent?.clientHeight || window.innerHeight;
      columns = Math.floor(canvas.width / FONT_SIZE);
      // Preserve existing drops, add new ones if needed
      const newDrops = Array(columns)
        .fill(0)
        .map((_, i) =>
          drops[i] !== undefined ? drops[i] : Math.random() * -50,
        );
      drops = newDrops;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      // Fade trail
      ctx.fillStyle = `rgba(0, 0, 0, ${FADE_ALPHA})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const row = Math.floor(drops[i]);
        const y = row * FONT_SIZE;

        // Bright head character
        ctx.fillStyle = "#00ff41";
        ctx.globalAlpha = 0.9;
        ctx.fillText(char, x, y);

        // Slightly dimmer character just above
        if (row > 1) {
          ctx.fillStyle = "#00cc33";
          ctx.globalAlpha = 0.4;
          const prevChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillText(prevChar, x, (row - 1) * FONT_SIZE);
        }

        ctx.globalAlpha = 1;

        drops[i] += DROP_SPEED;

        // Reset drop with some randomness
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -20;
        }
      }

      animId = requestAnimationFrame(draw);
    };

    // IntersectionObserver to start/stop animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          animId = requestAnimationFrame(draw);
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain-canvas absolute inset-0 h-full w-full"
    />
  );
}
