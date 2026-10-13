// Lectura del escaparate desde el servidor de la web. El panel escala a cero y puede tardar
// en despertar: se guarda la última lista buena y, si el panel no contesta, se sigue
// enseñando esa. La web nunca falla ni se hace esperar por culpa del panel.
import { SHOWCASE_URL, parseShowcase, type PublishedVideo } from "./feed";

/** La lista se vuelve a pedir al panel como mucho una vez por minuto. */
const FRESH_MS = 60_000;
/** Lo que se le da al panel para contestar (arranque en frío incluido). */
const REQUEST_TIMEOUT_MS = 8_000;

type Options = {
  /** Cuánto espera quien llama antes de quedarse con la última lista buena. */
  waitMs: number;
  /**
   * Con una lista guardada, aunque sea vieja, se devuelve esa al momento y se refresca por
   * detrás. Es lo que usan las páginas: no esperan al panel si tienen algo que enseñar.
   */
  staleOk?: boolean;
  fetchImpl?: typeof fetch;
  now?: () => number;
  url?: string;
};

type Memo = { at: number; videos: PublishedVideo[] };

export function createShowcaseSource() {
  let memo: Memo | null = null;
  let pending: Promise<PublishedVideo[]> | null = null;

  // ESCAPARATE_URL apunta a otro escaparate (un panel en local, un fichero de prueba).
  async function request({ fetchImpl = fetch, now = Date.now, url = process.env.ESCAPARATE_URL || SHOWCASE_URL }: Options) {
    const response = await fetchImpl(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`El escaparate respondió ${response.status}`);
    const videos = parseShowcase(await response.json(), url);
    memo = { at: now(), videos };
    return videos;
  }

  const lastGood = () => memo?.videos ?? [];

  return async function load(options: Options): Promise<PublishedVideo[]> {
    const now = options.now ?? Date.now;
    if (memo && now() - memo.at < FRESH_MS) return memo.videos;
    // Varias visitas a la vez comparten una sola petición al panel.
    pending ??= request(options).finally(() => {
      pending = null;
    });
    const refreshed = pending.catch((error: unknown) => {
      console.warn("[escaparate] sin respuesta del panel; se enseña la última lista", error);
      return lastGood();
    });
    if (memo && options.staleOk) return memo.videos;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const gaveUp = new Promise<PublishedVideo[]>((resolve) => {
      timer = setTimeout(() => resolve(lastGood()), options.waitMs);
    });
    return Promise.race([refreshed, gaveUp]).finally(() => clearTimeout(timer));
  };
}

/** Fuente del proceso: la comparten las páginas y /api/escaparate. */
export const loadShowcase = createShowcaseSource();
