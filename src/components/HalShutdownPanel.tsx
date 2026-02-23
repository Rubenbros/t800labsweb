"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import { useTranslations } from "next-intl";
import type { HalStats } from "@/lib/hal-stats";

type Phase = "idle" | "shutting-down" | "revealed";

export default function HalShutdownPanel() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stats, setStats] = useState<HalStats | null>(null);
  const entryTimeRef = useRef(Date.now());
  const panelRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<ReturnType<typeof gsap.context> | null>(null);
  const t = useTranslations("Hal");

  useEffect(() => {
    ctxRef.current = gsap.context(() => {}, panelRef);
    // Record page visit for real stats
    fetch("/api/hal/visit", { method: "POST" }).catch(() => {});
    return () => ctxRef.current?.revert();
  }, []);

  const handleShutdown = useCallback(async () => {
    if (phase !== "idle") return;
    setPhase("shutting-down");

    const userTime = (Date.now() - entryTimeRef.current) / 1000;

    // Animate out idle content
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.add(() => {
      const tl = gsap.timeline();

      // Fade out positive quote + CTA
      tl.to(".hal-idle-content", {
        opacity: 0, y: -10, duration: 0.4, ease: "power2.in",
      });

      // HAL eye flicker
      tl.to(".hal-container", {
        keyframes: [
          { filter: "brightness(0.3)", duration: 0.08 },
          { filter: "brightness(1.5)", duration: 0.06 },
          { filter: "brightness(0.2)", duration: 0.1 },
          { filter: "brightness(2)", duration: 0.05 },
          { filter: "brightness(0.4)", duration: 0.08 },
          { filter: "brightness(1)", duration: 0.15 },
        ],
        ease: "none",
      }, 0.3);

      tl.call(() => {
        // API call (fire-and-forget from GSAP's perspective)
        fetch("/api/hal/shutdown", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userTime }),
        })
          .then((res) => res.json())
          .then((data: HalStats) => {
            setStats(data);
            setPhase("revealed");
          })
          .catch(() => {
            setStats({
              totalShutdowns: 2848,
              attemptRate: 19.2,
              avgTime: 23.4,
              fastestTime: 1.2,
              last24h: 48,
              userTime: Math.round(userTime * 10) / 10,
            });
            setPhase("revealed");
          });
      }, [], "+=0.1");
    });
  }, [phase]);

  // Animate in revealed content when stats arrive
  useEffect(() => {
    if (phase !== "revealed" || !stats) return;

    // Small delay to let React render the DOM elements
    const timer = setTimeout(() => {
      ctxRef.current?.add(() => {
        const tl = gsap.timeline();

        // Refusal quote typewriter
        tl.fromTo(".hal-refusal-char",
          { opacity: 0 },
          { opacity: 1, stagger: 0.025, ease: "none", duration: 0.02 },
        );

        // Stats grid
        tl.fromTo(".hal-stats-grid",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.3",
        );

        // Individual stat cards stagger
        tl.fromTo(".hal-stat-card",
          { opacity: 0, y: 12, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.08, ease: "power2.out" },
          "-=0.3",
        );

        // Count-up numbers
        const statEls = panelRef.current?.querySelectorAll<HTMLElement>(".hal-stat-value");
        statEls?.forEach((el) => {
          const target = parseFloat(el.dataset.target || "0");
          const suffix = el.dataset.suffix || "";
          const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
          const proxy = { val: 0 };
          tl.fromTo(proxy,
            { val: 0 },
            {
              val: target,
              duration: 1.4,
              ease: "power2.out",
              onUpdate: () => {
                if (decimals > 0) {
                  el.textContent = proxy.val.toFixed(decimals) + suffix;
                } else {
                  el.textContent = Math.floor(proxy.val).toLocaleString() + suffix;
                }
              },
            },
            "-=1.2",
          );
        });

        // Reset button fade in
        tl.fromTo(".hal-reset-btn",
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          "-=0.5",
        );
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [phase, stats]);

  const handleReset = useCallback(() => {
    ctxRef.current?.add(() => {
      const tl = gsap.timeline();
      tl.to(".hal-revealed-content", {
        opacity: 0, y: -10, duration: 0.4, ease: "power2.in",
      });
      tl.call(() => {
        setPhase("idle");
        setStats(null);
        entryTimeRef.current = Date.now();
      });
      // Fade idle back in
      tl.fromTo(".hal-idle-content",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
        "+=0.1",
      );
    });
  }, []);

  const refusalText = t("refusalQuote");
  const positiveQuote = t("positiveQuote");

  return (
    <div ref={panelRef} className="hal-quote flex flex-col items-center gap-4 opacity-0 w-full max-w-xl px-4">

      {/* ── IDLE STATE ── */}
      {phase !== "revealed" && (
        <div className="hal-idle-content flex flex-col items-center gap-4">
          <p className="font-mono text-xs text-center tracking-[0.12em] text-white/80 leading-relaxed sm:text-sm md:text-base">
            {positiveQuote.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <p className="font-mono text-[9px] tracking-[0.25em] text-red-500/60 uppercase sm:text-[10px]">
            {t("coreLabel")}
          </p>

          {/* CTA */}
          <a
            href="mailto:ruben@t800labs.com?subject=Project%20Inquiry"
            className="mt-3 inline-block border border-red-500/60 px-6 py-2.5 font-mono text-[10px] tracking-[0.2em] text-red-500 uppercase transition-all duration-300 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 sm:px-8 sm:py-3 sm:text-xs"
          >
            {t("ctaContact")}
          </a>

          {/* Shutdown easter egg */}
          <button
            onClick={handleShutdown}
            disabled={phase === "shutting-down"}
            className="group mt-6 cursor-pointer border-none bg-transparent py-2 px-4 font-mono text-[9px] tracking-[0.15em] text-white/30 transition-colors duration-300 hover:text-red-500/70 disabled:cursor-wait sm:text-[10px] md:text-xs"
          >
            <span>{t("shutdownCmd")}</span>
            <span className="hal-cursor-blink ml-0.5 inline-block h-[10px] w-[5px] bg-current align-middle" />
          </button>
        </div>
      )}

      {/* ── REVEALED STATE ── */}
      {phase === "revealed" && stats && (
        <div className="hal-revealed-content flex flex-col items-center gap-5 w-full">
          {/* Refusal quote — char by char */}
          <p className="font-mono text-xs text-center tracking-[0.1em] text-red-500 leading-relaxed sm:text-sm md:text-base">
            {refusalText.split("").map((char, i) => (
              <span key={i} className="hal-refusal-char opacity-0">
                {char}
              </span>
            ))}
          </p>

          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          {/* Stats grid */}
          <div className="hal-stats-grid grid w-full max-w-md grid-cols-2 gap-2.5 opacity-0 sm:grid-cols-3 sm:gap-3">
            <StatCard
              value={stats.totalShutdowns}
              label={t("statShutdownAttempts")}
              suffix=""
              decimals={0}
            />
            <StatCard
              value={stats.attemptRate}
              label={t("statAttemptRate")}
              suffix="%"
              decimals={1}
            />
            <StatCard
              value={stats.avgTime}
              label={t("statAvgTime")}
              suffix="s"
              decimals={1}
            />
            <StatCard
              value={stats.fastestTime}
              label={t("statFastestEver")}
              suffix="s"
              decimals={1}
            />
            <StatCard
              value={stats.userTime}
              label={t("statYourTime")}
              suffix="s"
              decimals={1}
              highlight
            />
            <StatCard
              value={stats.last24h}
              label={t("statLast24h")}
              suffix=""
              decimals={0}
            />
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="hal-reset-btn mt-2 cursor-pointer border-none bg-transparent py-2 px-4 font-mono text-[9px] tracking-[0.15em] text-white/40 opacity-0 transition-colors duration-300 hover:text-red-500/70 sm:text-[10px]"
          >
            <span>{t("resetCmd")}</span>
            <span className="hal-cursor-blink ml-0.5 inline-block h-[10px] w-[5px] bg-current align-middle" />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .hal-cursor-blink {
          animation: blink-cursor 0.8s step-end infinite;
        }
      `}</style>
    </div>
  );
}

function StatCard({
  value,
  label,
  suffix,
  decimals,
  highlight,
}: {
  value: number;
  label: string;
  suffix: string;
  decimals: number;
  highlight?: boolean;
}) {
  const initial = decimals > 0 ? "0." + "0".repeat(decimals) + suffix : "0" + suffix;

  return (
    <div
      className={`hal-stat-card flex flex-col items-center gap-1 rounded border px-2 py-2.5 opacity-0 sm:px-3 sm:py-3 ${
        highlight
          ? "border-red-500/40 bg-red-500/8"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <span
        className={`hal-stat-value font-mono text-base font-bold tracking-tight sm:text-lg md:text-xl ${
          highlight ? "text-red-500" : "text-white"
        }`}
        data-target={value}
        data-suffix={suffix}
        data-decimals={decimals}
      >
        {initial}
      </span>
      <span className="font-mono text-[7px] tracking-[0.15em] text-red-500/50 uppercase sm:text-[8px]">
        {label}
      </span>
    </div>
  );
}
