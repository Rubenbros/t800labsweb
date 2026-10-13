/**
 * Validación del audio en el borde: tamaño y formato REAL (por los primeros
 * bytes, no por el Content-Type que diga el cliente). Solo pasan formatos que
 * Gemini acepta y que producen los móviles: OGG/Opus (notas de voz de
 * Telegram y WhatsApp), WebM/Opus (Chrome y Android), MP4/M4A/AAC (Safari e
 * iPhone), MP3, WAV y FLAC.
 */

export const AUDIO_MIN_BYTES = 1_000;
/** ~10 min de nota de voz en Opus; acota el coste por llamada. */
export const AUDIO_MAX_BYTES = 5 * 1024 * 1024;
/** Duración máxima cuando el canal la declara (Telegram). */
export const AUDIO_MAX_SEGUNDOS = 180;

export type FormatoAudio = "ogg" | "webm" | "mp4" | "mp3" | "wav" | "flac" | "aac";

export const MIME_DE_FORMATO: Record<FormatoAudio, string> = {
  ogg: "audio/ogg",
  webm: "audio/webm",
  mp4: "audio/mp4",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  flac: "audio/flac",
  aac: "audio/aac",
};

function empiezaPor(b: Uint8Array, firma: number[], desde = 0): boolean {
  if (b.length < desde + firma.length) return false;
  return firma.every((v, i) => b[desde + i] === v);
}

const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

export function detectarFormato(b: Uint8Array): FormatoAudio | null {
  if (empiezaPor(b, ascii("OggS"))) return "ogg";
  if (empiezaPor(b, [0x1a, 0x45, 0xdf, 0xa3])) return "webm";
  if (empiezaPor(b, ascii("ftyp"), 4)) return "mp4";
  if (empiezaPor(b, ascii("RIFF")) && empiezaPor(b, ascii("WAVE"), 8)) return "wav";
  if (empiezaPor(b, ascii("fLaC"))) return "flac";
  if (empiezaPor(b, ascii("ID3"))) return "mp3";
  if (b.length >= 2 && b[0] === 0xff) {
    // Cabecera de trama MPEG: 0xFFF1/0xFFF9 = AAC (ADTS); 0xFFFB/F3/F2/E3 = MP3.
    if (b[1] === 0xf1 || b[1] === 0xf9) return "aac";
    if ((b[1] & 0xe0) === 0xe0) return "mp3";
  }
  return null;
}

export type ResultadoValidacionAudio =
  | { ok: true; formato: FormatoAudio; mimeType: string }
  | { ok: false; motivo: "vacio" | "demasiado-grande" | "formato-no-admitido"; mensaje: string };

export function validarAudio(bytes: Uint8Array): ResultadoValidacionAudio {
  if (bytes.length < AUDIO_MIN_BYTES) {
    return { ok: false, motivo: "vacio", mensaje: "El audio está vacío o es demasiado corto." };
  }
  if (bytes.length > AUDIO_MAX_BYTES) {
    return { ok: false, motivo: "demasiado-grande", mensaje: "El audio es demasiado largo (máximo unos 3 minutos)." };
  }
  const formato = detectarFormato(bytes);
  if (!formato) {
    return { ok: false, motivo: "formato-no-admitido", mensaje: "Ese archivo no es un audio que pueda leer." };
  }
  return { ok: true, formato, mimeType: MIME_DE_FORMATO[formato] };
}

/** Texto dictado: mismos límites de sentido común que el audio. */
export const TEXTO_MIN = 12;
export const TEXTO_MAX = 2_000;

export function validarTexto(texto: string): { ok: true; texto: string } | { ok: false; mensaje: string } {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length < TEXTO_MIN) return { ok: false, mensaje: "Cuéntame el trabajo con un poco más de detalle." };
  if (limpio.length > TEXTO_MAX) return { ok: false, mensaje: "El texto es demasiado largo (máximo 2.000 caracteres)." };
  return { ok: true, texto: limpio };
}
