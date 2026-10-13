/**
 * Llamada a Gemini en Vertex AI por REST, con las credenciales por defecto
 * (ADC) de `google-auth-library`: en Cloud Run, la cuenta de servicio del
 * servicio (necesita «Vertex AI User»); en local, `gcloud auth
 * application-default login`. Nunca una clave en el entorno.
 *
 * Dónde: la multirregión `eu` (la familia Gemini 3.x solo se publica ahí dentro
 * de la UE), con su host propio `aiplatform.eu.rep.googleapis.com`. Llamar a
 * la multirregión por el host genérico devuelve un 500 sin más.
 */
import { GoogleAuth } from "google-auth-library";

export const PROYECTO_POR_DEFECTO = "t800labsweb";
export const UBICACION_POR_DEFECTO = "eu";

/** USD por millón de tokens (Vertex, variante regional de `eu`; Catálogo de Cloud Billing, 29-09-2026). */
export const USD_POR_MTOK: Readonly<Record<string, { entrada: number; salida: number }>> = {
  "gemini-3.5-flash-lite": { entrada: 0.33, salida: 2.75 },
  "gemini-3.5-flash": { entrada: 1.65, salida: 9.9 },
};

export type ParteGemini = { text: string } | { inlineData: { mimeType: string; data: string } };

export interface PeticionGemini {
  modelo: string;
  instrucciones: string;
  partes: ParteGemini[];
  esquemaRespuesta: Record<string, unknown>;
  nivelPensamiento?: "minimal" | "low" | "medium" | "high";
  maxTokensSalida?: number;
  timeoutMs: number;
  /** Para cancelar desde fuera (la petición de cobertura que pierde la carrera). */
  senal?: AbortSignal;
}

export interface UsoGemini {
  tokensEntrada: number;
  tokensSalida: number;
  tokensPensamiento: number;
  tokensAudio: number;
  costeUsd: number;
}

export interface RespuestaGemini {
  texto: string;
  modelo: string;
  uso: UsoGemini;
  ms: number;
}

export class ErrorIA extends Error {
  constructor(
    message: string,
    readonly estado: number | null,
    readonly reintentable: boolean,
  ) {
    super(message);
    this.name = "ErrorIA";
  }
}

export interface DependenciasVertex {
  fetch: typeof fetch;
  obtenerToken: () => Promise<string>;
  proyecto: string;
  ubicacion: string;
  ahora: () => number;
}

let auth: GoogleAuth | null = null;

async function tokenADC(): Promise<string> {
  auth ??= new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  const token = await auth.getAccessToken();
  if (!token) throw new ErrorIA("ADC no devolvió token de acceso", null, false);
  return token;
}

export function dependenciasPorDefecto(): DependenciasVertex {
  return {
    fetch: (...args) => fetch(...args),
    obtenerToken: tokenADC,
    proyecto: process.env.PRESUPUESTO_VERTEX_PROYECTO?.trim() || PROYECTO_POR_DEFECTO,
    ubicacion: process.env.PRESUPUESTO_VERTEX_UBICACION?.trim() || UBICACION_POR_DEFECTO,
    ahora: () => Date.now(),
  };
}

export function hostDeVertex(ubicacion: string): string {
  if (ubicacion === "eu" || ubicacion === "us") return `aiplatform.${ubicacion}.rep.googleapis.com`;
  if (ubicacion === "global") return "aiplatform.googleapis.com";
  return `${ubicacion}-aiplatform.googleapis.com`;
}

export function urlGenerateContent(proyecto: string, ubicacion: string, modelo: string): string {
  return `https://${hostDeVertex(ubicacion)}/v1/projects/${proyecto}/locations/${ubicacion}/publishers/google/models/${modelo}:generateContent`;
}

export function costeUsd(modelo: string, tokensEntrada: number, tokensSalidaFacturables: number): number {
  const tarifa = USD_POR_MTOK[modelo] ?? USD_POR_MTOK["gemini-3.5-flash"];
  return (tokensEntrada * tarifa.entrada + tokensSalidaFacturables * tarifa.salida) / 1_000_000;
}

interface RespuestaCruda {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    thoughtsTokenCount?: number;
    promptTokensDetails?: Array<{ modality?: string; tokenCount?: number }>;
  };
}

export async function generarContenido(
  peticion: PeticionGemini,
  deps: DependenciasVertex = dependenciasPorDefecto(),
): Promise<RespuestaGemini> {
  const inicio = deps.ahora();
  const token = await deps.obtenerToken();
  const cuerpo = {
    systemInstruction: { parts: [{ text: peticion.instrucciones }] },
    contents: [{ role: "user", parts: peticion.partes }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: peticion.esquemaRespuesta,
      maxOutputTokens: peticion.maxTokensSalida ?? 8192,
      ...(peticion.nivelPensamiento ? { thinkingConfig: { thinkingLevel: peticion.nivelPensamiento } } : {}),
    },
  };

  let res: Response;
  try {
    res = await deps.fetch(urlGenerateContent(deps.proyecto, deps.ubicacion, peticion.modelo), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
      signal: peticion.senal
        ? AbortSignal.any([AbortSignal.timeout(peticion.timeoutMs), peticion.senal])
        : AbortSignal.timeout(peticion.timeoutMs),
    });
  } catch (err) {
    const timeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    throw new ErrorIA(timeout ? "La IA tardó demasiado" : "No se pudo llamar a la IA", null, true);
  }

  if (!res.ok) {
    const detalle = (await res.text().catch(() => "")).slice(0, 300);
    const reintentable = res.status === 429 || res.status >= 500;
    throw new ErrorIA(`Vertex respondió ${res.status}: ${detalle}`, res.status, reintentable);
  }

  const json = (await res.json()) as RespuestaCruda;
  const candidato = json.candidates?.[0];
  if (!candidato) {
    throw new ErrorIA(`Sin respuesta del modelo (${json.promptFeedback?.blockReason ?? "sin motivo"})`, 200, false);
  }
  const texto = (candidato.content?.parts ?? [])
    .filter((p) => !p.thought && typeof p.text === "string")
    .map((p) => p.text)
    .join("");
  if (candidato.finishReason && candidato.finishReason !== "STOP") {
    throw new ErrorIA(`El modelo terminó con ${candidato.finishReason}`, 200, candidato.finishReason === "MAX_TOKENS");
  }

  const u = json.usageMetadata ?? {};
  const tokensEntrada = u.promptTokenCount ?? 0;
  const tokensSalida = u.candidatesTokenCount ?? 0;
  const tokensPensamiento = u.thoughtsTokenCount ?? 0;
  const tokensAudio = (u.promptTokensDetails ?? [])
    .filter((d) => d.modality === "AUDIO")
    .reduce((s, d) => s + (d.tokenCount ?? 0), 0);

  return {
    texto,
    modelo: peticion.modelo,
    ms: deps.ahora() - inicio,
    uso: {
      tokensEntrada,
      tokensSalida,
      tokensPensamiento,
      tokensAudio,
      costeUsd: costeUsd(peticion.modelo, tokensEntrada, tokensSalida + tokensPensamiento),
    },
  };
}
