"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useOrigin } from "./WhatsAppCta";

type Status = "idle" | "sending" | "success" | "error";

const FIELD =
  "w-full rounded-md border border-white/15 bg-black px-3.5 py-3 text-[15px] text-white placeholder:text-white/30 transition-colors focus:border-[#e50914] focus:outline-none";

/** Alternativa escrita al audio: llega al mismo buzón que el formulario de la home. */
export function AutomatizaForm() {
  const t = useTranslations("Automatiza.contact");
  const origin = useOrigin();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          // La cabecera dice de qué página y de qué red viene el mensaje.
          message: `[/automatiza · ${origin}]\n\n${data.get("message")}`,
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      setStatus("success");
      window.gtag?.("event", "generate_lead", { origin, placement: "form" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p role="status" className="rounded-md border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-5 text-[15px] leading-relaxed text-white">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/60">{t("name")}</span>
        <input name="name" type="text" required maxLength={120} autoComplete="name" className={FIELD} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/60">{t("email")}</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" className={FIELD} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-white/60">{t("message")}</span>
        <textarea name="message" required maxLength={4000} rows={4} className={`${FIELD} resize-y`} />
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 rounded-md border border-[#e50914] bg-[#e50914] px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#ff1f2b] disabled:cursor-wait disabled:opacity-60"
      >
        {status === "sending" ? t("sending") : t("send")}
      </button>

      {status === "error" && (
        <p role="alert" className="text-sm leading-relaxed text-[#ff4d4d]">
          {t("error")}
        </p>
      )}

      <p className="text-xs leading-relaxed text-white/45">{t("privacy")}</p>
    </form>
  );
}
