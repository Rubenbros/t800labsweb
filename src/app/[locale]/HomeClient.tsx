"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Image from "next/image";
import { useTranslations } from "next-intl";
import Hal9000 from "@/components/Hal9000v2";
import HalShutdownPanel from "@/components/HalShutdownPanel";
import Navbar from "@/components/Navbar";
import MatrixRain from "@/components/MatrixRain";
import ProcessTesseract from "@/components/ProcessTesseract";
import TronBikes from "@/components/TronBikes";

export default function HomeClient() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();

  useEffect(() => {
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const isMobile = vw < 768;

      // Position flying-logo exactly where the spacer is in the hero layout
      const spacer = document.querySelector(".hero-logo-spacer");
      if (spacer) {
        const rect = spacer.getBoundingClientRect();
        const initialWidth = isMobile ? 220 : 300;
        gsap.set(".flying-logo", {
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width / 2,
          xPercent: -50,
          yPercent: -50,
          width: initialWidth,
        });
      }

      // Position flying-title at hero title spacer location
      const titleSpacer = document.querySelector(".hero-title-spacer");
      if (titleSpacer) {
        const titleRect = titleSpacer.getBoundingClientRect();
        const initialFontSize = isMobile ? 48 : 72;
        gsap.set(".flying-title", {
          top: titleRect.top + titleRect.height / 2,
          left: titleRect.left + titleRect.width / 2,
          xPercent: -50,
          yPercent: -50,
          fontSize: initialFontSize,
          gap: isMobile ? 12 : 16,
        });
      }

      // ═══════════════════════════════════════
      // HERO — entrance timeline
      // ═══════════════════════════════════════
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(".hero-scanline", { top: "-2px" }, { top: "100%", duration: 1.2, ease: "power2.inOut" }, 0);
      tl.fromTo(".flying-logo", { scale: 0.5, opacity: 0, filter: "blur(12px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.4 }, 0.4);
      tl.to(".flying-logo", { keyframes: [{ filter: "brightness(3) hue-rotate(20deg)", duration: 0.05 }, { filter: "brightness(1) hue-rotate(0deg)", duration: 0.05 }, { filter: "brightness(2)", duration: 0.04 }, { filter: "brightness(1)", duration: 0.06 }] }, 1.5);
      tl.set(".flying-title", { opacity: 1 }, 1.3);
      tl.fromTo(".flying-t800", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.4);
      tl.fromTo(".flying-labs", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.6);
      tl.fromTo(".hero-divider", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power3.inOut" }, 1.8);
      tl.fromTo(".hero-tagline", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 2.1);
      tl.fromTo(".hero-value-prop", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 2.4);
      tl.fromTo(".hero-cta", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 2.7);
      tl.fromTo(".hero-scroll-indicator", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 3.0);
      tl.fromTo(".hero-corner", { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.1 }, 2.0);

      // Hero ambient loops
      gsap.to(".hero-glow", { scale: 1.15, opacity: 0.6, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      const breathingTween = gsap.to(".flying-logo", { y: -6, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
      const titleBreathingTween = gsap.to(".flying-title", { y: -6, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });
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
          end: isMobile ? "+=350" : "+=600",
          scrub: true,
          pin: true,
        },
      });

      // ═══════════════════════════════════════
      // NAVBAR + LOGO MORPH — during Hero pin
      // ═══════════════════════════════════════

      // Kill breathing loop once scroll starts
      let breathingKilled = false;

      // Calculate responsive target values for navbar logo
      const targetWidth = isMobile ? 100 : 140;
      const targetTop = 40; // center of 80px navbar
      const targetLeft = isMobile ? 58 : 82;

      // Flying logo: center → navbar corner (during 600px hero pin)
      gsap.to(".flying-logo", {
        top: targetTop,
        left: targetLeft,
        xPercent: -50,
        yPercent: -50,
        width: targetWidth,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "+=600",
          scrub: true,
          onUpdate: () => {
            if (!breathingKilled) {
              breathingTween.kill();
              titleBreathingTween.kill();
              gsap.set(".flying-logo", { y: 0 });
              gsap.set(".flying-title", { y: 0 });
              breathingKilled = true;
            }
          },
        },
      });

      // Reduce drop-shadow glow as logo shrinks
      gsap.to(".flying-logo-img", {
        filter: "drop-shadow(0 0 10px rgba(229,9,20,0.15))",
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "+=600",
          scrub: true,
        },
      });

      // Flying title: center → next to logo in navbar
      const titleTargetFontSize = isMobile ? 16 : 20;
      const titleTargetLeft = targetLeft + targetWidth * (isMobile ? 0.22 : 0.25);

      gsap.to(".flying-title", {
        top: targetTop,
        left: titleTargetLeft,
        xPercent: 0,
        yPercent: -50,
        fontSize: titleTargetFontSize,
        gap: isMobile ? 3 : 4,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "+=600",
          scrub: true,
        },
      });

      // Navbar container becomes visible
      gsap.to(".navbar", {
        opacity: 1,
        pointerEvents: "auto",
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "+=100",
          scrub: true,
        },
      });

      // Navbar background materializes
      gsap.to(".navbar-bg", {
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "+=400",
          scrub: true,
        },
      });

      // Red accent line draws itself
      gsap.to(".navbar-accent-line", {
        scaleX: 1,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top+=300 top",
          end: "+=300",
          scrub: true,
        },
      });

      // Nav links fade in staggered
      gsap.to(".navbar-links", {
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top+=400 top",
          end: "+=200",
          scrub: true,
        },
      });
      gsap.fromTo(".navbar-link",
        { y: 10, opacity: 0 },
        {
          y: 0, opacity: 1, stagger: 0.05, ease: "power2.out",
          scrollTrigger: {
            trigger: ".hero-section",
            start: "top+=400 top",
            end: "+=200",
            scrub: true,
          },
        },
      );

      // Hamburger fades in (mobile)
      gsap.to(".navbar-hamburger", {
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top+=400 top",
          end: "+=200",
          scrub: true,
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
          end: isMobile ? "+=1400" : "+=2500",
          scrub: true,
          pin: true,
        },
      });

      // ── Phase 1: Small circle left → right (0→9.5) — slow walk ──
      bt.fromTo(".bond-assembly",
        { x: startX, y: 0, scale: 0.12, opacity: 0 },
        { opacity: 1, duration: 0.3 }, 0);
      bt.to(".bond-assembly",
        { x: endX, duration: 9.5, ease: "none" }, 0);

      // Ghost trail 1 — appears at ~28% + service label (longer visible)
      bt.fromTo(".bond-ghost-1",
        { opacity: 0 }, { opacity: 0.6, duration: 0.1 }, 2.7);
      bt.fromTo(".ghost-label-1",
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 2.7);
      bt.to(".bond-ghost-1",
        { opacity: 0, duration: 2.5 }, 4.7);
      bt.to(".ghost-label-1",
        { opacity: 0, y: -10, duration: 2 }, 5.1);

      // Ghost trail 2 — appears at ~52% + service label (longer visible)
      bt.fromTo(".bond-ghost-2",
        { opacity: 0 }, { opacity: 0.6, duration: 0.1 }, 5.1);
      bt.fromTo(".ghost-label-2",
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 5.1);
      bt.to(".bond-ghost-2",
        { opacity: 0, duration: 2.5 }, 7.1);
      bt.to(".ghost-label-2",
        { opacity: 0, y: -10, duration: 2 }, 7.3);

      // Ghost trail 3 — appears at ~76% + service label (longer visible)
      bt.fromTo(".bond-ghost-3",
        { opacity: 0 }, { opacity: 0.6, duration: 0.1 }, 7.3);
      bt.fromTo(".ghost-label-3",
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 7.3);
      bt.to(".bond-ghost-3",
        { opacity: 0, duration: 2.5 }, 9.5);
      bt.to(".ghost-label-3",
        { opacity: 0, y: -10, duration: 2 }, 9.7);

      // ── Phase 1b: Circle expands at right edge (9.5→12) ──
      // Grows big enough to go off-screen right
      bt.to(".bond-assembly",
        { scale: 1.8, duration: 2.5, ease: "power2.out" }, 9.5);
      // Rifling fades in as it grows + slow rotation
      bt.to(".bond-rifling",
        { opacity: 1, duration: 1.5 }, 10);
      bt.to(".bond-rifling",
        { rotation: 90, duration: 9.5, ease: "none" }, 10);

      // ── Phase 1b: Once big, moves to center (12→15.5) ──
      bt.to(".bond-assembly",
        { x: 0, y: 0, duration: 3.5, ease: "power2.inOut" }, 12);

      // ── Phase 2: Bond character appears inside barrel ──
      bt.to(".bond-video-wrapper",
        { opacity: 1, duration: 0.8 }, 12);

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

      // Walk cycle loops while circle moves to center (12→15)
      const walkObj = { frame: 0 };
      bt.to(walkObj, {
        frame: WALK_FRAMES * 3 - 1,
        ease: `steps(${WALK_FRAMES * 3 - 1})`,
        duration: 3,
        onUpdate: () => drawFrame(Math.round(walkObj.frame) % WALK_FRAMES),
      }, 12);

      // Turn + aim starts just before circle settles (15→19.5)
      const turnObj = { frame: TURN_START };
      bt.to(turnObj, {
        frame: TOTAL_FRAMES - 1,
        ease: `steps(${TOTAL_FRAMES - 1 - TURN_START})`,
        duration: 4.5,
        onUpdate: () => drawFrame(Math.round(turnObj.frame)),
      }, 15);

      // ── Phase 3: Flash + blood fills barrel opening (19.5→24) ──
      // Muzzle flash — bright burst then quick fade
      bt.fromTo(".bond-flash",
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1.2, duration: 0.15, ease: "power4.out" }, 19.5);
      bt.to(".bond-flash",
        { scale: 0.8, opacity: 0.7, duration: 0.1 }, 19.65);
      bt.to(".bond-flash",
        { scale: 1.5, opacity: 0, duration: 0.3, ease: "power2.out" }, 19.75);

      // ── Phase 4: Blood drips cascade down screen (20→30.5) ──
      // Liquid easing: slow start → fast middle → slow near bottom
      const liquidEase = "slow(0.5, 0.8, false)";
      const liquidEase2 = "slow(0.4, 0.7, false)";

      // Narrow drips fall first — keyframed speed variation (slower)
      bt.to(".blood-drip-1", {
        keyframes: [
          { height: "30%", duration: 0.5, ease: "power2.in" },
          { height: "80%", duration: 0.6, ease: "none" },
          { height: "100%", duration: 0.7, ease: "power3.out" },
          { height: "115%", duration: 0.4, ease: "power1.out" },
        ],
      }, 20);
      bt.to(".blood-drip-2", {
        keyframes: [
          { height: "20%", duration: 0.6, ease: "power1.in" },
          { height: "65%", duration: 0.8, ease: "power2.in" },
          { height: "95%", duration: 0.7, ease: "power1.out" },
          { height: "115%", duration: 0.6, ease: "sine.out" },
        ],
      }, 21);
      bt.to(".blood-drip-3", {
        keyframes: [
          { height: "25%", duration: 0.5, ease: "power2.in" },
          { height: "75%", duration: 0.7, ease: "none" },
          { height: "105%", duration: 0.6, ease: "power2.out" },
          { height: "115%", duration: 0.4, ease: "sine.out" },
        ],
      }, 22);

      // Wider flows — organic liquid speed variation (slower)
      bt.to(".blood-drip-4", { height: "115%", duration: 3.5, ease: liquidEase }, 23);
      bt.to(".blood-drip-5", { height: "115%", duration: 3.2, ease: liquidEase2 }, 23.5);
      bt.to(".blood-drip-6", { height: "115%", duration: 3.5, ease: liquidEase }, 24);
      bt.to(".blood-drip-7", { height: "115%", duration: 3.2, ease: liquidEase2 }, 24.5);

      // Solid fill within group ensures full coverage
      bt.to(".blood-solid", { opacity: 1, duration: 0.8 }, 27.5);

      // Raise group opacity to fully opaque + fade to black
      bt.to(".bond-blood-drips", { opacity: 1, duration: 0.2, ease: "power2.inOut" }, 28.3);
      bt.to(".bond-assembly", { opacity: 0, duration: 0.2 }, 28.3);
      bt.to(".blood-solid", { backgroundColor: "#000000", duration: 0.4, ease: "power2.in" }, 28.5);
      bt.to(".blood-drip", { backgroundColor: "#000000", duration: 0.4, ease: "power2.in" }, 28.5);

      // ═══════════════════════════════════════
      // MANIFESTO — appears inside Bond timeline (end of blood→black)
      // ═══════════════════════════════════════
      // Add manifesto animations to the Bond timeline itself (avoids
      // the issue of a separate ScrollTrigger on an already-pinned element)
      bt.fromTo(".manifesto-overlay", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 27.5);
      bt.fromTo(".manifesto-line-1", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 27.6);
      bt.fromTo(".manifesto-line-2", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 27.9);
      bt.to(".manifesto-divider", { width: "120px", duration: 0.5, ease: "power3.inOut" }, 28.1);
      bt.fromTo(".manifesto-line-3", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 28.2);
      bt.fromTo(".manifesto-line-3",
        { textShadow: "0 0 0px rgba(229,9,20,0)" },
        { textShadow: "0 0 30px rgba(229,9,20,0.5)", duration: 0.5 }, 28.5);

      // Manifesto stays visible through Bond→Services transition
      // (fades out at the start of Services pin — crossfade effect)

      // ═══════════════════════════════════════
      // SERVICES SECTION — Matrix rain + cards
      // All entrance inside pin (section is bg-black, content starts at opacity 0,
      // so scrolling into pin position is invisible — just black on black)
      // ═══════════════════════════════════════

      gsap.set(".services-inner", { opacity: 0 });
      gsap.set(".services-rain", { opacity: 1 }); // rain visible as soon as inner fades in

      const st = gsap.timeline({
        scrollTrigger: {
          trigger: ".services-section",
          start: "top top",
          end: isMobile ? "+=600" : "+=1000",
          scrub: true,
          pin: true,
        },
      });

      // Crossfade: manifesto fades out while services fades in (no black gap)
      st.to(".manifesto-overlay", { opacity: 0, duration: 0.4, ease: "power2.in" }, 0);

      // Fade in container (rain appears, individual elements still at their own opacity 0)
      st.fromTo(".services-inner",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 }, 0);

      // Phase 0: Header + corners entrance
      st.fromTo(".services-header",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" }, 0);
      st.to(".services-divider",
        { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 0.2);
      st.fromTo(".services-corner",
        { opacity: 0 },
        { opacity: 1, stagger: 0.05, duration: 0.4 }, 0.1);

      // Phase 1: Cards animate in (0.8→2.4)
      st.fromTo(".services-grid",
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }, 0.8);

      st.fromTo(".service-card",
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6, stagger: 0.2,
          ease: "power2.out",
        }, 0.9);

      st.fromTo(".service-card",
        { boxShadow: "0 0 0px rgba(0,255,65,0)" },
        {
          boxShadow: "0 0 20px rgba(0,255,65,0.3)",
          duration: 0.4, stagger: 0.2,
          ease: "power2.out",
        }, 0.9);

      st.to(".service-card", {
        boxShadow: "0 0 8px rgba(0,255,65,0.08)",
        duration: 0.6, stagger: 0.1,
        ease: "power2.out",
      }, 2.4);

      // CTA appears after cards
      st.fromTo(".services-cta",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 2.6);

      // Phase 2: Fade to black at end of services pin
      st.to(".services-inner", {
        opacity: 0, duration: 1.2,
      }, 3.5);

      // ═══════════════════════════════════════
      // PROCESS SECTION — handled by ProcessVersionA/B/C component
      // ═══════════════════════════════════════

      // ═══════════════════════════════════════
      // PORTFOLIO SECTION — Tron
      // All entrance inside pin (bg-black + opacity 0 = no visible scroll)
      // ═══════════════════════════════════════

      gsap.set(".portfolio-inner", { opacity: 0 });
      gsap.set(".portfolio-glow", { opacity: 1, scale: 1.1 });

      const pt2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".portfolio-section",
          start: "top top",
          end: isMobile ? "+=500" : "+=800",
          scrub: true,
          pin: true,
        },
      });

      // Fade in container (Tron grid/bikes appear, elements still at their own opacity 0)
      pt2.fromTo(".portfolio-inner",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 }, 0);

      // Phase 0: Header + corners entrance
      pt2.fromTo(".portfolio-header",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0);
      pt2.to(".portfolio-divider",
        { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 0.2);
      pt2.fromTo(".portfolio-corner",
        { opacity: 0 },
        { opacity: 1, stagger: 0.05, duration: 0.4 }, 0.1);

      // Phase 1: Cards stagger in (0.8→2.0)
      pt2.fromTo(".portfolio-card",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: "power2.out" }, 0.8);

      // CTA fade in
      pt2.fromTo(".portfolio-cta",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 1.6);

      // Phase 2: Fade to black
      pt2.to(".portfolio-inner", {
        opacity: 0, duration: 1.2,
      }, 2.8);

      // ═══════════════════════════════════════
      // TEAM SECTION — Blade Runner / Tyrell Corp
      // (all entrance animations inside pin to avoid visible scroll-in)
      // ═══════════════════════════════════════

      gsap.set(".team-inner", { opacity: 0 });

      const tt = gsap.timeline({
        scrollTrigger: {
          trigger: ".team-section",
          start: "top top",
          end: isMobile ? "+=1000" : "+=1500",
          scrub: true,
          pin: true,
        },
      });

      // Fade in container (bg-black + content, matches services/portfolio pattern)
      tt.fromTo(".team-inner",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 }, 0);

      // Phase 0: Header + corners entrance from black (0→0.8)
      tt.fromTo(".team-header",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" }, 0);
      tt.to(".team-divider",
        { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 0.2);
      tt.fromTo(".team-corner",
        { opacity: 0 },
        { opacity: 1, stagger: 0.05, duration: 0.4 }, 0.1);

      // Phase 1: Dossier content (0.8→)
      // Dossier folder slides up and opens
      tt.fromTo(".team-dossier",
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.8);

      // Photo "pins" itself — slides in from the left with a slight rotation
      tt.fromTo(".team-photo-wrapper",
        { opacity: 0, x: isMobile ? -30 : -60, rotation: -8 },
        { opacity: 1, x: 0, rotation: isMobile ? -1.5 : -2.5, duration: 0.6, ease: "back.out(1.2)" }, 1.1);

      // Pushpin drops in
      tt.fromTo(".team-pushpin",
        { opacity: 0, y: -20, scale: 0.5 },
        { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "bounce.out" }, 1.5);

      // Scan sweep over photo
      tt.fromTo(".team-photo-scan",
        { y: "-100%" },
        { y: "100%", duration: 0.6, ease: "power2.inOut" }, 1.3);

      // Photo image reveals
      tt.fromTo(".team-photo-img",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 }, 1.5);

      // Case file header types in
      tt.fromTo(".team-case-header",
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 1.4);

      // Data entries appear one by one (typewriter style)
      tt.fromTo(".team-data-line",
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.25, ease: "power2.out" }, 1.7);

      // CLASSIFIED stamp slams down with rotation
      tt.fromTo(".team-classified",
        { opacity: 0, scale: 2.5, rotation: -25 },
        { opacity: 1, scale: 1, rotation: -12, duration: 0.2, ease: "power4.in" }, 2.4);

      // Notes / bio section fades in
      tt.fromTo(".team-notes",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 2.6);

      // External links fade in
      tt.fromTo(".team-social-link",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.3 }, 2.8);

      // String/connector line draws
      tt.fromTo(".team-connector",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.4, ease: "power2.inOut" }, 2.2);

      // Quote appears like a handwritten annotation
      tt.fromTo(".team-quote",
        { opacity: 0, rotation: 1, y: 10 },
        { opacity: 1, rotation: -1, y: 0, duration: 0.5, ease: "power2.out" }, 3.1);

      // Fade to black at end of team pin
      tt.to(".team-inner", {
        opacity: 0, duration: 1.2,
      }, 4.0);

      // ═══════════════════════════════════════
      // HAL 9000 SECTION — CRT power-on inside pin
      // (all animations inside pin to avoid visible scroll-in)
      // ═══════════════════════════════════════

      // Keep content hidden initially — the power-on will reveal it
      gsap.set(".hal-inner", { opacity: 0 });
      gsap.set(".hal-content", { opacity: 0 });
      gsap.set(".hal-corner", { opacity: 0 });

      // Align CRT line + glow with the HAL eye center (not screen center)
      const halInner = document.querySelector(".hal-inner") as HTMLElement;
      const halEye = document.querySelector(".hal-container") as HTMLElement;
      if (halInner && halEye) {
        const innerRect = halInner.getBoundingClientRect();
        const eyeRect = halEye.getBoundingClientRect();
        const eyeCenterY = eyeRect.top + eyeRect.height / 2 - innerRect.top;
        gsap.set(".hal-crt-line", { top: eyeCenterY });
        gsap.set(".hal-power-glow", { top: eyeCenterY, yPercent: -50 });
      }

      const ht = gsap.timeline({
        scrollTrigger: {
          trigger: ".hal-section",
          start: "top top",
          end: isMobile ? "+=700" : "+=1200",
          scrub: true,
          pin: true,
        },
      });

      // Fade in container (black overlay inside = still looks black, no visible scroll-in)
      ht.fromTo(".hal-inner",
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }, 0);

      // Phase 0: CRT power-on sequence (0→1.5)
      ht.fromTo(".hal-power-overlay",
        { opacity: 1 },
        { opacity: 1, duration: 0.3 }, 0);
      ht.fromTo(".hal-crt-line",
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.2, ease: "power2.out" }, 0.05);

      ht.to(".hal-crt-line",
        { scaleY: 80, opacity: 0.6, duration: 0.3, ease: "power2.in" }, 0.3);

      ht.to(".hal-power-flash",
        { opacity: 0.15, duration: 0.08 }, 0.5);
      ht.to(".hal-power-flash",
        { opacity: 0, duration: 0.12 }, 0.58);
      ht.to(".hal-power-overlay",
        { opacity: 0, duration: 0.4, ease: "power2.out" }, 0.55);
      ht.to(".hal-crt-line",
        { opacity: 0, duration: 0.2 }, 0.6);

      ht.fromTo(".hal-content",
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.55);

      ht.fromTo(".hal-power-glow",
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, 0.5);

      ht.fromTo(".hal-corner",
        { opacity: 0 },
        { opacity: 1, stagger: 0.05, duration: 0.3 }, 0.7);

      // Phase 1: Quote appears after power-on (1.5→)
      ht.fromTo(".hal-quote",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 1.5);

      // Fade to black at end of HAL pin
      ht.to(".hal-inner", {
        opacity: 0, duration: 1.0,
      }, 2.5);

      // ═══════════════════════════════════════
      // FOOTER — Lava / Molten Steel Animations
      // ═══════════════════════════════════════

      // Lava gradient flow — continuous loop (layer 1: base)
      gsap.to(".footer-lava-layer1", {
        backgroundPosition: "200% 0%",
        duration: 8,
        repeat: -1,
        ease: "none",
      });

      // Lava gradient flow — layer 2 (bright patches, slower & opposite)
      gsap.to(".footer-lava-layer2", {
        backgroundPosition: "-200% 0%",
        duration: 12,
        repeat: -1,
        ease: "none",
      });

      // Lava gradient flow — layer 3 (surface highlights, medium speed)
      gsap.to(".footer-lava-layer3", {
        backgroundPosition: "200% 0%",
        duration: 10,
        repeat: -1,
        ease: "none",
      });

      // Dark patches drift
      gsap.to(".footer-lava-dark", {
        backgroundPosition: "-150% 0%",
        duration: 14,
        repeat: -1,
        ease: "none",
      });

      // Heat line shimmer
      gsap.to(".footer-heat-line", {
        opacity: 0.6,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Heat shimmer above lava — subtle pulsing glow
      gsap.to(".footer-heat-shimmer", {
        opacity: 0.7,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Lava bubble animations — each bubble rises and pops
      [0,1,2,3,4,5].forEach((i) => {
        const delay = i * 1.8 + Math.random() * 2;
        const duration = 1.2 + Math.random() * 0.8;
        gsap.to(`.footer-lava-bubble-${i}`, {
          y: -(30 + Math.random() * 40),
          opacity: 0.9,
          scale: 1.3,
          duration: duration * 0.6,
          repeat: -1,
          repeatDelay: 2 + Math.random() * 3,
          delay: delay,
          ease: "power1.out",
          onRepeat: function() {
            gsap.set(`.footer-lava-bubble-${i}`, {
              left: `${10 + Math.random() * 80}%`,
            });
          },
        });
        // Pop (fade out) after rising
        gsap.to(`.footer-lava-bubble-${i}`, {
          opacity: 0,
          scale: 2,
          duration: duration * 0.4,
          repeat: -1,
          repeatDelay: 2 + Math.random() * 3,
          delay: delay + duration * 0.6,
          ease: "power2.out",
        });
      });

      // T-800 Arm — rises from lava on scroll into view
      gsap.fromTo(".footer-t800-arm",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".footer-section",
            start: "top 85%",
            end: "top 50%",
            scrub: true,
          },
        });

      // ═══════════════════════════════════════
      // TRANSITION SCANLINES — red sweep between sections
      // ═══════════════════════════════════════
      [".services-section", ".process-section", ".portfolio-section", ".team-section", ".hal-section"].forEach((trigger) => {
        ScrollTrigger.create({
          trigger,
          start: "top 95%",
          onEnter: () => {
            gsap.killTweensOf(".transition-scan");
            gsap.fromTo(".transition-scan",
              { top: "-2px", opacity: 1 },
              { top: "100vh", opacity: 0.6, duration: 0.35, ease: "power2.in",
                onComplete: () => { gsap.set(".transition-scan", { opacity: 0, top: "-2px" }); },
              });
          },
        });
      });

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

      // ═══════════════════════════════════════
      // FINAL FADE TO BLACK — quick blackout at the end
      // ═══════════════════════════════════════
      gsap.to(".final-blackout", {
        opacity: 1,
        ease: "power2.in",
        scrollTrigger: {
          trigger: ".final-fade-spacer",
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Recalculate all ScrollTrigger positions after all components mount
      const refreshTimer = setTimeout(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }, 150);

      return () => clearTimeout(refreshTimer);

    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className="relative overflow-hidden bg-black">

      {/* ════════════════════════════════════════════
          NAVBAR (fixed, initially invisible)
          ════════════════════════════════════════════ */}
      <Navbar />

      {/* ════════════════════════════════════════════
          FLYING LOGO (fixed, morphs from hero → navbar)
          ════════════════════════════════════════════ */}
      <div
        className="flying-logo fixed z-[991] opacity-0"
        style={{ width: "220px" }}
      >
        <Image
          src="/logo-t800labs.png"
          alt="T800 Labs"
          width={300}
          height={164}
          priority
          className="flying-logo-img h-auto w-full drop-shadow-[0_0_40px_rgba(229,9,20,0.25)]"
        />
      </div>

      {/* ════════════════════════════════════════════
          FLYING TITLE (fixed, morphs from hero → navbar)
          ════════════════════════════════════════════ */}
      <div className="flying-title fixed z-[991] flex items-baseline overflow-hidden whitespace-nowrap opacity-0">
        <span className="flying-t800 font-bold tracking-[-0.04em] text-white opacity-0">T800</span>
        <span className="flying-labs font-bold tracking-[-0.04em] text-[#e50914] opacity-0">Labs</span>
      </div>

      {/* ════════════════════════════════════════════
          PERSISTENT SCROLL INDICATOR (fixed)
          ════════════════════════════════════════════ */}
      <div className="scroll-persistent pointer-events-none fixed bottom-0 left-0 right-0 z-[999] opacity-0">
        {/* Bottom center — arrow + label */}
        <div className="flex flex-col items-center gap-1 pb-5">
          <span className="font-mono text-[9px] tracking-[0.25em] text-red-500/60 uppercase">{t("ScrollIndicator.scroll")}</span>
          <svg className="scroll-persistent-arrow h-4 w-4 text-red-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
            <span className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.3em] text-red-500/50">SYS.01</span>
          </div>
          <div className="hero-corner absolute right-6 top-6 opacity-0">
            <div className="ml-auto h-8 w-[1px] bg-gradient-to-b from-red-500/40 to-transparent" />
            <div className="absolute right-0 top-0 h-[1px] w-8 bg-gradient-to-l from-red-500/40 to-transparent" />
            <span className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.3em] text-red-500/50">v0.8</span>
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
            {/* Spacer where logo used to be (logo is now .flying-logo fixed element) */}
            <div className="hero-logo-spacer mb-8 h-[120px] w-[220px] md:h-[164px] md:w-[300px]" aria-hidden="true" />
            <div className="hero-title-spacer h-[48px] w-[280px] md:h-[72px] md:w-[420px]" aria-hidden="true" />
            <div className="hero-divider mt-5 h-[1px] w-24 origin-center scale-x-0 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            <p className="hero-tagline mt-6 text-center font-mono text-sm tracking-[0.2em] text-white/50 uppercase opacity-0 md:text-base">{t("Hero.tagline")}</p>
            <p className="hero-value-prop mt-4 text-center text-sm tracking-wide text-white/35 opacity-0 md:text-base">{t("Hero.valueProposition")}</p>
            <a
              href="#contacto"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#contacto");
                if (el) {
                  gsap.to(window, { scrollTo: { y: el, offsetY: 80 }, duration: 1.2, ease: "power3.inOut" });
                }
              }}
              className="hero-cta mt-6 border border-red-500/60 bg-transparent px-8 py-3 font-mono text-[10px] tracking-[0.2em] text-red-500 uppercase opacity-0 transition-all duration-300 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 md:text-xs"
            >
              {t("Hero.cta")}
            </a>
            <div className="hero-scroll-indicator mt-10 flex flex-col items-center gap-3 opacity-0">
              <span className="font-mono text-xs tracking-[0.3em] text-red-500/50 uppercase">{t("Hero.scroll")}</span>
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
      <section className="bond-section relative z-[1] h-screen overflow-hidden bg-black">
        {/* Pre-entrance glow — visible during scroll-in before pin */}

        {/* ── Ghost trail circles with service labels ── */}
        <div className="bond-ghost-1 absolute left-1/2 top-1/2 flex flex-col items-center opacity-0" style={{ width: "6vh", height: "6vh" }}>
          <div className="h-full w-full rounded-full bg-white" />
          <span className="ghost-label-1 mt-3 whitespace-nowrap font-mono text-xs tracking-[0.2em] text-white/80 uppercase opacity-0">{t("Bond.webApps")}</span>
        </div>
        <div className="bond-ghost-2 absolute left-1/2 top-1/2 flex flex-col items-center opacity-0" style={{ width: "6vh", height: "6vh" }}>
          <div className="h-full w-full rounded-full bg-white" />
          <span className="ghost-label-2 mt-3 whitespace-nowrap font-mono text-xs tracking-[0.2em] text-white/80 uppercase opacity-0">{t("Bond.aiIntegrations")}</span>
        </div>
        <div className="bond-ghost-3 absolute left-1/2 top-1/2 flex flex-col items-center opacity-0" style={{ width: "6vh", height: "6vh" }}>
          <div className="h-full w-full rounded-full bg-white" />
          <span className="ghost-label-3 mt-3 whitespace-nowrap font-mono text-xs tracking-[0.2em] text-white/80 uppercase opacity-0">{t("Bond.customSoftware")}</span>
        </div>

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

      {/* ════════════════════════════════════════════
          MANIFESTO — Fixed overlay (appears during Bond→Services transition)
          ════════════════════════════════════════════ */}
      <div className="manifesto-overlay pointer-events-none fixed inset-0 z-[8] flex items-center justify-center" style={{ opacity: 0 }}>
        {/* Green tint crossfade — subtly bridges manifesto to services */}
        <div className="manifesto-green-tint pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,255,65,0.06)_0%,_rgba(0,255,65,0.02)_40%,_transparent_70%)] opacity-0" />
        <div className="flex flex-col items-center gap-4 text-center px-6 md:gap-6">
          <p className="manifesto-line-1 font-bold text-2xl tracking-[0.08em] text-[#ededed] opacity-0 md:text-4xl lg:text-5xl">
            {t("Manifesto.line1")}
          </p>
          <p className="manifesto-line-2 font-bold text-2xl tracking-[0.08em] text-[#ededed] opacity-0 md:text-4xl lg:text-5xl">
            {t("Manifesto.line2")}
          </p>
          <div className="manifesto-divider h-[1px] w-0 bg-gradient-to-r from-transparent via-[#e50914] to-transparent" />
          <p className="manifesto-line-3 font-bold text-2xl tracking-[0.08em] text-[#e50914] opacity-0 md:text-4xl lg:text-5xl">
            {t("Manifesto.line3")}
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          SERVICES SECTION — Matrix Rain
          ════════════════════════════════════════════ */}
      <section id="servicios" className="services-section relative z-[3] h-[10vh] overflow-visible">
        <div className="services-inner absolute inset-x-0 top-0 h-screen bg-black">
        {/* Matrix rain canvas background */}
        <div className="services-rain absolute inset-0 opacity-0">
          <MatrixRain />
        </div>

        {/* Dark overlay to make text readable */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 md:px-10">
          {/* Section title */}
          <div className="services-header mb-10 flex flex-col items-center gap-3 opacity-0 md:mb-14">
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#00ff41]/60 uppercase">
              {t("Services.subtitle")}
            </span>
            <h2 className="services-title font-bold text-3xl tracking-[0.15em] text-[#00ff41] md:text-5xl">
              {t("Services.title")}
            </h2>
            <div className="services-divider h-[1px] w-16 origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#00ff41]/50 to-transparent" />
          </div>

          {/* Services grid — 2 cols mobile, 3 cols tablet, 5 cols desktop */}
          <div className="services-grid grid w-full max-w-6xl grid-cols-2 gap-2.5 opacity-0 md:grid-cols-3 md:gap-4 lg:grid-cols-5 lg:gap-5">
            {/* Card 1: Web Development */}
            <div className="service-card group flex flex-col gap-1.5 rounded border border-[#00ff41]/20 bg-black/60 p-3 backdrop-blur-sm transition-all duration-500 hover:border-[#00ff41]/50 hover:bg-black/80 md:gap-3 md:p-5 lg:p-6">
              <span className="font-mono text-lg text-[#00ff41]/70 transition-colors duration-300 group-hover:text-[#00ff41] md:text-2xl lg:text-3xl">
                {t("Services.webDevIcon")}
              </span>
              <h3 className="font-mono text-[11px] font-bold tracking-[0.08em] text-white uppercase md:text-sm lg:text-base">
                {t("Services.webDev")}
              </h3>
              <p className="hidden font-mono text-[10px] leading-relaxed text-white/50 sm:block md:text-xs">
                {t("Services.webDevDesc")}
              </p>
            </div>

            {/* Card 2: AI & Automation */}
            <div className="service-card group flex flex-col gap-1.5 rounded border border-[#00ff41]/20 bg-black/60 p-3 backdrop-blur-sm transition-all duration-500 hover:border-[#00ff41]/50 hover:bg-black/80 md:gap-3 md:p-5 lg:p-6">
              <span className="font-mono text-lg text-[#00ff41]/70 transition-colors duration-300 group-hover:text-[#00ff41] md:text-2xl lg:text-3xl">
                {t("Services.aiIcon")}
              </span>
              <h3 className="font-mono text-[11px] font-bold tracking-[0.08em] text-white uppercase md:text-sm lg:text-base">
                {t("Services.ai")}
              </h3>
              <p className="hidden font-mono text-[10px] leading-relaxed text-white/50 sm:block md:text-xs">
                {t("Services.aiDesc")}
              </p>
            </div>

            {/* Card 3: Mobile Apps */}
            <div className="service-card group flex flex-col gap-1.5 rounded border border-[#00ff41]/20 bg-black/60 p-3 backdrop-blur-sm transition-all duration-500 hover:border-[#00ff41]/50 hover:bg-black/80 md:gap-3 md:p-5 lg:p-6">
              <span className="font-mono text-lg text-[#00ff41]/70 transition-colors duration-300 group-hover:text-[#00ff41] md:text-2xl lg:text-3xl">
                {t("Services.mobileIcon")}
              </span>
              <h3 className="font-mono text-[11px] font-bold tracking-[0.08em] text-white uppercase md:text-sm lg:text-base">
                {t("Services.mobile")}
              </h3>
              <p className="hidden font-mono text-[10px] leading-relaxed text-white/50 sm:block md:text-xs">
                {t("Services.mobileDesc")}
              </p>
            </div>

            {/* Card 4: Cloud & DevOps */}
            <div className="service-card group flex flex-col gap-1.5 rounded border border-[#00ff41]/20 bg-black/60 p-3 backdrop-blur-sm transition-all duration-500 hover:border-[#00ff41]/50 hover:bg-black/80 md:gap-3 md:p-5 lg:p-6">
              <span className="font-mono text-lg text-[#00ff41]/70 transition-colors duration-300 group-hover:text-[#00ff41] md:text-2xl lg:text-3xl">
                {t("Services.cloudIcon")}
              </span>
              <h3 className="font-mono text-[11px] font-bold tracking-[0.08em] text-white uppercase md:text-sm lg:text-base">
                {t("Services.cloud")}
              </h3>
              <p className="hidden font-mono text-[10px] leading-relaxed text-white/50 sm:block md:text-xs">
                {t("Services.cloudDesc")}
              </p>
            </div>

            {/* Card 5: Custom Software — centered on mobile (last in 2-col grid) */}
            <div className="service-card group col-span-2 flex flex-col gap-1.5 rounded border border-[#00ff41]/20 bg-black/60 p-3 backdrop-blur-sm transition-all duration-500 hover:border-[#00ff41]/50 hover:bg-black/80 md:col-span-1 md:gap-3 md:p-5 lg:p-6">
              <span className="font-mono text-lg text-[#00ff41]/70 transition-colors duration-300 group-hover:text-[#00ff41] md:text-2xl lg:text-3xl">
                {t("Services.customIcon")}
              </span>
              <h3 className="font-mono text-[11px] font-bold tracking-[0.08em] text-white uppercase md:text-sm lg:text-base">
                {t("Services.custom")}
              </h3>
              <p className="hidden font-mono text-[10px] leading-relaxed text-white/50 sm:block md:text-xs">
                {t("Services.customDesc")}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="services-cta mt-8 flex justify-center opacity-0 md:mt-12">
            <a
              href="#contacto"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#contacto");
                if (el) {
                  gsap.to(window, { scrollTo: { y: el, offsetY: 80 }, duration: 1.2, ease: "power3.inOut" });
                }
              }}
              className="border border-[#00ff41]/40 bg-transparent px-8 py-3 font-mono text-[10px] tracking-[0.2em] text-[#00ff41] uppercase transition-all duration-300 hover:border-[#00ff41]/80 hover:bg-[#00ff41]/10 md:text-xs"
            >
              {t("Services.cta")}
            </a>
          </div>
        </div>

        {/* Corner decorations */}
        <div className="services-corner absolute left-6 top-6 opacity-0">
          <div className="h-8 w-[1px] bg-gradient-to-b from-[#00ff41]/40 to-transparent" />
          <div className="absolute top-0 h-[1px] w-8 bg-gradient-to-r from-[#00ff41]/40 to-transparent" />
          <span className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.3em] text-[#00ff41]/50">SYS.03</span>
        </div>
        <div className="services-corner absolute right-6 top-6 opacity-0">
          <div className="ml-auto h-8 w-[1px] bg-gradient-to-b from-[#00ff41]/40 to-transparent" />
          <div className="absolute right-0 top-0 h-[1px] w-8 bg-gradient-to-l from-[#00ff41]/40 to-transparent" />
          <span className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.3em] text-[#00ff41]/50">MATRIX</span>
        </div>
        <div className="services-corner absolute bottom-6 left-6 opacity-0">
          <div className="h-8 w-[1px] bg-gradient-to-t from-[#00ff41]/40 to-transparent" />
          <div className="absolute bottom-0 h-[1px] w-8 bg-gradient-to-r from-[#00ff41]/40 to-transparent" />
        </div>
        <div className="services-corner absolute bottom-6 right-6 opacity-0">
          <div className="ml-auto h-8 w-[1px] bg-gradient-to-t from-[#00ff41]/40 to-transparent" />
          <div className="absolute bottom-0 right-0 h-[1px] w-8 bg-gradient-to-l from-[#00ff41]/40 to-transparent" />
        </div>
        </div>{/* /services-inner */}
      </section>

      {/* ════════════════════════════════════════════
          PROCESS SECTION — Tesseract Bookshelf
          ════════════════════════════════════════════ */}
      <ProcessTesseract />

      {/* ════════════════════════════════════════════
          PORTFOLIO SECTION — Tron
          ════════════════════════════════════════════ */}
      <section id="portfolio" className="portfolio-section relative z-[5] h-[10vh] overflow-visible">
        <div className="portfolio-inner absolute inset-x-0 top-0 h-screen bg-black">
        {/* Tron grid background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Perspective grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />
          {/* Perspective floor grid */}
          <div className="absolute bottom-0 left-0 right-0 h-[40%]" style={{
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            transform: 'perspective(400px) rotateX(45deg)',
            transformOrigin: 'bottom center',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
          }} />
          {/* Ambient cyan glow */}
          <div className="portfolio-glow absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.04) 40%, transparent 70%)' }}
          />
          {/* Tron light cycle bikes */}
          <TronBikes />
        </div>

        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-4 md:px-10">
          {/* Section header */}
          <div className="portfolio-header mb-12 flex flex-col items-center gap-2 opacity-0 md:mb-16 md:gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#00d4ff]/60 uppercase">
              {t("Portfolio.subtitle")}
            </span>
            <h2 className="font-bold text-2xl tracking-[0.15em] text-[#00d4ff] md:text-5xl">
              {t("Portfolio.title")}
            </h2>
            <div className="portfolio-divider h-[1px] w-16 origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#00d4ff]/50 to-transparent" />
          </div>

          {/* Project cards grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {/* Project 1: NoEsGratis */}
            <a
              href="https://noesgratis.es"
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-card group relative overflow-hidden rounded border border-[#00d4ff]/20 bg-[#0a1628]/80 p-6 opacity-0 backdrop-blur-sm transition-colors duration-500 hover:border-[#00d4ff]/60 md:p-8"
              style={{ boxShadow: '0 0 15px rgba(0,212,255,0.08)' }}
            >
              {/* Card scan line */}
              <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,212,255,0.015)_3px,rgba(0,212,255,0.015)_6px)]" />
              {/* Top accent line */}
              <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/40 to-transparent" />

              <div className="relative z-10">
                <span className="inline-block rounded border border-[#00d4ff]/30 px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] text-[#00d4ff]/70 uppercase">
                  {t("Portfolio.project1Type")}
                </span>
                <h3 className="mt-3 text-lg font-bold tracking-[0.05em] text-[#00d4ff] md:text-xl">
                  {t("Portfolio.project1Name")}
                </h3>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/50 md:text-xs">
                  {t("Portfolio.project1Desc")}
                </p>
                {/* Tech tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {t("Portfolio.project1Tech").split(" · ").map((tech: string) => (
                    <span key={tech} className="rounded bg-[#00d4ff]/8 px-2 py-0.5 font-mono text-[9px] text-[#00d4ff]/60">
                      {tech}
                    </span>
                  ))}
                </div>
                {/* Visit link */}
                <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-[#00d4ff]/60 uppercase transition-colors duration-300 group-hover:text-[#00d4ff] md:text-[11px]">
                  {t("Portfolio.visitSite")}
                </span>
              </div>
            </a>

            {/* Project 2: The Rehab Studio */}
            <a
              href="https://therehabstudio.es"
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-card group relative overflow-hidden rounded border border-[#00d4ff]/20 bg-[#0a1628]/80 p-6 opacity-0 backdrop-blur-sm transition-colors duration-500 hover:border-[#00d4ff]/60 md:p-8"
              style={{ boxShadow: '0 0 15px rgba(0,212,255,0.08)' }}
            >
              {/* Card scan line */}
              <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_3px,rgba(0,212,255,0.015)_3px,rgba(0,212,255,0.015)_6px)]" />
              {/* Top accent line */}
              <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff]/40 to-transparent" />

              <div className="relative z-10">
                <span className="inline-block rounded border border-[#00d4ff]/30 px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] text-[#00d4ff]/70 uppercase">
                  {t("Portfolio.project2Type")}
                </span>
                <h3 className="mt-3 text-lg font-bold tracking-[0.05em] text-[#00d4ff] md:text-xl">
                  {t("Portfolio.project2Name")}
                </h3>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-white/50 md:text-xs">
                  {t("Portfolio.project2Desc")}
                </p>
                {/* Tech tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {t("Portfolio.project2Tech").split(" · ").map((tech: string) => (
                    <span key={tech} className="rounded bg-[#00d4ff]/8 px-2 py-0.5 font-mono text-[9px] text-[#00d4ff]/60">
                      {tech}
                    </span>
                  ))}
                </div>
                {/* Visit link */}
                <span className="mt-5 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.15em] text-[#00d4ff]/60 uppercase transition-colors duration-300 group-hover:text-[#00d4ff] md:text-[11px]">
                  {t("Portfolio.visitSite")}
                </span>
              </div>
            </a>
          </div>

          {/* CTA */}
          <div className="portfolio-cta mt-12 flex flex-col items-center gap-3 opacity-0 md:mt-16">
            <h3 className="text-center font-bold text-sm tracking-[0.1em] text-[#00d4ff]/80 md:text-lg">
              {t("Portfolio.cta")}
            </h3>
            <a
              href="#contacto"
              onClick={(e) => {
                e.preventDefault();
                const el = document.querySelector("#contacto");
                if (el) {
                  gsap.to(window, { scrollTo: { y: el, offsetY: 80 }, duration: 1.2, ease: "power3.inOut" });
                }
              }}
              className="portfolio-cta-btn mt-2 inline-block rounded border border-[#00d4ff]/40 px-6 py-2.5 font-mono text-[10px] tracking-[0.2em] text-[#00d4ff] uppercase transition-all duration-500 hover:border-[#00d4ff] hover:bg-[#00d4ff]/10 md:text-xs"
              style={{ boxShadow: '0 0 20px rgba(0,212,255,0.1)' }}
            >
              {t("Hero.cta")}
            </a>
          </div>
        </div>

        {/* Corner decorations — cyan */}
        <div className="portfolio-corner absolute left-6 top-6 opacity-0">
          <div className="h-8 w-[1px] bg-gradient-to-b from-[#00d4ff]/40 to-transparent" />
          <div className="absolute top-0 h-[1px] w-8 bg-gradient-to-r from-[#00d4ff]/40 to-transparent" />
          <span className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.3em] text-[#00d4ff]/50">{t("Portfolio.cornerSys")}</span>
        </div>
        <div className="portfolio-corner absolute right-6 top-6 opacity-0">
          <div className="ml-auto h-8 w-[1px] bg-gradient-to-b from-[#00d4ff]/40 to-transparent" />
          <div className="absolute right-0 top-0 h-[1px] w-8 bg-gradient-to-l from-[#00d4ff]/40 to-transparent" />
          <span className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.3em] text-[#00d4ff]/50">{t("Portfolio.cornerLabel")}</span>
        </div>
        <div className="portfolio-corner absolute bottom-6 left-6 opacity-0">
          <div className="h-8 w-[1px] bg-gradient-to-t from-[#00d4ff]/40 to-transparent" />
          <div className="absolute bottom-0 h-[1px] w-8 bg-gradient-to-r from-[#00d4ff]/40 to-transparent" />
        </div>
        <div className="portfolio-corner absolute bottom-6 right-6 opacity-0">
          <div className="ml-auto h-8 w-[1px] bg-gradient-to-t from-[#00d4ff]/40 to-transparent" />
          <div className="absolute bottom-0 right-0 h-[1px] w-8 bg-gradient-to-l from-[#00d4ff]/40 to-transparent" />
        </div>
      </div>{/* /portfolio-inner */}
      </section>

      {/* ════════════════════════════════════════════
          TEAM SECTION — Detective Case File / Tyrell Corp Dossier
          ════════════════════════════════════════════ */}
      <section id="equipo" className="team-section relative z-[6] h-[10vh] overflow-visible">
        <div className="team-inner absolute inset-x-0 top-0 h-screen bg-black">
        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-3 md:px-10">
          {/* Section header */}
          <div className="team-header mb-3 flex flex-col items-center gap-2 opacity-0 md:mb-8 md:gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#F2A900]/60 uppercase">
              {t("Team.subtitle")}
            </span>
            <h2 className="font-bold text-2xl tracking-[0.15em] text-[#F2A900] md:text-5xl">
              {t("Team.title")}
            </h2>
            <div className="team-divider h-[1px] w-16 origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#F2A900]/50 to-transparent" />
          </div>

          {/* Detective dossier — case file card */}
          <div className="team-dossier relative w-full max-w-4xl opacity-0">
            {/* Cork board / manila folder background */}
            <div className="relative rounded-sm border border-[#F2A900]/15 bg-gradient-to-br from-[#1a1408]/90 via-[#0d0a04]/95 to-[#1a1408]/90 p-4 shadow-[inset_0_0_60px_rgba(242,169,0,0.03)] md:p-8">
              {/* Paper texture overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-sm opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />

              {/* Folder tab at top */}
              <div className="absolute -top-3 left-6 rounded-t border border-b-0 border-[#F2A900]/20 bg-[#1a1408] px-4 py-1 md:left-10">
                <span className="font-mono text-[8px] tracking-[0.3em] text-[#F2A900]/50 uppercase md:text-[10px]">{t("Team.caseFile")}: NEXUS-7</span>
              </div>

              {/* CLASSIFIED stamp */}
              <div className="team-classified pointer-events-none absolute right-4 top-4 z-20 opacity-0 md:right-8 md:top-6">
                <span className="block border-2 border-[#e50914]/40 px-3 py-1 font-mono text-sm font-bold tracking-[0.3em] text-[#e50914]/35 uppercase md:px-4 md:py-1.5 md:text-lg" style={{ transform: "rotate(-12deg)" }}>
                  {t("Team.classified")}
                </span>
              </div>

              {/* Main content */}
              <div className="mt-2 flex flex-col gap-4 md:mt-4 md:flex-row md:gap-8">

                {/* LEFT: Photo "pinned" to the board */}
                <div className="team-photo-wrapper relative mx-auto flex-shrink-0 opacity-0 md:mx-0" style={{ width: "clamp(140px, 30vw, 240px)" }}>
                  <div className="absolute -inset-2 rounded-sm bg-[#d4c9a8]/[0.06] shadow-[2px_3px_12px_rgba(0,0,0,0.6)] md:-inset-3" />
                  {/* Pushpin */}
                  <div className="team-pushpin absolute -top-2 left-1/2 z-30 -translate-x-1/2 opacity-0 md:-top-3">
                    <div className="relative">
                      <div className="h-3 w-3 rounded-full bg-[#e50914] shadow-[0_0_8px_rgba(229,9,20,0.5),0_2px_4px_rgba(0,0,0,0.8)] md:h-4 md:w-4" />
                      <div className="absolute left-1/2 top-full h-1 w-1 -translate-x-1/2 rounded-full bg-black/40" />
                    </div>
                  </div>
                  {/* Photo */}
                  <div className="relative overflow-hidden rounded-sm">
                    <img
                      src="/ruben-jarne.jpg"
                      alt="Rubén Jarné Cabañero"
                      className="team-photo-img relative z-10 h-auto w-full object-cover opacity-0"
                      style={{ aspectRatio: "3/4" }}
                    />
                    <div className="pointer-events-none absolute inset-0 z-20 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)]" />
                    <div className="pointer-events-none absolute inset-0 z-20 bg-[#F2A900]/[0.06] mix-blend-overlay" />
                    <div className="team-photo-scan pointer-events-none absolute left-0 right-0 z-20 h-1 bg-[#F2A900]/60 shadow-[0_0_20px_4px_rgba(242,169,0,0.4)]" style={{ top: 0 }} />
                  </div>
                  <div className="pointer-events-none absolute -bottom-1 -right-1 z-20 h-5 w-8 bg-[#F2A900]/[0.04] md:-bottom-1.5 md:-right-1.5 md:h-6 md:w-10" style={{ transform: "rotate(25deg)" }} />
                </div>

                {/* RIGHT: Case file data */}
                <div className="flex flex-1 flex-col font-mono">
                  <div className="team-case-header mb-3 border-b border-[#F2A900]/20 pb-2 opacity-0 md:mb-4 md:pb-3">
                    <span className="text-[8px] tracking-[0.2em] text-[#F2A900]/35 md:text-[10px]">{t("Team.model")}</span>
                    <h3 className="mt-0.5 text-sm font-bold tracking-[0.08em] text-[#F2A900] md:mt-1 md:text-xl">RUBÉN JARNÉ CABAÑERO</h3>
                    <div className="team-connector mt-2 hidden h-[1px] origin-left scale-x-0 bg-gradient-to-r from-[#F2A900]/30 to-transparent md:block" />
                  </div>

                  <div className="space-y-1.5 text-[10px] md:space-y-2 md:text-xs">
                    <div className="team-data-line flex gap-1 opacity-0 md:gap-2">
                      <span className="shrink-0 text-[#F2A900]/50">{t("Team.inception")}:</span>
                      <span className="text-white/70"><span className="inline-block bg-[#F2A900]/10 px-0.5 text-[#F2A900]/30">████</span> 2019</span>
                    </div>
                    <div className="team-data-line flex gap-1 opacity-0 md:gap-2">
                      <span className="shrink-0 text-[#F2A900]/50">{t("Team.function")}:</span>
                      <span className="text-white/70">{t("Team.functionValue")}</span>
                    </div>
                    <div className="team-data-line flex gap-1 opacity-0 md:gap-2">
                      <span className="shrink-0 text-[#F2A900]/50">{t("Team.specializations")}:</span>
                      <span className="text-white/70">{t("Team.specList")}</span>
                    </div>
                    <div className="team-data-line flex gap-1 opacity-0 md:gap-2">
                      <span className="shrink-0 text-[#F2A900]/50">{t("Team.priorAssignments")}:</span>
                      <span className="text-white/70">{t("Team.assignments")}</span>
                    </div>
                    <div className="team-data-line flex gap-1 opacity-0 md:gap-2">
                      <span className="shrink-0 text-[#F2A900]/50">{t("Team.additionalProtocols")}:</span>
                      <span className="text-white/70">{t("Team.protocols")}</span>
                    </div>
                  </div>

                  <div className="my-2 h-[1px] w-full bg-[repeating-linear-gradient(90deg,#F2A900_0px,#F2A900_4px,transparent_4px,transparent_8px)] opacity-15 md:my-3" />

                  <div className="team-notes opacity-0">
                    <span className="mb-1 block text-[8px] tracking-[0.25em] text-[#F2A900]/35 uppercase md:text-[9px]">{t("Team.notes")}:</span>
                    <p className="text-[10px] leading-relaxed text-white/45 italic md:text-xs">&quot;{t("Team.bio")}&quot;</p>
                  </div>

                  <div className="mt-2 md:mt-3">
                    <span className="mb-1.5 block text-[8px] tracking-[0.25em] text-[#F2A900]/35 uppercase md:text-[9px]">{t("Team.externalLinks")}:</span>
                    <div className="flex gap-4">
                      <a href="https://github.com/rubenbros" target="_blank" rel="noopener noreferrer"
                        className="team-social-link font-mono text-[9px] tracking-[0.15em] text-[#F2A900]/40 uppercase opacity-0 transition-colors duration-300 hover:text-[#F2A900] md:text-[10px]">
                        [GITHUB] ↗
                      </a>
                      <a href="https://www.linkedin.com/in/rubenbros" target="_blank" rel="noopener noreferrer"
                        className="team-social-link font-mono text-[9px] tracking-[0.15em] text-[#F2A900]/40 uppercase opacity-0 transition-colors duration-300 hover:text-[#F2A900] md:text-[10px]">
                        [LINKEDIN] ↗
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom edge decoration */}
              <div className="mt-4 flex items-center justify-between md:mt-6">
                <div className="h-[1px] w-3 bg-[#F2A900]/15" />
                <div className="h-[1px] flex-1 bg-[repeating-linear-gradient(90deg,#F2A900_0px,#F2A900_1px,transparent_1px,transparent_6px)] opacity-10 mx-2" />
                <div className="h-[1px] w-3 bg-[#F2A900]/15" />
              </div>
            </div>
          </div>

          {/* Quote — handwritten annotation style */}
          <div className="team-quote mt-4 opacity-0 md:mt-6">
            <p className="text-center font-mono text-[9px] tracking-[0.08em] text-[#F2A900]/20 italic md:text-xs" style={{ fontStyle: "italic" }}>
              &mdash; {t("Team.quote")}
            </p>
          </div>
        </div>

        {/* Corner decorations — amber */}
        <div className="team-corner absolute left-6 top-6 opacity-0">
          <div className="h-8 w-[1px] bg-gradient-to-b from-[#F2A900]/40 to-transparent" />
          <div className="absolute top-0 h-[1px] w-8 bg-gradient-to-r from-[#F2A900]/40 to-transparent" />
          <span className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.3em] text-[#F2A900]/50">{t("Team.cornerSys")}</span>
        </div>
        <div className="team-corner absolute right-6 top-6 opacity-0">
          <div className="ml-auto h-8 w-[1px] bg-gradient-to-b from-[#F2A900]/40 to-transparent" />
          <div className="absolute right-0 top-0 h-[1px] w-8 bg-gradient-to-l from-[#F2A900]/40 to-transparent" />
          <span className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.3em] text-[#F2A900]/50">{t("Team.cornerLabel")}</span>
        </div>
        <div className="team-corner absolute bottom-6 left-6 opacity-0">
          <div className="h-8 w-[1px] bg-gradient-to-t from-[#F2A900]/40 to-transparent" />
          <div className="absolute bottom-0 h-[1px] w-8 bg-gradient-to-r from-[#F2A900]/40 to-transparent" />
        </div>
        <div className="team-corner absolute bottom-6 right-6 opacity-0">
          <div className="ml-auto h-8 w-[1px] bg-gradient-to-t from-[#F2A900]/40 to-transparent" />
          <div className="absolute bottom-0 right-0 h-[1px] w-8 bg-gradient-to-l from-[#F2A900]/40 to-transparent" />
        </div>
        </div>{/* /team-inner */}
      </section>

      {/* ════════════════════════════════════════════
          HAL 9000 SECTION
          ════════════════════════════════════════════ */}
      <section id="contacto" className="hal-section relative z-[1000] h-[10vh] overflow-visible">
        <div className="hal-inner absolute inset-x-0 top-0 h-screen bg-black">
        {/* CRT power-on overlay — starts fully black */}
        <div className="hal-power-overlay pointer-events-none absolute inset-0 z-[60] bg-black" />
        {/* CRT scan line — horizontal white line that expands (top set by JS to align with HAL eye) */}
        <div className="hal-crt-line pointer-events-none absolute left-0 right-0 top-0 z-[61] h-[2px] origin-center scale-x-0 bg-white/90 shadow-[0_0_20px_4px_rgba(255,255,255,0.4)]" />
        {/* Brief white flash during power-on */}
        <div className="hal-power-flash pointer-events-none absolute inset-0 z-[62] bg-white opacity-0" />
        {/* Red glow that intensifies during power-on (position set by JS to align with HAL eye) */}
        <div className="hal-power-glow pointer-events-none absolute left-1/2 top-0 z-[1] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(229,9,20,0.15)_0%,_transparent_70%)] opacity-0" />
        {/* HAL eye — centered */}
        <div className="hal-content flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-6 md:gap-10">
            <Hal9000 />
            <HalShutdownPanel />
          </div>
        </div>

        {/* Corner decorations */}
        <div className="hal-corner absolute left-6 top-6 opacity-0">
          <div className="h-8 w-[1px] bg-gradient-to-b from-red-500/50 to-transparent" />
          <div className="absolute top-0 h-[1px] w-8 bg-gradient-to-r from-red-500/50 to-transparent" />
          <span className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.3em] text-red-500/50">{t("HalCorners.sys02")}</span>
        </div>
        <div className="hal-corner absolute right-6 top-6 opacity-0">
          <div className="ml-auto h-8 w-[1px] bg-gradient-to-b from-red-500/50 to-transparent" />
          <div className="absolute right-0 top-0 h-[1px] w-8 bg-gradient-to-l from-red-500/50 to-transparent" />
          <span className="absolute right-3 top-3 font-mono text-[9px] tracking-[0.3em] text-red-500/50">{t("HalCorners.active")}</span>
        </div>
        <div className="hal-corner absolute bottom-6 left-6 opacity-0">
          <div className="h-8 w-[1px] bg-gradient-to-t from-red-500/50 to-transparent" />
          <div className="absolute bottom-0 h-[1px] w-8 bg-gradient-to-r from-red-500/50 to-transparent" />
        </div>
        <div className="hal-corner absolute bottom-6 right-6 opacity-0">
          <div className="ml-auto h-8 w-[1px] bg-gradient-to-t from-red-500/50 to-transparent" />
          <div className="absolute bottom-0 right-0 h-[1px] w-8 bg-gradient-to-l from-red-500/50 to-transparent" />
        </div>
        </div>{/* /hal-inner */}
      </section>

      {/* ════════════════════════════════════════════
          FINAL FADE-TO-BLACK SPACER
          ════════════════════════════════════════════ */}
      <div className="final-fade-spacer relative h-[8vh] bg-black" />

      {/* ════════════════════════════════════════════
          FOOTER — Terminator 2 Lava Scene
          ════════════════════════════════════════════ */}
      <footer className="footer-section relative z-[999] bg-black">

        {/* Heat shimmer / glow above lava */}
        <div className="footer-heat-shimmer pointer-events-none relative h-16 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, rgba(255,69,0,0.03) 30%, rgba(255,140,0,0.08) 60%, rgba(255,69,0,0.15) 100%)",
            }}
          />
          {/* Bright heat line at the boundary */}
          <div
            className="footer-heat-line absolute bottom-0 left-0 right-0 h-[2px]"
            style={{
              background: "linear-gradient(90deg, transparent 0%, #ff4500 15%, #fbbf24 35%, #ff8c00 50%, #fbbf24 65%, #ff4500 85%, transparent 100%)",
              boxShadow: "0 0 20px 4px rgba(255,140,0,0.5), 0 0 60px 10px rgba(255,69,0,0.3)",
            }}
          />
        </div>

        {/* Molten steel / lava band */}
        <div className="footer-lava-container relative overflow-hidden" style={{ height: "150px" }}>
          {/* Lava layer 1 — deep base */}
          <div
            className="footer-lava-layer1 absolute inset-0"
            style={{
              background: "linear-gradient(90deg, #8b1a00 0%, #dc2626 15%, #ff4500 30%, #ff8c00 45%, #fbbf24 55%, #ff8c00 65%, #ff4500 80%, #dc2626 90%, #8b1a00 100%)",
              backgroundSize: "200% 100%",
            }}
          />
          {/* Lava layer 2 — bright flowing overlay */}
          <div
            className="footer-lava-layer2 absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 40% 60% at 20% 50%, rgba(251,191,36,0.6) 0%, transparent 70%), radial-gradient(ellipse 35% 50% at 60% 40%, rgba(255,140,0,0.5) 0%, transparent 70%), radial-gradient(ellipse 30% 55% at 80% 60%, rgba(251,191,36,0.4) 0%, transparent 70%)",
              backgroundSize: "200% 100%",
            }}
          />
          {/* Lava layer 3 — surface highlights */}
          <div
            className="footer-lava-layer3 absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 20% 30% at 30% 30%, rgba(255,255,200,0.3) 0%, transparent 70%), radial-gradient(ellipse 15% 25% at 70% 50%, rgba(255,255,200,0.25) 0%, transparent 70%), radial-gradient(ellipse 25% 35% at 50% 70%, rgba(255,200,100,0.2) 0%, transparent 70%)",
              backgroundSize: "200% 100%",
            }}
          />
          {/* Dark patches for depth */}
          <div
            className="footer-lava-dark absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 15% 40% at 10% 60%, rgba(50,0,0,0.5) 0%, transparent 70%), radial-gradient(ellipse 12% 35% at 45% 80%, rgba(50,0,0,0.4) 0%, transparent 70%), radial-gradient(ellipse 18% 30% at 90% 40%, rgba(50,0,0,0.45) 0%, transparent 70%)",
              backgroundSize: "200% 100%",
            }}
          />
          {/* Bottom fade to dark */}
          <div
            className="absolute bottom-0 left-0 right-0 h-12"
            style={{
              background: "linear-gradient(to bottom, transparent, rgba(30,5,0,0.6) 50%, rgba(15,2,0,0.9) 100%)",
            }}
          />

          {/* Lava bubble particles */}
          {[0,1,2,3,4,5].map((i) => (
            <div
              key={`lava-bubble-${i}`}
              className={`footer-lava-bubble footer-lava-bubble-${i} absolute rounded-full opacity-0`}
              style={{
                width: `${6 + (i % 3) * 4}px`,
                height: `${6 + (i % 3) * 4}px`,
                left: `${12 + i * 16}%`,
                bottom: "30%",
                background: "radial-gradient(circle, #fbbf24 0%, #ff8c00 50%, #ff4500 100%)",
                boxShadow: "0 0 8px 2px rgba(251,191,36,0.6)",
              }}
            />
          ))}

          {/* Terminator arm with thumbs up (SVG) */}
          <div className="footer-t800-arm absolute left-1/2 -translate-x-1/2" style={{ bottom: "10px", width: "80px", height: "170px" }}>
            <svg
              viewBox="0 0 80 170"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-full w-full"
              style={{ filter: "drop-shadow(0 0 12px rgba(255,140,0,0.4))" }}
            >
              <defs>
                {/* Chrome metallic gradient */}
                <linearGradient id="arm-chrome" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#e8e8e8" />
                  <stop offset="25%" stopColor="#c0c0c0" />
                  <stop offset="50%" stopColor="#9a9a9a" />
                  <stop offset="70%" stopColor="#c0c0c0" />
                  <stop offset="100%" stopColor="#6a6a6a" />
                </linearGradient>
                {/* Lava reflection on lower arm */}
                <linearGradient id="arm-lava-reflect" x1="0.5" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="rgba(255,100,0,0.15)" />
                  <stop offset="100%" stopColor="rgba(255,69,0,0.5)" />
                </linearGradient>
                {/* Fade mask — arm disappears into lava at the bottom */}
                <linearGradient id="arm-fade" x1="0.5" y1="0" x2="0.5" y2="1">
                  <stop offset="0%" stopColor="white" />
                  <stop offset="75%" stopColor="white" />
                  <stop offset="95%" stopColor="black" />
                </linearGradient>
                <mask id="arm-mask">
                  <rect x="0" y="0" width="80" height="170" fill="url(#arm-fade)" />
                </mask>
              </defs>
              <g mask="url(#arm-mask)">
                {/* Forearm */}
                <path
                  d="M32 170 L32 70 Q32 62 36 58 L36 58 L44 58 Q48 62 48 70 L48 170 Z"
                  fill="url(#arm-chrome)"
                  stroke="#555"
                  strokeWidth="0.5"
                />
                {/* Wrist taper */}
                <path
                  d="M34 70 L34 58 Q34 55 36 53 L44 53 Q46 55 46 58 L46 70 Z"
                  fill="url(#arm-chrome)"
                  stroke="#555"
                  strokeWidth="0.5"
                />
                {/* Fist / palm */}
                <path
                  d="M30 55 Q28 50 28 44 Q28 36 34 33 L46 33 Q52 36 52 44 Q52 50 50 55 Z"
                  fill="url(#arm-chrome)"
                  stroke="#555"
                  strokeWidth="0.5"
                />
                {/* Curled fingers — index */}
                <path
                  d="M30 44 Q27 42 27 38 Q27 34 30 33 L34 33"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Curled fingers — middle */}
                <path
                  d="M32 42 Q29 39 29 35 Q29 32 32 31"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Curled fingers — ring */}
                <path
                  d="M48 42 Q51 39 51 35 Q51 32 48 31"
                  fill="none"
                  stroke="#999"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Curled fingers — pinky */}
                <path
                  d="M50 44 Q53 42 53 38 Q53 34 50 33"
                  fill="none"
                  stroke="#888"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {/* Thumb — extended upward */}
                <path
                  d="M30 44 Q26 43 24 38 Q22 30 24 20 Q25 14 28 10 Q31 7 33 8 Q36 9 36 14 L35 30 Q34 38 32 42"
                  fill="url(#arm-chrome)"
                  stroke="#666"
                  strokeWidth="0.8"
                />
                {/* Thumb highlight */}
                <path
                  d="M28 14 Q29 10 31 9"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                {/* Mechanical joint lines on forearm */}
                <line x1="34" y1="80" x2="46" y2="80" stroke="#666" strokeWidth="0.5" />
                <line x1="34" y1="95" x2="46" y2="95" stroke="#666" strokeWidth="0.5" />
                <line x1="34" y1="110" x2="46" y2="110" stroke="#666" strokeWidth="0.5" />
                {/* Chrome highlight streak */}
                <line x1="38" y1="60" x2="38" y2="130" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                {/* Lava reflection overlay */}
                <rect x="30" y="0" width="22" height="170" fill="url(#arm-lava-reflect)" />
                {/* Knuckle details */}
                <circle cx="33" cy="36" r="1.5" fill="#777" />
                <circle cx="40" cy="34" r="1.5" fill="#777" />
                <circle cx="47" cy="36" r="1.5" fill="#777" />
              </g>
            </svg>
          </div>
        </div>

        {/* Footer content — below lava */}
        <div
          className="relative px-6 py-12 md:px-10"
          style={{
            background: "linear-gradient(to bottom, #1a0500 0%, #0d0200 20%, #050100 40%, #000000 100%)",
          }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {/* Column 1: Logo + description */}
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <img src="/logo-small.png" alt="T800 Labs" className="h-8" />
                  <span className="text-lg font-bold text-white">T800<span className="text-[#e50914]">Labs</span></span>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-white/40">
                  {t("Footer.description")}
                </p>
              </div>

              {/* Column 2: Contact */}
              <div>
                <h4 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase">{t("Footer.contact")}</h4>
                <div className="space-y-2 font-mono text-[11px] text-white/40">
                  <a
                    href="mailto:ruben.jarne.cabanero@gmail.com"
                    className="block transition-colors duration-300 hover:text-[#e50914]"
                  >
                    ruben.jarne.cabanero@gmail.com
                  </a>
                  <a
                    href="https://wa.me/34646515267"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-colors duration-300 hover:text-[#e50914]"
                  >
                    +34 646 515 267
                  </a>
                </div>
              </div>

              {/* Column 3: Social */}
              <div>
                <h4 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase">{t("Footer.followUs")}</h4>
                <div className="flex gap-5">
                  <a
                    href="https://github.com/rubenbros"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-white/40 transition-colors duration-300 hover:text-[#e50914]"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/rubenbros"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-white/40 transition-colors duration-300 hover:text-[#e50914]"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-10 border-t border-white/5 pt-6 text-center">
              <span className="font-mono text-[10px] text-white/20">{t("Footer.copyright")}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Transition scanline — sweeps between sections */}
      <div
        className="transition-scan pointer-events-none fixed inset-x-0 z-[100] opacity-0"
        style={{ top: "-2px", height: "2px" }}
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-red-500/80 to-transparent" />
        <div className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 bg-gradient-to-b from-transparent via-red-500/15 to-transparent" />
      </div>

      {/* Fixed blackout overlay — fades in at the very end */}
      <div className="final-blackout pointer-events-none fixed inset-0 z-[998] bg-black opacity-0" />

    </div>
  );
}
