/**
 * Lectura de secretos de Secret Manager EN TIEMPO DE EJECUCIÓN, con las
 * credenciales por defecto (ADC) y caché corta.
 *
 * Por qué no `--set-secrets` en el despliegue: un secreto que todavía no existe
 * (el token de un bot que se crea más tarde) haría fallar el despliegue entero,
 * y uno que cambia no llega a las instancias vivas hasta la siguiente revisión.
 * Leyéndolo aquí, crear o rotar el secreto basta: en ≤5 min está activo.
 *
 * Si existe la variable de entorno con el mismo nombre, gana (local y pruebas).
 * La cuenta de servicio de Cloud Run tiene `secretmanager.secretAccessor`.
 */
import { GoogleAuth } from "google-auth-library";

const TTL_OK_MS = 5 * 60_000;
const TTL_AUSENTE_MS = 60_000;
const NOMBRE_RE = /^[A-Za-z0-9_-]{1,255}$/;

interface Entrada {
  valor: string | null;
  caduca: number;
}

const cache = new Map<string, Entrada>();
let auth: GoogleAuth | null = null;

function proyecto(): string {
  return process.env.SECRETOS_PROYECTO?.trim() || "t800labsweb";
}

async function leerDeSecretManager(nombre: string): Promise<string | null> {
  auth ??= new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  const token = await auth.getAccessToken();
  const url = `https://secretmanager.googleapis.com/v1/projects/${proyecto()}/secrets/${nombre}/versions/latest:access`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5_000),
  });
  if (res.status === 404 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Secret Manager respondió ${res.status} al leer ${nombre}`);
  const json = (await res.json()) as { payload?: { data?: string } };
  const valor = json.payload?.data ? Buffer.from(json.payload.data, "base64").toString("utf8").trim() : "";
  return valor || null;
}

/** Valor del secreto, o `null` si no existe (o está vacío). */
export async function leerSecreto(nombre: string): Promise<string | null> {
  if (!NOMBRE_RE.test(nombre)) throw new Error(`Nombre de secreto no válido: ${nombre}`);
  const delEntorno = process.env[nombre]?.trim();
  if (delEntorno) return delEntorno;

  const ahora = Date.now();
  const enCache = cache.get(nombre);
  if (enCache && enCache.caduca > ahora) return enCache.valor;

  try {
    const valor = await leerDeSecretManager(nombre);
    cache.set(nombre, { valor, caduca: ahora + (valor ? TTL_OK_MS : TTL_AUSENTE_MS) });
    return valor;
  } catch (err) {
    // Ante un fallo transitorio se sigue con el último valor conocido, si lo hay.
    console.error("[secretos]", err instanceof Error ? err.message : err);
    return enCache?.valor ?? null;
  }
}

/** Solo para pruebas. */
export function limpiarCacheDeSecretos(): void {
  cache.clear();
}
