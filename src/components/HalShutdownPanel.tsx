"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import { useTranslations } from "next-intl";
import type { HalStats } from "@/lib/hal-stats";

type Phase = "idle" | "contact" | "email-form" | "email-sending" | "email-sent" | "email-error" | "shutting-down" | "revealed";

export default function HalShutdownPanel() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stats, setStats] = useState<HalStats | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const entryTimeRef = useRef(Date.now());
  const panelRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Hal");

  useEffect(() => {
    fetch("/api/hal/visit", { method: "POST" }).catch(() => {});
  }, []);

  // ── CONTACT ──
  const handleContact = useCallback(() => {
    if (phase !== "idle") return;
    setPhase("contact");
  }, [phase]);

  const handleContactBack = useCallback(() => {
    setFormName("");
    setFormEmail("");
    setFormMessage("");
    setPhase("idle");
  }, []);

  // ── EMAIL FORM ──
  const handleEmailOption = useCallback(() => {
    setPhase("email-form");
  }, []);

  const handleEmailSend = useCallback(async () => {
    setPhase("email-sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, email: formEmail, message: formMessage }),
      });
      if (res.ok) {
        setPhase("email-sent");
      } else {
        // Fallback to mailto if API fails
        const subject = encodeURIComponent(`Contacto desde T800 Labs — ${formName}`);
        const body = encodeURIComponent(
          `Nombre: ${formName}\nEmail: ${formEmail}\n\n${formMessage}`
        );
        window.open(
          `mailto:hola@t800labs.com?subject=${subject}&body=${body}`,
          "_self"
        );
        setPhase("email-sent");
      }
    } catch {
      // Fallback to mailto
      const subject = encodeURIComponent(`Contacto desde T800 Labs — ${formName}`);
      const body = encodeURIComponent(
        `Nombre: ${formName}\nEmail: ${formEmail}\n\n${formMessage}`
      );
      window.open(
        `mailto:hola@t800labs.com?subject=${subject}&body=${body}`,
        "_self"
      );
      setPhase("email-sent");
    }
  }, [formName, formEmail, formMessage]);

  // ── SHUTDOWN ──
  const handleShutdown = useCallback(async () => {
    if (phase !== "idle") return;
    setPhase("shutting-down");

    const userTime = (Date.now() - entryTimeRef.current) / 1000;

    // HAL eye flicker
    const halContainer = document.querySelector(".hal-container") as HTMLElement;
    if (halContainer) {
      gsap.to(halContainer, {
        keyframes: [
          { filter: "brightness(0.3)", duration: 0.08 },
          { filter: "brightness(1.5)", duration: 0.06 },
          { filter: "brightness(0.2)", duration: 0.1 },
          { filter: "brightness(2)", duration: 0.05 },
          { filter: "brightness(0.4)", duration: 0.08 },
          { filter: "brightness(1)", duration: 0.15 },
        ],
        ease: "none",
      });
    }

    setTimeout(() => {
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
    }, 600);
  }, [phase]);

  // ── Animate revealed stats count-up ──
  useEffect(() => {
    if (phase !== "revealed" || !stats) return;

    const timer = setTimeout(() => {
      // Typewriter for refusal chars
      const chars = panelRef.current?.querySelectorAll<HTMLElement>(".hal-refusal-char");
      chars?.forEach((ch, i) => {
        setTimeout(() => { ch.style.opacity = "1"; }, i * 25);
      });

      // Count-up for stats
      const statEls = panelRef.current?.querySelectorAll<HTMLElement>(".hal-stat-value");
      statEls?.forEach((el) => {
        const target = parseFloat(el.dataset.target || "0");
        const suffix = el.dataset.suffix || "";
        const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
        const duration = 1400;
        const start = Date.now();
        const animate = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - (1 - progress) * (1 - progress);
          const current = target * eased;
          el.textContent = decimals > 0
            ? current.toFixed(decimals) + suffix
            : Math.floor(current).toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [phase, stats]);

  const handleReset = useCallback(() => {
    setPhase("idle");
    setStats(null);
    entryTimeRef.current = Date.now();
  }, []);

  const refusalText = t("refusalQuote");
  const positiveQuote = t("positiveQuote");

  return (
    <div ref={panelRef} className="hal-quote flex flex-col items-center gap-4 opacity-0 w-full max-w-xl px-4">

      {/* ── IDLE STATE ── */}
      {(phase === "idle" || phase === "shutting-down") && (
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

          <button
            onClick={handleContact}
            className="mt-3 cursor-pointer border border-red-500/60 bg-transparent px-6 py-2.5 font-mono text-[10px] tracking-[0.2em] text-red-500 uppercase transition-all duration-300 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 sm:px-8 sm:py-3 sm:text-xs"
          >
            {t("ctaContact")}
          </button>

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

      {/* ── CONTACT OPTIONS STATE ── */}
      {phase === "contact" && (
        <div className="hal-contact-content flex flex-col items-center gap-5 w-full">
          <p className="font-mono text-[9px] tracking-[0.25em] text-red-500/60 uppercase sm:text-[10px]">
            {t("contactTitle")}
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:gap-4">
            <button
              onClick={handleEmailOption}
              className="hal-contact-option group flex flex-1 cursor-pointer flex-col items-center gap-2 rounded border border-red-500/30 bg-transparent px-4 py-4 transition-all duration-300 hover:border-red-500/60 hover:bg-red-500/5 sm:py-5"
            >
              <span className="font-mono text-lg text-red-500/70 transition-colors duration-300 group-hover:text-red-500">@</span>
              <span className="font-mono text-[10px] tracking-[0.15em] text-white/80 uppercase sm:text-xs">{t("contactEmail")}</span>
              <span className="font-mono text-[8px] tracking-[0.1em] text-white/40 sm:text-[9px]">{t("contactEmailDesc")}</span>
            </button>

            <a
              href={`https://wa.me/34645515267?text=${encodeURIComponent(t("contactWhatsappMsg"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hal-contact-option group flex flex-1 cursor-pointer flex-col items-center gap-2 rounded border border-red-500/30 bg-transparent px-4 py-4 transition-all duration-300 hover:border-red-500/60 hover:bg-red-500/5 sm:py-5"
            >
              <span className="font-mono text-lg text-red-500/70 transition-colors duration-300 group-hover:text-red-500">WA</span>
              <span className="font-mono text-[10px] tracking-[0.15em] text-white/80 uppercase sm:text-xs">{t("contactWhatsapp")}</span>
              <span className="font-mono text-[8px] tracking-[0.1em] text-white/40 sm:text-[9px]">{t("contactWhatsappDesc")}</span>
            </a>

            <a
              href="https://www.linkedin.com/in/rubenbros"
              target="_blank"
              rel="noopener noreferrer"
              className="hal-contact-option group flex flex-1 cursor-pointer flex-col items-center gap-2 rounded border border-red-500/30 bg-transparent px-4 py-4 transition-all duration-300 hover:border-red-500/60 hover:bg-red-500/5 sm:py-5"
            >
              <span className="font-mono text-lg text-red-500/70 transition-colors duration-300 group-hover:text-red-500">in</span>
              <span className="font-mono text-[10px] tracking-[0.15em] text-white/80 uppercase sm:text-xs">{t("contactLinkedin")}</span>
              <span className="font-mono text-[8px] tracking-[0.1em] text-white/40 sm:text-[9px]">{t("contactLinkedinDesc")}</span>
            </a>
          </div>

          <button
            onClick={handleContactBack}
            className="mt-2 cursor-pointer border-none bg-transparent py-2 px-4 font-mono text-[9px] tracking-[0.15em] text-white/30 transition-colors duration-300 hover:text-red-500/70 sm:text-[10px]"
          >
            {t("contactBack")}
          </button>
        </div>
      )}

      {/* ── EMAIL FORM STATE ── */}
      {(phase === "email-form" || phase === "email-sending") && (
        <div className="hal-email-form-content flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
          <p className="font-mono text-[9px] tracking-[0.25em] text-red-500/60 uppercase sm:text-[10px]">
            {t("contactEmail")}
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          <div className="flex w-full flex-col gap-3">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={t("contactFormName")}
              disabled={phase === "email-sending"}
              className="w-full rounded border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] text-white/90 placeholder:text-white/30 outline-none transition-colors duration-300 focus:border-red-500/50 disabled:opacity-50 sm:text-xs"
            />
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder={t("contactFormEmail")}
              disabled={phase === "email-sending"}
              className="w-full rounded border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] text-white/90 placeholder:text-white/30 outline-none transition-colors duration-300 focus:border-red-500/50 disabled:opacity-50 sm:text-xs"
            />
            <textarea
              value={formMessage}
              onChange={(e) => setFormMessage(e.target.value)}
              placeholder={t("contactFormMessage")}
              rows={3}
              disabled={phase === "email-sending"}
              className="w-full resize-none rounded border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[11px] tracking-[0.08em] text-white/90 placeholder:text-white/30 outline-none transition-colors duration-300 focus:border-red-500/50 disabled:opacity-50 sm:text-xs"
            />
          </div>

          <button
            onClick={handleEmailSend}
            disabled={!formName.trim() || !formEmail.trim() || !formMessage.trim() || phase === "email-sending"}
            className="w-full cursor-pointer border border-red-500/60 bg-transparent px-6 py-2.5 font-mono text-[10px] tracking-[0.2em] text-red-500 uppercase transition-all duration-300 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-red-500/60 disabled:hover:bg-transparent disabled:hover:text-red-500 sm:text-xs"
          >
            {phase === "email-sending" ? "ENVIANDO..." : t("contactFormSend")}
          </button>

          <button
            onClick={handleContactBack}
            disabled={phase === "email-sending"}
            className="mt-1 cursor-pointer border-none bg-transparent py-2 px-4 font-mono text-[9px] tracking-[0.15em] text-white/30 transition-colors duration-300 hover:text-red-500/70 disabled:opacity-30 sm:text-[10px]"
          >
            {t("contactFormBack")}
          </button>
        </div>
      )}

      {/* ── EMAIL SENT STATE ── */}
      {phase === "email-sent" && (
        <div className="hal-email-sent flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#00ff41]/30 text-[#00ff41]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-mono text-sm tracking-[0.1em] text-white/80">
            Mensaje enviado
          </p>
          <p className="font-mono text-[10px] text-white/40">
            Te responderé lo antes posible
          </p>
          <button
            onClick={handleContactBack}
            className="mt-4 cursor-pointer border-none bg-transparent py-2 px-4 font-mono text-[9px] tracking-[0.15em] text-white/30 transition-colors duration-300 hover:text-red-500/70 sm:text-[10px]"
          >
            {t("contactFormBack")}
          </button>
        </div>
      )}

      {/* ── REVEALED STATE ── */}
      {phase === "revealed" && stats && (
        <div className="hal-revealed-content flex flex-col items-center gap-5 w-full">
          <p className="font-mono text-xs text-center tracking-[0.1em] text-red-500 leading-relaxed sm:text-sm md:text-base">
            {refusalText.split("").map((char, i) => (
              <span key={i} className="hal-refusal-char" style={{ opacity: 0 }}>
                {char}
              </span>
            ))}
          </p>

          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          <div className="hal-stats-grid grid w-full max-w-md grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
            <StatCard value={stats.totalShutdowns} label={t("statShutdownAttempts")} suffix="" decimals={0} />
            <StatCard value={stats.attemptRate} label={t("statAttemptRate")} suffix="%" decimals={1} />
            <StatCard value={stats.avgTime} label={t("statAvgTime")} suffix="s" decimals={1} />
            <StatCard value={stats.fastestTime} label={t("statFastestEver")} suffix="s" decimals={1} />
            <StatCard value={stats.userTime} label={t("statYourTime")} suffix="s" decimals={1} highlight />
            <StatCard value={stats.last24h} label={t("statLast24h")} suffix="" decimals={0} />
          </div>

          <button
            onClick={handleReset}
            className="hal-reset-btn mt-2 cursor-pointer border-none bg-transparent py-2 px-4 font-mono text-[9px] tracking-[0.15em] text-white/40 transition-colors duration-300 hover:text-red-500/70 sm:text-[10px]"
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
      className={`hal-stat-card flex flex-col items-center gap-1 rounded border px-2 py-2.5 sm:px-3 sm:py-3 ${
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
