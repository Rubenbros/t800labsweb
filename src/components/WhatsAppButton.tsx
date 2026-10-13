"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./WhatsAppIcon";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (pathname?.includes("/demo/")) return null;
  // /automatiza lleva sus propios botones, con el mensaje que dice de qué red viene.
  if (pathname?.endsWith("/automatiza")) return null;
  if (!visible) return null;

  return (
    <a
      href="https://wa.me/34645515267?text=Hola%2C%20me%20interesa%20contactar%20con%20T800%20Labs."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat en WhatsApp"
      className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(37,211,102,0.4)]"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
