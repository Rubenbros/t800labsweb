"use client";

import { useEffect, useRef } from "react";

// --- Configuration ---
const BIKE_COLORS = ["#ff4da6", "#00d4ff"] as const;
const BIKE_SIZE = 4;
const TRAIL_WIDTH = 2;
const SPEED = 2.5; // pixels per frame
const MIN_TURN_INTERVAL = 60; // frames (~1s at 60fps)
const MAX_TURN_INTERVAL = 180; // frames (~3s at 60fps)
const TRAIL_MAX_LENGTH = 600; // max trail segments kept
const TRAIL_FADE_RATE = 0.003; // how fast old trail segments fade (slower = longer trails)
const GLOW_BLUR = 14;
const HEAD_GLOW_BLUR = 20;
const GLOBAL_OPACITY = 0.7; // overall canvas opacity
const BACKGROUND_FADE_ALPHA = 0.008; // slow fade for persistence (lower = trails last longer)

type Direction = 0 | 1 | 2 | 3; // 0=right, 1=down, 2=left, 3=up

interface TrailSegment {
  x: number;
  y: number;
  opacity: number;
}

interface Bike {
  x: number;
  y: number;
  direction: Direction;
  color: string;
  trailSegments: TrailSegment[];
  nextTurnIn: number; // frames until next turn
}

const DIRECTION_VECTORS: Record<Direction, [number, number]> = {
  0: [SPEED, 0], // right
  1: [0, SPEED], // down
  2: [-SPEED, 0], // left
  3: [0, -SPEED], // up
};

function randomTurnInterval(): number {
  return (
    MIN_TURN_INTERVAL +
    Math.floor(Math.random() * (MAX_TURN_INTERVAL - MIN_TURN_INTERVAL))
  );
}

function turn90(current: Direction): Direction {
  // Randomly turn left or right (perpendicular)
  if (Math.random() < 0.5) {
    return ((current + 1) % 4) as Direction;
  }
  return ((current + 3) % 4) as Direction;
}

function createBike(
  color: string,
  canvasWidth: number,
  canvasHeight: number,
): Bike {
  return {
    x: Math.random() * canvasWidth * 0.6 + canvasWidth * 0.2,
    y: Math.random() * canvasHeight * 0.6 + canvasHeight * 0.2,
    direction: (Math.floor(Math.random() * 4)) as Direction,
    color,
    trailSegments: [],
    nextTurnIn: randomTurnInterval(),
  };
}

export default function TronBikes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let isVisible = false;
    let bikes: Bike[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent?.clientWidth || window.innerWidth;
      const h = parent?.clientHeight || window.innerHeight;
      canvas.width = w;
      canvas.height = h;

      // Reinitialize bikes on resize if none exist
      if (bikes.length === 0) {
        bikes = BIKE_COLORS.map((color) => createBike(color, w, h));
      } else {
        // Keep bikes but clamp to new bounds
        for (const bike of bikes) {
          bike.x = Math.min(bike.x, w - BIKE_SIZE);
          bike.y = Math.min(bike.y, h - BIKE_SIZE);
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const updateBike = (bike: Bike) => {
      // Record current position as trail
      bike.trailSegments.push({
        x: bike.x,
        y: bike.y,
        opacity: 1.0,
      });

      // Trim trail if too long
      if (bike.trailSegments.length > TRAIL_MAX_LENGTH) {
        bike.trailSegments.shift();
      }

      // Fade old trail segments
      for (const seg of bike.trailSegments) {
        seg.opacity = Math.max(0, seg.opacity - TRAIL_FADE_RATE);
      }

      // Remove fully faded segments
      bike.trailSegments = bike.trailSegments.filter((s) => s.opacity > 0.01);

      // Countdown to next turn
      bike.nextTurnIn--;
      if (bike.nextTurnIn <= 0) {
        bike.direction = turn90(bike.direction);
        bike.nextTurnIn = randomTurnInterval();
      }

      // Move
      const [dx, dy] = DIRECTION_VECTORS[bike.direction];
      bike.x += dx;
      bike.y += dy;

      // Bounce off edges — turn away from the wall (never cross it)
      const w = canvas.width;
      const h = canvas.height;
      const edgeMargin = 20;

      if (bike.x <= edgeMargin && bike.direction === 2) {
        bike.x = edgeMargin;
        bike.direction = Math.random() < 0.5 ? 1 : 3; // turn down or up
        bike.nextTurnIn = randomTurnInterval();
      } else if (bike.x >= w - edgeMargin && bike.direction === 0) {
        bike.x = w - edgeMargin;
        bike.direction = Math.random() < 0.5 ? 1 : 3;
        bike.nextTurnIn = randomTurnInterval();
      }
      if (bike.y <= edgeMargin && bike.direction === 3) {
        bike.y = edgeMargin;
        bike.direction = Math.random() < 0.5 ? 0 : 2; // turn right or left
        bike.nextTurnIn = randomTurnInterval();
      } else if (bike.y >= h - edgeMargin && bike.direction === 1) {
        bike.y = h - edgeMargin;
        bike.direction = Math.random() < 0.5 ? 0 : 2;
        bike.nextTurnIn = randomTurnInterval();
      }
    };

    const drawBike = (bike: Bike) => {
      if (!ctx) return;

      // Draw trail segments
      if (bike.trailSegments.length > 1) {
        for (let i = 1; i < bike.trailSegments.length; i++) {
          const prev = bike.trailSegments[i - 1];
          const curr = bike.trailSegments[i];
          const segOpacity = Math.min(prev.opacity, curr.opacity);

          if (segOpacity < 0.02) continue;

          ctx.save();
          ctx.globalAlpha = segOpacity * 0.85;
          ctx.strokeStyle = bike.color;
          ctx.lineWidth = TRAIL_WIDTH;
          ctx.shadowColor = bike.color;
          ctx.shadowBlur = GLOW_BLUR * segOpacity;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Draw bike head (brighter, glowing dot)
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.shadowColor = bike.color;
      ctx.shadowBlur = HEAD_GLOW_BLUR;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        bike.x - BIKE_SIZE / 2,
        bike.y - BIKE_SIZE / 2,
        BIKE_SIZE,
        BIKE_SIZE,
      );

      // Second pass for color glow
      ctx.fillStyle = bike.color;
      ctx.shadowBlur = HEAD_GLOW_BLUR * 1.5;
      ctx.fillRect(
        bike.x - BIKE_SIZE / 2 - 1,
        bike.y - BIKE_SIZE / 2 - 1,
        BIKE_SIZE + 2,
        BIKE_SIZE + 2,
      );
      ctx.restore();
    };

    const draw = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      // Subtle background fade for trail persistence with slow disappearance
      ctx.fillStyle = `rgba(0, 0, 0, ${BACKGROUND_FADE_ALPHA})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw each bike
      for (const bike of bikes) {
        updateBike(bike);
        drawBike(bike);
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
      className="tron-bikes-canvas absolute inset-0 h-full w-full"
      style={{ opacity: GLOBAL_OPACITY }}
    />
  );
}
