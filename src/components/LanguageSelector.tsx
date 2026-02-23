"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";

export default function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: "es" | "en") => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 font-mono text-[10px] tracking-[0.15em] uppercase">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          disabled={isPending}
          className={`px-1.5 py-0.5 transition-colors duration-300 cursor-pointer ${
            locale === loc
              ? "text-[#e50914] border-b border-red-500/60"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
