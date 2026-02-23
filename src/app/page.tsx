"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Image from "next/image";

export default function Home() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // ═══════════════════════════════════════
      // HERO — entrance timeline
      // ═══════════════════════════════════════
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(".hero-scanline", { top: "-2px" }, { top: "100%", duration: 1.2, ease: "power2.inOut" }, 0);
      tl.fromTo(".hero-logo", { scale: 0.5, opacity: 0, filter: "blur(12px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.4 }, 0.4);
      tl.to(".hero-logo", { keyframes: [{ filter: "brightness(3) hue-rotate(20deg)", duration: 0.05 }, { filter: "brightness(1) hue-rotate(0deg)", duration: 0.05 }, { filter: "brightness(2)", duration: 0.04 }, { filter: "brightness(1)", duration: 0.06 }] }, 1.5);
      tl.fromTo(".hero-title-t800", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.4);
      tl.fromTo(".hero-title-labs", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.6);
      tl.fromTo(".hero-divider", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 1.8);
      tl.fromTo(".hero-tagline", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 2.1);
      tl.fromTo(".hero-scroll-indicator", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 2.4);
      tl.fromTo(".hero-corner", { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.1 }, 2.0);

      // Hero ambient loops
      gsap.to(".hero-glow", { scale: 1.15, opacity: 0.6, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".hero-logo", { y: -6, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
      gsap.to(".hero-scroll-arrow", { y: 8, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 3 });
      gsap.to(".hero-scroll-glow", { opacity: 0.8, scale: 1.3, duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 3 });

      // ═══════════════════════════════════════
      // HERO — fade out on scroll (pinned)
      // Fade the wrapper so loops inside don't fight
      // ═══════════════════════════════════════
      gsap.to(".hero-fade-wrapper", {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "+=600",
          scrub: true,
          pin: true,
        },
      });

      // ═══════════════════════════════════════
      // BOND BARREL SEQUENCE
      // ═══════════════════════════════════════

      // Circle travel: far left → far right (off-screen)
      const startX = -vw * 0.55;
      const endX = vw * 0.5;
      const travel = endX - startX;

      // Ghost positions along the circle's path
      const ghost1X = startX + travel * 0.28;
      const ghost2X = startX + travel * 0.52;
      const ghost3X = startX + travel * 0.76;

      // Init positions
      gsap.set(".bond-assembly", { xPercent: -50, yPercent: -50 });
      gsap.set([".bond-ghost-1", ".bond-ghost-2", ".bond-ghost-3"], {
        xPercent: -50, yPercent: -50,
      });
      gsap.set(".bond-ghost-1", { x: ghost1X, y: 0 });
      gsap.set(".bond-ghost-2", { x: ghost2X, y: 0 });
      gsap.set(".bond-ghost-3", { x: ghost3X, y: 0 });

      const bt = gsap.timeline({
        scrollTrigger: {
          trigger: ".bond-section",
          start: "top top",
          end: "+=3500",
          scrub: 1,
          pin: true,
        },
      });

      // ── Phase 1: Small circle left → right (0→7) ──
      bt.fromTo(".bond-assembly",
        { x: startX, y: 0, scale: 0.12, opacity: 0 },
        { opacity: 1, duration: 0.3 }, 0);
      bt.to(".bond-assembly",
        { x: endX, duration: 7, ease: "none" }, 0);

      // Ghost trail 1 — appears at ~28% of travel
      bt.fromTo(".bond-ghost-1",
        { opacity: 0 }, { opacity: 0.5, duration: 0.05 }, 2);
      bt.to(".bond-ghost-1",
        { opacity: 0, duration: 1.5 }, 2.05);

      // Ghost trail 2 — appears at ~52% of travel
      bt.fromTo(".bond-ghost-2",
        { opacity: 0 }, { opacity: 0.5, duration: 0.05 }, 3.8);
      bt.to(".bond-ghost-2",
        { opacity: 0, duration: 1.5 }, 3.85);

      // Ghost trail 3 — appears at ~76% of travel
      bt.fromTo(".bond-ghost-3",
        { opacity: 0 }, { opacity: 0.5, duration: 0.05 }, 5.5);
      bt.to(".bond-ghost-3",
        { opacity: 0, duration: 1.5 }, 5.55);

      // ── Phase 1b: Circle expands at right edge (7→9.5) ──
      // Grows big enough to go off-screen right
      bt.to(".bond-assembly",
        { scale: 1.8, duration: 2.5, ease: "power2.out" }, 7);
      // Rifling fades in as it grows + slow rotation
      bt.to(".bond-rifling",
        { opacity: 1, duration: 1.5 }, 7.5);
      bt.to(".bond-rifling",
        { rotation: 90, duration: 9.5, ease: "none" }, 7.5);

      // ── Phase 1b: Once big, moves to center (9.5→13) ──
      bt.to(".bond-assembly",
        { x: 0, y: 0, duration: 3.5, ease: "power2.inOut" }, 9.5);

      // ── Phase 2: Bond character appears inside barrel ──
      bt.to(".bond-video-wrapper",
        { opacity: 1, duration: 0.8 }, 9.5);

      // ── Phase 2b: Sprite animation ──
      // Frames 0-5 = walk, 6-9 = turn, 10-11 = aim
      const TOTAL_FRAMES = 12;
      const WALK_FRAMES = 6;
      const TURN_START = 6;
      const CANVAS_W = 301;
      const CANVAS_H = 803;

      // Preload all frames
      const frames: HTMLImageElement[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new window.Image();
        img.src = `/bond-frames/frame-${String(i).padStart(2, "0")}.png`;
        frames.push(img);
      }

      const drawFrame = (f: number) => {
        const canvas = document.querySelector(".bond-sprite-canvas") as HTMLCanvasElement;
        const img = frames[f];
        if (!canvas || !img?.complete) return;
        const ctx2d = canvas.getContext("2d");
        if (!ctx2d) return;
        ctx2d.clearRect(0, 0, CANVAS_W, CANVAS_H);
        const dx = (CANVAS_W - img.naturalWidth) / 2;
        ctx2d.drawImage(img, dx, 0);
      };

      frames[0].onload = () => drawFrame(0);

      // Walk cycle loops while circle moves to center (9.5→12)
      const walkObj = { frame: 0 };
      bt.to(walkObj, {
        frame: WALK_FRAMES * 3 - 1,
        ease: `steps(${WALK_FRAMES * 3 - 1})`,
        duration: 2.5,
        onUpdate: () => drawFrame(Math.round(walkObj.frame) % WALK_FRAMES),
      }, 9.5);

      // Turn + aim starts just before circle settles (12→17)
      const turnObj = { frame: TURN_START };
      bt.to(turnObj, {
        frame: TOTAL_FRAMES - 1,
        ease: `steps(${TOTAL_FRAMES - 1 - TURN_START})`,
        duration: 5,
        onUpdate: () => drawFrame(Math.round(turnObj.frame)),
      }, 12);

      // ── Phase 3: Flash + blood fills barrel opening (17→22) ──
      // Muzzle flash — bright burst then quick fade
      bt.fromTo(".bond-flash",
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1.2, duration: 0.15, ease: "power4.out" }, 17);
      bt.to(".bond-flash",
        { scale: 0.8, opacity: 0.7, duration: 0.1 }, 17.15);
      bt.to(".bond-flash",
        { scale: 1.5, opacity: 0, duration: 0.3, ease: "power2.out" }, 17.25);

      // ── Phase 4: Blood drips cascade down screen (17.5→24) ──
      // Liquid easing: slow start → fast middle → slow near bottom
      const liquidEase = "slow(0.5, 0.8, false)";
      const liquidEase2 = "slow(0.4, 0.7, false)";

      // Narrow drips fall first — keyframed speed variation
      bt.to(".blood-drip-1", {
        keyframes: [
          { height: "30%", duration: 0.2, ease: "power2.in" },
          { height: "80%", duration: 0.25, ease: "none" },
          { height: "100%", duration: 0.3, ease: "power3.out" },
          { height: "115%", duration: 0.15, ease: "power1.out" },
        ],
      }, 17.5);
      bt.to(".blood-drip-2", {
        keyframes: [
          { height: "20%", duration: 0.3, ease: "power1.in" },
          { height: "65%", duration: 0.4, ease: "power2.in" },
          { height: "95%", duration: 0.35, ease: "power1.out" },
          { height: "115%", duration: 0.45, ease: "sine.out" },
        ],
      }, 18.0);
      bt.to(".blood-drip-3", {
        keyframes: [
          { height: "25%", duration: 0.25, ease: "power2.in" },
          { height: "75%", duration: 0.35, ease: "none" },
          { height: "105%", duration: 0.3, ease: "power2.out" },
          { height: "115%", duration: 0.2, ease: "sine.out" },
        ],
      }, 18.3);

      // Wider flows — organic liquid speed variation
      bt.to(".blood-drip-4", { height: "115%", duration: 2.0, ease: liquidEase }, 18.8);
      bt.to(".blood-drip-5", { height: "115%", duration: 1.8, ease: liquidEase2 }, 19.0);
      bt.to(".blood-drip-6", { height: "115%", duration: 2.2, ease: liquidEase }, 19.3);
      bt.to(".blood-drip-7", { height: "115%", duration: 2.0, ease: liquidEase2 }, 19.5);

      // Solid fill within group ensures full coverage
      bt.to(".blood-solid", { opacity: 1, duration: 0.5 }, 21.5);

      // Transition to black: raise group opacity to fully opaque + change colors
      bt.to(".bond-blood-drips", { opacity: 1, duration: 2, ease: "power2.inOut" }, 22);
      bt.to(".blood-solid", { backgroundColor: "#000000", duration: 2, ease: "power2.inOut" }, 22);
      bt.to(".blood-drip", { backgroundColor: "#000000", duration: 2, ease: "power2.inOut" }, 22);
      bt.to(".bond-assembly", { opacity: 0, duration: 1.5 }, 22);

      // ═══════════════════════════════════════
      // PERSISTENT SCROLL INDICATOR
      // ═══════════════════════════════════════
      // Fade in after hero entrance
      gsap.fromTo(".scroll-persistent",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 3 });

      // Arrow bounce loop
      gsap.to(".scroll-persistent-arrow", {
        y: 6, duration: 1, repeat: -1, yoyo: true, ease: "sine.inOut",
      });

      // Progress bar tracks total scroll
      gsap.to(".scroll-progress-fill", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Hide indicator near bottom of page
      gsap.to(".scroll-persistent", {
        opacity: 0,
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "bottom-=300 bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="relative bg-black">

      {/* ════════════════════════════════════════════
          PERSISTENT SCROLL INDICATOR (fixed)
          ════════════════════════════════════════════ */}
      <div className="scroll-persistent pointer-events-none fixed bottom-0 left-0 right-0 z-[999] opacity-0">
        {/* Bottom center — arrow + label */}
        <div className="flex flex-col items-center gap-1 pb-5">
          <span className="font-mono text-[9px] tracking-[0.25em] text-red-500/40 uppercase">scroll</span>
          <svg className="scroll-persistent-arrow h-4 w-4 text-red-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Right edge — progress bar */}
        <div className="absolute right-4 h-[60vh] w-[1px] bg-white/5" style={{ top: '20vh' }}>
          <div className="scroll-progress-fill h-full w-full origin-top scale-y-0 bg-gradient-to-b from-red-500/60 to-red-500/20" />
        </div>
      </div>

      {/* ════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════ */}
      <section className="hero-section relative h-screen overflow-hidden bg-black">
        <div className="hero-fade-wrapper absolute inset-0">
          <div className="hero-glow pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(229,9,20,0.12)_0%,_transparent_70%)] opacity-40" />
          <div className="hero-scanline pointer-events-none absolute left-0 right-0 z-40 h-[2px] bg-red-500/40 shadow-[0_0_20px_4px_rgba(229,9,20,0.3)]" style={{ top: "-2px" }} />

          <div className="hero-corner absolute left-6 top-6 opacity-0">
            <div className="h-8 w-[1px] bg-gradient-to-b from-red-500/40 to-transparent" />
            <div className="absolute top-0 h-[1px] w-8 bg-gradient-to-r from-red-500/40 to-transparent" />
            <span className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.3em] text-red-500/30">SYS.01</span>
          </div>
          <div className="hero-corner absolute right-6 top-6 opacity-0">
            <div className="ml-auto h-8 w-[1px] bg-gradient-to-b from-red-500/40 to-transparent" />
            <div className="absolute right-0 top-0 h-[1px] w-8 bg-gradient-to-l from-red-500/40 to-transparent" />
            <span className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.3em] text-red-500/30">v0.8</span>
          </div>
          <div className="hero-corner absolute bottom-6 left-6 opacity-0">
            <div className="h-8 w-[1px] bg-gradient-to-t from-red-500/40 to-transparent" />
            <div className="absolute bottom-0 h-[1px] w-8 bg-gradient-to-r from-red-500/40 to-transparent" />
          </div>
          <div className="hero-corner absolute bottom-6 right-6 opacity-0">
            <div className="ml-auto h-8 w-[1px] bg-gradient-to-t from-red-500/40 to-transparent" />
            <div className="absolute bottom-0 right-0 h-[1px] w-8 bg-gradient-to-l from-red-500/40 to-transparent" />
          </div>

          <div className="hero-content relative z-10 flex h-full items-center justify-center">
          <div className="flex flex-col items-center px-6">
            <div className="hero-logo mb-8 opacity-0">
              <Image src="/logo-t800labs.png" alt="T800 Labs" width={300} height={164} priority className="h-auto w-[220px] drop-shadow-[0_0_40px_rgba(229,9,20,0.25)] md:w-[300px]" />
            </div>
            <div className="flex items-baseline gap-4 overflow-hidden">
              <span className="hero-title-t800 text-5xl font-bold tracking-[-0.04em] text-white opacity-0 md:text-7xl">T800</span>
              <span className="hero-title-labs text-5xl font-bold tracking-[-0.04em] text-accent opacity-0 md:text-7xl">Labs</span>
            </div>
            <div className="hero-divider mt-5 h-[1px] w-24 origin-center scale-x-0 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            <p className="hero-tagline mt-6 text-center font-mono text-xs tracking-[0.2em] text-white/30 uppercase opacity-0 md:text-sm">Software de nueva generación</p>
            <div className="hero-scroll-indicator mt-14 flex flex-col items-center gap-3 opacity-0">
              <span className="font-mono text-[11px] tracking-[0.3em] text-red-500/50 uppercase">Scroll</span>
              <div className="relative flex flex-col items-center">
                <div className="hero-scroll-glow absolute h-10 w-10 rounded-full bg-[radial-gradient(circle,_rgba(229,9,20,0.4)_0%,_transparent_70%)] opacity-50" />
                <svg className="hero-scroll-arrow h-7 w-7 text-red-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BOND BARREL SEQUENCE
          ════════════════════════════════════════════ */}
      <section className="bond-section relative h-screen overflow-hidden bg-black">

        {/* ── Ghost trail circles (3 echoes that appear and fade) ── */}
        <div className="bond-ghost-1 absolute left-1/2 top-1/2 rounded-full bg-white opacity-0" style={{ width: "6vh", height: "6vh" }} />
        <div className="bond-ghost-2 absolute left-1/2 top-1/2 rounded-full bg-white opacity-0" style={{ width: "6vh", height: "6vh" }} />
        <div className="bond-ghost-3 absolute left-1/2 top-1/2 rounded-full bg-white opacity-0" style={{ width: "6vh", height: "6vh" }} />

        {/* ── Barrel assembly (circle + rifling + video + blood) ── */}
        <div
          className="bond-assembly absolute left-1/2 top-1/2"
          style={{ width: "180vh", height: "180vh", willChange: "transform, opacity" }}
        >
          {/* White circle — the barrel opening (visible during small circle phase) */}
          <div
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-white"
            style={{ width: "18%", height: "18%" }}
          />

          {/* Barrel rifling — zoomed out (55%) for better definition */}
          <div
            className="bond-rifling pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 opacity-0"
            style={{ width: "55%", height: "55%" }}
          >
            <img
              src="/barrel_rifling_bond.png"
              alt=""
              className="h-full w-full object-contain"
            />
          </div>

          {/* Character overlay — clipped to barrel opening circle */}
          <div
            className="bond-video-wrapper absolute inset-0 z-[25] opacity-0"
            style={{ clipPath: "circle(9.1% at 50% 50%)" }}
          >
            <div className="absolute inset-0 bg-white" />
            <canvas
              className="bond-sprite-canvas absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              width={301}
              height={803}
              style={{
                width: "6%",
                height: "16%",
              }}
            />
          </div>

          {/* Gun flash — centered on the circle */}
          {/* Muzzle flash — small fire effect */}
          <div className="bond-flash pointer-events-none absolute left-1/2 top-[44%] z-30 -translate-x-1/2 -translate-y-1/2 opacity-0">
            <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_15px_8px_rgba(255,255,255,0.7)]" />
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-200 shadow-[0_0_10px_5px_rgba(255,200,50,0.6)]" />
            <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-400 shadow-[0_0_8px_4px_rgba(255,150,0,0.5)]" />
          </div>

        </div>

        {/* ── Blood drips — group opacity so overlaps don't stack ── */}
        <div className="bond-blood-drips pointer-events-none absolute inset-0 z-50 overflow-hidden" style={{ opacity: 0.5 }}>
          {/* Phase 1: Narrow drips — solid inside group */}
          <div className="blood-drip blood-drip-1 absolute top-0 bg-[#550010]"
               style={{ left: '46%', width: '5%', height: '0%', borderRadius: '0 0 50% 50%' }} />
          <div className="blood-drip blood-drip-2 absolute top-0 bg-[#4A0008]"
               style={{ left: '20%', width: '4%', height: '0%', borderRadius: '0 0 50% 50%' }} />
          <div className="blood-drip blood-drip-3 absolute top-0 bg-[#550010]"
               style={{ left: '73%', width: '4%', height: '0%', borderRadius: '0 0 50% 50%' }} />

          {/* Phase 2: Wider flows — solid, same tone */}
          <div className="blood-drip blood-drip-4 absolute top-0 bg-[#4A0008]"
               style={{ left: '28%', width: '26%', height: '0%', borderRadius: '0 0 30% 30%' }} />
          <div className="blood-drip blood-drip-5 absolute top-0 bg-[#550010]"
               style={{ left: '52%', width: '24%', height: '0%', borderRadius: '0 0 30% 30%' }} />
          <div className="blood-drip blood-drip-6 absolute top-0 bg-[#4A0008]"
               style={{ left: '-2%', width: '32%', height: '0%', borderRadius: '0 0 25% 25%' }} />
          <div className="blood-drip blood-drip-7 absolute top-0 bg-[#550010]"
               style={{ left: '74%', width: '28%', height: '0%', borderRadius: '0 0 25% 25%' }} />

          {/* Final solid cover within group */}
          <div className="blood-solid absolute inset-0 bg-[#550010] opacity-0" />
        </div>
      </section>

    </div>
  );
}
