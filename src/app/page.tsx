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
          end: "+=6000",
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
      // Rifling fades in as it grows
      bt.to(".bond-rifling",
        { opacity: 1, duration: 1.5 }, 7.5);

      // ── Phase 1b: Once big, moves to center (9.5→13) ──
      bt.to(".bond-assembly",
        { x: 0, y: 0, duration: 3.5, ease: "power2.inOut" }, 9.5);

      // ── Phase 2: Bond video appears when circle is fully expanded ──
      bt.to(".bond-video-wrapper",
        { opacity: 1, duration: 1 }, 9.5);
      // TODO: sync video.currentTime to scroll progress here
      // The video element will be controlled via ScrollTrigger onUpdate

      // ── Phase 3: Flash + blood drip (17→20) ──
      bt.fromTo(".bond-flash",
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 2.5, duration: 0.3 }, 17);
      bt.to(".bond-flash",
        { opacity: 0, duration: 0.4 }, 17.3);
      // Blood drips from top of circle
      bt.fromTo(".bond-blood-drip",
        { yPercent: -100 },
        { yPercent: 0, duration: 3, ease: "power1.in" }, 17.5);

      // ── Phase 4: Blood fills screen, fade to black (20→24) ──
      bt.fromTo(".bond-blood-screen",
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.in" }, 20);
      bt.to(".bond-assembly",
        { opacity: 0, duration: 1.5 }, 20);
      bt.to(".bond-blood-screen",
        { backgroundColor: "#000000", duration: 3, ease: "power2.inOut" }, 22);

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="relative bg-black">

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
          >
            {/* Blood drip — falls from top inside circle */}
            <div className="bond-blood-drip absolute inset-x-0 top-0 z-20 h-full" style={{ transform: "translateY(-100%)" }}>
              <div className="h-full w-full bg-[#8B0000]" />
              <div className="absolute bottom-0 left-[8%] h-[50px] w-[5px] translate-y-full rounded-b-full bg-[#8B0000]" />
              <div className="absolute bottom-0 left-[20%] h-[80px] w-[7px] translate-y-full rounded-b-full bg-[#8B0000]" />
              <div className="absolute bottom-0 left-[33%] h-[35px] w-[4px] translate-y-full rounded-b-full bg-[#8B0000]" />
              <div className="absolute bottom-0 left-[45%] h-[65px] w-[6px] translate-y-full rounded-b-full bg-[#8B0000]" />
              <div className="absolute bottom-0 left-[58%] h-[90px] w-[8px] translate-y-full rounded-b-full bg-[#8B0000]" />
              <div className="absolute bottom-0 left-[70%] h-[40px] w-[5px] translate-y-full rounded-b-full bg-[#8B0000]" />
              <div className="absolute bottom-0 left-[82%] h-[70px] w-[6px] translate-y-full rounded-b-full bg-[#8B0000]" />
              <div className="absolute bottom-0 left-[93%] h-[55px] w-[5px] translate-y-full rounded-b-full bg-[#8B0000]" />
            </div>
          </div>

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

          {/* Video overlay — clipped to barrel opening circle */}
          <div
            className="bond-video-wrapper absolute inset-0 z-[25] opacity-0"
            style={{ clipPath: "circle(9.1% at 50% 50%)" }}
          >
            {/*
              TODO: Replace placeholder with:
              <video className="bond-video h-full w-full object-cover" src="/bond-sequence.mp4" muted playsInline preload="auto" />
            */}
            <div className="flex h-full w-full items-center justify-center bg-white/90 font-mono text-xs text-black/30">
              VIDEO
            </div>
          </div>

          {/* Gun flash — centered on the circle */}
          <div className="bond-flash pointer-events-none absolute left-1/2 top-1/2 z-30 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-[0_0_80px_40px_rgba(255,255,255,0.95)]" />
        </div>

        {/* Full-screen blood overlay — covers everything, final takeover */}
        <div className="bond-blood-screen pointer-events-none absolute inset-0 z-40 bg-[#8B0000] opacity-0" />
      </section>

    </div>
  );
}
