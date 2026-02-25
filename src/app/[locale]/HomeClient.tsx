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
      tl.fromTo(".hero-scroll-indicator", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 2.4);
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
          end: isMobile ? "+=1100" : "+=2000",
          scrub: true,
          pin: true,
        },
      });

      // ── Phase 1: Small circle left → right (0→7) ──
      bt.fromTo(".bond-assembly",
        { x: startX, y: 0, scale: 0.12, opacity: 0 },
        { opacity: 1, duration: 0.3 }, 0);
      bt.to(".bond-assembly",
        { x: endX, duration: 7, ease: "none" }, 0);

      // Ghost trail 1 — appears at ~28% + service label (longer visible)
      bt.fromTo(".bond-ghost-1",
        { opacity: 0 }, { opacity: 0.6, duration: 0.1 }, 2);
      bt.fromTo(".ghost-label-1",
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 2);
      bt.to(".bond-ghost-1",
        { opacity: 0, duration: 2.5 }, 3.5);
      bt.to(".ghost-label-1",
        { opacity: 0, y: -10, duration: 2 }, 3.8);

      // Ghost trail 2 — appears at ~52% + service label (longer visible)
      bt.fromTo(".bond-ghost-2",
        { opacity: 0 }, { opacity: 0.6, duration: 0.1 }, 3.8);
      bt.fromTo(".ghost-label-2",
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 3.8);
      bt.to(".bond-ghost-2",
        { opacity: 0, duration: 2.5 }, 5.3);
      bt.to(".ghost-label-2",
        { opacity: 0, y: -10, duration: 2 }, 5.5);

      // Ghost trail 3 — appears at ~76% + service label (longer visible)
      bt.fromTo(".bond-ghost-3",
        { opacity: 0 }, { opacity: 0.6, duration: 0.1 }, 5.5);
      bt.fromTo(".ghost-label-3",
        { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 5.5);
      bt.to(".bond-ghost-3",
        { opacity: 0, duration: 2.5 }, 7.0);
      bt.to(".ghost-label-3",
        { opacity: 0, y: -10, duration: 2 }, 7.2);

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

      // ── Phase 4: Blood drips cascade down screen (17.5→28) ──
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
      }, 17.5);
      bt.to(".blood-drip-2", {
        keyframes: [
          { height: "20%", duration: 0.6, ease: "power1.in" },
          { height: "65%", duration: 0.8, ease: "power2.in" },
          { height: "95%", duration: 0.7, ease: "power1.out" },
          { height: "115%", duration: 0.6, ease: "sine.out" },
        ],
      }, 18.5);
      bt.to(".blood-drip-3", {
        keyframes: [
          { height: "25%", duration: 0.5, ease: "power2.in" },
          { height: "75%", duration: 0.7, ease: "none" },
          { height: "105%", duration: 0.6, ease: "power2.out" },
          { height: "115%", duration: 0.4, ease: "sine.out" },
        ],
      }, 19.5);

      // Wider flows — organic liquid speed variation (slower)
      bt.to(".blood-drip-4", { height: "115%", duration: 3.5, ease: liquidEase }, 20.5);
      bt.to(".blood-drip-5", { height: "115%", duration: 3.2, ease: liquidEase2 }, 21.0);
      bt.to(".blood-drip-6", { height: "115%", duration: 3.5, ease: liquidEase }, 21.5);
      bt.to(".blood-drip-7", { height: "115%", duration: 3.2, ease: liquidEase2 }, 22.0);

      // Solid fill within group ensures full coverage
      bt.to(".blood-solid", { opacity: 1, duration: 0.8 }, 25);

      // Raise group opacity to fully opaque + fade to black
      bt.to(".bond-blood-drips", { opacity: 1, duration: 0.2, ease: "power2.inOut" }, 25.8);
      bt.to(".bond-assembly", { opacity: 0, duration: 0.2 }, 25.8);
      bt.to(".blood-solid", { backgroundColor: "#000000", duration: 0.4, ease: "power2.in" }, 26);
      bt.to(".blood-drip", { backgroundColor: "#000000", duration: 0.4, ease: "power2.in" }, 26);

      // ═══════════════════════════════════════
      // MANIFESTO — Fixed overlay during Bond→Services gap
      // ═══════════════════════════════════════
      // Manifesto fades in at end of Bond pin (during blood→black)
      const mft = gsap.timeline({
        scrollTrigger: {
          trigger: ".bond-section",
          start: "bottom-=400 top",
          end: "bottom top",
          scrub: true,
        },
      });
      mft.fromTo(".manifesto-overlay", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
      mft.fromTo(".manifesto-line-1", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.1);
      mft.fromTo(".manifesto-line-2", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.25);
      mft.to(".manifesto-divider", { width: "120px", duration: 0.2, ease: "power3.inOut" }, 0.35);
      mft.fromTo(".manifesto-line-3", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.4);
      mft.fromTo(".manifesto-line-3",
        { textShadow: "0 0 0px rgba(229,9,20,0)" },
        { textShadow: "0 0 30px rgba(229,9,20,0.5)", duration: 0.3 }, 0.6);

      // Manifesto fades out as Services enters
      gsap.to(".manifesto-overlay", {
        opacity: 0,
        scrollTrigger: {
          trigger: ".services-section",
          start: "top 80%",
          end: "top 30%",
          scrub: true,
        },
      });

      // ═══════════════════════════════════════
      // SERVICES SECTION — Matrix rain + cards
      // ═══════════════════════════════════════

      // Pre-reveal: rain + header + corners appear as section scrolls into viewport
      gsap.fromTo(".services-rain",
        { opacity: 0 },
        { opacity: 1, ease: "power2.out",
          scrollTrigger: { trigger: ".services-section", start: "top bottom", end: "top 30%", scrub: true },
        });
      gsap.fromTo(".services-header",
        { opacity: 0 },
        { opacity: 1, ease: "power2.out",
          scrollTrigger: { trigger: ".services-section", start: "top bottom", end: "top 20%", scrub: true },
        });
      gsap.to(".services-divider",
        { scaleX: 1, ease: "power3.inOut",
          scrollTrigger: { trigger: ".services-section", start: "top 80%", end: "top 40%", scrub: true },
        });
      gsap.fromTo(".services-corner",
        { opacity: 0 },
        { opacity: 1, stagger: 0.05,
          scrollTrigger: { trigger: ".services-section", start: "top bottom", end: "top 30%", scrub: true },
        });

      const st = gsap.timeline({
        scrollTrigger: {
          trigger: ".services-section",
          start: "top top",
          end: isMobile ? "+=600" : "+=1000",
          scrub: true,
          pin: true,
        },
      });

      // Cards animate during pin
      st.fromTo(".services-grid",
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }, 0);

      st.fromTo(".service-card",
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6, stagger: 0.2,
          ease: "power2.out",
        }, 0.1);

      st.fromTo(".service-card",
        { boxShadow: "0 0 0px rgba(0,255,65,0)" },
        {
          boxShadow: "0 0 20px rgba(0,255,65,0.3)",
          duration: 0.4, stagger: 0.2,
          ease: "power2.out",
        }, 0.1);

      st.to(".service-card", {
        boxShadow: "0 0 8px rgba(0,255,65,0.08)",
        duration: 0.6, stagger: 0.1,
        ease: "power2.out",
      }, 1.6);

      // Cross-dissolve out — content dims + blurs at end of pin
      st.to(".services-inner", {
        opacity: 0.25, filter: "blur(4px)", duration: 1.2,
      }, 2.8);

      // ═══════════════════════════════════════
      // PROCESS SECTION — handled by ProcessVersionA/B/C component
      // ═══════════════════════════════════════

      // ═══════════════════════════════════════
      // TEAM SECTION — Blade Runner / Tyrell Corp
      // ═══════════════════════════════════════

      // Pre-reveal: header + corners appear as section scrolls into viewport
      gsap.fromTo(".team-header",
        { opacity: 0 },
        { opacity: 1, ease: "power2.out",
          scrollTrigger: { trigger: ".team-section", start: "top bottom", end: "top 20%", scrub: true },
        });
      gsap.to(".team-divider",
        { scaleX: 1, ease: "power3.inOut",
          scrollTrigger: { trigger: ".team-section", start: "top 80%", end: "top 40%", scrub: true },
        });
      gsap.fromTo(".team-corner",
        { opacity: 0 },
        { opacity: 1, stagger: 0.05,
          scrollTrigger: { trigger: ".team-section", start: "top bottom", end: "top 30%", scrub: true },
        });

      const tt = gsap.timeline({
        scrollTrigger: {
          trigger: ".team-section",
          start: "top top",
          end: isMobile ? "+=600" : "+=1000",
          scrub: true,
          pin: true,
        },
      });

      // Card and content animate during pin
      tt.fromTo(".team-card",
        { opacity: 0, scaleY: 0.01 },
        { opacity: 1, scaleY: 1, duration: 0.5, ease: "power2.out" }, 0);

      tt.fromTo(".team-photo-scan",
        { y: "-100%" },
        { y: "100%", duration: 0.7, ease: "power2.inOut" }, 0.3);
      tt.fromTo(".team-photo-img",
        { opacity: 0 },
        { opacity: 1, duration: 0.4 }, 0.5);

      tt.fromTo(".team-data-line",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, stagger: 0.12, duration: 0.3, ease: "power2.out" }, 0.6);

      tt.fromTo(".team-bio",
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }, 1.4);

      tt.fromTo(".team-social-link",
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.3 }, 1.5);

      tt.fromTo(".team-quote",
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }, 1.8);

      // Cross-dissolve out — content dims + blurs at end of pin
      tt.to(".team-inner", {
        opacity: 0.25, filter: "blur(4px)", duration: 1.2,
      }, 2.8);

      // ═══════════════════════════════════════
      // HAL 9000 SECTION — fades in from black
      // ═══════════════════════════════════════

      // Pre-reveal: corners + eye glow appear as section scrolls into viewport
      gsap.fromTo(".hal-corner",
        { opacity: 0 },
        { opacity: 1, stagger: 0.05,
          scrollTrigger: { trigger: ".hal-section", start: "top bottom", end: "top 30%", scrub: true },
        });
      gsap.fromTo(".hal-content",
        { opacity: 0 },
        { opacity: 1, ease: "power2.out",
          scrollTrigger: { trigger: ".hal-section", start: "top bottom", end: "top 20%", scrub: true },
        });

      const ht = gsap.timeline({
        scrollTrigger: {
          trigger: ".hal-section",
          start: "top top",
          end: isMobile ? "+=350" : "+=600",
          scrub: true,
          pin: true,
        },
      });

      // Quote appears during pin
      ht.fromTo(".hal-quote",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0);

      // ═══════════════════════════════════════
      // TRANSITION SCANLINES — red sweep between sections
      // ═══════════════════════════════════════
      [".services-section", ".process-section", ".team-section", ".hal-section"].forEach((trigger) => {
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
    <div ref={wrapperRef} className="relative bg-black">

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
            <div className="hero-scroll-indicator mt-14 flex flex-col items-center gap-3 opacity-0">
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
      <div className="manifesto-overlay pointer-events-none fixed inset-0 z-[8] flex items-center justify-center opacity-0">
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
      <section id="servicios" className="services-section relative z-[3] h-screen overflow-hidden bg-black">
        <div className="services-inner absolute inset-0">
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
          TEAM SECTION — Blade Runner / Tyrell Corp
          ════════════════════════════════════════════ */}
      <section id="equipo" className="team-section relative z-[5] h-screen overflow-hidden bg-black">
        <div className="team-inner absolute inset-0">
        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 md:px-10">
          {/* Section header */}
          <div className="team-header mb-3 flex flex-col items-center gap-2 opacity-0 md:mb-10 md:gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#F2A900]/60 uppercase">
              {t("Team.subtitle")}
            </span>
            <h2 className="font-bold text-2xl tracking-[0.15em] text-[#F2A900] md:text-5xl">
              {t("Team.title")}
            </h2>
            <div className="team-divider h-[1px] w-16 origin-center scale-x-0 bg-gradient-to-r from-transparent via-[#F2A900]/50 to-transparent" />
          </div>

          {/* Replicant card */}
          <div className="team-card w-full max-w-3xl origin-center overflow-hidden rounded border border-[#F2A900]/20 bg-black/80 backdrop-blur-sm">
            <div className="flex flex-row">
              {/* Photo side */}
              <div className="relative w-1/3 overflow-hidden md:w-2/5">
                <img
                  src="/ruben-jarne.jpg"
                  alt="Rubén Jarné Cabañero"
                  className="team-photo-img h-full w-full object-cover opacity-0"
                />
                {/* Scan lines overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.12)_2px,rgba(0,0,0,0.12)_4px)]" />
                {/* Amber tint */}
                <div className="pointer-events-none absolute inset-0 bg-[#F2A900]/8 mix-blend-overlay" />
                {/* Scan sweep bar */}
                <div className="team-photo-scan pointer-events-none absolute left-0 right-0 h-1 bg-[#F2A900]/60 shadow-[0_0_20px_4px_rgba(242,169,0,0.4)]" style={{ top: 0 }} />
              </div>

              {/* Data side */}
              <div className="flex flex-1 flex-col justify-center p-3 font-mono md:p-8">
                {/* Header */}
                <div className="team-data-line mb-2 border-b border-[#F2A900]/20 pb-2 md:mb-4 md:pb-3">
                  <span className="text-[8px] tracking-[0.2em] text-[#F2A900]/40 md:text-[10px]">{t("Team.model")}</span>
                  <h3 className="mt-0.5 text-sm font-bold tracking-[0.05em] text-[#F2A900] md:mt-1 md:text-xl">RUBÉN JARNÉ CABAÑERO</h3>
                </div>

                {/* Data fields */}
                <div className="space-y-1.5 text-[10px] md:space-y-2.5 md:text-xs">
                  <div className="team-data-line flex gap-1 md:gap-2">
                    <span className="shrink-0 text-[#F2A900]/50">{t("Team.inception")}:</span>
                    <span className="text-white/80">2019</span>
                  </div>
                  <div className="team-data-line flex gap-1 md:gap-2">
                    <span className="shrink-0 text-[#F2A900]/50">{t("Team.function")}:</span>
                    <span className="text-white/80">{t("Team.functionValue")}</span>
                  </div>
                  <div className="team-data-line flex gap-1 md:gap-2">
                    <span className="shrink-0 text-[#F2A900]/50">{t("Team.specializations")}:</span>
                    <span className="text-white/80">{t("Team.specList")}</span>
                  </div>
                  <div className="team-data-line flex gap-1 md:gap-2">
                    <span className="shrink-0 text-[#F2A900]/50">{t("Team.priorAssignments")}:</span>
                    <span className="text-white/80">{t("Team.assignments")}</span>
                  </div>
                  <div className="team-data-line flex gap-1 md:gap-2">
                    <span className="shrink-0 text-[#F2A900]/50">{t("Team.additionalProtocols")}:</span>
                    <span className="text-white/80">{t("Team.protocols")}</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="team-bio mt-2 border-t border-[#F2A900]/10 pt-2 opacity-0 md:mt-4 md:pt-3">
                  <p className="text-[10px] italic text-white/50 md:text-xs">&quot;{t("Team.bio")}&quot;</p>
                </div>

                {/* Social links */}
                <div className="mt-2 flex gap-4 md:mt-4">
                  <a
                    href="https://github.com/rubenbros"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-social-link font-mono text-[9px] tracking-[0.15em] text-[#F2A900]/50 uppercase transition-colors duration-300 hover:text-[#F2A900] opacity-0 md:text-[10px]"
                  >
                    GitHub ↗
                  </a>
                  <a
                    href="https://www.linkedin.com/in/rubenbros"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="team-social-link font-mono text-[9px] tracking-[0.15em] text-[#F2A900]/50 uppercase transition-colors duration-300 hover:text-[#F2A900] opacity-0 md:text-[10px]"
                  >
                    LinkedIn ↗
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Blade Runner quote */}
          <div className="team-quote mt-4 opacity-0 md:mt-8">
            <p className="text-center font-mono text-[9px] italic tracking-[0.1em] text-[#F2A900]/25 md:text-xs">
              {t("Team.quote")}
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
      <section id="contacto" className="hal-section relative z-[6] h-screen overflow-hidden bg-black">
        {/* Pre-entrance glow */}
        {/* Fadeout overlay — covers content before unpin */}
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

      </section>

      {/* ════════════════════════════════════════════
          FINAL FADE-TO-BLACK SPACER
          ════════════════════════════════════════════ */}
      <div className="final-fade-spacer relative h-[8vh] bg-black" />

      {/* ════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════ */}
      <footer className="relative border-t border-white/5 bg-black px-6 py-12 md:px-10">
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
