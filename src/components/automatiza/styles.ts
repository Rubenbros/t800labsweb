// Clases compartidas por los bloques de /automatiza.

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2.5 rounded-md px-6 py-4 text-base font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** El verde de WhatsApp se reserva para los botones que abren WhatsApp. */
export const BUTTON_WHATSAPP = `${BUTTON_BASE} bg-[#25D366] text-black hover:bg-[#4ae586]`;

export const BUTTON_OUTLINE = `${BUTTON_BASE} border border-white/20 text-white hover:border-white/60 hover:bg-white/5`;

export const EYEBROW = "font-mono text-[11px] uppercase tracking-[0.25em] text-[#ff4d4d]";

export const SECTION_TITLE = "mt-3 text-3xl font-bold leading-tight tracking-tight text-white md:text-[2.75rem]";

export const CONTAINER = "mx-auto w-full max-w-6xl px-5 md:px-10";
