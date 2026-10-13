"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import {
  buildWhatsAppUrl,
  resolveOrigin,
  type Origin,
} from "@/lib/automatiza/whatsapp";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const subscribe = () => () => {};

/** Red de la que viene el visitante, leída del `utm_source` de la URL. */
export function useOrigin(): Origin {
  return useSyncExternalStore(
    subscribe,
    () => resolveOrigin(new URLSearchParams(window.location.search).get("utm_source")),
    () => "web",
  );
}

type Props = {
  /** Dónde está el botón en la página; viaja en el evento de analítica. */
  placement: string;
  /** Si el botón es el de un paquete, su nombre se añade al mensaje. */
  packageName?: string;
  showIcon?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function WhatsAppCta({
  placement,
  packageName,
  showIcon = true,
  className,
  children,
}: Props) {
  const t = useTranslations("Automatiza.whatsapp");
  const origin = useOrigin();

  // «Hola, vengo de Instagram. [Me interesa «…».] Te cuento qué me quita tiempo:»
  const message = [
    t(`origins.${origin}`),
    packageName ? t("package", { name: packageName }) : null,
    t("ask"),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      href={buildWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => window.gtag?.("event", "whatsapp_click", { origin, placement })}
      className={className}
    >
      {showIcon && <WhatsAppIcon size={20} className="shrink-0" />}
      {children}
    </a>
  );
}
